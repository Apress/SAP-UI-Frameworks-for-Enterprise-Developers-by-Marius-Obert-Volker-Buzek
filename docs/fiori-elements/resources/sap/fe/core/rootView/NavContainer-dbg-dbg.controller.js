/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/m/IllustratedMessage", "sap/m/Page", "./RootViewBaseController"], function (Log, CommonUtils, ViewState, ClassSupport, KeepAliveHelper, IllustratedMessage, Page, BaseController) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Base controller class for your own root view with a sap.m.NavContainer control.
   *
   * By using or extending this controller you can use your own root view with the sap.fe.core.AppComponent and
   * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.108.0
   */
  let NavContainerController = (_dec = defineUI5Class("sap.fe.core.rootView.NavContainer"), _dec2 = usingExtension(ViewState.override({
    applyInitialStateOnly: function () {
      return false;
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.getView(),
        oController = oView.getController();
      aControls.push(oController._getCurrentPage(oView));
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController();
      aStateControls.push(oController._getCurrentPage(oView));
    },
    onRestore: function () {
      const oView = this.getView(),
        oController = oView.getController(),
        oNavContainer = oController.getAppContentContainer();
      const oInternalModel = oNavContainer.getModel("internal");
      const oPages = oInternalModel.getProperty("/pages");
      for (const sComponentId in oPages) {
        oInternalModel.setProperty(`/pages/${sComponentId}/restoreStatus`, "pending");
      }
      oController.onContainerReady();
    },
    onSuspend: function () {
      const oView = this.getView(),
        oNavController = oView.getController(),
        oNavContainer = oNavController.getAppContentContainer();
      const aPages = oNavContainer.getPages();
      aPages.forEach(function (oPage) {
        const oTargetView = CommonUtils.getTargetView(oPage);
        const oController = oTargetView && oTargetView.getController();
        if (oController && oController.viewState && oController.viewState.onSuspend) {
          oController.viewState.onSuspend();
        }
      });
    }
  })), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(NavContainerController, _BaseController);
    function NavContainerController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewState", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = NavContainerController.prototype;
    _proto.onContainerReady = function onContainerReady() {
      // Restore views if neccessary.
      const oView = this.getView(),
        oPagePromise = this._getCurrentPage(oView);
      return oPagePromise.then(function (oCurrentPage) {
        const oTargetView = CommonUtils.getTargetView(oCurrentPage);
        return KeepAliveHelper.restoreView(oTargetView);
      });
    };
    _proto._getCurrentPage = function _getCurrentPage(oView) {
      const oNavContainer = this.getAppContentContainer();
      return new Promise(function (resolve) {
        const oCurrentPage = oNavContainer.getCurrentPage();
        if (oCurrentPage && oCurrentPage.getController && oCurrentPage.getController().isPlaceholder && oCurrentPage.getController().isPlaceholder()) {
          oCurrentPage.getController().attachEventOnce("targetPageInsertedInContainer", function (oEvent) {
            const oTargetPage = oEvent.getParameter("targetpage");
            const oTargetView = CommonUtils.getTargetView(oTargetPage);
            resolve(oTargetView !== oView && oTargetView);
          });
        } else {
          const oTargetView = CommonUtils.getTargetView(oCurrentPage);
          resolve(oTargetView !== oView && oTargetView);
        }
      });
    }

    /**
     * @private
     * @name sap.fe.core.rootView.NavContainer.getMetadata
     * @function
     */;
    _proto._getNavContainer = function _getNavContainer() {
      return this.getAppContentContainer();
    }

    /**
     * Gets the instanced views in the navContainer component.
     *
     * @returns {Array} Return the views.
     */;
    _proto.getInstancedViews = function getInstancedViews() {
      return this._getNavContainer().getPages().map(oPage => oPage.getComponentInstance().getRootControl());
    }

    /**
     * Check if the FCL component is enabled.
     *
     * @function
     * @name sap.fe.core.rootView.NavContainer.controller#isFclEnabled
     * @memberof sap.fe.core.rootView.NavContainer.controller
     * @returns `false` since we are not in FCL scenario
     * @ui5-restricted
     * @final
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      return false;
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // Do nothing
    }

    /**
     * Method that creates a new Page to display the IllustratedMessage containing the current error.
     *
     * @param sErrorMessage
     * @param mParameters
     * @alias sap.fe.core.rootView.NavContainer.controller#displayErrorPage
     * @returns A promise that creates a Page to display the error
     * @public
     */;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      return new Promise((resolve, reject) => {
        try {
          const oNavContainer = this._getNavContainer();
          if (!this.oPage) {
            this.oPage = new Page({
              showHeader: false
            });
            this.oIllustratedMessage = new IllustratedMessage({
              title: sErrorMessage,
              description: mParameters.description || "",
              illustrationType: `sapIllus-${mParameters.errorType}`
            });
            this.oPage.insertContent(this.oIllustratedMessage, 0);
            oNavContainer.addPage(this.oPage);
          }
          if (mParameters.handleShellBack) {
            const oErrorOriginPage = oNavContainer.getCurrentPage(),
              oAppComponent = CommonUtils.getAppComponent(oNavContainer.getCurrentPage());
            oAppComponent.getShellServices().setBackNavigation(function () {
              oNavContainer.to(oErrorOriginPage.getId());
              oAppComponent.getShellServices().setBackNavigation();
            });
          }
          oNavContainer.attachAfterNavigate(function () {
            resolve(true);
          });
          oNavContainer.to(this.oPage.getId());
        } catch (e) {
          reject(false);
          Log.info(e);
        }
      });
    };
    return NavContainerController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return NavContainerController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZDb250YWluZXJDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlZpZXdTdGF0ZSIsIm92ZXJyaWRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5IiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwib1ZpZXciLCJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwicHVzaCIsIl9nZXRDdXJyZW50UGFnZSIsImFkYXB0U3RhdGVDb250cm9scyIsImFTdGF0ZUNvbnRyb2xzIiwib25SZXN0b3JlIiwib05hdkNvbnRhaW5lciIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJvSW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwib1BhZ2VzIiwiZ2V0UHJvcGVydHkiLCJzQ29tcG9uZW50SWQiLCJzZXRQcm9wZXJ0eSIsIm9uQ29udGFpbmVyUmVhZHkiLCJvblN1c3BlbmQiLCJvTmF2Q29udHJvbGxlciIsImFQYWdlcyIsImdldFBhZ2VzIiwiZm9yRWFjaCIsIm9QYWdlIiwib1RhcmdldFZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJ2aWV3U3RhdGUiLCJvUGFnZVByb21pc2UiLCJ0aGVuIiwib0N1cnJlbnRQYWdlIiwiS2VlcEFsaXZlSGVscGVyIiwicmVzdG9yZVZpZXciLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldEN1cnJlbnRQYWdlIiwiaXNQbGFjZWhvbGRlciIsImF0dGFjaEV2ZW50T25jZSIsIm9FdmVudCIsIm9UYXJnZXRQYWdlIiwiZ2V0UGFyYW1ldGVyIiwiX2dldE5hdkNvbnRhaW5lciIsImdldEluc3RhbmNlZFZpZXdzIiwibWFwIiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImlzRmNsRW5hYmxlZCIsIl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcyIsImRpc3BsYXlFcnJvclBhZ2UiLCJzRXJyb3JNZXNzYWdlIiwibVBhcmFtZXRlcnMiLCJyZWplY3QiLCJQYWdlIiwic2hvd0hlYWRlciIsIm9JbGx1c3RyYXRlZE1lc3NhZ2UiLCJJbGx1c3RyYXRlZE1lc3NhZ2UiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiaWxsdXN0cmF0aW9uVHlwZSIsImVycm9yVHlwZSIsImluc2VydENvbnRlbnQiLCJhZGRQYWdlIiwiaGFuZGxlU2hlbGxCYWNrIiwib0Vycm9yT3JpZ2luUGFnZSIsIm9BcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0QmFja05hdmlnYXRpb24iLCJ0byIsImdldElkIiwiYXR0YWNoQWZ0ZXJOYXZpZ2F0ZSIsImUiLCJMb2ciLCJpbmZvIiwiQmFzZUNvbnRyb2xsZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk5hdkNvbnRhaW5lci5jb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IFZpZXdTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvVmlld1N0YXRlXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgdXNpbmdFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBJbGx1c3RyYXRlZE1lc3NhZ2UgZnJvbSBcInNhcC9tL0lsbHVzdHJhdGVkTWVzc2FnZVwiO1xuaW1wb3J0IHR5cGUgTmF2Q29udGFpbmVyIGZyb20gXCJzYXAvbS9OYXZDb250YWluZXJcIjtcbmltcG9ydCBQYWdlIGZyb20gXCJzYXAvbS9QYWdlXCI7XG5pbXBvcnQgdHlwZSBDb21wb25lbnRDb250YWluZXIgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudENvbnRhaW5lclwiO1xuaW1wb3J0IHR5cGUgWE1MVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1hNTFZpZXdcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcIi4vUm9vdFZpZXdCYXNlQ29udHJvbGxlclwiO1xuXG4vKipcbiAqIEJhc2UgY29udHJvbGxlciBjbGFzcyBmb3IgeW91ciBvd24gcm9vdCB2aWV3IHdpdGggYSBzYXAubS5OYXZDb250YWluZXIgY29udHJvbC5cbiAqXG4gKiBCeSB1c2luZyBvciBleHRlbmRpbmcgdGhpcyBjb250cm9sbGVyIHlvdSBjYW4gdXNlIHlvdXIgb3duIHJvb3QgdmlldyB3aXRoIHRoZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQgYW5kXG4gKiB5b3UgY2FuIG1ha2UgdXNlIG9mIFNBUCBGaW9yaSBlbGVtZW50cyBwYWdlcyBhbmQgU0FQIEZpb3JpIGVsZW1lbnRzIGJ1aWxkaW5nIGJsb2Nrcy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS4xMDguMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXJcIilcbmNsYXNzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRWaWV3U3RhdGUub3ZlcnJpZGUoe1xuXHRcdFx0YXBwbHlJbml0aWFsU3RhdGVPbmx5OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUsIGFDb250cm9sczogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTmF2Q29udGFpbmVyQ29udHJvbGxlcjtcblx0XHRcdFx0YUNvbnRyb2xzLnB1c2gob0NvbnRyb2xsZXIuX2dldEN1cnJlbnRQYWdlKG9WaWV3KSk7XG5cdFx0XHR9LFxuXHRcdFx0YWRhcHRTdGF0ZUNvbnRyb2xzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlLCBhU3RhdGVDb250cm9sczogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTmF2Q29udGFpbmVyQ29udHJvbGxlcjtcblx0XHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvQ29udHJvbGxlci5fZ2V0Q3VycmVudFBhZ2Uob1ZpZXcpKTtcblx0XHRcdH0sXG5cdFx0XHRvblJlc3RvcmU6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUpIHtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBOYXZDb250YWluZXJDb250cm9sbGVyLFxuXHRcdFx0XHRcdG9OYXZDb250YWluZXIgPSBvQ29udHJvbGxlci5nZXRBcHBDb250ZW50Q29udGFpbmVyKCk7XG5cdFx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsID0gb05hdkNvbnRhaW5lci5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0Y29uc3Qgb1BhZ2VzID0gb0ludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvcGFnZXNcIik7XG5cblx0XHRcdFx0Zm9yIChjb25zdCBzQ29tcG9uZW50SWQgaW4gb1BhZ2VzKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoYC9wYWdlcy8ke3NDb21wb25lbnRJZH0vcmVzdG9yZVN0YXR1c2AsIFwicGVuZGluZ1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvQ29udHJvbGxlci5vbkNvbnRhaW5lclJlYWR5KCk7XG5cdFx0XHR9LFxuXHRcdFx0b25TdXNwZW5kOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdFx0b05hdkNvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTmF2Q29udGFpbmVyQ29udHJvbGxlcixcblx0XHRcdFx0XHRvTmF2Q29udGFpbmVyID0gb05hdkNvbnRyb2xsZXIuZ2V0QXBwQ29udGVudENvbnRhaW5lcigpIGFzIE5hdkNvbnRhaW5lcjtcblx0XHRcdFx0Y29uc3QgYVBhZ2VzID0gb05hdkNvbnRhaW5lci5nZXRQYWdlcygpO1xuXHRcdFx0XHRhUGFnZXMuZm9yRWFjaChmdW5jdGlvbiAob1BhZ2U6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRWaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvUGFnZSk7XG5cblx0XHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9UYXJnZXRWaWV3ICYmIChvVGFyZ2V0Vmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpO1xuXHRcdFx0XHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci52aWV3U3RhdGUgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlLm9uU3VzcGVuZCkge1xuXHRcdFx0XHRcdFx0b0NvbnRyb2xsZXIudmlld1N0YXRlLm9uU3VzcGVuZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSlcblx0KVxuXHR2aWV3U3RhdGUhOiBWaWV3U3RhdGU7XG5cblx0b1BhZ2U/OiBQYWdlO1xuXG5cdG9JbGx1c3RyYXRlZE1lc3NhZ2U/OiBJbGx1c3RyYXRlZE1lc3NhZ2U7XG5cblx0b25Db250YWluZXJSZWFkeSgpIHtcblx0XHQvLyBSZXN0b3JlIHZpZXdzIGlmIG5lY2Nlc3NhcnkuXG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9QYWdlUHJvbWlzZSA9IHRoaXMuX2dldEN1cnJlbnRQYWdlKG9WaWV3KTtcblxuXHRcdHJldHVybiBvUGFnZVByb21pc2UudGhlbihmdW5jdGlvbiAob0N1cnJlbnRQYWdlOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9UYXJnZXRWaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvQ3VycmVudFBhZ2UpO1xuXHRcdFx0cmV0dXJuIEtlZXBBbGl2ZUhlbHBlci5yZXN0b3JlVmlldyhvVGFyZ2V0Vmlldyk7XG5cdFx0fSk7XG5cdH1cblxuXHRfZ2V0Q3VycmVudFBhZ2UodGhpczogTmF2Q29udGFpbmVyQ29udHJvbGxlciwgb1ZpZXc6IGFueSkge1xuXHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSB0aGlzLmdldEFwcENvbnRlbnRDb250YWluZXIoKSBhcyBOYXZDb250YWluZXI7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3Qgb0N1cnJlbnRQYWdlID0gb05hdkNvbnRhaW5lci5nZXRDdXJyZW50UGFnZSgpIGFzIGFueTtcblx0XHRcdGlmIChcblx0XHRcdFx0b0N1cnJlbnRQYWdlICYmXG5cdFx0XHRcdG9DdXJyZW50UGFnZS5nZXRDb250cm9sbGVyICYmXG5cdFx0XHRcdG9DdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkuaXNQbGFjZWhvbGRlciAmJlxuXHRcdFx0XHRvQ3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmlzUGxhY2Vob2xkZXIoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdG9DdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkuYXR0YWNoRXZlbnRPbmNlKFwidGFyZ2V0UGFnZUluc2VydGVkSW5Db250YWluZXJcIiwgZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldFBhZ2UgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidGFyZ2V0cGFnZVwiKTtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhcmdldFBhZ2UpO1xuXHRcdFx0XHRcdHJlc29sdmUob1RhcmdldFZpZXcgIT09IG9WaWV3ICYmIG9UYXJnZXRWaWV3KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0N1cnJlbnRQYWdlKTtcblx0XHRcdFx0cmVzb2x2ZShvVGFyZ2V0VmlldyAhPT0gb1ZpZXcgJiYgb1RhcmdldFZpZXcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5nZXRNZXRhZGF0YVxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cblx0X2dldE5hdkNvbnRhaW5lcigpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb250ZW50Q29udGFpbmVyKCkgYXMgTmF2Q29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGluc3RhbmNlZCB2aWV3cyBpbiB0aGUgbmF2Q29udGFpbmVyIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm4gdGhlIHZpZXdzLlxuXHQgKi9cblx0Z2V0SW5zdGFuY2VkVmlld3MoKTogWE1MVmlld1tdIHtcblx0XHRyZXR1cm4gKHRoaXMuX2dldE5hdkNvbnRhaW5lcigpLmdldFBhZ2VzKCkgYXMgQ29tcG9uZW50Q29udGFpbmVyW10pLm1hcCgob1BhZ2UpID0+XG5cdFx0XHQob1BhZ2UgYXMgYW55KS5nZXRDb21wb25lbnRJbnN0YW5jZSgpLmdldFJvb3RDb250cm9sKClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSBGQ0wgY29tcG9uZW50IGlzIGVuYWJsZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXIuY29udHJvbGxlciNpc0ZjbEVuYWJsZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5jb250cm9sbGVyXG5cdCAqIEByZXR1cm5zIGBmYWxzZWAgc2luY2Ugd2UgYXJlIG5vdCBpbiBGQ0wgc2NlbmFyaW9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0aXNGY2xFbmFibGVkKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgY3JlYXRlcyBhIG5ldyBQYWdlIHRvIGRpc3BsYXkgdGhlIElsbHVzdHJhdGVkTWVzc2FnZSBjb250YWluaW5nIHRoZSBjdXJyZW50IGVycm9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0Vycm9yTWVzc2FnZVxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnNcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5jb250cm9sbGVyI2Rpc3BsYXlFcnJvclBhZ2Vcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgY3JlYXRlcyBhIFBhZ2UgdG8gZGlzcGxheSB0aGUgZXJyb3Jcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0ZGlzcGxheUVycm9yUGFnZShzRXJyb3JNZXNzYWdlOiBzdHJpbmcsIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSB0aGlzLl9nZXROYXZDb250YWluZXIoKTtcblxuXHRcdFx0XHRpZiAoIXRoaXMub1BhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLm9QYWdlID0gbmV3IFBhZ2Uoe1xuXHRcdFx0XHRcdFx0c2hvd0hlYWRlcjogZmFsc2Vcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHRoaXMub0lsbHVzdHJhdGVkTWVzc2FnZSA9IG5ldyBJbGx1c3RyYXRlZE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdFx0dGl0bGU6IHNFcnJvck1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogbVBhcmFtZXRlcnMuZGVzY3JpcHRpb24gfHwgXCJcIixcblx0XHRcdFx0XHRcdGlsbHVzdHJhdGlvblR5cGU6IGBzYXBJbGx1cy0ke21QYXJhbWV0ZXJzLmVycm9yVHlwZX1gXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR0aGlzLm9QYWdlLmluc2VydENvbnRlbnQodGhpcy5vSWxsdXN0cmF0ZWRNZXNzYWdlLCAwKTtcblx0XHRcdFx0XHRvTmF2Q29udGFpbmVyLmFkZFBhZ2UodGhpcy5vUGFnZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuaGFuZGxlU2hlbGxCYWNrKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0Vycm9yT3JpZ2luUGFnZSA9IG9OYXZDb250YWluZXIuZ2V0Q3VycmVudFBhZ2UoKSxcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob05hdkNvbnRhaW5lci5nZXRDdXJyZW50UGFnZSgpKTtcblx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQob05hdkNvbnRhaW5lciBhcyBhbnkpLnRvKG9FcnJvck9yaWdpblBhZ2UuZ2V0SWQoKSk7XG5cdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbigpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9OYXZDb250YWluZXIuYXR0YWNoQWZ0ZXJOYXZpZ2F0ZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG9OYXZDb250YWluZXIudG8odGhpcy5vUGFnZS5nZXRJZCgpKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmVqZWN0KGZhbHNlKTtcblx0XHRcdFx0TG9nLmluZm8oZSBhcyBhbnkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5hdkNvbnRhaW5lckNvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVRBLElBV01BLHNCQUFzQixXQUQzQkMsY0FBYyxDQUFDLG1DQUFtQyxDQUFDLFVBRWxEQyxjQUFjLENBQ2RDLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDO0lBQ2xCQyxxQkFBcUIsRUFBRSxZQUFZO01BQ2xDLE9BQU8sS0FBSztJQUNiLENBQUM7SUFDREMsMkJBQTJCLEVBQUUsVUFBMkJDLFNBQWMsRUFBRTtNQUN2RSxNQUFNQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxPQUFPLEVBQUU7UUFDM0JDLFdBQVcsR0FBR0YsS0FBSyxDQUFDRyxhQUFhLEVBQTRCO01BQzlESixTQUFTLENBQUNLLElBQUksQ0FBQ0YsV0FBVyxDQUFDRyxlQUFlLENBQUNMLEtBQUssQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDRE0sa0JB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