// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The EndUserFeedback service.
 */
sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/util/ObjectPath"
], function (URI, ObjectPath) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call <code>sap.ushell.Container.getServiceAsync("EndUserFeedback").then(function (EndUserFeedback) {});</code>.
     * Constructs a new instance of the end user feedback service.
     *
     * @name sap.ushell.services.EndUserFeedback
     * @class The Unified Shell's end user feedback service.
     * This service is deprecated and does nothing.
     * End user feedback functionality s not part of the ushell library.
     *
     * @public
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.25.1
     * @deprecated since 1.93
     */
    function EndUserFeedback () {
        /**
         * Sends a feedback.
         *
         * @public
         * @returns {Promise} Empty promise
         * @alias sap.ushell.services.EndUserFeedback#sendFeedback
         * @since 1.25.1
         * @deprecated since 1.93
         */
        this.sendFeedback = function () {
            return Promise.resolve();
        };

        /**
         * @returns {string} Empty string
         * @public
         * @alias sap.ushell.services.EndUserFeedback#getLegalText
         * @since 1.25.1
         * @deprecated since 1.93
         */
        this.getLegalText = function () {
            return "";
        };

        /**
         * The service is deprecated. The function always returns a negative answer.
         *
         * @returns {Object} Rejected promise
         * @public
         * @alias sap.ushell.services.EndUserFeedback#isEnabled
         * @since 1.25.1
         * @deprecated since 1.93
         */
        this.isEnabled = function () {
            return Promise.reject();
        };

        /**
         * @param {String} sURL sURL
         * @returns {string} Path of the given URL (based on URI-API)
         * @private
         * @since 1.30.0
         * @deprecated since 1.93
         */
        this.getPathOfURL = function (sURL) {
            var oURI = new URI(sURL);
            return oURI.pathname();
        };
    }

    EndUserFeedback.hasNoAdapter = true;
    return EndUserFeedback;
}, true /* bExport */);
