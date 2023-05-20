// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's container adapter for standalone demos.
 *
 * @version 1.113.0
 */
/**
 * @namespace Default namespace for Unified Shell adapters for standalone demos. They can usually
 * be placed directly into this namespace, e.g.
 * <code>sap.ushell.adapters.local.ContainerAdapter</code>.
 *
 * @name sap.ushell.adapters.local
 * @see sap.ushell.adapters.local.ContainerAdapter
 * @since 1.15.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Configuration",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/System",
    "sap/ushell/User",
    "sap/ushell/utils"
], function (
    Log,
    ObjectPath,
    Configuration,
    jQuery,
    System,
    User,
    utils
) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.services.initializeContainer("local")</code>.
     * Constructs a new instance of the container adapter for standalone demos.
     *
     * @param {sap.ushell.System} oSystem
     *     the logon system (alias, platform, base URL)
     *
     * @class The Unified Shell's container adapter which does the bootstrap for standalone demos.
     *
     * @constructor
     * @see sap.ushell.services.initializeContainer
     * @since 1.15.0
     */
    var ContainerAdapter = function (oSystem, sParameter, oAdapterConfiguration) {
        var oUser;

        var oAdapterConfig = ObjectPath.create("config", oAdapterConfiguration);
        var oUserConfig = { // default values
            id: "DEFAULT_USER",
            firstName: "Default",
            lastName: "User",
            fullName: "Default User",
            accessibility: false,
            isJamActive: false,
            language: Configuration.getLanguage() || "en",
            bootTheme: {
                theme: "sap_fiori_3",
                root: ""
            },
            themeRoot: "/sap/public/bc/themes/",
            setAccessibilityPermitted: true,
            setThemePermitted: true,
            isLanguagePersonalized: false,
            setContentDensityPermitted: true,
            trackUsageAnalytics: null
        };

        for (var sKey in oAdapterConfig) {
            if (oAdapterConfig.hasOwnProperty(sKey)) {
                oUserConfig[sKey] = oAdapterConfig[sKey];
            }
        }

        // recreate the system object to add system related properties
        oSystem = new System({
            alias: oSystem.getAlias(),
            platform: oSystem.getPlatform(),
            productName: ObjectPath.get("systemProperties.productName", oAdapterConfig),
            productVersion: ObjectPath.get("systemProperties.productVersion", oAdapterConfig),
            systemName: ObjectPath.get("systemProperties.systemName", oAdapterConfig),
            systemRole: ObjectPath.get("systemProperties.systemRole", oAdapterConfig),
            tenantRole: ObjectPath.get("systemProperties.tenantRole", oAdapterConfig)
        });

        /**
         * Returns the logon system.
         *
         * @returns {sap.ushell.System}
         *     object providing information about the system where the container is logged in
         *
         * @since 1.15.0
         */
        this.getSystem = function () {
            return oSystem;
        };

        /**
         * Returns the logged-in user.
         *
         * @returns {sap.ushell.User}
         *      object providing information about the logged-in user
         *
         * @since 1.15.0
         */
        this.getUser = function () {
            return oUser;
        };

        /**
         * Instructs the platform/backend system to keep the session alive.
         *
         * @since 1.48.0
         */
        this.sessionKeepAlive = function () {
            console.warn("Demo container adapter sessionKeepAlive called");
        };

        /**
         * Does the bootstrap for the demo platform (and loads the container's configuration).
         *
         * @returns {jQuery.Deferred}
         *     a promise that is resolved once the bootstrap is done
         *
         * @since 1.15.0
         */
        this.load = function () {
            var oDeferredLoad = new jQuery.Deferred();

            if (oAdapterConfig && typeof oAdapterConfig.setUserCallback === "string") {
                // enables a delayed setting of the displayed user name
                var oDeferredUserCallback = new jQuery.Deferred();
                var aUserCallbackNamespace = oAdapterConfig.setUserCallback.split(".");
                var sUserCallback = aUserCallbackNamespace.pop();
                var oUserCallback;
                if (aUserCallbackNamespace.length === 0) {
                    oUserCallback = window;
                } else {
                    oUserCallback = ObjectPath.get(aUserCallbackNamespace.join("."));
                }
                if (oUserCallback && typeof oUserCallback[sUserCallback] === "function") {
                    oUserCallback[sUserCallback](oDeferredUserCallback);
                } else {
                    throw new utils.Error("ContainerAdapter local platform: Cannot execute setUserCallback - " +
                        oAdapterConfig.setUserCallback);
                }
                oDeferredUserCallback.done(function (oUserNames) {
                    ["id", "firstName", "lastName", "fullName"].forEach(function (val) {
                        if (oUserNames[val] && typeof oAdapterConfig.setUserCallback !== "function") {
                            oUserConfig[val] = oUserNames[val];
                        }
                    });
                    oUser = new User(oUserConfig);
                    oDeferredLoad.resolve();
                });
            } else {
                oUser = new User(oUserConfig);
                oDeferredLoad.resolve();
            }
            return oDeferredLoad.promise();
        };

        /**
         * Logs out the current user from this adapter's systems backend system.
         *
         * @param {boolean} bLogonSystem
         *      <code>true</code> if this system is the logon system
         * @returns {jQuery.Deferred}
         *      a <code>jQuery.Deferred</code> object's promise to be resolved when logout is
         *      finished, even when it failed
         * @since 1.15.0
         * @public
         */
        this.logout = function (bLogonSystem) {
            Log.info("Demo system logged out: " + oSystem.getAlias(), null,
                "sap.ushell.adapters.local.ContainerAdapter");
            utils.reload();
            return (new jQuery.Deferred()).resolve().promise();
        };
    };


    return ContainerAdapter;

}, /* bExport= */ false);
