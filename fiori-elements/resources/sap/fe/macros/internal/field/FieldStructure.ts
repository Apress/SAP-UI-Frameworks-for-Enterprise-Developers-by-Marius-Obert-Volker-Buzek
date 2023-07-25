import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import EditMode from "sap/ui/mdc/enum/EditMode";
import InternalFieldBlock from "../InternalField.block";
import DisplayStyle from "./DisplayStyle";
import EditStyle from "./EditStyle";

function getTemplateWithFieldApi(internalField: InternalFieldBlock, template: string) {
	let id;

	if (internalField.formatOptions.fieldMode === "nowrapper" && internalField.editMode === EditMode.Display) {
		return template;
	}

	if (internalField._apiId) {
		id = internalField._apiId;
	} else if (internalField.idPrefix) {
		id = generate([internalField.idPrefix, "Field"]);
	} else {
		id = undefined;
	}

	let changeHandler = "";
	if (internalField.onChange !== null && internalField.onChange !== "null" && internalField.onChange !== undefined) {
		changeHandler = xml`change="${internalField.onChange}"`;
	}
	return xml`
			<macroField:FieldAPI
				xmlns:macroField="sap.fe.macros.field"
				${changeHandler}
				id="${id}"
				required="${internalField.requiredExpression}"
				editable="${internalField.editableExpression}"
				collaborationEnabled="${internalField.collaborationEnabled}"
				visible="${internalField.visible}"
			>
				${template}
			</macroField:FieldAPI>
		`;
}

/**
 * Helps to calculate the content edit functionality / templating.
 *
 * @param internalField Reference to the current internal field instance
 * @returns An XML-based string with the definition of the field control
 */
function getContentEdit(internalField: InternalFieldBlock) {
	let contentEdit;

	if (internalField.editMode !== EditMode.Display && !!internalField.editStyle) {
		const editStyleTemplate = EditStyle.getTemplate(internalField);
		let contentInnerEdit;
		if (internalField.collaborationEnabled ?? false) {
			contentInnerEdit = xml`<HBox xmlns="sap.m" width="100%">
            ${editStyleTemplate}
            <core:Fragment fragmentName="sap.fe.macros.internal.CollaborationAvatar" type="XML" />
        </HBox>`;
		} else {
			contentInnerEdit = editStyleTemplate;
		}

		contentEdit = xml`${contentInnerEdit}`;
	}
	return contentEdit || "";
}

/**
 * Create the fieldWrapper control for use cases with display and edit styles.
 *
 * @param internalField Reference to the current internal field instance
 * @returns An XML-based string with the definition of the field control
 */
function createFieldWrapper(internalField: InternalFieldBlock) {
	let fieldWrapperID;
	if (internalField._flexId) {
		fieldWrapperID = internalField._flexId;
	} else if (internalField.idPrefix) {
		fieldWrapperID = generate([internalField.idPrefix, "Field-content"]);
	} else {
		fieldWrapperID = undefined;
	}

	// compute the display part and the edit part for the fieldwrapper control
	const contentDisplay = DisplayStyle.getTemplate(internalField);
	// content edit part needs to be wrapped further with an hbox in case of collaboration mode
	// that´s why we need to call this special helper here which finally calls the editStyle.getTemplate
	const contentEdit = getContentEdit(internalField);
	return xml`<controls:FieldWrapper
		xmlns:controls="sap.fe.macros.controls"
		id="${fieldWrapperID}"
		editMode="${internalField.editMode}"
		visible="${internalField.visible}"
		width="100%"
		textAlign="${internalField.textAlign}"
		class="${internalField.class}"
		>

		<controls:contentDisplay>
			${contentDisplay}
		</controls:contentDisplay>
		<controls:contentEdit>
			${contentEdit}
		</controls:contentEdit>

	</controls:FieldWrapper>`;
}

/**
 * Helps to calculate the field structure wrapper.
 *
 * @param internalField Reference to the current internal field instance
 * @returns An XML-based string with the definition of the field control
 */
function getFieldStructureTemplate(internalField: InternalFieldBlock) {
	//compute the field in case of mentioned display styles
	if (
		internalField.displayStyle === "Avatar" ||
		internalField.displayStyle === "Contact" ||
		internalField.displayStyle === "Button" ||
		internalField.displayStyle === "File"
	) {
		// check for special handling in case a file type is used with the collaboration mode
		// (renders an avatar directly)
		if (
			internalField.displayStyle === "File" &&
			(internalField.collaborationEnabled ?? false) &&
			internalField.editMode !== EditMode.Display
		) {
			const box = xml`
				<HBox xmlns="sap.m" width="100%">
				<VBox width="100%">
					${DisplayStyle.getFile(internalField)}
				</VBox>
				<core:Fragment fragmentName="sap.fe.macros.internal.CollaborationAvatar" type="XML" />
			</HBox>`;
			return getTemplateWithFieldApi(internalField, box);
		} else {
			//for all other cases render the displayStyles with a field api wrapper
			return getTemplateWithFieldApi(internalField, DisplayStyle.getTemplate(internalField));
		}
	} else if (internalField.formatOptions.fieldMode === "nowrapper" && internalField.editMode === EditMode.Display) {
		//renders a display based building block (e.g. a button) that has no field api wrapper around it.
		return DisplayStyle.getTemplate(internalField);
	} else {
		//for all other cases create a field wrapper
		const fieldWrapper = createFieldWrapper(internalField);
		return getTemplateWithFieldApi(internalField, fieldWrapper);
	}
}

export default getFieldStructureTemplate;
