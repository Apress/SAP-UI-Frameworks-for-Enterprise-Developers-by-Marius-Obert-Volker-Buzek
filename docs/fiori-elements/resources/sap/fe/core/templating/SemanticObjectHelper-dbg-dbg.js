/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Get the path of the semantic Object if it is a dynamic SemanticObject.
   *
   * @param semanticObject The value of the Common.SemanticObject annotation.
   * @returns  The path of the semantic Object if it is a dynamic SemanticObject null otherwise.
   */
  const getDynamicPathFromSemanticObject = semanticObject => {
    const dynamicSemObjectRegex = semanticObject === null || semanticObject === void 0 ? void 0 : semanticObject.match(/{(.*?)}/);
    if (dynamicSemObjectRegex !== null && dynamicSemObjectRegex !== void 0 && dynamicSemObjectRegex.length && dynamicSemObjectRegex.length > 1) {
      return dynamicSemObjectRegex[1];
    }
    return null;
  };

  /**
   * Check whether a property or a NavigationProperty has a semantic object defined or not.
   *
   * @param property The target property
   * @returns `true` if it has a semantic object
   */
  _exports.getDynamicPathFromSemanticObject = getDynamicPathFromSemanticObject;
  const hasSemanticObject = function (property) {
    var _property$annotations;
    const _propertyCommonAnnotations = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : _property$annotations.Common;
    if (_propertyCommonAnnotations) {
      for (const key in _propertyCommonAnnotations) {
        var _propertyCommonAnnota;
        if (((_propertyCommonAnnota = _propertyCommonAnnotations[key]) === null || _propertyCommonAnnota === void 0 ? void 0 : _propertyCommonAnnota.term) === "com.sap.vocabularies.Common.v1.SemanticObject") {
          return true;
        }
      }
    }
    return false;
  };
  _exports.hasSemanticObject = hasSemanticObject;
  const getSemanticObjects = function (property) {
    var _property$annotations2;
    const semanticObjects = [];
    const _propertyCommonAnnotations = (_property$annotations2 = property.annotations) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Common;
    if (_propertyCommonAnnotations) {
      for (const key in _propertyCommonAnnotations) {
        var _propertyCommonAnnota2;
        if (((_propertyCommonAnnota2 = _propertyCommonAnnotations[key]) === null || _propertyCommonAnnota2 === void 0 ? void 0 : _propertyCommonAnnota2.term) === "com.sap.vocabularies.Common.v1.SemanticObject") {
          semanticObjects.push(_propertyCommonAnnotations[key]);
        }
      }
    }
    return semanticObjects;
  };
  _exports.getSemanticObjects = getSemanticObjects;
  const getSemanticObjectMappings = function (property) {
    var _property$annotations3;
    const semanticObjectMappings = [];
    const _propertyCommonAnnotations = (_property$annotations3 = property.annotations) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.Common;
    if (_propertyCommonAnnotations) {
      for (const key in _propertyCommonAnnotations) {
        var _propertyCommonAnnota3;
        if (((_propertyCommonAnnota3 = _propertyCommonAnnotations[key]) === null || _propertyCommonAnnota3 === void 0 ? void 0 : _propertyCommonAnnota3.term) === "com.sap.vocabularies.Common.v1.SemanticObjectMapping") {
          semanticObjectMappings.push(_propertyCommonAnnotations[key]);
        }
      }
    }
    return semanticObjectMappings;
  };
  _exports.getSemanticObjectMappings = getSemanticObjectMappings;
  const getSemanticObjectUnavailableActions = function (property) {
    var _property$annotations4;
    const semanticObjectUnavailableActions = [];
    const _propertyCommonAnnotations = (_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : _property$annotations4.Common;
    if (_propertyCommonAnnotations) {
      for (const key in _propertyCommonAnnotations) {
        var _propertyCommonAnnota4;
        if (((_propertyCommonAnnota4 = _propertyCommonAnnotations[key]) === null || _propertyCommonAnnota4 === void 0 ? void 0 : _propertyCommonAnnota4.term) === "com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") {
          semanticObjectUnavailableActions.push(_propertyCommonAnnotations[key]);
        }
      }
    }
    return semanticObjectUnavailableActions;
  };
  _exports.getSemanticObjectUnavailableActions = getSemanticObjectUnavailableActions;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCIsInNlbWFudGljT2JqZWN0IiwiZHluYW1pY1NlbU9iamVjdFJlZ2V4IiwibWF0Y2giLCJsZW5ndGgiLCJoYXNTZW1hbnRpY09iamVjdCIsInByb3BlcnR5IiwiX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsImtleSIsInRlcm0iLCJnZXRTZW1hbnRpY09iamVjdHMiLCJzZW1hbnRpY09iamVjdHMiLCJwdXNoIiwiZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyIsInNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJnZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTZW1hbnRpY09iamVjdEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOYXZpZ2F0aW9uUHJvcGVydHksIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQge1xuXHRDb21tb25Bbm5vdGF0aW9uVGVybXMsXG5cdFNlbWFudGljT2JqZWN0LFxuXHRTZW1hbnRpY09iamVjdE1hcHBpbmcsXG5cdFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5cbi8qKlxuICogR2V0IHRoZSBwYXRoIG9mIHRoZSBzZW1hbnRpYyBPYmplY3QgaWYgaXQgaXMgYSBkeW5hbWljIFNlbWFudGljT2JqZWN0LlxuICpcbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdCBUaGUgdmFsdWUgb2YgdGhlIENvbW1vbi5TZW1hbnRpY09iamVjdCBhbm5vdGF0aW9uLlxuICogQHJldHVybnMgIFRoZSBwYXRoIG9mIHRoZSBzZW1hbnRpYyBPYmplY3QgaWYgaXQgaXMgYSBkeW5hbWljIFNlbWFudGljT2JqZWN0IG51bGwgb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgY29uc3QgZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QgPSAoc2VtYW50aWNPYmplY3Q6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcgfCBudWxsID0+IHtcblx0Y29uc3QgZHluYW1pY1NlbU9iamVjdFJlZ2V4ID0gc2VtYW50aWNPYmplY3Q/Lm1hdGNoKC97KC4qPyl9Lyk7XG5cdGlmIChkeW5hbWljU2VtT2JqZWN0UmVnZXg/Lmxlbmd0aCAmJiBkeW5hbWljU2VtT2JqZWN0UmVnZXgubGVuZ3RoID4gMSkge1xuXHRcdHJldHVybiBkeW5hbWljU2VtT2JqZWN0UmVnZXhbMV07XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBwcm9wZXJ0eSBvciBhIE5hdmlnYXRpb25Qcm9wZXJ0eSBoYXMgYSBzZW1hbnRpYyBvYmplY3QgZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSBzZW1hbnRpYyBvYmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1NlbWFudGljT2JqZWN0ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRjb25zdCBfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9ucyA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24gYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IHVuZGVmaW5lZDtcblx0aWYgKF9wcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMpIHtcblx0XHRcdGlmIChfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9uc1trZXldPy50ZXJtID09PSBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTZW1hbnRpY09iamVjdHMgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5IHwgTmF2aWdhdGlvblByb3BlcnR5KTogU2VtYW50aWNPYmplY3RbXSB7XG5cdGNvbnN0IHNlbWFudGljT2JqZWN0cyA9IFtdO1xuXHRjb25zdCBfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9ucyA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24gYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IHVuZGVmaW5lZDtcblx0aWYgKF9wcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMpIHtcblx0XHRcdGlmIChfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9uc1trZXldPy50ZXJtID09PSBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3RzLnB1c2goX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnNba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBzZW1hbnRpY09iamVjdHM7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkpOiBTZW1hbnRpY09iamVjdE1hcHBpbmdbXSB7XG5cdGNvbnN0IHNlbWFudGljT2JqZWN0TWFwcGluZ3MgPSBbXTtcblx0Y29uc3QgX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMgPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uIGFzIHsgW2tleTogc3RyaW5nXTogYW55IH0gfCB1bmRlZmluZWQ7XG5cdGlmIChfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9ucykge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIF9wcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0XHRpZiAoX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnNba2V5XT8udGVybSA9PT0gQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0TWFwcGluZykge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmdzLnB1c2goX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnNba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBzZW1hbnRpY09iamVjdE1hcHBpbmdzO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSk6IFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW10ge1xuXHRjb25zdCBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IFtdO1xuXHRjb25zdCBfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9ucyA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24gYXMgeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IHVuZGVmaW5lZDtcblx0aWYgKF9wcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gX3Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMpIHtcblx0XHRcdGlmIChfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9uc1trZXldPy50ZXJtID09PSBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMpIHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMucHVzaChfcHJvcGVydHlDb21tb25Bbm5vdGF0aW9uc1trZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxNQUFNQSxnQ0FBZ0MsR0FBSUMsY0FBNkIsSUFBb0I7SUFDakcsTUFBTUMscUJBQXFCLEdBQUdELGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFRSxLQUFLLENBQUMsU0FBUyxDQUFDO0lBQzlELElBQUlELHFCQUFxQixhQUFyQkEscUJBQXFCLGVBQXJCQSxxQkFBcUIsQ0FBRUUsTUFBTSxJQUFJRixxQkFBcUIsQ0FBQ0UsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUN0RSxPQUFPRixxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFDaEM7SUFDQSxPQUFPLElBQUk7RUFDWixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sTUFBTUcsaUJBQWlCLEdBQUcsVUFBVUMsUUFBdUMsRUFBVztJQUFBO0lBQzVGLE1BQU1DLDBCQUEwQiw0QkFBR0QsUUFBUSxDQUFDRSxXQUFXLDBEQUFwQixzQkFBc0JDLE1BQTRDO0lBQ3JHLElBQUlGLDBCQUEwQixFQUFFO01BQy9CLEtBQUssTUFBTUcsR0FBRyxJQUFJSCwwQkFBMEIsRUFBRTtRQUFBO1FBQzdDLElBQUksMEJBQUFBLDBCQUEwQixDQUFDRyxHQUFHLENBQUMsMERBQS9CLHNCQUFpQ0MsSUFBSSxxREFBeUMsRUFBRTtVQUNuRixPQUFPLElBQUk7UUFDWjtNQUNEO0lBQ0Q7SUFDQSxPQUFPLEtBQUs7RUFDYixDQUFDO0VBQUM7RUFFSyxNQUFNQyxrQkFBa0IsR0FBRyxVQUFVTixRQUF1QyxFQUFvQjtJQUFBO0lBQ3RHLE1BQU1PLGVBQWUsR0FBRyxFQUFFO0lBQzFCLE1BQU1OLDBCQUEwQiw2QkFBR0QsUUFBUSxDQUFDRSxXQUFXLDJEQUFwQix1QkFBc0JDLE1BQTRDO0lBQ3JHLElBQUlGLDBCQUEwQixFQUFFO01BQy9CLEtBQUssTUFBTUcsR0FBRyxJQUFJSCwwQkFBMEIsRUFBRTtRQUFBO1FBQzdDLElBQUksMkJBQUFBLDBCQUEwQixDQUFDRyxHQUFHLENBQUMsMkRBQS9CLHVCQUFpQ0MsSUFBSSxxREFBeUMsRUFBRTtVQUNuRkUsZUFBZSxDQUFDQyxJQUFJLENBQUNQLDBCQUEwQixDQUFDRyxHQUFHLENBQUMsQ0FBQztRQUN0RDtNQUNEO0lBQ0Q7SUFDQSxPQUFPRyxlQUFlO0VBQ3ZCLENBQUM7RUFBQztFQUVLLE1BQU1FLHlCQUF5QixHQUFHLFVBQVVULFFBQXVDLEVBQTJCO0lBQUE7SUFDcEgsTUFBTVUsc0JBQXNCLEdBQUcsRUFBRTtJQUNqQyxNQUFNVCwwQkFBMEIsNkJBQUdELFFBQVEsQ0FBQ0UsV0FBVywyREFBcEIsdUJBQXNCQyxNQUE0QztJQUNyRyxJQUFJRiwwQkFBMEIsRUFBRTtNQUMvQixLQUFLLE1BQU1HLEdBQUcsSUFBSUgsMEJBQTBCLEVBQUU7UUFBQTtRQUM3QyxJQUFJLDJCQUFBQSwwQkFBMEIsQ0FBQ0csR0FBRyxDQUFDLDJEQUEvQix1QkFBaUNDLElBQUksNERBQWdELEVBQUU7VUFDMUZLLHNCQUFzQixDQUFDRixJQUFJLENBQUNQLDBCQUEwQixDQUFDRyxHQUFHLENBQUMsQ0FBQztRQUM3RDtNQUNEO0lBQ0Q7SUFDQSxPQUFPTSxzQkFBc0I7RUFDOUIsQ0FBQztFQUFDO0VBRUssTUFBTUMsbUNBQW1DLEdBQUcsVUFBVVgsUUFBdUMsRUFBc0M7SUFBQTtJQUN6SSxNQUFNWSxnQ0FBZ0MsR0FBRyxFQUFFO0lBQzNDLE1BQU1YLDBCQUEwQiw2QkFBR0QsUUFBUSxDQUFDRSxXQUFXLDJEQUFwQix1QkFBc0JDLE1BQTRDO0lBQ3JHLElBQUlGLDBCQUEwQixFQUFFO01BQy9CLEtBQUssTUFBTUcsR0FBRyxJQUFJSCwwQkFBMEIsRUFBRTtRQUFBO1FBQzdDLElBQUksMkJBQUFBLDBCQUEwQixDQUFDRyxHQUFHLENBQUMsMkRBQS9CLHVCQUFpQ0MsSUFBSSx1RUFBMkQsRUFBRTtVQUNyR08sZ0NBQWdDLENBQUNKLElBQUksQ0FBQ1AsMEJBQTBCLENBQUNHLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZFO01BQ0Q7SUFDRDtJQUNBLE9BQU9RLGdDQUFnQztFQUN4QyxDQUFDO0VBQUM7RUFBQTtBQUFBIn0=