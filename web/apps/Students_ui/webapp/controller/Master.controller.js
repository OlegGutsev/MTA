sap.ui.define([
    "students/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
], function (BaseController, JSONModel, Sorter, Filter, FilterOperator, FilterType) {
    "use strict";

    return BaseController.extend("students.controller.Main", {
        onInit: function () {
            //For local development. Start your NodeJS server.
            // this.host = "http://localhost:3000";
            //For cloud router. So... router will see prefix /api and will forward request to NodeJS in cloud
            //this.host = "/api";
            //For directly NodeJS. So request will be sent directly to NodeJS in cloud (replace with your uri)
            //this.host = "https://p2001017289trial-trial-dev-lev-srv.cfapps.eu10.hana.ondemand.com";

            this.getView().setModel(this.getOwnerComponent().getModel());
          
        },

        onSearch : function () {
			var oView = this.getView(),
                sValue = oView.byId("searchField").getValue(),
                
				oFilter = new Filter("surNm", FilterOperator.Contains, sValue);

			oView.byId("StudentList").getBinding("items").filter([oFilter]);
        },
        
        onResetFilter: function (oEvent) {
			var sMessage = "onReset trigered";
			MessageToast.show(sMessage);
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

        onCancel: function(){
            this.oDataModel.setData();
        }     
    });
});
