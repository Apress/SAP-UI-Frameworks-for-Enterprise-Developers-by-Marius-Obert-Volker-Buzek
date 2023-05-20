// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This module deals with page related referencing and dereferencing.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/services/_PageReferencing/PageReferencer"
], function (PageReferencer) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("PageReferencing").then(function (PageReferencing) {});</code>.
     * Constructs a new instance of the page referencing service.
     *
     * @namespace sap.ushell.services.PageReferencing
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @experimental Since 1.68.0
     *
     * @private
     */
    function PageReferencing () { }

    /**
     * Create reference page based on the page layout
     *
     * @param {object} pageInfo Data are given by the user when creating the page.
     *
     * @returns {object} Reference page
     *
     * @experimental Since 1.68.0
     * @protected
     */
    PageReferencing.prototype.createReferencePage = function (pageInfo) {
        return PageReferencer.createReferencePage(pageInfo);
    };

    PageReferencing.hasNoAdapter = true;

    return PageReferencing;
});
