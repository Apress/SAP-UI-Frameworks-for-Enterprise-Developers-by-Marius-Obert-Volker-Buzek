/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/helpers/AppStartupHelper", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/ui/base/BindingParser", "sap/ui/base/EventProvider", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/model/odata/v4/ODataUtils"], function (Log, BusyLocker, messageHandling, Placeholder, NavigationReason, AppStartupHelper, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, CollaborationHelper, BindingParser, EventProvider, Service, ServiceFactory, ODataUtils) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RoutingServiceEventing = (_dec = defineUI5Class("sap.fe.core.services.RoutingServiceEventing"), _dec2 = event(), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_EventProvider) {
    _inheritsLoose(RoutingServiceEventing, _EventProvider);
    function RoutingServiceEventing() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _EventProvider.call(this, ...args) || this;
      _initializerDefineProperty(_this, "routeMatched", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterRouteMatched", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    return RoutingServiceEventing;
  }(EventProvider), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routeMatched", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "afterRouteMatched", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  let RoutingService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(RoutingService, _Service);
    function RoutingService() {
      var _this2;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _this2 = _Service.call(this, ...args) || this;
      _this2.navigationInfoQueue = [];
      return _this2;
    }
    _exports.RoutingService = RoutingService;
    var _proto = RoutingService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext();
      if (oContext.scopeType === "component") {
        var _oAppConfig$crossNavi;
        this.oAppComponent = oContext.scopeObject;
        this.oModel = this.oAppComponent.getModel();
        this.oMetaModel = this.oModel.getMetaModel();
        this.oRouter = this.oAppComponent.getRouter();
        this.oRouterProxy = this.oAppComponent.getRouterProxy();
        this.eventProvider = new RoutingServiceEventing();
        const oRoutingConfig = this.oAppComponent.getManifestEntry("sap.ui5").routing;
        this._parseRoutingConfiguration(oRoutingConfig);
        const oAppConfig = this.oAppComponent.getManifestEntry("sap.app");
        this.outbounds = (_oAppConfig$crossNavi = oAppConfig.crossNavigation) === null || _oAppConfig$crossNavi === void 0 ? void 0 : _oAppConfig$crossNavi.outbounds;
      }
      this.initPromise = Promise.resolve(this);
    };
    _proto.beforeExit = function beforeExit() {
      this.oRouter.detachRouteMatched(this._fnOnRouteMatched, this);
      this.eventProvider.fireEvent("routeMatched", {});
    };
    _proto.exit = function exit() {
      this.eventProvider.destroy();
    }

    /**
     * Parse a manifest routing configuration for internal usage.
     *
     * @param oRoutingConfig The routing configuration from the manifest
     * @private
     */;
    _proto._parseRoutingConfiguration = function _parseRoutingConfiguration(oRoutingConfig) {
      var _oRoutingConfig$confi;
      const isFCL = (oRoutingConfig === null || oRoutingConfig === void 0 ? void 0 : (_oRoutingConfig$confi = oRoutingConfig.config) === null || _oRoutingConfig$confi === void 0 ? void 0 : _oRoutingConfig$confi.routerClass) === "sap.f.routing.Router";

      // Information of targets
      this._mTargets = {};
      Object.keys(oRoutingConfig.targets).forEach(sTargetName => {
        this._mTargets[sTargetName] = Object.assign({
          targetName: sTargetName
        }, oRoutingConfig.targets[sTargetName]);

        // View level for FCL cases is calculated from the target pattern
        if (this._mTargets[sTargetName].contextPattern !== undefined) {
          this._mTargets[sTargetName].viewLevel = this._getViewLevelFromPattern(this._mTargets[sTargetName].contextPattern, 0);
        }
      });

      // Information of routes
      this._mRoutes = {};
      for (const sRouteKey in oRoutingConfig.routes) {
        const oRouteManifestInfo = oRoutingConfig.routes[sRouteKey],
          aRouteTargets = Array.isArray(oRouteManifestInfo.target) ? oRouteManifestInfo.target : [oRouteManifestInfo.target],
          sRouteName = Array.isArray(oRoutingConfig.routes) ? oRouteManifestInfo.name : sRouteKey,
          sRoutePattern = oRouteManifestInfo.pattern;

        // Check route pattern: all patterns need to end with ':?query:', that we use for parameters
        if (sRoutePattern.length < 8 || sRoutePattern.indexOf(":?query:") !== sRoutePattern.length - 8) {
          Log.warning(`Pattern for route ${sRouteName} doesn't end with ':?query:' : ${sRoutePattern}`);
        }
        const iRouteLevel = this._getViewLevelFromPattern(sRoutePattern, 0);
        this._mRoutes[sRouteName] = {
          name: sRouteName,
          pattern: sRoutePattern,
          targets: aRouteTargets,
          routeLevel: iRouteLevel
        };

        // Add the parent targets in the list of targets for the route
        for (let i = 0; i < aRouteTargets.length; i++) {
          const sParentTargetName = this._mTargets[aRouteTargets[i]].parent;
          if (sParentTargetName) {
            aRouteTargets.push(sParentTargetName);
          }
        }
        if (!isFCL) {
          // View level for non-FCL cases is calculated from the route pattern
          if (this._mTargets[aRouteTargets[0]].viewLevel === undefined || this._mTargets[aRouteTargets[0]].viewLevel < iRouteLevel) {
            // There are cases when different routes point to the same target. We take the
            // largest viewLevel in that case.
            this._mTargets[aRouteTargets[0]].viewLevel = iRouteLevel;
          }

          // FCL level for non-FCL cases is equal to -1
          this._mTargets[aRouteTargets[0]].FCLLevel = -1;
        } else if (aRouteTargets.length === 1 && this._mTargets[aRouteTargets[0]].controlAggregation !== "beginColumnPages") {
          // We're in the case where there's only 1 target for the route, and it's not in the first column
          // --> this is a fullscreen column after all columns in the FCL have been used
          this._mTargets[aRouteTargets[0]].FCLLevel = 3;
        } else {
          // Other FCL cases
          aRouteTargets.forEach(sTargetName => {
            switch (this._mTargets[sTargetName].controlAggregation) {
              case "beginColumnPages":
                this._mTargets[sTargetName].FCLLevel = 0;
                break;
              case "midColumnPages":
                this._mTargets[sTargetName].FCLLevel = 1;
                break;
              default:
                this._mTargets[sTargetName].FCLLevel = 2;
            }
          });
        }
      }

      // Propagate viewLevel, contextPattern, FCLLevel and controlAggregation to parent targets
      Object.keys(this._mTargets).forEach(sTargetName => {
        while (this._mTargets[sTargetName].parent) {
          const sParentTargetName = this._mTargets[sTargetName].parent;
          this._mTargets[sParentTargetName].viewLevel = this._mTargets[sParentTargetName].viewLevel || this._mTargets[sTargetName].viewLevel;
          this._mTargets[sParentTargetName].contextPattern = this._mTargets[sParentTargetName].contextPattern || this._mTargets[sTargetName].contextPattern;
          this._mTargets[sParentTargetName].FCLLevel = this._mTargets[sParentTargetName].FCLLevel || this._mTargets[sTargetName].FCLLevel;
          this._mTargets[sParentTargetName].controlAggregation = this._mTargets[sParentTargetName].controlAggregation || this._mTargets[sTargetName].controlAggregation;
          sTargetName = sParentTargetName;
        }
      });

      // Determine the root entity for the app
      const aLevel0RouteNames = [];
      const aLevel1RouteNames = [];
      let sDefaultRouteName;
      for (const sName in this._mRoutes) {
        const iLevel = this._mRoutes[sName].routeLevel;
        if (iLevel === 0) {
          aLevel0RouteNames.push(sName);
        } else if (iLevel === 1) {
          aLevel1RouteNames.push(sName);
        }
      }
      if (aLevel0RouteNames.length === 1) {
        sDefaultRouteName = aLevel0RouteNames[0];
      } else if (aLevel1RouteNames.length === 1) {
        sDefaultRouteName = aLevel1RouteNames[0];
      }
      if (sDefaultRouteName) {
        const sDefaultTargetName = this._mRoutes[sDefaultRouteName].targets.slice(-1)[0];
        this.sContextPath = "";
        if (this._mTargets[sDefaultTargetName].options && this._mTargets[sDefaultTargetName].options.settings) {
          const oSettings = this._mTargets[sDefaultTargetName].options.settings;
          this.sContextPath = oSettings.contextPath || `/${oSettings.entitySet}`;
        }
        if (!this.sContextPath) {
          Log.warning(`Cannot determine default contextPath: contextPath or entitySet missing in default target: ${sDefaultTargetName}`);
        }
      } else {
        Log.warning("Cannot determine default contextPath: no default route found.");
      }

      // We need to establish the correct path to the different pages, including the navigation properties
      Object.keys(this._mTargets).map(sTargetKey => {
        return this._mTargets[sTargetKey];
      }).sort((a, b) => {
        return a.viewLevel < b.viewLevel ? -1 : 1;
      }).forEach(target => {
        // After sorting the targets per level we can then go through their navigation object and update the paths accordingly.
        if (target.options) {
          const settings = target.options.settings;
          const sContextPath = settings.contextPath || (settings.entitySet ? `/${settings.entitySet}` : "");
          if (!settings.fullContextPath && sContextPath) {
            settings.fullContextPath = `${sContextPath}/`;
          }
          Object.keys(settings.navigation || {}).forEach(sNavName => {
            // Check if it's a navigation property
            const targetRoute = this._mRoutes[settings.navigation[sNavName].detail.route];
            if (targetRoute && targetRoute.targets) {
              targetRoute.targets.forEach(sTargetName => {
                if (this._mTargets[sTargetName].options && this._mTargets[sTargetName].options.settings && !this._mTargets[sTargetName].options.settings.fullContextPath) {
                  if (target.viewLevel === 0) {
                    this._mTargets[sTargetName].options.settings.fullContextPath = `${(sNavName.startsWith("/") ? "" : "/") + sNavName}/`;
                  } else {
                    this._mTargets[sTargetName].options.settings.fullContextPath = `${settings.fullContextPath + sNavName}/`;
                  }
                }
              });
            }
          });
        }
      });
    }

    /**
     * Calculates a view level from a pattern by counting the number of segments.
     *
     * @param sPattern The pattern
     * @param viewLevel The current level of view
     * @returns The level
     */;
    _proto._getViewLevelFromPattern = function _getViewLevelFromPattern(sPattern, viewLevel) {
      sPattern = sPattern.replace(":?query:", "");
      const regex = new RegExp("/[^/]*$");
      if (sPattern && sPattern[0] !== "/" && sPattern[0] !== "?") {
        sPattern = `/${sPattern}`;
      }
      if (sPattern.length) {
        sPattern = sPattern.replace(regex, "");
        if (this.oRouter.match(sPattern) || sPattern === "") {
          return this._getViewLevelFromPattern(sPattern, ++viewLevel);
        } else {
          return this._getViewLevelFromPattern(sPattern, viewLevel);
        }
      } else {
        return viewLevel;
      }
    };
    _proto._getRouteInformation = function _getRouteInformation(sRouteName) {
      return this._mRoutes[sRouteName];
    };
    _proto._getTargetInformation = function _getTargetInformation(sTargetName) {
      return this._mTargets[sTargetName];
    };
    _proto._getComponentId = function _getComponentId(sOwnerId, sComponentId) {
      if (sComponentId.indexOf(`${sOwnerId}---`) === 0) {
        return sComponentId.substr(sOwnerId.length + 3);
      }
      return sComponentId;
    }

    /**
     * Get target information for a given component.
     *
     * @param oComponentInstance Instance of the component
     * @returns The configuration for the target
     */;
    _proto.getTargetInformationFor = function getTargetInformationFor(oComponentInstance) {
      const sTargetComponentId = this._getComponentId(oComponentInstance._sOwnerId, oComponentInstance.getId());
      let sCorrectTargetName = null;
      Object.keys(this._mTargets).forEach(sTargetName => {
        if (this._mTargets[sTargetName].id === sTargetComponentId || this._mTargets[sTargetName].viewId === sTargetComponentId) {
          sCorrectTargetName = sTargetName;
        }
      });
      return this._getTargetInformation(sCorrectTargetName);
    };
    _proto.getLastSemanticMapping = function getLastSemanticMapping() {
      return this.oLastSemanticMapping;
    };
    _proto.setLastSemanticMapping = function setLastSemanticMapping(oMapping) {
      this.oLastSemanticMapping = oMapping;
    };
    _proto.navigateTo = function navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory) {
      let sTargetURLPromise, bIsStickyMode;
      if (oContext.getModel() && oContext.getModel().getMetaModel && oContext.getModel().getMetaModel()) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      if (!mParameterMapping) {
        // if there is no parameter mapping define this mean we rely entirely on the binding context path
        sTargetURLPromise = Promise.resolve(SemanticKeyHelper.getSemanticPath(oContext));
      } else {
        sTargetURLPromise = this.prepareParameters(mParameterMapping, sRouteName, oContext).then(mParameters => {
          return this.oRouter.getURL(sRouteName, mParameters);
        });
      }
      return sTargetURLPromise.then(sTargetURL => {
        this.oRouterProxy.navToHash(sTargetURL, bPreserveHistory, false, false, !bIsStickyMode);
      });
    }

    /**
     * Method to return a map of routing target parameters where the binding syntax is resolved to the current model.
     *
     * @param mParameters Parameters map in the format [k: string] : ComplexBindingSyntax
     * @param sTargetRoute Name of the target route
     * @param oContext The instance of the binding context
     * @returns A promise which resolves to the routing target parameters
     */;
    _proto.prepareParameters = function prepareParameters(mParameters, sTargetRoute, oContext) {
      let oParametersPromise;
      try {
        const sContextPath = oContext.getPath();
        const oMetaModel = oContext.getModel().getMetaModel();
        const aContextPathParts = sContextPath.split("/");
        const aAllResolvedParameterPromises = Object.keys(mParameters).map(sParameterKey => {
          const sParameterMappingExpression = mParameters[sParameterKey];
          // We assume the defined parameters will be compatible with a binding expression
          const oParsedExpression = BindingParser.complexParser(sParameterMappingExpression);
          const aParts = oParsedExpression.parts || [oParsedExpression];
          const aResolvedParameterPromises = aParts.map(function (oPathPart) {
            const aRelativeParts = oPathPart.path.split("../");
            // We go up the current context path as many times as necessary
            const aLocalParts = aContextPathParts.slice(0, aContextPathParts.length - aRelativeParts.length + 1);
            aLocalParts.push(aRelativeParts[aRelativeParts.length - 1]);
            const sPropertyPath = aLocalParts.join("/");
            const oMetaContext = oMetaModel.getMetaContext(sPropertyPath);
            return oContext.requestProperty(sPropertyPath).then(function (oValue) {
              const oPropertyInfo = oMetaContext.getObject();
              const sEdmType = oPropertyInfo.$Type;
              return ODataUtils.formatLiteral(oValue, sEdmType);
            });
          });
          return Promise.all(aResolvedParameterPromises).then(aResolvedParameters => {
            const value = oParsedExpression.formatter ? oParsedExpression.formatter.apply(this, aResolvedParameters) : aResolvedParameters.join("");
            return {
              key: sParameterKey,
              value: value
            };
          });
        });
        oParametersPromise = Promise.all(aAllResolvedParameterPromises).then(function (aAllResolvedParameters) {
          const oParameters = {};
          aAllResolvedParameters.forEach(function (oResolvedParameter) {
            oParameters[oResolvedParameter.key] = oResolvedParameter.value;
          });
          return oParameters;
        });
      } catch (oError) {
        Log.error(`Could not parse the parameters for the navigation to route ${sTargetRoute}`);
        oParametersPromise = Promise.resolve(undefined);
      }
      return oParametersPromise;
    };
    _proto._fireRouteMatchEvents = function _fireRouteMatchEvents(mParameters) {
      this.eventProvider.fireEvent("routeMatched", mParameters);
      this.eventProvider.fireEvent("afterRouteMatched", mParameters);
      EditState.cleanProcessedEditState(); // Reset UI state when all bindings have been refreshed
    }

    /**
     * Navigates to a context.
     *
     * @param oContext The Context to be navigated to
     * @param [mParameters] Optional, map containing the following attributes:
     * @param [mParameters.checkNoHashChange] Navigate to the context without changing the URL
     * @param [mParameters.asyncContext] The context is created async, navigate to (...) and
     *                    wait for Promise to be resolved and then navigate into the context
     * @param [mParameters.bDeferredContext] The context shall be created deferred at the target page
     * @param [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
     * @param [mParameters.bPersistOPScroll] The bPersistOPScroll will be used for scrolling to first tab
     * @param [mParameters.updateFCLLevel] `+1` if we add a column in FCL, `-1` to remove a column, 0 to stay on the same column
     * @param [mParameters.noPreservationCache] Do navigation without taking into account the preserved cache mechanism
     * @param [mParameters.bRecreateContext] Force re-creation of the context instead of using the one passed as parameter
     * @param [mParameters.bForceFocus] Forces focus selection after navigation
     * @param [oViewData] View data
     * @param [oCurrentTargetInfo] The target information from which the navigation is triggered
     * @returns Promise which is resolved once the navigation is triggered
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters, oViewData, oCurrentTargetInfo) {
      let sTargetRoute = "",
        oRouteParametersPromise,
        bIsStickyMode = false;
      if (oContext.getModel() && oContext.getModel().getMetaModel) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      // Manage parameter mapping
      if (mParameters && mParameters.targetPath && oViewData && oViewData.navigation) {
        const oRouteDetail = oViewData.navigation[mParameters.targetPath].detail;
        sTargetRoute = oRouteDetail.route;
        if (oRouteDetail.parameters) {
          oRouteParametersPromise = this.prepareParameters(oRouteDetail.parameters, sTargetRoute, oContext);
        }
      }
      let sTargetPath = this._getPathFromContext(oContext, mParameters);
      // If the path is empty, we're supposed to navigate to the first page of the app
      // Check if we need to exit from the app instead
      if (sTargetPath.length === 0 && this.bExitOnNavigateBackToRoot) {
        this.oRouterProxy.exitFromApp();
        return Promise.resolve(true);
      }

      // If the context is deferred or async, we add (...) to the path
      if (mParameters !== null && mParameters !== void 0 && mParameters.asyncContext || mParameters !== null && mParameters !== void 0 && mParameters.bDeferredContext) {
        sTargetPath += "(...)";
      }

      // Add layout parameter if needed
      const sLayout = this._calculateLayout(sTargetPath, mParameters);
      if (sLayout) {
        sTargetPath += `?layout=${sLayout}`;
      }

      // Navigation parameters for later usage
      const oNavigationInfo = {
        oAsyncContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.asyncContext,
        bDeferredContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDeferredContext,
        bTargetEditable: mParameters === null || mParameters === void 0 ? void 0 : mParameters.editable,
        bPersistOPScroll: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bPersistOPScroll,
        useContext: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.updateFCLLevel) === -1 || mParameters !== null && mParameters !== void 0 && mParameters.bRecreateContext ? undefined : oContext,
        bDraftNavigation: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDraftNavigation,
        bShowPlaceholder: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder) !== undefined ? mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder : true,
        reason: mParameters === null || mParameters === void 0 ? void 0 : mParameters.reason
      };
      if (mParameters !== null && mParameters !== void 0 && mParameters.checkNoHashChange) {
        // Check if the new hash is different from the current one
        const sCurrentHashNoAppState = this.oRouterProxy.getHash().replace(/[&?]{1}sap-iapp-state=[A-Z0-9]+/, "");
        if (sTargetPath === sCurrentHashNoAppState) {
          // The hash doesn't change, but we fire the routeMatch event to trigger page refresh / binding
          const mEventParameters = this.oRouter.getRouteInfoByHash(this.oRouterProxy.getHash());
          if (mEventParameters) {
            mEventParameters.navigationInfo = oNavigationInfo;
            mEventParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
            mEventParameters.routePattern = this.sCurrentRoutePattern;
            mEventParameters.views = this.aCurrentViews;
          }
          this.oRouterProxy.setFocusForced(!!mParameters.bForceFocus);
          this._fireRouteMatchEvents(mEventParameters);
          return Promise.resolve(true);
        }
      }
      if (mParameters !== null && mParameters !== void 0 && mParameters.transient && mParameters.editable == true && sTargetPath.indexOf("(...)") === -1) {
        if (sTargetPath.indexOf("?") > -1) {
          sTargetPath += "&i-action=create";
        } else {
          sTargetPath += "?i-action=create";
        }
      }

      // Clear unbound messages upon navigating from LR to OP
      // This is to ensure stale error messages from LR are not shown to the user after navigation to OP.
      if (oCurrentTargetInfo && oCurrentTargetInfo.name === "sap.fe.templates.ListReport") {
        const oRouteInfo = this.oRouter.getRouteInfoByHash(sTargetPath);
        if (oRouteInfo) {
          const oRoute = this._getRouteInformation(oRouteInfo.name);
          if (oRoute && oRoute.targets && oRoute.targets.length > 0) {
            const sLastTargetName = oRoute.targets[oRoute.targets.length - 1];
            const oTarget = this._getTargetInformation(sLastTargetName);
            if (oTarget && oTarget.name === "sap.fe.templates.ObjectPage") {
              messageHandling.removeUnboundTransitionMessages();
            }
          }
        }
      }

      // Add the navigation parameters in the queue
      this.navigationInfoQueue.push(oNavigationInfo);
      if (sTargetRoute && oRouteParametersPromise) {
        return oRouteParametersPromise.then(oRouteParameters => {
          oRouteParameters.bIsStickyMode = bIsStickyMode;
          this.oRouter.navTo(sTargetRoute, oRouteParameters);
          return Promise.resolve(true);
        });
      }
      return this.oRouterProxy.navToHash(sTargetPath, false, mParameters === null || mParameters === void 0 ? void 0 : mParameters.noPreservationCache, mParameters === null || mParameters === void 0 ? void 0 : mParameters.bForceFocus, !bIsStickyMode).then(bNavigated => {
        if (!bNavigated) {
          // The navigation did not happen --> remove the navigation parameters from the queue as they shouldn't be used
          this.navigationInfoQueue.pop();
        }
        return bNavigated;
      });
    }

    /**
     * Navigates to a route.
     *
     * @function
     * @name sap.fe.core.controllerextensions.Routing#navigateToRoute
     * @memberof sap.fe.core.controllerextensions.Routing
     * @static
     * @param sTargetRouteName Name of the target route
     * @param [oRouteParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oRouteParameters) {
      const sTargetURL = this.oRouter.getURL(sTargetRouteName, oRouteParameters);
      return this.oRouterProxy.navToHash(sTargetURL, undefined, undefined, undefined, !oRouteParameters.bIsStickyMode);
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext The context
     * @returns `true` or `false` if the current state is impacted or not
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      const sPath = oContext.getPath();

      // First, check with the technical path. We have to try it, because for level > 1, we
      // uses technical keys even if Semantic keys are enabled
      if (this.oRouterProxy.isCurrentStateImpactedBy(sPath)) {
        return true;
      } else if (/^[^()]+\([^()]+\)$/.test(sPath)) {
        // If the current path can be semantic (i.e. is like xxx(yyy))
        // check with the semantic path if we can find it
        let sSemanticPath;
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          // We have already resolved this semantic path
          sSemanticPath = this.oLastSemanticMapping.semanticPath;
        } else {
          sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext);
        }
        return sSemanticPath != sPath ? this.oRouterProxy.isCurrentStateImpactedBy(sSemanticPath) : false;
      } else {
        return false;
      }
    };
    _proto._findPathToNavigate = function _findPathToNavigate(sPath) {
      const regex = new RegExp("/[^/]*$");
      sPath = sPath.replace(regex, "");
      if (this.oRouter.match(sPath) || sPath === "") {
        return sPath;
      } else {
        return this._findPathToNavigate(sPath);
      }
    };
    _proto._checkIfContextSupportsSemanticPath = function _checkIfContextSupportsSemanticPath(oContext) {
      const sPath = oContext.getPath();

      // First, check if this is a level-1 object (path = /aaa(bbb))
      if (!/^\/[^(]+\([^)]+\)$/.test(sPath)) {
        return false;
      }

      // Then check if the entity has semantic keys
      const oMetaModel = oContext.getModel().getMetaModel();
      const sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name");
      if (!SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName)) {
        return false;
      }

      // Then check the entity is draft-enabled
      return ModelHelper.isDraftSupported(oMetaModel, sPath);
    };
    _proto._getPathFromContext = function _getPathFromContext(oContext, mParameters) {
      let sPath;
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding") && oContext.isRelative()) {
        sPath = oContext.getHeaderContext().getPath();
      } else {
        sPath = oContext.getPath();
      }
      if (mParameters.updateFCLLevel === -1) {
        // When navigating back from a context, we need to remove the last component of the path
        sPath = this._findPathToNavigate(sPath);

        // Check if we're navigating back to a semantic path that was previously resolved
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          sPath = this.oLastSemanticMapping.semanticPath;
        }
      } else if (this._checkIfContextSupportsSemanticPath(oContext)) {
        // We check if we have to use a semantic path
        const sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext, true);
        if (!sSemanticPath) {
          // We were not able to build the semantic path --> Use the technical path and
          // clear the previous mapping, otherwise the old mapping is used in EditFlow#updateDocument
          // and it leads to unwanted page reloads
          this.setLastSemanticMapping(undefined);
        } else if (sSemanticPath !== sPath) {
          // Store the mapping technical <-> semantic path to avoid recalculating it later
          // and use the semantic path instead of the technical one
          this.setLastSemanticMapping({
            technicalPath: sPath,
            semanticPath: sSemanticPath
          });
          sPath = sSemanticPath;
        }
      }

      // remove extra '/' at the beginning of path
      if (sPath[0] === "/") {
        sPath = sPath.substring(1);
      }
      return sPath;
    };
    _proto._calculateLayout = function _calculateLayout(sPath, mParameters) {
      let FCLLevel = mParameters.FCLLevel;
      if (mParameters.updateFCLLevel) {
        FCLLevel += mParameters.updateFCLLevel;
        if (FCLLevel < 0) {
          FCLLevel = 0;
        }
      }

      // When navigating back, try to find the layout in the navigation history if it's not provided as parameter
      // (layout calculation is not handled properly by the FlexibleColumnLayoutSemanticHelper in this case)
      if (mParameters.updateFCLLevel < 0 && !mParameters.sLayout) {
        mParameters.sLayout = this.oRouterProxy.findLayoutForHash(sPath);
      }
      return this.oAppComponent.getRootViewController().calculateLayout(FCLLevel, sPath, mParameters.sLayout, mParameters.keepCurrentLayout);
    }

    /**
     * Event handler before a route is matched.
     * Displays a busy indicator.
     *
     */;
    _proto._beforeRouteMatched = function _beforeRouteMatched( /*oEvent: Event*/
    ) {
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        const oRootView = this.oAppComponent.getRootControl();
        BusyLocker.lock(oRootView);
      }
    }

    /**
     * Event handler when a route is matched.
     * Hides the busy indicator and fires its own 'routematched' event.
     *
     * @param oEvent The event
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      const oAppStateHandler = this.oAppComponent.getAppStateHandler(),
        oRootView = this.oAppComponent.getRootControl();
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (BusyLocker.isLocked(oRootView) && !bPlaceholderEnabled) {
        BusyLocker.unlock(oRootView);
      }
      const mParameters = oEvent.getParameters();
      if (this.navigationInfoQueue.length) {
        mParameters.navigationInfo = this.navigationInfoQueue[0];
        this.navigationInfoQueue = this.navigationInfoQueue.slice(1);
      } else {
        mParameters.navigationInfo = {};
      }
      if (oAppStateHandler.checkIfRouteChangedByIApp()) {
        mParameters.navigationInfo.reason = NavigationReason.AppStateChanged;
        oAppStateHandler.resetRouteChangedByIApp();
      }
      this.sCurrentRouteName = oEvent.getParameter("name");
      this.sCurrentRoutePattern = mParameters.config.pattern;
      this.aCurrentViews = oEvent.getParameter("views");
      mParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
      mParameters.routePattern = this.sCurrentRoutePattern;
      this._fireRouteMatchEvents(mParameters);

      // Check if current hash has been set by the routerProxy.navToHash function
      // If not, rebuild history properly (both in the browser and the RouterProxy)
      if (!history.state || history.state.feLevel === undefined) {
        this.oRouterProxy.restoreHistory().then(() => {
          this.oRouterProxy.resolveRouteMatch();
        }).catch(function (oError) {
          Log.error("Error while restoring history", oError);
        });
      } else {
        this.oRouterProxy.resolveRouteMatch();
      }
    };
    _proto.attachRouteMatched = function attachRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("routeMatched", oData, fnFunction, oListener);
    };
    _proto.detachRouteMatched = function detachRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("routeMatched", fnFunction, oListener);
    };
    _proto.attachAfterRouteMatched = function attachAfterRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("afterRouteMatched", oData, fnFunction, oListener);
    };
    _proto.detachAfterRouteMatched = function detachAfterRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("afterRouteMatched", fnFunction, oListener);
    };
    _proto.getRouteFromHash = function getRouteFromHash(oRouter, oAppComponent) {
      const sHash = oRouter.getHashChanger().hash;
      const oRouteInfo = oRouter.getRouteInfoByHash(sHash);
      return oAppComponent.getMetadata().getManifestEntry("/sap.ui5/routing/routes").filter(function (oRoute) {
        return oRoute.name === oRouteInfo.name;
      })[0];
    };
    _proto.getTargetsFromRoute = function getTargetsFromRoute(oRoute) {
      const oTarget = oRoute.target;
      if (typeof oTarget === "string") {
        return [this._mTargets[oTarget]];
      } else {
        const aTarget = [];
        oTarget.forEach(sTarget => {
          aTarget.push(this._mTargets[sTarget]);
        });
        return aTarget;
      }
    };
    _proto.initializeRouting = async function initializeRouting() {
      // Attach router handlers
      await CollaborationHelper.processAndExpandHash();
      this._fnOnRouteMatched = this._onRouteMatched.bind(this);
      this.oRouter.attachRouteMatched(this._fnOnRouteMatched, this);
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        this.oRouter.attachBeforeRouteMatched(this._beforeRouteMatched.bind(this));
      }
      // Reset internal state
      this.navigationInfoQueue = [];
      EditState.resetEditState();
      this.bExitOnNavigateBackToRoot = !this.oRouter.match("");
      const bIsIappState = this.oRouter.getHashChanger().getHash().indexOf("sap-iapp-state") !== -1;
      try {
        const oStartupParameters = await this.oAppComponent.getStartupParameters();
        const bHasStartUpParameters = oStartupParameters !== undefined && Object.keys(oStartupParameters).length !== 0;
        const sHash = this.oRouter.getHashChanger().getHash();
        // Manage startup parameters (in case of no iapp-state)
        if (!bIsIappState && bHasStartUpParameters && !sHash) {
          if (oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("CREATE") !== -1) {
            // Create mode
            // This check will catch multiple modes like create, createWith and autoCreateWith which all need
            // to be handled like create startup!
            await this._manageCreateStartup(oStartupParameters);
          } else {
            // Deep link
            await this._manageDeepLinkStartup(oStartupParameters);
          }
        }
      } catch (oError) {
        Log.error("Error during routing initialization", oError);
      }
    };
    _proto.getDefaultCreateHash = function getDefaultCreateHash(oStartupParameters) {
      return AppStartupHelper.getDefaultCreateHash(oStartupParameters, this.getContextPath(), this.oRouter);
    };
    _proto._manageCreateStartup = function _manageCreateStartup(oStartupParameters) {
      return AppStartupHelper.getCreateStartupHash(oStartupParameters, this.getContextPath(), this.oRouter, this.oMetaModel).then(sNewHash => {
        if (sNewHash) {
          this.oRouter.getHashChanger().replaceHash(sNewHash);
          if (oStartupParameters !== null && oStartupParameters !== void 0 && oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("AUTOCREATE") !== -1) {
            this.oAppComponent.setStartupModeAutoCreate();
          } else {
            this.oAppComponent.setStartupModeCreate();
          }
          this.bExitOnNavigateBackToRoot = true;
        }
      });
    };
    _proto._manageDeepLinkStartup = function _manageDeepLinkStartup(oStartupParameters) {
      return AppStartupHelper.getDeepLinkStartupHash(this.oAppComponent.getManifest()["sap.ui5"].routing, oStartupParameters, this.oModel).then(oDeepLink => {
        let sHash;
        if (oDeepLink.context) {
          const sTechnicalPath = oDeepLink.context.getPath();
          const sSemanticPath = this._checkIfContextSupportsSemanticPath(oDeepLink.context) ? SemanticKeyHelper.getSemanticPath(oDeepLink.context) : sTechnicalPath;
          if (sSemanticPath !== sTechnicalPath) {
            // Store the mapping technical <-> semantic path to avoid recalculating it later
            // and use the semantic path instead of the technical one
            this.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sSemanticPath
            });
          }
          sHash = sSemanticPath.substring(1); // To remove the leading '/'
        } else if (oDeepLink.hash) {
          sHash = oDeepLink.hash;
        }
        if (sHash) {
          //Replace the hash with newly created hash
          this.oRouter.getHashChanger().replaceHash(sHash);
          this.oAppComponent.setStartupModeDeeplink();
        }
      });
    };
    _proto.getOutbounds = function getOutbounds() {
      return this.outbounds;
    }

    /**
     * Gets the name of the Draft root entity set or the sticky-enabled entity set.
     *
     * @returns The name of the root EntitySet
     * @ui5-restricted
     */;
    _proto.getContextPath = function getContextPath() {
      return this.sContextPath;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return RoutingService;
  }(Service);
  _exports.RoutingService = RoutingService;
  let RoutingServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(RoutingServiceFactory, _ServiceFactory);
    function RoutingServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = RoutingServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const oRoutingService = new RoutingService(oServiceContext);
      return oRoutingService.initPromise;
    };
    return RoutingServiceFactory;
  }(ServiceFactory);
  return RoutingServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb3V0aW5nU2VydmljZUV2ZW50aW5nIiwiZGVmaW5lVUk1Q2xhc3MiLCJldmVudCIsIkV2ZW50UHJvdmlkZXIiLCJSb3V0aW5nU2VydmljZSIsIm5hdmlnYXRpb25JbmZvUXVldWUiLCJpbml0Iiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwic2NvcGVUeXBlIiwib0FwcENvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwib01vZGVsIiwiZ2V0TW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1JvdXRlciIsImdldFJvdXRlciIsIm9Sb3V0ZXJQcm94eSIsImdldFJvdXRlclByb3h5IiwiZXZlbnRQcm92aWRlciIsIm9Sb3V0aW5nQ29uZmlnIiwiZ2V0TWFuaWZlc3RFbnRyeSIsInJvdXRpbmciLCJfcGFyc2VSb3V0aW5nQ29uZmlndXJhdGlvbiIsIm9BcHBDb25maWciLCJvdXRib3VuZHMiLCJjcm9zc05hdmlnYXRpb24iLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYmVmb3JlRXhpdCIsImRldGFjaFJvdXRlTWF0Y2hlZCIsIl9mbk9uUm91dGVNYXRjaGVkIiwiZmlyZUV2ZW50IiwiZXhpdCIsImRlc3Ryb3kiLCJpc0ZDTCIsImNvbmZpZyIsInJvdXRlckNsYXNzIiwiX21UYXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsInRhcmdldHMiLCJmb3JFYWNoIiwic1RhcmdldE5hbWUiLCJhc3NpZ24iLCJ0YXJnZXROYW1lIiwiY29udGV4dFBhdHRlcm4iLCJ1bmRlZmluZWQiLCJ2aWV3TGV2ZWwiLCJfZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4iLCJfbVJvdXRlcyIsInNSb3V0ZUtleSIsInJvdXRlcyIsIm9Sb3V0ZU1hbmlmZXN0SW5mbyIsImFSb3V0ZVRhcmdldHMiLCJBcnJheSIsImlzQXJyYXkiLCJ0YXJnZXQiLCJzUm91dGVOYW1lIiwibmFtZSIsInNSb3V0ZVBhdHRlcm4iLCJwYXR0ZXJuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIkxvZyIsIndhcm5pbmciLCJpUm91dGVMZXZlbCIsInJvdXRlTGV2ZWwiLCJpIiwic1BhcmVudFRhcmdldE5hbWUiLCJwYXJlbnQiLCJwdXNoIiwiRkNMTGV2ZWwiLCJjb250cm9sQWdncmVnYXRpb24iLCJhTGV2ZWwwUm91dGVOYW1lcyIsImFMZXZlbDFSb3V0ZU5hbWVzIiwic0RlZmF1bHRSb3V0ZU5hbWUiLCJzTmFtZSIsImlMZXZlbCIsInNEZWZhdWx0VGFyZ2V0TmFtZSIsInNsaWNlIiwic0NvbnRleHRQYXRoIiwib3B0aW9ucyIsInNldHRpbmdzIiwib1NldHRpbmdzIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJtYXAiLCJzVGFyZ2V0S2V5Iiwic29ydCIsImEiLCJiIiwiZnVsbENvbnRleHRQYXRoIiwibmF2aWdhdGlvbiIsInNOYXZOYW1lIiwidGFyZ2V0Um91dGUiLCJkZXRhaWwiLCJyb3V0ZSIsInN0YXJ0c1dpdGgiLCJzUGF0dGVybiIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2dldFJvdXRlSW5mb3JtYXRpb24iLCJfZ2V0VGFyZ2V0SW5mb3JtYXRpb24iLCJfZ2V0Q29tcG9uZW50SWQiLCJzT3duZXJJZCIsInNDb21wb25lbnRJZCIsInN1YnN0ciIsImdldFRhcmdldEluZm9ybWF0aW9uRm9yIiwib0NvbXBvbmVudEluc3RhbmNlIiwic1RhcmdldENvbXBvbmVudElkIiwiX3NPd25lcklkIiwiZ2V0SWQiLCJzQ29ycmVjdFRhcmdldE5hbWUiLCJpZCIsInZpZXdJZCIsImdldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTGFzdFNlbWFudGljTWFwcGluZyIsInNldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTWFwcGluZyIsIm5hdmlnYXRlVG8iLCJtUGFyYW1ldGVyTWFwcGluZyIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJzVGFyZ2V0VVJMUHJvbWlzZSIsImJJc1N0aWNreU1vZGUiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNQYXRoIiwicHJlcGFyZVBhcmFtZXRlcnMiLCJ0aGVuIiwibVBhcmFtZXRlcnMiLCJnZXRVUkwiLCJzVGFyZ2V0VVJMIiwibmF2VG9IYXNoIiwic1RhcmdldFJvdXRlIiwib1BhcmFtZXRlcnNQcm9taXNlIiwiZ2V0UGF0aCIsImFDb250ZXh0UGF0aFBhcnRzIiwic3BsaXQiLCJhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyIsInNQYXJhbWV0ZXJLZXkiLCJzUGFyYW1ldGVyTWFwcGluZ0V4cHJlc3Npb24iLCJvUGFyc2VkRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwiYVBhcnRzIiwicGFydHMiLCJhUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyIsIm9QYXRoUGFydCIsImFSZWxhdGl2ZVBhcnRzIiwicGF0aCIsImFMb2NhbFBhcnRzIiwic1Byb3BlcnR5UGF0aCIsImpvaW4iLCJvTWV0YUNvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsInJlcXVlc3RQcm9wZXJ0eSIsIm9WYWx1ZSIsIm9Qcm9wZXJ0eUluZm8iLCJnZXRPYmplY3QiLCJzRWRtVHlwZSIsIiRUeXBlIiwiT0RhdGFVdGlscyIsImZvcm1hdExpdGVyYWwiLCJhbGwiLCJhUmVzb2x2ZWRQYXJhbWV0ZXJzIiwidmFsdWUiLCJmb3JtYXR0ZXIiLCJhcHBseSIsImtleSIsImFBbGxSZXNvbHZlZFBhcmFtZXRlcnMiLCJvUGFyYW1ldGVycyIsIm9SZXNvbHZlZFBhcmFtZXRlciIsIm9FcnJvciIsImVycm9yIiwiX2ZpcmVSb3V0ZU1hdGNoRXZlbnRzIiwiRWRpdFN0YXRlIiwiY2xlYW5Qcm9jZXNzZWRFZGl0U3RhdGUiLCJuYXZpZ2F0ZVRvQ29udGV4dCIsIm9WaWV3RGF0YSIsIm9DdXJyZW50VGFyZ2V0SW5mbyIsIm9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlIiwidGFyZ2V0UGF0aCIsIm9Sb3V0ZURldGFpbCIsInBhcmFtZXRlcnMiLCJzVGFyZ2V0UGF0aCIsIl9nZXRQYXRoRnJvbUNvbnRleHQiLCJiRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290IiwiZXhpdEZyb21BcHAiLCJhc3luY0NvbnRleHQiLCJiRGVmZXJyZWRDb250ZXh0Iiwic0xheW91dCIsIl9jYWxjdWxhdGVMYXlvdXQiLCJvTmF2aWdhdGlvbkluZm8iLCJvQXN5bmNDb250ZXh0IiwiYlRhcmdldEVkaXRhYmxlIiwiZWRpdGFibGUiLCJiUGVyc2lzdE9QU2Nyb2xsIiwidXNlQ29udGV4dCIsInVwZGF0ZUZDTExldmVsIiwiYlJlY3JlYXRlQ29udGV4dCIsImJEcmFmdE5hdmlnYXRpb24iLCJiU2hvd1BsYWNlaG9sZGVyIiwic2hvd1BsYWNlaG9sZGVyIiwicmVhc29uIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJzQ3VycmVudEhhc2hOb0FwcFN0YXRlIiwiZ2V0SGFzaCIsIm1FdmVudFBhcmFtZXRlcnMiLCJnZXRSb3V0ZUluZm9CeUhhc2giLCJuYXZpZ2F0aW9uSW5mbyIsInJvdXRlSW5mb3JtYXRpb24iLCJzQ3VycmVudFJvdXRlTmFtZSIsInJvdXRlUGF0dGVybiIsInNDdXJyZW50Um91dGVQYXR0ZXJuIiwidmlld3MiLCJhQ3VycmVudFZpZXdzIiwic2V0Rm9jdXNGb3JjZWQiLCJiRm9yY2VGb2N1cyIsInRyYW5zaWVudCIsIm9Sb3V0ZUluZm8iLCJvUm91dGUiLCJzTGFzdFRhcmdldE5hbWUiLCJvVGFyZ2V0IiwibWVzc2FnZUhhbmRsaW5nIiwicmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsIm9Sb3V0ZVBhcmFtZXRlcnMiLCJuYXZUbyIsIm5vUHJlc2VydmF0aW9uQ2FjaGUiLCJiTmF2aWdhdGVkIiwicG9wIiwibmF2aWdhdGVUb1JvdXRlIiwic1RhcmdldFJvdXRlTmFtZSIsImlzQ3VycmVudFN0YXRlSW1wYWN0ZWRCeSIsInNQYXRoIiwidGVzdCIsInNTZW1hbnRpY1BhdGgiLCJ0ZWNobmljYWxQYXRoIiwic2VtYW50aWNQYXRoIiwiX2ZpbmRQYXRoVG9OYXZpZ2F0ZSIsIl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoIiwic0VudGl0eVNldE5hbWUiLCJnZXRTZW1hbnRpY0tleXMiLCJpc0RyYWZ0U3VwcG9ydGVkIiwiaXNBIiwiaXNSZWxhdGl2ZSIsImdldEhlYWRlckNvbnRleHQiLCJzdWJzdHJpbmciLCJmaW5kTGF5b3V0Rm9ySGFzaCIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImNhbGN1bGF0ZUxheW91dCIsImtlZXBDdXJyZW50TGF5b3V0IiwiX2JlZm9yZVJvdXRlTWF0Y2hlZCIsImJQbGFjZWhvbGRlckVuYWJsZWQiLCJQbGFjZWhvbGRlciIsImlzUGxhY2Vob2xkZXJFbmFibGVkIiwib1Jvb3RWaWV3IiwiZ2V0Um9vdENvbnRyb2wiLCJCdXN5TG9ja2VyIiwibG9jayIsIl9vblJvdXRlTWF0Y2hlZCIsIm9FdmVudCIsIm9BcHBTdGF0ZUhhbmRsZXIiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJpc0xvY2tlZCIsInVubG9jayIsImdldFBhcmFtZXRlcnMiLCJjaGVja0lmUm91dGVDaGFuZ2VkQnlJQXBwIiwiTmF2aWdhdGlvblJlYXNvbiIsIkFwcFN0YXRlQ2hhbmdlZCIsInJlc2V0Um91dGVDaGFuZ2VkQnlJQXBwIiwiZ2V0UGFyYW1ldGVyIiwiaGlzdG9yeSIsInN0YXRlIiwiZmVMZXZlbCIsInJlc3RvcmVIaXN0b3J5IiwicmVzb2x2ZVJvdXRlTWF0Y2giLCJjYXRjaCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIm9EYXRhIiwiZm5GdW5jdGlvbiIsIm9MaXN0ZW5lciIsImF0dGFjaEV2ZW50IiwiZGV0YWNoRXZlbnQiLCJhdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsImRldGFjaEFmdGVyUm91dGVNYXRjaGVkIiwiZ2V0Um91dGVGcm9tSGFzaCIsInNIYXNoIiwiZ2V0SGFzaENoYW5nZXIiLCJoYXNoIiwiZ2V0TWV0YWRhdGEiLCJmaWx0ZXIiLCJnZXRUYXJnZXRzRnJvbVJvdXRlIiwiYVRhcmdldCIsInNUYXJnZXQiLCJpbml0aWFsaXplUm91dGluZyIsIkNvbGxhYm9yYXRpb25IZWxwZXIiLCJwcm9jZXNzQW5kRXhwYW5kSGFzaCIsImJpbmQiLCJhdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQiLCJyZXNldEVkaXRTdGF0ZSIsImJJc0lhcHBTdGF0ZSIsIm9TdGFydHVwUGFyYW1ldGVycyIsImdldFN0YXJ0dXBQYXJhbWV0ZXJzIiwiYkhhc1N0YXJ0VXBQYXJhbWV0ZXJzIiwicHJlZmVycmVkTW9kZSIsInRvVXBwZXJDYXNlIiwiX21hbmFnZUNyZWF0ZVN0YXJ0dXAiLCJfbWFuYWdlRGVlcExpbmtTdGFydHVwIiwiZ2V0RGVmYXVsdENyZWF0ZUhhc2giLCJBcHBTdGFydHVwSGVscGVyIiwiZ2V0Q29udGV4dFBhdGgiLCJnZXRDcmVhdGVTdGFydHVwSGFzaCIsInNOZXdIYXNoIiwicmVwbGFjZUhhc2giLCJzZXRTdGFydHVwTW9kZUF1dG9DcmVhdGUiLCJzZXRTdGFydHVwTW9kZUNyZWF0ZSIsImdldERlZXBMaW5rU3RhcnR1cEhhc2giLCJnZXRNYW5pZmVzdCIsIm9EZWVwTGluayIsImNvbnRleHQiLCJzVGVjaG5pY2FsUGF0aCIsInNldFN0YXJ0dXBNb2RlRGVlcGxpbmsiLCJnZXRPdXRib3VuZHMiLCJnZXRJbnRlcmZhY2UiLCJTZXJ2aWNlIiwiUm91dGluZ1NlcnZpY2VGYWN0b3J5IiwiY3JlYXRlSW5zdGFuY2UiLCJvU2VydmljZUNvbnRleHQiLCJvUm91dGluZ1NlcnZpY2UiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUm91dGluZ1NlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGxhY2Vob2xkZXJcIjtcbmltcG9ydCBOYXZpZ2F0aW9uUmVhc29uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL05hdmlnYXRpb25SZWFzb25cIjtcbmltcG9ydCB0eXBlIFJvdXRlclByb3h5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL1JvdXRlclByb3h5XCI7XG5pbXBvcnQgQXBwU3RhcnR1cEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9BcHBTdGFydHVwSGVscGVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXZlbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBTZW1hbnRpY0tleUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TZW1hbnRpY0tleUhlbHBlclwiO1xuaW1wb3J0IENvbGxhYm9yYXRpb25IZWxwZXIgZnJvbSBcInNhcC9zdWl0ZS91aS9jb21tb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkhlbHBlclwiO1xuaW1wb3J0IEJpbmRpbmdQYXJzZXIgZnJvbSBcInNhcC91aS9iYXNlL0JpbmRpbmdQYXJzZXJcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IEV2ZW50UHJvdmlkZXIgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50UHJvdmlkZXJcIjtcbmltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFVdGlscyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbnR5cGUgUm91dGluZ1NlcnZpY2VTZXR0aW5ncyA9IHt9O1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuc2VydmljZXMuUm91dGluZ1NlcnZpY2VFdmVudGluZ1wiKVxuY2xhc3MgUm91dGluZ1NlcnZpY2VFdmVudGluZyBleHRlbmRzIEV2ZW50UHJvdmlkZXIge1xuXHRAZXZlbnQoKVxuXHRyb3V0ZU1hdGNoZWQhOiBGdW5jdGlvbjtcblxuXHRAZXZlbnQoKVxuXHRhZnRlclJvdXRlTWF0Y2hlZCE6IEZ1bmN0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBTZW1hbnRpY01hcHBpbmcgPSB7XG5cdHNlbWFudGljUGF0aDogc3RyaW5nO1xuXHR0ZWNobmljYWxQYXRoOiBzdHJpbmc7XG59O1xuZXhwb3J0IGNsYXNzIFJvdXRpbmdTZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxSb3V0aW5nU2VydmljZVNldHRpbmdzPiB7XG5cdG9BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0b01vZGVsITogT0RhdGFNb2RlbDtcblxuXHRvTWV0YU1vZGVsITogT0RhdGFNZXRhTW9kZWw7XG5cblx0b1JvdXRlciE6IFJvdXRlcjtcblxuXHRvUm91dGVyUHJveHkhOiBSb3V0ZXJQcm94eTtcblxuXHRldmVudFByb3ZpZGVyITogRXZlbnRQcm92aWRlcjtcblxuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55PjtcblxuXHRvdXRib3VuZHM6IGFueTtcblxuXHRfbVRhcmdldHM6IGFueTtcblxuXHRfbVJvdXRlczogYW55O1xuXG5cdG9MYXN0U2VtYW50aWNNYXBwaW5nPzogU2VtYW50aWNNYXBwaW5nO1xuXG5cdGJFeGl0T25OYXZpZ2F0ZUJhY2tUb1Jvb3Q/OiBib29sZWFuO1xuXG5cdHNDdXJyZW50Um91dGVOYW1lPzogc3RyaW5nO1xuXG5cdHNDdXJyZW50Um91dGVQYXR0ZXJuPzogc3RyaW5nO1xuXG5cdGFDdXJyZW50Vmlld3M/OiBhbnlbXTtcblxuXHRuYXZpZ2F0aW9uSW5mb1F1ZXVlOiBhbnlbXSA9IFtdO1xuXG5cdHNDb250ZXh0UGF0aCE6IHN0cmluZztcblxuXHRfZm5PblJvdXRlTWF0Y2hlZCE6IEZ1bmN0aW9uO1xuXG5cdGluaXQoKSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldENvbnRleHQoKTtcblx0XHRpZiAob0NvbnRleHQuc2NvcGVUeXBlID09PSBcImNvbXBvbmVudFwiKSB7XG5cdFx0XHR0aGlzLm9BcHBDb21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdDtcblx0XHRcdHRoaXMub01vZGVsID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbDtcblx0XHRcdHRoaXMub01ldGFNb2RlbCA9IHRoaXMub01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0dGhpcy5vUm91dGVyID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldFJvdXRlcigpO1xuXHRcdFx0dGhpcy5vUm91dGVyUHJveHkgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKTtcblx0XHRcdHRoaXMuZXZlbnRQcm92aWRlciA9IG5ldyAoUm91dGluZ1NlcnZpY2VFdmVudGluZyBhcyBhbnkpKCk7XG5cblx0XHRcdGNvbnN0IG9Sb3V0aW5nQ29uZmlnID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCJzYXAudWk1XCIpLnJvdXRpbmc7XG5cdFx0XHR0aGlzLl9wYXJzZVJvdXRpbmdDb25maWd1cmF0aW9uKG9Sb3V0aW5nQ29uZmlnKTtcblxuXHRcdFx0Y29uc3Qgb0FwcENvbmZpZyA9IHRoaXMub0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKTtcblx0XHRcdHRoaXMub3V0Ym91bmRzID0gb0FwcENvbmZpZy5jcm9zc05hdmlnYXRpb24/Lm91dGJvdW5kcztcblx0XHR9XG5cblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG5cblx0YmVmb3JlRXhpdCgpIHtcblx0XHR0aGlzLm9Sb3V0ZXIuZGV0YWNoUm91dGVNYXRjaGVkKHRoaXMuX2ZuT25Sb3V0ZU1hdGNoZWQsIHRoaXMpO1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJyb3V0ZU1hdGNoZWRcIiwge30pO1xuXHR9XG5cblx0ZXhpdCgpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZGVzdHJveSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgbWFuaWZlc3Qgcm91dGluZyBjb25maWd1cmF0aW9uIGZvciBpbnRlcm5hbCB1c2FnZS5cblx0ICpcblx0ICogQHBhcmFtIG9Sb3V0aW5nQ29uZmlnIFRoZSByb3V0aW5nIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgbWFuaWZlc3Rcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9wYXJzZVJvdXRpbmdDb25maWd1cmF0aW9uKG9Sb3V0aW5nQ29uZmlnOiBhbnkpIHtcblx0XHRjb25zdCBpc0ZDTCA9IG9Sb3V0aW5nQ29uZmlnPy5jb25maWc/LnJvdXRlckNsYXNzID09PSBcInNhcC5mLnJvdXRpbmcuUm91dGVyXCI7XG5cblx0XHQvLyBJbmZvcm1hdGlvbiBvZiB0YXJnZXRzXG5cdFx0dGhpcy5fbVRhcmdldHMgPSB7fTtcblx0XHRPYmplY3Qua2V5cyhvUm91dGluZ0NvbmZpZy50YXJnZXRzKS5mb3JFYWNoKChzVGFyZ2V0TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0gPSBPYmplY3QuYXNzaWduKHsgdGFyZ2V0TmFtZTogc1RhcmdldE5hbWUgfSwgb1JvdXRpbmdDb25maWcudGFyZ2V0c1tzVGFyZ2V0TmFtZV0pO1xuXG5cdFx0XHQvLyBWaWV3IGxldmVsIGZvciBGQ0wgY2FzZXMgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSB0YXJnZXQgcGF0dGVyblxuXHRcdFx0aWYgKHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5jb250ZXh0UGF0dGVybiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS52aWV3TGV2ZWwgPSB0aGlzLl9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybih0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm4sIDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gSW5mb3JtYXRpb24gb2Ygcm91dGVzXG5cdFx0dGhpcy5fbVJvdXRlcyA9IHt9O1xuXHRcdGZvciAoY29uc3Qgc1JvdXRlS2V5IGluIG9Sb3V0aW5nQ29uZmlnLnJvdXRlcykge1xuXHRcdFx0Y29uc3Qgb1JvdXRlTWFuaWZlc3RJbmZvID0gb1JvdXRpbmdDb25maWcucm91dGVzW3NSb3V0ZUtleV0sXG5cdFx0XHRcdGFSb3V0ZVRhcmdldHMgPSBBcnJheS5pc0FycmF5KG9Sb3V0ZU1hbmlmZXN0SW5mby50YXJnZXQpID8gb1JvdXRlTWFuaWZlc3RJbmZvLnRhcmdldCA6IFtvUm91dGVNYW5pZmVzdEluZm8udGFyZ2V0XSxcblx0XHRcdFx0c1JvdXRlTmFtZSA9IEFycmF5LmlzQXJyYXkob1JvdXRpbmdDb25maWcucm91dGVzKSA/IG9Sb3V0ZU1hbmlmZXN0SW5mby5uYW1lIDogc1JvdXRlS2V5LFxuXHRcdFx0XHRzUm91dGVQYXR0ZXJuID0gb1JvdXRlTWFuaWZlc3RJbmZvLnBhdHRlcm47XG5cblx0XHRcdC8vIENoZWNrIHJvdXRlIHBhdHRlcm46IGFsbCBwYXR0ZXJucyBuZWVkIHRvIGVuZCB3aXRoICc6P3F1ZXJ5OicsIHRoYXQgd2UgdXNlIGZvciBwYXJhbWV0ZXJzXG5cdFx0XHRpZiAoc1JvdXRlUGF0dGVybi5sZW5ndGggPCA4IHx8IHNSb3V0ZVBhdHRlcm4uaW5kZXhPZihcIjo/cXVlcnk6XCIpICE9PSBzUm91dGVQYXR0ZXJuLmxlbmd0aCAtIDgpIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoYFBhdHRlcm4gZm9yIHJvdXRlICR7c1JvdXRlTmFtZX0gZG9lc24ndCBlbmQgd2l0aCAnOj9xdWVyeTonIDogJHtzUm91dGVQYXR0ZXJufWApO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgaVJvdXRlTGV2ZWwgPSB0aGlzLl9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybihzUm91dGVQYXR0ZXJuLCAwKTtcblx0XHRcdHRoaXMuX21Sb3V0ZXNbc1JvdXRlTmFtZV0gPSB7XG5cdFx0XHRcdG5hbWU6IHNSb3V0ZU5hbWUsXG5cdFx0XHRcdHBhdHRlcm46IHNSb3V0ZVBhdHRlcm4sXG5cdFx0XHRcdHRhcmdldHM6IGFSb3V0ZVRhcmdldHMsXG5cdFx0XHRcdHJvdXRlTGV2ZWw6IGlSb3V0ZUxldmVsXG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBBZGQgdGhlIHBhcmVudCB0YXJnZXRzIGluIHRoZSBsaXN0IG9mIHRhcmdldHMgZm9yIHRoZSByb3V0ZVxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUm91dGVUYXJnZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHNQYXJlbnRUYXJnZXROYW1lID0gdGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1tpXV0ucGFyZW50O1xuXHRcdFx0XHRpZiAoc1BhcmVudFRhcmdldE5hbWUpIHtcblx0XHRcdFx0XHRhUm91dGVUYXJnZXRzLnB1c2goc1BhcmVudFRhcmdldE5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICghaXNGQ0wpIHtcblx0XHRcdFx0Ly8gVmlldyBsZXZlbCBmb3Igbm9uLUZDTCBjYXNlcyBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIHJvdXRlIHBhdHRlcm5cblx0XHRcdFx0aWYgKHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbMF1dLnZpZXdMZXZlbCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbMF1dLnZpZXdMZXZlbCA8IGlSb3V0ZUxldmVsKSB7XG5cdFx0XHRcdFx0Ly8gVGhlcmUgYXJlIGNhc2VzIHdoZW4gZGlmZmVyZW50IHJvdXRlcyBwb2ludCB0byB0aGUgc2FtZSB0YXJnZXQuIFdlIHRha2UgdGhlXG5cdFx0XHRcdFx0Ly8gbGFyZ2VzdCB2aWV3TGV2ZWwgaW4gdGhhdCBjYXNlLlxuXHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbMF1dLnZpZXdMZXZlbCA9IGlSb3V0ZUxldmVsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gRkNMIGxldmVsIGZvciBub24tRkNMIGNhc2VzIGlzIGVxdWFsIHRvIC0xXG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbMF1dLkZDTExldmVsID0gLTE7XG5cdFx0XHR9IGVsc2UgaWYgKGFSb3V0ZVRhcmdldHMubGVuZ3RoID09PSAxICYmIHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbMF1dLmNvbnRyb2xBZ2dyZWdhdGlvbiAhPT0gXCJiZWdpbkNvbHVtblBhZ2VzXCIpIHtcblx0XHRcdFx0Ly8gV2UncmUgaW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUncyBvbmx5IDEgdGFyZ2V0IGZvciB0aGUgcm91dGUsIGFuZCBpdCdzIG5vdCBpbiB0aGUgZmlyc3QgY29sdW1uXG5cdFx0XHRcdC8vIC0tPiB0aGlzIGlzIGEgZnVsbHNjcmVlbiBjb2x1bW4gYWZ0ZXIgYWxsIGNvbHVtbnMgaW4gdGhlIEZDTCBoYXZlIGJlZW4gdXNlZFxuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzWzBdXS5GQ0xMZXZlbCA9IDM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBPdGhlciBGQ0wgY2FzZXNcblx0XHRcdFx0YVJvdXRlVGFyZ2V0cy5mb3JFYWNoKChzVGFyZ2V0TmFtZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uY29udHJvbEFnZ3JlZ2F0aW9uKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYmVnaW5Db2x1bW5QYWdlc1wiOlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uRkNMTGV2ZWwgPSAwO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdFx0Y2FzZSBcIm1pZENvbHVtblBhZ2VzXCI6XG5cdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5GQ0xMZXZlbCA9IDE7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uRkNMTGV2ZWwgPSAyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUHJvcGFnYXRlIHZpZXdMZXZlbCwgY29udGV4dFBhdHRlcm4sIEZDTExldmVsIGFuZCBjb250cm9sQWdncmVnYXRpb24gdG8gcGFyZW50IHRhcmdldHNcblx0XHRPYmplY3Qua2V5cyh0aGlzLl9tVGFyZ2V0cykuZm9yRWFjaCgoc1RhcmdldE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0d2hpbGUgKHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5wYXJlbnQpIHtcblx0XHRcdFx0Y29uc3Qgc1BhcmVudFRhcmdldE5hbWUgPSB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ucGFyZW50O1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0udmlld0xldmVsID1cblx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0udmlld0xldmVsIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS52aWV3TGV2ZWw7XG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5jb250ZXh0UGF0dGVybiA9XG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLmNvbnRleHRQYXR0ZXJuIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5jb250ZXh0UGF0dGVybjtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLkZDTExldmVsID1cblx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uRkNMTGV2ZWwgfHwgdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLkZDTExldmVsO1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uY29udHJvbEFnZ3JlZ2F0aW9uID1cblx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uY29udHJvbEFnZ3JlZ2F0aW9uIHx8IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5jb250cm9sQWdncmVnYXRpb247XG5cdFx0XHRcdHNUYXJnZXROYW1lID0gc1BhcmVudFRhcmdldE5hbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBEZXRlcm1pbmUgdGhlIHJvb3QgZW50aXR5IGZvciB0aGUgYXBwXG5cdFx0Y29uc3QgYUxldmVsMFJvdXRlTmFtZXMgPSBbXTtcblx0XHRjb25zdCBhTGV2ZWwxUm91dGVOYW1lcyA9IFtdO1xuXHRcdGxldCBzRGVmYXVsdFJvdXRlTmFtZTtcblxuXHRcdGZvciAoY29uc3Qgc05hbWUgaW4gdGhpcy5fbVJvdXRlcykge1xuXHRcdFx0Y29uc3QgaUxldmVsID0gdGhpcy5fbVJvdXRlc1tzTmFtZV0ucm91dGVMZXZlbDtcblx0XHRcdGlmIChpTGV2ZWwgPT09IDApIHtcblx0XHRcdFx0YUxldmVsMFJvdXRlTmFtZXMucHVzaChzTmFtZSk7XG5cdFx0XHR9IGVsc2UgaWYgKGlMZXZlbCA9PT0gMSkge1xuXHRcdFx0XHRhTGV2ZWwxUm91dGVOYW1lcy5wdXNoKHNOYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoYUxldmVsMFJvdXRlTmFtZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRzRGVmYXVsdFJvdXRlTmFtZSA9IGFMZXZlbDBSb3V0ZU5hbWVzWzBdO1xuXHRcdH0gZWxzZSBpZiAoYUxldmVsMVJvdXRlTmFtZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRzRGVmYXVsdFJvdXRlTmFtZSA9IGFMZXZlbDFSb3V0ZU5hbWVzWzBdO1xuXHRcdH1cblxuXHRcdGlmIChzRGVmYXVsdFJvdXRlTmFtZSkge1xuXHRcdFx0Y29uc3Qgc0RlZmF1bHRUYXJnZXROYW1lID0gdGhpcy5fbVJvdXRlc1tzRGVmYXVsdFJvdXRlTmFtZV0udGFyZ2V0cy5zbGljZSgtMSlbMF07XG5cdFx0XHR0aGlzLnNDb250ZXh0UGF0aCA9IFwiXCI7XG5cdFx0XHRpZiAodGhpcy5fbVRhcmdldHNbc0RlZmF1bHRUYXJnZXROYW1lXS5vcHRpb25zICYmIHRoaXMuX21UYXJnZXRzW3NEZWZhdWx0VGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncykge1xuXHRcdFx0XHRjb25zdCBvU2V0dGluZ3MgPSB0aGlzLl9tVGFyZ2V0c1tzRGVmYXVsdFRhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3M7XG5cdFx0XHRcdHRoaXMuc0NvbnRleHRQYXRoID0gb1NldHRpbmdzLmNvbnRleHRQYXRoIHx8IGAvJHtvU2V0dGluZ3MuZW50aXR5U2V0fWA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXRoaXMuc0NvbnRleHRQYXRoKSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdGBDYW5ub3QgZGV0ZXJtaW5lIGRlZmF1bHQgY29udGV4dFBhdGg6IGNvbnRleHRQYXRoIG9yIGVudGl0eVNldCBtaXNzaW5nIGluIGRlZmF1bHQgdGFyZ2V0OiAke3NEZWZhdWx0VGFyZ2V0TmFtZX1gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy53YXJuaW5nKFwiQ2Fubm90IGRldGVybWluZSBkZWZhdWx0IGNvbnRleHRQYXRoOiBubyBkZWZhdWx0IHJvdXRlIGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHQvLyBXZSBuZWVkIHRvIGVzdGFibGlzaCB0aGUgY29ycmVjdCBwYXRoIHRvIHRoZSBkaWZmZXJlbnQgcGFnZXMsIGluY2x1ZGluZyB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0T2JqZWN0LmtleXModGhpcy5fbVRhcmdldHMpXG5cdFx0XHQubWFwKChzVGFyZ2V0S2V5OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX21UYXJnZXRzW3NUYXJnZXRLZXldO1xuXHRcdFx0fSlcblx0XHRcdC5zb3J0KChhOiBhbnksIGI6IGFueSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYS52aWV3TGV2ZWwgPCBiLnZpZXdMZXZlbCA/IC0xIDogMTtcblx0XHRcdH0pXG5cdFx0XHQuZm9yRWFjaCgodGFyZ2V0OiBhbnkpID0+IHtcblx0XHRcdFx0Ly8gQWZ0ZXIgc29ydGluZyB0aGUgdGFyZ2V0cyBwZXIgbGV2ZWwgd2UgY2FuIHRoZW4gZ28gdGhyb3VnaCB0aGVpciBuYXZpZ2F0aW9uIG9iamVjdCBhbmQgdXBkYXRlIHRoZSBwYXRocyBhY2NvcmRpbmdseS5cblx0XHRcdFx0aWYgKHRhcmdldC5vcHRpb25zKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2V0dGluZ3MgPSB0YXJnZXQub3B0aW9ucy5zZXR0aW5ncztcblx0XHRcdFx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBzZXR0aW5ncy5jb250ZXh0UGF0aCB8fCAoc2V0dGluZ3MuZW50aXR5U2V0ID8gYC8ke3NldHRpbmdzLmVudGl0eVNldH1gIDogXCJcIik7XG5cdFx0XHRcdFx0aWYgKCFzZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggJiYgc0NvbnRleHRQYXRoKSB7XG5cdFx0XHRcdFx0XHRzZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggPSBgJHtzQ29udGV4dFBhdGh9L2A7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKHNldHRpbmdzLm5hdmlnYXRpb24gfHwge30pLmZvckVhY2goKHNOYXZOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRSb3V0ZSA9IHRoaXMuX21Sb3V0ZXNbc2V0dGluZ3MubmF2aWdhdGlvbltzTmF2TmFtZV0uZGV0YWlsLnJvdXRlXTtcblx0XHRcdFx0XHRcdGlmICh0YXJnZXRSb3V0ZSAmJiB0YXJnZXRSb3V0ZS50YXJnZXRzKSB7XG5cdFx0XHRcdFx0XHRcdHRhcmdldFJvdXRlLnRhcmdldHMuZm9yRWFjaCgoc1RhcmdldE5hbWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5vcHRpb25zICYmXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0IXRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aFxuXHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRhcmdldC52aWV3TGV2ZWwgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MuZnVsbENvbnRleHRQYXRoID0gYCR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KHNOYXZOYW1lLnN0YXJ0c1dpdGgoXCIvXCIpID8gXCJcIiA6IFwiL1wiKSArIHNOYXZOYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0vYDtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aCA9IGAke1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aCArIHNOYXZOYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0vYDtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGVzIGEgdmlldyBsZXZlbCBmcm9tIGEgcGF0dGVybiBieSBjb3VudGluZyB0aGUgbnVtYmVyIG9mIHNlZ21lbnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdHRlcm4gVGhlIHBhdHRlcm5cblx0ICogQHBhcmFtIHZpZXdMZXZlbCBUaGUgY3VycmVudCBsZXZlbCBvZiB2aWV3XG5cdCAqIEByZXR1cm5zIFRoZSBsZXZlbFxuXHQgKi9cblx0X2dldFZpZXdMZXZlbEZyb21QYXR0ZXJuKHNQYXR0ZXJuOiBzdHJpbmcsIHZpZXdMZXZlbDogbnVtYmVyKTogbnVtYmVyIHtcblx0XHRzUGF0dGVybiA9IHNQYXR0ZXJuLnJlcGxhY2UoXCI6P3F1ZXJ5OlwiLCBcIlwiKTtcblx0XHRjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoXCIvW14vXSokXCIpO1xuXHRcdGlmIChzUGF0dGVybiAmJiBzUGF0dGVyblswXSAhPT0gXCIvXCIgJiYgc1BhdHRlcm5bMF0gIT09IFwiP1wiKSB7XG5cdFx0XHRzUGF0dGVybiA9IGAvJHtzUGF0dGVybn1gO1xuXHRcdH1cblx0XHRpZiAoc1BhdHRlcm4ubGVuZ3RoKSB7XG5cdFx0XHRzUGF0dGVybiA9IHNQYXR0ZXJuLnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXHRcdFx0aWYgKHRoaXMub1JvdXRlci5tYXRjaChzUGF0dGVybikgfHwgc1BhdHRlcm4gPT09IFwiXCIpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldFZpZXdMZXZlbEZyb21QYXR0ZXJuKHNQYXR0ZXJuLCArK3ZpZXdMZXZlbCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4oc1BhdHRlcm4sIHZpZXdMZXZlbCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB2aWV3TGV2ZWw7XG5cdFx0fVxuXHR9XG5cblx0X2dldFJvdXRlSW5mb3JtYXRpb24oc1JvdXRlTmFtZTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX21Sb3V0ZXNbc1JvdXRlTmFtZV07XG5cdH1cblxuXHRfZ2V0VGFyZ2V0SW5mb3JtYXRpb24oc1RhcmdldE5hbWU6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV07XG5cdH1cblxuXHRfZ2V0Q29tcG9uZW50SWQoc093bmVySWQ6IGFueSwgc0NvbXBvbmVudElkOiBhbnkpIHtcblx0XHRpZiAoc0NvbXBvbmVudElkLmluZGV4T2YoYCR7c093bmVySWR9LS0tYCkgPT09IDApIHtcblx0XHRcdHJldHVybiBzQ29tcG9uZW50SWQuc3Vic3RyKHNPd25lcklkLmxlbmd0aCArIDMpO1xuXHRcdH1cblx0XHRyZXR1cm4gc0NvbXBvbmVudElkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0YXJnZXQgaW5mb3JtYXRpb24gZm9yIGEgZ2l2ZW4gY29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbXBvbmVudEluc3RhbmNlIEluc3RhbmNlIG9mIHRoZSBjb21wb25lbnRcblx0ICogQHJldHVybnMgVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSB0YXJnZXRcblx0ICovXG5cdGdldFRhcmdldEluZm9ybWF0aW9uRm9yKG9Db21wb25lbnRJbnN0YW5jZTogYW55KSB7XG5cdFx0Y29uc3Qgc1RhcmdldENvbXBvbmVudElkID0gdGhpcy5fZ2V0Q29tcG9uZW50SWQob0NvbXBvbmVudEluc3RhbmNlLl9zT3duZXJJZCwgb0NvbXBvbmVudEluc3RhbmNlLmdldElkKCkpO1xuXHRcdGxldCBzQ29ycmVjdFRhcmdldE5hbWUgPSBudWxsO1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuX21UYXJnZXRzKS5mb3JFYWNoKChzVGFyZ2V0TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmlkID09PSBzVGFyZ2V0Q29tcG9uZW50SWQgfHwgdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLnZpZXdJZCA9PT0gc1RhcmdldENvbXBvbmVudElkKSB7XG5cdFx0XHRcdHNDb3JyZWN0VGFyZ2V0TmFtZSA9IHNUYXJnZXROYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB0aGlzLl9nZXRUYXJnZXRJbmZvcm1hdGlvbihzQ29ycmVjdFRhcmdldE5hbWUpO1xuXHR9XG5cblx0Z2V0TGFzdFNlbWFudGljTWFwcGluZygpOiBTZW1hbnRpY01hcHBpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nO1xuXHR9XG5cblx0c2V0TGFzdFNlbWFudGljTWFwcGluZyhvTWFwcGluZz86IFNlbWFudGljTWFwcGluZykge1xuXHRcdHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcgPSBvTWFwcGluZztcblx0fVxuXG5cdG5hdmlnYXRlVG8ob0NvbnRleHQ6IGFueSwgc1JvdXRlTmFtZTogYW55LCBtUGFyYW1ldGVyTWFwcGluZzogYW55LCBiUHJlc2VydmVIaXN0b3J5OiBhbnkpIHtcblx0XHRsZXQgc1RhcmdldFVSTFByb21pc2UsIGJJc1N0aWNreU1vZGU6IGJvb2xlYW47XG5cdFx0aWYgKG9Db250ZXh0LmdldE1vZGVsKCkgJiYgb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwgJiYgb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSkge1xuXHRcdFx0YklzU3RpY2t5TW9kZSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpKTtcblx0XHR9XG5cdFx0aWYgKCFtUGFyYW1ldGVyTWFwcGluZykge1xuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gcGFyYW1ldGVyIG1hcHBpbmcgZGVmaW5lIHRoaXMgbWVhbiB3ZSByZWx5IGVudGlyZWx5IG9uIHRoZSBiaW5kaW5nIGNvbnRleHQgcGF0aFxuXHRcdFx0c1RhcmdldFVSTFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9Db250ZXh0KSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNUYXJnZXRVUkxQcm9taXNlID0gdGhpcy5wcmVwYXJlUGFyYW1ldGVycyhtUGFyYW1ldGVyTWFwcGluZywgc1JvdXRlTmFtZSwgb0NvbnRleHQpLnRoZW4oKG1QYXJhbWV0ZXJzOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMub1JvdXRlci5nZXRVUkwoc1JvdXRlTmFtZSwgbVBhcmFtZXRlcnMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBzVGFyZ2V0VVJMUHJvbWlzZS50aGVuKChzVGFyZ2V0VVJMOiBhbnkpID0+IHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5Lm5hdlRvSGFzaChzVGFyZ2V0VVJMLCBiUHJlc2VydmVIaXN0b3J5LCBmYWxzZSwgZmFsc2UsICFiSXNTdGlja3lNb2RlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcmV0dXJuIGEgbWFwIG9mIHJvdXRpbmcgdGFyZ2V0IHBhcmFtZXRlcnMgd2hlcmUgdGhlIGJpbmRpbmcgc3ludGF4IGlzIHJlc29sdmVkIHRvIHRoZSBjdXJyZW50IG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgUGFyYW1ldGVycyBtYXAgaW4gdGhlIGZvcm1hdCBbazogc3RyaW5nXSA6IENvbXBsZXhCaW5kaW5nU3ludGF4XG5cdCAqIEBwYXJhbSBzVGFyZ2V0Um91dGUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIHJvdXRpbmcgdGFyZ2V0IHBhcmFtZXRlcnNcblx0ICovXG5cdHByZXBhcmVQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJzOiBhbnksIHNUYXJnZXRSb3V0ZTogc3RyaW5nLCBvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdGxldCBvUGFyYW1ldGVyc1Byb21pc2U7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IGFDb250ZXh0UGF0aFBhcnRzID0gc0NvbnRleHRQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdGNvbnN0IGFBbGxSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzID0gT2JqZWN0LmtleXMobVBhcmFtZXRlcnMpLm1hcCgoc1BhcmFtZXRlcktleTogYW55KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHNQYXJhbWV0ZXJNYXBwaW5nRXhwcmVzc2lvbiA9IG1QYXJhbWV0ZXJzW3NQYXJhbWV0ZXJLZXldO1xuXHRcdFx0XHQvLyBXZSBhc3N1bWUgdGhlIGRlZmluZWQgcGFyYW1ldGVycyB3aWxsIGJlIGNvbXBhdGlibGUgd2l0aCBhIGJpbmRpbmcgZXhwcmVzc2lvblxuXHRcdFx0XHRjb25zdCBvUGFyc2VkRXhwcmVzc2lvbiA9IEJpbmRpbmdQYXJzZXIuY29tcGxleFBhcnNlcihzUGFyYW1ldGVyTWFwcGluZ0V4cHJlc3Npb24pO1xuXHRcdFx0XHRjb25zdCBhUGFydHMgPSBvUGFyc2VkRXhwcmVzc2lvbi5wYXJ0cyB8fCBbb1BhcnNlZEV4cHJlc3Npb25dO1xuXHRcdFx0XHRjb25zdCBhUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyA9IGFQYXJ0cy5tYXAoZnVuY3Rpb24gKG9QYXRoUGFydDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3QgYVJlbGF0aXZlUGFydHMgPSBvUGF0aFBhcnQucGF0aC5zcGxpdChcIi4uL1wiKTtcblx0XHRcdFx0XHQvLyBXZSBnbyB1cCB0aGUgY3VycmVudCBjb250ZXh0IHBhdGggYXMgbWFueSB0aW1lcyBhcyBuZWNlc3Nhcnlcblx0XHRcdFx0XHRjb25zdCBhTG9jYWxQYXJ0cyA9IGFDb250ZXh0UGF0aFBhcnRzLnNsaWNlKDAsIGFDb250ZXh0UGF0aFBhcnRzLmxlbmd0aCAtIGFSZWxhdGl2ZVBhcnRzLmxlbmd0aCArIDEpO1xuXHRcdFx0XHRcdGFMb2NhbFBhcnRzLnB1c2goYVJlbGF0aXZlUGFydHNbYVJlbGF0aXZlUGFydHMubGVuZ3RoIC0gMV0pO1xuXG5cdFx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IGFMb2NhbFBhcnRzLmpvaW4oXCIvXCIpO1xuXHRcdFx0XHRcdGNvbnN0IG9NZXRhQ29udGV4dCA9IChvTWV0YU1vZGVsIGFzIGFueSkuZ2V0TWV0YUNvbnRleHQoc1Byb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db250ZXh0LnJlcXVlc3RQcm9wZXJ0eShzUHJvcGVydHlQYXRoKS50aGVuKGZ1bmN0aW9uIChvVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbyA9IG9NZXRhQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdGNvbnN0IHNFZG1UeXBlID0gb1Byb3BlcnR5SW5mby4kVHlwZTtcblx0XHRcdFx0XHRcdHJldHVybiBPRGF0YVV0aWxzLmZvcm1hdExpdGVyYWwob1ZhbHVlLCBzRWRtVHlwZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbChhUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcykudGhlbigoYVJlc29sdmVkUGFyYW1ldGVyczogYW55KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBvUGFyc2VkRXhwcmVzc2lvbi5mb3JtYXR0ZXJcblx0XHRcdFx0XHRcdD8gb1BhcnNlZEV4cHJlc3Npb24uZm9ybWF0dGVyLmFwcGx5KHRoaXMsIGFSZXNvbHZlZFBhcmFtZXRlcnMpXG5cdFx0XHRcdFx0XHQ6IGFSZXNvbHZlZFBhcmFtZXRlcnMuam9pbihcIlwiKTtcblx0XHRcdFx0XHRyZXR1cm4geyBrZXk6IHNQYXJhbWV0ZXJLZXksIHZhbHVlOiB2YWx1ZSB9O1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRvUGFyYW1ldGVyc1Byb21pc2UgPSBQcm9taXNlLmFsbChhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcykudGhlbihmdW5jdGlvbiAoXG5cdFx0XHRcdGFBbGxSZXNvbHZlZFBhcmFtZXRlcnM6IHsga2V5OiBhbnk7IHZhbHVlOiBhbnkgfVtdXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qgb1BhcmFtZXRlcnM6IGFueSA9IHt9O1xuXHRcdFx0XHRhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9SZXNvbHZlZFBhcmFtZXRlcjogeyBrZXk6IGFueTsgdmFsdWU6IGFueSB9KSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnNbb1Jlc29sdmVkUGFyYW1ldGVyLmtleV0gPSBvUmVzb2x2ZWRQYXJhbWV0ZXIudmFsdWU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gb1BhcmFtZXRlcnM7XG5cdFx0XHR9KTtcblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihgQ291bGQgbm90IHBhcnNlIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgbmF2aWdhdGlvbiB0byByb3V0ZSAke3NUYXJnZXRSb3V0ZX1gKTtcblx0XHRcdG9QYXJhbWV0ZXJzUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1BhcmFtZXRlcnNQcm9taXNlO1xuXHR9XG5cblx0X2ZpcmVSb3V0ZU1hdGNoRXZlbnRzKG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwicm91dGVNYXRjaGVkXCIsIG1QYXJhbWV0ZXJzKTtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwiYWZ0ZXJSb3V0ZU1hdGNoZWRcIiwgbVBhcmFtZXRlcnMpO1xuXG5cdFx0RWRpdFN0YXRlLmNsZWFuUHJvY2Vzc2VkRWRpdFN0YXRlKCk7IC8vIFJlc2V0IFVJIHN0YXRlIHdoZW4gYWxsIGJpbmRpbmdzIGhhdmUgYmVlbiByZWZyZXNoZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIENvbnRleHQgdG8gYmUgbmF2aWdhdGVkIHRvXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIE9wdGlvbmFsLCBtYXAgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY2hlY2tOb0hhc2hDaGFuZ2VdIE5hdmlnYXRlIHRvIHRoZSBjb250ZXh0IHdpdGhvdXQgY2hhbmdpbmcgdGhlIFVSTFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmFzeW5jQ29udGV4dF0gVGhlIGNvbnRleHQgaXMgY3JlYXRlZCBhc3luYywgbmF2aWdhdGUgdG8gKC4uLikgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgICB3YWl0IGZvciBQcm9taXNlIHRvIGJlIHJlc29sdmVkIGFuZCB0aGVuIG5hdmlnYXRlIGludG8gdGhlIGNvbnRleHRcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iRGVmZXJyZWRDb250ZXh0XSBUaGUgY29udGV4dCBzaGFsbCBiZSBjcmVhdGVkIGRlZmVycmVkIGF0IHRoZSB0YXJnZXQgcGFnZVxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmVkaXRhYmxlXSBUaGUgdGFyZ2V0IHBhZ2Ugc2hhbGwgYmUgaW1tZWRpYXRlbHkgaW4gdGhlIGVkaXQgbW9kZSB0byBhdm9pZCBmbGlja2VyaW5nXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYlBlcnNpc3RPUFNjcm9sbF0gVGhlIGJQZXJzaXN0T1BTY3JvbGwgd2lsbCBiZSB1c2VkIGZvciBzY3JvbGxpbmcgdG8gZmlyc3QgdGFiXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWxdIGArMWAgaWYgd2UgYWRkIGEgY29sdW1uIGluIEZDTCwgYC0xYCB0byByZW1vdmUgYSBjb2x1bW4sIDAgdG8gc3RheSBvbiB0aGUgc2FtZSBjb2x1bW5cblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5ub1ByZXNlcnZhdGlvbkNhY2hlXSBEbyBuYXZpZ2F0aW9uIHdpdGhvdXQgdGFraW5nIGludG8gYWNjb3VudCB0aGUgcHJlc2VydmVkIGNhY2hlIG1lY2hhbmlzbVxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJSZWNyZWF0ZUNvbnRleHRdIEZvcmNlIHJlLWNyZWF0aW9uIG9mIHRoZSBjb250ZXh0IGluc3RlYWQgb2YgdXNpbmcgdGhlIG9uZSBwYXNzZWQgYXMgcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYkZvcmNlRm9jdXNdIEZvcmNlcyBmb2N1cyBzZWxlY3Rpb24gYWZ0ZXIgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW29WaWV3RGF0YV0gVmlldyBkYXRhXG5cdCAqIEBwYXJhbSBbb0N1cnJlbnRUYXJnZXRJbmZvXSBUaGUgdGFyZ2V0IGluZm9ybWF0aW9uIGZyb20gd2hpY2ggdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgb25jZSB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0bmF2aWdhdGVUb0NvbnRleHQoXG5cdFx0b0NvbnRleHQ6IGFueSxcblx0XHRtUGFyYW1ldGVyczpcblx0XHRcdHwge1xuXHRcdFx0XHRcdGNoZWNrTm9IYXNoQ2hhbmdlPzogYm9vbGVhbjtcblx0XHRcdFx0XHRhc3luY0NvbnRleHQ/OiBQcm9taXNlPGFueT47XG5cdFx0XHRcdFx0YkRlZmVycmVkQ29udGV4dD86IGJvb2xlYW47XG5cdFx0XHRcdFx0ZWRpdGFibGU/OiBib29sZWFuO1xuXHRcdFx0XHRcdHRyYW5zaWVudD86IGJvb2xlYW47XG5cdFx0XHRcdFx0YlBlcnNpc3RPUFNjcm9sbD86IGJvb2xlYW47XG5cdFx0XHRcdFx0dXBkYXRlRkNMTGV2ZWw/OiBudW1iZXI7XG5cdFx0XHRcdFx0bm9QcmVzZXJ2YXRpb25DYWNoZT86IGJvb2xlYW47XG5cdFx0XHRcdFx0YlJlY3JlYXRlQ29udGV4dD86IGJvb2xlYW47XG5cdFx0XHRcdFx0YkZvcmNlRm9jdXM/OiBib29sZWFuO1xuXHRcdFx0XHRcdHRhcmdldFBhdGg/OiBzdHJpbmc7XG5cdFx0XHRcdFx0c2hvd1BsYWNlaG9sZGVyPzogYm9vbGVhbjtcblx0XHRcdFx0XHRiRHJhZnROYXZpZ2F0aW9uPzogYm9vbGVhbjtcblx0XHRcdFx0XHRyZWFzb24/OiBOYXZpZ2F0aW9uUmVhc29uO1xuXHRcdFx0ICB9XG5cdFx0XHR8IHVuZGVmaW5lZCxcblx0XHRvVmlld0RhdGE6IGFueSB8IHVuZGVmaW5lZCxcblx0XHRvQ3VycmVudFRhcmdldEluZm86IGFueSB8IHVuZGVmaW5lZFxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRsZXQgc1RhcmdldFJvdXRlOiBzdHJpbmcgPSBcIlwiLFxuXHRcdFx0b1JvdXRlUGFyYW1ldGVyc1Byb21pc2UsXG5cdFx0XHRiSXNTdGlja3lNb2RlOiBib29sZWFuID0gZmFsc2U7XG5cblx0XHRpZiAob0NvbnRleHQuZ2V0TW9kZWwoKSAmJiBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCkge1xuXHRcdFx0YklzU3RpY2t5TW9kZSA9IE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpKTtcblx0XHR9XG5cdFx0Ly8gTWFuYWdlIHBhcmFtZXRlciBtYXBwaW5nXG5cdFx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLnRhcmdldFBhdGggJiYgb1ZpZXdEYXRhICYmIG9WaWV3RGF0YS5uYXZpZ2F0aW9uKSB7XG5cdFx0XHRjb25zdCBvUm91dGVEZXRhaWwgPSBvVmlld0RhdGEubmF2aWdhdGlvblttUGFyYW1ldGVycy50YXJnZXRQYXRoXS5kZXRhaWw7XG5cdFx0XHRzVGFyZ2V0Um91dGUgPSBvUm91dGVEZXRhaWwucm91dGU7XG5cblx0XHRcdGlmIChvUm91dGVEZXRhaWwucGFyYW1ldGVycykge1xuXHRcdFx0XHRvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZSA9IHRoaXMucHJlcGFyZVBhcmFtZXRlcnMob1JvdXRlRGV0YWlsLnBhcmFtZXRlcnMsIHNUYXJnZXRSb3V0ZSwgb0NvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCBzVGFyZ2V0UGF0aCA9IHRoaXMuX2dldFBhdGhGcm9tQ29udGV4dChvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHRcdC8vIElmIHRoZSBwYXRoIGlzIGVtcHR5LCB3ZSdyZSBzdXBwb3NlZCB0byBuYXZpZ2F0ZSB0byB0aGUgZmlyc3QgcGFnZSBvZiB0aGUgYXBwXG5cdFx0Ly8gQ2hlY2sgaWYgd2UgbmVlZCB0byBleGl0IGZyb20gdGhlIGFwcCBpbnN0ZWFkXG5cdFx0aWYgKHNUYXJnZXRQYXRoLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmJFeGl0T25OYXZpZ2F0ZUJhY2tUb1Jvb3QpIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5LmV4aXRGcm9tQXBwKCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBjb250ZXh0IGlzIGRlZmVycmVkIG9yIGFzeW5jLCB3ZSBhZGQgKC4uLikgdG8gdGhlIHBhdGhcblx0XHRpZiAobVBhcmFtZXRlcnM/LmFzeW5jQ29udGV4dCB8fCBtUGFyYW1ldGVycz8uYkRlZmVycmVkQ29udGV4dCkge1xuXHRcdFx0c1RhcmdldFBhdGggKz0gXCIoLi4uKVwiO1xuXHRcdH1cblxuXHRcdC8vIEFkZCBsYXlvdXQgcGFyYW1ldGVyIGlmIG5lZWRlZFxuXHRcdGNvbnN0IHNMYXlvdXQgPSB0aGlzLl9jYWxjdWxhdGVMYXlvdXQoc1RhcmdldFBhdGgsIG1QYXJhbWV0ZXJzKTtcblx0XHRpZiAoc0xheW91dCkge1xuXHRcdFx0c1RhcmdldFBhdGggKz0gYD9sYXlvdXQ9JHtzTGF5b3V0fWA7XG5cdFx0fVxuXG5cdFx0Ly8gTmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGZvciBsYXRlciB1c2FnZVxuXHRcdGNvbnN0IG9OYXZpZ2F0aW9uSW5mbyA9IHtcblx0XHRcdG9Bc3luY0NvbnRleHQ6IG1QYXJhbWV0ZXJzPy5hc3luY0NvbnRleHQsXG5cdFx0XHRiRGVmZXJyZWRDb250ZXh0OiBtUGFyYW1ldGVycz8uYkRlZmVycmVkQ29udGV4dCxcblx0XHRcdGJUYXJnZXRFZGl0YWJsZTogbVBhcmFtZXRlcnM/LmVkaXRhYmxlLFxuXHRcdFx0YlBlcnNpc3RPUFNjcm9sbDogbVBhcmFtZXRlcnM/LmJQZXJzaXN0T1BTY3JvbGwsXG5cdFx0XHR1c2VDb250ZXh0OiBtUGFyYW1ldGVycz8udXBkYXRlRkNMTGV2ZWwgPT09IC0xIHx8IG1QYXJhbWV0ZXJzPy5iUmVjcmVhdGVDb250ZXh0ID8gdW5kZWZpbmVkIDogb0NvbnRleHQsXG5cdFx0XHRiRHJhZnROYXZpZ2F0aW9uOiBtUGFyYW1ldGVycz8uYkRyYWZ0TmF2aWdhdGlvbixcblx0XHRcdGJTaG93UGxhY2Vob2xkZXI6IG1QYXJhbWV0ZXJzPy5zaG93UGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCA/IG1QYXJhbWV0ZXJzPy5zaG93UGxhY2Vob2xkZXIgOiB0cnVlLFxuXHRcdFx0cmVhc29uOiBtUGFyYW1ldGVycz8ucmVhc29uXG5cdFx0fTtcblxuXHRcdGlmIChtUGFyYW1ldGVycz8uY2hlY2tOb0hhc2hDaGFuZ2UpIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSBuZXcgaGFzaCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBvbmVcblx0XHRcdGNvbnN0IHNDdXJyZW50SGFzaE5vQXBwU3RhdGUgPSB0aGlzLm9Sb3V0ZXJQcm94eS5nZXRIYXNoKCkucmVwbGFjZSgvWyY/XXsxfXNhcC1pYXBwLXN0YXRlPVtBLVowLTldKy8sIFwiXCIpO1xuXHRcdFx0aWYgKHNUYXJnZXRQYXRoID09PSBzQ3VycmVudEhhc2hOb0FwcFN0YXRlKSB7XG5cdFx0XHRcdC8vIFRoZSBoYXNoIGRvZXNuJ3QgY2hhbmdlLCBidXQgd2UgZmlyZSB0aGUgcm91dGVNYXRjaCBldmVudCB0byB0cmlnZ2VyIHBhZ2UgcmVmcmVzaCAvIGJpbmRpbmdcblx0XHRcdFx0Y29uc3QgbUV2ZW50UGFyYW1ldGVyczogYW55ID0gdGhpcy5vUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaCh0aGlzLm9Sb3V0ZXJQcm94eS5nZXRIYXNoKCkpO1xuXHRcdFx0XHRpZiAobUV2ZW50UGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG1FdmVudFBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSBvTmF2aWdhdGlvbkluZm87XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy5yb3V0ZUluZm9ybWF0aW9uID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbih0aGlzLnNDdXJyZW50Um91dGVOYW1lKTtcblx0XHRcdFx0XHRtRXZlbnRQYXJhbWV0ZXJzLnJvdXRlUGF0dGVybiA9IHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm47XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy52aWV3cyA9IHRoaXMuYUN1cnJlbnRWaWV3cztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMub1JvdXRlclByb3h5LnNldEZvY3VzRm9yY2VkKCEhbVBhcmFtZXRlcnMuYkZvcmNlRm9jdXMpO1xuXG5cdFx0XHRcdHRoaXMuX2ZpcmVSb3V0ZU1hdGNoRXZlbnRzKG1FdmVudFBhcmFtZXRlcnMpO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzPy50cmFuc2llbnQgJiYgbVBhcmFtZXRlcnMuZWRpdGFibGUgPT0gdHJ1ZSAmJiBzVGFyZ2V0UGF0aC5pbmRleE9mKFwiKC4uLilcIikgPT09IC0xKSB7XG5cdFx0XHRpZiAoc1RhcmdldFBhdGguaW5kZXhPZihcIj9cIikgPiAtMSkge1xuXHRcdFx0XHRzVGFyZ2V0UGF0aCArPSBcIiZpLWFjdGlvbj1jcmVhdGVcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNUYXJnZXRQYXRoICs9IFwiP2ktYWN0aW9uPWNyZWF0ZVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENsZWFyIHVuYm91bmQgbWVzc2FnZXMgdXBvbiBuYXZpZ2F0aW5nIGZyb20gTFIgdG8gT1Bcblx0XHQvLyBUaGlzIGlzIHRvIGVuc3VyZSBzdGFsZSBlcnJvciBtZXNzYWdlcyBmcm9tIExSIGFyZSBub3Qgc2hvd24gdG8gdGhlIHVzZXIgYWZ0ZXIgbmF2aWdhdGlvbiB0byBPUC5cblx0XHRpZiAob0N1cnJlbnRUYXJnZXRJbmZvICYmIG9DdXJyZW50VGFyZ2V0SW5mby5uYW1lID09PSBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFwiKSB7XG5cdFx0XHRjb25zdCBvUm91dGVJbmZvID0gdGhpcy5vUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaChzVGFyZ2V0UGF0aCk7XG5cdFx0XHRpZiAob1JvdXRlSW5mbykge1xuXHRcdFx0XHRjb25zdCBvUm91dGUgPSB0aGlzLl9nZXRSb3V0ZUluZm9ybWF0aW9uKG9Sb3V0ZUluZm8ubmFtZSk7XG5cdFx0XHRcdGlmIChvUm91dGUgJiYgb1JvdXRlLnRhcmdldHMgJiYgb1JvdXRlLnRhcmdldHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbnN0IHNMYXN0VGFyZ2V0TmFtZSA9IG9Sb3V0ZS50YXJnZXRzW29Sb3V0ZS50YXJnZXRzLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXQgPSB0aGlzLl9nZXRUYXJnZXRJbmZvcm1hdGlvbihzTGFzdFRhcmdldE5hbWUpO1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0ICYmIG9UYXJnZXQubmFtZSA9PT0gXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2VcIikge1xuXHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycyBpbiB0aGUgcXVldWVcblx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUucHVzaChvTmF2aWdhdGlvbkluZm8pO1xuXG5cdFx0aWYgKHNUYXJnZXRSb3V0ZSAmJiBvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZSkge1xuXHRcdFx0cmV0dXJuIG9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlLnRoZW4oKG9Sb3V0ZVBhcmFtZXRlcnM6IGFueSkgPT4ge1xuXHRcdFx0XHRvUm91dGVQYXJhbWV0ZXJzLmJJc1N0aWNreU1vZGUgPSBiSXNTdGlja3lNb2RlO1xuXHRcdFx0XHR0aGlzLm9Sb3V0ZXIubmF2VG8oc1RhcmdldFJvdXRlLCBvUm91dGVQYXJhbWV0ZXJzKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5vUm91dGVyUHJveHlcblx0XHRcdC5uYXZUb0hhc2goc1RhcmdldFBhdGgsIGZhbHNlLCBtUGFyYW1ldGVycz8ubm9QcmVzZXJ2YXRpb25DYWNoZSwgbVBhcmFtZXRlcnM/LmJGb3JjZUZvY3VzLCAhYklzU3RpY2t5TW9kZSlcblx0XHRcdC50aGVuKChiTmF2aWdhdGVkOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKCFiTmF2aWdhdGVkKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gZGlkIG5vdCBoYXBwZW4gLS0+IHJlbW92ZSB0aGUgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGZyb20gdGhlIHF1ZXVlIGFzIHRoZXkgc2hvdWxkbid0IGJlIHVzZWRcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUucG9wKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGJOYXZpZ2F0ZWQ7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSByb3V0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjbmF2aWdhdGVUb1JvdXRlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb1JvdXRlUGFyYW1ldGVyc10gUGFyYW1ldGVycyB0byBiZSB1c2VkIHdpdGggcm91dGUgdG8gY3JlYXRlIHRoZSB0YXJnZXQgaGFzaFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0bmF2aWdhdGVUb1JvdXRlKHNUYXJnZXRSb3V0ZU5hbWU6IHN0cmluZywgb1JvdXRlUGFyYW1ldGVycz86IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRVUkwgPSB0aGlzLm9Sb3V0ZXIuZ2V0VVJMKHNUYXJnZXRSb3V0ZU5hbWUsIG9Sb3V0ZVBhcmFtZXRlcnMpO1xuXHRcdHJldHVybiB0aGlzLm9Sb3V0ZXJQcm94eS5uYXZUb0hhc2goc1RhcmdldFVSTCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgIW9Sb3V0ZVBhcmFtZXRlcnMuYklzU3RpY2t5TW9kZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIG9uZSBvZiB0aGUgY3VycmVudCB2aWV3cyBvbiB0aGUgc2NyZWVuIGlzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgIGlmIHRoZSBjdXJyZW50IHN0YXRlIGlzIGltcGFjdGVkIG9yIG5vdFxuXHQgKi9cblx0aXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblxuXHRcdC8vIEZpcnN0LCBjaGVjayB3aXRoIHRoZSB0ZWNobmljYWwgcGF0aC4gV2UgaGF2ZSB0byB0cnkgaXQsIGJlY2F1c2UgZm9yIGxldmVsID4gMSwgd2Vcblx0XHQvLyB1c2VzIHRlY2huaWNhbCBrZXlzIGV2ZW4gaWYgU2VtYW50aWMga2V5cyBhcmUgZW5hYmxlZFxuXHRcdGlmICh0aGlzLm9Sb3V0ZXJQcm94eS5pc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkoc1BhdGgpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKC9eW14oKV0rXFwoW14oKV0rXFwpJC8udGVzdChzUGF0aCkpIHtcblx0XHRcdC8vIElmIHRoZSBjdXJyZW50IHBhdGggY2FuIGJlIHNlbWFudGljIChpLmUuIGlzIGxpa2UgeHh4KHl5eSkpXG5cdFx0XHQvLyBjaGVjayB3aXRoIHRoZSBzZW1hbnRpYyBwYXRoIGlmIHdlIGNhbiBmaW5kIGl0XG5cdFx0XHRsZXQgc1NlbWFudGljUGF0aDtcblx0XHRcdGlmICh0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nICYmIHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcudGVjaG5pY2FsUGF0aCA9PT0gc1BhdGgpIHtcblx0XHRcdFx0Ly8gV2UgaGF2ZSBhbHJlYWR5IHJlc29sdmVkIHRoaXMgc2VtYW50aWMgcGF0aFxuXHRcdFx0XHRzU2VtYW50aWNQYXRoID0gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzU2VtYW50aWNQYXRoID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9Db250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHNTZW1hbnRpY1BhdGggIT0gc1BhdGggPyB0aGlzLm9Sb3V0ZXJQcm94eS5pc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkoc1NlbWFudGljUGF0aCkgOiBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdF9maW5kUGF0aFRvTmF2aWdhdGUoc1BhdGg6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFwiL1teL10qJFwiKTtcblx0XHRzUGF0aCA9IHNQYXRoLnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXHRcdGlmICh0aGlzLm9Sb3V0ZXIubWF0Y2goc1BhdGgpIHx8IHNQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gc1BhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9maW5kUGF0aFRvTmF2aWdhdGUoc1BhdGgpO1xuXHRcdH1cblx0fVxuXG5cdF9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0XHQvLyBGaXJzdCwgY2hlY2sgaWYgdGhpcyBpcyBhIGxldmVsLTEgb2JqZWN0IChwYXRoID0gL2FhYShiYmIpKVxuXHRcdGlmICghL15cXC9bXihdK1xcKFteKV0rXFwpJC8udGVzdChzUGF0aCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBUaGVuIGNoZWNrIGlmIHRoZSBlbnRpdHkgaGFzIHNlbWFudGljIGtleXNcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzRW50aXR5U2V0TmFtZSA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpKS5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSBhcyBzdHJpbmc7XG5cdFx0aWYgKCFTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY0tleXMob01ldGFNb2RlbCwgc0VudGl0eVNldE5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlbiBjaGVjayB0aGUgZW50aXR5IGlzIGRyYWZ0LWVuYWJsZWRcblx0XHRyZXR1cm4gTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChvTWV0YU1vZGVsLCBzUGF0aCk7XG5cdH1cblxuXHRfZ2V0UGF0aEZyb21Db250ZXh0KG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgc1BhdGg7XG5cblx0XHRpZiAob0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikgJiYgb0NvbnRleHQuaXNSZWxhdGl2ZSgpKSB7XG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldEhlYWRlckNvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCA9PT0gLTEpIHtcblx0XHRcdC8vIFdoZW4gbmF2aWdhdGluZyBiYWNrIGZyb20gYSBjb250ZXh0LCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgbGFzdCBjb21wb25lbnQgb2YgdGhlIHBhdGhcblx0XHRcdHNQYXRoID0gdGhpcy5fZmluZFBhdGhUb05hdmlnYXRlKHNQYXRoKTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgd2UncmUgbmF2aWdhdGluZyBiYWNrIHRvIGEgc2VtYW50aWMgcGF0aCB0aGF0IHdhcyBwcmV2aW91c2x5IHJlc29sdmVkXG5cdFx0XHRpZiAodGhpcy5vTGFzdFNlbWFudGljTWFwcGluZyAmJiB0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nLnRlY2huaWNhbFBhdGggPT09IHNQYXRoKSB7XG5cdFx0XHRcdHNQYXRoID0gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGg7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9Db250ZXh0KSkge1xuXHRcdFx0Ly8gV2UgY2hlY2sgaWYgd2UgaGF2ZSB0byB1c2UgYSBzZW1hbnRpYyBwYXRoXG5cdFx0XHRjb25zdCBzU2VtYW50aWNQYXRoID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9Db250ZXh0LCB0cnVlKTtcblxuXHRcdFx0aWYgKCFzU2VtYW50aWNQYXRoKSB7XG5cdFx0XHRcdC8vIFdlIHdlcmUgbm90IGFibGUgdG8gYnVpbGQgdGhlIHNlbWFudGljIHBhdGggLS0+IFVzZSB0aGUgdGVjaG5pY2FsIHBhdGggYW5kXG5cdFx0XHRcdC8vIGNsZWFyIHRoZSBwcmV2aW91cyBtYXBwaW5nLCBvdGhlcndpc2UgdGhlIG9sZCBtYXBwaW5nIGlzIHVzZWQgaW4gRWRpdEZsb3cjdXBkYXRlRG9jdW1lbnRcblx0XHRcdFx0Ly8gYW5kIGl0IGxlYWRzIHRvIHVud2FudGVkIHBhZ2UgcmVsb2Fkc1xuXHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcodW5kZWZpbmVkKTtcblx0XHRcdH0gZWxzZSBpZiAoc1NlbWFudGljUGF0aCAhPT0gc1BhdGgpIHtcblx0XHRcdFx0Ly8gU3RvcmUgdGhlIG1hcHBpbmcgdGVjaG5pY2FsIDwtPiBzZW1hbnRpYyBwYXRoIHRvIGF2b2lkIHJlY2FsY3VsYXRpbmcgaXQgbGF0ZXJcblx0XHRcdFx0Ly8gYW5kIHVzZSB0aGUgc2VtYW50aWMgcGF0aCBpbnN0ZWFkIG9mIHRoZSB0ZWNobmljYWwgb25lXG5cdFx0XHRcdHRoaXMuc2V0TGFzdFNlbWFudGljTWFwcGluZyh7IHRlY2huaWNhbFBhdGg6IHNQYXRoLCBzZW1hbnRpY1BhdGg6IHNTZW1hbnRpY1BhdGggfSk7XG5cdFx0XHRcdHNQYXRoID0gc1NlbWFudGljUGF0aDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyByZW1vdmUgZXh0cmEgJy8nIGF0IHRoZSBiZWdpbm5pbmcgb2YgcGF0aFxuXHRcdGlmIChzUGF0aFswXSA9PT0gXCIvXCIpIHtcblx0XHRcdHNQYXRoID0gc1BhdGguc3Vic3RyaW5nKDEpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzUGF0aDtcblx0fVxuXG5cdF9jYWxjdWxhdGVMYXlvdXQoc1BhdGg6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBGQ0xMZXZlbCA9IG1QYXJhbWV0ZXJzLkZDTExldmVsO1xuXHRcdGlmIChtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCkge1xuXHRcdFx0RkNMTGV2ZWwgKz0gbVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWw7XG5cdFx0XHRpZiAoRkNMTGV2ZWwgPCAwKSB7XG5cdFx0XHRcdEZDTExldmVsID0gMDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBXaGVuIG5hdmlnYXRpbmcgYmFjaywgdHJ5IHRvIGZpbmQgdGhlIGxheW91dCBpbiB0aGUgbmF2aWdhdGlvbiBoaXN0b3J5IGlmIGl0J3Mgbm90IHByb3ZpZGVkIGFzIHBhcmFtZXRlclxuXHRcdC8vIChsYXlvdXQgY2FsY3VsYXRpb24gaXMgbm90IGhhbmRsZWQgcHJvcGVybHkgYnkgdGhlIEZsZXhpYmxlQ29sdW1uTGF5b3V0U2VtYW50aWNIZWxwZXIgaW4gdGhpcyBjYXNlKVxuXHRcdGlmIChtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCA8IDAgJiYgIW1QYXJhbWV0ZXJzLnNMYXlvdXQpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLnNMYXlvdXQgPSB0aGlzLm9Sb3V0ZXJQcm94eS5maW5kTGF5b3V0Rm9ySGFzaChzUGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICh0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55KS5jYWxjdWxhdGVMYXlvdXQoXG5cdFx0XHRGQ0xMZXZlbCxcblx0XHRcdHNQYXRoLFxuXHRcdFx0bVBhcmFtZXRlcnMuc0xheW91dCxcblx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBDdXJyZW50TGF5b3V0XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGJlZm9yZSBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIERpc3BsYXlzIGEgYnVzeSBpbmRpY2F0b3IuXG5cdCAqXG5cdCAqL1xuXHRfYmVmb3JlUm91dGVNYXRjaGVkKC8qb0V2ZW50OiBFdmVudCovKSB7XG5cdFx0Y29uc3QgYlBsYWNlaG9sZGVyRW5hYmxlZCA9IG5ldyBQbGFjZWhvbGRlcigpLmlzUGxhY2Vob2xkZXJFbmFibGVkKCk7XG5cdFx0aWYgKCFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHdoZW4gYSByb3V0ZSBpcyBtYXRjaGVkLlxuXHQgKiBIaWRlcyB0aGUgYnVzeSBpbmRpY2F0b3IgYW5kIGZpcmVzIGl0cyBvd24gJ3JvdXRlbWF0Y2hlZCcgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50XG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9BcHBTdGF0ZUhhbmRsZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0QXBwU3RhdGVIYW5kbGVyKCksXG5cdFx0XHRvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvUm9vdFZpZXcpICYmICFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0XHRjb25zdCBtUGFyYW1ldGVyczogYW55ID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKTtcblx0XHRpZiAodGhpcy5uYXZpZ2F0aW9uSW5mb1F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWVbMF07XG5cdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUgPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUuc2xpY2UoMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLm5hdmlnYXRpb25JbmZvID0ge307XG5cdFx0fVxuXHRcdGlmIChvQXBwU3RhdGVIYW5kbGVyLmNoZWNrSWZSb3V0ZUNoYW5nZWRCeUlBcHAoKSkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8ucmVhc29uID0gTmF2aWdhdGlvblJlYXNvbi5BcHBTdGF0ZUNoYW5nZWQ7XG5cdFx0XHRvQXBwU3RhdGVIYW5kbGVyLnJlc2V0Um91dGVDaGFuZ2VkQnlJQXBwKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zQ3VycmVudFJvdXRlTmFtZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJuYW1lXCIpO1xuXHRcdHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm4gPSBtUGFyYW1ldGVycy5jb25maWcucGF0dGVybjtcblx0XHR0aGlzLmFDdXJyZW50Vmlld3MgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIik7XG5cblx0XHRtUGFyYW1ldGVycy5yb3V0ZUluZm9ybWF0aW9uID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbih0aGlzLnNDdXJyZW50Um91dGVOYW1lKTtcblx0XHRtUGFyYW1ldGVycy5yb3V0ZVBhdHRlcm4gPSB0aGlzLnNDdXJyZW50Um91dGVQYXR0ZXJuO1xuXG5cdFx0dGhpcy5fZmlyZVJvdXRlTWF0Y2hFdmVudHMobVBhcmFtZXRlcnMpO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgY3VycmVudCBoYXNoIGhhcyBiZWVuIHNldCBieSB0aGUgcm91dGVyUHJveHkubmF2VG9IYXNoIGZ1bmN0aW9uXG5cdFx0Ly8gSWYgbm90LCByZWJ1aWxkIGhpc3RvcnkgcHJvcGVybHkgKGJvdGggaW4gdGhlIGJyb3dzZXIgYW5kIHRoZSBSb3V0ZXJQcm94eSlcblx0XHRpZiAoIWhpc3Rvcnkuc3RhdGUgfHwgaGlzdG9yeS5zdGF0ZS5mZUxldmVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5XG5cdFx0XHRcdC5yZXN0b3JlSGlzdG9yeSgpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5yZXNvbHZlUm91dGVNYXRjaCgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVzdG9yaW5nIGhpc3RvcnlcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5LnJlc29sdmVSb3V0ZU1hdGNoKCk7XG5cdFx0fVxuXHR9XG5cblx0YXR0YWNoUm91dGVNYXRjaGVkKG9EYXRhOiBhbnksIGZuRnVuY3Rpb24/OiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5hdHRhY2hFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBvRGF0YSwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXG5cdGRldGFjaFJvdXRlTWF0Y2hlZChmbkZ1bmN0aW9uOiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5kZXRhY2hFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cblx0YXR0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQob0RhdGE6IGFueSwgZm5GdW5jdGlvbjogYW55LCBvTGlzdGVuZXI/OiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuYXR0YWNoRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBvRGF0YSwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXG5cdGRldGFjaEFmdGVyUm91dGVNYXRjaGVkKGZuRnVuY3Rpb246IGFueSwgb0xpc3RlbmVyOiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZGV0YWNoRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cblx0Z2V0Um91dGVGcm9tSGFzaChvUm91dGVyOiBhbnksIG9BcHBDb21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IHNIYXNoID0gb1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmhhc2g7XG5cdFx0Y29uc3Qgb1JvdXRlSW5mbyA9IG9Sb3V0ZXIuZ2V0Um91dGVJbmZvQnlIYXNoKHNIYXNoKTtcblx0XHRyZXR1cm4gb0FwcENvbXBvbmVudFxuXHRcdFx0LmdldE1ldGFkYXRhKClcblx0XHRcdC5nZXRNYW5pZmVzdEVudHJ5KFwiL3NhcC51aTUvcm91dGluZy9yb3V0ZXNcIilcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Sb3V0ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvUm91dGUubmFtZSA9PT0gb1JvdXRlSW5mby5uYW1lO1xuXHRcdFx0fSlbMF07XG5cdH1cblxuXHRnZXRUYXJnZXRzRnJvbVJvdXRlKG9Sb3V0ZTogYW55KSB7XG5cdFx0Y29uc3Qgb1RhcmdldCA9IG9Sb3V0ZS50YXJnZXQ7XG5cdFx0aWYgKHR5cGVvZiBvVGFyZ2V0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRyZXR1cm4gW3RoaXMuX21UYXJnZXRzW29UYXJnZXRdXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYVRhcmdldDogYW55W10gPSBbXTtcblx0XHRcdG9UYXJnZXQuZm9yRWFjaCgoc1RhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdGFUYXJnZXQucHVzaCh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0XSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhVGFyZ2V0O1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGluaXRpYWxpemVSb3V0aW5nKCkge1xuXHRcdC8vIEF0dGFjaCByb3V0ZXIgaGFuZGxlcnNcblx0XHRhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLnByb2Nlc3NBbmRFeHBhbmRIYXNoKCk7XG5cdFx0dGhpcy5fZm5PblJvdXRlTWF0Y2hlZCA9IHRoaXMuX29uUm91dGVNYXRjaGVkLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vUm91dGVyLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mbk9uUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoIWJQbGFjZWhvbGRlckVuYWJsZWQpIHtcblx0XHRcdHRoaXMub1JvdXRlci5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5fYmVmb3JlUm91dGVNYXRjaGVkLmJpbmQodGhpcykpO1xuXHRcdH1cblx0XHQvLyBSZXNldCBpbnRlcm5hbCBzdGF0ZVxuXHRcdHRoaXMubmF2aWdhdGlvbkluZm9RdWV1ZSA9IFtdO1xuXHRcdEVkaXRTdGF0ZS5yZXNldEVkaXRTdGF0ZSgpO1xuXHRcdHRoaXMuYkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdCA9ICF0aGlzLm9Sb3V0ZXIubWF0Y2goXCJcIik7XG5cblx0XHRjb25zdCBiSXNJYXBwU3RhdGUgPSB0aGlzLm9Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5nZXRIYXNoKCkuaW5kZXhPZihcInNhcC1pYXBwLXN0YXRlXCIpICE9PSAtMTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1N0YXJ0dXBQYXJhbWV0ZXJzID0gYXdhaXQgdGhpcy5vQXBwQ29tcG9uZW50LmdldFN0YXJ0dXBQYXJhbWV0ZXJzKCk7XG5cdFx0XHRjb25zdCBiSGFzU3RhcnRVcFBhcmFtZXRlcnMgPSBvU3RhcnR1cFBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCAmJiBPYmplY3Qua2V5cyhvU3RhcnR1cFBhcmFtZXRlcnMpLmxlbmd0aCAhPT0gMDtcblx0XHRcdGNvbnN0IHNIYXNoID0gdGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuZ2V0SGFzaCgpO1xuXHRcdFx0Ly8gTWFuYWdlIHN0YXJ0dXAgcGFyYW1ldGVycyAoaW4gY2FzZSBvZiBubyBpYXBwLXN0YXRlKVxuXHRcdFx0aWYgKCFiSXNJYXBwU3RhdGUgJiYgYkhhc1N0YXJ0VXBQYXJhbWV0ZXJzICYmICFzSGFzaCkge1xuXHRcdFx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGUgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGVbMF0udG9VcHBlckNhc2UoKS5pbmRleE9mKFwiQ1JFQVRFXCIpICE9PSAtMSkge1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBtb2RlXG5cdFx0XHRcdFx0Ly8gVGhpcyBjaGVjayB3aWxsIGNhdGNoIG11bHRpcGxlIG1vZGVzIGxpa2UgY3JlYXRlLCBjcmVhdGVXaXRoIGFuZCBhdXRvQ3JlYXRlV2l0aCB3aGljaCBhbGwgbmVlZFxuXHRcdFx0XHRcdC8vIHRvIGJlIGhhbmRsZWQgbGlrZSBjcmVhdGUgc3RhcnR1cCFcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9tYW5hZ2VDcmVhdGVTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVycyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gRGVlcCBsaW5rXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fbWFuYWdlRGVlcExpbmtTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVycyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIGR1cmluZyByb3V0aW5nIGluaXRpYWxpemF0aW9uXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdH1cblx0fVxuXG5cdGdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycz86IGFueSkge1xuXHRcdHJldHVybiBBcHBTdGFydHVwSGVscGVyLmdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycywgdGhpcy5nZXRDb250ZXh0UGF0aCgpLCB0aGlzLm9Sb3V0ZXIpO1xuXHR9XG5cblx0X21hbmFnZUNyZWF0ZVN0YXJ0dXAob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRyZXR1cm4gQXBwU3RhcnR1cEhlbHBlci5nZXRDcmVhdGVTdGFydHVwSGFzaChvU3RhcnR1cFBhcmFtZXRlcnMsIHRoaXMuZ2V0Q29udGV4dFBhdGgoKSwgdGhpcy5vUm91dGVyLCB0aGlzLm9NZXRhTW9kZWwpLnRoZW4oXG5cdFx0XHQoc05ld0hhc2g6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoc05ld0hhc2gpIHtcblx0XHRcdFx0XHQodGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkucmVwbGFjZUhhc2ggYXMgYW55KShzTmV3SGFzaCk7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzPy5wcmVmZXJyZWRNb2RlICYmXG5cdFx0XHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJBVVRPQ1JFQVRFXCIpICE9PSAtMVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlQXV0b0NyZWF0ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLm9BcHBDb21wb25lbnQuc2V0U3RhcnR1cE1vZGVDcmVhdGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5iRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHRfbWFuYWdlRGVlcExpbmtTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuIEFwcFN0YXJ0dXBIZWxwZXIuZ2V0RGVlcExpbmtTdGFydHVwSGFzaChcblx0XHRcdCh0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKSBhcyBhbnkpW1wic2FwLnVpNVwiXS5yb3V0aW5nLFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLFxuXHRcdFx0dGhpcy5vTW9kZWxcblx0XHQpLnRoZW4oKG9EZWVwTGluazogYW55KSA9PiB7XG5cdFx0XHRsZXQgc0hhc2g7XG5cdFx0XHRpZiAob0RlZXBMaW5rLmNvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgc1RlY2huaWNhbFBhdGggPSBvRGVlcExpbmsuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRcdGNvbnN0IHNTZW1hbnRpY1BhdGggPSB0aGlzLl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9EZWVwTGluay5jb250ZXh0KVxuXHRcdFx0XHRcdD8gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9EZWVwTGluay5jb250ZXh0KVxuXHRcdFx0XHRcdDogc1RlY2huaWNhbFBhdGg7XG5cblx0XHRcdFx0aWYgKHNTZW1hbnRpY1BhdGggIT09IHNUZWNobmljYWxQYXRoKSB7XG5cdFx0XHRcdFx0Ly8gU3RvcmUgdGhlIG1hcHBpbmcgdGVjaG5pY2FsIDwtPiBzZW1hbnRpYyBwYXRoIHRvIGF2b2lkIHJlY2FsY3VsYXRpbmcgaXQgbGF0ZXJcblx0XHRcdFx0XHQvLyBhbmQgdXNlIHRoZSBzZW1hbnRpYyBwYXRoIGluc3RlYWQgb2YgdGhlIHRlY2huaWNhbCBvbmVcblx0XHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcoeyB0ZWNobmljYWxQYXRoOiBzVGVjaG5pY2FsUGF0aCwgc2VtYW50aWNQYXRoOiBzU2VtYW50aWNQYXRoIH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c0hhc2ggPSBzU2VtYW50aWNQYXRoLnN1YnN0cmluZygxKTsgLy8gVG8gcmVtb3ZlIHRoZSBsZWFkaW5nICcvJ1xuXHRcdFx0fSBlbHNlIGlmIChvRGVlcExpbmsuaGFzaCkge1xuXHRcdFx0XHRzSGFzaCA9IG9EZWVwTGluay5oYXNoO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc0hhc2gpIHtcblx0XHRcdFx0Ly9SZXBsYWNlIHRoZSBoYXNoIHdpdGggbmV3bHkgY3JlYXRlZCBoYXNoXG5cdFx0XHRcdCh0aGlzLm9Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5yZXBsYWNlSGFzaCBhcyBhbnkpKHNIYXNoKTtcblx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlRGVlcGxpbmsoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE91dGJvdW5kcygpIHtcblx0XHRyZXR1cm4gdGhpcy5vdXRib3VuZHM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgRHJhZnQgcm9vdCBlbnRpdHkgc2V0IG9yIHRoZSBzdGlja3ktZW5hYmxlZCBlbnRpdHkgc2V0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgcm9vdCBFbnRpdHlTZXRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRDb250ZXh0UGF0aCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zQ29udGV4dFBhdGg7XG5cdH1cblxuXHRnZXRJbnRlcmZhY2UoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5jbGFzcyBSb3V0aW5nU2VydmljZUZhY3RvcnkgZXh0ZW5kcyBTZXJ2aWNlRmFjdG9yeTxSb3V0aW5nU2VydmljZVNldHRpbmdzPiB7XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8Um91dGluZ1NlcnZpY2VTZXR0aW5ncz4pIHtcblx0XHRjb25zdCBvUm91dGluZ1NlcnZpY2UgPSBuZXcgUm91dGluZ1NlcnZpY2Uob1NlcnZpY2VDb250ZXh0KTtcblx0XHRyZXR1cm4gb1JvdXRpbmdTZXJ2aWNlLmluaXRQcm9taXNlO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRpbmdTZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7TUEyQk1BLHNCQUFzQixXQUQzQkMsY0FBYyxD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