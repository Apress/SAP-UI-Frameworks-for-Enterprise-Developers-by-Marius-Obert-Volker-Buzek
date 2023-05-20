import Log from "sap/base/Log";
import AppComponent from "sap/fe/core/AppComponent";
import draft, { SiblingInformation } from "sap/fe/core/controllerextensions/editFlow/draft";
import type MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";
import CheckBox from "sap/m/CheckBox";
import MessageToast from "sap/m/MessageToast";
import Text from "sap/m/Text";

import ResourceModel from "sap/fe/core/ResourceModel";
import TableAPI from "sap/fe/macros/table/TableAPI";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import Table from "sap/ui/mdc/Table";
import Context from "sap/ui/model/odata/v4/Context";
import { InternalModelContext } from "./ModelHelper";

export enum DeleteOptionTypes {
	deletableContexts = "deletableContexts",
	draftsWithDeletableActive = "draftsWithDeletableActive",
	createModeContexts = "createModeContexts",
	unSavedContexts = "unSavedContexts",
	draftsWithNonDeletableActive = "draftsWithNonDeletableActive",
	draftsToDeleteBeforeActive = "draftsToDeleteBeforeActive"
}

export enum DeleteDialogContentControl {
	CHECKBOX = "checkBox",
	TEXT = "text"
}

export type DraftSiblingPair = {
	draft: Context;
	siblingInfo: SiblingInformation;
};

export type DeleteOption = {
	type: DeleteOptionTypes;
	contexts: Context[];
	selected: boolean;
	text?: string;
	control?: DeleteDialogContentControl;
};

export type ModelObjectProperties = {
	deletableContexts: Context[];
	unSavedContexts: Context[];
	createModeContexts: Context[];
	draftsWithNonDeletableActive: Context[];
	lockedContexts: Context[];
	draftsWithDeletableActive: DraftSiblingPair[];
	deleteEnabled: boolean;
};

export type DraftAdministrativeDataType = {
	DraftUUID: string;
	InProcessByUser?: string;
	InProcessByUserDescription?: string;
	CreatedByUserDescription?: string;
	CreatedByUser?: string;
	LastChangedByUserDescription?: string;
	LastChangedByUser?: string;
};

export type DeleteParameters = {
	internalModelContext: InternalModelContext;
	numberOfSelectedContexts: number;
	entitySetName: string;
	parentControl: Control;
	description: { path: string };
	beforeDeleteCallBack: Function;
	deletableContexts: Context[];
	unSavedContexts: Context[];
	createModeContexts: Context[];
	draftsWithNonDeletableActive: Context[];
	lockedContexts: Context[];
	draftsWithDeletableActive: DraftSiblingPair[];
};

export type DeleteTextInfo = {
	infoTxt?: string;
	optionTxt?: string;
	optionWithoutTxt?: boolean;
};

function getUpdatedSelections(
	internalModelContext: InternalModelContext,
	type: DeleteOptionTypes,
	selectedContexts: Context[],
	contextsToRemove: Context[]
): Context[] {
	contextsToRemove.forEach((context: Context) => {
		const idx = selectedContexts.indexOf(context);
		if (idx !== -1) {
			selectedContexts.splice(idx, 1);
		}
	});
	internalModelContext.setProperty(type, []);

	return [...selectedContexts];
}

function clearSelectedContextsForOption(internalModelContext: InternalModelContext, option: DeleteOption) {
	let selectedContexts = (internalModelContext.getProperty("selectedContexts") as Context[]) || [];

	if (option.type === DeleteOptionTypes.deletableContexts) {
		selectedContexts = getUpdatedSelections(
			internalModelContext,
			DeleteOptionTypes.deletableContexts,
			selectedContexts,
			internalModelContext.getProperty(DeleteOptionTypes.deletableContexts) || []
		);
		selectedContexts = getUpdatedSelections(
			internalModelContext,
			DeleteOptionTypes.createModeContexts,
			selectedContexts,
			internalModelContext.getProperty(DeleteOptionTypes.createModeContexts) || []
		);

		const draftSiblingPairs = internalModelContext.getProperty(DeleteOptionTypes.draftsWithDeletableActive) || [];
		const drafts = draftSiblingPairs.map((contextPair: DraftSiblingPair) => {
			return contextPair.draft;
		});
		selectedContexts = getUpdatedSelections(
			internalModelContext,
			DeleteOptionTypes.draftsWithDeletableActive,
			selectedContexts,
			drafts
		);
	} else {
		const contextsToRemove = internalModelContext.getProperty(option.type) || [];
		selectedContexts = getUpdatedSelections(internalModelContext, option.type, selectedContexts, contextsToRemove);
	}
	internalModelContext.setProperty("selectedContexts", selectedContexts);
	internalModelContext.setProperty("numberOfSelectedContexts", selectedContexts.length);
}

