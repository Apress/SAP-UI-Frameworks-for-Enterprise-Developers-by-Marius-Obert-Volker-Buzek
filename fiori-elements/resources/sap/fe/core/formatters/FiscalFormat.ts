import CalendarType from "sap/ui/core/CalendarType";
import Locale from "sap/ui/core/Locale";
import LocaleData from "sap/ui/core/LocaleData";

/**
 * Constructor for a new FiscalFormat
 *
 * @param formatOptions Object that defines format options
 * @param formatOptions.format String with fiscal format
 * @param formatOptions.calendarType String with calendar type
 * @class
 * <h3>Overview</h3>
 *
 * Formatting, Validating and Parsing Fiscal Dates
 * @author SAP SE
 * @since 1.110.0
 * @experimental This module is only for internal/experimental use!
 * @hideconstructor
 */
export default class FiscalFormat {
	private pattern: string | undefined;

	private formatRegExPattern!: RegExp;

	private formatRegExGroups!: string;

	private parseRegExPattern!: RegExp;

	private validationRegExPattern!: RegExp;

	private parseRegExReplacer!: (substring: string, ...args: any[]) => string;

	constructor(formatOptions: { format: string; calendarType: CalendarType }) {
		const locale = new Locale(sap.ui.getCore().getConfiguration().getLanguage()),
			localeData = new LocaleData(locale);

		let format = formatOptions.format;
		if (formatOptions.format.length > 4) {
			format = "yM";
		} else if (formatOptions.format === "PPP") {
			format = "M";
		}

		let pattern = localeData.getCustomDateTimePattern(format, formatOptions.calendarType);
		pattern = pattern.replace(/([\u4e00-\u9faf\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef])+/gi, "");
		// Parsing the "yM" format pattern to the pattern that would match the passed format
		if (formatOptions.format.length > 4) {
			pattern = pattern.replace(/y+/i, formatOptions.format.slice(0, formatOptions.format.lastIndexOf("Y") + 1));
			pattern = pattern.replace(/m+/i, formatOptions.format.slice(formatOptions.format.lastIndexOf("Y") + 1));
		} else if (formatOptions.format === "PPP") {
			pattern = "PPP";
		}

		const formatArray = this.parseCalendarDatePattern(pattern);
		this.pattern = formatArray.length > 1 ? pattern : undefined;
		this._setFormatRegex(formatArray);
		this._setParseRegex(formatArray);
		this._setValidationRegex(formatArray);
	}

	/**
	 * Get a date instance of the <code>FiscalFormat</code> class, which can be used for formatting.
	 *
	 * @param formatOptions Object that defines format options
	 * @param formatOptions.format Fiscal format
	 * @param formatOptions.calendarType Calendar type
	 * @returns Instance of the FiscalFormat
	 */
	public static getDateInstance(formatOptions: { format: string; calendarType: CalendarType }): FiscalFormat {
		return new FiscalFormat(formatOptions);
	}

	public getPattern(): string | undefined {
		return this.pattern;
	}

	/**
	 * Format the raw fiscal data to a locale-dependent format.
	 *
	 * @param value The parameter containing a raw fiscal value
	 * @returns The formatted value
	 */
	public format(value: string | number | boolean): string | number | boolean {
		if (value == null) {
			return "";
		}
		if (typeof value !== "string") {
			return value;
		}

		return value.replace(this.formatRegExPattern, this.formatRegExGroups);
	}

	/**
	 * Parse from a locale-dependent format to a raw value.
	 *
	 * @param value The string containing a parsed fiscal data value
	 * @returns The raw value
	 */
	public parse(value: string): string {
		if (!value) {
			return "";
		}
		return value.replace(this.parseRegExPattern, this.parseRegExReplacer);
	}

	/**
	 * Validates the data input.
	 *
	 * @param value The raw fiscal data
	 * @returns If <code>true</code> the validation passes, otherwise <code>false</code>
	 */
	public validate(value: string): boolean {
		return this.validationRegExPattern.test(value);
	}

