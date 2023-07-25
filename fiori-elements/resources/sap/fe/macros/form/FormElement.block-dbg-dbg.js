/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FormElementBlock = (
  /**
   * Building block used to create a form element based on the metadata provided by OData V4.
   *
   * @public
   * @since 1.90.0
   */
  _dec = defineBuildingBlock({
    name: "FormElement",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "Singleton", "EntityType"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true,
    expectedTypes: ["Property"],
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithAction", "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataPointType"]
  }), _dec5 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec8 = blockAggregation({
    type: "sap.ui.core.Control",
    slot: "fields",
    isPublic: true,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormElementBlock, _BuildingBlockBase);
    /**
     * The identifier of the FormElement building block.
     *
     * @public
     */

    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */

    /**
     * Label shown for the field. If not set, the label from the annotations will be shown.
     *
     * @public
     */

    /**
     * If set to false, the FormElement is not rendered.
     *
     * @public
     */

    /**
     * Optional aggregation of controls that should be displayed inside the FormElement.
     * If not set, a default Field building block will be rendered
     *
     * @public
     */

    function FormElementBlock(props, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "label", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "key", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fields", _descriptor7, _assertThisInitialized(_this));
      const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      if (_this.label === undefined) {
        var _annotations$Common, _annotations$Common$L;
        _this.label = ((_annotations$Common = oContextObjectPath.targetObject.annotations.Common) === null || _annotations$Common === void 0 ? void 0 : (_annotations$Common$L = _annotations$Common.Label) === null || _annotations$Common$L === void 0 ? void 0 : _annotations$Common$L.toString()) ?? "";
      }
      return _this;
    }
    _exports = FormElementBlock;
    var _proto = FormElementBlock.prototype;
    _proto.getFields = function getFields() {
      if (this.fields) {
        return xml`<slot name="fields" />`;
      } else {
        return xml`<macros:Field
						metaPath="${this.metaPath}"
						contextPath="${this.contextPath}"
						id="${this.createId("FormElementField")}" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      return xml`<f:FormElement xmlns:f="sap.ui.layout.form" id="${this.id}"
			key="${this.key}"
			label="${this.label}"
			visible="${this.visible}">
			<f:fields>
				${this.getFields()}
			</f:fields>
		</f:FormElement>`;
    };
    return FormElementBlock;
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "key", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "fields", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FormElementBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJwdWJsaWNOYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJpc1B1YmxpYyIsInJlcXVpcmVkIiwiZXhwZWN0ZWRUeXBlcyIsImV4cGVjdGVkQW5ub3RhdGlvblR5cGVzIiwiYmxvY2tBZ2dyZWdhdGlvbiIsInNsb3QiLCJpc0RlZmF1bHQiLCJwcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJtU2V0dGluZ3MiLCJvQ29udGV4dE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJtZXRhUGF0aCIsImNvbnRleHRQYXRoIiwibGFiZWwiLCJ1bmRlZmluZWQiLCJ0YXJnZXRPYmplY3QiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkxhYmVsIiwidG9TdHJpbmciLCJnZXRGaWVsZHMiLCJmaWVsZHMiLCJ4bWwiLCJjcmVhdGVJZCIsImdldFRlbXBsYXRlIiwiaWQiLCJrZXkiLCJ2aXNpYmxlIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZvcm1FbGVtZW50LmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgU2VydmljZU9iamVjdCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBZ2dyZWdhdGlvbiwgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSBmb3JtIGVsZW1lbnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICpcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkwLjBcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZvcm1FbGVtZW50XCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtRWxlbWVudEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlIEZvcm1FbGVtZW50IGJ1aWxkaW5nIGJsb2NrLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHBhdGggb2YgdGhlIGNvbnRleHQgdXNlZCBpbiB0aGUgY3VycmVudCBwYWdlIG9yIGJsb2NrLlxuXHQgKiBUaGlzIHNldHRpbmcgaXMgZGVmaW5lZCBieSB0aGUgZnJhbWV3b3JrLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJTaW5nbGV0b25cIiwgXCJFbnRpdHlUeXBlXCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIlByb3BlcnR5XCJdLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvblR5cGVzOiBbXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoQWN0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIlxuXHRcdF1cblx0fSlcblx0bWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBMYWJlbCBzaG93biBmb3IgdGhlIGZpZWxkLiBJZiBub3Qgc2V0LCB0aGUgbGFiZWwgZnJvbSB0aGUgYW5ub3RhdGlvbnMgd2lsbCBiZSBzaG93bi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0bGFiZWw/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIElmIHNldCB0byBmYWxzZSwgdGhlIEZvcm1FbGVtZW50IGlzIG5vdCByZW5kZXJlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHZpc2libGU/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGtleT86IHN0cmluZztcblxuXHQvKipcblx0ICogT3B0aW9uYWwgYWdncmVnYXRpb24gb2YgY29udHJvbHMgdGhhdCBzaG91bGQgYmUgZGlzcGxheWVkIGluc2lkZSB0aGUgRm9ybUVsZW1lbnQuXG5cdCAqIElmIG5vdCBzZXQsIGEgZGVmYXVsdCBGaWVsZCBidWlsZGluZyBibG9jayB3aWxsIGJlIHJlbmRlcmVkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIHNsb3Q6IFwiZmllbGRzXCIsIGlzUHVibGljOiB0cnVlLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0ZmllbGRzPzogQ29udHJvbFtdO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8Rm9ybUVsZW1lbnRCbG9jaz4sIGNvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcywgY29uZmlndXJhdGlvbiwgbVNldHRpbmdzKTtcblx0XHRjb25zdCBvQ29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5tZXRhUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0aWYgKHRoaXMubGFiZWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5sYWJlbCA9IChvQ29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFNlcnZpY2VPYmplY3QpLmFubm90YXRpb25zLkNvbW1vbj8uTGFiZWw/LnRvU3RyaW5nKCkgPz8gXCJcIjtcblx0XHR9XG5cdH1cblxuXHRnZXRGaWVsZHMoKSB7XG5cdFx0aWYgKHRoaXMuZmllbGRzKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxzbG90IG5hbWU9XCJmaWVsZHNcIiAvPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB4bWxgPG1hY3JvczpGaWVsZFxuXHRcdFx0XHRcdFx0bWV0YVBhdGg9XCIke3RoaXMubWV0YVBhdGh9XCJcblx0XHRcdFx0XHRcdGNvbnRleHRQYXRoPVwiJHt0aGlzLmNvbnRleHRQYXRofVwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7dGhpcy5jcmVhdGVJZChcIkZvcm1FbGVtZW50RmllbGRcIil9XCIgLz5gO1xuXHRcdH1cblx0fVxuXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiB4bWxgPGY6Rm9ybUVsZW1lbnQgeG1sbnM6Zj1cInNhcC51aS5sYXlvdXQuZm9ybVwiIGlkPVwiJHt0aGlzLmlkfVwiXG5cdFx0XHRrZXk9XCIke3RoaXMua2V5fVwiXG5cdFx0XHRsYWJlbD1cIiR7dGhpcy5sYWJlbH1cIlxuXHRcdFx0dmlzaWJsZT1cIiR7dGhpcy52aXNpYmxlfVwiPlxuXHRcdFx0PGY6ZmllbGRzPlxuXHRcdFx0XHQke3RoaXMuZ2V0RmllbGRzKCl9XG5cdFx0XHQ8L2Y6ZmllbGRzPlxuXHRcdDwvZjpGb3JtRWxlbWVudD5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O01BbUJxQkEsZ0JBQWdCO0VBVnJDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLE9BTUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsYUFBYTtJQUNuQkMsZUFBZSxFQUFFO0VBQ2xCLENBQUMsQ0FBQyxVQU9BQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBU2xFSCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRSxZQUFZO0VBQzdFLENBQUMsQ0FBQyxVQVFESixjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQzNCQyx1QkFBdUIsRUFBRSxDQUN4QixzQ0FBc0MsRUFDdEMsNkNBQTZDLEVBQzdDLG1EQUFtRCxFQUNuRCwrQ0FBK0MsRUFDL0MsOERBQThELEVBQzlELGdEQUFnRCxFQUNoRCwrREFBK0QsRUFDL0Qsd0RBQXdELEVBQ3hELDBDQUEwQztFQUU1QyxDQUFDLENBQUMsVUFRREwsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQVFsREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUduREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQVNsREksZ0JBQWdCLENBQUM7SUFBRUwsSUFBSSxFQUFFLHFCQUFxQjtJQUFFTSxJQUFJLEVBQUUsUUFBUTtJQUFFTCxRQUFRLEVBQUUsSUFBSTtJQUFFTSxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUM7SUFBQTtJQXZFbkc7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFJQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0lBU0M7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFvQkM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFJQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztJQU9DO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7SUFJQywwQkFBWUMsS0FBcUMsRUFBRUMsYUFBa0IsRUFBRUMsU0FBYyxFQUFFO01BQUE7TUFDdEYsc0NBQU1GLEtBQUssRUFBRUMsYUFBYSxFQUFFQyxTQUFTLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUN2QyxNQUFNQyxrQkFBa0IsR0FBR0MsMkJBQTJCLENBQUMsTUFBS0MsUUFBUSxFQUFFLE1BQUtDLFdBQVcsQ0FBQztNQUN2RixJQUFJLE1BQUtDLEtBQUssS0FBS0MsU0FBUyxFQUFFO1FBQUE7UUFDN0IsTUFBS0QsS0FBSyxHQUFHLHdCQUFDSixrQkFBa0IsQ0FBQ00sWUFBWSxDQUFtQkMsV0FBVyxDQUFDQyxNQUFNLGlGQUFyRSxvQkFBdUVDLEtBQUssMERBQTVFLHNCQUE4RUMsUUFBUSxFQUFFLEtBQUksRUFBRTtNQUM1RztNQUFDO0lBQ0Y7SUFBQztJQUFBO0lBQUEsT0FFREMsU0FBUyxHQUFULHFCQUFZO01BQ1gsSUFBSSxJQUFJLENBQUNDLE1BQU0sRUFBRTtRQUNoQixPQUFPQyxHQUFJLHdCQUF1QjtNQUNuQyxDQUFDLE1BQU07UUFDTixPQUFPQSxHQUFJO0FBQ2Qsa0JBQWtCLElBQUksQ0FBQ1gsUUFBUztBQUNoQyxxQkFBcUIsSUFBSSxDQUFDQyxXQUFZO0FBQ3RDLFlBQVksSUFBSSxDQUFDVyxRQUFRLENBQUMsa0JBQWtCLENBQUUsTUFBSztNQUNqRDtJQUNELENBQUM7SUFBQSxPQUVEQyxXQUFXLEdBQVgsdUJBQWM7TUFDYixPQUFPRixHQUFJLG1EQUFrRCxJQUFJLENBQUNHLEVBQUc7QUFDdkUsVUFBVSxJQUFJLENBQUNDLEdBQUk7QUFDbkIsWUFBWSxJQUFJLENBQUNiLEtBQU07QUFDdkIsY0FBYyxJQUFJLENBQUNjLE9BQVE7QUFDM0I7QUFDQSxNQUFNLElBQUksQ0FBQ1AsU0FBUyxFQUFHO0FBQ3ZCO0FBQ0EsbUJBQW1CO0lBQ2xCLENBQUM7SUFBQTtFQUFBLEVBdkc0Q1EsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9