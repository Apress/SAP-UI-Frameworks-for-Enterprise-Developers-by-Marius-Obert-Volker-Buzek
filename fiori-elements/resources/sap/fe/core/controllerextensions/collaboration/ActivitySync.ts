import { Property } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import {
	broadcastCollaborationMessage,
	endCollaboration,
	initializeCollaboration,
	isCollaborationConnected
} from "sap/fe/core/controllerextensions/collaboration/ActivityBase";
import type { Message, User, UserActivity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import { Activity, CollaborationUtils } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import { FieldSideEffectDictionary } from "sap/fe/core/controllerextensions/SideEffects";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import PageController from "sap/fe/core/PageController";
import MessageBox from "sap/m/MessageBox";
import type Control from "sap/ui/core/Control";
import type View from "sap/ui/core/mvc/View";
import type JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";

const MYACTIVITY = "/collaboration/myActivity";
const ACTIVEUSERS = "/collaboration/activeUsers";
const ACTIVITIES = "/collaboration/activities";
const SYNCGROUPID = "$auto.sync";

export const isConnected = function (control: Control): boolean {
	const internalModel = control.getModel("internal") as JSONModel;
	return isCollaborationConnected(internalModel);
};

export const send = function (
	control: Control,
	action: Activity,
	content: string | string[] | undefined,
	triggeredActionName?: string,
	refreshListBinding?: boolean,
	actionRequestedProperties?: string[]
) {
	if (isConnected(control)) {
		const internalModel = control.getModel("internal") as JSONModel;
		const clientContent = Array.isArray(content) ? content.join("|") : content;
		const requestedProperties = actionRequestedProperties?.join("|");
		const myActivity = internalModel.getProperty(MYACTIVITY);
		if (action === Activity.LiveChange) {
			// To avoid unnecessary traffic we keep track of live changes and send it only once

			if (myActivity === clientContent) {
				return;
			} else {
				internalModel.setProperty(MYACTIVITY, clientContent);
			}
		} else {
			// No need to send an Undo message if there's no current activity
			if (action === Activity.Undo && myActivity === null) {
				return;
			}

			// user finished the activity
			internalModel.setProperty(MYACTIVITY, null);
		}

		broadcastCollaborationMessage(action, clientContent, internalModel, triggeredActionName, refreshListBinding, requestedProperties);
	}
};

const getWebSocketBaseURL = function (bindingContext: Context): string {
	return bindingContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
};

export const isCollaborationEnabled = function (view: View): boolean {
	const bindingContext = view?.getBindingContext && (view.getBindingContext() as Context);
	return !!(bindingContext && getWebSocketBaseURL(bindingContext));
};

export const connect = async function (view: View) {
	const internalModel = view.getModel("internal") as JSONModel;
	const me = CollaborationUtils.getMe(view);

	// Retrieving ME from shell service
	if (!me) {
		// no me = no shell = not sure what to do
		return;
	}

	const bindingContext = view.getBindingContext() as Context;
	const webSocketBaseURL = getWebSocketBaseURL(bindingContext);
	const serviceUrl = bindingContext.getModel().getServiceUrl();

	if (!webSocketBaseURL) {
		return;
	}

	const sDraftUUID = await bindingContext.requestProperty("DraftAdministrativeData/DraftUUID");
	if (!sDraftUUID) {
		return;
	}

	initializeCollaboration(me, webSocketBaseURL, sDraftUUID, serviceUrl, internalModel, (message: Message) => {
		messageReceive(message, view);
	});
	internalModel.setProperty(MYACTIVITY, null);
};

export const disconnect = function (control: Control) {
	const internalModel = control.getModel("internal") as JSONModel;
	endCollaboration(internalModel);
};

/**
 * Callback when a message is received from the websocket.
 *
 * @param message The message received
 * @param view The view that was used initially when connecting the websocket
 */
function messageReceive(message: Message, view: View) {
	const internalModel: any = view.getModel("internal");
	let activeUsers: User[] = internalModel.getProperty(ACTIVEUSERS);
	let activities: UserActivity[];
	let activityKey: string;
	const metaPath = calculateMetaPath(view, message.clientContent);
	message.userAction = message.userAction || message.clientAction;

	const sender: User = {
		id: message.userID,
		name: message.userDescription,
		initials: CollaborationUtils.formatInitials(message.userDescription),
		color: CollaborationUtils.getUserColor(message.userID, activeUsers, [])
	};

	let mactivity: UserActivity = sender;

	// eslint-disable-next-line default-case
	switch (message.userAction) {
		case Activity.Join:
		case Activity.JoinEcho:
			if (activeUsers.findIndex((user) => user.id === sender.id) === -1) {
				activeUsers.unshift(sender);
				internalModel.setProperty(ACTIVEUSERS, activeUsers);
			}

			if (message.userAction === Activity.Join) {
				// we echo our existence to the newly entered user and also send the current activity if there is any
				broadcastCollaborationMessage(Activity.JoinEcho, internalModel.getProperty(MYACTIVITY), internalModel);
			}

			if (message.userAction === Activity.JoinEcho) {
				if (message.clientContent) {
					// another user was already typing therefore I want to see his activity immediately. Calling me again as a live change
					message.userAction = Activity.LiveChange;
					messageReceive(message, view);
				}
			}

			break;

		case Activity.Leave:
			// Removing the active user. Not removing "me" if I had the screen open in another session
			activeUsers = activeUsers.filter((user) => user.id !== sender.id || user.me);
			internalModel.setProperty(ACTIVEUSERS, activeUsers);
			const allActivities = internalModel.getProperty(ACTIVITIES) || {};
			const removeUserActivities = function (bag: any) {
				if (Array.isArray(bag)) {
					return bag.filter((activity) => activity.id !== sender.id);
				} else {
					for (const p in bag) {
						bag[p] = removeUserActivities(bag[p]);
					}
					return bag;
				}
			};
			removeUserActivities(allActivities);
			internalModel.setProperty(ACTIVITIES, allActivities);
			break;

		case Activity.Change:
			updateOnChange(view, message);
			break;

		case Activity.Create:
			// For create we actually just need to refresh the table
			updateOnCreate(view, message);
			break;

		case Activity.Delete:
			// For now also refresh the page but in case of deletion we need to inform the user
			updateOnDelete(view, message);
			break;

		case Activity.Activate:
			draftClosedByOtherUser(view, message.clientContent, CollaborationUtils.getText("C_COLLABORATIONDRAFT_ACTIVATE", sender.name));
			break;

		case Activity.Discard:
			draftClosedByOtherUser(view, message.clientContent, CollaborationUtils.getText("C_COLLABORATIONDRAFT_DISCARD", sender.name));
			break;

		case Activity.Action:
			updateOnAction(view, message);
			break;

		case Activity.LiveChange:
			mactivity = sender;
			mactivity.key = getActivityKey(message.clientContent);

			// stupid JSON model...
			let initJSONModel: string = "";
			const parts = metaPath.split("/");
			for (let i = 1; i < parts.length - 1; i++) {
				initJSONModel += `/${parts[i]}`;
				if (!internalModel.getProperty(ACTIVITIES + initJSONModel)) {
					internalModel.setProperty(ACTIVITIES + initJSONModel, {});
				}
			}

			activities = internalModel.getProperty(ACTIVITIES + metaPath);
			activities = activities?.slice ? activities.slice() : [];
			activities.push(mactivity);
			internalModel.setProperty(ACTIVITIES + metaPath, activities);
			break;

		case Activity.Undo:
			// The user did a change but reverted it, therefore unblock the control
			activities = internalModel.getProperty(ACTIVITIES + metaPath);
			activityKey = getActivityKey(message.clientContent);
			internalModel.setProperty(
				ACTIVITIES + metaPath,
				activities.filter((a) => a.key !== activityKey)
			);
			break;
	}
}

/**
 * Displays a message that the current draft was closed be another user, and navigates back to a proper view.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param path The path of the context to navigate to
 * @param messageText The message to display
 */
function draftClosedByOtherUser(view: View, path: string, messageText: string) {
	disconnect(view);
	MessageBox.information(messageText);
	(view.getBindingContext() as Context)
		.getBinding()
		.resetChanges()
		.then(function () {
			navigate(path, view);
		})
		.catch(function () {
			Log.error("Pending Changes could not be reset - still navigating to active instance");
			navigate(path, view);
		});
}

/**
 * Updates data when a CHANGE message has been received.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param message The message received from the websocket
 */
function updateOnChange(view: View, message: Message) {
	const updatedObjectsPaths = message.clientContent.split("|");
	const metaModel = view.getModel().getMetaModel() as ODataMetaModel;
	const internalModel = view.getModel("internal") as JSONModel;

	// Remove all locks corresponding to the paths
	updatedObjectsPaths.forEach((updatedPath) => {
		const updatedMetaPath = metaModel.getMetaPath(updatedPath);
		const activityKey = getActivityKey(updatedPath);
		let currentActivities: any[] = internalModel.getProperty(ACTIVITIES + updatedMetaPath) || [];
		currentActivities = currentActivities?.filter && currentActivities.filter((activity) => activity.key !== activityKey);
		if (currentActivities) {
			internalModel.setProperty(ACTIVITIES + updatedMetaPath, currentActivities);
		}
	});

	const currentPage = getCurrentPage(view);
	const currentContext = currentPage.getBindingContext() as Context | undefined;
	const requestPromises = updatedObjectsPaths.map((path) => applyUpdatesForChange(view, path));

	// Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
	currentPage.getController().editFlow.updateDocument(currentContext, Promise.all(requestPromises));
}

/**
 * Updates data corresponding to a path.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param propertyPathForUpdate Absolute path to the updated property
 * @returns A promise resolved when the data and its related side effects have been received
 */
async function applyUpdatesForChange(view: View, propertyPathForUpdate: string): Promise<void> {
	const metaModel = view.getModel().getMetaModel() as ODataMetaModel;
	const metaContext = metaModel.getMetaContext(propertyPathForUpdate);
	const dataModelObject = MetaModelConverter.getInvolvedDataModelObjects(metaContext);
	const targetContextPath = propertyPathForUpdate.substring(0, propertyPathForUpdate.lastIndexOf("/")); // Remove property name
	const targetContext = findContextForUpdate(view, targetContextPath);
	const parentCollectionPath = targetContextPath.substring(0, targetContextPath.lastIndexOf("("));
	const parentContextPath = parentCollectionPath.substring(0, parentCollectionPath.lastIndexOf("/"));
	const parentContext = parentContextPath ? findContextForUpdate(view, parentContextPath) : undefined;

	if (!targetContext && !parentContext) {
		return; // No context for update
	}

	try {
		const sideEffectsPromises: Promise<any>[] = [];
		const sideEffectsService = CollaborationUtils.getAppComponent(view).getSideEffectsService();

		if (targetContext) {
			// We have a target context, so we can retrieve the updated property
			const targetMetaPath = metaModel.getMetaPath(targetContext.getPath());
			const relativeMetaPathForUpdate = metaModel.getMetaPath(propertyPathForUpdate).replace(targetMetaPath, "").slice(1);
			sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativeMetaPathForUpdate], targetContext, SYNCGROUPID));
		}

		// Get the fieldGroupIds corresponding to pathForUpdate
		const fieldGroupIds = sideEffectsService.computeFieldGroupIds(
			dataModelObject.targetEntityType.fullyQualifiedName,
			dataModelObject.targetObject.fullyQualifiedName
		);

		// Execute the side effects for the fieldGroupIds
		if (fieldGroupIds.length) {
			const pageController = view.getController() as PageController;
			const sideEffectsMapForFieldGroup = pageController._sideEffects.getSideEffectsMapForFieldGroups(
				fieldGroupIds,
				targetContext || parentContext
			) as FieldSideEffectDictionary;
			Object.keys(sideEffectsMapForFieldGroup).forEach((sideEffectName) => {
				const sideEffect = sideEffectsMapForFieldGroup[sideEffectName];
				sideEffectsPromises.push(
					pageController._sideEffects.requestSideEffects(sideEffect.sideEffects, sideEffect.context, SYNCGROUPID)
				);
			});
		}

		await Promise.all(sideEffectsPromises);
	} catch (err) {
		Log.error("Failed to update data after change:" + err);
		throw err;
	}
}

