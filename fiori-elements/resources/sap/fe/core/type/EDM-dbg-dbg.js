/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  const DefaultTypeForEdmType = {
    "Edm.Binary": {
      modelType: undefined
    },
    "Edm.Boolean": {
      modelType: "Bool"
    },
    "Edm.Byte": {
      modelType: "Int"
    },
    "Edm.Date": {
      modelType: "Date"
    },
    "Edm.DateTime": {
      modelType: "Date"
    },
    "Edm.DateTimeOffset": {
      modelType: "DateTimeOffset"
    },
    "Edm.Decimal": {
      modelType: "Decimal"
    },
    "Edm.Duration": {
      modelType: undefined
    },
    "Edm.Double": {
      modelType: "Float"
    },
    "Edm.Float": {
      modelType: "Float"
    },
    "Edm.Guid": {
      modelType: "Guid"
    },
    "Edm.Int16": {
      modelType: "Int"
    },
    "Edm.Int32": {
      modelType: "Int"
    },
    "Edm.Int64": {
      modelType: "Int"
    },
    "Edm.SByte": {
      modelType: "Int"
    },
    "Edm.Single": {
      modelType: "Float"
    },
    "Edm.String": {
      modelType: "String"
    },
    "Edm.Time": {
      modelType: "TimeOfDay"
    },
    "Edm.TimeOfDay": {
      modelType: "TimeOfDay"
    },
    "Edm.Stream": {
      modelType: undefined
    }
  };
  _exports.DefaultTypeForEdmType = DefaultTypeForEdmType;
  function isTypeFilterable(edmType) {
    var _DefaultTypeForEdmTyp;
    return !!((_DefaultTypeForEdmTyp = DefaultTypeForEdmType[edmType]) !== null && _DefaultTypeForEdmTyp !== void 0 && _DefaultTypeForEdmTyp.modelType);
  }
  _exports.isTypeFilterable = isTypeFilterable;
  function getModelType(edmType) {
    var _DefaultTypeForEdmTyp2;
    return (_DefaultTypeForEdmTyp2 = DefaultTypeForEdmType[edmType]) === null || _DefaultTypeForEdmTyp2 === void 0 ? void 0 : _DefaultTypeForEdmTyp2.modelType;
  }
  _exports.getModelType = getModelType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0VHlwZUZvckVkbVR5cGUiLCJtb2RlbFR5cGUiLCJ1bmRlZmluZWQiLCJpc1R5cGVGaWx0ZXJhYmxlIiwiZWRtVHlwZSIsImdldE1vZGVsVHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRURNLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBEZWZhdWx0VHlwZUZvckVkbVR5cGUgPSB7XG5cdFwiRWRtLkJpbmFyeVwiOiB7XG5cdFx0bW9kZWxUeXBlOiB1bmRlZmluZWRcblx0fSxcblx0XCJFZG0uQm9vbGVhblwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkJvb2xcIlxuXHR9LFxuXHRcIkVkbS5CeXRlXCI6IHtcblx0XHRtb2RlbFR5cGU6IFwiSW50XCJcblx0fSxcblx0XCJFZG0uRGF0ZVwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkRhdGVcIlxuXHR9LFxuXHRcIkVkbS5EYXRlVGltZVwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkRhdGVcIlxuXHR9LFxuXHRcIkVkbS5EYXRlVGltZU9mZnNldFwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkRhdGVUaW1lT2Zmc2V0XCJcblx0fSxcblx0XCJFZG0uRGVjaW1hbFwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkRlY2ltYWxcIlxuXHR9LFxuXHRcIkVkbS5EdXJhdGlvblwiOiB7XG5cdFx0bW9kZWxUeXBlOiB1bmRlZmluZWRcblx0fSxcblx0XCJFZG0uRG91YmxlXCI6IHtcblx0XHRtb2RlbFR5cGU6IFwiRmxvYXRcIlxuXHR9LFxuXHRcIkVkbS5GbG9hdFwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkZsb2F0XCJcblx0fSxcblx0XCJFZG0uR3VpZFwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkd1aWRcIlxuXHR9LFxuXHRcIkVkbS5JbnQxNlwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkludFwiXG5cdH0sXG5cdFwiRWRtLkludDMyXCI6IHtcblx0XHRtb2RlbFR5cGU6IFwiSW50XCJcblx0fSxcblx0XCJFZG0uSW50NjRcIjoge1xuXHRcdG1vZGVsVHlwZTogXCJJbnRcIlxuXHR9LFxuXHRcIkVkbS5TQnl0ZVwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkludFwiXG5cdH0sXG5cdFwiRWRtLlNpbmdsZVwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIkZsb2F0XCJcblx0fSxcblx0XCJFZG0uU3RyaW5nXCI6IHtcblx0XHRtb2RlbFR5cGU6IFwiU3RyaW5nXCJcblx0fSxcblx0XCJFZG0uVGltZVwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIlRpbWVPZkRheVwiXG5cdH0sXG5cdFwiRWRtLlRpbWVPZkRheVwiOiB7XG5cdFx0bW9kZWxUeXBlOiBcIlRpbWVPZkRheVwiXG5cdH0sXG5cdFwiRWRtLlN0cmVhbVwiOiB7XG5cdFx0bW9kZWxUeXBlOiB1bmRlZmluZWRcblx0fVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZUZpbHRlcmFibGUoZWRtVHlwZToga2V5b2YgdHlwZW9mIERlZmF1bHRUeXBlRm9yRWRtVHlwZSkge1xuXHRyZXR1cm4gISFEZWZhdWx0VHlwZUZvckVkbVR5cGVbZWRtVHlwZV0/Lm1vZGVsVHlwZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vZGVsVHlwZShlZG1UeXBlOiBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlKSB7XG5cdHJldHVybiBEZWZhdWx0VHlwZUZvckVkbVR5cGVbZWRtVHlwZV0/Lm1vZGVsVHlwZTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFBTyxNQUFNQSxxQkFBcUIsR0FBRztJQUNwQyxZQUFZLEVBQUU7TUFDYkMsU0FBUyxFQUFFQztJQUNaLENBQUM7SUFDRCxhQUFhLEVBQUU7TUFDZEQsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELFVBQVUsRUFBRTtNQUNYQSxTQUFTLEVBQUU7SUFDWixDQUFDO0lBQ0QsVUFBVSxFQUFFO01BQ1hBLFNBQVMsRUFBRTtJQUNaLENBQUM7SUFDRCxjQUFjLEVBQUU7TUFDZkEsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELG9CQUFvQixFQUFFO01BQ3JCQSxTQUFTLEVBQUU7SUFDWixDQUFDO0lBQ0QsYUFBYSxFQUFFO01BQ2RBLFNBQVMsRUFBRTtJQUNaLENBQUM7SUFDRCxjQUFjLEVBQUU7TUFDZkEsU0FBUyxFQUFFQztJQUNaLENBQUM7SUFDRCxZQUFZLEVBQUU7TUFDYkQsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELFdBQVcsRUFBRTtNQUNaQSxTQUFTLEVBQUU7SUFDWixDQUFDO0lBQ0QsVUFBVSxFQUFFO01BQ1hBLFNBQVMsRUFBRTtJQUNaLENBQUM7SUFDRCxXQUFXLEVBQUU7TUFDWkEsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELFdBQVcsRUFBRTtNQUNaQSxTQUFTLEVBQUU7SUFDWixDQUFDO0lBQ0QsV0FBVyxFQUFFO01BQ1pBLFNBQVMsRUFBRTtJQUNaLENBQUM7SUFDRCxXQUFXLEVBQUU7TUFDWkEsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELFlBQVksRUFBRTtNQUNiQSxTQUFTLEVBQUU7SUFDWixDQUFDO0lBQ0QsWUFBWSxFQUFFO01BQ2JBLFNBQVMsRUFBRTtJQUNaLENBQUM7SUFDRCxVQUFVLEVBQUU7TUFDWEEsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELGVBQWUsRUFBRTtNQUNoQkEsU0FBUyxFQUFFO0lBQ1osQ0FBQztJQUNELFlBQVksRUFBRTtNQUNiQSxTQUFTLEVBQUVDO0lBQ1o7RUFDRCxDQUFDO0VBQUM7RUFFSyxTQUFTQyxnQkFBZ0IsQ0FBQ0MsT0FBMkMsRUFBRTtJQUFBO0lBQzdFLE9BQU8sQ0FBQywyQkFBQ0oscUJBQXFCLENBQUNJLE9BQU8sQ0FBQyxrREFBOUIsc0JBQWdDSCxTQUFTO0VBQ25EO0VBQUM7RUFFTSxTQUFTSSxZQUFZLENBQUNELE9BQTJDLEVBQUU7SUFBQTtJQUN6RSxpQ0FBT0oscUJBQXFCLENBQUNJLE9BQU8sQ0FBQywyREFBOUIsdUJBQWdDSCxTQUFTO0VBQ2pEO0VBQUM7RUFBQTtBQUFBIn0=