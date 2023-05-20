import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import type DynamicPage from "sap/f/DynamicPage";
import ActionRuntime from "sap/fe/core/ActionRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import IntentBasedNavigation from "sap/fe/core/controllerextensions/IntentBasedNavigation";
import InternalIntentBasedNavigation from "sap/fe/core/controllerextensions/InternalIntentBasedNavigation";
import InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import KPIManagement from "sap/fe/core/controllerextensions/KPIManagement";
import MassEdit from "sap/fe/core/controllerextensions/MassEdit";
import Placeholder from "sap/fe/core/controllerextensions/Placeholder";
import Share from "sap/fe/core/controllerextensions/Share";
import SideEffects from "sap/fe/core/controllerextensions/SideEffects";
import ViewState from "sap/fe/core/controllerextensions/ViewState";
import type FilterBar from "sap/fe/core/controls/FilterBar";
import {
	defineUI5Class,
	extensible,
	finalExtension,
	privateExtension,
	publicExtension,
	usingExtension
} from "sap/fe/core/helpers/ClassSupport";
import DeleteHelper from "sap/fe/core/helpers/DeleteHelper";
import EditState from "sap/fe/core/helpers/EditState";
import MessageStrip from "sap/fe/core/helpers/MessageStrip";
import { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import * as StableIdHelper from "sap/fe/core/helpers/StableIdHelper";
import CoreLibrary from "sap/fe/core/library";
import PageController from "sap/fe/core/PageController";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import CommonHelper from "sap/fe/macros/CommonHelper";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import MultipleModeControl from "sap/fe/templates/ListReport/controls/MultipleModeControl";
import ExtensionAPI from "sap/fe/templates/ListReport/ExtensionAPI";
import TableScroller from "sap/fe/templates/TableScroller";
import type SegmentedButton from "sap/m/SegmentedButton";
import type Text from "sap/m/Text";
import { bindingParser } from "sap/ui/base/ManagedObject";
import type Control from "sap/ui/core/Control";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import { system } from "sap/ui/Device";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type Table from "sap/ui/mdc/Table";
import type JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import hasher from "sap/ui/thirdparty/hasher";
import * as ListReportTemplating from "./ListReportTemplating";
import IntentBasedNavigationOverride from "./overrides/IntentBasedNavigation";
import ShareOverrides from "./overrides/Share";
import ViewStateOverrides from "./overrides/ViewState";

const TemplateContentView = CoreLibrary.TemplateContentView,
	InitialLoadMode = CoreLibrary.InitialLoadMode;

/**
 * Controller class for the list report page, used inside an SAP Fiori elements application.
 *
 * @hideconstructor
 * @public
 */
@defineUI5Class("sap.fe.templates.ListReport.ListReportController")
class ListReportController extends PageController {
	@usingExtension(
		InternalRouting.override({
			onAfterBinding: function (this: InternalRouting) {
				(this.getView().getController() as ListReportController)._onAfterBinding();
			}
		})
	)
	_routing!: InternalRouting;

	@usingExtension(
		InternalIntentBasedNavigation.override({
			getEntitySet: function (this: InternalIntentBasedNavigation) {
				return (this.base as ListReportController).getCurrentEntitySet();
			}
		})
	)
	_intentBasedNavigation!: InternalIntentBasedNavigation;

	@usingExtension(SideEffects)
	sideEffects!: SideEffects;

	@usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride))
	intentBasedNavigation!: IntentBasedNavigation;

	@usingExtension(Share.override(ShareOverrides))
	share!: Share;

	@usingExtension(ViewState.override(ViewStateOverrides))
	viewState!: ViewState;

	@usingExtension(KPIManagement)
	kpiManagement!: KPIManagement;

	@usingExtension(Placeholder)
	placeholder!: Placeholder;

	@usingExtension(MassEdit)
	massEdit!: MassEdit;

	protected extensionAPI?: ExtensionAPI;

	private filterBarConditions?: any;

	private sUpdateTimer?: any;

	private hasPendingChartChanges?: boolean;

	private hasPendingTableChanges?: boolean;

	/**
	 * Get the extension API for the current page.
	 *
	 * @public
	 * @returns The extension API.
	 */
	@publicExtension()
	@finalExtension()
	getExtensionAPI(): ExtensionAPI {
		if (!this.extensionAPI) {
			this.extensionAPI = new ExtensionAPI(this);
		}
		return this.extensionAPI;
	}

	onInit() {
		PageController.prototype.onInit.apply(this);
		const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;

		oInternalModelContext.setProperty("hasPendingFilters", true);
		oInternalModelContext.setProperty("hideDraftInfo", false);
		oInternalModelContext.setProperty("uom", {});
		oInternalModelContext.setProperty("scalefactor", {});
		oInternalModelContext.setProperty("scalefactorNumber", {});
		oInternalModelContext.setProperty("currency", {});

		if (this._hasMultiVisualizations()) {
			let alpContentView = this._getDefaultPath();
			if (!system.desktop && alpContentView === TemplateContentView.Hybrid) {
				alpContentView = TemplateContentView.Chart;
			}
			oInternalModelContext.setProperty("alpContentView", alpContentView);
		}

		// Store conditions from filter bar
		// this is later used before navigation to get conditions applied on the filter bar
		this.filterBarConditions = {};

		// As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
		// happen after the routeMatch event has been processed (otherwise the router gets broken)
		this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();

		// Configure the initial load settings
		this._setInitLoad();
	}

	onExit() {
		delete this.filterBarConditions;
		if (this.extensionAPI) {
			this.extensionAPI.destroy();
		}
		delete this.extensionAPI;
	}

	_onAfterBinding() {
		const aTables = this._getControls("table");
		if (EditState.isEditStateDirty()) {
			this._getMultiModeControl()?.invalidateContent();
			const oTableBinding = this._getTable()?.getRowBinding();
			if (oTableBinding) {
				if (CommonUtils.getAppComponent(this.getView())._isFclEnabled()) {
					// there is an issue if we use a timeout with a kept alive context used on another page
					oTableBinding.refresh();
				} else {
					if (!this.sUpdateTimer) {
						this.sUpdateTimer = setTimeout(() => {
							oTableBinding.refresh();
							delete this.sUpdateTimer;
						}, 0);
					}

					// Update action enablement and visibility upon table data update.
					const fnUpdateTableActions = () => {
						this._updateTableActions(aTables);
						oTableBinding.detachDataReceived(fnUpdateTableActions);
					};
					oTableBinding.attachDataReceived(fnUpdateTableActions);
				}
			}
			EditState.setEditStateProcessed();
		}

		if (!this.sUpdateTimer) {
			this._updateTableActions(aTables);
		}

		const internalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
		if (!internalModelContext.getProperty("initialVariantApplied")) {
			const viewId = this.getView().getId();
			this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()));
			internalModelContext.setProperty("initialVariantApplied", true);
		}
	}

	onBeforeRendering() {
		PageController.prototype.onBeforeRendering.apply(this);
	}

	formatters = {
		setALPControlMessageStrip(this: ListReportController, aIgnoredFields: any[], bIsChart: any, oApplySupported?: any) {
			let sText = "";
			bIsChart = bIsChart === "true" || bIsChart === true;
			const oFilterBar = this._getFilterBarControl();
			if (oFilterBar && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && bIsChart) {
				const aIgnoredLabels = MessageStrip.getLabels(
					aIgnoredFields,
					oFilterBar.data("entityType"),
					oFilterBar,
					getResourceModel(oFilterBar)
				);
				const bIsSearchIgnored = !oApplySupported.enableSearch;
				sText = bIsChart
					? MessageStrip.getALPText(aIgnoredLabels, oFilterBar, bIsSearchIgnored)
					: MessageStrip.getText(aIgnoredLabels, oFilterBar, "");
				return sText;
			}
		}
	};

	@privateExtension()
	@extensible(OverrideExecution.After)
	onPageReady(mParameters: any) {
		if (mParameters.forceFocus) {
			this._setInitialFocus();
		}
		// Remove the handler on back navigation that displays Draft confirmation
		this.getAppComponent().getShellServices().setBackNavigation(undefined);
	}

	/**
	 * Method called when the content of a custom view used in a list report needs to be refreshed.
	 * This happens either when there is a change on the FilterBar and the search is triggered,
	 * or when a tab with custom content is selected.
	 * This method can be overwritten by the controller extension in case of customization.
	 *
	 * @param mParameters Map containing the filter conditions of the FilterBar, the currentTabID
	 * and the view refresh cause (tabChanged or search).
	 * The map looks like this:
	 * <code><pre>
	 * 	{
	 * 		filterConditions: {
	 * 			Country: [
	 * 				{
	 * 					operator: "EQ"
	 *					validated: "NotValidated"
	 *					values: ["Germany", ...]
	 * 				},
	 * 				...
	 * 			]
	 * 			...
	 * 		},
	 *		currentTabId: "fe::CustomTab::tab1",
	 *		refreshCause: "tabChanged" | "search"
	 *	}
	 * </pre></code>
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onViewNeedsRefresh(mParameters: any) {
		/* To be overriden */
	}

	/**
	 * Method called when a filter or search value has been changed in the FilterBar,
	 * but has not been validated yet by the end user (with the 'Go' or 'Search' button).
	 * Typically, the content of the current tab is greyed out until the filters are validated.
	 * This method can be overwritten by the controller extension in case of customization.
	 *
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onPendingFilters() {
		/* To be overriden */
	}

	getCurrentEntitySet() {
		return this._getTable()?.data("targetCollectionPath").slice(1);
	}

	/**
	 * Method called when the 'Clear' button on the FilterBar is pressed.
	 *
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onAfterClear() {
		/* To be overriden */
	}

	/**
	 * This method initiates the update of the enabled state of the DataFieldForAction and the visible state of the DataFieldForIBN buttons.
	 *
	 * @param aTables Array of tables in the list report
	 * @private
	 */
	_updateTableActions(aTables: any) {
		let aIBNActions: any[] = [];
		aTables.forEach(function (oTable: any) {
			aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
			// Update 'enabled' property of DataFieldForAction buttons on table toolbar
			// The same is also performed on Table selectionChange event
			const oInternalModelContext = oTable.getBindingContext("internal"),
				oActionOperationAvailableMap = JSON.parse(
					CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))
				),
				aSelectedContexts = oTable.getSelectedContexts();

			oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
			oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
			// Refresh enablement of delete button
			DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);

			ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
		});
		CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
	}

	/**
	 * This method scrolls to a specific row on all the available tables.
	 *
	 * @function
	 * @name sap.fe.templates.ListReport.ListReportController.controller#_scrollTablesToRow
	 * @param sRowPath The path of the table row context to be scrolled to
	 */
	_scrollTablesToRow(sRowPath: string) {
		this._getControls("table").forEach(function (oTable: any) {
			TableScroller.scrollTableToRow(oTable, sRowPath);
		});
	}

	/**
	 * This method sets the initial focus in a list report based on the User Experience guidelines.
	 *
	 * @function
	 * @name sap.fe.templates.ListReport.ListReportController.controller#_setInitialFocus
	 */
	_setInitialFocus() {
		const dynamicPage = this._getDynamicListReportControl(),
			isHeaderExpanded = dynamicPage.getHeaderExpanded(),
			filterBar = this._getFilterBarControl() as any;
		if (filterBar) {
			//Enabling mandatory filter fields message dialog
			if (!filterBar.getShowMessages()) {
				filterBar.setShowMessages(true);
			}
			if (isHeaderExpanded) {
				const firstEmptyMandatoryField = filterBar.getFilterItems().find(function (oFilterItem: any) {
					return oFilterItem.getRequired() && oFilterItem.getConditions().length === 0;
				});
				//Focusing on the first empty mandatory filter field, or on the first filter field if the table data is loaded
				if (firstEmptyMandatoryField) {
					firstEmptyMandatoryField.focus();
				} else if (this._isInitLoadEnabled() && filterBar.getFilterItems().length > 0) {
					//BCP: 2380008406 Add check for available filterItems
					filterBar.getFilterItems()[0].focus();
				} else {
					//Focusing on the Go button
					this.getView().byId(`${this._getFilterBarControlId()}-btnSearch`)?.focus();
				}
			} else if (this._isInitLoadEnabled()) {
				this._getTable()
					?.focusRow(0)
					.catch(function (error: any) {
						Log.error("Error while setting initial focus on the table ", error);
					});
			}
		} else {
			this._getTable()
				?.focusRow(0)
				.catch(function (error: any) {
					Log.error("Error while setting initial focus on the table ", error);
				});
		}
	}

	_getPageTitleInformation() {
		const oManifestEntry = this.getAppComponent().getManifestEntry("sap.app");
		return {
			title: oManifestEntry.title,
			subtitle: oManifestEntry.subTitle || "",
			intent: "",
			icon: ""
		};
	}

	_getFilterBarControl() {
		return this.getView().byId(this._getFilterBarControlId()) as FilterBar;
	}

	_getDynamicListReportControl() {
		return this.getView().byId(this._getDynamicListReportControlId()) as DynamicPage;
	}

	_getAdaptationFilterBarControl() {
		// If the adaptation filter bar is part of the DOM tree, the "Adapt Filter" dialog is open,
		// and we return the adaptation filter bar as an active control (visible for the user)
		const adaptationFilterBar = (this._getFilterBarControl() as any).getInbuiltFilter();
		return adaptationFilterBar?.getParent() ? adaptationFilterBar : undefined;
	}

	_getSegmentedButton(sControl: any) {
		const sSegmentedButtonId = (sControl === "Chart" ? this.getChartControl() : this._getTable())?.data("segmentedButtonId");
		return this.getView().byId(sSegmentedButtonId);
	}

	_getControlFromPageModelProperty(sPath: string) {
		const controlId = this._getPageModel()?.getProperty(sPath);
		return controlId && this.getView().byId(controlId);
	}

	_getDynamicListReportControlId(): string {
		return this._getPageModel()?.getProperty("/dynamicListReportId") || "";
	}

	_getFilterBarControlId(): string {
		return this._getPageModel()?.getProperty("/filterBarId") || "";
	}

	getChartControl() {
		return this._getControlFromPageModelProperty("/singleChartId");
	}

	_getVisualFilterBarControl() {
		const sVisualFilterBarId = StableIdHelper.generate(["visualFilter", this._getFilterBarControlId()]);
		return sVisualFilterBarId && this.getView().byId(sVisualFilterBarId);
	}

	_getFilterBarVariantControl() {
		return this._getControlFromPageModelProperty("/variantManagement/id");
	}

	_getMultiModeControl() {
		return this.getView().byId("fe::TabMultipleMode::Control") as MultipleModeControl;
	}

	_getTable(): Table | undefined {
		if (this._isMultiMode()) {
			const oControl = this._getMultiModeControl()?.getSelectedInnerControl()?.content;
			return oControl?.isA("sap.ui.mdc.Table") ? (oControl as Table) : undefined;
		} else {
			return this._getControlFromPageModelProperty("/singleTableId") as Table;
		}
	}

	_getControls(sKey?: any) {
		if (this._isMultiMode()) {
			const aControls: any[] = [];
			const oTabMultiMode = this._getMultiModeControl().content;
			oTabMultiMode.getItems().forEach((oItem: any) => {
				const oControl = this.getView().byId(oItem.getKey());
				if (oControl && sKey) {
					if (oItem.getKey().indexOf(`fe::${sKey}`) > -1) {
						aControls.push(oControl);
					}
				} else if (oControl !== undefined && oControl !== null) {
					aControls.push(oControl);
				}
			});
			return aControls;
		} else if (sKey === "Chart") {
			const oChart = this.getChartControl();
			return oChart ? [oChart] : [];
		} else {
			const oTable = this._getTable();
			return oTable ? [oTable] : [];
		}
	}

	_getDefaultPath() {
		const defaultPath = ListReportTemplating.getDefaultPath(this._getPageModel()?.getProperty("/views") || []);
		switch (defaultPath) {
			case "primary":
				return TemplateContentView.Chart;
			case "secondary":
				return TemplateContentView.Table;
			case "both":
			default:
				return TemplateContentView.Hybrid;
		}
	}

	/**
	 * Method to know if ListReport is configured with Multiple Table mode.
	 *
	 * @function
	 * @name _isMultiMode
	 * @returns Is Multiple Table mode set?
	 */
	_isMultiMode(): boolean {
		return !!this._getPageModel()?.getProperty("/multiViewsControl");
	}

	/**
	 * Method to know if ListReport is configured to load data at start up.
	 *
	 * @function
	 * @name _isInitLoadDisabled
	 * @returns Is InitLoad enabled?
	 */
	_isInitLoadEnabled(): boolean {
		const initLoadMode = (this.getView().getViewData() as any).initialLoad;
		return initLoadMode === InitialLoadMode.Enabled;
	}

	_hasMultiVisualizations(): boolean {
		return this._getPageModel()?.getProperty("/hasMultiVisualizations");
	}

	/**
	 * Method to suspend search on the filter bar. The initial loading of data is disabled based on the manifest configuration InitLoad - Disabled/Auto.
	 * It is enabled later when the view state is set, when it is possible to realize if there are default filters.
	 */
	_disableInitLoad() {
		const filterBar = this._getFilterBarControl();
		// check for filter bar hidden
		if (filterBar) {
			filterBar.setSuspendSelection(true);
		}
	}

	/**
	 * Method called by flex to determine if the applyAutomatically setting on the variant is valid.
	 * Called only for Standard Variant and only when there is display text set for applyAutomatically (FE only sets it for Auto).
	 *
	 * @returns Boolean true if data should be loaded automatically, false otherwise
	 */
	_applyAutomaticallyOnStandardVariant() {
		// We always return false and take care of it when view state is set
		return false;
	}

	/**
	 * Configure the settings for initial load based on
	 * - manifest setting initLoad - Enabled/Disabled/Auto
	 * - user's setting of applyAutomatically on variant
	 * - if there are default filters
	 * We disable the filter bar search at the beginning and enable it when view state is set.
	 */
	_setInitLoad() {
		// if initLoad is Disabled or Auto, switch off filter bar search temporarily at start
		if (!this._isInitLoadEnabled()) {
			this._disableInitLoad();
		}
		// set hook for flex for when standard variant is set (at start or by user at runtime)
		// required to override the user setting 'apply automatically' behaviour if there are no filters
		const variantManagementId: any = ListReportTemplating.getVariantBackReference(this.getView().getViewData(), this._getPageModel());
		const variantManagement = variantManagementId && this.getView().byId(variantManagementId);
		if (variantManagement) {
			variantManagement.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this));
		}
	}

	_setShareModel() {
		// TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
		// this method is currently not called anymore from the init method

		const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
		//var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
		//var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

		//shareModel: Holds all the sharing relevant information and info used in XML view
		const oShareInfo = {
			bookmarkTitle: document.title, //To name the bookmark according to the app title.
			bookmarkCustomUrl: function () {
				const sHash = hasher.getHash();
				return sHash ? `#${sHash}` : window.location.href;
			},
			/*
							To be activated once the FLP shows the count - see comment above
							bookmarkServiceUrl: function() {
								//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
								// we should use table.getListBindingInfo instead of the binding
								var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
								return oBinding ? fnGetDownloadUrl(oBinding) : "";
							},*/
			isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
		};

		const oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv") as JSONModel;
		oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
	}

	/**
	 * Method to update the local UI model of the page with the fields that are not applicable to the filter bar (this is specific to the ALP scenario).
	 *
	 * @param oInternalModelContext The internal model context
	 * @param oFilterBar MDC filter bar
	 */
	_updateALPNotApplicableFields(oInternalModelContext: InternalModelContext, oFilterBar: FilterBar) {
		const mCache: any = {};
		const ignoredFields: any = {},
			aTables = this._getControls("table"),
			aCharts = this._getControls("Chart");

		if (!aTables.length || !aCharts.length) {
			// If there's not a table and a chart, we're not in the ALP case
			return;
		}

		// For the moment, there's nothing for tables...
		aCharts.forEach(function (oChart: any) {
			const sChartEntityPath = oChart.data("targetCollectionPath"),
				sChartEntitySet = sChartEntityPath.slice(1),
				sCacheKey = `${sChartEntitySet}Chart`;
			if (!mCache[sCacheKey]) {
				mCache[sCacheKey] = FilterUtils.getNotApplicableFilters(oFilterBar, oChart);
			}
			ignoredFields[sCacheKey] = mCache[sCacheKey];
		});
		oInternalModelContext.setProperty("controls/ignoredFields", ignoredFields);
	}

	_isFilterBarHidden() {
		return (this.getView().getViewData() as any).hideFilterBar;
	}

	_getApplyAutomaticallyOnVariant(VariantManagement: any, key: string): Boolean {
		if (!VariantManagement || !key) {
			return false;
		}
		const variants = VariantManagement.getVariants();
		const currentVariant = variants.find(function (variant: any) {
			return variant && variant.key === key;
		});
		return (currentVariant && currentVariant.executeOnSelect) || false;
	}

	_shouldAutoTriggerSearch(oVM: any) {
		if (
			(this.getView().getViewData() as any).initialLoad === InitialLoadMode.Auto &&
			(!oVM || oVM.getStandardVariantKey() === oVM.getCurrentVariantKey())
		) {
			const oFilterBar = this._getFilterBarControl();
			if (oFilterBar) {
				const oConditions = oFilterBar.getConditions();
				for (const sKey in oConditions) {
					// ignore filters starting with $ (e.g. $search, $editState)
					if (!sKey.startsWith("$") && Array.isArray(oConditions[sKey]) && oConditions[sKey].length) {
						// load data as per user's setting of applyAutomatically on the variant
						const standardVariant: any = oVM.getVariants().find((variant: any) => {
							return variant.key === oVM.getCurrentVariantKey();
						});
						return standardVariant && standardVariant.executeOnSelect;
					}
				}
			}
		}
		return false;
	}

	_updateTable(oTable: any) {
		if (!oTable.isTableBound() || this.hasPendingChartChanges) {
			oTable.rebind();
			this.hasPendingChartChanges = false;
		}
	}

	_updateChart(oChart: any) {
		const oInnerChart = oChart.getControlDelegate()._getChart(oChart);
		if (!(oInnerChart && oInnerChart.isBound("data")) || this.hasPendingTableChanges) {
			oChart.getControlDelegate().rebind(oChart, oInnerChart.getBindingInfo("data"));
			this.hasPendingTableChanges = false;
		}
	}

	handlers = {
		onFilterSearch(this: ListReportController) {
			this._getFilterBarControl().triggerSearch();
		},
		onFiltersChanged(this: ListReportController, oEvent: any) {
			const oFilterBar = this._getFilterBarControl();
			if (oFilterBar) {
				const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext | undefined;
				// Pending filters into FilterBar to be used for custom views
				this.onPendingFilters();
				const appliedFiltersText = oFilterBar.getAssignedFiltersText().filtersText;
				const appliedFilterBinding = bindingParser(appliedFiltersText);
				if (appliedFilterBinding) {
					(this.getView().byId("fe::appliedFiltersText") as Text | undefined)?.bindText(appliedFilterBinding);
				} else {
					(this.getView().byId("fe::appliedFiltersText") as Text | undefined)?.setText(appliedFiltersText);
				}

				if (oInternalModelContext && oEvent.getParameter("conditionsBased")) {
					oInternalModelContext.setProperty("hasPendingFilters", true);
				}
			}
		},
		onVariantSelected(this: ListReportController, oEvent: any) {
			const oVM = oEvent.getSource();
			const currentVariantKey = oEvent.getParameter("key");
			const oMultiModeControl = this._getMultiModeControl();

			if (oMultiModeControl && !oVM?.getParent().isA("sap.ui.mdc.ActionToolbar")) {
				//Not a Control Variant
				oMultiModeControl?.invalidateContent();
				oMultiModeControl?.setFreezeContent(true);
			}

			// setTimeout cause the variant needs to be applied before judging the auto search or updating the app state
			setTimeout(() => {
				if (this._shouldAutoTriggerSearch(oVM)) {
					// the app state will be updated via onSearch handler
					return this._getFilterBarControl().triggerSearch();
				} else if (!this._getApplyAutomaticallyOnVariant(oVM, currentVariantKey)) {
					this.getExtensionAPI().updateAppState();
				}
			}, 0);
		},
		onVariantSaved(this: ListReportController) {
			//TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save!!!
			setTimeout(() => {
				this.getExtensionAPI().updateAppState();
			}, 1000);
		},
		onSearch(this: ListReportController) {
			const oFilterBar = this._getFilterBarControl();
			const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
			const oMdcChart = this.getChartControl();
			const bHideDraft = FilterUtils.getEditStateIsHideDraft(oFilterBar.getConditions());
			oInternalModelContext.setProperty("hasPendingFilters", false);
			oInternalModelContext.setProperty("hideDraftInfo", bHideDraft);

			if (!this._getMultiModeControl()) {
				this._updateALPNotApplicableFields(oInternalModelContext, oFilterBar);
			}
			if (oMdcChart) {
				// disable bound actions TODO: this clears everything for the chart?
				(oMdcChart.getBindingContext("internal") as InternalModelContext).setProperty("", {});

				const oPageInternalModelContext = oMdcChart.getBindingContext("pageInternal") as InternalModelContext;
				const sTemplateContentView = oPageInternalModelContext.getProperty(`${oPageInternalModelContext.getPath()}/alpContentView`);
				if (sTemplateContentView === TemplateContentView.Chart) {
					this.hasPendingChartChanges = true;
				}
				if (sTemplateContentView === TemplateContentView.Table) {
					this.hasPendingTableChanges = true;
				}
			}
			// store filter bar conditions to use later while navigation
			StateUtil.retrieveExternalState(oFilterBar)
				.then((oExternalState: any) => {
					this.filterBarConditions = oExternalState.filter;
				})
				.catch(function (oError: any) {
					Log.error("Error while retrieving the external state", oError);
				});
			if ((this.getView().getViewData() as any).liveMode === false) {
				this.getExtensionAPI().updateAppState();
			}

			if (system.phone) {
				const oDynamicPage = this._getDynamicListReportControl();
				oDynamicPage.setHeaderExpanded(false);
			}
		},
		/**
		 * Triggers an outbound navigation when a user chooses the chevron.
		 *
		 * @param oController
		 * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
		 * @param oContext The context that contains the data for the target app
		 * @param sCreatePath Create path when the chevron is created.
		 * @returns Promise which is resolved once the navigation is triggered
		 * @ui5-restricted
		 * @final
		 */
		onChevronPressNavigateOutBound(oController: ListReportController, sOutboundTarget: string, oContext: Context, sCreatePath: string) {
			return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
		},
		onChartSelectionChanged(this: ListReportController, oEvent: any) {
			const oMdcChart = oEvent.getSource().getContent(),
				oTable = this._getTable(),
				aData = oEvent.getParameter("data"),
				oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
			if (aData) {
				ChartUtils.setChartFilters(oMdcChart);
			}
			const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
			if (sTemplateContentView === TemplateContentView.Chart) {
				this.hasPendingChartChanges = true;
			} else if (oTable) {
				(oTable as any).rebind();
				this.hasPendingChartChanges = false;
			}
		},
		onSegmentedButtonPressed(this: ListReportController, oEvent: any) {
			const sSelectedKey = oEvent.mParameters.key ? oEvent.mParameters.key : null;
			const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
			oInternalModelContext.setProperty("alpContentView", sSelectedKey);
			const oChart = this.getChartControl();
			const oTable = this._getTable();
			const oSegmentedButtonDelegate = {
				onAfterRendering() {
					const aItems = oSegmentedButton.getItems();
					aItems.forEach(function (oItem: any) {
						if (oItem.getKey() === sSelectedKey) {
							oItem.focus();
						}
					});
					oSegmentedButton.removeEventDelegate(oSegmentedButtonDelegate);
				}
			};
			const oSegmentedButton = (
				sSelectedKey === TemplateContentView.Table ? this._getSegmentedButton("Table") : this._getSegmentedButton("Chart")
			) as SegmentedButton;
			if (oSegmentedButton !== oEvent.getSource()) {
				oSegmentedButton.addEventDelegate(oSegmentedButtonDelegate);
			}
			switch (sSelectedKey) {
				case TemplateContentView.Table:
					this._updateTable(oTable);
					break;
				case TemplateContentView.Chart:
					this._updateChart(oChart);
					break;
				case TemplateContentView.Hybrid:
					this._updateTable(oTable);
					this._updateChart(oChart);
					break;
				default:
					break;
			}
			this.getExtensionAPI().updateAppState();
		},
		onFiltersSegmentedButtonPressed(this: ListReportController, oEvent: any) {
			const isCompact = oEvent.getParameter("key") === "Compact";
			this._getFilterBarControl().setVisible(isCompact);
			(this._getVisualFilterBarControl() as Control).setVisible(!isCompact);
		},
		onStateChange(this: ListReportController) {
			this.getExtensionAPI().updateAppState();
		},
		onDynamicPageTitleStateChanged(this: ListReportController, oEvent: any) {
			const filterBar: any = this._getFilterBarControl();
			if (filterBar && filterBar.getSegmentedButton()) {
				if (oEvent.getParameter("isExpanded")) {
					filterBar.getSegmentedButton().setVisible(true);
				} else {
					filterBar.getSegmentedButton().setVisible(false);
				}
			}
		}
	};

	onAfterRendering() {
		const aTables = this._getControls() as Table[];
		const sEntitySet = (this.getView().getViewData() as any).entitySet;
		const sText = getResourceModel(this.getView()).getText("T_TABLE_AND_CHART_NO_DATA_TEXT", undefined, sEntitySet);
		aTables.forEach(function (oTable: Control) {
			if (oTable.isA<Table>("sap.ui.mdc.Table")) {
				oTable.setNoData(sText);
			}
		});
	}
}

export default ListReportController;
