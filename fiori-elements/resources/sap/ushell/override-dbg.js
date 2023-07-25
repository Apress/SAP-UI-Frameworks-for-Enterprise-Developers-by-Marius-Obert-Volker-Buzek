// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous functions which may be used to override/replace existing SAPUI5 methods.
 */
sap.ui.define([
    "sap/m/GroupHeaderListItem",
    "sap/ui/base/ManagedObject",
    "sap/base/util/uid",
    "sap/base/util/each"
], function (GroupHeaderListItem, ManagedObject, fnGetUid, each) {
    "use strict";

    // ensure that sap.ushell exists
    var override = {};

    /**
     * Override sap.ui.base.ManagedObject.updateAggregation
     *
     * This is a generic drop-in replacement. It avoids the destroy items call.
     * Instead, the bindings of existing items are updated.
     *
     * Note: Listbindings with grouping and Treebindings are not supported. In these cases, the default method is still invoked.
     * @param {string} sName -
     */
    override.updateAggregation = function (sName) {
        if (this.isTreeBinding(sName)) {
            // no idea how to handle -> delegate to parent
            ManagedObject.prototype.updateAggregation.apply(this, arguments);
        } else {
            var oBindingInfo = this.mBindingInfos[sName],
                oBinding = oBindingInfo.binding,
                aBindingContexts = oBinding.getContexts(),
                fnFactory = oBindingInfo.factory,
                oAggregationInfo = this.getMetadata().getJSONKeys()[sName], // TO-DO fix handling of hidden aggregations

                sGroupFunction = oAggregationInfo._sMutator + "Group",
                bGrouped = oBinding.isGrouped() && this[sGroupFunction],
                aItems = [],
                addNewItem = function (oContext) {
                    var sId = this.getId() + "-" + fnGetUid(),
                        oClone = fnFactory(sId, oContext);

                    // Due to a change in the sap.ui.integration.widgets.Card implementation we need to specify a name for
                    // all card models. Ideally we should do this for all tiles but more refactoring is needed there.
                    // Since the whole homepage stops working without the change to the card model name this intermittent
                    // solution was chosen. BCP: 2180310441
                    if (oClone.isA("sap.ui.integration.widgets.Card")) {
                        oClone.setBindingContext(oContext, "ushellCardModel");
                    } else {
                        oClone.setBindingContext(oContext, oBindingInfo.model);
                    }

                    this[oAggregationInfo._sMutator](oClone);
                }.bind(this);

            if (bGrouped) {
                // do not handle grouped aggregations -> delegate to parent
                ManagedObject.prototype.updateAggregation.apply(this, arguments);
            } else {
                aItems = this[oAggregationInfo._sGetter](); // get all items
                override._adaptCurrentGroup(aBindingContexts, aItems);
                override._updateCurrentGroup(aBindingContexts, aItems, oBindingInfo.model, addNewItem);

                // Update the array length.
                aItems.length = aBindingContexts.length;
            }
        }
    };

    override._adaptCurrentGroup = function (aBindingContexts, aItems) {
        // When the item from the new group or the current item is a card, updating the item by only changing the binding context of the current item does not work.
        // To solve this issue, the current item and its following items are destroyed, and new items are created and added later.
        var i,
            bIsCurrentItemACard,
            bIsNewItemACard;

        for (i = 0; i < aBindingContexts.length; i++) {
            bIsCurrentItemACard = !!(aItems[i] && aItems[i].isA("sap.ui.integration.widgets.Card"));
            bIsNewItemACard = !!aBindingContexts[i].getProperty(aBindingContexts[i].sPath + "/isCard");
            if (bIsCurrentItemACard || bIsNewItemACard) {
                var j = i;
                for (; j < aItems.length; j++) {
                    aItems[j].destroy();
                }
                break;
            }
        }
    };

    override._updateCurrentGroup = function (aBindingContexts, aItems, oBindingInfoModel, fnAddNewItem) {
        var i;
        // Bind as many context as possible to existing elements. Create new ones if necessary.
        for (i = 0; i < aBindingContexts.length; i++) {
            // setBindContexts() does not work for cards

            if (i < aItems.length && !aItems[i].bIsDestroyed) {
                aItems[i].setBindingContext(aBindingContexts[i], oBindingInfoModel);
            } else {
                fnAddNewItem(aBindingContexts[i]);
            }
        }

        // Delete unused elements.
        for (; i < aItems.length; ++i) {
            aItems[i].destroy();
        }
    };

    /**
     * Override sap.ui.base.ManagedObject.updateAggregation
     *
     * This is a generic drop-in replacement. It avoids the destroy items call.
     * Instead, the bindings of existing items are updated. Enables grouping!
     *
     * Note: Treebindings are not supported. In these cases, the default method is still invoked.
     *
     * @param {string} sName -
     */
    override.updateAggregationGrouped = function (sName) {
        var oBindingInfo = this.mBindingInfos[sName],
            oBinding = oBindingInfo.binding,
            fnFactory = oBindingInfo.factory,
            oClone,
            oNewGroup = null,
            bGrouped = null,
            sGroup = null,
            that = this,
            aItems = that.getItems(),
            iLastIndex = 0,
            iListIndex = 0,
            i,
            sId,
            aToBeDestroyed = [];

        bGrouped = oBinding.isGrouped() && this.addItemGroup;
        each(oBinding.getContexts(), function (iIndex, oContext) {
            if (bGrouped && oBinding.aSorters.length > 0) {
                oNewGroup = oBinding.aSorters[0].fnGroup(oContext);
                if (typeof oNewGroup === "string") {
                    oNewGroup = {
                        key: oNewGroup
                    };
                }
                if (oNewGroup.key !== sGroup) {
                    var oGroupHeader,
                        oHeader;
                    // If factory is defined use it
                    if (oBindingInfo.groupHeaderFactory) {
                        oGroupHeader = oBindingInfo.groupHeaderFactory(oNewGroup);
                    }
                    oHeader = oGroupHeader || new GroupHeaderListItem({
                        title: oNewGroup.text || oNewGroup.key
                    }).addStyleClass("sapMListHdr");

                    that.insertAggregation("items", oHeader, iListIndex, true);
                    iListIndex = iListIndex + 1;
                    sGroup = oNewGroup.key;
                }
            }
            aItems = that.getItems();
            for (i = iListIndex; i < aItems.length; i = i + 1) {
                if (aItems[i].constructor === GroupHeaderListItem) {
                    aToBeDestroyed.push(that.removeItem(aItems[i]));
                    aItems = that.getItems();
                }
            }
            if (iListIndex < aItems.length) {
                aItems[iListIndex].setBindingContext(oContext, oBindingInfo.model);
                if (aItems[iListIndex].aDelegates) {
                    each(aItems[iListIndex].aDelegates, function (i, v) {
                        v.vThis = oContext;
                    });
                }
            } else {
                sId = that.getId() + "-" + iListIndex;
                oClone = fnFactory(sId, oContext);
                oClone.setBindingContext(oContext, oBindingInfo.model);
                that.addItem(oClone);
            }
            iListIndex = iListIndex + 1;
            iLastIndex = iListIndex;
        });

        for (i = aItems.length - 1; i >= iLastIndex; i = i - 1) {
            aToBeDestroyed.push(that.removeItem(aItems[i]));
        }

        setTimeout(function () {
            each(aToBeDestroyed, function (i, v) {
                v.destroy();
            });
        }, 1);
    };

    /**
     * A convenience factory method to create "sap.ushell.override.updateAggregation()" already bound to a name.
     *
     * @param {string} sName the name of the aggregation
     * @return {function} - override.updateAggregation.bind(this)(sName)
     */
    override.updateAggregatesFactory = function (sName) {
        return function () {
            override.updateAggregation.bind(this)(sName);
        };
    };

    return override;
}, /* bExport= */ false);
