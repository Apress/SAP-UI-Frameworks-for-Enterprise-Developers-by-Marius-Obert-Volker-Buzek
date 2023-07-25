/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './library', 'sap/ui/core/Control', './KpiTileRenderer' ], function(library, Control, KpiTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new KpiTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is used in UnifiedThingInspector to display object-related KPIs in a factsheet.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Numeric content or any other standard Fiori control should be used instead.
	 * @alias sap.suite.ui.commons.KpiTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var KpiTile = Control.extend("sap.suite.ui.commons.KpiTile", /** @lends sap.suite.ui.commons.KpiTile.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The Value field.
				 */
				value: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The Description field.
				 */
				description: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * If true, the value text will have 2 rem, if false - 1 rem.
				 */
				doubleFontSize: { type: "boolean", group: "Misc", defaultValue: true },

				/**
				 * The percent sign, currency symbol, or unit for a value.
				 */
				valueUnit: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The scale of a value.
				 */
				valueScale: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The status color of the value. Depending on the status the tile is displayed in different colors.
				 */
				valueStatus: {
					type: "sap.suite.ui.commons.ValueStatus",
					group: "Misc",
					defaultValue: "Neutral"
				}
			}
		}
	});

	return KpiTile;
});
