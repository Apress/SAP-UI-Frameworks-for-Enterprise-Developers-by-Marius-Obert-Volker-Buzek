/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/controls/CommandExecution", "sap/fe/core/helpers/FPMHelper", "sap/m/Button", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, CommandExecution, FPMHelper, Button, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomActionBlock = (_dec = defineBuildingBlock({
    name: "CustomAction",
    namespace: "sap.fe.macros.actions"
  }), _dec2 = blockAttribute({
    type: "object",
    required: true
  }), _dec3 = blockAttribute({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(CustomActionBlock, _RuntimeBuildingBlock);
    function CustomActionBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "action", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    _exports = CustomActionBlock;
    var _proto = CustomActionBlock.prototype;
    _proto.getContent = function getContent() {
      return _jsx(Button, {
        id: this.id,
        text: this.action.text ?? "",
        press: this.action.command ? CommandExecution.executeCommand(this.action.command) : async event => FPMHelper.actionWrapper(event, this.action.handlerModule, this.action.handlerMethod, {}),
        type: "Transparent",
        visible: this.action.visible,
        enabled: this.action.enabled
      });
    };
    return CustomActionBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "action", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CustomActionBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21BY3Rpb25CbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRDb250ZW50IiwiaWQiLCJhY3Rpb24iLCJ0ZXh0IiwiY29tbWFuZCIsIkNvbW1hbmRFeGVjdXRpb24iLCJleGVjdXRlQ29tbWFuZCIsImV2ZW50IiwiRlBNSGVscGVyIiwiYWN0aW9uV3JhcHBlciIsImhhbmRsZXJNb2R1bGUiLCJoYW5kbGVyTWV0aG9kIiwidmlzaWJsZSIsImVuYWJsZWQiLCJSdW50aW1lQnVpbGRpbmdCbG9jayJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ3VzdG9tQWN0aW9uLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IENvbW1hbmRFeGVjdXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0NvbW1hbmRFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIHsgQ3VzdG9tQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IEZQTUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiQ3VzdG9tQWN0aW9uXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmFjdGlvbnNcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tQWN0aW9uQmxvY2sgZXh0ZW5kcyBSdW50aW1lQnVpbGRpbmdCbG9jayB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdGFjdGlvbiE6IEN1c3RvbUFjdGlvbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0aWQhOiBzdHJpbmc7XG5cblx0Z2V0Q29udGVudCgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRpZD17dGhpcy5pZH1cblx0XHRcdFx0dGV4dD17dGhpcy5hY3Rpb24udGV4dCA/PyBcIlwifVxuXHRcdFx0XHRwcmVzcz17XG5cdFx0XHRcdFx0dGhpcy5hY3Rpb24uY29tbWFuZFxuXHRcdFx0XHRcdFx0PyBDb21tYW5kRXhlY3V0aW9uLmV4ZWN1dGVDb21tYW5kKHRoaXMuYWN0aW9uLmNvbW1hbmQpXG5cdFx0XHRcdFx0XHQ6IGFzeW5jIChldmVudCkgPT4gRlBNSGVscGVyLmFjdGlvbldyYXBwZXIoZXZlbnQsIHRoaXMuYWN0aW9uLmhhbmRsZXJNb2R1bGUsIHRoaXMuYWN0aW9uLmhhbmRsZXJNZXRob2QsIHt9KVxuXHRcdFx0XHR9XG5cdFx0XHRcdHR5cGU9XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRcdHZpc2libGU9e3RoaXMuYWN0aW9uLnZpc2libGV9XG5cdFx0XHRcdGVuYWJsZWQ9e3RoaXMuYWN0aW9uLmVuYWJsZWR9XG5cdFx0XHQvPlxuXHRcdCkgYXMgQnV0dG9uO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O01BUXFCQSxpQkFBaUIsV0FEckNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxjQUFjO0lBQUVDLFNBQVMsRUFBRTtFQUF3QixDQUFDLENBQUMsVUFFaEZDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHbERGLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLE9BR0ZDLFVBQVUsR0FBVixzQkFBYTtNQUNaLE9BQ0MsS0FBQyxNQUFNO1FBQ04sRUFBRSxFQUFFLElBQUksQ0FBQ0MsRUFBRztRQUNaLElBQUksRUFBRSxJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxJQUFJLEVBQUc7UUFDN0IsS0FBSyxFQUNKLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxPQUFPLEdBQ2hCQyxnQkFBZ0IsQ0FBQ0MsY0FBYyxDQUFDLElBQUksQ0FBQ0osTUFBTSxDQUFDRSxPQUFPLENBQUMsR0FDcEQsTUFBT0csS0FBSyxJQUFLQyxTQUFTLENBQUNDLGFBQWEsQ0FBQ0YsS0FBSyxFQUFFLElBQUksQ0FBQ0wsTUFBTSxDQUFDUSxhQUFhLEVBQUUsSUFBSSxDQUFDUixNQUFNLENBQUNTLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FDM0c7UUFDRCxJQUFJLEVBQUMsYUFBYTtRQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDVCxNQUFNLENBQUNVLE9BQVE7UUFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQ1YsTUFBTSxDQUFDVztNQUFRLEVBQzVCO0lBRUosQ0FBQztJQUFBO0VBQUEsRUF6QjZDQyxvQkFBb0I7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9