// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The extensions which plugins can use to customise the launchpad
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/services/_PluginManager/HeaderExtensions",
    "sap/ushell/services/_PluginManager/MenuExtensions"

], function (HeaderExtensions, fnMenuExtensions) {
    "use strict";

    var O_AVAILABLE_EXTENSIONS = {
        Header: getHeaderExtensions,
        Menu: getMenuExtensions
    };

    /**
     * Resolves to the MenuExtensions, which allow modifying menu entries at runtime.
     *
     * @param {string} pluginName The plugin name.
     * @returns {Promise<sap.ushell.services._PluginManager.MenuExtensions>}
     *    The API to update managed menu trees.
     *
     * @private
     * @since 1.85
     */
    function getMenuExtensions (pluginName) {
        return Promise.resolve(fnMenuExtensions(pluginName));
    }

    /**
     * Get the HeaderExtensions object, which contains all possible
     * customisazion methods for the Shell Header.
     *
     * @returns {Promise<sap.ushell.services._PluginManager.HeaderExtensions>}
     *    The API to customise the ShellHeader.
     *
     * @private
     * @since 1.63
     */
    function getHeaderExtensions () {
        // When ShellHeader will be implemented as standalone, need to add some listener and resolve when header is ready
        return Promise.resolve(HeaderExtensions);
    }

    function getExtensions (sPluginName, sExtensionName) {
        var fnExtensionFactory = O_AVAILABLE_EXTENSIONS[sExtensionName];
        if (!fnExtensionFactory) {
            return Promise.reject("Unsupported extension: '" + sExtensionName + "'");
        }
        return fnExtensionFactory(sPluginName);
    }

    return getExtensions;
});
