// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The extensions for the MenuBar, an interface to let plugins request menu entry providers.
 *
 * @version 1.113.0
 */
sap.ui.define([], function () {
    "use strict";

    /**
     * Wrapper function which receives the pluginName as an argument.
     * @param {string} pluginName The name of the plugin.
     * @returns {function} The getMenuEntryProvider function.
     *
     * @private
     * @since 1.85
     */
    function createGetMenuEntryProvider (pluginName) {
        /**
         * Returns a menu entry provider object which allows modifying the menu tree for the given node IDs.
         *
         * To be used in a plugin component as follows:
         * <pre><code>
         *     this.getComponentData().getExtensions("Menu").then(function (oMenuExtensions) {
         *         oMenuExtensions.getMenuEntryProvider(["node-1", "node-2"]).then(function (oEntryProvider) {
         *             oEntryProvider["node-1"].setData({ // Setter for the menu node with id:node-1
         *                 ... // your managed tree
         *             });
         *
         *             oEntryProvider["node-2"].setData({ // Setter for the menu node with id:node-2
         *                 ... // your managed tree
         *             });
         *         });
         *     });
         * </code></pre>
         *
         * The provided nodeIds
         * - must exist in the menu
         * - must not be managed by a different plugin already.
         *
         * It is not possible to change a menu entry/subtree that does not have an ID.
         *
         * Note: Do not modify properties of the top level (root) menu entries.
         * Such modifications lead to re-rendering of the menu with a visual flicker.
         *
         * @param {string[]} nodeIds A list of the nodeIds to modify.
         * @returns {Promise<Object.<string, function>>} A map with the nodeId as keys and the update functions as values.
         *
         * @private
         * @since 1.85
         */
        return function getMenuEntryProvider (nodeIds) {
            return sap.ushell.Container.getServiceAsync("Menu").then(function (menuService) {
                return menuService.getEntryProvider(pluginName, nodeIds);
            });
        };
    }

    return function (pluginName) {
        return {
            getMenuEntryProvider: createGetMenuEntryProvider(pluginName)
        };
    };
});
