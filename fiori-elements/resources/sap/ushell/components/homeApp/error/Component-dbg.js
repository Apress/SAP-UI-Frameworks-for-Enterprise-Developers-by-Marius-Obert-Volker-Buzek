// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/resources"
], function (UIComponent, resources) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.homeApp.error.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(resources.i18nModel, "i18n");
        }
    });
});