function afterDeleteProcess(parameters: DeleteParameters, options: DeleteOption[], contexts: Context[], resourceModel: ResourceModel) {
	const { internalModelContext, entitySetName } = parameters;
	if (internalModelContext) {
		if (internalModelContext.getProperty("deleteEnabled") != undefined) {
			options.forEach((option) => {
				// if an option is selected, then it is deleted. So, we need to remove them from selected contexts.
				if (option.selected) {
					clearSelectedContextsForOption(internalModelContext, option);
				}
			});
		}
		// if atleast one of the options is not selected, then the delete button needs to be enabled.
		internalModelContext.setProperty(
			"deleteEnabled",
			options.some((option) => !option.selected)
		);
	}

	if (contexts.length === 1) {
		MessageToast.show(resourceModel.getText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR", undefined, entitySetName));
	} else {
		MessageToast.show(resourceModel.getText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", undefined, entitySetName));
	}
}

function getLockedContextUser(lockedContext: Context): string {
	const draftAdminData = lockedContext.getObject()["DraftAdministrativeData"] as DraftAdministrativeDataType;
	return (draftAdminData && draftAdminData["InProcessByUser"]) || "";
}

function getLockedObjectsText(resourceModel: ResourceModel, numberOfSelectedContexts: number, lockedContexts: Context[]): string {
	let retTxt = "";

	if (numberOfSelectedContexts === 1 && lockedContexts.length === 1) {
		//only one unsaved object
		const lockedUser = getLockedContextUser(lockedContexts[0]);
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", [lockedUser]);
	} else if (lockedContexts.length == 1) {
		const lockedUser = getLockedContextUser(lockedContexts[0]);
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED", [
			numberOfSelectedContexts,
			lockedUser
		]);
	} else if (lockedContexts.length > 1) {
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", [
			lockedContexts.length,
			numberOfSelectedContexts
		]);
	}

	return retTxt;
}

function getNonDeletableActivesOfDraftsText(resourceModel: ResourceModel, numberOfDrafts: number, totalDeletable: number): string {
	let retTxt = "";

	if (totalDeletable === numberOfDrafts) {
		if (numberOfDrafts === 1) {
			retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFT_OF_NON_DELETABLE_ACTIVE");
		} else {
			retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFTS_OF_NON_DELETABLE_ACTIVE");
		}
	} else if (numberOfDrafts === 1) {
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFT_OF_NON_DELETABLE_ACTIVE");
	} else {
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFTS_OF_NON_DELETABLE_ACTIVE");
	}

	return retTxt;
}

function getUnSavedContextUser(unSavedContext: Context): string {
	const draftAdminData = unSavedContext.getObject()["DraftAdministrativeData"] as DraftAdministrativeDataType;
	let sLastChangedByUser = "";
	if (draftAdminData) {
		sLastChangedByUser = draftAdminData["LastChangedByUserDescription"] || draftAdminData["LastChangedByUser"] || "";
	}

	return sLastChangedByUser;
}

function getUnsavedContextsText(
	resourceModel: ResourceModel,
	numberOfSelectedContexts: number,
	unSavedContexts: Context[],
	totalDeletable: number
): DeleteTextInfo {
	let infoTxt = "",
		optionTxt = "",
		optionWithoutTxt = false;
	if (numberOfSelectedContexts === 1 && unSavedContexts.length === 1) {
		//only one unsaved object are selected
		const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
		infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", [lastChangedByUser]);
		optionWithoutTxt = true;
	} else if (numberOfSelectedContexts === unSavedContexts.length) {
		//only multiple unsaved objects are selected
		infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS");
		optionWithoutTxt = true;
	} else if (totalDeletable === unSavedContexts.length) {
		// non-deletable/locked exists, all deletable are unsaved by others
		if (unSavedContexts.length === 1) {
			const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
			infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR", [
				lastChangedByUser
			]);
		} else {
			infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL");
		}
		optionWithoutTxt = true;
	} else if (totalDeletable > unSavedContexts.length) {
		// non-deletable/locked exists, deletable include unsaved and other types.
		if (unSavedContexts.length === 1) {
			const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
			optionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR", [
				lastChangedByUser
			]);
		} else {
			optionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL");
		}
	}

	return { infoTxt, optionTxt, optionWithoutTxt };
}

