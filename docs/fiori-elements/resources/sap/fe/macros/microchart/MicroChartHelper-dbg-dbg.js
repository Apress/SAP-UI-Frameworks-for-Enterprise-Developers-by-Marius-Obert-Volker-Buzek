/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/macros/CommonHelper", "sap/m/library", "sap/ui/core/format/DateFormat"], function (Log, CommonHelper, mobilelibrary, DateFormat) {
  "use strict";

  const ValueColor = mobilelibrary.ValueColor;
  const calendarPatternMap = {
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
    getThresholdColor: function (value, iContext) {
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
    getMeasurePropertyPaths: function (chartAnnotations, entityTypeAnnotations, chartType) {
      const propertyPath = [];
      if (!entityTypeAnnotations) {
        Log.warning("FE:Macro:MicroChart : Couldn't find annotations for the DataPoint.");
        return undefined;
      }
      for (const measureIndex in chartAnnotations.Measures) {
        var _dataPoint$Value;
        const iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(measureIndex, chartAnnotations),
          measureAttribute = iMeasureAttribute > -1 && chartAnnotations.MeasureAttributes && chartAnnotations.MeasureAttributes[iMeasureAttribute],
          dataPoint = measureAttribute && entityTypeAnnotations && entityTypeAnnotations[measureAttribute.DataPoint.$AnnotationPath];
        if (dataPoint !== null && dataPoint !== void 0 && (_dataPoint$Value = dataPoint.Value) !== null && _dataPoint$Value !== void 0 && _dataPoint$Value.$Path) {
          propertyPath.push(dataPoint.Value.$Path);
        } else {
          Log.warning(`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute ${chartType} MicroChart.`);
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
    getHiddenPathExpression: function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (!args[0] && !args[1]) {
        return true;
      }
      if (args[0] === true || args[1] === true) {
        return false;
      }
      const hiddenPaths = [];
      [].forEach.call(args, function (hiddenProperty) {
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
    isNotAlwaysHidden: function (chartType, value, maxValue, valueHidden, maxValueHidden) {
      if (valueHidden === true) {
        this.logError(chartType, value);
      }
      if (maxValueHidden === true) {
        this.logError(chartType, maxValue);
      }
      if (valueHidden === undefined && maxValueHidden === undefined) {
        return true;
      } else {
        return (!valueHidden || valueHidden.$Path) && valueHidden !== undefined || (!maxValueHidden || maxValueHidden.$Path) && maxValueHidden !== undefined ? true : false;
      }
    },
    /**
     * This function is to log errors for missing data point properties.
     *
     * @param chartType The chart type.
     * @param value Dynamic hidden property name.
     */
    logError: function (chartType, value) {
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
    formatDecimal: function (path, property, fractionDigits) {
      if (!path) {
        return undefined;
      }
      const constraints = [],
        formatOptions = ["style: 'short'"];
      const scale = typeof fractionDigits === "number" ? fractionDigits : property && (property === null || property === void 0 ? void 0 : property.$Scale) || 1;
      if (property.$Nullable != undefined) {
        constraints.push("nullable: " + property.$Nullable);
      }
      if (property.$Precision != undefined) {
        formatOptions.push("precision: " + (property.$Precision ? property.$Precision : "1"));
      }
      constraints.push("scale: " + (scale === "variable" ? "'" + scale + "'" : scale));
      return "{ path: '" + path + "'" + ", type: 'sap.ui.model.odata.type.Decimal', constraints: { " + constraints.join(",") + " }, formatOptions: { " + formatOptions.join(",") + " } }";
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
    getSelectParameters: function (groupId, uomPath, criticality) {
      const propertyPath = [],
        parameters = [];
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
      for (var _len2 = arguments.length, criticalityPath = new Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        criticalityPath[_key2 - 3] = arguments[_key2];
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
    getDataPointQualifiersForMeasures: function (chartAnnotations, entityTypeAnnotations, chartType) {
      const qualifiers = [],
        measureAttributes = chartAnnotations.MeasureAttributes,
        fnAddDataPointQualifier = function (chartMeasure) {
          const measure = chartMeasure.$PropertyPath;
          let qualifier;
          if (entityTypeAnnotations) {
            measureAttributes.forEach(function (measureAttribute) {
              var _measureAttribute$Mea, _measureAttribute$Dat;
              if (((_measureAttribute$Mea = measureAttribute.Measure) === null || _measureAttribute$Mea === void 0 ? void 0 : _measureAttribute$Mea.$PropertyPath) === measure && (_measureAttribute$Dat = measureAttribute.DataPoint) !== null && _measureAttribute$Dat !== void 0 && _measureAttribute$Dat.$AnnotationPath) {
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
            Log.warning(`FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute for ${chartType} MicroChart.`);
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
    logWarning: function (chartType, error) {
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
    getDisplayValueForMicroChart: function (dataPoint, pathText, valueTextPath, valueDataPointPath) {
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
    shouldMicroChartRender: function (chartType, dataPoint, dataPointValueHidden, chartAnnotations, dataPointMaxValue) {
      const availableChartTypes = ["Area", "Column", "Comparison"],
        dataPointValue = dataPoint && dataPoint.Value,
        hiddenPath = dataPointValueHidden && dataPointValueHidden["com.sap.vocabularies.UI.v1.Hidden"],
        chartAnnotationDimension = chartAnnotations && chartAnnotations.Dimensions && chartAnnotations.Dimensions[0],
        finalDataPointValue = availableChartTypes.indexOf(chartType) > -1 ? dataPointValue && chartAnnotationDimension : dataPointValue; // only for three charts in array
      if (chartType === "Harvey") {
        const dataPointMaximumValue = dataPoint && dataPoint.MaximumValue,
          maxValueHiddenPath = dataPointMaxValue && dataPointMaxValue["com.sap.vocabularies.UI.v1.Hidden"];
        return dataPointValue && dataPointMaximumValue && MicroChartHelper.isNotAlwaysHidden("Bullet", dataPointValue, dataPointMaximumValue, hiddenPath, maxValueHiddenPath);
      }
      return finalDataPointValue && MicroChartHelper.isNotAlwaysHidden(chartType, dataPointValue, undefined, hiddenPath);
    },
    /**
     * This function is used to get dataPointQualifiers for Column, Comparison and StackedBar micro charts.
     *
     * @param annotationPath
     * @returns Result string or undefined.
     */
    getDataPointQualifiersForMicroChart: function (annotationPath) {
      if (annotationPath.indexOf("com.sap.vocabularies.UI.v1.DataPoint") === -1) {
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
    getColorPaletteForMicroChart: function (dataPoint) {
      return dataPoint.Criticality ? undefined : "sapUiChartPaletteQualitativeHue1, sapUiChartPaletteQualitativeHue2, sapUiChartPaletteQualitativeHue3,          sapUiChartPaletteQualitativeHue4, sapUiChartPaletteQualitativeHue5, sapUiChartPaletteQualitativeHue6, sapUiChartPaletteQualitativeHue7,          sapUiChartPaletteQualitativeHue8, sapUiChartPaletteQualitativeHue9, sapUiChartPaletteQualitativeHue10, sapUiChartPaletteQualitativeHue11";
    },
    /**
     * This function is used to get MeasureScale for Area, Column and Line micro charts.
     *
     * @param dataPoint Data point object.
     * @returns Data point value format fractional digits or data point scale or 1.
     */
    getMeasureScaleForMicroChart: function (dataPoint) {
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
    getBindingExpressionForMicrochart: function (chartType, measure, microChart, collection, uiName, dataPoint) {
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
    getUOMPathForMicrochart: function (showOnlyChart, measure) {
      if (measure && !showOnlyChart) {
        return measure[`@${"Org.OData.Measures.V1.ISOCurrency"}`] && measure[`@${"Org.OData.Measures.V1.ISOCurrency"}`].$Path || measure[`@${"Org.OData.Measures.V1.Unit"}`] && measure[`@${"Org.OData.Measures.V1.Unit"}`].$Path;
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
    getAggregationForMicrochart: function (aggregationType, collection, dataPoint, uiName, dimension, measure, measureOrDimensionBar) {
      let path = collection["$kind"] === "EntitySet" ? "/" : "";
      path = path + uiName;
      const groupId = "";
      let dataPointCriticallityCalc = "";
      let dataPointCriticallity = dataPoint.Criticality ? dataPoint.Criticality["$Path"] : "";
      const currencyOrUnit = MicroChartHelper.getUOMPathForMicrochart(false, measure);
      let targetValuePath = "";
      let dimensionPropertyPath = "";
      if (dimension && dimension.$PropertyPath && dimension.$PropertyPath[`@${"com.sap.vocabularies.Common.v1.Text"}`]) {
        dimensionPropertyPath = dimension.$PropertyPath[`@${"com.sap.vocabularies.Common.v1.Text"}`].$Path;
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
      const functionValue = MicroChartHelper.getSelectParameters(groupId, dataPointCriticallityCalc, dataPointCriticallity, currencyOrUnit, targetValuePath, dimensionPropertyPath, measureOrDimensionBar);
      return `{path:'${path}'` + `, parameters : {${functionValue}} }`;
    },
    getCurrencyOrUnit: function (measure) {
      if (measure[`@${"Org.OData.Measures.V1.ISOCurrency"}`]) {
        return measure[`@${"Org.OData.Measures.V1.ISOCurrency"}`].$Path || measure[`@${"Org.OData.Measures.V1.ISOCurrency"}`];
      }
      if (measure[`@${"Org.OData.Measures.V1.Unit"}`]) {
        return measure[`@${"Org.OData.Measures.V1.Unit"}`].$Path || measure[`@${"Org.OData.Measures.V1.Unit"}`];
      }
      return "";
    },
    getCalendarPattern: function (propertyType, annotations) {
      return annotations[`@${"com.sap.vocabularies.Common.v1.IsCalendarYear"}`] && "yyyy" || annotations[`@${"com.sap.vocabularies.Common.v1.IsCalendarQuarter"}`] && "Q" || annotations[`@${"com.sap.vocabularies.Common.v1.IsCalendarMonth"}`] && "MM" || annotations[`@${"com.sap.vocabularies.Common.v1.IsCalendarWeek"}`] && "ww" || annotations[`@${"com.sap.vocabularies.Common.v1.IsCalendarDate"}`] && "yyyyMMdd" || annotations[`@${"com.sap.vocabularies.Common.v1.IsCalendarYearMonth"}`] && "yyyyMM" || propertyType === "Edm.Date" && "yyyy-MM-dd" || undefined;
    },
    formatDimension: function (date, pattern, propertyPath) {
      const value = DateFormat.getDateInstance({
        pattern
      }).parse(date, false, true);
      if (value instanceof Date) {
        return value.getTime();
      } else {
        Log.warning("Date value could not be determined for " + propertyPath);
      }
      return 0;
    },
    formatStringDimension: function (value, pattern, propertyPath) {
      if (pattern in calendarPatternMap) {
        const matchedValue = value === null || value === void 0 ? void 0 : value.toString().match(calendarPatternMap[pattern]);
        if (matchedValue && matchedValue !== null && matchedValue !== void 0 && matchedValue.length) {
          return MicroChartHelper.formatDimension(matchedValue[0], pattern, propertyPath);
        }
      }
      Log.warning("Pattern not supported for " + propertyPath);
      return 0;
    },
    getX: function (propertyPath, propertyType, annotations) {
      const pattern = annotations && MicroChartHelper.getCalendarPattern(propertyType, annotations);
      if (pattern && ["Edm.Date", "Edm.String"].some(type => type === propertyType)) {
        return `{parts: [{path: '${propertyPath}', targetType: 'any'}, {value: '${pattern}'}, {value: '${propertyPath}'}], formatter: 'MICROCHARTR.formatStringDimension'}`;
      }
    }
  };
  return MicroChartHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUNvbG9yIiwibW9iaWxlbGlicmFyeSIsImNhbGVuZGFyUGF0dGVybk1hcCIsInl5eXkiLCJRIiwiTU0iLCJ3dyIsInl5eXlNTWRkIiwieXl5eU1NIiwiTWljcm9DaGFydEhlbHBlciIsImdldFRocmVzaG9sZENvbG9yIiwidmFsdWUiLCJpQ29udGV4dCIsInBhdGgiLCJjb250ZXh0IiwiZ2V0UGF0aCIsImluZGV4T2YiLCJFcnJvciIsIkNyaXRpY2FsIiwiTmV1dHJhbCIsImdldE1lYXN1cmVQcm9wZXJ0eVBhdGhzIiwiY2hhcnRBbm5vdGF0aW9ucyIsImVudGl0eVR5cGVBbm5vdGF0aW9ucyIsImNoYXJ0VHlwZSIsInByb3BlcnR5UGF0aCIsIkxvZyIsIndhcm5pbmciLCJ1bmRlZmluZWQiLCJtZWFzdXJlSW5kZXgiLCJNZWFzdXJlcyIsImlNZWFzdXJlQXR0cmlidXRlIiwiQ29tbW9uSGVscGVyIiwiZ2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4IiwibWVhc3VyZUF0dHJpYnV0ZSIsIk1lYXN1cmVBdHRyaWJ1dGVzIiwiZGF0YVBvaW50IiwiRGF0YVBvaW50IiwiJEFubm90YXRpb25QYXRoIiwiVmFsdWUiLCIkUGF0aCIsInB1c2giLCJqb2luIiwiZ2V0SGlkZGVuUGF0aEV4cHJlc3Npb24iLCJhcmdzIiwiaGlkZGVuUGF0aHMiLCJmb3JFYWNoIiwiY2FsbCIsImhpZGRlblByb3BlcnR5IiwibGVuZ3RoIiwiaXNOb3RBbHdheXNIaWRkZW4iLCJtYXhWYWx1ZSIsInZhbHVlSGlkZGVuIiwibWF4VmFsdWVIaWRkZW4iLCJsb2dFcnJvciIsImVycm9yIiwiZm9ybWF0RGVjaW1hbCIsInByb3BlcnR5IiwiZnJhY3Rpb25EaWdpdHMiLCJjb25zdHJhaW50cyIsImZvcm1hdE9wdGlvbnMiLCJzY2FsZSIsIiRTY2FsZSIsIiROdWxsYWJsZSIsIiRQcmVjaXNpb24iLCJnZXRTZWxlY3RQYXJhbWV0ZXJzIiwiZ3JvdXBJZCIsInVvbVBhdGgiLCJjcml0aWNhbGl0eSIsInBhcmFtZXRlcnMiLCJrIiwiJEVudW1NZW1iZXIiLCJjcml0aWNhbGl0eVBhdGgiLCJnZXREYXRhUG9pbnRRdWFsaWZpZXJzRm9yTWVhc3VyZXMiLCJxdWFsaWZpZXJzIiwibWVhc3VyZUF0dHJpYnV0ZXMiLCJmbkFkZERhdGFQb2ludFF1YWxpZmllciIsImNoYXJ0TWVhc3VyZSIsIm1lYXN1cmUiLCIkUHJvcGVydHlQYXRoIiwicXVhbGlmaWVyIiwiTWVhc3VyZSIsImFubm90YXRpb25QYXRoIiwic3BsaXQiLCJsb2dXYXJuaW5nIiwia2V5IiwiZ2V0RGlzcGxheVZhbHVlRm9yTWljcm9DaGFydCIsInBhdGhUZXh0IiwidmFsdWVUZXh0UGF0aCIsInZhbHVlRGF0YVBvaW50UGF0aCIsInZhbHVlRm9ybWF0IiwiVmFsdWVGb3JtYXQiLCJOdW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMiLCJzaG91bGRNaWNyb0NoYXJ0UmVuZGVyIiwiZGF0YVBvaW50VmFsdWVIaWRkZW4iLCJkYXRhUG9pbnRNYXhWYWx1ZSIsImF2YWlsYWJsZUNoYXJ0VHlwZXMiLCJkYXRhUG9pbnRWYWx1ZSIsImhpZGRlblBhdGgiLCJjaGFydEFubm90YXRpb25EaW1lbnNpb24iLCJEaW1lbnNpb25zIiwiZmluYWxEYXRhUG9pbnRWYWx1ZSIsImRhdGFQb2ludE1heGltdW1WYWx1ZSIsIk1heGltdW1WYWx1ZSIsIm1heFZhbHVlSGlkZGVuUGF0aCIsImdldERhdGFQb2ludFF1YWxpZmllcnNGb3JNaWNyb0NoYXJ0IiwiZ2V0Q29sb3JQYWxldHRlRm9yTWljcm9DaGFydCIsIkNyaXRpY2FsaXR5IiwiZ2V0TWVhc3VyZVNjYWxlRm9yTWljcm9DaGFydCIsImdldEJpbmRpbmdFeHByZXNzaW9uRm9yTWljcm9jaGFydCIsIm1pY3JvQ2hhcnQiLCJjb2xsZWN0aW9uIiwidWlOYW1lIiwiY29uZGl0aW9uIiwiY3VycmVuY3lPclVuaXQiLCJnZXRVT01QYXRoRm9yTWljcm9jaGFydCIsImRhdGFQb2ludENyaXRpY2FsbGl0eSIsImZ1bmN0aW9uVmFsdWUiLCJiYXRjaEdyb3VwSWQiLCJzaG93T25seUNoYXJ0IiwiZ2V0QWdncmVnYXRpb25Gb3JNaWNyb2NoYXJ0IiwiYWdncmVnYXRpb25UeXBlIiwiZGltZW5zaW9uIiwibWVhc3VyZU9yRGltZW5zaW9uQmFyIiwiZGF0YVBvaW50Q3JpdGljYWxsaXR5Q2FsYyIsInRhcmdldFZhbHVlUGF0aCIsImRpbWVuc2lvblByb3BlcnR5UGF0aCIsIkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24iLCJUYXJnZXRWYWx1ZSIsImdldEN1cnJlbmN5T3JVbml0IiwiZ2V0Q2FsZW5kYXJQYXR0ZXJuIiwicHJvcGVydHlUeXBlIiwiYW5ub3RhdGlvbnMiLCJmb3JtYXREaW1lbnNpb24iLCJkYXRlIiwicGF0dGVybiIsIkRhdGVGb3JtYXQiLCJnZXREYXRlSW5zdGFuY2UiLCJwYXJzZSIsIkRhdGUiLCJnZXRUaW1lIiwiZm9ybWF0U3RyaW5nRGltZW5zaW9uIiwibWF0Y2hlZFZhbHVlIiwidG9TdHJpbmciLCJtYXRjaCIsImdldFgiLCJzb21lIiwidHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWljcm9DaGFydEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgTWVhc3VyZXNBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL01lYXN1cmVzXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0LCBEYXRhUG9pbnRUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgbW9iaWxlbGlicmFyeSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IERhdGVGb3JtYXQgZnJvbSBcInNhcC91aS9jb3JlL2Zvcm1hdC9EYXRlRm9ybWF0XCI7XG5pbXBvcnQgeyBNZXRhTW9kZWxOYXZQcm9wZXJ0eSB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcbmltcG9ydCBNaWNyb0NoYXJ0QmxvY2sgZnJvbSBcIi4vTWljcm9DaGFydC5ibG9ja1wiO1xuXG5jb25zdCBWYWx1ZUNvbG9yID0gbW9iaWxlbGlicmFyeS5WYWx1ZUNvbG9yO1xuXG5jb25zdCBjYWxlbmRhclBhdHRlcm5NYXA6IHsgW2tleTogc3RyaW5nXTogUmVnRXhwIH0gPSB7XG5cdHl5eXk6IC9bMS05XVswLTldezMsfXwwWzAtOV17M30vLFxuXHRROiAvWzEtNF0vLFxuXHRNTTogLzBbMS05XXwxWzAtMl0vLFxuXHR3dzogLzBbMS05XXxbMS00XVswLTldfDVbMC0zXS8sXG5cdHl5eXlNTWRkOiAvKFsxLTldWzAtOV17Myx9fDBbMC05XXszfSkoMFsxLTldfDFbMC0yXSkoMFsxLTldfFsxMl1bMC05XXwzWzAxXSkvLFxuXHR5eXl5TU06IC8oWzEtOV1bMC05XXszLH18MFswLTldezN9KSgwWzEtOV18MVswLTJdKS8sXG5cdFwieXl5eS1NTS1kZFwiOiAvKFsxLTldWzAtOV17Myx9fDBbMC05XXszfSktKDBbMS05XXwxWzAtMl0pLSgwWzEtOV18WzEyXVswLTldfDNbMDFdKS9cbn07XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIHVzZWQgYnkgTURDX0NvbnRyb2xzIHRvIGhhbmRsZSBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0XG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuY29uc3QgTWljcm9DaGFydEhlbHBlciA9IHtcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgVGhyZXNob2xkIENvbG9yIGZvciBidWxsZXQgbWljcm8gY2hhcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaHJlc2hvbGQgdmFsdWUgcHJvdmlkZWQgaW4gdGhlIGFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBpQ29udGV4dCBJbnRlcmZhY2VDb250ZXh0IHdpdGggcGF0aCB0byB0aGUgdGhyZXNob2xkXG5cdCAqIEByZXR1cm5zIFRoZSBpbmRpY2F0b3IgZm9yIFRocmVzaG9sZCBDb2xvclxuXHQgKi9cblx0Z2V0VGhyZXNob2xkQ29sb3I6IGZ1bmN0aW9uICh2YWx1ZTogc3RyaW5nLCBpQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3QgcGF0aCA9IGlDb250ZXh0LmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGlmIChwYXRoLmluZGV4T2YoXCJEZXZpYXRpb25SYW5nZVwiKSA+IC0xKSB7XG5cdFx0XHRyZXR1cm4gVmFsdWVDb2xvci5FcnJvcjtcblx0XHR9IGVsc2UgaWYgKHBhdGguaW5kZXhPZihcIlRvbGVyYW5jZVJhbmdlXCIpID4gLTEpIHtcblx0XHRcdHJldHVybiBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdH1cblx0XHRyZXR1cm4gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUbyBmZXRjaCBtZWFzdXJlcyBmcm9tIERhdGFQb2ludHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjaGFydEFubm90YXRpb25zIENoYXJ0IEFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlQW5ub3RhdGlvbnMgRW50aXR5VHlwZSBBbm5vdGF0aW9uc1xuXHQgKiBAcGFyYW0gY2hhcnRUeXBlIENoYXJ0IFR5cGUgdXNlZFxuXHQgKiBAcmV0dXJucyBDb250YWluaW5nIGFsbCBtZWFzdXJlcy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldE1lYXN1cmVQcm9wZXJ0eVBhdGhzOiBmdW5jdGlvbiAoY2hhcnRBbm5vdGF0aW9uczogYW55LCBlbnRpdHlUeXBlQW5ub3RhdGlvbnM6IGFueSwgY2hhcnRUeXBlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGg6IHN0cmluZ1tdID0gW107XG5cblx0XHRpZiAoIWVudGl0eVR5cGVBbm5vdGF0aW9ucykge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJGRTpNYWNybzpNaWNyb0NoYXJ0IDogQ291bGRuJ3QgZmluZCBhbm5vdGF0aW9ucyBmb3IgdGhlIERhdGFQb2ludC5cIik7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgbWVhc3VyZUluZGV4IGluIGNoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZXMpIHtcblx0XHRcdGNvbnN0IGlNZWFzdXJlQXR0cmlidXRlID0gQ29tbW9uSGVscGVyLmdldE1lYXN1cmVBdHRyaWJ1dGVJbmRleChtZWFzdXJlSW5kZXgsIGNoYXJ0QW5ub3RhdGlvbnMpLFxuXHRcdFx0XHRtZWFzdXJlQXR0cmlidXRlID1cblx0XHRcdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA+IC0xICYmIGNoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXMgJiYgY2hhcnRBbm5vdGF0aW9ucy5NZWFzdXJlQXR0cmlidXRlc1tpTWVhc3VyZUF0dHJpYnV0ZV0sXG5cdFx0XHRcdGRhdGFQb2ludCA9IG1lYXN1cmVBdHRyaWJ1dGUgJiYgZW50aXR5VHlwZUFubm90YXRpb25zICYmIGVudGl0eVR5cGVBbm5vdGF0aW9uc1ttZWFzdXJlQXR0cmlidXRlLkRhdGFQb2ludC4kQW5ub3RhdGlvblBhdGhdO1xuXHRcdFx0aWYgKGRhdGFQb2ludD8uVmFsdWU/LiRQYXRoKSB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aC5wdXNoKGRhdGFQb2ludC5WYWx1ZS4kUGF0aCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRgRkU6TWFjcm86TWljcm9DaGFydCA6IENvdWxkbid0IGZpbmQgRGF0YVBvaW50KFZhbHVlKSBtZWFzdXJlIGZvciB0aGUgbWVhc3VyZUF0dHJpYnV0ZSAke2NoYXJ0VHlwZX0gTWljcm9DaGFydC5gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByb3BlcnR5UGF0aC5qb2luKFwiLFwiKTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSB2aXNpYmxlIGV4cHJlc3Npb24gcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGFyZ3Ncblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBCaW5kaW5nIGZvciB0aGUgdmlzaWJsZS5cblx0ICovXG5cdGdldEhpZGRlblBhdGhFeHByZXNzaW9uOiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRpZiAoIWFyZ3NbMF0gJiYgIWFyZ3NbMV0pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAoYXJnc1swXSA9PT0gdHJ1ZSB8fCBhcmdzWzFdID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaGlkZGVuUGF0aHM6IHN0cmluZ1tdID0gW107XG5cdFx0W10uZm9yRWFjaC5jYWxsKGFyZ3MsIGZ1bmN0aW9uIChoaWRkZW5Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRpZiAoaGlkZGVuUHJvcGVydHkgJiYgaGlkZGVuUHJvcGVydHkuJFBhdGgpIHtcblx0XHRcdFx0aGlkZGVuUGF0aHMucHVzaChcIiV7XCIgKyBoaWRkZW5Qcm9wZXJ0eS4kUGF0aCArIFwifVwiKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBoaWRkZW5QYXRocy5sZW5ndGggPyBcIns9IFwiICsgaGlkZGVuUGF0aHMuam9pbihcIiB8fCBcIikgKyBcIiA9PT0gdHJ1ZSA/IGZhbHNlIDogdHJ1ZSB9XCIgOiBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSB0cnVlL2ZhbHNlIHRvIGRpc3BsYXkgY2hhcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjaGFydFR5cGUgVGhlIGNoYXJ0IHR5cGVcblx0ICogQHBhcmFtIHZhbHVlIERhdGEgcG9pbnQgdmFsdWUgb2YgVmFsdWVcblx0ICogQHBhcmFtIG1heFZhbHVlIERhdGEgcG9pbnQgdmFsdWUgb2YgTWF4aW11bVZhbHVlXG5cdCAqIEBwYXJhbSB2YWx1ZUhpZGRlbiBIaWRkZW4gcGF0aCBvYmplY3QvYm9vbGVhbiB2YWx1ZSBmb3IgdGhlIHJlZmVyZW5jZWQgcHJvcGVydHkgb2YgdmFsdWVcblx0ICogQHBhcmFtIG1heFZhbHVlSGlkZGVuIEhpZGRlbiBwYXRoIG9iamVjdC9ib29sZWFuIHZhbHVlIGZvciB0aGUgcmVmZXJlbmNlZCBwcm9wZXJ0eSBvZiBNYXhWYWx1ZVxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgb3IgYGZhbHNlYCB0byBoaWRlL3Nob3cgY2hhcnRcblx0ICovXG5cdGlzTm90QWx3YXlzSGlkZGVuOiBmdW5jdGlvbiAoXG5cdFx0Y2hhcnRUeXBlOiBzdHJpbmcsXG5cdFx0dmFsdWU6IG9iamVjdCxcblx0XHRtYXhWYWx1ZTogb2JqZWN0IHwgdW5kZWZpbmVkLFxuXHRcdHZhbHVlSGlkZGVuOiBib29sZWFuIHwgYW55LFxuXHRcdG1heFZhbHVlSGlkZGVuPzogYm9vbGVhbiB8IGFueVxuXHQpIHtcblx0XHRpZiAodmFsdWVIaWRkZW4gPT09IHRydWUpIHtcblx0XHRcdHRoaXMubG9nRXJyb3IoY2hhcnRUeXBlLCB2YWx1ZSk7XG5cdFx0fVxuXHRcdGlmIChtYXhWYWx1ZUhpZGRlbiA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5sb2dFcnJvcihjaGFydFR5cGUsIG1heFZhbHVlKTtcblx0XHR9XG5cdFx0aWYgKHZhbHVlSGlkZGVuID09PSB1bmRlZmluZWQgJiYgbWF4VmFsdWVIaWRkZW4gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAoKCF2YWx1ZUhpZGRlbiB8fCB2YWx1ZUhpZGRlbi4kUGF0aCkgJiYgdmFsdWVIaWRkZW4gIT09IHVuZGVmaW5lZCkgfHxcblx0XHRcdFx0KCghbWF4VmFsdWVIaWRkZW4gfHwgbWF4VmFsdWVIaWRkZW4uJFBhdGgpICYmIG1heFZhbHVlSGlkZGVuICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHQ6IGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0byBsb2cgZXJyb3JzIGZvciBtaXNzaW5nIGRhdGEgcG9pbnQgcHJvcGVydGllcy5cblx0ICpcblx0ICogQHBhcmFtIGNoYXJ0VHlwZSBUaGUgY2hhcnQgdHlwZS5cblx0ICogQHBhcmFtIHZhbHVlIER5bmFtaWMgaGlkZGVuIHByb3BlcnR5IG5hbWUuXG5cdCAqL1xuXHRsb2dFcnJvcjogZnVuY3Rpb24gKGNoYXJ0VHlwZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG5cdFx0TG9nLmVycm9yKGBNZWFzdXJlIFByb3BlcnR5ICR7dmFsdWUuJFBhdGh9IGlzIGhpZGRlbiBmb3IgdGhlICR7Y2hhcnRUeXBlfSBNaWNybyBDaGFydGApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIGZvcm1hdHRlZCB2YWx1ZSB3aXRoIHNjYWxlIGZhY3RvciBmb3IgdGhlIHZhbHVlIGRpc3BsYXllZC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggUHJvcGVydHkgcGF0aCBmb3IgdGhlIHZhbHVlXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgUHJvcGVydHkgZm9yIGNvbnN0cmFpbnRzXG5cdCAqIEBwYXJhbSBmcmFjdGlvbkRpZ2l0cyBOby4gb2YgZnJhY3Rpb24gZGlnaXRzIHNwZWNpZmllZCBmcm9tIGFubm90YXRpb25zXG5cdCAqIEByZXR1cm5zIEV4cHJlc3Npb24gQmluZGluZyBmb3IgdGhlIHZhbHVlIHdpdGggc2NhbGUuXG5cdCAqL1xuXHRmb3JtYXREZWNpbWFsOiBmdW5jdGlvbiAocGF0aDogc3RyaW5nLCBwcm9wZXJ0eTogYW55LCBmcmFjdGlvbkRpZ2l0czogbnVtYmVyKSB7XG5cdFx0aWYgKCFwYXRoKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRjb25zdCBjb25zdHJhaW50cyA9IFtdLFxuXHRcdFx0Zm9ybWF0T3B0aW9ucyA9IFtcInN0eWxlOiAnc2hvcnQnXCJdO1xuXHRcdGNvbnN0IHNjYWxlID0gdHlwZW9mIGZyYWN0aW9uRGlnaXRzID09PSBcIm51bWJlclwiID8gZnJhY3Rpb25EaWdpdHMgOiAocHJvcGVydHkgJiYgcHJvcGVydHk/LiRTY2FsZSkgfHwgMTtcblxuXHRcdGlmIChwcm9wZXJ0eS4kTnVsbGFibGUgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdHJhaW50cy5wdXNoKFwibnVsbGFibGU6IFwiICsgcHJvcGVydHkuJE51bGxhYmxlKTtcblx0XHR9XG5cdFx0aWYgKHByb3BlcnR5LiRQcmVjaXNpb24gIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3JtYXRPcHRpb25zLnB1c2goXCJwcmVjaXNpb246IFwiICsgKHByb3BlcnR5LiRQcmVjaXNpb24gPyBwcm9wZXJ0eS4kUHJlY2lzaW9uIDogXCIxXCIpKTtcblx0XHR9XG5cdFx0Y29uc3RyYWludHMucHVzaChcInNjYWxlOiBcIiArIChzY2FsZSA9PT0gXCJ2YXJpYWJsZVwiID8gXCInXCIgKyBzY2FsZSArIFwiJ1wiIDogc2NhbGUpKTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHRcInsgcGF0aDogJ1wiICtcblx0XHRcdHBhdGggK1xuXHRcdFx0XCInXCIgK1xuXHRcdFx0XCIsIHR5cGU6ICdzYXAudWkubW9kZWwub2RhdGEudHlwZS5EZWNpbWFsJywgY29uc3RyYWludHM6IHsgXCIgK1xuXHRcdFx0Y29uc3RyYWludHMuam9pbihcIixcIikgK1xuXHRcdFx0XCIgfSwgZm9ybWF0T3B0aW9uczogeyBcIiArXG5cdFx0XHRmb3JtYXRPcHRpb25zLmpvaW4oXCIsXCIpICtcblx0XHRcdFwiIH0gfVwiXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogVG8gZmV0Y2ggc2VsZWN0IHBhcmFtZXRlcnMgZnJvbSBhbm5vdGF0aW9ucyB0aGF0IG5lZWQgdG8gYmUgYWRkZWQgdG8gdGhlIGxpc3QgYmluZGluZy5cblx0ICpcblx0ICogQHBhcmFtIGdyb3VwSWQgR3JvdXBJZCB0byBiZSB1c2VkXG5cdCAqIEBwYXJhbSB1b21QYXRoIFVuaXQgb2YgbWVhc3VyZSBwYXRoXG5cdCAqIEBwYXJhbSBjcml0aWNhbGl0eSBDcml0aWNhbGl0eSBmb3IgdGhlIGNoYXJ0XG5cdCAqIEBwYXJhbSBjcml0aWNhbGl0eVBhdGggQ3JpdGljYWxpdHkgY2FsY3VsYXRpb24gb2JqZWN0IHByb3BlcnR5IHBhdGhcblx0ICogQHJldHVybnMgU3RyaW5nIGNvbnRhaW5pbmcgYWxsIHRoZSBwcm9wZXJ0eSBwYXRocyBuZWVkZWQgdG8gYmUgYWRkZWQgdG8gdGhlICRzZWxlY3QgcXVlcnkgb2YgdGhlIGxpc3QgYmluZGluZy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldFNlbGVjdFBhcmFtZXRlcnM6IGZ1bmN0aW9uIChncm91cElkOiBzdHJpbmcsIHVvbVBhdGg6IGFueSwgY3JpdGljYWxpdHk6IHN0cmluZywgLi4uY3JpdGljYWxpdHlQYXRoOiBzdHJpbmdbXSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmdbXSA9IFtdLFxuXHRcdFx0cGFyYW1ldGVyczogc3RyaW5nW10gPSBbXTtcblxuXHRcdGlmIChncm91cElkKSB7XG5cdFx0XHRwYXJhbWV0ZXJzLnB1c2goYCQkZ3JvdXBJZCA6ICcke2dyb3VwSWR9J2ApO1xuXHRcdH1cblxuXHRcdGlmIChjcml0aWNhbGl0eSkge1xuXHRcdFx0cHJvcGVydHlQYXRoLnB1c2goY3JpdGljYWxpdHkpO1xuXHRcdH0gZWxzZSBpZiAodW9tUGF0aCkge1xuXHRcdFx0Zm9yIChjb25zdCBrIGluIHVvbVBhdGgpIHtcblx0XHRcdFx0aWYgKCF1b21QYXRoW2tdLiRFbnVtTWVtYmVyICYmIHVvbVBhdGhba10uJFBhdGgpIHtcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgucHVzaCh1b21QYXRoW2tdLiRQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgcGF0aCBvZiBjcml0aWNhbGl0eVBhdGgpIHtcblx0XHRcdGlmIChwYXRoKSB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aC5wdXNoKHBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChwcm9wZXJ0eVBhdGgubGVuZ3RoKSB7XG5cdFx0XHRwYXJhbWV0ZXJzLnB1c2goYCRzZWxlY3QgOiAnJHtwcm9wZXJ0eVBhdGguam9pbihcIixcIil9J2ApO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXJhbWV0ZXJzLmpvaW4oXCIsXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUbyBmZXRjaCBEYXRhUG9pbnQgUXVhbGlmaWVycyBvZiBtZWFzdXJlcy5cblx0ICpcblx0ICogQHBhcmFtIGNoYXJ0QW5ub3RhdGlvbnMgQ2hhcnQgQW5ub3RhdGlvbnNcblx0ICogQHBhcmFtIGVudGl0eVR5cGVBbm5vdGF0aW9ucyBFbnRpdHlUeXBlIEFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBjaGFydFR5cGUgQ2hhcnQgVHlwZSB1c2VkXG5cdCAqIEByZXR1cm5zIENvbnRhaW5pbmcgYWxsIGRhdGEgcG9pbnQgUXVhbGlmaWVycy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldERhdGFQb2ludFF1YWxpZmllcnNGb3JNZWFzdXJlczogZnVuY3Rpb24gKGNoYXJ0QW5ub3RhdGlvbnM6IENoYXJ0LCBlbnRpdHlUeXBlQW5ub3RhdGlvbnM6IGFueSwgY2hhcnRUeXBlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBxdWFsaWZpZXJzOiBzdHJpbmdbXSA9IFtdLFxuXHRcdFx0bWVhc3VyZUF0dHJpYnV0ZXMgPSBjaGFydEFubm90YXRpb25zLk1lYXN1cmVBdHRyaWJ1dGVzLFxuXHRcdFx0Zm5BZGREYXRhUG9pbnRRdWFsaWZpZXIgPSBmdW5jdGlvbiAoY2hhcnRNZWFzdXJlOiBhbnkpIHtcblx0XHRcdFx0Y29uc3QgbWVhc3VyZSA9IGNoYXJ0TWVhc3VyZS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRsZXQgcXVhbGlmaWVyOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGlmIChlbnRpdHlUeXBlQW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRtZWFzdXJlQXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChtZWFzdXJlQXR0cmlidXRlOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChtZWFzdXJlQXR0cmlidXRlLk1lYXN1cmU/LiRQcm9wZXJ0eVBhdGggPT09IG1lYXN1cmUgJiYgbWVhc3VyZUF0dHJpYnV0ZS5EYXRhUG9pbnQ/LiRBbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IG1lYXN1cmVBdHRyaWJ1dGUuRGF0YVBvaW50LiRBbm5vdGF0aW9uUGF0aDtcblx0XHRcdFx0XHRcdFx0aWYgKGVudGl0eVR5cGVBbm5vdGF0aW9uc1thbm5vdGF0aW9uUGF0aF0pIHtcblx0XHRcdFx0XHRcdFx0XHRxdWFsaWZpZXIgPSBhbm5vdGF0aW9uUGF0aC5zcGxpdChcIiNcIilbMV07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHF1YWxpZmllcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cXVhbGlmaWVycy5wdXNoKHF1YWxpZmllcik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHF1YWxpZmllciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFx0XHRgRkU6TWFjcm86TWljcm9DaGFydCA6IENvdWxkbid0IGZpbmQgRGF0YVBvaW50KFZhbHVlKSBtZWFzdXJlIGZvciB0aGUgbWVhc3VyZUF0dHJpYnV0ZSBmb3IgJHtjaGFydFR5cGV9IE1pY3JvQ2hhcnQuYFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRpZiAoIWVudGl0eVR5cGVBbm5vdGF0aW9ucykge1xuXHRcdFx0TG9nLndhcm5pbmcoYEZFOk1hY3JvOk1pY3JvQ2hhcnQgOiBDb3VsZG4ndCBmaW5kIGFubm90YXRpb25zIGZvciB0aGUgRGF0YVBvaW50ICR7Y2hhcnRUeXBlfSBNaWNyb0NoYXJ0LmApO1xuXHRcdH1cblx0XHRjaGFydEFubm90YXRpb25zLk1lYXN1cmVzLmZvckVhY2goZm5BZGREYXRhUG9pbnRRdWFsaWZpZXIpO1xuXHRcdHJldHVybiBxdWFsaWZpZXJzLmpvaW4oXCIsXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHRvIGxvZyB3YXJuaW5ncyBmb3IgbWlzc2luZyBkYXRhcG9pbnQgcHJvcGVydGllcy5cblx0ICpcblx0ICogQHBhcmFtIGNoYXJ0VHlwZSBUaGUgQ2hhcnQgdHlwZS5cblx0ICogQHBhcmFtIGVycm9yIE9iamVjdCB3aXRoIHByb3BlcnRpZXMgZnJvbSBEYXRhUG9pbnQuXG5cdCAqL1xuXHRsb2dXYXJuaW5nOiBmdW5jdGlvbiAoY2hhcnRUeXBlOiBzdHJpbmcsIGVycm9yOiBhbnkpIHtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBlcnJvcikge1xuXHRcdFx0aWYgKCFlcnJvcltrZXldKSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKGAke2tleX0gcGFyYW1ldGVyIGlzIG1pc3NpbmcgZm9yIHRoZSAke2NoYXJ0VHlwZX0gTWljcm8gQ2hhcnRgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBnZXQgRGlzcGxheVZhbHVlIGZvciBjb21wYXJpc29uIG1pY3JvIGNoYXJ0IGRhdGEgYWdncmVnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhUG9pbnQgRGF0YSBwb2ludCBvYmplY3QuXG5cdCAqIEBwYXJhbSBwYXRoVGV4dCBPYmplY3QgYWZ0ZXIgZXZhbHVhdGluZyBAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHQgYW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gdmFsdWVUZXh0UGF0aCBFdmFsdWF0aW9uIG9mIEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dC8kUGF0aC8kIHZhbHVlIG9mIHRoZSBhbm5vdGF0aW9uXG5cdCAqIEBwYXJhbSB2YWx1ZURhdGFQb2ludFBhdGggRGF0YVBvaW50PlZhbHVlLyRQYXRoLyQgdmFsdWUgYWZ0ZXIgZXZhbHVhdGluZyBhbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIEV4cHJlc3Npb24gYmluZGluZyBmb3IgRGlzcGxheSBWYWx1ZSBmb3IgY29tcGFyaXNvbiBtaWNybyBjaGFydCdzIGFnZ3JlZ2F0aW9uIGRhdGEuXG5cdCAqL1xuXHRnZXREaXNwbGF5VmFsdWVGb3JNaWNyb0NoYXJ0OiBmdW5jdGlvbiAoZGF0YVBvaW50OiBhbnksIHBhdGhUZXh0OiBhbnksIHZhbHVlVGV4dFBhdGg6IG9iamVjdCwgdmFsdWVEYXRhUG9pbnRQYXRoOiBvYmplY3QpIHtcblx0XHRjb25zdCB2YWx1ZUZvcm1hdCA9IGRhdGFQb2ludC5WYWx1ZUZvcm1hdCAmJiBkYXRhUG9pbnQuVmFsdWVGb3JtYXQuTnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzO1xuXHRcdGlmIChwYXRoVGV4dCkge1xuXHRcdFx0cmV0dXJuIE1pY3JvQ2hhcnRIZWxwZXIuZm9ybWF0RGVjaW1hbChwYXRoVGV4dFtcIiRQYXRoXCJdLCB2YWx1ZVRleHRQYXRoLCB2YWx1ZUZvcm1hdCk7XG5cdFx0fVxuXHRcdHJldHVybiBNaWNyb0NoYXJ0SGVscGVyLmZvcm1hdERlY2ltYWwoZGF0YVBvaW50LlZhbHVlW1wiJFBhdGhcIl0sIHZhbHVlRGF0YVBvaW50UGF0aCwgdmFsdWVGb3JtYXQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gY2hlY2sgd2hldGhlciBtaWNybyBjaGFydCBpcyBlbmFibGVkIG9yIG5vdCBieSBjaGVja2luZyBwcm9wZXJ0aWVzLCBjaGFydCBhbm5vdGF0aW9ucywgaGlkZGVuIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjaGFydFR5cGUgTWljcm9DaGFydCBUeXBlIGVnOi0gQnVsbGV0LlxuXHQgKiBAcGFyYW0gZGF0YVBvaW50IERhdGEgcG9pbnQgb2JqZWN0LlxuXHQgKiBAcGFyYW0gZGF0YVBvaW50VmFsdWVIaWRkZW4gT2JqZWN0IHdpdGggJFBhdGggYW5ub3RhdGlvbiB0byBnZXQgaGlkZGVuIHZhbHVlIHBhdGhcblx0ICogQHBhcmFtIGNoYXJ0QW5ub3RhdGlvbnMgQ2hhcnRBbm5vdGF0aW9uIG9iamVjdFxuXHQgKiBAcGFyYW0gZGF0YVBvaW50TWF4VmFsdWUgT2JqZWN0IHdpdGggJFBhdGggYW5ub3RhdGlvbiB0byBnZXQgaGlkZGVuIG1heCB2YWx1ZSBwYXRoXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgY2hhcnQgaGFzIGFsbCB2YWx1ZXMgYW5kIHByb3BlcnRpZXMgYW5kIGFsc28gaXQgaXMgbm90IGFsd2F5cyBoaWRkZW4gc0ZpbmFsRGF0YVBvaW50VmFsdWUgJiYgYk1pY3JvY2hhcnRWaXNpYmxlLlxuXHQgKi9cblx0c2hvdWxkTWljcm9DaGFydFJlbmRlcjogZnVuY3Rpb24gKFxuXHRcdGNoYXJ0VHlwZTogc3RyaW5nLFxuXHRcdGRhdGFQb2ludDogRGF0YVBvaW50VHlwZSxcblx0XHRkYXRhUG9pbnRWYWx1ZUhpZGRlbjogYW55LFxuXHRcdGNoYXJ0QW5ub3RhdGlvbnM6IENoYXJ0LFxuXHRcdGRhdGFQb2ludE1heFZhbHVlOiBhbnlcblx0KSB7XG5cdFx0Y29uc3QgYXZhaWxhYmxlQ2hhcnRUeXBlcyA9IFtcIkFyZWFcIiwgXCJDb2x1bW5cIiwgXCJDb21wYXJpc29uXCJdLFxuXHRcdFx0ZGF0YVBvaW50VmFsdWUgPSBkYXRhUG9pbnQgJiYgZGF0YVBvaW50LlZhbHVlLFxuXHRcdFx0aGlkZGVuUGF0aCA9IGRhdGFQb2ludFZhbHVlSGlkZGVuICYmIGRhdGFQb2ludFZhbHVlSGlkZGVuW1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbl0sXG5cdFx0XHRjaGFydEFubm90YXRpb25EaW1lbnNpb24gPSBjaGFydEFubm90YXRpb25zICYmIGNoYXJ0QW5ub3RhdGlvbnMuRGltZW5zaW9ucyAmJiBjaGFydEFubm90YXRpb25zLkRpbWVuc2lvbnNbMF0sXG5cdFx0XHRmaW5hbERhdGFQb2ludFZhbHVlID0gYXZhaWxhYmxlQ2hhcnRUeXBlcy5pbmRleE9mKGNoYXJ0VHlwZSkgPiAtMSA/IGRhdGFQb2ludFZhbHVlICYmIGNoYXJ0QW5ub3RhdGlvbkRpbWVuc2lvbiA6IGRhdGFQb2ludFZhbHVlOyAvLyBvbmx5IGZvciB0aHJlZSBjaGFydHMgaW4gYXJyYXlcblx0XHRpZiAoY2hhcnRUeXBlID09PSBcIkhhcnZleVwiKSB7XG5cdFx0XHRjb25zdCBkYXRhUG9pbnRNYXhpbXVtVmFsdWUgPSBkYXRhUG9pbnQgJiYgZGF0YVBvaW50Lk1heGltdW1WYWx1ZSxcblx0XHRcdFx0bWF4VmFsdWVIaWRkZW5QYXRoID0gZGF0YVBvaW50TWF4VmFsdWUgJiYgZGF0YVBvaW50TWF4VmFsdWVbVUlBbm5vdGF0aW9uVGVybXMuSGlkZGVuXTtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGRhdGFQb2ludFZhbHVlICYmXG5cdFx0XHRcdGRhdGFQb2ludE1heGltdW1WYWx1ZSAmJlxuXHRcdFx0XHRNaWNyb0NoYXJ0SGVscGVyLmlzTm90QWx3YXlzSGlkZGVuKFwiQnVsbGV0XCIsIGRhdGFQb2ludFZhbHVlLCBkYXRhUG9pbnRNYXhpbXVtVmFsdWUsIGhpZGRlblBhdGgsIG1heFZhbHVlSGlkZGVuUGF0aClcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBmaW5hbERhdGFQb2ludFZhbHVlICYmIE1pY3JvQ2hhcnRIZWxwZXIuaXNOb3RBbHdheXNIaWRkZW4oY2hhcnRUeXBlLCBkYXRhUG9pbnRWYWx1ZSwgdW5kZWZpbmVkLCBoaWRkZW5QYXRoKTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGdldCBkYXRhUG9pbnRRdWFsaWZpZXJzIGZvciBDb2x1bW4sIENvbXBhcmlzb24gYW5kIFN0YWNrZWRCYXIgbWljcm8gY2hhcnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvblBhdGhcblx0ICogQHJldHVybnMgUmVzdWx0IHN0cmluZyBvciB1bmRlZmluZWQuXG5cdCAqL1xuXHRnZXREYXRhUG9pbnRRdWFsaWZpZXJzRm9yTWljcm9DaGFydDogZnVuY3Rpb24gKGFubm90YXRpb25QYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAoYW5ub3RhdGlvblBhdGguaW5kZXhPZihVSUFubm90YXRpb25UZXJtcy5EYXRhUG9pbnQpID09PSAtMSkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIGFubm90YXRpb25QYXRoLnNwbGl0KFwiI1wiKVsxXSA/PyBcIlwiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gZ2V0IGNvbG9yUGFsZXR0ZSBmb3IgY29tcGFyaXNvbiBhbmQgSGFydmV5QmFsbCBNaWNyb2NoYXJ0cy5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFQb2ludCBEYXRhIHBvaW50IG9iamVjdC5cblx0ICogQHJldHVybnMgUmVzdWx0IHN0cmluZyBmb3IgY29sb3JQYWxldHRlIG9yIHVuZGVmaW5lZC5cblx0ICovXG5cdGdldENvbG9yUGFsZXR0ZUZvck1pY3JvQ2hhcnQ6IGZ1bmN0aW9uIChkYXRhUG9pbnQ6IERhdGFQb2ludFR5cGUpIHtcblx0XHRyZXR1cm4gZGF0YVBvaW50LkNyaXRpY2FsaXR5XG5cdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0OiBcInNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWUxLCBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlMiwgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTMsICAgICAgICAgIHNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWU0LCBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlNSwgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTYsIHNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWU3LCAgICAgICAgICBzYXBVaUNoYXJ0UGFsZXR0ZVF1YWxpdGF0aXZlSHVlOCwgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTksIHNhcFVpQ2hhcnRQYWxldHRlUXVhbGl0YXRpdmVIdWUxMCwgc2FwVWlDaGFydFBhbGV0dGVRdWFsaXRhdGl2ZUh1ZTExXCI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBnZXQgTWVhc3VyZVNjYWxlIGZvciBBcmVhLCBDb2x1bW4gYW5kIExpbmUgbWljcm8gY2hhcnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YVBvaW50IERhdGEgcG9pbnQgb2JqZWN0LlxuXHQgKiBAcmV0dXJucyBEYXRhIHBvaW50IHZhbHVlIGZvcm1hdCBmcmFjdGlvbmFsIGRpZ2l0cyBvciBkYXRhIHBvaW50IHNjYWxlIG9yIDEuXG5cdCAqL1xuXHRnZXRNZWFzdXJlU2NhbGVGb3JNaWNyb0NoYXJ0OiBmdW5jdGlvbiAoZGF0YVBvaW50OiBEYXRhUG9pbnRUeXBlKSB7XG5cdFx0aWYgKGRhdGFQb2ludC5WYWx1ZUZvcm1hdCAmJiBkYXRhUG9pbnQuVmFsdWVGb3JtYXQuTnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzKSB7XG5cdFx0XHRyZXR1cm4gZGF0YVBvaW50LlZhbHVlRm9ybWF0Lk51bWJlck9mRnJhY3Rpb25hbERpZ2l0cztcblx0XHR9XG5cdFx0aWYgKGRhdGFQb2ludC5WYWx1ZSAmJiBkYXRhUG9pbnQuVmFsdWVbXCIkUGF0aFwiXSAmJiBkYXRhUG9pbnQuVmFsdWVbXCIkUGF0aFwiXVtcIiRTY2FsZVwiXSkge1xuXHRcdFx0cmV0dXJuIGRhdGFQb2ludC5WYWx1ZVtcIiRQYXRoXCJdW1wiJFNjYWxlXCJdO1xuXHRcdH1cblx0XHRyZXR1cm4gMTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB0byByZXR1cm4gdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBvZiBtaWNyb2NoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhcnRUeXBlIFRoZSB0eXBlIG9mIG1pY3JvIGNoYXJ0IChCdWxsZXQsIFJhZGlhbCBldGMuKVxuXHQgKiBAcGFyYW0gbWVhc3VyZSBNZWFzdXJlIHZhbHVlIGZvciBtaWNybyBjaGFydC5cblx0ICogQHBhcmFtIG1pY3JvQ2hhcnQgYHRoaXNgL2N1cnJlbnQgbW9kZWwgZm9yIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcGFyYW0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIG9iamVjdC5cblx0ICogQHBhcmFtIHVpTmFtZSBUaGUgQHNhcHVpLm5hbWUgaW4gY29sbGVjdGlvbiBtb2RlbCBpcyBub3QgYWNjZXNzaWJsZSBoZXJlIGZyb20gbW9kZWwgaGVuY2UgbmVlZCB0byBwYXNzIGl0LlxuXHQgKiBAcGFyYW0gZGF0YVBvaW50IERhdGEgcG9pbnQgb2JqZWN0IHVzZWQgaW4gY2FzZSBvZiBIYXJ2ZXkgQmFsbCBtaWNybyBjaGFydFxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciBtaWNybyBjaGFydC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldEJpbmRpbmdFeHByZXNzaW9uRm9yTWljcm9jaGFydDogZnVuY3Rpb24gKFxuXHRcdGNoYXJ0VHlwZTogc3RyaW5nLFxuXHRcdG1lYXN1cmU6IGFueSxcblx0XHRtaWNyb0NoYXJ0OiBNaWNyb0NoYXJ0QmxvY2ssXG5cdFx0Y29sbGVjdGlvbjogTWV0YU1vZGVsTmF2UHJvcGVydHksXG5cdFx0dWlOYW1lOiBzdHJpbmcsXG5cdFx0ZGF0YVBvaW50OiBhbnlcblx0KSB7XG5cdFx0Y29uc3QgY29uZGl0aW9uID0gY29sbGVjdGlvbltcIiRpc0NvbGxlY3Rpb25cIl0gfHwgY29sbGVjdGlvbltcIiRraW5kXCJdID09PSBcIkVudGl0eVNldFwiO1xuXHRcdGNvbnN0IHBhdGggPSBjb25kaXRpb24gPyBcIlwiIDogdWlOYW1lO1xuXHRcdGxldCBjdXJyZW5jeU9yVW5pdCA9IE1pY3JvQ2hhcnRIZWxwZXIuZ2V0VU9NUGF0aEZvck1pY3JvY2hhcnQobWVhc3VyZSk7XG5cdFx0bGV0IGRhdGFQb2ludENyaXRpY2FsbGl0eSA9IFwiXCI7XG5cdFx0c3dpdGNoIChjaGFydFR5cGUpIHtcblx0XHRcdGNhc2UgXCJSYWRpYWxcIjpcblx0XHRcdFx0Y3VycmVuY3lPclVuaXQgPSBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJIYXJ2ZXlcIjpcblx0XHRcdFx0ZGF0YVBvaW50Q3JpdGljYWxsaXR5ID0gZGF0YVBvaW50LkNyaXRpY2FsaXR5ID8gZGF0YVBvaW50LkNyaXRpY2FsaXR5W1wiJFBhdGhcIl0gOiBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Y29uc3QgZnVuY3Rpb25WYWx1ZSA9IE1pY3JvQ2hhcnRIZWxwZXIuZ2V0U2VsZWN0UGFyYW1ldGVycyhtaWNyb0NoYXJ0LmJhdGNoR3JvdXBJZCwgXCJcIiwgZGF0YVBvaW50Q3JpdGljYWxsaXR5LCBjdXJyZW5jeU9yVW5pdCk7XG5cblx0XHRyZXR1cm4gYHsgcGF0aDogJyR7cGF0aH0nYCArIGAsIHBhcmFtZXRlcnMgOiB7JHtmdW5jdGlvblZhbHVlfX0gfWA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdG8gcmV0dXJuIHRoZSBVT01QYXRoIGV4cHJlc3Npb24gb2YgdGhlIG1pY3JvIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc2hvd09ubHlDaGFydCBXaGV0aGVyIG9ubHkgY2hhcnQgc2hvdWxkIGJlIHJlbmRlcmVkIG9yIG5vdC5cblx0ICogQHBhcmFtIG1lYXN1cmUgTWVhc3VyZXMgZm9yIHRoZSBtaWNybyBjaGFydC5cblx0ICogQHJldHVybnMgVU9NUGF0aCBTdHJpbmcgZm9yIHRoZSBtaWNybyBjaGFydC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldFVPTVBhdGhGb3JNaWNyb2NoYXJ0OiBmdW5jdGlvbiAoc2hvd09ubHlDaGFydDogYm9vbGVhbiwgbWVhc3VyZT86IGFueSkge1xuXHRcdGlmIChtZWFzdXJlICYmICFzaG93T25seUNoYXJ0KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQobWVhc3VyZVtgQCR7TWVhc3VyZXNBbm5vdGF0aW9uVGVybXMuSVNPQ3VycmVuY3l9YF0gJiYgbWVhc3VyZVtgQCR7TWVhc3VyZXNBbm5vdGF0aW9uVGVybXMuSVNPQ3VycmVuY3l9YF0uJFBhdGgpIHx8XG5cdFx0XHRcdChtZWFzdXJlW2BAJHtNZWFzdXJlc0Fubm90YXRpb25UZXJtcy5Vbml0fWBdICYmIG1lYXN1cmVbYEAke01lYXN1cmVzQW5ub3RhdGlvblRlcm1zLlVuaXR9YF0uJFBhdGgpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHRvIHJldHVybiB0aGUgYWdncmVnYXRpb24gYmluZGluZyBleHByZXNzaW9uIG9mIG1pY3JvIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gYWdncmVnYXRpb25UeXBlIEFnZ3JlZ2F0aW9uIHR5cGUgb2YgY2hhcnQgKGVnOi0gUG9pbnQgZm9yIEFyZWFNaWNyb2NoYXJ0KVxuXHQgKiBAcGFyYW0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIG9iamVjdC5cblx0ICogQHBhcmFtIGRhdGFQb2ludCBEYXRhIHBvaW50IGluZm8gZm9yIG1pY3JvIGNoYXJ0LlxuXHQgKiBAcGFyYW0gdWlOYW1lIFRoZSBAc2FwdWkubmFtZSBpbiBjb2xsZWN0aW9uIG1vZGVsIGlzIG5vdCBhY2Nlc3NpYmxlIGhlcmUgZnJvbSBtb2RlbCBoZW5jZSBuZWVkIHRvIHBhc3MgaXQuXG5cdCAqIEBwYXJhbSBkaW1lbnNpb24gTWljcm8gY2hhcnQgRGltZW5zaW9ucy5cblx0ICogQHBhcmFtIG1lYXN1cmUgTWVhc3VyZSB2YWx1ZSBmb3IgbWljcm8gY2hhcnQuXG5cdCAqIEBwYXJhbSBtZWFzdXJlT3JEaW1lbnNpb25CYXIgVGhlIG1lYXN1cmUgb3IgZGltZW5zaW9uIHBhc3NlZCBzcGVjaWZpY2FsbHkgaW4gY2FzZSBvZiBiYXIgY2hhcnRcblx0ICogQHJldHVybnMgQWdncmVnYXRpb24gYmluZGluZyBleHByZXNzaW9uIGZvciBtaWNybyBjaGFydC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldEFnZ3JlZ2F0aW9uRm9yTWljcm9jaGFydDogZnVuY3Rpb24gKFxuXHRcdGFnZ3JlZ2F0aW9uVHlwZTogc3RyaW5nLFxuXHRcdGNvbGxlY3Rpb246IE1ldGFNb2RlbE5hdlByb3BlcnR5LFxuXHRcdGRhdGFQb2ludDogYW55LFxuXHRcdHVpTmFtZTogc3RyaW5nLFxuXHRcdGRpbWVuc2lvbjogYW55LFxuXHRcdG1lYXN1cmU6IGFueSxcblx0XHRtZWFzdXJlT3JEaW1lbnNpb25CYXI6IHN0cmluZ1xuXHQpIHtcblx0XHRsZXQgcGF0aCA9IGNvbGxlY3Rpb25bXCIka2luZFwiXSA9PT0gXCJFbnRpdHlTZXRcIiA/IFwiL1wiIDogXCJcIjtcblx0XHRwYXRoID0gcGF0aCArIHVpTmFtZTtcblx0XHRjb25zdCBncm91cElkID0gXCJcIjtcblx0XHRsZXQgZGF0YVBvaW50Q3JpdGljYWxsaXR5Q2FsYyA9IFwiXCI7XG5cdFx0bGV0IGRhdGFQb2ludENyaXRpY2FsbGl0eSA9IGRhdGFQb2ludC5Dcml0aWNhbGl0eSA/IGRhdGFQb2ludC5Dcml0aWNhbGl0eVtcIiRQYXRoXCJdIDogXCJcIjtcblx0XHRjb25zdCBjdXJyZW5jeU9yVW5pdCA9IE1pY3JvQ2hhcnRIZWxwZXIuZ2V0VU9NUGF0aEZvck1pY3JvY2hhcnQoZmFsc2UsIG1lYXN1cmUpO1xuXHRcdGxldCB0YXJnZXRWYWx1ZVBhdGggPSBcIlwiO1xuXHRcdGxldCBkaW1lbnNpb25Qcm9wZXJ0eVBhdGggPSBcIlwiO1xuXHRcdGlmIChkaW1lbnNpb24gJiYgZGltZW5zaW9uLiRQcm9wZXJ0eVBhdGggJiYgZGltZW5zaW9uLiRQcm9wZXJ0eVBhdGhbYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5UZXh0fWBdKSB7XG5cdFx0XHRkaW1lbnNpb25Qcm9wZXJ0eVBhdGggPSBkaW1lbnNpb24uJFByb3BlcnR5UGF0aFtgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlRleHR9YF0uJFBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRpbWVuc2lvblByb3BlcnR5UGF0aCA9IGRpbWVuc2lvbi4kUHJvcGVydHlQYXRoO1xuXHRcdH1cblx0XHRzd2l0Y2ggKGFnZ3JlZ2F0aW9uVHlwZSkge1xuXHRcdFx0Y2FzZSBcIlBvaW50c1wiOlxuXHRcdFx0XHRkYXRhUG9pbnRDcml0aWNhbGxpdHlDYWxjID0gZGF0YVBvaW50ICYmIGRhdGFQb2ludC5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uO1xuXHRcdFx0XHR0YXJnZXRWYWx1ZVBhdGggPSBkYXRhUG9pbnQgJiYgZGF0YVBvaW50LlRhcmdldFZhbHVlICYmIGRhdGFQb2ludC5UYXJnZXRWYWx1ZVtcIiRQYXRoXCJdO1xuXHRcdFx0XHRkYXRhUG9pbnRDcml0aWNhbGxpdHkgPSBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJDb2x1bW5zXCI6XG5cdFx0XHRcdGRhdGFQb2ludENyaXRpY2FsbGl0eUNhbGMgPSBkYXRhUG9pbnQgJiYgZGF0YVBvaW50LkNyaXRpY2FsaXR5Q2FsY3VsYXRpb247XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkxpbmVQb2ludHNcIjpcblx0XHRcdFx0ZGF0YVBvaW50Q3JpdGljYWxsaXR5ID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQmFyc1wiOlxuXHRcdFx0XHRkaW1lbnNpb25Qcm9wZXJ0eVBhdGggPSBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Y29uc3QgZnVuY3Rpb25WYWx1ZSA9IE1pY3JvQ2hhcnRIZWxwZXIuZ2V0U2VsZWN0UGFyYW1ldGVycyhcblx0XHRcdGdyb3VwSWQsXG5cdFx0XHRkYXRhUG9pbnRDcml0aWNhbGxpdHlDYWxjLFxuXHRcdFx0ZGF0YVBvaW50Q3JpdGljYWxsaXR5LFxuXHRcdFx0Y3VycmVuY3lPclVuaXQsXG5cdFx0XHR0YXJnZXRWYWx1ZVBhdGgsXG5cdFx0XHRkaW1lbnNpb25Qcm9wZXJ0eVBhdGgsXG5cdFx0XHRtZWFzdXJlT3JEaW1lbnNpb25CYXJcblx0XHQpO1xuXG5cdFx0cmV0dXJuIGB7cGF0aDonJHtwYXRofSdgICsgYCwgcGFyYW1ldGVycyA6IHske2Z1bmN0aW9uVmFsdWV9fSB9YDtcblx0fSxcblxuXHRnZXRDdXJyZW5jeU9yVW5pdDogZnVuY3Rpb24gKG1lYXN1cmU6IGFueSkge1xuXHRcdGlmIChtZWFzdXJlW2BAJHtNZWFzdXJlc0Fubm90YXRpb25UZXJtcy5JU09DdXJyZW5jeX1gXSkge1xuXHRcdFx0cmV0dXJuIG1lYXN1cmVbYEAke01lYXN1cmVzQW5ub3RhdGlvblRlcm1zLklTT0N1cnJlbmN5fWBdLiRQYXRoIHx8IG1lYXN1cmVbYEAke01lYXN1cmVzQW5ub3RhdGlvblRlcm1zLklTT0N1cnJlbmN5fWBdO1xuXHRcdH1cblx0XHRpZiAobWVhc3VyZVtgQCR7TWVhc3VyZXNBbm5vdGF0aW9uVGVybXMuVW5pdH1gXSkge1xuXHRcdFx0cmV0dXJuIG1lYXN1cmVbYEAke01lYXN1cmVzQW5ub3RhdGlvblRlcm1zLlVuaXR9YF0uJFBhdGggfHwgbWVhc3VyZVtgQCR7TWVhc3VyZXNBbm5vdGF0aW9uVGVybXMuVW5pdH1gXTtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH0sXG5cblx0Z2V0Q2FsZW5kYXJQYXR0ZXJuOiBmdW5jdGlvbiAocHJvcGVydHlUeXBlOiBzdHJpbmcsIGFubm90YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRcdHJldHVybiAoXG5cdFx0XHQoYW5ub3RhdGlvbnNbYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5Jc0NhbGVuZGFyWWVhcn1gXSAmJiBcInl5eXlcIikgfHxcblx0XHRcdChhbm5vdGF0aW9uc1tgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLklzQ2FsZW5kYXJRdWFydGVyfWBdICYmIFwiUVwiKSB8fFxuXHRcdFx0KGFubm90YXRpb25zW2BAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNDYWxlbmRhck1vbnRofWBdICYmIFwiTU1cIikgfHxcblx0XHRcdChhbm5vdGF0aW9uc1tgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLklzQ2FsZW5kYXJXZWVrfWBdICYmIFwid3dcIikgfHxcblx0XHRcdChhbm5vdGF0aW9uc1tgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLklzQ2FsZW5kYXJEYXRlfWBdICYmIFwieXl5eU1NZGRcIikgfHxcblx0XHRcdChhbm5vdGF0aW9uc1tgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLklzQ2FsZW5kYXJZZWFyTW9udGh9YF0gJiYgXCJ5eXl5TU1cIikgfHxcblx0XHRcdChwcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVcIiAmJiBcInl5eXktTU0tZGRcIikgfHxcblx0XHRcdHVuZGVmaW5lZFxuXHRcdCk7XG5cdH0sXG5cblx0Zm9ybWF0RGltZW5zaW9uOiBmdW5jdGlvbiAoZGF0ZTogc3RyaW5nLCBwYXR0ZXJuOiBzdHJpbmcsIHByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBEYXRlRm9ybWF0LmdldERhdGVJbnN0YW5jZSh7IHBhdHRlcm4gfSkucGFyc2UoZGF0ZSwgZmFsc2UsIHRydWUpO1xuXHRcdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdHJldHVybiB2YWx1ZS5nZXRUaW1lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy53YXJuaW5nKFwiRGF0ZSB2YWx1ZSBjb3VsZCBub3QgYmUgZGV0ZXJtaW5lZCBmb3IgXCIgKyBwcm9wZXJ0eVBhdGgpO1xuXHRcdH1cblx0XHRyZXR1cm4gMDtcblx0fSxcblxuXHRmb3JtYXRTdHJpbmdEaW1lbnNpb246IGZ1bmN0aW9uICh2YWx1ZTogYW55LCBwYXR0ZXJuOiBzdHJpbmcsIHByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKHBhdHRlcm4gaW4gY2FsZW5kYXJQYXR0ZXJuTWFwKSB7XG5cdFx0XHRjb25zdCBtYXRjaGVkVmFsdWUgPSB2YWx1ZT8udG9TdHJpbmcoKS5tYXRjaChjYWxlbmRhclBhdHRlcm5NYXBbcGF0dGVybl0pO1xuXHRcdFx0aWYgKG1hdGNoZWRWYWx1ZSAmJiBtYXRjaGVkVmFsdWU/Lmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gTWljcm9DaGFydEhlbHBlci5mb3JtYXREaW1lbnNpb24obWF0Y2hlZFZhbHVlWzBdLCBwYXR0ZXJuLCBwcm9wZXJ0eVBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRMb2cud2FybmluZyhcIlBhdHRlcm4gbm90IHN1cHBvcnRlZCBmb3IgXCIgKyBwcm9wZXJ0eVBhdGgpO1xuXHRcdHJldHVybiAwO1xuXHR9LFxuXG5cdGdldFg6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZywgcHJvcGVydHlUeXBlOiBzdHJpbmcsIGFubm90YXRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcblx0XHRjb25zdCBwYXR0ZXJuID0gYW5ub3RhdGlvbnMgJiYgTWljcm9DaGFydEhlbHBlci5nZXRDYWxlbmRhclBhdHRlcm4ocHJvcGVydHlUeXBlLCBhbm5vdGF0aW9ucyk7XG5cdFx0aWYgKHBhdHRlcm4gJiYgW1wiRWRtLkRhdGVcIiwgXCJFZG0uU3RyaW5nXCJdLnNvbWUoKHR5cGUpID0+IHR5cGUgPT09IHByb3BlcnR5VHlwZSkpIHtcblx0XHRcdHJldHVybiBge3BhcnRzOiBbe3BhdGg6ICcke3Byb3BlcnR5UGF0aH0nLCB0YXJnZXRUeXBlOiAnYW55J30sIHt2YWx1ZTogJyR7cGF0dGVybn0nfSwge3ZhbHVlOiAnJHtwcm9wZXJ0eVBhdGh9J31dLCBmb3JtYXR0ZXI6ICdNSUNST0NIQVJUUi5mb3JtYXRTdHJpbmdEaW1lbnNpb24nfWA7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBNaWNyb0NoYXJ0SGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBV0EsTUFBTUEsVUFBVSxHQUFHQyxhQUFhLENBQUNELFVBQVU7RUFFM0MsTUFBTUUsa0JBQTZDLEdBQUc7SUFDckRDLElBQUksRUFBRSwwQkFBMEI7SUFDaENDLENBQUMsRUFBRSxPQUFPO0lBQ1ZDLEVBQUUsRUFBRSxlQUFlO0lBQ25CQyxFQUFFLEVBQUUsMEJBQTBCO0lBQzlCQyxRQUFRLEVBQUUsbUVBQW1FO0lBQzdFQyxNQUFNLEVBQUUsMkNBQTJDO0lBQ25ELFlBQVksRUFBRTtFQUNmLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUMsZ0JBQWdCLEdBQUc7SUFDeEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsaUJBQWlCLEVBQUUsVUFBVUMsS0FBYSxFQUFFQyxRQUFhLEVBQUU7TUFDMUQsTUFBTUMsSUFBSSxHQUFHRCxRQUFRLENBQUNFLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFO01BQ3ZDLElBQUlGLElBQUksQ0FBQ0csT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDeEMsT0FBT2hCLFVBQVUsQ0FBQ2lCLEtBQUs7TUFDeEIsQ0FBQyxNQUFNLElBQUlKLElBQUksQ0FBQ0csT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDL0MsT0FBT2hCLFVBQVUsQ0FBQ2tCLFFBQVE7TUFDM0I7TUFDQSxPQUFPbEIsVUFBVSxDQUFDbUIsT0FBTztJQUMxQixDQUFDO0lBRUQ7QUFD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