import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import _TextArea from "sap/m/TextArea";
import { ValueState } from "sap/ui/core/library";

/**
 * Extension of the TextArea control to add a check for the maximum length when setting the value.
 *
 * @extends sap.m.TextArea
 * @public
 */
@defineUI5Class("sap.fe.macros.field.TextAreaEx")
export default class TextAreaEx extends _TextArea {
	/**
	 * Fires live change event.
	 *
	 * @param {object} [parameters] Parameters to pass along with the event
	 * @param parameters.value
	 * @returns Reference to `this` in order to allow method chaining
	 */
	fireLiveChange(parameters?: { value?: string }): this {
		super.fireLiveChange(parameters);
		this._validateTextLength(parameters?.value);
		return this;
	}

	/**
	 * Sets the value for the text area.
	 *
	 * @param {string} value New value for the property `value`
	 * @returns Reference to `this` in order to allow method chaining
	 * @private
	 */
	setValue(value: string) {
		super.setValue(value);
		this._validateTextLength(value);
		return this;
	}

	/**
	 * Sets an error message for the value state if the maximum length is specified and the new value exceeds this maximum length.
	 *
	 * @param {string} [value] New value for property `value`
	 * @private
	 */
	_validateTextLength(value?: string) {
		const maxLength = this.getMaxLength();
		if (!maxLength || value === undefined) {
			return;
		}
		if (value.length > maxLength) {
			const valueStateText = getResourceModel(this).getText("M_FIELD_TEXTAREA_TEXT_TOO_LONG");
			this.setValueState(ValueState.Error);
			this.setValueStateText(valueStateText);
		} else {
			this.setValueState(ValueState.None);
		}
	}
}
