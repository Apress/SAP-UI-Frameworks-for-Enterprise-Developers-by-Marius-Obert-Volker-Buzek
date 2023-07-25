import type { Property, PropertyAnnotationValue } from "@sap-ux/vocabularies-types";
import type { PathAnnotationExpression, PropertyPath } from "@sap-ux/vocabularies-types/Edm";
import type { DataField } from "@sap-ux/vocabularies-types/vocabularies/UI";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { UI } from "sap/fe/core/converters/helpers/BindingHelper";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	getExpressionFromAnnotation,
	ifElse,
	isConstant,
	not,
	or
} from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import * as ID from "sap/fe/core/helpers/StableIdHelper";
import { isMultipleNavigationProperty, isPathAnnotationExpression, isPropertyPathExpression } from "sap/fe/core/helpers/TypeGuards";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import {
	enhanceDataModelPath,
	getContextRelativeTargetObjectPath,
	getRelativePaths,
	isPathDeletable,
	isPathInsertable
} from "sap/fe/core/templating/DataModelPathHelper";
import * as PropertyFormatters from "sap/fe/core/templating/PropertyFormatters";
import type { DisplayMode, MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import { getDisplayMode } from "sap/fe/core/templating/UIFormatters";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import { getValueBinding, getVisibleExpression } from "sap/fe/macros/field/FieldTemplating";
import * as ValueHelpTemplating from "sap/fe/macros/internal/valuehelp/ValueHelpTemplating";
import type EditMode from "sap/ui/mdc/enum/EditMode";
import type Context from "sap/ui/model/odata/v4/Context";

type MultiInputSettings = {
	text: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	collectionBindingDisplay: CompiledBindingToolkitExpression;
	collectionBindingEdit: CompiledBindingToolkitExpression;
	key: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
};

type MultiValueFieldFormatOptions = Partial<{
	showEmptyIndicator?: boolean;
	displayOnly?: boolean | string;
	displayMode?: string;
	measureDisplayMode?: string;
	isAnalytics?: boolean;
}>;

type MultiValueFieldPathStructure = {
	collectionPath: string;
	itemDataModelObjectPath: DataModelObjectPath;
};

/**
 * Building block for creating a MultiValueField based on the metadata provided by OData V4.
 * <br>
 * Usually, a DataField annotation is expected
 *
 * Usage example:
 * <pre>
 * <internalMacro:MultiValueField
 *   idPrefix="SomePrefix"
 *   contextPath="{entitySet>}"
 *   metaPath="{dataField>}"
 * />
 * </pre>
 *
 * @hideconstructor
 * @private
 * @experimental
 * @since 1.94.0
 */
@defineBuildingBlock({
	name: "MultiValueField",
	namespace: "sap.fe.macros.internal"
})
export default class MultiValueFieldBlock extends BuildingBlockBase {
	/**
	 * Prefix added to the generated ID of the field
	 */
	@blockAttribute({
		type: "string"
	})
	public idPrefix?: string;

	/**
	 * Prefix added to the generated ID of the value help used for the field
	 */
	@blockAttribute({
		type: "string"
	})
	public vhIdPrefix = "FieldValueHelp";

	/**
	 * Metadata path to the MultiValueField.
	 * This property is usually a metadataContext pointing to a DataField having a Value that uses a 1:n navigation
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		expectedTypes: ["com.sap.vocabularies.UI.v1.DataField"]
	})
	public metaPath!: Context;

	/**
	 * Mandatory context to the MultiValueField
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	public contextPath!: Context;

	/**
	 * Property added to associate the label with the MultiValueField
	 */
	@blockAttribute({
		type: "string"
	})
	public ariaLabelledBy?: string;

	@blockAttribute({
		type: "string"
	})
	private key?: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;

	private text?: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;

	/**
	 * Edit Mode of the field.
	 * If the editMode is undefined then we compute it based on the metadata
	 * Otherwise we use the value provided here.
	 */
	private editMode!: EditMode | CompiledBindingToolkitExpression;

	/**
	 * The display mode added to the collection field
	 */
	private displayMode!: DisplayMode;

	/**
	 * The CompiledBindingToolkitExpression that is calculated internally
	 */
	private collection!: CompiledBindingToolkitExpression;

	/**
	 * The format options
	 */
	@blockAttribute({
		type: "object",
		validate: function (formatOptionsInput: MultiValueFieldFormatOptions) {
			if (
				formatOptionsInput.displayMode &&
				!["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)
			) {
				throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
			}
			return formatOptionsInput;
		}
	})
	public formatOptions: MultiValueFieldFormatOptions = {};

	private visible: CompiledBindingToolkitExpression;

	/**
	 * Function to get the correct settings for the multi input.
	 *
	 * @param propertyDataModelObjectPath The corresponding datamodelobjectpath.
	 * @param formatOptions The format options to calculate the result
	 * @returns MultiInputSettings
	 */
	private static _getMultiInputSettings(
		propertyDataModelObjectPath: DataModelObjectPath,
		formatOptions: MultiValueFieldFormatOptions
	): MultiInputSettings {
		const { collectionPath, itemDataModelObjectPath } = MultiValueFieldBlock._getPathStructure(propertyDataModelObjectPath);
		const collectionBindingDisplay = `{path:'${collectionPath}', templateShareable: false}`;
		const collectionBindingEdit = `{path:'${collectionPath}', parameters: {$$ownRequest : true}, templateShareable: false}`;

		const propertyPathOrProperty = propertyDataModelObjectPath.targetObject as PropertyPath | Property;
		const propertyDefinition: Property = isPropertyPathExpression(propertyPathOrProperty)
			? propertyPathOrProperty.$target
			: propertyPathOrProperty;
		const commonText = propertyDefinition.annotations.Common?.Text;
		const relativeLocation = getRelativePaths(propertyDataModelObjectPath);

		const textExpression = commonText
			? compileExpression(
					getExpressionFromAnnotation(
						commonText as unknown as PropertyAnnotationValue<Property>,
						relativeLocation
					) as BindingToolkitExpression<string>
			  )
			: getValueBinding(itemDataModelObjectPath, formatOptions, true);
		return {
			text: textExpression,
			collectionBindingDisplay: collectionBindingDisplay,
			collectionBindingEdit: collectionBindingEdit,
			key: getValueBinding(itemDataModelObjectPath, formatOptions, true)
		};
	}

	// Process the dataModelPath to find the collection and the relative DataModelPath for the item.
	private static _getPathStructure(dataModelObjectPath: DataModelObjectPath): MultiValueFieldPathStructure {
		let firstCollectionPath = "";
		const currentEntitySet = dataModelObjectPath.contextLocation?.targetEntitySet
			? dataModelObjectPath.contextLocation.targetEntitySet
			: dataModelObjectPath.startingEntitySet;
		const navigatedPaths: string[] = [];
		const contextNavsForItem = dataModelObjectPath.contextLocation?.navigationProperties || [];
		for (const navProp of dataModelObjectPath.navigationProperties) {
			if (
				dataModelObjectPath.contextLocation === undefined ||
				!dataModelObjectPath.contextLocation.navigationProperties.some(
					(contextNavProp) => contextNavProp.fullyQualifiedName === navProp.fullyQualifiedName
				)
			) {
				// in case of relative entitySetPath we don't consider navigationPath that are already in the context
				navigatedPaths.push(navProp.name);
				contextNavsForItem.push(navProp);
			}
			if (currentEntitySet.navigationPropertyBinding.hasOwnProperty(navProp.name)) {
				if (isMultipleNavigationProperty(navProp)) {
					break;
				}
			}
		}
		firstCollectionPath = `${navigatedPaths.join("/")}`;
		const itemDataModelObjectPath = Object.assign({}, dataModelObjectPath);
		if (itemDataModelObjectPath.contextLocation) {
			itemDataModelObjectPath.contextLocation.navigationProperties = contextNavsForItem;
		}

		return { collectionPath: firstCollectionPath, itemDataModelObjectPath: itemDataModelObjectPath };
	}

	constructor(props: PropertiesOf<MultiValueFieldBlock>) {
		super(props);
		let dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.metaPath, this.contextPath);
		const dataFieldConverted = MetaModelConverter.convertMetaModelContext(this.metaPath) as DataField;
		let extraPath;
		if (isPathAnnotationExpression(dataFieldConverted.Value)) {
			extraPath = dataFieldConverted.Value.path;
		}

		this.visible = getVisibleExpression(dataModelPath, this.formatOptions);
		if (extraPath && extraPath.length > 0) {
			dataModelPath = enhanceDataModelPath(dataModelPath, extraPath);
		}
		const insertable = isPathInsertable(dataModelPath);
		const deleteNavigationRestriction = isPathDeletable(dataModelPath, {
			ignoreTargetCollection: true,
			authorizeUnresolvable: true
		});
		const deletePath = isPathDeletable(dataModelPath);
		// deletable:
		//		if restrictions come from Navigation we apply it
		//		otherwise we apply restrictions defined on target collection only if it's a constant
		//      otherwise it's true!
		const deletable = ifElse(
			deleteNavigationRestriction._type === "Unresolvable",
			or(not(isConstant(deletePath)), deletePath),
			deletePath
		);
		this.editMode =
			this.formatOptions.displayOnly === "true"
				? "Display"
				: compileExpression(ifElse(and(insertable, deletable, UI.IsEditable), constant("Editable"), constant("Display")));
		this.displayMode = getDisplayMode(dataModelPath);

		const multiInputSettings = MultiValueFieldBlock._getMultiInputSettings(dataModelPath, this.formatOptions);
		this.text = multiInputSettings.text;
		this.collection =
			this.editMode === "Display" ? multiInputSettings.collectionBindingDisplay : multiInputSettings.collectionBindingEdit;
		this.key = multiInputSettings.key;
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		//prepare settings for further processing
		const internalDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.metaPath, this.contextPath);
		const internalDataFieldConverted = internalDataModelPath.targetObject as DataField;
		const enhancedDataModelPath = enhanceDataModelPath(
			internalDataModelPath,
			(internalDataFieldConverted.Value as PathAnnotationExpression<string>).path
		); // PathAnnotationExpression was checked in the templating
		//calculate the id settings for this block
		const id = this.idPrefix ? ID.generate([this.idPrefix, "MultiValueField"]) : undefined;
		//create a new binding context for the value help
		const valueHelpProperty = FieldHelper.valueHelpProperty(this.metaPath);
		const valueHelpPropertyContext = this.metaPath.getModel().createBindingContext(valueHelpProperty, this.metaPath);
		//calculate fieldHelp
		const fieldHelp = ValueHelpTemplating.generateID(
			undefined,
			this.vhIdPrefix,
			PropertyFormatters.getRelativePropertyPath(valueHelpPropertyContext as unknown as MetaModelContext, {
				context: this.contextPath
			}),
			getContextRelativeTargetObjectPath(enhancedDataModelPath) ?? ""
		);
		//compute the correct label
		const label = FieldHelper.computeLabelText(internalDataFieldConverted.Value as PathAnnotationExpression<string>, {
			context: this.metaPath
		}) as string;

		return xml`
		<mdc:MultiValueField
				xmlns:mdc="sap.ui.mdc"
				delegate="{name: 'sap/fe/macros/multiValueField/MultiValueFieldDelegate'}"
				id="${id}"
				items="${this.collection}"
				display="${this.displayMode}"
				width="100%"
				editMode="${this.editMode}"
				fieldHelp="${fieldHelp}"
				ariaLabelledBy = "${this.ariaLabelledBy}"
				showEmptyIndicator = "${this.formatOptions.showEmptyIndicator}"
				label = "${label}"
		>
		<mdcField:MultiValueFieldItem xmlns:mdcField="sap.ui.mdc.field" key="${this.key}" description="${this.text}" />
		</mdc:MultiValueField>`;
	}
}
