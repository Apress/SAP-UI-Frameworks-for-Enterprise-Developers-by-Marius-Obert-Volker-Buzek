/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/pageReady/DataQueryWatcher", "sap/fe/core/services/TemplatedViewServiceFactory", "sap/ui/base/EventProvider", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "../CommonUtils", "../helpers/ClassSupport"], function (Log, DataQueryWatcher, TemplatedViewServiceFactory, EventProvider, Component, Core, ControllerExtension, OverrideExecution, CommonUtils, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let PageReadyControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.PageReady"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = methodOverride("_routing"), _dec7 = methodOverride("_routing"), _dec8 = methodOverride("_routing"), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = privateExtension(), _dec20 = extensible(OverrideExecution.Instead), _dec21 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(PageReadyControllerExtension, _ControllerExtension);
    function PageReadyControllerExtension() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call(this, ...args) || this;
      _this.pageReadyTimeoutDefault = 7000;
      return _this;
    }
    var _proto = PageReadyControllerExtension.prototype;
    _proto.onInit = function onInit() {
      var _manifestContent$sap, _this$pageComponent, _rootControlControlle;
      this._nbWaits = 0;
      this._oEventProvider = this._oEventProvider ? this._oEventProvider : new EventProvider();
      this.view = this.getView();
      this.appComponent = CommonUtils.getAppComponent(this.view);
      this.pageComponent = Component.getOwnerComponentFor(this.view);
      const manifestContent = this.appComponent.getManifest();
      this.pageReadyTimeout = ((_manifestContent$sap = manifestContent["sap.ui5"]) === null || _manifestContent$sap === void 0 ? void 0 : _manifestContent$sap.pageReadyTimeout) ?? this.pageReadyTimeoutDefault;
      if ((_this$pageComponent = this.pageComponent) !== null && _this$pageComponent !== void 0 && _this$pageComponent.attachContainerDefined) {
        this.pageComponent.attachContainerDefined(oEvent => this.registerContainer(oEvent.getParameter("container")));
      } else {
        this.registerContainer(this.view);
      }
      const rootControlController = this.appComponent.getRootControl().getController();
      const placeholder = rootControlController === null || rootControlController === void 0 ? void 0 : (_rootControlControlle = rootControlController.getPlaceholder) === null || _rootControlControlle === void 0 ? void 0 : _rootControlControlle.call(rootControlController);
      if (placeholder !== null && placeholder !== void 0 && placeholder.isPlaceholderDebugEnabled()) {
        this.attachEvent("pageReady", null, () => {
          placeholder.getPlaceholderDebugStats().iPageReadyEventTimestamp = Date.now();
        }, this);
        this.attachEvent("heroesBatchReceived", null, () => {
          placeholder.getPlaceholderDebugStats().iHeroesBatchReceivedEventTimestamp = Date.now();
        }, this);
      }
      this.queryWatcher = new DataQueryWatcher(this._oEventProvider, this.checkPageReadyDebounced.bind(this));
    };
    _proto.onExit = function onExit() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oAppComponent;
      if (this._oContainer) {
        this._oContainer.removeEventDelegate(this._fnContainerDelegate);
      }
    };
    _proto.waitFor = function waitFor(oPromise) {
      this._nbWaits++;
      oPromise.finally(() => {
        setTimeout(() => {
          this._nbWaits--;
        }, 0);
      }).catch(null);
    };
    _proto.onRouteMatched = function onRouteMatched() {
      this._bIsPageReady = false;
    };
    _proto.onRouteMatchedFinished = async function onRouteMatchedFinished() {
      await this.onAfterBindingPromise;
      this.checkPageReadyDebounced();
    };
    _proto.registerAggregatedControls = function registerAggregatedControls(mainBindingContext) {
      if (mainBindingContext) {
        const mainObjectBinding = mainBindingContext.getBinding();
        this.queryWatcher.registerBinding(mainObjectBinding);
      }
      const aPromises = [];
      const aControls = this.getView().findAggregatedObjects(true);
      aControls.forEach(oElement => {
        const oObjectBinding = oElement.getObjectBinding();
        if (oObjectBinding) {
          // Register on all object binding (mostly used on object pages)
          this.queryWatcher.registerBinding(oObjectBinding);
        } else {
          const aBindingKeys = Object.keys(oElement.mBindingInfos);
          aBindingKeys.forEach(sPropertyName => {
            const oListBinding = oElement.mBindingInfos[sPropertyName].binding;
            if (oListBinding && oListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
              this.queryWatcher.registerBinding(oListBinding);
            }
          });
        }
        // This is dirty but MDCTables and MDCCharts have a weird loading lifecycle
        if (oElement.isA("sap.ui.mdc.Table") || oElement.isA("sap.ui.mdc.Chart")) {
          this.bTablesChartsLoaded = false;
          aPromises.push(this.queryWatcher.registerTableOrChart(oElement));
        } else if (oElement.isA("sap.fe.core.controls.FilterBar")) {
          this.queryWatcher.registerFilterBar(oElement);
        }
      });
      return aPromises;
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext) {
      // In case the page is rebind we need to clear the timer (eg: in FCL, the user can select 2 items successively in the list report)
      if (this.pageReadyTimeoutTimer) {
        clearTimeout(this.pageReadyTimeoutTimer);
      }
      this.pageReadyTimeoutTimer = setTimeout(() => {
        Log.error(`The PageReady Event was not fired within the ${this.pageReadyTimeout} ms timeout . It has been forced. Please contact your application developer for further analysis`);
        this._oEventProvider.fireEvent("pageReady");
      }, this.pageReadyTimeout);
      if (this._bAfterBindingAlreadyApplied) {
        return;
      }
      this._bAfterBindingAlreadyApplied = true;
      if (this.isContextExpected() && oBindingContext === undefined) {
        // Force to mention we are expecting data
        this.bHasContext = false;
        return;
      } else {
        this.bHasContext = true;
      }
      this.attachEventOnce("pageReady", null, () => {
        clearTimeout(this.pageReadyTimeoutTimer);
        this.pageReadyTimeoutTimer = undefined;
        this._bAfterBindingAlreadyApplied = false;
        this.queryWatcher.reset();
      }, null);
      this.onAfterBindingPromise = new Promise(async resolve => {
        const aTableChartInitializedPromises = this.registerAggregatedControls(oBindingContext);
        if (aTableChartInitializedPromises.length > 0) {
          await Promise.all(aTableChartInitializedPromises);
          this.bTablesChartsLoaded = true;
          this.checkPageReadyDebounced();
          resolve();
        } else {
          this.checkPageReadyDebounced();
          resolve();
        }
      });
    };
    _proto.isPageReady = function isPageReady() {
      return this._bIsPageReady;
    };
    _proto.waitPageReady = function waitPageReady() {
      return new Promise(resolve => {
        if (this.isPageReady()) {
          resolve();
        } else {
          this.attachEventOnce("pageReady", null, () => {
            resolve();
          }, this);
        }
      });
    };
    _proto.attachEventOnce = function attachEventOnce(sEventId, oData, fnFunction, oListener) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.attachEventOnce(sEventId, oData, fnFunction, oListener);
    };
    _proto.attachEvent = function attachEvent(sEventId, oData, fnFunction, oListener) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.attachEvent(sEventId, oData, fnFunction, oListener);
    };
    _proto.detachEvent = function detachEvent(sEventId, fnFunction) {
      // eslint-disable-next-line prefer-rest-params
      return this._oEventProvider.detachEvent(sEventId, fnFunction);
    };
    _proto.registerContainer = function registerContainer(oContainer) {
      this._oContainer = oContainer;
      this._fnContainerDelegate = {
        onBeforeShow: () => {
          this.bShown = false;
          this._bIsPageReady = false;
        },
        onBeforeHide: () => {
          this.bShown = false;
          this._bIsPageReady = false;
        },
        onAfterShow: () => {
          var _this$onAfterBindingP;
          this.bShown = true;
          (_this$onAfterBindingP = this.onAfterBindingPromise) === null || _this$onAfterBindingP === void 0 ? void 0 : _this$onAfterBindingP.then(() => {
            this._checkPageReady(true);
          });
        }
      };
      this._oContainer.addEventDelegate(this._fnContainerDelegate, this);
    };
    _proto.isContextExpected = function isContextExpected() {
      return false;
    };
    _proto.checkPageReadyDebounced = function checkPageReadyDebounced() {
      if (this.pageReadyTimer) {
        clearTimeout(this.pageReadyTimer);
      }
      this.pageReadyTimer = setTimeout(() => {
        this._checkPageReady();
      }, 200);
    };
    _proto._checkPageReady = function _checkPageReady() {
      let bFromNav = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      const fnUIUpdated = () => {
        // Wait until the UI is no longer dirty
        if (!Core.getUIDirty()) {
          Core.detachEvent("UIUpdated", fnUIUpdated);
          this._bWaitingForRefresh = false;
          this.checkPageReadyDebounced();
        }
      };

      // In case UIUpdate does not get called, check if UI is not dirty and then call _checkPageReady
      const checkUIUpdated = () => {
        if (Core.getUIDirty()) {
          setTimeout(checkUIUpdated, 500);
        } else if (this._bWaitingForRefresh) {
          this._bWaitingForRefresh = false;
          Core.detachEvent("UIUpdated", fnUIUpdated);
          this.checkPageReadyDebounced();
        }
      };
      if (this.bShown && this.queryWatcher.isDataReceived() !== false && this.bTablesChartsLoaded !== false && (!this.isContextExpected() || this.bHasContext) // Either no context is expected or there is one
      ) {
        if (this.queryWatcher.isDataReceived() === true && !bFromNav && !this._bWaitingForRefresh && Core.getUIDirty()) {
          // If we requested data we get notified as soon as the data arrived, so before the next rendering tick
          this.queryWatcher.resetDataReceived();
          this._bWaitingForRefresh = true;
          Core.attachEvent("UIUpdated", fnUIUpdated);
          setTimeout(checkUIUpdated, 500);
        } else if (!this._bWaitingForRefresh && Core.getUIDirty() || this._nbWaits !== 0 || TemplatedViewServiceFactory.getNumberOfViewsInCreationState() > 0 || this.queryWatcher.isSearchPending()) {
          this._bWaitingForRefresh = true;
          Core.attachEvent("UIUpdated", fnUIUpdated);
          setTimeout(checkUIUpdated, 500);
        } else if (!this._bWaitingForRefresh) {
          // In the case we're not waiting for any data (navigating back to a page we already have loaded)
          // just wait for a frame to fire the event.
          this._bIsPageReady = true;
          this._oEventProvider.fireEvent("pageReady");
        }
      }
    };
    return PageReadyControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "waitFor", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "waitFor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isPageReady", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "isPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "waitPageReady", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "waitPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachEventOnce", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "attachEventOnce"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "attachEvent", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "attachEvent"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "detachEvent", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "detachEvent"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isContextExpected", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "isContextExpected"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "checkPageReadyDebounced", [_dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "checkPageReadyDebounced"), _class2.prototype)), _class2)) || _class);
  return PageReadyControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJtZXRob2RPdmVycmlkZSIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwYWdlUmVhZHlUaW1lb3V0RGVmYXVsdCIsIm9uSW5pdCIsIl9uYldhaXRzIiwiX29FdmVudFByb3ZpZGVyIiwiRXZlbnRQcm92aWRlciIsInZpZXciLCJnZXRWaWV3IiwiYXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJwYWdlQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJtYW5pZmVzdENvbnRlbnQiLCJnZXRNYW5pZmVzdCIsInBhZ2VSZWFkeVRpbWVvdXQiLCJhdHRhY2hDb250YWluZXJEZWZpbmVkIiwib0V2ZW50IiwicmVnaXN0ZXJDb250YWluZXIiLCJnZXRQYXJhbWV0ZXIiLCJyb290Q29udHJvbENvbnRyb2xsZXIiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJwbGFjZWhvbGRlciIsImdldFBsYWNlaG9sZGVyIiwiaXNQbGFjZWhvbGRlckRlYnVnRW5hYmxlZCIsImF0dGFjaEV2ZW50IiwiZ2V0UGxhY2Vob2xkZXJEZWJ1Z1N0YXRzIiwiaVBhZ2VSZWFkeUV2ZW50VGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsImlIZXJvZXNCYXRjaFJlY2VpdmVkRXZlbnRUaW1lc3RhbXAiLCJxdWVyeVdhdGNoZXIiLCJEYXRhUXVlcnlXYXRjaGVyIiwiY2hlY2tQYWdlUmVhZHlEZWJvdW5jZWQiLCJiaW5kIiwib25FeGl0IiwiX29BcHBDb21wb25lbnQiLCJfb0NvbnRhaW5lciIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJfZm5Db250YWluZXJEZWxlZ2F0ZSIsIndhaXRGb3IiLCJvUHJvbWlzZSIsImZpbmFsbHkiLCJzZXRUaW1lb3V0IiwiY2F0Y2giLCJvblJvdXRlTWF0Y2hlZCIsIl9iSXNQYWdlUmVhZHkiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25BZnRlckJpbmRpbmdQcm9taXNlIiwicmVnaXN0ZXJBZ2dyZWdhdGVkQ29udHJvbHMiLCJtYWluQmluZGluZ0NvbnRleHQiLCJtYWluT2JqZWN0QmluZGluZyIsImdldEJpbmRpbmciLCJyZWdpc3RlckJpbmRpbmciLCJhUHJvbWlzZXMiLCJhQ29udHJvbHMiLCJmaW5kQWdncmVnYXRlZE9iamVjdHMiLCJmb3JFYWNoIiwib0VsZW1lbnQiLCJvT2JqZWN0QmluZGluZyIsImdldE9iamVjdEJpbmRpbmciLCJhQmluZGluZ0tleXMiLCJPYmplY3QiLCJrZXlzIiwibUJpbmRpbmdJbmZvcyIsInNQcm9wZXJ0eU5hbWUiLCJvTGlzdEJpbmRpbmciLCJiaW5kaW5nIiwiaXNBIiwiYlRhYmxlc0NoYXJ0c0xvYWRlZCIsInB1c2giLCJyZWdpc3RlclRhYmxlT3JDaGFydCIsInJlZ2lzdGVyRmlsdGVyQmFyIiwib25BZnRlckJpbmRpbmciLCJvQmluZGluZ0NvbnRleHQiLCJwYWdlUmVhZHlUaW1lb3V0VGltZXIiLCJjbGVhclRpbWVvdXQiLCJMb2ciLCJlcnJvciIsImZpcmVFdmVudCIsIl9iQWZ0ZXJCaW5kaW5nQWxyZWFkeUFwcGxpZWQiLCJpc0NvbnRleHRFeHBlY3RlZCIsInVuZGVmaW5lZCIsImJIYXNDb250ZXh0IiwiYXR0YWNoRXZlbnRPbmNlIiwicmVzZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFUYWJsZUNoYXJ0SW5pdGlhbGl6ZWRQcm9taXNlcyIsImxlbmd0aCIsImFsbCIsImlzUGFnZVJlYWR5Iiwid2FpdFBhZ2VSZWFkeSIsInNFdmVudElkIiwib0RhdGEiLCJmbkZ1bmN0aW9uIiwib0xpc3RlbmVyIiwiZGV0YWNoRXZlbnQiLCJvQ29udGFpbmVyIiwib25CZWZvcmVTaG93IiwiYlNob3duIiwib25CZWZvcmVIaWRlIiwib25BZnRlclNob3ciLCJ0aGVuIiwiX2NoZWNrUGFnZVJlYWR5IiwiYWRkRXZlbnREZWxlZ2F0ZSIsInBhZ2VSZWFkeVRpbWVyIiwiYkZyb21OYXYiLCJmblVJVXBkYXRlZCIsIkNvcmUiLCJnZXRVSURpcnR5IiwiX2JXYWl0aW5nRm9yUmVmcmVzaCIsImNoZWNrVUlVcGRhdGVkIiwiaXNEYXRhUmVjZWl2ZWQiLCJyZXNldERhdGFSZWNlaXZlZCIsIlRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeSIsImdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUiLCJpc1NlYXJjaFBlbmRpbmciLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdlUmVhZHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgTWFuaWZlc3RDb250ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IERhdGFRdWVyeVdhdGNoZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3BhZ2VSZWFkeS9EYXRhUXVlcnlXYXRjaGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1RlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgRXZlbnRQcm92aWRlciBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRQcm92aWRlclwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcIi4uL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIG1ldGhvZE92ZXJyaWRlLCBwcml2YXRlRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwiLi4vaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGFnZVJlYWR5XCIpXG5jbGFzcyBQYWdlUmVhZHlDb250cm9sbGVyRXh0ZW5zaW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0cHJpdmF0ZSBfb0V2ZW50UHJvdmlkZXIhOiBFdmVudFByb3ZpZGVyO1xuXG5cdHByaXZhdGUgdmlldyE6IFZpZXc7XG5cblx0cHJpdmF0ZSBhcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0cHJpdmF0ZSBwYWdlQ29tcG9uZW50ITogQ29tcG9uZW50O1xuXG5cdHByaXZhdGUgX29Db250YWluZXIhOiBhbnk7XG5cblx0cHJpdmF0ZSBfYkFmdGVyQmluZGluZ0FscmVhZHlBcHBsaWVkITogYm9vbGVhbjtcblxuXHRwcml2YXRlIF9mbkNvbnRhaW5lckRlbGVnYXRlOiBhbnk7XG5cblx0cHJpdmF0ZSBfbmJXYWl0cyE6IG51bWJlcjtcblxuXHRwcml2YXRlIF9iSXNQYWdlUmVhZHkhOiBib29sZWFuO1xuXG5cdHByaXZhdGUgX2JXYWl0aW5nRm9yUmVmcmVzaCE6IGJvb2xlYW47XG5cblx0cHJpdmF0ZSBiU2hvd24hOiBib29sZWFuO1xuXG5cdHByaXZhdGUgYkhhc0NvbnRleHQhOiBib29sZWFuO1xuXG5cdHByaXZhdGUgYlRhYmxlc0NoYXJ0c0xvYWRlZD86IGJvb2xlYW47XG5cblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lcjogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG5cdHByaXZhdGUgcXVlcnlXYXRjaGVyITogRGF0YVF1ZXJ5V2F0Y2hlcjtcblxuXHRwcml2YXRlIG9uQWZ0ZXJCaW5kaW5nUHJvbWlzZSE6IFByb21pc2U8dm9pZD47XG5cblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lb3V0RGVmYXVsdCA9IDcwMDA7XG5cblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lb3V0VGltZXI/OiBudW1iZXI7XG5cblx0cHJpdmF0ZSBwYWdlUmVhZHlUaW1lb3V0PzogbnVtYmVyO1xuXG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdHB1YmxpYyBvbkluaXQoKSB7XG5cdFx0dGhpcy5fbmJXYWl0cyA9IDA7XG5cdFx0dGhpcy5fb0V2ZW50UHJvdmlkZXIgPSB0aGlzLl9vRXZlbnRQcm92aWRlciA/IHRoaXMuX29FdmVudFByb3ZpZGVyIDogbmV3IEV2ZW50UHJvdmlkZXIoKTtcblx0XHR0aGlzLnZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblxuXHRcdHRoaXMuYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMudmlldyk7XG5cdFx0dGhpcy5wYWdlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMudmlldykgYXMgQ29tcG9uZW50O1xuXHRcdGNvbnN0IG1hbmlmZXN0Q29udGVudDogTWFuaWZlc3RDb250ZW50ID0gdGhpcy5hcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKTtcblx0XHR0aGlzLnBhZ2VSZWFkeVRpbWVvdXQgPSBtYW5pZmVzdENvbnRlbnRbXCJzYXAudWk1XCJdPy5wYWdlUmVhZHlUaW1lb3V0ID8/IHRoaXMucGFnZVJlYWR5VGltZW91dERlZmF1bHQ7XG5cblx0XHRpZiAodGhpcy5wYWdlQ29tcG9uZW50Py5hdHRhY2hDb250YWluZXJEZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnBhZ2VDb21wb25lbnQuYXR0YWNoQ29udGFpbmVyRGVmaW5lZCgob0V2ZW50OiBFdmVudCkgPT4gdGhpcy5yZWdpc3RlckNvbnRhaW5lcihvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29udGFpbmVyXCIpKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVnaXN0ZXJDb250YWluZXIodGhpcy52aWV3IGFzIE1hbmFnZWRPYmplY3QpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHJvb3RDb250cm9sQ29udHJvbGxlciA9ICh0aGlzLmFwcENvbXBvbmVudC5nZXRSb290Q29udHJvbCgpIGFzIFZpZXcpLmdldENvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0Y29uc3QgcGxhY2Vob2xkZXIgPSByb290Q29udHJvbENvbnRyb2xsZXI/LmdldFBsYWNlaG9sZGVyPy4oKTtcblx0XHRpZiAocGxhY2Vob2xkZXI/LmlzUGxhY2Vob2xkZXJEZWJ1Z0VuYWJsZWQoKSkge1xuXHRcdFx0dGhpcy5hdHRhY2hFdmVudChcblx0XHRcdFx0XCJwYWdlUmVhZHlcIixcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdHBsYWNlaG9sZGVyLmdldFBsYWNlaG9sZGVyRGVidWdTdGF0cygpLmlQYWdlUmVhZHlFdmVudFRpbWVzdGFtcCA9IERhdGUubm93KCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXNcblx0XHRcdCk7XG5cdFx0XHR0aGlzLmF0dGFjaEV2ZW50KFxuXHRcdFx0XHRcImhlcm9lc0JhdGNoUmVjZWl2ZWRcIixcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdHBsYWNlaG9sZGVyLmdldFBsYWNlaG9sZGVyRGVidWdTdGF0cygpLmlIZXJvZXNCYXRjaFJlY2VpdmVkRXZlbnRUaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aGlzXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHRoaXMucXVlcnlXYXRjaGVyID0gbmV3IERhdGFRdWVyeVdhdGNoZXIodGhpcy5fb0V2ZW50UHJvdmlkZXIsIHRoaXMuY2hlY2tQYWdlUmVhZHlEZWJvdW5jZWQuYmluZCh0aGlzKSk7XG5cdH1cblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRwdWJsaWMgb25FeGl0KCkge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0ZGVsZXRlIHRoaXMuX29BcHBDb21wb25lbnQ7XG5cdFx0aWYgKHRoaXMuX29Db250YWluZXIpIHtcblx0XHRcdHRoaXMuX29Db250YWluZXIucmVtb3ZlRXZlbnREZWxlZ2F0ZSh0aGlzLl9mbkNvbnRhaW5lckRlbGVnYXRlKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cHVibGljIHdhaXRGb3Iob1Byb21pc2U6IGFueSkge1xuXHRcdHRoaXMuX25iV2FpdHMrKztcblx0XHRvUHJvbWlzZVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9uYldhaXRzLS07XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChudWxsKTtcblx0fVxuXG5cdEBtZXRob2RPdmVycmlkZShcIl9yb3V0aW5nXCIpXG5cdG9uUm91dGVNYXRjaGVkKCkge1xuXHRcdHRoaXMuX2JJc1BhZ2VSZWFkeSA9IGZhbHNlO1xuXHR9XG5cblx0QG1ldGhvZE92ZXJyaWRlKFwiX3JvdXRpbmdcIilcblx0YXN5bmMgb25Sb3V0ZU1hdGNoZWRGaW5pc2hlZCgpIHtcblx0XHRhd2FpdCB0aGlzLm9uQWZ0ZXJCaW5kaW5nUHJvbWlzZTtcblx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdH1cblxuXHRwdWJsaWMgcmVnaXN0ZXJBZ2dyZWdhdGVkQ29udHJvbHMobWFpbkJpbmRpbmdDb250ZXh0PzogQ29udGV4dCk6IFByb21pc2U8dm9pZD5bXSB7XG5cdFx0aWYgKG1haW5CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgbWFpbk9iamVjdEJpbmRpbmcgPSBtYWluQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJCaW5kaW5nKG1haW5PYmplY3RCaW5kaW5nKTtcblx0XHR9XG5cblx0XHRjb25zdCBhUHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXHRcdGNvbnN0IGFDb250cm9scyA9IHRoaXMuZ2V0VmlldygpLmZpbmRBZ2dyZWdhdGVkT2JqZWN0cyh0cnVlKTtcblxuXHRcdGFDb250cm9scy5mb3JFYWNoKChvRWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvT2JqZWN0QmluZGluZyA9IG9FbGVtZW50LmdldE9iamVjdEJpbmRpbmcoKTtcblx0XHRcdGlmIChvT2JqZWN0QmluZGluZykge1xuXHRcdFx0XHQvLyBSZWdpc3RlciBvbiBhbGwgb2JqZWN0IGJpbmRpbmcgKG1vc3RseSB1c2VkIG9uIG9iamVjdCBwYWdlcylcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJCaW5kaW5nKG9PYmplY3RCaW5kaW5nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGFCaW5kaW5nS2V5cyA9IE9iamVjdC5rZXlzKG9FbGVtZW50Lm1CaW5kaW5nSW5mb3MpO1xuXHRcdFx0XHRhQmluZGluZ0tleXMuZm9yRWFjaCgoc1Byb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9FbGVtZW50Lm1CaW5kaW5nSW5mb3Nbc1Byb3BlcnR5TmFtZV0uYmluZGluZztcblxuXHRcdFx0XHRcdGlmIChvTGlzdEJpbmRpbmcgJiYgb0xpc3RCaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZWdpc3RlckJpbmRpbmcob0xpc3RCaW5kaW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gVGhpcyBpcyBkaXJ0eSBidXQgTURDVGFibGVzIGFuZCBNRENDaGFydHMgaGF2ZSBhIHdlaXJkIGxvYWRpbmcgbGlmZWN5Y2xlXG5cdFx0XHRpZiAob0VsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdHRoaXMuYlRhYmxlc0NoYXJ0c0xvYWRlZCA9IGZhbHNlO1xuXHRcdFx0XHRhUHJvbWlzZXMucHVzaCh0aGlzLnF1ZXJ5V2F0Y2hlci5yZWdpc3RlclRhYmxlT3JDaGFydChvRWxlbWVudCkpO1xuXHRcdFx0fSBlbHNlIGlmIChvRWxlbWVudC5pc0EoXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWx0ZXJCYXJcIikpIHtcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIucmVnaXN0ZXJGaWx0ZXJCYXIob0VsZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGFQcm9taXNlcztcblx0fVxuXG5cdEBtZXRob2RPdmVycmlkZShcIl9yb3V0aW5nXCIpXG5cdG9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dD86IENvbnRleHQpIHtcblx0XHQvLyBJbiBjYXNlIHRoZSBwYWdlIGlzIHJlYmluZCB3ZSBuZWVkIHRvIGNsZWFyIHRoZSB0aW1lciAoZWc6IGluIEZDTCwgdGhlIHVzZXIgY2FuIHNlbGVjdCAyIGl0ZW1zIHN1Y2Nlc3NpdmVseSBpbiB0aGUgbGlzdCByZXBvcnQpXG5cdFx0aWYgKHRoaXMucGFnZVJlYWR5VGltZW91dFRpbWVyKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5wYWdlUmVhZHlUaW1lb3V0VGltZXIpO1xuXHRcdH1cblx0XHR0aGlzLnBhZ2VSZWFkeVRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRgVGhlIFBhZ2VSZWFkeSBFdmVudCB3YXMgbm90IGZpcmVkIHdpdGhpbiB0aGUgJHt0aGlzLnBhZ2VSZWFkeVRpbWVvdXR9IG1zIHRpbWVvdXQgLiBJdCBoYXMgYmVlbiBmb3JjZWQuIFBsZWFzZSBjb250YWN0IHlvdXIgYXBwbGljYXRpb24gZGV2ZWxvcGVyIGZvciBmdXJ0aGVyIGFuYWx5c2lzYFxuXHRcdFx0KTtcblx0XHRcdHRoaXMuX29FdmVudFByb3ZpZGVyLmZpcmVFdmVudChcInBhZ2VSZWFkeVwiKTtcblx0XHR9LCB0aGlzLnBhZ2VSZWFkeVRpbWVvdXQpO1xuXG5cdFx0aWYgKHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCA9IHRydWU7XG5cdFx0aWYgKHRoaXMuaXNDb250ZXh0RXhwZWN0ZWQoKSAmJiBvQmluZGluZ0NvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gRm9yY2UgdG8gbWVudGlvbiB3ZSBhcmUgZXhwZWN0aW5nIGRhdGFcblx0XHRcdHRoaXMuYkhhc0NvbnRleHQgPSBmYWxzZTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5iSGFzQ29udGV4dCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5hdHRhY2hFdmVudE9uY2UoXG5cdFx0XHRcInBhZ2VSZWFkeVwiLFxuXHRcdFx0bnVsbCxcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMucGFnZVJlYWR5VGltZW91dFRpbWVyKTtcblx0XHRcdFx0dGhpcy5wYWdlUmVhZHlUaW1lb3V0VGltZXIgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHRoaXMuX2JBZnRlckJpbmRpbmdBbHJlYWR5QXBwbGllZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLnF1ZXJ5V2F0Y2hlci5yZXNldCgpO1xuXHRcdFx0fSxcblx0XHRcdG51bGxcblx0XHQpO1xuXG5cdFx0dGhpcy5vbkFmdGVyQmluZGluZ1Byb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Y29uc3QgYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzID0gdGhpcy5yZWdpc3RlckFnZ3JlZ2F0ZWRDb250cm9scyhvQmluZGluZ0NvbnRleHQpO1xuXG5cdFx0XHRpZiAoYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoYVRhYmxlQ2hhcnRJbml0aWFsaXplZFByb21pc2VzKTtcblx0XHRcdFx0dGhpcy5iVGFibGVzQ2hhcnRzTG9hZGVkID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5jaGVja1BhZ2VSZWFkeURlYm91bmNlZCgpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgaXNQYWdlUmVhZHkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2JJc1BhZ2VSZWFkeTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgd2FpdFBhZ2VSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGlmICh0aGlzLmlzUGFnZVJlYWR5KCkpIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5hdHRhY2hFdmVudE9uY2UoXG5cdFx0XHRcdFx0XCJwYWdlUmVhZHlcIixcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRoaXNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgYXR0YWNoRXZlbnRPbmNlKHNFdmVudElkOiBzdHJpbmcsIG9EYXRhOiBhbnksIGZuRnVuY3Rpb24/OiBGdW5jdGlvbiwgb0xpc3RlbmVyPzogYW55KSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuXHRcdHJldHVybiB0aGlzLl9vRXZlbnRQcm92aWRlci5hdHRhY2hFdmVudE9uY2Uoc0V2ZW50SWQsIG9EYXRhLCBmbkZ1bmN0aW9uIGFzIEZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHB1YmxpYyBhdHRhY2hFdmVudChzRXZlbnRJZDogc3RyaW5nLCBvRGF0YTogYW55LCBmbkZ1bmN0aW9uOiBGdW5jdGlvbiwgb0xpc3RlbmVyOiBhbnkpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXG5cdFx0cmV0dXJuIHRoaXMuX29FdmVudFByb3ZpZGVyLmF0dGFjaEV2ZW50KHNFdmVudElkLCBvRGF0YSwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgZGV0YWNoRXZlbnQoc0V2ZW50SWQ6IHN0cmluZywgZm5GdW5jdGlvbjogRnVuY3Rpb24pIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXJlc3QtcGFyYW1zXG5cdFx0cmV0dXJuIHRoaXMuX29FdmVudFByb3ZpZGVyLmRldGFjaEV2ZW50KHNFdmVudElkLCBmbkZ1bmN0aW9uKTtcblx0fVxuXG5cdHByaXZhdGUgcmVnaXN0ZXJDb250YWluZXIob0NvbnRhaW5lcjogTWFuYWdlZE9iamVjdCkge1xuXHRcdHRoaXMuX29Db250YWluZXIgPSBvQ29udGFpbmVyO1xuXHRcdHRoaXMuX2ZuQ29udGFpbmVyRGVsZWdhdGUgPSB7XG5cdFx0XHRvbkJlZm9yZVNob3c6ICgpID0+IHtcblx0XHRcdFx0dGhpcy5iU2hvd24gPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5fYklzUGFnZVJlYWR5ID0gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0b25CZWZvcmVIaWRlOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYlNob3duID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuX2JJc1BhZ2VSZWFkeSA9IGZhbHNlO1xuXHRcdFx0fSxcblx0XHRcdG9uQWZ0ZXJTaG93OiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYlNob3duID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5vbkFmdGVyQmluZGluZ1Byb21pc2U/LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2NoZWNrUGFnZVJlYWR5KHRydWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHRoaXMuX29Db250YWluZXIuYWRkRXZlbnREZWxlZ2F0ZSh0aGlzLl9mbkNvbnRhaW5lckRlbGVnYXRlLCB0aGlzKTtcblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZClcblx0cHVibGljIGlzQ29udGV4dEV4cGVjdGVkKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRwdWJsaWMgY2hlY2tQYWdlUmVhZHlEZWJvdW5jZWQoKSB7XG5cdFx0aWYgKHRoaXMucGFnZVJlYWR5VGltZXIpIHtcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnBhZ2VSZWFkeVRpbWVyKTtcblx0XHR9XG5cdFx0dGhpcy5wYWdlUmVhZHlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2hlY2tQYWdlUmVhZHkoKTtcblx0XHR9LCAyMDApIGFzIHVua25vd24gYXMgbnVtYmVyO1xuXHR9XG5cblx0cHVibGljIF9jaGVja1BhZ2VSZWFkeShiRnJvbU5hdjogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0Y29uc3QgZm5VSVVwZGF0ZWQgPSAoKSA9PiB7XG5cdFx0XHQvLyBXYWl0IHVudGlsIHRoZSBVSSBpcyBubyBsb25nZXIgZGlydHlcblx0XHRcdGlmICghQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0Q29yZS5kZXRhY2hFdmVudChcIlVJVXBkYXRlZFwiLCBmblVJVXBkYXRlZCk7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLmNoZWNrUGFnZVJlYWR5RGVib3VuY2VkKCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIEluIGNhc2UgVUlVcGRhdGUgZG9lcyBub3QgZ2V0IGNhbGxlZCwgY2hlY2sgaWYgVUkgaXMgbm90IGRpcnR5IGFuZCB0aGVuIGNhbGwgX2NoZWNrUGFnZVJlYWR5XG5cdFx0Y29uc3QgY2hlY2tVSVVwZGF0ZWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAoQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0c2V0VGltZW91dChjaGVja1VJVXBkYXRlZCwgNTAwKTtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5fYldhaXRpbmdGb3JSZWZyZXNoKSB7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0XHRDb3JlLmRldGFjaEV2ZW50KFwiVUlVcGRhdGVkXCIsIGZuVUlVcGRhdGVkKTtcblx0XHRcdFx0dGhpcy5jaGVja1BhZ2VSZWFkeURlYm91bmNlZCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRpZiAoXG5cdFx0XHR0aGlzLmJTaG93biAmJlxuXHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIuaXNEYXRhUmVjZWl2ZWQoKSAhPT0gZmFsc2UgJiZcblx0XHRcdHRoaXMuYlRhYmxlc0NoYXJ0c0xvYWRlZCAhPT0gZmFsc2UgJiZcblx0XHRcdCghdGhpcy5pc0NvbnRleHRFeHBlY3RlZCgpIHx8IHRoaXMuYkhhc0NvbnRleHQpIC8vIEVpdGhlciBubyBjb250ZXh0IGlzIGV4cGVjdGVkIG9yIHRoZXJlIGlzIG9uZVxuXHRcdCkge1xuXHRcdFx0aWYgKHRoaXMucXVlcnlXYXRjaGVyLmlzRGF0YVJlY2VpdmVkKCkgPT09IHRydWUgJiYgIWJGcm9tTmF2ICYmICF0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2ggJiYgQ29yZS5nZXRVSURpcnR5KCkpIHtcblx0XHRcdFx0Ly8gSWYgd2UgcmVxdWVzdGVkIGRhdGEgd2UgZ2V0IG5vdGlmaWVkIGFzIHNvb24gYXMgdGhlIGRhdGEgYXJyaXZlZCwgc28gYmVmb3JlIHRoZSBuZXh0IHJlbmRlcmluZyB0aWNrXG5cdFx0XHRcdHRoaXMucXVlcnlXYXRjaGVyLnJlc2V0RGF0YVJlY2VpdmVkKCk7XG5cdFx0XHRcdHRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCA9IHRydWU7XG5cdFx0XHRcdENvcmUuYXR0YWNoRXZlbnQoXCJVSVVwZGF0ZWRcIiwgZm5VSVVwZGF0ZWQpO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGNoZWNrVUlVcGRhdGVkLCA1MDApO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0KCF0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2ggJiYgQ29yZS5nZXRVSURpcnR5KCkpIHx8XG5cdFx0XHRcdHRoaXMuX25iV2FpdHMgIT09IDAgfHxcblx0XHRcdFx0VGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LmdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUoKSA+IDAgfHxcblx0XHRcdFx0dGhpcy5xdWVyeVdhdGNoZXIuaXNTZWFyY2hQZW5kaW5nKClcblx0XHRcdCkge1xuXHRcdFx0XHR0aGlzLl9iV2FpdGluZ0ZvclJlZnJlc2ggPSB0cnVlO1xuXHRcdFx0XHRDb3JlLmF0dGFjaEV2ZW50KFwiVUlVcGRhdGVkXCIsIGZuVUlVcGRhdGVkKTtcblx0XHRcdFx0c2V0VGltZW91dChjaGVja1VJVXBkYXRlZCwgNTAwKTtcblx0XHRcdH0gZWxzZSBpZiAoIXRoaXMuX2JXYWl0aW5nRm9yUmVmcmVzaCkge1xuXHRcdFx0XHQvLyBJbiB0aGUgY2FzZSB3ZSdyZSBub3Qgd2FpdGluZyBmb3IgYW55IGRhdGEgKG5hdmlnYXRpbmcgYmFjayB0byBhIHBhZ2Ugd2UgYWxyZWFkeSBoYXZlIGxvYWRlZClcblx0XHRcdFx0Ly8ganVzdCB3YWl0IGZvciBhIGZyYW1lIHRvIGZpcmUgdGhlIGV2ZW50LlxuXHRcdFx0XHR0aGlzLl9iSXNQYWdlUmVhZHkgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLl9vRXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJwYWdlUmVhZHlcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhZ2VSZWFkeUNvbnRyb2xsZXJFeHRlbnNpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O01BbUJNQSw0QkFBNEIsV0FEakNDLGNBQWMsQ0FBQyw0Q0FBNEMsQ0FBQyxV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