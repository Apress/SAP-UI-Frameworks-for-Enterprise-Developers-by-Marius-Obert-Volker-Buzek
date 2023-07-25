//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Pages Runtime Component
 * This UIComponent gets initialized by the FLP renderer upon visiting
 * #Shell-home or #Launchpad-openFLPPage if spaces are enabled (/core/spaces/enabled).
 * In the future it should completely replace the classical homepage.
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/ui/core/InvisibleMessage",
    "sap/ui/core/UIComponent",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/resources"
], function (InvisibleMessage, UIComponent, SharedComponentUtils, resources) {
    "use strict";

    /**
     * Component of the PagesRuntime view.
     *
     * @param {string} sId Component id
     * @param {object} oSParams Component parameter
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @alias sap.ushell.components.pages.Component
     * @since 1.72.0
     * @private
     */
    return UIComponent.extend("sap.ushell.components.pages.Component", /** @lends sap.ushell.components.pages.Component */{
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },
        /**
         * UI5 lifecycle method which gets called upon component instantiation.
         * It emits the "PagesRuntimeRendered" event to notify the Scheduling Agent
         * that the pages runtime is successfully rendered.
         *
         * @since 1.72.0
         * @private
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            SharedComponentUtils.toggleUserActivityLog();
            SharedComponentUtils.getEffectiveHomepageSetting("/core/home/sizeBehavior", "/core/home/sizeBehaviorConfigurable");
            this.setModel(resources.i18nModel, "i18n");

            // Instantiate pages service early here in order to do the metadata call early.
            this._oPagesService = sap.ushell.Container.getServiceAsync("Pages");

            this._oInvisibleMessageInstance = InvisibleMessage.getInstance();
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
         * Returns a promise resolving to the pages service.
         *
         * @returns {Promise<sap.ushell.services.Pages>} A promise resolving to the Pages service.
         * @private
         */
        getPagesService: function () {
            return this._oPagesService;
        },

        /**
         * Returns the invisible message instance of this component.
         *
         * @returns {sap.ui.core.InvisibleMessage} A invisible message instance.
         * @protected
         * @since 1.82
         */
        getInvisibleMessageInstance: function () {
            return this._oInvisibleMessageInstance;
        },

        /**
         * API to hide the Pages Runtime.
         * Navigates the Pages Runtime NavContainer to the empty page.
         * @since 1.107.0
         * @private
         */
        hideRuntime: function () {
            this.getRootControl().getController().hideRuntime();
        },

        /**
         * API to call the onRouteMatched function on the Pages Runtime controller.
         * @since 1.107.0
         * @private
         */
        onRouteMatched: function () {
            this.getRootControl().getController().onRouteMatched();
        }
    });
});
