// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview ClientSideTargetResolutionAdapter for the CDM platform.
 *
 * The ClientSideTargetResolutionAdapter must perform the following two task:
 * <ul>
 * <li>provide the getInbounds method to return the list of Target Mappings used by ClientSideTargetResolution service;</li>
 * <li>provide the resolveHashFragment function, a fallback method called by ClientSideTargetResolution service.</li>
 * </ul>
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/util/Version",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/deepExtend",
    "sap/base/Log"
], function (Version, jQuery, fnDeepExtend, Log) {
    "use strict";

    /**
     * Constructs a new instance of the ClientSideTargetResolutionAdapter for
     * the CDM platform.
     *
     * @param {object} oSystem
     *   The system served by the adapter
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oAdapterConfig
     *   A potential adapter configuration
     *
     * @constructor
     *
     * @private
     */

    var ClientSideTargetResolutionAdapter = function (oSystem, sParameters, oAdapterConfig) {
        this._oAdapterConfig = oAdapterConfig && oAdapterConfig.config;
        var oContainer = sap.ushell.Container,
            sProductName = "";

        if (oContainer) {
            sProductName = oContainer.getLogonSystem().getProductName() || "";
        }

        /*
         * Hardcoded for the time being, we should be able to resolve the local
         * system alias via OData call in the future.
         */
        this._oLocalSystemAlias = {
            http: {
                host: "", // empty host and 0 port generate relative URLs.
                port: 0,
                pathPrefix: "/sap/bc/"
            },
            https: {
                host: "",
                port: 0,
                pathPrefix: "/sap/bc/"
            },
            rfc: {
                systemId: "",
                host: "",
                service: 0,
                loginGroup: "",
                sncNameR3: "",
                sncQoPR3: ""
            },
            id: "",
            label: "local",
            client: "",
            language: "",
            properties: {
                productName: sProductName
            }
        };

        /**
         * Produces a list of Inbounds suitable for ClientSideTargetResolution.
         *
         * @returns {jQuery.Deferred.Promise}
         *   a jQuery promise that resolves to an array of Inbounds in
         *   ClientSideTargetResolution format.
         * <p>
         * NOTE: the same promise is returned if this method is called multiple
         * times. Therefore this method can be safely called multiple times.
         * </p>
         * @private
         */
        this.getInbounds = function () {
            var that = this;

            if (!this._getInboundsDeferred) {
                this._getInboundsDeferred = new jQuery.Deferred();

                sap.ushell.Container.getServiceAsync("CommonDataModel")
                    .then(function (oService) {
                        return oService.getSiteWithoutPersonalization();
                    })
                    .then(function (oSite) {
                        // Process utilsCDM module version as needed by FLP site version
                        var sUtilsCdmModule = (oSite._version && Version(oSite._version).getMajor() === 3) ?
                            "sap/ushell/adapters/cdm/v3/utilsCdm" : "sap/ushell/utils/utilsCdm";
                        sap.ui.require([sUtilsCdmModule], function (oUtilsCdm) {
                            // Resolve inbounds
                            var aInbounds = oUtilsCdm.formatSite(oSite) || [];
                            that._getInboundsDeferred.resolve(aInbounds);
                        });
                    }, function (oErr) {
                        that._getInboundsDeferred.reject(oErr);
                    });
            }

            return this._getInboundsDeferred.promise();
        };

        this._createSIDMap = function (oAliases) {
            return Object.keys(oAliases)
                .sort()
                .reduce(function (oSIDMapping, sId) {
                    var oCurrentAlias = oAliases[sId];
                    var sSid = "SID(" + oCurrentAlias.systemId + "." + oCurrentAlias.client + ")";
                    if (!oSIDMapping.hasOwnProperty(sSid) && oCurrentAlias.hasOwnProperty("systemId") && oCurrentAlias.hasOwnProperty("client")) {
                        oSIDMapping[sSid] = sId;
                    }
                    return oSIDMapping;
                }, {});
        };

        this._getSystemAliases = function () {
            var that = this;

            if (!this.oSystemAliasesDeferred) {
                this.oSystemAliasesDeferred = new jQuery.Deferred();

                sap.ushell.Container.getServiceAsync("CommonDataModel")
                    .then(function (oService) {
                        return oService.getSiteWithoutPersonalization();
                    })
                    .then(function (oSite) {
                        var oSystemAliases = fnDeepExtend({}, oSite.systemAliases || {});

                        // propagate id in system alias
                        Object.keys(oSystemAliases).forEach(function (sId) {
                            oSystemAliases[sId].id = sId;
                        });

                        that.oSystemAliasesDeferred.resolve(oSystemAliases);
                    }, function (oErr) {
                        that.oSystemAliasesDeferred.reject(oErr);
                    });
            }

            return this.oSystemAliasesDeferred.promise();
        };

        /**
         * Resolves a specific system alias.
         *
         * @param {string} sSystemAlias
         *    the system alias name to be resolved
         *
         * @return {jQuery.Deferred.Promise}
         *    a jQuery promise that resolves to a system alias data object.
         *    A live object is returned! The service must not change it.
         *    If the alias could not be resolved the promise is rejected.
         *
         *    Format of system alias data object. Example:
         *    <pre>{
         *        id: "AB1CLNT000",
         *        client: "000",
         *        language: "EN",
         *        http: {
         *            host: "ldcab1.xyz.com",
         *            port: 10000,
         *            pathPrefix: "/abc/def/"
         *        },
         *        https: {
         *            host: "ldcab1.xyz.com",
         *            port: 20000,
         *            pathPrefix: "/abc/def/"
         *        },
         *        rfc: {
         *            systemId: "AB1",
         *            host: "ldcsab1.xyz.com",
         *            port: 0,
         *            loginGroup: "PUBLIC",
         *            sncNameR3: "",
         *            sncQoPR3: "8"
         *        }
         *    }</pre>
         *
         * @private
         */
        this.resolveSystemAlias = function (sSystemAlias) {
            var oDeferred = new jQuery.Deferred(),
                that = this;

            this._getSystemAliases().done(function (oSystemAliases) {
                var sMessage, oSystemAlias;
                // 1. check if system Alias is in the Map returned in the first place
                if (oSystemAliases.hasOwnProperty(sSystemAlias)) {
                    oSystemAlias = oSystemAliases[sSystemAlias];
                    if (sSystemAlias === "") {
                        oSystemAlias.properties = fnDeepExtend({}, that._oLocalSystemAlias.properties, oSystemAlias.properties || {});
                    }
                    oDeferred.resolve(oSystemAlias);
                    return;
                }
                // 2. fallback to home alias if empty string and no custom home alias in site
                if (sSystemAlias === "") {
                    oDeferred.resolve(that._oLocalSystemAlias);
                    return;
                }
                // 3. if it is a SID try to find it in the SID mapping
                sSystemAlias = sSystemAlias.toUpperCase(sSystemAlias);
                if (!that._oSIDMap) {
                    that._oSIDMap = that._createSIDMap(oSystemAliases);
                }
                if (that._oSIDMap.hasOwnProperty(sSystemAlias)) {
                    var oMatchedAlias = oSystemAliases[that._oSIDMap[sSystemAlias]];
                    oDeferred.resolve(oMatchedAlias);
                    return;
                }
                // Alias not found. Log and reject!
                sMessage = "Cannot resolve system alias " + sSystemAlias;
                Log.warning(
                    sMessage,
                    "The system alias cannot be found in the site response",
                    "sap.ushell.adapters.cdm.ClientSideTargetResolutionAdapter"
                );
                oDeferred.reject(sMessage);
            }).fail(function (oErr) {
                oDeferred.reject(oErr);
            });

            return oDeferred.promise();
        };

        /**
         * Method returns the lookup object of content providers and compatible/known data origins
         *
         * @returns {jQuery.Deferred.Promise}
         *   a jQuery promise that resolves to an object of content providers
         *   with supported data origins
         *
         * @private
         *
         */
        this.getContentProviderDataOriginsLookup = function () {
            var that = this;

            if (!this.oContentProviderDataOriginsDeferred) {
                this.oContentProviderDataOriginsDeferred = new jQuery.Deferred();

                sap.ushell.Container.getServiceAsync("CommonDataModel")
                    .then(function (oService) {
                        return oService.getSiteWithoutPersonalization();
                    })
                    .then(function (oSite) {
                        var oLookup = null;
                        if (oSite.contentProviderDataOrigins) {
                            oLookup = fnDeepExtend({}, oSite.contentProviderDataOrigins);
                        }
                        that.oContentProviderDataOriginsDeferred.resolve(oLookup);
                    }, function (oErr) {
                        that.oContentProviderDataOriginsDeferred.reject(oErr);
                    });
            }

            return this.oContentProviderDataOriginsDeferred.promise();
        };
    };
    return ClientSideTargetResolutionAdapter;
}, /* bExport= */ false);
