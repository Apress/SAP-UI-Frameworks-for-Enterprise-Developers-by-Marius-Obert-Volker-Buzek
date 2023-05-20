import Log from "sap/base/Log";
import merge from "sap/base/util/merge";
import ActionRuntime from "sap/fe/core/ActionRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import { connect, disconnect, isConnected } from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import { openManageDialog, showUserDetails } from "sap/fe/core/controllerextensions/collaboration/Manage";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import IntentBasedNavigation from "sap/fe/core/controllerextensions/IntentBasedNavigation";
import InternalIntentBasedNavigation from "sap/fe/core/controllerextensions/InternalIntentBasedNavigation";
import InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import MassEdit from "sap/fe/core/controllerextensions/MassEdit";
import MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";
import PageReady from "sap/fe/core/controllerextensions/PageReady";
import Paginator from "sap/fe/core/controllerextensions/Paginator";
import Placeholder from "sap/fe/core/controllerextensions/Placeholder";
import Share from "sap/fe/core/controllerextensions/Share";
import ViewState from "sap/fe/core/controllerextensions/ViewState";
import { defineUI5Class, extensible, finalExtension, publicExtension, usingExtension } from "sap/fe/core/helpers/ClassSupport";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import PageController from "sap/fe/core/PageController";
import CommonHelper from "sap/fe/macros/CommonHelper";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import TableHelper from "sap/fe/macros/table/TableHelper";
import TableUtils from "sap/fe/macros/table/Utils";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import type SubSectionBlock from "sap/fe/templates/ObjectPage/controls/SubSectionBlock";
import type { default as ObjectPageExtensionAPI } from "sap/fe/templates/ObjectPage/ExtensionAPI";
import { default as ExtensionAPI } from "sap/fe/templates/ObjectPage/ExtensionAPI";
import TableScroller from "sap/fe/templates/TableScroller";
import InstanceManager from "sap/m/InstanceManager";
import Link from "sap/m/Link";
import MessageBox from "sap/m/MessageBox";
import type Popover from "sap/m/Popover";
import Core from "sap/ui/core/Core";
import type Message from "sap/ui/core/message/Message";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type View from "sap/ui/core/mvc/View";
import type Table from "sap/ui/mdc/Table";
import type Binding from "sap/ui/model/Binding";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type BreadCrumbs from "sap/uxap/BreadCrumbs";
import type ObjectPageDynamicHeaderTitle from "sap/uxap/ObjectPageDynamicHeaderTitle";
import type ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import type ObjectPageSection from "sap/uxap/ObjectPageSection";
import type ObjectPageSubSection from "sap/uxap/ObjectPageSubSection";
import IntentBasedNavigationOverride from "./overrides/IntentBasedNavigation";
import InternalRoutingOverride from "./overrides/InternalRouting";
import MessageHandlerOverride from "./overrides/MessageHandler";
import PaginatorOverride from "./overrides/Paginator";
import ShareOverrides from "./overrides/Share";
import ViewStateOverrides from "./overrides/ViewState";

@defineUI5Class("sap.fe.templates.ObjectPage.ObjectPageController")
class ObjectPageController extends PageController {
	oView!: any;

	@usingExtension(Placeholder)
	placeholder!: Placeholder;

	@usingExtension(Share.override(ShareOverrides))
	share!: Share;

	@usingExtension(InternalRouting.override(InternalRoutingOverride))
	_routing!: InternalRouting;

	@usingExtension(Paginator.override(PaginatorOverride))
	paginator!: Paginator;

	@usingExtension(MessageHandler.override(MessageHandlerOverride))
	messageHandler!: MessageHandler;

