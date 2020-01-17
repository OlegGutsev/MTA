sap.ui.define([
    "students/controller/BaseController",
    "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
], function (BaseController, Sorter, Filter, FilterOperator, FilterType) {
    "use strict";

    return BaseController.extend("students.controller.Main", {

        _oDialog: null,

        onInit: function () {
            //For local development. Start your NodeJS server.
            // this.host = "http://localhost:3000";
            //For cloud router. So... router will see prefix /api and will forward request to NodeJS in cloud
            //this.host = "/api";
            //For directly NodeJS. So request will be sent directly to NodeJS in cloud (replace with your uri)
            //this.host = "https://p2001017289trial-trial-dev-lev-srv.cfapps.eu10.hana.ondemand.com";

            this.getView().setModel(this.getOwnerComponent().getModel());
            this.oRouter = this.getOwnerComponent().getRouter();

            var oFB = this.getView().byId("filterbar");
			if (oFB) {
				oFB.variantsInitialized();
			}
        },

        handleViewSettingsDialogButtonOpen: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("students.fragment.MasterViewSettingDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
        },
        
        handleViewSettingsDialogButtonConfirm: function(oEvent) {
			var oTable = this.byId("StudentList");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var sPath;
			var bDescending;
			var vGroup;
			var aSorters = [];
			
			// Gather grouping info
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions !== und ? this.mGroupFunctions[sPath] : sPath;
				aSorters.push(new Sorter(sPath, bDescending, vGroup === null ? true : vGroup));
			}
			
			// Gather sorting info
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
        },
        
        onUpdateFinished: function(oEvent) {
			// var oDataModel = this.oDataModel.getData();
			// oDataModel.setProperty("/Master/count", oEvent.getSource().getBinding("items").getLength());
		},

        onSearch : function (oEvent) {
            var sQuery = oEvent.getParameter("query");
			var aFilters = [];
			if( sQuery ) {
                aFilters.push( new Filter("surNm", FilterOperator.Contains, sQuery) );
				aFilters.push( new Filter("name", FilterOperator.Contains, sQuery) );
            }
			this.getView().byId("StudentList").getBinding("items").filter(aFilters.length === 0 ? aFilters : new Filter(aFilters, false));
        },
        
        onClear: function(oEvent) {
			var oFilterModel = this.getView().getModel();
			oFilterModel.setProperty("/", {});
			this.onSearch(null);
        },
        
        onItemPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
			this.getOwnerComponent().getRouter().navTo("StudentDetail", {
                studid : oContext.getProperty("studid")
            });
		},

		onSearchFilter: function (oEvent) {
            var oView = this.getView(),
            sName = oView.byId("Fname").getValue(),
            sSurName = oView.byId("Fsurname").getValue(),
          //  sAge = parseInt(oView.byId("Fage").getValue()),

            aFilter = [ new Filter("name", FilterOperator.Contains, sName),
                        new Filter("surNm", FilterOperator.Contains, sSurName)
                         ];

			oView.byId("StudentList").getBinding("items").filter(aFilter);
		},

        onSave: function(){
            var oData = this.oDataModel.getData();

            this.getApp().setBusy(true);
            jQuery.ajax({
                type: "POST",
                url: this.host + "/student",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: function(data){
                    sap.m.MessageBox.success("User Created");
                    this.oDataModel.setData(data);
                    this.getApp().setBusy(false);
                }.bind(this),
                error: function(oError) {
                    this.getApp().setBusy(false);
                    jQuery.sap.log.error(oError);
                    sap.m.MessageBox.error("Creating failed");
                }.bind(this)
            });
        },

        onToggleHeader: function() {
			this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
        },
        
        getPage: function() {
			return this.getView().byId("dynamicPageId");
		},

        onCancel: function(){
            this.oDataModel.setData();
        },

        onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},     

    });
});
