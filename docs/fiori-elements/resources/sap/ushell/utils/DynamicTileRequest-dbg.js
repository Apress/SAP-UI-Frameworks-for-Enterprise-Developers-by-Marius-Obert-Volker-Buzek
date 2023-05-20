//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview this module handles the creation of requests for the dynamic tile
 */

sap.ui.define([
    "sap/ushell/utils/HttpClient",
    "sap/ui/thirdparty/URI",
    "sap/base/util/isEmptyObject",
    "sap/base/util/UriParameters",
    "sap/base/Log",
    "sap/ui/core/Configuration",
    "sap/base/util/ObjectPath"
], function (
    HttpClient,
    URI,
    isEmptyObject,
    UriParameters,
    Log,
    Configuration,
    ObjectPath
) {
    "use strict";

    var sModuleName = "sap.ushell.utils.DynamicTileRequest";

    /**
     * Creates a DynamicTileRequest and starts the request
     *
     * @param {string} sUrl The request url
     * @param {function} fnSuccess The success handler
     * @param {function} fnError The error handler
     * @param {string|undefined} [sContentProviderId] The contentProviderId
     * @param {object} oOptions Further options for the dynamic tile request
     * @param {object} oOptions.dataSource Additional data about the request URL in the format of a data source as defined by the app descriptor.
     * @param {object} oOptions.datSource.settings.odataVersion The OData version of the request URL. Valid values are "2.0" and "4.0". Default is "2.0".
     *
     * @since 1.87.0
     * @private
     */
    function DynamicTileRequest (sUrl, fnSuccess, fnError, sContentProviderId, oOptions) {
        this.fnSuccess = fnSuccess;
        this.fnError = fnError;
        this.sUrl = sUrl;
        this._sODataVersion = ObjectPath.get(["dataSource", "settings", "odataVersion"], oOptions);
        this._bResolveSemanticDateRanges = true;

        this.oReferenceResolverPromise = sap.ushell.Container.getServiceAsync("ReferenceResolver");

        // Resolve UserDefaults first
        this.oPromise = this._resolveUserDefaults(sUrl, sContentProviderId)
            .then(function (sUrlResolvedUserDefaults) {
                if (sUrlResolvedUserDefaults) {
                    // Save the URL for the resolved UserDefaults to re-use it everytime refresh is called.
                    this.sUrlResolvedUserDefaults = sUrlResolvedUserDefaults;
                    this.refresh();
                }
            }.bind(this))
            .catch(function (vError) {
                Log.error("Was not able to create a DynamicTileRequest:", vError, sModuleName);
            });
    }

    /**
     * Creates a request if no request is currently running
     *
     * Resolve semantic date ranges everytime the method is called to keep them updated.
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype.refresh = function () {
        if (!this.oRequest) {
            this.oRequest = this._resolveSemanticDateRanges()
                .then(function (sResolvedUrl) {
                    if (sResolvedUrl) {
                        return this._sendRequest(sResolvedUrl);
                    }
                }.bind(this));
        }
    };

    /**
     * Resolves the semantic date ranges
     *
     * @returns {Promise<string>} The resolved url
     *
     * @since 1.110.0
     * @private
     */
    DynamicTileRequest.prototype._resolveSemanticDateRanges = function () {
        if (!this._bResolveSemanticDateRanges) {
            return Promise.resolve(this.sUrlResolvedUserDefaults);
        }

        return this.oReferenceResolverPromise
            .then(function (oReferenceResolver) {
                // UserDefaults are replaced before semantic dates
                return oReferenceResolver.resolveSemanticDateRanges(this.sUrlResolvedUserDefaults, this._sODataVersion);
            }.bind(this))
            .then(function (oResult) {

                // Check for ignored (unresolved) references before the request is sent.
                if ((oResult.ignoredReferences && oResult.ignoredReferences.length > 0)
                    || (oResult.invalidSemanticDates && oResult.invalidSemanticDates.length > 0)
                ) {
                    var aReferences = [].concat(oResult.invalidSemanticDates || [], oResult.ignoredReferences || []);
                    Log.error("The service URL contains invalid Reference(s): " + aReferences.join(", "), "", sModuleName);
                    return;
                }

                // If there are no semantic date ranges in the URL this step can be skipped on the next refresh.
                this._bResolveSemanticDateRanges = oResult.hasSemanticDateRanges;

                return oResult.url;
            }.bind(this))
            .catch(function (vError) {
                Log.error("Could not resolve semantic date ranges:", vError, sModuleName);
                return Promise.reject(vError);
            });
    };

    /**
     * Sends the request
     *
     * All URL transformations are done in this method after various placeholders were replaced.
     *
     * @param {string} sResolvedUrl The resolved url
     * @returns {Promise<Object>} The response
     *
     * @since 1.110.0
     * @private
     */
    DynamicTileRequest.prototype._sendRequest = function (sResolvedUrl) {
        // Set escapeQuerySpace to false and use "%20" encoding instead of "+" for spaces.
        // The "+" encoding seems to fail for many OData services.
        var oUri = new URI(sResolvedUrl).escapeQuerySpace(false);

        // Adding a query parameter triggers the encoding of the whole query string.
        // Therefore, append the additional parameters as late as possible to avoid encoding the placeholders.
        var sSAPLogonLanguage = Configuration.getSAPLogonLanguage();
        if (sSAPLogonLanguage && !oUri.hasQuery("sap-language")) {
            oUri.addQuery("sap-language", sSAPLogonLanguage);
        }

        var bAddClient = false;
        if (oUri.is("relative")) {
            // Add the sap-client if the url is relative.
            bAddClient = true;
            // Make the url absolute
            oUri = oUri.absoluteTo(location.href);
        }

        var oHeaders = this._getHeaders(bAddClient);
        this.oConfig = {
            headers: oHeaders
        };

        this._sUrlBasePath = oUri.origin();
        this._sUrlRequest = oUri.href();

        this.oClient = new HttpClient(this._sUrlBasePath, this.oConfig);
        return this.oClient.get(oUri.relativeTo(this._sUrlBasePath).href())
            .then(this._onSuccess.bind(this))
            .catch(this._onError.bind(this));
    };

    /**
     * Aborts the running request
     *
     * @returns {boolean} Whether a request was running or not
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype.abort = function () {
        if (this.oRequest && this.oClient) {
            this.oClient.abortAll();
            this.oClient = null;
            this.oRequest = null;
            return true;
        }
        return false;
    };

    /**
     * Converts the result of the request according to requirements of the dynamic tile
     * and reset the request
     *
     * @param {object} oResult Result of the request
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype._onSuccess = function (oResult) {
        var vResult;
        try {
            vResult = JSON.parse(oResult.responseText);
        } catch (err) {
            throw new Error("Was not able to parse response of dynamic tile request");
        }

        this.oClient = null;
        this.oRequest = null;
        var oData;

        if (typeof vResult === "object") {
            // OData v2 adds this additional "d" level
            vResult = vResult.d ? vResult.d : vResult;
            var oUriParameters = UriParameters.fromURL(this._sUrlRequest);

            if (oUriParameters.get("$inlinecount") === "allpages") {
                oData = { number: vResult.__count };

            // OData v4 $count=true
            } else if (oUriParameters.get("$count") === "true") {
                oData = { number: vResult["@odata.count"] };

            } else {
                oData = this._extractData(vResult);
            }
        // plain result
        } else if (typeof vResult === "string" || typeof vResult === "number") {
            oData = { number: vResult };
        }

        this.fnSuccess(oData);
    };

    /**
     * Calls the error handler and reset of the request
     *
     * @param {object} oError The error
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype._onError = function (oError) {
        this.oClient = null;
        this.oRequest = null;
        this.fnError(oError);
    };

    /**
     * Converts and filters the data according to requirements of the dynamic tile
     *
     * @param {object} oData Result of the request
     * @returns {object} The converted object
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype._extractData = function (oData) {
        var aSupportedKeys = [
            "results",
            "icon",
            "title",
            "number",
            "numberUnit",
            "info",
            "infoState",
            "infoStatus",
            "targetParams",
            "subtitle",
            "stateArrow",
            "numberState",
            "numberDigits",
            "numberFactor"
        ];

        // Filters data
        var oResult = Object.keys(oData).reduce(function (oAcc, sKey) {
            if (aSupportedKeys.indexOf(sKey) > -1) {
                oAcc[sKey] = oData[sKey];
            }
            return oAcc;
        }, {});

        if (!isEmptyObject(oResult)) {
            return oResult;
        }

        // Allow deeper nesting by one level when there is only one key in the first level,
        // this is needed in order to support that OData service operations (function imports) can return the dynamic tile data.
        var sFirstKey = Object.keys(oData)[0];
        if (sFirstKey !== undefined && Object.keys(oData).length === 1) {
            return Object.keys(oData[sFirstKey]).reduce(function (oAcc, sKey) {
                if (aSupportedKeys.indexOf(sKey) > -1) {
                    oAcc[sKey] = oData[sFirstKey][sKey];
                }
                return oAcc;
            }, {});
        }
        return {};
    };

    /**
     * Creates the request headers
     *
     * @param {boolean} bAddClient True if the sap-client should be added
     * @returns {object} The required headers
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype._getHeaders = function (bAddClient) {
        var oHeaders = {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            "Accept-Language": Configuration.getLanguage() || "",
            Accept: "application/json, text/plain"
        };

        var sSAPLogonLanguage = Configuration.getSAPLogonLanguage();
        if (sSAPLogonLanguage) {
            oHeaders["sap-language"] = sSAPLogonLanguage;
        }

        if (bAddClient) {
            var oLogonSystem = sap.ushell.Container.getLogonSystem();
            var sSapClient = oLogonSystem && oLogonSystem.getClient();
            if (sSapClient) {
                oHeaders["sap-client"] = sSapClient;
            }
        }
        return oHeaders;
    };

    /**
     * Resolves the UserDefaults values within the request url
     *
     * @param {string} sUrl The request url
     * @param {string} [sContentProviderId] The ContentProviderId
     * @returns {Promise<string>} The resolved url
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype._resolveUserDefaults = function (sUrl, sContentProviderId) {
        var oReferenceResolverService;

        return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
            .then(function (oClientSideTargetResolutionService) {
                return Promise.all([
                    oClientSideTargetResolutionService.getSystemContext(sContentProviderId),
                    this.oReferenceResolverPromise
                ]);
            }.bind(this))
            .then(function (oResults) {
                var oSystemContext = oResults[0];
                oReferenceResolverService = oResults[1];
                return new Promise(function (resolve, reject) {
                    oReferenceResolverService.resolveUserDefaultParameters(sUrl, oSystemContext)
                        .done(resolve)
                        .fail(reject);
                });
            })
            .then(function (oResult) {
                if (oResult.defaultsWithoutValue && oResult.defaultsWithoutValue.length > 0) {
                    Log.error("The service URL contains User Default(s) with no set value: " + oResult.defaultsWithoutValue.join(", "), "", sModuleName);
                    return;
                }

                if (oResult.ignoredReferences && oResult.ignoredReferences.length > 0) {
                    // Filter ignored references for DynamicDate because they will be replaced later.
                    var aIgnoredReferences = oResult.ignoredReferences.filter(function (sReference) {
                        return !sReference.startsWith("DynamicDate");
                    });
                    if (aIgnoredReferences.length > 0) {
                        Log.error("The service URL contains invalid Reference(s): " + aIgnoredReferences.join(", "), "", sModuleName);
                        return;
                    }
                }

                return oResult.url;
            });
    };

    /**
     * Aborts the running requests and destroys the handler references
     *
     * @since 1.87.0
     * @private
     */
    DynamicTileRequest.prototype.destroy = function () {
        this.abort();
        this.fnError = null;
        this.fnSuccess = null;
    };

    return DynamicTileRequest;

});
