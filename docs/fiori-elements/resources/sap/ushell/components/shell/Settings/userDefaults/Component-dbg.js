// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/UIComponent"
], function (
    XMLView,
    UIComponent
) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.Settings.userDefaults.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * Initalizes the user settings and add standard entity into Config
         *
         * @private
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
        },

        /**
         * Callback to save user defaults on save setting dialog
         *
         * @returns {Promise<undefined>} Result promise of saving operation
         *
         * @private
         */
        onSave: function () {
            return this.getRootControl().getController().onSave();
        },

        /**
         * Callback to reset user defaults on close setting dialog
         *
         * @private
         */
        onCancel: function () {
            this.getRootControl().getController().onCancel();
        },

        /**
         * Turns the eventlistener in this component off.
         *
         * @private
         */
        exit: function () { }
    });
});