	/**
	 * Parse the date pattern string and create a format array from it.
	 * Array is used for data parsing and formatting.
	 *
	 * @param pattern The calendar date pattern string
	 * @returns Format array
	 */
	private parseCalendarDatePattern(pattern: string): { digits: number; value: string; symbol: string }[] {
		const formatArray = [];
		let char,
			currentObject = { digits: 0, value: "", symbol: "" };

		for (const curChar of pattern) {
			if (char !== curChar) {
				currentObject = { digits: 0, value: "", symbol: "" };
			} else {
				currentObject.digits += 1;
				continue;
			}

			if (typeof FiscalFormat.symbols[curChar as keyof typeof FiscalFormat.symbols] === "undefined") {
				currentObject.value = curChar;
			} else {
				currentObject.symbol = curChar;
				currentObject.digits = 1;
			}
			char = curChar;
			formatArray.push(currentObject);
		}

		return formatArray;
	}

	/**
	 * Creates the formatting regular expression based on the locale-dependent format.
	 *
	 * @param formatArray An array with the locale-dependent format
	 */
	private _setFormatRegex(formatArray: { digits: number; value: string; symbol: string }[]): void {
		const regExPattern = [],
			regExGroups = [];
		let part, symbol, regex, year;
		for (let i = 0; i < formatArray.length; i++) {
			part = formatArray[i];
			symbol = part.symbol;
			regex = FiscalFormat.symbols[symbol as keyof typeof FiscalFormat.symbols].format;

			if (symbol === "") {
				regExGroups[i] = part.value;
			} else if (symbol.toLocaleLowerCase() === "y") {
				regExPattern.unshift("(" + regex.source + ")");
				regExGroups[i] = "$" + 1;
			} else {
				regExPattern.push("(" + regex.source + ")");
				year = formatArray.some(function (partEntry) {
					return partEntry.symbol.toLowerCase() === "y";
				});
				regExGroups[i] = year ? "$" + 2 : "$" + 1;
			}
		}

		this.formatRegExPattern = new RegExp(regExPattern.join(""));
		this.formatRegExGroups = regExGroups.join("");
	}

	/**
	 * Creates the parsing regular expression based on the locale-dependent format.
	 *
	 * @param formatArray An array with the locale-dependent format
	 */
	private _setParseRegex(formatArray: { digits: number; value: string; symbol: string }[]): void {
		const regExPattern = [],
			filteredFormat: { [index: string]: { digits: number; value: string; symbol: string } } = {};
		let symbol,
			regex,
			currGroup: number,
			group = 0;
		for (const part of formatArray) {
			symbol = part.symbol;

			if (symbol === "") {
				regExPattern.push("\\D+?");
			} else {
				regex = FiscalFormat.symbols[symbol as keyof typeof FiscalFormat.symbols].parse;
				regExPattern.push("(" + regex.source + ")");
				currGroup = ++group;
				filteredFormat[currGroup] = part;
			}
		}
		this.parseRegExPattern = new RegExp("^" + regExPattern.join("") + "$");
		this.parseRegExReplacer = this.getRegExReplacer(filteredFormat);
	}

	/**
	 * Creates a function that is used to replace strings and then performs raw string parsing.
	 *
	 * @param filteredFormat An array with the locale-dependent format
	 * @returns Function that can be passed into the string.replace function
	 */
	private getRegExReplacer(filteredFormat: {
		[index: string]: { digits: number; value: string; symbol: string };
	}): (substring: string, ...args: any[]) => string {
		return function (...args: any[]) {
			const result = [];
			let valuePart, stringGroup;
			for (const key in filteredFormat) {
				valuePart = filteredFormat[key];
				stringGroup = args[parseInt(key, 10)];
				if (stringGroup.length < valuePart.digits) {
					if (valuePart.symbol.toLowerCase() === "y") {
						stringGroup = parseYear(stringGroup);
					} else {
						stringGroup = stringGroup.padStart(valuePart.digits, "0");
					}
				}
				if (valuePart.symbol.toLowerCase() === "y") {
					result.unshift(stringGroup);
				} else {
					result.push(stringGroup);
				}
			}

			return result.join("");
		};
	}

