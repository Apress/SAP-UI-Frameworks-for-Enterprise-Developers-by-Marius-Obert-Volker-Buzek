import type { Action, EntitySet, PathAnnotationExpression, Property } from "@sap-ux/vocabularies-types";
import type { DataField } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import AppComponent from "sap/fe/core/AppComponent";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { TemplateProcessorSettings, xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { Entity } from "sap/fe/core/converters/helpers/BindingHelper";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import * as CollaborationFormatters from "sap/fe/core/formatters/CollaborationFormatter";
import valueFormatters from "sap/fe/core/formatters/ValueFormatter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	equal,
	fn,
	formatResult,
	formatWithTypeInformation,
	getExpressionFromAnnotation,
	ifElse,
	not,
	pathInModel,
	wrapBindingExpression
} from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf, StrictPropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import {
	getRequiredPropertiesFromInsertRestrictions,
	getRequiredPropertiesFromUpdateRestrictions
} from "sap/fe/core/helpers/MetaModelFunction";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { isProperty } from "sap/fe/core/helpers/TypeGuards";
import {
	DataModelObjectPath,
	enhanceDataModelPath,
	getContextRelativeTargetObjectPath,
	getRelativePaths,
	getTargetObjectPath
} from "sap/fe/core/templating/DataModelPathHelper";
import { PropertyOrPath } from "sap/fe/core/templating/DisplayModeFormatter";
import { isSemanticKey } from "sap/fe/core/templating/PropertyHelper";
import type { DisplayMode } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import * as FieldTemplating from "sap/fe/macros/field/FieldTemplating";
import SituationsIndicatorBlock from "sap/fe/macros/situations/SituationsIndicator.block";
import EditMode from "sap/ui/mdc/enum/EditMode";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import FieldHelper from "../field/FieldHelper";
import getFieldStructureTemplate from "./field/FieldStructure";

type DisplayStyle =
	| "Text"
	| "Avatar"
	| "File"
	| "DataPoint"
	| "Contact"
	| "Button"
	| "Link"
	| "ObjectStatus"
	| "AmountWithCurrency"
	| "SemanticKeyWithDraftIndicator"
	| "ObjectIdentifier"
	| "LabelSemanticKey"
	| "LinkWithQuickView"
	| "ExpandableText";

type EditStyle =
	| "InputWithValueHelp"
	| "TextArea"
	| "File"
	| "DatePicker"
	| "TimePicker"
	| "DateTimePicker"
	| "CheckBox"
	| "InputWithUnit"
	| "Input"
	| "RatingIndicator";

type FieldFormatOptions = Partial<{
	displayMode: DisplayMode;
	fieldMode: string;
	hasDraftIndicator: boolean;
	isAnalytics: boolean;
	/** If true then navigationavailable property will not be used for enablement of IBN button */
	ignoreNavigationAvailable: boolean;
	isCurrencyAligned: boolean;
	measureDisplayMode: string;
	/** Enables the fallback feature for usage the text annotation from the value lists */
	retrieveTextFromValueList: boolean;
	semantickeys: string[];
	/** Preferred control to visualize semantic key properties */
	semanticKeyStyle: string;
	/** If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the text and links */
	showEmptyIndicator: boolean;
	/** If true then sets the given icon instead of text in Action/IBN Button */
	showIconUrl: boolean;
	/** Describe how the alignment works between Table mode (Date and Numeric End alignment) and Form mode (numeric aligned End in edit and Begin in display) */
	textAlignMode: string;
	/** Maximum number of lines for multiline texts in edit mode */
	textLinesEdit: string;
	/** Maximum number of lines that multiline texts in edit mode can grow to */
	textMaxLines: string;
	compactSemanticKey: string;
	fieldGroupDraftIndicatorPropertyPath: string;
	fieldGroupName: string;
	textMaxLength: number;
	/** Maximum number of characters from the beginning of the text field that are shown initially. */
	textMaxCharactersDisplay: number;
	/** Defines how the full text will be displayed - InPlace or Popover */
	textExpandBehaviorDisplay: string;
	dateFormatOptions?: UIFormatters.dateFormatOptions; // showTime here is used for text formatting only
}>;

export type FieldProperties = StrictPropertiesOf<InternalFieldBlock>;

