/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/Controller"], function (CommonUtils, ClassSupport, Controller) {
  "use strict";

  var _dec, _dec2, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * Internal base controller class for SAP Fiori elements application.
   *
   * If you want to extend a base controller for your custom page, please use for sap.fe.core.PageController.
   *
   * @hideconstructor
   * @public
   * @since 1.90.0
   */
  let BaseController = (_dec = defineUI5Class("sap.fe.core.BaseController"), _dec2 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_Controller) {
    _inheritsLoose(BaseController, _Controller);
    function BaseController() {
      return _Controller.apply(this, arguments) || this;
    }
    var _proto = BaseController.prototype;
    /**
     * Returns the current app component.
     *
     * @returns The app component or, if not found, null
     * @alias sap.fe.core.BaseController#getAppComponent
     * @public
     * @since 1.91.0
     */
    _proto.getAppComponent = function getAppComponent() {
      if (!this._oAppComponent) {
        this._oAppComponent = CommonUtils.getAppComponent(this.getView());
      }
      return this._oAppComponent;
    }

    /**
     * Convenience method provided by SAP Fiori elements to enable applications to include the view model by name into each controller.
     *
     * @public
     * @param sName The model name
     * @returns The model instance
     */;
    _proto.getModel = function getModel(sName) {
      return this.getView().getModel(sName);
    }

    /**
     * Convenience method for setting the view model in every controller of the application.
     *
     * @public
     * @param oModel The model instance
     * @param sName The model name
     * @returns The view instance
     */;
    _proto.setModel = function setModel(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    };
    _proto.getResourceBundle = function getResourceBundle(sI18nModelName) {
      if (!sI18nModelName) {
        sI18nModelName = "i18n";
      }
      return this.getAppComponent().getModel(sI18nModelName).getResourceBundle();
    };
    return BaseController;
  }(Controller), (_applyDecoratedDescriptor(_class2.prototype, "getAppComponent", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "getAppComponent"), _class2.prototype)), _class2)) || _class);
  return BaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwicHVibGljRXh0ZW5zaW9uIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldFZpZXciLCJnZXRNb2RlbCIsInNOYW1lIiwic2V0TW9kZWwiLCJvTW9kZWwiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsInNJMThuTW9kZWxOYW1lIiwiQ29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQmFzZUNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCB0eXBlIFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuaW1wb3J0IENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuXG4vKipcbiAqIEludGVybmFsIGJhc2UgY29udHJvbGxlciBjbGFzcyBmb3IgU0FQIEZpb3JpIGVsZW1lbnRzIGFwcGxpY2F0aW9uLlxuICpcbiAqIElmIHlvdSB3YW50IHRvIGV4dGVuZCBhIGJhc2UgY29udHJvbGxlciBmb3IgeW91ciBjdXN0b20gcGFnZSwgcGxlYXNlIHVzZSBmb3Igc2FwLmZlLmNvcmUuUGFnZUNvbnRyb2xsZXIuXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuOTAuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5CYXNlQ29udHJvbGxlclwiKVxuY2xhc3MgQmFzZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblx0cHJpdmF0ZSBfb0FwcENvbXBvbmVudD86IEFwcENvbXBvbmVudDtcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCBhcHAgY29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgYXBwIGNvbXBvbmVudCBvciwgaWYgbm90IGZvdW5kLCBudWxsXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5CYXNlQ29udHJvbGxlciNnZXRBcHBDb21wb25lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MS4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0Z2V0QXBwQ29tcG9uZW50KCk6IEFwcENvbXBvbmVudCB7XG5cdFx0aWYgKCF0aGlzLl9vQXBwQ29tcG9uZW50KSB7XG5cdFx0XHR0aGlzLl9vQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX29BcHBDb21wb25lbnQ7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVuaWVuY2UgbWV0aG9kIHByb3ZpZGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50cyB0byBlbmFibGUgYXBwbGljYXRpb25zIHRvIGluY2x1ZGUgdGhlIHZpZXcgbW9kZWwgYnkgbmFtZSBpbnRvIGVhY2ggY29udHJvbGxlci5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0gc05hbWUgVGhlIG1vZGVsIG5hbWVcblx0ICogQHJldHVybnMgVGhlIG1vZGVsIGluc3RhbmNlXG5cdCAqL1xuXHRnZXRNb2RlbChzTmFtZT86IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChzTmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVuaWVuY2UgbWV0aG9kIGZvciBzZXR0aW5nIHRoZSB2aWV3IG1vZGVsIGluIGV2ZXJ5IGNvbnRyb2xsZXIgb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIG1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBzTmFtZSBUaGUgbW9kZWwgbmFtZVxuXHQgKiBAcmV0dXJucyBUaGUgdmlldyBpbnN0YW5jZVxuXHQgKi9cblx0c2V0TW9kZWwob01vZGVsOiBNb2RlbCwgc05hbWU6IHN0cmluZyk6IFZpZXcge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5zZXRNb2RlbChvTW9kZWwsIHNOYW1lKTtcblx0fVxuXG5cdGdldFJlc291cmNlQnVuZGxlKHNJMThuTW9kZWxOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIXNJMThuTW9kZWxOYW1lKSB7XG5cdFx0XHRzSTE4bk1vZGVsTmFtZSA9IFwiaTE4blwiO1xuXHRcdH1cblx0XHRyZXR1cm4gKHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TW9kZWwoc0kxOG5Nb2RlbE5hbWUpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCk7XG5cdH1cbn1cbmludGVyZmFjZSBCYXNlQ29udHJvbGxlciB7XG5cdGdldE93bmVyQ29tcG9uZW50KCk6IFRlbXBsYXRlQ29tcG9uZW50O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB2aWV3IGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFZpZXcgY29ubmVjdGVkIHRvIHRoaXMgY29udHJvbGxlci5cblx0ICovXG5cdGdldFZpZXcoKTogVmlldztcbn1cbmV4cG9ydCBkZWZhdWx0IEJhc2VDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUkEsSUFVTUEsY0FBYyxXQURuQkMsY0FBYyxDQUFDLDRCQUE0QixDQUFDLFVBWTNDQyxlQUFlLEVBQUU7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBUmxCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFQQyxPQVNBQyxlQUFlLEdBRGYsMkJBQ2dDO01BQy9CLElBQUksQ0FBQyxJQUFJLENBQUNDLGNBQWMsRUFBRTtRQUN6QixJQUFJLENBQUNBLGNBQWMsR0FBR0MsV0FBVyxDQUFDRixlQUFlLENBQUMsSUFBSSxDQUFDRyxPQUFPLEVBQUUsQ0FBQztNQUNsRTtNQUNBLE9BQU8sSUFBSSxDQUFDRixjQUFjO0lBQzNCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BRyxRQUFRLEdBQVIsa0JBQVNDLEtBQWMsRUFBRTtNQUN4QixPQUFPLElBQUksQ0FBQ0YsT0FBTyxFQUFFLENBQUNDLFFBQVEsQ0FBQ0MsS0FBSyxDQUFDO0lBQ3RDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BUUFDLFFBQVEsR0FBUixrQkFBU0MsTUFBYSxFQUFFRixLQUFhLEVBQVE7TUFDNUMsT0FBTyxJQUFJLENBQUNGLE9BQU8sRUFBRSxDQUFDRyxRQUFRLENBQUNDLE1BQU0sRUFBRUYsS0FBSyxDQUFDO0lBQzlDLENBQUM7SUFBQSxPQUVERyxpQkFBaUIsR0FBakIsMkJBQWtCQyxjQUFzQixFQUFFO01BQ3pDLElBQUksQ0FBQ0EsY0FBYyxFQUFFO1FBQ3BCQSxjQUFjLEdBQUcsTUFBTTtNQUN4QjtNQUNBLE9BQVEsSUFBSSxDQUFDVCxlQUFlLEVBQUUsQ0FBQ0ksUUFBUSxDQUFDSyxjQUFjLENBQUMsQ0FBbUJELGlCQUFpQixFQUFFO0lBQzlGLENBQUM7SUFBQTtFQUFBLEVBL0MyQkUsVUFBVTtFQUFBLE9BMkR4QmIsY0FBYztBQUFBIn0=