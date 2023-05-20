// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "./History",
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/base/util/isPlainObject",
    "sap/m/InstanceManager",
    "sap/ui/core/Component",
    "sap/ui/core/Configuration",
    "sap/ui/core/Core",
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/core/routing/History",
    "sap/ui/Device",
    "sap/ui/performance/Measurement",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Storage",
    "sap/ushell/ApplicationType",
    "sap/ushell/bootstrap/SchedulingAgent",
    "sap/ushell/components/_HeaderManager/ControlManager",
    "sap/ushell/components/applicationIntegration/AppLifeCycle",
    "sap/ushell/components/applicationIntegration/relatedServices/RelatedServices",
    "sap/ushell/components/HeaderManager",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/performance/FesrEnhancer",
    "sap/ushell/renderers/fiori2/LogonFrameProvider",
    "sap/ushell/resources",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/UserActivityLog",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils"
], function (
    History,
    Log,
    extend,
    isPlainObject,
    InstanceManager,
    Component,
    Configuration,
    Core,
    library,
    Controller,
    HashChanger,
    Ui5History,
    Device,
    Measurement,
    hasher,
    jQuery,
    Storage,
    ApplicationType,
    SchedulingAgent,
    HeaderControlManager,
    AppLifeCycleAI,
    RelatedServices,
    HeaderManager,
    Config,
    EventHub,
    ushellLibrary,
    FesrEnhancer,
    LogonFrameProvider,
    ushellResources,
    AppConfiguration,
    UserActivityLog,
    utils,
    WindowUtils
) {
    "use strict";

    // shortcut for sap.ui.core.routing.HistoryDirection
    var Ui5HistoryDirection = library.routing.HistoryDirection;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /* don't delay these cause they are needed for direct bookmarks */

    // create global model and add some demo data
    var closeAllDialogs = true;
    var bPreviousPageDirty = false;
    var oShellModel;
    var ShellModel = AppLifeCycleAI.getElementsModel();
    var oModel;
    var oEPCMNavigationMode = {
        embedded: 0,
        newWindowThenEmbedded: 1,
        newWindow: 1,
        replace: 0
    };
    var oNavigationMode = {
        embedded: "embedded",
        newWindowThenEmbedded: "newWindowThenEmbedded",
        newWindow: "newWindow",
        replace: "replace"
    };
    var oConfig = {};

    // track performance marks and enhance UI5's Frontend Sub Records with FLP specific information
    // Note: This can not yet be done using the SchedulingAgent as plain modules cannot be loaded and
    // making it a UI5 component would be overhead (performance).
    FesrEnhancer.init();

    /**
     * @name sap.ushell.renderers.fiori2.Shell
     * @extends sap.ui.core.mvc.Controller
     * @public
     */
    return Controller.extend("sap.ushell.renderers.fiori2.Shell", {
        /**
         * SAPUI5 lifecycle hook.
         * @public
         */
        _aDoables: [],

        onComponentTargetDisplay: function (oEvent) {
            var oParameters = oEvent.getParameters();
            var oContainer = oParameters.control;
            var oComponentContainer = oParameters.object;

            if (this.bRestorePreviousHash) {
                this.bRestorePreviousHash = false;
            }

            oContainer.navTo("centerViewPort", oComponentContainer.getId(), "show");
        },

        onInit: function () {
            var that = this;

            var oRouter = Component.getOwnerComponentFor(this.getView()).getRouter();

            // TODO We still need to think about implementing a custom router to move the display handler from
            // this file to the custom router. Maybe use oRouter.attachBypassed?
            oRouter.getTarget("home").attachDisplay(this.onComponentTargetDisplay, this);
            oRouter.getTarget("appfinder").attachDisplay(this.onComponentTargetDisplay, this);
            oRouter.getTarget("pages").attachDisplay(this.onComponentTargetDisplay, this);
            oRouter.getTarget("workpages").attachDisplay(this.onComponentTargetDisplay, this);
            oRouter.getTarget("runtimeSwitcher").attachDisplay(this.onComponentTargetDisplay, this);
            oRouter.getTarget("wzsearch").attachDisplay(this.onComponentTargetDisplay, this);

            if (Config.last("/core/homeApp/enabled")) {
                oRouter.getTarget("homeapp").attachDisplay(this.onComponentTargetDisplay, this);
            }

            /*
             * Assign hash changer directly because otherwise a default one is used.
             *
             * Default hash changers for UI5 routers assume &/ is the separator for a nested component route.
             *
             * We must re-assign this otherwise an hash like `#Shell-appfinder&/userMenu' ends up in `#Shell-appfinder&/'
             * in the URL - &/userMenu part is eaten by the default hash changer.
             */
            oRouter.oHashChanger = HashChanger.getInstance();
            oRouter.initialize(true /*tell the router not to parse the current browser hash, and wait for ShellNavigation.init*/);

            this.bEnableHashChange = true;
            closeAllDialogs = true;
            var oView = this.getView();
            var mediaQ = window.matchMedia("(min-width: 600px)");
            var oViewConfig = (oView.getViewData() ? oView.getViewData().config : {}) || {};

            // The configuration is set by modifying the target `Shell-bootConfig` in the respective system,
            // such that if GUI applications (of type 'TR') should reuse an existing container if any,
            // then the parameter `renderers/fiori2/componentData/config/statefulApplicationContainer/GUI` must be set to `true`.
            AppLifeCycleAI.parseStatefulContainerConfiguration(oViewConfig.statefulApplicationContainer);
            var oApplicationModel = AppLifeCycleAI.shellElements().model();
            HeaderManager.init(oViewConfig, oApplicationModel);

            // Add global model to view
            this.initShellModel(oViewConfig, oApplicationModel);

            var fnUpdate = this.getView().updateShellAggregation;
            Core.byId("shell-header").updateAggregation = fnUpdate;
            Core.byId("shell").updateAggregation = fnUpdate;
            Core.byId("right-floating-container").updateAggregation = fnUpdate;
            Core.byId("shell-split").updateAggregation = fnUpdate;

            var handleMedia = function (mq) {
                Config.emit("/core/shell/model/isPhoneWidth", !mq.matches);
            };
            if (mediaQ.addListener) { // Assure that mediaMatch is supported(Not supported on IE9).
                mediaQ.addListener(handleMedia);
                handleMedia(mediaQ);
            }

            // Bind the translation model to this view
            oView.setModel(ushellResources.i18nModel, "i18n");

            Core.getEventBus().subscribe("externalSearch", this.externalSearchTriggered, this);
            Core.getEventBus().subscribe("sap.ushell", "appOpened", this.onAppOpened, this);
            Core.getEventBus().subscribe("allSearchFinished", this._logSearchActivity, this);
            // handling of configuration should be done before the code block below otherwise the doHashChange is
            // triggered before the personalization flag is disabled (URL may contain hash value which invokes navigation)
            this._setConfigurationToModel();

            // Doable objects are kept in a global array to enable their off-ing later on.
            this._aDoables = this._registerAndCreateEventHubDoables();

            oShellModel.addHeaderEndItem(["userActionsMenuHeaderButton"], false, ["home", "app", "minimal", "standalone", "embedded", "embedded-home", "lean"], true);

            // Actions to add to custom states
            var aActions = [];

            if (oViewConfig && !oViewConfig.moveContactSupportActionToShellHeader) {
                aActions.push("ContactSupportBtn");
            }

            this.history = new History();
            this.oViewPortContainer = Core.byId("viewPortContainer");
            AppLifeCycleAI.init(oViewConfig.appState, this.oViewPortContainer, oViewConfig.rootIntent, oViewConfig.disableHomeAppCache, {
                ownerComponent: this.getOwnerComponent()
            }, aActions, oViewConfig.cacheConfiguration);

            // init Shell Navigation
            var initShellNavigation = function (oShellNavigation, oAppLifeCycleService) {
                this.oShellNavigation = oShellNavigation;
                this.oShellNavigation.registerPrivateFilters(oAppLifeCycleService);

                // register the router in the ShellNavigation to let it skip the split of hash before firing the hashChange event
                this.oShellNavigation.registerExtraRouter(oRouter);
                this.oShellNavigation.registerNavigationFilter(this._handleEmptyHash.bind(this));
                // must be after event registration (for synchronous nav target resolver calls)
                this.oShellNavigation.init(this.doHashChange.bind(this));

                this.oShellNavigation.registerNavigationFilter(this._disableSourceAppRouter.bind(this));

                this.oShellNavigation.registerNavigationFilter(this.handleDataLoss.bind(this));

                this.oShellNavigation.hashChanger.attachEvent("hashChanged", function (oHashChange) {
                    //FIX for internal incident #1980317281 - In general, hash structure in FLP is splitted into 3 parts:
                    //A - application identification & B - Application parameters & C - Internal application area
                    // Now, when an IFrame changes its hash, it sends PostMessage up to the FLP. The FLP does 2 things: Change its URL
                    // and send a PostMessage back to the IFrame. This fix, initiated in the PostMessageAPI.js, blocks only
                    // the message back to the IFrame.
                    if (window.hasher.disableBlueBoxHashChangeTrigger === true) {
                        return;
                    }
                    if (oHashChange.mParameters && that.oShellNavigation.hashChanger.isInnerAppNavigation(oHashChange.mParameters.newHash, oHashChange.mParameters.oldHash)) {
                        AppLifeCycleAI.postMessageToIframeApp("sap.ushell.appRuntime", "innerAppRouteChange", {
                            oHash: oHashChange.mParameters
                        });
                    }

                    AppLifeCycleAI.postMessageToIframeApp("sap.ushell.appRuntime", "hashChange", {
                        sHash: oHashChange.mParameters.fullHash
                    });
                });

                // enable the direct app start and tests to wait for the initialization
                EventHub.emit("ShellNavigationInitialized");
            }.bind(this);

            Promise.all([
                sap.ushell.Container.getServiceAsync("URLParsing"),
                sap.ushell.Container.getServiceAsync("ShellNavigation"),
                sap.ushell.Container.getServiceAsync("AppLifeCycle")
            ])
                .then(function (aServices) {
                    this.oURLParsing = aServices[0];
                    var oShellNavigation = aServices[1];
                    this._oAppLifeCycleService = aServices[2];

                    initShellNavigation(oShellNavigation, this._oAppLifeCycleService);
                }.bind(this));

            sap.ushell.Container.setLogonFrameProvider(this._getLogonFrameProvider());

            if (Device.system.desktop) {
                sap.ui.require(["sap/ushell/renderers/fiori2/AccessKeysHandler"], function (AccessKeysHandler) {
                    AccessKeysHandler.init(oModel);
                });
            }

            window.onbeforeunload = function () {
                if (sap.ushell.Container && sap.ushell.Container.getDirtyFlag()
                    // workaround: skip data-loss-warning in IE when app is NWBC-based (as there is a separate implementation)
                    && !(Device.browser.name === Device.browser.BROWSER.INTERNET_EXPLORER
                        && AppLifeCycleAI.getCurrentApplication().container.getApplicationType() === ApplicationType.NWBC.type)
                ) {
                    if (!ushellResources.browserI18n) {
                        ushellResources.browserI18n = ushellResources.getTranslationModel(window.navigator.language).getResourceBundle();
                    }
                    return ushellResources.browserI18n.getText("dataLossExternalMessage");
                }

                return undefined;
            };

            if (Config.last("/core/shell/model/contentDensity")) {
                // do not call _applyContentDensity,
                // no promise that the component-preload is fully loaded and _applyContentDensity loads the root application.
                // we only want to display the shell in its default state, once the root application will be loaded
                // then the _applyContentDensity will be called with promise that component-preload loaded.
                AppLifeCycleAI.getAppMeta()._applyContentDensityClass();
            }

            this.initShellUIService();

            if (!oViewConfig.disableSignOut && (oViewConfig.sessionTimeoutTileStopRefreshIntervalInMinutes > 0 || oViewConfig.sessionTimeoutReminderInMinutes > 0)) {
                this._createSessionHandler(oViewConfig);
            }

            if (Device.system.desktop) {
                sap.ui.require(["sap/ushell/renderers/fiori2/AccessKeysHandler"], function (AccessKeysHandler) {
                    this.oViewPortContainer.onfocusin = function () {
                        // focus not in the shell
                        AccessKeysHandler.bFocusOnShell = false;
                        AccessKeysHandler.bFocusPassedToExternalHandlerFirstTime = false;
                    };

                    this.oViewPortContainer.onfocusout = function () {
                        // focus in the shell
                        AccessKeysHandler.bFocusOnShell = true;
                        AccessKeysHandler.bFocusPassedToExternalHandlerFirstTime = true;
                    };
                }.bind(this));
            }
        },

        shellUpdateAggItem: function (sId, oContext) {
            return Core.byId(oContext.getObject());
        },

        getViewPortContainer: function () {
            return Core.byId("viewPortContainer");
        },

        /**
         * Creates the EventHub event bindings and returns them in a Array of doables.
         *
         * @returns {object[]} A list of "Doable" objects
         */
        _registerAndCreateEventHubDoables: function () {
            var aDoables = [
                EventHub.once("CenterViewPointContentRendered").do(this._loadCoreExt.bind(this)),
                EventHub.once("PagesRuntimeRendered").do(this._loadCoreExt.bind(this)),
                EventHub.once("AppRendered").do(this._loadCoreExtNonUI5.bind(this)),
                EventHub.on("toggleContentDensity").do(this.toggleContentDensity.bind(this)),
                EventHub.on("ShellFloatingContainerDockedIsResized").do(this._onResizeWithDocking.bind(this)),
                EventHub.on("LaunchpadCustomRouterRouteMatched").do(this._centerViewPort.bind(this)),

                EventHub.once("CoreResourcesComplementLoaded").do(this._onCoreResourcesComplementLoaded.bind(this)),
                EventHub.once("loadRendererExtensions").do(this._loadRendererExtensionPlugins.bind(this)),
                EventHub.once("loadUsageAnalytics").do(this._loadUsageAnalytics.bind(this)),
                EventHub.once("loadWarmupPlugins").do(this._loadWarmupPlugins.bind(this)),
                EventHub.once("loadTrackingActivitiesSetting").do(this._loadTrackingActivitiesSetting.bind(this)),
                EventHub.on("centerViewPort").do(this._centerViewPort.bind(this))
            ];
            return aDoables;
        },

        initShellModel: function (oConfigForModel, oApplicationModel) {
            oShellModel = ShellModel;
            oShellModel.init(oConfigForModel, oApplicationModel);
            oModel = this.getView().getViewData().shellModel;
            Config.emit("/core/shell/model/personalization", Config.last("/core/shell/enablePersonalization"));
        },

        initShellUIService: function () {
            AppLifeCycleAI.initShellUIService({
                fnOnBackNavigationChange: this.onBackNavigationChange.bind(this)
            });

            if (oConfig.enableOnlineStatus) {
                sap.ui.require(["sap/ushell/ui5service/UserStatus"], function (UserStatus) {
                    this.oUserStatus = new UserStatus({
                        scopeObject: this.getOwnerComponent(),
                        scopeType: "component"
                    });
                }.bind(this));
            }
        },

        /*
         * This method change the back navigation handler with custom logic in the shell header when the ShellUIService#setBackNavigation method is called.
         *
         * This method currently assumes that the application is displayed in the "minimal" state (no home button present).
         */
        onBackNavigationChange: function (oEvent) {
            AppLifeCycleAI.setBackNavigationChanged(true);
            var fnCallback = oEvent.getParameters().data;
            var oCurrentStateModel = Config.last("/core/shell/model/currentState");

            if (fnCallback) {
                AppLifeCycleAI.service().setNavigateBack(fnCallback);

                if (oCurrentStateModel.stateName === "minimal" || oCurrentStateModel.stateName === "standalone" || oCurrentStateModel.stateName === "embedded") {
                    sap.ushell.Container.getRenderer("fiori2").showHeaderItem("backBtn", true);
                }
            } else {
                //if no callback is provided we set the default handler: history back
                AppLifeCycleAI.service().resetNavigateBack();
            }
        },

        toggleContentDensity: function (oData) {
            var isCompact = oData.contentDensity === "compact";
            AppLifeCycleAI.getAppMeta()._applyContentDensityByPriority(isCompact, true);
        },

        _handleEmptyHash: function (sHash) {
            sHash = (typeof sHash === "string") ? sHash : "";
            sHash = sHash.split("?")[0];
            if (sHash.length === 0) {
                var oViewData = this.getView() ? this.getView().getViewData() : {};
                oConfig = oViewData.config || {};
                // Migration support: we have to set rootIntent empty
                // And continue navigation in order to check if  empty hash is resolved locally
                if (oConfig.migrationConfig) {
                    return this.oShellNavigation.NavigationFilterStatus.Continue;
                }
                if (oConfig.rootIntent) {
                    window.setTimeout(function () {
                        window.hasher.setHash(oConfig.rootIntent);
                    }, 0);
                    return this.oShellNavigation.NavigationFilterStatus.Abandon;
                }
            }
            return this.oShellNavigation.NavigationFilterStatus.Continue;
        },

        _setConfigurationToModel: function () {
            var oViewData = this.getView().getViewData();

            if (oViewData) {
                oConfig = oViewData.config || {};
            }
            if (oConfig) {
                if (oConfig.states) {
                    ShellModel.extendStates(oConfig.states);
                    HeaderManager.extendStates(oConfig.states);
                }

                if (oConfig.enableSetTheme !== undefined) {
                    oModel.setProperty("/setTheme", oConfig.enableSetTheme);
                }

                // Compact Cozy mode
                oModel.setProperty("/contentDensity", oConfig.enableContentDensity === undefined ? true : oConfig.enableContentDensity);

                // Check if the configuration is passed by html of older version(1.28 and lower)
                if (oConfig.migrationConfig !== undefined) {
                    oModel.setProperty("/migrationConfig", oConfig.migrationConfig);
                }
                // User default parameters settings
                if (oConfig.enableUserDefaultParameters !== undefined) {
                    oModel.setProperty("/userDefaultParameters", oConfig.enableUserDefaultParameters);
                }

                if (oConfig.disableHomeAppCache !== undefined) {
                    oModel.setProperty("/disableHomeAppCache", oConfig.disableHomeAppCache);
                }
                // xRay enablement configuration
                oModel.setProperty("/enableHelp", Config.last("/core/extension/enableHelp"));
                oModel.setProperty("/searchAvailable", (oConfig.enableSearch !== false));
            }
        },
        _loadTrackingActivitiesSetting: function (eventData) {
            // Tracking activities
            this._getPersData({
                container: "flp.settings.FlpSettings",
                item: "userActivitesTracking"
            }).then(function (enableTrackingActivity) {
                if (enableTrackingActivity === undefined) {
                    enableTrackingActivity = true;
                }
                oModel.setProperty("/enableTrackingActivity", enableTrackingActivity);
                EventHub.emit("StepDone", eventData.stepName);
            }).catch(function (error) {
                EventHub.emit("StepFailed", eventData.stepName);
                Log.error(
                    "Failed to load tracking activities state from the personalization", error,
                    "sap.ushell.components.flp.settings.FlpSettings");
            });
        },

        _getPreviousPageDirty: function () {
            return bPreviousPageDirty;
        },

        _setPreviousPageDirty: function (bState) {
            bPreviousPageDirty = bState;
        },

        getModelConfiguration: function () {
            var oViewData = this.getView().getViewData();
            var oShellConfig;

            if (oViewData) {
                var oConfiguration = oViewData.config || {};
                oShellConfig = extend({}, oConfiguration);
            }
            delete oShellConfig.applications;
            return oShellConfig;
        },

        /**
         * This method will be used by the Container service in order to create, show and destroy a Dialog control with an inner iframe.
         * The iframe will be used for rare scenarios in which additional authentication is required.
         * This is mainly related to SAML 2.0 flows. The api sequence will be managed by UI2 services.
         *
         * @returns {{create: Function, show: Function, destroy: Function}} Logon Frame Provider interface
         * @private
         */
        _getLogonFrameProvider: function () {
            return LogonFrameProvider;
        },

        onExit: function () {
            this._aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
            this._aDoables = [];

            Core.getEventBus().unsubscribe("externalSearch", this.externalSearchTriggered, this);
            Core.getEventBus().unsubscribe("allSearchFinished", this._logSearchActivity, this);
            Core.getEventBus().unsubscribe("sap.ushell", "appOpened", this.onAppOpened, this);

            // Some qUnits destroy the shell very early, check if oShellNavigation exists
            if (this.oShellNavigation) {
                this.oShellNavigation.hashChanger.destroy();
            }

            if (this.getView() && this.getView().destroyDanglingControls) {
                this.getView().destroyDanglingControls();
            }

            var oShellHeader = Core.byId("shell-header");
            if (oShellHeader && oShellHeader.destroy) {
                oShellHeader.destroy();
            }

            HeaderManager.destroy();
            HeaderControlManager.destroy();

            UserActivityLog.deactivate();
            oShellModel.destroy();
            AppLifeCycleAI.shellElements().clean();
            AppLifeCycleAI.destroy();
            oShellModel = undefined;
        },

        /**
         * @returns {object} the current router of the current application component
         */
        _getCurrentAppRouter: function () {
            var oAppLifeCycle = this._oAppLifeCycleService;
            var oCurrentApplication = oAppLifeCycle && oAppLifeCycle.getCurrentApplication && oAppLifeCycle.getCurrentApplication();
            var oComponentInstance = oCurrentApplication && oCurrentApplication.componentInstance;

            if (oComponentInstance) {
                return oComponentInstance.getRouter();
            }
            return null;
        },

        /**
         * If the navigation is not an inner app navigation, this function stops the router of the old application.
         *
         * @param {string} newHash new url hash
         * @param {string} oldHash old url hash
         *
         * @returns {string} ShellNavigation.NavigationFilterStatus
         */
        _disableSourceAppRouter: function (newHash, oldHash) {
            if (!this.bEnableHashChange || this.bRestorePreviousHash) {
                return this.oShellNavigation.NavigationFilterStatus.Continue;
            }

            var bAppSpecificChange = this.oShellNavigation.hashChanger.isInnerAppNavigation(newHash, oldHash);
            if (!bAppSpecificChange) {
                var oCurrentAppRouter = this._getCurrentAppRouter();

                if (oCurrentAppRouter) {
                    oCurrentAppRouter.stop();
                }
            }

            return this.oShellNavigation.NavigationFilterStatus.Continue;
        },

        /**
         * Makes sure that the router is not stopped after a failed / aborted navigation.
         * We ignore the current hash when re-initializing the router because we are handling cases that restore the old state
         * (nothing should change application side when the router is resumed).
         */
        _resumeAppRouterIgnoringCurrentHash: function () {
            var oAppRouter = this._getCurrentAppRouter();

            if (oAppRouter) {
                oAppRouter.initialize(true /* bIgnoreInitialHash */);
            }
        },

        /**
         * Navigation Filter function registered with ShellNavigation service.
         * Triggered on each navigation.
         * Aborts navigation if there are unsaved data inside app(getDirtyFlag returns true).
         * For non-IE browsers the dirtyState=true gets handled asynchronously by undoing the navigation and redoing the navigation.
         * In case of an explace navigation there is no data loss popup.
         *
         * @param {string} targetIntent The new intent to navigate to.
         * @param {string} currentIntent The current intent before navigation was triggered.
         * @returns {string|object} A navigation filter status object or string.
         * @private
         */
        handleDataLoss: function (targetIntent, currentIntent) {
            var oShellNavigationHashChanger = this.oShellNavigation.hashChanger;
            var bReloadApplication = oShellNavigationHashChanger.getReloadApplication();

            if (this.bReloadApplication !== null && this.bReloadApplication !== undefined) {
                oShellNavigationHashChanger.setReloadApplication(this.bReloadApplication);
                this.bReloadApplication = null;
            }

            // We are navigating from empty hash to rootIntent
            if (currentIntent === "" || hasher.disableBlueBoxHashChangeTrigger === true) {
                return this.oShellNavigation.NavigationFilterStatus.Continue;
            }

            if (!this.bEnableHashChange && !this.bRedoNavigation) {
                this.bEnableHashChange = true;

                return this.oShellNavigation.NavigationFilterStatus.Custom;
            }

            if (this.bRestorePreviousHash) {
                return this.oShellNavigation.NavigationFilterStatus.Continue;
            }

            // User confirmed the data loss and now we do the hash change again
            if (this.bRedoNavigation) {
                this.bRedoNavigation = false;
                this.bEnableHashChange = true;
                this.bExplaceNavigation = false;
                return this.oShellNavigation.NavigationFilterStatus.Continue;
            }

            // Do we do an ex-place navigation?
            var oParsedHash = this.oURLParsing.parseShellHash(targetIntent);
            var bBuiltInIntent = sap.ushell.Container.getRenderer()._isBuiltInIntent(oParsedHash);
            var aParsedNavMode = oParsedHash.params["sap-ushell-navmode"];
            var sNavMode = aParsedNavMode && aParsedNavMode[0];

            // Built-in intents must never be opened ex-place, therefore only continue with non built-in Intents
            if (!bBuiltInIntent && (this.bExplaceNavigation || sNavMode === "explace" || sNavMode === "frameless")) {
                // Yes, just continue the navigation without a dirtyFlag popup
                this.bExplaceNavigation = false;
                return this.oShellNavigation.NavigationFilterStatus.Continue;
            }

            // In case the async dirtyState provider is NOT set we only have to check the sync dirtyState.
            // TODO: Simplify (Remove) the shortcut once the OPA test iframe issue is solved.
            // The OPA iframe handler overwrites some hasher methods which results in a confused ushell navigation flow.
            var bIsDirty = sap.ushell.Container.getDirtyFlag();
            var bIsAsyncDirtyStateProviderSet = sap.ushell.Container.isAsyncDirtyStateProviderSet();
            if (!bIsAsyncDirtyStateProviderSet && !bIsDirty) {
                bPreviousPageDirty = bIsDirty;
                return this.oShellNavigation.NavigationFilterStatus.Continue;
            }

            /*
            The dirtyState is either true or has to be retrieved async.
            After the hash changes we evaluate the dirtyState asynchronously
            and redo the navigation in case it is false. In case it is true we do additional logic
            _restoreHashUsingAction returns the NavigationFilterStatus Custom.
            */
            var bIsBackNavigation = Ui5History.getInstance().getHistoryStateOffset() < 0;
            Promise.all([
                this._waitForHash(currentIntent),
                sap.ushell.Container.getServiceAsync("NavTargetResolution"),
                sap.ushell.Container.getDirtyFlagsAsync()
            ])
                .then(function (aResults) {
                    var oService = aResults[1];
                    var bIsDirty = aResults[2];

                    /*
                    Update the internal dirtyFlag to match the current dirtyFlag
                    This is needed in case of a hashChangeFailure. When we navigate to a broken app the
                    controller does not ask for the dirtyState therefore we need to be able to restore it
                    */
                    bPreviousPageDirty = bIsDirty;

                    if (!bIsDirty) {
                        this.bRedoNavigation = true;
                        this._restoreHashUsingAction(targetIntent, "redo");
                        return;
                    }

                    // Built-in intents can not be resolved, so we need to check
                    // first if the user is trying to navigate to one of them.
                    if (bBuiltInIntent) {
                        // We assume built-in intents are always in-place, so we need user input
                        if (this._handleDirtyStateUserConfirm()) {
                            this.bRedoNavigation = true;
                            this._restoreHashUsingAction(targetIntent, "redo");
                        }
                    } else {
                        // resolveHashFragment expects a full hash, this filter always gets the target without '#'
                        var sTargetHash = "#" + targetIntent;
                        oService.resolveHashFragment(sTargetHash)
                            .then(function (oResolvedHashFragment) {
                                var bIsExplaceNavigation = oResolvedHashFragment.targetNavigationMode === "explace" || oResolvedHashFragment.targetNavigationMode === "frameless";
                                var bIsBackNavigationAndNewWindow = bIsBackNavigation && oResolvedHashFragment.navigationMode === oNavigationMode.newWindowThenEmbedded;

                                if (bIsExplaceNavigation && (!bIsBackNavigationAndNewWindow)) {
                                    this.bExplaceNavigation = true;
                                    this.bRedoNavigation = true;
                                    this._restoreHashUsingAction(targetIntent, "redo");
                                } else if (this._handleDirtyStateUserConfirm()) {
                                    this.bRedoNavigation = true;
                                    this.bReloadApplication = bReloadApplication;
                                    this._restoreHashUsingAction(targetIntent, "redo");
                                }
                            }.bind(this))
                            .catch(function () {
                                // If the resolution failed, redoing the navigation will trigger the
                                // error pop-up.
                                this.bRedoNavigation = true;
                                this._restoreHashUsingAction(targetIntent, "redo");
                            }.bind(this));
                    }
                }.bind(this));

            // Returns this.oShellNavigation.NavigationFilterStatus.Custom
            return this._restoreHashUsingAction(currentIntent, "undo");
        },

        /**
         * Wait for the given hash to be loaded by the browser.
         *
         * @param {string} hash The hash to wait for.
         * @returns {Promise<void>} A promise that is resolved once the given hash was found. It is not rejected.
         * @since 1.86.0
         * @private
         */
        _waitForHash: function (hash) {
            var sHash = "#" + hash;

            return new Promise(function (resolve) {
                var fnWaitChange = function () {
                    var bChanged = sHash === decodeURIComponent(window.location.hash);

                    if (bChanged) {
                        window.removeEventListener("hashchange", fnWaitChange);
                        resolve();
                    }
                };

                window.addEventListener("hashchange", fnWaitChange);
            });
        },

        /**
         * Shows a browser-popup for the user to confirm that they want to discard their changes.
         * @returns {boolean} True if the popup has been confirmed by the user, otherwise false.
         *
         * @private
         * @since 1.86.0
         */
        _handleDirtyStateUserConfirm: function () {
            // eslint-disable-next-line no-alert
            if (window.confirm(ushellResources.i18n.getText("dataLossInternalMessage"))) {
                sap.ushell.Container.setDirtyFlag(false);

                AppLifeCycleAI.postMessageToIframeApp("sap.ushell.appRuntime", "setDirtyFlag", {
                    bIsDirty: false
                });

                if (RelatedServices.isBackNavigation() === true) {
                    RelatedServices.resetBackNavigationFlag();
                }

                bPreviousPageDirty = true;
                return true;
            }

            return false;
        },

        /**
         * Undoes or redoes navigation. Restores the previous or next hash and the navigation history that lead to it.
         *
         * @param {string} sHash The old hash that should be reset.
         * @param {string} sAction Whether a 'redo' or 'undo' action is to be performed.
         * @returns {object} The navigation filter status.
         * @since 1.86.0
         * @private
         */
        _restoreHashUsingAction: function (sHash, sAction) {
            var bWasHistoryEntryReplaced = this.oShellNavigation.wasHistoryEntryReplaced();
            var oRestoreStrategy = this._getRestoreHashStrategy(bWasHistoryEntryReplaced, sAction);

            this._resumeAppRouterIgnoringCurrentHash();

            return this._restoreHash(oRestoreStrategy, sHash);
        },

        /**
         * Decides the strategy to use when restoring an old hash in an attempt to undo a forward or a backward navigation.
         * This method is mostly used for data loss handling, after a user confirmed that they want to stay in the current application.
         *
         * @param {boolean} bNavToReplacedHash Whether the last navigation had replaced the history without adding a new entry.
         * @param {string} sAction The action to be carried out.
         * @returns {object} The strategy to use to restore the previous shell hash which is one of:
         *     "historyBack", "replaceHash", "historyForward" and the number of steps to restore the hash.
         */
        _getRestoreHashStrategy: function (bNavToReplacedHash, sAction) {
            /**
             * The bNavToReplacedHash needs to be checked first because the iHistoryStateOffset is undefined when:
             *  * hash is replaced
             *  * new hash is given
             *  * in browser where history pushState isn't fully supported
             */
            if (bNavToReplacedHash) {
                return {
                    strategy: "replaceHash",
                    stepCount: 0
                };
            }

            // This is a workaround:
            // Notifying the UI5 history via the hashChanged event triggers unwanted navigation.
            // But without the notify the offset gets out of sync with the current state and stacks up.
            // We are now assuming that we only do (and undo) single navigation steps
            var sStrategy;
            var iHistoryStateOffset = Ui5History.getInstance().getHistoryStateOffset();
            if (iHistoryStateOffset === undefined || iHistoryStateOffset >= 0) {
                // Forward
                iHistoryStateOffset = 1;
            } else if (iHistoryStateOffset < 0) {
                // Backward
                iHistoryStateOffset = -1;
            }

            // If the history offset exists, we use the absolute value because later we use dedicated functions like _windowHistoryBack
            // and _windowHistoryForward for back- and forwards navigation, respectively.
            // Calling either of those function with a negative value would yield the exact opposite.
            // TODO: Actually, we could refactor this to call history.go directly, so we don't have to transform it.

            if (sAction === "undo") {
                if (iHistoryStateOffset < 0) {
                    // Went backwards
                    sStrategy = "historyForward";
                } else {
                    // Went forwards
                    sStrategy = "historyBack";
                }

                this.sLastUndoStrategy = sStrategy;
            } else {
                switch (this.sLastUndoStrategy) {
                    case "historyBack":
                        sStrategy = "historyForward";
                        break;
                    case "historyForward":
                        sStrategy = "historyBack";
                        break;
                    default:
                        sStrategy = "replaceHash";
                }
            }

            return {
                strategy: sStrategy,
                stepCount: 1
            };
        },

        /**
         * Restores the previous or next hash using the given restore-strategy.
         * If the restore strategy is 'replaceHash', the given hash is used.
         *
         * @param {object} oRestoreStrategy A restore strategy containing a strategy such as 'historyBack', 'historyForward' or 'replaceHash'.
         * @param {string} sHash A hash without hash sign to be set if the 'replaceHash' strategy is to be used.
         * @returns {object} The Custom navigation filter status.
         * @throws If the given restore strategy is not recognized.
         * @private
         */
        _restoreHash: function (oRestoreStrategy, sHash) {
            var oNavigationFilterStatus = {
                status: this.oShellNavigation.NavigationFilterStatus.Custom,
                hash: ""
            };
            switch (oRestoreStrategy.strategy) {
                case "historyBack":
                    this.bEnableHashChange = false;
                    this._windowHistoryBack(oRestoreStrategy.stepCount);
                    break;
                case "historyForward":
                    this.bEnableHashChange = false;
                    this._windowHistoryForward(oRestoreStrategy.stepCount);
                    break;
                case "replaceHash":
                    this.bEnableHashChange = false;
                    hasher.replaceHash(sHash);
                    break;
                default:
                    throw new Error("Cannot execute unknown navigation strategy");
            }

            return oNavigationFilterStatus;
        },

        /**
         * Checks whether an application is cold started.
         * This method is scoped to checking the cold start conditions of applications only.
         *
         * A cold start state occurs whenever the user has previously opened the window.
         *
         * - page is refreshed
         * - URL is pasted in a new window
         * - user opens the page and pastes a URL
         *
         * @return {boolean} whether the application is in a cold start state
         */
        _isColdStart: function () {
            var oRenderer = sap.ushell.Container.getRenderer("fiori2");
            var bNoCoreViewNavigated = !oRenderer || !oRenderer.getCurrentCoreView();
            if (this.history.getHistoryLength() <= 1 && bNoCoreViewNavigated) {
                return true;
            }
            this._isColdStart = function () {
                return false;
            };
            return false;
        },

        _setEnableHashChange: function (bValue) {
            this.bEnableHashChange = bValue;
        },

        /**
         * Triggers the app-usage mechanism to log an openApp action.
         *
         * @param {object} oRecentActivity An object containing details of a recently opened app
         * @returns {Promise} A promise that is resolved once the action is logged
         * @private
         */
        _logRecentActivity: function (oRecentActivity) {
            // In a direct app start the logging happens before the user setting is loaded
            if (!this.oInitialEnableTrackingPromise) {
                // The initial value was overwritten by now
                if (Config.last("/core/shell/model/enableTrackingActivity") !== undefined) {
                    this.oInitialEnableTrackingPromise = Promise.resolve();
                } else {
                    this.oInitialEnableTrackingPromise = new Promise(function (resolve, reject) {
                        Config.once("/core/shell/model/enableTrackingActivity").do(resolve);
                    });
                }
            }

            return this.oInitialEnableTrackingPromise.then(function () {
                if (Config.last("/core/shell/model/enableTrackingActivity")) {
                    return new Promise(function (resolve, reject) {
                        AppConfiguration.addActivity(oRecentActivity)
                            .done(resolve)
                            .fail(reject);
                    });
                }
                Log.warning("Tracking is not enabled", null, "sap.ushell.renderers.fiori2.Shell.controller");
                return undefined;
            });
        },

        _logApplicationUsage: function (sFixedShellHash) {
            // Triggering the app usage mechanism to log this openApp action.
            // Using setTimeout in order not to delay the openApp action
            if (sap.ushell.Container) {
                sap.ushell.Container.getServiceAsync("UserRecents").then(function (oUserRecentsService) {
                    oUserRecentsService.addAppUsage(sFixedShellHash);
                });
            }
        },

        /**
         * Sets application container based on information in URL hash.
         *
         * This is a callback registered with NavService. It's triggered whenever the url (or the hash fragment in the url) changes.
         *
         * NOTE: when this method is called, the new URL is already in the address bar of the browser.
         * Therefore back navigation is used to restore the URL in case of wrong navigation or errors.
         *
         * @param {string} sShellHash shell hash
         * @param {string} sAppPart application part
         * @param {string} sOldShellHash previous shell hash
         * @param {string} sOldAppPart previous application part
         * @param {object} oParseError parse error
         * @returns {Promise} promise
         * @public
         */
        doHashChange: function (sShellHash, sAppPart, sOldShellHash, sOldAppPart, oParseError) {
            //Performance Debug
            Measurement.start("FLP:ShellController.doHashChange", "doHashChange", "FLP");
            utils.setPerformanceMark("FLP-ShellController-doHashChange-begin");
            EventHub.emit("trackHashChange", sShellHash);

            var oDashboard = Core.byId("sapUshellDashboardPage");
            if (oDashboard) {
                oDashboard.setBlocked(true);
                oDashboard.setBusy(true);
            }

            return this
                ._doHashChange(this, sShellHash, sAppPart, sOldShellHash, sOldAppPart, oParseError)
                .then(function () {
                    Measurement.end("FLP:ShellController.doHashChange");
                }, function (vError) {
                    Measurement.end("FLP:ShellController.doHashChange");
                    EventHub.emit("doHashChangeError", Date.now());
                    if (oDashboard) {
                        oDashboard.setBlocked(false);
                        oDashboard.setBusy(false);
                    }
                    // throw new Error(vError);
                });
        },

        _doHashChange: function (oShellController, sShellHash, sAppPart, sOldShellHash, sOldAppPart, oParseError) {
            /*
             * reset here because the result of wasHistoryEntryReplaced is only useful in navigation filters
             * and might give inconsistent results after this point.
             */
            this._wasHistoryEntryReplaced = this.oShellNavigation.wasHistoryEntryReplaced();
            this.oShellNavigation.resetHistoryEntryReplaced();
            var oInMemoryApplicationInstance;

            if (!this.bEnableHashChange) {
                this.bEnableHashChange = true;
                return jQuery.when();
            }
            //When the application is opened in the new tab, the ShellHashEvent should be fired in order to update UI5 hasher,
            //but the application should not be resolved again.
            if (this.bRestorePreviousHash) {
                this.bRestorePreviousHash = false;
                return jQuery.when();
            }

            if (oParseError) {
                oShellController.hashChangeFailure(
                    oShellController.history.getHistoryLength(),
                    oParseError.message,
                    null,
                    "sap.ushell.renderers.fiori2.Shell.controller",
                    false
                );
                return jQuery.when();
            }

            var oDeferred = new jQuery.Deferred();

            if (InstanceManager && closeAllDialogs) {
                InstanceManager.closeAllDialogs();
                InstanceManager.closeAllPopovers();
            }
            closeAllDialogs = true;

            // save current history length to handle errors (in case)
            var iOriginalHistoryLength = oShellController.history.getHistoryLength();

            var sFixedShellHash = oShellController.fixShellHash(sShellHash);
            var sOldFixedShellHash = oShellController.fixShellHash(sOldShellHash);

            // track hash change
            oShellController.history.hashChange(sFixedShellHash, sOldShellHash);

            // we save the current-application before resolving the next navigation's fragment,
            // as in cases of navigation in a new window we need to set it back for the app-configuration to be consistent
            oShellController.currentAppBeforeNav = AppConfiguration.getCurrentApplication();

            oShellController._resolveHashFragment(sFixedShellHash)
                .then(function (oResolvedHashFragment, oParsedShellHash) {
                    // NOTE: AppConfiguration.setCurrentApplication was called with the currently resolved target.

                    var sIntent = oParsedShellHash ? oParsedShellHash.semanticObject + "-" + oParsedShellHash.action : "";
                    var oConfig = oShellController._getConfig();
                    var bComponentLoaded = !!(oResolvedHashFragment && oResolvedHashFragment.componentHandle);
                    // for SAPUI5 apps, the application type is still "URL" due to backwards compatibility, but the
                    // NavTargetResolution service already extracts the component name, so this can directly be used as indicator
                    var sTargetUi5ComponentName = oResolvedHashFragment && oResolvedHashFragment.ui5ComponentName;

                    // calculate effective Navigation Mode with resolution result and current Application,
                    // we will determine the next navigation mode.
                    oResolvedHashFragment = oShellController._calculateNavigationMode(oParsedShellHash, oResolvedHashFragment);

                    oShellController._handleEarlyNavigation(sFixedShellHash, sAppPart, oResolvedHashFragment).then(function (bProcessed) {
                        if (bProcessed !== true) {
                            // add application config to the application properties
                            if (oConfig && oConfig.applications && oConfig.applications[sIntent]) {
                                oResolvedHashFragment.applicationConfiguration = oConfig.applications[sIntent];
                            }

                            oInMemoryApplicationInstance = AppLifeCycleAI.getInMemoryInstance(sIntent, sFixedShellHash, sAppPart, sOldShellHash);

                            if (oInMemoryApplicationInstance.isInstanceSupported) {
                                oShellController._initiateApplication(oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength, sAppPart, sOldFixedShellHash, sOldAppPart);
                                oDeferred.resolve();
                                return;
                            }
                            if (bComponentLoaded || !sTargetUi5ComponentName) {
                                var oDeferredAppDestroy = new jQuery.Deferred();
                                if ((oResolvedHashFragment.applicationType === "URL"
                                    || oResolvedHashFragment.applicationType === "GUI"
                                    || oResolvedHashFragment.applicationType === "TR"
                                    || oResolvedHashFragment.applicationType === "NWBC"
                                    || oResolvedHashFragment.applicationType === "WDA"
                                    || oResolvedHashFragment.applicationType === "WCF")
                                    //&& oResolvedHashFragment.appCapabilities && oResolvedHashFragment.appCapabilities.appFrameworkId === "UI5" &&
                                    && oInMemoryApplicationInstance.isInstanceSupported === false && oInMemoryApplicationInstance.appId) {
                                    AppLifeCycleAI.destroy(
                                        oInMemoryApplicationInstance.appId, oInMemoryApplicationInstance.container, oDeferredAppDestroy
                                    );
                                } else {
                                    oDeferredAppDestroy.resolve();
                                }
                                oDeferredAppDestroy.done(function () {
                                    oShellController._initiateApplication(
                                        oResolvedHashFragment, sFixedShellHash, oParsedShellHash,
                                        iOriginalHistoryLength, sAppPart, sOldFixedShellHash, sOldAppPart
                                    );
                                    oDeferred.resolve();
                                });
                                return;
                            }
                            AppLifeCycleAI.destroy(oInMemoryApplicationInstance.appId, oInMemoryApplicationInstance.container);

                            AppLifeCycleAI.removeApplication(sIntent);
                            AppConfiguration.setApplicationInInitMode();

                            // normal application:
                            // fire the _prior.newUI5ComponentInstantion event before creating the new component instance, so that
                            // the ApplicationContainer can stop the router of the current app (avoid inner-app hash change notifications)
                            // NOTE: this dependency to the ApplicationContainer is not nice, but we need a fast fix now; we should refactor
                            // the ApplicationContainer code, because most of the logic has to be done by the shell controller;
                            // maybe rather introduce a utility module
                            Core.getEventBus().publish("ApplicationContainer", "_prior.newUI5ComponentInstantion",
                                { name: sTargetUi5ComponentName }
                            );

                            //Performance Debug
                            Measurement.start("FLP:ShellController.UI5createComponent", "UI5 createComponent", "FLP");
                            // load ui5 component via shell service; core-ext-light will be loaded as part of the asyncHints

                            sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function () {
                                AppLifeCycleAI.createComponent(oResolvedHashFragment, oParsedShellHash).done(function (/*oResolutionResultWithComponentHandle*/) {
                                    // `oResolutionResultWithComponentHandle` is unused.
                                    // This is because oResolvedHashFragment contains the component handle already.
                                    // See the preceding note in AppLifeCycle.createComponent.
                                    Measurement.end("FLP:ShellController.UI5createComponent");
                                    oShellController._initiateApplication(oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength, sAppPart);
                                }).fail(function (vError) {
                                    var sErrorReason = ushellResources.i18n.getText("cannot_load_ui5_component_details", [sFixedShellHash]);
                                    var sErrorReasonEnglish = "Failed to load UI5 component for navigation intent " + sFixedShellHash;

                                    AppConfiguration.setCurrentApplication(oShellController.currentAppBeforeNav);
                                    oShellController.hashChangeFailure(
                                        iOriginalHistoryLength,
                                        {
                                            title: ushellResources.i18n.getText("error"),
                                            message: ushellResources.i18n.getText("failed_to_open_ui5_component"),
                                            technicalMessage: sErrorReasonEnglish
                                        }, {
                                        info: sErrorReason,
                                        technicalMessage: vError.message + "\n" + vError.stack
                                    },
                                        "sap.ushell.renderers.fiori2.Shell.controller",
                                        false);
                                });
                            });
                        }
                        oDeferred.resolve();
                    });
                }, function (sMsg) {
                    var sErrorReason = ushellResources.i18n.getText("cannot_resolve_navigation_target_details", [sFixedShellHash]);
                    var sErrorReasonEnglish = "Failed to resolve navigation target: " + sFixedShellHash
                        + ". This is most likely caused by an incorrect SAP Fiori launchpad content configuration or by missing role assignment.";

                    oShellController.hashChangeFailure(
                        iOriginalHistoryLength,
                        {
                            title: ushellResources.i18n.getText("error"),
                            message: ushellResources.i18n.getText("failed_to_open_app_missing_configuration_or_role_assignment"),
                            technicalMessage: sErrorReasonEnglish
                        },
                        {
                            info: sErrorReason,
                            fixedShellHash: sFixedShellHash,
                            technicalMessage: sMsg
                        },
                        "sap.ushell.renderers.fiori2.Shell.controller",
                        false);

                    oDeferred.reject(sErrorReasonEnglish);
                });

            return oDeferred.promise();
        },

        /**
         * Attempts to navigate to the target application via a shortcut,
         * without executing unnecessary AppLifeCycle navigation logic (e.g.,
         * application component initialization).
         *
         * This might be necessary when the navigation should not be handled in
         * the current window context anymore, for example, when the
         * application should be opened in a new window, or NWBC takes over the
         * navigation task.
         *
         * @param {string} sFixedShellHash
         *  The hash fragment including "#"
         * @param {string} sAppPart
         *  The inner app route part of the intent
         * @param {object} oResolvedHashFragment
         *  The resolved target intent
         *
         * @returns {undefined} Nothing
         * @private
         */
        _handleEarlyNavigation: function (sFixedShellHash, sAppPart, oResolvedHashFragment) {
            var that = this;
            var oDashboard;

            return new Promise(function (fnResolve) {
                that._openAppViaNWBC(oResolvedHashFragment).then(function (bOpenedViaNWBC) {
                    if (bOpenedViaNWBC === true) {
                        oResolvedHashFragment.sFixedShellHash = sFixedShellHash;
                        that.logOpenAppAction(oResolvedHashFragment, sAppPart);
                        oDashboard = Core.byId("sapUshellDashboardPage");
                        if (oDashboard) {
                            oDashboard.setBlocked(false);
                            oDashboard.setBusy(false);
                        }
                        fnResolve(true);
                        return;
                    }

                    var bNewWindowNavigation = oResolvedHashFragment
                        && oResolvedHashFragment.navigationMode === oNavigationMode.newWindow;
                    if (bNewWindowNavigation) {
                        // add the app to application usage log
                        oResolvedHashFragment.sFixedShellHash = sFixedShellHash;
                        that.logOpenAppAction(oResolvedHashFragment, sAppPart);
                        that._openAppInNewWindowAndRestore(oResolvedHashFragment);
                        oDashboard = Core.byId("sapUshellDashboardPage");
                        if (oDashboard) {
                            oDashboard.setBlocked(false);
                            oDashboard.setBusy(false);
                        }
                        fnResolve(true);
                        return;
                    }

                    // In case of empty hash, if there is a resolved target, set the flag to false, from now on the rootIntent
                    // will be an empty hash. Otherwise, change hash to rootIntent to trigger normal resolution.
                    if (Config.last("/core/shell/model/migrationConfig")) {
                        oConfig.migrationConfig = false;
                        that.getModel().setProperty("/migrationConfig", false);

                        if (oResolvedHashFragment && sFixedShellHash === "#") {
                            oConfig.rootIntent = "";
                        } else if (sFixedShellHash === "#") {
                            window.setTimeout(function () {
                                window.hasher.setHash(oConfig.rootIntent);
                            }, 0);
                            fnResolve(true);
                            return;
                        }
                    }

                    fnResolve(false);
                    return;
                });
            });
        },
        _initiateApplication: function (oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength, sAppPart, sOldFixedShellHash, sOldAppPart) {
            Measurement.start("FLP:ShellController._initiateApplication", "_initiateApplication", "FLP");

            var oMetadata = AppConfiguration.getMetadata(oResolvedHashFragment);
            var bContactSupportEnabled = Config.last("/core/extension/SupportTicket");
            var bPreviousIsInitialNavigation;

            // the "if" should protect against undefined, empty string and null
            if (oMetadata.title) {
                window.document.title = oMetadata.title;
            } else {
                // FIXME: Remove title so that users don't think it's a bug
                Log.debug("Shell controller._initiateApplication: the title of the window is not changed because most probably the application was resolved with undefined");
            }
            // the activation of user activity logging must be done after the app component is fully loaded
            // otherwise the module loading sequence causes race conditions on firefox
            if (bContactSupportEnabled) {
                window.setTimeout(function () {
                    UserActivityLog.activate();
                }, 0);
            }

            try {
                bPreviousIsInitialNavigation = this.oShellNavigation.isInitialNavigation();
                this.navigate(oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment, sOldFixedShellHash);
            } catch (oExc) {
                if (oExc.stack) {
                    Log.error("Application initialization (Intent: \n" + sFixedShellHash + "\n failed due to an Exception:\n" + oExc.stack);
                }
                this.oShellNavigation.setIsInitialNavigation(bPreviousIsInitialNavigation);
                this.hashChangeFailure(iOriginalHistoryLength, oExc.name, oExc.message, oMetadata ? oMetadata.title : "", false);
            }

            Measurement.end("FLP:ShellController._initiateApplication");
        },

        /**
         * Callback registered with NavService. Triggered on navigation requests
         *
         * @param {string} sShellHash the hash fragment to parse (must start with "#")
         * @returns {jQuery.Deferred.promise} a promise resolved with an object containing the resolved hash fragment (i.e., the result of
         *   {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}), the parsed shell hash obtained via
         *   {@link sap.ushell.services.URLParsing#parseShellHash}, and a boolean value indicating whether application dependencies
         *   <b>and</b> core-ext-light were loaded earlier. The promise is rejected with an error message in case errors occur.
         */
        _resolveHashFragment: function (sShellHash) {
            //Performance Debug
            Measurement.start("FLP:ShellController._resolveHashFragment", "_resolveHashFragment", "FLP");
            var oParsedShellHash = this.oURLParsing.parseShellHash(sShellHash);
            var oDeferred = new jQuery.Deferred();
            var oConfig = this._getConfig(); // for testing

            // Check and use resolved hash fragment from direct start promise if it's there
            if (window["sap-ushell-async-libs-promise-directstart"]) {
                window["sap-ushell-async-libs-promise-directstart"]
                    .then(function (oDirectstartPromiseResult) {
                        oDeferred.resolve(
                            oDirectstartPromiseResult.resolvedHashFragment,
                            oParsedShellHash
                        );
                        delete window["sap-ushell-async-libs-promise-directstart"];
                    },
                        function (sMsg) {
                            oDeferred.reject(sMsg);
                            delete window["sap-ushell-async-libs-promise-directstart"];
                        });
                return oDeferred.promise();
            }

            // Perform target resolution as normal...
            sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function (oNavTargetResolution) {
                oNavTargetResolution.resolveHashFragment(sShellHash)
                    .done(function (oResolvedHashFragment) {
                        //@FIXME: Should be also executed for directstart
                        AppConfiguration.setCurrentApplication(oResolvedHashFragment);
                        /*
                         * Override navigation mode for root intent.
                         * Shell home should be opened in embedded mode to allow a new window to be opened from GUI applications.
                         */
                        if (oParsedShellHash && (oParsedShellHash.semanticObject + "-" + oParsedShellHash.action) === oConfig.rootIntent) {
                            oResolvedHashFragment.navigationMode = "embedded";
                        }
                        Measurement.end("FLP:ShellController._resolveHashFragment");
                        utils.setPerformanceMark("FLP-ShellController-resolveHashFragment-end");
                        oDeferred.resolve(oResolvedHashFragment, oParsedShellHash);
                    })
                    .fail(function (sMsg) {
                        oDeferred.reject(sMsg);
                    });
            });
            return oDeferred.promise();
        },

        /**
         * Adjust Navigation mode based on current state of the Shell and application and the ResolveHashFragment bo be started
         *
         * This operation mutates oResolvedHashFragment
         *
         * {@link #navigate}.
         *
         * @param {object} oParsedShellHash the parsed shell hash obtained via {@link sap.ushell.services.URLParsing} service
         * @param {object} oResolvedHashFragment the hash fragment resolved via {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}
         * @returns {object} a new, potentially altered resolution result. Note that url and navigation mode may have been changed!
         *   For navigation in new window, the URL is replaced with the current location hash.
         *   NOTE: refactor this; we should not have these implicit changes of the navigation target
         * @private
         */
        _calculateNavigationMode: function (oParsedShellHash, oResolvedHashFragment) {
            if (!oResolvedHashFragment) {
                return undefined; // happens in tests
            }
            var sNavigationMode = oResolvedHashFragment.navigationMode;

            if (sNavigationMode === oNavigationMode.newWindowThenEmbedded) {
                // Implement newWindowThenEmbedded based on current state.
                if (this._isColdStart() || Ui5History.getInstance().getDirection() === Ui5HistoryDirection.Backwards) {
                    /*
                     * cold start
                     *   -> always open in place because the new window was opened by the user
                     *
                     * Ui5History.getInstance().getDirection()
                     *   -> URL has already been navigated to and it was the predecessor of the previous page
                     */
                    oResolvedHashFragment.navigationMode = oNavigationMode.embedded;
                } else {
                    oResolvedHashFragment.navigationMode = oNavigationMode.newWindow;
                    // if its a non-native navigation, we resolve the hash again in the new window
                    // we set the full current location hash as URL for the new window as it is
                    // for avoiding encoding issues and stripping off parameters or inner-app route
                    // see internal BCP 1770274241
                    if (!utils.isNativeWebGuiNavigation(oResolvedHashFragment)) {
                        oResolvedHashFragment.url = this._getCurrentLocationHash();
                    }
                }
                return oResolvedHashFragment;
            }

            if (sNavigationMode === oNavigationMode.newWindow && this._isColdStart()) {
                // Workaround for URLs that start an FLP app which needs the shell.
                if (this._hasAppCapabilitiesNavigationMode(oResolvedHashFragment)
                    && oResolvedHashFragment.appCapabilities.navigationMode === oNavigationMode.embedded) {
                    oResolvedHashFragment.navigationMode = oNavigationMode.embedded;
                    return oResolvedHashFragment;
                }
                // Replace the content of the current window if the user has already opened one.
                oResolvedHashFragment.navigationMode = oNavigationMode.replace;
                return oResolvedHashFragment;
            }

            if (sNavigationMode === oNavigationMode.newWindow
                && this._hasAppCapabilitiesNavigationMode(oResolvedHashFragment)
                && oResolvedHashFragment.appCapabilities.navigationMode === oNavigationMode.embedded) {
                oResolvedHashFragment.url = this._getCurrentLocationHash();
            }
            return oResolvedHashFragment;
        },

        // Workaround for URLs that start an FLP app which needs the shell.
        _hasAppCapabilitiesNavigationMode: function (oResolvedHashFragment) {
            return utils.isPlainObject(oResolvedHashFragment.appCapabilities) && oResolvedHashFragment.appCapabilities.hasOwnProperty("navigationMode");
        },

        _usesNavigationRedirect: function (oComponentHandle) {
            if (!oComponentHandle) {
                return new jQuery.Deferred().reject().promise();
            }
            var that = this;
            var oComponent = oComponentHandle.getInstance({});
            if (oComponent && typeof oComponent.navigationRedirect === "function") {
                // oComponent refers to a trampoline application
                var oDeferred = new jQuery.Deferred();
                var oNavRedirectPromise = oComponent.navigationRedirect();
                if (oNavRedirectPromise && (typeof oNavRedirectPromise.then === "function")) {
                    oNavRedirectPromise.then(function (sNextHash) {
                        Log.warning("Performing navigation redirect to hash " + sNextHash);
                        oComponent.destroy();
                        that.history.pop();
                        sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (oShellNavigation) {
                            oShellNavigation.toExternal({ target: { shellHash: sNextHash } }, undefined, false);
                            oDeferred.resolve(true);
                        });
                    }, function () {
                        oDeferred.reject();
                    });
                    return oDeferred.promise();
                }
            }
            return new jQuery.Deferred().reject().promise();
        },

        /**
         * Performs navigation based on the given resolved hash fragment.
         *
         * @param {object} oParsedShellHash the parsed shell hash obtained via {@link sap.ushell.services.URLParsing} service
         * @param {string} sFixedShellHash the hash fragment to navigate to. It must start with "#" (i.e., fixed).
         * @param {object} oMetadata the metadata object obtained via {@link sap.ushell.services.AppConfiguration#parseShellHash}
         * @param {object} oResolvedHashFragment the hash fragment resolved via {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}
         *
         * @returns {Promise} Navigation Promise
         */
        navigate: function (oParsedShellHash, sFixedShellHash, oMetadata, oResolvedHashFragment, sOldFixedShellHash) {
            //Performance Debug
            Measurement.start("FLP:ShellController.navigate", "navigate", "FLP");
            var sNavigationMode = (isPlainObject(oResolvedHashFragment) ? oResolvedHashFragment.navigationMode : null);
            var that = this;

            /*
             * A null navigationMode is a no-op, it indicates no navigation should occur.
             * However, we need to restore the current hash to the previous one.
             * If cold start happened (history has only one entry), we go to the shell home.
             */
            if (sNavigationMode === null) {
                if (this._isColdStart()) {
                    window.hasher.setHash("");
                    return;
                }

                this.bEnableHashChange = false;
                this.history.pop();
                this._windowHistoryBack(1);
                return Promise.resolve();
            }

            oResolvedHashFragment = this._calculateNavigationMode(oParsedShellHash, oResolvedHashFragment);
            sNavigationMode = (isPlainObject(oResolvedHashFragment) ? oResolvedHashFragment.navigationMode : null);

            if (sNavigationMode === oNavigationMode.embedded) {
                if (!this._isColdStart() && !this._wasHistoryEntryReplaced) {
                    this.oShellNavigation.setIsInitialNavigation(false);
                }

                var oDeferred = this._usesNavigationRedirect(oResolvedHashFragment.componentHandle);
                var oNavigationPromise = new Promise(function (resolve, reject) {
                    // When `oDeferred` succeeds, it implies the component references a trampoline application.
                    // The trampoline application subsequently gets destroyed after it's used to enable the redirection.
                    // The failure is being used here as a means for branching in the execution flow.
                    oDeferred.then(null, function () {
                        that._handleEmbeddedNavMode(sFixedShellHash, oParsedShellHash, oMetadata, oResolvedHashFragment, sOldFixedShellHash).then(function () {
                            //The event is used for FESR records
                            //Normally FESR record is closed on the "AppRendered" event, but for some cases (stateful container, etc.)
                            //the application container is not re-rendered and EmbeddedNavigationDone is additionally fired to close the record.

                            EventHub.emit("CloseFesrRecord", { date: Date.now(), technicalName: oMetadata.technicalName });
                            resolve();
                        });
                    });
                    Measurement.end("FLP:ShellController.navigate");
                });

                return oNavigationPromise;
            }

            if (sNavigationMode === oNavigationMode.replace) {
                this.oShellNavigation.setIsInitialNavigation(false);
                // restore hash
                this.bEnableHashChange = false;
                this._changeWindowLocation(oResolvedHashFragment.url);
                return Promise.resolve();
            }

            if (sNavigationMode === oNavigationMode.newWindow) {
                this._openAppInNewWindowAndRestore(oResolvedHashFragment);
                return Promise.resolve();
            }

            // the navigation mode doesn't match any valid one.
            // In this case an error message is logged and previous hash is fetched
            this.hashChangeFailure(this.history.getHistoryLength(), "Navigation mode is not recognized", null, "sap.ushell.renderers.fiori2.Shell.controller", false);
            return Promise.resolve();
        },

        /**
         * Attempts opening the application via NWBC.
         *
         * @param {object} oResolvedHashFragment
         *  The resolved hash fragment
         * @return {Promise}
         *  Whether NWBC managed to open the application (resolved with either true or false)
         *
         * @private
         */
        _openAppViaNWBC: function (oResolvedHashFragment) {
            var that = this;

            return new Promise(function (fnResolve) {
                var bNwbcHandling;

                if (oResolvedHashFragment && (utils.isNativeWebGuiNavigation(oResolvedHashFragment) || oResolvedHashFragment.nativeNWBCNavigation)) {
                    bNwbcHandling = true;
                } else {
                    bNwbcHandling = false;
                }

                if (bNwbcHandling === false) {
                    fnResolve(false);
                    return;
                }

                var oEPCM = utils.getPrivateEpcm();
                var iEPCMNavigationMode = oEPCMNavigationMode[oResolvedHashFragment.navigationMode];
                var sUrlWithSapUserAndShellParam;
                var iMode;

                if (utils.hasNavigationModeCapability()) {
                    iMode = iEPCMNavigationMode || oEPCMNavigationMode[oNavigationMode.embedded];
                }

                var oPromiseParams = that._appendUserIdToUrl("sap-user", oResolvedHashFragment.url).then(function (sUrlWithSapUser) {
                    sUrlWithSapUserAndShellParam = utils.appendSapShellParam(sUrlWithSapUser);

                    return new Promise(function (fnResolveParams) {
                        try {
                            var sAppType = oResolvedHashFragment.applicationType;
                            var sFrameworkId = (oResolvedHashFragment.appCapabilities && oResolvedHashFragment.appCapabilities.appFrameworkId);
                            var oFLPParams = {};
                            var aInfoArray = [];
                            var aKeysArray;
                            var fnPreparePostBodyParams = function () {
                                oFLPParams["sap-flp-url"] = sap.ushell.Container.getFLPUrl(true);
                                oFLPParams["system-alias"] = oResolvedHashFragment.systemAlias;
                                return [{
                                    name: "sap-flp-params",
                                    value: JSON.stringify(oFLPParams)
                                }];
                            };
                            var getParamKeys = function getParamKeys (sUrl, aInfoArray) {
                                var aAppStateKeysArray = [];
                                var fnAddKey = function (sName, sDataName) {
                                    if (sUrl.indexOf(sName + "=") > 0) {
                                        var aParams = new RegExp("(?:" + sName + "=)([^&/]+)").exec(sUrl);
                                        if (aParams && aParams.length === 2) {
                                            aAppStateKeysArray.push([aParams[1]]);
                                            aInfoArray.push(sDataName);
                                        }
                                    }
                                };

                                fnAddKey("sap-iapp-state", "sap-iapp-state-data");
                                fnAddKey("sap-xapp-state", "sap-xapp-state-data");
                                fnAddKey("sap-intent-param", "sap-intent-param-data");
                                return aAppStateKeysArray;
                            };

                            if (sAppType === "GUI" || sAppType === "TR" || sAppType === "NWBC" || sAppType === "WDA" || sAppType === "WCF" ||
                                sFrameworkId === "GUI" || sFrameworkId === "WDA" || sFrameworkId === "NWBC" || sFrameworkId === "WCF") {
                                sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                                    aKeysArray = getParamKeys(sUrlWithSapUserAndShellParam, aInfoArray);
                                    if (aKeysArray.length > 0) {
                                        oCrossAppNavService.getAppStateData(aKeysArray).then(function (aDataArray) {
                                            aInfoArray.forEach(function (item, index) {
                                                if (aDataArray[index][0]) {
                                                    oFLPParams[item] = aDataArray[index][0];
                                                }
                                            });
                                            fnResolveParams(fnPreparePostBodyParams());
                                        }, function (sError) {
                                            fnResolveParams();
                                        });
                                    } else {
                                        fnResolveParams(fnPreparePostBodyParams());
                                    }
                                });
                            } else {
                                fnResolveParams();
                            }
                        } catch (e) {
                            //nothing to do, we will open the app without the post params as before
                            fnResolveParams();
                        }
                    });
                });

                oPromiseParams.then(
                    //the promise can not reject as we have to try to open the app
                    function (oPostBodyParams) {
                        try {
                            Core.getEventBus().publish("launchpad", "appOpening", oResolvedHashFragment);
                            if (!oEPCM.doNavigate(sUrlWithSapUserAndShellParam, iMode, undefined, undefined, undefined, undefined, undefined, oPostBodyParams)) {
                                fnResolve(false);
                                return;
                            }
                            Core.getEventBus().publish("sap.ushell", "appOpened", oResolvedHashFragment);

                            that._restoreAfterNwbcNavigation(oResolvedHashFragment).then(function () {
                                /*
                                TODO: This is a workaround.
                                We should rather update the resolvedHashFragment before the navigation happens. Other Components listening
                                to the appOpened event might rely on the correct navigationMode / targetNavigationMode of the
                                resolvedHashFragment.
                                */
                                // restore menu bar in case we are still on home
                                if (that._oAppLifeCycleService.getCurrentApplication() && that._oAppLifeCycleService.getCurrentApplication().homePage) {
                                    that._setMenuVisible(true);
                                }

                                fnResolve(true);
                            });
                        } catch (e) {
                            if (e.stack) {
                                Log.error("Application initialization failed due to an Exception:\n" + e.stack);
                            }
                            that.hashChangeFailure(that.history.getHistoryLength(), e.name, e.message, oResolvedHashFragment.text, false);
                            fnResolve(false);
                        }
                    }
                );
            });
        },

        /**
         *
         * If a GUI application that was handled by NWBC was opened via deep link, a new tab is opened, which started the GUI.
         * Therefore, the current tab must navigate to the home page.
         *
         * In all other cases (non-deep link), it is sufficient
         * to navigate one step back in the browser history to restore the current hash.
         *
         * @param {object} oResolvedHashFragment The resolved hash fragment.
         * @return {Promise} A Promise resolving when the hash is restored.
         * @private
         */
        _restoreAfterNwbcNavigation: function (oResolvedHashFragment) {
            if (this.history.getHistoryLength() === 1 && !this._oAppLifeCycleService.getCurrentApplication()) {
                // Deep link case
                return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNav) {
                    oCrossAppNav.toExternal({ target: { shellHash: "#" }, writeHistory: false });
                });
            }

            // Regular case
            this._restorePreviousHashAfterOpenNewWindow(oResolvedHashFragment);
            return Promise.resolve();
        },

        /**
         * Appends the ID of the user to the given URL.
         * The ID of the user is retrieved via the UserInfo service, and appended blindly to the given URL.
         * This method tries to detect whether a previous parameter was already appended
         * and use the <code>?</code> or <code>&</code> separator for the parameter accordingly.
         *
         * @param {string} sParamName The name of the parameter that needs to be appended.
         * @param {string} sUrl A URL with or without the sap-user parameter.
         * @returns {Promise<string>} The URL with the user id parameter appended.
         * @private
         */
        _appendUserIdToUrl: function (sParamName, sUrl) {
            return sap.ushell.Container.getServiceAsync("UserInfo").then(function (oUserInfoService) {
                var sUserId = oUserInfoService.getUser().getId();
                var sSep = sUrl.indexOf("?") >= 0 ? "&" : "?";
                return sUrl + sSep + sParamName + "=" + sUserId;
            });
        },

        /**
         * The method restore the previous hash when app is opened in the new tab
         * @param {*} oResolvedHashFragment resolved hash fragment
         */
        _restorePreviousHashAfterOpenNewWindow: function (oResolvedHashFragment) {
            this.history.pop();
            var oVarInstance = oResolvedHashFragment.componentHandle && oResolvedHashFragment.componentHandle.getInstance
                && oResolvedHashFragment.componentHandle.getInstance({});
            if (oVarInstance) {
                oVarInstance.destroy();
            }
            this._resumeAppRouterIgnoringCurrentHash();
            this.bRestorePreviousHash = true;
            this._windowHistoryBack(1);

            // set back the current application to be the one before this navigation occurred as current application is opened in a new window
            AppConfiguration.setCurrentApplication(this.currentAppBeforeNav);
            EventHub.emit("openedAppInNewWindow", Date.now());
        },

        _openAppInNewWindowAndRestore: function (oResolvedHashFragment) {
            Core.getEventBus().publish("launchpad", "appOpening", oResolvedHashFragment);
            this._openAppNewWindow(oResolvedHashFragment.url);
            Core.getEventBus().publish("sap.ushell", "appOpened", oResolvedHashFragment);
            this._restorePreviousHashAfterOpenNewWindow(oResolvedHashFragment);
        },

        _handleEmbeddedNavMode: function (sFixedShellHash, oParsedShellHash, oMetadata, oResolvedHashFragment, sOldFixedShellHash) {
            // Performance Debug
            Measurement.start("FLP:ShellController._handleEmbeddedNavMode", "_handleEmbeddedNavMode", "FLP");
            var oConfig = this._getConfig();

            this.resetShellUIServiceHandlers();

            AppLifeCycleAI.getAppMeta().setAppIcons(oMetadata);

            // obtain a unique id for the app (or the component)
            var sAppId = "-" + oParsedShellHash.semanticObject + "-" + oParsedShellHash.action;

            var bIsNavToHome = sFixedShellHash === "#" ||
                (oConfig.rootIntent && utils.getBasicHash(oConfig.rootIntent) === oParsedShellHash.semanticObject + "-" + oParsedShellHash.action);

            // Support migration from version 1.28 or lower in case local resolution for empty hash was used
            var sIntent = oParsedShellHash ? oParsedShellHash.semanticObject + "-" + oParsedShellHash.action : "";

            AppLifeCycleAI.switchViewState(
                AppLifeCycleAI.shellElements().calculateElementsState(
                    bIsNavToHome ? "home" : "app",
                    oResolvedHashFragment.applicationType,
                    oConfig.appState,
                    oResolvedHashFragment.explicitNavMode
                ),
                undefined,
                sAppId
            );

            if (bIsNavToHome) {
                AppLifeCycleAI.getShellUIService().setBackNavigation();
            }

            var oHandlerPromise = AppLifeCycleAI.handleControl(
                sIntent,
                sAppId,
                oParsedShellHash,
                oResolvedHashFragment,
                this.getWrappedApplicationWithMoreStrictnessInIntention.bind(this),
                sFixedShellHash,
                sOldFixedShellHash
            );

            if (this.currentAppBeforeNav) {
                var oPreviousStatefulContainer;
                oPreviousStatefulContainer = AppLifeCycleAI.getWebGuiV1StatefulContainer(this.currentAppBeforeNav.url);
                if (oPreviousStatefulContainer) {
                    oPreviousStatefulContainer.onApplicationOpened(oResolvedHashFragment.applicationType);
                }
            }

            Measurement.end("FLP:ShellController._handleEmbeddedNavMode");

            return oHandlerPromise;
        },

        _centerViewPort: function () {
            this.oViewPortContainer.switchState("Center");
        },

        _isShellHomeIntent: function (sIntent) {
            return sIntent === "#" || sIntent === oConfig.rootIntent;
        },

        // Please help improve the strictness of this method.
        getWrappedApplicationWithMoreStrictnessInIntention: function (sIntent, oMetadata, oShellHash, oResolvedNavigationTarget, sAppId, bFullWidth, sFixedShellHash) {
            var that = this;

            if (Device.system.desktop) {
                sap.ui.require(["sap/ushell/renderers/fiori2/AccessKeysHandler"], function (AccessKeysHandler) {
                    var oShellAppTitle = Core.byId("shellAppTitle");
                    if (oShellAppTitle && Config.last("/core/shell/model/currentState/stateName") === "app") {
                        var oShellAppTitleDomRef = oShellAppTitle.getFocusDomRef();
                        if (oShellAppTitleDomRef) {
                            AccessKeysHandler.sendFocusBackToShell(oShellAppTitleDomRef.getAttribute("id"));
                        }
                    }
                });
            }

            window.setTimeout(function () {
                window.setTimeout(function () {
                    //Screen reader: "Loading Complete"
                    that.readNavigationEnd();
                }, 600);

                Core.getEventBus().publish("launchpad", "appOpening", oResolvedNavigationTarget);
                Log.info("app is being opened");
            }, 0);
            if (oConfig.applications) {
                oResolvedNavigationTarget.applicationConfiguration = oConfig.applications[sIntent];
            }

            var oAppContainer = AppLifeCycleAI.getAppContainer(sAppId, oResolvedNavigationTarget, this._isColdStart(), oShellHash, sFixedShellHash);

            // adding intent as this published application info is required for the contact-support scenario
            oResolvedNavigationTarget.sFixedShellHash = sFixedShellHash;
            AppLifeCycleAI.publishNavigationStateEvents(oAppContainer, oResolvedNavigationTarget, this.onAppAfterRendering.bind(this, oResolvedNavigationTarget));

            var sAppType = oAppContainer.getApplicationType();
            var sFrameworkId = oAppContainer.getFrameworkId();
            if (sAppType === "GUI" || sAppType === "TR" || sAppType === "WDA" || sAppType === "NWBC" || sAppType === "WCF" ||
                sFrameworkId === "GUI" || sFrameworkId === "WDA" || sFrameworkId === "NWBC" || sFrameworkId === "WCF") {
                oAppContainer.addStyleClass("sapUShellApplicationContainerShiftedIframe");
            }

            if (!bFullWidth) {
                oAppContainer.addStyleClass("sapUShellApplicationContainerLimitedWidth");
            }

            if (this._isDock() && window.matchMedia("(min-width: 106.4rem)").matches) {
                oAppContainer.addStyleClass("sapUShellDockingContainer");
                oAppContainer.removeStyleClass("sapUShellApplicationContainerLimitedWidth");
            } else if (this._isDock()) {
                oAppContainer.removeStyleClass("sapUShellApplicationContainerLimitedWidth");
            }

            oAppContainer.toggleStyleClass("sapUshellDefaultBackground", !oMetadata.hideLightBackground);

            AppLifeCycleAI.getAppMeta()._applyContentDensityByPriority();

            // Add inner control for next request
            AppLifeCycleAI.addControl(oAppContainer);

            utils.setPerformanceMark("FLP - addAppContainer");

            Measurement.end("FLP:ShellController.getWrappedApplication");
            return oAppContainer;
        },

        // Set booleans to false which indicate whether shellUIService was called or not
        resetShellUIServiceHandlers: function () {
            AppLifeCycleAI.getAppMeta().resetShellUIServiceHandlers();
            AppLifeCycleAI.setBackNavigationChanged(false);
        },

        onAppAfterRendering: function (oApplication) {
            var oShellUIService = AppLifeCycleAI.getShellUIService();
            // wrapped in setTimeout since "publish" is not async
            window.setTimeout(function () {
                Core.getEventBus().publish("sap.ushell", "appOpened", oApplication);
                Log.info("app was opened");
            }, 0);

            // publish the event externally
            // TODO: cloned, frozen object!
            var oAppOpenedEventData = AppLifeCycleAI._publicEventDataFromResolutionResult(oApplication);

            // Event is emitted internally (EventHub) _and_ externally (for compatibility reasons)
            EventHub.emit("AppRendered", oAppOpenedEventData, true);
            sap.ushell.renderers.fiori2.utils.publishExternalEvent("appOpened", oAppOpenedEventData);
            utils.setPerformanceMark("FLP.appOpened");

            // Call setHierarchy, setTitle, setRelatedApps with default values in case handlers were not called yet
            if (oShellUIService) {
                AppLifeCycleAI.initAppMetaParams();
            }
            oShellModel.updateStateProperty("application/icon", AppLifeCycleAI.getAppMeta().getAppIcon(), true);
        },

        /**
         * Adds a listener to the "appComponentLoaded" Event that is published by the "sap.ushell".
         * Once the "home app" Component is saved, the listener is removed, and this function will not do anything.
         */
        _saveHomePageComponent: function () {
            if (this.oHomeApp) {
                return;
            }
            var that = this;
            var sContainerNS = "sap.ushell";
            var fListener = function (oEvent, sChannel, oData) {
                that.oHomeApp = oData.component;
                Core.getEventBus().unsubscribe(sContainerNS, "appComponentLoaded", fListener);
            };
            Core.getEventBus().subscribe(sContainerNS, "appComponentLoaded", fListener);
        },

        /**
         * Shows an error message and navigates to the previous page.
         *
         * @param {number} iHistoryLength the length of the history <b>before</b> the navigation occurred.
         * @param {string|object} vMessage the error message
         * @param {string|object} vDetails the detailed error message
         * @param {string} sComponent the component that generated the error message
         * @param {boolean} bEnableHashChange enable hash change
         */
        hashChangeFailure: function (iHistoryLength, vMessage, vDetails, sComponent, bEnableHashChange) {
            var oDashboard = Core.byId("sapUshellDashboardPage");
            if (oDashboard) {
                oDashboard.setBlocked(false);
                oDashboard.setBusy(false);
            }

            if (utils.isPlainObject(vMessage)) {
                this.reportError(vMessage.technicalMessage, vDetails.technicalMessage, sComponent);
                sap.ushell.Container.getServiceAsync("Message").then(function (oMessage) {
                    oMessage.show(
                        oMessage.Type.ERROR,
                        vMessage.message,
                        {
                            title: vMessage.title,
                            details: vDetails
                        }
                    );
                });
            } else {
                this.reportError(vMessage, vDetails, sComponent);
                // use timeout to avoid "MessageService not initialized.: error
                this.delayedMessageError(ushellResources.i18n.getText("fail_to_start_app_try_later"));
            }
            closeAllDialogs = false;

            this._resumeAppRouterIgnoringCurrentHash();
            if (iHistoryLength === 0) {
                // if started with an illegal shell hash (deep link), we just remove the hash
                window.hasher.setHash("");
            } else if (new URLSearchParams(window.location.search).get("bFallbackToShellHome")) {
                // The previous url is not valid navigation
                window.hasher.setHash("");
            } else {
                // navigate to the previous URL since in this state the hash that has failed to load is in the URL.
                this.bEnableHashChange = bEnableHashChange;
                sap.ushell.Container.setDirtyFlag(bPreviousPageDirty);
                AppLifeCycleAI.postMessageToIframeApp("sap.ushell.appRuntime", "setDirtyFlag", {
                    bIsDirty: bPreviousPageDirty
                });
                this._windowHistoryBack(1);
            }
        },

        reportError: function (sMessage, sDetails, sComponent) {
            Log.error(sMessage, sDetails, sComponent);
        },

        delayedMessageError: function (sMsg) {
            window.setTimeout(function () {
                if (sap.ushell.Container !== undefined) {
                    sap.ushell.Container.getServiceAsync("Message").then(function (oMessage) {
                        oMessage.error(sMsg);
                    });
                }
            }, 0);
        },

        fixShellHash: function (sShellHash) {
            if (!sShellHash) {
                sShellHash = "#";
            } else if (sShellHash.charAt(0) !== "#") {
                sShellHash = "#" + sShellHash;
            }
            return sShellHash;
        },

        _openAppNewWindow: function (sUrl) {
            var oNewWin = WindowUtils.openURL(sUrl);
            // Show a message when window.open returns null --> Popup Blocker
            // Exception: in WorkZone's mobile client, when external nav happens: Keep calm and carry on.
            if (!oNewWin && !this._checkWindowLocationSearch("workzone-mobile-app=true")) {
                var msg = ushellResources.i18n.getText("fail_to_start_app_popup_blocker", [window.location.hostname]);
                this.delayedMessageError(msg);
            }
        },

        _checkWindowLocationSearch: function (sTerm) {
            return window.location.search.indexOf(sTerm) > -1;
        },

        _windowHistoryBack: function (iSteps) {
            window.history.go(-1 * iSteps);
        },

        _windowHistoryForward: function (iSteps) {
            window.history.go(iSteps);
        },

        _changeWindowLocation: function (sUrl) {
            window.location.href = sUrl;
        },

        _setMenuVisible: function (bVisible) {
            var oContainer = Core.byId("menuBarComponentContainer");
            var oMenuComponent = oContainer && oContainer.getComponentInstance && oContainer.getComponentInstance();
            if (oMenuComponent && oMenuComponent.setVisible) {
                oMenuComponent.setVisible(bVisible);
            }
        },

        /**
         * Triggered by the EventBus "appOpened" event.
         * Performs logging for recent activities and application usage
         *
         * @param {string} sChannelId The channelId of the event
         * @param {string} sEventId The event id
         * @param {object} oResolvedHashFragment The resolved hash fragment object belonging to the event
         */
        onAppOpened: function (sChannelId, sEventId, oResolvedHashFragment) {
            if (oResolvedHashFragment.targetNavigationMode !== "explace" && oResolvedHashFragment.targetNavigationMode !== "frameless") {
                this._setMenuVisible(false);
            }

            var sAppHash = this.oShellNavigation.hashChanger.getAppHash();
            var sAppPart = sAppHash ? "&/" + sAppHash : null;

            this.logOpenAppAction(oResolvedHashFragment, sAppPart);
        },

        externalSearchTriggered: function (sChannelId, sEventId, oData) {
            Config.emit("/core/shell/model/searchTerm", oData.searchTerm);
            oData.query = oData.searchTerm;
        },

        onBeforeNavigate: function (oEvent) {
            var oToView = oEvent.getParameter("to");
            var oOwnerComponent = this.getOwnerComponent();

            var bToDashboardView = oToView === oOwnerComponent.byId("Shell-home-component-container");
            var bToPagesView = oToView === oOwnerComponent.byId("pages-component-container");
            var bToHomeAppView = oToView === oOwnerComponent.byId("homeApp-component-container");
            var bToWorkpagesView = oToView === oOwnerComponent.byId("workPageRuntime-component-container");
            var bToSwitcherView = oToView === oOwnerComponent.byId("runtimeSwitcher-component-container");
            var bMenuVisible = bToDashboardView || bToPagesView || bToHomeAppView || bToWorkpagesView || bToSwitcherView;

            AppLifeCycleAI.onBeforeNavigate(oEvent.getParameter("fromId"), oEvent.getParameter("from"), oEvent.getParameter("toId"), oEvent.getParameter("to"));
            this._setMenuVisible(bMenuVisible);
        },

        onAfterNavigate: function (oEvent) {
            var sToId = oEvent.mParameters ? oEvent.mParameters.toId : undefined;

            var oDashboard = Core.byId("sapUshellDashboardPage");
            if (oDashboard) {
                oDashboard.setBlocked(false);
                oDashboard.setBusy(false);
            }

            AppLifeCycleAI.onAfterNavigate(oEvent.getParameter("fromId"), oEvent.getParameter("from"), sToId, oEvent.getParameter("to"));
            Core.getEventBus().publish("sap.ushell", "navigated", {});
        },

        // 1 - remove appClosed hooks
        // 2 - logApplicationUsage to take resolved hash fragment

        logOpenAppAction: function (oResolvedHashFragment, sAppPart) {
            var bEnableRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
            if (!bEnableRecentActivity) {
                return;
            }

            var oRecentEntry = {};
            var oMetadata = AppConfiguration.getMetadata(oResolvedHashFragment);
            var sFixedShellHash = oResolvedHashFragment.sFixedShellHash;
            var sUrl = sFixedShellHash;
            if (sAppPart) {
                sUrl += sAppPart; // some application use inner routes, for example search.
            }

            oRecentEntry.title = oMetadata.title;
            oRecentEntry.appType = AppType.APP; // default app type the shell adds is 'Application'
            oRecentEntry.url = sUrl;

            var oParsed = this.oURLParsing.parseShellHash(sFixedShellHash);
            if (oParsed) {
                /*
                    * This is the key that determines whether an existing activity should be updated or added.
                    *
                    * In theory we could use the full hash without parameters here, however this causes the same application to be logged
                    * multiple times with the same title, confusing the user.
                    *
                    * Therefore we choose to update a previous entry in case just the parameters change. This might cause a bit of
                    * confusion in case another target mapping is opened, as the title of a previously logged entry would be updated
                    * instead of having a new title added to the recent activities (same target mapping but different title).
                    *
                    * Perhaps this could be further fixed by hashing a target mapping on the client before returning the resolution
                    * result, and using the hash as the id.
                    */
                oRecentEntry.appId = "#" + this.oURLParsing.constructShellHash({
                    semanticObject: oParsed.semanticObject,
                    action: oParsed.action
                });
            } else {
                oRecentEntry.appId = sFixedShellHash;
            }

            // The recent activity for searches is done in a different way, see this._logSearchActivity
            if (sFixedShellHash && sFixedShellHash.indexOf("#Action-search") === -1) {
                window.setTimeout(function () {
                    this._logRecentActivity(oRecentEntry);
                }.bind(this), 1500);
            }
        },

        // Special logic for Search.
        // The search activity must be logged even after a user makes different searches in a single #Action-search session.
        // Therefore, the logging should occur on the search event and not by the navigation to the search application.
        _logSearchActivity: function () {
            if (Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging")) {
                var sTitle = "";
                try {
                    sTitle = Core.byId("searchFieldInShell-input").getModel().getLastSearchTerm();
                } catch (ex) {
                    Log.error("Shell: last search term is not available to log a recent activity");
                }
                this._logRecentActivity({
                    appId: "#Action-search",
                    appType: AppType.SEARCH,
                    title: sTitle,
                    url: "#" + window.hasher.getHash()
                });
            }
        },

        readNavigationEnd: function () {
            var oAccessibilityHelperLoadingComplete = document.getElementById("sapUshellLoadingAccessibilityHelper-loadingComplete");

            if (oAccessibilityHelperLoadingComplete) {
                oAccessibilityHelperLoadingComplete.setAttribute("aria-live", "polite");
                oAccessibilityHelperLoadingComplete.innerHTML = ushellResources.i18n.getText("loadingComplete");
                window.setTimeout(function () {
                    oAccessibilityHelperLoadingComplete.setAttribute("aria-live", "off");
                    oAccessibilityHelperLoadingComplete.innerHTML = "";
                }, 0);
            }
        },

        _loadCoreExtNonUI5: function (oAppTarget) {
            if (oAppTarget && oAppTarget.applicationType !== "SAPUI5") {
                this._loadCoreExt();
            }
        },

        _loadUsageAnalytics: function (eventData) {
            sap.ushell.Container.getServiceAsync("UsageAnalytics").then(function (oUsageAnalytics) {
                oUsageAnalytics.init(
                    ushellResources.i18n.getText("usageAnalytics"),
                    ushellResources.i18n.getText("i_agree"),
                    ushellResources.i18n.getText("i_disagree"),
                    ushellResources.i18n.getText("remind_me_later")
                );
                EventHub.emit("StepDone", eventData.stepName);
            }, function () {
                EventHub.emit("StepFailed", eventData.stepName);
            });
        },

        /**
         * RendererExtensions plugins are loaded after the core-ext modules.
         * core-ext is loaded, either in first application load flow in case app is not FLP or explicitly by the Renderer (in this file) after FLP is loaded.
         * In any case, after we load the plugins, we also publish the event that all Core resources are loaded
         */
        _onCoreResourcesComplementLoaded: function () {
            utils.setPerformanceMark("SchedulingAgent-StartOfFlow");
            // Create delayed controls in the view
            var oView = this.getView();
            if (oView) { // some qUnits do not create the view
                oView.createPostCoreExtControls();
            }

            SchedulingAgent._initialize();

            EventHub.emit("startScheduler");
        },

        /*
         * After core-ext is loaded (see_onCoreResourcesComplementLoaded) the renderer extensions plugins can be loaded.
         * To enable the Scheduling Agent to direct this the loading is wrapped in this function.
         */
        _loadRendererExtensionPlugins: function (eventData) {
            var oUriParameters = new URLSearchParams(window.location.search);
            var bDelayPlugin = oUriParameters.get("sap-ushell-xx-pluginmode") === "delayed";

            function createPlugins (oPluginManager) {
                // in addition we have to ensure the new EventHub Event is thrown
                function fnPublishPostLoadingEvents () {
                    EventHub.emit("StepDone", eventData.stepName);
                }

                // load the plugins and always publish post events
                function fnLoadPlugins () {
                    oPluginManager
                        .loadPlugins("RendererExtensions")
                        .always(fnPublishPostLoadingEvents);
                }

                if (bDelayPlugin) {
                    // delay loading by 5 sec.
                    window.setTimeout(fnLoadPlugins, 5000);
                } else {
                    fnLoadPlugins();
                }
            }
            sap.ushell.Container.getServiceAsync("PluginManager").then(createPlugins.bind(this));
        },

        // Triggers loading of the warmup plugins via Plugin Manager
        _loadWarmupPlugins: function (eventData) {
            sap.ushell.Container.getServiceAsync("PluginManager").then(function (oPluginManager) {
                oPluginManager.loadPlugins("AppWarmup").always(function () {
                    Log.debug("WARMUP plugins loaded", null, "sap.ushell.renderers.fiori2.Shell");
                    EventHub.emit("StepDone", eventData.stepName);
                    utils.setPerformanceMark("SchedulingAgent-EndOfFlow");
                    utils.setPerformanceMeasure("SchedulingAgentTotalTime", "SchedulingAgent-StartOfFlow", "SchedulingAgent-EndOfFlow");
                });
            });
        },

        // Triggers loading of CoreExt via EventHub
        _loadCoreExt: function () {
            Measurement.end("FLP:Container.InitLoading");
            // Trigger oEventHub.once("loadCoreResourcesComplement") in case homepage is first rendered.
            // Usually this is done with resolveHashFragment, but without passing from that path we should trigger it actively.
            sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function () {
                EventHub.emit("loadCoreResourcesComplement");
            });
        },

        getCurrentViewportState: function () {
            return Config.last("/core/shell/model/currentViewPortState");
        },

        _activateFloatingUIActions: function (iWindowWidth) {
            if (iWindowWidth < 417) {
                this.oFloatingUIActions.disable();
            } else {
                this.oFloatingUIActions.enable();
            }
        },

        setFloatingContainerDragSelector: function (sElementToCaptureSelector) {
            var oElementToCapture = document.querySelector(sElementToCaptureSelector);
            if (oElementToCapture) {
                oElementToCapture.classList.add("sapUshellShellFloatingContainerSelector");
            }

            // Fix for internal incident #1770519876 2017 -
            // Avoiding crash of CoPilot after deleting an instance and using a property (in UIAction) of the deleted one
            sap.ui.require(["sap/ushell/UIActions"], function (UIActions) {
                if (!this.oFloatingUIActions) {
                    this.oFloatingUIActions = new UIActions({
                        containerSelector: ".sapUiBody",
                        wrapperSelector: ".sapUshellShellFloatingContainerWrapper",
                        draggableSelector: ".sapUshellShellFloatingContainerWrapper", // the element that we drag
                        rootSelector: ".sapUiBody",
                        cloneClass: "sapUshellFloatingContainer-clone",
                        dragCallback: this._handleFloatingContainerUIStart.bind(this), // for hide the original item while dragging
                        endCallback: this._handleFloatingContainerDrop.bind(this),
                        moveTolerance: 3,
                        onDragStartUIHandler: this._onDragStartUI.bind(this),
                        onDragEndUIHandler: this._setFloatingContainerHeight.bind(this),
                        dragAndScrollCallback: this._doDock.bind(this),
                        switchModeDelay: 1000,
                        isLayoutEngine: false,
                        isTouch: false, // that.isTouch,
                        elementToCapture: sElementToCaptureSelector,
                        defaultMouseMoveHandler: function () { },
                        debug: Log.getLevel() >= Log.Level.DEBUG
                    });
                } else {
                    this.oFloatingUIActions.elementsToCapture = jQuery(sElementToCaptureSelector);
                }

                this._activateFloatingUIActions(jQuery(window).width());
                var timer;
                jQuery(window).bind("resize", function () {
                    clearTimeout(timer);
                    timer = window.setTimeout(this._activateFloatingUIActions(jQuery(window).width()), 300);
                }.bind(this));
            }.bind(this));
        },

        /**
         * This function called once start to drag the co-pilot element
         * It checks whether it reach 64px(4rem) to the right/left in order to open the docking area
         * Also it checks whether to close the docking area
         * @param {object} oCfg configuration parameters
         * @private
         */
        _doDock: function (oCfg) {
            Measurement.start("FLP:Shell.controller._doDock", "dragging co-pilot element", "FLP");
            // open dock option only if config is enable and screen size is L (desktop + tablet landscape)
            var oDevice = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD);
            if (oDevice.name === "Desktop") {
                var iWinWidth = jQuery(window).width();
                if (oCfg) {
                    oCfg.docked = {};
                    var oDockedProp = oCfg.docked;
                    // cfg.moveX get FloatingContainer courser x position.
                    // handle for opening the docking area for right and left
                    // in case that docking area open - close it
                    // in case canvas moved (because the docking ) close it
                    if (oCfg.moveX >= iWinWidth - 64) {
                        oDockedProp.dockPos = "right";
                        oDockedProp.setIsDockingAreaOpen = true;
                        this._openDockingArea(oCfg);
                    } else if (oCfg.moveX < 64) {
                        oDockedProp.dockPos = "left";
                        oDockedProp.setIsDockingAreaOpen = true;
                        this._openDockingArea(oCfg);
                    } else {
                        if (this._isDockingAreaOpen()) {
                            this._closeDockingArea(oCfg);
                        }
                        if (jQuery("#canvas").hasClass("sapUshellContainerDocked")) {
                            this._handleCloseCanvas(oCfg);
                        }
                    }
                }
            }
            Measurement.end("FLP:Shell.controller._doDock");
        },

        /**
         * This method handle the finish (after drop) for the docking
         * @param {object} oDockedProp properties object
         * @private
         */
        _finishDoDock: function (oDockedProp) {
            this._openDockingArea(false);
            // save the last state of the copilot
            var oStorage = new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.CopilotLastState");
            oStorage.put("lastState", "docked:" + oDockedProp.dockPos);
            this._handleOpenCanvas(oDockedProp);
            var oWrapperElement = jQuery("#sapUshellFloatingContainerWrapper");
            oWrapperElement.css("height", "100%");
            jQuery("#shell-floatingContainer").addClass("sapUshellShellFloatingContainerFullHeight");
            // New event for co-pilot is docked.
            Core.getEventBus().publish("launchpad", "shellFloatingContainerIsDocked");
        },

        _onResizeWithDocking: function () {
            // handle appFinder size changed
            // timeOut waiting for resize event is finish
            window.setTimeout(function () {
                Core.getEventBus().publish("launchpad", "appFinderWithDocking");
            }, 300);
        },

        /**
         * This function happens when start to drag
         * In this case if we docked we need to remove animations and close canvas
         * @param {object} oCfg configuration object
         * @private
         */
        _onDragStartUI: function (oCfg) {
            Measurement.start("FLP:Shell.controller._onDragStartUI", "start drag", "FLP");
            if (this._isDock()) {
                // save the last state of the copilot
                var oStorage = new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.CopilotLastState");
                oStorage.put("lastState", "floating");
                jQuery("#sapUshellFloatingContainerWrapper").removeClass("sapUshellContainerDocked");
                jQuery(".sapUshellShellFloatingContainerFullHeight").removeClass("sapUshellShellFloatingContainerFullHeight");
                // New event for co-pilot is unDock
                Core.getEventBus().publish("launchpad", "shellFloatingContainerIsUnDocked");
                jQuery("#sapUshellFloatingContainerWrapper").removeClass("sapUshellContainerDockedMinimizeCoPilot sapUshellContainerDockedExtendCoPilot");
                jQuery("#sapUshellFloatingContainerWrapper").addClass("sapUshellContainerDockedMinimizeCoPilot");
                jQuery(jQuery(".sapUshellContainerDockedMinimizeCoPilot")).on("webkitAnimationEnd oanimationend msAnimationEnd animationend", this._handleAnimations(false));
                this._handleCloseCanvas(oCfg);
            }
            Measurement.end("FLP:Shell.controller._onDragStartUI");
        },

        /**
         * This function handle the adding animations when dock/undock
         * @param {boolean} bIsDock set docked
         * @param {string} sDockingPosition docking position
         * @private
         */
        _handleAnimations: function (bIsDock) {
            var sClassName = "sapUshellContainerDockedLaunchpad";
            var oWrapperElement = jQuery("#sapUshellFloatingContainerWrapper");

            if (bIsDock) {
                jQuery("#canvas, #shell-header").addClass(sClassName); // The header is outside of the canvas

                oWrapperElement.addClass("sapUshellContainerDockedExtendCoPilot");
                this._onResizeWithDocking();
            } else {
                jQuery("#sapUshellFloatingContainerWrapper").addClass("sapUshellContainerDockedExtendCoPilot");
            }
        },

        /**
         * This function opens docking area for copilot
         * @param {object} oCfg configuration object
         * @private
         */
        _openDockingArea: function (oCfg) {
            var oDockProperties = oCfg ? oCfg.docked : false;
            var bIsDock = oDockProperties ? oDockProperties.setIsDockingAreaOpen : false;
            // check if need to open docking area and it doesn't exist already
            if (bIsDock && jQuery("#DockingAreaDiv").length === 0) {
                var bIsRTL = Configuration.getRTL();
                if ((oDockProperties.dockPos === "right" && oCfg.clone && !bIsRTL) || (oDockProperties.dockPos === "left" && oCfg.clone && bIsRTL)) {
                    jQuery('<div id="DockingAreaDiv" class="sapUshellShellDisplayDockingAreaRight">').appendTo(oCfg.clone.parentElement);
                } else if ((oDockProperties.dockPos === "left" && oCfg.clone && !bIsRTL) || (oDockProperties.dockPos === "right" && oCfg.clone && bIsRTL)) {
                    jQuery('<div id="DockingAreaDiv" class="sapUshellShellDisplayDockingAreaLeft">').appendTo(oCfg.clone.parentElement);
                }
                oCfg.clone.oDockedProp = {};
                oCfg.clone.oDockedProp.dockPos = oDockProperties.dockPos;
                // After drop the copilot - docking area should disappear
            } else if (!bIsDock) {
                this._closeDockingArea();
            }
        },

        /**
         * This function close docking area for copilot
         * @param {object} oCfg configuration object
         * @private
         */
        _closeDockingArea: function (/*oCfg*/) {
            window.setTimeout(function () {
                jQuery(".sapUshellShellDisplayDockingAreaRight").remove();
                jQuery(".sapUshellShellDisplayDockingAreaLeft").remove();
            }, 150);
        },

        /**
         * @returns {boolean} True if co-pilot is docked. Otherwise false.
         * @private
         */
        _isDock: function () {
            return document.getElementsByClassName("sapUshellContainerDocked").length !== 0;
        },

        /**
         * This function return whether the docking area open or not
         * @returns {boolean} if the docker area is opened
         * @private
         */
        _isDockingAreaOpen: function () {
            return document.getElementsByClassName("sapUshellShellDisplayDockingAreaRight").length !== 0
                || document.getElementsByClassName("sapUshellShellDisplayDockingAreaLeft").length !== 0;
        },

        /**
         * This function open the canvas so there will be place for the docking area
         * @param {object} oDockedProp dock properties object
         * @private
         */
        _handleOpenCanvas: function (oDockedProp) {
            var oCanvasElement = jQuery("#canvas");
            var oHeaderElement = jQuery(".sapUshellShellHead");
            var bIsRTL = Configuration.getRTL();
            if ((oDockedProp.dockPos === "right" && !bIsRTL) || (oDockedProp.dockPos === "left" && bIsRTL)) {
                oCanvasElement.addClass("sapUshellContainer-Narrow-Right sapUshellContainerDocked ");
                oHeaderElement.addClass("sapUshellHead-Narrow-Right sapUshellContainerDocked");
            }
            if ((oDockedProp.dockPos === "left" && !bIsRTL) || (oDockedProp.dockPos === "right" && bIsRTL)) {
                oCanvasElement.addClass("sapUshellContainer-Narrow-Left sapUshellContainerDocked ");
                oHeaderElement.addClass("sapUshellHead-Narrow-Left sapUshellContainerDocked");
            }
            var oViewPortContainer = Core.byId("viewPortContainer");
            if (oViewPortContainer) {
                oViewPortContainer._handleSizeChange();
            }
        },

        /**
         * Close the canvas after docking area disappear
         * @param {object} oCfg configuration object
         * @private
         */
        _handleCloseCanvas: function (oCfg) {
            var oCanvasElement = jQuery("#canvas");
            var oHeaderElement = jQuery(".sapUshellShellHead");
            if (oCfg) {
                oCfg.docked.setIsDockingAreaOpen = false;
            }
            if (oCanvasElement.hasClass("sapUshellContainer-Narrow-Right")) {
                oCanvasElement.removeClass("sapUshellContainer-Narrow-Right sapUshellContainerDocked sapUshellMoveCanvasRight");
                oHeaderElement.removeClass("sapUshellHead-Narrow-Right sapUshellContainerDocked");
                this._openDockingArea(oCfg);
                this._setFloatingContainerHeight();
            }
            if (oCanvasElement.hasClass("sapUshellContainer-Narrow-Left")) {
                oCanvasElement.removeClass("sapUshellContainer-Narrow-Left sapUshellContainerDocked sapUshellMoveCanvasLeft");
                oHeaderElement.removeClass("sapUshellHead-Narrow-Left sapUshellContainerDocked");
                this._openDockingArea(oCfg);
                this._setFloatingContainerHeight();
            }
            this._onResizeWithDocking();
            var oViewPortContainer = Core.byId("viewPortContainer");
            if (oViewPortContainer) {
                oViewPortContainer._handleSizeChange();
            }
        },

        /**
         * Handle the height of the copilot + add animations for ir
         * @param {object} oEvent event object
         * @private
         */
        _setFloatingContainerHeight: function (oEvent) {
            // if movement X && Y is 0 its means there is no drag was made only click
            var iWinWidth = jQuery(window).width();

            var oWrapperElement = jQuery("#sapUshellFloatingContainerWrapper");
            if (this._isDock()) {
                if (oEvent && (oEvent.clientX >= iWinWidth - 64 || oEvent.clientX < 64)) { // if less then 64 its just a click - no need to animate
                    oWrapperElement.addClass(" sapUshellContainerDocked");
                    oWrapperElement.addClass("sapUshellContainerDockedMinimizeCoPilot");
                    jQuery(oWrapperElement).on("webkitAnimationEnd oanimationend msAnimationEnd animationend", this._handleAnimations(true));
                }
            } else if (!this._isDock()) {
                jQuery("#sapUshellFloatingContainerWrapper").removeClass("sapUshellContainerDockedMinimizeCoPilot sapUshellContainerDockedExtendCoPilot");
            }
        },

        _handleFloatingContainerDrop: function (oEvent, floatingContainerWrapper, oDelta) {
            Measurement.start("FLP:Shell.controller._handleFloatingContainerDrop", "drop floating container", "FLP");
            var oFloatingContainer = floatingContainerWrapper.firstChild ? Core.byId(floatingContainerWrapper.firstChild.id) : undefined;
            var storage = new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.FloatingContainer");
            var iWindowWidth = jQuery(window).width();
            var iWindowHeight = jQuery(window).height();
            var iPosLeft = oDelta.deltaX / iWindowWidth;
            var iPosTop = oDelta.deltaY / iWindowHeight;
            var sOrigContainerVisibility = floatingContainerWrapper.style.visibility;
            var sOrigContainerDisplay = floatingContainerWrapper.style.display;
            var iContainerLeft = parseFloat(floatingContainerWrapper.style.left.replace("%", ""));
            var iContainerTop = parseFloat(floatingContainerWrapper.style.top.replace("%", ""));

            if (typeof (iContainerLeft) === "number") {
                iPosLeft = iContainerLeft + 100 * oDelta.deltaX / iWindowWidth;
            }

            if (typeof (iContainerTop) === "number") {
                iPosTop = iContainerTop + 100 * oDelta.deltaY / iWindowHeight;
            }

            // when docking area is open - means the copilot should be on top of the screen
            if (this._isDockingAreaOpen()) {
                iPosTop = 0;
            }

            floatingContainerWrapper.style.left = iPosLeft + "%";
            floatingContainerWrapper.style.top = iPosTop + "%";
            floatingContainerWrapper.style.position = "absolute";
            floatingContainerWrapper.style.display = "block";
            floatingContainerWrapper.visibility = sOrigContainerVisibility;
            floatingContainerWrapper.display = sOrigContainerDisplay;

            storage.put("floatingContainerStyle", floatingContainerWrapper.style.cssText);
            // call resizeHandler to adjust the size and position of the floating container in case it was dropped out of the window size boundaries
            if (oFloatingContainer) {
                oFloatingContainer.handleDrop();
                // when docking area is open and the copilot drop inside - should handle it
                if (oDelta.clone.oDockedProp && this._isDockingAreaOpen()) {
                    this._finishDoDock(oDelta.clone.oDockedProp);
                }
            }
            Measurement.end("FLP:Shell.controller.handleFloatingContainerDrop");
        },

        // This function called after co-pilot start to be dragged
        _handleFloatingContainerUIStart: function (evt, ui) {
            Measurement.start("FLP:Shell.controller._handleFloatingContainerUIStart", "starts dragging floating container", "FLP");
            var floatingContainer = ui;
            floatingContainer.style.display = "none";
            if (window.getSelection) {
                var selection = window.getSelection();
                // for IE
                try {
                    selection.removeAllRanges();
                } catch (e) {
                    // continue regardless of error
                }
            }
            Measurement.end("FLP:Shell.controller._handleFloatingContainerUIStart");
        },

        // This function open local storage and return the docked state: docked or floating
        getFloatingContainerState: function () {
            var oStorage = new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.CopilotLastState");
            var sLastState = "floating";
            if (oStorage !== null) {
                sLastState = oStorage.get("lastState");
                if (sLastState === null) {
                    sLastState = "floating";
                }
            }
            return sLastState;
        },

        setFloatingContainerVisibility: function (bVisible) {
            var sLastState = this.getFloatingContainerState();
            if (sLastState) {
                if (sLastState === "floating") {
                    this.getView().getOUnifiedShell().setFloatingContainerVisible(bVisible);
                } else if (sLastState.indexOf("docked") !== -1) {
                    var oViewPortContainer = Core.byId("viewPortContainer");
                    if (bVisible === true) {
                        var sDevice = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD);
                        if (sDevice.name === "Desktop") {
                            var oWrapperElement = jQuery("#sapUshellFloatingContainerWrapper");
                            oWrapperElement.addClass("sapUshellContainerDocked");
                            jQuery("#canvas, .sapUshellShellHead").addClass("sapUshellContainerDocked");
                            oWrapperElement.css("height", "100%");
                            Core.byId("shell-floatingContainer").addStyleClass("sapUshellShellFloatingContainerFullHeight");
                            if (oViewPortContainer) {
                                oViewPortContainer._handleSizeChange();
                            }

                            // case : dock from button
                            if (Configuration.getRTL()) {
                                if (sLastState.indexOf("right") !== -1) {
                                    jQuery("#canvas").addClass("sapUshellContainer-Narrow-Left");
                                    jQuery(".sapUshellShellHead").addClass("sapUshellHead-Narrow-Left");
                                    this._handleAnimations(true);
                                } else {
                                    jQuery("#canvas").addClass("sapUshellContainer-Narrow-Right");
                                    jQuery(".sapUshellShellHead").addClass("sapUshellHead-Narrow-Right");
                                    this._handleAnimations(true);
                                }
                            } else if (sLastState.indexOf("right") !== -1) {
                                jQuery("#canvas").addClass("sapUshellContainer-Narrow-Right");
                                jQuery(".sapUshellShellHead").addClass("sapUshellHead-Narrow-Right");
                                this._handleAnimations(true);
                            } else {
                                jQuery("#canvas").addClass("sapUshellContainer-Narrow-Left");
                                jQuery(".sapUshellShellHead").addClass("sapUshellHead-Narrow-Left");
                                this._handleAnimations(true);
                            }
                            window.setTimeout(function () {
                                this.getView().getOUnifiedShell().setFloatingContainerVisible(bVisible);
                            }.bind(this), 400);
                        } else {
                            new Storage(Storage.Type.local, "com.sap.ushell.adapters.local.CopilotLastState").put("lastState", "floating");
                            this.getView().getOUnifiedShell().setFloatingContainerVisible(bVisible);
                        }
                    } else {
                        // case : undock from button
                        this._handleAnimations(false);
                        if (oViewPortContainer) {
                            oViewPortContainer._handleSizeChange();
                        }
                        window.setTimeout(function () {
                            this.getView().getOUnifiedShell().setFloatingContainerVisible(bVisible);
                        }.bind(this), 400);
                        jQuery("#canvas, .sapUshellShellHead")
                            .removeClass("sapUshellContainerDocked sapUshellContainer-Narrow-Right sapUshellContainer-Narrow-Left");
                    }
                    jQuery("#sapUshellFloatingContainerWrapper").removeClass("sapUshellContainerDockedMinimizeCoPilot sapUshellContainerDockedExtendCoPilot");
                    this._onResizeWithDocking();
                    if (oViewPortContainer) {
                        oViewPortContainer._handleSizeChange();
                    }
                }
            }
        },

        getFloatingContainerVisibility: function () {
            return this.getView().getOUnifiedShell().getFloatingContainerVisible();
        },

        setFloatingContainerContent: function (sPropertyString, aIds, bCurrentState, aStates) {
            oShellModel.setFloatingContainerContent(sPropertyString, aIds, bCurrentState, aStates);
        },

        getRightFloatingContainerVisibility: function () {
            var oRightFloatingContainer = this.getView().getOUnifiedShell().getRightFloatingContainer();
            var bRightFloatingContainerVisible = oRightFloatingContainer && oRightFloatingContainer.getVisible();
            return bRightFloatingContainerVisible;
        },

        setHeaderTitle: function (sTitle) {
            HeaderManager.updateStates({
                propertyName: "title",
                value: sTitle || "",
                aStates: ["home", "app"],
                bCurrentState: false,
                bDoNotPropagate: false
            });
        },

        setFooter: function (oFooter) {
            var oShellLayout = this.getView().getOUnifiedShell();
            if (typeof oFooter !== "object" || !oFooter.getId) {
                throw new Error("oFooter value is invalid");
            }
            if (oShellLayout.getFooter() !== null) { //there can be only 1 footer
                Log.warning("You can only set one footer. Replacing existing footer: " + oShellLayout.getFooter().getId() + ", with the new footer: " + oFooter.getId() + ".");
            }
            oShellLayout.setFooter(oFooter);
        },

        removeFooter: function () {
            this.getView().getOUnifiedShell().setFooter(null);
        },

        addUserPreferencesEntry: function (entryObject, bGrouped) {
            this._validateUserPrefEntryConfiguration(entryObject, bGrouped);
            this._updateUserPrefModel(entryObject, bGrouped);
        },

        addUserProfilingEntry: function (entryObject) {
            this._validateUserPrefEntryConfiguration(entryObject);
            this._updateProfilingModel(entryObject);
        },

        _validateUserPrefEntryConfiguration: function (entryObject, bGrouped) {
            if ((!entryObject) || (typeof entryObject !== "object")) {
                throw new Error("object oConfig was not provided");
            }

            if (!entryObject.title) {
                throw new Error("title was not provided");
            }

            if (!entryObject.value) {
                throw new Error("value was not provided");
            }

            if (typeof entryObject.entryHelpID !== "undefined") {
                if (typeof entryObject.entryHelpID !== "string") {
                    throw new Error("entryHelpID type is invalid");
                } else if (entryObject.entryHelpID === "") {
                    throw new Error("entryHelpID should not be an empty string");
                }
            }

            if (entryObject.title && typeof entryObject.title !== "string") {
                throw new Error("title type is invalid");
            }

            if (typeof entryObject.value !== "function" && typeof entryObject.value !== "string" && typeof entryObject.value !== "number") {
                throw new Error("value type is invalid");
            }

            [
                "onSave",
                "content",
                "onCancel"
            ].forEach(function (sPropertyName) {
                if (entryObject[sPropertyName] && typeof entryObject[sPropertyName] !== "function") {
                    throw new Error(sPropertyName + " type is  " + typeof entryObject[sPropertyName] + " but should be a function");
                }
            });

            if (bGrouped) {
                [
                    {
                        name: "groupingId",
                        type: "string"
                    },
                    {
                        name: "groupingTabTitle",
                        type: "string"
                    },
                    {
                        name: "groupingTabHelpId",
                        type: "string"
                    }
                ].forEach(function (oProperty) {
                    if (!entryObject[oProperty.name]) {
                        throw new Error(oProperty.name + " is missing");
                    } else if (typeof entryObject[oProperty.name] !== oProperty.type) {
                        throw new Error(oProperty.name + " type is " + typeof entryObject[oProperty.name] + " but should be a " + oProperty.type);
                    }
                });
            }
        },

        _createSessionHandler: function (oSessionConfig) {
            var that = this;
            var iLazyCreationTime = 20000;

            sap.ui.require(["sap/ushell/SessionHandler"], function (SessionHandler) {
                that.oSessionHandler = new SessionHandler(AppLifeCycleAI);
                //we need to immediately init the logout logic that is needed
                //for cFLP without any delay
                that.oSessionHandler.initLogout();
                window.setTimeout(function () {
                    that.oSessionHandler.init({
                        sessionTimeoutReminderInMinutes: oSessionConfig.sessionTimeoutReminderInMinutes,
                        sessionTimeoutIntervalInMinutes: oSessionConfig.sessionTimeoutIntervalInMinutes,
                        sessionTimeoutTileStopRefreshIntervalInMinutes: oSessionConfig.sessionTimeoutTileStopRefreshIntervalInMinutes,
                        enableAutomaticSignout: oSessionConfig.enableAutomaticSignout
                    });
                }, iLazyCreationTime);
            });
        },

        _getSessionHandler: function () {
            return this.oSessionHandler;
        },

        _navBack: function () {
            // set meAria as closed when navigating back
            this.setUserActionsMenuSelected(false);
            AppLifeCycleAI.service().navigateBack();
        },

        _updateUserPrefModel: function (entryObject, bGrouped) {
            var oNewEntry = this._getModelEntryFromEntryObject(entryObject);
            var aEntries = Config.last("/core/userPreferences/entries") || [];

            if (bGrouped) {
                oNewEntry.groupingEnablement = true;
                oNewEntry.groupingId = entryObject.groupingId;
                oNewEntry.groupingTabTitle = entryObject.groupingTabTitle;
                oNewEntry.groupingTabHelpId = entryObject.groupingTabHelpId;
            }

            aEntries.push(oNewEntry);
            // Re-order the entries array to have the Home Page entry right after the Appearance entry (if both exist)
            aEntries = this._reorderUserPrefEntries(aEntries);
            Config.emit("/core/userPreferences/entries", aEntries);
        },

        _updateProfilingModel: function (entryObject) {
            var oNewEntry = this._getModelEntryFromEntryObject(entryObject);
            var aProfilingEntries = Config.last("/core/userPreferences/profiling") || [];

            aProfilingEntries.push(oNewEntry);
            Config.emit("/core/userPreferences/profiling", aProfilingEntries);
        },

        _getModelEntryFromEntryObject: function (entryObject) {
            return {
                id: utils._getUid(),
                entryHelpID: entryObject.entryHelpID,
                title: entryObject.title,
                valueArgument: entryObject.value,
                valueResult: null,
                onSave: entryObject.onSave,
                onCancel: entryObject.onCancel,
                contentFunc: entryObject.content,
                contentResult: null,
                icon: entryObject.icon,
                provideEmptyWrapper: entryObject.provideEmptyWrapper
            };
        },

        _reorderUserPrefEntries: function (aEntries) {
            var aNewEntries = [];
            var aOrderedIds = [
                "userAccountEntry",
                "themes",
                "homepageEntry",
                "spacesEntry",
                "userActivitiesEntry",
                "userProfiling",
                "language",
                "notificationsEntry",
                "userDefaultEntry"
            ];
            var mSpecialEntries = {};

            for (var i = aEntries.length - 1; i >= 0; i--) {
                if (aOrderedIds.indexOf(aEntries[i].id) !== -1) {
                    var oSpecialEntry = aEntries.splice(i, 1)[0];
                    mSpecialEntries[oSpecialEntry.id] = oSpecialEntry;
                }
            }

            aOrderedIds.forEach(function (sId) {
                var oEntry = mSpecialEntries[sId];
                if (oEntry) {
                    aNewEntries.push(oEntry);
                }
            });

            return aNewEntries.concat(aEntries);
        },

        getModel: function () {
            return oModel;
        },

        _getConfig: function () {
            return oConfig || {};
        },

        _getPersData: function (oPersonalizationId) {
            var oComponent = Component.getOwnerComponentFor(this.getView());
            return new Promise(function (resolve, reject) {
                sap.ushell.Container.getServiceAsync("Personalization").then(function (oPersonalizationService) {
                    var oScope = {
                        keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                        writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                        clientStorageAllowed: true
                    };
                    var oPersonalizer = oPersonalizationService.getPersonalizer(oPersonalizationId, oScope, oComponent);
                    oPersonalizer.getPersData()
                        .then(resolve)
                        .fail(reject);
                });
            });
        },

        // encapsulate access to location so that we can stub it easily in tests
        _getCurrentLocationHash: function () {
            return window.location.hash;
        },

        setUserActionsMenuSelected: function (bSelected) {
            EventHub.emit("showUserActionsMenu", bSelected);
        },

        getUserActionsMenuSelected: function () {
            return Config.last("/core/shell/model/currentViewPortState") === "LeftCenter";
        },

        setNotificationsSelected: function (bSelected) {
            EventHub.emit("showNotifications", bSelected);
        },

        getNotificationsSelected: function () {
            return Config.last("/core/shell/model/currentViewPortState") === "RightCenter";
        }
    });
});
