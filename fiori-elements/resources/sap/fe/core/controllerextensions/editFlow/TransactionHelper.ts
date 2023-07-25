import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import operations from "sap/fe/core/controllerextensions/editFlow/operations";
import sticky from "sap/fe/core/controllerextensions/editFlow/sticky";
import type MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";
import messageHandling from "sap/fe/core/controllerextensions/messageHandler/messageHandling";
import deleteHelper from "sap/fe/core/helpers/DeleteHelper";
import FPMHelper from "sap/fe/core/helpers/FPMHelper";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import FELibrary from "sap/fe/core/library";
import ResourceModel from "sap/fe/core/ResourceModel";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Popover, { $PopoverSettings } from "sap/m/Popover";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import coreLibrary from "sap/ui/core/library";
import type View from "sap/ui/core/mvc/View";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import type Binding from "sap/ui/model/Binding";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataV4Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import { getNonComputedVisibleFields, getRequiredPropertiesFromInsertRestrictions } from "../../helpers/MetaModelFunction";
import toES6Promise from "../../helpers/ToES6Promise";

const CreationMode = FELibrary.CreationMode;
const ProgrammingModel = FELibrary.ProgrammingModel;
const ValueState = coreLibrary.ValueState;
/* Make sure that the mParameters is not the oEvent */
function getParameters(mParameters: any) {
	if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
		mParameters = {};
	}
	return mParameters || {};
}

class TransactionHelper {
	busyLock(appComponent: AppComponent, busyPath?: string) {
		BusyLocker.lock(appComponent.getModel("ui"), busyPath);
	}

	busyUnlock(appComponent: AppComponent, busyPath?: string) {
		BusyLocker.unlock(appComponent.getModel("ui"), busyPath);
	}

	getProgrammingModel(source: ODataV4Context | Binding): typeof ProgrammingModel {
		let path: string;
		if (source.isA<ODataV4Context>("sap.ui.model.odata.v4.Context")) {
			path = source.getPath();
		} else {
			path = (source.isRelative() ? source.getResolvedPath() : source.getPath()) ?? "";
		}

		const metaModel = source.getModel().getMetaModel() as ODataMetaModel;
		if (ModelHelper.isDraftSupported(metaModel, path)) {
			return ProgrammingModel.Draft;
		} else if (ModelHelper.isStickySessionSupported(metaModel)) {
			return ProgrammingModel.Sticky;
		} else {
			return ProgrammingModel.NonDraft;
		}
	}

