/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  /**
   * Transforms a jQuery promise into a regular ES6/TS promise.
   *
   * @param oThenable The jQueryPromise
   * @returns The corresponding ES6 Promise
   */
  function toES6Promise(oThenable) {
    return Promise.resolve(oThenable.then(function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return Array.prototype.slice.call(args);
    }).catch(function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return Array.prototype.slice.call(args);
    }));
  }
  return toES6Promise;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b0VTNlByb21pc2UiLCJvVGhlbmFibGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJhcmdzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJjYXRjaCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVG9FUzZQcm9taXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVHJhbnNmb3JtcyBhIGpRdWVyeSBwcm9taXNlIGludG8gYSByZWd1bGFyIEVTNi9UUyBwcm9taXNlLlxuICpcbiAqIEBwYXJhbSBvVGhlbmFibGUgVGhlIGpRdWVyeVByb21pc2VcbiAqIEByZXR1cm5zIFRoZSBjb3JyZXNwb25kaW5nIEVTNiBQcm9taXNlXG4gKi9cbmZ1bmN0aW9uIHRvRVM2UHJvbWlzZShvVGhlbmFibGU6IGFueSk6IFByb21pc2U8YW55PiB7XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoXG5cdFx0b1RoZW5hYmxlXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRcdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRcdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuXHRcdFx0fSlcblx0KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9FUzZQcm9taXNlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0EsWUFBWSxDQUFDQyxTQUFjLEVBQWdCO0lBQ25ELE9BQU9DLE9BQU8sQ0FBQ0MsT0FBTyxDQUNyQkYsU0FBUyxDQUNQRyxJQUFJLENBQUMsWUFBMEI7TUFBQSxrQ0FBYkMsSUFBSTtRQUFKQSxJQUFJO01BQUE7TUFDdEIsT0FBT0MsS0FBSyxDQUFDQyxTQUFTLENBQUNDLEtBQUssQ0FBQ0MsSUFBSSxDQUFDSixJQUFJLENBQUM7SUFDeEMsQ0FBQyxDQUFDLENBQ0RLLEtBQUssQ0FBQyxZQUEwQjtNQUFBLG1DQUFiTCxJQUFJO1FBQUpBLElBQUk7TUFBQTtNQUN2QixPQUFPQyxLQUFLLENBQUNDLFNBQVMsQ0FBQ0MsS0FBSyxDQUFDQyxJQUFJLENBQUNKLElBQUksQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FDSDtFQUNGO0VBQUMsT0FFY0wsWUFBWTtBQUFBIn0=