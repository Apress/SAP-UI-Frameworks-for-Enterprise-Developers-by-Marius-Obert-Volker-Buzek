// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview AppType
 *
 * Helper for sap/ushell/services/AppType
 */
sap.ui.define([
    "sap/ushell/library",
    "sap/ushell/resources"
], function (
    ushellLibrary,
    resources
) {
    "use strict";

    // shortcut for sap.ushell.AppType
    var AppType = ushellLibrary.AppType;

    var oAppTypeUtils = {};

    /**
     * Looks up the display name of the given app type and returns the text for the locale determined by SAPUI5.
     *
     * @private
     * @param {sap.ushell.AppType} appType The app type for which to get the text.
     * @returns {string} The display name of the given app type.
     */
    oAppTypeUtils.getDisplayName = function (appType) {
        switch (appType) {
            case AppType.OVP:
                return resources.i18n.getText("Apptype.OVP");
            case AppType.SEARCH:
                return resources.i18n.getText("Apptype.SEARCH");
            case AppType.FACTSHEET:
                return resources.i18n.getText("Apptype.FACTSHEET");
            case AppType.COPILOT:
                return resources.i18n.getText("Apptype.COPILOT");
            case AppType.URL:
                return resources.i18n.getText("Apptype.URL");
            default:
                return resources.i18n.getText("Apptype.APP");
        }
    };

    return oAppTypeUtils;
});
