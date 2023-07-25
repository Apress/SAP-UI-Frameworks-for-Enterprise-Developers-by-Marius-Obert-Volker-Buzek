import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type ResourceModel from "sap/fe/core/ResourceModel";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import type Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import Message from "sap/ui/core/message/Message";
import type Control from "sap/ui/mdc/Control";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import OperationsDialogBlock from "./controllerextensions/dialog/OperationsDialog.block";
import type MessageHandler from "./controllerextensions/MessageHandler";
import messageHandling from "./controllerextensions/messageHandler/messageHandling";
import { MessageType } from "./formatters/TableFormatterTypes";
type StrictHandlingPromise = {
	resolve: Function;
	groupId: string;
	requestSideEffects?: Function;
};
type StrictHandlingParameters = {
	internalOperationsPromiseResolve: Function;
	label: string;
	model: ODataModel;
	internalModelContext?: InternalModelContext;
	control: Control;
	requestSideEffects?: Function;
	dialog?: Dialog;
	bGrouped: boolean;
};
type OperationsHelper = {
	renderMessageView: Function;
	fnOnStrictHandlingFailed: Function;
};

export type StrictHandlingUtilities = {
	is412Executed: boolean;
	strictHandlingTransitionFails: Object[];
	strictHandlingPromises: StrictHandlingPromise[];
	strictHandlingWarningMessages: Message[];
	delaySuccessMessages: Message[];
	processedMessageIds: string[];
};

function renderMessageView(
	mParameters: StrictHandlingParameters,
	resourceModel: ResourceModel,
	messageHandler: MessageHandler | undefined,
	aMessages: Message[],
	strictHandlingUtilities: StrictHandlingUtilities,
	isMultiContext412: boolean,
	resolve?: Function,
	sGroupId?: string,
	isUnboundAction?: boolean
): unknown;
function renderMessageView(
	mParameters: StrictHandlingParameters,
	resourceModel: ResourceModel,
	messageHandler: MessageHandler | undefined,
	aMessages: Message[],
	strictHandlingUtilities: StrictHandlingUtilities,
	isMultiContext412?: boolean,
	resolve?: Function,
	sGroupId?: string,
	isUnboundAction?: boolean
) {
	const sActionName = mParameters.label;
	const oModel = mParameters.model;
	const strictHandlingPromises = strictHandlingUtilities?.strictHandlingPromises;
	let sMessage: string;
	let sCancelButtonTxt: string = resourceModel.getText("C_COMMON_DIALOG_CANCEL");
	let warningMessageText = "";
	let genericChangesetMessage = "";
	warningMessageText = mParameters.bGrouped
		? resourceModel.getText("C_COMMON_DIALOG_CANCEL_MESSAGE_TEXT", [sActionName])
		: resourceModel.getText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT");
	if (aMessages.length === 1) {
		const messageText = aMessages[0].getMessage();
		const identifierText = aMessages[0].getAdditionalText();
		genericChangesetMessage = resourceModel.getText("C_COMMON_DIALOG_CANCEL_SINGLE_MESSAGE_TEXT");
		if (!isMultiContext412) {
			sMessage = `${messageText}\n${resourceModel.getText("PROCEED")}`;
		} else if (identifierText !== undefined && identifierText !== "") {
			sCancelButtonTxt = mParameters.bGrouped ? sCancelButtonTxt : resourceModel.getText("C_COMMON_DIALOG_SKIP");
			const sHeaderInfoTypeName = (mParameters.control.getParent() as TableAPI).getTableDefinition().headerInfoTypeName;
			if (sHeaderInfoTypeName) {
				sMessage = `${sHeaderInfoTypeName.toString()} ${identifierText}: ${messageText}\n\n${warningMessageText}`;
			} else {
				sMessage = `${identifierText}: ${messageText}\n\n${warningMessageText}`;
			}
		} else {
			sCancelButtonTxt = mParameters.bGrouped ? sCancelButtonTxt : resourceModel.getText("C_COMMON_DIALOG_SKIP");
			sMessage = `${messageText}\n\n${warningMessageText}`;
		}
		if (isMultiContext412) {
			sMessage = `${genericChangesetMessage}\n\n${sMessage}`;
		}
		MessageBox.warning(sMessage, {
			title: resourceModel.getText("WARNING"),
			actions: [sActionName, sCancelButtonTxt],
			emphasizedAction: sActionName,
			onClose: function (sAction: string) {
				if (sAction === sActionName) {
					if (isUnboundAction) {
						// condition is true for unbound as well as static actions
						resolve!(true);
						oModel.submitBatch(sGroupId!);
						if (mParameters.requestSideEffects) {
							mParameters.requestSideEffects();
						}
					} else if (!isMultiContext412) {
						// condition true when mulitple contexts are selected but only one strict handling warning is recieved
						strictHandlingPromises[0].resolve(true);
						oModel.submitBatch(strictHandlingPromises[0].groupId);
						if (strictHandlingPromises[0].requestSideEffects) {
							strictHandlingPromises[0].requestSideEffects();
						}
					} else {
						strictHandlingPromises.forEach(function (sHPromise: StrictHandlingPromise) {
							sHPromise.resolve(true);
							oModel.submitBatch(sHPromise.groupId);
							if (sHPromise.requestSideEffects) {
								sHPromise.requestSideEffects();
							}
						});
						const strictHandlingFails = strictHandlingUtilities?.strictHandlingTransitionFails;
						if (strictHandlingFails.length > 0) {
							messageHandler?.removeTransitionMessages();
						}
					}
					if (strictHandlingUtilities) {
						strictHandlingUtilities.is412Executed = true;
					}
				} else {
					if (strictHandlingUtilities) {
						strictHandlingUtilities.is412Executed = false;
					}
					if (isUnboundAction) {
						resolve!(false);
					} else if (!isMultiContext412) {
						strictHandlingPromises[0].resolve(false);
					} else {
						strictHandlingPromises.forEach(function (sHPromise: StrictHandlingPromise) {
							sHPromise.resolve(false);
						});
					}
					if (mParameters.bGrouped) {
						MessageBox.information(resourceModel.getText("M_CHANGESET_CANCEL_MESSAGES"), {
							contentWidth: "150px"
						} as object);
					}
				}
				if (strictHandlingUtilities) {
					strictHandlingUtilities.strictHandlingWarningMessages = [];
				}
			}
		});
	} else if (aMessages.length > 1) {
		if (isMultiContext412) {
			sCancelButtonTxt = mParameters.bGrouped ? sCancelButtonTxt : resourceModel.getText("C_COMMON_DIALOG_SKIP");
			const sWarningMessage = mParameters.bGrouped
				? resourceModel.getText("C_COMMON_DIALOG_CANCEL_MESSAGES_WARNING")
				: resourceModel.getText("C_COMMON_DIALOG_SKIP_MESSAGES_WARNING");
			const sWarningDesc = mParameters.bGrouped
				? resourceModel.getText("C_COMMON_DIALOG_CANCEL_MESSAGES_TEXT", [sActionName])
				: resourceModel.getText("C_COMMON_DIALOG_SKIP_MESSAGES_TEXT", [sActionName]);
			const genericMessage = new Message({
				message: sWarningMessage,
				type: MessageType.Warning,
				target: undefined,
				persistent: true,
				description: sWarningDesc
			});
			aMessages = [genericMessage].concat(aMessages);
		}
		const oMessageDialogModel = new JSONModel();
		oMessageDialogModel.setData(aMessages);
		const bStrictHandlingFlow = true;
		const oMessageObject = messageHandling.prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, isMultiContext412);
		const operationsDialog = new OperationsDialogBlock({
			messageObject: oMessageObject,
			isMultiContext412: isMultiContext412,
			isGrouped: mParameters?.bGrouped,
			resolve: resolve,
			model: oModel,
			groupId: sGroupId,
			actionName: sActionName,
			strictHandlingUtilities: strictHandlingUtilities,
			strictHandlingPromises: strictHandlingPromises,
			messageHandler: messageHandler,
			messageDialogModel: oMessageDialogModel,
			cancelButtonTxt: sCancelButtonTxt,
			showMessageInfo: function showMessageInfo() {
				MessageBox.information(resourceModel.getText("M_CHANGESET_CANCEL_MESSAGES"), {
					contentWidth: "150px"
				} as object);
			}
		});
		operationsDialog.open();
	}
}

