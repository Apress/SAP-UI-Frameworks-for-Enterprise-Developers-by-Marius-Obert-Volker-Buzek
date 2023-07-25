/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/deepClone", "sap/fe/core/CommonUtils", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/delegates/TableDelegate", "sap/fe/macros/table/Utils", "sap/ui/model/Filter"], function (deepClone, CommonUtils, ChartUtils, DelegateUtil, TableDelegate, TableUtils, Filter) {
  "use strict";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69.0
   * @alias sap.fe.macros.ALPTableDelegate
   */
  const ALPTableDelegate = Object.assign({}, TableDelegate, {
    _internalUpdateBindingInfo: function (table, bindingInfo) {
      var _getChartControl, _ref;
      let filterInfo;
      let chartFilterInfo = {},
        tableFilterInfo = {};
      let chartFilters;

      // We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
      // be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
      Object.assign(bindingInfo, deepClone(DelegateUtil.getCustomData(table, "rowsBindingInfo")));
      if (table.getRowBinding()) {
        bindingInfo.suspended = false;
      }
      const view = CommonUtils.getTargetView(table);
      const mdcChart = (_getChartControl = (_ref = view.getController()).getChartControl) === null || _getChartControl === void 0 ? void 0 : _getChartControl.call(_ref);
      const chartSelectionsExist = ChartUtils.getChartSelectionsExist(mdcChart, table);
      tableFilterInfo = TableUtils.getAllFilterInfo(table);
      const tableFilters = tableFilterInfo && tableFilterInfo.filters;
      filterInfo = tableFilterInfo;
      if (chartSelectionsExist) {
        chartFilterInfo = ChartUtils.getAllFilterInfo(mdcChart);
        chartFilters = chartFilterInfo && chartFilterInfo.filters ? CommonUtils.getChartPropertiesWithoutPrefixes(chartFilterInfo.filters) : null;
        filterInfo = chartFilterInfo;
      }
      const finalFilters = (tableFilters && chartFilters ? tableFilters.concat(chartFilters) : chartFilters || tableFilters) || [];
      const oFilter = finalFilters.length > 0 && new Filter({
        filters: finalFilters,
        and: true
      });
      if (filterInfo.bindingPath) {
        // In case of parameters
        bindingInfo.path = filterInfo.bindingPath;
      }

      // Prepare binding info with filter/search parameters
      ALPTableDelegate.updateBindingInfoWithSearchQuery(bindingInfo, filterInfo, oFilter);
    },
    rebind: function (table, bindingInfo) {
      const internalModelContext = table.getBindingContext("pageInternal");
      const templateContentView = internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.getProperty(`${internalModelContext.getPath()}/alpContentView`);
      if (templateContentView !== "Chart") {
        TableDelegate.rebind(table, bindingInfo);
      }
    }
  });
  return ALPTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBTFBUYWJsZURlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiVGFibGVEZWxlZ2F0ZSIsIl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvIiwidGFibGUiLCJiaW5kaW5nSW5mbyIsImZpbHRlckluZm8iLCJjaGFydEZpbHRlckluZm8iLCJ0YWJsZUZpbHRlckluZm8iLCJjaGFydEZpbHRlcnMiLCJkZWVwQ2xvbmUiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwiZ2V0Um93QmluZGluZyIsInN1c3BlbmRlZCIsInZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJtZGNDaGFydCIsImdldENvbnRyb2xsZXIiLCJnZXRDaGFydENvbnRyb2wiLCJjaGFydFNlbGVjdGlvbnNFeGlzdCIsIkNoYXJ0VXRpbHMiLCJnZXRDaGFydFNlbGVjdGlvbnNFeGlzdCIsIlRhYmxlVXRpbHMiLCJnZXRBbGxGaWx0ZXJJbmZvIiwidGFibGVGaWx0ZXJzIiwiZmlsdGVycyIsImdldENoYXJ0UHJvcGVydGllc1dpdGhvdXRQcmVmaXhlcyIsImZpbmFsRmlsdGVycyIsImNvbmNhdCIsIm9GaWx0ZXIiLCJsZW5ndGgiLCJGaWx0ZXIiLCJhbmQiLCJiaW5kaW5nUGF0aCIsInBhdGgiLCJ1cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeSIsInJlYmluZCIsImludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJ0ZW1wbGF0ZUNvbnRlbnRWaWV3IiwiZ2V0UHJvcGVydHkiLCJnZXRQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBTFBUYWJsZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWVwQ2xvbmUgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcENsb25lXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGUgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvZGVsZWdhdGVzL1RhYmxlRGVsZWdhdGVcIjtcbmltcG9ydCBUYWJsZVV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1V0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VQcm9wZXJ0eUluZm8gfSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcblxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHNhcC51aS5tZGMuVGFibGUuXG4gKiA8aDM+PGI+Tm90ZTo8L2I+PC9oMz5cbiAqIFRoZSBjbGFzcyBpcyBleHBlcmltZW50YWwgYW5kIHRoZSBBUEkvYmVoYXZpb3VyIGlzIG5vdCBmaW5hbGlzZWQgYW5kIGhlbmNlIHRoaXMgc2hvdWxkIG5vdCBiZSB1c2VkIGZvciBwcm9kdWN0aXZlIHVzYWdlLlxuICpcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuNjkuMFxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuQUxQVGFibGVEZWxlZ2F0ZVxuICovXG5jb25zdCBBTFBUYWJsZURlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgVGFibGVEZWxlZ2F0ZSwge1xuXHRfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbzogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgYmluZGluZ0luZm86IEJhc2VQcm9wZXJ0eUluZm8pIHtcblx0XHRsZXQgZmlsdGVySW5mbztcblx0XHRsZXQgY2hhcnRGaWx0ZXJJbmZvOiBhbnkgPSB7fSxcblx0XHRcdHRhYmxlRmlsdGVySW5mbzogYW55ID0ge307XG5cdFx0bGV0IGNoYXJ0RmlsdGVycztcblxuXHRcdC8vIFdlIG5lZWQgdG8gZGVlcENsb25lIHRoZSBpbmZvIHdlIGdldCBmcm9tIHRoZSBjdXN0b20gZGF0YSwgb3RoZXJ3aXNlIHNvbWUgb2YgaXRzIHN1Ym9iamVjdHMgKGUuZy4gcGFyYW1ldGVycykgd2lsbFxuXHRcdC8vIGJlIHNoYXJlZCB3aXRoIG9CaW5kaW5nSW5mbyBhbmQgbW9kaWZpZWQgbGF0ZXIgKE9iamVjdC5hc3NpZ24gb25seSBkb2VzIGEgc2hhbGxvdyBjbG9uZSlcblx0XHRPYmplY3QuYXNzaWduKGJpbmRpbmdJbmZvLCBkZWVwQ2xvbmUoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEodGFibGUsIFwicm93c0JpbmRpbmdJbmZvXCIpKSk7XG5cdFx0aWYgKHRhYmxlLmdldFJvd0JpbmRpbmcoKSkge1xuXHRcdFx0YmluZGluZ0luZm8uc3VzcGVuZGVkID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNvbnN0IHZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRhYmxlKTtcblx0XHRjb25zdCBtZGNDaGFydCA9ICh2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLmdldENoYXJ0Q29udHJvbD8uKCk7XG5cdFx0Y29uc3QgY2hhcnRTZWxlY3Rpb25zRXhpc3QgPSBDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0aW9uc0V4aXN0KG1kY0NoYXJ0LCB0YWJsZSk7XG5cdFx0dGFibGVGaWx0ZXJJbmZvID0gVGFibGVVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKHRhYmxlKTtcblx0XHRjb25zdCB0YWJsZUZpbHRlcnMgPSB0YWJsZUZpbHRlckluZm8gJiYgdGFibGVGaWx0ZXJJbmZvLmZpbHRlcnM7XG5cdFx0ZmlsdGVySW5mbyA9IHRhYmxlRmlsdGVySW5mbztcblx0XHRpZiAoY2hhcnRTZWxlY3Rpb25zRXhpc3QpIHtcblx0XHRcdGNoYXJ0RmlsdGVySW5mbyA9IENoYXJ0VXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhtZGNDaGFydCk7XG5cdFx0XHRjaGFydEZpbHRlcnMgPVxuXHRcdFx0XHRjaGFydEZpbHRlckluZm8gJiYgY2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMgPyBDb21tb25VdGlscy5nZXRDaGFydFByb3BlcnRpZXNXaXRob3V0UHJlZml4ZXMoY2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMpIDogbnVsbDtcblx0XHRcdGZpbHRlckluZm8gPSBjaGFydEZpbHRlckluZm87XG5cdFx0fVxuXHRcdGNvbnN0IGZpbmFsRmlsdGVycyA9ICh0YWJsZUZpbHRlcnMgJiYgY2hhcnRGaWx0ZXJzID8gdGFibGVGaWx0ZXJzLmNvbmNhdChjaGFydEZpbHRlcnMpIDogY2hhcnRGaWx0ZXJzIHx8IHRhYmxlRmlsdGVycykgfHwgW107XG5cdFx0Y29uc3Qgb0ZpbHRlciA9XG5cdFx0XHRmaW5hbEZpbHRlcnMubGVuZ3RoID4gMCAmJlxuXHRcdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRcdGZpbHRlcnM6IGZpbmFsRmlsdGVycyxcblx0XHRcdFx0YW5kOiB0cnVlXG5cdFx0XHR9KTtcblxuXHRcdGlmIChmaWx0ZXJJbmZvLmJpbmRpbmdQYXRoKSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIHBhcmFtZXRlcnNcblx0XHRcdGJpbmRpbmdJbmZvLnBhdGggPSBmaWx0ZXJJbmZvLmJpbmRpbmdQYXRoO1xuXHRcdH1cblxuXHRcdC8vIFByZXBhcmUgYmluZGluZyBpbmZvIHdpdGggZmlsdGVyL3NlYXJjaCBwYXJhbWV0ZXJzXG5cdFx0QUxQVGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeShiaW5kaW5nSW5mbywgZmlsdGVySW5mbywgb0ZpbHRlcik7XG5cdH0sXG5cdHJlYmluZDogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgYmluZGluZ0luZm86IGFueSkge1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gdGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJwYWdlSW50ZXJuYWxcIik7XG5cdFx0Y29uc3QgdGVtcGxhdGVDb250ZW50VmlldyA9IGludGVybmFsTW9kZWxDb250ZXh0Py5nZXRQcm9wZXJ0eShgJHtpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0aWYgKHRlbXBsYXRlQ29udGVudFZpZXcgIT09IFwiQ2hhcnRcIikge1xuXHRcdFx0VGFibGVEZWxlZ2F0ZS5yZWJpbmQodGFibGUsIGJpbmRpbmdJbmZvKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBBTFBUYWJsZURlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1BLGdCQUFnQixHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsYUFBYSxFQUFFO0lBQ3pEQywwQkFBMEIsRUFBRSxVQUFVQyxLQUFZLEVBQUVDLFdBQTZCLEVBQUU7TUFBQTtNQUNsRixJQUFJQyxVQUFVO01BQ2QsSUFBSUMsZUFBb0IsR0FBRyxDQUFDLENBQUM7UUFDNUJDLGVBQW9CLEdBQUcsQ0FBQyxDQUFDO01BQzFCLElBQUlDLFlBQVk7O01BRWhCO01BQ0E7TUFDQVQsTUFBTSxDQUFDQyxNQUFNLENBQUNJLFdBQVcsRUFBRUssU0FBUyxDQUFDQyxZQUFZLENBQUNDLGFBQWEsQ0FBQ1IsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztNQUMzRixJQUFJQSxLQUFLLENBQUNTLGFBQWEsRUFBRSxFQUFFO1FBQzFCUixXQUFXLENBQUNTLFNBQVMsR0FBRyxLQUFLO01BQzlCO01BQ0EsTUFBTUMsSUFBSSxHQUFHQyxXQUFXLENBQUNDLGFBQWEsQ0FBQ2IsS0FBSyxDQUFDO01BQzdDLE1BQU1jLFFBQVEsdUJBQUcsUUFBQ0gsSUFBSSxDQUFDSSxhQUFhLEVBQUUsRUFBU0MsZUFBZSxxREFBN0MsMkJBQWlEO01BQ2xFLE1BQU1DLG9CQUFvQixHQUFHQyxVQUFVLENBQUNDLHVCQUF1QixDQUFDTCxRQUFRLEVBQUVkLEtBQUssQ0FBQztNQUNoRkksZUFBZSxHQUFHZ0IsVUFBVSxDQUFDQyxnQkFBZ0IsQ0FBQ3JCLEtBQUssQ0FBQztNQUNwRCxNQUFNc0IsWUFBWSxHQUFHbEIsZUFBZSxJQUFJQSxlQUFlLENBQUNtQixPQUFPO01BQy9EckIsVUFBVSxHQUFHRSxlQUFlO01BQzVCLElBQUlhLG9CQUFvQixFQUFFO1FBQ3pCZCxlQUFlLEdBQUdlLFVBQVUsQ0FBQ0csZ0JBQWdCLENBQUNQLFFBQVEsQ0FBQztRQUN2RFQsWUFBWSxHQUNYRixlQUFlLElBQUlBLGVBQWUsQ0FBQ29CLE9BQU8sR0FBR1gsV0FBVyxDQUFDWSxpQ0FBaUMsQ0FBQ3JCLGVBQWUsQ0FBQ29CLE9BQU8sQ0FBQyxHQUFHLElBQUk7UUFDM0hyQixVQUFVLEdBQUdDLGVBQWU7TUFDN0I7TUFDQSxNQUFNc0IsWUFBWSxHQUFHLENBQUNILFlBQVksSUFBSWpCLFlBQVksR0FBR2lCLFlBQVksQ0FBQ0ksTUFBTSxDQUFDckIsWUFBWSxDQUFDLEdBQUdBLFlBQVksSUFBSWlCLFlBQVksS0FBSyxFQUFFO01BQzVILE1BQU1LLE9BQU8sR0FDWkYsWUFBWSxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxJQUN2QixJQUFJQyxNQUFNLENBQUM7UUFDVk4sT0FBTyxFQUFFRSxZQUFZO1FBQ3JCSyxHQUFHLEVBQUU7TUFDTixDQUFDLENBQUM7TUFFSCxJQUFJNUIsVUFBVSxDQUFDNkIsV0FBVyxFQUFFO1FBQzNCO1FBQ0E5QixXQUFXLENBQUMrQixJQUFJLEdBQUc5QixVQUFVLENBQUM2QixXQUFXO01BQzFDOztNQUVBO01BQ0FwQyxnQkFBZ0IsQ0FBQ3NDLGdDQUFnQyxDQUFDaEMsV0FBVyxFQUFFQyxVQUFVLEVBQUV5QixPQUFPLENBQUM7SUFDcEYsQ0FBQztJQUNETyxNQUFNLEVBQUUsVUFBVWxDLEtBQVksRUFBRUMsV0FBZ0IsRUFBRTtNQUNqRCxNQUFNa0Msb0JBQW9CLEdBQUduQyxLQUFLLENBQUNvQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUM7TUFDcEUsTUFBTUMsbUJBQW1CLEdBQUdGLG9CQUFvQixhQUFwQkEsb0JBQW9CLHVCQUFwQkEsb0JBQW9CLENBQUVHLFdBQVcsQ0FBRSxHQUFFSCxvQkFBb0IsQ0FBQ0ksT0FBTyxFQUFHLGlCQUFnQixDQUFDO01BQ2pILElBQUlGLG1CQUFtQixLQUFLLE9BQU8sRUFBRTtRQUNwQ3ZDLGFBQWEsQ0FBQ29DLE1BQU0sQ0FBQ2xDLEtBQUssRUFBRUMsV0FBVyxDQUFDO01BQ3pDO0lBQ0Q7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUVZTixnQkFBZ0I7QUFBQSJ9