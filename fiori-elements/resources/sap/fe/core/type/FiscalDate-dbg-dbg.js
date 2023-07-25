/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/FiscalFormat", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/CalendarType", "sap/ui/core/Core", "sap/ui/model/odata/type/String", "sap/ui/model/ValidateException"], function (FiscalFormat, ClassSupport, CalendarType, Core, ODataStringType, ValidateException) {
  "use strict";

  var _dec, _class, _class2;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Define the UI5 class for a type of fiscal date.
   *
   * @class The data type Fiscal Date supports the parsing and formatting of fiscal dates that follow the pattern 'yM'
   * @param formatOptions Format options
   * @param formatOptions.fiscalType String with a fiscal annotation type
   * @param constraints Constraints
   * @since 1.110.0
   * @experimental
   * @extends sap.ui.model.odata.type.String
   * @alias {sap.fe.core.type.FiscalDate} The implementation of the fiscal date
   */
  let FiscalDate = (_dec = defineUI5Class("sap.fe.core.type.FiscalDate"), _dec(_class = (_class2 = /*#__PURE__*/function (_ODataStringType) {
    _inheritsLoose(FiscalDate, _ODataStringType);
    function FiscalDate(formatOptions, constraints) {
      var _this;
      if ((formatOptions.fiscalType === "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod" || formatOptions.fiscalType === "com.sap.vocabularies.Common.v1.IsFiscalYearQuarter" || formatOptions.fiscalType === "com.sap.vocabularies.Common.v1.IsFiscalYearWeek") && constraints !== null && constraints !== void 0 && constraints.maxLength) {
        // We increase maxLength for +1 for any fiscal type that have delimiter in locale format.
        // It's necessary for validation to work correctly.
        // Also for validation to function properly user also should specify constraints.isDigitSequence = true
        // isDigitSequence and maxLength combination ensures that missing characters will be populated with leading zeros
        // that will ensure user will receive correct validation results.
        constraints.maxLength = constraints.maxLength + 1;
      }
      _this = _ODataStringType.call(this, formatOptions, constraints) || this;
      _this.annotationType = formatOptions.fiscalType;
      const format = FiscalDate.dateFormats[_this.annotationType];
      if (format) {
        _this.formatter = FiscalFormat.getDateInstance({
          format,
          calendarType: CalendarType.Gregorian
        });
      }
      return _this;
    }

    /**
     * Return pattern for fiscal date type.
     *
     * @returns The fiscal date pattern
     */
    var _proto = FiscalDate.prototype;
    _proto.getPattern = function getPattern() {
      var _this$formatter;
      return (_this$formatter = this.formatter) === null || _this$formatter === void 0 ? void 0 : _this$formatter.getPattern();
    }

    /**
     * Formats the given value to the given fiscal type.
     *
     * @param value The value to be formatted
     * @returns The formatted output value; <code>undefined</code> is always formatted to <code>null</code>
     * @override
     */;
    _proto.formatValue = function formatValue(value, targetType) {
      return this.formatter ? this.formatter.format(_ODataStringType.prototype.formatValue.call(this, value, targetType)) : _ODataStringType.prototype.formatValue.call(this, value, targetType);
    }

    /**
     * Parses the given value, which is expected to be of the fiscal type, to a string.
     *
     * @param value The value to be parsed
     * @returns The parsed value
     * @override
     */;
    _proto.parseValue = function parseValue(value, sourceType) {
      return this.formatter ? this.formatter.parse(_ODataStringType.prototype.parseValue.call(this, value, sourceType)) : _ODataStringType.prototype.parseValue.call(this, value, sourceType);
    }

    /**
     * @inheritDoc
     */;
    _proto.validateValue = function validateValue(value) {
      try {
        _ODataStringType.prototype.validateValue.call(this, value);
      } catch (error) {
        if (!this.formatter) {
          throw error;
        }
        if (!this.formatter.validate(value)) {
          throw new ValidateException(this.getErrorMessage(this.annotationType));
        }
      }
      if (!this.formatter || value === "" || value === null) {
        return;
      }
      if (!this.formatter.validate(value)) {
        throw new ValidateException(this.getErrorMessage(this.annotationType));
      }
    }

    /**
     * Returns the matching locale-dependent error message for the type based on the fiscal annotation.
     *
     * @param annotationType The fiscal annotation type
     * @returns The locale-dependent error message
     */;
    _proto.getErrorMessage = function getErrorMessage(annotationType) {
      let sValue = "";
      this.fullYear = this.fullYear || new Date().getFullYear().toString();
      switch (annotationType) {
        case "com.sap.vocabularies.Common.v1.IsFiscalYear":
          sValue = this.fullYear;
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalPeriod":
          sValue = "001";
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalYearPeriod":
          sValue = this.fullYear + "001";
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalQuarter":
          sValue = "1";
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalYearQuarter":
          sValue = this.fullYear + "1";
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalWeek":
          sValue = "01";
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalYearWeek":
          sValue = this.fullYear + "01";
          break;
        case "com.sap.vocabularies.Common.v1.IsDayOfFiscalYear":
          sValue = "1";
          break;
        case "com.sap.vocabularies.Common.v1.IsFiscalYearVariant":
          break;
        default:
          sValue = this.fullYear;
      }
      return Core.getLibraryResourceBundle("sap.fe.core").getText("FISCAL_VALIDATION_FAILS", [this.formatValue(sValue, "string")]);
    }

    /**
     * @inheritDoc
     */;
    _proto.getName = function getName() {
      return "sap.fe.core.type.FiscalDate";
    }

    /**
     * Returns the formatter that is assigned to this particular FiscalDate type.
     *
     * @returns The assigned instance of FiscalFormat
     */;
    _proto.getFormatter = function getFormatter() {
      return this.formatter;
    };
    return FiscalDate;
  }(ODataStringType), _class2.dateFormats = {
    ["com.sap.vocabularies.Common.v1.IsFiscalYear"]: "YYYY",
    ["com.sap.vocabularies.Common.v1.IsFiscalPeriod"]: "PPP",
    ["com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"]: "YYYYPPP",
    ["com.sap.vocabularies.Common.v1.IsFiscalQuarter"]: "Q",
    ["com.sap.vocabularies.Common.v1.IsFiscalYearQuarter"]: "YYYYQ",
    ["com.sap.vocabularies.Common.v1.IsFiscalWeek"]: "WW",
    ["com.sap.vocabularies.Common.v1.IsFiscalYearWeek"]: "YYYYWW",
    ["com.sap.vocabularies.Common.v1.IsDayOfFiscalYear"]: "d",
    ["com.sap.vocabularies.Common.v1.IsFiscalYearVariant"]: ""
  }, _class2)) || _class);
  return FiscalDate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaXNjYWxEYXRlIiwiZGVmaW5lVUk1Q2xhc3MiLCJmb3JtYXRPcHRpb25zIiwiY29uc3RyYWludHMiLCJmaXNjYWxUeXBlIiwibWF4TGVuZ3RoIiwiYW5ub3RhdGlvblR5cGUiLCJmb3JtYXQiLCJkYXRlRm9ybWF0cyIsImZvcm1hdHRlciIsIkZpc2NhbEZvcm1hdCIsImdldERhdGVJbnN0YW5jZSIsImNhbGVuZGFyVHlwZSIsIkNhbGVuZGFyVHlwZSIsIkdyZWdvcmlhbiIsImdldFBhdHRlcm4iLCJmb3JtYXRWYWx1ZSIsInZhbHVlIiwidGFyZ2V0VHlwZSIsInBhcnNlVmFsdWUiLCJzb3VyY2VUeXBlIiwicGFyc2UiLCJ2YWxpZGF0ZVZhbHVlIiwiZXJyb3IiLCJ2YWxpZGF0ZSIsIlZhbGlkYXRlRXhjZXB0aW9uIiwiZ2V0RXJyb3JNZXNzYWdlIiwic1ZhbHVlIiwiZnVsbFllYXIiLCJEYXRlIiwiZ2V0RnVsbFllYXIiLCJ0b1N0cmluZyIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJnZXRUZXh0IiwiZ2V0TmFtZSIsImdldEZvcm1hdHRlciIsIk9EYXRhU3RyaW5nVHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlzY2FsRGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IEZpc2NhbEZvcm1hdCBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9GaXNjYWxGb3JtYXRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ2FsZW5kYXJUeXBlIGZyb20gXCJzYXAvdWkvY29yZS9DYWxlbmRhclR5cGVcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgT0RhdGFTdHJpbmdUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdHlwZS9TdHJpbmdcIjtcbmltcG9ydCBWYWxpZGF0ZUV4Y2VwdGlvbiBmcm9tIFwic2FwL3VpL21vZGVsL1ZhbGlkYXRlRXhjZXB0aW9uXCI7XG5cbi8qKlxuICogRGVmaW5lIHRoZSBVSTUgY2xhc3MgZm9yIGEgdHlwZSBvZiBmaXNjYWwgZGF0ZS5cbiAqXG4gKiBAY2xhc3MgVGhlIGRhdGEgdHlwZSBGaXNjYWwgRGF0ZSBzdXBwb3J0cyB0aGUgcGFyc2luZyBhbmQgZm9ybWF0dGluZyBvZiBmaXNjYWwgZGF0ZXMgdGhhdCBmb2xsb3cgdGhlIHBhdHRlcm4gJ3lNJ1xuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgRm9ybWF0IG9wdGlvbnNcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zLmZpc2NhbFR5cGUgU3RyaW5nIHdpdGggYSBmaXNjYWwgYW5ub3RhdGlvbiB0eXBlXG4gKiBAcGFyYW0gY29uc3RyYWludHMgQ29uc3RyYWludHNcbiAqIEBzaW5jZSAxLjExMC4wXG4gKiBAZXhwZXJpbWVudGFsXG4gKiBAZXh0ZW5kcyBzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcbiAqIEBhbGlhcyB7c2FwLmZlLmNvcmUudHlwZS5GaXNjYWxEYXRlfSBUaGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGZpc2NhbCBkYXRlXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnR5cGUuRmlzY2FsRGF0ZVwiKVxuY2xhc3MgRmlzY2FsRGF0ZSBleHRlbmRzIE9EYXRhU3RyaW5nVHlwZSB7XG5cdHByaXZhdGUgYW5ub3RhdGlvblR5cGU6IENvbW1vbkFubm90YXRpb25UZXJtcyB8IHVuZGVmaW5lZDtcblxuXHRwcml2YXRlIGZ1bGxZZWFyOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0cHJpdmF0ZSBzdGF0aWMgZGF0ZUZvcm1hdHMgPSB7XG5cdFx0W0NvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJdOiBcIllZWVlcIixcblx0XHRbQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsUGVyaW9kXTogXCJQUFBcIixcblx0XHRbQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsWWVhclBlcmlvZF06IFwiWVlZWVBQUFwiLFxuXHRcdFtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxRdWFydGVyXTogXCJRXCIsXG5cdFx0W0NvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJRdWFydGVyXTogXCJZWVlZUVwiLFxuXHRcdFtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxXZWVrXTogXCJXV1wiLFxuXHRcdFtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyV2Vla106IFwiWVlZWVdXXCIsXG5cdFx0W0NvbW1vbkFubm90YXRpb25UZXJtcy5Jc0RheU9mRmlzY2FsWWVhcl06IFwiZFwiLFxuXHRcdFtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyVmFyaWFudF06IFwiXCJcblx0fTtcblxuXHRwcml2YXRlIGZvcm1hdHRlcjogRmlzY2FsRm9ybWF0IHwgdW5kZWZpbmVkO1xuXG5cdGNvbnN0cnVjdG9yKGZvcm1hdE9wdGlvbnM6IGFueSwgY29uc3RyYWludHM6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdChmb3JtYXRPcHRpb25zLmZpc2NhbFR5cGUgPT09IENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJQZXJpb2QgfHxcblx0XHRcdFx0Zm9ybWF0T3B0aW9ucy5maXNjYWxUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyUXVhcnRlciB8fFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zLmZpc2NhbFR5cGUgPT09IENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJXZWVrKSAmJlxuXHRcdFx0Y29uc3RyYWludHM/Lm1heExlbmd0aFxuXHRcdCkge1xuXHRcdFx0Ly8gV2UgaW5jcmVhc2UgbWF4TGVuZ3RoIGZvciArMSBmb3IgYW55IGZpc2NhbCB0eXBlIHRoYXQgaGF2ZSBkZWxpbWl0ZXIgaW4gbG9jYWxlIGZvcm1hdC5cblx0XHRcdC8vIEl0J3MgbmVjZXNzYXJ5IGZvciB2YWxpZGF0aW9uIHRvIHdvcmsgY29ycmVjdGx5LlxuXHRcdFx0Ly8gQWxzbyBmb3IgdmFsaWRhdGlvbiB0byBmdW5jdGlvbiBwcm9wZXJseSB1c2VyIGFsc28gc2hvdWxkIHNwZWNpZnkgY29uc3RyYWludHMuaXNEaWdpdFNlcXVlbmNlID0gdHJ1ZVxuXHRcdFx0Ly8gaXNEaWdpdFNlcXVlbmNlIGFuZCBtYXhMZW5ndGggY29tYmluYXRpb24gZW5zdXJlcyB0aGF0IG1pc3NpbmcgY2hhcmFjdGVycyB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGxlYWRpbmcgemVyb3Ncblx0XHRcdC8vIHRoYXQgd2lsbCBlbnN1cmUgdXNlciB3aWxsIHJlY2VpdmUgY29ycmVjdCB2YWxpZGF0aW9uIHJlc3VsdHMuXG5cdFx0XHRjb25zdHJhaW50cy5tYXhMZW5ndGggPSBjb25zdHJhaW50cy5tYXhMZW5ndGggKyAxO1xuXHRcdH1cblx0XHRzdXBlcihmb3JtYXRPcHRpb25zLCBjb25zdHJhaW50cyk7XG5cdFx0dGhpcy5hbm5vdGF0aW9uVHlwZSA9IGZvcm1hdE9wdGlvbnMuZmlzY2FsVHlwZTtcblx0XHRjb25zdCBmb3JtYXQgPSBGaXNjYWxEYXRlLmRhdGVGb3JtYXRzW3RoaXMuYW5ub3RhdGlvblR5cGUgYXMga2V5b2YgdHlwZW9mIEZpc2NhbERhdGUuZGF0ZUZvcm1hdHNdO1xuXHRcdGlmIChmb3JtYXQpIHtcblx0XHRcdHRoaXMuZm9ybWF0dGVyID0gRmlzY2FsRm9ybWF0LmdldERhdGVJbnN0YW5jZSh7XG5cdFx0XHRcdGZvcm1hdCxcblx0XHRcdFx0Y2FsZW5kYXJUeXBlOiBDYWxlbmRhclR5cGUuR3JlZ29yaWFuXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIHBhdHRlcm4gZm9yIGZpc2NhbCBkYXRlIHR5cGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBmaXNjYWwgZGF0ZSBwYXR0ZXJuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0UGF0dGVybigpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLmZvcm1hdHRlcj8uZ2V0UGF0dGVybigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZvcm1hdHMgdGhlIGdpdmVuIHZhbHVlIHRvIHRoZSBnaXZlbiBmaXNjYWwgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBiZSBmb3JtYXR0ZWRcblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBvdXRwdXQgdmFsdWU7IDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaXMgYWx3YXlzIGZvcm1hdHRlZCB0byA8Y29kZT5udWxsPC9jb2RlPlxuXHQgKiBAb3ZlcnJpZGVcblx0ICovXG5cdHB1YmxpYyBmb3JtYXRWYWx1ZSh2YWx1ZTogc3RyaW5nLCB0YXJnZXRUeXBlOiBzdHJpbmcpOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtYXR0ZXIgPyB0aGlzLmZvcm1hdHRlci5mb3JtYXQoc3VwZXIuZm9ybWF0VmFsdWUodmFsdWUsIHRhcmdldFR5cGUpKSA6IHN1cGVyLmZvcm1hdFZhbHVlKHZhbHVlLCB0YXJnZXRUeXBlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGdpdmVuIHZhbHVlLCB3aGljaCBpcyBleHBlY3RlZCB0byBiZSBvZiB0aGUgZmlzY2FsIHR5cGUsIHRvIGEgc3RyaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGJlIHBhcnNlZFxuXHQgKiBAcmV0dXJucyBUaGUgcGFyc2VkIHZhbHVlXG5cdCAqIEBvdmVycmlkZVxuXHQgKi9cblx0cHVibGljIHBhcnNlVmFsdWUodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4sIHNvdXJjZVR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybWF0dGVyID8gdGhpcy5mb3JtYXR0ZXIucGFyc2Uoc3VwZXIucGFyc2VWYWx1ZSh2YWx1ZSwgc291cmNlVHlwZSkpIDogc3VwZXIucGFyc2VWYWx1ZSh2YWx1ZSwgc291cmNlVHlwZSk7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyB2YWxpZGF0ZVZhbHVlKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0cnkge1xuXHRcdFx0c3VwZXIudmFsaWRhdGVWYWx1ZSh2YWx1ZSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGlmICghdGhpcy5mb3JtYXR0ZXIpIHtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuZm9ybWF0dGVyLnZhbGlkYXRlKHZhbHVlKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVmFsaWRhdGVFeGNlcHRpb24odGhpcy5nZXRFcnJvck1lc3NhZ2UodGhpcy5hbm5vdGF0aW9uVHlwZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5mb3JtYXR0ZXIgfHwgdmFsdWUgPT09IFwiXCIgfHwgdmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKCF0aGlzLmZvcm1hdHRlci52YWxpZGF0ZSh2YWx1ZSkpIHtcblx0XHRcdHRocm93IG5ldyBWYWxpZGF0ZUV4Y2VwdGlvbih0aGlzLmdldEVycm9yTWVzc2FnZSh0aGlzLmFubm90YXRpb25UeXBlKSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG1hdGNoaW5nIGxvY2FsZS1kZXBlbmRlbnQgZXJyb3IgbWVzc2FnZSBmb3IgdGhlIHR5cGUgYmFzZWQgb24gdGhlIGZpc2NhbCBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvblR5cGUgVGhlIGZpc2NhbCBhbm5vdGF0aW9uIHR5cGVcblx0ICogQHJldHVybnMgVGhlIGxvY2FsZS1kZXBlbmRlbnQgZXJyb3IgbWVzc2FnZVxuXHQgKi9cblx0cHVibGljIGdldEVycm9yTWVzc2FnZShhbm5vdGF0aW9uVHlwZTogQ29tbW9uQW5ub3RhdGlvblRlcm1zIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcblx0XHRsZXQgc1ZhbHVlID0gXCJcIjtcblx0XHR0aGlzLmZ1bGxZZWFyID0gdGhpcy5mdWxsWWVhciB8fCBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcblxuXHRcdHN3aXRjaCAoYW5ub3RhdGlvblR5cGUpIHtcblx0XHRcdGNhc2UgQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsWWVhcjpcblx0XHRcdFx0c1ZhbHVlID0gdGhpcy5mdWxsWWVhcjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFBlcmlvZDpcblx0XHRcdFx0c1ZhbHVlID0gXCIwMDFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIENvbW1vbkFubm90YXRpb25UZXJtcy5Jc0Zpc2NhbFllYXJQZXJpb2Q6XG5cdFx0XHRcdHNWYWx1ZSA9IHRoaXMuZnVsbFllYXIgKyBcIjAwMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsUXVhcnRlcjpcblx0XHRcdFx0c1ZhbHVlID0gXCIxXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNGaXNjYWxZZWFyUXVhcnRlcjpcblx0XHRcdFx0c1ZhbHVlID0gdGhpcy5mdWxsWWVhciArIFwiMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsV2Vlazpcblx0XHRcdFx0c1ZhbHVlID0gXCIwMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsWWVhcldlZWs6XG5cdFx0XHRcdHNWYWx1ZSA9IHRoaXMuZnVsbFllYXIgKyBcIjAxXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNEYXlPZkZpc2NhbFllYXI6XG5cdFx0XHRcdHNWYWx1ZSA9IFwiMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQ29tbW9uQW5ub3RhdGlvblRlcm1zLklzRmlzY2FsWWVhclZhcmlhbnQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0c1ZhbHVlID0gdGhpcy5mdWxsWWVhcjtcblx0XHR9XG5cblx0XHRyZXR1cm4gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiRklTQ0FMX1ZBTElEQVRJT05fRkFJTFNcIiwgW3RoaXMuZm9ybWF0VmFsdWUoc1ZhbHVlLCBcInN0cmluZ1wiKV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgZ2V0TmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcInNhcC5mZS5jb3JlLnR5cGUuRmlzY2FsRGF0ZVwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZvcm1hdHRlciB0aGF0IGlzIGFzc2lnbmVkIHRvIHRoaXMgcGFydGljdWxhciBGaXNjYWxEYXRlIHR5cGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBhc3NpZ25lZCBpbnN0YW5jZSBvZiBGaXNjYWxGb3JtYXRcblx0ICovXG5cdHB1YmxpYyBnZXRGb3JtYXR0ZXIoKTogRmlzY2FsRm9ybWF0IHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5mb3JtYXR0ZXI7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IEZpc2NhbERhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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