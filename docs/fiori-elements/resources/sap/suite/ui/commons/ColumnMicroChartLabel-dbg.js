/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/ColumnMicroChartLabel' ], function(ColumnMicroChartLabel) {
	"use strict";

	/**
	 * Constructor for a new ColumnMicroChartLabel.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This element contains data for a label in ColumnMicroChart control.
	 * @extends sap.suite.ui.microchart.ColumnMicroChartLabel
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.ColumnMicroChartLabel.
	 * @alias sap.suite.ui.commons.ColumnMicroChartLabel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteColumnMicroChartLabel = ColumnMicroChartLabel.extend("sap.suite.ui.commons.ColumnMicroChartLabel", /** @lends sap.suite.ui.commons.ColumnMicroChartLabel.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	return SuiteColumnMicroChartLabel;
});