	/**
	 * Creates the validation regular expression based on the format.
	 *
	 * @param formatArray An array with the locale-dependent format
	 */
	private _setValidationRegex(formatArray: { digits: number; value: string; symbol: string }[]): void {
		const regExPattern = [];
		let symbol, regex;
		for (const part of formatArray) {
			symbol = part.symbol;
			regex = FiscalFormat.symbols[symbol as keyof typeof FiscalFormat.symbols].format;
			if (symbol === "") {
				continue;
			} else if (symbol.toLowerCase() === "y") {
				regExPattern.unshift(regex.source);
			} else {
				regExPattern.push(regex.source);
			}
		}
		this.validationRegExPattern = new RegExp("^(" + regExPattern.join(")(") + ")$");
	}

	/**
	 * Regular expression patterns used to format fiscal date strings
	 */
	private static regexFormatPatterns = {
		year: /[1-9]\d{3}/,
		period: /\d{3}/,
		quarter: /[1-4]/,
		week: /0[1-9]|[1-4]\d|5[0-3]/,
		day: /371|370|3[0-6]\d|[1-2]\d{2}|[1-9]\d|[1-9]/
	};

	/**
	 * Regular expression patterns used for raw data parsing and validation
	 */
	private static regexParsePatterns = {
		year: /\d{1,4}/,
		period: /\d{1,3}/,
		quarter: /[1-4]/,
		week: /\d{1,2}/,
		day: /[1-9]/
	};

	/**
	 * Mapping from specific calendar type to corresponding formatting/parsing expression
	 */
	private static symbols = {
		"": { format: / /, parse: / / }, // "text"
		y: { format: FiscalFormat.regexFormatPatterns.year, parse: FiscalFormat.regexParsePatterns.year }, // "year"
		Y: { format: FiscalFormat.regexFormatPatterns.year, parse: FiscalFormat.regexParsePatterns.year }, // "weekYear"
		P: { format: FiscalFormat.regexFormatPatterns.period, parse: FiscalFormat.regexParsePatterns.period }, // "period"
		W: { format: FiscalFormat.regexFormatPatterns.week, parse: FiscalFormat.regexParsePatterns.week }, // "weekInYear"
		d: { format: FiscalFormat.regexFormatPatterns.day, parse: FiscalFormat.regexParsePatterns.day }, // "dayInYear"
		Q: { format: FiscalFormat.regexFormatPatterns.quarter, parse: FiscalFormat.regexParsePatterns.quarter }, // "quarter"
		q: { format: FiscalFormat.regexFormatPatterns.quarter, parse: FiscalFormat.regexParsePatterns.quarter } //"quarterStandalone"
	};
}

/**
 * Parses the Year format. This is how the DateFormat parses years, except those years consisting of 3 digits, since currency fiscal dates support only years consisting of 4 digits.
 *
 * @param year Year string
 * @returns Year number
 */
function parseYear(year: string): number {
	let parsedYear = Number.parseInt(year, 10);
	const currentYear = new Date().getUTCFullYear(),
		currentCentury = Math.floor(currentYear / 100),
		yearDiff = currentCentury * 100 + parsedYear - currentYear;

	if (year.length === 3) {
		parsedYear += Math.floor((currentCentury - 1) / 10) * 1000;
	} else if (yearDiff < -70) {
		parsedYear += (currentCentury + 1) * 100; // Take next century if "year" is 30 years in the future. Current year 1999 and we enter 28 it will we 2028
	} else if (yearDiff < 30) {
		parsedYear += currentCentury * 100; // Take next century if "year" is 30 years in the future. Current year 2000 and we enter 29 it will we 2029
	} else {
		parsedYear += (currentCentury - 1) * 100; // Any entered "year" that is more than 30 years in the future will be treated as from previous century
	}
	return parsedYear;
}
