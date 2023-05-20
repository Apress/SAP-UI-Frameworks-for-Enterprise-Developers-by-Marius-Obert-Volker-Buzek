/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ResourceModelHelper", "sap/m/BusyDialog", "./FieldWrapper"], function (CommonUtils, MetaModelConverter, ClassSupport, ResourceModelHelper, BusyDialog, FieldWrapper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FileWrapper = (_dec = defineUI5Class("sap.fe.macros.controls.FileWrapper"), _dec2 = property({
    type: "sap.ui.core.URI"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = aggregation({
    type: "sap.m.Avatar",
    multiple: false
  }), _dec7 = aggregation({
    type: "sap.ui.core.Icon",
    multiple: false
  }), _dec8 = aggregation({
    type: "sap.m.Link",
    multiple: false
  }), _dec9 = aggregation({
    type: "sap.m.Text",
    multiple: false
  }), _dec10 = aggregation({
    type: "sap.ui.unified.FileUploader",
    multiple: false
  }), _dec11 = aggregation({
    type: "sap.m.Button",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_FieldWrapper) {
    _inheritsLoose(FileWrapper, _FieldWrapper);
    function FileWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _FieldWrapper.call(this, ...args) || this;
      _initializerDefineProperty(_this, "uploadUrl", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filename", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "mediaType", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "avatar", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "icon", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "link", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "text", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fileUploader", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "deleteButton", _descriptor10, _assertThisInitialized(_this));
      _this._busy = false;
      return _this;
    }
    var _proto = FileWrapper.prototype;
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      const accInfo = [];
      if (this.avatar) {
        accInfo.push(this.avatar);
      }
      if (this.icon) {
        accInfo.push(this.icon);
      }
      if (this.link) {
        accInfo.push(this.link);
      }
      if (this.text) {
        accInfo.push(this.text);
      }
      if (this.fileUploader) {
        accInfo.push(this.fileUploader);
      }
      if (this.deleteButton) {
        accInfo.push(this.deleteButton);
      }
      return {
        children: accInfo
      };
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      this._setAriaLabels();
      this._addSideEffects();
    };
    _proto._setAriaLabels = function _setAriaLabels() {
      this._setAriaLabelledBy(this.avatar);
      this._setAriaLabelledBy(this.icon);
      this._setAriaLabelledBy(this.link);
      this._setAriaLabelledBy(this.text);
      this._setAriaLabelledBy(this.fileUploader);
      this._setAriaLabelledBy(this.deleteButton);
    };
    _proto._addSideEffects = function _addSideEffects() {
      var _this$_getSideEffectC;
      // add control SideEffects for stream content, filename and mediatype
      const navigationProperties = [],
        view = CommonUtils.getTargetView(this),
        viewDataFullContextPath = view.getViewData().fullContextPath,
        metaModel = view.getModel().getMetaModel(),
        metaModelPath = metaModel.getMetaPath(viewDataFullContextPath),
        viewContext = metaModel.getContext(viewDataFullContextPath),
        dataViewModelPath = MetaModelConverter.getInvolvedDataModelObjects(viewContext),
        sourcePath = this.data("sourcePath"),
        fieldPath = sourcePath.replace(`${metaModelPath}`, ""),
        path = fieldPath.replace(this.propertyPath, "");
      navigationProperties.push({
        $NavigationPropertyPath: fieldPath
      });
      if (this.filename) {
        navigationProperties.push({
          $NavigationPropertyPath: path + this.filename
        });
      }
      if (this.mediaType) {
        navigationProperties.push({
          $NavigationPropertyPath: path + this.mediaType
        });
      }
      (_this$_getSideEffectC = this._getSideEffectController()) === null || _this$_getSideEffectC === void 0 ? void 0 : _this$_getSideEffectC.addControlSideEffects(dataViewModelPath.targetEntityType.fullyQualifiedName, {
        sourceProperties: [fieldPath],
        targetEntities: navigationProperties,
        sourceControlId: this.getId()
      });
    };
    _proto._getSideEffectController = function _getSideEffectController() {
      const controller = this._getViewController();
      return controller ? controller._sideEffects : undefined;
    };
    _proto._getViewController = function _getViewController() {
      const view = CommonUtils.getTargetView(this);
      return view && view.getController();
    };
    _proto.getUploadUrl = function getUploadUrl() {
      // set upload url as canonical url for NavigationProperties
      // this is a workaround as some backends cannot resolve NavigationsProperties for stream types
      const context = this.getBindingContext();
      return context && this.uploadUrl ? this.uploadUrl.replace(context.getPath(), context.getCanonicalPath()) : "";
    };
    _proto.setUIBusy = function setUIBusy(busy) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      this._busy = busy;
      if (busy) {
        if (!this.busyDialog) {
          this.busyDialog = new BusyDialog({
            text: getResourceModel(this).getText("M_FILEWRAPPER_BUSY_DIALOG_TITLE"),
            showCancelButton: false
          });
        }
        setTimeout(function () {
          if (that._busy) {
            var _that$busyDialog;
            (_that$busyDialog = that.busyDialog) === null || _that$busyDialog === void 0 ? void 0 : _that$busyDialog.open();
          }
        }, 1000);
      } else {
        var _this$busyDialog;
        (_this$busyDialog = this.busyDialog) === null || _this$busyDialog === void 0 ? void 0 : _this$busyDialog.close(false);
      }
    };
    _proto.getUIBusy = function getUIBusy() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      return this._busy;
    };
    FileWrapper.render = function render(renderManager, fileWrapper) {
      renderManager.openStart("div", fileWrapper); // FileWrapper control div
      renderManager.style("width", fileWrapper.width);
      renderManager.openEnd();

      // Outer Box
      renderManager.openStart("div"); // div for all controls
      renderManager.style("display", "flex");
      renderManager.style("box-sizing", "border-box");
      renderManager.style("justify-content", "space-between");
      renderManager.style("align-items", "center");
      renderManager.style("flex-wrap", "wrap");
      renderManager.style("align-content", "stretch");
      renderManager.style("width", "100%");
      renderManager.openEnd();

      // Display Mode
      renderManager.openStart("div"); // div for controls shown in Display mode
      renderManager.style("display", "flex");
      renderManager.style("align-items", "center");
      renderManager.openEnd();
      if (fileWrapper.avatar) {
        renderManager.renderControl(fileWrapper.avatar); // render the Avatar Control
      } else {
        renderManager.renderControl(fileWrapper.icon); // render the Icon Control
        renderManager.renderControl(fileWrapper.link); // render the Link Control
        renderManager.renderControl(fileWrapper.text); // render the Text Control for empty file indication
      }

      renderManager.close("div"); // div for controls shown in Display mode

      // Additional content for Edit Mode
      renderManager.openStart("div"); // div for controls shown in Display + Edit mode
      renderManager.style("display", "flex");
      renderManager.style("align-items", "center");
      renderManager.openEnd();
      renderManager.renderControl(fileWrapper.fileUploader); // render the FileUploader Control
      renderManager.renderControl(fileWrapper.deleteButton); // render the Delete Button Control
      renderManager.close("div"); // div for controls shown in Display + Edit mode

      renderManager.close("div"); // div for all controls

      renderManager.close("div"); // end of the complete Control
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      const oSideEffects = this._getSideEffectController();
      if (oSideEffects) {
        oSideEffects.removeControlSideEffects(this);
      }
      delete this.busyDialog;
      FieldWrapper.prototype.destroy.apply(this, [bSuppressInvalidate]);
    };
    return FileWrapper;
  }(FieldWrapper), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "uploadUrl", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "propertyPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "filename", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "mediaType", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "avatar", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "link", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "fileUploader", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "deleteButton", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FileWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWxlV3JhcHBlciIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsIl9idXN5IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJhY2NJbmZvIiwiYXZhdGFyIiwicHVzaCIsImljb24iLCJsaW5rIiwidGV4dCIsImZpbGVVcGxvYWRlciIsImRlbGV0ZUJ1dHRvbiIsImNoaWxkcmVuIiwib25CZWZvcmVSZW5kZXJpbmciLCJfc2V0QXJpYUxhYmVscyIsIl9hZGRTaWRlRWZmZWN0cyIsIl9zZXRBcmlhTGFiZWxsZWRCeSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwidmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsInZpZXdEYXRhRnVsbENvbnRleHRQYXRoIiwiZ2V0Vmlld0RhdGEiLCJmdWxsQ29udGV4dFBhdGgiLCJtZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIm1ldGFNb2RlbFBhdGgiLCJnZXRNZXRhUGF0aCIsInZpZXdDb250ZXh0IiwiZ2V0Q29udGV4dCIsImRhdGFWaWV3TW9kZWxQYXRoIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwic291cmNlUGF0aCIsImRhdGEiLCJmaWVsZFBhdGgiLCJyZXBsYWNlIiwicGF0aCIsInByb3BlcnR5UGF0aCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiZmlsZW5hbWUiLCJtZWRpYVR5cGUiLCJfZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIiLCJhZGRDb250cm9sU2lkZUVmZmVjdHMiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwic291cmNlUHJvcGVydGllcyIsInRhcmdldEVudGl0aWVzIiwic291cmNlQ29udHJvbElkIiwiZ2V0SWQiLCJjb250cm9sbGVyIiwiX2dldFZpZXdDb250cm9sbGVyIiwiX3NpZGVFZmZlY3RzIiwidW5kZWZpbmVkIiwiZ2V0Q29udHJvbGxlciIsImdldFVwbG9hZFVybCIsImNvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInVwbG9hZFVybCIsImdldFBhdGgiLCJnZXRDYW5vbmljYWxQYXRoIiwic2V0VUlCdXN5IiwiYnVzeSIsInRoYXQiLCJidXN5RGlhbG9nIiwiQnVzeURpYWxvZyIsImdldFJlc291cmNlTW9kZWwiLCJnZXRUZXh0Iiwic2hvd0NhbmNlbEJ1dHRvbiIsInNldFRpbWVvdXQiLCJvcGVuIiwiY2xvc2UiLCJnZXRVSUJ1c3kiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiZmlsZVdyYXBwZXIiLCJvcGVuU3RhcnQiLCJzdHlsZSIsIndpZHRoIiwib3BlbkVuZCIsInJlbmRlckNvbnRyb2wiLCJkZXN0cm95IiwiYlN1cHByZXNzSW52YWxpZGF0ZSIsIm9TaWRlRWZmZWN0cyIsInJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyIsIkZpZWxkV3JhcHBlciIsInByb3RvdHlwZSIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWxlV3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IFNpZGVFZmZlY3RzRW50aXR5VHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSB7IFZpZXdEYXRhIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1RlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgQXZhdGFyIGZyb20gXCJzYXAvbS9BdmF0YXJcIjtcbmltcG9ydCBCdXN5RGlhbG9nIGZyb20gXCJzYXAvbS9CdXN5RGlhbG9nXCI7XG5pbXBvcnQgdHlwZSBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgTGluayBmcm9tIFwic2FwL20vTGlua1wiO1xuaW1wb3J0IHR5cGUgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgSWNvbiBmcm9tIFwic2FwL3VpL2NvcmUvSWNvblwiO1xuaW1wb3J0IHR5cGUgeyBVUkkgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBGaWxlVXBsb2FkZXIgZnJvbSBcInNhcC91aS91bmlmaWVkL0ZpbGVVcGxvYWRlclwiO1xuaW1wb3J0IEZpZWxkV3JhcHBlciBmcm9tIFwiLi9GaWVsZFdyYXBwZXJcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5GaWxlV3JhcHBlclwiKVxuY2xhc3MgRmlsZVdyYXBwZXIgZXh0ZW5kcyBGaWVsZFdyYXBwZXIge1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC51aS5jb3JlLlVSSVwiIH0pXG5cdHVwbG9hZFVybCE6IFVSSTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHByb3BlcnR5UGF0aCE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbGVuYW1lITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bWVkaWFUeXBlITogc3RyaW5nO1xuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uQXZhdGFyXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRhdmF0YXIhOiBBdmF0YXI7XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5JY29uXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRpY29uITogSWNvbjtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5tLkxpbmtcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGxpbmshOiBMaW5rO1xuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uVGV4dFwiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0dGV4dCE6IFRleHQ7XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkudW5pZmllZC5GaWxlVXBsb2FkZXJcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGZpbGVVcGxvYWRlciE6IEZpbGVVcGxvYWRlcjtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5tLkJ1dHRvblwiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0ZGVsZXRlQnV0dG9uITogQnV0dG9uO1xuXG5cdHByaXZhdGUgX2J1c3k6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRwcml2YXRlIGJ1c3lEaWFsb2c/OiBCdXN5RGlhbG9nO1xuXG5cdGdldEFjY2Vzc2liaWxpdHlJbmZvKCkge1xuXHRcdGNvbnN0IGFjY0luZm8gPSBbXTtcblx0XHRpZiAodGhpcy5hdmF0YXIpIHtcblx0XHRcdGFjY0luZm8ucHVzaCh0aGlzLmF2YXRhcik7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmljb24pIHtcblx0XHRcdGFjY0luZm8ucHVzaCh0aGlzLmljb24pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5saW5rKSB7XG5cdFx0XHRhY2NJbmZvLnB1c2godGhpcy5saW5rKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMudGV4dCkge1xuXHRcdFx0YWNjSW5mby5wdXNoKHRoaXMudGV4dCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmZpbGVVcGxvYWRlcikge1xuXHRcdFx0YWNjSW5mby5wdXNoKHRoaXMuZmlsZVVwbG9hZGVyKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuZGVsZXRlQnV0dG9uKSB7XG5cdFx0XHRhY2NJbmZvLnB1c2godGhpcy5kZWxldGVCdXR0b24pO1xuXHRcdH1cblx0XHRyZXR1cm4geyBjaGlsZHJlbjogYWNjSW5mbyB9O1xuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVscygpO1xuXHRcdHRoaXMuX2FkZFNpZGVFZmZlY3RzKCk7XG5cdH1cblxuXHRfc2V0QXJpYUxhYmVscygpIHtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmF2YXRhcik7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5pY29uKTtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmxpbmspO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMudGV4dCk7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5maWxlVXBsb2FkZXIpO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMuZGVsZXRlQnV0dG9uKTtcblx0fVxuXG5cdF9hZGRTaWRlRWZmZWN0cygpIHtcblx0XHQvLyBhZGQgY29udHJvbCBTaWRlRWZmZWN0cyBmb3Igc3RyZWFtIGNvbnRlbnQsIGZpbGVuYW1lIGFuZCBtZWRpYXR5cGVcblx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllczogU2lkZUVmZmVjdHNFbnRpdHlUeXBlW10gPSBbXSxcblx0XHRcdHZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMgYXMgQ29udHJvbCksXG5cdFx0XHR2aWV3RGF0YUZ1bGxDb250ZXh0UGF0aCA9ICh2aWV3LmdldFZpZXdEYXRhKCkgYXMgVmlld0RhdGEpLmZ1bGxDb250ZXh0UGF0aCxcblx0XHRcdG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdG1ldGFNb2RlbFBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgodmlld0RhdGFGdWxsQ29udGV4dFBhdGgpLFxuXHRcdFx0dmlld0NvbnRleHQgPSBtZXRhTW9kZWwuZ2V0Q29udGV4dCh2aWV3RGF0YUZ1bGxDb250ZXh0UGF0aCksXG5cdFx0XHRkYXRhVmlld01vZGVsUGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModmlld0NvbnRleHQpLFxuXHRcdFx0c291cmNlUGF0aCA9IHRoaXMuZGF0YShcInNvdXJjZVBhdGhcIikgYXMgc3RyaW5nLFxuXHRcdFx0ZmllbGRQYXRoID0gc291cmNlUGF0aC5yZXBsYWNlKGAke21ldGFNb2RlbFBhdGh9YCwgXCJcIiksXG5cdFx0XHRwYXRoID0gZmllbGRQYXRoLnJlcGxhY2UodGhpcy5wcm9wZXJ0eVBhdGgsIFwiXCIpO1xuXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaCh7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBmaWVsZFBhdGggfSk7XG5cdFx0aWYgKHRoaXMuZmlsZW5hbWUpIHtcblx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2goeyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogcGF0aCArIHRoaXMuZmlsZW5hbWUgfSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm1lZGlhVHlwZSkge1xuXHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaCh7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBwYXRoICsgdGhpcy5tZWRpYVR5cGUgfSk7XG5cdFx0fVxuXHRcdHRoaXMuX2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCk/LmFkZENvbnRyb2xTaWRlRWZmZWN0cyhkYXRhVmlld01vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSwge1xuXHRcdFx0c291cmNlUHJvcGVydGllczogW2ZpZWxkUGF0aF0sXG5cdFx0XHR0YXJnZXRFbnRpdGllczogbmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0XHRzb3VyY2VDb250cm9sSWQ6IHRoaXMuZ2V0SWQoKVxuXHRcdH0pO1xuXHR9XG5cblx0X2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCkge1xuXHRcdGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLl9nZXRWaWV3Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyIHwgdW5kZWZpbmVkO1xuXHRcdHJldHVybiBjb250cm9sbGVyID8gY29udHJvbGxlci5fc2lkZUVmZmVjdHMgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfZ2V0Vmlld0NvbnRyb2xsZXIoKSB7XG5cdFx0Y29uc3QgdmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyBhcyBDb250cm9sKTtcblx0XHRyZXR1cm4gdmlldyAmJiB2aWV3LmdldENvbnRyb2xsZXIoKTtcblx0fVxuXG5cdGdldFVwbG9hZFVybCgpIHtcblx0XHQvLyBzZXQgdXBsb2FkIHVybCBhcyBjYW5vbmljYWwgdXJsIGZvciBOYXZpZ2F0aW9uUHJvcGVydGllc1xuXHRcdC8vIHRoaXMgaXMgYSB3b3JrYXJvdW5kIGFzIHNvbWUgYmFja2VuZHMgY2Fubm90IHJlc29sdmUgTmF2aWdhdGlvbnNQcm9wZXJ0aWVzIGZvciBzdHJlYW0gdHlwZXNcblx0XHRjb25zdCBjb250ZXh0ID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0cmV0dXJuIGNvbnRleHQgJiYgdGhpcy51cGxvYWRVcmwgPyB0aGlzLnVwbG9hZFVybC5yZXBsYWNlKGNvbnRleHQuZ2V0UGF0aCgpLCBjb250ZXh0LmdldENhbm9uaWNhbFBhdGgoKSkgOiBcIlwiO1xuXHR9XG5cblx0c2V0VUlCdXN5KGJ1c3k6IGJvb2xlYW4pIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblx0XHRjb25zdCB0aGF0ID0gdGhpcztcblx0XHR0aGlzLl9idXN5ID0gYnVzeTtcblx0XHRpZiAoYnVzeSkge1xuXHRcdFx0aWYgKCF0aGlzLmJ1c3lEaWFsb2cpIHtcblx0XHRcdFx0dGhpcy5idXN5RGlhbG9nID0gbmV3IEJ1c3lEaWFsb2coe1xuXHRcdFx0XHRcdHRleHQ6IGdldFJlc291cmNlTW9kZWwodGhpcykuZ2V0VGV4dChcIk1fRklMRVdSQVBQRVJfQlVTWV9ESUFMT0dfVElUTEVcIiksXG5cdFx0XHRcdFx0c2hvd0NhbmNlbEJ1dHRvbjogZmFsc2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYgKHRoYXQuX2J1c3kpIHtcblx0XHRcdFx0XHR0aGF0LmJ1c3lEaWFsb2c/Lm9wZW4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMTAwMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYnVzeURpYWxvZz8uY2xvc2UoZmFsc2UpO1xuXHRcdH1cblx0fVxuXG5cdGdldFVJQnVzeSgpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblx0XHRyZXR1cm4gdGhpcy5fYnVzeTtcblx0fVxuXG5cdHN0YXRpYyByZW5kZXIocmVuZGVyTWFuYWdlcjogUmVuZGVyTWFuYWdlciwgZmlsZVdyYXBwZXI6IEZpbGVXcmFwcGVyKSB7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIiwgZmlsZVdyYXBwZXIpOyAvLyBGaWxlV3JhcHBlciBjb250cm9sIGRpdlxuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJ3aWR0aFwiLCBmaWxlV3JhcHBlci53aWR0aCk7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cblx0XHQvLyBPdXRlciBCb3hcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5TdGFydChcImRpdlwiKTsgLy8gZGl2IGZvciBhbGwgY29udHJvbHNcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiZGlzcGxheVwiLCBcImZsZXhcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImJveC1zaXppbmdcIiwgXCJib3JkZXItYm94XCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJqdXN0aWZ5LWNvbnRlbnRcIiwgXCJzcGFjZS1iZXR3ZWVuXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJhbGlnbi1pdGVtc1wiLCBcImNlbnRlclwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiZmxleC13cmFwXCIsIFwid3JhcFwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiYWxpZ24tY29udGVudFwiLCBcInN0cmV0Y2hcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5FbmQoKTtcblxuXHRcdC8vIERpc3BsYXkgTW9kZVxuXHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIpOyAvLyBkaXYgZm9yIGNvbnRyb2xzIHNob3duIGluIERpc3BsYXkgbW9kZVxuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJkaXNwbGF5XCIsIFwiZmxleFwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiYWxpZ24taXRlbXNcIiwgXCJjZW50ZXJcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cblx0XHRpZiAoZmlsZVdyYXBwZXIuYXZhdGFyKSB7XG5cdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmlsZVdyYXBwZXIuYXZhdGFyKTsgLy8gcmVuZGVyIHRoZSBBdmF0YXIgQ29udHJvbFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmlsZVdyYXBwZXIuaWNvbik7IC8vIHJlbmRlciB0aGUgSWNvbiBDb250cm9sXG5cdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmlsZVdyYXBwZXIubGluayk7IC8vIHJlbmRlciB0aGUgTGluayBDb250cm9sXG5cdFx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmlsZVdyYXBwZXIudGV4dCk7IC8vIHJlbmRlciB0aGUgVGV4dCBDb250cm9sIGZvciBlbXB0eSBmaWxlIGluZGljYXRpb25cblx0XHR9XG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTsgLy8gZGl2IGZvciBjb250cm9scyBzaG93biBpbiBEaXNwbGF5IG1vZGVcblxuXHRcdC8vIEFkZGl0aW9uYWwgY29udGVudCBmb3IgRWRpdCBNb2RlXG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIik7IC8vIGRpdiBmb3IgY29udHJvbHMgc2hvd24gaW4gRGlzcGxheSArIEVkaXQgbW9kZVxuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJkaXNwbGF5XCIsIFwiZmxleFwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiYWxpZ24taXRlbXNcIiwgXCJjZW50ZXJcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZpbGVXcmFwcGVyLmZpbGVVcGxvYWRlcik7IC8vIHJlbmRlciB0aGUgRmlsZVVwbG9hZGVyIENvbnRyb2xcblx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmlsZVdyYXBwZXIuZGVsZXRlQnV0dG9uKTsgLy8gcmVuZGVyIHRoZSBEZWxldGUgQnV0dG9uIENvbnRyb2xcblx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpOyAvLyBkaXYgZm9yIGNvbnRyb2xzIHNob3duIGluIERpc3BsYXkgKyBFZGl0IG1vZGVcblxuXHRcdHJlbmRlck1hbmFnZXIuY2xvc2UoXCJkaXZcIik7IC8vIGRpdiBmb3IgYWxsIGNvbnRyb2xzXG5cblx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpOyAvLyBlbmQgb2YgdGhlIGNvbXBsZXRlIENvbnRyb2xcblx0fVxuXG5cdGRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZTogYm9vbGVhbikge1xuXHRcdGNvbnN0IG9TaWRlRWZmZWN0cyA9IHRoaXMuX2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCk7XG5cdFx0aWYgKG9TaWRlRWZmZWN0cykge1xuXHRcdFx0b1NpZGVFZmZlY3RzLnJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyh0aGlzKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHRoaXMuYnVzeURpYWxvZztcblx0XHRGaWVsZFdyYXBwZXIucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgW2JTdXBwcmVzc0ludmFsaWRhdGVdKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWxlV3JhcHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O01Bc0JNQSxXQUFXLFdBRGhCQyxjQUFjLENBQUMsb0NBQW9DLENBQUMsVUFFbkRDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBa0IsQ0FBQyxDQUFDLFVBR3JDRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxD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