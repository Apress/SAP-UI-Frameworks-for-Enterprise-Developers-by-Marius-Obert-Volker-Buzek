// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/Config"
], function (Config) {
    "use strict";

    /**
     * Load UsageAnalytics Profiling
     *
     * @returns {Promise<undefined>} Resolves when UsageAnalyticsProfiling is loaded or disabled
     * @private
     */
    function _loadUsageAnalyticsProfiling () {
        return new Promise(function (resolve) {
            sap.ushell.Container.getServiceAsync("UsageAnalytics").then(function (UsageAnalyticsService) {
                if (UsageAnalyticsService.systemEnabled() && UsageAnalyticsService.isSetUsageAnalyticsPermitted()) {
                    sap.ui.require([
                        "sap/ushell/components/shell/Settings/userProfiling/UsageAnalyticsProfiling"
                    ], function (UsageAnalyticsProfiling) {
                        var aProfiles = Config.last("/core/userPreferences/profiling");
                        aProfiles.push(UsageAnalyticsProfiling.getProfiling());
                        Config.emit("/core/userPreferences/profiling", aProfiles);
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    return function loadProfiling () {
        return Promise.all([
            _loadUsageAnalyticsProfiling()
        ]);
    };
});
