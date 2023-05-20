// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Enables the Extended Change Detection for a control and implements the specific updateAggregation.
 * Keep in mind, that the Extended Change Detection is enabled for a control and not only for a specific aggregation.
 * The implementation of the specific updateAggregation handles the diff by keeping the items where applicable instead
 * of recreating them. Items which get removed from the aggregation get destroyed and items which get added to the
 * aggregation get created.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ushell/Config"
], function (
    ManagedObject,
    Config
) {
    "use strict";

    var ExtendedChangeDetection = ManagedObject.extend("sap.ushell.ui.launchpad.ExtendedChangeDetection", /** @lends sap.ushell.ui.launchpad.ExtendedChangeDetection.prototype */ {
        metadata: {
            library: "sap.ushell",
            events: {
                /**
                 * Is triggered after the execution of the extended change detection logic where an item was deleted.
                 */
                itemDeleted: {},

                /**
                 * Is triggered after the execution of the extended change detection logic where an item was added.
                 */
                itemAdded: {},

                /**
                 * Is triggered after the execution of the extended change detection logic where items were reordered.
                 */
                itemsReordered: {}
            }
        },
        constructor: function (aggregationName, control, siblingAggregationNames) {
            ManagedObject.call(this);

            this._oAggregation = control.getMetadata().getAggregation(aggregationName);

            this._oControl = control;
            this._sAggregationName = aggregationName;
            this._aSiblingAggregationNames = siblingAggregationNames;

            var bEnabled = Config.last("/core/spaces/extendedChangeDetection/enabled");

            if (bEnabled) {
                // Adds the updateAggregation function to the control by using the generic name of the mutator function
                this._oControl[this._oAggregation._sUpdater] = this._updateAggregation.bind(this);
                this._oControl.bUseExtendedChangeDetection = true;
            }
        }
    });

    // static map, that stores "ids of aggregations" (control id + ":" + aggregation name), to prevent them from updating each indefinitely
    ExtendedChangeDetection.oUpdateFromSiblingCache = {};

    /**
     * Updates the aggregation's contents using the diff from UI5's extended change detection algorithm.
     *
     * @since 1.84
     * @private
     */
    ExtendedChangeDetection.prototype._updateAggregation = function () {
        var oBindingInfo = this._oControl.getBindingInfo(this._sAggregationName);
        var oBinding = oBindingInfo.binding;

        var bUpdateFromSibling = this._isUpdateFromSibling();

        // It's important to call getContexts after lastContextData was evaluated
        // because it overrides the aLastContextData cache
        var aLastContexts = oBinding.aLastContextData || [];
        var aLastItemKeys = aLastContexts.map(function (sContext) {
            // The context data might be only a key or a stringified object
            try {
                var oContext = JSON.parse(sContext);
                return oContext[oBindingInfo.key];
            } catch (err) {
                return sContext;
            }
        });

        var aContexts = oBinding.getContexts();
        var aCurrentItemKeys = aContexts.map(function (oContext) {
            return oContext.getProperty(oBindingInfo.key);
        });

        var aDiff = aContexts.diff;
        var i;
        var aInsertedItems = [];
        var aRemovedItems = [];
        var oRemovedControls = {};
        var bItemsDeleted = false;
        var bItemsAdded = false;
        if (aDiff) {
            for (i = 0; i < aDiff.length; i++) {
                var oDiff = aDiff[i];

                if (oDiff.type === "insert") {
                    aInsertedItems.push({
                        item: aCurrentItemKeys[oDiff.index],
                        index: oDiff.index
                    });
                }
                if (oDiff.type === "delete") {
                    aRemovedItems.push({
                        // The index needs to be offset by the number of items inserted before the item is removed.
                        // For this, we assume that insertions and deletions are in ascending order by index in the diff.
                        item: aLastItemKeys[oDiff.index - aInsertedItems.length],
                        index: oDiff.index - aInsertedItems.length
                    });
                    aLastItemKeys.splice(oDiff.index - aInsertedItems.length, 1);
                }
            }

            // Firstly, remove the changed items. No insertion must happen before this.
            for (i = 0; i < aRemovedItems.length; i++) {
                oRemovedControls[aRemovedItems[i].item] = this._oControl.removeAggregation(this._sAggregationName, aRemovedItems[i].index, true);
            }

            // Secondly, insert changed items at their new positions after the items have been removed.
            for (i = 0; i < aInsertedItems.length; i++) {
                var oInsertedItem = aInsertedItems[i];
                var oRemovedControl = oRemovedControls[oInsertedItem.item];

                // this second check is needed to force creation of visualizations when their displayFormat changed
                if (oRemovedControl && !(aDiff.length >= 2 && aDiff[0].index === aDiff[1].index)) {
                    this._oControl.insertAggregation(this._sAggregationName, oRemovedControl, oInsertedItem.index, true);
                    delete oRemovedControls[oInsertedItem.item];
                } else {
                    this._createAndInsertItem(aContexts[oInsertedItem.index], oBindingInfo, oInsertedItem.index);
                    bItemsAdded = true;
                }
            }

            bItemsDeleted = !!Object.keys(oRemovedControls).length;

            // All items that were not moved must be destroyed
            for (var sKey in oRemovedControls) {
                oRemovedControls[sKey].destroy();
                delete oRemovedControls[sKey];
            }
            // It might happen that updates from siblings result in an undefined diff and empty item key arrays
        } else if (!(bUpdateFromSibling && aCurrentItemKeys.length === 0 && aLastItemKeys.length === 0)) {
            // Clear aggregation and add all items
            this._createAndInsertItems(aContexts, oBindingInfo);
            bItemsAdded = true;
        } else {
            // Skip events and binding updates in case no update was performed
            return;
        }

        this._updateBindingContexts(aContexts);

        // Empty aggregations don't get rerendered and therefore don't reach the attached onAfterRendering process
        if (aContexts.length === 0) {
            this._oControl.invalidate();
        }

        if (bItemsDeleted) {
            this.fireItemDeleted();
        }
        if (bItemsAdded) {
            this.fireItemAdded();
        }

        // moved within the same aggregation
        if (!bItemsDeleted && !bItemsAdded && aDiff) {
            this.fireItemsReordered();
        }

        if (aDiff && aDiff.length && !bUpdateFromSibling) {
            this._refreshSiblingBindings();
        }
    };

    /**
     * Checks the cache whether this update was triggered by a sibling.
     * In case it was triggered by a sibling the cache value gets cleared
     *
     * @returns {boolean} Whether this update was triggered by a sibling
     *
     * @since 1.85
     * @private
     */
    ExtendedChangeDetection.prototype._isUpdateFromSibling = function () {
        var sIdentifier = this._oControl.getId() + ":" + this._sAggregationName;
        if (ExtendedChangeDetection.oUpdateFromSiblingCache[sIdentifier]) {
            delete ExtendedChangeDetection.oUpdateFromSiblingCache[sIdentifier];
            return true;
        }
        return false;
    };

    /**
     * Forcefully updates the sibling aggregation. This might be necessary due to undetected changes affecting its siblings.
     * The update is only enforced in case it was not triggered by another forcefully update
     *
     * @since 1.85
     * @private
     */
    ExtendedChangeDetection.prototype._refreshSiblingBindings = function () {
        if (this._aSiblingAggregationNames) {
            for (var index = 0; index < this._aSiblingAggregationNames.length; ++index) {
                var sSiblingName = this._aSiblingAggregationNames[index];
                var sSiblingIdentifier = this._oControl.getId() + ":" + sSiblingName;

                var oSiblingBinding = this._oControl.getBinding(sSiblingName);
                ExtendedChangeDetection.oUpdateFromSiblingCache[sSiblingIdentifier] = true;
                oSiblingBinding.refresh(true);
            }
        }
    };

    /**
     * Destroys and rebuilds the aggregation.
     *
     * @param {sap.ui.model.Context[]} contexts The list of current contexts.
     * @param {object} bindingInfo The binding info from the aggregation's binding.
     *
     * @private
     * @since 1.84
     */
    ExtendedChangeDetection.prototype._createAndInsertItems = function (contexts, bindingInfo) {
        this._oAggregation.destroy(this._oControl);

        for (var i = 0; i < contexts.length; i++) {
            this._createAndInsertItem(contexts[i], bindingInfo, i);
        }
    };

    /**
     * Creates a new item from the factory and inserts it at the given index.
     *
     * @param {sap.ui.model.Context} context The binding context of the new item.
     * @param {object} bindingInfo The binding info from the aggregation's binding.
     * @param {int} index The index at which to insert the item.
     *
     * @private
     * @since 1.84
     */
    ExtendedChangeDetection.prototype._createAndInsertItem = function (context, bindingInfo, index) {
        var oItem = bindingInfo.factory(null, context);

        this._oControl.insertAggregation(this._sAggregationName, oItem, index, true);
    };

    /**
     * Updates the binding contexts of all items in the aggregation.
     *
     * @param {sap.ui.model.Context[]} contexts The list of current binding contexts.
     *
     * @private
     * @since 1.84
     */
    ExtendedChangeDetection.prototype._updateBindingContexts = function (contexts) {
        var aItems = this._oAggregation.get(this._oControl);

        for (var i = 0; i < aItems.length; i++) {
            aItems[i].setBindingContext(contexts[i]);
        }
    };

    return ExtendedChangeDetection;
});
