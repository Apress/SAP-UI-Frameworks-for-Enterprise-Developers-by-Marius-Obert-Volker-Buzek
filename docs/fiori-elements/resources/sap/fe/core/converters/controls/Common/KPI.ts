import type { PathAnnotationExpression, Property } from "@sap-ux/vocabularies-types";
import type { SemanticObject } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type {
	Chart,
	CriticalityType,
	DataPoint,
	DataPointType,
	ImprovementDirectionType,
	KPI,
	PresentationVariantType,
	SelectionPresentationVariant,
	SelectionVariantType,
	TrendType
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { IssueCategory, IssueSeverity, IssueType } from "sap/fe/core/converters/helpers/IssueManager";
import type { FilterDefinition } from "sap/fe/core/converters/helpers/SelectionVariantHelper";
import { getFilterDefinitionsFromSelectionVariant } from "sap/fe/core/converters/helpers/SelectionVariantHelper";
import { MessageType } from "sap/fe/core/formatters/TableFormatterTypes";
import { isAnnotationOfType, isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import { AggregationHelper } from "../../helpers/Aggregation";
import { getKPIID } from "../../helpers/ID";
import type { KPIConfiguration } from "../../ManifestSettings";
import { getMessageTypeFromCriticalityType } from "./Criticality";

export type NavigationInfo = {
	semanticObject?: string;
	action?: string;
	unavailableActions?: string[];
	outboundNavigation?: string;
};

export type KPIChartDefinition = {
	chartType: string;
	dimensions: { name: string; label: string; role?: string }[];
	measures: { name: string; label: string; role?: string }[];
	sortOrder?: { name: string; descending: boolean }[];
	maxItems?: number;
};

export type KPIDefinition = {
	id: string;
	entitySet: string;
	datapoint: {
		annotationPath: string;
		propertyPath: string;
		unit?: {
			value: string;
			isPath: boolean;
			isCurrency: boolean;
		};
		criticalityPath?: string;
		criticalityValue?: MessageType;
		criticalityCalculationMode?: ImprovementDirectionType;
		criticalityCalculationThresholds?: (number | undefined | null)[];
		title?: string;
		description?: string;
		trendPath?: string;
		trendValue?: string;
		trendCalculationReferenceValue?: number;
		trendCalculationReferencePath?: string;
		trendCalculationTresholds?: (number | undefined | null)[];
		trendCalculationIsRelative?: boolean;
		targetValue?: number;
		targetPath?: string;
	};
	chart: KPIChartDefinition;
	selectionVariantFilterDefinitions?: FilterDefinition[];
	navigation?: NavigationInfo;
};

const DeviationIndicatorFromTrendType: Record<string, string> = {
	"UI.TrendType/StrongUp": "Up",
	"UI.TrendType/Up": "Up",
	"UI.TrendType/StrongDown": "Down",
	"UI.TrendType/Down": "Down",
	"UI.TrendType/Sideways": "None"
};

const KPIChartTypeFromUI: Record<string, string> = {
	"UI.ChartType/ColumnStacked": "StackedColumn",
	"UI.ChartType/BarStacked": "StackedBar",
	"UI.ChartType/Donut": "Donut",
	"UI.ChartType/Line": "Line",
	"UI.ChartType/Bubble": "bubble",
	"UI.ChartType/Column": "column",
	"UI.ChartType/Bar": "bar",
	"UI.ChartType/VerticalBullet": "vertical_bullet",
	"UI.ChartType/Combination": "combination",
	"UI.ChartType/Scatter": "scatter"
};

function convertKPIChart(chartAnnotation: Chart, presentationVariantAnnotation: PresentationVariantType): KPIChartDefinition | undefined {
	if (chartAnnotation.Measures === undefined) {
		// We need at least 1 measure (but no dimension is allowed, e.g. for bubble chart)
		return undefined;
	}

	const charDimensions = chartAnnotation.Dimensions
		? chartAnnotation.Dimensions.map((propertyPath) => {
				const dimAttribute = chartAnnotation.DimensionAttributes?.find((attribute) => {
					return attribute.Dimension?.value === propertyPath.value;
				});
				return {
					name: propertyPath.value,
					label: propertyPath.$target.annotations.Common?.Label?.toString() || propertyPath.value,
					role: dimAttribute?.Role?.replace("UI.ChartDimensionRoleType/", "")
				};
		  })
		: [];

	const chartMeasures = chartAnnotation.Measures.map((propertyPath) => {
		const measureAttribute = chartAnnotation.MeasureAttributes?.find((attribute) => {
			return attribute.Measure?.value === propertyPath.value;
		});
		return {
			name: propertyPath.value,
			label: propertyPath.$target.annotations.Common?.Label?.toString() || propertyPath.value,
			role: measureAttribute?.Role?.replace("UI.ChartMeasureRoleType/", "")
		};
	});

	return {
		chartType: KPIChartTypeFromUI[chartAnnotation.ChartType] || "Line",
		dimensions: charDimensions,
		measures: chartMeasures,
		sortOrder: presentationVariantAnnotation?.SortOrder?.map((sortOrder) => {
			return { name: sortOrder.Property?.value || "", descending: !!sortOrder.Descending };
		}),
		maxItems: presentationVariantAnnotation?.MaxItems?.valueOf() as number
	};
}

function updateCurrency(datapointAnnotation: DataPointType, kpiDef: KPIDefinition): void {
	const targetValueProperty = datapointAnnotation.Value.$target as Property;
	if (targetValueProperty.annotations.Measures?.ISOCurrency) {
		const currency = targetValueProperty.annotations.Measures?.ISOCurrency;
		if (isPathAnnotationExpression(currency)) {
			kpiDef.datapoint.unit = {
				value: (currency.$target as unknown as Property).name,
				isCurrency: true,
				isPath: true
			};
		} else {
			kpiDef.datapoint.unit = {
				value: currency.toString(),
				isCurrency: true,
				isPath: false
			};
		}
	} else if (targetValueProperty.annotations.Measures?.Unit) {
		const unit = targetValueProperty.annotations.Measures?.Unit;
		if (isPathAnnotationExpression(unit)) {
			kpiDef.datapoint.unit = {
				value: (unit.$target as unknown as Property).name,
				isCurrency: false,
				isPath: true
			};
		} else {
			kpiDef.datapoint.unit = {
				value: unit.toString(),
				isCurrency: false,
				isPath: false
			};
		}
	}
}

function updateCriticality(datapointAnnotation: DataPointType, aggregationHelper: AggregationHelper, kpiDef: KPIDefinition): void {
	if (datapointAnnotation.Criticality) {
		if (typeof datapointAnnotation.Criticality === "object") {
			// Criticality is a path --> check if the corresponding property is aggregatable
			const criticalityProperty = (datapointAnnotation.Criticality as PathAnnotationExpression<Property>).$target;
			if (aggregationHelper.isPropertyAggregatable(criticalityProperty)) {
				kpiDef.datapoint.criticalityPath = (datapointAnnotation.Criticality as PathAnnotationExpression<CriticalityType>).path;
			} else {
				// The property isn't aggregatable --> we ignore it
				kpiDef.datapoint.criticalityValue = MessageType.None;
			}
		} else {
			// Criticality is an enum Value --> get the corresponding static value
			kpiDef.datapoint.criticalityValue = getMessageTypeFromCriticalityType(datapointAnnotation.Criticality);
		}
	} else if (datapointAnnotation.CriticalityCalculation) {
		kpiDef.datapoint.criticalityCalculationMode = datapointAnnotation.CriticalityCalculation.ImprovementDirection;
		kpiDef.datapoint.criticalityCalculationThresholds = [];
		switch (kpiDef.datapoint.criticalityCalculationMode) {
			case "UI.ImprovementDirectionType/Target":
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.DeviationRangeLowValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.ToleranceRangeLowValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.AcceptanceRangeLowValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.AcceptanceRangeHighValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.ToleranceRangeHighValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.DeviationRangeHighValue);
				break;

			case "UI.ImprovementDirectionType/Minimize":
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.AcceptanceRangeHighValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.ToleranceRangeHighValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.DeviationRangeHighValue);
				break;

			case "UI.ImprovementDirectionType/Maximize":
			default:
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.DeviationRangeLowValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.ToleranceRangeLowValue);
				kpiDef.datapoint.criticalityCalculationThresholds.push(datapointAnnotation.CriticalityCalculation.AcceptanceRangeLowValue);
		}
	} else {
		kpiDef.datapoint.criticalityValue = MessageType.None;
	}
}

