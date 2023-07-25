// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Creates an adapter factory for data not handled by the
 * default adapter.
 * Once instantiated, returns a map of adapters to be used by the LaunchPage Service
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/services/_ContentExtensionAdapterFactory/ContentExtensionAdapterConfig",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/ObjectPath"
], function (
    Config,
    ContentExtensionAdapterConfig,
    jQuery,
    ObjectPath
) {
    "use strict";

    /**
     * @name sap.ushell.services.ContentExtensionAdapterFactory
     * @since 1.62.0
     * @experimental
     * @protected
     */
    var ContentExtensionFactory = {};

    /**
     * Constructs a new instance of the Content Extension Adapter Factory.
     * An array of adapter configurations needs to be passed to it (one
     * specific adapter for each extended content).
     * The configuration can be passed explicitly as an array vConfig or coded
     * in ContentExtensionAdapterConfig.
     *
     * Once instantiated, it generates a map of all the needed adapters
     * and returns them (as a promise) with the method #getAdapterMap.
     * Once the Promises resolve, the adapters are available in the map.
     *
     * IMPORTANT: aConfig.contentProviderName is the string any content
     * would use to indicate the LaunchPage service which adapter needs to be used
     * through a field "contentProvider" e.g. oGroup.contentProvider
     *
     * Currently, the configuration mocks the content through
     * FeatureGroupConfig and uses the local adapter. This should be changed
     * once a dedicated adapter for the extended content exists.
     *
     * @param {object[]} vConfigs A configuration array for the different adapters of ContentExtensionAdapterFactory.
     * @param {string} vConfigs[].contentProviderName The name of the adapter to find it in the service
     * @param {string} vConfigs[].adapter The path to the adapter
     * @param {string} vConfigs[].config The path to the configuration flag for this adapter
     * @param {object} vConfigs[].system A system object for creating the system when instantiating the adapter
     * @param {function} vConfigs[].configHandler Afunction that returns any needed configuration for the adapter
     * @returns {Promise<object>} A promise that resolves to a map of content provider names to adapter instances
     *                            Note that the map might contain undefined entries if the adapters are disabled.
     *
     * @protected
     */
    ContentExtensionFactory.getAdapters = function (vConfigs) {
        var aConfigs = ContentExtensionFactory._getConfigAdapters(vConfigs);
        var oAdapters = {};

        var aAdaptersPromises = aConfigs.map(function (oConfig) {
            var bEnabled = Config.last(oConfig.configSwitch);

            if (!bEnabled) {
                return Promise.resolve();
            }

            var oAdapterPromise = ContentExtensionFactory._getAdapter(oConfig);
            oAdapterPromise.then(function (oAdapter) {
                oAdapters[oConfig.contentProviderName] = oAdapter;
            });

            return oAdapterPromise;
        });

        return new Promise(function (resolve) {
            // Promise.all cannot be used in IE11, thus using jQuery.when
            jQuery.when.apply(jQuery, aAdaptersPromises).then(function () {
                resolve(oAdapters);
            });
        });
    };

    /**
     * Compiles a list of config adapters from the given parameter.
     * If no value is passed for vConfigs, the list of adapters is taken from the builtin Adapter configuration.
     *
     * @param {object[]|object|undefined} vConfigs A list of different adapters of ContentExtensionAdapterFactory, a single adapter or undefined.
     * @returns {object[]} A list of ContentExtensionAdapterFactory adapters.
     * @private
     */
    ContentExtensionFactory._getConfigAdapters = function (vConfigs) {
        if (!vConfigs) {
            vConfigs = ContentExtensionAdapterConfig._getConfigAdapters();
        }

        if (!Array.isArray(vConfigs)) {
            vConfigs = [ vConfigs ];
        }

        return vConfigs;
    };

    /**
     * Asynchronously loads the module associated to the adapter given in the configuration object and instantiates
     * an andapter from the module.
     *
     * @param {object} oConfig An adapter configuration object
     * @returns {Promise<object>} A Promise that resolves to the adapter instance
     * @private
     */
    ContentExtensionFactory._getAdapter = function (oConfig) {
        var oDeferred = new jQuery.Deferred();
        var oAdapterConfig = oConfig.configHandler ? oConfig.configHandler() : {};
        var sModule = oConfig.adapter.replace(/\./g, "/");

        sap.ui.require([ sModule ], function () {
            var oInstance = ContentExtensionFactory._getAdapterInstance(oConfig.adapter, oConfig.system, null, oAdapterConfig);

            oDeferred.resolve(oInstance);
        });

        return oDeferred.promise();
    };

    /**
     * Creates an adapter instance.
     * The resulting module name is <code>"sap.ushell.adapters." + oSystem.platform + "." + sName + "Adapter"</code>
     * unless configured differently.
     *
     * @param {string} sAdapterName The fully qualified adapter name
     * @param {sap.ushell.System} oSystem The target system
     * @param {string} [sParameter] A configuration parameter which is passed to the adapter's constructor
     * @param {object} [oConfig] An adapter configuration object
     * @returns {object} An adapter instance
     * @private
     */
    ContentExtensionFactory._getAdapterInstance = function (sAdapterName, oSystem, sParameter, oConfig) {
        var ClassConstructor = sap.ui.require(sAdapterName.replaceAll(".", "/"));

        if (ClassConstructor) {
            var oData = {
                config: oConfig || {}
            };

            return new ClassConstructor(oSystem, sParameter, oData);
        }

        return null;
    };

    return ContentExtensionFactory;
});