/**
 * Updates data when a DELETE message has been received.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param message The message received from the websocket
 */
function updateOnDelete(view: View, message: Message) {
	const currentPage = getCurrentPage(view);
	const currentContext = currentPage.getBindingContext() as Context;
	const currentPath = currentContext.getPath();

	const deletedObjectPaths = message.clientContent.split("|");

	// check if user currently displays a deleted object or one of its descendants
	const deletedPathInUse = deletedObjectPaths.find((deletedPath) => currentPath.startsWith(deletedPath));
	if (deletedPathInUse) {
		// any other user deleted the object I'm currently looking at. Inform the user we will navigate to root now
		MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_DELETE", message.userDescription), {
			onClose: () => {
				// We retrieve the deleted context as a keep-alive, and disable its keepalive status,
				// so that it is properly destroyed when refreshing data
				const targetContext = currentContext.getModel().getKeepAliveContext(deletedPathInUse);
				targetContext.setKeepAlive(false);
				const requestPromise = applyUpdatesForCollection(view, deletedObjectPaths[0]);
				currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
				(currentPage.getController() as PageController)._routing.navigateBackFromContext(targetContext);
			}
		});
	} else {
		const requestPromise = applyUpdatesForCollection(view, deletedObjectPaths[0]);
		currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
	}
}

