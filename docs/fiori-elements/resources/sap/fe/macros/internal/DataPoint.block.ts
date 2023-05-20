import type { Property } from "@sap-ux/vocabularies-types";
import type { SemanticObject } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type { DataPointType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { convertMetaModelContext, getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { compileExpression, formatResult, getExpressionFromAnnotation, notEqual, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { isProperty } from "sap/fe/core/helpers/TypeGuards";
import { buildExpressionForCriticalityColor, buildExpressionForCriticalityIcon } from "sap/fe/core/templating/CriticalityFormatters";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath, getRelativePaths } from "sap/fe/core/templating/DataModelPathHelper";
import { hasCurrency, hasUnit } from "sap/fe/core/templating/PropertyHelper";
import type { DisplayMode } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import {
	getPropertyWithSemanticObject,
	getVisibleExpression,
	isUsedInNavigationWithQuickViewFacets
} from "sap/fe/macros/field/FieldTemplating";
import {
	buildExpressionForProgressIndicatorDisplayValue,
	buildExpressionForProgressIndicatorPercentValue,
	buildFieldBindingExpression,
	getHeaderRatingIndicatorText,
	getValueFormatted
} from "sap/fe/macros/internal/helpers/DataPointTemplating";
import type Context from "sap/ui/model/odata/v4/Context";

type DataPointFormatOptions = Partial<{
	dataPointStyle: "" | "large";
	displayMode: DisplayMode;
	/**
	 * Define the size of the icons (For RatingIndicator only)
	 */
	iconSize: "1rem" | "1.375rem" | "2rem";
	isAnalytics: boolean;
	measureDisplayMode: string;
	/**
	 * If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the ObjectNumber
	 */
	showEmptyIndicator: boolean;
	/**
	 * When true, displays the labels for the Rating and Progress indicators
	 */
	showLabels: boolean;
}>;
export type DataPointProperties = {
	metaPath: Context;
	editMode?: string;
	contextPath: Context;
	formatOptions: DataPointFormatOptions;
	idPrefix?: string;
	// computed properties
	criticalityColorExpression?: string;
	displayValue?: string;
	emptyIndicatorMode?: "On";
	hasQuickView?: boolean;
	objectStatusNumber?: string;
	percentValue?: string;
	semanticObject?: string | SemanticObject;
	semanticObjects?: string;
	targetLabel?: string;
	unit?: string;
	visible?: string;
	visualization?: string;
	objectStatusText?: string;
	iconExpression?: string;
};

@defineBuildingBlock({
	name: "DataPoint",
	namespace: "sap.fe.macros.internal"
})
export default class DataPointBlock extends BuildingBlockBase {
	/**
	 * Prefix added to the generated ID of the field
	 */
	@blockAttribute({
		type: "string"
	})
	public idPrefix?: string;

	/**
	 * Metadata path to the dataPoint.
	 * This property is usually a metadataContext pointing to a DataPoint having
	 * $Type = "com.sap.vocabularies.UI.v1.DataPointType"
	 */

	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true
	})
	public metaPath!: Context;

	/**
	 * Property added to associate the label with the DataPoint
	 */
	@blockAttribute({
		type: "string"
	})
	public ariaLabelledBy?: string;

	/**
	 * Property to set the visualization type
	 */
	private visualization!: string;

	/**
	 * Property to set the visibility
	 */
	private visible!: string;

	/**
	 * Property to set property if the porperty has a Quickview
	 */
	private hasQuickView!: boolean;

	@blockAttribute({
		type: "object",
		validate: function (formatOptionsInput: DataPointFormatOptions) {
			if (formatOptionsInput?.dataPointStyle && !["", "large"].includes(formatOptionsInput?.dataPointStyle)) {
				throw new Error(`Allowed value ${formatOptionsInput.dataPointStyle} for dataPointStyle does not match`);
			}

			if (
				formatOptionsInput?.displayMode &&
				!["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput?.displayMode)
			) {
				throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
			}

			if (formatOptionsInput?.iconSize && !["1rem", "1.375rem", "2rem"].includes(formatOptionsInput?.iconSize)) {
				throw new Error(`Allowed value ${formatOptionsInput.iconSize} for iconSize does not match`);
			}

			if (formatOptionsInput?.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput?.measureDisplayMode)) {
				throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
			}

			return formatOptionsInput;
		}
	})
	public formatOptions: DataPointFormatOptions = {};

	@blockAttribute({
		type: "sap.ui.model.Context",
		required: true,
		expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
	})
	public contextPath!: Context;

	/**
	 * Retrieves the templating objects to further process the DataPoint.
	 *
	 * @param context DataPointProperties or a DataPoint
	 * @returns The models containing infos like the DataModelPath, ValueDataModelPath and DataPointConverted
	 */
	private static getTemplatingObjects(context: DataPointProperties | DataPointBlock): {
		dataModelPath: DataModelObjectPath;
		valueDataModelPath: DataModelObjectPath | undefined;
		dataPointConverted: DataPointType;
	} {
		const internalDataModelPath = getInvolvedDataModelObjects(context.metaPath, context.contextPath);
		let internalValueDataModelPath;
		(context as DataPointProperties).visible = getVisibleExpression(internalDataModelPath);
		if (internalDataModelPath?.targetObject?.Value?.path) {
			internalValueDataModelPath = enhanceDataModelPath(internalDataModelPath, internalDataModelPath.targetObject.Value.path);
		}
		const internalDataPointConverted = convertMetaModelContext(context.metaPath);

		return {
			dataModelPath: internalDataModelPath,
			valueDataModelPath: internalValueDataModelPath,
			dataPointConverted: internalDataPointConverted
		};
	}

	/**
	 * Function that calculates the visualization type for this DataPoint.
	 *
	 * @param properties The datapoint properties
	 * @returns The DataPointProperties with the optimized coding for the visualization type
	 */
	private static getDataPointVisualization(properties: DataPointProperties): DataPointProperties {
		const { dataModelPath, valueDataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(properties);
		if (dataPointConverted?.Visualization === "UI.VisualizationType/Rating") {
			properties.visualization = "Rating";
			return properties;
		}
		if (dataPointConverted?.Visualization === "UI.VisualizationType/Progress") {
			properties.visualization = "Progress";
			return properties;
		}
		const valueProperty = valueDataModelPath && valueDataModelPath.targetObject;
		//check whether the visualization type should be an object number in case one of the if conditions met
		properties.hasQuickView = valueProperty && isUsedInNavigationWithQuickViewFacets(dataModelPath, valueProperty);
		if (getPropertyWithSemanticObject(valueDataModelPath as DataModelObjectPath)) {
			properties.hasQuickView = true;
		}
		if (!properties.hasQuickView) {
			if (isProperty(valueProperty) && (hasUnit(valueProperty) || hasCurrency(valueProperty))) {
				// we only show an objectNumber if there is no quickview and a unit or a currency
				properties.visualization = "ObjectNumber";
				return properties;
			}
		}

		//default case to handle this as objectStatus type
		properties.visualization = "ObjectStatus";
		return properties;
	}

	/**
	 * Constructor method of the building block.
	 *
	 * @param properties The datapoint properties
	 */
	constructor(properties: DataPointProperties) {
		//setup initial default property settings
		properties.hasQuickView = false;

		super(DataPointBlock.getDataPointVisualization(properties));
	}

	/**
	 * The building block template for the rating indicator part.
	 *
	 * @returns An XML-based string with the definition of the rating indicator template
	 */
	getRatingIndicatorTemplate() {
		const { dataModelPath, valueDataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(this);
		const dataPointTarget = dataModelPath.targetObject;
		const targetValue = this.getTargetValueBinding();

		const dataPointValue = dataPointTarget?.Value || "";
		const propertyType = dataPointValue?.$target?.type;

		let numberOfFractionalDigits;
		if (propertyType === "Edm.Decimal" && dataPointTarget.ValueFormat) {
			if (dataPointTarget.ValueFormat.NumberOfFractionalDigits) {
				numberOfFractionalDigits = dataPointTarget.ValueFormat.NumberOfFractionalDigits;
			}
		}

		const value = getValueFormatted(valueDataModelPath as DataModelObjectPath, dataPointValue, propertyType, numberOfFractionalDigits);

		const text = getHeaderRatingIndicatorText(this.metaPath, dataPointTarget);

		let headerLabel = "";
		let targetLabel = "";

		const targetLabelExpression = compileExpression(
			formatResult(
				[
					pathInModel("T_HEADER_RATING_INDICATOR_FOOTER", "sap.fe.i18n"),
					getExpressionFromAnnotation(dataPointConverted.Value, getRelativePaths(dataModelPath)),
					dataPointConverted.TargetValue
						? getExpressionFromAnnotation(dataPointConverted.TargetValue, getRelativePaths(dataModelPath))
						: "5"
				],
				"MESSAGE"
			)
		);

		if (this.formatOptions.showLabels ?? false) {
			headerLabel = xml`<Label xmlns="sap.m"
					${this.attr("text", text)}
					${this.attr("visible", dataPointTarget.SampleSize || dataPointTarget.Description ? true : false)}
				/>`;

			targetLabel = xml`<Label
			xmlns="sap.m"
			core:require="{MESSAGE: 'sap/base/strings/formatMessage' }"
			${this.attr("text", targetLabelExpression)}
			visible="true" />`;
		}

		return xml`
		${headerLabel}
		<RatingIndicator
		xmlns="sap.m"

		${this.attr("id", this.idPrefix ? generate([this.idPrefix, "RatingIndicator-Field-display"]) : undefined)}
		${this.attr("maxValue", targetValue)}
		${this.attr("value", value)}
		${this.attr("tooltip", this.getTooltipValue())}
		${this.attr("iconSize", this.formatOptions.iconSize)}
		${this.attr("class", this.formatOptions.showLabels ?? false ? "sapUiTinyMarginTopBottom" : undefined)}
		editable="false"
	/>
	${targetLabel}`;
	}

	/**
	 * The building block template for the progress indicator part.
	 *
	 * @returns An XML-based string with the definition of the progress indicator template
	 */
	getProgressIndicatorTemplate() {
		const { dataModelPath, valueDataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(this);
		const criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
		const displayValue = buildExpressionForProgressIndicatorDisplayValue(dataModelPath);
		const percentValue = buildExpressionForProgressIndicatorPercentValue(dataModelPath);

		const dataPointTarget = dataModelPath.targetObject;
		let firstLabel = "";
		let secondLabel = "";

		if (this?.formatOptions?.showLabels ?? false) {
			firstLabel = xml`<Label
				xmlns="sap.m"
				${this.attr("text", dataPointTarget?.Description)}
				${this.attr("visible", !!dataPointTarget?.Description)}
			/>`;

			// const secondLabelText = (valueDataModelPath?.targetObject as Property)?.annotations?.Common?.Label;
			const secondLabelExpression = getExpressionFromAnnotation(
				(valueDataModelPath?.targetObject as Property)?.annotations?.Common?.Label
			);
			secondLabel = xml`<Label
				xmlns="sap.m"
				${this.attr("text", compileExpression(secondLabelExpression))}
				${this.attr("visible", !!compileExpression(notEqual(undefined, secondLabelExpression)))}
			/>`;
		}

		return xml`
		${firstLabel}
			<ProgressIndicator
				xmlns="sap.m"
				${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ProgressIndicator-Field-display"]) : undefined)}
				${this.attr("displayValue", displayValue)}
				${this.attr("percentValue", percentValue)}
				${this.attr("state", criticalityColorExpression)}
				${this.attr("tooltip", this.getTooltipValue())}
			/>
			${secondLabel}`;
	}

	/**
	 * The building block template for the object number common part.
	 *
	 * @returns An XML-based string with the definition of the object number common template
	 */
	getObjectNumberCommonTemplate() {
		const { dataModelPath, valueDataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(this);
		const criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
		const emptyIndicatorMode = this.formatOptions.showEmptyIndicator ?? false ? "On" : undefined;
		const objectStatusNumber = buildFieldBindingExpression(dataModelPath, this.formatOptions, true);
		const unit =
			this.formatOptions.measureDisplayMode === "Hidden"
				? undefined
				: compileExpression(UIFormatters.getBindingForUnitOrCurrency(valueDataModelPath as DataModelObjectPath));

		return xml`<ObjectNumber
			xmlns="sap.m"
			${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectNumber-Field-display"]) : undefined)}
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			${this.attr("state", criticalityColorExpression)}
			${this.attr("number", objectStatusNumber)}
			${this.attr("unit", unit)}
			${this.attr("visible", this.visible)}
			emphasized="false"
			${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectNumberLarge" : undefined)}
			${this.attr("tooltip", this.getTooltipValue())}
			${this.attr("emptyIndicatorMode", emptyIndicatorMode)}
		/>`;
	}

	/**
	 * The building block template for the object number.
	 *
	 * @returns An XML-based string with the definition of the object number template
	 */
	getObjectNumberTemplate() {
		const { valueDataModelPath } = DataPointBlock.getTemplatingObjects(this);
		if (this?.formatOptions?.isAnalytics ?? false) {
			return xml`
				<control:ConditionalWrapper
					xmlns:control="sap.fe.macros.controls"
					${this.attr("condition", UIFormatters.hasValidAnalyticalCurrencyOrUnit(valueDataModelPath as DataModelObjectPath))}
				>
					<control:contentTrue>
						${this.getObjectNumberCommonTemplate()}
					</control:contentTrue>
					<control:contentFalse>
						<ObjectNumber
							xmlns="sap.m"
							${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectNumber-Field-display-differentUnit"]) : undefined)}
							number="*"
							unit=""
							${this.attr("visible", this.visible)}
							emphasized="false"
							${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectNumberLarge" : undefined)}
						/>
					</control:contentFalse>
				</control:ConditionalWrapper>`;
		} else {
			return xml`${this.getObjectNumberCommonTemplate()}`;
		}
	}

	/**
	 * Returns the dependent or an empty string.
	 *
	 * @returns Dependent either with the QuickView or an empty string.
	 */
	private getObjectStatusDependentsTemplate() {
		if (this.hasQuickView) {
			return `<dependents><macro:QuickView
						xmlns:macro="sap.fe.macros"
						dataField="{metaPath>}"
						contextPath="{contextPath>}"
					/></dependents>`;
		}
		return "";
	}

	/**
	 * The building block template for the object status.
	 *
	 * @returns An XML-based string with the definition of the object status template
	 */
	getObjectStatusTemplate() {
		const { dataModelPath, valueDataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(this);
		let criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
		if (criticalityColorExpression === "None" && valueDataModelPath) {
			criticalityColorExpression = this.hasQuickView ? "Information" : "None";
		}

		// if the semanticObjects already calculated the criticality we don't calculate it again
		criticalityColorExpression = criticalityColorExpression
			? criticalityColorExpression
			: buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
		const emptyIndicatorMode = this.formatOptions.showEmptyIndicator ?? false ? "On" : undefined;
		const objectStatusText = buildFieldBindingExpression(dataModelPath, this.formatOptions, false);
		const iconExpression = buildExpressionForCriticalityIcon(dataPointConverted, dataModelPath);

		return xml`<ObjectStatus
						xmlns="sap.m"
						${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectStatus-Field-display"]) : undefined)}
						core:require="{ FieldRuntime: 'sap/fe/macros/field/FieldRuntime' }"
						${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectStatusLarge" : undefined)}
						${this.attr("icon", iconExpression)}
						${this.attr("tooltip", this.getTooltipValue())}
						${this.attr("state", criticalityColorExpression)}
						${this.attr("text", objectStatusText)}
						${this.attr("emptyIndicatorMode", emptyIndicatorMode)}
						${this.attr("active", this.hasQuickView)}
						press="FieldRuntime.pressLink"
						${this.attr("ariaLabelledBy", this.ariaLabelledBy !== null ? this.ariaLabelledBy : undefined)}
				>${this.getObjectStatusDependentsTemplate()}
				</ObjectStatus>`;
	}

	/**
	 * The helper method to get a possible tooltip text.
	 *
	 * @returns BindingToolkitExpression
	 */
	private getTooltipValue() {
		const { dataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(this);
		return getExpressionFromAnnotation(dataPointConverted?.annotations?.Common?.QuickInfo?.valueOf(), getRelativePaths(dataModelPath));
	}

	/**
	 * The helper method to get a possible target value binding.
	 *
	 * @returns BindingToolkitExpression
	 */
	private getTargetValueBinding() {
		const { dataModelPath, dataPointConverted } = DataPointBlock.getTemplatingObjects(this);
		return getExpressionFromAnnotation(dataPointConverted.TargetValue, getRelativePaths(dataModelPath));
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		switch (this.visualization) {
			case "Rating": {
				return this.getRatingIndicatorTemplate();
			}
			case "Progress": {
				return this.getProgressIndicatorTemplate();
			}
			case "ObjectNumber": {
				return this.getObjectNumberTemplate();
			}
			default: {
				return this.getObjectStatusTemplate();
			}
		}
	}
}
