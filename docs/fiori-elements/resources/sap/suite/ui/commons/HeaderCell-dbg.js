/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/ui/core/Control', './HeaderCellRenderer'], function(Control, HeaderCellRenderer) {
	"use strict";

	/**
	 * Constructor for a new HeaderCell.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control contains 4 cells (West, North, East, South). It can display one or more controls in different layouts. Each aggregation must contain only one instance of HeaderCellItem.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.44.0.
	 * HeaderCell control is no longer used. Please use other container controls instead (like sap.m.VBox or sap.m.HBox).
	 * @alias sap.suite.ui.commons.HeaderCell
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HeaderCell = Control.extend("sap.suite.ui.commons.HeaderCell", /** @lends sap.suite.ui.commons.HeaderCell.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Height of the HeaderCell control.
				 * @deprecated Since version 1.20.2.
				 * Wrong property name
				 */
				heigth: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '100px', deprecated: true },

				/**
				 * Height of the HeaderCell control.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '106px' }
			},
			aggregations: {

				/**
				 * Object that contains control to render in west area of the HeaderCell.
				 */
				west: { type: "sap.suite.ui.commons.HeaderCellItem", multiple: false },

				/**
				 * Object that contains control to render in north area of the HeaderCell.
				 */
				north: { type: "sap.suite.ui.commons.HeaderCellItem", multiple: false },

				/**
				 * Object that contains control to render in east area of the HeaderCell.
				 */
				east: { type: "sap.suite.ui.commons.HeaderCellItem", multiple: false },

				/**
				 * Object that contains control to render in south area of the HeaderCell.
				 */
				south: { type: "sap.suite.ui.commons.HeaderCellItem", multiple: false }
			}
		}
	});

	return HeaderCell;

});
