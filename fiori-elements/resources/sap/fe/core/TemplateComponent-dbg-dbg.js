/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/UIComponent", "sap/ui/mdc/p13n/StateUtil"], function (CommonUtils, ClassSupport, UIComponent, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let TemplateComponent = (_dec = defineUI5Class("sap.fe.core.TemplateComponent"), _dec2 = implementInterface("sap.ui.core.IAsyncContentCreation"), _dec3 = property({
    type: "string",
    defaultValue: null
  }), _dec4 = property({
    type: "string",
    defaultValue: null
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "object"
  }), _dec7 = property({
    type: "string[]"
  }), _dec8 = property({
    type: "object"
  }), _dec9 = property({
    type: "object"
  }), _dec10 = property({
    type: "boolean"
  }), _dec11 = property({
    type: "object"
  }), _dec12 = property({
    type: "string"
  }), _dec13 = event(), _dec14 = event(), _dec15 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_UIComponent) {
    _inheritsLoose(TemplateComponent, _UIComponent);
    function TemplateComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UIComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IAsyncContentCreation", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingContextPattern", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigation", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enhanceI18n", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "controlConfiguration", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "allowDeepLinking", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "refreshStrategyOnAppRestore", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewType", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "containerDefined", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "heroesBatchReceived", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "workersBatchReceived", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = TemplateComponent.prototype;
    _proto.setContainer = function setContainer(oContainer) {
      _UIComponent.prototype.setContainer.call(this, oContainer);
      this.fireEvent("containerDefined", {
        container: oContainer
      });
      return this;
    };
    _proto.init = function init() {
      this.oAppComponent = CommonUtils.getAppComponent(this);
      _UIComponent.prototype.init.call(this);
      const oStateChangeHandler = function (oEvent) {
        const oControl = oEvent.getParameter("control");
        if (oControl.isA("sap.ui.mdc.Table") || oControl.isA("sap.ui.mdc.FilterBar") || oControl.isA("sap.ui.mdc.Chart")) {
          const oMacroAPI = oControl.getParent();
          if (oMacroAPI !== null && oMacroAPI !== void 0 && oMacroAPI.fireStateChange) {
            oMacroAPI.fireStateChange();
          }
        }
      };
      StateUtil.detachStateChange(oStateChangeHandler);
      StateUtil.attachStateChange(oStateChangeHandler);
    }

    // This method is called by UI5 core to access to the component containing the customizing configuration.
    // as controller extensions are defined in the manifest for the app component and not for the
    // template component we return the app component.
    ;
    _proto.getExtensionComponent = function getExtensionComponent() {
      return this.oAppComponent;
    };
    _proto.getRootController = function getRootController() {
      const rootControl = this.getRootControl();
      let rootController;
      if (rootControl && rootControl.getController) {
        rootController = rootControl.getController();
      }
      return rootController;
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      const rootController = this.getRootController();
      if (rootController && rootController.onPageReady) {
        rootController.onPageReady(mParameters);
      }
    };
    _proto.getNavigationConfiguration = function getNavigationConfiguration(sTargetPath) {
      const mNavigation = this.navigation;
      return mNavigation[sTargetPath];
    };
    _proto.getViewData = function getViewData() {
      const mProperties = this.getMetadata().getAllProperties();
      const oViewData = Object.keys(mProperties).reduce((mViewData, sPropertyName) => {
        mViewData[sPropertyName] = mProperties[sPropertyName].get(this);
        return mViewData;
      }, {});

      // Access the internal _isFclEnabled which will be there
      oViewData.fclEnabled = this.oAppComponent._isFclEnabled();
      return oViewData;
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const rootControl = this.getRootControl();
      if (rootControl && rootControl.getController() && rootControl.getController()._getPageTitleInformation) {
        return rootControl.getController()._getPageTitleInformation();
      } else {
        return {};
      }
    };
    _proto.getExtensionAPI = function getExtensionAPI() {
      return this.getRootControl().getController().getExtensionAPI();
    };
    return TemplateComponent;
  }(UIComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IAsyncContentCreation", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return null;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return null;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "bindingContextPattern", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "navigation", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "enhanceI18n", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "controlConfiguration", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "allowDeepLinking", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "refreshStrategyOnAppRestore", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "viewType", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "XML";
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "containerDefined", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "heroesBatchReceived", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "workersBatchReceived", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return TemplateComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbXBvbmVudCIsImRlZmluZVVJNUNsYXNzIiwiaW1wbGVtZW50SW50ZXJmYWNlIiwicHJvcGVydHkiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiZXZlbnQiLCJzZXRDb250YWluZXIiLCJvQ29udGFpbmVyIiwiZmlyZUV2ZW50IiwiY29udGFpbmVyIiwiaW5pdCIsIm9BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsIm9TdGF0ZUNoYW5nZUhhbmRsZXIiLCJvRXZlbnQiLCJvQ29udHJvbCIsImdldFBhcmFtZXRlciIsImlzQSIsIm9NYWNyb0FQSSIsImdldFBhcmVudCIsImZpcmVTdGF0ZUNoYW5nZSIsIlN0YXRlVXRpbCIsImRldGFjaFN0YXRlQ2hhbmdlIiwiYXR0YWNoU3RhdGVDaGFuZ2UiLCJnZXRFeHRlbnNpb25Db21wb25lbnQiLCJnZXRSb290Q29udHJvbGxlciIsInJvb3RDb250cm9sIiwiZ2V0Um9vdENvbnRyb2wiLCJyb290Q29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJvblBhZ2VSZWFkeSIsIm1QYXJhbWV0ZXJzIiwiZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJzVGFyZ2V0UGF0aCIsIm1OYXZpZ2F0aW9uIiwibmF2aWdhdGlvbiIsImdldFZpZXdEYXRhIiwibVByb3BlcnRpZXMiLCJnZXRNZXRhZGF0YSIsImdldEFsbFByb3BlcnRpZXMiLCJvVmlld0RhdGEiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwibVZpZXdEYXRhIiwic1Byb3BlcnR5TmFtZSIsImdldCIsImZjbEVuYWJsZWQiLCJfaXNGY2xFbmFibGVkIiwiX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uIiwiZ2V0RXh0ZW5zaW9uQVBJIiwiVUlDb21wb25lbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRlbXBsYXRlQ29tcG9uZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCwgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbXBvbmVudENvbnRhaW5lciBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50Q29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSB7IElBc3luY0NvbnRlbnRDcmVhdGlvbiB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IFN0YXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9wMTNuL1N0YXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxudHlwZSBOYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiA9IHtcblx0ZGV0YWlsOiB7XG5cdFx0cm91dGU6IHN0cmluZztcblx0XHRwYXJhbWV0ZXJzOiB1bmtub3duO1xuXHR9O1xufTtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuVGVtcGxhdGVDb21wb25lbnRcIilcbmNsYXNzIFRlbXBsYXRlQ29tcG9uZW50IGV4dGVuZHMgVUlDb21wb25lbnQgaW1wbGVtZW50cyBJQXN5bmNDb250ZW50Q3JlYXRpb24ge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUFzeW5jQ29udGVudENyZWF0aW9uXCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUFzeW5jQ29udGVudENyZWF0aW9uID0gdHJ1ZTtcblxuXHQvKipcblx0ICogTmFtZSBvZiB0aGUgT0RhdGEgZW50aXR5IHNldFxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdGVudGl0eVNldDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENvbnRleHQgUGF0aCBmb3IgcmVuZGVyaW5nIHRoZSB0ZW1wbGF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdGNvbnRleHRQYXRoOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuXHQvKipcblx0ICogVGhlIHBhdHRlcm4gZm9yIHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gYmUgY3JlYXRlIGJhc2VkIG9uIHRoZSBwYXJhbWV0ZXJzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogSWYgbm90IHByb3ZpZGVkIHdlJ2xsIGRlZmF1bHQgdG8gd2hhdCB3YXMgcGFzc2VkIGluIHRoZSBVUkxcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0YmluZGluZ0NvbnRleHRQYXR0ZXJuITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNYXAgb2YgdXNlZCBPRGF0YSBuYXZpZ2F0aW9ucyBhbmQgaXRzIHJvdXRpbmcgdGFyZ2V0c1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRuYXZpZ2F0aW9uITogUmVjb3JkPHN0cmluZywgTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24+O1xuXG5cdC8qKlxuXHQgKiBFbmhhbmNlIHRoZSBpMThuIGJ1bmRsZSB1c2VkIGZvciB0aGlzIHBhZ2Ugd2l0aCBvbmUgb3IgbW9yZSBhcHAgc3BlY2lmaWMgaTE4biByZXNvdXJjZSBidW5kbGVzIG9yIHJlc291cmNlIG1vZGVsc1xuXHQgKiBvciBhIGNvbWJpbmF0aW9uIG9mIGJvdGguIFRoZSBsYXN0IHJlc291cmNlIGJ1bmRsZS9tb2RlbCBpcyBnaXZlbiBoaWdoZXN0IHByaW9yaXR5XG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1tdXCIgfSlcblx0ZW5oYW5jZUkxOG4hOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogRGVmaW5lIGNvbnRyb2wgcmVsYXRlZCBjb25maWd1cmF0aW9uIHNldHRpbmdzXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cblx0LyoqXG5cdCAqIEFkanVzdHMgdGhlIHRlbXBsYXRlIGNvbnRlbnRcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwib2JqZWN0XCIgfSlcblx0Y29udGVudD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB5b3UgY2FuIHJlYWNoIHRoaXMgcGFnZSBkaXJlY3RseSB0aHJvdWdoIHNlbWFudGljIGJvb2ttYXJrc1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0YWxsb3dEZWVwTGlua2luZyE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIGNvbnRleHQgcGF0aCBvbiB0aGUgY29tcG9uZW50IHRoYXQgaXMgcmVmcmVzaGVkIHdoZW4gdGhlIGFwcCBpcyByZXN0b3JlZCB1c2luZyBrZWVwIGFsaXZlIG1vZGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwib2JqZWN0XCIgfSlcblx0cmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlOiB1bmtub3duO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dmlld1R5cGUgPSBcIlhNTFwiO1xuXG5cdEBldmVudCgpXG5cdGNvbnRhaW5lckRlZmluZWQhOiBGdW5jdGlvbjtcblxuXHRAZXZlbnQoKVxuXHRoZXJvZXNCYXRjaFJlY2VpdmVkITogRnVuY3Rpb247XG5cblx0QGV2ZW50KClcblx0d29ya2Vyc0JhdGNoUmVjZWl2ZWQhOiBGdW5jdGlvbjtcblxuXHRwcm90ZWN0ZWQgb0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblxuXHRzZXRDb250YWluZXIob0NvbnRhaW5lcjogQ29tcG9uZW50Q29udGFpbmVyKTogdGhpcyB7XG5cdFx0c3VwZXIuc2V0Q29udGFpbmVyKG9Db250YWluZXIpO1xuXHRcdHRoaXMuZmlyZUV2ZW50KFwiY29udGFpbmVyRGVmaW5lZFwiLCB7IGNvbnRhaW5lcjogb0NvbnRhaW5lciB9KTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5vQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMpO1xuXHRcdHN1cGVyLmluaXQoKTtcblx0XHRjb25zdCBvU3RhdGVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24gKG9FdmVudDogRXZlbnQpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImNvbnRyb2xcIik7XG5cdFx0XHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSB8fCBvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckJhclwiKSB8fCBvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdGNvbnN0IG9NYWNyb0FQSSA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdFx0XHRpZiAob01hY3JvQVBJPy5maXJlU3RhdGVDaGFuZ2UpIHtcblx0XHRcdFx0XHRvTWFjcm9BUEkuZmlyZVN0YXRlQ2hhbmdlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdFN0YXRlVXRpbC5kZXRhY2hTdGF0ZUNoYW5nZShvU3RhdGVDaGFuZ2VIYW5kbGVyKTtcblx0XHRTdGF0ZVV0aWwuYXR0YWNoU3RhdGVDaGFuZ2Uob1N0YXRlQ2hhbmdlSGFuZGxlcik7XG5cdH1cblxuXHQvLyBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYnkgVUk1IGNvcmUgdG8gYWNjZXNzIHRvIHRoZSBjb21wb25lbnQgY29udGFpbmluZyB0aGUgY3VzdG9taXppbmcgY29uZmlndXJhdGlvbi5cblx0Ly8gYXMgY29udHJvbGxlciBleHRlbnNpb25zIGFyZSBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCBmb3IgdGhlIGFwcCBjb21wb25lbnQgYW5kIG5vdCBmb3IgdGhlXG5cdC8vIHRlbXBsYXRlIGNvbXBvbmVudCB3ZSByZXR1cm4gdGhlIGFwcCBjb21wb25lbnQuXG5cdGdldEV4dGVuc2lvbkNvbXBvbmVudCgpOiBBcHBDb21wb25lbnQge1xuXHRcdHJldHVybiB0aGlzLm9BcHBDb21wb25lbnQ7XG5cdH1cblxuXHRnZXRSb290Q29udHJvbGxlcigpOiBQYWdlQ29udHJvbGxlciB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgcm9vdENvbnRyb2w6IFZpZXcgPSB0aGlzLmdldFJvb3RDb250cm9sKCk7XG5cdFx0bGV0IHJvb3RDb250cm9sbGVyOiBQYWdlQ29udHJvbGxlciB8IHVuZGVmaW5lZDtcblx0XHRpZiAocm9vdENvbnRyb2wgJiYgcm9vdENvbnRyb2wuZ2V0Q29udHJvbGxlcikge1xuXHRcdFx0cm9vdENvbnRyb2xsZXIgPSByb290Q29udHJvbC5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXI7XG5cdFx0fVxuXHRcdHJldHVybiByb290Q29udHJvbGxlcjtcblx0fVxuXG5cdG9uUGFnZVJlYWR5KG1QYXJhbWV0ZXJzOiB1bmtub3duKSB7XG5cdFx0Y29uc3Qgcm9vdENvbnRyb2xsZXIgPSB0aGlzLmdldFJvb3RDb250cm9sbGVyKCk7XG5cdFx0aWYgKHJvb3RDb250cm9sbGVyICYmIHJvb3RDb250cm9sbGVyLm9uUGFnZVJlYWR5KSB7XG5cdFx0XHRyb290Q29udHJvbGxlci5vblBhZ2VSZWFkeShtUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24oc1RhcmdldFBhdGg6IHN0cmluZyk6IE5hdmlnYXRpb25Db25maWd1cmF0aW9uIHtcblx0XHRjb25zdCBtTmF2aWdhdGlvbiA9IHRoaXMubmF2aWdhdGlvbjtcblx0XHRyZXR1cm4gbU5hdmlnYXRpb25bc1RhcmdldFBhdGhdO1xuXHR9XG5cblx0Z2V0Vmlld0RhdGEoKSB7XG5cdFx0Y29uc3QgbVByb3BlcnRpZXMgPSB0aGlzLmdldE1ldGFkYXRhKCkuZ2V0QWxsUHJvcGVydGllcygpO1xuXHRcdGNvbnN0IG9WaWV3RGF0YSA9IE9iamVjdC5rZXlzKG1Qcm9wZXJ0aWVzKS5yZWR1Y2UoKG1WaWV3RGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHNQcm9wZXJ0eU5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0bVZpZXdEYXRhW3NQcm9wZXJ0eU5hbWVdID0gbVByb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV0uZ2V0ISh0aGlzKTtcblx0XHRcdHJldHVybiBtVmlld0RhdGE7XG5cdFx0fSwge30pO1xuXG5cdFx0Ly8gQWNjZXNzIHRoZSBpbnRlcm5hbCBfaXNGY2xFbmFibGVkIHdoaWNoIHdpbGwgYmUgdGhlcmVcblx0XHRvVmlld0RhdGEuZmNsRW5hYmxlZCA9IHRoaXMub0FwcENvbXBvbmVudC5faXNGY2xFbmFibGVkKCk7XG5cblx0XHRyZXR1cm4gb1ZpZXdEYXRhO1xuXHR9XG5cblx0X2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCkge1xuXHRcdGNvbnN0IHJvb3RDb250cm9sID0gdGhpcy5nZXRSb290Q29udHJvbCgpO1xuXHRcdGlmIChyb290Q29udHJvbCAmJiByb290Q29udHJvbC5nZXRDb250cm9sbGVyKCkgJiYgcm9vdENvbnRyb2wuZ2V0Q29udHJvbGxlcigpLl9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbikge1xuXHRcdFx0cmV0dXJuIHJvb3RDb250cm9sLmdldENvbnRyb2xsZXIoKS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblx0fVxuXG5cdGdldEV4dGVuc2lvbkFQSSgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRSb290Q29udHJvbCgpLmdldENvbnRyb2xsZXIoKS5nZXRFeHRlbnNpb25BUEkoKTtcblx0fVxufVxuaW50ZXJmYWNlIFRlbXBsYXRlQ29tcG9uZW50IHtcblx0Ly8gVE9ETzogdGhpcyBzaG91bGQgYmUgaWRlYWxseSBiZSBoYW5kbGVkIGJ5IHRoZSBlZGl0Zmxvdy9yb3V0aW5nIHdpdGhvdXQgdGhlIG5lZWQgdG8gaGF2ZSB0aGlzIG1ldGhvZCBpbiB0aGUgb2JqZWN0IHBhZ2UgLSBmb3Igbm93IGtlZXAgaXQgaGVyZVxuXHRjcmVhdGVEZWZlcnJlZENvbnRleHQ/KHNQYXRoOiBzdHJpbmcsIG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZywgYkFjdGlvbkNyZWF0ZTogYm9vbGVhbik6IHZvaWQ7XG5cdGdldFJvb3RDb250cm9sKCk6IHsgZ2V0Q29udHJvbGxlcigpOiBQYWdlQ29udHJvbGxlciB9ICYgVmlldztcblx0ZXh0ZW5kUGFnZURlZmluaXRpb24/KHBhZ2VEZWZpbml0aW9uOiB7fSwgY29udmVydGVyQ29udGV4dD86IENvbnZlcnRlckNvbnRleHQpOiB7fTtcbn1cbmV4cG9ydCBkZWZhdWx0IFRlbXBsYXRlQ29tcG9uZW50O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7TUFxQk1BLGlCQUFp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