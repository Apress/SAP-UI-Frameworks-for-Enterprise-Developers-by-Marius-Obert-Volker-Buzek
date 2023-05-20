// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * This module provides an XMLHttpRequest (XHR) based HTTP client that supports
 * cross-site request forgery (CSRF) token fetching and injection.
 *
 * Example:
 *
 * <pre>
 *   var oXHttpClient = new XHttpClient("/basePath/", {
 *       headers: {
 *           "Content-Type": "application/json"
 *       }
 *   });
 *   oXHttpClient.get("resource").then(function (oResponse) {
 *       if (oResponse.responseText === ...) ...
 *   }).catch(function () {
 *       ...
 *   });
 * </pre>
 *
 * The supported HTTP methods of the XHttpClient are:
 * - GET
 * - PUT
 * - POST
 * - PATCH
 * - DELETE
 * - OPTIONS
 *
 */
sap.ui.define([
    "sap/ui/core/Configuration",
    "sap/ui/thirdparty/URI",
    "sap/ushell/utils"
], function (Configuration, URI, utils) {
    "use strict";

    // JSDoc Type definitions

    // ... for the HTTP request

    /**
     * @typedef {object} HttpRequestOptions
     *     The HTTP request options may consist of request headers
     *     and request data to be sent in the message body.
     * @property {object} [headers]
     *     Each property of the HttpRequestHeaders object gets injected as a header into the HTTP request.
     * @property {object|string} [data]
     *     A JavaScript object that gets converted into a JSON string, or a string
     *     that is taken over into the message body of the current HTTP request
     */

    // ... for the HTTP response

    /**
     * @typedef {object} HttpResponseHeader
     *     Headers of the HTTP response
     * @property {string} name Name of an HTTP response header field
     * @property {string} value Value of an HTTP response header field
     */

    /**
     * @typedef {object} HttpResponse Response of the HTTP request
     * @property {string} status Status code of the HTTP response
     * @property {string} statusText Status text of the HTTP response
     * @property {string} responseText Text of the HTTP response
     * @property {HttpResponseHeader[]} responseHeaders HTTP headers of the HTTP response
     */

    /**
     * An HTTP client that can submit GET, PUT, POST, PATCH, DELETE and OPTIONS requests
     * and that supports cross-site request forgery (CSRF) token fetching and injection.
     *
     * The necessary CSRF token handling is done automatically.
     *
     * @constructor
     * @class
     * @namespace sap.ushell.utils.XHttpClient
     *
     * @param {string} [basePath]
     *     Base path that is prepended to the resource path specified in each method call
     *
     *     A path expression needs to be a valid directory ending with a slash. If you do not add a slash as a suffix,
     *     the last expression is interpreted as the requested filename. It is omitted when the request is sent.
     *     For details about the anatomy of a URL see: https://medialize.github.io/URI.js/about-uris.html#components-url.
     *
     *     If specified, the basePath is used as a key to store CSRF tokens and will be used to request new CSRF tokens using
     *     an "OPTIONS" request.
     * @param {HttpRequestOptions} [defaultOptions]
     *     Default HTTP headers are applied in each method call; body data are not supported here.
     *     The default option values can be overwritten by the HTTP client method calls.
     *
     * @since 1.88.0
     * @private
     */
    var HttpClient = function (basePath, defaultOptions) {

        // Initialize state
        this._oOngoingRequests = {};
        this._oCSRFTokens = {}; // CSRF tokens by base path or URL directory

        this._oDefaultOptions = {
            headers: defaultOptions && defaultOptions.headers || {}
        };
        if (typeof basePath === "string") {
            this._oBasePath = new URI(basePath);
        } else {
            this._oDefaultOptions = {
                headers: basePath && basePath.headers || {}
            };
        }
    };

    /**
     * Performs a GET method XHR request to the HTTP server.
     *
     * @param {string} resourcePath
     *     The path of the requested resource: Either relative without leading slash, or absolute with a leading slash.
     *     If the resourcePath is relative, it is added to the base bath if provided in the constructor.
     *     Otherwise the base path is omitted.
     * @param {HttpRequestOptions} [options] Options that control the HTTP request
     *     The headers given here overwrite the default header values of the same header name specified in the constructor.
     *
     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.get = function (resourcePath, options) {
        return this._executeRequest("GET", resourcePath, options);
    };

    /**
     * Performs a PUT method XHR request to the HTTP server.
     *
     * @param {string} resourcePath
     *     The path of the requested resource: Either relative without leading slash, or absolute with a leading slash.
     *     If the resourcePath is relative, it is added to the base bath if provided in the constructor.
     *     Otherwise the base path get omitted.
     * @param {HttpRequestOptions} [options] Options that control the HTTP request
     *
     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.put = function (resourcePath, options) {
        return this._executeRequest("PUT", resourcePath, options);
    };

    /**
     * Performs a POST method XHR request to the HTTP server.
     *
     * @param {string} resourcePath
     *     The path of the requested resource: Either relative without leading slash, or absolute with a leading slash.
     *     If the resourcePath is relative, it is added to the base bath if provided in the constructor.
     *     Otherwise the base path get omitted.
     * @param {HttpRequestOptions} [options] Options that control the HTTP request
     *
     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.post = function (resourcePath, options) {
        return this._executeRequest("POST", resourcePath, options);
    };

    /**
     * Performs a PATCH method XHR request to the HTTP server.
     *
     * @param {string} resourcePath
     *     The path of the requested resource: Either relative without leading slash, or absolute with a leading slash.
     *     If the resourcePath is relative, it is added to the base bath if provided in the constructor.
     *     Otherwise the base path get omitted.
     * @param {HttpRequestOptions} [options] Options that control the HTTP request
     *
     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.patch = function (resourcePath, options) {
        return this._executeRequest("PATCH", resourcePath, options);
    };

    /**
     * Performs a DELETE method XHR request to the HTTP server.
     *
     * @param {string} resourcePath
     *     The path of the requested resource: Either relative without leading slash, or absolute with a leading slash.
     *     If the resourcePath is relative, it is added to the base bath if provided in the constructor.
     *     Otherwise the base path get omitted.
     * @param {HttpRequestOptions} [options] Options that control the HTTP request

     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.delete = function (resourcePath, options) {
        return this._executeRequest("DELETE", resourcePath, options);
    };

    /**
     * Performs an OPTIONS method XHR request to the HTTP server.
     *
     * @param {string} resourcePath
     *     The path of the requested resource: Either relative without leading slash, or absolute with a leading slash.
     *     If the resourcePath is relative, it is added to the base bath if provided in the constructor.
     *     Otherwise the base path get omitted.
     * @param {HttpRequestOptions} [options] Options that control the HTTP request
     *
     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.options = function (resourcePath, options) {
        return this._executeRequest("OPTIONS", resourcePath, options);
    };

    /**
     * Aborts all pending HTTP requests.
     *
     * This functionality is used in the SAP Fiori Launchpad when a tile showing server data was scrolled
     * out of the view port, for example.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype.abortAll = function () {
        Object.keys(this._oOngoingRequests).forEach(function (sKey) {
            this._oOngoingRequests[sKey].abort();
        }.bind(this));
    };

    /**
     * Executes an HTTP request.
     *
     * @param {string} sRequestMethod Method of the HTTP request
     * @param {string} sResourcePath Path to the requested resource
     * @param {HttpRequestOptions} [oData] Headers and body data of the HTTP request
     *
     * @returns {Promise<HttpResponse>} Resolves with the response of the HTTP request, or rejects with an Error object.
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype._executeRequest = function (sRequestMethod, sResourcePath, oData) {
        var oInvalidURLError = new Error("The provided resource path is not a valid URL.");

        var oDefaultHeaders = {};
        var bSapStatisticsEnabled = Configuration.getStatisticsEnabled();
        if (bSapStatisticsEnabled) {
            oDefaultHeaders["sap-statistics"] = bSapStatisticsEnabled;
        }

        try {
            // Build URI and create XHR
            var oCompleteResourceURI;
            var oResourceURI = new URI(sResourcePath);
            if (!oResourceURI.is("url")) {
                return Promise.reject(oInvalidURLError);
            }

            if (this._oBasePath) {
                oCompleteResourceURI = oResourceURI.absoluteTo(this._oBasePath);
            } else {
                oCompleteResourceURI = oResourceURI;
            }

            var oXhr = new XMLHttpRequest();

            // Add unique id to the request & cache it in ongoing requests
            oXhr._sapUshellHttpClientId = utils.generateUniqueId(Object.keys(this._oOngoingRequests));
            this._oOngoingRequests[oXhr._sapUshellHttpClientId] = oXhr;

            // Merge additional headers
            var oHeaders = Object.assign({}, oDefaultHeaders, this._oDefaultOptions.headers, oData && oData.headers);

            return this._getCSRFTokenHeader(sRequestMethod, oCompleteResourceURI)
                .then(function (oCSRFHeader) {
                    // Merge x-csrf-token header
                    Object.assign(oHeaders, oCSRFHeader);

                    return new Promise(function (resolve, reject) {
                        // Configure and submit XHR

                        var sCompleteResourceURI = oCompleteResourceURI.href();

                        oXhr.onload = this._onLoad.bind(this, resolve, reject, {
                            xhr: oXhr,
                            method: sRequestMethod,
                            url: sCompleteResourceURI,
                            data: oData
                        });
                        oXhr.onerror = function () {
                            reject.call(this, this._getFormattedResponse(oXhr));
                        }.bind(this);
                        oXhr.onabort = function () {
                            oXhr.bAborted = true;
                            reject.call(this, this._getFormattedResponse(oXhr));
                        }.bind(this);
                        oXhr.onloadend = function () {
                            // Delete finished requests from the ongoing requests queue
                            delete this._oOngoingRequests[oXhr._sapUshellHttpClientId];
                        }.bind(this);

                        oXhr.open(sRequestMethod, sCompleteResourceURI);
                        Object.keys(oHeaders).forEach(function (sKey) {
                            oXhr.setRequestHeader(sKey, oHeaders[sKey]);
                        });

                        var sBody = oData && oData.data || "";
                        if (typeof sBody !== "string") {
                            sBody = JSON.stringify(sBody);
                        }
                        oXhr.send(sBody);
                    }.bind(this));
                }.bind(this));
        } catch (error) {
            return Promise.reject(oInvalidURLError);
        }
    };

    /**
     * Returns <code>x-csrf-token</code> header for the ongoing XHR call.
     *
     * @param {string} sRequestMethod Method of the HTTP call
     * @param {object} oAbsoluteResourceURI URI object to the requested resource
     *
     * @returns {Promise<object>} Resolves with an object containing the CSRF token header
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype._getCSRFTokenHeader = function (sRequestMethod, oAbsoluteResourceURI) {
        var sKey = "", sRequestURL = "";
        switch (sRequestMethod) {
            case "HEAD":
            case "GET":
            case "OPTIONS":
                return Promise.resolve({
                    "x-csrf-token": "fetch"
                });
            case "POST":
                // Return already cached token
                sKey = this._getCSRFTokenKey(oAbsoluteResourceURI);
                if (this._oCSRFTokens[sKey]) {
                    return Promise.resolve({
                        "x-csrf-token": this._oCSRFTokens[sKey]
                    });
                }

                // Fetch new CSRF token using an "HEAD" request.
                sRequestURL = oAbsoluteResourceURI.href();
                if (this._oBasePath) {
                    sRequestURL = this._oBasePath.origin() + this._oBasePath.directory();
                }
                return this._executeRequest("HEAD", sRequestURL).then(function (oResponse) {
                    var sCSRFToken = this._getCSRFTokenFromHeader(oResponse.responseHeaders);

                    if (!sCSRFToken) {
                        throw new Error("CSRF Token couldn't be fetched.");
                    }

                    return {
                        "x-csrf-token": sCSRFToken
                    };
                }.bind(this));
            case "PATCH":
            case "PUT":
            case "DELETE":
                // Return already cached token
                sKey = this._getCSRFTokenKey(oAbsoluteResourceURI);
                if (this._oCSRFTokens[sKey]) {
                    return Promise.resolve({
                        "x-csrf-token": this._oCSRFTokens[sKey]
                    });
                }

                // Fetch new CSRF token using an "OPTIONS" request. We use "OPTIONS" as it is *not* cacheable. Therefore we always
                // get a fresh CSRF token from the server. More details: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
                sRequestURL = oAbsoluteResourceURI.href();
                if (this._oBasePath) {
                    sRequestURL = this._oBasePath.origin() + this._oBasePath.directory();
                }
                return this._executeRequest("OPTIONS", sRequestURL).then(function (oResponse) {
                    var sCSRFToken = this._getCSRFTokenFromHeader(oResponse.responseHeaders);

                    if (!sCSRFToken) {
                        throw new Error("CSRF Token couldn't be fetched.");
                    }

                    return {
                        "x-csrf-token": sCSRFToken
                    };
                }.bind(this));
            default:
                return Promise.resolve({});
        }
    };

    /**
     * @typedef {object} OriginalRequestOptions An object containing details of the original request
     * @property {XMLHttpRequest} xhr The original XMLHttpRequest
     * @property {string} method HTTP method which was used to sent the request
     * @property {string} url URL to which the original request was sent
     * @property {HttpRequestOptions} data Original request options (HTTP headers & body)
     */

    /**
     * Is called once the XHR request has been executed.
     *
     * @param {function} fnResolve Function called when XHR succeeded
     * @param {function} fnReject Function called when XHR was rejected
     * @param {OriginalRequestOptions} oOriginalRequest An object containing details of the original request
     *
     * @returns {Promise<HttpResponse>} Resolves or rejects with the response of the XHR request
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype._onLoad = function (fnResolve, fnReject, oOriginalRequest) {
        var oFormattedResponse = this._getFormattedResponse(oOriginalRequest.xhr);

        var sCSRFToken = this._getCSRFTokenFromHeader(oFormattedResponse.responseHeaders);
        if (sCSRFToken) {
            var sKey = this._getCSRFTokenKey(new URI(oOriginalRequest.url));

            // If x-csrf-token is invalid, delete the token from cache and execute the request again
            if (sCSRFToken.toLowerCase() === "required" && oFormattedResponse.status === 403) {
                delete this._oCSRFTokens[sKey];
                return this._executeRequest(oOriginalRequest.method, oOriginalRequest.url, oOriginalRequest.data).then(fnResolve).catch(fnReject);
            }

            // If x-csrf-token is valid, add the token to cache
            this._oCSRFTokens[sKey] = sCSRFToken;
        }

        if (oFormattedResponse.status >= 200 && oFormattedResponse.status < 300) {
            return fnResolve(oFormattedResponse);
        }

        return fnReject(oFormattedResponse);
    };

    /**
     * Returns a key for storing CSRF token in the cache
     *
     * @param {URI} oCompleteResourceURI URI for requested resource
     * @returns {string} String consisting of the URI origin + directory
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype._getCSRFTokenKey = function (oCompleteResourceURI) {
        if (this._oBasePath) {
            return this._oBasePath.origin() + this._oBasePath.directory();
        }

        return oCompleteResourceURI.origin() + oCompleteResourceURI.directory();
    };

    /**
     * Extracts and returns the CSRF token from the HTTP response header.
     *
     * @param {HttpResponseHeader[]} aResponseHeaders Header attributes of the HTTP response
     *
     * @returns {string|undefined} Value of the x-csrf-token header attribute or undefined
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype._getCSRFTokenFromHeader = function (aResponseHeaders) {
        var oCSRFToken = aResponseHeaders.filter(function (oHeader) {
            return oHeader.name === "x-csrf-token";
        })[0];

        return oCSRFToken && oCSRFToken.value;
    };

    /**
     * Prepares and returns the response of the HTTP request
     * as an object for consumption.
     *
     * @param {object} oXhr XHR object of the underlying request
     *
     * @returns {HttpResponse} Response of the XHR request
     *
     * @since 1.88.0
     * @private
     */
    HttpClient.prototype._getFormattedResponse = function (oXhr) {
        return {
            aborted: oXhr.bAborted || false,
            status: oXhr.status,
            statusText: oXhr.statusText,
            responseText: oXhr.responseText,
            responseHeaders: oXhr.getAllResponseHeaders()
                // Headers are separated by line breaks. We split them here.
                .split(/\r\n/g)
                .filter(function (sItem) {
                    return sItem.length > 0;
                })
                // Header name & value are separated by ": ". We split & trim them here.
                .map(function (sHeader) {
                    var aParts = sHeader.split(":");
                    return {
                        name: aParts[0].trim(),
                        value: aParts[1].trim()
                    };
                })
        };
    };

    return HttpClient;

}, /* bExport = */ true);
