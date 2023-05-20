import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import messageHandling from "sap/fe/core/controllerextensions/messageHandler/messageHandling";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import type { SideEffectsService } from "sap/fe/core/services/SideEffectsServiceFactory";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import Text from "sap/m/Text";
import Core from "sap/ui/core/Core";
import type View from "sap/ui/core/mvc/View";
import Context from "sap/ui/model/odata/v4/Context";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import operationsHelper from "../../operationsHelper";
import type MessageHandler from "../MessageHandler";
import draftDataLossPopup from "./draftDataLossPopup";

export type SiblingInformation = {
	targetContext: Context;
	pathMapping: { oldPath: string; newPath: string }[];
};

/**
 * Interface for callbacks used in the functions
 *
 *
 * @author SAP SE
 * @since 1.54.0
 * @interface
 * @name sap.fe.core.actions.draft.ICallback
 * @private
 */

/**
 * Callback to approve or reject the creation of a draft
 *
 * @name sap.fe.core.actions.draft.ICallback.beforeCreateDraftFromActiveDocument
 * @function
 * @static
 * @abstract
 * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
 * @returns {(boolean|Promise)} Approval of draft creation [true|false] or Promise that resolves with the boolean value
 * @private
 */

/**
 * Callback after a draft was successully created
 *
 * @name sap.fe.core.actions.draft.ICallback.afterCreateDraftFromActiveDocument
 * @function
 * @static
 * @abstract
 * @param {sap.ui.model.odata.v4.Context} oContext Context of the new draft
 * @param {sap.ui.model.odata.v4.Context} oActiveDocumentContext Context of the active document for the new draft
 * @returns {sap.ui.model.odata.v4.Context} oActiveDocumentContext
 * @private
 */

/**
 * Callback to approve or reject overwriting an unsaved draft of another user
 *
 * @name sap.fe.core.actions.draft.ICallback.whenDecisionToOverwriteDocumentIsRequired
 * @function
 * @public
 * @static
 * @abstract
 * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
 * @returns {(boolean|Promise)} Approval to overwrite unsaved draft [true|false] or Promise that resolves with the boolean value
 * @ui5-restricted
 */
/* Constants for draft operations */
const draftOperations = {
	EDIT: "EditAction",
	ACTIVATION: "ActivationAction",
	DISCARD: "DiscardAction",
	PREPARE: "PreparationAction"
};

/**
 * Static functions for the draft programming model
 *
 * @namespace
 * @alias sap.fe.core.actions.draft
 * @private
 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
 * @since 1.54.0
 */

/**
 * Determines the action name for a draft operation.
 *
 * @param oContext The context that should be bound to the operation
 * @param sOperation The operation name
 * @returns The name of the draft operation
 */
function getActionName(oContext: Context, sOperation: string) {
	const oModel = oContext.getModel(),
		oMetaModel = oModel.getMetaModel(),
		sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());

	return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}`);
}
/**
 * Creates an operation context binding for the given context and operation.
 *
 * @param oContext The context that should be bound to the operation
 * @param sOperation The operation (action or function import)
 * @param oOptions Options to create the operation context
 * @returns The context binding of the bound operation
 */
function createOperation(oContext: Context, sOperation: string, oOptions?: any) {
	const sOperationName = getActionName(oContext, sOperation);

	return oContext.getModel().bindContext(`${sOperationName}(...)`, oContext, oOptions);
}
/**
 * Determines the return type for a draft operation.
 *
 * @param oContext The context that should be bound to the operation
 * @param sOperation The operation name
 * @returns The return type of the draft operation
 */
function getReturnType(oContext: Context, sOperation: string) {
	const oModel = oContext.getModel(),
		oMetaModel = oModel.getMetaModel(),
		sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());

	return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}/$ReturnType`);
}
/**
 * Check if optional draft prepare action exists.
 *
 * @param oContext The context that should be bound to the operation
 * @returns True if a a prepare action exists
 */
