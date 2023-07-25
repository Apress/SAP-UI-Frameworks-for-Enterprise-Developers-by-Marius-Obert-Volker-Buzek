// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's PluginManager service, which allows you to handle the loading of Fiori Launchpad plugins.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/applicationIntegration/application/PostMessageAPIInterface",
    "sap/ushell/services/_PluginManager/Extensions",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils"
], function (
    Log,
    jQuery,
    PostMessageAPIInterface,
    fnGetExtensions,
    UI5ComponentType,
    utils
) {
    "use strict";

    var S_COMPONENT_NAME = "sap.ushell.services.PluginManager";
    var S_PLUGIN_TYPE_PARAMETER = "sap-ushell-plugin-type";
    var S_DEFAULT_PLUGIN_CATEGORY = "RendererExtensions";
    var S_FLP_AREAS_PLUGIN_COMPONENT = "sap.ushell.components.shell.defaults"; // contains Me Area and Notifications Area
    var aSupportedPluginCategories = [
        S_DEFAULT_PLUGIN_CATEGORY,
        "UserDefaults",
        "UserImage",
        "AppWarmup"
    ];

    /**
     * The unified shell's PluginManager service, which allows you to handle the loading of Fiori Launchpad plugins.
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the PluginManager service.
     *
     * @class
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.38
     * @private
     */
    function PluginManager (oContainerInterface, sParameter, oServiceProperties) {
        var that = this;

        this._oPluginCollection = {};
        this._oCategoryLoadingProgress = {};
        // map to avoid multiple loading of the same plugin (only multiple instantiation is possible)
        this._mInitializedComponentPromise = {};
        this._sPluginAgentsNames = "";
        this._oConfig = (oServiceProperties && oServiceProperties.config) || {};
        if (this._oConfig.isBlueBox === undefined) {
            this._oConfig.isBlueBox = false;
        }

        // initialize plugin collection
        aSupportedPluginCategories.forEach(function (sPluginCategory) {
            that._oPluginCollection[sPluginCategory] = {};
            that._oCategoryLoadingProgress[sPluginCategory] = new jQuery.Deferred();
        });

        /**
         * Instantiates a UI5 component and makes sure the passed parameters are aligned with the asynchronous plugin use case.
         *
         * @param {string} sCategory Plugin category the plugin is belonging to.
         * @param {object} sPluginName Plugin itself.
         * @param {jQuery.Deferred} oPluginDeferred A deferred object that gets resolved when the respective component has been
         *   instantiated successfully, and rejected when the instantiation has been failing.
         * @param {object} oPostMessageInterface The application postMessage interface.
         * @since 1.38
         * @private
         */
        this._handlePluginCreation = function (sCategory, sPluginName, oPluginDeferred, oPostMessageInterface) {
            var that = this,
                oPlugin = (that._oPluginCollection[sCategory])[sPluginName];
                utils.setPerformanceMark("FLP -- PluginManager.loadPlugin[" + sCategory + "][" + sPluginName + "]");
            try {
                if (oPlugin.hasOwnProperty("component")) {
                    // only add handler to promise in case that the component has already been loaded
                    if (that._mInitializedComponentPromise.hasOwnProperty(oPlugin.component)) {
                        that._mInitializedComponentPromise[oPlugin.component].then(
                            function () {
                                that._instantiateComponent(oPlugin, oPluginDeferred, oPostMessageInterface);
                            },
                            function () { // note, no error logging here
                                that._instantiateComponent(oPlugin, oPluginDeferred, oPostMessageInterface);
                            }
                        );
                    } else {
                        that._mInitializedComponentPromise[oPlugin.component] = that._instantiateComponent(oPlugin, oPluginDeferred, oPostMessageInterface);
                    }
                } else {
                    Log.error("Invalid plugin configuration. The plugin " + sPluginName
                        + " must contain a <component> key", S_COMPONENT_NAME);
                }
            } catch (oError) {
                Log.error("Error while loading bootstrap plugin: " + oPlugin.component || "", S_COMPONENT_NAME);

                // make sure to reject promise in case of user default plug-in
                if (oPluginDeferred) {
                    oPluginDeferred.reject(oError);
                }
            }
        };

        /**
         * Filename to be requested in XHR Auth scenario.
         * Encapsulated in case it must be overwritten or modified.
         *
         * @returns {string} returns "Component-preload.js"
         * @private
         */
        this._getFileNameForXhrAuth = function () {
            return "Component-preload.js";
        };

        /**
         * Triggers an XHR request for authentication if the plugin configuration has the property
         * &quot;sap-ushell-xhr-authentication&quot; set to &quot;true&quot; or &quot;X&quot;.
         * <p>
         * This is needed for integrating plug-ins which restrict access to their code to authenticated users
         * (copilot for instance), as UI5 will add the plugin's scripts via script tag, which is not covered by the FLP XHR interception.
         * <p>
         * Note: Component-preload.js is required; If not available the Plugin will fail loading with
         * XHR authentication (without there is the UI5 fallback to Component.js).
         *
         * @param {object} [oApplicationConfiguration] The application configuration (might be null or undefined)
         * @param {string} sComponentUrl The URL for loading the component
         * @returns {jQuery.Deferred} A jQuery promise which is resolved after the XHR request is done in case of XHR authentication
         *   or resolved immediately, if not active
         * @since 1.46.3
         * @private
         */
        this._handleXhrAuthentication = function (oApplicationConfiguration, sComponentUrl) {
            var iXhrLogonTimeout;

            if (oApplicationConfiguration &&
                ["true", true, "X"].indexOf(oApplicationConfiguration["sap-ushell-xhr-authentication"]) > -1) {

                if (!sComponentUrl) {
                    Log.error(
                        [
                            "Illegal state: configuration parameter 'sap-ushell-xhr-authentication-timeout' set, but no component URL specified.",
                            "XHR authentication request will not be sent. Please check the target mapping definitions for plug-ins",
                            "and the application index."
                        ].join(" "),
                        undefined,
                        S_COMPONENT_NAME
                    );

                    // we still resolve the promise directly
                    return jQuery.when();
                }
                if (oApplicationConfiguration.hasOwnProperty("sap-ushell-xhr-authentication-timeout")) {
                    // configuration parameters could be strings
                    iXhrLogonTimeout = parseInt(oApplicationConfiguration["sap-ushell-xhr-authentication-timeout"], 10);
                    if (isNaN(iXhrLogonTimeout)) {
                        Log.error(
                            [
                                "Invalid value for configuration parameter 'sap-ushell-xhr-authentication-timeout' for plug-in component with URL '",
                                sComponentUrl,
                                "': '",
                                oApplicationConfiguration["sap-ushell-xhr-authentication-timeout"],
                                "' is not a number. Timeout will be ignored."
                            ].join(""),
                            undefined,
                            S_COMPONENT_NAME
                        );
                    } else {
                        sap.ushell.Container.setXhrLogonTimeout(sComponentUrl, iXhrLogonTimeout);
                    }
                }
                return jQuery.ajax(sComponentUrl + "/" + this._getFileNameForXhrAuth(), { dataType: "text" });
            }
            // just resolve the promise directly if no xhr-authentication required
            return jQuery.when();
        };

        /**
         * Instantiates a UI5 component and makes sure the passed parameters are aligned with the asynchronous plugin use case.
         *
         * @param {object} oPlugin The plugin itself.
         * @param {jQuery.Deferred} oPluginDeferred A deferred object that mimics the internally used ECMA6 promise.
         * @param {object} oPostMessageInterface The application postMessage interface.
         * @returns {jQuery.Promise} A jQuery Promise that is resolved once the component is loaded.
         * @since 1.38
         * @private
         */
        this._instantiateComponent = function (oPlugin, oPluginDeferred, oPostMessageInterface) {
            var oDeferred = new jQuery.Deferred(),
                oComponentOptions = JSON.parse(JSON.stringify(oPlugin)),
                oApplicationProperties = {
                    ui5ComponentName: oComponentOptions.component,
                    url: oComponentOptions.url,
                    getExtensions: fnGetExtensions.bind(null, oPlugin.component)
                };

            function makeRejectHandler (sErrorLogMessage) {
                return function (oError) {
                    sErrorLogMessage = sErrorLogMessage ||
                        "Cannot create UI5 plugin component: (componentId/appdescrId :" + oApplicationProperties.ui5ComponentName + ")\n"
                        + oError + " properties " + JSON.stringify(oApplicationProperties)
                        + "\n This indicates a plugin misconfiguration, see e.g. Note 2316443.";

                    // errors always logged per component
                    oError = oError || "";
                    Log.error(sErrorLogMessage,
                        oError.stack, // stacktrace not only available for all browsers
                        S_COMPONENT_NAME);
                    if (oPluginDeferred) {
                        oPluginDeferred.reject.apply(this, arguments);
                    }
                    oDeferred.reject.apply(this, arguments);
                };
            }

            // fix component name according to UI5 API
            oComponentOptions.name = oComponentOptions.component;
            delete oComponentOptions.component;

            // UI5 component loader expects application properties as returned by NavTargetResolution service
            // component options are passed in applicationDependencies property
            oApplicationProperties.applicationDependencies = oComponentOptions;

            // plug-in config has to be moved to applicationConfiguration property
            if (oComponentOptions.config) {
                oApplicationProperties.applicationConfiguration = oComponentOptions.config;
                delete oComponentOptions.config;
            }

            // disable loading of default dependencies for plugins (only used for old apps w/o manifest)
            oApplicationProperties.loadDefaultDependencies = false;

            //set injected interface if needed
            if (oPostMessageInterface !== undefined) {
                oApplicationProperties.oPostMessageInterface = oPostMessageInterface;
            }

            sap.ushell.Container.getServiceAsync("Ui5ComponentLoader")
                .then(function (UI5ComponentLoaderService) {
                    this._handleXhrAuthentication(oApplicationProperties.applicationConfiguration, oComponentOptions.url)
                        .done(function () {
                            UI5ComponentLoaderService
                                .createComponent(
                                    oApplicationProperties,
                                    {},
                                    [],
                                    UI5ComponentType.Plugin
                                )
                                .done(function (oLoadedComponent) {
                                    if (oPluginDeferred) {
                                        oPluginDeferred.resolve(oLoadedComponent);
                                    }
                                    oDeferred.resolve.apply(this, arguments);
                                })
                                .fail(makeRejectHandler());
                        })
                        .fail(makeRejectHandler("XHR logon for FLP plugin failed"));
                }.bind(this))
                .catch(makeRejectHandler());

            return oDeferred.promise();
        };

        /**
         * Returns an array of supported plugin categories which could be managed by the PluginManager.
         *
         * @returns {array} Supported plugins which could be managed by the PluginManager.
         * @since 1.38
         * @private
         */
        this.getSupportedPluginCategories = function () {
            return JSON.parse(JSON.stringify(aSupportedPluginCategories));
        };

        /**
         * Returns a map of all the plugins which are registered with the PluginManager sorted by supported plugin categories.
         *
         * <pre>
         * {
         *   "PluginCategoryA": [oPluginX, oPluginY, oPluginZ],
         *   "PluginCategoryB": [oPluginG]
         * }
         * </pre>
         *
         * @returns {object} Map of registered plugins
         * @since 1.38
         * @private
         */
        this.getRegisteredPlugins = function () {
            return JSON.parse(JSON.stringify(this._oPluginCollection));
        };

        /**
         * Initializes the PluginManager with a certain set of plugins.
         * It's task is to insert those plugins systematically into a plugin collection handled by
         * the PluginManager to be able to manage them in a later point in time.
         *
         * @param {object} oPlugins Set of plugins.
         * @since 1.38
         * @private
         */
        this.registerPlugins = function (oPlugins) {
            var that = this,
                oCurrentPlugin,
                oPluginConfig,
                sPluginCategory,
                aPluginCategoriesToLoad = [],
                sSapAgentsIds,
                sSapAgentId;

            if (!oPlugins) {
                return;
            }

            //in a blue box scenario, get the names of sap plugins loaded in the yellow box
            //that has agents in the blue box
            if (this._oConfig.isBlueBox === true) {
                sSapAgentsIds = new URLSearchParams(window.location.search).get("sap-plugins");
                if (sSapAgentsIds && sSapAgentsIds.length > 0) {
                    sSapAgentsIds = "," + sSapAgentsIds + ",";
                } else {
                    sSapAgentsIds = undefined;
                }
            }

            // insert plugins from plugin configuration into plugin collection which is sorted by category
            Object.keys(oPlugins).sort().forEach(function (sPluginName) {
                oCurrentPlugin = oPlugins[sPluginName] || {};
                oPluginConfig = oCurrentPlugin.config || {};
                sPluginCategory = oPluginConfig[S_PLUGIN_TYPE_PARAMETER] || "";

                // Prevent the loading of the plugin in case it specifies the 'enabled' property with false as part of its definition
                if (oCurrentPlugin.enabled === false) {
                    return;
                }

                // Prevent the loading of the plugins based on the form factor
                if (!that._isFormFactorSupported(oCurrentPlugin)) {
                    Log.info("Plugin '" + sPluginName + "' filtered from result: form factor not supported");
                    return;
                }

                //in a blue box scenario, check if a plugins marked as sap plugin
                //should be loaded. It should not be loaded in case its parent
                //plugin was not loaded in tht yellow box
                if (that._oConfig.isBlueBox === true) {
                    if (oCurrentPlugin.config && oCurrentPlugin.config["sap-plugin-agent"] === true) {
                        sSapAgentId = (oCurrentPlugin.config["sap-plugin-agent-id"] || sPluginName);

                        if (sSapAgentsIds) {
                            // check not a startup plugin and not in url
                            if (sSapAgentsIds.indexOf("," + sSapAgentId + ",") < 0) {
                                return;
                            }
                        } else {
                            return;
                        }
                    }
                }

                if (oCurrentPlugin.enabled === undefined) {
                    oCurrentPlugin.enabled = true;
                }

                // module mechanism (modules should be required immediately)
                if (oCurrentPlugin.hasOwnProperty("module")) {
                    var sModulePath = (oCurrentPlugin.module || "").replace(/\./g, "/");
                    Log.error("Plugin " + sPluginName
                        + " cannot get registered, because the module mechanism for plugins is not valid anymore. Plugins need to be defined as SAPUI5 components.",
                        S_COMPONENT_NAME);
                    try {
                        sap.ui.requireSync(sModulePath);
                    } catch (e) {
                        Log.error("Plugin module " + sModulePath + " is not found.");
                    }
                    return;
                }

                if (oPluginConfig && oPluginConfig.hasOwnProperty(S_PLUGIN_TYPE_PARAMETER)) {
                    if (aSupportedPluginCategories && Array.prototype.indexOf.call(aSupportedPluginCategories, sPluginCategory) !== -1) {
                        if (aPluginCategoriesToLoad.indexOf(sPluginCategory) === -1) {
                            aPluginCategoriesToLoad.push(sPluginCategory);
                        }
                        that._oPluginCollection[sPluginCategory][sPluginName] = JSON.parse(JSON.stringify(oCurrentPlugin));
                    } else {
                        // plugin type is not supported
                        Log.warning("Plugin " + sPluginName
                            + " will not be inserted into the plugin collection of the PluginManager, because of unsupported category "
                            + sPluginCategory,
                            S_COMPONENT_NAME);
                    }
                } else {
                    // use default plugin category
                    that._oPluginCollection[S_DEFAULT_PLUGIN_CATEGORY][sPluginName] = JSON.parse(JSON.stringify(oCurrentPlugin));
                    if (aPluginCategoriesToLoad.indexOf(S_DEFAULT_PLUGIN_CATEGORY) === -1) {
                        aPluginCategoriesToLoad.push(S_DEFAULT_PLUGIN_CATEGORY);
                    }
                }
            });

            //build the list of names of plugins that has agents (for cFLP)
            try {
                if (that._oConfig.isBlueBox !== true) {
                    that._buildNamesOfPluginsWithAgents();
                }
            } catch (e) {
                Log.error("failed to build plugin agents names list",
                    (e.message || e.toString()),
                    "sap.ushell.services.PluginManager");
            }

            aPluginCategoriesToLoad.forEach(function (sCategory) {
                if (that._oCategoryLoadingProgress.hasOwnProperty(sCategory) && that._oCategoryLoadingProgress[sCategory].state() === "resolved") {
                    that.loadPlugins(sCategory);
                }
            });
        };

        /**
         * Check if plugin supports the user device type.
         *
         * @param {object} oPlugin Configured plugin data.
         * @returns {boolean} Return false only if deviceTypes set explicitly to false for special type.
         *                    Return true, if deviceTypes is not set.
         * @since 1.76
         * @private
         */
        this._isFormFactorSupported = function (oPlugin) {
            var oDeviceTypesSupport = oPlugin.deviceTypes,
                sCurrentFormFactor = utils.getFormFactor();

            if (oDeviceTypesSupport && oDeviceTypesSupport[sCurrentFormFactor] === false) {
                return false;
            }
            return true;
        };

        /**
         * Returns the promise object for a given plugin category.
         *
         * @param {string} sPluginCategory Plugin category
         * @returns {jQuery.Deferred.promise} A promise which resolves when the respective plugin category finished loading.
         *   The promise rejects if the respective plugin category could not be loaded due to errors.
         * @since 1.38
         * @private
         */
        this.getPluginLoadingPromise = function (sPluginCategory) {
            if (this._oCategoryLoadingProgress.hasOwnProperty(sPluginCategory)) {
                return this._oCategoryLoadingProgress[sPluginCategory].promise();
            }
        };

        /**
         * Triggers the loading of a certain plugin category.
         * Possible and supported plugin categories are <code>RendererExtensions</code> and <code>UserDefaults</code> and <code>ContentProvider</code>.
         *
         * @param {string} sPluginCategory Category of plugins which should be loaded.
         * @returns {jQuery.Deferred} A <code>jQuery.promise</code> to be resolved when all plugins of the respective category are loaded completely.
         *   The promise will be rejected if the passed category is not supported by the PluginManager or one of the plugins could not be loaded.
         * @since 1.38
         * @private
         */
        this.loadPlugins = function (sPluginCategory) {
            var that = this,
                aPluginPromises,
                oPluginDeferred,
                aPluginIds,
                oPostMessageInterface;

            utils.setPerformanceMark("FLP -- PluginManager.startLoadPlugins[" + sPluginCategory + "]");

            //plugins are now getting interface to define custom post
            //message api
            if (sPluginCategory === S_DEFAULT_PLUGIN_CATEGORY) {
                oPostMessageInterface = PostMessageAPIInterface.getInterface();
            }
            // check category for supportability
            if (aSupportedPluginCategories && Array.prototype.indexOf.call(aSupportedPluginCategories, sPluginCategory) !== -1) {
                // check whether plugins for this certain category are already loaded or are currently loading
                if (that._oCategoryLoadingProgress[sPluginCategory].pluginLoadingTriggered === undefined) {
                    that._oCategoryLoadingProgress[sPluginCategory].pluginLoadingTriggered = true;
                }
                // check whether plugins are existing in the respective category
                if (Object.keys(that._oPluginCollection[sPluginCategory]).length > 0) {
                    aPluginPromises = [];
                    aPluginIds = Object.keys(that._oPluginCollection[sPluginCategory]);

                    if (
                        new URLSearchParams(window.location.search).get("sap-ushell-xx-pluginmode") === "discard"
                        && (sPluginCategory === "RendererExtensions" || sPluginCategory === "AppWarmup")
                    ) {
                        // instrumentation to not load any extension plugin for performance testing
                        aPluginIds = aPluginIds.filter(function (sId) {
                            // skip all plugins apart from the one containing Me Area and Notifications Area
                            return (that._oPluginCollection[sPluginCategory][sId].component === S_FLP_AREAS_PLUGIN_COMPONENT);
                        });
                    }

                    // loop over plugins in respective plugin category which should be loaded
                    aPluginIds.forEach(function (sPluginName) {
                        var oPlugin = that._oPluginCollection[sPluginCategory][sPluginName];
                        if (!oPlugin.loaded) {
                            oPlugin.loaded = true;
                            oPluginDeferred = new jQuery.Deferred();
                            aPluginPromises.push(oPluginDeferred.promise());
                            that._handlePluginCreation(sPluginCategory, sPluginName, oPluginDeferred, oPostMessageInterface);
                        }
                    });

                    if (aPluginPromises.length > 0) {
                        jQuery.when.apply(undefined, aPluginPromises)
                            .done(function () {
                                utils.setPerformanceMark("FLP -- PluginManager.endLoadPlugins[" + sPluginCategory + "]");
                                that._oCategoryLoadingProgress[sPluginCategory].resolve();
                            })
                            .fail(that._oCategoryLoadingProgress[sPluginCategory].reject.bind());
                    }
                } else {
                    // there are no plugins to be loaded
                    that._oCategoryLoadingProgress[sPluginCategory].resolve();
                }
            } else {
                // plugin category is not supported
                Log.error("Plugins with category " + sPluginCategory + " cannot be loaded by the PluginManager", S_COMPONENT_NAME);
                that._oCategoryLoadingProgress[sPluginCategory].reject("Plugins with category " + sPluginCategory + " cannot be loaded by the PluginManager");
            }

            return that._oCategoryLoadingProgress[sPluginCategory].promise();
        };

        /**
         * For cFLP scenario, build list of names of plugins that has agents running
         * inside the blue box (=iframe). The list is then used in order to know
         * which agent should be instantiated in the blue box.
         *
         * @since 1.76
         * @private
         */
        this._buildNamesOfPluginsWithAgents = function () {
            var that = this,
                sNames = "",
                oPlugin;

            Object.keys(that._oPluginCollection).forEach(function (sCategory) {
                Object.keys(that._oPluginCollection[sCategory]).forEach(function (sPlugin) {
                    oPlugin = that._oPluginCollection[sCategory][sPlugin];
                    if (oPlugin && oPlugin.enabled && oPlugin.enabled === true) {
                        if (oPlugin.config && oPlugin.config["sap-plugin-agent"] === true) {
                            sNames += (oPlugin.config["sap-plugin-agent-id"] || sPlugin) + ",";
                        }
                    }
                });
            });

            if (sNames.endsWith(",")) {
                sNames = sNames.slice(0, -1);
            }

            this._sPluginAgentsNames = sNames;
        };

        /**
         * For cFLP scenario, returns the names of plugins with agents

         * @returns {string} names of plugins with coma separation
         * @since 1.76
         * @private
         */
        this._getNamesOfPluginsWithAgents = function () {
            return this._sPluginAgentsNames;
        };
    }

    PluginManager.hasNoAdapter = true;
    return PluginManager;
}, true /* bExport */);
