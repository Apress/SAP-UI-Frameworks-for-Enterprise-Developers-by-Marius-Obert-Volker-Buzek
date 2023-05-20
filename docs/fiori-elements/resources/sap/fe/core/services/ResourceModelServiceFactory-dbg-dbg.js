/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/ResourceModel", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (ResourceModel, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let ResourceModelService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(ResourceModelService, _Service);
    function ResourceModelService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.ResourceModelService = ResourceModelService;
    var _proto = ResourceModelService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext();
      const mSettings = oContext.settings;
      this.oFactory = oContext.factory;

      // When enhancing i18n keys the value in the last resource bundle takes precedence
      // hence arrange various resource bundles so that enhanceI18n provided by the application is the last.
      // The following order is used :
      // 1. sap.fe bundle - sap.fe.core.messagebundle (passed with mSettings.bundles)
      // 2. sap.fe bundle - sap.fe.templates.messagebundle (passed with mSettings.bundles)
      // 3. Multiple bundles passed by the application as part of enhanceI18n
      const aBundles = mSettings.bundles.concat(mSettings.enhanceI18n || []).map(function (vI18n) {
        // if value passed for enhanceI18n is a Resource Model, return the associated bundle
        // else the value is a bundleUrl, return Resource Bundle configuration so that a bundle can be created
        return typeof vI18n.isA === "function" && vI18n.isA("sap.ui.model.resource.ResourceModel") ? vI18n.getResourceBundle() : {
          bundleName: vI18n.replace(/\//g, ".")
        };
      });
      this.oResourceModel = new ResourceModel({
        bundleName: aBundles[0].bundleName,
        enhanceWith: aBundles.slice(1),
        async: true
      });
      if (oContext.scopeType === "component") {
        const oComponent = oContext.scopeObject;
        oComponent.setModel(this.oResourceModel, mSettings.modelName);
      }
      this.initPromise = Promise.all([this.oResourceModel.getResourceBundle(), this.oResourceModel._pEnhanced || Promise.resolve()]).then(oBundle => {
        this.oResourceModel.__bundle = oBundle[0];
        return this;
      });
    };
    _proto.getResourceModel = function getResourceModel() {
      return this.oResourceModel;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    _proto.exit = function exit() {
      // Deregister global instance
      this.oFactory.removeGlobalInstance();
    };
    return ResourceModelService;
  }(Service);
  _exports.ResourceModelService = ResourceModelService;
  let ResourceModelServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(ResourceModelServiceFactory, _ServiceFactory);
    function ResourceModelServiceFactory() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ServiceFactory.call(this, ...args) || this;
      _this._oInstances = {};
      return _this;
    }
    var _proto2 = ResourceModelServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const sKey = `${oServiceContext.scopeObject.getId()}_${oServiceContext.settings.bundles.join(",")}` + (oServiceContext.settings.enhanceI18n ? `,${oServiceContext.settings.enhanceI18n.join(",")}` : "");
      if (!this._oInstances[sKey]) {
        this._oInstances[sKey] = new ResourceModelService(Object.assign({
          factory: this
        }, oServiceContext));
      }
      return this._oInstances[sKey].initPromise;
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance() {
      this._oInstances = {};
    };
    return ResourceModelServiceFactory;
  }(ServiceFactory);
  return ResourceModelServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXNvdXJjZU1vZGVsU2VydmljZSIsImluaXQiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJtU2V0dGluZ3MiLCJzZXR0aW5ncyIsIm9GYWN0b3J5IiwiZmFjdG9yeSIsImFCdW5kbGVzIiwiYnVuZGxlcyIsImNvbmNhdCIsImVuaGFuY2VJMThuIiwibWFwIiwidkkxOG4iLCJpc0EiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsImJ1bmRsZU5hbWUiLCJyZXBsYWNlIiwib1Jlc291cmNlTW9kZWwiLCJSZXNvdXJjZU1vZGVsIiwiZW5oYW5jZVdpdGgiLCJzbGljZSIsImFzeW5jIiwic2NvcGVUeXBlIiwib0NvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwic2V0TW9kZWwiLCJtb2RlbE5hbWUiLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJfcEVuaGFuY2VkIiwicmVzb2x2ZSIsInRoZW4iLCJvQnVuZGxlIiwiX19idW5kbGUiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0SW50ZXJmYWNlIiwiZXhpdCIsInJlbW92ZUdsb2JhbEluc3RhbmNlIiwiU2VydmljZSIsIlJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeSIsIl9vSW5zdGFuY2VzIiwiY3JlYXRlSW5zdGFuY2UiLCJvU2VydmljZUNvbnRleHQiLCJzS2V5IiwiZ2V0SWQiLCJqb2luIiwiT2JqZWN0IiwiYXNzaWduIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcbnR5cGUgUmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncyA9IHtcblx0YnVuZGxlczogUmVzb3VyY2VCdW5kbGVbXTtcblx0ZW5oYW5jZUkxOG46IHN0cmluZ1tdO1xufTtcbmV4cG9ydCBjbGFzcyBSZXNvdXJjZU1vZGVsU2VydmljZSBleHRlbmRzIFNlcnZpY2U8UmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55PjtcblxuXHRvRmFjdG9yeSE6IFJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeTtcblxuXHRvUmVzb3VyY2VNb2RlbCE6IFJlc291cmNlTW9kZWw7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG1TZXR0aW5ncyA9IG9Db250ZXh0LnNldHRpbmdzO1xuXHRcdHRoaXMub0ZhY3RvcnkgPSBvQ29udGV4dC5mYWN0b3J5O1xuXG5cdFx0Ly8gV2hlbiBlbmhhbmNpbmcgaTE4biBrZXlzIHRoZSB2YWx1ZSBpbiB0aGUgbGFzdCByZXNvdXJjZSBidW5kbGUgdGFrZXMgcHJlY2VkZW5jZVxuXHRcdC8vIGhlbmNlIGFycmFuZ2UgdmFyaW91cyByZXNvdXJjZSBidW5kbGVzIHNvIHRoYXQgZW5oYW5jZUkxOG4gcHJvdmlkZWQgYnkgdGhlIGFwcGxpY2F0aW9uIGlzIHRoZSBsYXN0LlxuXHRcdC8vIFRoZSBmb2xsb3dpbmcgb3JkZXIgaXMgdXNlZCA6XG5cdFx0Ly8gMS4gc2FwLmZlIGJ1bmRsZSAtIHNhcC5mZS5jb3JlLm1lc3NhZ2VidW5kbGUgKHBhc3NlZCB3aXRoIG1TZXR0aW5ncy5idW5kbGVzKVxuXHRcdC8vIDIuIHNhcC5mZSBidW5kbGUgLSBzYXAuZmUudGVtcGxhdGVzLm1lc3NhZ2VidW5kbGUgKHBhc3NlZCB3aXRoIG1TZXR0aW5ncy5idW5kbGVzKVxuXHRcdC8vIDMuIE11bHRpcGxlIGJ1bmRsZXMgcGFzc2VkIGJ5IHRoZSBhcHBsaWNhdGlvbiBhcyBwYXJ0IG9mIGVuaGFuY2VJMThuXG5cdFx0Y29uc3QgYUJ1bmRsZXMgPSBtU2V0dGluZ3MuYnVuZGxlcy5jb25jYXQobVNldHRpbmdzLmVuaGFuY2VJMThuIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHZJMThuOiBhbnkpIHtcblx0XHRcdC8vIGlmIHZhbHVlIHBhc3NlZCBmb3IgZW5oYW5jZUkxOG4gaXMgYSBSZXNvdXJjZSBNb2RlbCwgcmV0dXJuIHRoZSBhc3NvY2lhdGVkIGJ1bmRsZVxuXHRcdFx0Ly8gZWxzZSB0aGUgdmFsdWUgaXMgYSBidW5kbGVVcmwsIHJldHVybiBSZXNvdXJjZSBCdW5kbGUgY29uZmlndXJhdGlvbiBzbyB0aGF0IGEgYnVuZGxlIGNhbiBiZSBjcmVhdGVkXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHZJMThuLmlzQSA9PT0gXCJmdW5jdGlvblwiICYmIHZJMThuLmlzQShcInNhcC51aS5tb2RlbC5yZXNvdXJjZS5SZXNvdXJjZU1vZGVsXCIpXG5cdFx0XHRcdD8gdkkxOG4uZ2V0UmVzb3VyY2VCdW5kbGUoKVxuXHRcdFx0XHQ6IHsgYnVuZGxlTmFtZTogdkkxOG4ucmVwbGFjZSgvXFwvL2csIFwiLlwiKSB9O1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5vUmVzb3VyY2VNb2RlbCA9IG5ldyBSZXNvdXJjZU1vZGVsKHtcblx0XHRcdGJ1bmRsZU5hbWU6IGFCdW5kbGVzWzBdLmJ1bmRsZU5hbWUsXG5cdFx0XHRlbmhhbmNlV2l0aDogYUJ1bmRsZXMuc2xpY2UoMSksXG5cdFx0XHRhc3luYzogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0aWYgKG9Db250ZXh0LnNjb3BlVHlwZSA9PT0gXCJjb21wb25lbnRcIikge1xuXHRcdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdFx0b0NvbXBvbmVudC5zZXRNb2RlbCh0aGlzLm9SZXNvdXJjZU1vZGVsLCBtU2V0dGluZ3MubW9kZWxOYW1lKTtcblx0XHR9XG5cblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5hbGwoW1xuXHRcdFx0dGhpcy5vUmVzb3VyY2VNb2RlbC5nZXRSZXNvdXJjZUJ1bmRsZSgpIGFzIFByb21pc2U8UmVzb3VyY2VCdW5kbGU+LFxuXHRcdFx0KHRoaXMub1Jlc291cmNlTW9kZWwgYXMgYW55KS5fcEVuaGFuY2VkIHx8IFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XSkudGhlbigob0J1bmRsZTogYW55W10pID0+IHtcblx0XHRcdCh0aGlzLm9SZXNvdXJjZU1vZGVsIGFzIGFueSkuX19idW5kbGUgPSBvQnVuZGxlWzBdO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRSZXNvdXJjZU1vZGVsKCkge1xuXHRcdHJldHVybiB0aGlzLm9SZXNvdXJjZU1vZGVsO1xuXHR9XG5cblx0Z2V0SW50ZXJmYWNlKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRleGl0KCkge1xuXHRcdC8vIERlcmVnaXN0ZXIgZ2xvYmFsIGluc3RhbmNlXG5cdFx0dGhpcy5vRmFjdG9yeS5yZW1vdmVHbG9iYWxJbnN0YW5jZSgpO1xuXHR9XG59XG5cbmNsYXNzIFJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PFJlc291cmNlTW9kZWxTZXJ2aWNlU2V0dGluZ3M+IHtcblx0X29JbnN0YW5jZXM6IFJlY29yZDxzdHJpbmcsIFJlc291cmNlTW9kZWxTZXJ2aWNlPiA9IHt9O1xuXG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8UmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncz4pIHtcblx0XHRjb25zdCBzS2V5ID1cblx0XHRcdGAke29TZXJ2aWNlQ29udGV4dC5zY29wZU9iamVjdC5nZXRJZCgpfV8ke29TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5idW5kbGVzLmpvaW4oXCIsXCIpfWAgK1xuXHRcdFx0KG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5lbmhhbmNlSTE4biA/IGAsJHtvU2VydmljZUNvbnRleHQuc2V0dGluZ3MuZW5oYW5jZUkxOG4uam9pbihcIixcIil9YCA6IFwiXCIpO1xuXG5cdFx0aWYgKCF0aGlzLl9vSW5zdGFuY2VzW3NLZXldKSB7XG5cdFx0XHR0aGlzLl9vSW5zdGFuY2VzW3NLZXldID0gbmV3IFJlc291cmNlTW9kZWxTZXJ2aWNlKE9iamVjdC5hc3NpZ24oeyBmYWN0b3J5OiB0aGlzIH0sIG9TZXJ2aWNlQ29udGV4dCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9vSW5zdGFuY2VzW3NLZXldLmluaXRQcm9taXNlO1xuXHR9XG5cblx0cmVtb3ZlR2xvYmFsSW5zdGFuY2UoKSB7XG5cdFx0dGhpcy5fb0luc3RhbmNlcyA9IHt9O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztNQVNhQSxvQkFBb0I7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxPQU9oQ0MsSUFBSSxHQUFKLGdCQUFPO01BQ04sTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsVUFBVSxFQUFFO01BQ2xDLE1BQU1DLFNBQVMsR0FBR0YsUUFBUSxDQUFDRyxRQUFRO01BQ25DLElBQUksQ0FBQ0MsUUFBUSxHQUFHSixRQUFRLENBQUNLLE9BQU87O01BRWhDO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBLE1BQU1DLFFBQVEsR0FBR0osU0FBUyxDQUFDSyxPQUFPLENBQUNDLE1BQU0sQ0FBQ04sU0FBUyxDQUFDTyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUNDLEdBQUcsQ0FBQyxVQUFVQyxLQUFVLEVBQUU7UUFDaEc7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