/**
 * Updates data when a CREATE message has been received.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param message The message received from the websocket
 */
function updateOnCreate(view: View, message: Message) {
	const currentPage = getCurrentPage(view);
	const createdObjectPaths = message.clientContent.split("|");

	const requestPromise = applyUpdatesForCollection(view, createdObjectPaths[0]);
	// Simulate a change so the edit flow shows the draft indicator and sets the page to dirty
	currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
}

/**
 * Updates data in a collection.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param pathInCollection A path to an entity in the collection
 */
async function applyUpdatesForCollection(view: View, pathInCollection: string) {
	const appComponent = CollaborationUtils.getAppComponent(view);
	const parentPath = pathInCollection.substring(0, pathInCollection.lastIndexOf("/"));
	const parentContext = findContextForUpdate(view, parentPath);

	if (parentContext) {
		try {
			const sideEffectsPromises: Promise<any>[] = [];

			const metaModel = parentContext.getModel().getMetaModel();
			const metaPathForUpdate = metaModel.getMetaPath(pathInCollection);
			const parentMetaPath = metaModel.getMetaPath(parentContext.getPath());
			const relativePath = metaPathForUpdate.replace(`${parentMetaPath}/`, "");

			// Reload the collection
			const sideEffectsService = appComponent.getSideEffectsService();
			sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativePath], parentContext, SYNCGROUPID));

			// Request the side effects for the collection
			sideEffectsPromises.push(sideEffectsService.requestSideEffectsForNavigationProperty(relativePath, parentContext, SYNCGROUPID));

			await Promise.all(sideEffectsPromises);
		} catch (err) {
			Log.error("Failed to update data after collection update:" + err);
		}
	}
}

