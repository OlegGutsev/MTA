sap.ui.define([
    "students/controller/BaseController",
    "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "students/model/formatter",
    "sap/m/MessageBox"
], function (BaseController, Sorter, Filter, FilterOperator, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("students.controller.Main", {

        _oDialog: null,

        onInit: function () {
            //For local development. Start your NodeJS server.
            //this.host = "http://localhost:3000";
            //For cloud router. So... router will see prefix /api and will forward request to NodeJS in cloud
            //this.host = "/api";
            //For directly NodeJS. So request will be sent directly to NodeJS in cloud (replace with your uri)
            this.host = "https://p2001378267trial-dev-lev-srv.cfapps.eu10.hana.ondemand.com";
            this.oDataModel = this.getOwnerComponent().getModel();
            this.getView().setModel(this.oDataModel);
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("Master").attachMatched(this._onRouteMatched, this);
            this.oFilterBar = this.getView().byId("filterbar");
            this.oFilterBar.variantsInitialized();
        },

        _onRouteMatched: function () {
            this.getView().byId("StudentList").getBinding("items").refresh();
        },

        _getBundle: function (sText) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sText);
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
			//var vGroup;
			var aSorters = [];
			
			// Gather grouping info
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				aSorters.push(new Sorter(sPath, bDescending, true)); // vGroup === null ? true : vGroup));
			}
			
			// Gather sorting info
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
        },
        
        onUpdateFinished: function(oEvent) {
            const oTitle = this.getView().byId("TableTitle");
            const sTableTitle = this._getBundle("worklistTableTitle");
            oTitle.setText(`${sTableTitle} (${oEvent.getSource().getBinding("items").getLength()})`);
		},

        onSearch : function (oEvent) {
            var sQuery = oEvent.getParameter("query");
			var aFilters = [];
			if( sQuery ) {
                aFilters.push( new Filter("surnm", FilterOperator.Contains, sQuery) );
				aFilters.push( new Filter("name", FilterOperator.Contains, sQuery) );
            }
            this.byId("StudentList").getBinding("items")
                            .filter(aFilters.length === 0 ? aFilters : new Filter(aFilters, false), "Application");
        },
        
        onClear: function(oEvent) {
            var aFilterItems = this.oFilterBar.getAllFilterItems();
            aFilterItems.forEach(item => {
                item.getControl("Input").setValue("");
            })
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

            aFilter = [ new Filter("name", FilterOperator.Contains, sName),
                        new Filter("surnm", FilterOperator.Contains, sSurName)
                         ];

			oView.byId("StudentList").getBinding("items").filter(aFilter);
        },
        
        onCreate: function() {
            this.getOwnerComponent().getRouter().navTo("StudentDetail", {
                studid : "0000"
            });
        },

        onSave: function() {
            var oData = this.oDataModel.getData();

            this.getApp().setBusy(true);
            jQuery.ajax({
                type: "POST",
                url: this.host + "/student",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(oData),
                success: function(data){
                    
                    sap.m.MessageToast.show("User Created");
                    this.getApp().setBusy(false);
                }.bind(this),
                error: function(oError) {
                    this.getApp().setBusy(false);
                    jQuery.sap.log.error(oError);
                    MessageBox.error("Creating failed");
                }.bind(this)
            });
        },

        onDelete: function(){
            var oTable = this.byId("StudentList");
            var aItems = oTable.getSelectedItems();
            

            this.getApp().setBusy(true);
            aItems.forEach(item => {
                var sItemPath = item.getBindingContext().getBinding().getPath();
                var sItemId = item.getBindingContext().getProperty("studid");

                jQuery.ajax({
                    type: "DELETE",
                    url: this.host + sItemPath + "/" + sItemId,
                    contentType: "application/json",
                    success: function(){
                        this.oDataModel.refresh();
                        this.byId("delButton").setEnabled(false);
                        this.getApp().setBusy(false);
                        MessageBox.success("Student " +  + sItemId + " was Deleted");
                    }.bind(this),
                    error: function(oError) {
                        this.getApp().setBusy(false);
                        jQuery.sap.log.error(oError);
                        MessageBox.error("Deleting student " + sItemId + " was failed");
                    }.bind(this)
                });
            });
        },

        onSelectionChange: function(oEvent){
            var oTable = oEvent.getSource();
            var oButton = this.byId("delButton");
            var aContexts = oTable.getSelectedContexts();
            var bSelected = (aContexts && aContexts.length > 0);
            oButton.setEnabled(bSelected);
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
