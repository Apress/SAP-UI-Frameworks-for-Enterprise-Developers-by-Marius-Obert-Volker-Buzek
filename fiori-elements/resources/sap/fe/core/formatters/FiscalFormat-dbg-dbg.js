/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Locale", "sap/ui/core/LocaleData"], function (Locale, LocaleData) {
  "use strict";

  var _exports = {};
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
  let FiscalFormat = /*#__PURE__*/function () {
    function FiscalFormat(formatOptions) {
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
    _exports = FiscalFormat;
    FiscalFormat.getDateInstance = function getDateInstance(formatOptions) {
      return new FiscalFormat(formatOptions);
    };
    var _proto = FiscalFormat.prototype;
    _proto.getPattern = function getPattern() {
      return this.pattern;
    }

    /**
     * Format the raw fiscal data to a locale-dependent format.
     *
     * @param value The parameter containing a raw fiscal value
     * @returns The formatted value
     */;
    _proto.format = function format(value) {
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
     */;
    _proto.parse = function parse(value) {
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
     */;
    _proto.validate = function validate(value) {
      return this.validationRegExPattern.test(value);
    }

    /**
     * Parse the date pattern string and create a format array from it.
     * Array is used for data parsing and formatting.
     *
     * @param pattern The calendar date pattern string
     * @returns Format array
     */;
    _proto.parseCalendarDatePattern = function parseCalendarDatePattern(pattern) {
      const formatArray = [];
      let char,
        currentObject = {
          digits: 0,
          value: "",
          symbol: ""
        };
      for (const curChar of pattern) {
        if (char !== curChar) {
          currentObject = {
            digits: 0,
            value: "",
            symbol: ""
          };
        } else {
          currentObject.digits += 1;
          continue;
        }
        if (typeof FiscalFormat.symbols[curChar] === "undefined") {
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
     */;
    _proto._setFormatRegex = function _setFormatRegex(formatArray) {
      const regExPattern = [],
        regExGroups = [];
      let part, symbol, regex, year;
      for (let i = 0; i < formatArray.length; i++) {
        part = formatArray[i];
        symbol = part.symbol;
        regex = FiscalFormat.symbols[symbol].format;
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
     */;
    _proto._setParseRegex = function _setParseRegex(formatArray) {
      const regExPattern = [],
        filteredFormat = {};
      let symbol,
        regex,
        currGroup,
        group = 0;
      for (const part of formatArray) {
        symbol = part.symbol;
        if (symbol === "") {
          regExPattern.push("\\D+?");
        } else {
          regex = FiscalFormat.symbols[symbol].parse;
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
     */;
    _proto.getRegExReplacer = function getRegExReplacer(filteredFormat) {
      return function () {
        const result = [];
        let valuePart, stringGroup;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
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
     */;
    _proto._setValidationRegex = function _setValidationRegex(formatArray) {
      const regExPattern = [];
      let symbol, regex;
      for (const part of formatArray) {
        symbol = part.symbol;
        regex = FiscalFormat.symbols[symbol].format;
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
     */;
    return FiscalFormat;
  }();
  /**
   * Parses the Year format. This is how the DateFormat parses years, except those years consisting of 3 digits, since currency fiscal dates support only years consisting of 4 digits.
   *
   * @param year Year string
   * @returns Year number
   */
  FiscalFormat.regexFormatPatterns = {
    year: /[1-9]\d{3}/,
    period: /\d{3}/,
    quarter: /[1-4]/,
    week: /0[1-9]|[1-4]\d|5[0-3]/,
    day: /371|370|3[0-6]\d|[1-2]\d{2}|[1-9]\d|[1-9]/
  };
  _exports = FiscalFormat;
  FiscalFormat.regexParsePatterns = {
    year: /\d{1,4}/,
    period: /\d{1,3}/,
    quarter: /[1-4]/,
    week: /\d{1,2}/,
    day: /[1-9]/
  };
  FiscalFormat.symbols = {
    "": {
      format: / /,
      parse: / /
    },
    // "text"
    y: {
      format: FiscalFormat.regexFormatPatterns.year,
      parse: FiscalFormat.regexParsePatterns.year
    },
    // "year"
    Y: {
      format: FiscalFormat.regexFormatPatterns.year,
      parse: FiscalFormat.regexParsePatterns.year
    },
    // "weekYear"
    P: {
      format: FiscalFormat.regexFormatPatterns.period,
      parse: FiscalFormat.regexParsePatterns.period
    },
    // "period"
    W: {
      format: FiscalFormat.regexFormatPatterns.week,
      parse: FiscalFormat.regexParsePatterns.week
    },
    // "weekInYear"
    d: {
      format: FiscalFormat.regexFormatPatterns.day,
      parse: FiscalFormat.regexParsePatterns.day
    },
    // "dayInYear"
    Q: {
      format: FiscalFormat.regexFormatPatterns.quarter,
      parse: FiscalFormat.regexParsePatterns.quarter
    },
    // "quarter"
    q: {
      format: FiscalFormat.regexFormatPatterns.quarter,
      parse: FiscalFormat.regexParsePatterns.quarter
    } //"quarterStandalone"
  };

  function parseYear(year) {
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
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaXNjYWxGb3JtYXQiLCJmb3JtYXRPcHRpb25zIiwibG9jYWxlIiwiTG9jYWxlIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldExhbmd1YWdlIiwibG9jYWxlRGF0YSIsIkxvY2FsZURhdGEiLCJmb3JtYXQiLCJsZW5ndGgiLCJwYXR0ZXJuIiwiZ2V0Q3VzdG9tRGF0ZVRpbWVQYXR0ZXJuIiwiY2FsZW5kYXJUeXBlIiwicmVwbGFjZSIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJmb3JtYXRBcnJheSIsInBhcnNlQ2FsZW5kYXJEYXRlUGF0dGVybiIsInVuZGVmaW5lZCIsIl9zZXRGb3JtYXRSZWdleCIsIl9zZXRQYXJzZVJlZ2V4IiwiX3NldFZhbGlkYXRpb25SZWdleCIsImdldERhdGVJbnN0YW5jZSIsImdldFBhdHRlcm4iLCJ2YWx1ZSIsImZvcm1hdFJlZ0V4UGF0dGVybiIsImZvcm1hdFJlZ0V4R3JvdXBzIiwicGFyc2UiLCJwYXJzZVJlZ0V4UGF0dGVybiIsInBhcnNlUmVnRXhSZXBsYWNlciIsInZhbGlkYXRlIiwidmFsaWRhdGlvblJlZ0V4UGF0dGVybiIsInRlc3QiLCJjaGFyIiwiY3VycmVudE9iamVjdCIsImRpZ2l0cyIsInN5bWJvbCIsImN1ckNoYXIiLCJzeW1ib2xzIiwicHVzaCIsInJlZ0V4UGF0dGVybiIsInJlZ0V4R3JvdXBzIiwicGFydCIsInJlZ2V4IiwieWVhciIsImkiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsInVuc2hpZnQiLCJzb3VyY2UiLCJzb21lIiwicGFydEVudHJ5IiwidG9Mb3dlckNhc2UiLCJSZWdFeHAiLCJqb2luIiwiZmlsdGVyZWRGb3JtYXQiLCJjdXJyR3JvdXAiLCJncm91cCIsImdldFJlZ0V4UmVwbGFjZXIiLCJyZXN1bHQiLCJ2YWx1ZVBhcnQiLCJzdHJpbmdHcm91cCIsImFyZ3MiLCJrZXkiLCJwYXJzZUludCIsInBhcnNlWWVhciIsInBhZFN0YXJ0IiwicmVnZXhGb3JtYXRQYXR0ZXJucyIsInBlcmlvZCIsInF1YXJ0ZXIiLCJ3ZWVrIiwiZGF5IiwicmVnZXhQYXJzZVBhdHRlcm5zIiwieSIsIlkiLCJQIiwiVyIsImQiLCJRIiwicSIsInBhcnNlZFllYXIiLCJOdW1iZXIiLCJjdXJyZW50WWVhciIsIkRhdGUiLCJnZXRVVENGdWxsWWVhciIsImN1cnJlbnRDZW50dXJ5IiwiTWF0aCIsImZsb29yIiwieWVhckRpZmYiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpc2NhbEZvcm1hdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ2FsZW5kYXJUeXBlIGZyb20gXCJzYXAvdWkvY29yZS9DYWxlbmRhclR5cGVcIjtcbmltcG9ydCBMb2NhbGUgZnJvbSBcInNhcC91aS9jb3JlL0xvY2FsZVwiO1xuaW1wb3J0IExvY2FsZURhdGEgZnJvbSBcInNhcC91aS9jb3JlL0xvY2FsZURhdGFcIjtcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBmb3IgYSBuZXcgRmlzY2FsRm9ybWF0XG4gKlxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT2JqZWN0IHRoYXQgZGVmaW5lcyBmb3JtYXQgb3B0aW9uc1xuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMuZm9ybWF0IFN0cmluZyB3aXRoIGZpc2NhbCBmb3JtYXRcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zLmNhbGVuZGFyVHlwZSBTdHJpbmcgd2l0aCBjYWxlbmRhciB0eXBlXG4gKiBAY2xhc3NcbiAqIDxoMz5PdmVydmlldzwvaDM+XG4gKlxuICogRm9ybWF0dGluZywgVmFsaWRhdGluZyBhbmQgUGFyc2luZyBGaXNjYWwgRGF0ZXNcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAc2luY2UgMS4xMTAuMFxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBpbnRlcm5hbC9leHBlcmltZW50YWwgdXNlIVxuICogQGhpZGVjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaXNjYWxGb3JtYXQge1xuXHRwcml2YXRlIHBhdHRlcm46IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRwcml2YXRlIGZvcm1hdFJlZ0V4UGF0dGVybiE6IFJlZ0V4cDtcblxuXHRwcml2YXRlIGZvcm1hdFJlZ0V4R3JvdXBzITogc3RyaW5nO1xuXG5cdHByaXZhdGUgcGFyc2VSZWdFeFBhdHRlcm4hOiBSZWdFeHA7XG5cblx0cHJpdmF0ZSB2YWxpZGF0aW9uUmVnRXhQYXR0ZXJuITogUmVnRXhwO1xuXG5cdHByaXZhdGUgcGFyc2VSZWdFeFJlcGxhY2VyITogKHN1YnN0cmluZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4gc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKGZvcm1hdE9wdGlvbnM6IHsgZm9ybWF0OiBzdHJpbmc7IGNhbGVuZGFyVHlwZTogQ2FsZW5kYXJUeXBlIH0pIHtcblx0XHRjb25zdCBsb2NhbGUgPSBuZXcgTG9jYWxlKHNhcC51aS5nZXRDb3JlKCkuZ2V0Q29uZmlndXJhdGlvbigpLmdldExhbmd1YWdlKCkpLFxuXHRcdFx0bG9jYWxlRGF0YSA9IG5ldyBMb2NhbGVEYXRhKGxvY2FsZSk7XG5cblx0XHRsZXQgZm9ybWF0ID0gZm9ybWF0T3B0aW9ucy5mb3JtYXQ7XG5cdFx0aWYgKGZvcm1hdE9wdGlvbnMuZm9ybWF0Lmxlbmd0aCA+IDQpIHtcblx0XHRcdGZvcm1hdCA9IFwieU1cIjtcblx0XHR9IGVsc2UgaWYgKGZvcm1hdE9wdGlvbnMuZm9ybWF0ID09PSBcIlBQUFwiKSB7XG5cdFx0XHRmb3JtYXQgPSBcIk1cIjtcblx0XHR9XG5cblx0XHRsZXQgcGF0dGVybiA9IGxvY2FsZURhdGEuZ2V0Q3VzdG9tRGF0ZVRpbWVQYXR0ZXJuKGZvcm1hdCwgZm9ybWF0T3B0aW9ucy5jYWxlbmRhclR5cGUpO1xuXHRcdHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoLyhbXFx1NGUwMC1cXHU5ZmFmXFx1MzAwMC1cXHUzMDNmXFx1MzA0MC1cXHUzMDlmXFx1MzBhMC1cXHUzMGZmXFx1ZmYwMC1cXHVmZmVmXSkrL2dpLCBcIlwiKTtcblx0XHQvLyBQYXJzaW5nIHRoZSBcInlNXCIgZm9ybWF0IHBhdHRlcm4gdG8gdGhlIHBhdHRlcm4gdGhhdCB3b3VsZCBtYXRjaCB0aGUgcGFzc2VkIGZvcm1hdFxuXHRcdGlmIChmb3JtYXRPcHRpb25zLmZvcm1hdC5sZW5ndGggPiA0KSB7XG5cdFx0XHRwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC95Ky9pLCBmb3JtYXRPcHRpb25zLmZvcm1hdC5zbGljZSgwLCBmb3JtYXRPcHRpb25zLmZvcm1hdC5sYXN0SW5kZXhPZihcIllcIikgKyAxKSk7XG5cdFx0XHRwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC9tKy9pLCBmb3JtYXRPcHRpb25zLmZvcm1hdC5zbGljZShmb3JtYXRPcHRpb25zLmZvcm1hdC5sYXN0SW5kZXhPZihcIllcIikgKyAxKSk7XG5cdFx0fSBlbHNlIGlmIChmb3JtYXRPcHRpb25zLmZvcm1hdCA9PT0gXCJQUFBcIikge1xuXHRcdFx0cGF0dGVybiA9IFwiUFBQXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZm9ybWF0QXJyYXkgPSB0aGlzLnBhcnNlQ2FsZW5kYXJEYXRlUGF0dGVybihwYXR0ZXJuKTtcblx0XHR0aGlzLnBhdHRlcm4gPSBmb3JtYXRBcnJheS5sZW5ndGggPiAxID8gcGF0dGVybiA6IHVuZGVmaW5lZDtcblx0XHR0aGlzLl9zZXRGb3JtYXRSZWdleChmb3JtYXRBcnJheSk7XG5cdFx0dGhpcy5fc2V0UGFyc2VSZWdleChmb3JtYXRBcnJheSk7XG5cdFx0dGhpcy5fc2V0VmFsaWRhdGlvblJlZ2V4KGZvcm1hdEFycmF5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSBkYXRlIGluc3RhbmNlIG9mIHRoZSA8Y29kZT5GaXNjYWxGb3JtYXQ8L2NvZGU+IGNsYXNzLCB3aGljaCBjYW4gYmUgdXNlZCBmb3IgZm9ybWF0dGluZy5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT2JqZWN0IHRoYXQgZGVmaW5lcyBmb3JtYXQgb3B0aW9uc1xuXHQgKiBAcGFyYW0gZm9ybWF0T3B0aW9ucy5mb3JtYXQgRmlzY2FsIGZvcm1hdFxuXHQgKiBAcGFyYW0gZm9ybWF0T3B0aW9ucy5jYWxlbmRhclR5cGUgQ2FsZW5kYXIgdHlwZVxuXHQgKiBAcmV0dXJucyBJbnN0YW5jZSBvZiB0aGUgRmlzY2FsRm9ybWF0XG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGdldERhdGVJbnN0YW5jZShmb3JtYXRPcHRpb25zOiB7IGZvcm1hdDogc3RyaW5nOyBjYWxlbmRhclR5cGU6IENhbGVuZGFyVHlwZSB9KTogRmlzY2FsRm9ybWF0IHtcblx0XHRyZXR1cm4gbmV3IEZpc2NhbEZvcm1hdChmb3JtYXRPcHRpb25zKTtcblx0fVxuXG5cdHB1YmxpYyBnZXRQYXR0ZXJuKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMucGF0dGVybjtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb3JtYXQgdGhlIHJhdyBmaXNjYWwgZGF0YSB0byBhIGxvY2FsZS1kZXBlbmRlbnQgZm9ybWF0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHBhcmFtZXRlciBjb250YWluaW5nIGEgcmF3IGZpc2NhbCB2YWx1ZVxuXHQgKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHZhbHVlXG5cdCAqL1xuXHRwdWJsaWMgZm9ybWF0KHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuKTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB7XG5cdFx0aWYgKHZhbHVlID09IG51bGwpIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5mb3JtYXRSZWdFeFBhdHRlcm4sIHRoaXMuZm9ybWF0UmVnRXhHcm91cHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGZyb20gYSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdCB0byBhIHJhdyB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBzdHJpbmcgY29udGFpbmluZyBhIHBhcnNlZCBmaXNjYWwgZGF0YSB2YWx1ZVxuXHQgKiBAcmV0dXJucyBUaGUgcmF3IHZhbHVlXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCF2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMucGFyc2VSZWdFeFBhdHRlcm4sIHRoaXMucGFyc2VSZWdFeFJlcGxhY2VyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0ZXMgdGhlIGRhdGEgaW5wdXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgcmF3IGZpc2NhbCBkYXRhXG5cdCAqIEByZXR1cm5zIElmIDxjb2RlPnRydWU8L2NvZGU+IHRoZSB2YWxpZGF0aW9uIHBhc3Nlcywgb3RoZXJ3aXNlIDxjb2RlPmZhbHNlPC9jb2RlPlxuXHQgKi9cblx0cHVibGljIHZhbGlkYXRlKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52YWxpZGF0aW9uUmVnRXhQYXR0ZXJuLnRlc3QodmFsdWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIHRoZSBkYXRlIHBhdHRlcm4gc3RyaW5nIGFuZCBjcmVhdGUgYSBmb3JtYXQgYXJyYXkgZnJvbSBpdC5cblx0ICogQXJyYXkgaXMgdXNlZCBmb3IgZGF0YSBwYXJzaW5nIGFuZCBmb3JtYXR0aW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0dGVybiBUaGUgY2FsZW5kYXIgZGF0ZSBwYXR0ZXJuIHN0cmluZ1xuXHQgKiBAcmV0dXJucyBGb3JtYXQgYXJyYXlcblx0ICovXG5cdHByaXZhdGUgcGFyc2VDYWxlbmRhckRhdGVQYXR0ZXJuKHBhdHRlcm46IHN0cmluZyk6IHsgZGlnaXRzOiBudW1iZXI7IHZhbHVlOiBzdHJpbmc7IHN5bWJvbDogc3RyaW5nIH1bXSB7XG5cdFx0Y29uc3QgZm9ybWF0QXJyYXkgPSBbXTtcblx0XHRsZXQgY2hhcixcblx0XHRcdGN1cnJlbnRPYmplY3QgPSB7IGRpZ2l0czogMCwgdmFsdWU6IFwiXCIsIHN5bWJvbDogXCJcIiB9O1xuXG5cdFx0Zm9yIChjb25zdCBjdXJDaGFyIG9mIHBhdHRlcm4pIHtcblx0XHRcdGlmIChjaGFyICE9PSBjdXJDaGFyKSB7XG5cdFx0XHRcdGN1cnJlbnRPYmplY3QgPSB7IGRpZ2l0czogMCwgdmFsdWU6IFwiXCIsIHN5bWJvbDogXCJcIiB9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VycmVudE9iamVjdC5kaWdpdHMgKz0gMTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgRmlzY2FsRm9ybWF0LnN5bWJvbHNbY3VyQ2hhciBhcyBrZXlvZiB0eXBlb2YgRmlzY2FsRm9ybWF0LnN5bWJvbHNdID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdGN1cnJlbnRPYmplY3QudmFsdWUgPSBjdXJDaGFyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VycmVudE9iamVjdC5zeW1ib2wgPSBjdXJDaGFyO1xuXHRcdFx0XHRjdXJyZW50T2JqZWN0LmRpZ2l0cyA9IDE7XG5cdFx0XHR9XG5cdFx0XHRjaGFyID0gY3VyQ2hhcjtcblx0XHRcdGZvcm1hdEFycmF5LnB1c2goY3VycmVudE9iamVjdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZvcm1hdEFycmF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIGZvcm1hdHRpbmcgcmVndWxhciBleHByZXNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdC5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1hdEFycmF5IEFuIGFycmF5IHdpdGggdGhlIGxvY2FsZS1kZXBlbmRlbnQgZm9ybWF0XG5cdCAqL1xuXHRwcml2YXRlIF9zZXRGb3JtYXRSZWdleChmb3JtYXRBcnJheTogeyBkaWdpdHM6IG51bWJlcjsgdmFsdWU6IHN0cmluZzsgc3ltYm9sOiBzdHJpbmcgfVtdKTogdm9pZCB7XG5cdFx0Y29uc3QgcmVnRXhQYXR0ZXJuID0gW10sXG5cdFx0XHRyZWdFeEdyb3VwcyA9IFtdO1xuXHRcdGxldCBwYXJ0LCBzeW1ib2wsIHJlZ2V4LCB5ZWFyO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZm9ybWF0QXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRcdHBhcnQgPSBmb3JtYXRBcnJheVtpXTtcblx0XHRcdHN5bWJvbCA9IHBhcnQuc3ltYm9sO1xuXHRcdFx0cmVnZXggPSBGaXNjYWxGb3JtYXQuc3ltYm9sc1tzeW1ib2wgYXMga2V5b2YgdHlwZW9mIEZpc2NhbEZvcm1hdC5zeW1ib2xzXS5mb3JtYXQ7XG5cblx0XHRcdGlmIChzeW1ib2wgPT09IFwiXCIpIHtcblx0XHRcdFx0cmVnRXhHcm91cHNbaV0gPSBwYXJ0LnZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmIChzeW1ib2wudG9Mb2NhbGVMb3dlckNhc2UoKSA9PT0gXCJ5XCIpIHtcblx0XHRcdFx0cmVnRXhQYXR0ZXJuLnVuc2hpZnQoXCIoXCIgKyByZWdleC5zb3VyY2UgKyBcIilcIik7XG5cdFx0XHRcdHJlZ0V4R3JvdXBzW2ldID0gXCIkXCIgKyAxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVnRXhQYXR0ZXJuLnB1c2goXCIoXCIgKyByZWdleC5zb3VyY2UgKyBcIilcIik7XG5cdFx0XHRcdHllYXIgPSBmb3JtYXRBcnJheS5zb21lKGZ1bmN0aW9uIChwYXJ0RW50cnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gcGFydEVudHJ5LnN5bWJvbC50b0xvd2VyQ2FzZSgpID09PSBcInlcIjtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJlZ0V4R3JvdXBzW2ldID0geWVhciA/IFwiJFwiICsgMiA6IFwiJFwiICsgMTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmZvcm1hdFJlZ0V4UGF0dGVybiA9IG5ldyBSZWdFeHAocmVnRXhQYXR0ZXJuLmpvaW4oXCJcIikpO1xuXHRcdHRoaXMuZm9ybWF0UmVnRXhHcm91cHMgPSByZWdFeEdyb3Vwcy5qb2luKFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIHBhcnNpbmcgcmVndWxhciBleHByZXNzaW9uIGJhc2VkIG9uIHRoZSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdC5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1hdEFycmF5IEFuIGFycmF5IHdpdGggdGhlIGxvY2FsZS1kZXBlbmRlbnQgZm9ybWF0XG5cdCAqL1xuXHRwcml2YXRlIF9zZXRQYXJzZVJlZ2V4KGZvcm1hdEFycmF5OiB7IGRpZ2l0czogbnVtYmVyOyB2YWx1ZTogc3RyaW5nOyBzeW1ib2w6IHN0cmluZyB9W10pOiB2b2lkIHtcblx0XHRjb25zdCByZWdFeFBhdHRlcm4gPSBbXSxcblx0XHRcdGZpbHRlcmVkRm9ybWF0OiB7IFtpbmRleDogc3RyaW5nXTogeyBkaWdpdHM6IG51bWJlcjsgdmFsdWU6IHN0cmluZzsgc3ltYm9sOiBzdHJpbmcgfSB9ID0ge307XG5cdFx0bGV0IHN5bWJvbCxcblx0XHRcdHJlZ2V4LFxuXHRcdFx0Y3Vyckdyb3VwOiBudW1iZXIsXG5cdFx0XHRncm91cCA9IDA7XG5cdFx0Zm9yIChjb25zdCBwYXJ0IG9mIGZvcm1hdEFycmF5KSB7XG5cdFx0XHRzeW1ib2wgPSBwYXJ0LnN5bWJvbDtcblxuXHRcdFx0aWYgKHN5bWJvbCA9PT0gXCJcIikge1xuXHRcdFx0XHRyZWdFeFBhdHRlcm4ucHVzaChcIlxcXFxEKz9cIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWdleCA9IEZpc2NhbEZvcm1hdC5zeW1ib2xzW3N5bWJvbCBhcyBrZXlvZiB0eXBlb2YgRmlzY2FsRm9ybWF0LnN5bWJvbHNdLnBhcnNlO1xuXHRcdFx0XHRyZWdFeFBhdHRlcm4ucHVzaChcIihcIiArIHJlZ2V4LnNvdXJjZSArIFwiKVwiKTtcblx0XHRcdFx0Y3Vyckdyb3VwID0gKytncm91cDtcblx0XHRcdFx0ZmlsdGVyZWRGb3JtYXRbY3Vyckdyb3VwXSA9IHBhcnQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMucGFyc2VSZWdFeFBhdHRlcm4gPSBuZXcgUmVnRXhwKFwiXlwiICsgcmVnRXhQYXR0ZXJuLmpvaW4oXCJcIikgKyBcIiRcIik7XG5cdFx0dGhpcy5wYXJzZVJlZ0V4UmVwbGFjZXIgPSB0aGlzLmdldFJlZ0V4UmVwbGFjZXIoZmlsdGVyZWRGb3JtYXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gcmVwbGFjZSBzdHJpbmdzIGFuZCB0aGVuIHBlcmZvcm1zIHJhdyBzdHJpbmcgcGFyc2luZy5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlcmVkRm9ybWF0IEFuIGFycmF5IHdpdGggdGhlIGxvY2FsZS1kZXBlbmRlbnQgZm9ybWF0XG5cdCAqIEByZXR1cm5zIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZSBzdHJpbmcucmVwbGFjZSBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBnZXRSZWdFeFJlcGxhY2VyKGZpbHRlcmVkRm9ybWF0OiB7XG5cdFx0W2luZGV4OiBzdHJpbmddOiB7IGRpZ2l0czogbnVtYmVyOyB2YWx1ZTogc3RyaW5nOyBzeW1ib2w6IHN0cmluZyB9O1xuXHR9KTogKHN1YnN0cmluZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkgPT4gc3RyaW5nIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBbXTtcblx0XHRcdGxldCB2YWx1ZVBhcnQsIHN0cmluZ0dyb3VwO1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gZmlsdGVyZWRGb3JtYXQpIHtcblx0XHRcdFx0dmFsdWVQYXJ0ID0gZmlsdGVyZWRGb3JtYXRba2V5XTtcblx0XHRcdFx0c3RyaW5nR3JvdXAgPSBhcmdzW3BhcnNlSW50KGtleSwgMTApXTtcblx0XHRcdFx0aWYgKHN0cmluZ0dyb3VwLmxlbmd0aCA8IHZhbHVlUGFydC5kaWdpdHMpIHtcblx0XHRcdFx0XHRpZiAodmFsdWVQYXJ0LnN5bWJvbC50b0xvd2VyQ2FzZSgpID09PSBcInlcIikge1xuXHRcdFx0XHRcdFx0c3RyaW5nR3JvdXAgPSBwYXJzZVllYXIoc3RyaW5nR3JvdXApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzdHJpbmdHcm91cCA9IHN0cmluZ0dyb3VwLnBhZFN0YXJ0KHZhbHVlUGFydC5kaWdpdHMsIFwiMFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHZhbHVlUGFydC5zeW1ib2wudG9Mb3dlckNhc2UoKSA9PT0gXCJ5XCIpIHtcblx0XHRcdFx0XHRyZXN1bHQudW5zaGlmdChzdHJpbmdHcm91cCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goc3RyaW5nR3JvdXApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbihcIlwiKTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIHZhbGlkYXRpb24gcmVndWxhciBleHByZXNzaW9uIGJhc2VkIG9uIHRoZSBmb3JtYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtYXRBcnJheSBBbiBhcnJheSB3aXRoIHRoZSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdFxuXHQgKi9cblx0cHJpdmF0ZSBfc2V0VmFsaWRhdGlvblJlZ2V4KGZvcm1hdEFycmF5OiB7IGRpZ2l0czogbnVtYmVyOyB2YWx1ZTogc3RyaW5nOyBzeW1ib2w6IHN0cmluZyB9W10pOiB2b2lkIHtcblx0XHRjb25zdCByZWdFeFBhdHRlcm4gPSBbXTtcblx0XHRsZXQgc3ltYm9sLCByZWdleDtcblx0XHRmb3IgKGNvbnN0IHBhcnQgb2YgZm9ybWF0QXJyYXkpIHtcblx0XHRcdHN5bWJvbCA9IHBhcnQuc3ltYm9sO1xuXHRcdFx0cmVnZXggPSBGaXNjYWxGb3JtYXQuc3ltYm9sc1tzeW1ib2wgYXMga2V5b2YgdHlwZW9mIEZpc2NhbEZvcm1hdC5zeW1ib2xzXS5mb3JtYXQ7XG5cdFx0XHRpZiAoc3ltYm9sID09PSBcIlwiKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fSBlbHNlIGlmIChzeW1ib2wudG9Mb3dlckNhc2UoKSA9PT0gXCJ5XCIpIHtcblx0XHRcdFx0cmVnRXhQYXR0ZXJuLnVuc2hpZnQocmVnZXguc291cmNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlZ0V4UGF0dGVybi5wdXNoKHJlZ2V4LnNvdXJjZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMudmFsaWRhdGlvblJlZ0V4UGF0dGVybiA9IG5ldyBSZWdFeHAoXCJeKFwiICsgcmVnRXhQYXR0ZXJuLmpvaW4oXCIpKFwiKSArIFwiKSRcIik7XG5cdH1cblxuXHQvKipcblx0ICogUmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5zIHVzZWQgdG8gZm9ybWF0IGZpc2NhbCBkYXRlIHN0cmluZ3Ncblx0ICovXG5cdHByaXZhdGUgc3RhdGljIHJlZ2V4Rm9ybWF0UGF0dGVybnMgPSB7XG5cdFx0eWVhcjogL1sxLTldXFxkezN9Lyxcblx0XHRwZXJpb2Q6IC9cXGR7M30vLFxuXHRcdHF1YXJ0ZXI6IC9bMS00XS8sXG5cdFx0d2VlazogLzBbMS05XXxbMS00XVxcZHw1WzAtM10vLFxuXHRcdGRheTogLzM3MXwzNzB8M1swLTZdXFxkfFsxLTJdXFxkezJ9fFsxLTldXFxkfFsxLTldL1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gcGF0dGVybnMgdXNlZCBmb3IgcmF3IGRhdGEgcGFyc2luZyBhbmQgdmFsaWRhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgcmVnZXhQYXJzZVBhdHRlcm5zID0ge1xuXHRcdHllYXI6IC9cXGR7MSw0fS8sXG5cdFx0cGVyaW9kOiAvXFxkezEsM30vLFxuXHRcdHF1YXJ0ZXI6IC9bMS00XS8sXG5cdFx0d2VlazogL1xcZHsxLDJ9Lyxcblx0XHRkYXk6IC9bMS05XS9cblx0fTtcblxuXHQvKipcblx0ICogTWFwcGluZyBmcm9tIHNwZWNpZmljIGNhbGVuZGFyIHR5cGUgdG8gY29ycmVzcG9uZGluZyBmb3JtYXR0aW5nL3BhcnNpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgc3ltYm9scyA9IHtcblx0XHRcIlwiOiB7IGZvcm1hdDogLyAvLCBwYXJzZTogLyAvIH0sIC8vIFwidGV4dFwiXG5cdFx0eTogeyBmb3JtYXQ6IEZpc2NhbEZvcm1hdC5yZWdleEZvcm1hdFBhdHRlcm5zLnllYXIsIHBhcnNlOiBGaXNjYWxGb3JtYXQucmVnZXhQYXJzZVBhdHRlcm5zLnllYXIgfSwgLy8gXCJ5ZWFyXCJcblx0XHRZOiB7IGZvcm1hdDogRmlzY2FsRm9ybWF0LnJlZ2V4Rm9ybWF0UGF0dGVybnMueWVhciwgcGFyc2U6IEZpc2NhbEZvcm1hdC5yZWdleFBhcnNlUGF0dGVybnMueWVhciB9LCAvLyBcIndlZWtZZWFyXCJcblx0XHRQOiB7IGZvcm1hdDogRmlzY2FsRm9ybWF0LnJlZ2V4Rm9ybWF0UGF0dGVybnMucGVyaW9kLCBwYXJzZTogRmlzY2FsRm9ybWF0LnJlZ2V4UGFyc2VQYXR0ZXJucy5wZXJpb2QgfSwgLy8gXCJwZXJpb2RcIlxuXHRcdFc6IHsgZm9ybWF0OiBGaXNjYWxGb3JtYXQucmVnZXhGb3JtYXRQYXR0ZXJucy53ZWVrLCBwYXJzZTogRmlzY2FsRm9ybWF0LnJlZ2V4UGFyc2VQYXR0ZXJucy53ZWVrIH0sIC8vIFwid2Vla0luWWVhclwiXG5cdFx0ZDogeyBmb3JtYXQ6IEZpc2NhbEZvcm1hdC5yZWdleEZvcm1hdFBhdHRlcm5zLmRheSwgcGFyc2U6IEZpc2NhbEZvcm1hdC5yZWdleFBhcnNlUGF0dGVybnMuZGF5IH0sIC8vIFwiZGF5SW5ZZWFyXCJcblx0XHRROiB7IGZvcm1hdDogRmlzY2FsRm9ybWF0LnJlZ2V4Rm9ybWF0UGF0dGVybnMucXVhcnRlciwgcGFyc2U6IEZpc2NhbEZvcm1hdC5yZWdleFBhcnNlUGF0dGVybnMucXVhcnRlciB9LCAvLyBcInF1YXJ0ZXJcIlxuXHRcdHE6IHsgZm9ybWF0OiBGaXNjYWxGb3JtYXQucmVnZXhGb3JtYXRQYXR0ZXJucy5xdWFydGVyLCBwYXJzZTogRmlzY2FsRm9ybWF0LnJlZ2V4UGFyc2VQYXR0ZXJucy5xdWFydGVyIH0gLy9cInF1YXJ0ZXJTdGFuZGFsb25lXCJcblx0fTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIFllYXIgZm9ybWF0LiBUaGlzIGlzIGhvdyB0aGUgRGF0ZUZvcm1hdCBwYXJzZXMgeWVhcnMsIGV4Y2VwdCB0aG9zZSB5ZWFycyBjb25zaXN0aW5nIG9mIDMgZGlnaXRzLCBzaW5jZSBjdXJyZW5jeSBmaXNjYWwgZGF0ZXMgc3VwcG9ydCBvbmx5IHllYXJzIGNvbnNpc3Rpbmcgb2YgNCBkaWdpdHMuXG4gKlxuICogQHBhcmFtIHllYXIgWWVhciBzdHJpbmdcbiAqIEByZXR1cm5zIFllYXIgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlWWVhcih5ZWFyOiBzdHJpbmcpOiBudW1iZXIge1xuXHRsZXQgcGFyc2VkWWVhciA9IE51bWJlci5wYXJzZUludCh5ZWFyLCAxMCk7XG5cdGNvbnN0IGN1cnJlbnRZZWFyID0gbmV3IERhdGUoKS5nZXRVVENGdWxsWWVhcigpLFxuXHRcdGN1cnJlbnRDZW50dXJ5ID0gTWF0aC5mbG9vcihjdXJyZW50WWVhciAvIDEwMCksXG5cdFx0eWVhckRpZmYgPSBjdXJyZW50Q2VudHVyeSAqIDEwMCArIHBhcnNlZFllYXIgLSBjdXJyZW50WWVhcjtcblxuXHRpZiAoeWVhci5sZW5ndGggPT09IDMpIHtcblx0XHRwYXJzZWRZZWFyICs9IE1hdGguZmxvb3IoKGN1cnJlbnRDZW50dXJ5IC0gMSkgLyAxMCkgKiAxMDAwO1xuXHR9IGVsc2UgaWYgKHllYXJEaWZmIDwgLTcwKSB7XG5cdFx0cGFyc2VkWWVhciArPSAoY3VycmVudENlbnR1cnkgKyAxKSAqIDEwMDsgLy8gVGFrZSBuZXh0IGNlbnR1cnkgaWYgXCJ5ZWFyXCIgaXMgMzAgeWVhcnMgaW4gdGhlIGZ1dHVyZS4gQ3VycmVudCB5ZWFyIDE5OTkgYW5kIHdlIGVudGVyIDI4IGl0IHdpbGwgd2UgMjAyOFxuXHR9IGVsc2UgaWYgKHllYXJEaWZmIDwgMzApIHtcblx0XHRwYXJzZWRZZWFyICs9IGN1cnJlbnRDZW50dXJ5ICogMTAwOyAvLyBUYWtlIG5leHQgY2VudHVyeSBpZiBcInllYXJcIiBpcyAzMCB5ZWFycyBpbiB0aGUgZnV0dXJlLiBDdXJyZW50IHllYXIgMjAwMCBhbmQgd2UgZW50ZXIgMjkgaXQgd2lsbCB3ZSAyMDI5XG5cdH0gZWxzZSB7XG5cdFx0cGFyc2VkWWVhciArPSAoY3VycmVudENlbnR1cnkgLSAxKSAqIDEwMDsgLy8gQW55IGVudGVyZWQgXCJ5ZWFyXCIgdGhhdCBpcyBtb3JlIHRoYW4gMzAgeWVhcnMgaW4gdGhlIGZ1dHVyZSB3aWxsIGJlIHRyZWF0ZWQgYXMgZnJvbSBwcmV2aW91cyBjZW50dXJ5XG5cdH1cblx0cmV0dXJuIHBhcnNlZFllYXI7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBZEEsSUFlcUJBLFlBQVk7SUFhaEMsc0JBQVlDLGFBQTZELEVBQUU7TUFDMUUsTUFBTUMsTUFBTSxHQUFHLElBQUlDLE1BQU0sQ0FBQ0MsR0FBRyxDQUFDQyxFQUFFLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxnQkFBZ0IsRUFBRSxDQUFDQyxXQUFXLEVBQUUsQ0FBQztRQUMzRUMsVUFBVSxHQUFHLElBQUlDLFVBQVUsQ0FBQ1IsTUFBTSxDQUFDO01BRXBDLElBQUlTLE1BQU0sR0FBR1YsYUFBYSxDQUFDVSxNQUFNO01BQ2pDLElBQUlWLGFBQWEsQ0FBQ1UsTUFBTSxDQUFDQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3BDRCxNQUFNLEdBQUcsSUFBSTtNQUNkLENBQUMs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