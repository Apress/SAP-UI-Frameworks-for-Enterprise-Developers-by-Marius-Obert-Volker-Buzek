// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    function fnValidateRemovingItems (aExistingIds, aIdsToRemove) {
        //if aExistingIds does not contain some ids from aIdsToRemove that not valid
        // at least some items to remove exist
        return aIdsToRemove.some(function (sId) {
                    return (aExistingIds.indexOf(sId) >= 0);
                });
    }

    /**
     * Return the new array without aIdsToRemove. aCurrentExistingIds is not modified
     * @param {Array} aCurrentExistingIds array from which Ids shoud be removed
     * @param {Array} aIdsToRemove array Ids to remove
     * @returns {boolean} the filtered array
     */
    function fnRemoveItems (aCurrentExistingIds, aIdsToRemove) {
        //Filter return the new array in the same order as aCurrentExistingIds
        return aCurrentExistingIds.filter(function (sId) {
            return (aIdsToRemove.indexOf(sId) === -1);
        });
    }


    function execute (aCurrentValue, aValueToAdjust) {
        var aResult = aCurrentValue;

        if (fnValidateRemovingItems(aCurrentValue, aValueToAdjust)) {
            aResult = fnRemoveItems(aCurrentValue, aValueToAdjust);
        } else {
            Log.warning("You cannot remove item: " + aValueToAdjust + ", the item does not exists.");
        }

        return aResult;
    }

    return {
        execute: execute
    };

});
