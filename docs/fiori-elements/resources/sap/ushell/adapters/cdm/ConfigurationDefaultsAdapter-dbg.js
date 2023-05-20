// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The ConfigurationDefaults adapter for the CDM platform.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/bootstrap/cdm/cdm.constants",
    "sap/base/util/deepClone"
], function (oCdmConstants, fnDeepClone) {
    "use strict";

    /**
     *
     * @returns {sap.ushell.adapters.cdm.ConfigurationDefaultsAdapter}
     * @private
     */
    return function () {
        /**
         * @returns {Promise} Resolved promise contains all default configuration for CDM platform
         */
        this.getDefaultConfig = function () {
            return Promise.resolve(fnDeepClone(oCdmConstants.defaultConfig));
        };
    };
}, false /* bExport */);
