/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/library', 'sap/suite/ui/microchart/DeltaMicroChart', 'sap/suite/ui/microchart/DeltaMicroChartRenderer' ],
	function(MicroChartLib, DeltaMicroChart, DeltaMicroChartRenderer) {
	"use strict";

	/**
	 * Constructor for a new DeltaMicroChart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class This control displays a delta of two values as a chart.
	 * @extends sap.suite.ui.microchart.DeltaMicroChart
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34. Deprecated. sap.suite.ui.microchart.DeltaMicroChart should be used.
	 * @alias sap.suite.ui.commons.DeltaMicroChart
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteDeltaMicroChart = DeltaMicroChart.extend("sap.suite.ui.commons.DeltaMicroChart", /** @lends sap.suite.ui.commons.DeltaMicroChart.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		},
		renderer: DeltaMicroChartRenderer
	});

	return SuiteDeltaMicroChart;

});