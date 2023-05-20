//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview NWBCInterface for NWBC client
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/Config"
], function (EventHub, Config) {
    "use strict";

    /**
     * The NWBCInterface provides interfaces for the NWBC client to access FLP functionality
     */
    var NWBCInterface = {};

    /**
     * Notifies FLP that the user is active in the NWBC client application so FLP
     * should client session
     *
     * @private
     * @since 1.76.0
     */
    NWBCInterface.notifyUserActivity = function () {
        EventHub.emit("nwbcUserIsActive", Date.now());
    };

    /**
     * Provides FLP session timeout value
     *
     * @return {number} session time out in minutes
     *
     * @private
     * @since 1.80.0
     */
    NWBCInterface.getSessionTimeoutMinutes = function () {
        var sessionTimeoutMinutes = 0;
        if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
            sessionTimeoutMinutes = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
        }
        return sessionTimeoutMinutes;
    };

    /**
     * Provides indication if there is currently a kept alive app in FLP
     *
     * @return {Promise} boolean value of true or false is such app exists
     *
     * @private
     * @since 1.103.0
     */
    NWBCInterface.isAnyAppKeptAlive = function () {
        return new Promise(function (fnResolve) {
            sap.ui.require(["sap/ushell/components/applicationIntegration/Storage"], function (Storage) {
                fnResolve(Storage.length() > 0);
            });
        });
    };

    return NWBCInterface;
});
