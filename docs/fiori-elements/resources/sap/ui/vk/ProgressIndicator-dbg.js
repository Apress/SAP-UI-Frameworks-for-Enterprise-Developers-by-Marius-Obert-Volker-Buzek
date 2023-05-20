/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ProgressIndicator.
sap.ui.define([
	"sap/m/ProgressIndicator",
	"./ProgressIndicatorRenderer",
	"sap/base/Log"
], function(
	MobileProgressIndicator,
	ProgressIndicatorRenderer,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new ProgressIndicator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Shows the progress of a process in a graphical way. To indicate the progress, the inside of the ProgressIndicator is filled with a color.
	 * Additionally, a user-defined string can be displayed on the ProgressIndicator.
	 * @extends sap.m.ProgressIndicator
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @since 1.50.0
	 * @alias sap.ui.vk.ProgressIndicator
	 */
	var ProgressIndicator = MobileProgressIndicator.extend("sap.ui.vk.ProgressIndicator");

	ProgressIndicator.prototype.setPercentValue = function(fPercentValue) {

		var isValidPercentValue = function isValidPercentValue(value) {
			return (typeof (value) === "number") && !isNaN(value) && value >= 0 && value <= 100;
		};

		var that = this,
			$progressBar,
			fPercentDiff,
			$progressIndicator = this.$(),
			fAnimationDuration,
			bUseAnimations = false;

		if (!isValidPercentValue(fPercentValue)) {
			fPercentValue = 0;
			Log.warning(this + ": percentValue (" + fPercentValue + ") is not correct! Setting the default percentValue:0.");
		}

		if (this.getPercentValue() !== fPercentValue) {
			fPercentDiff = this.getPercentValue() - fPercentValue;
			this.setProperty("percentValue", fPercentValue, true);

			if (!$progressIndicator.length) {
				return this;
			}

			["sapMPIValueMax", "sapMPIValueMin", "sapMPIValueNormal", "sapMPIValueGreaterHalf"].forEach(function(sClass) {
				$progressIndicator.removeClass(sClass);
			});

			$progressIndicator.addClass(this._getCSSClassByPercentValue(fPercentValue));
			$progressIndicator.addClass("sapMPIAnimate")
				.attr("aria-valuenow", fPercentValue)
				.attr("aria-valuetext", this._getAriaValueText({
					fPercent: fPercentValue
				}));

			fAnimationDuration = bUseAnimations ? Math.abs(fPercentDiff) * 20 : 0;
			$progressBar = this.$("bar");
			$progressBar.animate({
				"flex-basis": fPercentValue + "%"
			}, fAnimationDuration, "linear", function() {
				that._setText.apply(that);
				that.$().removeClass("sapMPIAnimate");
			});
		}

		return this;
	};

	return ProgressIndicator;

});
