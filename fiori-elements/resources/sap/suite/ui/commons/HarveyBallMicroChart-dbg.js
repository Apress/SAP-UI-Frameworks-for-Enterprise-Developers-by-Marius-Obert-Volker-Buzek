/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/library', 'sap/suite/ui/microchart/HarveyBallMicroChart', 'sap/suite/ui/microchart/HarveyBallMicroChartRenderer' ],
	function(MicroChartLib, HarveyBallMicroChart, HarveyBallMicroChartRenderer) {
	"use strict";

	/**
	 * Constructor for a new HarveyBallMicroChart.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This chart shows the part comparative to total.
	 * @extends sap.suite.ui.microchart.HarveyBallMicroChart
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.HarveyBallMicroChart.
	 * @alias sap.suite.ui.commons.HarveyBallMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteHarveyBallMicroChart = HarveyBallMicroChart.extend("sap.suite.ui.commons.HarveyBallMicroChart", /** @lends sap.suite.ui.commons.HarveyBallMicroChart.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: HarveyBallMicroChartRenderer
	});

	return SuiteHarveyBallMicroChart;
});
