import Log from "sap/base/Log";
import ActivitySync from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import DataLossOrDraftDiscardHandler from "sap/fe/core/controls/DataLossOrDraftDiscard/DataLossOrDraftDiscardHandler";
import EditState from "sap/fe/core/helpers/EditState";
import type PageController from "../../PageController";

/* Enum for navigation types */
enum NavigationType {
	BackNavigation = "BackNavigation",
	ForwardNavigation = "ForwardNavigation"
}

/**
 * The method checks whether an optional parameter in the manifest is set to silently keep the draft in case a forward navigation is triggered.
 *
 * @param pageController The reference to the current PageController instance
 * @returns Boolean value with true or false to silently keep the draft
 */
function silentlyKeepDraftOnForwardNavigation(pageController: PageController) {
	let rbSilentlyKeep = false;
	const oManifest = pageController.getAppComponent().getManifest() as any;
	rbSilentlyKeep = oManifest?.["sap.fe"]?.app?.silentlyKeepDraftOnForwardNavigation || false;
	return rbSilentlyKeep;
}

/**
 * Logic to process the fcl mode.
 *
 * @param draftAdminData Admin data
 * @param fnCancelFunction The cancel function
 * @param oController The current controller referenced
 * @param processFunctionForDrafts The functon to process the handler
 * @param bSkipBindingToView The optional parameter to skip the binding to the view
 */
async function processFclMode(
	draftAdminData: any,
	fnCancelFunction: any,
	oController: any,
	processFunctionForDrafts: any,
	bSkipBindingToView?: boolean
) {
	// The application is running in FCL mode so in this case we fall back to
	// the old logic since the dirty state handling is not properly working
	// for FCL.
	if (draftAdminData.CreationDateTime !== draftAdminData.LastChangeDateTime) {
		DataLossOrDraftDiscardHandler.performAfterDiscardorKeepDraft(
			processFunctionForDrafts,
			fnCancelFunction,
			oController,
			bSkipBindingToView
		);
	} else {
		processFunctionForDrafts();
	}
}

/**
 * Logic to process the mode with no active entity.
 *
 * @param draftAdminData Admin data
 * @param fnCancelFunction The cancel function
 * @param oController The current controller referenced
 * @param processFunctionForDrafts The functon to process the handler
 * @param navigationType The navigation type for which the function should be called
 * @param bSilentlyKeepDraftOnForwardNavigation The parameter to determine whether to skip the popup appearance in forward case
 * @param bSkipBindingToView The optional parameter to skip the binding to the view
 */
async function processNoActiveEntityMode(
	draftAdminData: any,
	fnCancelFunction: any,
	oController: any,
	processFunctionForDrafts: any,
	navigationType: NavigationType,
	bSilentlyKeepDraftOnForwardNavigation: boolean,
	bSkipBindingToView?: boolean
) {
	// There is no active entity so we are editing either newly created data or
	// a draft which has never been saved to active version
	// Since we want to react differently in the two situations, we have to check the
	// dirty state
	if (EditState.isEditStateDirty()) {
		if (draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime && navigationType === NavigationType.BackNavigation) {
			// in case we have untouched changes for the draft and a "back"
			// navigation we can silently discard the draft again
			// eslint-disable-next-line promise/no-nesting
			try {
				await DataLossOrDraftDiscardHandler.discardDraft(oController, bSkipBindingToView);
				processFunctionForDrafts();
			} catch (error: any) {
				Log.error("Error while canceling the document", error);
			}
		} else if (navigationType === NavigationType.ForwardNavigation && bSilentlyKeepDraftOnForwardNavigation) {
			// In case we have a "forward navigation" and an additional parameter set in the manifest
			// we "silently" keep the draft
			processFunctionForDrafts();
		} else {
			// In this case data is being changed or a forward navigation is triggered
			// and we always want to show the dataloss dialog on navigation
			DataLossOrDraftDiscardHandler.performAfterDiscardorKeepDraft(
				processFunctionForDrafts,
				fnCancelFunction,
				oController,
				bSkipBindingToView
			);
		}
	} else {
		// We are editing a draft which has been created earlier but never saved to active
		// version and since the edit state is not dirty, there have been no user changes
		// so in this case we want to silently navigate and do nothing
		processFunctionForDrafts();
	}
}
/**
 * Logic to process the draft editing for existing entity.
 *
 * @param oController The current controller referenced.
 * @param oContext The context of the current call
 * @param processFunctionForDrafts The functon to process the handler
 * @param navigationType The navigation type for which the function should be called
 */
async function processEditingDraftForExistingEntity(
	oController: any,
	oContext: any,
	processFunctionForDrafts: any,
	navigationType: NavigationType
) {
	// We are editing a draft for an existing active entity
	// The CreationDateTime and LastChangeDateTime are equal, so this draft was
	// never saved before, hence we're currently editing a newly created draft for
	// an existing active entity for the first time.
	// Also there have so far been no changes made to the draft and in this
	// case we want to silently navigate and delete the draftin case of a back
	// navigation but in case of a forward navigation we want to silently keep it!
	if (navigationType === NavigationType.BackNavigation) {
		const mParameters = {
			skipDiscardPopover: true
		};

		try {
			await oController.editFlow.cancelDocument(oContext, mParameters);
			processFunctionForDrafts();
		} catch (error: any) {
			Log.error("Error while canceling the document", error);
		}
	} else {
		// In case of a forward navigation we silently keep the draft and only
		// execute the followup function.
		processFunctionForDrafts();
	}
}

