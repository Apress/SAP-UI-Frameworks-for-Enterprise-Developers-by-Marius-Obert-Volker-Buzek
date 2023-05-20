/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/library', 'sap/suite/ui/microchart/BulletMicroChart', 'sap/suite/ui/microchart/BulletMicroChartRenderer' ],
	function(MicroChartLib, BulletMicroChart, BulletMicroChartRenderer) {
	"use strict";

	/**
	 * Constructor for a new BulletChart.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Chart that displays an actual value as a horizontal bar in semantic color on the top of the background bar, the numeric value, the scaling factor, along with the thresholds, and a target value as vertical bars.
	 * @extends sap.suite.ui.microchart.BulletMicroChart
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.BulletMicroChart.
	 * @alias sap.suite.ui.commons.BulletChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BulletChart = BulletMicroChart.extend("sap.suite.ui.commons.BulletChart", /** @lends sap.suite.ui.commons.BulletChart.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: BulletMicroChartRenderer
	});

	return BulletChart;
});
