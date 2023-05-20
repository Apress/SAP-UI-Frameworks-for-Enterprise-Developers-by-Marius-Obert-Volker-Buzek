// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/Locale",
    "sap/ui/core/LocaleData",
    "sap/base/Log",
    "sap/ushell/resources"
], function (
    XMLView,
    Locale,
    LocaleData,
    Log,
    resources
) {
    "use strict";

    function getEntry () {
        var oViewInstance;

        var oEntry = {
            id: "language",
            entryHelpID: "language",
            title: resources.i18n.getText("languageRegionTit"),
            valueResult: null,
            contentResult: null,
            icon: "sap-icon://globe",
            valueArgument: function () {
                var sUserLanguage = sap.ushell.Container.getUser().getLanguageText();
                if (sUserLanguage.indexOf("-") > -1) {
                    sUserLanguage = sUserLanguage.replace("-", " (").concat(")");
                }

                return Promise.resolve(sUserLanguage);
            },
            contentFunc: function () {
                return XMLView.create({
                    id: "languageRegionSelector",
                    viewName: "sap.ushell.components.shell.Settings.userLanguageRegion.LanguageRegionSelector"
                })
                    .then(function (oView) {
                        var oViewController = oView.getController();
                        oViewInstance = oView;
                        return oViewController.oUserInfoServicePromise
                            .then(function () {
                                return oViewInstance;
                            });
                    });
            },
            onSave: function (fnUpdateUserPreferences) {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave(fnUpdateUserPreferences);
                }
                Log.warning(
                    "Save operation for language settings was not executed, because the languageRegionSelector view was not initialized"
                );
                return Promise.resolve();

            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for language settings was not executed, because the languageRegionSelector view was not initialized"
                );
            }
        };

        return oEntry;
    }



    return {
        getEntry: getEntry
    };

});
