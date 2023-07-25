// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Controller for WidgetGallery view
 * @version 1.113.0
 */
sap.ui.define([
    "./ContentFinderDialog.controller"
], function (
    ContentFinderController
) {
    "use strict";

    /**
     * Controller of the WidgetGallery view.
     *
     * @param {string} sId Controller id.
     * @param {object} oParams Controller parameters.
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.113.0
     * @alias sap.ushell.components.contentFinder.controller.WidgetGallery
     */
    return ContentFinderController.extend("sap.ushell.components.contentFinder.controller.WidgetGallery", {
        /**
         * Initializes the controller instance after the view is initialized. Only to be called once.
         *
         * @since 1.113.0
         * @private
         */
        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.oModel = this.getOwnerComponent().getModel();
        },

        /**
         * Event handler which is called when a widget type was selected.
         *
         * In addition, the event handler fires an event in case no target is specified (e.g. selecting premium widgets).
         *
         * @param {sap.base.Event} oEvent The selection event
         * @fires sap.ushell.components.contentFinder.Component#widgetSelected
         * @since 1.113.0
         * @private
         */
        onSelectWidgetType: function (oEvent) {
            var oWidgetType = oEvent.getSource().getBindingContext().getObject();
            if (oWidgetType.target) {
                this.getOwnerComponent().navigate(oWidgetType.target);
            } else {
                this.getOwnerComponent().fireEvent("widgetSelected", {
                    widgetId: oWidgetType.id
                });
                // TODO: Close the dialog?
                this.getOwnerComponent().getRootControl().byId("contentFinderDialog").close();
            }
        }
    });
});
