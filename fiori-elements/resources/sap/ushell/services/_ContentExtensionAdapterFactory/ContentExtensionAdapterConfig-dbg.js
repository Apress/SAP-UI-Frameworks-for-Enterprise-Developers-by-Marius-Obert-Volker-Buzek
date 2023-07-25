// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *  Provides the configuration array for the ContentExtensionFactory.
 *  Any adapter needed by the factory should be defined here.
 *  Any special handling of the configuration should be done by the
 *  config handler which is called by the factory to generate an explicit
 *  Adapter configuration
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/System",
    "sap/ushell/services/_ContentExtensionAdapterFactory/FeaturedGroupConfig" // replace as soon as functioning adapter is available
], function (Config, System, FeaturedGroupMock) {
    "use strict";

    var oAdapterConfig = {};

    /**
     * aConfig is a configuration array for the different adapters of ContentExtensionFactory
     * Each item is an object containing:
     * contentProviderName: the name of the adapter (this will be used to _find_ the adapter in the service)
     * adapter: the path to the adapter
     * configSwitch: the path to the configuration flag for this adapter
     * system: a system object for creating the system when instantiating the adapter
     * configHandler: a function that returns any needed configuration for the adapter
     */
    var aConfig = [{
        contentProviderName: "featured",
        adapter: "sap.ushell.adapters.cdm.v3.StaticGroupsAdapter",
        configSwitch: "/core/home/featuredGroup/enable",
        system: {
            alias: "",
            platform: "cdm"
        },
        configHandler: function () {
            var bRecentActivityEnabled = Config.last("/core/shell/enableRecentActivity") &&
                Config.last("/core/shell/model/currentState/showRecentActivity"),
                bEnableFrequentCard = bRecentActivityEnabled && Config.last("/core/home/featuredGroup/frequentCard"),
                bEnableRecentCard = bRecentActivityEnabled && Config.last("/core/home/featuredGroup/recentCard");
            return FeaturedGroupMock.getMockAdapterConfig(bEnableFrequentCard, bEnableRecentCard);
        }
    }];

    /**
     * Instantiates the systems for each configuration and replaces the "system" property with the instance.
     *
     * @returns {object[]} The list of configuration objects
     */
    oAdapterConfig._getConfigAdapters = function () {
        aConfig.forEach(function (oConfig) {
            oConfig.system = new System(oConfig.system);
        });
        return aConfig;
    };

    return oAdapterConfig;
});
