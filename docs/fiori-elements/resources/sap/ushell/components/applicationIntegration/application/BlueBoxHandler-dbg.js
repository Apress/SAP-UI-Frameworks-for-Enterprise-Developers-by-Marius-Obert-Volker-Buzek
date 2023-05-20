// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/components/applicationIntegration/application/BlueBoxesCache",
    "sap/ushell/components/applicationIntegration/application/Application",
    "sap/ushell/components/container/ApplicationContainer",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/deepExtend",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/hasher"
], function (
    BlueBoxesCache,
    Application,
    ApplicationContainer,
    jQuery,
    deepExtend,
    Core,
    hasher
) {
    "use strict";

    function BlueBoxHandler () {
        var that = this,
            AppLifeCycle,
            oCustomCapabilitiesHandlers = {
                isStateful: {
                    handler: function (appCapabilities, oContainer) {
                        if (appCapabilities && (appCapabilities.enabled === true || appCapabilities === true)) {
                            return true;
                        }

                        return false;
                    }
                },
                isGUI: {
                    handler: function (appCapabilities, oContainer) {
                        if (appCapabilities && appCapabilities.protocol === "GUI") {
                            return true;
                        }

                        return false;
                    }
                },
                isGUIStateful: {
                    handler: function (appCapabilities, oContainer) {
                        return that.isCapUT(oContainer, "isGUI") && that.isCapUT(oContainer, "isStateful");
                    }
                },
                isFLP: {
                    handler: function (appCapabilities, oContainer) {
                        return !that.isCapUT(oContainer, "isGUI") && that.isCapUT(oContainer, "isStateful");
                    }
                }
            },
            oBlueBoxContainer = {},
            oSupportedTypes = {},
            oHandlers = {
                setup: function (oTarget, sStorageKey) {
                },

                //we dont know the app Id we pass te hole url, in the Storage we manage it using sCacheId (this is for the keep alive)
                create: function (oInnerControl, sUrl, sStorageKey, oTarget, bNavigationInSameStatefullContainer) {
                    var oDeferred = new jQuery.Deferred(),
                        oFLPParams,
                        oPostParams;

                    function callPostMessage () {
                        if (oFLPParams) {
                            oFLPParams["sap-flp-url"] = sap.ushell.Container.getFLPUrl(true);
                            oFLPParams["system-alias"] = oInnerControl.getSystemAlias();
                            oPostParams["sap-flp-params"] = oFLPParams;
                        }

                        Core.getEventBus().publish("launchpad", "appOpening", oTarget);
                        Application.postMessageToIframeApp(
                            oInnerControl, "sap.ushell.services.appLifeCycle", "create", oPostParams, true)
                            .then(function () {
                                oBlueBoxContainer[oInnerControl].currentAppTarget = oTarget;
                                sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                                    if (bNavigationInSameStatefullContainer === true) {
                                        oAppLifeCycleService.prepareCurrentAppObject("URL", undefined, false, oInnerControl);
                                    }
                                    Core.getEventBus().publish("sap.ushell", "appOpened", oTarget);
                                    oDeferred.resolve();
                                });
                            });
                    }

                    sUrl = ApplicationContainer.prototype._checkNwbcUrlAdjustment(oInnerControl, oTarget.applicationType, sUrl);
                    oPostParams = {
                        sCacheId: sStorageKey,
                        sUrl: sUrl,
                        sHash: hasher.getHash()
                    };
                    if (sUrl.indexOf("sap-iframe-hint=GUI") > 0 || sUrl.indexOf("sap-iframe-hint=WDA") > 0 || sUrl.indexOf("sap-iframe-hint=WCF") > 0) {
                        var aInfoArray = [];
                        var aKeysArray = ApplicationContainer.prototype._getParamKeys(sUrl, aInfoArray);

                        if (aKeysArray.length > 0) {
                            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCANService) {
                                oCANService.getAppStateData(aKeysArray).then(function (aDataArray) {
                                    oFLPParams = {};
                                    aInfoArray.forEach(function (item, index) {
                                        if (aDataArray[index][0]) {
                                            oFLPParams[item] = aDataArray[index][0];
                                        }
                                    });
                                    callPostMessage();
                                }, function () {
                                    callPostMessage();
                                });
                            });
                        } else {
                            oFLPParams = {};
                            callPostMessage();
                        }
                    } else {
                        callPostMessage();
                    }

                    return oDeferred.promise();
                },
                destroy: function (oInnerControl, sStorageKey) {
                    var oPromise;

                    sap.ushell.Container.setAsyncDirtyStateProvider(undefined);
                    oPromise = Application.postMessageToIframeApp(oInnerControl, "sap.ushell.services.appLifeCycle", "destroy", {
                        sCacheId: sStorageKey
                    }, true);

                    oPromise.then(function () {
                        Core.getEventBus().publish("sap.ushell", "appClosed", oBlueBoxContainer[oInnerControl].currentAppTarget);
                        oBlueBoxContainer[oInnerControl].currentAppTarget = undefined;
                    });
                    return oPromise;
                },
                store: function (oInnerControl, sStorageKey) {
                    var oPromise;

                    sap.ushell.Container.setAsyncDirtyStateProvider(undefined);
                    oPromise = Application.postMessageToIframeApp(oInnerControl, "sap.ushell.services.appLifeCycle", "store", {
                        sCacheId: sStorageKey
                    }, true);

                    oPromise.then(function () {
                        Core.getEventBus().publish("sap.ushell", "appClosed", oBlueBoxContainer[oInnerControl].currentAppTarget);
                        oBlueBoxContainer[oInnerControl].currentAppTarget = undefined;
                    });
                    return oPromise;
                },
                restore: function (oInnerControl, sStorageKey, oTarget, bNavigationInSameStatefullContainer) {
                    return new Promise(function (fnResolve) {
                        Core.getEventBus().publish("launchpad", "appOpening", oTarget);
                        Application.postMessageToIframeApp(oInnerControl, "sap.ushell.services.appLifeCycle", "restore", {
                            sCacheId: sStorageKey,
                            sUrl: oTarget.url,
                            sHash: hasher.getHash()
                        }, true).then(function () {
                            oBlueBoxContainer[oInnerControl].currentAppTarget = oTarget;
                            sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                                if (bNavigationInSameStatefullContainer === true) {
                                    oAppLifeCycleService.prepareCurrentAppObject("URL", undefined, false, oInnerControl);
                                }
                                Core.getEventBus().publish("sap.ushell", "appOpened", oTarget);
                                fnResolve();
                            });
                        });
                    });
                }
            },
            oBasicStatefulContainerCapabilities = [
                {
                    service: "sap.ushell.services.appLifeCycle",
                    action: "create"
                }, {
                    service: "sap.ushell.services.appLifeCycle",
                    action: "destroy"
                }
            ];

        //API:
        //
        //LRU(limit)
        //  Initialize LRU cache with default limit being 10 items
        this.init = function (oSetup, inConfig, inAppLifeCycle) {
            BlueBoxesCache.init();
            Application.init(this);
            AppLifeCycle = inAppLifeCycle;

            if (inConfig) {
                deepExtend(oSupportedTypes, inConfig.supportedTypes);
            }
        };

        this.isStatefulContainerSupported = function (oBlueBox) {
            var bIsSupported =
                this.isCapabilitySupported(oBlueBox, "sap.ushell.services.appLifeCycle", "create") &&
                this.isCapabilitySupported(oBlueBox, "sap.ushell.services.appLifeCycle", "destroy");

            return bIsSupported;
        };

        this.isKeepAliveSupported = function (oBlueBox) {
            var bIsSupported =
                this.isCapabilitySupported(oBlueBox, "sap.ushell.services.appLifeCycle", "store") &&
                this.isCapabilitySupported(oBlueBox, "sap.ushell.services.appLifeCycle", "restore");

            return bIsSupported;
        };

        this.isIframeIsValidSupported = function (oBlueBox) {
            return this.isCapabilitySupported(oBlueBox, "sap.ushell.appRuntime", "iframeIsValid");
        };

        this.isIframeBusySupported = function (oBlueBox) {
            return this.isCapabilitySupported(oBlueBox, "sap.ushell.appRuntime", "iframeIsBusy");
        };

        this.mapCapabilities = function (oContainer, aCaps) {
            this.setCapabilities(oContainer, aCaps);
        };

        this.getCapabilities = function (oBlueBox) {
            return oBlueBoxContainer[oBlueBox].oCapMap;
        };

        this.isCapabilitySupported = function (oBlueBox, sServiceName, sInterface) {
            if (oBlueBoxContainer[oBlueBox] && oBlueBoxContainer[oBlueBox].oCapMap && oBlueBoxContainer[oBlueBox].oCapMap[sServiceName]) {
                    return !!oBlueBoxContainer[oBlueBox].oCapMap[sServiceName][sInterface];
            }

            return false;
        };

        this.setCapabilities = function (oBlueBox, oCap) {
            var oCapMap;

            if (!oBlueBoxContainer[oBlueBox]) {
                this.initBlueBoxBD(oBlueBox);
            }

            if (!oBlueBoxContainer[oBlueBox].oCapMap) {
                oBlueBoxContainer[oBlueBox].oCapMap = {};
            }

            oCapMap = oBlueBoxContainer[oBlueBox].oCapMap;

            Object.keys(oCap).forEach(function (key) {
                var oCapEntry = oCap[key],
                    oCapMapService;

                if (!oCapMap[oCapEntry.service]) {
                    oCapMap[oCapEntry.service] = {};
                }

                oCapMapService = oCapMap[oCapEntry.service];

                oCapMapService[oCapEntry.action] = true;

            });

            // set stateful in order to disable rendering of container
            if (!oBlueBox.getIsStateful() && this.isStatefulContainerSupported(oBlueBox)) {
                oBlueBox.setIsStateful(true);
            }

        };

        this.removeCapabilities = function (oBlueBox) {
            if (oBlueBoxContainer[oBlueBox]) {
                oBlueBoxContainer[oBlueBox].oCapMap = {};
                oBlueBox.setIsStateful(false);
            }
        };

        this.hasIFrame = function (oBlueBox) {
            if (oBlueBox && oBlueBox._getIFrame) {
                return true;
            }

            return false;
        };

        this.initBlueBoxBD = function (oBlueBox) {
            oBlueBoxContainer[oBlueBox] = {
                BlueBox: oBlueBox
            };

        };

        this.setAppCapabilities = function (oBlueBox, oTarget) {
            if (!oBlueBoxContainer[oBlueBox]) {
                this.initBlueBoxBD(oBlueBox);
            }

            oBlueBoxContainer[oBlueBox].currentAppTarget = oTarget;
            oBlueBoxContainer[oBlueBox].appCapabilities = oTarget.appCapabilities;
            if (oTarget.appCapabilities && oTarget.appCapabilities.statefulContainer === true) {
                this.setCapabilities(oBlueBox, oBasicStatefulContainerCapabilities);
            }
        };

        this.forEach = function (callback) {
            var key;

            for (key in oBlueBoxContainer) {
                if (oBlueBoxContainer.hasOwnProperty(key)) {
                    callback(oBlueBoxContainer[key].BlueBox);
                }
            }
        };

        this.isCapByTarget = function (oTarget, attr) {
            // check if we have custom handling for this attribute
            if (oTarget.appCapabilities === undefined) {
                return false;
            }

            if (oCustomCapabilitiesHandlers[attr] && oTarget && oTarget.appCapabilities) {
                return oCustomCapabilitiesHandlers[attr].handler(oTarget.appCapabilities);
            }
            // get the attribute value from the appCapabilities
            // if not define return false
            return oTarget.appCapabilities[attr] || false;
        };

        this.isCapUT = function (oBlueBox, attr) {
            // check if we have custom handling for this attribute
            var oBBInstance = oBlueBoxContainer[oBlueBox];

            // check if we have custom handling for this attribute
            if (oBBInstance === undefined || oBBInstance.appCapabilities === undefined) {
                return false;
            }

            if (oCustomCapabilitiesHandlers[attr] && oBBInstance) {
                return oCustomCapabilitiesHandlers[attr].handler(oBBInstance.appCapabilities, oBlueBox);
            }
            // get the attribute value from the appCapabilities
            // if not define return false
            return oBBInstance.appCapabilities[attr] || false;
        };

        this.setStorageKey = function (oBlueBox, setStorageKey) {
            if (!oBlueBoxContainer[oBlueBox]) {
                this.initBlueBoxBD(oBlueBox);
            }

            oBlueBoxContainer[oBlueBox].sStorageKey = setStorageKey;
        };

        this.getStorageKey = function (oBlueBox) {
            if (!oBlueBoxContainer[oBlueBox]) {
                return undefined;
            }
            return oBlueBoxContainer[oBlueBox].sStorageKey;
        };

        this.getHandler = function () {
            return oHandlers;
        };

        this._getBlueBoxCacheKey = function (sUrl) {
            return BlueBoxesCache.getBlueBoxCacheKey(sUrl);
        };

        this.deleteStateFul = function (sUrl) {
            return this.delete(sUrl);
        };

        this.getStateFul = function (sUrl) {
            return BlueBoxesCache.get(sUrl);
        };

        this.destroyApp = function (sAppId) {
            AppLifeCycle.postMessageToIframeApp("sap.ushell.services.appLifeCycle", "destroy", {
                appId: sAppId
            });
        };

        this.openApp = function (sAppId) {
            AppLifeCycle.postMessageToIframeApp("sap.ushell.services.appLifeCycle", "create", {
                appId: sAppId,
                sHash: hasher.getHash()
            });
        };

        this.storeApp = function (sAppId) {
            AppLifeCycle.postMessageToIframeApp("sap.ushell.services.appLifeCycle", "store", {
                appId: sAppId,
                sHash: hasher.getHash()
            });
        };

        this.restoreApp = function (sAppId) {
            AppLifeCycle.postMessageToIframeApp("sap.ushell.services.appLifeCycle", "restore", {
                appId: sAppId,
                sHash: hasher.getHash()
            });
        };

        //delete(sUrl)
        //  delete a single entry from the cols start cache
        this.delete = function (sUrl) {
            BlueBoxesCache.remove(sUrl);
        };


        //get(sUrl)
        //  Retrieve a single entry from the cols start cache
        this.get = function (sUrl) {
            return BlueBoxesCache.get(sUrl);
        };

        this.getById = function (sId) {
            return BlueBoxesCache.getById(sId);
        };

        //set(key, value)
        //  Change or add a new value in the cache
        //  We overwrite the entry if it already exists
        this.set = function (sUrl, oIframe) {
            BlueBoxesCache.add(sUrl, oIframe);
        };
    }

    return new BlueBoxHandler();
}, /* bExport= */ true);