function getNonDeletableText(
	mParameters: DeleteParameters,
	totalNumDeletableContexts: number,
	resourceModel: ResourceModel
): Text | undefined {
	const { numberOfSelectedContexts, lockedContexts = [], draftsWithNonDeletableActive = [] } = mParameters;
	const nonDeletableContexts =
		numberOfSelectedContexts - (lockedContexts.length + totalNumDeletableContexts - draftsWithNonDeletableActive.length);
	let retTxt = "";

	if (
		nonDeletableContexts > 0 &&
		(totalNumDeletableContexts === 0 || draftsWithNonDeletableActive.length === totalNumDeletableContexts)
	) {
		// 1. None of the ccontexts are deletable
		// 2. Only drafts of non deletable contexts exist.
		if (lockedContexts.length > 0) {
			// Locked contexts exist
			if (nonDeletableContexts === 1) {
				retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_SINGULAR");
			} else {
				retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_PLURAL");
			}
		} else if (nonDeletableContexts === 1) {
			// Only pure non-deletable contexts exist single
			retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_AND_ONE_OBJECT_NON_DELETABLE");
		} else {
			// Only pure non-deletable contexts exist multiple
			retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_MULTIPLE_AND_ALL_OBJECT_NON_DELETABLE");
		}
	} else if (nonDeletableContexts === 1) {
		// deletable and non-deletable exists together, single
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE", [
			numberOfSelectedContexts
		]);
	} else if (nonDeletableContexts > 1) {
		// deletable and non-deletable exists together, multiple
		retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE", [
			nonDeletableContexts,
			numberOfSelectedContexts
		]);
	}

	return retTxt ? new Text({ text: retTxt }) : undefined;
}

function getConfirmedDeletableContext(contexts: Context[], options: DeleteOption[]): Context[] {
	return options.reduce((result, option) => {
		return option.selected && option.type !== DeleteOptionTypes.draftsToDeleteBeforeActive ? result.concat(option.contexts) : result;
	}, contexts);
}

function getDraftsToDeleteBeforeActive(options: DeleteOption[]): Context[] {
	const contexts: Context[] = [];
	return options.reduce((result, option) => {
		return option.selected && option.type === DeleteOptionTypes.draftsToDeleteBeforeActive ? result.concat(option.contexts) : result;
	}, contexts);
}

function updateDraftOptionsForDeletableTexts(
	mParameters: DeleteParameters,
	vContexts: Context[],
	totalDeletable: number,
	resourceModel: ResourceModel,
	items: Control[],
	options: DeleteOption[]
) {
	const {
		numberOfSelectedContexts,
		draftsWithDeletableActive,
		unSavedContexts,
		createModeContexts,
		lockedContexts,
		draftsWithNonDeletableActive
	} = mParameters;
	let lockedContextsTxt = "";

	// drafts with active
	if (draftsWithDeletableActive.length > 0) {
		const draftsToDeleteBeforeActive: Context[] = [];
		draftsWithDeletableActive.forEach((deletableDraftInfo: DraftSiblingPair) => {
			if (deletableDraftInfo.draft.getProperty("DraftAdministrativeData/InProcessByUser")) {
				// If an own draft is locked then the draft needs to be discarded before deleting active record.
				draftsToDeleteBeforeActive.push(deletableDraftInfo.draft);
			}
			vContexts.push(deletableDraftInfo.siblingInfo.targetContext);
		});
		if (draftsToDeleteBeforeActive.length > 0) {
			options.push({
				type: DeleteOptionTypes.draftsToDeleteBeforeActive,
				contexts: draftsToDeleteBeforeActive,
				selected: true
			});
		}
	}

	// create mode drafts
	if (createModeContexts.length > 0) {
		// create mode drafts
		createModeContexts.forEach((context) => vContexts.push(context));
	}

	// items locked msg
	if (lockedContexts.length > 0) {
		lockedContextsTxt = deleteHelper.getLockedObjectsText(resourceModel, numberOfSelectedContexts, lockedContexts) || "";
		items.push(new Text({ text: lockedContextsTxt }));
	}

	// non deletable msg
	const nonDeletableExists = numberOfSelectedContexts != totalDeletable - draftsWithNonDeletableActive.length + lockedContexts.length;
	const nonDeletableTextCtrl = nonDeletableExists && deleteHelper.getNonDeletableText(mParameters, totalDeletable, resourceModel);
	if (nonDeletableTextCtrl) {
		items.push(nonDeletableTextCtrl);
	}

	// option: unsaved changes by others
	if (unSavedContexts.length > 0) {
		const unsavedChangesTxts =
			deleteHelper.getUnsavedContextsText(resourceModel, numberOfSelectedContexts, unSavedContexts, totalDeletable) || {};
		if (unsavedChangesTxts.infoTxt) {
			items.push(new Text({ text: unsavedChangesTxts.infoTxt }));
		}
		if (unsavedChangesTxts.optionTxt || unsavedChangesTxts.optionWithoutTxt) {
			options.push({
				type: DeleteOptionTypes.unSavedContexts,
				contexts: unSavedContexts,
				text: unsavedChangesTxts.optionTxt,
				selected: true,
				control: DeleteDialogContentControl.CHECKBOX
			});
		}
	}

	// option: drafts with active not deletable
	if (draftsWithNonDeletableActive.length > 0) {
		const nonDeletableActivesOfDraftsText =
			deleteHelper.getNonDeletableActivesOfDraftsText(resourceModel, draftsWithNonDeletableActive.length, totalDeletable) || "";
		if (nonDeletableActivesOfDraftsText) {
			options.push({
				type: DeleteOptionTypes.draftsWithNonDeletableActive,
				contexts: draftsWithNonDeletableActive,
				text: nonDeletableActivesOfDraftsText,
				selected: true,
				control: totalDeletable > 0 ? DeleteDialogContentControl.CHECKBOX : DeleteDialogContentControl.TEXT
			});
		}
	}
}