/**
 * Updates data when a ACTION message has been received.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param message The message received from the websocket
 */
function updateOnAction(view: View, message: Message) {
	const currentPage = getCurrentPage(view);
	const pathsForAction = message.clientContent.split("|");
	const actionName = message.clientTriggeredActionName || "";
	const requestedProperties = message.clientRequestedProperties?.split("|");
	const refreshListBinding = message.clientRefreshListBinding === "true";

	const requestPromises = pathsForAction.map((path) => requestUpdateForAction(view, path, actionName, requestedProperties));

	if (refreshListBinding) {
		requestPromises.push(applyUpdatesForCollection(view, pathsForAction[0]));
	}

	// Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
	currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), Promise.all(requestPromises));
}

/**
 * Updates side-effects data when an action has been triggered on a context.
 *
 * @param view The view that was used initially when connecting the websocket
 * @param pathForAction Path of the context to apply the action to
 * @param actionName Name of the action
 * @param requestedProperties
 * @returns Promise resolved when the side-effects data has been loaded
 */
async function requestUpdateForAction(
	view: View,
	pathForAction: string,
	actionName: string,
	requestedProperties?: string[]
): Promise<void> {
	const targetContext = findContextForUpdate(view, pathForAction);
	if (!targetContext) {
		return;
	}

	const appComponent = CollaborationUtils.getAppComponent(view);
	const sideEffectService = appComponent.getSideEffectsService();
	const sideEffectsFromAction = sideEffectService.getODataActionSideEffects(actionName, targetContext);
	const sideEffectPromises: Promise<any>[] = [];
	if (sideEffectsFromAction) {
		if (sideEffectsFromAction.pathExpressions?.length) {
			sideEffectPromises.push(
				sideEffectService.requestSideEffects(sideEffectsFromAction.pathExpressions, targetContext, SYNCGROUPID)
			);
		}
	}
	if (requestedProperties && requestedProperties.length > 0) {
		//clean-up of the properties to request list:
		const metaModel = view.getModel().getMetaModel() as ODataMetaModel;
		const metaPathForAction = calculateMetaPath(view, pathForAction);
		const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(metaPathForAction));
		const propertiesToRequest = dataModelPath.targetEntityType.entityProperties
			.map((property: Property) => {
				return property.name;
			})
			.filter((prop) => requestedProperties.includes(prop));
		if (propertiesToRequest.length > 0) {
			sideEffectPromises.push(sideEffectService.requestSideEffects(propertiesToRequest, targetContext, SYNCGROUPID));
		}
	}

	await Promise.all(sideEffectPromises);
}

