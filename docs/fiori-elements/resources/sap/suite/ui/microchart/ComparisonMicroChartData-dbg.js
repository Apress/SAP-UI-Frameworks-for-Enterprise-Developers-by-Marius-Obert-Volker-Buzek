/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define(['./library', 'sap/ui/core/Element', 'sap/ui/core/Control'],
	function(library, Element, Control) {
	"use strict";

	/**
	 * Constructor for a new ComparisonMicroChartData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains the values of the comparison chart.
	 * @extends sap.ui.core.Element
	 *
	 * @version 1.113.0
	 * @since 1.34
	 *
	 * @constructor
	 * @public
	 * @alias sap.suite.ui.microchart.ComparisonMicroChartData
	 */
	var ComparisonMicroChartData = Element.extend("sap.suite.ui.microchart.ComparisonMicroChartData", /** @lends sap.suite.ui.microchart.ComparisonMicroChartData.prototype */ {
		metadata : {
			library: "sap.suite.ui.microchart",
			properties: {
				/**
				 * The value for comparison.
				 */
				value: {type: "float", group: "Misc", defaultValue: "0"},

				/**
				 * The semantic color of the value.
				 */
				color: {type: "sap.m.ValueCSSColor", group: "Misc", defaultValue: "Neutral"},

				/**
				 * The comparison bar title.
				 */
				title: {type: "string", group: "Misc", defaultValue: ""},

				/**
				 * If this property is set then it will be displayed instead of value.
				 */
				displayValue: {type: "string", group: "Misc", defaultValue: ""}
			},
			events: {
				/**
				 * The event is fired when the user chooses the comparison chart bar.
				 */
				press : {}
			}
		}
	});

	ComparisonMicroChartData.prototype.init = function() {
		this.setAggregation("tooltip", "((AltText))", true);
	};

	ComparisonMicroChartData.prototype.setValue = function(fValue, bSuppressInvalidate) {
		this._isValueSet = this._fnIsNumber(fValue);
		return this.setProperty("value", this._isValueSet ? fValue : NaN, bSuppressInvalidate);
	};

	ComparisonMicroChartData.prototype._fnIsNumber = function(n) {
		return typeof n == 'number' && !isNaN(n) && isFinite(n);
	};

	ComparisonMicroChartData.prototype.clone = function(sIdSuffix, aLocalIds, oOptions) {
		var oClone = Control.prototype.clone.apply(this, arguments);
		oClone._isValueSet = this._isValueSet;
		return oClone;
	};

	ComparisonMicroChartData.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);
		if (this.getParent()) {
			this.getParent().setBarPressable(this.getParent().getData().indexOf(this), true);
		}
		return this;
	};

	ComparisonMicroChartData.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);
		if (this.getParent()) {
			this.getParent().setBarPressable(this.getParent().getData().indexOf(this), false);
		}
		return this;
	};

	return ComparisonMicroChartData;

});
