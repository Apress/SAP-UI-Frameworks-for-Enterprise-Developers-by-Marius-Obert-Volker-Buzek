/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/chart/ChartDelegate"], function (BaseChartDelegate) {
  "use strict";

  // ---------------------------------------------------------------------------------------
  // Helper class used to help create content in the chart/item and fill relevant metadata
  // ---------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------
  const ChartDelegate = Object.assign({}, BaseChartDelegate);
  /**
   * @param oMDCChart The mdc chart control
   * @param oBindingInfo The binding info of chart
   * data in chart and table must be synchronised. every
   * time the chart refreshes, the table must be refreshed too.
   */
  ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
    //	var oComponent = flUtils.getAppComponentForControl(oMDCChart);
    //	var bIsSearchTriggered = oComponent.getAppStateHandler().getIsSearchTriggered();
    // workaround in place to prevent chart from loading when go button is present and initial load is false
    //	if (bIsSearchTriggered) {
    const oInternalModelContext = oMDCChart.getBindingContext("pageInternal");
    const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
    if (!sTemplateContentView || sTemplateContentView !== "Table") {
      BaseChartDelegate.rebind(oMDCChart, oBindingInfo);
    }
  };
  return ChartDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydERlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiQmFzZUNoYXJ0RGVsZWdhdGUiLCJyZWJpbmQiLCJvTURDQ2hhcnQiLCJvQmluZGluZ0luZm8iLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiZ2V0UHJvcGVydHkiLCJnZXRQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGRUNoYXJ0RGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VDaGFydERlbGVnYXRlIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0RGVsZWdhdGVcIjtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVscGVyIGNsYXNzIHVzZWQgdG8gaGVscCBjcmVhdGUgY29udGVudCBpbiB0aGUgY2hhcnQvaXRlbSBhbmQgZmlsbCByZWxldmFudCBtZXRhZGF0YVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IENoYXJ0RGVsZWdhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBCYXNlQ2hhcnREZWxlZ2F0ZSk7XG4vKipcbiAqIEBwYXJhbSBvTURDQ2hhcnQgVGhlIG1kYyBjaGFydCBjb250cm9sXG4gKiBAcGFyYW0gb0JpbmRpbmdJbmZvIFRoZSBiaW5kaW5nIGluZm8gb2YgY2hhcnRcbiAqIGRhdGEgaW4gY2hhcnQgYW5kIHRhYmxlIG11c3QgYmUgc3luY2hyb25pc2VkLiBldmVyeVxuICogdGltZSB0aGUgY2hhcnQgcmVmcmVzaGVzLCB0aGUgdGFibGUgbXVzdCBiZSByZWZyZXNoZWQgdG9vLlxuICovXG5DaGFydERlbGVnYXRlLnJlYmluZCA9IGZ1bmN0aW9uIChvTURDQ2hhcnQ6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0Ly9cdHZhciBvQ29tcG9uZW50ID0gZmxVdGlscy5nZXRBcHBDb21wb25lbnRGb3JDb250cm9sKG9NRENDaGFydCk7XG5cdC8vXHR2YXIgYklzU2VhcmNoVHJpZ2dlcmVkID0gb0NvbXBvbmVudC5nZXRBcHBTdGF0ZUhhbmRsZXIoKS5nZXRJc1NlYXJjaFRyaWdnZXJlZCgpO1xuXHQvLyB3b3JrYXJvdW5kIGluIHBsYWNlIHRvIHByZXZlbnQgY2hhcnQgZnJvbSBsb2FkaW5nIHdoZW4gZ28gYnV0dG9uIGlzIHByZXNlbnQgYW5kIGluaXRpYWwgbG9hZCBpcyBmYWxzZVxuXHQvL1x0aWYgKGJJc1NlYXJjaFRyaWdnZXJlZCkge1xuXHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvTURDQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJwYWdlSW50ZXJuYWxcIik7XG5cdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdGlmICghc1RlbXBsYXRlQ29udGVudFZpZXcgfHwgc1RlbXBsYXRlQ29udGVudFZpZXcgIT09IFwiVGFibGVcIikge1xuXHRcdEJhc2VDaGFydERlbGVnYXRlLnJlYmluZChvTURDQ2hhcnQsIG9CaW5kaW5nSW5mbyk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0RGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLE1BQU1BLGFBQWEsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLGlCQUFpQixDQUFDO0VBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBSCxhQUFhLENBQUNJLE1BQU0sR0FBRyxVQUFVQyxTQUFjLEVBQUVDLFlBQWlCLEVBQUU7SUFDbkU7SUFDQTtJQUNBO0lBQ0E7SUFDQSxNQUFNQyxxQkFBcUIsR0FBR0YsU0FBUyxDQUFDRyxpQkFBaUIsQ0FBQyxjQUFjLENBQUM7SUFDekUsTUFBTUMsb0JBQW9CLEdBQUdGLHFCQUFxQixDQUFDRyxXQUFXLENBQUUsR0FBRUgscUJBQXFCLENBQUNJLE9BQU8sRUFBRyxpQkFBZ0IsQ0FBQztJQUNuSCxJQUFJLENBQUNGLG9CQUFvQixJQUFJQSxvQkFBb0IsS0FBSyxPQUFPLEVBQUU7TUFDOUROLGlCQUFpQixDQUFDQyxNQUFNLENBQUNDLFNBQVMsRUFBRUMsWUFBWSxDQUFDO0lBQ2xEO0VBQ0QsQ0FBQztFQUFDLE9BRWFOLGFBQWE7QUFBQSJ9