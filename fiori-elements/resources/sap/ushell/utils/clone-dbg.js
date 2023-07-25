// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains functionality to deep clone javascript
 * plain objects.
 *
 * This functionality is not public and is to be imported in the scope of the
 * unified shell code only.
 */

sap.ui.define([
    "sap/ushell/utils/type"
], function (oType) {
    "use strict";

    /* global WeakMap */

    /**
     * Returns the deep copy of a complex or a primitive data type.
     * <p>
     * WARNING: This method assumes complex data types are either plain objects
     * or arrays. Any object that is not a plain object is kept as is, without
     * being deeply cloned.
     * <p>
     * If a complex value that includes functions, null, or undefined values
     * are passed, these will be preserved in the cloned complex type.
     *
     * @param {variant} vData
     *  the data to clone, can have any type
     *
     * @returns {variant}
     *  the cloned data
     *
     * @private
     */
    function clone (vData) {

        function createEmptyComplexFrom (vOriginalComplex) {
            return oType.isPlainObject(vOriginalComplex) ? {} : [];
        }
        function isDeepClonableComplex (v) {
            if (v instanceof Promise) {
                return false;
            }

            return oType.isPlainObject(v) || oType.isArray(v);
        }
        function getItemsOf (vComplex) {
            if (oType.isPlainObject(vComplex)) {
                return Object.keys(vComplex).map(function (sKey) {
                    return { key: sKey, value: vComplex[sKey] };
                });
            }

            /**
             * Do not use "map": the mapping function is not called for blank
             * entries of the array (e.g., after a delete). We always want
             * to have an array of objects out of this function.
             */
            var iTotalItems = vComplex.length;
            var aItems = [];
            for (var i = 0; i < iTotalItems; i++) {
                aItems.push({
                    value: vComplex[i]
                });
            }

            return aItems;
        }
        function appendItemToComplex (oItem, vComplex) {
            var fnAppend = oType.isPlainObject(vComplex)
                ? function (oItem, vComplex) { vComplex[oItem.key] = oItem.value; }
                : function (oItem, vComplex) { vComplex.push(oItem.value); };

            fnAppend(oItem, vComplex);
        }
        function scheduleItemsCopy (aItemsToClone, aRemainingItemsCount, aQueue) {
            aRemainingItemsCount.push(aItemsToClone.length);
            Array.prototype.push.apply(aQueue, aItemsToClone);
        }

        if (!isDeepClonableComplex(vData)) {
            return vData;
        }

        var vClone = createEmptyComplexFrom(vData);

        // Algorithm implements a breadth first search (BFS) on the complex
        // data type. It maintains 3 queues:
        //
        // - The queue of references to initially empty complex types. Items
        //   from this queues are only filled with clones of other items.
        var aComplexClonesToFillQueue = [ vClone ];
        // - The queue of original items (complex or primitive) that must be
        //   first cloned and then added to the next complex from
        //   aComplexClonesToFillQueue.
        var aRemainingOriginalItems = [];
        // - Keeps the count of how many items from aRemainingOriginalItems
        //   must be cloned next.
        var aRemainingOriginalItemsCount = [];

        var oVisitedReferences = new WeakMap();
        oVisitedReferences.set(vData, vClone);

        scheduleItemsCopy(
            getItemsOf(vData), // items
            aRemainingOriginalItemsCount,
            aRemainingOriginalItems
        );

        while (aComplexClonesToFillQueue.length > 0) {
            var vTargetComplex = aComplexClonesToFillQueue.shift();
            var iRemainingCount = aRemainingOriginalItemsCount.shift();

            aRemainingOriginalItems
                .splice(0, iRemainingCount) // work on items for target complex only
                .forEach(function (oItemToClone) {
                    var vPrimitiveOrComplex = oItemToClone.value;

                    if (!isDeepClonableComplex(vPrimitiveOrComplex)) {
                        appendItemToComplex(oItemToClone, vTargetComplex);
                        return;
                    }

                    // -- clonable complex value --
                    var vOriginalComplex = vPrimitiveOrComplex;

                    // reference?
                    var vAlreadyClonedComplex = oVisitedReferences.get(vOriginalComplex);
                    if (vAlreadyClonedComplex) {
                        // no need to clone this again, just create a circular
                        // reference within the cloned object.
                        appendItemToComplex({
                            key: oItemToClone.key,
                            value: vAlreadyClonedComplex // reference to existing object in the cloned object
                        }, vTargetComplex);
                        return;
                    }

                    // new object
                    var vComplexToFillLater = createEmptyComplexFrom(vOriginalComplex);
                    oVisitedReferences.set(vOriginalComplex, vComplexToFillLater);

                    appendItemToComplex({
                        key: oItemToClone.key,
                        value: vComplexToFillLater
                    }, vTargetComplex);

                    // fill this complex later
                    aComplexClonesToFillQueue.push(vComplexToFillLater);

                    // queue items for later
                    scheduleItemsCopy(
                        getItemsOf(vOriginalComplex),
                        aRemainingOriginalItemsCount,
                        aRemainingOriginalItems
                    );

                });
        }

        return vClone;
    }

    return clone;

}, false /* bExport */);
