/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'./util/DateUtils',
	'sap/ui/commons/library',
	'sap/ui/commons/Label',
	'sap/ui/commons/RangeSlider',
	'sap/ui/core/format/DateFormat',
	'sap/ui/commons/Slider',
	"sap/base/Log",
	"./DateRangeSliderInternalRenderer"
], function (jQuery, library, DateUtils, CommonsLibrary, Label, RangeSlider, DateFormat, Slider, Log, DateRangeSliderInternalRenderer) {
	"use strict";

	/**
	 * Constructor for a new DateRangeSliderInternal.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The Date Range Slider provides the user with a Range Slider control that is optimized for use with Dates.
	 * @extends sap.ui.commons.RangeSlider
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Not Fiori.
	 * @alias sap.suite.ui.commons.DateRangeSliderInternal
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateRangeSliderInternal = RangeSlider.extend("sap.suite.ui.commons.DateRangeSliderInternal", /** @lends sap.suite.ui.commons.DateRangeSliderInternal.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Property to show or hide bubbles. Default is true.
				 */
				showBubbles: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Property to pin Grip (left grip) of the slider so that user cannot move it with key or mouse clicks.
				 */
				pinGrip: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Property to pin Grip2 (right grip) of the slider so that user cannot move it with key or mouse clicks.
				 */
				pinGrip2: {type: "boolean", group: "Misc", defaultValue: false}
			},
			events: {

				/**
				 * This event is fired when user changes the positions of the grips of the control. It contains value as Date object and value2 as Date object which are based on the positions of two grips.
				 */
				change: {},

				/**
				 * This live event is fired when user changes the positions of the grips of the control. It contains value as Date object and value2 as Date object which are based on the positions of two grips.
				 */
				liveChange: {}
			}
		}
	});

	var DEFAULT_TOTAL_UNITS = 12;
	var DAY = "d";
	var MONTH = "m";

	/**
	 * Initialize the DateRangeSliderInternal.
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.init = function () {
		this.setSmallStepWidth(1);
		this._sGranularity = DAY;
		this._oDateFormat = null;

		var dMaxDate = new Date();
		this._dMinDate = DateUtils.incrementDateByIndex(dMaxDate, -365);

		if (!this.getTotalUnits()) {
			this.setTotalUnits(DEFAULT_TOTAL_UNITS);
		}

		this.setMin(0);
		this.setMax(365);
		this.setValue(0);
		this.setValue2(365);

		var bTextLabels = (this.getLabels() && this.getLabels().length > 0);
		this._bUsingDefaultLabels = this.getStepLabels() && !bTextLabels;
		if (this._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(this);
		}

		if (this.getShowBubbles()) {
			this._oBubble = new Label({
				id: this.getId() + '-bubbleTxt'
			});
			this._oBubble2 = new Label({
				id: this.getId() + '-bubbleTxt2'
			});

			this._oBubble.addStyleClass("sapSuiteUiCommonsDateRangeSliderBubbleLblTxt");
			this._oBubble2.addStyleClass("sapSuiteUiCommonsDateRangeSliderBubbleLblTxt");

			this._oBubble.setText(this.getFormattedDate(this.getValueDate()));
			this._oBubble2.setText(this.getFormattedDate(this.getValue2Date()));
		}
	};

	/**
	 * Not yet supported
	 *
	 * @param {boolean} bVertical If the control is to be displayed as Vertical
	 * @private
	 */
	DateRangeSliderInternal.prototype.setVertical = function (bVertical) {
		Log.error("DateRangeSliderInternal.setVertical method is not yet supported!");

		return this;
	};

	/**
	 * Not yet supported
	 *
	 * @param {string} sHeight New height of the control
	 * @private
	 */
	DateRangeSliderInternal.prototype.setHeight = function (sHeight) {
		Log.error("DateRangeSliderInternal.setHeight method is not yet supported!");

		return this;
	};

	/**
	 * Creates rail labels.
	 *
	 * @param {sap.suite.ui.commons.DateRangeSliderInternal} oDateRangeSliderInternal The DateRangeSliderInternal object
	 * @returns {Array} aRailLabels
	 * @private
	 */
	DateRangeSliderInternal.createRailLabels = function (oDateRangeSliderInternal) {
		var aRailLabels = [];
		var iTotalUnits = oDateRangeSliderInternal.getTotalUnits();
		var fStepSize = (oDateRangeSliderInternal.getMax() - oDateRangeSliderInternal.getMin()) / iTotalUnits;

		for (var i = 0; i <= iTotalUnits; i++) {
			var iDateIndex = Math.round(parseFloat(oDateRangeSliderInternal.getMin() + i * fStepSize));
			if (iDateIndex > oDateRangeSliderInternal.getMax()) {
				iDateIndex = oDateRangeSliderInternal.getMax();
			}

			var dTmpDate = null;
			if (oDateRangeSliderInternal._sGranularity === DAY) {
				dTmpDate = DateUtils.incrementDateByIndex(oDateRangeSliderInternal.getMinDate(), iDateIndex);
			} else if (oDateRangeSliderInternal._sGranularity === MONTH) {
				dTmpDate = DateUtils.incrementMonthByIndex(oDateRangeSliderInternal.getMinDate(), iDateIndex);
			}
			aRailLabels[i] = oDateRangeSliderInternal.getFormattedDate(dTmpDate);
		}

		oDateRangeSliderInternal.setProperty("labels", aRailLabels);

		return aRailLabels;
	};

	/**
	 * Reposition the bubbles based on grip positions.
	 *
	 * @param {sap.suite.ui.commons.DateRangeSliderInternal} oDateRangeSliderInternal The DateRangeSliderInternal object
	 * @private
	 */
	DateRangeSliderInternal.repositionBubbles = function (oDateRangeSliderInternal) {
		var sGripId = oDateRangeSliderInternal.getId() + '-grip';
		var oGrip = sGripId ? window.document.getElementById(sGripId) : null;
		var sLeftpx = oGrip.style.left;
		var sLeftPositionOfGrip = sLeftpx.substring(0, sLeftpx.length - 2);
		var iLeftPositionOfGrip = parseInt(sLeftPositionOfGrip, 10);

		var sGrip2Id = oDateRangeSliderInternal.getId() + '-grip2';
		var oGrip2 = sGrip2Id ? window.document.getElementById(sGrip2Id) : null;
		var sLeftpx2 = oGrip2.style.left;
		var sLeftPositionOfGrip2 = sLeftpx2.substring(0, sLeftpx2.length - 2);
		var iLeftPositionOfGrip2 = parseInt(sLeftPositionOfGrip2, 10);

		var sBubbleId = oDateRangeSliderInternal.getId() + '-bubble';
		var oBubble = sBubbleId ? window.document.getElementById(sBubbleId) : null;
		var sBubble2Id = oDateRangeSliderInternal.getId() + '-bubble2';
		var oBubble2 = sBubble2Id ? window.document.getElementById(sBubble2Id) : null;

		var sBubbleleft = null, sBubble2left = null;

		var sBubbleleftpx = oBubble.style.left;
		if (sBubbleleftpx) {
			sBubbleleft = sBubbleleftpx.substring(0, sBubbleleftpx.length - 2);
		}
		var sBubble2leftpx = oBubble2.style.left;
		if (sBubble2leftpx) {
			sBubble2left = sBubble2leftpx.substring(0, sBubble2leftpx.length - 2);
		}

		var sWidthOfBubblePx = jQuery(oBubble).css("width");
		var iWidthOfBubble = parseInt(sWidthOfBubblePx, 10);

		var iDiff = 41;

		if (((iLeftPositionOfGrip + iWidthOfBubble) < iLeftPositionOfGrip2) || (!sBubbleleft && !sBubble2left)) {
			oBubble.style.left = (iLeftPositionOfGrip - iDiff) + "px";
			oBubble2.style.left = (iLeftPositionOfGrip2 - iDiff) + "px";
		}
		// CSS 2084810 2013 - Fix for bubble repositioning in RTL mode.
		if (sap.ui.getCore().getConfiguration().getRTL() && ((iLeftPositionOfGrip2 + iWidthOfBubble) < iLeftPositionOfGrip)) {
			oBubble.style.left = (iLeftPositionOfGrip - iDiff) + "px";
			oBubble2.style.left = (iLeftPositionOfGrip2 - iDiff) + "px";
		}

		var sValue = oDateRangeSliderInternal.getFormattedDate(oDateRangeSliderInternal.getValueDate());
		var sValue2 = oDateRangeSliderInternal.getFormattedDate(oDateRangeSliderInternal.getValue2Date());

		oDateRangeSliderInternal._oBubble.setText(sValue);
		oDateRangeSliderInternal._oBubble2.setText(sValue2);

		if (oDateRangeSliderInternal.isActive()) {
			oDateRangeSliderInternal._oBubble.rerender();
			oDateRangeSliderInternal._oBubble2.rerender();
		}
	};

	/**
	 * Function is called when grip position shall be changed
	 *
	 * @param {float} fNewValue The new grip value
	 * @param {int} iNewPos The new grip position
	 * @param {DOMNode} oGrip The changed grip
	 * @private
	 */
	DateRangeSliderInternal.prototype.changeGrip = function (fNewValue, iNewPos, oGrip) {
		Slider.prototype.changeGrip.apply(this, arguments);

		if (!isNaN(fNewValue)) {
			var iDateIndex = Math.round(fNewValue);
			var dTmpDate = null;
			if (this._sGranularity === DAY) {
				dTmpDate = DateUtils.incrementDateByIndex(this._dMinDate, iDateIndex);
			} else if (this._sGranularity === MONTH) {
				dTmpDate = DateUtils.incrementMonthByIndex(this._dMinDate, iDateIndex);
			}

			oGrip.title = this.getFormattedDate(dTmpDate);
		}
	};

	/**
	 * Update ARIA values when a grip moves.
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.setAriaState = function () {
		var dateVal = this.getFormattedDate(this.getValueDate());
		var date2Val = this.getFormattedDate(this.getValue2Date());

		if (this.oMovingGrip === this.oGrip) {
			this.oMovingGrip.setAttribute('aria-valuetext', dateVal);
			this.oMovingGrip.setAttribute('aria-valuenow', this.getValue());
			this.oGrip2.setAttribute('aria-valuemin', dateVal);
		} else {
			this.oMovingGrip.setAttribute('aria-valuetext', date2Val);
			this.oMovingGrip.setAttribute('aria-valuenow', this.getValue2());
			this.oGrip.setAttribute('aria-valuemax', date2Val);
		}
	};

	/**
	 * Format the given date based on the Granularity and DateFormat.
	 *
	 * @param {Date} dDate The date to be formatted.
	 *
	 * @returns {string} The formatted date string
	 * @private
	 */
	DateRangeSliderInternal.prototype.getFormattedDate = function (dDate) {
		var oFormatter = null;

		switch (this._sGranularity) {
			case (DAY):
				oFormatter = this._oDateFormat || DateFormat.getDateInstance({
					style: "medium"
				});
				break;
			case (MONTH):
				oFormatter = this._oDateFormat || DateFormat.getDateInstance({
					pattern: 'MMM YYYY'
				});
				break;
			default:
				break;
		}
		return oFormatter.format(dDate);
	};

	/**
	 * Update the Labels, Bubble text and Tool Tip values and re-render DateRangeSliderInternal control.
	 *
	 * @param {sap.suite.ui.commons.DateRangeSliderInternal} oDateRangeSliderInternal the date range slider internal object
	 * @private
	 */
	DateRangeSliderInternal.updateLabelBubbleToolTipValues = function (oDateRangeSliderInternal) {
		// update Labels based on DateFormat
		if (oDateRangeSliderInternal._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(oDateRangeSliderInternal);
		}

		// update bubble text based on DateFormat
		if (oDateRangeSliderInternal.getShowBubbles()) {
			var sValue = oDateRangeSliderInternal.getFormattedDate(oDateRangeSliderInternal.getValueDate());
			var sValue2 = oDateRangeSliderInternal.getFormattedDate(oDateRangeSliderInternal.getValue2Date());
			oDateRangeSliderInternal._oBubble.setText(sValue);
			oDateRangeSliderInternal._oBubble2.setText(sValue2);
		}
	};

	/**
	 * Getter for dateFormat which is used for formating the dates for Labels, bubble texts, and tool tips.
	 *
	 * @return {sap.ui.core.format.DateFormat} oDateFormat The internal DateFormat instance
	 * @private
	 */
	DateRangeSliderInternal.prototype.getDateFormat = function () {
		return this._oDateFormat;
	};

	/**
	 * Setter for dateFormat which is used for formating the dates for Labels, bubble texts, and tool tips. If passed object is null or is of incorrect type, control's default
	 * formatting will be used.
	 *
	 * @param {sap.ui.core.format.DateFormat} oDateFormat The internal DateFormat instance
	 * @private
	 */
	DateRangeSliderInternal.prototype.setDateFormat = function (oDateFormat) {
		if (oDateFormat && oDateFormat instanceof DateFormat) {
			this._oDateFormat = oDateFormat;
		} else {
			this._oDateFormat = null;
		}
		DateRangeSliderInternal.updateLabelBubbleToolTipValues(this);
	};

	/**
	 * Returns an object containing valueDate and value2Date which are set to the values based on two grips of the DateRangeSliderInternal.
	 *
	 * @return {Object} The date range object containing valueDate and value2Date Date.
	 * @private
	 */
	DateRangeSliderInternal.prototype.getDateRange = function () {
		var dValueDate = this.getValueDate();
		var dValue2Date = this.getValue2Date();

		var oCopy = {
			valueDate: dValueDate,
			value2Date: dValue2Date
		};
		return oCopy;
	};

	/**
	 * Handles the change event fired by the range slider after reseting the date range, fires the change event of DateRangeSliderInternal.
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.handleFireChange = function () {
		if (this.getShowBubbles()) {
			DateRangeSliderInternal.repositionBubbles(this);
		}
		var oRange = this.getDateRange();
		this.fireChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});
		this.fireLiveChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});
	};

	/**
	 * fires the change event. The liveEvent is not fired here.
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.handleFireChangeWithoutLive = function () {
		if (this.getShowBubbles()) {
			DateRangeSliderInternal.repositionBubbles(this);
		}
		var oRange = this.getDateRange();
		this.fireChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});
	};

	/**
	 * Handles the live change event fired by the range slider after reseting the date range, fires the live change event of DateRangeSliderInternal.
	 * @param {Object} oGrip The grip to change
	 * @param {float} fNewValue The new value
	 * @param {float} fOldValue The old value
	 * @private
	 */
	DateRangeSliderInternal.prototype.fireLiveChangeForGrip = function (oGrip, fNewValue, fOldValue) {
		if (this.getShowBubbles() && fOldValue !== fNewValue) {
			DateRangeSliderInternal.repositionBubbles(this);
		}
		var oRange;
		if (oGrip === this.oGrip) {
			if (fOldValue !== fNewValue) {
				// fire event only if value changed
				oRange = this.getDateRange();
				this.fireLiveChange({
					value: oRange.valueDate,
					value2: oRange.value2Date
				});
			}
		} else if (oGrip === this.oGrip2) {
			if (fOldValue !== fNewValue) {
				// fire event only if value changed
				oRange = this.getDateRange();
				this.fireLiveChange({
					value: oRange.valueDate,
					value2: oRange.value2Date
				});
			}
		}
	};

	/**
	 * This function is called after the DateRangeSliderInternal is rendered
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.onAfterRendering = function () {
		RangeSlider.prototype.onAfterRendering.apply(this);
		if (this.getShowBubbles()) {
			DateRangeSliderInternal.repositionBubbles(this);
		}
	};

	/**
	 * Function is called when window is resized
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onresize = function (oEvent) {
		RangeSlider.prototype.onresize.apply(this, arguments);
		if (this.getDomRef()) {
			if (this.getShowBubbles()) {
				DateRangeSliderInternal.repositionBubbles(this);
			}
		}
	};

	/**
	 * Sets the stepLabels property
	 * @param {boolean} bStepLabels New value for property stepsLabels
	 * @private
	 */
	DateRangeSliderInternal.prototype.setStepLabels = function (bStepLabels) {
		this.setProperty("stepLabels", bStepLabels);

		if (bStepLabels === true) {
			var bTextLabels = (this.getLabels() && this.getLabels().length > 0);
			if (!bTextLabels) {
				DateRangeSliderInternal.createRailLabels(this);
				this._bUsingDefaultLabels = true;
			}
		}

		return this;
	};

	/**
	 * Sets the labels property
	 * @param {Array} aLabels New value for property labels
	 * @private
	 */
	DateRangeSliderInternal.prototype.setLabels = function (aLabels) {
		this.setProperty("labels", aLabels);
		var bTextLabels = (this.getLabels() && this.getLabels().length > 0);
		if (this.getStepLabels() && !bTextLabels) {
			DateRangeSliderInternal.createRailLabels(this);
			this._bUsingDefaultLabels = true;
		}

		return this;
	};

	/**
	 * Sets the smallStepWidth property
	 * @param {float} fSmallStepWidth New value for property smallStepWidth
	 * @private
	 */
	DateRangeSliderInternal.prototype.setSmallStepWidth = function (fSmallStepWidth) {
		this.setProperty("smallStepWidth", Math.round(fSmallStepWidth));

		return this;
	};

	/**
	 * Sets the totalUnits property
	 * @param {int} iTotalUnits New value for property totalUnits.
	 * @private
	 */
	DateRangeSliderInternal.prototype.setTotalUnits = function (iTotalUnits) {
		this.setProperty("totalUnits", iTotalUnits);
		if (this._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(this);
		}

		return this;
	};

	/**
	 * Getter to get the max date for the DateRangeSliderInternal.
	 *
	 * @return {Date} Max date
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.getMaxDate = function () {
		var dMax = null;
		switch (this._sGranularity) {
			case (DAY):
				dMax = DateUtils.incrementDateByIndex(this._dMinDate, this.getMax());
				DateUtils.resetDateToEndOfDay(dMax);
				break;

			case (MONTH):
				dMax = DateUtils.incrementMonthByIndex(this._dMinDate, this.getMax());
				DateUtils.resetDateToEndOfMonth(dMax);
				break;
			default:
				break;
		}
		return dMax;
	};

	/**
	 * Setter to set the max date for the DateRangeSliderInternal.
	 *
	 * @param {Date} dMax Max date
	 * @private
	 */
	DateRangeSliderInternal.prototype.setMaxDate = function (dMax) {
		var dMinOld = this.getMinDate();
		var dValueOld = this.getValueDate();
		var dValue2Old = this.getValue2Date();
		var bFireEvent = false;
		var iNewMax = 0, iNewValue = 0, iNewValue2 = 0;

		switch (this._sGranularity) {
			case (DAY):
				iNewMax = DateUtils.numberOfDaysApart(dMinOld, dMax);
				iNewValue = DateUtils.numberOfDaysApart(dMinOld, dValueOld);
				iNewValue2 = DateUtils.numberOfDaysApart(dMinOld, dValue2Old);
				break;
			case (MONTH):
				iNewMax = DateUtils.numberOfMonthsApart(dMinOld, dMax);
				iNewValue = DateUtils.numberOfMonthsApart(dMinOld, dValueOld);
				iNewValue2 = DateUtils.numberOfMonthsApart(dMinOld, dValue2Old);
				break;
			default:
				break;
		}

		bFireEvent = iNewValue > iNewMax || iNewValue2 > iNewMax;
		iNewValue = iNewValue > iNewMax ? iNewMax : iNewValue;
		iNewValue2 = iNewValue2 > iNewMax ? iNewMax : iNewValue2;

		this.setProperty('min', 0, true);
		this.setProperty('max', iNewMax, true);
		this.setProperty('value', iNewValue, true);
		this.setProperty('value2', iNewValue2, true);

		if (this._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(this);
		}

		if (bFireEvent) {
			var oRange = this.getDateRange();

			this.fireChange({
				value: oRange.valueDate,
				value2: oRange.value2Date
			});
		}

		return this;
	};

	/**
	 * Getter to get the min date for the DateRangeSliderInternal.
	 *
	 * @return {Date} Min date
	 * @private
	 */
	DateRangeSliderInternal.prototype.getMinDate = function () {
		var dMin = new Date(this._dMinDate);

		switch (this._sGranularity) {
			case (DAY):
				DateUtils.resetDateToStartOfDay(dMin);
				break;

			case (MONTH):
				DateUtils.resetDateToStartOfMonth(dMin);
				break;

			default:
				break;
		}

		return dMin;
	};

	/**
	 * Setter to set the min date for the DateRangeSliderInternal.
	 *
	 * @param {Date} dMin Min date
	 * @private
	 */
	DateRangeSliderInternal.prototype.setMinDate = function (dMin) {
		var dMaxOld = this.getMaxDate();
		var dValueOld = this.getValueDate();
		var dValue2Old = this.getValue2Date();
		this._dMinDate = new Date(dMin);
		var bFireEvent = false;
		var iNewMax = 0, iNewValue = 0, iNewValue2 = 0;

		switch (this._sGranularity) {
			case (DAY):
				iNewMax = DateUtils.numberOfDaysApart(dMin, dMaxOld);
				iNewValue = DateUtils.numberOfDaysApart(dMin, dValueOld);
				iNewValue2 = DateUtils.numberOfDaysApart(dMin, dValue2Old);
				break;
			case (MONTH):
				iNewMax = DateUtils.numberOfMonthsApart(dMin, dMaxOld);
				iNewValue = DateUtils.numberOfMonthsApart(dMin, dValueOld);
				iNewValue2 = DateUtils.numberOfMonthsApart(dMin, dValue2Old);
				break;
			default:
				break;
		}

		bFireEvent = iNewValue < 0 || iNewValue2 < 0;
		iNewValue = iNewValue < 0 ? 0 : iNewValue;
		iNewValue2 = iNewValue2 < 0 ? 0 : iNewValue2;

		this.setProperty('min', 0, true);
		this.setProperty('max', iNewMax, true);
		this.setProperty('value', iNewValue, true);
		this.setProperty('value2', iNewValue2, true);

		if (this._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(this);
		}

		if (bFireEvent) {
			var oRange = this.getDateRange();

			this.fireChange({
				value: oRange.valueDate,
				value2: oRange.value2Date
			});
		}

		return this;
	};

	/**
	 * Getter to get the value2 date for the DateRangeSliderInternal.
	 *
	 * @return {Date} value2 Date
	 * @private
	 */
	DateRangeSliderInternal.prototype.getValue2Date = function () {
		var dValue2 = null;

		switch (this._sGranularity) {
			case (DAY):
				dValue2 = DateUtils.incrementDateByIndex(this._dMinDate, this.getValue2());
				DateUtils.resetDateToEndOfDay(dValue2);
				break;
			case (MONTH):
				dValue2 = DateUtils.incrementMonthByIndex(this._dMinDate, this.getValue2());
				DateUtils.resetDateToEndOfMonth(dValue2);
				break;
			default:
				break;
		}

		return dValue2;
	};

	/**
	 * Setter to set the value2 date for the DateRangeSliderInternal.
	 *
	 * @param {Date} dValue2 Date
	 * @private
	 */
	DateRangeSliderInternal.prototype.setValue2Date = function (dValue2) {
		var iNewValue2 = 0;
		switch (this._sGranularity) {
			case (DAY):
				iNewValue2 = DateUtils.numberOfDaysApart(this._dMinDate, dValue2);
				break;
			case (MONTH):
				iNewValue2 = DateUtils.numberOfMonthsApart(this._dMinDate, dValue2);
				break;
			default:
				break;
		}

		this.setProperty('value2', iNewValue2, true);
		var oRange = this.getDateRange();
		this.fireChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});

		return this;
	};

	/**
	 * Getter to get the value date for the DateRangeSliderInternal.
	 *
	 * @return {Date} value Date
	 * @private
	 */
	DateRangeSliderInternal.prototype.getValueDate = function () {
		var dValue;
		switch (this._sGranularity) {
			case (DAY):
				dValue = DateUtils.incrementDateByIndex(this._dMinDate, this.getValue());
				DateUtils.resetDateToStartOfDay(dValue);
				break;
			case (MONTH):
				dValue = DateUtils.incrementMonthByIndex(this._dMinDate, this.getValue());
				DateUtils.resetDateToStartOfMonth(dValue);
				break;
			default:
				break;
		}
		return dValue;
	};

	/**
	 * Setter to set the value date for the DateRangeSliderInternal.
	 *
	 * @param {Date} dValue Date
	 * @private
	 */
	DateRangeSliderInternal.prototype.setValueDate = function (dValue) {
		var iNewValue = 0;
		switch (this._sGranularity) {
			case (DAY):
				iNewValue = DateUtils.numberOfDaysApart(this._dMinDate, dValue);
				break;
			case (MONTH):
				iNewValue = DateUtils.numberOfMonthsApart(this._dMinDate, dValue);
				break;
			default:
				break;
		}
		this.setProperty('value', iNewValue, true);
		var oRange = this.getDateRange();
		this.fireChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});

		return this;
	};

	/**
	 * Setter to set the Granularity to DAY
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.setDayGranularity = function () {
		var dMinDate = this.getMinDate();
		var dValueDate = this.getValueDate();
		var dValue2Date = this.getValue2Date();
		var dMaxDate = this.getMaxDate();
		var iNoOfDaysValueDateApartFromMinDate = DateUtils.numberOfDaysApart(dMinDate, dValueDate);
		var iNoOfDaysValue2DateApartFromMinDate = DateUtils.numberOfDaysApart(dMinDate, dValue2Date);
		var iNoOfDaysMaxDateApartFromMinDate = DateUtils.numberOfDaysApart(dMinDate, dMaxDate);

		this.setProperty('min', 0, true);
		this.setProperty('value', iNoOfDaysValueDateApartFromMinDate, true);
		this.setProperty('value2', iNoOfDaysValue2DateApartFromMinDate, true);
		this.setProperty('max', iNoOfDaysMaxDateApartFromMinDate, true);

		this._sGranularity = DAY;

		if (this._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(this);
		}

		var oRange = this.getDateRange();
		this.fireChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});

		return this;
	};

	/**
	 * Setter to set the Granularity to MONTH
	 *
	 * @private
	 */
	DateRangeSliderInternal.prototype.setMonthGranularity = function () {
		var dMinDate = this.getMinDate();
		var dValueDate = this.getValueDate();
		var dValue2Date = this.getValue2Date();
		var dMaxDate = this.getMaxDate();

		var iNoOfMonthsValueDateApartFromMinDate = DateUtils.numberOfMonthsApart(dMinDate, dValueDate);
		var iNoOfMonthsValue2DateApartFromMinDate = DateUtils.numberOfMonthsApart(dMinDate, dValue2Date);
		var iNoOfMonthsMaxDateApartFromMinDate = DateUtils.numberOfMonthsApart(dMinDate, dMaxDate);

		this.setProperty('min', 0, true);
		this.setProperty('value', iNoOfMonthsValueDateApartFromMinDate, true);
		this.setProperty('value2', iNoOfMonthsValue2DateApartFromMinDate, true);
		this.setProperty('max', iNoOfMonthsMaxDateApartFromMinDate, true);

		this._sGranularity = MONTH;

		DateUtils.resetDateToStartOfMonth(this._dMinDate);

		if (this._bUsingDefaultLabels) {
			DateRangeSliderInternal.createRailLabels(this);
		}

		var oRange = this.getDateRange();
		this.fireChange({
			value: oRange.valueDate,
			value2: oRange.value2Date
		});

		return this;
	};

	/**
	 * Function is called when DateRangeSliderInternal grip or grip2 is moved, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.handleMove = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.handleMove.apply(this, [oEvent]);
		}
	};

	/**
	 * Function is called when End key pressed, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onsapend = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.onsapend.apply(this, [oEvent]);
		}

	};

	/**
	 * Function is called when Home key pressed, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onsaphome = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.onsaphome.apply(this, [oEvent]);
		}

	};

	/**
	 * Function is called when Ctrl+right key pressed, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onsaprightmodifiers = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.onsaprightmodifiers.apply(this, [oEvent]);
		}

	};

	/**
	 * Function is called when Ctrl+left key pressed, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onsapleftmodifiers = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.onsapleftmodifiers.apply(this, [oEvent]);
		}

	};

	/**
	 * Function is called when right key pressed, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onsapright = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.onsapright.apply(this, [oEvent]);
		}

	};

	/**
	 * Function is called when left key pressed, over-write base RangeSlider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onsapleft = function (oEvent) {
		if ((this.oMovingGrip === this.oGrip2 && !this.getPinGrip2()) || (this.oMovingGrip === this.oGrip && !this.getPinGrip())) {
			RangeSlider.prototype.onsapleft.apply(this, [oEvent]);
		}

	};

	/**
	 * Function is called when DateRangeSliderInternal is clicked. over-write base Slider function based on pinGrip and pinGrip2
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSliderInternal.prototype.onclick = function (oEvent) {
		var oMovingGrip = this.oMovingGrip;
		if (this.getEditable() && this.getEnabled()) {
			var fMultiplicator;

			// Check for ID where the behavior depends on the clicked area.
			var sMyTargetId = oEvent.target.getAttribute('ID');

			var fNewValue = this.getValue();
			var iNewPos = this.getOffsetLeft(this.oGrip) + this.iShiftGrip;

			switch (sMyTargetId) {
				case (this.oBar.id):
				case (this.oHiLi.id):
					// Click on slide bar
					if (this.getVertical()) {
						fMultiplicator = this.getBarWidth() - this.getOffsetX(oEvent);
					} else {
						fMultiplicator = this.getOffsetX(oEvent);
					}
					if (sMyTargetId === this.oHiLi.id) {
						if (this.getVertical()) {
							fMultiplicator -= this.getOffsetLeft(this.oHiLi);
						} else {
							fMultiplicator += this.getOffsetLeft(this.oHiLi);
						}
					}
					fNewValue = this.convertRtlValue(this.getMin() + (((this.getMax() - this.getMin()) / this.getBarWidth()) * fMultiplicator));
					iNewPos = this.getOffsetX(oEvent);
					if (sMyTargetId === this.oHiLi.id) {
						iNewPos += this.getOffsetLeft(this.oHiLi);
					}
					if (this.oStartTarget && this.targetIsGrip(this.oStartTarget.id)) {
						oMovingGrip = this.oStartTarget;
					} else if (this.targetIsGrip(sMyTargetId)) {
						oMovingGrip = oEvent.target;
					} else {
						oMovingGrip = this.getNearestGrip(iNewPos);
					}
					break;
				case (this.getId() + '-left'):
					// Click on left end
					iNewPos = 0;
					if (this.getVertical()) {
						fNewValue = this.getMax();
						oMovingGrip = this.getRightGrip();
					} else {
						fNewValue = this.getMin();
						oMovingGrip = this.getLeftGrip();
					}
					break;
				case (this.getId() + '-right'):
					// Click on right end
					iNewPos = this.getBarWidth();
					if (!this.getVertical()) {
						fNewValue = this.getMax();
						oMovingGrip = this.getRightGrip();
					} else {
						fNewValue = this.getMin();
						oMovingGrip = this.getLeftGrip();
					}
					break;
				default:
					// If target is grip return
					// Not implemented as case because RangeSlider has multiple grips, for which cases cannot be inserted afterwards
					if (this.targetIsGrip(sMyTargetId)) {
						return;
					}
					// Check whether tick is clicked
					var iTickPos = sMyTargetId.search('-tick');
					if (iTickPos >= 0) {
						var iTickNum = parseInt(sMyTargetId.slice(this.getId().length + 5), 10);
						iNewPos = this.fTickDist * iTickNum;
						fNewValue = this.convertRtlValue(this.getMin() + (((this.getMax() - this.getMin()) / this.getTotalUnits()) * iTickNum));
						if (this.oStartTarget && this.targetIsGrip(this.oStartTarget.id)) {
							oMovingGrip = this.oStartTarget;
						} else if (this.targetIsGrip(sMyTargetId)) {
							oMovingGrip = oEvent.target;
						} else {
							oMovingGrip = this.getNearestGrip(iNewPos);
						}
						break;
					}

					// Outer DIV clicked -> ID given by caller. This is the case if all other DIVs are smaller,
					// or if tick text is clicked
					var iOffsetBar = jQuery(this.oBar).offset();
					var iOffsetMe = jQuery(oEvent.target).offset();
					if (this.getVertical()) {
						iNewPos = this.getOffsetX(oEvent) - (iOffsetBar.top - iOffsetMe.top);
					} else {
						iNewPos = this.getOffsetX(oEvent) - (iOffsetBar.left - iOffsetMe.left);
					}
					if (iNewPos <= 0) {
						iNewPos = 0;
						if (this.getVertical()) {
							fNewValue = this.getMax();
						} else {
							fNewValue = this.getMin();
						}
					} else if (iNewPos >= this.getBarWidth()) {
						iNewPos = this.getBarWidth();
						if (this.getVertical()) {
							fNewValue = this.getMin();
						} else {
							fNewValue = this.getMax();
						}
					} else {
						if (this.getVertical()) {
							fMultiplicator = this.getBarWidth() - iNewPos;
						} else {
							fMultiplicator = iNewPos;
						}
						fNewValue = this.getMin() + (((this.getMax() - this.getMin()) / this.getBarWidth()) * fMultiplicator);
					}
					fNewValue = this.convertRtlValue(fNewValue);
					if (this.oStartTarget && this.targetIsGrip(this.oStartTarget.id)) {
						oMovingGrip = this.oStartTarget;
					} else if (this.targetIsGrip(sMyTargetId)) {
						oMovingGrip = oEvent.target;
					} else {
						oMovingGrip = this.getNearestGrip(iNewPos);
					}
					break;
			}

			if ((oMovingGrip === this.oGrip2 && this.getPinGrip2()) || (oMovingGrip === this.oGrip && this.getPinGrip())) {
				return;
			}

			var validation = this.validateNewPosition(fNewValue, iNewPos, oMovingGrip, (this.getValueForGrip(oMovingGrip) > fNewValue));
			fNewValue = validation.fNewValue;
			iNewPos = validation.iNewPos;

			this.changeGrip(fNewValue, iNewPos, oMovingGrip);
			this.handleFireChange();
		}
		// Set focus to grip
		oMovingGrip.focus();
		this.oMovingGrip = oMovingGrip;
		this.oStartTarget = null;
	};

	DateRangeSliderInternal.prototype.onkeydown = function (oEvent) {
		this.oMovingGrip.setAttribute('aria-busy', 'true');
	};

	DateRangeSliderInternal.prototype.onkeyup = function (oEvent) {
		this.oMovingGrip.setAttribute('aria-busy', 'false');
	};

	return DateRangeSliderInternal;
});
