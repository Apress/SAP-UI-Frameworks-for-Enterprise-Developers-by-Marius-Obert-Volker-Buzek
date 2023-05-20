// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/AppState",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/services/_AppState/AppState",
    "sap/ushell/utils",
    "sap/ui/thirdparty/jquery"
], function (AppState, AppRuntimeService, AppStateAppState, utils, jQuery) {
    "use strict";

    function AppStateProxy (oAdapter, oContainerInterface, sParameter, oConfig) {
        AppState.call(this, oAdapter, oContainerInterface, sParameter, oConfig);

        this.createEmptyAppStateOrig = this.createEmptyAppState;
        this.createEmptyAppState = function (oComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings) {
            var oAppState = this.createEmptyAppStateOrig(oComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings);
            if (typeof bTransientEnforced === "boolean" && oAppState._bTransient !== bTransientEnforced) {
                oAppState._bTransient = bTransientEnforced;
                oAppState._sKey = this._getGeneratedKey(bTransientEnforced);
            }
            return oAppState;
        };

        this.getAppState = function (sKey) {
            var oDeferred = new jQuery.Deferred();

            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.getAppState", {
                sKey: sKey
            }).done(function (oState) {
                sap.ushell.Container.getServiceAsync("AppState").then(function (AppStateService) {
                    var oAppStateAppState = new AppStateAppState(
                        AppStateService,
                        oState._sKey,
                        oState._bModifiable,
                        oState._sData,
                        oState._sAppName,
                        oState._sACHComponent,
                        oState._bTransient,
                        oState._iPersistencyMethod,
                        oState._oPersistencySettings);
                    oDeferred.resolve(oAppStateAppState);
                });
            });

            return oDeferred.promise();
        };

        this._saveAppState = function (sKey, sData, sAppName, sComponent, bTransient, iPersistencyMethod, oPersistencySettings) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState._saveAppState",
                {
                    sKey: sKey,
                    sData: sData,
                    sAppName: sAppName,
                    sComponent: sComponent,
                    bTransient: bTransient,
                    iPersistencyMethod: iPersistencyMethod,
                    oPersistencySettings: oPersistencySettings
                }
            );
        };

        this._loadAppState = function (sKey) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState._loadAppState",
                { sKey: sKey }
            );
        };

        AppState.prototype.deleteAppState = function (sKey) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.deleteAppState",
                { sKey: sKey }
            );
        };

        this.getAppStateData = function (sKey) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.CrossApplicationNavigation.getAppStateData", {
                sAppStateKey: sKey
            });
        };

        this.createNewInAppState = function (sData) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.createNewInAppState", {
                sData: sData
            });
        };

        this.updateInAppStateData = function (sData) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.updateInAppState", {
                sData: sData
            });
        };

        this.getInAppStateData = function () {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.getInAppStateData");
        };

        this.makeStatePersistent = function (sKey, iPersistencyMethod, oPersistencySettings) {
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.AppState.makeStatePersistent", {
                sKey: sKey,
                iPersistencyMethod: iPersistencyMethod,
                oPersistencySettings: oPersistencySettings
            });
        };
    }

    AppStateProxy.prototype = AppState.prototype;
    AppStateProxy.hasNoAdapter = AppState.hasNoAdapter;
    AppStateProxy.WindowAdapter = AppState.WindowAdapter;

    return AppStateProxy;
}, true);
