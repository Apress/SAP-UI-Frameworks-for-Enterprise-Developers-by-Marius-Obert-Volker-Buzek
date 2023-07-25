/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter, BindingToolkit, StableIdHelper, DataModelPathHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var generate = StableIdHelper.generate;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
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
  let ContactBlock = (_dec = defineBuildingBlock({
    name: "Contact",
    namespace: "sap.fe.macros",
    designtime: "sap/fe/macros/Contact.designtime"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    expectedTypes: ["com.sap.vocabularies.Communication.v1.ContactType"],
    required: true
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ContactBlock, _BuildingBlockBase);
    function ContactBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ContactBlock;
    var _proto = ContactBlock.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _proto.getTemplate = function getTemplate() {
      let id;
      if (this._flexId) {
        //in case a flex id is given, take this one
        id = this._flexId;
      } else {
        //alternatively check for idPrefix and generate an appropriate id
        id = this.idPrefix ? generate([this.idPrefix, "Field-content"]) : undefined;
      }
      const convertedContact = convertMetaModelContext(this.metaPath);
      const myDataModel = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
      const value = getExpressionFromAnnotation(convertedContact.fn, getRelativePaths(myDataModel));
      const delegateConfiguration = {
        name: "sap/fe/macros/contact/ContactDelegate",
        payload: {
          contact: this.metaPath.getPath()
        }
      };
      return xml`<mdc:Field
		xmlns:mdc="sap.ui.mdc"
		delegate="{name: 'sap/ui/mdc/odata/v4/FieldBaseDelegate'}"
		${this.attr("id", id)}
		editMode="Display"
		width="100%"
		${this.attr("visible", this.visible)}
		${this.attr("value", value)}
		${this.attr("ariaLabelledBy", this.ariaLabelledBy)}
	>
		<mdc:fieldInfo>
			<mdc:Link
				core:require="{FieldRuntime: 'sap/fe/macros/field/FieldRuntime'}"
				enablePersonalization="false"
				${this.attr("delegate", JSON.stringify(delegateConfiguration))}
			/>
		</mdc:fieldInfo>
	</mdc:Field>
			`;
    };
    return ContactBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec3], {
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
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ContactBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250YWN0QmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImRlc2lnbnRpbWUiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJleHBlY3RlZFR5cGVzIiwicmVxdWlyZWQiLCJnZXRUZW1wbGF0ZSIsImlkIiwiX2ZsZXhJZCIsImlkUHJlZml4IiwiZ2VuZXJhdGUiLCJ1bmRlZmluZWQiLCJjb252ZXJ0ZWRDb250YWN0IiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJtZXRhUGF0aCIsIm15RGF0YU1vZGVsIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJ2YWx1ZSIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImZuIiwiZ2V0UmVsYXRpdmVQYXRocyIsImRlbGVnYXRlQ29uZmlndXJhdGlvbiIsInBheWxvYWQiLCJjb250YWN0IiwiZ2V0UGF0aCIsInhtbCIsImF0dHIiLCJ2aXNpYmxlIiwiYXJpYUxhYmVsbGVkQnkiLCJKU09OIiwic3RyaW5naWZ5IiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbnRhY3QuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNYWNybyBmb3IgY3JlYXRpbmcgYSBDb250YWN0IGJhc2VkIG9uIHByb3ZpZGVkIE9EYXRhIHY0IG1ldGFkYXRhLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpDb250YWN0XG4gKiAgIGlkPVwic29tZUlEXCJcbiAqICAgY29udGFjdD1cIntjb250YWN0Pn1cIlxuICogICBjb250ZXh0UGF0aD1cIntjb250ZXh0UGF0aD59XCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgY29udmVydE1ldGFNb2RlbENvbnRleHQsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFJlbGF0aXZlUGF0aHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkNvbnRhY3RcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0ZGVzaWdudGltZTogXCJzYXAvZmUvbWFjcm9zL0NvbnRhY3QuZGVzaWdudGltZVwiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFjdEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogUHJlZml4IGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGlkUHJlZml4Pzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgX2ZsZXhJZD86IHN0cmluZzsgLy9uZWVkcyB0byBiZSBhZGRlZCBpbiB2Miwgd2FzIHRoZXJlIFwiaW1wbGljaXRseVwiIGluIHYxXG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIENvbnRhY3Rcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFR5cGVcIl0sXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0cHVibGljIG1ldGFQYXRoITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aD86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IGFkZGVkIHRvIGFzc29jaWF0ZSB0aGUgbGFiZWwgYW5kIHRoZSBjb250YWN0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGFyaWFMYWJlbGxlZEJ5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBCb29sZWFuIHZpc2libGUgcHJvcGVydHlcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0cHVibGljIHZpc2libGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0bGV0IGlkO1xuXHRcdGlmICh0aGlzLl9mbGV4SWQpIHtcblx0XHRcdC8vaW4gY2FzZSBhIGZsZXggaWQgaXMgZ2l2ZW4sIHRha2UgdGhpcyBvbmVcblx0XHRcdGlkID0gdGhpcy5fZmxleElkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL2FsdGVybmF0aXZlbHkgY2hlY2sgZm9yIGlkUHJlZml4IGFuZCBnZW5lcmF0ZSBhbiBhcHByb3ByaWF0ZSBpZFxuXHRcdFx0aWQgPSB0aGlzLmlkUHJlZml4ID8gZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIFwiRmllbGQtY29udGVudFwiXSkgOiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY29udmVydGVkQ29udGFjdCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMubWV0YVBhdGgpO1xuXHRcdGNvbnN0IG15RGF0YU1vZGVsID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXG5cdFx0Y29uc3QgdmFsdWUgPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29udmVydGVkQ29udGFjdC5mbiwgZ2V0UmVsYXRpdmVQYXRocyhteURhdGFNb2RlbCkpO1xuXHRcdGNvbnN0IGRlbGVnYXRlQ29uZmlndXJhdGlvbiA9IHtcblx0XHRcdG5hbWU6IFwic2FwL2ZlL21hY3Jvcy9jb250YWN0L0NvbnRhY3REZWxlZ2F0ZVwiLFxuXHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRjb250YWN0OiB0aGlzLm1ldGFQYXRoLmdldFBhdGgoKVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4geG1sYDxtZGM6RmllbGRcblx0XHR4bWxuczptZGM9XCJzYXAudWkubWRjXCJcblx0XHRkZWxlZ2F0ZT1cIntuYW1lOiAnc2FwL3VpL21kYy9vZGF0YS92NC9GaWVsZEJhc2VEZWxlZ2F0ZSd9XCJcblx0XHQke3RoaXMuYXR0cihcImlkXCIsIGlkKX1cblx0XHRlZGl0TW9kZT1cIkRpc3BsYXlcIlxuXHRcdHdpZHRoPVwiMTAwJVwiXG5cdFx0JHt0aGlzLmF0dHIoXCJ2aXNpYmxlXCIsIHRoaXMudmlzaWJsZSl9XG5cdFx0JHt0aGlzLmF0dHIoXCJ2YWx1ZVwiLCB2YWx1ZSl9XG5cdFx0JHt0aGlzLmF0dHIoXCJhcmlhTGFiZWxsZWRCeVwiLCB0aGlzLmFyaWFMYWJlbGxlZEJ5KX1cblx0PlxuXHRcdDxtZGM6ZmllbGRJbmZvPlxuXHRcdFx0PG1kYzpMaW5rXG5cdFx0XHRcdGNvcmU6cmVxdWlyZT1cIntGaWVsZFJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZSd9XCJcblx0XHRcdFx0ZW5hYmxlUGVyc29uYWxpemF0aW9uPVwiZmFsc2VcIlxuXHRcdFx0XHQke3RoaXMuYXR0cihcImRlbGVnYXRlXCIsIEpTT04uc3RyaW5naWZ5KGRlbGVnYXRlQ29uZmlndXJhdGlvbikpfVxuXHRcdFx0Lz5cblx0XHQ8L21kYzpmaWVsZEluZm8+XG5cdDwvbWRjOkZpZWxkPlxuXHRcdFx0YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQThCcUJBLFlBQVksV0FMaENDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxTQUFTLEVBQUUsZUFBZTtJQUMxQkMsVUFBVSxFQUFFO0VBQ2IsQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUks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