	@usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride))
	intentBasedNavigation!: IntentBasedNavigation;

	@usingExtension(
		InternalIntentBasedNavigation.override({
			getNavigationMode: function (this: InternalIntentBasedNavigation) {
				const bIsStickyEditMode =
					(this.getView().getController() as ObjectPageController).getStickyEditMode &&
					(this.getView().getController() as ObjectPageController).getStickyEditMode();
				return bIsStickyEditMode ? "explace" : undefined;
			}
		})
	)
	_intentBasedNavigation!: InternalIntentBasedNavigation;

	@usingExtension(ViewState.override(ViewStateOverrides))
	viewState!: ViewState;

	@usingExtension(
		PageReady.override({
			isContextExpected: function () {
				return true;
			}
		})
	)
	pageReady!: PageReady;

	@usingExtension(MassEdit)
	massEdit!: MassEdit;

	private mCustomSectionExtensionAPIs?: Record<string, ObjectPageExtensionAPI>;

	protected extensionAPI?: ObjectPageExtensionAPI;

	private bSectionNavigated?: boolean;

	private switchDraftAndActivePopOver?: Popover;

	private currentBinding?: Binding;

	private messageButton: any;

	@publicExtension()
	@finalExtension()
	getExtensionAPI(sId?: string): ExtensionAPI {
		if (sId) {
			// to allow local ID usage for custom pages we'll create/return own instances for custom sections
			this.mCustomSectionExtensionAPIs = this.mCustomSectionExtensionAPIs || {};

			if (!this.mCustomSectionExtensionAPIs[sId]) {
				this.mCustomSectionExtensionAPIs[sId] = new ExtensionAPI(this, sId);
			}
			return this.mCustomSectionExtensionAPIs[sId];
		} else {
			if (!this.extensionAPI) {
				this.extensionAPI = new ExtensionAPI(this);
			}
			return this.extensionAPI;
		}
	}

	onInit() {
		super.onInit();
		const oObjectPage = this._getObjectPageLayoutControl();

		// Setting defaults of internal model context
		const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
		oInternalModelContext?.setProperty("externalNavigationContext", { page: true });
		oInternalModelContext?.setProperty("relatedApps", {
			visibility: false,
			items: null
		});
		oInternalModelContext?.setProperty("batchGroups", this._getBatchGroupsForView());
		oInternalModelContext?.setProperty("errorNavigationSectionFlag", false);
		if (oObjectPage.getEnableLazyLoading()) {
			//Attaching the event to make the subsection context binding active when it is visible.
			oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
		}
		this.messageButton = this.getView().byId("fe::FooterBar::MessageButton");
		this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage, this);
		oInternalModelContext?.setProperty("rootEditEnabled", true);
		oInternalModelContext?.setProperty("rootEditVisible", true);
	}

	onExit() {
		if (this.mCustomSectionExtensionAPIs) {
			for (const sId of Object.keys(this.mCustomSectionExtensionAPIs)) {
				if (this.mCustomSectionExtensionAPIs[sId]) {
					this.mCustomSectionExtensionAPIs[sId].destroy();
				}
			}
			delete this.mCustomSectionExtensionAPIs;
		}
		if (this.extensionAPI) {
			this.extensionAPI.destroy();
		}
		delete this.extensionAPI;

		const oMessagePopover = this.messageButton ? this.messageButton.oMessagePopover : null;
		if (oMessagePopover && oMessagePopover.isOpen()) {
			oMessagePopover.close();
		}
		//when exiting we set keepAlive context to false
		const oContext = this.getView().getBindingContext() as Context;
		if (oContext && oContext.isKeepAlive()) {
			oContext.setKeepAlive(false);
		}
		if (isConnected(this.getView())) {
			disconnect(this.getView()); // Cleanup collaboration connection when leaving the app
		}
	}

	/**
	 * Method to show the message strip on the object page.
	 *
	 * @private
	 */
	_fnShowOPMessage() {
		const extensionAPI = this.getExtensionAPI();
		const view = this.getView();
		const messages = this.messageButton.oMessagePopover
			.getItems()
			.map((item: any) => item.getBindingContext("message").getObject())
			.filter((message: Message) => {
				return message.getTargets()[0] === view.getBindingContext()?.getPath();
			});

		if (extensionAPI) {
			extensionAPI.showMessages(messages);
		}
	}

	_getTableBinding(oTable: any) {
		return oTable && oTable.getRowBinding();
	}

	/**
	 * Find the last visible subsection and add the sapUxAPObjectPageSubSectionFitContainer CSS class if it contains only a gridTable.
	 *
	 * @param subSections The sub sections to look for
	 * @private
	 */
	private checkSectionsForGridTable(subSections: ObjectPageSubSection[]) {
		const changeClassForTables = (event: Event, lastVisibleSubSection: ObjectPageSubSection) => {
			const blocks = [...lastVisibleSubSection.getBlocks(), ...lastVisibleSubSection.getMoreBlocks()];
			if (
				blocks.length === 1 &&
				this.searchTableInBlock(blocks[0] as SubSectionBlock)
					?.getType()
					?.isA("sap.ui.mdc.table.GridTableType")
			) {
				//In case there is only a single table in a subSection we fit that to the whole page so that the scrollbar comes only on table and not on page
				lastVisibleSubSection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
				lastVisibleSubSection.detachEvent("modelContextChange", changeClassForTables, this);
			}
		};
		for (let subSectionIndex = subSections.length - 1; subSectionIndex >= 0; subSectionIndex--) {
			if (subSections[subSectionIndex].getVisible()) {
				const lastVisibleSubSection = subSections[subSectionIndex];
				// We need to attach this event in order to manage the Object Page Lazy Loading mechanism
				lastVisibleSubSection.attachEvent("modelContextChange", lastVisibleSubSection, changeClassForTables, this);
				break;
			}
		}
	}

	/**
	 * Find a table in blocks of section.
	 *
	 * @param block One sub section block
	 * @returns Table if exists
	 */
	private searchTableInBlock(block: SubSectionBlock) {
		const control = block.content;
		let tableAPI: TableAPI | undefined;
		if (block.isA("sap.fe.templates.ObjectPage.controls.SubSectionBlock")) {
			// The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
			// control from the custom data of the place holder panel
			if (control.isA("sap.m.Panel") && control.data("FullScreenTablePlaceHolder")) {
				tableAPI = control.data("tableAPIreference");
			} else if (control.isA("sap.fe.macros.table.TableAPI")) {
				tableAPI = control as TableAPI;
			}
			if (tableAPI) {
				return tableAPI.content as Table;
			}
		}
		return undefined;
	}
	onBeforeRendering() {
		PageController.prototype.onBeforeRendering.apply(this);
		// In the retrieveTextFromValueList scenario we need to ensure in case of reload/refresh that the meta model in the methode retrieveTextFromValueList of the FieldRuntime is available
		if (this.oView.oViewData?.retrieveTextFromValueList && CommonHelper.getMetaModel() === undefined) {
			CommonHelper.setMetaModel(this.getAppComponent().getMetaModel());
		}
	}

	onAfterRendering() {
		let subSections: ObjectPageSubSection[];
		if (this._getObjectPageLayoutControl().getUseIconTabBar()) {
			const sections = this._getObjectPageLayoutControl().getSections();
			for (const section of sections) {
				subSections = section.getSubSections();
				this.checkSectionsForGridTable(subSections);
			}
		} else {
			subSections = this._getAllSubSections();
			this.checkSectionsForGridTable(subSections);
		}
	}

	_onBeforeBinding(oContext: any, mParameters: any) {
		// TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
		const aTables = this._findTables(),
			oObjectPage = this._getObjectPageLayoutControl(),
			oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext,
			oInternalModel = this.getView().getModel("internal") as JSONModel,
			aBatchGroups = oInternalModelContext.getProperty("batchGroups"),
			iViewLevel = (this.getView().getViewData() as any).viewLevel;
		let oFastCreationRow;
		aBatchGroups.push("$auto");
		if (mParameters.bDraftNavigation !== true) {
			this._closeSideContent();
		}
		const opContext = oObjectPage.getBindingContext() as Context;
		if (
			opContext &&
			opContext.hasPendingChanges() &&
			!aBatchGroups.some(opContext.getModel().hasPendingChanges.bind(opContext.getModel()))
		) {
			/* 	In case there are pending changes for the creation row and no others we need to reset the changes
								TODO: this is just a quick solution, this needs to be reworked
								*/

			opContext.getBinding().resetChanges();
		}

		// For now we have to set the binding context to null for every fast creation row
		// TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
		for (let i = 0; i < aTables.length; i++) {
			oFastCreationRow = aTables[i].getCreationRow();
			if (oFastCreationRow) {
				oFastCreationRow.setBindingContext(null);
			}
		}

		// Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
		const fnScrollToPresentSection = function () {
			if (!(oObjectPage as any).isFirstRendering() && !mParameters.bPersistOPScroll) {
				oObjectPage.setSelectedSection(null as any);
			}
		};
		oObjectPage.attachEventOnce("modelContextChange", fnScrollToPresentSection);

		// if the structure of the ObjectPageLayout is changed then scroll to present Section
		// FIXME Is this really working as intended ? Initially this was onBeforeRendering, but never triggered onBeforeRendering because it was registered after it
		const oDelegateOnBefore = {
			onAfterRendering: fnScrollToPresentSection
		};
		oObjectPage.addEventDelegate(oDelegateOnBefore, this);
		this.pageReady.attachEventOnce("pageReady", function () {
			oObjectPage.removeEventDelegate(oDelegateOnBefore);
		});

		//Set the Binding for Paginators using ListBinding ID
		if (iViewLevel > 1) {
			let oBinding = mParameters && mParameters.listBinding;
			const oPaginatorCurrentContext = oInternalModel.getProperty("/paginatorCurrentContext");
			if (oPaginatorCurrentContext) {
				const oBindingToUse = oPaginatorCurrentContext.getBinding();
				this.paginator.initialize(oBindingToUse, oPaginatorCurrentContext);
				oInternalModel.setProperty("/paginatorCurrentContext", null);
			} else if (oBinding) {
				if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
					this.paginator.initialize(oBinding, oContext);
				} else {
					// if the binding type is not ODataListBinding because of a deeplink navigation or a refresh of the page
					// we need to create it
					const sBindingPath = oBinding.getPath();
					if (/\([^)]*\)$/.test(sBindingPath)) {
						// The current binding path ends with (xxx), so we create the listBinding by removing (xxx)
						const sListBindingPath = sBindingPath.replace(/\([^)]*\)$/, "");
						oBinding = new (ODataListBinding as any)(oBinding.oModel, sListBindingPath);
						const _setListBindingAsync = () => {
							if (oBinding.getContexts().length > 0) {
								this.paginator.initialize(oBinding, oContext);
								oBinding.detachEvent("change", _setListBindingAsync);
							}
						};

						oBinding.getContexts(0);
						oBinding.attachEvent("change", _setListBindingAsync);
					} else {
						// The current binding doesn't end with (xxx) --> the last segment is a 1-1 navigation, so we don't display the paginator
						this.paginator.initialize(undefined);
					}
				}
			}
		}

		if (oObjectPage.getEnableLazyLoading()) {
			const aSections = oObjectPage.getSections();
			const bUseIconTabBar = oObjectPage.getUseIconTabBar();
			let iSkip = 2;
			const bIsInEditMode = oObjectPage.getModel("ui").getProperty("/isEditable");
			const bEditableHeader = (this.getView().getViewData() as any).editableHeaderContent;
			for (let iSection = 0; iSection < aSections.length; iSection++) {
				const oSection = aSections[iSection];
				const aSubSections = oSection.getSubSections();
				for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
					// In IconTabBar mode keep the second section bound if there is an editable header and we are switching to display mode
					if (iSkip < 1 || (bUseIconTabBar && (iSection > 1 || (iSection === 1 && !bEditableHeader && !bIsInEditMode)))) {
						const oSubSection = aSubSections[iSubSection];
						if (oSubSection.data().isVisibilityDynamic !== "true") {
							oSubSection.setBindingContext(null as any);
						}
					}
				}
			}
		}

		if (this.placeholder.isPlaceholderEnabled() && mParameters.showPlaceholder) {
			const oView = this.getView();
			const oNavContainer = (oView.getParent() as any).oContainer.getParent();
			if (oNavContainer) {
				oNavContainer.showPlaceholder({});
			}
		}
	}

	_getFirstClickableElement(oObjectPage: any) {
		let oFirstClickableElement;
		const aActions = oObjectPage.getHeaderTitle() && oObjectPage.getHeaderTitle().getActions();
		if (aActions && aActions.length) {
			oFirstClickableElement = aActions.find(function (oAction: any) {
				// Due to the left alignment of the Draft switch and the collaborative draft avatar controls
				// there is a ToolbarSpacer in the actions aggregation which we need to exclude here!
				// Due to the ACC report, we also need not to check for the InvisibleText elements
				if (oAction.isA("sap.fe.macros.share.ShareAPI")) {
					// since ShareAPI does not have a disable property
					// hence there is no need to check if it is disbaled or not
					return oAction.getVisible();
				} else if (!oAction.isA("sap.ui.core.InvisibleText") && !oAction.isA("sap.m.ToolbarSpacer")) {
					return oAction.getVisible() && oAction.getEnabled();
				}
			});
		}
		return oFirstClickableElement;
	}

	_getFirstEmptyMandatoryFieldFromSubSection(aSubSections: any) {
		if (aSubSections) {
			for (let subSection = 0; subSection < aSubSections.length; subSection++) {
				const aBlocks = aSubSections[subSection].getBlocks();

				if (aBlocks) {
					for (let block = 0; block < aBlocks.length; block++) {
						let aFormContainers;

						if (aBlocks[block].isA("sap.ui.layout.form.Form")) {
							aFormContainers = aBlocks[block].getFormContainers();
						} else if (
							aBlocks[block].getContent &&
							aBlocks[block].getContent() &&
							aBlocks[block].getContent().isA("sap.ui.layout.form.Form")
						) {
							aFormContainers = aBlocks[block].getContent().getFormContainers();
						}

						if (aFormContainers) {
							for (let formContainer = 0; formContainer < aFormContainers.length; formContainer++) {
								const aFormElements = aFormContainers[formContainer].getFormElements();
								if (aFormElements) {
									for (let formElement = 0; formElement < aFormElements.length; formElement++) {
										const aFields = aFormElements[formElement].getFields();

										// The first field is not necessarily an InputBase (e.g. could be a Text)
										// So we need to check whether it has a getRequired method
										try {
											if (aFields[0].getRequired && aFields[0].getRequired() && !aFields[0].getValue()) {
												return aFields[0];
											}
										} catch (error) {
											Log.debug(`Error when searching for mandaotry empty field: ${error}`);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return undefined;
	}

	_updateFocusInEditMode(aSubSections: any) {
		const oObjectPage = this._getObjectPageLayoutControl();

		const oMandatoryField = this._getFirstEmptyMandatoryFieldFromSubSection(aSubSections);
		let oFieldToFocus: any;
		if (oMandatoryField) {
			oFieldToFocus = oMandatoryField.content.getContentEdit()[0];
		} else {
			oFieldToFocus = (oObjectPage as any)._getFirstEditableInput() || this._getFirstClickableElement(oObjectPage);
		}

		if (oFieldToFocus) {
			setTimeout(function () {
				// We set the focus in a timeeout, otherwise the focus sometimes goes to the TabBar
				oFieldToFocus.focus();
			}, 0);
		}
	}

	_handleSubSectionEnteredViewPort(oEvent: any) {
		const oSubSection = oEvent.getParameter("subSection");
		oSubSection.setBindingContext(undefined);
	}

	_onBackNavigationInDraft(oContext: any) {
		this.messageHandler.removeTransitionMessages();
		if (this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()) {
			// Back nav will keep the same context --> no need to display the dialog
			history.back();
		} else {
			draft.processDataLossOrDraftDiscardConfirmation(
				function () {
					history.back();
				},
				Function.prototype,
				oContext,
				this,
				false,
				draft.NavigationType.BackNavigation
			);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_onAfterBinding(oBindingContext: any, mParameters: any) {
		const oObjectPage = this._getObjectPageLayoutControl();
		const aTables = this._findTables();

		this._sideEffects.clearFieldGroupsValidity();

		// TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
		// binding with ownRequest
		oBindingContext = oObjectPage.getBindingContext();

		let aIBNActions: any[] = [];
		oObjectPage.getSections().forEach(function (oSection: any) {
			oSection.getSubSections().forEach(function (oSubSection: any) {
				aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
			});
		});

		// Assign internal binding contexts to oFormContainer:
		// 1. It is not possible to assign the internal binding context to the XML fragment
		// (FormContainer.fragment.xml) yet - it is used already for the data-structure.
		// 2. Another problem is, that FormContainers assigned to a 'MoreBlock' does not have an
		// internal model context at all.

		aTables.forEach(function (oTable: any) {
			const oInternalModelContext = oTable.getBindingContext("internal");
			if (oInternalModelContext) {
				oInternalModelContext.setProperty("creationRowFieldValidity", {});
				oInternalModelContext.setProperty("creationRowCustomValidity", {});

				aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);

				// temporary workaround for BCP: 2080218004
				// Need to fix with BLI: FIORITECHP1-15274
				// only for edit mode, we clear the table cache
				// Workaround starts here!!
				const oTableRowBinding = oTable.getRowBinding();
				if (oTableRowBinding) {
					if (ModelHelper.isStickySessionSupported(oTableRowBinding.getModel().getMetaModel())) {
						// apply for both edit and display mode in sticky
						oTableRowBinding.removeCachesAndMessages("");
					}
				}
				// Workaround ends here!!

				// Update 'enabled' property of DataFieldForAction buttons on table toolbar
				// The same is also performed on Table selectionChange event
				const oActionOperationAvailableMap = JSON.parse(
						CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))
					),
					aSelectedContexts = oTable.getSelectedContexts();

				ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
				// Clear the selection in the table, need to be fixed and review with BLI: FIORITECHP1-24318
				oTable.clearSelection();
			}
		});
		CommonUtils.getSemanticTargetsFromPageModel(this, "_pageModel");
		//Retrieve Object Page header actions from Object Page title control
		const oObjectPageTitle = oObjectPage.getHeaderTitle() as ObjectPageDynamicHeaderTitle;
		let aIBNHeaderActions: any[] = [];
		aIBNHeaderActions = CommonUtils.getIBNActions(oObjectPageTitle, aIBNHeaderActions);
		aIBNActions = aIBNActions.concat(aIBNHeaderActions);
		CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());

		let oModel: any, oFinalUIState: any;

		// this should not be needed at the all
		/**
		 * @param oTable
		 */
		const handleTableModifications = (oTable: any) => {
			const oBinding = this._getTableBinding(oTable),
				fnHandleTablePatchEvents = function () {
					TableHelper.enableFastCreationRow(
						oTable.getCreationRow(),
						oBinding.getPath(),
						oBinding.getContext(),
						oModel,
						oFinalUIState
					);
				};

			if (!oBinding) {
				Log.error(`Expected binding missing for table: ${oTable.getId()}`);
				return;
			}

			if (oBinding.oContext) {
				fnHandleTablePatchEvents();
			} else {
				const fnHandleChange = function () {
					if (oBinding.oContext) {
						fnHandleTablePatchEvents();
						oBinding.detachChange(fnHandleChange);
					}
				};
				oBinding.attachChange(fnHandleChange);
			}
		};

		if (oBindingContext) {
			oModel = oBindingContext.getModel();

			// Compute Edit Mode
			oFinalUIState = this.editFlow.computeEditMode(oBindingContext);

			if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
				oFinalUIState
					.then(() => {
						if (this.getView().getModel("ui").getProperty("/isEditable")) {
							connect(this.getView());
						} else if (isConnected(this.getView())) {
							disconnect(this.getView()); // Cleanup collaboration connection in case we switch to another element (e.g. in FCL)
						}
					})
					.catch(function (oError: any) {
						Log.error("Error while waiting for the final UI State", oError);
					});
			}
			// update related apps
			this._updateRelatedApps();

			//Attach the patch sent and patch completed event to the object page binding so that we can react
			const oBinding = (oBindingContext.getBinding && oBindingContext.getBinding()) || oBindingContext;

			// Attach the event handler only once to the same binding
			if (this.currentBinding !== oBinding) {
				oBinding.attachEvent("patchSent", this.editFlow.handlePatchSent, this);
				this.currentBinding = oBinding;
			}

			aTables.forEach(function (oTable: any) {
				// access binding only after table is bound
				TableUtils.whenBound(oTable)
					.then(handleTableModifications)
					.catch(function (oError: any) {
						Log.error("Error while waiting for the table to be bound", oError);
					});
			});

			// should be called only after binding is ready hence calling it in onAfterBinding
			(oObjectPage as any)._triggerVisibleSubSectionsEvents();

			//To Compute the Edit Binding of the subObject page using root object page, create a context for draft root and update the edit button in sub OP using the context
			ActionRuntime.updateEditButtonVisibilityAndEnablement(this.getView());
		}
	}

	@publicExtension()
	@extensible(OverrideExecution.After)
	onPageReady(mParameters: any) {
		const setFocus = () => {
			// Set the focus to the first action button, or to the first editable input if in editable mode
			const oObjectPage = this._getObjectPageLayoutControl();
			const isInDisplayMode = !oObjectPage.getModel("ui").getProperty("/isEditable");

			if (isInDisplayMode) {
				const oFirstClickableElement = this._getFirstClickableElement(oObjectPage);
				if (oFirstClickableElement) {
					oFirstClickableElement.focus();
				}
			} else {
				const oSelectedSection: any = Core.byId(oObjectPage.getSelectedSection());
				if (oSelectedSection) {
					this._updateFocusInEditMode(oSelectedSection.getSubSections());
				}
			}
		};
		// Apply app state only after the page is ready with the first section selected
		const oView = this.getView();
		const oInternalModelContext = oView.getBindingContext("internal") as InternalModelContext;
		const oBindingContext = oView.getBindingContext();
		//Show popup while navigating back from object page in case of draft
		if (oBindingContext) {
			const bIsStickyMode = ModelHelper.isStickySessionSupported((oBindingContext.getModel() as ODataModel).getMetaModel());
			if (!bIsStickyMode) {
				const oAppComponent = CommonUtils.getAppComponent(oView);
				oAppComponent.getShellServices().setBackNavigation(() => this._onBackNavigationInDraft(oBindingContext));
			}
		}
		const viewId = this.getView().getId();
		this.getAppComponent()
			.getAppStateHandler()
			.applyAppState(viewId, this.getView())
			.then(() => {
				if (mParameters.forceFocus) {
					setFocus();
				}
			})
			.catch(function (Error) {
				Log.error("Error while setting the focus", Error);
			});

		oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
		this._checkDataPointTitleForExternalNavigation();
	}

	/**
	 * Get the status of edit mode for sticky session.
	 *
	 * @returns The status of edit mode for sticky session
	 */
	getStickyEditMode() {
		const oBindingContext = this.getView().getBindingContext && (this.getView().getBindingContext() as Context);
		let bIsStickyEditMode = false;
		if (oBindingContext) {
			const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
			if (bIsStickyMode) {
				bIsStickyEditMode = this.getView().getModel("ui").getProperty("/isEditable");
			}
		}
		return bIsStickyEditMode;
	}

	_getObjectPageLayoutControl() {
		return this.byId("fe::ObjectPage") as ObjectPageLayout;
	}

	_getPageTitleInformation() {
		const oObjectPage = this._getObjectPageLayoutControl();
		const oObjectPageSubtitle = oObjectPage.getCustomData().find(function (oCustomData: any) {
			return oCustomData.getKey() === "ObjectPageSubtitle";
		});
		return {
			title: oObjectPage.data("ObjectPageTitle") || "",
			subtitle: oObjectPageSubtitle && oObjectPageSubtitle.getValue(),
			intent: "",
			icon: ""
		};
	}

	_executeHeaderShortcut(sId: any) {
		const sButtonId = `${this.getView().getId()}--${sId}`,
			oButton = (this._getObjectPageLayoutControl().getHeaderTitle() as ObjectPageDynamicHeaderTitle)
				.getActions()
				.find(function (oElement: any) {
					return oElement.getId() === sButtonId;
				});
		if (oButton) {
			CommonUtils.fireButtonPress(oButton);
		}
	}

	_executeFooterShortcut(sId: any) {
		const sButtonId = `${this.getView().getId()}--${sId}`,
			oButton = (this._getObjectPageLayoutControl().getFooter() as any).getContent().find(function (oElement: any) {
				return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
			});
		CommonUtils.fireButtonPress(oButton);
	}

	_executeTabShortCut(oExecution: any) {
		const oObjectPage = this._getObjectPageLayoutControl(),
			aSections = oObjectPage.getSections(),
			iSectionIndexMax = aSections.length - 1,
			sCommand = oExecution.oSource.getCommand();
		let newSection,
			iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection()) as ObjectPageSection);
		if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
			if (sCommand === "NextTab") {
				if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
					newSection = aSections[++iSelectedSectionIndex];
				}
			} else if (iSelectedSectionIndex !== 0) {
				// PreviousTab
				newSection = aSections[--iSelectedSectionIndex];
			}

			if (newSection) {
				oObjectPage.setSelectedSection(newSection);
				newSection.focus();
			}
		}
	}

	_getFooterVisibility() {
		const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
		const sViewId = this.getView().getId();
		oInternalModelContext.setProperty("messageFooterContainsErrors", false);
		sap.ui
			.getCore()
			.getMessageManager()
			.getMessageModel()
			.getData()
			.forEach(function (oMessage: any) {
				if (oMessage.validation && oMessage.type === "Error" && oMessage.target.indexOf(sViewId) > -1) {
					oInternalModelContext.setProperty("messageFooterContainsErrors", true);
				}
			});
	}

	_showMessagePopover(err?: any, oRet?: any) {
		if (err) {
			Log.error(err);
		}
		const rootViewController = this.getAppComponent().getRootViewController() as any;
		const currentPageView = rootViewController.isFclEnabled()
			? rootViewController.getRightmostView()
			: (this.getAppComponent().getRootContainer() as any).getCurrentPage();
		if (!currentPageView.isA("sap.m.MessagePage")) {
			const oMessageButton = this.messageButton,
				oMessagePopover = oMessageButton.oMessagePopover,
				oItemBinding = oMessagePopover.getBinding("items");

			if (oItemBinding.getLength() > 0 && !oMessagePopover.isOpen()) {
				oMessageButton.setVisible(true);
				// workaround to ensure that oMessageButton is rendered when openBy is called
				setTimeout(function () {
					oMessagePopover.openBy(oMessageButton);
				}, 0);
			}
		}
		return oRet;
	}

	_editDocument(oContext: any) {
		const oModel = this.getView().getModel("ui");
		BusyLocker.lock(oModel);
		return this.editFlow.editDocument.apply(this.editFlow, [oContext]).finally(function () {
			BusyLocker.unlock(oModel);
		});
	}

	/**
	 * Gets the context of the DraftRoot path.
	 * If a view has been created with the draft Root Path, this method returns its bindingContext.
	 * Where no view is found a new created context is returned.
	 * The new created context request the key of the entity in order to get the Etag of this entity.
	 *
	 * @function
	 * @name getDraftRootPath
	 * @returns Returns a Promise
	 */
	async getDraftRootContext(): Promise<Context | undefined> {
		const view = this.getView();
		const context = view.getBindingContext() as Context;
		if (context) {
			const draftRootContextPath = ModelHelper.getDraftRootPath(context);
			let simpleDraftRootContext: Context;
			if (draftRootContextPath) {
				// Check if a view matches with the draft root path
				const existingBindingContextOnPage = this.getAppComponent()
					.getRootViewController()
					.getInstancedViews()
					.find((pageView: View) => pageView.getBindingContext()?.getPath() === draftRootContextPath)
					?.getBindingContext() as Context;
				if (existingBindingContextOnPage) {
					return existingBindingContextOnPage;
				}
				const internalModel = view.getModel("internal") as JSONModel;
				simpleDraftRootContext = internalModel.getProperty("/simpleDraftRootContext");
				if (simpleDraftRootContext?.getPath() === draftRootContextPath) {
					return simpleDraftRootContext;
				}
				const model = context.getModel();
				simpleDraftRootContext = model.bindContext(draftRootContextPath).getBoundContext();
				await CommonUtils.waitForContextRequested(simpleDraftRootContext);
				// Store this new created context to use it on the next iterations
				internalModel.setProperty("/simpleDraftRootContext", simpleDraftRootContext);
				return simpleDraftRootContext;
			}
			return undefined;
		}
		return undefined;
	}

	async _validateDocument(): Promise<void | any[] | ODataContextBinding> {
		const appComponent = this.getAppComponent();
		const control = Core.byId(Core.getCurrentFocusedControlId());
		const context = control?.getBindingContext() as Context | undefined;
		if (context && !context.isTransient()) {
			const sideEffectsService = appComponent.getSideEffectsService();
			const entityType = sideEffectsService.getEntityTypeFromContext(context);
			const globalSideEffects = entityType ? sideEffectsService.getGlobalODataEntitySideEffects(entityType) : [];
			// If there is at least one global SideEffects for the related entity, execute it/them
			if (globalSideEffects.length) {
				await this.editFlow.syncTask();
				return Promise.all(globalSideEffects.map((sideEffects) => this._sideEffects.requestSideEffects(sideEffects, context)));
			}
			const draftRootContext = await this.getDraftRootContext();
			//Execute the draftValidation if there is no globalSideEffects (ignore ETags in collaboration draft)
			if (draftRootContext) {
				await this.editFlow.syncTask();
				return draft.executeDraftValidation(draftRootContext, appComponent, isConnected(this.getView()));
			}
		}
		return undefined;
	}

	async _saveDocument(oContext: any) {
		const oModel = this.getView().getModel("ui"),
			aWaitCreateDocuments: any[] = [];
		// indicates if we are creating a new row in the OP
		let bExecuteSideEffectsOnError = false;
		BusyLocker.lock(oModel);
		this._findTables().forEach((oTable: any) => {
			const oBinding = this._getTableBinding(oTable);
			const mParameters: any = {
				creationMode: oTable.data("creationMode"),
				creationRow: oTable.getCreationRow(),
				createAtEnd: oTable.data("createAtEnd") === "true"
			};
			const bCreateDocument =
				mParameters.creationRow &&
				mParameters.creationRow.getBindingContext() &&
				Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
			if (bCreateDocument) {
				// the bSkipSideEffects is a parameter created when we click the save key. If we press this key
				// we don't execute the handleSideEffects funciton to avoid batch redundancy
				mParameters.bSkipSideEffects = true;
				bExecuteSideEffectsOnError = true;
				aWaitCreateDocuments.push(
					this.editFlow.createDocument(oBinding, mParameters).then(function () {
						return oBinding;
					})
				);
			}
		});

		try {
			const aBindings = await Promise.all(aWaitCreateDocuments);
			const mParameters = {
				bExecuteSideEffectsOnError: bExecuteSideEffectsOnError,
				bindings: aBindings
			};
			// We need to either reject or resolve a promise here and return it since this save
			// function is not only called when pressing the save button in the footer, but also
			// when the user selects create or save in a dataloss popup.
			// The logic of the dataloss popup needs to detect if the save had errors or not in order
			// to decide if the subsequent action - like a back navigation - has to be executed or not.
			try {
				await this.editFlow.saveDocument(oContext, mParameters);
			} catch (error: any) {
				// If the saveDocument in editFlow returns errors we need
				// to show the message popover here and ensure that the
				// dataloss logic does not perform the follow up function
				// like e.g. a back navigation hence we return a promise and reject it
				this._showMessagePopover(error);
				throw error;
			}
		} finally {
			if (BusyLocker.isLocked(oModel)) {
				BusyLocker.unlock(oModel);
			}
		}
	}

	_manageCollaboration() {
		openManageDialog(this.getView());
	}

	_showCollaborationUserDetails(event: any) {
		showUserDetails(event, this.getView());
	}

	_cancelDocument(oContext: any, mParameters: any) {
		mParameters.cancelButton = this.getView().byId(mParameters.cancelButton); //to get the reference of the cancel button from command execution
		return this.editFlow.cancelDocument(oContext, mParameters);
	}

	_applyDocument(oContext: any) {
		return this.editFlow.applyDocument(oContext).catch(() => this._showMessagePopover());
	}

	_updateRelatedApps() {
		const oObjectPage = this._getObjectPageLayoutControl();
		const showRelatedApps = oObjectPage.data("showRelatedApps");
		if (showRelatedApps === "true" || showRelatedApps === true) {
			const appComponent = CommonUtils.getAppComponent(this.getView());
			CommonUtils.updateRelatedAppsDetails(oObjectPage, appComponent);
		}
	}

	_findControlInSubSection(aParentElement: any, aSubsection: any, aControls: any, bIsChart?: boolean) {
		for (let element = 0; element < aParentElement.length; element++) {
			let oElement = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent();
			if (bIsChart) {
				if (oElement && oElement.mAggregations && oElement.getAggregation("items")) {
					const aItems = oElement.getAggregation("items");
					aItems.forEach(function (oItem: any) {
						if (oItem.isA("sap.fe.macros.chart.ChartAPI")) {
							oElement = oItem;
						}
					});
				}
			}
			if (oElement && oElement.isA && oElement.isA("sap.ui.layout.DynamicSideContent")) {
				oElement = oElement.getMainContent instanceof Function && oElement.getMainContent();
				if (oElement && oElement.length > 0) {
					oElement = oElement[0];
				}
			}
			// The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
			// control from the custom data of the place holder panel
			if (oElement && oElement.isA && oElement.isA("sap.m.Panel") && oElement.data("FullScreenTablePlaceHolder")) {
				oElement = oElement.data("tableAPIreference");
			}
			if (oElement && oElement.isA && oElement.isA("sap.fe.macros.table.TableAPI")) {
				oElement = oElement.getContent instanceof Function && oElement.getContent();
				if (oElement && oElement.length > 0) {
					oElement = oElement[0];
				}
			}
			if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Table")) {
				aControls.push(oElement);
			}
			if (oElement && oElement.isA && oElement.isA("sap.fe.macros.chart.ChartAPI")) {
				oElement = oElement.getContent instanceof Function && oElement.getContent();
				if (oElement && oElement.length > 0) {
					oElement = oElement[0];
				}
			}
			if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Chart")) {
				aControls.push(oElement);
			}
		}
	}

	_getAllSubSections() {
		const oObjectPage = this._getObjectPageLayoutControl();
		let aSubSections: any[] = [];
		oObjectPage.getSections().forEach(function (oSection: any) {
			aSubSections = aSubSections.concat(oSection.getSubSections());
		});
		return aSubSections;
	}

	_getAllBlocks() {
		let aBlocks: any[] = [];
		this._getAllSubSections().forEach(function (oSubSection: any) {
			aBlocks = aBlocks.concat(oSubSection.getBlocks());
		});
		return aBlocks;
	}

	_findTables() {
		const aSubSections = this._getAllSubSections();
		const aTables: any[] = [];
		for (let subSection = 0; subSection < aSubSections.length; subSection++) {
			this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aTables);
			this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aTables);
		}
		return aTables;
	}

	_findCharts() {
		const aSubSections = this._getAllSubSections();
		const aCharts: any[] = [];
		for (let subSection = 0; subSection < aSubSections.length; subSection++) {
			this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aCharts, true);
			this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aCharts, true);
		}
		return aCharts;
	}

	_closeSideContent() {
		this._getAllBlocks().forEach(function (oBlock: any) {
			const oContent = oBlock.getContent instanceof Function && oBlock.getContent();
			if (oContent && oContent.isA && oContent.isA("sap.ui.layout.DynamicSideContent")) {
				if (oContent.setShowSideContent instanceof Function) {
					oContent.setShowSideContent(false);
				}
			}
		});
	}

	/**
	 * Chart Context is resolved for 1:n microcharts.
	 *
	 * @param oChartContext The Context of the MicroChart
	 * @param sChartPath The collectionPath of the the chart
	 * @returns Array of Attributes of the chart Context
	 */
	_getChartContextData(oChartContext: any, sChartPath: string) {
		const oContextData = oChartContext.getObject();
		let oChartContextData = [oContextData];
		if (oChartContext && sChartPath) {
			if (oContextData[sChartPath]) {
				oChartContextData = oContextData[sChartPath];
				delete oContextData[sChartPath];
				oChartContextData.push(oContextData);
			}
		}
		return oChartContextData;
	}

	/**
	 * Scroll the tables to the row with the sPath
	 *
	 * @function
	 * @name sap.fe.templates.ObjectPage.ObjectPageController.controller#_scrollTablesToRow
	 * @param {string} sRowPath 'sPath of the table row'
	 */

	_scrollTablesToRow(sRowPath: string) {
		if (this._findTables && this._findTables().length > 0) {
			const aTables = this._findTables();
			for (let i = 0; i < aTables.length; i++) {
				TableScroller.scrollTableToRow(aTables[i], sRowPath);
			}
		}
	}

	/**
	 * Method to merge selected contexts and filters.
	 *
	 * @function
	 * @name _mergeMultipleContexts
	 * @param oPageContext Page context
	 * @param aLineContext Selected Contexts
	 * @param sChartPath Collection name of the chart
	 * @returns Selection Variant Object
	 */
	_mergeMultipleContexts(oPageContext: Context, aLineContext: any[], sChartPath: string) {
		let aAttributes: any[] = [],
			aPageAttributes = [],
			oContext,
			sMetaPathLine: string,
			sPathLine;

		const sPagePath = oPageContext.getPath();
		const oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
		const sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

		// Get single line context if necessary
		if (aLineContext && aLineContext.length) {
			oContext = aLineContext[0];
			sPathLine = oContext.getPath();
			sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");

			aLineContext.forEach((oSingleContext: any) => {
				if (sChartPath) {
					const oChartContextData = this._getChartContextData(oSingleContext, sChartPath);
					if (oChartContextData) {
						aAttributes = oChartContextData.map(function (oSubChartContextData: any) {
							return {
								contextData: oSubChartContextData,
								entitySet: `${sMetaPathPage}/${sChartPath}`
							};
						});
					}
				} else {
					aAttributes.push({
						contextData: oSingleContext.getObject(),
						entitySet: sMetaPathLine
					});
				}
			});
		}
		aPageAttributes.push({
			contextData: oPageContext.getObject(),
			entitySet: sMetaPathPage
		});
		// Adding Page Context to selection variant
		aPageAttributes = this._intentBasedNavigation.removeSensitiveData(aPageAttributes, sMetaPathPage);
		const oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, this.getView());
		aAttributes = this._intentBasedNavigation.removeSensitiveData(aAttributes, sMetaPathPage);
		return {
			selectionVariant: oPageLevelSV,
			attributes: aAttributes
		};
	}

	_getBatchGroupsForView() {
		const oViewData = this.getView().getViewData() as any,
			oConfigurations = oViewData.controlConfiguration,
			aConfigurations = oConfigurations && Object.keys(oConfigurations),
			aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];

		if (aConfigurations && aConfigurations.length > 0) {
			aConfigurations.forEach(function (sKey: any) {
				const oConfiguration = oConfigurations[sKey];
				if (oConfiguration.requestGroupId === "LongRunners") {
					aBatchGroups.push("$auto.LongRunners");
				}
			});
		}
		return aBatchGroups;
	}

	/*
	 * Reset Breadcrumb links
	 *
	 * @function
	 * @param {sap.m.Breadcrumbs} [oSource] parent control
	 * @description Used when context of the object page changes.
	 *              This event callback is attached to modelContextChange
	 *              event of the Breadcrumb control to catch context change.
	 *              Then element binding and hrefs are updated for each link.
	 *
	 * @ui5-restricted
	 * @experimental
	 */
	async _setBreadcrumbLinks(oSource: BreadCrumbs) {
		const oContext = oSource.getBindingContext(),
			oAppComponent = this.getAppComponent(),
			aPromises: Promise<void>[] = [],
			aSkipParameterized: any[] = [],
			sNewPath = oContext?.getPath(),
			aPathParts = sNewPath?.split("/") ?? [],
			oMetaModel = oAppComponent && oAppComponent.getMetaModel();
		let sPath = "";
		try {
			aPathParts.shift();
			aPathParts.splice(-1, 1);
			aPathParts.forEach(function (sPathPart: any) {
				sPath += `/${sPathPart}`;
				const oRootViewController = oAppComponent.getRootViewController();
				const sParameterPath = oMetaModel.getMetaPath(sPath);
				const bResultContext = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
				if (bResultContext) {
					// We dont need to create a breadcrumb for Parameter path
					aSkipParameterized.push(1);
					return;
				} else {
					aSkipParameterized.push(0);
				}
				aPromises.push(oRootViewController.getTitleInfoFromPath(sPath));
			});
			const titleHierarchyInfos: any[] = await Promise.all(aPromises);
			let idx, hierarchyPosition, oLink;
			for (const titleHierarchyInfo of titleHierarchyInfos) {
				hierarchyPosition = titleHierarchyInfos.indexOf(titleHierarchyInfo);
				idx = hierarchyPosition - aSkipParameterized[hierarchyPosition];
				oLink = oSource.getLinks()[idx] ? oSource.getLinks()[idx] : new Link();
				//sCurrentEntity is a fallback value in case of empty title
				oLink.setText(titleHierarchyInfo.subtitle || titleHierarchyInfo.title);
				//We apply an additional encodeURI in case of special characters (ie "/") used in the url through the semantic keys
				oLink.setHref(encodeURI(titleHierarchyInfo.intent));
				if (!oSource.getLinks()[idx]) {
					oSource.addLink(oLink);
				}
			}
		} catch (error: any) {
			Log.error("Error while setting the breadcrumb links:" + error);
		}
	}

	_checkDataPointTitleForExternalNavigation() {
		const oView = this.getView();
		const oInternalModelContext = oView.getBindingContext("internal") as InternalModelContext;
		const oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(
			oView.getViewData() as Record<string, unknown>,
			this.getAppComponent().getRoutingService().getOutbounds()
		);
		const oShellServices = this.getAppComponent().getShellServices();
		const oPageContext = oView && (oView.getBindingContext() as Context);
		oInternalModelContext.setProperty("isHeaderDPLinkVisible", {});
		if (oPageContext) {
			oPageContext
				.requestObject()
				.then(function (oData: any) {
					fnGetLinks(oDataPoints, oData);
				})
				.catch(function (oError: any) {
					Log.error("Cannot retrieve the links from the shell service", oError);
				});
		}

		/**
		 * @param oError
		 */
		function fnOnError(oError: any) {
			Log.error(oError);
		}

		function fnSetLinkEnablement(id: string, aSupportedLinks: any) {
			const sLinkId = id;
			// process viable links from getLinks for all datapoints having outbound
			if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
				oInternalModelContext.setProperty(`isHeaderDPLinkVisible/${sLinkId}`, true);
			}
		}

		/**
		 * @param oSubDataPoints
		 * @param oPageData
		 */
		function fnGetLinks(oSubDataPoints: any, oPageData: any) {
			for (const sId in oSubDataPoints) {
				const oDataPoint = oSubDataPoints[sId];
				const oParams: any = {};
				const oLink = oView.byId(sId);
				if (!oLink) {
					// for data points configured in app descriptor but not annotated in the header
					continue;
				}
				const oLinkContext = oLink.getBindingContext();
				const oLinkData: any = oLinkContext && oLinkContext.getObject();
				let oMixedContext: any = merge({}, oPageData, oLinkData);
				// process semantic object mappings
				if (oDataPoint.semanticObjectMapping) {
					const aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
					for (const item in aSemanticObjectMapping) {
						const oMapping = aSemanticObjectMapping[item];
						const sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
						const sMappedProperty = oMapping["SemanticObjectProperty"];
						if (sMainProperty !== sMappedProperty) {
							if (oMixedContext.hasOwnProperty(sMainProperty)) {
								const oNewMapping: any = {};
								oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
								oMixedContext = merge({}, oMixedContext, oNewMapping);
								delete oMixedContext[sMainProperty];
							}
						}
					}
				}

				if (oMixedContext) {
					for (const sKey in oMixedContext) {
						if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
							oParams[sKey] = oMixedContext[sKey];
						}
					}
				}
				// validate if a link must be rendered
				oShellServices
					.isNavigationSupported([
						{
							target: {
								semanticObject: oDataPoint.semanticObject,
								action: oDataPoint.action
							},
							params: oParams
						}
					])
					.then((aLinks) => {
						return fnSetLinkEnablement(sId, aLinks);
					})
					.catch(fnOnError);
			}
		}
	}

	handlers = {
		/**
		 * Invokes the page primary action on press of Ctrl+Enter.
		 *
		 * @param oController The page controller
		 * @param oView
		 * @param oContext Context for which the action is called
		 * @param sActionName The name of the action to be called
		 * @param [mParameters] Contains the following attributes:
		 * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
		 * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
		 * @param [mConditions] Contains the following attributes:
		 * @param [mConditions.positiveActionVisible] The visibility of sematic positive action
		 * @param [mConditions.positiveActionEnabled] The enablement of semantic positive action
		 * @param [mConditions.editActionVisible] The Edit button visibility
		 * @param [mConditions.editActionEnabled] The enablement of Edit button
		 * @ui5-restricted
		 * @final
		 */
		onPrimaryAction(
			oController: ObjectPageController,
			oView: View,
			oContext: Context,
			sActionName: string,
			mParameters: unknown,
			mConditions: {
				positiveActionVisible: boolean;
				positiveActionEnabled: boolean;
				editActionVisible: boolean;
				editActionEnabled: boolean;
			}
		) {
			const iViewLevel = (oController.getView().getViewData() as any).viewLevel,
				oObjectPage = oController._getObjectPageLayoutControl();
			if (mConditions.positiveActionVisible) {
				if (mConditions.positiveActionEnabled) {
					oController.handlers.onCallAction(oView, sActionName, mParameters);
				}
			} else if (mConditions.editActionVisible) {
				if (mConditions.editActionEnabled) {
					oController._editDocument(oContext);
				}
			} else if (iViewLevel === 1 && oObjectPage.getModel("ui").getProperty("/isEditable")) {
				oController._saveDocument(oContext);
			} else if (oObjectPage.getModel("ui").getProperty("/isEditable")) {
				oController._applyDocument(oContext);
			}
		},

		onTableContextChange(this: ObjectPageController, oEvent: any) {
			const oSource = oEvent.getSource();
			let oTable: any;
			this._findTables().some(function (_oTable: any) {
				if (_oTable.getRowBinding() === oSource) {
					oTable = _oTable;
					return true;
				}
				return false;
			});

			// set correct binding context for fast creation row
			const fastCreationRow = oTable.getCreationRow();

			if (fastCreationRow && !fastCreationRow._oInnerCreationRow?.getBindingContext()) {
				const tableBinding = this._getTableBinding(oTable);

				if (!tableBinding) {
					Log.error(`Expected binding missing for table: ${oTable.getId()}`);
					return;
				}

				if (tableBinding.getContext()) {
					const objectPage = this._getObjectPageLayoutControl();
					const bindingContext = objectPage.getBindingContext() as Context;
					const model = bindingContext.getModel();

					TableHelper.enableFastCreationRow(
						fastCreationRow,
						tableBinding.getPath(),
						tableBinding.getContext(),
						model,
						oTable.getModel("ui").getProperty("/isEditable")
					);
				}
			}

			const oCurrentActionPromise = this.editFlow.getCurrentActionPromise();

			if (oCurrentActionPromise) {
				let aTableContexts: any;
				if (oTable.getType().getMetadata().isA("sap.ui.mdc.table.GridTableType")) {
					aTableContexts = oSource.getContexts(0);
				} else {
					aTableContexts = oSource.getCurrentContexts();
				}
				//if contexts are not fully loaded the getcontexts function above will trigger a new change event call
				if (!aTableContexts[0]) {
					return;
				}
				oCurrentActionPromise
					.then((oActionResponse: any) => {
						if (!oActionResponse || oActionResponse.controlId !== oTable.sId) {
							return;
						}
						const oActionData = oActionResponse.oData;
						const aKeys = oActionResponse.keys;
						let iNewItemp = -1;
						aTableContexts.find(function (oTableContext: any, i: any) {
							const oTableData = oTableContext.getObject();
							const bCompare = aKeys.every(function (sKey: any) {
								return oTableData[sKey] === oActionData[sKey];
							});
							if (bCompare) {
								iNewItemp = i;
							}
							return bCompare;
						});
						if (iNewItemp !== -1) {
							const aDialogs = InstanceManager.getOpenDialogs();
							const oDialog =
								aDialogs.length > 0 ? aDialogs.find((dialog) => dialog.data("FullScreenDialog") !== true) : null;
							if (oDialog) {
								// by design, a sap.m.dialog set the focus to the previous focused element when closing.
								// we should wait for the dialog to be close before to focus another element
								oDialog.attachEventOnce("afterClose", function () {
									oTable.focusRow(iNewItemp, true);
								});
							} else {
								oTable.focusRow(iNewItemp, true);
							}
							this.editFlow.deleteCurrentActionPromise();
						}
					})
					.catch(function (err: any) {
						Log.error(`An error occurs while scrolling to the newly created Item: ${err}`);
					});
			}
			// fire ModelContextChange on the message button whenever the table context changes
			this.messageButton.fireModelContextChange();
		},

		/**
		 * Invokes an action - bound/unbound and sets the page dirty.
		 *
		 * @param oView
		 * @param sActionName The name of the action to be called
		 * @param [mParameters] Contains the following attributes:
		 * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
		 * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
		 * @returns The action promise
		 * @ui5-restricted
		 * @final
		 */
		onCallAction(oView: any, sActionName: string, mParameters: any) {
			const oController = oView.getController();
			return oController.editFlow
				.invokeAction(sActionName, mParameters)
				.then(oController._showMessagePopover.bind(oController, undefined))
				.catch(oController._showMessagePopover.bind(oController));
		},
		onDataPointTitlePressed(oController: any, oSource: any, oManifestOutbound: any, sControlConfig: any, sCollectionPath: any) {
			oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
			const oTargetInfo = oManifestOutbound[sControlConfig],
				aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo),
				oDataPointOrChartBindingContext = oSource.getBindingContext(),
				sMetaPath = oDataPointOrChartBindingContext
					.getModel()
					.getMetaModel()
					.getMetaPath(oDataPointOrChartBindingContext.getPath());
			let aNavigationData = oController._getChartContextData(oDataPointOrChartBindingContext, sCollectionPath);
			let additionalNavigationParameters;

			aNavigationData = aNavigationData.map(function (oNavigationData: any) {
				return {
					data: oNavigationData,
					metaPath: sMetaPath + (sCollectionPath ? `/${sCollectionPath}` : "")
				};
			});
			if (oTargetInfo && oTargetInfo.parameters) {
				const oParams = oTargetInfo.parameters && oController._intentBasedNavigation.getOutboundParams(oTargetInfo.parameters);
				if (Object.keys(oParams).length > 0) {
					additionalNavigationParameters = oParams;
				}
			}
			if (oTargetInfo && oTargetInfo.semanticObject && oTargetInfo.action) {
				oController._intentBasedNavigation.navigate(oTargetInfo.semanticObject, oTargetInfo.action, {
					navigationContexts: aNavigationData,
					semanticObjectMapping: aSemanticObjectMapping,
					additionalNavigationParameters: additionalNavigationParameters
				});
			}
		},
		/**
		 * Triggers an outbound navigation when a user chooses the chevron.
		 *
		 * @param oController
		 * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
		 * @param oContext The context that contains the data for the target app
		 * @param sCreatePath Create path when the chevron is created.
		 * @returns Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
		 * @ui5-restricted
		 * @final
		 */
		onChevronPressNavigateOutBound(oController: ObjectPageController, sOutboundTarget: string, oContext: any, sCreatePath: string) {
			return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
		},

		onNavigateChange(this: ObjectPageController, oEvent: any) {
			//will be called always when we click on a section tab
			this.getExtensionAPI().updateAppState();
			this.bSectionNavigated = true;

			const oInternalModelContext = this.getView().getBindingContext("internal") as InternalModelContext;
			const oObjectPage = this._getObjectPageLayoutControl();
			if (
				oObjectPage.getModel("ui").getProperty("/isEditable") &&
				(this.getView().getViewData() as any).sectionLayout === "Tabs" &&
				oInternalModelContext.getProperty("errorNavigationSectionFlag") === false
			) {
				const oSubSection = oEvent.getParameter("subSection");
				this._updateFocusInEditMode([oSubSection]);
			}
		},
		onVariantSelected: function (this: ObjectPageController) {
			this.getExtensionAPI().updateAppState();
		},
		onVariantSaved: function (this: ObjectPageController) {
			//TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
			setTimeout(() => {
				this.getExtensionAPI().updateAppState();
			}, 2000);
		},
		navigateToSubSection: function (oController: ObjectPageController, vDetailConfig: any) {
			const oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig;
			const oObjectPage = oController.getView().byId("fe::ObjectPage") as ObjectPageLayout;
			let oSection;
			let oSubSection;
			if (oDetailConfig.sectionId) {
				oSection = oController.getView().byId(oDetailConfig.sectionId) as ObjectPageSection;
				oSubSection = (
					oDetailConfig.subSectionId
						? oController.getView().byId(oDetailConfig.subSectionId)
						: oSection && oSection.getSubSections() && oSection.getSubSections()[0]
				) as ObjectPageSubSection;
			} else if (oDetailConfig.subSectionId) {
				oSubSection = oController.getView().byId(oDetailConfig.subSectionId) as ObjectPageSubSection;
				oSection = oSubSection && (oSubSection.getParent() as ObjectPageSection);
			}
			if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
				const sTitle = getResourceModel(oController).getText(
					"C_ROUTING_NAVIGATION_DISABLED_TITLE",
					undefined,
					(oController.getView().getViewData() as any).entitySet
				);
				Log.error(sTitle);
				MessageBox.error(sTitle);
			} else {
				oObjectPage.scrollToSection(oSubSection.getId());
				// trigger iapp state change
				oObjectPage.fireNavigate({
					section: oSection,
					subSection: oSubSection
				});
			}
		},

		onStateChange(this: ObjectPageController) {
			this.getExtensionAPI().updateAppState();
		},
		closeOPMessageStrip: function (this: ObjectPageController) {
			this.getExtensionAPI().hideMessage();
		}
	};
}

export default ObjectPageController;