/**
 * Logic to process the edit state dirty.
 *
 * @param oController The current controller referenced.
 * @param fnCancelFunction The cancel function
 * @param processFunctionForDrafts The functon to process the handler
 * @param navigationType The navigation type for which the function should be called
 * @param bSilentlyKeepDraftOnForwardNavigation The parameter to determine whether to skip the popup appearance in forward case
 * @param bSkipBindingToView The optional parameter to skip the binding to the view.
 */
async function processEditStateDirty(
	oController: any,
	fnCancelFunction: any,
	processFunctionForDrafts: any,
	navigationType: NavigationType,
	bSilentlyKeepDraftOnForwardNavigation: boolean,
	bSkipBindingToView?: boolean
) {
	if (navigationType === NavigationType.ForwardNavigation && bSilentlyKeepDraftOnForwardNavigation) {
		// In case we have a "forward navigation" and an additional parameter set in the manifest
		// we "silently" keep the draft
		processFunctionForDrafts();
	} else {
		// The CreationDateTime and LastChangeDateTime are NOT equal, so we are currently editing
		// an existing draft and need to distinguish depending on if any changes
		// have been made in the current editing session or not
		// Changes have been made in the current editing session so we want
		// to show the dataloss dialog and let the user decide
		DataLossOrDraftDiscardHandler.performAfterDiscardorKeepDraft(
			processFunctionForDrafts,
			fnCancelFunction,
			oController,
			bSkipBindingToView
		);
	}
}

/**
 * Logic to process the admin data.
 *
 * @param draftAdminData Admin data
 * @param fnProcessFunction The functon to process the handler
 * @param fnCancelFunction The cancel function
 * @param oContext The context of the current call
 * @param oController The current controller referenced
 * @param bSkipBindingToView The optional parameter to skip the binding to the view
 * @param navigationType The navigation type for which the function should be called
 */
async function processDraftAdminData(
	draftAdminData: any,
	fnProcessFunction: any,
	fnCancelFunction: any,
	oContext: any,
	oController: any,
	bSkipBindingToView?: boolean,
	navigationType: NavigationType = NavigationType.BackNavigation
) {
	const collaborationConnected = ActivitySync.isConnected(oController.getView());
	const processFunctionForDrafts = !collaborationConnected
		? fnProcessFunction
		: function (...args: any[]) {
				ActivitySync.disconnect(oController.getView());
				fnProcessFunction.apply(null, ...args);
		  };

	const bSilentlyKeepDraftOnForwardNavigation = silentlyKeepDraftOnForwardNavigation(oController);

	if (draftAdminData) {
		if (oController.getAppComponent().getRootViewController().isFclEnabled()) {
			await processFclMode(draftAdminData, fnCancelFunction, oController, processFunctionForDrafts, bSkipBindingToView);
		} else if (!oContext.getObject().HasActiveEntity) {
			processNoActiveEntityMode(
				draftAdminData,
				fnCancelFunction,
				oController,
				processFunctionForDrafts,
				navigationType,
				bSilentlyKeepDraftOnForwardNavigation,
				bSkipBindingToView
			);
		} else if (draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime) {
			processEditingDraftForExistingEntity(oController, oContext, processFunctionForDrafts, navigationType);
		} else if (EditState.isEditStateDirty()) {
			processEditStateDirty(
				oController,
				fnCancelFunction,
				processFunctionForDrafts,
				navigationType,
				bSilentlyKeepDraftOnForwardNavigation,
				bSkipBindingToView
			);
		} else {
			// The user started editing the existing draft but did not make any changes
			// in the current editing session, so in this case we do not want
			// to show the dataloss dialog but just keep the draft
			processFunctionForDrafts();
		}
	} else {
		fnProcessFunction();
	}
}

/**
 * The general handler in which the individual steps are called.
 *
 * @param fnProcessFunction
 * @param fnCancelFunction
 * @param oContext
 * @param oController
 * @param bSkipBindingToView
 * @param navigationType
 */
async function processDataLossOrDraftDiscardConfirmation(
	fnProcessFunction: any,
	fnCancelFunction: any,
	oContext: any,
	oController: any,
	bSkipBindingToView?: boolean,
	navigationType: NavigationType = NavigationType.BackNavigation
) {
	const oView = oController.getView();
	const oModel = oContext.getModel();
	const oMetaModel = oModel.getMetaModel();
	const sEntitySet = oView.getViewData().entitySet ?? "";
	const oDraftRoot = sEntitySet && oMetaModel.getObject("/" + sEntitySet + "@com.sap.vocabularies.Common.v1.DraftRoot");
	const oUIModel = oView.getModel("ui");
	const bIsEditable = oUIModel.getProperty("/isEditable");
	const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();

	// Shouldn't display data loss popover on shell back navigation from sub-object pages
	// and when object page is in display mode
	if (oContext && oContext.getObject() && ((!oDraftRoot && navigationType === NavigationType.BackNavigation) || !bIsEditable)) {
		fnProcessFunction();
	} else {
		try {
			const draftAdminData = await draftDataContext.requestObject();
			await processDraftAdminData(
				draftAdminData,
				fnProcessFunction,
				fnCancelFunction,
				oContext,
				oController,
				bSkipBindingToView,
				navigationType
			);
		} catch (oError: any) {
			Log.error("Cannot retrieve draftDataContext information", oError);
		}
	}
}

const draftDataLossPopup = {
	processDataLossOrDraftDiscardConfirmation: processDataLossOrDraftDiscardConfirmation,
	silentlyKeepDraftOnForwardNavigation: silentlyKeepDraftOnForwardNavigation,
	NavigationType: NavigationType,
	processFclMode: processFclMode,
	processNoActiveEntityMode: processNoActiveEntityMode,
	processEditingDraftForExistingEntity: processEditingDraftForExistingEntity,
	processEditStateDirty: processEditStateDirty
};

export default draftDataLossPopup;
