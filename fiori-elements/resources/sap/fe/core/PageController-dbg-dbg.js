/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/BaseController", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Routing", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Component", "sap/ui/core/mvc/OverrideExecution"], function (BaseController, EditFlow, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Routing, Share, SideEffects, ViewState, ExtensionAPI, ClassSupport, Component, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Base controller class for your custom page used inside an SAP Fiori elements application.
   *
   * This controller provides preconfigured extensions that will ensure you have the basic functionalities required to use the building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.88.0
   */
  let PageController = (_dec = defineUI5Class("sap.fe.core.PageController"), _dec2 = usingExtension(Routing), _dec3 = usingExtension(InternalRouting), _dec4 = usingExtension(EditFlow), _dec5 = usingExtension(IntentBasedNavigation), _dec6 = usingExtension(InternalIntentBasedNavigation), _dec7 = usingExtension(PageReady), _dec8 = usingExtension(MessageHandler), _dec9 = usingExtension(Share), _dec10 = usingExtension(Paginator), _dec11 = usingExtension(ViewState), _dec12 = usingExtension(Placeholder), _dec13 = usingExtension(SideEffects), _dec14 = usingExtension(MassEdit), _dec15 = publicExtension(), _dec16 = publicExtension(), _dec17 = publicExtension(), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(PageController, _BaseController);
    function PageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editFlow", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_sideEffects", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor13, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = PageController.prototype;
    /**
     * @private
     * @name sap.fe.core.PageController.getMetadata
     * @function
     */
    /**
     * @private
     * @name sap.fe.core.PageController.extend
     * @function
     */
    _proto.onInit = function onInit() {
      const oUIModel = this.getAppComponent().getModel("ui"),
        oInternalModel = this.getAppComponent().getModel("internal"),
        sPath = `/pages/${this.getView().getId()}`;
      oUIModel.setProperty(sPath, {
        controls: {}
      });
      oInternalModel.setProperty(sPath, {
        controls: {},
        collaboration: {}
      });
      this.getView().bindElement({
        path: sPath,
        model: "ui"
      });
      this.getView().bindElement({
        path: sPath,
        model: "internal"
      });

      // for the time being provide it also pageInternal as some macros access it - to be removed
      this.getView().bindElement({
        path: sPath,
        model: "pageInternal"
      });
      this.getView().setModel(oInternalModel, "pageInternal");

      // as the model propagation happens after init but we actually want to access the binding context in the
      // init phase already setting the model here
      this.getView().setModel(oUIModel, "ui");
      this.getView().setModel(oInternalModel, "internal");
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      if (this.placeholder.attachHideCallback) {
        this.placeholder.attachHideCallback();
      }
    }

    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */;
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    }

    // We specify the extensibility here the same way as it is done in the object page controller
    // since the specification here overrides it and if we do not specify anything here, the
    // behavior defaults to an execute instead!
    // TODO This may not be ideal, since it also influences the list report controller but currently it's the best solution.
    ;
    _proto.onPageReady = function onPageReady(_mParameters) {
      // Apply app state only after the page is ready with the first section selected
      this.getAppComponent().getAppStateHandler().applyAppState();
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      return {};
    };
    _proto._getPageModel = function _getPageModel() {
      const pageComponent = Component.getOwnerComponentFor(this.getView());
      return pageComponent === null || pageComponent === void 0 ? void 0 : pageComponent.getModel("_pageModel");
    };
    return PageController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "_sideEffects", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeRendering", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeRendering"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return PageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJSb3V0aW5nIiwiSW50ZXJuYWxSb3V0aW5nIiwiRWRpdEZsb3ciLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsIlBhZ2VSZWFkeSIsIk1lc3NhZ2VIYW5kbGVyIiwiU2hhcmUiLCJQYWdpbmF0b3IiLCJWaWV3U3RhdGUiLCJQbGFjZWhvbGRlciIsIlNpZGVFZmZlY3RzIiwiTWFzc0VkaXQiLCJwdWJsaWNFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsIm9uSW5pdCIsIm9VSU1vZGVsIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0TW9kZWwiLCJvSW50ZXJuYWxNb2RlbCIsInNQYXRoIiwiZ2V0VmlldyIsImdldElkIiwic2V0UHJvcGVydHkiLCJjb250cm9scyIsImNvbGxhYm9yYXRpb24iLCJiaW5kRWxlbWVudCIsInBhdGgiLCJtb2RlbCIsInNldE1vZGVsIiwib25CZWZvcmVSZW5kZXJpbmciLCJwbGFjZWhvbGRlciIsImF0dGFjaEhpZGVDYWxsYmFjayIsImdldEV4dGVuc2lvbkFQSSIsImV4dGVuc2lvbkFQSSIsIkV4dGVuc2lvbkFQSSIsIm9uUGFnZVJlYWR5IiwiX21QYXJhbWV0ZXJzIiwiZ2V0QXBwU3RhdGVIYW5kbGVyIiwiYXBwbHlBcHBTdGF0ZSIsIl9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbiIsIl9nZXRQYWdlTW9kZWwiLCJwYWdlQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJCYXNlQ29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUGFnZUNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiO1xuaW1wb3J0IEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCBNYXNzRWRpdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWFzc0VkaXRcIjtcbmltcG9ydCBNZXNzYWdlSGFuZGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBQYWdlUmVhZHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BhZ2VSZWFkeVwiO1xuaW1wb3J0IFBhZ2luYXRvciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGFnaW5hdG9yXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUm91dGluZ1wiO1xuaW1wb3J0IFNoYXJlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaGFyZVwiO1xuaW1wb3J0IFNpZGVFZmZlY3RzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaWRlRWZmZWN0c1wiO1xuaW1wb3J0IFZpZXdTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvVmlld1N0YXRlXCI7XG5pbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvY29yZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBwdWJsaWNFeHRlbnNpb24sIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG4vKipcbiAqIEJhc2UgY29udHJvbGxlciBjbGFzcyBmb3IgeW91ciBjdXN0b20gcGFnZSB1c2VkIGluc2lkZSBhbiBTQVAgRmlvcmkgZWxlbWVudHMgYXBwbGljYXRpb24uXG4gKlxuICogVGhpcyBjb250cm9sbGVyIHByb3ZpZGVzIHByZWNvbmZpZ3VyZWQgZXh0ZW5zaW9ucyB0aGF0IHdpbGwgZW5zdXJlIHlvdSBoYXZlIHRoZSBiYXNpYyBmdW5jdGlvbmFsaXRpZXMgcmVxdWlyZWQgdG8gdXNlIHRoZSBidWlsZGluZyBibG9ja3MuXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuODguMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5QYWdlQ29udHJvbGxlclwiKVxuY2xhc3MgUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihSb3V0aW5nKVxuXHRyb3V0aW5nITogUm91dGluZztcblxuXHRAdXNpbmdFeHRlbnNpb24oSW50ZXJuYWxSb3V0aW5nKVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcblxuXHRAdXNpbmdFeHRlbnNpb24oRWRpdEZsb3cpXG5cdGVkaXRGbG93ITogRWRpdEZsb3c7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKEludGVudEJhc2VkTmF2aWdhdGlvbilcblx0aW50ZW50QmFzZWROYXZpZ2F0aW9uITogSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbilcblx0X2ludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihQYWdlUmVhZHkpXG5cdHBhZ2VSZWFkeSE6IFBhZ2VSZWFkeTtcblxuXHRAdXNpbmdFeHRlbnNpb24oTWVzc2FnZUhhbmRsZXIpXG5cdG1lc3NhZ2VIYW5kbGVyITogTWVzc2FnZUhhbmRsZXI7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFNoYXJlKVxuXHRzaGFyZSE6IFNoYXJlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihQYWdpbmF0b3IpXG5cdHBhZ2luYXRvciE6IFBhZ2luYXRvcjtcblxuXHRAdXNpbmdFeHRlbnNpb24oVmlld1N0YXRlKVxuXHR2aWV3U3RhdGUhOiBWaWV3U3RhdGU7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFBsYWNlaG9sZGVyKVxuXHRwbGFjZWhvbGRlciE6IFBsYWNlaG9sZGVyO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihTaWRlRWZmZWN0cylcblx0X3NpZGVFZmZlY3RzITogU2lkZUVmZmVjdHM7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXG5cdGV4dGVuc2lvbiE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXHQvLyBAUHVibGljXG5cdC8vIGdldFZpZXcoKTogeyBnZXRDb250cm9sbGVyKCk6IFBhZ2VDb250cm9sbGVyIH0gJiBWaWV3IHtcblx0Ly8gXHRyZXR1cm4gc3VwZXIuZ2V0VmlldygpIGFzIGFueTtcblx0Ly8gfVxuXG5cdHByb3RlY3RlZCBleHRlbnNpb25BUEk/OiBFeHRlbnNpb25BUEk7XG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5QYWdlQ29udHJvbGxlci5nZXRNZXRhZGF0YVxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5QYWdlQ29udHJvbGxlci5leHRlbmRcblx0ICogQGZ1bmN0aW9uXG5cdCAqL1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRvbkluaXQoKSB7XG5cdFx0Y29uc3Qgb1VJTW9kZWwgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1vZGVsKFwidWlcIikgYXMgSlNPTk1vZGVsLFxuXHRcdFx0b0ludGVybmFsTW9kZWwgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsLFxuXHRcdFx0c1BhdGggPSBgL3BhZ2VzLyR7dGhpcy5nZXRWaWV3KCkuZ2V0SWQoKX1gO1xuXG5cdFx0b1VJTW9kZWwuc2V0UHJvcGVydHkoc1BhdGgsIHtcblx0XHRcdGNvbnRyb2xzOiB7fVxuXHRcdH0pO1xuXHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KHNQYXRoLCB7XG5cdFx0XHRjb250cm9sczoge30sXG5cdFx0XHRjb2xsYWJvcmF0aW9uOiB7fVxuXHRcdH0pO1xuXHRcdHRoaXMuZ2V0VmlldygpLmJpbmRFbGVtZW50KHtcblx0XHRcdHBhdGg6IHNQYXRoLFxuXHRcdFx0bW9kZWw6IFwidWlcIlxuXHRcdH0pO1xuXHRcdHRoaXMuZ2V0VmlldygpLmJpbmRFbGVtZW50KHtcblx0XHRcdHBhdGg6IHNQYXRoLFxuXHRcdFx0bW9kZWw6IFwiaW50ZXJuYWxcIlxuXHRcdH0pO1xuXG5cdFx0Ly8gZm9yIHRoZSB0aW1lIGJlaW5nIHByb3ZpZGUgaXQgYWxzbyBwYWdlSW50ZXJuYWwgYXMgc29tZSBtYWNyb3MgYWNjZXNzIGl0IC0gdG8gYmUgcmVtb3ZlZFxuXHRcdHRoaXMuZ2V0VmlldygpLmJpbmRFbGVtZW50KHtcblx0XHRcdHBhdGg6IHNQYXRoLFxuXHRcdFx0bW9kZWw6IFwicGFnZUludGVybmFsXCJcblx0XHR9KTtcblx0XHR0aGlzLmdldFZpZXcoKS5zZXRNb2RlbChvSW50ZXJuYWxNb2RlbCwgXCJwYWdlSW50ZXJuYWxcIik7XG5cblx0XHQvLyBhcyB0aGUgbW9kZWwgcHJvcGFnYXRpb24gaGFwcGVucyBhZnRlciBpbml0IGJ1dCB3ZSBhY3R1YWxseSB3YW50IHRvIGFjY2VzcyB0aGUgYmluZGluZyBjb250ZXh0IGluIHRoZVxuXHRcdC8vIGluaXQgcGhhc2UgYWxyZWFkeSBzZXR0aW5nIHRoZSBtb2RlbCBoZXJlXG5cdFx0dGhpcy5nZXRWaWV3KCkuc2V0TW9kZWwob1VJTW9kZWwsIFwidWlcIik7XG5cdFx0dGhpcy5nZXRWaWV3KCkuc2V0TW9kZWwob0ludGVybmFsTW9kZWwsIFwiaW50ZXJuYWxcIik7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0aWYgKHRoaXMucGxhY2Vob2xkZXIuYXR0YWNoSGlkZUNhbGxiYWNrKSB7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyLmF0dGFjaEhpZGVDYWxsYmFjaygpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGV4dGVuc2lvbiBBUEkgZm9yIHRoZSBjdXJyZW50IHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGV4dGVuc2lvbiBBUEkuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0Z2V0RXh0ZW5zaW9uQVBJKCk6IEV4dGVuc2lvbkFQSSB7XG5cdFx0aWYgKCF0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0dGhpcy5leHRlbnNpb25BUEkgPSBuZXcgRXh0ZW5zaW9uQVBJKHRoaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5leHRlbnNpb25BUEk7XG5cdH1cblxuXHQvLyBXZSBzcGVjaWZ5IHRoZSBleHRlbnNpYmlsaXR5IGhlcmUgdGhlIHNhbWUgd2F5IGFzIGl0IGlzIGRvbmUgaW4gdGhlIG9iamVjdCBwYWdlIGNvbnRyb2xsZXJcblx0Ly8gc2luY2UgdGhlIHNwZWNpZmljYXRpb24gaGVyZSBvdmVycmlkZXMgaXQgYW5kIGlmIHdlIGRvIG5vdCBzcGVjaWZ5IGFueXRoaW5nIGhlcmUsIHRoZVxuXHQvLyBiZWhhdmlvciBkZWZhdWx0cyB0byBhbiBleGVjdXRlIGluc3RlYWQhXG5cdC8vIFRPRE8gVGhpcyBtYXkgbm90IGJlIGlkZWFsLCBzaW5jZSBpdCBhbHNvIGluZmx1ZW5jZXMgdGhlIGxpc3QgcmVwb3J0IGNvbnRyb2xsZXIgYnV0IGN1cnJlbnRseSBpdCdzIHRoZSBiZXN0IHNvbHV0aW9uLlxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUGFnZVJlYWR5KF9tUGFyYW1ldGVyczogdW5rbm93bikge1xuXHRcdC8vIEFwcGx5IGFwcCBzdGF0ZSBvbmx5IGFmdGVyIHRoZSBwYWdlIGlzIHJlYWR5IHdpdGggdGhlIGZpcnN0IHNlY3Rpb24gc2VsZWN0ZWRcblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldEFwcFN0YXRlSGFuZGxlcigpLmFwcGx5QXBwU3RhdGUoKTtcblx0fVxuXG5cdF9nZXRQYWdlVGl0bGVJbmZvcm1hdGlvbigpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRfZ2V0UGFnZU1vZGVsKCk6IEpTT05Nb2RlbCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgcGFnZUNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzLmdldFZpZXcoKSk7XG5cdFx0cmV0dXJuIHBhZ2VDb21wb25lbnQ/LmdldE1vZGVsKFwiX3BhZ2VNb2RlbFwiKSBhcyBKU09OTW9kZWw7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFnZUNvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQW9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFSQSxJQVVNQSxjQUFjLFdBRG5CQyxjQUFjLENBQUMsNEJBQTRCLENBQUMsVUFFM0NDLGNBQWMsQ0FBQ0MsT0FBTyxDQUFDLFVBR3ZCRCxjQUFjLENBQUNFLGVBQWUsQ0FBQyxVQUcvQkYsY0FBYyxDQUFDRyxRQUFRLENBQUMsVUFHeEJILGNBQWMsQ0FBQ0kscUJBQXFCLENBQUMsVUFHckNKLGNBQWMsQ0FBQ0ssNkJBQTZCLENBQUMsVUFHN0NMLGNBQWMsQ0FBQ00sU0FBUyxDQUFDLFVBR3pCTixjQUFjLENBQUNPLGNBQWMsQ0FBQyxVQUc5QlAsY0FBYyxDQUFDUSxLQUFLLENBQUMsV0FHckJSLGNBQWMsQ0FBQ1MsU0FBUyxDQUFDLFdBR3pCVCxjQUFjLENBQUNVLFNBQVMsQ0FBQyxXQUd6QlYsY0FBYyxDQUFDVyxXQUFXLENBQUMsV0FHM0JYLGNBQWMsQ0FBQ1ksV0FBVyxDQUFDLFdBRzNCWixjQUFjLENBQUNhLFFBQVEsQ0FBQyxXQXFCeEJDLGVBQWUsRUFBRSxXQW1DakJBLGVBQWUsRUFBRSxXQWFqQkEsZUFBZSxFQUFFLFdBWWpCQSxlQUFlLEVBQUUsV0FDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUF4RXBDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkMsT0FPQUMsTUFBTSxHQUROLGtCQUNTO01BQ1IsTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsZUFBZSxFQUFFLENBQUNDLFFBQVEsQ0FBQyxJQUFJLENBQWM7UUFDbEVDLGNBQWMsR0FBRyxJQUFJLENBQUNGLGVBQWUsRUFBRSxDQUFDQyxRQUFRLENBQUMsVUFBVSxDQUFjO1FBQ3pFRSxLQUFLLEdBQUksVUFBUyxJQUFJLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxLQUFLLEVBQUcsRUFBQztNQUUzQ04sUUFBUSxDQUFDTyxXQUFXLENBQUNILEtBQUssRUFBRTtRQUMzQkksUUFBUSxFQUFFLENBQUM7TUFDWixDQUFDLENBQUM7TUFDRkwsY0FBYyxDQUFDSSxXQUFXLENBQUNILEtBQUssRUFBRTtRQUNqQ0ksUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNaQyxhQUFhLEVBQUUsQ0FBQztNQUNqQixDQUFDLENBQUM7TUFDRixJQUFJLENBQUNKLE9BQU8sRUFBRSxDQUFDSyxXQUFXLENBQUM7UUFDMUJDLElBQUksRUFBRVAsS0FBSztRQUNYUSxLQUFLLEVBQUU7TUFDUixDQUFDLENBQUM7TUFDRixJQUFJLENBQUNQLE9BQU8sRUFBRSxDQUFDSyxXQUFXLENBQUM7UUFDMUJDLElBQUksRUFBRVAsS0FBSztRQUNYUSxLQUFLLEVBQUU7TUFDUixDQUFDLENBQUM7O01BRUY7TUFDQSxJQUFJLENBQUNQLE9BQU8sRUFBRSxDQUFDSyxXQUFXLENBQUM7UUFDMUJDLElBQUksRUFBRVAsS0FBSztRQUNYUSxLQUFLLEVBQUU7TUFDUixDQUFDLENBQUM7TUFDRixJQUFJLENBQUNQLE9BQU8sRUFBRSxDQUFDUSxRQUFRLENBQUNWLGNBQWMsRUFBRSxjQUFjLENBQUM7O01BRXZEO01BQ0E7TUFDQSxJQUFJLENBQUNFLE9BQU8sRUFBRSxDQUFDUSxRQUFRLENBQUNiLFFBQVEsRUFBRSxJQUFJLENBQUM7TUFDdkMsSUFBSSxDQUFDSyxPQUFPLEVBQUUsQ0FBQ1EsUUFBUSxDQUFDVixjQUFjLEVBQUUsVUFBVSxDQUFDO0lBQ3BELENBQUM7SUFBQSxPQUdEVyxpQkFBaUIsR0FEakIsNkJBQ29CO01BQ25CLElBQUksSUFBSSxDQUFDQyxXQUFXLENBQUNDLGtCQUFrQixFQUFFO1FBQ3hDLElBQUksQ0FBQ0QsV0FBVyxDQUFDQyxrQkFBa0IsRUFBRTtNQUN0QztJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FPQUMsZUFBZSxHQURmLDJCQUNnQztNQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDQyxZQUFZLEVBQUU7UUFDdkIsSUFBSSxDQUFDQSxZQUFZLEdBQUcsSUFBSUMsWUFBWSxDQUFDLElBQUksQ0FBQztNQUMzQztNQUNBLE9BQU8sSUFBSSxDQUFDRCxZQUFZO0lBQ3pCOztJQUVBO0lBQ0E7SUFDQTtJQUNBO0lBQUE7SUFBQSxPQUdBRSxXQUFXLEdBRlgscUJBRVlDLFlBQXFCLEVBQUU7TUFDbEM7TUFDQSxJQUFJLENBQUNwQixlQUFlLEVBQUUsQ0FBQ3FCLGtCQUFrQixFQUFFLENBQUNDLGFBQWEsRUFBRTtJQUM1RCxDQUFDO0lBQUEsT0FFREMsd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFBQSxPQUVEQyxhQUFhLEdBQWIseUJBQXVDO01BQ3RDLE1BQU1DLGFBQWEsR0FBR0MsU0FBUyxDQUFDQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUN2QixPQUFPLEVBQUUsQ0FBQztNQUNwRSxPQUFPcUIsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQUV4QixRQUFRLENBQUMsWUFBWSxDQUFDO0lBQzdDLENBQUM7SUFBQTtFQUFBLEVBcEkyQjJCLGNBQWM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0F1STVCbEQsY0FBYztBQUFBIn0=