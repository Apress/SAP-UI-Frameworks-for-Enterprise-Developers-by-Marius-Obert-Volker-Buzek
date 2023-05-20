/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  async function requireDependencies(dependencyNames) {
    let resolveFn;
    const awaiter = new Promise(resolve => {
      resolveFn = resolve;
    });
    if (dependencyNames.length > 0) {
      sap.ui.require(dependencyNames, function () {
        for (var _len = arguments.length, dependencies = new Array(_len), _key = 0; _key < _len; _key++) {
          dependencies[_key] = arguments[_key];
        }
        resolveFn(dependencies);
      });
    } else {
      resolveFn([]);
    }
    return awaiter;
  }
  _exports.requireDependencies = requireDependencies;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZXF1aXJlRGVwZW5kZW5jaWVzIiwiZGVwZW5kZW5jeU5hbWVzIiwicmVzb2x2ZUZuIiwiYXdhaXRlciIsIlByb21pc2UiLCJyZXNvbHZlIiwibGVuZ3RoIiwic2FwIiwidWkiLCJyZXF1aXJlIiwiZGVwZW5kZW5jaWVzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJMb2FkZXJVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZURlcGVuZGVuY2llcyhkZXBlbmRlbmN5TmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxhbnlbXT4ge1xuXHRsZXQgcmVzb2x2ZUZuITogRnVuY3Rpb247XG5cdGNvbnN0IGF3YWl0ZXIgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdHJlc29sdmVGbiA9IHJlc29sdmU7XG5cdH0pO1xuXHRpZiAoZGVwZW5kZW5jeU5hbWVzLmxlbmd0aCA+IDApIHtcblx0XHRzYXAudWkucmVxdWlyZShkZXBlbmRlbmN5TmFtZXMsICguLi5kZXBlbmRlbmNpZXM6IGFueVtdKSA9PiB7XG5cdFx0XHRyZXNvbHZlRm4oZGVwZW5kZW5jaWVzKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXNvbHZlRm4oW10pO1xuXHR9XG5cdHJldHVybiBhd2FpdGVyIGFzIFByb21pc2U8YW55W10+O1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQUFPLGVBQWVBLG1CQUFtQixDQUFDQyxlQUF5QixFQUFrQjtJQUNwRixJQUFJQyxTQUFvQjtJQUN4QixNQUFNQyxPQUFPLEdBQUcsSUFBSUMsT0FBTyxDQUFFQyxPQUFPLElBQUs7TUFDeENILFNBQVMsR0FBR0csT0FBTztJQUNwQixDQUFDLENBQUM7SUFDRixJQUFJSixlQUFlLENBQUNLLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDL0JDLEdBQUcsQ0FBQ0MsRUFBRSxDQUFDQyxPQUFPLENBQUNSLGVBQWUsRUFBRSxZQUE0QjtRQUFBLGtDQUF4QlMsWUFBWTtVQUFaQSxZQUFZO1FBQUE7UUFDL0NSLFNBQVMsQ0FBQ1EsWUFBWSxDQUFDO01BQ3hCLENBQUMsQ0FBQztJQUNILENBQUMsTUFBTTtNQUNOUixTQUFTLENBQUMsRUFBRSxDQUFDO0lBQ2Q7SUFDQSxPQUFPQyxPQUFPO0VBQ2Y7RUFBQztFQUFBO0FBQUEifQ==