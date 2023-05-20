/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/library", "sap/fe/core/TemplateComponent", "sap/fe/templates/library", "sap/fe/templates/ObjectPage/ExtendPageDefinition", "sap/ui/model/odata/v4/ODataListBinding"], function (Log, CommonUtils, ClassSupport, CoreLibrary, TemplateComponent, templateLib, ExtendPageDefinition, ODataListBinding) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8;
  var extendObjectPageDefinition = ExtendPageDefinition.extendObjectPageDefinition;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const VariantManagement = CoreLibrary.VariantManagement,
    CreationMode = CoreLibrary.CreationMode;
  const SectionLayout = templateLib.ObjectPage.SectionLayout;
  let ObjectPageComponent = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.Component", {
    library: "sap.fe.templates",
    manifest: "json"
  }), _dec2 = property({
    type: "sap.fe.core.VariantManagement",
    defaultValue: VariantManagement.None
  }), _dec3 = property({
    type: "sap.fe.templates.ObjectPage.SectionLayout",
    defaultValue: SectionLayout.Page
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "object"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: true
  }), _dec8 = property({
    type: "object"
  }), _dec9 = property({
    type: "boolean",
    defaultValue: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(ObjectPageComponent, _TemplateComponent);
    function ObjectPageComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _TemplateComponent.call(this, ...args) || this;
      _initializerDefineProperty(_this, "variantManagement", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sectionLayout", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showRelatedApps", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "additionalSemanticObjects", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editableHeaderContent", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showBreadCrumbs", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inboundParameters", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableLazyLoading", _descriptor8, _assertThisInitialized(_this));
      _this.DeferredContextCreated = false;
      return _this;
    }
    var _proto = ObjectPageComponent.prototype;
    _proto.isContextExpected = function isContextExpected() {
      return true;
    };
    _proto.extendPageDefinition = function extendPageDefinition(pageDefinition, converterContext) {
      return extendObjectPageDefinition(pageDefinition, converterContext);
    }

    // TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
    // object page - for now keep it here
    ;
    _proto.createDeferredContext = function createDeferredContext(sPath, oListBinding, bActionCreate) {
      if (!this.DeferredContextCreated) {
        this.DeferredContextCreated = true;
        const oParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto"
        };
        // In fullscreen mode, we recreate the list binding, as we don't want to have synchronization between views
        // (it causes errors, e.g. pending changes due to creationRow)
        if (!oListBinding || oListBinding.isRelative() === false && !this.oAppComponent.getRootViewController().isFclEnabled()) {
          oListBinding = new ODataListBinding(this.getModel(), sPath.replace("(...)", ""), undefined, undefined, undefined, oParameters);
        }
        const oStartUpParams = this.oAppComponent && this.oAppComponent.getComponentData() && this.oAppComponent.getComponentData().startupParameters,
          oInboundParameters = this.getViewData().inboundParameters;
        let createParams;
        if (oStartUpParams && oStartUpParams.preferredMode && oStartUpParams.preferredMode[0].indexOf("create") !== -1) {
          createParams = CommonUtils.getAdditionalParamsForCreate(oStartUpParams, oInboundParameters);
        }

        // for now wait until the view and the controller is created
        this.getRootControl().getController().editFlow.createDocument(oListBinding, {
          creationMode: CreationMode.Sync,
          createAction: bActionCreate,
          data: createParams,
          bFromDeferred: true
        }).finally(() => {
          this.DeferredContextCreated = false;
        }).catch(function () {
          // Do Nothing ?
        });
      }
    };
    _proto.setVariantManagement = function setVariantManagement(sVariantManagement) {
      if (sVariantManagement === VariantManagement.Page) {
        Log.error("ObjectPage does not support Page-level variant management yet");
        sVariantManagement = VariantManagement.None;
      }
      this.setProperty("variantManagement", sVariantManagement);
    };
    return ObjectPageComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "sectionLayout", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "showRelatedApps", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "additionalSemanticObjects", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editableHeaderContent", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showBreadCrumbs", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "inboundParameters", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "enableLazyLoading", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ObjectPageComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYXJpYW50TWFuYWdlbWVudCIsIkNvcmVMaWJyYXJ5IiwiQ3JlYXRpb25Nb2RlIiwiU2VjdGlvbkxheW91dCIsInRlbXBsYXRlTGliIiwiT2JqZWN0UGFnZSIsIk9iamVjdFBhZ2VDb21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsImxpYnJhcnkiLCJtYW5pZmVzdCIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsIk5vbmUiLCJQYWdlIiwiRGVmZXJyZWRDb250ZXh0Q3JlYXRlZCIsImlzQ29udGV4dEV4cGVjdGVkIiwiZXh0ZW5kUGFnZURlZmluaXRpb24iLCJwYWdlRGVmaW5pdGlvbiIsImNvbnZlcnRlckNvbnRleHQiLCJleHRlbmRPYmplY3RQYWdlRGVmaW5pdGlvbiIsImNyZWF0ZURlZmVycmVkQ29udGV4dCIsInNQYXRoIiwib0xpc3RCaW5kaW5nIiwiYkFjdGlvbkNyZWF0ZSIsIm9QYXJhbWV0ZXJzIiwiJCRncm91cElkIiwiJCR1cGRhdGVHcm91cElkIiwiaXNSZWxhdGl2ZSIsIm9BcHBDb21wb25lbnQiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJpc0ZjbEVuYWJsZWQiLCJPRGF0YUxpc3RCaW5kaW5nIiwiZ2V0TW9kZWwiLCJyZXBsYWNlIiwidW5kZWZpbmVkIiwib1N0YXJ0VXBQYXJhbXMiLCJnZXRDb21wb25lbnREYXRhIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJvSW5ib3VuZFBhcmFtZXRlcnMiLCJnZXRWaWV3RGF0YSIsImluYm91bmRQYXJhbWV0ZXJzIiwiY3JlYXRlUGFyYW1zIiwicHJlZmVycmVkTW9kZSIsImluZGV4T2YiLCJDb21tb25VdGlscyIsImdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGUiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJlZGl0RmxvdyIsImNyZWF0ZURvY3VtZW50IiwiY3JlYXRpb25Nb2RlIiwiU3luYyIsImNyZWF0ZUFjdGlvbiIsImRhdGEiLCJiRnJvbURlZmVycmVkIiwiZmluYWxseSIsImNhdGNoIiwic2V0VmFyaWFudE1hbmFnZW1lbnQiLCJzVmFyaWFudE1hbmFnZW1lbnQiLCJMb2ciLCJlcnJvciIsInNldFByb3BlcnR5IiwiVGVtcGxhdGVDb21wb25lbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbXBvbmVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscywgeyBJbmJvdW5kUGFyYW1ldGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBPYmplY3RQYWdlRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL3RlbXBsYXRlcy9PYmplY3RQYWdlQ29udmVydGVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb3JlTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuaW1wb3J0IHRlbXBsYXRlTGliIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL2xpYnJhcnlcIjtcbmltcG9ydCB7IGV4dGVuZE9iamVjdFBhZ2VEZWZpbml0aW9uLCBGaW5hbFBhZ2VEZWZpbml0aW9uIH0gZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS9FeHRlbmRQYWdlRGVmaW5pdGlvblwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5cbmNvbnN0IFZhcmlhbnRNYW5hZ2VtZW50ID0gQ29yZUxpYnJhcnkuVmFyaWFudE1hbmFnZW1lbnQsXG5cdENyZWF0aW9uTW9kZSA9IENvcmVMaWJyYXJ5LkNyZWF0aW9uTW9kZTtcbmNvbnN0IFNlY3Rpb25MYXlvdXQgPSB0ZW1wbGF0ZUxpYi5PYmplY3RQYWdlLlNlY3Rpb25MYXlvdXQ7XG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuQ29tcG9uZW50XCIsIHsgbGlicmFyeTogXCJzYXAuZmUudGVtcGxhdGVzXCIsIG1hbmlmZXN0OiBcImpzb25cIiB9KVxuY2xhc3MgT2JqZWN0UGFnZUNvbXBvbmVudCBleHRlbmRzIFRlbXBsYXRlQ29tcG9uZW50IHtcblx0LyoqXG5cdCAqIERlZmluZXMgaWYgYW5kIG9uIHdoaWNoIGxldmVsIHZhcmlhbnRzIGNhbiBiZSBjb25maWd1cmVkOlxuXHQgKiBcdFx0Tm9uZTogbm8gdmFyaWFudCBjb25maWd1cmF0aW9uIGF0IGFsbFxuXHQgKiBcdFx0UGFnZTogb25lIHZhcmlhbnQgY29uZmlndXJhdGlvbiBmb3IgdGhlIHdob2xlIHBhZ2Vcblx0ICogXHRcdENvbnRyb2w6IHZhcmlhbnQgY29uZmlndXJhdGlvbiBvbiBjb250cm9sIGxldmVsXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic2FwLmZlLmNvcmUuVmFyaWFudE1hbmFnZW1lbnRcIixcblx0XHRkZWZhdWx0VmFsdWU6IFZhcmlhbnRNYW5hZ2VtZW50Lk5vbmVcblx0fSlcblx0dmFyaWFudE1hbmFnZW1lbnQ6IHR5cGVvZiBWYXJpYW50TWFuYWdlbWVudDtcblxuXHQvKipcblx0ICogRGVmaW5lcyBob3cgdGhlIHNlY3Rpb25zIGFyZSByZW5kZXJlZFxuXHQgKiBcdFx0UGFnZTogYWxsIHNlY3Rpb25zIGFyZSBzaG93biBvbiBvbmUgcGFnZVxuXHQgKiBcdFx0VGFiczogZWFjaCB0b3AtbGV2ZWwgc2VjdGlvbiBpcyBzaG93biBpbiBhbiBvd24gdGFiXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLlNlY3Rpb25MYXlvdXRcIixcblx0XHRkZWZhdWx0VmFsdWU6IFNlY3Rpb25MYXlvdXQuUGFnZVxuXHR9KVxuXHRzZWN0aW9uTGF5b3V0OiB0eXBlb2YgU2VjdGlvbkxheW91dDtcblxuXHQvKipcblx0ICogRW5hYmxlcyB0aGUgcmVsYXRlZCBhcHBzIGZlYXR1cmVzXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0c2hvd1JlbGF0ZWRBcHBzITogYm9vbGVhbjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdGFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IGFueTtcblxuXHQvKipcblx0ICogRW5hYmxlcyB0aGUgZWRpdGFibGUgb2JqZWN0IHBhZ2UgaGVhZGVyXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogdHJ1ZVxuXHR9KVxuXHRlZGl0YWJsZUhlYWRlckNvbnRlbnQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoZSBCcmVhZENydW1icyBmZWF0dXJlc1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0c2hvd0JyZWFkQ3J1bWJzITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcHJvcGVydGllcyB3aGljaCBjYW4gYmUgdXNlZCBmb3IgaW5ib3VuZCBOYXZpZ2F0aW9uXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCJcblx0fSlcblx0aW5ib3VuZFBhcmFtZXRlcnM6IGFueTtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0ZW5hYmxlTGF6eUxvYWRpbmchOiBib29sZWFuO1xuXG5cdHByaXZhdGUgRGVmZXJyZWRDb250ZXh0Q3JlYXRlZDogQm9vbGVhbiA9IGZhbHNlO1xuXG5cdGlzQ29udGV4dEV4cGVjdGVkKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0ZXh0ZW5kUGFnZURlZmluaXRpb24ocGFnZURlZmluaXRpb246IE9iamVjdFBhZ2VEZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogRmluYWxQYWdlRGVmaW5pdGlvbiB7XG5cdFx0cmV0dXJuIGV4dGVuZE9iamVjdFBhZ2VEZWZpbml0aW9uKHBhZ2VEZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0fVxuXG5cdC8vIFRPRE86IHRoaXMgc2hvdWxkIGJlIGlkZWFsbHkgYmUgaGFuZGxlZCBieSB0aGUgZWRpdGZsb3cvcm91dGluZyB3aXRob3V0IHRoZSBuZWVkIHRvIGhhdmUgdGhpcyBtZXRob2QgaW4gdGhlXG5cdC8vIG9iamVjdCBwYWdlIC0gZm9yIG5vdyBrZWVwIGl0IGhlcmVcblx0Y3JlYXRlRGVmZXJyZWRDb250ZXh0KHNQYXRoOiBhbnksIG9MaXN0QmluZGluZzogYW55LCBiQWN0aW9uQ3JlYXRlOiBhbnkpIHtcblx0XHRpZiAoIXRoaXMuRGVmZXJyZWRDb250ZXh0Q3JlYXRlZCkge1xuXHRcdFx0dGhpcy5EZWZlcnJlZENvbnRleHRDcmVhdGVkID0gdHJ1ZTtcblx0XHRcdGNvbnN0IG9QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHQkJGdyb3VwSWQ6IFwiJGF1dG8uSGVyb2VzXCIsXG5cdFx0XHRcdCQkdXBkYXRlR3JvdXBJZDogXCIkYXV0b1wiXG5cdFx0XHR9O1xuXHRcdFx0Ly8gSW4gZnVsbHNjcmVlbiBtb2RlLCB3ZSByZWNyZWF0ZSB0aGUgbGlzdCBiaW5kaW5nLCBhcyB3ZSBkb24ndCB3YW50IHRvIGhhdmUgc3luY2hyb25pemF0aW9uIGJldHdlZW4gdmlld3Ncblx0XHRcdC8vIChpdCBjYXVzZXMgZXJyb3JzLCBlLmcuIHBlbmRpbmcgY2hhbmdlcyBkdWUgdG8gY3JlYXRpb25Sb3cpXG5cdFx0XHRpZiAoXG5cdFx0XHRcdCFvTGlzdEJpbmRpbmcgfHxcblx0XHRcdFx0KG9MaXN0QmluZGluZy5pc1JlbGF0aXZlKCkgPT09IGZhbHNlICYmICEodGhpcy5vQXBwQ29tcG9uZW50LmdldFJvb3RWaWV3Q29udHJvbGxlcigpIGFzIGFueSkuaXNGY2xFbmFibGVkKCkpXG5cdFx0XHQpIHtcblx0XHRcdFx0b0xpc3RCaW5kaW5nID0gbmV3IChPRGF0YUxpc3RCaW5kaW5nIGFzIGFueSkoXG5cdFx0XHRcdFx0dGhpcy5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdHNQYXRoLnJlcGxhY2UoXCIoLi4uKVwiLCBcIlwiKSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRvUGFyYW1ldGVyc1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgb1N0YXJ0VXBQYXJhbXMgPVxuXHRcdFx0XHRcdHRoaXMub0FwcENvbXBvbmVudCAmJiB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpICYmIHRoaXMub0FwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCkuc3RhcnR1cFBhcmFtZXRlcnMsXG5cdFx0XHRcdG9JbmJvdW5kUGFyYW1ldGVycyA9IHRoaXMuZ2V0Vmlld0RhdGEoKS5pbmJvdW5kUGFyYW1ldGVycyBhcyBSZWNvcmQ8c3RyaW5nLCBJbmJvdW5kUGFyYW1ldGVyPiB8IHVuZGVmaW5lZDtcblx0XHRcdGxldCBjcmVhdGVQYXJhbXM7XG5cdFx0XHRpZiAob1N0YXJ0VXBQYXJhbXMgJiYgb1N0YXJ0VXBQYXJhbXMucHJlZmVycmVkTW9kZSAmJiBvU3RhcnRVcFBhcmFtcy5wcmVmZXJyZWRNb2RlWzBdLmluZGV4T2YoXCJjcmVhdGVcIikgIT09IC0xKSB7XG5cdFx0XHRcdGNyZWF0ZVBhcmFtcyA9IENvbW1vblV0aWxzLmdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGUob1N0YXJ0VXBQYXJhbXMsIG9JbmJvdW5kUGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGZvciBub3cgd2FpdCB1bnRpbCB0aGUgdmlldyBhbmQgdGhlIGNvbnRyb2xsZXIgaXMgY3JlYXRlZFxuXHRcdFx0KHRoaXMuZ2V0Um9vdENvbnRyb2woKSBhcyBhbnkpXG5cdFx0XHRcdC5nZXRDb250cm9sbGVyKClcblx0XHRcdFx0LmVkaXRGbG93LmNyZWF0ZURvY3VtZW50KG9MaXN0QmluZGluZywge1xuXHRcdFx0XHRcdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlLlN5bmMsXG5cdFx0XHRcdFx0Y3JlYXRlQWN0aW9uOiBiQWN0aW9uQ3JlYXRlLFxuXHRcdFx0XHRcdGRhdGE6IGNyZWF0ZVBhcmFtcyxcblx0XHRcdFx0XHRiRnJvbURlZmVycmVkOiB0cnVlXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLkRlZmVycmVkQ29udGV4dENyZWF0ZWQgPSBmYWxzZTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBEbyBOb3RoaW5nID9cblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0c2V0VmFyaWFudE1hbmFnZW1lbnQoc1ZhcmlhbnRNYW5hZ2VtZW50OiBhbnkpIHtcblx0XHRpZiAoc1ZhcmlhbnRNYW5hZ2VtZW50ID09PSBWYXJpYW50TWFuYWdlbWVudC5QYWdlKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJPYmplY3RQYWdlIGRvZXMgbm90IHN1cHBvcnQgUGFnZS1sZXZlbCB2YXJpYW50IG1hbmFnZW1lbnQgeWV0XCIpO1xuXHRcdFx0c1ZhcmlhbnRNYW5hZ2VtZW50ID0gVmFyaWFudE1hbmFnZW1lbnQuTm9uZTtcblx0XHR9XG5cblx0XHR0aGlzLnNldFByb3BlcnR5KFwidmFyaWFudE1hbmFnZW1lbnRcIiwgc1ZhcmlhbnRNYW5hZ2VtZW50KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBPYmplY3RQYWdlQ29tcG9uZW50O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztFQVdBLE1BQU1BLGlCQUFpQixHQUFHQyxXQUFXLENBQUNELGlCQUFpQjtJQUN0REUsWUFBWSxHQUFHRCxXQUFXLENBQUNDLFlBQVk7RUFDeEMsTUFBTUMsYUFBYSxHQUFHQyxXQUFXLENBQUNDLFVBQVUsQ0FBQ0YsYUFBYTtFQUFDLElBRXJERyxtQkFBbUIsV0FEeEJDLGNBQWMsQ0FBQyx1Q0FBdUMsRUFBRTtJQUFFQyxPQUFPLEVBQUUsa0JBQWtCO0lBQUVDLFFBQVEsRUFBRTtFQUFPLENBQUMsQ0FBQyxVQVF6R0MsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSwrQkFBK0I7SUFDckNDLFlBQVksRUFBRVosaUJBQWlCLENBQUNhO0VBQ2pDLENBQUMsQ0FBQyxVQVFESCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLDJDQUEyQztJQUNqREMsWUFBWSxFQUFFVCxhQUFhLENBQUNXO0VBQzdCLENBQUMsQ0FBQyxVQU1ESixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFNNUJELFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUMsVUFNREYsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxTQUFTO0lBQ2ZDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQyxVQU1ERixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQSxNQUdNRyxzQkFBc0IsR0FBWSxLQUFLO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FFL0NDLGlCQUFpQixHQUFqQiw2QkFBb0I7TUFDbkIsT0FBTyxJQUFJO0lBQ1osQ0FBQztJQUFBLE9BRURDLG9CQUFvQixHQUFwQiw4QkFBcUJDLGNBQW9DLEVBQUVDLGdCQUFrQyxFQUF1QjtNQUNuSCxPQUFPQywwQkFBMEIsQ0FBQ0YsY0FBYyxFQUFFQyxnQkFBZ0IsQ0FBQztJQUNwRTs7SUFFQTtJQUNBO0lBQUE7SUFBQSxPQUNBRSxxQkFBcUIsR0FBckIsK0JBQXNCQyxLQUFVLEVBQUVDLFlBQWlCLEVBQUVDLGFBQWtCLEVBQUU7TUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQ1Qsc0JBQXNCLEVBQUU7UUFDakMsSUFBSSxDQUFDQSxzQkFBc0IsR0FBRyxJQUFJO1FBQ2xDLE1BQU1VLFdBQVcsR0FBRztVQUNuQkMsU0FBUyxFQUFFLGNBQWM7VUFDekJDLGVBQWUsRUFBRTtRQUNsQixDQUFDO1FBQ0Q7UUFDQTtRQUNBLElBQ0MsQ0FBQ0osWUFBWSxJQUNaQSxZQUFZLENBQUNLLFVBQVUsRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFFLElBQUksQ0FBQ0MsYUFBYSxDQUFDQyxxQkFBcUIsRUFBRSxDQUFTQyxZQUFZLEVBQUcsRUFDM0c7VUFDRFIsWUFBWSxHQUFHLElBQUtTLGdCQUFnQixDQUNuQyxJQUFJLENBQUNDLFFBQVEsRUFBRSxFQUNmWCxLQUFLLENBQUNZLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQzFCQyxTQUFTLEVBQ1RBLFNBQVMsRUFDVEEsU0FBUyxFQUNUVixXQUFXLENBQ1g7UUFDRjtRQUNBLE1BQU1XLGNBQWMsR0FDbEIsSUFBSSxDQUFDUCxhQUFhLElBQUksSUFBSSxDQUFDQSxhQUFhLENBQUNRLGdCQUFnQixFQUFFLElBQUksSUFBSSxDQUFDUixhQUFhLENBQUNRLGdCQUFnQixFQUFFLENBQUNDLGlCQUFpQjtVQUN2SEMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0MsaUJBQWlFO1FBQzFHLElBQUlDLFlBQVk7UUFDaEIsSUFBSU4sY0FBYyxJQUFJQSxjQUFjLENBQUNPLGFBQWEsSUFBSVAsY0FBYyxDQUFDTyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUNDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtVQUMvR0YsWUFBWSxHQUFHRyxXQUFXLENBQUNDLDRCQUE0QixDQUFDVixjQUFjLEVBQUVHLGtCQUFrQixDQUFDO1FBQzVGOztRQUVBO1FBQ0MsSUFBSSxDQUFDUSxjQUFjLEVBQUUsQ0FDcEJDLGFBQWEsRUFBRSxDQUNmQyxRQUFRLENBQUNDLGNBQWMsQ0FBQzNCLFlBQVksRUFBRTtVQUN0QzRCLFlBQVksRUFBRWpELFlBQVksQ0FBQ2tELElBQUk7VUFDL0JDLFlBQVksRUFBRTdCLGFBQWE7VUFDM0I4QixJQUFJLEVBQUVaLFlBQVk7VUFDbEJhLGFBQWEsRUFBRTtRQUNoQixDQUFDLENBQUMsQ0FDREMsT0FBTyxDQUFDLE1BQU07VUFDZCxJQUFJLENBQUN6QyxzQkFBc0IsR0FBRyxLQUFLO1FBQ3BDLENBQUMsQ0FBQyxDQUNEMEMsS0FBSyxDQUFDLFlBQVk7VUFDbEI7UUFBQSxDQUNBLENBQUM7TUFDSjtJQUNELENBQUM7SUFBQSxPQUVEQyxvQkFBb0IsR0FBcEIsOEJBQXFCQyxrQkFBdUIsRUFBRTtNQUM3QyxJQUFJQSxrQkFBa0IsS0FBSzNELGlCQUFpQixDQUFDYyxJQUFJLEVBQUU7UUFDbEQ4QyxHQUFHLENBQUNDLEtBQUssQ0FBQywrREFBK0QsQ0FBQztRQUMxRUYsa0JBQWtCLEdBQUczRCxpQkFBaUIsQ0FBQ2EsSUFBSTtNQUM1QztNQUVBLElBQUksQ0FBQ2lELFdBQVcsQ0FBQyxtQkFBbUIsRUFBRUgsa0JBQWtCLENBQUM7SUFDMUQsQ0FBQztJQUFBO0VBQUEsRUF2SWdDSSxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BMElwQ3pELG1CQUFtQjtBQUFBIn0=