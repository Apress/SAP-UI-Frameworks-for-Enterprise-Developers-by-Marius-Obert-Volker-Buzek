// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/Container",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/appRuntime/ui5/renderers/fiori2/Renderer",
    "sap/ushell/appRuntime/ui5/ui/UIProxy",
    "sap/ushell/appRuntime/ui5/SessionHandlerAgent"
], function (oContainer, AppRuntimeService, Renderer, UIProxy, SessionHandlerAgent) {
    "use strict";

    function ContainerProxy () {
        var oAdapter,
            isDirty = false,
            aRegisteredDirtyMethods = [];

        this.bootstrap = function (sPlatform, mAdapterPackagesByPlatform) {
            return sap.ushell.bootstrap(sPlatform, mAdapterPackagesByPlatform).then(function (Container) {
                oAdapter = sap.ushell.Container._getAdapter();

                //get indication if we are in App Runtime
                sap.ushell.Container.inAppRuntime = function () {
                    return true;
                };
                //for backward computability
                sap.ushell.Container.runningInIframe = sap.ushell.Container.inAppRuntime;

                sap.ushell.Container.getFLPUrl = function (bIncludeHash) {
                    return AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.Container.getFLPUrl", {
                            bIncludeHash: bIncludeHash
                        });
                };

                sap.ushell.Container.getFLPUrlAsync = function (bIncludeHash) {
                    return sap.ushell.Container.getFLPUrl(bIncludeHash);
                };

                sap.ushell.Container.getRenderer = function () {
                    return Renderer;
                };

                sap.ushell.Container.logout = function () {
                    return oAdapter.logout();
                };

                sap.ushell.Container.getFLPPlatform = function () {
                    return AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.Container.getFLPPlatform"
                    );
                };

                sap.ushell.Container.extendSession = function () {
                    SessionHandlerAgent.userActivityHandler();
                };

                sap.ushell.Container.setDirtyFlag = function (bIsDirty) {
                    isDirty = bIsDirty;
                };

                sap.ushell.Container.getDirtyFlag = function (oNavigationContext) {
                    return isDirty || sap.ushell.Container.handleDirtyStateProvider(oNavigationContext);
                };

                sap.ushell.Container.registerDirtyStateProvider = function (fnDirty) {
                    if (typeof fnDirty !== "function") {
                        throw new Error("fnDirty must be a function");
                    }
                    aRegisteredDirtyMethods.push(fnDirty);
                };

                sap.ushell.Container.handleDirtyStateProvider = function (oNavigationContext) {
                    var bDirty = false;
                    if (aRegisteredDirtyMethods.length > 0) {
                        for (var i = 0; i < aRegisteredDirtyMethods.length && bDirty === false; i++) {
                            bDirty = bDirty || (aRegisteredDirtyMethods[i](oNavigationContext) || false);
                        }
                    }
                    return bDirty;
                };

                sap.ushell.Container.deregisterDirtyStateProvider = function (fnDirty) {
                    if (typeof fnDirty !== "function") {
                        throw new Error("fnDirty must be a function");
                    }

                    var nIndex = -1;
                    for (var i = aRegisteredDirtyMethods.length - 1; i >= 0; i--) {
                        if (aRegisteredDirtyMethods[i] === fnDirty) {
                            nIndex = i;
                            break;
                        }
                    }

                    if (nIndex >= 0) {
                        aRegisteredDirtyMethods.splice(nIndex, 1);
                    }
                };

                sap.ushell.Container.cleanDirtyStateProviderArray = function () {
                    aRegisteredDirtyMethods = [];
                    isDirty = false;
                };

                sap.ushell.Container.setAsyncDirtyStateProvider = function () {
                    //overide the orig function in order to do nothing in AppRuntime
                };

                // This is used ONLY when a keep-alive application is stored
                sap.ushell.Container.getAsyncDirtyStateProviders = function () {
                    return aRegisteredDirtyMethods;
                };

                // This is used ONLY when a keep-alive application is restored
                // Dirty state providers that was registered before are re-registered
                sap.ushell.Container.setAsyncDirtyStateProviders = function (aDirtyStateProviders) {
                    aRegisteredDirtyMethods = aDirtyStateProviders;
                };
            });
        };
    }

    return new ContainerProxy();
}, true);
