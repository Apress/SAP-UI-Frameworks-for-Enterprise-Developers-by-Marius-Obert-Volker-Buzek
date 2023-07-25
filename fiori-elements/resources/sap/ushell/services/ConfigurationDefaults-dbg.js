// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's Configuration Defaults service exposes default configurations set in the code base.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/bootstrap/common/common.create.configcontract.core"
], function (Log, CommonConfigureConfigcontract) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("ConfigurationDefaults").then(function (ConfigurationDefaults) {});</code>.
     * Constructs a new Configuration service.
     *
     * @name sap.ushell.services.ConfigurationDefaults
     *
     * @param {object} oAdapter The service adapter for the ConfigurationDefaults service
     *
     * @constructor
     * @since 1.70.0
     * @see sap.ushell.services.Container#getServiceAsync
     * @private
     */
    function ConfigurationDefaults (oAdapter) {
        var oDefaultUshellConfiguration = CommonConfigureConfigcontract.getDefaultConfiguration();

        /**
         * @param {string[]} aConfigurationPaths Array of configuration paths to get the defaults for, like
         * <pre>
         * [
         *     "renderers/fiori2/componentData/config/enableRecentActivity",
         *     "a/b/c"
         * ]
         * </pre>
         *
         * @returns {Promise} A promise which returning an object when resolved. That object contains the defaults under the path string:
         * <pre>
         * {
         *     "renderers/fiori2/componentData/config/enableRecentActivity": {
         *         defaultValue: true
         *     },
         *     "a/b/c": undefined
         * }
         * </pre>
         * If the configuration path was not found in the default settings, undefined value for this path is returned.
         * @private
         * @alias  sap.ushell.services.Configuration#attachSizeBehaviorUpdate
         */
        this.getDefaults = function (aConfigurationPaths) {
            var that = this;
            return oAdapter.getDefaultConfig()
                .then(function (oDefaultConfig) {
                    var aResult = aConfigurationPaths.reduce(function (oDefaultsResult, sPath) {
                        var oResolvedDefaults;
                        if (that._isValidConfigPath(sPath)) {
                            var aPath = sPath.split("/"),
                                sPropertyName = aPath.pop(),
                                oObject = oDefaultConfig;

                            for (var i = 0; i < aPath.length && oObject; i++) {
                                oObject = oObject[aPath[i]];
                            }
                            if (oObject && oObject.hasOwnProperty(sPropertyName)) {
                                oResolvedDefaults = {
                                    defaultValue: oObject[sPropertyName]
                                };
                            } else if (oDefaultUshellConfiguration.hasOwnProperty(sPath)) {
                                oResolvedDefaults = {
                                    defaultValue: oDefaultUshellConfiguration[sPath]
                                };
                            }
                        }
                        if (oResolvedDefaults && oResolvedDefaults.hasOwnProperty("defaultValue") && typeof oResolvedDefaults.defaultValue === "undefined") {
                            oResolvedDefaults.defaultValue = null;
                        }
                        oDefaultsResult[sPath] = oResolvedDefaults;
                        return oDefaultsResult;
                    }, {});
                    return Promise.resolve(aResult);
                });
        };
    }

    ConfigurationDefaults.prototype._isValidConfigPath = function (sPath) {
        if (!sPath || typeof sPath !== "string") {
            Log.warning("Configuration path should be string");
            return false;
        }
        if (sPath.length === 0) {
            Log.warning("Configuration path can not be empty string");
            return false;
        }
        if (sPath.charAt(0) === "/") {
            Log.warning("Configuration path should not start with '/': " + sPath);
            return false;
        }

        return true;
    };

    ConfigurationDefaults.hasNoAdapter = false;
    return ConfigurationDefaults;
});
