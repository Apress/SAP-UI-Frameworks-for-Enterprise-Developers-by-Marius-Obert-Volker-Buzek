import Log from "sap/base/Log";
import type BaseController from "sap/fe/core/BaseController";
import type { KPIChartDefinition, KPIDefinition, NavigationInfo } from "sap/fe/core/converters/controls/Common/KPI";
import type { FilterDefinition, RangeDefinition } from "sap/fe/core/converters/helpers/SelectionVariantHelper";
import { MessageType } from "sap/fe/core/formatters/TableFormatterTypes";
import PageController from "sap/fe/core/PageController";
import type GenericTag from "sap/m/GenericTag";
import Popover from "sap/m/Popover";
import Core from "sap/ui/core/Core";
import DateFormat from "sap/ui/core/format/DateFormat";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import Locale from "sap/ui/core/Locale";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import Filter from "sap/ui/model/Filter";
import type FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Sorter from "sap/ui/model/Sorter";
import { defineUI5Class, methodOverride, publicExtension } from "../helpers/ClassSupport";

const MessageTypeFromCriticality: Record<string, MessageType> = {
	"1": MessageType.Error,
	"2": MessageType.Warning,
	"3": MessageType.Success,
	"5": MessageType.Information
};

const ValueColorFromMessageType: Record<MessageType, string> = {
	Error: "Error",
	Warning: "Critical",
	Success: "Good",
	Information: "None",
	None: "None"
};

/**
 * Function to get a message state from a calculated criticality of type 'Target'.
 *
 * @param kpiValue The value of the KPI to be tested against.
 * @param aThresholds Thresholds to be used [DeviationRangeLowValue,ToleranceRangeLowValue,AcceptanceRangeLowValue,AcceptanceRangeHighValue,ToleranceRangeHighValue,DeviationRangeHighValue].
 * @returns The corresponding MessageType
 */
function messageTypeFromTargetCalculation(kpiValue: number, aThresholds: (number | undefined | null)[]): MessageType {
	let criticalityProperty: MessageType;

	if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue < aThresholds[0]) {
		criticalityProperty = MessageType.Error;
	} else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue < aThresholds[1]) {
		criticalityProperty = MessageType.Warning;
	} else if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue < aThresholds[2]) {
		criticalityProperty = MessageType.None;
	} else if (aThresholds[5] !== undefined && aThresholds[5] !== null && kpiValue > aThresholds[5]) {
		criticalityProperty = MessageType.Error;
	} else if (aThresholds[4] !== undefined && aThresholds[4] !== null && kpiValue > aThresholds[4]) {
		criticalityProperty = MessageType.Warning;
	} else if (aThresholds[3] !== undefined && aThresholds[3] !== null && kpiValue > aThresholds[3]) {
		criticalityProperty = MessageType.None;
	} else {
		criticalityProperty = MessageType.Success;
	}

	return criticalityProperty;
}

/**
 * Function to get a message state from a calculated criticality of type 'Minimize'.
 *
 * @param kpiValue The value of the KPI to be tested against.
 * @param aThresholds Thresholds to be used [AcceptanceRangeHighValue,ToleranceRangeHighValue,DeviationRangeHighValue].
 * @returns The corresponding MessageType
 */
function messageTypeFromMinimizeCalculation(kpiValue: number, aThresholds: (number | undefined | null)[]): MessageType {
	let criticalityProperty: MessageType;

	if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue > aThresholds[2]) {
		criticalityProperty = MessageType.Error;
	} else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue > aThresholds[1]) {
		criticalityProperty = MessageType.Warning;
	} else if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue > aThresholds[0]) {
		criticalityProperty = MessageType.None;
	} else {
		criticalityProperty = MessageType.Success;
	}

	return criticalityProperty;
}

/**
 * Function to get a message state from a calculated criticality of type 'Maximize'.
 *
 * @param kpiValue The value of the KPI to be tested against.
 * @param aThresholds Thresholds to be used [DeviationRangeLowValue,ToleranceRangeLowValue,AcceptanceRangeLowValue].
 * @returns The corresponding MessageType
 */
function messageTypeFromMaximizeCalculation(kpiValue: number, aThresholds: (number | undefined | null)[]): MessageType {
	let criticalityProperty: MessageType;

	if (aThresholds[0] !== undefined && aThresholds[0] !== null && kpiValue < aThresholds[0]) {
		criticalityProperty = MessageType.Error;
	} else if (aThresholds[1] !== undefined && aThresholds[1] !== null && kpiValue < aThresholds[1]) {
		criticalityProperty = MessageType.Warning;
	} else if (aThresholds[2] !== undefined && aThresholds[2] !== null && kpiValue < aThresholds[2]) {
		criticalityProperty = MessageType.None;
	} else {
		criticalityProperty = MessageType.Success;
	}

	return criticalityProperty;
}

/**
 * Function to calculate a DeviationIndicator value from a trend value.
 *
 * @param trendValue The criticality values.
 * @returns The corresponding DeviationIndicator value
 */
