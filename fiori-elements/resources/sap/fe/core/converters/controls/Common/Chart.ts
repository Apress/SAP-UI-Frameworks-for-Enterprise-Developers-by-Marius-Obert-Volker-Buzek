import type { PropertyPath } from "@sap-ux/vocabularies-types";
import type { AggregatablePropertyType, AggregationMethod } from "@sap-ux/vocabularies-types/vocabularies/Aggregation";
import { AggregationAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Aggregation";
import { Chart, DataFieldAbstractTypes, UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { isDataFieldForActionAbstract } from "sap/fe/core/converters/annotations/DataField";
import type {
	AnnotationAction,
	BaseAction,
	CombinedAction,
	CustomAction,
	OverrideTypeAction
} from "sap/fe/core/converters/controls/Common/Action";
import { getActionsFromManifest } from "sap/fe/core/converters/controls/Common/Action";
import { insertCustomElements, OverrideType } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import { compileExpression, equal, getExpressionFromAnnotation, not } from "sap/fe/core/helpers/BindingToolkit";
import { getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import Core from "sap/ui/core/Core";
import type { ExpandPathType, MetaModelType } from "types/metamodel_types";
import type ConverterContext from "../../ConverterContext";
import { AggregationHelper } from "../../helpers/Aggregation";
import { getChartID, getFilterBarID } from "../../helpers/ID";
import type { ChartManifestConfiguration, ViewPathConfiguration } from "../../ManifestSettings";
import { ActionType, TemplateType, VariantManagementType, VisualizationType } from "../../ManifestSettings";
import type ManifestWrapper from "../../ManifestWrapper";

type ChartApplySupported = {
	$Type: string;
	enableSearch: boolean;
	AggregatableProperties: unknown[];
	GroupableProperties: unknown[];
};
/**
 * @typedef ChartVisualization
 */
export type ChartVisualization = {
	type: VisualizationType.Chart;
	id: string;
	collection: string;
	entityName: string;
	personalization?: string;
	navigationPath: string;
	annotationPath: string;
	filterId?: string;
	vizProperties: string;
	actions: BaseAction[];
	commandActions: Record<string, CustomAction>;
	title: string | undefined;
	autoBindOnInit: boolean | undefined;
	onSegmentedButtonPressed: string;
	visible: string;
	customAgg: object;
	transAgg: object;
	applySupported: ChartApplySupported;
	multiViews?: boolean;
	variantManagement: VariantManagementType;
	selectionPresentationVariantPath?: string;
};

/**
 * Method to retrieve all chart actions from annotations.
 *
 * @param chartAnnotation
 * @param visualizationPath
 * @param converterContext
 * @returns The chart actions from the annotation
 */
function getChartActionsFromAnnotations(
	chartAnnotation: Chart,
	visualizationPath: string,
	converterContext: ConverterContext
): BaseAction[] {
	const chartActions: BaseAction[] = [];
	if (chartAnnotation) {
		const aActions = chartAnnotation.Actions || [];
		aActions.forEach((dataField: DataFieldAbstractTypes) => {
			let chartAction: AnnotationAction | undefined;
			if (isDataFieldForActionAbstract(dataField) && !dataField.Inline && !dataField.Determining) {
				const key = KeyHelper.generateKeyFromDataField(dataField);
				switch (dataField.$Type) {
					case UIAnnotationTypes.DataFieldForAction:
						if (!dataField.ActionTarget?.isBound) {
							chartAction = {
								type: ActionType.DataFieldForAction,
								annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
								key: key,
								visible: getCompileExpressionForAction(dataField, converterContext)
							};
						}
						break;

					case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
						chartAction = {
							type: ActionType.DataFieldForIntentBasedNavigation,
							annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
							key: key,
							visible: getCompileExpressionForAction(dataField, converterContext),
							isNavigable: true
						};
						break;
				}
			}
			if (chartAction) {
				chartActions.push(chartAction);
			}
		});
	}
	return chartActions;
}

export function getChartActions(chartAnnotation: Chart, visualizationPath: string, converterContext: ConverterContext): CombinedAction {
	const aAnnotationActions: BaseAction[] = getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext);
	const manifestActions = getActionsFromManifest(
		converterContext.getManifestControlConfiguration(visualizationPath).actions,
		converterContext,
		aAnnotationActions
	);
	const actionOverwriteConfig: OverrideTypeAction = {
		enabled: OverrideType.overwrite,
		enableOnSelect: OverrideType.overwrite,
		visible: OverrideType.overwrite,
		command: OverrideType.overwrite
	};
	const chartActions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
	return {
		actions: chartActions,
		commandActions: manifestActions.commandActions
	};
}

export function getP13nMode(visualizationPath: string, converterContext: ConverterContext): string | undefined {
	const manifestWrapper: ManifestWrapper = converterContext.getManifestWrapper();
	const chartManifestSettings: ChartManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const variantManagement: VariantManagementType = manifestWrapper.getVariantManagement();
	const aPersonalization: string[] = [];
	// Personalization configured in manifest.
	const personalization: any = chartManifestSettings?.chartSettings?.personalization;
	const isControlVariant = variantManagement === VariantManagementType.Control ? true : false;
	// if personalization is set to false do not show any option
	if ((personalization !== undefined && !personalization) || personalization == "false") {
		return undefined;
	}
	switch (true) {
		case typeof personalization === "object":
			// Specific personalization options enabled in manifest. Use them as is.
			if (personalization.type) {
				aPersonalization.push("Type");
			}
			if (personalization.item) {
				aPersonalization.push("Item");
			}
			if (personalization.sort) {
				aPersonalization.push("Sort");
			}
			if (personalization.filter) {
				aPersonalization.push("Filter");
			}
			return aPersonalization.join(",");
		case isControlVariant:
		case !!personalization:
			// manifest has personalization configured, check if it's true
			// if manifest doesn't have personalization, check for variant management is set to control
			return "Sort,Type,Item,Filter";
		default:
			// if manifest doesn't have personalization, show default options without filter
			return "Sort,Type,Item";
	}
}
export type ChartCustomAggregate = {
	name: string;
	label: string;
	sortable: boolean;
	sortOrder: "both";
	contextDefiningProperty: string[];
};

export type TransAgg = {
	name: string;
	propertyPath: string;
	aggregationMethod: AggregationMethod;
	label: string;
	sortable: boolean;
	sortOrder: "both";
	custom: boolean;
};
// check if annoatation path has SPV and store the path
function checkForSPV(viewConfiguration: ViewPathConfiguration | undefined) {
	return viewConfiguration?.annotationPath?.indexOf(`@${UIAnnotationTerms.SelectionPresentationVariant}`) !== -1
		? viewConfiguration?.annotationPath
		: undefined;
}
/**
 * Create the ChartVisualization configuration that will be used to display a chart using the Chart building block.
 *
 * @param chartAnnotation The targeted chart annotation
 * @param visualizationPath The path of the visualization annotation
 * @param converterContext The converter context
 * @param doNotCheckApplySupported Flag that indicates whether ApplySupported needs to be checked or not
 * @param viewConfiguration
 * @returns The chart visualization based on the annotation
 */
export function createChartVisualization(
	chartAnnotation: Chart,
	visualizationPath: string,
	converterContext: ConverterContext,
	doNotCheckApplySupported?: boolean,
	viewConfiguration?: ViewPathConfiguration
): ChartVisualization {
	const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
	if (!doNotCheckApplySupported && !aggregationHelper.isAnalyticsSupported()) {
		throw new Error("ApplySupported is not added to the annotations");
	}
	const aTransAggregations = aggregationHelper.getTransAggregations();
	const aCustomAggregates = aggregationHelper.getCustomAggregateDefinitions();
	const pageManifestSettings: ManifestWrapper = converterContext.getManifestWrapper();
	const variantManagement: VariantManagementType = pageManifestSettings.getVariantManagement();
	const p13nMode: string | undefined = getP13nMode(visualizationPath, converterContext);
	if (p13nMode === undefined && variantManagement === "Control") {
		Log.warning("Variant Management cannot be enabled when personalization is disabled");
	}
	const mCustomAggregates = {} as any;
	// check if annoatation path has SPV and store the path
	const mSelectionPresentationVariantPath: string | undefined = checkForSPV(viewConfiguration);
	if (aCustomAggregates) {
		const entityType = aggregationHelper.getEntityType();
		for (const customAggregate of aCustomAggregates) {
			const aContextDefiningProperties = customAggregate?.annotations?.Aggregation?.ContextDefiningProperties;
			const qualifier = customAggregate?.qualifier;
			const relatedCustomAggregateProperty = qualifier && entityType.entityProperties.find((property) => property.name === qualifier);
			const label = relatedCustomAggregateProperty && relatedCustomAggregateProperty?.annotations?.Common?.Label?.toString();
			mCustomAggregates[qualifier] = {
				name: qualifier,
				label: label || `Custom Aggregate (${qualifier})`,
				sortable: true,
				sortOrder: "both",
				contextDefiningProperty: aContextDefiningProperties
					? aContextDefiningProperties.map((oCtxDefProperty) => {
							return oCtxDefProperty.value;
					  })
					: []
			};
		}
	}

	const mTransAggregations: Record<string, TransAgg> = {};
	const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
	if (aTransAggregations) {
		for (let i = 0; i < aTransAggregations.length; i++) {
			mTransAggregations[aTransAggregations[i].Name] = {
				name: aTransAggregations[i].Name,
				propertyPath: aTransAggregations[i].AggregatableProperty.valueOf().value,
				aggregationMethod: aTransAggregations[i].AggregationMethod,
				label: aTransAggregations[i]?.annotations?.Common?.Label
					? aTransAggregations[i]?.annotations?.Common?.Label.toString()
					: `${oResourceBundleCore.getText("AGGREGATABLE_PROPERTY")} (${aTransAggregations[i].Name})`,
				sortable: true,
				sortOrder: "both",
				custom: false
			};
		}
	}

	const aAggProps = aggregationHelper.getAggregatableProperties();
	const aGrpProps = aggregationHelper.getGroupableProperties();
	const mApplySupported = {} as ChartApplySupported;
	mApplySupported.$Type = AggregationAnnotationTypes.ApplySupportedType;
	mApplySupported.AggregatableProperties = [];
	mApplySupported.GroupableProperties = [];

	for (let i = 0; aAggProps && i < aAggProps.length; i++) {
		const obj: MetaModelType<AggregatablePropertyType> = {
			$Type: aAggProps[i]?.$Type,
			Property: {
				$PropertyPath: aAggProps[i]?.Property?.value
			}
		};

		mApplySupported.AggregatableProperties.push(obj);
	}

	for (let i = 0; aGrpProps && i < aGrpProps.length; i++) {
		const obj: ExpandPathType<PropertyPath> = { $PropertyPath: aGrpProps[i]?.value };

		mApplySupported.GroupableProperties.push(obj);
	}

	const chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
	let [navigationPropertyPath /*, annotationPath*/] = visualizationPath.split("@");
	if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
		// Drop trailing slash
		navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
	}
	const title = chartAnnotation.Title?.toString() || ""; // read title from chart annotation
	const dataModelPath = converterContext.getDataModelObjectPath();
	const isEntitySet: boolean = navigationPropertyPath.length === 0;
	const entityName: string = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
	const sFilterbarId = isEntitySet ? getFilterBarID(converterContext.getContextPath()) : undefined;
	const oVizProperties = {
		legendGroup: {
			layout: {
				position: "bottom"
			}
		}
	};
	let autoBindOnInit: boolean | undefined;
	if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
		autoBindOnInit = true;
	} else if (
		converterContext.getTemplateType() === TemplateType.ListReport ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage
	) {
		autoBindOnInit = false;
	}
	const hasMultipleVisualizations =
		converterContext.getManifestWrapper().hasMultipleVisualizations() ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
	const onSegmentedButtonPressed = hasMultipleVisualizations ? ".handlers.onSegmentedButtonPressed" : "";
	const visible = hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true";
	const allowedTransformations = aggregationHelper.getAllowedTransformations();
	mApplySupported.enableSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;
	let qualifier = "";
	if (chartAnnotation.fullyQualifiedName.split("#").length > 1) {
		qualifier = chartAnnotation.fullyQualifiedName.split("#")[1];
	}
	return {
		type: VisualizationType.Chart,
		id: qualifier
			? getChartID(isEntitySet ? entityName : navigationPropertyPath, qualifier, VisualizationType.Chart)
			: getChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
		collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
		entityName: entityName,
		personalization: getP13nMode(visualizationPath, converterContext),
		navigationPath: navigationPropertyPath,
		annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
		filterId: sFilterbarId,
		vizProperties: JSON.stringify(oVizProperties),
		actions: chartActions.actions,
		commandActions: chartActions.commandActions,
		title: title,
		autoBindOnInit: autoBindOnInit,
		onSegmentedButtonPressed: onSegmentedButtonPressed,
		visible: visible,
		customAgg: mCustomAggregates,
		transAgg: mTransAggregations,
		applySupported: mApplySupported,
		selectionPresentationVariantPath: mSelectionPresentationVariantPath,
		variantManagement: findVariantManagement(p13nMode, variantManagement)
	};
}
/**
 * Method to determine the variant management.
 *
 * @param p13nMode
 * @param variantManagement
 * @returns The variant management for the chart
 */