function updateContentForDeleteDialog(options: DeleteOption[], items: Control[]) {
	if (options.length === 1) {
		// Single option doesn't need checkBox
		const option = options[0];
		if (option.text) {
			items.push(new Text({ text: option.text }));
		}
	} else if (options.length > 1) {
		// Multiple Options

		// Texts
		options.forEach((option: DeleteOption) => {
			if (option.control === "text" && option.text) {
				items.push(new Text({ text: option.text }));
			}
		});
		// CheckBoxs
		options.forEach((option: DeleteOption) => {
			if (option.control === "checkBox" && option.text) {
				items.push(
					new CheckBox({
						text: option.text,
						selected: true,
						select: function (oEvent: Event) {
							const checkBox = oEvent.getSource() as CheckBox;
							const selected = checkBox.getSelected();
							option.selected = selected;
						}
					})
				);
			}
		});
	}
}

function updateOptionsForDeletableTexts(
	mParameters: DeleteParameters,
	directDeletableContexts: Context[],
	resourceModel: ResourceModel,
	options: DeleteOption[]
) {
	const {
		numberOfSelectedContexts,
		entitySetName,
		parentControl,
		description,
		lockedContexts,
		draftsWithNonDeletableActive,
		unSavedContexts
	} = mParameters;
	const totalDeletable = directDeletableContexts.length + draftsWithNonDeletableActive.length + unSavedContexts.length;
	const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalDeletable - draftsWithNonDeletableActive.length);

	if (numberOfSelectedContexts === 1 && numberOfSelectedContexts === directDeletableContexts.length) {
		// single deletable context
		const oLineContextData = directDeletableContexts[0].getObject();
		const oTable = parentControl as Table;
		const sKey = oTable && (oTable.getParent() as TableAPI).getIdentifierColumn();
		let txt;
		let aParams = [];
		if (sKey) {
			const sKeyValue = sKey ? oLineContextData[sKey] : undefined;
			const sDescription = description && description.path ? oLineContextData[description.path] : undefined;
			if (sKeyValue) {
				if (sDescription && description && sKey !== description.path) {
					aParams = [sKeyValue + " ", sDescription];
				} else {
					aParams = [sKeyValue, ""];
				}
				txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", aParams, entitySetName);
			} else {
				txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName);
			}
		} else {
			txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName);
		}
		options.push({
			type: DeleteOptionTypes.deletableContexts,
			contexts: directDeletableContexts,
			text: txt,
			selected: true,
			control: DeleteDialogContentControl.TEXT
		});
	} else if (
		unSavedContexts.length !== totalDeletable &&
		numberOfSelectedContexts > 0 &&
		(directDeletableContexts.length > 0 || (unSavedContexts.length > 0 && draftsWithNonDeletableActive.length > 0))
	) {
		if (numberOfSelectedContexts > directDeletableContexts.length && nonDeletableContexts + lockedContexts.length > 0) {
			// other types exists with pure deletable ones
			let deletableOptionTxt = "";
			if (totalDeletable === 1) {
				deletableOptionTxt = resourceModel.getText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE",
					undefined,
					entitySetName
				);
			} else {
				deletableOptionTxt = resourceModel.getText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE",
					undefined,
					entitySetName
				);
			}
			options.unshift({
				type: DeleteOptionTypes.deletableContexts,
				contexts: directDeletableContexts,
				text: deletableOptionTxt,
				selected: true,
				control: DeleteDialogContentControl.TEXT
			});
		} else {
			// only deletable
			const allDeletableTxt =
				totalDeletable === 1
					? resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName)
					: resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL", undefined, entitySetName);
			options.push({
				type: DeleteOptionTypes.deletableContexts,
				contexts: directDeletableContexts,
				text: allDeletableTxt,
				selected: true,
				control: DeleteDialogContentControl.TEXT
			});
		}
	}
}

