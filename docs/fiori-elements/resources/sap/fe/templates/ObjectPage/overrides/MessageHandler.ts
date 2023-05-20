import type MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";

const MessageHandlerExtension = {
	getShowBoundMessagesInMessageDialog: function (this: MessageHandler) {
		// in case of edit mode we show the messages in the message popover
		return (
			!this.base.getModel("ui").getProperty("/isEditable") ||
			(this.base.getView().getBindingContext("internal") as InternalModelContext).getProperty("isActionParameterDialogOpen") ||
			(this.base.getView().getBindingContext("internal") as InternalModelContext).getProperty("getBoundMessagesForMassEdit")
		);
	}
};

export default MessageHandlerExtension;
