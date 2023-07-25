/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/m/SliderTooltipBase"
], function (SliderTooltipBase) {
	"use strict";

	/**
	 * Constructor for a new StringSliderTooltip.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An implementation of string slider tooltip. This class is intended for suite controls use only.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @private
	 * @alias sap.suite.ui.commons.util.StringSliderTooltip
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var StringSliderTooltip = SliderTooltipBase.extend("sap.suite.ui.commons.util.StringSliderTooltip", {
		metadata: {
			library: "sap.suite.ui.commons.util",
			properties: {
				/**
				 * A mapping function which gets exactly one input which is a number to be converted and must return it's
				 * string representation.
				 */
				mapFunction: {type: "any", group: "Misc"},
				/**
				 * Tells whether to call getValue of parent or getValue2.
				 */
				fetchValue2: {type: "boolean", group: "Misc", defaultValue: false}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
			var sValue = oControl.getStringValue();
			if (!sValue) {
				return;
			}
			oRm.openStart("div", oControl);
			oRm.class("sapMSliderTooltip").class("sapSuiteUiCommonsStringSliderTooltip");
			oRm.openEnd();
			oRm.text(sValue);
			oRm.close("div");
			}
		}
	});

	StringSliderTooltip.prototype.getStringValue = function () {
		var oParent = this.getParent();
		if (!oParent) {
			return null;
		}
		var fValue = this.getFetchValue2() ? oParent.getValue2() : oParent.getValue();
		var fnMap = this.getMapFunction() || String;
		return fnMap(fValue);
	};

	StringSliderTooltip.prototype.sliderValueChanged = function (fValue) {
		var fnMap = this.getMapFunction() || String,
			sValue = fnMap(fValue);
		this.$().text(sValue);
	};

	return StringSliderTooltip;
});
