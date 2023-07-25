import type { InnerControlType } from "sap/fe/templates/ListReport/controls/MultipleModeControl";
import type ListReportController from "sap/fe/templates/ListReport/ListReportController.controller";
import type Event from "sap/ui/base/Event";
import Core from "sap/ui/core/Core";
import type { MessageType } from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import MDCTable from "sap/ui/mdc/Table";
import type ListBinding from "sap/ui/model/ListBinding";

export type LRCustomMessage = {
	message: string;
	type?: MessageType;
	onClose?: Function;
};

export class LRMessageStrip {
	customMessageInfo!: {
		messageManagerDataBinding: ListBinding;
		currentMessage?: Message;
		multiModeControlMessagesMap: { [key: string]: LRCustomMessage | undefined };
	};

	constructor() {
		const messageManager = Core.getMessageManager();
		this.customMessageInfo = {
			messageManagerDataBinding: messageManager.getMessageModel().bindList("/"),
			multiModeControlMessagesMap: {}
		};
	}

	getCustomMessageInfo() {
		return this.customMessageInfo;
	}

	destroy() {
		this.customMessageInfo.messageManagerDataBinding.detachChange(this._eventHandlerCustomMessage, this);
	}

	_getMessagesWithSameTargetThanCustomMessage() {
		const messageManager = Core.getMessageManager();
		return messageManager
			.getMessageModel()
			.getData()
			.filter(
				(msg: Message) =>
					msg.getTargets()[0] === this.customMessageInfo.currentMessage?.getTargets()[0] &&
					msg !== this.customMessageInfo.currentMessage
			);
	}

	/**
	 * MessageManager Event Handler responsible to add or remove the current customMessage.
	 *
	 * @alias sap.fe.core.helpers.LRMessageStrip#_eventHandlerCustomMessage
	 * @private
	 */
	_eventHandlerCustomMessage() {
		const messageManager = Core.getMessageManager();
		if (this.customMessageInfo.currentMessage) {
			const aMessageWithSameTargetThanCustomMessage = this._getMessagesWithSameTargetThanCustomMessage();
			const isCustomMessageInMessageManager = !!messageManager
				.getMessageModel()
				.getData()
				.find((msg: Message) => msg === this.customMessageInfo.currentMessage);

			if (aMessageWithSameTargetThanCustomMessage.length > 0 && isCustomMessageInMessageManager) {
				//if there are other messages with the same message on the MessageManager and the customMessage
				//then we need to remove the customeMessage from the MessageManager
				messageManager.removeMessages([this.customMessageInfo?.currentMessage]);
			} else if (aMessageWithSameTargetThanCustomMessage.length === 0 && !isCustomMessageInMessageManager) {
				messageManager.addMessages([this.customMessageInfo.currentMessage]);
			}
		}
	}

	/**
	 * This function manages the lifecycle of the custom message (populates the customMessageInfo object, attaches an event to the message manager and inserts a message).
	 *
	 * @param event Event object (optional).
	 * @param oData Parameters
	 * @param oData.message The LRCustomMessage to be used to generate the message object
	 * @param oData.table The table targeted by the message
	 * @param oData.skipMessageManagerUpdate Should skip to insert the message in the MessageManager
	 * @alias sap.fe.core.helpers.LRMessageStrip#createCustomMessage
	 * @private
	 */
	createCustomMessage(
		event: Event | null,
		oData: { message: LRCustomMessage | undefined; table: MDCTable; skipMessageManagerUpdate?: boolean }
	) {
		const message = oData.message;
		const table = oData.table;
		const skipMessageManagerUpdate = oData.skipMessageManagerUpdate;
		const rowBindingPath = table.getRowBinding()?.getPath();
		const messageManager = Core.getMessageManager();
		const customMessageMap = this.customMessageInfo.multiModeControlMessagesMap;
		customMessageMap[table.getId()] = message;
		if (!rowBindingPath) {
			table.attachEventOnce("bindingUpdated", oData, this.createCustomMessage, this);
			return;
		}

		if (customMessageMap[table.getId()]?.onClose) {
			table.getDataStateIndicator().detachEvent("close", customMessageMap[table.getId()]?.onClose as Function, this);
		}

		const processor = table.getModel();
		const oMessage = message
			? new Message({
					message: message.message,
					type: message.type,
					target: [rowBindingPath],
					persistent: true,
					processor
			  })
			: null;

		this.customMessageInfo.messageManagerDataBinding.detachChange(this._eventHandlerCustomMessage, this);
		if (!skipMessageManagerUpdate) {
			if (this.customMessageInfo.currentMessage) {
				messageManager.removeMessages([this.customMessageInfo.currentMessage]);
			}
			if (oMessage) {
				this.customMessageInfo.currentMessage = oMessage;
			} else {
				delete this.customMessageInfo.currentMessage;
			}
			if (oMessage && this._getMessagesWithSameTargetThanCustomMessage().length === 0) {
				messageManager.addMessages([oMessage]);
			}
		}
		this.customMessageInfo.messageManagerDataBinding.attachChange(this._eventHandlerCustomMessage, this);

		this.attachDataStateIndicatorCloseEvent(table, customMessageMap, message?.onClose);
	}

