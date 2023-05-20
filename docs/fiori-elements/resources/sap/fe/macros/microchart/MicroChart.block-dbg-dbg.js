/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/ui/model/odata/v4/AnnotationHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter, BindingToolkit, UIFormatters, CommonHelper, AnnotationHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var _exports = {};
  var hasValidAnalyticalCurrencyOrUnit = UIFormatters.hasValidAnalyticalCurrencyOrUnit;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var equal = BindingToolkit.equal;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MicroChartBlock = (
  /**
   * Building block used to create a MicroChart based on the metadata provided by OData V4.
   *
   * @hideconstructor
   * @public
   * @since 1.93.0
   */
  _dec = defineBuildingBlock({
    name: "MicroChart",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    expectedTypes: ["EntitySet", "NavigationProperty"],
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec5 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "string"
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "sap.fe.macros.NavigationType"
  }), _dec11 = blockAttribute({
    type: "function"
  }), _dec12 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec13 = blockAttribute({
    type: "boolean"
  }), _dec14 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MicroChartBlock, _BuildingBlockBase);
    /**
     * ID of the MicroChart.
     */

    /**
     * Metadata path to the entitySet or navigationProperty.
     */

    /**
     * Metadata path to the Chart annotations.
     */

    /**
     * To control the rendering of Title, Subtitle and Currency Labels. When the size is xs then we do
     * not see the inner labels of the MicroChart as well.
     */

    /**
     * Batch group ID along with which this call should be grouped.
     */

    /**
     * Title for the MicroChart. If no title is provided, the title from the Chart annotation is used.
     */

    /**
     * Show blank space in case there is no data in the chart
     */

    /**
     * Description for the MicroChart. If no description is provided, the description from the Chart annotation is used.
     */

    /**
     * Type of navigation, that is, External or InPage
     */

    /**
     * Event handler for onTitlePressed event
     */

    /**
     * Size of the MicroChart
     */

    /**
     * Defines whether the MicroChart is part of an analytical table
     */

    /*
     * This is used in inner fragments, so we need to declare it as block attribute context.
     */

    function MicroChartBlock(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showOnlyChart", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "batchGroupId", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideOnNoData", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "description", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationType", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onTitlePressed", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "size", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isAnalytics", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "DataPoint", _descriptor13, _assertThisInitialized(_this));
      _this.metaPath = _this.metaPath.getModel().createBindingContext(AnnotationHelper.resolve$Path(_this.metaPath));
      const measureAttributePath = CommonHelper.getMeasureAttributeForMeasure(_this.metaPath.getModel().createBindingContext("Measures/0", _this.metaPath));
      if (measureAttributePath) {
        _this.DataPoint = _this.metaPath.getModel().createBindingContext(measureAttributePath);
      }
      return _this;
    }

    /**
     * Gets the content of the micro chart, i.e. a reference to the fragment for the given chart type.
     *
     * @returns XML string
     */
    _exports = MicroChartBlock;
    var _proto = MicroChartBlock.prototype;
    _proto.getMicroChartContent = function getMicroChartContent() {
      const convertedChart = convertMetaModelContext(this.metaPath);
      switch (convertedChart.ChartType) {
        case "UI.ChartType/Bullet":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.BulletMicroChart" type="XML" />`;
        case "UI.ChartType/Donut":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.RadialMicroChart" type="XML" />`;
        case "UI.ChartType/Pie":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.HarveyBallMicroChart" type="XML" />`;
        case "UI.ChartType/BarStacked":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.StackedBarMicroChart" type="XML" />`;
        case "UI.ChartType/Area":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.AreaMicroChart" type="XML" />`;
        case "UI.ChartType/Column":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.ColumnMicroChart" type="XML" />`;
        case "UI.ChartType/Line":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.LineMicroChart" type="XML" />`;
        case "UI.ChartType/Bar":
          return `<core:Fragment fragmentName="sap.fe.macros.microchart.fragments.ComparisonMicroChart" type="XML" />`;
        default:
          return `<m:Text text="This chart type is not supported. Other Types yet to be implemented.." />`;
      }
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */;
    _proto.getTemplate = function getTemplate() {
      const dataPointValueObjects = getInvolvedDataModelObjects(this.metaPath.getModel().createBindingContext("Value/$Path", this.DataPoint), this.contextPath);
      const wrapperConditionBinding = hasValidAnalyticalCurrencyOrUnit(dataPointValueObjects);
      const wrapperVisibleBinding = or(not(pathInModel("@$ui5.node.isExpanded")), equal(pathInModel("@$ui5.node.level"), 0));
      if (this.isAnalytics) {
        return xml`<controls:ConditionalWrapper
				xmlns:controls="sap.fe.macros.controls"
				condition="${wrapperConditionBinding}"
				visible="${wrapperVisibleBinding}" >
				<controls:contentTrue>
					${this.getMicroChartContent()}
				</controls:contentTrue>
				<controls:contentFalse>
					<m:Text text="*" />
				</controls:contentFalse>
			</controls:ConditionalWrapper>`;
      } else {
        return this.getMicroChartContent();
      }
    };
    return MicroChartBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "showOnlyChart", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "batchGroupId", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "hideOnNoData", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "description", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "navigationType", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "None";
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "onTitlePressed", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "size", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "isAnalytics", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "DataPoint", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = MicroChartBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNaWNyb0NoYXJ0QmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImlzUHVibGljIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwicHJvcHMiLCJtZXRhUGF0aCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJBbm5vdGF0aW9uSGVscGVyIiwicmVzb2x2ZSRQYXRoIiwibWVhc3VyZUF0dHJpYnV0ZVBhdGgiLCJDb21tb25IZWxwZXIiLCJnZXRNZWFzdXJlQXR0cmlidXRlRm9yTWVhc3VyZSIsIkRhdGFQb2ludCIsImdldE1pY3JvQ2hhcnRDb250ZW50IiwiY29udmVydGVkQ2hhcnQiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsIkNoYXJ0VHlwZSIsImdldFRlbXBsYXRlIiwiZGF0YVBvaW50VmFsdWVPYmplY3RzIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJ3cmFwcGVyQ29uZGl0aW9uQmluZGluZyIsImhhc1ZhbGlkQW5hbHl0aWNhbEN1cnJlbmN5T3JVbml0Iiwid3JhcHBlclZpc2libGVCaW5kaW5nIiwib3IiLCJub3QiLCJwYXRoSW5Nb2RlbCIsImVxdWFsIiwiaXNBbmFseXRpY3MiLCJ4bWwiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWljcm9DaGFydC5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENoYXJ0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0LCBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGVxdWFsLCBub3QsIG9yLCBwYXRoSW5Nb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSBNaWNyb0NoYXJ0IGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS45My4wXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJNaWNyb0NoYXJ0XCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWNyb0NoYXJ0QmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgTWljcm9DaGFydC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5U2V0IG9yIG5hdmlnYXRpb25Qcm9wZXJ0eS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRjb250ZXh0UGF0aD86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIENoYXJ0IGFubm90YXRpb25zLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0bWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBUbyBjb250cm9sIHRoZSByZW5kZXJpbmcgb2YgVGl0bGUsIFN1YnRpdGxlIGFuZCBDdXJyZW5jeSBMYWJlbHMuIFdoZW4gdGhlIHNpemUgaXMgeHMgdGhlbiB3ZSBkb1xuXHQgKiBub3Qgc2VlIHRoZSBpbm5lciBsYWJlbHMgb2YgdGhlIE1pY3JvQ2hhcnQgYXMgd2VsbC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHNob3dPbmx5Q2hhcnQ6IHN0cmluZyB8IGJvb2xlYW4gPSBmYWxzZTtcblxuXHQvKipcblx0ICogQmF0Y2ggZ3JvdXAgSUQgYWxvbmcgd2l0aCB3aGljaCB0aGlzIGNhbGwgc2hvdWxkIGJlIGdyb3VwZWQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGJhdGNoR3JvdXBJZCA9IFwiXCI7XG5cblx0LyoqXG5cdCAqIFRpdGxlIGZvciB0aGUgTWljcm9DaGFydC4gSWYgbm8gdGl0bGUgaXMgcHJvdmlkZWQsIHRoZSB0aXRsZSBmcm9tIHRoZSBDaGFydCBhbm5vdGF0aW9uIGlzIHVzZWQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHRpdGxlID0gXCJcIjtcblxuXHQvKipcblx0ICogU2hvdyBibGFuayBzcGFjZSBpbiBjYXNlIHRoZXJlIGlzIG5vIGRhdGEgaW4gdGhlIGNoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGhpZGVPbk5vRGF0YTogc3RyaW5nIHwgYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBEZXNjcmlwdGlvbiBmb3IgdGhlIE1pY3JvQ2hhcnQuIElmIG5vIGRlc2NyaXB0aW9uIGlzIHByb3ZpZGVkLCB0aGUgZGVzY3JpcHRpb24gZnJvbSB0aGUgQ2hhcnQgYW5ub3RhdGlvbiBpcyB1c2VkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRkZXNjcmlwdGlvbiA9IFwiXCI7XG5cblx0LyoqXG5cdCAqIFR5cGUgb2YgbmF2aWdhdGlvbiwgdGhhdCBpcywgRXh0ZXJuYWwgb3IgSW5QYWdlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MuTmF2aWdhdGlvblR5cGVcIiB9KVxuXHRuYXZpZ2F0aW9uVHlwZSA9IFwiTm9uZVwiO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGZvciBvblRpdGxlUHJlc3NlZCBldmVudFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJmdW5jdGlvblwiIH0pXG5cdG9uVGl0bGVQcmVzc2VkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTaXplIG9mIHRoZSBNaWNyb0NoYXJ0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRzaXplPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXRoZXIgdGhlIE1pY3JvQ2hhcnQgaXMgcGFydCBvZiBhbiBhbmFseXRpY2FsIHRhYmxlXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRpc0FuYWx5dGljcyA9IGZhbHNlO1xuXG5cdC8qXG5cdCAqIFRoaXMgaXMgdXNlZCBpbiBpbm5lciBmcmFnbWVudHMsIHNvIHdlIG5lZWQgdG8gZGVjbGFyZSBpdCBhcyBibG9jayBhdHRyaWJ1dGUgY29udGV4dC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiB9KVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5cdHByaXZhdGUgcmVhZG9ubHkgRGF0YVBvaW50PzogQ29udGV4dDtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPE1pY3JvQ2hhcnRCbG9jaz4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLm1ldGFQYXRoID0gdGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KEFubm90YXRpb25IZWxwZXIucmVzb2x2ZSRQYXRoKHRoaXMubWV0YVBhdGgpKTtcblx0XHRjb25zdCBtZWFzdXJlQXR0cmlidXRlUGF0aCA9IENvbW1vbkhlbHBlci5nZXRNZWFzdXJlQXR0cmlidXRlRm9yTWVhc3VyZShcblx0XHRcdHRoaXMubWV0YVBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIk1lYXN1cmVzLzBcIiwgdGhpcy5tZXRhUGF0aClcblx0XHQpO1xuXHRcdGlmIChtZWFzdXJlQXR0cmlidXRlUGF0aCkge1xuXHRcdFx0dGhpcy5EYXRhUG9pbnQgPSB0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQobWVhc3VyZUF0dHJpYnV0ZVBhdGgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBjb250ZW50IG9mIHRoZSBtaWNybyBjaGFydCwgaS5lLiBhIHJlZmVyZW5jZSB0byB0aGUgZnJhZ21lbnQgZm9yIHRoZSBnaXZlbiBjaGFydCB0eXBlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBYTUwgc3RyaW5nXG5cdCAqL1xuXHRnZXRNaWNyb0NoYXJ0Q29udGVudCgpIHtcblx0XHRjb25zdCBjb252ZXJ0ZWRDaGFydCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMubWV0YVBhdGgpIGFzIENoYXJ0O1xuXG5cdFx0c3dpdGNoIChjb252ZXJ0ZWRDaGFydC5DaGFydFR5cGUpIHtcblx0XHRcdGNhc2UgXCJVSS5DaGFydFR5cGUvQnVsbGV0XCI6XG5cdFx0XHRcdHJldHVybiBgPGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5taWNyb2NoYXJ0LmZyYWdtZW50cy5CdWxsZXRNaWNyb0NoYXJ0XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHRcdGNhc2UgXCJVSS5DaGFydFR5cGUvRG9udXRcIjpcblx0XHRcdFx0cmV0dXJuIGA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLm1pY3JvY2hhcnQuZnJhZ21lbnRzLlJhZGlhbE1pY3JvQ2hhcnRcIiB0eXBlPVwiWE1MXCIgLz5gO1xuXHRcdFx0Y2FzZSBcIlVJLkNoYXJ0VHlwZS9QaWVcIjpcblx0XHRcdFx0cmV0dXJuIGA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLm1pY3JvY2hhcnQuZnJhZ21lbnRzLkhhcnZleUJhbGxNaWNyb0NoYXJ0XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHRcdGNhc2UgXCJVSS5DaGFydFR5cGUvQmFyU3RhY2tlZFwiOlxuXHRcdFx0XHRyZXR1cm4gYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MubWljcm9jaGFydC5mcmFnbWVudHMuU3RhY2tlZEJhck1pY3JvQ2hhcnRcIiB0eXBlPVwiWE1MXCIgLz5gO1xuXHRcdFx0Y2FzZSBcIlVJLkNoYXJ0VHlwZS9BcmVhXCI6XG5cdFx0XHRcdHJldHVybiBgPGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5taWNyb2NoYXJ0LmZyYWdtZW50cy5BcmVhTWljcm9DaGFydFwiIHR5cGU9XCJYTUxcIiAvPmA7XG5cdFx0XHRjYXNlIFwiVUkuQ2hhcnRUeXBlL0NvbHVtblwiOlxuXHRcdFx0XHRyZXR1cm4gYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MubWljcm9jaGFydC5mcmFnbWVudHMuQ29sdW1uTWljcm9DaGFydFwiIHR5cGU9XCJYTUxcIiAvPmA7XG5cdFx0XHRjYXNlIFwiVUkuQ2hhcnRUeXBlL0xpbmVcIjpcblx0XHRcdFx0cmV0dXJuIGA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLm1pY3JvY2hhcnQuZnJhZ21lbnRzLkxpbmVNaWNyb0NoYXJ0XCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHRcdGNhc2UgXCJVSS5DaGFydFR5cGUvQmFyXCI6XG5cdFx0XHRcdHJldHVybiBgPGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5taWNyb2NoYXJ0LmZyYWdtZW50cy5Db21wYXJpc29uTWljcm9DaGFydFwiIHR5cGU9XCJYTUxcIiAvPmA7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gYDxtOlRleHQgdGV4dD1cIlRoaXMgY2hhcnQgdHlwZSBpcyBub3Qgc3VwcG9ydGVkLiBPdGhlciBUeXBlcyB5ZXQgdG8gYmUgaW1wbGVtZW50ZWQuLlwiIC8+YDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBkYXRhUG9pbnRWYWx1ZU9iamVjdHMgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoXG5cdFx0XHR0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoXCJWYWx1ZS8kUGF0aFwiLCB0aGlzLkRhdGFQb2ludCksXG5cdFx0XHR0aGlzLmNvbnRleHRQYXRoXG5cdFx0KTtcblx0XHRjb25zdCB3cmFwcGVyQ29uZGl0aW9uQmluZGluZyA9IGhhc1ZhbGlkQW5hbHl0aWNhbEN1cnJlbmN5T3JVbml0KGRhdGFQb2ludFZhbHVlT2JqZWN0cyk7XG5cdFx0Y29uc3Qgd3JhcHBlclZpc2libGVCaW5kaW5nID0gb3Iobm90KHBhdGhJbk1vZGVsKFwiQCR1aTUubm9kZS5pc0V4cGFuZGVkXCIpKSwgZXF1YWwocGF0aEluTW9kZWwoXCJAJHVpNS5ub2RlLmxldmVsXCIpLCAwKSk7XG5cblx0XHRpZiAodGhpcy5pc0FuYWx5dGljcykge1xuXHRcdFx0cmV0dXJuIHhtbGA8Y29udHJvbHM6Q29uZGl0aW9uYWxXcmFwcGVyXG5cdFx0XHRcdHhtbG5zOmNvbnRyb2xzPVwic2FwLmZlLm1hY3Jvcy5jb250cm9sc1wiXG5cdFx0XHRcdGNvbmRpdGlvbj1cIiR7d3JhcHBlckNvbmRpdGlvbkJpbmRpbmd9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7d3JhcHBlclZpc2libGVCaW5kaW5nfVwiID5cblx0XHRcdFx0PGNvbnRyb2xzOmNvbnRlbnRUcnVlPlxuXHRcdFx0XHRcdCR7dGhpcy5nZXRNaWNyb0NoYXJ0Q29udGVudCgpfVxuXHRcdFx0XHQ8L2NvbnRyb2xzOmNvbnRlbnRUcnVlPlxuXHRcdFx0XHQ8Y29udHJvbHM6Y29udGVudEZhbHNlPlxuXHRcdFx0XHRcdDxtOlRleHQgdGV4dD1cIipcIiAvPlxuXHRcdFx0XHQ8L2NvbnRyb2xzOmNvbnRlbnRGYWxzZT5cblx0XHRcdDwvY29udHJvbHM6Q29uZGl0aW9uYWxXcmFwcGVyPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE1pY3JvQ2hhcnRDb250ZW50KCk7XG5cdFx0fVxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUF3QnFCQSxlQUFlO0VBWnBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsT0FPQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxZQUFZO0lBQ2xCQyxTQUFTLEVBQUUsd0JBQXdCO0lBQ25DQyxlQUFlLEVBQUU7RUFDbEIsQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUUsSUFBSTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFNbEVILGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0JBQXNCO0lBQUVHLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQztJQUFFRixRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFNcEhGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0JBQXNCO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU9oRkgsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxR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