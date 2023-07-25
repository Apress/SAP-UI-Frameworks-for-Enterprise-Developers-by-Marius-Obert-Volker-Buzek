// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's AppLifeCycle service enables plug-ins to enquire the which
 *    application is currently displayed and listen to life cycle events.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/base/EventProvider",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/AppInfoParameters",
    "sap/ushell/EventHub",
    "sap/ushell/TechnicalParameters",
    "sap/ui/core/Component",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/services/_MessageBroker/MessageBrokerEngine",
    "sap/ushell/utils/UrlParsing"
], function (
    Log,
    EventProvider,
    Core,
    hasher,
    AppInfoParameters,
    EventHub,
    TechnicalParameters,
    Component,
    AppConfiguration,
    MessageBrokerEngine,
    UrlParsing
) {
    "use strict";

    var S_APP_LOADED_EVENT = "appLoaded";

    /**
     * The Unified Shell's AppLifeCycle service
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (AppLifeCycle) {});</code>.
     * Constructs a new instance of the AppLifeCycle service.
     *
     * @name sap.ushell.services.AppLifeCycle
     *
     * @param {object} oAdapter
     *   The service adapter for the AppLifeCycle service,
     *   as already provided by the container
     * @param {object} oContainerInterface interface
     * @param {string} sParameter Service instantiation
     * @param {object} oConfig service configuration (not in use)
     *
     *
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     *
     * @since 1.38
     * @public
     */
    function AppLifeCycle (oAdapter, oContainerInterface, sParameter, oConfig) {

        var oCurrentApplication,
            oCurrentApplicationContainer,
            oEventProvider;

        /**
         * Returns information about the currently running application.
         *
         * The function returns an object with following parameters:
         * <ul>
         *   <li> applicationType: “UI5|WDA|NWBC|URL|TR” </li>
         *   <li> componentInstance: reference to component (only for applicationType "UI5"). </li>
         *   <li> homePage: <code>true</code> when root intent (normally #Shell-home) or Appfinder (#Shell-appfinder) is currently displayed. </li>
         *   <li> getTechnicalParameter: <code>function</code> that returns the value of a technical parameter for the given application.
         *        This method is for SAP internal usage only. </li>
         *   <li> getIntent: <code>function</code> that returns a <code>Promise</code> that resolves with the current shell hash as
         *        an <code>Object</code>. See {@link sap.ushell.services.URLParsing#parseShellHash} for details.
         *        <i>This property is for SAP-internal use only!</i> </li>
         *   <li> getInfo: <code>function</code> that is called with an <code>Array</code>
         *        with following optional elements of type <code>String</code>
         *        <ul>
         *          <li> <code> productName </code> A human readable free form text maintained on the platform where FLP runs,
         *               and identifying the current product.</li>
         *          <li> <code> theme </code> Current FLP theme. Includes the path to the theme resources
         *               if the theme is not an sap theme (does not start with sap_)</li>
         *          <li> <code> languageTag </code> Current Language (BCP47 format)</li>
         *          <li> <code> appIntent </code> Intent that was used to launch the application (including parameters)</li>
         *          <li> <code> appFrameworkId </code>ID of the framework </li>
         *          <li> <code> technicalAppComponentId </code> Identifier of the component that implements the base application.</li>
         *          <li> <code> appId </code> Universal stable logical identifier of the application across the whole content.</li>
         *          <li> <code> appVersion </code> Version of the app</li>
         *          <li> <code> appSupportInfo </code> The name of an organizational component that handles support incidents.</li>
         *          <li> <code> appFrameworkVersion </code> Version of the framework </li>
         *        </ul>
         *        The <code>function</code> returns a <code>Promise</code> that resolves with an <code>Object</code>
         *        with properties corresponding to the elements of the <code>Array</code> passed as input.
         *        Each of these properties holds its value or undefined if not configured.
         * </ul>
         *
         * <b>Note:</b>
         * Return value is only valid after app is loaded. See {@link #attachAppLoaded} for details.
         * Before an app is loaded, <code>undefined</code> is returned.
         *
         * @returns {object|undefined}
         *   Information object about currently running application or <code>undefined</code> if no application is running.
         *
         * @since 1.38
         * @public
         * @alias sap.ushell.services.AppLifeCycle#getCurrentApplication
         */
        this.getCurrentApplication = function () {
            return oCurrentApplication;
        };

        /**
         * Attaches an event handler for the appLoaded event. This event handler will be triggered
         * each time an application has been loaded.
         *
         * @param {object} oData
         *     An object that will be passed to the handler along with the event object when the
         *     event is fired.
         * @param {function} fnFunction
         *     The handler function to call when the event occurs.
         * @param {object} oListener
         *     The object that wants to be notified when the event occurs (this context within the
         *     handler function).
         * @since 1.38
         * @public
         * @alias sap.ushell.services.AppLifeCycle#attachAppLoaded
         */
        this.attachAppLoaded = function (oData, fnFunction, oListener) {
            oEventProvider.attachEvent(S_APP_LOADED_EVENT, oData, fnFunction, oListener);
        };

        /**
         * Detaches an event handler from the EventProvider.
         *
         * @param {function} fnFunction
         *     The handler function that has to be detached from the EventProvider.
         * @param {object} oListener
         *     The object that wanted to be notified when the event occurred
         * @since 1.38
         * @public
         * @alias sap.ushell.services.AppLifeCycle#detachAppLoaded
         */
        this.detachAppLoaded = function (fnFunction, oListener) {
            oEventProvider.detachEvent(S_APP_LOADED_EVENT, fnFunction, oListener);
        };

        /**
         * Set current application object from AppRuntime in cFLP
         *
         * @param {string} sApplicationType The type of the current application.
         * @param {object} oComponentInstance The instance of the component.
         * @param {boolean} bHomePage Indicator for a home page.
         * @param {string} oApplicationContainer The application container.
         *
         * @since 1.82
         * @private
         */
        this.prepareCurrentAppObject = function (sApplicationType, oComponentInstance, bHomePage, oApplicationContainer) {
            setCurrentApplicationObject(sApplicationType, oComponentInstance, bHomePage, oApplicationContainer);
        };

        /**
         * Reloads the currently displayed app (used by RTA plugin).
         *
         * @since 1.84
         * @private
         * @ui5-restricted sap.ui.rta
         */
        this.reloadCurrentApp = function () {
            EventHub.emit("reloadCurrentApp", {
                sAppContainerId: oCurrentApplicationContainer.getId(),
                sCurrentHash: hasher.getHash(),
                date: Date.now()
            });
        };

        this.setAppInfo = function (oAppInfo, bIsNewApp) {
            AppInfoParameters.setCustomAttributes(oAppInfo);
            oCurrentApplication.getAllAppInfo(true).then(function (data) {
                MessageBrokerEngine.publish("flp-app-info", "FLP", Date.now().toString(), (bIsNewApp === true ? "new app info" : "app info update"), "*" , data);
            });
        };

        // CONSTRUCTOR CODE //
        if (window.QUnit === undefined && sap.ushell.Container.inAppRuntime() === false) {
            MessageBrokerEngine.subscribe(
                "FLP",
                [{
                    channelId: "flp-app-info",
                    version: "1.0"
                }],
                function () {},
                function () {}
            );
        }
        oEventProvider = new EventProvider();
        if (sap.ushell.Container.inAppRuntime() === false) {
            if (sap.ushell.Container.getRenderer()) {
                registerToNavigationEvent();
            } else {
                // Renderer not created yet. This can happen if the AppLifeCycle service is preloaded.
                var fnOnRendererCreated = function () {
                    registerToNavigationEvent();
                    sap.ushell.Container.detachRendererCreatedEvent(fnOnRendererCreated);
                };
                sap.ushell.Container.attachRendererCreatedEvent(fnOnRendererCreated);
            }
        }

        function registerToNavigationEvent () {
            // only continue executing the constructor if the view port container exists in expected format
            var oViewPortContainer = Core.byId("viewPortContainer");
            if (!oViewPortContainer || typeof oViewPortContainer.attachAfterNavigate !== "function") {
                Log.error(
                    "Error during instantiation of AppLifeCycle service",
                    "Could not attach to afterNavigate event",
                    "sap.ushell.services.AppLifeCycle"
                );
                return;
            }

            oViewPortContainer.attachAfterNavigate(function (oEvent) {
                var oComponentContainer;
                var oApplicationContainer;
                var sApplicationType;
                var oComponentInstance;
                var sComponentInstanceId;
                var bHomePage = false;

                if (oEvent.mParameters.toId.indexOf("applicationShellPage") === 0) {
                    // instance is a shell, which hosts the ApplicationContainer
                    oApplicationContainer = oEvent.mParameters.to.getApp();
                } else if (oEvent.mParameters.toId.indexOf("application") === 0) {
                    // instance is already the ApplicationContainer
                    oApplicationContainer = oEvent.mParameters.to;
                }

                // try to get component instance if accessible via the component handle
                if (oApplicationContainer && typeof oApplicationContainer.getComponentHandle === "function"
                    && oApplicationContainer.getComponentHandle()) {
                        oComponentInstance = oApplicationContainer.getComponentHandle().getInstance();
                } else if (oApplicationContainer) {
                    oComponentContainer = oApplicationContainer.getAggregation("child");
                    if (oComponentContainer) {
                        oComponentInstance = oComponentContainer.getComponentInstance();
                    }
                } else {
                    oComponentInstance = Component.get(oEvent.mParameters.to.getComponent());
                }

                // determine if we're dealing with home page by checking the component instance id
                if (oComponentInstance) {
                    sComponentInstanceId = oComponentInstance.getId();
                    // In the past Homepage and AppFinder were the same component.
                    // for compatibility reason bHomePage is
                    // also true for the AppFinder
                    bHomePage = sComponentInstanceId.indexOf("Shell-home-component") !== -1
                        || sComponentInstanceId.indexOf("pages-component") !== -1
                        || sComponentInstanceId.indexOf("workPageRuntime-component") !== -1
                        || sComponentInstanceId.indexOf("Shell-appfinder-component") !== -1
                        || sComponentInstanceId.indexOf("homeApp-component") !== -1
                        || sComponentInstanceId.indexOf("runtimeSwitcher-component") !== -1;
                }

                // type can either be read from application container or set to UI5 if component instance exists
                sApplicationType = oApplicationContainer &&
                    typeof oApplicationContainer.getApplicationType === "function" &&
                    oApplicationContainer.getApplicationType();
                if ((!sApplicationType || sApplicationType === "URL") && oComponentInstance) {
                    sApplicationType = "UI5";
                }

                setCurrentApplicationObject(sApplicationType, oComponentInstance, bHomePage, oApplicationContainer);
            });
        }

        function getAppIntent () {
            var sHash = hasher.getHash();
            if (!sHash) {
                return Promise.reject("Could not identify current application hash");
            }

            var oService = sap.ushell.Container.getServiceAsync("URLParsing");
            return oService.then(function (oParsingService) {
                return oParsingService.parseShellHash(sHash);
            });
        }

        function cleanAppInfo () {
            if (AppInfoParameters.setCustomAttributes) {
                AppInfoParameters.setCustomAttributes();
            }
        }


        function setCurrentApplicationObject (sApplicationType, oComponentInstance, bHomePage, oApplicationContainer) {
            cleanAppInfo();
            oCurrentApplicationContainer = oApplicationContainer;
            oCurrentApplication = {
                applicationType: sApplicationType,
                componentInstance: oComponentInstance,
                homePage: bHomePage,
                getTechnicalParameter: function (sParameterName) {
                    return TechnicalParameters.getParameterValue(
                        sParameterName,
                        oComponentInstance,
                        oApplicationContainer,
                        sApplicationType
                    );
                },
                getIntent: getAppIntent,
                /**
                 * A function to collect the values of the given parameters
                 * @param {string[]} aParameters Array of requested parameters
                 * @returns {Promise} oPromise Promise that resolves to an object
                 *    keeping the application info parameters with values
                 */
                getInfo: function (aParameters) {
                    return AppInfoParameters.getInfo(aParameters, oCurrentApplication);
                },
                getAllAppInfo: function (bValues) {
                    return AppInfoParameters.getAllAppInfo(bValues, oCurrentApplication, oComponentInstance, oApplicationContainer, sApplicationType)
                        .then(function (oData) {
                            if (bValues === true) {
                                oData.applicationType = oCurrentApplication.applicationType;
                                oData.homePage = oCurrentApplication.homePage;
                            } else {
                                oData.applicationType = { value: oCurrentApplication.applicationType };
                                oData.homePage = { value: oCurrentApplication.homePage };
                            }
                            return oData;
                        });
                },
                getSystemContext: function () {
                    var oCurrentApp = AppConfiguration.getCurrentApplication() || {};
                    var sContentProviderId = oCurrentApp.contentProviderId /* a content provider id */ || ""/* i.e., the local system */;

                    return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                        .then(function (ClientSideTargetResolutionService) {
                            return ClientSideTargetResolutionService.getSystemContext(sContentProviderId);
                        });
                },
                /**
                 * Emits an event when disableKeepAliveAppRouterRetrigger API is called
                 * This API should be used only by Fiori Elements team
                 *
                 * @param {boolean} bDisableRouterRetrigger
                 *     A flag to disable or enable the router's re-trigger
                 *     when a keep-alive application is restored
                 * @since 1.98
                 * @private
                 * @alias sap.ushell.services.AppLifeCycle#disableKeepAliveAppRouterRetrigger
                 */
                disableKeepAliveAppRouterRetrigger: function (bDisableRouterRetrigger) {
                    getAppIntent().then(function (oIntent) {
                        EventHub.emit("disableKeepAliveRestoreRouterRetrigger", {
                            disable: bDisableRouterRetrigger,
                            intent: oIntent,
                            componentId: oCurrentApplication.componentInstance.oContainer.sId,
                            date: Date.now()
                        });
                    });
                }
            };

            setTimeout(function () {
                oEventProvider.fireEvent(S_APP_LOADED_EVENT, oCurrentApplication);
                if (window.QUnit === undefined && sap.ushell.Container.inAppRuntime() === false) {
                    oCurrentApplication.getAllAppInfo(true).then(function (data) {
                        MessageBrokerEngine.publish("flp-app-info", "FLP", Date.now().toString(), "new app info", "*" , data);
                    });
                }
            }, 0);

        }
    }

    AppLifeCycle.hasNoAdapter = true;
    return AppLifeCycle;

}, true/* bExport */);
