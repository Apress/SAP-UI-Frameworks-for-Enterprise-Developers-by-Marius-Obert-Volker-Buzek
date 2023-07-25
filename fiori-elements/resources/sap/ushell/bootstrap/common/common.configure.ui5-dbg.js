// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "./common.load.launchpad",
    "./common.read.ui5theme.from.config"
], function (
    Log,
    fnLoadLaunchpadContent,
    fnGetUi5theme
) {
    "use strict";

    /**
     * Given a map of settings, this functions applies UI5 relevant settings and registers FLP bootstrap.
     *
     * This module allows to configure SAPUI5 via the bootstrap configuration. Several properties are static,
     * the rest is dynamic as described in the oSettings parameter:
     * @param {object} oSettings A collection of settings
     * @param {string} oSettings.platform - the platform to boot the shell with
     * @param {object} oSettings.libs - the libraries to configure UI5 with
     * @param {object} oSettings.ushellConfig - the ushell configuration object
     * @param {string} [oSettings.theme] - the theme to boot UI5 with, if not provided the theme from ushell config is used
     * @param {function} [oSettings.bootTask] - the function to bind to the boottask of UI5
     * @param {function} [oSettings.onInitCallback] - the function to bind to the UI5 CORE onInit event
     *
     * @returns {function} this functions applies UI5 relevant settings.
     * @private
     */
    function configureUI5 (oSettings) {
        if (!oSettings || !oSettings.libs || !Array.isArray(oSettings.libs)) {
            Log.error("Mandatory settings object not provided", null, "sap/ushell/bootstap/common/common.configure.ui5");
            return {};
        }

        var oSAPUIConfig = window["sap-ui-config"] || (window["sap-ui-config"] = {});
        var sPlatform = oSettings && oSettings.platform;
        var oPlatformAdapters = oSettings && oSettings.platformAdapters;
        var oUshellConfig = oSettings.ushellConfig;
        var sUi5Theme = oSettings.theme ? oSettings.theme : fnGetUi5theme(oUshellConfig).theme; // fallback theme if no user-specific or default theme is defined

        if (oUshellConfig && oUshellConfig.modulePaths) {
            var oModules = Object.keys(oUshellConfig.modulePaths).reduce(function (result, sModulePath) {
                result[sModulePath.replace(/\./g, "/")] = oUshellConfig.modulePaths[sModulePath];
                return result;
            }, {});
            sap.ui.loader.config({
                paths: oModules
            });
        }

        /*
         * When UI5 Core is read:
         * 1) Execute onInit callback, given in sap-ui-bootstrap
         * 2) Bootstrap ushell
         * 3) Load FLP content etc.
         */
        var bootOnInit = oSAPUIConfig.oninit;
        oSAPUIConfig.oninit = function () {
            // See also Core.prototype._executeOnInit
            if (typeof bootOnInit === "string") {
                var aResult = /^module:((?:[_$.\-a-zA-Z0-9]+\/)*[_$.\-a-zA-Z0-9]+)$/.exec(bootOnInit);
                if (aResult && aResult[1]) {
                    sap.ui.require([aResult[1]]);
                } else {
                    Log.error("Given onInit module (" + bootOnInit + ") cannot be loaded.");
                }
            }
            sap.ui.require(["sap/ushell/Container"], function (/*Container for bootstrap*/) {
                window.sap.ushell.bootstrap(sPlatform, oPlatformAdapters).then(function () {
                    (oSettings.onInitCallback || fnLoadLaunchpadContent)();
                });
            });
        };

        oSAPUIConfig.preload = "async";
        oSAPUIConfig.compatversion = "edge";
        oSAPUIConfig.libs = oSettings.libs.join();
        oSAPUIConfig.theme = sUi5Theme;
        oSAPUIConfig["xx-boottask"] = oSettings.bootTask;

        if (oUshellConfig && oUshellConfig.ushell && oUshellConfig.ushell.verticalization
            && oUshellConfig.ushell.verticalization.activeTerminologies
            && oUshellConfig.ushell.verticalization.activeTerminologies.length > 0
        ) {
            oSAPUIConfig.activeterminologies = oUshellConfig.ushell.verticalization.activeTerminologies;
        }

        return oSAPUIConfig;
    }

    return configureUI5;
});
