// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/UriParameters",
    "sap/ui/core/Configuration",
    "sap/ui/core/Locale",
    "sap/ui/core/LocaleData",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/performance/Measurement"
], function (
    Log,
    UriParameters,
    Configuration,
    Locale,
    LocaleData,
    Controller,
    JSONModel,
    Measurement
) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userLanguageRegion.LanguageRegionSelector", {
        onInit: function () {
            this.oUserInfoServicePromise = sap.ushell.Container.getServiceAsync("UserInfo");
            return this.oUserInfoServicePromise
                .then(function (UserInfo) {
                    this.oUser = sap.ushell.Container.getUser();

                    var oLocale = Configuration.getFormatSettings().getFormatLocale();
                    var oLocaleData = LocaleData.getInstance(oLocale);
                    var sDatePattern, sTimePattern, sTimeFormat, sNumberFormat;

                    var bIsEnableSetLanguage = sap.ushell.Container.getRenderer("fiori2").getShellConfig().enableSetLanguage || false;
                    var bIsLanguagePersonalized = this.oUser.isLanguagePersonalized();
                    var bIsEnableSetUserPreference = UserInfo.getUserSettingListEditSupported();//Check if adapter supports user setting editing

                    var aUserPreferenceAndLanguageSettingPromises = [];
                    if (bIsEnableSetUserPreference) {
                        var oFormatSetting = Configuration.getFormatSettings();
                        sDatePattern = oFormatSetting.getLegacyDateFormat();
                        sTimeFormat = oFormatSetting.getLegacyTimeFormat();
                        sNumberFormat = this._getLegacyNumberFormat(oFormatSetting);
                        aUserPreferenceAndLanguageSettingPromises.push(this._loadUserSettingList());
                    } else {
                        sDatePattern = oLocaleData.getDatePattern("medium");
                        sTimePattern = oLocaleData.getTimePattern("medium");
                        sTimeFormat = (sTimePattern.indexOf("H") === -1) ? "12h" : "24h";
                    }

                    var oModel = new JSONModel({
                        languageList: null,
                        DateFormatList: null,
                        TimeFormatList: null,
                        NumberFormatList: null,
                        TimeZoneList: null,
                        selectedLanguage: this.oUser.getLanguage(),
                        selectedLanguageText: this.oUser.getLanguageText(),
                        selectedDatePattern: sDatePattern,
                        selectedTimeFormat: sTimeFormat,
                        selectedNumberFormat: sNumberFormat,
                        selectedTimeZone: this.oUser.getTimeZone(),
                        isSettingsLoaded: true,
                        isLanguagePersonalized: bIsLanguagePersonalized,
                        isEnableSetLanguage: bIsEnableSetLanguage,
                        isEnableUserProfileSetting: bIsEnableSetUserPreference,
                        isTimeZoneIanaAvailable: true
                    });
                    oModel.setSizeLimit(1000);

                    var sTimeZoneIana = sap.ushell.Container.getUser().getTimeZoneIana();
                    if (sTimeZoneIana === undefined || (sTimeZoneIana !== "" && typeof sTimeZoneIana === "string")) {
                        oModel.setProperty("/isTimeZoneIanaAvailable", false);
                    }

                    if (bIsEnableSetLanguage) {
                        aUserPreferenceAndLanguageSettingPromises.push(this._loadLanguagesList());
                    }
                    if (aUserPreferenceAndLanguageSettingPromises.length > 0) {
                        this.getView().setBusy(true);
                        return Promise.all(aUserPreferenceAndLanguageSettingPromises).then(function (aResults) {

                            var aUserSettingList = bIsEnableSetUserPreference ? aResults[0] : null;
                            var aLanguageList = null;
                            if (bIsEnableSetLanguage) {
                                aLanguageList = aResults.length === 1 ? aResults[0] : aResults[1];
                            }


                            if (aLanguageList && aLanguageList.length > 1) {
                                oModel.setProperty("/languageList", aLanguageList);
                                var bHasDefault = aLanguageList.some(function (oLanguage) {
                                    return oLanguage.key === "default";
                                });
                                if (!bIsLanguagePersonalized && bHasDefault) {
                                    oModel.setProperty("/selectedLanguage", "default");
                                }
                            }
                            if (aUserSettingList && aUserSettingList.TIME_FORMAT && aUserSettingList.TIME_FORMAT.length > 0) {
                                oModel.setProperty("/TimeFormatList", aUserSettingList.TIME_FORMAT);
                            }
                            if (aUserSettingList && aUserSettingList.DATE_FORMAT && aUserSettingList.DATE_FORMAT.length > 0) {
                                oModel.setProperty("/DateFormatList", aUserSettingList.DATE_FORMAT);
                            }
                            if (aUserSettingList && aUserSettingList.TIME_ZONE && aUserSettingList.TIME_ZONE.length > 0) {
                                oModel.setProperty("/TimeZoneList", aUserSettingList.TIME_ZONE);
                            }
                            if (aUserSettingList && aUserSettingList.NUMBER_FORMAT && aUserSettingList.NUMBER_FORMAT.length > 0) {
                                oModel.setProperty("/NumberFormatList", aUserSettingList.NUMBER_FORMAT);
                            }

                            this.oView.setModel(oModel);
                            this.getView().setBusy(false);
                        }.bind(this));
                    }
                    this.oView.setModel(oModel);
                }.bind(this));
        },

        /**
         * Load language via userInfoService API
         * @returns {Promise} the language list from the platforms
         * @private
         */
        _loadLanguagesList: function () {
            Measurement.start("FLP:LanguageRegionSelector._getLanguagesList", "_getLanguagesList", "FLP");
            return this.oUserInfoServicePromise
                .then(function (UserInfo) {
                    return new Promise(function (resolve) {
                        Measurement.start("FLP:LanguageRegionSelector._getLanguagesList", "_getLanguagesList", "FLP");
                        UserInfo.getLanguageList()
                            .done(function (oData) {
                                Measurement.end("FLP:LanguageRegionSelector._getLanguagesList");
                                resolve(oData);
                            })
                            .fail(function (error) {
                                Measurement.end("FLP:LanguageRegionSelector._getLanguagesList");
                                Log.error("Failed to load language list.", error,
                                    "sap.ushell.components.ushell.settings.userLanguageRegion.LanguageRegionSelector.controller");
                                resolve(null);
                            });
                    });
                });
        },

        /**
         * Load User Profile settings List via userInfoService API
         * @returns {Promise} the Language List ,Date Format List,Time Format list and Time Zone List from the platforms
         * @private
         */
        _loadUserSettingList: function () {
            Measurement.start("FLP:LanguageRegionSelector._loadUserSettingList", "_loadUserSettingList", "FLP");
            return this.oUserInfoServicePromise
                .then(function (UserInfo) {
                    return new Promise(function (resolve) {
                        Measurement.start("FLP:LanguageRegionSelector._loadUserSettingList", "_loadUserSettingList", "FLP");
                        UserInfo.getUserSettingList()
                            .then(function (oData) {
                                Measurement.end("FLP:LanguageRegionSelector._loadUserSettingList");
                                resolve(oData);
                            });
                    });
                });
        },


        onCancel: function () {
            var oModel = this.getView().getModel(),
                oModelData = oModel.getData(),
                aLanguageList = oModelData.languageList,
                isEnableSetLanguage = oModelData.isEnableSetLanguage;
            if (isEnableSetLanguage && aLanguageList) {
                var oUserLanguage = this.oUser.getLanguage();
                // if the user language isn't personalzied - need to return browser language in select
                var sSelectedLanguage = oModelData.isLanguagePersonalized ? oUserLanguage : "default";
                oModel.setProperty("/selectedLanguage", sSelectedLanguage);
                //Date and time format are taken from current language
                this._updateTextFields(oUserLanguage);
            }
            if (oModelData.isEnableUserProfileSetting) {
                this._restoreUserSettingPreferenceValues();
            }
        },
        onSaveSuccess: function (oUser, bUpdateLanguage, sSelectedLanguage) {
            var oResolvedResult = {
                refresh: true
            };
            oUser.resetChangedProperty("dateFormat");
            oUser.resetChangedProperty("timeFormat");
            oUser.resetChangedProperty("numberFormat");
            oUser.resetChangedProperty("timeZone");
            if (bUpdateLanguage) {
                Log.debug("[000] onSaveSuccess: oUser.resetChangedPropertyLanguage:", "LanguageRegionSelector.controller");
                oUser.resetChangedProperty("language");
                oResolvedResult.obsoleteUrlParams = ["sap-language"];
            }
            return oResolvedResult; //refresh the page to apply changes.
        },

        /**
         * Event fired on the Save of the Language and Region Settings
         * @param {function} fnUpdateUserPreferences A function to update user preferences.
         * @returns {Promise<object>} oResolvedResult Promise that resolves with the save result containing urlParams and a refresh parameter
         *    and rejects with a message object.
         * @private
         */
        onSave: function (fnUpdateUserPreferences) {
            var oUser = this.oUser,
                oModelData = this.getView().getModel().getData(),
                sSelectedLanguage = oModelData.selectedLanguage,
                sOriginLanguage = oUser.getLanguage(),
                bLanguageChanged = sSelectedLanguage !== (oModelData.isLanguagePersonalized ? sOriginLanguage : "default"),
                bIsEnableSetUserProfileSetting = oModelData.isEnableUserProfileSetting,
                bUpdateLanguage = oModelData.isEnableSetLanguage && oModelData.languageList && bLanguageChanged,
                bUpdate = false,
                aPropertyNames = [
                    "DATE_FORMAT",
                    "TIME_FORMAT",
                    "NUMBER_FORMAT",
                    "TIME_ZONE",
                    "LANGUAGE"
                ];
            Log.debug("[000] LanguageRegionSelector:onSave:bUpdateLanguage, bIsEnableSetUserProfileSetting:", bUpdateLanguage, "LanguageRegionSelector.controller");
            if (bUpdateLanguage) {
                Log.debug("[000] LanguageRegionSelector:onSave:UserInfo: oUser.setLanguage:", sSelectedLanguage, "LanguageRegionSelector.controller");
                oUser.setLanguage(sSelectedLanguage);
            }

            if (bIsEnableSetUserProfileSetting) {
                var oFormatSetting = Configuration.getFormatSettings();
                if (oFormatSetting.getLegacyDateFormat() !== oModelData.selectedDatePattern) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "dateFormat",
                        name: "DATE_FORMAT"
                    }, oFormatSetting.getLegacyDateFormat(), oModelData.selectedDatePattern);
                }
                if (oFormatSetting.getLegacyTimeFormat() !== oModelData.selectedTimeFormat) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "timeFormat",
                        name: "TIME_FORMAT"
                    }, oFormatSetting.getLegacyTimeFormat(), oModelData.selectedTimeFormat);
                }

                if (this._getLegacyNumberFormat(oFormatSetting) !== oModelData.selectedNumberFormat) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "numberFormat",
                        name: "NUMBER_FORMAT"
                    }, this._getLegacyNumberFormat(oFormatSetting), oModelData.selectedNumberFormat);
                }
                if (this.oUser.getTimeZone() !== oModelData.selectedTimeZone) {
                    bUpdate = true;
                    oUser.setChangedProperties({
                        propertyName: "timeZone",
                        name: "TIME_ZONE"
                    }, this.oUser.getTimeZone(), oModelData.selectedTimeZone);
                }
            }
            if (bUpdateLanguage || bUpdate) {
                return fnUpdateUserPreferences()
                    .then(function () {
                        Log.debug("[000] onSave:fnUpdateUserPreferences", "LanguageRegionSelector.controller");
                        return this.onSaveSuccess(oUser, bUpdateLanguage, sSelectedLanguage);
                    }.bind(this))
                    // in case of failure - return to the original language
                    .catch(function (errorMessage) {
                        Log.debug("[000] onSave:catch:errorMessage", errorMessage, "LanguageRegionSelector.controller");
                        var bSomeNamesInErrorMessage = aPropertyNames.some(function (sName) {
                            return errorMessage.includes(sName);
                        });
                        if (!bSomeNamesInErrorMessage) {
                            return this.onSaveSuccess(oUser, bUpdateLanguage, sSelectedLanguage);
                        }
                        if (bUpdateLanguage) {
                            oUser.setLanguage(sOriginLanguage);
                            oUser.resetChangedProperty("language");
                            this._updateTextFields(sOriginLanguage);
                        }
                        oUser.resetChangedProperty("dateFormat");
                        oUser.resetChangedProperty("timeFormat");
                        oUser.resetChangedProperty("numberFormat");
                        oUser.resetChangedProperty("timeZone");

                        if (oModelData.isEnableUserProfileSetting) {
                            this._restoreUserSettingPreferenceValues();
                        }
                        Log.error("Failed to save Language and Region Settings", errorMessage,
                            "sap.ushell.components.ushell.settings.userLanguageRegion.LanguageRegionSelector.controller");
                        throw errorMessage;
                    }.bind(this));
            }
            return Promise.resolve();
        },
        /**
         * Restores the User settings Preference original values
         *
         * @private
         */
        _restoreUserSettingPreferenceValues: function () {
            var oModel = this.getView().getModel();
            var oFormatSetting = Configuration.getFormatSettings();
            oModel.setProperty("/selectedDatePattern", oFormatSetting.getLegacyDateFormat());
            oModel.setProperty("/selectedTimeFormat", oFormatSetting.getLegacyTimeFormat());
            oModel.setProperty("/selectedNumberFormat", this._getLegacyNumberFormat(oFormatSetting));
            oModel.setProperty("/selectedTimeZone", this.oUser.getTimeZone());
        },


        /**
         * This method call handle the change in the selection language
         * @param {string} oEvent control event
         * @private
         */
        _handleSelectChange: function (oEvent) {
            var sSelectedLanguage = oEvent.getParameters().selectedItem.getKey();
            this._updateTextFields(sSelectedLanguage);
        },

        /**
         * Update Date and Time text fields
         * @param {string} language the newly selected language
         * @private
         */
        _updateTextFields: function (language) {
            var oLocale;

            if (language === this.oUser.getLanguage()) {
                oLocale = Configuration.getFormatSettings().getFormatLocale();
            } else {
                oLocale = new Locale(language);
            }

            var oModel = this.getView().getModel(),
                oLocaleData = LocaleData.getInstance(oLocale),
                sDatePattern = oLocaleData.getDatePattern("medium"),
                sTimePattern = oLocaleData.getTimePattern("medium"),
                sTimeFormat = (sTimePattern.indexOf("H") === -1) ? "12h" : "24h";
            if (!oModel.getData().isEnableUserProfileSetting) {
                oModel.setProperty("/selectedDatePattern", sDatePattern);
                oModel.setProperty("/selectedTimeFormat", sTimeFormat);
            }
        },

        /**
         * Returns the legacy number format from the core Configuration.
         * ATTENTION: We store the legacy number format as a string with a space character (" ") in the core config, while
         * the key returned by the backend is an empty string (""). Therefore we must convert it to empty string to make
         * valid comparisons.
         *
         * @param {object} oFormatSetting The object with format settings.
         * @returns {string|undefined} The number format if it exists or undefined if not.
         * @private
         */
        _getLegacyNumberFormat: function (oFormatSetting) {
            var sLegacyNumberFormat = oFormatSetting.getLegacyNumberFormat();
            if (sLegacyNumberFormat) {
                return sLegacyNumberFormat.trim();
            }
        }
    });
});
