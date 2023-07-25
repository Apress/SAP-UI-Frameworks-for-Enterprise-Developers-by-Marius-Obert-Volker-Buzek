// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";

    function fnAddIdPreserveUniqueness (aExistingIds, sIdToAdd) {
        return aExistingIds.indexOf(sIdToAdd) === -1 ?
            aExistingIds.concat(sIdToAdd) :
            aExistingIds;
    }
    function fnAddIdsPreserveUniqueness (aExistingIds, aIdsToAdd) {
        return aIdsToAdd.reduce(fnAddIdPreserveUniqueness, aExistingIds);
    }

    function fnFilterNotReserved (aReserved) {
        return function (sId) {
            return aReserved.indexOf(sId) === -1;
        };
    }

    function fnValidateAddingHeaderItems (aExistingIds, aIdsToAdd) {
        return fnAddIdsPreserveUniqueness(
            aExistingIds,
            aIdsToAdd.filter(
                fnFilterNotReserved(["backBtn"])
            )
        ).length <= 3;
    }

    /**
     *  Returns back the new state for header item given  the existing items and the items to add.
     *  keeping userActionsMenuHeaderButton at the first place
     *  keeping back button on the next place
     *  keeping home button on the next place
     * @param {array} aCurrentlyExistingItems
     * @param {array} aIdsToAdd
     * @returns {array} the result array
     */
    function fnAddHeaderItems (aCurrentlyExistingItems, aIdsToAdd) {
        var aNewItems = [],
            aConcatItems = aCurrentlyExistingItems.concat(aIdsToAdd);

        // Check if backBtn is part of aCurrentlyExistingItems or aIdsToAdd. If so, place it next.
        if (aCurrentlyExistingItems.indexOf("backBtn") > -1 || aIdsToAdd.indexOf("backBtn") > -1) {
            aNewItems.push("backBtn");
        }

        if (aNewItems.length < 3) {
            for (var i = 0; i < aConcatItems.length; i++) {
                var sItemName = aConcatItems[i];
                if (aNewItems.indexOf(sItemName) === -1) {
                    aNewItems.push(sItemName);
                }
                if (aNewItems.length >= 3) {
                    break;
                }
            }
        }
        return aNewItems;
    }

    function execute (aCurrentValue, aValueToAdjust) {
        var aResult = aCurrentValue;

        if (fnValidateAddingHeaderItems(aCurrentValue, aValueToAdjust)) {
            aResult = fnAddHeaderItems(aCurrentValue, aValueToAdjust);
        }

        return aResult;
    }

    return {
        execute: execute
    };
});
