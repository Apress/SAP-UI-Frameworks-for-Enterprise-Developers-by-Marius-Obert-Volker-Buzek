/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Control"], function (ClassSupport, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FormElementWrapper = (_dec = defineUI5Class("sap.fe.core.controls.FormElementWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(FormElementWrapper, _Control);
    function FormElementWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FormElementWrapper.prototype;
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      const oContent = this.content;
      return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
    };
    FormElementWrapper.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.style("min-height", "1rem");
      oRm.style("width", oControl.width);
      oRm.openEnd();
      oRm.openStart("div");
      oRm.style("display", "flex");
      oRm.style("box-sizing", "border-box");
      oRm.style("justify-content", "space-between");
      oRm.style("align-items", "center");
      oRm.style("flex-wrap", "wrap");
      oRm.style("align-content", "stretch");
      oRm.style("width", "100%");
      oRm.openEnd();
      oRm.renderControl(oControl.content); // render the child Control
      oRm.close("div");
      oRm.close("div"); // end of the complete Control
    };
    return FormElementWrapper;
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FormElementWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudFdyYXBwZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJpc0RlZmF1bHQiLCJnZXRBY2Nlc3NpYmlsaXR5SW5mbyIsIm9Db250ZW50IiwiY29udGVudCIsInJlbmRlciIsIm9SbSIsIm9Db250cm9sIiwib3BlblN0YXJ0Iiwic3R5bGUiLCJ3aWR0aCIsIm9wZW5FbmQiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb3JtRWxlbWVudFdyYXBwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBpbXBsZW1lbnRJbnRlcmZhY2UsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgeyBDU1NTaXplLCBJRm9ybUNvbnRlbnQgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5Gb3JtRWxlbWVudFdyYXBwZXJcIilcbmNsYXNzIEZvcm1FbGVtZW50V3JhcHBlciBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ1NTU2l6ZVwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogbnVsbFxuXHR9KVxuXHR3aWR0aCE6IENTU1NpemU7XG5cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdH0pXG5cdGZvcm1Eb05vdEFkanVzdFdpZHRoITogYm9vbGVhbjtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IGZhbHNlLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Y29udGVudCE6IENvbnRyb2w7XG5cblx0Z2V0QWNjZXNzaWJpbGl0eUluZm8oKSB7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0cmV0dXJuIG9Db250ZW50ICYmIG9Db250ZW50LmdldEFjY2Vzc2liaWxpdHlJbmZvID8gb0NvbnRlbnQuZ2V0QWNjZXNzaWJpbGl0eUluZm8oKSA6IHt9O1xuXHR9XG5cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBGb3JtRWxlbWVudFdyYXBwZXIpIHtcblx0XHRvUm0ub3BlblN0YXJ0KFwiZGl2XCIsIG9Db250cm9sKTtcblx0XHRvUm0uc3R5bGUoXCJtaW4taGVpZ2h0XCIsIFwiMXJlbVwiKTtcblx0XHRvUm0uc3R5bGUoXCJ3aWR0aFwiLCBvQ29udHJvbC53aWR0aCk7XG5cdFx0b1JtLm9wZW5FbmQoKTtcblxuXHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIik7XG5cdFx0b1JtLnN0eWxlKFwiZGlzcGxheVwiLCBcImZsZXhcIik7XG5cdFx0b1JtLnN0eWxlKFwiYm94LXNpemluZ1wiLCBcImJvcmRlci1ib3hcIik7XG5cdFx0b1JtLnN0eWxlKFwianVzdGlmeS1jb250ZW50XCIsIFwic3BhY2UtYmV0d2VlblwiKTtcblx0XHRvUm0uc3R5bGUoXCJhbGlnbi1pdGVtc1wiLCBcImNlbnRlclwiKTtcblx0XHRvUm0uc3R5bGUoXCJmbGV4LXdyYXBcIiwgXCJ3cmFwXCIpO1xuXHRcdG9SbS5zdHlsZShcImFsaWduLWNvbnRlbnRcIiwgXCJzdHJldGNoXCIpO1xuXHRcdG9SbS5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKTtcblx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLmNvbnRlbnQpOyAvLyByZW5kZXIgdGhlIGNoaWxkIENvbnRyb2xcblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7XG5cdFx0b1JtLmNsb3NlKFwiZGl2XCIpOyAvLyBlbmQgb2YgdGhlIGNvbXBsZXRlIENvbnRyb2xcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgRm9ybUVsZW1lbnRXcmFwcGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7TUFNTUEsa0JBQWtCLFdBRHZCQyxjQUFjLENBQUMseUNBQXlDLENBQUMsVUFFeERDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLFVBRzlDQyxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLHFCQUFxQjtJQUMzQkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUMsVUFHREMsV0FBVyxDQUFDO0lBQUVGLElBQUksRUFBRSxxQkFBcUI7SUFBRUcsUUFBUSxFQUFFLEtBQUs7SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BRy9FQyxvQkFBb0IsR0FBcEIsZ0NBQXVCO01BQ3RCLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLE9BQU87TUFDN0IsT0FBT0QsUUFBUSxJQUFJQSxRQUFRLENBQUNELG9CQUFvQixHQUFHQyxRQUFRLENBQUNELG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFBQSxtQkFFTUcsTUFBTSxHQUFiLGdCQUFjQyxHQUFrQixFQUFFQyxRQUE0QixFQUFFO01BQy9ERCxHQUFHLENBQUNFLFNBQVMsQ0FBQyxLQUFLLEVBQUVELFFBQVEsQ0FBQztNQUM5QkQsR0FBRyxDQUFDRyxLQUFLLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQztNQUMvQkgsR0FBRyxDQUFDRyxLQUFLLENBQUMsT0FBTyxFQUFFRixRQUFRLENBQUNHLEtBQUssQ0FBQztNQUNsQ0osR0FBRyxDQUFDSyxPQUFPLEVBQUU7TUFFYkwsR0FBRyxDQUFDRSxTQUFTLENBQUMsS0FBSyxDQUFDO01BQ3BCRixHQUFHLENBQUNHLEtBQUssQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO01BQzVCSCxHQUFHLENBQUNHLEtBQUssQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO01BQ3JDSCxHQUFHLENBQUNHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUM7TUFDN0NILEdBQUcsQ0FBQ0csS0FBSyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7TUFDbENILEdBQUcsQ0FBQ0csS0FBSyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7TUFDOUJILEdBQUcsQ0FBQ0csS0FBSyxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUM7TUFDckNILEdBQUcsQ0FBQ0csS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7TUFDMUJILEdBQUcsQ0FBQ0ssT0FBTyxFQUFFO01BQ2JMLEdBQUcsQ0FBQ00sYUFBYSxDQUFDTCxRQUFRLENBQUNILE9BQU8sQ0FBQyxDQUFDLENBQUM7TUFDckNFLEdBQUcsQ0FBQ08sS0FBSyxDQUFDLEtBQUssQ0FBQztNQUNoQlAsR0FBRyxDQUFDTyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBQUE7RUFBQSxFQTFDK0JDLE9BQU87SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BRVcsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQTBDeENyQixrQkFBa0I7QUFBQSJ9