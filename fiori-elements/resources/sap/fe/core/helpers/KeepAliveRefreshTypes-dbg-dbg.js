/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Enumeration for supported refresh strategy type
   */
  let RefreshStrategyType;
  /**
   * Configuration of a RefreshStrategy
   */
  (function (RefreshStrategyType) {
    RefreshStrategyType["Self"] = "self";
    RefreshStrategyType["IncludingDependents"] = "includingDependents";
  })(RefreshStrategyType || (RefreshStrategyType = {}));
  _exports.RefreshStrategyType = RefreshStrategyType;
  /**
   * Path used to store information
   */
  const PATH_TO_STORE = "/refreshStrategyOnAppRestore";
  _exports.PATH_TO_STORE = PATH_TO_STORE;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWZyZXNoU3RyYXRlZ3lUeXBlIiwiUEFUSF9UT19TVE9SRSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiS2VlcEFsaXZlUmVmcmVzaFR5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRW51bWVyYXRpb24gZm9yIHN1cHBvcnRlZCByZWZyZXNoIHN0cmF0ZWd5IHR5cGVcbiAqL1xuZXhwb3J0IGVudW0gUmVmcmVzaFN0cmF0ZWd5VHlwZSB7XG5cdFNlbGYgPSBcInNlbGZcIixcblx0SW5jbHVkaW5nRGVwZW5kZW50cyA9IFwiaW5jbHVkaW5nRGVwZW5kZW50c1wiXG59XG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb2YgYSBSZWZyZXNoU3RyYXRlZ3lcbiAqL1xuZXhwb3J0IHR5cGUgU09SZWZyZXNoU3RyYXRlZ3kgPSB7XG5cdFtlbnRpdHlTZXROYW1lT3JDb250ZXh0UGF0aDogc3RyaW5nXTogUmVmcmVzaFN0cmF0ZWd5VHlwZTtcbn07XG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb2YgYSBSZWZyZXNoU3RyYXRlZ2llc1xuICovXG5leHBvcnQgdHlwZSBSZWZyZXNoU3RyYXRlZ2llcyA9IHtcblx0aW50ZW50cz86IHtcblx0XHRbc29BY3Rpb246IHN0cmluZ106IFNPUmVmcmVzaFN0cmF0ZWd5OyAvLyAnc29BY3Rpb24nIGZvcm1hdCBpcyBcIjxTZW1hbnRpY09iamVjdD4tPEFjdGlvbj5cIlxuXHR9O1xuXHRkZWZhdWx0QmVoYXZpb3I/OiBTT1JlZnJlc2hTdHJhdGVneTtcblx0X2ZlRGVmYXVsdD86IFNPUmVmcmVzaFN0cmF0ZWd5O1xufTtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGZvciBoYXNoIHdpdGggc2VtYW50aWNPYmplY3QgYW5kIGFjdGlvblxuICovXG5leHBvcnQgdHlwZSBTT0FjdGlvbiA9IHtcblx0c2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7XG5cdGFjdGlvbj86IHN0cmluZztcbn07XG5cbi8qKlxuICogUGF0aCB1c2VkIHRvIHN0b3JlIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBQQVRIX1RPX1NUT1JFOiBzdHJpbmcgPSBcIi9yZWZyZXNoU3RyYXRlZ3lPbkFwcFJlc3RvcmVcIjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFBQTtBQUNBO0FBQ0E7RUFGQSxJQUdZQSxtQkFBbUI7RUFJL0I7QUFDQTtBQUNBO0VBRkEsV0FKWUEsbUJBQW1CO0lBQW5CQSxtQkFBbUI7SUFBbkJBLG1CQUFtQjtFQUFBLEdBQW5CQSxtQkFBbUIsS0FBbkJBLG1CQUFtQjtFQUFBO0VBNkIvQjtBQUNBO0FBQ0E7RUFDTyxNQUFNQyxhQUFxQixHQUFHLDhCQUE4QjtFQUFDO0VBQUE7QUFBQSJ9