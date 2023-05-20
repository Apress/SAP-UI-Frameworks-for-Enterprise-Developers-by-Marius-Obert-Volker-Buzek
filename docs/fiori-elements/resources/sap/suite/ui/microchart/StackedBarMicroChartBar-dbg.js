/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides sap.suite.ui.microchart.StackedBarMicroChartBar control.
sap.ui.define(["sap/ui/thirdparty/jquery", './library', 'sap/ui/core/Element', "sap/m/library"],
	function(jQuery, library, Element, mobileLibrary) {
	"use strict";

	var ValueCSSColor = mobileLibrary.ValueCSSColor;

	/**
	 * Constructor for a new StackedBarMicroChartBar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains the values of the stacked bar chart.
	 * @extends sap.ui.core.Element
	 *
	 * @version 1.113.0
	 * @since 1.44.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.microchart.StackedBarMicroChartBar
	 */
	var StackedBarMicroChartBar = Element.extend("sap.suite.ui.microchart.StackedBarMicroChartBar", /** @lends sap.suite.ui.microchart.StackedBarMicroChartBar.prototype */ {
		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The value for stacked bar chart. It is used in order to determine the width of the bar
				 */
				value: {type: "float", group: "Data", defaultValue: "0"},

				/**
				 * The color of the bar.
				 */
				valueColor: {type: "sap.m.ValueCSSColor", group: "Appearance", defaultValue: null},

				/**
				 * If this property is set, then it will be displayed instead of value.
				 */
				displayValue: {type: "string", group: "Data", defaultValue: null}
			}
		}
	});

	StackedBarMicroChartBar.prototype.setValue = function(fValue, bSuppressInvalidate) {
		var bIsValueSet = jQuery.isNumeric(fValue);
		return this.setProperty("value", bIsValueSet ? fValue : NaN, bSuppressInvalidate);
	};

	StackedBarMicroChartBar.prototype.setValueColor = function(sValue, bSuppressInvalidate) {
		var bIsValueSet = ValueCSSColor.isValid(sValue);
		return this.setProperty("valueColor", bIsValueSet ? sValue : null, bSuppressInvalidate);
	};

	return StackedBarMicroChartBar;

});