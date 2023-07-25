// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Controller for ContentFinderDialog root view
 * @version 1.113.0
 */
sap.ui.define([
    "../model/formatter",
    "sap/ui/core/mvc/Controller"
], function (
    formatter, Controller
) {
    "use strict";

    /**
     * Controller of the Dialog root view.
     *
     * @param {string} sId Controller id.
     * @param {object} oParams Controller parameters.
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.113.0
     * @alias sap.ushell.components.contentFinder.controller.ContentFinderDialog
     */
    return Controller.extend("sap.ushell.components.contentFinder.controller.ContentFinderDialog", {
        /**
         * The contentFinder formatters.
         *
         * @since 1.113.0
         * @private
         */
        formatter: formatter,

        /**
         * The init function called after the view was initialized.
         *
         * @since 1.113.0
         * @private
         */
        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.oModel = this.getOwnerComponent().getModel();
            this.oDialog = this.getView().byId("contentFinderDialog");
        },

        /**
         * Event handler which gets called when the 'Cancel' button of the content finder dialog is pressed.
         *
         * @param {sap.ui.base.Event} oEvent The event data provided by the sap.m.Button
         * @since 1.113.0
         * @private
         */
        onCancelButtonPressed: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        /**
         * Event handler which is called when the "back" button of the content finder dialog is pressed.
         *
         * Navigates back to the widget gallery.
         * All AppSearch data is reset before navigating away from the app search.
         *
         * @since 1.113.0
         * @private
         */
        onBackButtonPressed: function () {
            this.getOwnerComponent().resetAppSearch();

            this.getOwnerComponent().navigate(this.oModel.getProperty("/navigationTargets/widgetGallery"));
        },

        /**
         * Event handler which is called when the "Add" button is pressed.
         *
         * It is used to add visualizations to a workpage.
         *
         * @param {sap.ui.base.Event} oEvent The event data provided by the sap.m.Button
         * @since 1.113.0
         * @private
         */
        onAddButtonPressed: function (oEvent) {
            this.getOwnerComponent().addVisualizations();
            oEvent.getSource().getParent().close();
        },

        /**
         * Event handler which is called after the dialog closes.
         *
         * It resets the model data.
         *
         * @returns {Promise<undefined>} Resolves with an empty promise.
         * @since 1.113.0
         * @private
         */
        onClose: function () {
            var oOwnerComponent = this.getOwnerComponent();

            // Reset the model
            oOwnerComponent._initializeModel();

            // Navigate to the initial page to trigger the "navigate" event of the NavContainer every time the view is displayed.
            return oOwnerComponent.getNavContainer().then(function (oNavContainer) {
                oNavContainer.backToTop();
                oOwnerComponent.fireEvent("contentFinderClosed");

                //Once the ContentFinder is closed, all registered events need to be detached
                oOwnerComponent._unregisterEvents();
            });
        }
    });
});