function updateTrend(datapointAnnotation: DataPointType, aggregationHelper: AggregationHelper, kpiDef: KPIDefinition): void {
	if (datapointAnnotation.Trend) {
		if (typeof datapointAnnotation.Trend === "object") {
			// Trend is a path --> check if the corresponding property is aggregatable
			const trendProperty = (datapointAnnotation.Trend as PathAnnotationExpression<Property>).$target;
			if (aggregationHelper.isPropertyAggregatable(trendProperty)) {
				kpiDef.datapoint.trendPath = (datapointAnnotation.Trend as PathAnnotationExpression<TrendType>).path;
			} else {
				// The property isn't aggregatable --> we ignore it
				kpiDef.datapoint.trendValue = "None";
			}
		} else {
			// Trend is an enum Value --> get the corresponding static value
			kpiDef.datapoint.trendValue = DeviationIndicatorFromTrendType[datapointAnnotation.Trend] || "None";
		}
	} else if (datapointAnnotation.TrendCalculation) {
		kpiDef.datapoint.trendCalculationIsRelative = datapointAnnotation.TrendCalculation.IsRelativeDifference ? true : false;
		if (datapointAnnotation.TrendCalculation.ReferenceValue.$target) {
			// Reference value is a path --> check if the corresponding property is aggregatable
			const referenceProperty = datapointAnnotation.TrendCalculation.ReferenceValue.$target as Property;
			if (aggregationHelper.isPropertyAggregatable(referenceProperty)) {
				kpiDef.datapoint.trendCalculationReferencePath = datapointAnnotation.TrendCalculation.ReferenceValue.path;
			} else {
				// The property isn't aggregatable --> we ignore it and switch back to trend 'None'
				kpiDef.datapoint.trendValue = "None";
			}
		} else {
			// Reference value is a static value
			kpiDef.datapoint.trendCalculationReferenceValue = datapointAnnotation.TrendCalculation.ReferenceValue;
		}
		if (kpiDef.datapoint.trendCalculationReferencePath !== undefined || kpiDef.datapoint.trendCalculationReferenceValue !== undefined) {
			kpiDef.datapoint.trendCalculationTresholds = [
				datapointAnnotation.TrendCalculation.StrongDownDifference.valueOf() as number,
				datapointAnnotation.TrendCalculation.DownDifference.valueOf() as number,
				datapointAnnotation.TrendCalculation.UpDifference.valueOf() as number,
				datapointAnnotation.TrendCalculation.StrongUpDifference.valueOf() as number
			];
		}
	} else {
		kpiDef.datapoint.trendValue = "None";
	}
}

