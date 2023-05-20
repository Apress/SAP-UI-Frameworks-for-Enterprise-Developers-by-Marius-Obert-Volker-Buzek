/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './DateUtils' ], function(DateUtils) {
	"use strict";

	/**
	 * Constructor for FeedItemUtils - must not be used. All functions are static, so it is illegal to call this constructor.
	 * FeedItemUtils is a static class for feed item utility functions.
	 *
	 * @class
	 * @private
	 */
	var FeedItemUtils = function() {
		throw new Error();
	};

	/**
	 * This function calculates the age of feed item.
	 * @returns {string} string representing the age of the feed
	 * @param {Date} dPublicationDate The publication date of the feed item.
	 * @private
	 */
	FeedItemUtils.calculateFeedItemAge = function(dPublicationDate) {
		var sAgo = "";

		if (!DateUtils.isValidDate(dPublicationDate)) {
			return sAgo;
		}

		var dNow = new Date();

		// ignore milliseconds
		dPublicationDate.setMilliseconds(0);
		dNow.setMilliseconds(0);

		var oLocale = sap.ui.getCore().getConfiguration().getLanguage();
		var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons", oLocale);

		var nMillisInOneMinute = 60000;
		var nMillisInOneHour = nMillisInOneMinute * 60;
		var nMillisInOneDay = nMillisInOneHour * 24;

		if ((dNow.getTime() - dPublicationDate.getTime()) >= nMillisInOneDay) {

			var nNumberOfDays = parseInt((dNow.getTime() - dPublicationDate.getTime()) / nMillisInOneDay, 10);
			if (nNumberOfDays === 1) {

				sAgo = oResBundle.getText("FEEDTILE_DAY_AGO", [nNumberOfDays]);
			} else {

				sAgo = oResBundle.getText("FEEDTILE_DAYS_AGO", [nNumberOfDays]);
			}
		} else if ((dNow.getTime() - dPublicationDate.getTime()) >= nMillisInOneHour) {

			var nNumberOfHours = parseInt((dNow.getTime() - dPublicationDate.getTime()) / nMillisInOneHour, 10);

			if (nNumberOfHours === 1) {

				sAgo = oResBundle.getText("FEEDTILE_HOUR_AGO", [nNumberOfHours]);
			} else {

				sAgo = oResBundle.getText("FEEDTILE_HOURS_AGO", [nNumberOfHours]);
			}
		} else {

			var nNumberOfMins = parseInt((dNow.getTime() - dPublicationDate.getTime()) / nMillisInOneMinute, 10);

			if (nNumberOfMins === 1) {

				sAgo = oResBundle.getText("FEEDTILE_MINUTE_AGO", [nNumberOfMins]);
			} else {

				sAgo = oResBundle.getText("FEEDTILE_MINUTES_AGO", [nNumberOfMins]);
			}
		}

		return sAgo;
	};

	return FeedItemUtils;
}, /* bExport= */ true);
