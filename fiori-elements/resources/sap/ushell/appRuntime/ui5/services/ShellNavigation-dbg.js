// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/ShellNavigation",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/utils/UrlParsing"
], function (ShellNavigation, AppRuntimeService, AppRuntimeContext, UrlParsing) {
    "use strict";

    function ShellNavigationProxy (oContainerInterface, sParameters, oServiceConfiguration) {
        ShellNavigation.call(this, oContainerInterface, sParameters, oServiceConfiguration);

        this.toExternal = function (oArgs, oComponent, bWriteHistory) {
            if (!AppRuntimeContext.checkDataLossAndContinue()) {
                return;
            }
            if (AppRuntimeContext.getIsScube()) {
                sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolution) {
                    var sTargetHash = UrlParsing.constructShellHash(oArgs);
                    oNavTargetResolution.isIntentSupportedLocal([sTargetHash]).then(function (oSupported) {
                        if (oSupported[sTargetHash].supported === true) {
                            if (oArgs.target.shellHash) {
                                oArgs = UrlParsing.parseShellHash(oArgs.target.shellHash);
                                oArgs.target = {
                                    semanticObject: oArgs.semanticObject,
                                    action: oArgs.action
                                };
                                delete oArgs["semanticObject"];
                                delete oArgs["action"];
                            }
                            oArgs.params["sap-shell-so"] = oArgs.target.semanticObject;
                            oArgs.params["sap-shell-action"] = oArgs.target.action;
                            oArgs.params["sap-remote-system"] = AppRuntimeContext.getRemoteSystemId();
                            oArgs.target.semanticObject = "Shell";
                            oArgs.target.action = "startIntent";
                            return AppRuntimeService.sendMessageToOuterShell(
                                "sap.ushell.services.CrossApplicationNavigation.toExternal", {
                                    oArgs: oArgs
                                });
                        }

                        AppRuntimeService.sendMessageToOuterShell(
                            "sap.ushell.services.CrossApplicationNavigation.toExternal", {
                                oArgs: oArgs
                            });
                    });
                });

            } else {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.CrossApplicationNavigation.toExternal", {
                        oArgs: oArgs
                    });
            }
        };

        this.toAppHash = function (sAppHash, bWriteHistory) {
            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.ShellNavigation.toExternal", {
                sAppHash: sAppHash,
                bWriteHistory: bWriteHistory
            });
        };
    }

    ShellNavigationProxy.prototype = ShellNavigation.prototype;
    ShellNavigationProxy.hasNoAdapter = ShellNavigation.hasNoAdapter;

    return ShellNavigationProxy;
}, true);