/**
 * Finds a context to apply an update message (CHANGE, CREATE, DELETE or ACTION).
 *
 * @param view  The view that was used initially when connecting the websocket
 * @param path The path of the context to be found (shall point to an entity, not a property)
 * @returns A context if it could be found
 */
function findContextForUpdate(view: View, path: string): Context | undefined {
	if (!path) {
		return undefined;
	}
	// Find all potential paths
	const targetPaths: string[] = [];
	while (!path.endsWith(")")) {
		targetPaths.unshift(path);
		path = path.substring(0, path.lastIndexOf("/"));
	}
	targetPaths.unshift(path);

	const parentCollectionPath = path.substring(0, path.lastIndexOf("(")); // Remove the last key

	let targetContext: Context | undefined;
	let currentContext = getCurrentPage(view).getBindingContext() as Context | undefined;
	while (currentContext && !targetContext) {
		if (targetPaths.indexOf(currentContext.getPath()) >= 0) {
			targetContext = currentContext;
		}

		currentContext = currentContext.getBinding()?.getContext() as Context | undefined;
	}

	if (targetContext) {
		// Found !
		return targetContext;
	}

	// Try to find the target context in a listBinding
	const model = getCurrentPage(view).getBindingContext().getModel() as ODataModel;
	const parentListBinding = model.getAllBindings().find((binding) => {
		const bindingPath = binding.isRelative() ? binding.getResolvedPath() : binding.getPath();
		return binding.isA("sap.ui.model.odata.v4.ODataListBinding") && bindingPath === parentCollectionPath;
	}) as ODataListBinding | undefined;
	// We've found a list binding that could contain the target context --> look for it
	targetContext = parentListBinding?.getAllCurrentContexts().find((context) => {
		return targetPaths.indexOf(context.getPath()) >= 0;
	});

	return targetContext;
}

function navigate(path: string, view: View) {
	// TODO: routing.navigate doesn't consider semantic bookmarking
	const currentPage = getCurrentPage(view);
	const targetContext = view.getModel().bindContext(path).getBoundContext();
	currentPage.getController().routing.navigate(targetContext);
}

function getCurrentPage(view: View) {
	const appComponent = CollaborationUtils.getAppComponent(view);
	return CommonUtils.getCurrentPageView(appComponent);
}

function getActivityKey(x: string): string {
	return x.substring(x.lastIndexOf("(") + 1, x.lastIndexOf(")"));
}

/**
 * Calculates the metapath from one or more data path(s).
 *
 * @param view The current view
 * @param path One ore more data path(s), in case of multiple paths separated by '|'
 * @returns The calculated metaPath
 */
function calculateMetaPath(view: View, path?: string): string {
	let metaPath = "";
	if (path) {
		// in case more than one path is sent all of them have to use the same metapath therefore we just consider the first one
		const dataPath = path.split("|")[0];
		metaPath = (view.getModel().getMetaModel() as ODataMetaModel).getMetaPath(dataPath);
	}
	return metaPath;
}

export default {
	connect: connect,
	disconnect: disconnect,
	isConnected: isConnected,
	isCollaborationEnabled: isCollaborationEnabled,
	send: send
};
