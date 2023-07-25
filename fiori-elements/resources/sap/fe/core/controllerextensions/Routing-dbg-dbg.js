/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (ClassSupport, ModelHelper, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * A controller extension offering hooks into the routing flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  let Routing = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Routing"), _dec2 = publicExtension(), _dec3 = extensible(OverrideExecution.After), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(Routing, _ControllerExtension);
    function Routing() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = Routing.prototype;
    /**
     * @private
     * @name sap.fe.core.controllerextensions.Routing.getMetadata
     * @function
     */
    /**
     * @private
     * @name sap.fe.core.controllerextensions.Routing.extend
     * @function
     */
    /**
     * This function can be used to intercept the routing event happening during the normal process of navigating from one page to another.
     *
     * If declared as an extension, it allows you to intercept and change the normal navigation flow.
     * If you decide to do your own navigation processing, you can return `true` to prevent the default routing behavior.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mNavigationParameters Object containing row context and page context
     * @param mNavigationParameters.bindingContext The currently selected context
     * @returns `true` to prevent the default execution, false to keep the standard behavior
     * @alias sap.fe.core.controllerextensions.Routing#onBeforeNavigation
     * @public
     * @since 1.86.0
     */
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeNavigation = function onBeforeNavigation(mNavigationParameters) {
      // to be overriden by the application
      return false;
    }

    /**
     * Allows navigation to a specific context.
     *
     * @param oContext Object containing the context to be navigated to
     * @alias sap.fe.core.controllerextensions.Routing#navigate
     * @public
     * @since 1.90.0
     */;
    _proto.navigate = function navigate(oContext) {
      const internalModel = this.base.getModel("internal");
      // We have to delete the internal model value for "paginatorCurrentContext" to ensure it is re-evaluated by the navigateToContext function
      // BCP: 2270123820
      internalModel.setProperty("/paginatorCurrentContext", null);
      this.base._routing.navigateToContext(oContext);
    }

    /**
     * This function is used to intercept the routing event before binding a page.
     *
     * If it is declared as an extension, it allows you to intercept and change the normal flow of binding.
     *
     * This function is not called directly, but overridden separately by consuming controllers.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oContext Object containing the context for the navigation
     * @alias sap.fe.core.controllerextensions.Routing#onBeforeBinding
     * @public
     * @since 1.90.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeBinding = function onBeforeBinding(oContext) {
      // to be overriden by the application
    }

    /**
     * This function is used to intercept the routing event after binding a page.
     *
     * If it is declared as an extension, it allows you to intercept and change the normal flow of binding.
     *
     * This function is not called directly, but overridden separately by consuming controllers.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oContext Object containing the context to be navigated
     * @alias sap.fe.core.controllerextensions.Routing#onAfterBinding
     * @public
     * @since 1.90.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterBinding = function onAfterBinding(oContext) {
      // to be overriden by the application
    }

    /**
     * Navigate to another target.
     *
     * @alias sap.fe.core.controllerextensions.Routing#navigateToRoute
     * @param sTargetRouteName Name of the target route
     * @param oParameters Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @public
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oParameters) {
      const oMetaModel = this.base.getModel().getMetaModel();
      const bIsStickyMode = ModelHelper.isStickySessionSupported(oMetaModel);
      if (!oParameters) {
        oParameters = {};
      }
      oParameters.bIsStickyMode = bIsStickyMode;
      return this.base._routing.navigateToRoute(sTargetRouteName, oParameters);
    };
    return Routing;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onBeforeNavigation", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigate", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "navigate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeBinding", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToRoute", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToRoute"), _class2.prototype)), _class2)) || _class);
  return Routing;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb3V0aW5nIiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsImZpbmFsRXh0ZW5zaW9uIiwib25CZWZvcmVOYXZpZ2F0aW9uIiwibU5hdmlnYXRpb25QYXJhbWV0ZXJzIiwibmF2aWdhdGUiLCJvQ29udGV4dCIsImludGVybmFsTW9kZWwiLCJiYXNlIiwiZ2V0TW9kZWwiLCJzZXRQcm9wZXJ0eSIsIl9yb3V0aW5nIiwibmF2aWdhdGVUb0NvbnRleHQiLCJvbkJlZm9yZUJpbmRpbmciLCJvbkFmdGVyQmluZGluZyIsIm5hdmlnYXRlVG9Sb3V0ZSIsInNUYXJnZXRSb3V0ZU5hbWUiLCJvUGFyYW1ldGVycyIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJiSXNTdGlja3lNb2RlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb3V0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgcm91dGluZyBmbG93IG9mIHRoZSBhcHBsaWNhdGlvblxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjg2LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZ1wiKVxuY2xhc3MgUm91dGluZyBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcml2YXRlIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcuZ2V0TWV0YWRhdGFcblx0ICogQGZ1bmN0aW9uXG5cdCAqL1xuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZy5leHRlbmRcblx0ICogQGZ1bmN0aW9uXG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvIGludGVyY2VwdCB0aGUgcm91dGluZyBldmVudCBoYXBwZW5pbmcgZHVyaW5nIHRoZSBub3JtYWwgcHJvY2VzcyBvZiBuYXZpZ2F0aW5nIGZyb20gb25lIHBhZ2UgdG8gYW5vdGhlci5cblx0ICpcblx0ICogSWYgZGVjbGFyZWQgYXMgYW4gZXh0ZW5zaW9uLCBpdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCBhbmQgY2hhbmdlIHRoZSBub3JtYWwgbmF2aWdhdGlvbiBmbG93LlxuXHQgKiBJZiB5b3UgZGVjaWRlIHRvIGRvIHlvdXIgb3duIG5hdmlnYXRpb24gcHJvY2Vzc2luZywgeW91IGNhbiByZXR1cm4gYHRydWVgIHRvIHByZXZlbnQgdGhlIGRlZmF1bHQgcm91dGluZyBiZWhhdmlvci5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyByb3cgY29udGV4dCBhbmQgcGFnZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBtTmF2aWdhdGlvblBhcmFtZXRlcnMuYmluZGluZ0NvbnRleHQgVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjb250ZXh0XG5cdCAqIEByZXR1cm5zIGB0cnVlYCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGV4ZWN1dGlvbiwgZmFsc2UgdG8ga2VlcCB0aGUgc3RhbmRhcmQgYmVoYXZpb3Jcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjb25CZWZvcmVOYXZpZ2F0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuODYuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uQmVmb3JlTmF2aWdhdGlvbihtTmF2aWdhdGlvblBhcmFtZXRlcnM6IHsgYmluZGluZ0NvbnRleHQ6IENvbnRleHQgfSkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlbiBieSB0aGUgYXBwbGljYXRpb25cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQWxsb3dzIG5hdmlnYXRpb24gdG8gYSBzcGVjaWZpYyBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNvbnRleHQgdG8gYmUgbmF2aWdhdGVkIHRvXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nI25hdmlnYXRlXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHRoaXMuYmFzZS5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHQvLyBXZSBoYXZlIHRvIGRlbGV0ZSB0aGUgaW50ZXJuYWwgbW9kZWwgdmFsdWUgZm9yIFwicGFnaW5hdG9yQ3VycmVudENvbnRleHRcIiB0byBlbnN1cmUgaXQgaXMgcmUtZXZhbHVhdGVkIGJ5IHRoZSBuYXZpZ2F0ZVRvQ29udGV4dCBmdW5jdGlvblxuXHRcdC8vIEJDUDogMjI3MDEyMzgyMFxuXHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIiwgbnVsbCk7XG5cdFx0dGhpcy5iYXNlLl9yb3V0aW5nLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSByb3V0aW5nIGV2ZW50IGJlZm9yZSBiaW5kaW5nIGEgcGFnZS5cblx0ICpcblx0ICogSWYgaXQgaXMgZGVjbGFyZWQgYXMgYW4gZXh0ZW5zaW9uLCBpdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCBhbmQgY2hhbmdlIHRoZSBub3JtYWwgZmxvdyBvZiBiaW5kaW5nLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG5vdCBjYWxsZWQgZGlyZWN0bHksIGJ1dCBvdmVycmlkZGVuIHNlcGFyYXRlbHkgYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IE9iamVjdCBjb250YWluaW5nIHRoZSBjb250ZXh0IGZvciB0aGUgbmF2aWdhdGlvblxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZyNvbkJlZm9yZUJpbmRpbmdcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25CZWZvcmVCaW5kaW5nKG9Db250ZXh0OiBvYmplY3QpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW4gYnkgdGhlIGFwcGxpY2F0aW9uXG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGludGVyY2VwdCB0aGUgcm91dGluZyBldmVudCBhZnRlciBiaW5kaW5nIGEgcGFnZS5cblx0ICpcblx0ICogSWYgaXQgaXMgZGVjbGFyZWQgYXMgYW4gZXh0ZW5zaW9uLCBpdCBhbGxvd3MgeW91IHRvIGludGVyY2VwdCBhbmQgY2hhbmdlIHRoZSBub3JtYWwgZmxvdyBvZiBiaW5kaW5nLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG5vdCBjYWxsZWQgZGlyZWN0bHksIGJ1dCBvdmVycmlkZGVuIHNlcGFyYXRlbHkgYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IE9iamVjdCBjb250YWluaW5nIHRoZSBjb250ZXh0IHRvIGJlIG5hdmlnYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZyNvbkFmdGVyQmluZGluZ1xuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkFmdGVyQmluZGluZyhvQ29udGV4dDogb2JqZWN0KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlIHRvIGFub3RoZXIgdGFyZ2V0LlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZyNuYXZpZ2F0ZVRvUm91dGVcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBvUGFyYW1ldGVycyBQYXJhbWV0ZXJzIHRvIGJlIHVzZWQgd2l0aCByb3V0ZSB0byBjcmVhdGUgdGhlIHRhcmdldCBoYXNoXG5cdCAqIEByZXR1cm5zIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGlzIGZpbmFsaXplZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb1JvdXRlKHNUYXJnZXRSb3V0ZU5hbWU6IHN0cmluZywgb1BhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5iYXNlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0Y29uc3QgYklzU3RpY2t5TW9kZSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvTWV0YU1vZGVsKTtcblx0XHRpZiAoIW9QYXJhbWV0ZXJzKSB7XG5cdFx0XHRvUGFyYW1ldGVycyA9IHt9O1xuXHRcdH1cblx0XHRvUGFyYW1ldGVycy5iSXNTdGlja3lNb2RlID0gYklzU3RpY2t5TW9kZTtcblx0XHRyZXR1cm4gdGhpcy5iYXNlLl9yb3V0aW5nLm5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lLCBvUGFyYW1ldGVycyk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGluZztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQSxJQVFNQSxPQUFPLFdBRFpDLGNBQWMsQ0FBQywwQ0FBMEMsQ0FBQyxVQThCekRDLGVBQWUsRUFBRSxVQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBZW5DSCxlQUFlLEVBQUUsVUFDakJJLGNBQWMsRUFBRSxVQXNCaEJKLGVBQWUsRUFBRSxVQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBbUJuQ0gsZUFBZSxFQUFFLFVBQ2pCQyxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsV0FlbkNILGVBQWUsRUFBRSxXQUNqQkksY0FBYyxFQUFFO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQXZHakI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFFQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQWZDO0lBa0JBO0lBQ0FDLGtCQUFrQixHQUhsQiw0QkFHbUJDLHFCQUFrRCxFQUFFO01BQ3RFO01BQ0EsT0FBTyxLQUFLO0lBQ2I7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsT0FVQUMsUUFBUSxHQUZSLGtCQUVTQyxRQUFpQixFQUFFO01BQzNCLE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsUUFBUSxDQUFDLFVBQVUsQ0FBYztNQUNqRTtNQUNBO01BQ0FGLGFBQWEsQ0FBQ0csV0FBVyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQztNQUMzRCxJQUFJLENBQUNGLElBQUksQ0FBQ0csUUFBUSxDQUFDQyxpQkFBaUIsQ0FBQ04sUUFBUSxDQUFDO0lBQy9DOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BWkM7SUFBQTtJQWVBO0lBQ0FPLGVBQWUsR0FIZix5QkFHZ0JQLFFBQWdCLEVBQUU7TUFDakM7SUFBQTs7SUFHRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVpDO0lBQUE7SUFlQTtJQUNBUSxjQUFjLEdBSGQsd0JBR2VSLFFBQWdCLEVBQUU7TUFDaEM7SUFBQTs7SUFHRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FSQztJQUFBLE9BV0FTLGVBQWUsR0FGZix5QkFFZ0JDLGdCQUF3QixFQUFFQyxXQUFpQixFQUFFO01BQzVELE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNWLElBQUksQ0FBQ0MsUUFBUSxFQUFFLENBQUNVLFlBQVksRUFBb0I7TUFDeEUsTUFBTUMsYUFBYSxHQUFHQyxXQUFXLENBQUNDLHdCQUF3QixDQUFDSixVQUFVLENBQUM7TUFDdEUsSUFBSSxDQUFDRCxXQUFXLEVBQUU7UUFDakJBLFdBQVcsR0FBRyxDQUFDLENBQUM7TUFDakI7TUFDQUEsV0FBVyxDQUFDRyxhQUFhLEdBQUdBLGFBQWE7TUFDekMsT0FBTyxJQUFJLENBQUNaLElBQUksQ0FBQ0csUUFBUSxDQUFDSSxlQUFlLENBQUNDLGdCQUFnQixFQUFFQyxXQUFXLENBQUM7SUFDekUsQ0FBQztJQUFBO0VBQUEsRUFsSG9CTSxtQkFBbUI7RUFBQSxPQXFIMUIzQixPQUFPO0FBQUEifQ==