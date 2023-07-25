import type { BackendUser, User } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import {
	CollaborationUtils,
	getText,
	shareObject,
	UserEditingState,
	UserStatus
} from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import type Button from "sap/m/Button";
import type Dialog from "sap/m/Dialog";
import type Input from "sap/m/Input";
import MessageToast from "sap/m/MessageToast";
import type Popover from "sap/m/Popover";
import type Table from "sap/m/Table";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import coreLibrary from "sap/ui/core/library";
import type View from "sap/ui/core/mvc/View";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
const ValueState = coreLibrary.ValueState;

export const openManageDialog = async function (view: View) {
	let dialog: any = byId("dialog");

	if (!dialog) {
		dialog = await createManageCollaborationDialog(view);
	}

	await readInvitedUsers(view);
	dialog.open();
};

async function createManageCollaborationDialog(view: View) {
	const pDialog: Promise<any> = (view.getController() as any).getExtensionAPI().loadFragment({
		name: "sap.fe.core.controllerextensions.collaboration.ManageDialog",
		id: "manageCollaborationDraft",
		controller: {
			share: share,
			addUser: addUser,
			removeUser: removeUser,
			close: closeDialog,
			addUserChanged: addUserChanged,
			formatUserStatus: formatUserStatus,
			formatUserStatusColor: formatUserStatusColor
		}
	});
	return pDialog
		.then(function (dialog: any) {
			view.addDependent(dialog);
			return dialog;
		})
		.catch(function () {
			throw "not this time";
		});
}

export async function readInvitedUsers(view: View) {
	const model = view.getModel() as ODataModel;
	// TODO: inform model colleagues on missing TS definition
	const parameters: any = {
		$select: "UserID,UserDescription,UserEditingState"
	};
	const invitedUserList = model.bindList(
		"DraftAdministrativeData/DraftAdministrativeUser",
		view.getBindingContext() as Context,
		[],
		[],
		parameters
	);
	const internalModelContext = view.getBindingContext("internal") as InternalModelContext;
	// TODO: limit?
	return invitedUserList
		.requestContexts(0, 100)
		.then(function (aContexts) {
			const invitedUsers: User[] = [];
			const activeUsers = view.getModel("internal").getProperty("/collaboration/activeUsers") || [];
			const me = CollaborationUtils.getMe(view);
			let userStatus: UserStatus;
			if (aContexts?.length > 0) {
				aContexts.forEach(function (oContext) {
					const userData = oContext.getObject() as BackendUser;
					const isMe: boolean = me?.id === userData.UserID;
					const isActive = activeUsers.find((u: User) => u.id === userData.UserID);
					let userDescription = userData.UserDescription || userData.UserID;
					const initials = CollaborationUtils.formatInitials(userDescription);
					userDescription += isMe ? ` (${CollaborationUtils.getText("C_COLLABORATIONDRAFT_YOU")})` : "";
					switch (userData.UserEditingState) {
						case UserEditingState.NoChanges:
							userStatus = isActive ? UserStatus.CurrentlyEditing : UserStatus.NoChangesMade;
							break;
						case UserEditingState.InProgress:
							userStatus = isActive ? UserStatus.CurrentlyEditing : UserStatus.ChangesMade;
							break;
						default:
							userStatus = UserStatus.NotYetInvited;
					}
					const user: User = {
						id: userData.UserID,
						name: userDescription,
						status: userStatus,
						color: CollaborationUtils.getUserColor(userData.UserID, activeUsers, invitedUsers),
						initials: initials,
						me: isMe
					};
					invitedUsers.push(user);
				});
			} else {
				//not yet shared, just add me
				invitedUsers.push(me);
			}
			internalModelContext.setProperty("collaboration/UserID", "");
			internalModelContext.setProperty("collaboration/UserDescription", "");
			internalModelContext.setProperty("collaboration/invitedUsers", invitedUsers);
		})
		.catch(function () {
			// TODO: handle this case, close dialog?
		});
}

function addUser(event: Event) {
	const addButton = event.getSource() as Button;
	const internalModelContext = addButton.getBindingContext("internal") as InternalModelContext;
	const invitedUsers: User[] = internalModelContext.getProperty("invitedUsers") || [];
	const activeUsers = addButton.getModel("internal").getProperty("/collaboration/activeUsers");
	const newUser: User = {
		id: internalModelContext?.getProperty("UserID"),
		name: internalModelContext?.getProperty("UserDescription")
	};

	if (!(invitedUsers.findIndex((user) => user.id === newUser.id) > -1 || (newUser.id === newUser.name && newUser.id === ""))) {
		newUser.name = newUser.name || newUser.id;
		newUser.initials = CollaborationUtils.formatInitials(newUser.name);
		newUser.color = CollaborationUtils.getUserColor(newUser.id, activeUsers, invitedUsers);
		newUser.transient = true;
		newUser.status = UserStatus.NotYetInvited;
		invitedUsers.unshift(newUser);
		internalModelContext.setProperty("invitedUsers", invitedUsers);
		internalModelContext.setProperty("UserID", "");
		internalModelContext.setProperty("UserDescription", "");
	}
}

