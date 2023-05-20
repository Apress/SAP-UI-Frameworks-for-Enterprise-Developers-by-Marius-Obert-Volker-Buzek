/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/comp/smartfield/type/String",
	"sap/ui/comp/odata/type/NumericText",
	"sap/ui/comp/odata/FiscalFormat",
	"sap/ui/model/ValidateException"

], function(Core, coreLibrary, String, NumericText, FiscalFormat, ValidateException) {
	"use strict";
	/**
	 * Constructor for an fiscal date type.
	 *
	 * @class Fiscal Date data type support parsing and formatting of fiscal dates that follow the pattern 'yM'
	 * @param {object} oFormatOptions format options.
	 * @param {object} oConstraints constraints.
	 * @param {object} oSettings Settings.
	 * @version 1.113.0
	 * @experimental
	 * @private
	 * @extends sap.ui.comp.smartfield.type.String
	 * @alias {sap.ui.comp.odata.type.FiscalDate} the fiscal date implementation.
	 */
	var FiscalDate = String.extend("sap.ui.comp.odata.type.FiscalDate", {
		constructor: function(oFormatOptions, oConstraints, oSettings) {
			String.call(this, oFormatOptions, oConstraints);
			if (this.oConstraints && this.oConstraints.isDigitSequence) {
				NumericText.call(this, oFormatOptions, oConstraints);
			}
			this.sAnotationType = oSettings.anotationType;
			this.formatter = FiscalFormat.getDateInstance(Object.assign({ format: FiscalDate.oDateFormats[oSettings.anotationType], calendarType: coreLibrary.CalendarType.Gregorian }, oFormatOptions));
		}
	});

	/**
	 * Parses the given value which is expected to be of the fiscal type to a string.
	 *
	 * @param {string|number|boolean} vValue
	 *   the value to be parsed
	 * @returns {string}
	 *   the parsed value
	 * @override
	 * @private
	 */
	FiscalDate.prototype.parseValue = function(vValue) {
		if (vValue === "") {
			return null;
		}
		if (this.oConstraints && this.oConstraints.isDigitSequence) {
			return this.formatter.parse(NumericText.prototype.parseValue.apply(this, arguments));
		}
		return this.formatter.parse(String.prototype.parseValue.apply(this, arguments));
	};

	/**
	 * Formats the given value to the given fiscal type.
	 *
	 * @param {string} sValue
	 *   the value to be formatted
	 * @returns {string|number|boolean}
	 *   the formatted output value; <code>undefined</code> is always formatted
	 *   to <code>null</code>.
	 * @function
	 * @override
	 * @private
	 */
	FiscalDate.prototype.formatValue = function(sValue) {
		var vFormattedValue;
		if (this.oConstraints && this.oConstraints.isDigitSequence) {
			var aArguments = Array.from(arguments),
				bSkippedFormatting = true;
			aArguments.push(bSkippedFormatting);
			vFormattedValue = NumericText.prototype.formatValue.apply(this, aArguments);
		} else {
			vFormattedValue = String.prototype.formatValue.apply(this, arguments);
		}

		if (vFormattedValue === null) {
			return null;
		}
		return this.formatter.format(vFormattedValue);
	};

	/**
	 * @inheritDoc
	 */
	FiscalDate.prototype.validateValue = function(sValue) {
		try {
			String.prototype.validateValue.apply(this, arguments);
		} catch (error) {
			if (!this.formatter.validate(sValue)) {
				throw new ValidateException(this.getErrorMessage(this.sAnotationType));
			}
		}

		if (sValue === null) {
			return;
		}
		if (!this.formatter.validate(sValue)) {
			throw new ValidateException(this.getErrorMessage(this.sAnotationType));
		}
	};

	/**
	 * @inheritDoc
	 */
	FiscalDate.prototype.destroy = function() {
		String.prototype.destroy.apply(this, arguments);
		if (this.formatter) {
			this.formatter.destroy();
			this.formatter = null;
		}
	};

	/**
	 * Returns the matching locale-dependent error message for the type based on the fiscal annotation.
	 *
	 * @param {string} sAnnotationType the fiscal annotation type
	 * @returns {string} The locale-dependent error message
	 * @private
	 */
	FiscalDate.prototype.getErrorMessage = function(sAnnotationType) {
		var sValue;
		this.iFullYear = this.iFullYear || new Date().getFullYear().toString();

		switch (sAnnotationType) {
			case "com.sap.vocabularies.Common.v1.IsFiscalYear":
				sValue = this.iFullYear;
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalPeriod":
				sValue = "001";
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod":
				sValue = this.iFullYear + "001";
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalQuarter":
				sValue = "1";
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalYearQuarter":
				sValue = this.iFullYear + "1";
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalWeek":
				sValue = "01";
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalYearWeek":
				sValue = this.iFullYear + "01";
				break;
			case "com.sap.vocabularies.Common.v1.IsDayOfFiscalYear":
				sValue = "1";
				break;
			case "com.sap.vocabularies.Common.v1.IsFiscalYearVariant":
				break;
			default:
				sValue = this.iFullYear;
		}

		return Core.getLibraryResourceBundle("sap.ui.comp").getText("FISCAL_VALIDATION_FAILS", [this.formatValue(sValue, "string")]);
	};

	/**
	 * Local formatting/parsing pattern mapping to corresponding fiscal annotations.
	 * @private
	 * @static
	 */
	FiscalDate.oDateFormats = {
		"com.sap.vocabularies.Common.v1.IsFiscalYear": "YYYY",
		"com.sap.vocabularies.Common.v1.IsFiscalPeriod": "PPP",
		"com.sap.vocabularies.Common.v1.IsFiscalYearPeriod": "YYYYPPP",
		"com.sap.vocabularies.Common.v1.IsFiscalQuarter": "Q",
		"com.sap.vocabularies.Common.v1.IsFiscalYearQuarter": "YYYYQ",
		"com.sap.vocabularies.Common.v1.IsFiscalWeek": "WW",
		"com.sap.vocabularies.Common.v1.IsFiscalYearWeek": "YYYYWW",
		"com.sap.vocabularies.Common.v1.IsDayOfFiscalYear": "d",
		"com.sap.vocabularies.Common.v1.IsFiscalYearVariant": ""
	};

	FiscalDate.prototype.getName = function() {
		return "sap.ui.comp.odata.type.FiscalDate";
	};

	/**
	 * Returns the formatter that is assigned to this particular FiscalDate type.
	 *
	 * @return {null|object} The assigned instance of FiscalFormat
	 * @private
	 * @ui5-restricted sap.ui.comp.SmartTable
	 */
	FiscalDate.prototype.getFormatter = function () {
		return this.formatter;
	};

	return FiscalDate;
});
