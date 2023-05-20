import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type FilterBar from "sap/fe/core/controls/FilterBar";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { aggregation, association, defineUI5Class, event, property } from "sap/fe/core/helpers/ClassSupport";
import MessageStrip from "sap/fe/core/helpers/MessageStrip";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import MacroAPI from "sap/fe/macros/MacroAPI";
import IconTabBar from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import type CoreEvent from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import RenderManager from "sap/ui/core/RenderManager";
import ControlPersonalizationWriteAPI from "sap/ui/fl/write/api/ControlPersonalizationWriteAPI";
import JSONModel from "sap/ui/model/json/JSONModel";
import Model from "sap/ui/model/Model";

export type InnerControlType = MacroAPI &
	Partial<{
		resumeBinding: Function;
		suspendBinding: Function;
		getCounts: Function;
		refreshNotApplicableFields: Function;
		invalidateContent: Function;
		getContent: Function;
	}>;

type MessageStripProperties = {
	entityTypePath: string;
	ignoredFields: any[];
	title: string;
};

enum BindingAction {
	Suspend = "suspendBinding",
	Resume = "resumeBinding"
}

@defineUI5Class("sap.fe.templates.ListReport.controls.MultipleModeControl")
class MultipleModeControl extends Control {
	@property({ type: "boolean" })
	showCounts!: boolean;

	@property({ type: "boolean", defaultValue: false })
	freezeContent!: boolean;

	@property({ type: "boolean", defaultValue: false })
	countsOutDated!: boolean;

	@aggregation({ type: "sap.m.IconTabBar", multiple: false, isDefault: true })
	content!: IconTabBar;

	@association({ type: "sap.ui.core.Control", multiple: true })
	innerControls!: string[];

	@association({ type: "sap.fe.core.controls.FilterBar", multiple: false })
	filterControl!: string;

	@event()
	select!: Function;

	onBeforeRendering() {
		this.getTabsModel(); // Generate the model which is mandatory for some bindings

		const oFilterControl = this._getFilterControl();
		if (!oFilterControl) {
			// In case there's no filterbar, we have to update the counts in the tabs immediately
			this.setCountsOutDated(true);
		}
		const oFilterBarAPI = oFilterControl?.getParent();
		this.getAllInnerControls().forEach((oMacroAPI) => {
			if (this.showCounts) {
				oMacroAPI.attachEvent("internalDataRequested", this._refreshTabsCount.bind(this));
			}
			oMacroAPI.suspendBinding?.();
		});
		if (oFilterBarAPI) {
			oFilterBarAPI.attachEvent("internalSearch", this._onSearch.bind(this));
			oFilterBarAPI.attachEvent("internalFilterChanged", this._onFilterChanged.bind(this));
		}
	}

	onAfterRendering() {
		this.getSelectedInnerControl()?.resumeBinding?.(!this.getProperty("freezeContent"));
	}

	static render(oRm: RenderManager, oControl: MultipleModeControl) {
		oRm.renderControl(oControl.content);
	}

	/**
	 * Gets the model containing information related to the IconTabFilters.
	 *
	 * @returns {sap.ui.model.Model | undefined} The model
	 */
	getTabsModel(): Model | undefined {
		const sTabsModel = "tabsInternal";
		const oContent = this.content;
		if (!oContent) {
			return undefined;
		}
		let oModel = oContent.getModel(sTabsModel);
		if (!oModel) {
			oModel = new JSONModel({});
			oContent.setModel(oModel, sTabsModel);
		}
		return oModel;
	}

	/**
	 * Gets the inner control of the displayed tab.
	 *
	 * @returns {InnerControlType | undefined} The control
	 */
	getSelectedInnerControl(): InnerControlType | undefined {
		const oSelectedTab = this.content?.getItems().find((oItem) => (oItem as IconTabFilter).getKey() === this.content.getSelectedKey());
		return oSelectedTab
			? this.getAllInnerControls().find((oMacroAPI) => this._getTabFromInnerControl(oMacroAPI) === oSelectedTab)
			: undefined;
	}

