// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/base/Log"
], function (
    Controller,
    JSONModel,
    EventHub,
    Config,
    resources,
    utils,
    Log
) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.spaces.SpacesSetting", {
        onInit: function () {
            var oViewData = this.getView().getViewData();
            this.oUserInfoService = oViewData.UserInfo;
            var oUser = this.oUserInfoService.getUser();

            var bSpacesEnabled = Config.last("/core/spaces/enabled");
            var bHomeAppEnabled = Config.last("/core/homeApp/enabled");
            var bMyHomeEnabled = Config.last("/core/spaces/myHome/enabled");

            var bShowMyHomeVisible = bSpacesEnabled && bMyHomeEnabled && !bHomeAppEnabled;
            var bShowMyHomeSelected = oUser.getShowMyHome();
            var sImportFlag = oUser.getImportBookmarksFlag();
            var bMyHomeImportVisible = sImportFlag !== "done" && sImportFlag !== "not_required";

            // If the FLP is in classic mode, do not show My Home and Import settigs - we do not know the values of other flags.
            var oViewModel = new JSONModel({
                spaces: {
                    visible: Config.last("/core/spaces/configurable"),
                    selected: bSpacesEnabled
                },
                hideEmptySpaces: {
                    visible: bSpacesEnabled && Config.last("/core/spaces/hideEmptySpaces/enabled"),
                    selected: Config.last("/core/spaces/hideEmptySpaces/userEnabled")
                },
                showMyHome: {
                    visible: bShowMyHomeVisible,
                    selected: bShowMyHomeSelected
                },
                showMyHomeImport: {
                    visible: bShowMyHomeVisible && bShowMyHomeSelected && bMyHomeImportVisible,
                    selected: sImportFlag === "pending"
                }
            });
            this.getView().setModel(oViewModel);
            this.getView().setModel(resources.getTranslationModel(), "i18n");


            this.oImportBookmarksFlagListener = EventHub.on("importBookmarksFlag").do(this._setMyHomeImportSelected.bind(this));
        },

        _setMyHomeImportSelected: function (value) {
            var oViewModel = this.getView().getModel();
            oViewModel.setProperty("/showMyHomeImport/selected", value);
        },

        onExit: function () {
            this.oImportBookmarksFlagListener.off();
        },

        onSave: function (fnUpdateUserPreferences) {
            var bRestart = false;
            var bUpdate = false;
            var aUpdatePromises = [];

            var oModel = this.getView().getModel();
            var oUserInfoService = this.oUserInfoService;
            var oUser = oUserInfoService.getUser();

            var bOldSpacesEnabled = Config.last("/core/spaces/enabled");
            var bNewSpacesEnabled = oModel.getProperty("/spaces/selected");

            var bOldHideEmptySpaces = Config.last("/core/spaces/hideEmptySpaces/userEnabled");
            var bNewHideEmptySpaces = oModel.getProperty("/hideEmptySpaces/selected");

            var bOldShowMyHome = oUser.getShowMyHome();
            var bNewShowMyHome = oModel.getProperty("/showMyHome/selected");

            var bOldShowImportMessage = oUser.getImportBookmarksFlag() === "pending";
            var bNewShowImportMessage = oModel.getProperty("/showMyHomeImport/selected");

            // Set and persist changed user preferences
            if (bOldSpacesEnabled !== bNewSpacesEnabled) {
                oUser.setChangedProperties({
                    propertyName: "spacesEnabled",
                    name: "SPACES_ENABLEMENT"
                }, bOldSpacesEnabled, bNewSpacesEnabled);
                bUpdate = true;
                bRestart = true;
            }
            if (bOldShowMyHome !== bNewShowMyHome) {
                oUser.setShowMyHome(bNewShowMyHome);
                bUpdate = true;
                bRestart = true;
            }
            if (bOldShowImportMessage !== bNewShowImportMessage) {
                var bImportFlag = bNewShowImportMessage ? "pending" : "dismissed";
                oUser.setImportBookmarksFlag(bImportFlag);
                bUpdate = true;

                if (!bRestart) { // do not need to react if the FLP is going to restart anyway
                    EventHub.emit("importBookmarksFlag", bNewShowImportMessage);
                }
            }

            if (bOldHideEmptySpaces !== bNewHideEmptySpaces) {
                var oHideEmptySpacesPromise = utils.setHideEmptySpacesEnabled(bNewHideEmptySpaces)
                    .catch(function (sErrorMessage) {
                        oModel.setProperty("/hideEmptySpaces/selected", bOldHideEmptySpaces);
                        return Promise.reject(sErrorMessage);
                    });
                aUpdatePromises.push(oHideEmptySpacesPromise);
            }

            // Nothing to do if setting has not been changed
            if (!bUpdate && !aUpdatePromises.length) {
                return Promise.resolve();
            }
            Log.debug("[000] SpacesSetting.controller.save");
            if (bUpdate) {
                var oUserInfoPromise = new Promise(function (resolve, reject) {
                    fnUpdateUserPreferences()
                        .then(function () {
                            oUser.resetChangedProperty("spacesEnabled");
                            oUser.resetChangedProperty("showMyHome");
                            oUser.resetChangedProperty("importBookmarks");
                            resolve();
                        })
                        .catch(function (sErrorMessage) {
                            if (
                                !sErrorMessage.includes("SPACES_ENABLEMENT")
                                && !sErrorMessage.includes("MYHOME_ENABLEMENT")
                                && !sErrorMessage.includes("MYHOME_IMPORT_FROM_CLASSIC")
                            ) {
                                oUser.resetChangedProperty("spacesEnabled");
                                oUser.resetChangedProperty("showMyHome");
                                oUser.resetChangedProperty("importBookmarks");
                                resolve();
                            } else {
                            oModel.setProperty("/spaces/selected", bOldSpacesEnabled);
                            oModel.setProperty("/showMyHome/selected", bOldShowMyHome);

                            oUser.resetChangedProperty("spacesEnabled");
                            oUser.resetChangedProperty("showMyHome");
                            oUser.resetChangedProperty("importBookmarks");
                            reject(sErrorMessage);
                            }
                        });
                });
                aUpdatePromises.push(oUserInfoPromise);
            }

            return Promise.all(aUpdatePromises)
                .then(function () {
                    return {
                        refresh: bRestart,
                        noHash: true // Inform Controller, about reloading without Hash, to ensure we are not trying to Start the "MyHome" space by accident
                    };
                });
        },

        onCancel: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/spaces/selected", Config.last("/core/spaces/enabled"));
            oModel.setProperty("/showMyHome/selected", this.oUserInfoService.getUser().getShowMyHome());
            oModel.setProperty("/hideEmptySpaces/selected", Config.last("/core/spaces/hideEmptySpaces/userEnabled"));
        }
    });
});
