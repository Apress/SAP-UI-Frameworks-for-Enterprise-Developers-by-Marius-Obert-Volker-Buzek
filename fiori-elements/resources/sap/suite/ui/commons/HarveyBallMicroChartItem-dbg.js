/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/HarveyBallMicroChartItem' ], function(HarveyBallMicroChartItem) {
	"use strict";

	/**
	 * Constructor for a new HarveyBallMicroChartItem.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The configuration of the slice on the pie chart.
	 * @extends sap.suite.ui.microchart.HarveyBallMicroChartItem
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.HarveyBallMicroChartItem.
	 * @alias sap.suite.ui.commons.HarveyBallMicroChartItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SuiteHarveyBallMicroChartItem = HarveyBallMicroChartItem.extend("sap.suite.ui.commons.HarveyBallMicroChartItem", /** @lends sap.suite.ui.commons.HarveyBallMicroChartItem.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	return SuiteHarveyBallMicroChartItem;
});
