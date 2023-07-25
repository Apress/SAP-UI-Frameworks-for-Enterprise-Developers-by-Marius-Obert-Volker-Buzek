// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper for accessing application data for the 'CDM' platform.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/util/ObjectPath"
], function (
    ObjectPath
) {
    "use strict";

    var readApplications = {};

    /**
     * Returns the application's id
     * @param {object} oApplication The application
     * @returns {string} The application's id or undefined if not present
     *
     * @private
     * @since 1.77.0
     */
    readApplications.getId = function (oApplication) {
        return ObjectPath.get(["sap.app", "id"], oApplication);
    };

    /**
     * Returns the application's title
     * @param {object} oApplication The application
     * @returns {string} The application's title or undefined if not present
     *
     * @private
     * @since 1.77.0
     */
    readApplications.getTitle = function (oApplication) {
        return ObjectPath.get(["sap.app", "title"], oApplication);
    };

    /**
     * Returns the application's subtitle
     * @param {object} oApplication The application
     * @returns {string} The application's subtitle or undefined if not present
     *
     * @private
     * @since 1.77.0
     */
    readApplications.getSubTitle = function (oApplication) {
        return ObjectPath.get(["sap.app", "subTitle"], oApplication);
    };

    /**
     * Returns the application's icon
     * @param {object} oApplication The application
     * @returns {string} The application's icon or undefined if not present
     *
     * @private
     * @since 1.77.0
     */
    readApplications.getIcon = function (oApplication) {
        return ObjectPath.get(["sap.ui", "icons", "icon"], oApplication);
    };

    /**
     * Returns the application's info
     * @param {object} oApplication The application
     * @returns {string} The application's info or undefined if not present
     *
     * @private
     * @since 1.77.0
     */
    readApplications.getInfo = function (oApplication) {
        return ObjectPath.get(["sap.app", "info"], oApplication);
    };

    /**
     * Returns the application's keywords
     * @param {object} oApplication The application
     * @returns {string} The application's keywords or undefined if not present
     *
     * @private
     * @since 1.77.0
     */
    readApplications.getKeywords = function (oApplication) {
        return ObjectPath.get(["sap.app", "tags", "keywords"], oApplication);
    };

    /**
     * Returns the application's contentProviderId
     * @param {object} oApplication The application
     * @returns {string} The application's keywords or undefined if not present
     *
     * @private
     * @since 1.79.0
     */
    readApplications.getContentProviderId = function (oApplication) {
        return ObjectPath.get(["sap.app", "contentProviderId"], oApplication);
    };

    /**
     * Returns the application's inbounds
     * @param {object} oApplication The application
     * @returns {object} The application's inbounds or undefined if not present
     *
     * @since 1.77.0
     * @private
     */
    readApplications.getInbounds = function (oApplication) {
        return ObjectPath.get(["sap.app", "crossNavigation", "inbounds"], oApplication);
    };

    /**
     * Returns a specific inbound of an application
     * @param {object} oApplication The application
     * @param {string} sInboundId The id of the inbound
     * @returns {string} The application's inbound or undefined if not present
     *
     * @since 1.77.0
     * @private
     */
    readApplications.getInbound = function (oApplication, sInboundId) {
        return ObjectPath.get(["sap.app", "crossNavigation", "inbounds", sInboundId], oApplication);
    };

    /**
     * Returns the target of an inbound
     *
     * @param {object} oApplications Applications
     * @param {object} sAppId The app id
     * @param {object} sInboundId The inbound id
     * @returns {object} The target of an inbound or undefined if not present
     *
     * @since 1.78.0
     * @private
     */
    readApplications.getInboundTarget = function (oApplications, sAppId, sInboundId) {
        var oApplication = ObjectPath.get([sAppId], oApplications) || {};
        var oInbound = this.getInbound(oApplication, sInboundId);

        if (!oApplication || !oInbound) {
            return;
        }

        return {
            semanticObject: oInbound.semanticObject,
            action: oInbound.action
        };
    };

    return readApplications;
});
