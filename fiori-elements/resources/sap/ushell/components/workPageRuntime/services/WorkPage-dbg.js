// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This module communicates with the content API graphql service to retrieve and save workpage and visualization data.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/core/Core",
    "sap/ushell/utils/HttpClient",
    "sap/base/util/ObjectPath",
    "sap/ushell/Config",
    "sap/base/Log"
], function (
    Core,
    HttpClient,
    ObjectPath,
    Config,
    Log
) {
    "use strict";

    /**
     * Service for loading WorkPages.
     *
     * @namespace sap.ushell.components.workPageRuntime.services.WorkPage
     *
     * @constructor
     * @class
     * @since 1.72.0
     *
     * @private
     */
    var WorkPage = function () {
        this.httpClient = new HttpClient();
        this._sBaseUrl = Config.last("/core/workPages/contentApiUrl");
    };


    /**
     * Validates the given page data. Returns a rejected promise if validation fails.
     * @param {object} oPageData The page data.
     * @return {Promise} A promise, that is resolved if the page data is valid, else it is rejected.
     * @private
     */
    WorkPage.prototype._validateData = function (oPageData) {
        Log.debug("cep/editMode: load Page: validate", "Work Page service");
        if (oPageData.errors && oPageData.errors.length > 0) {
            return Promise.reject(oPageData.errors
                .map(function (oError) { return oError.message; })
                .join(",\n"));

        }
        if (!ObjectPath.get("data.WorkPage", oPageData)) {
            Log.debug("cep/editMode: load Page: validate: reject: data is empty", "Work Page service");
            return Promise.reject("Work Page data is empty");
        }
        return Promise.resolve(oPageData);
    };

    /**
     * Load the WorkPage data for the given page Id.
     * Additionally, load the visualizations used on that WorkPage.
     *
     * @param {string} sSiteId The site id.
     * @param {string} sPageId The WorkPage id.
     * @return {Promise<{ WorkPage: {UsedVisualizations: { nodes: object[] }, Editable: boolean}}>} A promise resolving with the loaded work page and visualizations.
     */
    WorkPage.prototype.loadWorkPageAndVisualizations = function (sSiteId, sPageId) {
        var sQuery = "{" +
                    "WorkPage(" +
                      "SiteId:\"" + sSiteId + "\"," +
                      "WorkPageId:\"" + sPageId + "\"" +
                    ") {" +
                        "Id," +
                        "Contents," +
                        "Editable," +
                        "UsedVisualizations{" +
                        "nodes{" +
                            "Id," +
                            "Type," +
                            "Descriptor," +
                            "DescriptorResources{" +
                                "BaseUrl," +
                                "DescriptorPath" +
                            "}" +
                        "}" +
                    "}" +
                "}" +
            "}";
        return this._doRequest(sQuery)
            .then(this._validateData)
            .then(function (oPageData) {
                var oWorkPageData = ObjectPath.get("data.WorkPage.Contents", oPageData);
                var aVizData = ObjectPath.get("data.WorkPage.UsedVisualizations.nodes", oPageData) || [];
                var bEditable = ObjectPath.get("data.WorkPage.Editable", oPageData) === true;
                return {
                    WorkPage: {
                        Contents: oWorkPageData,
                        UsedVisualizations: { nodes: aVizData },
                        Editable: bEditable
                    }
                };
            });
    };

    /**
     * Do the XHR request with the given query.
     *
     * @param {string} sQuery The query.
     * @return {Promise} Promise that resolves with the parsed JSON response if the request was successful, otherwise it is rejected.
     * @private
     */
    WorkPage.prototype._doRequest = function (sQuery) {
        return this.httpClient.get(this._sBaseUrl + "?query=" + sQuery, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": Core.getConfiguration().getLanguageTag()
            }
        }).then(function (oResponse) {
            if (oResponse.status < 200 || oResponse.status >= 300) {
                return Promise.reject("HTTP request failed with status: " + oResponse.status + " - " + oResponse.statusText);
            }
            return JSON.parse(oResponse.responseText || "{}");
        });
    };

    return WorkPage;
}, /*export=*/ true);
