/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, CommonUtils, BusyLocker, ActivitySync, draft, NavigationReason, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, Component, Core, ControllerExtension, OverrideExecution, Filter, FilterOperator) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var isConnected = ActivitySync.isConnected;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalRouting
   * @private
   * @since 1.74.0
   */
  let InternalRouting = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalRouting"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = publicExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = publicExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = extensible(OverrideExecution.Before), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalRouting, _ControllerExtension);
    function InternalRouting() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalRouting.prototype;
    _proto.onExit = function onExit() {
      if (this._oRoutingService) {
        this._oRoutingService.detachRouteMatched(this._fnRouteMatchedBound);
      }
    };
    _proto.onInit = function onInit() {
      this._oView = this.base.getView();
      this._oAppComponent = CommonUtils.getAppComponent(this._oView);
      this._oPageComponent = Component.getOwnerComponentFor(this._oView);
      this._oRouter = this._oAppComponent.getRouter();
      this._oRouterProxy = this._oAppComponent.getRouterProxy();
      if (!this._oAppComponent || !this._oPageComponent) {
        throw new Error("Failed to initialize controler extension 'sap.fe.core.controllerextesions.InternalRouting");
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this._oAppComponent === this._oPageComponent) {
        // The view isn't hosted in a dedicated UIComponent, but directly in the app
        // --> just keep the view
        this._oPageComponent = null;
      }
      this._oAppComponent.getService("routingService").then(oRoutingService => {
        this._oRoutingService = oRoutingService;
        this._fnRouteMatchedBound = this._onRouteMatched.bind(this);
        this._oRoutingService.attachRouteMatched(this._fnRouteMatchedBound);
        this._oTargetInformation = oRoutingService.getTargetInformationFor(this._oPageComponent || this._oView);
      }).catch(function () {
        throw new Error("This controller extension cannot work without a 'routingService' on the main AppComponent");
      });
    }

    /**
     * Triggered every time this controller is a navigation target.
     */;
    _proto.onRouteMatched = function onRouteMatched() {
      /**/
    };
    _proto.onRouteMatchedFinished = function onRouteMatchedFinished() {
      /**/
    };
    _proto.onBeforeBinding = function onBeforeBinding(oBindingContext, mParameters) {
      const oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onBeforeBinding) {
        oRouting.onBeforeBinding(oBindingContext, mParameters);
      }
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext, mParameters) {
      this._oAppComponent.getRootViewController().onContextBoundToView(oBindingContext);
      const oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onAfterBinding) {
        oRouting.onAfterBinding(oBindingContext, mParameters);
      }
    }

    ///////////////////////////////////////////////////////////
    // Methods triggering a navigation after a user action
    // (e.g. click on a table row, button, etc...)
    ///////////////////////////////////////////////////////////

    /**
     * Navigates to the specified navigation target.
     *
     * @param oContext Context instance
     * @param sNavigationTargetName Name of the navigation target
     * @param bPreserveHistory True to force the new URL to be added at the end of the browser history (no replace)
     * @ui5-restricted
     */;
    _proto.navigateToTarget = function navigateToTarget(oContext, sNavigationTargetName, bPreserveHistory) {
      const oNavigationConfiguration = this._oPageComponent && this._oPageComponent.getNavigationConfiguration && this._oPageComponent.getNavigationConfiguration(sNavigationTargetName);
      if (oNavigationConfiguration) {
        const oDetailRoute = oNavigationConfiguration.detail;
        const sRouteName = oDetailRoute.route;
        const mParameterMapping = oDetailRoute.parameters;
        this._oRoutingService.navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory);
      } else {
        this._oRoutingService.navigateTo(oContext, null, null, bPreserveHistory);
      }
      this._oView.getViewData();
    }

    /**
     * Navigates to the specified navigation target route.
     *
     * @param sTargetRouteName Name of the target route
     * @param [oParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oParameters) {
      return this._oRoutingService.navigateToRoute(sTargetRouteName, oParameters);
    }

    /**
     * Navigates to a specific context.
     *
     * @param oContext The context to be navigated to
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters) {
      const oContextInfo = {};
      mParameters = mParameters || {};
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        if (mParameters.asyncContext) {
          // the context is either created async (Promise)
          // We need to activate the routeMatchSynchro on the RouterProxy to avoid that
          // the subsequent call to navigateToContext conflicts with the current one
          this._oRouterProxy.activateRouteMatchSynchronization();
          mParameters.asyncContext.then(asyncContext => {
            // once the context is returned we navigate into it
            this.navigateToContext(asyncContext, {
              checkNoHashChange: mParameters.checkNoHashChange,
              editable: mParameters.editable,
              bPersistOPScroll: mParameters.bPersistOPScroll,
              updateFCLLevel: mParameters.updateFCLLevel,
              bForceFocus: mParameters.bForceFocus
            });
          }).catch(function (oError) {
            Log.error("Error with the async context", oError);
          });
        } else if (!mParameters.bDeferredContext) {
          // Navigate to a list binding not yet supported
          throw "navigation to a list binding is not yet supported";
        }
      }
      if (mParameters.callExtension) {
        const oInternalModel = this._oView.getModel("internal");
        oInternalModel.setProperty("/paginatorCurrentContext", null);
        oContextInfo.sourceBindingContext = oContext.getObject();
        oContextInfo.bindingContext = oContext;
        if (mParameters.oEvent) {
          oContextInfo.oEvent = mParameters.oEvent;
        }
        // Storing the selected context to use it in internal route navigation if neccessary.
        const bOverrideNav = this.base.getView().getController().routing.onBeforeNavigation(oContextInfo);
        if (bOverrideNav) {
          oInternalModel.setProperty("/paginatorCurrentContext", oContext);
          return Promise.resolve(true);
        }
      }
      mParameters.FCLLevel = this._getFCLLevel();
      return this._oRoutingService.navigateToContext(oContext, mParameters, this._oView.getViewData(), this._oTargetInformation);
    }

    /**
     * Navigates backwards from a context.
     *
     * @param oContext Context to be navigated from
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateBackFromContext = function navigateBackFromContext(oContext, mParameters) {
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = -1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates forwards to a context.
     *
     * @param oContext Context to be navigated to
     * @param mParameters Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateForwardToContext = function navigateForwardToContext(oContext, mParameters) {
      var _this$_oView$getBindi;
      if (((_this$_oView$getBindi = this._oView.getBindingContext("internal")) === null || _this$_oView$getBindi === void 0 ? void 0 : _this$_oView$getBindi.getProperty("messageFooterContainsErrors")) === true) {
        return Promise.resolve(true);
      }
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = 1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates back in history if the current hash corresponds to a transient state.
     */;
    _proto.navigateBackFromTransientState = function navigateBackFromTransientState() {
      const sHash = this._oRouterProxy.getHash();

      // if triggered while navigating to (...), we need to navigate back
      if (sHash.indexOf("(...)") !== -1) {
        this._oRouterProxy.navBack();
      }
    };
    _proto.navigateToMessagePage = function navigateToMessagePage(sErrorMessage, mParameters) {
      mParameters = mParameters || {};
      if (this._oRouterProxy.getHash().indexOf("i-action=create") > -1 || this._oRouterProxy.getHash().indexOf("i-action=autoCreate") > -1) {
        return this._oRouterProxy.navToHash(this._oRoutingService.getDefaultCreateHash());
      } else {
        mParameters.FCLLevel = this._getFCLLevel();
        return this._oAppComponent.getRootViewController().displayErrorPage(sErrorMessage, mParameters);
      }
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext
     * @returns `true` if the state is impacted by the context
     * @ui5-restricted
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      return this._oRoutingService.isCurrentStateImpactedBy(oContext);
    };
    _proto._isViewPartOfRoute = function _isViewPartOfRoute(routeInformation) {
      const aTargets = routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.targets;
      if (!aTargets || aTargets.indexOf(this._oTargetInformation.targetName) === -1) {
        // If the target for this view has a view level greater than the route level, it means this view comes "after" the route
        // in terms of navigation.
        // In such case, we remove its binding context, to avoid this view to have data if we navigate to it later on
        if ((this._oTargetInformation.viewLevel ?? 0) >= ((routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.routeLevel) ?? 0)) {
          this._setBindingContext(null); // This also call setKeepAlive(false) on the current context
        }

        return false;
      }
      return true;
    };
    _proto._buildBindingPath = function _buildBindingPath(routeArguments, bindingPattern, navigationParameters) {
      let path = bindingPattern.replace(":?query:", "");
      let deferred = false;
      for (const sKey in routeArguments) {
        const sValue = routeArguments[sKey];
        if (sValue === "..." && bindingPattern.indexOf(`{${sKey}}`) >= 0) {
          deferred = true;
          // Sometimes in preferredMode = create, the edit button is shown in background when the
          // action parameter dialog shows up, setting bTargetEditable passes editable as true
          // to onBeforeBinding in _bindTargetPage function
          navigationParameters.bTargetEditable = true;
        }
        path = path.replace(`{${sKey}}`, sValue);
      }
      if (routeArguments["?query"] && routeArguments["?query"].hasOwnProperty("i-action")) {
        navigationParameters.bActionCreate = true;
      }

      // the binding path is always absolute
      if (path && path[0] !== "/") {
        path = `/${path}`;
      }
      return {
        path,
        deferred
      };
    }

    ///////////////////////////////////////////////////////////
    // Methods to bind the page when a route is matched
    ///////////////////////////////////////////////////////////

    /**
     * Called when a route is matched.
     * Builds the binding context from the navigation parameters, and bind the page accordingly.
     *
     * @param oEvent
     * @ui5-restricted
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      // Check if the target for this view is part of the event targets (i.e. is a target for the current route).
      // If not, we don't need to bind it --> return
      if (!this._isViewPartOfRoute(oEvent.getParameter("routeInformation"))) {
        return;
      }

      // Retrieve the binding context pattern
      let bindingPattern;
      if (this._oPageComponent && this._oPageComponent.getBindingContextPattern) {
        bindingPattern = this._oPageComponent.getBindingContextPattern();
      }
      bindingPattern = bindingPattern || this._oTargetInformation.contextPattern;
      if (bindingPattern === null || bindingPattern === undefined) {
        // Don't do this if we already got sTarget == '', which is a valid target pattern
        bindingPattern = oEvent.getParameter("routePattern");
      }

      // Replace the parameters by their values in the binding context pattern
      const mArguments = oEvent.getParameters().arguments;
      const oNavigationParameters = oEvent.getParameter("navigationInfo");
      const {
        path,
        deferred
      } = this._buildBindingPath(mArguments, bindingPattern, oNavigationParameters);
      this.onRouteMatched();
      const oModel = this._oView.getModel();
      let oOut;
      if (deferred) {
        oOut = this._bindDeferred(path, oNavigationParameters);
      } else {
        oOut = this._bindPage(path, oModel, oNavigationParameters);
      }
      // eslint-disable-next-line promise/catch-or-return
      oOut.finally(() => {
        this.onRouteMatchedFinished();
      });
      this._oAppComponent.getRootViewController().updateUIStateForView(this._oView, this._getFCLLevel());
    }

    /**
     * Deferred binding (during object creation).
     *
     * @param sTargetPath The path to the deffered context
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise
     * @ui5-restricted
     */;
    _proto._bindDeferred = function _bindDeferred(sTargetPath, oNavigationParameters) {
      this.onBeforeBinding(null, {
        editable: oNavigationParameters.bTargetEditable
      });
      if (oNavigationParameters.bDeferredContext || !oNavigationParameters.oAsyncContext) {
        // either the context shall be created in the target page (deferred Context) or it shall
        // be created async but the user refreshed the page / bookmarked this URL
        // TODO: currently the target component creates this document but we shall move this to
        // a central place
        if (this._oPageComponent && this._oPageComponent.createDeferredContext) {
          this._oPageComponent.createDeferredContext(sTargetPath, oNavigationParameters.useContext, oNavigationParameters.bActionCreate);
        }
      }
      const currentBindingContext = this._getBindingContext();
      if (currentBindingContext !== null && currentBindingContext !== void 0 && currentBindingContext.hasPendingChanges()) {
        // For now remove the pending changes to avoid the model raises errors and the object page is at least bound
        // Ideally the user should be asked for
        currentBindingContext.getBinding().resetChanges();
      }

      // remove the context to avoid showing old data
      this._setBindingContext(null);
      this.onAfterBinding(null);
      return Promise.resolve();
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to the context
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise resolved once the binding has been set on the page
     * @ui5-restricted
     */;
    _proto._bindPage = function _bindPage(sTargetPath, oModel, oNavigationParameters) {
      if (sTargetPath === "") {
        return Promise.resolve(this._bindPageToContext(null, oModel, oNavigationParameters));
      } else {
        return this._resolveSemanticPath(sTargetPath, oModel).then(sTechnicalPath => {
          this._bindPageToPath(sTechnicalPath, oModel, oNavigationParameters);
        }).catch(oError => {
          // Error handling for erroneous metadata request
          const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          this.navigateToMessagePage(oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
            title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
            description: oError.message
          });
        });
      }
    }

    /**
     * Creates the filter to retrieve a context corresponding to a semantic path.
     *
     * @param sSemanticPath The semantic path
     * @param aSemanticKeys The semantic keys for the path
     * @param oMetaModel The instance of the meta model
     * @returns The filter
     * @ui5-restricted
     */;
    _proto._createFilterFromSemanticPath = function _createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel) {
      const fnUnquoteAndDecode = function (sValue) {
        if (sValue.indexOf("'") === 0 && sValue.lastIndexOf("'") === sValue.length - 1) {
          // Remove the quotes from the value and decode special chars
          sValue = decodeURIComponent(sValue.substring(1, sValue.length - 1));
        }
        return sValue;
      };
      const aKeyValues = sSemanticPath.substring(sSemanticPath.indexOf("(") + 1, sSemanticPath.length - 1).split(",");
      let aFilters;
      if (aSemanticKeys.length != aKeyValues.length) {
        return null;
      }
      const bFilteringCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);
      if (aSemanticKeys.length === 1) {
        // Take the first key value
        const sKeyValue = fnUnquoteAndDecode(aKeyValues[0]);
        aFilters = [new Filter({
          path: aSemanticKeys[0].$PropertyPath,
          operator: FilterOperator.EQ,
          value1: sKeyValue,
          caseSensitive: bFilteringCaseSensitive
        })];
      } else {
        const mKeyValues = {};
        // Create a map of all key values
        aKeyValues.forEach(function (sKeyAssignment) {
          const aParts = sKeyAssignment.split("="),
            sKeyValue = fnUnquoteAndDecode(aParts[1]);
          mKeyValues[aParts[0]] = sKeyValue;
        });
        let bFailed = false;
        aFilters = aSemanticKeys.map(function (oSemanticKey) {
          const sKey = oSemanticKey.$PropertyPath,
            sValue = mKeyValues[sKey];
          if (sValue !== undefined) {
            return new Filter({
              path: sKey,
              operator: FilterOperator.EQ,
              value1: sValue,
              caseSensitive: bFilteringCaseSensitive
            });
          } else {
            bFailed = true;
            return new Filter({
              path: "XX"
            }); // will be ignore anyway since we return after
          }
        });

        if (bFailed) {
          return null;
        }
      }

      // Add a draft filter to make sure we take the draft entity if there is one
      // Or the active entity otherwise
      const oDraftFilter = new Filter({
        filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
        and: false
      });
      aFilters.push(oDraftFilter);
      return new Filter(aFilters, true);
    }

    /**
     * Converts a path with semantic keys to a path with technical keys.
     *
     * @param sSemanticPath The path with semantic keys
     * @param oModel The model for the path
     * @param aSemanticKeys The semantic keys for the path
     * @returns A Promise containing the path with technical keys if sSemanticPath could be interpreted as a semantic path, null otherwise
     * @ui5-restricted
     */;
    _proto._getTechnicalPathFromSemanticPath = function _getTechnicalPathFromSemanticPath(sSemanticPath, oModel, aSemanticKeys) {
      var _sEntitySetPath;
      const oMetaModel = oModel.getMetaModel();
      let sEntitySetPath = oMetaModel.getMetaContext(sSemanticPath).getPath();
      if (!aSemanticKeys || aSemanticKeys.length === 0) {
        // No semantic keys
        return Promise.resolve(null);
      }

      // Create a set of filters corresponding to all keys
      const oFilter = this._createFilterFromSemanticPath(sSemanticPath, aSemanticKeys, oMetaModel);
      if (oFilter === null) {
        // Couldn't interpret the path as a semantic one
        return Promise.resolve(null);
      }

      // Load the corresponding object
      if (!((_sEntitySetPath = sEntitySetPath) !== null && _sEntitySetPath !== void 0 && _sEntitySetPath.startsWith("/"))) {
        sEntitySetPath = `/${sEntitySetPath}`;
      }
      const oListBinding = oModel.bindList(sEntitySetPath, undefined, undefined, oFilter, {
        $$groupId: "$auto.Heroes"
      });
      return oListBinding.requestContexts(0, 2).then(function (oContexts) {
        if (oContexts && oContexts.length) {
          return oContexts[0].getPath();
        } else {
          // No data could be loaded
          return null;
        }
      });
    }

    /**
     * Checks if a path is eligible for semantic bookmarking.
     *
     * @param sPath The path to test
     * @param oMetaModel The associated metadata model
     * @returns `true` if the path is eligible
     * @ui5-restricted
     */;
    _proto._checkPathForSemanticBookmarking = function _checkPathForSemanticBookmarking(sPath, oMetaModel) {
      // Only path on root objects allow semantic bookmarking, i.e. sPath = xxx(yyy)
      const aMatches = /^[/]?(\w+)\([^/]+\)$/.exec(sPath);
      if (!aMatches) {
        return false;
      }
      // Get the entitySet name
      const sEntitySetPath = `/${aMatches[1]}`;
      // Check the entity set supports draft (otherwise we don't support semantic bookmarking)
      const oDraftRoot = oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
      const oDraftNode = oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode`);
      return oDraftRoot || oDraftNode ? true : false;
    }

    /**
     * Builds a path with semantic keys from a path with technical keys.
     *
     * @param sPathToResolve The path to be transformed
     * @param oModel The OData model
     * @returns String promise for the new path. If sPathToResolved couldn't be interpreted as a semantic path, it is returned as is.
     * @ui5-restricted
     */;
    _proto._resolveSemanticPath = function _resolveSemanticPath(sPathToResolve, oModel) {
      const oMetaModel = oModel.getMetaModel();
      const oLastSemanticMapping = this._oRoutingService.getLastSemanticMapping();
      let sCurrentHashNoParams = this._oRouter.getHashChanger().getHash().split("?")[0];
      if (sCurrentHashNoParams && sCurrentHashNoParams.lastIndexOf("/") === sCurrentHashNoParams.length - 1) {
        // Remove trailing '/'
        sCurrentHashNoParams = sCurrentHashNoParams.substring(0, sCurrentHashNoParams.length - 1);
      }
      let sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
      if (sRootEntityName.indexOf("/") === 0) {
        sRootEntityName = sRootEntityName.substring(1);
      }
      const bAllowSemanticBookmark = this._checkPathForSemanticBookmarking(sCurrentHashNoParams, oMetaModel),
        aSemanticKeys = bAllowSemanticBookmark && SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
      if (!aSemanticKeys) {
        // No semantic keys available --> use the path as is
        return Promise.resolve(sPathToResolve);
      } else if (oLastSemanticMapping && oLastSemanticMapping.semanticPath === sPathToResolve) {
        // This semantic path has been resolved previously
        return Promise.resolve(oLastSemanticMapping.technicalPath);
      } else {
        // We need resolve the semantic path to get the technical keys
        return this._getTechnicalPathFromSemanticPath(sCurrentHashNoParams, oModel, aSemanticKeys).then(sTechnicalPath => {
          if (sTechnicalPath && sTechnicalPath !== sPathToResolve) {
            // The semantic path was resolved (otherwise keep the original value for target)
            this._oRoutingService.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sPathToResolve
            });
            return sTechnicalPath;
          } else {
            return sPathToResolve;
          }
        });
      }
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to build the context. Needs to contain technical keys only.
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToPath = function _bindPageToPath(sTargetPath, oModel, oNavigationParameters) {
      const oCurrentContext = this._getBindingContext(),
        sCurrentPath = oCurrentContext && oCurrentContext.getPath(),
        oUseContext = oNavigationParameters.useContext;

      // We set the binding context only if it's different from the current one
      // or if we have a context already selected
      if (oUseContext && oUseContext.getPath() === sTargetPath) {
        if (oUseContext !== oCurrentContext) {
          // We already have the context to be used, and it's not the current one
          const oRootViewController = this._oAppComponent.getRootViewController();

          // In case of FCL, if we're reusing a context from a table (through navigation), we refresh it to avoid outdated data
          // We don't wait for the refresh to be completed (requestRefresh), so that the corresponding query goes into the same
          // batch as the ones from controls in the page.
          if (oRootViewController.isFclEnabled() && oNavigationParameters.reason === NavigationReason.RowPress) {
            const metaModel = oUseContext.getModel().getMetaModel();
            if (!oUseContext.getBinding().hasPendingChanges()) {
              oUseContext.refresh();
            } else if (isConnected(this.getView()) || ModelHelper.isDraftSupported(metaModel, oUseContext.getPath()) && ModelHelper.isCollaborationDraftSupported(metaModel)) {
              // If there are pending changes but we're in collaboration draft, we force the refresh (discarding pending changes) as we need to have the latest version.
              // When navigating from LR to OP, the view is not connected yet --> check if we're in draft with collaboration from the metamodel
              oUseContext.getBinding().resetChanges();
              oUseContext.refresh();
            }
          }
          this._bindPageToContext(oUseContext, oModel, oNavigationParameters);
        }
      } else if (sCurrentPath !== sTargetPath) {
        // We need to create a new context for its path
        this._bindPageToContext(this._createContext(sTargetPath, oModel), oModel, oNavigationParameters);
      } else if (oNavigationParameters.reason !== NavigationReason.AppStateChanged && EditState.isEditStateDirty()) {
        this._refreshBindingContext(oCurrentContext);
      }
    }

    /**
     * Binds the page to a context.
     *
     * @param oContext Context to be bound
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToContext = function _bindPageToContext(oContext, oModel, oNavigationParameters) {
      if (!oContext) {
        this.onBeforeBinding(null);
        this.onAfterBinding(null);
        return;
      }
      const oParentListBinding = oContext.getBinding();
      const oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        if (!oParentListBinding || !oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          // if the parentBinding is not a listBinding, we create a new context
          oContext = this._createContext(oContext.getPath(), oModel);
        }
        try {
          this._setKeepAlive(oContext, true, () => {
            if (oRootViewController.isContextUsedInPages(oContext)) {
              this.navigateBackFromContext(oContext);
            }
          }, true // Load messages, otherwise they don't get refreshed later, e.g. for side effects
          );
        } catch (oError) {
          // setKeepAlive throws an exception if the parent listbinding doesn't have $$ownRequest=true
          // This case for custom fragments is supported, but an error is logged to make the lack of synchronization apparent
          Log.error(`View for ${oContext.getPath()} won't be synchronized. Parent listBinding must have binding parameter $$ownRequest=true`);
        }
      } else if (!oParentListBinding || oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        // We need to recreate the context otherwise we get errors
        oContext = this._createContext(oContext.getPath(), oModel);
      }

      // Set the binding context with the proper before/after callbacks
      this.onBeforeBinding(oContext, {
        editable: oNavigationParameters.bTargetEditable,
        listBinding: oParentListBinding,
        bPersistOPScroll: oNavigationParameters.bPersistOPScroll,
        bDraftNavigation: oNavigationParameters.bDraftNavigation,
        showPlaceholder: oNavigationParameters.bShowPlaceholder
      });
      this._setBindingContext(oContext);
      this.onAfterBinding(oContext);
    }

    /**
     * Creates a context from a path.
     *
     * @param sPath The path
     * @param oModel The OData model
     * @returns The created context
     * @ui5-restricted
     */;
    _proto._createContext = function _createContext(sPath, oModel) {
      const oPageComponent = this._oPageComponent,
        sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet(),
        sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && `/${sEntitySet}`,
        oMetaModel = oModel.getMetaModel(),
        mParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto",
          $$patchWithoutSideEffects: true
        };
      // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
      const oDraftRoot = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
      const oDraftNode = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`);
      const oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        const oContext = this._getKeepAliveContext(oModel, sPath, false, mParameters);
        if (!oContext) {
          throw new Error(`Cannot create keepAlive context ${sPath}`);
        } else if (oDraftRoot || oDraftNode) {
          if (oContext.getProperty("IsActiveEntity") === undefined) {
            oContext.requestProperty(["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
            if (oDraftRoot) {
              oContext.requestObject("DraftAdministrativeData");
            }
          } else {
            // when switching between draft and edit we need to ensure those properties are requested again even if they are in the binding's cache
            // otherwise when you edit and go to the saved version you have no way of switching back to the edit version
            oContext.requestSideEffects(oDraftRoot ? ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity", "DraftAdministrativeData"] : ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
          }
        }
        return oContext;
      } else {
        if (sEntitySet) {
          const sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
          if (sMessagesPath) {
            mParameters.$select = sMessagesPath;
          }
        }

        // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
        if (oDraftRoot || oDraftNode) {
          if (mParameters.$select === undefined) {
            mParameters.$select = "HasActiveEntity,HasDraftEntity,IsActiveEntity";
          } else {
            mParameters.$select += ",HasActiveEntity,HasDraftEntity,IsActiveEntity";
          }
        }
        if (this._oView.getBindingContext()) {
          var _this$_oView$getBindi2;
          const oPreviousBinding = (_this$_oView$getBindi2 = this._oView.getBindingContext()) === null || _this$_oView$getBindi2 === void 0 ? void 0 : _this$_oView$getBindi2.getBinding();
          oPreviousBinding === null || oPreviousBinding === void 0 ? void 0 : oPreviousBinding.resetChanges().then(() => {
            oPreviousBinding.destroy();
          }).catch(oError => {
            Log.error("Error while reseting the changes to the binding", oError);
          });
        }
        const oHiddenBinding = oModel.bindContext(sPath, undefined, mParameters);
        oHiddenBinding.attachEventOnce("dataRequested", () => {
          BusyLocker.lock(this._oView);
        });
        oHiddenBinding.attachEventOnce("dataReceived", this.onDataReceived.bind(this));
        return oHiddenBinding.getBoundContext();
      }
    };
    _proto.onDataReceived = async function onDataReceived(oEvent) {
      const sErrorDescription = oEvent && oEvent.getParameter("error");
      if (BusyLocker.isLocked(this._oView)) {
        BusyLocker.unlock(this._oView);
      }
      if (sErrorDescription) {
        // TODO: in case of 404 the text shall be different
        try {
          const oResourceBundle = await Core.getLibraryResourceBundle("sap.fe.core", true);
          const messageHandler = this.base.messageHandler;
          let mParams = {};
          if (sErrorDescription.status === 503) {
            mParams = {
              isInitialLoad503Error: true,
              shellBack: true
            };
          } else if (sErrorDescription.status === 400) {
            mParams = {
              title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
              description: oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR_DESCRIPTION"),
              isDataReceivedError: true,
              shellBack: true
            };
          } else {
            mParams = {
              title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
              description: sErrorDescription,
              isDataReceivedError: true,
              shellBack: true
            };
          }
          await messageHandler.showMessages(mParams);
        } catch (oError) {
          Log.error("Error while getting the core resource bundle", oError);
        }
      }
    }

    /**
     * Requests side effects on a binding context to "refresh" it.
     * TODO: get rid of this once provided by the model
     * a refresh on the binding context does not work in case a creation row with a transient context is
     * used. also a requestSideEffects with an empty path would fail due to the transient context
     * therefore we get all dependent bindings (via private model method) to determine all paths and then
     * request them.
     *
     * @param oBindingContext Context to be refreshed
     * @ui5-restricted
     */;
    _proto._refreshBindingContext = function _refreshBindingContext(oBindingContext) {
      const oPageComponent = this._oPageComponent;
      const oSideEffectsService = this._oAppComponent.getSideEffectsService();
      const sRootContextPath = oBindingContext.getPath();
      const sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet();
      const sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && `/${sEntitySet}`;
      const oMetaModel = this._oView.getModel().getMetaModel();
      let sMessagesPath;
      const aNavigationPropertyPaths = [];
      const aPropertyPaths = [];
      const oSideEffects = {
        targetProperties: [],
        targetEntities: []
      };
      function getBindingPaths(oBinding) {
        let aDependentBindings;
        const sRelativePath = (oBinding.getContext() && oBinding.getContext().getPath() || "").replace(sRootContextPath, ""); // If no context, this is an absolute binding so no relative path
        const sPath = (sRelativePath ? `${sRelativePath.slice(1)}/` : sRelativePath) + oBinding.getPath();
        if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")) {
          // if (sPath === "") {
          // now get the dependent bindings
          aDependentBindings = oBinding.getDependentBindings();
          if (aDependentBindings) {
            // ask the dependent bindings (and only those with the specified groupId
            //if (aDependentBindings.length > 0) {
            for (let i = 0; i < aDependentBindings.length; i++) {
              getBindingPaths(aDependentBindings[i]);
            }
          } else if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
          if (aPropertyPaths.indexOf(sPath) === -1) {
            aPropertyPaths.push(sPath);
          }
        }
      }
      if (sContextPath) {
        sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
      }

      // binding of the context must have $$PatchWithoutSideEffects true, this bound context may be needed to be fetched from the dependent binding
      getBindingPaths(oBindingContext.getBinding());
      let i;
      for (i = 0; i < aNavigationPropertyPaths.length; i++) {
        oSideEffects.targetEntities.push({
          $NavigationPropertyPath: aNavigationPropertyPaths[i]
        });
      }
      oSideEffects.targetProperties = aPropertyPaths;
      if (sMessagesPath) {
        oSideEffects.targetProperties.push(sMessagesPath);
      }
      //all this logic to be replaced with a SideEffects request for an empty path (refresh everything), after testing transient contexts
      oSideEffects.targetProperties = oSideEffects.targetProperties.reduce((targets, targetProperty) => {
        if (targetProperty) {
          const index = targetProperty.indexOf("/");
          targets.push(index > 0 ? targetProperty.slice(0, index) : targetProperty);
        }
        return targets;
      }, []);
      // OData model will take care of duplicates
      oSideEffectsService.requestSideEffects([...oSideEffects.targetEntities, ...oSideEffects.targetProperties], oBindingContext);
    }

    /**
     * Gets the binding context of the page or the component.
     *
     * @returns The binding context
     * @ui5-restricted
     */;
    _proto._getBindingContext = function _getBindingContext() {
      if (this._oPageComponent) {
        return this._oPageComponent.getBindingContext();
      } else {
        return this._oView.getBindingContext();
      }
    }

    /**
     * Sets the binding context of the page or the component.
     *
     * @param oContext The binding context
     * @ui5-restricted
     */;
    _proto._setBindingContext = function _setBindingContext(oContext) {
      var _oPreviousContext;
      let oPreviousContext, oTargetControl;
      if (this._oPageComponent) {
        oPreviousContext = this._oPageComponent.getBindingContext();
        oTargetControl = this._oPageComponent;
      } else {
        oPreviousContext = this._oView.getBindingContext();
        oTargetControl = this._oView;
      }
      oTargetControl.setBindingContext(oContext);
      if ((_oPreviousContext = oPreviousContext) !== null && _oPreviousContext !== void 0 && _oPreviousContext.isKeepAlive() && oPreviousContext !== oContext) {
        this._setKeepAlive(oPreviousContext, false);
      }
    }

    /**
     * Gets the flexible column layout (FCL) level corresponding to the view (-1 if the app is not FCL).
     *
     * @returns The level
     * @ui5-restricted
     */;
    _proto._getFCLLevel = function _getFCLLevel() {
      return this._oTargetInformation.FCLLevel;
    };
    _proto._setKeepAlive = function _setKeepAlive(oContext, bKeepAlive, fnBeforeDestroy, bRequestMessages) {
      if (oContext.getPath().endsWith(")")) {
        // We keep the context alive only if they're part of a collection, i.e. if the path ends with a ')'
        const oMetaModel = oContext.getModel().getMetaModel();
        const sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
        const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
        oContext.setKeepAlive(bKeepAlive, fnBeforeDestroy, !!sMessagesPath && bRequestMessages);
      }
    };
    _proto._getKeepAliveContext = function _getKeepAliveContext(oModel, path, bRequestMessages, parameters) {
      // Get the path for the context that is really kept alive (part of a collection)
      // i.e. remove all segments not ending with a ')'
      const keptAliveSegments = path.split("/");
      const additionnalSegments = [];
      while (keptAliveSegments.length && !keptAliveSegments[keptAliveSegments.length - 1].endsWith(")")) {
        additionnalSegments.push(keptAliveSegments.pop());
      }
      if (keptAliveSegments.length === 0) {
        return undefined;
      }
      const keptAlivePath = keptAliveSegments.join("/");
      const oKeepAliveContext = oModel.getKeepAliveContext(keptAlivePath, bRequestMessages, parameters);
      if (additionnalSegments.length === 0) {
        return oKeepAliveContext;
      } else {
        additionnalSegments.reverse();
        const additionnalPath = additionnalSegments.join("/");
        return oModel.bindContext(additionnalPath, oKeepAliveContext).getBoundContext();
      }
    }

    /**
     * Switches between column and full-screen mode when FCL is used.
     *
     * @ui5-restricted
     */;
    _proto.switchFullScreen = function switchFullScreen() {
      const oSource = this.base.getView();
      const oFCLHelperModel = oSource.getModel("fclhelper"),
        bIsFullScreen = oFCLHelperModel.getProperty("/actionButtonsInfo/isFullScreen"),
        sNextLayout = oFCLHelperModel.getProperty(bIsFullScreen ? "/actionButtonsInfo/exitFullScreen" : "/actionButtonsInfo/fullScreen"),
        oRootViewController = this._oAppComponent.getRootViewController();
      const oContext = oRootViewController.getRightmostContext ? oRootViewController.getRightmostContext() : oSource.getBindingContext();
      this.base._routing.navigateToContext(oContext, {
        sLayout: sNextLayout
      }).catch(function () {
        Log.warning("cannot switch between column and fullscreen");
      });
    }

    /**
     * Closes the column for the current view in a FCL.
     *
     * @ui5-restricted
     */;
    _proto.closeColumn = function closeColumn() {
      const oViewData = this._oView.getViewData();
      const oContext = this._oView.getBindingContext();
      const oMetaModel = oContext.getModel().getMetaModel();
      const navigationParameters = {
        noPreservationCache: true,
        sLayout: this._oView.getModel("fclhelper").getProperty("/actionButtonsInfo/closeColumn")
      };
      if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) === 1 && ModelHelper.isDraftSupported(oMetaModel, oContext.getPath())) {
        draft.processDataLossOrDraftDiscardConfirmation(() => {
          this.navigateBackFromContext(oContext, navigationParameters);
        }, Function.prototype, oContext, this._oView.getController(), false, draft.NavigationType.BackNavigation);
      } else {
        this.navigateBackFromContext(oContext, navigationParameters);
      }
    };
    return InternalRouting;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeBinding", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToTarget", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToTarget"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToRoute", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToRoute"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToContext", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromContext", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateForwardToContext", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateForwardToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromTransientState", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromTransientState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToMessagePage", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToMessagePage"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isCurrentStateImpactedBy", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "isCurrentStateImpactedBy"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataReceived", [_dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "switchFullScreen", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "switchFullScreen"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "closeColumn", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "closeColumn"), _class2.prototype)), _class2)) || _class);
  return InternalRouting;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbFJvdXRpbmciLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJmaW5hbEV4dGVuc2lvbiIsIkJlZm9yZSIsIm9uRXhpdCIsIl9vUm91dGluZ1NlcnZpY2UiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJfZm5Sb3V0ZU1hdGNoZWRCb3VuZCIsIm9uSW5pdCIsIl9vVmlldyIsImJhc2UiLCJnZXRWaWV3IiwiX29BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsIl9vUGFnZUNvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiX29Sb3V0ZXIiLCJnZXRSb3V0ZXIiLCJfb1JvdXRlclByb3h5IiwiZ2V0Um91dGVyUHJveHkiLCJFcnJvciIsImdldFNlcnZpY2UiLCJ0aGVuIiwib1JvdXRpbmdTZXJ2aWNlIiwiX29uUm91dGVNYXRjaGVkIiwiYmluZCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIl9vVGFyZ2V0SW5mb3JtYXRpb24iLCJnZXRUYXJnZXRJbmZvcm1hdGlvbkZvciIsImNhdGNoIiwib25Sb3V0ZU1hdGNoZWQiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25CZWZvcmVCaW5kaW5nIiwib0JpbmRpbmdDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJvUm91dGluZyIsImdldENvbnRyb2xsZXIiLCJyb3V0aW5nIiwib25BZnRlckJpbmRpbmciLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJvbkNvbnRleHRCb3VuZFRvVmlldyIsIm5hdmlnYXRlVG9UYXJnZXQiLCJvQ29udGV4dCIsInNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiIsIm9EZXRhaWxSb3V0ZSIsImRldGFpbCIsInNSb3V0ZU5hbWUiLCJyb3V0ZSIsIm1QYXJhbWV0ZXJNYXBwaW5nIiwicGFyYW1ldGVycyIsIm5hdmlnYXRlVG8iLCJnZXRWaWV3RGF0YSIsIm5hdmlnYXRlVG9Sb3V0ZSIsInNUYXJnZXRSb3V0ZU5hbWUiLCJvUGFyYW1ldGVycyIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib0NvbnRleHRJbmZvIiwiaXNBIiwiYXN5bmNDb250ZXh0IiwiYWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJlZGl0YWJsZSIsImJQZXJzaXN0T1BTY3JvbGwiLCJ1cGRhdGVGQ0xMZXZlbCIsImJGb3JjZUZvY3VzIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJiRGVmZXJyZWRDb250ZXh0IiwiY2FsbEV4dGVuc2lvbiIsIm9JbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJzZXRQcm9wZXJ0eSIsInNvdXJjZUJpbmRpbmdDb250ZXh0IiwiZ2V0T2JqZWN0IiwiYmluZGluZ0NvbnRleHQiLCJvRXZlbnQiLCJiT3ZlcnJpZGVOYXYiLCJvbkJlZm9yZU5hdmlnYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsIkZDTExldmVsIiwiX2dldEZDTExldmVsIiwibmF2aWdhdGVCYWNrRnJvbUNvbnRleHQiLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5IiwibmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlIiwic0hhc2giLCJnZXRIYXNoIiwiaW5kZXhPZiIsIm5hdkJhY2siLCJuYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UiLCJzRXJyb3JNZXNzYWdlIiwibmF2VG9IYXNoIiwiZ2V0RGVmYXVsdENyZWF0ZUhhc2giLCJkaXNwbGF5RXJyb3JQYWdlIiwiaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5IiwiX2lzVmlld1BhcnRPZlJvdXRlIiwicm91dGVJbmZvcm1hdGlvbiIsImFUYXJnZXRzIiwidGFyZ2V0cyIsInRhcmdldE5hbWUiLCJ2aWV3TGV2ZWwiLCJyb3V0ZUxldmVsIiwiX3NldEJpbmRpbmdDb250ZXh0IiwiX2J1aWxkQmluZGluZ1BhdGgiLCJyb3V0ZUFyZ3VtZW50cyIsImJpbmRpbmdQYXR0ZXJuIiwibmF2aWdhdGlvblBhcmFtZXRlcnMiLCJwYXRoIiwicmVwbGFjZSIsImRlZmVycmVkIiwic0tleSIsInNWYWx1ZSIsImJUYXJnZXRFZGl0YWJsZSIsImhhc093blByb3BlcnR5IiwiYkFjdGlvbkNyZWF0ZSIsImdldFBhcmFtZXRlciIsImdldEJpbmRpbmdDb250ZXh0UGF0dGVybiIsImNvbnRleHRQYXR0ZXJuIiwidW5kZWZpbmVkIiwibUFyZ3VtZW50cyIsImdldFBhcmFtZXRlcnMiLCJhcmd1bWVudHMiLCJvTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvTW9kZWwiLCJvT3V0IiwiX2JpbmREZWZlcnJlZCIsIl9iaW5kUGFnZSIsImZpbmFsbHkiLCJ1cGRhdGVVSVN0YXRlRm9yVmlldyIsInNUYXJnZXRQYXRoIiwib0FzeW5jQ29udGV4dCIsImNyZWF0ZURlZmVycmVkQ29udGV4dCIsInVzZUNvbnRleHQiLCJjdXJyZW50QmluZGluZ0NvbnRleHQiLCJfZ2V0QmluZGluZ0NvbnRleHQiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJfYmluZFBhZ2VUb0NvbnRleHQiLCJfcmVzb2x2ZVNlbWFudGljUGF0aCIsInNUZWNobmljYWxQYXRoIiwiX2JpbmRQYWdlVG9QYXRoIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImdldFRleHQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsIl9jcmVhdGVGaWx0ZXJGcm9tU2VtYW50aWNQYXRoIiwic1NlbWFudGljUGF0aCIsImFTZW1hbnRpY0tleXMiLCJvTWV0YU1vZGVsIiwiZm5VbnF1b3RlQW5kRGVjb2RlIiwibGFzdEluZGV4T2YiLCJsZW5ndGgiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdWJzdHJpbmciLCJhS2V5VmFsdWVzIiwic3BsaXQiLCJhRmlsdGVycyIsImJGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiTW9kZWxIZWxwZXIiLCJpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUiLCJzS2V5VmFsdWUiLCJGaWx0ZXIiLCIkUHJvcGVydHlQYXRoIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwidmFsdWUxIiwiY2FzZVNlbnNpdGl2ZSIsIm1LZXlWYWx1ZXMiLCJmb3JFYWNoIiwic0tleUFzc2lnbm1lbnQiLCJhUGFydHMiLCJiRmFpbGVkIiwibWFwIiwib1NlbWFudGljS2V5Iiwib0RyYWZ0RmlsdGVyIiwiZmlsdGVycyIsImFuZCIsInB1c2giLCJfZ2V0VGVjaG5pY2FsUGF0aEZyb21TZW1hbnRpY1BhdGgiLCJnZXRNZXRhTW9kZWwiLCJzRW50aXR5U2V0UGF0aCIsImdldE1ldGFDb250ZXh0IiwiZ2V0UGF0aCIsIm9GaWx0ZXIiLCJzdGFydHNXaXRoIiwib0xpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkJGdyb3VwSWQiLCJyZXF1ZXN0Q29udGV4dHMiLCJvQ29udGV4dHMiLCJfY2hlY2tQYXRoRm9yU2VtYW50aWNCb29rbWFya2luZyIsInNQYXRoIiwiYU1hdGNoZXMiLCJleGVjIiwib0RyYWZ0Um9vdCIsIm9EcmFmdE5vZGUiLCJzUGF0aFRvUmVzb2x2ZSIsIm9MYXN0U2VtYW50aWNNYXBwaW5nIiwiZ2V0TGFzdFNlbWFudGljTWFwcGluZyIsInNDdXJyZW50SGFzaE5vUGFyYW1zIiwiZ2V0SGFzaENoYW5nZXIiLCJzUm9vdEVudGl0eU5hbWUiLCJzdWJzdHIiLCJiQWxsb3dTZW1hbnRpY0Jvb2ttYXJrIiwiU2VtYW50aWNLZXlIZWxwZXIiLCJnZXRTZW1hbnRpY0tleXMiLCJzZW1hbnRpY1BhdGgiLCJ0ZWNobmljYWxQYXRoIiwic2V0TGFzdFNlbWFudGljTWFwcGluZyIsIm9DdXJyZW50Q29udGV4dCIsInNDdXJyZW50UGF0aCIsIm9Vc2VDb250ZXh0Iiwib1Jvb3RWaWV3Q29udHJvbGxlciIsImlzRmNsRW5hYmxlZCIsInJlYXNvbiIsIk5hdmlnYXRpb25SZWFzb24iLCJSb3dQcmVzcyIsIm1ldGFNb2RlbCIsInJlZnJlc2giLCJpc0Nvbm5lY3RlZCIsImlzRHJhZnRTdXBwb3J0ZWQiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIl9jcmVhdGVDb250ZXh0IiwiQXBwU3RhdGVDaGFuZ2VkIiwiRWRpdFN0YXRlIiwiaXNFZGl0U3RhdGVEaXJ0eSIsIl9yZWZyZXNoQmluZGluZ0NvbnRleHQiLCJvUGFyZW50TGlzdEJpbmRpbmciLCJfc2V0S2VlcEFsaXZlIiwiaXNDb250ZXh0VXNlZEluUGFnZXMiLCJsaXN0QmluZGluZyIsImJEcmFmdE5hdmlnYXRpb24iLCJzaG93UGxhY2Vob2xkZXIiLCJiU2hvd1BsYWNlaG9sZGVyIiwib1BhZ2VDb21wb25lbnQiLCJzRW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0Iiwic0NvbnRleHRQYXRoIiwiZ2V0Q29udGV4dFBhdGgiLCIkJHVwZGF0ZUdyb3VwSWQiLCIkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIiwiX2dldEtlZXBBbGl2ZUNvbnRleHQiLCJyZXF1ZXN0UHJvcGVydHkiLCJyZXF1ZXN0T2JqZWN0IiwicmVxdWVzdFNpZGVFZmZlY3RzIiwic01lc3NhZ2VzUGF0aCIsIiRzZWxlY3QiLCJvUHJldmlvdXNCaW5kaW5nIiwiZGVzdHJveSIsIm9IaWRkZW5CaW5kaW5nIiwiYmluZENvbnRleHQiLCJhdHRhY2hFdmVudE9uY2UiLCJCdXN5TG9ja2VyIiwibG9jayIsIm9uRGF0YVJlY2VpdmVkIiwiZ2V0Qm91bmRDb250ZXh0Iiwic0Vycm9yRGVzY3JpcHRpb24iLCJpc0xvY2tlZCIsInVubG9jayIsIm1lc3NhZ2VIYW5kbGVyIiwibVBhcmFtcyIsInN0YXR1cyIsImlzSW5pdGlhbExvYWQ1MDNFcnJvciIsInNoZWxsQmFjayIsImlzRGF0YVJlY2VpdmVkRXJyb3IiLCJzaG93TWVzc2FnZXMiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwic1Jvb3RDb250ZXh0UGF0aCIsImFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocyIsImFQcm9wZXJ0eVBhdGhzIiwib1NpZGVFZmZlY3RzIiwidGFyZ2V0UHJvcGVydGllcyIsInRhcmdldEVudGl0aWVzIiwiZ2V0QmluZGluZ1BhdGhzIiwib0JpbmRpbmciLCJhRGVwZW5kZW50QmluZGluZ3MiLCJzUmVsYXRpdmVQYXRoIiwiZ2V0Q29udGV4dCIsInNsaWNlIiwiZ2V0RGVwZW5kZW50QmluZGluZ3MiLCJpIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJyZWR1Y2UiLCJ0YXJnZXRQcm9wZXJ0eSIsImluZGV4Iiwib1ByZXZpb3VzQ29udGV4dCIsIm9UYXJnZXRDb250cm9sIiwic2V0QmluZGluZ0NvbnRleHQiLCJpc0tlZXBBbGl2ZSIsImJLZWVwQWxpdmUiLCJmbkJlZm9yZURlc3Ryb3kiLCJiUmVxdWVzdE1lc3NhZ2VzIiwiZW5kc1dpdGgiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsInNldEtlZXBBbGl2ZSIsImtlcHRBbGl2ZVNlZ21lbnRzIiwiYWRkaXRpb25uYWxTZWdtZW50cyIsInBvcCIsImtlcHRBbGl2ZVBhdGgiLCJqb2luIiwib0tlZXBBbGl2ZUNvbnRleHQiLCJnZXRLZWVwQWxpdmVDb250ZXh0IiwicmV2ZXJzZSIsImFkZGl0aW9ubmFsUGF0aCIsInN3aXRjaEZ1bGxTY3JlZW4iLCJvU291cmNlIiwib0ZDTEhlbHBlck1vZGVsIiwiYklzRnVsbFNjcmVlbiIsInNOZXh0TGF5b3V0IiwiZ2V0UmlnaHRtb3N0Q29udGV4dCIsIl9yb3V0aW5nIiwic0xheW91dCIsIndhcm5pbmciLCJjbG9zZUNvbHVtbiIsIm9WaWV3RGF0YSIsIm5vUHJlc2VydmF0aW9uQ2FjaGUiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiRnVuY3Rpb24iLCJwcm90b3R5cGUiLCJOYXZpZ2F0aW9uVHlwZSIsIkJhY2tOYXZpZ2F0aW9uIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZXJuYWxSb3V0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgeyBpc0Nvbm5lY3RlZCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IE5hdmlnYXRpb25SZWFzb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvTmF2aWdhdGlvblJlYXNvblwiO1xuaW1wb3J0IHR5cGUgUm91dGVyUHJveHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvUm91dGVyUHJveHlcIjtcbmltcG9ydCB0eXBlIHsgRW5oYW5jZVdpdGhVSTUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgbWV0aG9kT3ZlcnJpZGUsIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEVkaXRTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9FZGl0U3RhdGVcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgUm91dGluZ1NlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvUm91dGluZ1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBUZW1wbGF0ZUNvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVDb21wb25lbnRcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IHsgU2lkZUVmZmVjdHNUYXJnZXRUeXBlIH0gZnJvbSBcIi4uL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcblxuLyoqXG4gKiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLkNvbnRyb2xsZXJFeHRlbnNpb24gQ29udHJvbGxlciBleHRlbnNpb259XG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsUm91dGluZ1xuICogQHByaXZhdGVcbiAqIEBzaW5jZSAxLjc0LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuSW50ZXJuYWxSb3V0aW5nXCIpXG5jbGFzcyBJbnRlcm5hbFJvdXRpbmcgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJpdmF0ZSBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0cHJpdmF0ZSBfb1ZpZXchOiBWaWV3O1xuXG5cdHByaXZhdGUgX29BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0cHJpdmF0ZSBfb1BhZ2VDb21wb25lbnQhOiBFbmhhbmNlV2l0aFVJNTxUZW1wbGF0ZUNvbXBvbmVudD4gfCBudWxsO1xuXG5cdHByaXZhdGUgX29Sb3V0ZXIhOiBSb3V0ZXI7XG5cblx0cHJpdmF0ZSBfb1JvdXRpbmdTZXJ2aWNlITogUm91dGluZ1NlcnZpY2U7XG5cblx0cHJpdmF0ZSBfb1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cblx0cHJpdmF0ZSBfZm5Sb3V0ZU1hdGNoZWRCb3VuZCE6IEZ1bmN0aW9uO1xuXG5cdHByb3RlY3RlZCBfb1RhcmdldEluZm9ybWF0aW9uOiBhbnk7XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25FeGl0KCkge1xuXHRcdGlmICh0aGlzLl9vUm91dGluZ1NlcnZpY2UpIHtcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5kZXRhY2hSb3V0ZU1hdGNoZWQodGhpcy5fZm5Sb3V0ZU1hdGNoZWRCb3VuZCk7XG5cdFx0fVxuXHR9XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX29WaWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHR0aGlzLl9vQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX29WaWV3KTtcblx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzLl9vVmlldykgYXMgRW5oYW5jZVdpdGhVSTU8VGVtcGxhdGVDb21wb25lbnQ+O1xuXHRcdHRoaXMuX29Sb3V0ZXIgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldFJvdXRlcigpO1xuXHRcdHRoaXMuX29Sb3V0ZXJQcm94eSA9ICh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um91dGVyUHJveHkoKTtcblxuXHRcdGlmICghdGhpcy5fb0FwcENvbXBvbmVudCB8fCAhdGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBpbml0aWFsaXplIGNvbnRyb2xlciBleHRlbnNpb24gJ3NhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlc2lvbnMuSW50ZXJuYWxSb3V0aW5nXCIpO1xuXHRcdH1cblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0aWYgKHRoaXMuX29BcHBDb21wb25lbnQgPT09IHRoaXMuX29QYWdlQ29tcG9uZW50KSB7XG5cdFx0XHQvLyBUaGUgdmlldyBpc24ndCBob3N0ZWQgaW4gYSBkZWRpY2F0ZWQgVUlDb21wb25lbnQsIGJ1dCBkaXJlY3RseSBpbiB0aGUgYXBwXG5cdFx0XHQvLyAtLT4ganVzdCBrZWVwIHRoZSB2aWV3XG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5fb0FwcENvbXBvbmVudFxuXHRcdFx0LmdldFNlcnZpY2UoXCJyb3V0aW5nU2VydmljZVwiKVxuXHRcdFx0LnRoZW4oKG9Sb3V0aW5nU2VydmljZTogUm91dGluZ1NlcnZpY2UpID0+IHtcblx0XHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlID0gb1JvdXRpbmdTZXJ2aWNlO1xuXHRcdFx0XHR0aGlzLl9mblJvdXRlTWF0Y2hlZEJvdW5kID0gdGhpcy5fb25Sb3V0ZU1hdGNoZWQuYmluZCh0aGlzKTtcblx0XHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mblJvdXRlTWF0Y2hlZEJvdW5kKTtcblx0XHRcdFx0dGhpcy5fb1RhcmdldEluZm9ybWF0aW9uID0gb1JvdXRpbmdTZXJ2aWNlLmdldFRhcmdldEluZm9ybWF0aW9uRm9yKHRoaXMuX29QYWdlQ29tcG9uZW50IHx8IHRoaXMuX29WaWV3KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGNhbm5vdCB3b3JrIHdpdGhvdXQgYSAncm91dGluZ1NlcnZpY2UnIG9uIHRoZSBtYWluIEFwcENvbXBvbmVudFwiKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJlZCBldmVyeSB0aW1lIHRoaXMgY29udHJvbGxlciBpcyBhIG5hdmlnYXRpb24gdGFyZ2V0LlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblJvdXRlTWF0Y2hlZCgpIHtcblx0XHQvKiovXG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUm91dGVNYXRjaGVkRmluaXNoZWQoKSB7XG5cdFx0LyoqL1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvbkJlZm9yZUJpbmRpbmcob0JpbmRpbmdDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55KSB7XG5cdFx0Y29uc3Qgb1JvdXRpbmcgPSAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5yb3V0aW5nO1xuXHRcdGlmIChvUm91dGluZyAmJiBvUm91dGluZy5vbkJlZm9yZUJpbmRpbmcpIHtcblx0XHRcdG9Sb3V0aW5nLm9uQmVmb3JlQmluZGluZyhvQmluZGluZ0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dDogYW55LCBtUGFyYW1ldGVycz86IGFueSkge1xuXHRcdCh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkub25Db250ZXh0Qm91bmRUb1ZpZXcob0JpbmRpbmdDb250ZXh0KTtcblx0XHRjb25zdCBvUm91dGluZyA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLnJvdXRpbmc7XG5cdFx0aWYgKG9Sb3V0aW5nICYmIG9Sb3V0aW5nLm9uQWZ0ZXJCaW5kaW5nKSB7XG5cdFx0XHRvUm91dGluZy5vbkFmdGVyQmluZGluZyhvQmluZGluZ0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBNZXRob2RzIHRyaWdnZXJpbmcgYSBuYXZpZ2F0aW9uIGFmdGVyIGEgdXNlciBhY3Rpb25cblx0Ly8gKGUuZy4gY2xpY2sgb24gYSB0YWJsZSByb3csIGJ1dHRvbiwgZXRjLi4uKVxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIHNwZWNpZmllZCBuYXZpZ2F0aW9uIHRhcmdldC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSBOYW1lIG9mIHRoZSBuYXZpZ2F0aW9uIHRhcmdldFxuXHQgKiBAcGFyYW0gYlByZXNlcnZlSGlzdG9yeSBUcnVlIHRvIGZvcmNlIHRoZSBuZXcgVVJMIHRvIGJlIGFkZGVkIGF0IHRoZSBlbmQgb2YgdGhlIGJyb3dzZXIgaGlzdG9yeSAobm8gcmVwbGFjZSlcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb1RhcmdldChvQ29udGV4dDogYW55LCBzTmF2aWdhdGlvblRhcmdldE5hbWU6IHN0cmluZywgYlByZXNlcnZlSGlzdG9yeT86IGJvb2xlYW4pIHtcblx0XHRjb25zdCBvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24gPVxuXHRcdFx0dGhpcy5fb1BhZ2VDb21wb25lbnQgJiZcblx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50LmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uICYmXG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihzTmF2aWdhdGlvblRhcmdldE5hbWUpO1xuXHRcdGlmIChvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24pIHtcblx0XHRcdGNvbnN0IG9EZXRhaWxSb3V0ZSA9IG9OYXZpZ2F0aW9uQ29uZmlndXJhdGlvbi5kZXRhaWw7XG5cdFx0XHRjb25zdCBzUm91dGVOYW1lID0gb0RldGFpbFJvdXRlLnJvdXRlO1xuXHRcdFx0Y29uc3QgbVBhcmFtZXRlck1hcHBpbmcgPSBvRGV0YWlsUm91dGUucGFyYW1ldGVycztcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvKG9Db250ZXh0LCBzUm91dGVOYW1lLCBtUGFyYW1ldGVyTWFwcGluZywgYlByZXNlcnZlSGlzdG9yeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvKG9Db250ZXh0LCBudWxsLCBudWxsLCBiUHJlc2VydmVIaXN0b3J5KTtcblx0XHR9XG5cdFx0dGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIHNwZWNpZmllZCBuYXZpZ2F0aW9uIHRhcmdldCByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb1BhcmFtZXRlcnNdIFBhcmFtZXRlcnMgdG8gYmUgdXNlZCB3aXRoIHJvdXRlIHRvIGNyZWF0ZSB0aGUgdGFyZ2V0IGhhc2hcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lOiBzdHJpbmcsIG9QYXJhbWV0ZXJzPzogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvUm91dGUoc1RhcmdldFJvdXRlTmFtZSwgb1BhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhIHNwZWNpZmljIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBvQ29udGV4dEluZm86IGFueSA9IHt9O1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cblx0XHRpZiAob0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5hc3luY0NvbnRleHQpIHtcblx0XHRcdFx0Ly8gdGhlIGNvbnRleHQgaXMgZWl0aGVyIGNyZWF0ZWQgYXN5bmMgKFByb21pc2UpXG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gYWN0aXZhdGUgdGhlIHJvdXRlTWF0Y2hTeW5jaHJvIG9uIHRoZSBSb3V0ZXJQcm94eSB0byBhdm9pZCB0aGF0XG5cdFx0XHRcdC8vIHRoZSBzdWJzZXF1ZW50IGNhbGwgdG8gbmF2aWdhdGVUb0NvbnRleHQgY29uZmxpY3RzIHdpdGggdGhlIGN1cnJlbnQgb25lXG5cdFx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5hY3RpdmF0ZVJvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24oKTtcblxuXHRcdFx0XHRtUGFyYW1ldGVycy5hc3luY0NvbnRleHRcblx0XHRcdFx0XHQudGhlbigoYXN5bmNDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdC8vIG9uY2UgdGhlIGNvbnRleHQgaXMgcmV0dXJuZWQgd2UgbmF2aWdhdGUgaW50byBpdFxuXHRcdFx0XHRcdFx0dGhpcy5uYXZpZ2F0ZVRvQ29udGV4dChhc3luY0NvbnRleHQsIHtcblx0XHRcdFx0XHRcdFx0Y2hlY2tOb0hhc2hDaGFuZ2U6IG1QYXJhbWV0ZXJzLmNoZWNrTm9IYXNoQ2hhbmdlLFxuXHRcdFx0XHRcdFx0XHRlZGl0YWJsZTogbVBhcmFtZXRlcnMuZWRpdGFibGUsXG5cdFx0XHRcdFx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IG1QYXJhbWV0ZXJzLmJQZXJzaXN0T1BTY3JvbGwsXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZUZDTExldmVsOiBtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCxcblx0XHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IG1QYXJhbWV0ZXJzLmJGb3JjZUZvY3VzXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdpdGggdGhlIGFzeW5jIGNvbnRleHRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoIW1QYXJhbWV0ZXJzLmJEZWZlcnJlZENvbnRleHQpIHtcblx0XHRcdFx0Ly8gTmF2aWdhdGUgdG8gYSBsaXN0IGJpbmRpbmcgbm90IHlldCBzdXBwb3J0ZWRcblx0XHRcdFx0dGhyb3cgXCJuYXZpZ2F0aW9uIHRvIGEgbGlzdCBiaW5kaW5nIGlzIG5vdCB5ZXQgc3VwcG9ydGVkXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNhbGxFeHRlbnNpb24pIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsID0gdGhpcy5fb1ZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9wYWdpbmF0b3JDdXJyZW50Q29udGV4dFwiLCBudWxsKTtcblxuXHRcdFx0b0NvbnRleHRJbmZvLnNvdXJjZUJpbmRpbmdDb250ZXh0ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRvQ29udGV4dEluZm8uYmluZGluZ0NvbnRleHQgPSBvQ29udGV4dDtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5vRXZlbnQpIHtcblx0XHRcdFx0b0NvbnRleHRJbmZvLm9FdmVudCA9IG1QYXJhbWV0ZXJzLm9FdmVudDtcblx0XHRcdH1cblx0XHRcdC8vIFN0b3JpbmcgdGhlIHNlbGVjdGVkIGNvbnRleHQgdG8gdXNlIGl0IGluIGludGVybmFsIHJvdXRlIG5hdmlnYXRpb24gaWYgbmVjY2Vzc2FyeS5cblx0XHRcdGNvbnN0IGJPdmVycmlkZU5hdiA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLnJvdXRpbmcub25CZWZvcmVOYXZpZ2F0aW9uKG9Db250ZXh0SW5mbyk7XG5cdFx0XHRpZiAoYk92ZXJyaWRlTmF2KSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3BhZ2luYXRvckN1cnJlbnRDb250ZXh0XCIsIG9Db250ZXh0KTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0bVBhcmFtZXRlcnMuRkNMTGV2ZWwgPSB0aGlzLl9nZXRGQ0xMZXZlbCgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCwgbVBhcmFtZXRlcnMsIHRoaXMuX29WaWV3LmdldFZpZXdEYXRhKCksIHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbik7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGJhY2t3YXJkcyBmcm9tIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgbmF2aWdhdGVkIGZyb21cblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpIHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsID0gLTE7XG5cblx0XHRyZXR1cm4gdGhpcy5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyBmb3J3YXJkcyB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0aWYgKHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik/LmdldFByb3BlcnR5KFwibWVzc2FnZUZvb3RlckNvbnRhaW5zRXJyb3JzXCIpID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdH1cblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdG1QYXJhbWV0ZXJzLnVwZGF0ZUZDTExldmVsID0gMTtcblxuXHRcdHJldHVybiB0aGlzLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGJhY2sgaW4gaGlzdG9yeSBpZiB0aGUgY3VycmVudCBoYXNoIGNvcnJlc3BvbmRzIHRvIGEgdHJhbnNpZW50IHN0YXRlLlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSgpIHtcblx0XHRjb25zdCBzSGFzaCA9IHRoaXMuX29Sb3V0ZXJQcm94eS5nZXRIYXNoKCk7XG5cblx0XHQvLyBpZiB0cmlnZ2VyZWQgd2hpbGUgbmF2aWdhdGluZyB0byAoLi4uKSwgd2UgbmVlZCB0byBuYXZpZ2F0ZSBiYWNrXG5cdFx0aWYgKHNIYXNoLmluZGV4T2YoXCIoLi4uKVwiKSAhPT0gLTEpIHtcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5uYXZCYWNrKCk7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9NZXNzYWdlUGFnZShzRXJyb3JNZXNzYWdlOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdGlmIChcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5nZXRIYXNoKCkuaW5kZXhPZihcImktYWN0aW9uPWNyZWF0ZVwiKSA+IC0xIHx8XG5cdFx0XHR0aGlzLl9vUm91dGVyUHJveHkuZ2V0SGFzaCgpLmluZGV4T2YoXCJpLWFjdGlvbj1hdXRvQ3JlYXRlXCIpID4gLTFcblx0XHQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9vUm91dGVyUHJveHkubmF2VG9IYXNoKHRoaXMuX29Sb3V0aW5nU2VydmljZS5nZXREZWZhdWx0Q3JlYXRlSGFzaCgpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bVBhcmFtZXRlcnMuRkNMTGV2ZWwgPSB0aGlzLl9nZXRGQ0xMZXZlbCgpO1xuXG5cdFx0XHRyZXR1cm4gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5kaXNwbGF5RXJyb3JQYWdlKHNFcnJvck1lc3NhZ2UsIG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIG9uZSBvZiB0aGUgY3VycmVudCB2aWV3cyBvbiB0aGUgc2NyZWVuIGlzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgc3RhdGUgaXMgaW1wYWN0ZWQgYnkgdGhlIGNvbnRleHRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmlzQ3VycmVudFN0YXRlSW1wYWN0ZWRCeShvQ29udGV4dCk7XG5cdH1cblxuXHRfaXNWaWV3UGFydE9mUm91dGUocm91dGVJbmZvcm1hdGlvbjogYW55KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgYVRhcmdldHMgPSByb3V0ZUluZm9ybWF0aW9uPy50YXJnZXRzO1xuXHRcdGlmICghYVRhcmdldHMgfHwgYVRhcmdldHMuaW5kZXhPZih0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24udGFyZ2V0TmFtZSkgPT09IC0xKSB7XG5cdFx0XHQvLyBJZiB0aGUgdGFyZ2V0IGZvciB0aGlzIHZpZXcgaGFzIGEgdmlldyBsZXZlbCBncmVhdGVyIHRoYW4gdGhlIHJvdXRlIGxldmVsLCBpdCBtZWFucyB0aGlzIHZpZXcgY29tZXMgXCJhZnRlclwiIHRoZSByb3V0ZVxuXHRcdFx0Ly8gaW4gdGVybXMgb2YgbmF2aWdhdGlvbi5cblx0XHRcdC8vIEluIHN1Y2ggY2FzZSwgd2UgcmVtb3ZlIGl0cyBiaW5kaW5nIGNvbnRleHQsIHRvIGF2b2lkIHRoaXMgdmlldyB0byBoYXZlIGRhdGEgaWYgd2UgbmF2aWdhdGUgdG8gaXQgbGF0ZXIgb25cblx0XHRcdGlmICgodGhpcy5fb1RhcmdldEluZm9ybWF0aW9uLnZpZXdMZXZlbCA/PyAwKSA+PSAocm91dGVJbmZvcm1hdGlvbj8ucm91dGVMZXZlbCA/PyAwKSkge1xuXHRcdFx0XHR0aGlzLl9zZXRCaW5kaW5nQ29udGV4dChudWxsKTsgLy8gVGhpcyBhbHNvIGNhbGwgc2V0S2VlcEFsaXZlKGZhbHNlKSBvbiB0aGUgY3VycmVudCBjb250ZXh0XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRfYnVpbGRCaW5kaW5nUGF0aChyb3V0ZUFyZ3VtZW50czogYW55LCBiaW5kaW5nUGF0dGVybjogc3RyaW5nLCBuYXZpZ2F0aW9uUGFyYW1ldGVyczogYW55KTogeyBwYXRoOiBzdHJpbmc7IGRlZmVycmVkOiBib29sZWFuIH0ge1xuXHRcdGxldCBwYXRoID0gYmluZGluZ1BhdHRlcm4ucmVwbGFjZShcIjo/cXVlcnk6XCIsIFwiXCIpO1xuXHRcdGxldCBkZWZlcnJlZCA9IGZhbHNlO1xuXG5cdFx0Zm9yIChjb25zdCBzS2V5IGluIHJvdXRlQXJndW1lbnRzKSB7XG5cdFx0XHRjb25zdCBzVmFsdWUgPSByb3V0ZUFyZ3VtZW50c1tzS2V5XTtcblx0XHRcdGlmIChzVmFsdWUgPT09IFwiLi4uXCIgJiYgYmluZGluZ1BhdHRlcm4uaW5kZXhPZihgeyR7c0tleX19YCkgPj0gMCkge1xuXHRcdFx0XHRkZWZlcnJlZCA9IHRydWU7XG5cdFx0XHRcdC8vIFNvbWV0aW1lcyBpbiBwcmVmZXJyZWRNb2RlID0gY3JlYXRlLCB0aGUgZWRpdCBidXR0b24gaXMgc2hvd24gaW4gYmFja2dyb3VuZCB3aGVuIHRoZVxuXHRcdFx0XHQvLyBhY3Rpb24gcGFyYW1ldGVyIGRpYWxvZyBzaG93cyB1cCwgc2V0dGluZyBiVGFyZ2V0RWRpdGFibGUgcGFzc2VzIGVkaXRhYmxlIGFzIHRydWVcblx0XHRcdFx0Ly8gdG8gb25CZWZvcmVCaW5kaW5nIGluIF9iaW5kVGFyZ2V0UGFnZSBmdW5jdGlvblxuXHRcdFx0XHRuYXZpZ2F0aW9uUGFyYW1ldGVycy5iVGFyZ2V0RWRpdGFibGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cGF0aCA9IHBhdGgucmVwbGFjZShgeyR7c0tleX19YCwgc1ZhbHVlKTtcblx0XHR9XG5cdFx0aWYgKHJvdXRlQXJndW1lbnRzW1wiP3F1ZXJ5XCJdICYmIHJvdXRlQXJndW1lbnRzW1wiP3F1ZXJ5XCJdLmhhc093blByb3BlcnR5KFwiaS1hY3Rpb25cIikpIHtcblx0XHRcdG5hdmlnYXRpb25QYXJhbWV0ZXJzLmJBY3Rpb25DcmVhdGUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIHRoZSBiaW5kaW5nIHBhdGggaXMgYWx3YXlzIGFic29sdXRlXG5cdFx0aWYgKHBhdGggJiYgcGF0aFswXSAhPT0gXCIvXCIpIHtcblx0XHRcdHBhdGggPSBgLyR7cGF0aH1gO1xuXHRcdH1cblxuXHRcdHJldHVybiB7IHBhdGgsIGRlZmVycmVkIH07XG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBNZXRob2RzIHRvIGJpbmQgdGhlIHBhZ2Ugd2hlbiBhIHJvdXRlIGlzIG1hdGNoZWRcblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYSByb3V0ZSBpcyBtYXRjaGVkLlxuXHQgKiBCdWlsZHMgdGhlIGJpbmRpbmcgY29udGV4dCBmcm9tIHRoZSBuYXZpZ2F0aW9uIHBhcmFtZXRlcnMsIGFuZCBiaW5kIHRoZSBwYWdlIGFjY29yZGluZ2x5LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X29uUm91dGVNYXRjaGVkKG9FdmVudDogRXZlbnQpIHtcblx0XHQvLyBDaGVjayBpZiB0aGUgdGFyZ2V0IGZvciB0aGlzIHZpZXcgaXMgcGFydCBvZiB0aGUgZXZlbnQgdGFyZ2V0cyAoaS5lLiBpcyBhIHRhcmdldCBmb3IgdGhlIGN1cnJlbnQgcm91dGUpLlxuXHRcdC8vIElmIG5vdCwgd2UgZG9uJ3QgbmVlZCB0byBiaW5kIGl0IC0tPiByZXR1cm5cblx0XHRpZiAoIXRoaXMuX2lzVmlld1BhcnRPZlJvdXRlKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJyb3V0ZUluZm9ybWF0aW9uXCIpKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFJldHJpZXZlIHRoZSBiaW5kaW5nIGNvbnRleHQgcGF0dGVyblxuXHRcdGxldCBiaW5kaW5nUGF0dGVybjtcblx0XHRpZiAodGhpcy5fb1BhZ2VDb21wb25lbnQgJiYgdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHRQYXR0ZXJuKSB7XG5cdFx0XHRiaW5kaW5nUGF0dGVybiA9IHRoaXMuX29QYWdlQ29tcG9uZW50LmdldEJpbmRpbmdDb250ZXh0UGF0dGVybigpO1xuXHRcdH1cblx0XHRiaW5kaW5nUGF0dGVybiA9IGJpbmRpbmdQYXR0ZXJuIHx8IHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbi5jb250ZXh0UGF0dGVybjtcblxuXHRcdGlmIChiaW5kaW5nUGF0dGVybiA9PT0gbnVsbCB8fCBiaW5kaW5nUGF0dGVybiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBEb24ndCBkbyB0aGlzIGlmIHdlIGFscmVhZHkgZ290IHNUYXJnZXQgPT0gJycsIHdoaWNoIGlzIGEgdmFsaWQgdGFyZ2V0IHBhdHRlcm5cblx0XHRcdGJpbmRpbmdQYXR0ZXJuID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInJvdXRlUGF0dGVyblwiKTtcblx0XHR9XG5cblx0XHQvLyBSZXBsYWNlIHRoZSBwYXJhbWV0ZXJzIGJ5IHRoZWlyIHZhbHVlcyBpbiB0aGUgYmluZGluZyBjb250ZXh0IHBhdHRlcm5cblx0XHRjb25zdCBtQXJndW1lbnRzID0gKG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkgYXMgYW55KS5hcmd1bWVudHM7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25QYXJhbWV0ZXJzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcIm5hdmlnYXRpb25JbmZvXCIpO1xuXHRcdGNvbnN0IHsgcGF0aCwgZGVmZXJyZWQgfSA9IHRoaXMuX2J1aWxkQmluZGluZ1BhdGgobUFyZ3VtZW50cywgYmluZGluZ1BhdHRlcm4sIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cblx0XHR0aGlzLm9uUm91dGVNYXRjaGVkKCk7XG5cblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWw7XG5cdFx0bGV0IG9PdXQ7XG5cdFx0aWYgKGRlZmVycmVkKSB7XG5cdFx0XHRvT3V0ID0gdGhpcy5fYmluZERlZmVycmVkKHBhdGgsIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9PdXQgPSB0aGlzLl9iaW5kUGFnZShwYXRoLCBvTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0fVxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdG9PdXQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHR0aGlzLm9uUm91dGVNYXRjaGVkRmluaXNoZWQoKTtcblx0XHR9KTtcblxuXHRcdCh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkudXBkYXRlVUlTdGF0ZUZvclZpZXcodGhpcy5fb1ZpZXcsIHRoaXMuX2dldEZDTExldmVsKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlZmVycmVkIGJpbmRpbmcgKGR1cmluZyBvYmplY3QgY3JlYXRpb24pLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1RhcmdldFBhdGggVGhlIHBhdGggdG8gdGhlIGRlZmZlcmVkIGNvbnRleHRcblx0ICogQHBhcmFtIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyBOYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgQSBQcm9taXNlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2JpbmREZWZlcnJlZChzVGFyZ2V0UGF0aDogc3RyaW5nLCBvTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdHRoaXMub25CZWZvcmVCaW5kaW5nKG51bGwsIHsgZWRpdGFibGU6IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iVGFyZ2V0RWRpdGFibGUgfSk7XG5cblx0XHRpZiAob05hdmlnYXRpb25QYXJhbWV0ZXJzLmJEZWZlcnJlZENvbnRleHQgfHwgIW9OYXZpZ2F0aW9uUGFyYW1ldGVycy5vQXN5bmNDb250ZXh0KSB7XG5cdFx0XHQvLyBlaXRoZXIgdGhlIGNvbnRleHQgc2hhbGwgYmUgY3JlYXRlZCBpbiB0aGUgdGFyZ2V0IHBhZ2UgKGRlZmVycmVkIENvbnRleHQpIG9yIGl0IHNoYWxsXG5cdFx0XHQvLyBiZSBjcmVhdGVkIGFzeW5jIGJ1dCB0aGUgdXNlciByZWZyZXNoZWQgdGhlIHBhZ2UgLyBib29rbWFya2VkIHRoaXMgVVJMXG5cdFx0XHQvLyBUT0RPOiBjdXJyZW50bHkgdGhlIHRhcmdldCBjb21wb25lbnQgY3JlYXRlcyB0aGlzIGRvY3VtZW50IGJ1dCB3ZSBzaGFsbCBtb3ZlIHRoaXMgdG9cblx0XHRcdC8vIGEgY2VudHJhbCBwbGFjZVxuXHRcdFx0aWYgKHRoaXMuX29QYWdlQ29tcG9uZW50ICYmIHRoaXMuX29QYWdlQ29tcG9uZW50LmNyZWF0ZURlZmVycmVkQ29udGV4dCkge1xuXHRcdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudC5jcmVhdGVEZWZlcnJlZENvbnRleHQoXG5cdFx0XHRcdFx0c1RhcmdldFBhdGgsXG5cdFx0XHRcdFx0b05hdmlnYXRpb25QYXJhbWV0ZXJzLnVzZUNvbnRleHQsXG5cdFx0XHRcdFx0b05hdmlnYXRpb25QYXJhbWV0ZXJzLmJBY3Rpb25DcmVhdGVcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBjdXJyZW50QmluZGluZ0NvbnRleHQgPSB0aGlzLl9nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGlmIChjdXJyZW50QmluZGluZ0NvbnRleHQ/Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdC8vIEZvciBub3cgcmVtb3ZlIHRoZSBwZW5kaW5nIGNoYW5nZXMgdG8gYXZvaWQgdGhlIG1vZGVsIHJhaXNlcyBlcnJvcnMgYW5kIHRoZSBvYmplY3QgcGFnZSBpcyBhdCBsZWFzdCBib3VuZFxuXHRcdFx0Ly8gSWRlYWxseSB0aGUgdXNlciBzaG91bGQgYmUgYXNrZWQgZm9yXG5cdFx0XHRjdXJyZW50QmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdH1cblxuXHRcdC8vIHJlbW92ZSB0aGUgY29udGV4dCB0byBhdm9pZCBzaG93aW5nIG9sZCBkYXRhXG5cdFx0dGhpcy5fc2V0QmluZGluZ0NvbnRleHQobnVsbCk7XG5cblx0XHR0aGlzLm9uQWZ0ZXJCaW5kaW5nKG51bGwpO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2UgZnJvbSBhIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzVGFyZ2V0UGF0aCBUaGUgcGF0aCB0byB0aGUgY29udGV4dFxuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBPRGF0YSBtb2RlbFxuXHQgKiBAcGFyYW0gb05hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgcmVzb2x2ZWQgb25jZSB0aGUgYmluZGluZyBoYXMgYmVlbiBzZXQgb24gdGhlIHBhZ2Vcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfYmluZFBhZ2Uoc1RhcmdldFBhdGg6IHN0cmluZywgb01vZGVsOiBPRGF0YU1vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnM6IG9iamVjdCkge1xuXHRcdGlmIChzVGFyZ2V0UGF0aCA9PT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9iaW5kUGFnZVRvQ29udGV4dChudWxsLCBvTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVycykpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fcmVzb2x2ZVNlbWFudGljUGF0aChzVGFyZ2V0UGF0aCwgb01vZGVsKVxuXHRcdFx0XHQudGhlbigoc1RlY2huaWNhbFBhdGg6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2JpbmRQYWdlVG9QYXRoKHNUZWNobmljYWxQYXRoLCBvTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHQvLyBFcnJvciBoYW5kbGluZyBmb3IgZXJyb25lb3VzIG1ldGFkYXRhIHJlcXVlc3Rcblx0XHRcdFx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXG5cdFx0XHRcdFx0dGhpcy5uYXZpZ2F0ZVRvTWVzc2FnZVBhZ2Uob1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SXCIpLCB7XG5cdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBvRXJyb3IubWVzc2FnZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgZmlsdGVyIHRvIHJldHJpZXZlIGEgY29udGV4dCBjb3JyZXNwb25kaW5nIHRvIGEgc2VtYW50aWMgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHNTZW1hbnRpY1BhdGggVGhlIHNlbWFudGljIHBhdGhcblx0ICogQHBhcmFtIGFTZW1hbnRpY0tleXMgVGhlIHNlbWFudGljIGtleXMgZm9yIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBpbnN0YW5jZSBvZiB0aGUgbWV0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2NyZWF0ZUZpbHRlckZyb21TZW1hbnRpY1BhdGgoc1NlbWFudGljUGF0aDogc3RyaW5nLCBhU2VtYW50aWNLZXlzOiBhbnlbXSwgb01ldGFNb2RlbDogb2JqZWN0KSB7XG5cdFx0Y29uc3QgZm5VbnF1b3RlQW5kRGVjb2RlID0gZnVuY3Rpb24gKHNWYWx1ZTogYW55KSB7XG5cdFx0XHRpZiAoc1ZhbHVlLmluZGV4T2YoXCInXCIpID09PSAwICYmIHNWYWx1ZS5sYXN0SW5kZXhPZihcIidcIikgPT09IHNWYWx1ZS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdC8vIFJlbW92ZSB0aGUgcXVvdGVzIGZyb20gdGhlIHZhbHVlIGFuZCBkZWNvZGUgc3BlY2lhbCBjaGFyc1xuXHRcdFx0XHRzVmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQoc1ZhbHVlLnN1YnN0cmluZygxLCBzVmFsdWUubGVuZ3RoIC0gMSkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNWYWx1ZTtcblx0XHR9O1xuXHRcdGNvbnN0IGFLZXlWYWx1ZXMgPSBzU2VtYW50aWNQYXRoLnN1YnN0cmluZyhzU2VtYW50aWNQYXRoLmluZGV4T2YoXCIoXCIpICsgMSwgc1NlbWFudGljUGF0aC5sZW5ndGggLSAxKS5zcGxpdChcIixcIik7XG5cdFx0bGV0IGFGaWx0ZXJzOiBGaWx0ZXJbXTtcblxuXHRcdGlmIChhU2VtYW50aWNLZXlzLmxlbmd0aCAhPSBhS2V5VmFsdWVzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Y29uc3QgYkZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUgPSBNb2RlbEhlbHBlci5pc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUob01ldGFNb2RlbCk7XG5cblx0XHRpZiAoYVNlbWFudGljS2V5cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdC8vIFRha2UgdGhlIGZpcnN0IGtleSB2YWx1ZVxuXHRcdFx0Y29uc3Qgc0tleVZhbHVlID0gZm5VbnF1b3RlQW5kRGVjb2RlKGFLZXlWYWx1ZXNbMF0pO1xuXHRcdFx0YUZpbHRlcnMgPSBbXG5cdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdHBhdGg6IGFTZW1hbnRpY0tleXNbMF0uJFByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuRVEsXG5cdFx0XHRcdFx0dmFsdWUxOiBzS2V5VmFsdWUsXG5cdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogYkZpbHRlcmluZ0Nhc2VTZW5zaXRpdmVcblx0XHRcdFx0fSlcblx0XHRcdF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG1LZXlWYWx1ZXM6IGFueSA9IHt9O1xuXHRcdFx0Ly8gQ3JlYXRlIGEgbWFwIG9mIGFsbCBrZXkgdmFsdWVzXG5cdFx0XHRhS2V5VmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHNLZXlBc3NpZ25tZW50OiBzdHJpbmcpIHtcblx0XHRcdFx0Y29uc3QgYVBhcnRzID0gc0tleUFzc2lnbm1lbnQuc3BsaXQoXCI9XCIpLFxuXHRcdFx0XHRcdHNLZXlWYWx1ZSA9IGZuVW5xdW90ZUFuZERlY29kZShhUGFydHNbMV0pO1xuXG5cdFx0XHRcdG1LZXlWYWx1ZXNbYVBhcnRzWzBdXSA9IHNLZXlWYWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgYkZhaWxlZCA9IGZhbHNlO1xuXHRcdFx0YUZpbHRlcnMgPSBhU2VtYW50aWNLZXlzLm1hcChmdW5jdGlvbiAob1NlbWFudGljS2V5OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc0tleSA9IG9TZW1hbnRpY0tleS4kUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdHNWYWx1ZSA9IG1LZXlWYWx1ZXNbc0tleV07XG5cblx0XHRcdFx0aWYgKHNWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogc0tleSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0XHRcdHZhbHVlMTogc1ZhbHVlLFxuXHRcdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogYkZpbHRlcmluZ0Nhc2VTZW5zaXRpdmVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRiRmFpbGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0XHRwYXRoOiBcIlhYXCJcblx0XHRcdFx0XHR9KTsgLy8gd2lsbCBiZSBpZ25vcmUgYW55d2F5IHNpbmNlIHdlIHJldHVybiBhZnRlclxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGJGYWlsZWQpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIGEgZHJhZnQgZmlsdGVyIHRvIG1ha2Ugc3VyZSB3ZSB0YWtlIHRoZSBkcmFmdCBlbnRpdHkgaWYgdGhlcmUgaXMgb25lXG5cdFx0Ly8gT3IgdGhlIGFjdGl2ZSBlbnRpdHkgb3RoZXJ3aXNlXG5cdFx0Y29uc3Qgb0RyYWZ0RmlsdGVyID0gbmV3IEZpbHRlcih7XG5cdFx0XHRmaWx0ZXJzOiBbbmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIFwiRVFcIiwgZmFsc2UpLCBuZXcgRmlsdGVyKFwiU2libGluZ0VudGl0eS9Jc0FjdGl2ZUVudGl0eVwiLCBcIkVRXCIsIG51bGwpXSxcblx0XHRcdGFuZDogZmFsc2Vcblx0XHR9KTtcblx0XHRhRmlsdGVycy5wdXNoKG9EcmFmdEZpbHRlcik7XG5cblx0XHRyZXR1cm4gbmV3IEZpbHRlcihhRmlsdGVycywgdHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBwYXRoIHdpdGggc2VtYW50aWMga2V5cyB0byBhIHBhdGggd2l0aCB0ZWNobmljYWwga2V5cy5cblx0ICpcblx0ICogQHBhcmFtIHNTZW1hbnRpY1BhdGggVGhlIHBhdGggd2l0aCBzZW1hbnRpYyBrZXlzXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIG1vZGVsIGZvciB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYVNlbWFudGljS2V5cyBUaGUgc2VtYW50aWMga2V5cyBmb3IgdGhlIHBhdGhcblx0ICogQHJldHVybnMgQSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlIHBhdGggd2l0aCB0ZWNobmljYWwga2V5cyBpZiBzU2VtYW50aWNQYXRoIGNvdWxkIGJlIGludGVycHJldGVkIGFzIGEgc2VtYW50aWMgcGF0aCwgbnVsbCBvdGhlcndpc2Vcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfZ2V0VGVjaG5pY2FsUGF0aEZyb21TZW1hbnRpY1BhdGgoc1NlbWFudGljUGF0aDogc3RyaW5nLCBvTW9kZWw6IGFueSwgYVNlbWFudGljS2V5czogYW55W10pIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQoc1NlbWFudGljUGF0aCkuZ2V0UGF0aCgpO1xuXG5cdFx0aWYgKCFhU2VtYW50aWNLZXlzIHx8IGFTZW1hbnRpY0tleXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQvLyBObyBzZW1hbnRpYyBrZXlzXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblxuXHRcdC8vIENyZWF0ZSBhIHNldCBvZiBmaWx0ZXJzIGNvcnJlc3BvbmRpbmcgdG8gYWxsIGtleXNcblx0XHRjb25zdCBvRmlsdGVyID0gdGhpcy5fY3JlYXRlRmlsdGVyRnJvbVNlbWFudGljUGF0aChzU2VtYW50aWNQYXRoLCBhU2VtYW50aWNLZXlzLCBvTWV0YU1vZGVsKTtcblx0XHRpZiAob0ZpbHRlciA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gQ291bGRuJ3QgaW50ZXJwcmV0IHRoZSBwYXRoIGFzIGEgc2VtYW50aWMgb25lXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblxuXHRcdC8vIExvYWQgdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0XG5cdFx0aWYgKCFzRW50aXR5U2V0UGF0aD8uc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHRcdHNFbnRpdHlTZXRQYXRoID0gYC8ke3NFbnRpdHlTZXRQYXRofWA7XG5cdFx0fVxuXHRcdGNvbnN0IG9MaXN0QmluZGluZyA9IG9Nb2RlbC5iaW5kTGlzdChzRW50aXR5U2V0UGF0aCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9GaWx0ZXIsIHtcblx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0by5IZXJvZXNcIlxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9MaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgMikudGhlbihmdW5jdGlvbiAob0NvbnRleHRzOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udGV4dHMgJiYgb0NvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHRzWzBdLmdldFBhdGgoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIGRhdGEgY291bGQgYmUgbG9hZGVkXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHBhdGggaXMgZWxpZ2libGUgZm9yIHNlbWFudGljIGJvb2ttYXJraW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggdG8gdGVzdFxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgYXNzb2NpYXRlZCBtZXRhZGF0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHBhdGggaXMgZWxpZ2libGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfY2hlY2tQYXRoRm9yU2VtYW50aWNCb29rbWFya2luZyhzUGF0aDogc3RyaW5nLCBvTWV0YU1vZGVsOiBhbnkpIHtcblx0XHQvLyBPbmx5IHBhdGggb24gcm9vdCBvYmplY3RzIGFsbG93IHNlbWFudGljIGJvb2ttYXJraW5nLCBpLmUuIHNQYXRoID0geHh4KHl5eSlcblx0XHRjb25zdCBhTWF0Y2hlcyA9IC9eWy9dPyhcXHcrKVxcKFteL10rXFwpJC8uZXhlYyhzUGF0aCk7XG5cdFx0aWYgKCFhTWF0Y2hlcykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHQvLyBHZXQgdGhlIGVudGl0eVNldCBuYW1lXG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBgLyR7YU1hdGNoZXNbMV19YDtcblx0XHQvLyBDaGVjayB0aGUgZW50aXR5IHNldCBzdXBwb3J0cyBkcmFmdCAob3RoZXJ3aXNlIHdlIGRvbid0IHN1cHBvcnQgc2VtYW50aWMgYm9va21hcmtpbmcpXG5cdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YCk7XG5cdFx0Y29uc3Qgb0RyYWZ0Tm9kZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnROb2RlYCk7XG5cdFx0cmV0dXJuIG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSA/IHRydWUgOiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZHMgYSBwYXRoIHdpdGggc2VtYW50aWMga2V5cyBmcm9tIGEgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGhUb1Jlc29sdmUgVGhlIHBhdGggdG8gYmUgdHJhbnNmb3JtZWRcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHJldHVybnMgU3RyaW5nIHByb21pc2UgZm9yIHRoZSBuZXcgcGF0aC4gSWYgc1BhdGhUb1Jlc29sdmVkIGNvdWxkbid0IGJlIGludGVycHJldGVkIGFzIGEgc2VtYW50aWMgcGF0aCwgaXQgaXMgcmV0dXJuZWQgYXMgaXMuXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X3Jlc29sdmVTZW1hbnRpY1BhdGgoc1BhdGhUb1Jlc29sdmU6IHN0cmluZywgb01vZGVsOiBhbnkpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgb0xhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9vUm91dGluZ1NlcnZpY2UuZ2V0TGFzdFNlbWFudGljTWFwcGluZygpO1xuXHRcdGxldCBzQ3VycmVudEhhc2hOb1BhcmFtcyA9IHRoaXMuX29Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5nZXRIYXNoKCkuc3BsaXQoXCI/XCIpWzBdO1xuXG5cdFx0aWYgKHNDdXJyZW50SGFzaE5vUGFyYW1zICYmIHNDdXJyZW50SGFzaE5vUGFyYW1zLmxhc3RJbmRleE9mKFwiL1wiKSA9PT0gc0N1cnJlbnRIYXNoTm9QYXJhbXMubGVuZ3RoIC0gMSkge1xuXHRcdFx0Ly8gUmVtb3ZlIHRyYWlsaW5nICcvJ1xuXHRcdFx0c0N1cnJlbnRIYXNoTm9QYXJhbXMgPSBzQ3VycmVudEhhc2hOb1BhcmFtcy5zdWJzdHJpbmcoMCwgc0N1cnJlbnRIYXNoTm9QYXJhbXMubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXG5cdFx0bGV0IHNSb290RW50aXR5TmFtZSA9IHNDdXJyZW50SGFzaE5vUGFyYW1zICYmIHNDdXJyZW50SGFzaE5vUGFyYW1zLnN1YnN0cigwLCBzQ3VycmVudEhhc2hOb1BhcmFtcy5pbmRleE9mKFwiKFwiKSk7XG5cdFx0aWYgKHNSb290RW50aXR5TmFtZS5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0c1Jvb3RFbnRpdHlOYW1lID0gc1Jvb3RFbnRpdHlOYW1lLnN1YnN0cmluZygxKTtcblx0XHR9XG5cdFx0Y29uc3QgYkFsbG93U2VtYW50aWNCb29rbWFyayA9IHRoaXMuX2NoZWNrUGF0aEZvclNlbWFudGljQm9va21hcmtpbmcoc0N1cnJlbnRIYXNoTm9QYXJhbXMsIG9NZXRhTW9kZWwpLFxuXHRcdFx0YVNlbWFudGljS2V5cyA9IGJBbGxvd1NlbWFudGljQm9va21hcmsgJiYgU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG9NZXRhTW9kZWwsIHNSb290RW50aXR5TmFtZSk7XG5cdFx0aWYgKCFhU2VtYW50aWNLZXlzKSB7XG5cdFx0XHQvLyBObyBzZW1hbnRpYyBrZXlzIGF2YWlsYWJsZSAtLT4gdXNlIHRoZSBwYXRoIGFzIGlzXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNQYXRoVG9SZXNvbHZlKTtcblx0XHR9IGVsc2UgaWYgKG9MYXN0U2VtYW50aWNNYXBwaW5nICYmIG9MYXN0U2VtYW50aWNNYXBwaW5nLnNlbWFudGljUGF0aCA9PT0gc1BhdGhUb1Jlc29sdmUpIHtcblx0XHRcdC8vIFRoaXMgc2VtYW50aWMgcGF0aCBoYXMgYmVlbiByZXNvbHZlZCBwcmV2aW91c2x5XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9MYXN0U2VtYW50aWNNYXBwaW5nLnRlY2huaWNhbFBhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSBuZWVkIHJlc29sdmUgdGhlIHNlbWFudGljIHBhdGggdG8gZ2V0IHRoZSB0ZWNobmljYWwga2V5c1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dldFRlY2huaWNhbFBhdGhGcm9tU2VtYW50aWNQYXRoKHNDdXJyZW50SGFzaE5vUGFyYW1zLCBvTW9kZWwsIGFTZW1hbnRpY0tleXMpLnRoZW4oKHNUZWNobmljYWxQYXRoOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHNUZWNobmljYWxQYXRoICYmIHNUZWNobmljYWxQYXRoICE9PSBzUGF0aFRvUmVzb2x2ZSkge1xuXHRcdFx0XHRcdC8vIFRoZSBzZW1hbnRpYyBwYXRoIHdhcyByZXNvbHZlZCAob3RoZXJ3aXNlIGtlZXAgdGhlIG9yaWdpbmFsIHZhbHVlIGZvciB0YXJnZXQpXG5cdFx0XHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLnNldExhc3RTZW1hbnRpY01hcHBpbmcoe1xuXHRcdFx0XHRcdFx0dGVjaG5pY2FsUGF0aDogc1RlY2huaWNhbFBhdGgsXG5cdFx0XHRcdFx0XHRzZW1hbnRpY1BhdGg6IHNQYXRoVG9SZXNvbHZlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuIHNUZWNobmljYWxQYXRoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBzUGF0aFRvUmVzb2x2ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBmcm9tIGEgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRQYXRoIFRoZSBwYXRoIHRvIGJ1aWxkIHRoZSBjb250ZXh0LiBOZWVkcyB0byBjb250YWluIHRlY2huaWNhbCBrZXlzIG9ubHkuXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2JpbmRQYWdlVG9QYXRoKHNUYXJnZXRQYXRoOiBzdHJpbmcsIG9Nb2RlbDogYW55LCBvTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IG9DdXJyZW50Q29udGV4dCA9IHRoaXMuX2dldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRzQ3VycmVudFBhdGggPSBvQ3VycmVudENvbnRleHQgJiYgb0N1cnJlbnRDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdG9Vc2VDb250ZXh0ID0gb05hdmlnYXRpb25QYXJhbWV0ZXJzLnVzZUNvbnRleHQgYXMgQ29udGV4dCB8IHVuZGVmaW5lZCB8IG51bGw7XG5cblx0XHQvLyBXZSBzZXQgdGhlIGJpbmRpbmcgY29udGV4dCBvbmx5IGlmIGl0J3MgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgb25lXG5cdFx0Ly8gb3IgaWYgd2UgaGF2ZSBhIGNvbnRleHQgYWxyZWFkeSBzZWxlY3RlZFxuXHRcdGlmIChvVXNlQ29udGV4dCAmJiBvVXNlQ29udGV4dC5nZXRQYXRoKCkgPT09IHNUYXJnZXRQYXRoKSB7XG5cdFx0XHRpZiAob1VzZUNvbnRleHQgIT09IG9DdXJyZW50Q29udGV4dCkge1xuXHRcdFx0XHQvLyBXZSBhbHJlYWR5IGhhdmUgdGhlIGNvbnRleHQgdG8gYmUgdXNlZCwgYW5kIGl0J3Mgbm90IHRoZSBjdXJyZW50IG9uZVxuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblxuXHRcdFx0XHQvLyBJbiBjYXNlIG9mIEZDTCwgaWYgd2UncmUgcmV1c2luZyBhIGNvbnRleHQgZnJvbSBhIHRhYmxlICh0aHJvdWdoIG5hdmlnYXRpb24pLCB3ZSByZWZyZXNoIGl0IHRvIGF2b2lkIG91dGRhdGVkIGRhdGFcblx0XHRcdFx0Ly8gV2UgZG9uJ3Qgd2FpdCBmb3IgdGhlIHJlZnJlc2ggdG8gYmUgY29tcGxldGVkIChyZXF1ZXN0UmVmcmVzaCksIHNvIHRoYXQgdGhlIGNvcnJlc3BvbmRpbmcgcXVlcnkgZ29lcyBpbnRvIHRoZSBzYW1lXG5cdFx0XHRcdC8vIGJhdGNoIGFzIHRoZSBvbmVzIGZyb20gY29udHJvbHMgaW4gdGhlIHBhZ2UuXG5cdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpICYmIG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWFzb24gPT09IE5hdmlnYXRpb25SZWFzb24uUm93UHJlc3MpIHtcblx0XHRcdFx0XHRjb25zdCBtZXRhTW9kZWwgPSBvVXNlQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdGlmICghb1VzZUNvbnRleHQuZ2V0QmluZGluZygpLmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdG9Vc2VDb250ZXh0LnJlZnJlc2goKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0aXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpIHx8XG5cdFx0XHRcdFx0XHQoTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChtZXRhTW9kZWwsIG9Vc2VDb250ZXh0LmdldFBhdGgoKSkgJiZcblx0XHRcdFx0XHRcdFx0TW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsKSlcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdC8vIElmIHRoZXJlIGFyZSBwZW5kaW5nIGNoYW5nZXMgYnV0IHdlJ3JlIGluIGNvbGxhYm9yYXRpb24gZHJhZnQsIHdlIGZvcmNlIHRoZSByZWZyZXNoIChkaXNjYXJkaW5nIHBlbmRpbmcgY2hhbmdlcykgYXMgd2UgbmVlZCB0byBoYXZlIHRoZSBsYXRlc3QgdmVyc2lvbi5cblx0XHRcdFx0XHRcdC8vIFdoZW4gbmF2aWdhdGluZyBmcm9tIExSIHRvIE9QLCB0aGUgdmlldyBpcyBub3QgY29ubmVjdGVkIHlldCAtLT4gY2hlY2sgaWYgd2UncmUgaW4gZHJhZnQgd2l0aCBjb2xsYWJvcmF0aW9uIGZyb20gdGhlIG1ldGFtb2RlbFxuXHRcdFx0XHRcdFx0b1VzZUNvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdFx0b1VzZUNvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9iaW5kUGFnZVRvQ29udGV4dChvVXNlQ29udGV4dCwgb01vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoc0N1cnJlbnRQYXRoICE9PSBzVGFyZ2V0UGF0aCkge1xuXHRcdFx0Ly8gV2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgY29udGV4dCBmb3IgaXRzIHBhdGhcblx0XHRcdHRoaXMuX2JpbmRQYWdlVG9Db250ZXh0KHRoaXMuX2NyZWF0ZUNvbnRleHQoc1RhcmdldFBhdGgsIG9Nb2RlbCksIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9IGVsc2UgaWYgKG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWFzb24gIT09IE5hdmlnYXRpb25SZWFzb24uQXBwU3RhdGVDaGFuZ2VkICYmIEVkaXRTdGF0ZS5pc0VkaXRTdGF0ZURpcnR5KCkpIHtcblx0XHRcdHRoaXMuX3JlZnJlc2hCaW5kaW5nQ29udGV4dChvQ3VycmVudENvbnRleHQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBCaW5kcyB0aGUgcGFnZSB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHRvIGJlIGJvdW5kXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2JpbmRQYWdlVG9Db250ZXh0KG9Db250ZXh0OiBDb250ZXh0IHwgbnVsbCwgb01vZGVsOiBPRGF0YU1vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdHRoaXMub25CZWZvcmVCaW5kaW5nKG51bGwpO1xuXHRcdFx0dGhpcy5vbkFmdGVyQmluZGluZyhudWxsKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBvUGFyZW50TGlzdEJpbmRpbmcgPSBvQ29udGV4dC5nZXRCaW5kaW5nKCk7XG5cdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9ICh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCk7XG5cdFx0aWYgKG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdGlmICghb1BhcmVudExpc3RCaW5kaW5nIHx8ICFvUGFyZW50TGlzdEJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0Ly8gaWYgdGhlIHBhcmVudEJpbmRpbmcgaXMgbm90IGEgbGlzdEJpbmRpbmcsIHdlIGNyZWF0ZSBhIG5ldyBjb250ZXh0XG5cdFx0XHRcdG9Db250ZXh0ID0gdGhpcy5fY3JlYXRlQ29udGV4dChvQ29udGV4dC5nZXRQYXRoKCksIG9Nb2RlbCk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuX3NldEtlZXBBbGl2ZShcblx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzQ29udGV4dFVzZWRJblBhZ2VzKG9Db250ZXh0KSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRydWUgLy8gTG9hZCBtZXNzYWdlcywgb3RoZXJ3aXNlIHRoZXkgZG9uJ3QgZ2V0IHJlZnJlc2hlZCBsYXRlciwgZS5nLiBmb3Igc2lkZSBlZmZlY3RzXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdFx0Ly8gc2V0S2VlcEFsaXZlIHRocm93cyBhbiBleGNlcHRpb24gaWYgdGhlIHBhcmVudCBsaXN0YmluZGluZyBkb2Vzbid0IGhhdmUgJCRvd25SZXF1ZXN0PXRydWVcblx0XHRcdFx0Ly8gVGhpcyBjYXNlIGZvciBjdXN0b20gZnJhZ21lbnRzIGlzIHN1cHBvcnRlZCwgYnV0IGFuIGVycm9yIGlzIGxvZ2dlZCB0byBtYWtlIHRoZSBsYWNrIG9mIHN5bmNocm9uaXphdGlvbiBhcHBhcmVudFxuXHRcdFx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcdFx0YFZpZXcgZm9yICR7b0NvbnRleHQuZ2V0UGF0aCgpfSB3b24ndCBiZSBzeW5jaHJvbml6ZWQuIFBhcmVudCBsaXN0QmluZGluZyBtdXN0IGhhdmUgYmluZGluZyBwYXJhbWV0ZXIgJCRvd25SZXF1ZXN0PXRydWVgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghb1BhcmVudExpc3RCaW5kaW5nIHx8IG9QYXJlbnRMaXN0QmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0Ly8gV2UgbmVlZCB0byByZWNyZWF0ZSB0aGUgY29udGV4dCBvdGhlcndpc2Ugd2UgZ2V0IGVycm9yc1xuXHRcdFx0b0NvbnRleHQgPSB0aGlzLl9jcmVhdGVDb250ZXh0KG9Db250ZXh0LmdldFBhdGgoKSwgb01vZGVsKTtcblx0XHR9XG5cblx0XHQvLyBTZXQgdGhlIGJpbmRpbmcgY29udGV4dCB3aXRoIHRoZSBwcm9wZXIgYmVmb3JlL2FmdGVyIGNhbGxiYWNrc1xuXHRcdHRoaXMub25CZWZvcmVCaW5kaW5nKG9Db250ZXh0LCB7XG5cdFx0XHRlZGl0YWJsZTogb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSxcblx0XHRcdGxpc3RCaW5kaW5nOiBvUGFyZW50TGlzdEJpbmRpbmcsXG5cdFx0XHRiUGVyc2lzdE9QU2Nyb2xsOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlBlcnNpc3RPUFNjcm9sbCxcblx0XHRcdGJEcmFmdE5hdmlnYXRpb246IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iRHJhZnROYXZpZ2F0aW9uLFxuXHRcdFx0c2hvd1BsYWNlaG9sZGVyOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlNob3dQbGFjZWhvbGRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5fc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQpO1xuXHRcdHRoaXMub25BZnRlckJpbmRpbmcob0NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBjb250ZXh0IGZyb20gYSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGhcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHJldHVybnMgVGhlIGNyZWF0ZWQgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9jcmVhdGVDb250ZXh0KHNQYXRoOiBzdHJpbmcsIG9Nb2RlbDogT0RhdGFNb2RlbCkge1xuXHRcdGNvbnN0IG9QYWdlQ29tcG9uZW50ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQsXG5cdFx0XHRzRW50aXR5U2V0ID0gb1BhZ2VDb21wb25lbnQgJiYgb1BhZ2VDb21wb25lbnQuZ2V0RW50aXR5U2V0ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCgpLFxuXHRcdFx0c0NvbnRleHRQYXRoID1cblx0XHRcdFx0KG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoKCkpIHx8IChzRW50aXR5U2V0ICYmIGAvJHtzRW50aXR5U2V0fWApLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdG1QYXJhbWV0ZXJzOiBhbnkgPSB7XG5cdFx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0by5IZXJvZXNcIixcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcIiRhdXRvXCIsXG5cdFx0XHRcdCQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHM6IHRydWVcblx0XHRcdH07XG5cdFx0Ly8gSW4gY2FzZSBvZiBkcmFmdDogJHNlbGVjdCB0aGUgc3RhdGUgZmxhZ3MgKEhhc0FjdGl2ZUVudGl0eSwgSGFzRHJhZnRFbnRpdHksIGFuZCBJc0FjdGl2ZUVudGl0eSlcblx0XHRjb25zdCBvRHJhZnRSb290ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YCk7XG5cdFx0Y29uc3Qgb0RyYWZ0Tm9kZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZWApO1xuXHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuX2dldEtlZXBBbGl2ZUNvbnRleHQob01vZGVsLCBzUGF0aCwgZmFsc2UsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIGtlZXBBbGl2ZSBjb250ZXh0ICR7c1BhdGh9YCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSkge1xuXHRcdFx0XHRpZiAob0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b0NvbnRleHQucmVxdWVzdFByb3BlcnR5KFtcIkhhc0FjdGl2ZUVudGl0eVwiLCBcIkhhc0RyYWZ0RW50aXR5XCIsIFwiSXNBY3RpdmVFbnRpdHlcIl0pO1xuXHRcdFx0XHRcdGlmIChvRHJhZnRSb290KSB7XG5cdFx0XHRcdFx0XHRvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZHJhZnQgYW5kIGVkaXQgd2UgbmVlZCB0byBlbnN1cmUgdGhvc2UgcHJvcGVydGllcyBhcmUgcmVxdWVzdGVkIGFnYWluIGV2ZW4gaWYgdGhleSBhcmUgaW4gdGhlIGJpbmRpbmcncyBjYWNoZVxuXHRcdFx0XHRcdC8vIG90aGVyd2lzZSB3aGVuIHlvdSBlZGl0IGFuZCBnbyB0byB0aGUgc2F2ZWQgdmVyc2lvbiB5b3UgaGF2ZSBubyB3YXkgb2Ygc3dpdGNoaW5nIGJhY2sgdG8gdGhlIGVkaXQgdmVyc2lvblxuXHRcdFx0XHRcdG9Db250ZXh0LnJlcXVlc3RTaWRlRWZmZWN0cyhcblx0XHRcdFx0XHRcdG9EcmFmdFJvb3Rcblx0XHRcdFx0XHRcdFx0PyBbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCIsIFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIl1cblx0XHRcdFx0XHRcdFx0OiBbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCJdXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb0NvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChzRW50aXR5U2V0KSB7XG5cdFx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy4kc2VsZWN0ID0gc01lc3NhZ2VzUGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRyYWZ0OiAkc2VsZWN0IHRoZSBzdGF0ZSBmbGFncyAoSGFzQWN0aXZlRW50aXR5LCBIYXNEcmFmdEVudGl0eSwgYW5kIElzQWN0aXZlRW50aXR5KVxuXHRcdFx0aWYgKG9EcmFmdFJvb3QgfHwgb0RyYWZ0Tm9kZSkge1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuJHNlbGVjdCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCA9IFwiSGFzQWN0aXZlRW50aXR5LEhhc0RyYWZ0RW50aXR5LElzQWN0aXZlRW50aXR5XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCArPSBcIixIYXNBY3RpdmVFbnRpdHksSGFzRHJhZnRFbnRpdHksSXNBY3RpdmVFbnRpdHlcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0Y29uc3Qgb1ByZXZpb3VzQmluZGluZyA9ICh0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIGFueSk/LmdldEJpbmRpbmcoKTtcblx0XHRcdFx0b1ByZXZpb3VzQmluZGluZ1xuXHRcdFx0XHRcdD8ucmVzZXRDaGFuZ2VzKClcblx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRvUHJldmlvdXNCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlc2V0aW5nIHRoZSBjaGFuZ2VzIHRvIHRoZSBiaW5kaW5nXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9IaWRkZW5CaW5kaW5nID0gb01vZGVsLmJpbmRDb250ZXh0KHNQYXRoLCB1bmRlZmluZWQsIG1QYXJhbWV0ZXJzKTtcblxuXHRcdFx0b0hpZGRlbkJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCAoKSA9PiB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIubG9jayh0aGlzLl9vVmlldyk7XG5cdFx0XHR9KTtcblx0XHRcdG9IaWRkZW5CaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCB0aGlzLm9uRGF0YVJlY2VpdmVkLmJpbmQodGhpcykpO1xuXHRcdFx0cmV0dXJuIG9IaWRkZW5CaW5kaW5nLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRhc3luYyBvbkRhdGFSZWNlaXZlZChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3Qgc0Vycm9yRGVzY3JpcHRpb24gPSBvRXZlbnQgJiYgb0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpO1xuXHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKHRoaXMuX29WaWV3KSkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhpcy5fb1ZpZXcpO1xuXHRcdH1cblxuXHRcdGlmIChzRXJyb3JEZXNjcmlwdGlvbikge1xuXHRcdFx0Ly8gVE9ETzogaW4gY2FzZSBvZiA0MDQgdGhlIHRleHQgc2hhbGwgYmUgZGlmZmVyZW50XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBhd2FpdCBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIsIHRydWUpO1xuXHRcdFx0XHRjb25zdCBtZXNzYWdlSGFuZGxlciA9IHRoaXMuYmFzZS5tZXNzYWdlSGFuZGxlcjtcblx0XHRcdFx0bGV0IG1QYXJhbXMgPSB7fTtcblx0XHRcdFx0aWYgKHNFcnJvckRlc2NyaXB0aW9uLnN0YXR1cyA9PT0gNTAzKSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdGlzSW5pdGlhbExvYWQ1MDNFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSBpZiAoc0Vycm9yRGVzY3JpcHRpb24uc3RhdHVzID09PSA0MDApIHtcblx0XHRcdFx0XHRtUGFyYW1zID0ge1xuXHRcdFx0XHRcdFx0dGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfRVJST1JcIiksXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SX0RFU0NSSVBUSU9OXCIpLFxuXHRcdFx0XHRcdFx0aXNEYXRhUmVjZWl2ZWRFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNFcnJvckRlc2NyaXB0aW9uLFxuXHRcdFx0XHRcdFx0aXNEYXRhUmVjZWl2ZWRFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNoZWxsQmFjazogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKG1QYXJhbXMpO1xuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZ2V0dGluZyB0aGUgY29yZSByZXNvdXJjZSBidW5kbGVcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdHMgc2lkZSBlZmZlY3RzIG9uIGEgYmluZGluZyBjb250ZXh0IHRvIFwicmVmcmVzaFwiIGl0LlxuXHQgKiBUT0RPOiBnZXQgcmlkIG9mIHRoaXMgb25jZSBwcm92aWRlZCBieSB0aGUgbW9kZWxcblx0ICogYSByZWZyZXNoIG9uIHRoZSBiaW5kaW5nIGNvbnRleHQgZG9lcyBub3Qgd29yayBpbiBjYXNlIGEgY3JlYXRpb24gcm93IHdpdGggYSB0cmFuc2llbnQgY29udGV4dCBpc1xuXHQgKiB1c2VkLiBhbHNvIGEgcmVxdWVzdFNpZGVFZmZlY3RzIHdpdGggYW4gZW1wdHkgcGF0aCB3b3VsZCBmYWlsIGR1ZSB0byB0aGUgdHJhbnNpZW50IGNvbnRleHRcblx0ICogdGhlcmVmb3JlIHdlIGdldCBhbGwgZGVwZW5kZW50IGJpbmRpbmdzICh2aWEgcHJpdmF0ZSBtb2RlbCBtZXRob2QpIHRvIGRldGVybWluZSBhbGwgcGF0aHMgYW5kIHRoZW5cblx0ICogcmVxdWVzdCB0aGVtLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0JpbmRpbmdDb250ZXh0IENvbnRleHQgdG8gYmUgcmVmcmVzaGVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X3JlZnJlc2hCaW5kaW5nQ29udGV4dChvQmluZGluZ0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9QYWdlQ29tcG9uZW50ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQ7XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZSA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0Y29uc3Qgc1Jvb3RDb250ZXh0UGF0aCA9IG9CaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVNldCA9IG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCAmJiBvUGFnZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKTtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPVxuXHRcdFx0KG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoICYmIG9QYWdlQ29tcG9uZW50LmdldENvbnRleHRQYXRoKCkpIHx8IChzRW50aXR5U2V0ICYmIGAvJHtzRW50aXR5U2V0fWApO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGxldCBzTWVzc2FnZXNQYXRoO1xuXHRcdGNvbnN0IGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBhUHJvcGVydHlQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBvU2lkZUVmZmVjdHM6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSA9IHtcblx0XHRcdHRhcmdldFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0dGFyZ2V0RW50aXRpZXM6IFtdXG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIGdldEJpbmRpbmdQYXRocyhvQmluZGluZzogYW55KSB7XG5cdFx0XHRsZXQgYURlcGVuZGVudEJpbmRpbmdzO1xuXHRcdFx0Y29uc3Qgc1JlbGF0aXZlUGF0aCA9ICgob0JpbmRpbmcuZ2V0Q29udGV4dCgpICYmIG9CaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCkpIHx8IFwiXCIpLnJlcGxhY2Uoc1Jvb3RDb250ZXh0UGF0aCwgXCJcIik7IC8vIElmIG5vIGNvbnRleHQsIHRoaXMgaXMgYW4gYWJzb2x1dGUgYmluZGluZyBzbyBubyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRjb25zdCBzUGF0aCA9IChzUmVsYXRpdmVQYXRoID8gYCR7c1JlbGF0aXZlUGF0aC5zbGljZSgxKX0vYCA6IHNSZWxhdGl2ZVBhdGgpICsgb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXG5cdFx0XHRpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhQ29udGV4dEJpbmRpbmdcIikpIHtcblx0XHRcdFx0Ly8gaWYgKHNQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRcdC8vIG5vdyBnZXQgdGhlIGRlcGVuZGVudCBiaW5kaW5nc1xuXHRcdFx0XHRhRGVwZW5kZW50QmluZGluZ3MgPSBvQmluZGluZy5nZXREZXBlbmRlbnRCaW5kaW5ncygpO1xuXHRcdFx0XHRpZiAoYURlcGVuZGVudEJpbmRpbmdzKSB7XG5cdFx0XHRcdFx0Ly8gYXNrIHRoZSBkZXBlbmRlbnQgYmluZGluZ3MgKGFuZCBvbmx5IHRob3NlIHdpdGggdGhlIHNwZWNpZmllZCBncm91cElkXG5cdFx0XHRcdFx0Ly9pZiAoYURlcGVuZGVudEJpbmRpbmdzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFEZXBlbmRlbnRCaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0Z2V0QmluZGluZ1BhdGhzKGFEZXBlbmRlbnRCaW5kaW5nc1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0aWYgKGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAob0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhUHJvcGVydHlCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGlmIChhUHJvcGVydHlQYXRocy5pbmRleE9mKHNQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhUHJvcGVydHlQYXRocy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzQ29udGV4dFBhdGgpIHtcblx0XHRcdHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHR9XG5cblx0XHQvLyBiaW5kaW5nIG9mIHRoZSBjb250ZXh0IG11c3QgaGF2ZSAkJFBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIHRydWUsIHRoaXMgYm91bmQgY29udGV4dCBtYXkgYmUgbmVlZGVkIHRvIGJlIGZldGNoZWQgZnJvbSB0aGUgZGVwZW5kZW50IGJpbmRpbmdcblx0XHRnZXRCaW5kaW5nUGF0aHMob0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKSk7XG5cblx0XHRsZXQgaTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgYU5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMucHVzaCh7XG5cdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhTmF2aWdhdGlvblByb3BlcnR5UGF0aHNbaV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcyA9IGFQcm9wZXJ0eVBhdGhzO1xuXHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcy5wdXNoKHNNZXNzYWdlc1BhdGgpO1xuXHRcdH1cblx0XHQvL2FsbCB0aGlzIGxvZ2ljIHRvIGJlIHJlcGxhY2VkIHdpdGggYSBTaWRlRWZmZWN0cyByZXF1ZXN0IGZvciBhbiBlbXB0eSBwYXRoIChyZWZyZXNoIGV2ZXJ5dGhpbmcpLCBhZnRlciB0ZXN0aW5nIHRyYW5zaWVudCBjb250ZXh0c1xuXHRcdG9TaWRlRWZmZWN0cy50YXJnZXRQcm9wZXJ0aWVzID0gb1NpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXMucmVkdWNlKCh0YXJnZXRzOiBzdHJpbmdbXSwgdGFyZ2V0UHJvcGVydHkpID0+IHtcblx0XHRcdGlmICh0YXJnZXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRjb25zdCBpbmRleCA9IHRhcmdldFByb3BlcnR5LmluZGV4T2YoXCIvXCIpO1xuXHRcdFx0XHR0YXJnZXRzLnB1c2goaW5kZXggPiAwID8gdGFyZ2V0UHJvcGVydHkuc2xpY2UoMCwgaW5kZXgpIDogdGFyZ2V0UHJvcGVydHkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRhcmdldHM7XG5cdFx0fSwgW10pO1xuXHRcdC8vIE9EYXRhIG1vZGVsIHdpbGwgdGFrZSBjYXJlIG9mIGR1cGxpY2F0ZXNcblx0XHRvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhbLi4ub1NpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzLCAuLi5vU2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllc10sIG9CaW5kaW5nQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBwYWdlIG9yIHRoZSBjb21wb25lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGNvbnRleHRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfZ2V0QmluZGluZ0NvbnRleHQoKTogQ29udGV4dCB8IG51bGwgfCB1bmRlZmluZWQge1xuXHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX29QYWdlQ29tcG9uZW50LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBwYWdlIG9yIHRoZSBjb21wb25lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgYmluZGluZyBjb250ZXh0XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X3NldEJpbmRpbmdDb250ZXh0KG9Db250ZXh0OiBhbnkpIHtcblx0XHRsZXQgb1ByZXZpb3VzQ29udGV4dCwgb1RhcmdldENvbnRyb2w7XG5cdFx0aWYgKHRoaXMuX29QYWdlQ29tcG9uZW50KSB7XG5cdFx0XHRvUHJldmlvdXNDb250ZXh0ID0gdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0b1RhcmdldENvbnRyb2wgPSB0aGlzLl9vUGFnZUNvbXBvbmVudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1ByZXZpb3VzQ29udGV4dCA9IHRoaXMuX29WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdG9UYXJnZXRDb250cm9sID0gdGhpcy5fb1ZpZXc7XG5cdFx0fVxuXG5cdFx0b1RhcmdldENvbnRyb2wuc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQpO1xuXG5cdFx0aWYgKG9QcmV2aW91c0NvbnRleHQ/LmlzS2VlcEFsaXZlKCkgJiYgb1ByZXZpb3VzQ29udGV4dCAhPT0gb0NvbnRleHQpIHtcblx0XHRcdHRoaXMuX3NldEtlZXBBbGl2ZShvUHJldmlvdXNDb250ZXh0LCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGZsZXhpYmxlIGNvbHVtbiBsYXlvdXQgKEZDTCkgbGV2ZWwgY29ycmVzcG9uZGluZyB0byB0aGUgdmlldyAoLTEgaWYgdGhlIGFwcCBpcyBub3QgRkNMKS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGxldmVsXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2dldEZDTExldmVsKCkge1xuXHRcdHJldHVybiB0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24uRkNMTGV2ZWw7XG5cdH1cblxuXHRfc2V0S2VlcEFsaXZlKG9Db250ZXh0OiBDb250ZXh0LCBiS2VlcEFsaXZlOiBib29sZWFuLCBmbkJlZm9yZURlc3Ryb3k/OiBGdW5jdGlvbiwgYlJlcXVlc3RNZXNzYWdlcz86IGJvb2xlYW4pIHtcblx0XHRpZiAob0NvbnRleHQuZ2V0UGF0aCgpLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0Ly8gV2Uga2VlcCB0aGUgY29udGV4dCBhbGl2ZSBvbmx5IGlmIHRoZXkncmUgcGFydCBvZiBhIGNvbGxlY3Rpb24sIGkuZS4gaWYgdGhlIHBhdGggZW5kcyB3aXRoIGEgJyknXG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblx0XHRcdG9Db250ZXh0LnNldEtlZXBBbGl2ZShiS2VlcEFsaXZlLCBmbkJlZm9yZURlc3Ryb3ksICEhc01lc3NhZ2VzUGF0aCAmJiBiUmVxdWVzdE1lc3NhZ2VzKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0S2VlcEFsaXZlQ29udGV4dChvTW9kZWw6IE9EYXRhTW9kZWwsIHBhdGg6IHN0cmluZywgYlJlcXVlc3RNZXNzYWdlcz86IGJvb2xlYW4sIHBhcmFtZXRlcnM/OiBhbnkpOiBDb250ZXh0IHwgdW5kZWZpbmVkIHtcblx0XHQvLyBHZXQgdGhlIHBhdGggZm9yIHRoZSBjb250ZXh0IHRoYXQgaXMgcmVhbGx5IGtlcHQgYWxpdmUgKHBhcnQgb2YgYSBjb2xsZWN0aW9uKVxuXHRcdC8vIGkuZS4gcmVtb3ZlIGFsbCBzZWdtZW50cyBub3QgZW5kaW5nIHdpdGggYSAnKSdcblx0XHRjb25zdCBrZXB0QWxpdmVTZWdtZW50cyA9IHBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IGFkZGl0aW9ubmFsU2VnbWVudHM6IHN0cmluZ1tdID0gW107XG5cdFx0d2hpbGUgKGtlcHRBbGl2ZVNlZ21lbnRzLmxlbmd0aCAmJiAha2VwdEFsaXZlU2VnbWVudHNba2VwdEFsaXZlU2VnbWVudHMubGVuZ3RoIC0gMV0uZW5kc1dpdGgoXCIpXCIpKSB7XG5cdFx0XHRhZGRpdGlvbm5hbFNlZ21lbnRzLnB1c2goa2VwdEFsaXZlU2VnbWVudHMucG9wKCkhKTtcblx0XHR9XG5cblx0XHRpZiAoa2VwdEFsaXZlU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGNvbnN0IGtlcHRBbGl2ZVBhdGggPSBrZXB0QWxpdmVTZWdtZW50cy5qb2luKFwiL1wiKTtcblx0XHRjb25zdCBvS2VlcEFsaXZlQ29udGV4dCA9IG9Nb2RlbC5nZXRLZWVwQWxpdmVDb250ZXh0KGtlcHRBbGl2ZVBhdGgsIGJSZXF1ZXN0TWVzc2FnZXMsIHBhcmFtZXRlcnMpO1xuXG5cdFx0aWYgKGFkZGl0aW9ubmFsU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gb0tlZXBBbGl2ZUNvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFkZGl0aW9ubmFsU2VnbWVudHMucmV2ZXJzZSgpO1xuXHRcdFx0Y29uc3QgYWRkaXRpb25uYWxQYXRoID0gYWRkaXRpb25uYWxTZWdtZW50cy5qb2luKFwiL1wiKTtcblx0XHRcdHJldHVybiBvTW9kZWwuYmluZENvbnRleHQoYWRkaXRpb25uYWxQYXRoLCBvS2VlcEFsaXZlQ29udGV4dCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFN3aXRjaGVzIGJldHdlZW4gY29sdW1uIGFuZCBmdWxsLXNjcmVlbiBtb2RlIHdoZW4gRkNMIGlzIHVzZWQuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0c3dpdGNoRnVsbFNjcmVlbigpIHtcblx0XHRjb25zdCBvU291cmNlID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHRjb25zdCBvRkNMSGVscGVyTW9kZWwgPSBvU291cmNlLmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLFxuXHRcdFx0YklzRnVsbFNjcmVlbiA9IG9GQ0xIZWxwZXJNb2RlbC5nZXRQcm9wZXJ0eShcIi9hY3Rpb25CdXR0b25zSW5mby9pc0Z1bGxTY3JlZW5cIiksXG5cdFx0XHRzTmV4dExheW91dCA9IG9GQ0xIZWxwZXJNb2RlbC5nZXRQcm9wZXJ0eShcblx0XHRcdFx0YklzRnVsbFNjcmVlbiA/IFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2V4aXRGdWxsU2NyZWVuXCIgOiBcIi9hY3Rpb25CdXR0b25zSW5mby9mdWxsU2NyZWVuXCJcblx0XHRcdCksXG5cdFx0XHRvUm9vdFZpZXdDb250cm9sbGVyID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblxuXHRcdGNvbnN0IG9Db250ZXh0ID0gb1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0ID8gb1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCkgOiBvU291cmNlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cblx0XHR0aGlzLmJhc2UuX3JvdXRpbmcubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIHsgc0xheW91dDogc05leHRMYXlvdXQgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJjYW5ub3Qgc3dpdGNoIGJldHdlZW4gY29sdW1uIGFuZCBmdWxsc2NyZWVuXCIpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlcyB0aGUgY29sdW1uIGZvciB0aGUgY3VycmVudCB2aWV3IGluIGEgRkNMLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5CZWZvcmUpXG5cdGNsb3NlQ29sdW1uKCkge1xuXHRcdGNvbnN0IG9WaWV3RGF0YSA9IHRoaXMuX29WaWV3LmdldFZpZXdEYXRhKCkgYXMgYW55O1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IG5hdmlnYXRpb25QYXJhbWV0ZXJzID0ge1xuXHRcdFx0bm9QcmVzZXJ2YXRpb25DYWNoZTogdHJ1ZSxcblx0XHRcdHNMYXlvdXQ6IHRoaXMuX29WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLmdldFByb3BlcnR5KFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2Nsb3NlQ29sdW1uXCIpXG5cdFx0fTtcblxuXHRcdGlmIChvVmlld0RhdGE/LnZpZXdMZXZlbCA9PT0gMSAmJiBNb2RlbEhlbHBlci5pc0RyYWZ0U3VwcG9ydGVkKG9NZXRhTW9kZWwsIG9Db250ZXh0LmdldFBhdGgoKSkpIHtcblx0XHRcdGRyYWZ0LnByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uKFxuXHRcdFx0XHQoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dCwgbmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRGdW5jdGlvbi5wcm90b3R5cGUsXG5cdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHR0aGlzLl9vVmlldy5nZXRDb250cm9sbGVyKCksXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRkcmFmdC5OYXZpZ2F0aW9uVHlwZS5CYWNrTmF2aWdhdGlvblxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dCwgbmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnRlcm5hbFJvdXRpbmc7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVNNQSxlQUFlLFdBRHBCQyxjQUFjLENBQUMsa0RBQWtELENBQUMsVUFvQmpFQyxjQUFjLEVBQUUsVUFPaEJBLGNBQWMsRUFBRSxVQW9DaEJDLGVBQWUsRUFBRSxVQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBS25DSCxlQUFlLEVBQUUsVUFDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQUtuQ0gsZUFBZSxFQUFFLFVBQ2pCQyxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsV0FRbkNILGVBQWUsRUFBRSxXQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFdBc0JuQ0gsZUFBZSxFQUFFLFdBeUJqQkEsZUFBZSxFQUFFLFdB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