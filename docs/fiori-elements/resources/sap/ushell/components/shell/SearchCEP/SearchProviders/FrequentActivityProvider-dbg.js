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
    var FrequentActivityProvider = function () {
    };

    /**
     * returns the name of the search provider
     *
     * @returns {string} the name of the provider
     *
     * @since 1.101.0
     * @private
     */
    FrequentActivityProvider.prototype.getName = function () {
        return "Frequent Activity Provider";
    };

    /**
     * provide the frequent activity of the user
     *
     * @returns {Promise} when resolved, contains the frequent activity array
     *
     * @since 1.101.0
     * @private
     */
    FrequentActivityProvider.prototype.execSearch = function () {
        return sap.ushell.Container.getServiceAsync("UserRecents").then(function (UserRecentsService) {
            return UserRecentsService.getFrequentActivity().then(function (oRecents) {
                var oFinalResult = {};
                if (Array.isArray(oRecents) && oRecents.length > 0) {
                    oFinalResult.frequentApplications = oRecents.filter(function (item) {
                        if (item.appType === "Application" || item.appType === "External Link") {
                            return true;
                        }
                        return false;
                    }).map(function (item) {
                        if (item.appType === "Application") {
                            item._type = SearchProvider.ENTRY_TYPE.App;
                            item.text = item.text || item.title;
                            item.icon = item.icon || "sap-icon://SAP-icons-TNT/application";
                        } else if (item.appType === "External Link") {
                            item._type = SearchProvider.ENTRY_TYPE.ExternalLink;
                            item.text = item.text || item.title;
                            item.icon = item.icon || "sap-icon://internet-browser";
                        }
                        return item;
                    });
                    oFinalResult.frequentProducts = oRecents.filter(function (item) {
                        if (item.appType === "Product") {
                            return true;
                        }
                        return false;
                    }).map(function (item) {
                        item._type = SearchProvider.ENTRY_TYPE.Product;
                        item.text = item.text || item.title;
                        item.icon = item.icon || "sap-icon://product";
                        return item;
                    });
                }
                return oFinalResult;
            }, function (sError) {
                Log.error("Frequent Activity Provider failed", "error: " + sError, "sap.ushell.components.shell.SearchCEP.SearchProviders.FrequentActivityProvider::execSearch");
                return {};
            });
        });
    };

    return new FrequentActivityProvider();
}, false);