function deviationIndicatorFromTrendType(trendValue: number | string): string {
	let deviationIndicator: string;

	switch (trendValue) {
		case 1: // StrongUp
		case "1":
		case 2: // Up
		case "2":
			deviationIndicator = "Up";
			break;

		case 4: // Down
		case "4":
		case 5: // StrongDown
		case "5":
			deviationIndicator = "Down";
			break;

		default:
			deviationIndicator = "None";
	}

	return deviationIndicator;
}

/**
 * Function to calculate a DeviationIndicator from a TrendCalculation.
 *
 * @param kpiValue The value of the KPI
 * @param referenceValue The reference value to compare with
 * @param isRelative True is the comparison is relative
 * @param aThresholds Array of thresholds [StrongDownDifference, DownDifference, UpDifference, StrongUpDifference]
 * @returns The corresponding DeviationIndicator value
 */
function deviationIndicatorFromCalculation(
	kpiValue: number,
	referenceValue: number,
	isRelative: boolean,
	aThresholds: (number | undefined | null)[] | undefined
): string {
	let deviationIndicator: string;

	if (!aThresholds || (isRelative && !referenceValue)) {
		return "None";
	}

	const compValue = isRelative ? (kpiValue - referenceValue) / referenceValue : kpiValue - referenceValue;

	if (aThresholds[0] !== undefined && aThresholds[0] !== null && compValue <= aThresholds[0]) {
		// StrongDown --> Down
		deviationIndicator = "Down";
	} else if (aThresholds[1] !== undefined && aThresholds[1] !== null && compValue <= aThresholds[1]) {
		// Down --> Down
		deviationIndicator = "Down";
	} else if (aThresholds[3] !== undefined && aThresholds[3] !== null && compValue >= aThresholds[3]) {
		// StrongUp --> Up
		deviationIndicator = "Up";
	} else if (aThresholds[2] !== undefined && aThresholds[2] !== null && compValue >= aThresholds[2]) {
		// Up --> Up
		deviationIndicator = "Up";
	} else {
		// Sideways --> None
		deviationIndicator = "None";
	}

	return deviationIndicator;
}

/**
 * Creates a sap.ui.model.Filter from a filter definition.
 *
 * @param filterDefinition The filter definition
 * @returns Returns a sap.ui.model.Filter from the definition, or undefined if the definition is empty (no ranges)
 */
function createFilterFromDefinition(filterDefinition: FilterDefinition): Filter | undefined {
	if (filterDefinition.ranges.length === 0) {
		return undefined;
	} else if (filterDefinition.ranges.length === 1) {
		return new Filter(
			filterDefinition.propertyPath,
			filterDefinition.ranges[0].operator as FilterOperator,
			filterDefinition.ranges[0].rangeLow,
			filterDefinition.ranges[0].rangeHigh
		);
	} else {
		const aRangeFilters = filterDefinition.ranges.map((range) => {
			return new Filter(filterDefinition.propertyPath, range.operator as FilterOperator, range.rangeLow, range.rangeHigh);
		});
		return new Filter({
			filters: aRangeFilters,
			and: false
		});
	}
}

function getFilterStringFromDefinition(filterDefinition: FilterDefinition): string {
	const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
	const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
	const dateFormat = DateFormat.getDateInstance({ style: "medium" }, currentLocale);

	function formatRange(range: RangeDefinition): string {
		const valueLow =
			filterDefinition.propertyType.indexOf("Edm.Date") === 0 ? dateFormat.format(new Date(range.rangeLow)) : range.rangeLow;
		const valueHigh =
			filterDefinition.propertyType.indexOf("Edm.Date") === 0 ? dateFormat.format(new Date(range.rangeHigh)) : range.rangeHigh;

		switch (range.operator) {
			case "BT":
				return `[${valueLow} - ${valueHigh}]`;

			case "Contains":
				return `*${valueLow}*`;

			case "GE":
				return `\u2265${valueLow}`;

			case "GT":
				return `>${valueLow}`;

			case "LE":
				return `\u2264${valueLow}`;

			case "LT":
				return `<${valueLow}`;

			case "NB":
				return resBundle.getText("C_KPICARD_FILTERSTRING_NOT", [`[${valueLow} - ${valueHigh}]`]);

			case "NE":
				return `\u2260${valueLow}`;

			case "NotContains":
				return resBundle.getText("C_KPICARD_FILTERSTRING_NOT", [`*${valueLow}*`]);

			case "EQ":
			default:
				return valueLow;
		}
	}
	if (filterDefinition.ranges.length === 0) {
		return "";
	} else if (filterDefinition.ranges.length === 1) {
		return formatRange(filterDefinition.ranges[0]);
	} else {
		return `(${filterDefinition.ranges.map(formatRange).join(",")})`;
	}
}

