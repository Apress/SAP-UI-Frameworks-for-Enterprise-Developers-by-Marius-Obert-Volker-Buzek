// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources"
], function (
    XMLView,
    Log,
    Config,
    resources
) {
    "use strict";

    function getEntry () {
        var sViewId = "notificationsSetting",
            sComponentNamespace = "sap.ushell.components.shell.Settings.notifications.NotificationsSetting",
            oViewInstance;

        return {
            id: "notificationsEntry",
            entryHelpID: "notificationsEntry",
            title: resources.i18n.getText("notificationSettingsEntry_title"),
            valueResult: null,
            contentResult: null,
            icon: "sap-icon://bell",
            valueArgument: null,
            contentFunc: function () {
                return XMLView.create({
                    id: sViewId,
                    viewName: sComponentNamespace
                }).then(function (oView) {
                    oViewInstance = oView;
                    return oView;
                });
            },
            onSave: function () {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave();
                }
                Log.warning(
                    "Save operation for user account settings was not executed, because the notifications view was not initialized"
                );
                return Promise.resolve();
            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for user account settings was not executed, because the notifications view was not initialized"
                );
            }
        };
    }

    return {
        getEntry: getEntry
    };

});
