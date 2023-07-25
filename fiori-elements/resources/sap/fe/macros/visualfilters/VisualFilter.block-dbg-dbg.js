/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "./fragments/InteractiveBarChart", "./fragments/InteractiveChartWithError", "./fragments/InteractiveLineChart", "./InteractiveChartHelper"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, DataVisualization, Aggregation, MetaModelConverter, ModelHelper, StableIdHelper, InteractiveBarChart, InteractiveChartWithError, InteractiveLineChart, InteractiveChartHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24;
  var _exports = {};
  var getInteractiveLineChartTemplate = InteractiveLineChart.getInteractiveLineChartTemplate;
  var getInteractiveChartWithErrorTemplate = InteractiveChartWithError.getInteractiveChartWithErrorTemplate;
  var getInteractiveBarChartTemplate = InteractiveBarChart.getInteractiveBarChartTemplate;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getDefaultSelectionVariant = DataVisualization.getDefaultSelectionVariant;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let VisualFilterBlock = (
  /**
   * Building block for creating a VisualFilter based on the metadata provided by OData V4.
   * <br>
   * A Chart annotation is required to bring up an interactive chart
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:VisualFilter
   *   collection="{entitySet&gt;}"
   *   chartAnnotation="{chartAnnotation&gt;}"
   *   id="someID"
   *   groupId="someGroupID"
   *   title="some Title"
   * /&gt;
   * </pre>
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "VisualFilter",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty"]
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec9 = blockAttribute({
    type: "array"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "boolean"
  }), _dec12 = blockAttribute({
    type: "boolean"
  }), _dec13 = blockAttribute({
    type: "string"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec16 = blockAttribute({
    type: "boolean"
  }), _dec17 = blockAttribute({
    type: "string"
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "boolean"
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "string"
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec25 = blockAttribute({
    type: "boolean"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(VisualFilterBlock, _BuildingBlockBase);
    function VisualFilterBlock(props, configuration, mSettings) {
      var _this$metaPath, _this$chartAnnotation, _this$chartAnnotation2, _this$chartAnnotation4, _this$chartAnnotation5, _this$chartAnnotation6, _this$chartAnnotation7, _visualizations$, _visualizations$$$tar, _visualizations$2, _visualizations$2$$ta, _visualizations$2$$ta2, _visualizations$2$$ta3, _aggregation$Aggregat, _aggregation$Aggregat2, _propertyAnnotations$, _aggregatableProperty, _this$chartAnnotation8, _this$contextPath;
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outParameter", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valuelistProperty", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionVariantAnnotation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inParameters", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "multipleSelectionAllowed", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showOverlayInitially", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "renderLineChart", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiredProperties", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarEntityType", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showError", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartMeasure", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "UoMHasCustomAggregate", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "customAggregate", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groupId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "errorMessageTitle", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "errorMessage", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftSupported", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isValueListWithFixedValues", _descriptor24, _assertThisInitialized(_this));
      _this.groupId = "$auto.visualFilters";
      _this.path = (_this$metaPath = _this.metaPath) === null || _this$metaPath === void 0 ? void 0 : _this$metaPath.getPath();
      const contextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      const converterContext = _this.getConverterContext(contextObjectPath, undefined, mSettings);
      const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
      const customAggregates = aggregationHelper.getCustomAggregateDefinitions();
      const pvAnnotation = contextObjectPath.targetObject;
      let measure;
      const visualizations = pvAnnotation && pvAnnotation.Visualizations;
      _this.getChartAnnotation(visualizations, converterContext);
      let aggregations,
        custAggMeasure = [];
      if ((_this$chartAnnotation = _this.chartAnnotation) !== null && _this$chartAnnotation !== void 0 && (_this$chartAnnotation2 = _this$chartAnnotation.Measures) !== null && _this$chartAnnotation2 !== void 0 && _this$chartAnnotation2.length) {
        custAggMeasure = customAggregates.filter(custAgg => {
          var _this$chartAnnotation3;
          return custAgg.qualifier === ((_this$chartAnnotation3 = _this.chartAnnotation) === null || _this$chartAnnotation3 === void 0 ? void 0 : _this$chartAnnotation3.Measures[0].value);
        });
        measure = custAggMeasure.length > 0 ? custAggMeasure[0].qualifier : _this.chartAnnotation.Measures[0].value;
        aggregations = aggregationHelper.getAggregatedProperties("AggregatedProperties")[0];
      }
      // if there are AggregatedProperty objects but no dynamic measures, rather there are transformation aggregates found in measures
      if (aggregations && aggregations.length > 0 && !((_this$chartAnnotation4 = _this.chartAnnotation) !== null && _this$chartAnnotation4 !== void 0 && _this$chartAnnotation4.DynamicMeasures) && custAggMeasure.length === 0 && (_this$chartAnnotation5 = _this.chartAnnotation) !== null && _this$chartAnnotation5 !== void 0 && _this$chartAnnotation5.Measures && ((_this$chartAnnotation6 = _this.chartAnnotation) === null || _this$chartAnnotation6 === void 0 ? void 0 : _this$chartAnnotation6.Measures.length) > 0) {
        Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
      }
      //if the chart has dynamic measures, but with no other custom aggregate measures then consider the dynamic measures
      if ((_this$chartAnnotation7 = _this.chartAnnotation) !== null && _this$chartAnnotation7 !== void 0 && _this$chartAnnotation7.DynamicMeasures) {
        if (custAggMeasure.length === 0) {
          measure = converterContext.getConverterContextFor(converterContext.getAbsoluteAnnotationPath(_this.chartAnnotation.DynamicMeasures[0].value)).getDataModelObjectPath().targetObject.Name;
          aggregations = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        } else {
          Log.warning("The dynamic measures have been ignored as visual filters can deal with only 1 measure and the first (custom aggregate) measure defined under Chart.Measures is considered.");
        }
      }
      if (customAggregates.some(function (custAgg) {
        return custAgg.qualifier === measure;
      })) {
        _this.customAggregate = true;
      }
      const defaultSelectionVariant = getDefaultSelectionVariant(converterContext.getEntityType());
      _this.checkSelectionVariant(defaultSelectionVariant);
      const aggregation = _this.getAggregateProperties(aggregations, measure);
      if (aggregation) {
        _this.aggregateProperties = aggregation;
      }
      const propertyAnnotations = visualizations && ((_visualizations$ = visualizations[0]) === null || _visualizations$ === void 0 ? void 0 : (_visualizations$$$tar = _visualizations$.$target) === null || _visualizations$$$tar === void 0 ? void 0 : _visualizations$$$tar.Measures) && ((_visualizations$2 = visualizations[0]) === null || _visualizations$2 === void 0 ? void 0 : (_visualizations$2$$ta = _visualizations$2.$target) === null || _visualizations$2$$ta === void 0 ? void 0 : (_visualizations$2$$ta2 = _visualizations$2$$ta.Measures[0]) === null || _visualizations$2$$ta2 === void 0 ? void 0 : (_visualizations$2$$ta3 = _visualizations$2$$ta2.$target) === null || _visualizations$2$$ta3 === void 0 ? void 0 : _visualizations$2$$ta3.annotations);
      const aggregatablePropertyAnnotations = aggregation === null || aggregation === void 0 ? void 0 : (_aggregation$Aggregat = aggregation.AggregatableProperty) === null || _aggregation$Aggregat === void 0 ? void 0 : (_aggregation$Aggregat2 = _aggregation$Aggregat.$target) === null || _aggregation$Aggregat2 === void 0 ? void 0 : _aggregation$Aggregat2.annotations;
      _this.checkIfUOMHasCustomAggregate(customAggregates, propertyAnnotations, aggregatablePropertyAnnotations);
      const propertyHidden = propertyAnnotations === null || propertyAnnotations === void 0 ? void 0 : (_propertyAnnotations$ = propertyAnnotations.UI) === null || _propertyAnnotations$ === void 0 ? void 0 : _propertyAnnotations$.Hidden;
      const aggregatablePropertyHidden = aggregatablePropertyAnnotations === null || aggregatablePropertyAnnotations === void 0 ? void 0 : (_aggregatableProperty = aggregatablePropertyAnnotations.UI) === null || _aggregatableProperty === void 0 ? void 0 : _aggregatableProperty.Hidden;
      const hiddenMeasure = _this.getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, _this.customAggregate);
      const chartType = (_this$chartAnnotation8 = _this.chartAnnotation) === null || _this$chartAnnotation8 === void 0 ? void 0 : _this$chartAnnotation8.ChartType;
      _this.chartType = chartType;
      _this.showValueHelp = _this.getShowValueHelp(chartType, hiddenMeasure);
      _this.draftSupported = ModelHelper.isDraftSupported(mSettings.models.metaModel, (_this$contextPath = _this.contextPath) === null || _this$contextPath === void 0 ? void 0 : _this$contextPath.getPath());
      /**
       * If the measure of the chart is marked as 'hidden', or if the chart type is invalid, or if the data type for the line chart is invalid,
       * the call is made to the InteractiveChartWithError fragment (using error-message related APIs, but avoiding batch calls)
       */
      _this.errorMessage = _this.getErrorMessage(hiddenMeasure, measure);
      _this.chartMeasure = measure;
      _this.measureDimensionTitle = InteractiveChartHelper.getMeasureDimensionTitle(_this.chartAnnotation, _this.customAggregate, _this.aggregateProperties);
      const collection = getInvolvedDataModelObjects(_this.contextPath);
      _this.toolTip = InteractiveChartHelper.getToolTip(_this.chartAnnotation, collection, _this.path, _this.customAggregate, _this.aggregateProperties, _this.renderLineChart);
      _this.UoMVisibility = InteractiveChartHelper.getUoMVisiblity(_this.chartAnnotation, _this.showError);
      _this.scaleUoMTitle = InteractiveChartHelper.getScaleUoMTitle(_this.chartAnnotation, collection, _this.path, _this.customAggregate, _this.aggregateProperties);
      _this.filterCountBinding = InteractiveChartHelper.getfilterCountBinding(_this.chartAnnotation);
      return _this;
    }
    _exports = VisualFilterBlock;
    var _proto = VisualFilterBlock.prototype;
    _proto.checkIfUOMHasCustomAggregate = function checkIfUOMHasCustomAggregate(customAggregates, propertyAnnotations, aggregatablePropertyAnnotations) {
      const measures = propertyAnnotations === null || propertyAnnotations === void 0 ? void 0 : propertyAnnotations.Measures;
      const aggregatablePropertyMeasures = aggregatablePropertyAnnotations === null || aggregatablePropertyAnnotations === void 0 ? void 0 : aggregatablePropertyAnnotations.Measures;
      const UOM = this.getUoM(measures, aggregatablePropertyMeasures);
      if (UOM && customAggregates.some(function (custAgg) {
        return custAgg.qualifier === UOM;
      })) {
        this.UoMHasCustomAggregate = true;
      } else {
        this.UoMHasCustomAggregate = false;
      }
    };
    _proto.getChartAnnotation = function getChartAnnotation(visualizations, converterContext) {
      if (visualizations) {
        for (let i = 0; i < visualizations.length; i++) {
          const sAnnotationPath = visualizations[i] && visualizations[i].value;
          this.chartAnnotation = converterContext.getEntityTypeAnnotation(sAnnotationPath) && converterContext.getEntityTypeAnnotation(sAnnotationPath).annotation;
        }
      }
    };
    _proto.getErrorMessage = function getErrorMessage(hiddenMeasure, measure) {
      let validChartType;
      if (this.chartAnnotation) {
        if (this.chartAnnotation.ChartType === "UI.ChartType/Line" || this.chartAnnotation.ChartType === "UI.ChartType/Bar") {
          validChartType = true;
        } else {
          validChartType = false;
        }
      }
      if (typeof hiddenMeasure === "boolean" && hiddenMeasure || !validChartType || this.renderLineChart === "false") {
        this.showError = true;
        this.errorMessageTitle = hiddenMeasure || !validChartType ? this.getTranslatedText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE") : this.getTranslatedText("M_VISUAL_FILTER_LINE_CHART_INVALID_DATATYPE");
        if (hiddenMeasure) {
          return this.getTranslatedText("M_VISUAL_FILTER_HIDDEN_MEASURE", [measure]);
        } else if (!validChartType) {
          return this.getTranslatedText("M_VISUAL_FILTER_UNSUPPORTED_CHART_TYPE");
        } else {
          return this.getTranslatedText("M_VISUAL_FILTER_LINE_CHART_UNSUPPORTED_DIMENSION");
        }
      }
    };
    _proto.getShowValueHelp = function getShowValueHelp(chartType, hiddenMeasure) {
      var _this$chartAnnotation9, _this$chartAnnotation10;
      const sDimensionType = ((_this$chartAnnotation9 = this.chartAnnotation) === null || _this$chartAnnotation9 === void 0 ? void 0 : _this$chartAnnotation9.Dimensions[0]) && ((_this$chartAnnotation10 = this.chartAnnotation) === null || _this$chartAnnotation10 === void 0 ? void 0 : _this$chartAnnotation10.Dimensions[0].$target) && this.chartAnnotation.Dimensions[0].$target.type;
      if (sDimensionType === "Edm.Date" || sDimensionType === "Edm.Time" || sDimensionType === "Edm.DateTimeOffset") {
        return false;
      } else if (typeof hiddenMeasure === "boolean" && hiddenMeasure) {
        return false;
      } else if (!(chartType === "UI.ChartType/Bar" || chartType === "UI.ChartType/Line")) {
        return false;
      } else if (this.renderLineChart === "false" && chartType === "UI.ChartType/Line") {
        return false;
      } else if (this.isValueListWithFixedValues === true) {
        return false;
      } else {
        return true;
      }
    };
    _proto.checkSelectionVariant = function checkSelectionVariant(defaultSelectionVariant) {
      let selectionVariant;
      if (this.selectionVariantAnnotation) {
        var _this$metaPath2;
        const selectionVariantContext = (_this$metaPath2 = this.metaPath) === null || _this$metaPath2 === void 0 ? void 0 : _this$metaPath2.getModel().createBindingContext(this.selectionVariantAnnotation.getPath());
        selectionVariant = selectionVariantContext && getInvolvedDataModelObjects(selectionVariantContext, this.contextPath).targetObject;
      }
      if (!selectionVariant && defaultSelectionVariant) {
        selectionVariant = defaultSelectionVariant;
      }
      if (selectionVariant && selectionVariant.SelectOptions && !this.multipleSelectionAllowed) {
        for (const selectOption of selectionVariant.SelectOptions) {
          var _this$chartAnnotation11;
          if (selectOption.PropertyName.value === ((_this$chartAnnotation11 = this.chartAnnotation) === null || _this$chartAnnotation11 === void 0 ? void 0 : _this$chartAnnotation11.Dimensions[0].value)) {
            if (selectOption.Ranges.length > 1) {
              Log.error("Multiple SelectOptions for FilterField having SingleValue Allowed Expression");
            }
          }
        }
      }
    };
    _proto.getAggregateProperties = function getAggregateProperties(aggregations, measure) {
      let matchedAggregate;
      if (!aggregations) {
        return;
      }
      aggregations.some(function (aggregate) {
        if (aggregate.Name === measure) {
          matchedAggregate = aggregate;
          return true;
        }
      });
      return matchedAggregate;
    };
    _proto.getUoM = function getUoM(measures, aggregatablePropertyMeasures) {
      var _ISOCurrency, _unit;
      let ISOCurrency = measures === null || measures === void 0 ? void 0 : measures.ISOCurrency;
      let unit = measures === null || measures === void 0 ? void 0 : measures.Unit;
      if (!ISOCurrency && !unit && aggregatablePropertyMeasures) {
        ISOCurrency = aggregatablePropertyMeasures.ISOCurrency;
        unit = aggregatablePropertyMeasures.Unit;
      }
      return ((_ISOCurrency = ISOCurrency) === null || _ISOCurrency === void 0 ? void 0 : _ISOCurrency.path) || ((_unit = unit) === null || _unit === void 0 ? void 0 : _unit.path);
    };
    _proto.getHiddenMeasure = function getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, customAggregate) {
      if (!customAggregate && aggregatablePropertyHidden) {
        return aggregatablePropertyHidden.valueOf();
      } else {
        return propertyHidden === null || propertyHidden === void 0 ? void 0 : propertyHidden.valueOf();
      }
    };
    _proto.getRequired = function getRequired() {
      if (this.required) {
        return xml`<Label text="" width="0.5rem" required="true">
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Label>`;
      } else {
        return xml``;
      }
    };
    _proto.getUoMTitle = function getUoMTitle(showErrorExpression) {
      if (this.UoMVisibility) {
        return xml`<Title
							id="${generate([this.id, "ScaleUoMTitle"])}"
							visible="{= !${showErrorExpression}}"
							text="${this.scaleUoMTitle}"
							titleStyle="H6"
							level="H3"
							width="4.15rem"
						/>`;
      } else {
        return xml``;
      }
    };
    _proto.getValueHelp = function getValueHelp(showErrorExpression) {
      if (this.showValueHelp) {
        return xml`<ToolbarSpacer />
						<Button
							id="${generate([this.id, "VisualFilterValueHelpButton"])}"
							type="Transparent"
							ariaHasPopup="Dialog"
							text="${this.filterCountBinding}"
							press="VisualFilterRuntime.fireValueHelp"
							enabled="{= !${showErrorExpression}}"
							customData:multipleSelectionAllowed="${this.multipleSelectionAllowed}"
						>
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Button>`;
      } else {
        return xml``;
      }
    };
    _proto.getInteractiveChartFragment = function getInteractiveChartFragment() {
      if (this.showError) {
        return getInteractiveChartWithErrorTemplate(this);
      } else if (this.chartType === "UI.ChartType/Bar") {
        return getInteractiveBarChartTemplate(this);
      } else if (this.chartType === "UI.ChartType/Line") {
        return getInteractiveLineChartTemplate(this);
      }
      return xml``;
    };
    _proto.getTemplate = function getTemplate() {
      const id = generate([this.path]);
      const showErrorExpression = "${internal>" + id + "/showError}";
      return xml`
		<control:VisualFilter
		core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
		xmlns="sap.m"
		xmlns:control="sap.fe.core.controls.filterbar"
		xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		xmlns:core="sap.ui.core"
		id="${this.id}"
		height="13rem"
		width="20.5rem"
		class="sapUiSmallMarginBeginEnd"
		customData:infoPath="${generate([this.path])}"
	>
		<VBox height="2rem" class="sapUiSmallMarginBottom">
			<OverflowToolbar style="Clear">
				${this.getRequired()}
				<Title
					id="${generate([this.id, "MeasureDimensionTitle"])}"
					text="${this.measureDimensionTitle}"
					tooltip="${this.toolTip}"
					titleStyle="H6"
					level="H3"
					class="sapUiTinyMarginEnd sapUiNoMarginBegin"
				/>
				${this.getUoMTitle(showErrorExpression)}
				${this.getValueHelp(showErrorExpression)}
			</OverflowToolbar>
		</VBox>
		<VBox height="100%" width="100%">
			${this.getInteractiveChartFragment()}
		</VBox>
	</control:VisualFilter>`;
    };
    return VisualFilterBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "outParameter", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "valuelistProperty", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "selectionVariantAnnotation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "inParameters", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "multipleSelectionAllowed", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "showOverlayInitially", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "renderLineChart", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "requiredProperties", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "filterBarEntityType", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "showError", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "chartMeasure", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "UoMHasCustomAggregate", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "customAggregate", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "$auto.visualFilters";
    }
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "errorMessageTitle", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "errorMessage", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "draftSupported", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "isValueListWithFixedValues", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = VisualFilterBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwicHJvcHMiLCJjb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwiZ3JvdXBJZCIsInBhdGgiLCJtZXRhUGF0aCIsImdldFBhdGgiLCJjb250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNvbnRleHRQYXRoIiwiY29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJ1bmRlZmluZWQiLCJhZ2dyZWdhdGlvbkhlbHBlciIsIkFnZ3JlZ2F0aW9uSGVscGVyIiwiZ2V0RW50aXR5VHlwZSIsImN1c3RvbUFnZ3JlZ2F0ZXMiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsInB2QW5ub3RhdGlvbiIsInRhcmdldE9iamVjdCIsIm1lYXN1cmUiLCJ2aXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwiZ2V0Q2hhcnRBbm5vdGF0aW9uIiwiYWdncmVnYXRpb25zIiwiY3VzdEFnZ01lYXN1cmUiLCJjaGFydEFubm90YXRpb24iLCJNZWFzdXJlcyIsImxlbmd0aCIsImZpbHRlciIsImN1c3RBZ2ciLCJxdWFsaWZpZXIiLCJ2YWx1ZSIsImdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwiRHluYW1pY01lYXN1cmVzIiwiTG9nIiwid2FybmluZyIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsIk5hbWUiLCJzb21lIiwiY3VzdG9tQWdncmVnYXRlIiwiZGVmYXVsdFNlbGVjdGlvblZhcmlhbnQiLCJnZXREZWZhdWx0U2VsZWN0aW9uVmFyaWFudCIsImNoZWNrU2VsZWN0aW9uVmFyaWFudCIsImFnZ3JlZ2F0aW9uIiwiZ2V0QWdncmVnYXRlUHJvcGVydGllcyIsImFnZ3JlZ2F0ZVByb3BlcnRpZXMiLCJwcm9wZXJ0eUFubm90YXRpb25zIiwiJHRhcmdldCIsImFubm90YXRpb25zIiwiYWdncmVnYXRhYmxlUHJvcGVydHlBbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiY2hlY2tJZlVPTUhhc0N1c3RvbUFnZ3JlZ2F0ZSIsInByb3BlcnR5SGlkZGVuIiwiVUkiLCJIaWRkZW4iLCJhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbiIsImhpZGRlbk1lYXN1cmUiLCJnZXRIaWRkZW5NZWFzdXJlIiwiY2hhcnRUeXBlIiwiQ2hhcnRUeXBlIiwic2hvd1ZhbHVlSGVscCIsImdldFNob3dWYWx1ZUhlbHAiLCJkcmFmdFN1cHBvcnRlZCIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImVycm9yTWVzc2FnZSIsImdldEVycm9yTWVzc2FnZSIsImNoYXJ0TWVhc3VyZSIsIm1lYXN1cmVEaW1lbnNpb25UaXRsZSIsIkludGVyYWN0aXZlQ2hhcnRIZWxwZXIiLCJnZXRNZWFzdXJlRGltZW5zaW9uVGl0bGUiLCJjb2xsZWN0aW9uIiwidG9vbFRpcCIsImdldFRvb2xUaXAiLCJyZW5kZXJMaW5lQ2hhcnQiLCJVb01WaXNpYmlsaXR5IiwiZ2V0VW9NVmlzaWJsaXR5Iiwic2hvd0Vycm9yIiwic2NhbGVVb01UaXRsZSIsImdldFNjYWxlVW9NVGl0bGUiLCJmaWx0ZXJDb3VudEJpbmRpbmciLCJnZXRmaWx0ZXJDb3VudEJpbmRpbmciLCJtZWFzdXJlcyIsImFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMiLCJVT00iLCJnZXRVb00iLCJVb01IYXNDdXN0b21BZ2dyZWdhdGUiLCJpIiwic0Fubm90YXRpb25QYXRoIiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJhbm5vdGF0aW9uIiwidmFsaWRDaGFydFR5cGUiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImdldFRyYW5zbGF0ZWRUZXh0Iiwic0RpbWVuc2lvblR5cGUiLCJEaW1lbnNpb25zIiwiaXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJzZWxlY3Rpb25WYXJpYW50Iiwic2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24iLCJzZWxlY3Rpb25WYXJpYW50Q29udGV4dCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJTZWxlY3RPcHRpb25zIiwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwic2VsZWN0T3B0aW9uIiwiUHJvcGVydHlOYW1lIiwiUmFuZ2VzIiwiZXJyb3IiLCJtYXRjaGVkQWdncmVnYXRlIiwiYWdncmVnYXRlIiwiSVNPQ3VycmVuY3kiLCJ1bml0IiwiVW5pdCIsInZhbHVlT2YiLCJnZXRSZXF1aXJlZCIsInhtbCIsImdldFVvTVRpdGxlIiwic2hvd0Vycm9yRXhwcmVzc2lvbiIsImdlbmVyYXRlIiwiaWQiLCJnZXRWYWx1ZUhlbHAiLCJnZXRJbnRlcmFjdGl2ZUNoYXJ0RnJhZ21lbnQiLCJnZXRJbnRlcmFjdGl2ZUNoYXJ0V2l0aEVycm9yVGVtcGxhdGUiLCJnZXRJbnRlcmFjdGl2ZUJhckNoYXJ0VGVtcGxhdGUiLCJnZXRJbnRlcmFjdGl2ZUxpbmVDaGFydFRlbXBsYXRlIiwiZ2V0VGVtcGxhdGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlzdWFsRmlsdGVyLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFubm90YXRpb25QYXRoLCBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEN1c3RvbUFnZ3JlZ2F0ZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IEFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgUHJvcGVydHlBbm5vdGF0aW9ucyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvRWRtX1R5cGVzXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eUFubm90YXRpb25zX01lYXN1cmVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9NZWFzdXJlc19FZG1cIjtcbmltcG9ydCB7IENoYXJ0LCBIaWRkZW4sIFNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0U2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHsgUGFyYW1ldGVyVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvVmlzdWFsRmlsdGVyc1wiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB7IGdldEludGVyYWN0aXZlQmFyQ2hhcnRUZW1wbGF0ZSB9IGZyb20gXCIuL2ZyYWdtZW50cy9JbnRlcmFjdGl2ZUJhckNoYXJ0XCI7XG5pbXBvcnQgeyBnZXRJbnRlcmFjdGl2ZUNoYXJ0V2l0aEVycm9yVGVtcGxhdGUgfSBmcm9tIFwiLi9mcmFnbWVudHMvSW50ZXJhY3RpdmVDaGFydFdpdGhFcnJvclwiO1xuaW1wb3J0IHsgZ2V0SW50ZXJhY3RpdmVMaW5lQ2hhcnRUZW1wbGF0ZSB9IGZyb20gXCIuL2ZyYWdtZW50cy9JbnRlcmFjdGl2ZUxpbmVDaGFydFwiO1xuaW1wb3J0IEludGVyYWN0aXZlQ2hhcnRIZWxwZXIgZnJvbSBcIi4vSW50ZXJhY3RpdmVDaGFydEhlbHBlclwiO1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIFZpc3VhbEZpbHRlciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBBIENoYXJ0IGFubm90YXRpb24gaXMgcmVxdWlyZWQgdG8gYnJpbmcgdXAgYW4gaW50ZXJhY3RpdmUgY2hhcnRcbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86VmlzdWFsRmlsdGVyXG4gKiAgIGNvbGxlY3Rpb249XCJ7ZW50aXR5U2V0Jmd0O31cIlxuICogICBjaGFydEFubm90YXRpb249XCJ7Y2hhcnRBbm5vdGF0aW9uJmd0O31cIlxuICogICBpZD1cInNvbWVJRFwiXG4gKiAgIGdyb3VwSWQ9XCJzb21lR3JvdXBJRFwiXG4gKiAgIHRpdGxlPVwic29tZSBUaXRsZVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIlZpc3VhbEZpbHRlclwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlzdWFsRmlsdGVyQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dGl0bGU6IHN0cmluZyA9IFwiXCI7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdG91dFBhcmFtZXRlcj86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFsdWVsaXN0UHJvcGVydHk/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0c2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24/OiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJhcnJheVwiXG5cdH0pXG5cdGluUGFyYW1ldGVycz86IFBhcmFtZXRlclR5cGVbXTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdG11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRyZXF1aXJlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzaG93T3ZlcmxheUluaXRpYWxseT86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHJlbmRlckxpbmVDaGFydD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cmVxdWlyZWRQcm9wZXJ0aWVzPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGZpbHRlckJhckVudGl0eVR5cGU/OiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0c2hvd0Vycm9yPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0Y2hhcnRNZWFzdXJlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0VW9NSGFzQ3VzdG9tQWdncmVnYXRlPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dWYWx1ZUhlbHA/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0Y3VzdG9tQWdncmVnYXRlOiBib29sZWFuID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGdyb3VwSWQ6IHN0cmluZyA9IFwiJGF1dG8udmlzdWFsRmlsdGVyc1wiO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRlcnJvck1lc3NhZ2VUaXRsZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0ZXJyb3JNZXNzYWdlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0ZHJhZnRTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiBJbnRlcm5hbCBQcm9wZXJ0aWVzXG5cdCAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXHRhZ2dyZWdhdGVQcm9wZXJ0aWVzOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIHwgdW5kZWZpbmVkO1xuXG5cdGNoYXJ0VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRtZWFzdXJlRGltZW5zaW9uVGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHR0b29sVGlwOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0VW9NVmlzaWJpbGl0eTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuXHRzY2FsZVVvTVRpdGxlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0ZmlsdGVyQ291bnRCaW5kaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGNoYXJ0QW5ub3RhdGlvbj86IENoYXJ0O1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8VmlzdWFsRmlsdGVyQmxvY2s+LCBjb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55KSB7XG5cdFx0c3VwZXIocHJvcHMsIGNvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0dGhpcy5ncm91cElkID0gXCIkYXV0by52aXN1YWxGaWx0ZXJzXCI7XG5cdFx0dGhpcy5wYXRoID0gdGhpcy5tZXRhUGF0aD8uZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGNvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IGNvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQoY29udGV4dE9iamVjdFBhdGgsIHVuZGVmaW5lZCwgbVNldHRpbmdzKTtcblx0XHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0Y29uc3QgY3VzdG9tQWdncmVnYXRlcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCk7XG5cdFx0Y29uc3QgcHZBbm5vdGF0aW9uID0gY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdGxldCBtZWFzdXJlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgdmlzdWFsaXphdGlvbnMgPSBwdkFubm90YXRpb24gJiYgcHZBbm5vdGF0aW9uLlZpc3VhbGl6YXRpb25zO1xuXHRcdHRoaXMuZ2V0Q2hhcnRBbm5vdGF0aW9uKHZpc3VhbGl6YXRpb25zLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRsZXQgYWdncmVnYXRpb25zLFxuXHRcdFx0Y3VzdEFnZ01lYXN1cmUgPSBbXTtcblxuXHRcdGlmICh0aGlzLmNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXM/Lmxlbmd0aCkge1xuXHRcdFx0Y3VzdEFnZ01lYXN1cmUgPSBjdXN0b21BZ2dyZWdhdGVzLmZpbHRlcigoY3VzdEFnZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gY3VzdEFnZy5xdWFsaWZpZXIgPT09IHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5NZWFzdXJlc1swXS52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0bWVhc3VyZSA9IGN1c3RBZ2dNZWFzdXJlLmxlbmd0aCA+IDAgPyBjdXN0QWdnTWVhc3VyZVswXS5xdWFsaWZpZXIgOiB0aGlzLmNoYXJ0QW5ub3RhdGlvbi5NZWFzdXJlc1swXS52YWx1ZTtcblx0XHRcdGFnZ3JlZ2F0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnRpZXNcIilbMF07XG5cdFx0fVxuXHRcdC8vIGlmIHRoZXJlIGFyZSBBZ2dyZWdhdGVkUHJvcGVydHkgb2JqZWN0cyBidXQgbm8gZHluYW1pYyBtZWFzdXJlcywgcmF0aGVyIHRoZXJlIGFyZSB0cmFuc2Zvcm1hdGlvbiBhZ2dyZWdhdGVzIGZvdW5kIGluIG1lYXN1cmVzXG5cdFx0aWYgKFxuXHRcdFx0YWdncmVnYXRpb25zICYmXG5cdFx0XHRhZ2dyZWdhdGlvbnMubGVuZ3RoID4gMCAmJlxuXHRcdFx0IXRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EeW5hbWljTWVhc3VyZXMgJiZcblx0XHRcdGN1c3RBZ2dNZWFzdXJlLmxlbmd0aCA9PT0gMCAmJlxuXHRcdFx0dGhpcy5jaGFydEFubm90YXRpb24/Lk1lYXN1cmVzICYmXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXMubGVuZ3RoID4gMFxuXHRcdCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFwiVGhlIHRyYW5zZm9ybWF0aW9uYWwgYWdncmVnYXRlIG1lYXN1cmVzIGFyZSBjb25maWd1cmVkIGFzIENoYXJ0Lk1lYXN1cmVzIGJ1dCBzaG91bGQgYmUgY29uZmlndXJlZCBhcyBDaGFydC5EeW5hbWljTWVhc3VyZXMgaW5zdGVhZC4gUGxlYXNlIGNoZWNrIHRoZSBTQVAgSGVscCBkb2N1bWVudGF0aW9uIGFuZCBjb3JyZWN0IHRoZSBjb25maWd1cmF0aW9uIGFjY29yZGluZ2x5LlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL2lmIHRoZSBjaGFydCBoYXMgZHluYW1pYyBtZWFzdXJlcywgYnV0IHdpdGggbm8gb3RoZXIgY3VzdG9tIGFnZ3JlZ2F0ZSBtZWFzdXJlcyB0aGVuIGNvbnNpZGVyIHRoZSBkeW5hbWljIG1lYXN1cmVzXG5cdFx0aWYgKHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EeW5hbWljTWVhc3VyZXMpIHtcblx0XHRcdGlmIChjdXN0QWdnTWVhc3VyZS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bWVhc3VyZSA9IGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihjb252ZXJ0ZXJDb250ZXh0LmdldEFic29sdXRlQW5ub3RhdGlvblBhdGgodGhpcy5jaGFydEFubm90YXRpb24uRHluYW1pY01lYXN1cmVzWzBdLnZhbHVlKSlcblx0XHRcdFx0XHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdC5OYW1lO1xuXHRcdFx0XHRhZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBZ2dyZWdhdGVkUHJvcGVydGllcyhcIkFnZ3JlZ2F0ZWRQcm9wZXJ0eVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFwiVGhlIGR5bmFtaWMgbWVhc3VyZXMgaGF2ZSBiZWVuIGlnbm9yZWQgYXMgdmlzdWFsIGZpbHRlcnMgY2FuIGRlYWwgd2l0aCBvbmx5IDEgbWVhc3VyZSBhbmQgdGhlIGZpcnN0IChjdXN0b20gYWdncmVnYXRlKSBtZWFzdXJlIGRlZmluZWQgdW5kZXIgQ2hhcnQuTWVhc3VyZXMgaXMgY29uc2lkZXJlZC5cIlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzLnNvbWUoZnVuY3Rpb24gKGN1c3RBZ2cpIHtcblx0XHRcdFx0cmV0dXJuIGN1c3RBZ2cucXVhbGlmaWVyID09PSBtZWFzdXJlO1xuXHRcdFx0fSlcblx0XHQpIHtcblx0XHRcdHRoaXMuY3VzdG9tQWdncmVnYXRlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRjb25zdCBkZWZhdWx0U2VsZWN0aW9uVmFyaWFudCA9IGdldERlZmF1bHRTZWxlY3Rpb25WYXJpYW50KGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpKTtcblx0XHR0aGlzLmNoZWNrU2VsZWN0aW9uVmFyaWFudChkZWZhdWx0U2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0Y29uc3QgYWdncmVnYXRpb24gPSB0aGlzLmdldEFnZ3JlZ2F0ZVByb3BlcnRpZXMoYWdncmVnYXRpb25zLCBtZWFzdXJlKTtcblx0XHRpZiAoYWdncmVnYXRpb24pIHtcblx0XHRcdHRoaXMuYWdncmVnYXRlUHJvcGVydGllcyA9IGFnZ3JlZ2F0aW9uO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0eUFubm90YXRpb25zID1cblx0XHRcdHZpc3VhbGl6YXRpb25zICYmIHZpc3VhbGl6YXRpb25zWzBdPy4kdGFyZ2V0Py5NZWFzdXJlcyAmJiB2aXN1YWxpemF0aW9uc1swXT8uJHRhcmdldD8uTWVhc3VyZXNbMF0/LiR0YXJnZXQ/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnR5QW5ub3RhdGlvbnMgPSBhZ2dyZWdhdGlvbj8uQWdncmVnYXRhYmxlUHJvcGVydHk/LiR0YXJnZXQ/LmFubm90YXRpb25zO1xuXHRcdHRoaXMuY2hlY2tJZlVPTUhhc0N1c3RvbUFnZ3JlZ2F0ZShjdXN0b21BZ2dyZWdhdGVzLCBwcm9wZXJ0eUFubm90YXRpb25zLCBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zKTtcblx0XHRjb25zdCBwcm9wZXJ0eUhpZGRlbiA9IHByb3BlcnR5QW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydHlIaWRkZW4gPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPy5VST8uSGlkZGVuO1xuXHRcdGNvbnN0IGhpZGRlbk1lYXN1cmUgPSB0aGlzLmdldEhpZGRlbk1lYXN1cmUocHJvcGVydHlIaWRkZW4sIGFnZ3JlZ2F0YWJsZVByb3BlcnR5SGlkZGVuLCB0aGlzLmN1c3RvbUFnZ3JlZ2F0ZSk7XG5cdFx0Y29uc3QgY2hhcnRUeXBlID0gdGhpcy5jaGFydEFubm90YXRpb24/LkNoYXJ0VHlwZTtcblx0XHR0aGlzLmNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcblx0XHR0aGlzLnNob3dWYWx1ZUhlbHAgPSB0aGlzLmdldFNob3dWYWx1ZUhlbHAoY2hhcnRUeXBlLCBoaWRkZW5NZWFzdXJlKTtcblx0XHR0aGlzLmRyYWZ0U3VwcG9ydGVkID0gTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChtU2V0dGluZ3MubW9kZWxzLm1ldGFNb2RlbCwgdGhpcy5jb250ZXh0UGF0aD8uZ2V0UGF0aCgpKTtcblx0XHQvKipcblx0XHQgKiBJZiB0aGUgbWVhc3VyZSBvZiB0aGUgY2hhcnQgaXMgbWFya2VkIGFzICdoaWRkZW4nLCBvciBpZiB0aGUgY2hhcnQgdHlwZSBpcyBpbnZhbGlkLCBvciBpZiB0aGUgZGF0YSB0eXBlIGZvciB0aGUgbGluZSBjaGFydCBpcyBpbnZhbGlkLFxuXHRcdCAqIHRoZSBjYWxsIGlzIG1hZGUgdG8gdGhlIEludGVyYWN0aXZlQ2hhcnRXaXRoRXJyb3IgZnJhZ21lbnQgKHVzaW5nIGVycm9yLW1lc3NhZ2UgcmVsYXRlZCBBUElzLCBidXQgYXZvaWRpbmcgYmF0Y2ggY2FsbHMpXG5cdFx0ICovXG5cdFx0dGhpcy5lcnJvck1lc3NhZ2UgPSB0aGlzLmdldEVycm9yTWVzc2FnZShoaWRkZW5NZWFzdXJlLCBtZWFzdXJlKTtcblx0XHR0aGlzLmNoYXJ0TWVhc3VyZSA9IG1lYXN1cmU7XG5cdFx0dGhpcy5tZWFzdXJlRGltZW5zaW9uVGl0bGUgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldE1lYXN1cmVEaW1lbnNpb25UaXRsZShcblx0XHRcdHRoaXMuY2hhcnRBbm5vdGF0aW9uLFxuXHRcdFx0dGhpcy5jdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHR0aGlzLmFnZ3JlZ2F0ZVByb3BlcnRpZXNcblx0XHQpO1xuXHRcdGNvbnN0IGNvbGxlY3Rpb24gPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0dGhpcy50b29sVGlwID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRUb29sVGlwKFxuXHRcdFx0dGhpcy5jaGFydEFubm90YXRpb24sXG5cdFx0XHRjb2xsZWN0aW9uLFxuXHRcdFx0dGhpcy5wYXRoLFxuXHRcdFx0dGhpcy5jdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHR0aGlzLmFnZ3JlZ2F0ZVByb3BlcnRpZXMsXG5cdFx0XHR0aGlzLnJlbmRlckxpbmVDaGFydFxuXHRcdCk7XG5cdFx0dGhpcy5Vb01WaXNpYmlsaXR5ID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRVb01WaXNpYmxpdHkodGhpcy5jaGFydEFubm90YXRpb24sIHRoaXMuc2hvd0Vycm9yKTtcblx0XHR0aGlzLnNjYWxlVW9NVGl0bGUgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldFNjYWxlVW9NVGl0bGUoXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbixcblx0XHRcdGNvbGxlY3Rpb24sXG5cdFx0XHR0aGlzLnBhdGgsXG5cdFx0XHR0aGlzLmN1c3RvbUFnZ3JlZ2F0ZSxcblx0XHRcdHRoaXMuYWdncmVnYXRlUHJvcGVydGllc1xuXHRcdCk7XG5cdFx0dGhpcy5maWx0ZXJDb3VudEJpbmRpbmcgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldGZpbHRlckNvdW50QmluZGluZyh0aGlzLmNoYXJ0QW5ub3RhdGlvbik7XG5cdH1cblxuXHRjaGVja0lmVU9NSGFzQ3VzdG9tQWdncmVnYXRlKFxuXHRcdGN1c3RvbUFnZ3JlZ2F0ZXM6IEFycmF5PEN1c3RvbUFnZ3JlZ2F0ZT4sXG5cdFx0cHJvcGVydHlBbm5vdGF0aW9uczogUHJvcGVydHlBbm5vdGF0aW9ucyxcblx0XHRhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPzogUHJvcGVydHlBbm5vdGF0aW9uc1xuXHQpIHtcblx0XHRjb25zdCBtZWFzdXJlcyA9IHByb3BlcnR5QW5ub3RhdGlvbnM/Lk1lYXN1cmVzO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMgPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPy5NZWFzdXJlcztcblx0XHRjb25zdCBVT00gPSB0aGlzLmdldFVvTShtZWFzdXJlcywgYWdncmVnYXRhYmxlUHJvcGVydHlNZWFzdXJlcyk7XG5cdFx0aWYgKFxuXHRcdFx0VU9NICYmXG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzLnNvbWUoZnVuY3Rpb24gKGN1c3RBZ2c6IEN1c3RvbUFnZ3JlZ2F0ZSkge1xuXHRcdFx0XHRyZXR1cm4gY3VzdEFnZy5xdWFsaWZpZXIgPT09IFVPTTtcblx0XHRcdH0pXG5cdFx0KSB7XG5cdFx0XHR0aGlzLlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuVW9NSGFzQ3VzdG9tQWdncmVnYXRlID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0Z2V0Q2hhcnRBbm5vdGF0aW9uKHZpc3VhbGl6YXRpb25zOiBBcnJheTxBbm5vdGF0aW9uUGF0aDxDaGFydD4+LCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdFx0aWYgKHZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHZpc3VhbGl6YXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9IHZpc3VhbGl6YXRpb25zW2ldICYmIHZpc3VhbGl6YXRpb25zW2ldLnZhbHVlO1xuXHRcdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbiA9XG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzQW5ub3RhdGlvblBhdGgpICYmXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzQW5ub3RhdGlvblBhdGgpLmFubm90YXRpb247XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0RXJyb3JNZXNzYWdlKGhpZGRlbk1lYXN1cmU6IE9iamVjdCwgbWVhc3VyZT86IHN0cmluZykge1xuXHRcdGxldCB2YWxpZENoYXJ0VHlwZTtcblx0XHRpZiAodGhpcy5jaGFydEFubm90YXRpb24pIHtcblx0XHRcdGlmICh0aGlzLmNoYXJ0QW5ub3RhdGlvbi5DaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0xpbmVcIiB8fCB0aGlzLmNoYXJ0QW5ub3RhdGlvbi5DaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0JhclwiKSB7XG5cdFx0XHRcdHZhbGlkQ2hhcnRUeXBlID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbGlkQ2hhcnRUeXBlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICgodHlwZW9mIGhpZGRlbk1lYXN1cmUgPT09IFwiYm9vbGVhblwiICYmIGhpZGRlbk1lYXN1cmUpIHx8ICF2YWxpZENoYXJ0VHlwZSB8fCB0aGlzLnJlbmRlckxpbmVDaGFydCA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHR0aGlzLnNob3dFcnJvciA9IHRydWU7XG5cdFx0XHR0aGlzLmVycm9yTWVzc2FnZVRpdGxlID1cblx0XHRcdFx0aGlkZGVuTWVhc3VyZSB8fCAhdmFsaWRDaGFydFR5cGVcblx0XHRcdFx0XHQ/IHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIilcblx0XHRcdFx0XHQ6IHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfTElORV9DSEFSVF9JTlZBTElEX0RBVEFUWVBFXCIpO1xuXHRcdFx0aWYgKGhpZGRlbk1lYXN1cmUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfSElEREVOX01FQVNVUkVcIiwgW21lYXN1cmVdKTtcblx0XHRcdH0gZWxzZSBpZiAoIXZhbGlkQ2hhcnRUeXBlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiTV9WSVNVQUxfRklMVEVSX1VOU1VQUE9SVEVEX0NIQVJUX1RZUEVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIk1fVklTVUFMX0ZJTFRFUl9MSU5FX0NIQVJUX1VOU1VQUE9SVEVEX0RJTUVOU0lPTlwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRTaG93VmFsdWVIZWxwKGNoYXJ0VHlwZT86IHN0cmluZywgaGlkZGVuTWVhc3VyZT86IE9iamVjdCkge1xuXHRcdGNvbnN0IHNEaW1lbnNpb25UeXBlID1cblx0XHRcdHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EaW1lbnNpb25zWzBdICYmXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbj8uRGltZW5zaW9uc1swXS4kdGFyZ2V0ICYmXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbi5EaW1lbnNpb25zWzBdLiR0YXJnZXQudHlwZTtcblx0XHRpZiAoc0RpbWVuc2lvblR5cGUgPT09IFwiRWRtLkRhdGVcIiB8fCBzRGltZW5zaW9uVHlwZSA9PT0gXCJFZG0uVGltZVwiIHx8IHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgaGlkZGVuTWVhc3VyZSA9PT0gXCJib29sZWFuXCIgJiYgaGlkZGVuTWVhc3VyZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoIShjaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0JhclwiIHx8IGNoYXJ0VHlwZSA9PT0gXCJVSS5DaGFydFR5cGUvTGluZVwiKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5yZW5kZXJMaW5lQ2hhcnQgPT09IFwiZmFsc2VcIiAmJiBjaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0xpbmVcIikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5pc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyA9PT0gdHJ1ZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRjaGVja1NlbGVjdGlvblZhcmlhbnQoZGVmYXVsdFNlbGVjdGlvblZhcmlhbnQ/OiBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0bGV0IHNlbGVjdGlvblZhcmlhbnQ7XG5cdFx0aWYgKHRoaXMuc2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24pIHtcblx0XHRcdGNvbnN0IHNlbGVjdGlvblZhcmlhbnRDb250ZXh0ID0gdGhpcy5tZXRhUGF0aD8uZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0aGlzLnNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLmdldFBhdGgoKSk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50ID1cblx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudENvbnRleHQgJiYgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHNlbGVjdGlvblZhcmlhbnRDb250ZXh0LCB0aGlzLmNvbnRleHRQYXRoKS50YXJnZXRPYmplY3Q7XG5cdFx0fVxuXHRcdGlmICghc2VsZWN0aW9uVmFyaWFudCAmJiBkZWZhdWx0U2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudCA9IGRlZmF1bHRTZWxlY3Rpb25WYXJpYW50O1xuXHRcdH1cblx0XHRpZiAoc2VsZWN0aW9uVmFyaWFudCAmJiBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgJiYgIXRoaXMubXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNlbGVjdE9wdGlvbiBvZiBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUudmFsdWUgPT09IHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EaW1lbnNpb25zWzBdLnZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKHNlbGVjdE9wdGlvbi5SYW5nZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiTXVsdGlwbGUgU2VsZWN0T3B0aW9ucyBmb3IgRmlsdGVyRmllbGQgaGF2aW5nIFNpbmdsZVZhbHVlIEFsbG93ZWQgRXhwcmVzc2lvblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Z2V0QWdncmVnYXRlUHJvcGVydGllcyhhZ2dyZWdhdGlvbnM6IEFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGVbXSwgbWVhc3VyZT86IHN0cmluZykge1xuXHRcdGxldCBtYXRjaGVkQWdncmVnYXRlOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIHwgdW5kZWZpbmVkO1xuXHRcdGlmICghYWdncmVnYXRpb25zKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGFnZ3JlZ2F0aW9ucy5zb21lKGZ1bmN0aW9uIChhZ2dyZWdhdGUpIHtcblx0XHRcdGlmIChhZ2dyZWdhdGUuTmFtZSA9PT0gbWVhc3VyZSkge1xuXHRcdFx0XHRtYXRjaGVkQWdncmVnYXRlID0gYWdncmVnYXRlO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gbWF0Y2hlZEFnZ3JlZ2F0ZTtcblx0fVxuXG5cdGdldFVvTShtZWFzdXJlcz86IFByb3BlcnR5QW5ub3RhdGlvbnNfTWVhc3VyZXMsIGFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXM/OiBQcm9wZXJ0eUFubm90YXRpb25zX01lYXN1cmVzKSB7XG5cdFx0bGV0IElTT0N1cnJlbmN5ID0gbWVhc3VyZXM/LklTT0N1cnJlbmN5O1xuXHRcdGxldCB1bml0ID0gbWVhc3VyZXM/LlVuaXQ7XG5cdFx0aWYgKCFJU09DdXJyZW5jeSAmJiAhdW5pdCAmJiBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzKSB7XG5cdFx0XHRJU09DdXJyZW5jeSA9IGFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMuSVNPQ3VycmVuY3k7XG5cdFx0XHR1bml0ID0gYWdncmVnYXRhYmxlUHJvcGVydHlNZWFzdXJlcy5Vbml0O1xuXHRcdH1cblx0XHRyZXR1cm4gKElTT0N1cnJlbmN5IGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxTdHJpbmc+KT8ucGF0aCB8fCAodW5pdCBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248U3RyaW5nPik/LnBhdGg7XG5cdH1cblxuXHRnZXRIaWRkZW5NZWFzdXJlKHByb3BlcnR5SGlkZGVuOiBIaWRkZW4sIGFnZ3JlZ2F0YWJsZVByb3BlcnR5SGlkZGVuPzogSGlkZGVuLCBjdXN0b21BZ2dyZWdhdGU/OiBib29sZWFuKSB7XG5cdFx0aWYgKCFjdXN0b21BZ2dyZWdhdGUgJiYgYWdncmVnYXRhYmxlUHJvcGVydHlIaWRkZW4pIHtcblx0XHRcdHJldHVybiBhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbi52YWx1ZU9mKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBwcm9wZXJ0eUhpZGRlbj8udmFsdWVPZigpO1xuXHRcdH1cblx0fVxuXG5cdGdldFJlcXVpcmVkKCkge1xuXHRcdGlmICh0aGlzLnJlcXVpcmVkKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxMYWJlbCB0ZXh0PVwiXCIgd2lkdGg9XCIwLjVyZW1cIiByZXF1aXJlZD1cInRydWVcIj5cblx0XHRcdFx0XHRcdFx0PGxheW91dERhdGE+XG5cdFx0XHRcdFx0XHRcdFx0PE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJOZXZlclwiIC8+XG5cdFx0XHRcdFx0XHRcdDwvbGF5b3V0RGF0YT5cblx0XHRcdFx0XHRcdDwvTGFiZWw+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGBgO1xuXHRcdH1cblx0fVxuXG5cdGdldFVvTVRpdGxlKHNob3dFcnJvckV4cHJlc3Npb246IHN0cmluZykge1xuXHRcdGlmICh0aGlzLlVvTVZpc2liaWxpdHkpIHtcblx0XHRcdHJldHVybiB4bWxgPFRpdGxlXG5cdFx0XHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJTY2FsZVVvTVRpdGxlXCJdKX1cIlxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlPVwiez0gISR7c2hvd0Vycm9yRXhwcmVzc2lvbn19XCJcblx0XHRcdFx0XHRcdFx0dGV4dD1cIiR7dGhpcy5zY2FsZVVvTVRpdGxlfVwiXG5cdFx0XHRcdFx0XHRcdHRpdGxlU3R5bGU9XCJINlwiXG5cdFx0XHRcdFx0XHRcdGxldmVsPVwiSDNcIlxuXHRcdFx0XHRcdFx0XHR3aWR0aD1cIjQuMTVyZW1cIlxuXHRcdFx0XHRcdFx0Lz5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geG1sYGA7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VmFsdWVIZWxwKHNob3dFcnJvckV4cHJlc3Npb246IHN0cmluZykge1xuXHRcdGlmICh0aGlzLnNob3dWYWx1ZUhlbHApIHtcblx0XHRcdHJldHVybiB4bWxgPFRvb2xiYXJTcGFjZXIgLz5cblx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlZpc3VhbEZpbHRlclZhbHVlSGVscEJ1dHRvblwiXSl9XCJcblx0XHRcdFx0XHRcdFx0dHlwZT1cIlRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHRcdFx0YXJpYUhhc1BvcHVwPVwiRGlhbG9nXCJcblx0XHRcdFx0XHRcdFx0dGV4dD1cIiR7dGhpcy5maWx0ZXJDb3VudEJpbmRpbmd9XCJcblx0XHRcdFx0XHRcdFx0cHJlc3M9XCJWaXN1YWxGaWx0ZXJSdW50aW1lLmZpcmVWYWx1ZUhlbHBcIlxuXHRcdFx0XHRcdFx0XHRlbmFibGVkPVwiez0gISR7c2hvd0Vycm9yRXhwcmVzc2lvbn19XCJcblx0XHRcdFx0XHRcdFx0Y3VzdG9tRGF0YTptdWx0aXBsZVNlbGVjdGlvbkFsbG93ZWQ9XCIke3RoaXMubXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkfVwiXG5cdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdDxsYXlvdXREYXRhPlxuXHRcdFx0XHRcdFx0XHRcdDxPdmVyZmxvd1Rvb2xiYXJMYXlvdXREYXRhIHByaW9yaXR5PVwiTmV2ZXJcIiAvPlxuXHRcdFx0XHRcdFx0XHQ8L2xheW91dERhdGE+XG5cdFx0XHRcdFx0XHQ8L0J1dHRvbj5gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geG1sYGA7XG5cdFx0fVxuXHR9XG5cblx0Z2V0SW50ZXJhY3RpdmVDaGFydEZyYWdtZW50KCkge1xuXHRcdGlmICh0aGlzLnNob3dFcnJvcikge1xuXHRcdFx0cmV0dXJuIGdldEludGVyYWN0aXZlQ2hhcnRXaXRoRXJyb3JUZW1wbGF0ZSh0aGlzKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuY2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9CYXJcIikge1xuXHRcdFx0cmV0dXJuIGdldEludGVyYWN0aXZlQmFyQ2hhcnRUZW1wbGF0ZSh0aGlzKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuY2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9MaW5lXCIpIHtcblx0XHRcdHJldHVybiBnZXRJbnRlcmFjdGl2ZUxpbmVDaGFydFRlbXBsYXRlKHRoaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGlkID0gZ2VuZXJhdGUoW3RoaXMucGF0aF0pO1xuXHRcdGNvbnN0IHNob3dFcnJvckV4cHJlc3Npb24gPSBcIiR7aW50ZXJuYWw+XCIgKyBpZCArIFwiL3Nob3dFcnJvcn1cIjtcblx0XHRyZXR1cm4geG1sYFxuXHRcdDxjb250cm9sOlZpc3VhbEZpbHRlclxuXHRcdGNvcmU6cmVxdWlyZT1cIntWaXN1YWxGaWx0ZXJSdW50aW1lOiAnc2FwL2ZlL21hY3Jvcy92aXN1YWxmaWx0ZXJzL1Zpc3VhbEZpbHRlclJ1bnRpbWUnfVwiXG5cdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0eG1sbnM6Y29udHJvbD1cInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhclwiXG5cdFx0eG1sbnM6Y3VzdG9tRGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuXHRcdHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG5cdFx0aWQ9XCIke3RoaXMuaWR9XCJcblx0XHRoZWlnaHQ9XCIxM3JlbVwiXG5cdFx0d2lkdGg9XCIyMC41cmVtXCJcblx0XHRjbGFzcz1cInNhcFVpU21hbGxNYXJnaW5CZWdpbkVuZFwiXG5cdFx0Y3VzdG9tRGF0YTppbmZvUGF0aD1cIiR7Z2VuZXJhdGUoW3RoaXMucGF0aF0pfVwiXG5cdD5cblx0XHQ8VkJveCBoZWlnaHQ9XCIycmVtXCIgY2xhc3M9XCJzYXBVaVNtYWxsTWFyZ2luQm90dG9tXCI+XG5cdFx0XHQ8T3ZlcmZsb3dUb29sYmFyIHN0eWxlPVwiQ2xlYXJcIj5cblx0XHRcdFx0JHt0aGlzLmdldFJlcXVpcmVkKCl9XG5cdFx0XHRcdDxUaXRsZVxuXHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJNZWFzdXJlRGltZW5zaW9uVGl0bGVcIl0pfVwiXG5cdFx0XHRcdFx0dGV4dD1cIiR7dGhpcy5tZWFzdXJlRGltZW5zaW9uVGl0bGV9XCJcblx0XHRcdFx0XHR0b29sdGlwPVwiJHt0aGlzLnRvb2xUaXB9XCJcblx0XHRcdFx0XHR0aXRsZVN0eWxlPVwiSDZcIlxuXHRcdFx0XHRcdGxldmVsPVwiSDNcIlxuXHRcdFx0XHRcdGNsYXNzPVwic2FwVWlUaW55TWFyZ2luRW5kIHNhcFVpTm9NYXJnaW5CZWdpblwiXG5cdFx0XHRcdC8+XG5cdFx0XHRcdCR7dGhpcy5nZXRVb01UaXRsZShzaG93RXJyb3JFeHByZXNzaW9uKX1cblx0XHRcdFx0JHt0aGlzLmdldFZhbHVlSGVscChzaG93RXJyb3JFeHByZXNzaW9uKX1cblx0XHRcdDwvT3ZlcmZsb3dUb29sYmFyPlxuXHRcdDwvVkJveD5cblx0XHQ8VkJveCBoZWlnaHQ9XCIxMDAlXCIgd2lkdGg9XCIxMDAlXCI+XG5cdFx0XHQke3RoaXMuZ2V0SW50ZXJhY3RpdmVDaGFydEZyYWdtZW50KCl9XG5cdFx0PC9WQm94PlxuXHQ8L2NvbnRyb2w6VmlzdWFsRmlsdGVyPmA7XG5cdH1cbn1cbiJdLCJtYXBw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YUFBYSxHQUFHRSxFQUFFLEdBQUcsYUFBYTtNQUM5RCxPQUFPSixHQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUNJLEVBQUc7QUFDaEI7QUFDQTtBQUNBO0FBQ0EseUJBQXlCRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUN2SCxJQUFJLENBQUMsQ0FBRTtBQUMvQztBQUNBO0FBQ0E7QUFDQSxNQUFNLElBQUksQ0FBQ21ILFdBQVcsRUFBRztBQUN6QjtBQUNBLFdBQVdJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQ0MsRUFBRSxFQUFFLHVCQUF1QixDQUFDLENBQUU7QUFDeEQsYUFBYSxJQUFJLENBQUNuRCxxQkFBc0I7QUFDeEMsZ0JBQWdCLElBQUksQ0FBQ0ksT0FBUTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sSUFBSSxDQUFDNEMsV0FBVyxDQUFDQyxtQkFBbUIsQ0FBRTtBQUM1QyxNQUFNLElBQUksQ0FBQ0csWUFBWSxDQUFDSCxtQkFBbUIsQ0FBRTtBQUM3QztBQUNBO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQ0ksMkJBQTJCLEVBQUc7QUFDeEM7QUFDQSx5QkFBeUI7SUFDeEIsQ0FBQztJQUFBO0VBQUEsRUF4ZDZDSyxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQVUvQyxFQUFFO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9Bd0ZTLEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQUtkLHFCQUFxQjtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=