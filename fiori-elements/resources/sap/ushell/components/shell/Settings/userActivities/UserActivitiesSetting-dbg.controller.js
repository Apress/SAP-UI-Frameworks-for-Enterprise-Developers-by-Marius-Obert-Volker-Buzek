// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config",
    "sap/base/Log",
    "sap/ushell/resources"
], function (
    Controller,
    JSONModel,
    SharedComponentUtils,
    Config,
    Log,
    resources
) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userActivities.UserActivitiesSetting", {
        onInit: function () {
            var bTrackingEnabled = Config.last("/core/shell/model/enableTrackingActivity") !== undefined ?
                Config.last("/core/shell/model/enableTrackingActivity") :
                true;
            this.oModel = new JSONModel({checkboxIsChecked: bTrackingEnabled});
            this.getView().setModel(this.oModel);
            this.getView().setModel(resources.getTranslationModel(), "i18n");
        },

        /**
         * Called when the "Cancel" button was pressed. Resets the changes.
         *
         * @private
         */
        onCancel: function () {
            var bTrackingEnabled = Config.last("/core/shell/model/enableTrackingActivity") !== undefined ?
                Config.last("/core/shell/model/enableTrackingActivity") :
                true;
            this.oModel.setProperty("/checkboxIsChecked", bTrackingEnabled);
        },

        /**
         * Called when the "Save" button is pressed. Saves the current settings in case they have changed.
         *
         * @returns {Promise<void>} A promise that resolves when the settings have changed successfully or when there were no changes made.
         * @private
         */
        onSave: function () {
            if (Config.last("/core/shell/model/enableTrackingActivity") !== this.oModel.getProperty("/checkboxIsChecked")) {
                return this._setTrackingToEnabled(this.oModel.getProperty("/checkboxIsChecked"));
            }
            return Promise.resolve();
        },

        /**
         * Enables or disables the tracking of user activities in the ushell.
         *
         * @param {boolean} enabled Whether to activate or de-activate it.
         * @returns {Promise<void>} A promise that resolves when the settings were changed succesfully.
         * @private
         */
        _setTrackingToEnabled: function (enabled) {
            return SharedComponentUtils.getPersonalizer("userActivitesTracking", sap.ushell.Container.getRenderer("fiori2"))
                .then(function (oPersonalizer) {
                    return new Promise(function (resolve, reject) {
                        oPersonalizer.setPersData(enabled)
                            .done(function () {
                                Config.emit("/core/shell/model/enableTrackingActivity", enabled);
                                resolve();
                            })
                            .fail(function (error) {
                                // Log failure if occurs.
                                Log.error(
                                    "Failed to save the user activities tracking in personalization", error,
                                    "sap.ushell.components.ushell.settings.userActivities.UserActivitiesSetting");
                                reject();
                            });
                    });
                });

        },

        /**
         * Called when the "Clear my history" button is pressed. Clears the user activity history.
         *
         * @private
         */
        onClearHistory: function () {
            sap.ushell.Container.getServiceAsync("UserRecents").then(function (oService) {
                oService.clearRecentActivities();
                this._showClearHistoryMessageToast();
            }.bind(this));
        },

        /**
         * Show a message toast to inform the user that the history has been cleared.
         *
         * @private
         */
        _showClearHistoryMessageToast: function () {
            sap.ui.require(["sap/m/MessageToast"], function (MessageToast) {
                var sMessage = resources.i18n.getText("historyCleared");
                MessageToast.show(sMessage, {
                    width: "15em",
                    my: "center bottom",
                    at: "center bottom",
                    of: window,
                    offset: "0 -50", //-50 to give a bit of room between the box and the bottom of the screen.
                    collision: "fit fit"
                });
            });
        }
    });
});
