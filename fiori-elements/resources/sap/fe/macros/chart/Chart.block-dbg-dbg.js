/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/uid", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/ui/core/library", "sap/ui/model/json/JSONModel", "../internal/helpers/ActionHelper", "../internal/helpers/DefaultActionHandler", "./ChartHelper"], function (Log, uid, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, DataField, DataVisualization, Aggregation, MetaModelConverter, BindingToolkit, ModelHelper, StableIdHelper, DataModelPathHelper, CommonHelper, library, JSONModel, ActionHelper, DefaultActionHandler, ChartHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _class3;
  var _exports = {};
  var TitleLevel = library.TitleLevel;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var isDataModelObjectPathForActionWithDialog = DataField.isDataModelObjectPathForActionWithDialog;
  var xml = BuildingBlockTemplateProcessor.xml;
  var escapeXMLAttributeValue = BuildingBlockTemplateProcessor.escapeXMLAttributeValue;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const measureRole = {
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
  };
  var personalizationValues;
  /**
   * Build actions and action groups with all properties for chart visualization.
   *
   * @param childAction XML node corresponding to actions
   * @returns Prepared action object
   */
  (function (personalizationValues) {
    personalizationValues["Sort"] = "Sort";
    personalizationValues["Type"] = "Type";
    personalizationValues["Item"] = "Item";
    personalizationValues["Filter"] = "Filter";
  })(personalizationValues || (personalizationValues = {}));
  const setCustomActionProperties = function (childAction) {
    var _action$getAttribute;
    let menuContentActions = null;
    const action = childAction;
    let menuActions = [];
    const actionKey = (_action$getAttribute = action.getAttribute("key")) === null || _action$getAttribute === void 0 ? void 0 : _action$getAttribute.replace("InlineXML_", "");
    if (action.children.length && action.localName === "ActionGroup" && action.namespaceURI === "sap.fe.macros") {
      const actionsToAdd = Array.prototype.slice.apply(action.children);
      let actionIdx = 0;
      menuContentActions = actionsToAdd.reduce((customAction, actToAdd) => {
        var _actToAdd$getAttribut;
        const actionKeyAdd = ((_actToAdd$getAttribut = actToAdd.getAttribute("key")) === null || _actToAdd$getAttribut === void 0 ? void 0 : _actToAdd$getAttribut.replace("InlineXML_", "")) || actionKey + "_Menu_" + actionIdx;
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
      menuActions = Object.values(menuContentActions).slice(-action.children.length).map(function (menuItem) {
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
  let ChartBlock = (
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
  _dec = defineBuildingBlock({
    name: "Chart",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "object"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec11 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec12 = blockAttribute({
    type: "string|boolean",
    isPublic: true
  }), _dec13 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "string"
  }), _dec16 = blockAttribute({
    type: "string"
  }), _dec17 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "string"
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "string"
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec25 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec26 = blockEvent(), _dec27 = blockEvent(), _dec28 = blockAggregation({
    type: "sap.fe.macros.internal.chart.Action | sap.fe.macros.internal.chart.ActionGroup",
    isPublic: true,
    processAggregations: setCustomActionProperties
  }), _dec29 = blockEvent(), _dec30 = blockEvent(), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ChartBlock, _BuildingBlockBase);
    /**
     * ID of the chart
     */

    /**
     * Metadata path to the presentation context (UI.Chart with or without a qualifier)
     */

    // We require metaPath to be there even though it is not formally required

    /**
     * Metadata path to the entitySet or navigationProperty
     */

    // We require contextPath to be there even though it is not formally required

    /**
     * The height of the chart
     */

    /**
     * The width of the chart
     */

    /**
     * Specifies the header text that is shown in the chart
     */

    /**
     * Specifies the visibility of the chart header
     */

    /**
     * Defines the "aria-level" of the chart header
     */

    /**
     * Specifies the selection mode
     */

    /**
     * Parameter which sets the personalization of the chart
     */

    /**
     * Parameter which sets the ID of the filterbar associating it to the chart
     */

    /**
     * 	Parameter which sets the noDataText for the chart
     */

    /**
     * Parameter which sets the chart delegate for the chart
     */

    /**
     * Parameter which sets the visualization properties for the chart
     */

    /**
     * The actions to be shown in the action area of the chart
     */

    /**
     * The XML and manifest actions to be shown in the action area of the chart
     */

    /**
     * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and
     * the Boolean flag that indicates whether data is selected or deselected
     */

    /**
     * Event handler to react to the stateChange event of the chart.
     */

    function ChartBlock(_props, configuration, _settings) {
      var _this;
      _this = _BuildingBlockBase.call(this, _props, configuration, _settings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDefinition", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "height", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerLevel", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noDataText", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDelegate", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vizProperties", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartActions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftSupported", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "autoBindOnInit", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filter", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measures", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_applyIdToContent", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSelected", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSaved", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor29, _assertThisInitialized(_this));
      _this._commandActions = [];
      _this.createChartDefinition = (converterContext, contextObjectPath, controlPath) => {
        var _this$metaPath, _this$metaPath$getObj;
        let visualizationPath = getContextRelativeTargetObjectPath(contextObjectPath);
        if (((_this$metaPath = _this.metaPath) === null || _this$metaPath === void 0 ? void 0 : (_this$metaPath$getObj = _this$metaPath.getObject()) === null || _this$metaPath$getObj === void 0 ? void 0 : _this$metaPath$getObj.$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          const visualizations = _this.metaPath.getObject().Visualizations;
          visualizationPath = ChartBlock.checkChartVisualizationPath(visualizations, visualizationPath);
        }

        // fallback to default Chart if visualizationPath is missing or visualizationPath is not found in control (in case of PresentationVariant)
        if (!visualizationPath || controlPath.indexOf(visualizationPath) === -1) {
          visualizationPath = `@${"com.sap.vocabularies.UI.v1.Chart"}`;
        }
        const visualizationDefinition = getDataVisualizationConfiguration(visualizationPath, _this.useCondensedLayout, converterContext, undefined, undefined, undefined, true);
        return visualizationDefinition.visualizations[0];
      };
      _this.createBindingContext = function (data, settings) {
        const contextPath = `/${uid()}`;
        settings.models.converterContext.setProperty(contextPath, data);
        return settings.models.converterContext.createBindingContext(contextPath);
      };
      _this.getChartMeasures = (props, aggregationHelper) => {
        const chartAnnotationPath = props.chartDefinition.annotationPath.split("/");
        // this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
        const annotationPath = chartAnnotationPath.filter(function (item, pos) {
          return chartAnnotationPath.indexOf(item) == pos;
        }).toString().replaceAll(",", "/");
        const oChart = getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(annotationPath), _this.contextPath).targetObject;
        const aggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        let measures = [];
        const annoPath = props.metaPath.getPath();
        const aggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
        const chartMeasures = oChart.Measures ? oChart.Measures : [];
        const chartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
        //check if there are measures pointing to aggregatedproperties
        const transAggInMeasures = aggregatedProperties[0] ? aggregatedProperties[0].filter(function (properties) {
          return chartMeasures.some(function (propertyMeasureType) {
            return properties.Name === propertyMeasureType.value;
          });
        }) : undefined;
        const entitySetPath = annoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/, "");
        const transAggregations = props.chartDefinition.transAgg;
        const customAggregations = props.chartDefinition.customAgg;
        // intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
        if (aggregatedProperty.length > 0 && !chartDynamicMeasures && transAggInMeasures.length > 0) {
          Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
        }
        const isCustomAggregateIsMeasure = chartMeasures.some(oChartMeasure => {
          const oCustomAggMeasure = _this.getCustomAggMeasure(customAggregations, oChartMeasure);
          return !!oCustomAggMeasure;
        });
        if (aggregatedProperty.length > 0 && !chartDynamicMeasures.length && !isCustomAggregateIsMeasure) {
          throw new Error("Please configure DynamicMeasures for the chart");
        }
        if (aggregatedProperty.length > 0) {
          for (const dynamicMeasure of chartDynamicMeasures) {
            measures = _this.getDynamicMeasures(measures, dynamicMeasure, entitySetPath, oChart);
          }
        }
        for (const chartMeasure of chartMeasures) {
          const key = chartMeasure.value;
          const customAggMeasure = _this.getCustomAggMeasure(customAggregations, chartMeasure);
          const measureType = {};
          if (customAggMeasure) {
            measures = _this.setCustomAggMeasure(measures, measureType, customAggMeasure, key);
            //if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
          } else if (aggregatedProperty.length === 0 && transAggregations[key]) {
            measures = _this.setTransAggMeasure(measures, measureType, transAggregations, key);
          }
          _this.setChartMeasureAttributes(_this._chart.MeasureAttributes, entitySetPath, measureType);
        }
        const measuresModel = new JSONModel(measures);
        measuresModel.$$valueAsPromise = true;
        return measuresModel.createBindingContext("/");
      };
      _this.setCustomAggMeasure = (measures, measure, customAggMeasure, key) => {
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
      _this.setTransAggMeasure = (measures, measure, transAggregations, key) => {
        const transAggMeasure = transAggregations[key];
        measure.key = transAggMeasure.name;
        measure.role = "axis1";
        measure.propertyPath = key;
        measure.aggregationMethod = transAggMeasure.aggregationMethod;
        measure.label = transAggMeasure.label || measure.label;
        measures.push(measure);
        return measures;
      };
      _this.getDynamicMeasures = (measures, chartDynamicMeasure, entitySetPath, chart) => {
        var _chartDynamicMeasure$;
        const key = chartDynamicMeasure.value || "";
        const aggregatedProperty = getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(entitySetPath + key), _this.contextPath).targetObject;
        if (key.indexOf("/") > -1) {
          Log.error(`$expand is not yet supported. Measure: ${key} from an association cannot be used`);
          // check if the annotation path is wrong
        } else if (!aggregatedProperty) {
          throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${chartDynamicMeasure.value}`);
          // check if the path starts with @
        } else if (((_chartDynamicMeasure$ = chartDynamicMeasure.value) === null || _chartDynamicMeasure$ === void 0 ? void 0 : _chartDynamicMeasure$.startsWith(`@${"com.sap.vocabularies.Analytics.v1.AggregatedProperty"}`)) === null) {
          throw new Error(`Please provide the right AnnotationPath to the Dynamic Measure ${chartDynamicMeasure.value}`);
        } else {
          var _aggregatedProperty$a;
          // check if AggregatedProperty is defined in given DynamicMeasure
          const dynamicMeasure = {
            key: aggregatedProperty.Name,
            role: "axis1"
          };
          dynamicMeasure.propertyPath = aggregatedProperty.AggregatableProperty.value;
          dynamicMeasure.aggregationMethod = aggregatedProperty.AggregationMethod;
          dynamicMeasure.label = resolveBindingString(((_aggregatedProperty$a = aggregatedProperty.annotations.Common) === null || _aggregatedProperty$a === void 0 ? void 0 : _aggregatedProperty$a.Label) || getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(entitySetPath + dynamicMeasure.propertyPath + `@${"com.sap.vocabularies.Common.v1.Label"}`), _this.contextPath).targetObject);
          _this.setChartMeasureAttributes(chart.MeasureAttributes, entitySetPath, dynamicMeasure);
          measures.push(dynamicMeasure);
        }
        return measures;
      };
      _this.getCustomAggMeasure = (customAggregations, measure) => {
        if (measure.value && customAggregations[measure.value]) {
          var _customAggregations$m;
          measure.label = (_customAggregations$m = customAggregations[measure.value]) === null || _customAggregations$m === void 0 ? void 0 : _customAggregations$m.label;
          return measure;
        }
        return null;
      };
      _this.setChartMeasureAttributes = (measureAttributes, entitySetPath, measure) => {
        if (measureAttributes !== null && measureAttributes !== void 0 && measureAttributes.length) {
          for (const measureAttribute of measureAttributes) {
            _this._setChartMeasureAttribute(measureAttribute, entitySetPath, measure);
          }
        }
      };
      _this._setChartMeasureAttribute = (measureAttribute, entitySetPath, measure) => {
        var _measureAttribute$Dyn, _measureAttribute$Mea, _measureAttribute$Dat;
        const path = measureAttribute.DynamicMeasure ? measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Dyn = measureAttribute.DynamicMeasure) === null || _measureAttribute$Dyn === void 0 ? void 0 : _measureAttribute$Dyn.value : measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Mea = measureAttribute.Measure) === null || _measureAttribute$Mea === void 0 ? void 0 : _measureAttribute$Mea.value;
        const measureAttributeDataPoint = measureAttribute.DataPoint ? measureAttribute === null || measureAttribute === void 0 ? void 0 : (_measureAttribute$Dat = measureAttribute.DataPoint) === null || _measureAttribute$Dat === void 0 ? void 0 : _measureAttribute$Dat.value : null;
        const role = measureAttribute.Role;
        const dataPoint = measureAttributeDataPoint && getInvolvedDataModelObjects(_this.metaPath.getModel().createBindingContext(entitySetPath + measureAttributeDataPoint), _this.contextPath).targetObject;
        if (measure.key === path) {
          _this.setMeasureRole(measure, role);
          //still to add data point, but UI5 Chart API is missing
          _this.setMeasureDataPoint(measure, dataPoint);
        }
      };
      _this.setMeasureDataPoint = (measure, dataPoint) => {
        if (dataPoint && dataPoint.Value.$Path == measure.key) {
          measure.dataPoint = ChartHelper.formatJSONToString(_this.createDataPointProperty(dataPoint)) || "";
        }
      };
      _this.setMeasureRole = (measure, role) => {
        if (role) {
          const index = role.$EnumMember;
          measure.role = measureRole[index];
        }
      };
      _this.getDependents = chartContext => {
        if (_this._commandActions.length > 0) {
          return _this._commandActions.map(commandAction => {
            return _this.getActionCommand(commandAction, chartContext);
          });
        }
        return xml``;
      };
      _this.checkPersonalizationInChartProperties = oProps => {
        if (oProps.personalization) {
          if (oProps.personalization === "false") {
            _this.personalization = undefined;
          } else if (oProps.personalization === "true") {
            _this.personalization = Object.values(personalizationValues).join(",");
          } else if (_this.verifyValidPersonlization(oProps.personalization) === true) {
            _this.personalization = oProps.personalization;
          } else {
            _this.personalization = undefined;
          }
        }
      };
      _this.verifyValidPersonlization = personalization => {
        let valid = true;
        const splitArray = personalization.split(",");
        const acceptedValues = Object.values(personalizationValues);
        splitArray.forEach(arrayElement => {
          if (!acceptedValues.includes(arrayElement)) {
            valid = false;
          }
        });
        return valid;
      };
      _this.getVariantManagement = (oProps, oChartDefinition) => {
        let variantManagement = oProps.variantManagement ? oProps.variantManagement : oChartDefinition.variantManagement;
        variantManagement = _this.personalization === undefined ? "None" : variantManagement;
        return variantManagement;
      };
      _this.createVariantManagement = () => {
        const personalization = _this.personalization;
        if (personalization) {
          const variantManagement = _this.variantManagement;
          if (variantManagement === "Control") {
            return xml`
					<mdc:variant>
					<variant:VariantManagement
						id="${generate([_this.id, "VM"])}"
						for="${_this.id}"
						showSetAsDefault="${true}"
						select="${_this.variantSelected}"
						headerLevel="${_this.headerLevel}"
						save="${_this.variantSaved}"
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
      _this.getPersistenceProvider = () => {
        if (_this.variantManagement === "None") {
          return xml`<p13n:PersistenceProvider id="${generate([_this.id, "PersistenceProvider"])}" for="${_this.id}"/>`;
        }
        return xml``;
      };
      _this.pushActionCommand = (actionContext, dataField, chartOperationAvailableMap, action) => {
        if (dataField) {
          const commandAction = {
            actionContext: actionContext,
            onExecuteAction: ChartHelper.getPressEventForDataFieldForActionButton(_this.id, dataField, chartOperationAvailableMap || ""),
            onExecuteIBN: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
            onExecuteManifest: CommonHelper.buildActionWrapper(action, _assertThisInitialized(_this))
          };
          _this._commandActions.push(commandAction);
        }
      };
      _this.getActionCommand = (commandAction, chartContext) => {
        const action = commandAction.actionContext.getObject();
        const dataFieldContext = action.annotationPath && _this.contextPath.getModel().createBindingContext(action.annotationPath);
        const dataField = dataFieldContext && dataFieldContext.getObject();
        const dataFieldAction = _this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
        const actionContext = CommonHelper.getActionContext(dataFieldAction);
        const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
        const isBound = _this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
        const chartOperationAvailableMap = escapeXMLAttributeValue(ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
          context: chartContext
        }));
        const isActionEnabled = action.enabled ? action.enabled : ChartHelper.isDataFieldForActionButtonEnabled(isBound && isBound.$IsBound, dataField.Action, _this.contextPath, chartOperationAvailableMap || "", action.enableOnSelect || "");
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
		visible="${_this.getVisible(dataFieldContext)}"
	/>`;
        if (action.type == "ForAction" && (!isBound || isBound.IsBound !== true || actionContext[`@${"Org.OData.Core.V1.OperationAvailable"}`] !== false)) {
          return actionCommand;
        } else if (action.type == "ForAction") {
          return xml``;
        } else {
          return actionCommand;
        }
      };
      _this.getItems = chartContext => {
        if (_this._chart) {
          const dimensions = [];
          const measures = [];
          if (_this._chart.Dimensions) {
            ChartHelper.formatDimensions(chartContext).getObject().forEach(dimension => {
              dimension.id = generate([_this.id, "dimension", dimension.key]);
              dimensions.push(_this.getItem({
                id: dimension.id,
                key: dimension.key,
                label: dimension.label,
                role: dimension.role
              }, "_fe_groupable_", "groupable"));
            });
          }
          if (_this.measures) {
            ChartHelper.formatMeasures(_this.measures).forEach(measure => {
              measure.id = generate([_this.id, "measure", measure.key]);
              measures.push(_this.getItem({
                id: measure.id,
                key: measure.key,
                label: measure.label,
                role: measure.role
              }, "_fe_aggregatable_", "aggregatable"));
            });
          }
          if (dimensions.length && measures.length) {
            return dimensions.concat(measures);
          }
        }
        return xml``;
      };
      _this.getItem = (item, prefix, type) => {
        return xml`<chart:Item
			id="${item.id}"
			name="${prefix + item.key}"
			type="${type}"
			label="${resolveBindingString(item.label, "string")}"
			role="${item.role}"
		/>`;
      };
      _this.getToolbarActions = chartContext => {
        var _this$chartDefinition;
        const actions = _this.getActions(chartContext);
        if ((_this$chartDefinition = _this.chartDefinition) !== null && _this$chartDefinition !== void 0 && _this$chartDefinition.onSegmentedButtonPressed) {
          actions.push(_this.getSegmentedButton());
        }
        if (actions.length > 0) {
          return xml`<mdc:actions>${actions}</mdc:actions>`;
        }
        return xml``;
      };
      _this.getActions = chartContext => {
        var _this$chartActions;
        let actions = (_this$chartActions = _this.chartActions) === null || _this$chartActions === void 0 ? void 0 : _this$chartActions.getObject();
        actions = _this.removeMenuItems(actions);
        return actions.map(action => {
          if (action.annotationPath) {
            // Load annotation based actions
            return _this.getAction(action, chartContext, false);
          } else if (action.hasOwnProperty("noWrap")) {
            // Load XML or manifest based actions / action groups
            return _this.getCustomActions(action, chartContext);
          }
        });
      };
      _this.removeMenuItems = actions => {
        // If action is already part of menu in action group, then it will
        // be removed from the main actions list
        for (const action of actions) {
          if (action.menu) {
            action.menu.forEach(item => {
              if (actions.indexOf(item) !== -1) {
                actions.splice(actions.indexOf(item), 1);
              }
            });
          }
        }
        return actions;
      };
      _this.getCustomActions = (action, chartContext) => {
        let actionEnabled = action.enabled;
        if ((action.requiresSelection ?? false) && action.enabled === "true") {
          actionEnabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        if (action.type === "Default") {
          // Load XML or manifest based toolbar actions
          return _this.getActionToolbarAction(action, {
            id: generate([_this.id, action.id]),
            unittestid: "DataFieldForActionButtonAction",
            label: action.text ? action.text : "",
            ariaHasPopup: undefined,
            press: action.press ? action.press : "",
            enabled: actionEnabled,
            visible: action.visible ? action.visible : false
          }, false);
        } else if (action.type === "Menu") {
          // Load action groups (Menu)
          return _this.getActionToolbarMenuAction({
            id: generate([_this.id, action.id]),
            text: action.text,
            visible: action.visible,
            enabled: actionEnabled,
            useDefaultActionOnly: DefaultActionHandler.getUseDefaultActionOnly(action),
            buttonMode: DefaultActionHandler.getButtonMode(action),
            defaultAction: undefined,
            actions: action
          }, chartContext);
        }
      };
      _this.getMenuItemFromMenu = (menuItemAction, chartContext) => {
        let pressHandler;
        if (menuItemAction.annotationPath) {
          //Annotation based action is passed as menu item for menu button
          return _this.getAction(menuItemAction, chartContext, true);
        }
        if (menuItemAction.command) {
          pressHandler = "cmd:" + menuItemAction.command;
        } else if (menuItemAction.noWrap ?? false) {
          pressHandler = menuItemAction.press;
        } else {
          pressHandler = CommonHelper.buildActionWrapper(menuItemAction, _assertThisInitialized(_this));
        }
        return xml`<MenuItem
		core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
		text="${menuItemAction.text}"
		press="${pressHandler}"
		visible="${menuItemAction.visible}"
		enabled="${menuItemAction.enabled}"
	/>`;
      };
      _this.getActionToolbarMenuAction = (props, chartContext) => {
        var _props$actions, _props$actions$menu;
        const aMenuItems = (_props$actions = props.actions) === null || _props$actions === void 0 ? void 0 : (_props$actions$menu = _props$actions.menu) === null || _props$actions$menu === void 0 ? void 0 : _props$actions$menu.map(action => {
          return _this.getMenuItemFromMenu(action, chartContext);
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
      _this.getAction = (action, chartContext, isMenuItem) => {
        const dataFieldContext = _this.contextPath.getModel().createBindingContext(action.annotationPath || "");
        if (action.type === "ForNavigation") {
          return _this.getNavigationActions(action, dataFieldContext, isMenuItem);
        } else if (action.type === "ForAction") {
          return _this.getAnnotationActions(chartContext, action, dataFieldContext, isMenuItem);
        }
        return xml``;
      };
      _this.getNavigationActions = (action, dataFieldContext, isMenuItem) => {
        let enabled = "true";
        const dataField = dataFieldContext.getObject();
        if (action.enabled !== undefined) {
          enabled = action.enabled;
        } else if (dataField.RequiresContext) {
          enabled = "{= %{internal>numberOfSelectedContexts} >= 1}";
        }
        return _this.getActionToolbarAction(action, {
          id: undefined,
          unittestid: "DataFieldForIntentBasedNavigationButtonAction",
          label: dataField.Label,
          ariaHasPopup: undefined,
          press: CommonHelper.getPressHandlerForDataFieldForIBN(dataField, `\${internal>selectedContexts}`, false),
          enabled: enabled,
          visible: _this.getVisible(dataFieldContext)
        }, isMenuItem);
      };
      _this.getAnnotationActions = (chartContext, action, dataFieldContext, isMenuItem) => {
        const dataFieldAction = _this.contextPath.getModel().createBindingContext(action.annotationPath + "/Action");
        const actionContext = _this.contextPath.getModel().createBindingContext(CommonHelper.getActionContext(dataFieldAction));
        const actionObject = actionContext.getObject();
        const isBoundPath = CommonHelper.getPathToBoundActionOverload(dataFieldAction);
        const isBound = _this.contextPath.getModel().createBindingContext(isBoundPath).getObject();
        const dataField = dataFieldContext.getObject();
        if (!isBound || isBound.$IsBound !== true || actionObject[`@${"Org.OData.Core.V1.OperationAvailable"}`] !== false) {
          const enabled = _this.getAnnotationActionsEnabled(action, isBound, dataField, chartContext);
          const dataFieldModelObjectPath = getInvolvedDataModelObjects(_this.contextPath.getModel().createBindingContext(action.annotationPath));
          const ariaHasPopup = isDataModelObjectPathForActionWithDialog(dataFieldModelObjectPath);
          const chartOperationAvailableMap = escapeXMLAttributeValue(ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
            context: chartContext
          })) || "";
          return _this.getActionToolbarAction(action, {
            id: generate([_this.id, getInvolvedDataModelObjects(dataFieldContext)]),
            unittestid: "DataFieldForActionButtonAction",
            label: dataField.Label,
            ariaHasPopup: ariaHasPopup,
            press: ChartHelper.getPressEventForDataFieldForActionButton(_this.id, dataField, chartOperationAvailableMap),
            enabled: enabled,
            visible: _this.getVisible(dataFieldContext)
          }, isMenuItem);
        }
        return xml``;
      };
      _this.getActionToolbarAction = (action, toolbarAction, isMenuItem) => {
        if (isMenuItem) {
          return xml`
			<MenuItem
				text="${toolbarAction.label}"
				press="${action.command ? "cmd:" + action.command : toolbarAction.press}"
				enabled="${toolbarAction.enabled}"
				visible="${toolbarAction.visible}"
			/>`;
        } else {
          return _this.buildAction(action, toolbarAction);
        }
      };
      _this.buildAction = (action, toolbarAction) => {
        let actionPress = "";
        if (action.hasOwnProperty("noWrap")) {
          if (action.command) {
            actionPress = "cmd:" + action.command;
          } else if (action.noWrap === true) {
            actionPress = toolbarAction.press;
          } else if (!action.annotationPath) {
            actionPress = CommonHelper.buildActionWrapper(action, _assertThisInitialized(_this));
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
      _this.getAnnotationActionsEnabled = (action, isBound, dataField, chartContext) => {
        return action.enabled !== undefined ? action.enabled : ChartHelper.isDataFieldForActionButtonEnabled(isBound && isBound.$IsBound, dataField.Action, _this.contextPath, ChartHelper.getOperationAvailableMap(chartContext.getObject(), {
          context: chartContext
        }), action.enableOnSelect || "");
      };
      _this.getSegmentedButton = () => {
        return xml`<mdcat:ActionToolbarAction layoutInformation="{
			aggregationName: 'end',
			alignment: 'End'
		}">
			<SegmentedButton
				id="${generate([_this.id, "SegmentedButton", "TemplateContentView"])}"
				select="${_this.chartDefinition.onSegmentedButtonPressed}"
				visible="{= \${pageInternal>alpContentView} !== 'Table' }"
				selectedKey="{pageInternal>alpContentView}"
			>
				<items>
					${_this.getSegmentedButtonItems()}
				</items>
			</SegmentedButton>
		</mdcat:ActionToolbarAction>`;
      };
      _this.getSegmentedButtonItems = () => {
        const segmentedButtonItems = [];
        if (CommonHelper.isDesktop()) {
          segmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Hybrid", "sap-icon://chart-table-view"));
        }
        segmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Chart", "sap-icon://bar-chart"));
        segmentedButtonItems.push(_this.getSegmentedButtonItem("{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}", "Table", "sap-icon://table-view"));
        return segmentedButtonItems;
      };
      _this.getSegmentedButtonItem = (tooltip, key, icon) => {
        return xml`<SegmentedButtonItem
			tooltip="${tooltip}"
			key="${key}"
			icon="${icon}"
		/>`;
      };
      _this.getVisible = dataFieldContext => {
        const dataField = dataFieldContext.getObject();
        if (dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`] && dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path) {
          const hiddenPathContext = _this.contextPath.getModel().createBindingContext(dataFieldContext.getPath() + `/@${"com.sap.vocabularies.UI.v1.Hidden"}/$Path`, dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path);
          return ChartHelper.getHiddenPathExpressionForTableActionsAndIBN(dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`].$Path, {
            context: hiddenPathContext
          });
        } else if (dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]) {
          return !dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];
        } else {
          return true;
        }
      };
      _this.getContextPath = () => {
        return _this.contextPath.getPath().lastIndexOf("/") === _this.contextPath.getPath().length - 1 ? _this.contextPath.getPath().replaceAll("/", "") : _this.contextPath.getPath().split("/")[_this.contextPath.getPath().split("/").length - 1];
      };
      const _contextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      const initialConverterContext = _this.getConverterContext(_contextObjectPath, /*this.contextPath*/undefined, _settings);
      const _visualizationPath = ChartBlock.getVisualizationPath(_assertThisInitialized(_this), _contextObjectPath, initialConverterContext);
      const extraParams = ChartBlock.getExtraParams(_assertThisInitialized(_this), _visualizationPath);
      const _converterContext = _this.getConverterContext(_contextObjectPath, /*this.contextPath*/undefined, _settings, extraParams);
      const _aggregationHelper = new AggregationHelper(_converterContext.getEntityType(), _converterContext);
      _this._chartContext = ChartHelper.getUiChart(_this.metaPath);
      _this._chart = _this._chartContext.getObject();
      if (_this._applyIdToContent ?? false) {
        _this._apiId = _this.id + "::Chart";
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = _this.getContentId(_this.id);
      }
      if (_this._chart) {
        var _this$chartDefinition2, _contextObjectPath$co, _this$chartDefinition5, _this$chartDefinition6, _this$chartDefinition7, _this$chartDefinition8, _this$chartDefinition9;
        _this.chartDefinition = _this.chartDefinition === undefined || _this.chartDefinition === null ? _this.createChartDefinition(_converterContext, _contextObjectPath, _this._chartContext.getPath()) : _this.chartDefinition;

        // API Properties
        _this.navigationPath = _this.chartDefinition.navigationPath;
        _this.autoBindOnInit = _this.chartDefinition.autoBindOnInit;
        _this.vizProperties = _this.chartDefinition.vizProperties;
        _this.chartActions = _this.createBindingContext(_this.chartDefinition.actions, _settings);
        _this.selectionMode = _this.selectionMode.toUpperCase();
        if (_this.filterBar) {
          _this.filter = _this.getContentId(_this.filterBar);
        } else if (!_this.filter) {
          _this.filter = _this.chartDefinition.filterId;
        }
        _this.checkPersonalizationInChartProperties(_assertThisInitialized(_this));
        _this.variantManagement = _this.getVariantManagement(_assertThisInitialized(_this), _this.chartDefinition);
        _this.visible = _this.chartDefinition.visible;
        let contextPath = _this.contextPath.getPath();
        contextPath = contextPath[contextPath.length - 1] === "/" ? contextPath.slice(0, -1) : contextPath;
        _this.draftSupported = ModelHelper.isDraftSupported(_settings.models.metaModel, contextPath);
        _this._chartType = ChartHelper.formatChartType(_this._chart.ChartType);
        const operationAvailableMap = ChartHelper.getOperationAvailableMap(_this._chart, {
          context: _this._chartContext
        });
        if (Object.keys((_this$chartDefinition2 = _this.chartDefinition) === null || _this$chartDefinition2 === void 0 ? void 0 : _this$chartDefinition2.commandActions).length > 0) {
          var _this$chartDefinition3;
          Object.keys((_this$chartDefinition3 = _this.chartDefinition) === null || _this$chartDefinition3 === void 0 ? void 0 : _this$chartDefinition3.commandActions).forEach(key => {
            var _this$chartDefinition4;
            const action = (_this$chartDefinition4 = _this.chartDefinition) === null || _this$chartDefinition4 === void 0 ? void 0 : _this$chartDefinition4.commandActions[key];
            const actionContext = _this.createBindingContext(action, _settings);
            const dataFieldContext = action.annotationPath && _this.contextPath.getModel().createBindingContext(action.annotationPath);
            const dataField = dataFieldContext && dataFieldContext.getObject();
            const chartOperationAvailableMap = escapeXMLAttributeValue(operationAvailableMap);
            _this.pushActionCommand(actionContext, dataField, chartOperationAvailableMap, action);
          });
        }
        _this.measures = _this.getChartMeasures(_assertThisInitialized(_this), _aggregationHelper);
        const presentationPath = CommonHelper.createPresentationPathContext(_this.metaPath);
        _this._sortCondtions = ChartHelper.getSortConditions(_this.metaPath, _this.metaPath.getObject(), presentationPath.getPath(), _this.chartDefinition.applySupported);
        const chartActionsContext = _this.contextPath.getModel().createBindingContext(_this._chartContext.getPath() + "/Actions", _this._chart.Actions);
        const contextPathContext = _this.contextPath.getModel().createBindingContext(_this.contextPath.getPath(), _this.contextPath);
        const contextPathPath = CommonHelper.getContextPath(_this.contextPath, {
          context: contextPathContext
        });
        const targetCollectionPath = CommonHelper.getTargetCollectionPath(_this.contextPath);
        const targetCollectionPathContext = _this.contextPath.getModel().createBindingContext(targetCollectionPath, _this.contextPath);
        const actionsObject = (_contextObjectPath$co = _contextObjectPath.convertedTypes.resolvePath(chartActionsContext.getPath())) === null || _contextObjectPath$co === void 0 ? void 0 : _contextObjectPath$co.target;
        _this._customData = {
          targetCollectionPath: contextPathPath,
          entitySet: typeof targetCollectionPathContext.getObject() === "string" ? targetCollectionPathContext.getObject() : targetCollectionPathContext.getObject("@sapui.name"),
          entityType: contextPathPath + "/",
          operationAvailableMap: CommonHelper.stringifyCustomData(JSON.parse(operationAvailableMap)),
          multiSelectDisabledActions: ActionHelper.getMultiSelectDisabledActions(actionsObject) + "",
          segmentedButtonId: generate([_this.id, "SegmentedButton", "TemplateContentView"]),
          customAgg: CommonHelper.stringifyCustomData((_this$chartDefinition5 = _this.chartDefinition) === null || _this$chartDefinition5 === void 0 ? void 0 : _this$chartDefinition5.customAgg),
          transAgg: CommonHelper.stringifyCustomData((_this$chartDefinition6 = _this.chartDefinition) === null || _this$chartDefinition6 === void 0 ? void 0 : _this$chartDefinition6.transAgg),
          applySupported: CommonHelper.stringifyCustomData((_this$chartDefinition7 = _this.chartDefinition) === null || _this$chartDefinition7 === void 0 ? void 0 : _this$chartDefinition7.applySupported),
          vizProperties: _this.vizProperties,
          draftSupported: _this.draftSupported,
          multiViews: (_this$chartDefinition8 = _this.chartDefinition) === null || _this$chartDefinition8 === void 0 ? void 0 : _this$chartDefinition8.multiViews,
          selectionPresentationVariantPath: CommonHelper.stringifyCustomData({
            data: (_this$chartDefinition9 = _this.chartDefinition) === null || _this$chartDefinition9 === void 0 ? void 0 : _this$chartDefinition9.selectionPresentationVariantPath
          })
        };
        _this._actions = _this.chartActions ? _this.getToolbarActions(_this._chartContext) : xml``;
      } else {
        // fallback to display empty chart
        _this.autoBindOnInit = false;
        _this.visible = "true";
        _this.navigationPath = "";
        _this._actions = "";
        _this._customData = {
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
      return _this;
    }
    _exports = ChartBlock;
    var _proto = ChartBlock.prototype;
    _proto.getContentId = function getContentId(macroId) {
      return `${macroId}-content`;
    };
    ChartBlock.getExtraParams = function getExtraParams(props, visualizationPath) {
      const extraParams = {};
      if (props.actions) {
        var _Object$values;
        (_Object$values = Object.values(props.actions)) === null || _Object$values === void 0 ? void 0 : _Object$values.forEach(item => {
          props.actions = {
            ...props.actions,
            ...item.menuContentActions
          };
          delete item.menuContentActions;
        });
      }
      if (visualizationPath) {
        extraParams[visualizationPath] = {
          actions: props.actions
        };
      }
      return extraParams;
    };
    /**
     * Format the data point as a JSON object.
     *
     * @param oDataPointAnno
     * @returns The formatted json object
     */
    _proto.createDataPointProperty = function createDataPointProperty(oDataPointAnno) {
      const oDataPoint = {};
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
     */;
    _proto.buildThresholds = function buildThresholds(oThresholds, oCriticalityCalculation) {
      const aKeys = ["AcceptanceRangeLowValue", "AcceptanceRangeHighValue", "ToleranceRangeLowValue", "ToleranceRangeHighValue", "DeviationRangeLowValue", "DeviationRangeHighValue"];
      let bConstant = true,
        sKey,
        i,
        j;
      oThresholds.ImprovementDirection = oCriticalityCalculation.ImprovementDirection.$EnumMember.replace("com.sap.vocabularies.UI.v1.ImprovementDirectionType/", "");
      const oDynamicThresholds = {
        oneSupplied: false,
        usedMeasures: []
        // combination to check whether at least one is supplied
      };

      const oConstantThresholds = {
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
        let oAggregationLevel;
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
            const aVisibleDimensions = oAggregationLevelInfo.AggregationLevel ? [] : null;
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
    };
    _proto.getTemplate = function getTemplate() {
      let chartdelegate = "";
      if (this._customData.targetCollectionPath === "") {
        this.noDataText = this.getTranslatedText("M_CHART_NO_ANNOTATION_SET_TEXT");
      }
      if (this.chartDelegate) {
        chartdelegate = this.chartDelegate;
      } else {
        const contextPath = this.getContextPath();
        chartdelegate = "{name:'sap/fe/macros/chart/ChartDelegate', payload: {contextPath: '" + contextPath + "', parameters:{$$groupId:'$auto.Workers'}, selectionMode: '" + this.selectionMode + "'}}";
      }
      const binding = "{internal>controls/" + this.id + "}";
      if (!this.header) {
        var _this$_chart, _this$_chart$Title;
        this.header = (_this$_chart = this._chart) === null || _this$_chart === void 0 ? void 0 : (_this$_chart$Title = _this$_chart.Title) === null || _this$_chart$Title === void 0 ? void 0 : _this$_chart$Title.toString();
      }
      return xml`
			<macro:ChartAPI xmlns="sap.m" xmlns:macro="sap.fe.macros.chart" xmlns:variant="sap.ui.fl.variants" xmlns:p13n="sap.ui.mdc.p13n" xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1" xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:internalMacro="sap.fe.macros.internal" xmlns:chart="sap.ui.mdc.chart" xmlns:mdc="sap.ui.mdc" xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:core="sap.ui.core" id="${this._apiId}" selectionChange="${this.selectionChange}" stateChange="${this.stateChange}">
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
    };
    return ChartBlock;
  }(BuildingBlockBase), _class3.checkChartVisualizationPath = (visualizations, visualizationPath) => {
    visualizations.forEach(function (visualization) {
      if (visualization.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`) > -1) {
        visualizationPath = visualization.$AnnotationPath;
      }
    });
    return visualizationPath;
  }, _class3.getVisualizationPath = (props, contextObjectPath, converterContext) => {
    var _contextObjectPath$ta;
    const metaPath = getContextRelativeTargetObjectPath(contextObjectPath);

    // fallback to default Chart if metapath is not set
    if (!metaPath) {
      Log.error(`Missing metapath parameter for Chart`);
      return `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    }
    if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.Chart") {
      return metaPath; // MetaPath is already pointing to a Chart
    }

    //Need to switch to the context related the PV or SPV
    const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
    let visualizations = [];
    switch ((_contextObjectPath$ta = contextObjectPath.targetObject) === null || _contextObjectPath$ta === void 0 ? void 0 : _contextObjectPath$ta.term) {
      case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
        if (contextObjectPath.targetObject.PresentationVariant) {
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext, true);
        }
        break;
      case "com.sap.vocabularies.UI.v1.PresentationVariant":
        visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext, true);
        break;
    }
    const chartViz = visualizations.find(viz => {
      return viz.visualization.term === "com.sap.vocabularies.UI.v1.Chart";
    });
    if (chartViz) {
      return chartViz.annotationPath;
    } else {
      // fallback to default Chart if annotation missing in PV
      Log.error(`Bad metapath parameter for chart: ${contextObjectPath.targetObject.term}`);
      return `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    }
  }, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "chartDefinition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "height", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "100%";
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "100%";
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "headerLevel", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return TitleLevel.Auto;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "MULTIPLE";
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "noDataText", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "chartDelegate", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "vizProperties", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "chartActions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "draftSupported", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "autoBindOnInit", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "filter", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "measures", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_applyIdToContent", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "variantSelected", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "variantSaved", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ChartBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZWFzdXJlUm9sZSIsInBlcnNvbmFsaXphdGlvblZhbHVlcyIsInNldEN1c3RvbUFjdGlvblByb3BlcnRpZXMiLCJjaGlsZEFjdGlvbiIsIm1lbnVDb250ZW50QWN0aW9ucyIsImFjdGlvbiIsIm1lbnVBY3Rpb25zIiwiYWN0aW9uS2V5IiwiZ2V0QXR0cmlidXRlIiwicmVwbGFjZSIsImNoaWxkcmVuIiwibGVuZ3RoIiwibG9jYWxOYW1lIiwibmFtZXNwYWNlVVJJIiwiYWN0aW9uc1RvQWRkIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImFwcGx5IiwiYWN0aW9uSWR4IiwicmVkdWNlIiwiY3VzdG9tQWN0aW9uIiwiYWN0VG9BZGQiLCJhY3Rpb25LZXlBZGQiLCJjdXJPdXRPYmplY3QiLCJrZXkiLCJ0ZXh0IiwiX19ub1dyYXAiLCJwcmVzcyIsInJlcXVpcmVzU2VsZWN0aW9uIiwiZW5hYmxlZCIsIk9iamVjdCIsInZhbHVlcyIsIm1hcCIsIm1lbnVJdGVtIiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJhbmNob3IiLCJtZW51IiwiQ2hhcnRCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJibG9ja0V2ZW50IiwiYmxvY2tBZ2dyZWdhdGlvbiIsInByb2Nlc3NBZ2dyZWdhdGlvbnMiLCJwcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJzZXR0aW5ncyIsIl9jb21tYW5kQWN0aW9ucyIsImNyZWF0ZUNoYXJ0RGVmaW5pdGlvbiIsImNvbnZlcnRlckNvbnRleHQiLCJjb250ZXh0T2JqZWN0UGF0aCIsImNvbnRyb2xQYXRoIiwidmlzdWFsaXphdGlvblBhdGgiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwibWV0YVBhdGgiLCJnZXRPYmplY3QiLCIkVHlwZSIsInZpc3VhbGl6YXRpb25zIiwiVmlzdWFsaXphdGlvbnMiLCJjaGVja0NoYXJ0VmlzdWFsaXphdGlvblBhdGgiLCJpbmRleE9mIiwidmlzdWFsaXphdGlvbkRlZmluaXRpb24iLCJnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24iLCJ1c2VDb25kZW5zZWRMYXlvdXQiLCJ1bmRlZmluZWQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImRhdGEiLCJjb250ZXh0UGF0aCIsInVpZCIsIm1vZGVscyIsInNldFByb3BlcnR5IiwiZ2V0Q2hhcnRNZWFzdXJlcyIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiY2hhcnRBbm5vdGF0aW9uUGF0aCIsImNoYXJ0RGVmaW5pdGlvbiIsImFubm90YXRpb25QYXRoIiwic3BsaXQiLCJmaWx0ZXIiLCJpdGVtIiwicG9zIiwidG9TdHJpbmciLCJyZXBsYWNlQWxsIiwib0NoYXJ0IiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0TW9kZWwiLCJ0YXJnZXRPYmplY3QiLCJhZ2dyZWdhdGVkUHJvcGVydHkiLCJnZXRBZ2dyZWdhdGVkUHJvcGVydGllcyIsIm1lYXN1cmVzIiwiYW5ub1BhdGgiLCJnZXRQYXRoIiwiYWdncmVnYXRlZFByb3BlcnRpZXMiLCJjaGFydE1lYXN1cmVzIiwiTWVhc3VyZXMiLCJjaGFydER5bmFtaWNNZWFzdXJlcyIsIkR5bmFtaWNNZWFzdXJlcyIsInRyYW5zQWdnSW5NZWFzdXJlcyIsInByb3BlcnRpZXMiLCJzb21lIiwicHJvcGVydHlNZWFzdXJlVHlwZSIsIk5hbWUiLCJ2YWx1ZSIsImVudGl0eVNldFBhdGgiLCJ0cmFuc0FnZ3JlZ2F0aW9ucyIsInRyYW5zQWdnIiwiY3VzdG9tQWdncmVnYXRpb25zIiwiY3VzdG9tQWdnIiwiTG9nIiwid2FybmluZyIsImlzQ3VzdG9tQWdncmVnYXRlSXNNZWFzdXJlIiwib0NoYXJ0TWVhc3VyZSIsIm9DdXN0b21BZ2dNZWFzdXJlIiwiZ2V0Q3VzdG9tQWdnTWVhc3VyZSIsIkVycm9yIiwiZHluYW1pY01lYXN1cmUiLCJnZXREeW5hbWljTWVhc3VyZXMiLCJjaGFydE1lYXN1cmUiLCJjdXN0b21BZ2dNZWFzdXJlIiwibWVhc3VyZVR5cGUiLCJzZXRDdXN0b21BZ2dNZWFzdXJlIiwic2V0VHJhbnNBZ2dNZWFzdXJlIiwic2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyIsIl9jaGFydCIsIk1lYXN1cmVBdHRyaWJ1dGVzIiwibWVhc3VyZXNNb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJtZWFzdXJlIiwiZXJyb3IiLCJyb2xlIiwibGFiZWwiLCJwcm9wZXJ0eVBhdGgiLCJwdXNoIiwidHJhbnNBZ2dNZWFzdXJlIiwiYWdncmVnYXRpb25NZXRob2QiLCJjaGFydER5bmFtaWNNZWFzdXJlIiwiY2hhcnQiLCJzdGFydHNXaXRoIiwiQWdncmVnYXRhYmxlUHJvcGVydHkiLCJBZ2dyZWdhdGlvbk1ldGhvZCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJMYWJlbCIsIm1lYXN1cmVBdHRyaWJ1dGVzIiwibWVhc3VyZUF0dHJpYnV0ZSIsIl9zZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGUiLCJwYXRoIiwiRHluYW1pY01lYXN1cmUiLCJNZWFzdXJlIiwibWVhc3VyZUF0dHJpYnV0ZURhdGFQb2ludCIsIkRhdGFQb2ludCIsIlJvbGUiLCJkYXRhUG9pbnQiLCJzZXRNZWFzdXJlUm9sZSIsInNldE1lYXN1cmVEYXRhUG9pbnQiLCJWYWx1ZSIsIiRQYXRoIiwiQ2hhcnRIZWxwZXIiLCJmb3JtYXRKU09OVG9TdHJpbmciLCJjcmVhdGVEYXRhUG9pbnRQcm9wZXJ0eSIsImluZGV4IiwiJEVudW1NZW1iZXIiLCJnZXREZXBlbmRlbnRzIiwiY2hhcnRDb250ZXh0IiwiY29tbWFuZEFjdGlvbiIsImdldEFjdGlvbkNvbW1hbmQiLCJ4bWwiLCJjaGVja1BlcnNvbmFsaXphdGlvbkluQ2hhcnRQcm9wZXJ0aWVzIiwib1Byb3BzIiwicGVyc29uYWxpemF0aW9uIiwiam9pbiIsInZlcmlmeVZhbGlkUGVyc29ubGl6YXRpb24iLCJ2YWxpZCIsInNwbGl0QXJyYXkiLCJhY2NlcHRlZFZhbHVlcyIsImZvckVhY2giLCJhcnJheUVsZW1lbnQiLCJpbmNsdWRlcyIsImdldFZhcmlhbnRNYW5hZ2VtZW50Iiwib0NoYXJ0RGVmaW5pdGlvbiIsInZhcmlhbnRNYW5hZ2VtZW50IiwiY3JlYXRlVmFyaWFudE1hbmFnZW1lbnQiLCJnZW5lcmF0ZSIsImlkIiwidmFyaWFudFNlbGVjdGVkIiwiaGVhZGVyTGV2ZWwiLCJ2YXJpYW50U2F2ZWQiLCJnZXRQZXJzaXN0ZW5jZVByb3ZpZGVyIiwicHVzaEFjdGlvbkNvbW1hbmQiLCJhY3Rpb25Db250ZXh0IiwiZGF0YUZpZWxkIiwiY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJvbkV4ZWN1dGVBY3Rpb24iLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uIiwib25FeGVjdXRlSUJOIiwiQ29tbW9uSGVscGVyIiwiZ2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOIiwib25FeGVjdXRlTWFuaWZlc3QiLCJidWlsZEFjdGlvbldyYXBwZXIiLCJkYXRhRmllbGRDb250ZXh0IiwiZGF0YUZpZWxkQWN0aW9uIiwiZ2V0QWN0aW9uQ29udGV4dCIsImlzQm91bmRQYXRoIiwiZ2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZCIsImlzQm91bmQiLCJlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZSIsImdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImNvbnRleHQiLCJpc0FjdGlvbkVuYWJsZWQiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkVuYWJsZWQiLCIkSXNCb3VuZCIsIkFjdGlvbiIsImVuYWJsZU9uU2VsZWN0IiwiaXNJQk5FbmFibGVkIiwiUmVxdWlyZXNDb250ZXh0IiwiYWN0aW9uQ29tbWFuZCIsImdldFZpc2libGUiLCJJc0JvdW5kIiwiZ2V0SXRlbXMiLCJkaW1lbnNpb25zIiwiRGltZW5zaW9ucyIsImZvcm1hdERpbWVuc2lvbnMiLCJkaW1lbnNpb24iLCJnZXRJdGVtIiwiZm9ybWF0TWVhc3VyZXMiLCJjb25jYXQiLCJwcmVmaXgiLCJnZXRUb29sYmFyQWN0aW9ucyIsImFjdGlvbnMiLCJnZXRBY3Rpb25zIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiZ2V0U2VnbWVudGVkQnV0dG9uIiwiY2hhcnRBY3Rpb25zIiwicmVtb3ZlTWVudUl0ZW1zIiwiZ2V0QWN0aW9uIiwiaGFzT3duUHJvcGVydHkiLCJnZXRDdXN0b21BY3Rpb25zIiwic3BsaWNlIiwiYWN0aW9uRW5hYmxlZCIsImdldEFjdGlvblRvb2xiYXJBY3Rpb24iLCJ1bml0dGVzdGlkIiwiYXJpYUhhc1BvcHVwIiwidmlzaWJsZSIsImdldEFjdGlvblRvb2xiYXJNZW51QWN0aW9uIiwidXNlRGVmYXVsdEFjdGlvbk9ubHkiLCJEZWZhdWx0QWN0aW9uSGFuZGxlciIsImdldFVzZURlZmF1bHRBY3Rpb25Pbmx5IiwiYnV0dG9uTW9kZSIsImdldEJ1dHRvbk1vZGUiLCJkZWZhdWx0QWN0aW9uIiwiZ2V0TWVudUl0ZW1Gcm9tTWVudSIsIm1lbnVJdGVtQWN0aW9uIiwicHJlc3NIYW5kbGVyIiwiY29tbWFuZCIsIm5vV3JhcCIsImFNZW51SXRlbXMiLCJpc01lbnVJdGVtIiwiZ2V0TmF2aWdhdGlvbkFjdGlvbnMiLCJnZXRBbm5vdGF0aW9uQWN0aW9ucyIsImFjdGlvbk9iamVjdCIsImdldEFubm90YXRpb25BY3Rpb25zRW5hYmxlZCIsImRhdGFGaWVsZE1vZGVsT2JqZWN0UGF0aCIsImlzRGF0YU1vZGVsT2JqZWN0UGF0aEZvckFjdGlvbldpdGhEaWFsb2ciLCJ0b29sYmFyQWN0aW9uIiwiYnVpbGRBY3Rpb24iLCJhY3Rpb25QcmVzcyIsImdldFNlZ21lbnRlZEJ1dHRvbkl0ZW1zIiwic2VnbWVudGVkQnV0dG9uSXRlbXMiLCJpc0Rlc2t0b3AiLCJnZXRTZWdtZW50ZWRCdXR0b25JdGVtIiwidG9vbHRpcCIsImljb24iLCJoaWRkZW5QYXRoQ29udGV4dCIsImdldEhpZGRlblBhdGhFeHByZXNzaW9uRm9yVGFibGVBY3Rpb25zQW5kSUJOIiwiZ2V0Q29udGV4dFBhdGgiLCJsYXN0SW5kZXhPZiIsImluaXRpYWxDb252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dCIsImdldFZpc3VhbGl6YXRpb25QYXRoIiwiZXh0cmFQYXJhbXMiLCJnZXRFeHRyYVBhcmFtcyIsIkFnZ3JlZ2F0aW9uSGVscGVyIiwiZ2V0RW50aXR5VHlwZSIsIl9jaGFydENvbnRleHQiLCJnZXRVaUNoYXJ0IiwiX2FwcGx5SWRUb0NvbnRlbnQiLCJfYXBpSWQiLCJfY29udGVudElkIiwiZ2V0Q29udGVudElkIiwibmF2aWdhdGlvblBhdGgiLCJhdXRvQmluZE9uSW5pdCIsInZpelByb3BlcnRpZXMiLCJzZWxlY3Rpb25Nb2RlIiwidG9VcHBlckNhc2UiLCJmaWx0ZXJCYXIiLCJmaWx0ZXJJZCIsImRyYWZ0U3VwcG9ydGVkIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0U3VwcG9ydGVkIiwibWV0YU1vZGVsIiwiX2NoYXJ0VHlwZSIsImZvcm1hdENoYXJ0VHlwZSIsIkNoYXJ0VHlwZSIsIm9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImtleXMiLCJjb21tYW5kQWN0aW9ucyIsInByZXNlbnRhdGlvblBhdGgiLCJjcmVhdGVQcmVzZW50YXRpb25QYXRoQ29udGV4dCIsIl9zb3J0Q29uZHRpb25zIiwiZ2V0U29ydENvbmRpdGlvbnMiLCJhcHBseVN1cHBvcnRlZCIsImNoYXJ0QWN0aW9uc0NvbnRleHQiLCJBY3Rpb25zIiwiY29udGV4dFBhdGhDb250ZXh0IiwiY29udGV4dFBhdGhQYXRoIiwidGFyZ2V0Q29sbGVjdGlvblBhdGgiLCJnZXRUYXJnZXRDb2xsZWN0aW9uUGF0aCIsInRhcmdldENvbGxlY3Rpb25QYXRoQ29udGV4dCIsImFjdGlvbnNPYmplY3QiLCJjb252ZXJ0ZWRUeXBlcyIsInJlc29sdmVQYXRoIiwidGFyZ2V0IiwiX2N1c3RvbURhdGEiLCJlbnRpdHlTZXQiLCJlbnRpdHlUeXBlIiwic3RyaW5naWZ5Q3VzdG9tRGF0YSIsIkpTT04iLCJwYXJzZSIsIm11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zIiwiQWN0aW9uSGVscGVyIiwiZ2V0TXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMiLCJzZWdtZW50ZWRCdXR0b25JZCIsIm11bHRpVmlld3MiLCJzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aCIsIl9hY3Rpb25zIiwibWFjcm9JZCIsIm9EYXRhUG9pbnRBbm5vIiwib0RhdGFQb2ludCIsIlRhcmdldFZhbHVlIiwidGFyZ2V0VmFsdWUiLCJGb3JlQ2FzdFZhbHVlIiwiZm9yZUNhc3RWYWx1ZSIsIm9Dcml0aWNhbGl0eSIsIkNyaXRpY2FsaXR5IiwiQ2FsY3VsYXRlZCIsIlN0YXRpYyIsIkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24iLCJvVGhyZXNob2xkcyIsImJDb25zdGFudCIsImJ1aWxkVGhyZXNob2xkcyIsIkNvbnN0YW50VGhyZXNob2xkcyIsIkR5bmFtaWNUaHJlc2hvbGRzIiwiY3JpdGljYWxpdHkiLCJvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsImFLZXlzIiwic0tleSIsImkiLCJqIiwiSW1wcm92ZW1lbnREaXJlY3Rpb24iLCJvRHluYW1pY1RocmVzaG9sZHMiLCJvbmVTdXBwbGllZCIsInVzZWRNZWFzdXJlcyIsIm9Db25zdGFudFRocmVzaG9sZHMiLCJvQWdncmVnYXRpb25MZXZlbCIsIkFnZ3JlZ2F0aW9uTGV2ZWxzIiwiVmlzaWJsZURpbWVuc2lvbnMiLCJvQWdncmVnYXRpb25MZXZlbEluZm8iLCJhVmlzaWJsZURpbWVuc2lvbnMiLCJBZ2dyZWdhdGlvbkxldmVsIiwiJFByb3BlcnR5UGF0aCIsIm5WYWx1ZSIsImdldFRlbXBsYXRlIiwiY2hhcnRkZWxlZ2F0ZSIsIm5vRGF0YVRleHQiLCJnZXRUcmFuc2xhdGVkVGV4dCIsImNoYXJ0RGVsZWdhdGUiLCJiaW5kaW5nIiwiaGVhZGVyIiwiVGl0bGUiLCJzZWxlY3Rpb25DaGFuZ2UiLCJzdGF0ZUNoYW5nZSIsImhlYWRlclZpc2libGUiLCJoZWlnaHQiLCJ3aWR0aCIsIkJ1aWxkaW5nQmxvY2tCYXNlIiwidmlzdWFsaXphdGlvbiIsIiRBbm5vdGF0aW9uUGF0aCIsInRlcm0iLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiUHJlc2VudGF0aW9uVmFyaWFudCIsImdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQiLCJjaGFydFZpeiIsImZpbmQiLCJ2aXoiLCJUaXRsZUxldmVsIiwiQXV0byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnQuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmltaXRpdmVUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgeyBBbmFseXRpY3NBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvcmVBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvcmVcIjtcbmltcG9ydCB0eXBlIHtcblx0Q2hhcnQsXG5cdENoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGUsXG5cdENoYXJ0TWVhc3VyZVJvbGVUeXBlLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRGb3JBY3Rpb24sXG5cdERhdGFQb2ludFxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB1aWQgZnJvbSBcInNhcC9iYXNlL3V0aWwvdWlkXCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0FnZ3JlZ2F0aW9uLCBibG9ja0F0dHJpYnV0ZSwgYmxvY2tFdmVudCwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUsIHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IGlzRGF0YU1vZGVsT2JqZWN0UGF0aEZvckFjdGlvbldpdGhEaWFsb2cgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB0eXBlIHsgQW5ub3RhdGlvbkFjdGlvbiwgQmFzZUFjdGlvbiwgQ3VzdG9tQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgVmlzdWFsaXphdGlvbkFuZFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7XG5cdGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbixcblx0Z2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyByZXNvbHZlQmluZGluZ1N0cmluZyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IEFjdGlvbkhlbHBlciBmcm9tIFwiLi4vaW50ZXJuYWwvaGVscGVycy9BY3Rpb25IZWxwZXJcIjtcbmltcG9ydCBEZWZhdWx0QWN0aW9uSGFuZGxlciBmcm9tIFwiLi4vaW50ZXJuYWwvaGVscGVycy9EZWZhdWx0QWN0aW9uSGFuZGxlclwiO1xuaW1wb3J0IHR5cGUgeyBBY3Rpb24sIEFjdGlvbkdyb3VwIH0gZnJvbSBcIi4vQ2hhcnRBUElcIjtcbmltcG9ydCBDaGFydEhlbHBlciBmcm9tIFwiLi9DaGFydEhlbHBlclwiO1xuXG5jb25zdCBtZWFzdXJlUm9sZTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzMVwiOiBcImF4aXMxXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRNZWFzdXJlUm9sZVR5cGUvQXhpczJcIjogXCJheGlzMlwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0TWVhc3VyZVJvbGVUeXBlL0F4aXMzXCI6IFwiYXhpczNcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzNFwiOiBcImF4aXM0XCJcbn07XG5cbnR5cGUgRXh0ZW5kZWRBY3Rpb25Hcm91cCA9IEFjdGlvbkdyb3VwICYgeyBtZW51Q29udGVudEFjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBBY3Rpb24+IH07XG50eXBlIEFjdGlvbk9yQWN0aW9uR3JvdXAgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpb24gfCBFeHRlbmRlZEFjdGlvbkdyb3VwPjtcbnR5cGUgQ3VzdG9tQW5kQWN0aW9uID0gQ3VzdG9tQWN0aW9uICYgKEFjdGlvbiB8IEFjdGlvbkdyb3VwKTtcbnR5cGUgQ3VzdG9tVG9vbGJhck1lbnVBY3Rpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0dmlzaWJsZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVkOiBzdHJpbmcgfCBib29sZWFuO1xuXHR1c2VEZWZhdWx0QWN0aW9uT25seT86IGJvb2xlYW47XG5cdGJ1dHRvbk1vZGU/OiBzdHJpbmc7XG5cdGRlZmF1bHRBY3Rpb24/OiBzdHJpbmc7XG5cdGFjdGlvbnM/OiBDdXN0b21BY3Rpb247XG59O1xuXG5lbnVtIHBlcnNvbmFsaXphdGlvblZhbHVlcyB7XG5cdFNvcnQgPSBcIlNvcnRcIixcblx0VHlwZSA9IFwiVHlwZVwiLFxuXHRJdGVtID0gXCJJdGVtXCIsXG5cdEZpbHRlciA9IFwiRmlsdGVyXCJcbn1cblxuLyoqXG4gKiBCdWlsZCBhY3Rpb25zIGFuZCBhY3Rpb24gZ3JvdXBzIHdpdGggYWxsIHByb3BlcnRpZXMgZm9yIGNoYXJ0IHZpc3VhbGl6YXRpb24uXG4gKlxuICogQHBhcmFtIGNoaWxkQWN0aW9uIFhNTCBub2RlIGNvcnJlc3BvbmRpbmcgdG8gYWN0aW9uc1xuICogQHJldHVybnMgUHJlcGFyZWQgYWN0aW9uIG9iamVjdFxuICovXG5jb25zdCBzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGNoaWxkQWN0aW9uOiBFbGVtZW50KSB7XG5cdGxldCBtZW51Q29udGVudEFjdGlvbnMgPSBudWxsO1xuXHRjb25zdCBhY3Rpb24gPSBjaGlsZEFjdGlvbjtcblx0bGV0IG1lbnVBY3Rpb25zOiBBY3Rpb25Hcm91cFtdID0gW107XG5cdGNvbnN0IGFjdGlvbktleSA9IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIik/LnJlcGxhY2UoXCJJbmxpbmVYTUxfXCIsIFwiXCIpO1xuXHRpZiAoYWN0aW9uLmNoaWxkcmVuLmxlbmd0aCAmJiBhY3Rpb24ubG9jYWxOYW1lID09PSBcIkFjdGlvbkdyb3VwXCIgJiYgYWN0aW9uLm5hbWVzcGFjZVVSSSA9PT0gXCJzYXAuZmUubWFjcm9zXCIpIHtcblx0XHRjb25zdCBhY3Rpb25zVG9BZGQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYWN0aW9uLmNoaWxkcmVuKTtcblx0XHRsZXQgYWN0aW9uSWR4ID0gMDtcblx0XHRtZW51Q29udGVudEFjdGlvbnMgPSBhY3Rpb25zVG9BZGQucmVkdWNlKChjdXN0b21BY3Rpb24sIGFjdFRvQWRkKSA9PiB7XG5cdFx0XHRjb25zdCBhY3Rpb25LZXlBZGQgPSBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJrZXlcIik/LnJlcGxhY2UoXCJJbmxpbmVYTUxfXCIsIFwiXCIpIHx8IGFjdGlvbktleSArIFwiX01lbnVfXCIgKyBhY3Rpb25JZHg7XG5cdFx0XHRjb25zdCBjdXJPdXRPYmplY3QgPSB7XG5cdFx0XHRcdGtleTogYWN0aW9uS2V5QWRkLFxuXHRcdFx0XHR0ZXh0OiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIpLFxuXHRcdFx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRcdFx0cHJlc3M6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdFx0XHRlbmFibGVkOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIilcblx0XHRcdH07XG5cdFx0XHRjdXN0b21BY3Rpb25bY3VyT3V0T2JqZWN0LmtleV0gPSBjdXJPdXRPYmplY3Q7XG5cdFx0XHRhY3Rpb25JZHgrKztcblx0XHRcdHJldHVybiBjdXN0b21BY3Rpb247XG5cdFx0fSwge30pO1xuXHRcdG1lbnVBY3Rpb25zID0gT2JqZWN0LnZhbHVlcyhtZW51Q29udGVudEFjdGlvbnMpXG5cdFx0XHQuc2xpY2UoLWFjdGlvbi5jaGlsZHJlbi5sZW5ndGgpXG5cdFx0XHQubWFwKGZ1bmN0aW9uIChtZW51SXRlbTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBtZW51SXRlbS5rZXk7XG5cdFx0XHR9KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGtleTogYWN0aW9uS2V5LFxuXHRcdHRleHQ6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIpLFxuXHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRwbGFjZW1lbnQ6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJwbGFjZW1lbnRcIiksXG5cdFx0XHRhbmNob3I6IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJhbmNob3JcIilcblx0XHR9LFxuXHRcdF9fbm9XcmFwOiB0cnVlLFxuXHRcdHByZXNzOiBhY3Rpb24uZ2V0QXR0cmlidXRlKFwicHJlc3NcIiksXG5cdFx0cmVxdWlyZXNTZWxlY3Rpb246IGFjdGlvbi5nZXRBdHRyaWJ1dGUoXCJyZXF1aXJlc1NlbGVjdGlvblwiKSA9PT0gXCJ0cnVlXCIsXG5cdFx0ZW5hYmxlZDogYWN0aW9uLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIikgPT09IG51bGwgPyB0cnVlIDogYWN0aW9uLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIiksXG5cdFx0bWVudTogbWVudUFjdGlvbnMubGVuZ3RoID8gbWVudUFjdGlvbnMgOiBudWxsLFxuXHRcdG1lbnVDb250ZW50QWN0aW9uczogbWVudUNvbnRlbnRBY3Rpb25zXG5cdH07XG59O1xuXG50eXBlIE1lYXN1cmVUeXBlID0ge1xuXHRpZD86IHN0cmluZztcblx0a2V5Pzogc3RyaW5nO1xuXHRyb2xlPzogc3RyaW5nO1xuXHRwcm9wZXJ0eVBhdGg/OiBzdHJpbmc7XG5cdGFnZ3JlZ2F0aW9uTWV0aG9kPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZyB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxQcmltaXRpdmVUeXBlPjtcblx0dmFsdWU/OiBzdHJpbmc7XG5cdGRhdGFQb2ludD86IHN0cmluZztcblx0bmFtZT86IHN0cmluZztcbn07XG5cbnR5cGUgRGltZW5zaW9uVHlwZSA9IHtcblx0aWQ/OiBzdHJpbmc7XG5cdGtleT86IHN0cmluZztcblx0cm9sZT86IHN0cmluZztcblx0cHJvcGVydHlQYXRoPzogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZyB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxQcmltaXRpdmVUeXBlPjtcblx0dmFsdWU/OiBzdHJpbmc7XG59O1xuXG50eXBlIENvbW1hbmRBY3Rpb24gPSB7XG5cdGFjdGlvbkNvbnRleHQ6IENvbnRleHQ7XG5cdG9uRXhlY3V0ZUFjdGlvbjogc3RyaW5nO1xuXHRvbkV4ZWN1dGVJQk4/OiBzdHJpbmc7XG5cdG9uRXhlY3V0ZU1hbmlmZXN0OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcbn07XG5cbnR5cGUgVG9vbEJhckFjdGlvbiA9IHtcblx0dW5pdHRlc3RpZDogc3RyaW5nO1xuXHRpZD86IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0YXJpYUhhc1BvcHVwPzogc3RyaW5nO1xuXHRwcmVzczogc3RyaW5nO1xuXHRlbmFibGVkOiBzdHJpbmcgfCBib29sZWFuO1xuXHR2aXNpYmxlOiBzdHJpbmcgfCBib29sZWFuO1xufTtcblxudHlwZSBDaGFydEN1c3RvbURhdGEgPSB7XG5cdHRhcmdldENvbGxlY3Rpb25QYXRoOiBzdHJpbmc7XG5cdGVudGl0eVNldDogc3RyaW5nO1xuXHRlbnRpdHlUeXBlOiBzdHJpbmc7XG5cdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogc3RyaW5nO1xuXHRtdWx0aVNlbGVjdERpc2FibGVkQWN0aW9uczogc3RyaW5nO1xuXHRzZWdtZW50ZWRCdXR0b25JZDogc3RyaW5nO1xuXHRjdXN0b21BZ2c6IHN0cmluZztcblx0dHJhbnNBZ2c6IHN0cmluZztcblx0YXBwbHlTdXBwb3J0ZWQ6IHN0cmluZztcblx0dml6UHJvcGVydGllczogc3RyaW5nO1xuXHRkcmFmdFN1cHBvcnRlZD86IGJvb2xlYW47XG5cdG11bHRpVmlld3M/OiBib29sZWFuO1xuXHRzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aD86IHN0cmluZztcbn07XG5cbi8qKlxuICpcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIENoYXJ0IGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86Q2hhcnQgaWQ9XCJNeUNoYXJ0XCIgbWV0YVBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgQ2hhcnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJDaGFydFwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhcnRCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIElEIG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0aWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcIm9iamVjdFwiXG5cdH0pXG5cdGNoYXJ0RGVmaW5pdGlvbj86IENoYXJ0VmlzdWFsaXphdGlvbjtcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgcHJlc2VudGF0aW9uIGNvbnRleHQgKFVJLkNoYXJ0IHdpdGggb3Igd2l0aG91dCBhIHF1YWxpZmllcilcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoITogQ29udGV4dDsgLy8gV2UgcmVxdWlyZSBtZXRhUGF0aCB0byBiZSB0aGVyZSBldmVuIHRob3VnaCBpdCBpcyBub3QgZm9ybWFsbHkgcmVxdWlyZWRcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5U2V0IG9yIG5hdmlnYXRpb25Qcm9wZXJ0eVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0OyAvLyBXZSByZXF1aXJlIGNvbnRleHRQYXRoIHRvIGJlIHRoZXJlIGV2ZW4gdGhvdWdoIGl0IGlzIG5vdCBmb3JtYWxseSByZXF1aXJlZFxuXG5cdC8qKlxuXHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGhlaWdodDogc3RyaW5nID0gXCIxMDAlXCI7XG5cblx0LyoqXG5cdCAqIFRoZSB3aWR0aCBvZiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHR3aWR0aDogc3RyaW5nID0gXCIxMDAlXCI7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRoZWFkZXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgY2hhcnQgaGVhZGVyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGhlYWRlclZpc2libGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBcImFyaWEtbGV2ZWxcIiBvZiB0aGUgY2hhcnQgaGVhZGVyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGhlYWRlckxldmVsOiBUaXRsZUxldmVsID0gVGl0bGVMZXZlbC5BdXRvO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIHNlbGVjdGlvbiBtb2RlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0c2VsZWN0aW9uTW9kZTogc3RyaW5nID0gXCJNVUxUSVBMRVwiO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgcGVyc29uYWxpemF0aW9uIG9mIHRoZSBjaGFydFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ3xib29sZWFuXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0cGVyc29uYWxpemF0aW9uPzogc3RyaW5nIHwgYm9vbGVhbjtcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIElEIG9mIHRoZSBmaWx0ZXJiYXIgYXNzb2NpYXRpbmcgaXQgdG8gdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0ZmlsdGVyQmFyPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBcdFBhcmFtZXRlciB3aGljaCBzZXRzIHRoZSBub0RhdGFUZXh0IGZvciB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bm9EYXRhVGV4dD86IHN0cmluZztcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIGNoYXJ0IGRlbGVnYXRlIGZvciB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0Y2hhcnREZWxlZ2F0ZT86IHN0cmluZztcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHZpc3VhbGl6YXRpb24gcHJvcGVydGllcyBmb3IgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpelByb3BlcnRpZXM/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBhY3Rpb25zIHRvIGJlIHNob3duIGluIHRoZSBhY3Rpb24gYXJlYSBvZiB0aGUgY2hhcnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiB9KVxuXHRjaGFydEFjdGlvbnM/OiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGRyYWZ0U3VwcG9ydGVkPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRhdXRvQmluZE9uSW5pdD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHR2aXNpYmxlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bmF2aWdhdGlvblBhdGg/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRmaWx0ZXI/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtZWFzdXJlcz86IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRfYXBwbHlJZFRvQ29udGVudDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHZhcmlhbnRNYW5hZ2VtZW50Pzogc3RyaW5nO1xuXG5cdEBibG9ja0V2ZW50KClcblx0dmFyaWFudFNlbGVjdGVkPzogRnVuY3Rpb247XG5cblx0QGJsb2NrRXZlbnQoKVxuXHR2YXJpYW50U2F2ZWQ/OiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhlIFhNTCBhbmQgbWFuaWZlc3QgYWN0aW9ucyB0byBiZSBzaG93biBpbiB0aGUgYWN0aW9uIGFyZWEgb2YgdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLmNoYXJ0LkFjdGlvbiB8IHNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuY2hhcnQuQWN0aW9uR3JvdXBcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRwcm9jZXNzQWdncmVnYXRpb25zOiBzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzXG5cdH0pXG5cdGFjdGlvbnM/OiBBY3Rpb25PckFjdGlvbkdyb3VwO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiBjaGFydCBzZWxlY3Rpb25zIGFyZSBjaGFuZ2VkLiBUaGUgZXZlbnQgY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGRhdGEgc2VsZWN0ZWQvZGVzZWxlY3RlZCBhbmRcblx0ICogdGhlIEJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGRhdGEgaXMgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZFxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRzZWxlY3Rpb25DaGFuZ2U/OiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc3RhdGVDaGFuZ2UgZXZlbnQgb2YgdGhlIGNoYXJ0LlxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRzdGF0ZUNoYW5nZT86IEZ1bmN0aW9uO1xuXG5cdHVzZUNvbmRlbnNlZExheW91dCE6IGJvb2xlYW47XG5cblx0X2FwaUlkITogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdF9jb250ZW50SWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRfY29tbWFuZEFjdGlvbnM6IENvbW1hbmRBY3Rpb25bXSA9IFtdO1xuXG5cdF9jaGFydFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRfc29ydENvbmR0aW9uczogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdF9jdXN0b21EYXRhOiBDaGFydEN1c3RvbURhdGE7XG5cblx0X2FjdGlvbnM6IHN0cmluZztcblxuXHRfY2hhcnRDb250ZXh0OiBDb250ZXh0O1xuXG5cdF9jaGFydDogQ2hhcnQ7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxDaGFydEJsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBzZXR0aW5nczogYW55KSB7XG5cdFx0c3VwZXIocHJvcHMsIGNvbmZpZ3VyYXRpb24sIHNldHRpbmdzKTtcblx0XHRjb25zdCBjb250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBpbml0aWFsQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChjb250ZXh0T2JqZWN0UGF0aCwgLyp0aGlzLmNvbnRleHRQYXRoKi8gdW5kZWZpbmVkLCBzZXR0aW5ncyk7XG5cdFx0Y29uc3QgdmlzdWFsaXphdGlvblBhdGggPSBDaGFydEJsb2NrLmdldFZpc3VhbGl6YXRpb25QYXRoKHRoaXMsIGNvbnRleHRPYmplY3RQYXRoLCBpbml0aWFsQ29udmVydGVyQ29udGV4dCk7XG5cdFx0Y29uc3QgZXh0cmFQYXJhbXMgPSBDaGFydEJsb2NrLmdldEV4dHJhUGFyYW1zKHRoaXMsIHZpc3VhbGl6YXRpb25QYXRoKTtcblx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KGNvbnRleHRPYmplY3RQYXRoLCAvKnRoaXMuY29udGV4dFBhdGgqLyB1bmRlZmluZWQsIHNldHRpbmdzLCBleHRyYVBhcmFtcyk7XG5cblx0XHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0dGhpcy5fY2hhcnRDb250ZXh0ID0gQ2hhcnRIZWxwZXIuZ2V0VWlDaGFydCh0aGlzLm1ldGFQYXRoKSEgYXMgQ29udGV4dDtcblx0XHR0aGlzLl9jaGFydCA9IHRoaXMuX2NoYXJ0Q29udGV4dC5nZXRPYmplY3QoKSBhcyBDaGFydDtcblxuXHRcdGlmICh0aGlzLl9hcHBseUlkVG9Db250ZW50ID8/IGZhbHNlKSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuaWQgKyBcIjo6Q2hhcnRcIjtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuaWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZDtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuZ2V0Q29udGVudElkKHRoaXMuaWQhKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fY2hhcnQpIHtcblx0XHRcdHRoaXMuY2hhcnREZWZpbml0aW9uID1cblx0XHRcdFx0dGhpcy5jaGFydERlZmluaXRpb24gPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNoYXJ0RGVmaW5pdGlvbiA9PT0gbnVsbFxuXHRcdFx0XHRcdD8gdGhpcy5jcmVhdGVDaGFydERlZmluaXRpb24oY29udmVydGVyQ29udGV4dCwgY29udGV4dE9iamVjdFBhdGgsIHRoaXMuX2NoYXJ0Q29udGV4dC5nZXRQYXRoKCkpXG5cdFx0XHRcdFx0OiB0aGlzLmNoYXJ0RGVmaW5pdGlvbjtcblxuXHRcdFx0Ly8gQVBJIFByb3BlcnRpZXNcblx0XHRcdHRoaXMubmF2aWdhdGlvblBhdGggPSB0aGlzLmNoYXJ0RGVmaW5pdGlvbi5uYXZpZ2F0aW9uUGF0aDtcblx0XHRcdHRoaXMuYXV0b0JpbmRPbkluaXQgPSB0aGlzLmNoYXJ0RGVmaW5pdGlvbi5hdXRvQmluZE9uSW5pdDtcblx0XHRcdHRoaXMudml6UHJvcGVydGllcyA9IHRoaXMuY2hhcnREZWZpbml0aW9uLnZpelByb3BlcnRpZXM7XG5cdFx0XHR0aGlzLmNoYXJ0QWN0aW9ucyA9IHRoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQodGhpcy5jaGFydERlZmluaXRpb24uYWN0aW9ucywgc2V0dGluZ3MpO1xuXHRcdFx0dGhpcy5zZWxlY3Rpb25Nb2RlID0gdGhpcy5zZWxlY3Rpb25Nb2RlLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRpZiAodGhpcy5maWx0ZXJCYXIpIHtcblx0XHRcdFx0dGhpcy5maWx0ZXIgPSB0aGlzLmdldENvbnRlbnRJZCh0aGlzLmZpbHRlckJhcik7XG5cdFx0XHR9IGVsc2UgaWYgKCF0aGlzLmZpbHRlcikge1xuXHRcdFx0XHR0aGlzLmZpbHRlciA9IHRoaXMuY2hhcnREZWZpbml0aW9uLmZpbHRlcklkO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jaGVja1BlcnNvbmFsaXphdGlvbkluQ2hhcnRQcm9wZXJ0aWVzKHRoaXMpO1xuXHRcdFx0dGhpcy52YXJpYW50TWFuYWdlbWVudCA9IHRoaXMuZ2V0VmFyaWFudE1hbmFnZW1lbnQodGhpcywgdGhpcy5jaGFydERlZmluaXRpb24pO1xuXHRcdFx0dGhpcy52aXNpYmxlID0gdGhpcy5jaGFydERlZmluaXRpb24udmlzaWJsZTtcblx0XHRcdGxldCBjb250ZXh0UGF0aCA9IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdFx0Y29udGV4dFBhdGggPSBjb250ZXh0UGF0aFtjb250ZXh0UGF0aC5sZW5ndGggLSAxXSA9PT0gXCIvXCIgPyBjb250ZXh0UGF0aC5zbGljZSgwLCAtMSkgOiBjb250ZXh0UGF0aDtcblx0XHRcdHRoaXMuZHJhZnRTdXBwb3J0ZWQgPSBNb2RlbEhlbHBlci5pc0RyYWZ0U3VwcG9ydGVkKHNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsIGNvbnRleHRQYXRoKTtcblx0XHRcdHRoaXMuX2NoYXJ0VHlwZSA9IENoYXJ0SGVscGVyLmZvcm1hdENoYXJ0VHlwZSh0aGlzLl9jaGFydC5DaGFydFR5cGUpO1xuXG5cdFx0XHRjb25zdCBvcGVyYXRpb25BdmFpbGFibGVNYXAgPSBDaGFydEhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAodGhpcy5fY2hhcnQsIHtcblx0XHRcdFx0Y29udGV4dDogdGhpcy5fY2hhcnRDb250ZXh0XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuY2hhcnREZWZpbml0aW9uPy5jb21tYW5kQWN0aW9ucyBhcyBvYmplY3QpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0T2JqZWN0LmtleXModGhpcy5jaGFydERlZmluaXRpb24/LmNvbW1hbmRBY3Rpb25zIGFzIG9iamVjdCkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRjb25zdCBhY3Rpb24gPSB0aGlzLmNoYXJ0RGVmaW5pdGlvbj8uY29tbWFuZEFjdGlvbnNba2V5XTtcblx0XHRcdFx0XHRjb25zdCBhY3Rpb25Db250ZXh0ID0gdGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24hLCBzZXR0aW5ncyk7XG5cdFx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkQ29udGV4dCA9XG5cdFx0XHRcdFx0XHRhY3Rpb24hLmFubm90YXRpb25QYXRoICYmIHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24hLmFubm90YXRpb25QYXRoKTtcblx0XHRcdFx0XHRjb25zdCBkYXRhRmllbGQgPSBkYXRhRmllbGRDb250ZXh0ICYmIGRhdGFGaWVsZENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0Y29uc3QgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgPSBlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZShvcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdFx0XHRcdHRoaXMucHVzaEFjdGlvbkNvbW1hbmQoYWN0aW9uQ29udGV4dCwgZGF0YUZpZWxkLCBjaGFydE9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgYWN0aW9uISk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5tZWFzdXJlcyA9IHRoaXMuZ2V0Q2hhcnRNZWFzdXJlcyh0aGlzLCBhZ2dyZWdhdGlvbkhlbHBlcik7XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb25QYXRoID0gQ29tbW9uSGVscGVyLmNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0KHRoaXMubWV0YVBhdGgpO1xuXHRcdFx0dGhpcy5fc29ydENvbmR0aW9ucyA9IENoYXJ0SGVscGVyLmdldFNvcnRDb25kaXRpb25zKFxuXHRcdFx0XHR0aGlzLm1ldGFQYXRoLFxuXHRcdFx0XHR0aGlzLm1ldGFQYXRoLmdldE9iamVjdCgpLFxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoLmdldFBhdGgoKSxcblx0XHRcdFx0dGhpcy5jaGFydERlZmluaXRpb24uYXBwbHlTdXBwb3J0ZWRcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBjaGFydEFjdGlvbnNDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aFxuXHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHQuY3JlYXRlQmluZGluZ0NvbnRleHQodGhpcy5fY2hhcnRDb250ZXh0LmdldFBhdGgoKSArIFwiL0FjdGlvbnNcIiwgdGhpcy5fY2hhcnQuQWN0aW9ucyBhcyB1bmtub3duIGFzIENvbnRleHQpO1xuXHRcdFx0Y29uc3QgY29udGV4dFBhdGhDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdGNvbnN0IGNvbnRleHRQYXRoUGF0aCA9IENvbW1vbkhlbHBlci5nZXRDb250ZXh0UGF0aCh0aGlzLmNvbnRleHRQYXRoLCB7IGNvbnRleHQ6IGNvbnRleHRQYXRoQ29udGV4dCB9KTtcblx0XHRcdGNvbnN0IHRhcmdldENvbGxlY3Rpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldFRhcmdldENvbGxlY3Rpb25QYXRoKHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdFx0Y29uc3QgdGFyZ2V0Q29sbGVjdGlvblBhdGhDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHRhcmdldENvbGxlY3Rpb25QYXRoLCB0aGlzLmNvbnRleHRQYXRoKSE7XG5cdFx0XHRjb25zdCBhY3Rpb25zT2JqZWN0ID0gY29udGV4dE9iamVjdFBhdGguY29udmVydGVkVHlwZXMucmVzb2x2ZVBhdGgoY2hhcnRBY3Rpb25zQ29udGV4dC5nZXRQYXRoKCkpPy50YXJnZXQ7XG5cblx0XHRcdHRoaXMuX2N1c3RvbURhdGEgPSB7XG5cdFx0XHRcdHRhcmdldENvbGxlY3Rpb25QYXRoOiBjb250ZXh0UGF0aFBhdGgsXG5cdFx0XHRcdGVudGl0eVNldDpcblx0XHRcdFx0XHR0eXBlb2YgdGFyZ2V0Q29sbGVjdGlvblBhdGhDb250ZXh0LmdldE9iamVjdCgpID09PSBcInN0cmluZ1wiXG5cdFx0XHRcdFx0XHQ/IHRhcmdldENvbGxlY3Rpb25QYXRoQ29udGV4dC5nZXRPYmplY3QoKVxuXHRcdFx0XHRcdFx0OiB0YXJnZXRDb2xsZWN0aW9uUGF0aENvbnRleHQuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIiksXG5cdFx0XHRcdGVudGl0eVR5cGU6IGNvbnRleHRQYXRoUGF0aCArIFwiL1wiLFxuXHRcdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IENvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKEpTT04ucGFyc2Uob3BlcmF0aW9uQXZhaWxhYmxlTWFwKSksXG5cdFx0XHRcdG11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zOiBBY3Rpb25IZWxwZXIuZ2V0TXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMoYWN0aW9uc09iamVjdCBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzW10pICsgXCJcIixcblx0XHRcdFx0c2VnbWVudGVkQnV0dG9uSWQ6IGdlbmVyYXRlKFt0aGlzLmlkLCBcIlNlZ21lbnRlZEJ1dHRvblwiLCBcIlRlbXBsYXRlQ29udGVudFZpZXdcIl0pLFxuXHRcdFx0XHRjdXN0b21BZ2c6IENvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHRoaXMuY2hhcnREZWZpbml0aW9uPy5jdXN0b21BZ2cpLFxuXHRcdFx0XHR0cmFuc0FnZzogQ29tbW9uSGVscGVyLnN0cmluZ2lmeUN1c3RvbURhdGEodGhpcy5jaGFydERlZmluaXRpb24/LnRyYW5zQWdnKSxcblx0XHRcdFx0YXBwbHlTdXBwb3J0ZWQ6IENvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHRoaXMuY2hhcnREZWZpbml0aW9uPy5hcHBseVN1cHBvcnRlZCksXG5cdFx0XHRcdHZpelByb3BlcnRpZXM6IHRoaXMudml6UHJvcGVydGllcyxcblx0XHRcdFx0ZHJhZnRTdXBwb3J0ZWQ6IHRoaXMuZHJhZnRTdXBwb3J0ZWQsXG5cdFx0XHRcdG11bHRpVmlld3M6IHRoaXMuY2hhcnREZWZpbml0aW9uPy5tdWx0aVZpZXdzLFxuXHRcdFx0XHRzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aDogQ29tbW9uSGVscGVyLnN0cmluZ2lmeUN1c3RvbURhdGEoe1xuXHRcdFx0XHRcdGRhdGE6IHRoaXMuY2hhcnREZWZpbml0aW9uPy5zZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aFxuXHRcdFx0XHR9KVxuXHRcdFx0fTtcblx0XHRcdHRoaXMuX2FjdGlvbnMgPSB0aGlzLmNoYXJ0QWN0aW9ucyA/IHRoaXMuZ2V0VG9vbGJhckFjdGlvbnModGhpcy5fY2hhcnRDb250ZXh0KSA6IHhtbGBgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBmYWxsYmFjayB0byBkaXNwbGF5IGVtcHR5IGNoYXJ0XG5cdFx0XHR0aGlzLmF1dG9CaW5kT25Jbml0ID0gZmFsc2U7XG5cdFx0XHR0aGlzLnZpc2libGUgPSBcInRydWVcIjtcblx0XHRcdHRoaXMubmF2aWdhdGlvblBhdGggPSBcIlwiO1xuXHRcdFx0dGhpcy5fYWN0aW9ucyA9IFwiXCI7XG5cdFx0XHR0aGlzLl9jdXN0b21EYXRhID0ge1xuXHRcdFx0XHR0YXJnZXRDb2xsZWN0aW9uUGF0aDogXCJcIixcblx0XHRcdFx0ZW50aXR5U2V0OiBcIlwiLFxuXHRcdFx0XHRlbnRpdHlUeXBlOiBcIlwiLFxuXHRcdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IFwiXCIsXG5cdFx0XHRcdG11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zOiBcIlwiLFxuXHRcdFx0XHRzZWdtZW50ZWRCdXR0b25JZDogXCJcIixcblx0XHRcdFx0Y3VzdG9tQWdnOiBcIlwiLFxuXHRcdFx0XHR0cmFuc0FnZzogXCJcIixcblx0XHRcdFx0YXBwbHlTdXBwb3J0ZWQ6IFwiXCIsXG5cdFx0XHRcdHZpelByb3BlcnRpZXM6IFwiXCJcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0Y3JlYXRlQ2hhcnREZWZpbml0aW9uID0gKFxuXHRcdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdFx0Y29udGV4dE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0Y29udHJvbFBhdGg6IHN0cmluZ1xuXHQpOiBDaGFydFZpc3VhbGl6YXRpb24gPT4ge1xuXHRcdGxldCB2aXN1YWxpemF0aW9uUGF0aCA9IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgoY29udGV4dE9iamVjdFBhdGgpO1xuXHRcdGlmICh0aGlzLm1ldGFQYXRoPy5nZXRPYmplY3QoKT8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlByZXNlbnRhdGlvblZhcmlhbnRUeXBlKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9IHRoaXMubWV0YVBhdGguZ2V0T2JqZWN0KCkuVmlzdWFsaXphdGlvbnM7XG5cdFx0XHR2aXN1YWxpemF0aW9uUGF0aCA9IENoYXJ0QmxvY2suY2hlY2tDaGFydFZpc3VhbGl6YXRpb25QYXRoKHZpc3VhbGl6YXRpb25zLCB2aXN1YWxpemF0aW9uUGF0aCk7XG5cdFx0fVxuXG5cdFx0Ly8gZmFsbGJhY2sgdG8gZGVmYXVsdCBDaGFydCBpZiB2aXN1YWxpemF0aW9uUGF0aCBpcyBtaXNzaW5nIG9yIHZpc3VhbGl6YXRpb25QYXRoIGlzIG5vdCBmb3VuZCBpbiBjb250cm9sIChpbiBjYXNlIG9mIFByZXNlbnRhdGlvblZhcmlhbnQpXG5cdFx0aWYgKCF2aXN1YWxpemF0aW9uUGF0aCB8fCBjb250cm9sUGF0aC5pbmRleE9mKHZpc3VhbGl6YXRpb25QYXRoKSA9PT0gLTEpIHtcblx0XHRcdHZpc3VhbGl6YXRpb25QYXRoID0gYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWA7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdHRoaXMudXNlQ29uZGVuc2VkTGF5b3V0LFxuXHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHRydWVcblx0XHQpO1xuXHRcdHJldHVybiB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBDaGFydFZpc3VhbGl6YXRpb247XG5cdH07XG5cblx0c3RhdGljIGNoZWNrQ2hhcnRWaXN1YWxpemF0aW9uUGF0aCA9ICh2aXN1YWxpemF0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPltdLCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSA9PiB7XG5cdFx0dmlzdWFsaXphdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmlzdWFsaXphdGlvbjogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuXHRcdFx0aWYgKHZpc3VhbGl6YXRpb24uJEFubm90YXRpb25QYXRoLmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWApID4gLTEpIHtcblx0XHRcdFx0dmlzdWFsaXphdGlvblBhdGggPSB2aXN1YWxpemF0aW9uLiRBbm5vdGF0aW9uUGF0aDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdmlzdWFsaXphdGlvblBhdGg7XG5cdH07XG5cblx0Z2V0Q29udGVudElkKG1hY3JvSWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBgJHttYWNyb0lkfS1jb250ZW50YDtcblx0fVxuXG5cdHN0YXRpYyBnZXRFeHRyYVBhcmFtcyhwcm9wczogUHJvcGVydGllc09mPENoYXJ0QmxvY2s+LCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3QgZXh0cmFQYXJhbXM6IFJlY29yZDxzdHJpbmcsIG9iamVjdD4gPSB7fTtcblx0XHRpZiAocHJvcHMuYWN0aW9ucykge1xuXHRcdFx0T2JqZWN0LnZhbHVlcyhwcm9wcy5hY3Rpb25zKT8uZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRwcm9wcy5hY3Rpb25zID0geyAuLi4ocHJvcHMuYWN0aW9ucyBhcyBBY3Rpb25PckFjdGlvbkdyb3VwKSwgLi4uKGl0ZW0gYXMgRXh0ZW5kZWRBY3Rpb25Hcm91cCkubWVudUNvbnRlbnRBY3Rpb25zIH07XG5cdFx0XHRcdGRlbGV0ZSAoaXRlbSBhcyBFeHRlbmRlZEFjdGlvbkdyb3VwKS5tZW51Q29udGVudEFjdGlvbnM7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKHZpc3VhbGl6YXRpb25QYXRoKSB7XG5cdFx0XHRleHRyYVBhcmFtc1t2aXN1YWxpemF0aW9uUGF0aF0gPSB7XG5cdFx0XHRcdGFjdGlvbnM6IHByb3BzLmFjdGlvbnNcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiBleHRyYVBhcmFtcztcblx0fVxuXG5cdGNyZWF0ZUJpbmRpbmdDb250ZXh0ID0gZnVuY3Rpb24gKGRhdGE6IG9iamVjdCB8IEJhc2VBY3Rpb25bXSB8IEN1c3RvbUFjdGlvbiwgc2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoID0gYC8ke3VpZCgpfWA7XG5cdFx0c2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuc2V0UHJvcGVydHkoY29udGV4dFBhdGgsIGRhdGEpO1xuXHRcdHJldHVybiBzZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5jcmVhdGVCaW5kaW5nQ29udGV4dChjb250ZXh0UGF0aCk7XG5cdH07XG5cblx0Z2V0Q2hhcnRNZWFzdXJlcyA9IChwcm9wczogYW55LCBhZ2dyZWdhdGlvbkhlbHBlcjogQWdncmVnYXRpb25IZWxwZXIpOiBDb250ZXh0ID0+IHtcblx0XHRjb25zdCBjaGFydEFubm90YXRpb25QYXRoID0gcHJvcHMuY2hhcnREZWZpbml0aW9uLmFubm90YXRpb25QYXRoLnNwbGl0KFwiL1wiKTtcblx0XHQvLyB0aGlzIGlzIHJlcXVpcmVkIGJlY2F1c2UgZ2V0QWJzb2x1dGVQYXRoIGluIGNvbnZlcnRlckNvbnRleHQgcmV0dXJucyBcIi9TYWxlc09yZGVyTWFuYWdlL19JdGVtL19JdGVtL0Bjb20uc2FwLnZvY2FidWxhcmllcy52MS5DaGFydFwiIGFzIGFubm90YXRpb25QYXRoXG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSBjaGFydEFubm90YXRpb25QYXRoXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtOiBvYmplY3QsIHBvczogbnVtYmVyKSB7XG5cdFx0XHRcdHJldHVybiBjaGFydEFubm90YXRpb25QYXRoLmluZGV4T2YoaXRlbSkgPT0gcG9zO1xuXHRcdFx0fSlcblx0XHRcdC50b1N0cmluZygpXG5cdFx0XHQucmVwbGFjZUFsbChcIixcIiwgXCIvXCIpO1xuXHRcdGNvbnN0IG9DaGFydCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhcblx0XHRcdHRoaXMubWV0YVBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhbm5vdGF0aW9uUGF0aCksXG5cdFx0XHR0aGlzLmNvbnRleHRQYXRoXG5cdFx0KS50YXJnZXRPYmplY3Q7XG5cdFx0Y29uc3QgYWdncmVnYXRlZFByb3BlcnR5ID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydHlcIik7XG5cdFx0bGV0IG1lYXN1cmVzOiBNZWFzdXJlVHlwZVtdID0gW107XG5cdFx0Y29uc3QgYW5ub1BhdGggPSBwcm9wcy5tZXRhUGF0aC5nZXRQYXRoKCk7XG5cdFx0Y29uc3QgYWdncmVnYXRlZFByb3BlcnRpZXMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBZ2dyZWdhdGVkUHJvcGVydGllcyhcIkFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXCIpO1xuXHRcdGNvbnN0IGNoYXJ0TWVhc3VyZXMgPSBvQ2hhcnQuTWVhc3VyZXMgPyBvQ2hhcnQuTWVhc3VyZXMgOiBbXTtcblx0XHRjb25zdCBjaGFydER5bmFtaWNNZWFzdXJlcyA9IG9DaGFydC5EeW5hbWljTWVhc3VyZXMgPyBvQ2hhcnQuRHluYW1pY01lYXN1cmVzIDogW107XG5cdFx0Ly9jaGVjayBpZiB0aGVyZSBhcmUgbWVhc3VyZXMgcG9pbnRpbmcgdG8gYWdncmVnYXRlZHByb3BlcnRpZXNcblx0XHRjb25zdCB0cmFuc0FnZ0luTWVhc3VyZXMgPSBhZ2dyZWdhdGVkUHJvcGVydGllc1swXVxuXHRcdFx0PyBhZ2dyZWdhdGVkUHJvcGVydGllc1swXS5maWx0ZXIoZnVuY3Rpb24gKHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcblx0XHRcdFx0XHRyZXR1cm4gY2hhcnRNZWFzdXJlcy5zb21lKGZ1bmN0aW9uIChwcm9wZXJ0eU1lYXN1cmVUeXBlOiBNZWFzdXJlVHlwZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHByb3BlcnRpZXMuTmFtZSA9PT0gcHJvcGVydHlNZWFzdXJlVHlwZS52YWx1ZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdCAgfSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGVudGl0eVNldFBhdGggPSBhbm5vUGF0aC5yZXBsYWNlKFxuXHRcdFx0L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS4oQ2hhcnR8UHJlc2VudGF0aW9uVmFyaWFudHxTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KS4qLyxcblx0XHRcdFwiXCJcblx0XHQpO1xuXHRcdGNvbnN0IHRyYW5zQWdncmVnYXRpb25zID0gcHJvcHMuY2hhcnREZWZpbml0aW9uLnRyYW5zQWdnO1xuXHRcdGNvbnN0IGN1c3RvbUFnZ3JlZ2F0aW9ucyA9IHByb3BzLmNoYXJ0RGVmaW5pdGlvbi5jdXN0b21BZ2c7XG5cdFx0Ly8gaW50aW1hdGUgdGhlIHVzZXIgaWYgdGhlcmUgaXMgQWdncmVnYXRlZHByb3BlcnR5IGNvbmZpZ3VyZWQgd2l0aCBubyBEWW5hbWljTWVhc3VyZXMsIGJ1IHRoZXJlIGFyZSBtZWFzdXJlcyB3aXRoIEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXG5cdFx0aWYgKGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5sZW5ndGggPiAwICYmICFjaGFydER5bmFtaWNNZWFzdXJlcyAmJiB0cmFuc0FnZ0luTWVhc3VyZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFwiVGhlIHRyYW5zZm9ybWF0aW9uYWwgYWdncmVnYXRlIG1lYXN1cmVzIGFyZSBjb25maWd1cmVkIGFzIENoYXJ0Lk1lYXN1cmVzIGJ1dCBzaG91bGQgYmUgY29uZmlndXJlZCBhcyBDaGFydC5EeW5hbWljTWVhc3VyZXMgaW5zdGVhZC4gUGxlYXNlIGNoZWNrIHRoZSBTQVAgSGVscCBkb2N1bWVudGF0aW9uIGFuZCBjb3JyZWN0IHRoZSBjb25maWd1cmF0aW9uIGFjY29yZGluZ2x5LlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRjb25zdCBpc0N1c3RvbUFnZ3JlZ2F0ZUlzTWVhc3VyZSA9IGNoYXJ0TWVhc3VyZXMuc29tZSgob0NoYXJ0TWVhc3VyZTogTWVhc3VyZVR5cGUpID0+IHtcblx0XHRcdGNvbnN0IG9DdXN0b21BZ2dNZWFzdXJlID0gdGhpcy5nZXRDdXN0b21BZ2dNZWFzdXJlKGN1c3RvbUFnZ3JlZ2F0aW9ucywgb0NoYXJ0TWVhc3VyZSk7XG5cdFx0XHRyZXR1cm4gISFvQ3VzdG9tQWdnTWVhc3VyZTtcblx0XHR9KTtcblx0XHRpZiAoYWdncmVnYXRlZFByb3BlcnR5Lmxlbmd0aCA+IDAgJiYgIWNoYXJ0RHluYW1pY01lYXN1cmVzLmxlbmd0aCAmJiAhaXNDdXN0b21BZ2dyZWdhdGVJc01lYXN1cmUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBjb25maWd1cmUgRHluYW1pY01lYXN1cmVzIGZvciB0aGUgY2hhcnRcIik7XG5cdFx0fVxuXHRcdGlmIChhZ2dyZWdhdGVkUHJvcGVydHkubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yIChjb25zdCBkeW5hbWljTWVhc3VyZSBvZiBjaGFydER5bmFtaWNNZWFzdXJlcykge1xuXHRcdFx0XHRtZWFzdXJlcyA9IHRoaXMuZ2V0RHluYW1pY01lYXN1cmVzKG1lYXN1cmVzLCBkeW5hbWljTWVhc3VyZSwgZW50aXR5U2V0UGF0aCwgb0NoYXJ0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yIChjb25zdCBjaGFydE1lYXN1cmUgb2YgY2hhcnRNZWFzdXJlcykge1xuXHRcdFx0Y29uc3Qga2V5ID0gY2hhcnRNZWFzdXJlLnZhbHVlO1xuXHRcdFx0Y29uc3QgY3VzdG9tQWdnTWVhc3VyZSA9IHRoaXMuZ2V0Q3VzdG9tQWdnTWVhc3VyZShjdXN0b21BZ2dyZWdhdGlvbnMsIGNoYXJ0TWVhc3VyZSk7XG5cdFx0XHRjb25zdCBtZWFzdXJlVHlwZTogTWVhc3VyZVR5cGUgPSB7fTtcblx0XHRcdGlmIChjdXN0b21BZ2dNZWFzdXJlKSB7XG5cdFx0XHRcdG1lYXN1cmVzID0gdGhpcy5zZXRDdXN0b21BZ2dNZWFzdXJlKG1lYXN1cmVzLCBtZWFzdXJlVHlwZSwgY3VzdG9tQWdnTWVhc3VyZSwga2V5KTtcblx0XHRcdFx0Ly9pZiB0aGVyZSBpcyBuZWl0aGVyIGFnZ3JlZ2F0ZWRQcm9wZXJ0eSBub3IgbWVhc3VyZXMgcG9pbnRpbmcgdG8gY3VzdG9tQWdncmVnYXRlcywgYnV0IHdlIGhhdmUgbm9ybWFsIG1lYXN1cmVzLiBOb3cgY2hlY2sgaWYgdGhlc2UgbWVhc3VyZXMgYXJlIHBhcnQgb2YgQWdncmVnYXRlZFByb3BlcnRpZXMgT2JqXG5cdFx0XHR9IGVsc2UgaWYgKGFnZ3JlZ2F0ZWRQcm9wZXJ0eS5sZW5ndGggPT09IDAgJiYgdHJhbnNBZ2dyZWdhdGlvbnNba2V5XSkge1xuXHRcdFx0XHRtZWFzdXJlcyA9IHRoaXMuc2V0VHJhbnNBZ2dNZWFzdXJlKG1lYXN1cmVzLCBtZWFzdXJlVHlwZSwgdHJhbnNBZ2dyZWdhdGlvbnMsIGtleSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnNldENoYXJ0TWVhc3VyZUF0dHJpYnV0ZXModGhpcy5fY2hhcnQuTWVhc3VyZUF0dHJpYnV0ZXMsIGVudGl0eVNldFBhdGgsIG1lYXN1cmVUeXBlKTtcblx0XHR9XG5cdFx0Y29uc3QgbWVhc3VyZXNNb2RlbDogSlNPTk1vZGVsID0gbmV3IEpTT05Nb2RlbChtZWFzdXJlcyk7XG5cdFx0KG1lYXN1cmVzTW9kZWwgYXMgYW55KS4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gbWVhc3VyZXNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dDtcblx0fTtcblxuXHRzZXRDdXN0b21BZ2dNZWFzdXJlID0gKG1lYXN1cmVzOiBNZWFzdXJlVHlwZVtdLCBtZWFzdXJlOiBNZWFzdXJlVHlwZSwgY3VzdG9tQWdnTWVhc3VyZTogTWVhc3VyZVR5cGUsIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0aWYgKGtleS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRMb2cuZXJyb3IoYCRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIE1lYXN1cmU6ICR7a2V5fSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkYCk7XG5cdFx0fVxuXHRcdG1lYXN1cmUua2V5ID0gY3VzdG9tQWdnTWVhc3VyZS52YWx1ZTtcblx0XHRtZWFzdXJlLnJvbGUgPSBcImF4aXMxXCI7XG5cdFx0bWVhc3VyZS5sYWJlbCA9IGN1c3RvbUFnZ01lYXN1cmUubGFiZWw7XG5cdFx0bWVhc3VyZS5wcm9wZXJ0eVBhdGggPSBjdXN0b21BZ2dNZWFzdXJlLnZhbHVlO1xuXHRcdG1lYXN1cmVzLnB1c2gobWVhc3VyZSk7XG5cdFx0cmV0dXJuIG1lYXN1cmVzO1xuXHR9O1xuXG5cdHNldFRyYW5zQWdnTWVhc3VyZSA9IChtZWFzdXJlczogTWVhc3VyZVR5cGVbXSwgbWVhc3VyZTogTWVhc3VyZVR5cGUsIHRyYW5zQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBNZWFzdXJlVHlwZT4sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0Y29uc3QgdHJhbnNBZ2dNZWFzdXJlID0gdHJhbnNBZ2dyZWdhdGlvbnNba2V5XTtcblx0XHRtZWFzdXJlLmtleSA9IHRyYW5zQWdnTWVhc3VyZS5uYW1lO1xuXHRcdG1lYXN1cmUucm9sZSA9IFwiYXhpczFcIjtcblx0XHRtZWFzdXJlLnByb3BlcnR5UGF0aCA9IGtleTtcblx0XHRtZWFzdXJlLmFnZ3JlZ2F0aW9uTWV0aG9kID0gdHJhbnNBZ2dNZWFzdXJlLmFnZ3JlZ2F0aW9uTWV0aG9kO1xuXHRcdG1lYXN1cmUubGFiZWwgPSB0cmFuc0FnZ01lYXN1cmUubGFiZWwgfHwgbWVhc3VyZS5sYWJlbDtcblx0XHRtZWFzdXJlcy5wdXNoKG1lYXN1cmUpO1xuXHRcdHJldHVybiBtZWFzdXJlcztcblx0fTtcblxuXHRnZXREeW5hbWljTWVhc3VyZXMgPSAoXG5cdFx0bWVhc3VyZXM6IE1lYXN1cmVUeXBlW10sXG5cdFx0Y2hhcnREeW5hbWljTWVhc3VyZTogTWVhc3VyZVR5cGUsXG5cdFx0ZW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRcdGNoYXJ0OiBDaGFydFxuXHQpOiBNZWFzdXJlVHlwZVtdID0+IHtcblx0XHRjb25zdCBrZXkgPSBjaGFydER5bmFtaWNNZWFzdXJlLnZhbHVlIHx8IFwiXCI7XG5cdFx0Y29uc3QgYWdncmVnYXRlZFByb3BlcnR5ID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKFxuXHRcdFx0dGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGVudGl0eVNldFBhdGggKyBrZXkpLFxuXHRcdFx0dGhpcy5jb250ZXh0UGF0aFxuXHRcdCkudGFyZ2V0T2JqZWN0O1xuXHRcdGlmIChrZXkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0TG9nLmVycm9yKGAkZXhwYW5kIGlzIG5vdCB5ZXQgc3VwcG9ydGVkLiBNZWFzdXJlOiAke2tleX0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZGApO1xuXHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGFubm90YXRpb24gcGF0aCBpcyB3cm9uZ1xuXHRcdH0gZWxzZSBpZiAoIWFnZ3JlZ2F0ZWRQcm9wZXJ0eSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBQbGVhc2UgcHJvdmlkZSB0aGUgcmlnaHQgQW5ub3RhdGlvblBhdGggdG8gdGhlIER5bmFtaWMgTWVhc3VyZSAke2NoYXJ0RHluYW1pY01lYXN1cmUudmFsdWV9YCk7XG5cdFx0XHQvLyBjaGVjayBpZiB0aGUgcGF0aCBzdGFydHMgd2l0aCBAXG5cdFx0fSBlbHNlIGlmIChjaGFydER5bmFtaWNNZWFzdXJlLnZhbHVlPy5zdGFydHNXaXRoKGBAJHtBbmFseXRpY3NBbm5vdGF0aW9uVGVybXMuQWdncmVnYXRlZFByb3BlcnR5fWApID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFBsZWFzZSBwcm92aWRlIHRoZSByaWdodCBBbm5vdGF0aW9uUGF0aCB0byB0aGUgRHluYW1pYyBNZWFzdXJlICR7Y2hhcnREeW5hbWljTWVhc3VyZS52YWx1ZX1gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY2hlY2sgaWYgQWdncmVnYXRlZFByb3BlcnR5IGlzIGRlZmluZWQgaW4gZ2l2ZW4gRHluYW1pY01lYXN1cmVcblx0XHRcdGNvbnN0IGR5bmFtaWNNZWFzdXJlOiBNZWFzdXJlVHlwZSA9IHtcblx0XHRcdFx0a2V5OiBhZ2dyZWdhdGVkUHJvcGVydHkuTmFtZSxcblx0XHRcdFx0cm9sZTogXCJheGlzMVwiXG5cdFx0XHR9O1xuXHRcdFx0ZHluYW1pY01lYXN1cmUucHJvcGVydHlQYXRoID0gYWdncmVnYXRlZFByb3BlcnR5LkFnZ3JlZ2F0YWJsZVByb3BlcnR5LnZhbHVlO1xuXHRcdFx0ZHluYW1pY01lYXN1cmUuYWdncmVnYXRpb25NZXRob2QgPSBhZ2dyZWdhdGVkUHJvcGVydHkuQWdncmVnYXRpb25NZXRob2Q7XG5cdFx0XHRkeW5hbWljTWVhc3VyZS5sYWJlbCA9IHJlc29sdmVCaW5kaW5nU3RyaW5nKFxuXHRcdFx0XHRhZ2dyZWdhdGVkUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29tbW9uPy5MYWJlbCB8fFxuXHRcdFx0XHRcdGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhcblx0XHRcdFx0XHRcdHRoaXMubWV0YVBhdGhcblx0XHRcdFx0XHRcdFx0LmdldE1vZGVsKClcblx0XHRcdFx0XHRcdFx0LmNyZWF0ZUJpbmRpbmdDb250ZXh0KGVudGl0eVNldFBhdGggKyBkeW5hbWljTWVhc3VyZS5wcm9wZXJ0eVBhdGggKyBgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLkxhYmVsfWApISxcblx0XHRcdFx0XHRcdHRoaXMuY29udGV4dFBhdGhcblx0XHRcdFx0XHQpLnRhcmdldE9iamVjdFxuXHRcdFx0KTtcblx0XHRcdHRoaXMuc2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyhjaGFydC5NZWFzdXJlQXR0cmlidXRlcywgZW50aXR5U2V0UGF0aCwgZHluYW1pY01lYXN1cmUpO1xuXHRcdFx0bWVhc3VyZXMucHVzaChkeW5hbWljTWVhc3VyZSk7XG5cdFx0fVxuXHRcdHJldHVybiBtZWFzdXJlcztcblx0fTtcblxuXHRnZXRDdXN0b21BZ2dNZWFzdXJlID0gKGN1c3RvbUFnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgTWVhc3VyZVR5cGUgfCB1bmRlZmluZWQ+LCBtZWFzdXJlOiBNZWFzdXJlVHlwZSkgPT4ge1xuXHRcdGlmIChtZWFzdXJlLnZhbHVlICYmIGN1c3RvbUFnZ3JlZ2F0aW9uc1ttZWFzdXJlLnZhbHVlXSkge1xuXHRcdFx0bWVhc3VyZS5sYWJlbCA9IGN1c3RvbUFnZ3JlZ2F0aW9uc1ttZWFzdXJlLnZhbHVlXT8ubGFiZWw7XG5cdFx0XHRyZXR1cm4gbWVhc3VyZTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH07XG5cblx0c2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyA9IChtZWFzdXJlQXR0cmlidXRlczogQ2hhcnRNZWFzdXJlQXR0cmlidXRlVHlwZVtdLCBlbnRpdHlTZXRQYXRoOiBzdHJpbmcsIG1lYXN1cmU6IE1lYXN1cmVUeXBlKSA9PiB7XG5cdFx0aWYgKG1lYXN1cmVBdHRyaWJ1dGVzPy5sZW5ndGgpIHtcblx0XHRcdGZvciAoY29uc3QgbWVhc3VyZUF0dHJpYnV0ZSBvZiBtZWFzdXJlQXR0cmlidXRlcykge1xuXHRcdFx0XHR0aGlzLl9zZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGUobWVhc3VyZUF0dHJpYnV0ZSwgZW50aXR5U2V0UGF0aCwgbWVhc3VyZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdF9zZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGUgPSAobWVhc3VyZUF0dHJpYnV0ZTogQ2hhcnRNZWFzdXJlQXR0cmlidXRlVHlwZSwgZW50aXR5U2V0UGF0aDogc3RyaW5nLCBtZWFzdXJlOiBNZWFzdXJlVHlwZSkgPT4ge1xuXHRcdGNvbnN0IHBhdGggPSBtZWFzdXJlQXR0cmlidXRlLkR5bmFtaWNNZWFzdXJlID8gbWVhc3VyZUF0dHJpYnV0ZT8uRHluYW1pY01lYXN1cmU/LnZhbHVlIDogbWVhc3VyZUF0dHJpYnV0ZT8uTWVhc3VyZT8udmFsdWU7XG5cdFx0Y29uc3QgbWVhc3VyZUF0dHJpYnV0ZURhdGFQb2ludCA9IG1lYXN1cmVBdHRyaWJ1dGUuRGF0YVBvaW50ID8gbWVhc3VyZUF0dHJpYnV0ZT8uRGF0YVBvaW50Py52YWx1ZSA6IG51bGw7XG5cdFx0Y29uc3Qgcm9sZSA9IG1lYXN1cmVBdHRyaWJ1dGUuUm9sZTtcblx0XHRjb25zdCBkYXRhUG9pbnQgPVxuXHRcdFx0bWVhc3VyZUF0dHJpYnV0ZURhdGFQb2ludCAmJlxuXHRcdFx0Z2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKFxuXHRcdFx0XHR0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoZW50aXR5U2V0UGF0aCArIG1lYXN1cmVBdHRyaWJ1dGVEYXRhUG9pbnQpLFxuXHRcdFx0XHR0aGlzLmNvbnRleHRQYXRoXG5cdFx0XHQpLnRhcmdldE9iamVjdDtcblx0XHRpZiAobWVhc3VyZS5rZXkgPT09IHBhdGgpIHtcblx0XHRcdHRoaXMuc2V0TWVhc3VyZVJvbGUobWVhc3VyZSwgcm9sZSk7XG5cdFx0XHQvL3N0aWxsIHRvIGFkZCBkYXRhIHBvaW50LCBidXQgVUk1IENoYXJ0IEFQSSBpcyBtaXNzaW5nXG5cdFx0XHR0aGlzLnNldE1lYXN1cmVEYXRhUG9pbnQobWVhc3VyZSwgZGF0YVBvaW50KTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIEZvcm1hdCB0aGUgZGF0YSBwb2ludCBhcyBhIEpTT04gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFQb2ludEFubm9cblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBqc29uIG9iamVjdFxuXHQgKi9cblx0Y3JlYXRlRGF0YVBvaW50UHJvcGVydHkob0RhdGFQb2ludEFubm86IGFueSkge1xuXHRcdGNvbnN0IG9EYXRhUG9pbnQ6IGFueSA9IHt9O1xuXG5cdFx0aWYgKG9EYXRhUG9pbnRBbm5vLlRhcmdldFZhbHVlKSB7XG5cdFx0XHRvRGF0YVBvaW50LnRhcmdldFZhbHVlID0gb0RhdGFQb2ludEFubm8uVGFyZ2V0VmFsdWUuJFBhdGg7XG5cdFx0fVxuXG5cdFx0aWYgKG9EYXRhUG9pbnRBbm5vLkZvcmVDYXN0VmFsdWUpIHtcblx0XHRcdG9EYXRhUG9pbnQuZm9yZUNhc3RWYWx1ZSA9IG9EYXRhUG9pbnRBbm5vLkZvcmVDYXN0VmFsdWUuJFBhdGg7XG5cdFx0fVxuXG5cdFx0bGV0IG9Dcml0aWNhbGl0eSA9IG51bGw7XG5cdFx0aWYgKG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5KSB7XG5cdFx0XHRpZiAob0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHkuJFBhdGgpIHtcblx0XHRcdFx0Ly93aWxsIGJlIGFuIGFnZ3JlZ2F0ZWQgcHJvcGVydHkgb3IgY3VzdG9tIGFnZ3JlZ2F0ZVxuXHRcdFx0XHRvQ3JpdGljYWxpdHkgPSB7XG5cdFx0XHRcdFx0Q2FsY3VsYXRlZDogb0RhdGFQb2ludEFubm8uQ3JpdGljYWxpdHkuJFBhdGhcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHRTdGF0aWM6IG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyLnJlcGxhY2UoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvXCIsIFwiXCIpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChvRGF0YVBvaW50QW5uby5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uKSB7XG5cdFx0XHRjb25zdCBvVGhyZXNob2xkcyA9IHt9O1xuXHRcdFx0Y29uc3QgYkNvbnN0YW50ID0gdGhpcy5idWlsZFRocmVzaG9sZHMob1RocmVzaG9sZHMsIG9EYXRhUG9pbnRBbm5vLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24pO1xuXG5cdFx0XHRpZiAoYkNvbnN0YW50KSB7XG5cdFx0XHRcdG9Dcml0aWNhbGl0eSA9IHtcblx0XHRcdFx0XHRDb25zdGFudFRocmVzaG9sZHM6IG9UaHJlc2hvbGRzXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvQ3JpdGljYWxpdHkgPSB7XG5cdFx0XHRcdFx0RHluYW1pY1RocmVzaG9sZHM6IG9UaHJlc2hvbGRzXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9Dcml0aWNhbGl0eSkge1xuXHRcdFx0b0RhdGFQb2ludC5jcml0aWNhbGl0eSA9IG9Dcml0aWNhbGl0eTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb0RhdGFQb2ludDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgdGhyZXNob2xkcyBhcmUgZHluYW1pYyBvciBjb25zdGFudC5cblx0ICpcblx0ICogQHBhcmFtIG9UaHJlc2hvbGRzIFRoZSB0aHJlc2hvbGQgc2tlbGV0b25cblx0ICogQHBhcmFtIG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uIFRoZSBVSS5EYXRhUG9pbnQuQ3JpdGljYWxpdHlDYWxjdWxhdGlvbiBhbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgdGhyZXNob2xkIHNob3VsZCBiZSBzdXBwbGllZCBhcyBDb25zdGFudFRocmVzaG9sZHMsIDxjb2RlPmZhbHNlPC9jb2RlPiBpZiB0aGUgdGhyZXNob2xkIHNob3VsZFxuXHQgKiBiZSBzdXBwbGllZCBhcyBEeW5hbWljVGhyZXNob2xkc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YnVpbGRUaHJlc2hvbGRzKG9UaHJlc2hvbGRzOiBhbnksIG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uOiBhbnkpIHtcblx0XHRjb25zdCBhS2V5cyA9IFtcblx0XHRcdFwiQWNjZXB0YW5jZVJhbmdlTG93VmFsdWVcIixcblx0XHRcdFwiQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlXCIsXG5cdFx0XHRcIlRvbGVyYW5jZVJhbmdlTG93VmFsdWVcIixcblx0XHRcdFwiVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWVcIixcblx0XHRcdFwiRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZVwiLFxuXHRcdFx0XCJEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVwiXG5cdFx0XTtcblx0XHRsZXQgYkNvbnN0YW50ID0gdHJ1ZSxcblx0XHRcdHNLZXksXG5cdFx0XHRpLFxuXHRcdFx0ajtcblxuXHRcdG9UaHJlc2hvbGRzLkltcHJvdmVtZW50RGlyZWN0aW9uID0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uSW1wcm92ZW1lbnREaXJlY3Rpb24uJEVudW1NZW1iZXIucmVwbGFjZShcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wcm92ZW1lbnREaXJlY3Rpb25UeXBlL1wiLFxuXHRcdFx0XCJcIlxuXHRcdCk7XG5cblx0XHRjb25zdCBvRHluYW1pY1RocmVzaG9sZHM6IGFueSA9IHtcblx0XHRcdG9uZVN1cHBsaWVkOiBmYWxzZSxcblx0XHRcdHVzZWRNZWFzdXJlczogW11cblx0XHRcdC8vIGNvbWJpbmF0aW9uIHRvIGNoZWNrIHdoZXRoZXIgYXQgbGVhc3Qgb25lIGlzIHN1cHBsaWVkXG5cdFx0fTtcblx0XHRjb25zdCBvQ29uc3RhbnRUaHJlc2hvbGRzOiBhbnkgPSB7XG5cdFx0XHRvbmVTdXBwbGllZDogZmFsc2Vcblx0XHRcdC8vIGNvbWJpbmF0aW9uIHRvIGNoZWNrIHdoZXRoZXIgYXQgbGVhc3Qgb25lIGlzIHN1cHBsaWVkXG5cdFx0fTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCBhS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c0tleSA9IGFLZXlzW2ldO1xuXHRcdFx0b0R5bmFtaWNUaHJlc2hvbGRzW3NLZXldID0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb25bc0tleV0gPyBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbltzS2V5XS4kUGF0aCA6IHVuZGVmaW5lZDtcblx0XHRcdG9EeW5hbWljVGhyZXNob2xkcy5vbmVTdXBwbGllZCA9IG9EeW5hbWljVGhyZXNob2xkcy5vbmVTdXBwbGllZCB8fCBvRHluYW1pY1RocmVzaG9sZHNbc0tleV07XG5cblx0XHRcdGlmICghb0R5bmFtaWNUaHJlc2hvbGRzLm9uZVN1cHBsaWVkKSB7XG5cdFx0XHRcdC8vIG9ubHkgY29uc2lkZXIgaW4gY2FzZSBubyBkeW5hbWljIHRocmVzaG9sZCBpcyBzdXBwbGllZFxuXHRcdFx0XHRvQ29uc3RhbnRUaHJlc2hvbGRzW3NLZXldID0gb0NyaXRpY2FsaXR5Q2FsY3VsYXRpb25bc0tleV07XG5cdFx0XHRcdG9Db25zdGFudFRocmVzaG9sZHMub25lU3VwcGxpZWQgPSBvQ29uc3RhbnRUaHJlc2hvbGRzLm9uZVN1cHBsaWVkIHx8IG9Db25zdGFudFRocmVzaG9sZHNbc0tleV07XG5cdFx0XHR9IGVsc2UgaWYgKG9EeW5hbWljVGhyZXNob2xkc1tzS2V5XSkge1xuXHRcdFx0XHRvRHluYW1pY1RocmVzaG9sZHMudXNlZE1lYXN1cmVzLnB1c2gob0R5bmFtaWNUaHJlc2hvbGRzW3NLZXldKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBkeW5hbWljIGRlZmluaXRpb24gc2hhbGwgb3ZlcnJ1bGUgY29uc3RhbnQgZGVmaW5pdGlvblxuXHRcdGlmIChvRHluYW1pY1RocmVzaG9sZHMub25lU3VwcGxpZWQpIHtcblx0XHRcdGJDb25zdGFudCA9IGZhbHNlO1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgYUtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKG9EeW5hbWljVGhyZXNob2xkc1thS2V5c1tpXV0pIHtcblx0XHRcdFx0XHRvVGhyZXNob2xkc1thS2V5c1tpXV0gPSBvRHluYW1pY1RocmVzaG9sZHNbYUtleXNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRvVGhyZXNob2xkcy51c2VkTWVhc3VyZXMgPSBvRHluYW1pY1RocmVzaG9sZHMudXNlZE1lYXN1cmVzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgb0FnZ3JlZ2F0aW9uTGV2ZWw6IGFueTtcblx0XHRcdG9UaHJlc2hvbGRzLkFnZ3JlZ2F0aW9uTGV2ZWxzID0gW107XG5cblx0XHRcdC8vIGNoZWNrIGlmIGF0IGxlYXN0IG9uZSBzdGF0aWMgdmFsdWUgaXMgc3VwcGxpZWRcblx0XHRcdGlmIChvQ29uc3RhbnRUaHJlc2hvbGRzLm9uZVN1cHBsaWVkKSB7XG5cdFx0XHRcdC8vIGFkZCBvbmUgZW50cnkgaW4gdGhlIGFnZ3JlZ2F0aW9uIGxldmVsXG5cdFx0XHRcdG9BZ2dyZWdhdGlvbkxldmVsID0ge1xuXHRcdFx0XHRcdFZpc2libGVEaW1lbnNpb25zOiBudWxsXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKG9Db25zdGFudFRocmVzaG9sZHNbYUtleXNbaV1dKSB7XG5cdFx0XHRcdFx0XHRvQWdncmVnYXRpb25MZXZlbFthS2V5c1tpXV0gPSBvQ29uc3RhbnRUaHJlc2hvbGRzW2FLZXlzW2ldXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvVGhyZXNob2xkcy5BZ2dyZWdhdGlvbkxldmVscy5wdXNoKG9BZ2dyZWdhdGlvbkxldmVsKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZnVydGhlciBjaGVjayBmb3IgQ29uc3RhbnRUaHJlc2hvbGRzXG5cdFx0XHRpZiAob0NyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQ29uc3RhbnRUaHJlc2hvbGRzICYmIG9Dcml0aWNhbGl0eUNhbGN1bGF0aW9uLkNvbnN0YW50VGhyZXNob2xkcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Db25zdGFudFRocmVzaG9sZHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBvQWdncmVnYXRpb25MZXZlbEluZm8gPSBvQ3JpdGljYWxpdHlDYWxjdWxhdGlvbi5Db25zdGFudFRocmVzaG9sZHNbaV07XG5cblx0XHRcdFx0XHRjb25zdCBhVmlzaWJsZURpbWVuc2lvbnM6IGFueSA9IG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsID8gW10gOiBudWxsO1xuXG5cdFx0XHRcdFx0aWYgKG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsICYmIG9BZ2dyZWdhdGlvbkxldmVsSW5mby5BZ2dyZWdhdGlvbkxldmVsLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGZvciAoaiA9IDA7IGogPCBvQWdncmVnYXRpb25MZXZlbEluZm8uQWdncmVnYXRpb25MZXZlbC5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRhVmlzaWJsZURpbWVuc2lvbnMucHVzaChvQWdncmVnYXRpb25MZXZlbEluZm8uQWdncmVnYXRpb25MZXZlbFtqXS4kUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvQWdncmVnYXRpb25MZXZlbCA9IHtcblx0XHRcdFx0XHRcdFZpc2libGVEaW1lbnNpb25zOiBhVmlzaWJsZURpbWVuc2lvbnNcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0Zm9yIChqID0gMDsgaiA8IGFLZXlzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBuVmFsdWUgPSBvQWdncmVnYXRpb25MZXZlbEluZm9bYUtleXNbal1dO1xuXHRcdFx0XHRcdFx0aWYgKG5WYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRvQWdncmVnYXRpb25MZXZlbFthS2V5c1tqXV0gPSBuVmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b1RocmVzaG9sZHMuQWdncmVnYXRpb25MZXZlbHMucHVzaChvQWdncmVnYXRpb25MZXZlbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYkNvbnN0YW50O1xuXHR9XG5cblx0c2V0TWVhc3VyZURhdGFQb2ludCA9IChtZWFzdXJlOiBNZWFzdXJlVHlwZSwgZGF0YVBvaW50OiBEYXRhUG9pbnQgfCB1bmRlZmluZWQpID0+IHtcblx0XHRpZiAoZGF0YVBvaW50ICYmIGRhdGFQb2ludC5WYWx1ZS4kUGF0aCA9PSBtZWFzdXJlLmtleSkge1xuXHRcdFx0bWVhc3VyZS5kYXRhUG9pbnQgPSBDaGFydEhlbHBlci5mb3JtYXRKU09OVG9TdHJpbmcodGhpcy5jcmVhdGVEYXRhUG9pbnRQcm9wZXJ0eShkYXRhUG9pbnQpKSB8fCBcIlwiO1xuXHRcdH1cblx0fTtcblxuXHRzZXRNZWFzdXJlUm9sZSA9IChtZWFzdXJlOiBNZWFzdXJlVHlwZSwgcm9sZTogQ2hhcnRNZWFzdXJlUm9sZVR5cGUgfCB1bmRlZmluZWQpID0+IHtcblx0XHRpZiAocm9sZSkge1xuXHRcdFx0Y29uc3QgaW5kZXggPSAocm9sZSBhcyBhbnkpLiRFbnVtTWVtYmVyO1xuXHRcdFx0bWVhc3VyZS5yb2xlID0gbWVhc3VyZVJvbGVbaW5kZXhdO1xuXHRcdH1cblx0fTtcblxuXHRnZXREZXBlbmRlbnRzID0gKGNoYXJ0Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdGlmICh0aGlzLl9jb21tYW5kQWN0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29tbWFuZEFjdGlvbnMubWFwKChjb21tYW5kQWN0aW9uOiBDb21tYW5kQWN0aW9uKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldEFjdGlvbkNvbW1hbmQoY29tbWFuZEFjdGlvbiwgY2hhcnRDb250ZXh0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH07XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBvUHJvcHMgU3BlY2lmaWVzIHRoZSBjaGFydCBwcm9wZXJ0aWVzXG5cdCAqL1xuXHRjaGVja1BlcnNvbmFsaXphdGlvbkluQ2hhcnRQcm9wZXJ0aWVzID0gKG9Qcm9wczogYW55KSA9PiB7XG5cdFx0aWYgKG9Qcm9wcy5wZXJzb25hbGl6YXRpb24pIHtcblx0XHRcdGlmIChvUHJvcHMucGVyc29uYWxpemF0aW9uID09PSBcImZhbHNlXCIpIHtcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2UgaWYgKG9Qcm9wcy5wZXJzb25hbGl6YXRpb24gPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRcdHRoaXMucGVyc29uYWxpemF0aW9uID0gT2JqZWN0LnZhbHVlcyhwZXJzb25hbGl6YXRpb25WYWx1ZXMpLmpvaW4oXCIsXCIpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnZlcmlmeVZhbGlkUGVyc29ubGl6YXRpb24ob1Byb3BzLnBlcnNvbmFsaXphdGlvbikgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSBvUHJvcHMucGVyc29uYWxpemF0aW9uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gcGVyc29uYWxpemF0aW9uXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgIGlmIHRoZSBwZXJzb25hbGl6YXRpb24gaXMgdmFsaWQgb3Igbm90IHZhbGlkXG5cdCAqL1xuXHR2ZXJpZnlWYWxpZFBlcnNvbmxpemF0aW9uID0gKHBlcnNvbmFsaXphdGlvbjogU3RyaW5nKSA9PiB7XG5cdFx0bGV0IHZhbGlkOiBCb29sZWFuID0gdHJ1ZTtcblx0XHRjb25zdCBzcGxpdEFycmF5ID0gcGVyc29uYWxpemF0aW9uLnNwbGl0KFwiLFwiKTtcblx0XHRjb25zdCBhY2NlcHRlZFZhbHVlczogc3RyaW5nW10gPSBPYmplY3QudmFsdWVzKHBlcnNvbmFsaXphdGlvblZhbHVlcyk7XG5cdFx0c3BsaXRBcnJheS5mb3JFYWNoKChhcnJheUVsZW1lbnQpID0+IHtcblx0XHRcdGlmICghYWNjZXB0ZWRWYWx1ZXMuaW5jbHVkZXMoYXJyYXlFbGVtZW50KSkge1xuXHRcdFx0XHR2YWxpZCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB2YWxpZDtcblx0fTtcblxuXHRnZXRWYXJpYW50TWFuYWdlbWVudCA9IChvUHJvcHM6IGFueSwgb0NoYXJ0RGVmaW5pdGlvbjogQ2hhcnRWaXN1YWxpemF0aW9uKSA9PiB7XG5cdFx0bGV0IHZhcmlhbnRNYW5hZ2VtZW50ID0gb1Byb3BzLnZhcmlhbnRNYW5hZ2VtZW50ID8gb1Byb3BzLnZhcmlhbnRNYW5hZ2VtZW50IDogb0NoYXJ0RGVmaW5pdGlvbi52YXJpYW50TWFuYWdlbWVudDtcblx0XHR2YXJpYW50TWFuYWdlbWVudCA9IHRoaXMucGVyc29uYWxpemF0aW9uID09PSB1bmRlZmluZWQgPyBcIk5vbmVcIiA6IHZhcmlhbnRNYW5hZ2VtZW50O1xuXHRcdHJldHVybiB2YXJpYW50TWFuYWdlbWVudDtcblx0fTtcblxuXHRjcmVhdGVWYXJpYW50TWFuYWdlbWVudCA9ICgpID0+IHtcblx0XHRjb25zdCBwZXJzb25hbGl6YXRpb24gPSB0aGlzLnBlcnNvbmFsaXphdGlvbjtcblx0XHRpZiAocGVyc29uYWxpemF0aW9uKSB7XG5cdFx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudCA9IHRoaXMudmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQgPT09IFwiQ29udHJvbFwiKSB7XG5cdFx0XHRcdHJldHVybiB4bWxgXG5cdFx0XHRcdFx0PG1kYzp2YXJpYW50PlxuXHRcdFx0XHRcdDx2YXJpYW50OlZhcmlhbnRNYW5hZ2VtZW50XG5cdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiVk1cIl0pfVwiXG5cdFx0XHRcdFx0XHRmb3I9XCIke3RoaXMuaWR9XCJcblx0XHRcdFx0XHRcdHNob3dTZXRBc0RlZmF1bHQ9XCIke3RydWV9XCJcblx0XHRcdFx0XHRcdHNlbGVjdD1cIiR7dGhpcy52YXJpYW50U2VsZWN0ZWR9XCJcblx0XHRcdFx0XHRcdGhlYWRlckxldmVsPVwiJHt0aGlzLmhlYWRlckxldmVsfVwiXG5cdFx0XHRcdFx0XHRzYXZlPVwiJHt0aGlzLnZhcmlhbnRTYXZlZH1cIlxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9tZGM6dmFyaWFudD5cblx0XHRcdGA7XG5cdFx0XHR9IGVsc2UgaWYgKHZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIk5vbmVcIiB8fCB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJQYWdlXCIpIHtcblx0XHRcdFx0cmV0dXJuIHhtbGBgO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIXBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJWYXJpYW50IE1hbmFnZW1lbnQgY2Fubm90IGJlIGVuYWJsZWQgd2hlbiBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWRcIik7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRnZXRQZXJzaXN0ZW5jZVByb3ZpZGVyID0gKCkgPT4ge1xuXHRcdGlmICh0aGlzLnZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIk5vbmVcIikge1xuXHRcdFx0cmV0dXJuIHhtbGA8cDEzbjpQZXJzaXN0ZW5jZVByb3ZpZGVyIGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJQZXJzaXN0ZW5jZVByb3ZpZGVyXCJdKX1cIiBmb3I9XCIke3RoaXMuaWR9XCIvPmA7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRwdXNoQWN0aW9uQ29tbWFuZCA9IChcblx0XHRhY3Rpb25Db250ZXh0OiBDb250ZXh0LFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQWN0aW9uIHwgdW5kZWZpbmVkLFxuXHRcdGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0YWN0aW9uOiBCYXNlQWN0aW9uIHwgQ3VzdG9tQWN0aW9uXG5cdCkgPT4ge1xuXHRcdGlmIChkYXRhRmllbGQpIHtcblx0XHRcdGNvbnN0IGNvbW1hbmRBY3Rpb24gPSB7XG5cdFx0XHRcdGFjdGlvbkNvbnRleHQ6IGFjdGlvbkNvbnRleHQsXG5cdFx0XHRcdG9uRXhlY3V0ZUFjdGlvbjogQ2hhcnRIZWxwZXIuZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihcblx0XHRcdFx0XHR0aGlzLmlkISxcblx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0Y2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgfHwgXCJcIlxuXHRcdFx0XHQpLFxuXHRcdFx0XHRvbkV4ZWN1dGVJQk46IENvbW1vbkhlbHBlci5nZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4oZGF0YUZpZWxkLCBgXFwke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9YCwgZmFsc2UpLFxuXHRcdFx0XHRvbkV4ZWN1dGVNYW5pZmVzdDogQ29tbW9uSGVscGVyLmJ1aWxkQWN0aW9uV3JhcHBlcihhY3Rpb24gYXMgQ3VzdG9tQWN0aW9uLCB0aGlzKVxuXHRcdFx0fTtcblx0XHRcdHRoaXMuX2NvbW1hbmRBY3Rpb25zLnB1c2goY29tbWFuZEFjdGlvbik7XG5cdFx0fVxuXHR9O1xuXG5cdGdldEFjdGlvbkNvbW1hbmQgPSAoY29tbWFuZEFjdGlvbjogQ29tbWFuZEFjdGlvbiwgY2hhcnRDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgYWN0aW9uID0gY29tbWFuZEFjdGlvbi5hY3Rpb25Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IGRhdGFGaWVsZENvbnRleHQgPSBhY3Rpb24uYW5ub3RhdGlvblBhdGggJiYgdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbi5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0Y29uc3QgZGF0YUZpZWxkID0gZGF0YUZpZWxkQ29udGV4dCAmJiBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IGRhdGFGaWVsZEFjdGlvbiA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGggKyBcIi9BY3Rpb25cIikhO1xuXHRcdGNvbnN0IGFjdGlvbkNvbnRleHQgPSBDb21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dChkYXRhRmllbGRBY3Rpb24pO1xuXHRcdGNvbnN0IGlzQm91bmRQYXRoID0gQ29tbW9uSGVscGVyLmdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWQoZGF0YUZpZWxkQWN0aW9uKTtcblx0XHRjb25zdCBpc0JvdW5kID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGlzQm91bmRQYXRoKSEuZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3QgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgPSBlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZShcblx0XHRcdENoYXJ0SGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChjaGFydENvbnRleHQuZ2V0T2JqZWN0KCksIHtcblx0XHRcdFx0Y29udGV4dDogY2hhcnRDb250ZXh0XG5cdFx0XHR9KVxuXHRcdCk7XG5cdFx0Y29uc3QgaXNBY3Rpb25FbmFibGVkID0gYWN0aW9uLmVuYWJsZWRcblx0XHRcdD8gYWN0aW9uLmVuYWJsZWRcblx0XHRcdDogQ2hhcnRIZWxwZXIuaXNEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25FbmFibGVkKFxuXHRcdFx0XHRcdGlzQm91bmQgJiYgaXNCb3VuZC4kSXNCb3VuZCxcblx0XHRcdFx0XHRkYXRhRmllbGQuQWN0aW9uLFxuXHRcdFx0XHRcdHRoaXMuY29udGV4dFBhdGgsXG5cdFx0XHRcdFx0Y2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXAgfHwgXCJcIixcblx0XHRcdFx0XHRhY3Rpb24uZW5hYmxlT25TZWxlY3QgfHwgXCJcIlxuXHRcdFx0ICApO1xuXHRcdGxldCBpc0lCTkVuYWJsZWQ7XG5cdFx0aWYgKGFjdGlvbi5lbmFibGVkKSB7XG5cdFx0XHRpc0lCTkVuYWJsZWQgPSBhY3Rpb24uZW5hYmxlZDtcblx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRcdGlzSUJORW5hYmxlZCA9IFwiez0gJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDF9XCI7XG5cdFx0fVxuXHRcdGNvbnN0IGFjdGlvbkNvbW1hbmQgPSB4bWxgPGludGVybmFsTWFjcm86QWN0aW9uQ29tbWFuZFxuXHRcdGFjdGlvbj1cIiR7YWN0aW9ufVwiXG5cdFx0b25FeGVjdXRlQWN0aW9uPVwiJHtjb21tYW5kQWN0aW9uLm9uRXhlY3V0ZUFjdGlvbn1cIlxuXHRcdG9uRXhlY3V0ZUlCTj1cIiR7Y29tbWFuZEFjdGlvbi5vbkV4ZWN1dGVJQk59XCJcblx0XHRvbkV4ZWN1dGVNYW5pZmVzdD1cIiR7Y29tbWFuZEFjdGlvbi5vbkV4ZWN1dGVNYW5pZmVzdH1cIlxuXHRcdGlzSUJORW5hYmxlZD1cIiR7aXNJQk5FbmFibGVkfVwiXG5cdFx0aXNBY3Rpb25FbmFibGVkPVwiJHtpc0FjdGlvbkVuYWJsZWR9XCJcblx0XHR2aXNpYmxlPVwiJHt0aGlzLmdldFZpc2libGUoZGF0YUZpZWxkQ29udGV4dCl9XCJcblx0Lz5gO1xuXHRcdGlmIChcblx0XHRcdGFjdGlvbi50eXBlID09IFwiRm9yQWN0aW9uXCIgJiZcblx0XHRcdCghaXNCb3VuZCB8fCBpc0JvdW5kLklzQm91bmQgIT09IHRydWUgfHwgYWN0aW9uQ29udGV4dFtgQCR7Q29yZUFubm90YXRpb25UZXJtcy5PcGVyYXRpb25BdmFpbGFibGV9YF0gIT09IGZhbHNlKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGFjdGlvbkNvbW1hbmQ7XG5cdFx0fSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PSBcIkZvckFjdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4geG1sYGA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhY3Rpb25Db21tYW5kO1xuXHRcdH1cblx0fTtcblxuXHRnZXRJdGVtcyA9IChjaGFydENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRpZiAodGhpcy5fY2hhcnQpIHtcblx0XHRcdGNvbnN0IGRpbWVuc2lvbnM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRjb25zdCBtZWFzdXJlczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGlmICh0aGlzLl9jaGFydC5EaW1lbnNpb25zKSB7XG5cdFx0XHRcdENoYXJ0SGVscGVyLmZvcm1hdERpbWVuc2lvbnMoY2hhcnRDb250ZXh0KVxuXHRcdFx0XHRcdC5nZXRPYmplY3QoKVxuXHRcdFx0XHRcdC5mb3JFYWNoKChkaW1lbnNpb246IERpbWVuc2lvblR5cGUpID0+IHtcblx0XHRcdFx0XHRcdGRpbWVuc2lvbi5pZCA9IGdlbmVyYXRlKFt0aGlzLmlkLCBcImRpbWVuc2lvblwiLCBkaW1lbnNpb24ua2V5XSk7XG5cdFx0XHRcdFx0XHRkaW1lbnNpb25zLnB1c2goXG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0SXRlbShcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZDogZGltZW5zaW9uLmlkLFxuXHRcdFx0XHRcdFx0XHRcdFx0a2V5OiBkaW1lbnNpb24ua2V5LFxuXHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGRpbWVuc2lvbi5sYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRcdHJvbGU6IGRpbWVuc2lvbi5yb2xlXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcIl9mZV9ncm91cGFibGVfXCIsXG5cdFx0XHRcdFx0XHRcdFx0XCJncm91cGFibGVcIlxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMubWVhc3VyZXMpIHtcblx0XHRcdFx0Q2hhcnRIZWxwZXIuZm9ybWF0TWVhc3VyZXModGhpcy5tZWFzdXJlcykuZm9yRWFjaCgobWVhc3VyZTogTWVhc3VyZVR5cGUpID0+IHtcblx0XHRcdFx0XHRtZWFzdXJlLmlkID0gZ2VuZXJhdGUoW3RoaXMuaWQsIFwibWVhc3VyZVwiLCBtZWFzdXJlLmtleV0pO1xuXHRcdFx0XHRcdG1lYXN1cmVzLnB1c2goXG5cdFx0XHRcdFx0XHR0aGlzLmdldEl0ZW0oXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRpZDogbWVhc3VyZS5pZCxcblx0XHRcdFx0XHRcdFx0XHRrZXk6IG1lYXN1cmUua2V5LFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBtZWFzdXJlLmxhYmVsLFxuXHRcdFx0XHRcdFx0XHRcdHJvbGU6IG1lYXN1cmUucm9sZVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcIl9mZV9hZ2dyZWdhdGFibGVfXCIsXG5cdFx0XHRcdFx0XHRcdFwiYWdncmVnYXRhYmxlXCJcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGlmIChkaW1lbnNpb25zLmxlbmd0aCAmJiBtZWFzdXJlcy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGRpbWVuc2lvbnMuY29uY2F0KG1lYXN1cmVzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHhtbGBgO1xuXHR9O1xuXG5cdGdldEl0ZW0gPSAoaXRlbTogTWVhc3VyZVR5cGUgfCBEaW1lbnNpb25UeXBlLCBwcmVmaXg6IHN0cmluZywgdHlwZTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHhtbGA8Y2hhcnQ6SXRlbVxuXHRcdFx0aWQ9XCIke2l0ZW0uaWR9XCJcblx0XHRcdG5hbWU9XCIke3ByZWZpeCArIGl0ZW0ua2V5fVwiXG5cdFx0XHR0eXBlPVwiJHt0eXBlfVwiXG5cdFx0XHRsYWJlbD1cIiR7cmVzb2x2ZUJpbmRpbmdTdHJpbmcoaXRlbS5sYWJlbCBhcyBzdHJpbmcsIFwic3RyaW5nXCIpfVwiXG5cdFx0XHRyb2xlPVwiJHtpdGVtLnJvbGV9XCJcblx0XHQvPmA7XG5cdH07XG5cblx0Z2V0VG9vbGJhckFjdGlvbnMgPSAoY2hhcnRDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgYWN0aW9ucyA9IHRoaXMuZ2V0QWN0aW9ucyhjaGFydENvbnRleHQpO1xuXHRcdGlmICh0aGlzLmNoYXJ0RGVmaW5pdGlvbj8ub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkKSB7XG5cdFx0XHRhY3Rpb25zLnB1c2godGhpcy5nZXRTZWdtZW50ZWRCdXR0b24oKSk7XG5cdFx0fVxuXHRcdGlmIChhY3Rpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiB4bWxgPG1kYzphY3Rpb25zPiR7YWN0aW9uc308L21kYzphY3Rpb25zPmA7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRnZXRBY3Rpb25zID0gKGNoYXJ0Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdGxldCBhY3Rpb25zID0gdGhpcy5jaGFydEFjdGlvbnM/LmdldE9iamVjdCgpO1xuXHRcdGFjdGlvbnMgPSB0aGlzLnJlbW92ZU1lbnVJdGVtcyhhY3Rpb25zKTtcblx0XHRyZXR1cm4gYWN0aW9ucy5tYXAoKGFjdGlvbjogQ3VzdG9tQW5kQWN0aW9uKSA9PiB7XG5cdFx0XHRpZiAoYWN0aW9uLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRcdC8vIExvYWQgYW5ub3RhdGlvbiBiYXNlZCBhY3Rpb25zXG5cdFx0XHRcdHJldHVybiB0aGlzLmdldEFjdGlvbihhY3Rpb24sIGNoYXJ0Q29udGV4dCwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIGlmIChhY3Rpb24uaGFzT3duUHJvcGVydHkoXCJub1dyYXBcIikpIHtcblx0XHRcdFx0Ly8gTG9hZCBYTUwgb3IgbWFuaWZlc3QgYmFzZWQgYWN0aW9ucyAvIGFjdGlvbiBncm91cHNcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0Q3VzdG9tQWN0aW9ucyhhY3Rpb24sIGNoYXJ0Q29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH07XG5cblx0cmVtb3ZlTWVudUl0ZW1zID0gKGFjdGlvbnM6IEJhc2VBY3Rpb25bXSkgPT4ge1xuXHRcdC8vIElmIGFjdGlvbiBpcyBhbHJlYWR5IHBhcnQgb2YgbWVudSBpbiBhY3Rpb24gZ3JvdXAsIHRoZW4gaXQgd2lsbFxuXHRcdC8vIGJlIHJlbW92ZWQgZnJvbSB0aGUgbWFpbiBhY3Rpb25zIGxpc3Rcblx0XHRmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zKSB7XG5cdFx0XHRpZiAoYWN0aW9uLm1lbnUpIHtcblx0XHRcdFx0YWN0aW9uLm1lbnUuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRcdGlmIChhY3Rpb25zLmluZGV4T2YoaXRlbSBhcyBCYXNlQWN0aW9uKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdGFjdGlvbnMuc3BsaWNlKGFjdGlvbnMuaW5kZXhPZihpdGVtIGFzIEJhc2VBY3Rpb24pLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYWN0aW9ucztcblx0fTtcblxuXHRnZXRDdXN0b21BY3Rpb25zID0gKGFjdGlvbjogQ3VzdG9tQW5kQWN0aW9uLCBjaGFydENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRsZXQgYWN0aW9uRW5hYmxlZCA9IGFjdGlvbi5lbmFibGVkIGFzIHN0cmluZyB8IGJvb2xlYW47XG5cdFx0aWYgKChhY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPz8gZmFsc2UpICYmIGFjdGlvbi5lbmFibGVkID09PSBcInRydWVcIikge1xuXHRcdFx0YWN0aW9uRW5hYmxlZCA9IFwiez0gJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDF9XCI7XG5cdFx0fVxuXHRcdGlmIChhY3Rpb24udHlwZSA9PT0gXCJEZWZhdWx0XCIpIHtcblx0XHRcdC8vIExvYWQgWE1MIG9yIG1hbmlmZXN0IGJhc2VkIHRvb2xiYXIgYWN0aW9uc1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uVG9vbGJhckFjdGlvbihcblx0XHRcdFx0YWN0aW9uLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IGdlbmVyYXRlKFt0aGlzLmlkLCBhY3Rpb24uaWRdKSxcblx0XHRcdFx0XHR1bml0dGVzdGlkOiBcIkRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkFjdGlvblwiLFxuXHRcdFx0XHRcdGxhYmVsOiBhY3Rpb24udGV4dCA/IGFjdGlvbi50ZXh0IDogXCJcIixcblx0XHRcdFx0XHRhcmlhSGFzUG9wdXA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRwcmVzczogYWN0aW9uLnByZXNzID8gYWN0aW9uLnByZXNzIDogXCJcIixcblx0XHRcdFx0XHRlbmFibGVkOiBhY3Rpb25FbmFibGVkLFxuXHRcdFx0XHRcdHZpc2libGU6IGFjdGlvbi52aXNpYmxlID8gYWN0aW9uLnZpc2libGUgOiBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKGFjdGlvbi50eXBlID09PSBcIk1lbnVcIikge1xuXHRcdFx0Ly8gTG9hZCBhY3Rpb24gZ3JvdXBzIChNZW51KVxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uVG9vbGJhck1lbnVBY3Rpb24oXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogZ2VuZXJhdGUoW3RoaXMuaWQsIGFjdGlvbi5pZF0pLFxuXHRcdFx0XHRcdHRleHQ6IGFjdGlvbi50ZXh0LFxuXHRcdFx0XHRcdHZpc2libGU6IGFjdGlvbi52aXNpYmxlLFxuXHRcdFx0XHRcdGVuYWJsZWQ6IGFjdGlvbkVuYWJsZWQsXG5cdFx0XHRcdFx0dXNlRGVmYXVsdEFjdGlvbk9ubHk6IERlZmF1bHRBY3Rpb25IYW5kbGVyLmdldFVzZURlZmF1bHRBY3Rpb25Pbmx5KGFjdGlvbiksXG5cdFx0XHRcdFx0YnV0dG9uTW9kZTogRGVmYXVsdEFjdGlvbkhhbmRsZXIuZ2V0QnV0dG9uTW9kZShhY3Rpb24pLFxuXHRcdFx0XHRcdGRlZmF1bHRBY3Rpb246IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRhY3Rpb25zOiBhY3Rpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0Y2hhcnRDb250ZXh0XG5cdFx0XHQpO1xuXHRcdH1cblx0fTtcblxuXHRnZXRNZW51SXRlbUZyb21NZW51ID0gKG1lbnVJdGVtQWN0aW9uOiBDdXN0b21BY3Rpb24sIGNoYXJ0Q29udGV4dDogQ29udGV4dCkgPT4ge1xuXHRcdGxldCBwcmVzc0hhbmRsZXI7XG5cdFx0aWYgKG1lbnVJdGVtQWN0aW9uLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHQvL0Fubm90YXRpb24gYmFzZWQgYWN0aW9uIGlzIHBhc3NlZCBhcyBtZW51IGl0ZW0gZm9yIG1lbnUgYnV0dG9uXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBY3Rpb24obWVudUl0ZW1BY3Rpb24sIGNoYXJ0Q29udGV4dCwgdHJ1ZSk7XG5cdFx0fVxuXHRcdGlmIChtZW51SXRlbUFjdGlvbi5jb21tYW5kKSB7XG5cdFx0XHRwcmVzc0hhbmRsZXIgPSBcImNtZDpcIiArIG1lbnVJdGVtQWN0aW9uLmNvbW1hbmQ7XG5cdFx0fSBlbHNlIGlmIChtZW51SXRlbUFjdGlvbi5ub1dyYXAgPz8gZmFsc2UpIHtcblx0XHRcdHByZXNzSGFuZGxlciA9IG1lbnVJdGVtQWN0aW9uLnByZXNzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcmVzc0hhbmRsZXIgPSBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKG1lbnVJdGVtQWN0aW9uLCB0aGlzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHhtbGA8TWVudUl0ZW1cblx0XHRjb3JlOnJlcXVpcmU9XCJ7RlBNOiAnc2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXInfVwiXG5cdFx0dGV4dD1cIiR7bWVudUl0ZW1BY3Rpb24udGV4dH1cIlxuXHRcdHByZXNzPVwiJHtwcmVzc0hhbmRsZXJ9XCJcblx0XHR2aXNpYmxlPVwiJHttZW51SXRlbUFjdGlvbi52aXNpYmxlfVwiXG5cdFx0ZW5hYmxlZD1cIiR7bWVudUl0ZW1BY3Rpb24uZW5hYmxlZH1cIlxuXHQvPmA7XG5cdH07XG5cblx0Z2V0QWN0aW9uVG9vbGJhck1lbnVBY3Rpb24gPSAocHJvcHM6IEN1c3RvbVRvb2xiYXJNZW51QWN0aW9uLCBjaGFydENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRjb25zdCBhTWVudUl0ZW1zID0gcHJvcHMuYWN0aW9ucz8ubWVudT8ubWFwKChhY3Rpb246IEN1c3RvbUFjdGlvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TWVudUl0ZW1Gcm9tTWVudShhY3Rpb24sIGNoYXJ0Q29udGV4dCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5cblx0XHRcdDxNZW51QnV0dG9uXG5cdFx0XHR0ZXh0PVwiJHtwcm9wcy50ZXh0fVwiXG5cdFx0XHR0eXBlPVwiVHJhbnNwYXJlbnRcIlxuXHRcdFx0bWVudVBvc2l0aW9uPVwiQmVnaW5Cb3R0b21cIlxuXHRcdFx0aWQ9XCIke3Byb3BzLmlkfVwiXG5cdFx0XHR2aXNpYmxlPVwiJHtwcm9wcy52aXNpYmxlfVwiXG5cdFx0XHRlbmFibGVkPVwiJHtwcm9wcy5lbmFibGVkfVwiXG5cdFx0XHR1c2VEZWZhdWx0QWN0aW9uT25seT1cIiR7cHJvcHMudXNlRGVmYXVsdEFjdGlvbk9ubHl9XCJcblx0XHRcdGJ1dHRvbk1vZGU9XCIke3Byb3BzLmJ1dHRvbk1vZGV9XCJcblx0XHRcdGRlZmF1bHRBY3Rpb249XCIke3Byb3BzLmRlZmF1bHRBY3Rpb259XCJcblx0XHRcdD5cblx0XHRcdFx0PG1lbnU+XG5cdFx0XHRcdFx0PE1lbnU+XG5cdFx0XHRcdFx0XHQke2FNZW51SXRlbXN9XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L21lbnU+XG5cdFx0XHQ8L01lbnVCdXR0b24+XG5cdFx0PC9tZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPmA7XG5cdH07XG5cblx0Z2V0QWN0aW9uID0gKGFjdGlvbjogQmFzZUFjdGlvbiwgY2hhcnRDb250ZXh0OiBDb250ZXh0LCBpc01lbnVJdGVtOiBib29sZWFuKSA9PiB7XG5cdFx0Y29uc3QgZGF0YUZpZWxkQ29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGggfHwgXCJcIikhO1xuXHRcdGlmIChhY3Rpb24udHlwZSA9PT0gXCJGb3JOYXZpZ2F0aW9uXCIpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE5hdmlnYXRpb25BY3Rpb25zKGFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dCwgaXNNZW51SXRlbSk7XG5cdFx0fSBlbHNlIGlmIChhY3Rpb24udHlwZSA9PT0gXCJGb3JBY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QW5ub3RhdGlvbkFjdGlvbnMoY2hhcnRDb250ZXh0LCBhY3Rpb24gYXMgQW5ub3RhdGlvbkFjdGlvbiwgZGF0YUZpZWxkQ29udGV4dCwgaXNNZW51SXRlbSk7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRnZXROYXZpZ2F0aW9uQWN0aW9ucyA9IChhY3Rpb246IEJhc2VBY3Rpb24sIGRhdGFGaWVsZENvbnRleHQ6IENvbnRleHQsIGlzTWVudUl0ZW06IGJvb2xlYW4pID0+IHtcblx0XHRsZXQgZW5hYmxlZCA9IFwidHJ1ZVwiO1xuXHRcdGNvbnN0IGRhdGFGaWVsZCA9IGRhdGFGaWVsZENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKGFjdGlvbi5lbmFibGVkICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGVuYWJsZWQgPSBhY3Rpb24uZW5hYmxlZDtcblx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRcdGVuYWJsZWQgPSBcIns9ICV7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA+PSAxfVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5nZXRBY3Rpb25Ub29sYmFyQWN0aW9uKFxuXHRcdFx0YWN0aW9uLFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0XHR1bml0dGVzdGlkOiBcIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbkJ1dHRvbkFjdGlvblwiLFxuXHRcdFx0XHRsYWJlbDogZGF0YUZpZWxkLkxhYmVsLFxuXHRcdFx0XHRhcmlhSGFzUG9wdXA6IHVuZGVmaW5lZCxcblx0XHRcdFx0cHJlc3M6IENvbW1vbkhlbHBlci5nZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4oZGF0YUZpZWxkLCBgXFwke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9YCwgZmFsc2UpISxcblx0XHRcdFx0ZW5hYmxlZDogZW5hYmxlZCxcblx0XHRcdFx0dmlzaWJsZTogdGhpcy5nZXRWaXNpYmxlKGRhdGFGaWVsZENvbnRleHQpXG5cdFx0XHR9LFxuXHRcdFx0aXNNZW51SXRlbVxuXHRcdCk7XG5cdH07XG5cblx0Z2V0QW5ub3RhdGlvbkFjdGlvbnMgPSAoY2hhcnRDb250ZXh0OiBDb250ZXh0LCBhY3Rpb246IEFubm90YXRpb25BY3Rpb24sIGRhdGFGaWVsZENvbnRleHQ6IENvbnRleHQsIGlzTWVudUl0ZW06IGJvb2xlYW4pID0+IHtcblx0XHRjb25zdCBkYXRhRmllbGRBY3Rpb24gPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoICsgXCIvQWN0aW9uXCIpITtcblx0XHRjb25zdCBhY3Rpb25Db250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KENvbW1vbkhlbHBlci5nZXRBY3Rpb25Db250ZXh0KGRhdGFGaWVsZEFjdGlvbikpO1xuXHRcdGNvbnN0IGFjdGlvbk9iamVjdCA9IGFjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0Y29uc3QgaXNCb3VuZFBhdGggPSBDb21tb25IZWxwZXIuZ2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZChkYXRhRmllbGRBY3Rpb24pO1xuXHRcdGNvbnN0IGlzQm91bmQgPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoaXNCb3VuZFBhdGgpIS5nZXRPYmplY3QoKTtcblx0XHRjb25zdCBkYXRhRmllbGQgPSBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGlmICghaXNCb3VuZCB8fCBpc0JvdW5kLiRJc0JvdW5kICE9PSB0cnVlIHx8IGFjdGlvbk9iamVjdFtgQCR7Q29yZUFubm90YXRpb25UZXJtcy5PcGVyYXRpb25BdmFpbGFibGV9YF0gIT09IGZhbHNlKSB7XG5cdFx0XHRjb25zdCBlbmFibGVkID0gdGhpcy5nZXRBbm5vdGF0aW9uQWN0aW9uc0VuYWJsZWQoYWN0aW9uLCBpc0JvdW5kLCBkYXRhRmllbGQsIGNoYXJ0Q29udGV4dCk7XG5cdFx0XHRjb25zdCBkYXRhRmllbGRNb2RlbE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHRcdHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb24uYW5ub3RhdGlvblBhdGgpIVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGFyaWFIYXNQb3B1cCA9IGlzRGF0YU1vZGVsT2JqZWN0UGF0aEZvckFjdGlvbldpdGhEaWFsb2coZGF0YUZpZWxkTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdGNvbnN0IGNoYXJ0T3BlcmF0aW9uQXZhaWxhYmxlTWFwID1cblx0XHRcdFx0ZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUoXG5cdFx0XHRcdFx0Q2hhcnRIZWxwZXIuZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKGNoYXJ0Q29udGV4dC5nZXRPYmplY3QoKSwge1xuXHRcdFx0XHRcdFx0Y29udGV4dDogY2hhcnRDb250ZXh0XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KSB8fCBcIlwiO1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0QWN0aW9uVG9vbGJhckFjdGlvbihcblx0XHRcdFx0YWN0aW9uLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IGdlbmVyYXRlKFt0aGlzLmlkLCBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoZGF0YUZpZWxkQ29udGV4dCldKSxcblx0XHRcdFx0XHR1bml0dGVzdGlkOiBcIkRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkFjdGlvblwiLFxuXHRcdFx0XHRcdGxhYmVsOiBkYXRhRmllbGQuTGFiZWwsXG5cdFx0XHRcdFx0YXJpYUhhc1BvcHVwOiBhcmlhSGFzUG9wdXAsXG5cdFx0XHRcdFx0cHJlc3M6IENoYXJ0SGVscGVyLmdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24odGhpcy5pZCEsIGRhdGFGaWVsZCwgY2hhcnRPcGVyYXRpb25BdmFpbGFibGVNYXApLFxuXHRcdFx0XHRcdGVuYWJsZWQ6IGVuYWJsZWQsXG5cdFx0XHRcdFx0dmlzaWJsZTogdGhpcy5nZXRWaXNpYmxlKGRhdGFGaWVsZENvbnRleHQpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGlzTWVudUl0ZW1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fTtcblxuXHRnZXRBY3Rpb25Ub29sYmFyQWN0aW9uID0gKGFjdGlvbjogQmFzZUFjdGlvbiAmIHsgbm9XcmFwPzogYm9vbGVhbiB9LCB0b29sYmFyQWN0aW9uOiBUb29sQmFyQWN0aW9uLCBpc01lbnVJdGVtOiBib29sZWFuKSA9PiB7XG5cdFx0aWYgKGlzTWVudUl0ZW0pIHtcblx0XHRcdHJldHVybiB4bWxgXG5cdFx0XHQ8TWVudUl0ZW1cblx0XHRcdFx0dGV4dD1cIiR7dG9vbGJhckFjdGlvbi5sYWJlbH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7YWN0aW9uLmNvbW1hbmQgPyBcImNtZDpcIiArIGFjdGlvbi5jb21tYW5kIDogdG9vbGJhckFjdGlvbi5wcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHt0b29sYmFyQWN0aW9uLmVuYWJsZWR9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7dG9vbGJhckFjdGlvbi52aXNpYmxlfVwiXG5cdFx0XHQvPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmJ1aWxkQWN0aW9uKGFjdGlvbiwgdG9vbGJhckFjdGlvbik7XG5cdFx0fVxuXHR9O1xuXG5cdGJ1aWxkQWN0aW9uID0gKGFjdGlvbjogQmFzZUFjdGlvbiB8IEN1c3RvbUFjdGlvbiwgdG9vbGJhckFjdGlvbjogVG9vbEJhckFjdGlvbikgPT4ge1xuXHRcdGxldCBhY3Rpb25QcmVzczogc3RyaW5nIHwgdW5kZWZpbmVkID0gXCJcIjtcblx0XHRpZiAoYWN0aW9uLmhhc093blByb3BlcnR5KFwibm9XcmFwXCIpKSB7XG5cdFx0XHRpZiAoYWN0aW9uLmNvbW1hbmQpIHtcblx0XHRcdFx0YWN0aW9uUHJlc3MgPSBcImNtZDpcIiArIGFjdGlvbi5jb21tYW5kO1xuXHRcdFx0fSBlbHNlIGlmICgoYWN0aW9uIGFzIEN1c3RvbUFjdGlvbikubm9XcmFwID09PSB0cnVlKSB7XG5cdFx0XHRcdGFjdGlvblByZXNzID0gdG9vbGJhckFjdGlvbi5wcmVzcztcblx0XHRcdH0gZWxzZSBpZiAoIWFjdGlvbi5hbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRhY3Rpb25QcmVzcyA9IENvbW1vbkhlbHBlci5idWlsZEFjdGlvbldyYXBwZXIoYWN0aW9uIGFzIEN1c3RvbUFjdGlvbiwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPlxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRjb3JlOnJlcXVpcmU9XCJ7RlBNOiAnc2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXInfVwiXG5cdFx0XHRcdHVuaXR0ZXN0OmlkPVwiJHt0b29sYmFyQWN0aW9uLnVuaXR0ZXN0aWR9XCJcblx0XHRcdFx0aWQ9XCIke3Rvb2xiYXJBY3Rpb24uaWR9XCJcblx0XHRcdFx0dGV4dD1cIiR7dG9vbGJhckFjdGlvbi5sYWJlbH1cIlxuXHRcdFx0XHRhcmlhSGFzUG9wdXA9XCIke3Rvb2xiYXJBY3Rpb24uYXJpYUhhc1BvcHVwfVwiXG5cdFx0XHRcdHByZXNzPVwiJHthY3Rpb25QcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHt0b29sYmFyQWN0aW9uLmVuYWJsZWR9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7dG9vbGJhckFjdGlvbi52aXNpYmxlfVwiXG5cdFx0XHQvPlxuXHRcdCAgIDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPlxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHR1bml0dGVzdDppZD1cIiR7dG9vbGJhckFjdGlvbi51bml0dGVzdGlkfVwiXG5cdFx0XHRcdGlkPVwiJHt0b29sYmFyQWN0aW9uLmlkfVwiXG5cdFx0XHRcdHRleHQ9XCIke3Rvb2xiYXJBY3Rpb24ubGFiZWx9XCJcblx0XHRcdFx0YXJpYUhhc1BvcHVwPVwiJHt0b29sYmFyQWN0aW9uLmFyaWFIYXNQb3B1cH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7YWN0aW9uLmNvbW1hbmQgPyBcImNtZDpcIiArIGFjdGlvbi5jb21tYW5kIDogdG9vbGJhckFjdGlvbi5wcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHt0b29sYmFyQWN0aW9uLmVuYWJsZWR9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7dG9vbGJhckFjdGlvbi52aXNpYmxlfVwiXG5cdFx0XHQvPlxuXHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHRcdH1cblx0fTtcblxuXHRnZXRBbm5vdGF0aW9uQWN0aW9uc0VuYWJsZWQgPSAoXG5cdFx0YWN0aW9uOiBCYXNlQWN0aW9uLFxuXHRcdGlzQm91bmQ6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdGNoYXJ0Q29udGV4dDogQ29udGV4dFxuXHQpID0+IHtcblx0XHRyZXR1cm4gYWN0aW9uLmVuYWJsZWQgIT09IHVuZGVmaW5lZFxuXHRcdFx0PyBhY3Rpb24uZW5hYmxlZFxuXHRcdFx0OiBDaGFydEhlbHBlci5pc0RhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkVuYWJsZWQoXG5cdFx0XHRcdFx0aXNCb3VuZCAmJiBpc0JvdW5kLiRJc0JvdW5kLFxuXHRcdFx0XHRcdGRhdGFGaWVsZC5BY3Rpb24gYXMgc3RyaW5nLFxuXHRcdFx0XHRcdHRoaXMuY29udGV4dFBhdGgsXG5cdFx0XHRcdFx0Q2hhcnRIZWxwZXIuZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKGNoYXJ0Q29udGV4dC5nZXRPYmplY3QoKSwgeyBjb250ZXh0OiBjaGFydENvbnRleHQgfSksXG5cdFx0XHRcdFx0YWN0aW9uLmVuYWJsZU9uU2VsZWN0IHx8IFwiXCJcblx0XHRcdCAgKTtcblx0fTtcblxuXHRnZXRTZWdtZW50ZWRCdXR0b24gPSAoKSA9PiB7XG5cdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbiBsYXlvdXRJbmZvcm1hdGlvbj1cIntcblx0XHRcdGFnZ3JlZ2F0aW9uTmFtZTogJ2VuZCcsXG5cdFx0XHRhbGlnbm1lbnQ6ICdFbmQnXG5cdFx0fVwiPlxuXHRcdFx0PFNlZ21lbnRlZEJ1dHRvblxuXHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiU2VnbWVudGVkQnV0dG9uXCIsIFwiVGVtcGxhdGVDb250ZW50Vmlld1wiXSl9XCJcblx0XHRcdFx0c2VsZWN0PVwiJHt0aGlzLmNoYXJ0RGVmaW5pdGlvbiEub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkfVwiXG5cdFx0XHRcdHZpc2libGU9XCJ7PSBcXCR7cGFnZUludGVybmFsPmFscENvbnRlbnRWaWV3fSAhPT0gJ1RhYmxlJyB9XCJcblx0XHRcdFx0c2VsZWN0ZWRLZXk9XCJ7cGFnZUludGVybmFsPmFscENvbnRlbnRWaWV3fVwiXG5cdFx0XHQ+XG5cdFx0XHRcdDxpdGVtcz5cblx0XHRcdFx0XHQke3RoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbXMoKX1cblx0XHRcdFx0PC9pdGVtcz5cblx0XHRcdDwvU2VnbWVudGVkQnV0dG9uPlxuXHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHR9O1xuXG5cdGdldFNlZ21lbnRlZEJ1dHRvbkl0ZW1zID0gKCkgPT4ge1xuXHRcdGNvbnN0IHNlZ21lbnRlZEJ1dHRvbkl0ZW1zID0gW107XG5cdFx0aWYgKENvbW1vbkhlbHBlci5pc0Rlc2t0b3AoKSkge1xuXHRcdFx0c2VnbWVudGVkQnV0dG9uSXRlbXMucHVzaChcblx0XHRcdFx0dGhpcy5nZXRTZWdtZW50ZWRCdXR0b25JdGVtKFxuXHRcdFx0XHRcdFwie3NhcC5mZS5pMThuPk1fQ09NTU9OX0hZQlJJRF9TRUdNRU5URURfQlVUVE9OX0lURU1fVE9PTFRJUH1cIixcblx0XHRcdFx0XHRcIkh5YnJpZFwiLFxuXHRcdFx0XHRcdFwic2FwLWljb246Ly9jaGFydC10YWJsZS12aWV3XCJcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0c2VnbWVudGVkQnV0dG9uSXRlbXMucHVzaChcblx0XHRcdHRoaXMuZ2V0U2VnbWVudGVkQnV0dG9uSXRlbShcIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9DSEFSVF9TRUdNRU5URURfQlVUVE9OX0lURU1fVE9PTFRJUH1cIiwgXCJDaGFydFwiLCBcInNhcC1pY29uOi8vYmFyLWNoYXJ0XCIpXG5cdFx0KTtcblx0XHRzZWdtZW50ZWRCdXR0b25JdGVtcy5wdXNoKFxuXHRcdFx0dGhpcy5nZXRTZWdtZW50ZWRCdXR0b25JdGVtKFwie3NhcC5mZS5pMThuPk1fQ09NTU9OX1RBQkxFX1NFR01FTlRFRF9CVVRUT05fSVRFTV9UT09MVElQfVwiLCBcIlRhYmxlXCIsIFwic2FwLWljb246Ly90YWJsZS12aWV3XCIpXG5cdFx0KTtcblx0XHRyZXR1cm4gc2VnbWVudGVkQnV0dG9uSXRlbXM7XG5cdH07XG5cblx0Z2V0U2VnbWVudGVkQnV0dG9uSXRlbSA9ICh0b29sdGlwOiBzdHJpbmcsIGtleTogc3RyaW5nLCBpY29uOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4geG1sYDxTZWdtZW50ZWRCdXR0b25JdGVtXG5cdFx0XHR0b29sdGlwPVwiJHt0b29sdGlwfVwiXG5cdFx0XHRrZXk9XCIke2tleX1cIlxuXHRcdFx0aWNvbj1cIiR7aWNvbn1cIlxuXHRcdC8+YDtcblx0fTtcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW5ub3RhdGlvbiBwYXRoIHBvaW50aW5nIHRvIHRoZSB2aXN1YWxpemF0aW9uIGFubm90YXRpb24gKENoYXJ0KS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BzIFRoZSBjaGFydCBwcm9wZXJ0aWVzXG5cdCAqIEBwYXJhbSBjb250ZXh0T2JqZWN0UGF0aCBUaGUgZGF0YW1vZGVsIG9iamVjdCBwYXRoIGZvciB0aGUgY2hhcnRcblx0ICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSBhbm5vdGF0aW9uIHBhdGhcblx0ICovXG5cdHN0YXRpYyBnZXRWaXN1YWxpemF0aW9uUGF0aCA9IChcblx0XHRwcm9wczogUHJvcGVydGllc09mPENoYXJ0QmxvY2s+LFxuXHRcdGNvbnRleHRPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcblx0KSA9PiB7XG5cdFx0Y29uc3QgbWV0YVBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGNvbnRleHRPYmplY3RQYXRoKTtcblxuXHRcdC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgQ2hhcnQgaWYgbWV0YXBhdGggaXMgbm90IHNldFxuXHRcdGlmICghbWV0YVBhdGgpIHtcblx0XHRcdExvZy5lcnJvcihgTWlzc2luZyBtZXRhcGF0aCBwYXJhbWV0ZXIgZm9yIENoYXJ0YCk7XG5cdFx0XHRyZXR1cm4gYEAke1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0fWA7XG5cdFx0fVxuXG5cdFx0aWYgKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydCkge1xuXHRcdFx0cmV0dXJuIG1ldGFQYXRoOyAvLyBNZXRhUGF0aCBpcyBhbHJlYWR5IHBvaW50aW5nIHRvIGEgQ2hhcnRcblx0XHR9XG5cblx0XHQvL05lZWQgdG8gc3dpdGNoIHRvIHRoZSBjb250ZXh0IHJlbGF0ZWQgdGhlIFBWIG9yIFNQVlxuXHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihtZXRhUGF0aCk7XG5cblx0XHRsZXQgdmlzdWFsaXphdGlvbnM6IFZpc3VhbGl6YXRpb25BbmRQYXRoW10gPSBbXTtcblx0XHRzd2l0Y2ggKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdD8udGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRpZiAoY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9ucyA9IGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QuUHJlc2VudGF0aW9uVmFyaWFudCxcblx0XHRcdFx0XHRcdG1ldGFQYXRoLFxuXHRcdFx0XHRcdFx0cmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHR2aXN1YWxpemF0aW9ucyA9IGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LFxuXHRcdFx0XHRcdG1ldGFQYXRoLFxuXHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRjb25zdCBjaGFydFZpeiA9IHZpc3VhbGl6YXRpb25zLmZpbmQoKHZpeikgPT4ge1xuXHRcdFx0cmV0dXJuIHZpei52aXN1YWxpemF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkNoYXJ0O1xuXHRcdH0pO1xuXG5cdFx0aWYgKGNoYXJ0Vml6KSB7XG5cdFx0XHRyZXR1cm4gY2hhcnRWaXouYW5ub3RhdGlvblBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgQ2hhcnQgaWYgYW5ub3RhdGlvbiBtaXNzaW5nIGluIFBWXG5cdFx0XHRMb2cuZXJyb3IoYEJhZCBtZXRhcGF0aCBwYXJhbWV0ZXIgZm9yIGNoYXJ0OiAke2NvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtfWApO1xuXHRcdFx0cmV0dXJuIGBAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gO1xuXHRcdH1cblx0fTtcblxuXHRnZXRWaXNpYmxlID0gKGRhdGFGaWVsZENvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRjb25zdCBkYXRhRmllbGQgPSBkYXRhRmllbGRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdGlmIChkYXRhRmllbGRbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXSAmJiBkYXRhRmllbGRbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXS4kUGF0aCkge1xuXHRcdFx0Y29uc3QgaGlkZGVuUGF0aENvbnRleHQgPSB0aGlzLmNvbnRleHRQYXRoXG5cdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdC5jcmVhdGVCaW5kaW5nQ29udGV4dChcblx0XHRcdFx0XHRkYXRhRmllbGRDb250ZXh0LmdldFBhdGgoKSArIGAvQCR7VUlBbm5vdGF0aW9uVGVybXMuSGlkZGVufS8kUGF0aGAsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF0uJFBhdGhcblx0XHRcdFx0KTtcblx0XHRcdHJldHVybiBDaGFydEhlbHBlci5nZXRIaWRkZW5QYXRoRXhwcmVzc2lvbkZvclRhYmxlQWN0aW9uc0FuZElCTihkYXRhRmllbGRbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXS4kUGF0aCwge1xuXHRcdFx0XHRjb250ZXh0OiBoaWRkZW5QYXRoQ29udGV4dFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmIChkYXRhRmllbGRbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXSkge1xuXHRcdFx0cmV0dXJuICFkYXRhRmllbGRbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9O1xuXG5cdGdldENvbnRleHRQYXRoID0gKCkgPT4ge1xuXHRcdHJldHVybiB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKS5sYXN0SW5kZXhPZihcIi9cIikgPT09IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpLmxlbmd0aCAtIDFcblx0XHRcdD8gdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCkucmVwbGFjZUFsbChcIi9cIiwgXCJcIilcblx0XHRcdDogdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpW3RoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKS5sZW5ndGggLSAxXTtcblx0fTtcblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRsZXQgY2hhcnRkZWxlZ2F0ZSA9IFwiXCI7XG5cblx0XHRpZiAodGhpcy5fY3VzdG9tRGF0YS50YXJnZXRDb2xsZWN0aW9uUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0dGhpcy5ub0RhdGFUZXh0ID0gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIk1fQ0hBUlRfTk9fQU5OT1RBVElPTl9TRVRfVEVYVFwiKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5jaGFydERlbGVnYXRlKSB7XG5cdFx0XHRjaGFydGRlbGVnYXRlID0gdGhpcy5jaGFydERlbGVnYXRlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aCA9IHRoaXMuZ2V0Q29udGV4dFBhdGgoKTtcblx0XHRcdGNoYXJ0ZGVsZWdhdGUgPVxuXHRcdFx0XHRcIntuYW1lOidzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0RGVsZWdhdGUnLCBwYXlsb2FkOiB7Y29udGV4dFBhdGg6ICdcIiArXG5cdFx0XHRcdGNvbnRleHRQYXRoICtcblx0XHRcdFx0XCInLCBwYXJhbWV0ZXJzOnskJGdyb3VwSWQ6JyRhdXRvLldvcmtlcnMnfSwgc2VsZWN0aW9uTW9kZTogJ1wiICtcblx0XHRcdFx0dGhpcy5zZWxlY3Rpb25Nb2RlICtcblx0XHRcdFx0XCInfX1cIjtcblx0XHR9XG5cdFx0Y29uc3QgYmluZGluZyA9IFwie2ludGVybmFsPmNvbnRyb2xzL1wiICsgdGhpcy5pZCArIFwifVwiO1xuXHRcdGlmICghdGhpcy5oZWFkZXIpIHtcblx0XHRcdHRoaXMuaGVhZGVyID0gdGhpcy5fY2hhcnQ/LlRpdGxlPy50b1N0cmluZygpO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG1hY3JvOkNoYXJ0QVBJIHhtbG5zPVwic2FwLm1cIiB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3MuY2hhcnRcIiB4bWxuczp2YXJpYW50PVwic2FwLnVpLmZsLnZhcmlhbnRzXCIgeG1sbnM6cDEzbj1cInNhcC51aS5tZGMucDEzblwiIHhtbG5zOnVuaXR0ZXN0PVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvcHJlcHJvY2Vzc29yZXh0ZW5zaW9uL3NhcC5mZS51bml0dGVzdGluZy8xXCIgeG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiIHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIgeG1sbnM6Y2hhcnQ9XCJzYXAudWkubWRjLmNoYXJ0XCIgeG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiIHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCIgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCIgaWQ9XCIke1xuXHRcdFx0XHR0aGlzLl9hcGlJZFxuXHRcdFx0fVwiIHNlbGVjdGlvbkNoYW5nZT1cIiR7dGhpcy5zZWxlY3Rpb25DaGFuZ2V9XCIgc3RhdGVDaGFuZ2U9XCIke3RoaXMuc3RhdGVDaGFuZ2V9XCI+XG5cdFx0XHRcdDxtYWNybzpsYXlvdXREYXRhPlxuXHRcdFx0XHRcdDxGbGV4SXRlbURhdGEgZ3Jvd0ZhY3Rvcj1cIjFcIiBzaHJpbmtGYWN0b3I9XCIxXCIgLz5cblx0XHRcdFx0PC9tYWNybzpsYXlvdXREYXRhPlxuXHRcdFx0XHQ8bWRjOkNoYXJ0XG5cdFx0XHRcdFx0YmluZGluZz1cIiR7YmluZGluZ31cIlxuXHRcdFx0XHRcdHVuaXR0ZXN0OmlkPVwiQ2hhcnRNYWNyb0ZyYWdtZW50XCJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy5fY29udGVudElkfVwiXG5cdFx0XHRcdFx0Y2hhcnRUeXBlPVwiJHt0aGlzLl9jaGFydFR5cGV9XCJcblx0XHRcdFx0XHRzb3J0Q29uZGl0aW9ucz1cIiR7dGhpcy5fc29ydENvbmR0aW9uc31cIlxuXHRcdFx0XHRcdGhlYWRlcj1cIiR7dGhpcy5oZWFkZXJ9XCJcblx0XHRcdFx0XHRoZWFkZXJWaXNpYmxlPVwiJHt0aGlzLmhlYWRlclZpc2libGV9XCJcblx0XHRcdFx0XHRoZWlnaHQ9XCIke3RoaXMuaGVpZ2h0fVwiXG5cdFx0XHRcdFx0d2lkdGg9XCIke3RoaXMud2lkdGh9XCJcblx0XHRcdFx0XHRoZWFkZXJMZXZlbD1cIiR7dGhpcy5oZWFkZXJMZXZlbH1cIlxuXHRcdFx0XHRcdHAxM25Nb2RlPVwiJHt0aGlzLnBlcnNvbmFsaXphdGlvbn1cIlxuXHRcdFx0XHRcdGZpbHRlcj1cIiR7dGhpcy5maWx0ZXJ9XCJcblx0XHRcdFx0XHRub0RhdGFUZXh0PVwiJHt0aGlzLm5vRGF0YVRleHR9XCJcblx0XHRcdFx0XHRhdXRvQmluZE9uSW5pdD1cIiR7dGhpcy5hdXRvQmluZE9uSW5pdH1cIlxuXHRcdFx0XHRcdGRlbGVnYXRlPVwiJHtjaGFydGRlbGVnYXRlfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOnRhcmdldENvbGxlY3Rpb25QYXRoPVwiJHt0aGlzLl9jdXN0b21EYXRhLnRhcmdldENvbGxlY3Rpb25QYXRofVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOmVudGl0eVNldD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5lbnRpdHlTZXR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZW50aXR5VHlwZT1cIiR7dGhpcy5fY3VzdG9tRGF0YS5lbnRpdHlUeXBlfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOm9wZXJhdGlvbkF2YWlsYWJsZU1hcD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5vcGVyYXRpb25BdmFpbGFibGVNYXB9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM9XCIke3RoaXMuX2N1c3RvbURhdGEubXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnN9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6c2VnbWVudGVkQnV0dG9uSWQ9XCIke3RoaXMuX2N1c3RvbURhdGEuc2VnbWVudGVkQnV0dG9uSWR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6Y3VzdG9tQWdnPVwiJHt0aGlzLl9jdXN0b21EYXRhLmN1c3RvbUFnZ31cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTp0cmFuc0FnZz1cIiR7dGhpcy5fY3VzdG9tRGF0YS50cmFuc0FnZ31cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTphcHBseVN1cHBvcnRlZD1cIiR7dGhpcy5fY3VzdG9tRGF0YS5hcHBseVN1cHBvcnRlZH1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTp2aXpQcm9wZXJ0aWVzPVwiJHt0aGlzLl9jdXN0b21EYXRhLnZpelByb3BlcnRpZXN9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6ZHJhZnRTdXBwb3J0ZWQ9XCIke3RoaXMuX2N1c3RvbURhdGEuZHJhZnRTdXBwb3J0ZWR9XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bXVsdGlWaWV3cz1cIiR7dGhpcy5fY3VzdG9tRGF0YS5tdWx0aVZpZXdzfVwiXG5cdFx0XHRcdFx0bWFjcm9kYXRhOnNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoPVwiJHt0aGlzLl9jdXN0b21EYXRhLnNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRofVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0PG1kYzpkZXBlbmRlbnRzPlxuXHRcdFx0XHRcdCR7dGhpcy5nZXREZXBlbmRlbnRzKHRoaXMuX2NoYXJ0Q29udGV4dCl9XG5cdFx0XHRcdFx0JHt0aGlzLmdldFBlcnNpc3RlbmNlUHJvdmlkZXIoKX1cblx0XHRcdFx0PC9tZGM6ZGVwZW5kZW50cz5cblx0XHRcdFx0PG1kYzppdGVtcz5cblx0XHRcdFx0XHQke3RoaXMuZ2V0SXRlbXModGhpcy5fY2hhcnRDb250ZXh0KX1cblx0XHRcdFx0PC9tZGM6aXRlbXM+XG5cdFx0XHRcdCR7dGhpcy5fYWN0aW9uc31cblx0XHRcdFx0JHt0aGlzLmNyZWF0ZVZhcmlhbnRNYW5hZ2VtZW50KCl9XG5cdFx0XHQ8L21kYzpDaGFydD5cblx0XHQ8L21hY3JvOkNoYXJ0QVBJPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNkNBLE1BQU1BLFdBQXNDLEdBQUc7SUFDOUMsdURBQXVELEVBQUUsT0FBTztJQUNoRSx1REFBdUQsRUFBRSxPQUFPO0lBQ2hFLHVEQUF1RCxFQUFFLE9BQU87SUFDaEUsdURBQXVELEVBQUU7RUFDMUQsQ0FBQztFQUFDLElBZ0JHQyxxQkFBcUI7RUFPMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsV0FQS0EscUJBQXFCO0lBQXJCQSxxQkFBcUI7SUFBckJBLHFCQUFxQjtJQUFyQkEscUJBQXFCO0lBQXJCQSxxQkFBcUI7RUFBQSxHQUFyQkEscUJBQXFCLEtBQXJCQSxxQkFBcUI7RUFhMUIsTUFBTUMseUJBQXlCLEdBQUcsVUFBVUMsV0FBb0IsRUFBRTtJQUFBO0lBQ2pFLElBQUlDLGtCQUFrQixHQUFHLElBQUk7SUFDN0IsTUFBTUMsTUFBTSxHQUFHRixXQUFXO0lBQzFCLElBQUlHLFdBQTBCLEdBQUcsRUFBRTtJQUNuQyxNQUFNQyxTQUFTLDJCQUFHRixNQUFNLENBQUNHLFlBQVksQ0FBQyxLQUFLLENBQUMseURBQTFCLHFCQUE0QkMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7SUFDdkUsSUFBSUosTUFBTSxDQUFDSyxRQUFRLENBQUNDLE1BQU0sSUFBSU4sTUFBTSxDQUFDTyxTQUFTLEtBQUssYUFBYSxJQUFJUCxNQUFNLENBQUNRLFlBQVksS0FBSyxlQUFlLEVBQUU7TUFDNUcsTUFBTUMsWUFB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QUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BcHZDZ0IsTUFBTTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BUVAsTUFBTTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0EyQklRLFVBQVUsQ0FBQ0MsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BU2pCLFVBQVU7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQWlFTCxLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9