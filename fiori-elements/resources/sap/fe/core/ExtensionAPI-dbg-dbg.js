/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/ui/base/Object", "sap/ui/core/Component", "sap/ui/model/json/JSONModel", "./helpers/ClassSupport"], function (Log, CommonUtils, BaseObject, Component, JSONModel, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Common Extension API for all pages of SAP Fiori elements for OData V4.
   *
   * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
   *
   * @alias sap.fe.core.ExtensionAPI
   * @public
   * @hideconstructor
   * @extends sap.ui.base.Object
   * @since 1.79.0
   */
  let ExtensionAPI = (_dec = defineUI5Class("sap.fe.core.ExtensionAPI"), _dec2 = property({
    type: "sap/fe/core/controllerextensions/EditFlow"
  }), _dec3 = property({
    type: "sap/fe/core/controllerextensions/Routing"
  }), _dec4 = property({
    type: "sap/fe/core/controllerextensions/IntentBasedNavigation"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(ExtensionAPI, _BaseObject);
    /**
     * A controller extension offering hooks into the edit flow of the application.
     *
     * @public
     */

    /**
     * A controller extension offering hooks into the routing flow of the application.
     *
     * @public
     */

    /**
     * ExtensionAPI for intent-based navigation
     *
     * @public
     */

    function ExtensionAPI(oController, sId) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _initializerDefineProperty(_this, "editFlow", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "routing", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor3, _assertThisInitialized(_this));
      _this._controller = oController;
      _this._view = oController.getView();
      _this.extension = _this._controller.extension;
      _this.editFlow = _this._controller.editFlow;
      _this.routing = _this._controller.routing;
      _this._routing = _this._controller._routing;
      _this.intentBasedNavigation = _this._controller.intentBasedNavigation;
      _this._prefix = sId;
      return _this;
    }
    var _proto = ExtensionAPI.prototype;
    _proto.destroy = function destroy() {
      // delete this._controller;
      // delete this._view;
      // delete this.editFlow._controller;
      // delete this.intentBasedNavigation._controller;
    }

    /**
     * Retrieves the editFlow controller extension for this page.
     *
     * @public
     * @returns The editFlow controller extension
     */;
    _proto.getEditFlow = function getEditFlow() {
      return this.editFlow;
    }

    /**
     * Retrieves the routing controller extension for this page.
     *
     * @public
     * @returns The routing controller extension
     */;
    _proto.getRouting = function getRouting() {
      return this.routing;
    }

    /**
     * Retrieves the intentBasedNavigation controller extension for this page.
     *
     * @public
     * @returns The intentBasedNavigation controller extension
     */;
    _proto.getIntentBasedNavigation = function getIntentBasedNavigation() {
      return this.intentBasedNavigation;
    }

    /**
     * Access any control by ID.
     *
     * @alias sap.fe.core.ExtensionAPI#byId
     * @param sId ID of the control without the view prefix. Either the ID prefixed by SAP Fiori elements
     * (for example with the section) or the control ID only. The latter works only for an extension running in
     * the same context (like in the same section). You can use the prefix for SAP Fiori elements to also access other controls located in different sections.
     * @returns The requested control, if found in the view.
     * @private
     */;
    _proto.byId = function byId(sId) {
      let oControl = this._view.byId(sId);
      if (!oControl && this._prefix) {
        // give it a try with the prefix
        oControl = this._view.byId(`${this._prefix}--${sId}`);
      }
      return oControl;
    }

    /**
     * Get access to models managed by SAP Fiori elements.<br>
     * The following models can be accessed:
     * <ul>
     * <li>undefined: the undefined model returns the SAPUI5 OData V4 model bound to this page</li>
     * <li>i18n / further data models defined in the manifest</li>
     * <li>ui: returns a SAPUI5 JSON model containing UI information.
     * Only the following properties are public and supported:
     * 	<ul>
     *     <li>isEditable: set to true if the application is in edit mode</li>
     *  </ul>
     * </li>
     * </ul>.
     * editMode is deprecated and should not be used anymore. Use isEditable instead.
     *
     * @alias sap.fe.core.ExtensionAPI#getModel
     * @param sModelName Name of the model
     * @returns The required model
     * @public
     */;
    _proto.getModel = function getModel(sModelName) {
      let oAppComponent;
      if (sModelName && sModelName !== "ui") {
        oAppComponent = CommonUtils.getAppComponent(this._view);
        if (!oAppComponent.getManifestEntry("sap.ui5").models[sModelName]) {
          // don't allow access to our internal models
          return undefined;
        }
      }
      return this._view.getModel(sModelName);
    }

    /**
     * Add any control as a dependent control to this SAP Fiori elements page.
     *
     * @alias sap.fe.core.ExtensionAPI#addDependent
     * @param oControl Control to be added as a dependent control
     * @public
     */;
    _proto.addDependent = function addDependent(oControl) {
      this._view.addDependent(oControl);
    }

    /**
     * Remove a dependent control from this SAP Fiori elements page.
     *
     * @alias sap.fe.core.ExtensionAPI#removeDependent
     * @param oControl Control to be added as a dependent control
     * @public
     */;
    _proto.removeDependent = function removeDependent(oControl) {
      this._view.removeDependent(oControl);
    }

    /**
     * Navigate to another target.
     *
     * @alias sap.fe.core.ExtensionAPI#navigateToTarget
     * @param sTarget Name of the target route
     * @param [oContext] Context instance
     * @public
     */;
    _proto.navigateToTarget = function navigateToTarget(sTarget, oContext) {
      this._controller._routing.navigateToTarget(oContext, sTarget);
    }

    /**
     * Load a fragment and go through the template preprocessor with the current page context.
     *
     * @alias sap.fe.core.ExtensionAPI#loadFragment
     * @param mSettings The settings object
     * @param mSettings.id The ID of the fragment itself
     * @param mSettings.name The name of the fragment to be loaded
     * @param mSettings.controller The controller to be attached to the fragment
     * @param mSettings.contextPath The contextPath to be used for the templating process
     * @param mSettings.initialBindingContext The initial binding context
     * @returns The fragment definition
     * @public
     */;
    _proto.loadFragment = async function loadFragment(mSettings) {
      var _this$getModel;
      const oTemplateComponent = Component.getOwnerComponentFor(this._view);
      const oPageModel = this._view.getModel("_pageModel");
      const oMetaModel = (_this$getModel = this.getModel()) === null || _this$getModel === void 0 ? void 0 : _this$getModel.getMetaModel();
      const mViewData = oTemplateComponent.getViewData();
      const oViewDataModel = new JSONModel(mViewData),
        oPreprocessorSettings = {
          bindingContexts: {
            contextPath: oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.createBindingContext(mSettings.contextPath || `/${oTemplateComponent.getEntitySet()}`),
            converterContext: oPageModel.createBindingContext("/", undefined, {
              noResolve: true
            }),
            viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
          },
          models: {
            contextPath: oMetaModel,
            converterContext: oPageModel,
            metaModel: oMetaModel,
            viewData: oViewDataModel
          },
          appComponent: CommonUtils.getAppComponent(this._view)
        };
      const oTemplatePromise = CommonUtils.templateControlFragment(mSettings.name, oPreprocessorSettings, {
        controller: mSettings.controller || this,
        isXML: false,
        id: mSettings.id
      });
      oTemplatePromise.then(oFragment => {
        if (mSettings.initialBindingContext !== undefined) {
          oFragment.setBindingContext(mSettings.initialBindingContext);
        }
        this.addDependent(oFragment);
        return oFragment;
      }).catch(function (oError) {
        Log.error(oError);
      });
      return oTemplatePromise;
    }

    /**
     * Triggers an update of the app state.
     * Should be called if the state of a control, or any other state-relevant information, was changed.
     *
     * @alias sap.fe.core.ExtensionAPI#updateAppState
     * @returns A promise that resolves with the new app state object.
     * @public
     */;
    _proto.updateAppState = async function updateAppState() {
      return this._controller.getAppComponent().getAppStateHandler().createAppState();
    };
    return ExtensionAPI;
  }(BaseObject), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "routing", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeHRlbnNpb25BUEkiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsIm9Db250cm9sbGVyIiwic0lkIiwiX2NvbnRyb2xsZXIiLCJfdmlldyIsImdldFZpZXciLCJleHRlbnNpb24iLCJlZGl0RmxvdyIsInJvdXRpbmciLCJfcm91dGluZyIsImludGVudEJhc2VkTmF2aWdhdGlvbiIsIl9wcmVmaXgiLCJkZXN0cm95IiwiZ2V0RWRpdEZsb3ciLCJnZXRSb3V0aW5nIiwiZ2V0SW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYnlJZCIsIm9Db250cm9sIiwiZ2V0TW9kZWwiLCJzTW9kZWxOYW1lIiwib0FwcENvbXBvbmVudCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0TWFuaWZlc3RFbnRyeSIsIm1vZGVscyIsInVuZGVmaW5lZCIsImFkZERlcGVuZGVudCIsInJlbW92ZURlcGVuZGVudCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJzVGFyZ2V0Iiwib0NvbnRleHQiLCJsb2FkRnJhZ21lbnQiLCJtU2V0dGluZ3MiLCJvVGVtcGxhdGVDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIm9QYWdlTW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwibVZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJvVmlld0RhdGFNb2RlbCIsIkpTT05Nb2RlbCIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsImNvbnRleHRQYXRoIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJnZXRFbnRpdHlTZXQiLCJjb252ZXJ0ZXJDb250ZXh0Iiwibm9SZXNvbHZlIiwidmlld0RhdGEiLCJtZXRhTW9kZWwiLCJhcHBDb21wb25lbnQiLCJvVGVtcGxhdGVQcm9taXNlIiwidGVtcGxhdGVDb250cm9sRnJhZ21lbnQiLCJuYW1lIiwiY29udHJvbGxlciIsImlzWE1MIiwiaWQiLCJ0aGVuIiwib0ZyYWdtZW50IiwiaW5pdGlhbEJpbmRpbmdDb250ZXh0Iiwic2V0QmluZGluZ0NvbnRleHQiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwidXBkYXRlQXBwU3RhdGUiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJjcmVhdGVBcHBTdGF0ZSIsIkJhc2VPYmplY3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkV4dGVuc2lvbkFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiO1xuaW1wb3J0IHR5cGUgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCB0eXBlIEludGVybmFsUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgdHlwZSBSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9Sb3V0aW5nXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuaW1wb3J0IEJhc2VPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL09iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgRW5oYW5jZVdpdGhVSTUgfSBmcm9tIFwiLi9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcIi4vaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcblxuLyoqXG4gKiBDb21tb24gRXh0ZW5zaW9uIEFQSSBmb3IgYWxsIHBhZ2VzIG9mIFNBUCBGaW9yaSBlbGVtZW50cyBmb3IgT0RhdGEgVjQuXG4gKlxuICogVG8gY29ycmVjdGx5IGludGVncmF0ZSB5b3VyIGFwcCBleHRlbnNpb24gY29kaW5nIHdpdGggU0FQIEZpb3JpIGVsZW1lbnRzLCB1c2Ugb25seSB0aGUgZXh0ZW5zaW9uQVBJIG9mIFNBUCBGaW9yaSBlbGVtZW50cy4gRG9uJ3QgYWNjZXNzIG9yIG1hbmlwdWxhdGUgY29udHJvbHMsIHByb3BlcnRpZXMsIG1vZGVscywgb3Igb3RoZXIgaW50ZXJuYWwgb2JqZWN0cyBjcmVhdGVkIGJ5IHRoZSBTQVAgRmlvcmkgZWxlbWVudHMgZnJhbWV3b3JrLlxuICpcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUElcbiAqIEBwdWJsaWNcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIHNhcC51aS5iYXNlLk9iamVjdFxuICogQHNpbmNlIDEuNzkuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5FeHRlbnNpb25BUElcIilcbmNsYXNzIEV4dGVuc2lvbkFQSSBleHRlbmRzIEJhc2VPYmplY3Qge1xuXHQvKipcblx0ICogQSBjb250cm9sbGVyIGV4dGVuc2lvbiBvZmZlcmluZyBob29rcyBpbnRvIHRoZSBlZGl0IGZsb3cgb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0VkaXRGbG93XCIgfSlcblx0ZWRpdEZsb3c6IEVkaXRGbG93O1xuXG5cdC8qKlxuXHQgKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGludG8gdGhlIHJvdXRpbmcgZmxvdyBvZiB0aGUgYXBwbGljYXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUm91dGluZ1wiIH0pXG5cdHJvdXRpbmc6IFJvdXRpbmc7XG5cblx0LyoqXG5cdCAqIEV4dGVuc2lvbkFQSSBmb3IgaW50ZW50LWJhc2VkIG5hdmlnYXRpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIiB9KVxuXHRpbnRlbnRCYXNlZE5hdmlnYXRpb246IEludGVudEJhc2VkTmF2aWdhdGlvbjtcblxuXHRwcm90ZWN0ZWQgX2NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyO1xuXG5cdHByb3RlY3RlZCBfdmlldzogVmlldztcblxuXHRwcml2YXRlIF9yb3V0aW5nOiBJbnRlcm5hbFJvdXRpbmc7XG5cblx0cHJpdmF0ZSBfcHJlZml4Pzogc3RyaW5nO1xuXG5cdHByaXZhdGUgZXh0ZW5zaW9uOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuXHRjb25zdHJ1Y3RvcihvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNJZD86IHN0cmluZykge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5fY29udHJvbGxlciA9IG9Db250cm9sbGVyO1xuXHRcdHRoaXMuX3ZpZXcgPSBvQ29udHJvbGxlci5nZXRWaWV3KCk7XG5cdFx0dGhpcy5leHRlbnNpb24gPSB0aGlzLl9jb250cm9sbGVyLmV4dGVuc2lvbjtcblx0XHR0aGlzLmVkaXRGbG93ID0gdGhpcy5fY29udHJvbGxlci5lZGl0Rmxvdztcblx0XHR0aGlzLnJvdXRpbmcgPSB0aGlzLl9jb250cm9sbGVyLnJvdXRpbmc7XG5cdFx0dGhpcy5fcm91dGluZyA9IHRoaXMuX2NvbnRyb2xsZXIuX3JvdXRpbmc7XG5cdFx0dGhpcy5pbnRlbnRCYXNlZE5hdmlnYXRpb24gPSB0aGlzLl9jb250cm9sbGVyLmludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0XHR0aGlzLl9wcmVmaXggPSBzSWQ7XG5cdH1cblxuXHRkZXN0cm95KCkge1xuXHRcdC8vIGRlbGV0ZSB0aGlzLl9jb250cm9sbGVyO1xuXHRcdC8vIGRlbGV0ZSB0aGlzLl92aWV3O1xuXHRcdC8vIGRlbGV0ZSB0aGlzLmVkaXRGbG93Ll9jb250cm9sbGVyO1xuXHRcdC8vIGRlbGV0ZSB0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbi5fY29udHJvbGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGZvciB0aGlzIHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdCAqL1xuXHRnZXRFZGl0RmxvdygpIHtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHJvdXRpbmcgY29udHJvbGxlciBleHRlbnNpb24gZm9yIHRoaXMgcGFnZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgcm91dGluZyBjb250cm9sbGVyIGV4dGVuc2lvblxuXHQgKi9cblx0Z2V0Um91dGluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5yb3V0aW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaW50ZW50QmFzZWROYXZpZ2F0aW9uIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGZvciB0aGlzIHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGludGVudEJhc2VkTmF2aWdhdGlvbiBjb250cm9sbGVyIGV4dGVuc2lvblxuXHQgKi9cblx0Z2V0SW50ZW50QmFzZWROYXZpZ2F0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBBY2Nlc3MgYW55IGNvbnRyb2wgYnkgSUQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjYnlJZFxuXHQgKiBAcGFyYW0gc0lkIElEIG9mIHRoZSBjb250cm9sIHdpdGhvdXQgdGhlIHZpZXcgcHJlZml4LiBFaXRoZXIgdGhlIElEIHByZWZpeGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50c1xuXHQgKiAoZm9yIGV4YW1wbGUgd2l0aCB0aGUgc2VjdGlvbikgb3IgdGhlIGNvbnRyb2wgSUQgb25seS4gVGhlIGxhdHRlciB3b3JrcyBvbmx5IGZvciBhbiBleHRlbnNpb24gcnVubmluZyBpblxuXHQgKiB0aGUgc2FtZSBjb250ZXh0IChsaWtlIGluIHRoZSBzYW1lIHNlY3Rpb24pLiBZb3UgY2FuIHVzZSB0aGUgcHJlZml4IGZvciBTQVAgRmlvcmkgZWxlbWVudHMgdG8gYWxzbyBhY2Nlc3Mgb3RoZXIgY29udHJvbHMgbG9jYXRlZCBpbiBkaWZmZXJlbnQgc2VjdGlvbnMuXG5cdCAqIEByZXR1cm5zIFRoZSByZXF1ZXN0ZWQgY29udHJvbCwgaWYgZm91bmQgaW4gdGhlIHZpZXcuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRieUlkKHNJZDogc3RyaW5nKSB7XG5cdFx0bGV0IG9Db250cm9sID0gdGhpcy5fdmlldy5ieUlkKHNJZCk7XG5cblx0XHRpZiAoIW9Db250cm9sICYmIHRoaXMuX3ByZWZpeCkge1xuXHRcdFx0Ly8gZ2l2ZSBpdCBhIHRyeSB3aXRoIHRoZSBwcmVmaXhcblx0XHRcdG9Db250cm9sID0gdGhpcy5fdmlldy5ieUlkKGAke3RoaXMuX3ByZWZpeH0tLSR7c0lkfWApO1xuXHRcdH1cblx0XHRyZXR1cm4gb0NvbnRyb2w7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGFjY2VzcyB0byBtb2RlbHMgbWFuYWdlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMuPGJyPlxuXHQgKiBUaGUgZm9sbG93aW5nIG1vZGVscyBjYW4gYmUgYWNjZXNzZWQ6XG5cdCAqIDx1bD5cblx0ICogPGxpPnVuZGVmaW5lZDogdGhlIHVuZGVmaW5lZCBtb2RlbCByZXR1cm5zIHRoZSBTQVBVSTUgT0RhdGEgVjQgbW9kZWwgYm91bmQgdG8gdGhpcyBwYWdlPC9saT5cblx0ICogPGxpPmkxOG4gLyBmdXJ0aGVyIGRhdGEgbW9kZWxzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0PC9saT5cblx0ICogPGxpPnVpOiByZXR1cm5zIGEgU0FQVUk1IEpTT04gbW9kZWwgY29udGFpbmluZyBVSSBpbmZvcm1hdGlvbi5cblx0ICogT25seSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXMgYXJlIHB1YmxpYyBhbmQgc3VwcG9ydGVkOlxuXHQgKiBcdDx1bD5cblx0ICogICAgIDxsaT5pc0VkaXRhYmxlOiBzZXQgdG8gdHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gaXMgaW4gZWRpdCBtb2RlPC9saT5cblx0ICogIDwvdWw+XG5cdCAqIDwvbGk+XG5cdCAqIDwvdWw+LlxuXHQgKiBlZGl0TW9kZSBpcyBkZXByZWNhdGVkIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgYW55bW9yZS4gVXNlIGlzRWRpdGFibGUgaW5zdGVhZC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSNnZXRNb2RlbFxuXHQgKiBAcGFyYW0gc01vZGVsTmFtZSBOYW1lIG9mIHRoZSBtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgcmVxdWlyZWQgbW9kZWxcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0TW9kZWwoc01vZGVsTmFtZT86IHN0cmluZyk6IE1vZGVsIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgb0FwcENvbXBvbmVudDtcblxuXHRcdGlmIChzTW9kZWxOYW1lICYmIHNNb2RlbE5hbWUgIT09IFwidWlcIikge1xuXHRcdFx0b0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLl92aWV3KTtcblx0XHRcdGlmICghb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpNVwiKS5tb2RlbHNbc01vZGVsTmFtZV0pIHtcblx0XHRcdFx0Ly8gZG9uJ3QgYWxsb3cgYWNjZXNzIHRvIG91ciBpbnRlcm5hbCBtb2RlbHNcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fdmlldy5nZXRNb2RlbChzTW9kZWxOYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYW55IGNvbnRyb2wgYXMgYSBkZXBlbmRlbnQgY29udHJvbCB0byB0aGlzIFNBUCBGaW9yaSBlbGVtZW50cyBwYWdlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJI2FkZERlcGVuZGVudFxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgQ29udHJvbCB0byBiZSBhZGRlZCBhcyBhIGRlcGVuZGVudCBjb250cm9sXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFkZERlcGVuZGVudChvQ29udHJvbDogQ29udHJvbCkge1xuXHRcdHRoaXMuX3ZpZXcuYWRkRGVwZW5kZW50KG9Db250cm9sKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYSBkZXBlbmRlbnQgY29udHJvbCBmcm9tIHRoaXMgU0FQIEZpb3JpIGVsZW1lbnRzIHBhZ2UuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjcmVtb3ZlRGVwZW5kZW50XG5cdCAqIEBwYXJhbSBvQ29udHJvbCBDb250cm9sIHRvIGJlIGFkZGVkIGFzIGEgZGVwZW5kZW50IGNvbnRyb2xcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVtb3ZlRGVwZW5kZW50KG9Db250cm9sOiBDb250cm9sKSB7XG5cdFx0dGhpcy5fdmlldy5yZW1vdmVEZXBlbmRlbnQob0NvbnRyb2wpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlIHRvIGFub3RoZXIgdGFyZ2V0LlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJI25hdmlnYXRlVG9UYXJnZXRcblx0ICogQHBhcmFtIHNUYXJnZXQgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb0NvbnRleHRdIENvbnRleHQgaW5zdGFuY2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0bmF2aWdhdGVUb1RhcmdldChzVGFyZ2V0OiBzdHJpbmcsIG9Db250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG5cdFx0dGhpcy5fY29udHJvbGxlci5fcm91dGluZy5uYXZpZ2F0ZVRvVGFyZ2V0KG9Db250ZXh0LCBzVGFyZ2V0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkIGEgZnJhZ21lbnQgYW5kIGdvIHRocm91Z2ggdGhlIHRlbXBsYXRlIHByZXByb2Nlc3NvciB3aXRoIHRoZSBjdXJyZW50IHBhZ2UgY29udGV4dC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSNsb2FkRnJhZ21lbnRcblx0ICogQHBhcmFtIG1TZXR0aW5ncyBUaGUgc2V0dGluZ3Mgb2JqZWN0XG5cdCAqIEBwYXJhbSBtU2V0dGluZ3MuaWQgVGhlIElEIG9mIHRoZSBmcmFnbWVudCBpdHNlbGZcblx0ICogQHBhcmFtIG1TZXR0aW5ncy5uYW1lIFRoZSBuYW1lIG9mIHRoZSBmcmFnbWVudCB0byBiZSBsb2FkZWRcblx0ICogQHBhcmFtIG1TZXR0aW5ncy5jb250cm9sbGVyIFRoZSBjb250cm9sbGVyIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBmcmFnbWVudFxuXHQgKiBAcGFyYW0gbVNldHRpbmdzLmNvbnRleHRQYXRoIFRoZSBjb250ZXh0UGF0aCB0byBiZSB1c2VkIGZvciB0aGUgdGVtcGxhdGluZyBwcm9jZXNzXG5cdCAqIEBwYXJhbSBtU2V0dGluZ3MuaW5pdGlhbEJpbmRpbmdDb250ZXh0IFRoZSBpbml0aWFsIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgZnJhZ21lbnQgZGVmaW5pdGlvblxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhc3luYyBsb2FkRnJhZ21lbnQobVNldHRpbmdzOiB7XG5cdFx0aWQ6IHN0cmluZztcblx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0Y29udHJvbGxlcjogb2JqZWN0O1xuXHRcdGNvbnRleHRQYXRoOiBzdHJpbmc7XG5cdFx0aW5pdGlhbEJpbmRpbmdDb250ZXh0OiBDb250ZXh0O1xuXHR9KTogUHJvbWlzZTxVSTVFbGVtZW50IHwgVUk1RWxlbWVudFtdPiB7XG5cdFx0Y29uc3Qgb1RlbXBsYXRlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMuX3ZpZXcpIGFzIEVuaGFuY2VXaXRoVUk1PFRlbXBsYXRlQ29tcG9uZW50Pjtcblx0XHRjb25zdCBvUGFnZU1vZGVsID0gdGhpcy5fdmlldy5nZXRNb2RlbChcIl9wYWdlTW9kZWxcIik7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IHRoaXMuZ2V0TW9kZWwoKT8uZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgbVZpZXdEYXRhID0gb1RlbXBsYXRlQ29tcG9uZW50LmdldFZpZXdEYXRhKCk7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1WaWV3RGF0YSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsPy5jcmVhdGVCaW5kaW5nQ29udGV4dChtU2V0dGluZ3MuY29udGV4dFBhdGggfHwgYC8ke29UZW1wbGF0ZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKSF9YCksXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogb1BhZ2VNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiwgdW5kZWZpbmVkLCB7IG5vUmVzb2x2ZTogdHJ1ZSB9KSxcblx0XHRcdFx0XHR2aWV3RGF0YTogbVZpZXdEYXRhID8gb1ZpZXdEYXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIDogbnVsbFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBvUGFnZU1vZGVsLFxuXHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHR2aWV3RGF0YTogb1ZpZXdEYXRhTW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0YXBwQ29tcG9uZW50OiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5fdmlldylcblx0XHRcdH07XG5cdFx0Y29uc3Qgb1RlbXBsYXRlUHJvbWlzZSA9IENvbW1vblV0aWxzLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KG1TZXR0aW5ncy5uYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHtcblx0XHRcdGNvbnRyb2xsZXI6IChtU2V0dGluZ3MuY29udHJvbGxlciBhcyBDb250cm9sbGVyKSB8fCB0aGlzLFxuXHRcdFx0aXNYTUw6IGZhbHNlLFxuXHRcdFx0aWQ6IG1TZXR0aW5ncy5pZFxuXHRcdH0pIGFzIFByb21pc2U8Q29udHJvbD47XG5cdFx0b1RlbXBsYXRlUHJvbWlzZVxuXHRcdFx0LnRoZW4oKG9GcmFnbWVudDogQ29udHJvbCkgPT4ge1xuXHRcdFx0XHRpZiAobVNldHRpbmdzLmluaXRpYWxCaW5kaW5nQ29udGV4dCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b0ZyYWdtZW50LnNldEJpbmRpbmdDb250ZXh0KG1TZXR0aW5ncy5pbml0aWFsQmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuYWRkRGVwZW5kZW50KG9GcmFnbWVudCk7XG5cdFx0XHRcdHJldHVybiBvRnJhZ21lbnQ7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0TG9nLmVycm9yKG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIG9UZW1wbGF0ZVByb21pc2U7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYW4gdXBkYXRlIG9mIHRoZSBhcHAgc3RhdGUuXG5cdCAqIFNob3VsZCBiZSBjYWxsZWQgaWYgdGhlIHN0YXRlIG9mIGEgY29udHJvbCwgb3IgYW55IG90aGVyIHN0YXRlLXJlbGV2YW50IGluZm9ybWF0aW9uLCB3YXMgY2hhbmdlZC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSN1cGRhdGVBcHBTdGF0ZVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBuZXcgYXBwIHN0YXRlIG9iamVjdC5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YXN5bmMgdXBkYXRlQXBwU3RhdGUoKTogUHJvbWlzZTx2b2lkIHwgeyBhcHBTdGF0ZTogb2JqZWN0IH0+IHtcblx0XHRyZXR1cm4gdGhpcy5fY29udHJvbGxlci5nZXRBcHBDb21wb25lbnQoKS5nZXRBcHBTdGF0ZUhhbmRsZXIoKS5jcmVhdGVBcHBTdGF0ZSgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV4dGVuc2lvbkFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQW9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVkEsSUFZTUEsWUFBWSxXQURqQkMsY0FBYyxDQUFDLDBCQUEwQixDQUFDLFVBT3pDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQTRDLENBQUMsQ0FBQyxVQVEvREQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUEyQyxDQUFDLENBQUMsVUFROURELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBeUQsQ0FBQyxDQUFDO0lBQUE7SUFyQjdFO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0lBSUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFJQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztJQWNDLHNCQUFZQyxXQUEyQixFQUFFQyxHQUFZLEVBQUU7TUFBQTtNQUN0RCw4QkFBTztNQUFDO01BQUE7TUFBQTtNQUNSLE1BQUtDLFdBQVcsR0FBR0YsV0FBVztNQUM5QixNQUFLRyxLQUFLLEdBQUdILFdBQVcsQ0FBQ0ksT0FBTyxFQUFFO01BQ2xDLE1BQUtDLFNBQVMsR0FBRyxNQUFLSCxXQUFXLENBQUNHLFNBQVM7TUFDM0MsTUFBS0MsUUFBUSxHQUFHLE1BQUtKLFdBQVcsQ0FBQ0ksUUFBUTtNQUN6QyxNQUFLQyxPQUFPLEdBQUcsTUFBS0wsV0FBVyxDQUFDSyxPQUFPO01BQ3ZDLE1BQUtDLFFBQVEsR0FBRyxNQUFLTixXQUFXLENBQUNNLFFBQVE7TUFDekMsTUFBS0MscUJBQXFCLEdBQUcsTUFBS1AsV0FBVyxDQUFDTyxxQkFBcUI7TUFDbkUsTUFBS0MsT0FBTyxHQUFHVCxHQUFHO01BQUM7SUFDcEI7SUFBQztJQUFBLE9BRURVLE9BQU8sR0FBUCxtQkFBVTtNQUNUO01BQ0E7TUFDQTtNQUNBO0lB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