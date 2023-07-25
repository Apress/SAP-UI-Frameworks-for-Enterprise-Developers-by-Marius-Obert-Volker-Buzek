import Log from "sap/base/Log";
import UriParameters from "sap/base/util/UriParameters";
import type { Message, User } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import type Event from "sap/ui/base/Event";
import SapPcpWebSocket, { SUPPORTED_PROTOCOLS } from "sap/ui/core/ws/SapPcpWebSocket";
import type JSONModel from "sap/ui/model/json/JSONModel";

const COLLABORATION = "/collaboration";
const CONNECTED = "/collaboration/connected";
const CONNECTION = "/collaboration/connection";
const CURRENTDRAFTID = "/collaboration/DraftID";

export function isCollaborationConnected(internalModel: JSONModel): boolean {
	return !!internalModel.getProperty(CONNECTED);
}

export function initializeCollaboration(
	user: User,
	webSocketBaseURL: string,
	draftUUID: string,
	serviceUrl: string,
	internalModel: JSONModel,
	receiveCallback: (_: Message) => void,
	sendUserInfo = false
) {
	if (internalModel.getProperty(CONNECTION)) {
		// A connection is already established
		if (internalModel.getProperty(CURRENTDRAFTID) === draftUUID) {
			// Connection corresponds to the same draft -> nothing to do
			return;
		} else {
			// There was a connection to another draft -> we close it before creating a new one
			// This can happen e.g. when switching between items in FCL
			endCollaboration(internalModel);
		}
	}

	const activeUsers: User[] = [user];
	internalModel.setProperty(COLLABORATION, { activeUsers: activeUsers, activities: {} });

	sendUserInfo = sendUserInfo || UriParameters.fromQuery(window.location.search).get("useFLPUser") === "true";

	const webSocket = createWebSocket(user, webSocketBaseURL, draftUUID, serviceUrl, sendUserInfo);

	internalModel.setProperty(CONNECTION, webSocket);
	internalModel.setProperty(CURRENTDRAFTID, draftUUID);

	webSocket.attachMessage(function (event: Event) {
		const message: Message = event.getParameter("pcpFields");
		receiveCallback(message);
	});

	webSocket.attachOpen(function () {
		internalModel.setProperty(CONNECTED, true);
	});

	webSocket.attachError(function () {
		Log.error(`The connection to the websocket channel ${webSocketBaseURL} could not be established`);
		internalModel.setProperty(CONNECTED, false);
	});

	webSocket.attachClose(function () {
		internalModel.setProperty(CONNECTED, false);
	});
}

export function broadcastCollaborationMessage(
	action: Activity,
	content: string | undefined,
	internalModel: JSONModel,
	triggeredActionName?: string,
	refreshListBinding?: boolean,
	requestedProperties?: string
) {
	if (isCollaborationConnected(internalModel)) {
		const webSocket = internalModel.getProperty(CONNECTION) as SapPcpWebSocket;

		webSocket.send("", {
			clientAction: action,
			clientContent: content,
			clientTriggeredActionName: triggeredActionName,
			clientRefreshListBinding: refreshListBinding,
			clientRequestedProperties: requestedProperties
		});

		if (action === Activity.Activate || action === Activity.Discard) {
			endCollaboration(internalModel);
		}
	}
}

export function endCollaboration(internalModel: JSONModel) {
	const webSocket = internalModel.getProperty(CONNECTION) as SapPcpWebSocket;
	webSocket?.close();
	internalModel.setProperty(COLLABORATION, {});
}

function createWebSocket(user: User, socketBaseURL: string, draftUUID: string, serviceUrl: string, sendUserInfo = false) {
	const hostLocation = window.location;
	let socketURI;

	// Support useBackendUrl for local testing
	const useBackendUrl = UriParameters.fromQuery(window.location.search).get("useBackendUrl");
	if (useBackendUrl) {
		socketURI = useBackendUrl.replace("https", "wss");
	} else {
		socketURI = hostLocation.protocol === "https:" ? "wss:" : "ws:";
		socketURI += `//${hostLocation.host}`;
	}

	socketURI += `${(socketBaseURL.startsWith("/") ? "" : "/") + socketBaseURL}?draft=${draftUUID}&relatedService=${serviceUrl}`;

	if (sendUserInfo) {
		socketURI += `&userID=${encodeURI(user.id)}&userName=${encodeURI(user.initialName || "")}`;
	}

	return new SapPcpWebSocket(socketURI, [SUPPORTED_PROTOCOLS.v10]);
}
