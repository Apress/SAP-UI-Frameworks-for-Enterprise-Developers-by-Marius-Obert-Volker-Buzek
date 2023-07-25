/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './library', 'sap/ui/core/Control', 'sap/m/Text', 'sap/ui/core/Icon', "sap/ui/events/KeyCodes", "./InfoTileRenderer" ], function(library, Control, Text, Icon, KeyCodes, InfoTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new InfoTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The tile control that displays the title, description, footer, and customizable main area.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.GenericTile.
	 * @alias sap.suite.ui.commons.InfoTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InfoTile = Control.extend("sap.suite.ui.commons.InfoTile", /** @lends sap.suite.ui.commons.InfoTile.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Shows the description of the selected tile.
				 */
				description: { type: "string", group: "Appearance", defaultValue: null },

				/**
				 * The title of the tile.
				 */
				title: { type: "string", group: "Appearance", defaultValue: null },

				/**
				 * The footer text of the tile.
				 */
				footer: { type: "string", group: "Appearance", defaultValue: null },

				/**
				 * Updates the size of the tile. If not set then the default size is applied based on the device tile.
				 */
				size: { type: "sap.suite.ui.commons.InfoTileSize", group: "Misc", defaultValue: "Auto" },

				/**
				 * Indicates the load status.
				 */
				state: {
					type: "sap.suite.ui.commons.LoadState",
					group: "Misc",
					defaultValue: "Loading"
				}
			},
			aggregations: {

				/**
				 * The switchable view that depends on the tile type.
				 */
				content: { type: "sap.ui.core.Control", multiple: false },

				/**
				 * The hidden aggregation for the title.
				 */
				titleText: { type: "sap.m.Text", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * The event is fired when the user chooses the tile.
				 */
				press: {}
			}
		}
	});

	InfoTile.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		this._oTitle = new Text(this.getId() + "-title", { maxLines: 2 });
		this.setAggregation("titleText", this._oTitle);

		this._sFailedToLoad = this._rb.getText("INFOTILE_CANNOT_LOAD_TILE");

		this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
			src: "sap-icon://notification"
		});
	};

	InfoTile.prototype.ontap = function(oEvent) {
		this.firePress();
	};

	InfoTile.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
			this.firePress();
		}
	};

	InfoTile.prototype.getTitle = function() {
		return this._oTitle.getText();
	};

	InfoTile.prototype.setTitle = function(sDesc) {
		this._oTitle.setProperty("text", sDesc, true);
		this.invalidate();

		return this;
	};

	InfoTile.prototype.exit = function() {
		this._oWarningIcon.destroy();
	};

	return InfoTile;

});