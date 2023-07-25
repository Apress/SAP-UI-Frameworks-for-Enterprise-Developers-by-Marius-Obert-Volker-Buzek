// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file The FESR Enhancer attaches to the Front End Sub-Records tracker by UI5.
 * UI5 tracks rendering and request activities and tries to detect what happens.
 * The ushell FESR Enhancer has then the possibility to overwrite and enhance the result with FLP specific information.
 * the following messages to debug log with
 * prefix [fesrEnhFlp] are added
 * - flp has passed on a record to fesr
 * - flp has not overwritten steps of pattern /press/
 * - flp has not overwritten steps of pattern /__cdm/
 * @private
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ui/performance/trace/FESR",
    "sap/ushell/performance/ShellAnalytics"
], function (
    Log,
    deepExtend,
    FESR,
    ShellAnalytics
) {
    "use strict";

    var SCENARIOS = {
        HOME_INITIAL: "FLP@LOAD",
        HOME_LOADING: "FLP@DURING_LOAD",
        FINDER_INITIAL: "FLP@LOAD_FINDER",
        APP_INITIAL: "FLP@DEEP_LINK",
        NAVIGATION: "NAVIGATION",
        CUSTOM_HOME_INITIAL: "FLPCUSTOMHOME"
    };

    // type of interaction, more details in "sap/ui/performance/trace/FESR.js"
    var INTERACTION_TYPE = {
        APP_START: 1,
        STEP_IN_APP: 2,
        UNKNOWN: 3
    };

    var oFesrEnhancer = {
        _fnOriginalOnBeforeCreated: null,
        _lastTrackedRecord: null,

        /**
         * Initializes the enhancer. This includes attaching to sap/ui/performance/trace/FESR#onBeforeCreated and enable ShellAnalytics.
         *
         * @private
         */
        init: function () {
            if (FESR.getActive()) {
                ShellAnalytics.enable();
                this._fnOriginalOnBeforeCreated = FESR.onBeforeCreated;
                FESR.onBeforeCreated = this._onBeforeCreatedHandler.bind(this);
            }
        },

        /**
         * Resets the enhancer and detaches form sap/ui/performance/trace/FESR and ushell specific events.
         *
         * @private
         */
        reset: function () {
            FESR.onBeforeCreated = this._fnOriginalOnBeforeCreated;
            ShellAnalytics.disable();
            this._setLastTrackedRecord(null);
        },

        /**
         * Gets performance entries for a given event.
         *
         * @param {string} sEventName The name of the event.
         * @param {boolean} bExactName If true, only entries with exact name of event will be returned.
         *                             If false, all entries with events including event name will be returned.
         * @returns {PerformanceEntry[]} The performance entries.
         */
        _getPerformanceEntries: function (sEventName, bExactName) {
            if (bExactName) {
                return performance.getEntriesByName(sEventName);
            }
            return performance.getEntriesByType("mark").filter(function (oMark) {
                return oMark.name.includes(sEventName);
            });
        },

        /**
         * Gets the ID of the last tracked application.
         *
         * @returns {string} ID of the application.
         */
        _getLastTrackedApplicationId: function () {
            var oCurrentApplication = ShellAnalytics.getCurrentApplication();
            if (oCurrentApplication) {
                return oCurrentApplication.id;
            }
            return null;
        },

        /**
         * Gets the last tracked record.
         *
         * @returns {object} The last tracked record.
         */
        _getLastTrackedRecord: function () {
            return this._lastTrackedRecord;
        },

        /**
         * Set the last tracked record.
         *
         * @param {object} oNewRecord New Statistical record which was tracked.
         */
        _setLastTrackedRecord: function (oNewRecord) {
            this._lastTrackedRecord = oNewRecord;
        },

        /**
         * Hook for {@link sap.ui.performance.trace.FESR#onBeforeCreated} which enhances the "oUi5FesrHandle" with FLP-specific information.
         * The handler will try to detect selected scenarios related to the FLP like open homepage or app to app navigation.
         * All other scenarios are ignored.
         *
         * @param {object} oUi5FesrHandle The header information that can be modified.
         * @param {string} oUi5FesrHandle.stepName The step name with <Trigger>_<Event>.
         * @param {string} oUi5FesrHandle.appNameLong The application name with max 70 chars.
         * @param {string} oUi5FesrHandle.appNameShort The application name with max 20 chars.
         * @param {int} oUi5FesrHandle.timeToInteractive The detected end-to-end time of the step.
         * @param {object} oUi5Interaction The corresponding interaction object, read-only.
         * @returns {object} Modified header information.
         * @private
         */
        _onBeforeCreatedHandler: function (oUi5FesrHandle, oUi5Interaction) {
            var oDetectedScenario = this._detectScenario(oUi5FesrHandle, oUi5Interaction),
                sApplicationId = this._getLastTrackedApplicationId();
            if (sApplicationId) {
                // Add the latest remembered Fiori ID to every record until a different Fiori ID is set.
                // This is needed to relate interactions tracked afterwards to the started app.
                // Restriction: Fiori IDs are also added to not related interactions like FLP button clicks or shell plugin interactions.
                // Still, this is considered by S/4 and UI5 to be more helpful then not adding it anywhere.
                oUi5FesrHandle.appNameShort = sApplicationId;
            }

            if (!oDetectedScenario.scenario) {
                // unknown scenarios cannot be enhanced
                Log.debug("[fesrEnhFlp] unknown scenario, step name: " + oUi5FesrHandle.stepName);
                return oUi5FesrHandle;
            }
            var oAdjustedFesrRecord = this._enhanceRecord(oDetectedScenario.scenario, oUi5FesrHandle, oDetectedScenario.relatedEvent);
            Log.debug("[fesrEnhFlp] pass step name: " + oAdjustedFesrRecord.stepName);
            Log.debug("[fesrEnhFlp] pass short application name: " + oAdjustedFesrRecord.appNameShort);
            Log.debug("[fesrEnhFlp] pass long application name: " + oAdjustedFesrRecord.appNameLong);
            if (/tile.*press/.test(oAdjustedFesrRecord.stepName)) {
                Log.debug("[fesrEnhFlp] did not overwrite press step name");
            }
            if (/__cdm/.test(oAdjustedFesrRecord.stepName)) {
                Log.debug("[fesrEnhFlp] did not overwrite press step name(cdm)");
            }

            return oAdjustedFesrRecord;
        },

        /**
         * Tries to detect the current scenario based on the given information.
         *
         * @param {object} oUi5FesrHandle The FESR header information.
         * @param {object} oUi5Interaction The corresponding interaction object.
         * @returns {object} Returns an object which has at least a scenario property. This property may be null if the scenario is unknown.
         *   There may also be a relatedEvent property if an event was used in order to detect the scenario.
         * @private
         */
        _detectScenario: function (oUi5FesrHandle, oUi5Interaction) {
            function createResultObject (sScenario, oEvent) {
                var oResult = {
                    scenario: sScenario
                };
                if (oEvent) {
                    oResult.relatedEvent = oEvent;
                }
                return oResult;
            }

            if (oUi5FesrHandle.stepName === "undetermined_startup") {
                var oLastRecord = ShellAnalytics.getLastClosedRecord();
                this._setLastTrackedRecord(oLastRecord);
                // case home app: Home app is detected in a special way.
                if (!!oLastRecord && oLastRecord.isHomeApp) {
                    return createResultObject(SCENARIOS.CUSTOM_HOME_INITIAL);
                }
                // case app finder, pages, and homepage
                switch (oUi5FesrHandle.appNameLong) {
                    case "sap.ushell.components.homepage":
                        return createResultObject(SCENARIOS.HOME_INITIAL);
                    case "sap.ushell.components.pages":
                        return createResultObject(SCENARIOS.HOME_INITIAL);
                    case "sap.ushell.components.appfinder":
                        return createResultObject(SCENARIOS.FINDER_INITIAL);
                    default:
                    // application direct start
                    return createResultObject(SCENARIOS.APP_INITIAL, oLastRecord);
                }
            }

            var oLastTrackedRecord = this._getLastTrackedRecord(),
                aNavigationRecords = ShellAnalytics.getNextNavigationRecords(oLastTrackedRecord),
                sScenario,
                oNavigationRecord;
            if (aNavigationRecords.length === 1) {
                oNavigationRecord = aNavigationRecords[0];
                // consider that if there was navigation the saved navigation and new navigation has different time
                if ((oNavigationRecord && oLastTrackedRecord && !oNavigationRecord.isEqual(oLastTrackedRecord))
                    || (!oLastTrackedRecord && oNavigationRecord)) {
                    this._setLastTrackedRecord(oNavigationRecord);
                    // specify navigatio scenario further when during loading
                    sScenario = oNavigationRecord.step === SCENARIOS.HOME_LOADING ? SCENARIOS.HOME_LOADING : SCENARIOS.NAVIGATION;
                    return createResultObject(sScenario, oNavigationRecord);
                }
            } else if (aNavigationRecords.length > 1) {
                 aNavigationRecords.pop();
                 oNavigationRecord = aNavigationRecords[0];
                this._setLastTrackedRecord(oNavigationRecord);
                sScenario = oNavigationRecord.step === SCENARIOS.HOME_LOADING ? SCENARIOS.HOME_LOADING : SCENARIOS.NAVIGATION;
                return createResultObject(sScenario, oNavigationRecord);
            }
            // no scenario detected
            return createResultObject(null);
        },

        /**
         * Takes the given FESR information oIntermediateResult and returns an enhanced version using the given information.
         * replaces the time to interactive by
         * - performance mark FLP-TTI-Homepage in case of spaces & pages or home page
         * - performance mark FLP-TTI-Homepage-Custom in case of home app
         * - performance mark FLP-TTI-AppFinder in case of app finder
         *
         * @param {string} sDetectedScenario The detected scenario which is the basis for the enhancement. See SCENARIOS.
         * @param {object} oIntermediateResult The header information that can be modified.
         * @param {string} oIntermediateResult.stepName The step name with <Trigger>_<Event>.
         * @param {string} oIntermediateResult.appNameLong The application name with max 70 chars.
         * @param {string} oIntermediateResult.appNameShort The application name with max 20 chars.
         * @param {int} oIntermediateResult.timeToInteractive The detected end-to-end time of the step.
         * @param {object} oRelatedEvent Event from _trackedEvents array which was used to detect the scenario.
         * @returns {object} enhanced oIntermediateResult
         * @private
         */
        _enhanceRecord: function (sDetectedScenario, oIntermediateResult, oRelatedEvent) {
            switch (sDetectedScenario) {
                case SCENARIOS.HOME_INITIAL:
                    return this._enhanceInitialStart(oIntermediateResult, sDetectedScenario, "FLP-TTI-Homepage");
                case SCENARIOS.CUSTOM_HOME_INITIAL:
                    return this._enhanceInitialStart(oIntermediateResult, sDetectedScenario, "FLP-TTI-Homepage-Custom");
                case SCENARIOS.FINDER_INITIAL:
                    return this._enhanceInitialStart(oIntermediateResult, sDetectedScenario, "FLP-TTI-AppFinder");
                case SCENARIOS.APP_INITIAL:
                    return this._enhanceInitialAppStart(oIntermediateResult, sDetectedScenario, oRelatedEvent || {});
                case SCENARIOS.NAVIGATION:
                case SCENARIOS.HOME_LOADING:
                    return this._enhanceNavigationRecord(oIntermediateResult, sDetectedScenario, oRelatedEvent || {});
                default:
                    break;
            }

            // unknown scenario
            Log.warning("[fesrEnhFlp] Unknown scenario at the end of execution, unnecessary code executed",
                null, "sap.ushell.performance.FesrEnhancer");
            return oIntermediateResult;
        },

        /**
         * Takes the given FESR information oIntermediateResult and returns an enhanced version using the given information
         * for scenario initial start.
         *
         * @param {object} oIntermediateResult Result that is enhanced.
         * @param {string} sStepName Name of Step.
         * @param {string} sPerformanceMarkName Name of performance mark.
         * @returns {object} The enhanced version using the given information for scenario initial start.
         */
        _enhanceInitialStart: function (oIntermediateResult, sStepName, sPerformanceMarkName) {
            var oMark,
                oEnhancedFesrHandle = deepExtend({}, oIntermediateResult);

            // set step name
            if (sStepName === SCENARIOS.CUSTOM_HOME_INITIAL) {
                // special case: home app
                oEnhancedFesrHandle.stepName = sStepName + "@" + oIntermediateResult.appNameShort;
            } else {
                // ordinary case
                oEnhancedFesrHandle.stepName = sStepName;
            }

            // set interaction type
            oEnhancedFesrHandle.interactionType = INTERACTION_TYPE.APP_START;

            // set performance mark
            if (sPerformanceMarkName) {
                // if available also add the exact Time To Interactive
                oMark = this._getPerformanceEntries(sPerformanceMarkName, true)[0];
                if (oMark) {
                    // in case of initial start, the startTime is most accurate
                    oEnhancedFesrHandle.timeToInteractive = oMark.startTime;
                    return oEnhancedFesrHandle;
                }
                // empty page
                 oMark = this._getPerformanceEntries("FLP-Pages-Service-loadPage-end", false)[0];
                if (oMark) {
                    // in case of empty page, the time load page end is most accurate
                    oEnhancedFesrHandle.timeToInteractive = oMark.startTime;
                    return oEnhancedFesrHandle;
                }

                Log.warning("[fesrEnhFlp] Scenario '" + sStepName + "' detected but expected performance mark '" +
                    sPerformanceMarkName + "' does not exist",
                    null, "sap.ushell.performance.FesrEnhancer"
                );
            }

            return oEnhancedFesrHandle;
        },

        /**
         * Takes the given FESR information oIntermediateResult and related record and returns an enhanced version
         * using the given information for scenario navigation.
         *
         * @param {object} oIntermediateResult Intermediate result.
         * @param {string} sDetectedScenario detected scenario
         * @param {object} oRelatedRecord Related record.
         * @returns {object} Adjusted FESR record.
         */
        _enhanceNavigationRecord: function (oIntermediateResult, sDetectedScenario, oRelatedRecord) {
            var oEnhancedFesrHandle = deepExtend({}, oIntermediateResult);
            // keep step from FESR
            if (sDetectedScenario !== "FLP@DURING_LOAD") {
                oEnhancedFesrHandle.stepName = oRelatedRecord.step || oIntermediateResult.stepName;
            }
            oEnhancedFesrHandle.appNameShort = oRelatedRecord.targetApplication || "";
            if (oRelatedRecord.applicationType === "UI5") {
                oEnhancedFesrHandle.interactionType = INTERACTION_TYPE.APP_START;
            }

            if (/^FLP_BACK/.test(oEnhancedFesrHandle.stepName)) {
                var oMark = this._getPerformanceEntries("FLP-TTI-Homepage", true)[0];
                if (oMark) {
                    if (oMark.startTime > oRelatedRecord.getTimeStart()) {
                        oEnhancedFesrHandle.timeToInteractive = oMark.startTime - oRelatedRecord.getTimeStart();
                    }
                }
            }
            return oEnhancedFesrHandle;
        },

        /**
         * Takes the given FESR information oIntermediateResult and returns an enhanced version using the given information
         * for scenario initial app start.
         *
         * @param {object} oIntermediateResult Intermediate result.
         * @param {string} sStepName Name of the step.
         * @param {object} oRelatedRecord Related record.
         * @returns {object} Adjusted FESR record.
         */
        _enhanceInitialAppStart: function (oIntermediateResult, sStepName, oRelatedRecord) {
            var oEnhancedFesrHandle = deepExtend({}, oIntermediateResult);
            oEnhancedFesrHandle.stepName = sStepName;
            oEnhancedFesrHandle.appNameShort = oIntermediateResult.appNameShort;

            if (oRelatedRecord.applicationType === "UI5") {
                oEnhancedFesrHandle.interactionType = INTERACTION_TYPE.APP_START;
            } else {
                //Not UI5 applications handle the start flag theirself and we need to avoid duplication in the statistic
                oEnhancedFesrHandle.interactionType = INTERACTION_TYPE.STEP_IN_APP;
            }
            return oEnhancedFesrHandle;
        }
    };

    return oFesrEnhancer;
}, /* bExport= */ true);
