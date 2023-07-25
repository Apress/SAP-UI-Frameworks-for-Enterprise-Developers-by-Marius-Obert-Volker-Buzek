import type { EntitySet } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import ActivitySync from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import { Activity, shareObject } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import type { SiblingInformation } from "sap/fe/core/controllerextensions/editFlow/draft";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import sticky from "sap/fe/core/controllerextensions/editFlow/sticky";
import TransactionHelper from "sap/fe/core/controllerextensions/editFlow/TransactionHelper";
import { StandardActions, triggerConfiguredSurvey, TriggerType } from "sap/fe/core/controllerextensions/Feedback";
import type InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import { convertTypes, getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { defineUI5Class, extensible, finalExtension, publicExtension } from "sap/fe/core/helpers/ClassSupport";
import EditState from "sap/fe/core/helpers/EditState";
import { getNonComputedVisibleFields } from "sap/fe/core/helpers/MetaModelFunction";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import SemanticKeyHelper from "sap/fe/core/helpers/SemanticKeyHelper";
import FELibrary from "sap/fe/core/library";
import type PageController from "sap/fe/core/PageController";
import ResourceModel from "sap/fe/core/ResourceModel";
import type { SemanticMapping } from "sap/fe/core/services/RoutingServiceFactory";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";
import Text from "sap/m/Text";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import coreLibrary from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type Table from "sap/ui/mdc/Table";
import type Binding from "sap/ui/model/Binding";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Model from "sap/ui/model/Model";
import type Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ActionRuntime from "../ActionRuntime";
import type { BaseManifestSettings } from "../converters/ManifestSettings";

const CreationMode = FELibrary.CreationMode,
	ProgrammingModel = FELibrary.ProgrammingModel,
	Constants = FELibrary.Constants,
	DraftStatus = FELibrary.DraftStatus,
	EditMode = FELibrary.EditMode,
	StartupMode = FELibrary.StartupMode,
	MessageType = coreLibrary.MessageType;

/**
 * A controller extension offering hooks into the edit flow of the application
 *
 * @hideconstructor
 * @public
 * @since 1.90.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.EditFlow")
class EditFlow extends ControllerExtension {
	protected base!: PageController;

	private dirtyStateProviderFunction?: Function;

	private sessionTimeoutFunction?: Function;

	private stickyDiscardAfterNavigationFunction?: Function;

	private syncTasks: Promise<any> = Promise.resolve();

	private actionPromise?: Promise<any>;

	//////////////////////////////////////
	// Public methods
	//////////////////////////////////////

	getAppComponent(): AppComponent {
		return this.base.getAppComponent();
	}

	/**
	 * Creates a draft document for an existing active document.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oContext Context of the active document
	 * @returns Promise resolves once the editable document is available
	 * @alias sap.fe.core.controllerextensions.EditFlow#editDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	async editDocument(oContext: Context): Promise<void> {
		const bDraftNavigation = true;
		const transactionHelper = this.getTransactionHelper();
		const oRootViewController = this._getRootViewController() as any;
		const model = oContext.getModel();
		let rightmostContext, siblingInfo;
		const oViewData = this.getView().getViewData() as BaseManifestSettings;
		const sProgrammingModel = this.getProgrammingModel(oContext);
		let oRootContext: Context = oContext;
		const oView = this.getView();
		try {
			if ((oViewData?.viewLevel as number) > 1) {
				if (sProgrammingModel === ProgrammingModel.Draft) {
					const draftRootPath: string | undefined = ModelHelper.getDraftRootPath(oContext);
					oRootContext = oView
						.getModel()
						.bindContext(draftRootPath as string)
						.getBoundContext() as Context;
					await oRootContext.requestObject(draftRootPath);
				} else if (sProgrammingModel === ProgrammingModel.Sticky) {
					const sStickyRootPath = ModelHelper.getStickyRootPath(oContext);
					oRootContext = oView
						.getModel()
						.bindContext(sStickyRootPath as string)
						.getBoundContext() as Context;
					await oRootContext.requestObject(sStickyRootPath);
				}
			}
			await this.base.editFlow.onBeforeEdit({ context: oRootContext });
			const oNewDocumentContext = await transactionHelper.editDocument(
				oRootContext,
				this.getView(),
				this.getAppComponent(),
				this.getMessageHandler()
			);

			this._setStickySessionInternalProperties(sProgrammingModel, model);

			if (oNewDocumentContext) {
				this.setEditMode(EditMode.Editable, false);
				this.setDocumentModified(false);
				this.getMessageHandler().showMessageDialog();

				if (oNewDocumentContext !== oRootContext) {
					let contextToNavigate: Context | undefined = oNewDocumentContext;
					if (this._isFclEnabled()) {
						rightmostContext = oRootViewController.getRightmostContext();
						siblingInfo = await this._computeSiblingInformation(oRootContext, rightmostContext, sProgrammingModel, true);
						siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oNewDocumentContext);
						this._updatePathsInHistory(siblingInfo.pathMapping);
						if (siblingInfo.targetContext.getPath() != oNewDocumentContext.getPath()) {
							contextToNavigate = siblingInfo.targetContext;
						}
					} else if ((oViewData?.viewLevel as number) > 1) {
						siblingInfo = await this._computeSiblingInformation(oRootContext, oContext, sProgrammingModel, true);
						contextToNavigate = this._getNavigationTargetForEdit(oContext, oNewDocumentContext, siblingInfo) as Context;
					}
					await this._handleNewContext(contextToNavigate, true, false, bDraftNavigation, true);
					if (sProgrammingModel === ProgrammingModel.Sticky) {
						// The stickyOn handler must be set after the navigation has been done,
						// as the URL may change in the case of FCL
						let stickyContext: Context;
						if (this._isFclEnabled()) {
							// We need to use the kept-alive context used to bind the page
							stickyContext = oNewDocumentContext.getModel().getKeepAliveContext(oNewDocumentContext.getPath());
						} else {
							stickyContext = oNewDocumentContext;
						}
						this.handleStickyOn(stickyContext);
					} else if (ModelHelper.isCollaborationDraftSupported(model.getMetaModel())) {
						// according to UX in case of enabled collaboration draft we share the object immediately
						await shareObject(oNewDocumentContext);
					}
				}
			}
		} catch (oError) {
			Log.error("Error while editing the document", oError as any);
		}
	}

	/**
	 * Deletes several documents.
	 *
	 * @param contextsToDelete The contexts of the documents to delete
	 * @param parameters The parameters
	 * @returns Promise resolved once the documents are deleted
	 */
	async deleteMultipleDocuments(contextsToDelete: Context[], parameters: any) {
		if (parameters) {
			parameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
		} else {
			parameters = {
				beforeDeleteCallBack: this.base.editFlow.onBeforeDelete
			};
		}
		const lockObject = this.getGlobalUIModel();
		const parentControl = this.getView().byId(parameters.controlId);
		if (!parentControl) {
			throw new Error("parameter controlId missing or incorrect");
		} else {
			parameters.parentControl = parentControl;
		}
		const listBinding = (parentControl.getBinding("items") || (parentControl as Table).getRowBinding()) as ODataListBinding;
		parameters.bFindActiveContexts = true;
		BusyLocker.lock(lockObject);

		try {
			await this.deleteDocumentTransaction(contextsToDelete, parameters);
			let result;

			// Multiple object deletion is triggered from a list
			// First clear the selection in the table as it's not valid any more
			if (parentControl.isA("sap.ui.mdc.Table")) {
				(parentControl as any).clearSelection();
			}

			// Then refresh the list-binding (LR), or require side-effects (OP)
			const viewBindingContext = this.getView().getBindingContext();
			if ((listBinding as any).isRoot()) {
				// keep promise chain pending until refresh of listbinding is completed
				result = new Promise<void>((resolve) => {
					listBinding.attachEventOnce("dataReceived", function () {
						resolve();
					});
				});
				listBinding.refresh();
			} else if (viewBindingContext) {
				// if there are transient contexts, we must avoid requesting side effects
				// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
				// if list binding is refreshed, transient contexts might be lost
				if (!CommonUtils.hasTransientContext(listBinding)) {
					this.getAppComponent()
						.getSideEffectsService()
						.requestSideEffectsForNavigationProperty(listBinding.getPath(), viewBindingContext as Context);
				}
			}

			// deleting at least one object should also set the UI to dirty
			if (!this.getAppComponent()._isFclEnabled()) {
				EditState.setEditStateDirty();
			}

			ActivitySync.send(
				this.getView(),
				Activity.Delete,
				contextsToDelete.map((context: Context) => context.getPath())
			);

			return result;
		} catch (error: any) {
			Log.error("Error while deleting the document(s)", error);
		} finally {
			BusyLocker.unlock(lockObject);
		}
	}

	/**
	 * Updates the draft status and displays the error messages if there are errors during an update.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param updatedContext Context of the updated field
	 * @param updatePromise Promise to determine when the update operation is completed. The promise should be resolved when the update operation is completed, so the draft status can be updated.
	 * @returns Promise resolves once draft status has been updated
	 * @alias sap.fe.core.controllerextensions.EditFlow#updateDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	updateDocument(updatedContext: object, updatePromise: Promise<any>): Promise<void> {
		const originalBindingContext = this.getView().getBindingContext();
		const isDraft = this.getProgrammingModel(updatedContext as Binding | Context) === ProgrammingModel.Draft;

		this.getMessageHandler().removeTransitionMessages();
		return this.syncTask(async () => {
			if (originalBindingContext) {
				this.setDocumentModified(true);
				if (!this._isFclEnabled()) {
					EditState.setEditStateDirty();
				}

				if (isDraft) {
					this.setDraftStatus(DraftStatus.Saving);
				}
			}

			try {
				await updatePromise;
				const currentBindingContext = this.getView().getBindingContext();
				if (!isDraft || !currentBindingContext || currentBindingContext !== originalBindingContext) {
					// If a navigation happened while oPromise was being resolved, the binding context of the page changed
					return;
				}

				// We're still on the same context
				const metaModel = currentBindingContext.getModel().getMetaModel() as ODataMetaModel;
				const entitySetName = metaModel.getMetaContext(currentBindingContext.getPath()).getObject("@sapui.name");
				const semanticKeys = SemanticKeyHelper.getSemanticKeys(metaModel, entitySetName);
				if (semanticKeys?.length) {
					const currentSemanticMapping = this._getSemanticMapping();
					const currentSemanticPath = currentSemanticMapping?.semanticPath,
						sChangedPath = SemanticKeyHelper.getSemanticPath(currentBindingContext, true);
					// currentSemanticPath could be null if we have navigated via deep link then there are no semanticMappings to calculate it from
					if (currentSemanticPath && currentSemanticPath !== sChangedPath) {
						await this._handleNewContext(currentBindingContext as Context, true, false, true);
					}
				}

				this.setDraftStatus(DraftStatus.Saved);
			} catch (error: any) {
				Log.error("Error while updating the document", error);
				if (isDraft && originalBindingContext) {
					this.setDraftStatus(DraftStatus.Clear);
				}
			} finally {
				await this.getMessageHandler().showMessages();
			}
		});
	}

	// Internal only params ---
	// * @param {string} mParameters.creationMode The creation mode using one of the following:
	// *                    Sync - the creation is triggered and once the document is created, the navigation is done
	// *                    Async - the creation and the navigation to the instance are done in parallel
	// *                    Deferred - the creation is done on the target page
	// *                    CreationRow - The creation is done inline async so the user is not blocked
	// mParameters.creationRow Instance of the creation row - (TODO: get rid but use list bindings only)

	/**
	 * Creates a new document.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param vListBinding  ODataListBinding object or the binding path for a temporary list binding
	 * @param mInParameters Contains the following attributes:
	 * @param mInParameters.creationMode The creation mode using one of the following:
	 *                    NewPage - the created document is shown in a new page, depending on whether metadata 'Sync', 'Async' or 'Deferred' is used
	 *                    Inline - The creation is done inline (in a table)
	 *                    External - The creation is done in a different application specified via the parameter 'outbound'
	 * @param mInParameters.tableId ID of the table
	 * @param mInParameters.outbound The navigation target where the document is created in case of creationMode 'External'
	 * @param mInParameters.createAtEnd Specifies if the new entry should be created at the top or bottom of a table in case of creationMode 'Inline'
	 * @returns Promise resolves once the object has been created
	 * @alias sap.fe.core.controllerextensions.EditFlow#createDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	async createDocument(
		vListBinding: ODataListBinding | string,
		mInParameters: {
			creationMode: string;
			tableId?: string;
			outbound?: string;
			createAtEnd?: boolean;
		}
	): Promise<void> {
		const transactionHelper = this.getTransactionHelper(),
			oLockObject = this.getGlobalUIModel();
		let oTable: any; //should be Table but there are missing methods into the def
		let mParameters: any = mInParameters;
		let oCreation: Promise<Context> | undefined;
		const bShouldBusyLock =
			!mParameters ||
			(mParameters.creationMode !== CreationMode.Inline &&
				mParameters.creationMode !== CreationMode.CreationRow &&
				mParameters.creationMode !== CreationMode.External);
		let oExecCustomValidation = Promise.resolve([]);
		const oAppComponent = this.getAppComponent();
		oAppComponent.getRouterProxy().removeIAppStateKey();

		if (mParameters.creationMode === CreationMode.External) {
			// Create by navigating to an external target
			// TODO: Call appropriate function (currently using the same as for outbound chevron nav, and without any context - 3rd param)
			await this.syncTask();
			const oController = this.getView().getController();
			const sCreatePath = ModelHelper.getAbsoluteMetaPathForListBinding(this.getView(), vListBinding);

			(oController as any).handlers.onChevronPressNavigateOutBound(oController, mParameters.outbound, undefined, sCreatePath);

			return;
		}

		if (mParameters.creationMode === CreationMode.CreationRow && mParameters.creationRow) {
			const oCreationRowObjects = mParameters.creationRow.getBindingContext().getObject();
			delete oCreationRowObjects["@$ui5.context.isTransient"];
			oTable = mParameters.creationRow.getParent();
			oExecCustomValidation = this.validateDocument(oTable.getBindingContext(), {
				data: oCreationRowObjects,
				customValidationFunction: oTable.getCreationRow().data("customValidationFunction")
			});

			// disableAddRowButtonForEmptyData is set to false in manifest converter (Table.ts) if customValidationFunction exists
			if (oTable.getCreationRow().data("disableAddRowButtonForEmptyData") === "true") {
				const oInternalModelContext = oTable.getBindingContext("internal") as InternalModelContext;
				oInternalModelContext.setProperty("creationRowFieldValidity", {});
			}
		}

		if (mParameters.creationMode === CreationMode.Inline && mParameters.tableId) {
			oTable = this.getView().byId(mParameters.tableId) as Table;
		}

		if (oTable && oTable.isA("sap.ui.mdc.Table")) {
			const fnFocusOrScroll =
				mParameters.creationMode === CreationMode.Inline ? oTable.focusRow.bind(oTable) : oTable.scrollToIndex.bind(oTable);
			oTable.getRowBinding().attachEventOnce("change", async function () {
				await oCreation;
				fnFocusOrScroll(mParameters.createAtEnd ? oTable.getRowBinding().getLength() : 0, true);
			});
		}

		const handleSideEffects = async (oListBinding: any, oCreationPromise: Promise<Context>) => {
			try {
				const oNewContext = await oCreationPromise;
				// transient contexts are reliably removed once oNewContext.created() is resolved
				await oNewContext.created();
				const oBindingContext = this.getView().getBindingContext() as Context;
				// if there are transient contexts, we must avoid requesting side effects
				// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
				// if list binding is refreshed, transient contexts might be lost
				if (!CommonUtils.hasTransientContext(oListBinding)) {
					const appComponent = this.getAppComponent();
					appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
				}
			} catch (oError: any) {
				Log.error("Error while creating the document", oError);
			}
		};

		/**
		 * @param aValidationMessages Error messages from custom validation function
		 */
		const createCustomValidationMessages = (aValidationMessages: any[]) => {
			const sCustomValidationFunction = oTable && oTable.getCreationRow().data("customValidationFunction");
			const mCustomValidity = oTable && oTable.getBindingContext("internal")?.getProperty("creationRowCustomValidity");
			const oMessageManager = Core.getMessageManager();
			const aCustomMessages: any[] = [];
			let oFieldControl;
			let sTarget: string;

			// Remove existing CustomValidation message
			oMessageManager
				.getMessageModel()
				.getData()
				.forEach(function (oMessage: any) {
					if (oMessage.code === sCustomValidationFunction) {
						oMessageManager.removeMessages(oMessage);
					}
				});

			aValidationMessages.forEach((oValidationMessage: any) => {
				// Handle Bound CustomValidation message
				if (oValidationMessage.messageTarget) {
					oFieldControl = Core.getControl(mCustomValidity[oValidationMessage.messageTarget].fieldId) as Control;
					sTarget = `${oFieldControl.getBindingContext()?.getPath()}/${oFieldControl.getBindingPath("value")}`;
					// Add validation message if still not exists
					if (
						oMessageManager
							.getMessageModel()
							.getData()
							.filter(function (oMessage: any) {
								return oMessage.target === sTarget;
							}).length === 0
					) {
						oMessageManager.addMessages(
							new Message({
								message: oValidationMessage.messageText,
								processor: this.getView().getModel(),
								type: MessageType.Error,
								code: sCustomValidationFunction,
								technical: false,
								persistent: false,
								target: sTarget
							})
						);
					}
					// Add controlId in order to get the focus handling of the error popover runable
					const aExistingValidationMessages = oMessageManager
						.getMessageModel()
						.getData()
						.filter(function (oMessage: any) {
							return oMessage.target === sTarget;
						});
					aExistingValidationMessages[0].addControlId(mCustomValidity[oValidationMessage.messageTarget].fieldId);

					// Handle Unbound CustomValidation message
				} else {
					aCustomMessages.push({
						code: sCustomValidationFunction,
						text: oValidationMessage.messageText,
						persistent: true,
						type: MessageType.Error
					});
				}
			});

			if (aCustomMessages.length > 0) {
				this.getMessageHandler().showMessageDialog({
					customMessages: aCustomMessages
				});
			}
		};

		const resolveCreationMode = (
			initialCreationMode: string,
			programmingModel: string,
			oListBinding: ODataListBinding,
			oMetaModel: ODataMetaModel
		): string => {
			if (initialCreationMode && initialCreationMode !== CreationMode.NewPage) {
				// use the passed creation mode
				return initialCreationMode;
			} else {
				// NewAction is not yet supported for NavigationProperty collection
				if (!oListBinding.isRelative()) {
					const sPath = oListBinding.getPath(),
						// if NewAction with parameters is present, then creation is 'Deferred'
						// in the absence of NewAction or NewAction with parameters, creation is async
						sNewAction =
							programmingModel === ProgrammingModel.Draft
								? oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`)
								: oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`);
					if (sNewAction) {
						const aParameters = oMetaModel.getObject(`/${sNewAction}/@$ui5.overload/0/$Parameter`) || [];
						// binding parameter (eg: _it) is not considered
						if (aParameters.length > 1) {
							return CreationMode.Deferred;
						}
					}
				}
				const sMetaPath = oMetaModel.getMetaPath(oListBinding?.getHeaderContext()!.getPath());
				const aNonComputedVisibleKeyFields = getNonComputedVisibleFields(oMetaModel, sMetaPath, this.getAppComponent());
				if (aNonComputedVisibleKeyFields.length > 0) {
					return CreationMode.Deferred;
				}
				return CreationMode.Async;
			}
		};

		if (bShouldBusyLock) {
			BusyLocker.lock(oLockObject);
		}
		try {
			const aValidationMessages = await this.syncTask(oExecCustomValidation);
			if (aValidationMessages.length > 0) {
				createCustomValidationMessages(aValidationMessages);
				Log.error("Custom Validation failed");
				// if custom validation fails, we leave the method immediately
				return;
			}

			let oListBinding: any;
			mParameters = mParameters || {};

			if (vListBinding && typeof vListBinding === "object") {
				// we already get a list binding use this one
				oListBinding = vListBinding;
			} else if (typeof vListBinding === "string") {
				oListBinding = new (ODataListBinding as any)(this.getView().getModel(), vListBinding);
				mParameters.creationMode = CreationMode.Sync;
				delete mParameters.createAtEnd;
			} else {
				throw new Error("Binding object or path expected");
			}

			const oModel = oListBinding.getModel();
			const sProgrammingModel: string = this.getProgrammingModel(oListBinding);
			const resolvedCreationMode = resolveCreationMode(
				mParameters.creationMode,
				sProgrammingModel,
				oListBinding,
				oModel.getMetaModel()
			);
			let mArgs: any;
			const oCreationRow = mParameters.creationRow;
			let oCreationRowContext: any;
			let oPayload: any;
			let sMetaPath: string;
			const oMetaModel = oModel.getMetaModel();
			const oRoutingListener = this.getInternalRouting();

			if (resolvedCreationMode !== CreationMode.Deferred) {
				if (resolvedCreationMode === CreationMode.CreationRow) {
					oCreationRowContext = oCreationRow.getBindingContext();
					sMetaPath = oMetaModel.getMetaPath(oCreationRowContext.getPath());
					// prefill data from creation row
					oPayload = oCreationRowContext.getObject();
					mParameters.data = {};
					Object.keys(oPayload).forEach(function (sPropertyPath: string) {
						const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
						// ensure navigation properties are not part of the payload, deep create not supported
						if (oProperty && oProperty.$kind === "NavigationProperty") {
							return;
						}
						mParameters.data[sPropertyPath] = oPayload[sPropertyPath];
					});
					await this._checkForValidationErrors(/*oCreationRowContext*/);
				}
				if (resolvedCreationMode === CreationMode.CreationRow || resolvedCreationMode === CreationMode.Inline) {
					mParameters.keepTransientContextOnFailed = false; // currently not fully supported
					// busy handling shall be done locally only
					mParameters.busyMode = "Local";
					mParameters.busyId = oTable?.getParent()?.getTableDefinition()?.annotation.id;

					// take care on message handling, draft indicator (in case of draft)
					// Attach the create sent and create completed event to the object page binding so that we can react
					this.handleCreateEvents(oListBinding);
				}

				if (!mParameters.parentControl) {
					mParameters.parentControl = this.getView();
				}
				mParameters.beforeCreateCallBack = this.onBeforeCreate;

				// In case the application was called with preferredMode=autoCreateWith, we want to skip the
				// action parameter dialog
				mParameters.skipParameterDialog = oAppComponent.getStartupMode() === StartupMode.AutoCreate;

				oCreation = transactionHelper.createDocument(
					oListBinding,
					mParameters,
					this.getAppComponent(),
					this.getMessageHandler(),
					false
				);
				// SideEffects on Create
				// if Save is pressed directly after filling the CreationRow, no SideEffects request
				if (!mParameters.bSkipSideEffects) {
					handleSideEffects(oListBinding, oCreation);
				}
			}

			let oNavigation;
			switch (resolvedCreationMode) {
				case CreationMode.Deferred:
					oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
						bDeferredContext: true,
						editable: true,
						bForceFocus: true
					});
					break;
				case CreationMode.Async:
					oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
						asyncContext: oCreation,
						editable: true,
						bForceFocus: true
					});
					break;
				case CreationMode.Sync:
					mArgs = {
						editable: true,
						bForceFocus: true
					};
					if (sProgrammingModel == ProgrammingModel.Sticky || mParameters.createAction) {
						mArgs.transient = true;
					}
					oNavigation = oCreation?.then(function (oNewDocumentContext: any) {
						if (!oNewDocumentContext) {
							const coreResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
							return oRoutingListener.navigateToMessagePage(
								coreResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"),
								{
									title: coreResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
									description: coreResourceBundle.getText("C_EDITFLOW_SAPFE_CREATION_FAILED_DESCRIPTION")
								}
							);
						} else {
							// In case the Sync creation was triggered for a deferred creation, we don't navigate forward
							// as we're already on the corresponding ObjectPage
							return mParameters.bFromDeferred
								? oRoutingListener.navigateToContext(oNewDocumentContext, mArgs)
								: oRoutingListener.navigateForwardToContext(oNewDocumentContext, mArgs);
						}
					});
					break;
				case CreationMode.Inline:
					this.syncTask(oCreation);
					break;
				case CreationMode.CreationRow:
					// the creation row shall be cleared once the validation check was successful and
					// therefore the POST can be sent async to the backend
					try {
						const oCreationRowListBinding = oCreationRowContext.getBinding();

						const oNewTransientContext = oCreationRowListBinding.create();
						oCreationRow.setBindingContext(oNewTransientContext);

						// this is needed to avoid console errors TO be checked with model colleagues
						oNewTransientContext.created().catch(function () {
							Log.trace("transient fast creation context deleted");
						});
						oNavigation = oCreationRowContext.delete("$direct");
					} catch (oError: any) {
						// Reset busy indicator after a validation error
						if (BusyLocker.isLocked(this.getView().getModel("ui"))) {
							BusyLocker.unlock(this.getView().getModel("ui"));
						}
						Log.error("CreationRow navigation error: ", oError);
					}
					break;
				default:
					oNavigation = Promise.reject(`Unhandled creationMode ${resolvedCreationMode}`);
					break;
			}

			if (oCreation) {
				try {
					const aParams = await Promise.all([oCreation, oNavigation]);
					this._setStickySessionInternalProperties(sProgrammingModel, oModel);

					this.setEditMode(EditMode.Editable); // The createMode flag will be set in computeEditMode
					if (!oListBinding.isRelative() && sProgrammingModel === ProgrammingModel.Sticky) {
						// Workaround to tell the OP that we've created a new object from the LR
						const metaModel = oListBinding.getModel().getMetaModel();
						const metaContext = metaModel.bindContext(metaModel.getMetaPath(oListBinding.getPath()));
						const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet as EntitySet;
						const newAction = entitySet?.annotations.Session?.StickySessionSupported?.NewAction;
						this.getInternalModel().setProperty("/lastInvokedAction", newAction);
					}
					const oNewDocumentContext = aParams[0];
					if (oNewDocumentContext) {
						this.setDocumentModifiedOnCreate(oListBinding);
						if (!this._isFclEnabled()) {
							EditState.setEditStateDirty();
						}
						this._sendActivity(Activity.Create, oNewDocumentContext);
						if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel()) && !ActivitySync.isConnected(this.getView())) {
							// according to UX in case of enabled collaboration draft we share the object immediately
							await shareObject(oNewDocumentContext);
						}
					}
				} catch (error: unknown) {
					// TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
					if (
						error === Constants.CancelActionDialog ||
						error === Constants.ActionExecutionFailed ||
						error === Constants.CreationFailed
					) {
						// creation has been cancelled by user or failed in backend => in case we have navigated to transient context before, navigate back
						// the switch-statement above seems to indicate that this happens in creationModes deferred and async. But in fact, in these cases after the navigation from routeMatched in OP component
						// createDeferredContext is triggerd, which calls this method (createDocument) again - this time with creationMode sync. Therefore, also in that mode we need to trigger back navigation.
						// The other cases might still be needed in case the navigation fails.
						if (
							resolvedCreationMode === CreationMode.Sync ||
							resolvedCreationMode === CreationMode.Deferred ||
							resolvedCreationMode === CreationMode.Async
						) {
							oRoutingListener.navigateBackFromTransientState();
						}
					}
					throw error;
				}
			}
		} finally {
			if (bShouldBusyLock) {
				BusyLocker.unlock(oLockObject);
			}
		}
	}

	/**
	 * Validates a document.
	 *
	 * @returns Promise resolves with result of the custom validation function
	 */

	validateDocument(context: Context, parameters: any): Promise<any> {
		return this.getTransactionHelper().validateDocument(context, parameters, this.getView());
	}

	/**
	 * Creates several documents.
	 *
	 * @param listBinding The listBinding used to create the documents
	 * @param dataForCreate The initial data for the new documents
	 * @param createAtEnd True if the new contexts need to be crated at the end of the list binding
	 * @param isFromCopyPaste True if the creation has been triggered by a paste action
	 * @param beforeCreateCallBack Callback to be called before the creation
	 * @param createAsInactive True if the contexts need to be created inactive
	 * @returns A Promise with the newly created contexts.
	 */
	async createMultipleDocuments(
		listBinding: ODataListBinding,
		dataForCreate: any[],
		createAtEnd: boolean,
		isFromCopyPaste: boolean,
		beforeCreateCallBack?: Function,
		createAsInactive = false
	) {
		const transactionHelper = this.getTransactionHelper();
		const lockObject = this.getGlobalUIModel();
		const targetListBinding = listBinding;

		BusyLocker.lock(lockObject);

		try {
			await this.syncTask();
			if (beforeCreateCallBack) {
				await beforeCreateCallBack({ contextPath: targetListBinding.getPath() });
			}

			const metaModel = targetListBinding.getModel().getMetaModel();
			let metaPath: string;

			if (targetListBinding.getContext()) {
				metaPath = metaModel.getMetaPath(`${targetListBinding.getContext().getPath()}/${targetListBinding.getPath()}`);
			} else {
				metaPath = metaModel.getMetaPath(targetListBinding.getPath());
			}

			this.handleCreateEvents(targetListBinding);

			// Iterate on all items and store the corresponding creation promise
			const creationPromises = dataForCreate.map((propertyValues) => {
				const createParameters: any = { data: {} };

				createParameters.keepTransientContextOnFailed = false; // currently not fully supported
				createParameters.busyMode = "None";
				createParameters.creationMode = CreationMode.CreationRow;
				createParameters.parentControl = this.getView();
				createParameters.createAtEnd = createAtEnd;
				createParameters.inactive = createAsInactive;

				// Remove navigation properties as we don't support deep create
				for (const propertyPath in propertyValues) {
					const property = metaModel.getObject(`${metaPath}/${propertyPath}`);
					if (
						property &&
						property.$kind !== "NavigationProperty" &&
						propertyPath.indexOf("/") < 0 &&
						propertyValues[propertyPath]
					) {
						createParameters.data[propertyPath] = propertyValues[propertyPath];
					}
				}

				return transactionHelper.createDocument(
					targetListBinding,
					createParameters,
					this.getAppComponent(),
					this.getMessageHandler(),
					isFromCopyPaste
				);
			});

			const createdContexts = await Promise.all(creationPromises);
			if (!createAsInactive) {
				this.setDocumentModifiedOnCreate(targetListBinding);
			}
			// transient contexts are reliably removed once oNewContext.created() is resolved
			await Promise.all(
				createdContexts.map((newContext: any) => {
					if (!newContext.bInactive) {
						return newContext.created();
					}
				})
			);

			const viewBindingContext = this.getView().getBindingContext();

			// if there are transient contexts, we must avoid requesting side effects
			// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
			// if list binding is refreshed, transient contexts might be lost
			if (!CommonUtils.hasTransientContext(targetListBinding)) {
				this.getAppComponent()
					.getSideEffectsService()
					.requestSideEffectsForNavigationProperty(targetListBinding.getPath(), viewBindingContext as Context);
			}

			return createdContexts;
		} catch (err: any) {
			Log.error("Error while creating multiple documents.");
			throw err;
		} finally {
			BusyLocker.unlock(lockObject);
		}
	}

	/**
	 * This function can be used to intercept the 'Save' action. You can execute custom coding in this function.
	 * The framework waits for the returned promise to be resolved before continuing the 'Save' action.
	 * If you reject the promise, the 'Save' action is stopped and the user stays in edit mode.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param _mParameters Object containing the parameters passed to onBeforeSave
	 * @param _mParameters.context Page context that is going to be saved.
	 * @returns A promise to be returned by the overridden method. If resolved, the 'Save' action is triggered. If rejected, the 'Save' action is not triggered and the user stays in edit mode.
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeSave
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onBeforeSave(_mParameters?: { context?: Context }): Promise<void> {
		// to be overridden
		return Promise.resolve();
	}

	/**
	 * This function can be used to intercept the 'Create' action. You can execute custom coding in this function.
	 * The framework waits for the returned promise to be resolved before continuing the 'Create' action.
	 * If you reject the promise, the 'Create' action is stopped.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param _mParameters Object containing the parameters passed to onBeforeCreate
	 * @param _mParameters.contextPath Path pointing to the context on which Create action is triggered
	 * @param _mParameters.createParameters Array of values that are filled in the Action Parameter Dialog
	 * @returns A promise to be returned by the overridden method. If resolved, the 'Create' action is triggered. If rejected, the 'Create' action is not triggered.
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeCreate
	 * @public
	 * @since 1.98.0
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onBeforeCreate(_mParameters?: { contextPath?: string; createParameters?: any[] }): Promise<void> {
		// to be overridden
		return Promise.resolve();
	}

	/**
	 * This function can be used to intercept the 'Edit' action. You can execute custom coding in this function.
	 * The framework waits for the returned promise to be resolved before continuing the 'Edit' action.
	 * If you reject the promise, the 'Edit' action is stopped and the user stays in display mode.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param _mParameters Object containing the parameters passed to onBeforeEdit
	 * @param _mParameters.context Page context that is going to be edited.
	 * @returns A promise to be returned by the overridden method. If resolved, the 'Edit' action is triggered. If rejected, the 'Edit' action is not triggered and the user stays in display mode.
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeEdit
	 * @public
	 * @since 1.98.0
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onBeforeEdit(_mParameters?: { context?: Context }): Promise<void> {
		// to be overridden
		return Promise.resolve();
	}

	/**
	 * This function can be used to intercept the 'Discard' action. You can execute custom coding in this function.
	 * The framework waits for the returned promise to be resolved before continuing the 'Discard' action.
	 * If you reject the promise, the 'Discard' action is stopped and the user stays in edit mode.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param _mParameters Object containing the parameters passed to onBeforeDiscard
	 * @param _mParameters.context Page context that is going to be discarded.
	 * @returns A promise to be returned by the overridden method. If resolved, the 'Discard' action is triggered. If rejected, the 'Discard' action is not triggered and the user stays in edit mode.
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDiscard
	 * @public
	 * @since 1.98.0
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onBeforeDiscard(_mParameters?: { context?: Context }): Promise<void> {
		// to be overridden
		return Promise.resolve();
	}

	/**
	 * This function can be used to intercept the 'Delete' action. You can execute custom coding in this function.
	 * The framework waits for the returned promise to be resolved before continuing the 'Delete' action.
	 * If you reject the promise, the 'Delete' action is stopped.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param _mParameters Object containing the parameters passed to onBeforeDelete
	 * @param _mParameters.contexts An array of contexts that are going to be deleted
	 * @returns A promise to be returned by the overridden method. If resolved, the 'Delete' action is triggered. If rejected, the 'Delete' action is not triggered.
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDelete
	 * @public
	 * @since 1.98.0
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onBeforeDelete(_mParameters?: { contexts?: Context[] }): Promise<void> {
		// to be overridden
		return Promise.resolve();
	}

	// Internal only params ---
	// @param {boolean} mParameters.bExecuteSideEffectsOnError Indicates whether SideEffects need to be ignored when user clicks on Save during an Inline creation
	// @param {object} mParameters.bindings List bindings of the tables in the view.
	// Both of the above parameters are for the same purpose. User can enter some information in the creation row(s) but does not 'Add row', instead clicks Save.
	// There can be more than one in the view.

	/**
	 * Saves a new document after checking it.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oContext  Context of the editable document
	 * @param mParameters PRIVATE
	 * @returns Promise resolves once save is complete
	 * @alias sap.fe.core.controllerextensions.EditFlow#saveDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	async saveDocument(oContext: Context, mParameters: any): Promise<void> {
		mParameters = mParameters || {};
		const bExecuteSideEffectsOnError = mParameters.bExecuteSideEffectsOnError || undefined;
		const bDraftNavigation = true;
		const transactionHelper = this.getTransactionHelper();
		const aBindings = mParameters.bindings;

		try {
			await this.syncTask();
			await this._submitOpenChanges(oContext);
			await this._checkForValidationErrors();
			await this.base.editFlow.onBeforeSave({ context: oContext });

			const sProgrammingModel = this.getProgrammingModel(oContext);
			const oRootViewController = this._getRootViewController() as any;
			let siblingInfo: SiblingInformation | undefined;
			if (
				(sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) &&
				oRootViewController.isFclEnabled()
			) {
				// No need to try to get rightmost context in case of a new object
				siblingInfo = await this._computeSiblingInformation(
					oContext,
					oRootViewController.getRightmostContext(),
					sProgrammingModel,
					true
				);
			}

			const activeDocumentContext = await transactionHelper.saveDocument(
				oContext,
				this.getAppComponent(),
				this._getResourceModel(),
				bExecuteSideEffectsOnError,
				aBindings,
				this.getMessageHandler(),
				this.getCreationMode()
			);
			this._removeStickySessionInternalProperties(sProgrammingModel);

			this._sendActivity(Activity.Activate, activeDocumentContext);
			ActivitySync.disconnect(this.getView());

			this._triggerConfiguredSurvey(StandardActions.save, TriggerType.standardAction);

			this.setDocumentModified(false);
			this.setEditMode(EditMode.Display, false);
			this.getMessageHandler().showMessageDialog();

			if (activeDocumentContext !== oContext) {
				let contextToNavigate = activeDocumentContext;
				if (oRootViewController.isFclEnabled()) {
					siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, activeDocumentContext);
					this._updatePathsInHistory(siblingInfo.pathMapping);
					if (siblingInfo.targetContext.getPath() !== activeDocumentContext.getPath()) {
						contextToNavigate = siblingInfo.targetContext;
					}
				}

				await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
			}
		} catch (oError: any) {
			if (!(oError && oError.canceled)) {
				Log.error("Error while saving the document", oError);
			}
			throw oError;
		}
	}

	/**
	 * Switches the UI between draft and active document.
	 *
	 * @param oContext The context to switch from
	 * @returns Promise resolved once the switch is done
	 */
	async toggleDraftActive(oContext: Context): Promise<void> {
		const oContextData = oContext.getObject();
		let bEditable: boolean;
		const bIsDraft = oContext && this.getProgrammingModel(oContext) === ProgrammingModel.Draft;

		//toggle between draft and active document is only available for edit drafts and active documents with draft)
		if (
			!bIsDraft ||
			!(
				(!oContextData.IsActiveEntity && oContextData.HasActiveEntity) ||
				(oContextData.IsActiveEntity && oContextData.HasDraftEntity)
			)
		) {
			return;
		}

		if (!oContextData.IsActiveEntity && oContextData.HasActiveEntity) {
			//start Point: edit draft
			bEditable = false;
		} else {
			// start point active document
			bEditable = true;
		}

		try {
			const oRootViewController = this._getRootViewController() as any;
			const oRightmostContext = oRootViewController.isFclEnabled() ? oRootViewController.getRightmostContext() : oContext;
			let siblingInfo = await this._computeSiblingInformation(oContext, oRightmostContext, ProgrammingModel.Draft, false);
			if (!siblingInfo && oContext !== oRightmostContext) {
				// Try to compute sibling info for the root context if it fails for the rightmost context
				// --> In case of FCL, if we try to switch between draft and active but a child entity has no sibling, the switch will close the child column
				siblingInfo = await this._computeSiblingInformation(oContext, oContext, ProgrammingModel.Draft, false);
			}
			if (siblingInfo) {
				this.setEditMode(bEditable ? EditMode.Editable : EditMode.Display, false); //switch to edit mode only if a draft is available

				if (oRootViewController.isFclEnabled()) {
					const lastSemanticMapping = this._getSemanticMapping();
					if (lastSemanticMapping?.technicalPath === oContext.getPath()) {
						const targetPath = siblingInfo.pathMapping[siblingInfo.pathMapping.length - 1].newPath;
						siblingInfo.pathMapping.push({ oldPath: lastSemanticMapping.semanticPath, newPath: targetPath });
					}
					this._updatePathsInHistory(siblingInfo.pathMapping);
				}

				await this._handleNewContext(siblingInfo.targetContext, bEditable, true, true, true);
			} else {
				throw new Error("Error in EditFlow.toggleDraftActive - Cannot find sibling");
			}
		} catch (oError) {
			throw new Error(`Error in EditFlow.toggleDraftActive:${oError}`);
		}
	}

	// Internal only params ---
	// @param {sap.m.Button} mParameters.cancelButton - Currently this is passed as cancelButton internally (replaced by mParameters.control in the JSDoc below). Currently it is also mandatory.
	// Plan - This should not be mandatory. If not provided, we should have a default that can act as reference control for the discard popover OR we can show a dialog instead of a popover.

	/**
	 * Discard the editable document.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oContext  Context of the editable document
	 * @param mParameters Can contain the following attributes:
	 * @param mParameters.control This is the control used to open the discard popover
	 * @param mParameters.skipDiscardPopover Optional, supresses the discard popover and allows custom handling
	 * @returns Promise resolves once editable document has been discarded
	 * @alias sap.fe.core.controllerextensions.EditFlow#cancelDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	async cancelDocument(oContext: Context, mParameters: { control: object; skipDiscardPopover?: boolean }): Promise<any> {
		const transactionHelper = this.getTransactionHelper();
		const mInParameters: any = mParameters;
		let siblingInfo: SiblingInformation | undefined;
		let isNewDocument = false;
		mInParameters.cancelButton = mParameters.control || mInParameters.cancelButton;
		mInParameters.beforeCancelCallBack = this.base.editFlow.onBeforeDiscard;

		try {
			await this.syncTask();
			const sProgrammingModel = this.getProgrammingModel(oContext);
			if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && this._isFclEnabled()) {
				const oRootViewController = this._getRootViewController() as any;

				// No need to try to get rightmost context in case of a new object
				siblingInfo = await this._computeSiblingInformation(
					oContext,
					oRootViewController.getRightmostContext(),
					sProgrammingModel,
					true
				);
			}

			const cancelResult = await transactionHelper.cancelDocument(
				oContext,
				mInParameters,
				this.getAppComponent(),
				this._getResourceModel(),
				this.getMessageHandler(),
				this.getCreationMode(),
				this.isDocumentModified()
			);
			const bDraftNavigation = true;
			this._removeStickySessionInternalProperties(sProgrammingModel);

			this.setEditMode(EditMode.Display, false);
			this.setDocumentModified(false);
			this.setDraftStatus(DraftStatus.Clear);
			// we force the edit state even for FCL because the draft discard might not be implemented
			// and we may just delete the draft
			EditState.setEditStateDirty();
			if (!cancelResult) {
				this._sendActivity(Activity.Discard, undefined);
				ActivitySync.disconnect(this.getView());
				//in case of a new document, no activeContext is returned --> navigate back.
				if (!mInParameters.skipBackNavigation) {
					await this.getInternalRouting().navigateBackFromContext(oContext);
					isNewDocument = true;
				}
			} else {
				const oActiveDocumentContext = cancelResult as Context;
				this._sendActivity(Activity.Discard, oActiveDocumentContext);
				ActivitySync.disconnect(this.getView());
				let contextToNavigate = oActiveDocumentContext;
				if (this._isFclEnabled()) {
					siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oActiveDocumentContext);
					this._updatePathsInHistory(siblingInfo.pathMapping);
					if (siblingInfo.targetContext.getPath() !== oActiveDocumentContext.getPath()) {
						contextToNavigate = siblingInfo.targetContext;
					}
				}

				if (sProgrammingModel === ProgrammingModel.Draft) {
					// We need to load the semantic keys of the active context, as we need them
					// for the navigation
					await this._fetchSemanticKeyValues(oActiveDocumentContext);
					// We force the recreation of the context, so that it's created and bound in the same microtask,
					// so that all properties are loaded together by autoExpandSelect, so that when switching back to Edit mode
					// $$inheritExpandSelect takes all loaded properties into account (BCP 2070462265)
					if (!mInParameters.skipBindingToView) {
						await this._handleNewContext(contextToNavigate, false, true, bDraftNavigation, true);
					} else {
						return oActiveDocumentContext;
					}
				} else {
					//active context is returned in case of cancel of existing document
					await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
				}
			}
			this.showDocumentDiscardMessage(isNewDocument);
		} catch (oError) {
			Log.error("Error while discarding the document", oError as any);
		}
	}

	/**
	 * Brings up a message toast when a draft is discarded.
	 *
	 * @param isNewDocument This is a Boolean flag that determines whether the document is new or it is an existing document.
	 */
	showDocumentDiscardMessage(isNewDocument?: boolean) {
		const resourceModel = this._getResourceModel();
		const message = resourceModel.getText("C_TRANSACTION_HELPER_DISCARD_DRAFT_TOAST");
		if (isNewDocument == true) {
			const appComponent = this.getAppComponent();
			appComponent.getRoutingService().attachAfterRouteMatched(this.showMessageWhenNoContext, this);
		} else {
			MessageToast.show(message);
		}
	}

	/**
	 * We use this function in showDocumentDiscardMessage when no context is passed.
	 */
	showMessageWhenNoContext() {
		const resourceModel = this._getResourceModel();
		const message = resourceModel.getText("C_TRANSACTION_HELPER_DISCARD_DRAFT_TOAST");
		const appComponent = this.getAppComponent();
		MessageToast.show(message);
		appComponent.getRoutingService().detachAfterRouteMatched(this.showMessageWhenNoContext, this);
	}
	/**
	 * Checks if a context corresponds to a draft root.
	 *
	 * @param context The context to check
	 * @returns True if the context points to a draft root
	 * @private
	 */
	protected isDraftRoot(context: Context): boolean {
		const metaModel = context.getModel().getMetaModel();
		const metaContext = metaModel.getMetaContext(context.getPath());
		return ModelHelper.isDraftRoot(getInvolvedDataModelObjects(metaContext).targetEntitySet);
	}

	// Internal only params ---
	// @param {string} mParameters.entitySetName Name of the EntitySet to which the object belongs

	/**
	 * Deletes the document.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oContext  Context of the document
	 * @param mInParameters Can contain the following attributes:
	 * @param mInParameters.title Title of the object being deleted
	 * @param mInParameters.description Description of the object being deleted
	 * @returns Promise resolves once document has been deleted
	 * @alias sap.fe.core.controllerextensions.EditFlow#deleteDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	async deleteDocument(oContext: Context, mInParameters: { title: string; description: string }): Promise<void> {
		const oAppComponent = this.getAppComponent();
		let mParameters: any = mInParameters;
		if (!mParameters) {
			mParameters = {
				bFindActiveContexts: false
			};
		} else {
			mParameters.bFindActiveContexts = false;
		}
		mParameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
		try {
			if (
				this._isFclEnabled() &&
				this.isDraftRoot(oContext) &&
				oContext.getIndex() === undefined &&
				oContext.getProperty("IsActiveEntity") === true &&
				oContext.getProperty("HasDraftEntity") === true
			) {
				// Deleting an active entity which has a draft that could potentially be displayed in the ListReport (FCL case)
				// --> need to remove the draft from the LR and replace it with the active version, so that the ListBinding is properly refreshed
				// The condition 'oContext.getIndex() === undefined' makes sure the active version isn't already displayed in the LR
				mParameters.beforeDeleteCallBack = async (parameters?: { contexts?: Context[] }) => {
					await this.base.editFlow.onBeforeDelete(parameters);

					try {
						const model = oContext.getModel();
						const siblingContext = model.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
						const draftPath = await siblingContext.requestCanonicalPath();
						const draftContextToRemove = model.getKeepAliveContext(draftPath);
						draftContextToRemove.replaceWith(oContext);
					} catch (error) {
						Log.error("Error while replacing the draft instance in the LR ODLB", error as any);
					}
				};
			}

			await this.deleteDocumentTransaction(oContext, mParameters);

			// Single objet deletion is triggered from an OP header button (not from a list)
			// --> Mark UI dirty and navigate back to dismiss the OP
			if (!this._isFclEnabled()) {
				EditState.setEditStateDirty();
			}
			this._sendActivity(Activity.Delete, oContext);

			// After delete is successfull, we need to detach the setBackNavigation Methods
			if (oAppComponent) {
				oAppComponent.getShellServices().setBackNavigation();
			}

			if (oAppComponent?.getStartupMode() === StartupMode.Deeplink && !this._isFclEnabled()) {
				// In case the app has been launched with semantic keys, deleting the object we've landed on shall navigate back
				// to the app we came from (except for FCL, where we navigate to LR as usual)
				oAppComponent.getRouterProxy().exitFromApp();
			} else {
				this.getInternalRouting().navigateBackFromContext(oContext);
			}
		} catch (error) {
			Log.error("Error while deleting the document", error as any);
		}
	}

	/**
	 * Submit the current set of changes and navigate back.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oContext  Context of the document
	 * @returns Promise resolves once the changes have been saved
	 * @alias sap.fe.core.controllerextensions.EditFlow#applyDocument
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	async applyDocument(oContext: object): Promise<void> {
		const oLockObject = this.getGlobalUIModel();
		BusyLocker.lock(oLockObject);

		try {
			await this.syncTask();
			await this._submitOpenChanges(oContext);
			await this._checkForValidationErrors();
			await this.getMessageHandler().showMessageDialog();
			await this.getInternalRouting().navigateBackFromContext(oContext);
		} finally {
			if (BusyLocker.isLocked(oLockObject)) {
				BusyLocker.unlock(oLockObject);
			}
		}
	}

	// Internal only params ---
	// @param {boolean} [mParameters.bStaticAction] Boolean value for static action, undefined for other actions
	// @param {boolean} [mParameters.isNavigable] Boolean value indicating whether navigation is required after the action has been executed
	// Currently the parameter isNavigable is used internally and should be changed to requiresNavigation as it is a more apt name for this param

	/**
	 * Invokes an action (bound or unbound) and tracks the changes so that other pages can be refreshed and show the updated data upon navigation.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param sActionName The name of the action to be called
	 * @param mInParameters Contains the following attributes:
	 * @param mInParameters.parameterValues A map of action parameter names and provided values
	 * @param mInParameters.parameterValues.name Name of the parameter
	 * @param mInParameters.parameterValues.value Value of the parameter
	 * @param mInParameters.skipParameterDialog Skips the action parameter dialog if values are provided for all of them in parameterValues
	 * @param mInParameters.contexts For a bound action, a context or an array with contexts for which the action is to be called must be provided
	 * @param mInParameters.model For an unbound action, an instance of an OData V4 model must be provided
	 * @param mInParameters.requiresNavigation Boolean value indicating whether navigation is required after the action has been executed. Navigation takes place to the context returned by the action
	 * @param mInParameters.label A human-readable label for the action. This is needed in case the action has a parameter and a parameter dialog is shown to the user. The label will be used for the title of the dialog and for the confirmation button
	 * @param mInParameters.invocationGrouping Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
	 * @param mExtraParams PRIVATE
	 * @returns A promise which resolves once the action has been executed, providing the response
	 * @alias sap.fe.core.controllerextensions.EditFlow#invokeAction
	 * @public
	 * @since 1.90.0
	 * @final
	 */
	@publicExtension()
	@finalExtension()
	async invokeAction(
		sActionName: string,
		mInParameters?: {
			parameterValues?: { name: string; value: any };
			skipParameterDialog?: boolean;
			contexts?: Context | Context[];
			model?: ODataModel;
			requiresNavigation?: boolean;
			label?: string;
			invocationGrouping?: string;
		},
		mExtraParams?: any
	): Promise<void> {
		let oControl: any;
		const transactionHelper = this.getTransactionHelper();
		let aParts;
		let sOverloadEntityType;
		let oCurrentActionCallBacks: any;
		const oView = this.getView();

		let mParameters: any = mInParameters || {};
		// Due to a mistake the invokeAction in the extensionAPI had a different API than this one.
		// The one from the extensionAPI doesn't exist anymore as we expose the full edit flow now but
		// due to compatibility reasons we still need to support the old signature
		if (
			(mParameters.isA && mParameters.isA("sap.ui.model.odata.v4.Context")) ||
			Array.isArray(mParameters) ||
			mExtraParams !== undefined
		) {
			const contexts = mParameters;
			mParameters = mExtraParams || {};
			if (contexts) {
				mParameters.contexts = contexts;
			} else {
				mParameters.model = this.getView().getModel();
			}
		}

		mParameters.isNavigable = mParameters.requiresNavigation || mParameters.isNavigable;

		// Determine if the referenced action is bound or unbound
		const convertedMetadata = convertTypes(this.getView().getModel()?.getMetaModel() as ODataMetaModel);
		// The EntityContainer may NOT be missing, so it should not be able to be undefined, but since in our converted Metadata
		// it can be undefined, I need this workaround here of adding "" since indexOf does not accept something that's
		// undefined.
		if (sActionName.indexOf("" + convertedMetadata.entityContainer.name) > -1) {
			// Unbound actions are always referenced via the action import and we found the EntityContainer in the sActionName so
			// an unbound action is referenced!
			mParameters.isBound = false;
		} else {
			// No entity container in the sActionName, so either a bound or static action is referenced which is also bound!
			mParameters.isBound = true;
		}

		if (!mParameters.parentControl) {
			mParameters.parentControl = this.getView();
		}

		if (mParameters.controlId) {
			oControl = this.getView().byId(mParameters.controlId);
			if (oControl) {
				// TODO: currently this selected contexts update is done within the operation, should be moved out
				mParameters.internalModelContext = oControl.getBindingContext("internal");
			}
		} else {
			mParameters.internalModelContext = oView.getBindingContext("internal");
		}

		if (sActionName && sActionName.indexOf("(") > -1) {
			// get entity type of action overload and remove it from the action path
			// Example sActionName = "<ActionName>(Collection(<OverloadEntityType>))"
			// sActionName = aParts[0] --> <ActionName>
			// sOverloadEntityType = aParts[2] --> <OverloadEntityType>
			aParts = sActionName.split("(");
			sActionName = aParts[0];
			sOverloadEntityType = (aParts[aParts.length - 1] as any).replaceAll(")", "");
		}

		if (mParameters.bStaticAction) {
			if (oControl.isTableBound()) {
				mParameters.contexts = oControl.getRowBinding().getHeaderContext();
			} else {
				const sBindingPath = oControl.data("rowsBindingInfo").path,
					oListBinding = new (ODataListBinding as any)(this.getView().getModel(), sBindingPath);
				mParameters.contexts = oListBinding.getHeaderContext();
			}

			if (sOverloadEntityType && oControl.getBindingContext()) {
				mParameters.contexts = this._getActionOverloadContextFromMetadataPath(
					oControl.getBindingContext(),
					oControl.getRowBinding(),
					sOverloadEntityType
				);
			}

			if (mParameters.enableAutoScroll) {
				oCurrentActionCallBacks = this.createActionPromise(sActionName, oControl.sId);
			}
		}
		mParameters.bGetBoundContext = this._getBoundContext(oView, mParameters);
		// Need to know that the action is called from ObjectPage for changeSet Isolated workaround
		mParameters.bObjectPage = (oView.getViewData() as any).converterType === "ObjectPage";

		try {
			await this.syncTask();
			const oResponse = await transactionHelper.callAction(
				sActionName,
				mParameters,
				this.getView(),
				this.getAppComponent(),
				this.getMessageHandler()
			);
			let listRefreshed: boolean | undefined;
			if (mParameters.contexts && mParameters.isBound === true) {
				listRefreshed = await this._refreshListIfRequired(
					this.getActionResponseDataAndKeys(sActionName, oResponse),
					mParameters.contexts[0]
				);
			}
			if (ActivitySync.isConnected(this.getView())) {
				let actionRequestedProperties: string[] = [];
				if (oResponse) {
					actionRequestedProperties = Array.isArray(oResponse)
						? Object.keys(oResponse[0].value.getObject())
						: Object.keys(oResponse.getObject());
				}
				this._sendActivity(Activity.Action, mParameters.contexts, sActionName, listRefreshed, actionRequestedProperties);
			}
			this._triggerConfiguredSurvey(sActionName, TriggerType.action);

			if (oCurrentActionCallBacks) {
				oCurrentActionCallBacks.fResolver(oResponse);
			}
			/*
					We set the (upper) pages to dirty after an execution of an action
					TODO: get rid of this workaround
					This workaround is only needed as long as the model does not support the synchronization.
					Once this is supported we don't need to set the pages to dirty anymore as the context itself
					is already refreshed (it's just not reflected in the object page)
					we explicitly don't call this method from the list report but only call it from the object page
					as if it is called in the list report it's not needed - as we anyway will remove this logic
					we can live with this
					we need a context to set the upper pages to dirty - if there are more than one we use the
					first one as they are anyway siblings
					*/
			if (mParameters.contexts) {
				if (!this._isFclEnabled()) {
					EditState.setEditStateDirty();
				}
				this.getInternalModel().setProperty("/lastInvokedAction", sActionName);
			}
			if (mParameters.isNavigable) {
				let vContext = oResponse;
				if (Array.isArray(vContext) && vContext.length === 1) {
					vContext = vContext[0].value;
				}
				if (vContext && !Array.isArray(vContext)) {
					const oMetaModel = oView.getModel().getMetaModel() as ODataMetaModel;
					const sContextMetaPath = oMetaModel.getMetaPath(vContext.getPath());
					const _fnValidContexts = (contexts: any, applicableContexts: any) => {
						return contexts.filter((element: any) => {
							if (applicableContexts) {
								return applicableContexts.indexOf(element) > -1;
							}
							return true;
						});
					};
					const oActionContext = Array.isArray(mParameters.contexts)
						? _fnValidContexts(mParameters.contexts, mParameters.applicableContexts)[0]
						: mParameters.contexts;
					const sActionContextMetaPath = oActionContext && oMetaModel.getMetaPath(oActionContext.getPath());
					if (sContextMetaPath != undefined && sContextMetaPath === sActionContextMetaPath) {
						if (oActionContext.getPath() !== vContext.getPath()) {
							this.getInternalRouting().navigateForwardToContext(vContext, {
								checkNoHashChange: true,
								noHistoryEntry: false
							});
						} else {
							Log.info("Navigation to the same context is not allowed");
						}
					}
				}
			}
			return oResponse;
		} catch (err: any) {
			if (oCurrentActionCallBacks) {
				oCurrentActionCallBacks.fRejector();
			}
			// FIXME: in most situations there is no handler for the rejected promises returnedq
			if (err === Constants.CancelActionDialog) {
				// This leads to console error. Actually the error is already handled (currently directly in press handler of end button in dialog), so it should not be forwarded
				// up to here. However, when dialog handling and backend execution are separated, information whether dialog was cancelled, or backend execution has failed needs
				// to be transported to the place responsible for connecting these two things.
				// TODO: remove special handling one dialog handling and backend execution are separated
				throw new Error("Dialog cancelled");
			} else if (!(err && (err.canceled || (err.rejectedItems && err.rejectedItems[0].canceled)))) {
				// TODO: analyze, whether this is of the same category as above
				throw new Error(`Error in EditFlow.invokeAction:${err}`);
			}
			// TODO: Any unexpected errors probably should not be ignored!
		}
	}

	/**
	 * Secured execution of the given function. Ensures that the function is only executed when certain conditions are fulfilled.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param fnFunction The function to be executed. Should return a promise that is settled after completion of the execution. If nothing is returned, immediate completion is assumed.
	 * @param mParameters Definitions of the preconditions to be checked before execution
	 * @param mParameters.busy Defines the busy indicator
	 * @param mParameters.busy.set Triggers a busy indicator when the function is executed.
	 * @param mParameters.busy.check Executes function only if application isn't busy.
	 * @param mParameters.updatesDocument This operation updates the current document without using the bound model and context. As a result, the draft status is updated if a draft document exists, and the user has to confirm the cancellation of the editing process.
	 * @returns A promise that is rejected if the execution is prohibited and resolved by the promise returned by the fnFunction.
	 * @alias sap.fe.core.controllerextensions.EditFlow#securedExecution
	 * @public
	 * @since 1.90.0
	 */
	@publicExtension()
	@finalExtension()
	securedExecution(
		fnFunction: Function,
		mParameters?: {
			busy?: {
				set?: boolean;
				check?: boolean;
			};
			updatesDocument?: boolean;
		}
	): Promise<void> {
		const bBusySet = mParameters?.busy?.set ?? true,
			bBusyCheck = mParameters?.busy?.check ?? true,
			bUpdatesDocument = mParameters?.updatesDocument ?? false,
			oLockObject = this.getGlobalUIModel(),
			oContext = this.getView().getBindingContext(),
			bIsDraft = oContext && this.getProgrammingModel(oContext as Context) === ProgrammingModel.Draft;

		if (bBusyCheck && BusyLocker.isLocked(oLockObject)) {
			return Promise.reject("Application already busy therefore execution rejected");
		}

		// we have to set busy and draft indicator immediately also the function might be executed later in queue
		if (bBusySet) {
			BusyLocker.lock(oLockObject);
		}
		if (bUpdatesDocument && bIsDraft) {
			this.setDraftStatus(DraftStatus.Saving);
		}

		this.getMessageHandler().removeTransitionMessages();

		return this.syncTask(fnFunction as () => any)
			.then(() => {
				if (bUpdatesDocument) {
					this.setDocumentModified(true);
					if (!this._isFclEnabled()) {
						EditState.setEditStateDirty();
					}
					if (bIsDraft) {
						this.setDraftStatus(DraftStatus.Saved);
					}
				}
			})
			.catch((oError: any) => {
				if (bUpdatesDocument && bIsDraft) {
					this.setDraftStatus(DraftStatus.Clear);
				}
				return Promise.reject(oError);
			})
			.finally(() => {
				if (bBusySet) {
					BusyLocker.unlock(oLockObject);
				}
				this.getMessageHandler().showMessageDialog();
			});
	}

	/**
	 * Handles the patchSent event: register document modification.
	 *
	 * @param oEvent The event sent by the binding
	 */
	handlePatchSent(oEvent: Event) {
		// In collaborative draft, disable ETag check for PATCH requests
		const isInCollaborativeDraft = ActivitySync.isConnected(this.getView());
		if (isInCollaborativeDraft) {
			((oEvent.getSource() as Binding).getModel() as any).setIgnoreETag(true);
		}
		if (!(this.getView()?.getBindingContext("internal") as InternalModelContext)?.getProperty("skipPatchHandlers")) {
			const sourceBinding = oEvent.getSource() as ODataListBinding;
			// Create a promise that will be resolved or rejected when the path is completed
			const oPatchPromise = new Promise<void>((resolve, reject) => {
				oEvent.getSource().attachEventOnce("patchCompleted", (patchCompletedEvent: any) => {
					// Re-enable ETag checks
					if (isInCollaborativeDraft) {
						((oEvent.getSource() as Binding).getModel() as any).setIgnoreETag(false);
					}

					if (oEvent.getSource().isA("sap.ui.model.odata.v4.ODataListBinding")) {
						ActionRuntime.setActionEnablementAfterPatch(
							this.getView(),
							sourceBinding,
							this.getView()?.getBindingContext("internal") as InternalModelContext
						);
					}
					const bSuccess = patchCompletedEvent.getParameter("success");
					if (bSuccess) {
						resolve();
					} else {
						reject();
					}
				});
			});
			this.updateDocument(sourceBinding, oPatchPromise);
		}
	}

	/**
	 * Handles the CreateActivate event.
	 *
	 * @param oEvent The event sent by the binding
	 */
	async handleCreateActivate(oEvent: Event) {
		const oBinding = oEvent.getSource();
		const transactionHelper = this.getTransactionHelper();
		const bAtEnd = true;
		const bInactive = true;
		const oParams: any = {
			creationMode: CreationMode.Inline,
			createAtEnd: bAtEnd,
			inactive: bInactive,
			keepTransientContextOnFailed: false, // currently not fully supported
			busyMode: "None"
		};
		try {
			// Send notification to other users only after the creation has been finalized
			const activatedContext = oEvent.getParameter("context") as Context;
			activatedContext
				.created()
				?.then(() => {
					this._sendActivity(Activity.Create, activatedContext);
				})
				.catch(() => {
					Log.warning(`Failed to activate context ${activatedContext.getPath()}`);
				});

			// Create a new inactive context (empty row in the table)
			const newInactiveContext = await transactionHelper.createDocument(
				oBinding as ODataListBinding,
				oParams,
				this.getAppComponent(),
				this.getMessageHandler(),
				false
			);
			if (newInactiveContext) {
				if (!this._isFclEnabled()) {
					EditState.setEditStateDirty();
				}
			}
		} catch (error) {
			Log.error("Failed to activate new row -", error as any);
		}
	}

	/**
	 * Performs a task in sync with other tasks created via this function.
	 * Returns the promise chain of the task.
	 *
	 * @param [newTask] Optional, a promise or function to be executed synchronously
	 * @returns Promise resolves once the task is completed
	 * @private
	 */
	syncTask(newTask?: (() => any) | Promise<any>) {
		if (newTask) {
			if (typeof newTask === "function") {
				this.syncTasks = this.syncTasks.then(newTask).catch(function () {
					return Promise.resolve();
				});
			} else {
				this.syncTasks = this.syncTasks
					.then(() => newTask)
					.catch(function () {
						return Promise.resolve();
					});
			}
		}

		return this.syncTasks;
	}

	/**
	 * Decides if a document is to be shown in display or edit mode.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext The context to be displayed or edited
	 * @returns {Promise} Promise resolves once the edit mode is computed
	 */

	async computeEditMode(context: Context): Promise<void> {
		const programmingModel = this.getProgrammingModel(context);

		if (programmingModel === ProgrammingModel.Draft) {
			try {
				this.setDraftStatus(DraftStatus.Clear);
				const globalModel = this.getGlobalUIModel();
				globalModel.setProperty("/isEditablePending", true, undefined, true);
				const isActiveEntity = await context.requestObject("IsActiveEntity");
				if (isActiveEntity === false) {
					// in case the document is draft set it in edit mode
					this.setEditMode(EditMode.Editable);
					const hasActiveEntity = await context.requestObject("HasActiveEntity");
					this.setEditMode(undefined, !hasActiveEntity);
				} else {
					// active document, stay on display mode
					this.setEditMode(EditMode.Display, false);
				}
				globalModel.setProperty("/isEditablePending", false, undefined, true);
			} catch (error: any) {
				Log.error("Error while determining the editMode for draft", error);
				throw error;
			}
		} else if (programmingModel === ProgrammingModel.Sticky) {
			const lastInvokedActionName = this.getInternalModel().getProperty("/lastInvokedAction");
			if (lastInvokedActionName && this.isNewActionForSticky(lastInvokedActionName, context)) {
				this.setEditMode(EditMode.Editable, true);
				if (!this.getAppComponent()._isFclEnabled()) {
					EditState.setEditStateDirty();
				}
				this.handleStickyOn(context);
				this.getInternalModel().setProperty("/lastInvokedAction", undefined);
			}
		}
	}

	//////////////////////////////////////
	// Private methods
	//////////////////////////////////////

	/**
	 * Internal method to delete a context or an array of contexts.
	 *
	 * @param contexts The context(s) to be deleted
	 * @param parameters Parameters for deletion
	 */
	private async deleteDocumentTransaction(contexts: Context | Context[], parameters: any): Promise<void> {
		const resourceModel = getResourceModel(this);
		const transactionHelper = this.getTransactionHelper();

		// TODO: this setting and removing of contexts shouldn't be in the transaction helper at all
		// for the time being I kept it and provide the internal model context to not break something
		parameters.internalModelContext = parameters.controlId
			? sap.ui.getCore().byId(parameters.controlId)?.getBindingContext("internal")
			: null;

		await this.syncTask();
		await transactionHelper.deleteDocument(contexts, parameters, this.getAppComponent(), resourceModel, this.getMessageHandler());
	}

	_getResourceModel(): ResourceModel {
		return getResourceModel(this.getView());
	}

	private getTransactionHelper() {
		return TransactionHelper;
	}

	private getMessageHandler() {
		if (this.base.messageHandler) {
			return this.base.messageHandler;
		} else {
			throw new Error("Edit Flow works only with a given message handler");
		}
	}

	private getInternalModel(): JSONModel {
		return this.getView().getModel("internal") as JSONModel;
	}

	private getGlobalUIModel(): JSONModel {
		return this.getView().getModel("ui") as JSONModel;
	}

	/**
	 * Sets that the current page contains a newly created object.
	 *
	 * @param bCreationMode True if the object is new
	 */
	private setCreationMode(bCreationMode: boolean) {
		const uiModelContext = this.getView().getBindingContext("ui") as Context;
		this.getGlobalUIModel().setProperty("createMode", bCreationMode, uiModelContext, true);
	}

	/**
	 * Indicates whether the current page contains a newly created object or not.
	 *
	 * @returns True if the object is new
	 */
	private getCreationMode(): boolean {
		const uiModelContext = this.getView().getBindingContext("ui") as Context;
		return !!this.getGlobalUIModel().getProperty("createMode", uiModelContext);
	}

	/**
	 * Indicates whether the object being edited (or one of its sub-objects) has been modified or not.
	 *
	 * @returns True if the object has been modified
	 */
	private isDocumentModified(): boolean {
		return !!this.getGlobalUIModel().getProperty("/isDocumentModified");
	}

	/**
	 * Sets that the object being edited (or one of its sub-objects) has been modified.
	 *
	 * @param modified True if the object has been modified
	 */
	private setDocumentModified(modified: boolean) {
		this.getGlobalUIModel().setProperty("/isDocumentModified", modified);
	}

	/**
	 * Sets that the object being edited has been modified by creating a sub-object.
	 *
	 * @param listBinding The list binding on which the object has been created
	 */
	private setDocumentModifiedOnCreate(listBinding: ODataListBinding) {
		// Set the modified flag only on relative listBindings, i.e. when creating a sub-object
		// If the listBinding is not relative, then it's a creation from the ListReport, and by default a newly created root object isn't considered as modified
		if (listBinding.isRelative()) {
			this.setDocumentModified(true);
		}
	}

	/**
	 * Handles the create event: shows messages and in case of a draft, updates the draft indicator.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param binding OData list binding object
	 */
	private handleCreateEvents(binding: ODataListBinding) {
		this.setDraftStatus(DraftStatus.Clear);

		const programmingModel = this.getProgrammingModel(binding);

		binding.attachEvent("createSent", () => {
			if (programmingModel === ProgrammingModel.Draft) {
				this.setDraftStatus(DraftStatus.Saving);
			}
		});
		binding.attachEvent("createCompleted", (oEvent: any) => {
			const success = oEvent.getParameter("success");
			if (programmingModel === ProgrammingModel.Draft) {
				this.setDraftStatus(success ? DraftStatus.Saved : DraftStatus.Clear);
			}
			this.getMessageHandler().showMessageDialog();
		});
	}

	/**
	 * Updates the draft status message (displayed at the bottom of the page).
	 *
	 * @param draftStatus The draft status message
	 */
	setDraftStatus(draftStatus: string) {
		(this.getView().getModel("ui") as JSONModel).setProperty("/draftStatus", draftStatus, undefined, true);
	}

	/**
	 * Gets the programming model from a binding or a context.
	 *
	 * @param source The binding or context
	 * @returns The programming model
	 */
	private getProgrammingModel(source: Context | Binding): typeof ProgrammingModel {
		return this.getTransactionHelper().getProgrammingModel(source);
	}

	/**
	 * Sets the edit mode.
	 *
	 * @param editMode The edit mode
	 * @param isCreation True if the object has been newly created
	 */
	private setEditMode(editMode?: string, isCreation?: boolean) {
		// at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
		// rely on the global UI model to exist
		const globalModel = this.getGlobalUIModel();

		if (editMode) {
			globalModel.setProperty("/isEditable", editMode === "Editable", undefined, true);
		}

		if (isCreation !== undefined) {
			// Since setCreationMode is public in EditFlow and can be overriden, make sure to call it via the controller
			// to ensure any overrides are taken into account
			this.setCreationMode(isCreation);
		}
	}

	/**
	 * Checks if an action corresponds to a create action for a sticky session.
	 *
	 * @param actionName The name of the action
	 * @param context Context for the sticky session
	 * @returns True if the action is a create action
	 */
	private isNewActionForSticky(actionName: string, context: Context) {
		try {
			const metaModel = context.getModel().getMetaModel();
			const metaContext = metaModel.getMetaContext(context.getPath());
			const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet as EntitySet;
			const stickySession = entitySet.annotations.Session?.StickySessionSupported;
			if (stickySession?.NewAction === actionName) {
				return true;
			}
			if (stickySession?.AdditionalNewActions && stickySession?.AdditionalNewActions.indexOf(actionName) !== -1) {
				return true;
			}

			return false;
		} catch (error) {
			Log.info(error as any);
			return false;
		}
	}

	// TODO Move all sticky-related below to a sticky session manager class

	/**
	 * Enables the sticky edit session.
	 *
	 * @param context The context being edited
	 * @returns True in case of success, false otherwise
	 */
	private handleStickyOn(context: Context): boolean {
		const appComponent = this.getAppComponent();

		try {
			if (appComponent === undefined) {
				throw new Error("undefined AppComponent for function handleStickyOn");
			}

			if (!appComponent.getRouterProxy().hasNavigationGuard()) {
				const hashTracker = appComponent.getRouterProxy().getHash();
				const internalModel = this.getInternalModel();

				// Set a guard in the RouterProxy
				// A timeout is necessary, as with deferred creation the hashChanger is not updated yet with
				// the new hash, and the guard cannot be found in the managed history of the router proxy
				setTimeout(function () {
					appComponent.getRouterProxy().setNavigationGuard(context.getPath().substring(1));
				}, 0);

				// Setting back navigation on shell service, to get the dicard message box in case of sticky
				appComponent.getShellServices().setBackNavigation(this.onBackNavigationInSession.bind(this));

				this.dirtyStateProviderFunction = this.getDirtyStateProvider(appComponent, internalModel, hashTracker);
				appComponent.getShellServices().registerDirtyStateProvider(this.dirtyStateProviderFunction);

				// handle session timeout
				const i18nModel = this.getView().getModel("sap.fe.i18n");
				this.sessionTimeoutFunction = this.getSessionTimeoutFunction(context, i18nModel);
				(this.getView().getModel() as any).attachSessionTimeout(this.sessionTimeoutFunction);

				this.stickyDiscardAfterNavigationFunction = this.getRouteMatchedFunction(context, appComponent);
				appComponent.getRoutingService().attachRouteMatched(this.stickyDiscardAfterNavigationFunction);
			}
		} catch (error) {
			Log.info(error as any);
			return false;
		}

		return true;
	}

	/**
	 * Disables the sticky edit session.
	 *
	 * @returns True in case of success, false otherwise
	 */
	private handleStickyOff(): boolean {
		const appComponent = this.getAppComponent();
		try {
			if (appComponent === undefined) {
				throw new Error("undefined AppComponent for function handleStickyOff");
			}

			if (appComponent.getRouterProxy) {
				// If we have exited from the app, CommonUtils.getAppComponent doesn't return a
				// sap.fe.core.AppComponent, hence the 'if' above
				appComponent.getRouterProxy().discardNavigationGuard();
			}

			if (this.dirtyStateProviderFunction) {
				appComponent.getShellServices().deregisterDirtyStateProvider(this.dirtyStateProviderFunction);
				this.dirtyStateProviderFunction = undefined;
			}

			const model = this.getView().getModel() as ODataModel;
			if (model && this.sessionTimeoutFunction) {
				model.detachSessionTimeout(this.sessionTimeoutFunction);
			}

			appComponent.getRoutingService().detachRouteMatched(this.stickyDiscardAfterNavigationFunction);
			this.stickyDiscardAfterNavigationFunction = undefined;

			this.setEditMode(EditMode.Display, false);

			if (appComponent.getShellServices) {
				// If we have exited from the app, CommonUtils.getAppComponent doesn't return a
				// sap.fe.core.AppComponent, hence the 'if' above
				appComponent.getShellServices().setBackNavigation();
			}
		} catch (error) {
			Log.info(error as any);
			return false;
		}

		return true;
	}

	_setStickySessionInternalProperties(programmingModel: string, model: ODataModel) {
		if (programmingModel === ProgrammingModel.Sticky) {
			const internalModel = this.getInternalModel();
			internalModel.setProperty("/sessionOn", true);
			internalModel.setProperty("/stickySessionToken", (model.getHttpHeaders(true) as any)["SAP-ContextId"]);
		}
	}

	/**
	 * Returns a callback function to be used as a DirtyStateProvider in the Shell.
	 *
	 * @param appComponent The app component
	 * @param internalModel The model "internal"
	 * @param hashTracker Hash tracker
	 * @returns The callback function
	 */
	private getDirtyStateProvider(appComponent: AppComponent, internalModel: JSONModel, hashTracker: string) {
		return (navigationContext: any) => {
			try {
				if (navigationContext === undefined) {
					throw new Error("Invalid input parameters for DirtyStateProvider function");
				}

				const targetHash = navigationContext.innerAppRoute;
				const routerProxy = appComponent.getRouterProxy();
				let lclHashTracker = "";
				let isDirty: boolean;
				const isSessionOn = internalModel.getProperty("/sessionOn");

				if (!isSessionOn) {
					// If the sticky session was terminated before hand.
					// Example in case of navigating away from application using IBN.
					return undefined;
				}

				if (!routerProxy.isNavigationFinalized()) {
					// If navigation is currently happening in RouterProxy, it's a transient state
					// (not dirty)
					isDirty = false;
					lclHashTracker = targetHash;
				} else if (hashTracker === targetHash) {
					// the hash didn't change so either the user attempts to refresh or to leave the app
					isDirty = true;
				} else if (routerProxy.checkHashWithGuard(targetHash) || routerProxy.isGuardCrossAllowedByUser()) {
					// the user attempts to navigate within the root object
					// or crossing the guard has already been allowed by the RouterProxy
					lclHashTracker = targetHash;
					isDirty = false;
				} else {
					// the user attempts to navigate within the app, for example back to the list report
					isDirty = true;
				}

				if (isDirty) {
					// the FLP doesn't call the dirty state provider anymore once it's dirty, as they can't
					// change this due to compatibility reasons we set it back to not-dirty
					setTimeout(function () {
						appComponent.getShellServices().setDirtyFlag(false);
					}, 0);
				} else {
					hashTracker = lclHashTracker;
				}

				return isDirty;
			} catch (error) {
				Log.info(error as any);
				return undefined;
			}
		};
	}

	/**
	 * Returns a callback function to be used when a sticky session times out.
	 *
	 * @param stickyContext The context for the sticky session
	 * @param i18nModel
	 * @returns The callback function
	 */
	private getSessionTimeoutFunction(stickyContext: Context, i18nModel: Model) {
		return () => {
			try {
				if (stickyContext === undefined) {
					throw new Error("Context missing for SessionTimeout function");
				}
				// remove transient messages since we will showing our own message
				this.getMessageHandler().removeTransitionMessages();

				const warningDialog = new Dialog({
					title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
					state: "Warning",
					content: new Text({ text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}" }),
					beginButton: new Button({
						text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
						type: "Emphasized",
						press: () => {
							// remove sticky handling after navigation since session has already been terminated
							this.handleStickyOff();
							this.getInternalRouting().navigateBackFromContext(stickyContext);
						}
					}),
					afterClose: function () {
						warningDialog.destroy();
					}
				});
				warningDialog.addStyleClass("sapUiContentPadding");
				warningDialog.setModel(i18nModel, "sap.fe.i18n");
				this.getView().addDependent(warningDialog);
				warningDialog.open();
			} catch (error) {
				Log.info(error as any);
				return undefined;
			}
			return true;
		};
	}

	/**
	 * Returns a callback function for the onRouteMatched event in case of sticky edition.
	 *
	 * @param context The context being edited (root of the sticky session)
	 * @param appComponent The app component
	 * @returns The callback function
	 */
	private getRouteMatchedFunction(context: Context, appComponent: AppComponent) {
		return () => {
			const currentHash = appComponent.getRouterProxy().getHash();
			// either current hash is empty so the user left the app or he navigated away from the object
			if (!currentHash || !appComponent.getRouterProxy().checkHashWithGuard(currentHash)) {
				this.discardStickySession(context);
				setTimeout(() => {
					//clear the session context to ensure the LR refreshes the list without a session
					(context.getModel() as any).clearSessionContext();
				}, 0);
			}
		};
	}

	/**
	 * Ends a sticky session by discarding changes.
	 *
	 * @param context The context being edited (root of the sticky session)
	 */
	private async discardStickySession(context: Context) {
		const discardedContext = await sticky.discardDocument(context);
		if (discardedContext?.hasPendingChanges()) {
			discardedContext.getBinding().resetChanges();
		}
		discardedContext?.refresh();
		this.handleStickyOff();
	}

	/**
	 * Gets the internal routing extension.
	 *
	 * @returns The internal routing extension
	 */
	private getInternalRouting(): InternalRouting {
		if (this.base._routing) {
			return this.base._routing;
		} else {
			throw new Error("Edit Flow works only with a given routing listener");
		}
	}

	_getRootViewController() {
		return this.getAppComponent().getRootViewController();
	}

	_getSemanticMapping(): SemanticMapping | undefined {
		return this.getAppComponent().getRoutingService().getLastSemanticMapping();
	}

	/**
	 * Creates a new promise to wait for an action to be executed.
	 *
	 * @param actionName The name of the action
	 * @param controlId The ID of the control
	 * @returns {Function} The resolver function which can be used to externally resolve the promise
	 */
	private createActionPromise(actionName: string, controlId: string) {
		let resolveFunction, rejectFunction;
		this.actionPromise = new Promise((resolve, reject) => {
			resolveFunction = resolve;
			rejectFunction = reject;
		}).then((oResponse: any) => {
			return Object.assign({ controlId }, this.getActionResponseDataAndKeys(actionName, oResponse));
		});
		return { fResolver: resolveFunction, fRejector: rejectFunction };
	}

	/**
	 *
	 * @param actionName The name of the action that is executed
	 * @param response The bound action's response data or response context
	 * @returns Object with data and names of the key fields of the response
	 */
	private getActionResponseDataAndKeys(actionName: string, response: any) {
		if (Array.isArray(response)) {
			if (response.length === 1) {
				response = response[0].value;
			} else {
				return null;
			}
		}
		if (!response) {
			return null;
		}
		const currentView = this.getView();
		const metaModelData = (currentView.getModel().getMetaModel() as any).getData();
		const actionReturnType =
			metaModelData && metaModelData[actionName] && metaModelData[actionName][0] && metaModelData[actionName][0].$ReturnType
				? metaModelData[actionName][0].$ReturnType.$Type
				: null;
		const keys = actionReturnType && metaModelData[actionReturnType] ? metaModelData[actionReturnType].$Key : null;

		return {
			oData: response.getObject(),
			keys
		};
	}

	getCurrentActionPromise() {
		return this.actionPromise;
	}

	deleteCurrentActionPromise() {
		this.actionPromise = undefined;
	}

	_scrollAndFocusOnInactiveRow(table: Table) {
		const rowBinding = table.getRowBinding() as ODataListBinding;
		const activeRowIndex: number = rowBinding.getCount() || 0;
		if (table.data("tableType") !== "ResponsiveTable") {
			if (activeRowIndex > 0) {
				table.scrollToIndex(activeRowIndex - 1);
			}
			table.focusRow(activeRowIndex, true);
		} else {
			/* In a responsive table, the empty rows appear at the beginning of the table. But when we create more, they appear below the new line.
			 * So we check the first inactive row first, then we set the focus on it when we press the button.
			 * This doesn't impact the GridTable because they appear at the end, and we already focus the before-the-last row (because 2 empty rows exist)
			 */
			const allRowContexts = rowBinding.getContexts();
			if (!allRowContexts?.length) {
				table.focusRow(activeRowIndex, true);
				return;
			}
			let focusRow = activeRowIndex,
				index = 0;
			for (const singleContext of allRowContexts) {
				if (singleContext.isInactive() && index < focusRow) {
					focusRow = index;
				}
				index++;
			}
			if (focusRow > 0) {
				table.scrollToIndex(focusRow);
			}
			table.focusRow(focusRow, true);
		}
	}
	async createEmptyRowsAndFocus(table: Table) {
		const tableAPI = table.getParent() as TableAPI;
		if (
			tableAPI?.tableDefinition?.control?.inlineCreationRowsHiddenInEditMode &&
			!table.getBindingContext("ui")?.getProperty("createMode")
		) {
			// With the parameter, we don't have empty rows in Edit mode, so we need to create them before setting the focus on them
			await tableAPI.setUpEmptyRows(table, true);
		}
		this._scrollAndFocusOnInactiveRow(table);
	}

	_sendActivity(
		action: Activity,
		relatedContexts: Context | Context[] | undefined,
		actionName?: string,
		refreshListBinding?: boolean,
		actionRequestedProperties?: string[]
	) {
		const content = Array.isArray(relatedContexts) ? relatedContexts.map((context) => context.getPath()) : relatedContexts?.getPath();
		ActivitySync.send(this.getView(), action, content, actionName, refreshListBinding, actionRequestedProperties);
	}

	_triggerConfiguredSurvey(sActionName: string, triggerType: TriggerType) {
		triggerConfiguredSurvey(this.getView(), sActionName, triggerType);
	}

	async _submitOpenChanges(oContext: any): Promise<any> {
		const oModel = oContext.getModel(),
			oLockObject = this.getGlobalUIModel();

		try {
			// Submit any leftover changes that are not yet submitted
			// Currently we are using only 1 updateGroupId, hence submitting the batch directly here
			await oModel.submitBatch("$auto");

			// Wait for all currently running changes
			// For the time being we agreed with the v4 model team to use an internal method. We'll replace it once
			// a public or restricted method was provided
			await oModel.oRequestor.waitForRunningChangeRequests("$auto");

			// Check if all changes were submitted successfully
			if (oModel.hasPendingChanges("$auto")) {
				throw new Error("submit of open changes failed");
			}
		} finally {
			if (BusyLocker.isLocked(oLockObject)) {
				BusyLocker.unlock(oLockObject);
			}
		}
	}

	_removeStickySessionInternalProperties(programmingModel: string) {
		if (programmingModel === ProgrammingModel.Sticky) {
			const internalModel = this.getInternalModel();
			internalModel.setProperty("/sessionOn", false);
			internalModel.setProperty("/stickySessionToken", undefined);
			this.handleStickyOff();
		}
	}

	/**
	 * Method to display a 'discard' popover when exiting a sticky session.
	 */
	private onBackNavigationInSession() {
		const view = this.getView();
		const routerProxy = this.getAppComponent().getRouterProxy();

		if (routerProxy.checkIfBackIsOutOfGuard()) {
			const bindingContext = view.getBindingContext() as Context;
			const programmingModel = this.getProgrammingModel(bindingContext);

			sticky.processDataLossConfirmation(
				async () => {
					await this.discardStickySession(bindingContext);
					this._removeStickySessionInternalProperties(programmingModel);
					history.back();
				},
				view,
				programmingModel
			);

			return;
		}
		history.back();
	}

	async _handleNewContext(
		oContext: Context,
		bEditable: boolean,
		bRecreateContext: boolean,
		bDraftNavigation: boolean,
		bForceFocus = false
	) {
		if (!this._isFclEnabled()) {
			EditState.setEditStateDirty();
		}

		await this.getInternalRouting().navigateToContext(oContext, {
			checkNoHashChange: true,
			editable: bEditable,
			bPersistOPScroll: true,
			bRecreateContext: bRecreateContext,
			bDraftNavigation: bDraftNavigation,
			showPlaceholder: false,
			bForceFocus: bForceFocus,
			keepCurrentLayout: true
		});
	}

	_getBoundContext(view: any, params: any) {
		const viewLevel = view.getViewData().viewLevel;
		const bRefreshAfterAction = viewLevel > 1 || (viewLevel === 1 && params.controlId);
		return !params.isNavigable || !!bRefreshAfterAction;
	}

	/**
	 * Checks if there are validation (parse) errors for controls bound to a given context
	 *
	 * @function
	 * @name _checkForValidationErrors
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @returns {Promise} Promise resolves if there are no validation errors, and rejects if there are validation errors
	 */

	_checkForValidationErrors() {
		return this.syncTask().then(() => {
			const sViewId = this.getView().getId();
			const aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
			let oControl;
			let oMessage;

			if (!aMessages.length) {
				return Promise.resolve("No validation errors found");
			}

			for (let i = 0; i < aMessages.length; i++) {
				oMessage = aMessages[i];
				if (oMessage.validation) {
					oControl = Core.byId(oMessage.getControlId());
					while (oControl) {
						if (oControl.getId() === sViewId) {
							return Promise.reject("validation errors exist");
						}
						oControl = oControl.getParent();
					}
				}
			}
		});
	}

	/**
	 * @function
	 * @name _refreshListIfRequired
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oResponse The response of the bound action and the names of the key fields
	 * @param oContext The bound context on which the action was executed
	 * @returns Always resolves to param oResponse
	 */
	_refreshListIfRequired(oResponse: any, oContext: Context): Promise<boolean | undefined> {
		if (!oContext || !oResponse || !oResponse.oData) {
			return Promise.resolve(undefined);
		}
		const oBinding = oContext.getBinding();
		// refresh only lists
		if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
			const oContextData = oResponse.oData;
			const aKeys = oResponse.keys;
			const oCurrentData = oContext.getObject();
			let bReturnedContextIsSame = true;
			// ensure context is in the response
			if (Object.keys(oContextData).length) {
				// check if context in response is different than the bound context
				bReturnedContextIsSame = aKeys.every(function (sKey: any) {
					return oCurrentData[sKey] === oContextData[sKey];
				});
				if (!bReturnedContextIsSame) {
					return new Promise<boolean>((resolve) => {
						if ((oBinding as any).isRoot()) {
							oBinding.attachEventOnce("dataReceived", function () {
								resolve(!bReturnedContextIsSame);
							});
							oBinding.refresh();
						} else {
							const oAppComponent = this.getAppComponent();
							oAppComponent
								.getSideEffectsService()
								.requestSideEffects([{ $NavigationPropertyPath: oBinding.getPath() }], oBinding.getContext() as Context)
								.then(
									function () {
										resolve(!bReturnedContextIsSame);
									},
									function () {
										Log.error("Error while refreshing the table");
										resolve(!bReturnedContextIsSame);
									}
								)
								.catch(function (e: any) {
									Log.error("Error while refreshing the table", e);
								});
						}
					});
				}
			}
		}
		// resolve with oResponse to not disturb the promise chain afterwards
		return Promise.resolve(undefined);
	}

	_fetchSemanticKeyValues(oContext: Context): Promise<any> {
		const oMetaModel = oContext.getModel().getMetaModel() as any,
			sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name"),
			aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName);

		if (aSemanticKeys && aSemanticKeys.length) {
			const aRequestPromises = aSemanticKeys.map(function (oKey: any) {
				return oContext.requestObject(oKey.$PropertyPath);
			});

			return Promise.all(aRequestPromises);
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Provides the latest context in the metadata hierarchy from rootBinding to given context pointing to given entityType
	 * if any such context exists. Otherwise, it returns the original context.
	 * Note: It is only needed as work-around for incorrect modelling. Correct modelling would imply a DataFieldForAction in a LineItem
	 * to point to an overload defined either on the corresponding EntityType or a collection of the same.
	 *
	 * @param rootContext The context to start searching from
	 * @param listBinding The listBinding of the table
	 * @param overloadEntityType The ActionOverload entity type to search for
	 * @returns Returns the context of the ActionOverload entity
	 */
	_getActionOverloadContextFromMetadataPath(rootContext: Context, listBinding: ODataListBinding, overloadEntityType: string): Context {
		const model: ODataModel = rootContext.getModel();
		const metaModel: ODataMetaModel = model.getMetaModel();
		let contextSegments: string[] = listBinding.getPath().split("/");
		let currentContext: Context = rootContext;

		// We expect that the last segment of the listBinding is the ListBinding of the table. Remove this from contextSegments
		// because it is incorrect to execute bindContext on a list. We do not anyway need to search this context for the overload.
		contextSegments.pop();
		if (contextSegments.length === 0) {
			contextSegments = [""]; // Don't leave contextSegments undefined
		}

		if (contextSegments[0] !== "") {
			contextSegments.unshift(""); // to also get the root context, i.e. the bindingContext of the table
		}
		// load all the parent contexts into an array
		const parentContexts: Context[] = contextSegments
			.map((pathSegment: string) => {
				if (pathSegment !== "") {
					currentContext = model.bindContext(pathSegment, currentContext).getBoundContext();
				} else {
					// Creating a new context using bindContext(...).getBoundContext() does not work if the etag is needed. According to model colleagues,
					// we should always use an existing context if possible.
					// Currently, the only example we know about is using the rootContext - and in this case, we can obviously reuse that existing context.
					// If other examples should come up, the best possible work around would be to request some data to get an existing context. To keep the
					// request as small and fast as possible, we should request only the first key property. As this would introduce asynchronism, and anyway
					// the whole logic is only part of work-around for incorrect modelling, we wait until we have an example needing it before implementing this.
					currentContext = rootContext;
				}
				return currentContext;
			})
			.reverse();
		// search for context backwards
		const overloadContext: Context | undefined = parentContexts.find(
			(parentContext: Context) =>
				(metaModel.getMetaContext(parentContext.getPath()).getObject("$Type") as unknown as string) === overloadEntityType
		);
		return overloadContext || listBinding.getHeaderContext()!;
	}

	_createSiblingInfo(currentContext: Context, newContext: Context): SiblingInformation {
		return {
			targetContext: newContext,
			pathMapping: [
				{
					oldPath: currentContext.getPath(),
					newPath: newContext.getPath()
				}
			]
		};
	}

	_updatePathsInHistory(mappings: { oldPath: string; newPath: string }[]) {
		const oAppComponent = this.getAppComponent();
		oAppComponent.getRouterProxy().setPathMapping(mappings);

		// Also update the semantic mapping in the routing service
		const lastSemanticMapping = this._getSemanticMapping();
		if (mappings.length && lastSemanticMapping?.technicalPath === mappings[mappings.length - 1].oldPath) {
			lastSemanticMapping.technicalPath = mappings[mappings.length - 1].newPath;
		}
	}

	_getNavigationTargetForEdit(context: Context, newDocumentContext: Context, siblingInfo: SiblingInformation | undefined) {
		let contextToNavigate: Context | undefined;
		siblingInfo = siblingInfo ?? this._createSiblingInfo(context, newDocumentContext);
		this._updatePathsInHistory(siblingInfo.pathMapping);
		if (siblingInfo.targetContext.getPath() != newDocumentContext.getPath()) {
			contextToNavigate = siblingInfo.targetContext;
		}
		return contextToNavigate;
	}

	/**
	 * This method creates a sibling context for a subobject page, and calculates a sibling path
	 * for all intermediate paths between the object page and the subobject page.
	 *
	 * @param rootCurrentContext The context for the root of the draft
	 * @param rightmostCurrentContext The context of the subobject
	 * @param sProgrammingModel The programming model
	 * @param doNotComputeIfRoot If true, we don't compute siblingInfo if the root and the rightmost contexts are the same
	 * @returns Returns the siblingInformation object
	 */
	async _computeSiblingInformation(
		rootCurrentContext: Context,
		rightmostCurrentContext: Context | null | undefined,
		sProgrammingModel: string,
		doNotComputeIfRoot: boolean
	): Promise<SiblingInformation | undefined> {
		rightmostCurrentContext = rightmostCurrentContext ?? rootCurrentContext;
		if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
			// Wrong usage !!
			Log.error("Cannot compute rightmost sibling context");
			throw new Error("Cannot compute rightmost sibling context");
		}
		if (doNotComputeIfRoot && rightmostCurrentContext.getPath() === rootCurrentContext.getPath()) {
			return Promise.resolve(undefined);
		}

		const model = rootCurrentContext.getModel();
		if (sProgrammingModel === ProgrammingModel.Draft) {
			return draft.computeSiblingInformation(rootCurrentContext, rightmostCurrentContext);
		} else {
			// If not in draft mode, we just recreate a context from the path of the rightmost context
			// No path mapping is needed
			return {
				targetContext: model.bindContext(rightmostCurrentContext.getPath()).getBoundContext(),
				pathMapping: []
			};
		}
	}

	_isFclEnabled(): boolean {
		return this.getAppComponent()._isFclEnabled();
	}
}

export default EditFlow;
