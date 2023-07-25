// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/components/shell/Settings/ProfilingLoader",
    "sap/ushell/components/shell/Settings/userAccount/UserAccountEntry",
    "sap/ushell/components/shell/Settings/appearance/AppearanceEntry",
    "sap/ushell/components/shell/Settings/homepage/HomepageEntry",
    "sap/ushell/components/shell/Settings/spaces/SpacesEntry",
    "sap/ushell/components/shell/Settings/userActivities/UserActivitiesEntry",
    "sap/ushell/components/shell/Settings/userProfiling/UserProfilingEntry",
    "sap/ushell/components/shell/Settings/notifications/NotificationsEntry",
    "sap/ushell/components/shell/Settings/userDefaults/UserDefaultsEntry",
    "sap/ushell/components/shell/Settings/userLanguageRegion/UserLanguageRegionEntry",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/utils"
], function (
    Core,
    XMLView,
    UIComponent,
    JSONModel,
    Config,
    EventHub,
    resources,
    fnLoadStandardProfiling,
    UserAccountEntry,
    AppearanceEntry,
    HomepageEntry,
    SpacesEntry,
    UserActivitiesEntry,
    UserProfilingEntry,
    NotificationsEntry,
    UserDefaultsEntry,
    UserLanguageRegionEntry,
    ShellHeadItem,
    Utils
) {
    "use strict";

    var aDoables = [];

    return UIComponent.extend("sap.ushell.components.shell.Settings.Component", {

        metadata: {
            version: "1.113.0",
            library: "sap.ushell",
            dependencies: {
                libs: {
                    "sap.m": {},
                    "sap.ui.layout": {
                        lazy: true
                    }
                }
            }
        },

        /**
         * Initializes the user settings and add standard entity into Config
         *
         * @private
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            var oShellConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig();
            if (oShellConfig.moveUserSettingsActionToShellHeader) {
                this.oSettingsBtn = this._addUserSettingsButton();
            }

            this._addStandardEntityToConfig();
            fnLoadStandardProfiling();
            if (Config.last("/core/shell/model/enableNotifications")) { // Notifications
                this._addNotificationSettings();
            }
            aDoables.push(EventHub.on("openUserSettings").do(this._openUserSettings.bind(this)));
        },

        /**
         * Get all standard entity of setting dialog and update ushell Config
         * - sets the performance mark for search entry, if active
         * @private
         */
        _addStandardEntityToConfig: function () {
            var aEntities = Config.last("/core/userPreferences/entries");

            aEntities.push(UserAccountEntry.getEntry()); // User account
            aEntities.push(AppearanceEntry.getEntry()); // Appearance

            if (SpacesEntry.isRelevant()) {
                aEntities.push(SpacesEntry.getEntry()); // Spaces
            }
            aEntities.push(UserLanguageRegionEntry.getEntry()); // Language

            if (Config.last("/core/shell/enableRecentActivity")) {
                aEntities.push(UserActivitiesEntry.getEntry()); // User Activities
            }
            aEntities.push(UserProfilingEntry.getEntry()); // User Profiling

            // Search
            if (Config.last("/core/shell/model/searchAvailable")) {
                sap.ushell.Container.getFLPPlatform().then(function (sPlatform) {
                    if (sPlatform !== "MYHOME") {
                        sap.ui.require(["sap/ushell/components/shell/Settings/search/SearchEntry"], function (SearchEntry) {
                            SearchEntry.getEntry().then(function (searchEntry) {
                                searchEntry.isActive().then(function (isActive) {
                                    if (!isActive) {
                                        return;
                                    }
                                    Utils.setPerformanceMark("FLP -- search setting entry is set active");
                                    aEntities = Config.last("/core/userPreferences/entries");
                                    aEntities.push(searchEntry);
                                    Config.emit("/core/userPreferences/entries", aEntities);
                                });
                            });
                        });
                    }
                });
            }

            if (Config.last("/core/home/enableHomePageSettings") && !Config.last("/core/spaces/enabled")) {
                aEntities.push(HomepageEntry.getEntry()); // Home Page
            }

            if (Config.last("/core/shell/model/userDefaultParameters")) {
                aEntities.push(UserDefaultsEntry.getEntry()); // User Defaults
            }

            aEntities = sap.ushell.Container.getRenderer("fiori2").reorderUserPrefEntries(aEntities);
            Config.emit("/core/userPreferences/entries", aEntities);
        },

        /**
         * Add the notifications settings entry and update the shell config.
         * For this, the Notifications service has to be loaded and its settings have to be retrieved.
         *
         * @private
         */
        _addNotificationSettings: function () {
            sap.ushell.Container.getServiceAsync("Notifications").then(function (service) {
                service._userSettingInitialization();
                service._getNotificationSettingsAvailability().done(function (status) {
                    if (status.settingsAvailable) {
                        var aEntities = Config.last("/core/userPreferences/entries");
                        aEntities.push(NotificationsEntry.getEntry());
                        Config.emit("/core/userPreferences/entries", aEntities);
                    }
                });
            });
        },

        /**
         * Create and open settings dialog
         * @param {object} oEvent Event contain id and time.
         * @returns {Promise<undefined>} A promise resolving when the settings dialog was opened.
         * @private
         */
        _openUserSettings: function (oEvent) {
            if (!this.oDialogPromise) {
                this.oDialogPromise = XMLView.create({
                    id: "settingsView",
                    viewName: "sap.ushell.components.shell.Settings.UserSettings"
                }).then(function (oSettingView) {
                    this.oSettingsView = oSettingView;
                    oSettingView.setModel(new JSONModel({
                        entries: []
                    }));
                    oSettingView.setModel(resources.i18nModel, "i18n");
                    var sControlId = oEvent.controlId || "shell-header";
                    Core.byId(sControlId).addDependent(oSettingView);
                    return oSettingView.byId("userSettingsDialog");
                }.bind(this));
            }

            return this.oDialogPromise.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Create and add the settings button to the header
         *
         * @returns {sap.ushell.ui.shell.ShellHeadItem} settings button
         */
        _addUserSettingsButton: function () {
            var oUserSettingsButton = new ShellHeadItem({
                id: "userSettingsBtn",
                icon: "sap-icon://action-settings",
                text: resources.i18n.getText("userSettings"),
                ariaHaspopup: "dialog",
                press: this._openUserSettings.bind(this)
            });
            //Use ElementsModel, because button should be added only for specific states without propagation
            sap.ushell.Container.getRenderer("fiori2").oShellModel.addHeaderEndItem(
                [oUserSettingsButton.getId()],
                false,
                ["home", "app", "minimal", "standalone", "embedded", "embedded-home", "merged", "merged-home"],
                true
            );

            return oUserSettingsButton;
        },

        /**
         * Turns the eventlistener in this component off.
         *
         * @private
         */
        exit: function () {
            for (var i = 0; i < aDoables.length; i++) {
                aDoables[i].off();
            }
            if (this.oSettingsView) {
                this.oSettingsView.destroy();
                this.oSettingsView = null;
                this.oDialogPromise = null;
            }
            if (this.oSettingsBtn) {
                this.oSettingsBtn.destroy();
                this.oSettingsBtn = null;
            }
        }
    });
});
