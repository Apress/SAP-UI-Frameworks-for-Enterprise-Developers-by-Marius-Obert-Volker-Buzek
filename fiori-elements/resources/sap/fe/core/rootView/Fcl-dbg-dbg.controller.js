/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/library", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/m/Link", "sap/m/MessageBox", "sap/m/MessagePage", "./RootViewBaseController"], function (Log, FlexibleColumnLayoutSemanticHelper, fLibrary, ViewState, ClassSupport, KeepAliveHelper, Link, MessageBox, MessagePage, BaseController) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var Icon = MessageBox.Icon;
  var Action = MessageBox.Action;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const LayoutType = fLibrary.LayoutType;
  const CONSTANTS = {
    page: {
      names: ["BeginColumn", "MidColumn", "EndColumn"],
      currentGetter: {
        prefix: "getCurrent",
        suffix: "Page"
      },
      getter: {
        prefix: "get",
        suffix: "Pages"
      }
    }
  };
  const _getViewFromContainer = function (oContainer) {
    if (oContainer.isA("sap.ui.core.ComponentContainer")) {
      return oContainer.getComponentInstance().getRootControl();
    } else {
      return oContainer;
    }
  };
  /**
   * Base controller class for your own root view with an sap.f.FlexibleColumnLayout control.
   *
   * By using or extending this controller, you can use your own root view with the sap.fe.core.AppComponent and
   * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.110.0
   */
  let FclController = (_dec = defineUI5Class("sap.fe.core.rootView.Fcl"), _dec2 = usingExtension(ViewState.override({
    applyInitialStateOnly: function () {
      return false;
    },
    adaptBindingRefreshControls: function (aControls) {
      this.getView().getController()._getAllVisibleViews().forEach(function (oChildView) {
        const pChildView = Promise.resolve(oChildView);
        aControls.push(pChildView);
      });
    },
    adaptStateControls: function (aStateControls) {
      this.getView().getController()._getAllVisibleViews().forEach(function (oChildView) {
        const pChildView = Promise.resolve(oChildView);
        aStateControls.push(pChildView);
      });
    },
    onRestore: function () {
      const fclController = this.getView().getController();
      const appContentContainer = fclController.getAppContentContainer();
      const internalModel = appContentContainer.getModel("internal");
      const pages = internalModel.getProperty("/pages");
      for (const componentId in pages) {
        internalModel.setProperty(`/pages/${componentId}/restoreStatus`, "pending");
      }
      fclController.onContainerReady();
    },
    onSuspend: function () {
      const oFCLController = this.getView().getController();
      const oFCLControl = oFCLController.getFclControl();
      const aBeginColumnPages = oFCLControl.getBeginColumnPages() || [];
      const aMidColumnPages = oFCLControl.getMidColumnPages() || [];
      const aEndColumnPages = oFCLControl.getEndColumnPages() || [];
      const aPages = [].concat(aBeginColumnPages, aMidColumnPages, aEndColumnPages);
      aPages.forEach(function (oPage) {
        const oTargetView = _getViewFromContainer(oPage);
        const oController = oTargetView && oTargetView.getController();
        if (oController && oController.viewState && oController.viewState.onSuspend) {
          oController.viewState.onSuspend();
        }
      });
    }
  })), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(FclController, _BaseController);
    function FclController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewState", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FclController.prototype;
    /**
     * @private
     * @name sap.fe.core.rootView.Fcl.getMetadata
     * @function
     */
    _proto.onInit = function onInit() {
      _BaseController.prototype.onInit.call(this);
      this._internalInit();
    };
    _proto.manageDataReceived = function manageDataReceived(event) {
      if (event.getParameter("error")) {
        var _targetedView$getBind;
        const path = event.getParameter("path"),
          targetedView = this._getAllVisibleViews().find(view => {
            var _view$getBindingConte;
            return ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath()) === path;
          });
        // We need to manage error when the request is related to a form  into an ObjectPage
        if (path && targetedView !== null && targetedView !== void 0 && (_targetedView$getBind = targetedView.getBindingContext()) !== null && _targetedView$getBind !== void 0 && _targetedView$getBind.isKeepAlive()) {
          targetedView.getController()._routing.onDataReceived(event);
        }
      }
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.getRouter().attachBeforeRouteMatched(this._getViewForNavigatedRowsComputation, this);
      _BaseController.prototype.attachRouteMatchers.call(this);
      this._internalInit();
      this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
      this.getRouter().attachRouteMatched(this.onRouteMatched, this);
      this.getFclControl().attachStateChange(this._saveLayout, this);
    };
    _proto._internalInit = function _internalInit() {
      var _oRoutingConfig$confi, _oRoutingConfig$confi2;
      if (this._oRouterProxy) {
        return; // Already initialized
      }

      this.sCurrentRouteName = "";
      this.sCurrentArguments = {};
      this.SQUERYKEYNAME = "?query";
      const oAppComponent = this.getAppComponent();
      const oDataModel = this.getAppComponent().getModel();
      oDataModel === null || oDataModel === void 0 ? void 0 : oDataModel.attachEvent("dataReceived", this.manageDataReceived.bind(this));
      this._oRouterProxy = oAppComponent.getRouterProxy();

      // Get FCL configuration in the manifest
      this._oFCLConfig = {
        maxColumnsCount: 3
      };
      const oRoutingConfig = oAppComponent.getManifest()["sap.ui5"].routing;
      if (oRoutingConfig !== null && oRoutingConfig !== void 0 && (_oRoutingConfig$confi = oRoutingConfig.config) !== null && _oRoutingConfig$confi !== void 0 && _oRoutingConfig$confi.flexibleColumnLayout) {
        const oFCLManifestConfig = oRoutingConfig.config.flexibleColumnLayout;

        // Default layout for 2 columns
        if (oFCLManifestConfig.defaultTwoColumnLayoutType) {
          this._oFCLConfig.defaultTwoColumnLayoutType = oFCLManifestConfig.defaultTwoColumnLayoutType;
        }

        // Default layout for 3 columns
        if (oFCLManifestConfig.defaultThreeColumnLayoutType) {
          this._oFCLConfig.defaultThreeColumnLayoutType = oFCLManifestConfig.defaultThreeColumnLayoutType;
        }

        // Limit FCL to 2 columns ?
        if (oFCLManifestConfig.limitFCLToTwoColumns === true) {
          this._oFCLConfig.maxColumnsCount = 2;
        }
      }
      if (oRoutingConfig !== null && oRoutingConfig !== void 0 && (_oRoutingConfig$confi2 = oRoutingConfig.config) !== null && _oRoutingConfig$confi2 !== void 0 && _oRoutingConfig$confi2.controlAggregation) {
        this._oFCLConfig.defaultControlAggregation = oRoutingConfig.config.controlAggregation;
      }
      this._initializeTargetAggregation(oAppComponent);
      this._initializeRoutesInformation(oAppComponent);
      this.getFclControl().attachStateChange(this.onStateChanged, this);
      this.getFclControl().attachAfterEndColumnNavigate(this.onStateChanged, this);
    };
    _proto.getFclControl = function getFclControl() {
      return this.getAppContentContainer();
    };
    _proto._saveLayout = function _saveLayout(oEvent) {
      this.sPreviousLayout = oEvent.getParameters().layout;
    }

    /**
     * Get the additional view (on top of the visible views), to be able to compute the latest table navigated rows of
     * the most right visible view after a nav back or column fullscreen.
     *
     * @function
     * @name sap.fe.core.rootView.Fcl.controller#_getRightMostViewBeforeRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     */;
    _proto._getViewForNavigatedRowsComputation = function _getViewForNavigatedRowsComputation() {
      const aAllVisibleViewsBeforeRouteMatched = this._getAllVisibleViews(this.sPreviousLayout);
      const oRightMostViewBeforeRouteMatched = aAllVisibleViewsBeforeRouteMatched[aAllVisibleViewsBeforeRouteMatched.length - 1];
      let oRightMostView;
      this.getRouter().attachEventOnce("routeMatched", oEvent => {
        oRightMostView = _getViewFromContainer(oEvent.getParameter("views")[oEvent.getParameter("views").length - 1]);
        if (oRightMostViewBeforeRouteMatched) {
          // Navigation forward from L2 to view level L3 (FullScreenLayout):
          if (oRightMostView.getViewData() && oRightMostView.getViewData().viewLevel === this._oFCLConfig.maxColumnsCount) {
            this.oAdditionalViewForNavRowsComputation = oRightMostView;
          }
          // Navigations backward from L3 down to L2, L1, L0 (ThreeColumn layout):
          if (oRightMostView.getViewData() && oRightMostViewBeforeRouteMatched.getViewData() && oRightMostViewBeforeRouteMatched.getViewData().viewLevel < this._oFCLConfig.maxColumnsCount && oRightMostViewBeforeRouteMatched.getViewData() && oRightMostViewBeforeRouteMatched.getViewData().viewLevel > oRightMostView.getViewData().viewLevel && oRightMostView !== oRightMostViewBeforeRouteMatched) {
            this.oAdditionalViewForNavRowsComputation = oRightMostViewBeforeRouteMatched;
          }
        }
      });
    };
    _proto.getViewForNavigatedRowsComputation = function getViewForNavigatedRowsComputation() {
      return this.oAdditionalViewForNavRowsComputation;
    };
    _proto.onExit = function onExit() {
      this.getRouter().detachRouteMatched(this.onRouteMatched, this);
      this.getRouter().detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
      this.getFclControl().detachStateChange(this.onStateChanged, this);
      this.getFclControl().detachAfterEndColumnNavigate(this.onStateChanged, this);
      this._oTargetsAggregation = null;
      this._oTargetsFromRoutePattern = null;
      BaseController.prototype.onExit.bind(this)();
    }

    /**
     * Check if the FCL component is enabled.
     *
     * @function
     * @name sap.fe.core.rootView.Fcl.controller#isFclEnabled
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns `true` since we are in FCL scenario
     * @ui5-restricted
     * @final
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      return true;
    }

    /**
     * Method that creates a new Page to display the IllustratedMessage containing the current error.
     *
     * @param sErrorMessage
     * @param mParameters
     * @alias sap.fe.core.rootView.Fcl.controller#displayErrorPage
     * @returns A promise that creates a Page to display the error
     * @public
     */;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      const oFCLControl = this.getFclControl();
      if (this._oFCLConfig && mParameters.FCLLevel >= this._oFCLConfig.maxColumnsCount) {
        mParameters.FCLLevel = this._oFCLConfig.maxColumnsCount - 1;
      }
      if (!this.aMessagePages) {
        this.aMessagePages = [null, null, null];
      }
      let oMessagePage = this.aMessagePages[mParameters.FCLLevel];
      if (!oMessagePage) {
        oMessagePage = new MessagePage({
          showHeader: false,
          icon: "sap-icon://message-error"
        });
        this.aMessagePages[mParameters.FCLLevel] = oMessagePage;
        switch (mParameters.FCLLevel) {
          case 0:
            oFCLControl.addBeginColumnPage(oMessagePage);
            break;
          case 1:
            oFCLControl.addMidColumnPage(oMessagePage);
            break;
          default:
            oFCLControl.addEndColumnPage(oMessagePage);
        }
      }
      oMessagePage.setText(sErrorMessage);
      if (mParameters.technicalMessage) {
        oMessagePage.setCustomDescription(new Link({
          text: mParameters.description || mParameters.technicalMessage,
          press: function () {
            MessageBox.show(mParameters.technicalMessage, {
              icon: Icon.ERROR,
              title: mParameters.title,
              actions: [Action.OK],
              defaultAction: Action.OK,
              details: mParameters.technicalDetails || "",
              contentWidth: "60%"
            });
          }
        }));
      } else {
        oMessagePage.setDescription(mParameters.description || "");
      }
      oFCLControl.to(oMessagePage.getId());
      return Promise.resolve(true);
    }

    /**
     * Initialize the object _oTargetsAggregation that defines for each route the relevant aggregation and pattern.
     *
     * @name sap.fe.core.rootView.Fcl.controller#_initializeTargetAggregation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @param [oAppComponent] Reference to the AppComponent
     */;
    _proto._initializeTargetAggregation = function _initializeTargetAggregation(oAppComponent) {
      const oManifest = oAppComponent.getManifest(),
        oTargets = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.targets : null;
      this._oTargetsAggregation = {};
      if (oTargets) {
        Object.keys(oTargets).forEach(sTargetName => {
          const oTarget = oTargets[sTargetName];
          if (oTarget.controlAggregation) {
            this._oTargetsAggregation[sTargetName] = {
              aggregation: oTarget.controlAggregation,
              pattern: oTarget.contextPattern
            };
          } else {
            this._oTargetsAggregation[sTargetName] = {
              aggregation: "page",
              pattern: null
            };
          }
        });
      }
    }

    /**
     * Initializes the mapping between a route (identifed as its pattern) and the corresponding targets
     *
     * @name sap.fe.core.rootView.Fcl.controller#_initializeRoutesInformation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @param oAppComponent ref to the AppComponent
     */;
    _proto._initializeRoutesInformation = function _initializeRoutesInformation(oAppComponent) {
      const oManifest = oAppComponent.getManifest(),
        aRoutes = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.routes : null;
      this._oTargetsFromRoutePattern = {};
      if (aRoutes) {
        aRoutes.forEach(route => {
          this._oTargetsFromRoutePattern[route.pattern] = route.target;
        });
      }
    };
    _proto.getCurrentArgument = function getCurrentArgument() {
      return this.sCurrentArguments;
    };
    _proto.getCurrentRouteName = function getCurrentRouteName() {
      return this.sCurrentRouteName;
    }

    /**
     * Get FE FCL constant.
     *
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns The constants
     */;
    _proto.getConstants = function getConstants() {
      return CONSTANTS;
    }

    /**
     * Getter for oTargetsAggregation array.
     *
     * @name sap.fe.core.rootView.Fcl.controller#getTargetAggregation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @returns The _oTargetsAggregation array
     * @ui5-restricted
     */;
    _proto.getTargetAggregation = function getTargetAggregation() {
      return this._oTargetsAggregation;
    }

    /**
     * Function triggered by the router RouteMatched event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onRouteMatched = function onRouteMatched(oEvent) {
      const sRouteName = oEvent.getParameter("name");

      // Save the current/previous routes and arguments
      this.sCurrentRouteName = sRouteName;
      this.sCurrentArguments = oEvent.getParameter("arguments");
    }

    /**
     * This function is triggering the table scroll to the navigated row after each layout change.
     *
     * @name sap.fe.core.rootView.Fcl.controller#scrollToLastSelectedItem
     * @memberof sap.fe.core.rootView.Fcl.controller
     */;
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      const aViews = this._getAllVisibleViews();
      //The scrolls are triggered only if the layout is with several columns or when switching the mostRight column in full screen
      if (aViews.length > 1 || aViews[0].getViewData().viewLevel < this._oFCLConfig.maxColumnsCount) {
        let sCurrentViewPath;
        const oAdditionalView = this.getViewForNavigatedRowsComputation();
        if (oAdditionalView && aViews.indexOf(oAdditionalView) === -1) {
          aViews.push(oAdditionalView);
        }
        for (let index = aViews.length - 1; index > 0; index--) {
          const oView = aViews[index],
            oPreviousView = aViews[index - 1];
          if (oView.getBindingContext()) {
            sCurrentViewPath = oView.getBindingContext().getPath();
            oPreviousView.getController()._scrollTablesToRow(sCurrentViewPath);
          }
        }
      }
    }

    /**
     * Function triggered by the FCL StateChanged event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onStateChanged
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onStateChanged = function onStateChanged(oEvent) {
      const bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
      if (this.sCurrentArguments !== undefined) {
        if (!this.sCurrentArguments[this.SQUERYKEYNAME]) {
          this.sCurrentArguments[this.SQUERYKEYNAME] = {};
        }
        this.sCurrentArguments[this.SQUERYKEYNAME].layout = oEvent.getParameter("layout");
      }
      this._forceModelContextChangeOnBreadCrumbs(oEvent);

      // Replace the URL with the new layout if a navigation arrow was used
      if (bIsNavigationArrow) {
        this._oRouterProxy.navTo(this.sCurrentRouteName, this.sCurrentArguments);
      }
      const oView = this.getRightmostView();
      if (oView) {
        this._computeTitleHierarchy(oView);
      }
    }

    /**
     * Function to fire ModelContextChange event on all breadcrumbs ( on each ObjectPages).
     *
     * @name sap.fe.core.rootView.Fcl.controller#_forceModelContextChangeOnBreadCrumbs
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto._forceModelContextChangeOnBreadCrumbs = function _forceModelContextChangeOnBreadCrumbs(oEvent) {
      //force modelcontextchange on ObjectPages to refresh the breadcrumbs link hrefs
      const oFcl = oEvent.getSource();
      let oPages = [];
      oPages = oPages.concat(oFcl.getBeginColumnPages()).concat(oFcl.getMidColumnPages()).concat(oFcl.getEndColumnPages());
      oPages.forEach(function (oPage) {
        const oView = _getViewFromContainer(oPage);
        const oBreadCrumbs = oView.byId && oView.byId("breadcrumbs");
        if (oBreadCrumbs) {
          oBreadCrumbs.fireModelContextChange();
        }
      });
    }

    /**
     * Function triggered to update the Share button Visibility.
     *
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param viewColumn Name of the current column ("beginColumn", "midColumn", "endColumn")
     * @param sLayout The current layout used by the FCL
     * @returns The share button visibility
     */;
    _proto._updateShareButtonVisibility = function _updateShareButtonVisibility(viewColumn, sLayout) {
      let bShowShareIcon;
      switch (sLayout) {
        case "OneColumn":
          bShowShareIcon = viewColumn === "beginColumn";
          break;
        case "MidColumnFullScreen":
        case "ThreeColumnsBeginExpandedEndHidden":
        case "ThreeColumnsMidExpandedEndHidden":
        case "TwoColumnsBeginExpanded":
        case "TwoColumnsMidExpanded":
          bShowShareIcon = viewColumn === "midColumn";
          break;
        case "EndColumnFullScreen":
        case "ThreeColumnsEndExpanded":
        case "ThreeColumnsMidExpanded":
          bShowShareIcon = viewColumn === "endColumn";
          break;
        default:
          bShowShareIcon = false;
      }
      return bShowShareIcon;
    };
    _proto._updateEditButtonVisiblity = function _updateEditButtonVisiblity(viewColumn, sLayout) {
      let bEditButtonVisible = true;
      switch (viewColumn) {
        case "midColumn":
          switch (sLayout) {
            case "TwoColumnsMidExpanded":
            case "ThreeColumnsMidExpanded":
            case "ThreeColumnsEndExpanded":
              bEditButtonVisible = false;
              break;
          }
          break;
        case "endColumn":
          switch (sLayout) {
            case "ThreeColumnsMidExpanded":
            case "ThreeColumnsEndExpanded":
              bEditButtonVisible = false;
          }
          break;
      }
      return bEditButtonVisible;
    };
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      const oUIState = this.getHelper().getCurrentUIState(),
        oFclColName = ["beginColumn", "midColumn", "endColumn"],
        sLayout = this.getFclControl().getLayout();
      let viewColumn;
      if (!oView.getModel("fclhelper")) {
        oView.setModel(this._createHelperModel(), "fclhelper");
      }
      if (FCLLevel >= this._oFCLConfig.maxColumnsCount) {
        // The view is on a level > max number of columns. It's always fullscreen without close/exit buttons
        viewColumn = oFclColName[this._oFCLConfig.maxColumnsCount - 1];
        oUIState.actionButtonsInfo.midColumn.fullScreen = null;
        oUIState.actionButtonsInfo.midColumn.exitFullScreen = null;
        oUIState.actionButtonsInfo.midColumn.closeColumn = null;
        oUIState.actionButtonsInfo.endColumn.exitFullScreen = null;
        oUIState.actionButtonsInfo.endColumn.fullScreen = null;
        oUIState.actionButtonsInfo.endColumn.closeColumn = null;
      } else {
        viewColumn = oFclColName[FCLLevel];
      }
      if (FCLLevel >= this._oFCLConfig.maxColumnsCount || sLayout === "EndColumnFullScreen" || sLayout === "MidColumnFullScreen" || sLayout === "OneColumn") {
        oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", true);
      } else {
        oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", false);
      }
      // Unfortunately, the FCLHelper doesn't provide actionButton values for the first column
      // so we have to add this info manually
      oUIState.actionButtonsInfo.beginColumn = {
        fullScreen: null,
        exitFullScreen: null,
        closeColumn: null
      };
      const oActionButtonInfos = Object.assign({}, oUIState.actionButtonsInfo[viewColumn]);
      oActionButtonInfos.switchVisible = oActionButtonInfos.fullScreen !== null || oActionButtonInfos.exitFullScreen !== null;
      oActionButtonInfos.switchIcon = oActionButtonInfos.fullScreen !== null ? "sap-icon://full-screen" : "sap-icon://exit-full-screen";
      oActionButtonInfos.isFullScreen = oActionButtonInfos.fullScreen === null;
      oActionButtonInfos.closeVisible = oActionButtonInfos.closeColumn !== null;
      oView.getModel("fclhelper").setProperty("/actionButtonsInfo", oActionButtonInfos);
      oView.getModel("fclhelper").setProperty("/showEditButton", this._updateEditButtonVisiblity(viewColumn, sLayout));
      oView.getModel("fclhelper").setProperty("/showShareIcon", this._updateShareButtonVisibility(viewColumn, sLayout));
    }

    /**
     * Function triggered by the router BeforeRouteMatched event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onBeforeRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onBeforeRouteMatched = function onBeforeRouteMatched(oEvent) {
      if (oEvent) {
        const oQueryParams = oEvent.getParameters().arguments[this.SQUERYKEYNAME];
        let sLayout = oQueryParams ? oQueryParams.layout : null;

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
          const oNextUIState = this.getHelper().getNextUIState(0);
          sLayout = oNextUIState.layout;
        }

        // Check if the layout if compatible with the number of targets
        // This should always be the case for normal navigation, just needed in case
        // the URL has been manually modified
        const aTargets = oEvent.getParameter("config").target;
        sLayout = this._correctLayoutForTargets(sLayout, aTargets);

        // Update the layout of the FlexibleColumnLayout
        if (sLayout) {
          this.getFclControl().setLayout(sLayout);
        }
      }
    }

    /**
     * Helper for the FCL Component.
     *
     * @name sap.fe.core.rootView.Fcl.controller#getHelper
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns Instance of a semantic helper
     */;
    _proto.getHelper = function getHelper() {
      return FlexibleColumnLayoutSemanticHelper.getInstanceFor(this.getFclControl(), this._oFCLConfig);
    }

    /**
     * Calculates the FCL layout for a given FCL level and a target hash.
     *
     * @param iNextFCLLevel FCL level to be navigated to
     * @param sHash The hash to be navigated to
     * @param sProposedLayout The proposed layout
     * @param keepCurrentLayout True if we want to keep the current layout if possible
     * @returns The calculated layout
     */;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      let keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      // First, ask the FCL helper to calculate the layout if nothing is proposed
      if (!sProposedLayout) {
        sProposedLayout = keepCurrentLayout ? this.getFclControl().getLayout() : this.getHelper().getNextUIState(iNextFCLLevel).layout;
      }

      // Then change this value if necessary, based on the number of targets
      const oRoute = this.getRouter().getRouteByHash(`${sHash}?layout=${sProposedLayout}`);
      const aTargets = this._oTargetsFromRoutePattern[oRoute.getPattern()];
      return this._correctLayoutForTargets(sProposedLayout, aTargets);
    }

    /**
     * Checks whether a given FCL layout is compatible with an array of targets.
     *
     * @param sProposedLayout Proposed value for the FCL layout
     * @param aTargets Array of target names used for checking
     * @returns The corrected layout
     */;
    _proto._correctLayoutForTargets = function _correctLayoutForTargets(sProposedLayout, aTargets) {
      const allAllowedLayouts = {
        "2": ["TwoColumnsMidExpanded", "TwoColumnsBeginExpanded", "MidColumnFullScreen"],
        "3": ["ThreeColumnsMidExpanded", "ThreeColumnsEndExpanded", "ThreeColumnsMidExpandedEndHidden", "ThreeColumnsBeginExpandedEndHidden", "MidColumnFullScreen", "EndColumnFullScreen"]
      };
      if (aTargets && !Array.isArray(aTargets)) {
        // To support single target as a string in the manifest
        aTargets = [aTargets];
      }
      if (!aTargets) {
        // Defensive, just in case...
        return sProposedLayout;
      } else if (aTargets.length > 1) {
        // More than 1 target: just simply check from the allowed values
        const aLayouts = allAllowedLayouts[aTargets.length];
        if (aLayouts.indexOf(sProposedLayout) < 0) {
          // The proposed layout isn't compatible with the number of columns
          // --> Ask the helper for the default layout for the number of columns
          sProposedLayout = aLayouts[0];
        }
      } else {
        // Only one target
        const sTargetAggregation = this.getTargetAggregation()[aTargets[0]].aggregation || this._oFCLConfig.defaultControlAggregation;
        switch (sTargetAggregation) {
          case "beginColumnPages":
            sProposedLayout = "OneColumn";
            break;
          case "midColumnPages":
            sProposedLayout = "MidColumnFullScreen";
            break;
          case "endColumnPages":
            sProposedLayout = "EndColumnFullScreen";
            break;
          // no default
        }
      }

      return sProposedLayout;
    }

    /**
     * Gets the instanced views in the FCL component.
     *
     * @returns {Array} Return the views.
     */;
    _proto.getInstancedViews = function getInstancedViews() {
      const fclControl = this.getFclControl();
      const componentContainers = [...fclControl.getBeginColumnPages(), ...fclControl.getMidColumnPages(), ...fclControl.getEndColumnPages()];
      return componentContainers.map(oPage => oPage.getComponentInstance().getRootControl());
    }

    /**
     * get all visible views in the FCL component.
     * sLayout optional parameter is very specific as part of the calculation of the latest navigated row
     *
     * @param {*} sLayout Layout that was applied just before the current navigation
     * @returns {Array} return views
     */;
    _proto._getAllVisibleViews = function _getAllVisibleViews(sLayout) {
      const aViews = [];
      sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
      switch (sLayout) {
        case LayoutType.EndColumnFullScreen:
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.MidColumnFullScreen:
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        case LayoutType.OneColumn:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          break;
        case LayoutType.ThreeColumnsEndExpanded:
        case LayoutType.ThreeColumnsMidExpanded:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.TwoColumnsBeginExpanded:
        case LayoutType.TwoColumnsMidExpanded:
        case LayoutType.ThreeColumnsMidExpandedEndHidden:
        case LayoutType.ThreeColumnsBeginExpandedEndHidden:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        default:
          Log.error(`Unhandled switch case for ${this.getFclControl().getLayout()}`);
      }
      return aViews;
    };
    _proto._getAllViews = function _getAllViews(sLayout) {
      const aViews = [];
      sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
      switch (sLayout) {
        case LayoutType.OneColumn:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          break;
        case LayoutType.ThreeColumnsEndExpanded:
        case LayoutType.ThreeColumnsMidExpanded:
        case LayoutType.ThreeColumnsMidExpandedEndHidden:
        case LayoutType.ThreeColumnsBeginExpandedEndHidden:
        case LayoutType.EndColumnFullScreen:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.TwoColumnsBeginExpanded:
        case LayoutType.TwoColumnsMidExpanded:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        case LayoutType.MidColumnFullScreen:
          // In this case we need to determine if this mid column fullscreen comes from a 2 or a 3 column layout
          const sLayoutWhenExitFullScreen = this.getHelper().getCurrentUIState().actionButtonsInfo.midColumn.exitFullScreen;
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (sLayoutWhenExitFullScreen.indexOf("ThreeColumn") >= 0) {
            // We come from a 3 column layout
            if (this.getFclControl().getCurrentEndColumnPage()) {
              aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
            }
          }
          break;
        default:
          Log.error(`Unhandled switch case for ${this.getFclControl().getLayout()}`);
      }
      return aViews;
    };
    _proto.onContainerReady = function onContainerReady() {
      // Restore views if neccessary.
      const aViews = this._getAllVisibleViews();
      const aRestorePromises = aViews.reduce(function (aPromises, oTargetView) {
        aPromises.push(KeepAliveHelper.restoreView(oTargetView));
        return aPromises;
      }, []);
      return Promise.all(aRestorePromises);
    };
    _proto.getRightmostContext = function getRightmostContext() {
      const oView = this.getRightmostView();
      return oView && oView.getBindingContext();
    };
    _proto.getRightmostView = function getRightmostView() {
      return this._getAllViews().pop();
    };
    _proto.isContextUsedInPages = function isContextUsedInPages(oContext) {
      if (!this.getFclControl()) {
        return false;
      }
      const aAllVisibleViews = this._getAllViews();
      for (const view of aAllVisibleViews) {
        if (view) {
          if (view.getBindingContext() === oContext) {
            return true;
          }
        } else {
          // A view has been destroyed --> app is currently being destroyed
          return false;
        }
      }
      return false;
    };
    _proto._setShellMenuTitle = function _setShellMenuTitle(oAppComponent, sTitle, sAppTitle) {
      if (this.getHelper().getCurrentUIState().isFullScreen !== true) {
        oAppComponent.getShellServices().setTitle(sAppTitle);
      } else {
        oAppComponent.getShellServices().setTitle(sTitle);
      }
    };
    return FclController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FclController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXlvdXRUeXBlIiwiZkxpYnJhcnkiLCJDT05TVEFOVFMiLCJwYWdlIiwibmFtZXMiLCJjdXJyZW50R2V0dGVyIiwicHJlZml4Iiwic3VmZml4IiwiZ2V0dGVyIiwiX2dldFZpZXdGcm9tQ29udGFpbmVyIiwib0NvbnRhaW5lciIsImlzQSIsImdldENvbXBvbmVudEluc3RhbmNlIiwiZ2V0Um9vdENvbnRyb2wiLCJGY2xDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlZpZXdTdGF0ZSIsIm92ZXJyaWRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5IiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfZ2V0QWxsVmlzaWJsZVZpZXdzIiwiZm9yRWFjaCIsIm9DaGlsZFZpZXciLCJwQ2hpbGRWaWV3IiwiUHJvbWlzZSIsInJlc29sdmUiLCJwdXNoIiwiYWRhcHRTdGF0ZUNvbnRyb2xzIiwiYVN0YXRlQ29udHJvbHMiLCJvblJlc3RvcmUiLCJmY2xDb250cm9sbGVyIiwiYXBwQ29udGVudENvbnRhaW5lciIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJpbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJwYWdlcyIsImdldFByb3BlcnR5IiwiY29tcG9uZW50SWQiLCJzZXRQcm9wZXJ0eSIsIm9uQ29udGFpbmVyUmVhZHkiLCJvblN1c3BlbmQiLCJvRkNMQ29udHJvbGxlciIsIm9GQ0xDb250cm9sIiwiZ2V0RmNsQ29udHJvbCIsImFCZWdpbkNvbHVtblBhZ2VzIiwiZ2V0QmVnaW5Db2x1bW5QYWdlcyIsImFNaWRDb2x1bW5QYWdlcyIsImdldE1pZENvbHVtblBhZ2VzIiwiYUVuZENvbHVtblBhZ2VzIiwiZ2V0RW5kQ29sdW1uUGFnZXMiLCJhUGFnZXMiLCJjb25jYXQiLCJvUGFnZSIsIm9UYXJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJ2aWV3U3RhdGUiLCJvbkluaXQiLCJfaW50ZXJuYWxJbml0IiwibWFuYWdlRGF0YVJlY2VpdmVkIiwiZXZlbnQiLCJnZXRQYXJhbWV0ZXIiLCJwYXRoIiwidGFyZ2V0ZWRWaWV3IiwiZmluZCIsInZpZXciLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldFBhdGgiLCJpc0tlZXBBbGl2ZSIsIl9yb3V0aW5nIiwib25EYXRhUmVjZWl2ZWQiLCJhdHRhY2hSb3V0ZU1hdGNoZXJzIiwiZ2V0Um91dGVyIiwiYXR0YWNoQmVmb3JlUm91dGVNYXRjaGVkIiwiX2dldFZpZXdGb3JOYXZpZ2F0ZWRSb3dzQ29tcHV0YXRpb24iLCJvbkJlZm9yZVJvdXRlTWF0Y2hlZCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIm9uUm91dGVNYXRjaGVkIiwiYXR0YWNoU3RhdGVDaGFuZ2UiLCJfc2F2ZUxheW91dCIsIl9vUm91dGVyUHJveHkiLCJzQ3VycmVudFJvdXRlTmFtZSIsInNDdXJyZW50QXJndW1lbnRzIiwiU1FVRVJZS0VZTkFNRSIsIm9BcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJvRGF0YU1vZGVsIiwiYXR0YWNoRXZlbnQiLCJiaW5kIiwiZ2V0Um91dGVyUHJveHkiLCJfb0ZDTENvbmZpZyIsIm1heENvbHVtbnNDb3VudCIsIm9Sb3V0aW5nQ29uZmlnIiwiZ2V0TWFuaWZlc3QiLCJyb3V0aW5nIiwiY29uZmlnIiwiZmxleGlibGVDb2x1bW5MYXlvdXQiLCJvRkNMTWFuaWZlc3RDb25maWciLCJkZWZhdWx0VHdvQ29sdW1uTGF5b3V0VHlwZSIsImRlZmF1bHRUaHJlZUNvbHVtbkxheW91dFR5cGUiLCJsaW1pdEZDTFRvVHdvQ29sdW1ucyIsImNvbnRyb2xBZ2dyZWdhdGlvbiIsImRlZmF1bHRDb250cm9sQWdncmVnYXRpb24iLCJfaW5pdGlhbGl6ZVRhcmdldEFnZ3JlZ2F0aW9uIiwiX2luaXRpYWxpemVSb3V0ZXNJbmZvcm1hdGlvbiIsIm9uU3RhdGVDaGFuZ2VkIiwiYXR0YWNoQWZ0ZXJFbmRDb2x1bW5OYXZpZ2F0ZSIsIm9FdmVudCIsInNQcmV2aW91c0xheW91dCIsImdldFBhcmFtZXRlcnMiLCJsYXlvdXQiLCJhQWxsVmlzaWJsZVZpZXdzQmVmb3JlUm91dGVNYXRjaGVkIiwib1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQiLCJsZW5ndGgiLCJvUmlnaHRNb3N0VmlldyIsImF0dGFjaEV2ZW50T25jZSIsImdldFZpZXdEYXRhIiwidmlld0xldmVsIiwib0FkZGl0aW9uYWxWaWV3Rm9yTmF2Um93c0NvbXB1dGF0aW9uIiwiZ2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbiIsIm9uRXhpdCIsImRldGFjaFJvdXRlTWF0Y2hlZCIsImRldGFjaEJlZm9yZVJvdXRlTWF0Y2hlZCIsImRldGFjaFN0YXRlQ2hhbmdlIiwiZGV0YWNoQWZ0ZXJFbmRDb2x1bW5OYXZpZ2F0ZSIsIl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uIiwiX29UYXJnZXRzRnJvbVJvdXRlUGF0dGVybiIsIkJhc2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiaXNGY2xFbmFibGVkIiwiZGlzcGxheUVycm9yUGFnZSIsInNFcnJvck1lc3NhZ2UiLCJtUGFyYW1ldGVycyIsIkZDTExldmVsIiwiYU1lc3NhZ2VQYWdlcyIsIm9NZXNzYWdlUGFnZSIsIk1lc3NhZ2VQYWdlIiwic2hvd0hlYWRlciIsImljb24iLCJhZGRCZWdpbkNvbHVtblBhZ2UiLCJhZGRNaWRDb2x1bW5QYWdlIiwiYWRkRW5kQ29sdW1uUGFnZSIsInNldFRleHQiLCJ0ZWNobmljYWxNZXNzYWdlIiwic2V0Q3VzdG9tRGVzY3JpcHRpb24iLCJMaW5rIiwidGV4dCIsImRlc2NyaXB0aW9uIiwicHJlc3MiLCJNZXNzYWdlQm94Iiwic2hvdyIsIkljb24iLCJFUlJPUiIsInRpdGxlIiwiYWN0aW9ucyIsIkFjdGlvbiIsIk9LIiwiZGVmYXVsdEFjdGlvbiIsImRldGFpbHMiLCJ0ZWNobmljYWxEZXRhaWxzIiwiY29udGVudFdpZHRoIiwic2V0RGVzY3JpcHRpb24iLCJ0byIsImdldElkIiwib01hbmlmZXN0Iiwib1RhcmdldHMiLCJ0YXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsInNUYXJnZXROYW1lIiwib1RhcmdldCIsImFnZ3JlZ2F0aW9uIiwicGF0dGVybiIsImNvbnRleHRQYXR0ZXJuIiwiYVJvdXRlcyIsInJvdXRlcyIsInJvdXRlIiwidGFyZ2V0IiwiZ2V0Q3VycmVudEFyZ3VtZW50IiwiZ2V0Q3VycmVudFJvdXRlTmFtZSIsImdldENvbnN0YW50cyIsImdldFRhcmdldEFnZ3JlZ2F0aW9uIiwic1JvdXRlTmFtZSIsIl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcyIsImFWaWV3cyIsInNDdXJyZW50Vmlld1BhdGgiLCJvQWRkaXRpb25hbFZpZXciLCJpbmRleE9mIiwiaW5kZXgiLCJvVmlldyIsIm9QcmV2aW91c1ZpZXciLCJfc2Nyb2xsVGFibGVzVG9Sb3ciLCJiSXNOYXZpZ2F0aW9uQXJyb3ciLCJ1bmRlZmluZWQiLCJfZm9yY2VNb2RlbENvbnRleHRDaGFuZ2VPbkJyZWFkQ3J1bWJzIiwibmF2VG8iLCJnZXRSaWdodG1vc3RWaWV3IiwiX2NvbXB1dGVUaXRsZUhpZXJhcmNoeSIsIm9GY2wiLCJnZXRTb3VyY2UiLCJvUGFnZXMiLCJvQnJlYWRDcnVtYnMiLCJieUlkIiwiZmlyZU1vZGVsQ29udGV4dENoYW5nZSIsIl91cGRhdGVTaGFyZUJ1dHRvblZpc2liaWxpdHkiLCJ2aWV3Q29sdW1uIiwic0xheW91dCIsImJTaG93U2hhcmVJY29uIiwiX3VwZGF0ZUVkaXRCdXR0b25WaXNpYmxpdHkiLCJiRWRpdEJ1dHRvblZpc2libGUiLCJ1cGRhdGVVSVN0YXRlRm9yVmlldyIsIm9VSVN0YXRlIiwiZ2V0SGVscGVyIiwiZ2V0Q3VycmVudFVJU3RhdGUiLCJvRmNsQ29sTmFtZSIsImdldExheW91dCIsInNldE1vZGVsIiwiX2NyZWF0ZUhlbHBlck1vZGVsIiwiYWN0aW9uQnV0dG9uc0luZm8iLCJtaWRDb2x1bW4iLCJmdWxsU2NyZWVuIiwiZXhpdEZ1bGxTY3JlZW4iLCJjbG9zZUNvbHVtbiIsImVuZENvbHVtbiIsImJlZ2luQ29sdW1uIiwib0FjdGlvbkJ1dHRvbkluZm9zIiwiYXNzaWduIiwic3dpdGNoVmlzaWJsZSIsInN3aXRjaEljb24iLCJpc0Z1bGxTY3JlZW4iLCJjbG9zZVZpc2libGUiLCJvUXVlcnlQYXJhbXMiLCJhcmd1bWVudHMiLCJvTmV4dFVJU3RhdGUiLCJnZXROZXh0VUlTdGF0ZSIsImFUYXJnZXRzIiwiX2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzIiwic2V0TGF5b3V0IiwiRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlciIsImdldEluc3RhbmNlRm9yIiwiY2FsY3VsYXRlTGF5b3V0IiwiaU5leHRGQ0xMZXZlbCIsInNIYXNoIiwic1Byb3Bvc2VkTGF5b3V0Iiwia2VlcEN1cnJlbnRMYXlvdXQiLCJvUm91dGUiLCJnZXRSb3V0ZUJ5SGFzaCIsImdldFBhdHRlcm4iLCJhbGxBbGxvd2VkTGF5b3V0cyIsIkFycmF5IiwiaXNBcnJheSIsImFMYXlvdXRzIiwic1RhcmdldEFnZ3JlZ2F0aW9uIiwiZ2V0SW5zdGFuY2VkVmlld3MiLCJmY2xDb250cm9sIiwiY29tcG9uZW50Q29udGFpbmVycyIsIm1hcCIsIkVuZENvbHVtbkZ1bGxTY3JlZW4iLCJnZXRDdXJyZW50RW5kQ29sdW1uUGFnZSIsIk1pZENvbHVtbkZ1bGxTY3JlZW4iLCJnZXRDdXJyZW50TWlkQ29sdW1uUGFnZSIsIk9uZUNvbHVtbiIsImdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UiLCJUaHJlZUNvbHVtbnNFbmRFeHBhbmRlZCIsIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkIiwiVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWQiLCJUd29Db2x1bW5zTWlkRXhwYW5kZWQiLCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZEVuZEhpZGRlbiIsIlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW4iLCJMb2ciLCJlcnJvciIsIl9nZXRBbGxWaWV3cyIsInNMYXlvdXRXaGVuRXhpdEZ1bGxTY3JlZW4iLCJhUmVzdG9yZVByb21pc2VzIiwicmVkdWNlIiwiYVByb21pc2VzIiwiS2VlcEFsaXZlSGVscGVyIiwicmVzdG9yZVZpZXciLCJhbGwiLCJnZXRSaWdodG1vc3RDb250ZXh0IiwicG9wIiwiaXNDb250ZXh0VXNlZEluUGFnZXMiLCJvQ29udGV4dCIsImFBbGxWaXNpYmxlVmlld3MiLCJfc2V0U2hlbGxNZW51VGl0bGUiLCJzVGl0bGUiLCJzQXBwVGl0bGUiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0VGl0bGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZjbC5jb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlciBmcm9tIFwic2FwL2YvRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlclwiO1xuaW1wb3J0IGZMaWJyYXJ5IGZyb20gXCJzYXAvZi9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgUm91dGVyUHJveHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvUm91dGVyUHJveHlcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IExpbmsgZnJvbSBcInNhcC9tL0xpbmtcIjtcbmltcG9ydCBNZXNzYWdlQm94LCB7IEFjdGlvbiwgSWNvbiB9IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgTWVzc2FnZVBhZ2UgZnJvbSBcInNhcC9tL01lc3NhZ2VQYWdlXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIFhNTFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9YTUxWaWV3XCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwiLi4vUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBCYXNlQ29udHJvbGxlciBmcm9tIFwiLi9Sb290Vmlld0Jhc2VDb250cm9sbGVyXCI7XG5cbmNvbnN0IExheW91dFR5cGUgPSBmTGlicmFyeS5MYXlvdXRUeXBlO1xuXG5jb25zdCBDT05TVEFOVFMgPSB7XG5cdHBhZ2U6IHtcblx0XHRuYW1lczogW1wiQmVnaW5Db2x1bW5cIiwgXCJNaWRDb2x1bW5cIiwgXCJFbmRDb2x1bW5cIl0sXG5cdFx0Y3VycmVudEdldHRlcjoge1xuXHRcdFx0cHJlZml4OiBcImdldEN1cnJlbnRcIixcblx0XHRcdHN1ZmZpeDogXCJQYWdlXCJcblx0XHR9LFxuXHRcdGdldHRlcjoge1xuXHRcdFx0cHJlZml4OiBcImdldFwiLFxuXHRcdFx0c3VmZml4OiBcIlBhZ2VzXCJcblx0XHR9XG5cdH1cbn07XG5jb25zdCBfZ2V0Vmlld0Zyb21Db250YWluZXIgPSBmdW5jdGlvbiAob0NvbnRhaW5lcjogYW55KSB7XG5cdGlmIChvQ29udGFpbmVyLmlzQShcInNhcC51aS5jb3JlLkNvbXBvbmVudENvbnRhaW5lclwiKSkge1xuXHRcdHJldHVybiBvQ29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKCkuZ2V0Um9vdENvbnRyb2woKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gb0NvbnRhaW5lcjtcblx0fVxufTtcbi8qKlxuICogQmFzZSBjb250cm9sbGVyIGNsYXNzIGZvciB5b3VyIG93biByb290IHZpZXcgd2l0aCBhbiBzYXAuZi5GbGV4aWJsZUNvbHVtbkxheW91dCBjb250cm9sLlxuICpcbiAqIEJ5IHVzaW5nIG9yIGV4dGVuZGluZyB0aGlzIGNvbnRyb2xsZXIsIHlvdSBjYW4gdXNlIHlvdXIgb3duIHJvb3QgdmlldyB3aXRoIHRoZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQgYW5kXG4gKiB5b3UgY2FuIG1ha2UgdXNlIG9mIFNBUCBGaW9yaSBlbGVtZW50cyBwYWdlcyBhbmQgU0FQIEZpb3JpIGVsZW1lbnRzIGJ1aWxkaW5nIGJsb2Nrcy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS4xMTAuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5yb290Vmlldy5GY2xcIilcbmNsYXNzIEZjbENvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRWaWV3U3RhdGUub3ZlcnJpZGUoe1xuXHRcdFx0YXBwbHlJbml0aWFsU3RhdGVPbmx5OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0sXG5cdFx0XHRhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUsIGFDb250cm9sczogYW55KSB7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgRmNsQ29udHJvbGxlcikuX2dldEFsbFZpc2libGVWaWV3cygpLmZvckVhY2goZnVuY3Rpb24gKG9DaGlsZFZpZXc6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHBDaGlsZFZpZXcgPSBQcm9taXNlLnJlc29sdmUob0NoaWxkVmlldyk7XG5cdFx0XHRcdFx0YUNvbnRyb2xzLnB1c2gocENoaWxkVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdGFkYXB0U3RhdGVDb250cm9sczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSwgYVN0YXRlQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIEZjbENvbnRyb2xsZXIpLl9nZXRBbGxWaXNpYmxlVmlld3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hpbGRWaWV3OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBwQ2hpbGRWaWV3ID0gUHJvbWlzZS5yZXNvbHZlKG9DaGlsZFZpZXcpO1xuXHRcdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gocENoaWxkVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdG9uUmVzdG9yZTogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdFx0XHRjb25zdCBmY2xDb250cm9sbGVyID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIEZjbENvbnRyb2xsZXI7XG5cdFx0XHRcdGNvbnN0IGFwcENvbnRlbnRDb250YWluZXIgPSBmY2xDb250cm9sbGVyLmdldEFwcENvbnRlbnRDb250YWluZXIoKTtcblx0XHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IGFwcENvbnRlbnRDb250YWluZXIuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdGNvbnN0IHBhZ2VzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9wYWdlc1wiKTtcblxuXHRcdFx0XHRmb3IgKGNvbnN0IGNvbXBvbmVudElkIGluIHBhZ2VzKSB7XG5cdFx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShgL3BhZ2VzLyR7Y29tcG9uZW50SWR9L3Jlc3RvcmVTdGF0dXNgLCBcInBlbmRpbmdcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZmNsQ29udHJvbGxlci5vbkNvbnRhaW5lclJlYWR5KCk7XG5cdFx0XHR9LFxuXHRcdFx0b25TdXNwZW5kOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlKSB7XG5cdFx0XHRcdGNvbnN0IG9GQ0xDb250cm9sbGVyID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIEZjbENvbnRyb2xsZXI7XG5cdFx0XHRcdGNvbnN0IG9GQ0xDb250cm9sID0gb0ZDTENvbnRyb2xsZXIuZ2V0RmNsQ29udHJvbCgpO1xuXHRcdFx0XHRjb25zdCBhQmVnaW5Db2x1bW5QYWdlczogQ29udHJvbFtdID0gb0ZDTENvbnRyb2wuZ2V0QmVnaW5Db2x1bW5QYWdlcygpIHx8IFtdO1xuXHRcdFx0XHRjb25zdCBhTWlkQ29sdW1uUGFnZXM6IENvbnRyb2xbXSA9IG9GQ0xDb250cm9sLmdldE1pZENvbHVtblBhZ2VzKCkgfHwgW107XG5cdFx0XHRcdGNvbnN0IGFFbmRDb2x1bW5QYWdlczogQ29udHJvbFtdID0gb0ZDTENvbnRyb2wuZ2V0RW5kQ29sdW1uUGFnZXMoKSB8fCBbXTtcblx0XHRcdFx0Y29uc3QgYVBhZ2VzID0gKFtdIGFzIENvbnRyb2xbXSkuY29uY2F0KGFCZWdpbkNvbHVtblBhZ2VzLCBhTWlkQ29sdW1uUGFnZXMsIGFFbmRDb2x1bW5QYWdlcyk7XG5cblx0XHRcdFx0YVBhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9QYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IF9nZXRWaWV3RnJvbUNvbnRhaW5lcihvUGFnZSk7XG5cblx0XHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9UYXJnZXRWaWV3ICYmIG9UYXJnZXRWaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQpIHtcblx0XHRcdFx0XHRcdG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdHByb3RlY3RlZCBfb1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cblx0cHJpdmF0ZSBzQ3VycmVudFJvdXRlTmFtZSE6IHN0cmluZztcblxuXHRwcml2YXRlIHNDdXJyZW50QXJndW1lbnRzPzogYW55O1xuXG5cdHByaXZhdGUgc1ByZXZpb3VzTGF5b3V0ITogc3RyaW5nO1xuXG5cdHByaXZhdGUgU1FVRVJZS0VZTkFNRSE6IHN0cmluZztcblxuXHRwcm90ZWN0ZWQgX29GQ0xDb25maWc6IGFueTtcblxuXHRwcml2YXRlIG9BZGRpdGlvbmFsVmlld0Zvck5hdlJvd3NDb21wdXRhdGlvbjogYW55O1xuXG5cdHByaXZhdGUgX29UYXJnZXRzQWdncmVnYXRpb246IGFueTtcblxuXHRwcml2YXRlIF9vVGFyZ2V0c0Zyb21Sb3V0ZVBhdHRlcm46IGFueTtcblxuXHRwcml2YXRlIGFNZXNzYWdlUGFnZXM/OiBhbnlbXTtcblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5nZXRNZXRhZGF0YVxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cblx0b25Jbml0KCkge1xuXHRcdHN1cGVyLm9uSW5pdCgpO1xuXG5cdFx0dGhpcy5faW50ZXJuYWxJbml0KCk7XG5cdH1cblxuXHRtYW5hZ2VEYXRhUmVjZWl2ZWQoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0aWYgKGV2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpKSB7XG5cdFx0XHRjb25zdCBwYXRoID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwicGF0aFwiKSxcblx0XHRcdFx0dGFyZ2V0ZWRWaWV3ID0gdGhpcy5fZ2V0QWxsVmlzaWJsZVZpZXdzKCkuZmluZCgodmlldykgPT4gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCkgPT09IHBhdGgpO1xuXHRcdFx0Ly8gV2UgbmVlZCB0byBtYW5hZ2UgZXJyb3Igd2hlbiB0aGUgcmVxdWVzdCBpcyByZWxhdGVkIHRvIGEgZm9ybSAgaW50byBhbiBPYmplY3RQYWdlXG5cdFx0XHRpZiAocGF0aCAmJiAodGFyZ2V0ZWRWaWV3Py5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpPy5pc0tlZXBBbGl2ZSgpKSB7XG5cdFx0XHRcdCh0YXJnZXRlZFZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fcm91dGluZy5vbkRhdGFSZWNlaXZlZChldmVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXR0YWNoUm91dGVNYXRjaGVycygpIHtcblx0XHR0aGlzLmdldFJvdXRlcigpLmF0dGFjaEJlZm9yZVJvdXRlTWF0Y2hlZCh0aGlzLl9nZXRWaWV3Rm9yTmF2aWdhdGVkUm93c0NvbXB1dGF0aW9uLCB0aGlzKTtcblx0XHRzdXBlci5hdHRhY2hSb3V0ZU1hdGNoZXJzKCk7XG5cdFx0dGhpcy5faW50ZXJuYWxJbml0KCk7XG5cblx0XHR0aGlzLmdldFJvdXRlcigpLmF0dGFjaEJlZm9yZVJvdXRlTWF0Y2hlZCh0aGlzLm9uQmVmb3JlUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHR0aGlzLmdldFJvdXRlcigpLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLm9uUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5hdHRhY2hTdGF0ZUNoYW5nZSh0aGlzLl9zYXZlTGF5b3V0LCB0aGlzKTtcblx0fVxuXG5cdF9pbnRlcm5hbEluaXQoKSB7XG5cdFx0aWYgKHRoaXMuX29Sb3V0ZXJQcm94eSkge1xuXHRcdFx0cmV0dXJuOyAvLyBBbHJlYWR5IGluaXRpYWxpemVkXG5cdFx0fVxuXG5cdFx0dGhpcy5zQ3VycmVudFJvdXRlTmFtZSA9IFwiXCI7XG5cdFx0dGhpcy5zQ3VycmVudEFyZ3VtZW50cyA9IHt9O1xuXHRcdHRoaXMuU1FVRVJZS0VZTkFNRSA9IFwiP3F1ZXJ5XCI7XG5cblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblxuXHRcdGNvbnN0IG9EYXRhTW9kZWwgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1vZGVsKCk7XG5cdFx0b0RhdGFNb2RlbD8uYXR0YWNoRXZlbnQoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5tYW5hZ2VEYXRhUmVjZWl2ZWQuYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLl9vUm91dGVyUHJveHkgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCk7XG5cblx0XHQvLyBHZXQgRkNMIGNvbmZpZ3VyYXRpb24gaW4gdGhlIG1hbmlmZXN0XG5cdFx0dGhpcy5fb0ZDTENvbmZpZyA9IHsgbWF4Q29sdW1uc0NvdW50OiAzIH07XG5cdFx0Y29uc3Qgb1JvdXRpbmdDb25maWcgPSAob0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdCgpIGFzIGFueSlbXCJzYXAudWk1XCJdLnJvdXRpbmc7XG5cblx0XHRpZiAob1JvdXRpbmdDb25maWc/LmNvbmZpZz8uZmxleGlibGVDb2x1bW5MYXlvdXQpIHtcblx0XHRcdGNvbnN0IG9GQ0xNYW5pZmVzdENvbmZpZyA9IG9Sb3V0aW5nQ29uZmlnLmNvbmZpZy5mbGV4aWJsZUNvbHVtbkxheW91dDtcblxuXHRcdFx0Ly8gRGVmYXVsdCBsYXlvdXQgZm9yIDIgY29sdW1uc1xuXHRcdFx0aWYgKG9GQ0xNYW5pZmVzdENvbmZpZy5kZWZhdWx0VHdvQ29sdW1uTGF5b3V0VHlwZSkge1xuXHRcdFx0XHR0aGlzLl9vRkNMQ29uZmlnLmRlZmF1bHRUd29Db2x1bW5MYXlvdXRUeXBlID0gb0ZDTE1hbmlmZXN0Q29uZmlnLmRlZmF1bHRUd29Db2x1bW5MYXlvdXRUeXBlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBEZWZhdWx0IGxheW91dCBmb3IgMyBjb2x1bW5zXG5cdFx0XHRpZiAob0ZDTE1hbmlmZXN0Q29uZmlnLmRlZmF1bHRUaHJlZUNvbHVtbkxheW91dFR5cGUpIHtcblx0XHRcdFx0dGhpcy5fb0ZDTENvbmZpZy5kZWZhdWx0VGhyZWVDb2x1bW5MYXlvdXRUeXBlID0gb0ZDTE1hbmlmZXN0Q29uZmlnLmRlZmF1bHRUaHJlZUNvbHVtbkxheW91dFR5cGU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIExpbWl0IEZDTCB0byAyIGNvbHVtbnMgP1xuXHRcdFx0aWYgKG9GQ0xNYW5pZmVzdENvbmZpZy5saW1pdEZDTFRvVHdvQ29sdW1ucyA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCA9IDI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvUm91dGluZ0NvbmZpZz8uY29uZmlnPy5jb250cm9sQWdncmVnYXRpb24pIHtcblx0XHRcdHRoaXMuX29GQ0xDb25maWcuZGVmYXVsdENvbnRyb2xBZ2dyZWdhdGlvbiA9IG9Sb3V0aW5nQ29uZmlnLmNvbmZpZy5jb250cm9sQWdncmVnYXRpb247XG5cdFx0fVxuXG5cdFx0dGhpcy5faW5pdGlhbGl6ZVRhcmdldEFnZ3JlZ2F0aW9uKG9BcHBDb21wb25lbnQpO1xuXHRcdHRoaXMuX2luaXRpYWxpemVSb3V0ZXNJbmZvcm1hdGlvbihvQXBwQ29tcG9uZW50KTtcblxuXHRcdHRoaXMuZ2V0RmNsQ29udHJvbCgpLmF0dGFjaFN0YXRlQ2hhbmdlKHRoaXMub25TdGF0ZUNoYW5nZWQsIHRoaXMpO1xuXHRcdHRoaXMuZ2V0RmNsQ29udHJvbCgpLmF0dGFjaEFmdGVyRW5kQ29sdW1uTmF2aWdhdGUodGhpcy5vblN0YXRlQ2hhbmdlZCwgdGhpcyk7XG5cdH1cblxuXHRnZXRGY2xDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLmdldEFwcENvbnRlbnRDb250YWluZXIoKSBhcyBGbGV4aWJsZUNvbHVtbkxheW91dDtcblx0fVxuXG5cdF9zYXZlTGF5b3V0KG9FdmVudDogYW55KSB7XG5cdFx0dGhpcy5zUHJldmlvdXNMYXlvdXQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpLmxheW91dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGFkZGl0aW9uYWwgdmlldyAob24gdG9wIG9mIHRoZSB2aXNpYmxlIHZpZXdzKSwgdG8gYmUgYWJsZSB0byBjb21wdXRlIHRoZSBsYXRlc3QgdGFibGUgbmF2aWdhdGVkIHJvd3Mgb2Zcblx0ICogdGhlIG1vc3QgcmlnaHQgdmlzaWJsZSB2aWV3IGFmdGVyIGEgbmF2IGJhY2sgb3IgY29sdW1uIGZ1bGxzY3JlZW4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNfZ2V0UmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICovXG5cblx0X2dldFZpZXdGb3JOYXZpZ2F0ZWRSb3dzQ29tcHV0YXRpb24oKSB7XG5cdFx0Y29uc3QgYUFsbFZpc2libGVWaWV3c0JlZm9yZVJvdXRlTWF0Y2hlZCA9IHRoaXMuX2dldEFsbFZpc2libGVWaWV3cyh0aGlzLnNQcmV2aW91c0xheW91dCk7XG5cdFx0Y29uc3Qgb1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQgPSBhQWxsVmlzaWJsZVZpZXdzQmVmb3JlUm91dGVNYXRjaGVkW2FBbGxWaXNpYmxlVmlld3NCZWZvcmVSb3V0ZU1hdGNoZWQubGVuZ3RoIC0gMV07XG5cdFx0bGV0IG9SaWdodE1vc3RWaWV3O1xuXHRcdHRoaXMuZ2V0Um91dGVyKCkuYXR0YWNoRXZlbnRPbmNlKFwicm91dGVNYXRjaGVkXCIsIChvRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0b1JpZ2h0TW9zdFZpZXcgPSBfZ2V0Vmlld0Zyb21Db250YWluZXIob0V2ZW50LmdldFBhcmFtZXRlcihcInZpZXdzXCIpW29FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2aWV3c1wiKS5sZW5ndGggLSAxXSk7XG5cdFx0XHRpZiAob1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQpIHtcblx0XHRcdFx0Ly8gTmF2aWdhdGlvbiBmb3J3YXJkIGZyb20gTDIgdG8gdmlldyBsZXZlbCBMMyAoRnVsbFNjcmVlbkxheW91dCk6XG5cdFx0XHRcdGlmIChvUmlnaHRNb3N0Vmlldy5nZXRWaWV3RGF0YSgpICYmIG9SaWdodE1vc3RWaWV3LmdldFZpZXdEYXRhKCkudmlld0xldmVsID09PSB0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCkge1xuXHRcdFx0XHRcdHRoaXMub0FkZGl0aW9uYWxWaWV3Rm9yTmF2Um93c0NvbXB1dGF0aW9uID0gb1JpZ2h0TW9zdFZpZXc7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gTmF2aWdhdGlvbnMgYmFja3dhcmQgZnJvbSBMMyBkb3duIHRvIEwyLCBMMSwgTDAgKFRocmVlQ29sdW1uIGxheW91dCk6XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRvUmlnaHRNb3N0Vmlldy5nZXRWaWV3RGF0YSgpICYmXG5cdFx0XHRcdFx0b1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQuZ2V0Vmlld0RhdGEoKSAmJlxuXHRcdFx0XHRcdG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkLmdldFZpZXdEYXRhKCkudmlld0xldmVsIDwgdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQgJiZcblx0XHRcdFx0XHRvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZC5nZXRWaWV3RGF0YSgpICYmXG5cdFx0XHRcdFx0b1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQuZ2V0Vmlld0RhdGEoKS52aWV3TGV2ZWwgPiBvUmlnaHRNb3N0Vmlldy5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbCAmJlxuXHRcdFx0XHRcdG9SaWdodE1vc3RWaWV3ICE9PSBvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZFxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHR0aGlzLm9BZGRpdGlvbmFsVmlld0Zvck5hdlJvd3NDb21wdXRhdGlvbiA9IG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRWaWV3Rm9yTmF2aWdhdGVkUm93c0NvbXB1dGF0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm9BZGRpdGlvbmFsVmlld0Zvck5hdlJvd3NDb21wdXRhdGlvbjtcblx0fVxuXG5cdG9uRXhpdCgpIHtcblx0XHR0aGlzLmdldFJvdXRlcigpLmRldGFjaFJvdXRlTWF0Y2hlZCh0aGlzLm9uUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHR0aGlzLmdldFJvdXRlcigpLmRldGFjaEJlZm9yZVJvdXRlTWF0Y2hlZCh0aGlzLm9uQmVmb3JlUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5kZXRhY2hTdGF0ZUNoYW5nZSh0aGlzLm9uU3RhdGVDaGFuZ2VkLCB0aGlzKTtcblx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5kZXRhY2hBZnRlckVuZENvbHVtbk5hdmlnYXRlKHRoaXMub25TdGF0ZUNoYW5nZWQsIHRoaXMpO1xuXHRcdHRoaXMuX29UYXJnZXRzQWdncmVnYXRpb24gPSBudWxsO1xuXHRcdHRoaXMuX29UYXJnZXRzRnJvbVJvdXRlUGF0dGVybiA9IG51bGw7XG5cblx0XHRCYXNlQ29udHJvbGxlci5wcm90b3R5cGUub25FeGl0LmJpbmQodGhpcykoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgRkNMIGNvbXBvbmVudCBpcyBlbmFibGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjaXNGY2xFbmFibGVkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgc2luY2Ugd2UgYXJlIGluIEZDTCBzY2VuYXJpb1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRpc0ZjbEVuYWJsZWQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgY3JlYXRlcyBhIG5ldyBQYWdlIHRvIGRpc3BsYXkgdGhlIElsbHVzdHJhdGVkTWVzc2FnZSBjb250YWluaW5nIHRoZSBjdXJyZW50IGVycm9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0Vycm9yTWVzc2FnZVxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnNcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI2Rpc3BsYXlFcnJvclBhZ2Vcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgY3JlYXRlcyBhIFBhZ2UgdG8gZGlzcGxheSB0aGUgZXJyb3Jcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0ZGlzcGxheUVycm9yUGFnZShzRXJyb3JNZXNzYWdlOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBvRkNMQ29udHJvbCA9IHRoaXMuZ2V0RmNsQ29udHJvbCgpO1xuXG5cdFx0aWYgKHRoaXMuX29GQ0xDb25maWcgJiYgbVBhcmFtZXRlcnMuRkNMTGV2ZWwgPj0gdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLkZDTExldmVsID0gdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQgLSAxO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5hTWVzc2FnZVBhZ2VzKSB7XG5cdFx0XHR0aGlzLmFNZXNzYWdlUGFnZXMgPSBbbnVsbCwgbnVsbCwgbnVsbF07XG5cdFx0fVxuXHRcdGxldCBvTWVzc2FnZVBhZ2UgPSB0aGlzLmFNZXNzYWdlUGFnZXNbbVBhcmFtZXRlcnMuRkNMTGV2ZWxdO1xuXHRcdGlmICghb01lc3NhZ2VQYWdlKSB7XG5cdFx0XHRvTWVzc2FnZVBhZ2UgPSBuZXcgTWVzc2FnZVBhZ2Uoe1xuXHRcdFx0XHRzaG93SGVhZGVyOiBmYWxzZSxcblx0XHRcdFx0aWNvbjogXCJzYXAtaWNvbjovL21lc3NhZ2UtZXJyb3JcIlxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLmFNZXNzYWdlUGFnZXNbbVBhcmFtZXRlcnMuRkNMTGV2ZWxdID0gb01lc3NhZ2VQYWdlO1xuXG5cdFx0XHRzd2l0Y2ggKG1QYXJhbWV0ZXJzLkZDTExldmVsKSB7XG5cdFx0XHRcdGNhc2UgMDpcblx0XHRcdFx0XHRvRkNMQ29udHJvbC5hZGRCZWdpbkNvbHVtblBhZ2Uob01lc3NhZ2VQYWdlKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0b0ZDTENvbnRyb2wuYWRkTWlkQ29sdW1uUGFnZShvTWVzc2FnZVBhZ2UpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0b0ZDTENvbnRyb2wuYWRkRW5kQ29sdW1uUGFnZShvTWVzc2FnZVBhZ2UpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG9NZXNzYWdlUGFnZS5zZXRUZXh0KHNFcnJvck1lc3NhZ2UpO1xuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLnRlY2huaWNhbE1lc3NhZ2UpIHtcblx0XHRcdG9NZXNzYWdlUGFnZS5zZXRDdXN0b21EZXNjcmlwdGlvbihcblx0XHRcdFx0bmV3IExpbmsoe1xuXHRcdFx0XHRcdHRleHQ6IG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIHx8IG1QYXJhbWV0ZXJzLnRlY2huaWNhbE1lc3NhZ2UsXG5cdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdE1lc3NhZ2VCb3guc2hvdyhtUGFyYW1ldGVycy50ZWNobmljYWxNZXNzYWdlLCB7XG5cdFx0XHRcdFx0XHRcdGljb246IEljb24uRVJST1IsXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBtUGFyYW1ldGVycy50aXRsZSxcblx0XHRcdFx0XHRcdFx0YWN0aW9uczogW0FjdGlvbi5PS10sXG5cdFx0XHRcdFx0XHRcdGRlZmF1bHRBY3Rpb246IEFjdGlvbi5PSyxcblx0XHRcdFx0XHRcdFx0ZGV0YWlsczogbVBhcmFtZXRlcnMudGVjaG5pY2FsRGV0YWlscyB8fCBcIlwiLFxuXHRcdFx0XHRcdFx0XHRjb250ZW50V2lkdGg6IFwiNjAlXCJcblx0XHRcdFx0XHRcdH0gYXMgYW55KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvTWVzc2FnZVBhZ2Uuc2V0RGVzY3JpcHRpb24obVBhcmFtZXRlcnMuZGVzY3JpcHRpb24gfHwgXCJcIik7XG5cdFx0fVxuXG5cdFx0KG9GQ0xDb250cm9sIGFzIGFueSkudG8ob01lc3NhZ2VQYWdlLmdldElkKCkpO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgb2JqZWN0IF9vVGFyZ2V0c0FnZ3JlZ2F0aW9uIHRoYXQgZGVmaW5lcyBmb3IgZWFjaCByb3V0ZSB0aGUgcmVsZXZhbnQgYWdncmVnYXRpb24gYW5kIHBhdHRlcm4uXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI19pbml0aWFsaXplVGFyZ2V0QWdncmVnYXRpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gW29BcHBDb21wb25lbnRdIFJlZmVyZW5jZSB0byB0aGUgQXBwQ29tcG9uZW50XG5cdCAqL1xuXHRfaW5pdGlhbGl6ZVRhcmdldEFnZ3JlZ2F0aW9uKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdGNvbnN0IG9NYW5pZmVzdCA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKSBhcyBhbnksXG5cdFx0XHRvVGFyZ2V0cyA9IG9NYW5pZmVzdFtcInNhcC51aTVcIl0ucm91dGluZyA/IG9NYW5pZmVzdFtcInNhcC51aTVcIl0ucm91dGluZy50YXJnZXRzIDogbnVsbDtcblxuXHRcdHRoaXMuX29UYXJnZXRzQWdncmVnYXRpb24gPSB7fTtcblxuXHRcdGlmIChvVGFyZ2V0cykge1xuXHRcdFx0T2JqZWN0LmtleXMob1RhcmdldHMpLmZvckVhY2goKHNUYXJnZXROYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0Y29uc3Qgb1RhcmdldCA9IG9UYXJnZXRzW3NUYXJnZXROYW1lXTtcblx0XHRcdFx0aWYgKG9UYXJnZXQuY29udHJvbEFnZ3JlZ2F0aW9uKSB7XG5cdFx0XHRcdFx0dGhpcy5fb1RhcmdldHNBZ2dyZWdhdGlvbltzVGFyZ2V0TmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRhZ2dyZWdhdGlvbjogb1RhcmdldC5jb250cm9sQWdncmVnYXRpb24sXG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiBvVGFyZ2V0LmNvbnRleHRQYXR0ZXJuXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uW3NUYXJnZXROYW1lXSA9IHtcblx0XHRcdFx0XHRcdGFnZ3JlZ2F0aW9uOiBcInBhZ2VcIixcblx0XHRcdFx0XHRcdHBhdHRlcm46IG51bGxcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1hcHBpbmcgYmV0d2VlbiBhIHJvdXRlIChpZGVudGlmZWQgYXMgaXRzIHBhdHRlcm4pIGFuZCB0aGUgY29ycmVzcG9uZGluZyB0YXJnZXRzXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI19pbml0aWFsaXplUm91dGVzSW5mb3JtYXRpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb0FwcENvbXBvbmVudCByZWYgdG8gdGhlIEFwcENvbXBvbmVudFxuXHQgKi9cblxuXHRfaW5pdGlhbGl6ZVJvdXRlc0luZm9ybWF0aW9uKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdGNvbnN0IG9NYW5pZmVzdCA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKSBhcyBhbnksXG5cdFx0XHRhUm91dGVzID0gb01hbmlmZXN0W1wic2FwLnVpNVwiXS5yb3V0aW5nID8gb01hbmlmZXN0W1wic2FwLnVpNVwiXS5yb3V0aW5nLnJvdXRlcyA6IG51bGw7XG5cblx0XHR0aGlzLl9vVGFyZ2V0c0Zyb21Sb3V0ZVBhdHRlcm4gPSB7fTtcblxuXHRcdGlmIChhUm91dGVzKSB7XG5cdFx0XHRhUm91dGVzLmZvckVhY2goKHJvdXRlOiBhbnkpID0+IHtcblx0XHRcdFx0dGhpcy5fb1RhcmdldHNGcm9tUm91dGVQYXR0ZXJuW3JvdXRlLnBhdHRlcm5dID0gcm91dGUudGFyZ2V0O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0Q3VycmVudEFyZ3VtZW50KCkge1xuXHRcdHJldHVybiB0aGlzLnNDdXJyZW50QXJndW1lbnRzO1xuXHR9XG5cblx0Z2V0Q3VycmVudFJvdXRlTmFtZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zQ3VycmVudFJvdXRlTmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgRkUgRkNMIGNvbnN0YW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgVGhlIGNvbnN0YW50c1xuXHQgKi9cblx0Z2V0Q29uc3RhbnRzKCkge1xuXHRcdHJldHVybiBDT05TVEFOVFM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0dGVyIGZvciBvVGFyZ2V0c0FnZ3JlZ2F0aW9uIGFycmF5LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNnZXRUYXJnZXRBZ2dyZWdhdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEByZXR1cm5zIFRoZSBfb1RhcmdldHNBZ2dyZWdhdGlvbiBhcnJheVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldFRhcmdldEFnZ3JlZ2F0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRyaWdnZXJlZCBieSB0aGUgcm91dGVyIFJvdXRlTWF0Y2hlZCBldmVudC5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjb25Sb3V0ZU1hdGNoZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICovXG5cdG9uUm91dGVNYXRjaGVkKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3Qgc1JvdXRlTmFtZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJuYW1lXCIpO1xuXG5cdFx0Ly8gU2F2ZSB0aGUgY3VycmVudC9wcmV2aW91cyByb3V0ZXMgYW5kIGFyZ3VtZW50c1xuXHRcdHRoaXMuc0N1cnJlbnRSb3V0ZU5hbWUgPSBzUm91dGVOYW1lO1xuXHRcdHRoaXMuc0N1cnJlbnRBcmd1bWVudHMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiYXJndW1lbnRzXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdHJpZ2dlcmluZyB0aGUgdGFibGUgc2Nyb2xsIHRvIHRoZSBuYXZpZ2F0ZWQgcm93IGFmdGVyIGVhY2ggbGF5b3V0IGNoYW5nZS5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjc2Nyb2xsVG9MYXN0U2VsZWN0ZWRJdGVtXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKi9cblxuXHRfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMoKSB7XG5cdFx0Y29uc3QgYVZpZXdzID0gdGhpcy5fZ2V0QWxsVmlzaWJsZVZpZXdzKCk7XG5cdFx0Ly9UaGUgc2Nyb2xscyBhcmUgdHJpZ2dlcmVkIG9ubHkgaWYgdGhlIGxheW91dCBpcyB3aXRoIHNldmVyYWwgY29sdW1ucyBvciB3aGVuIHN3aXRjaGluZyB0aGUgbW9zdFJpZ2h0IGNvbHVtbiBpbiBmdWxsIHNjcmVlblxuXHRcdGlmIChhVmlld3MubGVuZ3RoID4gMSB8fCBhVmlld3NbMF0uZ2V0Vmlld0RhdGEoKS52aWV3TGV2ZWwgPCB0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCkge1xuXHRcdFx0bGV0IHNDdXJyZW50Vmlld1BhdGg7XG5cdFx0XHRjb25zdCBvQWRkaXRpb25hbFZpZXcgPSB0aGlzLmdldFZpZXdGb3JOYXZpZ2F0ZWRSb3dzQ29tcHV0YXRpb24oKTtcblx0XHRcdGlmIChvQWRkaXRpb25hbFZpZXcgJiYgYVZpZXdzLmluZGV4T2Yob0FkZGl0aW9uYWxWaWV3KSA9PT0gLTEpIHtcblx0XHRcdFx0YVZpZXdzLnB1c2gob0FkZGl0aW9uYWxWaWV3KTtcblx0XHRcdH1cblx0XHRcdGZvciAobGV0IGluZGV4ID0gYVZpZXdzLmxlbmd0aCAtIDE7IGluZGV4ID4gMDsgaW5kZXgtLSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IGFWaWV3c1tpbmRleF0sXG5cdFx0XHRcdFx0b1ByZXZpb3VzVmlldyA9IGFWaWV3c1tpbmRleCAtIDFdO1xuXHRcdFx0XHRpZiAob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0XHRcdHNDdXJyZW50Vmlld1BhdGggPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKTtcblx0XHRcdFx0XHRvUHJldmlvdXNWaWV3LmdldENvbnRyb2xsZXIoKS5fc2Nyb2xsVGFibGVzVG9Sb3coc0N1cnJlbnRWaWV3UGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdHJpZ2dlcmVkIGJ5IHRoZSBGQ0wgU3RhdGVDaGFuZ2VkIGV2ZW50LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNvblN0YXRlQ2hhbmdlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKi9cblx0b25TdGF0ZUNoYW5nZWQob0V2ZW50OiBhbnkpIHtcblx0XHRjb25zdCBiSXNOYXZpZ2F0aW9uQXJyb3cgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaXNOYXZpZ2F0aW9uQXJyb3dcIik7XG5cdFx0aWYgKHRoaXMuc0N1cnJlbnRBcmd1bWVudHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKCF0aGlzLnNDdXJyZW50QXJndW1lbnRzW3RoaXMuU1FVRVJZS0VZTkFNRV0pIHtcblx0XHRcdFx0dGhpcy5zQ3VycmVudEFyZ3VtZW50c1t0aGlzLlNRVUVSWUtFWU5BTUVdID0ge307XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnNDdXJyZW50QXJndW1lbnRzW3RoaXMuU1FVRVJZS0VZTkFNRV0ubGF5b3V0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImxheW91dFwiKTtcblx0XHR9XG5cdFx0dGhpcy5fZm9yY2VNb2RlbENvbnRleHRDaGFuZ2VPbkJyZWFkQ3J1bWJzKG9FdmVudCk7XG5cblx0XHQvLyBSZXBsYWNlIHRoZSBVUkwgd2l0aCB0aGUgbmV3IGxheW91dCBpZiBhIG5hdmlnYXRpb24gYXJyb3cgd2FzIHVzZWRcblx0XHRpZiAoYklzTmF2aWdhdGlvbkFycm93KSB7XG5cdFx0XHR0aGlzLl9vUm91dGVyUHJveHkubmF2VG8odGhpcy5zQ3VycmVudFJvdXRlTmFtZSwgdGhpcy5zQ3VycmVudEFyZ3VtZW50cyk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFJpZ2h0bW9zdFZpZXcoKTtcblx0XHRpZiAob1ZpZXcpIHtcblx0XHRcdHRoaXMuX2NvbXB1dGVUaXRsZUhpZXJhcmNoeShvVmlldyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIGZpcmUgTW9kZWxDb250ZXh0Q2hhbmdlIGV2ZW50IG9uIGFsbCBicmVhZGNydW1icyAoIG9uIGVhY2ggT2JqZWN0UGFnZXMpLlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNfZm9yY2VNb2RlbENvbnRleHRDaGFuZ2VPbkJyZWFkQ3J1bWJzXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqL1xuXHRfZm9yY2VNb2RlbENvbnRleHRDaGFuZ2VPbkJyZWFkQ3J1bWJzKG9FdmVudDogYW55KSB7XG5cdFx0Ly9mb3JjZSBtb2RlbGNvbnRleHRjaGFuZ2Ugb24gT2JqZWN0UGFnZXMgdG8gcmVmcmVzaCB0aGUgYnJlYWRjcnVtYnMgbGluayBocmVmc1xuXHRcdGNvbnN0IG9GY2wgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0bGV0IG9QYWdlczogYW55W10gPSBbXTtcblx0XHRvUGFnZXMgPSBvUGFnZXMuY29uY2F0KG9GY2wuZ2V0QmVnaW5Db2x1bW5QYWdlcygpKS5jb25jYXQob0ZjbC5nZXRNaWRDb2x1bW5QYWdlcygpKS5jb25jYXQob0ZjbC5nZXRFbmRDb2x1bW5QYWdlcygpKTtcblx0XHRvUGFnZXMuZm9yRWFjaChmdW5jdGlvbiAob1BhZ2U6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBfZ2V0Vmlld0Zyb21Db250YWluZXIob1BhZ2UpO1xuXHRcdFx0Y29uc3Qgb0JyZWFkQ3J1bWJzID0gb1ZpZXcuYnlJZCAmJiBvVmlldy5ieUlkKFwiYnJlYWRjcnVtYnNcIik7XG5cdFx0XHRpZiAob0JyZWFkQ3J1bWJzKSB7XG5cdFx0XHRcdG9CcmVhZENydW1icy5maXJlTW9kZWxDb250ZXh0Q2hhbmdlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdHJpZ2dlcmVkIHRvIHVwZGF0ZSB0aGUgU2hhcmUgYnV0dG9uIFZpc2liaWxpdHkuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcGFyYW0gdmlld0NvbHVtbiBOYW1lIG9mIHRoZSBjdXJyZW50IGNvbHVtbiAoXCJiZWdpbkNvbHVtblwiLCBcIm1pZENvbHVtblwiLCBcImVuZENvbHVtblwiKVxuXHQgKiBAcGFyYW0gc0xheW91dCBUaGUgY3VycmVudCBsYXlvdXQgdXNlZCBieSB0aGUgRkNMXG5cdCAqIEByZXR1cm5zIFRoZSBzaGFyZSBidXR0b24gdmlzaWJpbGl0eVxuXHQgKi9cblx0X3VwZGF0ZVNoYXJlQnV0dG9uVmlzaWJpbGl0eSh2aWV3Q29sdW1uOiBzdHJpbmcsIHNMYXlvdXQ6IHN0cmluZykge1xuXHRcdGxldCBiU2hvd1NoYXJlSWNvbjtcblx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdGNhc2UgXCJPbmVDb2x1bW5cIjpcblx0XHRcdFx0YlNob3dTaGFyZUljb24gPSB2aWV3Q29sdW1uID09PSBcImJlZ2luQ29sdW1uXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIjpcblx0XHRcdGNhc2UgXCJUaHJlZUNvbHVtbnNCZWdpbkV4cGFuZGVkRW5kSGlkZGVuXCI6XG5cdFx0XHRjYXNlIFwiVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRFbmRIaWRkZW5cIjpcblx0XHRcdGNhc2UgXCJUd29Db2x1bW5zQmVnaW5FeHBhbmRlZFwiOlxuXHRcdFx0Y2FzZSBcIlR3b0NvbHVtbnNNaWRFeHBhbmRlZFwiOlxuXHRcdFx0XHRiU2hvd1NoYXJlSWNvbiA9IHZpZXdDb2x1bW4gPT09IFwibWlkQ29sdW1uXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVuZENvbHVtbkZ1bGxTY3JlZW5cIjpcblx0XHRcdGNhc2UgXCJUaHJlZUNvbHVtbnNFbmRFeHBhbmRlZFwiOlxuXHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkXCI6XG5cdFx0XHRcdGJTaG93U2hhcmVJY29uID0gdmlld0NvbHVtbiA9PT0gXCJlbmRDb2x1bW5cIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRiU2hvd1NoYXJlSWNvbiA9IGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gYlNob3dTaGFyZUljb247XG5cdH1cblxuXHRfdXBkYXRlRWRpdEJ1dHRvblZpc2libGl0eSh2aWV3Q29sdW1uOiBzdHJpbmcsIHNMYXlvdXQ6IHN0cmluZykge1xuXHRcdGxldCBiRWRpdEJ1dHRvblZpc2libGUgPSB0cnVlO1xuXHRcdHN3aXRjaCAodmlld0NvbHVtbikge1xuXHRcdFx0Y2FzZSBcIm1pZENvbHVtblwiOlxuXHRcdFx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdFx0XHRjYXNlIFwiVHdvQ29sdW1uc01pZEV4cGFuZGVkXCI6XG5cdFx0XHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkXCI6XG5cdFx0XHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc0VuZEV4cGFuZGVkXCI6XG5cdFx0XHRcdFx0XHRiRWRpdEJ1dHRvblZpc2libGUgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImVuZENvbHVtblwiOlxuXHRcdFx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdFx0XHRjYXNlIFwiVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRcIjpcblx0XHRcdFx0XHRjYXNlIFwiVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWRcIjpcblx0XHRcdFx0XHRcdGJFZGl0QnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gYkVkaXRCdXR0b25WaXNpYmxlO1xuXHR9XG5cblx0dXBkYXRlVUlTdGF0ZUZvclZpZXcob1ZpZXc6IGFueSwgRkNMTGV2ZWw6IGFueSkge1xuXHRcdGNvbnN0IG9VSVN0YXRlID0gdGhpcy5nZXRIZWxwZXIoKS5nZXRDdXJyZW50VUlTdGF0ZSgpIGFzIGFueSxcblx0XHRcdG9GY2xDb2xOYW1lID0gW1wiYmVnaW5Db2x1bW5cIiwgXCJtaWRDb2x1bW5cIiwgXCJlbmRDb2x1bW5cIl0sXG5cdFx0XHRzTGF5b3V0ID0gdGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0TGF5b3V0KCk7XG5cdFx0bGV0IHZpZXdDb2x1bW47XG5cblx0XHRpZiAoIW9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpKSB7XG5cdFx0XHRvVmlldy5zZXRNb2RlbCh0aGlzLl9jcmVhdGVIZWxwZXJNb2RlbCgpLCBcImZjbGhlbHBlclwiKTtcblx0XHR9XG5cdFx0aWYgKEZDTExldmVsID49IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50KSB7XG5cdFx0XHQvLyBUaGUgdmlldyBpcyBvbiBhIGxldmVsID4gbWF4IG51bWJlciBvZiBjb2x1bW5zLiBJdCdzIGFsd2F5cyBmdWxsc2NyZWVuIHdpdGhvdXQgY2xvc2UvZXhpdCBidXR0b25zXG5cdFx0XHR2aWV3Q29sdW1uID0gb0ZjbENvbE5hbWVbdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQgLSAxXTtcblx0XHRcdG9VSVN0YXRlLmFjdGlvbkJ1dHRvbnNJbmZvLm1pZENvbHVtbi5mdWxsU2NyZWVuID0gbnVsbDtcblx0XHRcdG9VSVN0YXRlLmFjdGlvbkJ1dHRvbnNJbmZvLm1pZENvbHVtbi5leGl0RnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5taWRDb2x1bW4uY2xvc2VDb2x1bW4gPSBudWxsO1xuXHRcdFx0b1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm8uZW5kQ29sdW1uLmV4aXRGdWxsU2NyZWVuID0gbnVsbDtcblx0XHRcdG9VSVN0YXRlLmFjdGlvbkJ1dHRvbnNJbmZvLmVuZENvbHVtbi5mdWxsU2NyZWVuID0gbnVsbDtcblx0XHRcdG9VSVN0YXRlLmFjdGlvbkJ1dHRvbnNJbmZvLmVuZENvbHVtbi5jbG9zZUNvbHVtbiA9IG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZpZXdDb2x1bW4gPSBvRmNsQ29sTmFtZVtGQ0xMZXZlbF07XG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0RkNMTGV2ZWwgPj0gdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQgfHxcblx0XHRcdHNMYXlvdXQgPT09IFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiIHx8XG5cdFx0XHRzTGF5b3V0ID09PSBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIiB8fFxuXHRcdFx0c0xheW91dCA9PT0gXCJPbmVDb2x1bW5cIlxuXHRcdCkge1xuXHRcdFx0b1ZpZXcuZ2V0TW9kZWwoXCJmY2xoZWxwZXJcIikuc2V0UHJvcGVydHkoXCIvYnJlYWRDcnVtYklzVmlzaWJsZVwiLCB0cnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1ZpZXcuZ2V0TW9kZWwoXCJmY2xoZWxwZXJcIikuc2V0UHJvcGVydHkoXCIvYnJlYWRDcnVtYklzVmlzaWJsZVwiLCBmYWxzZSk7XG5cdFx0fVxuXHRcdC8vIFVuZm9ydHVuYXRlbHksIHRoZSBGQ0xIZWxwZXIgZG9lc24ndCBwcm92aWRlIGFjdGlvbkJ1dHRvbiB2YWx1ZXMgZm9yIHRoZSBmaXJzdCBjb2x1bW5cblx0XHQvLyBzbyB3ZSBoYXZlIHRvIGFkZCB0aGlzIGluZm8gbWFudWFsbHlcblx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5iZWdpbkNvbHVtbiA9IHsgZnVsbFNjcmVlbjogbnVsbCwgZXhpdEZ1bGxTY3JlZW46IG51bGwsIGNsb3NlQ29sdW1uOiBudWxsIH07XG5cblx0XHRjb25zdCBvQWN0aW9uQnV0dG9uSW5mb3MgPSBPYmplY3QuYXNzaWduKHt9LCBvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mb1t2aWV3Q29sdW1uXSk7XG5cdFx0b0FjdGlvbkJ1dHRvbkluZm9zLnN3aXRjaFZpc2libGUgPSBvQWN0aW9uQnV0dG9uSW5mb3MuZnVsbFNjcmVlbiAhPT0gbnVsbCB8fCBvQWN0aW9uQnV0dG9uSW5mb3MuZXhpdEZ1bGxTY3JlZW4gIT09IG51bGw7XG5cdFx0b0FjdGlvbkJ1dHRvbkluZm9zLnN3aXRjaEljb24gPSBvQWN0aW9uQnV0dG9uSW5mb3MuZnVsbFNjcmVlbiAhPT0gbnVsbCA/IFwic2FwLWljb246Ly9mdWxsLXNjcmVlblwiIDogXCJzYXAtaWNvbjovL2V4aXQtZnVsbC1zY3JlZW5cIjtcblx0XHRvQWN0aW9uQnV0dG9uSW5mb3MuaXNGdWxsU2NyZWVuID0gb0FjdGlvbkJ1dHRvbkluZm9zLmZ1bGxTY3JlZW4gPT09IG51bGw7XG5cdFx0b0FjdGlvbkJ1dHRvbkluZm9zLmNsb3NlVmlzaWJsZSA9IG9BY3Rpb25CdXR0b25JbmZvcy5jbG9zZUNvbHVtbiAhPT0gbnVsbDtcblxuXHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL2FjdGlvbkJ1dHRvbnNJbmZvXCIsIG9BY3Rpb25CdXR0b25JbmZvcyk7XG5cblx0XHRvVmlldy5nZXRNb2RlbChcImZjbGhlbHBlclwiKS5zZXRQcm9wZXJ0eShcIi9zaG93RWRpdEJ1dHRvblwiLCB0aGlzLl91cGRhdGVFZGl0QnV0dG9uVmlzaWJsaXR5KHZpZXdDb2x1bW4sIHNMYXlvdXQpKTtcblxuXHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL3Nob3dTaGFyZUljb25cIiwgdGhpcy5fdXBkYXRlU2hhcmVCdXR0b25WaXNpYmlsaXR5KHZpZXdDb2x1bW4sIHNMYXlvdXQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgYnkgdGhlIHJvdXRlciBCZWZvcmVSb3V0ZU1hdGNoZWQgZXZlbnQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI29uQmVmb3JlUm91dGVNYXRjaGVkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqL1xuXHRvbkJlZm9yZVJvdXRlTWF0Y2hlZChvRXZlbnQ6IGFueSkge1xuXHRcdGlmIChvRXZlbnQpIHtcblx0XHRcdGNvbnN0IG9RdWVyeVBhcmFtcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkuYXJndW1lbnRzW3RoaXMuU1FVRVJZS0VZTkFNRV07XG5cdFx0XHRsZXQgc0xheW91dCA9IG9RdWVyeVBhcmFtcyA/IG9RdWVyeVBhcmFtcy5sYXlvdXQgOiBudWxsO1xuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBsYXlvdXQgcGFyYW1ldGVyLCBxdWVyeSBmb3IgdGhlIGRlZmF1bHQgbGV2ZWwgMCBsYXlvdXQgKG5vcm1hbGx5IE9uZUNvbHVtbilcblx0XHRcdGlmICghc0xheW91dCkge1xuXHRcdFx0XHRjb25zdCBvTmV4dFVJU3RhdGUgPSB0aGlzLmdldEhlbHBlcigpLmdldE5leHRVSVN0YXRlKDApO1xuXHRcdFx0XHRzTGF5b3V0ID0gb05leHRVSVN0YXRlLmxheW91dDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGxheW91dCBpZiBjb21wYXRpYmxlIHdpdGggdGhlIG51bWJlciBvZiB0YXJnZXRzXG5cdFx0XHQvLyBUaGlzIHNob3VsZCBhbHdheXMgYmUgdGhlIGNhc2UgZm9yIG5vcm1hbCBuYXZpZ2F0aW9uLCBqdXN0IG5lZWRlZCBpbiBjYXNlXG5cdFx0XHQvLyB0aGUgVVJMIGhhcyBiZWVuIG1hbnVhbGx5IG1vZGlmaWVkXG5cdFx0XHRjb25zdCBhVGFyZ2V0cyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb25maWdcIikudGFyZ2V0O1xuXHRcdFx0c0xheW91dCA9IHRoaXMuX2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzKHNMYXlvdXQsIGFUYXJnZXRzKTtcblxuXHRcdFx0Ly8gVXBkYXRlIHRoZSBsYXlvdXQgb2YgdGhlIEZsZXhpYmxlQ29sdW1uTGF5b3V0XG5cdFx0XHRpZiAoc0xheW91dCkge1xuXHRcdFx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5zZXRMYXlvdXQoc0xheW91dCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciBmb3IgdGhlIEZDTCBDb21wb25lbnQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI2dldEhlbHBlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgSW5zdGFuY2Ugb2YgYSBzZW1hbnRpYyBoZWxwZXJcblx0ICovXG5cdGdldEhlbHBlcigpIHtcblx0XHRyZXR1cm4gRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlci5nZXRJbnN0YW5jZUZvcih0aGlzLmdldEZjbENvbnRyb2woKSwgdGhpcy5fb0ZDTENvbmZpZyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlcyB0aGUgRkNMIGxheW91dCBmb3IgYSBnaXZlbiBGQ0wgbGV2ZWwgYW5kIGEgdGFyZ2V0IGhhc2guXG5cdCAqXG5cdCAqIEBwYXJhbSBpTmV4dEZDTExldmVsIEZDTCBsZXZlbCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoIHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gc1Byb3Bvc2VkTGF5b3V0IFRoZSBwcm9wb3NlZCBsYXlvdXRcblx0ICogQHBhcmFtIGtlZXBDdXJyZW50TGF5b3V0IFRydWUgaWYgd2Ugd2FudCB0byBrZWVwIHRoZSBjdXJyZW50IGxheW91dCBpZiBwb3NzaWJsZVxuXHQgKiBAcmV0dXJucyBUaGUgY2FsY3VsYXRlZCBsYXlvdXRcblx0ICovXG5cdGNhbGN1bGF0ZUxheW91dChpTmV4dEZDTExldmVsOiBudW1iZXIsIHNIYXNoOiBzdHJpbmcsIHNQcm9wb3NlZExheW91dDogc3RyaW5nIHwgdW5kZWZpbmVkLCBrZWVwQ3VycmVudExheW91dCA9IGZhbHNlKSB7XG5cdFx0Ly8gRmlyc3QsIGFzayB0aGUgRkNMIGhlbHBlciB0byBjYWxjdWxhdGUgdGhlIGxheW91dCBpZiBub3RoaW5nIGlzIHByb3Bvc2VkXG5cdFx0aWYgKCFzUHJvcG9zZWRMYXlvdXQpIHtcblx0XHRcdHNQcm9wb3NlZExheW91dCA9IGtlZXBDdXJyZW50TGF5b3V0ID8gdGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0TGF5b3V0KCkgOiB0aGlzLmdldEhlbHBlcigpLmdldE5leHRVSVN0YXRlKGlOZXh0RkNMTGV2ZWwpLmxheW91dDtcblx0XHR9XG5cblx0XHQvLyBUaGVuIGNoYW5nZSB0aGlzIHZhbHVlIGlmIG5lY2Vzc2FyeSwgYmFzZWQgb24gdGhlIG51bWJlciBvZiB0YXJnZXRzXG5cdFx0Y29uc3Qgb1JvdXRlID0gKHRoaXMuZ2V0Um91dGVyKCkgYXMgYW55KS5nZXRSb3V0ZUJ5SGFzaChgJHtzSGFzaH0/bGF5b3V0PSR7c1Byb3Bvc2VkTGF5b3V0fWApO1xuXHRcdGNvbnN0IGFUYXJnZXRzID0gdGhpcy5fb1RhcmdldHNGcm9tUm91dGVQYXR0ZXJuW29Sb3V0ZS5nZXRQYXR0ZXJuKCldO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzKHNQcm9wb3NlZExheW91dCwgYVRhcmdldHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gRkNMIGxheW91dCBpcyBjb21wYXRpYmxlIHdpdGggYW4gYXJyYXkgb2YgdGFyZ2V0cy5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wb3NlZExheW91dCBQcm9wb3NlZCB2YWx1ZSBmb3IgdGhlIEZDTCBsYXlvdXRcblx0ICogQHBhcmFtIGFUYXJnZXRzIEFycmF5IG9mIHRhcmdldCBuYW1lcyB1c2VkIGZvciBjaGVja2luZ1xuXHQgKiBAcmV0dXJucyBUaGUgY29ycmVjdGVkIGxheW91dFxuXHQgKi9cblx0X2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzKHNQcm9wb3NlZExheW91dDogYW55LCBhVGFyZ2V0czogYW55KSB7XG5cdFx0Y29uc3QgYWxsQWxsb3dlZExheW91dHM6IGFueSA9IHtcblx0XHRcdFwiMlwiOiBbXCJUd29Db2x1bW5zTWlkRXhwYW5kZWRcIiwgXCJUd29Db2x1bW5zQmVnaW5FeHBhbmRlZFwiLCBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIl0sXG5cdFx0XHRcIjNcIjogW1xuXHRcdFx0XHRcIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkXCIsXG5cdFx0XHRcdFwiVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWRcIixcblx0XHRcdFx0XCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZEVuZEhpZGRlblwiLFxuXHRcdFx0XHRcIlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW5cIixcblx0XHRcdFx0XCJNaWRDb2x1bW5GdWxsU2NyZWVuXCIsXG5cdFx0XHRcdFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiXG5cdFx0XHRdXG5cdFx0fTtcblxuXHRcdGlmIChhVGFyZ2V0cyAmJiAhQXJyYXkuaXNBcnJheShhVGFyZ2V0cykpIHtcblx0XHRcdC8vIFRvIHN1cHBvcnQgc2luZ2xlIHRhcmdldCBhcyBhIHN0cmluZyBpbiB0aGUgbWFuaWZlc3Rcblx0XHRcdGFUYXJnZXRzID0gW2FUYXJnZXRzXTtcblx0XHR9XG5cblx0XHRpZiAoIWFUYXJnZXRzKSB7XG5cdFx0XHQvLyBEZWZlbnNpdmUsIGp1c3QgaW4gY2FzZS4uLlxuXHRcdFx0cmV0dXJuIHNQcm9wb3NlZExheW91dDtcblx0XHR9IGVsc2UgaWYgKGFUYXJnZXRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIE1vcmUgdGhhbiAxIHRhcmdldDoganVzdCBzaW1wbHkgY2hlY2sgZnJvbSB0aGUgYWxsb3dlZCB2YWx1ZXNcblx0XHRcdGNvbnN0IGFMYXlvdXRzID0gYWxsQWxsb3dlZExheW91dHNbYVRhcmdldHMubGVuZ3RoXTtcblx0XHRcdGlmIChhTGF5b3V0cy5pbmRleE9mKHNQcm9wb3NlZExheW91dCkgPCAwKSB7XG5cdFx0XHRcdC8vIFRoZSBwcm9wb3NlZCBsYXlvdXQgaXNuJ3QgY29tcGF0aWJsZSB3aXRoIHRoZSBudW1iZXIgb2YgY29sdW1uc1xuXHRcdFx0XHQvLyAtLT4gQXNrIHRoZSBoZWxwZXIgZm9yIHRoZSBkZWZhdWx0IGxheW91dCBmb3IgdGhlIG51bWJlciBvZiBjb2x1bW5zXG5cdFx0XHRcdHNQcm9wb3NlZExheW91dCA9IGFMYXlvdXRzWzBdO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPbmx5IG9uZSB0YXJnZXRcblx0XHRcdGNvbnN0IHNUYXJnZXRBZ2dyZWdhdGlvbiA9IHRoaXMuZ2V0VGFyZ2V0QWdncmVnYXRpb24oKVthVGFyZ2V0c1swXV0uYWdncmVnYXRpb24gfHwgdGhpcy5fb0ZDTENvbmZpZy5kZWZhdWx0Q29udHJvbEFnZ3JlZ2F0aW9uO1xuXHRcdFx0c3dpdGNoIChzVGFyZ2V0QWdncmVnYXRpb24pIHtcblx0XHRcdFx0Y2FzZSBcImJlZ2luQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRzUHJvcG9zZWRMYXlvdXQgPSBcIk9uZUNvbHVtblwiO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwibWlkQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRzUHJvcG9zZWRMYXlvdXQgPSBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcImVuZENvbHVtblBhZ2VzXCI6XG5cdFx0XHRcdFx0c1Byb3Bvc2VkTGF5b3V0ID0gXCJFbmRDb2x1bW5GdWxsU2NyZWVuXCI7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8vIG5vIGRlZmF1bHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gc1Byb3Bvc2VkTGF5b3V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGluc3RhbmNlZCB2aWV3cyBpbiB0aGUgRkNMIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMge0FycmF5fSBSZXR1cm4gdGhlIHZpZXdzLlxuXHQgKi9cblx0Z2V0SW5zdGFuY2VkVmlld3MoKTogWE1MVmlld1tdIHtcblx0XHRjb25zdCBmY2xDb250cm9sID0gdGhpcy5nZXRGY2xDb250cm9sKCk7XG5cdFx0Y29uc3QgY29tcG9uZW50Q29udGFpbmVyczogQ29udHJvbFtdID0gW1xuXHRcdFx0Li4uZmNsQ29udHJvbC5nZXRCZWdpbkNvbHVtblBhZ2VzKCksXG5cdFx0XHQuLi5mY2xDb250cm9sLmdldE1pZENvbHVtblBhZ2VzKCksXG5cdFx0XHQuLi5mY2xDb250cm9sLmdldEVuZENvbHVtblBhZ2VzKClcblx0XHRdO1xuXHRcdHJldHVybiBjb21wb25lbnRDb250YWluZXJzLm1hcCgob1BhZ2UpID0+IChvUGFnZSBhcyBhbnkpLmdldENvbXBvbmVudEluc3RhbmNlKCkuZ2V0Um9vdENvbnRyb2woKSk7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGFsbCB2aXNpYmxlIHZpZXdzIGluIHRoZSBGQ0wgY29tcG9uZW50LlxuXHQgKiBzTGF5b3V0IG9wdGlvbmFsIHBhcmFtZXRlciBpcyB2ZXJ5IHNwZWNpZmljIGFzIHBhcnQgb2YgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSBsYXRlc3QgbmF2aWdhdGVkIHJvd1xuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHNMYXlvdXQgTGF5b3V0IHRoYXQgd2FzIGFwcGxpZWQganVzdCBiZWZvcmUgdGhlIGN1cnJlbnQgbmF2aWdhdGlvblxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IHJldHVybiB2aWV3c1xuXHQgKi9cblxuXHRfZ2V0QWxsVmlzaWJsZVZpZXdzKHNMYXlvdXQ/OiBhbnkpIHtcblx0XHRjb25zdCBhVmlld3MgPSBbXTtcblx0XHRzTGF5b3V0ID0gc0xheW91dCA/IHNMYXlvdXQgOiB0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKTtcblx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5FbmRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5NaWRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5PbmVDb2x1bW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5UaHJlZUNvbHVtbnNFbmRFeHBhbmRlZDpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5UaHJlZUNvbHVtbnNNaWRFeHBhbmRlZDpcblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRFbmRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc01pZEV4cGFuZGVkOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc01pZEV4cGFuZGVkRW5kSGlkZGVuOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRMb2cuZXJyb3IoYFVuaGFuZGxlZCBzd2l0Y2ggY2FzZSBmb3IgJHt0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKX1gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYVZpZXdzO1xuXHR9XG5cblx0X2dldEFsbFZpZXdzKHNMYXlvdXQ/OiBhbnkpIHtcblx0XHRjb25zdCBhVmlld3MgPSBbXTtcblx0XHRzTGF5b3V0ID0gc0xheW91dCA/IHNMYXlvdXQgOiB0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKTtcblx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5PbmVDb2x1bW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRFbmRIaWRkZW46XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zQmVnaW5FeHBhbmRlZEVuZEhpZGRlbjpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5FbmRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5Ud29Db2x1bW5zQmVnaW5FeHBhbmRlZDpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5Ud29Db2x1bW5zTWlkRXhwYW5kZWQ6XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExheW91dFR5cGUuTWlkQ29sdW1uRnVsbFNjcmVlbjpcblx0XHRcdFx0Ly8gSW4gdGhpcyBjYXNlIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgbWlkIGNvbHVtbiBmdWxsc2NyZWVuIGNvbWVzIGZyb20gYSAyIG9yIGEgMyBjb2x1bW4gbGF5b3V0XG5cdFx0XHRcdGNvbnN0IHNMYXlvdXRXaGVuRXhpdEZ1bGxTY3JlZW4gPSAodGhpcy5nZXRIZWxwZXIoKS5nZXRDdXJyZW50VUlTdGF0ZSgpIGFzIGFueSkuYWN0aW9uQnV0dG9uc0luZm8ubWlkQ29sdW1uLmV4aXRGdWxsU2NyZWVuO1xuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc0xheW91dFdoZW5FeGl0RnVsbFNjcmVlbi5pbmRleE9mKFwiVGhyZWVDb2x1bW5cIikgPj0gMCkge1xuXHRcdFx0XHRcdC8vIFdlIGNvbWUgZnJvbSBhIDMgY29sdW1uIGxheW91dFxuXHRcdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0TG9nLmVycm9yKGBVbmhhbmRsZWQgc3dpdGNoIGNhc2UgZm9yICR7dGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0TGF5b3V0KCl9YCk7XG5cdFx0fVxuXHRcdHJldHVybiBhVmlld3M7XG5cdH1cblxuXHRvbkNvbnRhaW5lclJlYWR5KCkge1xuXHRcdC8vIFJlc3RvcmUgdmlld3MgaWYgbmVjY2Vzc2FyeS5cblx0XHRjb25zdCBhVmlld3MgPSB0aGlzLl9nZXRBbGxWaXNpYmxlVmlld3MoKTtcblx0XHRjb25zdCBhUmVzdG9yZVByb21pc2VzOiBhbnlbXSA9IGFWaWV3cy5yZWR1Y2UoZnVuY3Rpb24gKGFQcm9taXNlczogYW55LCBvVGFyZ2V0VmlldzogYW55KSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChLZWVwQWxpdmVIZWxwZXIucmVzdG9yZVZpZXcob1RhcmdldFZpZXcpKTtcblx0XHRcdHJldHVybiBhUHJvbWlzZXM7XG5cdFx0fSwgW10pO1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChhUmVzdG9yZVByb21pc2VzKTtcblx0fVxuXG5cdGdldFJpZ2h0bW9zdENvbnRleHQoKTogQ29udGV4dCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFJpZ2h0bW9zdFZpZXcoKTtcblx0XHRyZXR1cm4gb1ZpZXcgJiYgb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0fVxuXG5cdGdldFJpZ2h0bW9zdFZpZXcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldEFsbFZpZXdzKCkucG9wKCk7XG5cdH1cblxuXHRpc0NvbnRleHRVc2VkSW5QYWdlcyhvQ29udGV4dDogQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRcdGlmICghdGhpcy5nZXRGY2xDb250cm9sKCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgYUFsbFZpc2libGVWaWV3cyA9IHRoaXMuX2dldEFsbFZpZXdzKCk7XG5cdFx0Zm9yIChjb25zdCB2aWV3IG9mIGFBbGxWaXNpYmxlVmlld3MpIHtcblx0XHRcdGlmICh2aWV3KSB7XG5cdFx0XHRcdGlmICh2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgPT09IG9Db250ZXh0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEEgdmlldyBoYXMgYmVlbiBkZXN0cm95ZWQgLS0+IGFwcCBpcyBjdXJyZW50bHkgYmVpbmcgZGVzdHJveWVkXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0X3NldFNoZWxsTWVudVRpdGxlKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgc1RpdGxlOiBzdHJpbmcsIHNBcHBUaXRsZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuZ2V0SGVscGVyKCkuZ2V0Q3VycmVudFVJU3RhdGUoKS5pc0Z1bGxTY3JlZW4gIT09IHRydWUpIHtcblx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldFRpdGxlKHNBcHBUaXRsZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldFRpdGxlKHNUaXRsZSk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZjbENvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFB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