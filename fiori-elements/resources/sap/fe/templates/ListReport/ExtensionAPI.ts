import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import type ListReportController from "sap/fe/templates/ListReport/ListReportController.controller";
import { LRCustomMessage, LRMessageStrip } from "sap/fe/templates/ListReport/LRMessageStrip";
import InvisibleMessage from "sap/ui/core/InvisibleMessage";
import { InvisibleMessageMode } from "sap/ui/core/library";

/**
 * Extension API for list reports in SAP Fiori elements for OData V4.
 *
 * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
 *
 * @alias sap.fe.templates.ListReport.ExtensionAPI
 * @public
 * @hideconstructor
 * @final
 * @since 1.79.0
 */
@defineUI5Class("sap.fe.templates.ListReport.ExtensionAPI")
class ListReportExtensionAPI extends ExtensionAPI {
	protected _controller!: ListReportController;

	ListReportMessageStrip!: LRMessageStrip;

	/**
	 * Refreshes the List Report.
	 * This method currently only supports triggering the search (by clicking on the GO button)
	 * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
	 * currently shown data based on the filters entered by the user.
	 * Please note: The Promise is resolved once the search is triggered and not once the data is returned.
	 *
	 * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
	 * @returns Resolved once the data is refreshed or rejected if the request failed
	 * @public
	 */
	refresh() {
		const oFilterBar = this._controller._getFilterBarControl() as any;
		if (oFilterBar) {
			return oFilterBar.waitForInitialization().then(function () {
				oFilterBar.triggerSearch();
			});
		} else {
			// TODO: if there is no filter bar, make refresh work
			return Promise.resolve();
		}
	}

	/**
	 * Gets the list entries currently selected for the displayed control.
	 *
	 * @alias sap.fe.templates.ListReport.ExtensionAPI#getSelectedContexts
	 * @returns Array containing the selected contexts
	 * @public
	 */
	getSelectedContexts() {
		const oControl = ((this._controller._isMultiMode() &&
			this._controller._getMultiModeControl()?.getSelectedInnerControl()?.content) ||
			this._controller._getTable()) as any;
		if (oControl.isA("sap.ui.mdc.Chart")) {
			const aSelectedContexts = [];
			if (oControl && oControl.get_chart()) {
				const aSelectedDataPoints = ChartUtils.getChartSelectedData(oControl.get_chart());
				for (let i = 0; i < aSelectedDataPoints.length; i++) {
					aSelectedContexts.push(aSelectedDataPoints[i].context);
				}
			}
			return aSelectedContexts;
		} else {
			return (oControl && oControl.getSelectedContexts()) || [];
		}
	}

	/**
	 * Set the filter values for the given property in the filter bar.
	 * The filter values can be either a single value or an array of values.
	 * Each filter value must be represented as a primitive value.
	 *
	 * @param sConditionPath The path to the property as a condition path
	 * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
	 * @param vValues The values to be applied
	 * @alias sap.fe.templates.ListReport.ExtensionAPI#setFilterValues
	 * @returns A promise for asynchronous handling
	 * @public
	 */
	setFilterValues(
		sConditionPath: string,
		sOperator: string | undefined,
		vValues?: undefined | string | number | boolean | string[] | number[] | boolean[]
	) {
		// The List Report has two filter bars: The filter bar in the header and the filter bar in the "Adapt Filter" dialog;
		// when the dialog is opened, the user is working with that active control: Pass it to the setFilterValues method!
		const filterBar = this._controller._getAdaptationFilterBarControl() || this._controller._getFilterBarControl();
		if (arguments.length === 2) {
			vValues = sOperator;
			return FilterUtils.setFilterValues(filterBar, sConditionPath, vValues);
		}

		return FilterUtils.setFilterValues(filterBar, sConditionPath, sOperator, vValues);
	}

	/**
	 * This method converts filter conditions to filters.
	 *
	 * @param mFilterConditions Map containing the filter conditions of the FilterBar.
	 * @alias sap.fe.templates.ListReport.ExtensionAPI#createFiltersFromFilterConditions
	 * @returns Object containing the converted FilterBar filters.
	 * @public
	 */
	createFiltersFromFilterConditions(mFilterConditions: any) {
		const oFilterBar = this._controller._getFilterBarControl();
		return FilterUtils.getFilterInfo(oFilterBar, undefined, mFilterConditions);
	}

	/**
	 * Provides all the model filters from the filter bar that are currently active
	 * along with the search expression.
	 *
	 * @alias sap.fe.templates.ListReport.ExtensionAPI#getFilters
	 * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
	 * @public
	 */
	getFilters() {
		const oFilterBar = this._controller._getFilterBarControl();
		return FilterUtils.getFilters(oFilterBar);
	}

	/**
	 * Provide an option for showing a custom message in the message strip above the list report table.
	 *
	 * @param {object} [message] Custom message along with the message type to be set on the table.
	 * @param {string} message.message Message string to be displayed.
	 * @param {sap.ui.core.MessageType} message.type Indicates the type of message.
	 * @param {string[]|string} [tabKey] The tabKey identifying the table where the custom message is displayed. If tabKey is empty, the message is displayed in all tabs . If tabKey = ['1','2'], the message is displayed in tabs 1 and 2 only
	 * @param {Function} [onClose] A function that is called when the user closes the message bar.
	 * @public
	 */
	setCustomMessage(message: LRCustomMessage | undefined, tabKey?: string[] | string | null, onClose?: Function) {
		if (!this.ListReportMessageStrip) {
			this.ListReportMessageStrip = new LRMessageStrip();
		}
		this.ListReportMessageStrip.showCustomMessage(message, this._controller, tabKey, onClose);
		if (message?.message) {
			InvisibleMessage.getInstance().announce(message.message, InvisibleMessageMode.Assertive);
		}
	}
}

export default ListReportExtensionAPI;
