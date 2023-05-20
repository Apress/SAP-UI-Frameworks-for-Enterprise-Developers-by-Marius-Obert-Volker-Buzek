/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/macros/DelegateUtil", "sap/m/QuickViewPage"], function (CommonUtils, ClassSupport, KeepAliveHelper, DelegateUtil, QuickViewPage) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomQuickViewPage = (_dec = defineUI5Class("sap.fe.macros.controls.CustomQuickViewPage"), _dec2 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec3 = aggregation({
    type: "sap.m.QuickViewGroup",
    multiple: true,
    singularName: "group",
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_QuickViewPage) {
    _inheritsLoose(CustomQuickViewPage, _QuickViewPage);
    function CustomQuickViewPage() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _QuickViewPage.call(this, ...args) || this;
      _initializerDefineProperty(_this, "customContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groups", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = CustomQuickViewPage.prototype;
    _proto.onBeforeRendering = function onBeforeRendering(oEvent) {
      const parent = this.getParent();
      if (parent && parent.isA("sap.fe.macros.controls.ConditionalWrapper") && parent.getProperty("condition") === true) {
        this.setCrossAppNavCallback(() => {
          const sQuickViewPageTitleLinkHref = DelegateUtil.getCustomData(this, "titleLink");
          const oView = CommonUtils.getTargetView(this);
          const oAppComponent = CommonUtils.getAppComponent(oView);
          const oShellServiceHelper = oAppComponent.getShellServices();
          let oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkHref);
          const oNavArgs = {
            target: {
              semanticObject: oShellHash.semanticObject,
              action: oShellHash.action
            },
            params: oShellHash.params
          };
          const sQuickViewPageTitleLinkIntent = `${oNavArgs.target.semanticObject}-${oNavArgs.target.action}`;
          if (sQuickViewPageTitleLinkIntent && this.oCrossAppNavigator && this.oCrossAppNavigator.isNavigationSupported([sQuickViewPageTitleLinkIntent])) {
            if (sQuickViewPageTitleLinkIntent && sQuickViewPageTitleLinkIntent !== "") {
              if (typeof sQuickViewPageTitleLinkIntent === "string" && sQuickViewPageTitleLinkIntent !== "") {
                var _oLinkControl;
                let oLinkControl = this.getParent();
                while (oLinkControl && !oLinkControl.isA("sap.ui.mdc.Link")) {
                  oLinkControl = oLinkControl.getParent();
                }
                const sTargetHref = (_oLinkControl = oLinkControl) === null || _oLinkControl === void 0 ? void 0 : _oLinkControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
                if (sTargetHref) {
                  oShellHash = oShellServiceHelper.parseShellHash(sTargetHref);
                } else {
                  oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkIntent);
                  oShellHash.params = oNavArgs.params;
                }
                KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);
                return {
                  target: {
                    semanticObject: oShellHash.semanticObject,
                    action: oShellHash.action
                  },
                  params: oShellHash.params
                };
              }
            }
          } else {
            const oCurrentShellHash = oShellServiceHelper.parseShellHash(window.location.hash);
            KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oCurrentShellHash);
            return {
              target: {
                semanticObject: oCurrentShellHash.semanticObject,
                action: oCurrentShellHash.action,
                appSpecificRoute: oCurrentShellHash.appSpecificRoute
              },
              params: oCurrentShellHash.params
            };
          }
        });
      }
      _QuickViewPage.prototype.onBeforeRendering.call(this, oEvent);
      const oPageContent = this.getPageContent();
      const oForm = oPageContent.form;
      if (oForm) {
        const _aContent = this.customContent;
        if (_aContent && _aContent.length > 0) {
          _aContent.forEach(_oContent => {
            const _oContentClone = _oContent.clone();
            _oContentClone.setModel(this.getModel());
            _oContentClone.setBindingContext(this.getBindingContext());
            oForm.addContent(_oContentClone);
          });
          setTimeout(function () {
            oForm.rerender();
          }, 0);
        }
      }
    };
    return CustomQuickViewPage;
  }(QuickViewPage), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "groups", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return CustomQuickViewPage;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21RdWlja1ZpZXdQYWdlIiwiZGVmaW5lVUk1Q2xhc3MiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsImlzRGVmYXVsdCIsIm9uQmVmb3JlUmVuZGVyaW5nIiwib0V2ZW50IiwicGFyZW50IiwiZ2V0UGFyZW50IiwiaXNBIiwiZ2V0UHJvcGVydHkiLCJzZXRDcm9zc0FwcE5hdkNhbGxiYWNrIiwic1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtIcmVmIiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q3VzdG9tRGF0YSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9TaGVsbFNlcnZpY2VIZWxwZXIiLCJnZXRTaGVsbFNlcnZpY2VzIiwib1NoZWxsSGFzaCIsInBhcnNlU2hlbGxIYXNoIiwib05hdkFyZ3MiLCJ0YXJnZXQiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsInBhcmFtcyIsInNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSW50ZW50Iiwib0Nyb3NzQXBwTmF2aWdhdG9yIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwib0xpbmtDb250cm9sIiwic1RhcmdldEhyZWYiLCJnZXRNb2RlbCIsIktlZXBBbGl2ZUhlbHBlciIsInN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2giLCJvQ3VycmVudFNoZWxsSGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImFwcFNwZWNpZmljUm91dGUiLCJvUGFnZUNvbnRlbnQiLCJnZXRQYWdlQ29udGVudCIsIm9Gb3JtIiwiZm9ybSIsIl9hQ29udGVudCIsImN1c3RvbUNvbnRlbnQiLCJsZW5ndGgiLCJmb3JFYWNoIiwiX29Db250ZW50IiwiX29Db250ZW50Q2xvbmUiLCJjbG9uZSIsInNldE1vZGVsIiwic2V0QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImFkZENvbnRlbnQiLCJzZXRUaW1lb3V0IiwicmVyZW5kZXIiLCJRdWlja1ZpZXdQYWdlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDdXN0b21RdWlja1ZpZXdQYWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgUXVpY2tWaWV3UGFnZSBmcm9tIFwic2FwL20vUXVpY2tWaWV3UGFnZVwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgTGluayBmcm9tIFwic2FwL3VpL21kYy9MaW5rXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MuY29udHJvbHMuQ3VzdG9tUXVpY2tWaWV3UGFnZVwiKVxuY2xhc3MgQ3VzdG9tUXVpY2tWaWV3UGFnZSBleHRlbmRzIFF1aWNrVmlld1BhZ2Uge1xuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IHRydWUgfSlcblx0Y3VzdG9tQ29udGVudCE6IENvbnRyb2xbXTtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5tLlF1aWNrVmlld0dyb3VwXCIsIG11bHRpcGxlOiB0cnVlLCBzaW5ndWxhck5hbWU6IFwiZ3JvdXBcIiwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGdyb3VwcyE6IENvbnRyb2xbXTtcblxuXHRvbkJlZm9yZVJlbmRlcmluZyhvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KCk7XG5cdFx0aWYgKHBhcmVudCAmJiBwYXJlbnQuaXNBKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5Db25kaXRpb25hbFdyYXBwZXJcIikgJiYgcGFyZW50LmdldFByb3BlcnR5KFwiY29uZGl0aW9uXCIpID09PSB0cnVlKSB7XG5cdFx0XHR0aGlzLnNldENyb3NzQXBwTmF2Q2FsbGJhY2soKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0hyZWYgPSAoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEgYXMgYW55KSh0aGlzLCBcInRpdGxlTGlua1wiKTtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMpO1xuXHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0XHRcdFx0Y29uc3Qgb1NoZWxsU2VydmljZUhlbHBlciA9IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdFx0XHRsZXQgb1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtIcmVmKTtcblx0XHRcdFx0Y29uc3Qgb05hdkFyZ3MgPSB7XG5cdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHBhcmFtczogb1NoZWxsSGFzaC5wYXJhbXNcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29uc3Qgc1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtJbnRlbnQgPSBgJHtvTmF2QXJncy50YXJnZXQuc2VtYW50aWNPYmplY3R9LSR7b05hdkFyZ3MudGFyZ2V0LmFjdGlvbn1gO1xuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAmJlxuXHRcdFx0XHRcdHRoaXMub0Nyb3NzQXBwTmF2aWdhdG9yICYmXG5cdFx0XHRcdFx0dGhpcy5vQ3Jvc3NBcHBOYXZpZ2F0b3IuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKFtzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudF0pXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGlmIChzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAmJiBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCA9PT0gXCJzdHJpbmdcIiAmJiBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0XHRsZXQgb0xpbmtDb250cm9sID0gdGhpcy5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRcdFx0d2hpbGUgKG9MaW5rQ29udHJvbCAmJiAhb0xpbmtDb250cm9sLmlzQTxMaW5rPihcInNhcC51aS5tZGMuTGlua1wiKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9MaW5rQ29udHJvbCA9IG9MaW5rQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjb25zdCBzVGFyZ2V0SHJlZjogc3RyaW5nID0gb0xpbmtDb250cm9sPy5nZXRNb2RlbChcIiRzYXB1aW1kY0xpbmtcIikuZ2V0UHJvcGVydHkoXCIvdGl0bGVMaW5rSHJlZlwiKTtcblx0XHRcdFx0XHRcdFx0aWYgKHNUYXJnZXRIcmVmKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc1RhcmdldEhyZWYpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG9TaGVsbEhhc2ggPSBvU2hlbGxTZXJ2aWNlSGVscGVyLnBhcnNlU2hlbGxIYXNoKHNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSW50ZW50KTtcblx0XHRcdFx0XHRcdFx0XHRvU2hlbGxIYXNoLnBhcmFtcyA9IG9OYXZBcmdzLnBhcmFtcztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRLZWVwQWxpdmVIZWxwZXIuc3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaChvVmlldywgb1NoZWxsSGFzaCk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtczogb1NoZWxsSGFzaC5wYXJhbXNcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0N1cnJlbnRTaGVsbEhhc2ggPSBvU2hlbGxTZXJ2aWNlSGVscGVyLnBhcnNlU2hlbGxIYXNoKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcblx0XHRcdFx0XHRLZWVwQWxpdmVIZWxwZXIuc3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaChvVmlldywgb0N1cnJlbnRTaGVsbEhhc2gpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb0N1cnJlbnRTaGVsbEhhc2guc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogb0N1cnJlbnRTaGVsbEhhc2guYWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRhcHBTcGVjaWZpY1JvdXRlOiBvQ3VycmVudFNoZWxsSGFzaC5hcHBTcGVjaWZpY1JvdXRlXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cGFyYW1zOiBvQ3VycmVudFNoZWxsSGFzaC5wYXJhbXNcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0c3VwZXIub25CZWZvcmVSZW5kZXJpbmcob0V2ZW50KTtcblx0XHRjb25zdCBvUGFnZUNvbnRlbnQgPSB0aGlzLmdldFBhZ2VDb250ZW50KCk7XG5cdFx0Y29uc3Qgb0Zvcm0gPSBvUGFnZUNvbnRlbnQuZm9ybTtcblx0XHRpZiAob0Zvcm0pIHtcblx0XHRcdGNvbnN0IF9hQ29udGVudCA9IHRoaXMuY3VzdG9tQ29udGVudDtcblx0XHRcdGlmIChfYUNvbnRlbnQgJiYgX2FDb250ZW50Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0X2FDb250ZW50LmZvckVhY2goKF9vQ29udGVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgX29Db250ZW50Q2xvbmUgPSBfb0NvbnRlbnQuY2xvbmUoKTtcblx0XHRcdFx0XHRfb0NvbnRlbnRDbG9uZS5zZXRNb2RlbCh0aGlzLmdldE1vZGVsKCkpO1xuXHRcdFx0XHRcdF9vQ29udGVudENsb25lLnNldEJpbmRpbmdDb250ZXh0KHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKSk7XG5cdFx0XHRcdFx0b0Zvcm0uYWRkQ29udGVudChfb0NvbnRlbnRDbG9uZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRvRm9ybS5yZXJlbmRlcigpO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuaW50ZXJmYWNlIEN1c3RvbVF1aWNrVmlld1BhZ2Uge1xuXHQvLyBQcml2YXRlIGluIFVJNVxuXHRvQ3Jvc3NBcHBOYXZpZ2F0b3I6IGFueTtcblxuXHQvLyBQcml2YXRlIGluIFVJNVxuXHRnZXRQYWdl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