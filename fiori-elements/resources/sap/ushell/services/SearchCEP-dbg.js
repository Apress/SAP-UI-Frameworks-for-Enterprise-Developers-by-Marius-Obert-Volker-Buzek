// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's Search for myHome.
 *
 * @version 1.113.0
 */
sap.ui.define([], function () {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getServiceAsync("SearchCEP").then(function (SearchCEP) {});</code>.
     * Constructs a new instance of the SearchCEP service.
     *
     * The Unified Shell's search service for CEP myHome.
     *
     * @param {object} oAdapter the service adapter for the search service, as already provided by the container
     * @param {object} oContainerInterface oContainerInterface
     * @param {string} sParameter sParameter
     * @param {object} oConfig oConfig
     *
     * @name sap.ushell.services.SearchCEP
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.101.0
     * @private
     */
    function SearchCEP (oAdapter, oContainerInterface, sParameter, oConfig) {
        this.oAdapter = oAdapter;
    }

    /**
     * Searching applications.
     * @param {string} sQuery The query string to search.
     *
     * @returns {Promise} Promise resolving the search result (array of application objects)
     *
     * @private
     * @since 1.101.0
     */
    SearchCEP.prototype.execSearch = function (sQuery) {
        var that = this;
        return new Promise(function (fnResolve) {
            that.oAdapter.execSearch(sQuery).then(fnResolve, function () {
                //in case of error, the adapter will log the error, and the service
                //returns an empty result for the search control to work properly
                fnResolve({});
            });
        });
    };

    SearchCEP.hasNoAdapter = false;
    return SearchCEP;
}, true /* bExport */);
