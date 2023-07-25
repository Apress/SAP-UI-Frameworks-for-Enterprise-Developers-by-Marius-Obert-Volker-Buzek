/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Control"], function (ClassSupport, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
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
  let FieldWrapper = (_dec = defineUI5Class("sap.fe.macros.controls.FieldWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.TextAlign"
  }), _dec4 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = property({
    type: "string",
    defaultValue: "Display"
  }), _dec7 = property({
    type: "boolean",
    defaultValue: false
  }), _dec8 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec9 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec10 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(FieldWrapper, _Control);
    function FieldWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "textAlign", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editMode", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentDisplay", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentEdit", _descriptor9, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FieldWrapper.prototype;
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(oElement, mAriaProps) {
      const oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        // use FieldWrapper as control, but aria properties of rendered inner control.
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      let oContent;
      if (this.editMode === "Display") {
        oContent = this.contentDisplay;
      } else {
        oContent = this.contentEdit.length ? this.contentEdit[0] : null;
      }
      return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
    }

    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      var _oContent;
      let oContent;
      if (this.editMode === "Display") {
        oContent = this.contentDisplay;
      } else {
        oContent = this.contentEdit.length ? this.contentEdit[0] : null;
      }
      return (_oContent = oContent) === null || _oContent === void 0 ? void 0 : _oContent.getIdForLabel();
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
      // before calling the renderer of the FieldWrapper parent control may have set ariaLabelledBy
      // we ensure it is passed to its inner controls
      this._setAriaLabelledBy(this.contentDisplay);
      const aContentEdit = this.contentEdit;
      for (let i = 0; i < aContentEdit.length; i++) {
        this._setAriaLabelledBy(aContentEdit[i]);
      }
    };
    FieldWrapper.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.style("text-align", oControl.textAlign);
      if (oControl.editMode === "Display") {
        oRm.style("width", oControl.width);
        oRm.openEnd();
        oRm.renderControl(oControl.contentDisplay); // render the child Control for display
      } else {
        const aContentEdit = oControl.contentEdit;

        // if (aContentEdit.length > 1) {
        // 	oRm.class("sapUiMdcFieldBaseMoreFields");
        // }
        oRm.style("width", oControl.width);
        oRm.openEnd();
        for (let i = 0; i < aContentEdit.length; i++) {
          const oContent = aContentEdit[i]; // render the child Control  for edit
          oRm.renderControl(oContent);
        }
      }
      oRm.close("div"); // end of the complete Control
    };
    return FieldWrapper;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "textAlign", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formDoNotAdjustWidth", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editMode", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "contentDisplay", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "contentEdit", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FieldWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWVsZFdyYXBwZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJhZ2dyZWdhdGlvbiIsImlzRGVmYXVsdCIsImVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUiLCJvRWxlbWVudCIsIm1BcmlhUHJvcHMiLCJvUGFyZW50IiwiZ2V0UGFyZW50IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJvQ29udGVudCIsImVkaXRNb2RlIiwiY29udGVudERpc3BsYXkiLCJjb250ZW50RWRpdCIsImxlbmd0aCIsImdldElkRm9yTGFiZWwiLCJfc2V0QXJpYUxhYmVsbGVkQnkiLCJhZGRBcmlhTGFiZWxsZWRCeSIsImFBcmlhTGFiZWxsZWRCeSIsImFyaWFMYWJlbGxlZEJ5IiwiaSIsInNJZCIsImFBcmlhTGFiZWxsZWRCeXMiLCJnZXRBcmlhTGFiZWxsZWRCeSIsImluZGV4T2YiLCJvbkJlZm9yZVJlbmRlcmluZyIsImFDb250ZW50RWRpdCIsInJlbmRlciIsIm9SbSIsIm9Db250cm9sIiwib3BlblN0YXJ0Iiwic3R5bGUiLCJ0ZXh0QWxpZ24iLCJ3aWR0aCIsIm9wZW5FbmQiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZFdyYXBwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWdncmVnYXRpb24sIGFzc29jaWF0aW9uLCBkZWZpbmVVSTVDbGFzcywgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgQ1NTU2l6ZSwgSUZvcm1Db250ZW50LCBUZXh0QWxpZ24gfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzLkZpZWxkV3JhcHBlclwiKVxuY2xhc3MgRmllbGRXcmFwcGVyIGV4dGVuZHMgQ29udHJvbCBpbXBsZW1lbnRzIElGb3JtQ29udGVudCB7XG5cdEBpbXBsZW1lbnRJbnRlcmZhY2UoXCJzYXAudWkuY29yZS5JRm9ybUNvbnRlbnRcIilcblx0X19pbXBsZW1lbnRzX19zYXBfdWlfY29yZV9JRm9ybUNvbnRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuVGV4dEFsaWduXCIgfSlcblx0dGV4dEFsaWduITogVGV4dEFsaWduO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ1NTU2l6ZVwiLCBkZWZhdWx0VmFsdWU6IG51bGwgfSlcblx0d2lkdGghOiBDU1NTaXplO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGZvcm1Eb05vdEFkanVzdFdpZHRoITogYm9vbGVhbjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IFwiRGlzcGxheVwiIH0pXG5cdGVkaXRNb2RlITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdHJlcXVpcmVkITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQXNzb2NpYXRpb24gdG8gY29udHJvbHMgLyBJRHMgdGhhdCBsYWJlbCB0aGlzIGNvbnRyb2wgKHNlZSBXQUktQVJJQSBhdHRyaWJ1dGUgYXJpYS1sYWJlbGxlZGJ5KS5cblx0ICovXG5cdEBhc3NvY2lhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogdHJ1ZSwgc2luZ3VsYXJOYW1lOiBcImFyaWFMYWJlbGxlZEJ5XCIgfSlcblx0YXJpYUxhYmVsbGVkQnkhOiBDb250cm9sW107XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiBmYWxzZSwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGNvbnRlbnREaXNwbGF5ITogQ29udHJvbDtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IHRydWUgfSlcblx0Y29udGVudEVkaXQhOiBDb250cm9sW107XG5cblx0ZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZShvRWxlbWVudDogYW55LCBtQXJpYVByb3BzOiBhbnkpIHtcblx0XHRjb25zdCBvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKSBhcyBhbnk7XG5cblx0XHRpZiAob1BhcmVudCAmJiBvUGFyZW50LmVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUpIHtcblx0XHRcdC8vIHVzZSBGaWVsZFdyYXBwZXIgYXMgY29udHJvbCwgYnV0IGFyaWEgcHJvcGVydGllcyBvZiByZW5kZXJlZCBpbm5lciBjb250cm9sLlxuXHRcdFx0b1BhcmVudC5lbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlKHRoaXMsIG1BcmlhUHJvcHMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBtQXJpYVByb3BzO1xuXHR9XG5cblx0Z2V0QWNjZXNzaWJpbGl0eUluZm8oKSB7XG5cdFx0bGV0IG9Db250ZW50O1xuXHRcdGlmICh0aGlzLmVkaXRNb2RlID09PSBcIkRpc3BsYXlcIikge1xuXHRcdFx0b0NvbnRlbnQgPSB0aGlzLmNvbnRlbnREaXNwbGF5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvQ29udGVudCA9IHRoaXMuY29udGVudEVkaXQubGVuZ3RoID8gdGhpcy5jb250ZW50RWRpdFswXSA6IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiBvQ29udGVudCAmJiBvQ29udGVudC5nZXRBY2Nlc3NpYmlsaXR5SW5mbyA/IG9Db250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvKCkgOiB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBET01Ob2RlIElEIHRvIGJlIHVzZWQgZm9yIHRoZSBcImxhYmVsRm9yXCIgYXR0cmlidXRlLlxuXHQgKlxuXHQgKiBXZSBmb3J3YXJkIHRoZSBjYWxsIG9mIHRoaXMgbWV0aG9kIHRvIHRoZSBjb250ZW50IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEByZXR1cm5zIElEIHRvIGJlIHVzZWQgZm9yIHRoZSA8Y29kZT5sYWJlbEZvcjwvY29kZT5cblx0ICovXG5cdGdldElkRm9yTGFiZWwoKTogc3RyaW5nIHtcblx0XHRsZXQgb0NvbnRlbnQ7XG5cdFx0aWYgKHRoaXMuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiKSB7XG5cdFx0XHRvQ29udGVudCA9IHRoaXMuY29udGVudERpc3BsYXk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Db250ZW50ID0gdGhpcy5jb250ZW50RWRpdC5sZW5ndGggPyB0aGlzLmNvbnRlbnRFZGl0WzBdIDogbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIChvQ29udGVudCBhcyBDb250cm9sKT8uZ2V0SWRGb3JMYWJlbCgpO1xuXHR9XG5cblx0X3NldEFyaWFMYWJlbGxlZEJ5KG9Db250ZW50OiBhbnkpIHtcblx0XHRpZiAob0NvbnRlbnQgJiYgb0NvbnRlbnQuYWRkQXJpYUxhYmVsbGVkQnkpIHtcblx0XHRcdGNvbnN0IGFBcmlhTGFiZWxsZWRCeSA9IHRoaXMuYXJpYUxhYmVsbGVkQnk7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUFyaWFMYWJlbGxlZEJ5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHNJZCA9IGFBcmlhTGFiZWxsZWRCeVtpXTtcblx0XHRcdFx0Y29uc3QgYUFyaWFMYWJlbGxlZEJ5cyA9IG9Db250ZW50LmdldEFyaWFMYWJlbGxlZEJ5KCkgfHwgW107XG5cdFx0XHRcdGlmIChhQXJpYUxhYmVsbGVkQnlzLmluZGV4T2Yoc0lkKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRvQ29udGVudC5hZGRBcmlhTGFiZWxsZWRCeShzSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Ly8gYmVmb3JlIGNhbGxpbmcgdGhlIHJlbmRlcmVyIG9mIHRoZSBGaWVsZFdyYXBwZXIgcGFyZW50IGNvbnRyb2wgbWF5IGhhdmUgc2V0IGFyaWFMYWJlbGxlZEJ5XG5cdFx0Ly8gd2UgZW5zdXJlIGl0IGlzIHBhc3NlZCB0byBpdHMgaW5uZXIgY29udHJvbHNcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmNvbnRlbnREaXNwbGF5KTtcblx0XHRjb25zdCBhQ29udGVudEVkaXQgPSB0aGlzLmNvbnRlbnRFZGl0O1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUNvbnRlbnRFZGl0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeShhQ29udGVudEVkaXRbaV0pO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyByZW5kZXIob1JtOiBSZW5kZXJNYW5hZ2VyLCBvQ29udHJvbDogRmllbGRXcmFwcGVyKSB7XG5cdFx0b1JtLm9wZW5TdGFydChcImRpdlwiLCBvQ29udHJvbCk7XG5cdFx0b1JtLnN0eWxlKFwidGV4dC1hbGlnblwiLCBvQ29udHJvbC50ZXh0QWxpZ24pO1xuXHRcdGlmIChvQ29udHJvbC5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIpIHtcblx0XHRcdG9SbS5zdHlsZShcIndpZHRoXCIsIG9Db250cm9sLndpZHRoKTtcblx0XHRcdG9SbS5vcGVuRW5kKCk7XG5cdFx0XHRvUm0ucmVuZGVyQ29udHJvbChvQ29udHJvbC5jb250ZW50RGlzcGxheSk7IC8vIHJlbmRlciB0aGUgY2hpbGQgQ29udHJvbCBmb3IgZGlzcGxheVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBhQ29udGVudEVkaXQgPSBvQ29udHJvbC5jb250ZW50RWRpdDtcblxuXHRcdFx0Ly8gaWYgKGFDb250ZW50RWRpdC5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBcdG9SbS5jbGFzcyhcInNhcFVpTWRjRmllbGRCYXNlTW9yZUZpZWxkc1wiKTtcblx0XHRcdC8vIH1cblx0XHRcdG9SbS5zdHlsZShcIndpZHRoXCIsIG9Db250cm9sLndpZHRoKTtcblx0XHRcdG9SbS5vcGVuRW5kKCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFDb250ZW50RWRpdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBvQ29udGVudCA9IGFDb250ZW50RWRpdFtpXTsgLy8gcmVuZGVyIHRoZSBjaGlsZCBDb250cm9sICBmb3IgZWRpdFxuXHRcdFx0XHRvUm0ucmVuZGVyQ29udHJvbChvQ29udGVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG9SbS5jbG9zZShcImRpdlwiKTsgLy8gZW5kIG9mIHRoZSBjb21wbGV0ZSBDb250cm9sXG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmllbGRXcmFwcGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O01BTU1BLFlBQVksV0FEakJDLGNBQWMsQ0FBQyxxQ0FBcUMsQ0FBQyxVQUVwREMsa0JBQWtCLENBQUMsMEJBQTBCLENBQUMsVUFHOUNDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBd0IsQ0FBQyxDQUFDLFVBRzNDRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLHFCQUFxQjtJQUFFQyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHN0RGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFHbERGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxZQUFZLEVBQUU7RUFB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