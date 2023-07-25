// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/resources"
], function (Controller, JSONModel, resources) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userProfiling.UsageAnalyticsSelector", {
        onInit: function () {
            this.oUser = sap.ushell.Container.getUser();
            this.getView().setModel(resources.getTranslationModel(), "i18n");
            sap.ushell.Container.getServiceAsync("UsageAnalytics").then(function (oService) {
                this.oUsageAnalyticsService = oService;
                this.getView().setModel(new JSONModel({
                    isTrackingUsageAnalytics: this.oUser.getTrackUsageAnalytics(),
                    legalText: this.oUsageAnalyticsService.getLegalText()
                }));
            }.bind(this));
        },

        onSave: function () {
            var currentUserTracking = this.getView().getModel().getProperty("/isTrackingUsageAnalytics");
            return this.oUsageAnalyticsService.setTrackUsageAnalytics(currentUserTracking);
        },

        onCancel: function () {
            this.getView().getModel().setProperty("/isTrackingUsageAnalytics", this.oUser.getTrackUsageAnalytics());
        }
    });
});
