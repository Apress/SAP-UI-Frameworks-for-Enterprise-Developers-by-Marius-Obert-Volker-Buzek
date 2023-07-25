/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(['./library', 'sap/ui/core/Element'],
	function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new AreaMicroChart control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Displays or hides the labels for start and end dates, start and end values, and minimum and maximum values.
	 * @extends sap.ui.core.Element
	 *
	 * @version 1.113.0
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.AreaMicroChartLabel
	 */
	var AreaMicroChartLabel = Element.extend("sap.suite.ui.microchart.AreaMicroChartLabel", /** @lends sap.suite.ui.microchart.AreaMicroChartLabel.prototype */ {
		metadata : {
			library : "sap.suite.ui.microchart",
			properties : {

				/**
				 * The graphic element color.
				 */
				color: { group: "Misc", type: "sap.m.ValueCSSColor", defaultValue: "Neutral" },

				/**
				 * The line title.
				 */
				label: {type : "string", group : "Misc", defaultValue : "" }
			}
		}
	});

	return AreaMicroChartLabel;
});