function formatChartTitle(kpiDef: KPIDefinition): string {
	const resBundle = Core.getLibraryResourceBundle("sap.fe.core");

	function formatList(items: { name: string; label: string }[]) {
		if (items.length === 0) {
			return "";
		} else if (items.length === 1) {
			return items[0].label;
		} else {
			let res = items[0].label;
			for (let I = 1; I < items.length - 1; I++) {
				res += `, ${items[I].label}`;
			}

			return resBundle.getText("C_KPICARD_ITEMSLIST", [res, items[items.length - 1].label]);
		}
	}

	return resBundle.getText("C_KPICARD_CHARTTITLE", [formatList(kpiDef.chart.measures), formatList(kpiDef.chart.dimensions)]);
}

function updateChartLabelSettings(chartDefinition: KPIChartDefinition, oChartProperties: any): void {
	switch (chartDefinition.chartType) {
		case "Donut":
			// Show data labels, do not show axis titles
			oChartProperties.categoryAxis = {
				title: {
					visible: false
				}
			};
			oChartProperties.valueAxis = {
				title: {
					visible: false
				},
				label: {
					formatString: "ShortFloat"
				}
			};
			oChartProperties.plotArea.dataLabel = {
				visible: true,
				type: "value",
				formatString: "ShortFloat_MFD2"
			};
			break;

		case "bubble":
			// Show axis title, bubble size legend, do not show data labels
			oChartProperties.valueAxis = {
				title: {
					visible: true
				},
				label: {
					formatString: "ShortFloat"
				}
			};
			oChartProperties.valueAxis2 = {
				title: {
					visible: true
				},
				label: {
					formatString: "ShortFloat"
				}
			};
			oChartProperties.legendGroup = {
				layout: {
					position: "bottom",
					alignment: "topLeft"
				}
			};
			oChartProperties.sizeLegend = {
				visible: true
			};
			oChartProperties.plotArea.dataLabel = { visible: false };
			break;

		case "scatter":
			// Do not show data labels and axis titles
			oChartProperties.valueAxis = {
				title: {
					visible: false
				},
				label: {
					formatString: "ShortFloat"
				}
			};
			oChartProperties.valueAxis2 = {
				title: {
					visible: false
				},
				label: {
					formatString: "ShortFloat"
				}
			};
			oChartProperties.plotArea.dataLabel = { visible: false };
			break;

		default:
			// Do not show data labels and axis titles
			oChartProperties.categoryAxis = {
				title: {
					visible: false
				}
			};
			oChartProperties.valueAxis = {
				title: {
					visible: false
				},
				label: {
					formatString: "ShortFloat"
				}
			};
			oChartProperties.plotArea.dataLabel = { visible: false };
	}
}
function filterMap(aObjects: { name: string; label: string; role?: string }[], aRoles?: (string | undefined)[]): string[] {
	if (aRoles && aRoles.length) {
		return aObjects
			.filter((dimension) => {
				return aRoles.indexOf(dimension.role) >= 0;
			})
			.map((dimension) => {
				return dimension.label;
			});
	} else {
		return aObjects.map((dimension) => {
			return dimension.label;
		});
	}
}

function getScatterBubbleChartFeeds(chartDefinition: KPIChartDefinition): { uid: string; type: string; values: string[] }[] {
	const axis1Measures = filterMap(chartDefinition.measures, ["Axis1"]);
	const axis2Measures = filterMap(chartDefinition.measures, ["Axis2"]);
	const axis3Measures = filterMap(chartDefinition.measures, ["Axis3"]);
	const otherMeasures = filterMap(chartDefinition.measures, [undefined]);
	const seriesDimensions = filterMap(chartDefinition.dimensions, ["Series"]);

	// Get the first dimension with role "Category" for the shape
	const shapeDimension = chartDefinition.dimensions.find((dimension) => {
		return dimension.role === "Category";
	});

	// Measure for the x-Axis : first measure for Axis1, or for Axis2 if not found, or for Axis3 if not found
	const xMeasure = axis1Measures.shift() || axis2Measures.shift() || axis3Measures.shift() || otherMeasures.shift() || "";
	// Measure for the y-Axis : first measure for Axis2, or second measure for Axis1 if not found, or first measure for Axis3 if not found
	const yMeasure = axis2Measures.shift() || axis1Measures.shift() || axis3Measures.shift() || otherMeasures.shift() || "";
	const res = [
		{
			uid: "valueAxis",
			type: "Measure",
			values: [xMeasure]
		},
		{
			uid: "valueAxis2",
			type: "Measure",
			values: [yMeasure]
		}
	];

	if (chartDefinition.chartType === "bubble") {
		// Measure for the size of the bubble: first measure for Axis3, or remaining measure for Axis1/Axis2 if not found
		const sizeMeasure = axis3Measures.shift() || axis1Measures.shift() || axis2Measures.shift() || otherMeasures.shift() || "";
		res.push({
			uid: "bubbleWidth",
			type: "Measure",
			values: [sizeMeasure]
		});
	}

	// Color (optional)
	if (seriesDimensions.length) {
		res.push({
			uid: "color",
			type: "Dimension",
			values: seriesDimensions
		});
	}
	// Shape (optional)
	if (shapeDimension) {
		res.push({
			uid: "shape",
			type: "Dimension",
			values: [shapeDimension.label]
		});
	}
	return res;
}

