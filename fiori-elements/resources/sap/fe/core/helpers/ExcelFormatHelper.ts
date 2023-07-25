import DateFormat from "sap/ui/core/format/DateFormat";

const ExcelFormatHelper = {
	/**
	 * Method for converting JS Date format to Excel custom date format.
	 *
	 * @returns Format for the Date column to be used on excel.
	 */
	getExcelDatefromJSDate: function () {
		// Get date Format(pattern), which will be used for date format mapping between sapui5 and excel.
		// UI5_ANY
		let sJSDateFormat = (DateFormat.getDateInstance() as any).oFormatOptions.pattern.toLowerCase();
		if (sJSDateFormat) {
			// Checking for the existence of single 'y' in the pattern.
			const regex = /^[^y]*y[^y]*$/m;
			if (regex.exec(sJSDateFormat)) {
				sJSDateFormat = sJSDateFormat.replace("y", "yyyy");
			}
		}
		return sJSDateFormat;
	},
	getExcelDateTimefromJSDateTime: function () {
		// Get date Format(pattern), which will be used for date time format mapping between sapui5 and excel.
		// UI5_ANY
		let sJSDateTimeFormat = (DateFormat.getDateTimeInstance() as any).oFormatOptions.pattern.toLowerCase();
		if (sJSDateTimeFormat) {
			// Checking for the existence of single 'y' in the pattern.
			const regexYear = /^[^y]*y[^y]*$/m;
			if (regexYear.exec(sJSDateTimeFormat)) {
				sJSDateTimeFormat = sJSDateTimeFormat.replace("y", "yyyy");
			}
			if (sJSDateTimeFormat.includes("a")) {
				sJSDateTimeFormat = sJSDateTimeFormat.replace("a", "AM/PM");
			}
		}
		return sJSDateTimeFormat;
	},
	getExcelTimefromJSTime: function () {
		// Get date Format(pattern), which will be used for date time format mapping between sapui5 and excel.
		// UI5_ANY
		let sJSTimeFormat = (DateFormat.getTimeInstance() as any).oFormatOptions.pattern;
		if (sJSTimeFormat && sJSTimeFormat.includes("a")) {
			sJSTimeFormat = sJSTimeFormat.replace("a", "AM/PM");
		}
		return sJSTimeFormat;
	}
};

export default ExcelFormatHelper;
