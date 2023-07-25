/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides sap.suite.ui.microchart.LineMicroChartEmphasizedPoint control.
sap.ui.define(["sap/m/library", "sap/suite/ui/microchart/LineMicroChartPoint"],
	function(mobileLibrary, LineMicroChartPoint) {
	"use strict";

	// shortcut for sap.m.ValueCSSColor
	var ValueCSSColor = mobileLibrary.ValueCSSColor;

	/**
	 * Constructor for a new LineMicroChartEmphasizedPoint.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains the emphasized point of the line micro chart.
	 * @extends sap.suite.ui.microchart.LineMicroChartPoint
	 *
	 * @version 1.113.0
	 * @since 1.48.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.microchart.LineMicroChartEmphasizedPoint
	 */
	var LineMicroChartEmphasizedPoint = LineMicroChartPoint.extend("sap.suite.ui.microchart.LineMicroChartEmphasizedPoint", /** @lends sap.suite.ui.microchart.LineMicroChartEmphasizedPoint.prototype */ {
		metadata: {
			properties: {
				/**
				 * Determines the color of the emphasized point.
				 * The property has an effect only if the 'show' property is true.
				 * If at least one emphasized point has a color different from Neutral, the graph is grey; otherwise, the graph is blue.
				 */
				color: {type: "sap.m.ValueCSSColor", group: "Misc", defaultValue: "Neutral"},
				/**
				 * Determines whether the chart point should be displayed or not.
				 */
				show: {type: "boolean", group: "Appearance", defaultValue: false}
			}
		}
	});

	LineMicroChartEmphasizedPoint.prototype.setColor = function(sValue) {
		this.setProperty("color", ValueCSSColor.isValid(sValue) ? sValue : null);
		return this;
	};

	return LineMicroChartEmphasizedPoint;

});
