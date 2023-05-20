/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/SelectionVariantHelper", "sap/fe/core/formatters/TableFormatterTypes", "sap/fe/core/helpers/TypeGuards", "../../helpers/Aggregation", "../../helpers/ID", "./Criticality"], function (IssueManager, SelectionVariantHelper, TableFormatterTypes, TypeGuards, Aggregation, ID, Criticality) {
  "use strict";

  var _exports = {};
  var getMessageTypeFromCriticalityType = Criticality.getMessageTypeFromCriticalityType;
  var getKPIID = ID.getKPIID;
  var AggregationHelper = Aggregation.AggregationHelper;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isAnnotationOfType = TypeGuards.isAnnotationOfType;
  var MessageType = TableFormatterTypes.MessageType;
  var getFilterDefinitionsFromSelectionVariant = SelectionVariantHelper.getFilterDefinitionsFromSelectionVariant;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  const DeviationIndicatorFromTrendType = {
    "UI.TrendType/StrongUp": "Up",
    "UI.TrendType/Up": "Up",
    "UI.TrendType/StrongDown": "Down",
    "UI.TrendType/Down": "Down",
    "UI.TrendType/Sideways": "None"
  };
  const KPIChartTypeFromUI = {
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
  function convertKPIChart(chartAnnotation, presentationVariantAnnotation) {
    var _presentationVariantA, _presentationVariantA2;
    if (chartAnnotation.Measures === undefined) {
      // We need at least 1 measure (but no dimension is allowed, e.g. for bubble chart)
      return undefined;
    }
    const charDimensions = chartAnnotation.Dimensions ? chartAnnotation.Dimensions.map(propertyPath => {
      var _chartAnnotation$Dime, _propertyPath$$target, _propertyPath$$target2, _dimAttribute$Role;
      const dimAttribute = (_chartAnnotation$Dime = chartAnnotation.DimensionAttributes) === null || _chartAnnotation$Dime === void 0 ? void 0 : _chartAnnotation$Dime.find(attribute => {
        var _attribute$Dimension;
        return ((_attribute$Dimension = attribute.Dimension) === null || _attribute$Dimension === void 0 ? void 0 : _attribute$Dimension.value) === propertyPath.value;
      });
      return {
        name: propertyPath.value,
        label: ((_propertyPath$$target = propertyPath.$target.annotations.Common) === null || _propertyPath$$target === void 0 ? void 0 : (_propertyPath$$target2 = _propertyPath$$target.Label) === null || _propertyPath$$target2 === void 0 ? void 0 : _propertyPath$$target2.toString()) || propertyPath.value,
        role: dimAttribute === null || dimAttribute === void 0 ? void 0 : (_dimAttribute$Role = dimAttribute.Role) === null || _dimAttribute$Role === void 0 ? void 0 : _dimAttribute$Role.replace("UI.ChartDimensionRoleType/", "")
      };
    }) : [];
    const chartMeasures = chartAnnotation.Measures.map(propertyPath => {
      var _chartAnnotation$Meas, _propertyPath$$target3, _propertyPath$$target4, _measureAttribute$Rol;
      const measureAttribute = (_chartAnnotation$Meas = chartAnnotation.MeasureAttributes) === null || _chartAnnotation$Meas === void 0 ? void 0 : _chartAnnotation$Meas.find(attribute => {
        var _attribute$Measure;
        return ((_attribute$Measure = attribute.Measure) === null || _attribute$Measure === void 0 ? void 0 : _attribute$Measure.value) === propertyPath.value;
      });
      return {
        name: propertyPath.value,
        label: ((_propertyPath$$target3 = propertyPath.$target.annotations.Common) === null || _propertyPath$$target3 === void 0 ? void 0 : (_propertyPath$$target4 = _propertyPath$$target3.Label) === null || _propertyPath$$target4 === void 0 ? void 0 : _propertyPath$$target4.toString()) || propertyPath.value,
        role: measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Rol = measureAttribute.Role) === null || _measureAttribute$Rol === void 0 ? void 0 : _measureAttribute$Rol.replace("UI.ChartMeasureRoleType/", "")
      };
    });
    return {
      chartType: KPIChartTypeFromUI[chartAnnotation.ChartType] || "Line",
      dimensions: charDimensions,
      measures: chartMeasures,
      sortOrder: presentationVariantAnnotation === null || presentationVariantAnnotation === void 0 ? void 0 : (_presentationVariantA = presentationVariantAnnotation.SortOrder) === null || _presentationVariantA === void 0 ? void 0 : _presentationVariantA.map(sortOrder => {
        var _sortOrder$Property;
        return {
          name: ((_sortOrder$Property = sortOrder.Property) === null || _sortOrder$Property === void 0 ? void 0 : _sortOrder$Property.value) || "",
          descending: !!sortOrder.Descending
        };
      }),
      maxItems: presentationVariantAnnotation === null || presentationVariantAnnotation === void 0 ? void 0 : (_presentationVariantA2 = presentationVariantAnnotation.MaxItems) === null || _presentationVariantA2 === void 0 ? void 0 : _presentationVariantA2.valueOf()
    };
  }
  function updateCurrency(datapointAnnotation, kpiDef) {
    var _targetValueProperty$, _targetValueProperty$3;
    const targetValueProperty = datapointAnnotation.Value.$target;
    if ((_targetValueProperty$ = targetValueProperty.annotations.Measures) !== null && _targetValueProperty$ !== void 0 && _targetValueProperty$.ISOCurrency) {
      var _targetValueProperty$2;
      const currency = (_targetValueProperty$2 = targetValueProperty.annotations.Measures) === null || _targetValueProperty$2 === void 0 ? void 0 : _targetValueProperty$2.ISOCurrency;
      if (isPathAnnotationExpression(currency)) {
        kpiDef.datapoint.unit = {
          value: currency.$target.name,
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
    } else if ((_targetValueProperty$3 = targetValueProperty.annotations.Measures) !== null && _targetValueProperty$3 !== void 0 && _targetValueProperty$3.Unit) {
      var _targetValueProperty$4;
      const unit = (_targetValueProperty$4 = targetValueProperty.annotations.Measures) === null || _targetValueProperty$4 === void 0 ? void 0 : _targetValueProperty$4.Unit;
      if (isPathAnnotationExpression(unit)) {
        kpiDef.datapoint.unit = {
          value: unit.$target.name,
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
  function updateCriticality(datapointAnnotation, aggregationHelper, kpiDef) {
    if (datapointAnnotation.Criticality) {
      if (typeof datapointAnnotation.Criticality === "object") {
        // Criticality is a path --> check if the corresponding property is aggregatable
        const criticalityProperty = datapointAnnotation.Criticality.$target;
        if (aggregationHelper.isPropertyAggregatable(criticalityProperty)) {
          kpiDef.datapoint.criticalityPath = datapointAnnotation.Criticality.path;
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
  function updateTrend(datapointAnnotation, aggregationHelper, kpiDef) {
    if (datapointAnnotation.Trend) {
      if (typeof datapointAnnotation.Trend === "object") {
        // Trend is a path --> check if the corresponding property is aggregatable
        const trendProperty = datapointAnnotation.Trend.$target;
        if (aggregationHelper.isPropertyAggregatable(trendProperty)) {
          kpiDef.datapoint.trendPath = datapointAnnotation.Trend.path;
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
        const referenceProperty = datapointAnnotation.TrendCalculation.ReferenceValue.$target;
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
        kpiDef.datapoint.trendCalculationTresholds = [datapointAnnotation.TrendCalculation.StrongDownDifference.valueOf(), datapointAnnotation.TrendCalculation.DownDifference.valueOf(), datapointAnnotation.TrendCalculation.UpDifference.valueOf(), datapointAnnotation.TrendCalculation.StrongUpDifference.valueOf()];
      }
    } else {
      kpiDef.datapoint.trendValue = "None";
    }
  }
  function updateTarget(datapointAnnotation, aggregationHelper, kpiDef) {
    if (datapointAnnotation.TargetValue) {
      if (datapointAnnotation.TargetValue.$target) {
        // Target value is a path --> check if the corresponding property is aggregatable (otherwise ignore)
        const targetProperty = datapointAnnotation.TargetValue.$target;
        if (aggregationHelper.isPropertyAggregatable(targetProperty)) {
          kpiDef.datapoint.targetPath = datapointAnnotation.TargetValue.path;
        }
      } else {
        // Target value is a static value
        kpiDef.datapoint.targetValue = datapointAnnotation.TargetValue;
      }
    }
  }
  function getNavigationInfoFromProperty(property) {
    const annotations = property.annotations["Common"] || {};
    // Look for the semanticObject annotation (if any)
    let semanticObjectAnnotation;
    Object.keys(annotations).forEach(annotationKey => {
      const annotation = annotations[annotationKey];
      if (annotation.term === "com.sap.vocabularies.Common.v1.SemanticObject") {
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
      const annotationKey = Object.keys(annotations).find(key => {
        var _semanticObjectAnnota;
        return annotations[key].term === "com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions" && annotations[key].qualifier === ((_semanticObjectAnnota = semanticObjectAnnotation) === null || _semanticObjectAnnota === void 0 ? void 0 : _semanticObjectAnnota.qualifier);
      });
      if (annotationKey) {
        result.unavailableActions = annotations[annotationKey];
      }
      return result;
    } else {
      return undefined;
    }
  }
  function createKPIDefinition(kpiName, kpiConfig, converterContext) {
    var _datapointAnnotation$, _datapointAnnotation$2;
    const kpiConverterContext = converterContext.getConverterContextFor(`/${kpiConfig.entitySet}`);
    const aggregationHelper = new AggregationHelper(kpiConverterContext.getEntityType(), kpiConverterContext);
    if (!aggregationHelper.isAnalyticsSupported()) {
      // The entity doesn't support analytical queries
      converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.NO_ANALYTICS + kpiConfig.entitySet);
      return undefined;
    }
    let selectionVariantAnnotation;
    let datapointAnnotation;
    let presentationVariantAnnotation;
    let chartAnnotation;
    let navigationInfo;

    // Search for a KPI with the qualifier frmo the manifest
    const aKPIAnnotations = kpiConverterContext.getAnnotationsByTerm("UI", "com.sap.vocabularies.UI.v1.KPI");
    const targetKPI = aKPIAnnotations.find(kpi => {
      return kpi.qualifier === kpiConfig.qualifier;
    });
    if (targetKPI) {
      var _targetKPI$Detail, _presentationVariantA3, _presentationVariantA4, _presentationVariantA5, _targetKPI$Detail2;
      datapointAnnotation = targetKPI.DataPoint;
      selectionVariantAnnotation = targetKPI.SelectionVariant;
      presentationVariantAnnotation = (_targetKPI$Detail = targetKPI.Detail) === null || _targetKPI$Detail === void 0 ? void 0 : _targetKPI$Detail.DefaultPresentationVariant;
      chartAnnotation = (_presentationVariantA3 = presentationVariantAnnotation) === null || _presentationVariantA3 === void 0 ? void 0 : (_presentationVariantA4 = _presentationVariantA3.Visualizations) === null || _presentationVariantA4 === void 0 ? void 0 : (_presentationVariantA5 = _presentationVariantA4.find(viz => {
        return isAnnotationOfType(viz.$target, "com.sap.vocabularies.UI.v1.ChartDefinitionType");
      })) === null || _presentationVariantA5 === void 0 ? void 0 : _presentationVariantA5.$target;
      if ((_targetKPI$Detail2 = targetKPI.Detail) !== null && _targetKPI$Detail2 !== void 0 && _targetKPI$Detail2.SemanticObject) {
        var _targetKPI$Detail$Act;
        navigationInfo = {
          semanticObject: targetKPI.Detail.SemanticObject.toString(),
          action: (_targetKPI$Detail$Act = targetKPI.Detail.Action) === null || _targetKPI$Detail$Act === void 0 ? void 0 : _targetKPI$Detail$Act.toString(),
          unavailableActions: []
        };
      }
    } else {
      // Fallback: try to find a SPV with the same qualifier
      const aSPVAnnotations = kpiConverterContext.getAnnotationsByTerm("UI", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant");
      const targetSPV = aSPVAnnotations.find(spv => {
        return spv.qualifier === kpiConfig.qualifier;
      });
      if (targetSPV) {
        var _presentationVariantA6, _presentationVariantA7, _presentationVariantA8, _presentationVariantA9, _presentationVariantA10, _presentationVariantA11;
        selectionVariantAnnotation = targetSPV.SelectionVariant;
        presentationVariantAnnotation = targetSPV.PresentationVariant;
        datapointAnnotation = (_presentationVariantA6 = presentationVariantAnnotation) === null || _presentationVariantA6 === void 0 ? void 0 : (_presentationVariantA7 = _presentationVariantA6.Visualizations) === null || _presentationVariantA7 === void 0 ? void 0 : (_presentationVariantA8 = _presentationVariantA7.find(viz => {
          return isAnnotationOfType(viz.$target, "com.sap.vocabularies.UI.v1.DataPointType");
        })) === null || _presentationVariantA8 === void 0 ? void 0 : _presentationVariantA8.$target;
        chartAnnotation = (_presentationVariantA9 = presentationVariantAnnotation) === null || _presentationVariantA9 === void 0 ? void 0 : (_presentationVariantA10 = _presentationVariantA9.Visualizations) === null || _presentationVariantA10 === void 0 ? void 0 : (_presentationVariantA11 = _presentationVariantA10.find(viz => {
          return isAnnotationOfType(viz.$target, "com.sap.vocabularies.UI.v1.ChartDefinitionType");
        })) === null || _presentationVariantA11 === void 0 ? void 0 : _presentationVariantA11.$target;
      } else {
        // Couldn't find a KPI or a SPV annotation with the qualifier from the manifest
        converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.KPI_NOT_FOUND + kpiConfig.qualifier);
        return undefined;
      }
    }
    if (!presentationVariantAnnotation || !datapointAnnotation || !chartAnnotation) {
      // Couldn't find a chart or datapoint definition
      converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.KPI_DETAIL_NOT_FOUND + kpiConfig.qualifier);
      return undefined;
    }
    const datapointProperty = datapointAnnotation.Value.$target;
    if (!aggregationHelper.isPropertyAggregatable(datapointProperty)) {
      // The main property of the KPI is not aggregatable --> We can't calculate its value so we ignore the KPI
      converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.KPI_ISSUES.MAIN_PROPERTY_NOT_AGGREGATABLE + kpiConfig.qualifier);
      return undefined;
    }

    // Chart definition
    const chartDef = convertKPIChart(chartAnnotation, presentationVariantAnnotation);
    if (!chartDef) {
      return undefined;
    }
    const kpiDef = {
      id: getKPIID(kpiName),
      entitySet: kpiConfig.entitySet,
      datapoint: {
        propertyPath: datapointAnnotation.Value.path,
        annotationPath: kpiConverterContext.getEntitySetBasedAnnotationPath(datapointAnnotation.fullyQualifiedName),
        title: (_datapointAnnotation$ = datapointAnnotation.Title) === null || _datapointAnnotation$ === void 0 ? void 0 : _datapointAnnotation$.toString(),
        description: (_datapointAnnotation$2 = datapointAnnotation.Description) === null || _datapointAnnotation$2 === void 0 ? void 0 : _datapointAnnotation$2.toString()
      },
      selectionVariantFilterDefinitions: selectionVariantAnnotation ? getFilterDefinitionsFromSelectionVariant(selectionVariantAnnotation) : undefined,
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
  function getKPIDefinitions(converterContext) {
    const kpiConfigs = converterContext.getManifestWrapper().getKPIConfiguration(),
      kpiDefs = [];
    Object.keys(kpiConfigs).forEach(kpiName => {
      const oDef = createKPIDefinition(kpiName, kpiConfigs[kpiName], converterContext);
      if (oDef) {
        kpiDefs.push(oDef);
      }
    });
    return kpiDefs;
  }
  _exports.getKPIDefinitions = getKPIDefinitions;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXZpYXRpb25JbmRpY2F0b3JGcm9tVHJlbmRUeXBlIiwiS1BJQ2hhcnRUeXBlRnJvbVVJIiwiY29udmVydEtQSUNoYXJ0IiwiY2hhcnRBbm5vdGF0aW9uIiwicHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJNZWFzdXJlcyIsInVuZGVmaW5lZCIsImNoYXJEaW1lbnNpb25zIiwiRGltZW5zaW9ucyIsIm1hcCIsInByb3BlcnR5UGF0aCIsImRpbUF0dHJpYnV0ZSIsIkRpbWVuc2lvbkF0dHJpYnV0ZXMiLCJmaW5kIiwiYXR0cmlidXRlIiwiRGltZW5zaW9uIiwidmFsdWUiLCJuYW1lIiwibGFiZWwiLCIkdGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJMYWJlbCIsInRvU3RyaW5nIiwicm9sZSIsIlJvbGUiLCJyZXBsYWNlIiwiY2hhcnRNZWFzdXJlcyIsIm1lYXN1cmVBdHRyaWJ1dGUiLCJNZWFzdXJlQXR0cmlidXRlcyIsIk1lYXN1cmUiLCJjaGFydFR5cGUiLCJDaGFydFR5cGUiLCJkaW1lbnNpb25zIiwibWVhc3VyZXMiLCJzb3J0T3JkZXIiLCJTb3J0T3JkZXIiLCJQcm9wZXJ0eSIsImRlc2NlbmRpbmciLCJEZXNjZW5kaW5nIiwibWF4SXRlbXMiLCJNYXhJdGVtcyIsInZhbHVlT2YiLCJ1cGRhdGVDdXJyZW5jeSIsImRhdGFwb2ludEFubm90YXRpb24iLCJrcGlEZWYiLCJ0YXJnZXRWYWx1ZVByb3BlcnR5IiwiVmFsdWUiLCJJU09DdXJyZW5jeSIsImN1cnJlbmN5IiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCJkYXRhcG9pbnQiLCJ1bml0IiwiaXNDdXJyZW5jeSIsImlzUGF0aCIsIlVuaXQiLCJ1cGRhdGVDcml0aWNhbGl0eSIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQ3JpdGljYWxpdHkiLCJjcml0aWNhbGl0eVByb3BlcnR5IiwiaXNQcm9wZXJ0eUFnZ3JlZ2F0YWJsZSIsImNyaXRpY2FsaXR5UGF0aCIsInBhdGgiLCJjcml0aWNhbGl0eVZhbHVlIiwiTWVzc2FnZVR5cGUiLCJOb25lIiwiZ2V0TWVzc2FnZVR5cGVGcm9tQ3JpdGljYWxpdHlUeXBlIiwiQ3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsImNyaXRpY2FsaXR5Q2FsY3VsYXRpb25Nb2RlIiwiSW1wcm92ZW1lbnREaXJlY3Rpb24iLCJjcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcyIsInB1c2giLCJEZXZpYXRpb25SYW5nZUxvd1ZhbHVlIiwiVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSIsIkFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlIiwiQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlIiwiVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUiLCJEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZSIsInVwZGF0ZVRyZW5kIiwiVHJlbmQiLCJ0cmVuZFByb3BlcnR5IiwidHJlbmRQYXRoIiwidHJlbmRWYWx1ZSIsIlRyZW5kQ2FsY3VsYXRpb24iLCJ0cmVuZENhbGN1bGF0aW9uSXNSZWxhdGl2ZSIsIklzUmVsYXRpdmVEaWZmZXJlbmNlIiwiUmVmZXJlbmNlVmFsdWUiLCJyZWZlcmVuY2VQcm9wZXJ0eSIsInRyZW5kQ2FsY3VsYXRpb25SZWZlcmVuY2VQYXRoIiwidHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVZhbHVlIiwidHJlbmRDYWxjdWxhdGlvblRyZXNob2xkcyIsIlN0cm9uZ0Rvd25EaWZmZXJlbmNlIiwiRG93bkRpZmZlcmVuY2UiLCJVcERpZmZlcmVuY2UiLCJTdHJvbmdVcERpZmZlcmVuY2UiLCJ1cGRhdGVUYXJnZXQiLCJUYXJnZXRWYWx1ZSIsInRhcmdldFByb3BlcnR5IiwidGFyZ2V0UGF0aCIsInRhcmdldFZhbHVlIiwiZ2V0TmF2aWdhdGlvbkluZm9Gcm9tUHJvcGVydHkiLCJwcm9wZXJ0eSIsInNlbWFudGljT2JqZWN0QW5ub3RhdGlvbiIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiYW5ub3RhdGlvbktleSIsImFubm90YXRpb24iLCJ0ZXJtIiwicXVhbGlmaWVyIiwicmVzdWx0Iiwic2VtYW50aWNPYmplY3QiLCJ1bmF2YWlsYWJsZUFjdGlvbnMiLCJrZXkiLCJjcmVhdGVLUElEZWZpbml0aW9uIiwia3BpTmFtZSIsImtwaUNvbmZpZyIsImNvbnZlcnRlckNvbnRleHQiLCJrcGlDb252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dEZvciIsImVudGl0eVNldCIsIkFnZ3JlZ2F0aW9uSGVscGVyIiwiZ2V0RW50aXR5VHlwZSIsImlzQW5hbHl0aWNzU3VwcG9ydGVkIiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJBbm5vdGF0aW9uIiwiSXNzdWVTZXZlcml0eSIsIk1lZGl1bSIsIklzc3VlVHlwZSIsIktQSV9JU1NVRVMiLCJOT19BTkFMWVRJQ1MiLCJzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsIm5hdmlnYXRpb25JbmZvIiwiYUtQSUFubm90YXRpb25zIiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJ0YXJnZXRLUEkiLCJrcGkiLCJEYXRhUG9pbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwiRGV0YWlsIiwiRGVmYXVsdFByZXNlbnRhdGlvblZhcmlhbnQiLCJWaXN1YWxpemF0aW9ucyIsInZpeiIsImlzQW5ub3RhdGlvbk9mVHlwZSIsIlNlbWFudGljT2JqZWN0IiwiYWN0aW9uIiwiQWN0aW9uIiwiYVNQVkFubm90YXRpb25zIiwidGFyZ2V0U1BWIiwic3B2IiwiUHJlc2VudGF0aW9uVmFyaWFudCIsIktQSV9OT1RfRk9VTkQiLCJLUElfREVUQUlMX05PVF9GT1VORCIsImRhdGFwb2ludFByb3BlcnR5IiwiTUFJTl9QUk9QRVJUWV9OT1RfQUdHUkVHQVRBQkxFIiwiY2hhcnREZWYiLCJpZCIsImdldEtQSUlEIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwidGl0bGUiLCJUaXRsZSIsImRlc2NyaXB0aW9uIiwiRGVzY3JpcHRpb24iLCJzZWxlY3Rpb25WYXJpYW50RmlsdGVyRGVmaW5pdGlvbnMiLCJnZXRGaWx0ZXJEZWZpbml0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiY2hhcnQiLCJkZXRhaWxOYXZpZ2F0aW9uIiwib3V0Ym91bmROYXZpZ2F0aW9uIiwibmF2aWdhdGlvbiIsImdldEtQSURlZmluaXRpb25zIiwia3BpQ29uZmlncyIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldEtQSUNvbmZpZ3VyYXRpb24iLCJrcGlEZWZzIiwib0RlZiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiS1BJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY09iamVjdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHR5cGUge1xuXHRDaGFydCxcblx0Q3JpdGljYWxpdHlUeXBlLFxuXHREYXRhUG9pbnQsXG5cdERhdGFQb2ludFR5cGUsXG5cdEltcHJvdmVtZW50RGlyZWN0aW9uVHlwZSxcblx0S1BJLFxuXHRQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0U2VsZWN0aW9uVmFyaWFudFR5cGUsXG5cdFRyZW5kVHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckRlZmluaXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL1NlbGVjdGlvblZhcmlhbnRIZWxwZXJcIjtcbmltcG9ydCB7IGdldEZpbHRlckRlZmluaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL1NlbGVjdGlvblZhcmlhbnRIZWxwZXJcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVGFibGVGb3JtYXR0ZXJUeXBlc1wiO1xuaW1wb3J0IHsgaXNBbm5vdGF0aW9uT2ZUeXBlLCBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IGdldEtQSUlEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHsgS1BJQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUgfSBmcm9tIFwiLi9Dcml0aWNhbGl0eVwiO1xuXG5leHBvcnQgdHlwZSBOYXZpZ2F0aW9uSW5mbyA9IHtcblx0c2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7XG5cdGFjdGlvbj86IHN0cmluZztcblx0dW5hdmFpbGFibGVBY3Rpb25zPzogc3RyaW5nW107XG5cdG91dGJvdW5kTmF2aWdhdGlvbj86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEtQSUNoYXJ0RGVmaW5pdGlvbiA9IHtcblx0Y2hhcnRUeXBlOiBzdHJpbmc7XG5cdGRpbWVuc2lvbnM6IHsgbmFtZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyByb2xlPzogc3RyaW5nIH1bXTtcblx0bWVhc3VyZXM6IHsgbmFtZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyByb2xlPzogc3RyaW5nIH1bXTtcblx0c29ydE9yZGVyPzogeyBuYW1lOiBzdHJpbmc7IGRlc2NlbmRpbmc6IGJvb2xlYW4gfVtdO1xuXHRtYXhJdGVtcz86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIEtQSURlZmluaXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdGVudGl0eVNldDogc3RyaW5nO1xuXHRkYXRhcG9pbnQ6IHtcblx0XHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHRcdHVuaXQ/OiB7XG5cdFx0XHR2YWx1ZTogc3RyaW5nO1xuXHRcdFx0aXNQYXRoOiBib29sZWFuO1xuXHRcdFx0aXNDdXJyZW5jeTogYm9vbGVhbjtcblx0XHR9O1xuXHRcdGNyaXRpY2FsaXR5UGF0aD86IHN0cmluZztcblx0XHRjcml0aWNhbGl0eVZhbHVlPzogTWVzc2FnZVR5cGU7XG5cdFx0Y3JpdGljYWxpdHlDYWxjdWxhdGlvbk1vZGU/OiBJbXByb3ZlbWVudERpcmVjdGlvblR5cGU7XG5cdFx0Y3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHM/OiAobnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbClbXTtcblx0XHR0aXRsZT86IHN0cmluZztcblx0XHRkZXNjcmlwdGlvbj86IHN0cmluZztcblx0XHR0cmVuZFBhdGg/OiBzdHJpbmc7XG5cdFx0dHJlbmRWYWx1ZT86IHN0cmluZztcblx0XHR0cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlVmFsdWU/OiBudW1iZXI7XG5cdFx0dHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVBhdGg/OiBzdHJpbmc7XG5cdFx0dHJlbmRDYWxjdWxhdGlvblRyZXNob2xkcz86IChudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKVtdO1xuXHRcdHRyZW5kQ2FsY3VsYXRpb25Jc1JlbGF0aXZlPzogYm9vbGVhbjtcblx0XHR0YXJnZXRWYWx1ZT86IG51bWJlcjtcblx0XHR0YXJnZXRQYXRoPzogc3RyaW5nO1xuXHR9O1xuXHRjaGFydDogS1BJQ2hhcnREZWZpbml0aW9uO1xuXHRzZWxlY3Rpb25WYXJpYW50RmlsdGVyRGVmaW5pdGlvbnM/OiBGaWx0ZXJEZWZpbml0aW9uW107XG5cdG5hdmlnYXRpb24/OiBOYXZpZ2F0aW9uSW5mbztcbn07XG5cbmNvbnN0IERldmlhdGlvbkluZGljYXRvckZyb21UcmVuZFR5cGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG5cdFwiVUkuVHJlbmRUeXBlL1N0cm9uZ1VwXCI6IFwiVXBcIixcblx0XCJVSS5UcmVuZFR5cGUvVXBcIjogXCJVcFwiLFxuXHRcIlVJLlRyZW5kVHlwZS9TdHJvbmdEb3duXCI6IFwiRG93blwiLFxuXHRcIlVJLlRyZW5kVHlwZS9Eb3duXCI6IFwiRG93blwiLFxuXHRcIlVJLlRyZW5kVHlwZS9TaWRld2F5c1wiOiBcIk5vbmVcIlxufTtcblxuY29uc3QgS1BJQ2hhcnRUeXBlRnJvbVVJOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuXHRcIlVJLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkXCI6IFwiU3RhY2tlZENvbHVtblwiLFxuXHRcIlVJLkNoYXJ0VHlwZS9CYXJTdGFja2VkXCI6IFwiU3RhY2tlZEJhclwiLFxuXHRcIlVJLkNoYXJ0VHlwZS9Eb251dFwiOiBcIkRvbnV0XCIsXG5cdFwiVUkuQ2hhcnRUeXBlL0xpbmVcIjogXCJMaW5lXCIsXG5cdFwiVUkuQ2hhcnRUeXBlL0J1YmJsZVwiOiBcImJ1YmJsZVwiLFxuXHRcIlVJLkNoYXJ0VHlwZS9Db2x1bW5cIjogXCJjb2x1bW5cIixcblx0XCJVSS5DaGFydFR5cGUvQmFyXCI6IFwiYmFyXCIsXG5cdFwiVUkuQ2hhcnRUeXBlL1ZlcnRpY2FsQnVsbGV0XCI6IFwidmVydGljYWxfYnVsbGV0XCIsXG5cdFwiVUkuQ2hhcnRUeXBlL0NvbWJpbmF0aW9uXCI6IFwiY29tYmluYXRpb25cIixcblx0XCJVSS5DaGFydFR5cGUvU2NhdHRlclwiOiBcInNjYXR0ZXJcIlxufTtcblxuZnVuY3Rpb24gY29udmVydEtQSUNoYXJ0KGNoYXJ0QW5ub3RhdGlvbjogQ2hhcnQsIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSk6IEtQSUNoYXJ0RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG5cdGlmIChjaGFydEFubm90YXRpb24uTWVhc3VyZXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIFdlIG5lZWQgYXQgbGVhc3QgMSBtZWFzdXJlIChidXQgbm8gZGltZW5zaW9uIGlzIGFsbG93ZWQsIGUuZy4gZm9yIGJ1YmJsZSBjaGFydClcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Y29uc3QgY2hhckRpbWVuc2lvbnMgPSBjaGFydEFubm90YXRpb24uRGltZW5zaW9uc1xuXHRcdD8gY2hhcnRBbm5vdGF0aW9uLkRpbWVuc2lvbnMubWFwKChwcm9wZXJ0eVBhdGgpID0+IHtcblx0XHRcdFx0Y29uc3QgZGltQXR0cmlidXRlID0gY2hhcnRBbm5vdGF0aW9uLkRpbWVuc2lvbkF0dHJpYnV0ZXM/LmZpbmQoKGF0dHJpYnV0ZSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBhdHRyaWJ1dGUuRGltZW5zaW9uPy52YWx1ZSA9PT0gcHJvcGVydHlQYXRoLnZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRuYW1lOiBwcm9wZXJ0eVBhdGgudmFsdWUsXG5cdFx0XHRcdFx0bGFiZWw6IHByb3BlcnR5UGF0aC4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbj8uTGFiZWw/LnRvU3RyaW5nKCkgfHwgcHJvcGVydHlQYXRoLnZhbHVlLFxuXHRcdFx0XHRcdHJvbGU6IGRpbUF0dHJpYnV0ZT8uUm9sZT8ucmVwbGFjZShcIlVJLkNoYXJ0RGltZW5zaW9uUm9sZVR5cGUvXCIsIFwiXCIpXG5cdFx0XHRcdH07XG5cdFx0ICB9KVxuXHRcdDogW107XG5cblx0Y29uc3QgY2hhcnRNZWFzdXJlcyA9IGNoYXJ0QW5ub3RhdGlvbi5NZWFzdXJlcy5tYXAoKHByb3BlcnR5UGF0aCkgPT4ge1xuXHRcdGNvbnN0IG1lYXN1cmVBdHRyaWJ1dGUgPSBjaGFydEFubm90YXRpb24uTWVhc3VyZUF0dHJpYnV0ZXM/LmZpbmQoKGF0dHJpYnV0ZSkgPT4ge1xuXHRcdFx0cmV0dXJuIGF0dHJpYnV0ZS5NZWFzdXJlPy52YWx1ZSA9PT0gcHJvcGVydHlQYXRoLnZhbHVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiBwcm9wZXJ0eVBhdGgudmFsdWUsXG5cdFx0XHRsYWJlbDogcHJvcGVydHlQYXRoLiR0YXJnZXQuYW5ub3RhdGlvbnMuQ29tbW9uPy5MYWJlbD8udG9TdHJpbmcoKSB8fCBwcm9wZXJ0eVBhdGgudmFsdWUsXG5cdFx0XHRyb2xlOiBtZWFzdXJlQXR0cmlidXRlPy5Sb2xlPy5yZXBsYWNlKFwiVUkuQ2hhcnRNZWFzdXJlUm9sZVR5cGUvXCIsIFwiXCIpXG5cdFx0fTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRjaGFydFR5cGU6IEtQSUNoYXJ0VHlwZUZyb21VSVtjaGFydEFubm90YXRpb24uQ2hhcnRUeXBlXSB8fCBcIkxpbmVcIixcblx0XHRkaW1lbnNpb25zOiBjaGFyRGltZW5zaW9ucyxcblx0XHRtZWFzdXJlczogY2hhcnRNZWFzdXJlcyxcblx0XHRzb3J0T3JkZXI6IHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Tb3J0T3JkZXI/Lm1hcCgoc29ydE9yZGVyKSA9PiB7XG5cdFx0XHRyZXR1cm4geyBuYW1lOiBzb3J0T3JkZXIuUHJvcGVydHk/LnZhbHVlIHx8IFwiXCIsIGRlc2NlbmRpbmc6ICEhc29ydE9yZGVyLkRlc2NlbmRpbmcgfTtcblx0XHR9KSxcblx0XHRtYXhJdGVtczogcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/Lk1heEl0ZW1zPy52YWx1ZU9mKCkgYXMgbnVtYmVyXG5cdH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUN1cnJlbmN5KGRhdGFwb2ludEFubm90YXRpb246IERhdGFQb2ludFR5cGUsIGtwaURlZjogS1BJRGVmaW5pdGlvbik6IHZvaWQge1xuXHRjb25zdCB0YXJnZXRWYWx1ZVByb3BlcnR5ID0gZGF0YXBvaW50QW5ub3RhdGlvbi5WYWx1ZS4kdGFyZ2V0IGFzIFByb3BlcnR5O1xuXHRpZiAodGFyZ2V0VmFsdWVQcm9wZXJ0eS5hbm5vdGF0aW9ucy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kpIHtcblx0XHRjb25zdCBjdXJyZW5jeSA9IHRhcmdldFZhbHVlUHJvcGVydHkuYW5ub3RhdGlvbnMuTWVhc3VyZXM/LklTT0N1cnJlbmN5O1xuXHRcdGlmIChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihjdXJyZW5jeSkpIHtcblx0XHRcdGtwaURlZi5kYXRhcG9pbnQudW5pdCA9IHtcblx0XHRcdFx0dmFsdWU6IChjdXJyZW5jeS4kdGFyZ2V0IGFzIHVua25vd24gYXMgUHJvcGVydHkpLm5hbWUsXG5cdFx0XHRcdGlzQ3VycmVuY3k6IHRydWUsXG5cdFx0XHRcdGlzUGF0aDogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0a3BpRGVmLmRhdGFwb2ludC51bml0ID0ge1xuXHRcdFx0XHR2YWx1ZTogY3VycmVuY3kudG9TdHJpbmcoKSxcblx0XHRcdFx0aXNDdXJyZW5jeTogdHJ1ZSxcblx0XHRcdFx0aXNQYXRoOiBmYWxzZVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSBpZiAodGFyZ2V0VmFsdWVQcm9wZXJ0eS5hbm5vdGF0aW9ucy5NZWFzdXJlcz8uVW5pdCkge1xuXHRcdGNvbnN0IHVuaXQgPSB0YXJnZXRWYWx1ZVByb3BlcnR5LmFubm90YXRpb25zLk1lYXN1cmVzPy5Vbml0O1xuXHRcdGlmIChpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbih1bml0KSkge1xuXHRcdFx0a3BpRGVmLmRhdGFwb2ludC51bml0ID0ge1xuXHRcdFx0XHR2YWx1ZTogKHVuaXQuJHRhcmdldCBhcyB1bmtub3duIGFzIFByb3BlcnR5KS5uYW1lLFxuXHRcdFx0XHRpc0N1cnJlbmN5OiBmYWxzZSxcblx0XHRcdFx0aXNQYXRoOiB0cnVlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRrcGlEZWYuZGF0YXBvaW50LnVuaXQgPSB7XG5cdFx0XHRcdHZhbHVlOiB1bml0LnRvU3RyaW5nKCksXG5cdFx0XHRcdGlzQ3VycmVuY3k6IGZhbHNlLFxuXHRcdFx0XHRpc1BhdGg6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVDcml0aWNhbGl0eShkYXRhcG9pbnRBbm5vdGF0aW9uOiBEYXRhUG9pbnRUeXBlLCBhZ2dyZWdhdGlvbkhlbHBlcjogQWdncmVnYXRpb25IZWxwZXIsIGtwaURlZjogS1BJRGVmaW5pdGlvbik6IHZvaWQge1xuXHRpZiAoZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eSkge1xuXHRcdGlmICh0eXBlb2YgZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0Ly8gQ3JpdGljYWxpdHkgaXMgYSBwYXRoIC0tPiBjaGVjayBpZiB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBpcyBhZ2dyZWdhdGFibGVcblx0XHRcdGNvbnN0IGNyaXRpY2FsaXR5UHJvcGVydHkgPSAoZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248UHJvcGVydHk+KS4kdGFyZ2V0O1xuXHRcdFx0aWYgKGFnZ3JlZ2F0aW9uSGVscGVyLmlzUHJvcGVydHlBZ2dyZWdhdGFibGUoY3JpdGljYWxpdHlQcm9wZXJ0eSkpIHtcblx0XHRcdFx0a3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eVBhdGggPSAoZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248Q3JpdGljYWxpdHlUeXBlPikucGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFRoZSBwcm9wZXJ0eSBpc24ndCBhZ2dyZWdhdGFibGUgLS0+IHdlIGlnbm9yZSBpdFxuXHRcdFx0XHRrcGlEZWYuZGF0YXBvaW50LmNyaXRpY2FsaXR5VmFsdWUgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBDcml0aWNhbGl0eSBpcyBhbiBlbnVtIFZhbHVlIC0tPiBnZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3RhdGljIHZhbHVlXG5cdFx0XHRrcGlEZWYuZGF0YXBvaW50LmNyaXRpY2FsaXR5VmFsdWUgPSBnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUoZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGRhdGFwb2ludEFubm90YXRpb24uQ3JpdGljYWxpdHlDYWxjdWxhdGlvbikge1xuXHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvbk1vZGUgPSBkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uSW1wcm92ZW1lbnREaXJlY3Rpb247XG5cdFx0a3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcyA9IFtdO1xuXHRcdHN3aXRjaCAoa3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uTW9kZSkge1xuXHRcdFx0Y2FzZSBcIlVJLkltcHJvdmVtZW50RGlyZWN0aW9uVHlwZS9UYXJnZXRcIjpcblx0XHRcdFx0a3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcy5wdXNoKGRhdGFwb2ludEFubm90YXRpb24uQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5EZXZpYXRpb25SYW5nZUxvd1ZhbHVlKTtcblx0XHRcdFx0a3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcy5wdXNoKGRhdGFwb2ludEFubm90YXRpb24uQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Ub2xlcmFuY2VSYW5nZUxvd1ZhbHVlKTtcblx0XHRcdFx0a3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcy5wdXNoKGRhdGFwb2ludEFubm90YXRpb24uQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5BY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSk7XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMucHVzaChkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlKTtcblx0XHRcdFx0a3BpRGVmLmRhdGFwb2ludC5jcml0aWNhbGl0eUNhbGN1bGF0aW9uVGhyZXNob2xkcy5wdXNoKGRhdGFwb2ludEFubm90YXRpb24uQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Ub2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZSk7XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMucHVzaChkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWUpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIlVJLkltcHJvdmVtZW50RGlyZWN0aW9uVHlwZS9NaW5pbWl6ZVwiOlxuXHRcdFx0XHRrcGlEZWYuZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzLnB1c2goZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZSk7XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMucHVzaChkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUpO1xuXHRcdFx0XHRrcGlEZWYuZGF0YXBvaW50LmNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UaHJlc2hvbGRzLnB1c2goZGF0YXBvaW50QW5ub3RhdGlvbi5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkRldmlhdGlvblJhbmdlSGlnaFZhbHVlKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJVSS5JbXByb3ZlbWVudERpcmVjdGlvblR5cGUvTWF4aW1pemVcIjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMucHVzaChkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSk7XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMucHVzaChkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSk7XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQuY3JpdGljYWxpdHlDYWxjdWxhdGlvblRocmVzaG9sZHMucHVzaChkYXRhcG9pbnRBbm5vdGF0aW9uLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQWNjZXB0YW5jZVJhbmdlTG93VmFsdWUpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRrcGlEZWYuZGF0YXBvaW50LmNyaXRpY2FsaXR5VmFsdWUgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRyZW5kKGRhdGFwb2ludEFubm90YXRpb246IERhdGFQb2ludFR5cGUsIGFnZ3JlZ2F0aW9uSGVscGVyOiBBZ2dyZWdhdGlvbkhlbHBlciwga3BpRGVmOiBLUElEZWZpbml0aW9uKTogdm9pZCB7XG5cdGlmIChkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kKSB7XG5cdFx0aWYgKHR5cGVvZiBkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHQvLyBUcmVuZCBpcyBhIHBhdGggLS0+IGNoZWNrIGlmIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGlzIGFnZ3JlZ2F0YWJsZVxuXHRcdFx0Y29uc3QgdHJlbmRQcm9wZXJ0eSA9IChkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kIGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxQcm9wZXJ0eT4pLiR0YXJnZXQ7XG5cdFx0XHRpZiAoYWdncmVnYXRpb25IZWxwZXIuaXNQcm9wZXJ0eUFnZ3JlZ2F0YWJsZSh0cmVuZFByb3BlcnR5KSkge1xuXHRcdFx0XHRrcGlEZWYuZGF0YXBvaW50LnRyZW5kUGF0aCA9IChkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kIGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUcmVuZFR5cGU+KS5wYXRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gVGhlIHByb3BlcnR5IGlzbid0IGFnZ3JlZ2F0YWJsZSAtLT4gd2UgaWdub3JlIGl0XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQudHJlbmRWYWx1ZSA9IFwiTm9uZVwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBUcmVuZCBpcyBhbiBlbnVtIFZhbHVlIC0tPiBnZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3RhdGljIHZhbHVlXG5cdFx0XHRrcGlEZWYuZGF0YXBvaW50LnRyZW5kVmFsdWUgPSBEZXZpYXRpb25JbmRpY2F0b3JGcm9tVHJlbmRUeXBlW2RhdGFwb2ludEFubm90YXRpb24uVHJlbmRdIHx8IFwiTm9uZVwiO1xuXHRcdH1cblx0fSBlbHNlIGlmIChkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kQ2FsY3VsYXRpb24pIHtcblx0XHRrcGlEZWYuZGF0YXBvaW50LnRyZW5kQ2FsY3VsYXRpb25Jc1JlbGF0aXZlID0gZGF0YXBvaW50QW5ub3RhdGlvbi5UcmVuZENhbGN1bGF0aW9uLklzUmVsYXRpdmVEaWZmZXJlbmNlID8gdHJ1ZSA6IGZhbHNlO1xuXHRcdGlmIChkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kQ2FsY3VsYXRpb24uUmVmZXJlbmNlVmFsdWUuJHRhcmdldCkge1xuXHRcdFx0Ly8gUmVmZXJlbmNlIHZhbHVlIGlzIGEgcGF0aCAtLT4gY2hlY2sgaWYgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaXMgYWdncmVnYXRhYmxlXG5cdFx0XHRjb25zdCByZWZlcmVuY2VQcm9wZXJ0eSA9IGRhdGFwb2ludEFubm90YXRpb24uVHJlbmRDYWxjdWxhdGlvbi5SZWZlcmVuY2VWYWx1ZS4kdGFyZ2V0IGFzIFByb3BlcnR5O1xuXHRcdFx0aWYgKGFnZ3JlZ2F0aW9uSGVscGVyLmlzUHJvcGVydHlBZ2dyZWdhdGFibGUocmVmZXJlbmNlUHJvcGVydHkpKSB7XG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVBhdGggPSBkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kQ2FsY3VsYXRpb24uUmVmZXJlbmNlVmFsdWUucGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFRoZSBwcm9wZXJ0eSBpc24ndCBhZ2dyZWdhdGFibGUgLS0+IHdlIGlnbm9yZSBpdCBhbmQgc3dpdGNoIGJhY2sgdG8gdHJlbmQgJ05vbmUnXG5cdFx0XHRcdGtwaURlZi5kYXRhcG9pbnQudHJlbmRWYWx1ZSA9IFwiTm9uZVwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBSZWZlcmVuY2UgdmFsdWUgaXMgYSBzdGF0aWMgdmFsdWVcblx0XHRcdGtwaURlZi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVZhbHVlID0gZGF0YXBvaW50QW5ub3RhdGlvbi5UcmVuZENhbGN1bGF0aW9uLlJlZmVyZW5jZVZhbHVlO1xuXHRcdH1cblx0XHRpZiAoa3BpRGVmLmRhdGFwb2ludC50cmVuZENhbGN1bGF0aW9uUmVmZXJlbmNlUGF0aCAhPT0gdW5kZWZpbmVkIHx8IGtwaURlZi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblJlZmVyZW5jZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGtwaURlZi5kYXRhcG9pbnQudHJlbmRDYWxjdWxhdGlvblRyZXNob2xkcyA9IFtcblx0XHRcdFx0ZGF0YXBvaW50QW5ub3RhdGlvbi5UcmVuZENhbGN1bGF0aW9uLlN0cm9uZ0Rvd25EaWZmZXJlbmNlLnZhbHVlT2YoKSBhcyBudW1iZXIsXG5cdFx0XHRcdGRhdGFwb2ludEFubm90YXRpb24uVHJlbmRDYWxjdWxhdGlvbi5Eb3duRGlmZmVyZW5jZS52YWx1ZU9mKCkgYXMgbnVtYmVyLFxuXHRcdFx0XHRkYXRhcG9pbnRBbm5vdGF0aW9uLlRyZW5kQ2FsY3VsYXRpb24uVXBEaWZmZXJlbmNlLnZhbHVlT2YoKSBhcyBudW1iZXIsXG5cdFx0XHRcdGRhdGFwb2ludEFubm90YXRpb24uVHJlbmRDYWxjdWxhdGlvbi5TdHJvbmdVcERpZmZlcmVuY2UudmFsdWVPZigpIGFzIG51bWJlclxuXHRcdFx0XTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0a3BpRGVmLmRhdGFwb2ludC50cmVuZFZhbHVlID0gXCJOb25lXCI7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlVGFyZ2V0KGRhdGFwb2ludEFubm90YXRpb246IERhdGFQb2ludFR5cGUsIGFnZ3JlZ2F0aW9uSGVscGVyOiBBZ2dyZWdhdGlvbkhlbHBlciwga3BpRGVmOiBLUElEZWZpbml0aW9uKTogdm9pZCB7XG5cdGlmIChkYXRhcG9pbnRBbm5vdGF0aW9uLlRhcmdldFZhbHVlKSB7XG5cdFx0aWYgKGRhdGFwb2ludEFubm90YXRpb24uVGFyZ2V0VmFsdWUuJHRhcmdldCkge1xuXHRcdFx0Ly8gVGFyZ2V0IHZhbHVlIGlzIGEgcGF0aCAtLT4gY2hlY2sgaWYgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaXMgYWdncmVnYXRhYmxlIChvdGhlcndpc2UgaWdub3JlKVxuXHRcdFx0Y29uc3QgdGFyZ2V0UHJvcGVydHkgPSBkYXRhcG9pbnRBbm5vdGF0aW9uLlRhcmdldFZhbHVlLiR0YXJnZXQgYXMgUHJvcGVydHk7XG5cdFx0XHRpZiAoYWdncmVnYXRpb25IZWxwZXIuaXNQcm9wZXJ0eUFnZ3JlZ2F0YWJsZSh0YXJnZXRQcm9wZXJ0eSkpIHtcblx0XHRcdFx0a3BpRGVmLmRhdGFwb2ludC50YXJnZXRQYXRoID0gZGF0YXBvaW50QW5ub3RhdGlvbi5UYXJnZXRWYWx1ZS5wYXRoO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBUYXJnZXQgdmFsdWUgaXMgYSBzdGF0aWMgdmFsdWVcblx0XHRcdGtwaURlZi5kYXRhcG9pbnQudGFyZ2V0VmFsdWUgPSBkYXRhcG9pbnRBbm5vdGF0aW9uLlRhcmdldFZhbHVlO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uSW5mb0Zyb21Qcm9wZXJ0eShwcm9wZXJ0eTogUHJvcGVydHkpOiBOYXZpZ2F0aW9uSW5mbyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGFubm90YXRpb25zID0gcHJvcGVydHkuYW5ub3RhdGlvbnNbXCJDb21tb25cIl0gfHwge307XG5cdC8vIExvb2sgZm9yIHRoZSBzZW1hbnRpY09iamVjdCBhbm5vdGF0aW9uIChpZiBhbnkpXG5cdGxldCBzZW1hbnRpY09iamVjdEFubm90YXRpb246IFNlbWFudGljT2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRPYmplY3Qua2V5cyhhbm5vdGF0aW9ucykuZm9yRWFjaCgoYW5ub3RhdGlvbktleSkgPT4ge1xuXHRcdGNvbnN0IGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1thbm5vdGF0aW9uS2V5IGFzIGtleW9mIHR5cGVvZiBhbm5vdGF0aW9uc107XG5cdFx0aWYgKGFubm90YXRpb24udGVybSA9PT0gQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRpZiAoIWFubm90YXRpb24ucXVhbGlmaWVyIHx8ICFzZW1hbnRpY09iamVjdEFubm90YXRpb24pIHtcblx0XHRcdFx0Ly8gV2UgYWx3YXlzIHRha2UgdGhlIGFubm90YXRpb24gd2l0aG91dCBxdWFsaWZpZXIgaWYgdGhlcmUncyBvbmUsIG90aGVyd2lzZSB3ZSB0YWtlIHRoZSBmaXJzdCBvbmVcblx0XHRcdFx0c2VtYW50aWNPYmplY3RBbm5vdGF0aW9uID0gYW5ub3RhdGlvbjtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdGlmIChzZW1hbnRpY09iamVjdEFubm90YXRpb24pIHtcblx0XHRjb25zdCByZXN1bHQgPSB7XG5cdFx0XHRzZW1hbnRpY09iamVjdDogc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uLnRvU3RyaW5nKCksXG5cdFx0XHR1bmF2YWlsYWJsZUFjdGlvbnM6IFtdXG5cdFx0fTtcblxuXHRcdC8vIExvb2sgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zIChpZiBhbnkpXG5cdFx0Y29uc3QgYW5ub3RhdGlvbktleSA9IE9iamVjdC5rZXlzKGFubm90YXRpb25zKS5maW5kKChrZXkpID0+IHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGFubm90YXRpb25zW2tleSBhcyBrZXlvZiB0eXBlb2YgYW5ub3RhdGlvbnNdLnRlcm0gPT09IENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyAmJlxuXHRcdFx0XHRhbm5vdGF0aW9uc1trZXkgYXMga2V5b2YgdHlwZW9mIGFubm90YXRpb25zXS5xdWFsaWZpZXIgPT09IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvbj8ucXVhbGlmaWVyXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHRcdGlmIChhbm5vdGF0aW9uS2V5KSB7XG5cdFx0XHRyZXN1bHQudW5hdmFpbGFibGVBY3Rpb25zID0gYW5ub3RhdGlvbnNbYW5ub3RhdGlvbktleSBhcyBrZXlvZiB0eXBlb2YgYW5ub3RhdGlvbnNdO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVLUElEZWZpbml0aW9uKGtwaU5hbWU6IHN0cmluZywga3BpQ29uZmlnOiBLUElDb25maWd1cmF0aW9uLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogS1BJRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGtwaUNvbnZlcnRlckNvbnRleHQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3IoYC8ke2twaUNvbmZpZy5lbnRpdHlTZXR9YCk7XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGtwaUNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBrcGlDb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRpZiAoIWFnZ3JlZ2F0aW9uSGVscGVyLmlzQW5hbHl0aWNzU3VwcG9ydGVkKCkpIHtcblx0XHQvLyBUaGUgZW50aXR5IGRvZXNuJ3Qgc3VwcG9ydCBhbmFseXRpY2FsIHF1ZXJpZXNcblx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHQuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0LmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5LUElfSVNTVUVTLk5PX0FOQUxZVElDUyArIGtwaUNvbmZpZy5lbnRpdHlTZXQpO1xuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGxldCBzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbjogU2VsZWN0aW9uVmFyaWFudFR5cGUgfCB1bmRlZmluZWQ7XG5cdGxldCBkYXRhcG9pbnRBbm5vdGF0aW9uOiBEYXRhUG9pbnRUeXBlIHwgdW5kZWZpbmVkO1xuXHRsZXQgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb246IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlIHwgdW5kZWZpbmVkO1xuXHRsZXQgY2hhcnRBbm5vdGF0aW9uOiBDaGFydCB8IHVuZGVmaW5lZDtcblx0bGV0IG5hdmlnYXRpb25JbmZvOiBOYXZpZ2F0aW9uSW5mbyB8IHVuZGVmaW5lZDtcblxuXHQvLyBTZWFyY2ggZm9yIGEgS1BJIHdpdGggdGhlIHF1YWxpZmllciBmcm1vIHRoZSBtYW5pZmVzdFxuXHRjb25zdCBhS1BJQW5ub3RhdGlvbnMgPSBrcGlDb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiVUlcIiwgVUlBbm5vdGF0aW9uVGVybXMuS1BJKSBhcyBLUElbXTtcblx0Y29uc3QgdGFyZ2V0S1BJID0gYUtQSUFubm90YXRpb25zLmZpbmQoKGtwaSkgPT4ge1xuXHRcdHJldHVybiBrcGkucXVhbGlmaWVyID09PSBrcGlDb25maWcucXVhbGlmaWVyO1xuXHR9KTtcblx0aWYgKHRhcmdldEtQSSkge1xuXHRcdGRhdGFwb2ludEFubm90YXRpb24gPSB0YXJnZXRLUEkuRGF0YVBvaW50O1xuXHRcdHNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uID0gdGFyZ2V0S1BJLlNlbGVjdGlvblZhcmlhbnQ7XG5cdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24gPSB0YXJnZXRLUEkuRGV0YWlsPy5EZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRjaGFydEFubm90YXRpb24gPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj8uVmlzdWFsaXphdGlvbnM/LmZpbmQoKHZpeikgPT4ge1xuXHRcdFx0cmV0dXJuIGlzQW5ub3RhdGlvbk9mVHlwZTxDaGFydD4odml6LiR0YXJnZXQsIFVJQW5ub3RhdGlvblR5cGVzLkNoYXJ0RGVmaW5pdGlvblR5cGUpO1xuXHRcdH0pPy4kdGFyZ2V0IGFzIENoYXJ0O1xuXG5cdFx0aWYgKHRhcmdldEtQSS5EZXRhaWw/LlNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRuYXZpZ2F0aW9uSW5mbyA9IHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHRhcmdldEtQSS5EZXRhaWwuU2VtYW50aWNPYmplY3QudG9TdHJpbmcoKSxcblx0XHRcdFx0YWN0aW9uOiB0YXJnZXRLUEkuRGV0YWlsLkFjdGlvbj8udG9TdHJpbmcoKSxcblx0XHRcdFx0dW5hdmFpbGFibGVBY3Rpb25zOiBbXVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gRmFsbGJhY2s6IHRyeSB0byBmaW5kIGEgU1BWIHdpdGggdGhlIHNhbWUgcXVhbGlmaWVyXG5cdFx0Y29uc3QgYVNQVkFubm90YXRpb25zID0ga3BpQ29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcblx0XHRcdFwiVUlcIixcblx0XHRcdFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcblx0XHQpIGFzIFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRbXTtcblx0XHRjb25zdCB0YXJnZXRTUFYgPSBhU1BWQW5ub3RhdGlvbnMuZmluZCgoc3B2KSA9PiB7XG5cdFx0XHRyZXR1cm4gc3B2LnF1YWxpZmllciA9PT0ga3BpQ29uZmlnLnF1YWxpZmllcjtcblx0XHR9KTtcblx0XHRpZiAodGFyZ2V0U1BWKSB7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiA9IHRhcmdldFNQVi5TZWxlY3Rpb25WYXJpYW50O1xuXHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24gPSB0YXJnZXRTUFYuUHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRcdGRhdGFwb2ludEFubm90YXRpb24gPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj8uVmlzdWFsaXphdGlvbnM/LmZpbmQoKHZpeikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gaXNBbm5vdGF0aW9uT2ZUeXBlPERhdGFQb2ludD4odml6LiR0YXJnZXQsIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUpO1xuXHRcdFx0fSk/LiR0YXJnZXQgYXMgRGF0YVBvaW50O1xuXHRcdFx0Y2hhcnRBbm5vdGF0aW9uID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/LlZpc3VhbGl6YXRpb25zPy5maW5kKCh2aXopID0+IHtcblx0XHRcdFx0cmV0dXJuIGlzQW5ub3RhdGlvbk9mVHlwZTxDaGFydD4odml6LiR0YXJnZXQsIFVJQW5ub3RhdGlvblR5cGVzLkNoYXJ0RGVmaW5pdGlvblR5cGUpO1xuXHRcdFx0fSk/LiR0YXJnZXQgYXMgQ2hhcnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIENvdWxkbid0IGZpbmQgYSBLUEkgb3IgYSBTUFYgYW5ub3RhdGlvbiB3aXRoIHRoZSBxdWFsaWZpZXIgZnJvbSB0aGUgbWFuaWZlc3Rcblx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0LmdldERpYWdub3N0aWNzKClcblx0XHRcdFx0LmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5LUElfSVNTVUVTLktQSV9OT1RfRk9VTkQgKyBrcGlDb25maWcucXVhbGlmaWVyKTtcblxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRpZiAoIXByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIHx8ICFkYXRhcG9pbnRBbm5vdGF0aW9uIHx8ICFjaGFydEFubm90YXRpb24pIHtcblx0XHQvLyBDb3VsZG4ndCBmaW5kIGEgY2hhcnQgb3IgZGF0YXBvaW50IGRlZmluaXRpb25cblx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHQuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0LmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5LUElfSVNTVUVTLktQSV9ERVRBSUxfTk9UX0ZPVU5EICsga3BpQ29uZmlnLnF1YWxpZmllcik7XG5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0Y29uc3QgZGF0YXBvaW50UHJvcGVydHkgPSBkYXRhcG9pbnRBbm5vdGF0aW9uLlZhbHVlLiR0YXJnZXQgYXMgUHJvcGVydHk7XG5cdGlmICghYWdncmVnYXRpb25IZWxwZXIuaXNQcm9wZXJ0eUFnZ3JlZ2F0YWJsZShkYXRhcG9pbnRQcm9wZXJ0eSkpIHtcblx0XHQvLyBUaGUgbWFpbiBwcm9wZXJ0eSBvZiB0aGUgS1BJIGlzIG5vdCBhZ2dyZWdhdGFibGUgLS0+IFdlIGNhbid0IGNhbGN1bGF0ZSBpdHMgdmFsdWUgc28gd2UgaWdub3JlIHRoZSBLUElcblx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHQuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0LmFkZElzc3VlKFxuXHRcdFx0XHRJc3N1ZUNhdGVnb3J5LkFubm90YXRpb24sXG5cdFx0XHRcdElzc3VlU2V2ZXJpdHkuTWVkaXVtLFxuXHRcdFx0XHRJc3N1ZVR5cGUuS1BJX0lTU1VFUy5NQUlOX1BST1BFUlRZX05PVF9BR0dSRUdBVEFCTEUgKyBrcGlDb25maWcucXVhbGlmaWVyXG5cdFx0XHQpO1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBDaGFydCBkZWZpbml0aW9uXG5cdGNvbnN0IGNoYXJ0RGVmID0gY29udmVydEtQSUNoYXJ0KGNoYXJ0QW5ub3RhdGlvbiwgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24pO1xuXHRpZiAoIWNoYXJ0RGVmKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IGtwaURlZjogS1BJRGVmaW5pdGlvbiA9IHtcblx0XHRpZDogZ2V0S1BJSUQoa3BpTmFtZSksXG5cdFx0ZW50aXR5U2V0OiBrcGlDb25maWcuZW50aXR5U2V0LFxuXHRcdGRhdGFwb2ludDoge1xuXHRcdFx0cHJvcGVydHlQYXRoOiBkYXRhcG9pbnRBbm5vdGF0aW9uLlZhbHVlLnBhdGgsXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDoga3BpQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFwb2ludEFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdHRpdGxlOiBkYXRhcG9pbnRBbm5vdGF0aW9uLlRpdGxlPy50b1N0cmluZygpLFxuXHRcdFx0ZGVzY3JpcHRpb246IGRhdGFwb2ludEFubm90YXRpb24uRGVzY3JpcHRpb24/LnRvU3RyaW5nKClcblx0XHR9LFxuXHRcdHNlbGVjdGlvblZhcmlhbnRGaWx0ZXJEZWZpbml0aW9uczogc2VsZWN0aW9uVmFyaWFudEFubm90YXRpb25cblx0XHRcdD8gZ2V0RmlsdGVyRGVmaW5pdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbilcblx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdGNoYXJ0OiBjaGFydERlZlxuXHR9O1xuXG5cdC8vIE5hdmlnYXRpb25cblx0aWYgKCFuYXZpZ2F0aW9uSW5mbykge1xuXHRcdC8vIE5vIG5hdmlnYXRpb25JbmZvIHdhcyBmb3VuZCBpbiB0aGUgS1BJIGFubm90YXRpb24gLS0+IHRyeSB0aGUgb3V0Ym91bmQgbmF2aWdhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdFxuXHRcdGlmIChrcGlDb25maWcuZGV0YWlsTmF2aWdhdGlvbikge1xuXHRcdFx0bmF2aWdhdGlvbkluZm8gPSB7XG5cdFx0XHRcdG91dGJvdW5kTmF2aWdhdGlvbjoga3BpQ29uZmlnLmRldGFpbE5hdmlnYXRpb25cblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE5vIG91dGJvdW5kIG5hdmlnYXRpb24gaW4gdGhlIG1hbmlmZXN0IC0tPiB0cnkgdGhlIHNlbWFudGljIG9iamVjdCBvbiB0aGUgRGF0YXBvaW50IHZhbHVlXG5cdFx0XHRuYXZpZ2F0aW9uSW5mbyA9IGdldE5hdmlnYXRpb25JbmZvRnJvbVByb3BlcnR5KGRhdGFwb2ludFByb3BlcnR5KTtcblx0XHR9XG5cdH1cblx0aWYgKG5hdmlnYXRpb25JbmZvKSB7XG5cdFx0a3BpRGVmLm5hdmlnYXRpb24gPSBuYXZpZ2F0aW9uSW5mbztcblx0fVxuXG5cdHVwZGF0ZUN1cnJlbmN5KGRhdGFwb2ludEFubm90YXRpb24sIGtwaURlZik7XG5cdHVwZGF0ZUNyaXRpY2FsaXR5KGRhdGFwb2ludEFubm90YXRpb24sIGFnZ3JlZ2F0aW9uSGVscGVyLCBrcGlEZWYpO1xuXHR1cGRhdGVUcmVuZChkYXRhcG9pbnRBbm5vdGF0aW9uLCBhZ2dyZWdhdGlvbkhlbHBlciwga3BpRGVmKTtcblx0dXBkYXRlVGFyZ2V0KGRhdGFwb2ludEFubm90YXRpb24sIGFnZ3JlZ2F0aW9uSGVscGVyLCBrcGlEZWYpO1xuXG5cdHJldHVybiBrcGlEZWY7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgS1BJIGRlZmluaXRpb25zIGZyb20gdGhlIG1hbmlmZXN0IGFuZCB0aGUgYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0IGZvciB0aGUgcGFnZVxuICogQHJldHVybnMgUmV0dXJucyBhbiBhcnJheSBvZiBLUEkgZGVmaW5pdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEtQSURlZmluaXRpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBLUElEZWZpbml0aW9uW10ge1xuXHRjb25zdCBrcGlDb25maWdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRLUElDb25maWd1cmF0aW9uKCksXG5cdFx0a3BpRGVmczogS1BJRGVmaW5pdGlvbltdID0gW107XG5cblx0T2JqZWN0LmtleXMoa3BpQ29uZmlncykuZm9yRWFjaCgoa3BpTmFtZSkgPT4ge1xuXHRcdGNvbnN0IG9EZWYgPSBjcmVhdGVLUElEZWZpbml0aW9uKGtwaU5hbWUsIGtwaUNvbmZpZ3Nba3BpTmFtZV0sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdGlmIChvRGVmKSB7XG5cdFx0XHRrcGlEZWZzLnB1c2gob0RlZik7XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4ga3BpRGVmcztcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBeUVBLE1BQU1BLCtCQUF1RCxHQUFHO0lBQy9ELHVCQUF1QixFQUFFLElBQUk7SUFDN0IsaUJBQWlCLEVBQUUsSUFBSTtJQUN2Qix5QkFBeUIsRUFBRSxNQUFNO0lBQ2pDLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsdUJBQXVCLEVBQUU7RUFDMUIsQ0FBQztFQUVELE1BQU1DLGtCQUEwQyxHQUFHO0lBQ2xELDRCQUE0QixFQUFFLGVBQWU7SUFDN0MseUJBQXlCLEVBQUUsWUFBWTtJQUN2QyxvQkFBb0IsRUFBRSxPQUFPO0lBQzdCLG1CQUFtQixFQUFFLE1BQU07SUFDM0IscUJBQXFCLEVBQUUsUUFBUTtJQUMvQixxQkFBcUIsRUFBRSxRQUFRO0lBQy9CLGtCQUFrQixFQUFFLEtBQUs7SUFDekIsNkJBQTZCLEVBQUUsaUJBQWlCO0lBQ2hELDBCQUEwQixFQUFFLGFBQWE7SUFDekMsc0JBQXNCLEVBQUU7RUFDekIsQ0FBQztFQUVELFNBQVNDLGVBQWUsQ0FBQ0MsZUFBc0IsRUFBRUMsNkJBQXNELEVBQWtDO0lBQUE7SUFDeEksSUFBSUQsZUFBZSxDQUFDRSxRQUFRLEtBQUtDLFNBQVMsRUFBRTtNQUMzQztNQUNBLE9BQU9BLFNBQVM7SUFDakI7SUFFQSxNQUFNQyxjQUFjLEdBQUdKLGVBQWUsQ0FBQ0ssVUFBVSxHQUM5Q0wsZUFBZSxDQUFDSyxVQUFVLENBQUNDLEdBQUcsQ0FBRUMsWUFBWSxJQUFLO01BQUE7TUFDakQsTUFBTUMsWUFBWSw0QkFBR1Is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