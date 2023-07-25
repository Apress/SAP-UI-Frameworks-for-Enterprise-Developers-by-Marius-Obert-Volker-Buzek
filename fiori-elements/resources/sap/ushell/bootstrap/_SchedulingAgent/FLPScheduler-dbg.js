// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/bootstrap/_SchedulingAgent/state",
    "sap/base/util/LoaderExtensions",
    "sap/base/Log",
    "sap/ushell/Config"
], function (
    state,
    LoaderExtensions,
    Log,
    Config
) {
    "use strict";

    var oStatesDefinitions = {
        Loaded: "loaded",
        Wait: "wait",
        Step: "step",
        Error: "error",
        BlockDone: "blockDone",
        Start: "start",
        Done: "done",
        Skipped: "skipped"
    };

    var LOADING_CONFIG_PATH = "sap/ushell/bootstrap/_SchedulingAgent/LoadingConfiguration.json";
    var STEP_CONFIG_PATH = "sap/ushell/bootstrap/_SchedulingAgent/StepConfiguration.json";

    function getCurrentState () {
        return Config.last("/core/shell/model/currentState/stateName");
    }

    var FLPScheduler = {

        oSchedule: {
            iBlockIndex: 0,
            aBlocksLoading: []
        },

        /**
         * Initializes the scheduler.
         *
         * @param {object} stepConfig The technical configuration of
         *                 all loading steps
         * @returns {boolean} A flag indicating if the construction of
         *                    the schedule was succesful
         * @protected
         */
        initializeSchedule: function () {
            var pStepConfig = LoaderExtensions.loadResource(STEP_CONFIG_PATH, {async: true});
            var pLoadingConfig = LoaderExtensions.loadResource(LOADING_CONFIG_PATH, {async: true});
            var oPromise = Promise.all([pStepConfig, pLoadingConfig]).then(function (values) {
                var oStepConfig = values[0];
                var oLoadingConfig = values[1];
                var bConfigOk = this._validateConfig(oLoadingConfig, oStepConfig);

                if (bConfigOk) {
                    this.oSchedule.oBlocks = oLoadingConfig.LoadingBlocks;
                    this.oSchedule.oSteps = oStepConfig;
                    this.oSchedule.aBlockOrder = oLoadingConfig.OrderOfLoadingBlocks;
                    this.oSchedule.iBlockIndex = 0;
                    state.setForModule(state.id.module.flpScheduler.id, state.id.module.flpScheduler.Initialized, "Schedule validated");
                } else {
                    state.setForModule(state.id.module.flpScheduler.id, state.id.module.flpScheduler.WrongConfiguration, "Configuration error");
                }
                return bConfigOk;
            }.bind(this));

            return oPromise;

        },

        /**
         * Returns the next action that needs to be handled by the scheduler.
         * Should be only called by the Control Unit.
         * Generally, the returned object will contain a loading step, some
         * other actions are possible.
         *
         * @returns {{sStatus: string, oContent: object, oConfig: object}}
         *  An object containing the next loading step to be loaded.
         *    sStatus is a string describing the content of the object: a
         * loading step ('step'), a waiting order ('wait') or an error
         * ('error').
         *    oContent if a step needs to be loaded, this contains it
         *    oConfig the technical configuration for the given step
         * @protected
         */
        getNextLoadingStep: function () {
            var oStep = {
                sStatus: oStatesDefinitions.Start,
                oContent: {}
            };
            // If the loading Queue is empty, load the next block
            if (this.oSchedule.aBlocksLoading.length === 0) {
                var bLoadingDone = this._startLoadingBlock();
                if (bLoadingDone) {
                    oStep.sStatus = oStatesDefinitions.Done;
                    return oStep;
                }
            }
            // If parallel loading of groups is allowed, load the next block
            var sLastBlockId = this.oSchedule.aBlocksLoading[this.oSchedule.aBlocksLoading.length - 1];
            var iLastCurrentBlockPosition = this.oSchedule.aBlockOrder.indexOf(sLastBlockId);
            var sNextPossibleBlock = this.oSchedule.aBlockOrder[iLastCurrentBlockPosition + 1];

            if (this.oSchedule.oBlocks[sLastBlockId].bCanBeLoadedConcurrently && sNextPossibleBlock) {
                this._startLoadingBlock();
            }

            // Go over the active blocks and check the status of the corresponding loading
            // steps. If needed, close a block that is done.
            var bAllStepsDone = true;
            var bAStepIsLoading = false;
            // Variables initialized in the loop
            var sCurrentBlock, oCurrentBlock, iCurrentStep, oCurrentStep, bStepEndOfBlock, oCurrentLoading,
                iIndexCurrentBlock, bCurrentStepLoading, bCurrentStepLoaded;

            for (var i = 0; i < this.oSchedule.aBlocksLoading.length; i++) {
                sCurrentBlock = this.oSchedule.aBlocksLoading[i];
                oCurrentBlock = this.oSchedule.oBlocks[sCurrentBlock];
                iCurrentStep = oCurrentBlock.iStepIndex;
                oCurrentStep = oCurrentBlock.LoadingSteps[iCurrentStep];
                bStepEndOfBlock = iCurrentStep === oCurrentBlock.LoadingSteps.length -1;

                // Check if the async queue is still loading
                oCurrentLoading = this._checkAndUpdateAsyncQueue(oCurrentBlock);

                // Check the current step:
                bCurrentStepLoaded = state.isStepLoaded(oCurrentStep.LoadingStep) || state.isStepSkipped(oCurrentStep.LoadingStep);
                bCurrentStepLoading = state.isStepLoading(oCurrentStep.LoadingStep);
                bAllStepsDone = oCurrentLoading.bAllStepsDone && bCurrentStepLoaded;
                bAStepIsLoading = oCurrentLoading.bAStepIsLoading || bCurrentStepLoading;

                if ((bCurrentStepLoading && !oCurrentStep.canBeLoadedAsync) || (bAStepIsLoading && bStepEndOfBlock)) {
                    oStep.sStatus = oStatesDefinitions.Wait;
                    continue;
                }

                // If a step was loaded, update the index.
                // This is needed because the first step of a group shouldn't change the
                // index but will be still loaded in this loop.
                if (!bStepEndOfBlock || !bCurrentStepLoaded && !bCurrentStepLoading) {
                    if (bCurrentStepLoaded || (oCurrentStep.canBeLoadedAsync && bCurrentStepLoading)) {
                        iCurrentStep += 1;
                    }
                    oStep = this._prepareStepForLoading(oCurrentBlock, sCurrentBlock, iCurrentStep);
                }

                // Check if all steps of the block are loaded and update the queue accordingly
                if (bAllStepsDone && bStepEndOfBlock) {
                    iIndexCurrentBlock = this.oSchedule.aBlocksLoading.indexOf(sCurrentBlock);
                    this.oSchedule.aBlocksLoading.splice(iIndexCurrentBlock, 1);
                    oStep.sStatus = oStatesDefinitions.BlockDone;
                    state.setForLoadingBlock(sCurrentBlock, state.id.loadingBlock.Done, "", "Block removed from loading queue");
                }
                // The scheduler will be called until a wait comes, so after a loading is started
                // jump out of the loop to avoid overwriting this loading with the next one
                if (oStep.sStatus !== oStatesDefinitions.wait) {
                    break;
                }
            }
            return oStep;
        },

        /**
         *  Dumps the current schedule object to the console
         *  Needs to be extended, eventually.
         *  @private
         */
        dumpSchedule: function () {
            Log.debug(JSON.stringify(this.oSchedule));
        },

        /**
         * Checks the different config switches to see if a step should be loaded or skipped.
         * This information is checked on the ExcludedFLPStates, the mandatoryFLPStates,
         * as well as in any existent config switch.
         *
         * @param {object} step The step being currently processed.
         *
         * @returns {boolean} A flag indicating if the step should be loaded.
         *
         * @private
         */
        _loadingIsEnabled: function (step) {
            var aSwitches;

            if (Array.isArray(step.oConfig.excludedFLPStates)) {
                if (step.oConfig.excludedFLPStates.indexOf(getCurrentState()) > -1) {
                    return false;
                }
            }

            if (Array.isArray(step.oConfig.mandatoryFLPStates) && step.oConfig.mandatoryFLPStates.length !== 0) {
                if (step.oConfig.mandatoryFLPStates.indexOf(getCurrentState()) === -1) {
                    return false;
                }
            }

            // Check if any of the provided configuration switch conditions is not met.
            // configSwitch may be a key-value pair {path, assertionValue}, or an array of such pairs.
            // If the path is empty, the condition is ignored
            function assertFalse (oSwitch) {
                return oSwitch.path && Config.last(oSwitch.path) !== oSwitch.assertionValue;
            }
            if (step.oConfig.configSwitch) {
                aSwitches = [].concat(step.oConfig.configSwitch); // Make it an array
                if (aSwitches.some(assertFalse)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Updates the async queue of a given block and the relevant flags.
         *
         * @param {object} currentBlock The block being currently processed.
         *
         * @returns {{bAllStepsDone: boolean, bAStepIsLoading: boolean}}
         * The current loading state of the async steps.
         *   bAllStepsDone is true if all steps have been loaded.
         *   bAStepIsLoading is true if one or more steps are still in the queue.
         *
         * @private
         */
        _checkAndUpdateAsyncQueue: function (currentBlock) {
            var aTempArray = [];
            var bCurrentStepLoaded, bCurrentStepLoading, sCurrentStep;
            var bAllStepsDone = true;
            var bAStepIsLoading = false;

            for (var i = 0; i < currentBlock.aAsyncStepsLoading.length; i++) {
                sCurrentStep = currentBlock.aAsyncStepsLoading[i];

                bCurrentStepLoaded = state.isStepLoaded(sCurrentStep) || state.isStepSkipped(sCurrentStep);
                bCurrentStepLoading = state.isStepLoading(sCurrentStep);
                if (bCurrentStepLoading) {
                    aTempArray.push(sCurrentStep);
                }
                // track if all the steps in a block are loaded
                // This is relevant to avoid loading the next block in an async scenario
                // where the last step of the group is loaded but other steps are still
                // loading
                bAllStepsDone = bAllStepsDone && bCurrentStepLoaded;
                bAStepIsLoading = bAStepIsLoading || bCurrentStepLoading;
            }
            currentBlock.aAsyncStepsLoading = aTempArray;

            return {
                bAllStepsDone: bAllStepsDone,
                bAStepIsLoading: bAStepIsLoading
            };
        },

        /**
         * Takes the next loading block from the schedule, initializes it and adds it
         * to the block loading queue.
         *
         *  @returns {boolean} A boolean set to true if all blocks have been loaded.
         *  @private
         */
        _startLoadingBlock: function () {
            var bLoadingDone = false;
            if (this.oSchedule.iBlockIndex < this.oSchedule.aBlockOrder.length) {
                // Put the new block in the queue
                var sNewBlock = this.oSchedule.aBlockOrder[this.oSchedule.iBlockIndex];
                this.oSchedule.aBlocksLoading.push(sNewBlock);
                // Initialize the step index
                this.oSchedule.oBlocks[sNewBlock].iStepIndex = 0;
                this.oSchedule.oBlocks[sNewBlock].aAsyncStepsLoading = [];
                this.oSchedule.iBlockIndex += 1;
                state.setForLoadingBlock(sNewBlock, state.id.loadingBlock.Prepared, "", "Block added to the loading queue.");
            } else {
                // Loading finished until further notice!
                bLoadingDone = true;
            }
            return bLoadingDone;
        },

        /**
         * Prepares a given step to be passed to the control unit. If needed, a "wait"/"skip" step is returned instead..
         *
         * @param {object} currentBlock The current block being processed
         * @param {string} blockName The name of the current block
         * @param {int} stepIndex The index of the steps loading queue of the block
         *
         * @returns {object} The step object containing all the relevant configuration.
         *                   This can also be a waiting or skip step.
         */
        _prepareStepForLoading: function (currentBlock, blockName, stepIndex) {
            var bCurrentStepCanBeLoadedAsync;
            var oStepInfo = {
                sStatus: oStatesDefinitions.Step,
                oContent: currentBlock.LoadingSteps[stepIndex],
                oConfig: this.oSchedule.oSteps[currentBlock.LoadingSteps[stepIndex].LoadingStep]
            };

            // Check if we are allowed to load this step
            if (!this._loadingIsEnabled(oStepInfo)) {
                oStepInfo.sStatus = oStatesDefinitions.Skipped;
                currentBlock.iStepIndex = stepIndex;
                state.setForLoadingStep(oStepInfo.oContent.LoadingStep, state.id.loadingStep.Skipped, "", "Step set to skipped");
                return oStepInfo;
            }

            var oDependenciesStatus = this._checkDependencies(oStepInfo, blockName);

            if (oDependenciesStatus.bMissing) {
                oStepInfo.sStatus = oStatesDefinitions.Error;
            } else if (oDependenciesStatus.bAllLoaded) {
                state.setForLoadingStep(oStepInfo.oContent.LoadingStep, state.id.loadingStep.Prepared, "", "Step prepared for control unit");
                bCurrentStepCanBeLoadedAsync = oStepInfo.oContent.canBeLoadedAsync;
                currentBlock.iStepIndex = stepIndex;
                if (bCurrentStepCanBeLoadedAsync) {
                    state.setForLoadingStep(oStepInfo.oContent.LoadingStep, state.id.loadingStep.Prepared, "", "Step set on the async loading queue");
                    currentBlock.aAsyncStepsLoading.push(oStepInfo.oContent.LoadingStep);
                }
            } else {
                // need to wait for a dependency
                oStepInfo.sStatus = oStatesDefinitions.Wait;
                state.setForLoadingStep(oStepInfo.oContent.LoadingStep, state.id.loadingStep.WaitingForDependencies, "", "Step missing dependencies");
            }

            return oStepInfo;
        },

        /**
         * Checks the dependencies (if any) of a step to see if they have been loaded.
         * In case of missing dependencies (not loaded or loading), it sets the
         * internal state accordingly.
         *
         * @param {object} step The step information.
         * @param {string} blockName The current loading block
         *
         * @returns {{bMissing: boolean, bAllLoaded: boolean}}
         * An object containing the loading information for the dependencies
         *    bAllLoaded: all needed dependencies are loaded.
         *    bMissing: a dependency could not be resolved.
         */
        _checkDependencies: function (step, blockName) {
            var oDependencyStatus = {
                bAllLoaded: true,
                bMissing: false
            };

            if (step.oConfig.Dependencies) {
                for (var i = 0; i < step.oConfig.Dependencies.length; i++) {
                    oDependencyStatus.bAllLoaded = oDependencyStatus.bAllLoaded && state.isStepLoaded(step.oConfig.Dependencies[i]);
                    if (!state.isStepLoaded(step.oConfig.Dependencies[i]) && !state.isStepLoading(step.oConfig.Dependencies[i])) {
                        state.setForLoadingStep(step.oContent.LoadingStep, state.id.loadingStep.Aborted, step.oConfig.Dependencies[i], "Missing a dependency");
                        state.setForLoadingBlock(blockName, state.id.loadingBlock.Aborted, step.oConfig.Dependencies[i], "A step is missing a dependency");
                        state.setForModule(state.id.module.flpScheduler.id, state.id.module.flpScheduler.LoadingAborted, "Dependencies can not be resolved: a dependency isn't loading before it is required.");
                        oDependencyStatus.bMissing = true;
                        oDependencyStatus.bAllLoaded = false;
                        break;
                    }
                }
            }

            return oDependencyStatus;
        },

        /**
         * Checks the loading configuration file for the most necessary parts
         *
         * @param {object} loadingConfig The loading configuration object
         * @param {object} stepConfig The step configuration object
         * @returns {boolean} A flag indicating if the configuration is valid
         * @private
         */
        _validateConfig: function (loadingConfig, stepConfig) {
            // Check if the most important parts are defined
            var bConfigStructureCorrect = loadingConfig && loadingConfig.OrderOfLoadingBlocks &&
                loadingConfig.LoadingBlocks && loadingConfig.OrderOfLoadingBlocks.length && stepConfig;
            if (!bConfigStructureCorrect) {
                return false;
            }
            // Check if all blocks in loading configuration are defined
            var bBLocksDefined = loadingConfig.OrderOfLoadingBlocks.reduce(
                function (bBlocksCorrect, sBlockName) {
                    bBlocksCorrect = bBlocksCorrect && loadingConfig.LoadingBlocks[sBlockName];
                    if (bBlocksCorrect) {
                        var oCurrentBlock = loadingConfig.LoadingBlocks[sBlockName];
                        var bStepsCorrect = true;
                        // Check if the loading steps are defined in the ComponentConfiguration
                        if (oCurrentBlock.LoadingSteps) {
                            var sStepName;
                            for (var j = 0; j < oCurrentBlock.LoadingSteps.length; j++) {
                                sStepName = oCurrentBlock.LoadingSteps[j].LoadingStep;
                                bStepsCorrect = bStepsCorrect && stepConfig[sStepName];
                            }
                        }
                        bBlocksCorrect = bBlocksCorrect && bStepsCorrect;
                    }
                    return !!bBlocksCorrect;
                }, true);

            return bBLocksDefined;
        }
    };

    return FLPScheduler;

}, false);
