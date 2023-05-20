/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/Page", "sap/ui/base/ManagedObject", "sap/ui/core/mvc/View", "sap/fe/core/jsx-runtime/jsx"], function (ClassSupport, Page, ManagedObject, View, _jsx) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ViewLoader = (_dec = defineUI5Class("sap.fe.core.jsx-runtime.MDXViewLoader"), _dec2 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_View) {
    _inheritsLoose(ViewLoader, _View);
    function ViewLoader() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _View.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewName", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ViewLoader;
    var _proto = ViewLoader.prototype;
    _proto.loadDependency = function loadDependency(name) {
      return new Promise(resolve => {
        sap.ui.require([name], async MDXContent => {
          resolve(MDXContent);
        });
      });
    };
    _proto.getControllerName = function getControllerName() {
      const viewData = this.getViewData();
      return viewData.controllerName;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ;
    _proto.createContent = async function createContent(oController) {
      const viewData = this.getViewData();
      const MDXContent = viewData.viewContent || (await this.loadDependency(viewData._mdxViewName));
      ViewLoader.preprocessorData = this.mPreprocessors.xml;
      ViewLoader.controller = oController;
      const mdxContent = ManagedObject.runWithPreprocessors(() => {
        return MDXContent();
      }, {
        id: sId => {
          return this.createId(sId);
        }
      });
      return _jsx(Page, {
        class: "sapUiContentPadding",
        children: {
          content: mdxContent
        }
      });
    };
    return ViewLoader;
  }(View), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewName", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ViewLoader;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaWV3TG9hZGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJsb2FkRGVwZW5kZW5jeSIsIm5hbWUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNhcCIsInVpIiwicmVxdWlyZSIsIk1EWENvbnRlbnQiLCJnZXRDb250cm9sbGVyTmFtZSIsInZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJjb250cm9sbGVyTmFtZSIsImNyZWF0ZUNvbnRlbnQiLCJvQ29udHJvbGxlciIsInZpZXdDb250ZW50IiwiX21keFZpZXdOYW1lIiwicHJlcHJvY2Vzc29yRGF0YSIsIm1QcmVwcm9jZXNzb3JzIiwieG1sIiwiY29udHJvbGxlciIsIm1keENvbnRlbnQiLCJNYW5hZ2VkT2JqZWN0IiwicnVuV2l0aFByZXByb2Nlc3NvcnMiLCJpZCIsInNJZCIsImNyZWF0ZUlkIiwiY29udGVudCIsIlZpZXciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZpZXdMb2FkZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFBhZ2UgZnJvbSBcInNhcC9tL1BhZ2VcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5cbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5cbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHsgTWFuYWdlZE9iamVjdEV4IH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3R5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5qc3gtcnVudGltZS5NRFhWaWV3TG9hZGVyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3TG9hZGVyIGV4dGVuZHMgVmlldyB7XG5cdHN0YXRpYyBwcmVwcm9jZXNzb3JEYXRhOiBhbnk7XG5cblx0c3RhdGljIGNvbnRyb2xsZXI6IGFueTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpZXdOYW1lITogc3RyaW5nO1xuXG5cdGxvYWREZXBlbmRlbmN5KG5hbWU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRzYXAudWkucmVxdWlyZShbbmFtZV0sIGFzeW5jIChNRFhDb250ZW50OiBGdW5jdGlvbikgPT4ge1xuXHRcdFx0XHRyZXNvbHZlKE1EWENvbnRlbnQpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRDb250cm9sbGVyTmFtZSgpIHtcblx0XHRjb25zdCB2aWV3RGF0YSA9IHRoaXMuZ2V0Vmlld0RhdGEoKSBhcyBhbnk7XG5cdFx0cmV0dXJuIHZpZXdEYXRhLmNvbnRyb2xsZXJOYW1lO1xuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHQvLyBAdHMtaWdub3JlXG5cdGFzeW5jIGNyZWF0ZUNvbnRlbnQob0NvbnRyb2xsZXI6IGFueSk6IFByb21pc2U8Q29udHJvbD4ge1xuXHRcdGNvbnN0IHZpZXdEYXRhID0gdGhpcy5nZXRWaWV3RGF0YSgpIGFzIGFueTtcblx0XHRjb25zdCBNRFhDb250ZW50ID0gdmlld0RhdGEudmlld0NvbnRlbnQgfHwgKGF3YWl0IHRoaXMubG9hZERlcGVuZGVuY3kodmlld0RhdGEuX21keFZpZXdOYW1lKSk7XG5cdFx0Vmlld0xvYWRlci5wcmVwcm9jZXNzb3JEYXRhID0gKHRoaXMgYXMgYW55KS5tUHJlcHJvY2Vzc29ycy54bWw7XG5cdFx0Vmlld0xvYWRlci5jb250cm9sbGVyID0gb0NvbnRyb2xsZXI7XG5cdFx0Y29uc3QgbWR4Q29udGVudCA9IChNYW5hZ2VkT2JqZWN0IGFzIE1hbmFnZWRPYmplY3RFeCkucnVuV2l0aFByZXByb2Nlc3NvcnMoXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBNRFhDb250ZW50KCk7XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogKHNJZDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlSWQoc0lkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0cmV0dXJuIDxQYWdlIGNsYXNzPXtcInNhcFVpQ29udGVudFBhZGRpbmdcIn0+e3sgY29udGVudDogbWR4Q29udGVudCB9fTwvUGFnZT47XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7TUFVcUJBLFVBQVUsV0FEOUJDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxVQU10REMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBLE9BRzdCQyxjQUFjLEdBQWQsd0JBQWVDLElBQVksRUFBZ0I7TUFDMUMsT0FBTyxJQUFJQyxPQUFPLENBQUVDLE9BQU8sSUFBSztRQUMvQkMsR0FBRyxDQUFDQyxFQUFFLENBQUNDLE9BQU8sQ0FBQyxDQUFDTCxJQUFJLENBQUMsRUFBRSxNQUFPTSxVQUFvQixJQUFLO1VBQ3RESixPQUFPLENBQUNJLFVBQVUsQ0FBQztRQUNwQixDQUFDLENBQUM7TUFDSCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBQUEsT0FFREMsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQixNQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxXQUFXLEVBQVM7TUFDMUMsT0FBT0QsUUFBUSxDQUFDRSxjQUFjO0lBQy9COztJQUVBO0lBQ0E7SUFBQTtJQUFBLE9BQ01DLGFBQWEsR0FBbkIsNkJBQW9CQyxXQUFnQixFQUFvQjtNQUN2RCxNQUFNSixRQUFRLEdBQUcsSUFBSSxDQUFDQyxXQUFXLEVBQVM7TUFDMUMsTUFBTUgsVUFBVSxHQUFHRSxRQUFRLENBQUNLLFdBQVcsS0FBSyxNQUFNLElBQUksQ0FBQ2QsY0FBYyxDQUFDUyxRQUFRLENBQUNNLFlBQVksQ0FBQyxDQUFDO01BQzdGbkIsVUFBVSxDQUFDb0IsZ0JBQWdCLEdBQUksSUFBSSxDQUFTQyxjQUFjLENBQUNDLEdBQUc7TUFDOUR0QixVQUFVLENBQUN1QixVQUFVLEdBQUdOLFdBQVc7TUFDbkMsTUFBTU8sVUFBVSxHQUFJQyxhQUFhLENBQXFCQyxvQkFBb0IsQ0FDekUsTUFBTTtRQUNMLE9BQU9mLFVBQVUsRUFBRTtNQUNwQixDQUFDLEVBQ0Q7UUFDQ2dCLEVBQUUsRUFBR0MsR0FBVyxJQUFLO1VBQ3BCLE9BQU8sSUFBSSxDQUFDQyxRQUFRLENBQUNELEdBQUcsQ0FBQztRQUMxQjtNQUNELENBQUMsQ0FDRDtNQUNELE9BQU8sS0FBQyxJQUFJO1FBQUMsS0FBSyxFQUFFLHFCQUFzQjtRQUFBLFVBQUU7VUFBRUUsT0FBTyxFQUFFTjtRQUFXO01BQUMsRUFBUTtJQUM1RSxDQUFDO0lBQUE7RUFBQSxFQXZDc0NPLElBQUk7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=