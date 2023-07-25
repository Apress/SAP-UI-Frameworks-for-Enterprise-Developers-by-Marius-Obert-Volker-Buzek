/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/ObjectPath", "sap/base/util/UriParameters", "sap/fe/core/helpers/ClassSupport", "sap/fe/placeholder/library", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/Placeholder"], function (ObjectPath, UriParameters, ClassSupport, _library, Core, ControllerExtension, Placeholder) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension} for Placeholder
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.Placeholder
   */
  let PlaceholderControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Placeholder"), _dec2 = publicExtension(), _dec3 = publicExtension(), _dec4 = publicExtension(), _dec5 = publicExtension(), _dec6 = publicExtension(), _dec7 = publicExtension(), _dec8 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(PlaceholderControllerExtension, _ControllerExtension);
    function PlaceholderControllerExtension() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = PlaceholderControllerExtension.prototype;
    _proto.attachHideCallback = function attachHideCallback() {
      if (this.isPlaceholderEnabled()) {
        const oView = this.base.getView();
        const oPage = oView.getParent() && oView.getParent().oContainer;
        const oNavContainer = oPage && oPage.getParent();
        if (!oNavContainer) {
          return;
        }
        const _fnContainerDelegate = {
          onAfterShow: function (oEvent) {
            if (oEvent.isBackToPage) {
              oNavContainer.hidePlaceholder();
            } else if (UriParameters.fromQuery(window.location.hash.replace(/#.*\?/, "")).get("restoreHistory") === "true") {
              // in case we navigate to the listreport using the shell
              oNavContainer.hidePlaceholder();
            }
          }
        };
        oPage.addEventDelegate(_fnContainerDelegate);
        const oPageReady = oView.getController().pageReady;
        //In case of objectPage, the placeholder should be hidden when heroes requests are received
        // But for some scenario like "Create item", heroes requests are not sent .
        // The pageReady event is then used as fallback

        const aAttachEvents = ["pageReady"];
        if (oView.getControllerName() === "sap.fe.templates.ObjectPage.ObjectPageController") {
          aAttachEvents.push("heroesBatchReceived");
        }
        aAttachEvents.forEach(function (sEvent) {
          oPageReady.attachEvent(sEvent, null, function () {
            oNavContainer.hidePlaceholder();
          }, null);
        });
      }
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this._init();
    };
    _proto._init = function _init() {
      this.oAppComponent = this.base.getAppComponent();
      this.oRootContainer = this.oAppComponent.getRootContainer();
      this.oPlaceholders = {};

      // eslint-disable-next-line no-constant-condition
      if (this.isPlaceholderEnabled()) {
        Placeholder.registerProvider(function (oConfig) {
          switch (oConfig.name) {
            case "sap.fe.templates.ListReport":
              return {
                html: "sap/fe/placeholder/view/PlaceholderLR.fragment.html",
                autoClose: false
              };
            case "sap.fe.templates.ObjectPage":
              return {
                html: "sap/fe/placeholder/view/PlaceholderOP.fragment.html",
                autoClose: false
              };
            default:
          }
        });
      }
      if (this.isPlaceholderDebugEnabled()) {
        this.initPlaceholderDebug();
      }
    };
    _proto.initPlaceholderDebug = function initPlaceholderDebug() {
      this.resetPlaceholderDebugStats();
      const handler = {
        apply: target => {
          if (this.oRootContainer._placeholder && this.oRootContainer._placeholder.placeholder) {
            this.debugStats.iHidePlaceholderTimestamp = Date.now();
          }
          return target.bind(this.oRootContainer)();
        }
      };
      // eslint-disable-next-line no-undef
      const proxy1 = new Proxy(this.oRootContainer.hidePlaceholder, handler);
      this.oRootContainer.hidePlaceholder = proxy1;
    };
    _proto.isPlaceholderDebugEnabled = function isPlaceholderDebugEnabled() {
      if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-placeholder-debug") === "true") {
        return true;
      }
      return false;
    };
    _proto.resetPlaceholderDebugStats = function resetPlaceholderDebugStats() {
      this.debugStats = {
        iHidePlaceholderTimestamp: 0,
        iPageReadyEventTimestamp: 0,
        iHeroesBatchReceivedEventTimestamp: 0
      };
    };
    _proto.getPlaceholderDebugStats = function getPlaceholderDebugStats() {
      return this.debugStats;
    };
    _proto.isPlaceholderEnabled = function isPlaceholderEnabled() {
      const bPlaceholderEnabledInFLP = ObjectPath.get("sap-ushell-config.apps.placeholder.enabled");
      if (bPlaceholderEnabledInFLP === false) {
        return false;
      }
      return Core.getConfiguration().getPlaceholder();
    };
    return PlaceholderControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "attachHideCallback", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "attachHideCallback"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachRouteMatchers", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "attachRouteMatchers"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "initPlaceholderDebug", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "initPlaceholderDebug"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isPlaceholderDebugEnabled", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "isPlaceholderDebugEnabled"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "resetPlaceholderDebugStats", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "resetPlaceholderDebugStats"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getPlaceholderDebugStats", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "getPlaceholderDebugStats"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isPlaceholderEnabled", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "isPlaceholderEnabled"), _class2.prototype)), _class2)) || _class);
  return PlaceholderControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQbGFjZWhvbGRlckNvbnRyb2xsZXJFeHRlbnNpb24iLCJkZWZpbmVVSTVDbGFzcyIsInB1YmxpY0V4dGVuc2lvbiIsImF0dGFjaEhpZGVDYWxsYmFjayIsImlzUGxhY2Vob2xkZXJFbmFibGVkIiwib1ZpZXciLCJiYXNlIiwiZ2V0VmlldyIsIm9QYWdlIiwiZ2V0UGFyZW50Iiwib0NvbnRhaW5lciIsIm9OYXZDb250YWluZXIiLCJfZm5Db250YWluZXJEZWxlZ2F0ZSIsIm9uQWZ0ZXJTaG93Iiwib0V2ZW50IiwiaXNCYWNrVG9QYWdlIiwiaGlkZVBsYWNlaG9sZGVyIiwiVXJpUGFyYW1ldGVycyIsImZyb21RdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsInJlcGxhY2UiLCJnZXQiLCJhZGRFdmVudERlbGVnYXRlIiwib1BhZ2VSZWFkeSIsImdldENvbnRyb2xsZXIiLCJwYWdlUmVhZHkiLCJhQXR0YWNoRXZlbnRzIiwiZ2V0Q29udHJvbGxlck5hbWUiLCJwdXNoIiwiZm9yRWFjaCIsInNFdmVudCIsImF0dGFjaEV2ZW50IiwiYXR0YWNoUm91dGVNYXRjaGVycyIsIl9pbml0Iiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9Sb290Q29udGFpbmVyIiwiZ2V0Um9vdENvbnRhaW5lciIsIm9QbGFjZWhvbGRlcnMiLCJQbGFjZWhvbGRlciIsInJlZ2lzdGVyUHJvdmlkZXIiLCJvQ29uZmlnIiwibmFtZSIsImh0bWwiLCJhdXRvQ2xvc2UiLCJpc1BsYWNlaG9sZGVyRGVidWdFbmFibGVkIiwiaW5pdFBsYWNlaG9sZGVyRGVidWciLCJyZXNldFBsYWNlaG9sZGVyRGVidWdTdGF0cyIsImhhbmRsZXIiLCJhcHBseSIsInRhcmdldCIsIl9wbGFjZWhvbGRlciIsInBsYWNlaG9sZGVyIiwiZGVidWdTdGF0cyIsImlIaWRlUGxhY2Vob2xkZXJUaW1lc3RhbXAiLCJEYXRlIiwibm93IiwiYmluZCIsInByb3h5MSIsIlByb3h5Iiwic2VhcmNoIiwiaVBhZ2VSZWFkeUV2ZW50VGltZXN0YW1wIiwiaUhlcm9lc0JhdGNoUmVjZWl2ZWRFdmVudFRpbWVzdGFtcCIsImdldFBsYWNlaG9sZGVyRGVidWdTdGF0cyIsImJQbGFjZWhvbGRlckVuYWJsZWRJbkZMUCIsIk9iamVjdFBhdGgiLCJDb3JlIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldFBsYWNlaG9sZGVyIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUGxhY2Vob2xkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9iamVjdFBhdGggZnJvbSBcInNhcC9iYXNlL3V0aWwvT2JqZWN0UGF0aFwiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IFwic2FwL2ZlL3BsYWNlaG9sZGVyL2xpYnJhcnlcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL3VpL2NvcmUvUGxhY2Vob2xkZXJcIjtcbi8qKlxuICoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5Db250cm9sbGVyRXh0ZW5zaW9uIENvbnRyb2xsZXIgZXh0ZW5zaW9ufSBmb3IgUGxhY2Vob2xkZXJcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGxhY2Vob2xkZXJcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGxhY2Vob2xkZXJcIilcbmNsYXNzIFBsYWNlaG9sZGVyQ29udHJvbGxlckV4dGVuc2lvbiBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcml2YXRlIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIG9BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0cHJpdmF0ZSBvUm9vdENvbnRhaW5lcjogYW55O1xuXG5cdHByaXZhdGUgb1BsYWNlaG9sZGVyczogYW55O1xuXG5cdHByaXZhdGUgZGVidWdTdGF0czogYW55O1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRwdWJsaWMgYXR0YWNoSGlkZUNhbGxiYWNrKCkge1xuXHRcdGlmICh0aGlzLmlzUGxhY2Vob2xkZXJFbmFibGVkKCkpIHtcblx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHRcdGNvbnN0IG9QYWdlID0gb1ZpZXcuZ2V0UGFyZW50KCkgJiYgKG9WaWV3LmdldFBhcmVudCgpIGFzIGFueSkub0NvbnRhaW5lcjtcblx0XHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSBvUGFnZSAmJiBvUGFnZS5nZXRQYXJlbnQoKTtcblxuXHRcdFx0aWYgKCFvTmF2Q29udGFpbmVyKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGNvbnN0IF9mbkNvbnRhaW5lckRlbGVnYXRlID0ge1xuXHRcdFx0XHRvbkFmdGVyU2hvdzogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0aWYgKG9FdmVudC5pc0JhY2tUb1BhZ2UpIHtcblx0XHRcdFx0XHRcdG9OYXZDb250YWluZXIuaGlkZVBsYWNlaG9sZGVyKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChVcmlQYXJhbWV0ZXJzLmZyb21RdWVyeSh3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKC8jLipcXD8vLCBcIlwiKSkuZ2V0KFwicmVzdG9yZUhpc3RvcnlcIikgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRcdFx0XHQvLyBpbiBjYXNlIHdlIG5hdmlnYXRlIHRvIHRoZSBsaXN0cmVwb3J0IHVzaW5nIHRoZSBzaGVsbFxuXHRcdFx0XHRcdFx0b05hdkNvbnRhaW5lci5oaWRlUGxhY2Vob2xkZXIoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRvUGFnZS5hZGRFdmVudERlbGVnYXRlKF9mbkNvbnRhaW5lckRlbGVnYXRlKTtcblxuXHRcdFx0Y29uc3Qgb1BhZ2VSZWFkeSA9IChvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLnBhZ2VSZWFkeTtcblx0XHRcdC8vSW4gY2FzZSBvZiBvYmplY3RQYWdlLCB0aGUgcGxhY2Vob2xkZXIgc2hvdWxkIGJlIGhpZGRlbiB3aGVuIGhlcm9lcyByZXF1ZXN0cyBhcmUgcmVjZWl2ZWRcblx0XHRcdC8vIEJ1dCBmb3Igc29tZSBzY2VuYXJpbyBsaWtlIFwiQ3JlYXRlIGl0ZW1cIiwgaGVyb2VzIHJlcXVlc3RzIGFyZSBub3Qgc2VudCAuXG5cdFx0XHQvLyBUaGUgcGFnZVJlYWR5IGV2ZW50IGlzIHRoZW4gdXNlZCBhcyBmYWxsYmFja1xuXG5cdFx0XHRjb25zdCBhQXR0YWNoRXZlbnRzID0gW1wicGFnZVJlYWR5XCJdO1xuXHRcdFx0aWYgKG9WaWV3LmdldENvbnRyb2xsZXJOYW1lKCkgPT09IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VDb250cm9sbGVyXCIpIHtcblx0XHRcdFx0YUF0dGFjaEV2ZW50cy5wdXNoKFwiaGVyb2VzQmF0Y2hSZWNlaXZlZFwiKTtcblx0XHRcdH1cblx0XHRcdGFBdHRhY2hFdmVudHMuZm9yRWFjaChmdW5jdGlvbiAoc0V2ZW50OiBzdHJpbmcpIHtcblx0XHRcdFx0b1BhZ2VSZWFkeS5hdHRhY2hFdmVudChcblx0XHRcdFx0XHRzRXZlbnQsXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRvTmF2Q29udGFpbmVyLmhpZGVQbGFjZWhvbGRlcigpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bnVsbFxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdGF0dGFjaFJvdXRlTWF0Y2hlcnMoKSB7XG5cdFx0dGhpcy5faW5pdCgpO1xuXHR9XG5cblx0X2luaXQoKSB7XG5cdFx0dGhpcy5vQXBwQ29tcG9uZW50ID0gdGhpcy5iYXNlLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdHRoaXMub1Jvb3RDb250YWluZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRhaW5lcigpO1xuXHRcdHRoaXMub1BsYWNlaG9sZGVycyA9IHt9O1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuXHRcdGlmICh0aGlzLmlzUGxhY2Vob2xkZXJFbmFibGVkKCkpIHtcblx0XHRcdFBsYWNlaG9sZGVyLnJlZ2lzdGVyUHJvdmlkZXIoZnVuY3Rpb24gKG9Db25maWc6IGFueSkge1xuXHRcdFx0XHRzd2l0Y2ggKG9Db25maWcubmFtZSkge1xuXHRcdFx0XHRcdGNhc2UgXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnRcIjpcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGh0bWw6IFwic2FwL2ZlL3BsYWNlaG9sZGVyL3ZpZXcvUGxhY2Vob2xkZXJMUi5mcmFnbWVudC5odG1sXCIsXG5cdFx0XHRcdFx0XHRcdGF1dG9DbG9zZTogZmFsc2Vcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y2FzZSBcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZVwiOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0aHRtbDogXCJzYXAvZmUvcGxhY2Vob2xkZXIvdmlldy9QbGFjZWhvbGRlck9QLmZyYWdtZW50Lmh0bWxcIixcblx0XHRcdFx0XHRcdFx0YXV0b0Nsb3NlOiBmYWxzZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuaXNQbGFjZWhvbGRlckRlYnVnRW5hYmxlZCgpKSB7XG5cdFx0XHR0aGlzLmluaXRQbGFjZWhvbGRlckRlYnVnKCk7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdGluaXRQbGFjZWhvbGRlckRlYnVnKCkge1xuXHRcdHRoaXMucmVzZXRQbGFjZWhvbGRlckRlYnVnU3RhdHMoKTtcblx0XHRjb25zdCBoYW5kbGVyID0ge1xuXHRcdFx0YXBwbHk6ICh0YXJnZXQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5vUm9vdENvbnRhaW5lci5fcGxhY2Vob2xkZXIgJiYgdGhpcy5vUm9vdENvbnRhaW5lci5fcGxhY2Vob2xkZXIucGxhY2Vob2xkZXIpIHtcblx0XHRcdFx0XHR0aGlzLmRlYnVnU3RhdHMuaUhpZGVQbGFjZWhvbGRlclRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRhcmdldC5iaW5kKHRoaXMub1Jvb3RDb250YWluZXIpKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcblx0XHRjb25zdCBwcm94eTEgPSBuZXcgUHJveHkodGhpcy5vUm9vdENvbnRhaW5lci5oaWRlUGxhY2Vob2xkZXIsIGhhbmRsZXIpO1xuXHRcdHRoaXMub1Jvb3RDb250YWluZXIuaGlkZVBsYWNlaG9sZGVyID0gcHJveHkxO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdGlzUGxhY2Vob2xkZXJEZWJ1Z0VuYWJsZWQoKSB7XG5cdFx0aWYgKFVyaVBhcmFtZXRlcnMuZnJvbVF1ZXJ5KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldChcInNhcC11aS14eC1wbGFjZWhvbGRlci1kZWJ1Z1wiKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0cmVzZXRQbGFjZWhvbGRlckRlYnVnU3RhdHMoKSB7XG5cdFx0dGhpcy5kZWJ1Z1N0YXRzID0ge1xuXHRcdFx0aUhpZGVQbGFjZWhvbGRlclRpbWVzdGFtcDogMCxcblx0XHRcdGlQYWdlUmVhZHlFdmVudFRpbWVzdGFtcDogMCxcblx0XHRcdGlIZXJvZXNCYXRjaFJlY2VpdmVkRXZlbnRUaW1lc3RhbXA6IDBcblx0XHR9O1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdGdldFBsYWNlaG9sZGVyRGVidWdTdGF0cygpIHtcblx0XHRyZXR1cm4gdGhpcy5kZWJ1Z1N0YXRzO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdGlzUGxhY2Vob2xkZXJFbmFibGVkKCkge1xuXHRcdGNvbnN0IGJQbGFjZWhvbGRlckVuYWJsZWRJbkZMUCA9IE9iamVjdFBhdGguZ2V0KFwic2FwLXVzaGVsbC1jb25maWcuYXBwcy5wbGFjZWhvbGRlci5lbmFibGVkXCIpO1xuXHRcdGlmIChiUGxhY2Vob2xkZXJFbmFibGVkSW5GTFAgPT09IGZhbHNlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIENvcmUuZ2V0Q29uZmlndXJhdGlvbigpLmdldFBsYWNlaG9sZGVyKCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhY2Vob2xkZXJDb250cm9sbGVyRXh0ZW5zaW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsSUFPTUEsOEJBQThCLFdBRG5D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