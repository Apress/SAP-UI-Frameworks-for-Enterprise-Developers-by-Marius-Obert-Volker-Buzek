// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/m/Title",
    "sap/ushell/Config"
], function (Controller, Log, Title, Config) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userProfiling.UserProfiling", {
        onInit: function () {
            this._loadContent();
        },

        _loadContent: function () {
            var oVBox = this.getView().byId("profilingContent"),
                aProfilingEntries = Config.last("/core/userPreferences/profiling");

            aProfilingEntries.forEach(function (oProfilingEntry) {
                var contentPromise = oProfilingEntry.contentFunc();
                //support native promise and jquery promise
                contentPromise.then(function (result) {
                    var oTitle = new Title({
                        text: oProfilingEntry.title || ""
                    }).addStyleClass("sapUiSmallMarginTop");
                    oVBox.addItem(oTitle);
                    oVBox.addItem(result);
                }, function (error) {
                    Log.warning(
                        "Failed to load " + oProfilingEntry.title + " profiling", error,
                        "sap.ushell.components.shell.Settings.userProfiling.UserProfiling"
                    );
                });
            });
        },

        onCancel: function () {
            var aProfilingEntries = Config.last("/core/userPreferences/profiling");

            aProfilingEntries.forEach(function (oProfilingEntry) {
                if (oProfilingEntry.onCancel) {
                    oProfilingEntry.onCancel();
                }
            });
        },

        onSave: function () {
            var aProfilingEntries = Config.last("/core/userPreferences/profiling") || [],
                aSavePromises = aProfilingEntries.map(this._saveProfileEntry);

            return Promise.all(aSavePromises).then(function (aResult) {
                var bHasError = aResult.some(function (oResult) {
                    return oResult && oResult.error;
                });
                return bHasError ? Promise.reject("Can not save user profiling settings") : Promise.resolve();
            });
        },

        _saveProfileEntry: function (oProfilingEntry) {
            return new Promise(function (resolve) {
                oProfilingEntry.onSave()
                    .then(resolve, function (error) {
                        Log.error(
                            "Failed to save " + oProfilingEntry.title + " profiling", error,
                            "sap.ushell.components.shell.Settings.userProfiling.UserProfiling"
                        );
                        resolve({
                            error: true
                        });
                    });
            });
        }

    });
});
