/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/LocaleData",
	"sap/ui/core/Configuration"
], function(BaseObject, LocaleData, Configuration) {
	"use strict";

	/**
	 * Constructor for a new FiscalFormat.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} oFormatOptions Object which defines the format options.
	 * @param {string} oFormatOptions.anotationType The Fiscal Annotation type.
	 *
	 * @class
	 * <h3>Overview</h3>
	 *
	 * Formatting, Validating and Parsing Fiscal dates
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @param {object} oFormatOptions format options.
	 * @param {string} oFormatOptions.format format options.
	 * @param {string} oFormatOptions.calendarType format options.
	 * @version 1.113.0
	 * @experimental This module is only for internal/experimental use!
	 * @private
	 * @hideconstructor
	 * @extends sap.ui.base.Object
	 * @alias sap.ui.comp.smartfield.FiscalFormat
	 */
	var FiscalFormat = BaseObject.extend("sap.ui.comp.odata.FiscalFormat", {
		metadata: {
			library: "sap.ui.comp"
		},
		constructor: function(sId, oFormatOptions) {
			BaseObject.call(this, sId, oFormatOptions);
			var format, sPattern, aFormatArray, sCustomDatePattern,
				oLocale = Configuration.getFormatSettings().getFormatLocale(),
				oLocaleData = LocaleData.getInstance(oLocale),
				mCustomData = Configuration.getFormatSettings().getCustomLocaleData(),
				oCustomDateRegex = /(m|y)(?:.*)(\W)(m|y)/i,
				sCustomDateFormat = mCustomData["dateFormats-short"];

			this.oFormatOptions = oFormatOptions;
			// Parsing the passed format to "yM"
			if (this.oFormatOptions.format.length > 4) {
				format = "yM";
			} else if (this.oFormatOptions.format === "PPP") {
				format = "M";
			} else {
				format = this.oFormatOptions.format;
			}

			// getCustomDateTimePattern is not returning the right pattern if there is a custom data, we need to handle it explicitly
			// If there is a custom date format and we have to handle fiscal date with two parts
			if (sCustomDateFormat && format === "yM") {
				// We try to find the needed fiscal pattern from the custom date pattern
				sCustomDatePattern = sCustomDateFormat.match(oCustomDateRegex).splice(1).join("");
				if (sCustomDatePattern) {
					sPattern = sCustomDatePattern;
				}
			} else {
				sPattern = oLocaleData.getCustomDateTimePattern(format, this.oFormatOptions.calendarType);
			}

			sPattern = sPattern.replace(/([\u4e00-\u9faf\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef])+/gi, '');

			// Parsing the "yM" format pattern to the pattern that would match the passed format
			if (this.oFormatOptions.format.length > 4) {
				sPattern = sPattern.replace(/y+/i, this.oFormatOptions.format.slice(0, this.oFormatOptions.format.lastIndexOf("Y") + 1));
				sPattern = sPattern.replace(/m+/i, this.oFormatOptions.format.slice(this.oFormatOptions.format.lastIndexOf("Y") + 1));
			} else if (this.oFormatOptions.format === "PPP") {
				sPattern = "PPP";
			}

			aFormatArray = this.parseCldrDatePattern(sPattern);
			this.oFormatOptions.pattern = aFormatArray.length > 1 ? sPattern : "";
			this._setFormatRegex(aFormatArray);
			this._setParseRegex(aFormatArray);
			this._setValidationRegex(aFormatArray);
		}
	});

	/**
	 * Get a date instance of the <code>FiscalFormat</code> class, which can be used for formatting.
	 *
	 * @param {object} oFormatOptions Object which defines the format options.
	 * @param {string} oFormatOptions.anotationType The Fiscal Annotation type.
	 * @return {sap.ui.comp.odata.FiscalFormat} Instance of the FiscalFormat.
	 * @private
	 * @static
	 */
	FiscalFormat.getDateInstance = function(oFormatOptions) {
		return new FiscalFormat(null, oFormatOptions);
	};

	/**
	 * Get the date pattern.
	 *
	 * @return {string} The date pattern string in in LDML format;
	 * @private
	 */
	FiscalFormat.prototype.getPattern = function() {
		return this.oFormatOptions.pattern;
	};

	/**
	 * Returns a regular expression that represents this FiscalFormat pattern.
	 *
	 * @return {RegExp} Regular expression representing the pattern
	 * @private
	 * @ui5-restricted sap.ui.comp.SmartTable
	 */
	FiscalFormat.prototype.getRegExPattern = function() {
		return this.sFormatRegExPattern;
	};

	/**
	 * Returns a template with placeholders that match the regular expression
	 * groups of the pattern. Each placeholder consists of a $ (dollar sign)
	 * followed by a non-zero based index ().
	 *
	 * The template is locale dependent.
	 *
	 * @return {string} Template with placeholders
	 * @private
	 */
	FiscalFormat.prototype.getTemplate = function() {
		return this.sFormatRegExGroups;
	};

	/**
	 * Creates the formatting regular expression based on the locale-dependent format.
	 *
	 * @param {array} aFormatArray An Array with the locale-dependent format.
	 * @return  void
	 * @private
	 */
	FiscalFormat.prototype._setFormatRegex = function(aFormatArray) {
		var sRegExPattern = [], sRegExGroups = [], oPart, sSymbol, oRegex, bYear, i;
		for (i = 0; i < aFormatArray.length; i++) {
			oPart = aFormatArray[i];
			sSymbol = oPart.symbol || "";
			oRegex = this.oSymbols[sSymbol].format;

			if (sSymbol === "") {
				sRegExGroups[i] = (oPart.value);
			} else if (sSymbol === "y" || sSymbol === "Y") {
				sRegExPattern.unshift("(" + oRegex.source + ")");
				sRegExGroups[i] = ('$' + 1);
			} else {
				sRegExPattern.push("(" + oRegex.source + ")");
				bYear = aFormatArray.some(function(oPart) {
					return oPart.symbol === "y" || oPart.symbol === "Y";
				});
				sRegExGroups[i] = bYear ? ('$' + 2) : ('$' + 1);
			}
		}

		this.sFormatRegExPattern = new RegExp(sRegExPattern.join(""));
		this.sFormatRegExGroups = sRegExGroups.join("");
	};

	/**
	 * Creates the parsing regular expression based on the locale-dependent format.
	 *
	 * @param {array} aFormatArray An Array with the locale-dependent format.
	 * @return  void
	 * @private
	 */
	FiscalFormat.prototype._setParseRegex = function(aFormatArray) {
		var  oPart, sSymbol, oRegex, i, currGroup, sRegExPattern = [], oFilteredFormat = {}, nGroup = 0;
		for (i = 0; i < aFormatArray.length; i++) {
			oPart = aFormatArray[i];
			sSymbol = oPart.symbol || "";
			oRegex = this.oSymbols[sSymbol].parse;

			if (sSymbol === "") {
				sRegExPattern.push("\\D+?");
			} else {
				sRegExPattern.push("(" + oRegex.source + ")");
				currGroup = ++nGroup;
				oFilteredFormat[currGroup] = oPart;
			}
		}

		this.sParseRegExPattern = new RegExp("^" + sRegExPattern.join("") + "$");
		this.fnParseRegExReplacer = function(){
										var oPart, sGroup, aResult = [];
										for (var i in oFilteredFormat) {
											oPart = oFilteredFormat[i];
											sGroup = arguments[i];
											if (sGroup.length < oPart.digits) {
												if (oPart.symbol === "y" || oPart.symbol === "Y") {
													sGroup = parseYear(sGroup);
												} else {
													sGroup = sGroup.padStart(oPart.digits, '0');
												}
											}
											if (oPart.symbol === "y" || oPart.symbol === "Y") {
												aResult.unshift(sGroup);
											} else {
												aResult.push(sGroup);
											}
										}

										return aResult.join("");
									};
	};

	/**
	 * Creates the validation regular expression based on the format.
	 *
	 * @param {array} aFormatArray An Array with the locale-dependent format.
	 * @return  void
	 * @private
	 */
	FiscalFormat.prototype._setValidationRegex = function(aFormatArray) {
		var i, oPart, sSymbol, oRegex, sRegExPattern = [];
		for (i = 0; i < aFormatArray.length; i++) {
			oPart = aFormatArray[i];
			sSymbol = oPart.symbol || "";
			oRegex = this.oSymbols[sSymbol].format;
			if (sSymbol === "") {
				continue;
			} else if (sSymbol === "y" || sSymbol === "Y") {
				sRegExPattern.unshift(oRegex.source);
			} else {
				sRegExPattern.push(oRegex.source);
			}
		}

		this.sValidationRegExPattern = new RegExp("^(" + sRegExPattern.join(")(") + ")$");
	};

	/**
	 * Parse the date pattern string and create a format array from it, which can be used for parsing and formatting.
	 *
	 * @param {string} sPattern the CLDR date pattern string.
	 * @returns {Array} format array.
	 * @private
	 */
	FiscalFormat.prototype.parseCldrDatePattern = function(sPattern) {
		var i, sCurChar, sChar, oCurrentObject, aFormatArray = [];

		for (i = 0; i < sPattern.length; i++) {
			sCurChar = sPattern[i];
			if (sChar !== sCurChar) {
				oCurrentObject = {};
			} else {
				oCurrentObject.digits += 1;
				continue;
			}

			if (typeof this.oSymbols[sCurChar] === "undefined") {
				oCurrentObject.value = sCurChar;
				oCurrentObject.type = "text";
			} else {
				oCurrentObject.symbol = sCurChar;
				oCurrentObject.digits = 1;
			}
			sChar = sCurChar;
			aFormatArray.push(oCurrentObject);
		}

		return aFormatArray;
	};

	/**
	 * Format the raw fiscal data to a Locale-dependent format.
	 *
	 * @param {string} sValue the string containing a raw fiscal value
	 * @return {string} the formatted value
	 * @private
	 */
	FiscalFormat.prototype.format = function(sValue) {
		if (sValue == null) {
			return "";
		}

		return sValue.replace(this.sFormatRegExPattern, this.sFormatRegExGroups);
	};

	/**
	 * Parse from a Locale-dependent format to raw value.
	 *
	 * @param {string} sValue the string containing a formatted fiscal data value.
	 * @return {string} the raw value.
	 * @private
	 */
	FiscalFormat.prototype.parse = function(sValue) {
		if (sValue) {
			return sValue.replace(this.sParseRegExPattern, this.fnParseRegExReplacer);
		}

		return null;
	};

	/**
	 * Validates the data input.
	 *
	 * @param {string} sValue The raw fiscal data.
	 * @returns {boolean} <code>true</code> if the validation passes, otherwise return <code>false</code>.
	 * @private
	 */
	FiscalFormat.prototype.validate = function(sValue) {
		return this.sValidationRegExPattern.test(sValue);
	};

	/**
	 * Annotation composition regular expression patterns.
	 * @private
	 * @static
	 */
	FiscalFormat.oRegexFormatPatterns = {
		"year": /[1-9][0-9]{3}/,
		"period": /[0-9]{3}/,
		"quarter": /[1-4]/,
		"week": /0[1-9]|[1-4][0-9]|5[0-3]/,
		"day": /371|370|3[0-6][0-9]|[1-2][0-9][0-9]|[1-9][0-9]|[1-9]/
	};

	/**
	 * Annotation composition regular expression patterns used for parsing. Needed for the intelligent validations
	 * @private
	 * @static
	 */
	FiscalFormat.oRegexParsePatterns = {
		"year": /[0-9]{1,4}/,
		"period": /[0-9]{1,3}/,
		"quarter": /[1-4]/,
		"week": /[0-9]{1,2}/,
		"day": /[1-9]/
	};

	/**
	 * Local formatting/parsing composition parts mapping to corresponding annotation composition regular expression patterns.
	 * @private
	 * @static
	 */
	FiscalFormat.prototype.oSymbols = {
		"": "", // "text"
		"y": { format: FiscalFormat.oRegexFormatPatterns.year, parse: FiscalFormat.oRegexParsePatterns.year}, // "year"
		"Y": { format: FiscalFormat.oRegexFormatPatterns.year, parse: FiscalFormat.oRegexParsePatterns.year}, // "weekYear"
		"P": { format: FiscalFormat.oRegexFormatPatterns.period, parse: FiscalFormat.oRegexParsePatterns.period}, // "period"
		"W": { format: FiscalFormat.oRegexFormatPatterns.week, parse: FiscalFormat.oRegexParsePatterns.week}, // "weekInYear"
		"d": { format: FiscalFormat.oRegexFormatPatterns.day, parse: FiscalFormat.oRegexParsePatterns.day}, // "dayInYear"
		"Q": { format: FiscalFormat.oRegexFormatPatterns.quarter, parse: FiscalFormat.oRegexParsePatterns.quarter}, // "quarter"
		"q": { format: FiscalFormat.oRegexFormatPatterns.quarter, parse: FiscalFormat.oRegexParsePatterns.quarter} //"quarterStandalone"
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	FiscalFormat.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		if (this._oAnnotationValidationRegexPattern) {
			this._oAnnotationValidationRegexPattern = null;
		}
	};

	// This is the way how the DateFormat is parsing years except for the years with 3 digits because currency fiscal dates are supporting only years with four digits.
	function parseYear(sYear){
		var iYearDiff,
			iYear =  Number.parseInt(sYear),
			iCurrentYear = new Date().getUTCFullYear(),
			iCurrentCentury = Math.floor(iCurrentYear / 100);
			iYearDiff = iCurrentCentury * 100 + iYear - iCurrentYear;

		if (sYear.length === 3) {
			iYear += Math.floor((iCurrentCentury - 1) / 10)  * 1000;
		} else if (iYearDiff < -70) {
			iYear += (iCurrentCentury + 1) * 100;
		} else if (iYearDiff < 30 ) {
			iYear += iCurrentCentury * 100;
		}  else {
			iYear += (iCurrentCentury - 1) * 100;
		}

		return iYear;
	}

	return FiscalFormat;
});
