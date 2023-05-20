import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { MeasuresAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Measures";
import type { Chart, DataPointType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import CommonHelper from "sap/fe/macros/CommonHelper";
import mobilelibrary from "sap/m/library";
import DateFormat from "sap/ui/core/format/DateFormat";
import { MetaModelNavProperty } from "types/metamodel_types";
import MicroChartBlock from "./MicroChart.block";

const ValueColor = mobilelibrary.ValueColor;

const calendarPatternMap: { [key: string]: RegExp } = {
	yyyy: /[1-9][0-9]{3,}|0[0-9]{3}/,
	Q: /[1-4]/,
	MM: /0[1-9]|1[0-2]/,
	ww: /0[1-9]|[1-4][0-9]|5[0-3]/,
	yyyyMMdd: /([1-9][0-9]{3,}|0[0-9]{3})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/,
	yyyyMM: /([1-9][0-9]{3,}|0[0-9]{3})(0[1-9]|1[0-2])/,
	"yyyy-MM-dd": /([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/
};

/**
 * Helper class used by MDC_Controls to handle SAP Fiori elements for OData V4
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const MicroChartHelper = {
	/**
	 * This function returns the Threshold Color for bullet micro chart.
	 *
	 * @param value Threshold value provided in the annotations
	 * @param iContext InterfaceContext with path to the threshold
	 * @returns The indicator for Threshold Color
	 */
	getThresholdColor: function (value: string, iContext: any) {
		const path = iContext.context.getPath();
		if (path.indexOf("DeviationRange") > -1) {
			return ValueColor.Error;
		} else if (path.indexOf("ToleranceRange") > -1) {
			return ValueColor.Critical;
		}
		return ValueColor.Neutral;
	},

	/**
	 * To fetch measures from DataPoints.
	 *
	 * @param chartAnnotations Chart Annotations
	 * @param entityTypeAnnotations EntityType Annotations
	 * @param chartType Chart Type used
	 * @returns Containing all measures.
	 * @private
	 */
	getMeasurePropertyPaths: function (chartAnnotations: any, entityTypeAnnotations: any, chartType: string) {
		const propertyPath: string[] = [];

		if (!entityTypeAnnotations) {
			Log.warning("FE:Macro:MicroChart : Couldn't find annotations for the DataPoint.");
			return undefined;
		}

		for (const measureIndex in chartAnnotations.Measures) {
			const iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(measureIndex, chartAnnotations),
				measureAttribute =
					iMeasureAttribute > -1 && chartAnnotations.MeasureAttributes && chartAnnotations.MeasureAttributes[iMeasureAttribute],
				dataPoint = measureAttribute && entityTypeAnnotations && entityTypeAnnotations[measureAttribute.DataPoint.$AnnotationPath];
			if (dataPoint?.Value?.$Path) {
				propertyPath.push(dataPoint.Value.$Path);
			} else {
				Log.warning(
					`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute ${chartType} MicroChart.`
				);
			}
		}

		return propertyPath.join(",");
	},

	/**
	 * This function returns the visible expression path.
	 *
	 * @param args
	 * @returns Expression Binding for the visible.
	 */
	getHiddenPathExpression: function (...args: any[]) {
		if (!args[0] && !args[1]) {
			return true;
		}
		if (args[0] === true || args[1] === true) {
			return false;
		}

		const hiddenPaths: string[] = [];
		[].forEach.call(args, function (hiddenProperty: any) {
			if (hiddenProperty && hiddenProperty.$Path) {
				hiddenPaths.push("%{" + hiddenProperty.$Path + "}");
			}
		});

		return hiddenPaths.length ? "{= " + hiddenPaths.join(" || ") + " === true ? false : true }" : false;
	},

	/**
	 * This function returns the true/false to display chart.
	 *
	 * @param chartType The chart type
	 * @param value Data point value of Value
	 * @param maxValue Data point value of MaximumValue
	 * @param valueHidden Hidden path object/boolean value for the referenced property of value
	 * @param maxValueHidden Hidden path object/boolean value for the referenced property of MaxValue
	 * @returns `true` or `false` to hide/show chart
	 */
	isNotAlwaysHidden: function (
		chartType: string,
		value: object,
		maxValue: object | undefined,
		valueHidden: boolean | any,
		maxValueHidden?: boolean | any
	) {
		if (valueHidden === true) {
			this.logError(chartType, value);
		}
		if (maxValueHidden === true) {
			this.logError(chartType, maxValue);
		}
		if (valueHidden === undefined && maxValueHidden === undefined) {
			return true;
		} else {
			return ((!valueHidden || valueHidden.$Path) && valueHidden !== undefined) ||
				((!maxValueHidden || maxValueHidden.$Path) && maxValueHidden !== undefined)
				? true
				: false;
		}
	},

	/**
	 * This function is to log errors for missing data point properties.
	 *
	 * @param chartType The chart type.
	 * @param value Dynamic hidden property name.
	 */
	logError: function (chartType: string, value: any) {
		Log.error(`Measure Property ${value.$Path} is hidden for the ${chartType} Micro Chart`);
	},

	/**
	 * This function returns the formatted value with scale factor for the value displayed.
	 *
	 * @param path Property path for the value
	 * @param property The Property for constraints
	 * @param fractionDigits No. of fraction digits specified from annotations
	 * @returns Expression Binding for the value with scale.
	 */
	formatDecimal: function (path: string, property: any, fractionDigits: number) {
		if (!path) {
			return undefined;
		}
		const constraints = [],
			formatOptions = ["style: 'short'"];
		const scale = typeof fractionDigits === "number" ? fractionDigits : (property && property?.$Scale) || 1;

		if (property.$Nullable != undefined) {
			constraints.push("nullable: " + property.$Nullable);
		}
		if (property.$Precision != undefined) {
			formatOptions.push("precision: " + (property.$Precision ? property.$Precision : "1"));
		}
		constraints.push("scale: " + (scale === "variable" ? "'" + scale + "'" : scale));

		return (
			"{ path: '" +
			path +
			"'" +
			", type: 'sap.ui.model.odata.type.Decimal', constraints: { " +
			constraints.join(",") +
			" }, formatOptions: { " +
			formatOptions.join(",") +
			" } }"
		);
	},

	/**
	 * To fetch select parameters from annotations that need to be added to the list binding.
	 *
	 * @param groupId GroupId to be used
	 * @param uomPath Unit of measure path
	 * @param criticality Criticality for the chart
	 * @param criticalityPath Criticality calculation object property path
	 * @returns String containing all the property paths needed to be added to the $select query of the list binding.
	 * @private
	 */
	getSelectParameters: function (groupId: string, uomPath: any, criticality: string, ...criticalityPath: string[]): string {
		const propertyPath: string[] = [],
			parameters: string[] = [];

		if (groupId) {
			parameters.push(`$$groupId : '${groupId}'`);
		}

		if (criticality) {
			propertyPath.push(criticality);
		} else if (uomPath) {
			for (const k in uomPath) {
				if (!uomPath[k].$EnumMember && uomPath[k].$Path) {
					propertyPath.push(uomPath[k].$Path);
				}
			}
		}

		for (const path of criticalityPath) {
			if (path) {
				propertyPath.push(path);
			}
		}

		if (propertyPath.length) {
			parameters.push(`$select : '${propertyPath.join(",")}'`);
		}

		return parameters.join(",");
	},

	/**
	 * To fetch DataPoint Qualifiers of measures.
	 *
	 * @param chartAnnotations Chart Annotations
	 * @param entityTypeAnnotations EntityType Annotations
	 * @param chartType Chart Type used
	 * @returns Containing all data point Qualifiers.
	 * @private
	 */
	getDataPointQualifiersForMeasures: function (chartAnnotations: Chart, entityTypeAnnotations: any, chartType: string) {
		const qualifiers: string[] = [],
			measureAttributes = chartAnnotations.MeasureAttributes,
			fnAddDataPointQualifier = function (chartMeasure: any) {
				const measure = chartMeasure.$PropertyPath;
				let qualifier: string | undefined;
				if (entityTypeAnnotations) {
					measureAttributes.forEach(function (measureAttribute: any) {
						if (measureAttribute.Measure?.$PropertyPath === measure && measureAttribute.DataPoint?.$AnnotationPath) {
							const annotationPath = measureAttribute.DataPoint.$AnnotationPath;
							if (entityTypeAnnotations[annotationPath]) {
								qualifier = annotationPath.split("#")[1];
								if (qualifier) {
									qualifiers.push(qualifier);
								}
							}
						}
					});
				}
				if (qualifier === undefined) {
					Log.warning(
						`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute for ${chartType} MicroChart.`
					);
				}
			};

		if (!entityTypeAnnotations) {
			Log.warning(`FE:Macro:MicroChart : Couldn't find annotations for the DataPoint ${chartType} MicroChart.`);
		}
		chartAnnotations.Measures.forEach(fnAddDataPointQualifier);
		return qualifiers.join(",");
	},

	/**
	 * This function is to log warnings for missing datapoint properties.
	 *
	 * @param chartType The Chart type.
	 * @param error Object with properties from DataPoint.
	 */
	logWarning: function (chartType: string, error: any) {
		for (const key in error) {
			if (!error[key]) {
				Log.warning(`${key} parameter is missing for the ${chartType} Micro Chart`);
			}
		}
	},

	/**
	 * This function is used to get DisplayValue for comparison micro chart data aggregation.
	 *
	 * @param dataPoint Data point object.
	 * @param pathText Object after evaluating @com.sap.vocabularies.Common.v1.Text annotation
	 * @param valueTextPath Evaluation of @com.sap.vocabularies.Common.v1.Text/$Path/$ value of the annotation
	 * @param valueDataPointPath DataPoint>Value/$Path/$ value after evaluating annotation
	 * @returns Expression binding for Display Value for comparison micro chart's aggregation data.
	 */
	getDisplayValueForMicroChart: function (dataPoint: any, pathText: any, valueTextPath: object, valueDataPointPath: object) {
		const valueFormat = dataPoint.ValueFormat && dataPoint.ValueFormat.NumberOfFractionalDigits;
		if (pathText) {
			return MicroChartHelper.formatDecimal(pathText["$Path"], valueTextPath, valueFormat);
		}
		return MicroChartHelper.formatDecimal(dataPoint.Value["$Path"], valueDataPointPath, valueFormat);
	},

	/**
	 * This function is used to check whether micro chart is enabled or not by checking properties, chart annotations, hidden properties.
	 *
	 * @param chartType MicroChart Type eg:- Bullet.
	 * @param dataPoint Data point object.
	 * @param dataPointValueHidden Object with $Path annotation to get hidden value path
	 * @param chartAnnotations ChartAnnotation object
	 * @param dataPointMaxValue Object with $Path annotation to get hidden max value path
	 * @returns `true` if the chart has all values and properties and also it is not always hidden sFinalDataPointValue && bMicrochartVisible.
	 */
	shouldMicroChartRender: function (
		chartType: string,
		dataPoint: DataPointType,
		dataPointValueHidden: any,
		chartAnnotations: Chart,
		dataPointMaxValue: any
	) {
		const availableChartTypes = ["Area", "Column", "Comparison"],
			dataPointValue = dataPoint && dataPoint.Value,
			hiddenPath = dataPointValueHidden && dataPointValueHidden[UIAnnotationTerms.Hidden],
			chartAnnotationDimension = chartAnnotations && chartAnnotations.Dimensions && chartAnnotations.Dimensions[0],
			finalDataPointValue = availableChartTypes.indexOf(chartType) > -1 ? dataPointValue && chartAnnotationDimension : dataPointValue; // only for three charts in array
		if (chartType === "Harvey") {
			const dataPointMaximumValue = dataPoint && dataPoint.MaximumValue,
				maxValueHiddenPath = dataPointMaxValue && dataPointMaxValue[UIAnnotationTerms.Hidden];
			return (
				dataPointValue &&
				dataPointMaximumValue &&
				MicroChartHelper.isNotAlwaysHidden("Bullet", dataPointValue, dataPointMaximumValue, hiddenPath, maxValueHiddenPath)
			);
		}
		return finalDataPointValue && MicroChartHelper.isNotAlwaysHidden(chartType, dataPointValue, undefined, hiddenPath);
	},

	/**
	 * This function is used to get dataPointQualifiers for Column, Comparison and StackedBar micro charts.
	 *
	 * @param annotationPath
	 * @returns Result string or undefined.
	 */
	getDataPointQualifiersForMicroChart: function (annotationPath: string) {
		if (annotationPath.indexOf(UIAnnotationTerms.DataPoint) === -1) {
			return undefined;
		}
		return annotationPath.split("#")[1] ?? "";
	},

	/**
	 * This function is used to get colorPalette for comparison and HarveyBall Microcharts.
	 *
	 * @param dataPoint Data point object.
	 * @returns Result string for colorPalette or undefined.
	 */
	getColorPaletteForMicroChart: function (dataPoint: DataPointType) {
		return dataPoint.Criticality
			? undefined
			: "sapUiChartPaletteQualitativeHue1, sapUiChartPaletteQualitativeHue2, sapUiChartPaletteQualitativeHue3,          sapUiChartPaletteQualitativeHue4, sapUiChartPaletteQualitativeHue5, sapUiChartPaletteQualitativeHue6, sapUiChartPaletteQualitativeHue7,          sapUiChartPaletteQualitativeHue8, sapUiChartPaletteQualitativeHue9, sapUiChartPaletteQualitativeHue10, sapUiChartPaletteQualitativeHue11";
	},

	/**
	 * This function is used to get MeasureScale for Area, Column and Line micro charts.
	 *
	 * @param dataPoint Data point object.
	 * @returns Data point value format fractional digits or data point scale or 1.
	 */
	getMeasureScaleForMicroChart: function (dataPoint: DataPointType) {
		if (dataPoint.ValueFormat && dataPoint.ValueFormat.NumberOfFractionalDigits) {
			return dataPoint.ValueFormat.NumberOfFractionalDigits;
		}
		if (dataPoint.Value && dataPoint.Value["$Path"] && dataPoint.Value["$Path"]["$Scale"]) {
			return dataPoint.Value["$Path"]["$Scale"];
		}
		return 1;
	},

	/**
	 * This function is to return the binding expression of microchart.
	 *
	 * @param chartType The type of micro chart (Bullet, Radial etc.)
	 * @param measure Measure value for micro chart.
	 * @param microChart `this`/current model for micro chart.
	 * @param collection Collection object.
	 * @param uiName The @sapui.name in collection model is not accessible here from model hence need to pass it.
	 * @param dataPoint Data point object used in case of Harvey Ball micro chart
	 * @returns The binding expression for micro chart.
	 * @private
	 */
	getBindingExpressionForMicrochart: function (
		chartType: string,
		measure: any,
		microChart: MicroChartBlock,
		collection: MetaModelNavProperty,
		uiName: string,
		dataPoint: any
	) {
		const condition = collection["$isCollection"] || collection["$kind"] === "EntitySet";
		const path = condition ? "" : uiName;
		let currencyOrUnit = MicroChartHelper.getUOMPathForMicrochart(measure);
		let dataPointCriticallity = "";
		switch (chartType) {
			case "Radial":
				currencyOrUnit = "";
				break;
			case "Harvey":
				dataPointCriticallity = dataPoint.Criticality ? dataPoint.Criticality["$Path"] : "";
				break;
		}
		const functionValue = MicroChartHelper.getSelectParameters(microChart.batchGroupId, "", dataPointCriticallity, currencyOrUnit);

		return `{ path: '${path}'` + `, parameters : {${functionValue}} }`;
	},

	/**
	 * This function is to return the UOMPath expression of the micro chart.
	 *
	 * @param showOnlyChart Whether only chart should be rendered or not.
	 * @param measure Measures for the micro chart.
	 * @returns UOMPath String for the micro chart.
	 * @private
	 */
	getUOMPathForMicrochart: function (showOnlyChart: boolean, measure?: any) {
		if (measure && !showOnlyChart) {
			return (
				(measure[`@${MeasuresAnnotationTerms.ISOCurrency}`] && measure[`@${MeasuresAnnotationTerms.ISOCurrency}`].$Path) ||
				(measure[`@${MeasuresAnnotationTerms.Unit}`] && measure[`@${MeasuresAnnotationTerms.Unit}`].$Path)
			);
		}
		return undefined;
	},

	/**
	 * This function is to return the aggregation binding expression of micro chart.
	 *
	 * @param aggregationType Aggregation type of chart (eg:- Point for AreaMicrochart)
	 * @param collection Collection object.
	 * @param dataPoint Data point info for micro chart.
	 * @param uiName The @sapui.name in collection model is not accessible here from model hence need to pass it.
	 * @param dimension Micro chart Dimensions.
	 * @param measure Measure value for micro chart.
	 * @param measureOrDimensionBar The measure or dimension passed specifically in case of bar chart
	 * @returns Aggregation binding expression for micro chart.
	 * @private
	 */
	getAggregationForMicrochart: function (
		aggregationType: string,
		collection: MetaModelNavProperty,
		dataPoint: any,
		uiName: string,
		dimension: any,
		measure: any,
		measureOrDimensionBar: string
	) {
		let path = collection["$kind"] === "EntitySet" ? "/" : "";
		path = path + uiName;
		const groupId = "";
		let dataPointCriticallityCalc = "";
		let dataPointCriticallity = dataPoint.Criticality ? dataPoint.Criticality["$Path"] : "";
		const currencyOrUnit = MicroChartHelper.getUOMPathForMicrochart(false, measure);
		let targetValuePath = "";
		let dimensionPropertyPath = "";
		if (dimension && dimension.$PropertyPath && dimension.$PropertyPath[`@${CommonAnnotationTerms.Text}`]) {
			dimensionPropertyPath = dimension.$PropertyPath[`@${CommonAnnotationTerms.Text}`].$Path;
		} else {
			dimensionPropertyPath = dimension.$PropertyPath;
		}
		switch (aggregationType) {
			case "Points":
				dataPointCriticallityCalc = dataPoint && dataPoint.CriticalityCalculation;
				targetValuePath = dataPoint && dataPoint.TargetValue && dataPoint.TargetValue["$Path"];
				dataPointCriticallity = "";
				break;
			case "Columns":
				dataPointCriticallityCalc = dataPoint && dataPoint.CriticalityCalculation;
				break;
			case "LinePoints":
				dataPointCriticallity = "";
				break;
			case "Bars":
				dimensionPropertyPath = "";
				break;
		}
		const functionValue = MicroChartHelper.getSelectParameters(
			groupId,
			dataPointCriticallityCalc,
			dataPointCriticallity,
			currencyOrUnit,
			targetValuePath,
			dimensionPropertyPath,
			measureOrDimensionBar
		);

		return `{path:'${path}'` + `, parameters : {${functionValue}} }`;
	},

	getCurrencyOrUnit: function (measure: any) {
		if (measure[`@${MeasuresAnnotationTerms.ISOCurrency}`]) {
			return measure[`@${MeasuresAnnotationTerms.ISOCurrency}`].$Path || measure[`@${MeasuresAnnotationTerms.ISOCurrency}`];
		}
		if (measure[`@${MeasuresAnnotationTerms.Unit}`]) {
			return measure[`@${MeasuresAnnotationTerms.Unit}`].$Path || measure[`@${MeasuresAnnotationTerms.Unit}`];
		}
		return "";
	},

	getCalendarPattern: function (propertyType: string, annotations: Record<string, unknown>) {
		return (
			(annotations[`@${CommonAnnotationTerms.IsCalendarYear}`] && "yyyy") ||
			(annotations[`@${CommonAnnotationTerms.IsCalendarQuarter}`] && "Q") ||
			(annotations[`@${CommonAnnotationTerms.IsCalendarMonth}`] && "MM") ||
			(annotations[`@${CommonAnnotationTerms.IsCalendarWeek}`] && "ww") ||
			(annotations[`@${CommonAnnotationTerms.IsCalendarDate}`] && "yyyyMMdd") ||
			(annotations[`@${CommonAnnotationTerms.IsCalendarYearMonth}`] && "yyyyMM") ||
			(propertyType === "Edm.Date" && "yyyy-MM-dd") ||
			undefined
		);
	},

	formatDimension: function (date: string, pattern: string, propertyPath: string) {
		const value = DateFormat.getDateInstance({ pattern }).parse(date, false, true);
		if (value instanceof Date) {
			return value.getTime();
		} else {
			Log.warning("Date value could not be determined for " + propertyPath);
		}
		return 0;
	},

	formatStringDimension: function (value: any, pattern: string, propertyPath: string) {
		if (pattern in calendarPatternMap) {
			const matchedValue = value?.toString().match(calendarPatternMap[pattern]);
			if (matchedValue && matchedValue?.length) {
				return MicroChartHelper.formatDimension(matchedValue[0], pattern, propertyPath);
			}
		}
		Log.warning("Pattern not supported for " + propertyPath);
		return 0;
	},

	getX: function (propertyPath: string, propertyType: string, annotations?: Record<string, unknown>) {
		const pattern = annotations && MicroChartHelper.getCalendarPattern(propertyType, annotations);
		if (pattern && ["Edm.Date", "Edm.String"].some((type) => type === propertyType)) {
			return `{parts: [{path: '${propertyPath}', targetType: 'any'}, {value: '${pattern}'}, {value: '${propertyPath}'}], formatter: 'MICROCHARTR.formatStringDimension'}`;
		}
	}
};

export default MicroChartHelper;
