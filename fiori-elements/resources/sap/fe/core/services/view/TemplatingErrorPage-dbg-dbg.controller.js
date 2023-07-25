/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/Controller"], function (InternalRouting, ClassSupport, Controller) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let TemplatingErrorPage = (_dec = defineUI5Class("sap.fe.core.services.view.TemplatingErrorPage"), _dec2 = usingExtension(InternalRouting), _dec(_class = (_class2 = /*#__PURE__*/function (_Controller) {
    _inheritsLoose(TemplatingErrorPage, _Controller);
    function TemplatingErrorPage() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Controller.call(this, ...args) || this;
      _initializerDefineProperty(_this, "_routing", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    return TemplatingErrorPage;
  }(Controller), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return TemplatingErrorPage;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0aW5nRXJyb3JQYWdlIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIkludGVybmFsUm91dGluZyIsIkNvbnRyb2xsZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRlbXBsYXRpbmdFcnJvclBhZ2UuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCB1c2luZ0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnNlcnZpY2VzLnZpZXcuVGVtcGxhdGluZ0Vycm9yUGFnZVwiKVxuY2xhc3MgVGVtcGxhdGluZ0Vycm9yUGFnZSBleHRlbmRzIENvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZXJuYWxSb3V0aW5nKVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGVtcGxhdGluZ0Vycm9yUGFnZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztNQUtNQSxtQkFBbUIsV0FEeEJDLGNBQWMsQ0FBQywrQ0FBK0MsQ0FBQyxVQUU5REMsY0FBYyxDQUFDQyxlQUFlLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0VBQUEsRUFEQ0MsVUFBVTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQUs3QkosbUJBQW1CO0FBQUEifQ==