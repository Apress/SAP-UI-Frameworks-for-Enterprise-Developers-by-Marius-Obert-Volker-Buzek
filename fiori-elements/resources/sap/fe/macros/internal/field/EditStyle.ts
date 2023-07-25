import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import InternalFieldBlock from "../InternalField.block";

//This is not yet a "real" building block, but rather a wrapper for the later on yet to be defined solution.
const EditStyle = {
	/**
	 * Generates the Contact template.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getCheckBoxTemplate(internalField: InternalFieldBlock) {
		return xml`
		    <CheckBox
                xmlns="sap.m"        
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		        macrodata:sourcePath="${internalField.dataSourcePath}"
				xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
		        core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				unittest:id="MacroInput"
		        id="${internalField.editStyleId}"
		        selected="${internalField.valueBindingExpression}"
		        editable="${internalField.editableExpression}"
		        enabled="${internalField.enabledExpression}"
		        select="FieldRuntime.handleChange($controller, $event)"
		        fieldGroupIds="${internalField.fieldGroupIds}"
		        validateFieldGroup="FieldRuntime.onValidateFieldGroup($controller, $event)"
		        ariaLabelledBy="${internalField.ariaLabelledBy}"
	    />
        `;
	},

	/**
	 * Entry point for further templating processings.
	 *
	 * @param internalField Reference to the current internal field instance
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate: (internalField: InternalFieldBlock) => {
		let innerFieldContent;

		switch (internalField.editStyle) {
			case "CheckBox":
				innerFieldContent = EditStyle.getCheckBoxTemplate(internalField);
				break;
			default:
				innerFieldContent = xml`<core:Fragment
			fragmentName="sap.fe.macros.internal.field.editStyle.${internalField.editStyle}"
			type="XML"
		/>`;
		}

		return innerFieldContent;
	}
};

export default EditStyle;
