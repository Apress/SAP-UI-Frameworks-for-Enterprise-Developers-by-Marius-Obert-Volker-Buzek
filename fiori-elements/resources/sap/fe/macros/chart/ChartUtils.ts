import type Chart from "sap/chart/Chart";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import FilterUtil from "sap/fe/macros/filter/FilterUtils";
import type Control from "sap/ui/core/Control";
import type MDCChart from "sap/ui/mdc/Chart";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import CommonHelper from "../CommonHelper";
import Utils from "../table/Utils";

let aPrevDrillStack: any[] = [];
const ChartUtils = {
	/**
	 * Method to check if selections exist in the chart.
	 *
	 * @param oMdcChart The MDC_Chart control
	 * @param oInSource The control that has to apply chart filters
	 * @returns `true` if chart selection exists, false otherwise
	 */
	getChartSelectionsExist: function (oMdcChart: MDCChart, oInSource?: Control) {
		// consider chart selections in the current drill stack or on any further drill downs
		const oSource = oInSource || oMdcChart;
		if (oMdcChart) {
			try {
				const oChart = (oMdcChart as any).getControlDelegate()._getChart(oMdcChart) as Chart;
				if (oChart) {
					const aDimensions = this.getDimensionsFromDrillStack(oChart);
					const bIsDrillDown = aDimensions.length > aPrevDrillStack.length;
					const bIsDrillUp = aDimensions.length < aPrevDrillStack.length;
					const bNoChange = aDimensions.toString() === aPrevDrillStack.toString();
					let aFilters: any[];
					if (bIsDrillUp && aDimensions.length === 1) {
						// drilling up to level0 would clear all selections
						aFilters = this.getChartSelections(oMdcChart, true) as any[];
					} else {
						// apply filters of selections of previous drillstack when drilling up/down
						// to the chart and table
						aFilters = this.getChartSelections(oMdcChart) as any[];
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
	getChartSelections: function (oMdcChart: MDCChart, bClearSelections?: boolean) {
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
	getChartFilters: function (oMdcChart: MDCChart) {
		// get chart selections as a filter
		const aFilters = this.getChartSelections(oMdcChart) || [];
		return new Filter(aFilters);
	},
	/**
	 * Method that sets the chart selections as in the UI model.
	 *
	 * @param oMdcChart The MDC_Chart control
	 */
	setChartFilters: function (oMdcChart: MDCChart) {
		// saving selections in each drill stack for future use
		const oDrillStack = this.getChartModel(oMdcChart, "drillStack") || ({} as any);
		const oChart = (oMdcChart as any).getControlDelegate()._getChart(oMdcChart);
		const aChartFilters: any[] = [];
		let aVisibleDimensions: any;

		function addChartFilters(aSelectedData: any) {
			for (const item in aSelectedData) {
				const aDimFilters = [];
				for (const i in aVisibleDimensions) {
					const sPath = aVisibleDimensions[i];
					const sValue = aSelectedData[item].data[sPath];
					if (sValue !== undefined) {
						aDimFilters.push(
							new Filter({
								path: sPath,
								operator: FilterOperator.EQ,
								value1: sValue
							})
						);
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
	getFilterBarFilterInfo: function (oChart: MDCChart) {
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
	getAllFilterInfo: function (oChart: MDCChart) {
		const oFilters = this.getFilterBarFilterInfo(oChart);
		const aChartFilters = this.getChartFilters(oChart) as any;
		// Get filters added through personalization dialog filter option
		const aP13nProperties = Utils.getP13nFilters(oChart);
		// Retrieve selection presentation variant path from custom data
		const selectionPresentationVariantPath = CommonHelper.parseCustomData(oChart.data("selectionPresentationVariantPath"))
			? CommonHelper.parseCustomData(oChart.data("selectionPresentationVariantPath")).data
			: "";
		// Check if SV is present in SPV, if yes get the Sv values
		const aSelctionVariant = selectionPresentationVariantPath
			? CommonUtils.getFiltersInfoForSV(oChart, selectionPresentationVariantPath, true)
			: null;

		if (aChartFilters && aChartFilters.aFilters && aChartFilters.aFilters.length) {
			oFilters.filters.push(aChartFilters);
		}

		if (aP13nProperties.length > 0) {
			aP13nProperties.forEach((element) => {
				if (element.aFilters && element.aFilters.length > 0) {
					// if we filter using more than one field
					element.aFilters.forEach((filterValue: any) => {
						oFilters.filters.push(filterValue);
					});
				} else {
					// if we filter using only one field
					oFilters.filters.push(element);
				}
			});
		}

		if (aSelctionVariant && aSelctionVariant.filters.length > 0) {
			aSelctionVariant.filters.forEach((filterValue: any) => {
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
	getChartSelectedData: function (oChart: Chart) {
		let aSelectedPoints = [];
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (oChart.getSelectionBehavior()) {
			case "DATAPOINT":
				aSelectedPoints = (oChart.getSelectedDataPoints() as any).dataPoints;
				break;
			case "CATEGORY":
				aSelectedPoints = (oChart.getSelectedCategories() as any).categories;
				break;
			case "SERIES":
				aSelectedPoints = (oChart.getSelectedSeries() as any).series;
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
	getChartModel: function (oMdcChart: MDCChart, sPath: string, vData?: object | any[]) {
		const oInternalModelContext = oMdcChart.getBindingContext("internal") as InternalModelContext;
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
	getDimensionsFromDrillStack: function (oChart: Chart) {
		const aCurrentDrillStack = oChart.getDrillStack() || [];
		const aCurrentDrillView = aCurrentDrillStack.pop() || ({} as any);
		return aCurrentDrillView.dimension || [];
	},
	/**
	 * Method to fetch chart selections.
	 *
	 * @param oChart The inner chart control
	 * @returns The chart selections
	 */
	getVizSelection: function (oChart: any) {
		return (oChart && oChart._getVizFrame() && oChart._getVizFrame().vizSelection()) || [];
	}
};

export default ChartUtils;
