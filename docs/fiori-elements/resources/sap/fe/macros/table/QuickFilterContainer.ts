import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import { aggregation, defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import PageController from "sap/fe/core/PageController";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import TableUtils from "sap/fe/macros/table/Utils";
import SegmentedButton from "sap/m/SegmentedButton";
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";
import Select from "sap/m/Select";
import type UI5Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import Item from "sap/ui/core/Item";
import type RenderManager from "sap/ui/core/RenderManager";
import type FilterBar from "sap/ui/mdc/FilterBar";
import type Table from "sap/ui/mdc/Table";
import JSONModel from "sap/ui/model/json/JSONModel";

const PROPERTY_QUICKFILTER_KEY = "quickFilterKey";
const FILTER_MODEL = "filters";
/**
 *  Container Control for Table QuickFilters
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
@defineUI5Class("sap.fe.macros.table.QuickFilterContainer", {
	interfaces: ["sap.m.IOverflowToolbarContent"]
})
class QuickFilterContainer extends Control {
	@property({ type: "boolean" }) showCounts!: boolean;

	@property({ type: "string" })
	entitySet!: string;

	@property({ type: "string" })
	parentEntityType!: string;

	@property({ type: "string", defaultValue: "$auto" })
	batchGroupId!: string;

	@aggregation({
		type: "sap.ui.core.Control",
		multiple: false,
		isDefault: true
	})
	selector!: Select | SegmentedButton;

	private _oTable?: Table;

	private _attachedToView: boolean = false;

	static render(oRm: RenderManager, oControl: QuickFilterContainer) {
		const macroBundle = Core.getLibraryResourceBundle("sap.fe.macros");
		oRm.renderControl(oControl.selector);
		oRm.attr("aria-label", macroBundle.getText("M_TABLE_QUICKFILTER_ARIA"));
	}

	init() {
		super.init();
		this._attachedToView = false;
		this.attachEvent("modelContextChange", this._initControl);
		const oDelegateOnBeforeRendering = {
			onBeforeRendering: () => {
				// Need to wait for Control rendering to get parent view (.i.e into OP the highest parent is the Object Section)
				this._createControlSideEffects();
				this._attachedToView = true;
				this.removeEventDelegate(oDelegateOnBeforeRendering);
			}
		};
		this.addEventDelegate(oDelegateOnBeforeRendering, this);
	}

	_initControl(oEvent: any) {
		// Need to wait for the OData Model to be propagated (models are propagated one by one when we come from FLP)
		if (this.getModel()) {
			this.detachEvent(oEvent.getId(), this._initControl);
			this._manageTable();
			this._createContent();
		}
	}

	_manageTable() {
		let oControl = this.getParent();
		const oModel = this._getFilterModel(),
			aFilters = oModel.getObject("/paths"),
			sDefaultFilter = Array.isArray(aFilters) && aFilters.length > 0 ? aFilters[0].annotationPath : undefined;

		while (oControl && !oControl.isA<Table>("sap.ui.mdc.Table")) {
			oControl = oControl.getParent();
		}
		this._oTable = oControl!;

		const FilterControl = Core.byId(this._oTable.getFilter());
		if (FilterControl && FilterControl.isA<FilterBar>("sap.ui.mdc.FilterBar")) {
			FilterControl.attachFiltersChanged(this._onFiltersChanged.bind(this));
		}
		this._oTable?.getParent()?.attachEvent("internalDataRequested", this._onTableDataRequested.bind(this));
		DelegateUtil.setCustomData(oControl, PROPERTY_QUICKFILTER_KEY, sDefaultFilter);
	}

	_onFiltersChanged(event: UI5Event) {
		if (event.getParameter("conditionsBased")) {
			this.selector.setProperty("enabled", false);
		}
	}

	_onTableDataRequested() {
		this.selector.setProperty("enabled", true);
		if (this.showCounts) {
			this._updateCounts();
		}
	}

	setSelectorKey(sKey: any) {
		const oSelector = this.selector;
		if (oSelector && oSelector.getSelectedKey() !== sKey) {
			oSelector.setSelectedKey(sKey);
			DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, sKey);

			// Rebind the table to reflect the change in quick filter key.
			// We don't rebind the table if the filterbar for the table is suspended
			// as rebind will be done when the filterbar is resumed
			const sFilterBarID = this._oTable!.getFilter && this._oTable!.getFilter();
			const oFilterBar = sFilterBarID && (Core.byId(sFilterBarID) as FilterBar);
			const bSkipRebind = oFilterBar && oFilterBar.getSuspendSelection && oFilterBar.getSuspendSelection();

			if (!bSkipRebind) {
				(this._oTable as any).rebind();
			}
		}
	}

	getSelectorKey() {
		const oSelector = this.selector;
		return oSelector ? oSelector.getSelectedKey() : null;
	}

	getDomRef(sSuffix?: string) {
		const oSelector = this.selector;
		return oSelector ? oSelector.getDomRef(sSuffix) : (null as any);
	}

	_getFilterModel() {
		let oModel = this.getModel(FILTER_MODEL);
		if (!oModel) {
			const mFilters = DelegateUtil.getCustomData(this, FILTER_MODEL);
			oModel = new JSONModel(mFilters);
			this.setModel(oModel, FILTER_MODEL);
		}
		return oModel;
	}

	/**
	 * Create QuickFilter Selector (Select or SegmentedButton).
	 */
	_createContent() {
		const oModel = this._getFilterModel(),
			aFilters = oModel.getObject("/paths"),
			bIsSelect = aFilters.length > 3,
			mSelectorOptions: any = {
				id: generate([this._oTable!.getId(), "QuickFilter"]),
				enabled: oModel.getObject("/enabled"),
				items: {
					path: `${FILTER_MODEL}>/paths`,
					factory: (sId: any, oBindingContext: any) => {
						const mItemOptions = {
							key: oBindingContext.getObject().annotationPath,
							text: this._getSelectorItemText(oBindingContext)
						};
						return bIsSelect ? new Item(mItemOptions) : new SegmentedButtonItem(mItemOptions);
					}
				}
			};
		if (bIsSelect) {
			mSelectorOptions.autoAdjustWidth = true;
		}
		mSelectorOptions[bIsSelect ? "change" : "selectionChange"] = this._onSelectionChange.bind(this);
		this.selector = bIsSelect ? new Select(mSelectorOptions) : new SegmentedButton(mSelectorOptions);
	}

	/**
	 * Returns properties for the interface IOverflowToolbarContent.
	 *
	 * @returns {object} Returns the configuration of IOverflowToolbarContent
	 */
	getOverflowToolbarConfig() {
		return {
			canOverflow: true
		};
	}

	/**
	 * Creates SideEffects control that must be executed when table cells that are related to configured filter(s) change.
	 *
	 */

	_createControlSideEffects() {
		const oSvControl = this.selector,
			oSvItems = oSvControl.getItems(),
			sTableNavigationPath = DelegateUtil.getCustomData(this._oTable, "navigationPath");
		/**
		 * Cannot execute SideEffects with targetEntity = current Table collection
		 */

		if (sTableNavigationPath) {
			const aSourceProperties: any[] = [];
			for (const k in oSvItems) {
				const sItemKey = oSvItems[k].getKey(),
					oFilterInfos = CommonUtils.getFiltersInfoForSV(this._oTable!, sItemKey);
				oFilterInfos.properties.forEach(function (sProperty: any) {
					const sPropertyPath = `${sTableNavigationPath}/${sProperty}`;
					if (!aSourceProperties.includes(sPropertyPath)) {
						aSourceProperties.push(sPropertyPath);
					}
				});
			}
			this._getSideEffectController()?.addControlSideEffects(this.parentEntityType, {
				sourceProperties: aSourceProperties,
				targetEntities: [
					{
						$NavigationPropertyPath: sTableNavigationPath
					}
				],
				sourceControlId: this.getId()
			});
		}
	}

	_getSelectorItemText(oItemContext: any) {
		const annotationPath = oItemContext.getObject().annotationPath,
			itemPath = oItemContext.getPath(),
			oMetaModel = this.getModel().getMetaModel()!,
			oQuickFilter = oMetaModel.getObject(`${this.entitySet}/${annotationPath}`);
		return oQuickFilter.Text + (this.showCounts ? ` ({${FILTER_MODEL}>${itemPath}/count})` : "");
	}

	_getSideEffectController() {
		const oController = this._getViewController();
		return oController ? oController._sideEffects : undefined;
	}

	_getViewController() {
		const oView = CommonUtils.getTargetView(this);
		return oView && (oView.getController() as PageController);
	}

	/**
	 * Manage List Binding request related to Counts on QuickFilter control and update text
	 * in line with batch result.
	 *
	 */
	_updateCounts() {
		const oTable = this._oTable,
			oController = this._getViewController() as any,
			oSvControl = this.selector,
			oSvItems = oSvControl.getItems(),
			oModel: any = this._getFilterModel(),
			aBindingPromises = [],
			aInitialItemTexts: any[] = [];
		let aAdditionalFilters: any[] = [];
		let aChartFilters: { sPath: string }[] = [];
		const sCurrentFilterKey = DelegateUtil.getCustomData(oTable, PROPERTY_QUICKFILTER_KEY);

		// Add filters related to the chart for ALP
		if (oController && oController.getChartControl) {
			const oChart = oController.getChartControl();
			if (oChart) {
				const oChartFilterInfo = ChartUtils.getAllFilterInfo(oChart);
				if (oChartFilterInfo && oChartFilterInfo.filters.length) {
					aChartFilters = CommonUtils.getChartPropertiesWithoutPrefixes(oChartFilterInfo.filters);
				}
			}
			aAdditionalFilters = ChartUtils.getChartSelectionsExist(oChart, oTable)
				? aAdditionalFilters.concat(TableUtils.getHiddenFilters(oTable!)).concat(aChartFilters)
				: aAdditionalFilters.concat(TableUtils.getHiddenFilters(oTable!));
		}

		for (const k in oSvItems) {
			const sItemKey = oSvItems[k].getKey(),
				oFilterInfos = CommonUtils.getFiltersInfoForSV(oTable!, sItemKey);
			aInitialItemTexts.push(oFilterInfos.text);
			oModel.setProperty(`/paths/${k}/count`, "...");
			aBindingPromises.push(
				TableUtils.getListBindingForCount(oTable!, oTable!.getBindingContext(), {
					batchGroupId: sItemKey === sCurrentFilterKey ? this.batchGroupId : "$auto",
					additionalFilters: aAdditionalFilters.concat(oFilterInfos.filters)
				})
			);
		}
		Promise.all(aBindingPromises)
			.then(function (aCounts: any[]) {
				for (const k in aCounts) {
					oModel.setProperty(`/paths/${k}/count`, TableUtils.getCountFormatted(aCounts[k]));
				}
			})
			.catch(function (oError: any) {
				Log.error("Error while retrieving the binding promises", oError);
			});
	}

	_onSelectionChange(oEvent: any) {
		const oControl = oEvent.getSource();
		DelegateUtil.setCustomData(this._oTable, PROPERTY_QUICKFILTER_KEY, oControl.getSelectedKey());
		(this._oTable as any).rebind();
		const oController = this._getViewController();
		if (oController && oController.getExtensionAPI && oController.getExtensionAPI().updateAppState) {
			oController.getExtensionAPI().updateAppState();
		}
	}

	destroy(bSuppressInvalidate?: boolean) {
		if (this._attachedToView) {
			const oSideEffects = this._getSideEffectController();
			if (oSideEffects) {
				// if "destroy" signal comes when view is destroyed there is not anymore reference to Controller Extension
				oSideEffects.removeControlSideEffects(this);
			}
		}
		delete this._oTable;
		super.destroy(bSuppressInvalidate);
	}
}

export default QuickFilterContainer;
