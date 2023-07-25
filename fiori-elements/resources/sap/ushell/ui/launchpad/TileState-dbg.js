// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Provides control "sap.ushell.ui.launchpad.TileState"
 * Note: Link counterpart "sap.ushell.ui.launchpad.LinkTileWrapper"
 * @see sap.ushell.ui.launchpad.LinkTileWrapper
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/Icon",
    "sap/ushell/resources",
    "sap/ui/core/HTML",
    "./TileStateRenderer",
    "sap/ushell/library" // css style dependency
], function (
    Control,
    Icon,
    resources,
    HTML,
    TileStateRenderer
    // library
) {
    "use strict";

    /**
     * Constructor for a new ui/launchpad/TileState.
     * The tile state control that displays loading indicator,
     * while tile view is loading and failed status in case tile view is not available.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @alias sap.ushell.ui.launchpad.TileState
     * @class
     * @extends sap.ui.core.Control
     * @public
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var TileState = Control.extend("sap.ushell.ui.launchpad.TileState", /** @lends sap.ushell.ui.launchpad.TileState.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                // load state
                state: { type: "string", group: "Misc", defaultValue: "Loaded" }
            },
            events: {
                press: {}
            }
        },
        renderer: TileStateRenderer
    });

    TileState.prototype.init = function () {
        this._rb = resources.i18n;

        this._sFailedToLoad = this._rb.getText("cannotLoadTile");

        this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
            src: "sap-icon://notification",
            size: "1.37rem"
        }).addStyleClass("sapSuiteGTFtrFldIcnMrk");

        this.attachPress(this._onPress);
    };

    /**
     * Mapping of the native browser event to the UI5 semantic event.
     *
     * @param {object} [oEvent] The event object coming from the browser (not from UI5).
     * @private
     */
    TileState.prototype.onclick = function (/*oEvent*/) {
        this.firePress();
    };

    /**
     * Handler of the "press" event.
     * Checks whether the tile is in the "Failed" state and, if so, opens the FailedTileDialog. Does nothing otherwise.
     *
     * @param {sap.ui.base.Event} [oEvent] The event object.
     * @private
     */
    TileState.prototype._onPress = function (oEvent) {
        if (this.getState() !== "Failed") { return; }
        if (!this.FailedTileDialog) {
            sap.ui.require(["sap/ushell/ui/launchpad/FailedTileDialog"], function (FailedTileDialog) {
                this.FailedTileDialog = new FailedTileDialog();
                this._onPress(oEvent);
            }.bind(this));
        } else {
            this.FailedTileDialog.openFor(this);
        }
    };

    TileState.prototype._getBusyContainer = function () {
        if (!this._oBusyContainer) {
            this._oBusyContainer = new HTML({
                content: "<div class='sapUshellTileStateLoading'><div>"
            });
            this._oBusyContainer.setBusyIndicatorDelay(0);
            this._oBusyContainer.setBusy(true);
        }

        return this._oBusyContainer;
    };

    TileState.prototype.exit = function () {
        this._oWarningIcon.destroy();
        if (this._oBusyContainer) {
            this._oBusyContainer.destroy();
        }
    };

    TileState.prototype.setState = function (oState, isSuppressed) {
        this.setProperty("state", oState, isSuppressed);
        return this;
    };

    return TileState;
});
