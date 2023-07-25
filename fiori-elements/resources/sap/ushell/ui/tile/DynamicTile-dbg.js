// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.tile.DynamicTile.
sap.ui.define([
    "sap/ushell/library",
    "./TileBase",
    "./DynamicTileRenderer"
], function (
    ushellLibrary,
    TileBase,
    DynamicTileRenderer
) {
    "use strict";

    // shortcut for sap.ushell.ui.tile.State
    var State = ushellLibrary.ui.tile.State;

    // shortcut for sap.ushell.ui.tile.StateArrow
    var StateArrow = ushellLibrary.ui.tile.StateArrow;

    /**
     * Constructor for a new ui/tile/DynamicTile.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     *
     * @class
     * An applauncher for apps that need to display dynamically updated information
     * @extends sap.ushell.ui.tile.TileBase
     *
     * @constructor
     * @public
     * @name sap.ushell.ui.tile.DynamicTile
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var DynamicTile = TileBase.extend("sap.ushell.ui.tile.DynamicTile", /** @lends sap.ushell.ui.tile.DynamicTile.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {

                /**
                 * a number to be formatted with numberDigits decimal digits. Can be sap.ui.core.string as well.
                 */
                numberValue: { type: "string", group: "Data", defaultValue: "0.0" },

                /**
                 * The state of the number, indicating positive or negative conditions
                 */
                numberState: { type: "State", group: "Appearance", defaultValue: State.Neutral },

                /**
                 * The unit in which numberValue is measured
                 */
                numberUnit: { type: "string", group: "Data", defaultValue: null },

                /**
                 * the number of fractional decimal digits
                 */
                numberDigits: { type: "int", group: "Appearance", defaultValue: 0 },

                /**
                 * the state of the trend indicator
                 */
                stateArrow: { type: "StateArrow", group: "Appearance", defaultValue: StateArrow.None },

                /**
                 * defines a scaling factor (like "%", "M" or "k") right to a scaled number
                 */
                numberFactor: { type: "string", group: "Data", defaultValue: null }
            }
        },
        renderer: DynamicTileRenderer
    });

    /**
     * Applauncher displaying an application that provides a service that returns
     * dynamic data.
     *
     * @name sap.ushell.ui.tile.DynamicTile
     *
     * @since   1.15.0
     * @private
     */

    return DynamicTile;
});
