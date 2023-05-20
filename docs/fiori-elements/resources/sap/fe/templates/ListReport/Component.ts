import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import ListComponent from "sap/fe/templates/ListComponent";
@defineUI5Class("sap.fe.templates.ListReport.Component", {
	library: "sap.fe.templates",
	manifest: "json"
})
class ListReportComponent extends ListComponent {
	/**
	 * Define different Page views to display
	 */
	@property({ type: "object" })
	views: any;

	/**
	 *  Flag to determine whether the iconTabBar is in sticky mode
	 */
	@property({
		type: "boolean",
		defaultValue: true
	})
	stickyMultiTabHeader!: boolean;

	/**
	 * KPIs to display
	 */
	@property({
		type: "object"
	})
	keyPerformanceIndicators: any;

	/**
	 * Flag to determine whether the template should hide the filter bar
	 */
	@property({
		type: "boolean",
		defaultValue: false
	})
	hideFilterBar!: boolean;

	@property({
		type: "boolean",
		defaultValue: false
	})
	useHiddenFilterBar!: boolean;
}

export default ListReportComponent;
