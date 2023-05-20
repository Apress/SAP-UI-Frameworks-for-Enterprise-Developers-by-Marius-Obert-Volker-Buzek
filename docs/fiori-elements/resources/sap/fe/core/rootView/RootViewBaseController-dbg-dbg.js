/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/BaseController", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/SizeHelper", "sap/ui/base/BindingParser", "sap/ui/core/routing/HashChanger", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, BaseController, CommonUtils, Placeholder, ViewState, ClassSupport, SizeHelper, BindingParser, HashChanger, JSONModel, AnnotationHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RootViewBaseController = (_dec = defineUI5Class("sap.fe.core.rootView.RootViewBaseController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(ViewState), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(RootViewBaseController, _BaseController);
    function RootViewBaseController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "oPlaceholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor2, _assertThisInitialized(_this));
      _this.bIsComputingTitleHierachy = false;
      return _this;
    }
    var _proto = RootViewBaseController.prototype;
    _proto.onInit = function onInit() {
      SizeHelper.init();
      this._aHelperModels = [];
    };
    _proto.getPlaceholder = function getPlaceholder() {
      return this.oPlaceholder;
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.oPlaceholder.attachRouteMatchers();
      this.getAppComponent().getRoutingService().attachAfterRouteMatched(this._onAfterRouteMatched, this);
    };
    _proto.onExit = function onExit() {
      this.getAppComponent().getRoutingService().detachAfterRouteMatched(this._onAfterRouteMatched, this);
      this.oRouter = undefined;
      SizeHelper.exit();

      // Destroy all JSON models created dynamically for the views
      this._aHelperModels.forEach(function (oModel) {
        oModel.destroy();
      });
    }

    /**
     * Convenience method for getting the resource bundle.
     *
     * @public
     * @returns The resourceModel of the component
     */;
    _proto.getResourceBundle = function getResourceBundle() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    };
    _proto.getRouter = function getRouter() {
      if (!this.oRouter) {
        this.oRouter = this.getAppComponent().getRouter();
      }
      return this.oRouter;
    };
    _proto._createHelperModel = function _createHelperModel() {
      // We keep a reference on the models created dynamically, as they don't get destroyed
      // automatically when the view is destroyed.
      // This is done during onExit
      const oModel = new JSONModel();
      this._aHelperModels.push(oModel);
      return oModel;
    }

    /**
     * Function waiting for the Right most view to be ready.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oEvent Reference an Event parameter coming from routeMatched event
     * @returns A promise indicating when the right most view is ready
     */;
    _proto.waitForRightMostViewReady = function waitForRightMostViewReady(oEvent) {
      return new Promise(function (resolve) {
        const aContainers = oEvent.getParameter("views"),
          // There can also be reuse components in the view, remove them before processing.
          aFEContainers = [];
        aContainers.forEach(function (oContainer) {
          let oView = oContainer;
          if (oContainer && oContainer.getComponentInstance) {
            const oComponentInstance = oContainer.getComponentInstance();
            oView = oComponentInstance.getRootControl();
          }
          if (oView && oView.getController() && oView.getController().pageReady) {
            aFEContainers.push(oView);
          }
        });
        const oRightMostFEView = aFEContainers[aFEContainers.length - 1];
        if (oRightMostFEView && oRightMostFEView.getController().pageReady.isPageReady()) {
          resolve(oRightMostFEView);
        } else if (oRightMostFEView) {
          oRightMostFEView.getController().pageReady.attachEventOnce("pageReady", function () {
            resolve(oRightMostFEView);
          });
        }
      });
    }

    /**
     * Callback when the navigation is done.
     *  - update the shell title.
     *  - update table scroll.
     *  - call onPageReady on the rightMostView.
     *
     * @param oEvent
     * @name sap.fe.core.rootView.BaseController#_onAfterRouteMatched
     * @memberof sap.fe.core.rootView.BaseController
     */;
    _proto._onAfterRouteMatched = function _onAfterRouteMatched(oEvent) {
      if (!this._oRouteMatchedPromise) {
        this._oRouteMatchedPromise = this.waitForRightMostViewReady(oEvent).then(oView => {
          // The autoFocus is initially disabled on the navContainer or the FCL, so that the focus stays on the Shell menu
          // even if the app takes a long time to launch
          // The first time the view is displayed, we need to enable the autofocus so that it's managed properly during navigation
          const oRootControl = this.getView().getContent()[0];
          if (oRootControl && oRootControl.getAutoFocus && !oRootControl.getAutoFocus()) {
            oRootControl.setProperty("autoFocus", true, true); // Do not mark the container as invalid, otherwise it's re-rendered
          }

          const oAppComponent = this.getAppComponent();
          this._scrollTablesToLastNavigatedItems();
          if (oAppComponent.getEnvironmentCapabilities().getCapabilities().UShell) {
            this._computeTitleHierarchy(oView);
          }
          const bForceFocus = oAppComponent.getRouterProxy().isFocusForced();
          oAppComponent.getRouterProxy().setFocusForced(false); // reset
          if (oView.getController() && oView.getController().onPageReady && oView.getParent().onPageReady) {
            oView.getParent().onPageReady({
              forceFocus: bForceFocus
            });
          }
          if (!bForceFocus) {
            // Try to restore the focus on where it was when we last visited the current hash
            oAppComponent.getRouterProxy().restoreFocusForCurrentHash();
          }
          if (this.onContainerReady) {
            this.onContainerReady();
          }
        }).catch(function (oError) {
          Log.error("An error occurs while computing the title hierarchy and calling focus method", oError);
        }).finally(() => {
          this._oRouteMatchedPromise = null;
        });
      }
    }

    /**
     * This function returns the TitleHierarchy cache ( or initializes it if undefined).
     *
     * @name sap.fe.core.rootView.BaseController#_getTitleHierarchyCache
     * @memberof sap.fe.core.rootView.BaseController
     * @returns  The TitleHierarchy cache
     */;
    _proto._getTitleHierarchyCache = function _getTitleHierarchyCache() {
      if (!this.oTitleHierarchyCache) {
        this.oTitleHierarchyCache = {};
      }
      return this.oTitleHierarchyCache;
    }

    /**
     * This function returns a titleInfo object.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param title The application's title
     * @param subtitle The application's subTitle
     * @param sIntent The intent path to be redirected to
     * @param icon The application's icon
     * @returns The title information
     */;
    _proto._computeTitleInfo = function _computeTitleInfo(title, subtitle, sIntent) {
      let icon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
      const aParts = sIntent.split("/");
      if (aParts[aParts.length - 1].indexOf("?") === -1) {
        sIntent += "?restoreHistory=true";
      } else {
        sIntent += "&restoreHistory=true";
      }
      return {
        title: title,
        subtitle: subtitle,
        intent: sIntent,
        icon: icon
      };
    };
    _proto._formatTitle = function _formatTitle(displayMode, titleValue, titleDescription) {
      let formattedTitle = "";
      switch (displayMode) {
        case "Value":
          formattedTitle = `${titleValue}`;
          break;
        case "ValueDescription":
          formattedTitle = `${titleValue} (${titleDescription})`;
          break;
        case "DescriptionValue":
          formattedTitle = `${titleDescription} (${titleValue})`;
          break;
        case "Description":
          formattedTitle = `${titleDescription}`;
          break;
        default:
      }
      return formattedTitle;
    }

    /**
     * Fetches the value of the HeaderInfo title for a given path.
     *
     * @param sPath The path to the entity
     * @returns A promise containing the formatted title, or an empty string if no HeaderInfo title annotation is available
     */;
    _proto._fetchTitleValue = async function _fetchTitleValue(sPath) {
      const oAppComponent = this.getAppComponent(),
        oModel = this.getView().getModel(),
        oMetaModel = oAppComponent.getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sPath),
        oBindingViewContext = oModel.createBindingContext(sPath),
        sValueExpression = AnnotationHelper.format(oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value`), {
          context: oMetaModel.createBindingContext("/")
        });
      if (!sValueExpression) {
        return Promise.resolve("");
      }
      const sTextExpression = AnnotationHelper.format(oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@com.sap.vocabularies.Common.v1.Text`), {
          context: oMetaModel.createBindingContext("/")
        }),
        oPropertyContext = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@`),
        aPromises = [],
        oValueExpression = BindingParser.complexParser(sValueExpression),
        oPromiseForDisplayMode = new Promise(function (resolve) {
          const displayMode = CommonUtils.computeDisplayMode(oPropertyContext);
          resolve(displayMode);
        });
      aPromises.push(oPromiseForDisplayMode);
      const sValuePath = oValueExpression.parts ? oValueExpression.parts[0].path : oValueExpression.path,
        fnValueFormatter = oValueExpression.formatter,
        oValueBinding = oModel.bindProperty(sValuePath, oBindingViewContext);
      oValueBinding.initialize();
      const oPromiseForTitleValue = new Promise(function (resolve) {
        const fnChange = function (oEvent) {
          const sTargetValue = fnValueFormatter ? fnValueFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
          oValueBinding.detachChange(fnChange);
          resolve(sTargetValue);
        };
        oValueBinding.attachChange(fnChange);
      });
      aPromises.push(oPromiseForTitleValue);
      if (sTextExpression) {
        const oTextExpression = BindingParser.complexParser(sTextExpression);
        let sTextPath = oTextExpression.parts ? oTextExpression.parts[0].path : oTextExpression.path;
        sTextPath = sValuePath.lastIndexOf("/") > -1 ? `${sValuePath.slice(0, sValuePath.lastIndexOf("/"))}/${sTextPath}` : sTextPath;
        const fnTextFormatter = oTextExpression.formatter,
          oTextBinding = oModel.bindProperty(sTextPath, oBindingViewContext);
        oTextBinding.initialize();
        const oPromiseForTitleText = new Promise(function (resolve) {
          const fnChange = function (oEvent) {
            const sTargetText = fnTextFormatter ? fnTextFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
            oTextBinding.detachChange(fnChange);
            resolve(sTargetText);
          };
          oTextBinding.attachChange(fnChange);
        });
        aPromises.push(oPromiseForTitleText);
      }
      try {
        const titleInfo = await Promise.all(aPromises);
        let formattedTitle = "";
        if (typeof titleInfo !== "string") {
          formattedTitle = this._formatTitle(titleInfo[0], titleInfo[1], titleInfo[2]);
        }
        return formattedTitle;
      } catch (error) {
        Log.error("Error while fetching the title from the header info :" + error);
      }
      return "";
    };
    _proto._getAppSpecificHash = function _getAppSpecificHash() {
      // HashChanged isShellNavigationHashChanger
      const hashChanger = HashChanger.getInstance();
      return "hrefForAppSpecificHash" in hashChanger ? hashChanger.hrefForAppSpecificHash("") : "#/";
    };
    _proto._getHash = function _getHash() {
      return HashChanger.getInstance().getHash();
    }

    /**
     * This function returns titleInformation from a path.
     * It updates the cache to store title information if necessary
     *
     * @name sap.fe.core.rootView.BaseController#getTitleInfoFromPath
     * @memberof sap.fe.core.rootView.BaseController
     * @param {*} sPath path of the context to retrieve title information from MetaModel
     * @returns {Promise}  oTitleinformation returned as promise
     */;
    _proto.getTitleInfoFromPath = function getTitleInfoFromPath(sPath) {
      const oTitleHierarchyCache = this._getTitleHierarchyCache();
      if (oTitleHierarchyCache[sPath]) {
        // The title info is already stored in the cache
        return Promise.resolve(oTitleHierarchyCache[sPath]);
      }
      const oMetaModel = this.getAppComponent().getMetaModel();
      const sEntityPath = oMetaModel.getMetaPath(sPath);
      const sTypeName = oMetaModel.getObject(`${sEntityPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName`);
      const sAppSpecificHash = this._getAppSpecificHash();
      const sIntent = sAppSpecificHash + sPath.slice(1);
      return this._fetchTitleValue(sPath).then(sTitle => {
        const oTitleInfo = this._computeTitleInfo(sTypeName, sTitle, sIntent);
        oTitleHierarchyCache[sPath] = oTitleInfo;
        return oTitleInfo;
      });
    }

    /**
     * Ensure that the ushell service receives all elements
     * (title, subtitle, intent, icon) as strings.
     *
     * Annotation HeaderInfo allows for binding of title and description
     * (which are used here as title and subtitle) to any element in the entity
     * (being possibly types like boolean, timestamp, double, etc.)
     *
     * Creates a new hierarchy and converts non-string types to string.
     *
     * @param aHierarchy Shell title hierarchy
     * @returns Copy of shell title hierarchy containing all elements as strings
     */;
    _proto._ensureHierarchyElementsAreStrings = function _ensureHierarchyElementsAreStrings(aHierarchy) {
      const aHierarchyShell = [];
      for (const level in aHierarchy) {
        const oHierarchy = aHierarchy[level];
        const oShellHierarchy = {};
        for (const key in oHierarchy) {
          oShellHierarchy[key] = typeof oHierarchy[key] !== "string" ? String(oHierarchy[key]) : oHierarchy[key];
        }
        aHierarchyShell.push(oShellHierarchy);
      }
      return aHierarchyShell;
    };
    _proto._getTargetTypeFromHash = function _getTargetTypeFromHash(sHash) {
      var _oAppComponent$getMan;
      const oAppComponent = this.getAppComponent();
      let sTargetType = "";
      const aRoutes = ((_oAppComponent$getMan = oAppComponent.getManifestEntry("sap.ui5").routing) === null || _oAppComponent$getMan === void 0 ? void 0 : _oAppComponent$getMan.routes) ?? [];
      for (const route of aRoutes) {
        const oRoute = oAppComponent.getRouter().getRoute(route.name);
        if (oRoute !== null && oRoute !== void 0 && oRoute.match(sHash)) {
          const sTarget = Array.isArray(route.target) ? route.target[0] : route.target;
          sTargetType = oAppComponent.getRouter().getTarget(sTarget)._oOptions.name;
          break;
        }
      }
      return sTargetType;
    }

    /**
     * This function updates the shell title after each navigation.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oView The current view
     * @returns A Promise that is resolved when the menu is filled properly
     */;
    _proto._computeTitleHierarchy = function _computeTitleHierarchy(oView) {
      const oAppComponent = this.getAppComponent(),
        oContext = oView.getBindingContext(),
        oCurrentPage = oView.getParent(),
        aTitleInformationPromises = [],
        sAppSpecificHash = this._getAppSpecificHash(),
        manifestAppSettings = oAppComponent.getManifestEntry("sap.app"),
        sAppTitle = manifestAppSettings.title || "",
        sAppSubTitle = manifestAppSettings.subTitle || "",
        appIcon = manifestAppSettings.icon || "";
      let oPageTitleInformation, sNewPath;
      if (oCurrentPage && oCurrentPage._getPageTitleInformation) {
        if (oContext) {
          // If the first page of the application is a LR, use the title and subtitle from the manifest
          if (this._getTargetTypeFromHash("") === "sap.fe.templates.ListReport") {
            aTitleInformationPromises.push(Promise.resolve(this._computeTitleInfo(sAppTitle, sAppSubTitle, sAppSpecificHash, appIcon)));
          }

          // Then manage other pages
          sNewPath = oContext.getPath();
          const aPathParts = sNewPath.split("/");
          let sPath = "";
          aPathParts.shift(); // Remove the first segment (empty string) as it has been managed above
          aPathParts.pop(); // Remove the last segment as it corresponds to the current page and shouldn't appear in the menu

          aPathParts.forEach(sPathPart => {
            sPath += `/${sPathPart}`;
            const oMetaModel = oAppComponent.getMetaModel(),
              sParameterPath = oMetaModel.getMetaPath(sPath),
              bIsParameterized = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
            if (!bIsParameterized) {
              aTitleInformationPromises.push(this.getTitleInfoFromPath(sPath));
            }
          });
        }

        // Current page
        oPageTitleInformation = oCurrentPage._getPageTitleInformation();
        oPageTitleInformation = this._computeTitleInfo(oPageTitleInformation.title, oPageTitleInformation.subtitle, sAppSpecificHash + this._getHash());
        if (oContext) {
          this._getTitleHierarchyCache()[sNewPath] = oPageTitleInformation;
        } else {
          this._getTitleHierarchyCache()[sAppSpecificHash] = oPageTitleInformation;
        }
      } else {
        aTitleInformationPromises.push(Promise.reject("Title information missing in HeaderInfo"));
      }
      return Promise.all(aTitleInformationPromises).then(aTitleInfoHierarchy => {
        // workaround for shell which is expecting all elements being of type string
        const aTitleInfoHierarchyShell = this._ensureHierarchyElementsAreStrings(aTitleInfoHierarchy),
          sTitle = oPageTitleInformation.title;
        aTitleInfoHierarchyShell.reverse();
        oAppComponent.getShellServices().setHierarchy(aTitleInfoHierarchyShell);
        this._setShellMenuTitle(oAppComponent, sTitle, sAppTitle);
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      }).finally(() => {
        this.bIsComputingTitleHierachy = false;
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      let keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      return null;
    }

    /**
     * Callback after a view has been bound to a context.
     *
     * @param oContext The context that has been bound to a view
     */;
    _proto.onContextBoundToView = function onContextBoundToView(oContext) {
      if (oContext) {
        const sDeepestPath = this.getView().getModel("internal").getProperty("/deepestPath"),
          sViewContextPath = oContext.getPath();
        if (!sDeepestPath || sDeepestPath.indexOf(sViewContextPath) !== 0) {
          // There was no previous value for the deepest reached path, or the path
          // for the view isn't a subpath of the previous deepest path --> update
          this.getView().getModel("internal").setProperty("/deepestPath", sViewContextPath, undefined, true);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      // To be overridden
      return Promise.resolve(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      // To be overriden
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.getInstancedViews = function getInstancedViews() {
      return [];
      // To be overriden
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // To be overriden
    };
    _proto.isFclEnabled = function isFclEnabled() {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._setShellMenuTitle = function _setShellMenuTitle(oAppComponent, sTitle, sAppTitle) {
      // To be overriden by FclController
      oAppComponent.getShellServices().setTitle(sTitle);
    };
    _proto.getAppContentContainer = function getAppContentContainer() {
      var _oAppComponent$getMan2, _oAppComponent$getMan3;
      const oAppComponent = this.getAppComponent();
      const appContentId = ((_oAppComponent$getMan2 = oAppComponent.getManifestEntry("sap.ui5").routing) === null || _oAppComponent$getMan2 === void 0 ? void 0 : (_oAppComponent$getMan3 = _oAppComponent$getMan2.config) === null || _oAppComponent$getMan3 === void 0 ? void 0 : _oAppComponent$getMan3.controlId) ?? "appContent";
      return this.getView().byId(appContentId);
    };
    return RootViewBaseController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "oPlaceholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return RootViewBaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlBsYWNlaG9sZGVyIiwiVmlld1N0YXRlIiwiYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSIsIm9uSW5pdCIsIlNpemVIZWxwZXIiLCJpbml0IiwiX2FIZWxwZXJNb2RlbHMiLCJnZXRQbGFjZWhvbGRlciIsIm9QbGFjZWhvbGRlciIsImF0dGFjaFJvdXRlTWF0Y2hlcnMiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRSb3V0aW5nU2VydmljZSIsImF0dGFjaEFmdGVyUm91dGVNYXRjaGVkIiwiX29uQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJvbkV4aXQiLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsIm9Sb3V0ZXIiLCJ1bmRlZmluZWQiLCJleGl0IiwiZm9yRWFjaCIsIm9Nb2RlbCIsImRlc3Ryb3kiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsImdldE93bmVyQ29tcG9uZW50IiwiZ2V0TW9kZWwiLCJnZXRSb3V0ZXIiLCJfY3JlYXRlSGVscGVyTW9kZWwiLCJKU09OTW9kZWwiLCJwdXNoIiwid2FpdEZvclJpZ2h0TW9zdFZpZXdSZWFkeSIsIm9FdmVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwiYUNvbnRhaW5lcnMiLCJnZXRQYXJhbWV0ZXIiLCJhRkVDb250YWluZXJzIiwib0NvbnRhaW5lciIsIm9WaWV3IiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJvQ29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJwYWdlUmVhZHkiLCJvUmlnaHRNb3N0RkVWaWV3IiwibGVuZ3RoIiwiaXNQYWdlUmVhZHkiLCJhdHRhY2hFdmVudE9uY2UiLCJfb1JvdXRlTWF0Y2hlZFByb21pc2UiLCJ0aGVuIiwib1Jvb3RDb250cm9sIiwiZ2V0VmlldyIsImdldENvbnRlbnQiLCJnZXRBdXRvRm9jdXMiLCJzZXRQcm9wZXJ0eSIsIm9BcHBDb21wb25lbnQiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJnZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcyIsImdldENhcGFiaWxpdGllcyIsIlVTaGVsbCIsIl9jb21wdXRlVGl0bGVIaWVyYXJjaHkiLCJiRm9yY2VGb2N1cyIsImdldFJvdXRlclByb3h5IiwiaXNGb2N1c0ZvcmNlZCIsInNldEZvY3VzRm9yY2VkIiwib25QYWdlUmVhZHkiLCJnZXRQYXJlbnQiLCJmb3JjZUZvY3VzIiwicmVzdG9yZUZvY3VzRm9yQ3VycmVudEhhc2giLCJvbkNvbnRhaW5lclJlYWR5IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImZpbmFsbHkiLCJfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSIsIm9UaXRsZUhpZXJhcmNoeUNhY2hlIiwiX2NvbXB1dGVUaXRsZUluZm8iLCJ0aXRsZSIsInN1YnRpdGxlIiwic0ludGVudCIsImljb24iLCJhUGFydHMiLCJzcGxpdCIsImluZGV4T2YiLCJpbnRlbnQiLCJfZm9ybWF0VGl0bGUiLCJkaXNwbGF5TW9kZSIsInRpdGxlVmFsdWUiLCJ0aXRsZURlc2NyaXB0aW9uIiwiZm9ybWF0dGVkVGl0bGUiLCJfZmV0Y2hUaXRsZVZhbHVlIiwic1BhdGgiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJvQmluZGluZ1ZpZXdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJzVmFsdWVFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsImZvcm1hdCIsImdldE9iamVjdCIsImNvbnRleHQiLCJzVGV4dEV4cHJlc3Npb24iLCJvUHJvcGVydHlDb250ZXh0IiwiYVByb21pc2VzIiwib1ZhbHVlRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwib1Byb21pc2VGb3JEaXNwbGF5TW9kZSIsIkNvbW1vblV0aWxzIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwic1ZhbHVlUGF0aCIsInBhcnRzIiwicGF0aCIsImZuVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXR0ZXIiLCJvVmFsdWVCaW5kaW5nIiwiYmluZFByb3BlcnR5IiwiaW5pdGlhbGl6ZSIsIm9Qcm9taXNlRm9yVGl0bGVWYWx1ZSIsImZuQ2hhbmdlIiwic1RhcmdldFZhbHVlIiwiZ2V0U291cmNlIiwiZ2V0VmFsdWUiLCJkZXRhY2hDaGFuZ2UiLCJhdHRhY2hDaGFuZ2UiLCJvVGV4dEV4cHJlc3Npb24iLCJzVGV4dFBhdGgiLCJsYXN0SW5kZXhPZiIsInNsaWNlIiwiZm5UZXh0Rm9ybWF0dGVyIiwib1RleHRCaW5kaW5nIiwib1Byb21pc2VGb3JUaXRsZVRleHQiLCJzVGFyZ2V0VGV4dCIsInRpdGxlSW5mbyIsImFsbCIsIl9nZXRBcHBTcGVjaWZpY0hhc2giLCJoYXNoQ2hhbmdlciIsIkhhc2hDaGFuZ2VyIiwiZ2V0SW5zdGFuY2UiLCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoIiwiX2dldEhhc2giLCJnZXRIYXNoIiwiZ2V0VGl0bGVJbmZvRnJvbVBhdGgiLCJzRW50aXR5UGF0aCIsInNUeXBlTmFtZSIsInNBcHBTcGVjaWZpY0hhc2giLCJzVGl0bGUiLCJvVGl0bGVJbmZvIiwiX2Vuc3VyZUhpZXJhcmNoeUVsZW1lbnRzQXJlU3RyaW5ncyIsImFIaWVyYXJjaHkiLCJhSGllcmFyY2h5U2hlbGwiLCJsZXZlbCIsIm9IaWVyYXJjaHkiLCJvU2hlbGxIaWVyYXJjaHkiLCJrZXkiLCJTdHJpbmciLCJfZ2V0VGFyZ2V0VHlwZUZyb21IYXNoIiwic0hhc2giLCJzVGFyZ2V0VHlwZSIsImFSb3V0ZXMiLCJnZXRNYW5pZmVzdEVudHJ5Iiwicm91dGluZyIsInJvdXRlcyIsInJvdXRlIiwib1JvdXRlIiwiZ2V0Um91dGUiLCJuYW1lIiwibWF0Y2giLCJzVGFyZ2V0IiwiQXJyYXkiLCJpc0FycmF5IiwidGFyZ2V0IiwiZ2V0VGFyZ2V0IiwiX29PcHRpb25zIiwib0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9DdXJyZW50UGFnZSIsImFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMiLCJtYW5pZmVzdEFwcFNldHRpbmdzIiwic0FwcFRpdGxlIiwic0FwcFN1YlRpdGxlIiwic3ViVGl0bGUiLCJhcHBJY29uIiwib1BhZ2VUaXRsZUluZm9ybWF0aW9uIiwic05ld1BhdGgiLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJnZXRQYXRoIiwiYVBhdGhQYXJ0cyIsInNoaWZ0IiwicG9wIiwic1BhdGhQYXJ0Iiwic1BhcmFtZXRlclBhdGgiLCJiSXNQYXJhbWV0ZXJpemVkIiwicmVqZWN0IiwiYVRpdGxlSW5mb0hpZXJhcmNoeSIsImFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbCIsInJldmVyc2UiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0SGllcmFyY2h5IiwiX3NldFNoZWxsTWVudVRpdGxlIiwic0Vycm9yTWVzc2FnZSIsImNhbGN1bGF0ZUxheW91dCIsImlOZXh0RkNMTGV2ZWwiLCJzUHJvcG9zZWRMYXlvdXQiLCJrZWVwQ3VycmVudExheW91dCIsIm9uQ29udGV4dEJvdW5kVG9WaWV3Iiwic0RlZXBlc3RQYXRoIiwiZ2V0UHJvcGVydHkiLCJzVmlld0NvbnRleHRQYXRoIiwiZGlzcGxheUVycm9yUGFnZSIsIm1QYXJhbWV0ZXJzIiwidXBkYXRlVUlTdGF0ZUZvclZpZXciLCJGQ0xMZXZlbCIsImdldEluc3RhbmNlZFZpZXdzIiwiaXNGY2xFbmFibGVkIiwic2V0VGl0bGUiLCJnZXRBcHBDb250ZW50Q29udGFpbmVyIiwiYXBwQ29udGVudElkIiwiY29uZmlnIiwiY29udHJvbElkIiwiYnlJZCIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCB1c2luZ0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2l6ZUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgRmNsQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvcm9vdFZpZXcvRmNsLmNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIE5hdkNvbnRhaW5lciBmcm9tIFwic2FwL20vTmF2Q29udGFpbmVyXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IHR5cGUgWE1MVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1hNTFZpZXdcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9yZXNvdXJjZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcIi4uL0FwcENvbXBvbmVudFwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5yb290Vmlldy5Sb290Vmlld0Jhc2VDb250cm9sbGVyXCIpXG5jbGFzcyBSb290Vmlld0Jhc2VDb250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oUGxhY2Vob2xkZXIpXG5cdG9QbGFjZWhvbGRlciE6IFBsYWNlaG9sZGVyO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihWaWV3U3RhdGUpXG5cdHZpZXdTdGF0ZSE6IFZpZXdTdGF0ZTtcblxuXHRwcml2YXRlIF9hSGVscGVyTW9kZWxzITogYW55W107XG5cblx0cHJpdmF0ZSBvUm91dGVyPzogUm91dGVyO1xuXG5cdHByaXZhdGUgX29Sb3V0ZU1hdGNoZWRQcm9taXNlOiBhbnk7XG5cblx0cHJpdmF0ZSBvVGl0bGVIaWVyYXJjaHlDYWNoZTogYW55O1xuXG5cdHByaXZhdGUgYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSA9IGZhbHNlO1xuXG5cdG9uSW5pdCgpIHtcblx0XHRTaXplSGVscGVyLmluaXQoKTtcblxuXHRcdHRoaXMuX2FIZWxwZXJNb2RlbHMgPSBbXTtcblx0fVxuXG5cdGdldFBsYWNlaG9sZGVyKCkge1xuXHRcdHJldHVybiB0aGlzLm9QbGFjZWhvbGRlcjtcblx0fVxuXG5cdGF0dGFjaFJvdXRlTWF0Y2hlcnMoKSB7XG5cdFx0dGhpcy5vUGxhY2Vob2xkZXIuYXR0YWNoUm91dGVNYXRjaGVycygpO1xuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5hdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCh0aGlzLl9vbkFmdGVyUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0fVxuXG5cdG9uRXhpdCgpIHtcblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRpbmdTZXJ2aWNlKCkuZGV0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQodGhpcy5fb25BZnRlclJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5vUm91dGVyID0gdW5kZWZpbmVkO1xuXG5cdFx0U2l6ZUhlbHBlci5leGl0KCk7XG5cblx0XHQvLyBEZXN0cm95IGFsbCBKU09OIG1vZGVscyBjcmVhdGVkIGR5bmFtaWNhbGx5IGZvciB0aGUgdmlld3Ncblx0XHR0aGlzLl9hSGVscGVyTW9kZWxzLmZvckVhY2goZnVuY3Rpb24gKG9Nb2RlbDogYW55KSB7XG5cdFx0XHRvTW9kZWwuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlbmllbmNlIG1ldGhvZCBmb3IgZ2V0dGluZyB0aGUgcmVzb3VyY2UgYnVuZGxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEByZXR1cm5zIFRoZSByZXNvdXJjZU1vZGVsIG9mIHRoZSBjb21wb25lbnRcblx0ICovXG5cdGdldFJlc291cmNlQnVuZGxlKCkge1xuXHRcdHJldHVybiAodGhpcy5nZXRPd25lckNvbXBvbmVudCgpLmdldE1vZGVsKFwiaTE4blwiKSBhcyBSZXNvdXJjZU1vZGVsKS5nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHR9XG5cblx0Z2V0Um91dGVyKCkge1xuXHRcdGlmICghdGhpcy5vUm91dGVyKSB7XG5cdFx0XHR0aGlzLm9Sb3V0ZXIgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRlcigpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm9Sb3V0ZXI7XG5cdH1cblxuXHRfY3JlYXRlSGVscGVyTW9kZWwoKSB7XG5cdFx0Ly8gV2Uga2VlcCBhIHJlZmVyZW5jZSBvbiB0aGUgbW9kZWxzIGNyZWF0ZWQgZHluYW1pY2FsbHksIGFzIHRoZXkgZG9uJ3QgZ2V0IGRlc3Ryb3llZFxuXHRcdC8vIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGUgdmlldyBpcyBkZXN0cm95ZWQuXG5cdFx0Ly8gVGhpcyBpcyBkb25lIGR1cmluZyBvbkV4aXRcblx0XHRjb25zdCBvTW9kZWwgPSBuZXcgSlNPTk1vZGVsKCk7XG5cdFx0dGhpcy5fYUhlbHBlck1vZGVscy5wdXNoKG9Nb2RlbCk7XG5cblx0XHRyZXR1cm4gb01vZGVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHdhaXRpbmcgZm9yIHRoZSBSaWdodCBtb3N0IHZpZXcgdG8gYmUgcmVhZHkuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gb0V2ZW50IFJlZmVyZW5jZSBhbiBFdmVudCBwYXJhbWV0ZXIgY29taW5nIGZyb20gcm91dGVNYXRjaGVkIGV2ZW50XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBpbmRpY2F0aW5nIHdoZW4gdGhlIHJpZ2h0IG1vc3QgdmlldyBpcyByZWFkeVxuXHQgKi9cblx0d2FpdEZvclJpZ2h0TW9zdFZpZXdSZWFkeShvRXZlbnQ6IGFueSkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGNvbnN0IGFDb250YWluZXJzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInZpZXdzXCIpLFxuXHRcdFx0XHQvLyBUaGVyZSBjYW4gYWxzbyBiZSByZXVzZSBjb21wb25lbnRzIGluIHRoZSB2aWV3LCByZW1vdmUgdGhlbSBiZWZvcmUgcHJvY2Vzc2luZy5cblx0XHRcdFx0YUZFQ29udGFpbmVyczogYW55W10gPSBbXTtcblx0XHRcdGFDb250YWluZXJzLmZvckVhY2goZnVuY3Rpb24gKG9Db250YWluZXI6IGFueSkge1xuXHRcdFx0XHRsZXQgb1ZpZXcgPSBvQ29udGFpbmVyO1xuXHRcdFx0XHRpZiAob0NvbnRhaW5lciAmJiBvQ29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbXBvbmVudEluc3RhbmNlID0gb0NvbnRhaW5lci5nZXRDb21wb25lbnRJbnN0YW5jZSgpO1xuXHRcdFx0XHRcdG9WaWV3ID0gb0NvbXBvbmVudEluc3RhbmNlLmdldFJvb3RDb250cm9sKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9WaWV3ICYmIG9WaWV3LmdldENvbnRyb2xsZXIoKSAmJiBvVmlldy5nZXRDb250cm9sbGVyKCkucGFnZVJlYWR5KSB7XG5cdFx0XHRcdFx0YUZFQ29udGFpbmVycy5wdXNoKG9WaWV3KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBvUmlnaHRNb3N0RkVWaWV3ID0gYUZFQ29udGFpbmVyc1thRkVDb250YWluZXJzLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKG9SaWdodE1vc3RGRVZpZXcgJiYgb1JpZ2h0TW9zdEZFVmlldy5nZXRDb250cm9sbGVyKCkucGFnZVJlYWR5LmlzUGFnZVJlYWR5KCkpIHtcblx0XHRcdFx0cmVzb2x2ZShvUmlnaHRNb3N0RkVWaWV3KTtcblx0XHRcdH0gZWxzZSBpZiAob1JpZ2h0TW9zdEZFVmlldykge1xuXHRcdFx0XHRvUmlnaHRNb3N0RkVWaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkuYXR0YWNoRXZlbnRPbmNlKFwicGFnZVJlYWR5XCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXNvbHZlKG9SaWdodE1vc3RGRVZpZXcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayB3aGVuIHRoZSBuYXZpZ2F0aW9uIGlzIGRvbmUuXG5cdCAqICAtIHVwZGF0ZSB0aGUgc2hlbGwgdGl0bGUuXG5cdCAqICAtIHVwZGF0ZSB0YWJsZSBzY3JvbGwuXG5cdCAqICAtIGNhbGwgb25QYWdlUmVhZHkgb24gdGhlIHJpZ2h0TW9zdFZpZXcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXIjX29uQWZ0ZXJSb3V0ZU1hdGNoZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqL1xuXHRfb25BZnRlclJvdXRlTWF0Y2hlZChvRXZlbnQ6IGFueSkge1xuXHRcdGlmICghdGhpcy5fb1JvdXRlTWF0Y2hlZFByb21pc2UpIHtcblx0XHRcdHRoaXMuX29Sb3V0ZU1hdGNoZWRQcm9taXNlID0gdGhpcy53YWl0Rm9yUmlnaHRNb3N0Vmlld1JlYWR5KG9FdmVudClcblx0XHRcdFx0LnRoZW4oKG9WaWV3OiBhbnkpID0+IHtcblx0XHRcdFx0XHQvLyBUaGUgYXV0b0ZvY3VzIGlzIGluaXRpYWxseSBkaXNhYmxlZCBvbiB0aGUgbmF2Q29udGFpbmVyIG9yIHRoZSBGQ0wsIHNvIHRoYXQgdGhlIGZvY3VzIHN0YXlzIG9uIHRoZSBTaGVsbCBtZW51XG5cdFx0XHRcdFx0Ly8gZXZlbiBpZiB0aGUgYXBwIHRha2VzIGEgbG9uZyB0aW1lIHRvIGxhdW5jaFxuXHRcdFx0XHRcdC8vIFRoZSBmaXJzdCB0aW1lIHRoZSB2aWV3IGlzIGRpc3BsYXllZCwgd2UgbmVlZCB0byBlbmFibGUgdGhlIGF1dG9mb2N1cyBzbyB0aGF0IGl0J3MgbWFuYWdlZCBwcm9wZXJseSBkdXJpbmcgbmF2aWdhdGlvblxuXHRcdFx0XHRcdGNvbnN0IG9Sb290Q29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmdldENvbnRlbnQoKVswXSBhcyBhbnk7XG5cdFx0XHRcdFx0aWYgKG9Sb290Q29udHJvbCAmJiBvUm9vdENvbnRyb2wuZ2V0QXV0b0ZvY3VzICYmICFvUm9vdENvbnRyb2wuZ2V0QXV0b0ZvY3VzKCkpIHtcblx0XHRcdFx0XHRcdG9Sb290Q29udHJvbC5zZXRQcm9wZXJ0eShcImF1dG9Gb2N1c1wiLCB0cnVlLCB0cnVlKTsgLy8gRG8gbm90IG1hcmsgdGhlIGNvbnRhaW5lciBhcyBpbnZhbGlkLCBvdGhlcndpc2UgaXQncyByZS1yZW5kZXJlZFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdFx0XHRcdHRoaXMuX3Njcm9sbFRhYmxlc1RvTGFzdE5hdmlnYXRlZEl0ZW1zKCk7XG5cdFx0XHRcdFx0aWYgKG9BcHBDb21wb25lbnQuZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKS5nZXRDYXBhYmlsaXRpZXMoKS5VU2hlbGwpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2NvbXB1dGVUaXRsZUhpZXJhcmNoeShvVmlldyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGJGb3JjZUZvY3VzID0gb0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmlzRm9jdXNGb3JjZWQoKTtcblx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuc2V0Rm9jdXNGb3JjZWQoZmFsc2UpOyAvLyByZXNldFxuXHRcdFx0XHRcdGlmIChvVmlldy5nZXRDb250cm9sbGVyKCkgJiYgb1ZpZXcuZ2V0Q29udHJvbGxlcigpLm9uUGFnZVJlYWR5ICYmIG9WaWV3LmdldFBhcmVudCgpLm9uUGFnZVJlYWR5KSB7XG5cdFx0XHRcdFx0XHRvVmlldy5nZXRQYXJlbnQoKS5vblBhZ2VSZWFkeSh7IGZvcmNlRm9jdXM6IGJGb3JjZUZvY3VzIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIWJGb3JjZUZvY3VzKSB7XG5cdFx0XHRcdFx0XHQvLyBUcnkgdG8gcmVzdG9yZSB0aGUgZm9jdXMgb24gd2hlcmUgaXQgd2FzIHdoZW4gd2UgbGFzdCB2aXNpdGVkIHRoZSBjdXJyZW50IGhhc2hcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5yZXN0b3JlRm9jdXNGb3JDdXJyZW50SGFzaCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGhpcy5vbkNvbnRhaW5lclJlYWR5KSB7XG5cdFx0XHRcdFx0XHR0aGlzLm9uQ29udGFpbmVyUmVhZHkoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJBbiBlcnJvciBvY2N1cnMgd2hpbGUgY29tcHV0aW5nIHRoZSB0aXRsZSBoaWVyYXJjaHkgYW5kIGNhbGxpbmcgZm9jdXMgbWV0aG9kXCIsIG9FcnJvcik7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9vUm91dGVNYXRjaGVkUHJvbWlzZSA9IG51bGw7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIFRpdGxlSGllcmFyY2h5IGNhY2hlICggb3IgaW5pdGlhbGl6ZXMgaXQgaWYgdW5kZWZpbmVkKS5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXIjX2dldFRpdGxlSGllcmFyY2h5Q2FjaGVcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqIEByZXR1cm5zICBUaGUgVGl0bGVIaWVyYXJjaHkgY2FjaGVcblx0ICovXG5cdF9nZXRUaXRsZUhpZXJhcmNoeUNhY2hlKCkge1xuXHRcdGlmICghdGhpcy5vVGl0bGVIaWVyYXJjaHlDYWNoZSkge1xuXHRcdFx0dGhpcy5vVGl0bGVIaWVyYXJjaHlDYWNoZSA9IHt9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5vVGl0bGVIaWVyYXJjaHlDYWNoZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSB0aXRsZUluZm8gb2JqZWN0LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICogQHBhcmFtIHRpdGxlIFRoZSBhcHBsaWNhdGlvbidzIHRpdGxlXG5cdCAqIEBwYXJhbSBzdWJ0aXRsZSBUaGUgYXBwbGljYXRpb24ncyBzdWJUaXRsZVxuXHQgKiBAcGFyYW0gc0ludGVudCBUaGUgaW50ZW50IHBhdGggdG8gYmUgcmVkaXJlY3RlZCB0b1xuXHQgKiBAcGFyYW0gaWNvbiBUaGUgYXBwbGljYXRpb24ncyBpY29uXG5cdCAqIEByZXR1cm5zIFRoZSB0aXRsZSBpbmZvcm1hdGlvblxuXHQgKi9cblx0X2NvbXB1dGVUaXRsZUluZm8odGl0bGU6IGFueSwgc3VidGl0bGU6IGFueSwgc0ludGVudDogYW55LCBpY29uID0gXCJcIikge1xuXHRcdGNvbnN0IGFQYXJ0cyA9IHNJbnRlbnQuc3BsaXQoXCIvXCIpO1xuXHRcdGlmIChhUGFydHNbYVBhcnRzLmxlbmd0aCAtIDFdLmluZGV4T2YoXCI/XCIpID09PSAtMSkge1xuXHRcdFx0c0ludGVudCArPSBcIj9yZXN0b3JlSGlzdG9yeT10cnVlXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNJbnRlbnQgKz0gXCImcmVzdG9yZUhpc3Rvcnk9dHJ1ZVwiO1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0c3VidGl0bGU6IHN1YnRpdGxlLFxuXHRcdFx0aW50ZW50OiBzSW50ZW50LFxuXHRcdFx0aWNvbjogaWNvblxuXHRcdH07XG5cdH1cblxuXHRfZm9ybWF0VGl0bGUoZGlzcGxheU1vZGU6IHN0cmluZywgdGl0bGVWYWx1ZTogc3RyaW5nLCB0aXRsZURlc2NyaXB0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBmb3JtYXR0ZWRUaXRsZSA9IFwiXCI7XG5cdFx0c3dpdGNoIChkaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVWYWx1ZX1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVWYWx1ZX0gKCR7dGl0bGVEZXNjcmlwdGlvbn0pYDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRmb3JtYXR0ZWRUaXRsZSA9IGAke3RpdGxlRGVzY3JpcHRpb259ICgke3RpdGxlVmFsdWV9KWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVEZXNjcmlwdGlvbn1gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0fVxuXHRcdHJldHVybiBmb3JtYXR0ZWRUaXRsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGZXRjaGVzIHRoZSB2YWx1ZSBvZiB0aGUgSGVhZGVySW5mbyB0aXRsZSBmb3IgYSBnaXZlbiBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggdG8gdGhlIGVudGl0eVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgY29udGFpbmluZyB0aGUgZm9ybWF0dGVkIHRpdGxlLCBvciBhbiBlbXB0eSBzdHJpbmcgaWYgbm8gSGVhZGVySW5mbyB0aXRsZSBhbm5vdGF0aW9uIGlzIGF2YWlsYWJsZVxuXHQgKi9cblx0YXN5bmMgX2ZldGNoVGl0bGVWYWx1ZShzUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRvTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKSxcblx0XHRcdG9CaW5kaW5nVmlld0NvbnRleHQgPSBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpLFxuXHRcdFx0c1ZhbHVlRXhwcmVzc2lvbiA9IEFubm90YXRpb25IZWxwZXIuZm9ybWF0KFxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1RpdGxlL1ZhbHVlYCksXG5cdFx0XHRcdHsgY29udGV4dDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgfVxuXHRcdFx0KTtcblx0XHRpZiAoIXNWYWx1ZUV4cHJlc3Npb24pIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoXCJcIik7XG5cdFx0fVxuXHRcdGNvbnN0IHNUZXh0RXhwcmVzc2lvbiA9IEFubm90YXRpb25IZWxwZXIuZm9ybWF0KFxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdFx0XHRgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1RpdGxlL1ZhbHVlLyRQYXRoQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0YFxuXHRcdFx0XHQpLFxuXHRcdFx0XHR7IGNvbnRleHQ6IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIH1cblx0XHRcdCksXG5cdFx0XHRvUHJvcGVydHlDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGVhZGVySW5mby9UaXRsZS9WYWx1ZS8kUGF0aEBgKSxcblx0XHRcdGFQcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW10sXG5cdFx0XHRvVmFsdWVFeHByZXNzaW9uID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKHNWYWx1ZUV4cHJlc3Npb24pLFxuXHRcdFx0b1Byb21pc2VGb3JEaXNwbGF5TW9kZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvUHJvcGVydHlDb250ZXh0KTtcblx0XHRcdFx0cmVzb2x2ZShkaXNwbGF5TW9kZSk7XG5cdFx0XHR9KTtcblx0XHRhUHJvbWlzZXMucHVzaChvUHJvbWlzZUZvckRpc3BsYXlNb2RlKTtcblx0XHRjb25zdCBzVmFsdWVQYXRoID0gb1ZhbHVlRXhwcmVzc2lvbi5wYXJ0cyA/IG9WYWx1ZUV4cHJlc3Npb24ucGFydHNbMF0ucGF0aCA6IG9WYWx1ZUV4cHJlc3Npb24ucGF0aCxcblx0XHRcdGZuVmFsdWVGb3JtYXR0ZXIgPSBvVmFsdWVFeHByZXNzaW9uLmZvcm1hdHRlcixcblx0XHRcdG9WYWx1ZUJpbmRpbmcgPSBvTW9kZWwuYmluZFByb3BlcnR5KHNWYWx1ZVBhdGgsIG9CaW5kaW5nVmlld0NvbnRleHQpO1xuXHRcdG9WYWx1ZUJpbmRpbmcuaW5pdGlhbGl6ZSgpO1xuXHRcdGNvbnN0IG9Qcm9taXNlRm9yVGl0bGVWYWx1ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3QgZm5DaGFuZ2UgPSBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1RhcmdldFZhbHVlID0gZm5WYWx1ZUZvcm1hdHRlciA/IGZuVmFsdWVGb3JtYXR0ZXIob0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCkpIDogb0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCk7XG5cblx0XHRcdFx0b1ZhbHVlQmluZGluZy5kZXRhY2hDaGFuZ2UoZm5DaGFuZ2UpO1xuXHRcdFx0XHRyZXNvbHZlKHNUYXJnZXRWYWx1ZSk7XG5cdFx0XHR9O1xuXHRcdFx0b1ZhbHVlQmluZGluZy5hdHRhY2hDaGFuZ2UoZm5DaGFuZ2UpO1xuXHRcdH0pO1xuXHRcdGFQcm9taXNlcy5wdXNoKG9Qcm9taXNlRm9yVGl0bGVWYWx1ZSk7XG5cblx0XHRpZiAoc1RleHRFeHByZXNzaW9uKSB7XG5cdFx0XHRjb25zdCBvVGV4dEV4cHJlc3Npb24gPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc1RleHRFeHByZXNzaW9uKTtcblx0XHRcdGxldCBzVGV4dFBhdGggPSBvVGV4dEV4cHJlc3Npb24ucGFydHMgPyBvVGV4dEV4cHJlc3Npb24ucGFydHNbMF0ucGF0aCA6IG9UZXh0RXhwcmVzc2lvbi5wYXRoO1xuXHRcdFx0c1RleHRQYXRoID0gc1ZhbHVlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPiAtMSA/IGAke3NWYWx1ZVBhdGguc2xpY2UoMCwgc1ZhbHVlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikpfS8ke3NUZXh0UGF0aH1gIDogc1RleHRQYXRoO1xuXG5cdFx0XHRjb25zdCBmblRleHRGb3JtYXR0ZXIgPSBvVGV4dEV4cHJlc3Npb24uZm9ybWF0dGVyLFxuXHRcdFx0XHRvVGV4dEJpbmRpbmcgPSBvTW9kZWwuYmluZFByb3BlcnR5KHNUZXh0UGF0aCwgb0JpbmRpbmdWaWV3Q29udGV4dCk7XG5cdFx0XHRvVGV4dEJpbmRpbmcuaW5pdGlhbGl6ZSgpO1xuXHRcdFx0Y29uc3Qgb1Byb21pc2VGb3JUaXRsZVRleHQgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKGRlc2NyaXB0aW9uOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdFx0Y29uc3QgZm5DaGFuZ2UgPSBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzVGFyZ2V0VGV4dCA9IGZuVGV4dEZvcm1hdHRlciA/IGZuVGV4dEZvcm1hdHRlcihvRXZlbnQuZ2V0U291cmNlKCkuZ2V0VmFsdWUoKSkgOiBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0VmFsdWUoKTtcblxuXHRcdFx0XHRcdG9UZXh0QmluZGluZy5kZXRhY2hDaGFuZ2UoZm5DaGFuZ2UpO1xuXHRcdFx0XHRcdHJlc29sdmUoc1RhcmdldFRleHQpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdG9UZXh0QmluZGluZy5hdHRhY2hDaGFuZ2UoZm5DaGFuZ2UpO1xuXHRcdFx0fSk7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChvUHJvbWlzZUZvclRpdGxlVGV4dCk7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCB0aXRsZUluZm86IGFueVtdID0gYXdhaXQgUHJvbWlzZS5hbGwoYVByb21pc2VzKTtcblx0XHRcdGxldCBmb3JtYXR0ZWRUaXRsZSA9IFwiXCI7XG5cdFx0XHRpZiAodHlwZW9mIHRpdGxlSW5mbyAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRmb3JtYXR0ZWRUaXRsZSA9IHRoaXMuX2Zvcm1hdFRpdGxlKHRpdGxlSW5mb1swXSwgdGl0bGVJbmZvWzFdLCB0aXRsZUluZm9bMl0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZvcm1hdHRlZFRpdGxlO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGZldGNoaW5nIHRoZSB0aXRsZSBmcm9tIHRoZSBoZWFkZXIgaW5mbyA6XCIgKyBlcnJvcik7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0X2dldEFwcFNwZWNpZmljSGFzaCgpIHtcblx0XHQvLyBIYXNoQ2hhbmdlZCBpc1NoZWxsTmF2aWdhdGlvbkhhc2hDaGFuZ2VyXG5cdFx0Y29uc3QgaGFzaENoYW5nZXIgPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIEhhc2hDaGFuZ2VyIHwgKEhhc2hDaGFuZ2VyICYgeyBocmVmRm9yQXBwU3BlY2lmaWNIYXNoOiBGdW5jdGlvbiB9KTtcblx0XHRyZXR1cm4gXCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoXCIgaW4gaGFzaENoYW5nZXIgPyBoYXNoQ2hhbmdlci5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpIDogXCIjL1wiO1xuXHR9XG5cblx0X2dldEhhc2goKSB7XG5cdFx0cmV0dXJuIEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aXRsZUluZm9ybWF0aW9uIGZyb20gYSBwYXRoLlxuXHQgKiBJdCB1cGRhdGVzIHRoZSBjYWNoZSB0byBzdG9yZSB0aXRsZSBpbmZvcm1hdGlvbiBpZiBuZWNlc3Nhcnlcblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXIjZ2V0VGl0bGVJbmZvRnJvbVBhdGhcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqIEBwYXJhbSB7Kn0gc1BhdGggcGF0aCBvZiB0aGUgY29udGV4dCB0byByZXRyaWV2ZSB0aXRsZSBpbmZvcm1hdGlvbiBmcm9tIE1ldGFNb2RlbFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gIG9UaXRsZWluZm9ybWF0aW9uIHJldHVybmVkIGFzIHByb21pc2Vcblx0ICovXG5cblx0Z2V0VGl0bGVJbmZvRnJvbVBhdGgoc1BhdGg6IGFueSkge1xuXHRcdGNvbnN0IG9UaXRsZUhpZXJhcmNoeUNhY2hlID0gdGhpcy5fZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSgpO1xuXG5cdFx0aWYgKG9UaXRsZUhpZXJhcmNoeUNhY2hlW3NQYXRoXSkge1xuXHRcdFx0Ly8gVGhlIHRpdGxlIGluZm8gaXMgYWxyZWFkeSBzdG9yZWQgaW4gdGhlIGNhY2hlXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9UaXRsZUhpZXJhcmNoeUNhY2hlW3NQYXRoXSk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRjb25zdCBzVHlwZU5hbWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVHlwZU5hbWVgKTtcblx0XHRjb25zdCBzQXBwU3BlY2lmaWNIYXNoID0gdGhpcy5fZ2V0QXBwU3BlY2lmaWNIYXNoKCk7XG5cdFx0Y29uc3Qgc0ludGVudCA9IHNBcHBTcGVjaWZpY0hhc2ggKyBzUGF0aC5zbGljZSgxKTtcblx0XHRyZXR1cm4gdGhpcy5fZmV0Y2hUaXRsZVZhbHVlKHNQYXRoKS50aGVuKChzVGl0bGU6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgb1RpdGxlSW5mbyA9IHRoaXMuX2NvbXB1dGVUaXRsZUluZm8oc1R5cGVOYW1lLCBzVGl0bGUsIHNJbnRlbnQpO1xuXHRcdFx0b1RpdGxlSGllcmFyY2h5Q2FjaGVbc1BhdGhdID0gb1RpdGxlSW5mbztcblx0XHRcdHJldHVybiBvVGl0bGVJbmZvO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuc3VyZSB0aGF0IHRoZSB1c2hlbGwgc2VydmljZSByZWNlaXZlcyBhbGwgZWxlbWVudHNcblx0ICogKHRpdGxlLCBzdWJ0aXRsZSwgaW50ZW50LCBpY29uKSBhcyBzdHJpbmdzLlxuXHQgKlxuXHQgKiBBbm5vdGF0aW9uIEhlYWRlckluZm8gYWxsb3dzIGZvciBiaW5kaW5nIG9mIHRpdGxlIGFuZCBkZXNjcmlwdGlvblxuXHQgKiAod2hpY2ggYXJlIHVzZWQgaGVyZSBhcyB0aXRsZSBhbmQgc3VidGl0bGUpIHRvIGFueSBlbGVtZW50IGluIHRoZSBlbnRpdHlcblx0ICogKGJlaW5nIHBvc3NpYmx5IHR5cGVzIGxpa2UgYm9vbGVhbiwgdGltZXN0YW1wLCBkb3VibGUsIGV0Yy4pXG5cdCAqXG5cdCAqIENyZWF0ZXMgYSBuZXcgaGllcmFyY2h5IGFuZCBjb252ZXJ0cyBub24tc3RyaW5nIHR5cGVzIHRvIHN0cmluZy5cblx0ICpcblx0ICogQHBhcmFtIGFIaWVyYXJjaHkgU2hlbGwgdGl0bGUgaGllcmFyY2h5XG5cdCAqIEByZXR1cm5zIENvcHkgb2Ygc2hlbGwgdGl0bGUgaGllcmFyY2h5IGNvbnRhaW5pbmcgYWxsIGVsZW1lbnRzIGFzIHN0cmluZ3Ncblx0ICovXG5cdF9lbnN1cmVIaWVyYXJjaHlFbGVtZW50c0FyZVN0cmluZ3MoYUhpZXJhcmNoeTogYW55KSB7XG5cdFx0Y29uc3QgYUhpZXJhcmNoeVNoZWxsID0gW107XG5cdFx0Zm9yIChjb25zdCBsZXZlbCBpbiBhSGllcmFyY2h5KSB7XG5cdFx0XHRjb25zdCBvSGllcmFyY2h5ID0gYUhpZXJhcmNoeVtsZXZlbF07XG5cdFx0XHRjb25zdCBvU2hlbGxIaWVyYXJjaHk6IGFueSA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gb0hpZXJhcmNoeSkge1xuXHRcdFx0XHRvU2hlbGxIaWVyYXJjaHlba2V5XSA9IHR5cGVvZiBvSGllcmFyY2h5W2tleV0gIT09IFwic3RyaW5nXCIgPyBTdHJpbmcob0hpZXJhcmNoeVtrZXldKSA6IG9IaWVyYXJjaHlba2V5XTtcblx0XHRcdH1cblx0XHRcdGFIaWVyYXJjaHlTaGVsbC5wdXNoKG9TaGVsbEhpZXJhcmNoeSk7XG5cdFx0fVxuXHRcdHJldHVybiBhSGllcmFyY2h5U2hlbGw7XG5cdH1cblxuXHRfZ2V0VGFyZ2V0VHlwZUZyb21IYXNoKHNIYXNoOiBhbnkpIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRsZXQgc1RhcmdldFR5cGUgPSBcIlwiO1xuXG5cdFx0Y29uc3QgYVJvdXRlcyA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIikucm91dGluZz8ucm91dGVzID8/IFtdO1xuXHRcdGZvciAoY29uc3Qgcm91dGUgb2YgYVJvdXRlcykge1xuXHRcdFx0Y29uc3Qgb1JvdXRlID0gb0FwcENvbXBvbmVudC5nZXRSb3V0ZXIoKS5nZXRSb3V0ZShyb3V0ZS5uYW1lKTtcblx0XHRcdGlmIChvUm91dGU/Lm1hdGNoKHNIYXNoKSkge1xuXHRcdFx0XHRjb25zdCBzVGFyZ2V0ID0gQXJyYXkuaXNBcnJheShyb3V0ZS50YXJnZXQpID8gcm91dGUudGFyZ2V0WzBdIDogcm91dGUudGFyZ2V0O1xuXHRcdFx0XHRzVGFyZ2V0VHlwZSA9IChvQXBwQ29tcG9uZW50LmdldFJvdXRlcigpLmdldFRhcmdldChzVGFyZ2V0KSBhcyBhbnkpLl9vT3B0aW9ucy5uYW1lO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gc1RhcmdldFR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiB1cGRhdGVzIHRoZSBzaGVsbCB0aXRsZSBhZnRlciBlYWNoIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gb1ZpZXcgVGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBtZW51IGlzIGZpbGxlZCBwcm9wZXJseVxuXHQgKi9cblx0X2NvbXB1dGVUaXRsZUhpZXJhcmNoeShvVmlldzogYW55KSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRvQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRvQ3VycmVudFBhZ2UgPSBvVmlldy5nZXRQYXJlbnQoKSxcblx0XHRcdGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMgPSBbXSxcblx0XHRcdHNBcHBTcGVjaWZpY0hhc2ggPSB0aGlzLl9nZXRBcHBTcGVjaWZpY0hhc2goKSxcblx0XHRcdG1hbmlmZXN0QXBwU2V0dGluZ3MgPSBvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpLFxuXHRcdFx0c0FwcFRpdGxlID0gbWFuaWZlc3RBcHBTZXR0aW5ncy50aXRsZSB8fCBcIlwiLFxuXHRcdFx0c0FwcFN1YlRpdGxlID0gbWFuaWZlc3RBcHBTZXR0aW5ncy5zdWJUaXRsZSB8fCBcIlwiLFxuXHRcdFx0YXBwSWNvbiA9IG1hbmlmZXN0QXBwU2V0dGluZ3MuaWNvbiB8fCBcIlwiO1xuXHRcdGxldCBvUGFnZVRpdGxlSW5mb3JtYXRpb246IGFueSwgc05ld1BhdGg7XG5cblx0XHRpZiAob0N1cnJlbnRQYWdlICYmIG9DdXJyZW50UGFnZS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24pIHtcblx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHQvLyBJZiB0aGUgZmlyc3QgcGFnZSBvZiB0aGUgYXBwbGljYXRpb24gaXMgYSBMUiwgdXNlIHRoZSB0aXRsZSBhbmQgc3VidGl0bGUgZnJvbSB0aGUgbWFuaWZlc3Rcblx0XHRcdFx0aWYgKHRoaXMuX2dldFRhcmdldFR5cGVGcm9tSGFzaChcIlwiKSA9PT0gXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnRcIikge1xuXHRcdFx0XHRcdGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZSh0aGlzLl9jb21wdXRlVGl0bGVJbmZvKHNBcHBUaXRsZSwgc0FwcFN1YlRpdGxlLCBzQXBwU3BlY2lmaWNIYXNoLCBhcHBJY29uKSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlbiBtYW5hZ2Ugb3RoZXIgcGFnZXNcblx0XHRcdFx0c05ld1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRcdGNvbnN0IGFQYXRoUGFydHMgPSBzTmV3UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cblx0XHRcdFx0YVBhdGhQYXJ0cy5zaGlmdCgpOyAvLyBSZW1vdmUgdGhlIGZpcnN0IHNlZ21lbnQgKGVtcHR5IHN0cmluZykgYXMgaXQgaGFzIGJlZW4gbWFuYWdlZCBhYm92ZVxuXHRcdFx0XHRhUGF0aFBhcnRzLnBvcCgpOyAvLyBSZW1vdmUgdGhlIGxhc3Qgc2VnbWVudCBhcyBpdCBjb3JyZXNwb25kcyB0byB0aGUgY3VycmVudCBwYWdlIGFuZCBzaG91bGRuJ3QgYXBwZWFyIGluIHRoZSBtZW51XG5cblx0XHRcdFx0YVBhdGhQYXJ0cy5mb3JFYWNoKChzUGF0aFBhcnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHNQYXRoICs9IGAvJHtzUGF0aFBhcnR9YDtcblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0XHRcdHNQYXJhbWV0ZXJQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzUGF0aCksXG5cdFx0XHRcdFx0XHRiSXNQYXJhbWV0ZXJpemVkID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhcmFtZXRlclBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVzdWx0Q29udGV4dGApO1xuXHRcdFx0XHRcdGlmICghYklzUGFyYW1ldGVyaXplZCkge1xuXHRcdFx0XHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcy5wdXNoKHRoaXMuZ2V0VGl0bGVJbmZvRnJvbVBhdGgoc1BhdGgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDdXJyZW50IHBhZ2Vcblx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbiA9IG9DdXJyZW50UGFnZS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKTtcblx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbiA9IHRoaXMuX2NvbXB1dGVUaXRsZUluZm8oXG5cdFx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbi50aXRsZSxcblx0XHRcdFx0b1BhZ2VUaXRsZUluZm9ybWF0aW9uLnN1YnRpdGxlLFxuXHRcdFx0XHRzQXBwU3BlY2lmaWNIYXNoICsgdGhpcy5fZ2V0SGFzaCgpXG5cdFx0XHQpO1xuXG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSgpW3NOZXdQYXRoXSA9IG9QYWdlVGl0bGVJbmZvcm1hdGlvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKVtzQXBwU3BlY2lmaWNIYXNoXSA9IG9QYWdlVGl0bGVJbmZvcm1hdGlvbjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0YVRpdGxlSW5mb3JtYXRpb25Qcm9taXNlcy5wdXNoKFByb21pc2UucmVqZWN0KFwiVGl0bGUgaW5mb3JtYXRpb24gbWlzc2luZyBpbiBIZWFkZXJJbmZvXCIpKTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMpXG5cdFx0XHQudGhlbigoYVRpdGxlSW5mb0hpZXJhcmNoeTogYW55W10pID0+IHtcblx0XHRcdFx0Ly8gd29ya2Fyb3VuZCBmb3Igc2hlbGwgd2hpY2ggaXMgZXhwZWN0aW5nIGFsbCBlbGVtZW50cyBiZWluZyBvZiB0eXBlIHN0cmluZ1xuXHRcdFx0XHRjb25zdCBhVGl0bGVJbmZvSGllcmFyY2h5U2hlbGwgPSB0aGlzLl9lbnN1cmVIaWVyYXJjaHlFbGVtZW50c0FyZVN0cmluZ3MoYVRpdGxlSW5mb0hpZXJhcmNoeSksXG5cdFx0XHRcdFx0c1RpdGxlID0gb1BhZ2VUaXRsZUluZm9ybWF0aW9uLnRpdGxlO1xuXHRcdFx0XHRhVGl0bGVJbmZvSGllcmFyY2h5U2hlbGwucmV2ZXJzZSgpO1xuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRIaWVyYXJjaHkoYVRpdGxlSW5mb0hpZXJhcmNoeVNoZWxsKTtcblxuXHRcdFx0XHR0aGlzLl9zZXRTaGVsbE1lbnVUaXRsZShvQXBwQ29tcG9uZW50LCBzVGl0bGUsIHNBcHBUaXRsZSk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChzRXJyb3JNZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKHNFcnJvck1lc3NhZ2UpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0dGhpcy5iSXNDb21wdXRpbmdUaXRsZUhpZXJhY2h5ID0gZmFsc2U7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChzRXJyb3JNZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKHNFcnJvck1lc3NhZ2UpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGNhbGN1bGF0ZUxheW91dChpTmV4dEZDTExldmVsOiBudW1iZXIsIHNIYXNoOiBzdHJpbmcsIHNQcm9wb3NlZExheW91dDogc3RyaW5nIHwgdW5kZWZpbmVkLCBrZWVwQ3VycmVudExheW91dCA9IGZhbHNlKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGJhY2sgYWZ0ZXIgYSB2aWV3IGhhcyBiZWVuIGJvdW5kIHRvIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgaGFzIGJlZW4gYm91bmQgdG8gYSB2aWV3XG5cdCAqL1xuXHRvbkNvbnRleHRCb3VuZFRvVmlldyhvQ29udGV4dDogYW55KSB7XG5cdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRjb25zdCBzRGVlcGVzdFBhdGggPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcImludGVybmFsXCIpLmdldFByb3BlcnR5KFwiL2RlZXBlc3RQYXRoXCIpLFxuXHRcdFx0XHRzVmlld0NvbnRleHRQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXG5cdFx0XHRpZiAoIXNEZWVwZXN0UGF0aCB8fCBzRGVlcGVzdFBhdGguaW5kZXhPZihzVmlld0NvbnRleHRQYXRoKSAhPT0gMCkge1xuXHRcdFx0XHQvLyBUaGVyZSB3YXMgbm8gcHJldmlvdXMgdmFsdWUgZm9yIHRoZSBkZWVwZXN0IHJlYWNoZWQgcGF0aCwgb3IgdGhlIHBhdGhcblx0XHRcdFx0Ly8gZm9yIHRoZSB2aWV3IGlzbid0IGEgc3VicGF0aCBvZiB0aGUgcHJldmlvdXMgZGVlcGVzdCBwYXRoIC0tPiB1cGRhdGVcblx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsKS5zZXRQcm9wZXJ0eShcIi9kZWVwZXN0UGF0aFwiLCBzVmlld0NvbnRleHRQYXRoLCB1bmRlZmluZWQsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0ZGlzcGxheUVycm9yUGFnZShzRXJyb3JNZXNzYWdlOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBUbyBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0dXBkYXRlVUlTdGF0ZUZvclZpZXcob1ZpZXc6IGFueSwgRkNMTGV2ZWw6IGFueSkge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRnZXRJbnN0YW5jZWRWaWV3cygpOiBYTUxWaWV3W10ge1xuXHRcdHJldHVybiBbXTtcblx0XHQvLyBUbyBiZSBvdmVycmlkZW5cblx0fVxuXG5cdF9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpOiB2b2lkIHtcblx0XHQvLyBUbyBiZSBvdmVycmlkZW5cblx0fVxuXG5cdGlzRmNsRW5hYmxlZCgpOiB0aGlzIGlzIEZjbENvbnRyb2xsZXIge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0X3NldFNoZWxsTWVudVRpdGxlKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgc1RpdGxlOiBzdHJpbmcsIHNBcHBUaXRsZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGVuIGJ5IEZjbENvbnRyb2xsZXJcblx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRUaXRsZShzVGl0bGUpO1xuXHR9XG5cblx0Z2V0QXBwQ29udGVudENvbnRhaW5lcigpOiBOYXZDb250YWluZXIgfCBGbGV4aWJsZUNvbHVtbkxheW91dCB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0Y29uc3QgYXBwQ29udGVudElkID0gb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpNVwiKS5yb3V0aW5nPy5jb25maWc/LmNvbnRyb2xJZCA/PyBcImFwcENvbnRlbnRcIjtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuYnlJZChhcHBDb250ZW50SWQpIGFzIE5hdkNvbnRhaW5lciB8IEZsZXhpYmxlQ29sdW1uTGF5b3V0O1xuXHR9XG59XG5pbnRlcmZhY2UgUm9vdFZpZXdCYXNlQ29udHJvbGxlciB7XG5cdG9uQ29udGFpbmVyUmVhZHk/KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvb3RWaWV3QmFzZUNvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7TUFvQk1BLHNCQUFzQixXQUQzQkMsY0FBYyxDQUFDLDZDQUE2QyxDQUFDLFVBRTVEQyxjQUFjLENBQUNDLFdBQVcsQ0FBQyxVQUczQkQsY0FBYyxDQUFDRSxTQUFTLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQSxNQVdsQkMseUJBQXlCLEdBQUcsS0FBSztNQUFBO0lBQUE7SUFBQTtJQUFBLE9BRXpDQyxNQUFNLEdBQU4sa0JBQVM7TUFDUkMsVUFBVSxDQUFDQyxJQUFJLEVBQUU7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