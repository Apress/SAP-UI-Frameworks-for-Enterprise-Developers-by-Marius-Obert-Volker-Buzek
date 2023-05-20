/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/library', 'sap/suite/ui/microchart/ComparisonMicroChart', 'sap/suite/ui/microchart/ComparisonMicroChartRenderer' ],
	function(MicroChartLib, ComparisonMicroChart, ComparisonMicroChartRenderer) {
	"use strict";

	/**
	 * Constructor for a new ComparisonChart.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control shows a comparison chart.
	 * @extends sap.suite.ui.microchart.ComparisonMicroChart
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.ComparisonMicroChart.
	 * @alias sap.suite.ui.commons.ComparisonChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ComparisonChart = ComparisonMicroChart.extend("sap.suite.ui.commons.ComparisonChart", /** @lends sap.suite.ui.commons.ComparisonChart.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: ComparisonMicroChartRenderer
	});

	return ComparisonChart;
});
