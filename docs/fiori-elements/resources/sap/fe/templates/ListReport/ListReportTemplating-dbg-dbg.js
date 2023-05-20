/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/StableIdHelper"], function (StableIdHelper) {
  "use strict";

  var _exports = {};
  var generate = StableIdHelper.generate;
  /**
   * Method returns an VariantBackReference expression based on variantManagement and oConverterContext value.
   *
   * @function
   * @name getVariantBackReference
   * @param {object} oViewData Object Containing View Data
   * @param {object} oConverterContext Object containing converted context
   * @returns {string}
   */

  const getVariantBackReference = function (oViewData, oConverterContext) {
    if (oViewData && oViewData.variantManagement === "Page") {
      return "fe::PageVariantManagement";
    }
    if (oViewData && oViewData.variantManagement === "Control") {
      return generate([oConverterContext.filterBarId, "VariantManagement"]);
    }
    return undefined;
  };
  _exports.getVariantBackReference = getVariantBackReference;
  const getDefaultPath = function (aViews) {
    for (let i = 0; i < aViews.length; i++) {
      if (aViews[i].defaultPath) {
        return aViews[i].defaultPath;
      }
    }
  };
  _exports.getDefaultPath = getDefaultPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRWYXJpYW50QmFja1JlZmVyZW5jZSIsIm9WaWV3RGF0YSIsIm9Db252ZXJ0ZXJDb250ZXh0IiwidmFyaWFudE1hbmFnZW1lbnQiLCJnZW5lcmF0ZSIsImZpbHRlckJhcklkIiwidW5kZWZpbmVkIiwiZ2V0RGVmYXVsdFBhdGgiLCJhVmlld3MiLCJpIiwibGVuZ3RoIiwiZGVmYXVsdFBhdGgiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkxpc3RSZXBvcnRUZW1wbGF0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRlbXBsYXRlIEhlbHBlcnMgZm9yIHRoZSBMaXN0IFJlcG9ydFxuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuXG4vKipcbiAqIE1ldGhvZCByZXR1cm5zIGFuIFZhcmlhbnRCYWNrUmVmZXJlbmNlIGV4cHJlc3Npb24gYmFzZWQgb24gdmFyaWFudE1hbmFnZW1lbnQgYW5kIG9Db252ZXJ0ZXJDb250ZXh0IHZhbHVlLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgZ2V0VmFyaWFudEJhY2tSZWZlcmVuY2VcbiAqIEBwYXJhbSB7b2JqZWN0fSBvVmlld0RhdGEgT2JqZWN0IENvbnRhaW5pbmcgVmlldyBEYXRhXG4gKiBAcGFyYW0ge29iamVjdH0gb0NvbnZlcnRlckNvbnRleHQgT2JqZWN0IGNvbnRhaW5pbmcgY29udmVydGVkIGNvbnRleHRcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cblxuZXhwb3J0IGNvbnN0IGdldFZhcmlhbnRCYWNrUmVmZXJlbmNlID0gZnVuY3Rpb24gKG9WaWV3RGF0YTogYW55LCBvQ29udmVydGVyQ29udGV4dDogYW55KSB7XG5cdGlmIChvVmlld0RhdGEgJiYgb1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIlBhZ2VcIikge1xuXHRcdHJldHVybiBcImZlOjpQYWdlVmFyaWFudE1hbmFnZW1lbnRcIjtcblx0fVxuXHRpZiAob1ZpZXdEYXRhICYmIG9WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIpIHtcblx0XHRyZXR1cm4gZ2VuZXJhdGUoW29Db252ZXJ0ZXJDb250ZXh0LmZpbHRlckJhcklkLCBcIlZhcmlhbnRNYW5hZ2VtZW50XCJdKTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldERlZmF1bHRQYXRoID0gZnVuY3Rpb24gKGFWaWV3czogYW55KSB7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYVZpZXdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGFWaWV3c1tpXS5kZWZhdWx0UGF0aCkge1xuXHRcdFx0cmV0dXJuIGFWaWV3c1tpXS5kZWZhdWx0UGF0aDtcblx0XHR9XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFTyxNQUFNQSx1QkFBdUIsR0FBRyxVQUFVQyxTQUFjLEVBQUVDLGlCQUFzQixFQUFFO0lBQ3hGLElBQUlELFNBQVMsSUFBSUEsU0FBUyxDQUFDRSxpQkFBaUIsS0FBSyxNQUFNLEVBQUU7TUFDeEQsT0FBTywyQkFBMkI7SUFDbkM7SUFDQSxJQUFJRixTQUFTLElBQUlBLFNBQVMsQ0FBQ0UsaUJBQWlCLEtBQUssU0FBUyxFQUFFO01BQzNELE9BQU9DLFFBQVEsQ0FBQyxDQUFDRixpQkFBaUIsQ0FBQ0csV0FBVyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDdEU7SUFDQSxPQUFPQyxTQUFTO0VBQ2pCLENBQUM7RUFBQztFQUVLLE1BQU1DLGNBQWMsR0FBRyxVQUFVQyxNQUFXLEVBQUU7SUFDcEQsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdELE1BQU0sQ0FBQ0UsTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRTtNQUN2QyxJQUFJRCxNQUFNLENBQUNDLENBQUMsQ0FBQyxDQUFDRSxXQUFXLEVBQUU7UUFDMUIsT0FBT0gsTUFBTSxDQUFDQyxDQUFDLENBQUMsQ0FBQ0UsV0FBVztNQUM3QjtJQUNEO0VBQ0QsQ0FBQztFQUFDO0VBQUE7QUFBQSJ9