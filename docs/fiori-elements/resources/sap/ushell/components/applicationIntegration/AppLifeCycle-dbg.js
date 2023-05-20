// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/components/applicationIntegration/elements/model",
    "sap/ushell/components/applicationIntegration/Storage",
    "sap/ushell/components/applicationIntegration/application/BlueBoxHandler",
    "sap/ushell/ui5service/ShellUIService",
    "sap/ushell/components/applicationIntegration/application/Application",
    "sap/ushell/components/applicationIntegration/relatedServices/RelatedServices",
    "sap/ushell/components/applicationIntegration/relatedShellElements/RelatedShellElements",
    "sap/ushell/components/applicationIntegration/configuration/AppMeta",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/utils",
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/ApplicationType",
    "sap/base/util/deepExtend",
    "sap/base/util/UriParameters",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/EventHub",
    "sap/ushell/utils/UrlParsing",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/services/_MessageBroker/MessageBrokerEngine"
], function (
    ElementsModel,
    Storage,
    BlueBoxHandler,
    ShellUIService,
    Application,
    RelatedServices,
    RelatedShellElements,
    AppMeta,
    AppConfiguration,
    utils,
    Device,
    Config,
    ApplicationType,
    deepExtend,
    UriParameters,
    jQuery,
    Log,
    EventHub,
    oUrlParsing,
    Core,
    hasher,
    MessageBrokerEngine
) {
    "use strict";

    function AppLifeCycle () {
        //Dangling controls is a queue of requests to change shell elements attributes, requested by the application in the process of createContent before the actual application state was apply.
        var oViewPortContainer,
            aCachedAppTypes = ["URL"],
            sRootIntent,
            oShellUIService,
            appState,
            oIntentToStorageId = {},
            disableHomeAppCache = false,
            oCurrentApplication = {},
            oActualElementsModelStateMap = {
                home: {
                    embedded: "embedded-home",
                    headerless: "headerless-home",
                    merged: "blank-home",
                    blank: "blank-home"
                },
                app: {
                    minimal: "minimal",
                    app: "app",
                    standalone: "standalone",
                    embedded: "embedded",
                    headerless: "headerless",
                    merged: "merged",
                    home: "home",
                    blank: "blank",
                    lean: "lean"
                }
            },
            oWebGuiV1StatefulCache,
            oGlobalShellCommunicationHandlers = [],
            oGlobalIframeCommunicationHandlers = {},
            isBackNavigationChanged = false,
            oKeepAliveModes = {
                FULL: "true",
                RESTRICTED: "restricted"
            };

        //connect FLP to the message broker
        if (window.QUnit === undefined) {
            MessageBrokerEngine.connect("FLP");
        }
        this.shellElements = function () {
            return RelatedShellElements;
        };

        this.service = function () {
            return RelatedServices;
        };

        ///////////////////APPLICATION INTEGRATION API///////////////////////////////
        ///////////////////END APPLICATION INTEGRATION API///////////////////////////////

        this.isCurrentApp = function (appId) {
            return (oCurrentApplication.appId === appId);
        };

        this.isAppWithSimilarShellHashInCache = function (appId, sFixedShellHash) {
            var oAppEntry = Storage.get(appId);

            if (oAppEntry) {
                if (oAppEntry.shellHash === sFixedShellHash) {
                    return true;
                }
                return false;
            }
            return false;
        };

        this.isAppInCache = function (appId) {
            return !!Storage.get(appId);
        };

        this.normalizeAppId = function (sAppId) {
            var sCmp = "-component",
                isCmp = sAppId.endsWith(sCmp);

            if (isCmp) {
                return sAppId.substring(0, sAppId.length - sCmp.length);
            }
            return sAppId;
        };

        this.onComponentCreated = function (oEvent, sChannel, oData) {
            var oApp = oData.component,
                sAppId = this.normalizeAppId(oApp.getId());

            if (this.isAppInCache(sAppId)) {
                Storage.get(sAppId).app = oApp;
                this.active(sAppId);
            } else {
                oCurrentApplication.app = oApp;

                if (oApp.active) {
                    oApp.active();
                }
            }
        };

        this.onGetMe = function (oEvent, sChannel, oData) {
            oData.AppLifeCycle = this;
        };

        this.store = function (sAppId) {
            var oStorageEntry = Storage.get(sAppId);

            if (oStorageEntry) {
                Application.store(oStorageEntry);
                AppMeta.store(oStorageEntry.meta);
                oStorageEntry.stateStored = true;
            }
        };

        this.destroy = function (sAppId, oFrom, oDeferred) {
            // TODO remove entry from cache (if it is in cache).
            // destroy all related resources.
            var oStorageEntry = Storage.get(sAppId),
                oInnerControl,
                oPromiseAppDestroy;

            function doDestroy () {
                if (oFrom && oFrom.getUrl) {
                    BlueBoxHandler.deleteStateFul(oFrom.getUrl());
                }
                Application.destroy(oFrom);
                RelatedShellElements.destroy(oFrom);
                AppMeta.destroy(oFrom);
            }

            this.removeControl(sAppId);

            if (oStorageEntry) {
                oInnerControl = BlueBoxHandler.getStateFul(oFrom.getUrl());

                if (oInnerControl && BlueBoxHandler.isStatefulContainerSupported(oInnerControl)) {
                    var oHandler = BlueBoxHandler.getHandler();

                    //in case this is a stateful container
                    //invoke destroy the application with the ID.
                    oPromiseAppDestroy = oHandler.destroy(oInnerControl, sAppId);
                    //TODO: then(check number instances === 0 evict BlueBox?????Think/plugins)
                } else {
                    //Once we destroy the container the application destroy will be create, no need to call Application.destroy(oStorageEntry.app)
                    oStorageEntry.container.destroy();
                    BlueBoxHandler.deleteStateFul(oFrom.getUrl());
                    oPromiseAppDestroy = Promise.resolve();
                }

                //remove the entry from the LRU Storage
                Storage.remove(sAppId);
                if (oDeferred) {
                    oPromiseAppDestroy.then(oDeferred.resolve);
                }
            } else {
                // If the application running in an iframe registered for "before close" event,
                // we first post it a message to prepare for closing (usually, the app will close
                // its session or release locks held on the server), and only when the iframe send a response
                // back that it finished processing the event, we will continue to destroy the app (iframe).
                // If the app in the iframe did not register to the event, we destroy the app immediately exactly
                // as it was done before.
                // Note that even if the response from the iframe is not successful, we still destroy the app
                // because the second app that we navigated to was already created so we can not stop
                // the actual navigation (this is the same behaviour that we had before).
                // This mechanism was added to solve the change made in Chrome to disallow Sync XHR on
                // browser close.
                var oPromise = oFrom && oFrom.sendBeforeAppCloseEvent && oFrom.sendBeforeAppCloseEvent();

                if (oPromise === undefined) {
                    doDestroy();
                    if (oDeferred) {
                        oDeferred.resolve();
                    }
                } else {
                    oPromise.then(function () {
                        doDestroy();
                        if (oDeferred) {
                            oDeferred.resolve();
                        }
                    }, function (sError) {
                        doDestroy();
                        if (oDeferred) {
                            oDeferred.resolve();
                        }
                        Log.error(
                            "FLP got a failed response from the iframe for the 'sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent' message sent",
                            sError,
                            "sap.ushell.components.applicationIntegration.AppLifeCycle.js");
                    });
                }
            }
        };

        this.restore = function (sAppId) {
            var oStorageEntry = Storage.get(sAppId);

            if (oStorageEntry && oStorageEntry.stateStored === true) {
                Application.restore(oStorageEntry);
                RelatedServices.restore(oStorageEntry.service);
                AppMeta.restore(oStorageEntry.meta);
            }
        };

        this.active = function (sAppId) {
            var oStorageEntry = Storage.get(sAppId);

            if (oStorageEntry) {
                Application.active(oStorageEntry.app);
            }
        };

        this.handleExitStateful = function (sFromId, oFrom, isHomePage) {
            var sBBStorageId,
                oHandlers = BlueBoxHandler.getHandler();

            if (Storage.get(sFromId)) {
                sBBStorageId = BlueBoxHandler.getStorageKey(oFrom);
                if (RelatedServices.isBackNavigation() === true && !isHomePage) {
                    Core.getEventBus().publish("sap.ushell", "appClosed", oFrom);
                    Storage.remove(sBBStorageId);
                    return oHandlers.destroy(oFrom);
                } else {
                    // in this case the store of the currently running application, so we do not need to pass the sCacheId
                    Core.getEventBus().publish("sap.ushell", "appClosed", oFrom);
                    return oHandlers.store(oFrom, sBBStorageId);
                }
            }
            // in this case the destroy of the currently running application, so we do not need to pass the sCacheId
            return oHandlers.destroy(oFrom);
        };

        this.handleExitApplication = function (sFromId, oFrom, sToId, oTo, isHomePage) {
            var that = this,
                bIsAppOfTypeCachable,
                oPromiseAppClose,
                oDeferredAppClose;

            if (sToId && oTo && oTo.getIframeReusedForApp && oTo.getIframeReusedForApp() === true) {
                oTo.setProperty("iframeReusedForApp", false, true);
                Application.postMessageToIframeApp(oTo, "sap.ushell.sessionHandler", "afterApplicationShow", {}, false);
            }

            if (sFromId && oFrom) { // FIXME oFrom.getApplicationType is not defined for Homepage and AppFinder in case disableHomeAppCache is true
                if (oFrom.getUrl() && BlueBoxHandler.isStatefulContainerSupported(BlueBoxHandler.getStateFul(oFrom.getUrl()))) {
                    // Update the code to load stateful according
                    oPromiseAppClose = this.handleExitStateful(sFromId, oFrom, isHomePage);
                } else if (Storage.get(sFromId)) {
                    if (RelatedServices.isBackNavigation() === true && !isHomePage) {
                        oDeferredAppClose = new jQuery.Deferred();
                        this.destroy(sFromId, oFrom, oDeferredAppClose);
                        oPromiseAppClose = oDeferredAppClose.promise();
                    } else {
                        this.store(sFromId);
                    }

                    Core.getEventBus().publish("sap.ushell", "appClosed", oFrom);
                } else if (oFrom.getIsStateful && oFrom.getIsStateful()) {
                    //support lifecycle for statfull applciations.
                    //In case of navigation to home or appFinder, end the SAP gui session
                    if (isHomePage) {
                        oPromiseAppClose = oFrom.postMessageRequest("sap.gui.triggerCloseSessionImmediately");
                    }
                } else {
                    bIsAppOfTypeCachable = aCachedAppTypes.indexOf(oFrom.getApplicationType) >= 0;

                    //distroy the application and its resources
                    if (this.isAppOfTypeCached(sFromId, bIsAppOfTypeCachable) === false) {
                        oDeferredAppClose = new jQuery.Deferred();
                        this.destroy(sFromId, oFrom, oDeferredAppClose);
                        oPromiseAppClose = oDeferredAppClose.promise();
                    }
                }

                if (isHomePage === true) {
                    if (oPromiseAppClose === undefined) {
                        this.closeKeepAliveApps(fnCloseKeepAliveIfRestricted);
                    } else {
                        oPromiseAppClose.then(function () {
                            that.closeKeepAliveApps(fnCloseKeepAliveIfRestricted);
                        });
                    }
                }

                //handle the case of appFiner
                if (sFromId.indexOf("Shell-appfinder-component") > 0) {
                    Core.getEventBus().publish("sap.ushell", "appFinderAfterNavigate");
                }
            }

            Core.getEventBus().publish("relatedServices", "resetBackNavigation");

            if (oPromiseAppClose === undefined) {
                oPromiseAppClose = new jQuery.Deferred().resolve().promise();
            }

            return oPromiseAppClose;
        };

        function fnCloseKeepAliveIfRestricted (oApp) {
            return (oApp.value.keepAliveMode === oKeepAliveModes.RESTRICTED);
        }

        this.closeKeepAliveApps = function (fnFilterApps, arrClosePromises) {
            try {
                var that = this,
                    arrKeepAliveRestrictedApps = [];

                Storage.forEach(function (oApp) {
                    if (fnFilterApps.apply(this, [oApp]) === true) {
                        arrKeepAliveRestrictedApps.push(oApp.value);
                    }
                });
                arrKeepAliveRestrictedApps.forEach(function (oRestrictedApp) {
                    var oDeferredAppClose;
                    if (arrClosePromises) {
                        oDeferredAppClose = new jQuery.Deferred();
                        arrClosePromises.push(oDeferredAppClose.promise());
                    }
                    that.destroy(oRestrictedApp.appId, oRestrictedApp.container, oDeferredAppClose);
                });
            } catch (e) {
                Log.error("Error: sap.ushell.services.appLifeCycle.closeOtherKeepAliveRestrictedApps:" + e);
            }
        };

        this.onBeforeNavigate = function (sFromId, oFrom, sToId, oTo) {
            if (sFromId && oFrom) {
                if (oFrom._getIFrame && oFrom._getIFrame() &&
                    (BlueBoxHandler.isStatefulContainerSupported(BlueBoxHandler.getStateFul(oFrom.getUrl())) ||
                     Storage.get(sFromId) ||
                     (oFrom.getIsStateful && oFrom.getIsStateful()))) {
                    Application.postMessageToIframeApp(oFrom, "sap.ushell.sessionHandler", "beforeApplicationHide", {}, false);
                }
            }
        };

        //call lifecycle interface "setInitialConfiguration"
        this.onAfterNavigate = function (sFromId, oFrom, sToId, oTo) {
            //destroy the application if not cached or marked for reuse.
            var bIsShellApps = sToId.indexOf("Shell-appfinder-component") > 0
                || sToId.indexOf("Shell-home-component") > 0
                || sToId.indexOf("pages-component-container") > 0
                || sToId.indexOf("homeApp-component-container") > 0
                || sToId.indexOf("workPageRuntime-component-container") > 0
                || sToId.indexOf("runtimeSwitcher-component-container") > 0;

            this.handleExitApplication(sFromId, oFrom, sToId, oTo, bIsShellApps);
            if (bIsShellApps === true) {
                Application.setActiveAppContainer(undefined);
            }

            // invoke the life cycle interface "setInitialConfiguration" for the restored application
            if (sToId) {
                if (Storage.get(sToId)) {
                    this.restore(sToId);
                } else {
                    // this application is not cached
                    // here we can place code that handles the starting of the application in the after navigation life cycle.
                }
            }
        };

        this.storeApp = function (appId, oContainer, oTarget, sFixedShellHash, oKeepAliveMode) {
            if (!this.isAppInCache(appId)) {
                if (oContainer.setProperty) {
                    oContainer.setProperty("isKeepAlive", true, true);
                }
                Storage.set(appId, {
                    service: {},
                    shellHash: sFixedShellHash,
                    appId: appId,
                    stt: "loading",
                    appRelatedElements: RelatedShellElements.getAppRelatedElement(),
                    container: oContainer,
                    meta: AppConfiguration.getMetadata(oTarget),
                    app: undefined,
                    keepAliveMode: oKeepAliveMode && (oKeepAliveMode.globalValue || oKeepAliveMode.paramValue),
                    appTarget: oTarget,
                    ui5ComponentName: oTarget && oTarget.ui5ComponentName,
                    enableRouterRetrigger: true,
                    stateStored: false
                });
                oIntentToStorageId[sFixedShellHash] = appId;
                // if (BlueBoxHandler.isStatefulContainerSupported(oContainer)) {
                //in case of stateful container - map BlueBox to storageKey
                BlueBoxHandler.setStorageKey(oContainer, appId);
                // }

                return true;
            }
            return false;
        };

        this.restoreApp = function (appId) {
            if (this.isAppInCache(appId)) {
                oCurrentApplication = Storage.get(appId);

                if (BlueBoxHandler.getStorageKey(oCurrentApplication.container)) {
                    //in case of stateful container - override BlueBox to storageKey
                    BlueBoxHandler.setStorageKey(oCurrentApplication.container, appId);
                }
                // TODO restore meta
                // restore elements model
                // restore appState
                // restore all related application resources
            }
        };

        this.isAppOfTypeCached = function (appId, bIsAppOfTypeCachable, oKeepAliveMode) {
            var sKeepAlive;

            //handle the root intent
            if (!disableHomeAppCache && appId.indexOf(sRootIntent) !== -1) {
                return true;
            }
            if (!disableHomeAppCache && appId.indexOf("Shell-appfinder") !== -1) { // TODO consider to make intent configurable
                return true;
            }
            //TODO add by configuration a list of persisted applications

            //In order to enable application to play with the keep alive, we read the keep attribute of the hash, if it is true application is cachable.
            sKeepAlive = UriParameters.fromURL(window.location.href).get("sap-keep-alive");
            if (sKeepAlive === oKeepAliveModes.FULL || sKeepAlive === oKeepAliveModes.RESTRICTED) {
                if (oKeepAliveMode) {
                    oKeepAliveMode.globalValue = sKeepAlive;
                }
                return true;
            }
            return false;
        };

        this.isCachedEnabledAsAppParameter = function (oShellHash, oTarget, oKeepAliveMode) {
            var sKeepAlive;

            //temporary fix for issue found in keep alive fiori apps when stateful container
            //is used (meaning - fiori keep alive apps in cFLP). At the moment
            //it will not be supported until the issue will be solved
            //if (oTarget && oTarget.appCapabilities && oTarget && oTarget.appCapabilities.appFrameworkId === "UI5") {
            //    return false;
            //}

            sKeepAlive = oShellHash && oShellHash.params && oShellHash.params["sap-keep-alive"];
            if (sKeepAlive === oKeepAliveModes.FULL || sKeepAlive === oKeepAliveModes.RESTRICTED) {
                if (oKeepAliveMode) {
                    oKeepAliveMode.paramValue = sKeepAlive;
                }
                return true;
            }

            if (oTarget && oTarget.url) {
                sKeepAlive = UriParameters.fromURL(oTarget.url).get("sap-keep-alive");
                if (sKeepAlive === oKeepAliveModes.FULL || sKeepAlive === oKeepAliveModes.RESTRICTED) {
                    if (oKeepAliveMode) {
                        oKeepAliveMode.paramValue = sKeepAlive;
                    }
                    return true;
                }
            }

            return false;
        };

        this.calculateAppType = function (oTarget) {
            if (oTarget.applicationType === "URL" && oTarget.additionalInformation && oTarget.additionalInformation.startsWith("SAPUI5.Component=")) {
                return "SAPUI5";
            }
            return oTarget.applicationType;
        };

        this.getStatefulCapabilities = function (oTarget) {
            if (oTarget.appCapabilities && oTarget.appCapabilities &&
                oTarget.appCapabilities.statefulContainer) {
                return oTarget.appCapabilities.statefulContainer;
            }

            return undefined;
        };

        this.isNotifyInnerAppRouteChangeEnabled = function (oTarget) {
            if (oTarget.appCapabilities && oTarget.appCapabilities.notifyInnerAppRouteChange) {
                return true;
            }

            return false;
        };

        this.isStatefulCapabilityEnabled = function (oTarget) {
            var oStatefulCap = this.getStatefulCapabilities(oTarget);

            if (oStatefulCap && (oStatefulCap.enabled === true || oStatefulCap === true)) {
                return true;
            }

            return false;
        };

        this.isGUICapabilityEnabled = function (oTarget) {
            var oStatefulCap = this.getStatefulCapabilities(oTarget);

            if (oStatefulCap && oStatefulCap.protocol === "GUI") {
                return true;
            }

            return false;
        };

        this.isFLPCapabilityEnabled = function (oTarget) {
            return !this.isGUICapabilityEnabled(oTarget) && this.isStatefulCapabilityEnabled(oTarget);
        };

        this.isGUIStatefulCapabilityEnabled = function (oTarget) {
            return this.isGUICapabilityEnabled(oTarget) && this.isStatefulCapabilityEnabled(oTarget);
        };

        this.reloadCurrentApp = function(oData) {
            var oTmpAppContainer = BlueBoxHandler.getById(oData.sAppContainerId);
            if (oTmpAppContainer) {
                var sTmpUrl = oTmpAppContainer.getUrl();
                BlueBoxHandler.removeCapabilities(oTmpAppContainer);
                var arrKeepAliveApps = [];
                Storage.forEach(function (oApp) {
                    if (oApp.value.container === oTmpAppContainer) {
                        arrKeepAliveApps.push(oApp.key);
                    }
                });
                arrKeepAliveApps.forEach(Storage.remove);
                this.destroy(oData.sAppContainerId, oTmpAppContainer);
                BlueBoxHandler.deleteStateFul(sTmpUrl);
            }
            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigation) {
                try {
                    oShellNavigation.hashChanger.treatHashChanged(oData.sCurrentHash);
                } catch (error) {
                    Log.error("Error when trying to re-load the current displayed application", error, "sap.ushell.services.AppLifeCycle");
                }
            });
        };

        this.openApp = function (inAppId, oTarget, oShellHash, sFixedShellHash) {
            var oContainer,
                sIntent,
                bIsAppOfTypeCachable = aCachedAppTypes.indexOf(oTarget.applicationType) >= 0,
                oTmpAppContainer,
                sTmpUrl,
                oKeepAliveMode = {
                    globalValue: undefined,
                    paramValue: undefined
                };

            //format appId, the is the storage identifier
            var appId = "application" + inAppId;

            //this case will handle the stateful containers flow.
            oContainer = BlueBoxHandler.getStateFul(oTarget.url);

            if (oContainer && BlueBoxHandler.isStatefulContainerSupported(oContainer)) {
                if (this.isAppOfTypeCached(appId, bIsAppOfTypeCachable, oKeepAliveMode) ||
                    this.isCachedEnabledAsAppParameter(oShellHash, oTarget, oKeepAliveMode)) {
                    //this is the case where we have a stateful container and keep alive
                    //is cached application
                    if (!this.isAppInCache(appId)) {
                        this.storeApp(appId, oContainer, oTarget, sFixedShellHash, oKeepAliveMode);
                    }

                    this.restoreApp(appId);
                } else {
                    //create application that is not persisted and not cashed
                    oCurrentApplication = {
                        appId: appId,
                        stt: "loading",
                        container: oContainer,
                        meta: AppConfiguration.getMetadata(oTarget),
                        app: undefined
                    };
                }
            } else if (this.isAppOfTypeCached(appId, bIsAppOfTypeCachable, oKeepAliveMode) || this.isCachedEnabledAsAppParameter(oShellHash, oTarget, oKeepAliveMode)) {
                //is cached application
                if (!this.isAppInCache(appId)) {
                    //in cFLP, there night me an existing container of the same app from a different server,
                    //so we will need to destroy it to avoid duplicate id
                    sIntent = oShellHash.semanticObject + "-" + oShellHash.action;
                    oTmpAppContainer = BlueBoxHandler.getById("application-" + sIntent) || this.getControl(sIntent);
                    if (oTmpAppContainer) {
                        sTmpUrl = oTmpAppContainer.getUrl();
                        BlueBoxHandler.removeCapabilities(oTmpAppContainer);
                        this.destroy("application-" + sIntent, oTmpAppContainer);
                        BlueBoxHandler.deleteStateFul(sTmpUrl);
                    }

                    oContainer = this.createApplicationContainer(inAppId, oTarget);
                    this.storeApp(appId, oContainer, oTarget, sFixedShellHash, oKeepAliveMode);
                    BlueBoxHandler.set(oTarget.url, oContainer);
                }

                this.restoreApp(appId);
            } else if (oTarget.applicationType === "TR" || (oTarget.appCapabilities && oTarget.appCapabilities.appFrameworkId === "GUI")) {
                oContainer = this.getWebGuiV1StatefulContainer(oTarget.url);

                //in cFLP, there night me an existing container of the same app from a different server,
                //so we will need to destroy it to avoid duplicate id
                if (oShellHash) {
                    sIntent = oShellHash.semanticObject + "-" + oShellHash.action;
                    oTmpAppContainer = BlueBoxHandler.getById("application-" + sIntent) || this.getControl(sIntent);
                    if (oTmpAppContainer && (!oContainer || oTmpAppContainer !== oContainer)) {
                        sTmpUrl = oTmpAppContainer.getUrl();
                        BlueBoxHandler.removeCapabilities(oTmpAppContainer);
                        this.destroy("application-" + sIntent, oTmpAppContainer);
                        BlueBoxHandler.deleteStateFul(sTmpUrl);
                        this.removeWebGuiV1StatefulContainer(sTmpUrl);
                    }
                }

                if (!oContainer) {
                    oContainer = this.createApplicationContainer(inAppId, oTarget);
                    BlueBoxHandler.set(oTarget.url, oContainer);
                }
                //create application that is not persisted and not cashed
                oCurrentApplication = {
                    appId: appId,
                    stt: "loading",
                    container: oContainer,
                    meta: AppConfiguration.getMetadata(oTarget),
                    app: undefined
                };
            } else {
                if (oContainer) {
                    sIntent = oShellHash.semanticObject + "-" + oShellHash.action;
                    this.removeApplication(sIntent);
                } else if (oTarget.applicationType === "URL" || oTarget.applicationType === "TR" || oTarget.applicationType === "NWBC") {
                    //Temporary fix - fix duplicate app container id in cFLP
                    //explanation: in cFLP, there might be a case where there are
                    // two apps with the same Semantic object + Action, but from different
                    // backend. The stateful container mechanism does not support it.
                    // Until it is supported, and due to an urgent fix needed for a customer,
                    // we delete here the blue box and then create the new one.
                    // In future BLI, we will change the id of the container to be
                    // more unique.
                    sIntent = oShellHash.semanticObject + "-" + oShellHash.action;
                    oTmpAppContainer = BlueBoxHandler.getById("application-" + sIntent) || this.getControl(sIntent);
                    if (oTmpAppContainer) {
                        sTmpUrl = oTmpAppContainer.getUrl();
                        BlueBoxHandler.removeCapabilities(oTmpAppContainer);
                        this.destroy("application-" + sIntent, oTmpAppContainer);
                        BlueBoxHandler.deleteStateFul(sTmpUrl);
                    }
                }
                oContainer = this.createApplicationContainer(inAppId, oTarget);
                BlueBoxHandler.set(oTarget.url, oContainer);

                if (BlueBoxHandler.isCapUT(oContainer, "isFLP")) {
                    BlueBoxHandler.setCapabilities(oContainer, [
                        {
                            service: "sap.ushell.services.appLifeCycle",
                            action: "create"
                        },
                        {
                            service: "sap.ushell.services.appLifeCycle",
                            action: "destroy"
                        }
                    ]);
                }

                // //create application that is not persisted and not cashed
                oCurrentApplication = {
                    appId: appId,
                    stt: "loading",
                    container: oContainer,
                    meta: AppConfiguration.getMetadata(oTarget),
                    app: undefined
                };
            }
        };

        this.getAppMeta = function () {
            return AppMeta;
        };

        this.evict = function (oEntry) {
            var oInnerControl,
                oStorageEntry = oEntry.value,
                sAppId = oEntry.key;

            this.removeControl(sAppId);

            if (oStorageEntry.container.getUrl && oStorageEntry.container.getUrl()) {
                oInnerControl = BlueBoxHandler.getStateFul(oStorageEntry.container.getUrl());
            }

            if (oInnerControl) {
                var oHandler = BlueBoxHandler.getHandler();

                //in case this is a stateful container
                //invoke destroy the application with the ID.
                oHandler.destroy(oInnerControl, sAppId);
                //TODO: then(check number instances === 0 evict BlueBox?????Think/plugins)
            } else {
                //Once we destroy the container the application destroy will be create, no need to call Application.destroy(oStorageEntry.app)
                oStorageEntry.container.destroy();
            }
        };

        /**
         * Any event one wishes to subscribe to during the AppLifeCycle.init() call should be added here.
         * Events will only be added the first time AppLifeCycle.init() is called.
         * */
        this.addEvents = (function () {
            var hasBeenCalled = false;
            return function () {
                if (!hasBeenCalled) {
                    hasBeenCalled = true;
                    var that = this;

                    // Subscribe to events.
                    EventHub.on("disableKeepAliveRestoreRouterRetrigger").do(function (oData) {
                        var sIntent = oData.intent.semanticObject + "-" + oData.intent.action;
                        var sAppId = "application-" + sIntent;
                        if (Storage.get(sAppId)) {
                            Storage.get(sAppId).enableRouterRetrigger = oData.disable;
                        }
                    });
                    EventHub.on("setApplicationFullWidth").do(function (oData) {
                        that.setApplicationFullWidth(oData.bValue);
                    });

                    EventHub.on("reloadCurrentApp").do(function (oData) {
                        that.reloadCurrentApp(oData);
                    });
                }
            };
        }());

        this.init = function (inAppState, oInViewPortContainer, inSRootIntent, inDisableHomeAppCache, oShellUIServiceChange, aActions, oCacheConfigurations) {
            var that = this,
                nCacheSize;

            // calculate Cache size
            if (Device.system.phone) {
                nCacheSize = 10;

                if (oCacheConfigurations && oCacheConfigurations.limit && oCacheConfigurations.limit.phone) {
                    nCacheSize = oCacheConfigurations.limit.phone;
                }
            } else if (Device.system.tablet) {
                nCacheSize = 10;

                if (oCacheConfigurations && oCacheConfigurations.limit && oCacheConfigurations.limit.tablet) {
                    nCacheSize = oCacheConfigurations.limit.tablet;
                }
            } else if (Device.system.desktop) {
                nCacheSize = 15;

                if (oCacheConfigurations && oCacheConfigurations.limit && oCacheConfigurations.limit.desktop) {
                    nCacheSize = oCacheConfigurations.limit.desktop;
                }
            } else {
                nCacheSize = 10;
            }

            oShellUIService = new ShellUIService({
                scopeObject: oShellUIServiceChange.ownerComponent,
                scopeType: "component"
            });

            appState = inAppState;
            oViewPortContainer = oInViewPortContainer;
            sRootIntent = inSRootIntent;
            AppMeta.init(sRootIntent);
            disableHomeAppCache = inDisableHomeAppCache;

            BlueBoxHandler.init({
                oShellUIService: oShellUIService
            }, oCacheConfigurations, this);

            //Init storage, and register evict functionality.
            Storage.init(nCacheSize, function (evictObj) {
                this.evict(evictObj);
            }.bind(this));

            //setup & register communication
            this.registerShellCommunicationHandler({
                "sap.ushell.services.appLifeCycle": {
                    oRequestCalls: {
                        create: {
                            isActiveOnly: true,
                            distributionType: ["URL"],
                            fnResponseHandler: function (oPromoise) {
                                oPromoise.then(function (oRespData) {
                                    Log.info("sap.ushell.services.appLifeCycle.create:" + oRespData);
                                }).catch(function (oError) {
                                    Log.error("Error: sap.ushell.services.appLifeCycle.create:" + oError);
                                });
                            }
                        },
                        destroy: {
                            isActiveOnly: true,
                            distributionType: ["URL"],
                            fnResponseHandler: function (oPromoise) {
                                oPromoise.then(function (oRespData) {
                                    Log.info("sap.ushell.services.appLifeCycle.destroy:" + oRespData);
                                }).catch(function (oError) {
                                    Log.error("Error: sap.ushell.services.appLifeCycle.destroy:" + oError);
                                });
                            }
                        },
                        store: {
                            isActiveOnly: true,
                            distributionType: ["URL"],
                            fnResponseHandler: function (oPromoise) {
                                oPromoise.then(function (oRespData) {
                                    Log.info("sap.ushell.services.appLifeCycle.store:" + oRespData);
                                }).catch(function (oError) {
                                    Log.error("Error: sap.ushell.services.appLifeCycle.store:" + oError);
                                });
                            }
                        },
                        restore: {
                            isActiveOnly: true,
                            distributionType: ["URL"],
                            fnResponseHandler: function (oPromoise) {
                                oPromoise.then(function (oRespData) {
                                    Log.info("sap.ushell.services.appLifeCycle.restore:" + oRespData);
                                }).catch(function (oError) {
                                    Log.error("Error: sap.ushell.services.appLifeCycle.restore:" + oError);
                                });
                            }
                        }
                    },
                    oServiceCalls: {
                        subscribe: {
                            executeServiceCallFn: function (oServiceParams) {
                                BlueBoxHandler.mapCapabilities(oServiceParams.oContainer, oServiceParams.oMessageData.body);
                                return new jQuery.Deferred().resolve({}).promise();
                            }
                        },
                        setup: {
                            executeServiceCallFn: function (oServiceParams) {
                                var oSetup = oServiceParams.oMessageData && oServiceParams.oMessageData.body,
                                    arrCap = [],
                                    sAppType = oServiceParams.oContainer.getApplicationType(),
                                    sFrameworkId = oServiceParams.oContainer.getFrameworkId(),
                                    bIgnoreStateful = false;
                                if (oSetup) {
                                    if (oServiceParams.oContainer.getIsKeepAlive() === true &&
                                        (sAppType === "GUI" || sAppType === "TR" || sAppType === "NWBC" || sAppType === "WDA" || sAppType === "WCF" ||
                                            sFrameworkId === "GUI" || sFrameworkId === "WDA" || sFrameworkId === "NWBC" || sFrameworkId === "WCF")) {
                                        bIgnoreStateful = true;
                                    }
                                    if (oSetup.isStateful === true && !bIgnoreStateful) {
                                        arrCap.push({"action":"create","service":"sap.ushell.services.appLifeCycle"});
                                        arrCap.push({"action":"destroy","service":"sap.ushell.services.appLifeCycle"});
                                    }
                                    if (oSetup.isIframeValid === true) {
                                        arrCap.push({"action":"iframeIsValid","service":"sap.ushell.appRuntime"});
                                    }
                                    if (oSetup.isIframeBusy === true) {
                                        arrCap.push({"action":"iframeIsBusy","service":"sap.ushell.appRuntime"});
                                    }
                                    if (oSetup.session && oSetup.session.bLogoutSupport === true) {
                                        arrCap.push({"action":"logout","service":"sap.ushell.sessionHandler"});
                                    }
                                    if (arrCap.length > 0) {
                                        BlueBoxHandler.mapCapabilities(oServiceParams.oContainer, arrCap);
                                    }
                                }
                                return new jQuery.Deferred().resolve().promise();
                            }
                        }
                    }
                },
                "sap.gui": {
                    oServiceCalls: {
                        loadFinished: {
                            executeServiceCallFn: function (oServiceParams) {
                                var sAppType = oServiceParams.oContainer.getApplicationType(),
                                    sFrameworkId = oServiceParams.oContainer.getFrameworkId();
                                if ((sAppType === "GUI" || sAppType === "TR" || sAppType === "NWBC" ||
                                       sFrameworkId === "GUI" || sFrameworkId === "NWBC") && oServiceParams.oContainer.getIsKeepAlive() === false) {
                                    that.setWebGuiV1StatefulContainer(oServiceParams.oContainer);
                                    oServiceParams.oContainer.setIsStateful(true);
                                    //create application that is not persisted and not cashed
                                    oCurrentApplication = {
                                        appId: oServiceParams.oContainer.getId(),
                                        stt: "loading",
                                        container: oServiceParams.oContainer,
                                        meta: undefined,
                                        app: undefined
                                    };
                                }
                                return new jQuery.Deferred().resolve({}).promise();
                            }
                        }
                    }
                }

            });

            //TODO add unsubscribe
            Core.getEventBus().subscribe("sap.ushell", "appComponentLoaded", this.onComponentCreated, this);
            Core.getEventBus().subscribe("sap.ushell", "getAppLifeCycle", this.onGetMe, this);

            RelatedShellElements.init(this.getElementsModel(), aActions);
            this.addEvents();
        };

        this.addControl = function (oControl) {
            oViewPortContainer.addCenterViewPort(oControl);
        };

        this.removeControl = function (sId) {
            var oBlueBox = BlueBoxHandler.getById(sId),
                bIsStateful = BlueBoxHandler.isStatefulContainerSupported(oBlueBox);

            if (!bIsStateful) {
                oViewPortContainer.removeCenterViewPort(sId, true);
            }
        };

        this.removeApplication = function (sIntent) {
            var oInnerControl = this.getControl(sIntent);

            if (oInnerControl) {
                this.removeControl(oInnerControl.getId());
                oInnerControl.destroy();
            }
        };

        this.getControl = function (sIntent) {
            return oViewPortContainer
                && (oViewPortContainer.getViewPortControl("centerViewPort", "application-" + sIntent)
                    || oViewPortContainer.getViewPortControl("centerViewPort", "applicationShellPage-" + sIntent));
        };

        this.getViewPortContainer = function () {
            return oViewPortContainer;
        };

        this.navTo = function (sId) {
            oViewPortContainer.navTo("centerViewPort", sId, "show");
        };

        this.getCurrentApplication = function () {
            return oCurrentApplication;
        };

        this.setApplicationFullWidth = function (bIsFull) {
            var oCurrent = this.getCurrentApplication();

            //validate that we have a valid applicationContainer
            if (oCurrent.container) {
                oCurrent.container.toggleStyleClass("sapUShellApplicationContainerLimitedWidth", !bIsFull);
            }
        };

        // FIXME: It would be better to call a function that simply
        // and intentionally loads the dependencies of the UI5
        // application, rather than creating a component and expecting
        // the dependencies to be loaded as a side effect.
        // Moreover, the comment reads "load ui5 component via shell service"
        // however that is 'not needed' since the loaded component
        // is not used. We should evaluate the possible performance
        // hit taken due to this implicit means to an end.
        this.createComponent = function (oResolvedHashFragment, oParsedShellHash) {
            function fnCloseKeepAliveIfSameUI5App (oApp) {
                return (oApp.value.ui5ComponentName === oResolvedHashFragment.ui5ComponentName);
            }
            var arrClosePromises = [],
                oDeferred = new jQuery.Deferred();

            this.shellElements().setDangling(true);
            this.closeKeepAliveApps(fnCloseKeepAliveIfSameUI5App, arrClosePromises);

            Promise.all(arrClosePromises).then(function () {
                Application.createComponent(oResolvedHashFragment, oParsedShellHash).done(oDeferred.resolve).fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        this.getAppContainer = function (sAppId, oResolvedNavigationTarget, bIsColdStart, oShellHash, sFixedShellHash) {
            oResolvedNavigationTarget.shellUIService = oShellUIService.getInterface();

            /*
             * The external navigation mode in the resolution result is calculated
             * statically, and indicates a future state. It currently answers the
             * question: "is the application going to be opened explace?".
             *
             * The target navigation mode, instead, answers the question: "was
             * the application opened explace?".
             *
             * We need to have this logic, because embedded applications do not
             * check the coldstart condition.
             */
            oResolvedNavigationTarget.targetNavigationMode = bIsColdStart ? "explace" : "inplace";

            this.openApp(sAppId, oResolvedNavigationTarget, oShellHash, sFixedShellHash);
            if (oGlobalShellCommunicationHandlers.length > 0) {
                oCurrentApplication.container.registerShellCommunicationHandler(oGlobalShellCommunicationHandlers);
            }
            if (oGlobalIframeCommunicationHandlers.UI5APP) {
                oCurrentApplication.container.setIframeHandlers(oGlobalIframeCommunicationHandlers.UI5APP);
            }
            return oCurrentApplication.container;
        };

        this.getShellUIService = function () {
            return oShellUIService;
        };

        this.initShellUIService = function (oShellUIServiceChange) {
            oShellUIService._attachHierarchyChanged(AppMeta.onHierarchyChange.bind(this));
            oShellUIService._attachTitleChanged(AppMeta.onTitleChange.bind(this));
            oShellUIService._attachRelatedAppsChanged(AppMeta.onRelatedAppsChange.bind(this));
            oShellUIService._attachBackNavigationChanged(oShellUIServiceChange.fnOnBackNavigationChange.bind(this));
        };

        this.getElementsModel = function () {
            return ElementsModel;
        };

        /**
         * In the FLP, only one container at a time can be active. If we have
         * multiple ApplicationContainers, they may still be active in the
         * background, and still be able to send/receive postMessages (e.g.,
         * change the title while the user is on the FLP home).
         *
         * Also, we distinguish between visible containers and active
         * containers. As it is desirable that when a container is being opened
         * it starts setting the FLP title for example. It results in better
         * perceived performance.
         *
         * This method sets only one container as active and de-activates all
         * other application containers around.
         *
         * @param {object} oApplicationContainer
         *   The application container to activate. Pass <code>null</code> in
         *   case no application container must be activated.
         *
         * @param {array} aAllApplicationContainers
         *   All existing application containers
         *
         * @private
         */
        this.activeContainer = function (oApplicationContainer) {
            var aAllApplicationContainers = this.getWebGuiV1AllApplicationContainers();

            // deactivate all
            aAllApplicationContainers.forEach(function (oApplicationContainerToDeactivate) {
                Log.info("Deactivating container " + oApplicationContainerToDeactivate.getId());
                oApplicationContainerToDeactivate.setActive(false);
            });

            BlueBoxHandler.forEach(function (oAppContainer) {
                if (oAppContainer && oAppContainer !== oApplicationContainer) {
                    try {
                        Log.info("Deactivating container " + oAppContainer.getId());
                        oAppContainer.setActive(false);
                    } catch (e) {
                        /* empty */
                    }
                }
            });

            if (oApplicationContainer) {
                Log.info("Activating container " + oApplicationContainer.getId());
                oApplicationContainer.setActive(true);
            }
        };

        this.showApplicationContainer = function (oApplicationContainer) {
            this.navTo(oApplicationContainer.getId());
            //Added this because in cases when navigating to the same id (can happen when stateful container, I need the on onAfterNavigate)
            if (oApplicationContainer.hasStyleClass("sapUShellApplicationContainerShiftedIframe")) {
                oApplicationContainer.toggleStyleClass("sapUShellApplicationContainerIframeHidden", false);
            } else {
                oApplicationContainer.toggleStyleClass("hidden", false);
            }
            Application.setActiveAppContainer(oApplicationContainer);
            Log.info("New application context opened successfully in an existing transaction UI session.");
        };

        this.reuseStateFulContainerAndRestore = function (oApplicationContainer, sToId, oHandler, sFixedShellHash, oTarget, bNavigationInSameStatefullContainer) {
            var that = this,
                //Get the real Storage Id according to the hash maps for the restore
                sStorageId = oIntentToStorageId[sFixedShellHash];

            if (BlueBoxHandler.getStorageKey(oApplicationContainer)) {
                //in case of stateful container - map BlueBox to storageKey
                BlueBoxHandler.setStorageKey(oApplicationContainer, sStorageId);
            }

            // invoke the life cycle interface "setInitialConfiguration" for the restored application
            return oHandler.restore(oApplicationContainer, sStorageId, oTarget, bNavigationInSameStatefullContainer)
                .then(function () {
                    that.showApplicationContainer(oApplicationContainer);
                }, function (vError) {
                    Log.error(vError && vError.message || vError);
                });
        };

        this.reuseStateFulContainer = function (oApplicationContainer, url, sToId, oHandler, sFixedShellHash, oTarget, bNavigationInSameStatefullContainer) {
            var that = this;

            //Store the storage id associated with the hash
            oIntentToStorageId[sFixedShellHash] = sToId;

            if (BlueBoxHandler.getStorageKey(oApplicationContainer)) {
                //in case of stateful container - map BlueBox to storageKey
                BlueBoxHandler.setStorageKey(oApplicationContainer, sToId);
            }

            this.initAppMetaParams();

            // invoke the life cycle interface "setInitialConfiguration" for the restored application
            return oHandler.create(oApplicationContainer, url, sToId, oTarget, bNavigationInSameStatefullContainer)
                .then(function () {
                    that.showApplicationContainer(oApplicationContainer);
                }, function (vError) {
                    Log.error(vError && vError.message || vError);
                });
        };

        this.initAppMetaParams = function () {
            if (!this.getAppMeta().getIsHierarchyChanged()) {
                oShellUIService.setHierarchy();
            }
            if (!this.getAppMeta().getIsTitleChanged()) {
                var sHash = hasher.getHash();
                if (sHash && sHash.indexOf("Shell-startIntent") === 0) {
                    oShellUIService.setTitle("", true);
                } else {
                    oShellUIService.setTitle();
                }
            }
            if (!this.getAppMeta().getIsRelatedAppsChanged()) {
                oShellUIService.setRelatedApps();
            }
            if (!isBackNavigationChanged) {
                oShellUIService.setBackNavigation();
            }
        };

        this.reuseApplicationContainer = function (oApplicationContainer, applicationType, url) {
            var that = this;
            oApplicationContainer.setProperty("iframeReusedForApp", true, true);
            return oApplicationContainer
                .setNewApplicationContext(applicationType, url)
                .then(function () {
                    that.navTo(oApplicationContainer.getId());
                    if (oApplicationContainer.hasStyleClass("sapUShellApplicationContainerShiftedIframe")) {
                        oApplicationContainer.toggleStyleClass("sapUShellApplicationContainerIframeHidden", false);
                    } else {
                        oApplicationContainer.toggleStyleClass("hidden", false);
                    }
                    Log.info("New application context opened successfully in an existing transaction UI session.");
                }, function (vError) {
                    Log.error(vError && vError.message || vError);
                });
        };

        this.createApplicationContainer = function (sAppId, oResolvedNavigationTarget) {
            return Application.createApplicationContainer(sAppId, oResolvedNavigationTarget);
        };

        this.publishNavigationStateEvents = function (oAppContainer, oApplication, fnOnAfterRendering) {
            //after the app container is rendered, publish an event to notify
            //that an app was opened
            var origExit,
                sId = oAppContainer.getId ? oAppContainer.getId() : "",
                that = this;
            var appMetaData = AppConfiguration.getMetadata(),
                sIcon = appMetaData.icon,
                sTitle = appMetaData.title;

            //Attach an event handler which will be called onAfterRendering
            oAppContainer.addEventDelegate({ onAfterRendering: fnOnAfterRendering });

            //after the app container exit, publish an event to notify
            //that an app was closed
            origExit = oAppContainer.exit;
            oAppContainer.exit = function () {
                if (origExit) {
                    origExit.apply(this, arguments);
                }
                //apply the original density settings
                that.getAppMeta()._applyContentDensityByPriority();

                //wrapped in setTimeout since "publish" is not async
                setTimeout(function () {
                    // TODO: do not mutate an internal structure (in a Timeout!),
                    // create a new object
                    var oEventData = deepExtend({}, oApplication);
                    delete oEventData.componentHandle;
                    oEventData.appId = sId;
                    oEventData.usageIcon = sIcon;
                    oEventData.usageTitle = sTitle;
                    Core.getEventBus().publish("sap.ushell", "appClosed", oEventData);
                    Log.info("app was closed");
                }, 0);

                // the former code leaked an *internal* data structure, making it part of a public API
                // restrict hte public api to the minimal set of precise documented properties which can be retained under
                // under future evolutions
                var oPublicEventData = that._publicEventDataFromResolutionResult(oApplication);
                //publish the event externally
                sap.ushell.renderers.fiori2.utils.publishExternalEvent("appClosed", oPublicEventData);
            };
        };

        /**
         * Creates a new object Expose a minimal set of values to public external stakeholders
         * only expose what you can guarantee under any evolution of the unified shell on all platforms
         * @param {object} oApplication an internal result of NavTargetResolution
         * @returns {object} an object exposing certain information to external stakeholders
         */
        this._publicEventDataFromResolutionResult = function (oApplication) {
            var oPublicEventData = {};
            if (!oApplication) {
                return oApplication;
            }
            ["applicationType", "ui5ComponentName", "url", "additionalInformation", "text"].forEach(function (sProp) {
                oPublicEventData[sProp] = oApplication[sProp];
            });
            Object.freeze(oPublicEventData);
            return oPublicEventData;
        };

        this.getInMemoryInstance = function (sIntent, sFixedShellHash, sAppPart, sOldShellHash) {
            var sFullAppId = "application-" + sIntent,
                oAppEntry = Storage.get(sFullAppId),
                sOldShellHashLowerCase = "",
                bNavigateToHomepage = false,
                bNavigatingFromHomeWithAppState;

            //remove application from cache if has different parameters
            if (oAppEntry) {
                //Special case - when we're navigating from homepage to an application with state, when keep-alive
                //is active. In this case, although keep alive is active we need to destroy the application
                //ans re-open it.
                if (sOldShellHash !== null && sOldShellHash !== undefined && sOldShellHash !== "") {
                    sOldShellHashLowerCase = sOldShellHash.toLowerCase();
                    //All option to verify that we're navigating from the home page
                    bNavigateToHomepage = sOldShellHashLowerCase.indexOf("shell-home") >= 0 ||
                        sOldShellHashLowerCase.indexOf("launchpad-openflppage") >= 0 ||
                        sOldShellHashLowerCase.indexOf("launchpad-openworkpage") >= 0 ||
                        sOldShellHashLowerCase.indexOf("shell-appfinder") >= 0;
                }

                bNavigatingFromHomeWithAppState = (bNavigateToHomepage &&
                    (typeof sAppPart === "string" && sAppPart.length > 0));

                if (oAppEntry.shellHash === sFixedShellHash && !bNavigatingFromHomeWithAppState) {
                    return {
                        isInstanceSupported: true,
                        appId: oAppEntry.appId,
                        container: oAppEntry.container
                    };
                }
                return {
                    isInstanceSupported: false,
                    appId: oAppEntry.appId,
                    container: oAppEntry.container
                };
            }

            return {
                isInstanceSupported: false,
                appId: undefined,
                container: undefined
            };
        };

        this.handleOpenStateful = function (bIsInitial, bIsInCache, sToId, oInnerControl, oTarget, sFixedShellHash, oKeepAliveMode, bNavigationInSameStatefullContainer) {
            var oHandler = BlueBoxHandler.getHandler(),
                oPromise;

            oInnerControl.setProperty("iframeReusedForApp", true, true);
            if (Storage.get(sToId) && bIsInitial === false) {
                oPromise = this.reuseStateFulContainerAndRestore(oInnerControl, sToId, oHandler, sFixedShellHash, oTarget, bNavigationInSameStatefullContainer);
            } else {
                oPromise = this.reuseStateFulContainer(oInnerControl, oTarget.url, sToId, oHandler, sFixedShellHash, oTarget, bNavigationInSameStatefullContainer);

                //creating a new application check if needs to be keep (for the keep alive), and if so store the application
                if (bIsInCache) {
                    if (!this.isAppInCache(sToId)) {
                        this.storeApp(sToId, oInnerControl, oTarget, sFixedShellHash, oKeepAliveMode);
                    }
                }
            }

            return oPromise;
        };

        this.handleControl = function (sIntent, sAppId, oShellHash, oTarget, fnWrapper, sFixedShellHash, sOldFixedShellHash) {
            var that = this,
                oInnerControl,
                bReuseStatefulContainer,
                bIsAppOfTypeCachable = aCachedAppTypes.indexOf(oTarget.applicationType) >= 0,
                sFullAppId = "application-" + sIntent,
                oCachedEntry,
                bIsInCache,
                sAppType,
                bIsInitial = false,
                bDefaultFullWidth,
                bKeptAliveApp,
                oDeferredDestroyApp,
                oDeferredOpenApp = new jQuery.Deferred(),
                oDeffedControlCreation,
                oMetadata,
                oCurrentAppContainer,
                oOldAppStorageEntry,
                oTargetAppContainer,
                oPromiseAppClose = new jQuery.Deferred().resolve().promise(),
                oKeepAliveMode = {
                    globalValue: undefined,
                    paramValue: undefined
                },
                iLastValidTimeDelta,
                oOldHash,
                sOldFullAppId,
                sCurrentPageId,
                bNavigationInSameStatefullContainer = false;

            //get the potential target stateful container and check if it's valid. if not, destroy it
            //before we try to create the new application
            oTargetAppContainer = BlueBoxHandler.getStateFul(oTarget.url);
            if (oTargetAppContainer && BlueBoxHandler.isStatefulContainerSupported(oTargetAppContainer)) {
                iLastValidTimeDelta = new Date().getTime() - oTargetAppContainer.getIsIframeValidTime().time;
                if ((BlueBoxHandler.isIframeBusySupported(oTargetAppContainer) && oTargetAppContainer.getIsIframeBusy() === true) ||
                    (BlueBoxHandler.isIframeIsValidSupported(oTargetAppContainer) && iLastValidTimeDelta >= 3500) ||
                    oTargetAppContainer.getIsInvalidIframe() === true) {
                    Log.warning(
                        "Destroying statefull container iframe due to unresponsiveness (" + oTargetAppContainer.getId() + ")",
                        "reason: " + (oTargetAppContainer.getIsIframeBusy() === true ? "iframe is still creating a different app" :
                            "no ping from the iframe in the last '" + iLastValidTimeDelta + "' ms"),
                        "sap.ushell.components.applicationIntegration.AppLifeCycle");
                    BlueBoxHandler.removeCapabilities(oTargetAppContainer);
                    this.destroy(sFullAppId, oTargetAppContainer);
                    BlueBoxHandler.deleteStateFul(oTarget.url);
                    oTargetAppContainer = undefined;
                    //in this case we do not care about the old application intent as it is currently relevant only when
                    //trying to open app in the same current stateful container
                    sOldFixedShellHash = undefined;
                }
            }

            //get previous application container for navigation within the same container
            if (typeof sOldFixedShellHash === "string") {
                oOldHash = oUrlParsing.parseShellHash(sOldFixedShellHash);
                if (oOldHash) {
                    sOldFullAppId = "application-" + oOldHash.semanticObject + "-" + oOldHash.action;
                    oOldAppStorageEntry = Storage.get(sOldFullAppId);
                }
                if (oOldAppStorageEntry) {
                    oCurrentAppContainer = oOldAppStorageEntry.container;
                } else {
                    sCurrentPageId = oViewPortContainer.getCurrentCenterPage ? oViewPortContainer.getCurrentCenterPage() : undefined;
                    if (sCurrentPageId) {
                        oCurrentAppContainer = Core.byId(sCurrentPageId);
                    }
                }
            }

            bReuseStatefulContainer = oCurrentAppContainer ? BlueBoxHandler.isStatefulContainerSupported(oCurrentAppContainer) : false;
            if (oCurrentAppContainer && oCurrentAppContainer === oTargetAppContainer && bReuseStatefulContainer) {
                if (oOldAppStorageEntry) {
                    RelatedServices.store(oOldAppStorageEntry.service);
                }
                oPromiseAppClose = this.handleExitApplication(sOldFullAppId, oCurrentAppContainer, undefined, undefined, false);
                bNavigationInSameStatefullContainer = true;
            }

            oPromiseAppClose.then(function () {
                bIsInCache = that.isAppOfTypeCached(sFullAppId, bIsAppOfTypeCachable, oKeepAliveMode) || that.isCachedEnabledAsAppParameter(oShellHash, oTarget, oKeepAliveMode);
                //set the default full width value
                sAppType = that.calculateAppType(oTarget);
                bDefaultFullWidth = ApplicationType.getDefaultFullWidthSetting(sAppType);

                oInnerControl = BlueBoxHandler.getStateFul(oTarget.url);
                bReuseStatefulContainer = BlueBoxHandler.isStatefulContainerSupported(oInnerControl);

                if (!bReuseStatefulContainer) {
                    // only clear oInnerControl in case it is not a navigation from an application to the same application
                    if (oCurrentApplication && sFullAppId !== oCurrentApplication.appId) {
                        oInnerControl = undefined;
                    }
                    oCachedEntry = Storage.get("application" + sAppId);

                    if (oCachedEntry) {
                        oInnerControl = oCachedEntry.container;
                        if (!bReuseStatefulContainer && bIsInCache && oInnerControl !== undefined) {
                            bKeptAliveApp = true;
                        }
                    }
                }

                var bFullWidthCapability, bFullWidth;
                bFullWidthCapability = oTarget.appCapabilities && oTarget.appCapabilities.fullWidth;
                oMetadata = AppConfiguration.getMetadata(oTarget);
                //Here there's a double check for the fullwidth - once as a type of boolean and one as a string.
                //This is because we found that developers configured this variable in the manifest also as a string,
                //so the checks of the oMetadata and the oTarget are to avoid regression with the use of this field.
                if (bDefaultFullWidth === true) {
                    if (oTarget.fullWidth === false || oTarget.fullWidth === "false" ||
                        oMetadata.fullWidth === false || oMetadata.fullWidth === "false" || bFullWidthCapability === false) {
                        bFullWidth = false;
                    }
                } else if (oTarget.fullWidth === true || oTarget.fullWidth === "true" ||
                    oMetadata.fullWidth === true || oMetadata.fullWidth === "true") {
                    bFullWidth = true;
                }

                if (bFullWidth === undefined) {
                    bFullWidth = bDefaultFullWidth;
                }

                if (bReuseStatefulContainer) {
                    if (!oInnerControl) {
                        oInnerControl = fnWrapper(
                            sIntent,
                            oMetadata,
                            oShellHash,
                            oTarget,
                            sAppId,
                            bFullWidth,
                            sFixedShellHash
                        );

                        that.restoreApp(oInnerControl.getId());
                        that.navTo(oInnerControl.getId());

                        bIsInitial = true;
                    }
                } else if (!that.isWebGuiV1StatefulContainer(oTarget.url) && oInnerControl && !bIsInCache) {
                    //this case this controler cant be reused and we need it to be embed, so delete it.
                    oDeferredDestroyApp = new jQuery.Deferred();
                    that.destroy(oInnerControl.getId(), oInnerControl, oDeferredDestroyApp);

                    // The immediately following method call internally calls
                    // `this.oViewPortContainer.addCenterViewPort(oAppContainer)`
                    // when `isWebGuiV1StatefulContainer` is true, and in that case
                    // `oInnerControl` will be the component control of an existing session.
                    oDeferredDestroyApp.then(function () {
                        oInnerControl = fnWrapper(
                            sIntent,
                            oMetadata,
                            oShellHash,
                            oTarget,
                            sAppId,
                            bFullWidth,
                            sFixedShellHash
                        );
                    });
                } else if (!oInnerControl) {
                    // The immediately following method call internally calls
                    // `this.oViewPortContainer.addCenterViewPort(oAppContainer)`
                    // when `isWebGuiV1StatefulContainer` is true, and in that case
                    // `oInnerControl` will be the component control of an existing session.
                    oInnerControl = fnWrapper(
                        sIntent,
                        oMetadata,
                        oShellHash,
                        oTarget,
                        sAppId,
                        bFullWidth,
                        sFixedShellHash
                    );
                }

                if (oDeferredDestroyApp === undefined) {
                    oDeferredDestroyApp = new jQuery.Deferred().resolve();
                }

                if (oInnerControl && oInnerControl.getDeffedControlCreation) {
                    oDeffedControlCreation = oInnerControl.getDeffedControlCreation();
                } else {
                    oDeffedControlCreation = Promise.resolve();
                }

                /**
                 * The code below should have been written with Promise.all, but as a result
                 * of a failure in shell.qunit.js, it was written in the way below (the only way that the
                 * qunit works.
                 * Later, the qunit should be analyzed to check how to fix it (the main issue is that the
                 * tests run in parallel and there is a dependency between them.
                 */
                oDeferredDestroyApp.then(function () {
                    oDeffedControlCreation.then(function () {
                        if (!that.isWebGuiV1StatefulContainer(oTarget.url) && !bReuseStatefulContainer) {
                            if (bKeptAliveApp === true) {
                                Core.getEventBus().publish("launchpad", "appOpening", oTarget);
                            }
                            that.restoreApp(oInnerControl.getId());
                            that.navTo(oInnerControl.getId());
                            if (bKeptAliveApp === true) {
                                that.initAppMetaParams();
                                Core.getEventBus().publish("sap.ushell", "appOpened", oTarget);
                            }
                        }

                        // Assuming a previously existing TR container existed and is now
                        // going to be reused, we prompt the container to load the new application context.
                        var oPromiseAsyncAppCreate = new jQuery.Deferred().resolve().promise();
                        if (bReuseStatefulContainer) {
                            //for scube - make sure the container is active before we open the app
                            //to allow post messages form the iframe to flp that are sent
                            //as part of the target resolution process
                            if (oTarget.appCapabilities && oTarget.appCapabilities.appFrameworkId === "UI5") {
                                oInnerControl.setProperty("active", true, true);
                            }
                            oPromiseAsyncAppCreate = that.handleOpenStateful(
                                bIsInitial, bIsInCache, "application" + sAppId, oInnerControl, oTarget, sFixedShellHash, oKeepAliveMode, bNavigationInSameStatefullContainer);
                        } else if (that.isWebGuiV1StatefulContainer(oTarget.url)) {
                            oPromiseAsyncAppCreate = that.reuseApplicationContainer(oInnerControl, "TR", oTarget.url);
                        }

                        oPromiseAsyncAppCreate.then(function () {
                            oViewPortContainer.switchState("Center");
                            utils.setPerformanceMark("FLP -- centerViewPort");
                            // Activate container before showing it (start reacting to postMessage calls)
                            that.activeContainer(oInnerControl);
                            oDeferredOpenApp.resolve();
                        });
                    });
                });
            });

            return oDeferredOpenApp.promise();
        };

        this.switchViewState = function (sState, bSaveLastState, sAppId) {
            var sActualState = sState,
                oStorageEntry;

            if (oActualElementsModelStateMap[sState] && oActualElementsModelStateMap[sState][appState]) {
                sActualState = oActualElementsModelStateMap[sState][appState];
            }

            var bIsCurrentStateHome = Config.last("/core/shell/model/currentState/stateName") === "home";

            if (!bIsCurrentStateHome && (!oCurrentApplication.appId || !Storage.get(oCurrentApplication.appId))) {
                ElementsModel.destroyManageQueue();
            }
            //change the application related shell model.
            oStorageEntry = Storage.get("application" + sAppId);

            if (oStorageEntry) {
                RelatedShellElements.restore(oStorageEntry);
            } else {
                RelatedShellElements.assignNew(sState);
            }

            ElementsModel.switchState(sActualState, bSaveLastState, sAppId);

            //Process Dangling UI elements.
            this.shellElements().setDangling(false);
            this.shellElements().processDangling();

            if (sState === "searchResults") {
                this.getElementsModel().setProperty("/lastSearchScreen", "");
                if (!hasher.getHash().indexOf("Action-search") === 0) {
                    var searchModel = Core.getModel("searchModel");
                    hasher.setHash("Action-search&/searchTerm=" +
                        searchModel.getProperty("/uiFilter/searchTerms") +
                        "&dataSource=" +
                        JSON.stringify(searchModel.getProperty("/uiFilter/dataSource").getJson()));
                }
            }
        };

        this.registerShellCommunicationHandler = function (oCommunicationHandler) {
            Application.registerShellCommunicationHandler(oCommunicationHandler);
        };

        this.registerIframeCommunicationHandler = function (sHandlers, sType) {
            oGlobalIframeCommunicationHandlers[sType] = sHandlers;
        };

        this.postMessageToIframeApp = function (sServiceName, sInterface, oMessageBody, bWaitForResponse) {
            //this is is a temporary check that will be removed after the issue of the central logout
            //will be implemented. In the case here, for FLP@ABAP, we do not want to send logout message to
            //CRM, WebGui and WDA iframes ifames as this is not needed. Sending it will cause an issue with the
            //main FLP logout
            function checkIfPostIsNeeded (oCurrContainer) {
                if (sServiceName === "sap.ushell.sessionHandler" && sInterface === "logout") {
                    if (oCurrContainer && oCurrContainer.getApplicationType && ",WCF,GUI,TR,WDA,".indexOf(oCurrContainer.getApplicationType()) > 0) {
                        return false;
                    }
                }
                return true;
            }

            var fnCallBackHandler,
                oContainer = Application.getActiveAppContainer(),
                bActiveContainerPostSent = false,
                aContainers = [];
            if (BlueBoxHandler.hasIFrame(oContainer) &&
                (BlueBoxHandler.isCapabilitySupported(oContainer, sServiceName, sInterface) || Application.isAppTypeSupported(oContainer, sServiceName, sInterface)) &&
                checkIfPostIsNeeded(oContainer) === true) {
                aContainers.push(
                    Application.postMessageToIframeApp(oContainer, sServiceName, sInterface, oMessageBody, bWaitForResponse)
                );
                bActiveContainerPostSent = true;
            }

            //for all other stored applications
            if (!Application.isActiveOnly(sServiceName, sInterface)) {
                BlueBoxHandler.forEach(function (OBBContainer) {
                    if (bActiveContainerPostSent === true && OBBContainer === oContainer) {
                        return;
                    }
                    if (BlueBoxHandler.hasIFrame(OBBContainer)) {
                        if ((BlueBoxHandler.isCapabilitySupported(OBBContainer, sServiceName, sInterface) || Application.isAppTypeSupported(OBBContainer, sServiceName, sInterface)) &&
                            checkIfPostIsNeeded(OBBContainer) === true) {
                            aContainers.push(
                                Application.postMessageToIframeApp(OBBContainer, sServiceName, sInterface, oMessageBody, bWaitForResponse)
                            );
                        }
                    }
                });
            }

            fnCallBackHandler = Application.getResponseHandler(sServiceName, sInterface);

            var oAllProm = Promise.all(aContainers);

            if (fnCallBackHandler) {
                fnCallBackHandler(oAllProm);
            }
            return oAllProm;
        };

        this.postMessageToIframeAppAccordingToPolicy = function (sServiceName, sInterface, oMessageBody,
                                                                 bWaitForResponse, oPolicy) {
            var fnCallBackHandler,
                oContainer = Application.getActiveAppContainer(),
                aContainers = [];

            if (BlueBoxHandler.hasIFrame(oContainer) && Application.isAppTypeSupportedByPolicy(oContainer, oPolicy)) {
                aContainers.push(
                    Application.postMessageToIframeApp(oContainer, sServiceName, sInterface, oMessageBody, bWaitForResponse)
                );
            }

            //for all other stored applications
            if (!oPolicy.isActiveOnly) {
                BlueBoxHandler.forEach(function (OBBContainer) {
                    if (BlueBoxHandler.hasIFrame(OBBContainer)) {
                        if (BlueBoxHandler.isCapabilitySupported(OBBContainer, sServiceName, sInterface) || Application.isAppTypeSupported(OBBContainer, sServiceName, sInterface)) {
                            aContainers.push(
                                Application.postMessageToIframeApp(OBBContainer, sServiceName, sInterface, oMessageBody, bWaitForResponse)
                            );
                        }
                    }
                });
            }

            fnCallBackHandler = Application.getResponseHandler(sServiceName, sInterface);

            var oAllProm = Promise.all(aContainers);

            if (fnCallBackHandler) {
                fnCallBackHandler(oAllProm);
            }
            return oAllProm;
        };

        this.setBackNavigationChanged = function (isBackNavigationChangedValue) {
            isBackNavigationChanged = isBackNavigationChangedValue;
        };

        this.getBackNavigationChanged = function () {
            return isBackNavigationChanged;
        };

        /* Start Stateful API */

        //new stateful functions

        this.parseStatefulContainerConfiguration = function () {
            oWebGuiV1StatefulCache = {};
        };

        this.isWebGuiV1StatefulContainer = function (sUrl) {
            var sKey;

            if (sUrl) {
                sKey = BlueBoxHandler._getBlueBoxCacheKey(sUrl);
                return (oWebGuiV1StatefulCache[sKey] !== undefined);
            } else {
                return false;
            }
        };

        this.getWebGuiV1StatefulContainer = function (sUrl) {
            var sKey;

            if (sUrl) {
                sKey = BlueBoxHandler._getBlueBoxCacheKey(sUrl);
                return oWebGuiV1StatefulCache[sKey];
            } else {
                return undefined;
            }
        };

        this.setWebGuiV1StatefulContainer = function (oApplicationContainer) {
            var sUrl = oApplicationContainer.getUrl(),
                sKey;

            if (sUrl) {
                sKey = BlueBoxHandler._getBlueBoxCacheKey(sUrl);
                oWebGuiV1StatefulCache[sKey] = oApplicationContainer;
            }
        };

        this.removeWebGuiV1StatefulContainer = function (oApplicationContainer) {
            var sUrl = oApplicationContainer.getUrl(),
                sKey;

            if (sUrl) {
                sKey = BlueBoxHandler._getBlueBoxCacheKey(sUrl);
                delete oWebGuiV1StatefulCache[sKey];
            }
        };

        /**
         * Finds and returns all existing application containers.
         *
         * @param {object} oWebGuiV1StatefulCache
         *  All stateful application containers
         *
         * @return {array}
         *  An array containing all the application container objects.
         */
        this.getWebGuiV1AllApplicationContainers = function () {
            return Object.keys(oWebGuiV1StatefulCache).map(function (sKey) {
                return oWebGuiV1StatefulCache[sKey];
            }).filter(function (oApplicationContainer) {
                return !!oApplicationContainer;
            });
        };

        /* End Stateful API */
    }

    return new AppLifeCycle();
}, /* bExport= */ true);
