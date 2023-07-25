/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/TemplateModel"], function (BuildingBlockBase, BuildingBlockSupport, FilterBar, MetaModelConverter, TemplateModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15;
  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getExpandFilterFields = FilterBar.getExpandFilterFields;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ValueHelpFilterBarBlock = (
  /**
   * Building block for creating a FilterBar based on the metadata provided by OData V4 for the value help dialog.
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "ValueHelpFilterBar",
    namespace: "sap.fe.macros.valuehelp",
    fragment: "sap.fe.macros.valuehelp.ValueHelpFilterBar"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = blockAttribute({
    type: "boolean"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "sap.ui.mdc.FilterBarP13nMode[]"
  }), _dec8 = blockAttribute({
    type: "boolean"
  }), _dec9 = blockAttribute({
    type: "boolean"
  }), _dec10 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec11 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec12 = blockAttribute({
    type: "string"
  }), _dec13 = blockAttribute({
    type: "boolean"
  }), _dec14 = blockAttribute({
    type: "boolean"
  }), _dec15 = blockEvent(), _dec16 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ValueHelpFilterBarBlock, _BuildingBlockBase);
    /**
     * ID of the FilterBar
     */

    /**
     * Don't show the basic search field
     */

    /**
     * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
     */

    /**
     * Specifies the personalization options for the filter bar.
     */

    /**
     * Specifies the Sematic Date Range option for the filter bar.
     */

    /**
     * If set the search will be automatically triggered, when a filter value was changed.
     */

    /**
     * Temporary workaround only
     * path to valuelist
     */

    /**
     * selectionFields to be displayed
     */

    /**
     * Filter conditions to be applied to the filter bar
     */

    /**
     * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
     * a search is triggered immediately if one or more search requests have been triggered in the meantime
     * but were ignored based on the setting.
     */

    /**
     * Determines whether the Show/Hide Filters button is in the state show or hide.
     */

    /**
     * Search handler name
     */

    /**
     * Filters changed handler name
     */

    function ValueHelpFilterBarBlock(props, controlConfiguration, settings) {
      var _targetEntitySet$anno;
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideBasicSearch", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFallback", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "p13nMode", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_valueList", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionFields", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterConditions", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "suspendSelection", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "expandFilterFields", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor15, _assertThisInitialized(_this));
      const metaModel = _this.contextPath.getModel();
      const metaPathContext = _this.metaPath;
      const metaPathPath = metaPathContext === null || metaPathContext === void 0 ? void 0 : metaPathContext.getPath();
      const dataModelObjectPath = getInvolvedDataModelObjects(_this.contextPath);
      const converterContext = _this.getConverterContext(dataModelObjectPath, undefined, settings);
      if (!_this.selectionFields) {
        const selectionFields = getSelectionFields(converterContext, [], metaPathPath).selectionFields;
        _this.selectionFields = new TemplateModel(selectionFields, metaModel).createBindingContext("/");
      }
      const targetEntitySet = dataModelObjectPath.targetEntitySet; // It could be a singleton but the annotaiton are not defined there (yet?)
      _this.expandFilterFields = getExpandFilterFields(converterContext, (_targetEntitySet$anno = targetEntitySet.annotations.Capabilities) === null || _targetEntitySet$anno === void 0 ? void 0 : _targetEntitySet$anno.FilterRestrictions, _this._valueList);
      return _this;
    }
    _exports = ValueHelpFilterBarBlock;
    return ValueHelpFilterBarBlock;
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "hideBasicSearch", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "enableFallback", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "p13nMode", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return [];
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "_valueList", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "selectionFields", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "filterConditions", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "suspendSelection", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "expandFilterFields", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ValueHelpFilterBarBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUhlbHBGaWx0ZXJCYXJCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImJsb2NrRXZlbnQiLCJwcm9wcyIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwic2V0dGluZ3MiLCJtZXRhTW9kZWwiLCJjb250ZXh0UGF0aCIsImdldE1vZGVsIiwibWV0YVBhdGhDb250ZXh0IiwibWV0YVBhdGgiLCJtZXRhUGF0aFBhdGgiLCJnZXRQYXRoIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0IiwidW5kZWZpbmVkIiwic2VsZWN0aW9uRmllbGRzIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwiVGVtcGxhdGVNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwidGFyZ2V0RW50aXR5U2V0IiwiZXhwYW5kRmlsdGVyRmllbGRzIiwiZ2V0RXhwYW5kRmlsdGVyRmllbGRzIiwiYW5ub3RhdGlvbnMiLCJDYXBhYmlsaXRpZXMiLCJGaWx0ZXJSZXN0cmljdGlvbnMiLCJfdmFsdWVMaXN0IiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZhbHVlSGVscEZpbHRlckJhci5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVNldCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGJsb2NrRXZlbnQsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHsgVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncyB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IGdldEV4cGFuZEZpbHRlckZpZWxkcywgZ2V0U2VsZWN0aW9uRmllbGRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckJhclAxM25Nb2RlIH0gZnJvbSBcInNhcC91aS9tZGMvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWx0ZXJCYXIgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0IGZvciB0aGUgdmFsdWUgaGVscCBkaWFsb2cuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIlZhbHVlSGVscEZpbHRlckJhclwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy52YWx1ZWhlbHBcIixcblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy52YWx1ZWhlbHAuVmFsdWVIZWxwRmlsdGVyQmFyXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYWx1ZUhlbHBGaWx0ZXJCYXJCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIElEIG9mIHRoZSBGaWx0ZXJCYXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0cHVibGljIGlkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0cHVibGljIG1ldGFQYXRoPzogQ29udGV4dDtcblxuXHQvKipcblx0ICogRG9uJ3Qgc2hvdyB0aGUgYmFzaWMgc2VhcmNoIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRwdWJsaWMgaGlkZUJhc2ljU2VhcmNoID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhlIGZhbGxiYWNrIHRvIHNob3cgYWxsIGZpZWxkcyBvZiB0aGUgRW50aXR5VHlwZSBhcyBmaWx0ZXIgZmllbGRzIGlmIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkcyBhcmUgbm90IHByZXNlbnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGVuYWJsZUZhbGxiYWNrID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgcGVyc29uYWxpemF0aW9uIG9wdGlvbnMgZm9yIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubWRjLkZpbHRlckJhclAxM25Nb2RlW11cIiB9KVxuXHRwdWJsaWMgcDEzbk1vZGU6IEZpbHRlckJhclAxM25Nb2RlW10gPSBbXTtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHB1YmxpYyB1c2VTZW1hbnRpY0RhdGVSYW5nZSA9IHRydWU7XG5cblx0LyoqXG5cdCAqIElmIHNldCB0aGUgc2VhcmNoIHdpbGwgYmUgYXV0b21hdGljYWxseSB0cmlnZ2VyZWQsIHdoZW4gYSBmaWx0ZXIgdmFsdWUgd2FzIGNoYW5nZWQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRwdWJsaWMgbGl2ZU1vZGUgPSBmYWxzZTtcblxuXHQvKipcblx0ICogVGVtcG9yYXJ5IHdvcmthcm91bmQgb25seVxuXHQgKiBwYXRoIHRvIHZhbHVlbGlzdFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5cdHB1YmxpYyBfdmFsdWVMaXN0ITogQ29udGV4dDtcblxuXHQvKipcblx0ICogc2VsZWN0aW9uRmllbGRzIHRvIGJlIGRpc3BsYXllZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdHB1YmxpYyBzZWxlY3Rpb25GaWVsZHM/OiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgY29uZGl0aW9ucyB0byBiZSBhcHBsaWVkIHRvIHRoZSBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBmaWx0ZXJDb25kaXRpb25zPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJZiBzZXQgdG8gPGNvZGU+dHJ1ZTwvY29kZT4sIGFsbCBzZWFyY2ggcmVxdWVzdHMgYXJlIGlnbm9yZWQuIE9uY2UgaXQgaGFzIGJlZW4gc2V0IHRvIDxjb2RlPmZhbHNlPC9jb2RlPixcblx0ICogYSBzZWFyY2ggaXMgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5IGlmIG9uZSBvciBtb3JlIHNlYXJjaCByZXF1ZXN0cyBoYXZlIGJlZW4gdHJpZ2dlcmVkIGluIHRoZSBtZWFudGltZVxuXHQgKiBidXQgd2VyZSBpZ25vcmVkIGJhc2VkIG9uIHRoZSBzZXR0aW5nLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cHVibGljIHN1c3BlbmRTZWxlY3Rpb24gPSBmYWxzZTtcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBTaG93L0hpZGUgRmlsdGVycyBidXR0b24gaXMgaW4gdGhlIHN0YXRlIHNob3cgb3IgaGlkZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHByaXZhdGUgZXhwYW5kRmlsdGVyRmllbGRzID0gdHJ1ZTtcblxuXHQvKipcblx0ICogU2VhcmNoIGhhbmRsZXIgbmFtZVxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRzZWFyY2g/OiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogRmlsdGVycyBjaGFuZ2VkIGhhbmRsZXIgbmFtZVxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRmaWx0ZXJDaGFuZ2VkPzogRnVuY3Rpb247XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxWYWx1ZUhlbHBGaWx0ZXJCYXJCbG9jaz4sIGNvbnRyb2xDb25maWd1cmF0aW9uOiB1bmtub3duLCBzZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblxuXHRcdGNvbnN0IG1ldGFQYXRoQ29udGV4dCA9IHRoaXMubWV0YVBhdGg7XG5cdFx0Y29uc3QgbWV0YVBhdGhQYXRoID0gbWV0YVBhdGhDb250ZXh0Py5nZXRQYXRoKCk7XG5cdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KGRhdGFNb2RlbE9iamVjdFBhdGgsIHVuZGVmaW5lZCwgc2V0dGluZ3MpO1xuXG5cdFx0aWYgKCF0aGlzLnNlbGVjdGlvbkZpZWxkcykge1xuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gZ2V0U2VsZWN0aW9uRmllbGRzKGNvbnZlcnRlckNvbnRleHQsIFtdLCBtZXRhUGF0aFBhdGgpLnNlbGVjdGlvbkZpZWxkcztcblx0XHRcdHRoaXMuc2VsZWN0aW9uRmllbGRzID0gbmV3IFRlbXBsYXRlTW9kZWwoc2VsZWN0aW9uRmllbGRzLCBtZXRhTW9kZWwpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHR9XG5cblx0XHRjb25zdCB0YXJnZXRFbnRpdHlTZXQ6IEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldDsgLy8gSXQgY291bGQgYmUgYSBzaW5nbGV0b24gYnV0IHRoZSBhbm5vdGFpdG9uIGFyZSBub3QgZGVmaW5lZCB0aGVyZSAoeWV0Pylcblx0XHR0aGlzLmV4cGFuZEZpbHRlckZpZWxkcyA9IGdldEV4cGFuZEZpbHRlckZpZWxkcyhcblx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHR0YXJnZXRFbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5GaWx0ZXJSZXN0cmljdGlvbnMsXG5cdFx0XHR0aGlzLl92YWx1ZUxpc3Rcblx0XHQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXNCcUJBLHVCQUF1QjtFQVY1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBSkEsT0FLQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxvQkFBb0I7SUFDMUJDLFNBQVMsRUFBRSx5QkFBeUI7SUFDcENDLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQUtBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBR2xDRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLHNCQUFzQjtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHaEVGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBdUIsQ0FBQyxDQUFDLFVBTWhERCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBTW5DRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBTW5DRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQWlDLENBQUMsQ0FBQyxVQU0xREQsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQU1uQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxXQU9uQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBT2hFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQXVCLENBQUMsQ0FBQyxXQU1oREQsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQVFsQ0Qs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