/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/suite/ui/microchart/BulletMicroChartData' ], function(BulletMicroChartData) {
	"use strict";

	/**
	 * Constructor for a new BulletChartData.
	 *
	 * @param {string} [sId] ID for the new control, automatically generated if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Thresholds data holder.
	 * @extends sap.suite.ui.microchart.BulletMicroChartData
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34, this control is a mere wrapper for sap.suite.ui.microchart.BulletMicroChartData.
	 * @alias sap.suite.ui.commons.BulletChartData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BulletChartData = BulletMicroChartData.extend("sap.suite.ui.commons.BulletChartData", /** @lends sap.suite.ui.commons.BulletChartData.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	return BulletChartData;
});
