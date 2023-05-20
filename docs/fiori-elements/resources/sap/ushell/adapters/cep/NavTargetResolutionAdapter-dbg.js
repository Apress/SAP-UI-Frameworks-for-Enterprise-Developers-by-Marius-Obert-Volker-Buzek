// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileoverview The NavTargetResolution adapter for SAP MyHome
 * @version 1.113.0
 */

sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ui/core/Configuration",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Container",
    "sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds",
    "sap/ushell/utils/HttpClient",
    "sap/ushell/Config"
], function (
    ObjectPath,
    Configuration,
    jQuery,
    Container,
    oVirtualInbounds,
    HttpClient,
    Config
) {
    ("use strict");
    /** Constructs a new instance of  The NavTargetResolution adapter for SAP MyHome.
     * It calls the backend service to retrieve navigation data.
     * @class
     * @constructor
     * @param {object} oUnused unused
     * @param {string} sParameter parameters
     * @param {object} oAdapterConfiguration configuration, holds endpoint for service
     * @since 1.101.0
     * @private
     */
    var NavTargetResolutionAdapter = function (
        oUnused,
        sParameter,
        oAdapterConfiguration
    ) {
        this.oAdapterConfiguration = oAdapterConfiguration;
        this._addVirtualInboundsToApplications();
        this._initializeHttpClient();
    };

    /**
     * Adds virtual inbounds to applications
     * @since 1.101.0
     * @private
     */
    NavTargetResolutionAdapter.prototype._addVirtualInboundsToApplications = function () {
        var oApplications = ObjectPath.create(
            "config.applications",
            this.oAdapterConfiguration
        );
        var aVirtualInbounds = oVirtualInbounds.getInbounds();
        aVirtualInbounds.forEach(function (oInbound) {
            var sIntent = oInbound.semanticObject + "-" + oInbound.action;
            oApplications[sIntent] = oInbound.resolutionResult;
        });
    };

    /**
     * Gets the intent object that can be passed to the resolve service
     * used to call the backend service.
     * It uses the default launchStrategy which is launch type 'standalone'
     * and matching strategy 'first'.
     * The site id is taken from the window object.
     * @param {String} sHashFragment Fragment with semantic object and action and intent parameters,
     * @returns {Promise} Promise that resolves with an intent object
     * @private
     * @since 1.101.0
     */
    NavTargetResolutionAdapter.prototype._getIntentForService = function (sHashFragment) {
        return sap.ushell.Container.getServiceAsync("URLParsing").then(
            function (URLParsing) {
                var oHashFragment = URLParsing.parseShellHash(sHashFragment);

                return {
                    semanticObject: oHashFragment.semanticObject,
                    semanticObjectAction: oHashFragment.action,
                    intentParameters: oHashFragment.params,
                    queryParameters: {
                        siteId: Config.last("/core/site/siteId") || ""
                    }
                };
            }
        );
    };

    /**
     * Initialize the HttpClient
     * @private
     * @since 1.110.0
     */
    NavTargetResolutionAdapter.prototype._initializeHttpClient = function () {
        var oHeaders = {
            "Content-Type": "application/json; utf-8",
            Accept: "application/json",
            "Accept-Language": Configuration.getLanguageTag() || ""
        };

        var sBasePath = this.oAdapterConfiguration.config.navServiceUrl + "/";
        this.oHttpClient = new HttpClient(sBasePath, { headers: oHeaders });
    };

    /**
     * wrapper function to convert ES6 promise into jQuery promise
     * @param {function} fn function to wrap
     * @return {fn} wrapped function
     */
    NavTargetResolutionAdapter.prototype.toPromise = function (fn) {
        var that = this;
        return function (mArg) {
            var oDeferred = new jQuery.Deferred();
            fn.call(that, mArg)
                .then(oDeferred.resolve)
                .catch(oDeferred.reject)
                .finally(oDeferred.always);

            return oDeferred.promise();
        };
    };

    /**
     * Resolves hash fragment by calling backend service
     * @param {*} sHashFragment hash fragment
     * @returns {jQuery.Promise} a promise that resolves with a resolution result
     * @since 1.101.0
     */
    NavTargetResolutionAdapter.prototype.resolveHashFragment =
        function (sHashFragment) {
            return this.toPromise(
                this._resolveHashFragment
            ).call(this, sHashFragment);
        };

    /**
     * Resolves hash fragment by calling backend service
     * @param {*} sHashFragment hash fragment
     * @returns {Promise} a promise that resolves with a resolution result
     * @since 1.101.0
     */

    NavTargetResolutionAdapter.prototype._resolveHashFragment = function (
        sHashFragment
    ) {
        return this._getIntentForService(sHashFragment)
            .then(function (oIntentForService) {
                var sResolvePath = this.oAdapterConfiguration.config.navServiceUrl + "/resolve";
                return this.oHttpClient.post(sResolvePath, { data: JSON.stringify(oIntentForService) })
                    .then(function (oResponse) {
                        if (oResponse.status < 200 || oResponse.status >= 300) {
                            return Promise.reject("HTTP request to GraphQL service failed with status: " + oResponse.status + " - " + oResponse.statusText);
                        }
                        return JSON.parse(oResponse.responseText);
                    })
                    .then(function (oResponseData) {
                        var oData = oResponseData.value || oResponseData;
                        var sUrl = Array.isArray(oData) ? oData[0].url : oData.url;
                        return {
                            additionalInformation: "",
                            url: sUrl,
                            applicationType: "URL",
                            navigationMode: "newWindow"
                        };
                    });
            }.bind(this));
    };
    return NavTargetResolutionAdapter;
}, /* bExport= */ false);
