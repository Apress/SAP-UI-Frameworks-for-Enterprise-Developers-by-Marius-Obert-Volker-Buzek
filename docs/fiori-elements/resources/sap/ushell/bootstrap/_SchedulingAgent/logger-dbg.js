// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/* eslint-disable no-console */

/**
 * @fileOverview
 * The logger module logs the state, error and warning history of the "FLP Bootstrap Scheduling Agent" (FBSA).
 * It can be used by all its FBSA sub modules (e.g. loader, scheduler and the scheduling agent itself).
 * There's no need to explicitly log changes of the module, block and step states, as this is done automatically
 * by the FBSA state module.
 *
 * The logger offers a dump function, which can be used interactively in the console of the development tools.
 * Is prints the history on the console and allows filtering for step and block ids.
 *
 * <pre>
 * logger.dumpHistory();
 * logger.dumpHistory("Block A");
 * logger.dumpHistory("Step 1");
 * </pre>
 *
 * Perspective:
 * > Always log to the standard SAPUI5 log (sap/base/log)
 *
 * Remarks:
 * > Use logger.verboseOff() to deactivate verbose logging.
 *
 * Usage:
 * <pre>
 * sap.ui.define([
 *    "sap/ushell/bootstrap/_SchedulingAgent/logger",
 *    "sap/base/util/now"
 * ], function (
 *    logger,
 *    fnNow
 * ) {
 *      ...
 *      logger.clearHistory();
 *
 *      logger.logStatus({
 *          time : fnNow(), // Date.now() is sometimes not that accurate
 *          type : "Step", id : "Step 1", status : "DONE",
 *          parameter : null, remark : "The one and only", byModule : "flpScheduler"
 *      });
 *      ...
 * }, false);
 * </pre>
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/base/Log"
], function (BaseLog) {
    "use strict";

    /**
     * Holds the state history of modules, blocks and steps, errors and warnings.
     */
    var aHistory = [];
    var bVerbose = true;
    var COMPONENT_NAME = "FLPScheduler";

    return {
        /**
         * Returns the status history array.
         * @returns {Array<{time: number, type: string, id: string, status: string, parameter: object, remark: string, byModule: string}>} Status history of status objects
         * @protected
         */
        getHistory: function () {
            return aHistory;
        },

        /**
         * Activates verbose logging.
         * @returns {boolean} Returns true of verbose logging is enabled, false otherwise.
         * @protected
         */
        verboseOn: function () {
            bVerbose = true;
            return (bVerbose === true);
        },

        /**
         * Disables verbose logging.
         * @returns {boolean} True of verbose logging is disabled, false otherwise.
         * @protected
         */
        verboseOff: function () {
            bVerbose = false;
            return (bVerbose === false);
        },

        /**
         * Tells if verbose logging is enabled.
         * @returns {boolean} True of verbose logging is enabled, false otherwise.
         * @protected
         */
        isVerboseOn: function () {
            return (bVerbose === true);
        },

        /**
         * Clears the logging history
         * @protected
         */
        clearHistory: function () {
            aHistory.length = 0;
        },

        /**
         * Dumps the history to the console.
         *
         * Uses the parameter "id" to filter the history.
         * This method is intended only for debugging with the browser's developer tools.
         *
         * @param {string} [id] ID of the module, state or step
         * @returns {object[]} The history that has been written to the console
         * @protected
         */
        dumpHistory: function (id) {
            var _aHistory;

            if (id) {
                _aHistory = aHistory.filter(function (oEntry) {
                    return oEntry.id === id;
                });

                console.table(_aHistory);
            } else {
                console.table(aHistory);
            }

            return _aHistory || aHistory;
        },

        /**
         * Logs an error
         * @param {{time: number, type: string, id: string, status: string, parameter: object, remark: string, byModule: string}} error
         *   State object to log: use fixed values for type, status and byModule as defined in the state module.
         * @returns {boolean} true: Indicates a log entry has been written
         * @protected
         */
        logError: function (error) {
            BaseLog.error(this.stateToString(error), undefined, COMPONENT_NAME);
            aHistory.push(error);
            return true;
        },

        /**
         * Logs a warning
         * @param {{time: number, type: string, id: string, status: string, parameter: object, remark: string, byModule: string}} warning
         *   State object to log: use fixed values for type, status and byModule as defined in the state module.
         * @returns {boolean} true: Indicates a log entry has been written
         * @protected
         */
        logWarning: function (warning) {
            if (bVerbose) {
                BaseLog.warning(this.stateToString(warning), COMPONENT_NAME);
                aHistory.push(warning);
            }
            return bVerbose;
        },

        /**
         * Logs a module's, step's, or block's state.
         *
         * No logging if verbose logging is disabled.
         *
         * @param {{time: number, type: string, id: string, status: string, parameter: object, remark: string, byModule: string}} status
         *   State object to log: use fixed values for type, status and byModule as defined in the state module.
         * @returns {boolean} true if log entry has been written
         * @protected
         */
        logStatus: function (status) {
            if (bVerbose) {
                BaseLog.info(this.stateToString(status), COMPONENT_NAME);
                aHistory.push(status);
            }
            return bVerbose;
        },

        /**
         * Formats a status entry for log output
         * @param {{time: number, type: string, id: string, status: string, parameter: object, remark: string, byModule: string}} status
         *  history of status objects
         * @returns {string} Status as string for log output
         * @protected
         */
        stateToString: function (status) {
            return "FLP Bootstrap Scheduling Agent :: " + status.type + " '" + status.id
                + "' /" + status.status + ((status.remark) ? "/ : " + status.remark : "/");
        }
    };
});
