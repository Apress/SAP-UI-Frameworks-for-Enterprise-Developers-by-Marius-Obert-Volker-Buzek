/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (Service, ServiceFactory) {
  "use strict";

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let AsyncComponentService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(AsyncComponentService, _Service);
    function AsyncComponentService() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = AsyncComponentService.prototype;
    // !: means that we know it will be assigned before usage
    _proto.init = function init() {
      this.initPromise = new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
      });
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      const oServices = oComponent._getManifestEntry("/sap.ui5/services", true);
      Promise.all(Object.keys(oServices).filter(sServiceKey => oServices[sServiceKey].startup === "waitFor" && oServices[sServiceKey].factoryName !== "sap.fe.core.services.AsyncComponentService").map(sServiceKey => {
        return oComponent.getService(sServiceKey).then(oServiceInstance => {
          const sMethodName = `get${sServiceKey[0].toUpperCase()}${sServiceKey.substr(1)}`;
          if (!oComponent.hasOwnProperty(sMethodName)) {
            oComponent[sMethodName] = function () {
              return oServiceInstance;
            };
          }
        });
      })).then(() => {
        return oComponent.pRootControlLoaded || Promise.resolve();
      }).then(() => {
        // notifiy the component
        if (oComponent.onServicesStarted) {
          oComponent.onServicesStarted();
        }
        this.resolveFn(this);
      }).catch(this.rejectFn);
    };
    return AsyncComponentService;
  }(Service);
  let AsyncComponentServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(AsyncComponentServiceFactory, _ServiceFactory);
    function AsyncComponentServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = AsyncComponentServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const asyncComponentService = new AsyncComponentService(oServiceContext);
      return asyncComponentService.initPromise;
    };
    return AsyncComponentServiceFactory;
  }(ServiceFactory);
  return AsyncComponentServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBc3luY0NvbXBvbmVudFNlcnZpY2UiLCJpbml0IiwiaW5pdFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlc29sdmVGbiIsInJlamVjdEZuIiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwib0NvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwib1NlcnZpY2VzIiwiX2dldE1hbmlmZXN0RW50cnkiLCJhbGwiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwic1NlcnZpY2VLZXkiLCJzdGFydHVwIiwiZmFjdG9yeU5hbWUiLCJtYXAiLCJnZXRTZXJ2aWNlIiwidGhlbiIsIm9TZXJ2aWNlSW5zdGFuY2UiLCJzTWV0aG9kTmFtZSIsInRvVXBwZXJDYXNlIiwic3Vic3RyIiwiaGFzT3duUHJvcGVydHkiLCJwUm9vdENvbnRyb2xMb2FkZWQiLCJvblNlcnZpY2VzU3RhcnRlZCIsImNhdGNoIiwiU2VydmljZSIsIkFzeW5jQ29tcG9uZW50U2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsImFzeW5jQ29tcG9uZW50U2VydmljZSIsIlNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcblxudHlwZSBBc3luY0NvbXBvbmVudFNldHRpbmdzID0ge307XG5cbmNsYXNzIEFzeW5jQ29tcG9uZW50U2VydmljZSBleHRlbmRzIFNlcnZpY2U8QXN5bmNDb21wb25lbnRTZXR0aW5ncz4ge1xuXHRyZXNvbHZlRm46IGFueTtcblxuXHRyZWplY3RGbjogYW55O1xuXG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXHQvLyAhOiBtZWFucyB0aGF0IHdlIGtub3cgaXQgd2lsbCBiZSBhc3NpZ25lZCBiZWZvcmUgdXNhZ2VcblxuXHRpbml0KCkge1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLnJlc29sdmVGbiA9IHJlc29sdmU7XG5cdFx0XHR0aGlzLnJlamVjdEZuID0gcmVqZWN0O1xuXHRcdH0pO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0IGFzIGFueTtcblx0XHRjb25zdCBvU2VydmljZXMgPSBvQ29tcG9uZW50Ll9nZXRNYW5pZmVzdEVudHJ5KFwiL3NhcC51aTUvc2VydmljZXNcIiwgdHJ1ZSk7XG5cdFx0UHJvbWlzZS5hbGwoXG5cdFx0XHRPYmplY3Qua2V5cyhvU2VydmljZXMpXG5cdFx0XHRcdC5maWx0ZXIoXG5cdFx0XHRcdFx0KHNTZXJ2aWNlS2V5KSA9PlxuXHRcdFx0XHRcdFx0b1NlcnZpY2VzW3NTZXJ2aWNlS2V5XS5zdGFydHVwID09PSBcIndhaXRGb3JcIiAmJlxuXHRcdFx0XHRcdFx0b1NlcnZpY2VzW3NTZXJ2aWNlS2V5XS5mYWN0b3J5TmFtZSAhPT0gXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5Bc3luY0NvbXBvbmVudFNlcnZpY2VcIlxuXHRcdFx0XHQpXG5cdFx0XHRcdC5tYXAoKHNTZXJ2aWNlS2V5KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db21wb25lbnQuZ2V0U2VydmljZShzU2VydmljZUtleSkudGhlbigob1NlcnZpY2VJbnN0YW5jZTogU2VydmljZTxhbnk+KSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBzTWV0aG9kTmFtZSA9IGBnZXQke3NTZXJ2aWNlS2V5WzBdLnRvVXBwZXJDYXNlKCl9JHtzU2VydmljZUtleS5zdWJzdHIoMSl9YDtcblx0XHRcdFx0XHRcdGlmICghb0NvbXBvbmVudC5oYXNPd25Qcm9wZXJ0eShzTWV0aG9kTmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0b0NvbXBvbmVudFtzTWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9TZXJ2aWNlSW5zdGFuY2U7XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pXG5cdFx0KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5wUm9vdENvbnRyb2xMb2FkZWQgfHwgUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHQvLyBub3RpZml5IHRoZSBjb21wb25lbnRcblx0XHRcdFx0aWYgKG9Db21wb25lbnQub25TZXJ2aWNlc1N0YXJ0ZWQpIHtcblx0XHRcdFx0XHRvQ29tcG9uZW50Lm9uU2VydmljZXNTdGFydGVkKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZXNvbHZlRm4odGhpcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKHRoaXMucmVqZWN0Rm4pO1xuXHR9XG59XG5cbmNsYXNzIEFzeW5jQ29tcG9uZW50U2VydmljZUZhY3RvcnkgZXh0ZW5kcyBTZXJ2aWNlRmFjdG9yeTxBc3luY0NvbXBvbmVudFNldHRpbmdzPiB7XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8QXN5bmNDb21wb25lbnRTZXR0aW5ncz4pIHtcblx0XHRjb25zdCBhc3luY0NvbXBvbmVudFNlcnZpY2UgPSBuZXcgQXN5bmNDb21wb25lbnRTZXJ2aWNlKG9TZXJ2aWNlQ29udGV4dCk7XG5cdFx0cmV0dXJuIGFzeW5jQ29tcG9uZW50U2VydmljZS5pbml0UHJv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