function addUserChanged(event: Event) {
	const userInput = event.getSource() as Input;
	event
		.getParameter("promise")
		.then(function (newUserId: string) {
			const internalModelContext = userInput.getBindingContext("internal") as InternalModelContext;
			const invitedUsers: User[] = internalModelContext.getProperty("invitedUsers") || [];
			if (invitedUsers.findIndex((user) => user.id === newUserId) > -1) {
				userInput.setValueState("Error");
				userInput.setValueStateText(getText("C_COLLABORATIONDRAFT_INVITATION_USER_ERROR"));
			} else {
				userInput.setValueState("None");
				userInput.setValueStateText("");
			}
		})
		.catch(function () {
			throw "User couldn't be determined at all";
		});
}

function removeUser(event: Event) {
	removeUserFromList(event.getSource());
}

function removeUserFromList(item: any) {
	const internalModelContext = item.getBindingContext("pageInternal");
	const deleteUserID = item.getBindingContext("internal").getProperty("id");
	let invitedUsers: User[] = internalModelContext.getProperty("collaboration/invitedUsers");
	invitedUsers = invitedUsers.filter((user) => user.id !== deleteUserID);
	internalModelContext.setProperty("collaboration/invitedUsers", invitedUsers);
}

function byId(id: string): any {
	return Core.byId(`manageCollaborationDraft--${id}`);
}

function closeDialog() {
	(byId("dialog") as Dialog).close();
}

export function getSharedItemName(bindingContext: Context): string {
	const model = bindingContext.getModel();
	const metaModel = model.getMetaModel();
	const entityPath = metaModel.getMetaPath(bindingContext.getPath());
	const dataModel = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(entityPath));
	const headerInfo = dataModel.targetObject.entityType.annotations?.UI?.HeaderInfo;
	let sharedItemName = "";
	const title = headerInfo?.Title;
	if (title) {
		sharedItemName = isPathAnnotationExpression(title.Value) ? bindingContext.getProperty(title.Value.path) : title.Value;
	}
	return sharedItemName || headerInfo?.TypeName || "";
}

export async function share(event: Event) {
	const users: BackendUser[] = [];
	const source = event.getSource() as Control;
	const bindingContext = source.getBindingContext() as Context;
	const contexts = ((byId("userList") as Table).getBinding("items") as ODataListBinding).getContexts();
	let numberOfNewInvitedUsers = 0;
	contexts.forEach(function (context) {
		users.push({
			UserID: context.getProperty("id"),
			UserAccessRole: "O" // For now according to UX every user retrieves the owner role
		});
		if (context.getObject().status === 0) {
			numberOfNewInvitedUsers++;
		}
	});

	try {
		await shareObject(bindingContext, users);
		MessageToast.show(
			getText("C_COLLABORATIONDRAFT_INVITATION_SUCCESS_TOAST", numberOfNewInvitedUsers.toString(), getSharedItemName(bindingContext))
		);
	} catch {
		MessageToast.show(getText("C_COLLABORATIONDRAFT_INVITATION_FAILED_TOAST"));
	}
	closeDialog();
}

export async function showUserDetails(event: Event, view: View) {
	const source = event.getSource() as Control;
	let popover = byId("userDetails") as Popover;
	if (!popover) {
		popover = await createUserDetailsPopover(view);
	}

	popover.setBindingContext(source.getBindingContext("internal") as InternalModelContext, "internal");

	popover.openBy(source, false);
}

async function createUserDetailsPopover(view: View) {
	const popoverPromise: Promise<any> = Fragment.load({
		id: "manageCollaborationDraft", // todo should be view id
		name: "sap.fe.core.controllerextensions.collaboration.UserDetails"
	});
	return popoverPromise
		.then(function (popover: any) {
			view.addDependent(popover);
			return popover;
		})
		.catch(function () {
			throw "not this time";
		});
}

function formatUserStatus(userStatus: UserStatus) {
	switch (userStatus) {
		case UserStatus.CurrentlyEditing:
			return getText("C_COLLABORATIONDRAFT_USER_CURRENTLY_EDITING");
		case UserStatus.ChangesMade:
			return getText("C_COLLABORATIONDRAFT_USER_CHANGES_MADE");
		case UserStatus.NoChangesMade:
			return getText("C_COLLABORATIONDRAFT_USER_NO_CHANGES_MADE");
		case UserStatus.NotYetInvited:
		default:
			return getText("C_COLLABORATIONDRAFT_USER_NOT_YET_INVITED");
	}
}

function formatUserStatusColor(userStatus: UserStatus) {
	switch (userStatus) {
		case UserStatus.CurrentlyEditing:
			return ValueState.Success;
		case UserStatus.ChangesMade:
			return ValueState.Warning;
		case UserStatus.NoChangesMade:
		case UserStatus.NotYetInvited:
		default:
			return ValueState.Information;
	}
}