function hasPrepareAction(oContext: Context): boolean {
	return !!getActionName(oContext, draftOperations.PREPARE);
}
/**
 * Creates a new draft from an active document.
 *
 * @function
 * @param oContext Context for which the action should be performed
 * @param bPreserveChanges If true - existing changes from another user that are not locked are preserved and an error is sent from the backend, otherwise false - existing changes from another user that are not locked are overwritten</li>
 * @param oView If true - existing changes from another
 * @returns Resolve function returns the context of the operation
 * @private
 * @ui5-restricted
 */
async function executeDraftEditAction(oContext: Context, bPreserveChanges: boolean, oView: any): Promise<Context> {
	if (oContext.getProperty("IsActiveEntity")) {
		const oOptions = { $$inheritExpandSelect: true };
		const oOperation = createOperation(oContext, draftOperations.EDIT, oOptions);
		oOperation.setParameter("PreserveChanges", bPreserveChanges);
		const sGroupId = "direct";
		const resourceModel = getResourceModel(oView);
		const sActionName = resourceModel.getText("C_COMMON_OBJECT_PAGE_EDIT");
		//If the context is coming from a list binding we pass the flag true to replace the context by the active one
		const oEditPromise = oOperation.execute(
			sGroupId,
			undefined,
			(operationsHelper as any).fnOnStrictHandlingFailed.bind(
				draft,
				sGroupId,
				{ label: sActionName, model: oContext.getModel() },
				resourceModel,
				null,
				null,
				null,
				undefined,
				undefined
			),
			oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding")
		);
		oOperation.getModel().submitBatch(sGroupId);
		return await oEditPromise;
	} else {
		throw new Error("You cannot edit this draft document");
	}
}

/**
 * Executes the validation of the draft. The PrepareAction is triggered if the messages are annotated and entitySet gets a PreparationAction annotated.
 * If the operation succeeds and operation doesn't get a return type (RAP system) the messages are requested.
 *
 * @function
 * @param context Context for which the PrepareAction should be performed
 * @param appComponent The AppComponent
 * @param ignoreETag If set to true, ETags are ignored when executing the action
 * @returns Resolve function returns
 *  - the context of the operation if the action has been successfully executed
 *  - void if the action has failed
 *  - undefined if the action has not been triggered since the prerequisites are not met
 * @private
 * @ui5-restricted
 */
async function executeDraftValidation(
	context: Context,
	appComponent: AppComponent,
	ignoreETag: boolean
): Promise<ODataContextBinding | void | undefined> {
	if (draft.getMessagesPath(context) && draft.hasPrepareAction(context)) {
		try {
			const operation = await draft.executeDraftPreparationAction(context, context.getUpdateGroupId(), true, ignoreETag);
			// if there is no returned operation by executeDraftPreparationAction -> the action has failed
			if (operation && !getReturnType(context, draftOperations.PREPARE)) {
				requestMessages(context, appComponent.getSideEffectsService());
			}
			return operation;
		} catch (error: any) {
			Log.error("Error while requesting messages", error);
		}
	}

	return undefined;
}

/**
 * Activates a draft document. The draft will replace the sibling entity and will be deleted by the back end.
 *
 * @function
 * @param oContext Context for which the action should be performed
 * @param oAppComponent The AppComponent
 * @param [sGroupId] The optional batch group in which the operation is to be executed
 * @returns Resolve function returns the context of the operation
 * @private
 * @ui5-restricted
 */
