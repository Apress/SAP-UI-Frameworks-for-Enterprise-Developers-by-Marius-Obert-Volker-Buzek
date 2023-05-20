import deepClone from "sap/base/util/deepClone";
import CommonUtils from "sap/fe/core/CommonUtils";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import TableDelegate from "sap/fe/macros/table/delegates/TableDelegate";
import TableUtils from "sap/fe/macros/table/Utils";
import type { BasePropertyInfo } from "sap/ui/base/ManagedObject";
import type Table from "sap/ui/mdc/Table";
import Filter from "sap/ui/model/Filter";

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
	_internalUpdateBindingInfo: function (table: Table, bindingInfo: BasePropertyInfo) {
		let filterInfo;
		let chartFilterInfo: any = {},
			tableFilterInfo: any = {};
		let chartFilters;

		// We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
		// be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
		Object.assign(bindingInfo, deepClone(DelegateUtil.getCustomData(table, "rowsBindingInfo")));
		if (table.getRowBinding()) {
			bindingInfo.suspended = false;
		}
		const view = CommonUtils.getTargetView(table);
		const mdcChart = (view.getController() as any).getChartControl?.();
		const chartSelectionsExist = ChartUtils.getChartSelectionsExist(mdcChart, table);
		tableFilterInfo = TableUtils.getAllFilterInfo(table);
		const tableFilters = tableFilterInfo && tableFilterInfo.filters;
		filterInfo = tableFilterInfo;
		if (chartSelectionsExist) {
			chartFilterInfo = ChartUtils.getAllFilterInfo(mdcChart);
			chartFilters =
				chartFilterInfo && chartFilterInfo.filters ? CommonUtils.getChartPropertiesWithoutPrefixes(chartFilterInfo.filters) : null;
			filterInfo = chartFilterInfo;
		}
		const finalFilters = (tableFilters && chartFilters ? tableFilters.concat(chartFilters) : chartFilters || tableFilters) || [];
		const oFilter =
			finalFilters.length > 0 &&
			new Filter({
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
	rebind: function (table: Table, bindingInfo: any) {
		const internalModelContext = table.getBindingContext("pageInternal");
		const templateContentView = internalModelContext?.getProperty(`${internalModelContext.getPath()}/alpContentView`);
		if (templateContentView !== "Chart") {
			TableDelegate.rebind(table, bindingInfo);
		}
	}
});

export default ALPTableDelegate;
