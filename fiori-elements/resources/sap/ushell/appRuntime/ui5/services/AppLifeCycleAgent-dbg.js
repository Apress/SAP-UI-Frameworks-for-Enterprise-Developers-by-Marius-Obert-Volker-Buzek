// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/base/util/extend",
    "sap/base/util/UriParameters",
    "sap/ui/thirdparty/URI",
    "sap/ui/Device",
    "sap/ui/core/BusyIndicator",
    "sap/ushell/appRuntime/ui5/performance/FesrEnhancer",
    "sap/ushell/EventHub",
    "sap/base/Log",
    "sap/ui/thirdparty/hasher",
    "sap/ui/core/Core",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/base/assert",
    "sap/ushell/resources"
], function (
    AppRuntimePostMessageAPI,
    AppRuntimeService,
    extend,
    UriParameters,
    URI,
    Device,
    BusyIndicator,
    FesrEnhancer,
    EventHub,
    Log,
    hasher,
    Core,
    oUrlParsing,
    AppRuntimeContext,
    assert,
    resources
) {

    "use strict";

    function AppLifeCycleAgent () {
        var that = this,
            sAppResolutionModule,
            oAppResolution,
            bEnableAppResolutionCache = true,
            oAppResolutionCache = {},
            fnCreateApplication,
            oCachedApplications = {},
            oRouterDisableRetriggerApplications = {},
            oAppDirtyStateProviders = {},
            oAppBackNavigationFunc = {},
            oRunningApp,
            fnRenderApp,
            oShellUIService,
            sDatalossMessage,
            oShellNavigationService;

        /**
         * @private
         */
        this.init = function (sModule, ofnCreateApplication, ofnRenderApp, bEnableCache, sAppId, oAppInfo) {
            sAppResolutionModule = sModule;
            fnCreateApplication = ofnCreateApplication;
            fnRenderApp = ofnRenderApp;
            if (bEnableCache !== undefined) {
                bEnableAppResolutionCache = bEnableCache;
            }
            this.addAppInfoToCache(sAppId, oAppInfo);

            // register this create & destroy as a appLifeCycleCommunication handler
            AppRuntimePostMessageAPI.registerCommHandlers({
                "sap.ushell.services.appLifeCycle": {
                    oServiceCalls: {
                        create: {
                            executeServiceCallFn: function (oMessageData) {
                                var oMsg = JSON.parse(oMessageData.oMessage.data);
                                return that.create(oMsg);
                            }
                        },
                        destroy: {
                            executeServiceCallFn: function (oMessageData) {
                                var oMsg = JSON.parse(oMessageData.oMessage.data);
                                return that.destroy(oMsg);
                            }
                        },
                        store: {
                            executeServiceCallFn: function (oMessageData) {
                                var oMsg = JSON.parse(oMessageData.oMessage.data);
                                return that.store(oMsg);
                            }
                        },
                        restore: {
                            executeServiceCallFn: function (oMessageData) {
                                var oMsg = JSON.parse(oMessageData.oMessage.data);
                                return that.restore(oMsg);
                            }
                        }
                    }
                }
            });
            EventHub.on("disableKeepAliveRestoreRouterRetrigger").do(function (oData) {
                if (oData.componentId && oRouterDisableRetriggerApplications[oData.componentId]) {
                    oRouterDisableRetriggerApplications[oData.componentId] = oData.disable;
                }
            });

            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.appLifeCycle.setup", {
                    isStateful: true,
                    isKeepAlive: true,
                    isIframeValid: true,
                    isIframeBusy: true
                });

            //handle dirty state confirmation dialog within the iframe and not
            //in the outer shell
            if (!resources.browserI18n) {
                resources.browserI18n = resources.getTranslationModel(window.navigator.language).getResourceBundle();
            }
            sDatalossMessage = resources.browserI18n.getText("dataLossExternalMessage");
            window.onbeforeunload = function () {
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getDirtyFlag()) {
                    return sDatalossMessage;
                }
                return undefined;
            };
        };

        /**
         * @private
         */
        this.create = function (oMsg) {
            return new Promise(function (fnResolve, fnReject) {
                var sUrl,
                    sAppId,
                    sAppIntent;

                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.appRuntime.iframeIsBusy", {
                        bValue: true
                    });
                FesrEnhancer.startInteraction();

                sUrl = oMsg.body.sUrl;
                if (AppRuntimeContext.getIsScube()) {
                    sAppIntent = UriParameters.fromURL(sUrl).get("sap-remote-intent");
                    assert(typeof sAppIntent === "string", "AppLifeCycleAgent::create - sAppIntent must be string");
                } else {
                    sAppId = UriParameters.fromURL(sUrl).get("sap-ui-app-id");
                    assert(typeof sAppId === "string", "AppLifeCycleAgent::create - sAppId must be string");
                }

                hasher.disableCFLPUpdate = true;
                hasher.replaceHash(oMsg.body.sHash);
                hasher.disableCFLPUpdate = false;

                //BusyIndicator work in hidden iframe only in chrome
                if (Device.browser.chrome) {
                    BusyIndicator.show(0);
                }
                if (oShellUIService) {
                    oShellUIService._resetBackNavigationCallback();
                }
                Core.getEventBus().publish("launchpad", "appOpening", {});
                that.getAppInfo(sAppId, sUrl, sAppIntent).then(function (values) {
                    that.expandSapIntentParams(new URI(sUrl).query(true)).then(function (oURLParameters) {
                        fnCreateApplication(sAppId, oURLParameters, values.oResolvedHashFragment, sAppIntent, values.oParsedHash)
                            .then(function (oResolutionResult) {
                                fnRenderApp(oResolutionResult);
                                AppRuntimeService.sendMessageToOuterShell(
                                    "sap.ushell.appRuntime.iframeIsBusy", {
                                        bValue: false
                                    });
                                Core.getEventBus().publish("sap.ushell", "appOpened", {});
                                fnResolve();
                            });
                    });
                });
            });
        };

        /**
         * @private
         */
        this.destroy = function (oMsg) {
            function appDestroy (oApplication) {
                var sAppId = oApplication.sId || "<unkown>";
                try {
                    oApplication.destroy();
                } catch (e) {
                    Log.error("exception when trying to close sapui5 application with id '" + sAppId +
                        "' when running inside the appruntim iframe '" + document.URL +
                            "'. This error must be fixed in order for the iframe to operate properly.\n",
                        e.stack,
                        "sap.ushell.appRuntime.ui5.services.AppLifeCycleAgent::destroy");
                }
            }

            if (oRunningApp === undefined) {
                AppRuntimeService.sendMessageToOuterShell("sap.ushell.appRuntime.isInvalidIframe", {bValue: true});
                return Promise.resolve();
            }

            var sStorageKey = oMsg.body.sCacheId;

            if (sStorageKey && oCachedApplications[sStorageKey]) {
                if (oCachedApplications[sStorageKey] === oRunningApp) {
                    oRunningApp = undefined;
                }
                delete oRouterDisableRetriggerApplications[oCachedApplications[sStorageKey].sId];
                appDestroy(oCachedApplications[sStorageKey]);
                delete oCachedApplications[sStorageKey];
            } else if (oRunningApp) {
                delete oRouterDisableRetriggerApplications[oRunningApp.sId];
                appDestroy(oRunningApp);
                oRunningApp = undefined;
            }
            sap.ushell.Container.cleanDirtyStateProviderArray();
            if (oShellUIService) {
                oShellUIService._resetBackNavigationCallback();
            }
            FesrEnhancer.setAppShortId();
            Core.getEventBus().publish("sap.ushell", "appClosed", {});

            return Promise.resolve();
        };

        /**
         * @private
         */
        this.store = function (oMsg) {
            var sStorageKey = oMsg.body.sCacheId,
                oCachedEntry = oRunningApp,
                oApp;

            if (oRunningApp === undefined) {
                AppRuntimeService.sendMessageToOuterShell("sap.ushell.appRuntime.isInvalidIframe", {bValue: true});
                return Promise.resolve();
            }

            oCachedApplications[sStorageKey] = oCachedEntry;
            if (oShellUIService) {
                oAppBackNavigationFunc[sStorageKey] = oShellUIService._getBackNavigationCallback();
            }

            oApp = oCachedEntry.getComponentInstance();
            oCachedEntry.setVisible(false);

            // keep application's dirty state providers when stored
            if (sap.ushell.Container) {
                oAppDirtyStateProviders[sStorageKey] = sap.ushell.Container.getAsyncDirtyStateProviders();
                sap.ushell.Container.cleanDirtyStateProviderArray();
            }

            if (oApp) {
                if (oApp.isKeepAliveSupported && oApp.isKeepAliveSupported() === true) {
                    oApp.deactivate();
                } else {
                    if (oApp.suspend) {
                        oApp.suspend();
                    }
                    if (oApp.getRouter && oApp.getRouter()) {
                        oApp.getRouter().stop();
                    }
                }
            }
            Core.getEventBus().publish("sap.ushell", "appClosed", {});

            return Promise.resolve();
        };

        /**
         * @private
         */
        this.restore = function (oMsg) {
            var sStorageKey = oMsg.body.sCacheId,
                oCachedEntry = oCachedApplications[sStorageKey],
                oApp = oCachedEntry.getComponentInstance(),
                bRouterDisableRetrigger = oRouterDisableRetriggerApplications[oCachedEntry.sId];

            hasher.disableCFLPUpdate = true;
            hasher.replaceHash(oMsg.body.sHash);
            hasher.disableCFLPUpdate = false;

            Core.getEventBus().publish("launchpad", "appOpening", {});
            oCachedEntry.setVisible(true);

            // re-register application's dirty state providers when restored
            if (oAppDirtyStateProviders[sStorageKey] && sap.ushell.Container) {
                sap.ushell.Container.setAsyncDirtyStateProviders(oAppDirtyStateProviders[sStorageKey]);
            }
            if (oShellUIService) {
                oShellUIService.setBackNavigation(oAppBackNavigationFunc[sStorageKey]);
            }

            if (oApp) {
                if (oApp.isKeepAliveSupported && oApp.isKeepAliveSupported() === true) {
                    oApp.activate();
                } else {
                    if (oApp.restore) {
                        oApp.restore();
                    }
                    if (oApp.getRouter && oApp.getRouter() && oApp.getRouter().initialize) {
                        if (bRouterDisableRetrigger === false) {
                            oApp.getRouter().initialize();
                        } else {
                            oApp.getRouter().initialize(true);
                        }
                    }
                }

                oRunningApp = oCachedEntry;
            }
            Core.getEventBus().publish("sap.ushell", "appOpened", {});

            return Promise.resolve();
        };

        /**
         * @private
         */
        this.expandSapIntentParams = function (oUrlParameters) {
            return new Promise(function (fnResolve, fnReject) {
                if (oUrlParameters.hasOwnProperty("sap-intent-param")) {
                    var sAppStateKey = oUrlParameters["sap-intent-param"];
                    AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { sAppStateKey: sAppStateKey })
                        .then(function (sParameters) {
                            delete oUrlParameters["sap-intent-param"];
                            var oUrlParametersExpanded = extend({}, oUrlParameters, (new URI("?" + sParameters)).query(true), true);
                            fnResolve(oUrlParametersExpanded);
                        }, function (sError) {
                            fnResolve(oUrlParameters);
                        });
                } else {
                    fnResolve(oUrlParameters);
                }
            });
        };

        /**
         * @private
         */
        this.addAppParamsToIntent = function (sUrl, sAppIntent) {
            return that.expandSapIntentParams(new URI(sUrl).query(true)).then(function (oURLParameters) {
                return that.getApplicationParameters(oURLParameters);
            });
        };

        /**
         * @private
         */
        this.getApplicationParameters = function (oURLParameters) {
            return new Promise(function (fnResolve) {
                var oStartupParameters,
                    sSapIntentParam,
                    sStartupParametersWithoutSapIntentParam;

                function buildFinalParamsString (sSimpleParams, sIntentParams) {
                    var sParams = "";
                    if (sSimpleParams && sSimpleParams.length > 0) {
                        sParams = (sSimpleParams.startsWith("?") ? "" : "?") + sSimpleParams;
                    }
                    if (sIntentParams && sIntentParams.length > 0) {
                        sParams += (sParams.length > 0 ? "&" : "?") + sIntentParams;
                    }
                    return sParams;
                }

                if (oURLParameters.hasOwnProperty("sap-startup-params")) {
                    oStartupParameters = (new URI("?" + oURLParameters["sap-startup-params"])).query(true);
                    if (oStartupParameters.hasOwnProperty("sap-intent-param")) {
                        sSapIntentParam = oStartupParameters["sap-intent-param"];
                        delete oStartupParameters["sap-intent-param"];
                    }
                    sStartupParametersWithoutSapIntentParam = (new URI("?")).query(oStartupParameters).toString();

                    //Handle the case when the parameters that were sent to the application were more than 1000 characters and in
                    //the URL we see a shorten value of the parameters
                    if (sSapIntentParam) {
                        AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { sAppStateKey: sSapIntentParam })
                            .then(function (sMoreParams) {
                                fnResolve(buildFinalParamsString(sStartupParametersWithoutSapIntentParam, sMoreParams));
                            }, function (sError) {
                                fnResolve(buildFinalParamsString(sStartupParametersWithoutSapIntentParam));
                            });
                    } else {
                        fnResolve(buildFinalParamsString(sStartupParametersWithoutSapIntentParam));
                    }
                } else {
                    fnResolve("");
                }
            });
        };

        /**
         * @private
         */
        this.getAppInfo = function (appId, sUrl, sAppIntent) {
            return new Promise(function (fnResolve) {
                if (sAppIntent) {
                    that.addAppParamsToIntent(sUrl, sAppIntent).then(function (sParams) {
                        if (sParams.length > 0) {
                            //remove un-needed parameters from the parameters list before the target resolution
                            sParams = new URI(sParams)
                                .removeSearch("sap-remote-system")
                                .removeSearch("sap-ushell-defaultedParameterNames")
                                .toString();
                        }
                        sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolution) {
                            oNavTargetResolution.resolveHashFragmentLocal("#" + sAppIntent + sParams)
                                .done(function (oResolvedHashFragment) {
                                    var oParsedHash = oUrlParsing.parseShellHash("#" + sAppIntent + sParams);
                                    fnResolve({
                                        oResolvedHashFragment: oResolvedHashFragment,
                                        oParsedHash: oParsedHash
                                    });
                                })
                                .fail(function (sMsg) {
                                    //oDeferred.reject(sMsg);
                                });
                        });
                    });
                } else {
                    var fnGetAppInfo = function () {
                        oAppResolution.getAppInfo(appId, sUrl).then(function (oAppInfo) {
                            that.addAppInfoToCache(appId, oAppInfo);
                            fnResolve({
                                oResolvedHashFragment: oAppInfo
                            });
                        });
                    };

                    if (bEnableAppResolutionCache === true && oAppResolutionCache[appId]) {
                        fnResolve({
                            oResolvedHashFragment: JSON.parse(JSON.stringify(oAppResolutionCache[appId]))
                        });
                    } else if (oAppResolution) {
                        fnGetAppInfo();
                    } else {
                        sap.ui.require([sAppResolutionModule.replace(/\./g, "/")], function (oObj) {
                            oAppResolution = oObj;
                            fnGetAppInfo();
                        });
                    }
                }
            });
        };

        /**
         * @private
         */
        this.addAppInfoToCache = function (sAppId, oAppInfo) {
            if (sAppId && oAppInfo &&
                bEnableAppResolutionCache === true &&
                oAppResolutionCache[sAppId] === undefined) {
                oAppResolutionCache[sAppId] = JSON.parse(JSON.stringify(oAppInfo));
            }
        };

        /**
         * @private
         */
        this.setComponent = function (oApp) {
            oRunningApp = oApp;
            // Initializing the disableKeepAliveRestoreRouterRetrigger flag to true
            if (oRunningApp) {
                oRouterDisableRetriggerApplications[oRunningApp.sId] = true;
            }
        };

        /**
         * @private
         */
        this.setShellUIService = function (oService) {
            oShellUIService = oService;
        };

        /**
         * @private
         */
        this.setShellNavigationService = function (oService) {
            oShellNavigationService = oService;
        };

        /**
         * @private
         */
        this.checkDataLossAndContinue = function () {
            if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getDirtyFlag(oShellNavigationService.getNavigationContext())) {
                // eslint-disable-next-line no-alert
                if (window.confirm(sDatalossMessage)) {
                    sap.ushell.Container.setDirtyFlag(false);
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        };
    }

    return new AppLifeCycleAgent();
}, true);