async function executeDraftActivationAction(oContext: Context, oAppComponent: AppComponent, sGroupId?: string): Promise<Context> {
	const bHasPrepareAction = hasPrepareAction(oContext);

	// According to the draft spec if the service contains a prepare action and we trigger both prepare and
	// activate in one $batch the activate action is called with iF-Match=*
	const bIgnoreEtag = bHasPrepareAction;

	if (!oContext.getProperty("IsActiveEntity")) {
		const oOperation = createOperation(oContext, draftOperations.ACTIVATION, { $$inheritExpandSelect: true });
		const resourceModel = getResourceModel(oAppComponent);
		const sActionName = resourceModel.getText("C_OP_OBJECT_PAGE_SAVE");
		try {
			return await oOperation.execute(
				sGroupId,
				bIgnoreEtag,
				sGroupId
					? (operationsHelper as any).fnOnStrictHandlingFailed.bind(
							draft,
							sGroupId,
							{ label: sActionName, model: oContext.getModel() },
							resourceModel,
							null,
							null,
							null,
							undefined,
							undefined
					  )
					: undefined,
				oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding")
			);
		} catch (e) {
			if (bHasPrepareAction) {
				const actionName = getActionName(oContext, draftOperations.PREPARE),
					oSideEffectsService = oAppComponent.getSideEffectsService(),
					oBindingParameters = oSideEffectsService.getODataActionSideEffects(actionName, oContext),
					aTargetPaths = oBindingParameters && oBindingParameters.pathExpressions;
				if (aTargetPaths && aTargetPaths.length > 0) {
					try {
						await oSideEffectsService.requestSideEffects(aTargetPaths, oContext);
					} catch (oError: any) {
						Log.error("Error while requesting side effects", oError);
					}
				} else {
					try {
						await requestMessages(oContext, oSideEffectsService);
					} catch (oError: any) {
						Log.error("Error while requesting messages", oError);
					}
				}
			}
			throw e;
		}
	} else {
		throw new Error("The activation action cannot be executed on an active document");
	}
}

/**
 * Gets the supported message property path on the PrepareAction for a context.
 *
 * @function
 * @param oContext Context to be checked
 * @returns Path to the message
 * @private
 * @ui5-restricted
 */
function getMessagePathForPrepare(oContext: Context): string | null {
	const oMetaModel = oContext.getModel().getMetaModel();
	const sContextPath = oMetaModel.getMetaPath(oContext.getPath());
	const oReturnType = getReturnType(oContext, draftOperations.PREPARE);
	// If there is no return parameter, it is not possible to request Messages.
	// RAP draft prepare has no return parameter
	return oReturnType ? oMetaModel.getObject(`${sContextPath}/@${CommonAnnotationTerms.Messages}/$Path`) : null;
}

/**
 * Execute a preparation action.
 *
 * @function
 * @param oContext Context for which the action should be performed
 * @param groupId The optional batch group in which we want to execute the operation
 * @param bMessages If set to true, the PREPARE action retrieves SAP_Messages
 * @param ignoreETag If set to true, ETag information is ignored when the action is executed
 * @returns Resolve function returns the context of the operation
 * @private
 * @ui5-restricted
 */
function executeDraftPreparationAction(oContext: Context, groupId?: string, bMessages?: boolean, ignoreETag?: boolean) {
	if (!oContext.getProperty("IsActiveEntity")) {
		const sMessagesPath = bMessages ? getMessagePathForPrepare(oContext) : null;
		const oOperation = createOperation(oContext, draftOperations.PREPARE, sMessagesPath ? { $select: sMessagesPath } : null);

		// TODO: side effects qualifier shall be even deprecated to be checked
		oOperation.setParameter("SideEffectsQualifier", "");

		const sGroupId = groupId || oOperation.getGroupId();
		return oOperation
			.execute(sGroupId, ignoreETag)
			.then(function () {
				return oOperation;
			})
			.catch(function (oError: any) {
				Log.error("Error while executing the operation", oError);
			});
	} else {
		throw new Error("The preparation action cannot be executed on an active document");
	}
}
/**
 * Determines the message path for a context.
 *
 * @function
 * @param oContext Context for which the path shall be determined
 * @returns Message path, empty if not annotated
 * @private
 * @ui5-restricted
 */
function getMessagesPath(oContext: Context): string | undefined {
	const oModel = oContext.getModel(),
		oMetaModel = oModel.getMetaModel(),
		sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
	return oMetaModel.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
}
/**
 * Requests the messages if annotated for a given context.
 *
 * @function
 * @param oContext Context for which the messages shall be requested
 * @param oSideEffectsService Service for the SideEffects on SAP Fiori elements
 * @returns Promise which is resolved once messages were requested
 * @private
 * @ui5-restricted
 */
