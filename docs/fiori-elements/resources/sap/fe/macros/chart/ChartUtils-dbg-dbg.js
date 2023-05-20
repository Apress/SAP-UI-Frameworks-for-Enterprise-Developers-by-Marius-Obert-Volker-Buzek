/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/macros/filter/FilterUtils", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "../CommonHelper", "../table/Utils"], function (CommonUtils, FilterUtil, Filter, FilterOperator, CommonHelper, Utils) {
  "use strict";

  let aPrevDrillStack = [];
  const ChartUtils = {
    /**
     * Method to check if selections exist in the chart.
     *
     * @param oMdcChart The MDC_Chart control
     * @param oInSource The control that has to apply chart filters
     * @returns `true` if chart selection exists, false otherwise
     */
    getChartSelectionsExist: function (oMdcChart, oInSource) {
      // consider chart selections in the current drill stack or on any further drill downs
      const oSource = oInSource || oMdcChart;
      if (oMdcChart) {
        try {
          const oChart = oMdcChart.getControlDelegate()._getChart(oMdcChart);
          if (oChart) {
            const aDimensions = this.getDimensionsFromDrillStack(oChart);
            const bIsDrillDown = aDimensions.length > aPrevDrillStack.length;
            const bIsDrillUp = aDimensions.length < aPrevDrillStack.length;
            const bNoChange = aDimensions.toString() === aPrevDrillStack.toString();
            let aFilters;
            if (bIsDrillUp && aDimensions.length === 1) {
              // drilling up to level0 would clear all selections
              aFilters = this.getChartSelections(oMdcChart, true);
            } else {
              // apply filters of selections of previous drillstack when drilling up/down
              // to the chart and table
              aFilters = this.getChartSelections(oMdcChart);
            }
            if (bIsDrillDown || bIsDrillUp) {
              // update the drillstack on a drill up/ drill down
              aPrevDrillStack = aDimensions;
              return aFilters.length > 0;
            } else if (bNoChange && oSource.isA("sap.ui.mdc.Table")) {
              // bNoChange is true when chart is selected
              return aFilters.length > 0;
            }
          }
        } catch (sError) {
          return false;
        }
      }
      return false;
    },
    /**
     * Method that returns the chart filters stored in the UI model.
     *
     * @param oMdcChart The MDC_Chart control
     * @param bClearSelections Clears chart selections in the UI model if true
     * @returns The chart selections
     */
    getChartSelections: function (oMdcChart, bClearSelections) {
      // get chart selections
      if (bClearSelections) {
        this.getChartModel(oMdcChart, "", {});
      }
      const aVizSelections = this.getChartModel(oMdcChart, "filters");
      return aVizSelections || [];
    },
    /**
     * Method that returns the chart selections as a filter.
     *
     * @param oMdcChart The MDC_Chart control
     * @returns Filter containing chart selections
     */
    getChartFilters: function (oMdcChart) {
      // get chart selections as a filter
      const aFilters = this.getChartSelections(oMdcChart) || [];
      return new Filter(aFilters);
    },
    /**
     * Method that sets the chart selections as in the UI model.
     *
     * @param oMdcChart The MDC_Chart control
     */
    setChartFilters: function (oMdcChart) {
      // saving selections in each drill stack for future use
      const oDrillStack = this.getChartModel(oMdcChart, "drillStack") || {};
      const oChart = oMdcChart.getControlDelegate()._getChart(oMdcChart);
      const aChartFilters = [];
      let aVisibleDimensions;
      function addChartFilters(aSelectedData) {
        for (const item in aSelectedData) {
          const aDimFilters = [];
          for (const i in aVisibleDimensions) {
            const sPath = aVisibleDimensions[i];
            const sValue = aSelectedData[item].data[sPath];
            if (sValue !== undefined) {
              aDimFilters.push(new Filter({
                path: sPath,
                operator: FilterOperator.EQ,
                value1: sValue
              }));
            }
          }
          if (aDimFilters.length > 0) {
            aChartFilters.push(new Filter(aDimFilters, true));
          }
        }
      }
      if (oChart) {
        const aVizSelections = this.getVizSelection(oChart);
        aVisibleDimensions = oChart.getVisibleDimensions();
        const aDimensions = this.getDimensionsFromDrillStack(oChart);
        if (aDimensions.length > 0) {
          this.getChartModel(oMdcChart, "drillStack", {});
          oDrillStack[aDimensions.toString()] = aVizSelections;
          this.getChartModel(oMdcChart, "drillStack", oDrillStack);
        }
        if (aVizSelections.length > 0) {
          // creating filters with selections in the current drillstack
          addChartFilters(aVizSelections);
        } else {
          // creating filters with selections in the previous drillstack when there are no selections in the current drillstack
          const aDrillStackKeys = Object.keys(oDrillStack) || [];
          const aPrevDrillStackData = oDrillStack[aDrillStackKeys[aDrillStackKeys.length - 2]] || [];
          addChartFilters(aPrevDrillStackData);
        }
        this.getChartModel(oMdcChart, "filters", aChartFilters);
      }
    },
    /**
     * Method that returns the chart selections as a filter.
     *
     * @param oChart The inner chart control
     * @returns The filters in the filter bar
     */
    getFilterBarFilterInfo: function (oChart) {
      return FilterUtil.getFilterInfo(oChart.getFilter(), {
        targetControl: oChart
      });
    },
    /**
     * Method that returns the filters for the chart and filter bar.
     *
     * @param oChart The inner chart control
     * @returns The new filter containing the filters for both the chart and the filter bar
     */
    getAllFilterInfo: function (oChart) {
      const oFilters = this.getFilterBarFilterInfo(oChart);
      const aChartFilters = this.getChartFilters(oChart);
      // Get filters added through personalization dialog filter option
      const aP13nProperties = Utils.getP13nFilters(oChart);
      // Retrieve selection presentation variant path from custom data
      const selectionPresentationVariantPath = CommonHelper.parseCustomData(oChart.data("selectionPresentationVariantPath")) ? CommonHelper.parseCustomData(oChart.data("selectionPresentationVariantPath")).data : "";
      // Check if SV is present in SPV, if yes get the Sv values
      const aSelctionVariant = selectionPresentationVariantPath ? CommonUtils.getFiltersInfoForSV(oChart, selectionPresentationVariantPath, true) : null;
      if (aChartFilters && aChartFilters.aFilters && aChartFilters.aFilters.length) {
        oFilters.filters.push(aChartFilters);
      }
      if (aP13nProperties.length > 0) {
        aP13nProperties.forEach(element => {
          if (element.aFilters && element.aFilters.length > 0) {
            // if we filter using more than one field
            element.aFilters.forEach(filterValue => {
              oFilters.filters.push(filterValue);
            });
          } else {
            // if we filter using only one field
            oFilters.filters.push(element);
          }
        });
      }
      if (aSelctionVariant && aSelctionVariant.filters.length > 0) {
        aSelctionVariant.filters.forEach(filterValue => {
          oFilters.filters.push(filterValue.aFilters[0]);
        });
      }
      return oFilters;
    },
    /**
     * Method that returns selected data in the chart.
     *
     * @param oChart The inner chart control
     * @returns The selected chart data
     */
    getChartSelectedData: function (oChart) {
      let aSelectedPoints = [];
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (oChart.getSelectionBehavior()) {
        case "DATAPOINT":
          aSelectedPoints = oChart.getSelectedDataPoints().dataPoints;
          break;
        case "CATEGORY":
          aSelectedPoints = oChart.getSelectedCategories().categories;
          break;
        case "SERIES":
          aSelectedPoints = oChart.getSelectedSeries().series;
          break;
      }
      return aSelectedPoints;
    },
    /**
     * Method to get filters, drillstack and selected contexts in the UI model.
     * Can also be used to set data in the model.
     *
     * @param oMdcChart The MDC_Chart control
     * @param sPath The path in the UI model from which chart data is to be set/fetched
     * @param vData The chart info to be set
     * @returns The chart info (filters/drillstack/selectedContexts)
     */
    getChartModel: function (oMdcChart, sPath, vData) {
      const oInternalModelContext = oMdcChart.getBindingContext("internal");
      if (!oInternalModelContext) {
        return false;
      }
      if (vData) {
        oInternalModelContext.setProperty(sPath, vData);
      }
      return oInternalModelContext && oInternalModelContext.getObject(sPath);
    },
    /**
     * Method to fetch the current drillstack dimensions.
     *
     * @param oChart The inner chart control
     * @returns The current drillstack dimensions
     */
    getDimensionsFromDrillStack: function (oChart) {
      const aCurrentDrillStack = oChart.getDrillStack() || [];
      const aCurrentDrillView = aCurrentDrillStack.pop() || {};
      return aCurrentDrillView.dimension || [];
    },
    /**
     * Method to fetch chart selections.
     *
     * @param oChart The inner chart control
     * @returns The chart selections
     */
    getVizSelection: function (oChart) {
      return oChart && oChart._getVizFrame() && oChart._getVizFrame().vizSelection() || [];
    }
  };
  return ChartUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhUHJldkRyaWxsU3RhY2siLCJDaGFydFV0aWxzIiwiZ2V0Q2hhcnRTZWxlY3Rpb25zRXhpc3QiLCJvTWRjQ2hhcnQiLCJvSW5Tb3VyY2UiLCJvU291cmNlIiwib0NoYXJ0IiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiX2dldENoYXJ0IiwiYURpbWVuc2lvbnMiLCJnZXREaW1lbnNpb25zRnJvbURyaWxsU3RhY2siLCJiSXNEcmlsbERvd24iLCJsZW5ndGgiLCJiSXNEcmlsbFVwIiwiYk5vQ2hhbmdlIiwidG9TdHJpbmciLCJhRmlsdGVycyIsImdldENoYXJ0U2VsZWN0aW9ucyIsImlzQSIsInNFcnJvciIsImJDbGVhclNlbGVjdGlvbnMiLCJnZXRDaGFydE1vZGVsIiwiYVZpelNlbGVjdGlvbnMiLCJnZXRDaGFydEZpbHRlcnMiLCJGaWx0ZXIiLCJzZXRDaGFydEZpbHRlcnMiLCJvRHJpbGxTdGFjayIsImFDaGFydEZpbHRlcnMiLCJhVmlzaWJsZURpbWVuc2lvbnMiLCJhZGRDaGFydEZpbHRlcnMiLCJhU2VsZWN0ZWREYXRhIiwiaXRlbSIsImFEaW1GaWx0ZXJzIiwiaSIsInNQYXRoIiwic1ZhbHVlIiwiZGF0YSIsInVuZGVmaW5lZCIsInB1c2giLCJwYXRoIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwidmFsdWUxIiwiZ2V0Vml6U2VsZWN0aW9uIiwiZ2V0VmlzaWJsZURpbWVuc2lvbnMiLCJhRHJpbGxTdGFja0tleXMiLCJPYmplY3QiLCJrZXlzIiwiYVByZXZEcmlsbFN0YWNrRGF0YSIsImdldEZpbHRlckJhckZpbHRlckluZm8iLCJGaWx0ZXJVdGlsIiwiZ2V0RmlsdGVySW5mbyIsImdldEZpbHRlciIsInRhcmdldENvbnRyb2wiLCJnZXRBbGxGaWx0ZXJJbmZvIiwib0ZpbHRlcnMiLCJhUDEzblByb3BlcnRpZXMiLCJVdGlscyIsImdldFAxM25GaWx0ZXJzIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJhU2VsY3Rpb25WYXJpYW50IiwiQ29tbW9uVXRpbHMiLCJnZXRGaWx0ZXJzSW5mb0ZvclNWIiwiZmlsdGVycyIsImZvckVhY2giLCJlbGVtZW50IiwiZmlsdGVyVmFsdWUiLCJnZXRDaGFydFNlbGVjdGVkRGF0YSIsImFTZWxlY3RlZFBvaW50cyIsImdldFNlbGVjdGlvbkJlaGF2aW9yIiwiZ2V0U2VsZWN0ZWREYXRhUG9pbnRzIiwiZGF0YVBvaW50cyIsImdldFNlbGVjdGVkQ2F0ZWdvcmllcyIsImNhdGVnb3JpZXMiLCJnZXRTZWxlY3RlZFNlcmllcyIsInNlcmllcyIsInZEYXRhIiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImdldE9iamVjdCIsImFDdXJyZW50RHJpbGxTdGFjayIsImdldERyaWxsU3RhY2siLCJhQ3VycmVudERyaWxsVmlldyIsInBvcCIsImRpbWVuc2lvbiIsIl9nZXRWaXpGcmFtZSIsInZpelNlbGVjdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnRVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBDaGFydCBmcm9tIFwic2FwL2NoYXJ0L0NoYXJ0XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBGaWx0ZXJVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgTURDQ2hhcnQgZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCIuLi9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwiLi4vdGFibGUvVXRpbHNcIjtcblxubGV0IGFQcmV2RHJpbGxTdGFjazogYW55W10gPSBbXTtcbmNvbnN0IENoYXJ0VXRpbHMgPSB7XG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY2hlY2sgaWYgc2VsZWN0aW9ucyBleGlzdCBpbiB0aGUgY2hhcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWRjQ2hhcnQgVGhlIE1EQ19DaGFydCBjb250cm9sXG5cdCAqIEBwYXJhbSBvSW5Tb3VyY2UgVGhlIGNvbnRyb2wgdGhhdCBoYXMgdG8gYXBwbHkgY2hhcnQgZmlsdGVyc1xuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgY2hhcnQgc2VsZWN0aW9uIGV4aXN0cywgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRnZXRDaGFydFNlbGVjdGlvbnNFeGlzdDogZnVuY3Rpb24gKG9NZGNDaGFydDogTURDQ2hhcnQsIG9JblNvdXJjZT86IENvbnRyb2wpIHtcblx0XHQvLyBjb25zaWRlciBjaGFydCBzZWxlY3Rpb25zIGluIHRoZSBjdXJyZW50IGRyaWxsIHN0YWNrIG9yIG9uIGFueSBmdXJ0aGVyIGRyaWxsIGRvd25zXG5cdFx0Y29uc3Qgb1NvdXJjZSA9IG9JblNvdXJjZSB8fCBvTWRjQ2hhcnQ7XG5cdFx0aWYgKG9NZGNDaGFydCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb0NoYXJ0ID0gKG9NZGNDaGFydCBhcyBhbnkpLmdldENvbnRyb2xEZWxlZ2F0ZSgpLl9nZXRDaGFydChvTWRjQ2hhcnQpIGFzIENoYXJ0O1xuXHRcdFx0XHRpZiAob0NoYXJ0KSB7XG5cdFx0XHRcdFx0Y29uc3QgYURpbWVuc2lvbnMgPSB0aGlzLmdldERpbWVuc2lvbnNGcm9tRHJpbGxTdGFjayhvQ2hhcnQpO1xuXHRcdFx0XHRcdGNvbnN0IGJJc0RyaWxsRG93biA9IGFEaW1lbnNpb25zLmxlbmd0aCA+IGFQcmV2RHJpbGxTdGFjay5sZW5ndGg7XG5cdFx0XHRcdFx0Y29uc3QgYklzRHJpbGxVcCA9IGFEaW1lbnNpb25zLmxlbmd0aCA8IGFQcmV2RHJpbGxTdGFjay5sZW5ndGg7XG5cdFx0XHRcdFx0Y29uc3QgYk5vQ2hhbmdlID0gYURpbWVuc2lvbnMudG9TdHJpbmcoKSA9PT0gYVByZXZEcmlsbFN0YWNrLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0bGV0IGFGaWx0ZXJzOiBhbnlbXTtcblx0XHRcdFx0XHRpZiAoYklzRHJpbGxVcCAmJiBhRGltZW5zaW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRcdC8vIGRyaWxsaW5nIHVwIHRvIGxldmVsMCB3b3VsZCBjbGVhciBhbGwgc2VsZWN0aW9uc1xuXHRcdFx0XHRcdFx0YUZpbHRlcnMgPSB0aGlzLmdldENoYXJ0U2VsZWN0aW9ucyhvTWRjQ2hhcnQsIHRydWUpIGFzIGFueVtdO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBhcHBseSBmaWx0ZXJzIG9mIHNlbGVjdGlvbnMgb2YgcHJldmlvdXMgZHJpbGxzdGFjayB3aGVuIGRyaWxsaW5nIHVwL2Rvd25cblx0XHRcdFx0XHRcdC8vIHRvIHRoZSBjaGFydCBhbmQgdGFibGVcblx0XHRcdFx0XHRcdGFGaWx0ZXJzID0gdGhpcy5nZXRDaGFydFNlbGVjdGlvbnMob01kY0NoYXJ0KSBhcyBhbnlbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGJJc0RyaWxsRG93biB8fCBiSXNEcmlsbFVwKSB7XG5cdFx0XHRcdFx0XHQvLyB1cGRhdGUgdGhlIGRyaWxsc3RhY2sgb24gYSBkcmlsbCB1cC8gZHJpbGwgZG93blxuXHRcdFx0XHRcdFx0YVByZXZEcmlsbFN0YWNrID0gYURpbWVuc2lvbnM7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYUZpbHRlcnMubGVuZ3RoID4gMDtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGJOb0NoYW5nZSAmJiBvU291cmNlLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdC8vIGJOb0NoYW5nZSBpcyB0cnVlIHdoZW4gY2hhcnQgaXMgc2VsZWN0ZWRcblx0XHRcdFx0XHRcdHJldHVybiBhRmlsdGVycy5sZW5ndGggPiAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoc0Vycm9yKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgcmV0dXJucyB0aGUgY2hhcnQgZmlsdGVycyBzdG9yZWQgaW4gdGhlIFVJIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01kY0NoYXJ0IFRoZSBNRENfQ2hhcnQgY29udHJvbFxuXHQgKiBAcGFyYW0gYkNsZWFyU2VsZWN0aW9ucyBDbGVhcnMgY2hhcnQgc2VsZWN0aW9ucyBpbiB0aGUgVUkgbW9kZWwgaWYgdHJ1ZVxuXHQgKiBAcmV0dXJucyBUaGUgY2hhcnQgc2VsZWN0aW9uc1xuXHQgKi9cblx0Z2V0Q2hhcnRTZWxlY3Rpb25zOiBmdW5jdGlvbiAob01kY0NoYXJ0OiBNRENDaGFydCwgYkNsZWFyU2VsZWN0aW9ucz86IGJvb2xlYW4pIHtcblx0XHQvLyBnZXQgY2hhcnQgc2VsZWN0aW9uc1xuXHRcdGlmIChiQ2xlYXJTZWxlY3Rpb25zKSB7XG5cdFx0XHR0aGlzLmdldENoYXJ0TW9kZWwob01kY0NoYXJ0LCBcIlwiLCB7fSk7XG5cdFx0fVxuXHRcdGNvbnN0IGFWaXpTZWxlY3Rpb25zID0gdGhpcy5nZXRDaGFydE1vZGVsKG9NZGNDaGFydCwgXCJmaWx0ZXJzXCIpO1xuXHRcdHJldHVybiBhVml6U2VsZWN0aW9ucyB8fCBbXTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGNoYXJ0IHNlbGVjdGlvbnMgYXMgYSBmaWx0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWRjQ2hhcnQgVGhlIE1EQ19DaGFydCBjb250cm9sXG5cdCAqIEByZXR1cm5zIEZpbHRlciBjb250YWluaW5nIGNoYXJ0IHNlbGVjdGlvbnNcblx0ICovXG5cdGdldENoYXJ0RmlsdGVyczogZnVuY3Rpb24gKG9NZGNDaGFydDogTURDQ2hhcnQpIHtcblx0XHQvLyBnZXQgY2hhcnQgc2VsZWN0aW9ucyBhcyBhIGZpbHRlclxuXHRcdGNvbnN0IGFGaWx0ZXJzID0gdGhpcy5nZXRDaGFydFNlbGVjdGlvbnMob01kY0NoYXJ0KSB8fCBbXTtcblx0XHRyZXR1cm4gbmV3IEZpbHRlcihhRmlsdGVycyk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCBzZXRzIHRoZSBjaGFydCBzZWxlY3Rpb25zIGFzIGluIHRoZSBVSSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIG9NZGNDaGFydCBUaGUgTURDX0NoYXJ0IGNvbnRyb2xcblx0ICovXG5cdHNldENoYXJ0RmlsdGVyczogZnVuY3Rpb24gKG9NZGNDaGFydDogTURDQ2hhcnQpIHtcblx0XHQvLyBzYXZpbmcgc2VsZWN0aW9ucyBpbiBlYWNoIGRyaWxsIHN0YWNrIGZvciBmdXR1cmUgdXNlXG5cdFx0Y29uc3Qgb0RyaWxsU3RhY2sgPSB0aGlzLmdldENoYXJ0TW9kZWwob01kY0NoYXJ0LCBcImRyaWxsU3RhY2tcIikgfHwgKHt9IGFzIGFueSk7XG5cdFx0Y29uc3Qgb0NoYXJ0ID0gKG9NZGNDaGFydCBhcyBhbnkpLmdldENvbnRyb2xEZWxlZ2F0ZSgpLl9nZXRDaGFydChvTWRjQ2hhcnQpO1xuXHRcdGNvbnN0IGFDaGFydEZpbHRlcnM6IGFueVtdID0gW107XG5cdFx0bGV0IGFWaXNpYmxlRGltZW5zaW9uczogYW55O1xuXG5cdFx0ZnVuY3Rpb24gYWRkQ2hhcnRGaWx0ZXJzKGFTZWxlY3RlZERhdGE6IGFueSkge1xuXHRcdFx0Zm9yIChjb25zdCBpdGVtIGluIGFTZWxlY3RlZERhdGEpIHtcblx0XHRcdFx0Y29uc3QgYURpbUZpbHRlcnMgPSBbXTtcblx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFWaXNpYmxlRGltZW5zaW9ucykge1xuXHRcdFx0XHRcdGNvbnN0IHNQYXRoID0gYVZpc2libGVEaW1lbnNpb25zW2ldO1xuXHRcdFx0XHRcdGNvbnN0IHNWYWx1ZSA9IGFTZWxlY3RlZERhdGFbaXRlbV0uZGF0YVtzUGF0aF07XG5cdFx0XHRcdFx0aWYgKHNWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRhRGltRmlsdGVycy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdFx0XHRwYXRoOiBzUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuRVEsXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUxOiBzVmFsdWVcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhRGltRmlsdGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0YUNoYXJ0RmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoYURpbUZpbHRlcnMsIHRydWUpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob0NoYXJ0KSB7XG5cdFx0XHRjb25zdCBhVml6U2VsZWN0aW9ucyA9IHRoaXMuZ2V0Vml6U2VsZWN0aW9uKG9DaGFydCk7XG5cdFx0XHRhVmlzaWJsZURpbWVuc2lvbnMgPSBvQ2hhcnQuZ2V0VmlzaWJsZURpbWVuc2lvbnMoKTtcblx0XHRcdGNvbnN0IGFEaW1lbnNpb25zID0gdGhpcy5nZXREaW1lbnNpb25zRnJvbURyaWxsU3RhY2sob0NoYXJ0KTtcblx0XHRcdGlmIChhRGltZW5zaW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuZ2V0Q2hhcnRNb2RlbChvTWRjQ2hhcnQsIFwiZHJpbGxTdGFja1wiLCB7fSk7XG5cdFx0XHRcdG9EcmlsbFN0YWNrW2FEaW1lbnNpb25zLnRvU3RyaW5nKCldID0gYVZpelNlbGVjdGlvbnM7XG5cdFx0XHRcdHRoaXMuZ2V0Q2hhcnRNb2RlbChvTWRjQ2hhcnQsIFwiZHJpbGxTdGFja1wiLCBvRHJpbGxTdGFjayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYVZpelNlbGVjdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBjcmVhdGluZyBmaWx0ZXJzIHdpdGggc2VsZWN0aW9ucyBpbiB0aGUgY3VycmVudCBkcmlsbHN0YWNrXG5cdFx0XHRcdGFkZENoYXJ0RmlsdGVycyhhVml6U2VsZWN0aW9ucyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjcmVhdGluZyBmaWx0ZXJzIHdpdGggc2VsZWN0aW9ucyBpbiB0aGUgcHJldmlvdXMgZHJpbGxzdGFjayB3aGVuIHRoZXJlIGFyZSBubyBzZWxlY3Rpb25zIGluIHRoZSBjdXJyZW50IGRyaWxsc3RhY2tcblx0XHRcdFx0Y29uc3QgYURyaWxsU3RhY2tLZXlzID0gT2JqZWN0LmtleXMob0RyaWxsU3RhY2spIHx8IFtdO1xuXHRcdFx0XHRjb25zdCBhUHJldkRyaWxsU3RhY2tEYXRhID0gb0RyaWxsU3RhY2tbYURyaWxsU3RhY2tLZXlzW2FEcmlsbFN0YWNrS2V5cy5sZW5ndGggLSAyXV0gfHwgW107XG5cdFx0XHRcdGFkZENoYXJ0RmlsdGVycyhhUHJldkRyaWxsU3RhY2tEYXRhKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ2V0Q2hhcnRNb2RlbChvTWRjQ2hhcnQsIFwiZmlsdGVyc1wiLCBhQ2hhcnRGaWx0ZXJzKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCByZXR1cm5zIHRoZSBjaGFydCBzZWxlY3Rpb25zIGFzIGEgZmlsdGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0IFRoZSBpbm5lciBjaGFydCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFRoZSBmaWx0ZXJzIGluIHRoZSBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRnZXRGaWx0ZXJCYXJGaWx0ZXJJbmZvOiBmdW5jdGlvbiAob0NoYXJ0OiBNRENDaGFydCkge1xuXHRcdHJldHVybiBGaWx0ZXJVdGlsLmdldEZpbHRlckluZm8ob0NoYXJ0LmdldEZpbHRlcigpLCB7XG5cdFx0XHR0YXJnZXRDb250cm9sOiBvQ2hhcnRcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGZpbHRlcnMgZm9yIHRoZSBjaGFydCBhbmQgZmlsdGVyIGJhci5cblx0ICpcblx0ICogQHBhcmFtIG9DaGFydCBUaGUgaW5uZXIgY2hhcnQgY29udHJvbFxuXHQgKiBAcmV0dXJucyBUaGUgbmV3IGZpbHRlciBjb250YWluaW5nIHRoZSBmaWx0ZXJzIGZvciBib3RoIHRoZSBjaGFydCBhbmQgdGhlIGZpbHRlciBiYXJcblx0ICovXG5cdGdldEFsbEZpbHRlckluZm86IGZ1bmN0aW9uIChvQ2hhcnQ6IE1EQ0NoYXJ0KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlcnMgPSB0aGlzLmdldEZpbHRlckJhckZpbHRlckluZm8ob0NoYXJ0KTtcblx0XHRjb25zdCBhQ2hhcnRGaWx0ZXJzID0gdGhpcy5nZXRDaGFydEZpbHRlcnMob0NoYXJ0KSBhcyBhbnk7XG5cdFx0Ly8gR2V0IGZpbHRlcnMgYWRkZWQgdGhyb3VnaCBwZXJzb25hbGl6YXRpb24gZGlhbG9nIGZpbHRlciBvcHRpb25cblx0XHRjb25zdCBhUDEzblByb3BlcnRpZXMgPSBVdGlscy5nZXRQMTNuRmlsdGVycyhvQ2hhcnQpO1xuXHRcdC8vIFJldHJpZXZlIHNlbGVjdGlvbiBwcmVzZW50YXRpb24gdmFyaWFudCBwYXRoIGZyb20gY3VzdG9tIGRhdGFcblx0XHRjb25zdCBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aCA9IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob0NoYXJ0LmRhdGEoXCJzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aFwiKSlcblx0XHRcdD8gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvQ2hhcnQuZGF0YShcInNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoXCIpKS5kYXRhXG5cdFx0XHQ6IFwiXCI7XG5cdFx0Ly8gQ2hlY2sgaWYgU1YgaXMgcHJlc2VudCBpbiBTUFYsIGlmIHllcyBnZXQgdGhlIFN2IHZhbHVlc1xuXHRcdGNvbnN0IGFTZWxjdGlvblZhcmlhbnQgPSBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aFxuXHRcdFx0PyBDb21tb25VdGlscy5nZXRGaWx0ZXJzSW5mb0ZvclNWKG9DaGFydCwgc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGgsIHRydWUpXG5cdFx0XHQ6IG51bGw7XG5cblx0XHRpZiAoYUNoYXJ0RmlsdGVycyAmJiBhQ2hhcnRGaWx0ZXJzLmFGaWx0ZXJzICYmIGFDaGFydEZpbHRlcnMuYUZpbHRlcnMubGVuZ3RoKSB7XG5cdFx0XHRvRmlsdGVycy5maWx0ZXJzLnB1c2goYUNoYXJ0RmlsdGVycyk7XG5cdFx0fVxuXG5cdFx0aWYgKGFQMTNuUHJvcGVydGllcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhUDEzblByb3BlcnRpZXMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXHRcdFx0XHRpZiAoZWxlbWVudC5hRmlsdGVycyAmJiBlbGVtZW50LmFGaWx0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQvLyBpZiB3ZSBmaWx0ZXIgdXNpbmcgbW9yZSB0aGFuIG9uZSBmaWVsZFxuXHRcdFx0XHRcdGVsZW1lbnQuYUZpbHRlcnMuZm9yRWFjaCgoZmlsdGVyVmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0b0ZpbHRlcnMuZmlsdGVycy5wdXNoKGZpbHRlclZhbHVlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBpZiB3ZSBmaWx0ZXIgdXNpbmcgb25seSBvbmUgZmllbGRcblx0XHRcdFx0XHRvRmlsdGVycy5maWx0ZXJzLnB1c2goZWxlbWVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChhU2VsY3Rpb25WYXJpYW50ICYmIGFTZWxjdGlvblZhcmlhbnQuZmlsdGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhU2VsY3Rpb25WYXJpYW50LmZpbHRlcnMuZm9yRWFjaCgoZmlsdGVyVmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRvRmlsdGVycy5maWx0ZXJzLnB1c2goZmlsdGVyVmFsdWUuYUZpbHRlcnNbMF0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9GaWx0ZXJzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCByZXR1cm5zIHNlbGVjdGVkIGRhdGEgaW4gdGhlIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0IFRoZSBpbm5lciBjaGFydCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFRoZSBzZWxlY3RlZCBjaGFydCBkYXRhXG5cdCAqL1xuXHRnZXRDaGFydFNlbGVjdGVkRGF0YTogZnVuY3Rpb24gKG9DaGFydDogQ2hhcnQpIHtcblx0XHRsZXQgYVNlbGVjdGVkUG9pbnRzID0gW107XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9zd2l0Y2gtZXhoYXVzdGl2ZW5lc3MtY2hlY2tcblx0XHRzd2l0Y2ggKG9DaGFydC5nZXRTZWxlY3Rpb25CZWhhdmlvcigpKSB7XG5cdFx0XHRjYXNlIFwiREFUQVBPSU5UXCI6XG5cdFx0XHRcdGFTZWxlY3RlZFBvaW50cyA9IChvQ2hhcnQuZ2V0U2VsZWN0ZWREYXRhUG9pbnRzKCkgYXMgYW55KS5kYXRhUG9pbnRzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJDQVRFR09SWVwiOlxuXHRcdFx0XHRhU2VsZWN0ZWRQb2ludHMgPSAob0NoYXJ0LmdldFNlbGVjdGVkQ2F0ZWdvcmllcygpIGFzIGFueSkuY2F0ZWdvcmllcztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU0VSSUVTXCI6XG5cdFx0XHRcdGFTZWxlY3RlZFBvaW50cyA9IChvQ2hhcnQuZ2V0U2VsZWN0ZWRTZXJpZXMoKSBhcyBhbnkpLnNlcmllcztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBhU2VsZWN0ZWRQb2ludHM7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGZpbHRlcnMsIGRyaWxsc3RhY2sgYW5kIHNlbGVjdGVkIGNvbnRleHRzIGluIHRoZSBVSSBtb2RlbC5cblx0ICogQ2FuIGFsc28gYmUgdXNlZCB0byBzZXQgZGF0YSBpbiB0aGUgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWRjQ2hhcnQgVGhlIE1EQ19DaGFydCBjb250cm9sXG5cdCAqIEBwYXJhbSBzUGF0aCBUaGUgcGF0aCBpbiB0aGUgVUkgbW9kZWwgZnJvbSB3aGljaCBjaGFydCBkYXRhIGlzIHRvIGJlIHNldC9mZXRjaGVkXG5cdCAqIEBwYXJhbSB2RGF0YSBUaGUgY2hhcnQgaW5mbyB0byBiZSBzZXRcblx0ICogQHJldHVybnMgVGhlIGNoYXJ0IGluZm8gKGZpbHRlcnMvZHJpbGxzdGFjay9zZWxlY3RlZENvbnRleHRzKVxuXHQgKi9cblx0Z2V0Q2hhcnRNb2RlbDogZnVuY3Rpb24gKG9NZGNDaGFydDogTURDQ2hhcnQsIHNQYXRoOiBzdHJpbmcsIHZEYXRhPzogb2JqZWN0IHwgYW55W10pIHtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvTWRjQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRpZiAoIW9JbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICh2RGF0YSkge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNQYXRoLCB2RGF0YSk7XG5cdFx0fVxuXHRcdHJldHVybiBvSW50ZXJuYWxNb2RlbENvbnRleHQgJiYgb0ludGVybmFsTW9kZWxDb250ZXh0LmdldE9iamVjdChzUGF0aCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZmV0Y2ggdGhlIGN1cnJlbnQgZHJpbGxzdGFjayBkaW1lbnNpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0IFRoZSBpbm5lciBjaGFydCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGRyaWxsc3RhY2sgZGltZW5zaW9uc1xuXHQgKi9cblx0Z2V0RGltZW5zaW9uc0Zyb21EcmlsbFN0YWNrOiBmdW5jdGlvbiAob0NoYXJ0OiBDaGFydCkge1xuXHRcdGNvbnN0IGFDdXJyZW50RHJpbGxTdGFjayA9IG9DaGFydC5nZXREcmlsbFN0YWNrKCkgfHwgW107XG5cdFx0Y29uc3QgYUN1cnJlbnREcmlsbFZpZXcgPSBhQ3VycmVudERyaWxsU3RhY2sucG9wKCkgfHwgKHt9IGFzIGFueSk7XG5cdFx0cmV0dXJuIGFDdXJyZW50RHJpbGxWaWV3LmRpbWVuc2lvbiB8fCBbXTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBmZXRjaCBjaGFydCBzZWxlY3Rpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0IFRoZSBpbm5lciBjaGFydCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFRoZSBjaGFydCBzZWxlY3Rpb25zXG5cdCAqL1xuXHRnZXRWaXpTZWxlY3Rpb246IGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSkge1xuXHRcdHJldHVybiAob0NoYXJ0ICYmIG9DaGFydC5fZ2V0Vml6RnJhbWUoKSAmJiBvQ2hhcnQuX2dldFZpekZyYW1lKCkudml6U2VsZWN0aW9uKCkpIHx8IFtdO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDaGFydFV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBV0EsSUFBSUEsZUFBc0IsR0FBRyxFQUFFO0VBQy9CLE1BQU1DLFVBQVUsR0FBRztJQUNsQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUND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