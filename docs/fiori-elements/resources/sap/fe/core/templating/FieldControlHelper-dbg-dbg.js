/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"], function (BindingToolkit) {
  "use strict";

  var _exports = {};
  var or = BindingToolkit.or;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's read only
   */
  const isReadOnlyExpression = function (oTarget, relativePath) {
    var _oTarget$annotations, _oTarget$annotations$, _oTarget$annotations$2;
    const oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations = oTarget.annotations) === null || _oTarget$annotations === void 0 ? void 0 : (_oTarget$annotations$ = _oTarget$annotations.Common) === null || _oTarget$annotations$ === void 0 ? void 0 : (_oTarget$annotations$2 = _oTarget$annotations$.FieldControl) === null || _oTarget$annotations$2 === void 0 ? void 0 : _oTarget$annotations$2.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 1), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "1"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/ReadOnly");
  };

  /**
   * Create the binding expression to check if the property is disabled or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's disabled
   */
  _exports.isReadOnlyExpression = isReadOnlyExpression;
  const isDisabledExpression = function (oTarget, relativePath) {
    var _oTarget$annotations2, _oTarget$annotations3, _oTarget$annotations4;
    const oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations2 = oTarget.annotations) === null || _oTarget$annotations2 === void 0 ? void 0 : (_oTarget$annotations3 = _oTarget$annotations2.Common) === null || _oTarget$annotations3 === void 0 ? void 0 : (_oTarget$annotations4 = _oTarget$annotations3.FieldControl) === null || _oTarget$annotations4 === void 0 ? void 0 : _oTarget$annotations4.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 0), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "0"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/Inapplicable");
  };

  /**
   * Create the binding expression to check if the property is editable or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's not editable
   */
  _exports.isDisabledExpression = isDisabledExpression;
  const isNonEditableExpression = function (oTarget, relativePath) {
    return or(isReadOnlyExpression(oTarget, relativePath), isDisabledExpression(oTarget, relativePath));
  };

  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's read only
   */
  _exports.isNonEditableExpression = isNonEditableExpression;
  const isRequiredExpression = function (oTarget, relativePath) {
    var _oTarget$annotations5, _oTarget$annotations6, _oTarget$annotations7;
    const oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations5 = oTarget.annotations) === null || _oTarget$annotations5 === void 0 ? void 0 : (_oTarget$annotations6 = _oTarget$annotations5.Common) === null || _oTarget$annotations6 === void 0 ? void 0 : (_oTarget$annotations7 = _oTarget$annotations6.FieldControl) === null || _oTarget$annotations7 === void 0 ? void 0 : _oTarget$annotations7.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 7), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "7"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/Mandatory");
  };
  _exports.isRequiredExpression = isRequiredExpression;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsIm9UYXJnZXQiLCJyZWxhdGl2ZVBhdGgiLCJvRmllbGRDb250cm9sVmFsdWUiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkZpZWxkQ29udHJvbCIsInZhbHVlT2YiLCJvciIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiY29uc3RhbnQiLCJpc0Rpc2FibGVkRXhwcmVzc2lvbiIsImlzTm9uRWRpdGFibGVFeHByZXNzaW9uIiwiaXNSZXF1aXJlZEV4cHJlc3Npb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQ29udHJvbEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb25zdGFudCwgZXF1YWwsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgb3IgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGNoZWNrIGlmIHRoZSBwcm9wZXJ0eSBpcyByZWFkIG9ubHkgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvVGFyZ2V0IFRoZSB0YXJnZXQgcHJvcGVydHkgb3IgRGF0YUZpZWxkXG4gKiBAcGFyYW0gcmVsYXRpdmVQYXRoIEFycmF5IG9mIG5hdmlnYXRpb24gcHJvcGVydGllcyBwb2ludGluZyB0byB0aGUgbG9jYXRpb24gb2YgZmllbGQgY29udHJvbCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXNvbHZpbmcgdG8gYSBCb29sZWFuIGJlaW5nIHRydWUgaWYgaXQncyByZWFkIG9ubHlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzUmVhZE9ubHlFeHByZXNzaW9uID0gZnVuY3Rpb24gKG9UYXJnZXQ6IFByb3BlcnR5IHwgdW5kZWZpbmVkLCByZWxhdGl2ZVBhdGg/OiBzdHJpbmdbXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IG9GaWVsZENvbnRyb2xWYWx1ZSA9IG9UYXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkZpZWxkQ29udHJvbD8udmFsdWVPZigpO1xuXHRpZiAodHlwZW9mIG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhIW9GaWVsZENvbnRyb2xWYWx1ZSkge1xuXHRcdHJldHVybiBvcihcblx0XHRcdGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRmllbGRDb250cm9sVmFsdWUsIHJlbGF0aXZlUGF0aCksIDEpLFxuXHRcdFx0ZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9GaWVsZENvbnRyb2xWYWx1ZSwgcmVsYXRpdmVQYXRoKSwgXCIxXCIpXG5cdFx0KTtcblx0fVxuXHRyZXR1cm4gY29uc3RhbnQob0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIkNvbW1vbi5GaWVsZENvbnRyb2xUeXBlL1JlYWRPbmx5XCIpO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBjaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgZGlzYWJsZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvVGFyZ2V0IFRoZSB0YXJnZXQgcHJvcGVydHkgb3IgRGF0YUZpZWxkXG4gKiBAcGFyYW0gcmVsYXRpdmVQYXRoIEFycmF5IG9mIG5hdmlnYXRpb24gcHJvcGVydGllcyBwb2ludGluZyB0byB0aGUgbG9jYXRpb24gb2YgZmllbGQgY29udHJvbCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXNvbHZpbmcgdG8gYSBCb29sZWFuIGJlaW5nIHRydWUgaWYgaXQncyBkaXNhYmxlZFxuICovXG5leHBvcnQgY29uc3QgaXNEaXNhYmxlZEV4cHJlc3Npb24gPSBmdW5jdGlvbiAob1RhcmdldDogUHJvcGVydHksIHJlbGF0aXZlUGF0aD86IHN0cmluZ1tdKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3Qgb0ZpZWxkQ29udHJvbFZhbHVlID0gb1RhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRmllbGRDb250cm9sPy52YWx1ZU9mKCk7XG5cdGlmICh0eXBlb2Ygb0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIm9iamVjdFwiICYmICEhb0ZpZWxkQ29udHJvbFZhbHVlKSB7XG5cdFx0cmV0dXJuIG9yKFxuXHRcdFx0ZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9GaWVsZENvbnRyb2xWYWx1ZSwgcmVsYXRpdmVQYXRoKSwgMCksXG5cdFx0XHRlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0ZpZWxkQ29udHJvbFZhbHVlLCByZWxhdGl2ZVBhdGgpLCBcIjBcIilcblx0XHQpO1xuXHR9XG5cdHJldHVybiBjb25zdGFudChvRmllbGRDb250cm9sVmFsdWUgPT09IFwiQ29tbW9uLkZpZWxkQ29udHJvbFR5cGUvSW5hcHBsaWNhYmxlXCIpO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBjaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgZWRpdGFibGUgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvVGFyZ2V0IFRoZSB0YXJnZXQgcHJvcGVydHkgb3IgRGF0YUZpZWxkXG4gKiBAcGFyYW0gcmVsYXRpdmVQYXRoIEFycmF5IG9mIG5hdmlnYXRpb24gcHJvcGVydGllcyBwb2ludGluZyB0byB0aGUgbG9jYXRpb24gb2YgZmllbGQgY29udHJvbCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXNvbHZpbmcgdG8gYSBCb29sZWFuIGJlaW5nIHRydWUgaWYgaXQncyBub3QgZWRpdGFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IGlzTm9uRWRpdGFibGVFeHByZXNzaW9uID0gZnVuY3Rpb24gKG9UYXJnZXQ6IFByb3BlcnR5LCByZWxhdGl2ZVBhdGg/OiBzdHJpbmdbXSk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBvcihpc1JlYWRPbmx5RXhwcmVzc2lvbihvVGFyZ2V0LCByZWxhdGl2ZVBhdGgpLCBpc0Rpc2FibGVkRXhwcmVzc2lvbihvVGFyZ2V0LCByZWxhdGl2ZVBhdGgpKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gY2hlY2sgaWYgdGhlIHByb3BlcnR5IGlzIHJlYWQgb25seSBvciBub3QuXG4gKlxuICogQHBhcmFtIG9UYXJnZXQgVGhlIHRhcmdldCBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwYXJhbSByZWxhdGl2ZVBhdGggQXJyYXkgb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIHBvaW50aW5nIHRvIHRoZSBsb2NhdGlvbiBvZiBmaWVsZCBjb250cm9sIHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIHJlc29sdmluZyB0byBhIEJvb2xlYW4gYmVpbmcgdHJ1ZSBpZiBpdCdzIHJlYWQgb25seVxuICovXG5leHBvcnQgY29uc3QgaXNSZXF1aXJlZEV4cHJlc3Npb24gPSBmdW5jdGlvbiAob1RhcmdldDogUHJvcGVydHksIHJlbGF0aXZlUGF0aD86IHN0cmluZ1tdKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3Qgb0ZpZWxkQ29udHJvbFZhbHVlID0gb1RhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRmllbGRDb250cm9sPy52YWx1ZU9mKCk7XG5cdGlmICh0eXBlb2Ygb0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIm9iamVjdFwiICYmICEhb0ZpZWxkQ29udHJvbFZhbHVlKSB7XG5cdFx0cmV0dXJuIG9yKFxuXHRcdFx0ZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9GaWVsZENvbnRyb2xWYWx1ZSwgcmVsYXRpdmVQYXRoKSwgNyksXG5cdFx0XHRlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0ZpZWxkQ29udHJvbFZhbHVlLCByZWxhdGl2ZVBhdGgpLCBcIjdcIilcblx0XHQpO1xuXHR9XG5cdHJldHVybiBjb25zdGFudChvRmllbGRDb250cm9sVmFsdWUgPT09IFwiQ29tbW9uLkZpZWxkQ29udHJvbFR5cGUvTWFuZGF0b3J5XCIpO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7O0VBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxvQkFBb0IsR0FBRyxVQUFVQyxPQUE2QixFQUFFQyxZQUF1QixFQUFxQztJQUFBO0lBQ3hJLE1BQU1DLGtCQUFrQixHQUFHRixPQUFPLGFBQVBBLE9BQU8sK0NBQVBBLE9BQU8sQ0FBRUcsV0FBVyxrRkFBcEIscUJBQXNCQyxNQUFNLG9GQUE1QixzQkFBOEJDLFlBQVksMkRBQTFDLHVCQUE0Q0MsT0FBTyxFQUFFO0lBQ2hGLElBQUksT0FBT0osa0JBQWtCLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQ0Esa0JBQWtCLEVBQUU7TUFDbkUsT0FBT0ssRUFBRSxDQUNSQyxLQUFLLENBQUNDLDJCQUEyQixDQUFDUCxrQkFBa0IsRUFBRUQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZFTyxLQUFLLENBQUNDLDJCQUEyQixDQUFDUCxrQkFBa0IsRUFBRUQsWUFBWSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQ3pFO0lBQ0Y7SUFDQSxPQUFPUyxRQUFRLENBQUNSLGtCQUFrQixLQUFLLGtDQUFrQyxDQUFDO0VBQzNFLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLE1BQU1TLG9CQUFvQixHQUFHLFVBQVVYLE9BQWlCLEVBQUVDLFlBQXVCLEVBQXFDO0lBQUE7SUFDNUgsTUFBTUMsa0JBQWtCLEdBQUdGLE9BQU8sYUFBUEEsT0FBTyxnREFBUEEsT0FBTyxDQUFFRyxXQUFXLG1GQUFwQixzQkFBc0JDLE1BQU0sbUZBQTVCLHNCQUE4QkMsWUFBWSwwREFBMUMsc0JBQTRDQyxPQUFPLEVBQUU7SUFDaEYsSUFBSSxPQUFPSixrQkFBa0IsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDQSxrQkFBa0IsRUFBRTtNQUNuRSxPQUFPSyxFQUFFLENBQ1JDLEtBQUssQ0FBQ0MsMkJBQTJCLENBQUNQLGtCQUFrQixFQUFFRCxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDdkVPLEtBQUssQ0FBQ0MsMkJBQTJCLENBQUNQLGtCQUFrQixFQUFFRCxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FDekU7SUFDRjtJQUNBLE9BQU9TLFFBQVEsQ0FBQ1Isa0JBQWtCLEtBQUssc0NBQXNDLENBQUM7RUFDL0UsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BO0VBT08sTUFBTVUsdUJBQXVCLEdBQUcsVUFBVVosT0FBaUIsRUFBRUMsWUFBdUIsRUFBcUM7SUFDL0gsT0FBT00sRUFBRSxDQUFDUixvQkFBb0IsQ0FBQ0MsT0FBTyxFQUFFQyxZQUFZLENBQUMsRUFBRVUsb0JBQW9CLENBQUNYLE9BQU8sRUFBRUMsWUFBWSxDQUFDLENBQUM7RUFDcEcsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BO0VBT08sTUFBTVksb0JBQW9CLEdBQUcsVUFBVWIsT0FBaUIsRUFBRUMsWUFBdUIsRUFBcUM7SUFBQTtJQUM1SCxNQUFNQyxrQkFBa0IsR0FBR0YsT0FBTyxhQUFQQSxPQUFPLGdEQUFQQSxPQUFPLENBQUVHLFdBQVcsbUZBQXBCLHNCQUFzQkMsTUFBTSxtRkFBNUIsc0JBQThCQyxZQUFZLDBEQUExQyxzQkFBNENDLE9BQU8sRUFBRTtJQUNoRixJQUFJLE9BQU9KLGtCQUFrQixLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUNBLGtCQUFrQixFQUFFO01BQ25FLE9BQU9LLEVBQUUsQ0FDUkMsS0FBSyxDQUFDQywyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN2RU8sS0FBSyxDQUFDQywyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUN6RTtJQUNGO0lBQ0EsT0FBT1MsUUFBUSxDQUFDUixrQkFBa0IsS0FBSyxtQ0FBbUMsQ0FBQztFQUM1RSxDQUFDO0VBQUM7RUFBQTtBQUFBIn0=