function updateTarget(datapointAnnotation: DataPointType, aggregationHelper: AggregationHelper, kpiDef: KPIDefinition): void {
	if (datapointAnnotation.TargetValue) {
		if (datapointAnnotation.TargetValue.$target) {
			// Target value is a path --> check if the corresponding property is aggregatable (otherwise ignore)
			const targetProperty = datapointAnnotation.TargetValue.$target as Property;
			if (aggregationHelper.isPropertyAggregatable(targetProperty)) {
				kpiDef.datapoint.targetPath = datapointAnnotation.TargetValue.path;
			}
		} else {
			// Target value is a static value
			kpiDef.datapoint.targetValue = datapointAnnotation.TargetValue;
		}
	}
}

function getNavigationInfoFromProperty(property: Property): NavigationInfo | undefined {
	const annotations = property.annotations["Common"] || {};
	// Look for the semanticObject annotation (if any)
	let semanticObjectAnnotation: SemanticObject | undefined;
	Object.keys(annotations).forEach((annotationKey) => {
		const annotation = annotations[annotationKey as keyof typeof annotations];
		if (annotation.term === CommonAnnotationTerms.SemanticObject) {
			if (!annotation.qualifier || !semanticObjectAnnotation) {
				// We always take the annotation without qualifier if there's one, otherwise we take the first one
				semanticObjectAnnotation = annotation;
			}
		}
	});

	if (semanticObjectAnnotation) {
		const result = {
			semanticObject: semanticObjectAnnotation.toString(),
			unavailableActions: []
		};

		// Look for the unavailable actions (if any)
		const annotationKey = Object.keys(annotations).find((key) => {
			return (
				annotations[key as keyof typeof annotations].term === CommonAnnotationTerms.SemanticObjectUnavailableActions &&
				annotations[key as keyof typeof annotations].qualifier === semanticObjectAnnotation?.qualifier
			);
		});
		if (annotationKey) {
			result.unavailableActions = annotations[annotationKey as keyof typeof annotations];
		}

		return result;
	} else {
		return undefined;
	}
}

