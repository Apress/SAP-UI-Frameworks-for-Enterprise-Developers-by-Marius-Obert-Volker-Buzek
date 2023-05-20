// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Configure the UI5Settings for Date and Time Format for the 'CDM'
 *               platform.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Configuration"
], function (Log, ObjectPath, Configuration) {
    "use strict";

    return configureUI5DateTimeFormat;

    /**
     * This function configures the UI5 settings for Date and Time Format.
     * Note: TimeZone is not taken into account.
     *
     * @param {object} oUshellConfig
     *     the Ushell Configuration Settings
     *     It shall be like oUshellConfig.services.Contaainer.adapter.config
     *     if not undefined values for date and time format is set.
     *
     * @private
     */
    function configureUI5DateTimeFormat (oUshellConfig) {
        var oUserProfileDefaults = ObjectPath.get("services.Container.adapter.config.userProfile.defaults", oUshellConfig);

        var sMessageDate = "Date Format is incorrectly set for the User";
        var sMessageTime = "Time Format is incorrectly set for the User";

        try {
            var sSapDateFormat = oUserProfileDefaults && oUserProfileDefaults.sapDateFormat;
            Configuration.getFormatSettings().setLegacyDateFormat(sSapDateFormat);
        } catch (e) {
            Log.error(sMessageDate, e.stack, "sap/ushell/bootstrap/common/common.configure.ui5datetimeformat");
        }

        try {
            var sSapTimeFormat = oUserProfileDefaults && oUserProfileDefaults.sapTimeFormat;
            Configuration.getFormatSettings().setLegacyTimeFormat(sSapTimeFormat);
        } catch (e) {
            Log.error(sMessageTime, e.stack, "sap/ushell/bootstrap/common/common.configure.ui5datetimeformat");
        }
    }
}, /* bExport = */ false);
