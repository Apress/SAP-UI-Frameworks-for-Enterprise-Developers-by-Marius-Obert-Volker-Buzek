// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's UI5 component loader service.
 * This is a shell-internal service and no public or application facing API!
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/ushell/services/Ui5ComponentHandle",
    "sap/ushell/services/_Ui5ComponentLoader/utils",
    "sap/ushell/EventHub",
    "sap/ui/thirdparty/jquery"
], function (Config, oUshellUtils, Ui5ComponentHandle, oUtils, oEventHub, jQuery) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only,
     * others MUST call <code>sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (Ui5ComponentLoader) {});</code>.
     * Constructs a new instance of the UI5 Component Loader service.
     *
     * The Unified Shell's UI5 Component Loader service
     *
     * Note: This loader adds some hardcoded libraries (scaffolding) for the standard fiori packaging.
     * This can be turned off explicitly by setting the <code>loadDefaultDependencies</code>
     * property to <code>false</code> in the service configuration:
     *   <pre>
     *   window["sap-ushell-config"] = {
     *     services : {
     *       "Ui5ComponentLoader": {
     *         config : {
     *           loadDefaultDependencies : false
     *           }
     *         }
     *       }
     *     }
     *   }
     *   </pre>
     *
     * The service also adds the complement of the core resources as dependencies when custom preload bundles are configured.
     * This configuration has been moved to the global ushell configuration path &quot;ushell/customPreload&quot;
     *
     * @param {object} oAdapter The adapter, allows to modify component properties of the ui5 loader
     * @param {object} oContainerInterface the interface provided by the container
     * @param {*} sParameter Not used
     * @param {*} oConfig Used to configure the loader with properties loadDefaultDependencies
     * @private
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.38.0
    */

    function Ui5ComponentLoader (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._oServiceConfig = (oConfig && oConfig.config) || {};
        this._oAdapter = oAdapter;

        /**
         * Logger adding a trace an propagates the eror
         * @param {Object} oComponentProperties The component properties
         * @param {Object} vError The error to be logged
         * @returns {Promise} Promise that resolves with vError
        */
        this._logStackTrace = function (oComponentProperties, vError) {
            var sComponentProperties = JSON.stringify(oComponentProperties, null, 4);

            oUtils.logInstantiateComponentError(
                oComponentProperties.name,
                vError + "",
                vError.status,
                vError.stack,
                sComponentProperties
            );
            return Promise.reject(vError);
        };

        /**
         * Modifies the component properties.
         * It is the wrapper for the adapter, that may implement this method or not
         * @param {object} oData The oData with component properties as a member
         * @param {string} sUI5ComponentType Type used to define the type of loading a ui5component by FLP
         * @return {Promise} oPromise The promise that resolves with the modified oData
         */
        this.modifyComponentProperties = function (oData, sUI5ComponentType) {
            if (!this._oAdapter.modifyComponentProperties) {
                return Promise.resolve(oData);
            }
            return this._oAdapter.modifyComponentProperties(oData.componentProperties, sUI5ComponentType)
                .then(function (oComponentProperties) {
                    oData.componentProperties = oComponentProperties;
                    return oData;
                });
        };

        /**
         * Loads and creates the UI5 component from the specified application properties object
         * (the result of a navigation target resolution).
         *
         * @param {object} oAppProperties Application properties as typically produced by resolveHashFragment,
         *   note that some members of componentData are propagated, this is used in the myinbox scenario,
         *   see (CrossApplicationNavigation.createComponentInstance)
         * @param {object} oParsedShellHash The shell hash of the application that is to be opened already parsed via
         *   <code>sap.ushell.services.URLParsing#parseShellHash</code><code>sap.ushell.services.URLParsing#parseShellHash</code>.
         * @param {array} aWaitForBeforeInstantiation An array of promises which delays the instantiation of
         *   the Component class until those Promises are resolved.
         * @param {string} sUI5ComponentType Type used to define the type of loading a ui5component by FLP
         *   as defined ushellLibrary
         * @return {jQuery.Deferred.promise} a jQuery promise which resolves with the application properties object which is enriched
         *   with an <code>componentHandle<code> object that encapsulates the loaded component.
         *   If the UI5 core resources have been loaded completely as a result of this call
         *   (either customPreload is disabled or the core-ext-light.js module is loaded as part of this call or was already loaded),
         *   the result object also gets a flag <code>coreResourcesFullyLoaded</code> which is true.
         * @private
         */
        this.createComponent = function (oAppProperties, oParsedShellHash, aWaitForBeforeInstantiation, sUI5ComponentType) {
            var oDeferred = new jQuery.Deferred(),
                that = this;


            this.createComponentData(oAppProperties, oParsedShellHash, aWaitForBeforeInstantiation)
                .then(function (oComponentData) {
                    return that.modifyComponentProperties(oComponentData, sUI5ComponentType);
                })
                .then(function (oData) {
                        that.instantiateComponent(oData).then(oDeferred.resolve, oDeferred.reject);
                    },
                    function () {
                        oDeferred.resolve(oAppProperties);
                    }
                );
            return oDeferred.promise();
        };
        /**
         * Loads the UI5 component from the specified application properties object
         * (the result of a navigation target resolution).
         *
         * @param {object} oAppProperties Application properties as typically produced by resolveHashFragment,
         *   note that some members of componentData are propagated, this is used in the myinbox scenario,
         *   see (CrossApplicationNavigation.createComponentInstance)
         * @param {object} oParsedShellHash The shell hash of the application that is to be opened already parsed via
         *   <code>sap.ushell.services.URLParsing#parseShellHash</code><code>sap.ushell.services.URLParsing#parseShellHash</code>.
         * @param {array} aWaitForBeforeInstantiation An array of promises which delays the instantiation of
         *   the Component class until those Promises are resolved.
         * @returns {object} promise (component data)
         * @private
         */
        this.createComponentData = function (oAppProperties, oParsedShellHash, aWaitForBeforeInstantiation) {
            var that = this;
            return new Promise(function (fnResolve, fnReject) {
                var oData = {};
                var oAppPropertiesSafe = oAppProperties || {};
                var bLoadCoreExt = oUtils.shouldLoadCoreExt(oAppPropertiesSafe);
                var bCustomPreloadEnabled = Config.last("/core/customPreload/enabled");
                var bAddCoreExtPreloadBundle = bLoadCoreExt && bCustomPreloadEnabled;
                var bLoadDefaultDependencies = oUtils.shouldLoadDefaultDependencies(oAppPropertiesSafe, that._oServiceConfig);
                var bNoCachebusterTokens = oUshellUtils.getParameterValueBoolean("sap-ushell-nocb");
                var oApplicationDependencies = oAppPropertiesSafe.applicationDependencies || {};
                var sComponentId = oUtils.constructAppComponentId(oParsedShellHash || {});
                var aCoreResourcesComplement = Config.last("/core/customPreload/coreResourcesComplement");
                var oComponentData;
                var oComponentProperties;

                oUtils.logAnyApplicationDependenciesMessages(
                    oApplicationDependencies.name,
                    oApplicationDependencies.messages
                );

                if (!oAppPropertiesSafe.ui5ComponentName) {
                    fnReject();
                    return;
                }
                // Avoid warnings in ApplicationContainer.
                // TODO: can be removed when ApplicationContainer construction is changed.
                delete oAppPropertiesSafe.loadCoreExt;
                delete oAppPropertiesSafe.loadDefaultDependencies;

                oComponentData = oUtils.createComponentData(
                    oAppPropertiesSafe.componentData || {},
                    oAppPropertiesSafe.url,
                    oAppPropertiesSafe.applicationConfiguration,
                    oAppPropertiesSafe.reservedParameters
                );

                if (oAppPropertiesSafe.getExtensions) {
                    oComponentData.getExtensions = oAppPropertiesSafe.getExtensions;
                    delete oAppPropertiesSafe.getExtensions;
                }
                if (oAppPropertiesSafe.oPostMessageInterface) {
                    oComponentData.oPostMessageInterface = oAppPropertiesSafe.oPostMessageInterface;
                    delete oAppPropertiesSafe.oPostMessageInterface;
                }

                oComponentProperties = oUtils.createComponentProperties(
                    bAddCoreExtPreloadBundle,
                    bLoadDefaultDependencies,
                    bNoCachebusterTokens,
                    aWaitForBeforeInstantiation,
                    oAppPropertiesSafe.applicationDependencies || {},
                    oAppPropertiesSafe.ui5ComponentName,
                    oAppPropertiesSafe.url,
                    sComponentId,
                    aCoreResourcesComplement
                );

                oData.componentData = oComponentData;
                oData.componentProperties = oComponentProperties;
                oData.appPropertiesSafe = oAppPropertiesSafe;
                oData.loadCoreExt = bLoadCoreExt;

                fnResolve(oData);
            });
        };
        /**
         * Creates the UI5 component from the specified application properties object
         * (the result of a navigation target resolution).
         *
         * @param {object} oData Contains all application & component properties and data
         * @return {jQuery.Deferred.promise} a jQuery promise which resolves with the application properties object which is enriched
         *   with an <code>componentHandle<code> object that encapsulates the loaded component.
         *   If the UI5 core resources have been loaded completely as a result of this call
         *   (either customPreload is disabled or the core-ext-light.js module is loaded as part of this call or was already loaded),
         *   the result object also gets a flag <code>coreResourcesFullyLoaded</code> which is true.
         * @private
         */
        this.instantiateComponent = function (oData) {
            var oComponentProperties = oData.componentProperties;
            var oComponentData = oData.componentData;
            var oAppPropertiesSafe = oData.appPropertiesSafe;
            var bLoadCoreExt = oData.loadCoreExt;

            // notify we are about to create component
            Ui5ComponentHandle.onBeforeApplicationInstanceCreated.call(null, oComponentProperties);

            var oDeferred = new jQuery.Deferred();

            oUtils.createUi5Component(oComponentProperties, oComponentData)
                .then(function (oComponent) {
                    var oComponentHandle = new Ui5ComponentHandle(oComponent);
                    oAppPropertiesSafe.componentHandle = oComponentHandle;

                    var bCoreResourcesFullyLoaded = bLoadCoreExt;
                    if (bCoreResourcesFullyLoaded) {
                        oAppPropertiesSafe.coreResourcesFullyLoaded = bCoreResourcesFullyLoaded;
                        oEventHub.emit("CoreResourcesComplementLoaded", { status: "success" });
                    }

                    oDeferred.resolve(oAppPropertiesSafe);
                })
                .fail(this._logStackTrace.bind(this, oComponentProperties))
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Returns the CoreResources complement bundle informations configured in the service
         *
         * @returns {String[]} The bundle resources that can be set as <code>preloadBundles</code>
         *  when loading UI5 components; an empty array is returned when the custom preload is disabled
         *
         * @since 1.102.0
         * @private
         */
        this.getCoreResourcesComplementBundle = function () {
            return Config.last("/core/customPreload/enabled") ? Config.last("/core/customPreload/coreResourcesComplement") : [];
        };

        /**
         * Loads a Bundle that complements the Core Resources as configured in the configuration (default core-ext-light)
         *
         * This should normally be triggered by the corresponding EventHub Event (loadCoreExtLight)
         * Can also be called directly and returns a promise if used that way.
         *
         * @returns {Promise} A Promise that resolves as soon as the Core Complements bundle is loaded
         * @private
         */
        this.loadCoreResourcesComplement = function () {
            if (!this.loadCoreResourcesComplementPromise) {
                this.loadCoreResourcesComplementPromise = new Promise(function (resolve, reject) {
                    oUtils.loadBundle(this.getCoreResourcesComplementBundle())
                    .then(function () {
                        oEventHub.emit("CoreResourcesComplementLoaded", { status: "success" });
                        resolve();
                    })
                    .catch(function () {
                        oEventHub.emit("CoreResourcesComplementLoaded", { status: "failed" });
                        reject();
                    });
                }.bind(this));
                this.loadCoreResourcesComplementPromise.finally(function () {
                    // Reset... to allow requesting again
                    this.loadCoreResourcesComplementPromise = undefined;
                }.bind(this));
            }

            return this.loadCoreResourcesComplementPromise;
        };

        /**
         * Load the Core-Ext-Light bundle when the appropiate Event is emitted
         */
        oEventHub.once("loadCoreResourcesComplement")
            .do(function () {
                this.loadCoreResourcesComplement();
            }.bind(this));
    }

    Ui5ComponentLoader.hasNoAdapter = false;
    return Ui5ComponentLoader;
});
