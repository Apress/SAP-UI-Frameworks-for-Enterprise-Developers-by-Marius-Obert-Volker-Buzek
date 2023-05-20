// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/Device",
    "sap/ushell/Config",
    "sap/ushell/UserActivityLog",
    "sap/base/Log",
    "sap/ui/core/Component"
], function (
    Device,
    Config,
    UserActivityLog,
    Log,
    Component
) {
    "use strict";

    var oSharedComponentUtils = {
        PERS_KEY: "flp.settings.FlpSettings",
        bFlpSettingsAdded: false,

        /**
         * Toggles the UserActivityLog.
         */
        toggleUserActivityLog: function () {
            Config
                .on("/core/extension/SupportTicket")
                .do(function (bConfigured) {
                    if (bConfigured) {
                        UserActivityLog.activate();
                    } else {
                        UserActivityLog.deactivate();
                    }
                });
        },

        /**
         * Registers component keys.
         */
        initializeAccessKeys: function () {
            if (Device.system.desktop) {
                sap.ui.require([
                    "sap/ushell/components/ComponentKeysHandler",
                    "sap/ushell/renderers/fiori2/AccessKeysHandler"
                ], function (ComponentKeysHandler, AccessKeysHandler) {
                    ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                        AccessKeysHandler.registerAppKeysHandler(ComponentKeysHandlerInstance.handleFocusOnMe);
                    });
                });
            }
        },

        /**
         * Retrieves the value of the given config path from the personalization service.
         * If the "enableHomePageSettings" config is explicitly set to false, the value is taken from the FLP config.
         * The personalization item ID is extracted from the given config path.
         *
         * @param {string} sConfigPath The config path.
         * @param {string} [sConfigurablePath] The config path that enables/disables changing the "sConfigPath" config.
         * @returns {Promise<any>} Resolves to the effective config value.
         */
        getEffectiveHomepageSetting: function (sConfigPath, sConfigurablePath) {
            var oPersonalizationPromise,
                bEnabled = Config.last(sConfigurablePath) !== false,
                sItemID = sConfigPath.split("/").reverse()[0];

            // Unless explicitly turned off, enable home page settings.
            if (bEnabled) {
                oPersonalizationPromise = this._getPersonalization(sItemID);
            } else {
                oPersonalizationPromise = Promise.resolve();
            }

            return oPersonalizationPromise
                .then(function (sValue) {
                    sValue = sValue || Config.last(sConfigPath);

                    if (sValue !== undefined) {
                        Config.emit(sConfigPath, sValue);
                    }

                    return sValue;
                })
                .catch(function () {
                    return Config.last(sConfigPath);
                });
        },

        /**
         * Retrieves the data of the given personalization item.
         *
         * @param {string} sItem The personalization item ID;
         * @returns {jQuery.Deferred} Resolves to the requested config value.
         * @private
         */
        _getPersonalization: function (sItem) {
            return oSharedComponentUtils.getPersonalizer(sItem, sap.ushell.Container.getRenderer("fiori2"))
                .then(function (oPersonalizer) {
                    return new Promise(function (fnResolve, fnReject) {
                        oPersonalizer.getPersData()
                            .done(fnResolve)
                            .fail(function (sError) {
                                Log.error("Failed to load " + sItem + " from the personalization", sError, "sap.ushell.components.flp.settings.FlpSettings");
                                fnReject();
                            });
                    });
                });
        },

        /**
         * @param {string} sItem The personalization item ID.
         * @param {object} oComponent The component the personalization is to be retrieved for.
         * @returns {jQuery.Deferred} Resolves to the personalization content of the given item.
         * @private
         */
        getPersonalizer: function (sItem, oComponent) {
            return sap.ushell.Container.getServiceAsync("Personalization")
                .then(function (oPersonalizationService) {
                    var oOwnerComponent = Component.getOwnerComponentFor(oComponent);
                    var oScope = {
                        keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                        writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                        clientStorageAllowed: true
                    };
                    var oPersId = {
                        container: this.PERS_KEY,
                        item: sItem
                    };

                    return oPersonalizationService.getPersonalizer(oPersId, oScope, oOwnerComponent);
                }.bind(this));
        }
    };

    return oSharedComponentUtils;
});
