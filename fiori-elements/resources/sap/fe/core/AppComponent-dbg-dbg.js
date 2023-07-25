/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/AppStateHandler", "sap/fe/core/controllerextensions/routing/RouterProxy", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/manifestMerger/ChangePageConfiguration", "sap/fe/core/support/Diagnostics", "sap/ui/core/Core", "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "./controllerextensions/BusyLocker", "./converters/MetaModelConverter", "./helpers/SemanticDateOperators"], function (Log, AppStateHandler, RouterProxy, ClassSupport, ModelHelper, library, ChangePageConfiguration, Diagnostics, Core, UIComponent, JSONModel, BusyLocker, MetaModelConverter, SemanticDateOperators) {
  "use strict";

  var _dec, _class, _class2;
  var deleteModelCacheData = MetaModelConverter.deleteModelCacheData;
  var cleanPageConfigurationChanges = ChangePageConfiguration.cleanPageConfigurationChanges;
  var changeConfiguration = ChangePageConfiguration.changeConfiguration;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  const StartupMode = library.StartupMode;
  const NAVCONF = {
    FCL: {
      VIEWNAME: "sap.fe.core.rootView.Fcl",
      VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.Fcl",
      ROUTERCLASS: "sap.f.routing.Router"
    },
    NAVCONTAINER: {
      VIEWNAME: "sap.fe.core.rootView.NavContainer",
      VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.NavContainer",
      ROUTERCLASS: "sap.m.routing.Router"
    }
  };
  /**
   * Main class for components used for an application in SAP Fiori elements.
   *
   * Application developers using the templates and building blocks provided by SAP Fiori elements should create their apps by extending this component.
   * This ensures that all the necessary services that you need for the building blocks and templates to work properly are started.
   *
   * When you use sap.fe.core.AppComponent as the base component, you also need to use a rootView. SAP Fiori elements provides two options: <br/>
   *  - sap.fe.core.rootView.NavContainer when using sap.m.routing.Router <br/>
   *  - sap.fe.core.rootView.Fcl when using sap.f.routing.Router (FCL use case) <br/>
   *
   * @hideconstructor
   * @public
   * @name sap.fe.core.AppComponent
   */
  let AppComponent = (_dec = defineUI5Class("sap.fe.core.AppComponent", {
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
    config: {
      fullWidth: true
    },
    manifest: {
      "sap.ui5": {
        services: {
          resourceModel: {
            factoryName: "sap.fe.core.services.ResourceModelService",
            startup: "waitFor",
            settings: {
              bundles: ["sap.fe.core.messagebundle"],
              modelName: "sap.fe.i18n"
            }
          },
          routingService: {
            factoryName: "sap.fe.core.services.RoutingService",
            startup: "waitFor"
          },
          shellServices: {
            factoryName: "sap.fe.core.services.ShellServices",
            startup: "waitFor"
          },
          ShellUIService: {
            factoryName: "sap.ushell.ui5service.ShellUIService"
          },
          navigationService: {
            factoryName: "sap.fe.core.services.NavigationService",
            startup: "waitFor"
          },
          environmentCapabilities: {
            factoryName: "sap.fe.core.services.EnvironmentService",
            startup: "waitFor"
          },
          sideEffectsService: {
            factoryName: "sap.fe.core.services.SideEffectsService",
            startup: "waitFor"
          },
          asyncComponentService: {
            factoryName: "sap.fe.core.services.AsyncComponentService",
            startup: "waitFor"
          }
        },
        rootView: {
          viewName: NAVCONF.NAVCONTAINER.VIEWNAME,
          type: "XML",
          async: true,
          id: "appRootView"
        },
        routing: {
          config: {
            controlId: "appContent",
            routerClass: NAVCONF.NAVCONTAINER.ROUTERCLASS,
            viewType: "XML",
            controlAggregation: "pages",
            async: true,
            containerOptions: {
              propagateModel: true
            }
          }
        }
      }
    },
    designtime: "sap/fe/core/designtime/AppComponent.designtime",
    library: "sap.fe.core"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_UIComponent) {
    _inheritsLoose(AppComponent, _UIComponent);
    function AppComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UIComponent.call(this, ...args) || this;
      _this.startupMode = StartupMode.Normal;
      return _this;
    }
    var _proto = AppComponent.prototype;
    /**
     * @private
     * @name sap.fe.core.AppComponent.getMetadata
     * @function
     */
    _proto._isFclEnabled = function _isFclEnabled() {
      var _oManifestUI5$routing, _oManifestUI5$routing2;
      const oManifestUI5 = this.getManifestEntry("sap.ui5");
      return (oManifestUI5 === null || oManifestUI5 === void 0 ? void 0 : (_oManifestUI5$routing = oManifestUI5.routing) === null || _oManifestUI5$routing === void 0 ? void 0 : (_oManifestUI5$routing2 = _oManifestUI5$routing.config) === null || _oManifestUI5$routing2 === void 0 ? void 0 : _oManifestUI5$routing2.routerClass) === NAVCONF.FCL.ROUTERCLASS;
    }

    /**
     * Provides a hook to initialize feature toggles.
     *
     * This hook is being called by the SAP Fiori elements AppComponent at the time feature toggles can be initialized.
     * To change page configuration use the {@link sap.fe.core.AppComponent#changePageConfiguration} method.
     *
     * @function
     * @name sap.fe.core.AppComponent#initializeFeatureToggles
     * @memberof sap.fe.core.AppComponent
     * @public
     */;
    _proto.initializeFeatureToggles = async function initializeFeatureToggles() {
      // this method can be overridden by applications
      return Promise.resolve();
    }

    /**
     * Changes the page configuration of SAP Fiori elements.
     *
     * This method enables you to change the page configuration of SAP Fiori elements.
     *
     * @function
     * @name sap.fe.core.AppComponent#changePageConfiguration
     * @memberof sap.fe.core.AppComponent
     * @param pageId The ID of the page for which the configuration is to be changed.
     * @param path The path in the page settings for which the configuration is to be changed.
     * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
     * @public
     */;
    _proto.changePageConfiguration = function changePageConfiguration(pageId, path, value) {
      changeConfiguration(this.getManifest(), pageId, path, value, true);
    }

    /**
     * Get a reference to the RouterProxy.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRouterProxy
     * @memberof sap.fe.core.AppComponent
     * @returns A Reference to the RouterProxy
     * @ui5-restricted
     * @final
     */;
    _proto.getRouterProxy = function getRouterProxy() {
      return this._oRouterProxy;
    }

    /**
     * Get a reference to the AppStateHandler.
     *
     * @function
     * @name sap.fe.core.AppComponent#getAppStateHandler
     * @memberof sap.fe.core.AppComponent
     * @returns A reference to the AppStateHandler
     * @ui5-restricted
     * @final
     */;
    _proto.getAppStateHandler = function getAppStateHandler() {
      return this._oAppStateHandler;
    }

    /**
     * Get a reference to the nav/FCL Controller.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRootViewController
     * @memberof sap.fe.core.AppComponent
     * @returns  A reference to the FCL Controller
     * @ui5-restricted
     * @final
     */;
    _proto.getRootViewController = function getRootViewController() {
      return this.getRootControl().getController();
    }

    /**
     * Get the NavContainer control or the FCL control.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRootContainer
     * @memberof sap.fe.core.AppComponent
     * @returns  A reference to NavContainer control or the FCL control
     * @ui5-restricted
     * @final
     */;
    _proto.getRootContainer = function getRootContainer() {
      return this.getRootControl().getContent()[0];
    }

    /**
     * Get the startup mode of the app.
     *
     * @returns The startup mode
     * @private
     */;
    _proto.getStartupMode = function getStartupMode() {
      return this.startupMode;
    }

    /**
     * Set the startup mode for the app to 'Create'.
     *
     * @private
     */;
    _proto.setStartupModeCreate = function setStartupModeCreate() {
      this.startupMode = StartupMode.Create;
    }

    /**
     * Set the startup mode for the app to 'AutoCreate'.
     *
     * @private
     */;
    _proto.setStartupModeAutoCreate = function setStartupModeAutoCreate() {
      this.startupMode = StartupMode.AutoCreate;
    }

    /**
     * Set the startup mode for the app to 'Deeplink'.
     *
     * @private
     */;
    _proto.setStartupModeDeeplink = function setStartupModeDeeplink() {
      this.startupMode = StartupMode.Deeplink;
    };
    _proto.init = function init() {
      var _oModel$isA, _oManifestUI5$rootVie;
      const uiModel = new JSONModel({
        editMode: library.EditMode.Display,
        isEditable: false,
        draftStatus: library.DraftStatus.Clear,
        busy: false,
        busyLocal: {},
        pages: {}
      });
      const oInternalModel = new JSONModel({
        pages: {}
      });
      // set the binding OneWay for uiModel to prevent changes if controller extensions modify a bound property of a control
      uiModel.setDefaultBindingMode("OneWay");
      // for internal model binding needs to be two way
      ModelHelper.enhanceUiJSONModel(uiModel, library);
      ModelHelper.enhanceInternalJSONModel(oInternalModel);
      this.setModel(uiModel, "ui");
      this.setModel(oInternalModel, "internal");
      this.bInitializeRouting = this.bInitializeRouting !== undefined ? this.bInitializeRouting : true;
      this._oRouterProxy = new RouterProxy();
      this._oAppStateHandler = new AppStateHandler(this);
      this._oDiagnostics = new Diagnostics();
      const oModel = this.getModel();
      if (oModel !== null && oModel !== void 0 && (_oModel$isA = oModel.isA) !== null && _oModel$isA !== void 0 && _oModel$isA.call(oModel, "sap.ui.model.odata.v4.ODataModel")) {
        this.entityContainer = oModel.getMetaModel().requestObject("/$EntityContainer/");
      } else {
        // not an OData v4 service
        this.entityContainer = Promise.resolve();
      }
      const oManifestUI5 = this.getManifest()["sap.ui5"];
      if (oManifestUI5 !== null && oManifestUI5 !== void 0 && (_oManifestUI5$rootVie = oManifestUI5.rootView) !== null && _oManifestUI5$rootVie !== void 0 && _oManifestUI5$rootVie.viewName) {
        var _oManifestUI5$routing3, _oManifestUI5$routing4, _oManifestUI5$routing5, _oManifestUI5$routing6, _oManifestUI5$rootVie2, _oManifestUI5$rootVie3;
        // The application specified an own root view in the manifest

        // Root View was moved from sap.fe.templates to sap.fe.core - keep it compatible
        if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME_COMPATIBILITY) {
          oManifestUI5.rootView.viewName = NAVCONF.FCL.VIEWNAME;
        } else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME_COMPATIBILITY) {
          oManifestUI5.rootView.viewName = NAVCONF.NAVCONTAINER.VIEWNAME;
        }
        if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME && ((_oManifestUI5$routing3 = oManifestUI5.routing) === null || _oManifestUI5$routing3 === void 0 ? void 0 : (_oManifestUI5$routing4 = _oManifestUI5$routing3.config) === null || _oManifestUI5$routing4 === void 0 ? void 0 : _oManifestUI5$routing4.routerClass) === NAVCONF.FCL.ROUTERCLASS) {
          Log.info(`Rootcontainer: "${NAVCONF.FCL.VIEWNAME}" - Routerclass: "${NAVCONF.FCL.ROUTERCLASS}"`);
        } else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME && ((_oManifestUI5$routing5 = oManifestUI5.routing) === null || _oManifestUI5$routing5 === void 0 ? void 0 : (_oManifestUI5$routing6 = _oManifestUI5$routing5.config) === null || _oManifestUI5$routing6 === void 0 ? void 0 : _oManifestUI5$routing6.routerClass) === NAVCONF.NAVCONTAINER.ROUTERCLASS) {
          Log.info(`Rootcontainer: "${NAVCONF.NAVCONTAINER.VIEWNAME}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
        } else if (((_oManifestUI5$rootVie2 = oManifestUI5.rootView) === null || _oManifestUI5$rootVie2 === void 0 ? void 0 : (_oManifestUI5$rootVie3 = _oManifestUI5$rootVie2.viewName) === null || _oManifestUI5$rootVie3 === void 0 ? void 0 : _oManifestUI5$rootVie3.indexOf("sap.fe.core.rootView")) !== -1) {
          var _oManifestUI5$routing7, _oManifestUI5$routing8;
          throw Error(`\nWrong configuration for the couple (rootView/routerClass) in manifest file.\n` + `Current values are :(${oManifestUI5.rootView.viewName}/${((_oManifestUI5$routing7 = oManifestUI5.routing) === null || _oManifestUI5$routing7 === void 0 ? void 0 : (_oManifestUI5$routing8 = _oManifestUI5$routing7.config) === null || _oManifestUI5$routing8 === void 0 ? void 0 : _oManifestUI5$routing8.routerClass) || "<missing router class>"})\n` + `Expected values are \n` + `\t - (${NAVCONF.NAVCONTAINER.VIEWNAME}/${NAVCONF.NAVCONTAINER.ROUTERCLASS})\n` + `\t - (${NAVCONF.FCL.VIEWNAME}/${NAVCONF.FCL.ROUTERCLASS})`);
        } else {
          Log.info(`Rootcontainer: "${oManifestUI5.rootView.viewName}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
        }
      }

      // Adding Semantic Date Operators
      // Commenting since it is not needed for SingleRange
      SemanticDateOperators.addSemanticDateOperators();

      // the init function configures the routing according to the settings above
      // it will call the createContent function to instantiate the RootView and add it to the UIComponent aggregations

      _UIComponent.prototype.init.call(this);
      AppComponent.instanceMap[this.getId()] = this;
    };
    _proto.onServicesStarted = async function onServicesStarted() {
      await this.initializeFeatureToggles();

      //router must be started once the rootcontainer is initialized
      //starting of the router
      const finalizedRoutingInitialization = () => {
        this.entityContainer.then(() => {
          if (this.getRootViewController().attachRouteMatchers) {
            this.getRootViewController().attachRouteMatchers();
          }
          this.getRouter().initialize();
          this.getRouterProxy().init(this, this._isFclEnabled());
          return;
        }).catch(error => {
          const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          this.getRootViewController().displayErrorPage(oResourceBundle.getText("C_APP_COMPONENT_SAPFE_APPSTART_TECHNICAL_ISSUES"), {
            title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
            description: error.message,
            FCLLevel: 0
          });
        });
      };
      if (this.bInitializeRouting) {
        return this.getRoutingService().initializeRouting().then(() => {
          if (this.getRootViewController()) {
            finalizedRoutingInitialization();
          } else {
            this.getRootControl().attachAfterInit(function () {
              finalizedRoutingInitialization();
            });
          }
          return;
        }).catch(function (err) {
          Log.error(`cannot cannot initialize routing: ${err.toString()}`);
        });
      }
    };
    _proto.exit = function exit() {
      this._oAppStateHandler.destroy();
      this._oRouterProxy.destroy();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oAppStateHandler;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oRouterProxy;
      deleteModelCacheData(this.getMetaModel());
      this.getModel("ui").destroy();
      cleanPageConfigurationChanges();
    };
    _proto.getMetaModel = function getMetaModel() {
      return this.getModel().getMetaModel();
    };
    _proto.getDiagnostics = function getDiagnostics() {
      return this._oDiagnostics;
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      var _this$getRoutingServi;
      // LEAKS, with workaround for some Flex / MDC issue
      try {
        // 	// This one is only a leak if you don't go back to the same component in the long run
        //delete sap.ui.fl.FlexControllerFactory._componentInstantiationPromises[this.getId()];

        delete AppComponent.instanceMap[this.getId()];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete window._routing;
      } catch (e) {
        Log.info(e);
      }

      //WORKAROUND for sticky discard request : due to async callback, request triggered by the exitApplication will be send after the UIComponent.prototype.destroy
      //so we need to copy the Requestor headers as it will be destroy

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const oMainModel = this.oModels[undefined];
      let oHeaders;
      if (oMainModel.oRequestor) {
        oHeaders = jQuery.extend({}, oMainModel.oRequestor.mHeaders);
      }

      // As we need to cleanup the application / handle the dirty object we need to call our cleanup before the models are destroyed
      (_this$getRoutingServi = this.getRoutingService()) === null || _this$getRoutingServi === void 0 ? void 0 : _this$getRoutingServi.beforeExit();
      _UIComponent.prototype.destroy.call(this, bSuppressInvalidate);
      if (oHeaders && oMainModel.oRequestor) {
        oMainModel.oRequestor.mHeaders = oHeaders;
      }
    };
    _proto.getRoutingService = function getRoutingService() {
      return {}; // overriden at runtime
    };
    _proto.getShellServices = function getShellServices() {
      return {}; // overriden at runtime
    };
    _proto.getNavigationService = function getNavigationService() {
      return {}; // overriden at runtime
    };
    _proto.getSideEffectsService = function getSideEffectsService() {
      return {};
    };
    _proto.getEnvironmentCapabilities = function getEnvironmentCapabilities() {
      return {};
    };
    _proto.getStartupParameters = async function getStartupParameters() {
      const oComponentData = this.getComponentData();
      return Promise.resolve(oComponentData && oComponentData.startupParameters || {});
    };
    _proto.restore = function restore() {
      // called by FLP when app sap-keep-alive is enabled and app is restored
      this.getRootViewController().viewState.onRestore();
    };
    _proto.suspend = function suspend() {
      // called by FLP when app sap-keep-alive is enabled and app is suspended
      this.getRootViewController().viewState.onSuspend();
    }

    /**
     * navigateBasedOnStartupParameter function is a public api that acts as a wrapper to _manageDeepLinkStartup function. It passes the startup parameters further to _manageDeepLinkStartup function
     *
     * @param startupParameters Defines the startup parameters which is further passed to _manageDeepLinkStartup function.
     */;
    _proto.navigateBasedOnStartupParameter = async function navigateBasedOnStartupParameter(startupParameters) {
      try {
        if (!BusyLocker.isLocked(this.getModel("ui"))) {
          if (!startupParameters) {
            startupParameters = null;
          }
          const routingService = this.getRoutingService();
          await routingService._manageDeepLinkStartup(startupParameters);
        }
      } catch (exception) {
        Log.error(exception);
        BusyLocker.unlock(this.getModel("ui"));
      }
    };
    return AppComponent;
  }(UIComponent), _class2.instanceMap = {}, _class2)) || _class);
  return AppComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFydHVwTW9kZSIsImxpYnJhcnkiLCJOQVZDT05GIiwiRkNMIiwiVklFV05BTUUiLCJWSUVXTkFNRV9DT01QQVRJQklMSVRZIiwiUk9VVEVSQ0xBU1MiLCJOQVZDT05UQUlORVIiLCJBcHBDb21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsImludGVyZmFjZXMiLCJjb25maWciLCJmdWxsV2lkdGgiLCJtYW5pZmVzdCIsInNlcnZpY2VzIiwicmVzb3VyY2VNb2RlbCIsImZhY3RvcnlOYW1lIiwic3RhcnR1cCIsInNldHRpbmdzIiwiYnVuZGxlcyIsIm1vZGVsTmFtZSIsInJvdXRpbmdTZXJ2aWNlIiwic2hlbGxTZXJ2aWNlcyIsIlNoZWxsVUlTZXJ2aWNlIiwibmF2aWdhdGlvblNlcnZpY2UiLCJlbnZpcm9ubWVudENhcGFiaWxpdGllcyIsInNpZGVFZmZlY3RzU2VydmljZSIsImFzeW5jQ29tcG9uZW50U2VydmljZSIsInJvb3RWaWV3Iiwidmlld05hbWUiLCJ0eXBlIiwiYXN5bmMiLCJpZCIsInJvdXRpbmciLCJjb250cm9sSWQiLCJyb3V0ZXJDbGFzcyIsInZpZXdUeXBlIiwiY29udHJvbEFnZ3JlZ2F0aW9uIiwiY29udGFpbmVyT3B0aW9ucyIsInByb3BhZ2F0ZU1vZGVsIiwiZGVzaWdudGltZSIsInN0YXJ0dXBNb2RlIiwiTm9ybWFsIiwiX2lzRmNsRW5hYmxlZCIsIm9NYW5pZmVzdFVJNSIsImdldE1hbmlmZXN0RW50cnkiLCJpbml0aWFsaXplRmVhdHVyZVRvZ2dsZXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImNoYW5nZVBhZ2VDb25maWd1cmF0aW9uIiwicGFnZUlkIiwicGF0aCIsInZhbHVlIiwiY2hhbmdlQ29uZmlndXJhdGlvbiIsImdldE1hbmlmZXN0IiwiZ2V0Um91dGVyUHJveHkiLCJfb1JvdXRlclByb3h5IiwiZ2V0QXBwU3RhdGVIYW5kbGVyIiwiX29BcHBTdGF0ZUhhbmRsZXIiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJnZXRSb290Q29udGFpbmVyIiwiZ2V0Q29udGVudCIsImdldFN0YXJ0dXBNb2RlIiwic2V0U3RhcnR1cE1vZGVDcmVhdGUiLCJDcmVhdGUiLCJzZXRTdGFydHVwTW9kZUF1dG9DcmVhdGUiLCJBdXRvQ3JlYXRlIiwic2V0U3RhcnR1cE1vZGVEZWVwbGluayIsIkRlZXBsaW5rIiwiaW5pdCIsInVpTW9kZWwiLCJKU09OTW9kZWwiLCJlZGl0TW9kZSIsIkVkaXRNb2RlIiwiRGlzcGxheSIsImlzRWRpdGFibGUiLCJkcmFmdFN0YXR1cyIsIkRyYWZ0U3RhdHVzIiwiQ2xlYXIiLCJidXN5IiwiYnVzeUxvY2FsIiwicGFnZXMiLCJvSW50ZXJuYWxNb2RlbCIsInNldERlZmF1bHRCaW5kaW5nTW9kZSIsIk1vZGVsSGVscGVyIiwiZW5oYW5jZVVpSlNPTk1vZGVsIiwiZW5oYW5jZUludGVybmFsSlNPTk1vZGVsIiwic2V0TW9kZWwiLCJiSW5pdGlhbGl6ZVJvdXRpbmciLCJ1bmRlZmluZWQiLCJSb3V0ZXJQcm94eSIsIkFwcFN0YXRlSGFuZGxlciIsIl9vRGlhZ25vc3RpY3MiLCJEaWFnbm9zdGljcyIsIm9Nb2RlbCIsImdldE1vZGVsIiwiaXNBIiwiZW50aXR5Q29udGFpbmVyIiwiZ2V0TWV0YU1vZGVsIiwicmVxdWVzdE9iamVjdCIsIkxvZyIsImluZm8iLCJpbmRleE9mIiwiRXJyb3IiLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJhZGRTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJpbnN0YW5jZU1hcCIsImdldElkIiwib25TZXJ2aWNlc1N0YXJ0ZWQiLCJmaW5hbGl6ZWRSb3V0aW5nSW5pdGlhbGl6YXRpb24iLCJ0aGVuIiwiYXR0YWNoUm91dGVNYXRjaGVycyIsImdldFJvdXRlciIsImluaXRpYWxpemUiLCJjYXRjaCIsImVycm9yIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImRpc3BsYXlFcnJvclBhZ2UiLCJnZXRUZXh0IiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm1lc3NhZ2UiLCJGQ0xMZXZlbCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiaW5pdGlhbGl6ZVJvdXRpbmciLCJhdHRhY2hBZnRlckluaXQiLCJlcnIiLCJ0b1N0cmluZyIsImV4aXQiLCJkZXN0cm95IiwiZGVsZXRlTW9kZWxDYWNoZURhdGEiLCJjbGVhblBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlcyIsImdldERpYWdub3N0aWNzIiwiYlN1cHByZXNzSW52YWxpZGF0ZSIsIndpbmRvdyIsIl9yb3V0aW5nIiwiZSIsIm9NYWluTW9kZWwiLCJvTW9kZWxzIiwib0hlYWRlcnMiLCJvUmVxdWVzdG9yIiwialF1ZXJ5IiwiZXh0ZW5kIiwibUhlYWRlcnMiLCJiZWZvcmVFeGl0IiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMiLCJnZXRTdGFydHVwUGFyYW1ldGVycyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwicmVzdG9yZSIsInZpZXdTdGF0ZSIsIm9uUmVzdG9yZSIsInN1c3BlbmQiLCJvblN1c3BlbmQiLCJuYXZpZ2F0ZUJhc2VkT25TdGFydHVwUGFyYW1ldGVyIiwiQnVzeUxvY2tlciIsImlzTG9ja2VkIiwiX21hbmFnZURlZXBMaW5rU3RhcnR1cCIsImV4Y2VwdGlvbiIsInVubG9jayIsIlVJQ29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBcHBDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBGbGV4aWJsZUNvbHVtbkxheW91dCBmcm9tIFwic2FwL2YvRmxleGlibGVDb2x1bW5MYXlvdXRcIjtcbmltcG9ydCBBcHBTdGF0ZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0FwcFN0YXRlSGFuZGxlclwiO1xuaW1wb3J0IFJvdXRlclByb3h5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL1JvdXRlclByb3h5XCI7XG5pbXBvcnQgdHlwZSB7IENvbnRlbnREZW5zaXRpZXNUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB7IGNoYW5nZUNvbmZpZ3VyYXRpb24sIGNsZWFuUGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzIH0gZnJvbSBcInNhcC9mZS9jb3JlL21hbmlmZXN0TWVyZ2VyL0NoYW5nZVBhZ2VDb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgdHlwZSBSb290Vmlld0Jhc2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9yb290Vmlldy9Sb290Vmlld0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9FbnZpcm9ubWVudFNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSB7IE5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL05hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBSb3V0aW5nU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9Sb3V0aW5nU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgSVNoZWxsU2VydmljZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2hlbGxTZXJ2aWNlc0ZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgU2lkZUVmZmVjdHNTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBEaWFnbm9zdGljcyBmcm9tIFwic2FwL2ZlL2NvcmUvc3VwcG9ydC9EaWFnbm9zdGljc1wiO1xuaW1wb3J0IHR5cGUgTmF2Q29udGFpbmVyIGZyb20gXCJzYXAvbS9OYXZDb250YWluZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcIi4vY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IHsgZGVsZXRlTW9kZWxDYWNoZURhdGEgfSBmcm9tIFwiLi9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IFNlbWFudGljRGF0ZU9wZXJhdG9ycyBmcm9tIFwiLi9oZWxwZXJzL1NlbWFudGljRGF0ZU9wZXJhdG9yc1wiO1xuXG5jb25zdCBTdGFydHVwTW9kZSA9IGxpYnJhcnkuU3RhcnR1cE1vZGU7XG5cbmNvbnN0IE5BVkNPTkYgPSB7XG5cdEZDTDoge1xuXHRcdFZJRVdOQU1FOiBcInNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbFwiLFxuXHRcdFZJRVdOQU1FX0NPTVBBVElCSUxJVFk6IFwic2FwLmZlLnRlbXBsYXRlcy5Sb290Q29udGFpbmVyLnZpZXcuRmNsXCIsXG5cdFx0Uk9VVEVSQ0xBU1M6IFwic2FwLmYucm91dGluZy5Sb3V0ZXJcIlxuXHR9LFxuXHROQVZDT05UQUlORVI6IHtcblx0XHRWSUVXTkFNRTogXCJzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXJcIixcblx0XHRWSUVXTkFNRV9DT01QQVRJQklMSVRZOiBcInNhcC5mZS50ZW1wbGF0ZXMuUm9vdENvbnRhaW5lci52aWV3Lk5hdkNvbnRhaW5lclwiLFxuXHRcdFJPVVRFUkNMQVNTOiBcInNhcC5tLnJvdXRpbmcuUm91dGVyXCJcblx0fVxufTtcblxuZXhwb3J0IHR5cGUgTWFuaWZlc3RDb250ZW50QXBwID0ge1xuXHRjcm9zc05hdmlnYXRpb24/OiB7XG5cdFx0b3V0Ym91bmRzPzogUmVjb3JkPFxuXHRcdFx0c3RyaW5nLFxuXHRcdFx0e1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogc3RyaW5nO1xuXHRcdFx0XHRhY3Rpb246IHN0cmluZztcblx0XHRcdFx0cGFyYW1ldGVyczogc3RyaW5nO1xuXHRcdFx0fVxuXHRcdD47XG5cdH07XG5cdHRpdGxlPzogc3RyaW5nO1xuXHRzdWJUaXRsZT86IHN0cmluZztcblx0aWNvbj86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIE1hbmlmZXN0Q29udGVudFVJNSA9IHtcblx0Y29udGVudERlbnNpdGllcz86IENvbnRlbnREZW5zaXRpZXNUeXBlO1xuXHRwYWdlUmVhZHlUaW1lb3V0PzogbnVtYmVyO1xuXHRyb290Vmlldz86IHtcblx0XHR2aWV3TmFtZTogc3RyaW5nO1xuXHR9O1xuXHRyb3V0aW5nPzoge1xuXHRcdGNvbmZpZz86IHtcblx0XHRcdHJvdXRlckNsYXNzOiBzdHJpbmc7XG5cdFx0XHRjb250cm9sSWQ/OiBzdHJpbmc7XG5cdFx0fTtcblx0XHRyb3V0ZXM6IHtcblx0XHRcdHBhdHRlcm46IHN0cmluZztcblx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdHRhcmdldDogc3RyaW5nO1xuXHRcdH1bXTtcblx0XHR0YXJnZXRzPzogUmVjb3JkPFxuXHRcdFx0c3RyaW5nLFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogc3RyaW5nO1xuXHRcdFx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0XHRcdG9wdGlvbnM/OiB7XG5cdFx0XHRcdFx0c2V0dGluZ3M/OiBvYmplY3Q7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0Pjtcblx0fTtcblx0bW9kZWxzOiBSZWNvcmQ8XG5cdFx0c3RyaW5nLFxuXHRcdHtcblx0XHRcdHR5cGU/OiBzdHJpbmc7XG5cdFx0XHRkYXRhU291cmNlPzogc3RyaW5nO1xuXHRcdFx0c2V0dGluZ3M/OiBvYmplY3Q7XG5cdFx0fVxuXHQ+O1xufTtcblxuZXhwb3J0IHR5cGUgTWFuaWZlc3RDb250ZW50ID0ge1xuXHRcInNhcC5hcHBcIj86IE1hbmlmZXN0Q29udGVudEFwcDtcblx0XCJzYXAudWk1XCI/OiBNYW5pZmVzdENvbnRlbnRVSTU7XG5cdFwic2FwLmZlXCI/OiB7XG5cdFx0Zm9ybT86IHtcblx0XHRcdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q/OiBib29sZWFuO1xuXHRcdH07XG5cdH07XG59O1xuZXhwb3J0IHR5cGUgQ29tcG9uZW50RGF0YSA9IHtcblx0c3RhcnR1cFBhcmFtZXRlcnM/OiB7XG5cdFx0cHJlZmVycmVkTW9kZT86IHN0cmluZ1tdO1xuXHR9ICYgUmVjb3JkPHN0cmluZywgdW5rbm93bltdPjtcblx0Ly9mZUVudmlyb25tZW50IGlzIG9iamVjdCB3aGljaCBpcyByZWNlaXZlZCBhcyBhIHBhcnQgb2YgdGhlIGNvbXBvbmVudCBkYXRhIGZvciBNeSBJbmJveCBhcHBsaWNhdGlvbnMuXG5cdGZlRW52aXJvbm1lbnQ/OiB7XG5cdFx0Ly9XaXRoaW4gdGhpcyBvYmplY3QgdGhleSBwYXNzIGEgZnVuY3Rpb24gY2FsbGVkIGdldEludGVudCgpIHdoaWNoIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHNlbWFudGljT2JqZWN0IGFuZCBhY3Rpb24gYXMgc2VwYXJhdGUgcHJvcGVydHktdmFsdWUgZW50cmllcyB0aGF0IGFyZSB0aGVuIHVzZWQgdG8gdXBkYXRlIHRoZSByZWxhdGVkIGFwcHMgYnV0dG9uLlxuXHRcdGdldEludGVudDogRnVuY3Rpb247XG5cdFx0Ly9XaXRoaW4gdGhpcyBvYmplY3QgdGhleSBwYXNzIGEgZnVuY3Rpb24gY2FsbGVkIGdldFNoYXJlQ29udHJvbFZpc2liaWxpdHkoKSB0aGF0IHJldHVybnMgYm9vbGVhbiB2YWx1ZXModHJ1ZSBvciBmYWxzZSkgd2hpY2ggZGV0ZXJtaW5lcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgc2hhcmUgYnV0dG9uLlxuXHRcdGdldFNoYXJlQ29udHJvbFZpc2liaWxpdHk6IEZ1bmN0aW9uO1xuXHR9O1xufTtcblxuZXhwb3J0IHR5cGUgU3RhcnR1cFBhcmFtZXRlcnMgPSB7XG5cdHByZWZlcnJlZE1vZGU/OiBzdHJpbmdbXTtcbn0gJiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duW10+O1xuLyoqXG4gKiBNYWluIGNsYXNzIGZvciBjb21wb25lbnRzIHVzZWQgZm9yIGFuIGFwcGxpY2F0aW9uIGluIFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqXG4gKiBBcHBsaWNhdGlvbiBkZXZlbG9wZXJzIHVzaW5nIHRoZSB0ZW1wbGF0ZXMgYW5kIGJ1aWxkaW5nIGJsb2NrcyBwcm92aWRlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMgc2hvdWxkIGNyZWF0ZSB0aGVpciBhcHBzIGJ5IGV4dGVuZGluZyB0aGlzIGNvbXBvbmVudC5cbiAqIFRoaXMgZW5zdXJlcyB0aGF0IGFsbCB0aGUgbmVjZXNzYXJ5IHNlcnZpY2VzIHRoYXQgeW91IG5lZWQgZm9yIHRoZSBidWlsZGluZyBibG9ja3MgYW5kIHRlbXBsYXRlcyB0byB3b3JrIHByb3Blcmx5IGFyZSBzdGFydGVkLlxuICpcbiAqIFdoZW4geW91IHVzZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQgYXMgdGhlIGJhc2UgY29tcG9uZW50LCB5b3UgYWxzbyBuZWVkIHRvIHVzZSBhIHJvb3RWaWV3LiBTQVAgRmlvcmkgZWxlbWVudHMgcHJvdmlkZXMgdHdvIG9wdGlvbnM6IDxici8+XG4gKiAgLSBzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXIgd2hlbiB1c2luZyBzYXAubS5yb3V0aW5nLlJvdXRlciA8YnIvPlxuICogIC0gc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsIHdoZW4gdXNpbmcgc2FwLmYucm91dGluZy5Sb3V0ZXIgKEZDTCB1c2UgY2FzZSkgPGJyLz5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XCIsIHtcblx0aW50ZXJmYWNlczogW1wic2FwLnVpLmNvcmUuSUFzeW5jQ29udGVudENyZWF0aW9uXCJdLFxuXHRjb25maWc6IHtcblx0XHRmdWxsV2lkdGg6IHRydWVcblx0fSxcblx0bWFuaWZlc3Q6IHtcblx0XHRcInNhcC51aTVcIjoge1xuXHRcdFx0c2VydmljZXM6IHtcblx0XHRcdFx0cmVzb3VyY2VNb2RlbDoge1xuXHRcdFx0XHRcdGZhY3RvcnlOYW1lOiBcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlJlc291cmNlTW9kZWxTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCIsXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdGJ1bmRsZXM6IFtcInNhcC5mZS5jb3JlLm1lc3NhZ2VidW5kbGVcIl0sXG5cdFx0XHRcdFx0XHRtb2RlbE5hbWU6IFwic2FwLmZlLmkxOG5cIlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0cm91dGluZ1NlcnZpY2U6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5Sb3V0aW5nU2VydmljZVwiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNoZWxsU2VydmljZXM6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaGVsbFNlcnZpY2VzXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0U2hlbGxVSVNlcnZpY2U6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAudXNoZWxsLnVpNXNlcnZpY2UuU2hlbGxVSVNlcnZpY2VcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRuYXZpZ2F0aW9uU2VydmljZToge1xuXHRcdFx0XHRcdGZhY3RvcnlOYW1lOiBcInNhcC5mZS5jb3JlLnNlcnZpY2VzLk5hdmlnYXRpb25TZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW52aXJvbm1lbnRDYXBhYmlsaXRpZXM6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5FbnZpcm9ubWVudFNlcnZpY2VcIixcblx0XHRcdFx0XHRzdGFydHVwOiBcIndhaXRGb3JcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzaWRlRWZmZWN0c1NlcnZpY2U6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaWRlRWZmZWN0c1NlcnZpY2VcIixcblx0XHRcdFx0XHRzdGFydHVwOiBcIndhaXRGb3JcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhc3luY0NvbXBvbmVudFNlcnZpY2U6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5Bc3luY0NvbXBvbmVudFNlcnZpY2VcIixcblx0XHRcdFx0XHRzdGFydHVwOiBcIndhaXRGb3JcIlxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cm9vdFZpZXc6IHtcblx0XHRcdFx0dmlld05hbWU6IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlZJRVdOQU1FLFxuXHRcdFx0XHR0eXBlOiBcIlhNTFwiLFxuXHRcdFx0XHRhc3luYzogdHJ1ZSxcblx0XHRcdFx0aWQ6IFwiYXBwUm9vdFZpZXdcIlxuXHRcdFx0fSxcblx0XHRcdHJvdXRpbmc6IHtcblx0XHRcdFx0Y29uZmlnOiB7XG5cdFx0XHRcdFx0Y29udHJvbElkOiBcImFwcENvbnRlbnRcIixcblx0XHRcdFx0XHRyb3V0ZXJDbGFzczogTkFWQ09ORi5OQVZDT05UQUlORVIuUk9VVEVSQ0xBU1MsXG5cdFx0XHRcdFx0dmlld1R5cGU6IFwiWE1MXCIsXG5cdFx0XHRcdFx0Y29udHJvbEFnZ3JlZ2F0aW9uOiBcInBhZ2VzXCIsXG5cdFx0XHRcdFx0YXN5bmM6IHRydWUsXG5cdFx0XHRcdFx0Y29udGFpbmVyT3B0aW9uczoge1xuXHRcdFx0XHRcdFx0cHJvcGFnYXRlTW9kZWw6IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGRlc2lnbnRpbWU6IFwic2FwL2ZlL2NvcmUvZGVzaWdudGltZS9BcHBDb21wb25lbnQuZGVzaWdudGltZVwiLFxuXG5cdGxpYnJhcnk6IFwic2FwLmZlLmNvcmVcIlxufSlcbmNsYXNzIEFwcENvbXBvbmVudCBleHRlbmRzIFVJQ29tcG9uZW50IHtcblx0c3RhdGljIGluc3RhbmNlTWFwOiBSZWNvcmQ8c3RyaW5nLCBBcHBDb21wb25lbnQ+ID0ge307XG5cblx0cHJpdmF0ZSBfb1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cblx0cHJpdmF0ZSBfb0FwcFN0YXRlSGFuZGxlciE6IEFwcFN0YXRlSGFuZGxlcjtcblxuXHRwcml2YXRlIGJJbml0aWFsaXplUm91dGluZz86IGJvb2xlYW47XG5cblx0cHJpdmF0ZSBfb0RpYWdub3N0aWNzITogRGlhZ25vc3RpY3M7XG5cblx0cHJpdmF0ZSBlbnRpdHlDb250YWluZXIhOiBQcm9taXNlPHZvaWQ+O1xuXG5cdHByaXZhdGUgc3RhcnR1cE1vZGU6IHN0cmluZyA9IFN0YXJ0dXBNb2RlLk5vcm1hbDtcblxuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhXG5cdCAqIEBmdW5jdGlvblxuXHQgKi9cblxuXHRfaXNGY2xFbmFibGVkKCkge1xuXHRcdGNvbnN0IG9NYW5pZmVzdFVJNSA9IHRoaXMuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIik7XG5cdFx0cmV0dXJuIG9NYW5pZmVzdFVJNT8ucm91dGluZz8uY29uZmlnPy5yb3V0ZXJDbGFzcyA9PT0gTkFWQ09ORi5GQ0wuUk9VVEVSQ0xBU1M7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMgYSBob29rIHRvIGluaXRpYWxpemUgZmVhdHVyZSB0b2dnbGVzLlxuXHQgKlxuXHQgKiBUaGlzIGhvb2sgaXMgYmVpbmcgY2FsbGVkIGJ5IHRoZSBTQVAgRmlvcmkgZWxlbWVudHMgQXBwQ29tcG9uZW50IGF0IHRoZSB0aW1lIGZlYXR1cmUgdG9nZ2xlcyBjYW4gYmUgaW5pdGlhbGl6ZWQuXG5cdCAqIFRvIGNoYW5nZSBwYWdlIGNvbmZpZ3VyYXRpb24gdXNlIHRoZSB7QGxpbmsgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2NoYW5nZVBhZ2VDb25maWd1cmF0aW9ufSBtZXRob2QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQjaW5pdGlhbGl6ZUZlYXR1cmVUb2dnbGVzXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YXN5bmMgaW5pdGlhbGl6ZUZlYXR1cmVUb2dnbGVzKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5IGFwcGxpY2F0aW9uc1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBwYWdlIGNvbmZpZ3VyYXRpb24gb2YgU0FQIEZpb3JpIGVsZW1lbnRzLlxuXHQgKlxuXHQgKiBUaGlzIG1ldGhvZCBlbmFibGVzIHlvdSB0byBjaGFuZ2UgdGhlIHBhZ2UgY29uZmlndXJhdGlvbiBvZiBTQVAgRmlvcmkgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQjY2hhbmdlUGFnZUNvbmZpZ3VyYXRpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gcGFnZUlkIFRoZSBJRCBvZiB0aGUgcGFnZSBmb3Igd2hpY2ggdGhlIGNvbmZpZ3VyYXRpb24gaXMgdG8gYmUgY2hhbmdlZC5cblx0ICogQHBhcmFtIHBhdGggVGhlIHBhdGggaW4gdGhlIHBhZ2Ugc2V0dGluZ3MgZm9yIHdoaWNoIHRoZSBjb25maWd1cmF0aW9uIGlzIHRvIGJlIGNoYW5nZWQuXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBjb25maWd1cmF0aW9uLiBUaGlzIGNvdWxkIGJlIGEgcGxhaW4gdmFsdWUgbGlrZSBhIHN0cmluZywgb3IgYSBCb29sZWFuLCBvciBhIHN0cnVjdHVyZWQgb2JqZWN0LlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRjaGFuZ2VQYWdlQ29uZmlndXJhdGlvbihwYWdlSWQ6IHN0cmluZywgcGF0aDogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuXHRcdGNoYW5nZUNvbmZpZ3VyYXRpb24odGhpcy5nZXRNYW5pZmVzdCgpLCBwYWdlSWQsIHBhdGgsIHZhbHVlLCB0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIFJvdXRlclByb3h5LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldFJvdXRlclByb3h5XG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcblx0ICogQHJldHVybnMgQSBSZWZlcmVuY2UgdG8gdGhlIFJvdXRlclByb3h5XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGdldFJvdXRlclByb3h5KCk6IFJvdXRlclByb3h5IHtcblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRlclByb3h5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgQXBwU3RhdGVIYW5kbGVyLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldEFwcFN0YXRlSGFuZGxlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBBcHBTdGF0ZUhhbmRsZXJcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0Z2V0QXBwU3RhdGVIYW5kbGVyKCkge1xuXHRcdHJldHVybiB0aGlzLl9vQXBwU3RhdGVIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgbmF2L0ZDTCBDb250cm9sbGVyLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldFJvb3RWaWV3Q29udHJvbGxlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zICBBIHJlZmVyZW5jZSB0byB0aGUgRkNMIENvbnRyb2xsZXJcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0Z2V0Um9vdFZpZXdDb250cm9sbGVyKCk6IFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIge1xuXHRcdHJldHVybiB0aGlzLmdldFJvb3RDb250cm9sKCkuZ2V0Q29udHJvbGxlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgTmF2Q29udGFpbmVyIGNvbnRyb2wgb3IgdGhlIEZDTCBjb250cm9sLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2dldFJvb3RDb250YWluZXJcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFxuXHQgKiBAcmV0dXJucyAgQSByZWZlcmVuY2UgdG8gTmF2Q29udGFpbmVyIGNvbnRyb2wgb3IgdGhlIEZDTCBjb250cm9sXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGdldFJvb3RDb250YWluZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0Um9vdENvbnRyb2woKS5nZXRDb250ZW50KClbMF0gYXMgTmF2Q29udGFpbmVyIHwgRmxleGlibGVDb2x1bW5MYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBzdGFydHVwIG1vZGUgb2YgdGhlIGFwcC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHN0YXJ0dXAgbW9kZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0U3RhcnR1cE1vZGUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5zdGFydHVwTW9kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIHN0YXJ0dXAgbW9kZSBmb3IgdGhlIGFwcCB0byAnQ3JlYXRlJy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHNldFN0YXJ0dXBNb2RlQ3JlYXRlKCkge1xuXHRcdHRoaXMuc3RhcnR1cE1vZGUgPSBTdGFydHVwTW9kZS5DcmVhdGU7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBzdGFydHVwIG1vZGUgZm9yIHRoZSBhcHAgdG8gJ0F1dG9DcmVhdGUnLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c2V0U3RhcnR1cE1vZGVBdXRvQ3JlYXRlKCkge1xuXHRcdHRoaXMuc3RhcnR1cE1vZGUgPSBTdGFydHVwTW9kZS5BdXRvQ3JlYXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgc3RhcnR1cCBtb2RlIGZvciB0aGUgYXBwIHRvICdEZWVwbGluaycuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRzZXRTdGFydHVwTW9kZURlZXBsaW5rKCkge1xuXHRcdHRoaXMuc3RhcnR1cE1vZGUgPSBTdGFydHVwTW9kZS5EZWVwbGluaztcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0Y29uc3QgdWlNb2RlbCA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0ZWRpdE1vZGU6IGxpYnJhcnkuRWRpdE1vZGUuRGlzcGxheSxcblx0XHRcdGlzRWRpdGFibGU6IGZhbHNlLFxuXHRcdFx0ZHJhZnRTdGF0dXM6IGxpYnJhcnkuRHJhZnRTdGF0dXMuQ2xlYXIsXG5cdFx0XHRidXN5OiBmYWxzZSxcblx0XHRcdGJ1c3lMb2NhbDoge30sXG5cdFx0XHRwYWdlczoge31cblx0XHR9KTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbCA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0cGFnZXM6IHt9XG5cdFx0fSk7XG5cdFx0Ly8gc2V0IHRoZSBiaW5kaW5nIE9uZVdheSBmb3IgdWlNb2RlbCB0byBwcmV2ZW50IGNoYW5nZXMgaWYgY29udHJvbGxlciBleHRlbnNpb25zIG1vZGlmeSBhIGJvdW5kIHByb3BlcnR5IG9mIGEgY29udHJvbFxuXHRcdHVpTW9kZWwuc2V0RGVmYXVsdEJpbmRpbmdNb2RlKFwiT25lV2F5XCIpO1xuXHRcdC8vIGZvciBpbnRlcm5hbCBtb2RlbCBiaW5kaW5nIG5lZWRzIHRvIGJlIHR3byB3YXlcblx0XHRNb2RlbEhlbHBlci5lbmhhbmNlVWlKU09OTW9kZWwodWlNb2RlbCwgbGlicmFyeSk7XG5cdFx0TW9kZWxIZWxwZXIuZW5oYW5jZUludGVybmFsSlNPTk1vZGVsKG9JbnRlcm5hbE1vZGVsKTtcblxuXHRcdHRoaXMuc2V0TW9kZWwodWlNb2RlbCwgXCJ1aVwiKTtcblx0XHR0aGlzLnNldE1vZGVsKG9JbnRlcm5hbE1vZGVsLCBcImludGVybmFsXCIpO1xuXG5cdFx0dGhpcy5iSW5pdGlhbGl6ZVJvdXRpbmcgPSB0aGlzLmJJbml0aWFsaXplUm91dGluZyAhPT0gdW5kZWZpbmVkID8gdGhpcy5iSW5pdGlhbGl6ZVJvdXRpbmcgOiB0cnVlO1xuXHRcdHRoaXMuX29Sb3V0ZXJQcm94eSA9IG5ldyBSb3V0ZXJQcm94eSgpO1xuXHRcdHRoaXMuX29BcHBTdGF0ZUhhbmRsZXIgPSBuZXcgQXBwU3RhdGVIYW5kbGVyKHRoaXMpO1xuXHRcdHRoaXMuX29EaWFnbm9zdGljcyA9IG5ldyBEaWFnbm9zdGljcygpO1xuXG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWw7XG5cdFx0aWYgKG9Nb2RlbD8uaXNBPy4oXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0dGhpcy5lbnRpdHlDb250YWluZXIgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCkucmVxdWVzdE9iamVjdChcIi8kRW50aXR5Q29udGFpbmVyL1wiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gbm90IGFuIE9EYXRhIHY0IHNlcnZpY2Vcblx0XHRcdHRoaXMuZW50aXR5Q29udGFpbmVyID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb01hbmlmZXN0VUk1ID0gdGhpcy5nZXRNYW5pZmVzdCgpW1wic2FwLnVpNVwiXTtcblx0XHRpZiAob01hbmlmZXN0VUk1Py5yb290Vmlldz8udmlld05hbWUpIHtcblx0XHRcdC8vIFRoZSBhcHBsaWNhdGlvbiBzcGVjaWZpZWQgYW4gb3duIHJvb3QgdmlldyBpbiB0aGUgbWFuaWZlc3RcblxuXHRcdFx0Ly8gUm9vdCBWaWV3IHdhcyBtb3ZlZCBmcm9tIHNhcC5mZS50ZW1wbGF0ZXMgdG8gc2FwLmZlLmNvcmUgLSBrZWVwIGl0IGNvbXBhdGlibGVcblx0XHRcdGlmIChvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWUgPT09IE5BVkNPTkYuRkNMLlZJRVdOQU1FX0NPTVBBVElCSUxJVFkpIHtcblx0XHRcdFx0b01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lID0gTkFWQ09ORi5GQ0wuVklFV05BTUU7XG5cdFx0XHR9IGVsc2UgaWYgKG9NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZSA9PT0gTkFWQ09ORi5OQVZDT05UQUlORVIuVklFV05BTUVfQ09NUEFUSUJJTElUWSkge1xuXHRcdFx0XHRvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWUgPSBOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWUgPT09IE5BVkNPTkYuRkNMLlZJRVdOQU1FICYmXG5cdFx0XHRcdG9NYW5pZmVzdFVJNS5yb3V0aW5nPy5jb25maWc/LnJvdXRlckNsYXNzID09PSBOQVZDT05GLkZDTC5ST1VURVJDTEFTU1xuXHRcdFx0KSB7XG5cdFx0XHRcdExvZy5pbmZvKGBSb290Y29udGFpbmVyOiBcIiR7TkFWQ09ORi5GQ0wuVklFV05BTUV9XCIgLSBSb3V0ZXJjbGFzczogXCIke05BVkNPTkYuRkNMLlJPVVRFUkNMQVNTfVwiYCk7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWUgPT09IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlZJRVdOQU1FICYmXG5cdFx0XHRcdG9NYW5pZmVzdFVJNS5yb3V0aW5nPy5jb25maWc/LnJvdXRlckNsYXNzID09PSBOQVZDT05GLk5BVkNPTlRBSU5FUi5ST1VURVJDTEFTU1xuXHRcdFx0KSB7XG5cdFx0XHRcdExvZy5pbmZvKGBSb290Y29udGFpbmVyOiBcIiR7TkFWQ09ORi5OQVZDT05UQUlORVIuVklFV05BTUV9XCIgLSBSb3V0ZXJjbGFzczogXCIke05BVkNPTkYuTkFWQ09OVEFJTkVSLlJPVVRFUkNMQVNTfVwiYCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9NYW5pZmVzdFVJNS5yb290Vmlldz8udmlld05hbWU/LmluZGV4T2YoXCJzYXAuZmUuY29yZS5yb290Vmlld1wiKSAhPT0gLTEpIHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoXG5cdFx0XHRcdFx0YFxcbldyb25nIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjb3VwbGUgKHJvb3RWaWV3L3JvdXRlckNsYXNzKSBpbiBtYW5pZmVzdCBmaWxlLlxcbmAgK1xuXHRcdFx0XHRcdFx0YEN1cnJlbnQgdmFsdWVzIGFyZSA6KCR7b01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lfS8ke1xuXHRcdFx0XHRcdFx0XHRvTWFuaWZlc3RVSTUucm91dGluZz8uY29uZmlnPy5yb3V0ZXJDbGFzcyB8fCBcIjxtaXNzaW5nIHJvdXRlciBjbGFzcz5cIlxuXHRcdFx0XHRcdFx0fSlcXG5gICtcblx0XHRcdFx0XHRcdGBFeHBlY3RlZCB2YWx1ZXMgYXJlIFxcbmAgK1xuXHRcdFx0XHRcdFx0YFxcdCAtICgke05BVkNPTkYuTkFWQ09OVEFJTkVSLlZJRVdOQU1FfS8ke05BVkNPTkYuTkFWQ09OVEFJTkVSLlJPVVRFUkNMQVNTfSlcXG5gICtcblx0XHRcdFx0XHRcdGBcXHQgLSAoJHtOQVZDT05GLkZDTC5WSUVXTkFNRX0vJHtOQVZDT05GLkZDTC5ST1VURVJDTEFTU30pYFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmluZm8oYFJvb3Rjb250YWluZXI6IFwiJHtvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWV9XCIgLSBSb3V0ZXJjbGFzczogXCIke05BVkNPTkYuTkFWQ09OVEFJTkVSLlJPVVRFUkNMQVNTfVwiYCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQWRkaW5nIFNlbWFudGljIERhdGUgT3BlcmF0b3JzXG5cdFx0Ly8gQ29tbWVudGluZyBzaW5jZSBpdCBpcyBub3QgbmVlZGVkIGZvciBTaW5nbGVSYW5nZVxuXHRcdFNlbWFudGljRGF0ZU9wZXJhdG9ycy5hZGRTZW1hbnRpY0RhdGVPcGVyYXRvcnMoKTtcblxuXHRcdC8vIHRoZSBpbml0IGZ1bmN0aW9uIGNvbmZpZ3VyZXMgdGhlIHJvdXRpbmcgYWNjb3JkaW5nIHRvIHRoZSBzZXR0aW5ncyBhYm92ZVxuXHRcdC8vIGl0IHdpbGwgY2FsbCB0aGUgY3JlYXRlQ29udGVudCBmdW5jdGlvbiB0byBpbnN0YW50aWF0ZSB0aGUgUm9vdFZpZXcgYW5kIGFkZCBpdCB0byB0aGUgVUlDb21wb25lbnQgYWdncmVnYXRpb25zXG5cblx0XHRzdXBlci5pbml0KCk7XG5cdFx0QXBwQ29tcG9uZW50Lmluc3RhbmNlTWFwW3RoaXMuZ2V0SWQoKV0gPSB0aGlzO1xuXHR9XG5cblx0YXN5bmMgb25TZXJ2aWNlc1N0YXJ0ZWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5pbml0aWFsaXplRmVhdHVyZVRvZ2dsZXMoKTtcblxuXHRcdC8vcm91dGVyIG11c3QgYmUgc3RhcnRlZCBvbmNlIHRoZSByb290Y29udGFpbmVyIGlzIGluaXRpYWxpemVkXG5cdFx0Ly9zdGFydGluZyBvZiB0aGUgcm91dGVyXG5cdFx0Y29uc3QgZmluYWxpemVkUm91dGluZ0luaXRpYWxpemF0aW9uID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5lbnRpdHlDb250YWluZXJcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmF0dGFjaFJvdXRlTWF0Y2hlcnMpIHtcblx0XHRcdFx0XHRcdHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkuYXR0YWNoUm91dGVNYXRjaGVycygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLmdldFJvdXRlcigpLmluaXRpYWxpemUoKTtcblx0XHRcdFx0XHR0aGlzLmdldFJvdXRlclByb3h5KCkuaW5pdCh0aGlzLCB0aGlzLl9pc0ZjbEVuYWJsZWQoKSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cblx0XHRcdFx0XHR0aGlzLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmRpc3BsYXlFcnJvclBhZ2UoXG5cdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9BUFBTVEFSVF9URUNITklDQUxfSVNTVUVTXCIpLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKSxcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGVycm9yLm1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdEZDTExldmVsOiAwXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGlmICh0aGlzLmJJbml0aWFsaXplUm91dGluZykge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Um91dGluZ1NlcnZpY2UoKVxuXHRcdFx0XHQuaW5pdGlhbGl6ZVJvdXRpbmcoKVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkpIHtcblx0XHRcdFx0XHRcdGZpbmFsaXplZFJvdXRpbmdJbml0aWFsaXphdGlvbigpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdldFJvb3RDb250cm9sKCkuYXR0YWNoQWZ0ZXJJbml0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0ZmluYWxpemVkUm91dGluZ0luaXRpYWxpemF0aW9uKCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogRXJyb3IpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoYGNhbm5vdCBjYW5ub3QgaW5pdGlhbGl6ZSByb3V0aW5nOiAke2Vyci50b1N0cmluZygpfWApO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRleGl0KCkge1xuXHRcdHRoaXMuX29BcHBTdGF0ZUhhbmRsZXIuZGVzdHJveSgpO1xuXHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5kZXN0cm95KCk7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRkZWxldGUgdGhpcy5fb0FwcFN0YXRlSGFuZGxlcjtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGRlbGV0ZSB0aGlzLl9vUm91dGVyUHJveHk7XG5cdFx0ZGVsZXRlTW9kZWxDYWNoZURhdGEodGhpcy5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0dGhpcy5nZXRNb2RlbChcInVpXCIpLmRlc3Ryb3koKTtcblx0XHRjbGVhblBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlcygpO1xuXHR9XG5cblx0Z2V0TWV0YU1vZGVsKCk6IE9EYXRhTWV0YU1vZGVsIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHR9XG5cblx0Z2V0RGlhZ25vc3RpY3MoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29EaWFnbm9zdGljcztcblx0fVxuXG5cdGRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZT86IGJvb2xlYW4pIHtcblx0XHQvLyBMRUFLUywgd2l0aCB3b3JrYXJvdW5kIGZvciBzb21lIEZsZXggLyBNREMgaXNzdWVcblx0XHR0cnkge1xuXHRcdFx0Ly8gXHQvLyBUaGlzIG9uZSBpcyBvbmx5IGEgbGVhayBpZiB5b3UgZG9uJ3QgZ28gYmFjayB0byB0aGUgc2FtZSBjb21wb25lbnQgaW4gdGhlIGxvbmcgcnVuXG5cdFx0XHQvL2RlbGV0ZSBzYXAudWkuZmwuRmxleENvbnRyb2xsZXJGYWN0b3J5Ll9jb21wb25lbnRJbnN0YW50aWF0aW9uUHJvbWlzZXNbdGhpcy5nZXRJZCgpXTtcblxuXHRcdFx0ZGVsZXRlIEFwcENvbXBvbmVudC5pbnN0YW5jZU1hcFt0aGlzLmdldElkKCldO1xuXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRkZWxldGUgKHdpbmRvdyBhcyB1bmtub3duKS5fcm91dGluZztcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuaW5mbyhlIGFzIHN0cmluZyk7XG5cdFx0fVxuXG5cdFx0Ly9XT1JLQVJPVU5EIGZvciBzdGlja3kgZGlzY2FyZCByZXF1ZXN0IDogZHVlIHRvIGFzeW5jIGNhbGxiYWNrLCByZXF1ZXN0IHRyaWdnZXJlZCBieSB0aGUgZXhpdEFwcGxpY2F0aW9uIHdpbGwgYmUgc2VuZCBhZnRlciB0aGUgVUlDb21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3lcblx0XHQvL3NvIHdlIG5lZWQgdG8gY29weSB0aGUgUmVxdWVzdG9yIGhlYWRlcnMgYXMgaXQgd2lsbCBiZSBkZXN0cm95XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnN0IG9NYWluTW9kZWwgPSB0aGlzLm9Nb2RlbHNbdW5kZWZpbmVkXTtcblx0XHRsZXQgb0hlYWRlcnM7XG5cdFx0aWYgKG9NYWluTW9kZWwub1JlcXVlc3Rvcikge1xuXHRcdFx0b0hlYWRlcnMgPSBqUXVlcnkuZXh0ZW5kKHt9LCBvTWFpbk1vZGVsLm9SZXF1ZXN0b3IubUhlYWRlcnMpO1xuXHRcdH1cblxuXHRcdC8vIEFzIHdlIG5lZWQgdG8gY2xlYW51cCB0aGUgYXBwbGljYXRpb24gLyBoYW5kbGUgdGhlIGRpcnR5IG9iamVjdCB3ZSBuZWVkIHRvIGNhbGwgb3VyIGNsZWFudXAgYmVmb3JlIHRoZSBtb2RlbHMgYXJlIGRlc3Ryb3llZFxuXHRcdHRoaXMuZ2V0Um91dGluZ1NlcnZpY2UoKT8uYmVmb3JlRXhpdCgpO1xuXHRcdHN1cGVyLmRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZSk7XG5cdFx0aWYgKG9IZWFkZXJzICYmIG9NYWluTW9kZWwub1JlcXVlc3Rvcikge1xuXHRcdFx0b01haW5Nb2RlbC5vUmVxdWVzdG9yLm1IZWFkZXJzID0gb0hlYWRlcnM7XG5cdFx0fVxuXHR9XG5cblx0Z2V0Um91dGluZ1NlcnZpY2UoKTogUm91dGluZ1NlcnZpY2Uge1xuXHRcdHJldHVybiB7fSBhcyBSb3V0aW5nU2VydmljZTsgLy8gb3ZlcnJpZGVuIGF0IHJ1bnRpbWVcblx0fVxuXG5cdGdldFNoZWxsU2VydmljZXMoKTogSVNoZWxsU2VydmljZXMge1xuXHRcdHJldHVybiB7fSBhcyBJU2hlbGxTZXJ2aWNlczsgLy8gb3ZlcnJpZGVuIGF0IHJ1bnRpbWVcblx0fVxuXG5cdGdldE5hdmlnYXRpb25TZXJ2aWNlKCk6IE5hdmlnYXRpb25TZXJ2aWNlIHtcblx0XHRyZXR1cm4ge30gYXMgTmF2aWdhdGlvblNlcnZpY2U7IC8vIG92ZXJyaWRlbiBhdCBydW50aW1lXG5cdH1cblxuXHRnZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTogU2lkZUVmZmVjdHNTZXJ2aWNlIHtcblx0XHRyZXR1cm4ge30gYXMgU2lkZUVmZmVjdHNTZXJ2aWNlO1xuXHR9XG5cblx0Z2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKTogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNTZXJ2aWNlIHtcblx0XHRyZXR1cm4ge30gYXMgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNTZXJ2aWNlO1xuXHR9XG5cblx0YXN5bmMgZ2V0U3RhcnR1cFBhcmFtZXRlcnMoKSB7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSB0aGlzLmdldENvbXBvbmVudERhdGEoKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKChvQ29tcG9uZW50RGF0YSAmJiBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycykgfHwge30pO1xuXHR9XG5cblx0cmVzdG9yZSgpIHtcblx0XHQvLyBjYWxsZWQgYnkgRkxQIHdoZW4gYXBwIHNhcC1rZWVwLWFsaXZlIGlzIGVuYWJsZWQgYW5kIGFwcCBpcyByZXN0b3JlZFxuXHRcdHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkudmlld1N0YXRlLm9uUmVzdG9yZSgpO1xuXHR9XG5cblx0c3VzcGVuZCgpIHtcblx0XHQvLyBjYWxsZWQgYnkgRkxQIHdoZW4gYXBwIHNhcC1rZWVwLWFsaXZlIGlzIGVuYWJsZWQgYW5kIGFwcCBpcyBzdXNwZW5kZWRcblx0XHR0aGlzLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLnZpZXdTdGF0ZS5vblN1c3BlbmQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBuYXZpZ2F0ZUJhc2VkT25TdGFydHVwUGFyYW1ldGVyIGZ1bmN0aW9uIGlzIGEgcHVibGljIGFwaSB0aGF0IGFjdHMgYXMgYSB3cmFwcGVyIHRvIF9tYW5hZ2VEZWVwTGlua1N0YXJ0dXAgZnVuY3Rpb24uIEl0IHBhc3NlcyB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzIGZ1cnRoZXIgdG8gX21hbmFnZURlZXBMaW5rU3RhcnR1cCBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gc3RhcnR1cFBhcmFtZXRlcnMgRGVmaW5lcyB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzIHdoaWNoIGlzIGZ1cnRoZXIgcGFzc2VkIHRvIF9tYW5hZ2VEZWVwTGlua1N0YXJ0dXAgZnVuY3Rpb24uXG5cdCAqL1xuXG5cdGFzeW5jIG5hdmlnYXRlQmFzZWRPblN0YXJ0dXBQYXJhbWV0ZXIoc3RhcnR1cFBhcmFtZXRlcnM6IFN0YXJ0dXBQYXJhbWV0ZXJzIHwgbnVsbCB8IHVuZGVmaW5lZCkge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoIUJ1c3lMb2NrZXIuaXNMb2NrZWQodGhpcy5nZXRNb2RlbChcInVpXCIpKSkge1xuXHRcdFx0XHRpZiAoIXN0YXJ0dXBQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0c3RhcnR1cFBhcmFtZXRlcnMgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHJvdXRpbmdTZXJ2aWNlID0gdGhpcy5nZXRSb3V0aW5nU2VydmljZSgpO1xuXHRcdFx0XHRhd2FpdCByb3V0aW5nU2VydmljZS5fbWFuYWdlRGVlcExpbmtTdGFydHVwKHN0YXJ0dXBQYXJhbWV0ZXJzKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChleGNlcHRpb246IHVua25vd24pIHtcblx0XHRcdExvZy5lcnJvcihleGNlcHRpb24gYXMgc3RyaW5nKTtcblx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKHRoaXMuZ2V0TW9kZWwoXCJ1aVwiKSk7XG5cdFx0fVxuXHR9XG59XG5cbmludGVyZmFjZSBBcHBDb21wb25lbnQgZXh0ZW5kcyBVSUNvbXBvbmVudCB7XG5cdGdldE1hbmlmZXN0KCk6IE1hbmlmZXN0Q29udGVudDtcblx0Z2V0TWFuaWZlc3RFbnRyeShlbnRyeTogXCJzYXAuYXBwXCIpOiBNYW5pZmVzdENvbnRlbnRBcHA7XG5cdGdldE1hbmlmZXN0RW50cnkoZW50cnk6IFwic2FwLnVpNVwiKTogTWFuaWZlc3RDb250ZW50VUk1O1xuXHRnZXRDb21wb25lbnREYXRhKCk6IENvbXBvbmVudERhdGE7XG5cdGdldFJvb3RDb250cm9sKCk6IHtcblx0XHRnZXRDb250cm9sbGVyKCk6IFJvb3RWaWV3QmFzZUNvbnRyb2xsZXI7XG5cdH0gJiBWaWV3O1xufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBDb21wb25lbnQ7XG4iXSwibWFwcGluZ3Mi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