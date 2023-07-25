/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/Core"
], function (NumberFormat, Core) {
	"use strict";

	/**
	 * Utility is a static class providing support functions for other TAccount classes.
	 *
	 * @static
	 * @private
	 * @since 1.60
	 * @alias sap.suite.ui.commons.taccount.TAccountUtils
	 */
	var TAccountUtils = {};

	TAccountUtils._oCurrencyFormatter = null;

	/**
	 * Formats value based on the currency.
	 * @param {float} value value to format
	 * @param {string} currency Formation currency
	 * @returns {string} Formatted value
	 */
	TAccountUtils.formatCurrency = function (value, currency, maxFractionDigits) {
		return TAccountUtils._getCurrencyFormatter(maxFractionDigits).format(value, currency) || "";
	};

	TAccountUtils._getCurrencyFormatter = function (maxFractionDigits) {
			TAccountUtils._oCurrencyFormatter = NumberFormat.getCurrencyInstance({
				showMeasure: false,
				maxFractionDigits: maxFractionDigits
			}, Core.getConfiguration().getLocale());

		return TAccountUtils._oCurrencyFormatter;
	};

	return TAccountUtils;
}, true);