	/**
	 * Validates a document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the document to be validated
	 * @param [mParameters] Can contain the following attributes:
	 * @param [mParameters.data] A map of data that should be validated
	 * @param [mParameters.customValidationFunction] A string representing the path to the validation function
	 * @param oView Contains the object of the current view
	 * @returns Promise resolves with result of the custom validation function
	 * @ui5-restricted
	 * @final
	 */
	validateDocument(oContext: ODataV4Context, mParameters: any, oView: View): Promise<any> {
		const sCustomValidationFunction = mParameters && mParameters.customValidationFunction;
		if (sCustomValidationFunction) {
			const sModule = sCustomValidationFunction.substring(0, sCustomValidationFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
				sFunctionName = sCustomValidationFunction.substring(
					sCustomValidationFunction.lastIndexOf(".") + 1,
					sCustomValidationFunction.length
				),
				mData = mParameters.data;
			delete mData["@$ui5.context.isTransient"];
			return FPMHelper.validationWrapper(sModule, sFunctionName, mData, oView, oContext);
		}
		return Promise.resolve([]);
	}

	/**
	 * Creates a new document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oMainListBinding OData V4 ListBinding object
	 * @param [mInParameters] Optional, can contain the following attributes:
	 * @param [mInParameters.data] A map of data that should be sent within the POST
	 * @param [mInParameters.busyMode] Global (default), Local, None TODO: to be refactored
	 * @param [mInParameters.busyId] ID of the local busy indicator
	 * @param [mInParameters.keepTransientContextOnFailed] If set, the context stays in the list if the POST failed and POST will be repeated with the next change
	 * @param [mInParameters.inactive] If set, the context is set as inactive for empty rows
	 * @param [mInParameters.skipParameterDialog] Skips the action parameter dialog
	 * @param appComponent The app component
	 * @param messageHandler The message handler extension
	 * @param fromCopyPaste True if the creation has been triggered by a paste action
	 * @returns Promise resolves with new binding context
	 * @ui5-restricted
	 * @final
	 */
	async createDocument(
		oMainListBinding: ODataListBinding,
		mInParameters:
			| {
					data?: any;
					busyMode?: string | undefined;
					busyId: string | undefined;
					keepTransientContextOnFailed?: boolean;
					inactive?: boolean;
			  }
			| undefined,
		appComponent: AppComponent,
		messageHandler: MessageHandler,
		fromCopyPaste: boolean
	): Promise<ODataV4Context> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const oModel = oMainListBinding.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext()!.getPath()),
			sCreateHash = appComponent.getRouterProxy().getHash(),
			oComponentData = appComponent.getComponentData(),
			oStartupParameters = (oComponentData && oComponentData.startupParameters) || {},
			sNewAction = !oMainListBinding.isRelative()
				? this._getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath)
				: undefined;
		const mBindingParameters: any = { $$patchWithoutSideEffects: true };
		const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
		let sBusyPath = "/busy";
		let sFunctionName =
			oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) ||
			oMetaModel.getObject(
				`${ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath))}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`
			);
		let bFunctionOnNavProp;
		let oNewDocumentContext: ODataV4Context | undefined;
		if (sFunctionName) {
			if (
				oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) &&
				ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)) !== sMetaPath
			) {
				bFunctionOnNavProp = true;
			} else {
				bFunctionOnNavProp = false;
			}
		}
		if (sMessagesPath) {
			mBindingParameters["$select"] = sMessagesPath;
		}
		const mParameters = getParameters(mInParameters);
		if (!oMainListBinding) {
			throw new Error("Binding required for new document creation");
		}
		const sProgrammingModel = this.getProgrammingModel(oMainListBinding);
		if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
			throw new Error("Create document only allowed for draft or sticky session supported services");
		}
		if (mParameters.busyMode === "Local") {
			sBusyPath = `/busyLocal/${mParameters.busyId}`;
		}
		mParameters.beforeCreateCallBack = fromCopyPaste ? null : mParameters.beforeCreateCallBack;
		this.busyLock(appComponent, sBusyPath);
		const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
		let oResult: any;

		try {
			if (sNewAction) {
				oResult = await this.callAction(
					sNewAction,
					{
						contexts: oMainListBinding.getHeaderContext(),
						showActionParameterDialog: true,
						label: this._getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore),
						bindingParameters: mBindingParameters,
						parentControl: mParameters.parentControl,
						bIsCreateAction: true,
						skipParameterDialog: mParameters.skipParameterDialog
					},
					null,
					appComponent,
					messageHandler
				);
			} else {
				const bIsNewPageCreation =
					mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
				const aNonComputedVisibleKeyFields = bIsNewPageCreation
					? getNonComputedVisibleFields(oMetaModel, sMetaPath, appComponent)
					: [];
				sFunctionName = fromCopyPaste ? null : sFunctionName;
				let sFunctionPath, oFunctionContext;
				if (sFunctionName) {
					//bound to the source entity:
					if (bFunctionOnNavProp) {
						sFunctionPath =
							oMainListBinding.getContext() &&
							`${oMetaModel.getMetaPath(oMainListBinding.getContext().getPath())}/${sFunctionName}`;
						oFunctionContext = oMainListBinding.getContext();
					} else {
						sFunctionPath =
							oMainListBinding.getHeaderContext() &&
							`${oMetaModel.getMetaPath(oMainListBinding.getHeaderContext()!.getPath())}/${sFunctionName}`;
						oFunctionContext = oMainListBinding.getHeaderContext();
					}
				}
				const oFunction = sFunctionPath && (oMetaModel.createBindingContext(sFunctionPath) as any);

				try {
					let oData: any;
					try {
						const oContext =
							oFunction && oFunction.getObject() && oFunction.getObject()[0].$IsBound
								? await operations.callBoundFunction(sFunctionName, oFunctionContext, oModel)
								: await operations.callFunctionImport(sFunctionName, oModel);
						if (oContext) {
							oData = oContext.getObject();
						}
					} catch (oError: any) {
						Log.error(`Error while executing the function ${sFunctionName}`, oError);
						throw oError;
					}
					mParameters.data = oData ? Object.assign({}, oData, mParameters.data) : mParameters.data;
					if (mParameters.data) {
						delete mParameters.data["@odata.context"];
					}
					if (aNonComputedVisibleKeyFields.length > 0) {
						oResult = await this._launchDialogWithKeyFields(
							oMainListBinding,
							aNonComputedVisibleKeyFields,
							oModel,
							mParameters,
							appComponent,
							messageHandler
						);
						oNewDocumentContext = oResult.newContext;
					} else {
						if (mParameters.beforeCreateCallBack) {
							await toES6Promise(
								mParameters.beforeCreateCallBack({
									contextPath: oMainListBinding && oMainListBinding.getPath()
								})
							);
						}

						oNewDocumentContext = oMainListBinding.create(
							mParameters.data,
							true,
							mParameters.createAtEnd,
							mParameters.inactive
						);
						if (!mParameters.inactive) {
							oResult = await this.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters);
						}
					}
				} catch (oError: any) {
					Log.error("Error while creating the new document", oError);
					throw oError;
				}
			}

			oNewDocumentContext = oNewDocumentContext || oResult;

			await messageHandler.showMessageDialog({ control: mParameters.parentControl });
			return oNewDocumentContext!;
		} catch (error: unknown) {
			// TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
			await messageHandler.showMessageDialog({ control: mParameters.parentControl });
			if (
				(error === FELibrary.Constants.ActionExecutionFailed || error === FELibrary.Constants.CancelActionDialog) &&
				oNewDocumentContext?.isTransient()
			) {
				// This is a workaround suggested by model as Context.delete results in an error
				// TODO: remove the $direct once model resolves this issue
				// this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
				oNewDocumentContext.delete("$direct");
			}
			throw error;
		} finally {
			this.busyUnlock(appComponent, sBusyPath);
		}
	}

	_isDraftEnabled(vContexts: ODataV4Context[]) {
		const contextForDraftModel = vContexts[0];
		const sProgrammingModel = this.getProgrammingModel(contextForDraftModel);
		return sProgrammingModel === ProgrammingModel.Draft;
	}

	/**
	 * Delete one or multiple document(s).
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param contexts Contexts Either one context or an array with contexts to be deleted
	 * @param mParameters Optional, can contain the following attributes:
	 * @param mParameters.title Title of the object to be deleted
	 * @param mParameters.description Description of the object to be deleted
	 * @param mParameters.numberOfSelectedContexts Number of objects selected
	 * @param mParameters.noDialog To disable the confirmation dialog
	 * @param appComponent The appComponent
	 * @param resourceModel The resource model to load text resources
	 * @param messageHandler The message handler extension
	 * @returns A Promise resolved once the documents are deleted
	 */
	deleteDocument(
		contexts: ODataV4Context | ODataV4Context[],
		mParameters: any,
		appComponent: AppComponent,
		resourceModel: ResourceModel,
		messageHandler: MessageHandler
	) {
		const resourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
		let aParams;
		this.busyLock(appComponent);

		const contextsToDelete = Array.isArray(contexts) ? [...contexts] : [contexts];

		return new Promise<void>((resolve, reject) => {
			try {
				const draftEnabled = this._isDraftEnabled(mParameters.selectedContexts || contextsToDelete);
				const items: any[] = [];
				const options: any[] = [];

				if (mParameters) {
					if (!mParameters.numberOfSelectedContexts) {
						// non-Table
						if (draftEnabled) {
							// Check if 1 of the drafts is locked by another user
							const lockedContext = contextsToDelete.find((context) => {
								const contextData = context.getObject();
								return (
									contextData.IsActiveEntity === true &&
									contextData.HasDraftEntity === true &&
									contextData.DraftAdministrativeData &&
									contextData.DraftAdministrativeData.InProcessByUser &&
									!contextData.DraftAdministrativeData.DraftIsCreatedByMe
								);
							});
							if (lockedContext) {
								// Show message box with the name of the locking user and return
								const lockingUserName = lockedContext.getObject().DraftAdministrativeData.InProcessByUser;
								MessageBox.show(
									resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", [
										lockingUserName
									]),
									{
										title: resourceModel.getText("C_COMMON_DELETE"),
										onClose: reject
									}
								);
								return;
							}
						}
						mParameters = getParameters(mParameters);
						let nonTableTxt = "";
						if (mParameters.title) {
							if (mParameters.description) {
								aParams = [mParameters.title + " ", mParameters.description];
							} else {
								aParams = [mParameters.title, ""];
							}
							nonTableTxt = resourceModel.getText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO",
								aParams,
								mParameters.entitySetName
							);
						} else {
							nonTableTxt = resourceModel.getText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
								undefined,
								mParameters.entitySetName
							);
						}
						options.push({
							type: "deletableContexts",
							contexts: contextsToDelete,
							text: nonTableTxt,
							selected: true,
							control: "text"
						});
					} else {
						// Table
						let totalDeletable = contextsToDelete.length;

						if (draftEnabled) {
							totalDeletable +=
								mParameters.draftsWithNonDeletableActive.length +
								mParameters.draftsWithDeletableActive.length +
								mParameters.unSavedContexts.length +
								mParameters.createModeContexts.length;
							deleteHelper.updateDraftOptionsForDeletableTexts(
								mParameters,
								contextsToDelete,
								totalDeletable,
								resourceModel,
								items,
								options
							);
						} else {
							const nonDeletableText = deleteHelper.getNonDeletableText(mParameters, totalDeletable, resourceModel);
							if (nonDeletableText) {
								items.push(nonDeletableText);
							}
						}

						deleteHelper.updateOptionsForDeletableTexts(mParameters, contextsToDelete, resourceModel, options);
					}
				}

				// Content of Delete Dialog
				deleteHelper.updateContentForDeleteDialog(options, items);
				const vBox = new VBox({ items: items });
				const sTitle = resourceBundleCore.getText("C_COMMON_DELETE");

				const fnConfirm = async () => {
					this.busyLock(appComponent);
					try {
						await deleteHelper.deleteConfirmHandler(
							options,
							mParameters,
							messageHandler,
							resourceModel,
							appComponent,
							draftEnabled
						);
						resolve();
					} catch (oError: any) {
						reject();
					} finally {
						this.busyUnlock(appComponent);
					}
				};

				let dialogConfirmed = false;
				const oDialog = new Dialog({
					title: sTitle,
					state: "Warning",
					content: [vBox],
					ariaLabelledBy: items,
					beginButton: new Button({
						text: resourceBundleCore.getText("C_COMMON_DELETE"),
						type: "Emphasized",
						press: function () {
							messageHandling.removeBoundTransitionMessages();
							dialogConfirmed = true;
							oDialog.close();
							fnConfirm();
						}
					}),
					endButton: new Button({
						text: resourceModel.getText("C_COMMON_DIALOG_CANCEL"),
						press: function () {
							oDialog.close();
						}
					}),
					afterClose: function () {
						oDialog.destroy();
						// if dialog is closed unconfirmed (e.g. via "Cancel" or Escape button), ensure to reject promise
						if (!dialogConfirmed) {
							reject();
						}
					}
				} as any);
				if (mParameters.noDialog) {
					fnConfirm();
				} else {
					oDialog.addStyleClass("sapUiContentPadding");
					oDialog.open();
				}
			} finally {
				this.busyUnlock(appComponent);
			}
		});
	}

	/**
	 * Edits a document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the active document
	 * @param oView Current view
	 * @param appComponent The appComponent
	 * @param messageHandler The message handler extension
	 * @returns Promise resolves with the new draft context in case of draft programming model
	 * @ui5-restricted
	 * @final
	 */
	async editDocument(
		oContext: ODataV4Context,
		oView: View,
		appComponent: AppComponent,
		messageHandler: MessageHandler
	): Promise<ODataV4Context | undefined> {
		const sProgrammingModel = this.getProgrammingModel(oContext);
		if (!oContext) {
			throw new Error("Binding context to active document is required");
		}
		if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
			throw new Error("Edit is only allowed for draft or sticky session supported services");
		}
		this.busyLock(appComponent);
		// before triggering the edit action we'll have to remove all bound transition messages
		messageHandler.removeTransitionMessages();

		try {
			const oNewContext =
				sProgrammingModel === ProgrammingModel.Draft
					? await draft.createDraftFromActiveDocument(oContext, appComponent, {
							bPreserveChanges: true,
							oView: oView
					  } as any)
					: await sticky.editDocumentInStickySession(oContext, appComponent);

			await messageHandler.showMessageDialog();
			return oNewContext;
		} catch (err: any) {
			await messageHandler.showMessages({ concurrentEditFlag: true });
			throw err;
		} finally {
			this.busyUnlock(appComponent);
		}
	}

	/**
	 * Cancel 'edit' mode of a document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the document to be canceled or deleted
	 * @param [mInParameters] Optional, can contain the following attributes:
	 * @param mInParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
	 * @param mInParameters.skipDiscardPopover Optional, supresses the discard popover incase of draft applications while navigating out of OP
	 * @param appComponent The appComponent
	 * @param resourceModel The model to load text resources
	 * @param messageHandler The message handler extension
	 * @param isNewObject True if we're trying to cancel a newly created object
	 * @param isObjectModified True if the object has been modified by the user
	 * @returns Promise resolves with ???
	 * @ui5-restricted
	 * @final
	 */
	async cancelDocument(
		oContext: ODataV4Context,
		mInParameters: { cancelButton: Button; skipDiscardPopover: boolean } | undefined,
		appComponent: AppComponent,
		resourceModel: ResourceModel,
		messageHandler: MessageHandler,
		isNewObject: boolean,
		isObjectModified: boolean
	): Promise<ODataV4Context | boolean> {
		//context must always be passed - mandatory parameter
		if (!oContext) {
			throw new Error("No context exists. Pass a meaningful context");
		}
		this.busyLock(appComponent);
		const mParameters = getParameters(mInParameters);
		const oModel = oContext.getModel();
		const sProgrammingModel = this.getProgrammingModel(oContext);

		if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
			throw new Error("Cancel document only allowed for draft or sticky session supported services");
		}
		try {
			let returnedValue: ODataV4Context | boolean = false;

			if (sProgrammingModel === ProgrammingModel.Draft && !isObjectModified) {
				const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
				const draftAdminData = await draftDataContext.requestObject();
				if (draftAdminData) {
					isObjectModified = draftAdminData.CreationDateTime !== draftAdminData.LastChangeDateTime;
				}
			}
			if (!mParameters.skipDiscardPopover) {
				await this._confirmDiscard(mParameters.cancelButton, isObjectModified, resourceModel);
			}
			if (oContext.isKeepAlive()) {
				oContext.setKeepAlive(false);
			}
			if (mParameters.beforeCancelCallBack) {
				await mParameters.beforeCancelCallBack({ context: oContext });
			}
			if (sProgrammingModel === ProgrammingModel.Draft) {
				if (isNewObject) {
					if (oContext.hasPendingChanges()) {
						oContext.getBinding().resetChanges();
					}
					returnedValue = await draft.deleteDraft(oContext, appComponent);
				} else {
					const oSiblingContext = oModel.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
					try {
						const sCanonicalPath = await oSiblingContext.requestCanonicalPath();
						if (oContext.hasPendingChanges()) {
							oContext.getBinding().resetChanges();
						}
						returnedValue = oModel.bindContext(sCanonicalPath).getBoundContext();
					} finally {
						await draft.deleteDraft(oContext, appComponent);
					}
				}
			} else {
				const discardedContext = await sticky.discardDocument(oContext);
				if (discardedContext) {
					if (discardedContext.hasPendingChanges()) {
						discardedContext.getBinding().resetChanges();
					}
					if (!isNewObject) {
						discardedContext.refresh();
						returnedValue = discardedContext;
					}
				}
			}

			// remove existing bound transition messages
			messageHandler.removeTransitionMessages();
			// show unbound messages
			await messageHandler.showMessages();
			return returnedValue;
		} catch (err: any) {
			await messageHandler.showMessages();
			throw err;
		} finally {
			this.busyUnlock(appComponent);
		}
	}

	/**
	 * Saves the document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param context Context of the document to be saved
	 * @param appComponent The appComponent
	 * @param resourceModel The model to load text resources
	 * @param executeSideEffectsOnError True if we should execute side effects in case of an error
	 * @param bindingsForSideEffects The listBindings to be used for executing side effects on error
	 * @param messageHandler The message handler extension
	 * @param isNewObject True if we're trying to cancel a newly created object
	 * @returns Promise resolves with ???
	 * @ui5-restricted
	 * @final
	 */
	async saveDocument(
		context: ODataV4Context,
		appComponent: AppComponent,
		resourceModel: ResourceModel,
		executeSideEffectsOnError: boolean,
		bindingsForSideEffects: ODataListBinding[],
		messageHandler: MessageHandler,
		isNewObject: boolean
	): Promise<ODataV4Context> {
		const sProgrammingModel = this.getProgrammingModel(context);
		if (sProgrammingModel !== ProgrammingModel.Sticky && sProgrammingModel !== ProgrammingModel.Draft) {
			throw new Error("Save is only allowed for draft or sticky session supported services");
		}
		// in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
		// is sent to the backend
		messageHandler.removeTransitionMessages();

		try {
			this.busyLock(appComponent);
			const oActiveDocument =
				sProgrammingModel === ProgrammingModel.Draft
					? await draft.activateDocument(context, appComponent, {}, messageHandler)
					: await sticky.activateDocument(context, appComponent);

			const messagesReceived = messageHandling.getMessages().concat(messageHandling.getMessages(true, true)); // get unbound and bound messages present in the model
			if (!(messagesReceived.length === 1 && messagesReceived[0].type === coreLibrary.MessageType.Success)) {
				// show our object creation toast only if it is not coming from backend
				MessageToast.show(
					isNewObject
						? resourceModel.getText("C_TRANSACTION_HELPER_OBJECT_CREATED")
						: resourceModel.getText("C_TRANSACTION_HELPER_OBJECT_SAVED")
				);
			}

			return oActiveDocument;
		} catch (err: any) {
			if (executeSideEffectsOnError && bindingsForSideEffects?.length > 0) {
				/* The sideEffects are executed only for table items in transient state */
				bindingsForSideEffects.forEach((listBinding) => {
					if (!CommonUtils.hasTransientContext(listBinding)) {
						appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(listBinding.getPath(), context);
					}
				});
			}
			await messageHandler.showMessages();
			throw err;
		} finally {
			this.busyUnlock(appComponent);
		}
	}

	/**
	 * Calls a bound or unbound action.
	 *
	 * @function
	 * @static
	 * @name sap.fe.core.TransactionHelper.callAction
	 * @memberof sap.fe.core.TransactionHelper
	 * @param sActionName The name of the action to be called
	 * @param [mParameters] Contains the following attributes:
	 * @param [mParameters.parameterValues] A map of action parameter names and provided values
	 * @param [mParameters.skipParameterDialog] Skips the parameter dialog if values are provided for all of them
	 * @param [mParameters.contexts] Mandatory for a bound action: Either one context or an array with contexts for which the action is to be called
	 * @param [mParameters.model] Mandatory for an unbound action: An instance of an OData V4 model
	 * @param [mParameters.invocationGrouping] Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
	 * @param [mParameters.label] A human-readable label for the action
	 * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
	 * @param oView Contains the object of the current view
	 * @param appComponent The appComponent
	 * @param messageHandler The message handler extension
	 * @returns Promise resolves with an array of response objects (TODO: to be changed)
	 * @ui5-restricted
	 * @final
	 */
	async callAction(
		sActionName: string,
		mParameters: any,
		oView: View | null,
		appComponent: AppComponent,
		messageHandler: MessageHandler
	): Promise<any> {
		mParameters = getParameters(mParameters);
		let contextToProcess, oModel: any;
		const mBindingParameters = mParameters.bindingParameters;
		if (!sActionName) {
			throw new Error("Provide name of action to be executed");
		}
		// action imports are not directly obtained from the metaModel by it is present inside the entityContainer
		// and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
		// split() on its name was required
		const sName = sActionName.split("/")[1];
		sActionName = sName || sActionName;
		contextToProcess = sName ? undefined : mParameters.contexts;
		//checking whether the context is an array with more than 0 length or not an array(create action)
		if (contextToProcess && ((Array.isArray(contextToProcess) && contextToProcess.length) || !Array.isArray(contextToProcess))) {
			contextToProcess = Array.isArray(contextToProcess) ? contextToProcess[0] : contextToProcess;
			oModel = contextToProcess.getModel();
		}
		if (mParameters.model) {
			oModel = mParameters.model;
		}
		if (!oModel) {
			throw new Error("Pass a context for a bound action or pass the model for an unbound action");
		}
		// get the binding parameters $select and $expand for the side effect on this action
		// also gather additional property paths to be requested such as text associations
		const mSideEffectsParameters = appComponent.getSideEffectsService().getODataActionSideEffects(sActionName, contextToProcess) || {};

		try {
			let oResult: any;
			if (contextToProcess && oModel) {
				oResult = await operations.callBoundAction(sActionName, mParameters.contexts, oModel, appComponent, {
					parameterValues: mParameters.parameterValues,
					invocationGrouping: mParameters.invocationGrouping,
					label: mParameters.label,
					skipParameterDialog: mParameters.skipParameterDialog,
					mBindingParameters: mBindingParameters,
					entitySetName: mParameters.entitySetName,
					additionalSideEffect: mSideEffectsParameters,
					onSubmitted: () => {
						messageHandler.removeTransitionMessages();
						this.busyLock(appComponent);
					},
					onResponse: () => {
						this.busyUnlock(appComponent);
					},
					parentControl: mParameters.parentControl,
					controlId: mParameters.controlId,
					internalModelContext: mParameters.internalModelContext,
					operationAvailableMap: mParameters.operationAvailableMap,
					bIsCreateAction: mParameters.bIsCreateAction,
					bGetBoundContext: mParameters.bGetBoundContext,
					bObjectPage: mParameters.bObjectPage,
					messageHandler: messageHandler,
					defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
					selectedItems: mParameters.contexts
				});
			} else {
				oResult = await operations.callActionImport(sActionName, oModel, appComponent, {
					parameterValues: mParameters.parameterValues,
					label: mParameters.label,
					skipParameterDialog: mParameters.skipParameterDialog,
					bindingParameters: mBindingParameters,
					entitySetName: mParameters.entitySetName,
					onSubmitted: () => {
						this.busyLock(appComponent);
					},
					onResponse: () => {
						this.busyUnlock(appComponent);
					},
					parentControl: mParameters.parentControl,
					internalModelContext: mParameters.internalModelContext,
					operationAvailableMap: mParameters.operationAvailableMap,
					messageHandler: messageHandler,
					bObjectPage: mParameters.bObjectPage
				});
			}

			await this._handleActionResponse(messageHandler, mParameters, sActionName);
			return oResult;
		} catch (err: any) {
			await this._handleActionResponse(messageHandler, mParameters, sActionName);
			throw err;
		}
	}

	/**
	 * Handles messages for action call.
	 *
	 * @function
	 * @name sap.fe.core.TransactionHelper#_handleActionResponse
	 * @memberof sap.fe.core.TransactionHelper
	 * @param messageHandler The message handler extension
	 * @param mParameters Parameters to be considered for the action.
	 * @param sActionName The name of the action to be called
	 * @returns Promise after message dialog is opened if required.
	 * @ui5-restricted
	 * @final
	 */
	_handleActionResponse(messageHandler: MessageHandler, mParameters: any, sActionName: string): Promise<void> {
		const aTransientMessages = messageHandling.getMessages(true, true);
		const actionName = mParameters.label ? mParameters.label : sActionName;
		if (aTransientMessages.length > 0 && mParameters && mParameters.internalModelContext) {
			mParameters.internalModelContext.setProperty("sActionName", mParameters.label ? mParameters.label : sActionName);
		}
		let control;
		if (mParameters.controlId) {
			control = mParameters.parentControl.byId(mParameters.controlId);
		} else {
			control = mParameters.parentControl;
		}
		return messageHandler.showMessages({ sActionName: actionName, control: control });
	}

	/**
	 * Handles validation errors for the 'Discard' action.
	 *
	 * @function
	 * @name sap.fe.core.TransactionHelper#handleValidationError
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @ui5-restricted
	 * @final
	 */
	handleValidationError() {
		const oMessageManager = Core.getMessageManager(),
			errorToRemove = oMessageManager
				.getMessageModel()
				.getData()
				.filter(function (error: any) {
					// only needs to handle validation messages, technical and persistent errors needs not to be checked here.
					if (error.validation) {
						return error;
					}
				});
		oMessageManager.removeMessages(errorToRemove);
	}

	/**
	 * Creates a new Popover. Factory method to make unit tests easier.
	 *
	 * @param settings Initial parameters for the popover
	 * @returns A new Popover
	 */
	_createPopover(settings?: $PopoverSettings): Popover {
		return new Popover(settings);
	}

	/**
	 * Shows a popover to confirm discard if needed.
	 *
	 * @static
	 * @name sap.fe.core.TransactionHelper._showDiscardPopover
	 * @memberof sap.fe.core.TransactionHelper
	 * @param cancelButton The control which will open the popover
	 * @param isModified True if the object has been modified and a confirmation popover must be shown
	 * @param resourceModel The model to load text resources
	 * @returns Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
	 * @ui5-restricted
	 * @final
	 */
	_confirmDiscard(cancelButton: Button, isModified: boolean, resourceModel: ResourceModel): Promise<void> {
		// If the data isn't modified, do not show any confirmation popover
		if (!isModified) {
			this.handleValidationError();
			return Promise.resolve();
		}

		cancelButton.setEnabled(false);
		return new Promise<void>((resolve, reject) => {
			const confirmationPopover = this._createPopover({
				showHeader: false,
				placement: "Top"
			});
			confirmationPopover.addStyleClass("sapUiContentPadding");

			// Create the content of the popover
			const title = new Text({
				text: resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE")
			});
			const confirmButton = new Button({
				text: resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"),
				width: "100%",
				press: () => {
					this.handleValidationError();
					confirmationPopover.data("continueDiscard", true);
					confirmationPopover.close();
				},
				ariaLabelledBy: [title]
			});
			confirmationPopover.addContent(new VBox({ items: [title, confirmButton] }));

			// Attach handler
			confirmationPopover.attachBeforeOpen(() => {
				confirmationPopover.setInitialFocus(confirmButton);
			});
			confirmationPopover.attachAfterClose(() => {
				cancelButton.setEnabled(true);
				if (confirmationPopover.data("continueDiscard")) {
					resolve();
				} else {
					reject();
				}
			});

			confirmationPopover.openBy(cancelButton, false);
		});
	}

	_onFieldChange(oEvent: any, oCreateButton: any, messageHandler: MessageHandler, fnValidateRequiredProperties: Function) {
		messageHandler.removeTransitionMessages();
		const oField = oEvent.getSource();
		const oFieldPromise = oEvent.getParameter("promise");
		if (oFieldPromise) {
			return oFieldPromise
				.then(function (value: any) {
					// Setting value of field as '' in case of value help and validating other fields
					oField.setValue(value);
					fnValidateRequiredProperties();

					return oField.getValue();
				})
				.catch(function (value: any) {
					if (value !== "") {
						//disabling the continue button in case of invalid value in field
						oCreateButton.setEnabled(false);
					} else {
						// validating all the fields in case of empty value in field
						oField.setValue(value);
						fnValidateRequiredProperties();
					}
				});
		}
	}

	_launchDialogWithKeyFields(
		oListBinding: ODataListBinding,
		mFields: any,
		oModel: ODataModel,
		mParameters: any,
		appComponent: AppComponent,
		messageHandler: MessageHandler
	) {
		let oDialog: Dialog;
		const oParentControl = mParameters.parentControl;

		// Crate a fake (transient) listBinding and context, just for the binding context of the dialog
		const oTransientListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
			$$updateGroupId: "submitLater"
		});
		oTransientListBinding.refreshInternal = function () {
			/* */
		};
		const oTransientContext = oTransientListBinding.create(mParameters.data, true);

		return new Promise(async (resolve, reject) => {
			const sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
			const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
				resourceModel = getResourceModel(oParentControl),
				oMetaModel = oModel.getMetaModel(),
				aImmutableFields: any[] = [],
				sPath = (oListBinding.isRelative() ? oListBinding.getResolvedPath() : oListBinding.getPath()) as string,
				oEntitySetContext = oMetaModel.createBindingContext(sPath) as Context,
				sMetaPath = oMetaModel.getMetaPath(sPath);
			for (const i in mFields) {
				aImmutableFields.push(oMetaModel.createBindingContext(`${sMetaPath}/${mFields[i]}`));
			}
			const oImmutableCtxModel = new JSONModel(aImmutableFields);
			const oImmutableCtx = oImmutableCtxModel.createBindingContext("/");
			const aRequiredProperties = getRequiredPropertiesFromInsertRestrictions(sMetaPath, oMetaModel);
			const oRequiredPropertyPathsCtxModel = new JSONModel(aRequiredProperties);
			const oRequiredPropertyPathsCtx = oRequiredPropertyPathsCtxModel.createBindingContext("/");
			const oNewFragment = await XMLPreprocessor.process(
				oFragment,
				{ name: sFragmentName },
				{
					bindingContexts: {
						entitySet: oEntitySetContext,
						fields: oImmutableCtx,
						requiredProperties: oRequiredPropertyPathsCtx
					},
					models: {
						entitySet: oEntitySetContext.getModel(),
						fields: oImmutableCtx.getModel(),
						metaModel: oMetaModel,
						requiredProperties: oRequiredPropertyPathsCtxModel
					}
				}
			);

			let aFormElements: any[] = [];
			const mFieldValueMap: any = {};
			// eslint-disable-next-line prefer-const
			let oCreateButton: Button;

			const validateRequiredProperties = async function () {
				let bEnabled = false;
				try {
					const aResults = await Promise.all(
						aFormElements
							.map(function (oFormElement: any) {
								return oFormElement.getFields()[0];
							})
							.filter(function (oField: any) {
								// The continue button should remain disabled in case of empty required fields.
								return oField.getRequired() || oField.getValueState() === ValueState.Error;
							})
							.map(async function (oField: any) {
								const sFieldId = oField.getId();
								if (sFieldId in mFieldValueMap) {
									try {
										const vValue = await mFieldValueMap[sFieldId];
										return oField.getValue() === "" ? undefined : vValue;
									} catch (err) {
										return undefined;
									}
								}
								return oField.getValue() === "" ? undefined : oField.getValue();
							})
					);
					bEnabled = aResults.every(function (vValue: any) {
						if (Array.isArray(vValue)) {
							vValue = vValue[0];
						}
						return vValue !== undefined && vValue !== null && vValue !== "";
					});
				} catch (err) {
					bEnabled = false;
				}
				oCreateButton.setEnabled(bEnabled);
			};
			const oController = {
				/*
									fired on focus out from field or on selecting a value from the valuehelp.
									the create button is enabled when a value is added.
									liveChange is not fired when value is added from valuehelp.
									value validation is not done for create button enablement.
								*/
				handleChange: (oEvent: any) => {
					const sFieldId = oEvent.getParameter("id");
					mFieldValueMap[sFieldId] = this._onFieldChange(oEvent, oCreateButton, messageHandler, validateRequiredProperties);
				},
				/*
									fired on key press. the create button is enabled when a value is added.
									liveChange is not fired when value is added from valuehelp.
									value validation is not done for create button enablement.
								*/
				handleLiveChange: (oEvent: any) => {
					const sFieldId = oEvent.getParameter("id");
					const vValue = oEvent.getParameter("value");
					mFieldValueMap[sFieldId] = vValue;
					validateRequiredProperties();
				}
			};

			const oDialogContent: any = await Fragment.load({
				definition: oNewFragment,
				controller: oController
			});
			let oResult: any;
			const closeDialog = function () {
				//rejected/resolved the promis returned by _launchDialogWithKeyFields
				//as soon as the dialog is closed. Without waiting for the dialog's
				//animation to finish
				if (oResult.error) {
					reject(oResult.error);
				} else {
					resolve(oResult.response);
				}
				oDialog.close();
			};

			oDialog = new Dialog(generate(["CreateDialog", sMetaPath]), {
				title: resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"),
				content: [oDialogContent],
				beginButton: {
					text: resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON"),
					type: "Emphasized",
					press: async (oEvent: any) => {
						const createButton = oEvent.getSource();
						createButton.setEnabled(false);
						BusyLocker.lock(oDialog);
						mParameters.bIsCreateDialog = true;
						try {
							const aValues = await Promise.all(
								Object.keys(mFieldValueMap).map(async function (sKey: string) {
									const oValue = await mFieldValueMap[sKey];
									const oDialogValue: any = {};
									oDialogValue[sKey] = oValue;
									return oDialogValue;
								})
							);
							if (mParameters.beforeCreateCallBack) {
								await toES6Promise(
									mParameters.beforeCreateCallBack({
										contextPath: oListBinding && oListBinding.getPath(),
										createParameters: aValues
									})
								);
							}
							const transientData = oTransientContext.getObject();
							const createData: any = {};
							Object.keys(transientData).forEach(function (sPropertyPath: string) {
								const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
								// ensure navigation properties are not part of the payload, deep create not supported
								if (oProperty && oProperty.$kind === "NavigationProperty") {
									return;
								}
								createData[sPropertyPath] = transientData[sPropertyPath];
							});
							const oNewDocumentContext = oListBinding.create(
								createData,
								true,
								mParameters.createAtEnd,
								mParameters.inactive
							);

							const oPromise = this.onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters);
							let oResponse: any = await oPromise;
							if (!oResponse || (oResponse && oResponse.bKeepDialogOpen !== true)) {
								oResponse = oResponse ?? {};
								oDialog.setBindingContext(null as any);
								oResponse.newContext = oNewDocumentContext;
								oResult = { response: oResponse };
								closeDialog();
							}
						} catch (oError: any) {
							// in case of creation failed, dialog should stay open - to achieve the same, nothing has to be done (like in case of success with bKeepDialogOpen)
							if (oError !== FELibrary.Constants.CreationFailed) {
								// other errors are not expected
								oResult = { error: oError };
								closeDialog();
							} else {
								createButton.setEnabled(true);
							}
						} finally {
							BusyLocker.unlock(oDialog);
							messageHandler.showMessages();
						}
					}
				},
				endButton: {
					text: resourceModel.getText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL"),
					press: function () {
						oResult = { error: FELibrary.Constants.CancelActionDialog };
						closeDialog();
					}
				},
				afterClose: function () {
					// show footer as per UX guidelines when dialog is not open
					(oDialog.getBindingContext("internal") as InternalModelContext)?.setProperty("isCreateDialogOpen", false);
					oDialog.destroy();
					oTransientListBinding.destroy();
				}
			} as any);
			aFormElements = oDialogContent?.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
			if (oParentControl && oParentControl.addDependent) {
				// if there is a parent control specified add the dialog as dependent
				oParentControl.addDependent(oDialog);
			}
			oCreateButton = oDialog.getBeginButton();
			oDialog.setBindingContext(oTransientContext);
			try {
				await CommonUtils.setUserDefaults(
					appComponent,
					aImmutableFields,
					oTransientContext,
					false,
					mParameters.createAction,
					mParameters.data
				);
				validateRequiredProperties();
				// footer must not be visible when the dialog is open as per UX guidelines
				(oDialog.getBindingContext("internal") as InternalModelContext).setProperty("isCreateDialogOpen", true);
				oDialog.open();
			} catch (oError: any) {
				await messageHandler.showMessages();
				throw oError;
			}
		});
	}

	onAfterCreateCompletion(oListBinding: any, oNewDocumentContext: any, mParameters: any) {
		let fnResolve: Function;
		const oPromise = new Promise<boolean>((resolve) => {
			fnResolve = resolve;
		});

		const fnCreateCompleted = (oEvent: any) => {
			const oContext = oEvent.getParameter("context"),
				bSuccess = oEvent.getParameter("success");
			if (oContext === oNewDocumentContext) {
				oListBinding.detachCreateCompleted(fnCreateCompleted, this);
				fnResolve(bSuccess);
			}
		};
		const fnSafeContextCreated = () => {
			oNewDocumentContext
				.created()
				.then(undefined, function () {
					Log.trace("transient creation context deleted");
				})
				.catch(function (contextError: any) {
					Log.trace("transient creation context deletion error", contextError);
				});
		};

		oListBinding.attachCreateCompleted(fnCreateCompleted, this);

		return oPromise.then((bSuccess: boolean) => {
			if (!bSuccess) {
				if (!mParameters.keepTransientContextOnFailed) {
					// Cancel the pending POST and delete the context in the listBinding
					fnSafeContextCreated(); // To avoid a 'request cancelled' error in the console
					oListBinding.resetChanges();
					oListBinding.getModel().resetChanges(oListBinding.getUpdateGroupId());

					throw FELibrary.Constants.CreationFailed;
				}
				return { bKeepDialogOpen: true };
			} else {
				return oNewDocumentContext.created();
			}
		});
	}

	/**
	 * Retrieves the name of the NewAction to be executed.
	 *
	 * @function
	 * @static
	 * @private
	 * @name sap.fe.core.TransactionHelper._getNewAction
	 * @memberof sap.fe.core.TransactionHelper
	 * @param oStartupParameters Startup parameters of the application
	 * @param sCreateHash Hash to be checked for action type
	 * @param oMetaModel The MetaModel used to check for NewAction parameter
	 * @param sMetaPath The MetaPath
	 * @returns The name of the action
	 * @ui5-restricted
	 * @final
	 */
	_getNewAction(oStartupParameters: any, sCreateHash: string, oMetaModel: ODataMetaModel, sMetaPath: string) {
		let sNewAction;

		if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=CREATEWITH") > -1) {
			const sPreferredMode = oStartupParameters.preferredMode[0];
			sNewAction =
				sPreferredMode.toUpperCase().indexOf("CREATEWITH:") > -1
					? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1)
					: undefined;
		} else if (
			oStartupParameters &&
			oStartupParameters.preferredMode &&
			sCreateHash.toUpperCase().indexOf("I-ACTION=AUTOCREATEWITH") > -1
		) {
			const sPreferredMode = oStartupParameters.preferredMode[0];
			sNewAction =
				sPreferredMode.toUpperCase().indexOf("AUTOCREATEWITH:") > -1
					? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1)
					: undefined;
		} else {
			sNewAction =
				oMetaModel && oMetaModel.getObject !== undefined
					? oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`) ||
					  oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`)
					: undefined;
		}
		return sNewAction;
	}

	/**
	 * Retrieves the label for the title of a specific create action dialog, e.g. Create Sales Order from Quotation.
	 *
	 * The following priority is applied:
	 * 1. label of line-item annotation.
	 * 2. label annotated in the action.
	 * 3. "Create" as a constant from i18n.
	 *
	 * @function
	 * @static
	 * @private
	 * @name sap.fe.core.TransactionHelper._getSpecificCreateActionDialogLabel
	 * @memberof sap.fe.core.TransactionHelper
	 * @param oMetaModel The MetaModel used to check for the NewAction parameter
	 * @param sMetaPath The MetaPath
	 * @param sNewAction Contains the name of the action to be executed
	 * @param oResourceBundleCore ResourceBundle to access the default Create label
	 * @returns The label for the Create Action Dialog
	 * @ui5-restricted
	 * @final
	 */
	_getSpecificCreateActionDialogLabel(
		oMetaModel: ODataMetaModel,
		sMetaPath: string,
		sNewAction: string,
		oResourceBundleCore: ResourceBundle
	) {
		const fnGetLabelFromLineItemAnnotation = function () {
			if (oMetaModel && oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)) {
				const iLineItemIndex = oMetaModel
					.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)
					.findIndex(function (oLineItem: any) {
						const aLineItemAction = oLineItem.Action ? oLineItem.Action.split("(") : undefined;
						return aLineItemAction ? aLineItemAction[0] === sNewAction : false;
					});
				return iLineItemIndex > -1
					? oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)[iLineItemIndex].Label
					: undefined;
			} else {
				return undefined;
			}
		};

		return (
			fnGetLabelFromLineItemAnnotation() ||
			(oMetaModel && oMetaModel.getObject(`${sMetaPath}/${sNewAction}@com.sap.vocabularies.Common.v1.Label`)) ||
			(oResourceBundleCore && oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"))
		);
	}
}

const singleton = new TransactionHelper();
export default singleton;
