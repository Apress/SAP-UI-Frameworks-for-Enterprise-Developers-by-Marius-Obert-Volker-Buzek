/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (BuildingBlockTemplateProcessor) {
  "use strict";

  var _exports = {};
  var xml = BuildingBlockTemplateProcessor.xml;
  function getInteractiveChartWithErrorTemplate(visualFilter) {
    const chartAnnotation = visualFilter.chartAnnotation;
    if (visualFilter.chartMeasure && chartAnnotation !== null && chartAnnotation !== void 0 && chartAnnotation.Dimensions && chartAnnotation.Dimensions[0]) {
      return xml`<InteractiveLineChart
                        xmlns="sap.suite.ui.microchart"
                        xmlns:core="sap.ui.core"
                        core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
                        showError="${visualFilter.showError}"
                        errorMessageTitle="${visualFilter.errorMessageTitle}"
                        errorMessage="${visualFilter.errorMessage}"
                    />`;
    }
    return xml``;
  }
  _exports.getInteractiveChartWithErrorTemplate = getInteractiveChartWithErrorTemplate;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRJbnRlcmFjdGl2ZUNoYXJ0V2l0aEVycm9yVGVtcGxhdGUiLCJ2aXN1YWxGaWx0ZXIiLCJjaGFydEFubm90YXRpb24iLCJjaGFydE1lYXN1cmUiLCJEaW1lbnNpb25zIiwieG1sIiwic2hvd0Vycm9yIiwiZXJyb3JNZXNzYWdlVGl0bGUiLCJlcnJvck1lc3NhZ2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkludGVyYWN0aXZlQ2hhcnRXaXRoRXJyb3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IFZpc3VhbEZpbHRlckJsb2NrIGZyb20gXCIuLi9WaXN1YWxGaWx0ZXIuYmxvY2tcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVyYWN0aXZlQ2hhcnRXaXRoRXJyb3JUZW1wbGF0ZSh2aXN1YWxGaWx0ZXI6IFZpc3VhbEZpbHRlckJsb2NrKTogc3RyaW5nIHtcblx0Y29uc3QgY2hhcnRBbm5vdGF0aW9uID0gdmlzdWFsRmlsdGVyLmNoYXJ0QW5ub3RhdGlvbjtcblx0aWYgKHZpc3VhbEZpbHRlci5jaGFydE1lYXN1cmUgJiYgY2hhcnRBbm5vdGF0aW9uPy5EaW1lbnNpb25zICYmIGNoYXJ0QW5ub3RhdGlvbi5EaW1lbnNpb25zWzBdKSB7XG5cdFx0cmV0dXJuIHhtbGA8SW50ZXJhY3RpdmVMaW5lQ2hhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHhtbG5zPVwic2FwLnN1aXRlLnVpLm1pY3JvY2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcmU6cmVxdWlyZT1cIntWaXN1YWxGaWx0ZXJSdW50aW1lOiAnc2FwL2ZlL21hY3Jvcy92aXN1YWxmaWx0ZXJzL1Zpc3VhbEZpbHRlclJ1bnRpbWUnfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93RXJyb3I9XCIke3Zpc3VhbEZpbHRlci5zaG93RXJyb3J9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZVRpdGxlPVwiJHt2aXN1YWxGaWx0ZXIuZXJyb3JNZXNzYWdlVGl0bGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZT1cIiR7dmlzdWFsRmlsdGVyLmVycm9yTWVzc2FnZX1cIlxuICAgICAgICAgICAgICAgICAgICAvPmA7XG5cdH1cblx0cmV0dXJuIHhtbGBgO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFHTyxTQUFTQSxvQ0FBb0MsQ0FBQ0MsWUFBK0IsRUFBVTtJQUM3RixNQUFNQyxlQUFlLEdBQUdELFlBQVksQ0FBQ0MsZUFBZTtJQUNwRCxJQUFJRCxZQUFZLENBQUNFLFlBQVksSUFBSUQsZUFBZSxhQUFmQSxlQUFlLGVBQWZBLGVBQWUsQ0FBRUUsVUFBVSxJQUFJRixlQUFlLENBQUNFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtNQUM5RixPQUFPQyxHQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0EscUNBQXFDSixZQUFZLENBQUNLLFNBQVU7QUFDNUQsNkNBQTZDTCxZQUFZLENBQUNNLGlCQUFrQjtBQUM1RSx3Q0FBd0NOLFlBQVksQ0FBQ08sWUFBYTtBQUNsRSx1QkFBdUI7SUFDdEI7SUFDQSxPQUFPSCxHQUFJLEVBQUM7RUFDYjtFQUFDO0VBQUE7QUFBQSJ9