function requestMessages(oContext: Context, oSideEffectsService: SideEffectsService) {
	const sMessagesPath = draft.getMessagesPath(oContext);
	if (sMessagesPath) {
		return oSideEffectsService.requestSideEffects([sMessagesPath], oContext);
	}
	return Promise.resolve();
}
/**
 * Executes discard of a draft function using HTTP Post.
 *
 * @function
 * @param oContext Context for which the action should be performed
 * @param oAppComponent App Component
 * @param bEnableStrictHandling
 * @returns Resolve function returns the context of the operation
 * @private
 * @ui5-restricted
 */
async function executeDraftDiscardAction(oContext: Context, oAppComponent?: any, bEnableStrictHandling?: boolean): Promise<boolean> {
	if (!oContext.getProperty("IsActiveEntity")) {
		const oDiscardOperation = draft.createOperation(oContext, draftOperations.DISCARD);
		const resourceModel = oAppComponent && getResourceModel(oAppComponent);
		const sGroupId = "direct";
		const sActionName = resourceModel?.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON") || "";
		// as the discard action doesnt' send the active version in the response we do not use the replace in cache
		const oDiscardPromise = !bEnableStrictHandling
			? oDiscardOperation.execute(sGroupId)
			: oDiscardOperation.execute(
					sGroupId,
					undefined,
					(operationsHelper as any).fnOnStrictHandlingFailed.bind(
						draft,
						sGroupId,
						{ label: sActionName, model: oContext.getModel() },
						resourceModel,
						null,
						null,
						null,
						undefined,
						undefined
					),
					false
			  );
		oContext.getModel().submitBatch(sGroupId);
		return oDiscardPromise;
	} else {
		throw new Error("The discard action cannot be executed on an active document");
	}
}

/**
 * This method creates a sibling context for a subobject page and calculates a sibling path for all intermediate paths
 * between the object page and the subobject page.
 *
 * @param rootCurrentContext The context for the root of the draft
 * @param rightmostCurrentContext The context of the subobject page
 * @returns The siblingInformation object
 */
