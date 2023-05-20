import merge from "sap/base/util/merge";
import { aggregation, defineUI5Class, event, property, xmlEventHandler } from "sap/fe/core/helpers/ClassSupport";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import type UI5Event from "sap/ui/base/Event";
import type FilterBar from "sap/ui/mdc/FilterBar";
import MacroAPI from "../MacroAPI";

/**
 * Definition of a custom filter to be used inside the FilterBar.
 *
 * The template for the FilterField has to be provided as the default aggregation
 *
 * @alias sap.fe.macros.FilterField
 * @public
 * @experimental
 */
export type FilterField = {
	/**
	 * The property name of the FilterField
	 *
	 * @public
	 */
	key: string;
	/**
	 * The text that will be displayed for this FilterField
	 *
	 * @public
	 */
	label: string;
	/**
	 * Reference to the key of another filter already displayed in the table to properly place this one
	 *
	 * @public
	 */
	anchor?: string;
	/**
	 * Defines where this filter should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 *
	 * @public
	 */
	placement?: "Before" | "After";
	/**
	 * If set, possible errors that occur during the search will be displayed in a message box.
	 *
	 * @public
	 */
	showMessages?: boolean;

	slotName?: string;
};

/**
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 * <br>
 * Usually, a SelectionFields annotation is expected.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:FilterBar id="MyFilterBar" metaPath="@com.sap.vocabularies.UI.v1.SelectionFields" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.FilterBar
 * @public
 */
@defineUI5Class("sap.fe.macros.filterBar.FilterBarAPI")
class FilterBarAPI extends MacroAPI {
	/**
	 * The identifier of the FilterBar control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@property({
		type: "string",
		expectedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
		expectedTypes: ["EntitySet", "EntityType"]
	})
	metaPath!: string;

	/**
	 * If true, the search is triggered automatically when a filter value is changed.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: false })
	liveMode?: boolean;

	/**
	 * Parameter which sets the visibility of the FilterBar building block
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	visible?: boolean;

	/**
	 * Displays possible errors during the search in a message box
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	showMessages?: boolean;

	/**
	 * Handles the visibility of the 'Clear' button on the FilterBar.
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: false })
	showClearButton?: boolean;

	/**
	 * Aggregate filter fields of the FilterBar building block
	 *
	 * @public
	 */
	@aggregation({ type: "sap.fe.macros.FilterField", multiple: true })
	filterFields?: FilterField[];

	/**
	 * This event is fired when the 'Go' button is pressed or after a condition change.
	 *
	 * @public
	 */
	@event()
	search!: Function;

	/**
	 * This event is fired when the 'Go' button is pressed or after a condition change. This is only internally used by sap.fe (Fiori elements) and
	 * exposes parameters from internal MDC-FilterBar search event
	 *
	 * @private
	 */
	@event()
	internalSearch!: Function;

	/**
	 * This event is fired after either a filter value or the visibility of a filter item has been changed. The event contains conditions that will be used as filters.
	 *
	 * @public
	 */
	@event()
	filterChanged!: Function;

	/**
	 * This event is fired when the 'Clear' button is pressed. This is only possible when the 'Clear' button is enabled.
	 *
	 * @public
	 */
	@event()
	afterClear!: Function;

	/**
	 * This event is fired after either a filter value or the visibility of a filter item has been changed. The event contains conditions that will be used as filters.
	 * This is used internally only by sap.fe (Fiori Elements). This exposes parameters from the MDC-FilterBar filterChanged event that is used by sap.fe in some cases.
	 *
	 * @private
	 */
	@event()
	internalFilterChanged!: Function;

	/**
	 * An event that is triggered when the FilterBar State changes.
	 *
	 * You can set this to store the state of the filter bar in the app state.
	 *
	 * @private
	 */
	@event()
	stateChange!: Function;

	@xmlEventHandler()
	handleSearch(oEvent: UI5Event) {
		const oFilterBar = oEvent.getSource() as FilterBar;
		const oEventParameters = oEvent.getParameters();
		if (oFilterBar) {
			const oConditions = oFilterBar.getFilterConditions();
			const eventParameters: object = this._prepareEventParameters(oFilterBar);
			(this as any).fireInternalSearch(merge({ conditions: oConditions }, oEventParameters));
			(this as any).fireSearch(eventParameters);
		}
	}

	@xmlEventHandler()
	handleFilterChanged(oEvent: UI5Event) {
		const oFilterBar = oEvent.getSource() as FilterBar;
		const oEventParameters = oEvent.getParameters();
		if (oFilterBar) {
			const oConditions = oFilterBar.getFilterConditions();
			const eventParameters: object = this._prepareEventParameters(oFilterBar);
			(this as any).fireInternalFilterChanged(merge({ conditions: oConditions }, oEventParameters));
			(this as any).fireFilterChanged(eventParameters);
		}
	}

	_prepareEventParameters(oFilterBar: FilterBar) {
		const { parameters, filters, search } = FilterUtils.getFilters(oFilterBar);

		return { parameters, filters, search };
	}

	/**
	 * Set the filter values for the given property in the filter bar.
	 * The filter values can be either a single value or an array of values.
	 * Each filter value must be represented as a primitive value.
	 *
	 * @param sConditionPath The path to the property as a condition path
	 * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
	 * @param vValues The values to be applied
	 * @returns A promise for asynchronous handling
	 * @public
	 */
	setFilterValues(
		sConditionPath: string,
		sOperator: string | undefined,
		vValues?: undefined | string | number | boolean | string[] | number[] | boolean[]
	) {
		if (arguments.length === 2) {
			vValues = sOperator;
			return FilterUtils.setFilterValues(this.content, sConditionPath, vValues);
		}
		return FilterUtils.setFilterValues(this.content, sConditionPath, sOperator, vValues);
	}

	/**
	 * Get the Active Filters Text Summary for the filter bar.
	 *
	 * @returns Active filters summary as text
	 * @public
	 */
	getActiveFiltersText() {
		const oFilterBar = this.content as FilterBar;
		return oFilterBar?.getAssignedFiltersText()?.filtersText || "";
	}

	/**
	 * Provides all the filters that are currently active
	 * along with the search expression.
	 *
	 * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
	 * @public
	 */
	getFilters() {
		return FilterUtils.getFilters(this.content as FilterBar);
	}
}

export default FilterBarAPI;
