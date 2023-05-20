/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards"], function (BuildingBlockBase, BuildingBlockSupport, MetaModelConverter, TypeGuards) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var _exports = {};
  var isEntitySet = TypeGuards.isEntitySet;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ValueHelpBlock = (
  /**
   * Building block for creating a ValueHelp based on the provided OData V4 metadata.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:ValueHelp
   *   idPrefix="SomePrefix"
   *   property="{someProperty&gt;}"
   *   conditionModel="$filters"
   * /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "ValueHelp",
    namespace: "sap.fe.macros",
    fragment: "sap.fe.macros.internal.valuehelp.ValueHelp"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["Property"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "boolean"
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ValueHelpBlock, _BuildingBlockBase);
    /**
     * A prefix that is added to the generated ID of the value help.
     */

    /**
     * Defines the metadata path to the property.
     */

    /**
     * Indicator whether the value help is for a filter field.
     */

    /**
     * Indicates that this is a value help of a filter field. Necessary to decide if a
     * validation should occur on the back end or already on the client.
     */

    /**
     * Specifies the Sematic Date Range option for the filter field.
     */

    /**
     * Specifies whether the ValueHelp can be used with a MultiValueField
     */

    function ValueHelpBlock(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "property", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "conditionModel", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFieldValueHelp", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useMultiValueField", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPrefix", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiresValidation", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor10, _assertThisInitialized(_this));
      _this.requestGroupId = "$auto.Workers";
      _this.collaborationEnabled = false;
      const contextObject = getInvolvedDataModelObjects(_this.contextPath);
      const entitySetOrSingleton = contextObject.targetEntitySet;
      if (isEntitySet(entitySetOrSingleton)) {
        var _entitySetOrSingleton, _entitySetOrSingleton2;
        _this.collaborationEnabled = ((_entitySetOrSingleton = entitySetOrSingleton.annotations.Common) === null || _entitySetOrSingleton === void 0 ? void 0 : (_entitySetOrSingleton2 = _entitySetOrSingleton.DraftRoot) === null || _entitySetOrSingleton2 === void 0 ? void 0 : _entitySetOrSingleton2.ShareAction) !== undefined;
      }
      return _this;
    }
    _exports = ValueHelpBlock;
    return ValueHelpBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "ValueHelp";
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "conditionModel", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "filterFieldValueHelp", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "useMultiValueField", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "navigationPrefix", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "requiresValidation", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ValueHelpBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUhlbHBCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImV4cGVjdGVkVHlwZXMiLCJwcm9wcyIsInJlcXVlc3RHcm91cElkIiwiY29sbGFib3JhdGlvbkVuYWJsZWQiLCJjb250ZXh0T2JqZWN0IiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXRPclNpbmdsZXRvbiIsInRhcmdldEVudGl0eVNldCIsImlzRW50aXR5U2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJEcmFmdFJvb3QiLCJTaGFyZUFjdGlvbiIsInVuZGVmaW5lZCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWYWx1ZUhlbHAuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGlzRW50aXR5U2V0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBWYWx1ZUhlbHAgYmFzZWQgb24gdGhlIHByb3ZpZGVkIE9EYXRhIFY0IG1ldGFkYXRhLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpWYWx1ZUhlbHBcbiAqICAgaWRQcmVmaXg9XCJTb21lUHJlZml4XCJcbiAqICAgcHJvcGVydHk9XCJ7c29tZVByb3BlcnR5Jmd0O31cIlxuICogICBjb25kaXRpb25Nb2RlbD1cIiRmaWx0ZXJzXCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiVmFsdWVIZWxwXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsIGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlSGVscFwiIH0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYWx1ZUhlbHBCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aWRQcmVmaXggPSBcIlZhbHVlSGVscFwiO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBtZXRhZGF0YSBwYXRoIHRvIHRoZSBwcm9wZXJ0eS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUsIGV4cGVjdGVkVHlwZXM6IFtcIlByb3BlcnR5XCJdIH0pXG5cdHByb3BlcnR5ITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogSW5kaWNhdG9yIHdoZXRoZXIgdGhlIHZhbHVlIGhlbHAgaXMgZm9yIGEgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjb25kaXRpb25Nb2RlbCA9IFwiXCI7XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB0aGF0IHRoaXMgaXMgYSB2YWx1ZSBoZWxwIG9mIGEgZmlsdGVyIGZpZWxkLiBOZWNlc3NhcnkgdG8gZGVjaWRlIGlmIGFcblx0ICogdmFsaWRhdGlvbiBzaG91bGQgb2NjdXIgb24gdGhlIGJhY2sgZW5kIG9yIGFscmVhZHkgb24gdGhlIGNsaWVudC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGZpbHRlckZpZWxkVmFsdWVIZWxwID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgU2VtYXRpYyBEYXRlIFJhbmdlIG9wdGlvbiBmb3IgdGhlIGZpbHRlciBmaWVsZC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHVzZVNlbWFudGljRGF0ZVJhbmdlID0gdHJ1ZTtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIFZhbHVlSGVscCBjYW4gYmUgdXNlZCB3aXRoIGEgTXVsdGlWYWx1ZUZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHR1c2VNdWx0aVZhbHVlRmllbGQgPSBmYWxzZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG5hdmlnYXRpb25QcmVmaXg/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cmVxdWlyZXNWYWxpZGF0aW9uID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5cdF9mbGV4SWQ/OiBzdHJpbmc7XG5cblx0cmVxdWVzdEdyb3VwSWQgPSBcIiRhdXRvLldvcmtlcnNcIjtcblxuXHRjb2xsYWJvcmF0aW9uRW5hYmxlZCA9IGZhbHNlO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8VmFsdWVIZWxwQmxvY2s+KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0Y29uc3QgY29udGV4dE9iamVjdCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBlbnRpdHlTZXRPclNpbmdsZXRvbiA9IGNvbnRleHRPYmplY3QudGFyZ2V0RW50aXR5U2V0O1xuXHRcdGlmIChpc0VudGl0eVNldChlbnRpdHlTZXRPclNpbmdsZXRvbikpIHtcblx0XHRcdHRoaXMuY29sbGFib3JhdGlvbkVuYWJsZWQgPSBlbnRpdHlTZXRPclNpbmdsZXRvbi5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Um9vdD8uU2hhcmVBY3Rpb24gIT09IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQXVCcUJBLGNBQWM7RUFoQm5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWRBLE9BZUNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxXQUFXO0lBQUVDLFNBQVMsRUFBRSxlQUFlO0lBQUVDLFFBQVEsRUFBRTtFQUE2QyxDQUFDLENBQUMsVUFLN0hDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFNbENELGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0JBQXNCO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLGFBQWEsRUFBRSxDQUFDLFVBQVU7RUFBRSxDQUFDLENBQUMsVUFHN0ZILGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0JBQXNCO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU1oRUYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQU9sQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQU1uQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQU1uQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxVQUduQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQUdsQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFVLENBQUMsQ0FBQyxXQUduQ0QsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQztJQUFBO0lBOUNuQztBQUNEO0FBQ0E7O0lBSUM7QUFDRDtBQUNBOztJQU9DO0FBQ0Q7QUFDQTs7SUFJQztBQUNEO0FBQ0E7QUFDQTs7SUFJQztBQUNEO0FBQ0E7O0lBSUM7QUFDRDtBQUNBOztJQWtCQyx3QkFBWUcsS0FBbUMsRUFBRTtNQUFBO01BQ2hELHNDQUFNQSxLQUFLLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBLE1BTGRDLGNBQWMsR0FBRyxlQUFlO01BQUEsTUFFaENDLG9CQUFvQixHQUFHLEtBQUs7TUFLM0IsTUFBTUMsYUFBYSxHQUFHQywyQkFBMkIsQ0FBQyxNQUFLQyxXQUFXLENBQUM7TUFDbkUsTUFBTUMsb0JBQW9CLEdBQUdILGFBQWEsQ0FBQ0ksZUFBZTtNQUMxRCxJQUFJQyxXQUFXLENBQUNGLG9CQUFvQixDQUFDLEVBQUU7UUFBQTtRQUN0QyxNQUFLSixvQkFBb0IsR0FBRywwQkFBQUksb0JBQW9CLENBQUNHLFdBQVcsQ0FBQ0MsTUFBTSxvRkFBdkMsc0JBQXlDQyxTQUFTLDJEQUFsRCx1QkFBb0RDLFdBQVcsTUFBS0MsU0FBUztNQUMxRztNQUFDO0lBQ0Y7SUFBQztJQUFBO0VBQUEsRUEvRDBDQyxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BS2pELFdBQVc7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BZUwsRUFBRTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BT0ksS0FBSztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BTUwsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BTU4sS0FBSztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQU1MLEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9