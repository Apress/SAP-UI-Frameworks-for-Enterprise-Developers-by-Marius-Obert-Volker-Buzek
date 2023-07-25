import { aggregation, defineUI5Class, event, implementInterface } from "sap/fe/core/helpers/ClassSupport";
import SearchField from "sap/m/SearchField";
import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { IFilter } from "sap/ui/mdc/library";
@defineUI5Class("sap.fe.macros.table.BasicSearch")
class BasicSearch extends Control implements IFilter {
	@implementInterface("sap.ui.mdc.IFilter")
	__implements__sap_ui_mdc_IFilter: boolean = true;

	__implements__sap_ui_mdc_IFilterSource: boolean = true;

	/**
	 * The 'filterChanged' can be optionally implemented to display an overlay
	 * when the filter value of the IFilter changes
	 */
	@event(/*{ conditionsBased: {
		 	type: "boolean"
		 }}*/)
	filterChanged!: Function;

	/**
	 * The 'search' event is a mandatory IFilter event to trigger a search query
	 * on the consuming control
	 */
	@event(/*{
				conditions: {
					type: "object"
				}
			}*/)
	search!: Function;

	@aggregation({
		type: "sap.ui.core.Control",
		multiple: false
	})
	filter!: SearchField;

	init() {
		this.setAggregation(
			"filter",
			new SearchField({
				placeholder: "{sap.fe.i18n>M_FILTERBAR_SEARCH}",
				search: () => {
					this.fireEvent("search");
				}
			})
		);
	}

	getConditions() {
		return undefined as any;
	}

	getSearch() {
		return this.filter.getValue();
	}

	validate() {
		return Promise.resolve();
	}

	static render(oRm: RenderManager, oControl: BasicSearch) {
		oRm.openStart("div", oControl);
		oRm.openEnd();
		oRm.renderControl(oControl.filter);
		oRm.close("div");
	}
}

export default BasicSearch;
