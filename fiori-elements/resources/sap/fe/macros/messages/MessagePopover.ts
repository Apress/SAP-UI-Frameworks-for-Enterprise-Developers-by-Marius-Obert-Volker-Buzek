import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import MessageItem from "sap/m/MessageItem";
import MessagePopover from "sap/m/MessagePopover";

@defineUI5Class("sap.fe.macros.messages.MessagePopover")
class FeMessagePopover extends MessagePopover {
	init() {
		MessagePopover.prototype.init.apply(this);
		this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

		this.bindAggregation("items", {
			path: "message>/",
			length: 9999,
			template: new (MessageItem as any)({
				type: "{message>type}",
				title: "{message>message}",
				description: "{message>description}",
				markupDescription: true,
				longtextUrl: "{message>descriptionUrl}",
				subtitle: "{message>additionalText}",
				activeTitle: "{= ${message>controlIds}.length > 0 ? true : false}"
			})
		});
		this.setGroupItems(true);
	}
}

export default FeMessagePopover;
