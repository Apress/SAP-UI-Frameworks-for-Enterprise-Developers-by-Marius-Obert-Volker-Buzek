// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This module handles the navigation service search actions
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/components/shell/SearchCEP/SearchProviders/SearchProvider",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/base/util/ObjectPath"
], function (SearchProvider, Log, Config, resources, ObjectPath) {
    "use strict";

    /**
     * @constructor
     * @class
     * @since 1.101.0
     * @private
     */
    var NavigationSvcSearchProvider = function () {
    };

    /**
     * returns the name of the search provider
     *
     * @returns {string} the name of the provider
     *
     * @since 1.101.0
     * @private
     */
    NavigationSvcSearchProvider.prototype.getName = function () {
        return "Navigation Service Search Provider";
    };

    /**
     * provide search results from the navigation service search api
     *
     * @param {string} sQuery the string to search
     * @returns {Promise} when resolved, contains the search result array
     *
     * @since 1.101.0
     * @private
     */
    NavigationSvcSearchProvider.prototype.execSearch = function (sQuery) {
        var that = this;
        return sap.ushell.Container.getServiceAsync("SearchCEP").then(function (SearchCEPService) {
            return SearchCEPService.execSearch(sQuery).then(function (oResult) {
                var bIsSearchCEPEnabled = ObjectPath.get("sap-ushell-config.services.SearchCEP") !== undefined,
                    sPlatform = sap.ushell.Container.getFLPPlatform(true),
                    bIsCEPStandard = bIsSearchCEPEnabled === true && sPlatform === "cFLP",
                    oFinalResult = {},
                    bESSearchEnabled = ObjectPath.get("sap-ushell-config.renderers.fiori2.componentData.config.searchBusinessObjects");

                if (oResult && Array.isArray(oResult.applications) && oResult.applications.length > 0) {
                    oFinalResult.applications = oResult.applications.map(function (item) {
                        item._type = SearchProvider.ENTRY_TYPE.App;
                        item.icon = item.icon || "sap-icon://SAP-icons-TNT/application";
                        return item;
                    });
                }
                if (oResult && Array.isArray(oResult.homePageApplications) && oResult.homePageApplications.length > 0) {
                    oFinalResult.homePageApplications = oResult.homePageApplications.map(function (item) {
                        item._type = SearchProvider.ENTRY_TYPE.App;
                        item.icon = item.icon || "sap-icon://product";
                        return item;
                    });
                }
                if (oResult && Array.isArray(oResult.externalSearchApplications) && oResult.externalSearchApplications.length > 0) {
                    oFinalResult.externalSearchApplications = oResult.externalSearchApplications.map(function (item) {
                        item._type = SearchProvider.ENTRY_TYPE.App;
                        item.icon = item.icon || "sap-icon://world";
                        return item;
                    });
                }

                if (bESSearchEnabled === true && bIsCEPStandard === true) {
                    oFinalResult.externalSearchApplications = that._addESToResult(oFinalResult, sQuery);
                }
                return oFinalResult;
            });
        }, function (sError) {
            Log.error("Navigation Service Search Provider failed", "error: " + sError, "sap.ushell.components.shell.SearchCEP.SearchProviders.NavigationSvcSearchProvider::execSearch");
            return {};
        });
    };

    /**
     * adds the enterprise search as an external search provider
     * added only in CEP Standard and when enterprise search is enabled in the site
     *
     * @param {oResult} oResult the search result array returned from the navigation service
     * @param {string} sQuery the string to search
     * @returns {Array} An externalSearchApplications array containing enterprise search
     *
     * @since 1.106.0
     * @private
     */
    NavigationSvcSearchProvider.prototype._addESToResult = function (oResult, sQuery) {
        var sHash = "#Action-search&/top=20&filter={\"dataSource\":{\"type\":\"Category\",\"id\":\"All\",\"label\":\"All\",\"labelPlural\":\"All\"},\"searchTerm\":\"" +
            sQuery + "\",\"rootCondition\":{\"type\":\"Complex\",\"operator\":\"And\",\"conditions\":[]}}",
            sUrl = sap.ushell.Container.getFLPUrl() + sHash,
            oESearch = {
                "text": resources.i18n.getText("enterprise_search"),
                "description": resources.i18n.getText("enterprise_search"),
                "icon": "sap-icon://search",
                "inboundIdentifier": "38cd162a-e185-448c-9c37-a4fc02b3d39d___GenericDefaultSemantic-__GenericDefaultAction",
                "url": sUrl,
                "target": "_blank",
                "recent": false,
                "semanticObject": "Action",
                "semanticObjectAction": "search",
                "_type": SearchProvider.ENTRY_TYPE.App,
                "isEnterpriseSearch": true
            };
        if (oResult && Array.isArray(oResult.externalSearchApplications) && oResult.externalSearchApplications.length > 0) {
            oResult.externalSearchApplications.push(oESearch);
        } else {
            oResult.externalSearchApplications = [oESearch];
        }
        return oResult.externalSearchApplications;
    };

    return new NavigationSvcSearchProvider();
}, false);
