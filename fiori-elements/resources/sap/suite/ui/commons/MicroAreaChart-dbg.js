/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/library', 'sap/suite/ui/microchart/AreaMicroChart', 'sap/suite/ui/microchart/AreaMicroChartRenderer' ],
	function(MicroChartLib, AreaMicroChart, AreaMicroChartRenderer) {
	"use strict";

	/**
	 * Constructor for a new MicroAreaChart.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays the history of values as a line mini chart or an area mini chart.
	 * @extends sap.suite.ui.microchart.AreaMicroChart
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.AreaMicroChart.
	 * @alias sap.suite.ui.commons.MicroAreaChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MicroAreaChart = AreaMicroChart.extend("sap.suite.ui.commons.MicroAreaChart", /** @lends sap.suite.ui.commons.MicroAreaChart.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: AreaMicroChartRenderer
	});

	return MicroAreaChart;
});
