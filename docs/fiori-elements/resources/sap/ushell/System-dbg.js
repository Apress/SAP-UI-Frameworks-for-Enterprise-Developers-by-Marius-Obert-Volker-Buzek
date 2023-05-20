// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The <code>sap.ushell.System</code> object with related functions.
 */
sap.ui.define([], function () {
    "use strict";

    /**
     * Constructs a new system object representing a system used in the Unified Shell.
     *
     * @param {object} oData An object containing the system data
     * @param {string} oData.alias The unique system alias such as <code>'ENTERPRISE_SEARCH'</code>.
     * @param {string} oData.baseUrl The server relative base URL of this system such as <code>'/ENTERPRISE_SEARCH'</code>.
     *   <b>Note:</b> This has to correspond to an SAP Web Dispatcher routing rule.
     * @param {string} oData.platform The system platform such as <code>'abap'</code> or <code>'hana'</code>.
     * @class A representation of a system
     * @since 1.15.0
     * @public
     * @alias sap.ushell.System
     */
    var System = function (oData) {
        this._oData = oData;
    };

    /**
     * Returns this system's alias.
     *
     * @returns {string} this system's alias
     * @since 1.15.0
     */
    System.prototype.getAlias = function () {
        return this._oData.alias;
    };

    /**
     * Returns this system's base URL.
     *
     * @returns {string} this system's base URL
     * @since 1.15.0
     */
    System.prototype.getBaseUrl = function () {
        return this._oData.baseUrl;
    };

    /**
     * Returns this system's client.
     *
     * @returns {string} this system's client
     * @since 1.15.0
     */
    System.prototype.getClient = function () {
        return this._oData.client;
    };

    /**
     * Returns this system's client role. The client role indicates whether the system is a development, quality or test, or productive system.
     *
     * @returns {string} This system's client role or undefined if no ABAP front-end server is used.
     * @since 1.66.0
     * @deprecated since 1.86. Please use {@link #getTenantRole} instead.
     */
    System.prototype.getClientRole = function () {
        return this._oData.clientRole;
    };

    /**
     * Returns this system's name.
     *
     * @returns {string} this system's name
     * @since 1.15.0
     * @deprecated since 1.86. Please use {@link #getSystemName} instead.
     */
    System.prototype.getName = function () {
        return this._oData.system;
    };

    /**
     * Returns this system's platform.
     *
     * @returns {string} this system's platform ("abap", "hana" etc.)
     * @since 1.15.0
     */
    System.prototype.getPlatform = function () {
        return this._oData.platform;
    };

    /**
     * Returns this system's product version.
     *
     * @returns {string} This system's product version or undefined if no ABAP front-end server is used.
     * @since 1.66.0
     */
    System.prototype.getProductVersion = function () {
        return this._oData.productVersion;
    };

    /**
     * Returns this system's product name.
     *
     * @returns {string} This system's product name
     *  defined in services/Container/adapter/config/systemProperties/productName in configuration
     * @since 1.85.0
     */
    System.prototype.getProductName = function () {
        return this._oData.productName;
    };

    /**
     * Returns this system's system name.
     *
     * @returns {string} This system's system name
     *  defined in services/Container/adapter/config/systemProperties/systemName in configuration
     * @since 1.86.0
     */
    System.prototype.getSystemName = function () {
        return this._oData.systemName;
    };

    /**
     * Returns this system's system role.
     *
     * @returns {string} This system's system role
     *  defined in services/Container/adapter/config/systemProperties/systemRole in configuration
     * @since 1.86.0
     */
    System.prototype.getSystemRole = function () {
        return this._oData.systemRole;
    };

    /**
     * Returns this system's tenant role.
     *
     * @returns {string} This system's tenant role
     *  defined in services/Container/adapter/config/systemProperties/tenantRole in configuration
     * @since 1.86.0
     */
    System.prototype.getTenantRole = function () {
        return this._oData.tenantRole;
    };

    /**
     * Returns whether this is a trial system
     * This is most likely not set by all platforms.
     * Defaults to false if not set
     *
     * @returns {boolean} True if the system is a trial system
     * @since 1.62.0
     */
    System.prototype.isTrial = function () {
        return !!this._oData.isTrialSystem;
    };

    /**
     * Adjusts the given URL so that it will be passed to this system.
     *
     * @param {string} sUrl the URL (which must be server-absolute)
     * @returns {string} the adjusted URL
     * @since 1.15.0
     */
    System.prototype.adjustUrl = function (sUrl) {
        if (sUrl.indexOf("/") !== 0 || sUrl === "/") {
            throw new Error("Invalid URL: " + sUrl);
        }
        if (this._oData.baseUrl === ";o=") {
            if (this._oData.alias) {
                sUrl = sUrl + ";o=" + this._oData.alias;
            }
        } else if (this._oData.baseUrl) {
            sUrl = this._oData.baseUrl.replace(/\/$/, "") + sUrl;
        }
        if (this._oData.client) {
            sUrl += (sUrl.indexOf("?") >= 0 ? "&" : "?") + "sap-client=" + this._oData.client;
        }
        return sUrl;
    };

    System.prototype.toString = function () {
        return JSON.stringify(this._oData);
    };

    return System;
}, /* bExport= */ true);
