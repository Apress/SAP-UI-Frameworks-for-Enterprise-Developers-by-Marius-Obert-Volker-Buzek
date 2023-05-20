import type { ServiceObject } from "@sap-ux/vocabularies-types";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAggregation, blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import type Control from "sap/ui/core/Control";
import type Context from "sap/ui/model/odata/v4/Context";

/**
 * Building block used to create a form element based on the metadata provided by OData V4.
 *
 * @public
 * @since 1.90.0
 */
@defineBuildingBlock({
	name: "FormElement",
	publicNamespace: "sap.fe.macros"
})
export default class FormElementBlock extends BuildingBlockBase {
	/**
	 * The identifier of the FormElement building block.
	 *
	 * @public
	 */
	@blockAttribute({ type: "string", isPublic: true, required: true })
	id!: string;

	/**
	 * Defines the path of the context used in the current page or block.
	 * This setting is defined by the framework.
	 *
	 * @public
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true,
		required: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "Singleton", "EntityType"]
	})
	contextPath!: Context;

	/**
	 * Defines the relative path of the property in the metamodel, based on the current contextPath.
	 *
	 * @public
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true,
		required: true,
		expectedTypes: ["Property"],
		expectedAnnotationTypes: [
			"com.sap.vocabularies.UI.v1.DataField",
			"com.sap.vocabularies.UI.v1.DataFieldWithUrl",
			"com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
			"com.sap.vocabularies.UI.v1.DataFieldForAction",
			"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation",
			"com.sap.vocabularies.UI.v1.DataFieldWithAction",
			"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation",
			"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath",
			"com.sap.vocabularies.UI.v1.DataPointType"
		]
	})
	metaPath!: Context;

	/**
	 * Label shown for the field. If not set, the label from the annotations will be shown.
	 *
	 * @public
	 */
	@blockAttribute({ type: "string", isPublic: true })
	label?: string;

	/**
	 * If set to false, the FormElement is not rendered.
	 *
	 * @public
	 */
	@blockAttribute({ type: "boolean", isPublic: true })
	visible?: boolean;

	@blockAttribute({ type: "string", isPublic: true })
	key?: string;

	/**
	 * Optional aggregation of controls that should be displayed inside the FormElement.
	 * If not set, a default Field building block will be rendered
	 *
	 * @public
	 */
	@blockAggregation({ type: "sap.ui.core.Control", slot: "fields", isPublic: true, isDefault: true })
	fields?: Control[];

	constructor(props: PropertiesOf<FormElementBlock>, configuration: any, mSettings: any) {
		super(props, configuration, mSettings);
		const oContextObjectPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
		if (this.label === undefined) {
			this.label = (oContextObjectPath.targetObject as ServiceObject).annotations.Common?.Label?.toString() ?? "";
		}
	}

	getFields() {
		if (this.fields) {
			return xml`<slot name="fields" />`;
		} else {
			return xml`<macros:Field
						metaPath="${this.metaPath}"
						contextPath="${this.contextPath}"
						id="${this.createId("FormElementField")}" />`;
		}
	}

	getTemplate() {
		return xml`<f:FormElement xmlns:f="sap.ui.layout.form" id="${this.id}"
			key="${this.key}"
			label="${this.label}"
			visible="${this.visible}">
			<f:fields>
				${this.getFields()}
			</f:fields>
		</f:FormElement>`;
	}
}
