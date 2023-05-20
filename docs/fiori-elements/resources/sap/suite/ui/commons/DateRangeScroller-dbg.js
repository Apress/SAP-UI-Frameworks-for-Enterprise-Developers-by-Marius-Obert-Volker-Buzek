/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.DateRangeScroller.
sap.ui.define([
	'./library',
	'sap/ui/commons/library',
	'./util/DateUtils',
	'sap/ui/commons/Label',
	'sap/ui/core/Control',
	'sap/ui/core/format/DateFormat',
	"sap/base/Log",
	"./DateRangeScrollerRenderer"
], function (library, CommonsLibrary, DateUtils, Label, Control, DateFormat, Log, DateRangeScrollerRenderer) {
	"use strict";

	/**
	 * Constructor for a new DateRangeScroller.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The DateRangeScroller provides a method to scroll through a series of time periods, each of which is represented by a starting date and an ending date, known as the date range. The user may scroll to the previous or next date range. Several predefined ranges are supported such as day, week, work week, month, and year.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Not Fiori.
	 * @alias sap.suite.ui.commons.DateRangeScroller
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateRangeScroller = Control.extend("sap.suite.ui.commons.DateRangeScroller", /** @lends sap.suite.ui.commons.DateRangeScroller.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			associations: {

				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			},
			events: {

				/**
				 * This event is fired whenever the date range is changed.
				 */
				change: {
					parameters: {

						/**
						 * Object containing startDate and endDate Date properties signifying the start and ending dates of the currently selected range.
						 */
						dateRange: {type: "any"}
					}
				}
			}
		}
	});

	/* Internal values for date range types. */
	var DAY = "d";
	var WEEK = "w";
	var MONTH = "m";
	var YEAR = "y";
	var CUSTOM = "c";
	var iWeekStepSize = 7;

	/**
	 * Format start and end date according to default formatting option and current date range
	 *
	 * @param {string} sRangeType Defines the date range type for formatting
	 * @param {Object} oDateRange Object contains start and end date for current date range
	 * @param {Date} oDateRange.startDate The start date.
	 * @param {Date} oDateRange.endDate The end date.
	 * @param {sap.ui.core.format.DateFormat} oDateFormat The date format to use for formatting
	 * @returns {string} Formatted date range as string.
	 * @private
	 */
	DateRangeScroller.getFormattedDate = function (sRangeType, oDateRange, oDateFormat) {
		var oDateFormatter;
		var sFormattedDateRange;

		switch (sRangeType) {
			case (DAY):
				oDateFormatter = oDateFormat || DateFormat.getDateInstance({
					pattern: "MMMM d, YYYY"
				});
				sFormattedDateRange = oDateFormatter.format(oDateRange.startDate, false);
				break;
			case (WEEK):
			case (CUSTOM):
				var oStartDateFormat = oDateFormat || DateFormat.getDateInstance({
					pattern: 'MMMM d'
				});
				var oEndDateFormat = oDateFormat || DateFormat.getDateInstance({
					pattern: 'MMMM d, YYYY'
				});
				if (oDateRange.startDate.getYear() !== oDateRange.endDate.getYear()) {
					oStartDateFormat = oEndDateFormat;
				} else if (oDateRange.startDate.getMonth() === oDateRange.endDate.getMonth()) {
					oEndDateFormat = oDateFormat || DateFormat.getDateInstance({
						pattern: 'd, YYYY'
					});
				}
				var sStartDate = oStartDateFormat.format(oDateRange.startDate, false);
				var sEndDate = oEndDateFormat.format(oDateRange.endDate, false);
				sFormattedDateRange = sStartDate + " - " + sEndDate;
				break;
			case (MONTH):
				oDateFormatter = oDateFormat || DateFormat.getDateInstance({
					pattern: 'MMMM YYYY'
				});
				sFormattedDateRange = oDateFormatter.format(oDateRange.startDate, false);
				break;
			case (YEAR):
				oDateFormatter = oDateFormat || DateFormat.getDateInstance({
					pattern: 'YYYY'
				});
				sFormattedDateRange = oDateFormatter.format(oDateRange.startDate, false);
				break;
			default:
				sFormattedDateRange = oDateRange.startDate + " - " + oDateRange.endDate;
				break;
		}

		return sFormattedDateRange;
	};

	/**
	 * Update the date range value in the label control and rerender.
	 * @param {string} sRangeType Date range type
	 * @param {Object} oDateRange The date range
	 * @param {Object} oRangeLabel The date range label
	 * @param {Object} oDateFormat The date format
	 * @private
	 */
	DateRangeScroller.updateDateRangeValue = function (sRangeType, oDateRange, oRangeLabel, oDateFormat) {
		oRangeLabel.setText(DateRangeScroller.getFormattedDate(sRangeType, oDateRange, oDateFormat));
		if (oRangeLabel.isActive()) { // Don't rerender if the control is not placed in the DOM
			oRangeLabel.rerender();
		}
	};

	/**
	 * Add <code>iStep</code> days to the given date. A negative step value moves the date backward in time.
	 * @param {Date} dDate Date which will be adjusted
	 * @param {int} iStep Size of steps
	 * @private
	 */
	DateRangeScroller.adjustDateByStep = function (dDate, iStep) {
		if (iStep === 0) {
			return;
		}
		dDate.setDate(dDate.getDate() + iStep);
	};

	/**
	 * Adjust the start/end dates by the given step.
	 * @param {Object} oRange Range which will be adjusted
	 * @param {int} iStep Size of steps
	 * @private
	 */
	DateRangeScroller.adjustRangeByStep = function (oRange, iStep) {
		var dStartDate = oRange.startDate;
		var dEndDate = oRange.endDate;
		dStartDate.setDate(dStartDate.getDate() + iStep);
		dEndDate.setDate(dEndDate.getDate() + iStep);
	};

	/**
	 * Test if the given duration is a positive, non-infinite integer. The duration must be less than the upper limit if a limit is specified. A duration of undefined returns true.
	 * @param {int} iDuration The duration
	 * @param {int} iUpperLimit The upper limit for the duration
	 * @returns {boolean} True if duration is valid, false if not.
	 * @private
	 */
	DateRangeScroller.isValidDuration = function (iDuration, iUpperLimit) {
		var bValidDuration = false;

		if (iDuration === undefined) {
			bValidDuration = true;
		} else if (!isNaN(iDuration) && isFinite(iDuration)) {

			if ((iDuration >= 1) && (!iUpperLimit || iDuration <= iUpperLimit)) {
				bValidDuration = true;
			}
		}

		if (!bValidDuration) {
			Log.error("DateRangeScroller duration value ='" + iDuration + "' is invalid.");
		}

		return bValidDuration;
	};

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	DateRangeScroller.prototype.init = function () {
		this._sRangeType = DAY;
		this._iCustomDuration = 1;
		this._oDateFormat = null;

		this._oDateRangeLabel = new Label(this.getId() + "-dateRangeLabel", {
			labelFor: this.getId()
		});
		this._oDateRangeLabel.addStyleClass("sapSuiteUiCommonsDateRangeScrollerLabel");

		var dStart = new Date();
		DateUtils.resetDateToStartOfDay(dStart);
		var dEnd = new Date();
		DateUtils.resetDateToEndOfDay(dEnd);
		this._oDateRange = {
			startDate: dStart,
			endDate: dEnd
		};
		DateRangeScroller.updateDateRangeValue(DAY, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
	};

	/**
	 * Set a date range equal to a single day, starting with the given initial date.
	 *
	 * @param {Date} dInitialDate The initial date.
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeScroller.prototype.setDateRangeDay = function (dInitialDate) {
		if (DateUtils.isValidDate(dInitialDate)) {
			this._oDateRange.startDate.setTime(dInitialDate.getTime());
			this._oDateRange.endDate.setTime(dInitialDate.getTime());
			DateUtils.resetDateToStartOfDay(this._oDateRange.startDate);
			DateUtils.resetDateToEndOfDay(this._oDateRange.endDate);
			DateRangeScroller.updateDateRangeValue(DAY, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
			this._sRangeType = DAY;
		}
		return this;
	};

	/**
	 * Set a date range that steps one week at a time. The starting date is set according to the first day of the week (default is Monday) and the initial date. For example, if the
	 * first day of the week is set to Tuesday and the initial date is Wednesday, January 9, 2013, then the starting date will be Tuesday, January 8, 2013.
	 *
	 * The last day of the range is calculated by adding (duration - 1) days to the starting date.
	 * @param {Date} dInitialDate Any date that falls on the desired week. Start/end dates will be adjusted according to the first day of the week.
	 * @param {Object} [oSettings] Settings for the object
	 * @param {int} [oSettings.duration=7] The number of days in the range with a minimum of 1 and maximum of 7.
	 * @param {int} [oSettings.iFirstDayOfWeek=1] The starting day for the range. Valid values are 0-6, with 0=Sunday and 6=Saturday.
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeScroller.prototype.setDateRangeWeek = function (dInitialDate, oSettings) {
		var iDuration = iWeekStepSize;
		var iFirstDayOfWeek = 1;
		if (oSettings) {
			iDuration = oSettings.duration;
			iFirstDayOfWeek = oSettings.firstDayOfWeek;
		}

		if (iDuration === undefined) {
			iDuration = iWeekStepSize;
		} else if (iDuration && !isNaN(iDuration)) {
			iDuration = parseInt(iDuration, 10);
		}

		if (iFirstDayOfWeek === undefined) {
			iFirstDayOfWeek = 1;
		} else if (iFirstDayOfWeek && !isNaN(iFirstDayOfWeek)) {
			iFirstDayOfWeek = parseInt(iFirstDayOfWeek, 10);
		}

		// If first day of week is specified (defined), but invalid, do not proceed even if the passed start date is valid.
		if ((iFirstDayOfWeek === null) || iFirstDayOfWeek === "" || isNaN(iFirstDayOfWeek) || iFirstDayOfWeek < 0 || iFirstDayOfWeek > 6) {

			Log.error("DateRangeScroller oSettings.firstDayOfWeek value ='" + oSettings.firstDayOfWeek + "' is invalid.");

		} else if (DateUtils.isValidDate(dInitialDate) && DateRangeScroller.isValidDuration(iDuration, iWeekStepSize)) {
			this._oDateRange.startDate.setTime(dInitialDate.getTime());
			this._oDateRange.endDate.setTime(dInitialDate.getTime());

			var duration = iDuration;
			var firstDay = iFirstDayOfWeek;
			DateUtils.resetDateToStartOfWeek(this._oDateRange.startDate, iFirstDayOfWeek);
			DateUtils.resetDateToEndOfWeek(this._oDateRange.endDate, {
				iDuration: duration,
				iFirstDayOfWeek: firstDay
			});
			DateRangeScroller.updateDateRangeValue(WEEK, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);

			this._sRangeType = WEEK;
		}
		return this;
	};

	/**
	 * Set a date range that increments/decrements one calendar month at a time. The month date range begins on the first day of the month (beginning of the day) and ends on the
	 * last day of the month (end of the day).
	 *
	 * @param {Date} dInitialDate Any date that falls within the desired month.
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeScroller.prototype.setDateRangeMonth = function (dInitialDate) {
		if (DateUtils.isValidDate(dInitialDate)) {
			this._oDateRange.startDate.setTime(dInitialDate.getTime());
			this._oDateRange.endDate.setTime(dInitialDate.getTime());
			DateUtils.resetDateToStartOfMonth(this._oDateRange.startDate);
			DateUtils.resetDateToEndOfMonth(this._oDateRange.endDate);
			DateRangeScroller.updateDateRangeValue(MONTH, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
			this._sRangeType = MONTH;
		}
		return this;
	};

	/**
	 * Set a date range that increments/decrements one calendar year at a time. The year date range begins on the first day of the year (beginning of the day) and ends on the last
	 * day of the year (end of the day).
	 *
	 * @param {Date} dInitialDate Any date that falls within the desired year.
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeScroller.prototype.setDateRangeYear = function (dInitialDate) {
		if (DateUtils.isValidDate(dInitialDate)) {
			this._oDateRange.startDate.setTime(dInitialDate.getTime());
			this._oDateRange.endDate.setTime(dInitialDate.getTime());
			DateUtils.resetDateToStartOfYear(this._oDateRange.startDate);
			DateUtils.resetDateToEndOfYear(this._oDateRange.endDate);
			DateRangeScroller.updateDateRangeValue(YEAR, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
			this._sRangeType = YEAR;
		}
		return this;
	};

	/**
	 * Set a custom date range beginning with the specified start date that increments/decrements <code>iDuration</code> days at a time.
	 *
	 * @param {Date} dInitialDate The initial date for the custom range.
	 * @param {int} [iDuration=current custom duration] The number of days in the custom range, including the start date.
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeScroller.prototype.setDateRangeCustom = function (dInitialDate, iDuration) {
		if (iDuration === undefined) {
			iDuration = this._iCustomDuration;
		} else if (iDuration && !isNaN(iDuration)) {
			iDuration = parseInt(iDuration, 10);
		}

		if (DateUtils.isValidDate(dInitialDate) && DateRangeScroller.isValidDuration(iDuration)) {

			this._oDateRange.startDate.setTime(dInitialDate.getTime());
			this._oDateRange.endDate.setTime(dInitialDate.getTime());
			DateUtils.resetDateToStartOfDay(this._oDateRange.startDate);

			DateRangeScroller.adjustDateByStep(this._oDateRange.endDate, iDuration - 1);
			DateUtils.resetDateToEndOfDay(this._oDateRange.endDate);
			DateRangeScroller.updateDateRangeValue(CUSTOM, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
			this._sRangeType = CUSTOM;
			this._iCustomDuration = iDuration;
		}
		return this;
	};

	/**
	 * Increment the date range by a time period increment according to the the date range type and fire the dateChange event.
	 *
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining.
	 * @public
	 */
	DateRangeScroller.prototype.incrementDateRange = function () {
		switch (this._sRangeType) {
			case (DAY):
				DateRangeScroller.adjustRangeByStep(this._oDateRange, 1);
				DateRangeScroller.updateDateRangeValue(DAY, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (WEEK):
				DateRangeScroller.adjustRangeByStep(this._oDateRange, iWeekStepSize);
				DateRangeScroller.updateDateRangeValue(WEEK, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (CUSTOM):
				DateRangeScroller.adjustRangeByStep(this._oDateRange, this._iCustomDuration);
				DateRangeScroller.updateDateRangeValue(CUSTOM, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (MONTH):
				var iStart = this._oDateRange.startDate.getMonth() + 1;
				this._oDateRange.startDate.setMonth(iStart);
				this._oDateRange.endDate.setTime(this._oDateRange.startDate.getTime());
				DateUtils.resetDateToEndOfMonth(this._oDateRange.endDate);
				DateRangeScroller.updateDateRangeValue(MONTH, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (YEAR):
				iStart = this._oDateRange.startDate.getFullYear() + 1;
				this._oDateRange.startDate.setFullYear(iStart);
				this._oDateRange.endDate.setTime(this._oDateRange.startDate.getTime());
				DateUtils.resetDateToEndOfYear(this._oDateRange.endDate);
				DateRangeScroller.updateDateRangeValue(YEAR, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			default:
				return this;
		}

		var oCopyDateRange = this.getDateRange();
		this.fireChange({
			dateRange: oCopyDateRange
		});
		return this;
	};

	/**
	 * Decrement the date range by a time period increment according to the the date range type and fire the dateChange event.
	 *
	 * @returns {sap.suite.ui.commons.DateRangeScroller} <code>this</code> to allow method chaining
	 * @public
	 */
	DateRangeScroller.prototype.decrementDateRange = function () {
		switch (this._sRangeType) {
			case (DAY):
				DateRangeScroller.adjustRangeByStep(this._oDateRange, -1);
				DateRangeScroller.updateDateRangeValue(DAY, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (WEEK):
				DateRangeScroller.adjustRangeByStep(this._oDateRange, -iWeekStepSize);
				DateRangeScroller.updateDateRangeValue(WEEK, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (CUSTOM):
				DateRangeScroller.adjustRangeByStep(this._oDateRange, -this._iCustomDuration); // Here the step amount equals the range duration
				DateRangeScroller.updateDateRangeValue(CUSTOM, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (MONTH):
				var iStart = this._oDateRange.startDate.getMonth() - 1;
				this._oDateRange.startDate.setMonth(iStart);
				this._oDateRange.endDate.setTime(this._oDateRange.startDate.getTime());
				DateUtils.resetDateToEndOfMonth(this._oDateRange.endDate);
				DateRangeScroller.updateDateRangeValue(MONTH, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			case (YEAR):
				iStart = this._oDateRange.startDate.getFullYear() - 1;
				this._oDateRange.startDate.setFullYear(iStart);
				this._oDateRange.endDate.setTime(this._oDateRange.startDate.getTime());
				DateUtils.resetDateToEndOfYear(this._oDateRange.endDate);
				DateRangeScroller.updateDateRangeValue(YEAR, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
				break;
			default:
				return this;
		}
		var oCopyDateRange = this.getDateRange();
		this.fireChange({
			dateRange: oCopyDateRange
		});
		return this;
	};

	/**
	 * Returns an object containing startDate and endDate set to the current start and end Date objects.
	 *
	 * @returns {Object} The date range containing start and end Date.
	 * @public
	 */
	DateRangeScroller.prototype.getDateRange = function () {
		var oCopyDateRange = {
			startDate: new Date(this._oDateRange.startDate.getTime()),
			endDate: new Date(this._oDateRange.endDate.getTime())
		};
		return oCopyDateRange;
	};

	/**
	 * Setter for dateFormat which is used for formating the dates If passed object is null or is of incorrect type, control's default formatting will be used.
	 *
	 * @param {sap.ui.core.format.DateFormat} oDateFormat Date format which should be used
	 * @public
	 */
	DateRangeScroller.prototype.setDateFormat = function (oDateFormat) {
		if (oDateFormat && oDateFormat instanceof DateFormat) {
			this._oDateFormat = oDateFormat;
		} else {
			this._oDateFormat = null;
		}
		DateRangeScroller.updateDateRangeValue(this._sRangeType, this._oDateRange, this._oDateRangeLabel, this._oDateFormat);
	};

	/**
	 * Control click handler to trigger increment or decrement of the date range.
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeScroller.prototype.onclick = function (oEvent) {
		switch (oEvent.target) {
			case this.$('decrementScrollButton')[0]:
				this.decrementDateRange();
				break;
			case this.$('incrementScrollButton')[0]:
				this.incrementDateRange();
				break;
			default:
				break;
		}
		this.$("labelarea").focus();
	};

	/**
	 * Function is called when right arrow is pressed
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeScroller.prototype.onsapright = function (oEvent) {
		this.incrementDateRange();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Function is called when left arrow is pressed
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeScroller.prototype.onsapleft = function (oEvent) {
		this.decrementDateRange();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Function is called when up arrow is pressed
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeScroller.prototype.onsapup = function (oEvent) {
		this.incrementDateRange();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Function is called when DOWN arrow is pressed
	 *
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	DateRangeScroller.prototype.onsapdown = function (oEvent) {
		this.decrementDateRange();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	return DateRangeScroller;
});
