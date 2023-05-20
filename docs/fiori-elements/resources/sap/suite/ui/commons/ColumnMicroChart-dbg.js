/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/library', 'sap/suite/ui/microchart/ColumnMicroChart', 'sap/suite/ui/microchart/ColumnMicroChartRenderer' ],
	function(MicroChartLib, ColumnMicroChart, ColumnMicroChartRenderer) {
	"use strict";

	/**
	 * Constructor for a new ColumnMicroChart.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control shows a column chart.
	 * @extends sap.suite.ui.microchart.ColumnMicroChart
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.ColumnMicroChart.
	 * @alias sap.suite.ui.commons.ColumnMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteColumnMicroChart = ColumnMicroChart.extend("sap.suite.ui.commons.ColumnMicroChart", /** @lends sap.suite.ui.commons.ColumnMicroChart.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: ColumnMicroChartRenderer
	});

	return SuiteColumnMicroChart;
});
