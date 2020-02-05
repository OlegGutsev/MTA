sap.ui.define([
    "students/controller/BaseController",
    'sap/ui/core/Fragment',
    "students/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (BaseController, Fragment, formatter, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("students.controller.Main", {

        _formFragments: {},

        onInit: function () {
           
           
            this.host = "https://p2001378267trial-dev-lev-srv.cfapps.eu10.hana.ondemand.com";
            this.aInputs = [];
            this.oDataModel = new JSONModel();
            this.getView().setModel(this.oDataModel);
            this.oObjectPageLayout = this.byId("idObjectPage");

            var oRouter = this.getOwnerComponent().getRouter();

            oRouter.getRoute("GradeBookDetail").attachMatched(this._onRouteMatched, this);
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
            if (!oArgs.sbjid) {
                sap.m.MessageToast.show("Navigation error");
                this.getOwnerComponent().getRouter().navTo("Master");
                return;
            } else if (oArgs.sbjid === "0000") {
                this._toggleButtonsAndView(true);
                this._toggleFooter();
                this.getView().getModel().setData({
                    grdid: oArgs.grdid
                });
              
                this.getView().getModel().setProperty("/post", true);
            } else {
                this.getApp().setBusy(true);
                jQuery.ajax({
                    type: "GET",
                    url: this.host + "/odata/Subject('" + oArgs.sbjid + "')",
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
                        sap.m.MessageToast.show("Data loading failed");
                        this.getOwnerComponent().getRouter().navTo("Master");
                    }.bind(this)
                });
            }
        },

        _getBundle: function (sText) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sText);
        },

        _setModel: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oModelData = oModel.getData();
            var sName = oView.byId("SubjectName").getValue();
            var sMark = oView.byId("SubjectMark").getValue();

            oModelData.name = sName;
            if (sMark < 0) {
                oModelData.mark = 0;
            } else if (sMark > 10) {
                oModelData.mark = 10;
            } else oModelData.mark = sMark
        },


        onSave: function () {
            if (this.getView().getModel().getProperty("/post")) {
                this._setModel();
                delete this.oDataModel.getData().post;
                const oData = this.oDataModel.getData();
                this.getApp().setBusy(true);

                jQuery.ajax({
                    type: "POST",
                    url: this.host + "/Subject",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(oData),
                    success: function (data) {
                        this.oDataModel.setData(data);
                        this.getApp().setBusy(false);
                        this._cleanView();
                        sap.m.MessageToast.show("Subject created");
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
                this.getApp().setBusy(true);

                jQuery.ajax({
                    type: "PUT",
                    url: this.host + "/Subject/" + oData.sbjid,
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(oData),
                    success: function (data) {
                        data = formatter.formatterSubject(data);
                        this.oDataModel.setData(data);
                        this._cleanView();
                        this.getApp().setBusy(false);
                        sap.m.MessageToast.show("Subject changed");
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


        _toggleButtonsAndView: function (bEdit) {
            var oView = this.getView();

            oView.byId("edit").setVisible(!bEdit);
            oView.byId("save").setVisible(bEdit);
            oView.byId("cancel").setVisible(bEdit);

            this._showFormFragment(bEdit ? "Change" : "Display");
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
                        name: "students.fragment.SubjectForm" + sFragmentName,
                        controller: this
                    })
                    .then(oFormFragment => {
                        this._formFragments[sFragmentName] = oFormFragment;
                        oSubSection.insertBlock(oFormFragment);
                    });
            }
        },

        _toggleFooter: function () {
            this.oObjectPageLayout.setShowFooter(!this.oObjectPageLayout.getShowFooter());
        },

        _cleanView: function () {
            this._toggleButtonsAndView(false);
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
            var sNameId = oView.byId("SubjectName").getId()
            var sMarkId = oView.byId("SubjectMark").getId()

            if (aInputs.length > 0) {
                var nIndex = aInputs.findIndex(item => item.sId == sMarkId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.mark = aInputs[nIndex].sNewValue;

                nIndex = aInputs.findIndex(item => item.sId == sNameId);
                if (aInputs[nIndex].sNewValue !== undefined) oModelData.name = aInputs[nIndex].sNewValue;
            }
        },

        onCancel: function () {
            if (this.getView().getModel().getProperty("/post")) {
                this.getOwnerComponent().getRouter().navTo("Master");
                this._cleanView();
                return;
            }
            this._cleanView();
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

        onToggleHeader: function () {
            this.getPage().setHeaderExpanded(!this.getPage().getHeaderExpanded());
        },

        onExit: function () {
            this._destroyFragments(_formFragments);
            this._cleanView();
        },

        onEdit: function () {
            this._toggleButtonsAndView(true);
            this._toggleFooter();

            var sName = this.getView().byId("DisplaySubjectName").getText();
            var sNameId = this.getView().byId("DisplaySubjectName").getId().replace("Display", '');
            var sMark = this.getView().byId("DisplaySubjectMark").getText();
            var sMarkId = this.getView().byId("DisplaySubjectMark").getId().replace("Display", '');
            this.aInputs.push({
                sId: sNameId,
                sValue: sName
            }, {
                sId: sMarkId,
                sValue: sMark
            });
        }
    });
});