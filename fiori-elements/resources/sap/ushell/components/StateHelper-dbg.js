// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper functions to handle app states
 */
sap.ui.define([], function () {
    "use strict";

    function getPassStates (aStates) {
        //an array with the relevant states that were pass as argument
        var aPassStates = [],
            i;
        aStates = aStates || [];

        for (i = 0; i < aStates.length; i++) {
            if (aStates[i] !== undefined) {
                if (aStates[i] !== "home" && aStates[i] !== "app") {
                    throw new Error("sLaunchpadState value is invalid");
                }
                aPassStates.push(aStates[i]);
            }
        }

        if (!aPassStates.length) {
            aPassStates = ["app", "home"];
        }

        return aPassStates;
    }

    function getModelStates (sStates, bDoNotPropagate) {
        //an array with the relevant states that need to updated in the model
        var aModelStates = [];

        //in case we need to update to the "app" state, need to update all app states
        if (sStates === "app" && !bDoNotPropagate) {
            var aAppStates = ["app", "minimal", "standalone", "embedded", "headerless", "merged", "blank", "lean"];
            aModelStates = aModelStates.concat(aAppStates);
        } else if (sStates === "home" && !bDoNotPropagate) {
            var aHomeStates = ["home", "embedded-home", "headerless-home", "merged-home", "blank-home", "lean-home"];
            aModelStates = aModelStates.concat(aHomeStates);
        } else {
            aModelStates.push(sStates);
        }
        return aModelStates;
    }

    /**
     * Get app states to update including nested states (e.g. "home", "embedded-home" etc.)
     * @param {Array} [aStates] list of the basic app states
     * @param {boolean} [bDoNotPropagate] if true - nested state should be ignored
     * @returns  {string[]} List of states
     */
    function getAllStateToUpdate (aStates, bDoNotPropagate) {
        var aPassStates = bDoNotPropagate ? aStates : getPassStates(aStates);
        return aPassStates.reduce(function (aResult, sStateName) {
            var aModelState = getModelStates(sStateName, bDoNotPropagate);
            if (aModelState) {
                aResult = aResult.concat(aModelState);
            }
            return aResult;
        }, []);
    }

    return {
        getAllStateToUpdate: getAllStateToUpdate,
        getModelStates: getModelStates,
        getPassStates: getPassStates
    };
});
