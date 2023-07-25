// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils"
], function (
    Controller,
    JSONModel,
    Log,
    Config,
    resources,
    MessageBox,
    MessageToast,
    ushellUtils,
    windowUtils
) {
    "use strict";

    return Controller.extend("sap.ushell.components.shell.Settings.userAccount.UserAccountSelector", {
        onInit: function () {
            var oShellConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig(),
                bEnableUserImgConsent = oShellConfig.enableUserImgConsent;
            //determines whether the User Image consent feature is enabled
            this.imgConsentEnabled = bEnableUserImgConsent || false;
            this.oUser = sap.ushell.Container.getUser();

            var oResourceModel = resources.getTranslationModel();
            var oConfigModel = this.getConfigurationModel();
            this.getView().setModel(oResourceModel, "i18n");
            this.getView().setModel(oConfigModel, "config");

            this.oUser.attachOnSetImage(function () {
                oConfigModel.setProperty("/icon", Config.last("/core/shell/model/userImage/personPlaceHolder"));
            });

            sap.ushell.Container.getServiceAsync("Personalization")
                .then(function (oPersonalizationService) {
                    return oPersonalizationService.isResetEntirePersonalizationSupported()
                        .then(function (bIsResetPersonalizationSupported) {
                            if (!bIsResetPersonalizationSupported) {
                                oConfigModel.setProperty("/isResetPersonalizationVisible", false);
                            }
                        });
                })
                .catch(function (oError) {
                    Log.error("The personalization service could not be loaded because of: ." + oError.toString());
                });
        },

        getConfigurationModel: function () {
            var oModel = new JSONModel({}),
                oUser = sap.ushell.Container.getUser(),
                sIcon = Config.last("/core/shell/model/userImage/personPlaceHolder") || "sap-icon://person-placeholder";
            oModel.setData({
                icon: sIcon,
                name: oUser.getFullName(),
                mail: oUser.getEmail(),
                server: window.location.host,
                imgConsentEnabled: this.imgConsentEnabled, //to show second tab
                isImageConsentForUser: oUser.getImageConsent(), //CheckBox state
                isResetPersonalizationVisible: this.isResetPersonalizationVisible || true
            });
            return oModel;
        },

        onCancel: function () {
            if (this.imgConsentEnabled) {
                this.getView().getModel("config").setProperty("/isImageConsentForUser", this.oUser.getImageConsent());
            }
        },

        onSave: function (fnUpdateUserPreferences) {
            if (this.imgConsentEnabled) {
                return this.onSaveUserImgConsent(fnUpdateUserPreferences);
            }
            return Promise.resolve();
        },

        onSaveUserImgConsent: function (fnUpdateUserPreferences) {
            var oUser = this.oUser,
                bOrigUserImgConsent = oUser.getImageConsent(),
                oModel = this.getView().getModel("config"),
                bCurrentUserImgConsent = oModel.getProperty("/isImageConsentForUser"),
                oUserPreferencesPromise;
                Log.debug("[000] onSaveUserImgConsent:current", bCurrentUserImgConsent, "UserAccountSelector.controller");
                Log.debug("[000] onSaveUserImgConsent:original", bOrigUserImgConsent, "UserAccountSelector.controller");
            if (bOrigUserImgConsent !== bCurrentUserImgConsent) { //only if there was a change we would like to save it
                // set the user's image consent
                oUser.setImageConsent(bCurrentUserImgConsent);
                return new Promise(function (resolve, reject) {
                    oUserPreferencesPromise = fnUpdateUserPreferences();
                    oUserPreferencesPromise.then(function () {
                        oUser.resetChangedProperty("isImageConsent");
                        resolve();
                    });
                    oUserPreferencesPromise.catch(function (sErrorMessage) {
                        if (!sErrorMessage.includes("ISIMAGECONSENT")) {
                            oUser.resetChangedProperty("isImageConsent");
                            resolve();
                        } else {
                            // Apply the previous display density to the user
                            oUser.setImageConsent(bOrigUserImgConsent);
                            oUser.resetChangedProperty("isImageConsent");
                            oModel.setProperty("/isImageConsentForUser", bOrigUserImgConsent);
                            Log.error(sErrorMessage);
                            reject(sErrorMessage);
                        }
                    });
                });

            }
            return Promise.resolve();
        },

        termsOfUserPress: function () {
            var termsOfUseTextBox = this.getView().byId("termsOfUseTextFlexBox"),
                termsOfUseLink = this.getView().byId("termsOfUseLink"),
                isTermsOfUseVisible = termsOfUseTextBox.getVisible();

            termsOfUseTextBox.setVisible(!isTermsOfUseVisible);
            termsOfUseLink.setText(resources.i18n.getText(isTermsOfUseVisible ? "userImageConsentDialogShowTermsOfUse"
                : "userImageConsentDialogHideTermsOfUse"));

        },

        showMessageBoxWarningDeletePersonalization: function () {
            MessageBox.warning(resources.i18n.getText("userAccountResetPersonalizationWarningDialogDescription"), {
                onClose: this.resetEntirePersonalization.bind(this),
                actions: [ MessageBox.Action.OK, MessageBox.Action.CANCEL ],
                contentWidth: "600px"
            });
        },

        resetEntirePersonalization: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
                this.getView().setBusy(true);
                sap.ushell.Container.getServiceAsync("Personalization")
                    .then(function (oPersonalizationService) {
                        return oPersonalizationService.resetEntirePersonalization()
                            .then(function () {
                                MessageToast.show(resources.i18n.getText("userAccountResetPersonalizationWarningDialogSuccessToast"), {
                                    onClose: windowUtils.refreshBrowser
                                });
                            })
                            .catch(this.showErrorMessageBox.bind(this));
                    }.bind(this))
                    .catch(this.showErrorMessageBox.bind(this))
                    .finally(function () {
                        this.getView().setBusy(false);
                    }.bind(this));
            }
        },

        showErrorMessageBox: function () {
            MessageBox.error(resources.i18n.getText("userAccountResetPersonalizationWarningDialogErrorDialog"), {
                actions: MessageBox.Action.CLOSE,
                contentWidth: "600px"
            });
        }
    });
});
