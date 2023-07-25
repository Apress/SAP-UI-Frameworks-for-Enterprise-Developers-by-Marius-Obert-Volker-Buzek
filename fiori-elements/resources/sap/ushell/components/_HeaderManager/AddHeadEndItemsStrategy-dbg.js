// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    function fnValidateAddingHeadEndItems (aExistingIds, aIdsToAdd) {
        var allocatedItemSpace = 0,
            index,
            sId;

        if (!aExistingIds || !aIdsToAdd) {
            return false;
        }

        // Check that the controls with the given ids exist
        var bNotExist = aIdsToAdd.some(function (sId) {
            var bNotFound = !sap.ui.getCore().byId(sId);
            if (bNotFound) {
                Log.warning("Failed to find control with id '{id}'".replace("{id}", sId));
            }
            return bNotFound;
        });
        if (bNotExist) {
            return false;
        }

        // We always allow to create the overflow button
        if (aIdsToAdd.length === 1 && aIdsToAdd[0] === "endItemsOverflowBtn") {
            return true;
        }
        for (index = 0; index < aExistingIds.length; index++) {
            sId = aExistingIds[index];
            if (sId !== "endItemsOverflowBtn") {
                // Increment the counter but not consider the overflow button
                allocatedItemSpace++;
            }

            if (allocatedItemSpace + aIdsToAdd.length > 10) {
                Log.warning("maximum of six items has reached, cannot add more items.");
                return false;
            }
            if (aIdsToAdd.indexOf(sId) > -1) {
                return false;
            }
        }

        return true;
    }

    function fnAddHeadEndItems (aCurrentlyExistingItems, aIdsToAdd) {
        var aNewItems = aCurrentlyExistingItems.concat(aIdsToAdd);
        /*
            HeaderEndItems has the following order:
            - search
            - copilot
            - custom items
            - notification
            - overflow button (before me area)
            - UserActionsMenu
            - product switch
        */

        //negative number - left from the custom items
        //positive number - right from custom items
        //the custom items has index 0 and sort based on the id
        var oScale = {
            "sf": -3,
            "copilotBtn": -1,
            //0 custom items
            "NotificationsCountButton": 1,
            "endItemsOverflowBtn": 2,
            "userActionsMenuHeaderButton": 3,
            "productSwitchBtn": 4
        };

        aNewItems.sort(function (a, b) {
            var iAScale = oScale[a] || 0,
                iBScale = oScale[b] || 0;
            if (iAScale === iBScale) {
                return a.localeCompare(b);
            }
            return iAScale - iBScale;
        });

        return aNewItems;
    }

    function execute (aCurrentValue, aValueToAdjust) {
        var aResult = aCurrentValue;

        if (fnValidateAddingHeadEndItems(aCurrentValue, aValueToAdjust)) {
            aResult = fnAddHeadEndItems(aCurrentValue, aValueToAdjust);
        }

        return aResult;
    }

    return {
        execute: execute
    };

});