function getChartFeeds(chartDefinition: KPIChartDefinition): { uid: string; type: string; values: string[] }[] {
	let res: { uid: string; type: string; values: string[] }[];

	switch (chartDefinition.chartType) {
		case "Donut":
			res = [
				{
					uid: "size",
					type: "Measure",
					values: filterMap(chartDefinition.measures)
				},
				{
					uid: "color",
					type: "Dimension",
					values: filterMap(chartDefinition.dimensions)
				}
			];
			break;

		case "bubble":
		case "scatter":
			res = getScatterBubbleChartFeeds(chartDefinition);
			break;

		case "vertical_bullet":
			res = [
				{
					uid: "actualValues",
					type: "Measure",
					values: filterMap(chartDefinition.measures, [undefined, "Axis1"])
				},
				{
					uid: "targetValues",
					type: "Measure",
					values: filterMap(chartDefinition.measures, ["Axis2"])
				},
				{
					uid: "categoryAxis",
					type: "Dimension",
					values: filterMap(chartDefinition.dimensions, [undefined, "Category"])
				},
				{
					uid: "color",
					type: "Dimension",
					values: filterMap(chartDefinition.dimensions, ["Series"])
				}
			];
			break;

		default:
			res = [
				{
					uid: "valueAxis",
					type: "Measure",
					values: filterMap(chartDefinition.measures)
				},
				{
					uid: "categoryAxis",
					type: "Dimension",
					values: filterMap(chartDefinition.dimensions, [undefined, "Category"])
				},
				{
					uid: "color",
					type: "Dimension",
					values: filterMap(chartDefinition.dimensions, ["Series"])
				}
			];
	}

	return res;
}

function getNavigationParameters(
	navInfo: NavigationInfo,
	oShellService: any
): Promise<{ semanticObject?: string; action?: string; outbound?: string } | undefined> {
	if (navInfo.semanticObject) {
		if (navInfo.action) {
			// Action is already specified: check if it's available in the shell
			return oShellService.getLinks({ semanticObject: navInfo.semanticObject, action: navInfo.action }).then((aLinks: any[]) => {
				return aLinks.length ? { semanticObject: navInfo.semanticObject, action: navInfo.action } : undefined;
			});
		} else {
			// We get the primary intent from the shell
			return oShellService.getPrimaryIntent(navInfo.semanticObject).then((oLink: any) => {
				if (!oLink) {
					// No primary intent...
					return undefined;
				}

				// Check that the primary intent is not part of the unavailable actions
				const oInfo = oShellService.parseShellHash(oLink.intent);
				return navInfo.unavailableActions && navInfo.unavailableActions.indexOf(oInfo.action) >= 0
					? undefined
					: { semanticObject: oInfo.semanticObject, action: oInfo.action };
			});
		}
	} else {
		// Outbound navigation specified in the manifest
		return navInfo.outboundNavigation ? Promise.resolve({ outbound: navInfo.outboundNavigation }) : Promise.resolve(undefined);
	}
}

