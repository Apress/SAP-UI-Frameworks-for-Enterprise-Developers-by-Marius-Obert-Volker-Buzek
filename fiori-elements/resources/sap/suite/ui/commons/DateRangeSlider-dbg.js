/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.DateRangeSlider.
sap.ui.define([ './library', './util/DateUtils', 'sap/ui/core/Control', 'sap/suite/ui/commons/DateRangeSliderInternal', "sap/base/Log", "./DateRangeSliderRenderer" ],
	function(library, DateUtils, Control, DateRangeSliderInternal, Log, DateRangeSliderRenderer) {
	"use strict";

	/**
	 * Constructor for a new DateRangeSlider.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The Date Range Slider provides the user with a Range Slider control that is optimized for use with Dates.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Not Fiori.
	 * @alias sap.suite.ui.commons.DateRangeSlider
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateRangeSlider = Control.extend("sap.suite.ui.commons.DateRangeSlider", /** @lends sap.suite.ui.commons.DateRangeSlider.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Width of the horizontal date range slider.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: '100%'},

				/**
				 * This property switches the enabled state of the control. Disabled fields have different colors, and can not be focused.
				 */
				enabled: {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * This property switches the enabled state of the control. Using the date range slider interactively requires this property to be true.
				 */
				editable: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * This property switches the visible state of the control. Invisible date range slider are not rendered.
				 */
				visible: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Property to show or hide bubbles. Default is true.
				 */
				showBubbles: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * The grips of the control can only be moved in steps of this width.
				 */
				smallStepWidth: {type: "float", group: "Appearance", defaultValue: null},

				/**
				 * Number of units between ticks.
				 */
				totalUnits: {type: "int", group: "Appearance", defaultValue: null},

				/**
				 * Display a date label above each tick.
				 */
				stepLabels: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Labels to be displayed instead of dates.
				 */
				labels: {type: "string[]", group: "Misc", defaultValue: null},

				/**
				 * Minimum date for the slider.
				 */
				min: {type: "object", group: "Behavior", defaultValue: null},

				/**
				 * Maximum date for the slider.
				 */
				max: {type: "object", group: "Behavior", defaultValue: null},

				/**
				 * Date value of the left grip.
				 */
				value: {type: "object", group: "Behavior", defaultValue: null},

				/**
				 * Date value of the right grip.
				 */
				value2: {type: "object", group: "Behavior", defaultValue: null},

				/**
				 * Pin the left grip so that user cannot move it with the keyboard or mouse.
				 */
				pinGrip: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Pin the right grip so that user cannot move it with the keyboard or mouse.
				 */
				pinGrip2: {type: "boolean", group: "Misc", defaultValue: false}
			},
			events: {

				/**
				 * This event is fired when user changes completes the selection of a new date using a grip. It contains the Date object value of each grip such that the left grip value is held by the value property and the right grip value is held by the value2 property.
				 */
				change: {},

				/**
				 * This live event is fired as the user slides a grip with the mouse. It contains the Date object value of each grip such that the left grip value is held by the value property and the right grip value is held by the value2 property.
				 */
				liveChange: {}
			}
		}
	});

	var DAY = "d";
	var MONTH = "m";

	/**
	 * Initialize the DateRangeSlider.
	 *
	 * @private
	 */
	DateRangeSlider.prototype.init = function() {
		this._oDateRangeSliderInternal = new DateRangeSliderInternal({
			id: this.getId() + "-dateRangeSliderInternal"
		});
		DateRangeSlider.setPropertiesBasedOnSliderInternal(this);

		this._oDateRangeSliderInternal.attachChange(function(oEvent) {

			this.handleChange(oEvent);
		}, this);

		this._oDateRangeSliderInternal.attachLiveChange(function(oEvent) {

			this.handleLiveChange(oEvent);
		}, this);
	};

	/**
	 * Validate if dFirstDate and dSecondDate are same day for Granularity=day or if they are same months for Granularity=month
	 *
	 * @param {Date} dFirstDate The first date.
	 * @param {Date} dSecondDate The second date.
	 * @param {string} sGranularity The Granularity - day as "d" or month as "m".
	 * @returns {boolean} True if two dates are same based on Granularity otherwise false
	 * @private
	 */

	DateRangeSlider.areDaysSameBasedOnGranularity = function(dFirstDate, dSecondDate, sGranularity) {
		var bSame;
		switch (sGranularity) {
			case (DAY):
				bSame = DateUtils.dateDaysEqual(dFirstDate, dSecondDate);
				break;
			case (MONTH):
				bSame = DateUtils.dateMonthsEqual(dFirstDate, dSecondDate);
				break;
			default:
				bSame = false;
		}
		return bSame;
	};

	/**
	 * Validate date value min and max. The max date must be after min date: max > min.
	 *
	 * @param {Date} dMin The min date.
	 * @param {Date} dMax The max date.
	 * @param {string} sGranularity The Granularity - day as "d" or month as "m".
	 * @returns {boolean} True if min date is before max date.
	 * @private
	 */
	DateRangeSlider.isMinBeforeMax = function(dMin, dMax, sGranularity) {

		var bMinBfrMax = false;

		if (dMin.getFullYear() < dMax.getFullYear()) {
			bMinBfrMax = true;
		} else if (dMin.getFullYear() === dMax.getFullYear()) {
			if (dMin.getMonth() < dMax.getMonth()) {
				bMinBfrMax = true;
			} else if (dMin.getMonth() === dMax.getMonth() && sGranularity === DAY) {
				if (dMin.getDate() < dMax.getDate()) {
					bMinBfrMax = true;
				}
			}
		}

		if (!bMinBfrMax) {
			Log.error("DateRangeSlider: Min Date = " + dMin + " should be before Max Date = " + dMax);
		}

		return bMinBfrMax;
	};

	/**
	 * Validate value date >= min date.
	 *
	 * @param {Date} dMin The min date.
	 * @param {Date} dValue The value date.
	 * @param {string} sGranularity The Granularity - day as "d" or month as "m".
	 * @returns {boolean} True if value date is equal or after min date.
	 * @private
	 */
	DateRangeSlider.isValueEqualOrAfterMin = function(dMin, dValue, sGranularity) {

		var bValueEqualOrAfterMin = false;

		if (dMin.getFullYear() < dValue.getFullYear()) {
			bValueEqualOrAfterMin = true;
		} else if (dMin.getFullYear() === dValue.getFullYear()) {
			if (dMin.getMonth() < dValue.getMonth()) {
				bValueEqualOrAfterMin = true;
			} else if (dMin.getMonth() === dValue.getMonth() && sGranularity === MONTH) {
				bValueEqualOrAfterMin = true;
			} else if (dMin.getMonth() === dValue.getMonth() && sGranularity === DAY) {
				if (dMin.getDate() <= dValue.getDate()) {
					bValueEqualOrAfterMin = true;
				}
			}
		}

		if (!bValueEqualOrAfterMin) {
			Log.error("DateRangeSlider: Value Date = " + dValue + " should be after or equal to Min Date = " + dMin);
		}

		return bValueEqualOrAfterMin;
	};

	/**
	 * Validate value2 date <= max date.
	 *
	 * @param {Date} dValue2 The value2 date.
	 * @param {Date} dMax The max date.
	 * @param {string} sGranularity The Granularity - day as "d" or month as "m".
	 * @returns {boolean} True if value2 date is equal to before max date.
	 * @private
	 */
	DateRangeSlider.isValue2EqualOrBeforeMax = function(dValue2, dMax, sGranularity) {

		var bValue2EqualOrBeforeMax = false;

		if (dValue2.getFullYear() < dMax.getFullYear()) {
			bValue2EqualOrBeforeMax = true;
		} else if (dValue2.getFullYear() === dMax.getFullYear()) {
			if (dValue2.getMonth() < dMax.getMonth()) {
				bValue2EqualOrBeforeMax = true;
			} else if (dValue2.getMonth() === dMax.getMonth() && sGranularity === MONTH) {
				bValue2EqualOrBeforeMax = true;
			} else if (dValue2.getMonth() === dMax.getMonth() && sGranularity === DAY) {
				if (dValue2.getDate() <= dMax.getDate()) {
					bValue2EqualOrBeforeMax = true;
				}
			}
		}

		if (!bValue2EqualOrBeforeMax) {
			Log.error("DateRangeSlider: Value2 Date = " + dValue2 + " should be before or equal to Max Date = " + dMax);
		}

		return bValue2EqualOrBeforeMax;
	};

	/**
	 * Validate value date <= value2 date.
	 *
	 * @param {Date} dValue The value date.
	 * @param {Date} dValue2 The value2 date.
	 * @param {string} sGranularity The Granularity - day as "d" or month as "m".
	 * @returns {boolean} True if dValue2 date is equal or after value date.
	 * @private
	 */
	DateRangeSlider.isValueBeforeOrEqualValue2 = function(dValue, dValue2, sGranularity) {

		var bValueBeforeOrEqualValue2 = false;

		if (dValue.getFullYear() < dValue2.getFullYear()) {
			bValueBeforeOrEqualValue2 = true;
		} else if (dValue.getFullYear() === dValue2.getFullYear()) {
			if (dValue.getMonth() < dValue2.getMonth()) {
				bValueBeforeOrEqualValue2 = true;
			} else if (dValue.getMonth() === dValue2.getMonth() && sGranularity === MONTH) {
				bValueBeforeOrEqualValue2 = true;
			} else if (dValue.getMonth() === dValue2.getMonth() && sGranularity === DAY) {
				if (dValue.getDate() <= dValue2.getDate()) {
					bValueBeforeOrEqualValue2 = true;
				}
			}
		}

		if (!bValueBeforeOrEqualValue2) {
			Log.error("DateRangeSlider: Value Date = " + dValue + " should be before or equal to Value2 Date = " + dValue2);
		}

		return bValueBeforeOrEqualValue2;
	};

	/**
	 * Set min property for the DateRangeSlider. This sets the minimum date for the slider.
	 *
	 * @param {Date} dMin The min date.
	 * @public
	 */
	DateRangeSlider.prototype.setMin = function(dMin) {

		if (DateUtils.isValidDate(dMin) && DateRangeSlider.isMinBeforeMax(dMin, new Date(this.getMax()), this._sGranularity)
			&& !DateRangeSlider.areDaysSameBasedOnGranularity(new Date(this.getMin()), dMin, this._sGranularity)) {

			DateUtils.resetDateToStartOfDay(dMin);
			this._oDateRangeSliderInternal.setMinDate(dMin);
			DateRangeSlider.setPropertiesBasedOnSliderInternal(this);
		}

		return this;
	};

	/**
	 * Set max property for the DateRangeSlider. This sets the maximum date for the slider.
	 *
	 * @param {Date} dMax The max date.
	 * @public
	 */
	DateRangeSlider.prototype.setMax = function(dMax) {

		if (DateUtils.isValidDate(dMax) && DateRangeSlider.isMinBeforeMax(new Date(this.getMin()), dMax, this._sGranularity)
			&& !DateRangeSlider.areDaysSameBasedOnGranularity(new Date(this.getMax()), dMax, this._sGranularity)) {

			DateUtils.resetDateToEndOfDay(dMax);
			this._oDateRangeSliderInternal.setMaxDate(dMax);
			DateRangeSlider.setPropertiesBasedOnSliderInternal(this);
		}

		return this;
	};

	/**
	 * Set value property for the DateRangeSlider. This sets the value date for the slider.
	 *
	 * @param {Date} dValue The value date.
	 * @public
	 */
	DateRangeSlider.prototype.setValue = function(dValue) {

		if (DateUtils.isValidDate(dValue)
			&& DateRangeSlider.isValueBeforeOrEqualValue2(dValue, new Date(this.getValue2()), this._sGranularity)
			&& DateRangeSlider.isValueEqualOrAfterMin(new Date(this.getMin()), dValue, this._sGranularity)
			&& !DateRangeSlider.areDaysSameBasedOnGranularity(new Date(this.getValue()), dValue, this._sGranularity)) {

			DateUtils.resetDateToStartOfDay(dValue);
			this._oDateRangeSliderInternal.setValueDate(dValue);
			DateRangeSlider.setPropertiesBasedOnSliderInternal(this);
		}

		return this;
	};

	DateRangeSlider.prototype.getValue = function() {

		var dValue = this._oDateRangeSliderInternal.getValueDate();
		return dValue;
	};

	DateRangeSlider.prototype.setValue2 = function(dValue2) {

		if (DateUtils.isValidDate(dValue2)
			&& DateRangeSlider.isValueBeforeOrEqualValue2(new Date(this.getValue()), dValue2, this._sGranularity)
			&& !DateRangeSlider.areDaysSameBasedOnGranularity(new Date(this.getValue2()), dValue2, this._sGranularity)
			&& DateRangeSlider.isValue2EqualOrBeforeMax(dValue2, new Date(this.getMax()), this._sGranularity)) {

			DateUtils.resetDateToStartOfDay(dValue2);
			this._oDateRangeSliderInternal.setValue2Date(dValue2);
			DateRangeSlider.setPropertiesBasedOnSliderInternal(this);
		}

		return this;
	};

	DateRangeSlider.prototype.getValue2 = function() {

		var dValue2 = this._oDateRangeSliderInternal.getValue2Date();
		return dValue2;
	};

	DateRangeSlider.prototype.setVisible = function(bVisible) {
		this._oDateRangeSliderInternal.setVisible(bVisible);
		this.setProperty("visible", bVisible);

		return this;
	};

	DateRangeSlider.prototype.setEnabled = function(bEnabled) {
		this._oDateRangeSliderInternal.setEnabled(bEnabled);
		this.setProperty("enabled", bEnabled);

		return this;
	};

	DateRangeSlider.prototype.setLabels = function(aLabels) {
		this._oDateRangeSliderInternal.setLabels(aLabels);
		this.setProperty("labels", aLabels);

		return this;
	};

	DateRangeSlider.prototype.setStepLabels = function(bStepLabels) {
		this._oDateRangeSliderInternal.setStepLabels(bStepLabels);
		this.setProperty("stepLabels", bStepLabels);

		return this;
	};

	DateRangeSlider.prototype.setEditable = function(bEditable) {
		this._oDateRangeSliderInternal.setEditable(bEditable);
		this.setProperty("editable", bEditable);

		return this;
	};

	DateRangeSlider.prototype.setWidth = function(tWidth) {
		this._oDateRangeSliderInternal.setWidth(tWidth);
		this.setProperty("width", tWidth);

		return this;
	};

	DateRangeSlider.prototype.setShowBubbles = function(bShowBubbles) {
		this._oDateRangeSliderInternal.setShowBubbles(bShowBubbles);
		this.setProperty("showBubbles", bShowBubbles);

		return this;
	};

	DateRangeSlider.prototype.setSmallStepWidth = function(fSmallStepWidth) {
		this._oDateRangeSliderInternal.setSmallStepWidth(fSmallStepWidth);
		this.setProperty("smallStepWidth", fSmallStepWidth);

		return this;
	};

	DateRangeSlider.prototype.setTotalUnits = function(iTotalUnits) {
		this._oDateRangeSliderInternal.setTotalUnits(iTotalUnits);
		this.setProperty("totalUnits", iTotalUnits);

		return this;
	};

	/**
	 * Set 4 base properties min, max, value and value2 for given DateRangeSlider
	 *
	 * @param {sap.suite.ui.commons.DateRangeSlider} oDateRangeSlider Instance with 4 base properties (min, max, value and value2).
	 * @private
	 */
	DateRangeSlider.setPropertiesBasedOnSliderInternal = function(oDateRangeSlider) {
		oDateRangeSlider.setProperty("min", oDateRangeSlider._oDateRangeSliderInternal.getMinDate());
		oDateRangeSlider.setProperty("max", oDateRangeSlider._oDateRangeSliderInternal.getMaxDate());
		oDateRangeSlider.setProperty("value", oDateRangeSlider._oDateRangeSliderInternal.getValueDate());
		oDateRangeSlider.setProperty("value2", oDateRangeSlider._oDateRangeSliderInternal.getValue2Date());
		oDateRangeSlider._sGranularity = oDateRangeSlider._oDateRangeSliderInternal._sGranularity;

		return this;
	};

	/**
	 * Set Date Range Slider Granularity to Day
	 *
	 * @returns {sap.suite.ui.commons.DateRangeSlider} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeSlider.prototype.setDayGranularity = function() {
		this._oDateRangeSliderInternal.setDayGranularity();
		if (this._oDateRangeSliderInternal.isActive()) {
			this._oDateRangeSliderInternal.rerender();
		}
		DateRangeSlider.setPropertiesBasedOnSliderInternal(this);
		return this;
	};

	/**
	 * Set Date Range Slider Granularity to Month
	 *
	 * @returns {sap.suite.ui.commons.DateRangeSlider} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeSlider.prototype.setMonthGranularity = function() {
		var iMonthsApart = DateUtils.numberOfMonthsApart(this.getMin(), this.getMax());
		if (iMonthsApart >= 1) {
			this._oDateRangeSliderInternal.setMonthGranularity();
			if (this._oDateRangeSliderInternal.isActive()) {
				this._oDateRangeSliderInternal.rerender();
			}
			DateRangeSlider.setPropertiesBasedOnSliderInternal(this);
		} else {
			Log.error("DateRangeSlider.setMonthGranularity(): Max Date should be 1 month after Min Date.");
		}
		return this;
	};

	/**
	 * Setter for dateFormat which is used to format the dates for Labels, bubble texts, and tool tips. If passed object is null or is of incorrect type,
	 * _oDateRangeSliderInternal's default formatting will be used.
	 *
	 * @param {sap.ui.core.format.DateFormat} oDateFormat Date format which is used to format the dates.
	 * @public
	 */
	DateRangeSlider.prototype.setDateFormat = function(oDateFormat) {
		this._oDateRangeSliderInternal.setDateFormat(oDateFormat);
		if (this._oDateRangeSliderInternal.isActive()) {
			this._oDateRangeSliderInternal.rerender();
		}

		return this;
	};

	DateRangeSlider.prototype.setPinGrip = function(bPinGrip) {
		this._oDateRangeSliderInternal.setPinGrip(bPinGrip);
		this.setProperty("pinGrip", bPinGrip);

		return this;
	};

	DateRangeSlider.prototype.setPinGrip2 = function(bPinGrip2) {
		this._oDateRangeSliderInternal.setPinGrip2(bPinGrip2);
		this.setProperty("pinGrip2", bPinGrip2);

		return this;
	};

	DateRangeSlider.prototype.exit = function() {
		this._oDateRangeSliderInternal.destroy();
		this._oDateRangeSliderInternal = null;
	};

	/**
	 * Handles the change event of _oDateRangeSliderInternal and fires the change event with start and end date values
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSlider.prototype.handleChange = function(oEvent) {
		var dValueDate = oEvent.getParameter("value");
		var dValue2Date = oEvent.getParameter("value2");
		this.fireChange({
			value: dValueDate,
			value2: dValue2Date
		});
	};

	/**
	 * Handles the live change event of _oDateRangeSliderInternal and fires the change event with start and end date values
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeSlider.prototype.handleLiveChange = function(oEvent) {
		var dValueDate = oEvent.getParameter("value");
		var dValue2Date = oEvent.getParameter("value2");
		this.fireLiveChange({
			value: dValueDate,
			value2: dValue2Date
		});
	};

	return DateRangeSlider;

});
