// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/CrossApplicationNavigation",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/services/_AppState/AppState",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/base/util/deepClone",
    "sap/ushell/utils/UrlParsing"
], function (CrossApplicationNavigation, AppRuntimeService, AppStateAppState, jQuery, Log, AppRuntimeContext, deepClone, UrlParsing) {
    "use strict";

    function CrossApplicationNavigationProxy (oContainerInterface, sParameters, oServiceConf) {
        CrossApplicationNavigation.call(this, oContainerInterface, sParameters, oServiceConf);

        this.backToPreviousApp = function () {
            //ready also for scube
            if (AppRuntimeContext.checkDataLossAndContinue()) {
                return AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.CrossApplicationNavigation.backToPreviousApp"
                );
            }
        };

        this.expandCompactHashLocal = this.expandCompactHash;
        this.expandCompactHash = function (sHashFragment) {
            //ready for scube
            if (AppRuntimeContext.getIsScube()) {
                return this.expandCompactHashLocal(sHashFragment);
            }
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.expandCompactHash", {
                    sHashFragment: sHashFragment
                }
            );
        };

        this.getDistinctSemanticObjectsLocal = this.getDistinctSemanticObjects;
        this.getDistinctSemanticObjects = function () {
            //ready for scube
            if (AppRuntimeContext.getIsScube()) {
                return this.getDistinctSemanticObjectsLocal();
            }
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.getDistinctSemanticObjects"
            );
        };

        this.getLinksLocal = this.getDistinctSemanticObjects;
        this.getLinks = function (oArgs) {
            //ready also for scube
            var oDeferred = new jQuery.Deferred();

            function removeComponent (oArgsParam) {
                if (Array.isArray(oArgsParam)) {
                    oArgsParam.forEach(function (element) {
                        if (element[0]) {
                            delete element[0].ui5Component;
                        }
                    });
                } else {
                    delete oArgsParam.ui5Component;
                }
            }

            if (AppRuntimeContext.getIsScube()) {
                this.getLinksLocal(oArgs).then(function (arrResult1) {
                    removeComponent(oArgs);
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.CrossApplicationNavigation.getLinks", oArgs).done(function (arrResult2) {
                        if (arrResult1.length === 0) {
                            oDeferred.resolve(arrResult2);
                        } else {
                            arrResult2 = arrResult2.concat(arrResult1);
                            oDeferred.resolve(arrResult2);
                        }
                    });
                });
            } else {
                removeComponent(oArgs);
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.CrossApplicationNavigation.getLinks", oArgs).done(oDeferred.resolve, oDeferred.reject);
            }

            return oDeferred.promise();
        };

        this.getPrimaryIntent = function (sSemanticObject, mParameters) {
            //not ready for scube
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.getPrimaryIntent", {
                    sSemanticObject: sSemanticObject,
                    mParameters: mParameters
                }
            );
        };

        this.getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor, oComponent,
                                                sAppStateKey, bCompactIntents) {
            //not ready for scube
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks", {
                    sSemanticObject: sSemanticObject,
                    mParameters: mParameters,
                    bIgnoreFormFactor: bIgnoreFormFactor,
                    sAppStateKey: sAppStateKey,
                    bCompactIntents: bCompactIntents
                }
            );
        };

        this.historyBack = function (iSteps) {
            //ready for scube
            if (AppRuntimeContext.checkDataLossAndContinue()) {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.CrossApplicationNavigation.historyBack", {
                        iSteps: iSteps
                    }
                );
            }
        };

        this.isIntentSupported = function (aIntents, oComponent) {
            //ready also for scube
            if (AppRuntimeContext.getIsScube()) {
                var oDeferred = new jQuery.Deferred();
                sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                    NavTargetResolution.isIntentSupported(aIntents, oComponent).done(oDeferred.resolve, oDeferred.reject);
                });
                return oDeferred.promise();
            }

            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.isIntentSupported", {
                    aIntents: aIntents
                }
            );
        };

        this.isNavigationSupported = function (aIntents, oComponent) {
            //ready also for scube
            if (AppRuntimeContext.getIsScube()) {
                var oDeferred = new jQuery.Deferred(),
                    aFilteredIntents;

                aFilteredIntents = aIntents.map(function (oArg) {
                    if (typeof oArg === "object") {
                        var oNewArg = oArg;
                        if (oArg.params && oArg.params.hasOwnProperty("sap-app-origin")) {
                            oNewArg = deepClone(oArg);
                            delete oNewArg.params["sap-app-origin"];
                        }
                        return oNewArg;
                    }
                    return oArg;
                });
                sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (NavTargetResolution) {
                    NavTargetResolution.isNavigationSupported(aFilteredIntents, oComponent).done(oDeferred.resolve, oDeferred.reject);
                });
                return oDeferred.promise();
            }

            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.isNavigationSupported", {
                    aIntents: aIntents
                }
            );
        };

        this.toExternal = function (oArgs, oComponent) {
            //ready also for scube
            if (AppRuntimeContext.getIsScube()) {
                if (oArgs.target && oArgs.target.shellHash) {
                    var oTmpArgs = UrlParsing.parseShellHash(oArgs.target.shellHash);
                    if (oTmpArgs.params) {
                        delete oTmpArgs.params["sap-app-origin"];
                        oArgs.target.shellHash = UrlParsing.constructShellHash(oTmpArgs);
                    }
                } else if (oArgs.params) {
                    delete oArgs.params["sap-app-origin"];
                }
                sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigationService) {
                    oShellNavigationService.toExternal(oArgs, oComponent);
                });
            } else if (AppRuntimeContext.checkDataLossAndContinue()) {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.CrossApplicationNavigation.toExternal", {
                        oArgs: oArgs
                    });
            }
            return new jQuery.Deferred().resolve().promise();
        };

        this.getAppState = function (oAppComponent, sAppStateKey) {
            //ready also for scube
            var oDeferred = new jQuery.Deferred();

            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.getAppState", {
                    sAppStateKey: sAppStateKey
                }).done(function (oState) {
                    sap.ushell.Container.getServiceAsync("AppState").then(function (AppStateService) {
                        var oAppStateAppState = new AppStateAppState(
                            AppStateService,
                            oState._sKey,
                            oState._bModifiable,
                            oState._sData,
                            oState._sAppName,
                            oState._sACHComponent,
                            oState._bTransient);
                        oDeferred.resolve(oAppStateAppState);
                });
            });

            return oDeferred.promise();
        };

        this.resolveIntentLocal = this.resolveIntent;
        this.resolveIntent = function (sHashFragment) {
            //ready for scube
            if (AppRuntimeContext.getIsScube()) {
                return this.resolveIntentLocal(sHashFragment);
            }

            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.resolveIntent", {
                    sHashFragment: sHashFragment
                });
        };

        this.hrefForExternalAsync = function (oArgs) {
            //not ready for scube
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.hrefForExternal", {
                    oArgs: oArgs
                });
        };

        this.hrefForAppSpecificHashAsync = function (sAppHash) {
            //not ready for scube
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.hrefForAppSpecificHash", {
                    sAppHash: sAppHash
                });
        };

        this.isInitialNavigation = function () {
            //ready for scube
            Log.error("Deprecated API call of 'sap.ushell.CrossApplicationNavigation.isInitialNavigation'. Please use 'isInitialNavigationAsync' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );
            return false; //temporary until BLI to support this will be implemented
        };

        this.isInitialNavigationAsync = function () {
            //ready for scube
            return AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.isInitialNavigation", {});
        };
    }

    CrossApplicationNavigationProxy.prototype = CrossApplicationNavigation.prototype;
    CrossApplicationNavigationProxy.hasNoAdapter = CrossApplicationNavigation.hasNoAdapter;

    return CrossApplicationNavigationProxy;
}, true);
