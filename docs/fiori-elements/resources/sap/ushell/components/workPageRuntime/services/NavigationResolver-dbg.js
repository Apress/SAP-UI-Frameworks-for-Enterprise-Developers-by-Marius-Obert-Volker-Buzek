// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This module resolves the given inbounds via the navigation service.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ui/core/Core",
    "sap/ushell/Config",
    "sap/base/Log"
], function (
    ObjectPath,
    Core,
    Config,
    Log
) {
    "use strict";

    /**
     * Service for loading WorkPages.
     *
     * @namespace sap.ushell.components.workPageRuntime.services.NavigationResolver
     *
     * @constructor
     * @class
     * @since 1.72.0
     *
     * @private
     */
    var NavigationResolver = function () {
        this._sBaseUrl = Config.last("/core/workPages/navigationApiUrl");
        this._sSiteId = ObjectPath.get("ushell.site.siteId", window["sap-ushell-config"]);
    };

    /**
     * Fetches a CSRF token or returns the cached token.
     *
     * @return {Promise<string>} The token string.
     * @private
     */
    NavigationResolver.prototype._fetchCsrfToken = function () {
        if (this._oFetchCsrfTokenPromise) {
            return this._oFetchCsrfTokenPromise;
        }
        this._oFetchCsrfTokenPromise = fetch(this._sBaseUrl, {
            method: "HEAD",
            headers: {
                "x-csrf-token": "fetch",
                "Accept-Language": Core.getConfiguration().getLanguageTag()
            }
        }).then(function (response) {
            return response.headers.get("x-csrf-token");
        });

        return this._oFetchCsrfTokenPromise;
    };

    /**
     * Resolves the given inboundId and parameters to a URL.
     *
     * @param {string} sInboundId The inbound id.
     * @param {object} oParameters The parameters.
     * @return {Promise<object>} The result object.
     */
    NavigationResolver.prototype.resolveByInbound = function (sInboundId, oParameters) {
        return this._fetchCsrfToken().then(function (sCsrfToken) {
            return fetch(
                this._sBaseUrl + "/resolve/inbound",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; utf-8",
                        Accept: "application/json",
                        "x-csrf-token": sCsrfToken,
                        "Accept-Language": Core.getConfiguration().getLanguageTag()
                    },
                    body: JSON.stringify({
                        inboundIdentifier: sInboundId,
                        intentParameters: oParameters,
                        queryParameters: {
                            siteId: this._sSiteId
                        },
                        launchType: "standalone"
                    })
                }
            ).then(function (response) {
                if (response.ok === false) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            }).then(function (responseData) {
                var oData = responseData.value || responseData;
                var sUrl = Array.isArray(oData) ? oData[0].url : oData.url;

                return {
                    additionalInformation: "",
                    url: sUrl,
                    applicationType: "URL",
                    navigationMode: "newWindow"
                };
            });
        }.bind(this)).catch(function (vError) {
            Log.error("Tile target for inboundId '" + sInboundId + "' could not be resolved. The tile will be shown but will not navigate.");
            Log.error(vError);
            return {
                additionalInformation: "",
                url: "",
                applicationType: "URL",
                navigationMode: "newWindow"
            };
        });
    };

    return NavigationResolver;
}, /*export=*/ true);
