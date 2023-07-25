// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview AppForInbound uses a navigation data inbound to resolve an CDM app reference of a CDM page.
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/base/Log"
], function (ObjectPath, Log) {
    "use strict";

    var AppForInbound = {};

    /**
     * Calculates a CDM app from an inbound.
     *
     * If the application type is unknown, an error message is written
     * and an exception is raised.
     *
     * @param {string} inboundPermanentKey Inbound permanent key.
     * @param {object} inbound Inbound definition.
     * @returns {object} CDM app.
     *
     * @since 1.75.0
     * @private
     */
    AppForInbound.get = function (inboundPermanentKey, inbound) {
        var oApplication = {};

        // Get a CDM app for all supported types
        switch (inbound.resolutionResult.applicationType) {
            case "SAPUI5":
                oApplication = this._getUI5App(inboundPermanentKey, inbound);
                break;
            case "TR":
                oApplication = this._getTRApp(inboundPermanentKey, inbound);
                break;
            case "WDA":
                oApplication = this._getWDAApp(inboundPermanentKey, inbound);
                break;
            case "URL":
                oApplication = this._getURLApp(inboundPermanentKey, inbound);
                break;
            case "WCF":
                oApplication = this._getWCFApp(inboundPermanentKey, inbound);
                break;
            default:
                Log.error("Unable to get CDM app for inbound: Application type '" + inbound.resolutionResult.applicationType
                    + "' of app '" + inboundPermanentKey + "' is unknown and not supported.");
                throw new Error("Unknown application type: " + inbound.applicationType);
        }

        // Attach system alias definition to CDM app if given
        if (inbound.resolutionResult.systemAlias) {
            ObjectPath.set(["sap.app", "destination"],
                { name: inbound.resolutionResult.systemAlias, semantics: "applied" }, oApplication);
        }

        return oApplication;
    };

    /**
     * Returns a CDM app object for a URL based inbound.
     *
     * @param {string} inboundPermanentKey Inbound permanent key.
     * @param {object} inbound Inbound definition.
     * @returns {object} CDM app.
     *
     * @since 1.75.0
     * @private
     */
    AppForInbound._getURLApp = function (inboundPermanentKey, inbound) {
        return {
            "sap.app": {
                id: inboundPermanentKey,
                crossNavigation: {
                    inbounds: {
                        "Shell-launchURL": {
                            semanticObject: "Shell",
                            action: "launchURL",
                            signature: {
                                parameters: {
                                    "sap-external-url": {
                                        required: true,
                                        filter: {
                                            value: inbound.resolutionResult.url,
                                            format: "plain"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "sap.ui": {
                technology: "URL",
                deviceTypes: inbound.deviceTypes
            },
            "sap.url": {
                uri: inbound.resolutionResult.url
            }
        };
    };

    /**
     * Returns a CDM app object for UI5 inbound.
     *
     * @param {string} inboundPermanentKey Inbound permanent key.
     * @param {object} inbound Inbound object.
     * @returns {object} CDM app.
     *
     * @since 1.75.0
     * @private
     */
    AppForInbound._getUI5App = function (inboundPermanentKey, inbound) {
        return {
            "sap.app": {
                id: inboundPermanentKey,
                title: inbound.resolutionResult.text,
                subTitle: inbound.resolutionResult.information,
                crossNavigation: {
                    inbounds: this._getApplicationInbound(inbound)
                }
            },
            "sap.ui5": {
                componentName: inbound.resolutionResult.ui5ComponentName
            },
            "sap.ui": {
                technology: "UI5",
                deviceTypes: inbound.deviceTypes
            },
            "sap.platform.runtime": {
                componentProperties: {
                    url: inbound.resolutionResult.url
                }
            }
        };
    };

    /**
     * Returns the inbounds section for the app.
     *
     * @param {object} inbound Inbound object
     * @returns {object} Inbound section for app.
     *
     * @since 1.75.0
     * @private
     */
    AppForInbound._getApplicationInbound = function (inbound) {
        var oApplicationInbound = {};

        oApplicationInbound[inbound.id] = {
            semanticObject: inbound.semanticObject,
            action: inbound.action,
            signature: inbound.signature
        };

        return oApplicationInbound;
    };

    /**
     * Returns a CDM app object for a transaction based inbound.
     *
     * @param {string} inboundPermanentKey Inbound permanent key.
     * @param {object} inbound Inbound object.
     * @returns {object} CDM app.

     * @since 1.75.0
     * @private
     */
    AppForInbound._getTRApp = function (inboundPermanentKey, inbound) {
        var sTransaction,
            aTransactionMatch = inbound.resolutionResult.url.match(/transaction=(.+?)[&?]/);

        if (aTransactionMatch) {
            sTransaction = aTransactionMatch[1];
        } else {
            Log.error("Unable to determine ABAP transaction from inbound URL of app '" + inboundPermanentKey + "': "
                + inbound.resolutionResult.url + ".");
        }

        return {
            "sap.app": {
                id: inboundPermanentKey,
                title: inbound.resolutionResult.text,
                subTitle: inbound.resolutionResult.information,
                crossNavigation: {
                    inbounds: this._getApplicationInbound(inbound)
                }
            },
            "sap.ui": {
                technology: "GUI",
                deviceTypes: inbound.deviceTypes
            },
            "sap.flp": {
                type: "application"
            },
            "sap.gui": {
                transaction: sTransaction
            }
        };
    };

    /**
     * Returns a CDM app object for a Web Dynpro ABAP inbound.
     *
     * @param {string} inboundPermanentKey Inbound permanent key.
     * @param {object} inbound Inbound object.
     * @returns {object} CDM app.
     *
     * @since 1.75.0
     * @private
     */
    AppForInbound._getWDAApp = function (inboundPermanentKey, inbound) {
        return {
            "sap.app": {
                id: inboundPermanentKey,
                title: inbound.resolutionResult.text,
                subTitle: inbound.resolutionResult.information,
                crossNavigation: {
                    inbounds: this._getApplicationInbound(inbound)
                }
            },
            "sap.ui": {
                technology: "URL",
                deviceTypes: inbound.deviceTypes
            },
            "sap.url": {
                uri: inbound.resolutionResult.url
            }
        };
    };

    /**
     * Returns a CDM app object for a Web Client Framework inbound.
     *
     * @param {string} inboundPermanentKey Inbound permanent key.
     * @param {object} inbound Inbound object.
     * @returns {object} CDM app.
     *
     * @since 1.75.0
     * @private
     */
    AppForInbound._getWCFApp = function (inboundPermanentKey, inbound) {
        return {
            "sap.app": {
                id: inboundPermanentKey,
                title: inbound.resolutionResult.text,
                subTitle: inbound.resolutionResult.information,
                crossNavigation: {
                    inbounds: this._getApplicationInbound(inbound)
                }
            },
            "sap.ui": {
                technology: "URL",
                deviceTypes: inbound.deviceTypes
            },
            "sap.url": {
                uri: inbound.resolutionResult.url
            }
        };
    };

    return AppForInbound;
});