async function deleteConfirmHandler(
	options: DeleteOption[],
	mParameters: DeleteParameters,
	messageHandler: MessageHandler,
	resourceModel: ResourceModel,
	appComponent: AppComponent,
	draftEnabled: boolean
) {
	try {
		const contexts = deleteHelper.getConfirmedDeletableContext([], options);
		const draftsToDeleteBeforeActive = getDraftsToDeleteBeforeActive(options);

		const { beforeDeleteCallBack, parentControl } = mParameters;
		if (beforeDeleteCallBack) {
			await beforeDeleteCallBack({ contexts: contexts });
		}

		if (contexts && contexts.length) {
			try {
				const enableStrictHandling = contexts.length === 1 ? true : false;
				const draftErrors: unknown[] = [];
				await Promise.allSettled(
					draftsToDeleteBeforeActive.map(function (context: Context) {
						try {
							return draft.deleteDraft(context, appComponent, enableStrictHandling);
						} catch (e: unknown) {
							Log.error(`FE : core : DeleteHelper : Error while discrding draft with path : ${context.getPath()}`);
							draftErrors.push(e);
						}
					})
				);

				await Promise.all(
					contexts.map(function (context: Context) {
						if (draftEnabled && !context.getProperty("IsActiveEntity")) {
							//delete the draft
							return draft.deleteDraft(context, appComponent, enableStrictHandling);
						}
						return context.delete();
					})
				);
				deleteHelper.afterDeleteProcess(mParameters, options, contexts, resourceModel);
				if (draftErrors.length > 0) {
					throw Error(`FE : core : DeleteHelper : Errors on draft delete : ${draftErrors}`);
				}
			} catch (error) {
				await messageHandler.showMessageDialog({ control: parentControl });
				// re-throw error to enforce rejecting the general promise
				throw error;
			}
		}
	} catch (oError) {
		await messageHandler.showMessages();
		// re-throw error to enforce rejecting the general promise
		throw oError;
	}
}

// Table Runtime Helpers:

