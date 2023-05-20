import BaseChartDelegate from "sap/fe/macros/chart/ChartDelegate";
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
ChartDelegate.rebind = function (oMDCChart: any, oBindingInfo: any) {
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

export default ChartDelegate;