async function computeSiblingInformation(
	rootCurrentContext: Context,
	rightmostCurrentContext: Context
): Promise<SiblingInformation | undefined> {
	if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
		// Wrong usage !!
		Log.error("Cannot compute rightmost sibling context");
		throw new Error("Cannot compute rightmost sibling context");
	}

	if (
		rightmostCurrentContext.getProperty("IsActiveEntity") === false &&
		rightmostCurrentContext.getProperty("HasActiveEntity") === false
	) {
		// We already know the sibling for rightmostCurrentContext doesn't exist
		// --> No need to check canonical paths etc...
		return undefined;
	}

	const model = rootCurrentContext.getModel();
	try {
		// //////////////////////////////////////////////////////////////////
		// 1. Find all segments between the root object and the sub-object
		// Example: for root = /Param(aa)/Entity(bb) and rightMost = /Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)
		// ---> ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]

		// Find all segments in the rightmost path
		const additionalPath = rightmostCurrentContext.getPath().replace(rootCurrentContext.getPath(), "");
		const segments = additionalPath ? additionalPath.substring(1).split("/") : [];
		// First segment is always the full path of the root object, which can contain '/' in case of a parametrized entity
		segments.unshift(rootCurrentContext.getPath().substring(1));

		// //////////////////////////////////////////////////////////////////
		// 2. Request canonical paths of the sibling entity for each segment
		// Example: for ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]
		// --> request canonical paths for "Param(aa)/Entity(bb)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)/SiblingEntity"
		const oldPaths: string[] = [];
		const newPaths: string[] = [];
		let currentPath = "";
		const canonicalPathPromises = segments.map((segment) => {
			currentPath += `/${segment}`;
			oldPaths.unshift(currentPath);
			if (currentPath.endsWith(")")) {
				const siblingContext = model.bindContext(`${currentPath}/SiblingEntity`).getBoundContext();
				return siblingContext.requestCanonicalPath();
			} else {
				return Promise.resolve(undefined); // 1-1 relation
			}
		});

		// //////////////////////////////////////////////////////////////////
		// 3. Reconstruct the full paths from canonical paths (for path mapping)
		// Example: for canonical paths "/Param(aa)/Entity(bb-sibling)", "/Entity2(cc-sibling)", "/Entity3(dd-sibling)"
		// --> ["Param(aa)/Entity(bb-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)/_SubNav(dd-sibling)"]
		const canonicalPaths = (await Promise.all(canonicalPathPromises)) as string[];
		let siblingPath = "";
		canonicalPaths.forEach((canonicalPath, index) => {
			if (index !== 0) {
				if (segments[index].endsWith(")")) {
					const navigation = segments[index].replace(/\(.*$/, ""); // Keep only navigation name from the segment, i.e. aaa(xxx) --> aaa
					const keys = canonicalPath.replace(/.*\(/, "("); // Keep only the keys from the canonical path, i.e. aaa(xxx) --> (xxx)
					siblingPath += `/${navigation}${keys}`;
				} else {
					siblingPath += `/${segments[index]}`; // 1-1 relation
				}
			} else {
				siblingPath = canonicalPath; // To manage parametrized entities
			}
			newPaths.unshift(siblingPath);
		});

		return {
			targetContext: model.bindContext(siblingPath).getBoundContext(), // Create the rightmost sibling context from its path
			pathMapping: oldPaths.map((oldPath, index) => {
				return {
					oldPath,
					newPath: newPaths[index]
				};
			})
		};
	} catch (error) {
		// A canonical path couldn't be resolved (because a sibling doesn't exist)
		return undefined;
	}
}

/**
 * Creates a draft document from an existing document.
 *
 * The function supports several hooks as there is a certain coreography defined.
 *
 * @function
 * @name sap.fe.core.actions.draft#createDraftFromActiveDocument
 * @memberof sap.fe.core.actions.draft
 * @static
 * @param oContext Context of the active document for the new draft
 * @param oAppComponent The AppComponent
 * @param mParameters The parameters
 * @param [mParameters.oView] The view
 * @param [mParameters.bPreserveChanges] Preserve changes of an existing draft of another user
 * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
 * @private
 * @ui5-restricted
 */
async function createDraftFromActiveDocument(
	oContext: any,
	oAppComponent: AppComponent,
	mParameters: {
		oView: View;
		bPreserveChanges?: boolean | undefined;
	}
): Promise<Context | undefined> {
	const mParam = mParameters || {},
		bRunPreserveChangesFlow =
			typeof mParam.bPreserveChanges === "undefined" || (typeof mParam.bPreserveChanges === "boolean" && mParam.bPreserveChanges); //default true

	/**
	 * Overwrite the existing change.
	 *
	 * @returns Resolves with result of {@link sap.fe.core.actions#executeDraftEditAction}
	 */
	async function overwriteChange() {
		//Overwrite existing changes
		const oModel = oContext.getModel();
		const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
		const resourceModel = getResourceModel(mParameters.oView);
		const draftAdminData = await draftDataContext.requestObject();
		if (draftAdminData) {
			// remove all unbound transition messages as we show a special dialog
			messageHandling.removeUnboundTransitionMessages();
			let sInfo = draftAdminData.InProcessByUserDescription || draftAdminData.InProcessByUser;
			const sEntitySet = (mParameters.oView.getViewData() as any).entitySet;
			if (sInfo) {
				const sLockedByUserMsg = resourceModel.getText("C_DRAFT_OBJECT_PAGE_DRAFT_LOCKED_BY_USER", sInfo, sEntitySet);
				MessageBox.error(sLockedByUserMsg);
				throw new Error(sLockedByUserMsg);
			} else {
				sInfo = draftAdminData.CreatedByUserDescription || draftAdminData.CreatedByUser;
				const sUnsavedChangesMsg = resourceModel.getText("C_DRAFT_OBJECT_PAGE_DRAFT_UNSAVED_CHANGES", sInfo, sEntitySet);
				await draft.showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext);
				return draft.executeDraftEditAction(oContext, false, mParameters.oView);
			}
		}
		throw new Error(`Draft creation aborted for document: ${oContext.getPath()}`);
	}

	if (!oContext) {
		throw new Error("Binding context to active document is required");
	}
	let oDraftContext: Context | undefined;
	try {
		oDraftContext = await draft.executeDraftEditAction(oContext, bRunPreserveChangesFlow, mParameters.oView);
	} catch (oResponse: any) {
		if (oResponse.status === 409 || oResponse.status === 412 || oResponse.status === 423) {
			messageHandling.removeBoundTransitionMessages();
			messageHandling.removeUnboundTransitionMessages();
			const siblingInfo = await draft.computeSiblingInformation(oContext, oContext);
			if (siblingInfo?.targetContext) {
				//there is a context authorized to be edited by the current user
				await CommonUtils.waitForContextRequested(siblingInfo.targetContext);
				return siblingInfo.targetContext;
			} else {
				//there is no draft owned by the current user
				oDraftContext = await overwriteChange();
			}
		} else if (!(oResponse && oResponse.canceled)) {
			throw new Error(oResponse);
		}
	}

	if (oDraftContext) {
		const sEditActionName = draft.getActionName(oDraftContext, draftOperations.EDIT);
		const oSideEffects = oAppComponent.getSideEffectsService().getODataActionSideEffects(sEditActionName, oDraftContext);
		if (oSideEffects?.triggerActions?.length) {
			await oAppComponent.getSideEffectsService().requestSideEffectsForODataAction(oSideEffects, oDraftContext);
			return oDraftContext;
		} else {
			return oDraftContext;
		}
	} else {
		return undefined;
	}
}
/**
 * Creates an active document from a draft document.
 *
 * The function supports several hooks as there is a certain choreography defined.
 *
 * @function
 * @name sap.fe.core.actions.draft#activateDocument
 * @memberof sap.fe.core.actions.draft
 * @static
 * @param oContext Context of the active document for the new draft
 * @param oAppComponent The AppComponent
 * @param mParameters The parameters
 * @param [mParameters.fnBeforeActivateDocument] Callback that allows a veto before the 'Create' request is executed
 * @param [mParameters.fnAfterActivateDocument] Callback for postprocessing after document was activated.
 * @param messageHandler The message handler
 * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
 * @private
 * @ui5-restricted
 */
