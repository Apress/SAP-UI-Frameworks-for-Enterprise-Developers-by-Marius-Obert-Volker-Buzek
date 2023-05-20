import ResourceModel from "sap/fe/core/ResourceModel";
import Label from "sap/m/Label";
import Message from "sap/ui/core/message/Message";
import MessageManager from "sap/ui/core/message/MessageManager";
import Field from "sap/ui/mdc/Field";
import MultiValueFieldItem from "sap/ui/mdc/field/MultiValueFieldItem";
import MultiValueField from "sap/ui/mdc/MultiValueField";

/**
 * NON of these export must be imported anywhere outside of the ./operations module.
 * They are only exposed to simplify testing until the operations.ts file has been refactored
 */

// this type is meant to describe the meta information for one ActionParameter (i.e. its object in metaModel)
export type ActionParameter = {
	$Name: string;
	$isCollection: boolean;
	// currently runtime information is written into the metamodel:
	// - in the press handler of the action button on the parameter dialog, the value of each parameter is added
	// - in setActionParameterDefaultValue, this information is used and transferred to the context (in ODataModel) created for the action execution
	// this is quite odd, and it would make much more sense to take the value from actionParameterInfos
	// - however, setActionParameterDefaultValue (or rather the surrounding _executeAction) is also called from other places
	// => for the time being, adding value here to avoid ts errors, subject to refactoring
	// in case of Field, the value is string, in case of MultiValueField, it's MultiValueFieldItem[]
	value: string | MultiValueFieldItem[];
};

export type ActionParameterInfo = {
	parameter: ActionParameter;
	field: Field | MultiValueField;
	isMultiValue: boolean;
	value?: string | MultiValueFieldItem[];
	validationPromise?: Promise<string | MultiValueFieldItem[]>;
	hasError?: boolean;
};

/**
 * Adds error messages for an action parameter field to the message manager.
 *
 * @param messageManager The active MessageManager instance
 * @param messageParameters Information identifying an action parameter and messages refering to this parameter
 * @returns True if the action parameters contain valid data and the mandatory parameters are provided
 */
// in case of missing mandaotory parameter, message currently differs per parameter, as it superfluously contains the label as parameter. Possiblky this could be removed in future, in that case, interface could be simplified to ActionParameterInfo[], string
export async function _addMessageForActionParameter(
	messageManager: MessageManager,
	messageParameters: { actionParameterInfo: ActionParameterInfo; message: string }[]
) {
	messageManager.addMessages(
		messageParameters.map((messageParameter) => {
			const binding = messageParameter.actionParameterInfo.field.getBinding(
				messageParameter.actionParameterInfo.isMultiValue ? "items" : "value"
			);
			return new Message({
				message: messageParameter.message,
				type: "Error",
				processor: binding?.getModel(),
				persistent: true,
				target: binding?.getResolvedPath()
			});
		})
	);
}

/**
 * Checks if all required action parameters contain data and checks for all action parameters if the
 * contained data is valid.
 *
 *
 * @param messageManager The active MessageManager instance
 * @param actionParameterInfos Information identifying an action parameter
 * @param resourceModel The model to load text resources
 */
export async function _validateProperties(
	messageManager: MessageManager,
	actionParameterInfos: ActionParameterInfo[],
	resourceModel: ResourceModel
) {
	await Promise.allSettled(actionParameterInfos.map((actionParameterInfo) => actionParameterInfo.validationPromise));
	const requiredParameterInfos = actionParameterInfos.filter((actionParameterInfo) => actionParameterInfo.field.getRequired());

	/* Hint: The boolean false is a valid value */
	const emptyRequiredFields = requiredParameterInfos.filter((requiredParameterInfo) => {
		if (requiredParameterInfo.isMultiValue) {
			return requiredParameterInfo.value === undefined || !requiredParameterInfo.value.length;
		} else {
			const fieldValue = (requiredParameterInfo.field as Field).getValue();
			return fieldValue === undefined || fieldValue === null || fieldValue === "";
		}
	});

	// message contains label per field for historical reason (originally, it was shown in additional popup, now it's directly added to the field)
	// if this was not the case (and hopefully, in future this might be subject to change), interface of _addMessageForActionParameter could be simplified to just pass emptyRequiredFields and a constant message here
	_addMessageForActionParameter(
		messageManager,
		emptyRequiredFields.map((actionParameterInfo) => ({
			actionParameterInfo: actionParameterInfo,
			message: resourceModel.getText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_MISSING_MANDATORY_MSG", [
				(actionParameterInfo.field.getParent()?.getAggregation("label") as Label).getText()
			])
		}))
	);

	/* Check value state of all parameter */
	const firstInvalidActionParameter = actionParameterInfos.find(
		// unfortunately, _addMessageForActionParameter sets valueState only asynchroneously, thus checking emptyRequiredFields and hasError additionally:
		// - checking hasError: user has changed field to invalid value, validation promise has been rejected, therefore we are adding message to message model
		// which in turn sets value state to 'Error' but this last step might not have happened yet due to asynchronity in model.
		// - also checking value state: also out parameter of another action parameter could change field and it's value state without sending change event.

		(actionParameterInfo) =>
			actionParameterInfo.hasError ||
			actionParameterInfo.field.getValueState() === "Error" ||
			emptyRequiredFields.includes(actionParameterInfo)
	);

	if (firstInvalidActionParameter) {
		firstInvalidActionParameter.field.focus();
		return false;
	} else {
		return true;
	}
}
