/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/HBox", "sap/ui/core/StashedControlSupport"], function (ClassSupport, HBox, StashedControlSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let StashableHBox = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.controls.StashableHBox", {
    designtime: "sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_HBox) {
    _inheritsLoose(StashableHBox, _HBox);
    function StashableHBox() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _HBox.call(this, ...args) || this;
      _initializerDefineProperty(_this, "title", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fallbackTitle", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = StashableHBox.prototype;
    /*
     * Set title of visible Title/Link control and own title property.
     */
    _proto.setTitle = function setTitle(sTitle) {
      const oControl = this.getTitleControl();
      if (oControl) {
        oControl.setText(sTitle);
      }
      this.title = sTitle;
      return this;
    }

    /*
     * Return the title property.
     */;
    _proto.getTitle = function getTitle() {
      return this.title || this.fallbackTitle;
    }

    /*
     * In case of UI changes, Title/Link text needs to be set to new value after Header Facet control and inner controls are rendered.
     * Else: title property needs to be initialized.
     */;
    _proto.onAfterRendering = function onAfterRendering() {
      if (this.title) {
        this.setTitle(this.title);
      } else {
        const oControl = this.getTitleControl();
        if (oControl) {
          this.title = oControl.getText();
        }
      }
    }

    /*
     * Retrieves Title/Link control from items aggregation.
     */;
    _proto.getTitleControl = function getTitleControl() {
      let aItems = [],
        content,
        i;
      if (this.getItems && this.getItems()[0] && this.getItems()[0].getItems) {
        aItems = this.getItems()[0].getItems();
      } else if (this.getItems && this.getItems()[0] && this.getItems()[0].getMicroChartTitle) {
        aItems = this.getItems()[0].getMicroChartTitle();
      }
      for (i = 0; i < aItems.length; i++) {
        if (aItems[i].isA("sap.m.Title") || aItems[i].isA("sap.m.Link")) {
          if (aItems[i].isA("sap.m.Title")) {
            // If a title was found, check if there is a link in the content aggregation
            content = aItems[i].getContent();
            if (content && content.isA("sap.m.Link")) {
              return content;
            }
          }
          return aItems[i];
        }
      }
      return null;
    };
    return StashableHBox;
  }(HBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fallbackTitle", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  StashedControlSupport.mixInto(StashableHBox);
  return StashableHBox;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFzaGFibGVIQm94IiwiZGVmaW5lVUk1Q2xhc3MiLCJkZXNpZ250aW1lIiwicHJvcGVydHkiLCJ0eXBlIiwic2V0VGl0bGUiLCJzVGl0bGUiLCJvQ29udHJvbCIsImdldFRpdGxlQ29udHJvbCIsInNldFRleHQiLCJ0aXRsZSIsImdldFRpdGxlIiwiZmFsbGJhY2tUaXRsZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJnZXRUZXh0IiwiYUl0ZW1zIiwiY29udGVudCIsImkiLCJnZXRJdGVtcyIsImdldE1pY3JvQ2hhcnRUaXRsZSIsImxlbmd0aCIsImlzQSIsImdldENvbnRlbnQiLCJIQm94IiwiU3Rhc2hlZENvbnRyb2xTdXBwb3J0IiwibWl4SW50byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3Rhc2hhYmxlSEJveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBIQm94IGZyb20gXCJzYXAvbS9IQm94XCI7XG5pbXBvcnQgU3Rhc2hlZENvbnRyb2xTdXBwb3J0IGZyb20gXCJzYXAvdWkvY29yZS9TdGFzaGVkQ29udHJvbFN1cHBvcnRcIjtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdGFzaGFibGVIQm94XCIsIHtcblx0ZGVzaWdudGltZTogXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvZGVzaWdudGltZS9TdGFzaGFibGVIQm94LmRlc2lnbnRpbWVcIlxufSlcbmNsYXNzIFN0YXNoYWJsZUhCb3ggZXh0ZW5kcyBIQm94IHtcblx0Lypcblx0ICogVGl0bGUgb2YgdGhlIEhlYWRlciBGYWNldC4gTm90IHZpc2libGUgb24gdGhlIFVJLiBWaXNpYmxlIG9uIHRoZSBVSSBpcyB0aGUgVGl0bGUgb3IgTGluayBjb250cm9sIGluc2lkZSB0aGUgaXRlbXMgYWdncmVnYXRpb24gb2YgdGhlIEhlYWRlciBGYWNldC5cblx0ICogTXVzdCBhbHdheXMgYmUgaW4gc3luYyB3aXRoIHRoZSB2aXNpYmxlIFRpdGxlIG9yIExpbmsgY29udHJvbC5cblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGl0bGUhOiBzdHJpbmc7XG5cblx0Lypcblx0ICogRmFsbGJhY2sgdGl0bGUgdG8gYmUgZGlzcGxheWVkIGlmIG5vIHRpdGxlIGlzIGF2YWlsYWJsZSAob25seSBuZWVkZWQgZm9yIGRpc3BsYXlpbmcgc3Rhc2hlZCBoZWFkZXIgZmFjZXRzIGluIEZsZXggZGlhbG9nKVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRmYWxsYmFja1RpdGxlITogc3RyaW5nO1xuXG5cdC8qXG5cdCAqIFNldCB0aXRsZSBvZiB2aXNpYmxlIFRpdGxlL0xpbmsgY29udHJvbCBhbmQgb3duIHRpdGxlIHByb3BlcnR5LlxuXHQgKi9cblx0c2V0VGl0bGUoc1RpdGxlOiBhbnkpIHtcblx0XHRjb25zdCBvQ29udHJvbCA9IHRoaXMuZ2V0VGl0bGVDb250cm9sKCk7XG5cdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRvQ29udHJvbC5zZXRUZXh0KHNUaXRsZSk7XG5cdFx0fVxuXHRcdHRoaXMudGl0bGUgPSBzVGl0bGU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qXG5cdCAqIFJldHVybiB0aGUgdGl0bGUgcHJvcGVydHkuXG5cdCAqL1xuXHRnZXRUaXRsZSgpIHtcblx0XHRyZXR1cm4gdGhpcy50aXRsZSB8fCB0aGlzLmZhbGxiYWNrVGl0bGU7XG5cdH1cblxuXHQvKlxuXHQgKiBJbiBjYXNlIG9mIFVJIGNoYW5nZXMsIFRpdGxlL0xpbmsgdGV4dCBuZWVkcyB0byBiZSBzZXQgdG8gbmV3IHZhbHVlIGFmdGVyIEhlYWRlciBGYWNldCBjb250cm9sIGFuZCBpbm5lciBjb250cm9scyBhcmUgcmVuZGVyZWQuXG5cdCAqIEVsc2U6IHRpdGxlIHByb3BlcnR5IG5lZWRzIHRvIGJlIGluaXRpYWxpemVkLlxuXHQgKi9cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRpZiAodGhpcy50aXRsZSkge1xuXHRcdFx0dGhpcy5zZXRUaXRsZSh0aGlzLnRpdGxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSB0aGlzLmdldFRpdGxlQ29udHJvbCgpO1xuXHRcdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRcdHRoaXMudGl0bGUgPSBvQ29udHJvbC5nZXRUZXh0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Lypcblx0ICogUmV0cmlldmVzIFRpdGxlL0xpbmsgY29udHJvbCBmcm9tIGl0ZW1zIGFnZ3JlZ2F0aW9uLlxuXHQgKi9cblx0Z2V0VGl0bGVDb250cm9sKCkge1xuXHRcdGxldCBhSXRlbXMgPSBbXSxcblx0XHRcdGNvbnRlbnQsXG5cdFx0XHRpO1xuXHRcdGlmICh0aGlzLmdldEl0ZW1zICYmIHRoaXMuZ2V0SXRlbXMoKVswXSAmJiAodGhpcy5nZXRJdGVtcygpWzBdIGFzIGFueSkuZ2V0SXRlbXMpIHtcblx0XHRcdGFJdGVtcyA9ICh0aGlzLmdldEl0ZW1zKClbMF0gYXMgYW55KS5nZXRJdGVtcygpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5nZXRJdGVtcyAmJiB0aGlzLmdldEl0ZW1zKClbMF0gJiYgKHRoaXMuZ2V0SXRlbXMoKVswXSBhcyBhbnkpLmdldE1pY3JvQ2hhcnRUaXRsZSkge1xuXHRcdFx0YUl0ZW1zID0gKHRoaXMuZ2V0SXRlbXMoKVswXSBhcyBhbnkpLmdldE1pY3JvQ2hhcnRUaXRsZSgpO1xuXHRcdH1cblx0XHRmb3IgKGkgPSAwOyBpIDwgYUl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoYUl0ZW1zW2ldLmlzQShcInNhcC5tLlRpdGxlXCIpIHx8IGFJdGVtc1tpXS5pc0EoXCJzYXAubS5MaW5rXCIpKSB7XG5cdFx0XHRcdGlmIChhSXRlbXNbaV0uaXNBKFwic2FwLm0uVGl0bGVcIikpIHtcblx0XHRcdFx0XHQvLyBJZiBhIHRpdGxlIHdhcyBmb3VuZCwgY2hlY2sgaWYgdGhlcmUgaXMgYSBsaW5rIGluIHRoZSBjb250ZW50IGFnZ3JlZ2F0aW9uXG5cdFx0XHRcdFx0Y29udGVudCA9IGFJdGVtc1tpXS5nZXRDb250ZW50KCk7XG5cdFx0XHRcdFx0aWYgKGNvbnRlbnQgJiYgY29udGVudC5pc0EoXCJzYXAubS5MaW5rXCIpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGVudDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGFJdGVtc1tpXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblN0YXNoZWRDb250cm9sU3VwcG9ydC5taXhJbnRvKFN0YXNoYWJsZUhCb3gpO1xuXG5leHBvcnQgZGVmYXVsdCBTdGFzaGFibGVIQm94O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O01BTU1BLGFBQWEsV0FIbEJDLGNBQWMsQ0FBQyxvREFBb0QsRUFBRTtJQUNyRUMsVUFBVSxFQUFFO0VBQ2IsQ0FBQyxDQUFDLFVBTUFDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFNNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFHN0I7QUFDRDtBQUNBO0lBRkMsT0FHQUMsUUFBUSxHQUFSLGtCQUFTQyxNQUFXLEVBQUU7TUFDckIsTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsZUFBZSxFQUFFO01BQ3ZDLElBQUlELFFBQVEsRUFBRTtRQUNiQSxRQUFRLENBQUNFLE9BQU8sQ0FBQ0gsTUFBTSxDQUFDO01BQ3pCO01BQ0EsSUFBSSxDQUFDSSxLQUFLLEdBQUdKLE1BQU07TUFFbkIsT0FBTyxJ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