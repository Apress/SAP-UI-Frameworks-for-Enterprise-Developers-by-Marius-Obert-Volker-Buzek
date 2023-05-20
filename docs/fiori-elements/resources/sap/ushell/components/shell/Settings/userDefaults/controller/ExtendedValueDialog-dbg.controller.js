// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/Token",
    "sap/ui/comp/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (
    Token,
    compLibrary,
    JSONModel,
    Fragment
) {
    "use strict";

    // shortcut for sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation
    var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;

    var ExtendedValueDialogController = function () {};

    ExtendedValueDialogController.prototype.openDialog = function (oRecord, fnOnSave) {
        Fragment.load({
            id: "ExtendedValueDialogFragment",
            name: "sap.ushell.components.shell.Settings.userDefaults.view.ExtendedValueDialog",
            controller: this
        }).then(function (oValueHelpDialog) {
            var sPathToTokens = "/" + oRecord.parameterName + "/valueObject/extendedValue/Ranges",
                oExtendedModel = oRecord.modelBind.extendedModel,
                aRanges = oExtendedModel.getProperty(sPathToTokens) || [],
                sLabelText,
                sNameSpace;

            if (oRecord.modelBind.isOdata) {
                sNameSpace = this._getMetadataNameSpace(oRecord.editorMetadata.editorInfo.odataURL);
                var oEntityType = oRecord.modelBind.model.getMetaModel().getODataEntityType(sNameSpace + "." + oRecord.editorMetadata.editorInfo.entityName);
                if (oEntityType) {
                    sLabelText = oRecord.modelBind.model.getMetaModel().getODataProperty(oEntityType, oRecord.editorMetadata.editorInfo.propertyName)["sap:label"];
                }
            }

            var oModelData = {
                label: oRecord.editorMetadata.displayText || sLabelText || oRecord.parameterName,
                key: oRecord.modelBind.sPropertyName,
                parameterName: oRecord.parameterName
            };

            oValueHelpDialog.setModel(new JSONModel(oModelData));
            oValueHelpDialog.setIncludeRangeOperations(this.getListOfSupportedRangeOperations());
            oValueHelpDialog.setTokens(this.getTokensToValueHelpDialog(aRanges, oRecord.parameterName));
            oValueHelpDialog.setRangeKeyFields([{
                label: oModelData.label,
                key: oRecord.parameterName
            }]);
            oValueHelpDialog.attachOk(function (oEvent) {
                fnOnSave(oEvent);
                oEvent.getSource().close();
            });
            oValueHelpDialog.open();
        }.bind(this));
    };

    ExtendedValueDialogController.prototype.closeValueHelp = function (oControlEvent) {
        oControlEvent.getSource().close(oControlEvent);
    };

    ExtendedValueDialogController.prototype.afterCloseValueHelp = function (oControlEvent) {
        oControlEvent.getSource().destroy();
    };

    ExtendedValueDialogController.prototype._getMetadataNameSpace = function (sServiceUrl) {
        var aSplit = sServiceUrl.split("/"),
            sNamespace;
        sNamespace = aSplit[aSplit.length - 1];
        return sNamespace;
    };

    ExtendedValueDialogController.prototype.getListOfSupportedRangeOperations = function () {
        // there is no representation of StartsWith and EndsWith on ABAP so applications won't be able to get these operations
        var aSupportedOps = Object.keys(ValueHelpRangeOperation);
        return aSupportedOps.filter(function (operation) {
            return operation !== "StartsWith" && operation !== "EndsWith" && operation !== "Initial";
        });
    };

    ExtendedValueDialogController.prototype.getTokensToValueHelpDialog = function (aRanges, sParameterName) {
        var aTokens = [],
            oFormattedToken;
        aRanges.forEach(function (oRange) {
            if (oRange) {
                // convert the Range format to the format that the value help dialog knows how to read
                oFormattedToken = {};
                oFormattedToken.exclude = oRange.Sign === "E";
                oFormattedToken.keyField = sParameterName;
                oFormattedToken.operation = oRange.Option !== "CP" ? oRange.Option : "Contains";
                oFormattedToken.value1 = oRange.Low;
                oFormattedToken.value2 = oRange.High;
                aTokens.push(new Token({}).data("range", oFormattedToken));
            }
        });
        return aTokens;
    };

    return new ExtendedValueDialogController();

});
