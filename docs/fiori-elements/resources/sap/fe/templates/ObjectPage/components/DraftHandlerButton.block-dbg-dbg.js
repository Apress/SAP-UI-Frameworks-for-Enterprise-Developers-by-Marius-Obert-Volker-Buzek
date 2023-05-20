/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ObjectPage/ObjectPageTemplating", "sap/m/Button", "sap/m/ResponsivePopover", "sap/m/SelectList", "sap/ui/core/InvisibleText", "sap/ui/core/Item", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs", "sap/fe/core/jsx-runtime/Fragment"], function (BuildingBlockSupport, RuntimeBuildingBlock, CommonUtils, BindingHelper, BindingToolkit, ClassSupport, ObjectPageTemplating, Button, ResponsivePopover, SelectList, InvisibleText, Item, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var getSwitchDraftAndActiveVisibility = ObjectPageTemplating.getSwitchDraftAndActiveVisibility;
  var defineReference = ClassSupport.defineReference;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DraftHandlerButtonBlock = (_dec = defineBuildingBlock({
    name: "DraftHandlerButton",
    namespace: "sap.fe.templates.ObjectPage.components"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(DraftHandlerButtonBlock, _RuntimeBuildingBlock);
    function DraftHandlerButtonBlock(props) {
      var _this;
      _this = _RuntimeBuildingBlock.call(this, props) || this;
      _this.SWITCH_TO_DRAFT_KEY = "switchToDraft";
      _this.SWITCH_TO_ACTIVE_KEY = "switchToActive";
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToActiveRef", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToDraftRef", _descriptor4, _assertThisInitialized(_this));
      _this.initialSelectedKey = _this.SWITCH_TO_ACTIVE_KEY;
      _this.handleSelectedItemChange = event => {
        const selectedItemKey = event.getParameter("item").getProperty("key");
        if (selectedItemKey !== _this.initialSelectedKey) {
          _this._containingView.getController().editFlow.toggleDraftActive(_this._containingView.getBindingContext());
        }
        if (_this.popover) {
          _this.popover.close();
          _this.popover.destroy();
          delete _this.popover;
        }
      };
      _this.openSwitchActivePopover = event => {
        const sourceControl = event.getSource();
        const containingView = CommonUtils.getTargetView(sourceControl);
        const context = containingView.getBindingContext();
        const isActiveEntity = context.getObject().IsActiveEntity;
        _this.initialSelectedKey = isActiveEntity ? _this.SWITCH_TO_ACTIVE_KEY : _this.SWITCH_TO_DRAFT_KEY;
        _this.popover = _this.createPopover();
        _this._containingView = containingView;
        containingView.addDependent(_this.popover);
        _this.popover.openBy(sourceControl);
        _this.popover.attachEventOnce("afterOpen", () => {
          if (isActiveEntity) {
            var _this$switchToDraftRe;
            (_this$switchToDraftRe = _this.switchToDraftRef.current) === null || _this$switchToDraftRe === void 0 ? void 0 : _this$switchToDraftRe.focus();
          } else {
            var _this$switchToActiveR;
            (_this$switchToActiveR = _this.switchToActiveRef.current) === null || _this$switchToActiveR === void 0 ? void 0 : _this$switchToActiveR.focus();
          }
        });
        return _this.popover;
      };
      return _this;
    }
    _exports = DraftHandlerButtonBlock;
    var _proto = DraftHandlerButtonBlock.prototype;
    _proto.createPopover = function createPopover() {
      return _jsx(ResponsivePopover, {
        showHeader: false,
        contentWidth: "15.625rem",
        verticalScrolling: false,
        class: "sapUiNoContentPadding",
        placement: "Bottom",
        children: _jsxs(SelectList, {
          selectedKey: this.initialSelectedKey,
          itemPress: this.handleSelectedItemChange,
          children: [_jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_DRAFT_MIT}",
            ref: this.switchToDraftRef
          }, this.SWITCH_TO_DRAFT_KEY), _jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_SAVED_VERSION_MIT}",
            ref: this.switchToActiveRef
          }, this.SWITCH_TO_ACTIVE_KEY)]
        })
      });
    };
    _proto.getContent = function getContent() {
      const textValue = ifElse(and(not(UI.IsEditable), not(UI.IsCreateMode), Entity.HasDraft), pathInModel("C_COMMON_OBJECT_PAGE_SAVED_VERSION_BUT", "sap.fe.i18n"), pathInModel("C_COMMON_OBJECT_PAGE_DRAFT_BUT", "sap.fe.i18n"));
      const visible = getSwitchDraftAndActiveVisibility(this.contextPath.getObject("@"));
      return _jsxs(_Fragment, {
        children: [_jsx(Button, {
          id: "fe::StandardAction::SwitchDraftAndActiveObject",
          text: textValue,
          visible: visible,
          icon: "sap-icon://navigation-down-arrow",
          iconFirst: false,
          type: "Transparent",
          press: this.openSwitchActivePopover,
          ariaDescribedBy: ["fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"]
        }), _jsx(InvisibleText, {
          text: "{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_DRAFT_SWITCHER_ARIA_BUTTON}",
          id: "fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"
        })]
      });
    };
    return DraftHandlerButtonBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "switchToActiveRef", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "switchToDraftRef", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DraftHandlerButtonBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdEhhbmRsZXJCdXR0b25CbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiZGVmaW5lUmVmZXJlbmNlIiwicHJvcHMiLCJTV0lUQ0hfVE9fRFJBRlRfS0VZIiwiU1dJVENIX1RPX0FDVElWRV9LRVkiLCJpbml0aWFsU2VsZWN0ZWRLZXkiLCJoYW5kbGVTZWxlY3RlZEl0ZW1DaGFuZ2UiLCJldmVudCIsInNlbGVjdGVkSXRlbUtleSIsImdldFBhcmFtZXRlciIsImdldFByb3BlcnR5IiwiX2NvbnRhaW5pbmdWaWV3IiwiZ2V0Q29udHJvbGxlciIsImVkaXRGbG93IiwidG9nZ2xlRHJhZnRBY3RpdmUiLCJnZXRCaW5kaW5nQ29udGV4dCIsInBvcG92ZXIiLCJjbG9zZSIsImRlc3Ryb3kiLCJvcGVuU3dpdGNoQWN0aXZlUG9wb3ZlciIsInNvdXJjZUNvbnRyb2wiLCJnZXRTb3VyY2UiLCJjb250YWluaW5nVmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsImNvbnRleHQiLCJpc0FjdGl2ZUVudGl0eSIsImdldE9iamVjdCIsIklzQWN0aXZlRW50aXR5IiwiY3JlYXRlUG9wb3ZlciIsImFkZERlcGVuZGVudCIsIm9wZW5CeSIsImF0dGFjaEV2ZW50T25jZSIsInN3aXRjaFRvRHJhZnRSZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJzd2l0Y2hUb0FjdGl2ZVJlZiIsImdldENvbnRlbnQiLCJ0ZXh0VmFsdWUiLCJpZkVsc2UiLCJhbmQiLCJub3QiLCJVSSIsIklzRWRpdGFibGUiLCJJc0NyZWF0ZU1vZGUiLCJFbnRpdHkiLCJIYXNEcmFmdCIsInBhdGhJbk1vZGVsIiwidmlzaWJsZSIsImdldFN3aXRjaERyYWZ0QW5kQWN0aXZlVmlzaWJpbGl0eSIsImNvbnRleHRQYXRoIiwiUnVudGltZUJ1aWxkaW5nQmxvY2siXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRyYWZ0SGFuZGxlckJ1dHRvbi5ibG9jay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCBSdW50aW1lQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvUnVudGltZUJ1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IEVudGl0eSwgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IGFuZCwgaWZFbHNlLCBub3QsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSwgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBSZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvanN4XCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBnZXRTd2l0Y2hEcmFmdEFuZEFjdGl2ZVZpc2liaWxpdHkgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL09iamVjdFBhZ2VUZW1wbGF0aW5nXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBSZXNwb25zaXZlUG9wb3ZlciBmcm9tIFwic2FwL20vUmVzcG9uc2l2ZVBvcG92ZXJcIjtcbmltcG9ydCBTZWxlY3RMaXN0IGZyb20gXCJzYXAvbS9TZWxlY3RMaXN0XCI7XG5pbXBvcnQgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IEludmlzaWJsZVRleHQgZnJvbSBcInNhcC91aS9jb3JlL0ludmlzaWJsZVRleHRcIjtcbmltcG9ydCBJdGVtIGZyb20gXCJzYXAvdWkvY29yZS9JdGVtXCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiRHJhZnRIYW5kbGVyQnV0dG9uXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuY29tcG9uZW50c1wiIH0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFmdEhhbmRsZXJCdXR0b25CbG9jayBleHRlbmRzIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIHtcblx0cHJpdmF0ZSBfY29udGFpbmluZ1ZpZXchOiBWaWV3O1xuXG5cdHByaXZhdGUgcG9wb3Zlcj86IFJlc3BvbnNpdmVQb3BvdmVyO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgU1dJVENIX1RPX0RSQUZUX0tFWSA9IFwic3dpdGNoVG9EcmFmdFwiO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgU1dJVENIX1RPX0FDVElWRV9LRVkgPSBcInN3aXRjaFRvQWN0aXZlXCI7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxEcmFmdEhhbmRsZXJCdXR0b25CbG9jaz4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdH1cblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBpZD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0cHVibGljIGNvbnRleHRQYXRoPzogQ29udGV4dDtcblxuXHRAZGVmaW5lUmVmZXJlbmNlKClcblx0cHVibGljIHN3aXRjaFRvQWN0aXZlUmVmITogUmVmPEl0ZW0+O1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRwdWJsaWMgc3dpdGNoVG9EcmFmdFJlZiE6IFJlZjxJdGVtPjtcblxuXHRwcml2YXRlIGluaXRpYWxTZWxlY3RlZEtleTogc3RyaW5nID0gdGhpcy5TV0lUQ0hfVE9fQUNUSVZFX0tFWTtcblxuXHRoYW5kbGVTZWxlY3RlZEl0ZW1DaGFuZ2UgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG5cdFx0Y29uc3Qgc2VsZWN0ZWRJdGVtS2V5ID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwiaXRlbVwiKS5nZXRQcm9wZXJ0eShcImtleVwiKTtcblx0XHRpZiAoc2VsZWN0ZWRJdGVtS2V5ICE9PSB0aGlzLmluaXRpYWxTZWxlY3RlZEtleSkge1xuXHRcdFx0KHRoaXMuX2NvbnRhaW5pbmdWaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuZWRpdEZsb3cudG9nZ2xlRHJhZnRBY3RpdmUoXG5cdFx0XHRcdHRoaXMuX2NvbnRhaW5pbmdWaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMucG9wb3Zlcikge1xuXHRcdFx0dGhpcy5wb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHR0aGlzLnBvcG92ZXIuZGVzdHJveSgpO1xuXHRcdFx0ZGVsZXRlIHRoaXMucG9wb3Zlcjtcblx0XHR9XG5cdH07XG5cblx0b3BlblN3aXRjaEFjdGl2ZVBvcG92ZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG5cdFx0Y29uc3Qgc291cmNlQ29udHJvbCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3QgY29udGFpbmluZ1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHNvdXJjZUNvbnRyb2wpO1xuXG5cdFx0Y29uc3QgY29udGV4dDogQ29udGV4dCA9IGNvbnRhaW5pbmdWaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRjb25zdCBpc0FjdGl2ZUVudGl0eSA9IGNvbnRleHQuZ2V0T2JqZWN0KCkuSXNBY3RpdmVFbnRpdHk7XG5cdFx0dGhpcy5pbml0aWFsU2VsZWN0ZWRLZXkgPSBpc0FjdGl2ZUVudGl0eSA/IHRoaXMuU1dJVENIX1RPX0FDVElWRV9LRVkgOiB0aGlzLlNXSVRDSF9UT19EUkFGVF9LRVk7XG5cdFx0dGhpcy5wb3BvdmVyID0gdGhpcy5jcmVhdGVQb3BvdmVyKCk7XG5cblx0XHR0aGlzLl9jb250YWluaW5nVmlldyA9IGNvbnRhaW5pbmdWaWV3O1xuXHRcdGNvbnRhaW5pbmdWaWV3LmFkZERlcGVuZGVudCh0aGlzLnBvcG92ZXIpO1xuXHRcdHRoaXMucG9wb3Zlci5vcGVuQnkoc291cmNlQ29udHJvbCk7XG5cdFx0dGhpcy5wb3BvdmVyLmF0dGFjaEV2ZW50T25jZShcImFmdGVyT3BlblwiLCAoKSA9PiB7XG5cdFx0XHRpZiAoaXNBY3RpdmVFbnRpdHkpIHtcblx0XHRcdFx0dGhpcy5zd2l0Y2hUb0RyYWZ0UmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnN3aXRjaFRvQWN0aXZlUmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXMucG9wb3Zlcjtcblx0fTtcblxuXHRjcmVhdGVQb3BvdmVyKCk6IFJlc3BvbnNpdmVQb3BvdmVyIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFJlc3BvbnNpdmVQb3BvdmVyXG5cdFx0XHRcdHNob3dIZWFkZXI9e2ZhbHNlfVxuXHRcdFx0XHRjb250ZW50V2lkdGg9e1wiMTUuNjI1cmVtXCJ9XG5cdFx0XHRcdHZlcnRpY2FsU2Nyb2xsaW5nPXtmYWxzZX1cblx0XHRcdFx0Y2xhc3M9e1wic2FwVWlOb0NvbnRlbnRQYWRkaW5nXCJ9XG5cdFx0XHRcdHBsYWNlbWVudD17XCJCb3R0b21cIn1cblx0XHRcdD5cblx0XHRcdFx0PFNlbGVjdExpc3Qgc2VsZWN0ZWRLZXk9e3RoaXMuaW5pdGlhbFNlbGVjdGVkS2V5fSBpdGVtUHJlc3M9e3RoaXMuaGFuZGxlU2VsZWN0ZWRJdGVtQ2hhbmdlfT5cblx0XHRcdFx0XHQ8SXRlbVxuXHRcdFx0XHRcdFx0dGV4dD17XCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fT0JKRUNUX1BBR0VfRElTUExBWV9EUkFGVF9NSVR9XCJ9XG5cdFx0XHRcdFx0XHRrZXk9e3RoaXMuU1dJVENIX1RPX0RSQUZUX0tFWX1cblx0XHRcdFx0XHRcdHJlZj17dGhpcy5zd2l0Y2hUb0RyYWZ0UmVmfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PEl0ZW1cblx0XHRcdFx0XHRcdHRleHQ9e1wie3NhcC5mZS5pMThuPkNfQ09NTU9OX09CSkVDVF9QQUdFX0RJU1BMQVlfU0FWRURfVkVSU0lPTl9NSVR9XCJ9XG5cdFx0XHRcdFx0XHRrZXk9e3RoaXMuU1dJVENIX1RPX0FDVElWRV9LRVl9XG5cdFx0XHRcdFx0XHRyZWY9e3RoaXMuc3dpdGNoVG9BY3RpdmVSZWZ9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0PC9TZWxlY3RMaXN0PlxuXHRcdFx0PC9SZXNwb25zaXZlUG9wb3Zlcj5cblx0XHQpO1xuXHR9XG5cblx0Z2V0Q29udGVudCgpIHtcblx0XHRjb25zdCB0ZXh0VmFsdWUgPSBpZkVsc2UoXG5cdFx0XHRhbmQobm90KFVJLklzRWRpdGFibGUpLCBub3QoVUkuSXNDcmVhdGVNb2RlKSwgRW50aXR5Lkhhc0RyYWZ0KSxcblx0XHRcdHBhdGhJbk1vZGVsKFwiQ19DT01NT05fT0JKRUNUX1BBR0VfU0FWRURfVkVSU0lPTl9CVVRcIiwgXCJzYXAuZmUuaTE4blwiKSxcblx0XHRcdHBhdGhJbk1vZGVsKFwiQ19DT01NT05fT0JKRUNUX1BBR0VfRFJBRlRfQlVUXCIsIFwic2FwLmZlLmkxOG5cIilcblx0XHQpO1xuXHRcdGNvbnN0IHZpc2libGUgPSBnZXRTd2l0Y2hEcmFmdEFuZEFjdGl2ZVZpc2liaWxpdHkodGhpcy5jb250ZXh0UGF0aCEuZ2V0T2JqZWN0KFwiQFwiKSk7XG5cdFx0cmV0dXJuIChcblx0XHRcdDw+XG5cdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRpZD1cImZlOjpTdGFuZGFyZEFjdGlvbjo6U3dpdGNoRHJhZnRBbmRBY3RpdmVPYmplY3RcIlxuXHRcdFx0XHRcdHRleHQ9e3RleHRWYWx1ZX1cblx0XHRcdFx0XHR2aXNpYmxlPXt2aXNpYmxlfVxuXHRcdFx0XHRcdGljb249XCJzYXAtaWNvbjovL25hdmlnYXRpb24tZG93bi1hcnJvd1wiXG5cdFx0XHRcdFx0aWNvbkZpcnN0PXtmYWxzZX1cblx0XHRcdFx0XHR0eXBlPVwiVHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRcdHByZXNzPXt0aGlzLm9wZW5Td2l0Y2hBY3RpdmVQb3BvdmVyfVxuXHRcdFx0XHRcdGFyaWFEZXNjcmliZWRCeT17W1wiZmU6OlN0YW5kYXJkQWN0aW9uOjpTd2l0Y2hEcmFmdEFuZEFjdGl2ZU9iamVjdDo6QXJpYVRleHREcmFmdFN3aXRjaGVyXCJdfVxuXHRcdFx0XHQ+PC9CdXR0b24+XG5cdFx0XHRcdDxJbnZpc2libGVUZXh0XG5cdFx0XHRcdFx0dGV4dD1cIntzYXAuZmUuaTE4bj5UX0hFQURFUl9EQVRBUE9JTlRfVElUTEVfRFJBRlRfU1dJVENIRVJfQVJJQV9CVVRUT059XCJcblx0XHRcdFx0XHRpZD1cImZlOjpTdGFuZGFyZEFjdGlvbjo6U3dpdGNoRHJhZnRBbmRBY3RpdmVPYmplY3Q6OkFyaWFUZXh0RHJhZnRTd2l0Y2hlclwiXG5cdFx0XHRcdC8+XG5cdFx0XHQ8Lz5cblx0XHQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFvQnFCQSx1QkFBdUIsV0FEM0NDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxvQkFBb0I7SUFBRUMsU0FBUyxFQUFFO0VBQXlDLENBQUMsQ0FBQyxV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