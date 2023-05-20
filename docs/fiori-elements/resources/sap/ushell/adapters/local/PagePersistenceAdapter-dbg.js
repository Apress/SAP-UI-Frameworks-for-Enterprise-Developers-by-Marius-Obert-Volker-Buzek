// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview PagePersistenceAdapter for the local platform.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/util/Storage",
    "sap/base/util/ObjectPath"
], function (utils, Storage, ObjectPath) {
    "use strict";

    /**
     * Constructs a new instance of the PagePersistenceAdapter for the local platform
     *
     * @param {object} system The system information. This is not used in a local environment.
     * @param {string} parameter The Adapter parameter.
     * @param {object} adapterConfiguration The Adapter configuration.
     *
     * @constructor
     * @experimental Since 1.67.0
     * @private
     */
    var PagePersistenceAdapter = function (system, parameter, adapterConfiguration) {
        var sStorageType = ObjectPath.get("config.storageType", adapterConfiguration) || Storage.Type.local;
        if (sStorageType !== Storage.Type.local && sStorageType !== Storage.Type.session) {
            throw new utils.Error("PagePersistence Adapter Local Platform: unsupported storage type: '" + sStorageType + "'");
        }
        this._oAdapterConfiguration = adapterConfiguration;
    };

    /**
     * Gets a promise resolved with a page, that matches the given id.
     *
     * @param {string[]} id The id of a page.
     * @returns {Promise<object[]>} A Promise resolved with a page or rejected if no page matched the given id.
     *
     * @private
     */
    PagePersistenceAdapter.prototype.getPage = function (id) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var oData = that._oAdapterConfiguration.config.dataLoad[id] || {};
            if (oData.page.id === id) {
                resolve(oData);
            }
            reject({ error: "No page with id '" + id + "' was found." });
        });
    };

    /**
     * Gets a promise resolved with an array of pages, that match the given array of ids.
     *
     * @param {string[]} ids The array of page ids.
     * @returns {Promise<object[]>} A Promise resolved with an array of pages.
     *
     * @private
     */
    PagePersistenceAdapter.prototype.getPages = function (ids) {
        var mPages = this._oAdapterConfiguration.config.dataLoad || {};

        return Promise.resolve(ids.map(function (id) {
                return mPages[id];
            }).filter(function (page) {
                return !!page;
            }));
    };

    return PagePersistenceAdapter;
}, false /* bExport */);