function createKPIDefinition(kpiName: string, kpiConfig: KPIConfiguration, converterContext: ConverterContext): KPIDefinition | undefined {
	const kpiConverterContext = converterContext.getConverterContextFor(`/${kpiConfig.entitySet}`);
	const aggregationHelper = new AggregationHelper(kpiConverterContext.getEntityType(), kpiConverterContext);

	if (!aggregationHelper.isAnalyticsSupported()) {
		// The entity doesn't support analytical queries
		converterContext
			.getDiagnostics()
			.addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.NO_ANALYTICS + kpiConfig.entitySet);

		return undefined;
	}

	let selectionVariantAnnotation: SelectionVariantType | undefined;
	let datapointAnnotation: DataPointType | undefined;
	let presentationVariantAnnotation: PresentationVariantType | undefined;
	let chartAnnotation: Chart | undefined;
	let navigationInfo: NavigationInfo | undefined;

	// Search for a KPI with the qualifier frmo the manifest
	const aKPIAnnotations = kpiConverterContext.getAnnotationsByTerm("UI", UIAnnotationTerms.KPI) as KPI[];
	const targetKPI = aKPIAnnotations.find((kpi) => {
		return kpi.qualifier === kpiConfig.qualifier;
	});
	if (targetKPI) {
		datapointAnnotation = targetKPI.DataPoint;
		selectionVariantAnnotation = targetKPI.SelectionVariant;
		presentationVariantAnnotation = targetKPI.Detail?.DefaultPresentationVariant;
		chartAnnotation = presentationVariantAnnotation?.Visualizations?.find((viz) => {
			return isAnnotationOfType<Chart>(viz.$target, UIAnnotationTypes.ChartDefinitionType);
		})?.$target as Chart;

		if (targetKPI.Detail?.SemanticObject) {
			navigationInfo = {
				semanticObject: targetKPI.Detail.SemanticObject.toString(),
				action: targetKPI.Detail.Action?.toString(),
				unavailableActions: []
			};
		}
	} else {
		// Fallback: try to find a SPV with the same qualifier
		const aSPVAnnotations = kpiConverterContext.getAnnotationsByTerm(
			"UI",
			UIAnnotationTerms.SelectionPresentationVariant
		) as SelectionPresentationVariant[];
		const targetSPV = aSPVAnnotations.find((spv) => {
			return spv.qualifier === kpiConfig.qualifier;
		});
		if (targetSPV) {
			selectionVariantAnnotation = targetSPV.SelectionVariant;
			presentationVariantAnnotation = targetSPV.PresentationVariant;
			datapointAnnotation = presentationVariantAnnotation?.Visualizations?.find((viz) => {
				return isAnnotationOfType<DataPoint>(viz.$target, UIAnnotationTypes.DataPointType);
			})?.$target as DataPoint;
			chartAnnotation = presentationVariantAnnotation?.Visualizations?.find((viz) => {
				return isAnnotationOfType<Chart>(viz.$target, UIAnnotationTypes.ChartDefinitionType);
			})?.$target as Chart;
		} else {
			// Couldn't find a KPI or a SPV annotation with the qualifier from the manifest
			converterContext
				.getDiagnostics()
				.addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.KPI_NOT_FOUND + kpiConfig.qualifier);

			return undefined;
		}
	}

	if (!presentationVariantAnnotation || !datapointAnnotation || !chartAnnotation) {
		// Couldn't find a chart or datapoint definition
		converterContext
			.getDiagnostics()
			.addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.KPI_DETAIL_NOT_FOUND + kpiConfig.qualifier);

		return undefined;
	}

	const datapointProperty = datapointAnnotation.Value.$target as Property;
	if (!aggregationHelper.isPropertyAggregatable(datapointProperty)) {
		// The main property of the KPI is not aggregatable --> We can't calculate its value so we ignore the KPI
		converterContext
			.getDiagnostics()
			.addIssue(
				IssueCategory.Annotation,
				IssueSeverity.Medium,
				IssueType.KPI_ISSUES.MAIN_PROPERTY_NOT_AGGREGATABLE + kpiConfig.qualifier
			);
		return undefined;
	}

	// Chart definition
	const chartDef = convertKPIChart(chartAnnotation, presentationVariantAnnotation);
	if (!chartDef) {
		return undefined;
	}

	const kpiDef: KPIDefinition = {
		id: getKPIID(kpiName),
		entitySet: kpiConfig.entitySet,
		datapoint: {
			propertyPath: datapointAnnotation.Value.path,
			annotationPath: kpiConverterContext.getEntitySetBasedAnnotationPath(datapointAnnotation.fullyQualifiedName),
			title: datapointAnnotation.Title?.toString(),
			description: datapointAnnotation.Description?.toString()
		},
		selectionVariantFilterDefinitions: selectionVariantAnnotation
			? getFilterDefinitionsFromSelectionVariant(selectionVariantAnnotation)
			: undefined,
		chart: chartDef
	};

	// Navigation
	if (!navigationInfo) {
		// No navigationInfo was found in the KPI annotation --> try the outbound navigation from the manifest
		if (kpiConfig.detailNavigation) {
			navigationInfo = {
				outboundNavigation: kpiConfig.detailNavigation
			};
		} else {
			// No outbound navigation in the manifest --> try the semantic object on the Datapoint value
			navigationInfo = getNavigationInfoFromProperty(datapointProperty);
		}
	}
	if (navigationInfo) {
		kpiDef.navigation = navigationInfo;
	}

	updateCurrency(datapointAnnotation, kpiDef);
	updateCriticality(datapointAnnotation, aggregationHelper, kpiDef);
	updateTrend(datapointAnnotation, aggregationHelper, kpiDef);
	updateTarget(datapointAnnotation, aggregationHelper, kpiDef);

	return kpiDef;
}

/**
 * Creates the KPI definitions from the manifest and the annotations.
 *
 * @param converterContext The converter context for the page
 * @returns Returns an array of KPI definitions
 */
export function getKPIDefinitions(converterContext: ConverterContext): KPIDefinition[] {
	const kpiConfigs = converterContext.getManifestWrapper().getKPIConfiguration(),
		kpiDefs: KPIDefinition[] = [];

	Object.keys(kpiConfigs).forEach((kpiName) => {
		const oDef = createKPIDefinition(kpiName, kpiConfigs[kpiName], converterContext);
		if (oDef) {
			kpiDefs.push(oDef);
		}
	});

	return kpiDefs;
}
