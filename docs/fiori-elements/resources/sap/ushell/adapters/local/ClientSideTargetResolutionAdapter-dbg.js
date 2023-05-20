// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's ClientSideTargetResolutionAdapter for the local
 *               platform.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], function (jQuery, Log) {
    "use strict";

    /**
     * @fileOverview
     * <p>Constructs a new instance of the ClientSideTargetResolutionAdapter for the local
     * platform.</p>
     *
     * <p>The adapter can deal with the pre 1.34 format for the NavTargetReolutionAdapter
     * {config: {applications: { ... }}}.
     * This format does not support features like parameters (apart from parameters in the URL),
     * parameter filtering, device types restrictions or system aliases.</p>
     *
     * <p>From 1.34 onwards it is recommended that a new format is used which is the
     * inbounds format of the app descriptor plus some additional structure for
     * system alias. This format has to be set as config for the ClientSideTargetResolutionAdapter.
     * All system aliases have to be defined in the respective section.</p>
     *
     * <p>Example:
     * <pre>
     * {
     *     "services": {
     *         "ClientSideTargetResolution": {
     *             {"config": {
     *                 "inbounds": {
     *                     ....
     *                  },
     *                  "systemAliases": {
     *                     "system1" : {
     *                         "protocol": ...,
     *                         "host": ...,
     *                         "port": ...,
     *                         "systemId": ...,
     *                         "client": ...,
     *                         "guiPort": ...,
     *                         "pathPrefix": ...,
     *                         "routeString": ...,
     *                         "loginGroup": ...,
     *                     },
     *                     "system2": {
     *                     ....
     *                     }
     *                 }
     *             }
     *         }
     *     }
     * }
     * </pre></p>
     *
     * <p><code>resolveHashFragmentFallback</code> is not implemented. The service can deal with that.
     *
     * @param {object} oSystem
     *   The system served by the adapter
     * @param {string} sParameters
     *   Parameter string, not in use
     * @param {object} oConfig
     *   A potential adapter configuration
     *
     * @constructor
     * @since 1.32.0
     * @private
     */
    var ClientSideTargetResolutionAdapter = function (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
        this._aInbounds = [];
        if (!this._oConfig) {
            this._oSystemAliases = {};
            Log.warning("No configuration supplied!", "",
                    "sap.ushell.adapters.local.ClientSideTargetResolutionAdapter");
        } else {
            if (this._oConfig.inbounds) {
                this._aInbounds = this._transformInboundsObjectToInboundsArray(this._oConfig.inbounds);
            }
            if (this._oConfig.applications) {
                Array.prototype.push.apply(this._aInbounds, this._transformApplicationsToInbounds(this._oConfig.applications));
            }
            if (this._aInbounds.length === 0) {
                Log.warning("Adapter got no inbounds via configuration!", "",
                        "sap.ushell.adapters.local.ClientSideTargetResolutionAdapter");
            }
            this._oSystemAliases = this._oConfig.systemAliases || {};
            Log.debug("Adapter got no system aliases via configuration", "",
                    "sap.ushell.adapters.local.ClientSideTargetResolutionAdapter");
        }
        var oContainer = sap.ushell.Container,
            sProductName = "";
        if (oContainer) {
            sProductName = oContainer.getLogonSystem().getProductName() || "";
        }
        this._oLocalSystemAlias = {
            http: {
                host: "",
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
    };

    /**
     * Produces a list of Inbounds suitable for ClientSideTargetResolution.
     *
     * @returns {jQuery.Deferred.Promise}
     *   a jQuery promise that resolves to an array of Inbounds in
     *   ClientSideTargetResolution format.
     *
     * @private
     * @since 1.34.0
     */
    ClientSideTargetResolutionAdapter.prototype.getInbounds = function () {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        setTimeout(function () {
            oDeferred.resolve(that._aInbounds);
        }, 0);
        return oDeferred.promise();
    };

    /**
     * Resolves a specific system alias.
     *
     * @param {string} sSystemAlias
     *    the system alias name to be resolved
     *
     * @return {jQuery.Deferred.Promise}
     *    a jQuery promise that resolves to an object containing the resolution result
     *    as described in the constructor's doc. If the alias could not be resolved an
     *    empty object is returned. The promise is never rejected.
     *
     * @private
     */
    ClientSideTargetResolutionAdapter.prototype.resolveSystemAlias = function (sSystemAlias) {
            var oDeferred = new jQuery.Deferred();

            setTimeout(function () {
                if (this._oSystemAliases.hasOwnProperty(sSystemAlias)) {
                    oDeferred.resolve(this._oSystemAliases[sSystemAlias]);

                } else if (sSystemAlias === "") {
                    oDeferred.resolve(this._oLocalSystemAlias);

                } else {
                    oDeferred.reject("No system alias value available");
                }

            }.bind(this), 0);
            return oDeferred.promise();
        };

    /**
     * Transforms the old applications format to Inbounds.
     *
     * @param {object} oApplications
     *   old appplications format
     * @returns {array}
     *   Inbounds
     *
     * @private
     * @since 1.34.0
     */
    ClientSideTargetResolutionAdapter.prototype._transformApplicationsToInbounds = function (oApplications) {
        var sIntentName,
            aInbounds = [],
            oApplication,
            oInbound,
            aIntentParts;
        function adjustApplicationType (sApplicationType, sUrl) {
            if (sApplicationType === "NWBC" && sUrl) {
                if (sUrl.indexOf("/~canvas;window=app/wda") >= 0) {
                    return "WDA";
                }
                /*
                 * There is no special reason the default is "TR" at this point,
                 * it's 50% chance the right type is chosen for NWBC
                 * applicationType.
                 */
                return "TR";
            }
            return sApplicationType;
        }
        for (sIntentName in oApplications) {
            if (oApplications.hasOwnProperty(sIntentName) && sIntentName.indexOf("_") !== 0) {
                oInbound = {};
                if (sIntentName.indexOf("-") > -1) {
                    aIntentParts = sIntentName.split("-", 2);
                    oInbound.semanticObject = aIntentParts[0];
                    oInbound.action = aIntentParts[1];
                } else if (sIntentName === "") {
                    // default intent
                    oInbound.semanticObject = "";
                    oInbound.action = "";
                } else {
                    // non empty intent without -
                    Log.warning("Excluded syntactically incorrect intent '" + sIntentName + "' from inbounds array", "",
                    "sap.ushell.adapters.local.ClientSideTargetResolutionAdapter");
                    continue;
                }
                oApplication = oApplications[sIntentName];
                oInbound.title = oApplication.description || "";
                // No deviceTypes --> all device types are okay
                // signature
                oInbound.signature = { parameters: {} };
                // additional parameters
                oInbound.signature.additionalParameters = "allowed"; //allow them by default
                // resolutionResult
                oInbound.resolutionResult = {};
                // transform legacy type NWBC to TR or WDA
                oInbound.resolutionResult.applicationType = adjustApplicationType(oApplication.applicationType, oApplication.url);
                oInbound.resolutionResult.additionalInformation = oApplication.additionalInformation || "";
                if (oInbound.resolutionResult.additionalInformation &&
                    oInbound.resolutionResult.additionalInformation.indexOf("SAPUI5.Component=") !== -1) {
                    oInbound.resolutionResult.applicationType = "SAPUI5";
                    oInbound.resolutionResult.ui5ComponentName =
                        oInbound.resolutionResult.additionalInformation.split("SAPUI5.Component=", 2)[1];
                    // If the application already passes the dependencies, then use that
                    if (oApplication.applicationDependencies) {
                        oInbound.resolutionResult.applicationDependencies = oApplication.applicationDependencies;
                    } else {
                        // Can additionaInformation contain something trailing the UI5 component?
                        oInbound.resolutionResult.applicationDependencies = {
                            self: { name: oInbound.resolutionResult.ui5ComponentName },
                            asyncHints: {
                                libs: [
                                    { name: "sap.ui.core" },
                                    { name: "sap.ui.unified" }
                                ]
                            }
                        };
                    }
                }
                oInbound.resolutionResult.url = oApplication.url;
                aInbounds.push(oInbound);
            }
        }
        return aInbounds;
    };

    /**
     * Transforms the Inbounds object to the array needed for getInbounds.
     *
     * @param {object} oInbounds
     *   Inbounds as an object
     * @returns {array}
     *   Inbounds as an array
     *
     * @private
     * @since 1.34.0
     */
    ClientSideTargetResolutionAdapter.prototype._transformInboundsObjectToInboundsArray = function (oInbounds) {
        var sIntentName,
            aInbounds = [],
            oInbound;

        for (sIntentName in oInbounds) {
            if (oInbounds.hasOwnProperty(sIntentName)) {
                oInbound = oInbounds[sIntentName];
                if (oInbound.resolutionResult.additionalInformation &&
                    oInbound.resolutionResult.additionalInformation.indexOf("SAPUI5.Component=") !== -1) {
                    oInbound.resolutionResult.ui5ComponentName =
                        oInbound.resolutionResult.additionalInformation.split("SAPUI5.Component=", 2)[1];
                    // Can additionaInformation contain something trailing the UI5 component?
                    if (!oInbound.resolutionResult.hasOwnProperty("applicationDependencies")) {
                        oInbound.resolutionResult.applicationDependencies = {
                            self: { name: oInbound.resolutionResult.ui5ComponentName },
                            asyncHints: {
                                libs: [
                                    { name: "sap.ui.core" },
                                    { name: "sap.ui.unified" }
                                ]
                            }
                        };
                    }
                }
                aInbounds.push(oInbounds[sIntentName]);
            }
        }
        return aInbounds;
    };

    return ClientSideTargetResolutionAdapter;
}, false);
