/**
 * Macro for creating a Contact based on provided OData v4 metadata.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Contact
 *   id="someID"
 *   contact="{contact>}"
 *   contextPath="{contextPath>}"
 * /&gt;
 * </pre>
 *
 * @private
 * @experimental
 */
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { convertMetaModelContext, getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { getExpressionFromAnnotation } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { getRelativePaths } from "sap/fe/core/templating/DataModelPathHelper";
import Context from "sap/ui/model/odata/v4/Context";

@defineBuildingBlock({
	name: "Contact",
	namespace: "sap.fe.macros",
	designtime: "sap/fe/macros/Contact.designtime"
})
export default class ContactBlock extends BuildingBlockBase {
	/**
	 * Prefix added to the generated ID of the field
	 */
	@blockAttribute({
		type: "string"
	})
	public idPrefix?: string;

	@blockAttribute({
		type: "string"
	})
	public _flexId?: string; //needs to be added in v2, was there "implicitly" in v1

	/**
	 * Metadata path to the Contact
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		expectedTypes: ["com.sap.vocabularies.Communication.v1.ContactType"],
		required: true
	})
	public metaPath!: Context;

	@blockAttribute({
		type: "sap.ui.model.Context",
		expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	public contextPath?: Context;

	/**
	 * Property added to associate the label and the contact
	 */
	@blockAttribute({
		type: "string"
	})
	public ariaLabelledBy?: string;

	/**
	 * Boolean visible property
	 */
	@blockAttribute({
		type: "boolean"
	})
	public visible?: boolean;

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		let id;
		if (this._flexId) {
			//in case a flex id is given, take this one
			id = this._flexId;
		} else {
			//alternatively check for idPrefix and generate an appropriate id
			id = this.idPrefix ? generate([this.idPrefix, "Field-content"]) : undefined;
		}

		const convertedContact = convertMetaModelContext(this.metaPath);
		const myDataModel = getInvolvedDataModelObjects(this.metaPath, this.contextPath);

		const value = getExpressionFromAnnotation(convertedContact.fn, getRelativePaths(myDataModel));
		const delegateConfiguration = {
			name: "sap/fe/macros/contact/ContactDelegate",
			payload: {
				contact: this.metaPath.getPath()
			}
		};

		return xml`<mdc:Field
		xmlns:mdc="sap.ui.mdc"
		delegate="{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate'}"
		${this.attr("id", id)}
		editMode="Display"
		width="100%"
		${this.attr("visible", this.visible)}
		${this.attr("value", value)}
		${this.attr("ariaLabelledBy", this.ariaLabelledBy)}
	>
		<mdc:fieldInfo>
			<mdc:Link
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				enablePersonalization="false"
				${this.attr("delegate", JSON.stringify(delegateConfiguration))}
			/>
		</mdc:fieldInfo>
	</mdc:Field>
			`;
	}
}
