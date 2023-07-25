/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/chart/coloring/CriticalityType", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/library", "sap/m/FlexBox", "sap/m/Label", "sap/m/library", "sap/suite/ui/microchart/AreaMicroChart", "sap/suite/ui/microchart/ColumnMicroChart", "sap/suite/ui/microchart/ComparisonMicroChart", "sap/suite/ui/microchart/LineMicroChart", "sap/ui/core/Control", "sap/ui/core/format/NumberFormat", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataMetaModel", "sap/ui/model/type/Date"], function (Log, CriticalityType, ClassSupport, macroLib, FlexBox, Label, mobilelibrary, AreaMicroChart, ColumnMicroChart, ComparisonMicroChart, LineMicroChart, Control, NumberFormat, ODataV4ListBinding, ODataMetaModel, DateType) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const NavigationType = macroLib.NavigationType;
  const ValueColor = mobilelibrary.ValueColor;
  /**
   *  Container Control for Micro Chart and UoM.
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  let MicroChartContainer = (_dec = defineUI5Class("sap.fe.macros.microchart.MicroChartContainer"), _dec2 = property({
    type: "boolean",
    defaultValue: false
  }), _dec3 = property({
    type: "string",
    defaultValue: undefined
  }), _dec4 = property({
    type: "string[]",
    defaultValue: []
  }), _dec5 = property({
    type: "string",
    defaultValue: undefined
  }), _dec6 = property({
    type: "string[]",
    defaultValue: []
  }), _dec7 = property({
    type: "int",
    defaultValue: undefined
  }), _dec8 = property({
    type: "int",
    defaultValue: 1
  }), _dec9 = property({
    type: "int",
    defaultValue: undefined
  }), _dec10 = property({
    type: "string",
    defaultValue: ""
  }), _dec11 = property({
    type: "string",
    defaultValue: ""
  }), _dec12 = property({
    type: "sap.fe.macros.NavigationType",
    defaultValue: "None"
  }), _dec13 = property({
    type: "string",
    defaultValue: ""
  }), _dec14 = event(), _dec15 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec16 = aggregation({
    type: "sap.m.Label",
    multiple: false
  }), _dec17 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MicroChartContainer, _Control);
    function MicroChartContainer() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "showOnlyChart", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "uomPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measures", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dimension", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataPointQualifiers", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measurePrecision", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "measureScale", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dimensionPrecision", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartTitle", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartDescription", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationType", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "calendarPattern", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onTitlePressed", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "microChart", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_uomLabel", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "microChartTitle", _descriptor16, _assertThisInitialized(_this));
      return _this;
    }
    MicroChartContainer.render = function render(renderManager, control) {
      renderManager.openStart("div", control);
      renderManager.openEnd();
      if (!control.showOnlyChart) {
        const chartTitle = control.microChartTitle;
        if (chartTitle) {
          chartTitle.forEach(function (subChartTitle) {
            renderManager.openStart("div");
            renderManager.openEnd();
            renderManager.renderControl(subChartTitle);
            renderManager.close("div");
          });
        }
        renderManager.openStart("div");
        renderManager.openEnd();
        const chartDescription = new Label({
          text: control.chartDescription
        });
        renderManager.renderControl(chartDescription);
        renderManager.close("div");
      }
      const microChart = control.microChart;
      if (microChart) {
        microChart.addStyleClass("sapUiTinyMarginTopBottom");
        renderManager.renderControl(microChart);
        if (!control.showOnlyChart && control.uomPath) {
          const settings = control._checkIfChartRequiresRuntimeLabels() ? undefined : {
              text: {
                path: control.uomPath
              }
            },
            label = new Label(settings),
            flexBox = new FlexBox({
              alignItems: "Start",
              justifyContent: "End",
              items: [label]
            });
          renderManager.renderControl(flexBox);
          control.setAggregation("_uomLabel", label);
        }
      }
      renderManager.close("div");
    };
    var _proto = MicroChartContainer.prototype;
    _proto.onBeforeRendering = function onBeforeRendering() {
      const binding = this._getListBindingForRuntimeLabels();
      if (binding) {
        binding.detachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
        this._olistBinding = undefined;
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      const binding = this._getListBindingForRuntimeLabels();
      if (!this._checkIfChartRequiresRuntimeLabels()) {
        return;
      }
      if (binding) {
        binding.attachEvent("change", this._setRuntimeChartLabelsAndUnitOfMeasure, this);
        this._olistBinding = binding;
      }
    };
    _proto.setShowOnlyChart = function setShowOnlyChart(value) {
      if (!value && this._olistBinding) {
        this._setChartLabels();
      }
      this.setProperty("showOnlyChart", value, false /*re-rendering*/);
    };
    _proto._checkIfChartRequiresRuntimeLabels = function _checkIfChartRequiresRuntimeLabels() {
      const microChart = this.microChart;
      return Boolean(microChart instanceof AreaMicroChart || microChart instanceof ColumnMicroChart || microChart instanceof LineMicroChart || microChart instanceof ComparisonMicroChart);
    };
    _proto._checkForChartLabelAggregations = function _checkForChartLabelAggregations() {
      const microChart = this.microChart;
      return Boolean(microChart instanceof AreaMicroChart && microChart.getAggregation("firstYLabel") && microChart.getAggregation("lastYLabel") && microChart.getAggregation("firstXLabel") && microChart.getAggregation("lastXLabel") || microChart instanceof ColumnMicroChart && microChart.getAggregation("leftTopLabel") && microChart.getAggregation("rightTopLabel") && microChart.getAggregation("leftBottomLabel") && microChart.getAggregation("rightBottomLabel") || microChart instanceof LineMicroChart);
    };
    _proto._getListBindingForRuntimeLabels = function _getListBindingForRuntimeLabels() {
      const microChart = this.microChart;
      let binding;
      if (microChart instanceof AreaMicroChart) {
        const chart = microChart.getChart();
        binding = chart && chart.getBinding("points");
      } else if (microChart instanceof ColumnMicroChart) {
        binding = microChart.getBinding("columns");
      } else if (microChart instanceof LineMicroChart) {
        const lines = microChart.getLines();
        binding = lines && lines.length && lines[0].getBinding("points");
      } else if (microChart instanceof ComparisonMicroChart) {
        binding = microChart.getBinding("data");
      }
      return binding instanceof ODataV4ListBinding ? binding : false;
    };
    _proto._setRuntimeChartLabelsAndUnitOfMeasure = async function _setRuntimeChartLabelsAndUnitOfMeasure() {
      const listBinding = this._olistBinding,
        contexts = listBinding === null || listBinding === void 0 ? void 0 : listBinding.getContexts(),
        measures = this.measures,
        dimension = this.dimension,
        unitOfMeasurePath = this.uomPath,
        microChart = this.microChart,
        unitOfMeasureLabel = this._uomLabel;
      if (unitOfMeasureLabel && unitOfMeasurePath && contexts && contexts.length && !this.showOnlyChart) {
        unitOfMeasureLabel.setText(contexts[0].getObject(unitOfMeasurePath));
      } else if (unitOfMeasureLabel) {
        unitOfMeasureLabel.setText("");
      }
      if (!this._checkForChartLabelAggregations()) {
        return;
      }
      if (!contexts || !contexts.length) {
        this._setChartLabels();
        return;
      }
      const firstContext = contexts[0],
        lastContext = contexts[contexts.length - 1],
        linesPomises = [],
        lineChart = microChart instanceof LineMicroChart,
        currentMinX = firstContext.getObject(dimension),
        currentMaxX = lastContext.getObject(dimension);
      let currentMinY,
        currentMaxY,
        minX = {
          value: Infinity
        },
        maxX = {
          value: -Infinity
        },
        minY = {
          value: Infinity
        },
        maxY = {
          value: -Infinity
        };
      minX = currentMinX == undefined ? minX : {
        context: firstContext,
        value: currentMinX
      };
      maxX = currentMaxX == undefined ? maxX : {
        context: lastContext,
        value: currentMaxX
      };
      if (measures !== null && measures !== void 0 && measures.length) {
        measures.forEach((measure, i) => {
          currentMinY = firstContext.getObject(measure);
          currentMaxY = lastContext.getObject(measure);
          maxY = currentMaxY > maxY.value ? {
            context: lastContext,
            value: currentMaxY,
            index: lineChart ? i : 0
          } : maxY;
          minY = currentMinY < minY.value ? {
            context: firstContext,
            value: currentMinY,
            index: lineChart ? i : 0
          } : minY;
          if (lineChart) {
            linesPomises.push(this._getCriticalityFromPoint({
              context: lastContext,
              value: currentMaxY,
              index: i
            }));
          }
        });
      }
      this._setChartLabels(minY.value, maxY.value, minX.value, maxX.value);
      if (lineChart) {
        const colors = await Promise.all(linesPomises);
        if (colors !== null && colors !== void 0 && colors.length) {
          const lines = microChart.getLines();
          lines.forEach(function (line, i) {
            line.setColor(colors[i]);
          });
        }
      } else {
        await this._setChartLabelsColors(maxY, minY);
      }
    };
    _proto._setChartLabelsColors = async function _setChartLabelsColors(maxY, minY) {
      const microChart = this.microChart;
      const criticality = await Promise.all([this._getCriticalityFromPoint(minY), this._getCriticalityFromPoint(maxY)]);
      if (microChart instanceof AreaMicroChart) {
        microChart.getAggregation("firstYLabel").setProperty("color", criticality[0], true);
        microChart.getAggregation("lastYLabel").setProperty("color", criticality[1], true);
      } else if (microChart instanceof ColumnMicroChart) {
        microChart.getAggregation("leftTopLabel").setProperty("color", criticality[0], true);
        microChart.getAggregation("rightTopLabel").setProperty("color", criticality[1], true);
      }
    };
    _proto._setChartLabels = function _setChartLabels(leftTop, rightTop, leftBottom, rightBottom) {
      const microChart = this.microChart;
      leftTop = this._formatDateAndNumberValue(leftTop, this.measurePrecision, this.measureScale);
      rightTop = this._formatDateAndNumberValue(rightTop, this.measurePrecision, this.measureScale);
      leftBottom = this._formatDateAndNumberValue(leftBottom, this.dimensionPrecision, undefined, this.calendarPattern);
      rightBottom = this._formatDateAndNumberValue(rightBottom, this.dimensionPrecision, undefined, this.calendarPattern);
      if (microChart instanceof AreaMicroChart) {
        microChart.getAggregation("firstYLabel").setProperty("label", leftTop, false);
        microChart.getAggregation("lastYLabel").setProperty("label", rightTop, false);
        microChart.getAggregation("firstXLabel").setProperty("label", leftBottom, false);
        microChart.getAggregation("lastXLabel").setProperty("label", rightBottom, false);
      } else if (microChart instanceof ColumnMicroChart) {
        microChart.getAggregation("leftTopLabel").setProperty("label", leftTop, false);
        microChart.getAggregation("rightTopLabel").setProperty("label", rightTop, false);
        microChart.getAggregation("leftBottomLabel").setProperty("label", leftBottom, false);
        microChart.getAggregation("rightBottomLabel").setProperty("label", rightBottom, false);
      } else if (microChart instanceof LineMicroChart) {
        microChart.setProperty("leftTopLabel", leftTop, false);
        microChart.setProperty("rightTopLabel", rightTop, false);
        microChart.setProperty("leftBottomLabel", leftBottom, false);
        microChart.setProperty("rightBottomLabel", rightBottom, false);
      }
    };
    _proto._getCriticalityFromPoint = async function _getCriticalityFromPoint(point) {
      if (point !== null && point !== void 0 && point.context) {
        const metaModel = this.getModel() && this.getModel().getMetaModel(),
          dataPointQualifiers = this.dataPointQualifiers,
          metaPath = metaModel instanceof ODataMetaModel && point.context.getPath() && metaModel.getMetaPath(point.context.getPath());
        if (typeof metaPath === "string") {
          const dataPoint = await metaModel.requestObject(`${metaPath}/@${"com.sap.vocabularies.UI.v1.DataPoint"}${point.index !== undefined && dataPointQualifiers[point.index] ? `#${dataPointQualifiers[point.index]}` : ""}`);
          if (dataPoint) {
            let criticality = ValueColor.Neutral;
            const context = point.context;
            if (dataPoint.Criticality) {
              criticality = this._criticality(dataPoint.Criticality, context);
            } else if (dataPoint.CriticalityCalculation) {
              const criticalityCalculation = dataPoint.CriticalityCalculation;
              const getValue = function (valueProperty) {
                let valueResponse;
                if (valueProperty !== null && valueProperty !== void 0 && valueProperty.$Path) {
                  valueResponse = context.getObject(valueProperty.$Path);
                } else if (valueProperty !== null && valueProperty !== void 0 && valueProperty.hasOwnProperty("$Decimal")) {
                  valueResponse = valueProperty.$Decimal;
                }
                return valueResponse;
              };
              criticality = this._criticalityCalculation(criticalityCalculation.ImprovementDirection.$EnumMember, point.value, getValue(criticalityCalculation.DeviationRangeLowValue), getValue(criticalityCalculation.ToleranceRangeLowValue), getValue(criticalityCalculation.AcceptanceRangeLowValue), getValue(criticalityCalculation.AcceptanceRangeHighValue), getValue(criticalityCalculation.ToleranceRangeHighValue), getValue(criticalityCalculation.DeviationRangeHighValue));
            }
            return criticality;
          }
        }
      }
      return Promise.resolve(ValueColor.Neutral);
    };
    _proto._criticality = function _criticality(criticality, context) {
      let criticalityValue, result;
      if (criticality.$Path) {
        criticalityValue = context.getObject(criticality.$Path);
        if (criticalityValue === CriticalityType.Negative || criticalityValue.toString() === "1") {
          result = ValueColor.Error;
        } else if (criticalityValue === CriticalityType.Critical || criticalityValue.toString() === "2") {
          result = ValueColor.Critical;
        } else if (criticalityValue === CriticalityType.Positive || criticalityValue.toString() === "3") {
          result = ValueColor.Good;
        }
      } else if (criticality.$EnumMember) {
        criticalityValue = criticality.$EnumMember;
        if (criticalityValue.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Negative") > -1) {
          result = ValueColor.Error;
        } else if (criticalityValue.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Positive") > -1) {
          result = ValueColor.Good;
        } else if (criticalityValue.indexOf("com.sap.vocabularies.UI.v1.CriticalityType/Critical") > -1) {
          result = ValueColor.Critical;
        }
      }
      if (result === undefined) {
        Log.warning("Case not supported, returning the default Value Neutral");
        return ValueColor.Neutral;
      }
      return result;
    };
    _proto._criticalityCalculation = function _criticalityCalculation(improvementDirection, value, deviationLow, toleranceLow, acceptanceLow, acceptanceHigh, toleranceHigh, deviationHigh) {
      let result;

      // Dealing with Decimal and Path based bingdings
      deviationLow = deviationLow == undefined ? -Infinity : deviationLow;
      toleranceLow = toleranceLow == undefined ? deviationLow : toleranceLow;
      acceptanceLow = acceptanceLow == undefined ? toleranceLow : acceptanceLow;
      deviationHigh = deviationHigh == undefined ? Infinity : deviationHigh;
      toleranceHigh = toleranceHigh == undefined ? deviationHigh : toleranceHigh;
      acceptanceHigh = acceptanceHigh == undefined ? toleranceHigh : acceptanceHigh;

      // Creating runtime expression binding from criticality calculation for Criticality State
      if (improvementDirection.indexOf("Minimize") > -1) {
        if (value <= acceptanceHigh) {
          result = ValueColor.Good;
        } else if (value <= toleranceHigh) {
          result = ValueColor.Neutral;
        } else if (value <= deviationHigh) {
          result = ValueColor.Critical;
        } else {
          result = ValueColor.Error;
        }
      } else if (improvementDirection.indexOf("Maximize") > -1) {
        if (value >= acceptanceLow) {
          result = ValueColor.Good;
        } else if (value >= toleranceLow) {
          result = ValueColor.Neutral;
        } else if (value >= deviationLow) {
          result = ValueColor.Critical;
        } else {
          result = ValueColor.Error;
        }
      } else if (improvementDirection.indexOf("Target") > -1) {
        if (value <= acceptanceHigh && value >= acceptanceLow) {
          result = ValueColor.Good;
        } else if (value >= toleranceLow && value < acceptanceLow || value > acceptanceHigh && value <= toleranceHigh) {
          result = ValueColor.Neutral;
        } else if (value >= deviationLow && value < toleranceLow || value > toleranceHigh && value <= deviationHigh) {
          result = ValueColor.Critical;
        } else {
          result = ValueColor.Error;
        }
      }
      if (result === undefined) {
        Log.warning("Case not supported, returning the default Value Neutral");
        return ValueColor.Neutral;
      }
      return result;
    };
    _proto._formatDateAndNumberValue = function _formatDateAndNumberValue(value, precision, scale, pattern) {
      if (pattern) {
        return this._getSemanticsValueFormatter(pattern).formatValue(value, "string");
      } else if (!isNaN(value)) {
        return this._getLabelNumberFormatter(precision, scale).format(value);
      }
      return value;
    };
    _proto._getSemanticsValueFormatter = function _getSemanticsValueFormatter(pattern) {
      if (!this._oDateType) {
        this._oDateType = new DateType({
          style: "short",
          source: {
            pattern
          }
        });
      }
      return this._oDateType;
    };
    _proto._getLabelNumberFormatter = function _getLabelNumberFormatter(precision, scale) {
      return NumberFormat.getFloatInstance({
        style: "short",
        showScale: true,
        precision: typeof precision === "number" && precision || 0,
        decimals: typeof scale === "number" && scale || 0
      });
    };
    return MicroChartContainer;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "showOnlyChart", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "uomPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "measures", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "dimension", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "dataPointQualifiers", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "measurePrecision", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "measureScale", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "dimensionPrecision", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "chartTitle", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "chartDescription", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "navigationType", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "calendarPattern", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "onTitlePressed", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "microChart", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "_uomLabel", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "microChartTitle", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MicroChartContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZpZ2F0aW9uVHlwZSIsIm1hY3JvTGliIiwiVmFsdWVDb2xvciIsIm1vYmlsZWxpYnJhcnkiLCJNaWNyb0NoYXJ0Q29udGFpbmVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJ1bmRlZmluZWQiLCJldmVudCIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiY29udHJvbCIsIm9wZW5TdGFydCIsIm9wZW5FbmQiLCJzaG93T25seUNoYXJ0IiwiY2hhcnRUaXRsZSIsIm1pY3JvQ2hhcnRUaXRsZSIsImZvckVhY2giLCJzdWJDaGFydFRpdGxlIiwicmVuZGVyQ29udHJvbCIsImNsb3NlIiwiY2hhcnREZXNjcmlwdGlvbiIsIkxhYmVsIiwidGV4dCIsIm1pY3JvQ2hhcnQiLCJhZGRTdHlsZUNsYXNzIiwidW9tUGF0aCIsInNldHRpbmdzIiwiX2NoZWNrSWZDaGFydFJlcXVpcmVzUnVudGltZUxhYmVscyIsInBhdGgiLCJsYWJlbCIsImZsZXhCb3giLCJGbGV4Qm94IiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwiaXRlbXMiLCJzZXRBZ2dyZWdhdGlvbiIsIm9uQmVmb3JlUmVuZGVyaW5nIiwiYmluZGluZyIsIl9nZXRMaXN0QmluZGluZ0ZvclJ1bnRpbWVMYWJlbHMiLCJkZXRhY2hFdmVudCIsIl9zZXRSdW50aW1lQ2hhcnRMYWJlbHNBbmRVbml0T2ZNZWFzdXJlIiwiX29saXN0QmluZGluZyIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJhdHRhY2hFdmVudCIsInNldFNob3dPbmx5Q2hhcnQiLCJ2YWx1ZSIsIl9zZXRDaGFydExhYmVscyIsInNldFByb3BlcnR5IiwiQm9vbGVhbiIsIkFyZWFNaWNyb0NoYXJ0IiwiQ29sdW1uTWljcm9DaGFydCIsIkxpbmVNaWNyb0NoYXJ0IiwiQ29tcGFyaXNvbk1pY3JvQ2hhcnQiLCJfY2hlY2tGb3JDaGFydExhYmVsQWdncmVnYXRpb25zIiwiZ2V0QWdncmVnYXRpb24iLCJjaGFydCIsImdldENoYXJ0IiwiZ2V0QmluZGluZyIsImxpbmVzIiwiZ2V0TGluZXMiLCJsZW5ndGgiLCJPRGF0YVY0TGlzdEJpbmRpbmciLCJsaXN0QmluZGluZyIsImNvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJtZWFzdXJlcyIsImRpbWVuc2lvbiIsInVuaXRPZk1lYXN1cmVQYXRoIiwidW5pdE9mTWVhc3VyZUxhYmVsIiwiX3VvbUxhYmVsIiwic2V0VGV4dCIsImdldE9iamVjdCIsImZpcnN0Q29udGV4dCIsImxhc3RDb250ZXh0IiwibGluZXNQb21pc2VzIiwibGluZUNoYXJ0IiwiY3VycmVudE1pblgiLCJjdXJyZW50TWF4WCIsImN1cnJlbnRNaW5ZIiwiY3VycmVudE1heFkiLCJtaW5YIiwiSW5maW5pdHkiLCJtYXhYIiwibWluWSIsIm1heFkiLCJjb250ZXh0IiwibWVhc3VyZSIsImkiLCJpbmRleCIsInB1c2giLCJfZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQiLCJjb2xvcnMiLCJQcm9taXNlIiwiYWxsIiwibGluZSIsInNldENvbG9yIiwiX3NldENoYXJ0TGFiZWxzQ29sb3JzIiwiY3JpdGljYWxpdHkiLCJsZWZ0VG9wIiwicmlnaHRUb3AiLCJsZWZ0Qm90dG9tIiwicmlnaHRCb3R0b20iLCJfZm9ybWF0RGF0ZUFuZE51bWJlclZhbHVlIiwibWVhc3VyZVByZWNpc2lvbiIsIm1lYXN1cmVTY2FsZSIsImRpbWVuc2lvblByZWNpc2lvbiIsImNhbGVuZGFyUGF0dGVybiIsInBvaW50IiwibWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJkYXRhUG9pbnRRdWFsaWZpZXJzIiwibWV0YVBhdGgiLCJPRGF0YU1ldGFNb2RlbCIsImdldFBhdGgiLCJnZXRNZXRhUGF0aCIsImRhdGFQb2ludCIsInJlcXVlc3RPYmplY3QiLCJOZXV0cmFsIiwiQ3JpdGljYWxpdHkiLCJfY3JpdGljYWxpdHkiLCJDcml0aWNhbGl0eUNhbGN1bGF0aW9uIiwiY3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsImdldFZhbHVlIiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlUmVzcG9uc2UiLCIkUGF0aCIsImhhc093blByb3BlcnR5IiwiJERlY2ltYWwiLCJfY3JpdGljYWxpdHlDYWxjdWxhdGlvbiIsIkltcHJvdmVtZW50RGlyZWN0aW9uIiwiJEVudW1NZW1iZXIiLCJEZXZpYXRpb25SYW5nZUxvd1ZhbHVlIiwiVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSIsIkFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlIiwiQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlIiwiVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUiLCJEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZSIsInJlc29sdmUiLCJjcml0aWNhbGl0eVZhbHVlIiwicmVzdWx0IiwiQ3JpdGljYWxpdHlUeXBlIiwiTmVnYXRpdmUiLCJ0b1N0cmluZyIsIkVycm9yIiwiQ3JpdGljYWwiLCJQb3NpdGl2ZSIsIkdvb2QiLCJpbmRleE9mIiwiTG9nIiwid2FybmluZyIsImltcHJvdmVtZW50RGlyZWN0aW9uIiwiZGV2aWF0aW9uTG93IiwidG9sZXJhbmNlTG93IiwiYWNjZXB0YW5jZUxvdyIsImFjY2VwdGFuY2VIaWdoIiwidG9sZXJhbmNlSGlnaCIsImRldmlhdGlvbkhpZ2giLCJwcmVjaXNpb24iLCJzY2FsZSIsInBhdHRlcm4iLCJfZ2V0U2VtYW50aWNzVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXRWYWx1ZSIsImlzTmFOIiwiX2dldExhYmVsTnVtYmVyRm9ybWF0dGVyIiwiZm9ybWF0IiwiX29EYXRlVHlwZSIsIkRhdGVUeXBlIiwic3R5bGUiLCJzb3VyY2UiLCJOdW1iZXJGb3JtYXQiLCJnZXRGbG9hdEluc3RhbmNlIiwic2hvd1NjYWxlIiwiZGVjaW1hbHMiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNaWNyb0NoYXJ0Q29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ3JpdGljYWxpdHlUeXBlIGZyb20gXCJzYXAvY2hhcnQvY29sb3JpbmcvQ3JpdGljYWxpdHlUeXBlXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IG1hY3JvTGliIGZyb20gXCJzYXAvZmUvbWFjcm9zL2xpYnJhcnlcIjtcbmltcG9ydCBGbGV4Qm94IGZyb20gXCJzYXAvbS9GbGV4Qm94XCI7XG5pbXBvcnQgTGFiZWwgZnJvbSBcInNhcC9tL0xhYmVsXCI7XG5pbXBvcnQgbW9iaWxlbGlicmFyeSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IEFyZWFNaWNyb0NoYXJ0IGZyb20gXCJzYXAvc3VpdGUvdWkvbWljcm9jaGFydC9BcmVhTWljcm9DaGFydFwiO1xuaW1wb3J0IENvbHVtbk1pY3JvQ2hhcnQgZnJvbSBcInNhcC9zdWl0ZS91aS9taWNyb2NoYXJ0L0NvbHVtbk1pY3JvQ2hhcnRcIjtcbmltcG9ydCBDb21wYXJpc29uTWljcm9DaGFydCBmcm9tIFwic2FwL3N1aXRlL3VpL21pY3JvY2hhcnQvQ29tcGFyaXNvbk1pY3JvQ2hhcnRcIjtcbmltcG9ydCBMaW5lTWljcm9DaGFydCBmcm9tIFwic2FwL3N1aXRlL3VpL21pY3JvY2hhcnQvTGluZU1pY3JvQ2hhcnRcIjtcbmltcG9ydCBMaW5lTWljcm9DaGFydExpbmUgZnJvbSBcInNhcC9zdWl0ZS91aS9taWNyb2NoYXJ0L0xpbmVNaWNyb0NoYXJ0TGluZVwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgTnVtYmVyRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvTnVtYmVyRm9ybWF0XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhVjRMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgRGF0ZVR5cGUgZnJvbSBcInNhcC91aS9tb2RlbC90eXBlL0RhdGVcIjtcblxuY29uc3QgTmF2aWdhdGlvblR5cGUgPSBtYWNyb0xpYi5OYXZpZ2F0aW9uVHlwZTtcbmNvbnN0IFZhbHVlQ29sb3IgPSBtb2JpbGVsaWJyYXJ5LlZhbHVlQ29sb3I7XG50eXBlIERhdGFQb2ludFZhbHVlVHlwZSA9IHtcblx0dmFsdWU6IG51bWJlcjtcblx0Y29udGV4dD86IENvbnRleHQ7XG5cdGluZGV4PzogbnVtYmVyO1xufTtcbi8qKlxuICogIENvbnRhaW5lciBDb250cm9sIGZvciBNaWNybyBDaGFydCBhbmQgVW9NLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MubWljcm9jaGFydC5NaWNyb0NoYXJ0Q29udGFpbmVyXCIpXG5jbGFzcyBNaWNyb0NoYXJ0Q29udGFpbmVyIGV4dGVuZHMgQ29udHJvbCB7XG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHR9KVxuXHRzaG93T25seUNoYXJ0ITogYm9vbGVhbjtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0dW9tUGF0aCE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nW11cIixcblx0XHRkZWZhdWx0VmFsdWU6IFtdXG5cdH0pXG5cdG1lYXN1cmVzITogc3RyaW5nW107XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGRlZmF1bHRWYWx1ZTogdW5kZWZpbmVkXG5cdH0pXG5cdGRpbWVuc2lvbj86IHN0cmluZztcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nW11cIixcblx0XHRkZWZhdWx0VmFsdWU6IFtdXG5cdH0pXG5cdGRhdGFQb2ludFF1YWxpZmllcnMhOiBzdHJpbmdbXTtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiaW50XCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0bWVhc3VyZVByZWNpc2lvbiE6IG51bWJlcjtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiaW50XCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiAxXG5cdH0pXG5cdG1lYXN1cmVTY2FsZSE6IG51bWJlcjtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiaW50XCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB1bmRlZmluZWRcblx0fSlcblx0ZGltZW5zaW9uUHJlY2lzaW9uPzogbnVtYmVyO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiXCJcblx0fSlcblx0Y2hhcnRUaXRsZSE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBcIlwiXG5cdH0pXG5cdGNoYXJ0RGVzY3JpcHRpb24hOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuTmF2aWdhdGlvblR5cGVcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiTm9uZVwiXG5cdH0pXG5cdG5hdmlnYXRpb25UeXBlITogdHlwZW9mIE5hdmlnYXRpb25UeXBlO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiXCJcblx0fSlcblx0Y2FsZW5kYXJQYXR0ZXJuITogc3RyaW5nO1xuXG5cdEBldmVudCgpXG5cdG9uVGl0bGVQcmVzc2VkITogRnVuY3Rpb247XG5cblx0QGFnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIixcblx0XHRtdWx0aXBsZTogZmFsc2UsXG5cdFx0aXNEZWZhdWx0OiB0cnVlXG5cdH0pXG5cdG1pY3JvQ2hhcnQhOiBDb250cm9sO1xuXG5cdEBhZ2dyZWdhdGlvbih7XG5cdFx0dHlwZTogXCJzYXAubS5MYWJlbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHR9KVxuXHRfdW9tTGFiZWwhOiBMYWJlbDtcblxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiB0cnVlXG5cdH0pXG5cdG1pY3JvQ2hhcnRUaXRsZSE6IENvbnRyb2xbXTtcblxuXHRwcml2YXRlIF9vbGlzdEJpbmRpbmc/OiBPRGF0YVY0TGlzdEJpbmRpbmc7XG5cblx0cHJpdmF0ZSBfb0RhdGVUeXBlPzogRGF0ZVR5cGU7XG5cblx0c3RhdGljIHJlbmRlcihyZW5kZXJNYW5hZ2VyOiBSZW5kZXJNYW5hZ2VyLCBjb250cm9sOiBNaWNyb0NoYXJ0Q29udGFpbmVyKSB7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIiwgY29udHJvbCk7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cdFx0aWYgKCFjb250cm9sLnNob3dPbmx5Q2hhcnQpIHtcblx0XHRcdGNvbnN0IGNoYXJ0VGl0bGUgPSBjb250cm9sLm1pY3JvQ2hhcnRUaXRsZTtcblx0XHRcdGlmIChjaGFydFRpdGxlKSB7XG5cdFx0XHRcdGNoYXJ0VGl0bGUuZm9yRWFjaChmdW5jdGlvbiAoc3ViQ2hhcnRUaXRsZSkge1xuXHRcdFx0XHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIpO1xuXHRcdFx0XHRcdHJlbmRlck1hbmFnZXIub3BlbkVuZCgpO1xuXHRcdFx0XHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChzdWJDaGFydFRpdGxlKTtcblx0XHRcdFx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIpO1xuXHRcdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cdFx0XHRjb25zdCBjaGFydERlc2NyaXB0aW9uID0gbmV3IExhYmVsKHsgdGV4dDogY29udHJvbC5jaGFydERlc2NyaXB0aW9uIH0pO1xuXHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGNoYXJ0RGVzY3JpcHRpb24pO1xuXHRcdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTtcblx0XHR9XG5cdFx0Y29uc3QgbWljcm9DaGFydCA9IGNvbnRyb2wubWljcm9DaGFydDtcblx0XHRpZiAobWljcm9DaGFydCkge1xuXHRcdFx0bWljcm9DaGFydC5hZGRTdHlsZUNsYXNzKFwic2FwVWlUaW55TWFyZ2luVG9wQm90dG9tXCIpO1xuXHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKG1pY3JvQ2hhcnQpO1xuXHRcdFx0aWYgKCFjb250cm9sLnNob3dPbmx5Q2hhcnQgJiYgY29udHJvbC51b21QYXRoKSB7XG5cdFx0XHRcdGNvbnN0IHNldHRpbmdzID0gY29udHJvbC5fY2hlY2tJZkNoYXJ0UmVxdWlyZXNSdW50aW1lTGFiZWxzKCkgPyB1bmRlZmluZWQgOiB7IHRleHQ6IHsgcGF0aDogY29udHJvbC51b21QYXRoIH0gfSxcblx0XHRcdFx0XHRsYWJlbCA9IG5ldyBMYWJlbChzZXR0aW5ncyksXG5cdFx0XHRcdFx0ZmxleEJveCA9IG5ldyBGbGV4Qm94KHtcblx0XHRcdFx0XHRcdGFsaWduSXRlbXM6IFwiU3RhcnRcIixcblx0XHRcdFx0XHRcdGp1c3RpZnlDb250ZW50OiBcIkVuZFwiLFxuXHRcdFx0XHRcdFx0aXRlbXM6IFtsYWJlbF1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZsZXhCb3gpO1xuXHRcdFx0XHRjb250cm9sLnNldEFnZ3JlZ2F0aW9uKFwiX3VvbUxhYmVsXCIsIGxhYmVsKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTtcblx0fVxuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKCkge1xuXHRcdGNvbnN0IGJpbmRpbmcgPSB0aGlzLl9nZXRMaXN0QmluZGluZ0ZvclJ1bnRpbWVMYWJlbHMoKTtcblxuXHRcdGlmIChiaW5kaW5nKSB7XG5cdFx0XHRiaW5kaW5nLmRldGFjaEV2ZW50KFwiY2hhbmdlXCIsIHRoaXMuX3NldFJ1bnRpbWVDaGFydExhYmVsc0FuZFVuaXRPZk1lYXN1cmUsIHRoaXMpO1xuXHRcdFx0dGhpcy5fb2xpc3RCaW5kaW5nID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdG9uQWZ0ZXJSZW5kZXJpbmcoKSB7XG5cdFx0Y29uc3QgYmluZGluZyA9IHRoaXMuX2dldExpc3RCaW5kaW5nRm9yUnVudGltZUxhYmVscygpO1xuXG5cdFx0aWYgKCF0aGlzLl9jaGVja0lmQ2hhcnRSZXF1aXJlc1J1bnRpbWVMYWJlbHMoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChiaW5kaW5nKSB7XG5cdFx0XHQoYmluZGluZy5hdHRhY2hFdmVudCBhcyBhbnkpKFwiY2hhbmdlXCIsIHRoaXMuX3NldFJ1bnRpbWVDaGFydExhYmVsc0FuZFVuaXRPZk1lYXN1cmUsIHRoaXMpO1xuXHRcdFx0dGhpcy5fb2xpc3RCaW5kaW5nID0gYmluZGluZztcblx0XHR9XG5cdH1cblxuXHRzZXRTaG93T25seUNoYXJ0KHZhbHVlOiBib29sZWFuKSB7XG5cdFx0aWYgKCF2YWx1ZSAmJiB0aGlzLl9vbGlzdEJpbmRpbmcpIHtcblx0XHRcdHRoaXMuX3NldENoYXJ0TGFiZWxzKCk7XG5cdFx0fVxuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJzaG93T25seUNoYXJ0XCIsIHZhbHVlLCBmYWxzZSAvKnJlLXJlbmRlcmluZyovKTtcblx0fVxuXG5cdF9jaGVja0lmQ2hhcnRSZXF1aXJlc1J1bnRpbWVMYWJlbHMoKSB7XG5cdFx0Y29uc3QgbWljcm9DaGFydCA9IHRoaXMubWljcm9DaGFydDtcblxuXHRcdHJldHVybiBCb29sZWFuKFxuXHRcdFx0bWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0IHx8XG5cdFx0XHRcdG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb2x1bW5NaWNyb0NoYXJ0IHx8XG5cdFx0XHRcdG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBMaW5lTWljcm9DaGFydCB8fFxuXHRcdFx0XHRtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29tcGFyaXNvbk1pY3JvQ2hhcnRcblx0XHQpO1xuXHR9XG5cblx0X2NoZWNrRm9yQ2hhcnRMYWJlbEFnZ3JlZ2F0aW9ucygpIHtcblx0XHRjb25zdCBtaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0O1xuXHRcdHJldHVybiBCb29sZWFuKFxuXHRcdFx0KG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBBcmVhTWljcm9DaGFydCAmJlxuXHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwiZmlyc3RZTGFiZWxcIikgJiZcblx0XHRcdFx0bWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxhc3RZTGFiZWxcIikgJiZcblx0XHRcdFx0bWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImZpcnN0WExhYmVsXCIpICYmXG5cdFx0XHRcdG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsYXN0WExhYmVsXCIpKSB8fFxuXHRcdFx0XHQobWljcm9DaGFydCBpbnN0YW5jZW9mIENvbHVtbk1pY3JvQ2hhcnQgJiZcblx0XHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGVmdFRvcExhYmVsXCIpICYmXG5cdFx0XHRcdFx0bWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0VG9wTGFiZWxcIikgJiZcblx0XHRcdFx0XHRtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGVmdEJvdHRvbUxhYmVsXCIpICYmXG5cdFx0XHRcdFx0bWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0Qm90dG9tTGFiZWxcIikpIHx8XG5cdFx0XHRcdG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBMaW5lTWljcm9DaGFydFxuXHRcdCk7XG5cdH1cblxuXHRfZ2V0TGlzdEJpbmRpbmdGb3JSdW50aW1lTGFiZWxzKCkge1xuXHRcdGNvbnN0IG1pY3JvQ2hhcnQgPSB0aGlzLm1pY3JvQ2hhcnQ7XG5cdFx0bGV0IGJpbmRpbmc7XG5cdFx0aWYgKG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBBcmVhTWljcm9DaGFydCkge1xuXHRcdFx0Y29uc3QgY2hhcnQgPSBtaWNyb0NoYXJ0LmdldENoYXJ0KCk7XG5cdFx0XHRiaW5kaW5nID0gY2hhcnQgJiYgY2hhcnQuZ2V0QmluZGluZyhcInBvaW50c1wiKTtcblx0XHR9IGVsc2UgaWYgKG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBDb2x1bW5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRiaW5kaW5nID0gbWljcm9DaGFydC5nZXRCaW5kaW5nKFwiY29sdW1uc1wiKTtcblx0XHR9IGVsc2UgaWYgKG1pY3JvQ2hhcnQgaW5zdGFuY2VvZiBMaW5lTWljcm9DaGFydCkge1xuXHRcdFx0Y29uc3QgbGluZXMgPSBtaWNyb0NoYXJ0LmdldExpbmVzKCk7XG5cdFx0XHRiaW5kaW5nID0gbGluZXMgJiYgbGluZXMubGVuZ3RoICYmIGxpbmVzWzBdLmdldEJpbmRpbmcoXCJwb2ludHNcIik7XG5cdFx0fSBlbHNlIGlmIChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29tcGFyaXNvbk1pY3JvQ2hhcnQpIHtcblx0XHRcdGJpbmRpbmcgPSBtaWNyb0NoYXJ0LmdldEJpbmRpbmcoXCJkYXRhXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gYmluZGluZyBpbnN0YW5jZW9mIE9EYXRhVjRMaXN0QmluZGluZyA/IGJpbmRpbmcgOiBmYWxzZTtcblx0fVxuXG5cdGFzeW5jIF9zZXRSdW50aW1lQ2hhcnRMYWJlbHNBbmRVbml0T2ZNZWFzdXJlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGxpc3RCaW5kaW5nID0gdGhpcy5fb2xpc3RCaW5kaW5nLFxuXHRcdFx0Y29udGV4dHMgPSBsaXN0QmluZGluZz8uZ2V0Q29udGV4dHMoKSxcblx0XHRcdG1lYXN1cmVzID0gdGhpcy5tZWFzdXJlcyxcblx0XHRcdGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uLFxuXHRcdFx0dW5pdE9mTWVhc3VyZVBhdGggPSB0aGlzLnVvbVBhdGgsXG5cdFx0XHRtaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0LFxuXHRcdFx0dW5pdE9mTWVhc3VyZUxhYmVsID0gdGhpcy5fdW9tTGFiZWw7XG5cblx0XHRpZiAodW5pdE9mTWVhc3VyZUxhYmVsICYmIHVuaXRPZk1lYXN1cmVQYXRoICYmIGNvbnRleHRzICYmIGNvbnRleHRzLmxlbmd0aCAmJiAhdGhpcy5zaG93T25seUNoYXJ0KSB7XG5cdFx0XHR1bml0T2ZNZWFzdXJlTGFiZWwuc2V0VGV4dChjb250ZXh0c1swXS5nZXRPYmplY3QodW5pdE9mTWVhc3VyZVBhdGgpKTtcblx0XHR9IGVsc2UgaWYgKHVuaXRPZk1lYXN1cmVMYWJlbCkge1xuXHRcdFx0dW5pdE9mTWVhc3VyZUxhYmVsLnNldFRleHQoXCJcIik7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLl9jaGVja0ZvckNoYXJ0TGFiZWxBZ2dyZWdhdGlvbnMoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghY29udGV4dHMgfHwgIWNvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5fc2V0Q2hhcnRMYWJlbHMoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBmaXJzdENvbnRleHQgPSBjb250ZXh0c1swXSxcblx0XHRcdGxhc3RDb250ZXh0ID0gY29udGV4dHNbY29udGV4dHMubGVuZ3RoIC0gMV0sXG5cdFx0XHRsaW5lc1BvbWlzZXM6IFByb21pc2U8bW9iaWxlbGlicmFyeS5WYWx1ZUNvbG9yPltdID0gW10sXG5cdFx0XHRsaW5lQ2hhcnQgPSBtaWNyb0NoYXJ0IGluc3RhbmNlb2YgTGluZU1pY3JvQ2hhcnQsXG5cdFx0XHRjdXJyZW50TWluWCA9IGZpcnN0Q29udGV4dC5nZXRPYmplY3QoZGltZW5zaW9uKSxcblx0XHRcdGN1cnJlbnRNYXhYID0gbGFzdENvbnRleHQuZ2V0T2JqZWN0KGRpbWVuc2lvbik7XG5cdFx0bGV0IGN1cnJlbnRNaW5ZLFxuXHRcdFx0Y3VycmVudE1heFksXG5cdFx0XHRtaW5YOiBEYXRhUG9pbnRWYWx1ZVR5cGUgPSB7IHZhbHVlOiBJbmZpbml0eSB9LFxuXHRcdFx0bWF4WDogRGF0YVBvaW50VmFsdWVUeXBlID0geyB2YWx1ZTogLUluZmluaXR5IH0sXG5cdFx0XHRtaW5ZOiBEYXRhUG9pbnRWYWx1ZVR5cGUgPSB7IHZhbHVlOiBJbmZpbml0eSB9LFxuXHRcdFx0bWF4WTogRGF0YVBvaW50VmFsdWVUeXBlID0geyB2YWx1ZTogLUluZmluaXR5IH07XG5cblx0XHRtaW5YID0gY3VycmVudE1pblggPT0gdW5kZWZpbmVkID8gbWluWCA6IHsgY29udGV4dDogZmlyc3RDb250ZXh0LCB2YWx1ZTogY3VycmVudE1pblggfTtcblx0XHRtYXhYID0gY3VycmVudE1heFggPT0gdW5kZWZpbmVkID8gbWF4WCA6IHsgY29udGV4dDogbGFzdENvbnRleHQsIHZhbHVlOiBjdXJyZW50TWF4WCB9O1xuXG5cdFx0aWYgKG1lYXN1cmVzPy5sZW5ndGgpIHtcblx0XHRcdG1lYXN1cmVzLmZvckVhY2goKG1lYXN1cmU6IHN0cmluZywgaTogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRNaW5ZID0gZmlyc3RDb250ZXh0LmdldE9iamVjdChtZWFzdXJlKTtcblx0XHRcdFx0Y3VycmVudE1heFkgPSBsYXN0Q29udGV4dC5nZXRPYmplY3QobWVhc3VyZSk7XG5cdFx0XHRcdG1heFkgPSBjdXJyZW50TWF4WSA+IG1heFkudmFsdWUgPyB7IGNvbnRleHQ6IGxhc3RDb250ZXh0LCB2YWx1ZTogY3VycmVudE1heFksIGluZGV4OiBsaW5lQ2hhcnQgPyBpIDogMCB9IDogbWF4WTtcblx0XHRcdFx0bWluWSA9IGN1cnJlbnRNaW5ZIDwgbWluWS52YWx1ZSA/IHsgY29udGV4dDogZmlyc3RDb250ZXh0LCB2YWx1ZTogY3VycmVudE1pblksIGluZGV4OiBsaW5lQ2hhcnQgPyBpIDogMCB9IDogbWluWTtcblx0XHRcdFx0aWYgKGxpbmVDaGFydCkge1xuXHRcdFx0XHRcdGxpbmVzUG9taXNlcy5wdXNoKHRoaXMuX2dldENyaXRpY2FsaXR5RnJvbVBvaW50KHsgY29udGV4dDogbGFzdENvbnRleHQsIHZhbHVlOiBjdXJyZW50TWF4WSwgaW5kZXg6IGkgfSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dGhpcy5fc2V0Q2hhcnRMYWJlbHMobWluWS52YWx1ZSwgbWF4WS52YWx1ZSwgbWluWC52YWx1ZSwgbWF4WC52YWx1ZSk7XG5cdFx0aWYgKGxpbmVDaGFydCkge1xuXHRcdFx0Y29uc3QgY29sb3JzID0gYXdhaXQgUHJvbWlzZS5hbGwobGluZXNQb21pc2VzKTtcblx0XHRcdGlmIChjb2xvcnM/Lmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBsaW5lcyA9IG1pY3JvQ2hhcnQuZ2V0TGluZXMoKTtcblx0XHRcdFx0bGluZXMuZm9yRWFjaChmdW5jdGlvbiAobGluZTogTGluZU1pY3JvQ2hhcnRMaW5lLCBpOiBudW1iZXIpIHtcblx0XHRcdFx0XHRsaW5lLnNldENvbG9yKGNvbG9yc1tpXSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9zZXRDaGFydExhYmVsc0NvbG9ycyhtYXhZLCBtaW5ZKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfc2V0Q2hhcnRMYWJlbHNDb2xvcnMobWF4WTogRGF0YVBvaW50VmFsdWVUeXBlLCBtaW5ZOiBEYXRhUG9pbnRWYWx1ZVR5cGUpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBtaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0O1xuXG5cdFx0Y29uc3QgY3JpdGljYWxpdHkgPSBhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5fZ2V0Q3JpdGljYWxpdHlGcm9tUG9pbnQobWluWSksIHRoaXMuX2dldENyaXRpY2FsaXR5RnJvbVBvaW50KG1heFkpXSk7XG5cblx0XHRpZiAobWljcm9DaGFydCBpbnN0YW5jZW9mIEFyZWFNaWNyb0NoYXJ0KSB7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImZpcnN0WUxhYmVsXCIpIGFzIE1hbmFnZWRPYmplY3QpLnNldFByb3BlcnR5KFwiY29sb3JcIiwgY3JpdGljYWxpdHlbMF0sIHRydWUpO1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsYXN0WUxhYmVsXCIpIGFzIE1hbmFnZWRPYmplY3QpLnNldFByb3BlcnR5KFwiY29sb3JcIiwgY3JpdGljYWxpdHlbMV0sIHRydWUpO1xuXHRcdH0gZWxzZSBpZiAobWljcm9DaGFydCBpbnN0YW5jZW9mIENvbHVtbk1pY3JvQ2hhcnQpIHtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGVmdFRvcExhYmVsXCIpIGFzIE1hbmFnZWRPYmplY3QpLnNldFByb3BlcnR5KFwiY29sb3JcIiwgY3JpdGljYWxpdHlbMF0sIHRydWUpO1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJyaWdodFRvcExhYmVsXCIpIGFzIE1hbmFnZWRPYmplY3QpLnNldFByb3BlcnR5KFwiY29sb3JcIiwgY3JpdGljYWxpdHlbMV0sIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdF9zZXRDaGFydExhYmVscyhsZWZ0VG9wPzogbnVtYmVyLCByaWdodFRvcD86IG51bWJlciwgbGVmdEJvdHRvbT86IG51bWJlciwgcmlnaHRCb3R0b20/OiBudW1iZXIpOiB2b2lkIHtcblx0XHRjb25zdCBtaWNyb0NoYXJ0ID0gdGhpcy5taWNyb0NoYXJ0O1xuXG5cdFx0bGVmdFRvcCA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShsZWZ0VG9wLCB0aGlzLm1lYXN1cmVQcmVjaXNpb24sIHRoaXMubWVhc3VyZVNjYWxlKTtcblx0XHRyaWdodFRvcCA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShyaWdodFRvcCwgdGhpcy5tZWFzdXJlUHJlY2lzaW9uLCB0aGlzLm1lYXN1cmVTY2FsZSk7XG5cdFx0bGVmdEJvdHRvbSA9IHRoaXMuX2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZShsZWZ0Qm90dG9tLCB0aGlzLmRpbWVuc2lvblByZWNpc2lvbiwgdW5kZWZpbmVkLCB0aGlzLmNhbGVuZGFyUGF0dGVybik7XG5cdFx0cmlnaHRCb3R0b20gPSB0aGlzLl9mb3JtYXREYXRlQW5kTnVtYmVyVmFsdWUocmlnaHRCb3R0b20sIHRoaXMuZGltZW5zaW9uUHJlY2lzaW9uLCB1bmRlZmluZWQsIHRoaXMuY2FsZW5kYXJQYXR0ZXJuKTtcblxuXHRcdGlmIChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQXJlYU1pY3JvQ2hhcnQpIHtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwiZmlyc3RZTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCBsZWZ0VG9wLCBmYWxzZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcImxhc3RZTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCByaWdodFRvcCwgZmFsc2UpO1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJmaXJzdFhMYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIGxlZnRCb3R0b20sIGZhbHNlKTtcblx0XHRcdChtaWNyb0NoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwibGFzdFhMYWJlbFwiKSBhcyBNYW5hZ2VkT2JqZWN0KS5zZXRQcm9wZXJ0eShcImxhYmVsXCIsIHJpZ2h0Qm90dG9tLCBmYWxzZSk7XG5cdFx0fSBlbHNlIGlmIChtaWNyb0NoYXJ0IGluc3RhbmNlb2YgQ29sdW1uTWljcm9DaGFydCkge1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0VG9wTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCBsZWZ0VG9wLCBmYWxzZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0VG9wTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCByaWdodFRvcCwgZmFsc2UpO1xuXHRcdFx0KG1pY3JvQ2hhcnQuZ2V0QWdncmVnYXRpb24oXCJsZWZ0Qm90dG9tTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCBsZWZ0Qm90dG9tLCBmYWxzZSk7XG5cdFx0XHQobWljcm9DaGFydC5nZXRBZ2dyZWdhdGlvbihcInJpZ2h0Qm90dG9tTGFiZWxcIikgYXMgTWFuYWdlZE9iamVjdCkuc2V0UHJvcGVydHkoXCJsYWJlbFwiLCByaWdodEJvdHRvbSwgZmFsc2UpO1xuXHRcdH0gZWxzZSBpZiAobWljcm9DaGFydCBpbnN0YW5jZW9mIExpbmVNaWNyb0NoYXJ0KSB7XG5cdFx0XHRtaWNyb0NoYXJ0LnNldFByb3BlcnR5KFwibGVmdFRvcExhYmVsXCIsIGxlZnRUb3AsIGZhbHNlKTtcblx0XHRcdG1pY3JvQ2hhcnQuc2V0UHJvcGVydHkoXCJyaWdodFRvcExhYmVsXCIsIHJpZ2h0VG9wLCBmYWxzZSk7XG5cdFx0XHRtaWNyb0NoYXJ0LnNldFByb3BlcnR5KFwibGVmdEJvdHRvbUxhYmVsXCIsIGxlZnRCb3R0b20sIGZhbHNlKTtcblx0XHRcdG1pY3JvQ2hhcnQuc2V0UHJvcGVydHkoXCJyaWdodEJvdHRvbUxhYmVsXCIsIHJpZ2h0Qm90dG9tLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX2dldENyaXRpY2FsaXR5RnJvbVBvaW50KHBvaW50OiBEYXRhUG9pbnRWYWx1ZVR5cGUpOiBQcm9taXNlPG1vYmlsZWxpYnJhcnkuVmFsdWVDb2xvcj4ge1xuXHRcdGlmIChwb2ludD8uY29udGV4dCkge1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gdGhpcy5nZXRNb2RlbCgpICYmICh0aGlzLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpLFxuXHRcdFx0XHRkYXRhUG9pbnRRdWFsaWZpZXJzID0gdGhpcy5kYXRhUG9pbnRRdWFsaWZpZXJzLFxuXHRcdFx0XHRtZXRhUGF0aCA9IG1ldGFNb2RlbCBpbnN0YW5jZW9mIE9EYXRhTWV0YU1vZGVsICYmIHBvaW50LmNvbnRleHQuZ2V0UGF0aCgpICYmIG1ldGFNb2RlbC5nZXRNZXRhUGF0aChwb2ludC5jb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRpZiAodHlwZW9mIG1ldGFQYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGNvbnN0IGRhdGFQb2ludCA9IGF3YWl0IG1ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KFxuXHRcdFx0XHRcdGAke21ldGFQYXRofS9AJHtVSUFubm90YXRpb25UZXJtcy5EYXRhUG9pbnR9JHtcblx0XHRcdFx0XHRcdHBvaW50LmluZGV4ICE9PSB1bmRlZmluZWQgJiYgZGF0YVBvaW50UXVhbGlmaWVyc1twb2ludC5pbmRleF0gPyBgIyR7ZGF0YVBvaW50UXVhbGlmaWVyc1twb2ludC5pbmRleF19YCA6IFwiXCJcblx0XHRcdFx0XHR9YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoZGF0YVBvaW50KSB7XG5cdFx0XHRcdFx0bGV0IGNyaXRpY2FsaXR5ID0gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdFx0XHRcdGNvbnN0IGNvbnRleHQgPSBwb2ludC5jb250ZXh0O1xuXG5cdFx0XHRcdFx0aWYgKGRhdGFQb2ludC5Dcml0aWNhbGl0eSkge1xuXHRcdFx0XHRcdFx0Y3JpdGljYWxpdHkgPSB0aGlzLl9jcml0aWNhbGl0eShkYXRhUG9pbnQuQ3JpdGljYWxpdHksIGNvbnRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZGF0YVBvaW50LkNyaXRpY2FsaXR5Q2FsY3VsYXRpb24pIHtcblx0XHRcdFx0XHRcdGNvbnN0IGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24gPSBkYXRhUG9pbnQuQ3JpdGljYWxpdHlDYWxjdWxhdGlvbjtcblx0XHRcdFx0XHRcdGNvbnN0IGdldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlUHJvcGVydHk6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRsZXQgdmFsdWVSZXNwb25zZTtcblx0XHRcdFx0XHRcdFx0aWYgKHZhbHVlUHJvcGVydHk/LiRQYXRoKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFsdWVSZXNwb25zZSA9IGNvbnRleHQuZ2V0T2JqZWN0KHZhbHVlUHJvcGVydHkuJFBhdGgpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHZhbHVlUHJvcGVydHk/Lmhhc093blByb3BlcnR5KFwiJERlY2ltYWxcIikpIHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZVJlc3BvbnNlID0gdmFsdWVQcm9wZXJ0eS4kRGVjaW1hbDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFsdWVSZXNwb25zZTtcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGNyaXRpY2FsaXR5ID0gdGhpcy5fY3JpdGljYWxpdHlDYWxjdWxhdGlvbihcblx0XHRcdFx0XHRcdFx0Y3JpdGljYWxpdHlDYWxjdWxhdGlvbi5JbXByb3ZlbWVudERpcmVjdGlvbi4kRW51bU1lbWJlcixcblx0XHRcdFx0XHRcdFx0cG9pbnQudmFsdWUsXG5cdFx0XHRcdFx0XHRcdGdldFZhbHVlKGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSksXG5cdFx0XHRcdFx0XHRcdGdldFZhbHVlKGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSksXG5cdFx0XHRcdFx0XHRcdGdldFZhbHVlKGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uQWNjZXB0YW5jZVJhbmdlTG93VmFsdWUpLFxuXHRcdFx0XHRcdFx0XHRnZXRWYWx1ZShjcml0aWNhbGl0eUNhbGN1bGF0aW9uLkFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZSksXG5cdFx0XHRcdFx0XHRcdGdldFZhbHVlKGNyaXRpY2FsaXR5Q2FsY3VsYXRpb24uVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUpLFxuXHRcdFx0XHRcdFx0XHRnZXRWYWx1ZShjcml0aWNhbGl0eUNhbGN1bGF0aW9uLkRldmlhdGlvblJhbmdlSGlnaFZhbHVlKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gY3JpdGljYWxpdHk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFZhbHVlQ29sb3IuTmV1dHJhbCk7XG5cdH1cblxuXHRfY3JpdGljYWxpdHkoY3JpdGljYWxpdHk6IGFueSwgY29udGV4dDogQ29udGV4dCk6IG1vYmlsZWxpYnJhcnkuVmFsdWVDb2xvciB7XG5cdFx0bGV0IGNyaXRpY2FsaXR5VmFsdWUsIHJlc3VsdDtcblx0XHRpZiAoY3JpdGljYWxpdHkuJFBhdGgpIHtcblx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPSBjb250ZXh0LmdldE9iamVjdChjcml0aWNhbGl0eS4kUGF0aCk7XG5cdFx0XHRpZiAoY3JpdGljYWxpdHlWYWx1ZSA9PT0gQ3JpdGljYWxpdHlUeXBlLk5lZ2F0aXZlIHx8IGNyaXRpY2FsaXR5VmFsdWUudG9TdHJpbmcoKSA9PT0gXCIxXCIpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHRcdH0gZWxzZSBpZiAoY3JpdGljYWxpdHlWYWx1ZSA9PT0gQ3JpdGljYWxpdHlUeXBlLkNyaXRpY2FsIHx8IGNyaXRpY2FsaXR5VmFsdWUudG9TdHJpbmcoKSA9PT0gXCIyXCIpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5Dcml0aWNhbDtcblx0XHRcdH0gZWxzZSBpZiAoY3JpdGljYWxpdHlWYWx1ZSA9PT0gQ3JpdGljYWxpdHlUeXBlLlBvc2l0aXZlIHx8IGNyaXRpY2FsaXR5VmFsdWUudG9TdHJpbmcoKSA9PT0gXCIzXCIpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5Hb29kO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoY3JpdGljYWxpdHkuJEVudW1NZW1iZXIpIHtcblx0XHRcdGNyaXRpY2FsaXR5VmFsdWUgPSBjcml0aWNhbGl0eS4kRW51bU1lbWJlcjtcblx0XHRcdGlmIChjcml0aWNhbGl0eVZhbHVlLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIikgPiAtMSkge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fSBlbHNlIGlmIChjcml0aWNhbGl0eVZhbHVlLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmVcIikgPiAtMSkge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKGNyaXRpY2FsaXR5VmFsdWUuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9Dcml0aWNhbFwiKSA+IC0xKSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuQ3JpdGljYWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJDYXNlIG5vdCBzdXBwb3J0ZWQsIHJldHVybmluZyB0aGUgZGVmYXVsdCBWYWx1ZSBOZXV0cmFsXCIpO1xuXHRcdFx0cmV0dXJuIFZhbHVlQ29sb3IuTmV1dHJhbDtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdF9jcml0aWNhbGl0eUNhbGN1bGF0aW9uKFxuXHRcdGltcHJvdmVtZW50RGlyZWN0aW9uOiBzdHJpbmcsXG5cdFx0dmFsdWU6IG51bWJlcixcblx0XHRkZXZpYXRpb25Mb3c/OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0dG9sZXJhbmNlTG93Pzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdGFjY2VwdGFuY2VMb3c/OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0YWNjZXB0YW5jZUhpZ2g/OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0dG9sZXJhbmNlSGlnaD86IHN0cmluZyB8IG51bWJlcixcblx0XHRkZXZpYXRpb25IaWdoPzogc3RyaW5nIHwgbnVtYmVyXG5cdCk6IG1vYmlsZWxpYnJhcnkuVmFsdWVDb2xvciB7XG5cdFx0bGV0IHJlc3VsdDtcblxuXHRcdC8vIERlYWxpbmcgd2l0aCBEZWNpbWFsIGFuZCBQYXRoIGJhc2VkIGJpbmdkaW5nc1xuXHRcdGRldmlhdGlvbkxvdyA9IGRldmlhdGlvbkxvdyA9PSB1bmRlZmluZWQgPyAtSW5maW5pdHkgOiBkZXZpYXRpb25Mb3c7XG5cdFx0dG9sZXJhbmNlTG93ID0gdG9sZXJhbmNlTG93ID09IHVuZGVmaW5lZCA/IGRldmlhdGlvbkxvdyA6IHRvbGVyYW5jZUxvdztcblx0XHRhY2NlcHRhbmNlTG93ID0gYWNjZXB0YW5jZUxvdyA9PSB1bmRlZmluZWQgPyB0b2xlcmFuY2VMb3cgOiBhY2NlcHRhbmNlTG93O1xuXHRcdGRldmlhdGlvbkhpZ2ggPSBkZXZpYXRpb25IaWdoID09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogZGV2aWF0aW9uSGlnaDtcblx0XHR0b2xlcmFuY2VIaWdoID0gdG9sZXJhbmNlSGlnaCA9PSB1bmRlZmluZWQgPyBkZXZpYXRpb25IaWdoIDogdG9sZXJhbmNlSGlnaDtcblx0XHRhY2NlcHRhbmNlSGlnaCA9IGFjY2VwdGFuY2VIaWdoID09IHVuZGVmaW5lZCA/IHRvbGVyYW5jZUhpZ2ggOiBhY2NlcHRhbmNlSGlnaDtcblxuXHRcdC8vIENyZWF0aW5nIHJ1bnRpbWUgZXhwcmVzc2lvbiBiaW5kaW5nIGZyb20gY3JpdGljYWxpdHkgY2FsY3VsYXRpb24gZm9yIENyaXRpY2FsaXR5IFN0YXRlXG5cdFx0aWYgKGltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJNaW5pbWl6ZVwiKSA+IC0xKSB7XG5cdFx0XHRpZiAodmFsdWUgPD0gYWNjZXB0YW5jZUhpZ2gpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5Hb29kO1xuXHRcdFx0fSBlbHNlIGlmICh2YWx1ZSA8PSB0b2xlcmFuY2VIaWdoKSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuTmV1dHJhbDtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWUgPD0gZGV2aWF0aW9uSGlnaCkge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJNYXhpbWl6ZVwiKSA+IC0xKSB7XG5cdFx0XHRpZiAodmFsdWUgPj0gYWNjZXB0YW5jZUxvdykge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlID49IHRvbGVyYW5jZUxvdykge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLk5ldXRyYWw7XG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlID49IGRldmlhdGlvbkxvdykge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJUYXJnZXRcIikgPiAtMSkge1xuXHRcdFx0aWYgKHZhbHVlIDw9IGFjY2VwdGFuY2VIaWdoICYmIHZhbHVlID49IGFjY2VwdGFuY2VMb3cpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5Hb29kO1xuXHRcdFx0fSBlbHNlIGlmICgodmFsdWUgPj0gdG9sZXJhbmNlTG93ICYmIHZhbHVlIDwgYWNjZXB0YW5jZUxvdykgfHwgKHZhbHVlID4gYWNjZXB0YW5jZUhpZ2ggJiYgdmFsdWUgPD0gdG9sZXJhbmNlSGlnaCkpIHtcblx0XHRcdFx0cmVzdWx0ID0gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdFx0fSBlbHNlIGlmICgodmFsdWUgPj0gZGV2aWF0aW9uTG93ICYmIHZhbHVlIDwgdG9sZXJhbmNlTG93KSB8fCAodmFsdWUgPiB0b2xlcmFuY2VIaWdoICYmIHZhbHVlIDw9IGRldmlhdGlvbkhpZ2gpKSB7XG5cdFx0XHRcdHJlc3VsdCA9IFZhbHVlQ29sb3IuQ3JpdGljYWw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgPSBWYWx1ZUNvbG9yLkVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJDYXNlIG5vdCBzdXBwb3J0ZWQsIHJldHVybmluZyB0aGUgZGVmYXVsdCBWYWx1ZSBOZXV0cmFsXCIpO1xuXHRcdFx0cmV0dXJuIFZhbHVlQ29sb3IuTmV1dHJhbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0X2Zvcm1hdERhdGVBbmROdW1iZXJWYWx1ZSh2YWx1ZT86IG51bWJlciB8IHN0cmluZywgcHJlY2lzaW9uPzogbnVtYmVyLCBzY2FsZT86IG51bWJlciwgcGF0dGVybj86IHN0cmluZykge1xuXHRcdGlmIChwYXR0ZXJuKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0U2VtYW50aWNzVmFsdWVGb3JtYXR0ZXIocGF0dGVybikuZm9ybWF0VmFsdWUodmFsdWUsIFwic3RyaW5nXCIpO1xuXHRcdH0gZWxzZSBpZiAoIWlzTmFOKHZhbHVlIGFzIG51bWJlcikpIHtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRMYWJlbE51bWJlckZvcm1hdHRlcihwcmVjaXNpb24sIHNjYWxlKS5mb3JtYXQodmFsdWUgYXMgbnVtYmVyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRfZ2V0U2VtYW50aWNzVmFsdWVGb3JtYXR0ZXIocGF0dGVybjogc3RyaW5nKSB7XG5cdFx0aWYgKCF0aGlzLl9vRGF0ZVR5cGUpIHtcblx0XHRcdHRoaXMuX29EYXRlVHlwZSA9IG5ldyBEYXRlVHlwZSh7XG5cdFx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRcdHNvdXJjZToge1xuXHRcdFx0XHRcdHBhdHRlcm5cblx0XHRcdFx0fVxuXHRcdFx0fSBhcyBhbnkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9vRGF0ZVR5cGU7XG5cdH1cblxuXHRfZ2V0TGFiZWxOdW1iZXJGb3JtYXR0ZXIocHJlY2lzaW9uPzogbnVtYmVyLCBzY2FsZT86IG51bWJlcikge1xuXHRcdHJldHVybiBOdW1iZXJGb3JtYXQuZ2V0RmxvYXRJbnN0YW5jZSh7XG5cdFx0XHRzdHlsZTogXCJzaG9ydFwiLFxuXHRcdFx0c2hvd1NjYWxlOiB0cnVlLFxuXHRcdFx0cHJlY2lzaW9uOiAodHlwZW9mIHByZWNpc2lvbiA9PT0gXCJudW1iZXJcIiAmJiBwcmVjaXNpb24pIHx8IDAsXG5cdFx0XHRkZWNpbWFsczogKHR5cGVvZiBzY2FsZSA9PT0gXCJudW1iZXJcIiAmJiBzY2FsZSkgfHwgMFxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1pY3JvQ2hhcnRDb250YWluZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQXNCQSxNQUFNQSxjQUFjLEdBQUdDLFFBQVEsQ0FBQ0QsY0FBYztFQUM5QyxNQUFNRSxVQUFVLEdBQUdDLGFBQWEsQ0FBQ0QsVUFBVTtFQU0zQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQSxJQU9NRSxtQkFBbUIsV0FEeEJDLGNBQWMsQ0FBQyw4Q0FBOEMsQ0FBQyxVQUU3REMsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxTQUFTO0lBQ2ZDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQyxVQUdERixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFQztFQUNmLENBQUMsQ0FBQyxVQUdESCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFVBQVU7SUFDaEJDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQyxVQUdERixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFQztFQUNmLENBQUMsQ0FBQyxVQUdESCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFVBQVU7SUFDaEJDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQyxVQUdERixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLEtBQUs7SUFDWEMsWUFBWSxFQUFFQztFQUNmLENBQUMsQ0FBQyxVQUdESCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLEtBQUs7SUFDWEMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsS0FBSztJQUNYQyxZQUFZLEVBQUVDO0VBQ2YsQ0FBQyxDQUFD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