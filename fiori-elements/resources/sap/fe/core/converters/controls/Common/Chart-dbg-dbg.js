/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/ID", "../../ManifestSettings"], function (Log, DataField, Action, ConfigurableObject, Key, BindingToolkit, DataModelPathHelper, Core, Aggregation, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var ActionType = ManifestSettings.ActionType;
  var getFilterBarID = ID.getFilterBarID;
  var getChartID = ID.getChartID;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var not = BindingToolkit.not;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  /**
   * Method to retrieve all chart actions from annotations.
   *
   * @param chartAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The chart actions from the annotation
   */
  function getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext) {
    const chartActions = [];
    if (chartAnnotation) {
      const aActions = chartAnnotation.Actions || [];
      aActions.forEach(dataField => {
        var _dataField$ActionTarg;
        let chartAction;
        if (isDataFieldForActionAbstract(dataField) && !dataField.Inline && !dataField.Determining) {
          const key = KeyHelper.generateKeyFromDataField(dataField);
          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              if (!((_dataField$ActionTarg = dataField.ActionTarget) !== null && _dataField$ActionTarg !== void 0 && _dataField$ActionTarg.isBound)) {
                chartAction = {
                  type: ActionType.DataFieldForAction,
                  annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                  key: key,
                  visible: getCompileExpressionForAction(dataField, converterContext)
                };
              }
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
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
  function getChartActions(chartAnnotation, visualizationPath, converterContext) {
    const aAnnotationActions = getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext);
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions);
    const actionOverwriteConfig = {
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
  _exports.getChartActions = getChartActions;
  function getP13nMode(visualizationPath, converterContext) {
    var _chartManifestSetting;
    const manifestWrapper = converterContext.getManifestWrapper();
    const chartManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const variantManagement = manifestWrapper.getVariantManagement();
    const aPersonalization = [];
    // Personalization configured in manifest.
    const personalization = chartManifestSettings === null || chartManifestSettings === void 0 ? void 0 : (_chartManifestSetting = chartManifestSettings.chartSettings) === null || _chartManifestSetting === void 0 ? void 0 : _chartManifestSetting.personalization;
    const isControlVariant = variantManagement === VariantManagementType.Control ? true : false;
    // if personalization is set to false do not show any option
    if (personalization !== undefined && !personalization || personalization == "false") {
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
  _exports.getP13nMode = getP13nMode;
  // check if annoatation path has SPV and store the path
  function checkForSPV(viewConfiguration) {
    var _viewConfiguration$an;
    return (viewConfiguration === null || viewConfiguration === void 0 ? void 0 : (_viewConfiguration$an = viewConfiguration.annotationPath) === null || _viewConfiguration$an === void 0 ? void 0 : _viewConfiguration$an.indexOf(`@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`)) !== -1 ? viewConfiguration === null || viewConfiguration === void 0 ? void 0 : viewConfiguration.annotationPath : undefined;
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
  function createChartVisualization(chartAnnotation, visualizationPath, converterContext, doNotCheckApplySupported, viewConfiguration) {
    var _chartAnnotation$Titl;
    const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
    if (!doNotCheckApplySupported && !aggregationHelper.isAnalyticsSupported()) {
      throw new Error("ApplySupported is not added to the annotations");
    }
    const aTransAggregations = aggregationHelper.getTransAggregations();
    const aCustomAggregates = aggregationHelper.getCustomAggregateDefinitions();
    const pageManifestSettings = converterContext.getManifestWrapper();
    const variantManagement = pageManifestSettings.getVariantManagement();
    const p13nMode = getP13nMode(visualizationPath, converterContext);
    if (p13nMode === undefined && variantManagement === "Control") {
      Log.warning("Variant Management cannot be enabled when personalization is disabled");
    }
    const mCustomAggregates = {};
    // check if annoatation path has SPV and store the path
    const mSelectionPresentationVariantPath = checkForSPV(viewConfiguration);
    if (aCustomAggregates) {
      const entityType = aggregationHelper.getEntityType();
      for (const customAggregate of aCustomAggregates) {
        var _customAggregate$anno, _customAggregate$anno2, _relatedCustomAggrega, _relatedCustomAggrega2, _relatedCustomAggrega3;
        const aContextDefiningProperties = customAggregate === null || customAggregate === void 0 ? void 0 : (_customAggregate$anno = customAggregate.annotations) === null || _customAggregate$anno === void 0 ? void 0 : (_customAggregate$anno2 = _customAggregate$anno.Aggregation) === null || _customAggregate$anno2 === void 0 ? void 0 : _customAggregate$anno2.ContextDefiningProperties;
        const qualifier = customAggregate === null || customAggregate === void 0 ? void 0 : customAggregate.qualifier;
        const relatedCustomAggregateProperty = qualifier && entityType.entityProperties.find(property => property.name === qualifier);
        const label = relatedCustomAggregateProperty && (relatedCustomAggregateProperty === null || relatedCustomAggregateProperty === void 0 ? void 0 : (_relatedCustomAggrega = relatedCustomAggregateProperty.annotations) === null || _relatedCustomAggrega === void 0 ? void 0 : (_relatedCustomAggrega2 = _relatedCustomAggrega.Common) === null || _relatedCustomAggrega2 === void 0 ? void 0 : (_relatedCustomAggrega3 = _relatedCustomAggrega2.Label) === null || _relatedCustomAggrega3 === void 0 ? void 0 : _relatedCustomAggrega3.toString());
        mCustomAggregates[qualifier] = {
          name: qualifier,
          label: label || `Custom Aggregate (${qualifier})`,
          sortable: true,
          sortOrder: "both",
          contextDefiningProperty: aContextDefiningProperties ? aContextDefiningProperties.map(oCtxDefProperty => {
            return oCtxDefProperty.value;
          }) : []
        };
      }
    }
    const mTransAggregations = {};
    const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
    if (aTransAggregations) {
      for (let i = 0; i < aTransAggregations.length; i++) {
        var _aTransAggregations$i, _aTransAggregations$i2, _aTransAggregations$i3, _aTransAggregations$i4, _aTransAggregations$i5, _aTransAggregations$i6;
        mTransAggregations[aTransAggregations[i].Name] = {
          name: aTransAggregations[i].Name,
          propertyPath: aTransAggregations[i].AggregatableProperty.valueOf().value,
          aggregationMethod: aTransAggregations[i].AggregationMethod,
          label: (_aTransAggregations$i = aTransAggregations[i]) !== null && _aTransAggregations$i !== void 0 && (_aTransAggregations$i2 = _aTransAggregations$i.annotations) !== null && _aTransAggregations$i2 !== void 0 && (_aTransAggregations$i3 = _aTransAggregations$i2.Common) !== null && _aTransAggregations$i3 !== void 0 && _aTransAggregations$i3.Label ? (_aTransAggregations$i4 = aTransAggregations[i]) === null || _aTransAggregations$i4 === void 0 ? void 0 : (_aTransAggregations$i5 = _aTransAggregations$i4.annotations) === null || _aTransAggregations$i5 === void 0 ? void 0 : (_aTransAggregations$i6 = _aTransAggregations$i5.Common) === null || _aTransAggregations$i6 === void 0 ? void 0 : _aTransAggregations$i6.Label.toString() : `${oResourceBundleCore.getText("AGGREGATABLE_PROPERTY")} (${aTransAggregations[i].Name})`,
          sortable: true,
          sortOrder: "both",
          custom: false
        };
      }
    }
    const aAggProps = aggregationHelper.getAggregatableProperties();
    const aGrpProps = aggregationHelper.getGroupableProperties();
    const mApplySupported = {};
    mApplySupported.$Type = "Org.OData.Aggregation.V1.ApplySupportedType";
    mApplySupported.AggregatableProperties = [];
    mApplySupported.GroupableProperties = [];
    for (let i = 0; aAggProps && i < aAggProps.length; i++) {
      var _aAggProps$i, _aAggProps$i2, _aAggProps$i2$Propert;
      const obj = {
        $Type: (_aAggProps$i = aAggProps[i]) === null || _aAggProps$i === void 0 ? void 0 : _aAggProps$i.$Type,
        Property: {
          $PropertyPath: (_aAggProps$i2 = aAggProps[i]) === null || _aAggProps$i2 === void 0 ? void 0 : (_aAggProps$i2$Propert = _aAggProps$i2.Property) === null || _aAggProps$i2$Propert === void 0 ? void 0 : _aAggProps$i2$Propert.value
        }
      };
      mApplySupported.AggregatableProperties.push(obj);
    }
    for (let i = 0; aGrpProps && i < aGrpProps.length; i++) {
      var _aGrpProps$i;
      const obj = {
        $PropertyPath: (_aGrpProps$i = aGrpProps[i]) === null || _aGrpProps$i === void 0 ? void 0 : _aGrpProps$i.value
      };
      mApplySupported.GroupableProperties.push(obj);
    }
    const chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
    let [navigationPropertyPath /*, annotationPath*/] = visualizationPath.split("@");
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    const title = ((_chartAnnotation$Titl = chartAnnotation.Title) === null || _chartAnnotation$Titl === void 0 ? void 0 : _chartAnnotation$Titl.toString()) || ""; // read title from chart annotation
    const dataModelPath = converterContext.getDataModelObjectPath();
    const isEntitySet = navigationPropertyPath.length === 0;
    const entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
    const sFilterbarId = isEntitySet ? getFilterBarID(converterContext.getContextPath()) : undefined;
    const oVizProperties = {
      legendGroup: {
        layout: {
          position: "bottom"
        }
      }
    };
    let autoBindOnInit;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      autoBindOnInit = true;
    } else if (converterContext.getTemplateType() === TemplateType.ListReport || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      autoBindOnInit = false;
    }
    const hasMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
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
      id: qualifier ? getChartID(isEntitySet ? entityName : navigationPropertyPath, qualifier, VisualizationType.Chart) : getChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
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
  _exports.createChartVisualization = createChartVisualization;
  function findVariantManagement(p13nMode, variantManagement) {
    return variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement;
  }

  /**
   * Method to get compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation.
   *
   * @param dataField
   * @param converterContext
   * @returns Compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation
   */
  function getCompileExpressionForAction(dataField, converterContext) {
    var _dataField$annotation, _dataField$annotation2;
    return compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)));
  }
  function createBlankChartVisualization(converterContext) {
    const hasMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
    const dataModelPath = converterContext.getDataModelObjectPath();
    const entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
    const visualization = {
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
  _exports.createBlankChartVisualization = createBlankChartVisualization;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMiLCJjaGFydEFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJjaGFydEFjdGlvbnMiLCJhQWN0aW9ucyIsIkFjdGlvbnMiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiY2hhcnRBY3Rpb24iLCJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiSW5saW5lIiwiRGV0ZXJtaW5pbmciLCJrZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCIkVHlwZSIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJ0eXBlIiwiQWN0aW9uVHlwZSIsIkRhdGFGaWVsZEZvckFjdGlvbiIsImFubm90YXRpb25QYXRoIiwiZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInZpc2libGUiLCJnZXRDb21waWxlRXhwcmVzc2lvbkZvckFjdGlvbiIsIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiIsImlzTmF2aWdhYmxlIiwicHVzaCIsImdldENoYXJ0QWN0aW9ucyIsImFBbm5vdGF0aW9uQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImVuYWJsZWQiLCJPdmVycmlkZVR5cGUiLCJvdmVyd3JpdGUiLCJlbmFibGVPblNlbGVjdCIsImNvbW1hbmQiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImNvbW1hbmRBY3Rpb25zIiwiZ2V0UDEzbk1vZGUiLCJtYW5pZmVzdFdyYXBwZXIiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJjaGFydE1hbmlmZXN0U2V0dGluZ3MiLCJ2YXJpYW50TWFuYWdlbWVudCIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwiYVBlcnNvbmFsaXphdGlvbiIsInBlcnNvbmFsaXphdGlvbiIsImNoYXJ0U2V0dGluZ3MiLCJpc0NvbnRyb2xWYXJpYW50IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiQ29udHJvbCIsInVuZGVmaW5lZCIsIml0ZW0iLCJzb3J0IiwiZmlsdGVyIiwiam9pbiIsImNoZWNrRm9yU1BWIiwidmlld0NvbmZpZ3VyYXRpb24iLCJpbmRleE9mIiwiY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uIiwiZG9Ob3RDaGVja0FwcGx5U3VwcG9ydGVkIiwiYWdncmVnYXRpb25IZWxwZXIiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImdldEVudGl0eVR5cGUiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsIkVycm9yIiwiYVRyYW5zQWdncmVnYXRpb25zIiwiZ2V0VHJhbnNBZ2dyZWdhdGlvbnMiLCJhQ3VzdG9tQWdncmVnYXRlcyIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwicGFnZU1hbmlmZXN0U2V0dGluZ3MiLCJwMTNuTW9kZSIsIkxvZyIsIndhcm5pbmciLCJtQ3VzdG9tQWdncmVnYXRlcyIsIm1TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aCIsImVudGl0eVR5cGUiLCJjdXN0b21BZ2dyZWdhdGUiLCJhQ29udGV4dERlZmluaW5nUHJvcGVydGllcyIsImFubm90YXRpb25zIiwiQWdncmVnYXRpb24iLCJDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwicXVhbGlmaWVyIiwicmVsYXRlZEN1c3RvbUFnZ3JlZ2F0ZVByb3BlcnR5IiwiZW50aXR5UHJvcGVydGllcyIsImZpbmQiLCJwcm9wZXJ0eSIsIm5hbWUiLCJsYWJlbCIsIkNvbW1vbiIsIkxhYmVsIiwidG9TdHJpbmciLCJzb3J0YWJsZSIsInNvcnRPcmRlciIsImNvbnRleHREZWZpbmluZ1Byb3BlcnR5IiwibWFwIiwib0N0eERlZlByb3BlcnR5IiwidmFsdWUiLCJtVHJhbnNBZ2dyZWdhdGlvbnMiLCJvUmVzb3VyY2VCdW5kbGVDb3JlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImkiLCJsZW5ndGgiLCJOYW1lIiwicHJvcGVydHlQYXRoIiwiQWdncmVnYXRhYmxlUHJvcGVydHkiLCJ2YWx1ZU9mIiwiYWdncmVnYXRpb25NZXRob2QiLCJBZ2dyZWdhdGlvbk1ldGhvZCIsImdldFRleHQiLCJjdXN0b20iLCJhQWdnUHJvcHMiLCJnZXRBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiYUdycFByb3BzIiwiZ2V0R3JvdXBhYmxlUHJvcGVydGllcyIsIm1BcHBseVN1cHBvcnRlZCIsIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJHcm91cGFibGVQcm9wZXJ0aWVzIiwib2JqIiwiUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsInNwbGl0IiwibGFzdEluZGV4T2YiLCJzdWJzdHIiLCJ0aXRsZSIsIlRpdGxlIiwiZGF0YU1vZGVsUGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJpc0VudGl0eVNldCIsImVudGl0eU5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJzdGFydGluZ0VudGl0eVNldCIsInNGaWx0ZXJiYXJJZCIsImdldEZpbHRlckJhcklEIiwiZ2V0Q29udGV4dFBhdGgiLCJvVml6UHJvcGVydGllcyIsImxlZ2VuZEdyb3VwIiwibGF5b3V0IiwicG9zaXRpb24iLCJhdXRvQmluZE9uSW5pdCIsImdldFRlbXBsYXRlVHlwZSIsIlRlbXBsYXRlVHlwZSIsIk9iamVjdFBhZ2UiLCJMaXN0UmVwb3J0IiwiQW5hbHl0aWNhbExpc3RQYWdlIiwiaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsIm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCIsImFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMiLCJnZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zIiwiZW5hYmxlU2VhcmNoIiwiVmlzdWFsaXphdGlvblR5cGUiLCJDaGFydCIsImlkIiwiZ2V0Q2hhcnRJRCIsImNvbGxlY3Rpb24iLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwibmF2aWdhdGlvblBhdGgiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwiZmlsdGVySWQiLCJ2aXpQcm9wZXJ0aWVzIiwiSlNPTiIsInN0cmluZ2lmeSIsImN1c3RvbUFnZyIsInRyYW5zQWdnIiwiYXBwbHlTdXBwb3J0ZWQiLCJzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aCIsImZpbmRWYXJpYW50TWFuYWdlbWVudCIsIk5vbmUiLCJjb21waWxlRXhwcmVzc2lvbiIsIm5vdCIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiVUkiLCJIaWRkZW4iLCJnZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uIiwiY3JlYXRlQmxhbmtDaGFydFZpc3VhbGl6YXRpb24iLCJ2aXN1YWxpemF0aW9uIiwibXVsdGlWaWV3cyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eVBhdGggfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgQWdncmVnYXRhYmxlUHJvcGVydHlUeXBlLCBBZ2dyZWdhdGlvbk1ldGhvZCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgQ2hhcnQsIERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUge1xuXHRBbm5vdGF0aW9uQWN0aW9uLFxuXHRCYXNlQWN0aW9uLFxuXHRDb21iaW5lZEFjdGlvbixcblx0Q3VzdG9tQWN0aW9uLFxuXHRPdmVycmlkZVR5cGVBY3Rpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHsgZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBPdmVycmlkZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgS2V5SGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9LZXlcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBlcXVhbCwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLCBub3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZ2V0VGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSB7IEV4cGFuZFBhdGhUeXBlLCBNZXRhTW9kZWxUeXBlIH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgZ2V0Q2hhcnRJRCwgZ2V0RmlsdGVyQmFySUQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydE1hbmlmZXN0Q29uZmlndXJhdGlvbiwgVmlld1BhdGhDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IEFjdGlvblR5cGUsIFRlbXBsYXRlVHlwZSwgVmFyaWFudE1hbmFnZW1lbnRUeXBlLCBWaXN1YWxpemF0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSBNYW5pZmVzdFdyYXBwZXIgZnJvbSBcIi4uLy4uL01hbmlmZXN0V3JhcHBlclwiO1xuXG50eXBlIENoYXJ0QXBwbHlTdXBwb3J0ZWQgPSB7XG5cdCRUeXBlOiBzdHJpbmc7XG5cdGVuYWJsZVNlYXJjaDogYm9vbGVhbjtcblx0QWdncmVnYXRhYmxlUHJvcGVydGllczogdW5rbm93bltdO1xuXHRHcm91cGFibGVQcm9wZXJ0aWVzOiB1bmtub3duW107XG59O1xuLyoqXG4gKiBAdHlwZWRlZiBDaGFydFZpc3VhbGl6YXRpb25cbiAqL1xuZXhwb3J0IHR5cGUgQ2hhcnRWaXN1YWxpemF0aW9uID0ge1xuXHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5DaGFydDtcblx0aWQ6IHN0cmluZztcblx0Y29sbGVjdGlvbjogc3RyaW5nO1xuXHRlbnRpdHlOYW1lOiBzdHJpbmc7XG5cdHBlcnNvbmFsaXphdGlvbj86IHN0cmluZztcblx0bmF2aWdhdGlvblBhdGg6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0ZmlsdGVySWQ/OiBzdHJpbmc7XG5cdHZpelByb3BlcnRpZXM6IHN0cmluZztcblx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xuXHRjb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPjtcblx0dGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0YXV0b0JpbmRPbkluaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZDogc3RyaW5nO1xuXHR2aXNpYmxlOiBzdHJpbmc7XG5cdGN1c3RvbUFnZzogb2JqZWN0O1xuXHR0cmFuc0FnZzogb2JqZWN0O1xuXHRhcHBseVN1cHBvcnRlZDogQ2hhcnRBcHBseVN1cHBvcnRlZDtcblx0bXVsdGlWaWV3cz86IGJvb2xlYW47XG5cdHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGU7XG5cdHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIGNoYXJ0IGFjdGlvbnMgZnJvbSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY2hhcnRBbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY2hhcnQgYWN0aW9ucyBmcm9tIHRoZSBhbm5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyhcblx0Y2hhcnRBbm5vdGF0aW9uOiBDaGFydCxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQmFzZUFjdGlvbltdIHtcblx0Y29uc3QgY2hhcnRBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBbXTtcblx0aWYgKGNoYXJ0QW5ub3RhdGlvbikge1xuXHRcdGNvbnN0IGFBY3Rpb25zID0gY2hhcnRBbm5vdGF0aW9uLkFjdGlvbnMgfHwgW107XG5cdFx0YUFjdGlvbnMuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRsZXQgY2hhcnRBY3Rpb246IEFubm90YXRpb25BY3Rpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdChkYXRhRmllbGQpICYmICFkYXRhRmllbGQuSW5saW5lICYmICFkYXRhRmllbGQuRGV0ZXJtaW5pbmcpIHtcblx0XHRcdFx0Y29uc3Qga2V5ID0gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0XHRcdFx0aWYgKCFkYXRhRmllbGQuQWN0aW9uVGFyZ2V0Py5pc0JvdW5kKSB7XG5cdFx0XHRcdFx0XHRcdGNoYXJ0QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0XHRcdFx0dmlzaWJsZTogZ2V0Q29tcGlsZUV4cHJlc3Npb25Gb3JBY3Rpb24oZGF0YUZpZWxkLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0XHRcdGNoYXJ0QWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IGdldENvbXBpbGVFeHByZXNzaW9uRm9yQWN0aW9uKGRhdGFGaWVsZCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChjaGFydEFjdGlvbikge1xuXHRcdFx0XHRjaGFydEFjdGlvbnMucHVzaChjaGFydEFjdGlvbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNoYXJ0QWN0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENoYXJ0QWN0aW9ucyhjaGFydEFubm90YXRpb246IENoYXJ0LCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBhQW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyhjaGFydEFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmFjdGlvbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkFjdGlvbnNcblx0KTtcblx0Y29uc3QgYWN0aW9uT3ZlcndyaXRlQ29uZmlnOiBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdFx0ZW5hYmxlZDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRlbmFibGVPblNlbGVjdDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHR2aXNpYmxlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fTtcblx0Y29uc3QgY2hhcnRBY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYUFubm90YXRpb25BY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgYWN0aW9uT3ZlcndyaXRlQ29uZmlnKTtcblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zOiBjaGFydEFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IG1hbmlmZXN0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlcjogTWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgY2hhcnRNYW5pZmVzdFNldHRpbmdzOiBDaGFydE1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgYVBlcnNvbmFsaXphdGlvbjogc3RyaW5nW10gPSBbXTtcblx0Ly8gUGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QuXG5cdGNvbnN0IHBlcnNvbmFsaXphdGlvbjogYW55ID0gY2hhcnRNYW5pZmVzdFNldHRpbmdzPy5jaGFydFNldHRpbmdzPy5wZXJzb25hbGl6YXRpb247XG5cdGNvbnN0IGlzQ29udHJvbFZhcmlhbnQgPSB2YXJpYW50TWFuYWdlbWVudCA9PT0gVmFyaWFudE1hbmFnZW1lbnRUeXBlLkNvbnRyb2wgPyB0cnVlIDogZmFsc2U7XG5cdC8vIGlmIHBlcnNvbmFsaXphdGlvbiBpcyBzZXQgdG8gZmFsc2UgZG8gbm90IHNob3cgYW55IG9wdGlvblxuXHRpZiAoKHBlcnNvbmFsaXphdGlvbiAhPT0gdW5kZWZpbmVkICYmICFwZXJzb25hbGl6YXRpb24pIHx8IHBlcnNvbmFsaXphdGlvbiA9PSBcImZhbHNlXCIpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHN3aXRjaCAodHJ1ZSkge1xuXHRcdGNhc2UgdHlwZW9mIHBlcnNvbmFsaXphdGlvbiA9PT0gXCJvYmplY3RcIjpcblx0XHRcdC8vIFNwZWNpZmljIHBlcnNvbmFsaXphdGlvbiBvcHRpb25zIGVuYWJsZWQgaW4gbWFuaWZlc3QuIFVzZSB0aGVtIGFzIGlzLlxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi50eXBlKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlR5cGVcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLml0ZW0pIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiSXRlbVwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uc29ydCkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJTb3J0XCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5maWx0ZXIpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiRmlsdGVyXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGFQZXJzb25hbGl6YXRpb24uam9pbihcIixcIik7XG5cdFx0Y2FzZSBpc0NvbnRyb2xWYXJpYW50OlxuXHRcdGNhc2UgISFwZXJzb25hbGl6YXRpb246XG5cdFx0XHQvLyBtYW5pZmVzdCBoYXMgcGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQsIGNoZWNrIGlmIGl0J3MgdHJ1ZVxuXHRcdFx0Ly8gaWYgbWFuaWZlc3QgZG9lc24ndCBoYXZlIHBlcnNvbmFsaXphdGlvbiwgY2hlY2sgZm9yIHZhcmlhbnQgbWFuYWdlbWVudCBpcyBzZXQgdG8gY29udHJvbFxuXHRcdFx0cmV0dXJuIFwiU29ydCxUeXBlLEl0ZW0sRmlsdGVyXCI7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8vIGlmIG1hbmlmZXN0IGRvZXNuJ3QgaGF2ZSBwZXJzb25hbGl6YXRpb24sIHNob3cgZGVmYXVsdCBvcHRpb25zIHdpdGhvdXQgZmlsdGVyXG5cdFx0XHRyZXR1cm4gXCJTb3J0LFR5cGUsSXRlbVwiO1xuXHR9XG59XG5leHBvcnQgdHlwZSBDaGFydEN1c3RvbUFnZ3JlZ2F0ZSA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHRsYWJlbDogc3RyaW5nO1xuXHRzb3J0YWJsZTogYm9vbGVhbjtcblx0c29ydE9yZGVyOiBcImJvdGhcIjtcblx0Y29udGV4dERlZmluaW5nUHJvcGVydHk6IHN0cmluZ1tdO1xufTtcblxuZXhwb3J0IHR5cGUgVHJhbnNBZ2cgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0cHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdGFnZ3JlZ2F0aW9uTWV0aG9kOiBBZ2dyZWdhdGlvbk1ldGhvZDtcblx0bGFiZWw6IHN0cmluZztcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdHNvcnRPcmRlcjogXCJib3RoXCI7XG5cdGN1c3RvbTogYm9vbGVhbjtcbn07XG4vLyBjaGVjayBpZiBhbm5vYXRhdGlvbiBwYXRoIGhhcyBTUFYgYW5kIHN0b3JlIHRoZSBwYXRoXG5mdW5jdGlvbiBjaGVja0ZvclNQVih2aWV3Q29uZmlndXJhdGlvbjogVmlld1BhdGhDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkKSB7XG5cdHJldHVybiB2aWV3Q29uZmlndXJhdGlvbj8uYW5ub3RhdGlvblBhdGg/LmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnR9YCkgIT09IC0xXG5cdFx0PyB2aWV3Q29uZmlndXJhdGlvbj8uYW5ub3RhdGlvblBhdGhcblx0XHQ6IHVuZGVmaW5lZDtcbn1cbi8qKlxuICogQ3JlYXRlIHRoZSBDaGFydFZpc3VhbGl6YXRpb24gY29uZmlndXJhdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBkaXNwbGF5IGEgY2hhcnQgdXNpbmcgdGhlIENoYXJ0IGJ1aWxkaW5nIGJsb2NrLlxuICpcbiAqIEBwYXJhbSBjaGFydEFubm90YXRpb24gVGhlIHRhcmdldGVkIGNoYXJ0IGFubm90YXRpb25cbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aCBUaGUgcGF0aCBvZiB0aGUgdmlzdWFsaXphdGlvbiBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBkb05vdENoZWNrQXBwbHlTdXBwb3J0ZWQgRmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIEFwcGx5U3VwcG9ydGVkIG5lZWRzIHRvIGJlIGNoZWNrZWQgb3Igbm90XG4gKiBAcGFyYW0gdmlld0NvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm5zIFRoZSBjaGFydCB2aXN1YWxpemF0aW9uIGJhc2VkIG9uIHRoZSBhbm5vdGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGFydFZpc3VhbGl6YXRpb24oXG5cdGNoYXJ0QW5ub3RhdGlvbjogQ2hhcnQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZD86IGJvb2xlYW4sXG5cdHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uXG4pOiBDaGFydFZpc3VhbGl6YXRpb24ge1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29udmVydGVyQ29udGV4dCk7XG5cdGlmICghZG9Ob3RDaGVja0FwcGx5U3VwcG9ydGVkICYmICFhZ2dyZWdhdGlvbkhlbHBlci5pc0FuYWx5dGljc1N1cHBvcnRlZCgpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQXBwbHlTdXBwb3J0ZWQgaXMgbm90IGFkZGVkIHRvIHRoZSBhbm5vdGF0aW9uc1wiKTtcblx0fVxuXHRjb25zdCBhVHJhbnNBZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRUcmFuc0FnZ3JlZ2F0aW9ucygpO1xuXHRjb25zdCBhQ3VzdG9tQWdncmVnYXRlcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCk7XG5cdGNvbnN0IHBhZ2VNYW5pZmVzdFNldHRpbmdzOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlID0gcGFnZU1hbmlmZXN0U2V0dGluZ3MuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgcDEzbk1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldFAxM25Nb2RlKHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0aWYgKHAxM25Nb2RlID09PSB1bmRlZmluZWQgJiYgdmFyaWFudE1hbmFnZW1lbnQgPT09IFwiQ29udHJvbFwiKSB7XG5cdFx0TG9nLndhcm5pbmcoXCJWYXJpYW50IE1hbmFnZW1lbnQgY2Fubm90IGJlIGVuYWJsZWQgd2hlbiBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWRcIik7XG5cdH1cblx0Y29uc3QgbUN1c3RvbUFnZ3JlZ2F0ZXMgPSB7fSBhcyBhbnk7XG5cdC8vIGNoZWNrIGlmIGFubm9hdGF0aW9uIHBhdGggaGFzIFNQViBhbmQgc3RvcmUgdGhlIHBhdGhcblx0Y29uc3QgbVNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjaGVja0ZvclNQVih2aWV3Q29uZmlndXJhdGlvbik7XG5cdGlmIChhQ3VzdG9tQWdncmVnYXRlcykge1xuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0Zm9yIChjb25zdCBjdXN0b21BZ2dyZWdhdGUgb2YgYUN1c3RvbUFnZ3JlZ2F0ZXMpIHtcblx0XHRcdGNvbnN0IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzID0gY3VzdG9tQWdncmVnYXRlPy5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM7XG5cdFx0XHRjb25zdCBxdWFsaWZpZXIgPSBjdXN0b21BZ2dyZWdhdGU/LnF1YWxpZmllcjtcblx0XHRcdGNvbnN0IHJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSA9IHF1YWxpZmllciAmJiBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgocHJvcGVydHkpID0+IHByb3BlcnR5Lm5hbWUgPT09IHF1YWxpZmllcik7XG5cdFx0XHRjb25zdCBsYWJlbCA9IHJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSAmJiByZWxhdGVkQ3VzdG9tQWdncmVnYXRlUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpO1xuXHRcdFx0bUN1c3RvbUFnZ3JlZ2F0ZXNbcXVhbGlmaWVyXSA9IHtcblx0XHRcdFx0bmFtZTogcXVhbGlmaWVyLFxuXHRcdFx0XHRsYWJlbDogbGFiZWwgfHwgYEN1c3RvbSBBZ2dyZWdhdGUgKCR7cXVhbGlmaWVyfSlgLFxuXHRcdFx0XHRzb3J0YWJsZTogdHJ1ZSxcblx0XHRcdFx0c29ydE9yZGVyOiBcImJvdGhcIixcblx0XHRcdFx0Y29udGV4dERlZmluaW5nUHJvcGVydHk6IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzXG5cdFx0XHRcdFx0PyBhQ29udGV4dERlZmluaW5nUHJvcGVydGllcy5tYXAoKG9DdHhEZWZQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb0N0eERlZlByb3BlcnR5LnZhbHVlO1xuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IFtdXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IG1UcmFuc0FnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgVHJhbnNBZ2c+ID0ge307XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZUNvcmUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRpZiAoYVRyYW5zQWdncmVnYXRpb25zKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVHJhbnNBZ2dyZWdhdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG1UcmFuc0FnZ3JlZ2F0aW9uc1thVHJhbnNBZ2dyZWdhdGlvbnNbaV0uTmFtZV0gPSB7XG5cdFx0XHRcdG5hbWU6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5OYW1lLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5BZ2dyZWdhdGFibGVQcm9wZXJ0eS52YWx1ZU9mKCkudmFsdWUsXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uTWV0aG9kOiBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0uQWdncmVnYXRpb25NZXRob2QsXG5cdFx0XHRcdGxhYmVsOiBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsXG5cdFx0XHRcdFx0PyBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsLnRvU3RyaW5nKClcblx0XHRcdFx0XHQ6IGAke29SZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkFHR1JFR0FUQUJMRV9QUk9QRVJUWVwiKX0gKCR7YVRyYW5zQWdncmVnYXRpb25zW2ldLk5hbWV9KWAsXG5cdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRzb3J0T3JkZXI6IFwiYm90aFwiLFxuXHRcdFx0XHRjdXN0b206IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFBZ2dQcm9wcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMoKTtcblx0Y29uc3QgYUdycFByb3BzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0R3JvdXBhYmxlUHJvcGVydGllcygpO1xuXHRjb25zdCBtQXBwbHlTdXBwb3J0ZWQgPSB7fSBhcyBDaGFydEFwcGx5U3VwcG9ydGVkO1xuXHRtQXBwbHlTdXBwb3J0ZWQuJFR5cGUgPSBBZ2dyZWdhdGlvbkFubm90YXRpb25UeXBlcy5BcHBseVN1cHBvcnRlZFR5cGU7XG5cdG1BcHBseVN1cHBvcnRlZC5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gW107XG5cdG1BcHBseVN1cHBvcnRlZC5Hcm91cGFibGVQcm9wZXJ0aWVzID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDA7IGFBZ2dQcm9wcyAmJiBpIDwgYUFnZ1Byb3BzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgb2JqOiBNZXRhTW9kZWxUeXBlPEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZT4gPSB7XG5cdFx0XHQkVHlwZTogYUFnZ1Byb3BzW2ldPy4kVHlwZSxcblx0XHRcdFByb3BlcnR5OiB7XG5cdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IGFBZ2dQcm9wc1tpXT8uUHJvcGVydHk/LnZhbHVlXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdG1BcHBseVN1cHBvcnRlZC5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzLnB1c2gob2JqKTtcblx0fVxuXG5cdGZvciAobGV0IGkgPSAwOyBhR3JwUHJvcHMgJiYgaSA8IGFHcnBQcm9wcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IG9iajogRXhwYW5kUGF0aFR5cGU8UHJvcGVydHlQYXRoPiA9IHsgJFByb3BlcnR5UGF0aDogYUdycFByb3BzW2ldPy52YWx1ZSB9O1xuXG5cdFx0bUFwcGx5U3VwcG9ydGVkLkdyb3VwYWJsZVByb3BlcnRpZXMucHVzaChvYmopO1xuXHR9XG5cblx0Y29uc3QgY2hhcnRBY3Rpb25zID0gZ2V0Q2hhcnRBY3Rpb25zKGNoYXJ0QW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRsZXQgW25hdmlnYXRpb25Qcm9wZXJ0eVBhdGggLyosIGFubm90YXRpb25QYXRoKi9dID0gdmlzdWFsaXphdGlvblBhdGguc3BsaXQoXCJAXCIpO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPT09IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSkge1xuXHRcdC8vIERyb3AgdHJhaWxpbmcgc2xhc2hcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5zdWJzdHIoMCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKTtcblx0fVxuXHRjb25zdCB0aXRsZSA9IGNoYXJ0QW5ub3RhdGlvbi5UaXRsZT8udG9TdHJpbmcoKSB8fCBcIlwiOyAvLyByZWFkIHRpdGxlIGZyb20gY2hhcnQgYW5ub3RhdGlvblxuXHRjb25zdCBkYXRhTW9kZWxQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGNvbnN0IGlzRW50aXR5U2V0OiBib29sZWFuID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggPT09IDA7XG5cdGNvbnN0IGVudGl0eU5hbWU6IHN0cmluZyA9IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0ID8gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQubmFtZSA6IGRhdGFNb2RlbFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZTtcblx0Y29uc3Qgc0ZpbHRlcmJhcklkID0gaXNFbnRpdHlTZXQgPyBnZXRGaWx0ZXJCYXJJRChjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCkpIDogdW5kZWZpbmVkO1xuXHRjb25zdCBvVml6UHJvcGVydGllcyA9IHtcblx0XHRsZWdlbmRHcm91cDoge1xuXHRcdFx0bGF5b3V0OiB7XG5cdFx0XHRcdHBvc2l0aW9uOiBcImJvdHRvbVwiXG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRsZXQgYXV0b0JpbmRPbkluaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdGlmIChjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZSkge1xuXHRcdGF1dG9CaW5kT25Jbml0ID0gdHJ1ZTtcblx0fSBlbHNlIGlmIChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KSB7XG5cdFx0YXV0b0JpbmRPbkluaXQgPSBmYWxzZTtcblx0fVxuXHRjb25zdCBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID1cblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2U7XG5cdGNvbnN0IG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCA9IGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMgPyBcIi5oYW5kbGVycy5vblNlZ21lbnRlZEJ1dHRvblByZXNzZWRcIiA6IFwiXCI7XG5cdGNvbnN0IHZpc2libGUgPSBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID8gXCJ7PSAke3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld30gIT09ICdUYWJsZSd9XCIgOiBcInRydWVcIjtcblx0Y29uc3QgYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMoKTtcblx0bUFwcGx5U3VwcG9ydGVkLmVuYWJsZVNlYXJjaCA9IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPyBhbGxvd2VkVHJhbnNmb3JtYXRpb25zLmluZGV4T2YoXCJzZWFyY2hcIikgPj0gMCA6IHRydWU7XG5cdGxldCBxdWFsaWZpZXIgPSBcIlwiO1xuXHRpZiAoY2hhcnRBbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIiNcIikubGVuZ3RoID4gMSkge1xuXHRcdHF1YWxpZmllciA9IGNoYXJ0QW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCIjXCIpWzFdO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQsXG5cdFx0aWQ6IHF1YWxpZmllclxuXHRcdFx0PyBnZXRDaGFydElEKGlzRW50aXR5U2V0ID8gZW50aXR5TmFtZSA6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIHF1YWxpZmllciwgVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQpXG5cdFx0XHQ6IGdldENoYXJ0SUQoaXNFbnRpdHlTZXQgPyBlbnRpdHlOYW1lIDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQpLFxuXHRcdGNvbGxlY3Rpb246IGdldFRhcmdldE9iamVjdFBhdGgoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpLFxuXHRcdGVudGl0eU5hbWU6IGVudGl0eU5hbWUsXG5cdFx0cGVyc29uYWxpemF0aW9uOiBnZXRQMTNuTW9kZSh2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0bmF2aWdhdGlvblBhdGg6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG5cdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aCh2aXN1YWxpemF0aW9uUGF0aCksXG5cdFx0ZmlsdGVySWQ6IHNGaWx0ZXJiYXJJZCxcblx0XHR2aXpQcm9wZXJ0aWVzOiBKU09OLnN0cmluZ2lmeShvVml6UHJvcGVydGllcyksXG5cdFx0YWN0aW9uczogY2hhcnRBY3Rpb25zLmFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IGNoYXJ0QWN0aW9ucy5jb21tYW5kQWN0aW9ucyxcblx0XHR0aXRsZTogdGl0bGUsXG5cdFx0YXV0b0JpbmRPbkluaXQ6IGF1dG9CaW5kT25Jbml0LFxuXHRcdG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZDogb25TZWdtZW50ZWRCdXR0b25QcmVzc2VkLFxuXHRcdHZpc2libGU6IHZpc2libGUsXG5cdFx0Y3VzdG9tQWdnOiBtQ3VzdG9tQWdncmVnYXRlcyxcblx0XHR0cmFuc0FnZzogbVRyYW5zQWdncmVnYXRpb25zLFxuXHRcdGFwcGx5U3VwcG9ydGVkOiBtQXBwbHlTdXBwb3J0ZWQsXG5cdFx0c2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGg6IG1TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aCxcblx0XHR2YXJpYW50TWFuYWdlbWVudDogZmluZFZhcmlhbnRNYW5hZ2VtZW50KHAxM25Nb2RlLCB2YXJpYW50TWFuYWdlbWVudClcblx0fTtcbn1cbi8qKlxuICogTWV0aG9kIHRvIGRldGVybWluZSB0aGUgdmFyaWFudCBtYW5hZ2VtZW50LlxuICpcbiAqIEBwYXJhbSBwMTNuTW9kZVxuICogQHBhcmFtIHZhcmlhbnRNYW5hZ2VtZW50XG4gKiBAcmV0dXJucyBUaGUgdmFyaWFudCBtYW5hZ2VtZW50IGZvciB0aGUgY2hhcnRcbiAqL1xuZnVuY3Rpb24gZmluZFZhcmlhbnRNYW5hZ2VtZW50KHAxM25Nb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQsIHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUpIHtcblx0cmV0dXJuIHZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIkNvbnRyb2xcIiAmJiAhcDEzbk1vZGUgPyBWYXJpYW50TWFuYWdlbWVudFR5cGUuTm9uZSA6IHZhcmlhbnRNYW5hZ2VtZW50O1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBnZXQgY29tcGlsZSBleHByZXNzaW9uIGZvciBEYXRhRmllbGRGb3JBY3Rpb24gYW5kIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgQ29tcGlsZSBleHByZXNzaW9uIGZvciBEYXRhRmllbGRGb3JBY3Rpb24gYW5kIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblxuICovXG5mdW5jdGlvbiBnZXRDb21waWxlRXhwcmVzc2lvbkZvckFjdGlvbihkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpIHtcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdG5vdChcblx0XHRcdGVxdWFsKFxuXHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLFxuXHRcdFx0XHRcdFtdLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24oKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpXG5cdFx0KVxuXHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmxhbmtDaGFydFZpc3VhbGl6YXRpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENoYXJ0VmlzdWFsaXphdGlvbiB7XG5cdGNvbnN0IGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMgPVxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucygpIHx8XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZTtcblx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRjb25zdCBlbnRpdHlOYW1lID0gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgPyBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldC5uYW1lIDogZGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lO1xuXG5cdGNvbnN0IHZpc3VhbGl6YXRpb246IENoYXJ0VmlzdWFsaXphdGlvbiA9IHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCxcblx0XHRpZDogZ2V0Q2hhcnRJRChlbnRpdHlOYW1lLCBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCksXG5cdFx0ZW50aXR5TmFtZTogZW50aXR5TmFtZSxcblx0XHR0aXRsZTogXCJcIixcblx0XHRjb2xsZWN0aW9uOiBcIlwiLFxuXHRcdHBlcnNvbmFsaXphdGlvbjogdW5kZWZpbmVkLFxuXHRcdG5hdmlnYXRpb25QYXRoOiBcIlwiLFxuXHRcdGFubm90YXRpb25QYXRoOiBcIlwiLFxuXHRcdHZpelByb3BlcnRpZXM6IEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdGxlZ2VuZEdyb3VwOiB7XG5cdFx0XHRcdGxheW91dDoge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImJvdHRvbVwiXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSxcblx0XHRhY3Rpb25zOiBbXSxcblx0XHRjb21tYW5kQWN0aW9uczoge30sXG5cdFx0YXV0b0JpbmRPbkluaXQ6IGZhbHNlLFxuXHRcdG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZDogXCJcIixcblx0XHR2aXNpYmxlOiBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID8gXCJ7PSAke3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld30gIT09ICdUYWJsZSd9XCIgOiBcInRydWVcIixcblx0XHRjdXN0b21BZ2c6IHt9LFxuXHRcdHRyYW5zQWdnOiB7fSxcblx0XHRhcHBseVN1cHBvcnRlZDoge1xuXHRcdFx0JFR5cGU6IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkVHlwZVwiLFxuXHRcdFx0QWdncmVnYXRhYmxlUHJvcGVydGllczogW10sXG5cdFx0XHRHcm91cGFibGVQcm9wZXJ0aWVzOiBbXSxcblx0XHRcdGVuYWJsZVNlYXJjaDogZmFsc2Vcblx0XHR9LFxuXHRcdG11bHRpVmlld3M6IGZhbHNlLFxuXHRcdHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUuTm9uZVxuXHR9O1xuXG5cdHJldHVybiB2aXN1YWxpemF0aW9uO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSw4QkFBOEIsQ0FDdENDLGVBQXNCLEVBQ3RCQyxpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUNuQjtJQUNmLE1BQU1DLFlBQTBCLEdBQUcsRUFBRTtJQUNyQyxJQUFJSCxlQUFlLEVBQUU7TUFDcEIsTUFBTUksUUFBUSxHQUFHSixlQUFlLENBQUNLLE9BQU8sSUFBSSxFQUFFO01BQzlDRCxRQUFRLENBQUNFLE9BQU8sQ0FBRUMsU0FB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