// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/components/container/ApplicationContainer",
    "sap/ushell/components/applicationIntegration/application/PostMessageAPI",
    "sap/ushell/utils",
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ushell/UI5ComponentType",
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Core"
], function (ApplicationContainer, PostMessageAPI, utils, jQuery, URI, UI5ComponentType, Log, ObjectPath, Core) {
    "use strict";

    var oActiveApplication,
        BlueBoxHandler,
        oApplicationContainerProps = ApplicationContainer.getMetadata().getJSONKeys();


    function Application () {
        var that = this;

        this.handleMessageEvent = function (oContainer, oMessage, oMessageStatus, bIsGlobalMessageListener) {
            var oMessageData = oMessage.data;

            if (bIsGlobalMessageListener === undefined) {
                bIsGlobalMessageListener = false;
            }
            if (typeof oMessageData === "string") {
                // it's possible that the data attribute is passed as string (IE9)
                try {
                    oMessageData = JSON.parse(oMessage.data);
                } catch (e) {
                    // could be some message which is not meant for us, so we just log with debug level
                    Log.debug(
                        "Message received from origin '" + oMessage.origin + "' cannot be parsed: " + e,
                        oMessageData,
                        "sap.ushell.components.container.ApplicationContainer"
                    );
                    return;
                }
            }

            if (oMessageData.action === "pro54_setGlobalDirty" &&
                localStorage.getItem(oContainer.globalDirtyStorageKey) ===
                sap.ushell.Container.DirtyState.PENDING) {
                if (!ApplicationContainer.prototype._isTrustedPostMessageSource(oContainer, oMessage)) {
                    // log w/ warning level, message would normally processed by us
                    Log.warning("Received message from untrusted origin: " + oMessage.origin,
                        oMessageData, "sap.ushell.components.container.ApplicationContainer");
                    return;
                }
                Log.debug("getGlobalDirty() pro54_setGlobalDirty SetItem key:" +
                    oContainer.globalDirtyStorageKey + " value: " +
                    oMessageData.parameters.globalDirty,
                    null,
                    "sap.ushell.components.container.ApplicationContainer"
                );
                utils.localStorageSetItem(oContainer.globalDirtyStorageKey,
                    oMessageData.parameters.globalDirty, true);
            } else {
                // delegate to separate method for CrossAppNavigation invocation
                that.handleServiceMessageEvent(oContainer, oMessage, oMessageData, oMessageStatus, bIsGlobalMessageListener);
                // ApplicationContainer.prototype._handleServiceMessageEvent(oContainer, oMessage, oMessageData);
            }
        };

        /**
         * Helper method for handling service invocation via post message events
         * <p>
         * This feature is disabled by default, because it is not consumed by WebDynpro ABAP in version 1.24 (UI Add-on SP10).
         * It can be enabled via launchpad configuration as follows (not a public option, might be changed later):
         *
         * <pre>
         *   {
         *     services: {
         *       PostMessage: {
         *         config: {
         *           enabled: true
         *         }
         *       }
         *     }
         *   }
         * </pre>
         *
         * @param {object} oContainer the ApplicationContainer instance
         * @param {Event} oMessage
         *   the received postMessage event
         * @param {object} oMessageData the parsed message data
         * @param {boolean} bIsGlobalMessageListener indication is the message came from the global message listener
         *
         * @private
         * @since 1.24
         */
        this.handleServiceMessageEvent = function (oContainer, oMessage, oMessageData, oMessageStatus, bIsGlobalMessageListener) {
            // we anticipate the PostMessage service for the configuration although it's not there
            // (if it doesn't come, we'll just remove the configuration option)
            var oPostMessageServiceConfig = ObjectPath.get("sap-ushell-config.services.PostMessage.config") || ObjectPath.create("sap-ushell-config.services.PostMessage.config"),
                sService = oMessageData && oMessageData.service,
                sServiceName,
                oMatchHandler,
                sServiceHandlerMatchKey,
                oServiceCall,
                bIsRegistedService = false,
                oShellCommunicationHandlersObj = PostMessageAPI.getAPIs(),
                bIsUserMessage;

            Log.debug("Received post message request from origin '" + oMessage.origin + "': "
                + JSON.stringify(oMessageData),
                null,
                "sap.ushell.components.container.ApplicationContainer");

            if (bIsGlobalMessageListener === undefined) {
                bIsGlobalMessageListener = false;
            }

            //validate that service is valid
            if (oMessageData.type !== "request" || !sService) {
                return;
            }

            //message broker messages should be processed only by FLP's default listener
            if (sService === "sap.ushell.services.MessageBroker") {
                if (bIsGlobalMessageListener === true) {
                    sService = sService.concat("._execute");
                } else {
                    return;
                }
            }

            for (var oEntryCommHandlerKey in oShellCommunicationHandlersObj) {
                if (oShellCommunicationHandlersObj.hasOwnProperty(oEntryCommHandlerKey)) {
                    if (sService.indexOf(oEntryCommHandlerKey) !== -1) {
                        oMatchHandler = oShellCommunicationHandlersObj[oEntryCommHandlerKey];
                        sServiceHandlerMatchKey = oEntryCommHandlerKey;
                        bIsRegistedService = true;
                        break;
                    }
                }
            }

            if (bIsRegistedService === false) {
                if (oMessageStatus.bPluginsStatusChecked === false || oMessageStatus.bKeepMessagesForPlugins === true) {
                    oMessageStatus.bApiRegistered = false;
                } else {
                    sendResponseMessage("error", {
                        code: -1,
                        message: "Unknown service name: '" + sService + "'"
                    });
                }
                return;
            }

            bIsUserMessage = (sService.indexOf("user.postapi.") === 0);
            sServiceName = sService.split(".")[3];

            if (oPostMessageServiceConfig && oPostMessageServiceConfig.enabled === false) {
                Log.warning("Received message for " + sServiceName + ", but this " +
                    "feature is disabled. It can be enabled via launchpad configuration " +
                    "property 'services.PostMessage.config.enabled: true'",
                    undefined, "sap.ushell.components.container.ApplicationContainer");
                return;
            }

            // custom trusted callback
            if (bIsGlobalMessageListener === false && !ApplicationContainer.prototype._isTrustedPostMessageSource(oContainer, oMessage)) {
                // log w/ warning level, message would normally processed by us
                Log.warning("Received message from untrusted origin '" + oMessage.origin + "': "
                    + JSON.stringify(oMessage.data),
                    null, "sap.ushell.components.container.ApplicationContainer");
                return;
            }

            function callService (fnServiceCall, bIsUserMessage) {
                var oServiceParams;

                if (bIsUserMessage === true) {
                    oServiceParams = {
                        oMessage: oMessage,
                        oMessageData: oMessageData
                    };
                } else {
                    oServiceParams = {
                        matchesLocalSid: matchesLocalSid,
                        getLocalSystemInSidForma: getLocalSystemInSidFormat,
                        storeSapSystemData: storeSapSystemData,
                        executeSetBackNavigationService: executeSetBackNavigationService,
                        sendResponseMessage: sendResponseMessage,
                        oMessage: oMessage,
                        oMessageData: oMessageData,
                        oContainer: oContainer
                    };
                }

                try {
                    fnServiceCall(oServiceParams)
                        .done(function (oResult) {
                            // eslint-disable-next-line no-unneeded-ternary
                            var bNoPostmessageResponse = (oResult && oResult.hasOwnProperty("_noresponse_") ? true : false);
                            if (!bNoPostmessageResponse) {
                                sendResponseMessage("success", {result: oResult});
                            }
                        })
                        .fail(function (sMessage) {
                            sendResponseMessage("error", { message: sMessage });
                        });
                } catch (oError) {
                    sendResponseMessage("error", { message: oError.message });
                }
            }

            /**
             * Sends the response message in the expected format
             */
            function sendResponseMessage (sStatus, oBody) {
                var sResponseData = JSON.stringify({
                    type: "response",
                    service: oMessageData.service,
                    request_id: oMessageData.request_id,
                    status: sStatus,
                    body: oBody
                });

                Log.debug("Sending post message response to origin ' " + oMessage.origin + "': "
                    + sResponseData,
                    null,
                    "sap.ushell.components.container.ApplicationContainer");

                if (typeof oMessage.source !== "object" || oMessage.source === null) {
                    Log.debug("Cannot send response message to origin ' " + oMessage.origin,
                        "`source` member of request message is not an object",
                        "sap.ushell.components.container.ApplicationContainer");

                    return;
                }

                oMessage.source.postMessage(sResponseData, oMessage.origin);
            }

            function executeSetBackNavigationService (oMessage, oMessageData) {
                var oDeferred = new jQuery.Deferred(),
                    fnCallback;
                if (oMessageData.body && oMessageData.body.callbackMessage && oMessageData.body.callbackMessage.service) {
                    fnCallback = ApplicationContainer.prototype._backButtonPressedCallback.bind(
                        null,
                        oMessage.source,
                        oMessageData.body.callbackMessage.service,
                        oMessage.origin
                    );
                } // empty body or callback message will call the setBackNavigation with undefined, this should reset the back button callback
                oDeferred.resolve(oContainer.getShellUIService().setBackNavigation(fnCallback));
                return oDeferred.promise();
            }

            /**
             * Stores sap system data into local storage.
             *
             * @param {object} oSapSystemData
             *   The sap system data
             *
             * @param {string} [sSapSystemSrc]
             *   The sap system src
             */
            function storeSapSystemData (oSapSystemData, sSapSystemSrc) {
                var sKey,
                    oLocalStorage,
                    sStringifiedSapSystemData,
                    aSystemIds = [oSapSystemData.id];

                if (arguments.length > 1) {
                    aSystemIds.unshift(sSapSystemSrc);
                }
                try {
                    sStringifiedSapSystemData = JSON.stringify(oSapSystemData);
                } catch (e) {
                    Log.error("Cannot stringify and store expanded system data: " + e);
                }

                if (sStringifiedSapSystemData) {
                    oLocalStorage = utils.getLocalStorage();

                    sKey = utils.generateLocalStorageKey("sap-system-data", aSystemIds);
                    oLocalStorage.setItem(sKey, sStringifiedSapSystemData);
                }
            }

            /**
             * Returns the id and client of the local system in sid format.
             *
             * @returns {string}
             *   the local system/client in sid format, e.g., sid(UR3.120)
             *
             * @private
             */
            function getLocalSystemInSidFormat () {
                var oSystem = sap.ushell.Container.getLogonSystem();
                var sSystemName = oSystem.getName();
                var sSystemClient = oSystem.getClient();

                return "sid(" + sSystemName + "." + sSystemClient + ")";
            }

            /**
             * Checks whether the given system is in sid format and matches the
             * local system.
             *
             * @param {string} sSidOrName
             *   The sid or name representation of the system alias
             *
             * @return {boolean}
             *   Whether the given system is in sid format and matches the local system.
             *
             * @private
             */
            function matchesLocalSid (sSidOrName) {
                return getLocalSystemInSidFormat().toLowerCase() === sSidOrName.toLowerCase();
            }

            oServiceCall = oMatchHandler.oServiceCalls[sService.replace(sServiceHandlerMatchKey + ".", "")];
            if (oServiceCall && oServiceCall.executeServiceCallFn) {
                callService(oServiceCall.executeServiceCallFn, bIsUserMessage);
            } else {
                sendResponseMessage("error", {
                    code: -1,
                    message: "Unknown service name: '" + sService + "'"
                });
            }
        };

        this.init = function (inBlueBoxHandler) {
            BlueBoxHandler = inBlueBoxHandler;
        };

        this.restoreArray = function (oArr) {
            var aArr = [],
                index = 0;
            while (oArr[index]) {
                aArr.push(oArr[index]);
                index++;
            }

            return aArr;
        };

        this._createWaitForRendererCreatedPromise = function () {
            var oPromise,
                oRenderer;

            oRenderer = sap.ushell.Container.getRenderer();
            if (oRenderer) {
                // should always be the case except initial start; in this case, we return an empty array to avoid delays by an additional async operation
                Log.debug("Shell controller._createWaitForRendererCreatedPromise: shell renderer already created, return empty array.");
                return [];
            }
            oPromise = new Promise(function (resolve, reject) {
                var fnOnRendererCreated;

                fnOnRendererCreated = function () {
                    Log.info("Shell controller: resolving component waitFor promise after shell renderer created event fired.");
                    resolve();
                    sap.ushell.Container.detachRendererCreatedEvent(fnOnRendererCreated);
                };
                oRenderer = sap.ushell.Container.getRenderer();
                if (oRenderer) {
                    // unlikely to happen, but be robust
                    Log.debug("Shell controller: resolving component waitFor promise immediately (shell renderer already created");
                    resolve();
                } else {
                    sap.ushell.Container.attachRendererCreatedEvent(fnOnRendererCreated);
                }
            });
            return [oPromise];
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
            var that = this,
                oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (Ui5ComponentLoaderService) {
                Ui5ComponentLoaderService.createComponent(
                    oResolvedHashFragment,
                    oParsedShellHash,
                    that._createWaitForRendererCreatedPromise(),
                    UI5ComponentType.Application).then(oDeferred.resolve, oDeferred.reject);
            });
            return oDeferred.promise();
        };

        this.stripURL = function (sUrl) {
            var nDomainParamStart = sUrl.indexOf("?"),
                nDomainHashStart = sUrl.indexOf("#"),
                domainUrl;

            if (nDomainParamStart >= 0) {
                domainUrl = sUrl.substr(0, nDomainParamStart);
            } else if (nDomainHashStart >= 0) {
                domainUrl = sUrl.substr(0, nDomainHashStart);
            } else {
                domainUrl = sUrl;
            }

            return domainUrl;
        };

        this.createApplicationContainer = function (sAppId, oResolvedNavigationTarget) {
            var oTempTarget = {};

            this._cleanTargetResolution(oResolvedNavigationTarget, oTempTarget);
            oActiveApplication = new ApplicationContainer("application" + sAppId, oResolvedNavigationTarget);
            this._restoreTargetResolution(oResolvedNavigationTarget, oTempTarget);

            if (oResolvedNavigationTarget.appCapabilities) {
                oActiveApplication.setProperty("frameworkId", oResolvedNavigationTarget.appCapabilities.appFrameworkId, true);
            }

            oActiveApplication.setHandleMessageEvent(this.handleMessageEvent);
            BlueBoxHandler.setAppCapabilities(oActiveApplication, oResolvedNavigationTarget);
            return oActiveApplication;
        };

        this.active = function (oApp) {
            if (oApp) {
                if (oApp.active) {
                    oApp.active();
                }
            }
        };

        this.restore = function (oApp) {
            var sDomainEnd;

            if (oApp.container && oApp.container._getIFrame && oApp.container._getIFrame() != undefined) {
                this.postMessageToIframeApp(oApp.container, "sap.ushell.appRuntime", "keepAliveAppShow", {}, false);
            }

            if (oApp.app) {
                Core.getEventBus().publish("sap.ushell", "appKeepAliveActivate", oApp.appTarget);

                //is Isolated application
                if (oApp.app.getUrl) {
                    //send post message restore
                    sDomainEnd = oApp.app.getUrl();
                    oActiveApplication = BlueBoxHandler.get(this.stripURL(sDomainEnd));

                    if (oActiveApplication) {
                        BlueBoxHandler.restoreApp(oActiveApplication.sApplication);
                    }
                }

                if (oApp.app.isKeepAliveSupported && oApp.app.isKeepAliveSupported() === true) {
                    oApp.app.activate();
                } else {
                    if (oApp.app.restore) {
                        oApp.app.restore();
                    }
                    if (oApp.app.getRouter && oApp.app.getRouter() && oApp.app.getRouter().initialize) {
                        if (oApp.enableRouterRetrigger === false) {
                            oApp.app.getRouter().initialize();
                        } else {
                            oApp.app.getRouter().initialize(true);
                        }
                    }
                    //this is in order to support the dashboard life cycle.
                    if (oApp.app.setInitialConfiguration) {
                        oApp.app.setInitialConfiguration();
                    }
                }

                oActiveApplication = oApp.app;
            }
        };

        this.store = function (oApp) {
            var sDomainEnd;

            if (oApp.container && oApp.container._getIFrame && oApp.container._getIFrame() != undefined) {
                this.postMessageToIframeApp(oApp.container, "sap.ushell.appRuntime", "keepAliveAppHide", {}, false);
            }

            //destroy the application and its resources
            // invoke the life cycle interface "suspend" for the suspend application
            if (oApp.app) {
                Core.getEventBus().publish("sap.ushell", "appKeepAliveDeactivate", oApp.appTarget);

                //is Isolated application
                if (oApp.app.getUrl) {
                    //send post message restore
                    sDomainEnd = oApp.app.getUrl();
                    oActiveApplication = BlueBoxHandler.get(this.stripURL(sDomainEnd));

                    if (oActiveApplication) {
                        BlueBoxHandler.storeApp(oActiveApplication.sApplication);
                    }
                }

                if (oApp.app.isKeepAliveSupported && oApp.app.isKeepAliveSupported() === true) {
                    oApp.app.deactivate();
                } else {
                    if (oApp.app.suspend) {
                        oApp.app.suspend();
                    }
                    if (oApp.app.getRouter && oApp.app.getRouter()) {
                        oApp.app.getRouter().stop();
                    }
                }
            }
        };

        this.destroy = function (oApp) {
            var sDomainEnd,
                oActiveApplication,
                bDestroyByPost = false;

            if (oApp) {
                if (oApp.getUrl) {
                    sDomainEnd = oApp.getUrl();
                    oActiveApplication = BlueBoxHandler.get(this.stripURL(sDomainEnd));

                    if (BlueBoxHandler.isStatefulContainerSupported(oActiveApplication)) {
                        bDestroyByPost = true;
                        BlueBoxHandler.destroyApp(oActiveApplication.sApplication);
                    }
                }

                if (oApp.destroy && bDestroyByPost === false) {
                    try {
                        oApp.destroy();
                    } catch (e) {
                        Log.error("exception when trying to close sapui5 application with id '" + (oApp.sId || "<unknown>") +
                            "'. This error must be fixed in order for FLP to operate properly.\n",
                            e.stack,
                            "sap.ushell.components.applicationIntegration.application.Application::destroy");
                    }
                }
            }
        };

        this.setActiveAppContainer = function (oContainer) {
            oActiveApplication = oContainer;
        };

        this.getActiveAppContainer = function () {
            return oActiveApplication;
        };


        //Add default event handler that will be used also by plugins running in an iframe,
        //that needs to comunicate with the Message Broker. The handler will currently be limited
        //to process only message broker events.
        function handleMessageEventForDetaultListener (oMessage) {
            var that = this;

            try {
                var oMessageData = oMessage.data;
                //limit to handle only message broker events. other events are ignored.
                if (typeof oMessageData === "string" && oMessageData.indexOf("sap.ushell.services.MessageBroker") > 0) {
                    try {
                        oMessageData = JSON.parse(oMessage.data);
                        if (typeof oMessageData === "object" && oMessageData.type === "request" && oMessageData.service === "sap.ushell.services.MessageBroker") {
                            sap.ushell.Container.getServiceAsync("MessageBroker").then(function (MessageBrokerService) {
                                var sVal = MessageBrokerService.getAcceptedOrigins().find(function (sOrigin) {
                                    return sOrigin === oMessage.origin;
                                });
                                if (sVal === undefined) {
                                    return;
                                }
                                that.handleMessageEvent(undefined, oMessage, {}, true);
                            });
                        }
                    } catch (e) {
                        return;
                    }
                }
            } catch (e) {
                Log.error(e.message, e.stack);
            }
        }
        addEventListener("message", handleMessageEventForDetaultListener.bind(this));
    }

    /**
     * Validate properties before creating new ApplicationContainer object.
     * The target resolution object sent to ApplicationContainer, might contain
     * properties not supported by ApplicationContainer. This causes error
     * messages to the browser console that we would like to avoid. The
     * solution is to move the non ApplicationContainer properties to a new
     * temp object before creating ApplicationContainer, and after the creation,
     * move those properties back to the target resolution object.
     *
     * @private
     * @since 1.76
     */
    Application.prototype._cleanTargetResolution = function (oResolvedNavigationTarget, oTempTarget) {
        var sKey;

        if (oResolvedNavigationTarget) {
            for (sKey in oResolvedNavigationTarget) {
                if (oApplicationContainerProps[sKey] === undefined) {
                    oTempTarget[sKey] = oResolvedNavigationTarget[sKey];
                    delete oResolvedNavigationTarget[sKey];
                }
            }
        }
    };

    /**
     * After the creation of new ApplicationContainer, restore the full
     * target resolution object with its original parameters.
     *
     * @private
     * @since 1.76
     */
    Application.prototype._restoreTargetResolution = function (oResolvedNavigationTarget, oTempTarget) {
        var sKey;

        if (oResolvedNavigationTarget) {
            for (sKey in oTempTarget) {
                oResolvedNavigationTarget[sKey] = oTempTarget[sKey];
            }
        }
    };

    Application.prototype.getResponseHandler = function (sServiceName, sInterface) {
        return PostMessageAPI.getResponseHandler(sServiceName, sInterface);
    };

    Application.prototype.isActiveOnly = function (sServiceName, sInterface) {
        return PostMessageAPI.isActiveOnly(sServiceName, sInterface);
    };

    Application.prototype.isAppTypeSupported = function (oContainer, sServiceName, sInterface) {
        var oCommandInterface = PostMessageAPI._getPostMesageInterface(sServiceName, sInterface);
        return this.isAppTypeSupportedByPolicy(oContainer, oCommandInterface);
    };

    Application.prototype.isAppTypeSupportedByPolicy = function (oContainer, oPolicy) {
        if (oContainer && oContainer.getAdditionalInformation && oContainer.getAdditionalInformation().startsWith("SAPUI5.Component=")) {
            return false;
        }

        var oCommandInterface = oPolicy;

        if (!oCommandInterface || !oCommandInterface.distributionType) {
            return false;
        }

        if (oCommandInterface.distributionType.indexOf("all") >= 0) {
            return true;
        }

        //URL is a moder type event distribution is due to the subscribe
        if (oCommandInterface.distributionType.indexOf("URL") >= 0) {
            return false;
        }

        if (oContainer.getApplicationType && oCommandInterface.distributionType.indexOf(oContainer.getApplicationType()) >= 0) {
            return true;
        }

        return false;
    };

    Application.prototype.postMessageToIframeApp = function (oContainer, sServiceName, sInterface, oMessageBody, bWaitForResponse) {
        var sService = sServiceName + "." + sInterface,
            oMessage = this.createPostMessageRequest(sService, oMessageBody);

        return this.postMessageToIframe(oMessage, oContainer, bWaitForResponse);
    };

    Application.prototype.createPostMessageRequest = function (sServiceName, oMessageBody) {
        var sRequestId = Date.now().toString();

        return {
            type: "request",
            request_id: sRequestId,
            service: sServiceName,
            body: oMessageBody
        };
    };

    Application.prototype.createPostMessageResponse = function (sServiceName, sRequestId, oMessageBody, bSuccess) {
        return {
            type: "response",
            request_id: sRequestId,
            service: sServiceName,
            status: (bSuccess ? "success" : "error"),
            body: oMessageBody
        };
    };

    Application.prototype.postMessageToIframe = function (oMessage, oContainer, bWaitForResponse) {
        var oIFrame = oContainer._getIFrame(),
            oUri,
            sTargetDomain;

        if (!oIFrame || !oContainer._getIFrameUrl) {
            return Promise.resolve();
        }

        oUri = new URI(oContainer._getIFrameUrl(oIFrame));
        sTargetDomain = oUri.protocol() + "://" + oUri.host();

        return this.postMessageToIframeObject(oMessage, oIFrame, sTargetDomain, bWaitForResponse, true);
    };

    Application.prototype.postMessageToIframeObject = function (oMessage, oIFrame, sTargetDomain, bWaitForResponse, bFromContainer) {
        var sRequestId = oMessage.request_id;

        return new Promise(function (fnNotifySuccess, fnNotifyError) {
            function fnProcessClientMessage (oEvent) {
                var oEventData;

                try {
                    //only messages from the
                    if ((bFromContainer === true ? oIFrame.contentWindow : oIFrame) !== oEvent.source) {
                        return;
                    }

                    if (typeof oEvent.data === "string" && oEvent.data.indexOf("{") === 0) {
                        try {
                            oEventData = JSON.parse(oEvent.data);
                        } catch (e) {
                            oEventData = {};
                        }
                    } else {
                        return;
                    }

                    if (!oEventData.request_id || sRequestId !== oEventData.request_id) {
                        return;
                    }

                    if (oEventData.status === "success") {
                        fnNotifySuccess(oEventData);
                    } else {
                        fnNotifyError(oEventData);
                    }

                    window.removeEventListener("message", fnProcessClientMessage);
                } catch (e) {
                    // Not gonna break because of a potential quirk in the framework that responded to postMessage
                    fnNotifySuccess();

                    Log.warning("Obtained bad response from framework in response to message " + oMessage.request_id);
                    Log.debug("Underlying framework returned invalid response data: '" + oEvent.data + "'");
                }
            }

            if (!oIFrame) {
                fnNotifySuccess();
            } else {
                var sMessage = JSON.stringify(oMessage);

                Log.debug("Sending postMessage " + sMessage + " to iframe with id '" + oIFrame.id + "'");
                if (bWaitForResponse) {
                    window.addEventListener("message", fnProcessClientMessage, false);
                    if (bFromContainer === true) {
                        oIFrame.contentWindow.postMessage(sMessage, sTargetDomain);
                    } else {
                        oIFrame.postMessage(sMessage, sTargetDomain);
                    }
                } else {
                    if (bFromContainer === true) {
                        oIFrame.contentWindow.postMessage(sMessage, sTargetDomain);
                    } else {
                        oIFrame.postMessage(sMessage, sTargetDomain);
                    }
                    fnNotifySuccess();
                }
            }
        });
    };

    Application.prototype.registerShellCommunicationHandler = function (oCommunicationHandler) {
        PostMessageAPI.registerShellCommunicationHandler(oCommunicationHandler);
    };

    Application.prototype._getPostMesageInterface = function (sServiceName, sInterface) {
        return PostMessageAPI._getPostMesageInterface(sServiceName, sInterface);
    };

    return new Application();
}, /* bExport= */ true);
