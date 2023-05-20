// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Provides functionality for "sap/ushell/components/pages/view/MyHomeStart.view.xml"
 */
sap.ui.define([
    "sap/ushell/components/pages/MyHomeImport",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/resources",
    "sap/ushell/EventHub",
    "sap/base/Log"
], function (
    myHomeImport,
    JSONModel,
    Controller,
    resources,
    EventHub,
    Log
) {
    "use strict";
    return Controller.extend("sap.ushell.components.pages.controller.MyHome", {
        /**
         * Initialize the controller.
         */
        onInit: function () {
            this.oViewModel = new JSONModel({
                personalizationAvailable: false
            });
            var fnSetEnableImport = function (bFlag) {
                this.oViewModel.setProperty("/personalizationAvailable", !!bFlag);
            }.bind(this);

            this.getView().setModel(resources.i18nModel, "i18n");
            this.getView().setModel(this.oViewModel, "view");
            myHomeImport.isImportEnabled().then(fnSetEnableImport);
            this.oImportBookmarksFlagListener = EventHub.on("importBookmarksFlag").do(fnSetEnableImport);
        },

        onExit: function () {
            this.oImportBookmarksFlagListener.off();
        },

        /**
         * Sets the callback functions, which are called in the respective handlers.
         *
         * @param {{onEdit: function, onOpenDialog: function}} callbacks An object with callbacks.
         */
        connect: function (callbacks) {
            this.fnOnEdit = callbacks.onEdit;
            this.fnOnOpenDialog = callbacks.onOpenDialog;
        },

        /**
         * Calls the 'onEdit' callback.
         */
        onEditPress: function () {
            if (this.fnOnEdit) {
                this.fnOnEdit();
            }
        },

        /**
         * Calls the 'onOpenDialog' callback.
         */
        onImportDialogPress: function () {
            if (this.fnOnOpenDialog) {
                this.fnOnOpenDialog();
            }
        },

        /*
         * Disable message strip when the user closes it.
         */
         onMessageStripClose: function () {
            this.oViewModel.setProperty("/personalizationAvailable", false);
            myHomeImport.setImportEnabled(false);
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.information(resources.i18n.getText("MyHome.InitialPage.MessageStrip.Popup"));
            });
        }
    });
});
