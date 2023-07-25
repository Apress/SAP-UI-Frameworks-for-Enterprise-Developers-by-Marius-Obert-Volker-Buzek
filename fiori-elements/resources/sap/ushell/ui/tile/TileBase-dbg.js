/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */

// Provides control sap.ushell.ui.tile.TileBase.
sap.ui.define([
    "sap/ushell/library",
    "sap/ui/core/Control",
    "sap/ushell/library",
    "./TileBaseRenderer"
], function (
    ushellLibrary,
    Control,
    library,
    TileBaseRenderer
) {
    "use strict";

    // shortcut for sap.ushell.ui.tile.State
    var TileState = ushellLibrary.ui.tile.State;

    /**
     * Constructor for a new ui/tile/TileBase.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * Base class for tiles that already provides several visual elements like title, subtitle, icon and additional information
     * @extends sap.ui.core.Control
     *
     * @constructor
     * @public
     * @name sap.ushell.ui.tile.TileBase
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var TileBase = Control.extend("sap.ushell.ui.tile.TileBase", /** @lends sap.ushell.ui.tile.TileBase.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * The title of this tile
                 */
                title: {type: "string", group: "Data", defaultValue: null},

                /**
                 * A subtitle of this tile (optional)
                 */
                subtitle: {type: "string", group: "Data", defaultValue: null},

                /**
                 * An icon for the tile
                 */
                icon: {type: "string", group: "Data", defaultValue: null},

                /**
                 * Additional information displayed at the bottom of the tile
                 */
                info: {type: "string", group: "Data", defaultValue: null},

                /**
                 * The state of the info field
                 */
                infoState: {type: "sap.ushell.ui.tile.State", defaultValue: TileState.Neutral},

                /**
                 * If given, the Control is wrapped into a link pointing to this URL. If empty or not set, the link is not rendered
                 */
                targetURL: {type: "string", group: "Behavior", defaultValue: null},

                /**
                 * contains an array of terms that should be highlighted; per default, the array is empty
                 */
                highlightTerms: {type: "any", group: "Appearance", defaultValue: []}
            },
            aggregations: {

                /**
                 */
                content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
            },
            events: {

                /**
                 * called when the tile is clicked / pressed
                 */
                press: {}
            }
        },
        renderer: TileBaseRenderer
    });

    /**
     * Base class for applaunchers that provides basic properties like title,
     * subtitle, icon and additional information.
     *
     * @name sap.ushell.ui.tile.TileBase
     *
     * @since   1.15.0
     * @private
     */

        TileBase.prototype.ontap = function (e) {
            this.firePress({});
        };

        TileBase.prototype.onsapenter = function (e) {
            this.firePress({});
        };

        TileBase.prototype.onsapspace = function (e) {
            this.firePress({});
        };


        return TileBase;

    });
