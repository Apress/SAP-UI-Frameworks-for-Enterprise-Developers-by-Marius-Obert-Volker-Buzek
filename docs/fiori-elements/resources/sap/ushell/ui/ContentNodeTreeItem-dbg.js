// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/StandardTreeItem"
], function (StandardTreeItem) {
    "use strict";

    /**
     * Constructor for a new Content Node Tree Item.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class The Content Node Tree Item is a custom implementation of sap.m.StandardTreeItem to make items unselectable.
     * @extends sap.m.StandardTreeItem
     *
     * @author SAP SE
     * @since 1.81
     *
     * @private
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ContentNodeTreeItem = StandardTreeItem.extend("sap.ushell.ui.bookmark.ContentNodeTreeItem", {
        metadata: {
            library: "sap.ushell",

            properties: {
                selectable: {
                    type: "boolean",
                    defaultValue: true,
                    group: "Behavior"
                }
            }
        },
        renderer: StandardTreeItem.getMetadata().getRenderer()
    });

    ContentNodeTreeItem.prototype.setSelected = function (selected) {
        // In Internet Explorer, the order in which the `selected` and `selectable` properties
        // are updated on binding change is reversed.
        // As the items are reused in sap.m.Tree, the old `selectable` property value prevents all
        // updates to the `selected` property. In the wrong order (like in IE), this leads to items
        // not being selected even though their bound model has the correct values.
        // This is circumvented by calling setSelected again in setSelectable with the previously set value.
        this._bSelected = selected;

        return StandardTreeItem.prototype.setSelected.apply(this, arguments);
    };

    ContentNodeTreeItem.prototype.setSelectable = function (selectable) {
        this.setProperty("selectable", selectable, false);

        if (selectable) {
            StandardTreeItem.prototype.setSelected.call(this, this._bSelected);
        }

        return this;
    };

    ContentNodeTreeItem.prototype.isSelectable = function () {
        return this.getSelectable();
    };

    ContentNodeTreeItem.prototype.getModeControl = function () {
        if (!this.getSelectable()) {
            return null;
        }

        return StandardTreeItem.prototype.getModeControl.apply(this, arguments);
    };

    return ContentNodeTreeItem;
});
