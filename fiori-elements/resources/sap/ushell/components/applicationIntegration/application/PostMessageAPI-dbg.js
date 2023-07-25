// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview defines the post message API for all applications running in iframe within the shell
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/core/library",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ui/core/UIComponent",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/EventHub",
    "sap/ushell/components/applicationIntegration/application/PostMessageAPIInterface",
    "sap/ui/thirdparty/URI",
    "sap/base/util/deepExtend",
    "sap/ushell/Config",
    "sap/ushell/utils/UrlParsing",
    "sap/ui/core/Core",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/resources",
    "sap/ushell/ui/shell/ShellHeadItem"
], function (
    utils,
    coreLib,
    jQuery,
    Log,
    UIComponent,
    AppConfiguration,
    EventHub,
    PostMessageAPIInterface,
    URI,
    deepExtend,
    Config,
    UrlParsing,
    Core,
    Button,
    mobileLibrary,
    hasher,
    resources,
    ShellHeadItem
) {
    "use strict";

    var SAP_API_PREFIX = "sap.ushell.";

    var oDummyComponent = new UIComponent();
    var URLHelper = mobileLibrary.URLHelper;
    /**
     * All APIs must start with "sap.ushell" prefix
     */
    var oAPIs = {
        "sap.ushell.services.CrossApplicationNavigation": {
            oServiceCalls: {
                hrefForExternal: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.hrefForExternalAsync(oServiceParams.oMessageData.body.oArgs, undefined, true)
                                .then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                getSemanticObjectLinks: {
                    executeServiceCallFn: function (oServiceParams) {
                        // beware sSemanticObject may also be an array of argument arrays
                        // {sSemanticObject, mParameters, bIgnoreFormFactors }
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.getSemanticObjectLinks(
                                oServiceParams.oMessageData.body.sSemanticObject, oServiceParams.oMessageData.body.mParameters,
                                oServiceParams.oMessageData.body.bIgnoreFormFactors, undefined, undefined, oServiceParams.oMessageData.body.bCompactIntents)
                                .then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                isIntentSupported: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.isIntentSupported(oServiceParams.oMessageData.body.aIntents).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                isNavigationSupported: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.isNavigationSupported(oServiceParams.oMessageData.body.aIntents).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                backToPreviousApp: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.backToPreviousApp();
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                historyBack: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.historyBack(oServiceParams.oMessageData.body.iSteps);
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                getAppStateData: {
                    executeServiceCallFn: function (oServiceParams) {
                        // note: sAppStateKey may be an array of argument arrays
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.getAppStateData(oServiceParams.oMessageData.body.sAppStateKey).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                toExternal: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred(),
                            oArgs = deepExtend({}, oServiceParams.oMessageData.body.oArgs);

                        utils.storeSapSystemToLocalStorage(oArgs);
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.toExternal(oArgs).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                registerBeforeAppCloseEvent: {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oContainer.setProperty("beforeAppCloseEvent", {
                            enabled: true,
                            params: oServiceParams.oMessageData.body},
                            true
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                expandCompactHash: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.expandCompactHash(oServiceParams.oMessageData.body.sHashFragment).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                getDistinctSemanticObjects: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.getDistinctSemanticObjects().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                getLinks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.getLinks(oServiceParams.oMessageData.body).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                getPrimaryIntent: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.getPrimaryIntent(
                                oServiceParams.oMessageData.body.sSemanticObject,
                                oServiceParams.oMessageData.body.mParameters).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                hrefForAppSpecificHash: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.hrefForAppSpecificHashAsync(oServiceParams.oMessageData.body.sAppHash).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                isInitialNavigation: {
                    executeServiceCallFn: function () {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.isInitialNavigationAsync().then(function (bIsInitialNavigation) {
                                oDeferred.resolve(bIsInitialNavigation);
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                getAppState: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.getAppState(
                                oDummyComponent,
                                oServiceParams.oMessageData.body.sAppStateKey
                            ).done(function (oState) {
                                delete oState._oServiceInstance;
                                oDeferred.resolve(oState);
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                setInnerAppRoute: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oHash = UrlParsing.parseShellHash(hasher.getHash()),
                            sNewHash;

                        //do nothing if new is exactly like the current one
                        if (oHash.appSpecificRoute === oServiceParams.oMessageData.body.appSpecificRoute) {
                            return new jQuery.Deferred().resolve().promise();
                        }
                        oHash.appSpecificRoute = oServiceParams.oMessageData.body.appSpecificRoute;
                        sNewHash = "#" + UrlParsing.constructShellHash(oHash);
                        hasher.disableBlueBoxHashChangeTrigger = true;
                        if (oServiceParams.oMessageData.body.writeHistory === true || oServiceParams.oMessageData.body.writeHistory === "true") {
                            hasher.setHash(sNewHash);
                        } else {
                            hasher.replaceHash(sNewHash);
                        }
                        hasher.disableBlueBoxHashChangeTrigger = false;
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                setInnerAppStateData: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        PostMessageAPI.prototype._createNewInnerAppState(oServiceParams).then(oDeferred.resolve);
                        return oDeferred.promise();
                    }
                },
                resolveIntent: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                            oCrossAppNavService.resolveIntent(oServiceParams.oMessageData.body.sHashFragment).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.ui5service.ShellUIService": {
            oServiceCalls: {
                setTitle: {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setTitle(oServiceParams.oMessageData.body.sTitle)).promise();
                    }
                },
                setBackNavigation: {
                    executeServiceCallFn: function (oServiceParams) {
                        return oServiceParams.executeSetBackNavigationService(oServiceParams.oMessage, oServiceParams.oMessageData);
                    }
                }
            }
        },
        "sap.ushell.services.ShellUIService": {
            oServiceCalls: {
                setTitle: {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setTitle(oServiceParams.oMessageData.body.sTitle)).promise();
                    }
                },
                setHierarchy: {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setHierarchy(oServiceParams.oMessageData.body.aHierarchyLevels)).promise();
                    }
                },
                setRelatedApps: {
                    executeServiceCallFn: function (oServiceParams) {
                        return new jQuery.Deferred().resolve(oServiceParams.oContainer.getShellUIService().setRelatedApps(oServiceParams.oMessageData.body.aRelatedApps)).promise();
                    }
                },
                setDirtyFlag: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.setDirtyFlag(oServiceParams.oMessageData.body.bIsDirty);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                showShellUIBlocker: {
                    executeServiceCallFn: function (oServiceParams) {
                        var bShow = oServiceParams.oMessageData.body.bShow;
                        showUIBlocker(bShow);
                        sap.ui.getCore().getEventBus().publish(
                            "sap.ushell.services.ShellUIService", "showShellUIBlocker",
                            { bShow: bShow }
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                getFLPUrl: {
                    executeServiceCallFn: function (oServiceParams) {
                        var bIncludeHash = false;
                        if (oServiceParams.oMessageData.body && oServiceParams.oMessageData.body.bIncludeHash === true) {
                            bIncludeHash = true;
                        }
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getFLPUrl(bIncludeHash)).promise();
                    }
                },
                getShellGroupIDs: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                            oBookmarkService.getShellGroupIDs((oServiceParams.oMessageData.body ? oServiceParams.oMessageData.body.bGetAll : undefined)).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                addBookmark: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                            oBookmarkService.addBookmarkByGroupId(oServiceParams.oMessageData.body.oParameters, oServiceParams.oMessageData.body.groupId)
                                .then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                addBookmarkDialog: {
                    executeServiceCallFn: function (oServiceParams) {
                        // do not change the ["require"] to .require. This is to avoid
                        //  adding dependencies to the core min/ext.
                        /*eslint-disable dot-notation*/
                        sap.ui["require"](["sap/ushell/ui/footerbar/AddBookmarkButton"], function (AddBookmarkButton) {
                            var dialogButton = new AddBookmarkButton();
                            dialogButton.firePress({});
                        });
                        /*eslint-enable dot-notation*/
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                getShellGroupTiles: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                            oLaunchPageService.getTilesByGroupId(oServiceParams.oMessageData.body.groupId).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                sendUrlAsEmail: {
                    executeServiceCallFn: function (oServiceParams) {
                        var sAppName = Config.last("/core/shellHeader/application").title;
                        var sSubject = (sAppName === undefined) ?
                            resources.i18n.getText("linkToApplication") :
                            resources.i18n.getText("linkTo") + " '" + sAppName + "'";
                        PostMessageAPI.prototype._sendEmail(
                            "",
                            sSubject,
                            document.URL,
                            "",
                            "",
                            document.URL,
                            true
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                sendEmailWithFLPButton: {
                    executeServiceCallFn: function (oServiceParams) {
                        var sAppName = Config.last("/core/shellHeader/application").title;
                        var sSubject = (sAppName === undefined) ?
                            resources.i18n.getText("linkToApplication") :
                            resources.i18n.getText("linkTo") + " '" + sAppName + "'";
                        PostMessageAPI.prototype._sendEmail(
                            "",
                            sSubject,
                            document.URL,
                            "",
                            "",
                            document.URL,
                            oServiceParams.oMessageData.body.bSetAppStateToPublic
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                sendEmail: {
                    executeServiceCallFn: function (oServiceParams) {
                        PostMessageAPI.prototype._sendEmail(
                            oServiceParams.oMessageData.body.sTo,
                            oServiceParams.oMessageData.body.sSubject,
                            oServiceParams.oMessageData.body.sBody,
                            oServiceParams.oMessageData.body.sCc,
                            oServiceParams.oMessageData.body.sBcc,
                            oServiceParams.oMessageData.body.sIFrameURL,
                            oServiceParams.oMessageData.body.bSetAppStateToPublic
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                processHotKey: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oEvent;
                        // IE doesn't support creating the KeyboardEvent object with a the "new" constructor, hence if this will fail, it will be created
                        // using the document object- https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent
                        // This KeyboardEvent has a constructor, so checking for its ecsitaance will not solve this, hence, only solution found is try-catch
                        try {
                            oEvent = new KeyboardEvent("keydown", oServiceParams.oMessageData.body);
                        } catch (err) {
                            var IEevent = document.createEvent("KeyboardEvent"),
                                sSpecialKeys = "";
                            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
                            if (oServiceParams.oMessageData.body.altKey) {
                                sSpecialKeys += "Alt ";
                            }
                            if (oServiceParams.oMessageData.body.ctrlKey) {
                                sSpecialKeys += "Control ";
                            }
                            if (oServiceParams.oMessageData.body.shiftKey) {
                                sSpecialKeys += "Shift ";
                            }
                            IEevent.initKeyboardEvent("keydown", false, false, null, oServiceParams.oMessageData.body.key, oServiceParams.oMessageData.body.keyCode, sSpecialKeys, 0, false);
                            oEvent = IEevent;
                        }
                        document.dispatchEvent(oEvent);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.Container": {
            oServiceCalls: {
                setDirtyFlag: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.setDirtyFlag(oServiceParams.oMessageData.body.bIsDirty);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                registerDirtyStateProvider: {
                    executeServiceCallFn: function (oServiceParams) {
                        if (oServiceParams.oMessageData.body.bRegister) {
                            PostMessageAPI.prototype.registerAsyncDirtyStateProvider(oServiceParams);
                        } else {
                            PostMessageAPI.prototype.deregisterAsyncDirtyStateProvider(oServiceParams);
                        }
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                getFLPUrl: {
                    executeServiceCallFn: function (oServiceParams) {
                        var bIncludeHash = false;
                        if (oServiceParams.oMessageData.body && oServiceParams.oMessageData.body.bIncludeHash === true) {
                            bIncludeHash = true;
                        }
                        return new jQuery.Deferred().resolve(sap.ushell.Container.getFLPUrl(bIncludeHash)).promise();
                    }
                },
                getFLPConfig: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();

                        sap.ushell.Container.getFLPConfig().then(function (oFLPConfiguration) {
                            oDeferred.resolve(oFLPConfiguration);
                        });
                        return oDeferred.promise();
                    }
                },
                getFLPPlatform: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();

                        sap.ushell.Container.getFLPPlatform().then(oDeferred.resolve);
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppState": {
            oServiceCalls: {
                getAppState: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                            oAppStateService.getAppState(
                                oServiceParams.oMessageData.body.sKey
                            ).done(function (oState) {
                                delete oState._oServiceInstance;
                                oDeferred.resolve(oState);
                            }).fail(function (oState) {
                                delete oState._oServiceInstance;
                                oDeferred.resolve(oState);
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                _saveAppState: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                            oAppStateService._saveAppState(
                                oServiceParams.oMessageData.body.sKey,
                                oServiceParams.oMessageData.body.sData,
                                oServiceParams.oMessageData.body.sAppName,
                                oServiceParams.oMessageData.body.sComponent,
                                oServiceParams.oMessageData.body.bTransient,
                                oServiceParams.oMessageData.body.iPersistencyMethod,
                                oServiceParams.oMessageData.body.oPersistencySettings).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                _loadAppState: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                            oAppStateService._loadAppState(oServiceParams.oMessageData.body.sKey).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                deleteAppState: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                            oAppStateService.deleteAppState(oServiceParams.oMessageData.body.sKey).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                makeStatePersistent: function (oServiceParams) {
                    var oDeferred = new jQuery.Deferred();
                    sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                        oAppStateService.makeStatePersistent(
                            oServiceParams.oMessageData.body.sKey,
                            oServiceParams.oMessageData.body.iPersistencyMethod,
                            oServiceParams.oMessageData.body.oPersistencySettings).then(oDeferred.resolve, oDeferred.reject);
                    });
                    return oDeferred.promise();
                }
            }
        },
        "sap.ushell.services.Bookmark": {
            oServiceCalls: {
                addBookmarkUI5: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                PostMessageAPI.prototype._stripBookmarkServiceUrlForLocalContentProvider(oServiceParams.oMessageData.body.oParameters, oSystemContext);
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.addBookmark(
                                        oServiceParams.oMessageData.body.oParameters,
                                        oServiceParams.oMessageData.body.vContainer,
                                        oSystemContext.id
                                    ).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                addBookmark: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                            oBookmarkService.addBookmarkByGroupId(
                                oServiceParams.oMessageData.body.oParameters,
                                oServiceParams.oMessageData.body.groupId).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                getShellGroupIDs: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                            oBookmarkService.getShellGroupIDs().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                addCatalogTileToGroup: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                            oBookmarkService.addCatalogTileToGroup(
                                oServiceParams.oMessageData.body.sCatalogTileId,
                                oServiceParams.oMessageData.body.sGroupId,
                                oServiceParams.oMessageData.body.oCatalogData).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                countBookmarks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.countBookmarks(
                                        oServiceParams.oMessageData.body.sUrl,
                                        oSystemContext.id).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                deleteBookmarks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.deleteBookmarks(
                                        oServiceParams.oMessageData.body.sUrl,
                                        oSystemContext.id).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                updateBookmarks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.updateBookmarks(
                                        oServiceParams.oMessageData.body.sUrl,
                                        oServiceParams.oMessageData.body.oParameters,
                                        oSystemContext.id).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                getContentNodes: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                            oBookmarkService.getContentNodes().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                addCustomBookmark: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.addCustomBookmark(
                                        oServiceParams.oMessageData.body.sVizType,
                                        oServiceParams.oMessageData.body.oConfig,
                                        oServiceParams.oMessageData.body.vContentNodes,
                                        oSystemContext.id).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                countCustomBookmarks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                oServiceParams.oMessageData.body.oIdentifier.contentProviderId = oSystemContext.id;
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.countCustomBookmarks(oServiceParams.oMessageData.body.oIdentifier).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                updateCustomBookmarks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                oServiceParams.oMessageData.body.oIdentifier.contentProviderId = oSystemContext.id;
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.updateCustomBookmarks(
                                        oServiceParams.oMessageData.body.oIdentifier,
                                        oServiceParams.oMessageData.body.oConfig).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                deleteCustomBookmarks: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                oServiceParams.oMessageData.body.oIdentifier.contentProviderId = oSystemContext.id;
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                                    oBookmarkService.deleteCustomBookmarks(oServiceParams.oMessageData.body.oIdentifier).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                },
                addBookmarkToPage: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                            oAppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                sap.ushell.Container.getServiceAsync("Bookmark").then(function (BookmarkService) {
                                    BookmarkService.addBookmarkToPage(
                                        oServiceParams.oMessageData.body.oParameters,
                                        oServiceParams.oMessageData.body.sPageId,
                                        oSystemContext.id).then(oDeferred.resolve, oDeferred.reject);
                                });
                            });
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppLifeCycle": {
            oServiceCalls: {
                getFullyQualifiedXhrUrl: {
                    executeServiceCallFn: function (oServiceParams) {
                        var result = "",
                            xhr = "",
                            oDeferred = new jQuery.Deferred(),
                            path = oServiceParams.oMessageData.body.path;

                        if (path !== "" && path !== undefined && path !== null) {
                            sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (AppLifeCycleService) {
                                AppLifeCycleService.getCurrentApplication().getSystemContext().then(function (oSystemContext) {
                                    xhr = oSystemContext.getFullyQualifiedXhrUrl(path);

                                    var sHostName = "",
                                        sProtocol = "",
                                        sPort = "",
                                        sFlpURL = sap.ushell.Container.getFLPUrl(true),
                                        oURI = new URI(sFlpURL);
                                    if (oURI.protocol() !== null && oURI.protocol() !== undefined && oURI.protocol() !== "") {
                                        sProtocol = oURI.protocol() + "://";
                                    }
                                    if (oURI.hostname() !== null && oURI.hostname() !== undefined && oURI.hostname() !== "") {
                                        sHostName = oURI.hostname();
                                    }
                                    if (oURI.port() !== null && oURI.port() !== undefined && oURI.port() !== "") {
                                        sPort = ":" + oURI.port();
                                    }

                                    result = sProtocol + sHostName + sPort + xhr;
                                    oDeferred.resolve(result);
                                });
                            });
                        }

                        return oDeferred.promise();
                    }
                },
                getSystemAlias: {
                    executeServiceCallFn: function (oServiceParams) {
                        var sSystemAlias = oServiceParams.oContainer.getSystemAlias();
                        if (sSystemAlias === null || sSystemAlias === undefined) {
                            sSystemAlias = "";
                        }

                        return new jQuery.Deferred().resolve(sSystemAlias).promise();
                    }
                },
                setNewAppInfo: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (AppLifeCycleService) {
                            AppLifeCycleService.setAppInfo(oServiceParams.oMessageData.body, true);
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                updateCurrentAppInfo: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (AppLifeCycleService) {
                            AppLifeCycleService.setAppInfo(oServiceParams.oMessageData.body, false);
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.AppConfiguration": {
            oServiceCalls: {
                setApplicationFullWidth: {
                    executeServiceCallFn: function (oServiceParams) {
                        AppConfiguration.setApplicationFullWidth(oServiceParams.oMessageData.body.bValue);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.appRuntime": {
            oRequestCalls: {
                innerAppRouteChange: {
                    isActiveOnly: true,
                    distributionType: ["all"]
                },
                keepAliveAppHide: {
                    isActiveOnly: true,
                    distributionType: ["all"]
                },
                keepAliveAppShow: {
                    isActiveOnly: true,
                    distributionType: ["all"]
                },
                hashChange: {
                    isActiveOnly: true,
                    distributionType: ["URL"]
                },
                setDirtyFlag: {
                    isActiveOnly: true,
                    distributionType: ["URL"]
                },
                getDirtyFlag: {
                    isActiveOnly: true,
                    distributionType: ["URL"]
                },
                themeChange: {
                    isActiveOnly: false,
                    distributionType: ["all"]
                },
                uiDensityChange: {
                    isActiveOnly: false,
                    distributionType: ["all"]
                }
            },
            oServiceCalls: {
                hashChange: {
                    executeServiceCallFn: function (oServiceParams) {
                        //FIX for internal incident #1980317281 - In general, hash structure in FLP is splitted into 3 parts:
                        //A - application identification & B - Application parameters & C - Internal application area
                        // Now, when an IFrame changes its hash, it sends PostMessage up to the FLP. The FLP does 2 things: Change its URL
                        // and send a PostMessage back to the IFrame. This fix instruct the Shell.Controller.js to block only
                        // the message back to the IFrame.
                        var oDeferred = new jQuery.Deferred();
                        hasher.disableBlueBoxHashChangeTrigger = true;
                        hasher.replaceHash(oServiceParams.oMessageData.body.newHash);
                        hasher.disableBlueBoxHashChangeTrigger = false;

                        //Getting the history direction, taken from the history object of UI5 (sent by the Iframe).
                        //The direction value is used to update the direction property of the UI5 history object
                        // that is running in the Iframe.
                        var sDirection = oServiceParams.oMessageData.body.direction;
                        if (sDirection) {
                            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigationService) {
                                oShellNavigationService.hashChanger.fireEvent("hashReplaced", {
                                    hash: oShellNavigationService.hashChanger.getHash(),
                                    direction: sDirection
                                });
                                Log.debug("PostMessageAPI.hashChange :: Informed by the Iframe, to change the " +
                                    "History direction property in FLP to: " + sDirection);
                                oDeferred.resolve();
                            });
                        } else {
                            oDeferred.resolve();
                        }

                        return oDeferred.promise();
                    }
                },
                iframeIsValid: {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oContainer.setProperty("isIframeValidTime", {time: new Date().getTime()}, true);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                iframeIsBusy: {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oContainer.setProperty("isIframeBusy", oServiceParams.oMessageData.body.bValue, true);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                isInvalidIframe: {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oContainer.setProperty("isInvalidIframe", oServiceParams.oMessageData.body.bValue, true);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.UserInfo": {
            oServiceCalls: {
                getThemeList: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfoService) {
                            oUserInfoService.getThemeList().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                getLanguageList: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfoService) {
                            oUserInfoService.getLanguageList().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                updateUserPreferences: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        if (oServiceParams.oMessageData.body.language) {
                            sap.ushell.Container.getUser().setLanguage(oServiceParams.oMessageData.body.language);
                            sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfoService) {
                                oUserInfoService.updateUserPreferences().then(function () {
                                    sap.ushell.Container.getUser().resetChangedProperty("language");
                                    oDeferred.resolve();
                                }, oDeferred.reject);
                            });
                        } else {
                            oDeferred.resolve();
                        }
                        return oDeferred.promise();
                    }
                },
                openThemeManager: {
                    executeServiceCallFn: function (oServiceParams) {
                        EventHub.emit("openThemeManager", Date.now());
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.ShellNavigation": {
            oServiceCalls: {
                toExternal: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigationService) {
                            oShellNavigationService.toExternal(
                                oServiceParams.oMessageData.body.oArgs,
                                undefined,
                                oServiceParams.oMessageData.body.bWriteHistory);
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                toAppHash: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigationService) {
                            oShellNavigationService.toAppHash(
                                oServiceParams.oMessageData.body.sAppHash,
                                oServiceParams.oMessageData.body.bWriteHistory);
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.NavTargetResolution": {
            oServiceCalls: {
                getDistinctSemanticObjects: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolutionService) {
                            oNavTargetResolutionService.getDistinctSemanticObjects().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                expandCompactHash: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolutionService) {
                            oNavTargetResolutionService.expandCompactHash(oServiceParams.oMessageData.body.sHashFragment).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                resolveHashFragment: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolutionService) {
                            oNavTargetResolutionService.resolveHashFragment(oServiceParams.oMessageData.body.sHashFragment).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                isIntentSupported: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolutionService) {
                            oNavTargetResolutionService.isIntentSupported(oServiceParams.oMessageData.body.aIntents).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                },
                isNavigationSupported: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolutionService) {
                            oNavTargetResolutionService.isNavigationSupported(oServiceParams.oMessageData.body.aIntents).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.Renderer": {
            oServiceCalls: {
                addHeaderItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        addRendererButton("addHeaderItem", oServiceParams);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },

                addHeaderEndItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        addRendererButton("addHeaderEndItem", oServiceParams);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },

                showHeaderItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").showHeaderItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                showHeaderEndItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").showHeaderEndItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                hideHeaderItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").hideHeaderItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                hideHeaderEndItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                setHeaderTitle: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").setHeaderTitle(
                            oServiceParams.oMessageData.body.sTitle
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                setHeaderVisibility: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").setHeaderVisibility(
                            oServiceParams.oMessageData.body.bVisible,
                            oServiceParams.oMessageData.body.bCurrentState || true,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                createShellHeadItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        var params = oServiceParams.oMessageData.body.params;
                        params.press = function () {
                            oServiceParams.oContainer.postMessageRequest(
                                "sap.ushell.appRuntime.buttonClick",
                                { buttonId: params.id }
                            );
                        };
                        /*eslint-disable no-new*/
                        new ShellHeadItem(params);
                        /*eslint-enable no-new*/
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                showActionButton: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").showActionButton(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                hideActionButton: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").hideActionButton(
                            oServiceParams.oMessageData.body.aIds,
                            oServiceParams.oMessageData.body.bCurrentState,
                            oServiceParams.oMessageData.body.aStates
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                addUserAction: {
                    executeServiceCallFn: function (oServiceParams) {
                        oServiceParams.oMessageData.body.oParameters.oControlProperties.press = function () {
                            oServiceParams.oContainer.postMessageRequest(
                                "sap.ushell.appRuntime.buttonClick",
                                { buttonId: oServiceParams.oMessageData.body.oParameters.oControlProperties.id }
                            );
                        };
                        sap.ushell.Container.getRenderer("fiori2").addUserAction(
                            oServiceParams.oMessageData.body.oParameters
                        );
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                addOptionsActionSheetButton: {
                    executeServiceCallFn: function (oServiceParams) {
                        var aButtons = Array.isArray(oServiceParams.oMessageData.body) ?
                            oServiceParams.oMessageData.body : [oServiceParams.oMessageData.body];

                        aButtons.forEach(function (oButton) {
                            if (Core.byId(oButton.id)) {
                                Core.byId(oButton.id).destroy();
                            }
                            /*eslint-disable no-new*/
                            new Button({
                                id: oButton.id,
                                text: oButton.text,
                                icon: oButton.icon,
                                tooltip: oButton.tooltip,
                                press: function () {
                                    oServiceParams.oContainer.postMessageRequest(
                                        "sap.ushell.appRuntime.buttonClick",
                                        { buttonId: oButton.id }
                                    );
                                }
                            });
                            /*eslint-enable no-new*/
                            sap.ushell.Container.getRenderer("fiori2").showActionButton(
                                [oButton.id],
                                true,
                                oButton.aStates
                            );
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                removeOptionsActionSheetButton: {
                    executeServiceCallFn: function (oServiceParams) {
                        var aButtons = Array.isArray(oServiceParams.oMessageData.body) ?
                            oServiceParams.oMessageData.body : [oServiceParams.oMessageData.body];

                        aButtons.forEach(function (oButton) {
                            sap.ushell.Container.getRenderer("fiori2").hideActionButton(
                                oButton.id,
                                true,
                                oButton.aStates
                            );
                            if (Core.byId(oButton.id)) {
                                Core.byId(oButton.id).destroy();
                            }
                        });
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                updateHeaderItem: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").updateHeaderItem(
                            oServiceParams.oMessageData.body.sId,
                            oServiceParams.oMessageData.body.oControlProperties);
                        return new jQuery.Deferred().resolve().promise();
                    }
                },
                destroyButton: {
                    executeServiceCallFn: function (oServiceParams) {
                        sap.ushell.Container.getRenderer("fiori2").destroyButton(
                            oServiceParams.oMessageData.body.aIds);
                        return new jQuery.Deferred().resolve().promise();
                    }
                }
            }
        },
        "sap.ushell.services.LaunchPage": {
            oServiceCalls: {
                getGroupsForBookmarks: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                            oLaunchPageService.getGroupsForBookmarks().then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.Menu": {
            oServiceCalls: {
                getSpacesPagesHierarchy: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("Menu").then(function (MenuService) {
                            MenuService.getSpacesPagesHierarchy().then(function (aSpacePagesHierarchy) {
                                oDeferred.resolve(aSpacePagesHierarchy);
                            });
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.CommonDataModel": {
            oServiceCalls: {
                getAllPages: {
                    executeServiceCallFn: function (/*oServiceParams*/) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (CommonDataModelService) {
                            CommonDataModelService.getAllPages().then(function (aPages) {
                                oDeferred.resolve(aPages);
                            });
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.MessageBroker": {
            oServiceCalls: {
                _execute: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ui.require(["sap/ushell/services/_MessageBroker/MessageBrokerEngine"], function (MessageBrokerEngine) {
                            MessageBrokerEngine.processPostMessage(oServiceParams)
                                .then(function (oResolvedData) {
                                    oDeferred.resolve(oResolvedData);
                                })
                                .catch(function (sError) {
                                    oDeferred.reject(sError);
                                });
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.SearchableContent": {
            oServiceCalls: {
                getApps: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("SearchableContent").then(function (SearchableContentService) {
                            var oOptions;
                            try {
                                oOptions = oServiceParams.oMessageData.body.oOptions;
                            } catch (ex) {
                                oOptions = {};
                            }
                            SearchableContentService.getApps(oOptions).then(function (aAppData) {
                                oDeferred.resolve(aAppData);
                            });
                        });
                        return oDeferred.promise();
                    }
                }
            }
        },
        "sap.ushell.services.ReferenceResolver": {
            oServiceCalls: {
                resolveReferences: {
                    executeServiceCallFn: function (oServiceParams) {
                        var oDeferred = new jQuery.Deferred();
                        sap.ushell.Container.getServiceAsync("ReferenceResolver").then(function (ReferenceResolverService) {
                            ReferenceResolverService.resolveReferences(oServiceParams.oMessageData.body.aReferences).then(oDeferred.resolve, oDeferred.reject);
                        });
                        return oDeferred.promise();
                    }
                }
            }
        }
    };

    /**
     * @private
     */
    function PostMessageAPI () {
        /**
         * @private
         */
        this._getBrowserURL = function () {
            return document.URL;
        };

        //check that all APIs start with "sap.ushell". FLP will not
        // start successfully if this is not the case
        Object.keys(oAPIs).forEach(function (sKey) {
            if (sKey.indexOf(SAP_API_PREFIX) !== 0) {
                throw new Error("All Post Message APIs must start with '" + SAP_API_PREFIX + "' - " + sKey);
            }
        });

        PostMessageAPIInterface.init(
            true,
            PostMessageAPI.prototype.registerShellCommunicationHandler.bind(this));
    }

    /**
     * @private
     */
    PostMessageAPI.prototype.getAPIs = function () {
        return oAPIs;
    };

    /**
     * @private
     */
    function addShellCommunicationHandler (sKey, oCommunicationEntry) {
        //only one entry is possible in oCommunicationHandler because we got here from registerShellCommunicationHandler!
        var oCommObject = oAPIs[sKey],
            oNewCommEntry;

        //We have the entry just update it
        if (oCommObject) {
            //add the communication handler to that entry
            if (oCommunicationEntry.oServiceCalls) {
                Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                    oCommObject.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
                });
            }

            if (oCommunicationEntry.oRequestCalls) {
                Object.keys(oCommunicationEntry.oRequestCalls).forEach(function (key) {
                    oCommObject.oRequestCalls[key] = oCommunicationEntry.oRequestCalls[key];
                });
            }

            return;
        }

        //create a new entry..
        oNewCommEntry = {
            oRequestCalls: {},
            oServiceCalls: {}
        };

        if (oCommunicationEntry.oServiceCalls) {
            Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                oNewCommEntry.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
            });
        }

        if (oCommunicationEntry.oRequestCalls) {
            Object.keys(oCommunicationEntry.oRequestCalls).forEach(function (key) {
                oNewCommEntry.oRequestCalls[key] = oCommunicationEntry.oRequestCalls[key];
            });
        }

        oAPIs[sKey] = oNewCommEntry;
    }

    /**
     * @private
     */
    PostMessageAPI.prototype._getPostMesageInterface = function (sServiceName, sInterface) {
        var oCommHandlerService,
            oShellCommunicationHandlersObj = this.getAPIs();

        if (oShellCommunicationHandlersObj[sServiceName]) {
            oCommHandlerService = oShellCommunicationHandlersObj[sServiceName];
            if (oCommHandlerService && oCommHandlerService.oRequestCalls && oCommHandlerService.oRequestCalls[sInterface]) {
                return oCommHandlerService.oRequestCalls[sInterface];
            }
        }

        return undefined;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.registerShellCommunicationHandler = function (oCommunicationHandler) {
        Object.keys(oCommunicationHandler).forEach(function (sKey) {
            addShellCommunicationHandler(sKey, oCommunicationHandler[sKey]);
        });
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.isActiveOnly = function (sServiceName, sInterface) {
        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (oCommandInterface) {
            return oCommandInterface.isActiveOnly;
        }

        return undefined;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.getResponseHandler = function (sServiceName, sInterface) {
        var oCommandInterface = this._getPostMesageInterface(sServiceName, sInterface);

        if (oCommandInterface) {
            return oCommandInterface.fnResponseHandler;
        }

        return undefined;
    };

    /**
     * @private
     */
    PostMessageAPI.prototype._createNewInnerAppState = function (oServiceParams) {
        return new Promise(function (fnResolve) {
            var oNewState,
                sHash,
                sCurrAppStateKey,
                sNewAppStateKey,
                oValue;

            sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                oNewState = oAppStateService.createEmptyAppState(undefined, false);
                if (oServiceParams.oMessageData.body.sData !== undefined) {
                    try {
                        oValue = JSON.parse(oServiceParams.oMessageData.body.sData);
                    } catch (e) {
                        oValue = oServiceParams.oMessageData.body.sData;
                    }
                } else {
                    oValue = "";
                }
                oNewState.setData(oValue);
                oNewState.save();
                sNewAppStateKey = oNewState.getKey();

                sHash = hasher.getHash();
                if (sHash.indexOf("&/") > 0) {
                    if (sHash.indexOf("sap-iapp-state=") > 0) {
                        sCurrAppStateKey = /(?:sap-iapp-state=)([^&/]+)/.exec(sHash)[1];
                        sHash = sHash.replace(sCurrAppStateKey, sNewAppStateKey);
                    } else {
                        sHash = sHash + "/sap-iapp-state=" + sNewAppStateKey;
                    }
                } else {
                    sHash = sHash + "&/sap-iapp-state=" + sNewAppStateKey;
                }

                hasher.disableBlueBoxHashChangeTrigger = true;
                hasher.replaceHash(sHash);
                hasher.disableBlueBoxHashChangeTrigger = false;

                fnResolve(sNewAppStateKey);
            });
        });
    };

    /**
     * Show/Hide UI blocker in the entire shell.
     * This functionality is needed for the cFLP scenario, when the
     * application that runs in the iframe locks the iframe UI (probably
     * sue to a dialog display) and as a result, the cFLP shell also needs
     * to lock itself.
     * The implementation is done in a non standard way by calling
     *
     * @since 1.66.0
     * @private
     */
    function showUIBlocker (bShow) {
        if (bShow === true) {
            if (Core.byId("shell-header")) {
                Core.byId("shell-header").setBlocked(true);
                var oHeaderElement = jQuery("#shell-header-blockedLayer");
                oHeaderElement.addClass("sapUshellShellBlocked");
            }
            if (Core.byId("menuBar")) {
                // This is a specific case for blocking menuPlugin items
                Core.byId("menuBar").setBlocked(true);
                var oMenuBarElement = jQuery("#menuBar-blockedLayer");
                oMenuBarElement.addClass("sapUshellMenuBarBlocked");
            }
        } else if (bShow === false) {
            if (Core.byId("shell-header")) {
                Core.byId("shell-header").setBlocked(false);
            }
            if (Core.byId("menuBar")) {
                // This is a specific case for blocking menuPlugin items
                Core.byId("menuBar").setBlocked(false);
            }
        }
    }

    /**
     * @private
     */
    function addRendererButton (sAPI, oServiceParams) {
        sap.ushell.Container.getRenderer("fiori2")[sAPI](
            "sap.ushell.ui.shell.ShellHeadItem",
            {
                id: oServiceParams.oMessageData.body.sId,
                tooltip: oServiceParams.oMessageData.body.sTooltip,
                icon: oServiceParams.oMessageData.body.sIcon,
                floatingNumber: oServiceParams.oMessageData.body.iFloatingNumber,
                press: function () {
                    oServiceParams.oContainer.postMessageRequest(
                        "sap.ushell.appRuntime.buttonClick",
                        { buttonId: oServiceParams.oMessageData.body.sId }
                    );
                }
            },
            oServiceParams.oMessageData.body.bVisible,
            oServiceParams.oMessageData.body.bCurrentState || true,
            oServiceParams.oMessageData.body.aStates
        );
    }

    /**
     * @private
     */
    PostMessageAPI.prototype.registerAsyncDirtyStateProvider = function (oServiceParams) {
        sap.ushell.Container.setAsyncDirtyStateProvider(function (oNavigationContext) {
            return new Promise(function (fnResolve) {
                var oMessage = oServiceParams.oContainer.createPostMessageRequest("sap.ushell.appRuntime.handleDirtyStateProvider", {
                        oNavigationContext: oNavigationContext
                    }),
                    backupTimer;

                oServiceParams.oContainer.postMessageToCurrentIframe(oMessage, true)
                    .then(function (oResponse) {
                        if (backupTimer) {
                            clearTimeout(backupTimer);
                        }
                        fnResolve(oResponse && oResponse.body && oResponse.body.result || false);
                    });
                //safety check in case post message does not get result
                backupTimer = setTimeout(function () {
                    fnResolve(false);
                }, 2500);
            });
        });
    };

    /**
     * @private
     */
    PostMessageAPI.prototype.deregisterAsyncDirtyStateProvider = function (oServiceParams) {
        sap.ushell.Container.setAsyncDirtyStateProvider(undefined);
    };

    /**
     * @private
     */
    PostMessageAPI.prototype._sendEmail = function (sTo, sSubject, sBody, sCc, sBcc, sIFrameURL, bSetAppStateToPublic) {
        var sFLPUrl = (this._getBrowserURL && this._getBrowserURL()) || document.URL;

        function replaceIframeUrlToFLPUrl (sIFrameURL1, sFLPUrl1, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew) {
            //replace iframe url with flp url
            sSubject = sSubject && sSubject.includes(sIFrameURL1) ? sSubject.replace(sIFrameURL1, sFLPUrl1) : sSubject;
            sBody = sBody && sBody.includes(sIFrameURL1) ? sBody.replace(sIFrameURL1, sFLPUrl1) : sBody;

            //for cases where we do not find iframe url, replace the app state keys
            sSubject = sSubject && sXStateKey && sXStateKeyNew && sSubject.includes(sXStateKey) ? sSubject.replace(sXStateKey, sXStateKeyNew) : sSubject;
            sSubject = sSubject && sIStateKey && sIStateKeyNew && sSubject.includes(sIStateKey) ? sSubject.replace(sIStateKey, sIStateKeyNew) : sSubject;
            sBody = sBody && sXStateKey && sXStateKeyNew && sBody.includes(sXStateKey) ? sBody.replace(sXStateKey, sXStateKeyNew) : sBody;
            sBody = sBody && sIStateKey && sIStateKeyNew && sBody.includes(sIStateKey) ? sBody.replace(sIStateKey, sIStateKeyNew) : sBody;
        }

        if (bSetAppStateToPublic) {
            sap.ushell.Container.getServiceAsync("AppState").then(function (oAppStateService) {
                oAppStateService.setAppStateToPublic(sIFrameURL)
                    .done(function (sNewURL, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew) {
                        if (sXStateKeyNew !== undefined) {
                            sFLPUrl = sFLPUrl.replace(sXStateKey, sXStateKeyNew);
                        }
                        if (sIStateKeyNew !== undefined) {
                            sFLPUrl = sFLPUrl.replace(sIStateKey, sIStateKeyNew);
                        }
                        //check if the subject or the body of the email contain the IFrame URL
                        replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew);
                        // Send the email
                        URLHelper.triggerEmail(sTo, sSubject, sBody, sCc, sBcc);
                    })
                    .fail(Log.error);
            });
        } else {
            //check if the subject or the body of the email contain the IFrame URL
            replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl);
            //Send the email
            URLHelper.triggerEmail(sTo, sSubject, sBody, sCc, sBcc);
        }
    };

    /**
     * Helper function for removing the service URL of dynamic bookmark tiles
     * if the bookmark is created from a local service provider
     * <p>
     * This is a short-term mitigation for customer incident 57472/2021.
     * The service URLs for dynamic tiles created as bookmark for apps created
     * locally on CF (either manually or deployed to the local HTML5 repo) cannot
     * be correctly constructed, because the path prefix cannot be resolved.
     * As intermediate workaround, we remove the service URL to avoid the display
     * of the ERROR state.
     *
     * @private
     * @param {object} oParameters parameters for bookmark creation
     * @param {object} oSystemContext the system context for bookmark creation
     */
    PostMessageAPI.prototype._stripBookmarkServiceUrlForLocalContentProvider = function (oParameters, oSystemContext) {
        if (!oParameters || !oParameters.serviceUrl || !oSystemContext) {
            return;
        }

        if (oSystemContext.id === "" || oSystemContext.id === "saas_approuter") {
            oParameters.serviceUrl = undefined;

            Log.warning("Dynamic data bookmarks tiles are not supported for local content providers",
                null, "sap/ushell/components/applicationIntegration/application/PostMessageAPI");
        }
    };

    return new PostMessageAPI();
});