async function fnOnStrictHandlingFailed(
	sGroupId: string,
	mParameters: StrictHandlingParameters,
	resourceModel: ResourceModel,
	currentContextIndex: number | null,
	oContext: Context | null,
	iContextLength: number | null,
	messageHandler: MessageHandler | undefined,
	strictHandlingUtilities: StrictHandlingUtilities,
	a412Messages: Message[]
) {
	let shPromiseParams: StrictHandlingPromise | undefined;

	if ((currentContextIndex === null && iContextLength === null) || (currentContextIndex === 1 && iContextLength === 1)) {
		return new Promise(function (resolve) {
			operationsHelper.renderMessageView(
				mParameters,
				resourceModel,
				messageHandler,
				a412Messages,
				strictHandlingUtilities,
				false,
				resolve,
				sGroupId,
				true
			);
		});
	}

	if (a412Messages.length) {
		const strictHandlingPromise = new Promise(function (resolve) {
			shPromiseParams = {
				requestSideEffects: mParameters.requestSideEffects,
				resolve: resolve,
				groupId: sGroupId
			};
		});

		strictHandlingUtilities.strictHandlingPromises.push(shPromiseParams as StrictHandlingPromise);
		// copy existing 412 warning messages
		const aStrictHandlingWarningMessages: Message[] = strictHandlingUtilities.strictHandlingWarningMessages;
		const sColumn = (mParameters.control?.getParent() as TableAPI)?.getIdentifierColumn();
		let sValue = "";
		if (sColumn && iContextLength && iContextLength > 1) {
			sValue = oContext && oContext.getObject(sColumn);
		}

		// set type and subtitle for all warning messages
		a412Messages.forEach(function (msg: Message) {
			msg.setType("Warning");
			msg.setAdditionalText(sValue);
			aStrictHandlingWarningMessages.push(msg);
		});

		strictHandlingUtilities.strictHandlingWarningMessages = aStrictHandlingWarningMessages;
		mParameters.internalOperationsPromiseResolve();
		return strictHandlingPromise;
	}
}

const operationsHelper: OperationsHelper = {
	renderMessageView: renderMessageView,
	fnOnStrictHandlingFailed: fnOnStrictHandlingFailed
};

export default operationsHelper;
