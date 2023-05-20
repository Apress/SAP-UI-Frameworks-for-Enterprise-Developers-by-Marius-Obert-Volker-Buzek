import CommonUtils from "sap/fe/core/CommonUtils";
import TableDelegate from "sap/fe/macros/table/delegates/TableDelegate";
import Filter from "sap/ui/model/odata/Filter";

/**
 * Helper class for sap.ui.mdc.Table.
 * <h3><b>Note:</b></h3>
 * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.69.0
 * @alias sap.fe.macros.TableDelegate
 */
const TreeTableDelegate = Object.assign({}, TableDelegate, {
	_internalUpdateBindingInfo: function (table: any, bindingInfo: any) {
		TableDelegate._internalUpdateBindingInfo.apply(this, [table, bindingInfo]);

		const payload = table.getPayload();
		bindingInfo.parameters.$$aggregation = {
			...bindingInfo.parameters.$$aggregation,
			...{ hierarchyQualifier: payload?.hierarchyQualifier },
			// Setting the expandTo parameter to a high value forces the treeTable to expand all nodes when the search is applied
			...{ expandTo: bindingInfo.parameters.$$aggregation?.search ? 100 : payload?.initialExpansionLevel }
		};
	},
	updateBindingInfoWithSearchQuery: function (bindingInfo: any, filterInfo: any, filter: Filter) {
		bindingInfo.filters = filter;
		if (filterInfo.search) {
			bindingInfo.parameters.$$aggregation = {
				...bindingInfo.parameters.$$aggregation,
				...{
					search: CommonUtils.normalizeSearchTerm(filterInfo.search)
				}
			};
		} else {
			delete bindingInfo.parameters?.$$aggregation?.search;
		}
	}
});

export default TreeTableDelegate;