/**
 * Building block for creating a Field based on the metadata provided by OData V4.
 * <br>
 * Usually, a DataField annotation is expected
 *
 * Usage example:
 * <pre>
 * <internalMacro:Field
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
	name: "Field",
	namespace: "sap.fe.macros.internal",
	designtime: "sap/fe/macros/internal/Field.designtime"
})
export default class InternalFieldBlock extends BuildingBlockBase {
	@blockAttribute({
		type: "string"
	})
	public dataSourcePath?: string;

	@blockAttribute({
		type: "string"
	})
	public emptyIndicatorMode?: string;

	@blockAttribute({
		type: "string"
	})
	public _flexId?: string;

	@blockAttribute({
		type: "string"
	})
	public idPrefix?: string;

	@blockAttribute({
		type: "string"
	})
	public _apiId?: string;

	@blockAttribute({
		type: "string"
	})
	public noWrapperId?: string;

	@blockAttribute({
		type: "string"
	})
	public vhIdPrefix: string = "FieldValueHelp";

	/**
	 * Metadata path to the entity set
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	public entitySet!: Context;

	/**
	 * Flag indicating whether action will navigate after execution
	 */
	@blockAttribute({
		type: "boolean"
	})
	public navigateAfterAction: boolean = true;

	/**
	 * Metadata path to the dataField.
	 * This property is usually a metadataContext pointing to a DataField having
	 * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
	 * But it can also be a Property with $kind="Property"
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
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
	public dataField!: Context;

	/**
	 * Edit Mode of the field.
	 *
	 * If the editMode is undefined then we compute it based on the metadata
	 * Otherwise we use the value provided here.
	 */
	@blockAttribute({
		type: "sap.ui.mdc.enum.EditMode"
	})
	public editMode?: EditMode | CompiledBindingToolkitExpression;

	/**
	 * Wrap field
	 */
	@blockAttribute({
		type: "boolean"
	})
	public wrap?: boolean;

	/**
	 * CSS class for margin
	 */
	@blockAttribute({
		type: "string"
	})
	public class?: string;

	/**
	 * Property added to associate the label with the Field
	 */
	@blockAttribute({
		type: "string"
	})
	public ariaLabelledBy?: string;

	@blockAttribute({
		type: "sap.ui.core.TextAlign"
	})
	public textAlign?: string;

	/**
	 * Option to add a semantic object to a field
	 */
	@blockAttribute({
		type: "string",
		required: false
	})
	public semanticObject?: string;

	@blockAttribute({
		type: "string"
	})
	public requiredExpression?: string;

	@blockAttribute({
		type: "boolean"
	})
	public visible?: boolean | CompiledBindingToolkitExpression;

	@blockAttribute({ type: "boolean" })
	showErrorObjectStatus?: boolean | CompiledBindingToolkitExpression;

	@blockAttribute({
		type: "object",
		validate: function (formatOptionsInput: FieldFormatOptions) {
			if (formatOptionsInput.textAlignMode && !["Table", "Form"].includes(formatOptionsInput.textAlignMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.textAlignMode} for textAlignMode does not match`);
			}

			if (
				formatOptionsInput.displayMode &&
				!["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)
			) {
				throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
			}

			if (formatOptionsInput.fieldMode && !["nowrapper", ""].includes(formatOptionsInput.fieldMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.fieldMode} for fieldMode does not match`);
			}

			if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
			}

			if (
				formatOptionsInput.textExpandBehaviorDisplay &&
				!["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)
			) {
				throw new Error(
					`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`
				);
			}

			if (formatOptionsInput.semanticKeyStyle && !["ObjectIdentifier", "Label", ""].includes(formatOptionsInput.semanticKeyStyle)) {
				throw new Error(`Allowed value ${formatOptionsInput.semanticKeyStyle} for semanticKeyStyle does not match`);
			}

			if (typeof formatOptionsInput.isAnalytics === "string") {
				formatOptionsInput.isAnalytics = formatOptionsInput.isAnalytics === "true";
			}

			/*
			Historical default values are currently disabled
			if (!formatOptionsInput.semanticKeyStyle) {
				formatOptionsInput.semanticKeyStyle = "";
			}
			*/

			return formatOptionsInput;
		}
	})
	public formatOptions: FieldFormatOptions = {};

	/**
	 * Metadata path to the entity set.
	 * This is used in inner fragments, so we need to declare it as block attribute context.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	entityType?: Context;

	/**
	 * This is used in inner fragments, so we need to declare it as block attribute.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	annotationPath?: Context;

	/**
	 * This is used in inner fragments, so we need to declare it as block attribute.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	property?: Context;

	/**
	 * This is used in inner fragments, so we need to declare it as block attribute.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	valueHelpProperty?: Context;

	/**
	 * This is used in inner fragments, so we need to declare it as block attribute.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context"
	})
	dataPoint?: Context;

	/**
	 * This is used in inner fragments, so we need to declare it as block attribute.
	 */
	@blockAttribute({
		type: "boolean"
	})
	collaborationEnabled?: boolean;

	/**
	 * This is used in inner fragments, so we need to declare it as block attribute.
	 */
	@blockAttribute({
		type: "string"
	})
	_vhFlexId?: string;

	/**
	 * Event handler for change event
	 */
	@blockEvent()
	onChange?: string;

	// Computed properties

	editableExpression: string | CompiledBindingToolkitExpression;

	enabledExpression: string | CompiledBindingToolkitExpression;

	collaborationHasActivityExpression: string | CompiledBindingToolkitExpression;

	collaborationInitialsExpression: string | CompiledBindingToolkitExpression;

	collaborationColorExpression: string | CompiledBindingToolkitExpression;

	descriptionBindingExpression?: string;

	displayVisible?: string | boolean;

	editModeAsObject?: any;

	editStyle?: EditStyle | null;

	hasQuickView = false;

	navigationAvailable?: boolean | string;

	showTimezone?: boolean;

	text?: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;

	identifierTitle?: CompiledBindingToolkitExpression;

	identifierText?: CompiledBindingToolkitExpression;

	textBindingExpression?: CompiledBindingToolkitExpression;

	unitBindingExpression?: string;

	unitEditable?: string;

	valueBindingExpression?: CompiledBindingToolkitExpression;

	valueAsStringBindingExpression?: CompiledBindingToolkitExpression;

	// (start) Computed properties for Link.fragment.xml

	linkUrl?: CompiledBindingToolkitExpression = undefined;

	linkIsDataFieldWithIntentBasedNavigation: boolean = false;

	linkIsDataFieldWithNavigationPath: boolean = false;

	linkIsDataFieldWithAction: boolean = false;

	linkIsEmailAddress: boolean = false;

	linkIsPhoneNumber: boolean = false;

	linkPress?: CompiledBindingToolkitExpression = undefined;

	// (end) Computed properties for Link.fragment.xml

	iconUrl?: string | CompiledBindingToolkitExpression;

	displayStyle?: DisplayStyle | null;

	hasSituationsIndicator?: boolean;

	avatarVisible?: CompiledBindingToolkitExpression;

	avatarSrc?: CompiledBindingToolkitExpression;

	// (start) Computed properties for File.fragment.xml

	fileRelativePropertyPath?: string;

	fileFilenameExpression?: CompiledBindingToolkitExpression = undefined;

	fileStreamNotEmpty?: CompiledBindingToolkitExpression;

	fileUploadUrl?: CompiledBindingToolkitExpression;

	fileFilenamePath?: CompiledBindingToolkitExpression;

	fileMediaType?: CompiledBindingToolkitExpression;

	fileIsImage?: boolean;

	fileAvatarSrc?: CompiledBindingToolkitExpression;

	fileIconSrc?: CompiledBindingToolkitExpression;

	fileLinkText?: CompiledBindingToolkitExpression;

	fileLinkHref?: CompiledBindingToolkitExpression;

	fileTextVisible?: CompiledBindingToolkitExpression;

	fileAcceptableMediaTypes?: string = undefined;

	fileMaximumSize?: string;

	// (end) Computed properties for File.fragment.xml

	contactVisible?: CompiledBindingToolkitExpression;

	buttonPress?: CompiledBindingToolkitExpression;

	buttonIsBound?: string | boolean;

	buttonOperationAvailable?: string;

	buttonOperationAvailableFormatted?: string;

	fieldGroupIds?: string;

	textAreaPlaceholder?: string;

	/* Display style common properties start */
	hasUnitOrCurrency?: boolean = undefined;

	hasValidAnalyticalCurrencyOrUnit?: CompiledBindingToolkitExpression = undefined;

	textFromValueList?: CompiledBindingToolkitExpression = undefined;
	/* AmountWith currency fragment end */

	/* Edit style common properties start */
	editStyleId?: string;
	/* Edit style common properties end */

	static getOverrides(mControlConfiguration: any, sID: string) {
		const oProps: { [index: string]: any } = {};
		if (mControlConfiguration) {
			const oControlConfig = mControlConfiguration[sID];
			if (oControlConfig) {
				Object.keys(oControlConfig).forEach(function (sConfigKey) {
					oProps[sConfigKey] = oControlConfig[sConfigKey];
				});
			}
		}
		return oProps;
	}

	static getIdentifierTitle(
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath,
		alwaysShowDescriptionAndValue: boolean
	): CompiledBindingToolkitExpression {
		let propertyBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		let targetDisplayMode = fieldFormatOptions?.displayMode;
		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);
		propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		if (commonText === undefined) {
			// there is no property for description
			targetDisplayMode = "Value";
		}
		const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);

		const parametersForFormatter = [];

		parametersForFormatter.push(pathInModel("T_NEW_OBJECT", "sap.fe.i18n"));
		parametersForFormatter.push(pathInModel("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n"));

		if (
			!!(oPropertyDataModelObjectPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftRoot ||
			!!(oPropertyDataModelObjectPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftNode
		) {
			parametersForFormatter.push(Entity.HasDraft);
			parametersForFormatter.push(Entity.IsActive);
		} else {
			parametersForFormatter.push(constant(null));
			parametersForFormatter.push(constant(null));
		}

		switch (targetDisplayMode) {
			case "Value":
				parametersForFormatter.push(propertyBindingExpression);
				parametersForFormatter.push(constant(null));
				break;
			case "Description":
				parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
				parametersForFormatter.push(constant(null));
				break;
			case "ValueDescription":
				parametersForFormatter.push(propertyBindingExpression);
				parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
				break;
			default:
				if (commonText?.annotations?.UI?.TextArrangement) {
					parametersForFormatter.push(
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					);
					parametersForFormatter.push(propertyBindingExpression);
				} else {
					// if DescriptionValue is set by default and not by TextArrangement
					// we show description in ObjectIdentifier Title and value in ObjectIdentifier Text
					parametersForFormatter.push(
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					);
					if (alwaysShowDescriptionAndValue) {
						parametersForFormatter.push(propertyBindingExpression);
					} else {
						parametersForFormatter.push(constant(null));
					}
				}
				break;
		}
		return compileExpression(formatResult(parametersForFormatter as any, valueFormatters.formatIdentifierTitle));
	}

	static getObjectIdentifierText(
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	): CompiledBindingToolkitExpression {
		let propertyBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		const targetDisplayMode = fieldFormatOptions?.displayMode;
		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);

		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		if (commonText === undefined || commonText?.annotations?.UI?.TextArrangement) {
			return undefined;
		}
		propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

		switch (targetDisplayMode) {
			case "ValueDescription":
				const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
				return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
			case "DescriptionValue":
				return compileExpression(formatResult([propertyBindingExpression], valueFormatters.formatToKeepWhitespace));
			default:
				return undefined;
		}
	}

	static setUpDataPointType(oDataField: any) {
		// data point annotations need not have $Type defined, so add it if missing
		if (oDataField?.term === "com.sap.vocabularies.UI.v1.DataPoint") {
			oDataField.$Type = oDataField.$Type || UIAnnotationTypes.DataPointType;
		}
	}

	static setUpVisibleProperties(oFieldProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath) {
		// we do this before enhancing the dataModelPath so that it still points at the DataField
		oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
		oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
	}

	static getContentId(sMacroId: string) {
		return `${sMacroId}-content`;
	}

	static setUpEditableProperties(oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath, oMetaModel: any): void {
		const oPropertyForFieldControl = oDataModelPath?.targetObject?.Value
			? oDataModelPath.targetObject.Value
			: oDataModelPath?.targetObject;
		if (oProps.editMode !== undefined && oProps.editMode !== null) {
			// Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
			oProps.editModeAsObject = oProps.editMode;
		} else {
			const bMeasureReadOnly = oProps.formatOptions.measureDisplayMode
				? oProps.formatOptions.measureDisplayMode === "ReadOnly"
				: false;

			oProps.editModeAsObject = UIFormatters.getEditMode(
				oPropertyForFieldControl,
				oDataModelPath,
				bMeasureReadOnly,
				true,
				oDataField
			);
			oProps.editMode = compileExpression(oProps.editModeAsObject);
		}
		const editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
		const aRequiredPropertiesFromInsertRestrictions = getRequiredPropertiesFromInsertRestrictions(
			oProps.entitySet?.getPath().replaceAll("/$NavigationPropertyBinding/", "/"),
			oMetaModel
		);
		const aRequiredPropertiesFromUpdateRestrictions = getRequiredPropertiesFromUpdateRestrictions(
			oProps.entitySet?.getPath().replaceAll("/$NavigationPropertyBinding/", "/"),
			oMetaModel
		);
		const oRequiredProperties = {
			requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
			requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
		};
		if (ModelHelper.isCollaborationDraftSupported(oMetaModel) && oProps.editMode !== EditMode.Display) {
			oProps.collaborationEnabled = true;
			// Expressions needed for Collaboration Visualization
			const collaborationExpression = UIFormatters.getCollaborationExpression(
				oDataModelPath,
				CollaborationFormatters.hasCollaborationActivity
			);
			oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
			oProps.collaborationInitialsExpression = compileExpression(
				UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials)
			);
			oProps.collaborationColorExpression = compileExpression(
				UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor)
			);
			oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));

			oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
		} else {
			oProps.editableExpression = compileExpression(editableExpression);
		}
		oProps.enabledExpression = UIFormatters.getEnabledExpression(
			oPropertyForFieldControl,
			oDataField,
			false,
			oDataModelPath
		) as CompiledBindingToolkitExpression;
		oProps.requiredExpression = UIFormatters.getRequiredExpression(
			oPropertyForFieldControl,
			oDataField,
			false,
			false,
			oRequiredProperties,
			oDataModelPath
		) as CompiledBindingToolkitExpression;

		if (oProps.idPrefix) {
			oProps.editStyleId = generate([oProps.idPrefix, "Field-edit"]);
		}
	}

	static setUpFormatOptions(oProps: FieldProperties, oDataModelPath: DataModelObjectPath, oControlConfiguration: any, mSettings: any) {
		const oOverrideProps = InternalFieldBlock.getOverrides(oControlConfiguration, oProps.dataField.getPath());

		if (!oProps.formatOptions.displayMode) {
			oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
		}
		oProps.formatOptions.textLinesEdit =
			oOverrideProps.textLinesEdit ||
			(oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit) ||
			oProps.formatOptions.textLinesEdit ||
			4;
		oProps.formatOptions.textMaxLines =
			oOverrideProps.textMaxLines ||
			(oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines) ||
			oProps.formatOptions.textMaxLines;

		// Retrieve text from value list as fallback feature for missing text annotation on the property
		if (mSettings.models.viewData?.getProperty("/retrieveTextFromValueList")) {
			oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(
				oDataModelPath.targetObject,
				oProps.formatOptions
			);
			if (oProps.formatOptions.retrieveTextFromValueList) {
				// Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
				const hasEntityTextArrangement = !!oDataModelPath?.targetEntityType?.annotations?.UI?.TextArrangement;
				oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
			}
		}
		if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
			if (oProps._flexId) {
				oProps.noWrapperId = oProps._flexId;
			} else {
				oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
			}
		}
	}

	static setUpDisplayStyle(oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath): void {
		const oProperty: Property = oDataModelPath.targetObject as Property;
		if (!oDataModelPath.targetObject) {
			oProps.displayStyle = "Text";
			return;
		}

		// TODO: This is used across different display style fragments and might be moved to dedicated functions
		oProps.hasUnitOrCurrency =
			oProperty.annotations?.Measures?.Unit !== undefined || oProperty.annotations?.Measures?.ISOCurrency !== undefined;
		oProps.hasValidAnalyticalCurrencyOrUnit = UIFormatters.hasValidAnalyticalCurrencyOrUnit(oDataModelPath);
		oProps.textFromValueList = wrapBindingExpression(
			compileExpression(
				fn("FieldRuntime.retrieveTextFromValueList", [
					pathInModel(getContextRelativeTargetObjectPath(oDataModelPath)),
					`/${oProperty.fullyQualifiedName}`,
					oProps.formatOptions.displayMode
				])
			) as string,
			false
		);

		if (oProperty.type === "Edm.Stream") {
			// Common
			oProps.displayStyle = "File";
			oProps.fileRelativePropertyPath = getContextRelativeTargetObjectPath(oDataModelPath);
			if (oProperty.annotations.Core?.ContentDisposition?.Filename) {
				const fileNameDataModelPath = enhanceDataModelPath(
					oDataModelPath,
					oProperty.annotations.Core?.ContentDisposition?.Filename as PropertyOrPath<Property>
				);
				// This causes an expression parsing error: compileExpression(pathInModel(getContextRelativeTargetObjectPath(fileNameDataModelPath)));
				oProps.fileFilenameExpression = "{ path: '" + getContextRelativeTargetObjectPath(fileNameDataModelPath) + "' }";
			}
			oProps.fileStreamNotEmpty = compileExpression(
				not(equal(pathInModel(`${oProps.fileRelativePropertyPath}@odata.mediaContentType`), null))
			);

			// FileWrapper
			oProps.fileUploadUrl = FieldTemplating.getValueBinding(oDataModelPath, {});
			oProps.fileFilenamePath = (oProperty.annotations.Core?.ContentDisposition?.Filename as PathAnnotationExpression<string>)?.path;
			oProps.fileMediaType =
				oProperty.annotations.Core?.MediaType &&
				compileExpression(getExpressionFromAnnotation(oProperty.annotations.Core?.MediaType));

			// template:if
			oProps.fileIsImage =
				!!oProperty.annotations.UI?.IsImageURL ||
				!!oProperty.annotations.UI?.IsImage ||
				/image\//i.test(oProperty.annotations.Core?.MediaType?.toString() ?? "");

			// Avatar
			oProps.fileAvatarSrc = FieldTemplating.getValueBinding(oDataModelPath, {});

			// Icon
			oProps.fileIconSrc = FieldHelper.getPathForIconSource(oProps.fileRelativePropertyPath);

			// Link
			oProps.fileLinkText = FieldHelper.getFilenameExpr(
				oProps.fileFilenameExpression,
				"{sap.fe.i18n>M_FIELD_FILEUPLOADER_NOFILENAME_TEXT}"
			);
			oProps.fileLinkHref = FieldHelper.getDownloadUrl(oProps.fileUploadUrl ?? "");

			// Text
			oProps.fileTextVisible = compileExpression(
				equal(pathInModel(`${oProps.fileRelativePropertyPath}@odata.mediaContentType`), null)
			);

			// FileUploader
			if (oProperty.annotations.Core?.AcceptableMediaTypes) {
				const acceptedTypes = Array.from(oProperty.annotations.Core.AcceptableMediaTypes as unknown as string[]).map(
					(type) => `'${type}'`
				);
				oProps.fileAcceptableMediaTypes = `{=odata.collection([${acceptedTypes.join(",")}])}`; // This does not feel right, but follows the logic of AnnotationHelper#value
			}
			oProps.fileMaximumSize = FieldHelper.calculateMBfromByte(oProperty.maxLength);
			return;
		}
		if (oProperty.annotations?.UI?.IsImageURL) {
			oProps.avatarVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
			oProps.avatarSrc = FieldTemplating.getValueBinding(oDataModelPath, {});
			oProps.displayStyle = "Avatar";
			return;
		}

		switch (oDataField.$Type) {
			case UIAnnotationTypes.DataPointType:
				oProps.displayStyle = "DataPoint";
				return;
			case UIAnnotationTypes.DataFieldForAnnotation:
				if (oDataField.Target?.$target?.$Type === UIAnnotationTypes.DataPointType) {
					oProps.displayStyle = "DataPoint";
					return;
				} else if (oDataField.Target?.$target?.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
					oProps.contactVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
					oProps.displayStyle = "Contact";
					return;
				}
				break;
			case UIAnnotationTypes.DataFieldForAction:
				//Qualms: the getObject is a bad practice, but for now it´s fine as an intermediate step to avoid refactoring of the helper in addition
				const dataFieldObject = oProps.dataField.getObject();
				oProps.buttonPress = FieldHelper.getPressEventForDataFieldActionButton(oProps, dataFieldObject);
				oProps.displayStyle = "Button";

				// Gracefully handle non-existing actions
				if (oDataField.ActionTarget === undefined) {
					oProps.buttonIsBound = true;
					oProps.buttonOperationAvailable = "false";
					oProps.buttonOperationAvailableFormatted = "false";
					Log.warning(
						`Warning: The action '${oDataField.Action}' does not exist. The corresponding action button will be disabled.`
					);
					return;
				}

				oProps.buttonIsBound = oDataField.ActionTarget.isBound;
				oProps.buttonOperationAvailable = oDataField.ActionTarget.annotations?.Core?.OperationAvailable;
				oProps.buttonOperationAvailableFormatted = undefined;

				if (oProps.buttonOperationAvailable) {
					const actionTarget = oDataField.ActionTarget as Action;
					const bindingParamName = actionTarget.parameters[0].name;
					//QUALMS, needs to be checked whether this makes sense at that place, might be good in a dedicated helper function
					oProps.buttonOperationAvailableFormatted = compileExpression(
						getExpressionFromAnnotation(oProps.buttonOperationAvailable, [], undefined, (path: string) => {
							if (path.startsWith(bindingParamName)) {
								return path.replace(bindingParamName + "/", "");
							}
							return path;
						})
					);
				}
				return;
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
				oProps.buttonPress = CommonHelper.getPressHandlerForDataFieldForIBN(oProps.dataField.getObject(), undefined, undefined);
				InternalFieldBlock.setUpNavigationAvailable(oProps, oDataField);
				oProps.displayStyle = "Button";
				return;
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
				oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
				oProps.linkIsDataFieldWithIntentBasedNavigation = true;
				oProps.linkPress = CommonHelper.getPressHandlerForDataFieldForIBN(oProps.dataField.getObject());
				oProps.displayStyle = "Link";
				return;
			case UIAnnotationTypes.DataFieldWithNavigationPath:
				oProps.linkIsDataFieldWithNavigationPath = true;
				oProps.linkPress = `FieldRuntime.onDataFieldWithNavigationPath(\${$source>/}, $controller, '${oDataField.Target.value}')`;
				oProps.displayStyle = "Link";
				return;
			case UIAnnotationTypes.DataFieldWithAction:
				oProps.linkIsDataFieldWithAction = true;
				oProps.linkPress = FieldHelper.getPressEventForDataFieldActionButton(oProps, oProps.dataField.getObject());
				oProps.displayStyle = "Link";
				return;
		}
		const hasQuickView = FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty);
		const hasSemanticObjects =
			!!FieldTemplating.getPropertyWithSemanticObject(oDataModelPath) ||
			(oProps.semanticObject !== undefined && oProps.semanticObject !== "");
		if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
			oProps.hasQuickView = hasQuickView || hasSemanticObjects;
			oProps.hasSituationsIndicator =
				SituationsIndicatorBlock.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
			InternalFieldBlock.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
			if ((oDataModelPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftRoot) {
				oProps.displayStyle = "SemanticKeyWithDraftIndicator";
				return;
			}
			oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
			return;
		}
		if (oDataField.Criticality) {
			oProps.hasQuickView = hasQuickView || hasSemanticObjects;
			oProps.displayStyle = "ObjectStatus";
			return;
		}
		if (
			oProperty.annotations?.Measures?.ISOCurrency &&
			String(oProps.formatOptions.isCurrencyAligned) === "true" &&
			oProps.formatOptions.measureDisplayMode !== "Hidden"
		) {
			oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(
				oDataModelPath,
				oProps.formatOptions,
				true,
				true,
				undefined,
				true
			);
			oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
			oProps.displayStyle = "AmountWithCurrency";

			return;
		}
		if (oProperty.annotations?.Communication?.IsEmailAddress || oProperty.annotations?.Communication?.IsPhoneNumber) {
			oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.linkIsEmailAddress = oProperty.annotations.Communication?.IsEmailAddress !== undefined;
			oProps.linkIsPhoneNumber = oProperty.annotations.Communication?.IsPhoneNumber !== undefined;
			const propertyValueBinding = FieldTemplating.getValueBinding(oDataModelPath, {});
			if (oProps.linkIsEmailAddress) {
				oProps.linkUrl = `mailto:${propertyValueBinding}`;
			}
			if (oProps.linkIsPhoneNumber) {
				oProps.linkUrl = `tel:${propertyValueBinding}`;
			}
			oProps.displayStyle = "Link";
			return;
		}
		if (oProperty.annotations?.UI?.MultiLineText) {
			oProps.displayStyle = "ExpandableText";
			return;
		}

		if (hasQuickView || hasSemanticObjects) {
			oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.hasQuickView = true;
			oProps.displayStyle = "LinkWithQuickView";
			return;
		}

		if (oDataField.$Type === UIAnnotationTypes.DataFieldWithUrl) {
			oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "Link";
			oProps.iconUrl = oDataField.IconUrl ? compileExpression(getExpressionFromAnnotation(oDataField.IconUrl)) : undefined;
			oProps.linkUrl = compileExpression(getExpressionFromAnnotation(oDataField.Url));
			return;
		}

		oProps.displayStyle = "Text";
	}

	static setUpEditStyle(
		oProps: FieldProperties,
		oDataField: any,
		oDataModelPath: DataModelObjectPath,
		appComponent?: AppComponent
	): void {
		FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
		oProps.fieldGroupIds = InternalFieldBlock.computeFieldGroupIds(oDataModelPath, appComponent);
	}

	/**
	 * Calculate the fieldGroupIds for an Inputor other edit control.
	 *
	 * @param dataModelObjectPath
	 * @param appComponent
	 * @returns The value for fieldGroupIds
	 */
	static computeFieldGroupIds(dataModelObjectPath: DataModelObjectPath, appComponent?: AppComponent): string | undefined {
		if (!appComponent) {
			//for ValueHelp / Mass edit Templating the appComponent is not passed to the templating
			return "";
		}
		const sideEffectService = appComponent.getSideEffectsService();
		const fieldGroupIds = sideEffectService.computeFieldGroupIds(
			dataModelObjectPath.targetEntityType?.fullyQualifiedName ?? "",
			dataModelObjectPath.targetObject?.fullyQualifiedName ?? ""
		);
		const result = fieldGroupIds.join(",");
		return result === "" ? undefined : result;
	}

	static setUpObjectIdentifierTitleAndText(_oProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath) {
		if (_oProps.formatOptions?.semanticKeyStyle === "ObjectIdentifier") {
			// if DescriptionValue is set by default and property has a quickView,  we show description and value in ObjectIdentifier Title
			const alwaysShowDescriptionAndValue = _oProps.hasQuickView;
			_oProps.identifierTitle = InternalFieldBlock.getIdentifierTitle(
				_oProps.formatOptions,
				oPropertyDataModelObjectPath,
				alwaysShowDescriptionAndValue
			);
			if (!alwaysShowDescriptionAndValue) {
				_oProps.identifierText = InternalFieldBlock.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
			} else {
				_oProps.identifierText = undefined;
			}
		} else {
			_oProps.identifierTitle = InternalFieldBlock.getIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath, true);
			_oProps.identifierText = undefined;
		}
	}

	static getTextWithWhiteSpace(formatOptions: FieldFormatOptions, oDataModelPath: DataModelObjectPath) {
		const text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
		return (text as any)._type === "PathInModel" || typeof text === "string"
			? compileExpression(formatResult([text], "WSR"))
			: compileExpression(text);
	}

	static setUpNavigationAvailable(oProps: FieldProperties, oDataField: any): void {
		oProps.navigationAvailable = true;
		if (
			oDataField?.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation &&
			oDataField.NavigationAvailable !== undefined &&
			String(oProps.formatOptions.ignoreNavigationAvailable) !== "true"
		) {
			oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
		}
	}

	constructor(props: PropertiesOf<InternalFieldBlock>, controlConfiguration: unknown, settings: TemplateProcessorSettings) {
		super(props);

		const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(this.dataField);
		let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.dataField, this.entitySet);
		InternalFieldBlock.setUpDataPointType(oDataFieldConverted);
		InternalFieldBlock.setUpVisibleProperties(this, oDataModelPath);

		if (this._flexId) {
			this._apiId = this._flexId;
			this._flexId = InternalFieldBlock.getContentId(this._flexId);
			this._vhFlexId = `${this._flexId}_${this.vhIdPrefix}`;
		}
		const valueDataModelPath = FieldTemplating.getDataModelObjectPathForValue(oDataModelPath);
		oDataModelPath = valueDataModelPath || oDataModelPath;
		this.dataSourcePath = getTargetObjectPath(oDataModelPath);
		const oMetaModel = settings.models.metaModel || settings.models.entitySet;
		this.entityType = oMetaModel.createBindingContext(`/${oDataModelPath.targetEntityType.fullyQualifiedName}`);

		InternalFieldBlock.setUpEditableProperties(this, oDataFieldConverted, oDataModelPath, oMetaModel);
		InternalFieldBlock.setUpFormatOptions(this, oDataModelPath, controlConfiguration, settings);
		InternalFieldBlock.setUpDisplayStyle(this, oDataFieldConverted, oDataModelPath);
		InternalFieldBlock.setUpEditStyle(this, oDataFieldConverted, oDataModelPath, settings.appComponent);

		// ---------------------------------------- compute bindings----------------------------------------------------
		const aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
		if (this.displayStyle && aDisplayStylesWithoutPropText.indexOf(this.displayStyle) === -1 && oDataModelPath.targetObject) {
			this.text = this.text ?? FieldTemplating.getTextBinding(oDataModelPath, this.formatOptions);
		} else {
			this.text = "";
		}

		this.emptyIndicatorMode = this.formatOptions.showEmptyIndicator ? "On" : undefined;

		this.computeFieldContentContexts(oMetaModel, oDataFieldConverted);
	}

	/**
	 * Computes and updates metadata contexts that were previously added in FieldContent.fragment.xml using template:with instructions.
	 *
	 * @param metaModel
	 * @param dataFieldConverted
	 */
	computeFieldContentContexts(metaModel: ODataMetaModel, dataFieldConverted: DataField) {
		if (isProperty(dataFieldConverted) && dataFieldConverted.annotations?.UI?.DataFieldDefault !== undefined) {
			// We are looking at a property, so we need to use its default data field
			this.dataField = metaModel.createBindingContext(`@${UIAnnotationTerms.DataFieldDefault}`, this.dataField);
			dataFieldConverted = MetaModelConverter.convertMetaModelContext(this.dataField);
		}
		switch (dataFieldConverted.$Type?.valueOf()) {
			case UIAnnotationTypes.DataField:
			case UIAnnotationTypes.DataFieldWithUrl:
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldWithAction:
				this.property = metaModel.createBindingContext("Value", this.dataField);
				this.valueHelpProperty = metaModel.createBindingContext(FieldHelper.valueHelpProperty(this.property)) as Context;
				break;
			case UIAnnotationTypes.DataFieldForAnnotation:
				this.annotationPath = metaModel.createBindingContext("Target/$AnnotationPath", this.dataField);
				this.dataPoint = this.annotationPath;
				this.property = metaModel.createBindingContext("Value", this.annotationPath);
				this.valueHelpProperty = metaModel.createBindingContext(FieldHelper.valueHelpProperty(this.property)) as Context;
				break;
			case UIAnnotationTypes.DataPointType:
				this.annotationPath = this.dataField;
				this.dataPoint = this.dataField;
				this.property = metaModel.createBindingContext("Value", this.dataField);
				this.valueHelpProperty = metaModel.createBindingContext(FieldHelper.valueHelpProperty(this.property)) as Context;
				break;
		}
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		const displayStyles = ["Button", "ExpandableText", "Avatar", "Contact", "File", "DataPoint"];
		const editStyles = ["CheckBox"];
		if (displayStyles.includes(this.displayStyle as string) || editStyles.includes(this.editStyle as string)) {
			//intermediate state, will be fixed once everything has been moved out of fieldcontent calculation
			return getFieldStructureTemplate(this);
		}

		if (this.formatOptions.fieldMode === "nowrapper" && this.editMode === EditMode.Display) {
			return xml`<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />`;
		} else {
			let id;
			if (this._apiId) {
				id = this._apiId;
			} else if (this.idPrefix) {
				id = generate([this.idPrefix, "Field"]);
			} else {
				id = undefined;
			}

			if (this.onChange !== null && this.onChange !== "null") {
				return xml`
					<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						change="${this.onChange}"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
				`;
			} else {
				return xml`<macroField:FieldAPI
						xmlns:macroField="sap.fe.macros.field"
						id="${id}"
						required="${this.requiredExpression}"
						editable="${this.editableExpression}"
						collaborationEnabled="${this.collaborationEnabled}"
						visible="${this.visible}"
					>
						<core:Fragment fragmentName="sap.fe.macros.internal.field.FieldContent" type="XML" />
					</macroField:FieldAPI>
					`;
			}
		}
	}
}