/**
 * @class A controller extension for managing the KPIs in an analytical list page
 * @name sap.fe.core.controllerextensions.KPIManagement
 * @hideconstructor
 * @private
 * @since 1.93.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.KPIManagement")
class KPIManagementControllerExtension extends ControllerExtension {
	protected aKPIDefinitions?: KPIDefinition[];

	protected oCard: any;

	protected oPopover!: Popover;

	/**
	 * Creates the card manifest for a KPI definition and stores it in a JSON model.
	 *
	 * @param kpiDefinition The KPI definition
	 * @param oKPIModel The JSON model in which the manifest will be stored
	 */
	protected initCardManifest(kpiDefinition: KPIDefinition, oKPIModel: JSONModel): void {
		const oCardManifest: any = {
			"sap.app": {
				id: "sap.fe",
				type: "card"
			},
			"sap.ui": {
				technology: "UI5"
			},
			"sap.card": {
				type: "Analytical",
				data: {
					json: {}
				},
				header: {
					type: "Numeric",
					title: kpiDefinition.datapoint.title,
					subTitle: kpiDefinition.datapoint.description,
					unitOfMeasurement: "{mainUnit}",
					mainIndicator: {
						number: "{mainValueNoScale}",
						unit: "{mainValueScale}",
						state: "{mainState}",
						trend: "{trend}"
					}
				},
				content: {
					minHeight: "25rem",
					chartProperties: {
						plotArea: {},
						title: {
							visible: true,
							alignment: "left"
						}
					},
					data: {
						path: "/chartData"
					}
				}
			}
		};

		// Add side indicators in the card header if a target is defined for the KPI
		if (kpiDefinition.datapoint.targetPath || kpiDefinition.datapoint.targetValue !== undefined) {
			const resBundle = Core.getLibraryResourceBundle("sap.fe.core");
			oCardManifest["sap.card"].header.sideIndicators = [
				{
					title: resBundle.getText("C_KPICARD_INDICATOR_TARGET"),
					number: "{targetNumber}",
					unit: "{targetUnit}"
				},
				{
					title: resBundle.getText("C_KPICARD_INDICATOR_DEVIATION"),
					number: "{deviationNumber}",
					unit: "%"
				}
			];
		}

		// Details of the card: filter descriptions
		if (kpiDefinition.selectionVariantFilterDefinitions?.length) {
			const aDescriptions: string[] = [];
			kpiDefinition.selectionVariantFilterDefinitions.forEach((filterDefinition) => {
				const desc = getFilterStringFromDefinition(filterDefinition);
				if (desc) {
					aDescriptions.push(desc);
				}
			});

			if (aDescriptions.length) {
				oCardManifest["sap.card"].header.details = aDescriptions.join(", ");
			}
		}

		// Chart settings: type, title, dimensions and measures in the manifest
		oCardManifest["sap.card"].content.chartType = kpiDefinition.chart.chartType;
		updateChartLabelSettings(kpiDefinition.chart, oCardManifest["sap.card"].content.chartProperties);
		oCardManifest["sap.card"].content.chartProperties.title.text = formatChartTitle(kpiDefinition);
		oCardManifest["sap.card"].content.dimensions = kpiDefinition.chart.dimensions.map((dimension) => {
			return { label: dimension.label, value: `{${dimension.name}}` };
		});
		oCardManifest["sap.card"].content.measures = kpiDefinition.chart.measures.map((measure) => {
			return { label: measure.label, value: `{${measure.name}}` };
		});
		oCardManifest["sap.card"].content.feeds = getChartFeeds(kpiDefinition.chart);

		oKPIModel.setProperty(`/${kpiDefinition.id}`, {
			manifest: oCardManifest
		});
	}

	protected initNavigationInfo(kpiDefinition: KPIDefinition, oKPIModel: JSONModel, oShellService: any): Promise<void> {
		// Add navigation
		if (kpiDefinition.navigation) {
			return getNavigationParameters(kpiDefinition.navigation, oShellService).then((oNavInfo) => {
				if (oNavInfo) {
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/header/actions`, [
						{
							type: "Navigation",
							parameters: oNavInfo
						}
					]);
				}
			});
		} else {
			return Promise.resolve();
		}
	}

	@methodOverride()
	public onInit(): void {
		this.aKPIDefinitions = (this.getView().getController() as PageController)._getPageModel()?.getProperty("/kpiDefinitions");

		if (this.aKPIDefinitions && this.aKPIDefinitions.length) {
			const oView = this.getView();
			const oAppComponent = (oView.getController() as BaseController).getAppComponent() as any;

			// Create a JSON model to store KPI data
			const oKPIModel = new JSONModel();
			oView.setModel(oKPIModel, "kpiModel");

			this.aKPIDefinitions.forEach((kpiDefinition) => {
				// Create the manifest for the KPI card and store it in the KPI model
				this.initCardManifest(kpiDefinition, oKPIModel);

				// Set the navigation information in the manifest
				this.initNavigationInfo(kpiDefinition, oKPIModel, oAppComponent.getShellServices()).catch(function (err: any) {
					Log.error(err);
				});

				// Load tag data for the KPI
				this.loadKPITagData(kpiDefinition, oAppComponent.getModel() as ODataModel, oKPIModel).catch(function (err: any) {
					Log.error(err);
				});
			});
		}
	}

	@methodOverride()
	public onExit(): void {
		const oKPIModel = this.getView().getModel("kpiModel") as JSONModel;

		if (oKPIModel) {
			oKPIModel.destroy();
		}
	}

	private updateDatapointValueAndCurrency(kpiDefinition: KPIDefinition, kpiContext: Context, oKPIModel: JSONModel) {
		const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());
		const rawUnit = kpiDefinition.datapoint.unit?.isPath
			? kpiContext.getProperty(kpiDefinition.datapoint.unit.value)
			: kpiDefinition.datapoint.unit?.value;

		const isPercentage = kpiDefinition.datapoint.unit?.isCurrency === false && rawUnit === "%";

		// /////////////////////
		// Main KPI value
		const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));

		// Value formatted with a scale
		const kpiValue = NumberFormat.getFloatInstance(
			{
				style: isPercentage ? undefined : "short",
				minFractionDigits: 0,
				maxFractionDigits: 1,
				showScale: !isPercentage
			},
			currentLocale
		).format(rawValue);
		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValue`, kpiValue);

		// Value without a scale
		const kpiValueUnscaled = NumberFormat.getFloatInstance(
			{
				maxFractionDigits: 2,
				showScale: false,
				groupingEnabled: true
			},
			currentLocale
		).format(rawValue);
		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueUnscaled`, kpiValueUnscaled);

		// Value formatted with the scale omitted
		const kpiValueNoScale = NumberFormat.getFloatInstance(
			{
				style: isPercentage ? undefined : "short",
				minFractionDigits: 0,
				maxFractionDigits: 1,
				showScale: false
			},
			currentLocale
		).format(rawValue);
		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueNoScale`, kpiValueNoScale);

		// Scale of the value
		const kpiValueScale = NumberFormat.getFloatInstance(
			{
				style: isPercentage ? undefined : "short",
				decimals: 0,
				maxIntegerDigits: 0,
				showScale: true
			},
			currentLocale
		).format(rawValue);
		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueScale`, kpiValueScale);

		// /////////////////////
		// Unit or currency
		if (kpiDefinition.datapoint.unit && rawUnit) {
			if (kpiDefinition.datapoint.unit.isCurrency) {
				oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, rawUnit);
			} else {
				// In case of unit of measure, we have to format it properly
				const kpiUnit = NumberFormat.getUnitInstance({ showNumber: false }, currentLocale).format(rawValue, rawUnit);
				oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, kpiUnit);
			}
		}
	}

	private updateDatapointCriticality(kpiDefinition: KPIDefinition, kpiContext: Context, oKPIModel: JSONModel) {
		const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));

		let criticalityValue = MessageType.None;
		if (kpiDefinition.datapoint.criticalityValue) {
			// Criticality is a fixed value
			criticalityValue = kpiDefinition.datapoint.criticalityValue;
		} else if (kpiDefinition.datapoint.criticalityPath) {
			// Criticality comes from another property (via a path)
			criticalityValue =
				MessageTypeFromCriticality[kpiContext.getProperty(kpiDefinition.datapoint.criticalityPath)] || MessageType.None;
		} else if (kpiDefinition.datapoint.criticalityCalculationThresholds && kpiDefinition.datapoint.criticalityCalculationMode) {
			// Criticality calculation
			switch (kpiDefinition.datapoint.criticalityCalculationMode) {
				case "UI.ImprovementDirectionType/Target":
					criticalityValue = messageTypeFromTargetCalculation(rawValue, kpiDefinition.datapoint.criticalityCalculationThresholds);
					break;

				case "UI.ImprovementDirectionType/Minimize":
					criticalityValue = messageTypeFromMinimizeCalculation(
						rawValue,
						kpiDefinition.datapoint.criticalityCalculationThresholds
					);
					break;

				case "UI.ImprovementDirectionType/Maximize":
				default:
					criticalityValue = messageTypeFromMaximizeCalculation(
						rawValue,
						kpiDefinition.datapoint.criticalityCalculationThresholds
					);
					break;
			}
		}

		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainCriticality`, criticalityValue);
		oKPIModel.setProperty(
			`/${kpiDefinition.id}/manifest/sap.card/data/json/mainState`,
			ValueColorFromMessageType[criticalityValue] || "None"
		);
	}

	private updateDatapointTrend(kpiDefinition: KPIDefinition, kpiContext: Context, oKPIModel: JSONModel) {
		const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));

		let trendValue = "None";

		if (kpiDefinition.datapoint.trendValue) {
			// Trend is a fixed value
			trendValue = kpiDefinition.datapoint.trendValue;
		} else if (kpiDefinition.datapoint.trendPath) {
			// Trend comes from another property via a path
			trendValue = deviationIndicatorFromTrendType(kpiContext.getProperty(kpiDefinition.datapoint.trendPath));
		} else if (
			kpiDefinition.datapoint.trendCalculationReferenceValue !== undefined ||
			kpiDefinition.datapoint.trendCalculationReferencePath
		) {
			// Calculated trend
			let trendReferenceValue: number;
			if (kpiDefinition.datapoint.trendCalculationReferenceValue !== undefined) {
				trendReferenceValue = kpiDefinition.datapoint.trendCalculationReferenceValue;
			} else {
				trendReferenceValue = Number.parseFloat(
					kpiContext.getProperty(kpiDefinition.datapoint.trendCalculationReferencePath || "")
				);
			}
			trendValue = deviationIndicatorFromCalculation(
				rawValue,
				trendReferenceValue,
				!!kpiDefinition.datapoint.trendCalculationIsRelative,
				kpiDefinition.datapoint.trendCalculationTresholds
			);
		}

		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/trend`, trendValue);
	}

	private updateTargetValue(kpiDefinition: KPIDefinition, kpiContext: Context, oKPIModel: JSONModel) {
		if (kpiDefinition.datapoint.targetValue === undefined && kpiDefinition.datapoint.targetPath === undefined) {
			return; // No target set for the KPI
		}
		const rawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.propertyPath));
		const currentLocale = new Locale(sap.ui.getCore().getConfiguration().getLanguage());

		let targetRawValue: number;
		if (kpiDefinition.datapoint.targetValue !== undefined) {
			targetRawValue = kpiDefinition.datapoint.targetValue;
		} else {
			targetRawValue = Number.parseFloat(kpiContext.getProperty(kpiDefinition.datapoint.targetPath || ""));
		}
		const deviationRawValue = targetRawValue !== 0 ? ((rawValue - targetRawValue) / targetRawValue) * 100 : undefined;

		// Formatting
		const targetValue = NumberFormat.getFloatInstance(
			{
				style: "short",
				minFractionDigits: 0,
				maxFractionDigits: 1,
				showScale: false
			},
			currentLocale
		).format(targetRawValue);
		const targetScale = NumberFormat.getFloatInstance(
			{
				style: "short",
				decimals: 0,
				maxIntegerDigits: 0,
				showScale: true
			},
			currentLocale
		).format(targetRawValue);

		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetNumber`, targetValue);
		oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetUnit`, targetScale);

		if (deviationRawValue !== undefined) {
			const deviationValue = NumberFormat.getFloatInstance(
				{
					minFractionDigits: 0,
					maxFractionDigits: 1,
					showScale: false
				},
				currentLocale
			).format(deviationRawValue);
			oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, deviationValue);
		} else {
			oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, "N/A");
		}
	}

	/**
	 * Loads tag data for a KPI, and stores it in the JSON KPI model.
	 *
	 * @param kpiDefinition The definition of the KPI.
	 * @param oMainModel The model used to load the data.
	 * @param oKPIModel The JSON model where the data will be stored
	 * @param loadFull If not true, loads only data for the KPI tag
	 * @returns The promise that is resolved when data is loaded.
	 */
	protected loadKPITagData(kpiDefinition: KPIDefinition, oMainModel: ODataModel, oKPIModel: JSONModel, loadFull?: boolean): any {
		// If loadFull=false, then we're just loading data for the tag and we use the "$auto.LongRunners" groupID
		// If loadFull=true, we're loading data for the whole KPI (tag + card) and we use the "$auto.Workers" groupID
		const oListBinding = loadFull
			? oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, { $$groupId: "$auto.Workers" })
			: oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, { $$groupId: "$auto.LongRunners" });
		const oAggregate: Record<string, { unit?: string }> = {};

		// Main value + currency/unit
		if (kpiDefinition.datapoint.unit?.isPath) {
			oAggregate[kpiDefinition.datapoint.propertyPath] = { unit: kpiDefinition.datapoint.unit.value };
		} else {
			oAggregate[kpiDefinition.datapoint.propertyPath] = {};
		}

		// Property for criticality
		if (kpiDefinition.datapoint.criticalityPath) {
			oAggregate[kpiDefinition.datapoint.criticalityPath] = {};
		}

		// Properties for trend and trend calculation
		if (loadFull) {
			if (kpiDefinition.datapoint.trendPath) {
				oAggregate[kpiDefinition.datapoint.trendPath] = {};
			}
			if (kpiDefinition.datapoint.trendCalculationReferencePath) {
				oAggregate[kpiDefinition.datapoint.trendCalculationReferencePath] = {};
			}
			if (kpiDefinition.datapoint.targetPath) {
				oAggregate[kpiDefinition.datapoint.targetPath] = {};
			}
		}

		oListBinding.setAggregation({ aggregate: oAggregate });

		// Manage SelectionVariant filters
		if (kpiDefinition.selectionVariantFilterDefinitions?.length) {
			const aFilters = kpiDefinition.selectionVariantFilterDefinitions.map(createFilterFromDefinition).filter((filter) => {
				return filter !== undefined;
			}) as Filter[];
			oListBinding.filter(aFilters);
		}

		return oListBinding.requestContexts(0, 1).then((aContexts: Context[]) => {
			if (aContexts.length) {
				const rawUnit = kpiDefinition.datapoint.unit?.isPath
					? aContexts[0].getProperty(kpiDefinition.datapoint.unit.value)
					: kpiDefinition.datapoint.unit?.value;

				if (kpiDefinition.datapoint.unit && !rawUnit) {
					// A unit/currency is defined, but its value is undefined --> multi-unit situation
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValue`, "*");
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueUnscaled`, "*");
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueNoScale`, "*");
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainValueScale`, "");
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainUnit`, undefined);
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainCriticality`, MessageType.None);
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/mainState`, "None");
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/trend`, "None");
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetNumber`, undefined);
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/targetUnit`, undefined);
					oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/deviationNumber`, undefined);
				} else {
					this.updateDatapointValueAndCurrency(kpiDefinition, aContexts[0], oKPIModel);
					this.updateDatapointCriticality(kpiDefinition, aContexts[0], oKPIModel);

					if (loadFull) {
						this.updateDatapointTrend(kpiDefinition, aContexts[0], oKPIModel);
						this.updateTargetValue(kpiDefinition, aContexts[0], oKPIModel);
					}
				}
			}
		});
	}

	/**
	 * Loads card data for a KPI, and stores it in the JSON KPI model.
	 *
	 * @param kpiDefinition The definition of the KPI.
	 * @param oMainModel The model used to load the data.
	 * @param oKPIModel The JSON model where the data will be stored
	 * @returns The promise that is resolved when data is loaded.
	 */
	protected loadKPICardData(kpiDefinition: KPIDefinition, oMainModel: ODataModel, oKPIModel: JSONModel): any {
		const oListBinding = oMainModel.bindList(`/${kpiDefinition.entitySet}`, undefined, undefined, undefined, {
			$$groupId: "$auto.Workers"
		});
		const oGroup: Record<string, Object> = {};
		const oAggregate: Record<string, Object> = {};

		kpiDefinition.chart.dimensions.forEach((dimension) => {
			oGroup[dimension.name] = {};
		});
		kpiDefinition.chart.measures.forEach((measure) => {
			oAggregate[measure.name] = {};
		});
		oListBinding.setAggregation({
			group: oGroup,
			aggregate: oAggregate
		});

		// Manage SelectionVariant filters
		if (kpiDefinition.selectionVariantFilterDefinitions?.length) {
			const aFilters = kpiDefinition.selectionVariantFilterDefinitions.map(createFilterFromDefinition).filter((filter) => {
				return filter !== undefined;
			}) as Filter[];
			oListBinding.filter(aFilters);
		}

		// Sorting
		if (kpiDefinition.chart.sortOrder) {
			oListBinding.sort(
				kpiDefinition.chart.sortOrder.map((sortInfo) => {
					return new Sorter(sortInfo.name, sortInfo.descending);
				})
			);
		}

		return oListBinding.requestContexts(0, kpiDefinition.chart.maxItems).then((aContexts: Context[]) => {
			const chartData = aContexts.map(function (oContext) {
				const oData: Record<string, any> = {};
				kpiDefinition.chart.dimensions.forEach((dimension) => {
					oData[dimension.name] = oContext.getProperty(dimension.name);
				});
				kpiDefinition.chart.measures.forEach((measure) => {
					oData[measure.name] = oContext.getProperty(measure.name);
				});

				return oData;
			});

			oKPIModel.setProperty(`/${kpiDefinition.id}/manifest/sap.card/data/json/chartData`, chartData);
		});
	}

	/**
	 * Gets the popover to display the KPI card
	 * The popover and the contained card for the KPIs are created if necessary.
	 * The popover is shared between all KPIs, so it's created only once.
	 *
	 * @param oKPITag The tag that triggered the popover opening.
	 * @returns The shared popover as a promise.
	 */
	protected getPopover(oKPITag: GenericTag): Promise<Popover> {
		if (!this.oPopover) {
			return new Promise((resolve, reject) => {
				Core.loadLibrary("sap/ui/integration", { async: true })
					.then(() => {
						sap.ui.require(["sap/ui/integration/widgets/Card", "sap/ui/integration/Host"], (Card: any, Host: any) => {
							const oHost = new Host();

							oHost.attachAction((oEvent: any) => {
								const sType = oEvent.getParameter("type");
								const oParams = oEvent.getParameter("parameters");

								if (sType === "Navigation") {
									if (oParams.semanticObject) {
										(this.getView().getController() as any)._intentBasedNavigation.navigate(
											oParams.semanticObject,
											oParams.action
										);
									} else {
										(this.getView().getController() as any)._intentBasedNavigation.navigateOutbound(oParams.outbound);
									}
								}
							});

							this.oCard = new Card({
								width: "25rem",
								height: "auto"
							});
							this.oCard.setHost(oHost);

							this.oPopover = new Popover("kpi-Popover", {
								showHeader: false,
								placement: "Auto",
								content: [this.oCard]
							});

							oKPITag.addDependent(this.oPopover); // The first clicked tag gets the popover as dependent

							resolve(this.oPopover);
						});
					})
					.catch(function () {
						reject();
					});
			});
		} else {
			return Promise.resolve(this.oPopover);
		}
	}

	@publicExtension()
	public onKPIPressed(oKPITag: any, kpiID: string): void {
		const oKPIModel = oKPITag.getModel("kpiModel") as JSONModel;

		if (this.aKPIDefinitions && this.aKPIDefinitions.length) {
			const kpiDefinition = this.aKPIDefinitions.find(function (oDef) {
				return oDef.id === kpiID;
			});

			if (kpiDefinition) {
				const oModel = oKPITag.getModel();
				const aPromises = [
					this.loadKPITagData(kpiDefinition, oModel, oKPIModel, true),
					this.loadKPICardData(kpiDefinition, oModel, oKPIModel),
					this.getPopover(oKPITag)
				];

				Promise.all(aPromises)
					.then((aResults) => {
						this.oCard.setManifest(oKPIModel.getProperty(`/${kpiID}/manifest`));
						this.oCard.refresh();

						const oPopover = aResults[2];
						oPopover.openBy(oKPITag, false);
					})
					.catch((err) => {
						Log.error(err);
					});
			}
		}
	}
}

export default KPIManagementControllerExtension;
