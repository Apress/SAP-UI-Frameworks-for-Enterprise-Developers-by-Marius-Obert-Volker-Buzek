import type { PrimitiveType } from "@sap-ux/vocabularies-types";
import { AnalyticsAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Analytics";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CoreAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Core";
import type {
	Chart,
	ChartMeasureAttributeType,
	ChartMeasureRoleType,
	DataFieldAbstractTypes,
	DataFieldForAction,
	DataPoint
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import uid from "sap/base/util/uid";
import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import { blockAggregation, blockAttribute, blockEvent, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import { escapeXMLAttributeValue, xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import { isDataModelObjectPathForActionWithDialog } from "sap/fe/core/converters/annotations/DataField";
import type { AnnotationAction, BaseAction, CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import type { ChartVisualization } from "sap/fe/core/converters/controls/Common/Chart";
import type { VisualizationAndPath } from "sap/fe/core/converters/controls/Common/DataVisualization";
import {
	getDataVisualizationConfiguration,
	getVisualizationsFromPresentationVariant
} from "sap/fe/core/converters/controls/Common/DataVisualization";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import { AggregationHelper } from "sap/fe/core/converters/helpers/Aggregation";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import CommonHelper from "sap/fe/macros/CommonHelper";
import { TitleLevel } from "sap/ui/core/library";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import ActionHelper from "../internal/helpers/ActionHelper";
import DefaultActionHandler from "../internal/helpers/DefaultActionHandler";
import type { Action, ActionGroup } from "./ChartAPI";
import ChartHelper from "./ChartHelper";

const measureRole: { [key: string]: string } = {
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
};

type ExtendedActionGroup = ActionGroup & { menuContentActions?: Record<string, Action> };
type ActionOrActionGroup = Record<string, Action | ExtendedActionGroup>;
type CustomAndAction = CustomAction & (Action | ActionGroup);
type CustomToolbarMenuAction = {
	id: string;
	text: string | undefined;
	visible: string | undefined;
	enabled: string | boolean;
	useDefaultActionOnly?: boolean;
	buttonMode?: string;
	defaultAction?: string;
	actions?: CustomAction;
};

enum personalizationValues {
	Sort = "Sort",
	Type = "Type",
	Item = "Item",
	Filter = "Filter"
}

/**
 * Build actions and action groups with all properties for chart visualization.
 *
 * @param childAction XML node corresponding to actions
 * @returns Prepared action object
 */
const setCustomActionProperties = function (childAction: Element) {
	let menuContentActions = null;
	const action = childAction;
	let menuActions: ActionGroup[] = [];
	const actionKey = action.getAttribute("key")?.replace("InlineXML_", "");
	if (action.children.length && action.localName === "ActionGroup" && action.namespaceURI === "sap.fe.macros") {
		const actionsToAdd = Array.prototype.slice.apply(action.children);
		let actionIdx = 0;
		menuContentActions = actionsToAdd.reduce((customAction, actToAdd) => {
			const actionKeyAdd = actToAdd.getAttribute("key")?.replace("InlineXML_", "") || actionKey + "_Menu_" + actionIdx;
			const curOutObject = {
				key: actionKeyAdd,
				text: actToAdd.getAttribute("text"),
				__noWrap: true,
				press: actToAdd.getAttribute("press"),
				requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
				enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
			};
			customAction[curOutObject.key] = curOutObject;
			actionIdx++;
			return customAction;
		}, {});
		menuActions = Object.values(menuContentActions)
			.slice(-action.children.length)
			.map(function (menuItem: any) {
				return menuItem.key;
			});
	}
	return {
		key: actionKey,
		text: action.getAttribute("text"),
		position: {
			placement: action.getAttribute("placement"),
			anchor: action.getAttribute("anchor")
		},
		__noWrap: true,
		press: action.getAttribute("press"),
		requiresSelection: action.getAttribute("requiresSelection") === "true",
		enabled: action.getAttribute("enabled") === null ? true : action.getAttribute("enabled"),
		menu: menuActions.length ? menuActions : null,
		menuContentActions: menuContentActions
	};
};

type MeasureType = {
	id?: string;
	key?: string;
	role?: string;
	propertyPath?: string;
	aggregationMethod?: string;
	label?: string | BindingToolkitExpression<PrimitiveType>;
	value?: string;
	dataPoint?: string;
	name?: string;
};

type DimensionType = {
	id?: string;
	key?: string;
	role?: string;
	propertyPath?: string;
	label?: string | BindingToolkitExpression<PrimitiveType>;
	value?: string;
};

type CommandAction = {
	actionContext: Context;
	onExecuteAction: string;
	onExecuteIBN?: string;
	onExecuteManifest: CompiledBindingToolkitExpression;
};

type ToolBarAction = {
	unittestid: string;
	id?: string;
	label: string;
	ariaHasPopup?: string;
	press: string;
	enabled: string | boolean;
	visible: string | boolean;
};

type ChartCustomData = {
	targetCollectionPath: string;
	entitySet: string;
	entityType: string;
	operationAvailableMap: string;
	multiSelectDisabledActions: string;
	segmentedButtonId: string;
	customAgg: string;
	transAgg: string;
	applySupported: string;
	vizProperties: string;
	draftSupported?: boolean;
	multiViews?: boolean;
	selectionPresentationVariantPath?: string;
};

/**
 *
 * Building block for creating a Chart based on the metadata provided by OData V4.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Chart id="MyChart" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
 * </pre>
 *
 * Building block for creating a Chart based on the metadata provided by OData V4.
 *
 * @private
 * @experimental
 */
@defineBuildingBlock({
	name: "Chart",
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros"
})
export default class ChartBlock extends BuildingBlockBase {
	/**
	 * ID of the chart
	 */
	@blockAttribute({ type: "string", isPublic: true })
	id?: string;

	@blockAttribute({
		type: "object"
	})
	chartDefinition?: ChartVisualization;

	/**
	 * Metadata path to the presentation context (UI.Chart with or without a qualifier)
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	metaPath!: Context; // We require metaPath to be there even though it is not formally required

	/**
	 * Metadata path to the entitySet or navigationProperty
	 */
	@blockAttribute({
		type: "sap.ui.model.Context",
		isPublic: true
	})
	contextPath!: Context; // We require contextPath to be there even though it is not formally required

	/**
	 * The height of the chart
	 */
	@blockAttribute({
		type: "string"
	})
	height: string = "100%";

	/**
	 * The width of the chart
	 */
	@blockAttribute({
		type: "string"
	})
	width: string = "100%";

	/**
	 * Specifies the header text that is shown in the chart
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	header?: string;

	/**
	 * Specifies the visibility of the chart header
	 */
	@blockAttribute({
		type: "boolean",
		isPublic: true
	})
	headerVisible?: boolean;

	/**
	 * Defines the "aria-level" of the chart header
	 */
	@blockAttribute({
		type: "sap.ui.core.TitleLevel",
		isPublic: true
	})
	headerLevel: TitleLevel = TitleLevel.Auto;

	/**
	 * Specifies the selection mode
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	selectionMode: string = "MULTIPLE";

	/**
	 * Parameter which sets the personalization of the chart
	 */
	@blockAttribute({
		type: "string|boolean",
		isPublic: true
	})
	personalization?: string | boolean;

	/**
	 * Parameter which sets the ID of the filterbar associating it to the chart
	 */
	@blockAttribute({
		type: "string",
		isPublic: true
	})
	filterBar?: string;

	/**
	 * 	Parameter which sets the noDataText for the chart
	 */
	@blockAttribute({ type: "string" })
	noDataText?: string;

	/**
	 * Parameter which sets the chart delegate for the chart
	 */
	@blockAttribute({ type: "string" })
	chartDelegate?: string;

	/**
	 * Parameter which sets the visualization properties for the chart
	 */
	@blockAttribute({ type: "string" })
	vizProperties?: string;

	/**
	 * The actions to be shown in the action area of the chart
	 */
	@blockAttribute({ type: "sap.ui.model.Context" })
	chartActions?: Context;

	@blockAttribute({ type: "boolean" })
	draftSupported?: boolean;

	@blockAttribute({ type: "boolean" })
	autoBindOnInit?: boolean;

	@blockAttribute({ type: "string" })
	visible?: string;

	@blockAttribute({ type: "string" })
	navigationPath?: string;

	@blockAttribute({ type: "string" })
	filter?: string;

	@blockAttribute({ type: "string" })
	measures?: Context;

	@blockAttribute({
		type: "boolean"
	})
	_applyIdToContent: boolean = false;

	@blockAttribute({ type: "string", isPublic: true })
	variantManagement?: string;

	@blockEvent()
	variantSelected?: Function;

	@blockEvent()
	variantSaved?: Function;

	/**
	 * The XML and manifest actions to be shown in the action area of the chart
	 */
	@blockAggregation({
		type: "sap.fe.macros.internal.chart.Action | sap.fe.macros.internal.chart.ActionGroup",
		isPublic: true,
		processAggregations: setCustomActionProperties
	})
	actions?: ActionOrActionGroup;

	/**
	 * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and
	 * the Boolean flag that indicates whether data is selected or deselected
	 */
	@blockEvent()
	selectionChange?: Function;

	/**
	 * Event handler to react to the stateChange event of the chart.
	 */
	@blockEvent()
	stateChange?: Function;

	useCondensedLayout!: boolean;

	_apiId!: string | undefined;

	_contentId: string | undefined;

	_commandActions: CommandAction[] = [];

	_chartType: string | undefined;

	_sortCondtions: string | undefined;

	_customData: ChartCustomData;

	_actions: string;

	_chartContext: Context;

	_chart: Chart;

	constructor(props: PropertiesOf<ChartBlock>, configuration: any, settings: any) {
		super(props, configuration, settings);
		const contextObjectPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
		const initialConverterContext = this.getConverterContext(contextObjectPath, /*this.contextPath*/ undefined, settings);
		const visualizationPath = ChartBlock.getVisualizationPath(this, contextObjectPath, initialConverterContext);
		const extraParams = ChartBlock.getExtraParams(this, visualizationPath);
		const converterContext = this.getConverterContext(contextObjectPath, /*this.contextPath*/ undefined, settings, extraParams);

		const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
		this._chartContext = ChartHelper.getUiChart(this.metaPath)! as Context;
		this._chart = this._chartContext.getObject() as Chart;

		if (this._applyIdToContent ?? false) {
			this._apiId = this.id + "::Chart";
			this._contentId = this.id;
		} else {
			this._apiId = this.id;
			this._contentId = this.getContentId(this.id!);
		}

		if (this._chart) {
			this.chartDefinition =
				this.chartDefinition === undefined || this.chartDefinition === null
					? this.createChartDefinition(converterContext, contextObjectPath, this._chartContext.getPath())
					: this.chartDefinition;

			// API Properties
			this.navigationPath = this.chartDefinition.navigationPath;
			this.autoBindOnInit = this.chartDefinition.autoBindOnInit;
			this.vizProperties = this.chartDefinition.vizProperties;
			this.chartActions = this.createBindingContext(this.chartDefinition.actions, settings);
			this.selectionMode = this.selectionMode.toUpperCase();
			if (this.filterBar) {
				this.filter = this.getContentId(this.filterBar);
			} else if (!this.filter) {
				this.filter = this.chartDefinition.filterId;
			}
			this.checkPersonalizationInChartProperties(this);
			this.variantManagement = this.getVariantManagement(this, this.chartDefinition);
			this.visible = this.chartDefinition.visible;
			let contextPath = this.contextPath.getPath();
			contextPath = contextPath[contextPath.length - 1] === "/" ? contextPath.slice(0, -1) : contextPath;
			this.draftSupported = ModelHelper.isDraftSupported(settings.models.metaModel, contextPath);
			this._chartType = ChartHelper.formatChartType(this._chart.ChartType);

			const operationAvailableMap = ChartHelper.getOperationAvailableMap(this._chart, {
				context: this._chartContext
			});

			if (Object.keys(this.chartDefinition?.commandActions as object).length > 0) {
				Object.keys(this.chartDefinition?.commandActions as object).forEach((key: string) => {
					const action = this.chartDefinition?.commandActions[key];
					const actionContext = this.createBindingContext(action!, settings);
					const dataFieldContext =
						action!.annotationPath && this.contextPath.getModel().createBindingContext(action!.annotationPath);
					const dataField = dataFieldContext && dataFieldContext.getObject();
					const chartOperationAvailableMap = escapeXMLAttributeValue(operationAvailableMap);
					this.pushActionCommand(actionContext, dataField, chartOperationAvailableMap, action!);
				});
			}
			this.measures = this.getChartMeasures(this, aggregationHelper);
			const presentationPath = CommonHelper.createPresentationPathContext(this.metaPath);
			this._sortCondtions = ChartHelper.getSortConditions(
				this.metaPath,
				this.metaPath.getObject(),
				presentationPath.getPath(),
				this.chartDefinition.applySupported
			);
			const chartActionsContext = this.contextPath
				.getModel()
				.createBindingContext(this._chartContext.getPath() + "/Actions", this._chart.Actions as unknown as Context);
			const contextPathContext = this.contextPath.getModel().createBindingContext(this.contextPath.getPath(), this.contextPath);
			const contextPathPath = CommonHelper.getContextPath(this.contextPath, { context: contextPathContext });
			const targetCollectionPath = CommonHelper.getTargetCollectionPath(this.contextPath);
			const targetCollectionPathContext = this.contextPath.getModel().createBindingContext(targetCollectionPath, this.contextPath)!;
			const actionsObject = contextObjectPath.convertedTypes.resolvePath(chartActionsContext.getPath())?.target;

			this._customData = {
				targetCollectionPath: contextPathPath,
				entitySet:
					typeof targetCollectionPathContext.getObject() === "string"
						? targetCollectionPathContext.getObject()
						: targetCollectionPathContext.getObject("@sapui.name"),
				entityType: contextPathPath + "/",
				operationAvailableMap: CommonHelper.stringifyCustomData(JSON.parse(operationAvailableMap)),
				multiSelectDisabledActions: ActionHelper.getMultiSelectDisabledActions(actionsObject as DataFieldAbstractTypes[]) + "",
				segmentedButtonId: generate([this.id, "SegmentedButton", "TemplateContentView"]),
				customAgg: CommonHelper.stringifyCustomData(this.chartDefinition?.customAgg),
				transAgg: CommonHelper.stringifyCustomData(this.chartDefinition?.transAgg),
				applySupported: CommonHelper.stringifyCustomData(this.chartDefinition?.applySupported),
				vizProperties: this.vizProperties,
				draftSupported: this.draftSupported,
				multiViews: this.chartDefinition?.multiViews,
				selectionPresentationVariantPath: CommonHelper.stringifyCustomData({
					data: this.chartDefinition?.selectionPresentationVariantPath
				})
			};
			this._actions = this.chartActions ? this.getToolbarActions(this._chartContext) : xml``;
		} else {
			// fallback to display empty chart
			this.autoBindOnInit = false;
			this.visible = "true";
			this.navigationPath = "";
			this._actions = "";
			this._customData = {
				targetCollectionPath: "",
				entitySet: "",
				entityType: "",
				operationAvailableMap: "",
				multiSelectDisabledActions: "",
				segmentedButtonId: "",
				customAgg: "",
				transAgg: "",
				applySupported: "",
				vizProperties: ""
			};
		}
	}

	createChartDefinition = (
		converterContext: ConverterContext,
		contextObjectPath: DataModelObjectPath,
		controlPath: string
	): ChartVisualization => {
		let visualizationPath = getContextRelativeTargetObjectPath(contextObjectPath);
		if (this.metaPath?.getObject()?.$Type === UIAnnotationTypes.PresentationVariantType) {
			const visualizations = this.metaPath.getObject().Visualizations;
			visualizationPath = ChartBlock.checkChartVisualizationPath(visualizations, visualizationPath);
		}

		// fallback to default Chart if visualizationPath is missing or visualizationPath is not found in control (in case of PresentationVariant)
		if (!visualizationPath || controlPath.indexOf(visualizationPath) === -1) {
			visualizationPath = `@${UIAnnotationTerms.Chart}`;
		}

		const visualizationDefinition = getDataVisualizationConfiguration(
			visualizationPath,
			this.useCondensedLayout,
			converterContext,
			undefined,
			undefined,
			undefined,
			true
		);
		return visualizationDefinition.visualizations[0] as ChartVisualization;
	};

	static checkChartVisualizationPath = (visualizations: Record<string, string>[], visualizationPath: string | undefined) => {
		visualizations.forEach(function (visualization: Record<string, string>) {
			if (visualization.$AnnotationPath.indexOf(`@${UIAnnotationTerms.Chart}`) > -1) {
				visualizationPath = visualization.$AnnotationPath;
			}
		});
		return visualizationPath;
	};

	getContentId(macroId: string) {
		return `${macroId}-content`;
	}

	static getExtraParams(props: PropertiesOf<ChartBlock>, visualizationPath: string | undefined) {
		const extraParams: Record<string, object> = {};
		if (props.actions) {
			Object.values(props.actions)?.forEach((item) => {
				props.actions = { ...(props.actions as ActionOrActionGroup), ...(item as ExtendedActionGroup).menuContentActions };
				delete (item as ExtendedActionGroup).menuContentActions;
			});
		}
		if (visualizationPath) {
			extraParams[visualizationPath] = {
				actions: props.actions
			};
		}
		return extraParams;
	}

	createBindingContext = function (data: object | BaseAction[] | CustomAction, settings: any) {
		const contextPath = `/${uid()}`;
		settings.models.converterContext.setProperty(contextPath, data);
		return settings.models.converterContext.createBindingContext(contextPath);
	};

	getChartMeasures = (props: any, aggregationHelper: AggregationHelper): Context => {
		const chartAnnotationPath = props.chartDefinition.annotationPath.split("/");
		// this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
		const annotationPath = chartAnnotationPath
			.filter(function (item: object, pos: number) {
				return chartAnnotationPath.indexOf(item) == pos;
			})
			.toString()
			.replaceAll(",", "/");
		const oChart = getInvolvedDataModelObjects(
			this.metaPath.getModel().createBindingContext(annotationPath),
			this.contextPath
		).targetObject;
		const aggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
		let measures: MeasureType[] = [];
		const annoPath = props.metaPath.getPath();
		const aggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
		const chartMeasures = oChart.Measures ? oChart.Measures : [];
		const chartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
		//check if there are measures pointing to aggregatedproperties
		const transAggInMeasures = aggregatedProperties[0]
			? aggregatedProperties[0].filter(function (properties: Record<string, string>) {
					return chartMeasures.some(function (propertyMeasureType: MeasureType) {
						return properties.Name === propertyMeasureType.value;
					});
			  })
			: undefined;
		const entitySetPath = annoPath.replace(
			/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/,
			""
		);
		const transAggregations = props.chartDefinition.transAgg;
		const customAggregations = props.chartDefinition.customAgg;
		// intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
		if (aggregatedProperty.length > 0 && !chartDynamicMeasures && transAggInMeasures.length > 0) {
			Log.warning(
				"The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly."
			);
		}
		const isCustomAggregateIsMeasure = chartMeasures.some((oChartMeasure: MeasureType) => {
			const oCustomAggMeasure = this.getCustomAggMeasure(customAggregations, oChartMeasure);
			return !!oCustomAggMeasure;
		});
		if (aggregatedProperty.length > 0 && !chartDynamicMeasures.length && !isCustomAggregateIsMeasure) {
			throw new Error("Please configure DynamicMeasures for the chart");
		}
		if (aggregatedProperty.length > 0) {
			for (const dynamicMeasure of chartDynamicMeasures) {
				measures = this.getDynamicMeasures(measures, dynamicMeasure, entitySetPath, oChart);
			}
		}
		for (const chartMeasure of chartMeasures) {
			const key = chartMeasure.value;
			const customAggMeasure = this.getCustomAggMeasure(customAggregations, chartMeasure);
			const measureType: MeasureType = {};
			if (customAggMeasure) {
				measures = this.setCustomAggMeasure(measures, measureType, customAggMeasure, key);
				//if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
			} else if (aggregatedProperty.length === 0 && transAggregations[key]) {
				measures = this.setTransAggMeasure(measures, measureType, transAggregations, key);
			}
			this.setChartMeasureAttributes(this._chart.MeasureAttributes, entitySetPath, measureType);
		}
		const measuresModel: JSONModel = new JSONModel(measures);
		(measuresModel as any).$$valueAsPromise = true;
		return measuresModel.createBindingContext("/") as Context;
	};

	setCustomAggMeasure = (measures: MeasureType[], measure: MeasureType, customAggMeasure: MeasureType, key: string) => {
		if (key.indexOf("/") > -1) {
			Log.error(`$expand is not yet supported. Measure: ${key} from an association cannot be used`);
		}
		measure.key = customAggMeasure.value;
		measure.role = "axis1";
		measure.label = customAggMeasure.label;
		measure.propertyPath = customAggMeasure.value;
		measures.push(measure);
		return measures;
	};

	setTransAggMeasure = (measures: MeasureType[], measure: MeasureType, transAggregations: Record<string, MeasureType>, key: string) => {
		const transAggMeasure = transAggregations[key];
		measure.key = transAggMeasure.name;
		measure.role = "axis1";
		measure.propertyPath = key;
		measure.aggregationMethod = transAggMeasure.aggregationMethod;
		measure.label = transAggMeasure.label || measure.label;
		measures.push(measure);
		return measures;
	};

	getDynamicMeasures = (
		measures: MeasureType[],
		chartDynamicMeasure: MeasureType,
		entitySetPath: string,
		chart: Chart
	): MeasureType[] => {
		const key = chartDynamicMeasure.value || "";
		const aggregatedProperty = getInvolvedDataModelObjects(
			this.metaPath.getModel().createBindingContext(entitySetPath + key),
			this.contextPath
		).targetObject;
		if (key.indexOf("/") > -1) {
			Log.error(`$expand is not yet supported. Measure: ${key} from an association cannot be used`);
			// check if the annotation path is wrong
		} else if (!aggregatedProperty) {
			throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${chartDynamicMeasure.value}`);
			// check if the path starts with @
		} else if (chartDynamicMeasure.value?.startsWith(`@${AnalyticsAnnotationTerms.AggregatedProperty}`) === null) {
			throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${chartDynamicMeasure.value}`);
		} else {
			// check if AggregatedProperty is defined in given DynamicMeasure
			const dynamicMeasure: MeasureType = {
				key: aggregatedProperty.Name,
				role: "axis1"
			};
			dynamicMeasure.propertyPath = aggregatedProperty.AggregatableProperty.value;
			dynamicMeasure.aggregationMethod = aggregatedProperty.AggregationMethod;
			dynamicMeasure.label = resolveBindingString(
				aggregatedProperty.annotations.Common?.Label ||
					getInvolvedDataModelObjects(
						this.metaPath
							.getModel()
							.createBindingContext(entitySetPath + dynamicMeasure.propertyPath + `@${CommonAnnotationTerms.Label}`)!,
						this.contextPath
					).targetObject
			);
			this.setChartMeasureAttributes(chart.MeasureAttributes, entitySetPath, dynamicMeasure);
			measures.push(dynamicMeasure);
		}
		return measures;
	};

	getCustomAggMeasure = (customAggregations: Record<string, MeasureType | undefined>, measure: MeasureType) => {
		if (measure.value && customAggregations[measure.value]) {
			measure.label = customAggregations[measure.value]?.label;
			return measure;
		}
		return null;
	};

	setChartMeasureAttributes = (measureAttributes: ChartMeasureAttributeType[], entitySetPath: string, measure: MeasureType) => {
		if (measureAttributes?.length) {
			for (const measureAttribute of measureAttributes) {
				this._setChartMeasureAttribute(measureAttribute, entitySetPath, measure);
			}
		}
	};

	_setChartMeasureAttribute = (measureAttribute: ChartMeasureAttributeType, entitySetPath: string, measure: MeasureType) => {
		const path = measureAttribute.DynamicMeasure ? measureAttribute?.DynamicMeasure?.value : measureAttribute?.Measure?.value;
		const measureAttributeDataPoint = measureAttribute.DataPoint ? measureAttribute?.DataPoint?.value : null;
		const role = measureAttribute.Role;
		const dataPoint =
			measureAttributeDataPoint &&
			getInvolvedDataModelObjects(
				this.metaPath.getModel().createBindingContext(entitySetPath + measureAttributeDataPoint),
				this.contextPath
			).targetObject;
		if (measure.key === path) {
			this.setMeasureRole(measure, role);
			//still to add data point, but UI5 Chart API is missing
			this.setMeasureDataPoint(measure, dataPoint);
		}
	};

	/**
	 * Format the data point as a JSON object.
	 *
	 * @param oDataPointAnno
	 * @returns The formatted json object
	 */
	createDataPointProperty(oDataPointAnno: any) {
		const oDataPoint: any = {};

		if (oDataPointAnno.TargetValue) {
			oDataPoint.targetValue = oDataPointAnno.TargetValue.$Path;
		}

		if (oDataPointAnno.ForeCastValue) {
			oDataPoint.foreCastValue = oDataPointAnno.ForeCastValue.$Path;
		}

		let oCriticality = null;
		if (oDataPointAnno.Criticality) {
			if (oDataPointAnno.Criticality.$Path) {
				//will be an aggregated property or custom aggregate
				oCriticality = {
					Calculated: oDataPointAnno.Criticality.$Path
				};
			} else {
				oCriticality = {
					Static: oDataPointAnno.Criticality.$EnumMember.replace("com.sap.vocabularies.UI.v1.CriticalityType/", "")
				};
			}
		} else if (oDataPointAnno.CriticalityCalculation) {
			const oThresholds = {};
			const bConstant = this.buildThresholds(oThresholds, oDataPointAnno.CriticalityCalculation);

			if (bConstant) {
				oCriticality = {
					ConstantThresholds: oThresholds
				};
			} else {
				oCriticality = {
					DynamicThresholds: oThresholds
				};
			}
		}

		if (oCriticality) {
			oDataPoint.criticality = oCriticality;
		}

		return oDataPoint;
	}

	/**
	 * Checks whether the thresholds are dynamic or constant.
	 *
	 * @param oThresholds The threshold skeleton
	 * @param oCriticalityCalculation The UI.DataPoint.CriticalityCalculation annotation
	 * @returns `true` if the threshold should be supplied as ConstantThresholds, <code>false</code> if the threshold should
	 * be supplied as DynamicThresholds
	 * @private
	 */
	buildThresholds(oThresholds: any, oCriticalityCalculation: any) {
		const aKeys = [
			"AcceptanceRangeLowValue",
			"AcceptanceRangeHighValue",
			"ToleranceRangeLowValue",
			"ToleranceRangeHighValue",
			"DeviationRangeLowValue",
			"DeviationRangeHighValue"
		];
		let bConstant = true,
			sKey,
			i,
			j;

		oThresholds.ImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember.replace(
			"com.sap.vocabularies.UI.v1.ImprovementDirectionType/",
			""
		);

		const oDynamicThresholds: any = {
			oneSupplied: false,
			usedMeasures: []
			// combination to check whether at least one is supplied
		};
		const oConstantThresholds: any = {
			oneSupplied: false
			// combination to check whether at least one is supplied
		};

		for (i = 0; i < aKeys.length; i++) {
			sKey = aKeys[i];
			oDynamicThresholds[sKey] = oCriticalityCalculation[sKey] ? oCriticalityCalculation[sKey].$Path : undefined;
			oDynamicThresholds.oneSupplied = oDynamicThresholds.oneSupplied || oDynamicThresholds[sKey];

			if (!oDynamicThresholds.oneSupplied) {
				// only consider in case no dynamic threshold is supplied
				oConstantThresholds[sKey] = oCriticalityCalculation[sKey];
				oConstantThresholds.oneSupplied = oConstantThresholds.oneSupplied || oConstantThresholds[sKey];
			} else if (oDynamicThresholds[sKey]) {
				oDynamicThresholds.usedMeasures.push(oDynamicThresholds[sKey]);
			}
		}

		// dynamic definition shall overrule constant definition
		if (oDynamicThresholds.oneSupplied) {
			bConstant = false;

			for (i = 0; i < aKeys.length; i++) {
				if (oDynamicThresholds[aKeys[i]]) {
					oThresholds[aKeys[i]] = oDynamicThresholds[aKeys[i]];
				}
			}
			oThresholds.usedMeasures = oDynamicThresholds.usedMeasures;
		} else {
			let oAggregationLevel: any;
			oThresholds.AggregationLevels = [];

			// check if at least one static value is supplied
			if (oConstantThresholds.oneSupplied) {
				// add one entry in the aggregation level
				oAggregationLevel = {
					VisibleDimensions: null
				};

				for (i = 0; i < aKeys.length; i++) {
					if (oConstantThresholds[aKeys[i]]) {
						oAggregationLevel[aKeys[i]] = oConstantThresholds[aKeys[i]];
					}
				}

				oThresholds.AggregationLevels.push(oAggregationLevel);
			}

			// further check for ConstantThresholds
			if (oCriticalityCalculation.ConstantThresholds && oCriticalityCalculation.ConstantThresholds.length > 0) {
				for (i = 0; i < oCriticalityCalculation.ConstantThresholds.length; i++) {
					const oAggregationLevelInfo = oCriticalityCalculation.ConstantThresholds[i];

					const aVisibleDimensions: any = oAggregationLevelInfo.AggregationLevel ? [] : null;

					if (oAggregationLevelInfo.AggregationLevel && oAggregationLevelInfo.AggregationLevel.length > 0) {
						for (j = 0; j < oAggregationLevelInfo.AggregationLevel.length; j++) {
							aVisibleDimensions.push(oAggregationLevelInfo.AggregationLevel[j].$PropertyPath);
						}
					}

					oAggregationLevel = {
						VisibleDimensions: aVisibleDimensions
					};

					for (j = 0; j < aKeys.length; j++) {
						const nValue = oAggregationLevelInfo[aKeys[j]];
						if (nValue) {
							oAggregationLevel[aKeys[j]] = nValue;
						}
					}

					oThresholds.AggregationLevels.push(oAggregationLevel);
				}
			}
		}

		return bConstant;
	}

	setMeasureDataPoint = (measure: MeasureType, dataPoint: DataPoint | undefined) => {
		if (dataPoint && dataPoint.Value.$Path == measure.key) {
			measure.dataPoint = ChartHelper.formatJSONToString(this.createDataPointProperty(dataPoint)) || "";
		}
	};

	setMeasureRole = (measure: MeasureType, role: ChartMeasureRoleType | undefined) => {
		if (role) {
			const index = (role as any).$EnumMember;
			measure.role = measureRole[index];
		}
	};

	getDependents = (chartContext: Context) => {
		if (this._commandActions.length > 0) {
			return this._commandActions.map((commandAction: CommandAction) => {
				return this.getActionCommand(commandAction, chartContext);
			});
		}
		return xml``;
	};

	/**
	 *
	 * @param oProps Specifies the chart properties
	 */
	checkPersonalizationInChartProperties = (oProps: any) => {
		if (oProps.personalization) {
			if (oProps.personalization === "false") {
				this.personalization = undefined;
			} else if (oProps.personalization === "true") {
				this.personalization = Object.values(personalizationValues).join(",");
			} else if (this.verifyValidPersonlization(oProps.personalization) === true) {
				this.personalization = oProps.personalization;
			} else {
				this.personalization = undefined;
			}
		}
	};

	/**
	 *
	 * @param personalization
	 * @returns `true` or `false` if the personalization is valid or not valid
	 */
	verifyValidPersonlization = (personalization: String) => {
		let valid: Boolean = true;
		const splitArray = personalization.split(",");
		const acceptedValues: string[] = Object.values(personalizationValues);
		splitArray.forEach((arrayElement) => {
			if (!acceptedValues.includes(arrayElement)) {
				valid = false;
			}
		});
		return valid;
	};

	getVariantManagement = (oProps: any, oChartDefinition: ChartVisualization) => {
		let variantManagement = oProps.variantManagement ? oProps.variantManagement : oChartDefinition.variantManagement;
		variantManagement = this.personalization === undefined ? "None" : variantManagement;
		return variantManagement;
	};

	createVariantManagement = () => {
		const personalization = this.personalization;
		if (personalization) {
			const variantManagement = this.variantManagement;
			if (variantManagement === "Control") {
				return xml`
					<mdc:variant>
					<variant:VariantManagement
						id="${generate([this.id, "VM"])}"
						for="${this.id}"
						showSetAsDefault="${true}"
						select="${this.variantSelected}"
						headerLevel="${this.headerLevel}"
						save="${this.variantSaved}"
					/>
					</mdc:variant>
			`;
			} else if (variantManagement === "None" || variantManagement === "Page") {
				return xml``;
			}
		} else if (!personalization) {
			Log.warning("Variant Management cannot be enabled when personalization is disabled");
		}
		return xml``;
	};

	getPersistenceProvider = () => {
		if (this.variantManagement === "None") {
			return xml`<p13n:PersistenceProvider id="${generate([this.id, "PersistenceProvider"])}" for="${this.id}"/>`;
		}
		return xml``;
	};

	pushActionCommand = (
		actionContext: Context,
		dataField: DataFieldForAction | undefined,
		chartOperationAvailableMap: string | undefined,
		action: BaseAction | CustomAction
	) => {
		if (dataField) {
			const commandAction = {
				actionContext: actionContext,
				onExecuteAction: ChartHelper.getPressEventForDataFieldForActionButton(
					this.id!,
					dataField,
					chartOperationAvailableMap || ""
				),
				onExecuteIBN: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
				onExecuteManifest: CommonHelper.buildActionWrapper(action as CustomAction, this)
			};
			this._commandActions.push(commandAction);
		}
	};

	getActionCommand = (commandAction: CommandAction, chartContext: Context) => {
		const action = commandAction.actionContext.getObject();
		const dataFieldContext = action.annotationPath && this.contextPath.getModel().createBindingContext(action.annotationPath);
		const dataField = dataFieldContext && dataFieldContext.getObject();
		const dataFieldAction = this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action")!;
		const actionContext = CommonHelper.getActionContext(dataFieldAction);
		const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
		const isBound = this.contextPath.getModel().createBindingContext(isBoundPath)!.getObject();
		const chartOperationAvailableMap = escapeXMLAttributeValue(
			ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
				context: chartContext
			})
		);
		const isActionEnabled = action.enabled
			? action.enabled
			: ChartHelper.isDataFieldForActionButtonEnabled(
					isBound && isBound.$IsBound,
					dataField.Action,
					this.contextPath,
					chartOperationAvailableMap || "",
					action.enableOnSelect || ""
			  );
		let isIBNEnabled;
		if (action.enabled) {
			isIBNEnabled = action.enabled;
		} else if (dataField.RequiresContext) {
			isIBNEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
		}
		const actionCommand = xml`<internalMacro:ActionCommand
		action="${action}"
		onExecuteAction="${commandAction.onExecuteAction}"
		onExecuteIBN="${commandAction.onExecuteIBN}"
		onExecuteManifest="${commandAction.onExecuteManifest}"
		isIBNEnabled="${isIBNEnabled}"
		isActionEnabled="${isActionEnabled}"
		visible="${this.getVisible(dataFieldContext)}"
	/>`;
		if (
			action.type == "ForAction" &&
			(!isBound || isBound.IsBound !== true || actionContext[`@${CoreAnnotationTerms.OperationAvailable}`] !== false)
		) {
			return actionCommand;
		} else if (action.type == "ForAction") {
			return xml``;
		} else {
			return actionCommand;
		}
	};

	getItems = (chartContext: Context) => {
		if (this._chart) {
			const dimensions: string[] = [];
			const measures: string[] = [];
			if (this._chart.Dimensions) {
				ChartHelper.formatDimensions(chartContext)
					.getObject()
					.forEach((dimension: DimensionType) => {
						dimension.id = generate([this.id, "dimension", dimension.key]);
						dimensions.push(
							this.getItem(
								{
									id: dimension.id,
									key: dimension.key,
									label: dimension.label,
									role: dimension.role
								},
								"_fe_groupable_",
								"groupable"
							)
						);
					});
			}
			if (this.measures) {
				ChartHelper.formatMeasures(this.measures).forEach((measure: MeasureType) => {
					measure.id = generate([this.id, "measure", measure.key]);
					measures.push(
						this.getItem(
							{
								id: measure.id,
								key: measure.key,
								label: measure.label,
								role: measure.role
							},
							"_fe_aggregatable_",
							"aggregatable"
						)
					);
				});
			}
			if (dimensions.length && measures.length) {
				return dimensions.concat(measures);
			}
		}
		return xml``;
	};

	getItem = (item: MeasureType | DimensionType, prefix: string, type: string) => {
		return xml`<chart:Item
			id="${item.id}"
			name="${prefix + item.key}"
			type="${type}"
			label="${resolveBindingString(item.label as string, "string")}"
			role="${item.role}"
		/>`;
	};

	getToolbarActions = (chartContext: Context) => {
		const actions = this.getActions(chartContext);
		if (this.chartDefinition?.onSegmentedButtonPressed) {
			actions.push(this.getSegmentedButton());
		}
		if (actions.length > 0) {
			return xml`<mdc:actions>${actions}</mdc:actions>`;
		}
		return xml``;
	};

	getActions = (chartContext: Context) => {
		let actions = this.chartActions?.getObject();
		actions = this.removeMenuItems(actions);
		return actions.map((action: CustomAndAction) => {
			if (action.annotationPath) {
				// Load annotation based actions
				return this.getAction(action, chartContext, false);
			} else if (action.hasOwnProperty("noWrap")) {
				// Load XML or manifest based actions / action groups
				return this.getCustomActions(action, chartContext);
			}
		});
	};

	removeMenuItems = (actions: BaseAction[]) => {
		// If action is already part of menu in action group, then it will
		// be removed from the main actions list
		for (const action of actions) {
			if (action.menu) {
				action.menu.forEach((item) => {
					if (actions.indexOf(item as BaseAction) !== -1) {
						actions.splice(actions.indexOf(item as BaseAction), 1);
					}
				});
			}
		}
		return actions;
	};

	getCustomActions = (action: CustomAndAction, chartContext: Context) => {
		let actionEnabled = action.enabled as string | boolean;
		if ((action.requiresSelection ?? false) && action.enabled === "true") {
			actionEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
		}
		if (action.type === "Default") {
			// Load XML or manifest based toolbar actions
			return this.getActionToolbarAction(
				action,
				{
					id: generate([this.id, action.id]),
					unittestid: "DataFieldForActionButtonAction",
					label: action.text ? action.text : "",
					ariaHasPopup: undefined,
					press: action.press ? action.press : "",
					enabled: actionEnabled,
					visible: action.visible ? action.visible : false
				},
				false
			);
		} else if (action.type === "Menu") {
			// Load action groups (Menu)
			return this.getActionToolbarMenuAction(
				{
					id: generate([this.id, action.id]),
					text: action.text,
					visible: action.visible,
					enabled: actionEnabled,
					useDefaultActionOnly: DefaultActionHandler.getUseDefaultActionOnly(action),
					buttonMode: DefaultActionHandler.getButtonMode(action),
					defaultAction: undefined,
					actions: action
				},
				chartContext
			);
		}
	};

	getMenuItemFromMenu = (menuItemAction: CustomAction, chartContext: Context) => {
		let pressHandler;
		if (menuItemAction.annotationPath) {
			//Annotation based action is passed as menu item for menu button
			return this.getAction(menuItemAction, chartContext, true);
		}
		if (menuItemAction.command) {
			pressHandler = "cmd:" + menuItemAction.command;
		} else if (menuItemAction.noWrap ?? false) {
			pressHandler = menuItemAction.press;
		} else {
			pressHandler = CommonHelper.buildActionWrapper(menuItemAction, this);
		}
		return xml`<MenuItem
		core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
		text="${menuItemAction.text}"
		press="${pressHandler}"
		visible="${menuItemAction.visible}"
		enabled="${menuItemAction.enabled}"
	/>`;
	};

	getActionToolbarMenuAction = (props: CustomToolbarMenuAction, chartContext: Context) => {
		const aMenuItems = props.actions?.menu?.map((action: CustomAction) => {
			return this.getMenuItemFromMenu(action, chartContext);
		});
		return xml`<mdcat:ActionToolbarAction>
			<MenuButton
			text="${props.text}"
			type="Transparent"
			menuPosition="BeginBottom"
			id="${props.id}"
			visible="${props.visible}"
			enabled="${props.enabled}"
			useDefaultActionOnly="${props.useDefaultActionOnly}"
			buttonMode="${props.buttonMode}"
			defaultAction="${props.defaultAction}"
			>
				<menu>
					<Menu>
						${aMenuItems}
					</Menu>
				</menu>
			</MenuButton>
		</mdcat:ActionToolbarAction>`;
	};

	getAction = (action: BaseAction, chartContext: Context, isMenuItem: boolean) => {
		const dataFieldContext = this.contextPath.getModel().createBindingContext(action.annotationPath || "")!;
		if (action.type === "ForNavigation") {
			return this.getNavigationActions(action, dataFieldContext, isMenuItem);
		} else if (action.type === "ForAction") {
			return this.getAnnotationActions(chartContext, action as AnnotationAction, dataFieldContext, isMenuItem);
		}
		return xml``;
	};

	getNavigationActions = (action: BaseAction, dataFieldContext: Context, isMenuItem: boolean) => {
		let enabled = "true";
		const dataField = dataFieldContext.getObject();
		if (action.enabled !== undefined) {
			enabled = action.enabled;
		} else if (dataField.RequiresContext) {
			enabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
		}
		return this.getActionToolbarAction(
			action,
			{
				id: undefined,
				unittestid: "DataFieldForIntentBasedNavigationButtonAction",
				label: dataField.Label,
				ariaHasPopup: undefined,
				press: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false)!,
				enabled: enabled,
				visible: this.getVisible(dataFieldContext)
			},
			isMenuItem
		);
	};

	getAnnotationActions = (chartContext: Context, action: AnnotationAction, dataFieldContext: Context, isMenuItem: boolean) => {
		const dataFieldAction = this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action")!;
		const actionContext = this.contextPath.getModel().createBindingContext(CommonHelper.getActionContext(dataFieldAction));
		const actionObject = actionContext.getObject();
		const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
		const isBound = this.contextPath.getModel().createBindingContext(isBoundPath)!.getObject();
		const dataField = dataFieldContext.getObject();
		if (!isBound || isBound.$IsBound !== true || actionObject[`@${CoreAnnotationTerms.OperationAvailable}`] !== false) {
			const enabled = this.getAnnotationActionsEnabled(action, isBound, dataField, chartContext);
			const dataFieldModelObjectPath = getInvolvedDataModelObjects(
				this.contextPath.getModel().createBindingContext(action.annotationPath)!
			);
			const ariaHasPopup = isDataModelObjectPathForActionWithDialog(dataFieldModelObjectPath);
			const chartOperationAvailableMap =
				escapeXMLAttributeValue(
					ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
						context: chartContext
					})
				) || "";
			return this.getActionToolbarAction(
				action,
				{
					id: generate([this.id, getInvolvedDataModelObjects(dataFieldContext)]),
					unittestid: "DataFieldForActionButtonAction",
					label: dataField.Label,
					ariaHasPopup: ariaHasPopup,
					press: ChartHelper.getPressEventForDataFieldForActionButton(this.id!, dataField, chartOperationAvailableMap),
					enabled: enabled,
					visible: this.getVisible(dataFieldContext)
				},
				isMenuItem
			);
		}
		return xml``;
	};

	getActionToolbarAction = (action: BaseAction & { noWrap?: boolean }, toolbarAction: ToolBarAction, isMenuItem: boolean) => {
		if (isMenuItem) {
			return xml`
			<MenuItem
				text="${toolbarAction.label}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>`;
		} else {
			return this.buildAction(action, toolbarAction);
		}
	};

	buildAction = (action: BaseAction | CustomAction, toolbarAction: ToolBarAction) => {
		let actionPress: string | undefined = "";
		if (action.hasOwnProperty("noWrap")) {
			if (action.command) {
				actionPress = "cmd:" + action.command;
			} else if ((action as CustomAction).noWrap === true) {
				actionPress = toolbarAction.press;
			} else if (!action.annotationPath) {
				actionPress = CommonHelper.buildActionWrapper(action as CustomAction, this);
			}
			return xml`<mdcat:ActionToolbarAction>
			<Button
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${actionPress}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		   </mdcat:ActionToolbarAction>`;
		} else {
			return xml`<mdcat:ActionToolbarAction>
			<Button
				unittest:id="${toolbarAction.unittestid}"
				id="${toolbarAction.id}"
				text="${toolbarAction.label}"
				ariaHasPopup="${toolbarAction.ariaHasPopup}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>
		</mdcat:ActionToolbarAction>`;
		}
	};

	getAnnotationActionsEnabled = (
		action: BaseAction,
		isBound: Record<string, boolean>,
		dataField: DataFieldForAction,
		chartContext: Context
	) => {
		return action.enabled !== undefined
			? action.enabled
			: ChartHelper.isDataFieldForActionButtonEnabled(
					isBound && isBound.$IsBound,
					dataField.Action as string,
					this.contextPath,
					ChartHelper.getOperationAvailableMap(chartContext.getObject(), { context: chartContext }),
					action.enableOnSelect || ""
			  );
	};

	getSegmentedButton = () => {
		return xml`<mdcat:ActionToolbarAction layoutInformation="{
			aggregationName: 'end',
			alignment: 'End'
		}">
			<SegmentedButton
				id="${generate([this.id, "SegmentedButton", "TemplateContentView"])}"
				select="${this.chartDefinition!.onSegmentedButtonPressed}"
				visible="{= \${pageInternal>alpContentView} !== 'Table' }"
				selectedKey="{pageInternal>alpContentView}"
			>
				<items>
					${this.getSegmentedButtonItems()}
				</items>
			</SegmentedButton>
		</mdcat:ActionToolbarAction>`;
	};

	getSegmentedButtonItems = () => {
		const segmentedButtonItems = [];
		if (CommonHelper.isDesktop()) {
			segmentedButtonItems.push(
				this.getSegmentedButtonItem(
					"{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}",
					"Hybrid",
					"sap-icon://chart-table-view"
				)
			);
		}
		segmentedButtonItems.push(
			this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Chart", "sap-icon://bar-chart")
		);
		segmentedButtonItems.push(
			this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Table", "sap-icon://table-view")
		);
		return segmentedButtonItems;
	};

	getSegmentedButtonItem = (tooltip: string, key: string, icon: string) => {
		return xml`<SegmentedButtonItem
			tooltip="${tooltip}"
			key="${key}"
			icon="${icon}"
		/>`;
	};

	/**
	 * Returns the annotation path pointing to the visualization annotation (Chart).
	 *
	 * @param props The chart properties
	 * @param contextObjectPath The datamodel object path for the chart
	 * @param converterContext The converter context
	 * @returns The annotation path
	 */
	static getVisualizationPath = (
		props: PropertiesOf<ChartBlock>,
		contextObjectPath: DataModelObjectPath,
		converterContext: ConverterContext
	) => {
		const metaPath = getContextRelativeTargetObjectPath(contextObjectPath);

		// fallback to default Chart if metapath is not set
		if (!metaPath) {
			Log.error(`Missing metapath parameter for Chart`);
			return `@${UIAnnotationTerms.Chart}`;
		}

		if (contextObjectPath.targetObject.term === UIAnnotationTerms.Chart) {
			return metaPath; // MetaPath is already pointing to a Chart
		}

		//Need to switch to the context related the PV or SPV
		const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);

		let visualizations: VisualizationAndPath[] = [];
		switch (contextObjectPath.targetObject?.term) {
			case UIAnnotationTerms.SelectionPresentationVariant:
				if (contextObjectPath.targetObject.PresentationVariant) {
					visualizations = getVisualizationsFromPresentationVariant(
						contextObjectPath.targetObject.PresentationVariant,
						metaPath,
						resolvedTarget.converterContext,
						true
					);
				}
				break;
			case UIAnnotationTerms.PresentationVariant:
				visualizations = getVisualizationsFromPresentationVariant(
					contextObjectPath.targetObject,
					metaPath,
					resolvedTarget.converterContext,
					true
				);
				break;
		}

		const chartViz = visualizations.find((viz) => {
			return viz.visualization.term === UIAnnotationTerms.Chart;
		});

		if (chartViz) {
			return chartViz.annotationPath;
		} else {
			// fallback to default Chart if annotation missing in PV
			Log.error(`Bad metapath parameter for chart: ${contextObjectPath.targetObject.term}`);
			return `@${UIAnnotationTerms.Chart}`;
		}
	};

	getVisible = (dataFieldContext: Context) => {
		const dataField = dataFieldContext.getObject();
		if (dataField[`@${UIAnnotationTerms.Hidden}`] && dataField[`@${UIAnnotationTerms.Hidden}`].$Path) {
			const hiddenPathContext = this.contextPath
				.getModel()
				.createBindingContext(
					dataFieldContext.getPath() + `/@${UIAnnotationTerms.Hidden}/$Path`,
					dataField[`@${UIAnnotationTerms.Hidden}`].$Path
				);
			return ChartHelper.getHiddenPathExpressionForTableActionsAndIBN(dataField[`@${UIAnnotationTerms.Hidden}`].$Path, {
				context: hiddenPathContext
			});
		} else if (dataField[`@${UIAnnotationTerms.Hidden}`]) {
			return !dataField[`@${UIAnnotationTerms.Hidden}`];
		} else {
			return true;
		}
	};

	getContextPath = () => {
		return this.contextPath.getPath().lastIndexOf("/") === this.contextPath.getPath().length - 1
			? this.contextPath.getPath().replaceAll("/", "")
			: this.contextPath.getPath().split("/")[this.contextPath.getPath().split("/").length - 1];
	};

	getTemplate() {
		let chartdelegate = "";

		if (this._customData.targetCollectionPath === "") {
			this.noDataText = this.getTranslatedText("M_CHART_NO_ANNOTATION_SET_TEXT");
		}

		if (this.chartDelegate) {
			chartdelegate = this.chartDelegate;
		} else {
			const contextPath = this.getContextPath();
			chartdelegate =
				"{name:'sap/fe/macros/chart/ChartDelegate', payload: {contextPath: '" +
				contextPath +
				"', parameters:{$$groupId:'$auto.Workers'}, selectionMode: '" +
				this.selectionMode +
				"'}}";
		}
		const binding = "{internal>controls/" + this.id + "}";
		if (!this.header) {
			this.header = this._chart?.Title?.toString();
		}
		return xml`
			<macro:ChartAPI xmlns="sap.m" xmlns:macro="sap.fe.macros.chart" xmlns:variant="sap.ui.fl.variants" xmlns:p13n="sap.ui.mdc.p13n" xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1" xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:internalMacro="sap.fe.macros.internal" xmlns:chart="sap.ui.mdc.chart" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:core="sap.ui.core" id="${
				this._apiId
			}" selectionChange="${this.selectionChange}" stateChange="${this.stateChange}">
				<macro:layoutData>
					<FlexItemData growFactor="1" shrinkFactor="1" />
				</macro:layoutData>
				<mdc:Chart
					binding="${binding}"
					unittest:id="ChartMacroFragment"
					id="${this._contentId}"
					chartType="${this._chartType}"
					sortConditions="${this._sortCondtions}"
					header="${this.header}"
					headerVisible="${this.headerVisible}"
					height="${this.height}"
					width="${this.width}"
					headerLevel="${this.headerLevel}"
					p13nMode="${this.personalization}"
					filter="${this.filter}"
					noDataText="${this.noDataText}"
					autoBindOnInit="${this.autoBindOnInit}"
					delegate="${chartdelegate}"
					macrodata:targetCollectionPath="${this._customData.targetCollectionPath}"
					macrodata:entitySet="${this._customData.entitySet}"
					macrodata:entityType="${this._customData.entityType}"
					macrodata:operationAvailableMap="${this._customData.operationAvailableMap}"
					macrodata:multiSelectDisabledActions="${this._customData.multiSelectDisabledActions}"
					macrodata:segmentedButtonId="${this._customData.segmentedButtonId}"
					macrodata:customAgg="${this._customData.customAgg}"
					macrodata:transAgg="${this._customData.transAgg}"
					macrodata:applySupported="${this._customData.applySupported}"
					macrodata:vizProperties="${this._customData.vizProperties}"
					macrodata:draftSupported="${this._customData.draftSupported}"
					macrodata:multiViews="${this._customData.multiViews}"
					macrodata:selectionPresentationVariantPath="${this._customData.selectionPresentationVariantPath}"
					visible="${this.visible}"
				>
				<mdc:dependents>
					${this.getDependents(this._chartContext)}
					${this.getPersistenceProvider()}
				</mdc:dependents>
				<mdc:items>
					${this.getItems(this._chartContext)}
				</mdc:items>
				${this._actions}
				${this.createVariantManagement()}
			</mdc:Chart>
		</macro:ChartAPI>`;
	}
}
