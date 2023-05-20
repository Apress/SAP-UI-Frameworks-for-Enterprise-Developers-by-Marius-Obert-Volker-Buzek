/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/AreaMicroChartItem' ], function(AreaMicroChartItem) {
	"use strict";

	/**
	 * Constructor for a new MicroAreaChartItem.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The configuration of the graphic element on the chart.
	 * @extends sap.suite.ui.microchart.AreaMicroChartItem
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.AreaMicroChartItem.
	 * @alias sap.suite.ui.commons.MicroAreaChartItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MicroAreaChartItem = AreaMicroChartItem.extend("sap.suite.ui.commons.MicroAreaChartItem", /** @lends sap.suite.ui.commons.MicroAreaChartItem.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	return MicroAreaChartItem;
});
