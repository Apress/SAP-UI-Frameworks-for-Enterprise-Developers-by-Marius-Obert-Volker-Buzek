/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/ui/core/Element' ], function(Element) {
	"use strict";

	/**
	 * Constructor for a new HeaderCellItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Object that contains instance of control and information about height. It should be used inside sap.suite.ui.commons.HeaderCell
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.44.0.
	 * The HeaderCellItem was deprecated because of the deprecation of HeaderCell. Please see HeaderCell for replacement advice.
	 * @alias sap.suite.ui.commons.HeaderCellItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HeaderCellItem = Element.extend("sap.suite.ui.commons.HeaderCellItem", /** @lends sap.suite.ui.commons.HeaderCellItem.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Height of area to occupy by control.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: null }
			},
			aggregations: {

				/**
				 * Instance of UI5 Control that is used as content.
				 */
				content: { type: "sap.ui.core.Control", multiple: false }
			}
		}
	});

	return HeaderCellItem;
});