function findVariantManagement(p13nMode: string | undefined, variantManagement: VariantManagementType) {
	return variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement;
}

/**
 * Method to get compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation.
 *
 * @param dataField
 * @param converterContext
 * @returns Compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation
 */
function getCompileExpressionForAction(dataField: DataFieldAbstractTypes, converterContext: ConverterContext) {
	return compileExpression(
		not(
			equal(
				getExpressionFromAnnotation(
					dataField.annotations?.UI?.Hidden,
					[],
					undefined,
					converterContext.getRelativeModelPathFunction()
				),
				true
			)
		)
	);
}

export function createBlankChartVisualization(converterContext: ConverterContext): ChartVisualization {
	const hasMultipleVisualizations =
		converterContext.getManifestWrapper().hasMultipleVisualizations() ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
	const dataModelPath = converterContext.getDataModelObjectPath();
	const entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;

	const visualization: ChartVisualization = {
		type: VisualizationType.Chart,
		id: getChartID(entityName, VisualizationType.Chart),
		entityName: entityName,
		title: "",
		collection: "",
		personalization: undefined,
		navigationPath: "",
		annotationPath: "",
		vizProperties: JSON.stringify({
			legendGroup: {
				layout: {
					position: "bottom"
				}
			}
		}),
		actions: [],
		commandActions: {},
		autoBindOnInit: false,
		onSegmentedButtonPressed: "",
		visible: hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true",
		customAgg: {},
		transAgg: {},
		applySupported: {
			$Type: "Org.OData.Aggregation.V1.ApplySupportedType",
			AggregatableProperties: [],
			GroupableProperties: [],
			enableSearch: false
		},
		multiViews: false,
		variantManagement: VariantManagementType.None
	};

	return visualization;
}
