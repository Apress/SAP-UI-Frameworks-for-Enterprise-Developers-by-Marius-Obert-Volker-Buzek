/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/ComparisonMicroChartData' ], function(ComparisonMicroChartData) {
	"use strict";

	/**
	 * Constructor for a new ComparisonData.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Comparison tile value holder.
	 * @extends sap.suite.ui.microchart.ComparisonMicroChartData
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.ComparisonMicroChartData.
	 * @alias sap.suite.ui.commons.ComparisonData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ComparisonData = ComparisonMicroChartData.extend("sap.suite.ui.commons.ComparisonData", /** @lends sap.suite.ui.commons.ComparisonComparisonMicroChartData.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	return ComparisonData;
});
