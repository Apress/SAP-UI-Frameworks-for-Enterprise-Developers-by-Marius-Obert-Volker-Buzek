/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// This control displays the history of values as a line mini chart or an area mini chart.
sap.ui.define(['./library',	'sap/ui/core/Element'],
	function(library, Element)	{
	"use strict";

	/**
	 * Constructor for a new ColumnMicroChartLabel control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Displays or hides the labels of a column micro chart.
	 * @extends sap.ui.core.Element
	 *
	 * @version 1.113.0
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.suite.ui.microchart.ColumnMicroChartLabel
	 */
	var ColumnMicroChartLabel = Element.extend("sap.suite.ui.microchart.ColumnMicroChartLabel", /** @lends sap.suite.ui.microchart.ColumnMicroChartLabel.prototype */ {
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
				label: { type : "string", group : "Misc", defaultValue : "" }
			}
		}
	});

	return ColumnMicroChartLabel;

});