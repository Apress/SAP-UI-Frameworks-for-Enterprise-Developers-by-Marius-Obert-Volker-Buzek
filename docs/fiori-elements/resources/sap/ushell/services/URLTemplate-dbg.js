// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview The URLTemplate service provides utilities when working with URL templates
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/base/Log"
], function (
    utils,
    Log
) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("URLTemplate").then(function (URLTemplate) {});</code>.
     * Constructs a new instance of the URLTemplate service.
     *
     * @namespace sap.ushell.services.URLTemplate
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.94.0
     * @private
     */
    function URLTemplate () {
        this._init.apply(this, arguments);
    }

    /**
     * Private initializer.
     *
     * @param {object} adapter The URLTemplate adapter for the server.
     *
     * @since 1.94.0
     * @private
     */
    URLTemplate.prototype._init = function (adapter) {
        this.oAdapter = adapter;
    };

   /**
     * Allow the platform to perform post url template processing actions to manipulate
     *  the url before iframe is opened.
     *
     * @returns {Promise<Url>} The new URL after platform changes
     *
     * @since 1.94.0
     * @private
     */
   URLTemplate.prototype.handlePostTemplateProcessing = function (sUrl, oSiteAppSection, bForNewIframe) {
        if (this.oAdapter && this.oAdapter.handlePostTemplateProcessing) {
            return this.oAdapter.handlePostTemplateProcessing(sUrl, oSiteAppSection, bForNewIframe);
        } else {
            return Promise.resolve(sUrl);
        }
    };

    // Return URLTemplate service from this module
    URLTemplate.hasNoAdapter = false;
    URLTemplate.useConfiguredAdapterOnly = true;
    return URLTemplate;
});
