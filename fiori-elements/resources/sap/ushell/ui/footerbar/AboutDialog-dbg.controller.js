// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/base/Log",
    "sap/base/util/isEmptyObject",
    "sap/ui/Device"
], function (
    Controller,
    Fragment,
    JSONModel,
    AppConfiguration,
    Config,
    resources,
    Log,
    isEmptyObject,
    Device
) {
    "use strict";
    return Controller.extend("sap.ushell.ui.footerbar.AboutDialog.controller", {

        /**
         * Triggered before the About Dialog is opened. Sets up it's model.
         * @since 1.89.0
         * @private
         */
        onBeforeOpen: function () {
            this._setupAboutDialogModel();
        },

        /**
         * Triggered when the About Dialog's "OK" button is pressed.
         * @since 1.89.0
         * @private
         */
        onClose: function () {
            this._getDialog().close();
        },

        /**
         * Destroys the About Dialog control.
         * @since 1.89.0
         * @private
         */
        onAfterClose: function () {
            this._getDialog().destroy();
        },

        /**
         * Retrieves the About Dialog control by its ID, stores it into a local variable and returns it.
         * @returns {sap.m.Dialog} The About Dialog control.
         * @since 1.89.0
         */
        _getDialog: function () {
            if (!this.oAboutDialog) {
                this.oAboutDialog = Fragment.byId("aboutDialogFragment", "aboutDialog");
            }
            return this.oAboutDialog;
        },

        /**
         * Retrieve all data needed to build the dialog and store it into a model.
         * @since 1.89.0
         * @private
         */
        _setupAboutDialogModel: function () {
            this._setupAppInfoModel().catch(function (error) {
                Log.error("Failed to setup application info model.", error);
            });

            var oAboutDialog = this._getDialog(),
                oSystemInformation = this._getSystemInformation(),
                oUserEnvironmentInformation = this._getUserEnvironmentInformation(),
                oSystemInformationModel = new JSONModel(oSystemInformation),
                oUserEnvironmentModel = new JSONModel(oUserEnvironmentInformation);

            oAboutDialog.setModel(oSystemInformationModel, "SysInfo");
            oAboutDialog.setModel(oUserEnvironmentModel, "UserEnvInfo");
        },

        _setupAppInfoModel: function () {
            var aAppInfoParameters = [
                    "appId",
                    "appVersion",
                    "appSupportInfo",
                    "technicalAppComponentId",
                    "appFrameworkId",
                    "appFrameworkVersion",
                    "appTitle"
                ],
                oAboutDialog = this._getDialog();

            return new Promise(function (resolve, reject) {
                sap.ushell.Container.getServiceAsync("AppLifeCycle")
                    .then(function (oAppLifeCycle) {
                        var oCurrentApplication = oAppLifeCycle.getCurrentApplication();
                        return Promise.all([
                            oCurrentApplication.getInfo(aAppInfoParameters),
                            this._getContentProviderLabel(oCurrentApplication)
                        ]);
                    }.bind(this))
                    .then(function (aResults) {
                        var oMetaData = AppConfiguration.getMetadata(),
                            oInfo = aResults[0] || {},
                            sProviderId = aResults[1];

                        aAppInfoParameters = aAppInfoParameters.concat([
                            "contentProviderLabel"
                        ]);
                        oInfo.appTitle = (oInfo.appTitle && typeof oInfo.appTitle === "string" && oInfo.appTitle.length > 0) ? oInfo.appTitle : oMetaData.title;
                        oInfo.contentProviderLabel = sProviderId;

                        var oApplicationInformation = this._buildApplicationInformationObject(aAppInfoParameters, oInfo);
                        oAboutDialog.setModel(new JSONModel(oApplicationInformation), "AppInfo");
                        resolve();
                    }.bind(this))
                    .catch(function (error) {
                        reject(error);
                    });

            }.bind(this));

        },

        _buildApplicationInformationObject: function (appInfoParameters, parameterInfo) {
            var oApplicationInformation = {},
                sParameterName;
            for (var i = 0; i < appInfoParameters.length; i++) {
                sParameterName = appInfoParameters[i];
                if (parameterInfo[sParameterName]) {
                    oApplicationInformation[sParameterName] = {
                        label: resources.i18n.getText(sParameterName),
                        text: parameterInfo[sParameterName]
                    };
                }
            }

            return oApplicationInformation;
        },

        _getSystemInformation: function () {
            var oLogonSystem = sap.ushell.Container.getLogonSystem(),
                sProductName = oLogonSystem.getProductName(),
                sProductVersion = oLogonSystem.getProductVersion(),
                sSystemName = oLogonSystem.getSystemName(),
                sSystemRole = oLogonSystem.getSystemRole(),
                sTenantRole = oLogonSystem.getTenantRole(),
                oSystemInformation = {};
            if (sProductName) {
                oSystemInformation.productName = {
                    label: resources.i18n.getText("productName"),
                    text: sProductName
                };
            }
            if (sProductVersion) {
                oSystemInformation.productVersion = {
                    label: resources.i18n.getText("productVersionFld"),
                    text: sProductVersion
                };
            }
            if (sSystemName) {
                oSystemInformation.systemName = {
                    label: resources.i18n.getText("systemName"),
                    text: sSystemName
                };
            }
            if (sSystemRole) {
                oSystemInformation.systemRole = {
                    label: resources.i18n.getText("systemRole"),
                    text: sSystemRole
                };
            }
            if (sTenantRole) {
                oSystemInformation.tenantRole = {
                    label: resources.i18n.getText("tenantRole"),
                    text: sTenantRole
                };
            }

            return oSystemInformation;
        },

        _getUserEnvironmentInformation: function () {
            var oUserEnvironmentInformation = {};

            oUserEnvironmentInformation.userAgentFld = {
                label: resources.i18n.getText("userAgentFld"),
                text: navigator.userAgent
            };
            var sDeviceType = this._getDeviceType(),
                bTouchSupported = this._isTouchSupported(),
                oUser = sap.ushell.Container.getUser(),
                sTheme = oUser.getTheme(),
                bOptimizedForTouchInput = oUser.getContentDensity() === "cozy";

            if (sDeviceType) {
                oUserEnvironmentInformation.deviceType = {
                    label: resources.i18n.getText("deviceType"),
                    text: sDeviceType
                };
            }
            oUserEnvironmentInformation.touchSupported = {
                label: resources.i18n.getText("touchSupported"),
                text: bTouchSupported ? resources.i18n.getText("yes") : resources.i18n.getText("no")
            };
            oUserEnvironmentInformation.activeTheme = {
                label: resources.i18n.getText("activeTheme"),
                text: sTheme
            };
            oUserEnvironmentInformation.optimizedForTouch = {
                label: resources.i18n.getText("AppearanceContentDensityLabel"),
                text: bOptimizedForTouchInput ? resources.i18n.getText("yes") : resources.i18n.getText("no")
            };

            return oUserEnvironmentInformation;
        },

        _getContentProviderLabel: function (oApplication) {
            if (Config.last("/core/contentProviders/providerInfo/enabled")) {
                return oApplication.getSystemContext().then(function (oSystemContext) {
                    return oSystemContext.label;
                });
            }
            return Promise.resolve(undefined);
        },

        _getDeviceType: function () {
            var sDeviceType;
            if (Device.system.combi) {
                sDeviceType = resources.i18n.getText("configuration.form_factor_combi");
            } else if (Device.system.desktop) {
                sDeviceType = resources.i18n.getText("configuration.form_factor_desktop");
            } else if (Device.system.tablet) {
                sDeviceType = resources.i18n.getText("configuration.form_factor_tablet");
            } else if (Device.system.phone) {
                sDeviceType = resources.i18n.getText("configuration.form_factor_phone");
            }
            return sDeviceType;
        },

        _isTouchSupported: function () {
            return Device.support.touch && (Device.system.tablet || Device.system.phone || Device.system.combi);
        },

        /**
         * Formatter function to calculate the number of columns displayed in a form depending on the model content.
         * @param {object} modelData The object that stores the form's data.
         * @returns {int} Returns 1 in case there is a maximum of two properties in the object. Otherwise returns 2.
         * @since 1.89.0
         * @private
         */
        calculateNumberOfColumns: function (modelData) {
            if (!this.isFormVisible(modelData)) {
                return 1;
            }
            return Object.keys(modelData).length > 1 ? 2 : 1;
        },

        /**
         * Formatter function to check if a form should be visible on the About Dialog.
         * @param {object} modelData The object that stores the form's data.
         * @returns {boolean} Returns false in case the object is empty or undefined. Otherwise returns true.
         * @since 1.89.0
         * @private
         */
        isFormVisible: function (modelData) {
            return !!modelData && !isEmptyObject(modelData);
        }
    });
});
