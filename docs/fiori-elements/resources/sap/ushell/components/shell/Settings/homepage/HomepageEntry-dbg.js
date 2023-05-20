// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config",
    "sap/ushell/resources"
], function (
    Log,
    XMLView,
    JSONModel,
    SharedComponentUtils,
    Config,
    resources
) {
    "use strict";

    var mDisplayModes = {
        "scroll": 0,
        "tabs": 1,

        getName: function (iValue) {
            return Object.keys(this)[iValue];
        }
    };

    return {
        getEntry: function () {

            var oViewInstance;

            return {
                id: "homepageEntry",
                entryHelpID: "homepageEntry",
                title: resources.i18n.getText("FlpSettings_entry_title"),
                valueResult: null,
                contentResult: null,
                icon: "sap-icon://home",
                valueArgument: null,
                contentFunc: function () {
                    var sDisplayMode;
                    return SharedComponentUtils.getEffectiveHomepageSetting("/core/home/homePageGroupDisplay", "/core/home/enableHomePageSettings")
                    .then(function (sDisplay) {
                        sDisplayMode = sDisplay;
                        return XMLView.create({
                            id: "UserSettingsHomepageSettingsView",
                            viewName: "sap.ushell.components.shell.Settings.homepage.HomepageSetting"
                        });
                    })
                    .then(function (oView) {
                        oViewInstance = oView;
                        oViewInstance.setModel(new JSONModel({
                            displayMode: mDisplayModes[sDisplayMode] || mDisplayModes.scroll,
                            personalisationEnabled: Config.last("/core/shell/enablePersonalization")
                        }));
                        oViewInstance.setModel(resources.getTranslationModel(), "i18n");

                        return oViewInstance;
                    })
                    .catch(function (error) {
                        Log.error("Failed to get effective hompage setting.", error,
                            "sap.ushell.components.ushell.settings.homepage.HomepageEntry");
                        return Promise.reject();
                    });
                },
                onSave: function () {
                    if (oViewInstance) {
                        var iCurrentMode = oViewInstance.getModel().getProperty("/displayMode"),
                            sDisplay = mDisplayModes.getName(iCurrentMode),
                            oRenderer = sap.ushell.Container.getRenderer("fiori2");

                        // save anchor bar mode in personalization
                        return SharedComponentUtils.getPersonalizer("homePageGroupDisplay", oRenderer)
                            .then(function (oPersonalizer) {
                                return new Promise(function (fnResolve, fnReject) {
                                    oPersonalizer.setPersData(sDisplay)
                                        .done(function () {
                                            Config.emit("/core/home/homePageGroupDisplay", sDisplay);
                                            fnResolve();
                                        })
                                        .fail(function (error) {
                                            // Log failure if occurs.
                                            Log.error("Failed to save the anchor bar mode in personalization", error,
                                                "sap.ushell.components.ushell.settings.homepage.HomepageEntry");
                                                fnReject();
                                        });
                                });
                            });
                    }
                    Log.warning("Save operation for user account settings was not executed, because the homepage view was not initialized");
                    return Promise.resolve();

                },
                onCancel: function () {
                    if (oViewInstance) {
                        return;
                    }
                    Log.warning("Cancel operation for user account settings was not executed, because the homepage view was not initialized");
                },
                provideEmptyWrapper: false
            };
        }
    };

});
