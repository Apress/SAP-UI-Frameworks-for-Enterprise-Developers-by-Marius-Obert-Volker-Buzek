/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/base/Log"
], function (Log) {
	"use strict";

	/**
	 * Constructor for DateUtils - must not be used. All functions are static, so it is illegal to call this constructor.
	 * DateUtils is a static class for Date utility functions.
	 *
	 * @class
	 * @public
	 */
	var DateUtils = function () {
		throw new Error();
	};

	/**
	 * Adjust the given date to the start of the day, with time set to 0 hours, 0 minutes, and 0 seconds.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @public
	 */
	DateUtils.resetDateToStartOfDay = function (dDate) {
		if (DateUtils.isValidDate(dDate)) {
			dDate.setHours(0);
			dDate.setMinutes(0);
			dDate.setSeconds(0);
			dDate.setMilliseconds(0);
		}
	};

	/**
	 * Adjust the given date to the end of the day, with time set to 23 hours, 59 minutes, and 59 seconds.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @public
	 */
	DateUtils.resetDateToEndOfDay = function (dDate) {
		if (DateUtils.isValidDate(dDate)) {
			dDate.setHours(23);
			dDate.setMinutes(59);
			dDate.setSeconds(59);
			dDate.setMilliseconds(999);
		}
	};

	/**
	 * Adjust the given date to the first day of the month, start of day.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @public
	 */
	DateUtils.resetDateToStartOfMonth = function (dDate) {
		if (DateUtils.isValidDate(dDate)) {
			dDate.setDate(1);
			DateUtils.resetDateToStartOfDay(dDate);
		}
	};

	/**
	 * Adjust the given date to the last day of the month, end of day.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @public
	 */
	DateUtils.resetDateToEndOfMonth = function (dDate) {
		if (DateUtils.isValidDate(dDate)) {
			dDate.setDate(1);
			dDate.setMonth(dDate.getMonth() + 1);
			dDate.setDate(0);
			DateUtils.resetDateToEndOfDay(dDate);
		}
	};

	/**
	 * Adjust the given date to the first day of the year, start of day.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @public
	 */
	DateUtils.resetDateToStartOfYear = function (dDate) {
		if (DateUtils.isValidDate(dDate)) {
			dDate.setMonth(0);
			DateUtils.resetDateToStartOfMonth(dDate);
		}
	};

	/**
	 * Adjust the given date to the last day of the year, end of day.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @public
	 */
	DateUtils.resetDateToEndOfYear = function (dDate) {
		if (DateUtils.isValidDate(dDate)) {
			dDate.setMonth(11);
			DateUtils.resetDateToEndOfMonth(dDate);
		}
	};

	/**
	 * Adjust the given date to the day specified by <code>iFirstDayOfWeek</code>. The date will be set to the previous first day of the week. For example, if the date is Tuesday,
	 * February 19 and the value of <code>iFirstDayOfWeek</code> is 4 (Thursday), then the date will be adjusted to the previous Thursday, which is February 14.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @param {int} [iFirstDayOfWeek=1] The day considered to be the first day of the week. Valid values are 0-6, with 0=Sunday and 6=Saturday
	 * @public
	 */
	DateUtils.resetDateToStartOfWeek = function (dDate, iFirstDayOfWeek) {
		if (DateUtils.isValidDate(dDate)) {
			if (iFirstDayOfWeek === undefined) {
				iFirstDayOfWeek = 1;
			} else if (isNaN(iFirstDayOfWeek) || !isFinite(iFirstDayOfWeek)) {
				Log.error("DateUtils iFirstDayOfWeek value ='" + iFirstDayOfWeek + "' is invalid.");
				return;
			}

			dDate.setDate(dDate.getDate() - (dDate.getDay() - iFirstDayOfWeek + 7) % 7);
			DateUtils.resetDateToStartOfDay(dDate);
		}
	};

	/**
	 * Adjust the given date to <code>oSettings.iDuration</code> days after the day specified by <code>oSettings.iFirstDayOfWeek</code>. See <code>resetDateToStartOfWeek()</code>
	 * for a description of how the date is adjusted to the first day of week.
	 *
	 * @param {Date} dDate The date to be adjusted
	 * @param {Object} oSettings The settings object with the following properties:
	 * @param {int} [oSettings.iDuration=7] The number of days in the week with a minimum of 1 and maximum of 7
	 * @param {int} [oSettings.iFirstDayOfWeek=1] The day considered to be the first day of the week. Valid values are 0-6, with 0=Sunday and 6=Saturday
	 * @public
	 */
	DateUtils.resetDateToEndOfWeek = function (dDate, oSettings) {
		if (DateUtils.isValidDate(dDate)) {

			var duration;
			if (oSettings && !(oSettings instanceof Object)) {
				Log.error("DateUtils oSettings is not an object.");
				return;
			}

			if (!oSettings) {
				oSettings = {};
			}

			if (oSettings.iDuration === undefined) {
				duration = 7;
			} else {
				duration = oSettings.iDuration;

				if (isNaN(duration) || !isFinite(duration)) {
					Log.error("DateUtils duration value ='" + duration + "' is invalid.");
					return;
				}
			}

			DateUtils.resetDateToStartOfWeek(dDate, oSettings.iFirstDayOfWeek);
			dDate.setDate(dDate.getDate() + duration - 1);
			DateUtils.resetDateToEndOfDay(dDate);
		}
	};

	/**
	 * Test if the given date is a valid date object. If the date is invalid an error message is logged.
	 *
	 * @param {Date} dDate The date to be validated
	 * @public
	 * @returns {boolean} True if the given date is valid, false otherwise
	 */
	DateUtils.isValidDate = function (dDate) {
		if (Object.prototype.toString.call(dDate) !== "[object Date]" || isNaN(dDate.getTime())) {
			Log.error("DateUtils invalid date=" + dDate);
			return false;
		}
		return true;
	};

	/**
	 * Tests to see if two dates have the same year, month, and day. Time is not included in the equality. Invalid dates, such as null or undefined, are never equal.
	 *
	 * @param {Date} dDate1 First date to compare
	 * @param {Date} dDate2 Second date to compare
	 * @return {boolean} true if two dates have same year, month, and day, otherwise false
	 * @public
	 */
	DateUtils.dateDaysEqual = function (dDate1, dDate2) {
		if (DateUtils.isValidDate(dDate1) && DateUtils.isValidDate(dDate2)) {

			return (dDate1.getFullYear() === dDate2.getFullYear() && dDate1.getMonth() === dDate2.getMonth() && dDate1.getDate() === dDate2.getDate());

		}
		return false;
	};

	/**
	 * Tests to see if two dates have the same year and month. Time is not included in the equality. Invalid dates, such as null or undefined, are never equal.
	 *
	 * @param {Date} dDate1 First date to compare
	 * @param {Date} dDate2 Second date to compare
	 * @return {boolean} true if two dates have same year and month, otherwise false
	 * @public
	 */
	DateUtils.dateMonthsEqual = function (dDate1, dDate2) {
		if (DateUtils.isValidDate(dDate1) && DateUtils.isValidDate(dDate2)) {

			return (dDate1.getFullYear() === dDate2.getFullYear() && dDate1.getMonth() === dDate2.getMonth());
		}
		return false;
	};

	/**
	 * Returns the date that is iIndex days from the dStartDate
	 *
	 * @param {Date} dStartDate Start date
	 * @param {int} iIndex How many days to move forward or backward from dStartDate
	 * @return {Date} Date that is iIndex days from the dStartDate if dStartDate and iIndex are valid, otherwise null
	 * @public
	 */
	DateUtils.incrementDateByIndex = function (dStartDate, iIndex) {

		var dReturnDate = null;
		if (DateUtils.isValidDate(dStartDate) && isFinite(iIndex)) {
			dReturnDate = new Date(dStartDate);
			dReturnDate.setDate(dStartDate.getDate() + parseInt(iIndex, 10));
		}
		return dReturnDate;
	};

	/**
	 * Returns the date that is iIndex months from the dStartDate
	 *
	 * @param {Date} dStartDate Start date
	 * @param {int} iIndex How many months to move forward or backward from dStartDate
	 * @return {Date} Date that is iIndex months from the dStartDate if dStartDate and iIndex are valid, otherwise null
	 * @public
	 */
	DateUtils.incrementMonthByIndex = function (dStartDate, iIndex) {

		var dReturnDate = null;
		if (DateUtils.isValidDate(dStartDate) && isFinite(iIndex)) {
			dReturnDate = new Date(dStartDate);
			DateUtils.resetDateToStartOfMonth(dReturnDate);
			dReturnDate.setMonth(dStartDate.getMonth() + parseInt(iIndex, 10));
		}
		return dReturnDate;
	};

	/**
	 * Returns the number of months two dates are apart
	 *
	 * @param {Date} dStartDate Start date
	 * @param {Date} dEndDate End date
	 * @return {Number} number of months two dates are apart
	 *
	 * @public
	 */
	DateUtils.numberOfMonthsApart = function (dStartDate, dEndDate) {

		dStartDate = new Date(dStartDate);
		dEndDate = new Date(dEndDate);
		DateUtils.resetDateToStartOfMonth(dStartDate);
		DateUtils.resetDateToStartOfMonth(dEndDate);

		var bForward = dStartDate.getTime() <= dEndDate.getTime();
		var iForward = 0, iBackward = 0, iNumberApart = 0;

		for (iForward = 0, iBackward = 0;
			 !(dStartDate.getDate() === dEndDate.getDate() && dStartDate.getMonth() === dEndDate.getMonth() && dStartDate.getFullYear() === dEndDate.getFullYear());
			 iForward++, iBackward--) {
			if (bForward) {
				dStartDate.setMonth(dStartDate.getMonth() + 1);
			} else {
				dStartDate.setMonth(dStartDate.getMonth() - 1);
			}
		}

		if (bForward) {
			iNumberApart = iForward;
		} else {
			iNumberApart = iBackward;
		}
		return iNumberApart;
	};

	/**
	 * Returns the number of days two dates are apart
	 * @param {Date} dStartDate Start date
	 * @param {Date} dEndDate End date
	 * @return {Number} number of days two dates are apart
	 * @public
	 */
	DateUtils.numberOfDaysApart = function (dStartDate, dEndDate) {
		dStartDate = new Date(dStartDate);
		dEndDate = new Date(dEndDate);
		DateUtils.resetDateToStartOfDay(dStartDate);
		DateUtils.resetDateToStartOfDay(dEndDate);

		var iMillisPerDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
		var iDiffDays = Math.round(Math.abs((dStartDate.getTime() - dEndDate.getTime()) / iMillisPerDay));
		if (dStartDate.getTime() > dEndDate.getTime()) {
			return -iDiffDays;
		} else {
			return iDiffDays;
		}
	};

	/**
	 * Returns date object converted from input parameter. This parameter may be integer with timestamp or string in format Date(timestamp) or date
	 *
	 * @param {object} oDate Integer with timestamp, string with timestamp or date object iteself
	 * @param {boolean} bParseString Boolean if true, string date representation is parsed. True by default
	 * @return {Date} Converted date object
	 *
	 * @public
	 */
	DateUtils.parseDate = function (oDate, bParseString) {
		if (oDate instanceof Date || oDate === null) {
			return oDate;
		}

		// true by default
		bParseString = (bParseString !== false);

		if (typeof oDate === "string") {
			var aResult = /Date\((-*\d+)\)/.exec(oDate);
			if (aResult === null) {
				if (bParseString) {
					var parsedStampt = Date.parse(oDate);
					if (!isNaN(parsedStampt)) {
						oDate = new Date(parsedStampt);
					} else if (!isNaN(oDate)) {
						oDate = new Date(parseInt(oDate, 10));
					}
				}
			} else {
				oDate = new Date(parseInt(aResult[1], 10));
			}
		} else {
			oDate = new Date(parseInt(oDate, 10));
		}

		return oDate;
	};

	return DateUtils;
}, /* bExport= */ true);
