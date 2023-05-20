// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/Config",
    "sap/ushell/resources"
], function (
    Log,
    XMLView,
    Config,
    resources
) {
    "use strict";

    return {
        getEntry: function () {

            var oViewInstance;

            return {
                id: "userProfiling",
                entryHelpID: "userProfiling",
                title: resources.i18n.getText("userProfiling"),
                valueResult: null,
                contentResult: null,
                icon: "sap-icon://user-settings",
                valueArgument: function () {
                    var aProfilingEntries = Config.last("/core/userPreferences/profiling"),
                        oResult = {
                            value: aProfilingEntries && aProfilingEntries.length > 0 ? 1 : 0,
                            displayText: ""
                        };
                    return Promise.resolve(oResult);
                },
                contentFunc: function () {
                    return XMLView.create({
                        id: "userProfilingView",
                        viewName: "sap.ushell.components.shell.Settings.userProfiling.UserProfiling"
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
                },
                provideEmptyWrapper: false,
                visible: false //hide or show based on the valueArgument in UserSettings.controller.js
            };
        }
    };

});
