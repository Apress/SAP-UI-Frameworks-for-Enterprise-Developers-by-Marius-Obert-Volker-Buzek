/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var _exports = {};
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomFragmentBlock = (
  /**
   * Content of a custom fragment
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "CustomFragment",
    namespace: "sap.fe.macros.fpm"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: false
  }), _dec4 = blockAttribute({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(CustomFragmentBlock, _BuildingBlockBase);
    function CustomFragmentBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fragmentName", _descriptor3, _assertThisInitialized(_this));
      return _this;
    }
    _exports = CustomFragmentBlock;
    var _proto = CustomFragmentBlock.prototype;
    /**
     * The building block template function.
     *
     * @returns An XML-based string
     */
    _proto.getTemplate = function getTemplate() {
      const fragmentInstanceName = this.fragmentName + "-JS".replace(/\//g, ".");
      return xml`<core:Fragment
			xmlns:compo="http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1"
			fragmentName="${fragmentInstanceName}"
			id="${this.id}"
			type="CUSTOM"
		>
			<compo:fragmentContent>
				<core:FragmentDefinition>
					<core:Fragment fragmentName="${this.fragmentName}" type="XML" />
				</core:FragmentDefinition>
			</compo:fragmentContent>
		</core:Fragment>`;
    };
    return CustomFragmentBlock;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "fragmentName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CustomFragmentBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21GcmFnbWVudEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImdldFRlbXBsYXRlIiwiZnJhZ21lbnRJbnN0YW5jZU5hbWUiLCJmcmFnbWVudE5hbWUiLCJyZXBsYWNlIiwieG1sIiwiaWQiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ3VzdG9tRnJhZ21lbnQuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuXG4vKipcbiAqIENvbnRlbnQgb2YgYSBjdXN0b20gZnJhZ21lbnRcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiQ3VzdG9tRnJhZ21lbnRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuZnBtXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXN0b21GcmFnbWVudEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogSUQgb2YgdGhlIGN1c3RvbSBmcmFnbWVudFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDb250ZXh0IFBhdGhcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IGZhbHNlIH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aD86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqICBOYW1lIG9mIHRoZSBjdXN0b20gZnJhZ21lbnRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBmcmFnbWVudE5hbWUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZ1xuXHQgKi9cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgZnJhZ21lbnRJbnN0YW5jZU5hbWUgPSB0aGlzLmZyYWdtZW50TmFtZSArIFwiLUpTXCIucmVwbGFjZSgvXFwvL2csIFwiLlwiKTtcblxuXHRcdHJldHVybiB4bWxgPGNvcmU6RnJhZ21lbnRcblx0XHRcdHhtbG5zOmNvbXBvPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLnhtbGNvbXBvc2l0ZS8xXCJcblx0XHRcdGZyYWdtZW50TmFtZT1cIiR7ZnJhZ21lbnRJbnN0YW5jZU5hbWV9XCJcblx0XHRcdGlkPVwiJHt0aGlzLmlkfVwiXG5cdFx0XHR0eXBlPVwiQ1VTVE9NXCJcblx0XHQ+XG5cdFx0XHQ8Y29tcG86ZnJhZ21lbnRDb250ZW50PlxuXHRcdFx0XHQ8Y29yZTpGcmFnbWVudERlZmluaXRpb24+XG5cdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwiJHt0aGlzLmZyYWdtZW50TmFtZX1cIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0PC9jb3JlOkZyYWdtZW50RGVmaW5pdGlvbj5cblx0XHRcdDwvY29tcG86ZnJhZ21lbnRDb250ZW50PlxuXHRcdDwvY29yZTpGcmFnbWVudD5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztNQWVxQkEsbUJBQW1CO0VBVnhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLE9BTUNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsZ0JBQWdCO0lBQ3RCQyxTQUFTLEVBQUU7RUFDWixDQUFDLENBQUMsVUFLQUMsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU1sREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBTWpFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUduRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkMsT0FLQUMsV0FBVyxHQUFYLHVCQUFjO01BQ2IsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDQyxZQUFZLEdBQUcsS0FBSyxDQUFDQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztNQUUxRSxPQUFPQyxHQUFJO0FBQ2I7QUFDQSxtQkFBbUJILG9CQUFxQjtBQUN4QyxTQUFTLElBQUksQ0FBQ0ksRUFBRztBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxJQUFJLENBQUNILFlBQWE7QUFDdEQ7QUFDQTtBQUNBLG1CQUFtQjtJQUNsQixDQUFDO0lBQUE7RUFBQSxFQXZDK0NJLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9