async function activateDocument(
	oContext: Context,
	oAppComponent: AppComponent,
	mParameters: { fnBeforeActivateDocument?: any; fnAfterActivateDocument?: any },
	messageHandler?: MessageHandler
) {
	const mParam = mParameters || {};
	if (!oContext) {
		throw new Error("Binding context to draft document is required");
	}

	const bExecute = mParam.fnBeforeActivateDocument ? await mParam.fnBeforeActivateDocument(oContext) : true;
	if (!bExecute) {
		throw new Error(`Activation of the document was aborted by extension for document: ${oContext.getPath()}`);
	}

	let oActiveDocumentContext: any;
	if (!hasPrepareAction(oContext)) {
		oActiveDocumentContext = await executeDraftActivationAction(oContext, oAppComponent);
	} else {
		/* activation requires preparation */
		const sBatchGroup = "draft";
		// we use the same batchGroup to force prepare and activate in a same batch but with different changeset
		let oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, false);
		oContext.getModel().submitBatch(sBatchGroup);
		const oActivatePromise = draft.executeDraftActivationAction(oContext, oAppComponent, sBatchGroup);
		try {
			const values = await Promise.all([oPreparePromise, oActivatePromise]);
			oActiveDocumentContext = values[1];
		} catch (err) {
			// BCP 2270084075
			// if the Activation fails, then the messages are retrieved from PREPARATION action
			const sMessagesPath = getMessagePathForPrepare(oContext);
			if (sMessagesPath) {
				oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, true);
				oContext.getModel().submitBatch(sBatchGroup);
				await oPreparePromise;
				const data = await oContext.requestObject();
				if (data[sMessagesPath].length > 0) {
					//if messages are available from the PREPARATION action, then previous transition messages are removed
					messageHandler?.removeTransitionMessages(false, false, oContext.getPath());
				}
			}
			throw err;
		}
	}
	return mParam.fnAfterActivateDocument ? mParam.fnAfterActivateDocument(oContext, oActiveDocumentContext) : oActiveDocumentContext;
}

