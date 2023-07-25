// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.tile.ImageTile.
sap.ui.define([
    "sap/ushell/library",
    "./TileBase",
    "./ImageTileRenderer"
], function (
    library,
    TileBase,
    ImageTileRenderer
) {
    "use strict";

    /**
     * Constructor for a new ui/tile/ImageTile.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * Add your documentation for the newui/tile/ImageTile
     * @extends sap.ushell.ui.tile.TileBase
     *
     * @constructor
     * @public
     * @name sap.ushell.ui.tile.ImageTile
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ImageTile = TileBase.extend("sap.ushell.ui.tile.ImageTile", /** @lends sap.ushell.ui.tile.ImageTile.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * the URL of the image to display
                 */
                imageSource: {type: "string", group: "Appearance", defaultValue: null}
            }
        },
        renderer: ImageTileRenderer
    });

    /**
     * Applauncher displaying a tile with an added image
     *
     * @name sap.ushell.ui.tile.ImageTile
     *
     * @since   1.15.0
     * @private
     */

        return ImageTile;

    });
