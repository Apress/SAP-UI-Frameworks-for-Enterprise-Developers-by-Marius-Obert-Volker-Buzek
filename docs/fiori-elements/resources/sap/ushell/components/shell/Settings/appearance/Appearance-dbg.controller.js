// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ui/core/Component",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/theming/Parameters",
    "sap/ui/Device",
    "sap/ushell/resources",
    "sap/ui/core/message/Message",
    "sap/ushell/User",
    "sap/ui/base/Object",
    "sap/ui/core/library",
    "sap/ushell/services/DarkModeSupport"
], function (
    Log,
    Controller,
    EventHub,
    Config,
    Component,
    jQuery,
    JSONModel,
    Parameters,
    Device,
    resources,
    Message,
    User,
    BaseObject,
    coreLibrary,
    DarkModeSupport
) {
    "use strict";

    // shortcut for sap.ui.core.MessageType
    var MessageType = coreLibrary.MessageType;

    // gets the common name of complementary (dark/lite) themes
    function getCommonName (themeId) {
        switch (themeId) {
            case "sap_fiori_3":
            case "sap_fiori_3_dark":
                return "SAP Quartz";
            case "sap_horizon":
            case "sap_horizon_dark":
                return "SAP Horizon";
            case "sap_fiori_3_hcb":
            case "sap_fiori_3_hcw":
                return resources.i18n.getText("AppearanceHighContrastTheme", "SAP Quartz");
            case "sap_horizon_hcb":
            case "sap_horizon_hcw":
                return resources.i18n.getText("AppearanceHighContrastTheme", "SAP Horizon");
            default:
                Log.error("Can not find common name for the theme", themeId);
                return themeId || "";
        }
    }

    var SAP_THEMES = {
        base: "sapUshellBaseIconStyle",
        sap_bluecrystal: "sapUshellBlueCrystalIconStyle",
        sap_belize_hcb: "sapUshellHCBIconStyle sapUshellHCBIconStyleOnHCB",
        sap_belize_hcw: "sapUshellHCWIconStyle sapUshellHCWIconStyleOnHCW",
        sap_belize: "sapUshellBelizeIconStyle",
        sap_belize_plus: "sapUshellPlusIconStyle",
        sap_fiori_3_hcb: "sapUshellQuartzHCBIconStyle sapUshellHCBIconStyleOnHCB",
        sap_fiori_3_hcw: "sapUshellQuartzHCWIconStyle sapUshellHCWIconStyleOnHCW",
        sap_fiori_3: "sapUshellQuartzLightIconStyle",
        sap_fiori_3_dark: "sapUshellQuartzDarkIconStyle",
        sap_horizon_hcb: "sapUshellHorizonHCBIconStyle sapUshellHCBIconStyleOnHCB",
        sap_horizon_hcw: "sapUshellHorizonHCWIconStyle sapUshellHCWIconStyleOnHCW",
        sap_horizon: "sapUshellHorizonLightIconStyle",
        sap_horizon_dark: "sapUshellHorizonDarkIconStyle"
    };

    return Controller.extend("sap.ushell.components.shell.Settings.appearance.Appearance", {
        TILE_SIZE: {
            Small: 0,
            Responsive: 1,

            getName: function (iValue) {
                return Object.keys(this)[iValue];
            }
        },

        onInit: function () {
            var oView = this.getView();

            this.oUser = sap.ushell.Container.getUser();
            this.aThemeListFromServer = oView.getViewData().themeList || [];

            this.oPersonalizers = {};

            // set models
            var oResourceModel = resources.getTranslationModel();
            oView.setModel(oResourceModel, "i18n");
            oView.setModel(this.getConfigurationModel(), "config");

            // listener
            sap.ui.getCore().attachThemeChanged(this._handleThemeApplied, this);

            return this.getDarkModeModel(this.aThemeListFromServer)
                .then(function (oDarkModeModel) {
                    this._oDarkModeModel = oDarkModeModel;
                    oView.setModel(this._oDarkModeModel, "darkMode");

                    // Model for the tab with theme list
                    var oUserTheme = this.oUser.getTheme();
                    oView.setModel(new JSONModel({
                        options: this._getThemeListData(this.aThemeListFromServer, oUserTheme),
                        ariaTexts: { headerLabel: resources.i18n.getText("Appearance") }
                    }));
                }.bind(this));
        },

        onExit: function () {
            sap.ui.getCore().detachThemeChanged(this._handleThemeApplied, this);
        },

        // Return the ID of the currently selected theme in the theme list.
        // If no selection, return the current user theme.
        _getSelectedTheme: function () {
            var oSelectedItem = this.getView().byId("themeList").getSelectedItem();
            var oBindingContext = oSelectedItem ? oSelectedItem.getBindingContext() : null;
            return oBindingContext ? oBindingContext.getProperty("id") : this.oUser.getTheme();
        },

        _getThemeListData: function (aThemeList, sCurrentThemeId) {
            if (this.oUser.isSetThemePermitted() === false) {
                var sName = sCurrentThemeId;
                for (var i = 0; i < aThemeList.length; i++) {
                    if (aThemeList[i].id === sCurrentThemeId) {
                        sName = aThemeList[i].name || sCurrentThemeId;
                        break;
                    }
                }
                return [{
                    id: sCurrentThemeId,
                    name: sName
                }];
            }
            var oDarkModeModelData = this.getView().getModel("darkMode").getData();
            var isDarkModeActive = this._isDarkModeActive();
            return aThemeList.reduce(function (aList, oTheme) {
                var oThemeForModel = {
                    id: oTheme.id,
                    name: oTheme.name || oTheme.id || "",
                    isVisible: true,
                    isSelected: oTheme.id === sCurrentThemeId,
                    isSapTheme: !!SAP_THEMES[oTheme.id]
                };

                if (isDarkModeActive && oDarkModeModelData.supportedThemes[oTheme.id]) {
                    var oThemeDarkModeConfig = oDarkModeModelData.supportedThemes[oTheme.id];
                    if (oThemeDarkModeConfig.complementaryTheme === sCurrentThemeId || oTheme.id === sCurrentThemeId) {
                        // if one theme from pair is selected show selected theme with common name
                        oThemeForModel.isVisible = oTheme.id === sCurrentThemeId;
                    } else {
                        // if theme is not selected, show light theme as combine
                        oThemeForModel.isVisible = oThemeDarkModeConfig.mode === DarkModeSupport.Mode.LIGHT;
                    }
                    // don't change the name, because leads to different sorting and error in onAfterRendering
                    oThemeForModel.combineName = oThemeDarkModeConfig.combineName;
                }

                aList.push(oThemeForModel);
                return aList;
            }, []).sort(function (theme1, theme2) {
                var iOrder = theme1.name.localeCompare(theme2.name);
                if (iOrder === 0) {
                    iOrder = theme1.id.localeCompare(theme2.id);
                }
                return iOrder;
            });
        },

        getConfigurationModel: function () {
            return new JSONModel({
                themeConfigurable: Config.last("/core/shell/model/setTheme"),
                sizeBehaviorConfigurable: Config.last("/core/home/sizeBehaviorConfigurable"),
                tileSize: this.TILE_SIZE[Config.last("/core/home/sizeBehavior")],
                contentDensityConfigurable: Config.last("/core/shell/model/contentDensity") && !Device.system.phone,
                isCozyContentMode: document.body.classList.contains("sapUiSizeCozy"),
                sapUiContentIconColor: Parameters.get("sapUiContentIconColor"),
                textAlign: Device.system.phone ? "Left" : "Right"
            });
        },

        getDarkModeModel: function (aThemeList) {
            var oDarkModeModel = new JSONModel({});
            var oDarkModeModelData = {
                enabled: false,
                detectionSupported: false,
                detectionEnabled: false,
                supportedThemes: {}
            };
            var oPromise;

            if (Config.last("/core/darkMode/enabled")) {
                oPromise = sap.ushell.Container.getServiceAsync("DarkModeSupport")
                    .then(function (oDarkModeSupport) {
                        oDarkModeModelData.enabled = true;
                        oDarkModeModelData.detectionSupported = oDarkModeSupport.canAutomaticallyToggleDarkMode();
                        // if detection is not supported, e.g. due to the "&sap-theme=" URL parameter,
                        // then do not enable dark mode detection disregarding the user setting.
                        oDarkModeModelData.detectionEnabled = oDarkModeModelData.detectionSupported && this.oUser.getDetectDarkMode();
                        oDarkModeModelData.supportedThemes = this._getSupportedDarkModeThemes(aThemeList, Config.last("/core/darkMode/supportedThemes") || []);
                        oDarkModeModel.setData(oDarkModeModelData);
                        return oDarkModeModel;
                    }.bind(this));
            } else {
                oDarkModeModel.setData(oDarkModeModelData);
                oPromise = Promise.resolve(oDarkModeModel);
            }

            return oPromise;
        },

        _getSupportedDarkModeThemes: function (aThemeList, aSupportedThemePairs) {
            var oThemeNamesMap = aThemeList.reduce(function (oResult, oTheme) {
                oResult[oTheme.id] = oTheme.name;
                return oResult;
            }, {});

            return aSupportedThemePairs.reduce(function (oResult, oPair) {
                var sLightThemeId = oPair.light;
                var sDarkThemeId = oPair.dark;
                var sLightThemeName = oThemeNamesMap[sLightThemeId];
                var sDarkThemeName = oThemeNamesMap[sDarkThemeId];

                if (sLightThemeName && sDarkThemeName && !oResult[sLightThemeId] && !oResult[sDarkThemeId]) {
                    // skip if some theme is missing from pair in aThemeList or some of the theme is used (wrong configuration)
                    var sCombineName = getCommonName(sLightThemeId);
                    oResult[sLightThemeId] = {
                        mode: DarkModeSupport.Mode.LIGHT,
                        complementaryTheme: sDarkThemeId,
                        combineName: sCombineName
                    };
                    oResult[sDarkThemeId] = {
                        mode: DarkModeSupport.Mode.DARK,
                        complementaryTheme: sLightThemeId,
                        combineName: sCombineName
                    };
                }
                return oResult;
            }, {});
        },

        onAfterRendering: function () {
            var bDarkModeActive = this._isDarkModeActive();
            var isListSelected = this.getView().getModel("config").getProperty("/themeConfigurable");
            var oList = this.getView().byId("themeList");
            var items = oList.getItems();

            oList.toggleStyleClass("sapUshellThemeListDisabled", !isListSelected);
            items.forEach(function (oListItem) {
                var sThemeId = oListItem.getCustomData()[0].getValue();
                var oIcon = oListItem.getContent()[0].getItems()[0].getItems()[0];

                if (SAP_THEMES[sThemeId]) {
                    oIcon.addStyleClass(SAP_THEMES[sThemeId]);
                }
                oIcon.toggleStyleClass("sapUshellDarkMode", bDarkModeActive); // special icon for combined themes in the dark mode
            });
        },

        _handleThemeApplied: function () {
            var oConfigModel = this.getView().getModel("config");
            if (oConfigModel) {
                oConfigModel.setProperty("/sapUiContentIconColor", Parameters.get("sapUiContentIconColor"));
                // readjusts the theme list after the dark mode change
                var oUserTheme = this.oUser.getTheme();
                var aThemeListData = this._getThemeListData(this.aThemeListFromServer, oUserTheme);

                this.getView().getModel().setProperty("/options", aThemeListData);
            }
        },

        onCancel: function () {
            var oConfigModel = this.getView().getModel("config");

            if (oConfigModel.getProperty("/themeConfigurable")) {
                var sUserTheme = this.oUser.getTheme();
                var aThemeOptions = this.getView().getModel().getProperty("/options");
                aThemeOptions.forEach(function (oThemeOption) {
                    oThemeOption.isSelected = sUserTheme === oThemeOption.id;
                });
                this.getView().getModel().setProperty("/options", aThemeOptions);
            }
            if (oConfigModel.getProperty("/contentDensityConfigurable")) {
                oConfigModel.setProperty("/isCozyContentMode", this.oUser.getContentDensity() === "cozy");
            }
            if (oConfigModel.getProperty("/sizeBehaviorConfigurable")) {
                oConfigModel.setProperty("/tileSize", this.TILE_SIZE[Config.last("/core/home/sizeBehavior")]);
            }
            if (this._oDarkModeModel && this._oDarkModeModel.getProperty("/enabled")) {
                this._oDarkModeModel.setProperty("/detectionEnabled", this.oUser.getDetectDarkMode());
                this.oUser.resetChangedProperty("detectDarkMode");
            }
        },

        /**
         * Save method for all properties of the "Appearance" tab.
         * Includes:
         *   - Preparing each property
         *   - Saving with the given function
         *   - Post processing of save with error handling
         *
         * @param {function} fnUpdateUserPreferences Function that updates the properties.
         * @returns {Promise<undefined|string[]>} Resolves without a value if no error occurs, otherwise rejects with error messages.
         */
        onSave: function (fnUpdateUserPreferences) {
            this._updateUserPreferences = fnUpdateUserPreferences;
            var oConfigModel = this.getView().getModel("config");
            var aSavePromises = [];

            if (oConfigModel.getProperty("/themeConfigurable")) {
                aSavePromises.push(this.onSaveThemes().then(function () {
                    EventHub.emit("themeChanged", Date.now());
                }));
            }

            if (oConfigModel.getProperty("/contentDensityConfigurable")) {
                aSavePromises.push(this.onSaveContentDensity());
            }
            if (oConfigModel.getProperty("/sizeBehaviorConfigurable")) {
                aSavePromises.push(this.onSaveTileSize());
            }
            if (this._oDarkModeModel && this._oDarkModeModel.getProperty("/enabled")) {
                aSavePromises.push(this.onSaveDarkModeEnabled());
            }

            return Promise.all(aSavePromises)
                .then(function (aResults) {
                    var aMessages = [];
                    aResults.forEach(function (sResult) {
                        if (sResult && BaseObject.isA(sResult, "sap.ui.core.message.Message")) {
                            aMessages.push(sResult);
                        }
                    });
                    return (aMessages.length > 0) ? Promise.reject(aMessages) : Promise.resolve();
                });
        },

        onSaveThemesSuccess: function (oUser) {
            oUser.resetChangedProperty("theme");
            return this._applyDarkMode(); // make sure that the dark mode is applied after the theme change
        },

        onSaveThemes: function () {
            var oConfigModel = this.getView().getModel("config");
            var sNewThemeId = this._getSelectedTheme();
            var oUser = this.oUser;
            var sOriginalThemeId = oUser.getTheme(User.prototype.constants.themeFormat.ORIGINAL_THEME);

            if (sNewThemeId && sNewThemeId !== sOriginalThemeId && oConfigModel.getProperty("/themeConfigurable")) {
                oUser.setTheme(sNewThemeId);
                return this._updateUserPreferences(oUser)
                    .then(function () {
                        return this.onSaveThemesSuccess(oUser);
                    }.bind(this))
                    .catch(function (sErrorMessage) {
                        if (!sErrorMessage.includes("THEME")) {
                            return this.onSaveThemesSuccess(oUser);
                        }
                        oUser.setTheme(sOriginalThemeId);
                        oUser.resetChangedProperty("theme");
                        Log.error("Can not save selected theme", sErrorMessage);
                        throw new Message({
                            type: MessageType.Error,
                            description: sErrorMessage
                        });
                    }.bind(this));
            }
            return Promise.resolve();
        },

        _onSaveContentDensitySuccess: function (sNewContentDensity) {
            var oUser = this.oUser;
            oUser.resetChangedProperty("contentDensity");
            sap.ui.getCore().getEventBus().publish("launchpad", "toggleContentDensity", {
                contentDensity: sNewContentDensity
            });
            EventHub.emit("toggleContentDensity", {
                contentDensity: sNewContentDensity
            });
            return new Promise(function (resolve) {
                // resolve the promise _after_ the event has been processed;
                // we need to do this in an event handler, as the EventHub is asynchronous.
                EventHub.once("toggleContentDensity").do(function () {
                    resolve();
                });
            });
        },

        onSaveContentDensity: function () {
            var oConfigModel = this.getView().getModel("config");
            var oUser = this.oUser;
            var sNewContentDensity = oConfigModel.getProperty("/isCozyContentMode") ? "cozy" : "compact";
            var sUserContentDensity = oUser.getContentDensity();
            Log.debug("[000] onSaveContentDensity", "Appearance.controller");
            if (sNewContentDensity !== sUserContentDensity && oConfigModel.getProperty("/contentDensityConfigurable")) {
                oUser.setContentDensity(sNewContentDensity);
                Log.debug("[000] onSaveContentDensity: sNewContentDensity", sNewContentDensity, "Appearance.controller");
                return this._updateUserPreferences(oUser)
                    .then(function () {
                        return this._onSaveContentDensitySuccess(sNewContentDensity);
                    }.bind(this))
                    .catch(function (sErrorMessage) {
                        if (!sErrorMessage.includes("CONTENT_DENSITY")) {
                            return this._onSaveContentDensitySuccess();
                        }
                        oUser.setContentDensity(sUserContentDensity);
                        oUser.resetChangedProperty("contentDensity");
                        Log.error("Can not save content density configuration", sErrorMessage);
                        throw new Message({
                            type: MessageType.Error,
                            message: sErrorMessage
                        });
                    }.bind(this));
            }
            return Promise.resolve();
        },

        onSaveTileSize: function () {
            var oConfigModel = this.getView().getModel("config");
            var sNewSizeBehavior = this.TILE_SIZE.getName(oConfigModel.getProperty("/tileSize")); // take string value, not index
            var sCurrentSizeBehavior = Config.last("/core/home/sizeBehavior");
            if (sNewSizeBehavior && sNewSizeBehavior !== sCurrentSizeBehavior && oConfigModel.getProperty("/sizeBehaviorConfigurable")) {
                return new Promise(function (resolve, reject) {
                    this.writeToPersonalization("flp.settings.FlpSettings", "sizeBehavior", sNewSizeBehavior)
                        .done(function () {
                            Config.emit("/core/home/sizeBehavior", sNewSizeBehavior);
                            // todo move to other place?
                            if (sNewSizeBehavior === "Responsive") {
                                jQuery(".sapUshellTile").removeClass("sapUshellSmall");
                            } else {
                                jQuery(".sapUshellTile").addClass("sapUshellSmall");
                            }
                            resolve();
                        })
                        .fail(function (sErrorMessage, parsedErrorInformation) {
                            Log.error("Cannot save tile size configuration", sErrorMessage);
                            var oMessage = new Message({
                                type: MessageType.Error,
                                description: sErrorMessage,
                                message: parsedErrorInformation.message.value,
                                date: parsedErrorInformation.innererror.timestamp,
                                httpStatus: parsedErrorInformation.httpStatus
                            });
                            reject(oMessage);
                        });
                }.bind(this));
            }
            return Promise.resolve();
        },

        onSaveDarkModeEnabledSuccess: function (oUser, sNewDarkModeEnabled) {
            return sap.ushell.Container.getServiceAsync("DarkModeSupport")
                .then(function (oDarkModeSupport) {
                    oUser.resetChangedProperty("detectDarkMode");
                    if (sNewDarkModeEnabled) {
                        oDarkModeSupport.enableDarkModeBasedOnSystem();
                    } else {
                        oDarkModeSupport.disableDarkModeBasedOnSystem();
                    }
                });
        },

        // Save the value of the Enable Auto Dark Mode Detection switch
        onSaveDarkModeEnabled: function () {
            var sNewDarkModeEnabled = this._oDarkModeModel.getProperty("/detectionEnabled");
            var sOldDarkModeEnabled = this.oUser.getDetectDarkMode();
            var oUser = this.oUser;

            if (sNewDarkModeEnabled !== sOldDarkModeEnabled) {
                Log.debug("[000] onSaveDarkModeEnabled: setDetectDarkModeEnabled", sNewDarkModeEnabled, "Appearance.controller");
                oUser.setDetectDarkMode(sNewDarkModeEnabled);
                return this._updateUserPreferences(this.oUser)
                    .then(function () {
                        return this.onSaveDarkModeEnabledSuccess(oUser, sNewDarkModeEnabled);
                    }.bind(this))
                    .catch(function (sErrorMessage) {
                        if (!sErrorMessage.includes("THEME_DARKMODE_AUTO_DETECTION")) {
                            return this.onSaveDarkModeEnabledSuccess(oUser, sNewDarkModeEnabled);
                        }
                        oUser.setDetectDarkMode(sOldDarkModeEnabled);
                        oUser.resetChangedProperty("detectDarkMode");
                        Log.error("Can not save dark mode configuration", sErrorMessage);
                        throw new Message({
                            message: sErrorMessage
                        });
                    }.bind(this));
            }
            return Promise.resolve();
        },

        /**
         * Calls the Personalization service to write the given value to the backend
         * at the given place identified by the container and item name.
         *
         * @param {string} sContainer The name of the container.
         * @param {string} sItem The name of the item.
         * @param {any} vValue The value to be posted to the personalization service.
         * @returns {Promise} Resolves once the personalization data is written. Rejected if the service fails in doing so.
         */
        writeToPersonalization: function (sContainer, sItem, vValue) {
            return jQuery.when(
                this.getPersonalizer(sContainer, sItem).then(function (oPersonalizer) {
                    return oPersonalizer.setPersData(vValue);
                })
            ).catch(function (oError) {
                Log.error("Personalization service does not work:");
                Log.error(oError.name + ": " + oError.message);
            });
        },

        /**
         * Retrieves a Personalizer instance from the Personalization service and stores it in an internal map.
         *
         * @param {string} sContainer The container ID.
         * @param {string} sItem The item ID.
         * @returns {Promise<object>} Resolves with a new or cached Personalizer instance.
         */
        getPersonalizer: function (sContainer, sItem) {
            var sKey = sContainer + "-" + sItem;

            if (this.oPersonalizers[sKey]) {
                return Promise.resolve(this.oPersonalizers[sKey]);
            }

            return sap.ushell.Container.getServiceAsync("Personalization")
                .then(function (oPersonalizationService) {
                    var oComponent = Component.getOwnerComponentFor(this);
                    var oScope = {
                        keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                        writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                        clientStorageAllowed: true
                    };

                    if (!this.oPersonalizers[sKey]) {
                        this.oPersonalizers[sKey] = oPersonalizationService.getPersonalizer({
                            container: sContainer,
                            item: sItem
                        }, oScope, oComponent);
                    }

                    return this.oPersonalizers[sKey];
                }.bind(this));
        },

        // applies dark mode after the user has selected a new theme
        _applyDarkMode: function () {
            var oModel = this._oDarkModeModel;
            var oPromise;
            if (oModel.getProperty("/enabled") && oModel.getProperty("/detectionSupported") && oModel.getProperty("/detectionEnabled")) {
                oPromise = sap.ushell.Container.getServiceAsync("DarkModeSupport")
                    .then(function (oDarkModeSupport) {
                        oDarkModeSupport._toggleDarkModeBasedOnSystemColorScheme();
                    });
            } else {
                oPromise = Promise.resolve();
            }

            return oPromise;
        },

        _isDarkModeActive: function () {
            var oModelData = this._oDarkModeModel.getProperty("/");
            return oModelData.enabled && oModelData.detectionSupported && oModelData.detectionEnabled;
        },

        changeSystemModeDetection: function () {
            // update the theme list after the dark mode detection is changed by the user
            var oUserTheme = this._getSelectedTheme();
            this.getView().getModel().setProperty("/options", this._getThemeListData(this.aThemeListFromServer, oUserTheme));
            this.getView().invalidate();
        }
    });
});
