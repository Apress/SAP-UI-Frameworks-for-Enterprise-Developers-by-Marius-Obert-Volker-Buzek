//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview WorkPages Runtime Component
 * This UIComponent gets initialized by the FLP renderer if work pages are enabled (/core/workPages/enabled).
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    /**
     * Component of the WorkPageRuntime view.
     *
     * @param {string} sId Component id
     * @param {object} oSParams Component parameter
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @alias sap.ushell.components.workPageRuntime.Component
     * @since 1.99.0
     * @private
     */
    return UIComponent.extend("sap.ushell.components.workPageRuntime.Component", /** @lends sap.ushell.components.workPageRuntime.Component */{
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        /**
         * If set to true, this flag will prevent navigation triggered by the routeMatched event.
         * It is set via the componentData and defaults to false.
         *
         * @returns {boolean} Wether navigation is configured to be disabled
         *
         * @since 1.108.0
         * @private
         */
        getNavigationDisabled: function () {
            var oComponentData = this.getComponentData() || {};
            return !!oComponentData.navigationDisabled;
        },

        /**
         * API to hide the WorkPageRuntime.
         * It navigates the WorkPageRuntime NavContainer to the empty page.
         * @since 1.107.0
         * @private
         */
        hideRuntime: function () {
            this.getRootControl().getController().hideRuntime();
        },

        /**
         * API to call the onRouteMatched function on the WorkPageRuntime controller.
         * @since 1.107.0
         * @private
         */
        onRouteMatched: function () {
            this.getRootControl().getController().onRouteMatched();
        }
    });
});
