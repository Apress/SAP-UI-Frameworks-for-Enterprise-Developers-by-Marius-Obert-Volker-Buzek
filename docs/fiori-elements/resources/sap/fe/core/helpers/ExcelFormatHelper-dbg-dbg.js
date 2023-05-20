/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
  "use strict";

  const ExcelFormatHelper = {
    /**
     * Method for converting JS Date format to Excel custom date format.
     *
     * @returns Format for the Date column to be used on excel.
     */
    getExcelDatefromJSDate: function () {
      // Get date Format(pattern), which will be used for date format mapping between sapui5 and excel.
      // UI5_ANY
      let sJSDateFormat = DateFormat.getDateInstance().oFormatOptions.pattern.toLowerCase();
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
      let sJSDateTimeFormat = DateFormat.getDateTimeInstance().oFormatOptions.pattern.toLowerCase();
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
      let sJSTimeFormat = DateFormat.getTimeInstance().oFormatOptions.pattern;
      if (sJSTimeFormat && sJSTimeFormat.includes("a")) {
        sJSTimeFormat = sJSTimeFormat.replace("a", "AM/PM");
      }
      return sJSTimeFormat;
    }
  };
  return ExcelFormatHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeGNlbEZvcm1hdEhlbHBlciIsImdldEV4Y2VsRGF0ZWZyb21KU0RhdGUiLCJzSlNEYXRlRm9ybWF0IiwiRGF0ZUZvcm1hdCIsImdldERhdGVJbnN0YW5jZSIsIm9Gb3JtYXRPcHRpb25zIiwicGF0dGVybiIsInRvTG93ZXJDYXNlIiwicmVnZXgiLCJleGVjIiwicmVwbGFjZSIsImdldEV4Y2VsRGF0ZVRpbWVmcm9tSlNEYXRlVGltZSIsInNKU0RhdGVUaW1lRm9ybWF0IiwiZ2V0RGF0ZVRpbWVJbnN0YW5jZSIsInJlZ2V4WWVhciIsImluY2x1ZGVzIiwiZ2V0RXhjZWxUaW1lZnJvbUpTVGltZSIsInNKU1RpbWVGb3JtYXQiLCJnZXRUaW1lSW5zdGFuY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkV4Y2VsRm9ybWF0SGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEYXRlRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvRGF0ZUZvcm1hdFwiO1xuXG5jb25zdCBFeGNlbEZvcm1hdEhlbHBlciA9IHtcblx0LyoqXG5cdCAqIE1ldGhvZCBmb3IgY29udmVydGluZyBKUyBEYXRlIGZvcm1hdCB0byBFeGNlbCBjdXN0b20gZGF0ZSBmb3JtYXQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEZvcm1hdCBmb3IgdGhlIERhdGUgY29sdW1uIHRvIGJlIHVzZWQgb24gZXhjZWwuXG5cdCAqL1xuXHRnZXRFeGNlbERhdGVmcm9tSlNEYXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gR2V0IGRhdGUgRm9ybWF0KHBhdHRlcm4pLCB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIGRhdGUgZm9ybWF0IG1hcHBpbmcgYmV0d2VlbiBzYXB1aTUgYW5kIGV4Y2VsLlxuXHRcdC8vIFVJNV9BTllcblx0XHRsZXQgc0pTRGF0ZUZvcm1hdCA9IChEYXRlRm9ybWF0LmdldERhdGVJbnN0YW5jZSgpIGFzIGFueSkub0Zvcm1hdE9wdGlvbnMucGF0dGVybi50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmIChzSlNEYXRlRm9ybWF0KSB7XG5cdFx0XHQvLyBDaGVja2luZyBmb3IgdGhlIGV4aXN0ZW5jZSBvZiBzaW5nbGUgJ3knIGluIHRoZSBwYXR0ZXJuLlxuXHRcdFx0Y29uc3QgcmVnZXggPSAvXlteeV0qeVteeV0qJC9tO1xuXHRcdFx0aWYgKHJlZ2V4LmV4ZWMoc0pTRGF0ZUZvcm1hdCkpIHtcblx0XHRcdFx0c0pTRGF0ZUZvcm1hdCA9IHNKU0RhdGVGb3JtYXQucmVwbGFjZShcInlcIiwgXCJ5eXl5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc0pTRGF0ZUZvcm1hdDtcblx0fSxcblx0Z2V0RXhjZWxEYXRlVGltZWZyb21KU0RhdGVUaW1lOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gR2V0IGRhdGUgRm9ybWF0KHBhdHRlcm4pLCB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIGRhdGUgdGltZSBmb3JtYXQgbWFwcGluZyBiZXR3ZWVuIHNhcHVpNSBhbmQgZXhjZWwuXG5cdFx0Ly8gVUk1X0FOWVxuXHRcdGxldCBzSlNEYXRlVGltZUZvcm1hdCA9IChEYXRlRm9ybWF0LmdldERhdGVUaW1lSW5zdGFuY2UoKSBhcyBhbnkpLm9Gb3JtYXRPcHRpb25zLnBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblx0XHRpZiAoc0pTRGF0ZVRpbWVGb3JtYXQpIHtcblx0XHRcdC8vIENoZWNraW5nIGZvciB0aGUgZXhpc3RlbmNlIG9mIHNpbmdsZSAneScgaW4gdGhlIHBhdHRlcm4uXG5cdFx0XHRjb25zdCByZWdleFllYXIgPSAvXlteeV0qeVteeV0qJC9tO1xuXHRcdFx0aWYgKHJlZ2V4WWVhci5leGVjKHNKU0RhdGVUaW1lRm9ybWF0KSkge1xuXHRcdFx0XHRzSlNEYXRlVGltZUZvcm1hdCA9IHNKU0RhdGVUaW1lRm9ybWF0LnJlcGxhY2UoXCJ5XCIsIFwieXl5eVwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChzSlNEYXRlVGltZUZvcm1hdC5pbmNsdWRlcyhcImFcIikpIHtcblx0XHRcdFx0c0pTRGF0ZVRpbWVGb3JtYXQgPSBzSlNEYXRlVGltZUZvcm1hdC5yZXBsYWNlKFwiYVwiLCBcIkFNL1BNXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc0pTRGF0ZVRpbWVGb3JtYXQ7XG5cdH0sXG5cdGdldEV4Y2VsVGltZWZyb21KU1RpbWU6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBHZXQgZGF0ZSBGb3JtYXQocGF0dGVybiksIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgZGF0ZSB0aW1lIGZvcm1hdCBtYXBwaW5nIGJldHdlZW4gc2FwdWk1IGFuZCBleGNlbC5cblx0XHQvLyBVSTVfQU5ZXG5cdFx0bGV0IHNKU1RpbWVGb3JtYXQgPSAoRGF0ZUZvcm1hdC5nZXRUaW1lSW5zdGFuY2UoKSBhcyBhbnkpLm9Gb3JtYXRPcHRpb25zLnBhdHRlcm47XG5cdFx0aWYgKHNKU1RpbWVGb3JtYXQgJiYgc0pTVGltZUZvcm1hdC5pbmNsdWRlcyhcImFcIikpIHtcblx0XHRcdHNKU1RpbWVGb3JtYXQgPSBzSlNUaW1lRm9ybWF0LnJlcGxhY2UoXCJhXCIsIFwiQU0vUE1cIik7XG5cdFx0fVxuXHRcdHJldHVybiBzSlNUaW1lRm9ybWF0O1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFeGNlbEZvcm1hdEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUVBLE1BQU1BLGlCQUFpQixHQUFHO0lBQ3pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0Msc0JBQXNCLEVBQUUsWUFBWTtNQUNuQztNQUNBO01BQ0EsSUFBSUMsYUFBYSxHQUFJQyxVQUFVLENBQUNDLGVBQWUsRUFBRSxDQUFTQyxjQUFjLENBQUNDLE9BQU8sQ0FBQ0MsV0FBVyxFQUFFO01BQzlGLElBQUlMLGFBQWEsRUFBRTtRQUNsQjtRQUNBLE1BQU1NLEtBQUssR0FBRyxnQkFBZ0I7UUFDOUIsSUFBSUEsS0FBSyxDQUFDQyxJQUFJLENBQUNQLGFBQWEsQ0FBQyxFQUFFO1VBQzlCQSxhQUFhLEdBQUdBLGFBQWEsQ0FBQ1EsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDbkQ7TUFDRDtNQUNBLE9BQU9SLGFBQWE7SUFDckIsQ0FBQztJQUNEUyw4QkFBOEIsRUFBRSxZQUFZO01BQzNDO01BQ0E7TUFDQSxJQUFJQyxpQkFBaUIsR0FBSVQsVUFBVSxDQUFDVSxtQkFBbUIsRUFBRSxDQUFTUixjQUFjLENBQUNDLE9BQU8sQ0FBQ0MsV0FBVyxFQUFFO01BQ3RHLElBQUlLLGlCQUFpQixFQUFFO1FBQ3RCO1FBQ0EsTUFBTUUsU0FBUyxHQUFHLGdCQUFnQjtRQUNsQyxJQUFJQSxTQUFTLENBQUNMLElBQUksQ0FBQ0csaUJBQWlCLENBQUMsRUFBRTtVQUN0Q0EsaUJBQWlCLEdBQUdBLGlCQUFpQixDQUFDRixPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztRQUMzRDtRQUNBLElBQUlFLGlCQUFpQixDQUFDRyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7VUFDcENILGlCQUFpQixHQUFHQSxpQkFBaUIsQ0FBQ0YsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7UUFDNUQ7TUFDRDtNQUNBLE9BQU9FLGlCQUFpQjtJQUN6QixDQUFDO0lBQ0RJLHNCQUFzQixFQUFFLFlBQVk7TUFDbkM7TUFDQTtNQUNBLElBQUlDLGFBQWEsR0FBSWQsVUFBVSxDQUFDZSxlQUFlLEVBQUUsQ0FBU2IsY0FBYyxDQUFDQyxPQUFPO01BQ2hGLElBQUlXLGFBQWEsSUFBSUEsYUFBYSxDQUFDRixRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDakRFLGFBQWEsR0FBR0EsYUFBYSxDQUFDUCxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztNQUNwRDtNQUNBLE9BQU9PLGFBQWE7SUFDckI7RUFDRCxDQUFDO0VBQUMsT0FFYWpCLGlCQUFpQjtBQUFBIn0=