/* refreshes data in internal model relevant for enablement of delete button according to selected contexts
relevant data are: deletableContexts, draftsWithDeletableActive, draftsWithNonDeletableActive, createModeContexts, unSavedContexts, deleteEnabled
not relevant: lockedContexts
*/
async function updateDeleteInfoForSelectedContexts(internalModelContext: InternalModelContext, selectedContexts: Context[]) {
	type contextInfo = {
		context: Context;
		siblingPromise: Promise<SiblingInformation | undefined | void>;
		siblingInfo: SiblingInformation | undefined;
		isDraftRoot: boolean;
		isDraftNode: boolean;
		isActive: boolean;
		hasActive: boolean;
		hasDraft: boolean;
		locked: boolean;
		deletable: boolean;
		siblingDeletable: boolean;
	};
	const contextInfos = selectedContexts.map((context) => {
		// assuming metaContext is the same for all contexts, still not relying on this assumption
		const metaContext = context.getModel().getMetaModel().getMetaContext(context.getCanonicalPath());
		const deletablePath = metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable/$Path");
		const staticDeletable =
			!deletablePath && metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable") !== false;
		// default values according to non-draft case (sticky behaves the same as non-draft from UI point of view regarding deletion)
		const info: contextInfo = {
			context: context,
			isDraftRoot: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftRoot"),
			isDraftNode: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftNode"),
			isActive: true,
			hasActive: false,
			hasDraft: false,
			locked: false,
			deletable: deletablePath ? context.getProperty(deletablePath) : staticDeletable,
			siblingPromise: Promise.resolve(undefined),
			siblingInfo: undefined,
			siblingDeletable: false
		};

		if (info.isDraftRoot) {
			info.locked = !!context.getObject("DraftAdministrativeData")?.InProcessByUser;
			info.hasDraft = context.getProperty("HasDraftEntity");
		}
		if (info.isDraftRoot) {
			info.isActive = context.getProperty("IsActiveEntity");
			info.hasActive = context.getProperty("HasActiveEntity");
			if (!info.isActive && info.hasActive) {
				// get sibling contexts (only relevant for draft root, not for nodes)
				// draft.computeSiblingInformation expects draft root as first parameter - if we are on a subnode, this is not given
				// - done wrong also above, but seems not to break anything
				// - why is draft.computeSiblingInformation not able to calculate draft root on its own?!
				// - and why is it not able to deal with contexts not draft enabled (of course they never have a sibling - could just return undefined)
				info.siblingPromise = draft.computeSiblingInformation(context, context).then(async (siblingInformation) => {
					// For draftWithDeletableActive bucket, currently also siblingInformation is put into internalModel and used
					// from there in case of deletion. Therefore, sibling needs to be retrieved in case of staticDeletable.
					// Possible improvement: Only read siblingInfo here if needed for determination of delete button enablement,
					// in other cases, read it only if deletion really happens.
					info.siblingInfo = siblingInformation;
					if (deletablePath) {
						info.siblingDeletable = await siblingInformation?.targetContext?.requestProperty(deletablePath);
					} else {
						info.siblingDeletable = staticDeletable;
					}
				});
			}
		}
		return info;
	});
	// wait for all siblingPromises. If no sibling exists, promise is resolved to undefined (but it's still a promise)
	await Promise.all(contextInfos.map((info) => info.siblingPromise));

	const buckets = [
		{
			key: "draftsWithDeletableActive",
			// only for draft root: In that case, the delete request needs to be sent for the active (i.e. the sibling),
			// while in draft node, the delete request needs to be send for the draft itself
			value: contextInfos.filter((info) => info.isDraftRoot && !info.isActive && info.hasActive && info.siblingDeletable)
		},
		{
			key: "draftsWithNonDeletableActive",
			// only for draft root: For draft node, we only rely on information in the draft itself (not its active sibling)
			// application has to take care to set this correctly (in case active sibling must not be deletable, activation
			// of draft with deleted node would also delte active sibling => deletion of draft node to be avoided)
			value: contextInfos.filter((info) => info.isDraftRoot && !info.isActive && info.hasActive && !info.siblingDeletable)
		},
		{ key: "lockedContexts", value: contextInfos.filter((info) => info.isDraftRoot && info.isActive && info.hasDraft && info.locked) },
		{
			key: "unSavedContexts",
			value: contextInfos.filter((info) => info.isDraftRoot && info.isActive && info.hasDraft && !info.locked)
		},
		// non-draft/sticky and deletable
		// active draft root without any draft and deletable
		// created draft root (regardless of deletable)
		// draft node only according to its annotation
		{
			key: "deletableContexts",
			value: contextInfos.filter(
				(info) =>
					(!info.isDraftRoot && !info.isDraftNode && info.deletable) ||
					(info.isDraftRoot && info.isActive && !info.hasDraft && info.deletable) ||
					(info.isDraftRoot && !info.isActive && !info.hasActive) ||
					(info.isDraftNode && info.deletable)
			)
		}
	];

	for (const { key, value } of buckets) {
		internalModelContext.setProperty(
			key,
			// Currently, bucket draftsWithDeletableActive has a different structure (containing also sibling information, which is used
			// in case of deletion). Possible improvement: Read sibling information only when needed, and build all buckets with same
			// structure. However, in that case siblingInformation might need to be read twice (if already needed for button enablement),
			// thus a buffer probably would make sense.
			value.map((info) =>
				key === "draftsWithDeletableActive" ? { draft: info.context, siblingInfo: info.siblingInfo } : info.context
			)
		);
	}
}

const deleteHelper = {
	getNonDeletableText,
	deleteConfirmHandler,
	updateOptionsForDeletableTexts,
	updateContentForDeleteDialog,
	updateDraftOptionsForDeletableTexts,
	getConfirmedDeletableContext,
	getLockedObjectsText,
	getUnsavedContextsText,
	getNonDeletableActivesOfDraftsText,
	afterDeleteProcess,
	updateDeleteInfoForSelectedContexts
};

export default deleteHelper;
