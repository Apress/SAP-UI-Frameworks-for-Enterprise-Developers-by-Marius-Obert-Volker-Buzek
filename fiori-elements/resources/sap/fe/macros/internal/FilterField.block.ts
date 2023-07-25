import type { Property } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { SAP_UI_MODEL_CONTEXT, xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import type { VisualFilters } from "sap/fe/core/converters/controls/ListReport/VisualFilters";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { compileExpression, getExpressionFromAnnotation } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getRelativePropertyPath } from "sap/fe/core/templating/PropertyFormatters";
import type { ComputedAnnotationInterface, MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import {
	constraints,
	formatOptions,
	getConditionsBinding,
	getDataType,
	getPlaceholder,
	isRequiredInFilter,
	maxConditions
} from "sap/fe/macros/filter/FilterFieldHelper";
import { getFilterFieldDisplayFormat } from "sap/fe/macros/filter/FilterFieldTemplating";
import type Context from "sap/ui/model/Context";
import type MetaModel from "sap/ui/model/MetaModel";

/**
 * Building block for creating a Filter Field based on the metadata provided by OData V4.
 * <br>
 * It is designed to work based on a property context(property) pointing to an entity type property
 * needed to be used as filterfield and entityType context(contextPath) to consider the relativity of
 * the propertyPath of the property wrt entityType.
 *
 * Usage example:
 * <pre>
 * &lt;macro:FilterField id="MyFilterField" property="CompanyName" /&gt;
 * </pre>
 *
 * @private
 */
@defineBuildingBlock({
	name: "FilterField",
	namespace: "sap.fe.macros.internal"
})
export default class FilterFieldBlock extends BuildingBlockBase {
	/**
	 * Defines the metadata path to the property.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		isPublic: true
	})
	property!: Context;

	/**
	 * Metadata path to the entitySet or navigationProperty
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		isPublic: true
	})
	contextPath!: Context;

	/**
	 * Visual filter settings for filter field.
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	visualFilter?: Context | VisualFilters;

	/**
	 * A prefix that is added to the generated ID of the filter field.
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	idPrefix: string = "FilterField";

	/**
	 * A prefix that is added to the generated ID of the value help used for the filter field.
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	vhIdPrefix: string = "FilterFieldValueHelp";

	/**
	 * Specifies the Sematic Date Range option for the filter field.
	 */
	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	useSemanticDateRange: boolean = true;

	/**
	 * Settings from the manifest settings.
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	settings: string = "";

	/***********************************************
	 *            INTERNAL ATTRIBUTES              *
	 **********************************************/

	/**
	 * Control Id for MDC filter field used inside.
	 */
	controlId!: string;

	/**
	 * Source annotation path of the property.
	 */
	sourcePath!: string;

	/**
	 * Label for filterfield.
	 */
	label!: string;

	/**
	 * Data Type of the filter field.
	 */
	dataType!: string;

	/**
	 * Maximum conditions that can be added to the filter field.
	 */
	maxConditions!: number;

	/**
	 * Field Help id as association for the filter field.
	 */
	fieldHelpProperty?: string;

	/**
	 * Binding path for conditions added to filter field.
	 */
	conditionsBinding!: string;

	/**
	 * Datatype constraints of the filter field.
	 */
	dataTypeConstraints?: string;

	/**
	 * Datatype format options of the filter field.
	 */
	dataTypeFormatOptions?: string;

	/**
	 * To specify filter field is mandatory for filtering.
	 */
	required!: string;

	/**
	 * Valid operators for the filter field.
	 */
	operators?: string;

	/**
	 * Visual Filter id to be used.
	 */
	vfId?: string;

	/**
	 * Visual Filter is expected.
	 */
	vfEnabled!: boolean;

	/**
	 * Property used is filterable
	 */
	isFilterable!: boolean;

	/**
	 * Property for placeholder
	 */
	placeholder?: string;

	/**
	 * Property to hold promise for display
	 */
	display?: Promise<string | undefined>;

	constructor(props: PropertiesOf<FilterFieldBlock>, configuration: any, settings: any) {
		super(props, configuration, settings);

		const propertyConverted = MetaModelConverter.convertMetaModelContext(this.property) as Property;
		const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.property, this.contextPath);

		// Property settings
		const propertyName = propertyConverted.name,
			fixedValues = !!propertyConverted.annotations?.Common?.ValueListWithFixedValues;

		this.controlId = this.idPrefix && generate([this.idPrefix, propertyName]);
		this.sourcePath = getTargetObjectPath(dataModelPath);
		this.dataType = getDataType(propertyConverted);
		const labelTerm = propertyConverted?.annotations?.Common?.Label || propertyName;
		const labelExpression = getExpressionFromAnnotation(labelTerm);
		this.label = compileExpression(labelExpression) || propertyName;
		this.conditionsBinding = getConditionsBinding(dataModelPath) || "";
		this.placeholder = getPlaceholder(propertyConverted);
		// Visual Filter settings
		this.vfEnabled = !!this.visualFilter && !(this.idPrefix && this.idPrefix.indexOf("Adaptation") > -1);
		this.vfId = this.vfEnabled ? generate([this.idPrefix, propertyName, "VisualFilter"]) : undefined;

		//-----------------------------------------------------------------------------------------------------//
		// TODO: need to change operations from MetaModel to Converters.
		// This mainly included changing changing getFilterRestrictions operations from metaModel to converters
		const propertyContext = this.property,
			model: MetaModel = propertyContext.getModel(),
			vhPropertyPath: string = FieldHelper.valueHelpPropertyForFilterField(propertyContext),
			filterable = CommonHelper.isPropertyFilterable(propertyContext),
			propertyObject = propertyContext.getObject(),
			propertyInterface = { context: propertyContext } as ComputedAnnotationInterface;

		this.display = getFilterFieldDisplayFormat(dataModelPath, propertyConverted, propertyInterface);
		this.isFilterable = !(filterable === false || filterable === "false");
		this.maxConditions = maxConditions(propertyObject, propertyInterface);
		this.dataTypeConstraints = constraints(propertyObject, propertyInterface);
		this.dataTypeFormatOptions = formatOptions(propertyObject, propertyInterface);
		this.required = isRequiredInFilter(propertyObject, propertyInterface);
		this.operators = FieldHelper.operators(
			propertyContext,
			propertyObject,
			this.useSemanticDateRange,
			this.settings || "",
			this.contextPath.getPath()
		);

		// Value Help settings
		// TODO: This needs to be updated when VH macro is converted to 2.0
		const vhProperty = model.createBindingContext(vhPropertyPath) as Context;
		const vhPropertyObject = vhProperty.getObject() as MetaModelContext,
			vhPropertyInterface = { context: vhProperty },
			relativeVhPropertyPath = getRelativePropertyPath(vhPropertyObject, vhPropertyInterface),
			relativePropertyPath = getRelativePropertyPath(propertyObject, propertyInterface);
		this.fieldHelpProperty = FieldHelper.getFieldHelpPropertyForFilterField(
			propertyContext,
			propertyObject,
			propertyObject.$Type,
			this.vhIdPrefix,
			relativePropertyPath,
			relativeVhPropertyPath,
			fixedValues,
			this.useSemanticDateRange
		);

		//-----------------------------------------------------------------------------------------------------//
	}

	getVisualFilterContent() {
		let visualFilterObject = this.visualFilter,
			vfXML = xml``;
		if (!this.vfEnabled || !visualFilterObject) {
			return vfXML;
		}
		if ((visualFilterObject as Context)?.isA?.(SAP_UI_MODEL_CONTEXT)) {
			visualFilterObject = (visualFilterObject as Context).getObject() as VisualFilters;
		}

		const {
			contextPath,
			presentationAnnotation,
			outParameter,
			inParameters,
			valuelistProperty,
			selectionVariantAnnotation,
			multipleSelectionAllowed,
			required,
			requiredProperties = [],
			showOverlayInitially,
			renderLineChart,
			isValueListWithFixedValues
		} = visualFilterObject as VisualFilters;
		vfXML = xml`
				<macro:VisualFilter
					id="${this.vfId}"
					contextPath="${contextPath}"
					metaPath="${presentationAnnotation}"
					outParameter="${outParameter}"
					inParameters="${inParameters}"
					valuelistProperty="${valuelistProperty}"
					selectionVariantAnnotation="${selectionVariantAnnotation}"
					multipleSelectionAllowed="${multipleSelectionAllowed}"
					required="${required}"
					requiredProperties="${CommonHelper.stringifyCustomData(requiredProperties)}"
					showOverlayInitially="${showOverlayInitially}"
					renderLineChart="${renderLineChart}"
					isValueListWithFixedValues="${isValueListWithFixedValues}"
					filterBarEntityType="${contextPath}"
				/>
			`;

		return vfXML;
	}

	async getTemplate() {
		let xmlRet = ``;
		if (this.isFilterable) {
			let display;
			try {
				display = await this.display;
			} catch (err: unknown) {
				Log.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${err}`);
			}

			xmlRet = xml`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:macro="sap.fe.macros"
					xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					unittest:id="UnitTest::FilterField"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${display}"
					maxConditions="${this.maxConditions}"
					fieldHelp="${this.fieldHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"

				>
					${this.vfEnabled ? this.getVisualFilterContent() : xml``}
				</mdc:FilterField>
			`;
		}

		return xmlRet;
	}
}
