// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Provides control sap.ushell.ui.tile.StaticTile.
 */

sap.ui.define([
    "sap/ushell/library",
    "sap/ushell/ui/tile/TileBase",
    "sap/ushell/ui/tile/StaticTileRenderer"
], function (
    ushellLibrary,
    TileBase,
    StaticTileRenderer
) {
    "use strict";

    /**
     * Constructor for a new ui/tile/StaticTile.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * An applauncher tile for simple, static apps, displaying title, subtitle, an icon and additional information
     * @extends sap.ushell.ui.tile.TileBase
     *
     * @constructor
     * @since   1.15.0
     * @public
     * @name sap.ushell.ui.tile.StaticTile
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var StaticTile = TileBase.extend("sap.ushell.ui.tile.StaticTile", /** @lends sap.ushell.ui.tile.StaticTile.prototype */ {
        metadata: {
            library: "sap.ushell"
        },
        renderer: StaticTileRenderer
    });

    return StaticTile;
});
