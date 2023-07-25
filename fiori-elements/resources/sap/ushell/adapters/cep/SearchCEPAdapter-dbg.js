// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's Search adapter for myHome.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Configuration",
    "sap/ushell/Config"
], function (
    Log,
    Configuration,
    Config
) {
    "use strict";
    /**
     * The Unified Shell's Search adapter for myHome.
     * This constructor will be initialized when requesting the corresponding service.
     * Do NOT initialize directly.
     *
     * @param {object} oSystem  The system served by the adapter
     * @param {string} sParameters Parameter string, not in use (legacy, was used before oAdapterConfiguration was added)
     * @param {object} oConfig A potential Adapter Configuration
     * @constructor
     *
     * @since 1.101.0
     * @private
     */
    var SearchCEPAdapter = function (oSystem, sParameters, oConfig) {
        this._oConfig = (oConfig && oConfig.config) || {};
        this._oConfig.searchProvider = this._oConfig.searchProvider || "/navigation/search/api/v1/lookupTargets";
    };
    /**
     * Searching applications via the navigation service.
     * @param {string} sQuery The query string to search.
     *
     * @returns {Promise} Promise resolving the search result (array of application objects)
     *
     * @private
     * @since 1.101.0
     */
    SearchCEPAdapter.prototype.execSearch = function (sQuery) {
        var sUrl = this._oConfig.searchProvider;
        var sPlatform = sap.ushell.Container.getFLPPlatform(true);
        var oUrlParams = new URL(document.URL).searchParams;
        var sSiteId = Config.last("/core/site/siteId");
        var sLanguageTag = Configuration.getLanguageTag();

        if (typeof sQuery === "string" && sQuery.length > 0) {
            sUrl += "?query=" + encodeURIComponent(sQuery);
        }
        if (typeof sSiteId === "string" && sSiteId.length > 0) {
            sUrl += sUrl.indexOf("?") > 0 ? "&" : "?";
            sUrl += "siteId=" + encodeURIComponent(sSiteId);
        }
        if (sPlatform === "MYHOME") {
            sUrl += sUrl.indexOf("?") > 0 ? "&" : "?";
            sUrl += "genLink=true";
        }
        if (Log.getLevel() >= Log.Level.DEBUG) {
            Log.debug("Navigation service search triggered", "url: " + sUrl, "sap.ushell.adapters.cep.SearchCEPAdapter::execSearch");
        }
        if (oUrlParams.get("sap-statistics") === "true" ||
            window.localStorage.getItem("sap-ui-statistics") === "X") {
            sUrl += sUrl.indexOf("?") > 0 ? "&" : "?";
            sUrl += "sap-statistics=true";
        }
        return fetch(
            sUrl,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; utf-8",
                    Accept: "application/json",
                    "Accept-Language": sLanguageTag
                }
            }
        ).then(function (response) {
            if (response.ok === false) {
                Log.error("Navigation service search adapter failed",
                    "error: " + response.status + "," + response.statusText + "\nurl: " + sUrl, "sap.ushell.adapters.cep.SearchCEPAdapter::execSearch");
                return Promise.reject(response.statusText);
            }
            return response.json();
        }).then(function (data) {
            if (Log.getLevel() >= Log.Level.DEBUG) {
                Log.debug("Navigation service search adapter success", "url: " + sUrl + "\n\n" + JSON.stringify(data || {}, null, 2), "sap.ushell.adapters.cep.SearchCEPAdapter::execSearch");
            }
            return data;
        });
    };
    return SearchCEPAdapter;
}, false);
