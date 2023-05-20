/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/ui/core/Control', './RepeaterViewConfigurationRenderer' ], function(Control, RepeaterViewConfigurationRenderer) {
	"use strict";

	/**
	 * Constructor for a new RepeaterViewConfiguration.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A configuration control defining how the content of the sap.suite.ui.commons.ViewRepeater control is displayed and what data is bound.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Standard Fiori technology should be used.
	 * @alias sap.suite.ui.commons.RepeaterViewConfiguration
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RepeaterViewConfiguration = Control.extend("sap.suite.ui.commons.RepeaterViewConfiguration", /** @lends sap.suite.ui.commons.RepeaterViewConfiguration.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The title of the view to be displayed in sap.suite.ui.commons.ViewRepeater view selector. If neither this nor "icon" property are defined, the default title "View ##" will be shown, where ## is an index number of the view in View Repeater starting from 1.
				 */
				title: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * A path to the icon representing this view in sap.suite.ui.commons.ViewRepeater view selector.
				 */
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },

				/**
				 * A path to the icon representing this view in sap.suite.ui.commons.ViewRepeater view selector when the regular icon is hovered.
				 */
				iconHovered: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },

				/**
				 * A path used for rows/titles data binding.
				 */
				path: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The minimal width of the tile in this view. Only applicable if "responsive" property is set to true.
				 */
				itemMinWidth: { type: "int", group: "Misc", defaultValue: -1 },

				/**
				 * The number of tiles/rows that will be shown on a single page in this view.
				 */
				numberOfTiles: { type: "int", group: "Misc", defaultValue: -1 },

				/**
				 * This parameter indicates whether the content is shown in rows or tiles. If false, the content is shown in rows just like in core sap.ui.commons.RowRepeater. If true, the content is shown in tiles (similar to sap.ui.ux3.DataSet control) that have minimal width defined by the "itemMinWidth" property. The number of columns depends on the parent control's width. If you resize the control, the number of columns may change respectively so that the content tiles can fill the entire space of a row.
				 */
				responsive: { type: "any", group: "Misc", defaultValue: false },

				/**
				 * Indicates if the external representation of this view is rendered instead of the row repeater's own content.
				 */
				external: { type: "boolean", group: "Misc", defaultValue: false },

				/**
				 * A path to the icon representing this view in sap.suite.ui.commons.ViewRepeater view selector when the regular icon is selected.
				 */
				iconSelected: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },

				/**
				 * The height of the tile in this view in pixels. Only applicable if the responsive property is set to true. This value is used for calculating the number of tile rows.
				 */
				itemHeight: { type: "int", group: "Misc", defaultValue: null }
			},
			aggregations: {

				/**
				 * The control used as a template while displaying rows/tiles in this view. It should not have fixed width wider than defined by the "itemMinWidth" property, otherwise some content may appear cropped.
				 */
				template: { type: "sap.ui.core.Control", multiple: false },

				/**
				 * The control to be rendered instead of sap.suite.ui.commons.ViewRepeater's own content. Only used if the "external" property is set to true. This allows you to create custom views, for example, Table views. The sap.suite.ui.commons.ViewRepeater control will share its model with this control if the control does not have its own model.
				 */
				externalRepresentation: { type: "sap.ui.core.Control", multiple: false }
			}
		}
	});

	return RepeaterViewConfiguration;
});
