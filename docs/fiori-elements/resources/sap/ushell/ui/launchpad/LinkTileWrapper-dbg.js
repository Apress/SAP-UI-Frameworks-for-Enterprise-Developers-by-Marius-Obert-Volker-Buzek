// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Provides control "sap.ushell.ui.launchpad.LinkTileWrapper"
 * Note: Tile counterpart "sap.ushell.ui.launchpad.TileState"
 * @see sap.ushell.ui.launchpad.TileState
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/base/ManagedObject",
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/library", // css style dependency
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "./LinkTileWrapperRenderer"
], function (
    Log,
    ManagedObject,
    Control,
    Core,
    jQuery,
    ushellLibrary,
    AccessibilityCustomData,
    LinkTileWrapperRenderer
) {
    "use strict";

    /**
     * Constructor for a new ui/launchpad/LinkTileWrapper.
     * A link tile to be displayed in the tile container. This control acts as container for specialized tile implementations.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @alias sap.ushell.ui.launchpad.LinkTileWrapper
     * @class
     * @extends sap.ui.core.Control
     * @public
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var LinkTileWrapper = Control.extend("sap.ushell.ui.launchpad.LinkTileWrapper", /** @lends sap.ushell.ui.launchpad.LinkTileWrapper.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                uuid:
                    { type: "string", group: "Misc", defaultValue: null },
                tileCatalogId:
                    { type: "string", group: "Misc", defaultValue: null },
                tileCatalogIdStable:
                    { type: "string", group: "Misc", defaultValue: null },
                target: // hyperlink target
                    { type: "string", group: "Misc", defaultValue: null },
                visible:
                    { type: "boolean", group: "Misc", defaultValue: true },
                debugInfo: // technical information about the tile which is logged when the tile is clicked
                    { type: "string", group: "Misc", defaultValue: null },
                animationRendered:
                    { type: "boolean", group: "Misc", defaultValue: false },
                isLocked:
                    { type: "boolean", group: "Misc", defaultValue: false },
                tileActionModeActive:
                    { type: "boolean", group: "Misc", defaultValue: false },
                ieHtml5DnD:
                    { type: "boolean", group: "Misc", defaultValue: false }
            },
            aggregations: {
                tileViews: { type: "sap.ui.core.Control", multiple: true, singularName: "tileView" },
                footItems: { type: "sap.ui.core.Control", multiple: true, singularName: "footItem" }
            },
            events: {
                press: {},
                coverDivPress: {},
                afterRendering: {},
                showActions: {}
            }
        },

        renderer: LinkTileWrapperRenderer
    });

    LinkTileWrapper.prototype.destroy = function (bSuppressInvalidate) {
        this.destroyTileViews();
        Control.prototype.destroy.call(this, bSuppressInvalidate);
    };

    LinkTileWrapper.prototype.addTileView = function (oObject, bSuppressInvalidate) {
        // Workaround for a problem in addAggregation. If a child is added to its current parent again,
        // it is actually removed from the aggregation. Prevent this by removing it from its parent first.
        oObject.setParent(null);
        // Remove tabindex from links and group-header actions
        // so that the focus will not be automatically set on the first link or group action when returning to the launchpad
        oObject.addCustomData(new AccessibilityCustomData({
            key: "tabindex",
            value: "-1",
            writeToDom: true
        }));
        ManagedObject.prototype.addAggregation.call(this, "tileViews", oObject, bSuppressInvalidate);
    };

    LinkTileWrapper.prototype.destroyTileViews = function () {
        // Don't delete the tileViews when destroying the aggregation. They are stored in the model and must be handled manually.
        if (this.mAggregations.tileViews) {
            this.mAggregations.tileViews.length = 0;
        }
    };

    LinkTileWrapper.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
    };

    /**
     * Mapping of the native browser event to the UI5 semantic event.
     *
     * @param {object} oEvent The event object coming from the browser (not from UI5).
     * @private
     */
    LinkTileWrapper.prototype.onclick = LinkTileWrapper.prototype._onPress;
    LinkTileWrapper.prototype.onsapenter = LinkTileWrapper.prototype._launchTileViaKeyboard;
    LinkTileWrapper.prototype.onsapspace = LinkTileWrapper.prototype._launchTileViaKeyboard;

    /**
     * Handler of the keyboard "sapenter" and "sapspace" events.
     *
     * @param {object} [oEvent] The event object coming from the browser (not from UI5).
     * @private
     */
    LinkTileWrapper.prototype._launchTileViaKeyboard = function (oEvent) {
        Log.info("Tile pressed:", this.getDebugInfo(), "sap.ushell.ui.launchpad.LinkTileWrapper");
        Core.getEventBus().publish("launchpad", "dashboardTileLinkClick");
        if (this.getTileActionModeActive()) {
            return;
        } else if (this._getTileState() === "Failed") {
            this._onFailedStatePress();
        } else if (oEvent.target.tagName !== "BUTTON") {
            var oTileUIWrapper = this.getTileViews()[0],
                bPressHandled = false;
            if (oTileUIWrapper.firePress) {
                oTileUIWrapper.firePress();
            } else {
                while (oTileUIWrapper.getContent && !bPressHandled) {
                    // Restriction: since there's no way to know which of the views is the currently presented one, we assume it's the first one.
                    oTileUIWrapper = oTileUIWrapper.getContent()[0];
                    if (oTileUIWrapper.firePress) {
                        oTileUIWrapper.firePress();
                        bPressHandled = true;
                    }
                }
            }
        }
    };

    /**
     * Handler of the "press" event.
     *
     * @param {object} oEvent The event object.
     * @private
     */
    LinkTileWrapper.prototype._onPress = function (oEvent) {
        Log.info("Tile pressed:", this.getDebugInfo(), "sap.ushell.ui.launchpad.LinkTileWrapper");
        Core.getEventBus().publish("launchpad", "dashboardTileLinkClick");
        if (!this.getTileActionModeActive() && (this._getTileState() === "Failed")) {
            this._onFailedStatePress();
        }
    };

    /**
     * Handler of the "press" event when not in "Edit Mode" and the Tile is in "Failed" state.
     *
     * @private
     */
    LinkTileWrapper.prototype._onFailedStatePress = function () {
        if (!this.getTileActionModeActive() && (this._getTileState() === "Failed")) {
            if (!this.FailedTileDialog) {
                sap.ui.require(["sap/ushell/ui/launchpad/FailedTileDialog"], function (FailedTileDialog) {
                    this.FailedTileDialog = new FailedTileDialog();
                    this._onFailedStatePress();
                }.bind(this));
            } else {
                this.FailedTileDialog.openFor(this);
            }
            return;
        }
    };

    /**
     * Helper function to get the "state" property of the wrapped Tile.
     *
     * @return {string} The "state" property of the wrapped Tile.
     * @private
     */
    LinkTileWrapper.prototype._getTileState = function () {
        var aTileViews = this.getTileViews();
        var oTileView;
        for (var i = 0; (i < aTileViews.length) && !oTileView; ++i) {
            if (aTileViews[i].isA("sap.m.GenericTile")) { oTileView = aTileViews[i]; }
        }
        if (!oTileView) { throw new Error("Could not find the wrapped Tile"); }
        return oTileView.getState();
    };

    LinkTileWrapper.prototype.setVisible = function (bVisible) {
        this.setProperty("visible", bVisible, true); // suppress rerendering
        return this.toggleStyleClass("sapUshellHidden", !bVisible);
    };

    LinkTileWrapper.prototype.setAnimationRendered = function (bVal) {
        this.setProperty("animationRendered", bVal, true); // suppress rerendering
    };

    LinkTileWrapper.prototype._handleTileShadow = function (jqTile, args) {
        if (jqTile.length) {
            jqTile.unbind("mouseenter mouseleave");
            var updatedShadowColor,
                tileBorderWidth = jqTile.css("border").split("px")[0],
                oModel = this.getModel();
            // tile has border
            if (tileBorderWidth > 0) {
                updatedShadowColor = jqTile.css("border-color");
            } else {
                updatedShadowColor = this.getRgba();
            }
            jqTile.hover(
                function () {
                    if (!oModel.getProperty("/tileActionModeActive")) {
                        var sOriginalTileShadow = jQuery(jqTile).css("box-shadow"),
                            sTitleShadowDimension = sOriginalTileShadow ? sOriginalTileShadow.split(") ")[1] : null,
                            sUpdatedTileShadow;
                        if (sTitleShadowDimension) {
                            sUpdatedTileShadow = sTitleShadowDimension + " " + updatedShadowColor;
                            jQuery(this).css("box-shadow", sUpdatedTileShadow);
                        }
                    }
                },
                function () {
                    jQuery(this).css("box-shadow", "");
                }
            );
        }
    };

    LinkTileWrapper.prototype.setUuid = function (sUuid) {
        this.setProperty("uuid", sUuid, true); // suppress rerendering
        return this;
    };

    return LinkTileWrapper;
});
