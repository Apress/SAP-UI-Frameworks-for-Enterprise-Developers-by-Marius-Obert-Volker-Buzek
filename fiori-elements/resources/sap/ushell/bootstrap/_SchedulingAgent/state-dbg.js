// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/* eslint-disable no-console */

/**
 * @fileOverview
 * The state module implements the internal state of the "FLP Bootstrap Scheduling Agent" (FBSA).
 * It is used by all its sub modules (e.g. loader, scheduler) and the scheduling agent itself.
 *
 * State information is kept for loading blocks, loading steps and all FBSA modules.
 *
 * Generic and protected functions offer read and write access to the state object.
 * These are provided as part of this module.
 *
 * For example:
 *
 * - state.setforLoadingBlock
 * - state.getforLoadingBlock
 * - state.setforLoadingStep
 * - state.getforLoadingStep
 * - state.setforModule
 * - state.getforModule
 *
 * - state.isBlockWaitingForDependencies
 * - state hasBlockLoadingTimedOut
 * - and other convenience functions
 *
 * The methods offer some parameters, which are feed with fixed values (e.g. for state IDs and module IDs).
 * These can be defined and registered by the owning FBSA modules, which write state information.
 * The fixed state values, the "IDs", are then available for the other FBSA modules.
 *
 * It is also okay, if other FBSA modules register and use further convenience methods.
 *
 * In general any state change is written to the log.
 *
 * Remarks:
 * > Perspective:
 * . Contants defined in owner modules
 * . Dedicated functions to register or access further IDs and convenience methods
 *
 * How to use:
 *
 * <pre>
 * sap.ui.define([
 *    "sap/ushell/bootstrap/_SchedulingAgent/state"
 * ], function (
 *    state
 * ) {
 *
 *   // Set a state for a module
 *   state.setForModule(state.id.module.state.id,
 *      state.id.module.state.Initializing,
 *      "Hello Bootstrap Scheduling Agent"
 *   );
 *
 *   // Set the state of a loading step
 *   state.setForLoadingStep("STEP_A",
 *       "DONE", // or use state.id.loadingStep.Done
 *       42,
 *       "Hurra",
 *       "flpScheduler" // state.id.module.flpScheduler.id
 *   );
 *
 *   // Get the state of a loading block and access its parts
 *   var oState = state.getForLoadingBlock("BLOCK_1");
 *   // -> oState.time, oState.status, oState.remark, oState.parameter, oState.byModule
 *
 *   // Use convenience functions
 *   var bStepLoaded = state.isStepLoaded("STEP_1");
 *
 * }, false);
 * </pre>
 *
 * @version 1.113.0
 * @namespace
 */
