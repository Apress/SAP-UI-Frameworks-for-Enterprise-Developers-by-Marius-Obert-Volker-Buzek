/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/AreaMicroChartPoint' ], function(AreaMicroChartPoint) {
	"use strict";

	/**
	 * Constructor for a new MicroAreaChartPoint.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control contains data for the point.
	 * @extends sap.suite.ui.microchart.AreaMicroChartPoint
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.AreaMicroChartPoint.
	 * @alias sap.suite.ui.commons.MicroAreaChartPoint
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MicroAreaChartPoint = AreaMicroChartPoint.extend("sap.suite.ui.commons.MicroAreaChartPoint", /** @lends sap.suite.ui.commons.MicroAreaChartPoint.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	return MicroAreaChartPoint;
});
