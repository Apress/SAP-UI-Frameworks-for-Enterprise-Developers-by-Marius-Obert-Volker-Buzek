/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/base/util/uid", "sap/fe/core/converters/ConverterContext", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Component", "sap/ui/core/Control"], function (merge, uid, ConverterContext, ClassSupport, Component, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class3;
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
  const MacroAPIFQN = "sap.fe.macros.MacroAPI";

  /**
   * Base API control for building blocks.
   *
   * @hideconstructor
   * @name sap.fe.macros.MacroAPI
   * @public
   */
  let MacroAPI = (_dec = defineUI5Class(MacroAPIFQN), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MacroAPI, _Control);
    function MacroAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _Control.call(this, mSettings, ...others) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor4, _assertThisInitialized(_this));
      _this.parentContextToBind = {};
      MacroAPI.registerInstance(_assertThisInitialized(_this));
      return _this;
    }
    var _proto = MacroAPI.prototype;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      if (!this.getModel("_pageModel")) {
        var _Component$getOwnerCo;
        const oPageModel = (_Component$getOwnerCo = Component.getOwnerComponentFor(this)) === null || _Component$getOwnerCo === void 0 ? void 0 : _Component$getOwnerCo.getModel("_pageModel");
        if (oPageModel) {
          this.setModel(oPageModel, "_pageModel");
        }
      }
    };
    MacroAPI.registerInstance = function registerInstance(_instance) {
      if (!this.instanceMap.get(_instance.constructor)) {
        this.instanceMap.set(_instance.constructor, []);
      }
      this.instanceMap.get(_instance.constructor).push(_instance);
    }

    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */;
    MacroAPI.render = function render(oRm, oControl) {
      oRm.renderControl(oControl.content);
    };
    _proto.rerender = function rerender() {
      this.content.rerender();
    };
    _proto.getDomRef = function getDomRef() {
      const oContent = this.content;
      return oContent ? oContent.getDomRef() : _Control.prototype.getDomRef.call(this);
    };
    _proto.getController = function getController() {
      return this.getModel("$view").getObject().getController();
    };
    MacroAPI.getAPI = function getAPI(oEvent) {
      let oSource = oEvent.getSource();
      if (this.isDependentBound) {
        while (oSource && !oSource.isA(MacroAPIFQN) && oSource.getParent) {
          const oDependents = oSource.getDependents();
          const hasCorrectDependent = oDependents.find(oDependent => oDependent.isA(MacroAPIFQN));
          if (hasCorrectDependent) {
            oSource = hasCorrectDependent;
          } else {
            oSource = oSource.getParent();
          }
        }
      } else {
        while (oSource && !oSource.isA(MacroAPIFQN) && oSource.getParent) {
          oSource = oSource.getParent();
        }
      }
      if (!oSource || !oSource.isA(MacroAPIFQN)) {
        const oSourceMap = this.instanceMap.get(this);
        oSource = oSourceMap === null || oSourceMap === void 0 ? void 0 : oSourceMap[oSourceMap.length - 1];
      }
      return oSource && oSource.isA(MacroAPIFQN) && oSource;
    }

    /**
     * Retrieve a Converter Context.
     *
     * @param oDataModelPath
     * @param contextPath
     * @param mSettings
     * @returns A Converter Context
     */;
    /**
     * Keep track of a binding context that should be assigned to the parent of that control.
     *
     * @param modelName The model name that the context will relate to
     * @param path The path of the binding context
     */
    _proto.setParentBindingContext = function setParentBindingContext(modelName, path) {
      this.parentContextToBind[modelName] = path;
    };
    _proto.setParent = function setParent() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _Control.prototype.setParent.call(this, ...args);
      Object.keys(this.parentContextToBind).forEach(modelName => {
        this.getParent().bindObject({
          path: this.parentContextToBind[modelName],
          model: modelName,
          events: {
            change: function () {
              const oBoundContext = this.getBoundContext();
              if (oBoundContext && !oBoundContext.getObject()) {
                oBoundContext.setProperty("", {});
              }
            }
          }
        });
      });
    };
    return MacroAPI;
  }(Control), _class3.namespace = "sap.fe.macros", _class3.macroName = "Macro", _class3.fragment = "sap.fe.macros.Macro", _class3.hasValidation = true, _class3.instanceMap = new WeakMap(), _class3.isDependentBound = false, _class3.getConverterContext = function (oDataModelPath, contextPath, mSettings) {
    const oAppComponent = mSettings.appComponent;
    const viewData = mSettings.models.viewData && mSettings.models.viewData.getData();
    return ConverterContext.createConverterContextForMacro(oDataModelPath.startingEntitySet.name, mSettings.models.metaModel, oAppComponent && oAppComponent.getDiagnostics(), merge, oDataModelPath.contextLocation, viewData);
  }, _class3.createBindingContext = function (oData, mSettings) {
    const sContextPath = `/uid--${uid()}`;
    mSettings.models.converterContext.setProperty(sContextPath, oData);
    return mSettings.models.converterContext.createBindingContext(sContextPath);
  }, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
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
  return MacroAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYWNyb0FQSUZRTiIsIk1hY3JvQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJpbXBsZW1lbnRJbnRlcmZhY2UiLCJwcm9wZXJ0eSIsInR5cGUiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiaXNEZWZhdWx0IiwibVNldHRpbmdzIiwib3RoZXJzIiwicGFyZW50Q29udGV4dFRvQmluZCIsInJlZ2lzdGVySW5zdGFuY2UiLCJpbml0IiwiZ2V0TW9kZWwiLCJvUGFnZU1vZGVsIiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJzZXRNb2RlbCIsIl9pbnN0YW5jZSIsImluc3RhbmNlTWFwIiwiZ2V0IiwiY29uc3RydWN0b3IiLCJzZXQiLCJwdXNoIiwicmVuZGVyIiwib1JtIiwib0NvbnRyb2wiLCJyZW5kZXJDb250cm9sIiwiY29udGVudCIsInJlcmVuZGVyIiwiZ2V0RG9tUmVmIiwib0NvbnRlbnQiLCJnZXRDb250cm9sbGVyIiwiZ2V0T2JqZWN0IiwiZ2V0QVBJIiwib0V2ZW50Iiwib1NvdXJjZSIsImdldFNvdXJjZSIsImlzRGVwZW5kZW50Qm91bmQiLCJpc0EiLCJnZXRQYXJlbnQiLCJvRGVwZW5kZW50cyIsImdldERlcGVuZGVudHMiLCJoYXNDb3JyZWN0RGVwZW5kZW50IiwiZmluZCIsIm9EZXBlbmRlbnQiLCJvU291cmNlTWFwIiwibGVuZ3RoIiwic2V0UGFyZW50QmluZGluZ0NvbnRleHQiLCJtb2RlbE5hbWUiLCJwYXRoIiwic2V0UGFyZW50IiwiYXJncyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiYmluZE9iamVjdCIsIm1vZGVsIiwiZXZlbnRzIiwiY2hhbmdlIiwib0JvdW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInNldFByb3BlcnR5IiwiQ29udHJvbCIsIm5hbWVzcGFjZSIsIm1hY3JvTmFtZSIsImZyYWdtZW50IiwiaGFzVmFsaWRhdGlvbiIsIldlYWtNYXAiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Iiwib0RhdGFNb2RlbFBhdGgiLCJjb250ZXh0UGF0aCIsIm9BcHBDb21wb25lbnQiLCJhcHBDb21wb25lbnQiLCJ2aWV3RGF0YSIsIm1vZGVscyIsImdldERhdGEiLCJDb252ZXJ0ZXJDb250ZXh0IiwiY3JlYXRlQ29udmVydGVyQ29udGV4dEZvck1hY3JvIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYW1lIiwibWV0YU1vZGVsIiwiZ2V0RGlhZ25vc3RpY3MiLCJtZXJnZSIsImNvbnRleHRMb2NhdGlvbiIsImNyZWF0ZUJpbmRpbmdDb250ZXh0Iiwib0RhdGEiLCJzQ29udGV4dFBhdGgiLCJ1aWQiLCJjb252ZXJ0ZXJDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNYWNyb0FQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB1aWQgZnJvbSBcInNhcC9iYXNlL3V0aWwvdWlkXCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBpbXBsZW1lbnRJbnRlcmZhY2UsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCB0eXBlIHsgSUZvcm1Db250ZW50IH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFJlbmRlck1hbmFnZXIgZnJvbSBcInNhcC91aS9jb3JlL1JlbmRlck1hbmFnZXJcIjtcbmltcG9ydCB0eXBlIENsaWVudENvbnRleHRCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQ2xpZW50Q29udGV4dEJpbmRpbmdcIjtcblxuY29uc3QgTWFjcm9BUElGUU4gPSBcInNhcC5mZS5tYWNyb3MuTWFjcm9BUElcIjtcblxuLyoqXG4gKiBCYXNlIEFQSSBjb250cm9sIGZvciBidWlsZGluZyBibG9ja3MuXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQG5hbWUgc2FwLmZlLm1hY3Jvcy5NYWNyb0FQSVxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoTWFjcm9BUElGUU4pXG5jbGFzcyBNYWNyb0FQSSBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblxuXHRzdGF0aWMgbmFtZXNwYWNlOiBzdHJpbmcgPSBcInNhcC5mZS5tYWNyb3NcIjtcblxuXHRzdGF0aWMgbWFjcm9OYW1lOiBzdHJpbmcgPSBcIk1hY3JvXCI7XG5cblx0c3RhdGljIGZyYWdtZW50OiBzdHJpbmcgPSBcInNhcC5mZS5tYWNyb3MuTWFjcm9cIjtcblxuXHRzdGF0aWMgaGFzVmFsaWRhdGlvbjogYm9vbGVhbiA9IHRydWU7XG5cblx0c3RhdGljIGluc3RhbmNlTWFwOiBXZWFrTWFwPG9iamVjdCwgb2JqZWN0W10+ID0gbmV3IFdlYWtNYXA8b2JqZWN0LCBvYmplY3RbXT4oKTtcblxuXHRwcm90ZWN0ZWQgc3RhdGljIGlzRGVwZW5kZW50Qm91bmQgPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3RvcihtU2V0dGluZ3M/OiBQcm9wZXJ0aWVzT2Y8TWFjcm9BUEk+LCAuLi5vdGhlcnM6IGFueVtdKSB7XG5cdFx0c3VwZXIobVNldHRpbmdzIGFzIGFueSwgLi4ub3RoZXJzKTtcblx0XHRNYWNyb0FQSS5yZWdpc3Rlckluc3RhbmNlKHRoaXMpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHRzdXBlci5pbml0KCk7XG5cdFx0aWYgKCF0aGlzLmdldE1vZGVsKFwiX3BhZ2VNb2RlbFwiKSkge1xuXHRcdFx0Y29uc3Qgb1BhZ2VNb2RlbCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzKT8uZ2V0TW9kZWwoXCJfcGFnZU1vZGVsXCIpO1xuXHRcdFx0aWYgKG9QYWdlTW9kZWwpIHtcblx0XHRcdFx0dGhpcy5zZXRNb2RlbChvUGFnZU1vZGVsLCBcIl9wYWdlTW9kZWxcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIHJlZ2lzdGVySW5zdGFuY2UoX2luc3RhbmNlOiBhbnkpIHtcblx0XHRpZiAoIXRoaXMuaW5zdGFuY2VNYXAuZ2V0KF9pbnN0YW5jZS5jb25zdHJ1Y3RvcikpIHtcblx0XHRcdHRoaXMuaW5zdGFuY2VNYXAuc2V0KF9pbnN0YW5jZS5jb25zdHJ1Y3RvciwgW10pO1xuXHRcdH1cblx0XHQodGhpcy5pbnN0YW5jZU1hcC5nZXQoX2luc3RhbmNlLmNvbnN0cnVjdG9yKSBhcyBvYmplY3RbXSkucHVzaChfaW5zdGFuY2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHBhdGggb2YgdGhlIGNvbnRleHQgdXNlZCBpbiB0aGUgY3VycmVudCBwYWdlIG9yIGJsb2NrLlxuXHQgKiBUaGlzIHNldHRpbmcgaXMgZGVmaW5lZCBieSB0aGUgZnJhbWV3b3JrLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGNvbnRleHRQYXRoITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IGZhbHNlLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Y29udGVudCE6IENvbnRyb2w7XG5cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBNYWNyb0FQSSkge1xuXHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLmNvbnRlbnQpO1xuXHR9XG5cblx0cmVyZW5kZXIoKSB7XG5cdFx0dGhpcy5jb250ZW50LnJlcmVuZGVyKCk7XG5cdH1cblxuXHRnZXREb21SZWYoKSB7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0cmV0dXJuIG9Db250ZW50ID8gb0NvbnRlbnQuZ2V0RG9tUmVmKCkgOiBzdXBlci5nZXREb21SZWYoKTtcblx0fVxuXG5cdGdldENvbnRyb2xsZXIoKTogYW55IHtcblx0XHRyZXR1cm4gKHRoaXMuZ2V0TW9kZWwoXCIkdmlld1wiKSBhcyBhbnkpLmdldE9iamVjdCgpLmdldENvbnRyb2xsZXIoKTtcblx0fVxuXG5cdHN0YXRpYyBnZXRBUEkob0V2ZW50OiBVSTVFdmVudCk6IE1hY3JvQVBJIHwgZmFsc2Uge1xuXHRcdGxldCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIE1hbmFnZWRPYmplY3QgfCBudWxsO1xuXHRcdGlmICh0aGlzLmlzRGVwZW5kZW50Qm91bmQpIHtcblx0XHRcdHdoaWxlIChvU291cmNlICYmICFvU291cmNlLmlzQTxNYWNyb0FQST4oTWFjcm9BUElGUU4pICYmIG9Tb3VyY2UuZ2V0UGFyZW50KSB7XG5cdFx0XHRcdGNvbnN0IG9EZXBlbmRlbnRzID0gKG9Tb3VyY2UgYXMgQ29udHJvbCkuZ2V0RGVwZW5kZW50cygpO1xuXHRcdFx0XHRjb25zdCBoYXNDb3JyZWN0RGVwZW5kZW50ID0gb0RlcGVuZGVudHMuZmluZCgob0RlcGVuZGVudDogVUk1RWxlbWVudCkgPT4gb0RlcGVuZGVudC5pc0EoTWFjcm9BUElGUU4pKTtcblx0XHRcdFx0aWYgKGhhc0NvcnJlY3REZXBlbmRlbnQpIHtcblx0XHRcdFx0XHRvU291cmNlID0gaGFzQ29ycmVjdERlcGVuZGVudCBhcyBNYWNyb0FQSTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvU291cmNlID0gb1NvdXJjZS5nZXRQYXJlbnQoKSBhcyBNYWNyb0FQSTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aGlsZSAob1NvdXJjZSAmJiAhb1NvdXJjZS5pc0E8TWFjcm9BUEk+KE1hY3JvQVBJRlFOKSAmJiBvU291cmNlLmdldFBhcmVudCkge1xuXHRcdFx0XHRvU291cmNlID0gb1NvdXJjZS5nZXRQYXJlbnQoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIW9Tb3VyY2UgfHwgIW9Tb3VyY2UuaXNBPE1hY3JvQVBJPihNYWNyb0FQSUZRTikpIHtcblx0XHRcdGNvbnN0IG9Tb3VyY2VNYXAgPSB0aGlzLmluc3RhbmNlTWFwLmdldCh0aGlzKSBhcyBNYWNyb0FQSVtdO1xuXHRcdFx0b1NvdXJjZSA9IG9Tb3VyY2VNYXA/LltvU291cmNlTWFwLmxlbmd0aCAtIDFdO1xuXHRcdH1cblx0XHRyZXR1cm4gb1NvdXJjZSAmJiBvU291cmNlLmlzQTxNYWNyb0FQST4oTWFjcm9BUElGUU4pICYmIG9Tb3VyY2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgYSBDb252ZXJ0ZXIgQ29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhTW9kZWxQYXRoXG5cdCAqIEBwYXJhbSBjb250ZXh0UGF0aFxuXHQgKiBAcGFyYW0gbVNldHRpbmdzXG5cdCAqIEByZXR1cm5zIEEgQ29udmVydGVyIENvbnRleHRcblx0ICovXG5cdHN0YXRpYyBnZXRDb252ZXJ0ZXJDb250ZXh0ID0gZnVuY3Rpb24gKG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBjb250ZXh0UGF0aDogc3RyaW5nLCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBtU2V0dGluZ3MuYXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IHZpZXdEYXRhID0gbVNldHRpbmdzLm1vZGVscy52aWV3RGF0YSAmJiBtU2V0dGluZ3MubW9kZWxzLnZpZXdEYXRhLmdldERhdGEoKTtcblx0XHRyZXR1cm4gQ29udmVydGVyQ29udGV4dC5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oXG5cdFx0XHRvRGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lLFxuXHRcdFx0bVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsXG5cdFx0XHRvQXBwQ29tcG9uZW50ICYmIG9BcHBDb21wb25lbnQuZ2V0RGlhZ25vc3RpY3MoKSxcblx0XHRcdG1lcmdlLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdFx0dmlld0RhdGFcblx0XHQpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBCaW5kaW5nIENvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YVxuXHQgKiBAcGFyYW0gbVNldHRpbmdzXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICovXG5cdHN0YXRpYyBjcmVhdGVCaW5kaW5nQ29udGV4dCA9IGZ1bmN0aW9uIChvRGF0YTogb2JqZWN0LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IGAvdWlkLS0ke3VpZCgpfWA7XG5cdFx0bVNldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KHNDb250ZXh0UGF0aCwgb0RhdGEpO1xuXHRcdHJldHVybiBtU2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuY3JlYXRlQmluZGluZ0NvbnRleHQoc0NvbnRleHRQYXRoKTtcblx0fTtcblxuXHRwYXJlbnRDb250ZXh0VG9CaW5kOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cblx0LyoqXG5cdCAqIEtlZXAgdHJhY2sgb2YgYSBiaW5kaW5nIGNvbnRleHQgdGhhdCBzaG91bGQgYmUgYXNzaWduZWQgdG8gdGhlIHBhcmVudCBvZiB0aGF0IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBtb2RlbE5hbWUgVGhlIG1vZGVsIG5hbWUgdGhhdCB0aGUgY29udGV4dCB3aWxsIHJlbGF0ZSB0b1xuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBvZiB0aGUgYmluZGluZyBjb250ZXh0XG5cdCAqL1xuXHRzZXRQYXJlbnRCaW5kaW5nQ29udGV4dChtb2RlbE5hbWU6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG5cdFx0dGhpcy5wYXJlbnRDb250ZXh0VG9CaW5kW21vZGVsTmFtZV0gPSBwYXRoO1xuXHR9XG5cblx0c2V0UGFyZW50KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdXBlci5zZXRQYXJlbnQoLi4uYXJncyk7XG5cdFx0T2JqZWN0LmtleXModGhpcy5wYXJlbnRDb250ZXh0VG9CaW5kKS5mb3JFYWNoKChtb2RlbE5hbWUpID0+IHtcblx0XHRcdHRoaXMuZ2V0UGFyZW50KCkhLmJpbmRPYmplY3Qoe1xuXHRcdFx0XHRwYXRoOiB0aGlzLnBhcmVudENvbnRleHRUb0JpbmRbbW9kZWxOYW1lXSxcblx0XHRcdFx0bW9kZWw6IG1vZGVsTmFtZSxcblx0XHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHRcdFx0Y2hhbmdlOiBmdW5jdGlvbiAodGhpczogQ2xpZW50Q29udGV4dEJpbmRpbmcpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Cb3VuZENvbnRleHQgPSB0aGlzLmdldEJvdW5kQ29udGV4dCgpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0XHRcdFx0aWYgKG9Cb3VuZENvbnRleHQgJiYgIW9Cb3VuZENvbnRleHQuZ2V0T2JqZWN0KCkpIHtcblx0XHRcdFx0XHRcdFx0b0JvdW5kQ29udGV4dC5zZXRQcm9wZXJ0eShcIlwiLCB7fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYWNyb0FQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JBLE1BQU1BLFdBQVcsR0FBRyx3QkFBd0I7O0VBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsSUFRTUMsUUFBUSxXQURiQyxjQUFjLENBQUNGLFdBQVcsQ0FBQyxVQUUxQkcsa0JBQWtCLENBQUMsMEJBQTBCLENBQUMsVUEyQzlDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCQyxXQUFXLENBQUM7SUFBRUQsSUFBSSxFQUFFLHFCQUFxQjtJQUFFRSxRQUFRLEVBQUUsS0FBSztJQUFFQyxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUM7SUFBQTtJQXZDL0Usa0JBQVlDLFNBQWtDLEVBQW9CO01BQUE7TUFBQSxrQ0FBZkMsTUFBTTtRQUFOQSxNQUFNO01BQUE7TUFDeEQsNEJBQU1ELFNBQVMsRUFBUyxHQUFHQyxNQUFNLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBLE1BcUhwQ0MsbUJBQW1CLEdBQTJCLENBQUMsQ0FBQztNQXBIL0NWLFFBQVEsQ0FBQ1csZ0JBQWdCLCtCQUFNO01BQUM7SUFDakM7SUFBQztJQUFBLE9BRURDLElBQUksR0FBSixnQkFBTztNQUNOLG1CQUFNQSxJQUFJO01BQ1YsSUFBSSxDQUFDLElBQUksQ0FBQ0MsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQUE7UUFDakMsTUFBTUMsVUFBVSw0QkFBR0MsU0FBUyxDQUFDQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsMERBQXBDLHNCQUFzQ0gsUUFBUSxDQUFDLFlBQVksQ0FBQztRQUMvRSxJQUFJQyxVQUFVLEVBQUU7VUFDZixJQUFJLENBQUNHLFFBQVEsQ0FBQ0gsVUFBVSxFQUFFLFlBQVksQ0FBQztRQUN4QztNQUNEO0lBQ0QsQ0FBQztJQUFBLFNBRU1ILGdCQUFnQixHQUF2QiwwQkFBd0JPLFNBQWMsRUFBRTtNQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDQyxXQUFXLENBQUNDLEdBQUcsQ0FBQ0YsU0FBUyxDQUFDRyxXQUFXLENBQUMsRUFBRTtRQUNqRCxJQUFJLENBQUNGLFdBQVcsQ0FBQ0csR0FBRyxDQUFDSixTQUFTLENBQUNHLFdBQVcsRUFBRSxFQUFFLENBQUM7TUFDaEQ7TUFDQyxJQUFJLENBQUNGLFdBQVcsQ0FBQ0MsR0FBRyxDQUFDRixTQUFTLENBQUNHLFdBQVcsQ0FBQyxDQUFjRSxJQUFJLENBQUNMLFNBQVMsQ0FBQztJQUMxRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLFNBb0JPTSxNQUFNLEdBQWIsZ0JBQWNDLEdBQWtCLEVBQUVDLFFBQWtCLEVBQUU7TUFDckRELEdBQUcsQ0FBQ0UsYUFBYSxDQUFDRCxRQUFRLENBQUNFLE9BQU8sQ0FBQztJQUNwQyxDQUFDO0lBQUEsT0FFREMsUUFBUSxHQUFSLG9CQUFXO01BQ1YsSUFBSSxDQUFDRCxPQUFPLENBQUNDLFFBQVEsRUFBRTtJQUN4QixDQUFDO0lBQUEsT0FFREMsU0FBUyxHQUFULHFCQUFZO01BQ1gsTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0gsT0FBTztNQUM3QixPQUFPRyxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0QsU0FBUyxFQUFFLHNCQUFTQSxTQUFTLFdBQUU7SUFDM0QsQ0FBQztJQUFBLE9BRURFLGFBQWEsR0FBYix5QkFBcUI7TUFDcEIsT0FBUSxJQUFJLENBQUNuQixRQUFRLENBQUMsT0FBTyxDQUFDLENBQVNvQixTQUFTLEVBQUUsQ0FBQ0QsYUFBYSxFQUFFO0lBQ25FLENBQUM7SUFBQSxTQUVNRSxNQUFNLEdBQWIsZ0JBQWNDLE1BQWdCLEVBQW9CO01BQ2pELElBQUlDLE9BQU8sR0FBR0QsTUFBTSxDQUFDRSxTQUFTLEVBQTBCO01BQ3hELElBQUksSUFBSSxDQUFDQyxnQkFBZ0IsRUFBRTtRQUMxQixPQUFPRixPQUFPLElBQUksQ0FBQ0EsT0FBTyxDQUFDRyxHQUFHLENBQVd4QyxXQUFXLENBQUMsSUFBSXFDLE9BQU8sQ0FBQ0ksU0FBUyxFQUFFO1VBQzNFLE1BQU1DLFdBQVcsR0FBSUwsT0FBTyxDQUFhTSxhQUFhLEVBQUU7VUFDeEQsTUFBTUMsbUJBQW1CLEdBQUdGLFdBQVcsQ0FBQ0csSUFBSSxDQUFFQyxVQUFzQixJQUFLQSxVQUFVLENBQUNOLEdBQUcsQ0FBQ3hDLFdBQVcsQ0FBQyxDQUFDO1VBQ3JHLElBQUk0QyxtQkFBbUIsRUFBRTtZQUN4QlAsT0FBTyxHQUFHTyxtQkFBK0I7VUFDMUMsQ0FBQyxNQUFNO1lBQ05QLE9BQU8sR0FBR0EsT0FBTyxDQUFDSSxTQUFTLEVBQWM7VUFDMUM7UUFDRDtNQUNELENBQUMsTUFBTTtRQUNOLE9BQU9KLE9BQU8sSUFBSSxDQUFDQSxPQUFPLENBQUNHLEdBQUcsQ0FBV3hDLFdBQVcsQ0FBQyxJQUFJcUMsT0FBTyxDQUFDSSxTQUFTLEVBQUU7VUFDM0VKLE9BQU8sR0FBR0EsT0FBTyxDQUFDSSxTQUFTLEVBQUU7UUFDOUI7TUFDRDtNQUVBLElBQUksQ0FBQ0osT0FBTyxJQUFJLENBQUNBLE9BQU8sQ0FBQ0csR0FBRyxDQUFXeEMsV0FBVyxDQUFDLEVBQUU7UUFDcEQsTUFBTStDLFVBQVUsR0FBRyxJQUFJLENBQUMzQixXQUFXLENBQUNDLEdBQUcsQ0FBQyxJQUFJLENBQWU7UUFDM0RnQixPQUFPLEdBQUdVLFVBQVUsYUFBVkEsVUFBVSx1QkFBVkEsVUFBVSxDQUFHQSxVQUFVLENBQUNDLE1BQU0sR0FBRyxDQUFDLENBQUM7TUFDOUM7TUFDQSxPQUFPWCxPQUFPLElBQUlBLE9BQU8sQ0FBQ0csR0FBRyxDQUFXeEMsV0FBVyxDQUFDLElBQUlxQyxPQUFPO0lBQ2hFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQW9DQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFMQyxPQU1BWSx1QkFBdUIsR0FBdkIsaUNBQXdCQyxTQUFpQixFQUFFQyxJQUFZLEVBQUU7TUFDeEQsSUFBSSxDQUFDeEMsbUJBQW1CLENBQUN1QyxTQUFTLENBQUMsR0FBR0MsSUFBSTtJQUMzQyxDQUFDO0lBQUEsT0FFREMsU0FBUyxHQUFULHFCQUEwQjtNQUFBLG1DQUFiQyxJQUFJO1FBQUpBLElBQUk7TUFBQTtNQUNoQjtNQUNBO01BQ0EsbUJBQU1ELFNBQVMsWUFBQyxHQUFHQyxJQUFJO01BQ3ZCQyxNQUFNLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUM1QyxtQkFBbUIsQ0FBQyxDQUFDNkMsT0FBTyxDQUFFTixTQUFTLElBQUs7UUFDNUQsSUFBSSxDQUFDVCxTQUFTLEVBQUUsQ0FBRWdCLFVBQVUsQ0FBQztVQUM1Qk4sSUFBSSxFQUFFLElBQUksQ0FBQ3hDLG1CQUFtQixDQUFDdUMsU0FBUyxDQUFDO1VBQ3pDUSxLQUFLLEVBQUVSLFNBQVM7VUFDaEJTLE1BQU0sRUFBRTtZQUNQQyxNQUFNLEVBQUUsWUFBc0M7Y0FDN0MsTUFBTUMsYUFBYSxHQUFHLElBQUksQ0FBQ0MsZUFBZSxFQUEwQjtjQUNwRSxJQUFJRCxhQUFhLElBQUksQ0FBQ0EsYUFBYSxDQUFDM0IsU0FBUyxFQUFFLEVBQUU7Z0JBQ2hEMkIsYUFBYSxDQUFDRSxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2NBQ2xDO1lBQ0Q7VUFDRDtRQUNELENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNILENBQUM7SUFBQTtFQUFBLEVBcEtxQkMsT0FBTyxXQUl0QkMsU0FBUyxHQUFXLGVBQWUsVUFFbkNDLFNBQVMsR0FBVyxPQUFPLFVBRTNCQyxRQUFRLEdBQVcscUJBQXFCLFVBRXhDQyxhQUFhLEdBQVksSUFBSSxVQUU3QmhELFdBQVcsR0FBOEIsSUFBSWlELE9BQU8sRUFBb0IsVUFFOUQ5QixnQkFBZ0IsR0FBRyxLQUFLLFVBOEZsQytCLG1CQUFtQixHQUFHLFVBQVVDLGNBQW1DLEVBQUVDLFdBQW1CLEVBQUUvRCxTQUFjLEVBQUU7SUFDaEgsTUFBTWdFLGFBQWEsR0FBR2hFLFNBQVMsQ0FBQ2lFLFlBQVk7SUFDNUMsTUFBTUMsUUFBUSxHQUFHbEUsU0FBUyxDQUFDbUUsTUFBTSxDQUFDRCxRQUFRLElBQUlsRSxTQUFTLENBQUNtRSxNQUFNLENBQUNELFFBQVEsQ0FBQ0UsT0FBTyxFQUFFO0lBQ2pGLE9BQU9DLGdCQUFnQixDQUFDQyw4QkFBOEIsQ0FDckRSLGNBQWMsQ0FBQ1MsaUJBQWlCLENBQUNDLElBQUksRUFDckN4RSxTQUFTLENBQUNtRSxNQUFNLENBQUNNLFNBQVMsRUFDMUJULGFBQWEsSUFBSUEsYUFBYSxDQUFDVSxjQUFjLEVBQUUsRUFDL0NDLEtBQUssRUFDTGIsY0FBYyxDQUFDYyxlQUFlLEVBQzlCVixRQUFRLENBQ1I7RUFDRixDQUFDLFVBU01XLG9CQUFvQixHQUFHLFVBQVVDLEtBQWEsRUFBRTlFLFNBQWMsRUFBRTtJQUN0RSxNQUFNK0UsWUFBWSxHQUFJLFNBQVFDLEdBQUcsRUFBRyxFQUFDO0lBQ3JDaEYsU0FBUyxDQUFDbUUsTUFBTSxDQUFDYyxnQkFBZ0IsQ0FBQzNCLFdBQVcsQ0FBQ3lCLFlBQVksRUFBRUQsS0FBSyxDQUFDO0lBQ2xFLE9BQU85RSxTQUFTLENBQUNtRSxNQUFNLENBQUNjLGdCQUFnQixDQUFDSixvQkFBb0IsQ0FBQ0UsWUFBWSxDQUFDO0VBQzVFLENBQUM7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BbElpRCxJQUFJO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BcUt4Q3ZGLFFBQVE7QUFBQSJ9