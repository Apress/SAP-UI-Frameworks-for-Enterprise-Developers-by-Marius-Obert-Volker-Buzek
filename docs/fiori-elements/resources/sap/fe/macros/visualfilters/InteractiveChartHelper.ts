import { PathAnnotationExpression, Property, PropertyPath } from "@sap-ux/vocabularies-types";
import { AggregatedProperty, AggregatedPropertyType } from "@sap-ux/vocabularies-types/vocabularies/Analytics";
import { Label, SortOrder } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { Chart, DataPoint, NumberFormat as NumberFormatType, ValueCriticalityType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import JSTokenizer from "sap/base/util/JSTokenizer";
import CommonUtils from "sap/fe/core/CommonUtils";
import VisualFilterUtils from "sap/fe/core/controls/filterbar/utils/VisualFilterUtils";
import { ParameterType } from "sap/fe/core/converters/controls/ListReport/VisualFilters";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { isEntitySet, isNavigationProperty } from "sap/fe/core/helpers/TypeGuards";
import { buildExpressionForCriticalityColorMicroChart } from "sap/fe/core/templating/CriticalityFormatters";
import { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { FilterConditions, getFiltersConditionsFromSelectionVariant } from "sap/fe/core/templating/FilterHelper";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import CommonHelper from "sap/fe/macros/CommonHelper";
import { constraints, formatOptions } from "sap/fe/macros/filter/FilterFieldHelper";
import mLibrary from "sap/m/library";
import Core from "sap/ui/core/Core";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import ConditionConverter from "sap/ui/mdc/condition/ConditionConverter";
import Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataUtils from "sap/ui/model/odata/v4/ODataUtils";
import { getTextBinding } from "../field/FieldTemplating";
import VisualFilterBlock from "./VisualFilter.block";

type MeasureType = {
	value?: string;
	ISOCurrency?: PathAnnotationExpression<string>;
	Unit?: PathAnnotationExpression<string>;
};
type InteractiveChartType = {
	chartLabel?: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	aggregationBinding?: string;
	errorMessageTitleExpression?: string;
	errorMessageExpression?: string;
	showErrorExpression?: string;
	inParameters?: string;
	displayedValue?: string;
	measure?: string;
	stringifiedParameters?: string;
	selectionVariantAnnotation?: string;
	inParameterFilters?: string;
	color?: string;
	uom?: string | PathAnnotationExpression<string>;
	scalefactor?: number | object;
};

const InteractiveChartHelper = {
	getChartDisplayedValue: function (value: string, valueFormat?: NumberFormatType, metaPath?: string) {
		const infoPath = generate([metaPath]);
		return (
			"{parts:[{path:'" +
			value +
			"',type:'sap.ui.model.odata.type.Decimal', constraints:{'nullable':false}}" +
			(valueFormat && valueFormat.ScaleFactor
				? ",{value:'" + valueFormat.ScaleFactor.valueOf() + "'}"
				: ",{path:'internal>scalefactorNumber/" + infoPath + "'}") +
			(valueFormat && valueFormat.NumberOfFractionalDigits
				? ",{value:'" + valueFormat.NumberOfFractionalDigits + "'}"
				: ",{value:'0'}") +
			",{path:'internal>currency/" +
			infoPath +
			"'}" +
			",{path:'" +
			value +
			"',type:'sap.ui.model.odata.type.String', constraints:{'nullable':false}}" +
			"], formatter:'VisualFilterRuntime.scaleVisualFilterValue'}"
		); //+ sType.split('#').length ? sType.split('#')[1] : 'Decimal' + "}";
	},
	getChartValue: function (value: string) {
		return "{path:'" + value + "',type:'sap.ui.model.odata.type.Decimal', constraints:{'nullable':false}}";
	},
	_getCollectionName: function (collection: DataModelObjectPath, contextPath: Context, parameters?: Array<string>) {
		const collectionObject = collection.targetObject;
		if (isNavigationProperty(collectionObject)) {
			return parameters ? contextPath.getPath() : collectionObject.name;
		} else if (isEntitySet(collectionObject)) {
			return "/" + collectionObject.name;
		} else {
			return collectionObject.name;
		}
	},
	_getBindingPathForParameters: function (
		filterConditions: Record<string, FilterConditions[]>,
		metaModel: ODataModel,
		collectionName: string,
		parameters: Array<string>,
		entitySetPath: string
	) {
		const params = [];
		const convertedFilterConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
		const parameterProperties = CommonUtils.getParameterInfo(
			metaModel as unknown as ODataMetaModel,
			collectionName
		).parameterProperties;
		if (parameterProperties) {
			for (const i in parameters) {
				const parameter = parameters[i];
				const property = parameterProperties[parameter];
				const entityPath = entitySetPath.split("/")[1];
				const propertyContext = metaModel.createBindingContext(`/${entityPath}/${parameter}`);
				const typeConfig = TypeUtil.getTypeConfig(
					property.$Type,
					JSTokenizer.parseJS(formatOptions(property, { context: propertyContext }) || "{}"),
					JSTokenizer.parseJS(constraints(property, { context: propertyContext }) || "{}")
				);
				const condition = convertedFilterConditions[parameter];
				const conditionInternal = condition ? condition[0] : undefined;
				if (conditionInternal) {
					const internalParameterCondition = ConditionConverter.toType(conditionInternal, typeConfig, TypeUtil);
					const edmType = property.$Type;
					let value = encodeURIComponent(ODataUtils.formatLiteral(internalParameterCondition.values[0], edmType));
					value = value.replaceAll("'", "\\'");
					params.push(`${parameter}=${value}`);
				}
			}
		}

		const parameterEntitySet = collectionName.slice(0, collectionName.lastIndexOf("/"));
		const targetNavigation = collectionName.substring(collectionName.lastIndexOf("/") + 1);
		// create parameter context
		return `${parameterEntitySet}(${params.toString()})/${targetNavigation}`;
	},
	_getUOMAggregationExpression: function (
		customAggregate?: boolean,
		UoMHasCustomAggregate?: boolean,
		UOM?: PathAnnotationExpression<string> | string,
		aggregation?: AggregatedPropertyType
	) {
		let aggregationExpression, UOMExpression;
		const path = UOM && typeof UOM != "string" && UOM.path;
		if (customAggregate) {
			//custom aggregate for a currency or unit of measure corresponding to this aggregatable property
			if (UoMHasCustomAggregate) {
				aggregationExpression = path ? `{ 'unit' : '${path}' }` : "{}";
				UOMExpression = "";
			} else {
				aggregationExpression = "{}";
				UOMExpression = path ? `, '${path}' : {}` : "";
			}
		} else if (
			aggregation &&
			aggregation.AggregatableProperty &&
			aggregation.AggregatableProperty.value &&
			aggregation.AggregationMethod
		) {
			aggregationExpression =
				"{ 'name' : '" + aggregation.AggregatableProperty.value + "', 'with' : '" + aggregation.AggregationMethod + "'}";
			UOMExpression = path ? ", '" + path + "' : {}" : "";
		}

		return {
			aggregationExpression: aggregationExpression,
			UOMExpression: UOMExpression
		};
	},
	getAggregationBinding: function (
		chartAnnotations: Chart,
		collection: DataModelObjectPath,
		contextPath: Context,
		textAssociation?: PathAnnotationExpression<string>,
		dimensionType?: string,
		sortOrder?: SortOrder,
		selectionVariant?: DataModelObjectPath,
		customAggregate?: boolean,
		aggregation?: AggregatedPropertyType,
		UoMHasCustomAggregate?: boolean,
		parameters?: Array<string>,
		filterBarContext?: Context,
		draftSupported?: boolean,
		chartMeasure?: string
	) {
		const selectionVariantAnnotation = selectionVariant?.targetObject;
		const entityType = filterBarContext ? filterBarContext.getPath() : "";
		const entitySetPath = contextPath.getPath();
		const dimension = chartAnnotations.Dimensions[0].value;
		const filters = [];
		let filterConditions;
		let collectionName = this._getCollectionName(collection, contextPath, parameters);
		const UOM: PathAnnotationExpression<string> | string | undefined = InteractiveChartHelper.getUoM(
			chartAnnotations,
			collection,
			undefined,
			customAggregate,
			aggregation
		);
		const metaModel = contextPath.getModel();
		if (draftSupported) {
			filters.push({
				operator: "EQ",
				value1: "true",
				value2: null,
				path: "IsActiveEntity",
				isParameter: true
			});
		}
		if (selectionVariantAnnotation) {
			filterConditions = getFiltersConditionsFromSelectionVariant(
				entitySetPath,
				metaModel as unknown as ODataMetaModel,
				selectionVariantAnnotation,
				VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils)
			);
			for (const path in filterConditions) {
				const conditions = filterConditions[path];
				conditions.forEach(function (condition: FilterConditions) {
					if (!condition.isParameter) {
						filters.push(condition);
					}
				});
			}
		}
		if (entityType !== `${collectionName}/` && parameters && parameters.length && filterConditions) {
			const bindingPath = this._getBindingPathForParameters(filterConditions, metaModel, collectionName, parameters, entitySetPath);
			collectionName = bindingPath;
		}
		const UOMAggregationExpression = this._getUOMAggregationExpression(customAggregate, UoMHasCustomAggregate, UOM, aggregation);
		const aggregationExpression = UOMAggregationExpression.aggregationExpression;
		const UOMExpression = UOMAggregationExpression.UOMExpression;
		const textAssociationExpression = textAssociation ? "' : { 'additionally' : ['" + textAssociation.path + "'] }" : "' : { }";
		const filterExpression = JSON.stringify(filters);
		return (
			"{path: '" +
			collectionName +
			"', templateShareable: true, suspended : true, 'filters' : " +
			filterExpression +
			",'parameters' : {" +
			InteractiveChartHelper.getSortOrder(chartAnnotations, dimensionType, sortOrder, chartMeasure) +
			", '$$aggregation' : {'aggregate' : {'" +
			chartMeasure +
			"' : " +
			aggregationExpression +
			"},'group' : {'" +
			dimension +
			textAssociationExpression +
			UOMExpression +
			"} } }" +
			InteractiveChartHelper.getMaxItems(chartAnnotations) +
			"}"
		);
	},
	_getOrderExpressionFromMeasure: function (sortOrder?: SortOrder, chartMeasure?: string) {
		let sortPropertyName;
		if (sortOrder && sortOrder.length) {
			if (sortOrder[0].DynamicProperty) {
				sortPropertyName = (sortOrder[0].DynamicProperty.$target as AggregatedProperty)?.Name;
			} else {
				sortPropertyName = sortOrder[0].Property?.value;
			}
			if (sortPropertyName === chartMeasure) {
				return "'$orderby' : '" + chartMeasure + (sortOrder[0].Descending ? " desc'" : "'");
			}
			return "'$orderby' : '" + chartMeasure + " desc'";
		}
		return "'$orderby' : '" + chartMeasure + " desc'";
	},
	getSortOrder: function (chartAnnotations: Chart, dimensionType?: string, sortOrder?: SortOrder, chartMeasure?: string) {
		if (chartAnnotations.ChartType === "UI.ChartType/Donut" || chartAnnotations.ChartType === "UI.ChartType/Bar") {
			return this._getOrderExpressionFromMeasure(sortOrder, chartMeasure);
		} else if (dimensionType === "Edm.Date" || dimensionType === "Edm.Time" || dimensionType === "Edm.DateTimeOffset") {
			return "'$orderby' : '" + chartAnnotations.Dimensions[0].value + "'";
		} else if (
			sortOrder &&
			sortOrder.length &&
			(sortOrder[0].Property?.$target as unknown as PathAnnotationExpression<string>)?.path === chartAnnotations.Dimensions[0].value
		) {
			return "'$orderby' : '" + sortOrder[0].Property?.$target?.name + (sortOrder[0].Descending ? " desc'" : "'");
		} else {
			return "'$orderby' : '" + chartAnnotations.Dimensions[0].$target?.name + "'";
		}
	},
	getMaxItems: function (chartAnnotations: Chart) {
		if (chartAnnotations.ChartType === "UI.ChartType/Bar") {
			return ",'startIndex' : 0,'length' : 3";
		} else if (chartAnnotations.ChartType === "UI.ChartType/Line") {
			return ",'startIndex' : 0,'length' : 6";
		} else {
			return "";
		}
	},
	getColorBinding: function (dataPoint: DataPoint, dimension: PropertyPath) {
		const valueCriticality = dimension?.$target?.annotations?.UI?.ValueCriticality;
		if (dataPoint?.Criticality) {
			return buildExpressionForCriticalityColorMicroChart(dataPoint);
		} else if (dataPoint?.CriticalityCalculation) {
			const oDirection = dataPoint.CriticalityCalculation.ImprovementDirection;
			const oDataPointValue = dataPoint.Value;
			const oDeviationRangeLowValue = dataPoint.CriticalityCalculation.DeviationRangeLowValue.valueOf();
			const oToleranceRangeLowValue = dataPoint.CriticalityCalculation.ToleranceRangeLowValue.valueOf();
			const oAcceptanceRangeLowValue = dataPoint.CriticalityCalculation.AcceptanceRangeLowValue.valueOf();
			const oAcceptanceRangeHighValue = dataPoint.CriticalityCalculation.AcceptanceRangeHighValue.valueOf();
			const oToleranceRangeHighValue = dataPoint.CriticalityCalculation.ToleranceRangeHighValue.valueOf();
			const oDeviationRangeHighValue = dataPoint.CriticalityCalculation.DeviationRangeHighValue.valueOf();
			return CommonHelper.getCriticalityCalculationBinding(
				oDirection,
				oDataPointValue,
				oDeviationRangeLowValue,
				oToleranceRangeLowValue,
				oAcceptanceRangeLowValue,
				oAcceptanceRangeHighValue,
				oToleranceRangeHighValue,
				oDeviationRangeHighValue
			);
		} else if (valueCriticality && valueCriticality.length) {
			return InteractiveChartHelper.getValueCriticality(dimension.value, valueCriticality);
		} else {
			return undefined;
		}
	},
	getValueCriticality: function (dimension: string, valueCriticality: Array<ValueCriticalityType>) {
		let result;
		const values: string[] = [];
		if (valueCriticality && valueCriticality.length > 0) {
			valueCriticality.forEach(function (valueCriticalityType: ValueCriticalityType) {
				if (valueCriticalityType.Value && valueCriticalityType.Criticality) {
					const value =
						"${" +
						dimension +
						"} === '" +
						valueCriticalityType.Value +
						"' ? '" +
						InteractiveChartHelper._getCriticalityFromEnum(valueCriticalityType.Criticality) +
						"'";
					values.push(value);
				}
			});
			result = values.length > 0 && values.join(" : ") + " : undefined";
		}
		return result ? "{= " + result + " }" : undefined;
	},
	/**
	 * This function returns the criticality indicator from annotations if criticality is EnumMember.
	 *
	 * @param criticality Criticality provided in the annotations
	 * @returns Return the indicator for criticality
	 * @private
	 */
	_getCriticalityFromEnum: function (criticality: string) {
		const valueColor = mLibrary.ValueColor;
		let indicator;
		if (criticality === "UI.CriticalityType/Negative") {
			indicator = valueColor.Error;
		} else if (criticality === "UI.CriticalityType/Positive") {
			indicator = valueColor.Good;
		} else if (criticality === "UI.CriticalityType/Critical") {
			indicator = valueColor.Critical;
		} else {
			indicator = valueColor.Neutral;
		}
		return indicator;
	},
	getScaleUoMTitle: function (
		chartAnnotation?: Chart,
		collection?: DataModelObjectPath,
		metaPath?: string,
		customAggregate?: boolean,
		aggregation?: AggregatedPropertyType,
		seperator?: string,
		toolTip?: boolean
	) {
		const scaleFactor = chartAnnotation?.MeasureAttributes
			? chartAnnotation.MeasureAttributes[0]?.DataPoint?.$target?.ValueFormat?.ScaleFactor?.valueOf()
			: undefined;
		const infoPath = generate([metaPath]);
		const fixedInteger = NumberFormat.getIntegerInstance({
			style: "short",
			showScale: false,
			shortRefNumber: scaleFactor as number
		});
		let scale = fixedInteger.getScale();
		let UOM = InteractiveChartHelper.getUoM(chartAnnotation, collection, undefined, customAggregate, aggregation);
		UOM = UOM && ((UOM as PathAnnotationExpression<string>).path ? "${internal>uom/" + infoPath + "}" : "'" + UOM + "'");
		scale = scale ? "'" + scale + "'" : "${internal>scalefactor/" + infoPath + "}";
		if (!seperator) {
			seperator = "|";
		}
		seperator = "' " + seperator + " ' + ";
		const expression = scale && UOM ? seperator + scale + " + ' ' + " + UOM : seperator + (scale || UOM);
		return toolTip ? expression : "{= " + expression + "}";
	},
	getMeasureDimensionTitle: function (chartAnnotation?: Chart, customAggregate?: boolean, aggregation?: AggregatedPropertyType) {
		let measureLabel;
		let measurePath;
		if (customAggregate) {
			measurePath = chartAnnotation?.Measures[0]?.$target?.name;
		}
		if (chartAnnotation?.DynamicMeasures && chartAnnotation.DynamicMeasures.length > 0) {
			measurePath = (chartAnnotation.DynamicMeasures[0]?.$target as AggregatedPropertyType)?.AggregatableProperty?.value;
		} else if (!customAggregate && chartAnnotation?.Measures && chartAnnotation?.Measures.length > 0) {
			measurePath = chartAnnotation.Measures[0]?.$target?.name;
		}
		const dimensionPath = chartAnnotation?.Dimensions[0]?.value as unknown as Label;
		let dimensionLabel = chartAnnotation?.Dimensions[0]?.$target?.annotations?.Common?.Label;
		if (!customAggregate && aggregation) {
			// check if the label is part of aggregated properties (Transformation aggregates)
			measureLabel = aggregation.annotations && aggregation.annotations.Common && aggregation.annotations.Common.Label;
			if (measureLabel === undefined) {
				measureLabel = chartAnnotation?.Measures[0]?.$target?.annotations?.Common?.Label;
			}
		} else {
			measureLabel = chartAnnotation?.Measures[0]?.$target?.annotations?.Common?.Label;
		}
		if (measureLabel === undefined) {
			measureLabel = measurePath;
		}
		if (dimensionLabel === undefined) {
			dimensionLabel = dimensionPath;
		}
		return Core.getLibraryResourceBundle("sap.fe.macros").getText("M_INTERACTIVE_CHART_HELPER_VISUALFILTER_MEASURE_DIMENSION_TITLE", [
			measureLabel,
			dimensionLabel
		]);
	},

	getToolTip: function (
		chartAnnotation?: Chart,
		collection?: DataModelObjectPath,
		metaPath?: string,
		customAggregate?: boolean,
		aggregation?: AggregatedPropertyType,
		renderLineChart?: boolean | string
	) {
		const chartType = chartAnnotation && chartAnnotation["ChartType"];
		let measureDimensionToolTip = InteractiveChartHelper.getMeasureDimensionTitle(chartAnnotation, customAggregate, aggregation);
		measureDimensionToolTip = CommonHelper.escapeSingleQuotes(measureDimensionToolTip);
		if (renderLineChart === "false" && chartType === "UI.ChartType/Line") {
			return `{= '${measureDimensionToolTip}'}`;
		}

		const seperator = Core.getLibraryResourceBundle("sap.fe.macros").getText(
			"M_INTERACTIVE_CHART_HELPER_VISUALFILTER_TOOLTIP_SEPERATOR"
		);
		const infoPath = generate([metaPath]);
		const scaleUOMTooltip = InteractiveChartHelper.getScaleUoMTitle(
			chartAnnotation,
			collection,
			infoPath,
			customAggregate,
			aggregation,
			seperator,
			true
		);
		return "{= '" + measureDimensionToolTip + (scaleUOMTooltip ? "' + " + scaleUOMTooltip : "'") + "}";
	},
	_getUOM: function (
		UOMObjectPath?: PathAnnotationExpression<string>,
		UOM?: string,
		collection?: DataModelObjectPath,
		customData?: boolean,
		aggregatablePropertyPath?: string
	) {
		const UOMObject: Record<string, unknown> = {};
		const collectionObject = collection?.targetObject;
		if (UOMObjectPath && UOM) {
			// check if the UOM is part of Measure annotations(Custom aggregates)
			UOMObject[UOM] = { $Path: UOMObjectPath.path };
			return customData && UOMObjectPath.path ? JSON.stringify(UOMObject) : UOMObjectPath;
		} else if (aggregatablePropertyPath) {
			// check if the UOM is part of base property annotations(Transformation aggregates)
			const entityProperties = collectionObject.entityType
				? collectionObject.entityType.entityProperties
				: collectionObject.targetType?.entityProperties;
			const propertyAnnotations = entityProperties?.find((property: Property) => property.name == aggregatablePropertyPath);
			if (propertyAnnotations?.annotations?.Measures && UOM) {
				UOMObjectPath = propertyAnnotations?.annotations?.Measures[UOM];
				UOMObject[UOM] = { $Path: UOMObjectPath?.path };
			}
			return UOMObjectPath && customData && UOMObjectPath.path ? JSON.stringify(UOMObject) : UOMObjectPath;
		}
	},
	getUoM: function (
		chartAnnotation?: Chart,
		collection?: DataModelObjectPath,
		customData?: boolean,
		customAggregate?: boolean,
		aggregation?: AggregatedPropertyType
	) {
		let measure: MeasureType = {};
		if (customAggregate) {
			measure = chartAnnotation?.Measures[0] as MeasureType;
		}
		if (chartAnnotation?.DynamicMeasures && chartAnnotation.DynamicMeasures.length > 0) {
			measure = (chartAnnotation.DynamicMeasures[0]?.$target as AggregatedPropertyType)?.AggregatableProperty?.$target?.annotations
				?.Measures as MeasureType;
		} else if (!customAggregate && chartAnnotation?.Measures && chartAnnotation.Measures.length > 0) {
			measure = chartAnnotation.Measures[0];
		}
		const ISOCurrency = measure?.ISOCurrency;
		const unit = measure?.Unit;
		let aggregatablePropertyPath: string | undefined;
		if (!customAggregate && aggregation) {
			aggregatablePropertyPath = aggregation.AggregatableProperty && aggregation.AggregatableProperty.value;
		} else {
			aggregatablePropertyPath = measure?.value;
		}
		return (
			this._getUOM(ISOCurrency, "ISOCurrency", collection, customData, aggregatablePropertyPath) ||
			this._getUOM(unit, "Unit", collection, customData, aggregatablePropertyPath)
		);
	},
	getScaleFactor: function (valueFormat?: NumberFormatType) {
		if (valueFormat && valueFormat.ScaleFactor) {
			return valueFormat.ScaleFactor.valueOf();
		}
		return undefined;
	},
	getUoMVisiblity: function (chartAnnotation?: Chart, showError?: boolean) {
		const chartType = chartAnnotation && chartAnnotation["ChartType"];
		if (showError) {
			return false;
		} else if (!(chartType === "UI.ChartType/Bar" || chartType === "UI.ChartType/Line")) {
			return false;
		} else {
			return true;
		}
	},
	getInParameterFiltersBinding: function (inParameters: Array<ParameterType>) {
		if (inParameters.length > 0) {
			const parts: string[] = [];
			let paths = "";
			inParameters.forEach(function (inParameter: ParameterType) {
				if (inParameter.localDataProperty) {
					parts.push(`{path:'$filters>/conditions/${inParameter.localDataProperty}'}`);
				}
			});
			if (parts.length > 0) {
				paths = parts.join();
				return `{parts:[${paths}], formatter:'sap.fe.macros.visualfilters.VisualFilterRuntime.getFiltersFromConditions'}`;
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	},

	getfilterCountBinding: function (chartAnnotation?: Chart) {
		const dimension = chartAnnotation?.Dimensions[0]?.$target?.name;
		return (
			"{path:'$filters>/conditions/" + dimension + "', formatter:'sap.fe.macros.visualfilters.VisualFilterRuntime.getFilterCounts'}"
		);
	},

	getInteractiveChartProperties: function (visualFilter: VisualFilterBlock) {
		const chartAnnotation = visualFilter.chartAnnotation;
		const interactiveChartProperties: InteractiveChartType = {};
		if (visualFilter.chartMeasure && chartAnnotation?.Dimensions && chartAnnotation.Dimensions[0]) {
			const id = generate([visualFilter.metaPath?.getPath()]);
			interactiveChartProperties.showErrorExpression = "${internal>" + id + "/showError}";
			interactiveChartProperties.errorMessageExpression = "{internal>" + id + "/errorMessage}";
			interactiveChartProperties.errorMessageTitleExpression = "{internal>" + id + "/errorMessageTitle}";
			let dataPointAnnotation;
			if (chartAnnotation?.MeasureAttributes && chartAnnotation?.MeasureAttributes[0]) {
				dataPointAnnotation = chartAnnotation?.MeasureAttributes[0]?.DataPoint
					? chartAnnotation?.MeasureAttributes[0].DataPoint.$target
					: chartAnnotation?.MeasureAttributes[0];
			}
			const dimension = chartAnnotation?.Dimensions[0];
			const parameters = CommonHelper.getParameters(visualFilter.contextPath.getObject(), { context: visualFilter.contextPath });
			const dimensionText = dimension?.$target?.annotations?.Common?.Text as unknown as PathAnnotationExpression<string>;
			const contextObjectPath = getInvolvedDataModelObjects(visualFilter.metaPath, visualFilter.contextPath).targetObject;
			const collection = getInvolvedDataModelObjects(visualFilter.contextPath);
			const selectionVariant = visualFilter.selectionVariantAnnotation
				? getInvolvedDataModelObjects(visualFilter.selectionVariantAnnotation)
				: undefined;
			const sortOrder = contextObjectPath.SortOrder;
			interactiveChartProperties.aggregationBinding = InteractiveChartHelper.getAggregationBinding(
				chartAnnotation,
				collection,
				visualFilter.contextPath,
				dimensionText,
				dimension.$target.type,
				sortOrder,
				selectionVariant,
				visualFilter.customAggregate,
				visualFilter.aggregateProperties,
				visualFilter.UoMHasCustomAggregate,
				parameters,
				visualFilter.filterBarEntityType,
				visualFilter.draftSupported,
				visualFilter.chartMeasure
			);
			interactiveChartProperties.scalefactor = InteractiveChartHelper.getScaleFactor((dataPointAnnotation as DataPoint)?.ValueFormat);
			interactiveChartProperties.uom = InteractiveChartHelper.getUoM(
				chartAnnotation,
				collection,
				true,
				visualFilter.customAggregate,
				visualFilter.aggregateProperties
			);
			interactiveChartProperties.inParameters = CommonHelper.stringifyCustomData(visualFilter.inParameters as object);
			interactiveChartProperties.inParameterFilters = visualFilter.inParameters
				? InteractiveChartHelper.getInParameterFiltersBinding(visualFilter.inParameters)
				: undefined;
			interactiveChartProperties.selectionVariantAnnotation = visualFilter.selectionVariantAnnotation
				? CommonHelper.stringifyCustomData(visualFilter.selectionVariantAnnotation)
				: undefined;
			interactiveChartProperties.stringifiedParameters = CommonHelper.stringifyCustomData(parameters);
			const dimensionContext = visualFilter.metaPath
				?.getModel()
				?.createBindingContext(visualFilter.contextPath.getPath() + "/@" + dimension.fullyQualifiedName.split("@")[1]);
			if (dimensionContext) {
				const dimensionObject = getInvolvedDataModelObjects(dimensionContext, visualFilter.contextPath);
				interactiveChartProperties.chartLabel = getTextBinding(dimensionObject, {});
			}
			interactiveChartProperties.measure = InteractiveChartHelper.getChartValue(visualFilter.chartMeasure);
			interactiveChartProperties.displayedValue = InteractiveChartHelper.getChartDisplayedValue(
				visualFilter.chartMeasure,
				(dataPointAnnotation as DataPoint)?.ValueFormat,
				visualFilter.metaPath?.getPath()
			);
			interactiveChartProperties.color = InteractiveChartHelper.getColorBinding(dataPointAnnotation as DataPoint, dimension);
		}
		return interactiveChartProperties;
	}
};

export default InteractiveChartHelper;
