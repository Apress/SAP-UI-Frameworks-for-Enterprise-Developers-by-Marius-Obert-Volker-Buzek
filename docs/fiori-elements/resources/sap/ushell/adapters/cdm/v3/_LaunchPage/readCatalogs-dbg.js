// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Helper for accessing catalog data for the 'CDM' platform.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define( [
], function () {
    "use strict";

    // CATALOG PROPERTIES

    /**
     * Returns the ID of the given catalog.
     *
     *  @param {object} oCatalog
     *      Catalog object
     *  @returns {string}
     *      ID of the given catalog
     */
    function getId (oCatalog) {
        return oCatalog.identification.id;
    }

    /**
     * Returns the title of the given catalog.
     *
     *  @param {object} oCatalog
     *      Catalog object
     *  @returns {string}
     *      Title of the given catalog
     */
    function getTitle (oCatalog) {
        return oCatalog.identification.title;
    }

    return {
        // CATALOG PROPERTIES
        getId: getId,
        getTitle: getTitle
    };

}, /* bExport = */ false);
