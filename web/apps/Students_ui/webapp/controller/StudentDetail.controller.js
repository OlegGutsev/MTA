sap.ui.define([
    "students/controller/BaseController",
    'sap/ui/core/Fragment',
    "sap/ui/model/json/JSONModel",
    "students/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, Fragment, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("students.controller.Main", {

        _formFragments: {},
        //_listFragments: {},

        onInit: function () {
            //this.host = "http://localhost:3000";
            this.host = "https://p2001378267trial-dev-lev-srv.cfapps.eu10.hana.ondemand.com";
            this.aInputs = [];

            this.oDataModel = new JSONModel();
            this.oDataModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
            this.getView().setModel(this.oDataModel);
            this.oObjectPageLayout = this.byId("idObjectPage");
            this.oObjectPageLayout.setSelectedSection(this.getView().byId("GeneralSection").getId());

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("StudentDetail").attachMatched(this._onRouteMatched, this);
        },

        onExit: function () {
            this._destroyFragments(_formFragments);
            //this._destroyFragments(_listFragments);
            this._cleanView();
        },

        _destroyFragments: function (aFragments) {
            for (var sPropertyName in aFragments) {
                if (!aFragments.hasOwnProperty(sPropertyName) || aFragments[sPropertyName] == null) {
                    return;
                }

                aFragments[sPropertyName].destroy();
                aFragments[sPropertyName] = null;
            }
        },

        _onRouteMatched: function (oEvent) {
            const oArgs = oEvent.getParameter("arguments");
            if (!oArgs.studid) {
                sap.m.MessageToast.show("Navigation error");
                this.getOwnerComponent().getRouter().navTo("Master");
                return;
            } else if (oArgs.studid === "0000") {
                this._toggleButtonsAndView(true);
                this._toggleFooter();
                this.getView().getModel().setData({
                    toAddress: {},
                    toGradeBook: {}
                });
                this.getView().byId("addButton").setEnabled(false);

                this.getView().getModel().setProperty("/post", true);
            } else {
                this.getApp().setBusy(true);

                jQuery.ajax({
                    type: "GET",
                    url: this.host + "/odata/Student('" + oArgs.studid + "')" + "?$expand=toAddress,toGradeBook($expand=toSubject)",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        this.oDataModel.setData(data);
                        this._toggleButtonsAndView(false);
                        this.getApp().setBusy(false);
                    }.bind(this),
                    error: function (oError) {
                        this.getApp().setBusy(false);
                        jQuery.sap.log.error(oError);
                        this.getOwnerComponent().getRouter().navTo("Master");
                    }.bind(this)
                });
            }
        },
        _onBindingChange: function () {
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }
        },

        _toggleButtonsAndView: function (bEdit) {
            var oView = this.getView();

            oView.byId("edit").setVisible(!bEdit);
            oView.byId("save").setVisible(bEdit);
            oView.byId("cancel").setVisible(bEdit);

            this._showFormFragment(bEdit ? "Change" : "Display");
            //   this._showListItemFragment(bEdit ? "Change" : "Display");
        },

        _getBundle: function (sText) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sText);
        },

        _showFormFragment: function (sFragmentName) {
            var oFormFragment = this._formFragments[sFragmentName];
            var oSubSection = this.byId("GeneralSubSection");
            oSubSection.removeAllBlocks();

            if (oFormFragment) {
                oSubSection.insertBlock(oFormFragment);
            } else {
                Fragment.load({
                        id: this.getView().getId(),
                        name: "students.fragment.GeneralForm" + sFragmentName,
                        controller: this
                    })
                    .then(oFormFragment => {
                        this._formFragments[sFragmentName] = oFormFragment;
                        oSubSection.insertBlock(oFormFragment);
                    });
            }
        },

        // _showListItemFragment: function (sFragmentName) {
        //     var oListItemFragment = this._listFragments[sFragmentName];
        //     const oTable = this.getView().byId("SubjectList");
        //     oTable.removeAllItems();

        //     if (oListItemFragment) {
        //         oTable.addItem(oListItemFragment);
        //         oTable.getBinding("items").refresh(true);
        //     } else {
        //         Fragment.load({
        //                 id: this.getView().getId(),
        //                 name: "students.fragment.ListItem" + sFragmentName,
        //                 controller: this
        //             })
        //             .then(oListItemFragment => {
        //                 this._listFragments[sFragmentName] = oListItemFragment;
        //                 oTable.addItem(oListItemFragment);
        //                 oTable.getBinding("items").refresh(true);
        //             });
        //     }
        // },

        _toggleFooter: function () {
            this.oObjectPageLayout.setShowFooter(!this.oObjectPageLayout.getShowFooter());
        },

        _cleanView: function () {
            this._toggleButtonsAndView(false);
            this.oObjectPageLayout.setShowHeaderContent(true);
            this._toggleFooter();
            this.aInputs = [];
        },

        _checkUIChanges: function () {
            const aInputs = this.aInputs;
            var oValue = aInputs.find(input => input.sNewValue !== undefined);
            return oValue !== undefined;
        },

        _changeUIModel: function () {
            var oView = this.getView();
            var oModelData = oView.getModel().getData();
            var aInputs = this.aInputs;

            var sCityId = oView.byId("ChangeAddressCity").getId().replace("Change", '');
            var sStreetId = oView.byId("ChangeAddressStreet").getId().replace("Change", '');
            var sHomeNumId = oView.byId("ChangeAddressHomeNum").getId().replace("Change", '');
            var sNameId = oView.byId("ChangeName").getId().replace("Change", '');
            var sSurNameId = oView.byId("ChangeSurName").getId().replace("Change", '');
            var sAgeId = oView.byId("ChangeAge").getId().replace("Change", '');
            var sStDateId = oView.byId("ChangeGradeBookStDate").getId().replace("Change", '');
            var sCourseId = oView.byId("ChangeGradeBookCourse").getId().replace("Change", '');

            if (aInputs.length > 0) {
                var nIndex = aInputs.findIndex(item => item.sId == sCityId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.toAddress.city = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sStreetId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.toAddress.strt = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sHomeNumId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.toAddress.hnum = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sNameId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.name = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sSurNameId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.surnm = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sAgeId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.age = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sStDateId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.toGradeBook.stdate = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sCourseId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.toGradeBook.course = aInputs[nIndex].sNewValue;
            }
        },

        onSelectionChange: function (oEvent) {
            var oTable = oEvent.getSource();
            var oButton = this.byId("delButton");
            var aContexts = oTable.getSelectedContexts();
            var bSelected = (aContexts && aContexts.length > 0);
            oButton.setEnabled(bSelected);
        },

        onCancel: function () {
            if (this.getView().getModel().getProperty("/post")) {
                this.getOwnerComponent().getRouter().navTo("Master");
                this._cleanView();
                return;
            }
            this._cleanView();
        },

        _setModel: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oModelData = oModel.getData();

            var sCity = oView.byId("ChangeAddressCity").getValue();
            var sStreet = oView.byId("ChangeAddressStreet").getValue();
            var sHomeNum = oView.byId("ChangeAddressHomeNum").getValue();
            var sName = oView.byId("ChangeName").getValue();
            var sSurName = oView.byId("ChangeSurName").getValue();
            var sAge = oView.byId("ChangeAge").getValue();
            var sStDate = oView.byId("ChangeGradeBookStDate").getValue();
            var sCourse = oView.byId("ChangeGradeBookCourse").getValue();

            oModelData.name = sName;
            oModelData.surnm = sSurName;
            oModelData.age = sAge !== "" ? sAge : 0;

            oModelData.toAddress.city = sCity;
            oModelData.toAddress.strt = sStreet;
            oModelData.toAddress.hnum = sHomeNum !== "" ? sHomeNum : 0;

            oModelData.toGradeBook.stdate = sStDate !== "" ? sStDate : formatter.dateFormat(new Date());
            oModelData.toGradeBook.course = sCourse !== "" ? sCourse : 0;
        },

        onChange: function (oEvent) {
            var sId = oEvent.getSource().getId().replace("Change", '');
            var sNewValue = oEvent.getSource().getValue();
            var aInputs = this.aInputs;

            if (aInputs.length > 0) {
                var nIndex = aInputs.findIndex(item => item.sId == sId);
                aInputs[nIndex].sValue != sNewValue ? aInputs[nIndex].sNewValue = sNewValue : delete aInputs[nIndex].sNewValue;
                this.aInputs = aInputs;
            }
        },

        onCreate: function () {
            //     var oTable = this.getView().byId("SubjectList");
            //     var oModelData = oTable.getBinding("items").getModel().getData();
            //     var oRow = new sap.m.ColumnListItem( {
            //         cells: [
            //           // add created controls to item
            //           new sap.m.Input({ editable: false, value: "0000"}),
            //           new sap.m.Input({ value: ""}),
            //           new sap.m.Input({ type: "Number", value: 0})
            //           ]
            //        });
            // //     oTable.addItem(oRow);
            // //    //oModelData.toGradeBook.toSubject.push(oRow);
            // //    oTable.getBinding("items").refresh(true);  
            this.getOwnerComponent().getRouter().navTo("GradeBookDetail", {
                sbjid: "0000",
                grdid: this.oDataModel.getData().toGradeBook.grdid
            });
        },

        onItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            this.getOwnerComponent().getRouter().navTo("GradeBookDetail", {
                sbjid: oContext.getProperty("sbjid"),
                grdid: this.oDataModel.getData().toGradeBook.grdid
            });
        },

        onDelete: function () {
            // var oTable = this.getView().byId("SubjectList");
            // var selectedItem = oTable.getSelectedItem();
            // oTable.removeItem(selectedItem);
            var oTable = this.byId("SubjectList");
            var oItem = oTable.getSelectedItem();
            this.getApp().setBusy(true);
            var sItemId = oItem.getBindingContext().getProperty("sbjid");

            jQuery.ajax({
                type: "DELETE",
                url: this.host + "/Subject/" + sItemId,
                contentType: "application/json",
                success: function (data) {
                    data = formatter.formatterSubject(data);
                    this.oDataModel.getData().toGradeBook.toSubject = data;
                    this.oDataModel.refresh();
                    this.getApp().setBusy(false);
                    sap.m.MessageToast.show("Subject was Deleted");
                }.bind(this),
                error: function (oError) {
                    this.getApp().setBusy(false);
                    jQuery.sap.log.error(oError);
                    sap.m.MessageToast.show("Deleting was failed");
                }.bind(this)
            });
        },


        onSave: function () {
            if (this.getView().getModel().getProperty("/post")) {
                this._setModel();
                delete this.oDataModel.getData().post;
                const oData = this.oDataModel.getData();
                this.getApp().setBusy(true);

                jQuery.ajax({
                    type: "POST",
                    url: this.host + "/Student",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(oData),
                    success: function (data) {
                        this.getApp().setBusy(false);
                        this.oDataModel.setData(data);
                        this.getView().byId("addButton").setEnabled(true);
                        this._cleanView();
                        sap.m.MessageToast.show("Student created");
                        this.getOwnerComponent().getRouter().navTo("Master");
                    }.bind(this),
                    error: function (oError) {
                        this.getApp().setBusy(false);
                        sap.m.MessageToast.show("Creating failed");
                        this._cleanView();
                        this.getOwnerComponent().getRouter().navTo("Master");
                        jQuery.sap.log.error(oError);
                    }.bind(this)
                });
            } else {
                if (!this._checkUIChanges()) {
                    this._cleanView();
                    sap.m.MessageToast.show("You haven't made any changes");
                    return;
                }
                this._changeUIModel();
                var oData = this.oDataModel.getData();
                var aSubject = oData.toGradeBook.toSubject.length !== 0 ? oData.toGradeBook.toSubject : null;
                this.getApp().setBusy(true);

                jQuery.ajax({
                    type: "PUT",
                    url: this.host + "/Student/" + oData.studid,
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(oData),
                    success: function (data) {
                        data = formatter.formatterStudent(data, aSubject);
                        this.oDataModel.setData(data);
                        this._cleanView();
                        this.getApp().setBusy(false);
                        sap.m.MessageToast.show("Student changed");
                    }.bind(this),
                    error: function (oError) {
                        this._cleanView();
                        this.getApp().setBusy(false);
                        jQuery.sap.log.error(oError);
                        sap.m.MessageToast.show("Changing failed");
                    }.bind(this)
                });
            }
        },

        onSearch : function (oEvent) {
            var sQuery = oEvent.getParameter("query");
			var aFilters = [];
			if( sQuery ) {
				aFilters.push( new Filter("name", FilterOperator.Contains, sQuery) );
            }
            this.byId("SubjectList").getBinding("items")
                            .filter(aFilters.length === 0 ? aFilters : new Filter(aFilters, false), "Application");
        },

        onUpdateFinished: function (oEvent) {
            const oTitle = this.getView().byId("TableTitle");
            const sTableTitle = this._getBundle("subjectTitle");
            oTitle.setText(`${sTableTitle} (${oEvent.getSource().getBinding("items").getLength()})`);

        },

        onEdit: function () {
            var aInputs = this.aInputs;
            this.oObjectPageLayout.setShowHeaderContent(false);
            this._toggleButtonsAndView(true);
            this._toggleFooter();
            this.aInputs = formatter.fillInputsData(this.getView(), "Display", aInputs);


            // var oTable = this.byId("StudentList");
            // var aItems = oTable.getSelectedItems();


            // this.getApp().setBusy(true);
            // aItems.forEach(item => {
            //     var sItemPath = item.getBindingContext().getBinding().getPath();
            //     var sItemId = item.getBindingContext().getProperty("studid");

            //     jQuery.ajax({
            //         type: "DELETE",
            //         url: this.host + sItemPath + "/" + sItemId,
            //         contentType: "application/json",
            //         success: function(data){
            //             MessageBox.success("Student " +  + sItemId + " was Deleted");
            //             this.oDataModel.setData(data);
            //             this.getApp().setBusy(false);
            //         }.bind(this),
            //         error: function(oError) {
            //             this.getApp().setBusy(false);
            //             jQuery.sap.log.error(oError);
            //             MessageBox.error("Deleting student " + sItemId + " was failed");
            //         }.bind(this)
            //     });
            // });
            // var oData = this.oDataModel.getData();

            // this.getApp().setBusy(true);
            // jQuery.ajax({
            //     type: "PUT",
            //     url: this.host + "/odata/Student('" + oArgs.studid + "')" + "?$expand=toAddress,toGradeBook",
            //     dataType: "json",
            //     contentType: "application/json",
            //     data: JSON.stringify(oData),
            //     success: function(data){
            //         sap.m.MessageBox.success("User Created");
            //         this.oDataModel.setData(data);
            //         this.getApp().setBusy(false);
            //     }.bind(this),
            //     error: function(oError){
            //         this.getApp().setBusy(false);
            //         jQuery.sap.log.error(oError);
            //         sap.m.MessageBox.error("Creating failed");
            //     }.bind(this)
            // });

        }

    });
});