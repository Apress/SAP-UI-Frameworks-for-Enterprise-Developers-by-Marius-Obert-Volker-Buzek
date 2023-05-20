// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/base/Log",
    "sap/ushell/resources",
    "sap/base/util/deepClone",
    "sap/ui/thirdparty/jquery"
], function (
    Controller,
    JSONModel,
    Config,
    Log,
    resources,
    deepClone,
    jQuery
) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.notifications.NotificationsSetting", {
        onInit: function () {
            this._oModel = new JSONModel({
                    rows: [],
                    originalRows: []
                });
            var oView = this.getView(),
                oResponseData;

            oView.setBusy(true);
            oView.setModel(resources.getTranslationModel(), "i18n");

            sap.ushell.Container.getServiceAsync("Notifications")
                .then(function (Service) {
                    this._oNotificationService = Service;
                    this._initializeFlags();
                    Service.readSettings()
                        .done(function (oResult) {
                            oResponseData = JSON.parse(oResult);
                            this._oModel.setProperty("/rows", oResponseData.value);
                            this._oModel.setProperty("/originalRows", deepClone(oResponseData.value));
                        }.bind(this))
                        .always(function () {
                            oView.setBusy(false);
                            oView.setModel(this._oModel);
                        }.bind(this));
                }.bind(this));

        },

        /**
         * Initialize the copies of the data rows and the flags (i.e. originalRows and originalFlags).
         * In case they were not loaded yet, skip them.
         *
         * @private
         */
        onAfterRendering: function () {
            var oFlags = this._oModel.getProperty("/flags"),
                aRows = this._oModel.getProperty("/rows");

            // After controller initialization there might be a case in which the data still wasn't fetched from the backend.
            // In this case aRows and oFlags could be undefined, hence we can't set originalRows and originalFlags yet.
            // In this case, the setting occurs in the controller's onInit function, when the data arrives.
            if (aRows !== undefined) {
                this._oModel.setProperty("/originalRows", deepClone(aRows));
            }
            if (oFlags !== undefined) {
                this._oModel.setProperty("/originalFlags/highPriorityBannerEnabled", oFlags.highPriorityBannerEnabled);
            }
        },

        /**
         * Called when the "Cancel" button was pressed. Resets the changes by copying the original values.
         *
         * @private
         */
        onCancel: function () {
            var oOriginalFlags = this._oModel.getProperty("/originalFlags"),
                oOriginalRows = this._oModel.getProperty("/originalRows");

            this._oModel.setProperty("/flags/highPriorityBannerEnabled", oOriginalFlags.highPriorityBannerEnabled);
            this._oModel.setProperty("/rows", deepClone(oOriginalRows));

            this._oModel.setProperty("/originalFlags", {});
            this._oModel.setProperty("/originalRows", []);
        },

        /**
         * Called when the "Save" button is pressed. Saves the current settings in case they have changed.
         *
         * @returns {Promise<void>} A promise that resolves when the settings have changed successfully or when there were no changes made.
         * @private
         */
        onSave: function () {
            var aRows = this._oModel.getProperty("/rows"),
                aOriginalRows = this._oModel.getProperty("/originalRows"),
                oRow,
                oOriginalRow,
                aSettingsToSave = [],
                aSaveDeferres = [];

            for (var iIndex = 0; iIndex < aRows.length; iIndex++) {
                oRow = aRows[iIndex];
                oOriginalRow = aOriginalRows[iIndex];
                if (this._notficationSettingsDiffer(oRow, oOriginalRow)) {
                    aSettingsToSave.push(oRow);
                }
            }

            if (this._flagsHaveChanged()) {
                this._handleFlagsSave();
            }

            if (aSettingsToSave.length) {
                aSettingsToSave.forEach(function (setting) {
                    aSaveDeferres.push(this._oNotificationService.saveSettingsEntry(setting));
                }.bind(this));
                return new Promise(function (resolve, reject) {
                    jQuery.when.apply(jQuery, aSaveDeferres)
                        .done(function () {
                            resolve();
                        })
                        .fail(function (error) {
                            Log.error(
                                "Failed to save the notification settings in the notifivation service.", error,
                                "sap.ushell.components.ushell.settings.notifications.NotificationsSetting");
                            reject(error);
                        });
                });
            }
            return Promise.resolve();
        },


        /**
         * Checks if flags were changed by the user.
         *
         * @returns {boolean} Wheter the high priority flag was changed.
         * @private
         */
        _flagsHaveChanged: function () {
            return this._oModel.getProperty("/flags/highPriorityBannerEnabled") !==
                this._oModel.getProperty("/originalFlags/highPriorityBannerEnabled");
        },

        /**
         * Handle the saving of "Show Alerts" (i.e. enable banner) and "Show Preview" flags,
         * and update the original flags (in "/originalFlags") for the next time the settings UI is opened.
         *
         * @private
         */
        _handleFlagsSave: function () {
            var bHighPrioEnabled = this._oModel.getProperty("/flags/highPriorityBannerEnabled");
            this._oModel.setProperty("/originalFlags/highPriorityBannerEnabled", bHighPrioEnabled);

            this._oNotificationService.setUserSettingsFlags({
                highPriorityBannerEnabled: bHighPrioEnabled
            });
        },

        /**
         * Checks whether notification settings differ in user relevant data.
         *
         * @param {object} setting0 First settings object to compare.
         * @param {object} setting1 First setting object to compare.
         * @returns {boolean} Whether they differ or not (compared are the ID, and the flags that can be changed by the user).
         * @private
         */
        _notficationSettingsDiffer: function (setting0, setting1) {
            return (setting0.NotificationTypeId !== setting1.NotificationTypeId) ||
                (setting0.PriorityDefault !== setting1.PriorityDefault) ||
                (setting0.DoNotDeliver !== setting1.DoNotDeliver) ||
                (setting0.DoNotDeliverMob !== setting1.DoNotDeliverMob) ||
                (setting0.DoNotDeliverEmail !== setting1.DoNotDeliverEmail);
        },

        /**
         * Called when the CheckBox for the mobile notifications is pressed. Sets the 'DoNotDeliverMob' property.
         *
         * @param {sap.ui.base.Event} event The select event.
         * @private
         */
        onSelectMobile: function (event) {
            var sPath = event.getSource().getBindingContext().getPath();
            this._oModel.setProperty(sPath + "/DoNotDeliverMob", !event.getParameter("selected"));
        },

        /**
         * Called when the CheckBox for the email notifications is pressed. Sets the 'DoNotDeliverEmail' property.
         *
         * @param {sap.ui.base.Event} event The select event.
         * @private
         */
        onSelectEmail: function (event) {
            var sPath = event.getSource().getBindingContext().getPath();
            this._oModel.setProperty(sPath + "/DoNotDeliverEmail", !event.getParameter("selected"));
        },

        /**
         * Called when the CheckBox for high priority notifications is pressed. Sets the 'PriorityDefault' property.
         *
         * @param {sap.ui.base.Event} event The select event.
         * @private
         */
        onSelectHighPriority: function (event) {
            var sPath = event.getSource().getBindingContext().getPath();
            if (event.getParameter("selected")) {
                this._oModel.setProperty(sPath + "/PriorityDefault", "HIGH");
            } else {
                this._oModel.setProperty(sPath + "/PriorityDefault", "");
            }
        },

        /**
         * Called when the Switch for the 'Enabled' state is pressed. Sets the 'DoNotDeliver' property.
         *
         * @param {sap.ui.base.Event} event The switch event.
         * @private
         */
        onEnableSwitchChange: function (event) {
            var bNewState = event.getParameter("state"),
                sPath = event.getSource().getBindingContext().getPath();
            this._oModel.setProperty(sPath + "/DoNotDeliver", !bNewState);
        },

        /**
         * Initialize flag values for the Select and Switch states handling. It retrieves the values from the Notifications service and
         * stores them in the JSON model passed as argument.
         *
         * @private
         */
        _initializeFlags: function () {
            var oSwitchBarDataPromise = this._oNotificationService.getUserSettingsFlags(),
                bMobilePushEnabled = this._oNotificationService._getNotificationSettingsMobileSupport(),
                bEmailPushEnabled = this._oNotificationService._getNotificationSettingsEmailSupport();

            oSwitchBarDataPromise
                .done(function (oSwitchBarData) {
                    this._oModel.setProperty("/flags", {});
                    this._oModel.setProperty("/flags/highPriorityBannerEnabled", oSwitchBarData.highPriorityBannerEnabled);
                    this._oModel.setProperty("/flags/mobileNotificationsEnabled", bMobilePushEnabled);
                    this._oModel.setProperty("/flags/emailNotificationsEnabled", bEmailPushEnabled);
                    this._oModel.setProperty("/originalFlags", {});
                    this._oModel.setProperty("/originalFlags/highPriorityBannerEnabled", oSwitchBarData.highPriorityBannerEnabled);
                }.bind(this));
        }
    });
});
