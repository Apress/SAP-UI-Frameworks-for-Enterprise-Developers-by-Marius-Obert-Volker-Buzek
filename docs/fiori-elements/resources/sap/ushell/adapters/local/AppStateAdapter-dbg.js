// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's appState adapter for the local platform.
 *   TODO will be replaced by true persistence within this SP!
 *   This adapter delegates to the Personalization Adapter
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/services/_AppState/AppStatePersistencyMethod",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], function (AppStatePersistencyMethod, jQuery, Log) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's personalization service only.
     * Constructs a new instance of the personalization adapter for the local
     * platform.
     *
     * @param {object}
     *            oSystem the system served by the adapter
     * @param {string} sParameters
     *            Parameter string, not in use
     * @param {object} oConfig
     *            a potential Adapter Configuration
     * @class The Unified Shell's personalization adapter for the local platform.
     *
     * @constructor
     * @since 1.28.0
     * @private
     */
    var AppStateAdapter = function (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
    };

    AppStateAdapter.prototype._getPersonalizationService = function () {
        return sap.ushell.Container.getServiceAsync("Personalization");
    };

    /**
     * save the given data sValue for the given key at the persistence layer
     * @param {string} sKey
     *            the Key value of the Application state to save,
     *            (less than 40 characters)
     * @param {string} sSessionKey
     *            a Session key (40 characters)
     *            overwriting/modifying an existing record is only permitted if the
     *            session key matches the key of the initial creation.
     *            It shall be part of the save request, but shall not be returned on reading
     *            (it is not detectable from outside).
     * @param {string} sValue
     *            the value to persist under the given key
     * @param {string} sAppName
     *            the application name (the ui5 component name)
     *            should be stored with the data to allow to identify the data association
     * @param {string}
     *            sComponent a 24 character string representing the application component,
     *            (A sap support component)
     *            may be undefined if not available on the client
     * @returns {object} promise
     *  A promise, done handler empty args
     *  fail handler sMsg argument
     * @private
     */
    AppStateAdapter.prototype.saveAppState = function (sKey, sSessionKey, sValue, sAppname, sComponent, iPersistencyMethod, oPersistencySettings) {
        var oDeferred = new jQuery.Deferred();

        this._getPersonalizationService().then(function (oPersonalizationService) {
            oPersonalizationService.createEmptyContainer(sKey, {
                keyCategory: oPersonalizationService.constants.keyCategory.GENERATED_KEY,
                writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
                clientStorageAllowed: false
            }).done(function (oContainer) {
                oContainer.setItemValue("appStateData", sValue);
                oContainer.setItemValue("persistencyMethod", iPersistencyMethod);
                oContainer.setItemValue("persistencySettings", oPersistencySettings);
                oContainer.setItemValue("createdBy", sap.ushell.Container && sap.ushell.Container.getUser && sap.ushell.Container.getUser().getId());
                oContainer.save().done(function () {
                    oDeferred.resolve();
                }).fail(function (sMsg) {
                    oDeferred.reject(sMsg);
                    Log.error(sMsg);
                });
            }).fail(function (sMsg) {
                Log.error(sMsg);
                oDeferred.reject(sMsg);
            });
        });
        return oDeferred.promise();
    };

    /**
     * read the application state sValue for the given key sKey from the persistence layer
     * @param {string} sKey
     *            the Key value of the Application state to save,
     *            (less than 40 characters)
     * @param {string} sValue
     *            the value to persist under the given key
     * @returns {object} promise
     *  A promise, done handler function(sKey, sValue)
     *  fail handler function(sMsg) argument
     * @private
     */
    AppStateAdapter.prototype.loadAppState = function (sKey) {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        this._getPersonalizationService().then(function (oPersonalizationService) {
            oPersonalizationService.getContainer(sKey, {
                keyCategory: oPersonalizationService.constants.keyCategory.GENERATED_KEY,
                writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
                clientStorageAllowed: false
            }).done(function (oContainer) {
                var sValue = oContainer.getItemValue("appStateData"),
                    iPersistencyMethod = oContainer.getItemValue("persistencyMethod"),
                    oPersistencySettings = oContainer.getItemValue("persistencySettings"),
                    sCreatedBy = oContainer.getItemValue("createdBy");

                if (iPersistencyMethod === undefined) {
                    oDeferred.resolve(sKey, sValue);
                } else if (iPersistencyMethod === AppStatePersistencyMethod.PersonalState) {
                    if (that.getCurrentUserForTesting() === "" || that.getCurrentUserForTesting() === sCreatedBy) {
                        oDeferred.resolve(sKey, sValue, iPersistencyMethod, oPersistencySettings);
                    } else {
                        oDeferred.reject("Unauthorized User ID");
                    }
                }
            }).fail(function (sMsg) {
                Log.error(sMsg);
                oDeferred.reject(sMsg);
            });
        });
        return oDeferred.promise();
    };

    /**
     * delete the a state for the given key sKey from the both the transient layer and the
     * persistence layer
     * @param {string} sKey
     *            the Key value of the Application state to delete,
     *            (less than 40 characters)
     * @returns {object} promise
     *  A promise, done handler function(true/false)
     *  fail handler function(sMsg) argument
     * @since 1.69.0
     * @private
     */
    AppStateAdapter.prototype.deleteAppState = function (sKey) {
        var oDeferred = new jQuery.Deferred();

        this._getPersonalizationService().then(function (oPersonalizationService) {
            oPersonalizationService.delContainer(sKey).done(function () {
                oDeferred.resolve();
            }).fail(function (sMsg) {
                Log.error(sMsg);
                oDeferred.reject(sMsg);
            });
        });

        return oDeferred.promise();
    };

    /**
     * This function is used only for local unit testing
     * @returns {String}
     *  An empty string that represents the current user (for local testing)
     * @since 1.67
     * @private
     */
    AppStateAdapter.prototype.getCurrentUserForTesting = function () {
        return "";
    };

    /**
     * This function returns an array of all the supported persistence method
     * @returns {Array}
     *  An Array that contains all the supported persistence method
     * @since 1.67
     * @private
     */
    AppStateAdapter.prototype.getSupportedPersistencyMethods = function () {
        return [];
    };

    return AppStateAdapter;
}, /* bExport= */ false);
