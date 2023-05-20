// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * Default renderer for SAP Fiori launchpad.
 * Publishes all lifecycle events as described in the documentation of the "sap.ushell" namespace.
 */
sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/UIComponent",
    "sap/ushell/ui/shell/ToolAreaItem",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/ushell/components/applicationIntegration/AppLifeCycle",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/resources",
    "sap/base/util/UriParameters",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/extend",
    "sap/ui/base/Object",
    "sap/base/util/ObjectPath",
    "sap/ui/core/library",
    "sap/ushell/library",
    "sap/ui/core/mvc/View",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/m/NotificationListItem",
    "./RendererExtensions"
], function (
    Core,
    UIComponent,
    ToolAreaItem,
    Config,
    EventHub,
    oUshellUtils,
    AppLifeCycle,
    Device,
    JSONModel,
    oSharedComponentUtils,
    AppConfiguration,
    resources,
    UriParameters,
    jQuery,
    Log,
    deepExtend,
    extend,
    BaseObject,
    ObjectPath,
    coreLibrary,
    ushellLibrary,
    View,
    ShellHeadItem,
    NotificationListItem
    // RendererExtensions
) {
    "use strict";

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = coreLibrary.mvc.ViewType;

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call <code>sap.ushell.Container.createRenderer("fiori2", true)</code>.
     *
     * @class The SAPUI5 component of SAP Fiori Launchpad renderer for the Unified Shell.
     * @extends sap.ui.core.UIComponent
     * @alias sap.ushell.renderers.fiori2.Renderer
     * @since 1.15.0
     * @public
     */
    var Renderer = UIComponent.extend("sap.ushell.renderers.fiori2.Renderer", {
        metadata: {
            version: "1.113.0",
            dependencies: {
                version: "1.113.0",
                libs: ["sap.ui.core", "sap.m"],
                components: []
            },
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            routing: {
                config: {
                    path: "sap.ushell.components",
                    async: true,
                    controlId: "viewPortContainer",
                    clearAggregation: false,
                    controlAggregation: "pages"
                },
                routes: [{
                    name: "appfinder-legacy",
                    pattern: "Shell-home&/appFinder/:menu:/:filter:" // TODO root intent must come from configuration
                }, {
                    name: "home",
                    pattern: ["Shell-home?:hashParameters:", "Shell-home&/:innerHash*:", "Shell-home"], // TODO must come from configuration
                    target: (function () {
                        if (Config.last("/core/homeApp/enabled")) {
                            return "homeapp";
                        }

                        //CEP MyHome
                        if (Config.last("/core/workPages/enabled") && Config.last("/core/workPages/myHome/pageId") !== null) {
                            return "workpages";
                        }

                        //CEP Standard
                        if (Config.last("/core/workPages/enabled") && Config.last("/core/workPages/myHome/pageId") === null) {
                            return "runtimeSwitcher";
                        }

                        if (Config.last("/core/spaces/enabled")) {
                            return "pages";
                        }

                        return "home";
                    })()
                }, {
                    name: "appfinder",
                    pattern: [ // TODO must come from configuration
                        "Shell-appfinder?:hashParameters:&/:innerHash*:",
                        "Shell-appfinder?:hashParameters*:",
                        "Shell-appfinder&/:innerHash*:",
                        "Shell-appfinder"
                    ],
                    target: Config.last("/core/catalog/enabled") ? "appfinder" : undefined // Avoid the loading of Component
                }, {
                    name: "openFLPPage",
                    pattern: [
                        "Launchpad-openFLPPage?:hashParameters:",
                        "Launchpad-openFLPPage"
                    ],
                    target: (function () {
                        //CEP MyHome
                        if (Config.last("/core/workPages/enabled") && Config.last("/core/workPages/myHome/pageId") !== null) {
                            return "workpages";
                        }

                        //CEP Standard
                        if (Config.last("/core/workPages/enabled") && Config.last("/core/workPages/myHome/pageId") === null) {
                            return "runtimeSwitcher";
                        }

                        if (Config.last("/core/spaces/enabled")) {
                            return "pages";
                        }

                        return "home";
                    })()
                }, {
                    //Testing workpages - technical route
                    name: "openWorkPage",
                    pattern: [
                        "Launchpad-openWorkPage?:hashParameters:",
                        "Launchpad-openWorkPage"
                    ],
                    target: "workpages"
                }, {
                    name: "wzsearch",
                    pattern: [ // TODO must come from configuration
                        "WorkZoneSearchResult-display:?query:"
                    ],
                    target: "wzsearch"
                }],
                targets: {
                    home: {
                        name: "homepage",
                        type: "Component",
                        title: resources.i18n.getText("homeBtn_tooltip"), // TODO does not work yet
                        id: "Shell-home-component",
                        options: {
                            manifest: false,
                            asyncHints: {
                                preloadBundles: Config.last("/core/home/featuredGroup/enable") ?
                                    ["sap/ushell/preload-bundles/homepage-af-dep.js", "sap/ushell/components/homepage/cards-preload.js"] :
                                    ["sap/ushell/preload-bundles/homepage-af-dep.js"]
                            },
                            componentData: {
                                // use additional settings here as needed...
                                config: {
                                    enablePersonalization: true,
                                    enableHomePageSettings: false
                                }
                            }
                        }
                    },
                    appfinder: {
                        name: "appfinder",
                        type: "Component",
                        // TODO title: "",
                        id: "Shell-appfinder-component",
                        options: {
                            manifest: false,
                            asyncHints: { preloadBundles: ["sap/ushell/preload-bundles/homepage-af-dep.js"] },
                            componentData: {
                                // use additional settings here as needed...
                                config: {
                                    enablePersonalization: true,
                                    enableHomePageSettings: false
                                }
                            }
                        }
                    },
                    pages: {
                        name: "pages",
                        type: "Component",
                        id: "pages-component",
                        options: {
                            componentData: {},
                            asyncHints: {
                                preloadBundles: ["sap/ushell/preload-bundles/homepage-af-dep.js"]
                            }
                        }
                    },
                    workpages: {
                        name: "workPageRuntime",
                        type: "Component",
                        id: "workPageRuntime-component",
                        options: {
                            componentData: {},
                            asyncHints: {
                                preloadBundles: [
                                    "sap/ushell/preload-bundles/workpage-rt-0.js",
                                    "sap/ushell/preload-bundles/workpage-rt-1.js",
                                    "sap/ushell/preload-bundles/workpage-rt-2.js",
                                    "sap/ushell/preload-bundles/workpage-rt-3.js"
                                ]
                            }
                        }
                    },
                    runtimeSwitcher: {
                        name: "runtimeSwitcher",
                        type: "Component",
                        id: "runtimeSwitcher-component",
                        options: {
                            componentData: {},
                            asyncHints: {
                                preloadBundles: [
                                    "sap/ushell/preload-bundles/homepage-af-dep.js",
                                    "sap/ushell/preload-bundles/workpage-rt-0.js",
                                    "sap/ushell/preload-bundles/workpage-rt-1.js",
                                    "sap/ushell/preload-bundles/workpage-rt-2.js",
                                    "sap/ushell/preload-bundles/workpage-rt-3.js"
                                ]
                            }
                        }
                    },
                    wzsearch: {
                        name: "cepsearchresult.app",
                        type: "Component",
                        id: "cepsearchresult-app-component",
                        options: {
                            manifest: true,
                            componentData: {
                                // use additional settings here as needed...
                                config: {
                                    enablePersonalization: true,
                                    enableHomePageSettings: false
                                }
                            }
                        }
                    }
                }
            }
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            var oRouter = this.getRouter();

            // Add HomeApp target dynamically
            if (Config.last("/core/homeApp/enabled")) {
                this._getHomeAppTarget().then(function (oTarget) {
                    oRouter.getTargets().addTarget("homeapp", oTarget);
                    oRouter.getTarget("homeapp").attachEventOnce("display", function () {
                        // Core-ext complement has been loaded by the routing component of the renderer.
                        // Trigger instantiation of SchedulingAgent which is bringing up the menu bar.
                        EventHub.emit("CoreResourcesComplementLoaded", { status: "success" });
                    });
                });
            }

            oRouter.getRoute("home").attachMatched(this._prepareHomepage, this);
            oRouter.getRoute("openFLPPage").attachMatched(this._prepareHomepage, this);
            oRouter.getRoute("openWorkPage").attachMatched(this._prepareHomepage, this);

            oRouter.getRoute("appfinder-legacy").attachMatched(function (oEvent) {
                // TODO consider innerapp routes from old intent, e.g.:
                //   - #Shell-home&/appFinder/catalog
                //   - #Shell-home&/appFinder/catalog/%7B"tileFilter":"set","tagFilter":%5B%5D,"targetGroup":""%7D
                oRouter.navTo("appfinder", {}, true);
            });

            oRouter.getRoute("appfinder").attachMatched(function (oEvent) {
                if (!Config.last("/core/catalog/enabled")) {
                    Log.warning("AppFinder is disabled. Re-route to the homepage.");
                    oRouter.navTo("home", null, true);
                    return;
                }

                //Use in ShellAnalytics to track navigation to app finder
                EventHub.emit("trackHashChange", "Shell-appFinder");
                var oComponent = Core.getComponent(this.createId("Shell-appfinder-component"));
                var oData = oEvent.getParameter("arguments");
                if (sap.ushell.Container.getRenderer("fiori2")) {
                    AppLifeCycle.getShellUIService().setBackNavigation();
                    sap.ushell.Container.getRenderer("fiori2").setCurrentCoreView("appFinder");
                }
                AppConfiguration.setCurrentApplication(null);

                var oAppFinderRouter = oComponent.getRouter();
                // wait for the root view to be loaded before the inner hash is forwarded to the AppFinder component
                oComponent.getRootControl().loaded().then(function () {
                    oAppFinderRouter.parse(oData["innerHash*"] || "");
                });

                AppLifeCycle.switchViewState("app", false, "Shell-appfinder");
                AppLifeCycle.getAppMeta().setAppIcons();

                oSharedComponentUtils.initializeAccessKeys();
            }, this);

            oRouter.getRoute("wzsearch").attachMatched(function (oEvent) {
                AppLifeCycle.getShellUIService().setBackNavigation();
                AppLifeCycle.switchViewState("app", false, "cepsearchresult-app");
            });

            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");
            this.setModel(resources.i18nModel, "i18n");
        }
    });

    /**
     * Hook which is called every time a route is matched
     * @param {sap.ui.base.Event} oEvent The event object
     *
     * @private
     * @since 1.100.0
     */
    Renderer.prototype._prepareHomepage = function (oEvent) {
        //Use in ShellAnalytics to track navigation to homepage
        EventHub.emit("trackHashChange", "Shell-home");
        if (AppConfiguration.getCurrentApplication()) {
            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (ShellNavigation) {
                ShellNavigation.setIsInitialNavigation(false);
            });
        }

        var sCurrentHash = window.hasher.getHash();
        if (!Config.last("/core/spaces/enabled") && sCurrentHash.indexOf("Launchpad-openFLPPage") === 0) {
            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (ShellNavigation) {
                ShellNavigation.replaceHashWithoutNavigation("Shell-home");
            });
        }

        var sHomeTitle = resources.i18n.getText("homeBtn_tooltip");

        var sRootIntent = this.getShellConfig().rootIntent;
        var bIsRootIntentFlpHome = !sRootIntent || oUshellUtils.isFlpHomeIntent(sRootIntent);

        // switch to home first so that #set calls below have effect
        AppLifeCycle.switchViewState(bIsRootIntentFlpHome ? "home" : "app", false, "Shell-home");

        this.setCurrentCoreView("home");
        AppConfiguration.setCurrentApplication(null);

        AppLifeCycle.getShellUIService().setTitle(sHomeTitle);
        AppLifeCycle.getShellUIService().setHierarchy();
        AppLifeCycle.getShellUIService().setRelatedApps();
        AppLifeCycle.getAppMeta().setAppIcons(); // For the custom theme the favicon should be loaded get from theme parameter

        oSharedComponentUtils.initializeAccessKeys();
    };

    /**
     * Returns the configured homeApp
     * @returns {Promise<object>} Resolves the oTargetOptions for the homeapp target
     *
     * @private
     * @since 1.100.0
     */
    Renderer.prototype._getHomeAppTarget = function () {
        return sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (Ui5ComponentLoader) {
            var oHomeAppComponent = Config.last("/core/homeApp/component");
            var aCoreResourcesComplement = Ui5ComponentLoader.getCoreResourcesComplementBundle();

            if (oHomeAppComponent.url) {
                return {
                    name: oHomeAppComponent.name,
                    type: "Component",
                    id: "homeApp-component",
                    path: "", // needed, otherwise sap/ushell/components is used
                    options: {
                        url: oHomeAppComponent.url,
                        componentData: {},
                        asyncHints: Object.assign({}, oHomeAppComponent.asyncHints || {}, {
                            // Merging dynamic asyncHints of FLP startup config and static preload bundles
                            preloadBundles: aCoreResourcesComplement
                        })
                    }
                };
            }

            return {
                name: "error",
                type: "Component",
                id: "homeApp-component",
                path: "sap/ushell/components/homeApp", // needed, otherwise sap/ushell/components is used
                options: {
                    componentData: {},
                    asyncHints: {
                        preloadBundles: aCoreResourcesComplement
                    }
                }
            };
        });
    };

    /**
     * @returns {string|undefined} so-called "appState" (not to be confused with Internal or External App State)
     * @private
     */
    Renderer.prototype.getSapUshellConfigParam = function () {
        var sState;
        sState = UriParameters.fromQuery(window.location.search).get("sap-ushell-config");
        if (sState) {
            return sState.toLowerCase();
        }
        sState = UriParameters.fromQuery(window.location.search).get("appState");
        if (sState) {
            Log.error("URL parameter 'appState' is given, but deprecated. Please use 'sap-ushell-config' instead!", "sap.ushell.renderers.fiori2.Renderer");
            return sState.toLowerCase();
        }
        return undefined;
    };

    /**
     * @returns {object} an instance of Shell view
     * @since 1.15.0
     * @private
     */
    Renderer.prototype.createContent = function () {
        var sGivenState = Renderer.prototype.getSapUshellConfigParam();
        var viewData = this.getComponentData() || {};
        var oAppConfig = {
            applications: { "Shell-home": {} },
            rootIntent: "Shell-home"
        };

        if (sGivenState) {
            if (!viewData.config) {
                viewData.config = {};
            }
            viewData.config.appState = sGivenState;
        }

        // the code below migrates a configuration structure from version 1.28 or older, to the default expected configuration structure in 1.30
        if (viewData.config) {
            // We need to pass this flag in order to check lately the possibility of local resolution for empty hash
            if (viewData.config.rootIntent === undefined) {
                viewData.config.migrationConfig = true;
            }
            // Merge all needed configuration
            // config.applications["Shell-home"] is created with the first extend.
            viewData.config = deepExtend(
                oAppConfig,
                viewData.config
            );
            extend(
                viewData.config.applications["Shell-home"],
                Config.last("/core/home"),
                Config.last("/core/catalog")
            );

            // handle the Personalization flag
            if (viewData.config.appState === "headerless" || viewData.config.appState === "merged" || viewData.config.appState === "blank") {
                viewData.config.enablePersonalization = false;
                Config.emit("/core/shell/enablePersonalization", false);
            } else {
                viewData.config.enablePersonalization = Config.last("/core/shell/enablePersonalization");
            }

            // If the personalization is disabled, do not create the AppFinder and Edit buttons in the header
            if (!viewData.config.enablePersonalization) {
                viewData.config.moveEditHomePageActionToShellHeader = false;
                viewData.config.moveAppFinderActionToShellHeader = false;
            }
        }

        var oShellModel = Config.createModel("/core/shell/model", JSONModel);
        viewData.shellModel = oShellModel;

        if (!this.getComponentData().async) {
            Log.error("sap/ushell/renderers/fiori2/Renderer component is created synchronously. Synchronous instantiation is not allowed. Please use async:true in component data");
            var oSyncView = sap.ui.view("mainShell", { // LEGACY API (deprecated)
                type: ViewType.JS,
                viewName: "sap.ushell.renderers.fiori2.Shell",
                height: "100%",
                viewData: viewData
            });

            oSyncView.setModel(oShellModel);
            this._oShellView = oSyncView;

            this.oShellModel = AppLifeCycle.getElementsModel();

            oSyncView.loaded().then(function (oCreatedView) {
                // initialize the RendererExtensions after the view is created.
                // This also publishes an external event that indicates that sap.ushell.renderers.fiori2.RendererExtensions can be used.
                sap.ushell.renderers.fiori2.utils.init(oCreatedView.getController());
                this.shellCtrl = oCreatedView.oController;
            }.bind(this));

            return oSyncView;
        }

        return View.create({
            id: "mainShell",
            viewName: "module:sap/ushell/renderers/fiori2/ShellAsync.view",
            viewData: viewData
        }).then(function (oView) {
            oView.setModel(oShellModel);
            this._oShellView = oView;
            this.oShellModel = AppLifeCycle.getElementsModel();

            // initialize the RendererExtensions after the view is created.
            // This also publishes an external event that indicates that sap.ushell.renderers.fiori2.RendererExtensions can be used.
            sap.ushell.renderers.fiori2.utils.init(oView.getController());
            this.shellCtrl = oView.getController();
            return oView;
        }.bind(this));
    };

    /**
     * Creates an extended shell state.<br>
     * An extended shell state is an extension for the current shell that can be applied by the function applyExtendedShellState.<br>
     *
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").createCustomShellState('test1', function () {
     *   var oTileActionsButton = sap.ushell.Container.getRenderer("fiori2").addActionButton("sap.ushell.ui.launchpad.ActionItem",{
     *   id: "xxx2",
     *   text: 'aaaaaaaaaaaa',
     *   icon: 'sap-icon://edit',
     *   tooltip: sap.ushell.resources.i18n.getText("activateActionMode"),
     *   press: function () {
     *     sap.ushell.components.homepage.ActionMode.toggleActionMode(oModel, "Menu Item");
     *   }}, true, true);
     * });
     * </pre>
     *
     * @param {string} sShellName Name of the extended shell state.
     * @param {function} fnCreationInstructions Shell API commands for creating the extension.
     *
     * @returns {object} Created Extended Shell State.
     * @since 1.35
     * @private
     */
    Renderer.prototype.createExtendedShellState = function (sShellName, fnCreationInstructions) {
        // create a shadow shell, shell will extend custom shell state.
        return AppLifeCycle.shellElements().createExtendedShellState(sShellName, fnCreationInstructions);
    };

    /**
     * Set the extended shell to be active.<br>
     * This function changes the shell state to display the extended shell merged with the current shell.<br>
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").createCustomShellState('test1', function () {
     *   var oTileActionsButton = sap.ushell.Container.getRenderer("fiori2").addActionButton("sap.ushell.ui.launchpad.ActionItem",{
     *   id: "xxx2",
     *   text: 'aaaaaaaaaaaa',
     *   icon: 'sap-icon://edit',
     *   tooltip: sap.ushell.resources.i18n.getText("activateActionMode"),
     *   press: function () {
     *     sap.ushell.components.homepage.ActionMode.toggleActionMode(oModel, "Menu Item");
     *   }}, true, true);
     * });
     * sap.ushell.Container.getRenderer("fiori2").applyExtendedShellState('test1');
     * </pre>
     *
     * @param {string} sShellName Name of the extended shell state.
     * @param {function} fnCustomMerge fnCustomMerge
     * @since 1.35
     * @private
     */
    Renderer.prototype.applyExtendedShellState = function (sShellName, fnCustomMerge) {
        //merge the current shell state state (HOME/APP) with the custom shell.
        this.oShellModel.applyExtendedShellState(sShellName, fnCustomMerge);
    };

    /**
     * Sets the content of the left pane in Fiori launchpad, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is added in all states.
     *
     * <b>Example:</b>
     * <pre>
     * var oButton = new Button(id: "newButton", text: "Test Button"); // e.g. sap.m.Button
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * oRenderer.showActionButton([oButton.getId()], false, ["home", "app"]);
     * </pre>
     *
     * @param {string|string[]} vIds Either ID or an array of IDs of elements to be added to the shell.
     * @param {boolean} bCurrentState if true, add the current component only to the current instance of the rendering of the shell.
     *   if false, add the component to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @since 1.30
     * @private
     */
    Renderer.prototype.showLeftPaneContent = function (vIds, bCurrentState, aStates) {
        var aIds = typeof vIds === "string" ? [vIds] : vIds;

        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("paneContent", aIds);
        } else {
            this.oShellModel.addLeftPaneContent(aIds, false, aStates);
        }
    };

    /**
     * Creates and displays one or more HeaderItem controls according to the given control IDs and Shell states<br>
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).<br><br>
     * The HeaderItem controls will be displayed on the left side of the Fiori Launchpad shell header according to the given display parameters.<br>
     * There can be up to three header items. If the number of existing header items plus the given ones exceeds 3,
     * then the operation fails and no new header items are created.<br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.ShellHeadItem();
     * var button2 = new sap.ushell.ui.shell.ShellHeadItem();
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showHeaderItem ([button1.getId(), button2.getId()], false, ["home", "app"]);
     * </pre>
     *
     * @param {string|string[]} vIds Either ID or an array of IDs of headerItem controls to be added to the shell header.
     * @param {boolean} bCurrentState If <code>true</code> then the new created controls are added to the current rendered shell state.
     *   When the user navigates to another application (including the Home page) then the controls will be removed.
     *   If <code>false</code> then the controls are added to the LaunchPadState itself.
     * @param {string[]} aStates Valid only if bCurrentState is <code>false</code>.
     *   A list of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the controls are added.
     *   If no launchpad state is provided the controls are added in all states.
     *   @see sap.ushell.renderers.fiori2.renderer.LaunchpadState.
     * @since 1.30
     * @public
     */
    Renderer.prototype.showHeaderItem = function (vIds, bCurrentState, aStates) {
        var aIds = typeof vIds === "string" ? [vIds] : vIds;

        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("headItems", aIds);
        } else {
            this.oShellModel.addHeaderItem(aIds, false, aStates);
        }
    };

    /**
     * Displays RightFloatingContainerItem on the left side of the Fiori launchpad shell, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.RightFloatingContainerItem();
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showRightFloatingContainerItem(button1.getId(), false, ["home", "app"]);
     * </pre>
     *
     * @param {string|string[]} vIds Either ID or an array of IDs of elements to be added to the Tool Area.
     * @param {boolean} bCurrentState if true, add the current RightFloatingContainerItems only to the current instance of the rendering of the shell.
     *   if false, add the RightFloatingContainerItems to the LaunchPadState itself.
     * @param {string[]} aStates Only valid if bCurrentState is set to false.
     *   A list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @since 1.37
     * @private
     */
    Renderer.prototype.showRightFloatingContainerItem = function (vIds, bCurrentState, aStates) {
        var aIds = typeof vIds === "string" ? [vIds] : vIds;

        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("RightFloatingContainerItems", aIds);
        } else {
            this.oShellModel.addRightFloatingContainerItem(aIds, false, aStates);
        }
    };

    /**
     * Displays RightFloatingContainerItem on the right side of the Fiori launchpad shell.
     *
     * @param {boolean} bShow Defines whether to show or hide the
     * @since 1.37
     * @private
     */
    Renderer.prototype.showRightFloatingContainer = function (bShow) {
        AppLifeCycle.shellElements().setShellModelForApplications("showRightFloatingContainer", bShow);
    };

    /**
     * Displays ToolAreaItems on the left side of the Fiori Launchpad shell, in the given launchpad states.
     *
     * <b>Example:</b>
     * <pre>
     * sap.ui.require(["sap/ushell/ui/shell/ToolAreaItem"], function (ToolAreaItem) {
     *     var oRenderer = sap.ushell.Container.getRenderer("fiori2"),
     *         oToolAreaItem = new ToolAreaItem({ icon: "sap-icon://wrench" });
     *     renderer.showToolAreaItem(oToolAreaItem.getId(), false, ["home", "app"]);
     * });
     * </pre>
     *
     * @param {string|string[]} vIds A single ID or an array of IDs to add to the Tool Area.
     * @param {boolean} bCurrentState If <code>true</code>, add the items to the currently rendered shell.
     *   If <code>false</code>, add the items to the LaunchPadState itself,
     *   causing the items to be rendered every time the given states are active.
     * @param {string[]} aStates Only valid if bCurrentState is set to <code>false</code>.
     *   An array of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the controls are added.
     *   If no launchpad state is provided the items are added in all states.
     *   @see sap.ushell.renderers.fiori2.renderer.LaunchpadState.
     * @since 1.30
     * @public
     */
    Renderer.prototype.showToolAreaItem = function (vIds, bCurrentState, aStates) {
        this.oShellModel.addToolAreaItem(vIds, true, bCurrentState, aStates);
    };

    /**
     * Displays action buttons in the User Actions Menu in the SAP Fiori launchpad, in the given launchpad states (LaunchpadState).
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The user actions menu is opened via the button on the right hand side of the shell header.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.m.Button();
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showActionButton([button1.getId()], false, ["home", "app"]);
     * </pre>
     *
     * @param {string[]} aIds List of ID elements to that should be added to the User Actions Menu options bar.
     * @param {boolean} bCurrentState If true, add the created control to the current rendered shell state. When the user navigates to a
     *   different state, or to a different application, then the control is removed. If false, the control is added to the LaunchpadState.
     * @param {string[]} aStates List of the launchpad states (sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which to add the aIds.
     *   Valid only if bCurrentState is set to false.
     *   @see sap.ushell.renderers.fiori2.renderer.LaunchpadState.
     *   If no launchpad state is provided, the content is added in all states.
     * @since 1.30
     * @public
     */
    Renderer.prototype.showActionButton = function (aIds, bCurrentState, aStates) {
        var aButtons = [];
        var aActions = [];
        var oButton;

        if (typeof aIds === "string") {
            aIds = [aIds];
        }
        // In case the method was called with instance of sap.m.Button, we need to convert it to
        // sap.ushell.ui.launchpad.ActionItem in order to apply the action item behavior and styles to this control
        aButtons = aIds.filter(function (sId) {
            oButton = Core.byId(sId);
            return BaseObject.isA(oButton, "sap.m.Button") && !(BaseObject.isA(oButton, "sap.ushell.ui.launchpad.ActionItem"));
        });
        aActions = aIds.filter(function (sId) {
            oButton = Core.byId(sId);
            return oButton instanceof sap.ushell.ui.launchpad.ActionItem;
        });
        if (aButtons.length) {
            this.convertButtonsToActions(aButtons, bCurrentState, aStates);
        }
        if (aActions.length) {
            if (bCurrentState) {
                AppLifeCycle.shellElements().addShellModelForApplications("actions", aIds);
            } else {
                this.oShellModel.addActionButton(aIds, false, aStates);
            }
        }
    };

    /**
     * Displays FloatingActionButton on the bottom right corner of the Fiori launchpad, in the given launchpad states.
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.ShellFloatingAction();
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showFloatingActionButton([button1.getId()], true);
     * </pre>
     *
     * @param {string[]} aIds List of ID elements to add to the user actions menu.
     * @param {boolean} bCurrentState if true, add the current Buttons only to the current instance of the rendering of the shell.
     *   if false, add the Buttons to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @since 1.30
     * @public
     * @deprecated since 1.52. Support for the FloatingActionButton has been discontinued.
     */
    Renderer.prototype.showFloatingActionButton = function (aIds, bCurrentState, aStates) {
        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("floatingActions", typeof aIds === "string" ? [aIds] : aIds);
        } else {
            this.oShellModel.addFloatingActionButton(typeof aIds === "string" ? [aIds] : aIds, false, aStates);
        }
    };

    /**
     * Displays HeaderItems on the right side of the Fiori launchpad shell header, in the given launchpad states
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the content is displayed in all states.</br>
     * The shell header can display the user HeaderItem, and just one more HeaderItem.</br>
     * If this method is called when the right side of the header is full, this method will not do anything.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var button1 = new sap.ushell.ui.shell.ShellHeadItem();
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showHeaderEndItem ([button1.getId()], false, ["home", "app"]);
     * </pre>
     *
     * @param {string[]} aIds List of ID elements to add to the shell header.
     * @param {boolean} bCurrentState if true, add the current HeaderItems only to the current instance of the rendering of the shell.
     *   if false, add the HeaderItems to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @since 1.30
     * @public
     */
    Renderer.prototype.showHeaderEndItem = function (aIds, bCurrentState, aStates) {
        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("headEndItems", typeof aIds === "string" ? [aIds] : aIds);
        } else {
            this.oShellModel.addHeaderEndItem(typeof aIds === "string" ? [aIds] : aIds, false, aStates);
        }
    };

    /**
     * Sets the header visibility according to the given value and shell states.
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * oRenderer.setHeaderVisibility(false, false, ["home", "app"]);
     * </pre>
     *
     * @param {boolean} bVisible The visibility of the header<br>
     * @param {boolean} bCurrentState If <code>true</code> then the visibility is set only to the current rendered shell state.<br>
     *   When the user navigates to another application (including the Home page) then the visibility flag is reset.<br>
     *   If <code>false</code> then set the visibility according to the states provided in the aState parameter.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the header visibility flag should be set.<br>
     *   If no launchpad state is provided the visibility flag is set for all states.
     *   @see LaunchpadState
     * @since 1.38
     * @public
     */
    Renderer.prototype.setHeaderVisibility = function (bVisible, bCurrentState, aStates) {
        if (bCurrentState) {
            AppLifeCycle.shellElements().setShellModelForApplications("headerVisible", bVisible);
        } else {
            this.oShellModel.setHeaderVisibility(bVisible, false, aStates);
        }
    };

    /**
     * Displays one or more sub header controls according to the given control IDs and shell states.<br>
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).<br><br>
     * A sub header is placed in a container, located directly below the main Fiori launchpad shell header.<br>
     *
     * <b>Example:</b>
     * <pre>
     * var bar = new sap.m.Bar({id: "testBar", contentLeft: [new sap.m.Button({text: "Test SubHeader Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]});
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * oRenderer.showSubHeader([bar.getId()], false, ["home", "app"]);
     * </pre>
     *
     * @param {string[]} aIds Array of sub header control IDs to be added<br>
     * @param {boolean} bCurrentState If <code>true</code> then the new created controls are added only to the current rendered shell state.<br>
     *   When the user navigates to another application (including the Home page) then the controls will be removed.<br>
     *   If <code>false</code> then add the control to the LaunchPadState itself.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the controls are added.<br>
     *   If no launchpad state is provided the controls are added in all states.
     *   @see LaunchpadState
     * @since 1.30
     * @public
     */
    Renderer.prototype.showSubHeader = function (aIds, bCurrentState, aStates) {
        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("subHeader", typeof aIds === "string" ? [aIds] : aIds);
        } else {
            this.oShellModel.addSubHeader(typeof aIds === "string" ? [aIds] : aIds, false, aStates);
        }
    };

    /**
     * Displays Sign Out button in User Actions Menu in the given launchpad state
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the item is displayed in all states.</br>
     * If this method is called when the sign out button already displayed, this method will not do anything.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showSignOutItem (false, ["home", "app"]);
     * </pre>
     *
     * @param {boolean} bCurrentState if true, add the sign out button only to the current instance of the rendering of the shell.
     *   if false, add the sign out button to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @since 1.44
     * @private
     */
    Renderer.prototype.showSignOutItem = function (bCurrentState, aStates) {
        if (bCurrentState) {
            AppLifeCycle.shellElements().addShellModelForApplications("actions", ["logoutBtn"], false);
        } else {
            this.oShellModel.showSignOutButton(bCurrentState, aStates);
        }
    };

    /**
     * Displays Settings button in User Actions Menu in the given launchpad state
     * (see sap.ushell.renderers.fiori2.renderer.LaunchpadState).</br>
     * If no launchpad state is provided the item is displayed in all states.</br>
     * If this method is called when the sign out button already displayed, this method will not do anything.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.showSettingsItem (false, ["home", "app"]);
     * </pre>
     *
     * @param {boolean} bCurrentState if true, add the settings button only to the current instance of the rendering of the shell.
     *   if false, add settings button to the LaunchPadState itself.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.renderer.LaunchpadState in which to add the aIds.
     * @since 1.44
     * @private
     */
    Renderer.prototype.showSettingsItem = function (bCurrentState, aStates) {
        this.oShellModel.showSettingsButton(bCurrentState, aStates);
    };

    /**
     * Displays the given sap.m.Bar as the footer of the Fiori launchpad shell.</br>
     * The footer will be displayed in all states. </br>
     *
     * <b>Example:</b>
     * <pre>
     * var bar = new sap.m.Bar({contentLeft: [new sap.m.Button({text: "Test Footer Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]});
     * var renderer = sap.ushell.Container.getRenderer("fiori2");
     * renderer.setFooter(bar);
     * </pre>
     *
     * @param {Object} oFooter - sap.m.Bar, the control to be added as the footer of the Fiori Launchpad
     * @since 1.30
     * @public
     */
    Renderer.prototype.setFooter = function (oFooter) {
        this.shellCtrl.setFooter(oFooter);
    };

    /**
     * Creates and displays an SAPUI5 control as the footer of the Fiori launchpad shell.<br>
     * The footer will be displayed in all states. <br>
     * Previously created footer will be removed. <br>
     *
     * <b>For example, using the sap.m.Bar control:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2"),
     *   oFooterControlProperties = {
     *     controlType : "sap.m.Bar",
     *     oControlProperties : {
     *       id: "testBar",
     *       contentLeft: [new sap.m.Button({
     *         text: "Test Footer Button",
     *         press: function () {
     *           sap.m.MessageToast.show("Pressed");
     *         }
     *       })]
     *     }
     *   };
     * oRenderer.setShellFooter(oFooterControlProperties);
     * </pre>
     *
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object:<br>
     *  Properties:<br>
     *   - {string} controlType<br>
     *     The (class) name of the control type to create, for example: <code>"sap.m.Bar"</code><br>
     *   - {object} oControlProperties<br>
     *     The properties that will be passed to the created control, for example: <code>{id: "testBar"}</code><br>
     * @returns {object} jQuery.deferred.promise object that when resolved, returns the newly created control
     * @since 1.48
     * @public
     */
    Renderer.prototype.setShellFooter = function (oParameters) {
        var oDeferred = new jQuery.Deferred();
        var that = this;
        var oControlInstance;
        var controlType = oParameters.controlType;
        var oControlProperties = oParameters.oControlProperties;

        // If a control instance is already created - get it by its id
        if (oControlProperties && oControlProperties.id && Core.byId(oControlProperties.id)) {
            oControlInstance = Core.byId(oControlProperties.id);
            if (oControlInstance) {
                // In case a footer was created before, we remove it first before setting a new one
                if (this.lastFooterId) {
                    this.removeFooter();
                }
                // This parameter holds the id of a footer that was created by the setFooterControl API
                this.lastFooterId = oControlInstance.getId();
                this.shellCtrl.setFooter(oControlInstance);

                oDeferred.resolve(oControlInstance);
            }
        }

        if (controlType) {
            var sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource],
                function (ControlObject) {
                    oControlInstance = new ControlObject(oControlProperties);
                    // In case a footer was created before, we remove it first before setting a new one
                    if (that.lastFooterId) {
                        that.removeFooter();
                    }

                    // This parameter holds the id of a footer that was created by the setFooterControl API
                    that.lastFooterId = oControlInstance.getId();
                    that.shellCtrl.setFooter(oControlInstance);

                    oDeferred.resolve(oControlInstance);
                });
        } else {
            Log.warning("You must specify control type in order to create it");
        }
        return oDeferred.promise();
    };

    /**
     * Creates and displays an SAPUI5 control as the footer of the Fiori launchpad shell.<br>
     * The footer will be displayed in all states. <br>
     * Previously created footer will be removed. <br>
     *
     * <b>For example, using the sap.m.Bar control:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * oRenderer.setFooterControl("sap.m.Bar", {id: "testBar", contentLeft: [new sap.m.Button({text: "Test Footer Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]});
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * @param {string} controlType The (class) name of the control type to create.<br>
     *   For example: <code>"sap.m.Bar"</code><br>
     * @param {object} oControlProperties The properties that will be passed to the created control.<br>
     *   For example: <code>{id: "testBar"}</code><br>
     * @returns {object} The created control
     * @since 1.42
     * @deprecated since 1.48. Please use {@link #setShellFooter} instead.
     * @public
     */
    Renderer.prototype.setFooterControl = function (controlType, oControlProperties) {
        var sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        var ControlObject = sap.ui.require(sControlResource);
        var bResourceLoadedAsObject = false;

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error("Renderer.setFooterControl: the referenced control resource " + controlType + " is not available.",
                undefined, "sap.ushell.renderers.fiori2.Renderer");
            return undefined;
        }

        var oControlInstance = this.createItem(oControlProperties, undefined, function (oProperties) {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                var ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        //In case a footer was created before, we remove it first before setting a new one
        if (this.lastFooterId) {
            this.removeFooter();
        }
        //This parameter holds the id of a footer that was created by s previous call to setFooterControl
        this.lastFooterId = oControlInstance.getId();
        this.shellCtrl.setFooter(oControlInstance);
        return oControlInstance;
    };

    /*--------------------------Hide ----------------------------------*/

    /**
     * Hide the given sap.ushell.ui.shell.ShellHeadItem from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @param {string[]} aIds the Ids of the sap.ushell.ui.shell.ShellHeadItem to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @public
     */
    Renderer.prototype.hideHeaderItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeHeaderItem([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeHeaderItem(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Remove the given Tool Area Item from Fiori Launchpad, in the given launchpad states.
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @param {string|string[]} vIds A single ID or an array of IDs to remove from the Tool Area.
     * @param {boolean} bCurrentState If <code>true</code>, remove the items from the currently rendered shell.
     *   If <code>false</code>, remove the items from the LaunchPadState itself,
     *   causing the items to be removed every time the given states are active.
     * @param {string[]} aStates (only valid if bCurrentState is set to <code>false</code>) -
     *   An array of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) from which the controls are removed.
     *   If no launchpad state is provided the items are removed from all states.
     *   @see sap.ushell.renderers.fiori2.renderer.LaunchpadState.
     * @since 1.30
     * @public
     */
    Renderer.prototype.removeToolAreaItem = function (vIds, bCurrentState, aStates) {
        if (typeof vIds === "string") {
            vIds = [vIds];
        }
        this.oShellModel.removeToolAreaItem(vIds, bCurrentState, aStates);
    };

    /**
     * Remove the given Tool Area Item from Fiori Launchpad, in the given launchpad states.
     *
     * @param {string[]} aIds the Ids of the sap.ushell.ui.shell.RightFloatingContainerItem control to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @private
     */
    Renderer.prototype.removeRightFloatingContainerItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeRightFloatingContainerItem([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeRightFloatingContainerItem(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hides an action button from the User Actions Menu in the SAP Fiori launchpad, in the given launchpad states (LaunchpadState).
     * The removed button will not be destroyed.<br><br>
     * This API is meant to be used for custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on standard launchpad elements, as this may interfere with the standard launchpad functionality.
     *
     * @param {string[]} aIds IDs of the button controls that should hidden.
     * @param {boolean} bCurrentState If true, removes the current control only from the current rendered shell state.
     * @param {string[]} aStates A list of the launchpad states in which to hide the control. Valid only if bCurrentState is set to false.
     *   @see sap.ushell.renderers.fiori2.renderer.LaunchpadState.
     *   If no launchpad state is provided, the content is hidden in all states.
     * @since 1.30
     * @public
     */
    Renderer.prototype.hideActionButton = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeActionButton([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeActionButton(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given control from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @param {string[]} aIds the Ids of the controls to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @public
     */
    Renderer.prototype.hideLeftPaneContent = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeLeftPaneContent([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeLeftPaneContent(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given sap.ushell.ui.shell.ShellFloatingAction from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @param {string[]} aIds the Ids of the sap.ushell.ui.shell.ShellFloatingAction to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @public
     * @deprecated since 1.52
     */
    Renderer.prototype.hideFloatingActionButton = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeFloatingActionButton([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeFloatingActionButton(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given sap.ushell.ui.shell.ShellHeadItem from Fiori Launchpad, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @param {string[]} aIds the Ids of the sap.ushell.ui.shell.ShellHeadItem to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @public
     */
    Renderer.prototype.hideHeaderEndItem = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeHeaderEndItem([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeHeaderEndItem(aIds, bCurrentState, aStates);
        }
    };

    /**
     * Hide the given control from the Fiori Launchpad sub header, in the given launchpad states.
     * The removed control will not be destroyed.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @param {string[]} aIds the Ids of the controls to remove.
     * @param {boolean} bCurrentState if true, remove the current control only from the current rendered shell state.
     * @param {string[]} aStates list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to remove the control.
     *   (Only valid if bCurrentState is set to false)
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is removed in all states.
     * @since 1.30
     * @public
     */
    Renderer.prototype.hideSubHeader = function (aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeSubHeader([aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeSubHeader(aIds, bCurrentState, aStates);
        }
    };

    /**
     * If exists, this method will remove the footer from the Fiori Launchpad.<br><br>
     * This API is meant to be used for implementing custom elements in the SAP Fiori launchpad.
     * We do not recommend using it on a standard launchpad element, as this may interfere with the standard launchpad functionality.
     *
     * @since 1.30
     * @public
     */
    Renderer.prototype.removeFooter = function () {
        this.shellCtrl.removeFooter();
        //If the footer was created by the renderer (setFooterControl API) then we will destroy it after it removed
        if (this.lastFooterId) {
            var oFooter = Core.byId(this.lastFooterId);
            if (oFooter) {
                oFooter.destroy();
            }
            this.lastFooterId = undefined;
        }
    };

    /**
     * This method returns the current state of the Viewport Container control.
     *
     * @returns {object} The current Viewport State.
     * @since 1.37
     * @public
     */
    Renderer.prototype.getCurrentViewportState = function () {
        return this.shellCtrl.getCurrentViewportState();
    };

    /*------------------------------------------------ Adding controls functionality ------------------------------------------*/

    /**
     * Creates and displays a sub header control in Fiori launchpad, in the given launchpad states.<br>
     * The new control is displayed in FLP UI according to the given display parameters.<br>
     * If a sub header already exists, the new created one will replace the existing one.<br><br>
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2"),
     *     oAddSubHeaderProperties = {
     *         controlType : "sap.m.Bar",
     *         oControlProperties : {
     *             id: "testBar",
     *             contentLeft: [new sap.m.Button({
     *                 text: "Test SubHeader Button",
     *                 press: function () {
     *                     sap.m.MessageToast.show("Pressed");
     *                 }
     *             })
     *         },
     *         bIsVisible: true,
     *         bCurrentState: true
     *     };
     *
     * oRenderer.addShellSubHeader(oAddSubHeaderProperties);
     * </pre>
     *
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object:<br>
     *   Properties:<br>
     *   - {string} controlType<br>
     *     The (class) name of the control type to create.<br>
     *   - {object} oControlProperties<br>
     *     The properties that will be passed to the created control.<br>
     *   - {boolean} bIsVisible<br>
     *     Specify whether to display the control.<br>
     *   - {boolean} bCurrentState<br>
     *     If true, add the current control only to the current rendered shell state.<br>
     *     Once the user navigates to another app or back to the Home page, this control will be removed.<br>
     *   - {string[]} aStates<br>
     *     (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.<br>
     * @returns {object} jQuery.deferred.promise object that when resolved, returns the newly created control
     * @since 1.48
     * @public
     */
    Renderer.prototype.addShellSubHeader = function (oParameters) {
        var oDeferred = new jQuery.Deferred();
        var that = this;
        var oControlInstance;
        var controlType = oParameters.controlType;
        var oControlProperties = oParameters.oControlProperties;
        var bIsVisible = oParameters.bIsVisible;
        var bCurrentState = oParameters.bCurrentState;
        var aStates = oParameters.aStates;

        // If a control instance is already created - get it by its id
        if (oControlProperties && oControlProperties.id && Core.byId(oControlProperties.id)) {
            oControlInstance = Core.byId(oControlProperties.id);
            if (oControlInstance) {
                if (bIsVisible) {
                    this.showSubHeader(oControlInstance.getId(), bCurrentState, aStates);
                }
                oDeferred.resolve(oControlInstance);
            }
        }
        if (controlType) {
            var sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource],
                function (ControlObject) {
                    oControlInstance = new ControlObject(oControlProperties);
                    if (bIsVisible) {
                        that.showSubHeader(oControlInstance.getId(), bCurrentState, aStates);
                        that.oShellModel.addElementToManagedQueue(oControlInstance);
                    }
                    oDeferred.resolve(oControlInstance);
                });
        } else {
            Log.warning("You must specify control type in order to create it");
        }
        return oDeferred.promise();
    };

    /**
     * Creates and displays a sub header control in Fiori launchpad, in the given launchpad states.<br>
     * The new control is displayed in FLP UI according to the given display parameters.<br>
     * If a sub header already exists, the new created one will replace the existing one.<br><br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * oRenderer.addSubHeader("sap.m.Bar", {id: "testBar", contentLeft: [new sap.m.Button({text: "Test SubHeader Button",
     *   press: function () {
     *     sap.m.MessageToast.show("Pressed");
     *   }})
     * ]}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * @param {string} controlType The (class) name of the control type to create.<br>
     *   For example: <code>"sap.m.Bar"</code><br>
     * @param {object} oControlProperties The properties that will be passed to the created control.<br>
     *   For example: <code>{id: "testBar"}</code><br>
     * @param {boolean} bIsVisible Specifies whether the sub header control is displayed after being created.<br>
     *   If <code>true</code> then the control is displayed according to parameters bCurrentState and aStates,<br>
     *   if <code>false</code> then the control is created but not displayed.<br>
     * @param {boolean} bCurrentState If <code>true</code> then the new created control is added to the current rendered shell state.<br>
     *   When the user navigates to another application (including the Home page) then the control will be removed.<br>
     *   If <code>false</code> then add the control to the LaunchPadState itself.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the control is added.<br>
     *   If no launchpad state is provided the control is added in all states.
     *   @see LaunchpadState
     * @returns {object} The created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addShellSubHeader} instead.
     * @public
     */
    Renderer.prototype.addSubHeader = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        var ControlObject = sap.ui.require(sControlResource);
        var bResourceLoadedAsObject = false;

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error("Renderer.setFooterControl: the referenced control resource " + controlType + " is not available.",
                undefined, "sap.ushell.renderers.fiori2.Renderer");
            return undefined;
        }

        var oControlInstance = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                var ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showSubHeader(oControlInstance.getId(), bCurrentState, aStates);
        }
        return oControlInstance;
    };

    /**
     * Creates an Action Button in Fiori launchpad, in the given launchpad states. </br>
     * The button will be displayed in the user actions menu, that is opened from the user button in the shell header.</br>
     *  <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2"),
     *     oAddActionButtonProperties = {
     *         controlType : "sap.m.Button",
     *         oControlProperties : {
     *             id: "exampleButton",
     *             text: "Example Button",
     *             icon: "sap-icon://refresh",
     *             press: function () {
     *                 alert("Example Button was pressed!");
     *             }
     *         },
     *         bIsVisible: true,
     *         bCurrentState: true
     *     };
     * oRenderer.addUserAction(oAddActionButtonProperties);
     * </pre>
     *
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object:<br>
     *  Properties:<br>
     *   - {string} controlType<br>
     *     The (class) name of the control type to create.<br>
     *   - {object} oControlProperties<br>
     *     The properties that will be passed to the created control.<br>
     *   - {boolean} bIsVisible<br>
     *     Specify whether to display the control.<br>
     *   - {boolean} bCurrentState<br>
     *     If true, add the current control only to the current rendered shell state.<br>
     *     Once the user navigates to another app or back to the Home page, this control will be removed.<br>
     *   - {string[]} aStates<br>
     *     (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.<br>
     *
     *    @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} jQuery.deferred.promise object that when resolved, returns the newly created control
     * @since 1.48
     * @public
     */
    Renderer.prototype.addUserAction = function (oParameters) {
        var oDeferred = new jQuery.Deferred();
        var that = this;
        var oControlInstance;
        var controlType = oParameters.controlType;
        var oControlProperties = oParameters.oControlProperties;
        var bIsVisible = oParameters.bIsVisible;
        var bCurrentState = oParameters.bCurrentState;
        var oModelToUpdate = bCurrentState ? AppLifeCycle.shellElements().getStateModelToUpdate() : this.oShellModel.getModelToUpdate();
        var aStates = oParameters.aStates;

        // If a control instance is already created - get it by its id
        if (oControlProperties) {
            oControlInstance = Core.byId(oControlProperties.id);
        }

        if (oControlInstance) {
            oDeferred.resolve(oControlInstance);
        }

        if (controlType) {
            if (controlType === "sap.m.Button") {
                controlType = "sap.ushell.ui.launchpad.ActionItem";
            }
            var sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource], function (ControlClass) {
                // change model
                var oOrigShellModel;

                if (bCurrentState) {
                    oOrigShellModel = AppLifeCycle.shellElements().getStateModelToUpdate();
                    AppLifeCycle.shellElements().setStateModelToUpdate(oModelToUpdate);
                } else {
                    oOrigShellModel = that.oShellModel.getModelToUpdate();
                    that.oShellModel.setModelToUpdate(oModelToUpdate, true);
                }

                oControlInstance = oControlInstance || new ControlClass(oControlProperties);

                if (!oControlInstance.getActionType) {
                    oControlInstance = new ControlClass(oControlProperties);
                }

                if (bIsVisible) {
                    that.showActionButton(oControlInstance.getId(), bCurrentState, aStates);
                }

                if (bCurrentState) {
                    AppLifeCycle.shellElements().setStateModelToUpdate(oOrigShellModel);
                } else {
                    that.oShellModel.setModelToUpdate(oOrigShellModel, false);
                }

                oDeferred.resolve(oControlInstance);
            });
        } else {
            var sNoControlTypeErrorMessage = "You must specify control type in order to create it";
            Log.warning(sNoControlTypeErrorMessage);
            oDeferred.reject(sNoControlTypeErrorMessage);
        }
        return oDeferred.promise();
    };

    /**
     * Creates an action button in the User Actions Menu in the SAP Fiori launchpad, in the given launchpad states (LaunchpadState).</br>
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").addActionButton("sap.m.Button", {id: "testBtn2", text: "test button"}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * @param {string} controlType The (class) name of the control type to create.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     * @param {boolean} bIsVisible Specify whether to display the control. If true, the control is displayed (calls the showActionButton method)
     *   according to the bCurrentState and aStates parameters. If false, the control is created but not displayed
     *   (you can use showActionButton to display the control when needed).
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the home page, this control will be removed.
     * @param {string[]} aStates List of the launchpad states (sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which to add the control.
     *   Valid only if bCurrentState is set to false.
     *   @see sap.ushell.renderers.fiori2.renderer.LaunchpadState
     *   If no launchpad state is provided, the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addUserAction} instead.
     * @public
     */
    Renderer.prototype.addActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var bResourceLoadedAsObject = false;

        if (controlType === "sap.m.Button") {
            controlType = "sap.ushell.ui.launchpad.ActionItem";
        }

        var sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        var ControlObject = sap.ui.require(sControlResource);

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error("Renderer.setFooterControl: the referenced control resource " + controlType + " is not available.",
                undefined, "sap.ushell.renderers.fiori2.Renderer");
            return undefined;
        }

        var oControlInstance = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                var ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showActionButton(oControlInstance.getId(), bCurrentState, aStates);
        }

        return oControlInstance;
    };

    /**
     * Creates a FloatingActionButton in Fiori launchpad, in the given launchpad states.</br>
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").addFloatingActionButton("sap.ushell.ui.shell.ShellFloatingAction", {id: "testBtn"}, true, true);
     * </pre>
     *
     * @param {object} oParameters Contains the required parameters for creating and showing the new control object:<br>
     *  Properties:<br>
     *   - {string} controlType<br>
     *     The (class) name of the control type to create.<br>
     *   - {object} oControlProperties<br>
     *     The properties that will be passed to the created control.<br>
     *   - {boolean} bIsVisible<br>
     *     Specify whether to display the control.<br>
     *   - {boolean} bCurrentState<br>
     *     If true, add the current control only to the current rendered shell state.<br>
     *     Once the user navigates to another app or back to the Home page, this control will be removed.<br>
     *   - {string[]} aStates<br>
     *     (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.<br>
     *
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} jQuery.deferred.promise object that when resolved, returns the newly created control
     * @since 1.48
     * @public
     * @deprecated since 1.52
     */
    Renderer.prototype.addFloatingButton = function (oParameters) {
        var oDeferred = new jQuery.Deferred();
        var that = this;
        var sControlResource;
        var oControlInstance;
        var controlType = oParameters.controlType;
        var oControlProperties = oParameters.oControlProperties;
        var bIsVisible = oParameters.bIsVisible;
        var bCurrentState = oParameters.bCurrentState;
        var aStates = oParameters.aStates;

        // If a control instance is already created - get it by its id
        if (oControlProperties && oControlProperties.id && Core.byId(oControlProperties.id)) {
            oControlInstance = Core.byId(oControlProperties.id);
            if (oControlInstance) {
                if (bIsVisible) {
                    that.showFloatingActionButton(oControlInstance.getId(), bCurrentState, aStates);
                    that.oShellModel.addElementToManagedQueue(oControlInstance);
                }
                oDeferred.resolve(oControlInstance);
            }
        }

        if (controlType) {
            sControlResource = controlType.replace(/\./g, "/");
        } else {
            sControlResource = "sap/m/Button";
        }

        sap.ui.require([sControlResource],
            function (ControlObject) {
                oControlInstance = new ControlObject(oControlProperties);
                if (bIsVisible) {
                    that.showFloatingActionButton(oControlInstance.getId(), bCurrentState, aStates);
                }
                oDeferred.resolve(oControlInstance);
            });
        return oDeferred.promise();
    };

    /**
     * Creates a FloatingActionButton in Fiori launchpad, in the given launchpad states.</br>
     * The FloatingActionButton is rendered in the bottom right corner of the shell.</br>
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").addFloatingActionButton("sap.ushell.ui.shell.ShellFloatingAction", {id: "testBtn"}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * @param {string} controlType The (class) name of the control type to create.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addFloatingButton} instead.
     * @public
     */
    Renderer.prototype.addFloatingActionButton = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var bResourceLoadedAsObject = false;

        if (!controlType) {
            controlType = "sap.m.Button";
        }

        var sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        var ControlObject = sap.ui.require(sControlResource);

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error("Renderer.setFooterControl: the referenced control resource " + controlType + " is not available.",
                undefined, "sap.ushell.renderers.fiori2.Renderer");
            return undefined;
        }

        var oControlInstance = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                var ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showFloatingActionButton(oControlInstance.getId(), bCurrentState, aStates);
        }

        return oControlInstance;
    };

    /**
     * Creates the Left Pane content in Fiori launchpad, in the given launchpad states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2"),
     *     oSidePaneContentProperties = {
     *         controlType : "sap.m.Button",
     *         oControlProperties : {
     *             id: "testBtn",
     *             text: "Test Button"
     *         },
     *         bIsVisible: true,
     *         bCurrentState: true
     *     };
     *
     * oRenderer.addSidePaneContent(oSidePaneContentProperties);
     * </pre>
     *
     * @param {object} oParameters
     *      Contains the parameters for the control that should be added to the side pane
     * @param {string} oParameters.controlType
     *      The (class) name of the control type to create.
     * @param {object} oParameters.oControlProperties
     *      The properties that will be passed to the created control.
     * @param {boolean} oParameters.bIsVisible
     *      Specify whether to display the control.
     * @param {boolean} oParameters.bCurrentState
     *      If true, add the current control only to the current rendered shell state.
     *      Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} oParameters.aStates
     *      (only valid if bCurrentState is set to false) - list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *      @see LaunchpadState
     *      If no launchpad state is provided the content is added in all states.
     *
     * @returns {object} jQuery.deferred.promise object that when resolved, returns the newly created control.
     *
     * @since 1.48
     * @public
     */
    Renderer.prototype.addSidePaneContent = function (oParameters) {
        var oDeferred = new jQuery.Deferred();
        var that = this;
        var oControlInstance;
        var controlType = oParameters.controlType;
        var oControlProperties = oParameters.oControlProperties;
        var bIsVisible = oParameters.bIsVisible;
        var bCurrentState = oParameters.bCurrentState;
        var aStates = oParameters.aStates;

        // If a control instance is already created - get it by its id
        if (oControlProperties && oControlProperties.id && Core.byId(oControlProperties.id)) {
            oControlInstance = Core.byId(oControlProperties.id);
            if (oControlInstance) {
                oDeferred.resolve(oControlInstance);
            }
        }

        if (controlType) {
            var sControlResource = controlType.replace(/\./g, "/");
            sap.ui.require([sControlResource],
                function (ControlObject) {
                    oControlInstance = new ControlObject(oControlProperties);
                    if (bIsVisible) {
                        that.oShellModel.addElementToManagedQueue(oControlInstance);
                        that.showLeftPaneContent(oControlInstance.getId(), bCurrentState, aStates);
                    }
                    oDeferred.resolve(oControlInstance);
                });
        } else {
            Log.warning("You must specify control type in order to create it");
        }
        return oDeferred.promise();
    };

    /**
     * Creates the Left Pane content in Fiori launchpad, in the given launchpad states.</br>
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").addLeftPaneContent("sap.m.Button", {id: "testBtn", text: "Test Button"}, true, true);
     * </pre>
     *
     * This function is marked for deprecation as of version 1.48.<br>
     * It will continue to work as expected as long as one of the following conditions apply:<br>
     *   1. The control instance is already created and its ID is included in the input parameter oControlProperties<br>
     *   2. The control type resource is already loaded
     *
     * @param {string} controlType The (class) name of the control type to create.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @deprecated since 1.48. Please use {@link #addSidePaneContent} instead.
     * @public
     */
    Renderer.prototype.addLeftPaneContent = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        var sControlResource = controlType.replace(/\./g, "/");
        // Try to require the control in case it is already loaded
        var ControlObject = sap.ui.require(sControlResource);
        var bResourceLoadedAsObject;

        // Verify whether the control type is already loaded
        if (ControlObject) {
            bResourceLoadedAsObject = true;
        } else if (!ObjectPath.get(controlType || "")) {
            // since 1.94, follow up for deprecation in 1.48
            Log.error("Renderer.setFooterControl: the referenced control resource " + controlType + " is not available.",
                undefined, "sap.ushell.renderers.fiori2.Renderer");
            return undefined;
        }

        var oControlInstance = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            if (controlType) {
                if (bResourceLoadedAsObject) {
                    return new ControlObject(oProperties);
                }
                var ControlPrototype = ObjectPath.get(controlType || "");
                return new ControlPrototype(oProperties);
            }
            Log.warning("You must specify control type in order to create it");
            return undefined;
        });

        if (bIsVisible) {
            this.showLeftPaneContent(oControlInstance.getId(), bCurrentState, aStates);
        }

        return oControlInstance;
    };

    /**
     * Creates and displays an item in the header of Fiori launchpad, in the given launchpad states.<br>
     * The new header item will be displayed on the left-hand side of the Fiori Launchpad shell header, according to the given display parameters.<br>
     * The new header item will be added to the right of any existing header items. The header can contain a maximum of three header items.<br><br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     *     oRenderer.addHeaderItem({
     *         id: "myTestButton",
     *         ariaLabel: resources.i18n.getText("testButton.label"),
     *         ariaHaspopup: "dialog",
     *         icon: "sap-icon://action-settings",
     *         tooltip: resources.i18n.getText("testButton.tooltip"),
     *         text: resources.i18n.getText("testButton.text"),
     *         press: controller.handleTestButtonPress
     *     }, true, true);
     * </pre>
     *
     * @param {string} [controlType] The (class) name of the control type to create.
     *   <b>Deprecated</b>: Since version 1.38.
     *   This parameter is no longer supported and can be omitted.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     *   For example: <code>{id: "testButton"}</code><br>
     * @param {boolean} bIsVisible Specifies whether the header item control is displayed after being created.<br>
     *   If <code>true</code> then the control is displayed according to parameters bCurrentState and aStates.<br>
     *   If <code>false</code> then the control is created but not displayed.<br>
     * @param {boolean} bCurrentState If <code>true</code> then the new created control is added to the current rendered shell state.<br>
     *   When the user navigates to a different state including a different application then the control will be removed.<br>
     *   If <code>false</code> then add the control to the LaunchPadState itself.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the control is added.<br>
     *   If no launchpad state is provided the control is added in all states.
     *   @see LaunchpadState
     * @returns {object} The created control
     * @since 1.30
     * @public
     */
    Renderer.prototype.addHeaderItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        // in order to support deprecation of the never used argument: 'controlType' , we'll need to check whether it was passed to
        // the function by checking the types of the first two arguments
        if (typeof (arguments[0]) === "object" && typeof (arguments[1]) === "boolean") {
            oControlProperties = arguments[0];
            bIsVisible = arguments[1];
            bCurrentState = arguments[2];
            aStates = arguments[3];
        } else {
            Log.error("sap.ushell.renderers.fiori2.Renderer: The parameter 'controlType' of the function 'addHeaderItem' is deprecated. Usage will be ignored!");
        }

        var oItem = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            return new ShellHeadItem(oProperties);
        });

        if (bIsVisible) {
            this.showHeaderItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates a RightFloatingContainerItem  in Fiori Launchpad and adds it to the Tool Area, in the given launchpad states.</br>
     * If no items are added to the Tool Area, it will not be displayed.</br>
     * Once an item is added, the Tool Area is rendered on the left side on the Fiori Launchpad shell.</br>
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").addRightFloatingContainerItem({
     *   id: 'testButton',
     *   icon: "sap-icon://documents",
     *   press: function (evt) {
     *     window.alert('Press' );
     *   },
     *   expand: function (evt) {
     *     window.alert('Expand' );
     *   }
     * }, true, false, ["home"]);
     * </pre>
     *
     * @param {object} oControlProperties The properties object that will be passed to the constructor of sap.ushell.ui.shell.RightFloatingContainerItem control.
     *   @see sap.ushell.ui.shell.RightFloatingContainerItem
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     * @param {string[]} aStates List of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *   Only valid if bCurrentState is set to false.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @private
     */
    Renderer.prototype.addRightFloatingContainerItem = function (oControlProperties, bIsVisible, bCurrentState, aStates) {
        var oItem = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            return new NotificationListItem(oProperties);
        });

        if (bIsVisible) {
            this.showRightFloatingContainerItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /**
     * Creates a ToolAreaItem  in Fiori Launchpad and adds it to the Tool Area, in the given launchpad states.
     * Once the item is added, the Tool Area is rendered on the left side on the Fiori Launchpad shell.
     *
     * <b>Example:</b>
     * <pre>
     * sap.ushell.Container.getRenderer("fiori2").addToolAreaItem({
     *   id: "testButton",
     *   icon: "sap-icon://documents",
     *   expandable: true,
     *   press: function (evt) {
     *     window.alert("Press" );
     *   },
     *   expand: function (evt) {
     *     // This function will be called on the press event of the "expand" button. The result of "expand" event in the UI must be determined by the developer
     *     window.alert("Expand" );
     *   }
     * }, true, false, ["home"]);
     * </pre>
     *
     * @param {object} oControlProperties The properties object that will be passed to the constructor of sap.ushell.ui.shell.ToolAreaItem control.
     *    @see sap.ushell.ui.shell.ToolAreaItem
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If <code>true</code>, add the item to the currently rendered shell.
     *    If <code>false</code>, add the item to the given LaunchPadStates
     *    This causes the items to be rendered every time the given states are active.
     * @param {string[]} aStates (only valid if bCurrentState is set to <code>false</code>) -
     *    An array of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the controls are added.
     *    If no launchpad state is provided the items are added in all states.
     *    @see sap.ushell.renderers.fiori2.renderer.LaunchpadState.
     * @returns {object} the added control
     * @since 1.30
     * @public
     */
    Renderer.prototype.addToolAreaItem = function (oControlProperties, bIsVisible, bCurrentState, aStates) {
        oControlProperties.visible = !!bIsVisible;

        var fnCreate = function (oProperties) {
            return new ToolAreaItem(oProperties);
        };
        var oItem = this.createItem(oControlProperties, bCurrentState, fnCreate);

        this.oShellModel.addToolAreaItem(oItem.getId(), !!bIsVisible, bCurrentState, aStates);

        return oItem;
    };

    /**
     * Creates and displays a shell header icon in Fiori launchpad, in the given launchpad states.</br>
     * The icon is displayed in the right side of the Fiori Launchpad shell header or in an overflow menu.</br>
     * The text property is mandatory as it might be used in the overflow menu.</br>
     * The tooltip property must not have the same text as the text property, as this causes accessibility issues if the item is in the overflow menu.</br>
     * If no tooltip is provided, the text property is shown as tooltip when the item is not in the overflow menu.</br>
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     *
     *     // Create an icon button that opens a dialog
     *     oRenderer.addHeaderEndItem({
     *         id: "myTestButton",
     *         icon: "sap-icon://action-settings",
     *         tooltip: resources.i18n.getText("testButton.tooltip"),
     *         text: resources.i18n.getText("testButton.text"),
     *         ariaLabel: resources.i18n.getText("testButton.ariaLabel"),
     *         ariaHaspopup: "dialog",
     *         press: [myController.handleTestButtonPress, myController]
     *     }, true);
     *
     *     // Create a temporary link
     *     oRenderer.addHeaderEndItem({
     *         id: "myTestLink",
     *         ariaLabel: resources.i18n.getText("testLink.label"),
     *         target: "#MyTestApplication-show",
     *         icon: "sap-icon://overflow"
     *     }, true, true);
     * </pre>
     *
     * @param {string} controlType The (class) name of the control type to create.
     *   <b>Deprecated</b>: Since version 1.38.
     *   This parameter is no longer supported and can be omitted.
     * @param {object} oControlProperties The properties that will be passed to the created control.
     *   The object may contain the following properties:
     *   <ul>
     *     <li>{string} [id] - The ID of the object.<br>
     *     <li>{string} icon - The button icon source.<br>
     *     <li>{string} [text] - The button text. It is only rendered in the overflow popover but not in the shell header.<br>
     *     <li>{string} [target] - target URI for a navigation link.<br>
     *     <li>{string} [ariaLabel] - Accessibility: aria-label attribute.<br>
     *     <li>{string} [ariaHaspopup] - Accessibility: aria-haspopup attribute.<br>
     *     <li>{Function} [press] - A function to be called when the button is depressed.<br>
     *   </ul>
     * @param {boolean} bIsVisible Specify whether to display the control.
     * @param {boolean} bCurrentState If true, add the current control only to the current rendered shell state.
     *   Once the user navigates to another app or back to the Home page, this control will be removed.
     * @param {string[]} aStates (only valid if bCurrentState is set to false) -
     *   list of the sap.ushell.renderers.fiori2.Renderer.LaunchpadState in which to add the control.
     *   @see LaunchpadState
     *   If no launchpad state is provided the content is added in all states.
     * @returns {object} oItem - the created control
     * @since 1.30
     * @public
     */
    Renderer.prototype.addHeaderEndItem = function (controlType, oControlProperties, bIsVisible, bCurrentState, aStates) {
        // in order to support deprecation of the never used argument: 'controlType' , we'll need to check whether it was passed to
        // the function by checking the types of the first two arguments
        if (typeof (arguments[0]) === "object" && typeof (arguments[1]) === "boolean") {
            oControlProperties = arguments[0];
            bIsVisible = arguments[1];
            bCurrentState = arguments[2];
            aStates = arguments[3];
        }
        var oItem = this.createItem(oControlProperties, bCurrentState, function (oProperties) {
            return new ShellHeadItem(oProperties);
        });

        if (bIsVisible) {
            this.showHeaderEndItem(oItem.getId(), bCurrentState, aStates);
        }

        return oItem;
    };

    /*-------------------general---------------------------*/

    Renderer.prototype.getModelConfiguration = function () {
        return this.shellCtrl.getModelConfiguration();
    };

    /**
     * Adds the given sap.ui.core.Control to the EndUserFeedback dialog.</br>
     * The EndUserFeedback dialog is opened via the user actions menu in the Fiori Launchpad shell header.
     *
     * @param {object} oCustomUIContent The control to be added to the EndUserFeedback dialog.
     * @param {boolean} bShowCustomUIContent Specify whether to display the control.
     * @since 1.30
     * @deprecated since 1.93
     * @public
     */
    Renderer.prototype.addEndUserFeedbackCustomUI = function (oCustomUIContent, bShowCustomUIContent) {
        if (oCustomUIContent || bShowCustomUIContent) {
            Log.info("Application calls sap.ushell.Renderer.addEndUserFeedbackCustomUI. This function is deprecated. The call has no effect.");
        }
    };

    /**
     * Adds an entry to the User Preferences dialog box including the UI control that appears when the user clicks the new entry,
     * and handling of User Preferences actions such as SAVE and CANCEL.
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * var oEntry = {
     *   title: "title",
     *   value: function() {
     *       return jQuery.Deferred().resolve("entryTitleToBeDisplayed");
     *   },
     *   content: function() {
     *       return jQuery.Deferred().resolve(new sap.m.Button("userPrefEntryButton", {text: "Button"}));
     *   },
     *   onSave: function() {
     *       return jQuery.Deferred().resolve();
     *   }
     * };
     * oRenderer.addUserPreferencesEntry(oEntry);
     * </pre>
     *
     * @param {object} entryObject The data of the new added User Preference entry
     *   Including:
     *   <ul>
     *     <li>{string} entryHelpID (Optional) - The ID of the object.<br>
     *     <li>{string} title - The title of the entry to be presented in the list in the User Preferences dialog box.<br>
     *     We recommend using a string from the translation bundle.<br>
     *     <li>{string}/{Function} value - A string to be presented as the value of the entry<br>
     *     OR a function to be called which returns a {jQuery.Deferred.promise} object.<br>
     *     <li>{Function} content - A function to be called that returns a {jQuery.Deferred.promise} object<br>
     *     which consists of a {sap.ui.core.Control} to be displayed in a follow-on dialog box. A SAPUI5 view instance can also be returned.
     *     The functions is called on each time the user opens the User Preferences dialog box.
     *     <li>{Function} onSave - A function to be called which returns a {jQuery.Deferred.promise}
     *     object when the user clicks Save in the User Preferences dialog box.<br>
     *     If an error occurs, pass the error message via the {jQuery.Deferred.promise} object. Errors are displayed in the log.<br>
     *     <li>{Function} onCancel - A function to be called that closes the User Preferences dialog box without saving any changes. <br>
     *     <li>{Boolean} provideEmptyWrapper - Experimental. Set this value to true if you want that your content is displayed without the standard header<br>
     *   </ul>
     *
     * @returns {object} User Preference Entry.
     *
     * @since 1.30
     * @public
     */
    Renderer.prototype.addUserPreferencesEntry = function (entryObject) {
        return this.shellCtrl.addUserPreferencesEntry(entryObject);
    };

    /**
     * Adds an entry to the User Preferences dialog box including the UI control that appears when the user clicks the new entry,
     * and handling of User Preferences actions such as SAVE and CANCEL.
     *
     * If an entry with the same groupingId exists, then they will share one entry and the content of each entry in the group,
     * is reachable via an IconTabBar.
     *
     * <b>Example:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2");
     * var oEntry = {
     *     title: "title",
     *     value: function() {
     *         return jQuery.Deferred().resolve("entryTitleToBeDisplayed");
     *     },
     *     content: function() {
     *         return jQuery.Deferred().resolve(new sap.m.Button("userPrefEntryButton", {text: "Button"}));
     *     },
     *     onSave: function() {
     *         return jQuery.Deferred().resolve();
     *     },
     *     groupingId: "userActivities",
     *     groupingTabHelpId: "myNewUserActivitiesTab",
     *     groupingTabTitle: "myNewUserActivitiesTabName"
     * };
     * oRenderer.addUserPreferencesGroupedEntry(oEntry);
     * </pre>
     *
     * @param {object} entryObject The data of the new added User Preference entry
     *   Including:
     *   <ul>
     *     <li>{string} entryHelpID (Optional) - The ID of the object.<br>
     *     <li>{string} title - The title of the entry to be presented in the list in the User Preferences dialog box.<br>
     *     We recommend using a string from the translation bundle.<br>
     *     <li>{string}/{Function} value - A string to be presented as the value of the entry<br>
     *     OR a function to be called which returns a {jQuery.Deferred.promise} object.<br>
     *     <li>{Function} content - A function to be called that returns a {jQuery.Deferred.promise} object<br>
     *     which consists of a {sap.ui.core.Control} to be displayed in a follow-on dialog box. A SAPUI5 view instance can also be returned.
     *     The functions is called on each time the user opens the User Preferences dialog box.
     *     <li>{Function} onSave - A function to be called which returns a {jQuery.Deferred.promise}
     *     object when the user clicks Save in the User Preferences dialog box.<br>
     *     If an error occurs, pass the error message via the {jQuery.Deferred.promise} object. Errors are displayed in the log.<br>
     *     <li>{Function} onCancel - A function to be called that closes the User Preferences dialog box without saving any changes. <br>
     *     <li>{boolean} provideEmptyWrapper - Experimental. Set this value to true if you want that your content is displayed without the standard header<br>
     *     <li>{string} groupingId - The ID of the group this entry should be included in <br>
     *     <li>{string} groupingTabTitle - The tab title of the entry, when this entry is grouped. <br>
     *     <li>{string} groupingTabHelpId - The help ID for the grouped tab, when this entry is grouped. <br>
     *   </ul>
     *
     * @returns {object} User Preference Entry.
     *
     * @ui5-restricted sap.fe, sap.esh.search.ui
     * @since 1.110
     * @private
     */
    Renderer.prototype.addUserPreferencesGroupedEntry = function (entryObject) {
        return this.shellCtrl.addUserPreferencesEntry(entryObject, true);
    };

    /**
     * Sets the title in the Fiori Launchpad shell header.
     *
     * @param {string} sTitle The title to be displayed in the Fiori Launchpad shell header
     * @since 1.30
     * @public
     */
    Renderer.prototype.setHeaderTitle = function (sTitle) {
        this.shellCtrl.setHeaderTitle(sTitle);
    };

    /**
     * Sets the visibility of the left pane in the Fiori Launchpad shell, in the given launchpad state @see LaunchpadState
     *
     * @param {string} sLaunchpadState LaunchpadState in which to show/hide the left pane
     * @param {boolean} bVisible specify whether to display the left pane or not
     * @since 1.30
     * @public
     */
    Renderer.prototype.setLeftPaneVisibility = function (sLaunchpadState, bVisible) {
        this.oShellModel.setLeftPaneVisibility(bVisible, false, [sLaunchpadState]);
    };

    /**
     * Sets the ToolArea visibility
     *
     * @param {string} [sLaunchpadState] - LaunchpadState in which to show/hide the ToolArea @see LaunchpadState
     * @param {boolean} [bVisible] - specifies whether to display the ToolArea or not
     * @public
     */
    Renderer.prototype.showToolArea = function (sLaunchpadState, bVisible) {
        this.oShellModel.showShellItem("/toolAreaVisible", sLaunchpadState, bVisible);
    };

    Renderer.prototype.setHeaderHiding = function (bHiding) {
        return this.oShellModel.setHeaderHiding(bHiding);
    };

    /**
     * Set the content of the floating container in the given launchpad states.<br><br>
     *
     * The floating container displays a single UI control of type <code>sap.ui.core.Control</code>.<br>
     * The initial visibility of the floating container  is <code>false</code> and is set using:
     *   @see sap.ushell.renderers.fiori2.Renderer.prototype.setFloatingContainerVisibility<br><br>
     *
     * <b>Example for setting the container's content for the "home" and "app" states:</b>
     * <pre>
     * var oRenderer = sap.ushell.Container.getRenderer("fiori2"),
     *     oButton = new sap.m.Button("Button", {text: "Button"});
     * oRenderer.setFloatingContainerContent(oButton, false, ["home", "app"]);
     * oRenderer.setFloatingContainerVisibility(true);
     * </pre>
     *
     * @param {sap.ui.core.Control} oControl The UI control that is set to be the content of the floating container
     * @param {boolean} bCurrentState If <code>true</code> (and the container's visibility is set to <code>true</code>)
     *   then the given content is displayed by the container in the current shell state.<br>
     *   When the user navigates to a different state (including navigating to a different application) then the content will be removed.<br>
     *   If <code>false</code> then the content is added to the states mentioned in the parameter <code>aStates</code>.<br>
     * @param {string[]} aStates (Valid only if bCurrentState is <code>false</code>)<br>
     *   A list of shell states (i.e. sap.ushell.renderers.fiori2.Renderer.LaunchpadState) in which the given content is shown in
     *   the floating container (if the container's visibility is set to <code>true</code>).<br>
     *   If no launchpad state is provided the content is added in all states.
     *   @see LaunchpadState
     * @private
     */
    Renderer.prototype.setFloatingContainerContent = function (oControl, bCurrentState, aStates) {
        this.shellCtrl.setFloatingContainerContent("floatingContainerContent", [oControl.getId()], bCurrentState, aStates);
    };

    /**
     * Set the current visibility state of the floating container
     *
     * @param {boolean} bVisible The visibility state of the floating container
     * @private
     */
    Renderer.prototype.setFloatingContainerVisibility = function (bVisible) {
        this.shellCtrl.setFloatingContainerVisibility(bVisible);
    };

    /**
     * Get the current docking state of the floating container
     *
     * @returns {boolean} The state : floating or docked
     * @private
     */
    Renderer.prototype.getFloatingContainerState = function () {
        return this.shellCtrl.getFloatingContainerState();
    };

    /**
     * Get the current visibility state of the floating container
     *
     * @returns {boolean} Indicates whether the floating container is visible
     * @private
     */
    Renderer.prototype.getFloatingContainerVisiblity = function () {
        return this.shellCtrl.getFloatingContainerVisibility();
    };

    /**
     * Get the current visibility state of the floating container
     *
     * @returns {boolean} Indicates whether the floating container is visible
     * @private
     */
    Renderer.prototype.getRightFloatingContainerVisibility = function () {
        return this.shellCtrl.getRightFloatingContainerVisibility();
    };

    /**
     * Set the element that will capture the floating container
     *
     * @param {string} sElementToCaptureSelector Element to capture selector.
     * @private
     */
    Renderer.prototype.setFloatingContainerDragSelector = function (sElementToCaptureSelector) {
        this.shellCtrl.setFloatingContainerDragSelector(sElementToCaptureSelector);
    };

    /*---------------States------------------------*/

    /**
     * The launchpad states that can be passed as a parameter.</br>
     *
     * <b>Values:</b>
     *   App - launchpad state when running a Fiori app</br>
     *   Home - launchpad state when the home page is open</br>
     *
     * @since 1.30
     * @public
     */
    Renderer.prototype.LaunchpadState = {
        App: "app",
        Home: "home"
    };

    /*---------------Conditional----------------*/

    Renderer.prototype.createTriggers = function (aTriggers, bCurrentState, aStates) {
        this.oShellModel.createTriggers(aTriggers, bCurrentState, aStates);
    };

    /*---------------Generic--------------------*/

    Renderer.prototype.convertButtonsToActions = function (aIds, bCurrentState, aStates) {
        var oProperties = {};
        var that = this;
        aIds.forEach(function (sId) {
            var oButton = Core.byId(sId);
            oProperties.id = oButton.getId();
            oProperties.text = oButton.getText();
            oProperties.icon = oButton.getIcon();
            oProperties.tooltip = oButton.getTooltip();
            oProperties.enabled = oButton.getEnabled();
            oProperties.visible = oButton.getVisible();
            if (oButton.mEventRegistry && oButton.mEventRegistry.press) {
                oProperties.press = oButton.mEventRegistry.press[0].fFunction;
            }
            oButton.destroy();
            that.addActionButton("sap.ushell.ui.launchpad.ActionItem", oProperties, oProperties.visible, bCurrentState, aStates);
        });
    };

    Renderer.prototype.createItem = function (oControlProperties, bCurrentState, fnCreateItem) {
        // create the object
        var oItem;
        if (oControlProperties && oControlProperties.id) {
            oItem = Core.byId(oControlProperties.id);
        }
        if (!oItem) {
            oItem = fnCreateItem(oControlProperties);
            if (bCurrentState) {
                this.oShellModel.addElementToManagedQueue(oItem);
            }
        }

        return oItem;
    };

    /*------------Custom State Entry------------------------------*/

    Renderer.prototype.addEntryInShellStates = function (sName, entrySuffix, fnAdd, fnRemove, oStateConfiguration) {
        this.oShellModel.addEntryInShellStates(sName, entrySuffix, fnAdd, fnRemove, oStateConfiguration);
    };

    Renderer.prototype.removeCustomItems = function (sStateEntry, aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.removeCustomItems(sStateEntry, [aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.removeCustomItems(sStateEntry, aIds, bCurrentState, aStates);
        }
    };

    Renderer.prototype.addCustomItems = function (sStateEntry, aIds, bCurrentState, aStates) {
        if (typeof aIds === "string") {
            this.oShellModel.addCustomItems(sStateEntry, [aIds], bCurrentState, aStates);
        } else {
            this.oShellModel.addCustomItems(sStateEntry, aIds, bCurrentState, aStates);
        }
    };

    Renderer.prototype.addRightViewPort = function (oView) {
        this.shellCtrl.getViewPortContainer().addRightViewPort(oView, false);
    };

    Renderer.prototype.addLeftViewPort = function (oView) {
        this.shellCtrl.getViewPortContainer().addLeftViewPort(oView, false);
    };

    Renderer.prototype.getShellController = function () {
        return this.shellCtrl;
    };

    Renderer.prototype.getViewPortContainerCurrentState = function () {
        return this.shellCtrl.getViewPortContainer().getCurrentState();
    };

    Renderer.prototype.ViewPortContainerNavTo = function (sName, sTargetName, sAction) {
        return this.shellCtrl.getViewPortContainer().navTo(sName, sTargetName, sAction);
    };

    /**
     * @deprecated since 1.65
     */
    Renderer.prototype.switchViewPortStateByControl = function () { };

    /**
     * @deprecated since 1.65
     */
    Renderer.prototype.ViewPortContainerAttachAfterSwitchStateAnimationFinished = function () { };

    Renderer.prototype.setUserActionsMenuSelected = function (bSelected) {
        this.shellCtrl.setUserActionsMenuSelected(bSelected);
    };

    Renderer.prototype.getUserActionsMenuSelected = function () {
        return this.shellCtrl.getUserActionsMenuSelected();
    };

    Renderer.prototype.setNotificationsSelected = function (bSelected) {
        this.shellCtrl.setNotificationsSelected(bSelected);
    };

    Renderer.prototype.getNotificationsSelected = function () {
        return this.shellCtrl.getNotificationsSelected();
    };

    Renderer.prototype.addShellDanglingControl = function (oControl) {
        this.shellCtrl.getView().addDanglingControl(oControl);
    };

    Renderer.prototype.getShellConfig = function () {
        return (this.shellCtrl.getView().getViewData() ? this.shellCtrl.getView().getViewData().config || {} : {});
    };

    Renderer.prototype.getEndUserFeedbackConfiguration = function () {
        return {}; // Deprecated
    };

    Renderer.prototype.reorderUserPrefEntries = function (entries) {
        return this.shellCtrl._reorderUserPrefEntries(entries);
    };

    Renderer.prototype.addUserProfilingEntry = function (entryObject) {
        this.shellCtrl.addUserProfilingEntry(entryObject);
    };

    Renderer.prototype.logRecentActivity = function (oRecentEntry) {
        if (!oRecentEntry.appType) {
            oRecentEntry.appType = AppType.APP;
        }
        if (!oRecentEntry.appId) {
            oRecentEntry.appId = oRecentEntry.url;
        }
        return this.shellCtrl._logRecentActivity(oRecentEntry);
    };

    Renderer.prototype.setCurrentCoreView = function (sCoreView) {
        this.currentCoreView = sCoreView;
    };

    Renderer.prototype.getCurrentCoreView = function () {
        return this.currentCoreView;
    };

    /**
     * Calls the provider with an object providing the tile information
     * @example of a tile actions provider callback:
     * <pre>
     *     function fnProvider (oTileObject){
     *       // oTileObject properties:
     *       // controlId: The id of the actual control in the dom
     *       // tileId: the id of the tile
     *       // stableId: the id of the catalogTile (or tile as fallback)
     *       // control: the actual tile control
     *       // domRef: the dom node of the tile
     *
     *       return [
     *         {
     *           text: "Some Action",
     *           icon: "sap-icon://action",
     *           targetURL: "#SemanticObject-Action"
     *         },
     *         {
     *           text: "Settings",
     *           icon: "sap-icon://action-settings",
     *           press: function () {
     *             //Open settings UI
     *           }
     *         }
     *       ];
     *     }
     * </pre>
     * @param {function} fnProvider A function returning an array
     * @returns {Promise<void>} Resolves once the provider was registered
     *
     * @private
     */
    Renderer.prototype.registerTileActionsProvider = function (fnProvider) {
        if (!Config.last("/core/spaces/enabled")) {
            return Promise.reject("registerTileActionsProvider is only supported with spaces enabled");
        }
        if (!this._aTileActionProviders) {
            this._aTileActionProviders = [];
        }
        this._aTileActionProviders.push(fnProvider);
        return Promise.resolve();
    };

    /**
     * Collects the custom TileActions
     * @param {object} oTile A VizInstance
     * @returns {Promise<object[]>} Resolves a list of TileActions
     *
     * @private
     */
    Renderer.prototype.getCustomTileActions = function (oTile) {
        if (!Config.last("/core/spaces/enabled")) {
            return Promise.reject("getCustomTileActions is only supported with spaces enabled");
        }

        var oTileObject = {
            controlId: oTile.getId(),
            tileId: oTile.getVizRefId(),
            stableId: oTile.getDataHelpId() || oTile.getVizRefId(),
            control: oTile,
            domRef: oTile.getDomRef()
        };

        var aTileActions = [];
        this._aTileActionProviders.forEach(function (fnProvider) {
            var aNewTileActions = fnProvider(oTileObject) || [];
            aTileActions.push.apply(aTileActions, aNewTileActions);
        });
        return Promise.resolve(aTileActions);
    };

    /**
     * Helper function that determines if a given intent is a built-in intent
     * (as listed in the metadata's routes).
     * It returns true if it can match the intent, false otherwise.
     * On its first call, a copy of all of those path is created and stored.
     *
     * @param {object} oParsedHash A resolved hash as returned by URLParing
     * @returns {boolean} True if the intent is built in, false otherwise
     * @private
     * @since 1.85.0
     */
    Renderer.prototype._isBuiltInIntent = function (oParsedHash) {
        if (!Renderer._aBuiltInRoutes) {
            var aRoutes = Renderer.getMetadata().getRoutes();
            Renderer._aBuiltInRoutes = aRoutes.reduce(function (aConcatenatedRoutes, oCurrentRoutes) {
                return aConcatenatedRoutes.concat(oCurrentRoutes.pattern);
            }, []);
        }

        if (!oParsedHash || !oParsedHash.semanticObject || !oParsedHash.action) {
            return false;
        }

        var sIntent = oParsedHash.semanticObject + "-" + oParsedHash.action;

        return Renderer._aBuiltInRoutes.indexOf(sIntent) !== -1;
    };

    /**
     * Adding an empty area between the shell and the Iframe.
     * This method is relevant only for the AppRuntime and not
     * for the shell rendering.
     *
     * @private
     * @since 1.100.0
     */
    this.addTopHeaderPlaceHolder = function () {
    };

    /**
     * Removing the empty area between the shell and the Iframe.
     * This method is relevant only for the AppRuntime and not
     * for the shell rendering.
     *
     * @private
     * @since 1.100.0
     */
    this.removeTopHeaderPlaceHolder = function () {
    };

    Renderer.prototype.updateHeaderItem = function (sId, oControlProperties) {
        var oItem = Core.byId(sId);

        if (oItem && oControlProperties) {
            if (oControlProperties.hasOwnProperty("floatingNumber")) {
                oItem.setFloatingNumber(oControlProperties.floatingNumber);
            }
        }
    };

    /**
     * Destroy the button/s controls created by the renderer
     * This method is relevant only for the AppRuntime and not
     * for the shell rendering.
     *
     * @private
     * @since 1.108.0
     */
    Renderer.prototype.destroyButton = function (aIds) {
        if (!aIds) {
            return;
        }
        aIds = typeof aIds === "string" ? [aIds] : aIds;
        aIds.forEach(function (sId) {
            var oButton = Core.byId(sId);
            if (oButton) {
                oButton.destroy();
            }
        });
    };

    return Renderer;
}, true);
