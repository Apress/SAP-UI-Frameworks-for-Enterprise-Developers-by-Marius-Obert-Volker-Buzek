// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview
 *
 * <p>This module deals with the page persistence.</p>
 *
 * @version 1.113.0
 */

sap.ui.define([], function () {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("PagePersistence").then(function (PagePersistence) {});</code>.
     * Constructs a new instance of the page persistence service.
     *
     * @namespace sap.ushell.services.PagePersistence
     *
     * @param {object} adapter
     *     the page persistancy adapter for the frontend server
     * @param {object} serviceConfiguration
     *     the page persistency service configuration
     *
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @experimental Since 1.67.0
     *
     * @private
     */
    function PagePersistence (/*adapter, serviceConfiguration*/) {
        this._init.apply(this, arguments);
    }

    PagePersistence.prototype._init = function (adapter, serviceConfiguration) {
        this._oServiceConfiguration = serviceConfiguration;
        this.oAdapter = adapter;
        this._pagesCache = [];
    };

    /**
     * Gets a specific page identified by its ID and caches the returned information.
     *
     * @param {string} id The ID of the page
     * @returns {Promise<object>} The page
     *
     * @private
     */
    PagePersistence.prototype.getPage = function (id) {
        if (!this._pagesCache[id]) {
            this._pagesCache[id] = this.oAdapter.getPage(id);
        }
        return this._pagesCache[id];
    };

    /**
     * Gets array of pages identified by its IDs
     *
     * @param {array} aId The array of ID of the page
     * @returns {Promise<object>} The array of pages
     *
     * @private
     */
    PagePersistence.prototype.getPages = function (aId) {
        return this.oAdapter.getPages(aId);
    };

    PagePersistence.hasNoAdapter = false;
    return PagePersistence;
});
