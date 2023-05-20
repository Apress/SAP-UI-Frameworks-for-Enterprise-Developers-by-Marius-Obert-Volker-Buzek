/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/helpers/ClassSupport", "sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/Title", "sap/ui/core/Core", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, ClassSupport, Bar, Button, Dialog, Title, Core, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const macroResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
  /**
   * Known limitations for the first tryout as mentioned in git 5806442
   *  - functional block dependency
   * 	- questionable parameters will be refactored
   */
  let OperationsDialogBlock = (_dec = defineBuildingBlock({
    name: "OperationsDialog",
    namespace: "sap.fe.core.controllerextensions"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "object",
    required: true
  }), _dec5 = defineReference(), _dec6 = blockAttribute({
    type: "boolean",
    required: true
  }), _dec7 = blockAttribute({
    type: "function"
  }), _dec8 = blockAttribute({
    type: "object",
    required: true
  }), _dec9 = blockAttribute({
    type: "string",
    required: true
  }), _dec10 = blockAttribute({
    type: "string",
    required: true
  }), _dec11 = blockAttribute({
    type: "string",
    required: true
  }), _dec12 = blockAttribute({
    type: "object",
    required: true
  }), _dec13 = blockAttribute({
    type: "object"
  }), _dec14 = blockAttribute({
    type: "object"
  }), _dec15 = blockAttribute({
    type: "object",
    required: true
  }), _dec16 = blockAttribute({
    type: "boolean"
  }), _dec17 = blockAttribute({
    type: "function"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(OperationsDialogBlock, _RuntimeBuildingBlock);
    function OperationsDialogBlock(props) {
      var _this;
      _this = _RuntimeBuildingBlock.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageObject", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "operationsDialog", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isMultiContext412", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "resolve", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "model", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groupId", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actionName", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "cancelButtonTxt", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "strictHandlingPromises", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "strictHandlingUtilities", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageDialogModel", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isGrouped", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessageInfo", _descriptor16, _assertThisInitialized(_this));
      return _this;
    }

    /*
     * The 'id' property of the dialog
     */
    _exports = OperationsDialogBlock;
    var _proto = OperationsDialogBlock.prototype;
    _proto.open = function open() {
      var _this$operationsDialo;
      this.getContent();
      (_this$operationsDialo = this.operationsDialog.current) === null || _this$operationsDialo === void 0 ? void 0 : _this$operationsDialo.open();
    };
    _proto.getBeginButton = function getBeginButton() {
      return new Button({
        press: () => {
          if (!(this.isMultiContext412 ?? false)) {
            var _this$resolve;
            (_this$resolve = this.resolve) === null || _this$resolve === void 0 ? void 0 : _this$resolve.call(this, true);
            this.model.submitBatch(this.groupId);
          } else {
            var _this$strictHandlingU;
            this.strictHandlingPromises.forEach(strictHandlingPromise => {
              strictHandlingPromise.resolve(true);
              this.model.submitBatch(strictHandlingPromise.groupId);
              if (strictHandlingPromise.requestSideEffects) {
                strictHandlingPromise.requestSideEffects();
              }
            });
            const strictHandlingFails = (_this$strictHandlingU = this.strictHandlingUtilities) === null || _this$strictHandlingU === void 0 ? void 0 : _this$strictHandlingU.strictHandlingTransitionFails;
            if (strictHandlingFails && strictHandlingFails.length > 0) {
              var _this$messageHandler;
              (_this$messageHandler = this.messageHandler) === null || _this$messageHandler === void 0 ? void 0 : _this$messageHandler.removeTransitionMessages();
            }
            if (this.strictHandlingUtilities) {
              this.strictHandlingUtilities.strictHandlingWarningMessages = [];
            }
          }
          if (this.strictHandlingUtilities) {
            this.strictHandlingUtilities.is412Executed = true;
          }
          this.messageDialogModel.setData({});
          this.close();
        },
        type: "Emphasized",
        text: this.actionName
      });
    };
    _proto.close = function close() {
      var _this$operationsDialo2;
      (_this$operationsDialo2 = this.operationsDialog.current) === null || _this$operationsDialo2 === void 0 ? void 0 : _this$operationsDialo2.close();
    };
    _proto.getTitle = function getTitle() {
      const sTitle = macroResourceBundle.getText("M_WARNINGS");
      return new Title({
        text: sTitle
      });
    };
    _proto.getEndButton = function getEndButton() {
      return new Button({
        press: () => {
          if (this.strictHandlingUtilities) {
            this.strictHandlingUtilities.strictHandlingWarningMessages = [];
            this.strictHandlingUtilities.is412Executed = false;
          }
          if (!(this.isMultiContext412 ?? false)) {
            this.resolve(false);
          } else {
            this.strictHandlingPromises.forEach(function (strictHandlingPromise) {
              strictHandlingPromise.resolve(false);
            });
          }
          this.messageDialogModel.setData({});
          this.close();
          if (this.isGrouped ?? false) {
            this.showMessageInfo();
          }
        },
        text: this.cancelButtonTxt
      });
    }

    /**
     * The building block render function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getContent = function getContent() {
      return _jsx(Dialog, {
        id: this.id,
        ref: this.operationsDialog,
        resizable: true,
        content: this.messageObject.oMessageView,
        state: "Warning",
        customHeader: new Bar({
          contentLeft: [this.messageObject.oBackButton],
          contentMiddle: [this.getTitle()]
        }),
        contentHeight: "50%",
        contentWidth: "50%",
        verticalScrolling: false,
        beginButton: this.getBeginButton(),
        endButton: this.getEndButton()
      });
    };
    return OperationsDialogBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "Dialog Standard Title";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "messageObject", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "operationsDialog", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "isMultiContext412", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "resolve", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "model", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "actionName", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "cancelButtonTxt", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "strictHandlingPromises", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "strictHandlingUtilities", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "messageDialogModel", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "isGrouped", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "showMessageInfo", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = OperationsDialogBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYWNyb1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIk9wZXJhdGlvbnNEaWFsb2dCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJyZXF1aXJlZCIsImRlZmluZVJlZmVyZW5jZSIsInByb3BzIiwib3BlbiIsImdldENvbnRlbnQiLCJvcGVyYXRpb25zRGlhbG9nIiwiY3VycmVudCIsImdldEJlZ2luQnV0dG9uIiwiQnV0dG9uIiwicHJlc3MiLCJpc011bHRpQ29udGV4dDQxMiIsInJlc29sdmUiLCJtb2RlbCIsInN1Ym1pdEJhdGNoIiwiZ3JvdXBJZCIsInN0cmljdEhhbmRsaW5nUHJvbWlzZXMiLCJmb3JFYWNoIiwic3RyaWN0SGFuZGxpbmdQcm9taXNlIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwic3RyaWN0SGFuZGxpbmdGYWlscyIsInN0cmljdEhhbmRsaW5nVXRpbGl0aWVzIiwic3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMiLCJsZW5ndGgiLCJtZXNzYWdlSGFuZGxlciIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsInN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzIiwiaXM0MTJFeGVjdXRlZCIsIm1lc3NhZ2VEaWFsb2dNb2RlbCIsInNldERhdGEiLCJjbG9zZSIsInRleHQiLCJhY3Rpb25OYW1lIiwiZ2V0VGl0bGUiLCJzVGl0bGUiLCJnZXRUZXh0IiwiVGl0bGUiLCJnZXRFbmRCdXR0b24iLCJpc0dyb3VwZWQiLCJzaG93TWVzc2FnZUluZm8iLCJjYW5jZWxCdXR0b25UeHQiLCJpZCIsIm1lc3NhZ2VPYmplY3QiLCJvTWVzc2FnZVZpZXciLCJCYXIiLCJjb250ZW50TGVmdCIsIm9CYWNrQnV0dG9uIiwiY29udGVudE1pZGRsZSIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJPcGVyYXRpb25zRGlhbG9nLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBSZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvanN4XCI7XG5pbXBvcnQgQmFyIGZyb20gXCJzYXAvbS9CYXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgVGl0bGUgZnJvbSBcInNhcC9tL1RpdGxlXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCIuLi9NZXNzYWdlSGFuZGxlclwiO1xuXG50eXBlIFN0cmljdEhhbmRsaW5nUHJvbWlzZSA9IHtcblx0Ly9UT0RPOiBtb3ZlIHRvIHNvbWV3aGVyZSBlbHNlXG5cdHJlc29sdmU6IEZ1bmN0aW9uO1xuXHRncm91cElkOiBzdHJpbmc7XG5cdHJlcXVlc3RTaWRlRWZmZWN0cz86IEZ1bmN0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgPSB7XG5cdC8vVE9ETzogbW92ZSB0byBzb21ld2hlcmUgZWxzZVxuXHRpczQxMkV4ZWN1dGVkOiBib29sZWFuO1xuXHRzdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlsczogT2JqZWN0W107XG5cdHN0cmljdEhhbmRsaW5nUHJvbWlzZXM6IFN0cmljdEhhbmRsaW5nUHJvbWlzZVtdO1xuXHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogTWVzc2FnZVtdO1xuXHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogTWVzc2FnZVtdO1xuXHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBzdHJpbmdbXTtcbn07XG5cbmNvbnN0IG1hY3JvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG4vKipcbiAqIEtub3duIGxpbWl0YXRpb25zIGZvciB0aGUgZmlyc3QgdHJ5b3V0IGFzIG1lbnRpb25lZCBpbiBnaXQgNTgwNjQ0MlxuICogIC0gZnVuY3Rpb25hbCBibG9jayBkZXBlbmRlbmN5XG4gKiBcdC0gcXVlc3Rpb25hYmxlIHBhcmFtZXRlcnMgd2lsbCBiZSByZWZhY3RvcmVkXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJPcGVyYXRpb25zRGlhbG9nXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9uc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3BlcmF0aW9uc0RpYWxvZ0Jsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPE9wZXJhdGlvbnNEaWFsb2dCbG9jaz4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdH1cblxuXHQvKlxuXHQgKiBUaGUgJ2lkJyBwcm9wZXJ0eSBvZiB0aGUgZGlhbG9nXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgJ3RpdGxlJyBwcm9wZXJ0eSBvZiB0aGUgRGlhbG9nO1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRwdWJsaWMgdGl0bGU/OiBzdHJpbmcgPSBcIkRpYWxvZyBTdGFuZGFyZCBUaXRsZVwiO1xuXG5cdC8qKlxuXHQgKiBUaGUgbWVzc2FnZSBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byB0aGlzIGRpYWxvZ1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiwgcmVxdWlyZWQ6IHRydWUgfSkgLy9UT0RPOiBjcmVhdGUgdGhlIHR5cGVcblx0cHVibGljIG1lc3NhZ2VPYmplY3Q/OiBhbnkgPSBcIlwiO1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRvcGVyYXRpb25zRGlhbG9nITogUmVmPERpYWxvZz47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBpc011bHRpQ29udGV4dDQxMj86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJmdW5jdGlvblwiIH0pXG5cdHB1YmxpYyByZXNvbHZlPzogRnVuY3Rpb247XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0cHVibGljIG1vZGVsITogT0RhdGFNb2RlbDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgZ3JvdXBJZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgYWN0aW9uTmFtZSE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgY2FuY2VsQnV0dG9uVHh0ITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBzdHJpY3RIYW5kbGluZ1Byb21pc2VzITogU3RyaWN0SGFuZGxpbmdQcm9taXNlW107XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRwdWJsaWMgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllcztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdHB1YmxpYyBtZXNzYWdlSGFuZGxlcj86IE1lc3NhZ2VIYW5kbGVyO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBtZXNzYWdlRGlhbG9nTW9kZWwhOiBKU09OTW9kZWw7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cHVibGljIGlzR3JvdXBlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJmdW5jdGlvblwiIH0pXG5cdHB1YmxpYyBzaG93TWVzc2FnZUluZm8/OiBGdW5jdGlvbjtcblxuXHRwdWJsaWMgb3BlbigpIHtcblx0XHR0aGlzLmdldENvbnRlbnQoKTtcblx0XHR0aGlzLm9wZXJhdGlvbnNEaWFsb2cuY3VycmVudD8ub3BlbigpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRCZWdpbkJ1dHRvbigpIHtcblx0XHRyZXR1cm4gbmV3IEJ1dHRvbih7XG5cdFx0XHRwcmVzczogKCkgPT4ge1xuXHRcdFx0XHRpZiAoISh0aGlzLmlzTXVsdGlDb250ZXh0NDEyID8/IGZhbHNlKSkge1xuXHRcdFx0XHRcdHRoaXMucmVzb2x2ZT8uKHRydWUpO1xuXHRcdFx0XHRcdHRoaXMubW9kZWwuc3VibWl0QmF0Y2godGhpcy5ncm91cElkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMuZm9yRWFjaCgoc3RyaWN0SGFuZGxpbmdQcm9taXNlOiBTdHJpY3RIYW5kbGluZ1Byb21pc2UpID0+IHtcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdFx0XHRcdFx0dGhpcy5tb2RlbC5zdWJtaXRCYXRjaChzdHJpY3RIYW5kbGluZ1Byb21pc2UuZ3JvdXBJZCk7XG5cdFx0XHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdQcm9taXNlLnJlcXVlc3RTaWRlRWZmZWN0cykge1xuXHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1Byb21pc2UucmVxdWVzdFNpZGVFZmZlY3RzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Y29uc3Qgc3RyaWN0SGFuZGxpbmdGYWlscyA9IHRoaXMuc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/LnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzO1xuXHRcdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ0ZhaWxzICYmIHN0cmljdEhhbmRsaW5nRmFpbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0dGhpcy5tZXNzYWdlSGFuZGxlcj8ucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aGlzLnN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLnN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0dGhpcy5zdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLm1lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKHt9KTtcblx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0fSxcblx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0dGV4dDogdGhpcy5hY3Rpb25OYW1lXG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGNsb3NlKCkge1xuXHRcdHRoaXMub3BlcmF0aW9uc0RpYWxvZy5jdXJyZW50Py5jbG9zZSgpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRUaXRsZSgpIHtcblx0XHRjb25zdCBzVGl0bGUgPSBtYWNyb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1dBUk5JTkdTXCIpO1xuXHRcdHJldHVybiBuZXcgVGl0bGUoeyB0ZXh0OiBzVGl0bGUgfSk7XG5cdH1cblxuXHRwcml2YXRlIGdldEVuZEJ1dHRvbigpIHtcblx0XHRyZXR1cm4gbmV3IEJ1dHRvbih7XG5cdFx0XHRwcmVzczogKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5zdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdFx0XHRcdHRoaXMuc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMgPSBbXTtcblx0XHRcdFx0XHR0aGlzLnN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmlzNDEyRXhlY3V0ZWQgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoISh0aGlzLmlzTXVsdGlDb250ZXh0NDEyID8/IGZhbHNlKSkge1xuXHRcdFx0XHRcdHRoaXMucmVzb2x2ZSEoZmFsc2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdHJpY3RIYW5kbGluZ1Byb21pc2U6IFN0cmljdEhhbmRsaW5nUHJvbWlzZSkge1xuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubWVzc2FnZURpYWxvZ01vZGVsLnNldERhdGEoe30pO1xuXHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdGlmICh0aGlzLmlzR3JvdXBlZCA/PyBmYWxzZSkge1xuXHRcdFx0XHRcdHRoaXMuc2hvd01lc3NhZ2VJbmZvISgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0dGV4dDogdGhpcy5jYW5jZWxCdXR0b25UeHRcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYnVpbGRpbmcgYmxvY2sgcmVuZGVyIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldENvbnRlbnQoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxEaWFsb2dcblx0XHRcdFx0aWQ9e3RoaXMuaWR9XG5cdFx0XHRcdHJlZj17dGhpcy5vcGVyYXRpb25zRGlhbG9nfVxuXHRcdFx0XHRyZXNpemFibGU9e3RydWV9XG5cdFx0XHRcdGNvbnRlbnQ9e3RoaXMubWVzc2FnZU9iamVjdC5vTWVzc2FnZVZpZXd9XG5cdFx0XHRcdHN0YXRlPXtcIldhcm5pbmdcIn1cblx0XHRcdFx0Y3VzdG9tSGVhZGVyPXtcblx0XHRcdFx0XHRuZXcgQmFyKHtcblx0XHRcdFx0XHRcdGNvbnRlbnRMZWZ0OiBbdGhpcy5tZXNzYWdlT2JqZWN0Lm9CYWNrQnV0dG9uXSxcblx0XHRcdFx0XHRcdGNvbnRlbnRNaWRkbGU6IFt0aGlzLmdldFRpdGxlKCldXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250ZW50SGVpZ2h0PXtcIjUwJVwifVxuXHRcdFx0XHRjb250ZW50V2lkdGg9e1wiNTAlXCJ9XG5cdFx0XHRcdHZlcnRpY2FsU2Nyb2xsaW5nPXtmYWxzZX1cblx0XHRcdFx0YmVnaW5CdXR0b249e3RoaXMuZ2V0QmVnaW5CdXR0b24oKX1cblx0XHRcdFx0ZW5kQnV0dG9uPXt0aGlzLmdldEVuZEJ1dHRvbigpfVxuXHRcdFx0PjwvRGlhbG9nPlxuXHRcdCk7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBZ0NBLE1BQU1BLG1CQUFtQixHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQztFQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBSkEsSUFTcUJDLHFCQUFxQixXQUp6Q0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxrQkFBa0I7SUFDeEJDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQVNBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBTWxFSCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBTWxDRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUUsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2xEQyxlQUFlLEVBQUUsVUFHakJKLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRSxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHbkRILGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVyxDQUFDLENBQUMsVUFHcENELGNBQWMsQ0FBQztJQUFF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LEVBQUU7VUFDWixJQUFJLElBQUksQ0FBQ1EsU0FBUyxJQUFJLEtBQUssRUFBRTtZQUM1QixJQUFJLENBQUNDLGVBQWUsRUFBRztVQUN4QjtRQUNELENBQUM7UUFDRFIsSUFBSSxFQUFFLElBQUksQ0FBQ1M7TUFDWixDQUFDLENBQUM7SUFDSDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBbkMsVUFBVSxHQUFWLHNCQUFhO01BQ1osT0FDQyxLQUFDLE1BQU07UUFDTixFQUFFLEVBQUUsSUFBSSxDQUFDb0MsRUFBRztRQUNaLEdBQUcsRUFBRSxJQUFJLENBQUNuQyxnQkFBaUI7UUFDM0IsU0FBUyxFQUFFLElBQUs7UUFDaEIsT0FBTyxFQUFFLElBQUksQ0FBQ29DLGFBQWEsQ0FBQ0MsWUFBYTtRQUN6QyxLQUFLLEVBQUUsU0FBVTtRQUNqQixZQUFZLEVBQ1gsSUFBSUMsR0FBRyxDQUFDO1VBQ1BDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQ0gsYUFBYSxDQUFDSSxXQUFXLENBQUM7VUFDN0NDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQ2QsUUFBUSxFQUFFO1FBQ2hDLENBQUMsQ0FDRDtRQUNELGFBQWEsRUFBRSxLQUFNO1FBQ3JCLFlBQVksRUFBRSxLQUFNO1FBQ3BCLGlCQUFpQixFQUFFLEtBQU07UUFDekIsV0FBVyxFQUFFLElBQUksQ0FBQ3pCLGNBQWMsRUFBRztRQUNuQyxTQUFTLEVBQUUsSUFBSSxDQUFDNkIsWUFBWTtNQUFHLEVBQ3RCO0lBRVosQ0FBQztJQUFBO0VBQUEsRUEvSmlEVyxvQkFBb0I7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQWU5Qyx1QkFBdUI7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQU1sQixFQUFFO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==