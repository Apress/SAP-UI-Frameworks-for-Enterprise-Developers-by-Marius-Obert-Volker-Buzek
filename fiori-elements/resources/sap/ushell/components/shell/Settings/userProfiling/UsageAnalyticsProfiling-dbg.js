// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/resources"
], function (
    Log,
    XMLView,
    resources
) {
    "use strict";

    return {
        getProfiling: function () {

            var oViewInstance;

            return {
                id: "usageAnalytics",
                entryHelpID: "usageAnalytics",
                title: resources.i18n.getText("usageAnalytics"),
                contentFunc: function () {
                    return XMLView.create({
                        id: "userPrefUsageAnalyticsSelector",
                        viewName: "sap.ushell.components.shell.Settings.userProfiling.UsageAnalyticsSelector"
                    }).then(function (oView) {
                        oViewInstance = oView;
                        return oView;
                    });
                },
                onSave: function () {
                    if (oViewInstance) {
                        return oViewInstance.getController().onSave();
                    }
                    Log.warning("Save operation for user profiling was not executed, because the userProfiling view was not initialized");
                    return Promise.resolve();

                },
                onCancel: function () {
                    if (oViewInstance) {
                        oViewInstance.getController().onCancel();
                        return;
                    }
                    Log.warning(
                        "Cancel operation for user profiling was not executed, because the userProfiling view was not initialized"
                    );
                }
            };
        }
    };

});
