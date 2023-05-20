import type { EnhanceWithUI5 } from "sap/fe/core/helpers/ClassSupport";
import { association, defineUI5Class, event, property, xmlEventHandler } from "sap/fe/core/helpers/ClassSupport";
import type FieldWrapper from "sap/fe/macros/controls/FieldWrapper";
import type Button from "sap/m/Button";
import type CheckBox from "sap/m/CheckBox";
import type HBox from "sap/m/HBox";
import type InputBase from "sap/m/InputBase";
import type UI5Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import type { MessageType } from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import MacroAPI from "../MacroAPI";

/**
 * Additional format options for the field.
 *
 * @alias sap.fe.macros.FieldFormatOptions
 * @public
 */
export type FieldFormatOptions = {
	/**
	 *  Defines how the field value and associated text will be displayed together.<br/>
	 *
	 *  Allowed values are "Value", "Description", "DescriptionValue" and "ValueDescription"
	 *
	 *  @public
	 */
	displayMode: "Value" | "Description" | "DescriptionValue" | "ValueDescription";
	/**
	 * Defines if and how the field measure will be displayed.<br/>
	 *
	 * Allowed values are "Hidden" and "ReadOnly"
	 *
	 *  @public
	 */
	measureDisplayMode: "Hidden" | "ReadOnly";
	/**
	 * Maximum number of lines for multiline texts in edit mode.<br/>
	 *
	 *  @public
	 */
	textLinesEdit: number;
	/**
	 * Maximum number of lines that multiline texts in edit mode can grow to.<br/>
	 *
	 *  @public
	 */
	textMaxLines: number;
	/**
	 * Maximum number of characters from the beginning of the text field that are shown initially.<br/>
	 *
	 *  @public
	 */
	textMaxCharactersDisplay: number;
	/**
	 * Defines how the full text will be displayed.<br/>
	 *
	 * Allowed values are "InPlace" and "Popover"
	 *
	 *  @public
	 */
	textExpandBehaviorDisplay: "InPlace" | "Popover";
	/**
	 * Defines the maximum number of characters for the multiline text value.<br/>
	 *
	 * If a multiline text exceeds the maximum number of allowed characters, the counter below the input field displays the exact number.
	 *
	 *  @public
	 */
	textMaxLength: number;
	/**
	 * Defines if the date part of a date time with timezone field should be shown. <br/>
	 *
	 * The dateTimeOffset field must have a timezone annotation.
	 *
	 * The default value is true.
	 *
	 *  @public
	 */
	showDate: boolean;
	/**
	 * Defines if the time part of a date time with timezone field should be shown. <br/>
	 *
	 * The dateTimeOffset field must have a timezone annotation.
	 *
	 * The default value is true.
	 *
	 *  @public
	 */
	showTime: boolean;
	/**
	 * Defines if the timezone part of a date time with timezone field should be shown. <br/>
	 *
	 * The dateTimeOffset field must have a timezone annotation.
	 *
	 * The default value is true.
	 *
	 *  @public
	 */
	showTimezone: boolean;
};

/**
 * Returns the first visible control in the FieldWrapper.
 *
 * @param oControl FieldWrapper
 * @returns The first visible control
 */
function getControlInFieldWrapper(oControl: Control): Control | undefined {
	if (oControl.isA("sap.fe.macros.controls.FieldWrapper")) {
		const oFieldWrapper = oControl as EnhanceWithUI5<FieldWrapper>;
		const aControls = oFieldWrapper.getEditMode() === "Display" ? [oFieldWrapper.getContentDisplay()] : oFieldWrapper.getContentEdit();
		if (aControls.length >= 1) {
			return aControls.length ? aControls[0] : undefined;
		}
	} else {
		return oControl;
	}
	return undefined;
}

/**
 * Building block for creating a field based on the metadata provided by OData V4.
 * <br>
 * Usually, a DataField or DataPoint annotation is expected, but the field can also be used to display a property from the entity type.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Field id="MyField" metaPath="MyProperty" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.Field
 * @public
 */
@defineUI5Class("sap.fe.macros.field.FieldAPI")
class FieldAPI extends MacroAPI {
	/**
	 * An expression that allows you to control the editable state of the field.
	 *
	 * If you do not set any expression, SAP Fiori elements hooks into the standard lifecycle to determine if the page is currently editable.
	 * Please note that you cannot set a field to editable if it has been defined in the annotation as not editable.
	 *
	 * @private
	 * @deprecated
	 */
	@property({ type: "boolean" })
	editable!: boolean;

	/**
	 * An expression that allows you to control the read-only state of the field.
	 *
	 * If you do not set any expression, SAP Fiori elements hooks into the standard lifecycle to determine the current state.
	 *
	 * @public
	 */
	@property({ type: "boolean" })
	readOnly!: boolean;