sap.ui.define([
    "sap/ushell/bootstrap/_SchedulingAgent/logger",
    "sap/base/util/now",
    "sap/base/util/deepClone"
], function (logger, fnNow, fnClone) {
    "use strict";

    // #region ===== IDs =====
    // IDs for use in state properties "id", "status" and "byModule"
    var oId = {
        module: {
            schedulingAgent: {
                id: "schedulingAgent",
                FatalError: "FATAL_ERROR",
                Idle: "IDLE",
                Initialized: "INITIALIZED",
                Initializing: "INITIALIZING",
                Waiting: "WAITING",
                WokeUp: "WOKE_UP",
                Working: "WORKING"
            },
            state: {
                id: "state",
                FatalError: "FATAL_ERROR",
                Available: "AVAILABLE"
            },
            flpScheduler: {
                id: "flpScheduler",
                Initialized: "INITIALIZED",
                WrongConfiguration: "WRONG_CONFIGURATION",
                LoadingAborted: "LOADING_ABORTED"
            },
            flpLoader: {
                id: "flpLoader"
            },
            logger: {
                id: logger,
                Block: "BLOCK",
                Step: "STEP",
                Module: "MODULE"
            }
        },
        loadingStep: {
            Prepared: "STEP_PREPARED",
            WaitingForDependencies: "STEP_WAITING_FOR_DEPENDENCIES",
            InProgress: "STEP_IN_PROGRESS",
            Done: "STEP_DONE",
            Aborted: "STEP_ABORTED",
            Skipped: "STEP_SKIPPED"
        },
        loadingBlock: {
            Prepared: "BLOCK_PREPARED",
            WaitingForDependencies: "BLOCK_WAITING_FOR_DEPENDENCIES",
            InProgress: "BLOCK_IN_PROGRESS",
            TimedOut: "BLOCK_TIMEDOUT",
            Done: "BLOCK_DONE",
            Aborted: "BLOCK_ABORTED"
        }
    };

    var oStateModule = {
        // IDs for state
        id: oId,

        oState: {
            ofLoadingBlock: {},
            ofLoadingStep: {},
            ofModule: {}
        },

        clear: function () {
            this.oState = {
                ofLoadingBlock: {},
                ofLoadingStep: {},
                ofModule: {}
            };
        },
        /**
         * Returns ID object which defines IDs for using state functions.
         *
         * You can attach IDs here dynamically.
         * @function
         * @returns {object} Object which defines ids for using state functions
         * @protected
         */
        getIdBase: function () { return oId; },

        // #region ===== Elementary functions to access state =====

        // ... of loading blocks
        /**
         * Sets the state of a loading block
         * @param {string} id ID of the loading block: Use values defined in {@link #.id}
         * @param {string} status Its status: Use values defined in {@link #.id}
         * @param {object} [parameter] Content defined by caller
         * @param {string} [remark] Remark about the state
         * @param {string} [byModule] Id of Module which set the state
         * @protected
         */
        setForLoadingBlock: function (id, status, parameter, remark, byModule) {
            this.oState.ofLoadingBlock[id] = {
                time: fnNow(),
                status: status,
                parameter: parameter,
                remark: remark,
                byModule: byModule
            };

            logger.logStatus({
                time: this.oState.ofLoadingBlock[id].time,
                type: oId.module.logger.Block,
                id: id,
                status: status,
                parameter: parameter,
                remark: remark,
                byModule: byModule
            });
        },

        /**
         * Returns the state of a loading block
         * @param {string} id ID of the loading block: Use values defined in {@link #.id}
         * @return {{time: float, status: string, parameter: object, remark: string, byModule: string}} State information
         * @protected
         */
        getForLoadingBlock: function (id) {
            return this.oState.ofLoadingBlock[id];
        },

        // ... of loading steps

        /**
         * Sets the state of a loading step
         * @param {string} id ID of the loading step: Use values defined in {@link #.id}
         * @param {string} status Status of the loading step: Use values defined in {@link #.id}
         * @param {object} [parameter] Content defined by caller
         * @param {string} [remark] Optional remark
         * @param {string} [byModule] Id of Module which set the state
         * @protected
         */
        setForLoadingStep: function (id, status, parameter, remark, byModule) {
            this.oState.ofLoadingStep[id] = {
                time: fnNow(),
                status: status,
                parameter: parameter,
                remark: remark,
                byModule: byModule
            };

            logger.logStatus({
                time: this.oState.ofLoadingStep[id].time,
                type: oId.module.logger.Step,
                id: id,
                status: status,
                parameter: parameter,
                remark: remark,
                byModule: byModule
            });
        },

        /**
         * Returns the state of a loading step
         * @param {string} id ID of the loading step: Use values defined in {@link #.id}
         * @return {{time: float, status: string, parameter: object, remark: string, byModule: string}} State information
         * @protected
         */
        getForLoadingStep: function (id) {
            return this.oState.ofLoadingStep[id];
        },

        // ... of modules

        /**
         * Sets the state of a module
         * @param {string} id ID of the module: Status: Use values defined in {@link #.id}
         * @param {string} status Its status: Use values defined in {@link #.id}
         * @param {string} [remark] Remark about the status
         * @protected
         */
        setForModule: function (id, status, remark) {
            this.oState.ofModule[id] = {
                time: fnNow(),
                status: status,
                remark: remark,
                byModule: undefined
            };

            logger.logStatus({
                time: this.oState.ofModule[id].time,
                type: oId.module.logger.Module,
                id: id,
                status: status,
                parameter: undefined,
                remark: remark,
                byModule: undefined
            });
        },

        /**
         * Returns the state of a module
         * @param {string} id ID of the module: : Use values defined in {@link #.id}
         * @returns {{time: float, status: string, remark: string, byModule: string}} The state of the module
         * @protected
         */
        getForModule: function (id) {
            return this.oState.ofModule[id];
        },
        // #endregion

        // #region ===== Convenience functions to access state =====

        // ... of loading blocks

        /**
         * Determines if the block with the given ID is still waiting for dependencies.
         * @param {string} id ID of loading block
         * @returns {boolean} True if the block with the given ID is waiting for dependencies, otherwise false.
         * @protected
         */
        isBlockWaitingForDependencies: function (id) {
            var oStateLoadingBlock = this.getForLoadingBlock(id);
            return !!(oStateLoadingBlock && oStateLoadingBlock.status === oId.loadingBlock.WaitingForDependencies);
        },
        /**
         * Tells if block started loading.
         * @param {string} id ID of loading block
         * @returns {boolean} True if the block with the given ID has started loading, otherwise false.

         * @protected
         */
        isBlockLoading: function (id) {
            var oStateLoadingBlock = this.getForLoadingBlock(id);
            return !!(oStateLoadingBlock && oStateLoadingBlock.status === oId.loadingBlock.InProgress);
        },
        /**
         * Tells if block loading succeeded.
         * @param {string} id ID of the loading block
         * @returns {boolean} True if the block with the given ID has been loaded, otherwise false.
         * @protected
         */
        isBlockLoaded: function (id) {
            var oStateLoadingBlock = this.getForLoadingBlock(id);
            return !!(oStateLoadingBlock && oStateLoadingBlock.status === oId.loadingBlock.Done);
        },
        /**
         * Tells if block loading has been aborted.
         * @param {string} id ID of loading block
         * @returns {boolean} True if the block with the given ID has aborted its loading, otherwise false.
         * @protected
         */
        isBlockLoadingAborted: function (id) {
            var oStateLoadingBlock = this.getForLoadingBlock(id);
            return !!(oStateLoadingBlock && oStateLoadingBlock.status === oId.loadingBlock.Aborted);
        },
        /**
         * Tells if block loading timed out.
         * @param {string} id ID of loading block
         * @returns {boolean} True if the step with the given ID has timed out while loading, otherwise false.
         * @protected
         */
        hasBlockLoadingTimedOut: function (id) {
            var oStateLoadingBlock = this.getForLoadingBlock(id);
            return !!(oStateLoadingBlock && oStateLoadingBlock.status === oId.loadingBlock.TimedOut);
        },

        // ... of loading steps

        /**
         * Tells if step loading is waiting for dependencies.
         * @param {string} id ID of loading step
         * @returns {boolean} True if the step with the given ID is waiting for dependencies, otherwise false.
         * @protected
         */
        isStepWaitingForDependencies: function (id) {
            var oStateLoadingStep = this.getForLoadingStep(id);
            return !!(oStateLoadingStep && oStateLoadingStep.status === oId.loadingStep.WaitingForDependencies);
        },
        /**
         * Tells if step loading has been started.
         * @param {string} id ID of loading step
         * @returns {boolean} True if the step with the given ID has started loading, otherwise false.
         * @protected
         */
        isStepLoading: function (id) {
            var oStateLoadingStep = this.getForLoadingStep(id);
            return !!(oStateLoadingStep && oStateLoadingStep.status === oId.loadingStep.InProgress);
        },
        /**
         * Tells if step loading succeeded.
         * @param {string} id ID of loading step
         * @returns {boolean} True if the step with the given ID has been loaded, otherwise false.
         * @protected
         */
        isStepLoaded: function (id) {
            var oStateLoadingStep = this.getForLoadingStep(id);
            return !!(oStateLoadingStep && oStateLoadingStep.status === oId.loadingStep.Done);
        },
        /**
         * Tells if loading step was aborted.
         * @param {string} id ID of loading step
         * @returns {boolean} True if the step with the given ID has aborted loading, otherwise false.
         * @protected
         */
        isStepLoadingAborted: function (id) {
            var oStateLoadingStep = this.getForLoadingStep(id);
            return !!(oStateLoadingStep && oStateLoadingStep.status === oId.loadingStep.Sborted);
        },
        /**
        * Tells if step was skipped.
        * @param {string} id ID of loading step
        * @returns {boolean} True if the step with the given ID has been skipped, otherwise false.
        * @protected
        */
        isStepSkipped: function (id) {
            var oStateLoadingStep = this.getForLoadingStep(id);
            return !!(oStateLoadingStep && oStateLoadingStep.status === oId.loadingStep.Skipped);
        },

        // ... of modules

        /**
         * Tells if agent is idle.
         * @returns {boolean} True if the agent is idle, otherwise false.
         * @protected
         */
        isAgentIdle: function () {
            var oStateOfModule = this.getForModule(oId.module.schedulingAgent.id);
            return !!(oStateOfModule && oStateOfModule.status === oId.module.schedulingAgent.Idle);
        },
        /**
         * Tells if agent is waiting.
         * @returns {boolean} True if the agent is waiting, otherwise false.
         * @protected
         */
        isAgentWaiting: function () {
            var oStateOfModule = this.getForModule(oId.module.schedulingAgent.id);
            return !!(oStateOfModule && oStateOfModule.status === oId.module.schedulingAgent.Waiting);
        },
        /**
         * Tells if agent woke up.
         * @returns {boolean} True if the agent woke up, otherwise false.
         * @protected
         */
        agentWokeUp: function () {
            var oStateOfModule = this.getForModule(oId.module.schedulingAgent.id);
            return !!(oStateOfModule && oStateOfModule.status === oId.module.schedulingAgent.WokeUp);
        },
        // #endregion

        /**
         * Dumps the state to the console log and returns a copy of the state object.
         *
         * This method is intended for debugging with the browser's developer tools.
         * @returns {object} Copy of the state object
         * @protected
         */
        dump: function () {
            console.log(JSON.parse(JSON.stringify(this.oState)));
            var oStateCopy = fnClone(this.oState);
            return oStateCopy;
        },

        // Starting time
        iStartingTime: fnNow()
    };

    // Module return
    oStateModule.setForModule(oId.module.state.id, oId.module.state.Available);
    return oStateModule;
    // #endregion
});
