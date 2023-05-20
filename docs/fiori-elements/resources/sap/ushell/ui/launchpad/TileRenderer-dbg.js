// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ushell/Config"
], function (Log, Config) {
    "use strict";

    /**
     * @name Tile renderer.
     * @static
     * @private
     */
    var TileRenderer = {
        apiVersion: 2
    };

    /**
     * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
     *
     * @param {sap.ui.core.RenderManager} rm RenderManager that can be used for writing to the render output buffer
     * @param {sap.ui.core.Control} tile Tile to be rendered
     */
    TileRenderer.render = function (rm, tile) {
        var oTileView = null;

        try {
            oTileView = tile.getTileViews()[0];
        } catch (oException) {
            Log.warning("Failed to load tile view: ", oException.message);
            oTileView = tile.getFailedtoLoadViewText();
        }
        var oTileContainer = tile.getParent();

        if (!oTileContainer) {
            return;
        }

        rm.openStart("li", tile);

        // If xRay is enabled
        if (Config.last("/core/shell/model/enableHelp")) {
            // Currently only the Tile (and the Tile's footer) has a data attribute in the xRay integration
            // (as using this value as a class value instead as done in all of the static elements causes
            // parsing errors in the xRay hotspot definition flow)
            rm.attr("data-help-id", tile.getTileCatalogId()); // xRay support
            if (tile.getTileCatalogIdStable()) {
                rm.attr("data-help-id2", tile.getTileCatalogIdStable());
            }
        }
        rm.class("sapUshellTile");

        // In case of ActionMode we need actual height on tile
        // By this if we check if we are in the edit mode or not
        if (tile.getTileActionModeActive()) {
            rm.class("sapUshellTileWrapper");
        }

        // GenericTile BG should be transparent, since sapUshellTile BG style cannot be changed,
        // We add a special styleClass to GenericTile in order to set its BG to transparent
        if (oTileView && oTileView.getContent) {
            var aContent = oTileView.getContent();
            aContent.forEach(function (oItem) {
                if (oItem.isA("sap.m.GenericTile")) {
                    rm.class("sapUshellFeedTileBG");
                }
            });
        }

        if (tile.getLong()) {
            rm.class("sapUshellLong");
        }
        if (!tile.getVisible()) {
            rm.class("sapUshellHidden");
        }
        if (tile.getIsLocked()) {
            rm.class("sapUshellLockedTile");
        }

        if (Config.last("/core/home/sizeBehavior") === "Small") {
            rm.class("sapUshellSmall");
        }

        var ariaDescribedBy = oTileContainer.getId() + "-titleText";
        rm.attr("aria-describedby", ariaDescribedBy);

        rm.openEnd(); // li - tag

        if (tile.getTileActionModeActive()) {
            this.renderTileActionMode(rm, tile);

            this.renderTileView(rm, tile, oTileView);
        } else {
            rm.openStart("div");
            rm.class("sapUshellTileWrapper");
            rm.openEnd(); // div - tag

            this.renderTileView(rm, tile, oTileView);

            // if Tile has the ActionsIcon (overflow icon at its top right corner) - display it
            if (tile.getShowActionsIcon()) {
                rm.renderControl(tile.actionIcon);
            }

            rm.close("div");
            this.renderTileActionsContainer(rm, oTileView, tile.getPinButton());
        }

        rm.close("li");
    };

    TileRenderer.renderTileActionsContainer = function (rm, oTileView, oPinButton) {
        oPinButton = oPinButton.length ? oPinButton[0] : undefined;
        // add overlay and pinButton
        if (oPinButton) {
            oPinButton.addStyleClass("sapUshellActionButton");

            rm.openStart("div");
            rm.class("sapUshellTilePinButtonOverlay");

            // For accessability needs: the overlay div will be read as readonly field
            if (oTileView.getHeader) {
                rm.attr("role", "toolbar");
                rm.attr("aria-label", oTileView.getHeader());
            }
            rm.openEnd(); // div - tag
            rm.renderControl(oPinButton);
            rm.close("div");
        }
    };

    TileRenderer.renderTileView = function (rm, tile, oTileView) {
        rm.openStart("div");
        rm.class("sapUshellTileInner");
        if (tile.getTileActionModeActive()) {
            rm.class("sapUshellTileActionBG");
        }
        rm.openEnd(); // div - tag
        rm.renderControl(oTileView);
        rm.close("div");
    };

    TileRenderer.renderTileActionMode = function (rm, tile) {
        // Add the ActionMode cover DIV to the tile
        rm.openStart("div");
        rm.class("sapUshellTileActionLayerDiv");
        rm.openEnd(); // div - tag

        // we display the Delete action icon - only if tile is not part of a locked group
        if (!tile.getIsLocked()) {
            // render the trash bin action
            // outer div - the click area for the delete action
            rm.openStart("div");
            rm.class("sapUshellTileDeleteClickArea");
            rm.openEnd(); // div - tag
            // 2nd div - to draw the circle around the icon
            rm.openStart("div");
            rm.class("sapUshellTileDeleteIconOuterClass");
            rm.openEnd(); // div - tag
            rm.renderControl(tile._initDeleteAction()); // initialize & render the tile's delete action icon
            rm.close("div"); // 2nd div - to draw the circle around the icon
            rm.close("div"); // outer div - the click area for the delete action
        }

        // add a div to render the tile's bottom overflow icon
        rm.openStart("div");
        rm.class("sapUshellTileActionDivCenter");
        rm.openEnd(); // div - tag
        rm.close("div");

        rm.openStart("div");
        rm.class("sapUshellTileActionIconDivBottom");
        rm.openEnd(); // div - tag
        rm.openStart("div");
        rm.class("sapUshellTileActionIconDivBottomInnerDiv");
        rm.openEnd(); // div - tag
        rm.renderControl(tile.getActionSheetIcon());
        rm.close("div");
        rm.close("div");

        rm.close("div");
    };

    return TileRenderer;
}, /* bExport= */ true);
