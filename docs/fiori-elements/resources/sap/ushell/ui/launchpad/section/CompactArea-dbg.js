//Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Provides control sap.ushell.ui.launchpad.section.CompactArea
 *
 * @version 1.113.0
 */

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/events/KeyCodes",
    "sap/ushell/library", // css style dependency
    "./CompactAreaRenderer"
], function (
    Control,
    KeyCodes,
    ushellLibrary,
    CompactAreaRenderer
) {
    "use strict";

    /**
     * Constructor for a new sap/ushell/ui/launchpad/section/CompactArea.
     *
     * @param {string} [sId] The ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] The initial settings for the new control
     * @class A container that arranges visualizations controls in the compact area of a section (links).
     * @extends sap.ui.core.Control
     * @constructor
     * @private
     * @name sap.ushell.ui.launchpad.section.CompactArea
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     * @since 1.84
     */
    var CompactArea = Control.extend("sap.ushell.ui.launchpad.section.CompactArea", /** @lends sap.ushell.ui.launchpad.section.CompactArea.prototype*/ {
        metadata: {
            library: "sap.ushell",
            properties: {
                showEmptyLinksArea:
                    { type: "boolean", group: "Misc", defaultValue: false },
                showEmptyLinksAreaPlaceHolder:
                    { type: "boolean", group: "Misc", defaultValue: false },
                enableLinkReordering:
                    { type: "boolean", group: "Behavior", defaultValue: false }
            },
            dnd: { draggable: false, droppable: true },
            aggregations: {
                items:
                    { type: "sap.ui.core.Control", singularName: "item", multiple: true, dnd: true }
            },
            events: {
                /**
                 * Fires when a keyboard navigation with arrow keys has reached border.
                 */
                borderReached: {
                    parameters: {
                        event: { type: "jQuery.Event" }
                    }
                },
                /**
                 * Fires when a control is dropped on the compact area.
                 */
                itemDrop: {
                    parameters: {
                        /**
                         * The control that was dragged.
                         */
                        draggedControl: { type: "sap.ui.core.Control" },

                        /**
                         * The control where the dragged control was dropped.
                         */
                        droppedControl: { type: "sap.ui.core.Control" },

                        /**
                         * A string defining from what direction the dragging happened.
                         */
                        dropPosition: { type: "string" }
                    }
                }
            }
        },
        renderer: CompactAreaRenderer
    });

    CompactArea.prototype.onBorderReached = this.fireBorderReached;

    /**
     * Handles the <code>onsapnext</code> event.
     *
     * @param {jQuery.Event} oEvent the browser event
     * @private
     */
    CompactArea.prototype.onsapnext = function (oEvent) {
        oEvent.stopImmediatePropagation(true);
        oEvent.preventDefault();
        if (oEvent.keyCode === KeyCodes.ARROW_RIGHT) {
            var index = this.getFocusedItemIndex();
            if (index >= 0 && index < this.getItems().length - 1) {
                this.focusItem(index + 1);
                return;
            }
        }
        // in all other cases (last item or ARROW_DOWN)
        this.fireBorderReached({ event: oEvent });
    };

    /**
     * Handles the <code>onsapprevious</code> event.
     *
     * @param {jQuery.Event} oEvent the browser event
     * @private
     */
    CompactArea.prototype.onsapprevious = function (oEvent) {
        oEvent.stopImmediatePropagation(true);
        oEvent.preventDefault();
        if (oEvent.keyCode === KeyCodes.ARROW_LEFT) {
            var index = this.getFocusedItemIndex();
            if (index > 0) {
                this.focusItem(index - 1);
                return;
            }
        }
        // in all other cases (first item or ARROW_UP)
        this.fireBorderReached({ event: oEvent });
    };

    /**
     * Handles the <code>onsapnextmodifiers</code> event. Keyboard drag and drop.
     *
     * @param {jQuery.Event} oEvent the browser event
     * @private
     */
    CompactArea.prototype.onsapnextmodifiers = function (oEvent) {
        if (!this.getEnableLinkReordering()) {
            return;
        }

        var index = this.getFocusedItemIndex();
        var aItems = this.getItems();

        oEvent.stopImmediatePropagation(true);
        oEvent.preventDefault();

        if (oEvent.keyCode === KeyCodes.ARROW_RIGHT && index > -1 && index < aItems.length - 1) { // drop to the right
            this.fireItemDrop({
                draggedControl: aItems[index],
                droppedControl: aItems[index + 1],
                dropPosition: "After",
                browserEvent: oEvent
            });
        }
        if (oEvent.keyCode === KeyCodes.ARROW_DOWN && index > -1) { // drop to the next section
            this.fireItemDrop({
                draggedControl: aItems[index],
                droppedControl: null, // let the Page find the dropped control
                dropPosition: "After",
                browserEvent: oEvent
            });
        }
    };

    /**
     * Handles the <code>onsappreviousmodifiers</code> event. Keyboard drag and drop.
     *
     * @param {jQuery.Event} oEvent the browser event
     * @private
     */
    CompactArea.prototype.onsappreviousmodifiers = function (oEvent) {
        if (!this.getEnableLinkReordering()) {
            return;
        }

        var index = this.getFocusedItemIndex();
        var aItems = this.getItems();

        oEvent.stopImmediatePropagation(true);
        oEvent.preventDefault();

        if (oEvent.keyCode === KeyCodes.ARROW_LEFT && index > 0) { // drop to the left
            this.fireItemDrop({
                draggedControl: aItems[index],
                droppedControl: aItems[index - 1],
                dropPosition: "Before",
                browserEvent: oEvent
            });
        }
        if (oEvent.keyCode === KeyCodes.ARROW_UP && index > -1) { // drop to the next section
            this.fireItemDrop({
                draggedControl: aItems[index],
                droppedControl: null, // let the Page find the dropped control
                dropPosition: "Before",
                browserEvent: oEvent
            });
        }
    };

    /**
     * Focuses a visualization with a given index.
     *
     * @param {integer} itemIndex the item index. -1 for the last item.
     * @private
     */
    CompactArea.prototype.focusItem = function (itemIndex) {
        itemIndex = itemIndex || 0;
        var aItems = this.getItems();
        if (itemIndex === -1 || itemIndex >= aItems.length) { // focus the last item
            itemIndex = aItems.length - 1;
        }
        if (itemIndex >= 0) {
            var oFocusDomRef = aItems[itemIndex].getFocusDomRef() || aItems[itemIndex].getDomRef(); // getFocusDomRef may return null;
            (oFocusDomRef.querySelector("a") || oFocusDomRef).focus(); // In runtime, find the first embedded link and focus it.
        } else {
            this.focus();
        }
    };

    /**
     * Handles the onmousedown event
     * Sets the focus to the first item no item is clicked. Otherwise, the items sets the focus itself.
     *
     * @param {jQuery.Event} oEvent the browser event
     * @private
     */
    CompactArea.prototype.onmousedown = function (oEvent) {
        var itemIndex = this.getDOMItemIndex(oEvent.srcControl.getDomRef());
        var iFocusedItemIndex = this.getFocusedItemIndex();
        if (iFocusedItemIndex < 0) {
            iFocusedItemIndex = 0;
        }
        if (itemIndex < 0) { // clicked outside of any item, set focus either on the first item or on a focused one
            window.setTimeout(function () {
                this.focusItem(iFocusedItemIndex);
            }.bind(this), 0);
        }
    };

    /**
     * Returns the index of the item containing the given DOM element.
     *
     * @param {object} oElement active DOM element
     * @returns {integer} index of item or -1.
     * @private
     */
    CompactArea.prototype.getDOMItemIndex = function (oElement) {
        var itemIndex = -1;
        this.getItems().forEach(function (oItem, index) {
            var oDomRef = oItem.getDomRef();
            if (oDomRef && oDomRef.contains(oElement)) {
                itemIndex = index;
            }
        });
        return itemIndex;
    };

    /**
     * Handles the onfocusin event.
     *
     * @param {jQuery.Event} oEvent the browser event
     * @private
     */
    CompactArea.prototype.onfocusin = function (oEvent) {
        if (document.activeElement === this.getDomRef()) {
            this.focusItem(0);
        }
    };

    /**
     * Returns the index of the currently focused item.
     *
     * @returns {integer} index of the currently focused item or -1.
     * @private
     */
    CompactArea.prototype.getFocusedItemIndex = function () {
        return this.getDOMItemIndex(document.activeElement);
    };

    return CompactArea;
});
