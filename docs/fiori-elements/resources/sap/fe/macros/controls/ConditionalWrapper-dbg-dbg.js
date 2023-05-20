/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Control"], function (ClassSupport, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ConditionalWrapper = (_dec = defineUI5Class("sap.fe.macros.controls.ConditionalWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec7 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec8 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(ConditionalWrapper, _Control);
    function ConditionalWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "condition", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentTrue", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentFalse", _descriptor7, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ConditionalWrapper.prototype;
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    }

    /**
     * This function provides the current accessibility state of the control.
     *
     * @returns The accessibility info of the wrapped control
     */;
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      var _content;
      let content;
      if (this.condition) {
        content = this.contentTrue;
      } else {
        content = this.contentFalse;
      }
      return (_content = content) !== null && _content !== void 0 && _content.getAccessibilityInfo ? content.getAccessibilityInfo() : {};
    };
    _proto._setAriaLabelledBy = function _setAriaLabelledBy(oContent) {
      if (oContent && oContent.addAriaLabelledBy) {
        const aAriaLabelledBy = this.ariaLabelledBy;
        for (let i = 0; i < aAriaLabelledBy.length; i++) {
          const sId = aAriaLabelledBy[i];
          const aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      // before calling the renderer of the ConditionalWrapper parent control may have set ariaLabelledBy
      // we ensure it is passed to its inner controls
      this._setAriaLabelledBy(this.contentTrue);
      this._setAriaLabelledBy(this.contentFalse);
    };
    ConditionalWrapper.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.style("width", oControl.width);
      oRm.style("display", "inline-block");
      oRm.openEnd();
      if (oControl.condition) {
        oRm.renderControl(oControl.contentTrue);
      } else {
        oRm.renderControl(oControl.contentFalse);
      }
      oRm.close("div"); // end of the complete Control
    };
    return ConditionalWrapper;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "formDoNotAdjustWidth", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "condition", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "contentTrue", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "contentFalse", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ConditionalWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25kaXRpb25hbFdyYXBwZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJhZ2dyZWdhdGlvbiIsImlzRGVmYXVsdCIsImVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUiLCJvRWxlbWVudCIsIm1BcmlhUHJvcHMiLCJvUGFyZW50IiwiZ2V0UGFyZW50IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJjb250ZW50IiwiY29uZGl0aW9uIiwiY29udGVudFRydWUiLCJjb250ZW50RmFsc2UiLCJfc2V0QXJpYUxhYmVsbGVkQnkiLCJvQ29udGVudCIsImFkZEFyaWFMYWJlbGxlZEJ5IiwiYUFyaWFMYWJlbGxlZEJ5IiwiYXJpYUxhYmVsbGVkQnkiLCJpIiwibGVuZ3RoIiwic0lkIiwiYUFyaWFMYWJlbGxlZEJ5cyIsImdldEFyaWFMYWJlbGxlZEJ5IiwiaW5kZXhPZiIsIm9uQmVmb3JlUmVuZGVyaW5nIiwicmVuZGVyIiwib1JtIiwib0NvbnRyb2wiLCJvcGVuU3RhcnQiLCJzdHlsZSIsIndpZHRoIiwib3BlbkVuZCIsInJlbmRlckNvbnRyb2wiLCJjbG9zZSIsIkNvbnRyb2wiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbmRpdGlvbmFsV3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgYXNzb2NpYXRpb24sIGRlZmluZVVJNUNsYXNzLCBFbmhhbmNlV2l0aFVJNSwgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgQ1NTU2l6ZSwgSUZvcm1Db250ZW50IH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFJlbmRlck1hbmFnZXIgZnJvbSBcInNhcC91aS9jb3JlL1JlbmRlck1hbmFnZXJcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5Db25kaXRpb25hbFdyYXBwZXJcIilcbmNsYXNzIENvbmRpdGlvbmFsV3JhcHBlciBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC51aS5jb3JlLkNTU1NpemVcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdHdpZHRoITogQ1NTU2l6ZTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRmb3JtRG9Ob3RBZGp1c3RXaWR0aCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0Y29uZGl0aW9uITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQXNzb2NpYXRpb24gdG8gY29udHJvbHMgLyBJRHMgdGhhdCBsYWJlbCB0aGlzIGNvbnRyb2wgKHNlZSBXQUktQVJJQSBhdHRyaWJ1dGUgYXJpYS1sYWJlbGxlZGJ5KS5cblx0ICovXG5cdEBhc3NvY2lhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogdHJ1ZSwgc2luZ3VsYXJOYW1lOiBcImFyaWFMYWJlbGxlZEJ5XCIgfSlcblx0YXJpYUxhYmVsbGVkQnkhOiBDb250cm9sW107XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiBmYWxzZSwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGNvbnRlbnRUcnVlITogQ29udHJvbDtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGNvbnRlbnRGYWxzZSE6IENvbnRyb2w7XG5cblx0ZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZShvRWxlbWVudDogYW55LCBtQXJpYVByb3BzOiBhbnkpIHtcblx0XHRjb25zdCBvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKSBhcyBhbnk7XG5cblx0XHRpZiAob1BhcmVudCAmJiBvUGFyZW50LmVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUpIHtcblx0XHRcdG9QYXJlbnQuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSh0aGlzLCBtQXJpYVByb3BzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbUFyaWFQcm9wcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHByb3ZpZGVzIHRoZSBjdXJyZW50IGFjY2Vzc2liaWxpdHkgc3RhdGUgb2YgdGhlIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBhY2Nlc3NpYmlsaXR5IGluZm8gb2YgdGhlIHdyYXBwZWQgY29udHJvbFxuXHQgKi9cblx0Z2V0QWNjZXNzaWJpbGl0eUluZm8oKSB7XG5cdFx0bGV0IGNvbnRlbnQ7XG5cdFx0aWYgKHRoaXMuY29uZGl0aW9uKSB7XG5cdFx0XHRjb250ZW50ID0gdGhpcy5jb250ZW50VHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGVudCA9IHRoaXMuY29udGVudEZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gY29udGVudD8uZ2V0QWNjZXNzaWJpbGl0eUluZm8gPyBjb250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvKCkgOiB7fTtcblx0fVxuXG5cdF9zZXRBcmlhTGFiZWxsZWRCeShvQ29udGVudDogYW55KSB7XG5cdFx0aWYgKG9Db250ZW50ICYmIG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KSB7XG5cdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnkgPSB0aGlzLmFyaWFMYWJlbGxlZEJ5O1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFBcmlhTGFiZWxsZWRCeS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBzSWQgPSBhQXJpYUxhYmVsbGVkQnlbaV07XG5cdFx0XHRcdGNvbnN0IGFBcmlhTGFiZWxsZWRCeXMgPSBvQ29udGVudC5nZXRBcmlhTGFiZWxsZWRCeSgpIHx8IFtdO1xuXHRcdFx0XHRpZiAoYUFyaWFMYWJlbGxlZEJ5cy5pbmRleE9mKHNJZCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0b0NvbnRlbnQuYWRkQXJpYUxhYmVsbGVkQnkoc0lkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKCkge1xuXHRcdC8vIGJlZm9yZSBjYWxsaW5nIHRoZSByZW5kZXJlciBvZiB0aGUgQ29uZGl0aW9uYWxXcmFwcGVyIHBhcmVudCBjb250cm9sIG1heSBoYXZlIHNldCBhcmlhTGFiZWxsZWRCeVxuXHRcdC8vIHdlIGVuc3VyZSBpdCBpcyBwYXNzZWQgdG8gaXRzIGlubmVyIGNvbnRyb2xzXG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5jb250ZW50VHJ1ZSk7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5jb250ZW50RmFsc2UpO1xuXHR9XG5cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBDb25kaXRpb25hbFdyYXBwZXIpIHtcblx0XHRvUm0ub3BlblN0YXJ0KFwiZGl2XCIsIG9Db250cm9sKTtcblx0XHRvUm0uc3R5bGUoXCJ3aWR0aFwiLCBvQ29udHJvbC53aWR0aCk7XG5cdFx0b1JtLnN0eWxlKFwiZGlzcGxheVwiLCBcImlubGluZS1ibG9ja1wiKTtcblx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdGlmIChvQ29udHJvbC5jb25kaXRpb24pIHtcblx0XHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLmNvbnRlbnRUcnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuY29udGVudEZhbHNlKTtcblx0XHR9XG5cdFx0b1JtLmNsb3NlKFwiZGl2XCIpOyAvLyBlbmQgb2YgdGhlIGNvbXBsZXRlIENvbnRyb2xcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25kaXRpb25hbFdyYXBwZXIgYXMgdW5rbm93biBhcyBFbmhhbmNlV2l0aFVJNTxDb25kaXRpb25hbFdyYXBwZXI+O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O01BTU1BLGtCQUFrQixXQUR2QkMsY0FBYyxDQUFDLDJDQUEyQyxDQUFDLFVBRTFEQyxrQkFBa0IsQ0FBQywwQkFBMEIsQ0FBQyxVQUc5Q0MsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxxQkFBcUI7SUFBRUMsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBRzdERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBR2xERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBTWxEQyxXQUFXLENBQUM7SUFBRUYsSUFBSSxFQUFFLHFCQUFxQjtJQUFFRyxRQUFRLEVBQUUsSUFBSTtJQUFFQyxZQUFZLEVBQUU7RUFBaUIsQ0FBQyxDQUFDLFVBRzVGQyxXQUFXLENBQUM7SUFBRUwsSUFBSSxFQUFFLHFCQUFxQjtJQUFFRyxRQUFRLEVBQUUsS0FBSztJQUFFRyxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHOUVELFdBQVcsQ0FBQztJQUFFTCxJQUFJLEVBQUUscUJBQXFCO0lBQUVHLFFBQVEsRUFBRTtFQUFNLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFB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