/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/CriticalityFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/helpers/DataPointTemplating"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter, BindingToolkit, StableIdHelper, TypeGuards, CriticalityFormatters, DataModelPathHelper, PropertyHelper, UIFormatters, FieldTemplating, DataPointTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var _exports = {};
  var getValueFormatted = DataPointTemplating.getValueFormatted;
  var getHeaderRatingIndicatorText = DataPointTemplating.getHeaderRatingIndicatorText;
  var buildFieldBindingExpression = DataPointTemplating.buildFieldBindingExpression;
  var buildExpressionForProgressIndicatorPercentValue = DataPointTemplating.buildExpressionForProgressIndicatorPercentValue;
  var buildExpressionForProgressIndicatorDisplayValue = DataPointTemplating.buildExpressionForProgressIndicatorDisplayValue;
  var isUsedInNavigationWithQuickViewFacets = FieldTemplating.isUsedInNavigationWithQuickViewFacets;
  var getVisibleExpression = FieldTemplating.getVisibleExpression;
  var getPropertyWithSemanticObject = FieldTemplating.getPropertyWithSemanticObject;
  var hasUnit = PropertyHelper.hasUnit;
  var hasCurrency = PropertyHelper.hasCurrency;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var buildExpressionForCriticalityIcon = CriticalityFormatters.buildExpressionForCriticalityIcon;
  var buildExpressionForCriticalityColor = CriticalityFormatters.buildExpressionForCriticalityColor;
  var isProperty = TypeGuards.isProperty;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var notEqual = BindingToolkit.notEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var compileExpression = BindingToolkit.compileExpression;
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
  let DataPointBlock = (_dec = defineBuildingBlock({
    name: "DataPoint",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "string"
  }), _dec5 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.dataPointStyle && !["", "large"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.dataPointStyle)) {
        throw new Error(`Allowed value ${formatOptionsInput.dataPointStyle} for dataPointStyle does not match`);
      }
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.iconSize && !["1rem", "1.375rem", "2rem"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.iconSize)) {
        throw new Error(`Allowed value ${formatOptionsInput.iconSize} for iconSize does not match`);
      }
      if (formatOptionsInput !== null && formatOptionsInput !== void 0 && formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput === null || formatOptionsInput === void 0 ? void 0 : formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec6 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(DataPointBlock, _BuildingBlockBase);
    /**
     * Prefix added to the generated ID of the field
     */
    /**
     * Metadata path to the dataPoint.
     * This property is usually a metadataContext pointing to a DataPoint having
     * $Type = "com.sap.vocabularies.UI.v1.DataPointType"
     */
    /**
     * Property added to associate the label with the DataPoint
     */
    /**
     * Retrieves the templating objects to further process the DataPoint.
     *
     * @param context DataPointProperties or a DataPoint
     * @returns The models containing infos like the DataModelPath, ValueDataModelPath and DataPointConverted
     */
    DataPointBlock.getTemplatingObjects = function getTemplatingObjects(context) {
      var _internalDataModelPat, _internalDataModelPat2;
      const internalDataModelPath = getInvolvedDataModelObjects(context.metaPath, context.contextPath);
      let internalValueDataModelPath;
      context.visible = getVisibleExpression(internalDataModelPath);
      if (internalDataModelPath !== null && internalDataModelPath !== void 0 && (_internalDataModelPat = internalDataModelPath.targetObject) !== null && _internalDataModelPat !== void 0 && (_internalDataModelPat2 = _internalDataModelPat.Value) !== null && _internalDataModelPat2 !== void 0 && _internalDataModelPat2.path) {
        internalValueDataModelPath = enhanceDataModelPath(internalDataModelPath, internalDataModelPath.targetObject.Value.path);
      }
      const internalDataPointConverted = convertMetaModelContext(context.metaPath);
      return {
        dataModelPath: internalDataModelPath,
        valueDataModelPath: internalValueDataModelPath,
        dataPointConverted: internalDataPointConverted
      };
    }

    /**
     * Function that calculates the visualization type for this DataPoint.
     *
     * @param properties The datapoint properties
     * @returns The DataPointProperties with the optimized coding for the visualization type
     */;
    DataPointBlock.getDataPointVisualization = function getDataPointVisualization(properties) {
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(properties);
      if ((dataPointConverted === null || dataPointConverted === void 0 ? void 0 : dataPointConverted.Visualization) === "UI.VisualizationType/Rating") {
        properties.visualization = "Rating";
        return properties;
      }
      if ((dataPointConverted === null || dataPointConverted === void 0 ? void 0 : dataPointConverted.Visualization) === "UI.VisualizationType/Progress") {
        properties.visualization = "Progress";
        return properties;
      }
      const valueProperty = valueDataModelPath && valueDataModelPath.targetObject;
      //check whether the visualization type should be an object number in case one of the if conditions met
      properties.hasQuickView = valueProperty && isUsedInNavigationWithQuickViewFacets(dataModelPath, valueProperty);
      if (getPropertyWithSemanticObject(valueDataModelPath)) {
        properties.hasQuickView = true;
      }
      if (!properties.hasQuickView) {
        if (isProperty(valueProperty) && (hasUnit(valueProperty) || hasCurrency(valueProperty))) {
          // we only show an objectNumber if there is no quickview and a unit or a currency
          properties.visualization = "ObjectNumber";
          return properties;
        }
      }

      //default case to handle this as objectStatus type
      properties.visualization = "ObjectStatus";
      return properties;
    }

    /**
     * Constructor method of the building block.
     *
     * @param properties The datapoint properties
     */;
    function DataPointBlock(properties) {
      var _this;
      //setup initial default property settings
      properties.hasQuickView = false;
      _this = _BuildingBlockBase.call(this, DataPointBlock.getDataPointVisualization(properties)) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }

    /**
     * The building block template for the rating indicator part.
     *
     * @returns An XML-based string with the definition of the rating indicator template
     */
    _exports = DataPointBlock;
    var _proto = DataPointBlock.prototype;
    _proto.getRatingIndicatorTemplate = function getRatingIndicatorTemplate() {
      var _dataPointValue$$targ;
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(this);
      const dataPointTarget = dataModelPath.targetObject;
      const targetValue = this.getTargetValueBinding();
      const dataPointValue = (dataPointTarget === null || dataPointTarget === void 0 ? void 0 : dataPointTarget.Value) || "";
      const propertyType = dataPointValue === null || dataPointValue === void 0 ? void 0 : (_dataPointValue$$targ = dataPointValue.$target) === null || _dataPointValue$$targ === void 0 ? void 0 : _dataPointValue$$targ.type;
      let numberOfFractionalDigits;
      if (propertyType === "Edm.Decimal" && dataPointTarget.ValueFormat) {
        if (dataPointTarget.ValueFormat.NumberOfFractionalDigits) {
          numberOfFractionalDigits = dataPointTarget.ValueFormat.NumberOfFractionalDigits;
        }
      }
      const value = getValueFormatted(valueDataModelPath, dataPointValue, propertyType, numberOfFractionalDigits);
      const text = getHeaderRatingIndicatorText(this.metaPath, dataPointTarget);
      let headerLabel = "";
      let targetLabel = "";
      const targetLabelExpression = compileExpression(formatResult([pathInModel("T_HEADER_RATING_INDICATOR_FOOTER", "sap.fe.i18n"), getExpressionFromAnnotation(dataPointConverted.Value, getRelativePaths(dataModelPath)), dataPointConverted.TargetValue ? getExpressionFromAnnotation(dataPointConverted.TargetValue, getRelativePaths(dataModelPath)) : "5"], "MESSAGE"));
      if (this.formatOptions.showLabels ?? false) {
        headerLabel = xml`<Label xmlns="sap.m"
					${this.attr("text", text)}
					${this.attr("visible", dataPointTarget.SampleSize || dataPointTarget.Description ? true : false)}
				/>`;
        targetLabel = xml`<Label
			xmlns="sap.m"
			core:require="{MESSAGE: 'sap/base/strings/formatMessage' }"
			${this.attr("text", targetLabelExpression)}
			visible="true" />`;
      }
      return xml`
		${headerLabel}
		<RatingIndicator
		xmlns="sap.m"

		${this.attr("id", this.idPrefix ? generate([this.idPrefix, "RatingIndicator-Field-display"]) : undefined)}
		${this.attr("maxValue", targetValue)}
		${this.attr("value", value)}
		${this.attr("tooltip", this.getTooltipValue())}
		${this.attr("iconSize", this.formatOptions.iconSize)}
		${this.attr("class", this.formatOptions.showLabels ?? false ? "sapUiTinyMarginTopBottom" : undefined)}
		editable="false"
	/>
	${targetLabel}`;
    }

    /**
     * The building block template for the progress indicator part.
     *
     * @returns An XML-based string with the definition of the progress indicator template
     */;
    _proto.getProgressIndicatorTemplate = function getProgressIndicatorTemplate() {
      var _this$formatOptions;
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(this);
      const criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      const displayValue = buildExpressionForProgressIndicatorDisplayValue(dataModelPath);
      const percentValue = buildExpressionForProgressIndicatorPercentValue(dataModelPath);
      const dataPointTarget = dataModelPath.targetObject;
      let firstLabel = "";
      let secondLabel = "";
      if ((this === null || this === void 0 ? void 0 : (_this$formatOptions = this.formatOptions) === null || _this$formatOptions === void 0 ? void 0 : _this$formatOptions.showLabels) ?? false) {
        var _valueDataModelPath$t, _valueDataModelPath$t2, _valueDataModelPath$t3;
        firstLabel = xml`<Label
				xmlns="sap.m"
				${this.attr("text", dataPointTarget === null || dataPointTarget === void 0 ? void 0 : dataPointTarget.Description)}
				${this.attr("visible", !!(dataPointTarget !== null && dataPointTarget !== void 0 && dataPointTarget.Description))}
			/>`;

        // const secondLabelText = (valueDataModelPath?.targetObject as Property)?.annotations?.Common?.Label;
        const secondLabelExpression = getExpressionFromAnnotation(valueDataModelPath === null || valueDataModelPath === void 0 ? void 0 : (_valueDataModelPath$t = valueDataModelPath.targetObject) === null || _valueDataModelPath$t === void 0 ? void 0 : (_valueDataModelPath$t2 = _valueDataModelPath$t.annotations) === null || _valueDataModelPath$t2 === void 0 ? void 0 : (_valueDataModelPath$t3 = _valueDataModelPath$t2.Common) === null || _valueDataModelPath$t3 === void 0 ? void 0 : _valueDataModelPath$t3.Label);
        secondLabel = xml`<Label
				xmlns="sap.m"
				${this.attr("text", compileExpression(secondLabelExpression))}
				${this.attr("visible", !!compileExpression(notEqual(undefined, secondLabelExpression)))}
			/>`;
      }
      return xml`
		${firstLabel}
			<ProgressIndicator
				xmlns="sap.m"
				${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ProgressIndicator-Field-display"]) : undefined)}
				${this.attr("displayValue", displayValue)}
				${this.attr("percentValue", percentValue)}
				${this.attr("state", criticalityColorExpression)}
				${this.attr("tooltip", this.getTooltipValue())}
			/>
			${secondLabel}`;
    }

    /**
     * The building block template for the object number common part.
     *
     * @returns An XML-based string with the definition of the object number common template
     */;
    _proto.getObjectNumberCommonTemplate = function getObjectNumberCommonTemplate() {
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(this);
      const criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      const emptyIndicatorMode = this.formatOptions.showEmptyIndicator ?? false ? "On" : undefined;
      const objectStatusNumber = buildFieldBindingExpression(dataModelPath, this.formatOptions, true);
      const unit = this.formatOptions.measureDisplayMode === "Hidden" ? undefined : compileExpression(UIFormatters.getBindingForUnitOrCurrency(valueDataModelPath));
      return xml`<ObjectNumber
			xmlns="sap.m"
			${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectNumber-Field-display"]) : undefined)}
			core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
			${this.attr("state", criticalityColorExpression)}
			${this.attr("number", objectStatusNumber)}
			${this.attr("unit", unit)}
			${this.attr("visible", this.visible)}
			emphasized="false"
			${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectNumberLarge" : undefined)}
			${this.attr("tooltip", this.getTooltipValue())}
			${this.attr("emptyIndicatorMode", emptyIndicatorMode)}
		/>`;
    }

    /**
     * The building block template for the object number.
     *
     * @returns An XML-based string with the definition of the object number template
     */;
    _proto.getObjectNumberTemplate = function getObjectNumberTemplate() {
      var _this$formatOptions2;
      const {
        valueDataModelPath
      } = DataPointBlock.getTemplatingObjects(this);
      if ((this === null || this === void 0 ? void 0 : (_this$formatOptions2 = this.formatOptions) === null || _this$formatOptions2 === void 0 ? void 0 : _this$formatOptions2.isAnalytics) ?? false) {
        return xml`
				<control:ConditionalWrapper
					xmlns:control="sap.fe.macros.controls"
					${this.attr("condition", UIFormatters.hasValidAnalyticalCurrencyOrUnit(valueDataModelPath))}
				>
					<control:contentTrue>
						${this.getObjectNumberCommonTemplate()}
					</control:contentTrue>
					<control:contentFalse>
						<ObjectNumber
							xmlns="sap.m"
							${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectNumber-Field-display-differentUnit"]) : undefined)}
							number="*"
							unit=""
							${this.attr("visible", this.visible)}
							emphasized="false"
							${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectNumberLarge" : undefined)}
						/>
					</control:contentFalse>
				</control:ConditionalWrapper>`;
      } else {
        return xml`${this.getObjectNumberCommonTemplate()}`;
      }
    }

    /**
     * Returns the dependent or an empty string.
     *
     * @returns Dependent either with the QuickView or an empty string.
     */;
    _proto.getObjectStatusDependentsTemplate = function getObjectStatusDependentsTemplate() {
      if (this.hasQuickView) {
        return `<dependents><macro:QuickView
						xmlns:macro="sap.fe.macros"
						dataField="{metaPath>}"
						contextPath="{contextPath>}"
					/></dependents>`;
      }
      return "";
    }

    /**
     * The building block template for the object status.
     *
     * @returns An XML-based string with the definition of the object status template
     */;
    _proto.getObjectStatusTemplate = function getObjectStatusTemplate() {
      const {
        dataModelPath,
        valueDataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(this);
      let criticalityColorExpression = buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      if (criticalityColorExpression === "None" && valueDataModelPath) {
        criticalityColorExpression = this.hasQuickView ? "Information" : "None";
      }

      // if the semanticObjects already calculated the criticality we don't calculate it again
      criticalityColorExpression = criticalityColorExpression ? criticalityColorExpression : buildExpressionForCriticalityColor(dataPointConverted, dataModelPath);
      const emptyIndicatorMode = this.formatOptions.showEmptyIndicator ?? false ? "On" : undefined;
      const objectStatusText = buildFieldBindingExpression(dataModelPath, this.formatOptions, false);
      const iconExpression = buildExpressionForCriticalityIcon(dataPointConverted, dataModelPath);
      return xml`<ObjectStatus
						xmlns="sap.m"
						${this.attr("id", this.idPrefix ? generate([this.idPrefix, "ObjectStatus-Field-display"]) : undefined)}
						core:require="{ FieldRuntime: 'sap/fe/macros/field/FieldRuntime' }"
						${this.attr("class", this.formatOptions.dataPointStyle === "large" ? "sapMObjectStatusLarge" : undefined)}
						${this.attr("icon", iconExpression)}
						${this.attr("tooltip", this.getTooltipValue())}
						${this.attr("state", criticalityColorExpression)}
						${this.attr("text", objectStatusText)}
						${this.attr("emptyIndicatorMode", emptyIndicatorMode)}
						${this.attr("active", this.hasQuickView)}
						press="FieldRuntime.pressLink"
						${this.attr("ariaLabelledBy", this.ariaLabelledBy !== null ? this.ariaLabelledBy : undefined)}
				>${this.getObjectStatusDependentsTemplate()}
				</ObjectStatus>`;
    }

    /**
     * The helper method to get a possible tooltip text.
     *
     * @returns BindingToolkitExpression
     */;
    _proto.getTooltipValue = function getTooltipValue() {
      var _dataPointConverted$a, _dataPointConverted$a2, _dataPointConverted$a3;
      const {
        dataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(this);
      return getExpressionFromAnnotation(dataPointConverted === null || dataPointConverted === void 0 ? void 0 : (_dataPointConverted$a = dataPointConverted.annotations) === null || _dataPointConverted$a === void 0 ? void 0 : (_dataPointConverted$a2 = _dataPointConverted$a.Common) === null || _dataPointConverted$a2 === void 0 ? void 0 : (_dataPointConverted$a3 = _dataPointConverted$a2.QuickInfo) === null || _dataPointConverted$a3 === void 0 ? void 0 : _dataPointConverted$a3.valueOf(), getRelativePaths(dataModelPath));
    }

    /**
     * The helper method to get a possible target value binding.
     *
     * @returns BindingToolkitExpression
     */;
    _proto.getTargetValueBinding = function getTargetValueBinding() {
      const {
        dataModelPath,
        dataPointConverted
      } = DataPointBlock.getTemplatingObjects(this);
      return getExpressionFromAnnotation(dataPointConverted.TargetValue, getRelativePaths(dataModelPath));
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getTemplate = function getTemplate() {
      switch (this.visualization) {
        case "Rating":
          {
            return this.getRatingIndicatorTemplate();
          }
        case "Progress":
          {
            return this.getProgressIndicatorTemplate();
          }
        case "ObjectNumber":
          {
            return this.getObjectNumberTemplate();
          }
        default:
          {
            return this.getObjectStatusTemplate();
          }
      }
    };
    return DataPointBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DataPointBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRhUG9pbnRCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJ2YWxpZGF0ZSIsImZvcm1hdE9wdGlvbnNJbnB1dCIsImRhdGFQb2ludFN0eWxlIiwiaW5jbHVkZXMiLCJFcnJvciIsImRpc3BsYXlNb2RlIiwiaWNvblNpemUiLCJtZWFzdXJlRGlzcGxheU1vZGUiLCJleHBlY3RlZFR5cGVzIiwiZ2V0VGVtcGxhdGluZ09iamVjdHMiLCJjb250ZXh0IiwiaW50ZXJuYWxEYXRhTW9kZWxQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwibWV0YVBhdGgiLCJjb250ZXh0UGF0aCIsImludGVybmFsVmFsdWVEYXRhTW9kZWxQYXRoIiwidmlzaWJsZSIsImdldFZpc2libGVFeHByZXNzaW9uIiwidGFyZ2V0T2JqZWN0IiwiVmFsdWUiLCJwYXRoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJpbnRlcm5hbERhdGFQb2ludENvbnZlcnRlZCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwiZGF0YU1vZGVsUGF0aCIsInZhbHVlRGF0YU1vZGVsUGF0aCIsImRhdGFQb2ludENvbnZlcnRlZCIsImdldERhdGFQb2ludFZpc3VhbGl6YXRpb24iLCJwcm9wZXJ0aWVzIiwiVmlzdWFsaXphdGlvbiIsInZpc3VhbGl6YXRpb24iLCJ2YWx1ZVByb3BlcnR5IiwiaGFzUXVpY2tWaWV3IiwiaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsImdldFByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0IiwiaXNQcm9wZXJ0eSIsImhhc1VuaXQiLCJoYXNDdXJyZW5jeSIsImdldFJhdGluZ0luZGljYXRvclRlbXBsYXRlIiwiZGF0YVBvaW50VGFyZ2V0IiwidGFyZ2V0VmFsdWUiLCJnZXRUYXJnZXRWYWx1ZUJpbmRpbmciLCJkYXRhUG9pbnRWYWx1ZSIsInByb3BlcnR5VHlwZSIsIiR0YXJnZXQiLCJudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMiLCJWYWx1ZUZvcm1hdCIsIk51bWJlck9mRnJhY3Rpb25hbERpZ2l0cyIsInZhbHVlIiwiZ2V0VmFsdWVGb3JtYXR0ZWQiLCJ0ZXh0IiwiZ2V0SGVhZGVyUmF0aW5nSW5kaWNhdG9yVGV4dCIsImhlYWRlckxhYmVsIiwidGFyZ2V0TGFiZWwiLCJ0YXJnZXRMYWJlbEV4cHJlc3Npb24iLCJjb21waWxlRXhwcmVzc2lvbiIsImZvcm1hdFJlc3VsdCIsInBhdGhJbk1vZGVsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiZ2V0UmVsYXRpdmVQYXRocyIsIlRhcmdldFZhbHVlIiwiZm9ybWF0T3B0aW9ucyIsInNob3dMYWJlbHMiLCJ4bWwiLCJhdHRyIiwiU2FtcGxlU2l6ZSIsIkRlc2NyaXB0aW9uIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsInVuZGVmaW5lZCIsImdldFRvb2x0aXBWYWx1ZSIsImdldFByb2dyZXNzSW5kaWNhdG9yVGVtcGxhdGUiLCJjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbiIsImJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5Q29sb3IiLCJkaXNwbGF5VmFsdWUiLCJidWlsZEV4cHJlc3Npb25Gb3JQcm9ncmVzc0luZGljYXRvckRpc3BsYXlWYWx1ZSIsInBlcmNlbnRWYWx1ZSIsImJ1aWxkRXhwcmVzc2lvbkZvclByb2dyZXNzSW5kaWNhdG9yUGVyY2VudFZhbHVlIiwiZmlyc3RMYWJlbCIsInNlY29uZExhYmVsIiwic2Vjb25kTGFiZWxFeHByZXNzaW9uIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJMYWJlbCIsIm5vdEVxdWFsIiwiZ2V0T2JqZWN0TnVtYmVyQ29tbW9uVGVtcGxhdGUiLCJlbXB0eUluZGljYXRvck1vZGUiLCJzaG93RW1wdHlJbmRpY2F0b3IiLCJvYmplY3RTdGF0dXNOdW1iZXIiLCJidWlsZEZpZWxkQmluZGluZ0V4cHJlc3Npb24iLCJ1bml0IiwiVUlGb3JtYXR0ZXJzIiwiZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5IiwiZ2V0T2JqZWN0TnVtYmVyVGVtcGxhdGUiLCJpc0FuYWx5dGljcyIsImhhc1ZhbGlkQW5hbHl0aWNhbEN1cnJlbmN5T3JVbml0IiwiZ2V0T2JqZWN0U3RhdHVzRGVwZW5kZW50c1RlbXBsYXRlIiwiZ2V0T2JqZWN0U3RhdHVzVGVtcGxhdGUiLCJvYmplY3RTdGF0dXNUZXh0IiwiaWNvbkV4cHJlc3Npb24iLCJidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUljb24iLCJhcmlhTGFiZWxsZWRCeSIsIlF1aWNrSW5mbyIsInZhbHVlT2YiLCJnZXRUZW1wbGF0ZSIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEYXRhUG9pbnQuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY09iamVjdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFQb2ludFR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgY29udmVydE1ldGFNb2RlbENvbnRleHQsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGZvcm1hdFJlc3VsdCwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLCBub3RFcXVhbCwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7IGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5Q29sb3IsIGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5SWNvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0NyaXRpY2FsaXR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZW5oYW5jZURhdGFNb2RlbFBhdGgsIGdldFJlbGF0aXZlUGF0aHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBoYXNDdXJyZW5jeSwgaGFzVW5pdCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgKiBhcyBVSUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQge1xuXHRnZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCxcblx0Z2V0VmlzaWJsZUV4cHJlc3Npb24sXG5cdGlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHNcbn0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQge1xuXHRidWlsZEV4cHJlc3Npb25Gb3JQcm9ncmVzc0luZGljYXRvckRpc3BsYXlWYWx1ZSxcblx0YnVpbGRFeHByZXNzaW9uRm9yUHJvZ3Jlc3NJbmRpY2F0b3JQZXJjZW50VmFsdWUsXG5cdGJ1aWxkRmllbGRCaW5kaW5nRXhwcmVzc2lvbixcblx0Z2V0SGVhZGVyUmF0aW5nSW5kaWNhdG9yVGV4dCxcblx0Z2V0VmFsdWVGb3JtYXR0ZWRcbn0gZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvaGVscGVycy9EYXRhUG9pbnRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG50eXBlIERhdGFQb2ludEZvcm1hdE9wdGlvbnMgPSBQYXJ0aWFsPHtcblx0ZGF0YVBvaW50U3R5bGU6IFwiXCIgfCBcImxhcmdlXCI7XG5cdGRpc3BsYXlNb2RlOiBEaXNwbGF5TW9kZTtcblx0LyoqXG5cdCAqIERlZmluZSB0aGUgc2l6ZSBvZiB0aGUgaWNvbnMgKEZvciBSYXRpbmdJbmRpY2F0b3Igb25seSlcblx0ICovXG5cdGljb25TaXplOiBcIjFyZW1cIiB8IFwiMS4zNzVyZW1cIiB8IFwiMnJlbVwiO1xuXHRpc0FuYWx5dGljczogYm9vbGVhbjtcblx0bWVhc3VyZURpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBJZiBzZXQgdG8gJ3RydWUnLCBTQVAgRmlvcmkgZWxlbWVudHMgc2hvd3MgYW4gZW1wdHkgaW5kaWNhdG9yIGluIGRpc3BsYXkgbW9kZSBmb3IgdGhlIE9iamVjdE51bWJlclxuXHQgKi9cblx0c2hvd0VtcHR5SW5kaWNhdG9yOiBib29sZWFuO1xuXHQvKipcblx0ICogV2hlbiB0cnVlLCBkaXNwbGF5cyB0aGUgbGFiZWxzIGZvciB0aGUgUmF0aW5nIGFuZCBQcm9ncmVzcyBpbmRpY2F0b3JzXG5cdCAqL1xuXHRzaG93TGFiZWxzOiBib29sZWFuO1xufT47XG5leHBvcnQgdHlwZSBEYXRhUG9pbnRQcm9wZXJ0aWVzID0ge1xuXHRtZXRhUGF0aDogQ29udGV4dDtcblx0ZWRpdE1vZGU/OiBzdHJpbmc7XG5cdGNvbnRleHRQYXRoOiBDb250ZXh0O1xuXHRmb3JtYXRPcHRpb25zOiBEYXRhUG9pbnRGb3JtYXRPcHRpb25zO1xuXHRpZFByZWZpeD86IHN0cmluZztcblx0Ly8gY29tcHV0ZWQgcHJvcGVydGllc1xuXHRjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbj86IHN0cmluZztcblx0ZGlzcGxheVZhbHVlPzogc3RyaW5nO1xuXHRlbXB0eUluZGljYXRvck1vZGU/OiBcIk9uXCI7XG5cdGhhc1F1aWNrVmlldz86IGJvb2xlYW47XG5cdG9iamVjdFN0YXR1c051bWJlcj86IHN0cmluZztcblx0cGVyY2VudFZhbHVlPzogc3RyaW5nO1xuXHRzZW1hbnRpY09iamVjdD86IHN0cmluZyB8IFNlbWFudGljT2JqZWN0O1xuXHRzZW1hbnRpY09iamVjdHM/OiBzdHJpbmc7XG5cdHRhcmdldExhYmVsPzogc3RyaW5nO1xuXHR1bml0Pzogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xuXHR2aXN1YWxpemF0aW9uPzogc3RyaW5nO1xuXHRvYmplY3RTdGF0dXNUZXh0Pzogc3RyaW5nO1xuXHRpY29uRXhwcmVzc2lvbj86IHN0cmluZztcbn07XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJEYXRhUG9pbnRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFQb2ludEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogUHJlZml4IGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGlkUHJlZml4Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhUG9pbnQuXG5cdCAqIFRoaXMgcHJvcGVydHkgaXMgdXN1YWxseSBhIG1ldGFkYXRhQ29udGV4dCBwb2ludGluZyB0byBhIERhdGFQb2ludCBoYXZpbmdcblx0ICogJFR5cGUgPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIlxuXHQgKi9cblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgbWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIERhdGFQb2ludFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBhcmlhTGFiZWxsZWRCeT86IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgdG8gc2V0IHRoZSB2aXN1YWxpemF0aW9uIHR5cGVcblx0ICovXG5cdHByaXZhdGUgdmlzdWFsaXphdGlvbiE6IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgdG8gc2V0IHRoZSB2aXNpYmlsaXR5XG5cdCAqL1xuXHRwcml2YXRlIHZpc2libGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IHRvIHNldCBwcm9wZXJ0eSBpZiB0aGUgcG9ycGVydHkgaGFzIGEgUXVpY2t2aWV3XG5cdCAqL1xuXHRwcml2YXRlIGhhc1F1aWNrVmlldyE6IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcIm9iamVjdFwiLFxuXHRcdHZhbGlkYXRlOiBmdW5jdGlvbiAoZm9ybWF0T3B0aW9uc0lucHV0OiBEYXRhUG9pbnRGb3JtYXRPcHRpb25zKSB7XG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0Py5kYXRhUG9pbnRTdHlsZSAmJiAhW1wiXCIsIFwibGFyZ2VcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0Py5kYXRhUG9pbnRTdHlsZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LmRhdGFQb2ludFN0eWxlfSBmb3IgZGF0YVBvaW50U3R5bGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQ/LmRpc3BsYXlNb2RlICYmXG5cdFx0XHRcdCFbXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiVmFsdWVEZXNjcmlwdGlvblwiLCBcIkRlc2NyaXB0aW9uVmFsdWVcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0Py5kaXNwbGF5TW9kZSlcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGV9IGZvciBkaXNwbGF5TW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0Py5pY29uU2l6ZSAmJiAhW1wiMXJlbVwiLCBcIjEuMzc1cmVtXCIsIFwiMnJlbVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQ/Lmljb25TaXplKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuaWNvblNpemV9IGZvciBpY29uU2l6ZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0Py5tZWFzdXJlRGlzcGxheU1vZGUgJiYgIVtcIkhpZGRlblwiLCBcIlJlYWRPbmx5XCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dD8ubWVhc3VyZURpc3BsYXlNb2RlKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQubWVhc3VyZURpc3BsYXlNb2RlfSBmb3IgbWVhc3VyZURpc3BsYXlNb2RlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zSW5wdXQ7XG5cdFx0fVxuXHR9KVxuXHRwdWJsaWMgZm9ybWF0T3B0aW9uczogRGF0YVBvaW50Rm9ybWF0T3B0aW9ucyA9IHt9O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIl1cblx0fSlcblx0cHVibGljIGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0ZW1wbGF0aW5nIG9iamVjdHMgdG8gZnVydGhlciBwcm9jZXNzIHRoZSBEYXRhUG9pbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IERhdGFQb2ludFByb3BlcnRpZXMgb3IgYSBEYXRhUG9pbnRcblx0ICogQHJldHVybnMgVGhlIG1vZGVscyBjb250YWluaW5nIGluZm9zIGxpa2UgdGhlIERhdGFNb2RlbFBhdGgsIFZhbHVlRGF0YU1vZGVsUGF0aCBhbmQgRGF0YVBvaW50Q29udmVydGVkXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBnZXRUZW1wbGF0aW5nT2JqZWN0cyhjb250ZXh0OiBEYXRhUG9pbnRQcm9wZXJ0aWVzIHwgRGF0YVBvaW50QmxvY2spOiB7XG5cdFx0ZGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aDtcblx0XHR2YWx1ZURhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggfCB1bmRlZmluZWQ7XG5cdFx0ZGF0YVBvaW50Q29udmVydGVkOiBEYXRhUG9pbnRUeXBlO1xuXHR9IHtcblx0XHRjb25zdCBpbnRlcm5hbERhdGFNb2RlbFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoY29udGV4dC5tZXRhUGF0aCwgY29udGV4dC5jb250ZXh0UGF0aCk7XG5cdFx0bGV0IGludGVybmFsVmFsdWVEYXRhTW9kZWxQYXRoO1xuXHRcdChjb250ZXh0IGFzIERhdGFQb2ludFByb3BlcnRpZXMpLnZpc2libGUgPSBnZXRWaXNpYmxlRXhwcmVzc2lvbihpbnRlcm5hbERhdGFNb2RlbFBhdGgpO1xuXHRcdGlmIChpbnRlcm5hbERhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdD8uVmFsdWU/LnBhdGgpIHtcblx0XHRcdGludGVybmFsVmFsdWVEYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoaW50ZXJuYWxEYXRhTW9kZWxQYXRoLCBpbnRlcm5hbERhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlLnBhdGgpO1xuXHRcdH1cblx0XHRjb25zdCBpbnRlcm5hbERhdGFQb2ludENvbnZlcnRlZCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KGNvbnRleHQubWV0YVBhdGgpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGRhdGFNb2RlbFBhdGg6IGludGVybmFsRGF0YU1vZGVsUGF0aCxcblx0XHRcdHZhbHVlRGF0YU1vZGVsUGF0aDogaW50ZXJuYWxWYWx1ZURhdGFNb2RlbFBhdGgsXG5cdFx0XHRkYXRhUG9pbnRDb252ZXJ0ZWQ6IGludGVybmFsRGF0YVBvaW50Q29udmVydGVkXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0aGF0IGNhbGN1bGF0ZXMgdGhlIHZpc3VhbGl6YXRpb24gdHlwZSBmb3IgdGhpcyBEYXRhUG9pbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIFRoZSBkYXRhcG9pbnQgcHJvcGVydGllc1xuXHQgKiBAcmV0dXJucyBUaGUgRGF0YVBvaW50UHJvcGVydGllcyB3aXRoIHRoZSBvcHRpbWl6ZWQgY29kaW5nIGZvciB0aGUgdmlzdWFsaXphdGlvbiB0eXBlXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBnZXREYXRhUG9pbnRWaXN1YWxpemF0aW9uKHByb3BlcnRpZXM6IERhdGFQb2ludFByb3BlcnRpZXMpOiBEYXRhUG9pbnRQcm9wZXJ0aWVzIHtcblx0XHRjb25zdCB7IGRhdGFNb2RlbFBhdGgsIHZhbHVlRGF0YU1vZGVsUGF0aCwgZGF0YVBvaW50Q29udmVydGVkIH0gPSBEYXRhUG9pbnRCbG9jay5nZXRUZW1wbGF0aW5nT2JqZWN0cyhwcm9wZXJ0aWVzKTtcblx0XHRpZiAoZGF0YVBvaW50Q29udmVydGVkPy5WaXN1YWxpemF0aW9uID09PSBcIlVJLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRwcm9wZXJ0aWVzLnZpc3VhbGl6YXRpb24gPSBcIlJhdGluZ1wiO1xuXHRcdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdFx0fVxuXHRcdGlmIChkYXRhUG9pbnRDb252ZXJ0ZWQ/LlZpc3VhbGl6YXRpb24gPT09IFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUHJvZ3Jlc3NcIikge1xuXHRcdFx0cHJvcGVydGllcy52aXN1YWxpemF0aW9uID0gXCJQcm9ncmVzc1wiO1xuXHRcdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdFx0fVxuXHRcdGNvbnN0IHZhbHVlUHJvcGVydHkgPSB2YWx1ZURhdGFNb2RlbFBhdGggJiYgdmFsdWVEYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0XHQvL2NoZWNrIHdoZXRoZXIgdGhlIHZpc3VhbGl6YXRpb24gdHlwZSBzaG91bGQgYmUgYW4gb2JqZWN0IG51bWJlciBpbiBjYXNlIG9uZSBvZiB0aGUgaWYgY29uZGl0aW9ucyBtZXRcblx0XHRwcm9wZXJ0aWVzLmhhc1F1aWNrVmlldyA9IHZhbHVlUHJvcGVydHkgJiYgaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyhkYXRhTW9kZWxQYXRoLCB2YWx1ZVByb3BlcnR5KTtcblx0XHRpZiAoZ2V0UHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QodmFsdWVEYXRhTW9kZWxQYXRoIGFzIERhdGFNb2RlbE9iamVjdFBhdGgpKSB7XG5cdFx0XHRwcm9wZXJ0aWVzLmhhc1F1aWNrVmlldyA9IHRydWU7XG5cdFx0fVxuXHRcdGlmICghcHJvcGVydGllcy5oYXNRdWlja1ZpZXcpIHtcblx0XHRcdGlmIChpc1Byb3BlcnR5KHZhbHVlUHJvcGVydHkpICYmIChoYXNVbml0KHZhbHVlUHJvcGVydHkpIHx8IGhhc0N1cnJlbmN5KHZhbHVlUHJvcGVydHkpKSkge1xuXHRcdFx0XHQvLyB3ZSBvbmx5IHNob3cgYW4gb2JqZWN0TnVtYmVyIGlmIHRoZXJlIGlzIG5vIHF1aWNrdmlldyBhbmQgYSB1bml0IG9yIGEgY3VycmVuY3lcblx0XHRcdFx0cHJvcGVydGllcy52aXN1YWxpemF0aW9uID0gXCJPYmplY3ROdW1iZXJcIjtcblx0XHRcdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9kZWZhdWx0IGNhc2UgdG8gaGFuZGxlIHRoaXMgYXMgb2JqZWN0U3RhdHVzIHR5cGVcblx0XHRwcm9wZXJ0aWVzLnZpc3VhbGl6YXRpb24gPSBcIk9iamVjdFN0YXR1c1wiO1xuXHRcdHJldHVybiBwcm9wZXJ0aWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIG1ldGhvZCBvZiB0aGUgYnVpbGRpbmcgYmxvY2suXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIFRoZSBkYXRhcG9pbnQgcHJvcGVydGllc1xuXHQgKi9cblx0Y29uc3RydWN0b3IocHJvcGVydGllczogRGF0YVBvaW50UHJvcGVydGllcykge1xuXHRcdC8vc2V0dXAgaW5pdGlhbCBkZWZhdWx0IHByb3BlcnR5IHNldHRpbmdzXG5cdFx0cHJvcGVydGllcy5oYXNRdWlja1ZpZXcgPSBmYWxzZTtcblxuXHRcdHN1cGVyKERhdGFQb2ludEJsb2NrLmdldERhdGFQb2ludFZpc3VhbGl6YXRpb24ocHJvcGVydGllcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmb3IgdGhlIHJhdGluZyBpbmRpY2F0b3IgcGFydC5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSByYXRpbmcgaW5kaWNhdG9yIHRlbXBsYXRlXG5cdCAqL1xuXHRnZXRSYXRpbmdJbmRpY2F0b3JUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCB7IGRhdGFNb2RlbFBhdGgsIHZhbHVlRGF0YU1vZGVsUGF0aCwgZGF0YVBvaW50Q29udmVydGVkIH0gPSBEYXRhUG9pbnRCbG9jay5nZXRUZW1wbGF0aW5nT2JqZWN0cyh0aGlzKTtcblx0XHRjb25zdCBkYXRhUG9pbnRUYXJnZXQgPSBkYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0XHRjb25zdCB0YXJnZXRWYWx1ZSA9IHRoaXMuZ2V0VGFyZ2V0VmFsdWVCaW5kaW5nKCk7XG5cblx0XHRjb25zdCBkYXRhUG9pbnRWYWx1ZSA9IGRhdGFQb2ludFRhcmdldD8uVmFsdWUgfHwgXCJcIjtcblx0XHRjb25zdCBwcm9wZXJ0eVR5cGUgPSBkYXRhUG9pbnRWYWx1ZT8uJHRhcmdldD8udHlwZTtcblxuXHRcdGxldCBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHM7XG5cdFx0aWYgKHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGVjaW1hbFwiICYmIGRhdGFQb2ludFRhcmdldC5WYWx1ZUZvcm1hdCkge1xuXHRcdFx0aWYgKGRhdGFQb2ludFRhcmdldC5WYWx1ZUZvcm1hdC5OdW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMpIHtcblx0XHRcdFx0bnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzID0gZGF0YVBvaW50VGFyZ2V0LlZhbHVlRm9ybWF0Lk51bWJlck9mRnJhY3Rpb25hbERpZ2l0cztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCB2YWx1ZSA9IGdldFZhbHVlRm9ybWF0dGVkKHZhbHVlRGF0YU1vZGVsUGF0aCBhcyBEYXRhTW9kZWxPYmplY3RQYXRoLCBkYXRhUG9pbnRWYWx1ZSwgcHJvcGVydHlUeXBlLCBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMpO1xuXG5cdFx0Y29uc3QgdGV4dCA9IGdldEhlYWRlclJhdGluZ0luZGljYXRvclRleHQodGhpcy5tZXRhUGF0aCwgZGF0YVBvaW50VGFyZ2V0KTtcblxuXHRcdGxldCBoZWFkZXJMYWJlbCA9IFwiXCI7XG5cdFx0bGV0IHRhcmdldExhYmVsID0gXCJcIjtcblxuXHRcdGNvbnN0IHRhcmdldExhYmVsRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0Zm9ybWF0UmVzdWx0KFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0cGF0aEluTW9kZWwoXCJUX0hFQURFUl9SQVRJTkdfSU5ESUNBVE9SX0ZPT1RFUlwiLCBcInNhcC5mZS5pMThuXCIpLFxuXHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhUG9pbnRDb252ZXJ0ZWQuVmFsdWUsIGdldFJlbGF0aXZlUGF0aHMoZGF0YU1vZGVsUGF0aCkpLFxuXHRcdFx0XHRcdGRhdGFQb2ludENvbnZlcnRlZC5UYXJnZXRWYWx1ZVxuXHRcdFx0XHRcdFx0PyBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YVBvaW50Q29udmVydGVkLlRhcmdldFZhbHVlLCBnZXRSZWxhdGl2ZVBhdGhzKGRhdGFNb2RlbFBhdGgpKVxuXHRcdFx0XHRcdFx0OiBcIjVcIlxuXHRcdFx0XHRdLFxuXHRcdFx0XHRcIk1FU1NBR0VcIlxuXHRcdFx0KVxuXHRcdCk7XG5cblx0XHRpZiAodGhpcy5mb3JtYXRPcHRpb25zLnNob3dMYWJlbHMgPz8gZmFsc2UpIHtcblx0XHRcdGhlYWRlckxhYmVsID0geG1sYDxMYWJlbCB4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHQke3RoaXMuYXR0cihcInRleHRcIiwgdGV4dCl9XG5cdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJ2aXNpYmxlXCIsIGRhdGFQb2ludFRhcmdldC5TYW1wbGVTaXplIHx8IGRhdGFQb2ludFRhcmdldC5EZXNjcmlwdGlvbiA/IHRydWUgOiBmYWxzZSl9XG5cdFx0XHRcdC8+YDtcblxuXHRcdFx0dGFyZ2V0TGFiZWwgPSB4bWxgPExhYmVsXG5cdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdGNvcmU6cmVxdWlyZT1cIntNRVNTQUdFOiAnc2FwL2Jhc2Uvc3RyaW5ncy9mb3JtYXRNZXNzYWdlJyB9XCJcblx0XHRcdCR7dGhpcy5hdHRyKFwidGV4dFwiLCB0YXJnZXRMYWJlbEV4cHJlc3Npb24pfVxuXHRcdFx0dmlzaWJsZT1cInRydWVcIiAvPmA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHhtbGBcblx0XHQke2hlYWRlckxhYmVsfVxuXHRcdDxSYXRpbmdJbmRpY2F0b3Jcblx0XHR4bWxucz1cInNhcC5tXCJcblxuXHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgdGhpcy5pZFByZWZpeCA/IGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBcIlJhdGluZ0luZGljYXRvci1GaWVsZC1kaXNwbGF5XCJdKSA6IHVuZGVmaW5lZCl9XG5cdFx0JHt0aGlzLmF0dHIoXCJtYXhWYWx1ZVwiLCB0YXJnZXRWYWx1ZSl9XG5cdFx0JHt0aGlzLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSl9XG5cdFx0JHt0aGlzLmF0dHIoXCJ0b29sdGlwXCIsIHRoaXMuZ2V0VG9vbHRpcFZhbHVlKCkpfVxuXHRcdCR7dGhpcy5hdHRyKFwiaWNvblNpemVcIiwgdGhpcy5mb3JtYXRPcHRpb25zLmljb25TaXplKX1cblx0XHQke3RoaXMuYXR0cihcImNsYXNzXCIsIHRoaXMuZm9ybWF0T3B0aW9ucy5zaG93TGFiZWxzID8/IGZhbHNlID8gXCJzYXBVaVRpbnlNYXJnaW5Ub3BCb3R0b21cIiA6IHVuZGVmaW5lZCl9XG5cdFx0ZWRpdGFibGU9XCJmYWxzZVwiXG5cdC8+XG5cdCR7dGFyZ2V0TGFiZWx9YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZm9yIHRoZSBwcm9ncmVzcyBpbmRpY2F0b3IgcGFydC5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBwcm9ncmVzcyBpbmRpY2F0b3IgdGVtcGxhdGVcblx0ICovXG5cdGdldFByb2dyZXNzSW5kaWNhdG9yVGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgeyBkYXRhTW9kZWxQYXRoLCB2YWx1ZURhdGFNb2RlbFBhdGgsIGRhdGFQb2ludENvbnZlcnRlZCB9ID0gRGF0YVBvaW50QmxvY2suZ2V0VGVtcGxhdGluZ09iamVjdHModGhpcyk7XG5cdFx0Y29uc3QgY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb24gPSBidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUNvbG9yKGRhdGFQb2ludENvbnZlcnRlZCwgZGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgZGlzcGxheVZhbHVlID0gYnVpbGRFeHByZXNzaW9uRm9yUHJvZ3Jlc3NJbmRpY2F0b3JEaXNwbGF5VmFsdWUoZGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgcGVyY2VudFZhbHVlID0gYnVpbGRFeHByZXNzaW9uRm9yUHJvZ3Jlc3NJbmRpY2F0b3JQZXJjZW50VmFsdWUoZGF0YU1vZGVsUGF0aCk7XG5cblx0XHRjb25zdCBkYXRhUG9pbnRUYXJnZXQgPSBkYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0XHRsZXQgZmlyc3RMYWJlbCA9IFwiXCI7XG5cdFx0bGV0IHNlY29uZExhYmVsID0gXCJcIjtcblxuXHRcdGlmICh0aGlzPy5mb3JtYXRPcHRpb25zPy5zaG93TGFiZWxzID8/IGZhbHNlKSB7XG5cdFx0XHRmaXJzdExhYmVsID0geG1sYDxMYWJlbFxuXHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0JHt0aGlzLmF0dHIoXCJ0ZXh0XCIsIGRhdGFQb2ludFRhcmdldD8uRGVzY3JpcHRpb24pfVxuXHRcdFx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgISFkYXRhUG9pbnRUYXJnZXQ/LkRlc2NyaXB0aW9uKX1cblx0XHRcdC8+YDtcblxuXHRcdFx0Ly8gY29uc3Qgc2Vjb25kTGFiZWxUZXh0ID0gKHZhbHVlRGF0YU1vZGVsUGF0aD8udGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw7XG5cdFx0XHRjb25zdCBzZWNvbmRMYWJlbEV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdCh2YWx1ZURhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSk/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsXG5cdFx0XHQpO1xuXHRcdFx0c2Vjb25kTGFiZWwgPSB4bWxgPExhYmVsXG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHQke3RoaXMuYXR0cihcInRleHRcIiwgY29tcGlsZUV4cHJlc3Npb24oc2Vjb25kTGFiZWxFeHByZXNzaW9uKSl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwidmlzaWJsZVwiLCAhIWNvbXBpbGVFeHByZXNzaW9uKG5vdEVxdWFsKHVuZGVmaW5lZCwgc2Vjb25kTGFiZWxFeHByZXNzaW9uKSkpfVxuXHRcdFx0Lz5gO1xuXHRcdH1cblxuXHRcdHJldHVybiB4bWxgXG5cdFx0JHtmaXJzdExhYmVsfVxuXHRcdFx0PFByb2dyZXNzSW5kaWNhdG9yXG5cdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHQke3RoaXMuYXR0cihcImlkXCIsIHRoaXMuaWRQcmVmaXggPyBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJQcm9ncmVzc0luZGljYXRvci1GaWVsZC1kaXNwbGF5XCJdKSA6IHVuZGVmaW5lZCl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwiZGlzcGxheVZhbHVlXCIsIGRpc3BsYXlWYWx1ZSl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwicGVyY2VudFZhbHVlXCIsIHBlcmNlbnRWYWx1ZSl9XG5cdFx0XHRcdCR7dGhpcy5hdHRyKFwic3RhdGVcIiwgY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb24pfVxuXHRcdFx0XHQke3RoaXMuYXR0cihcInRvb2x0aXBcIiwgdGhpcy5nZXRUb29sdGlwVmFsdWUoKSl9XG5cdFx0XHQvPlxuXHRcdFx0JHtzZWNvbmRMYWJlbH1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmb3IgdGhlIG9iamVjdCBudW1iZXIgY29tbW9uIHBhcnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgb2JqZWN0IG51bWJlciBjb21tb24gdGVtcGxhdGVcblx0ICovXG5cdGdldE9iamVjdE51bWJlckNvbW1vblRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IHsgZGF0YU1vZGVsUGF0aCwgdmFsdWVEYXRhTW9kZWxQYXRoLCBkYXRhUG9pbnRDb252ZXJ0ZWQgfSA9IERhdGFQb2ludEJsb2NrLmdldFRlbXBsYXRpbmdPYmplY3RzKHRoaXMpO1xuXHRcdGNvbnN0IGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uID0gYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlDb2xvcihkYXRhUG9pbnRDb252ZXJ0ZWQsIGRhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IGVtcHR5SW5kaWNhdG9yTW9kZSA9IHRoaXMuZm9ybWF0T3B0aW9ucy5zaG93RW1wdHlJbmRpY2F0b3IgPz8gZmFsc2UgPyBcIk9uXCIgOiB1bmRlZmluZWQ7XG5cdFx0Y29uc3Qgb2JqZWN0U3RhdHVzTnVtYmVyID0gYnVpbGRGaWVsZEJpbmRpbmdFeHByZXNzaW9uKGRhdGFNb2RlbFBhdGgsIHRoaXMuZm9ybWF0T3B0aW9ucywgdHJ1ZSk7XG5cdFx0Y29uc3QgdW5pdCA9XG5cdFx0XHR0aGlzLmZvcm1hdE9wdGlvbnMubWVhc3VyZURpc3BsYXlNb2RlID09PSBcIkhpZGRlblwiXG5cdFx0XHRcdD8gdW5kZWZpbmVkXG5cdFx0XHRcdDogY29tcGlsZUV4cHJlc3Npb24oVUlGb3JtYXR0ZXJzLmdldEJpbmRpbmdGb3JVbml0T3JDdXJyZW5jeSh2YWx1ZURhdGFNb2RlbFBhdGggYXMgRGF0YU1vZGVsT2JqZWN0UGF0aCkpO1xuXG5cdFx0cmV0dXJuIHhtbGA8T2JqZWN0TnVtYmVyXG5cdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgdGhpcy5pZFByZWZpeCA/IGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBcIk9iamVjdE51bWJlci1GaWVsZC1kaXNwbGF5XCJdKSA6IHVuZGVmaW5lZCl9XG5cdFx0XHRjb3JlOnJlcXVpcmU9XCJ7RmllbGRSdW50aW1lOiAnc2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFJ1bnRpbWUnfVwiXG5cdFx0XHQke3RoaXMuYXR0cihcInN0YXRlXCIsIGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uKX1cblx0XHRcdCR7dGhpcy5hdHRyKFwibnVtYmVyXCIsIG9iamVjdFN0YXR1c051bWJlcil9XG5cdFx0XHQke3RoaXMuYXR0cihcInVuaXRcIiwgdW5pdCl9XG5cdFx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgdGhpcy52aXNpYmxlKX1cblx0XHRcdGVtcGhhc2l6ZWQ9XCJmYWxzZVwiXG5cdFx0XHQke3RoaXMuYXR0cihcImNsYXNzXCIsIHRoaXMuZm9ybWF0T3B0aW9ucy5kYXRhUG9pbnRTdHlsZSA9PT0gXCJsYXJnZVwiID8gXCJzYXBNT2JqZWN0TnVtYmVyTGFyZ2VcIiA6IHVuZGVmaW5lZCl9XG5cdFx0XHQke3RoaXMuYXR0cihcInRvb2x0aXBcIiwgdGhpcy5nZXRUb29sdGlwVmFsdWUoKSl9XG5cdFx0XHQke3RoaXMuYXR0cihcImVtcHR5SW5kaWNhdG9yTW9kZVwiLCBlbXB0eUluZGljYXRvck1vZGUpfVxuXHRcdC8+YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZm9yIHRoZSBvYmplY3QgbnVtYmVyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIG9iamVjdCBudW1iZXIgdGVtcGxhdGVcblx0ICovXG5cdGdldE9iamVjdE51bWJlclRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IHsgdmFsdWVEYXRhTW9kZWxQYXRoIH0gPSBEYXRhUG9pbnRCbG9jay5nZXRUZW1wbGF0aW5nT2JqZWN0cyh0aGlzKTtcblx0XHRpZiAodGhpcz8uZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPz8gZmFsc2UpIHtcblx0XHRcdHJldHVybiB4bWxgXG5cdFx0XHRcdDxjb250cm9sOkNvbmRpdGlvbmFsV3JhcHBlclxuXHRcdFx0XHRcdHhtbG5zOmNvbnRyb2w9XCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzXCJcblx0XHRcdFx0XHQke3RoaXMuYXR0cihcImNvbmRpdGlvblwiLCBVSUZvcm1hdHRlcnMuaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQodmFsdWVEYXRhTW9kZWxQYXRoIGFzIERhdGFNb2RlbE9iamVjdFBhdGgpKX1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxjb250cm9sOmNvbnRlbnRUcnVlPlxuXHRcdFx0XHRcdFx0JHt0aGlzLmdldE9iamVjdE51bWJlckNvbW1vblRlbXBsYXRlKCl9XG5cdFx0XHRcdFx0PC9jb250cm9sOmNvbnRlbnRUcnVlPlxuXHRcdFx0XHRcdDxjb250cm9sOmNvbnRlbnRGYWxzZT5cblx0XHRcdFx0XHRcdDxPYmplY3ROdW1iZXJcblx0XHRcdFx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgdGhpcy5pZFByZWZpeCA/IGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBcIk9iamVjdE51bWJlci1GaWVsZC1kaXNwbGF5LWRpZmZlcmVudFVuaXRcIl0pIDogdW5kZWZpbmVkKX1cblx0XHRcdFx0XHRcdFx0bnVtYmVyPVwiKlwiXG5cdFx0XHRcdFx0XHRcdHVuaXQ9XCJcIlxuXHRcdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcInZpc2libGVcIiwgdGhpcy52aXNpYmxlKX1cblx0XHRcdFx0XHRcdFx0ZW1waGFzaXplZD1cImZhbHNlXCJcblx0XHRcdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJjbGFzc1wiLCB0aGlzLmZvcm1hdE9wdGlvbnMuZGF0YVBvaW50U3R5bGUgPT09IFwibGFyZ2VcIiA/IFwic2FwTU9iamVjdE51bWJlckxhcmdlXCIgOiB1bmRlZmluZWQpfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8L2NvbnRyb2w6Y29udGVudEZhbHNlPlxuXHRcdFx0XHQ8L2NvbnRyb2w6Q29uZGl0aW9uYWxXcmFwcGVyPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgJHt0aGlzLmdldE9iamVjdE51bWJlckNvbW1vblRlbXBsYXRlKCl9YDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZGVwZW5kZW50IG9yIGFuIGVtcHR5IHN0cmluZy5cblx0ICpcblx0ICogQHJldHVybnMgRGVwZW5kZW50IGVpdGhlciB3aXRoIHRoZSBRdWlja1ZpZXcgb3IgYW4gZW1wdHkgc3RyaW5nLlxuXHQgKi9cblx0cHJpdmF0ZSBnZXRPYmplY3RTdGF0dXNEZXBlbmRlbnRzVGVtcGxhdGUoKSB7XG5cdFx0aWYgKHRoaXMuaGFzUXVpY2tWaWV3KSB7XG5cdFx0XHRyZXR1cm4gYDxkZXBlbmRlbnRzPjxtYWNybzpRdWlja1ZpZXdcblx0XHRcdFx0XHRcdHhtbG5zOm1hY3JvPVwic2FwLmZlLm1hY3Jvc1wiXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQ9XCJ7bWV0YVBhdGg+fVwiXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIntjb250ZXh0UGF0aD59XCJcblx0XHRcdFx0XHQvPjwvZGVwZW5kZW50cz5gO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZm9yIHRoZSBvYmplY3Qgc3RhdHVzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIG9iamVjdCBzdGF0dXMgdGVtcGxhdGVcblx0ICovXG5cdGdldE9iamVjdFN0YXR1c1RlbXBsYXRlKCkge1xuXHRcdGNvbnN0IHsgZGF0YU1vZGVsUGF0aCwgdmFsdWVEYXRhTW9kZWxQYXRoLCBkYXRhUG9pbnRDb252ZXJ0ZWQgfSA9IERhdGFQb2ludEJsb2NrLmdldFRlbXBsYXRpbmdPYmplY3RzKHRoaXMpO1xuXHRcdGxldCBjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5Q29sb3IoZGF0YVBvaW50Q29udmVydGVkLCBkYXRhTW9kZWxQYXRoKTtcblx0XHRpZiAoY3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb24gPT09IFwiTm9uZVwiICYmIHZhbHVlRGF0YU1vZGVsUGF0aCkge1xuXHRcdFx0Y3JpdGljYWxpdHlDb2xvckV4cHJlc3Npb24gPSB0aGlzLmhhc1F1aWNrVmlldyA/IFwiSW5mb3JtYXRpb25cIiA6IFwiTm9uZVwiO1xuXHRcdH1cblxuXHRcdC8vIGlmIHRoZSBzZW1hbnRpY09iamVjdHMgYWxyZWFkeSBjYWxjdWxhdGVkIHRoZSBjcml0aWNhbGl0eSB3ZSBkb24ndCBjYWxjdWxhdGUgaXQgYWdhaW5cblx0XHRjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbiA9IGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uXG5cdFx0XHQ/IGNyaXRpY2FsaXR5Q29sb3JFeHByZXNzaW9uXG5cdFx0XHQ6IGJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5Q29sb3IoZGF0YVBvaW50Q29udmVydGVkLCBkYXRhTW9kZWxQYXRoKTtcblx0XHRjb25zdCBlbXB0eUluZGljYXRvck1vZGUgPSB0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0VtcHR5SW5kaWNhdG9yID8/IGZhbHNlID8gXCJPblwiIDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IG9iamVjdFN0YXR1c1RleHQgPSBidWlsZEZpZWxkQmluZGluZ0V4cHJlc3Npb24oZGF0YU1vZGVsUGF0aCwgdGhpcy5mb3JtYXRPcHRpb25zLCBmYWxzZSk7XG5cdFx0Y29uc3QgaWNvbkV4cHJlc3Npb24gPSBidWlsZEV4cHJlc3Npb25Gb3JDcml0aWNhbGl0eUljb24oZGF0YVBvaW50Q29udmVydGVkLCBkYXRhTW9kZWxQYXRoKTtcblxuXHRcdHJldHVybiB4bWxgPE9iamVjdFN0YXR1c1xuXHRcdFx0XHRcdFx0eG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcImlkXCIsIHRoaXMuaWRQcmVmaXggPyBnZW5lcmF0ZShbdGhpcy5pZFByZWZpeCwgXCJPYmplY3RTdGF0dXMtRmllbGQtZGlzcGxheVwiXSkgOiB1bmRlZmluZWQpfVxuXHRcdFx0XHRcdFx0Y29yZTpyZXF1aXJlPVwieyBGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZScgfVwiXG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcImNsYXNzXCIsIHRoaXMuZm9ybWF0T3B0aW9ucy5kYXRhUG9pbnRTdHlsZSA9PT0gXCJsYXJnZVwiID8gXCJzYXBNT2JqZWN0U3RhdHVzTGFyZ2VcIiA6IHVuZGVmaW5lZCl9XG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcImljb25cIiwgaWNvbkV4cHJlc3Npb24pfVxuXHRcdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJ0b29sdGlwXCIsIHRoaXMuZ2V0VG9vbHRpcFZhbHVlKCkpfVxuXHRcdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJzdGF0ZVwiLCBjcml0aWNhbGl0eUNvbG9yRXhwcmVzc2lvbil9XG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcInRleHRcIiwgb2JqZWN0U3RhdHVzVGV4dCl9XG5cdFx0XHRcdFx0XHQke3RoaXMuYXR0cihcImVtcHR5SW5kaWNhdG9yTW9kZVwiLCBlbXB0eUluZGljYXRvck1vZGUpfVxuXHRcdFx0XHRcdFx0JHt0aGlzLmF0dHIoXCJhY3RpdmVcIiwgdGhpcy5oYXNRdWlja1ZpZXcpfVxuXHRcdFx0XHRcdFx0cHJlc3M9XCJGaWVsZFJ1bnRpbWUucHJlc3NMaW5rXCJcblx0XHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiYXJpYUxhYmVsbGVkQnlcIiwgdGhpcy5hcmlhTGFiZWxsZWRCeSAhPT0gbnVsbCA/IHRoaXMuYXJpYUxhYmVsbGVkQnkgOiB1bmRlZmluZWQpfVxuXHRcdFx0XHQ+JHt0aGlzLmdldE9iamVjdFN0YXR1c0RlcGVuZGVudHNUZW1wbGF0ZSgpfVxuXHRcdFx0XHQ8L09iamVjdFN0YXR1cz5gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBoZWxwZXIgbWV0aG9kIHRvIGdldCBhIHBvc3NpYmxlIHRvb2x0aXAgdGV4dC5cblx0ICpcblx0ICogQHJldHVybnMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldFRvb2x0aXBWYWx1ZSgpIHtcblx0XHRjb25zdCB7IGRhdGFNb2RlbFBhdGgsIGRhdGFQb2ludENvbnZlcnRlZCB9ID0gRGF0YVBvaW50QmxvY2suZ2V0VGVtcGxhdGluZ09iamVjdHModGhpcyk7XG5cdFx0cmV0dXJuIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhUG9pbnRDb252ZXJ0ZWQ/LmFubm90YXRpb25zPy5Db21tb24/LlF1aWNrSW5mbz8udmFsdWVPZigpLCBnZXRSZWxhdGl2ZVBhdGhzKGRhdGFNb2RlbFBhdGgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaGVscGVyIG1ldGhvZCB0byBnZXQgYSBwb3NzaWJsZSB0YXJnZXQgdmFsdWUgYmluZGluZy5cblx0ICpcblx0ICogQHJldHVybnMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldFRhcmdldFZhbHVlQmluZGluZygpIHtcblx0XHRjb25zdCB7IGRhdGFNb2RlbFBhdGgsIGRhdGFQb2ludENvbnZlcnRlZCB9ID0gRGF0YVBvaW50QmxvY2suZ2V0VGVtcGxhdGluZ09iamVjdHModGhpcyk7XG5cdFx0cmV0dXJuIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhUG9pbnRDb252ZXJ0ZWQuVGFyZ2V0VmFsdWUsIGdldFJlbGF0aXZlUGF0aHMoZGF0YU1vZGVsUGF0aCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRzd2l0Y2ggKHRoaXMudmlzdWFsaXphdGlvbikge1xuXHRcdFx0Y2FzZSBcIlJhdGluZ1wiOiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFJhdGluZ0luZGljYXRvclRlbXBsYXRlKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFwiUHJvZ3Jlc3NcIjoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRQcm9ncmVzc0luZGljYXRvclRlbXBsYXRlKCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFwiT2JqZWN0TnVtYmVyXCI6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0T2JqZWN0TnVtYmVyVGVtcGxhdGUoKTtcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0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