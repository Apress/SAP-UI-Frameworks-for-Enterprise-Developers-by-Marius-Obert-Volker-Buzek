// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/components/shell/SearchCEP/SearchProviders/SearchProvider",
    "sap/base/Log"
], function (SearchProvider, Log) {
    "use strict";

    /**
     * @constructor
     * @class
     * @since 1.101.0
     * @private
     */
    var RecentSearchProvider = function () {
    };

    /**
     * returns the name of the search provider
     *
     * @returns {string} the name of the provider
     *
     * @since 1.101.0
     * @private
     */
    RecentSearchProvider.prototype.getName = function () {
        return "Recent Search Terms Provider";
    };

    /**
     * provide the recent searches
     *
     * @returns {Promise} when resolved, contains the search result array
     *
     * @since 1.101.0
     * @private
     */
    RecentSearchProvider.prototype.execSearch = function () {
        return sap.ushell.Container.getServiceAsync("UserRecents").then(function (UserRecentsService) {
            return UserRecentsService.getRecentSearches().then(function (oRecents) {
                if (Array.isArray(oRecents) && oRecents.length > 0) {
                    return {
                        recentSearches: oRecents.map(function (item) {
                            return {
                                _type: SearchProvider.ENTRY_TYPE.SearchText,
                                text: item.sTerm,
                                icon: item.icon || "sap-icon://history"
                            };
                        })
                    };
                }
                return {};
            }, function (sError) {
                Log.error("Recent Search Terms Provider failed", "error: " + sError, "sap.ushell.components.shell.SearchCEP.SearchProviders.RecentSearchProvider::execSearch");
                return {};
            });
        });
    };

    return new RecentSearchProvider();
}, false);