	/**
	 * This function attaches the onClose event function to the dataStateIndicator.
	 *
	 * @param table The table associated with the dataStateIndicator
	 * @param customMessageMap The CustomMessageMap object
	 * @param fnOnClose A function to be attached to the "close" event
	 * @alias sap.fe.core.helpers.LRMessageStrip#attachDataStateIndicatorCloseEvent
	 * @private
	 */
	attachDataStateIndicatorCloseEvent(
		table: MDCTable,
		customMessageMap: { [key: string]: LRCustomMessage | undefined },
		fnOnClose?: Function
	) {
		if (fnOnClose) {
			table.getDataStateIndicator().attachEventOnce("close", fnOnClose, this);
		}
		//When closing the the messageStrip, the associated message is removed
		table.getDataStateIndicator().attachEventOnce("close", () => {
			delete customMessageMap[table.getId()];
		});
	}

	/**
	 * MultipleModeControl Event handler responsible for displaying the correct custom message when a specific tab is selected.
	 *
	 * @alias sap.fe.core.helpers.LRMessageStrip#onSelectMultipleModeControl
	 * @private
	 */

	onSelectMultipleModeControl(event: Event, controller: ListReportController) {
		const table = controller._getTable() as MDCTable;
		const message = this.customMessageInfo.multiModeControlMessagesMap[table.getId()];
		this.createCustomMessage(null, { message, table });
	}

	/**
	 * Provide an option for showing a custom message in the message bar above the list report table.
	 *
	 * @param {object} [message] Custom message along with the message type to be set on the table.
	 * @param {string} [message.message] Message string to be displayed.
	 * @param {sap.ui.core.MessageType} [message.type] Indicates the type of message.
	 * @param {ListReportController} [controller] Controller of the current view.
	 * @param {string[]|string} [tabKey] The entitySet identifying the table in which to display the custom message.
	 * @param {Function} [onClose] A function that is called when the user closes the message bar.
	 * @private
	 */
	showCustomMessage(
		message: LRCustomMessage | undefined,
		controller: ListReportController,
		tabKey?: string[] | string | null,
		onClose?: Function
	) {
		const _tabKey = Array.isArray(tabKey) ? tabKey : [tabKey];
		const isMultiMode = controller._isMultiMode();
		let table: MDCTable;
		if (message) {
			message.onClose = onClose;
		}
		if (isMultiMode) {
			const multipleModeControl = controller._getMultiModeControl();
			//we fisrt need to detach the select event to prevent multiple attachments.
			multipleModeControl.detachEvent("select", this.onSelectMultipleModeControl, this);
			multipleModeControl.attachEvent("select", controller, this.onSelectMultipleModeControl, this);

			multipleModeControl.getAllInnerControls(true).forEach((innerControl: InnerControlType, index: number) => {
				if (innerControl.isA("sap.fe.macros.table.TableAPI")) {
					if (!tabKey || _tabKey.indexOf(index.toString()) !== -1) {
						table = (innerControl as any).getContent();
						this.createCustomMessage(null, {
							message,
							table,
							skipMessageManagerUpdate: multipleModeControl.getSelectedInnerControl() !== innerControl
						});
					}
				}
			});
			return;
		}

		table = controller._getTable() as MDCTable;
		this.createCustomMessage(null, { message, table });
	}
}
