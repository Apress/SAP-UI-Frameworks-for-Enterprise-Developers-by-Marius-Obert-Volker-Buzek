/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/filter/FilterFieldHelper", "sap/fe/macros/filter/FilterFieldTemplating"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter, BindingToolkit, StableIdHelper, DataModelPathHelper, PropertyFormatters, CommonHelper, FieldHelper, FilterFieldHelper, FilterFieldTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getFilterFieldDisplayFormat = FilterFieldTemplating.getFilterFieldDisplayFormat;
  var maxConditions = FilterFieldHelper.maxConditions;
  var isRequiredInFilter = FilterFieldHelper.isRequiredInFilter;
  var getPlaceholder = FilterFieldHelper.getPlaceholder;
  var getDataType = FilterFieldHelper.getDataType;
  var getConditionsBinding = FilterFieldHelper.getConditionsBinding;
  var formatOptions = FilterFieldHelper.formatOptions;
  var constraints = FilterFieldHelper.constraints;
  var getRelativePropertyPath = PropertyFormatters.getRelativePropertyPath;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var generate = StableIdHelper.generate;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var xml = BuildingBlockTemplateProcessor.xml;
  var SAP_UI_MODEL_CONTEXT = BuildingBlockTemplateProcessor.SAP_UI_MODEL_CONTEXT;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FilterFieldBlock = (
  /**
   * Building block for creating a Filter Field based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a property context(property) pointing to an entity type property
   * needed to be used as filterfield and entityType context(contextPath) to consider the relativity of
   * the propertyPath of the property wrt entityType.
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterField id="MyFilterField" property="CompanyName" /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "FilterField",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FilterFieldBlock, _BuildingBlockBase);
    /**
     * Defines the metadata path to the property.
     */

    /**
     * Metadata path to the entitySet or navigationProperty
     */

    /**
     * Visual filter settings for filter field.
     */

    /**
     * A prefix that is added to the generated ID of the filter field.
     */

    /**
     * A prefix that is added to the generated ID of the value help used for the filter field.
     */

    /**
     * Specifies the Sematic Date Range option for the filter field.
     */

    /**
     * Settings from the manifest settings.
     */

    function FilterFieldBlock(props, configuration, settings) {
      var _propertyConverted$an, _propertyConverted$an2, _propertyConverted$an3, _propertyConverted$an4;
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, settings) || this;
      _initializerDefineProperty(_this, "property", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visualFilter", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "idPrefix", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "settings", _descriptor7, _assertThisInitialized(_this));
      const propertyConverted = MetaModelConverter.convertMetaModelContext(_this.property);
      const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.property, _this.contextPath);

      // Property settings
      const propertyName = propertyConverted.name,
        fixedValues = !!((_propertyConverted$an = propertyConverted.annotations) !== null && _propertyConverted$an !== void 0 && (_propertyConverted$an2 = _propertyConverted$an.Common) !== null && _propertyConverted$an2 !== void 0 && _propertyConverted$an2.ValueListWithFixedValues);
      _this.controlId = _this.idPrefix && generate([_this.idPrefix, propertyName]);
      _this.sourcePath = getTargetObjectPath(dataModelPath);
      _this.dataType = getDataType(propertyConverted);
      const labelTerm = (propertyConverted === null || propertyConverted === void 0 ? void 0 : (_propertyConverted$an3 = propertyConverted.annotations) === null || _propertyConverted$an3 === void 0 ? void 0 : (_propertyConverted$an4 = _propertyConverted$an3.Common) === null || _propertyConverted$an4 === void 0 ? void 0 : _propertyConverted$an4.Label) || propertyName;
      const labelExpression = getExpressionFromAnnotation(labelTerm);
      _this.label = compileExpression(labelExpression) || propertyName;
      _this.conditionsBinding = getConditionsBinding(dataModelPath) || "";
      _this.placeholder = getPlaceholder(propertyConverted);
      // Visual Filter settings
      _this.vfEnabled = !!_this.visualFilter && !(_this.idPrefix && _this.idPrefix.indexOf("Adaptation") > -1);
      _this.vfId = _this.vfEnabled ? generate([_this.idPrefix, propertyName, "VisualFilter"]) : undefined;

      //-----------------------------------------------------------------------------------------------------//
      // TODO: need to change operations from MetaModel to Converters.
      // This mainly included changing changing getFilterRestrictions operations from metaModel to converters
      const propertyContext = _this.property,
        model = propertyContext.getModel(),
        vhPropertyPath = FieldHelper.valueHelpPropertyForFilterField(propertyContext),
        filterable = CommonHelper.isPropertyFilterable(propertyContext),
        propertyObject = propertyContext.getObject(),
        propertyInterface = {
          context: propertyContext
        };
      _this.display = getFilterFieldDisplayFormat(dataModelPath, propertyConverted, propertyInterface);
      _this.isFilterable = !(filterable === false || filterable === "false");
      _this.maxConditions = maxConditions(propertyObject, propertyInterface);
      _this.dataTypeConstraints = constraints(propertyObject, propertyInterface);
      _this.dataTypeFormatOptions = formatOptions(propertyObject, propertyInterface);
      _this.required = isRequiredInFilter(propertyObject, propertyInterface);
      _this.operators = FieldHelper.operators(propertyContext, propertyObject, _this.useSemanticDateRange, _this.settings || "", _this.contextPath.getPath());

      // Value Help settings
      // TODO: This needs to be updated when VH macro is converted to 2.0
      const vhProperty = model.createBindingContext(vhPropertyPath);
      const vhPropertyObject = vhProperty.getObject(),
        vhPropertyInterface = {
          context: vhProperty
        },
        relativeVhPropertyPath = getRelativePropertyPath(vhPropertyObject, vhPropertyInterface),
        relativePropertyPath = getRelativePropertyPath(propertyObject, propertyInterface);
      _this.fieldHelpProperty = FieldHelper.getFieldHelpPropertyForFilterField(propertyContext, propertyObject, propertyObject.$Type, _this.vhIdPrefix, relativePropertyPath, relativeVhPropertyPath, fixedValues, _this.useSemanticDateRange);

      //-----------------------------------------------------------------------------------------------------//
      return _this;
    }
    _exports = FilterFieldBlock;
    var _proto = FilterFieldBlock.prototype;
    _proto.getVisualFilterContent = function getVisualFilterContent() {
      var _visualFilterObject, _visualFilterObject$i;
      let visualFilterObject = this.visualFilter,
        vfXML = xml``;
      if (!this.vfEnabled || !visualFilterObject) {
        return vfXML;
      }
      if ((_visualFilterObject = visualFilterObject) !== null && _visualFilterObject !== void 0 && (_visualFilterObject$i = _visualFilterObject.isA) !== null && _visualFilterObject$i !== void 0 && _visualFilterObject$i.call(_visualFilterObject, SAP_UI_MODEL_CONTEXT)) {
        visualFilterObject = visualFilterObject.getObject();
      }
      const {
        contextPath,
        presentationAnnotation,
        outParameter,
        inParameters,
        valuelistProperty,
        selectionVariantAnnotation,
        multipleSelectionAllowed,
        required,
        requiredProperties = [],
        showOverlayInitially,
        renderLineChart,
        isValueListWithFixedValues
      } = visualFilterObject;
      vfXML = xml`
				<macro:VisualFilter
					id="${this.vfId}"
					contextPath="${contextPath}"
					metaPath="${presentationAnnotation}"
					outParameter="${outParameter}"
					inParameters="${inParameters}"
					valuelistProperty="${valuelistProperty}"
					selectionVariantAnnotation="${selectionVariantAnnotation}"
					multipleSelectionAllowed="${multipleSelectionAllowed}"
					required="${required}"
					requiredProperties="${CommonHelper.stringifyCustomData(requiredProperties)}"
					showOverlayInitially="${showOverlayInitially}"
					renderLineChart="${renderLineChart}"
					isValueListWithFixedValues="${isValueListWithFixedValues}"
					filterBarEntityType="${contextPath}"
				/>
			`;
      return vfXML;
    };
    _proto.getTemplate = async function getTemplate() {
      let xmlRet = ``;
      if (this.isFilterable) {
        let display;
        try {
          display = await this.display;
        } catch (err) {
          Log.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${err}`);
        }
        xmlRet = xml`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:macro="sap.fe.macros"
					xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					unittest:id="UnitTest::FilterField"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${display}"
					maxConditions="${this.maxConditions}"
					fieldHelp="${this.fieldHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"

				>
					${this.vfEnabled ? this.getVisualFilterContent() : xml``}
				</mdc:FilterField>
			`;
      }
      return xmlRet;
    };
    return FilterFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "visualFilter", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FilterField";
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FilterFieldValueHelp";
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "settings", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = FilterFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJGaWVsZEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImlzUHVibGljIiwicHJvcHMiLCJjb25maWd1cmF0aW9uIiwic2V0dGluZ3MiLCJwcm9wZXJ0eUNvbnZlcnRlZCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwicHJvcGVydHkiLCJkYXRhTW9kZWxQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJwcm9wZXJ0eU5hbWUiLCJmaXhlZFZhbHVlcyIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiY29udHJvbElkIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsInNvdXJjZVBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwiZGF0YVR5cGUiLCJnZXREYXRhVHlwZSIsImxhYmVsVGVybSIsIkxhYmVsIiwibGFiZWxFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwibGFiZWwiLCJjb21waWxlRXhwcmVzc2lvbiIsImNvbmRpdGlvbnNCaW5kaW5nIiwiZ2V0Q29uZGl0aW9uc0JpbmRpbmciLCJwbGFjZWhvbGRlciIsImdldFBsYWNlaG9sZGVyIiwidmZFbmFibGVkIiwidmlzdWFsRmlsdGVyIiwiaW5kZXhPZiIsInZmSWQiLCJ1bmRlZmluZWQiLCJwcm9wZXJ0eUNvbnRleHQiLCJtb2RlbCIsImdldE1vZGVsIiwidmhQcm9wZXJ0eVBhdGgiLCJGaWVsZEhlbHBlciIsInZhbHVlSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQiLCJmaWx0ZXJhYmxlIiwiQ29tbW9uSGVscGVyIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJwcm9wZXJ0eU9iamVjdCIsImdldE9iamVjdCIsInByb3BlcnR5SW50ZXJmYWNlIiwiY29udGV4dCIsImRpc3BsYXkiLCJnZXRGaWx0ZXJGaWVsZERpc3BsYXlGb3JtYXQiLCJpc0ZpbHRlcmFibGUiLCJtYXhDb25kaXRpb25zIiwiZGF0YVR5cGVDb25zdHJhaW50cyIsImNvbnN0cmFpbnRzIiwiZGF0YVR5cGVGb3JtYXRPcHRpb25zIiwiZm9ybWF0T3B0aW9ucyIsImlzUmVxdWlyZWRJbkZpbHRlciIsIm9wZXJhdG9ycyIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwiZ2V0UGF0aCIsInZoUHJvcGVydHkiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInZoUHJvcGVydHlPYmplY3QiLCJ2aFByb3BlcnR5SW50ZXJmYWNlIiwicmVsYXRpdmVWaFByb3BlcnR5UGF0aCIsImdldFJlbGF0aXZlUHJvcGVydHlQYXRoIiwicmVsYXRpdmVQcm9wZXJ0eVBhdGgiLCJmaWVsZEhlbHBQcm9wZXJ0eSIsImdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQiLCIkVHlwZSIsInZoSWRQcmVmaXgiLCJnZXRWaXN1YWxGaWx0ZXJDb250ZW50IiwidmlzdWFsRmlsdGVyT2JqZWN0IiwidmZYTUwiLCJ4bWwiLCJpc0EiLCJTQVBfVUlfTU9ERUxfQ09OVEVYVCIsInByZXNlbnRhdGlvbkFubm90YXRpb24iLCJvdXRQYXJhbWV0ZXIiLCJpblBhcmFtZXRlcnMiLCJ2YWx1ZWxpc3RQcm9wZXJ0eSIsInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uIiwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwicmVxdWlyZWRQcm9wZXJ0aWVzIiwic2hvd092ZXJsYXlJbml0aWFsbHkiLCJyZW5kZXJMaW5lQ2hhcnQiLCJpc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsInN0cmluZ2lmeUN1c3RvbURhdGEiLCJnZXRUZW1wbGF0ZSIsInhtbFJldCIsImVyciIsIkxvZyIsImVycm9yIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckZpZWxkLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IFNBUF9VSV9NT0RFTF9DT05URVhULCB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSB7IFZpc3VhbEZpbHRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L1Zpc3VhbEZpbHRlcnNcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRSZWxhdGl2ZVByb3BlcnR5UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBDb21wdXRlZEFubm90YXRpb25JbnRlcmZhY2UsIE1ldGFNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGNvbnN0cmFpbnRzLFxuXHRmb3JtYXRPcHRpb25zLFxuXHRnZXRDb25kaXRpb25zQmluZGluZyxcblx0Z2V0RGF0YVR5cGUsXG5cdGdldFBsYWNlaG9sZGVyLFxuXHRpc1JlcXVpcmVkSW5GaWx0ZXIsXG5cdG1heENvbmRpdGlvbnNcbn0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlckZpZWxkSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGaWx0ZXJGaWVsZERpc3BsYXlGb3JtYXQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTWV0YU1vZGVsXCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyIEZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIEl0IGlzIGRlc2lnbmVkIHRvIHdvcmsgYmFzZWQgb24gYSBwcm9wZXJ0eSBjb250ZXh0KHByb3BlcnR5KSBwb2ludGluZyB0byBhbiBlbnRpdHkgdHlwZSBwcm9wZXJ0eVxuICogbmVlZGVkIHRvIGJlIHVzZWQgYXMgZmlsdGVyZmllbGQgYW5kIGVudGl0eVR5cGUgY29udGV4dChjb250ZXh0UGF0aCkgdG8gY29uc2lkZXIgdGhlIHJlbGF0aXZpdHkgb2ZcbiAqIHRoZSBwcm9wZXJ0eVBhdGggb2YgdGhlIHByb3BlcnR5IHdydCBlbnRpdHlUeXBlLlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpbHRlckZpZWxkIGlkPVwiTXlGaWx0ZXJGaWVsZFwiIHByb3BlcnR5PVwiQ29tcGFueU5hbWVcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQHByaXZhdGVcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpbHRlckZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWx0ZXJGaWVsZEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbWV0YWRhdGEgcGF0aCB0byB0aGUgcHJvcGVydHkuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRwcm9wZXJ0eSE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eVNldCBvciBuYXZpZ2F0aW9uUHJvcGVydHlcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogVmlzdWFsIGZpbHRlciBzZXR0aW5ncyBmb3IgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0dmlzdWFsRmlsdGVyPzogQ29udGV4dCB8IFZpc3VhbEZpbHRlcnM7XG5cblx0LyoqXG5cdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGlkUHJlZml4OiBzdHJpbmcgPSBcIkZpbHRlckZpZWxkXCI7XG5cblx0LyoqXG5cdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscCB1c2VkIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHZoSWRQcmVmaXg6IHN0cmluZyA9IFwiRmlsdGVyRmllbGRWYWx1ZUhlbHBcIjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogYm9vbGVhbiA9IHRydWU7XG5cblx0LyoqXG5cdCAqIFNldHRpbmdzIGZyb20gdGhlIG1hbmlmZXN0IHNldHRpbmdzLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHNldHRpbmdzOiBzdHJpbmcgPSBcIlwiO1xuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiAgICAgICAgICAgIElOVEVSTkFMIEFUVFJJQlVURVMgICAgICAgICAgICAgICpcblx0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblx0LyoqXG5cdCAqIENvbnRyb2wgSWQgZm9yIE1EQyBmaWx0ZXIgZmllbGQgdXNlZCBpbnNpZGUuXG5cdCAqL1xuXHRjb250cm9sSWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNvdXJjZSBhbm5vdGF0aW9uIHBhdGggb2YgdGhlIHByb3BlcnR5LlxuXHQgKi9cblx0c291cmNlUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTGFiZWwgZm9yIGZpbHRlcmZpZWxkLlxuXHQgKi9cblx0bGFiZWwhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERhdGEgVHlwZSBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0ZGF0YVR5cGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1heGltdW0gY29uZGl0aW9ucyB0aGF0IGNhbiBiZSBhZGRlZCB0byB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0bWF4Q29uZGl0aW9ucyE6IG51bWJlcjtcblxuXHQvKipcblx0ICogRmllbGQgSGVscCBpZCBhcyBhc3NvY2lhdGlvbiBmb3IgdGhlIGZpbHRlciBmaWVsZC5cblx0ICovXG5cdGZpZWxkSGVscFByb3BlcnR5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBCaW5kaW5nIHBhdGggZm9yIGNvbmRpdGlvbnMgYWRkZWQgdG8gZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0Y29uZGl0aW9uc0JpbmRpbmchOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERhdGF0eXBlIGNvbnN0cmFpbnRzIG9mIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRkYXRhVHlwZUNvbnN0cmFpbnRzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEYXRhdHlwZSBmb3JtYXQgb3B0aW9ucyBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0ZGF0YVR5cGVGb3JtYXRPcHRpb25zPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUbyBzcGVjaWZ5IGZpbHRlciBmaWVsZCBpcyBtYW5kYXRvcnkgZm9yIGZpbHRlcmluZy5cblx0ICovXG5cdHJlcXVpcmVkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBWYWxpZCBvcGVyYXRvcnMgZm9yIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRvcGVyYXRvcnM/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFZpc3VhbCBGaWx0ZXIgaWQgdG8gYmUgdXNlZC5cblx0ICovXG5cdHZmSWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFZpc3VhbCBGaWx0ZXIgaXMgZXhwZWN0ZWQuXG5cdCAqL1xuXHR2ZkVuYWJsZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSB1c2VkIGlzIGZpbHRlcmFibGVcblx0ICovXG5cdGlzRmlsdGVyYWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IGZvciBwbGFjZWhvbGRlclxuXHQgKi9cblx0cGxhY2Vob2xkZXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IHRvIGhvbGQgcHJvbWlzZSBmb3IgZGlzcGxheVxuXHQgKi9cblx0ZGlzcGxheT86IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPjtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZpbHRlckZpZWxkQmxvY2s+LCBjb25maWd1cmF0aW9uOiBhbnksIHNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcywgY29uZmlndXJhdGlvbiwgc2V0dGluZ3MpO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlDb252ZXJ0ZWQgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuY29udmVydE1ldGFNb2RlbENvbnRleHQodGhpcy5wcm9wZXJ0eSkgYXMgUHJvcGVydHk7XG5cdFx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5wcm9wZXJ0eSwgdGhpcy5jb250ZXh0UGF0aCk7XG5cblx0XHQvLyBQcm9wZXJ0eSBzZXR0aW5nc1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHByb3BlcnR5Q29udmVydGVkLm5hbWUsXG5cdFx0XHRmaXhlZFZhbHVlcyA9ICEhcHJvcGVydHlDb252ZXJ0ZWQuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzO1xuXG5cdFx0dGhpcy5jb250cm9sSWQgPSB0aGlzLmlkUHJlZml4ICYmIGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBwcm9wZXJ0eU5hbWVdKTtcblx0XHR0aGlzLnNvdXJjZVBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFBhdGgpO1xuXHRcdHRoaXMuZGF0YVR5cGUgPSBnZXREYXRhVHlwZShwcm9wZXJ0eUNvbnZlcnRlZCk7XG5cdFx0Y29uc3QgbGFiZWxUZXJtID0gcHJvcGVydHlDb252ZXJ0ZWQ/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsIHx8IHByb3BlcnR5TmFtZTtcblx0XHRjb25zdCBsYWJlbEV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24obGFiZWxUZXJtKTtcblx0XHR0aGlzLmxhYmVsID0gY29tcGlsZUV4cHJlc3Npb24obGFiZWxFeHByZXNzaW9uKSB8fCBwcm9wZXJ0eU5hbWU7XG5cdFx0dGhpcy5jb25kaXRpb25zQmluZGluZyA9IGdldENvbmRpdGlvbnNCaW5kaW5nKGRhdGFNb2RlbFBhdGgpIHx8IFwiXCI7XG5cdFx0dGhpcy5wbGFjZWhvbGRlciA9IGdldFBsYWNlaG9sZGVyKHByb3BlcnR5Q29udmVydGVkKTtcblx0XHQvLyBWaXN1YWwgRmlsdGVyIHNldHRpbmdzXG5cdFx0dGhpcy52ZkVuYWJsZWQgPSAhIXRoaXMudmlzdWFsRmlsdGVyICYmICEodGhpcy5pZFByZWZpeCAmJiB0aGlzLmlkUHJlZml4LmluZGV4T2YoXCJBZGFwdGF0aW9uXCIpID4gLTEpO1xuXHRcdHRoaXMudmZJZCA9IHRoaXMudmZFbmFibGVkID8gZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIHByb3BlcnR5TmFtZSwgXCJWaXN1YWxGaWx0ZXJcIl0pIDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cdFx0Ly8gVE9ETzogbmVlZCB0byBjaGFuZ2Ugb3BlcmF0aW9ucyBmcm9tIE1ldGFNb2RlbCB0byBDb252ZXJ0ZXJzLlxuXHRcdC8vIFRoaXMgbWFpbmx5IGluY2x1ZGVkIGNoYW5naW5nIGNoYW5naW5nIGdldEZpbHRlclJlc3RyaWN0aW9ucyBvcGVyYXRpb25zIGZyb20gbWV0YU1vZGVsIHRvIGNvbnZlcnRlcnNcblx0XHRjb25zdCBwcm9wZXJ0eUNvbnRleHQgPSB0aGlzLnByb3BlcnR5LFxuXHRcdFx0bW9kZWw6IE1ldGFNb2RlbCA9IHByb3BlcnR5Q29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0dmhQcm9wZXJ0eVBhdGg6IHN0cmluZyA9IEZpZWxkSGVscGVyLnZhbHVlSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQocHJvcGVydHlDb250ZXh0KSxcblx0XHRcdGZpbHRlcmFibGUgPSBDb21tb25IZWxwZXIuaXNQcm9wZXJ0eUZpbHRlcmFibGUocHJvcGVydHlDb250ZXh0KSxcblx0XHRcdHByb3BlcnR5T2JqZWN0ID0gcHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0cHJvcGVydHlJbnRlcmZhY2UgPSB7IGNvbnRleHQ6IHByb3BlcnR5Q29udGV4dCB9IGFzIENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZTtcblxuXHRcdHRoaXMuZGlzcGxheSA9IGdldEZpbHRlckZpZWxkRGlzcGxheUZvcm1hdChkYXRhTW9kZWxQYXRoLCBwcm9wZXJ0eUNvbnZlcnRlZCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMuaXNGaWx0ZXJhYmxlID0gIShmaWx0ZXJhYmxlID09PSBmYWxzZSB8fCBmaWx0ZXJhYmxlID09PSBcImZhbHNlXCIpO1xuXHRcdHRoaXMubWF4Q29uZGl0aW9ucyA9IG1heENvbmRpdGlvbnMocHJvcGVydHlPYmplY3QsIHByb3BlcnR5SW50ZXJmYWNlKTtcblx0XHR0aGlzLmRhdGFUeXBlQ29uc3RyYWludHMgPSBjb25zdHJhaW50cyhwcm9wZXJ0eU9iamVjdCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMuZGF0YVR5cGVGb3JtYXRPcHRpb25zID0gZm9ybWF0T3B0aW9ucyhwcm9wZXJ0eU9iamVjdCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMucmVxdWlyZWQgPSBpc1JlcXVpcmVkSW5GaWx0ZXIocHJvcGVydHlPYmplY3QsIHByb3BlcnR5SW50ZXJmYWNlKTtcblx0XHR0aGlzLm9wZXJhdG9ycyA9IEZpZWxkSGVscGVyLm9wZXJhdG9ycyhcblx0XHRcdHByb3BlcnR5Q29udGV4dCxcblx0XHRcdHByb3BlcnR5T2JqZWN0LFxuXHRcdFx0dGhpcy51c2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdHRoaXMuc2V0dGluZ3MgfHwgXCJcIixcblx0XHRcdHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpXG5cdFx0KTtcblxuXHRcdC8vIFZhbHVlIEhlbHAgc2V0dGluZ3Ncblx0XHQvLyBUT0RPOiBUaGlzIG5lZWRzIHRvIGJlIHVwZGF0ZWQgd2hlbiBWSCBtYWNybyBpcyBjb252ZXJ0ZWQgdG8gMi4wXG5cdFx0Y29uc3QgdmhQcm9wZXJ0eSA9IG1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHZoUHJvcGVydHlQYXRoKSBhcyBDb250ZXh0O1xuXHRcdGNvbnN0IHZoUHJvcGVydHlPYmplY3QgPSB2aFByb3BlcnR5LmdldE9iamVjdCgpIGFzIE1ldGFNb2RlbENvbnRleHQsXG5cdFx0XHR2aFByb3BlcnR5SW50ZXJmYWNlID0geyBjb250ZXh0OiB2aFByb3BlcnR5IH0sXG5cdFx0XHRyZWxhdGl2ZVZoUHJvcGVydHlQYXRoID0gZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgodmhQcm9wZXJ0eU9iamVjdCwgdmhQcm9wZXJ0eUludGVyZmFjZSksXG5cdFx0XHRyZWxhdGl2ZVByb3BlcnR5UGF0aCA9IGdldFJlbGF0aXZlUHJvcGVydHlQYXRoKHByb3BlcnR5T2JqZWN0LCBwcm9wZXJ0eUludGVyZmFjZSk7XG5cdFx0dGhpcy5maWVsZEhlbHBQcm9wZXJ0eSA9IEZpZWxkSGVscGVyLmdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQoXG5cdFx0XHRwcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRwcm9wZXJ0eU9iamVjdCxcblx0XHRcdHByb3BlcnR5T2JqZWN0LiRUeXBlLFxuXHRcdFx0dGhpcy52aElkUHJlZml4LFxuXHRcdFx0cmVsYXRpdmVQcm9wZXJ0eVBhdGgsXG5cdFx0XHRyZWxhdGl2ZVZoUHJvcGVydHlQYXRoLFxuXHRcdFx0Zml4ZWRWYWx1ZXMsXG5cdFx0XHR0aGlzLnVzZVNlbWFudGljRGF0ZVJhbmdlXG5cdFx0KTtcblxuXHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXHR9XG5cblx0Z2V0VmlzdWFsRmlsdGVyQ29udGVudCgpIHtcblx0XHRsZXQgdmlzdWFsRmlsdGVyT2JqZWN0ID0gdGhpcy52aXN1YWxGaWx0ZXIsXG5cdFx0XHR2ZlhNTCA9IHhtbGBgO1xuXHRcdGlmICghdGhpcy52ZkVuYWJsZWQgfHwgIXZpc3VhbEZpbHRlck9iamVjdCkge1xuXHRcdFx0cmV0dXJuIHZmWE1MO1xuXHRcdH1cblx0XHRpZiAoKHZpc3VhbEZpbHRlck9iamVjdCBhcyBDb250ZXh0KT8uaXNBPy4oU0FQX1VJX01PREVMX0NPTlRFWFQpKSB7XG5cdFx0XHR2aXN1YWxGaWx0ZXJPYmplY3QgPSAodmlzdWFsRmlsdGVyT2JqZWN0IGFzIENvbnRleHQpLmdldE9iamVjdCgpIGFzIFZpc3VhbEZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0Y29uc3Qge1xuXHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRwcmVzZW50YXRpb25Bbm5vdGF0aW9uLFxuXHRcdFx0b3V0UGFyYW1ldGVyLFxuXHRcdFx0aW5QYXJhbWV0ZXJzLFxuXHRcdFx0dmFsdWVsaXN0UHJvcGVydHksXG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdG11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZCxcblx0XHRcdHJlcXVpcmVkLFxuXHRcdFx0cmVxdWlyZWRQcm9wZXJ0aWVzID0gW10sXG5cdFx0XHRzaG93T3ZlcmxheUluaXRpYWxseSxcblx0XHRcdHJlbmRlckxpbmVDaGFydCxcblx0XHRcdGlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXG5cdFx0fSA9IHZpc3VhbEZpbHRlck9iamVjdCBhcyBWaXN1YWxGaWx0ZXJzO1xuXHRcdHZmWE1MID0geG1sYFxuXHRcdFx0XHQ8bWFjcm86VmlzdWFsRmlsdGVyXG5cdFx0XHRcdFx0aWQ9XCIke3RoaXMudmZJZH1cIlxuXHRcdFx0XHRcdGNvbnRleHRQYXRoPVwiJHtjb250ZXh0UGF0aH1cIlxuXHRcdFx0XHRcdG1ldGFQYXRoPVwiJHtwcmVzZW50YXRpb25Bbm5vdGF0aW9ufVwiXG5cdFx0XHRcdFx0b3V0UGFyYW1ldGVyPVwiJHtvdXRQYXJhbWV0ZXJ9XCJcblx0XHRcdFx0XHRpblBhcmFtZXRlcnM9XCIke2luUGFyYW1ldGVyc31cIlxuXHRcdFx0XHRcdHZhbHVlbGlzdFByb3BlcnR5PVwiJHt2YWx1ZWxpc3RQcm9wZXJ0eX1cIlxuXHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uPVwiJHtzZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbn1cIlxuXHRcdFx0XHRcdG11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZD1cIiR7bXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkfVwiXG5cdFx0XHRcdFx0cmVxdWlyZWQ9XCIke3JlcXVpcmVkfVwiXG5cdFx0XHRcdFx0cmVxdWlyZWRQcm9wZXJ0aWVzPVwiJHtDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YShyZXF1aXJlZFByb3BlcnRpZXMpfVwiXG5cdFx0XHRcdFx0c2hvd092ZXJsYXlJbml0aWFsbHk9XCIke3Nob3dPdmVybGF5SW5pdGlhbGx5fVwiXG5cdFx0XHRcdFx0cmVuZGVyTGluZUNoYXJ0PVwiJHtyZW5kZXJMaW5lQ2hhcnR9XCJcblx0XHRcdFx0XHRpc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcz1cIiR7aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXN9XCJcblx0XHRcdFx0XHRmaWx0ZXJCYXJFbnRpdHlUeXBlPVwiJHtjb250ZXh0UGF0aH1cIlxuXHRcdFx0XHQvPlxuXHRcdFx0YDtcblxuXHRcdHJldHVybiB2ZlhNTDtcblx0fVxuXG5cdGFzeW5jIGdldFRlbXBsYXRlKCkge1xuXHRcdGxldCB4bWxSZXQgPSBgYDtcblx0XHRpZiAodGhpcy5pc0ZpbHRlcmFibGUpIHtcblx0XHRcdGxldCBkaXNwbGF5O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZGlzcGxheSA9IGF3YWl0IHRoaXMuZGlzcGxheTtcblx0XHRcdH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuXHRcdFx0XHRMb2cuZXJyb3IoYEZFIDogRmlsdGVyRmllbGQgQnVpbGRpbmdCbG9jayA6IEVycm9yIGZldGNoaW5nIGRpc3BsYXkgcHJvcGVydHkgZm9yICR7dGhpcy5zb3VyY2VQYXRofSA6ICR7ZXJyfWApO1xuXHRcdFx0fVxuXG5cdFx0XHR4bWxSZXQgPSB4bWxgXG5cdFx0XHRcdDxtZGM6RmlsdGVyRmllbGRcblx0XHRcdFx0XHR4bWxuczptZGM9XCJzYXAudWkubWRjXCJcblx0XHRcdFx0XHR4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3NcIlxuXHRcdFx0XHRcdHhtbG5zOnVuaXR0ZXN0PVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvcHJlcHJvY2Vzc29yZXh0ZW5zaW9uL3NhcC5mZS51bml0dGVzdGluZy8xXCJcblx0XHRcdFx0XHR4bWxuczpjdXN0b21EYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHRcdFx0dW5pdHRlc3Q6aWQ9XCJVbml0VGVzdDo6RmlsdGVyRmllbGRcIlxuXHRcdFx0XHRcdGN1c3RvbURhdGE6c291cmNlUGF0aD1cIiR7dGhpcy5zb3VyY2VQYXRofVwiXG5cdFx0XHRcdFx0aWQ9XCIke3RoaXMuY29udHJvbElkfVwiXG5cdFx0XHRcdFx0ZGVsZWdhdGU9XCJ7bmFtZTogJ3NhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRCYXNlRGVsZWdhdGUnLCBwYXlsb2FkOntpc0ZpbHRlckZpZWxkOnRydWV9fVwiXG5cdFx0XHRcdFx0bGFiZWw9XCIke3RoaXMubGFiZWx9XCJcblx0XHRcdFx0XHRkYXRhVHlwZT1cIiR7dGhpcy5kYXRhVHlwZX1cIlxuXHRcdFx0XHRcdGRpc3BsYXk9XCIke2Rpc3BsYXl9XCJcblx0XHRcdFx0XHRtYXhDb25kaXRpb25zPVwiJHt0aGlzLm1heENvbmRpdGlvbnN9XCJcblx0XHRcdFx0XHRmaWVsZEhlbHA9XCIke3RoaXMuZmllbGRIZWxwUHJvcGVydHl9XCJcblx0XHRcdFx0XHRjb25kaXRpb25zPVwiJHt0aGlzLmNvbmRpdGlvbnNCaW5kaW5nfVwiXG5cdFx0XHRcdFx0ZGF0YVR5cGVDb25zdHJhaW50cz1cIiR7dGhpcy5kYXRhVHlwZUNvbnN0cmFpbnRzfVwiXG5cdFx0XHRcdFx0ZGF0YVR5cGVGb3JtYXRPcHRpb25zPVwiJHt0aGlzLmRhdGFUeXBlRm9ybWF0T3B0aW9uc31cIlxuXHRcdFx0XHRcdHJlcXVpcmVkPVwiJHt0aGlzLnJlcXVpcmVkfVwiXG5cdFx0XHRcdFx0b3BlcmF0b3JzPVwiJHt0aGlzLm9wZXJhdG9yc31cIlxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyPVwiJHt0aGlzLnBsYWNlaG9sZGVyfVwiXG5cblx0XHRcdFx0PlxuXHRcdFx0XHRcdCR7dGhpcy52ZkVuYWJsZWQgPyB0aGlzLmdldFZpc3VhbEZpbHRlckNvbnRlbnQoKSA6IHhtbGBgfVxuXHRcdFx0XHQ8L21kYzpGaWx0ZXJGaWVsZD5cblx0XHRcdGA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHhtbFJldDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQThDcUJBLGdCQUFnQjtFQWxCckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLE9BY0NDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsYUFBYTtJQUNuQkMsU0FBUyxFQUFFO0VBQ1osQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkUsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkRSxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQ2RFLFFBQVEs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