/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/templating/DataModelPathHelper"], function (BuildingBlockBase, BuildingBlockSupport, Form, MetaModelConverter, DataModelPathHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var _exports = {};
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var createFormDefinition = Form.createFormDefinition;
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
  let FormContainerBlock = (
  /**
   * Building block for creating a FormContainer based on the provided OData V4 metadata.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FormContainer
   *   id="SomeId"
   *   entitySet="{entitySet>}"
   *   dataFieldCollection ="{dataFieldCollection>}"
   *   title="someTitle"
   *   navigationPath="{ToSupplier}"
   *   visible=true
   *   onChange=".handlers.onFieldValueChange"
   * /&gt;
   * </pre>
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "FormContainer",
    namespace: "sap.fe.macros",
    fragment: "sap.fe.macros.form.FormContainer"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec6 = blockAttribute({
    type: "array"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "string"
  }), _dec9 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "string"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec12 = blockAttribute({
    type: "string"
  }), _dec13 = blockAttribute({
    type: "array"
  }), _dec14 = blockAggregation({
    type: "sap.fe.macros.form.FormElement"
  }), _dec15 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormContainerBlock, _BuildingBlockBase);
    /**
     * Metadata path to the dataFieldCollection
     */

    /**
     * Control whether the form is in displayMode or not
     */

    /**
     * Title of the form container
     */

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * Binding the form container using a navigation path
     */

    /**
     * Binding the visibility of the form container using an expression binding or Boolean
     */

    /**
     * Flex designtime settings to be applied
     */

    // Just proxied down to the Field may need to see if needed or not

    function FormContainerBlock(props, externalConfiguration, settings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataFieldCollection", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "designtimeSettings", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor14, _assertThisInitialized(_this));
      _this.entitySet = _this.contextPath;
      if (_this.formElements && Object.keys(_this.formElements).length > 0) {
        const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        const mExtraSettings = {};
        let oFacetDefinition = oContextObjectPath.targetObject;
        // Wrap the facet in a fake Facet annotation
        oFacetDefinition = {
          $Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
          Label: oFacetDefinition.Label,
          Target: {
            $target: oFacetDefinition,
            fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
            path: "",
            term: "",
            type: "AnnotationPath",
            value: getContextRelativeTargetObjectPath(oContextObjectPath)
          },
          annotations: {},
          fullyQualifiedName: oFacetDefinition.fullyQualifiedName
        };
        mExtraSettings[oFacetDefinition.Target.value] = {
          fields: _this.formElements
        };
        const oConverterContext = _this.getConverterContext(oContextObjectPath, /*this.contextPath*/undefined, settings, mExtraSettings);
        const oFormDefinition = createFormDefinition(oFacetDefinition, "true", oConverterContext);
        _this.dataFieldCollection = oFormDefinition.formContainers[0].formElements;
      }
      return _this;
    }
    _exports = FormContainerBlock;
    return FormContainerBlock;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "dataFieldCollection", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "titleLevel", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "Auto";
    }
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "designtimeSettings", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "sap/fe/macros/form/FormContainer.designtime";
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FormContainerBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQ29udGFpbmVyQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJpc1B1YmxpYyIsImV4cGVjdGVkVHlwZXMiLCJibG9ja0FnZ3JlZ2F0aW9uIiwiYmxvY2tFdmVudCIsInByb3BzIiwiZXh0ZXJuYWxDb25maWd1cmF0aW9uIiwic2V0dGluZ3MiLCJlbnRpdHlTZXQiLCJjb250ZXh0UGF0aCIsImZvcm1FbGVtZW50cyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJvQ29udGV4dE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJtZXRhUGF0aCIsIm1FeHRyYVNldHRpbmdzIiwib0ZhY2V0RGVmaW5pdGlvbiIsInRhcmdldE9iamVjdCIsIiRUeXBlIiwiTGFiZWwiLCJUYXJnZXQiLCIkdGFyZ2V0IiwiZnVsbHlRdWFsaWZpZWROYW1lIiwicGF0aCIsInRlcm0iLCJ2YWx1ZSIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJhbm5vdGF0aW9ucyIsImZpZWxkcyIsIm9Db252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dCIsInVuZGVmaW5lZCIsIm9Gb3JtRGVmaW5pdGlvbiIsImNyZWF0ZUZvcm1EZWZpbml0aW9uIiwiZGF0YUZpZWxkQ29sbGVjdGlvbiIsImZvcm1Db250YWluZXJzIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZvcm1Db250YWluZXIuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBZ2dyZWdhdGlvbiwgYmxvY2tBdHRyaWJ1dGUsIGJsb2NrRXZlbnQsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBjcmVhdGVGb3JtRGVmaW5pdGlvbiwgRm9ybUVsZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRm9ybUNvbnRhaW5lciBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgT0RhdGEgVjQgbWV0YWRhdGEuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZvcm1Db250YWluZXJcbiAqICAgaWQ9XCJTb21lSWRcIlxuICogICBlbnRpdHlTZXQ9XCJ7ZW50aXR5U2V0Pn1cIlxuICogICBkYXRhRmllbGRDb2xsZWN0aW9uID1cIntkYXRhRmllbGRDb2xsZWN0aW9uPn1cIlxuICogICB0aXRsZT1cInNvbWVUaXRsZVwiXG4gKiAgIG5hdmlnYXRpb25QYXRoPVwie1RvU3VwcGxpZXJ9XCJcbiAqICAgdmlzaWJsZT10cnVlXG4gKiAgIG9uQ2hhbmdlPVwiLmhhbmRsZXJzLm9uRmllbGRWYWx1ZUNoYW5nZVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkZvcm1Db250YWluZXJcIiwgbmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIiwgZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5mb3JtLkZvcm1Db250YWluZXJcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9ybUNvbnRhaW5lckJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIl1cblx0fSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGVudGl0eVNldD86IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0bWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhRmllbGRDb2xsZWN0aW9uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYXJyYXlcIlxuXHR9KVxuXHRkYXRhRmllbGRDb2xsZWN0aW9uPzogRm9ybUVsZW1lbnRbXTtcblxuXHQvKipcblx0ICogQ29udHJvbCB3aGV0aGVyIHRoZSBmb3JtIGlzIGluIGRpc3BsYXlNb2RlIG9yIG5vdFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRkaXNwbGF5TW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBUaXRsZSBvZiB0aGUgZm9ybSBjb250YWluZXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGl0bGU/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSBmb3JtIHRpdGxlLCB0aXRsZXMgb2YgaW50ZXJuYWxseSB1c2VkIGZvcm0gY29udGFpbmVycyBhcmUgbmVzdGVkIHN1YnNlcXVlbnRseVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkuY29yZS5UaXRsZUxldmVsXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHRpdGxlTGV2ZWw6IHN0cmluZyA9IFwiQXV0b1wiO1xuXG5cdC8qKlxuXHQgKiBCaW5kaW5nIHRoZSBmb3JtIGNvbnRhaW5lciB1c2luZyBhIG5hdmlnYXRpb24gcGF0aFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRuYXZpZ2F0aW9uUGF0aD86IHN0cmluZztcblxuXHQvKipcblx0ICogQmluZGluZyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZm9ybSBjb250YWluZXIgdXNpbmcgYW4gZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dmlzaWJsZT86IHN0cmluZztcblxuXHQvKipcblx0ICogRmxleCBkZXNpZ250aW1lIHNldHRpbmdzIHRvIGJlIGFwcGxpZWRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZGVzaWdudGltZVNldHRpbmdzOiBzdHJpbmcgPSBcInNhcC9mZS9tYWNyb3MvZm9ybS9Gb3JtQ29udGFpbmVyLmRlc2lnbnRpbWVcIjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImFycmF5XCIgfSlcblx0YWN0aW9ucz86IENvbnZlcnRlckFjdGlvbltdO1xuXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLmZvcm0uRm9ybUVsZW1lbnRcIiB9KVxuXHRmb3JtRWxlbWVudHM6IFJlY29yZDxzdHJpbmcsIENvbmZpZ3VyYWJsZU9iamVjdD4gPSB7fTtcblxuXHQvLyBKdXN0IHByb3hpZWQgZG93biB0byB0aGUgRmllbGQgbWF5IG5lZWQgdG8gc2VlIGlmIG5lZWRlZCBvciBub3Rcblx0QGJsb2NrRXZlbnQoKVxuXHRvbkNoYW5nZT86IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZvcm1Db250YWluZXJCbG9jaz4sIGV4dGVybmFsQ29uZmlndXJhdGlvbjogdW5rbm93biwgc2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdFx0dGhpcy5lbnRpdHlTZXQgPSB0aGlzLmNvbnRleHRQYXRoITtcblx0XHRpZiAodGhpcy5mb3JtRWxlbWVudHMgJiYgT2JqZWN0LmtleXModGhpcy5mb3JtRWxlbWVudHMpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdGNvbnN0IG1FeHRyYVNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuXHRcdFx0bGV0IG9GYWNldERlZmluaXRpb24gPSBvQ29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdFx0Ly8gV3JhcCB0aGUgZmFjZXQgaW4gYSBmYWtlIEZhY2V0IGFubm90YXRpb25cblx0XHRcdG9GYWNldERlZmluaXRpb24gPSB7XG5cdFx0XHRcdCRUeXBlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCIsXG5cdFx0XHRcdExhYmVsOiBvRmFjZXREZWZpbml0aW9uLkxhYmVsLFxuXHRcdFx0XHRUYXJnZXQ6IHtcblx0XHRcdFx0XHQkdGFyZ2V0OiBvRmFjZXREZWZpbml0aW9uLFxuXHRcdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogb0ZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdFx0cGF0aDogXCJcIixcblx0XHRcdFx0XHR0ZXJtOiBcIlwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIixcblx0XHRcdFx0XHR2YWx1ZTogZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFubm90YXRpb25zOiB7fSxcblx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBvRmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0fTtcblx0XHRcdG1FeHRyYVNldHRpbmdzW29GYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlXSA9IHsgZmllbGRzOiB0aGlzLmZvcm1FbGVtZW50cyB9O1xuXHRcdFx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQoXG5cdFx0XHRcdG9Db250ZXh0T2JqZWN0UGF0aCxcblx0XHRcdFx0Lyp0aGlzLmNvbnRleHRQYXRoKi8gdW5kZWZpbmVkLFxuXHRcdFx0XHRzZXR0aW5ncyxcblx0XHRcdFx0bUV4dHJhU2V0dGluZ3Ncblx0XHRcdCk7XG5cdFx0XHRjb25zdCBvRm9ybURlZmluaXRpb24gPSBjcmVhdGVGb3JtRGVmaW5pdGlvbihvRmFjZXREZWZpbml0aW9uLCBcInRydWVcIiwgb0NvbnZlcnRlckNvbnRleHQpO1xuXG5cdFx0XHR0aGlzLmRhdGFGaWVsZENvbGxlY3Rpb24gPSBvRm9ybURlZmluaXRpb24uZm9ybUNvbnRhaW5lcnNbMF0uZm9ybUVsZW1lbnRzO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BZ0NxQkEsa0JBQWtCO0VBckJ2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbkJBLE9Bb0JDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUsZUFBZTtJQUFFQyxTQUFTLEVBQUUsZUFBZTtJQUFFQyxRQUFRLEVBQUU7RUFBbUMsQ0FBQyxDQUFDLFVBRXZIQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBR2xDRCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFB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