	/**
	 * Manages the binding of all inner controls when the selected IconTabFilter is changed.
	 *
	 * @param {sap.ui.base.Event} oEvent Event fired by the IconTabBar
	 */
	static handleTabChange(oEvent: any): void {
		const oIconTabBar = oEvent.getSource();
		const oMultiControl = oIconTabBar.getParent();

		const mParameters = oEvent.getParameters();
		oMultiControl._setInnerBinding(true);
		const sPreviousSelectedKey = mParameters?.previousKey;
		const sSelectedKey = mParameters?.selectedKey;

		if (sSelectedKey && sPreviousSelectedKey !== sSelectedKey) {
			const oFilterBar = oMultiControl._getFilterControl();
			if (oFilterBar && !oMultiControl.getProperty("freezeContent")) {
				if (!oMultiControl.getSelectedInnerControl()) {
					//custom tab
					oMultiControl._refreshCustomView(oFilterBar.getFilterConditions(), "tabChanged");
				}
			}
			ControlPersonalizationWriteAPI.add({
				changes: [
					{
						changeSpecificData: {
							changeType: "selectIconTabBarFilter",
							content: {
								selectedKey: sSelectedKey,
								previousSelectedKey: sPreviousSelectedKey
							}
						},
						selectorElement: oIconTabBar
					}
				]
			});
		}

		oMultiControl._getViewController()?.getExtensionAPI()?.updateAppState();

		oMultiControl.fireEvent("select", {
			iconTabBar: oIconTabBar,
			selectedKey: sSelectedKey,
			previousKey: sPreviousSelectedKey
		});
	}

	/**
	 * Invalidates the content of all inner controls.
	 */
	invalidateContent() {
		this.setCountsOutDated(true);
		this.getAllInnerControls().forEach((oMacroAPI) => {
			oMacroAPI.invalidateContent?.();
		});
	}

	/**
	 * Sets the counts to out of date or up to date
	 * If the counts are set to "out of date" and the selected IconTabFilter doesn't contain an inner control all inner controls are requested to get the new counts.
	 *
	 * @param {boolean} bValue Freeze or not the control
	 */
	setCountsOutDated(bValue = true) {
		this.setProperty("countsOutDated", bValue);
		// if the current tab is not configured with no inner Control
		// the tab counts must be manually refreshed since no Macro API will sent event internalDataRequested
		if (bValue && !this.getSelectedInnerControl()) {
			this._refreshTabsCount();
		}
	}

	/**
	 * Freezes the content :
	 *  - content is frozen: the binding of the inner controls are suspended.
	 *  - content is unfrozen: the binding of inner control related to the selected IconTabFilter is resumed.
	 *
	 * @param {boolean} bValue Freeze or not the control
	 */
	setFreezeContent(bValue: boolean) {
		this.setProperty("freezeContent", bValue);
		this._setInnerBinding();
	}

	/**
	 * Updates the internal model with the properties that are not applicable on each IconTabFilter (containing inner control) according to the entityType of the filter control.
	 *
	 */
	_updateMultiTabNotApplicableFields() {
		const tabsModel = this.getTabsModel();
		const oFilterControl = this._getFilterControl() as Control;
		if (tabsModel && oFilterControl) {
			const results: any = {};
			this.getAllInnerControls().forEach((oMacroAPI) => {
				const oTab = this._getTabFromInnerControl(oMacroAPI);
				if (oTab) {
					const sTabId = oTab.getKey();
					const mIgnoredFields = oMacroAPI.refreshNotApplicableFields?.(oFilterControl) || [];
					results[sTabId] = {
						notApplicable: {
							fields: mIgnoredFields,
							title: this._setTabMessageStrip({
								entityTypePath: oFilterControl.data("entityType"),
								ignoredFields: mIgnoredFields,
								title: oTab.getText()
							})
						}
					};
					if (oMacroAPI && oMacroAPI.isA("sap.fe.macros.chart.ChartAPI")) {
						results[sTabId] = this.checkNonFilterableEntitySet(oMacroAPI, sTabId, results);
					}
				}
			});
			(tabsModel as any).setData(results);
		}
	}

	/**
	 * Modifies the messagestrip message based on entity set is filerable or not.
	 *
	 * @param {InnerControlType} oMacroAPI Macro chart api
	 * @param {string} sTabId Tab key ID
	 * @param {object} results Should contain fields and title
	 * @returns {object} An object of modified fields and title
	 */
	checkNonFilterableEntitySet(oMacroAPI: InnerControlType, sTabId: string, results: any) {
		const resourceModel = getResourceModel(oMacroAPI);
		const oChart = oMacroAPI?.getContent ? oMacroAPI.getContent() : undefined;
		const bEntitySetFilerable =
			oChart &&
			MetaModelConverter.getInvolvedDataModelObjects(
				oChart
					.getModel()
					.getMetaModel()
					.getContext(`${oChart.data("targetCollectionPath")}`)
			)?.targetObject?.annotations?.Capabilities?.FilterRestrictions?.Filterable;
		if (bEntitySetFilerable !== undefined && !bEntitySetFilerable) {
			if (results[sTabId].notApplicable.fields.indexOf("$search") > -1) {
				results[sTabId].notApplicable.title += " " + resourceModel.getText("C_LR_MULTIVIZ_CHART_MULTI_NON_FILTERABLE");
			} else {
				results[sTabId].notApplicable.fields = ["nonFilterable"];
				results[sTabId].notApplicable.title = resourceModel.getText("C_LR_MULTIVIZ_CHART_MULTI_NON_FILTERABLE");
			}
		}
		return results[sTabId];
	}
	/**
	 * Gets the inner controls.
	 *
	 * @param {boolean} bOnlyForVisibleTab Should display only the visible controls
	 * @returns {InnerControlType[]} An array of controls
	 */
	getAllInnerControls(bOnlyForVisibleTab = false): InnerControlType[] {
		return (
			this.innerControls.reduce((aInnerControls: InnerControlType[], sInnerControl: string) => {
				const oControl = Core.byId(sInnerControl) as InnerControlType;
				if (oControl) {
					aInnerControls.push(oControl);
				}
				return aInnerControls.filter(
					(oInnerControl) => !bOnlyForVisibleTab || this._getTabFromInnerControl(oInnerControl)?.getVisible()
				);
			}, []) || []
		);
	}