	/**
	 * The identifier of the Field control.
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@property({
		type: "string",
		expectedAnnotations: [],
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty", "Property"]
	})
	metaPath!: string;

	/**
	 * An event containing details is triggered when the value of the field is changed.
	 *
	 * @public
	 */
	@event()
	change!: Function;

	@association({ type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" })
	ariaLabelledBy!: Control;

	@property({ type: "boolean" })
	required!: boolean;

	/**
	 * A set of options that can be configured.
	 *
	 * @public
	 */
	@property({ type: "sap.fe.macros.FieldFormatOptions" })
	formatOptions!: FieldFormatOptions;

	/**
	 * Option to add semantic objects to a field.
	 * Valid options are either a single semantic object, a stringified array of semantic objects
	 * or a single binding expression returning either a single semantic object or an array of semantic objects
	 *
	 * @public
	 */
	@property({ type: "string" })
	semanticObject!: string;

	@property({ type: "boolean" })
	collaborationEnabled!: boolean;

	@property({ type: "boolean" })
	visible!: boolean;

	@xmlEventHandler()
	handleChange(oEvent: UI5Event) {
		(this as any).fireChange({ value: this.getValue(), isValid: oEvent.getParameter("valid") });
	}

	onBeforeRendering() {
		const oContent = this.content;
		if (oContent && oContent.isA<Button>(["sap.m.Button"]) && oContent.addAriaLabelledBy) {
			const aAriaLabelledBy = (this as any).getAriaLabelledBy();

			for (let i = 0; i < aAriaLabelledBy.length; i++) {
				const sId = aAriaLabelledBy[i];
				const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
				if (aAriaLabelledBys.indexOf(sId) === -1) {
					oContent.addAriaLabelledBy(sId);
				}
			}
		}
	}

	enhanceAccessibilityState(_oElement: object, mAriaProps: object): object {
		const oParent = this.getParent();

		if (oParent && (oParent as any).enhanceAccessibilityState) {
			// use FieldWrapper as control, but aria properties of rendered inner control.
			(oParent as any).enhanceAccessibilityState(this, mAriaProps);
		}

		return mAriaProps;
	}

	getAccessibilityInfo(): Object {
		const oContent = this.content;
		return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
	}

	/**
	 * Returns the DOMNode ID to be used for the "labelFor" attribute.
	 *
	 * We forward the call of this method to the content control.
	 *
	 * @returns ID to be used for the <code>labelFor</code>
	 */
	getIdForLabel(): string {
		const oContent = this.content;
		return oContent.getIdForLabel();
	}

	/**
	 * Retrieves the current value of the field.
	 *
	 * @public
	 * @returns The current value of the field
	 */
	getValue(): boolean | string {
		let oControl = getControlInFieldWrapper(this.content);
		if (this.collaborationEnabled && oControl?.isA("sap.m.HBox")) {
			oControl = (oControl as HBox).getItems()[0];
		}
		if (oControl?.isA("sap.m.CheckBox")) {
			return (oControl as CheckBox).getSelected();
		} else if (oControl?.isA("sap.m.InputBase")) {
			return (oControl as InputBase).getValue();
		} else if (oControl?.isA("sap.ui.mdc.Field")) {
			return (oControl as any).getValue(); // FieldWrapper
		} else {
			throw "getting value not yet implemented for this field type";
		}
	}

	/**
	 * Adds a message to the field.
	 *
	 * @param [parameters] The parameters to create message
	 * @param parameters.type Type of the message
	 * @param parameters.message Message text
	 * @param parameters.description Message description
	 * @param parameters.persistent True if the message is persistent
	 * @returns The id of the message
	 * @public
	 */
	addMessage(parameters: { type?: MessageType; message?: string; description?: string; persistent?: boolean }) {
		const msgManager = this.getMessageManager();
		const oControl = getControlInFieldWrapper(this.content);

		let path; //target for oMessage
		if (oControl?.isA("sap.m.CheckBox")) {
			path = (oControl as CheckBox).getBinding("selected")?.getResolvedPath();
		} else if (oControl?.isA("sap.m.InputBase")) {
			path = (oControl as InputBase).getBinding("value")?.getResolvedPath();
		} else if (oControl?.isA("sap.ui.mdc.Field")) {
			path = (oControl as any).getBinding("value").getResolvedPath();
		}

		const oMessage = new Message({
			target: path,
			type: parameters.type,
			message: parameters.message,
			processor: oControl?.getModel(),
			description: parameters.description,
			persistent: parameters.persistent
		});

		msgManager.addMessages(oMessage);
		return oMessage.getId();
	}

	/**
	 * Removes a message from the field.
	 *
	 * @param id The id of the message
	 * @public
	 */
	removeMessage(id: string) {
		const msgManager = this.getMessageManager();
		const arr = msgManager.getMessageModel().getData();
		const result = arr.find((e: any) => e.id === id);
		if (result) {
			msgManager.removeMessages(result);
		}
	}

	getMessageManager() {
		return sap.ui.getCore().getMessageManager();
	}
}

export default FieldAPI;
