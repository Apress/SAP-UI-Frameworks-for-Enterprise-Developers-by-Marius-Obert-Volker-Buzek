/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/field/FieldHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, BindingToolkit, FieldHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
  var _exports = {};
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let PublicFieldBlock = (
  /**
   * Public external field representation
   */
  _dec = defineBuildingBlock({
    name: "Field",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec5 = blockAttribute({
    type: "boolean",
    isPublic: true,
    required: false
  }), _dec6 = blockAttribute({
    type: "string",
    isPublic: true,
    required: false
  }), _dec7 = blockAttribute({
    type: "string",
    isPublic: true,
    required: false
  }), _dec8 = blockAttribute({
    type: "object",
    isPublic: true,
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      if (formatOptionsInput.textExpandBehaviorDisplay && !["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)) {
        throw new Error(`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec9 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(PublicFieldBlock, _BuildingBlockBase);
    /**
     * The 'id' property
     */

    /**
     * The meta path provided for the field
     */

    /**
     * The context path provided for the field
     */

    /**
     * The readOnly flag
     */

    /**
     * The semantic object associated to the field
     */

    /**
     * The edit mode expression for the field
     */

    /**
     * The object with the formatting options
     */

    /**
     * The generic change event
     */

    function PublicFieldBlock(props) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editModeExpression", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor8, _assertThisInitialized(_this));
      if (_this.readOnly !== undefined) {
        _this.editModeExpression = compileExpression(ifElse(equal(resolveBindingString(_this.readOnly, "boolean"), true), "Display", "Editable"));
      }
      return _this;
    }

    /**
     * Sets the internal formatOptions for the building block.
     *
     * @returns A string with the internal formatOptions for the building block
     */
    _exports = PublicFieldBlock;
    var _proto = PublicFieldBlock.prototype;
    _proto.getFormatOptions = function getFormatOptions() {
      return xml`
		<internalMacro:formatOptions
			textAlignMode="Form"
			showEmptyIndicator="true"
			displayMode="${this.formatOptions.displayMode}"
			measureDisplayMode="${this.formatOptions.measureDisplayMode}"
			textLinesEdit="${this.formatOptions.textLinesEdit}"
			textMaxLines="${this.formatOptions.textMaxLines}"
			textMaxCharactersDisplay="${this.formatOptions.textMaxCharactersDisplay}"
			textExpandBehaviorDisplay="${this.formatOptions.textExpandBehaviorDisplay}"
			textMaxLength="${this.formatOptions.textMaxLength}"
			>
			${this.writeDateFormatOptions()}
		</internalMacro:formatOptions>
			`;
    };
    _proto.writeDateFormatOptions = function writeDateFormatOptions() {
      if (this.formatOptions.showTime || this.formatOptions.showDate || this.formatOptions.showTimezone) {
        return xml`<internalMacro:dateFormatOptions showTime="${this.formatOptions.showTime}"
				showDate="${this.formatOptions.showDate}"
				showTimezone="${this.formatOptions.showTimezone}"
				/>`;
      }
      return "";
    }

    /**
     * The function calculates the corresponding ValueHelp field in case it´s
     * defined for the specific control.
     *
     * @returns An XML-based string with a possible ValueHelp control.
     */;
    _proto.getPossibleValueHelpTemplate = function getPossibleValueHelpTemplate() {
      const vhp = FieldHelper.valueHelpProperty(this.metaPath);
      const vhpCtx = this.metaPath.getModel().createBindingContext(vhp, this.metaPath);
      const hasValueHelpAnnotations = FieldHelper.hasValueHelpAnnotation(vhpCtx.getObject("@"));
      if (hasValueHelpAnnotations) {
        // depending on whether this one has a value help annotation included, add the dependent
        return xml`
			<internalMacro:dependents>
				<macros:ValueHelp _flexId="${this.id}-content_FieldValueHelp" property="${vhpCtx}" contextPath="${this.contextPath}" />
			</internalMacro:dependents>`;
      }
      return "";
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getTemplate = function getTemplate() {
      const contextPathPath = this.contextPath.getPath();
      const metaPathPath = this.metaPath.getPath();
      return xml`
		<internalMacro:Field
			xmlns:internalMacro="sap.fe.macros.internal"
			entitySet="${contextPathPath}"
			dataField="${metaPathPath}"
			editMode="${this.editModeExpression}"
			onChange="${this.change}"
			_flexId="${this.id}"
			semanticObject="${this.semanticObject}"
		>
			${this.getFormatOptions()}
			${this.getPossibleValueHelpTemplate()}
		</internalMacro:Field>`;
    };
    return PublicFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "editModeExpression", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = PublicFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQdWJsaWNGaWVsZEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJwdWJsaWNOYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJpc1B1YmxpYyIsInJlcXVpcmVkIiwidmFsaWRhdGUiLCJmb3JtYXRPcHRpb25zSW5wdXQiLCJkaXNwbGF5TW9kZSIsImluY2x1ZGVzIiwiRXJyb3IiLCJtZWFzdXJlRGlzcGxheU1vZGUiLCJ0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5IiwiYmxvY2tFdmVudCIsInByb3BzIiwicmVhZE9ubHkiLCJ1bmRlZmluZWQiLCJlZGl0TW9kZUV4cHJlc3Npb24iLCJjb21waWxlRXhwcmVzc2lvbiIsImlmRWxzZSIsImVxdWFsIiwicmVzb2x2ZUJpbmRpbmdTdHJpbmciLCJnZXRGb3JtYXRPcHRpb25zIiwieG1sIiwiZm9ybWF0T3B0aW9ucyIsInRleHRMaW5lc0VkaXQiLCJ0ZXh0TWF4TGluZXMiLCJ0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXkiLCJ0ZXh0TWF4TGVuZ3RoIiwid3JpdGVEYXRlRm9ybWF0T3B0aW9ucyIsInNob3dUaW1lIiwic2hvd0RhdGUiLCJzaG93VGltZXpvbmUiLCJnZXRQb3NzaWJsZVZhbHVlSGVscFRlbXBsYXRlIiwidmhwIiwiRmllbGRIZWxwZXIiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsIm1ldGFQYXRoIiwidmhwQ3R4IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImhhc1ZhbHVlSGVscEFubm90YXRpb25zIiwiaGFzVmFsdWVIZWxwQW5ub3RhdGlvbiIsImdldE9iamVjdCIsImlkIiwiY29udGV4dFBhdGgiLCJnZXRUZW1wbGF0ZSIsImNvbnRleHRQYXRoUGF0aCIsImdldFBhdGgiLCJtZXRhUGF0aFBhdGgiLCJjaGFuZ2UiLCJzZW1hbnRpY09iamVjdCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQdWJsaWNGaWVsZC5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgYmxvY2tFdmVudCwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGVxdWFsLCBpZkVsc2UsIHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbnR5cGUgRmllbGRGb3JtYXRPcHRpb25zID0ge1xuXHRkaXNwbGF5TW9kZT86IHN0cmluZztcblx0bWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nO1xuXHR0ZXh0TGluZXNFZGl0PzogbnVtYmVyO1xuXHR0ZXh0TWF4TGluZXM/OiBudW1iZXI7XG5cdHRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheT86IG51bWJlcjtcblx0dGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheT86IHN0cmluZztcblx0dGV4dE1heExlbmd0aD86IG51bWJlcjtcblx0c2hvd0RhdGU/OiBib29sZWFuO1xuXHRzaG93VGltZT86IGJvb2xlYW47XG5cdHNob3dUaW1lem9uZT86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFB1YmxpYyBleHRlcm5hbCBmaWVsZCByZXByZXNlbnRhdGlvblxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRmllbGRcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1YmxpY0ZpZWxkQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBUaGUgJ2lkJyBwcm9wZXJ0eVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIG1ldGEgcGF0aCBwcm92aWRlZCBmb3IgdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgbWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBUaGUgY29udGV4dCBwYXRoIHByb3ZpZGVkIGZvciB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHJlcXVpcmVkOiB0cnVlXG5cdH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoZSByZWFkT25seSBmbGFnXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUsIHJlcXVpcmVkOiBmYWxzZSB9KVxuXHRwdWJsaWMgcmVhZE9ubHk/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgc2VtYW50aWMgb2JqZWN0IGFzc29jaWF0ZWQgdG8gdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdH0pXG5cdHB1YmxpYyBzZW1hbnRpY09iamVjdD86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGVkaXQgbW9kZSBleHByZXNzaW9uIGZvciB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRyZXF1aXJlZDogZmFsc2Vcblx0fSlcblx0cHVibGljIGVkaXRNb2RlRXhwcmVzc2lvbj87XG5cblx0LyoqXG5cdCAqIFRoZSBvYmplY3Qgd2l0aCB0aGUgZm9ybWF0dGluZyBvcHRpb25zXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChmb3JtYXRPcHRpb25zSW5wdXQ6IEZpZWxkRm9ybWF0T3B0aW9ucykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGUgJiZcblx0XHRcdFx0IVtcIlZhbHVlXCIsIFwiRGVzY3JpcHRpb25cIiwgXCJWYWx1ZURlc2NyaXB0aW9uXCIsIFwiRGVzY3JpcHRpb25WYWx1ZVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGUpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlfSBmb3IgZGlzcGxheU1vZGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGZvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGUgJiYgIVtcIkhpZGRlblwiLCBcIlJlYWRPbmx5XCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGV9IGZvciBtZWFzdXJlRGlzcGxheU1vZGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSAmJlxuXHRcdFx0XHQhW1wiSW5QbGFjZVwiLCBcIlBvcG92ZXJcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LnRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LnRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXl9IGZvciB0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5IGRvZXMgbm90IG1hdGNoYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm9ybWF0T3B0aW9uc0lucHV0O1xuXHRcdH1cblx0fSlcblx0cHVibGljIGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBUaGUgZ2VuZXJpYyBjaGFuZ2UgZXZlbnRcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0Y2hhbmdlPzogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8UHVibGljRmllbGRCbG9jaz4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHRpZiAodGhpcy5yZWFkT25seSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmVkaXRNb2RlRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRpZkVsc2UoZXF1YWwocmVzb2x2ZUJpbmRpbmdTdHJpbmcodGhpcy5yZWFkT25seSwgXCJib29sZWFuXCIpLCB0cnVlKSwgXCJEaXNwbGF5XCIsIFwiRWRpdGFibGVcIilcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGludGVybmFsIGZvcm1hdE9wdGlvbnMgZm9yIHRoZSBidWlsZGluZyBibG9jay5cblx0ICpcblx0ICogQHJldHVybnMgQSBzdHJpbmcgd2l0aCB0aGUgaW50ZXJuYWwgZm9ybWF0T3B0aW9ucyBmb3IgdGhlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqL1xuXHRnZXRGb3JtYXRPcHRpb25zKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHhtbGBcblx0XHQ8aW50ZXJuYWxNYWNybzpmb3JtYXRPcHRpb25zXG5cdFx0XHR0ZXh0QWxpZ25Nb2RlPVwiRm9ybVwiXG5cdFx0XHRzaG93RW1wdHlJbmRpY2F0b3I9XCJ0cnVlXCJcblx0XHRcdGRpc3BsYXlNb2RlPVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGV9XCJcblx0XHRcdG1lYXN1cmVEaXNwbGF5TW9kZT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZX1cIlxuXHRcdFx0dGV4dExpbmVzRWRpdD1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXR9XCJcblx0XHRcdHRleHRNYXhMaW5lcz1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnRleHRNYXhMaW5lc31cIlxuXHRcdFx0dGV4dE1heENoYXJhY3RlcnNEaXNwbGF5PVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMudGV4dE1heENoYXJhY3RlcnNEaXNwbGF5fVwiXG5cdFx0XHR0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5PVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheX1cIlxuXHRcdFx0dGV4dE1heExlbmd0aD1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnRleHRNYXhMZW5ndGh9XCJcblx0XHRcdD5cblx0XHRcdCR7dGhpcy53cml0ZURhdGVGb3JtYXRPcHRpb25zKCl9XG5cdFx0PC9pbnRlcm5hbE1hY3JvOmZvcm1hdE9wdGlvbnM+XG5cdFx0XHRgO1xuXHR9XG5cblx0d3JpdGVEYXRlRm9ybWF0T3B0aW9ucygpOiBzdHJpbmcge1xuXHRcdGlmICh0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd1RpbWUgfHwgdGhpcy5mb3JtYXRPcHRpb25zLnNob3dEYXRlIHx8IHRoaXMuZm9ybWF0T3B0aW9ucy5zaG93VGltZXpvbmUpIHtcblx0XHRcdHJldHVybiB4bWxgPGludGVybmFsTWFjcm86ZGF0ZUZvcm1hdE9wdGlvbnMgc2hvd1RpbWU9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy5zaG93VGltZX1cIlxuXHRcdFx0XHRzaG93RGF0ZT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnNob3dEYXRlfVwiXG5cdFx0XHRcdHNob3dUaW1lem9uZT1cIiR7dGhpcy5mb3JtYXRPcHRpb25zLnNob3dUaW1lem9uZX1cIlxuXHRcdFx0XHQvPmA7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmdW5jdGlvbiBjYWxjdWxhdGVzIHRoZSBjb3JyZXNwb25kaW5nIFZhbHVlSGVscCBmaWVsZCBpbiBjYXNlIGl0wrRzXG5cdCAqIGRlZmluZWQgZm9yIHRoZSBzcGVjaWZpYyBjb250cm9sLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggYSBwb3NzaWJsZSBWYWx1ZUhlbHAgY29udHJvbC5cblx0ICovXG5cdGdldFBvc3NpYmxlVmFsdWVIZWxwVGVtcGxhdGUoKTogc3RyaW5nIHtcblx0XHRjb25zdCB2aHAgPSBGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eSh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCB2aHBDdHggPSB0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQodmhwLCB0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCBoYXNWYWx1ZUhlbHBBbm5vdGF0aW9ucyA9IEZpZWxkSGVscGVyLmhhc1ZhbHVlSGVscEFubm90YXRpb24odmhwQ3R4LmdldE9iamVjdChcIkBcIikpO1xuXHRcdGlmIChoYXNWYWx1ZUhlbHBBbm5vdGF0aW9ucykge1xuXHRcdFx0Ly8gZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhpcyBvbmUgaGFzIGEgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGluY2x1ZGVkLCBhZGQgdGhlIGRlcGVuZGVudFxuXHRcdFx0cmV0dXJuIHhtbGBcblx0XHRcdDxpbnRlcm5hbE1hY3JvOmRlcGVuZGVudHM+XG5cdFx0XHRcdDxtYWNyb3M6VmFsdWVIZWxwIF9mbGV4SWQ9XCIke3RoaXMuaWR9LWNvbnRlbnRfRmllbGRWYWx1ZUhlbHBcIiBwcm9wZXJ0eT1cIiR7dmhwQ3R4fVwiIGNvbnRleHRQYXRoPVwiJHt0aGlzLmNvbnRleHRQYXRofVwiIC8+XG5cdFx0XHQ8L2ludGVybmFsTWFjcm86ZGVwZW5kZW50cz5gO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgdGVtcGxhdGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZmllbGQgY29udHJvbFxuXHQgKi9cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgY29udGV4dFBhdGhQYXRoID0gdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCk7XG5cdFx0Y29uc3QgbWV0YVBhdGhQYXRoID0gdGhpcy5tZXRhUGF0aC5nZXRQYXRoKCk7XG5cdFx0cmV0dXJuIHhtbGBcblx0XHQ8aW50ZXJuYWxNYWNybzpGaWVsZFxuXHRcdFx0eG1sbnM6aW50ZXJuYWxNYWNybz1cInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxuXHRcdFx0ZW50aXR5U2V0PVwiJHtjb250ZXh0UGF0aFBhdGh9XCJcblx0XHRcdGRhdGFGaWVsZD1cIiR7bWV0YVBhdGhQYXRofVwiXG5cdFx0XHRlZGl0TW9kZT1cIiR7dGhpcy5lZGl0TW9kZUV4cHJlc3Npb259XCJcblx0XHRcdG9uQ2hhbmdlPVwiJHt0aGlzLmNoYW5nZX1cIlxuXHRcdFx0X2ZsZXhJZD1cIiR7dGhpcy5pZH1cIlxuXHRcdFx0c2VtYW50aWNPYmplY3Q9XCIke3RoaXMuc2VtYW50aWNPYmplY3R9XCJcblx0XHQ+XG5cdFx0XHQke3RoaXMuZ2V0Rm9ybWF0T3B0aW9ucygpfVxuXHRcdFx0JHt0aGlzLmdldFBvc3NpYmxlVmFsdWVIZWxwVGVtcGxhdGUoKX1cblx0XHQ8L2ludGVybmFsTWFjcm86RmllbGQ+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTRCcUJBLGdCQUFnQjtFQVByQztBQUNBO0FBQ0E7RUFGQSxPQUdDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLE9BQU87SUFDYkMsZUFBZSxFQUFFO0VBQ2xCLENBQUMsQ0FBQyxVQUtBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBTWxFSCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFFBQVEsRUFBRTtF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