/**
 * Display the confirmation dialog box after pressing the edit button of an object page with unsaved changes.
 *
 *
 * @function
 * @name sap.fe.core.actions.draft#showEditConfirmationMessageBox
 * @memberof sap.fe.core.actions.draft
 * @static
 * @param sUnsavedChangesMsg Dialog box message informing the user that if he starts editing, the previous unsaved changes will be lost
 * @param oContext Context of the active document for the new draft
 * @returns Promise resolves
 * @private
 * @ui5-restricted
 */
function showEditConfirmationMessageBox(sUnsavedChangesMsg: string, oContext: Context) {
	const localI18nRef = Core.getLibraryResourceBundle("sap.fe.core");
	return new Promise(function (resolve: (value: any) => void, reject: (reason?: any) => void) {
		const oDialog = new Dialog({
			title: localI18nRef.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING"),
			state: "Warning",
			content: new Text({
				text: sUnsavedChangesMsg
			}),
			beginButton: new Button({
				text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_EDIT"),
				type: "Emphasized",
				press: function () {
					oDialog.close();
					resolve(true);
				}
			}),
			endButton: new Button({
				text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
				press: function () {
					oDialog.close();
					reject(`Draft creation aborted for document: ${oContext.getPath()}`);
				}
			}),
			afterClose: function () {
				oDialog.destroy();
			}
		});
		oDialog.addStyleClass("sapUiContentPadding");
		oDialog.open();
	});
}

/**
 * HTTP POST call when DraftAction is present for Draft Delete; HTTP DELETE call when there is no DraftAction
 * and Active Instance always uses DELETE.
 *
 * @function
 * @name sap.fe.core.actions.draft#deleteDraft
 * @memberof sap.fe.core.actions.draft
 * @static
 * @param oContext Context of the document to be discarded
 * @param oAppComponent Context of the document to be discarded
 * @param bEnableStrictHandling
 * @private
 * @returns A Promise resolved when the context is deleted
 * @ui5-restricted
 */
function deleteDraft(oContext: Context, oAppComponent?: AppComponent, bEnableStrictHandling?: boolean): Promise<boolean> {
	const sDiscardAction = getActionName(oContext, draftOperations.DISCARD),
		bIsActiveEntity = oContext.getObject().IsActiveEntity;

	if (bIsActiveEntity || (!bIsActiveEntity && !sDiscardAction)) {
		//Use Delete in case of active entity and no discard action available for draft
		if (oContext.hasPendingChanges()) {
			return oContext
				.getBinding()
				.resetChanges()
				.then(function () {
					return oContext.delete();
				})
				.catch(function (error: any) {
					return Promise.reject(error);
				});
		} else {
			return oContext.delete();
		}
	} else {
		//Use Discard Post Action if it is a draft entity and discard action exists
		return executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling);
	}
}

const draft = {
	createDraftFromActiveDocument: createDraftFromActiveDocument,
	activateDocument: activateDocument,
	deleteDraft: deleteDraft,
	executeDraftEditAction: executeDraftEditAction,
	executeDraftValidation: executeDraftValidation,
	executeDraftPreparationAction: executeDraftPreparationAction,
	executeDraftActivationAction: executeDraftActivationAction,
	hasPrepareAction: hasPrepareAction,
	getMessagesPath: getMessagesPath,
	computeSiblingInformation: computeSiblingInformation,
	processDataLossOrDraftDiscardConfirmation: draftDataLossPopup.processDataLossOrDraftDiscardConfirmation,
	silentlyKeepDraftOnForwardNavigation: draftDataLossPopup.silentlyKeepDraftOnForwardNavigation,
	createOperation: createOperation,
	executeDraftDiscardAction: executeDraftDiscardAction,
	NavigationType: draftDataLossPopup.NavigationType,
	getActionName: getActionName,
	showEditConfirmationMessageBox: showEditConfirmationMessageBox
};

export default draft;
