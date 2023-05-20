import { defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import Element from "sap/ui/core/Element";
import FilterOperator from "sap/ui/model/FilterOperator";

@defineUI5Class("sap.fe.macros.messages.MessageFilter")
class MessageFilter extends Element {
	@property({ type: "string" })
	path!: string;

	@property({ type: "sap.ui.model.FilterOperator" })
	operator: FilterOperator = FilterOperator.Contains;

	@property({ type: "string" })
	value1!: string;

	@property({ type: "string" })
	value2!: string;
}

export default MessageFilter;
