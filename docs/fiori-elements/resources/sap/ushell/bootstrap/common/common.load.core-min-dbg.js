// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * This module provides a function <code>load</code> for loading the core-min-x resource bundles.
 * Besides that <code>loaded</code> indicates if core-min bundles have been loaded - or not.
 */
sap.ui.define([
    "./common.debug.mode",
    "./common.load.script"
], function (oDebugMode, oScriptLoader) {
    "use strict";

    var coreMinLoader = {};

    /**
     * Load the <em>coreResources</em> bundles by adding the script tags to the head.
     * If debug mode is switched on, this method performs a regular boot of the UI5 core.
     *
     * @param {Object} oPreloadBundleConfig The preload bundle configuration.
     * @param {Boolean} [oPreloadBundleConfig.enabled = true] If set to <code>false</code>,
            the custom preload bundles are not used
     * @param {String[]} [oPreloadBundleConfig.coreResources] The resources containing the initially needed
            modules and the UI5 core; the resource path is resolved by standard UI5 loader logic; must contain
            the .js file extension
     *
     * @private
     */
    coreMinLoader.load = function (oPreloadBundleConfig) {
        var aCoreResources;

        if (typeof (oPreloadBundleConfig) !== "object") {
            //  bundle config is mandatory for cdm bootstrap - fail fast
            throw new Error("Mandatory preload bundle configuration is not provided");
        }

        if (oDebugMode.isDebug()) {
            // If pure debug mode is turned on (sap-ui-debug=(true|x|X)), it's only
            // needed to require the Core and boot the core because the minified preload
            // modules should be loaded with the single -dbg versions.
            sap.ui.require(["sap/ui/core/Core"], function (core) {
                core.boot();
            });
        }

        if (oPreloadBundleConfig.enabled === false) {
            throw new Error("Disabling the custom preload bundles is not yet supported");
        }

        aCoreResources = oPreloadBundleConfig && oPreloadBundleConfig.coreResources || [];
        aCoreResources.forEach(function (sBundleName) {
            oScriptLoader.loadScript(sap.ui.require.toUrl(sBundleName));
        });
    };

    return coreMinLoader;
});
