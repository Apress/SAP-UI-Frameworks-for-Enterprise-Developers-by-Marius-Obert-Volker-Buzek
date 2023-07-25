// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.AnchorItem.
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ushell/ui/launchpad/AnchorItemRenderer",
    "sap/ushell/library" // css style dependency
], function (
    Control,
    AnchorItemRenderer
) {
    "use strict";

    /**
     * Constructor for a new ui/launchpad/AnchorItem.
     *
     * @param {string} [sId] id for the new anchorItem, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new anchorItem
     *
     * @class
     * Add your documentation for the new ui/launchpad/AnchorItem
     * @extends sap.ui.core.Control
     *
     * @constructor
     * @private
     * @name sap.ushell.ui.launchpad.AnchorItem
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var AnchorItem = Control.extend("sap.ushell.ui.launchpad.AnchorItem", /** @lends sap.ushell.ui.launchpad.AnchorItem.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * Specifies the title on the anchorItem.
                 */
                title: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies if the anchorItem is selected.
                 */
                selected: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies the group id of a group, to relate the anchorItem to a that group.
                 */
                groupId: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies if the group related to the anchorItem is the default group.
                 */
                defaultGroup: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies the help id which should be written.
                 * This would write a speific css class and data-help-id into the dom of the anchorItem.
                 */
                helpId: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Specifies the index of the anchorItem.
                 */
                index: { type: "int", group: "Misc", defaultValue: null },

                /**
                 * Specifies if the group related to the anchorItem is visible.
                 */
                isGroupVisible: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * Specifies if the group related to the anchorItem is rendered.
                 */
                isGroupRendered: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies if the group related to the anchorItem is disabled.
                 */
                isGroupDisabled: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies if the group related to the anchorItem is locked.
                 */
                locked: { type: "boolean", group: "Misc", defaultValue: false },

                /**
                 * Specifies the posinset of the anchorItem.
                 */
                posinset: { type: "int", group: "Misc", defaultValue: 0 },

                /**
                 * Specifies the setsize of the anchorItem.
                 */
                setsize: { type: "int", group: "Misc", defaultValue: 0 }
            },
            events: {

                /**
                 * Fires when the anchorItem is pressed.
                 */
                press: {},

                /**
                 * Fires when the anchorItem was rendered.
                 */
                afterRendering: {},

                /**
                 * Fires when the anchorItems visibility was changed.
                 */
                visibilityChanged: {}
            }
        },
        renderer: AnchorItemRenderer
    });

    /**
     * @name sap.ushell.ui.launchpad.AnchorItem
     *
     * @private
     */
    AnchorItem.prototype.init = function () {
        this.addDelegate({
            onAfterRendering: this.fireAfterRendering.bind(this),
            onclick: this.firePress.bind(this),
            onsapenter: this.firePress.bind(this),
            onsapspace: function (oEvent) {
                oEvent.preventDefault(); // space scrolls the window
                this.firePress();
            }.bind(this)
        });
    };

    AnchorItem.prototype.setVisible = function (bValue, bSuppressInvalidate) {
        this.setProperty("visible", bValue, bSuppressInvalidate);

        // If this Item is in the Anchorbar, make sure to update all other siblings if the visiblity changes.
        // This is needed to update the correct aria-posinset and aria-setsize attributes on each element.
        this.fireVisibilityChanged();

        return this;
    };

    return AnchorItem;
});
