/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/m/NumericContent', 'sap/m/NumericContentRenderer' ], function(NumericContent, NumericContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new NumericContent.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * NumericContent to be used in tile or in other place where need to show numeric values with sematic colors and deviations.
	 * @extends sap.m.NumericContent
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.m.NumericContent.
	 * @alias sap.suite.ui.commons.NumericContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	return NumericContent.extend("sap.suite.ui.commons.NumericContent", /** @lends sap.suite.ui.commons.NumericContent.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: NumericContentRenderer
	});
});
