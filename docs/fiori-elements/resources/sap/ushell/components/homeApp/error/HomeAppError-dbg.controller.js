// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/ushell/utils"
], function (
    Controller,
    JSONModel,
    MessageToast,
    resources,
    Config,
    utils
) {
    "use strict";

    var messages = Config.last("/core/homeApp/component").messages || [];

    return Controller.extend("sap.ushell.components.homeApp.error.HomeAppError", {
        onInit: function () {
            this._oModel = new JSONModel({
                icon: "sap-icon://documents",
                text: resources.i18n.getText("HomeApp.GeneralError.Text"),
                description: "",
                details: JSON.stringify(messages, null, 4)
            });
            this.getView().setModel(this._oModel);
        },

        onCopyErrorDetailsPress: function () {
            var bResult = utils.copyToClipboard(this._oModel.getProperty("/details"));
            if (bResult) {
                MessageToast.show(resources.i18n.getText("HomeApp.CannotLoadApp.CopySuccess"), {
                    closeOnBrowserNavigation: false
                });
            } else {
                MessageToast.show(resources.i18n.getText("HomeApp.CannotLoadApp.CopyFail"), {
                    closeOnBrowserNavigation: false
                });
            }
        }
    });
});
