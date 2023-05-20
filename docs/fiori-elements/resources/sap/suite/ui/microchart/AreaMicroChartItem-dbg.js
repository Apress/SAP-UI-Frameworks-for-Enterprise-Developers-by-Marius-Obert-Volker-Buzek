/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"./library",
	"sap/ui/core/Element"
], function(library, Element) {
	"use strict";

	/**
	 * The configuration of the graphic element on the chart.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Graphical representation of the area micro chart regarding the value lines, the thresholds, and the target values.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.AreaMicroChartItem
	 */
	var AreaMicroChartItem = Element.extend("sap.suite.ui.microchart.AreaMicroChartItem", /** @lends sap.suite.ui.microchart.AreaMicroChartItem.prototype */ {
		metadata: {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The graphic element color.
				 */
				color: { group: "Misc", type: "sap.m.ValueCSSColor", defaultValue: "Neutral" },

				/**
				 * The line title.
				 */
				title: { type: "string", group: "Misc", defaultValue: null }
			},
			defaultAggregation: "points",
			aggregations: {

				/**
				 * The set of points for this graphic element.
				 */
				"points": { multiple: true, type: "sap.suite.ui.microchart.AreaMicroChartPoint", bindable: "bindable" }
			}
		}
	});

	AreaMicroChartItem.prototype.init = function() {
		this.setAggregation("tooltip", "((AltText))", true);
	};

	return AreaMicroChartItem;
});
