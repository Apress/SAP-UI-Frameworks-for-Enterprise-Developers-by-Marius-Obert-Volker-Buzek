import merge from "sap/base/util/merge";
import { aggregation, defineUI5Class, event, property, xmlEventHandler } from "sap/fe/core/helpers/ClassSupport";
import ChartRuntime from "sap/fe/macros/chart/ChartRuntime";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import MacroAPI from "sap/fe/macros/MacroAPI";
import UI5Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Context from "sap/ui/model/odata/v4/Context";

/**
 * Definition of a custom action to be used inside the chart toolbar
 *
 * @alias sap.fe.macros.chart.Action
 * @public
 */
export type Action = {
	/**
	 * Unique identifier of the action
	 *
	 * @public
	 */
	key: string;
	/**
	 * The text that will be displayed for this action
	 *
	 * @public
	 */
	text: string;
	/**
	 * Reference to the key of another action already displayed in the toolbar to properly place this one
	 *
	 * @public
	 */
	anchor?: string;
	/**
	 * Defines where this action should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 *
	 * @public
	 */
	placement?: "Before" | "After";

	/**
	 * Defines if the action requires a selection.
	 *
	 * @public
	 */
	requiresSelection?: boolean;

	/**
	 * Event handler to be called when the user chooses the action
	 *
	 * @public
	 */
	press: string;

	/**
	 * Enables or disables the action
	 *
	 * @public
	 */
	enabled?: boolean;
};

/**
 * Definition of a custom action group to be used inside the chart toolbar
 *
 * @alias sap.fe.macros.chart.ActionGroup
 * @public
 */
export type ActionGroup = {
	/**
	 * Unique identifier of the action
	 *
	 * @public
	 */
	key: string;

	/**
	 * Defines nested actions
	 *
	 * @public
	 */
	actions: Action[];

	/**
	 * The text that will be displayed for this action group
	 *
	 * @public
	 */
	text: string;

	/**
	 * Defines where this action group should be placed relative to the defined anchor
	 *
	 * Allowed values are `Before` and `After`
	 *
	 * @public
	 */
	placement?: "Before" | "After";

	/**
	 * Reference to the key of another action or action group already displayed in the toolbar to properly place this one
	 *
	 * @public
	 */
	anchor?: string;
};

/**
 * Building block used to create a chart based on the metadata provided by OData V4.
 * <br>
 * Usually, a contextPath and metaPath is expected.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Chart id="Mychart" contextPath="/RootEntity" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.Chart
 * @public
 */
@defineUI5Class("sap.fe.macros.chart.ChartAPI")
class ChartAPI extends MacroAPI {
	/**
	 *
	 * ID of the chart
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Metadata path to the presentation context (UI.Chart with or without a qualifier)
	 *
	 * @public
	 */
	@property({
		type: "string",
		required: true,
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
		expectedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"]
	})
	metaPath!: string;

	/**
	 * Metadata path to the entitySet or navigationProperty
	 *
	 * @public
	 */
	@property({
		type: "string",
		required: true,
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
		expectedAnnotations: []
	})
	contextPath!: string;

	/**
	 * Specifies the header text that is shown in the chart
	 *
	 * @public
	 */
	@property({ type: "string" })
	header!: string;

	/**
	 * Controls if the header text should be shown or not
	 *
	 * @public
	 */
	@property({ type: "boolean", defaultValue: true })
	headerVisible!: boolean;

	/**
	 * Specifies the selection mode
	 *
	 * @public
	 */
	@property({ type: "string", defaultValue: "MULTIPLE" })
	selectionMode!: string;

	/**
	 * Id of the FilterBar building block associated with the chart.
	 *
	 * @public
	 */
	@property({ type: "string" })
	filterBar!: string;

	/**
	 * This is the parameter that specifies variant management for chart
	 *
	 * @public
	 */
	@property({ type: "string" })
	variantManagement!: string;

	/**
	 * Parameter which sets the personalization of the MDC_Chart
	 *
	 * @public
	 */
	@property({ type: "boolean | string" })
	personalization!: boolean | string;

	/**
	 * Aggregate actions of the chart.
	 *
	 * @public
	 */
	@aggregation({ type: "sap.fe.macros.chart.Action" })
	actions!: Action[];

	/**
	 * Gets contexts from the chart that have been selected by the user.
	 *
	 * @returns Contexts of the rows selected by the user
	 * @public
	 */
	getSelectedContexts(): Context[] {
		return this.content?.getBindingContext("internal")?.getProperty("selectedContexts") || [];
	}

	/**
	 * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and the Boolean flag that indicates whether data is selected or deselected.
	 *
	 * @public
	 */
	@event()
	selectionChange!: Function;

	/**
	 * An event triggered when the chart state changes.
	 *
	 * You can set this in order to store the chart state in the iAppstate.
	 *
	 * @private
	 */
	@event()
	stateChange!: Function;

	/**
	 * An event triggered when the chart requests data.
	 *
	 * @private
	 */
	@event()
	internalDataRequested!: Function;

	onAfterRendering() {
		const view = this.getController().getView();
		const internalModelContext: any = view.getBindingContext("internal");
		const chart = (this as any).getContent();
		const showMessageStrip: any = {};
		const sChartEntityPath = chart.data("entitySet"),
			sCacheKey = `${sChartEntityPath}Chart`,
			oBindingContext = view.getBindingContext();
		showMessageStrip[sCacheKey] =
			chart.data("draftSupported") === "true" && !!oBindingContext && !oBindingContext.getObject("IsActiveEntity");
		internalModelContext.setProperty("controls/showMessageStrip", showMessageStrip);
	}

	refreshNotApplicableFields(oFilterControl: Control): any[] {
		const oChart = (this as any).getContent();
		return FilterUtils.getNotApplicableFilters(oFilterControl, oChart);
	}

	@xmlEventHandler()
	handleSelectionChange(oEvent: UI5Event) {
		const aData = oEvent.getParameter("data");
		const bSelected = oEvent.getParameter("name") === "selectData";
		ChartRuntime.fnUpdateChart(oEvent);
		(this as any).fireSelectionChange(merge({}, { data: aData, selected: bSelected }));
	}

	@xmlEventHandler()
	onInternalDataRequested() {
		(this as any).fireEvent("internalDataRequested");
	}
}

export default ChartAPI;
