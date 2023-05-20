// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/tiles/utils",
    "sap/ui/core/library",
    "sap/m/MessageBox"
], function (Controller, utils, coreLibrary, MessageBox) {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;


    return Controller.extend("sap.ushell.components.tiles.action.Configuration", {
        sEnterValuePlaceHolder: "",
        sDuplicateErrorMsg: "",
        sDuplicateErrorTitle: "",
        sInvalidParmMsg: "",

        aDefaultObjects: [
            {
                obj: "",
                name: ""
            }, {
                obj: "*",
                name: "*"
            }
        ],

        onConfigurationInputChange: function (oControlEvent) {
            utils.checkTMInput(this.getView(), oControlEvent);
        },
        onInit: function () {
            var oView = this.getView();
            var oSemanticObjectSelector = oView.byId("semantic_objectInput");
            var oRoleSelector = oView.byId("navigation_provider_roleInput");
            var oInstanceSelector = oView.byId("navigation_provider_instanceInput");
            var oAliasSelector = oView.byId("target_application_aliasInput");
            var oActionSelector = oView.byId("semantic_actionInput");
            var oTargetTypeSelector = oView.byId("targetTypeInput");
            var oResourceModel = utils.getResourceBundleModel();

            oView.setModel(oResourceModel, "i18n");
            oView.setViewName("sap.ushell.components.tiles.action.Configuration");
            // initialize semantic object input field
            utils.createSemanticObjectModel(this, oSemanticObjectSelector, this.aDefaultObjects);
            utils.createRoleModel(this, oRoleSelector, oInstanceSelector);
            utils.createAliasModel(this, oAliasSelector);
            utils.createActionModel(this, oActionSelector);
            utils.createNavigationProviderModel(this, oTargetTypeSelector);
            // make sure that the chose object is written back to the configuration
            oSemanticObjectSelector.attachChange(function (oControlEvent) {
                var sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/semantic_object", sValue);
            });
            oRoleSelector.attachChange(function (oControlEvent) {
                var sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/navigation_provider_role", sValue);
                utils.updateAliasModel(oView, oAliasSelector);
            });
            oInstanceSelector.attachChange(function (oControlEvent) {
                var sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/navigation_provider_instance", sValue);
            });
            oAliasSelector.attachChange(function (oControlEvent) {
                var sValue = oControlEvent.getSource().getValue();
                oView.getModel().setProperty("/config/target_application_alias", sValue);
            });

            var oBundle = oResourceModel.getResourceBundle();
            this.sEnterValuePlaceHolder = oBundle.getText("configuration.signature.table.valueFieldLbl");
            this.sDuplicateErrorMsg = oBundle.getText("configuration.signature.uniqueParamMessage.text");
            this.sDuplicateErrorTitle = oBundle.getText("configuration.signature.uniqueParamMessage.title");
            this.sInvalidParmMsg = oBundle.getText("configuration.signature.invalidParamMessage.text");
        },

        // This function applies table logic for the mapping signature structure according to the Mandatory check-box:
        // if mandatory is unselected: Value and isRegularExpression fields should be disabled and vice versa...
        handleMandatoryChange: function (oMandatoryCheckBox) {
            var sId = oMandatoryCheckBox.getParameter("id");
            var aParentCells = sap.ui.getCore().byId(sId).getParent().getCells();

            var bIsMandatory = oMandatoryCheckBox.getParameter("selected");

            if (bIsMandatory) {
                aParentCells[2].setEnabled(true); // Value field
                aParentCells[2].setPlaceholder(this.sEnterValuePlaceHolder);
                aParentCells[4].setEnabled(false); // DefaultValue field
                aParentCells[4].setValue("");
                aParentCells[4].setPlaceholder("");
                aParentCells[3].setEnabled(true); // IsRegularExpression check-box field
            } else {
                aParentCells[2].setEnabled(false); // Value field
                aParentCells[2].setValue("");
                aParentCells[2].setPlaceholder(""); // Were requested that a disabled text field will not show the Enter Value
                aParentCells[4].setEnabled(true); // DefaultValue field
                aParentCells[4].setPlaceholder(this.sEnterValuePlaceHolder);
                aParentCells[3].setEnabled(false); // IsRegularExpression check-box field
                aParentCells[3].setSelected(false);
            }
        },

        addRow: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var rows = oModel.getProperty("/config/rows");

            // Init a row template for adding new empty row to the params table (mapping signature)
            var newParamRow = utils.getEmptyRowObj();
            rows.push(newParamRow);
            oModel.setProperty("/config/rows", rows);
        },

        deleteRow: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var rows = oModel.getProperty("/config/rows");

            var table = oView.byId("mappingSignatureTable");
            var aSelectedItemsIndexes = table.getSelectedIndices();
            var aSortedDescending = aSelectedItemsIndexes.sort(function (a, b) {
                return b - a;
            }).slice();

            for (var i = 0; i < aSortedDescending.length; i++) {
                table.removeSelectionInterval(aSortedDescending[i], aSortedDescending[i]);// Make sure to turn off the selection or it will pass to
                // the next row.
                rows.splice(aSortedDescending[i], 1); // There is a major assumption here that the index in the model is identical to the index in
                // the table !!!
            }
            oModel.setProperty("/config/rows", rows);
        },
        // Will be called on change event of the name column in Parameters table.
        // 2 parameters cannot have the same name. (in case the user decide to ignore the error message, there is a second validation on the save)
        checkDuplicateNames: function (changeEvent) {

            var oModel = this.getView().getModel();
            var rows = oModel.getProperty("/config/rows");
            var nameCol = sap.ui.getCore().byId(changeEvent.getParameter("id"));
            var sNewValue = changeEvent.getParameter("newValue");

            if (sNewValue != "" && !(/^[\w-/]+$/.test(sNewValue))) {
                nameCol.setValueState(ValueState.Error); MessageBox.alert(this.sInvalidParmMsg, this.focusNameField.bind(nameCol), this.sDuplicateErrorTitle);
            }
            if (utils.tableHasDuplicateParameterNames(rows)) {
                nameCol.setValueState(ValueState.Error); MessageBox.alert(this.sDuplicateErrorMsg, this.focusNameField.bind(nameCol), this.sDuplicateErrorTitle);
            } else {
                nameCol.setValueState(ValueState.None);
            }
        },
        // a callback function for the duplicate error MessageBox
        focusNameField: function () {
            this.focus();
        },

        // forward value helper request to utils
        onValueHelpRequest: function (oEvent) {
            // Third parameter is to differentiate whether it's Tile Actions icon field or general icon field. If it's true, then it's tile actions
            // icon field, else general icon field.
            utils.objectSelectOnValueHelpRequest(this, oEvent, false);
        },
        onActionValueHelpRequest: function (oEvent) {
            utils.actionSelectOnValueHelpRequest(this, oEvent);
        },
        onRoleValueHelpRequest: function (oEvent) {
            utils.roleSelectOnValueHelpRequest(this, oEvent);
        },
        onInstanceValueHelpRequest: function (oEvent) {
            utils.instanceSelectOnValueHelpRequest(this, oEvent);
        },
        instanceSuggest: function (oEvent) {
            utils.instanceSuggest(this, oEvent);
        },
        aliasSuggest: function (oEvent) {
            utils.aliasSuggest(this, oEvent);
        },
        onAliasValueHelpRequest: function (oEvent) {
            utils.applicationAliasSelectOnValueHelpRequest(this, oEvent);
        },
        onFormFactorChange: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/config/formFactorConfigDefault", false);
        },

        // Will be called on change event of the application type radio buttons.
        onApplicationTypeChange: function (oEvent) {
            var oParameter = oEvent.getParameters();
            if (oParameter.selectedItem) {
                utils.displayApplicationTypeFields(oParameter.selectedItem.getKey(), this.getView());
            }
        }
    });
});
