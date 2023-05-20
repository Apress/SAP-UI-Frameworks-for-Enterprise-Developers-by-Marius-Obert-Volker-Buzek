// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Personalization adapter for the local platform.
 *
 *
 * The local personalization adapter can be configured to store data either in
 * the local storage (default) or in memory.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/base/util/ObjectPath",
    "sap/ui/util/Storage",
    "sap/ushell/adapters/local/AdapterContainer"
], function (
    utils,
    ObjectPath,
    Storage,
    AdapterContainer
) {
    "use strict";

    var oMemoryPersData;

    /*
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the personalization adapter for the
     * "Local" platform.
     *
     * @param {object}
     *            oSystem the system served by the adapter
     * @returns {sap.ushell.adapters.local.PersonalizationAdapter}
     *
     * @class The Unified Shell's personalization adapter for the "local"
     *        platform.
     *
     * @constructor
     * @since 1.15.0
     */
    var PersonalizationAdapter = function (oUnused, sParameter, oAdapterConfiguration) {
        this._sStorageType = ObjectPath.get("config.storageType", oAdapterConfiguration) ||
            AdapterContainer.prototype.constants.storage.LOCAL_STORAGE; // default = local storage
        switch (this._sStorageType) {
            case AdapterContainer.prototype.constants.storage.LOCAL_STORAGE:
                break; // sap.ui.require("jquery.sap.storage") used to be here; case is still kept to preserve the break
            case AdapterContainer.prototype.constants.storage.MEMORY:
                oMemoryPersData = ObjectPath.get("config.personalizationData", oAdapterConfiguration) || {};
                // initialization data is only supported for MEMORY storage
                break;
            default:
                throw new utils.Error("Personalization Adapter Local Platform: unsupported storage type '" + this._sStorageType + "'");
        }
    };

    /**
     * Factory methods for obtaining AdapterContainer objects
     * Note that deletion does not invalidate handed out containers
     */

    PersonalizationAdapter.prototype.getAdapterContainer = function (sContainerKey) {
        return new AdapterContainer(sContainerKey, this._sStorageType, oMemoryPersData);
    };

    /**
     * Delete all personalization from LocalStorage
     *
     * @returns {Promise} A promise that resolves once all personalizations have been deleted
     * @since 1.86.0
     */
    PersonalizationAdapter.prototype.resetEntirePersonalization = function () {
        return new Promise(function (resolve, reject) {
            var oLocalStorage = this._getLocalStorage();
            setTimeout(function () {
                var bDeletedAllPersonalizations = oLocalStorage.removeAll();
                if (bDeletedAllPersonalizations) {
                    resolve();
                } else {
                    reject("could not delete personalization");
                }
            }, 0);
        }.bind(this));
    };

    /**
     * Confirms that the requested method deleteAllPersonalizations is available
     *
     * @returns {Promise} A promise that resolves to true if deleteAllPersonalizations is supported
     * @since 1.86.0
     */
    PersonalizationAdapter.prototype.isResetEntirePersonalizationSupported = function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(true);
            }, 0);
        });
    };

    /**
     * Remove the content of the given container key from the storage
     *
     * Note: a previously obtained AdaterContainer for the instance is not invalidated
     * @returns a promise (though technically this is a synchronous op)
     */
    PersonalizationAdapter.prototype.delAdapterContainer = function (sContainerKey) {
        return this.getAdapterContainer(sContainerKey).del();
    };

    PersonalizationAdapter.prototype._getLocalStorage = getLocalStorage;

    function getLocalStorage () {
        return new Storage(Storage.Type.local, "com.sap.ushell.adapters.sandbox.Personalization");
    }

    return PersonalizationAdapter;
}, false);
