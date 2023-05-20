import Chart from "sap/chart/Chart";
import ActionRuntime from "sap/fe/core/ActionRuntime";
import { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import UI5Event from "sap/ui/base/Event";
import Control from "sap/ui/mdc/Control";

type InnerChart = Control & Chart & { getParent: Function; getCustomData: Function };
type MDCChart = Control;
type ObjectWithCount = object & { count: number };
interface BooleanMap {
	[key: string]: boolean;
}

/**
 * Static class used by MDC_Chart during runtime
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const ChartRuntime = {
	/**
	 * Updates the chart after selection or deselection of data points.
	 *
	 * @function
	 * @static
	 * @name sap.fe.macros.chart.ChartRuntime.fnUpdateChart
	 * @memberof sap.fe.macros.chart.ChartRuntime
	 * @param oEvent Chart event
	 * @ui5-restricted
	 */
	fnUpdateChart: function (oEvent: UI5Event) {
		const oInnerChart = oEvent.getSource() as InnerChart;
		const oMdcChart = oInnerChart.getParent() as MDCChart;
		let sActionsMultiselectDisabled,
			oActionOperationAvailableMap = {},
			aActionsMultiselectDisabled: Object[] = [];
		// changing drill stack changes order of custom data, looping through all
		oMdcChart.getCustomData().forEach(function (oCustomData: any) {
			if (oCustomData.getKey() === "operationAvailableMap") {
				oActionOperationAvailableMap =
					DelegateUtil.getCustomData(oMdcChart, "operationAvailableMap") &&
					DelegateUtil.getCustomData(oMdcChart, "operationAvailableMap").customData;
			} else if (oCustomData.getKey() === "multiSelectDisabledActions") {
				sActionsMultiselectDisabled = oCustomData.getValue();
				aActionsMultiselectDisabled = sActionsMultiselectDisabled ? sActionsMultiselectDisabled.split(",") : [];
			}
		});
		const oInternalModelContext = oMdcChart.getBindingContext("internal") as InternalModelContext;

		const aSelectedContexts = [];
		let oModelObject: BooleanMap | undefined;
		const aSelectedDataPoints = ChartUtils.getChartSelectedData(oInnerChart);
		for (let i = 0; i < aSelectedDataPoints.length; i++) {
			aSelectedContexts.push(aSelectedDataPoints[i].context);
		}
		oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
		oInternalModelContext
			.getModel()
			.setProperty(
				`${oInternalModelContext.getPath()}/numberOfSelectedContexts`,
				(oInnerChart.getSelectedDataPoints() as ObjectWithCount).count
			);
		for (let j = 0; j < aSelectedContexts.length; j++) {
			const oSelectedContext = aSelectedContexts[j];
			const oContextData = oSelectedContext.getObject();
			for (const key in oContextData) {
				if (key.indexOf("#") === 0) {
					let sActionPath = key;
					sActionPath = sActionPath.substring(1, sActionPath.length);
					oModelObject = oInternalModelContext.getObject() as BooleanMap;
					oModelObject[sActionPath] = true;
					oInternalModelContext.setProperty("", oModelObject);
				}
			}
			oModelObject = oInternalModelContext.getObject() as BooleanMap;
		}

		ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "chart");

		if (aSelectedContexts.length > 1) {
			aActionsMultiselectDisabled.forEach(function (sAction: any) {
				oInternalModelContext.setProperty(sAction, false);
			});
		}
	}
};

export default ChartRuntime;
