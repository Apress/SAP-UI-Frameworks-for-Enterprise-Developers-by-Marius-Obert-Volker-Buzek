// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Class for statistical record
 *               It should contain data like step, duration after a navigation in the shell, can have status open.
 *               The closing of a record is logged in debug mode
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/Config"
], function (Log, Config) {
    "use strict";

    var STATUS = {
        OPEN: "OPEN",
        CLOSED: "CLOSED",
        ERROR: "ERROR"
    };



    /**
     * Constructor for statistical record
     * @returns oStatisticalRecord The constructed statistical record.
     * @returns oStatisticalRecord.status The status, can be open or closed or error
     * @returns oStatisticalRecord.targetHash The target hash of the navigation
     * @returns oStatisticalRecord.trigger The trigger, like mouse click that initiated th action
     * @returns oStatisticalRecord.timeStart The start time or to be more precise timestamps returned by performance.now()
     * @returns oStatisticalRecord.timeEnd The end time or to be more precise timestamps returned by performance.now()
     * @returns oStatisticalRecord.duration The duration in milliseconds. Difference of the two timestamps above
     * @returns oStatisticalRecord.sourceApplication The source application
     * @returns oStatisticalRecord.targetApplication The target application
     * @returns oStatisticalRecord.navigationMode The navigation mode, can be in place or ex place
     * @returns oStatisticalRecord.step The navigation step, e.g. "FLP@LOAD"
     * @returns oStatisticalRecord.homepageLoading True when homepage was loaded the first time
     * @returns oStatisticalRecord.applicationType The type of the target application. For example UI5, TR, etc.
     */
    function StatisticalRecord () {
        this.status = STATUS.OPEN;
        this.targetHash = null;
        this.trigger = null;

        this.timeStart = null;
        this.timeEnd = null;
        this.duration = null;

        this.step = null;

        this.sourceApplication = undefined;
        this.targetApplication = undefined;
        this.navigationMode = null;
        this.homepageLoading = false;
        this.applicationType = null;
    }

    /**
     * calculates step out of source and target application
     *
     * @returns {string} sStep The navigation step
     */
    StatisticalRecord.prototype._calculateStep = function () {
        //In case when targetApplication and sourceApplication not defined, can not resolve the step
        if (this.targetApplication === undefined && this.sourceApplication === undefined) {
            return "";
        }

        //load home page
        if (this.sourceApplication === undefined && this._isHomePage(this.targetApplication)) {
            // entire phase of loading gets this Step name internally,
            // will be replaced later by original step or FLP@LOAD for external use
            return "FLP@DURING_LOAD";
        }

        if (this.sourceApplication === undefined && !this._isHomePage(this.targetApplication)) {
            return "FLP@DEEP_LINK";
        }

        // if source and target application are not the homepage it is an app to app navigation.
        // if homepage is started the source application is undefined
        if (this.sourceApplication && !this._isHomePage(this.targetApplication) && !this._isHomePage(this.sourceApplication)) {
            return "A2A@" + this.sourceApplication;
        }
        // back to the homepage from some app
        if (this.sourceApplication && this._isHomePage(this.targetApplication) && !this._isHomePage(this.sourceApplication)) {
            return "FLP_BACK@" + this.sourceApplication;
        }

        if (this._isHomePage(this.sourceApplication)) {
            return "FLP@HOMEPAGE_TILE";
        }

        return "";
    };



    /**
     * Compares two statistical records
     * @param {object} otherRecord The other record
     * @returns {boolean} Is true if other record has the same start time as the current record
     */
    StatisticalRecord.prototype.isEqual = function (otherRecord) {
        return this.timeStart === otherRecord.timeStart;
    };

    /**
     * Closes the record, computes the duration, step and stores it
     */
    StatisticalRecord.prototype.closeRecord = function () {
        this.step = this._calculateStep();
        this.status = STATUS.CLOSED;
        this.timeEnd = performance.now();
        if (this.timeStart) {
            this.duration = this.timeEnd - this.timeStart;
        }
        Log.debug("[fesrEnhFlp] Close statistical record with step name: " + this.step);
    };

    /**
     * Closes the Record with status error
     */
    StatisticalRecord.prototype.closeRecordWithError = function () {
        this.status = STATUS.ERROR;
        this.timeEnd = performance.now();
        this.duration = this.timeEnd - this.timeStart;
    };

    /**
     * checks if record is closed
     * @returns {boolean} isTrue Is true if record is closed
     *
     */
    StatisticalRecord.prototype.isClosed = function () {
        return this.status === STATUS.CLOSED;
    };

    /**
     * Getter for step
     * @returns {boolean} return the step of the record. For example, FLP@LOAD
     */
    StatisticalRecord.prototype.getStep = function () {
        return this.step;
    };

    /**
     * Setter for trigger
     * @param {string} sTrigger trigger of the creation of the record. For example, HOMEPAGE_TILE
     */
    StatisticalRecord.prototype.setTrigger = function (sTrigger) {
        this.trigger = sTrigger;
    };

    /**
     * Setter for target hash
     * @param {string} sTargetHash Hash of the target application
     */
    StatisticalRecord.prototype.setTargetHash = function (sTargetHash) {
        this.targetHash = sTargetHash;
    };

    /**
     * Setter for start time
     * @param {timestamp} timeStart timestamp when record was created
     */
    StatisticalRecord.prototype.setTimeStart = function (timeStart) {
        this.timeStart = timeStart;
    };

    /**
     * Getter for start time
     * @returns {timestamp} timestamp when record was created
     */
    StatisticalRecord.prototype.getTimeStart = function () {
        return this.timeStart;
    };

    /**
     * Getter for end time
     * @returns {timestamp} timestamp when record was closed
     */
    StatisticalRecord.prototype.getTimeEnd = function () {
        return this.timeEnd;
    };

    /**
     * Setter for source application
     * @param {string} sSourceApplicationId Fiori id of the source application
     */
    StatisticalRecord.prototype.setSourceApplication = function (sSourceApplicationId) {
        this.sourceApplication = sSourceApplicationId;
    };

    /**
     * Setter for target application
     * @param {string} sTargetApplicationId Fiori id of the target application
     */
    StatisticalRecord.prototype.setTargetApplication = function (sTargetApplicationId) {
        this.targetApplication = sTargetApplicationId;
    };

    /**
     * Setter for navigation mode
     * @param {string} navigationMode INPLACE or EXPLACE
     */
    StatisticalRecord.prototype.setNavigationMode = function (navigationMode) {
        this.navigationMode = navigationMode;
    };

    /**
     * Set if the homepage was loaded the first time
     * @param {boolean} homepageLoading flag if homepage was loaded the first time
     */
    StatisticalRecord.prototype.setHomepageLoading = function (homepageLoading) {
        this.homepageLoading = homepageLoading;
    };

    /**
     * Set the application type
     * @param {string} applicationType application type, for example UI5, TR, etc.
     */
    StatisticalRecord.prototype.setApplicationType = function (applicationType) {
        this.applicationType = applicationType;
    };

    /**
     * Setter for isHomeApp
     * @param {boolean} bHomeApp true or false
     * @private
     * @since 1.105.0
     */
    StatisticalRecord.prototype.setIsHomeApp = function (bHomeApp) {
        this.isHomeApp = !!bHomeApp;
    };

    /**
     * check if application id is homepage
     *
     * @param {string} sApplicationId fiori id
     *
     * @returns {boolean} true for homepage and page runtime and for special case that it is a home application
     * @private
     * @since 1.105.0
     */
     StatisticalRecord.prototype._isHomePage = function (sApplicationId) {
        if (this.isHomeApp) {
            return true;
        }
        return sApplicationId && (sApplicationId === "FLP_HOME" || sApplicationId === "FLP_PAGE");
    };

    return StatisticalRecord;

}, /* bExport= */ false);