	_getFilterControl(): FilterBar | undefined {
		return Core.byId(this.filterControl) as FilterBar | undefined;
	}

	_getTabFromInnerControl(oControl: Control): IconTabFilter | undefined {
		const sSupportedClass = IconTabFilter.getMetadata().getName();
		let oTab: any = oControl;
		if (oTab && !oTab.isA(sSupportedClass) && oTab.getParent) {
			oTab = oControl.getParent();
		}
		return oTab && oTab.isA(sSupportedClass) ? (oTab as IconTabFilter) : undefined;
	}

	_getViewController() {
		const oView = CommonUtils.getTargetView(this);
		return oView && oView.getController();
	}

	_refreshCustomView(oFilterConditions: any, sRefreshCause: string) {
		(this._getViewController() as any)?.onViewNeedsRefresh?.({
			filterConditions: oFilterConditions,
			currentTabId: this.content.getSelectedKey(),
			refreshCause: sRefreshCause
		});
	}

	_refreshTabsCount(tableEvent?: CoreEvent): void {
		// If the refresh is triggered by an event (internalDataRequested)
		// we cannot use the selected key as reference since table can be refreshed by SideEffects
		// so the table could be into a different tab -> we use the source of the event to find the targeted tab
		// If not triggered by an event -> refresh at least the counts of the current MacroAPI
		// In any case if the counts are set to Outdated for the MultipleModeControl all the counts are refreshed
		const eventMacroAPI = tableEvent?.getSource() as MacroAPI;
		const targetKey = eventMacroAPI ? this._getTabFromInnerControl(eventMacroAPI)?.getKey() : this.content?.getSelectedKey();

		this.getAllInnerControls(true).forEach((oMacroAPI) => {
			const oIconTabFilter = this._getTabFromInnerControl(oMacroAPI);
			if (oMacroAPI?.getCounts && (this.countsOutDated || targetKey === oIconTabFilter?.getKey())) {
				if (oIconTabFilter && oIconTabFilter.setCount) {
					oIconTabFilter.setCount("...");
					oMacroAPI
						.getCounts()
						.then((iCount: string) => oIconTabFilter.setCount(iCount || "0"))
						.catch(function (oError: any) {
							Log.error("Error while requesting Counts for Control", oError);
						});
				}
			}
		});
		this.setCountsOutDated(false);
	}

	_setInnerBinding(bRequestIfNotInitialized = false) {
		if (this.content) {
			this.getAllInnerControls().forEach((oMacroAPI) => {
				const oIconTabFilter = this._getTabFromInnerControl(oMacroAPI);
				const bIsSelectedKey = oIconTabFilter?.getKey() === this.content.getSelectedKey();
				const sAction = bIsSelectedKey && !this.getProperty("freezeContent") ? BindingAction.Resume : BindingAction.Suspend;
				oMacroAPI[sAction]?.(sAction === BindingAction.Resume ? bRequestIfNotInitialized && bIsSelectedKey : undefined);
			});
		}
	}

	_setTabMessageStrip(properties: MessageStripProperties) {
		let sText = "";
		const aIgnoredFields = properties.ignoredFields;
		const oFilterControl = this._getFilterControl() as Control;
		if (oFilterControl && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && properties.title) {
			const aIgnoredLabels = MessageStrip.getLabels(
				aIgnoredFields,
				properties.entityTypePath,
				oFilterControl,
				getResourceModel(oFilterControl)
			);
			sText = MessageStrip.getText(aIgnoredLabels, oFilterControl, properties.title);
			return sText;
		}
	}

	_onSearch(oEvent: CoreEvent): void {
		this.setCountsOutDated(true);
		this.setFreezeContent(false);
		if (this.getSelectedInnerControl()) {
			this._updateMultiTabNotApplicableFields();
		} else {
			// custom tab
			this._refreshCustomView(oEvent.getParameter("conditions"), "search");
		}
	}

	_onFilterChanged(oEvent: CoreEvent): void {
		if (oEvent.getParameter("conditionsBased")) {
			this.setFreezeContent(true);
		}
	}
}

export default MultipleModeControl;
