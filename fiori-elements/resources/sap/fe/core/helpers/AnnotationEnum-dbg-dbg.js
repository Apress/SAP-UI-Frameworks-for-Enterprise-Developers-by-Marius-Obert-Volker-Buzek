/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  // This list needs to come from AVT
  const ENUM_VALUES = {
    "com.sap.vocabularies.Common.v1.FieldControlType": {
      Mandatory: 7,
      Optional: 3,
      ReadOnly: 0,
      Inapplicable: 0,
      Disabled: 1
    }
  };
  const resolveEnumValue = function (enumName) {
    const [termName, value] = enumName.split("/");
    if (ENUM_VALUES.hasOwnProperty(termName)) {
      return ENUM_VALUES[termName][value];
    } else {
      return false;
    }
  };
  _exports.resolveEnumValue = resolveEnumValue;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFTlVNX1ZBTFVFUyIsIk1hbmRhdG9yeSIsIk9wdGlvbmFsIiwiUmVhZE9ubHkiLCJJbmFwcGxpY2FibGUiLCJEaXNhYmxlZCIsInJlc29sdmVFbnVtVmFsdWUiLCJlbnVtTmFtZSIsInRlcm1OYW1lIiwidmFsdWUiLCJzcGxpdCIsImhhc093blByb3BlcnR5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBbm5vdGF0aW9uRW51bS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGxpc3QgbmVlZHMgdG8gY29tZSBmcm9tIEFWVFxuY29uc3QgRU5VTV9WQUxVRVMgPSB7XG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFR5cGVcIjoge1xuXHRcdE1hbmRhdG9yeTogNyxcblx0XHRPcHRpb25hbDogMyxcblx0XHRSZWFkT25seTogMCxcblx0XHRJbmFwcGxpY2FibGU6IDAsXG5cdFx0RGlzYWJsZWQ6IDFcblx0fVxufTtcbmV4cG9ydCBjb25zdCByZXNvbHZlRW51bVZhbHVlID0gZnVuY3Rpb24gKGVudW1OYW1lOiBzdHJpbmcpIHtcblx0Y29uc3QgW3Rlcm1OYW1lLCB2YWx1ZV0gPSBlbnVtTmFtZS5zcGxpdChcIi9cIik7XG5cdGlmIChFTlVNX1ZBTFVFUy5oYXNPd25Qcm9wZXJ0eSh0ZXJtTmFtZSkpIHtcblx0XHRyZXR1cm4gKEVOVU1fVkFMVUVTIGFzIGFueSlbdGVybU5hbWVdW3ZhbHVlXTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBQUE7RUFDQSxNQUFNQSxXQUFXLEdBQUc7SUFDbkIsaURBQWlELEVBQUU7TUFDbERDLFNBQVMsRUFBRSxDQUFDO01BQ1pDLFFBQVEsRUFBRSxDQUFDO01BQ1hDLFFBQVEsRUFBRSxDQUFDO01BQ1hDLFlBQVksRUFBRSxDQUFDO01BQ2ZDLFFBQVEsRUFBRTtJQUNYO0VBQ0QsQ0FBQztFQUNNLE1BQU1DLGdCQUFnQixHQUFHLFVBQVVDLFFBQWdCLEVBQUU7SUFDM0QsTUFBTSxDQUFDQyxRQUFRLEVBQUVDLEtBQUssQ0FBQyxHQUFHRixRQUFRLENBQUNHLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDN0MsSUFBSVYsV0FBVyxDQUFDVyxjQUFjLENBQUNILFFBQVEsQ0FBQyxFQUFFO01BQ3pDLE9BQVFSLFdBQVcsQ0FBU1EsUUFBUSxDQUFDLENBQUNDLEtBQUssQ0FBQztJQUM3QyxDQUFDLE1BQU07TUFDTixPQUFPLEtBQUs7SUFDYjtFQUNELENBQUM7RUFBQztFQUFBO0FBQUEifQ==