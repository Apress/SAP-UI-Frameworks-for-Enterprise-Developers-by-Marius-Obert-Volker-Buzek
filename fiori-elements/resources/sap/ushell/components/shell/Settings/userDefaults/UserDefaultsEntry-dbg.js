// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/ComponentContainer",
    "sap/ushell/resources",
    "sap/base/util/includes"
], function (
    Log,
    ComponentContainer,
    resources,
    includes
) {
    "use strict";

    return {
        getEntry: function () {
            var oContainer;
            return {
                id: "userDefaultEntry", // defaultParametersSelector
                entryHelpID: "defaultParameters",
                title: resources.i18n.getText("defaultsValuesEntry"),
                valueArgument: function () {
                    var oUserDefaultParametersServicePromise = sap.ushell.Container.getServiceAsync("UserDefaultParameters");
                    var oCSTRServicePromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution");
                    var oContentProviderIdPromise = sap.ushell.Container.getServiceAsync("CommonDataModel")
                        .then(function (oCdmService) {
                            return oCdmService.getContentProviderIds();
                        })
                        .catch(function () {
                            return [""];
                        });

                    return Promise.all([
                        oUserDefaultParametersServicePromise,
                        oCSTRServicePromise,
                        oContentProviderIdPromise
                    ])
                        .then(function (aResult) {
                            var oUserDefaultParametersService = aResult[0];
                            var oCSTRService = aResult[1];
                            var aContentProviderIds = aResult[2].length > 0 ? aResult[2] : [""];

                            return Promise.all(
                                aContentProviderIds.map(function (sContentProviderId) {
                                    return oCSTRService.getSystemContext(sContentProviderId)
                                        .then(function (oSystemContext) {
                                            return oUserDefaultParametersService.hasRelevantMaintainableParameters(oSystemContext);
                                        });
                                })
                            );
                        })
                        // as a result we get an array of true, false (and undefined in case hasRelevantMaintainableParameters fails)
                        .then(function (aResults) {
                            return {
                                value: includes(aResults, true)
                            };
                        });
                },
                contentFunc: function () {
                    return new Promise(function (resolve, reject) {
                        oContainer = new ComponentContainer("defaultParametersSelector", {
                            name: "sap.ushell.components.shell.Settings.userDefaults",
                            manifest: true,
                            async: true
                        });
                        resolve(oContainer);
                    });
                },
                onSave: function () {
                    if (oContainer && oContainer.getComponentInstance()) {
                        return oContainer.getComponentInstance().onSave();
                    }
                    Log.warning("Save operation for user defaults settings was not executed, because the user default component was not initialized");
                    return Promise.resolve();
                },
                onCancel: function () {
                    if (oContainer && oContainer.getComponentInstance()) {
                        oContainer.getComponentInstance().onCancel();
                        return;
                    }
                    Log.warning("Cancel operation for user defaults settings was not executed, because the user default component was not initialized");
                },
                defaultVisibility: false
            };
        }
    };
});
