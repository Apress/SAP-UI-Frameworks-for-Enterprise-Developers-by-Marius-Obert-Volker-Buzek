/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/LoaderUtils", "sap/fe/core/manifestMerger/ChangePageConfiguration", "sap/fe/core/TemplateModel", "sap/ui/core/Component", "sap/ui/core/mvc/View", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/core/service/ServiceFactoryRegistry", "sap/ui/Device", "sap/ui/model/base/ManagedObjectModel", "sap/ui/model/json/JSONModel", "sap/ui/VersionInfo", "../helpers/DynamicAnnotationPathHelper"], function (Log, LoaderUtils, ChangePageConfiguration, TemplateModel, Component, View, Service, ServiceFactory, ServiceFactoryRegistry, Device, ManagedObjectModel, JSONModel, VersionInfo, DynamicAnnotationPathHelper) {
  "use strict";

  var resolveDynamicExpression = DynamicAnnotationPathHelper.resolveDynamicExpression;
  var applyPageConfigurationChanges = ChangePageConfiguration.applyPageConfigurationChanges;
  var requireDependencies = LoaderUtils.requireDependencies;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let TemplatedViewService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(TemplatedViewService, _Service);
    function TemplatedViewService() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = TemplatedViewService.prototype;
    _proto.init = function init() {
      const aServiceDependencies = [];
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const oMetaModel = oAppComponent.getMetaModel();
      this.pageId = oAppComponent.getLocalId(oComponent.getId());
      const sStableId = `${oAppComponent.getMetadata().getComponentName()}::${this.pageId}`;
      const aEnhanceI18n = oComponent.getEnhanceI18n() || [];
      let sAppNamespace;
      this.oFactory = oContext.factory;
      if (aEnhanceI18n) {
        sAppNamespace = oAppComponent.getMetadata().getComponentName();
        for (let i = 0; i < aEnhanceI18n.length; i++) {
          // In order to support text-verticalization applications can also passs a resource model defined in the manifest
          // UI5 takes care of text-verticalization for resource models defined in the manifest
          // Hence check if the given key is a resource model defined in the manifest
          // if so this model should be used to enhance the sap.fe resource model so pass it as it is
          const oResourceModel = oAppComponent.getModel(aEnhanceI18n[i]);
          if (oResourceModel && oResourceModel.isA("sap.ui.model.resource.ResourceModel")) {
            aEnhanceI18n[i] = oResourceModel;
          } else {
            aEnhanceI18n[i] = `${sAppNamespace}.${aEnhanceI18n[i].replace(".properties", "")}`;
          }
        }
      }
      const sCacheIdentifier = `${oAppComponent.getMetadata().getName()}_${sStableId}_${sap.ui.getCore().getConfiguration().getLanguageTag()}`;
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.ResourceModelService").createInstance({
        scopeType: "component",
        scopeObject: oComponent,
        settings: {
          bundles: ["sap.fe.core.messagebundle", "sap.fe.macros.messagebundle", "sap.fe.templates.messagebundle"],
          enhanceI18n: aEnhanceI18n,
          modelName: "sap.fe.i18n"
        }
      }).then(oResourceModelService => {
        this.oResourceModelService = oResourceModelService;
        return oResourceModelService.getResourceModel();
      }));
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").createInstance({
        settings: {
          metaModel: oMetaModel,
          appComponent: oAppComponent,
          component: oComponent
        }
      }).then(oCacheHandlerService => {
        this.oCacheHandlerService = oCacheHandlerService;
        return oCacheHandlerService.validateCacheKey(sCacheIdentifier, oComponent);
      }));
      aServiceDependencies.push(VersionInfo.load().then(function (oInfo) {
        let sTimestamp = "";
        if (!oInfo.libraries) {
          sTimestamp = sap.ui.buildinfo.buildtime;
        } else {
          oInfo.libraries.forEach(function (oLibrary) {
            sTimestamp += oLibrary.buildTimestamp;
          });
        }
        return sTimestamp;
      }).catch(function () {
        return "<NOVALUE>";
      }));
      this.initPromise = Promise.all(aServiceDependencies).then(async aDependenciesResult => {
        const oResourceModel = aDependenciesResult[0];
        const sCacheKey = aDependenciesResult[1];
        const oSideEffectsServices = oAppComponent.getSideEffectsService();
        oSideEffectsServices.initializeSideEffects(oAppComponent.getEnvironmentCapabilities().getCapabilities());
        const [TemplateConverter, MetaModelConverter] = await requireDependencies(["sap/fe/core/converters/TemplateConverter", "sap/fe/core/converters/MetaModelConverter"]);
        return this.createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter);
      }).then(function (sCacheKey) {
        const oCacheHandlerService = ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").getInstance(oMetaModel);
        oCacheHandlerService.invalidateIfNeeded(sCacheKey, sCacheIdentifier, oComponent);
      });
    }

    /**
     * Refresh the current view using the same configuration as before.
     *
     * @param oComponent
     * @returns A promise indicating when the view is refreshed
     * @private
     */;
    _proto.refreshView = function refreshView(oComponent) {
      const oRootView = oComponent.getRootControl();
      if (oRootView) {
        oRootView.destroy();
      } else if (this.oView) {
        this.oView.destroy();
      }
      return this.createView(this.resourceModel, this.stableId, "", this.TemplateConverter, this.MetaModelConverter).then(function () {
        oComponent.oContainer.invalidate();
      }).catch(function (oError) {
        oComponent.oContainer.invalidate();
        Log.error(oError);
      });
    };
    _proto.createView = async function createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter) {
      this.resourceModel = oResourceModel; // TODO: get rid, kept it for the time being
      this.stableId = sStableId;
      this.TemplateConverter = TemplateConverter;
      this.MetaModelConverter = MetaModelConverter;
      const oContext = this.getContext();
      const mServiceSettings = oContext.settings;
      const sConverterType = mServiceSettings.converterType;
      const oComponent = oContext.scopeObject;
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const sFullContextPath = oAppComponent.getRoutingService().getTargetInformationFor(oComponent).options.settings.fullContextPath;
      const oMetaModel = oAppComponent.getMetaModel();
      const oManifestContent = oAppComponent.getManifest();
      const oDeviceModel = new JSONModel(Device).setDefaultBindingMode("OneWay");
      const oManifestModel = new JSONModel(oManifestContent);
      const bError = false;
      let oPageModel, oViewDataModel, oViewSettings, mViewData;

      // Load the index for the additional building blocks which is responsible for initializing them
      function getViewSettings() {
        const aSplitPath = sFullContextPath.split("/");
        const sEntitySetPath = aSplitPath.reduce(function (sPathSoFar, sNextPathPart) {
          if (sNextPathPart === "") {
            return sPathSoFar;
          }
          if (sPathSoFar === "") {
            sPathSoFar = `/${sNextPathPart}`;
          } else {
            const oTarget = oMetaModel.getObject(`${sPathSoFar}/$NavigationPropertyBinding/${sNextPathPart}`);
            if (oTarget && Object.keys(oTarget).length > 0) {
              sPathSoFar += "/$NavigationPropertyBinding";
            }
            sPathSoFar += `/${sNextPathPart}`;
          }
          return sPathSoFar;
        }, "");
        let viewType = mServiceSettings.viewType || oComponent.getViewType() || "XML";
        if (viewType !== "XML") {
          viewType = undefined;
        }
        return {
          type: viewType,
          preprocessors: {
            xml: {
              bindingContexts: {
                entitySet: sEntitySetPath ? oMetaModel.createBindingContext(sEntitySetPath) : null,
                fullContextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                contextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                converterContext: oPageModel.createBindingContext("/", undefined, {
                  noResolve: true
                }),
                viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
              },
              models: {
                entitySet: oMetaModel,
                fullContextPath: oMetaModel,
                contextPath: oMetaModel,
                "sap.fe.i18n": oResourceModel,
                metaModel: oMetaModel,
                device: oDeviceModel,
                manifest: oManifestModel,
                converterContext: oPageModel,
                viewData: oViewDataModel
              },
              appComponent: oAppComponent
            }
          },
          id: sStableId,
          viewName: mServiceSettings.viewName || oComponent.getViewName(),
          viewData: mViewData,
          cache: {
            keys: [sCacheKey],
            additionalData: {
              // We store the page model data in the `additionalData` of the view cache, this way it is always in sync
              getAdditionalCacheData: () => {
                return oPageModel.getData();
              },
              setAdditionalCacheData: value => {
                oPageModel.setData(value);
              }
            }
          },
          models: {
            "sap.fe.i18n": oResourceModel
          },
          height: "100%"
        };
      }
      const createErrorPage = reason => {
        // just replace the view name and add an additional model containing the reason, but
        // keep the other settings
        Log.error(reason.message, reason);
        oViewSettings.viewName = mServiceSettings.errorViewName || "sap.fe.core.services.view.TemplatingErrorPage";
        oViewSettings.preprocessors.xml.models["error"] = new JSONModel(reason);
        return oComponent.runAsOwner(() => {
          return View.create(oViewSettings).then(oView => {
            this.oView = oView;
            this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
            oComponent.setAggregation("rootControl", this.oView);
            return sCacheKey;
          });
        });
      };
      try {
        var _oManifestContent$sap;
        const oRoutingService = await oAppComponent.getService("routingService");
        // Retrieve the viewLevel for the component
        const oTargetInfo = oRoutingService.getTargetInformationFor(oComponent);
        const mOutbounds = oManifestContent["sap.app"] && oManifestContent["sap.app"].crossNavigation && oManifestContent["sap.app"].crossNavigation.outbounds || {};
        const mNavigation = oComponent.getNavigation() || {};
        Object.keys(mNavigation).forEach(function (navigationObjectKey) {
          const navigationObject = mNavigation[navigationObjectKey];
          let outboundConfig;
          if (navigationObject.detail && navigationObject.detail.outbound && mOutbounds[navigationObject.detail.outbound]) {
            outboundConfig = mOutbounds[navigationObject.detail.outbound];
            navigationObject.detail.outboundDetail = {
              semanticObject: outboundConfig.semanticObject,
              action: outboundConfig.action,
              parameters: outboundConfig.parameters
            };
          }
          if (navigationObject.create && navigationObject.create.outbound && mOutbounds[navigationObject.create.outbound]) {
            outboundConfig = mOutbounds[navigationObject.create.outbound];
            navigationObject.create.outboundDetail = {
              semanticObject: outboundConfig.semanticObject,
              action: outboundConfig.action,
              parameters: outboundConfig.parameters
            };
          }
        });
        mViewData = {
          appComponent: oAppComponent,
          navigation: mNavigation,
          viewLevel: oTargetInfo.viewLevel,
          stableId: sStableId,
          contentDensities: (_oManifestContent$sap = oManifestContent["sap.ui5"]) === null || _oManifestContent$sap === void 0 ? void 0 : _oManifestContent$sap.contentDensities,
          resourceModel: oResourceModel,
          fullContextPath: sFullContextPath,
          isDesktop: Device.system.desktop,
          isPhone: Device.system.phone
        };
        if (oComponent.getViewData) {
          var _oManifestContent$sap2, _oManifestContent$sap3, _oManifestContent$sap4, _oManifestContent$sap5, _oManifestContent$sap6;
          Object.assign(mViewData, oComponent.getViewData());
          const actualSettings = (oManifestContent === null || oManifestContent === void 0 ? void 0 : (_oManifestContent$sap2 = oManifestContent["sap.ui5"]) === null || _oManifestContent$sap2 === void 0 ? void 0 : (_oManifestContent$sap3 = _oManifestContent$sap2.routing) === null || _oManifestContent$sap3 === void 0 ? void 0 : (_oManifestContent$sap4 = _oManifestContent$sap3.targets) === null || _oManifestContent$sap4 === void 0 ? void 0 : (_oManifestContent$sap5 = _oManifestContent$sap4[this.pageId]) === null || _oManifestContent$sap5 === void 0 ? void 0 : (_oManifestContent$sap6 = _oManifestContent$sap5.options) === null || _oManifestContent$sap6 === void 0 ? void 0 : _oManifestContent$sap6.settings) || {};
          mViewData = applyPageConfigurationChanges(actualSettings, mViewData, oAppComponent, this.pageId);
        }
        mViewData.isShareButtonVisibleForMyInbox = TemplatedViewServiceFactory.getShareButtonVisibilityForMyInbox(oAppComponent);
        const oShellServices = oAppComponent.getShellServices();
        mViewData.converterType = sConverterType;
        mViewData.shellContentDensity = oShellServices.getContentDensity();
        mViewData.retrieveTextFromValueList = oManifestContent["sap.fe"] && oManifestContent["sap.fe"].form ? oManifestContent["sap.fe"].form.retrieveTextFromValueList : undefined;
        oViewDataModel = new JSONModel(mViewData);
        if (mViewData.controlConfiguration) {
          for (const sAnnotationPath in mViewData.controlConfiguration) {
            if (sAnnotationPath.indexOf("[") !== -1) {
              const sTargetAnnotationPath = resolveDynamicExpression(sAnnotationPath, oMetaModel);
              mViewData.controlConfiguration[sTargetAnnotationPath] = mViewData.controlConfiguration[sAnnotationPath];
            }
          }
        }
        MetaModelConverter.convertTypes(oMetaModel, oAppComponent.getEnvironmentCapabilities().getCapabilities());
        oPageModel = new TemplateModel(() => {
          try {
            const oDiagnostics = oAppComponent.getDiagnostics();
            const iIssueCount = oDiagnostics.getIssues().length;
            const oConverterPageModel = TemplateConverter.convertPage(sConverterType, oMetaModel, mViewData, oDiagnostics, sFullContextPath, oAppComponent.getEnvironmentCapabilities().getCapabilities(), oComponent);
            const aIssues = oDiagnostics.getIssues();
            const aAddedIssues = aIssues.slice(iIssueCount);
            if (aAddedIssues.length > 0) {
              Log.warning("Some issues have been detected in your project, please check the UI5 support assistant rule for sap.fe.core");
            }
            return oConverterPageModel;
          } catch (error) {
            Log.error(error, error);
            return {};
          }
        }, oMetaModel);
        if (!bError) {
          oViewSettings = getViewSettings();
          // Setting the pageModel on the component for potential reuse
          oComponent.setModel(oPageModel, "_pageModel");
          return oComponent.runAsOwner(() => {
            return View.create(oViewSettings).catch(createErrorPage).then(oView => {
              this.oView = oView;
              this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
              this.oView.setModel(oViewDataModel, "viewData");
              oComponent.setAggregation("rootControl", this.oView);
              return sCacheKey;
            }).catch(e => Log.error(e.message, e));
          });
        }
      } catch (error) {
        Log.error(error.message, error);
        throw new Error(`Error while creating view : ${error}`);
      }
    };
    _proto.getView = function getView() {
      return this.oView;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    _proto.exit = function exit() {
      // Deregister global instance
      if (this.oResourceModelService) {
        this.oResourceModelService.destroy();
      }
      if (this.oCacheHandlerService) {
        this.oCacheHandlerService.destroy();
      }
      this.oFactory.removeGlobalInstance();
    };
    return TemplatedViewService;
  }(Service);
  let TemplatedViewServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(TemplatedViewServiceFactory, _ServiceFactory);
    function TemplatedViewServiceFactory() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ServiceFactory.call(this, ...args) || this;
      _this._oInstanceRegistry = {};
      return _this;
    }
    var _proto2 = TemplatedViewServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      TemplatedViewServiceFactory.iCreatingViews++;
      const oTemplatedViewService = new TemplatedViewService(Object.assign({
        factory: this
      }, oServiceContext));
      return oTemplatedViewService.initPromise.then(function () {
        TemplatedViewServiceFactory.iCreatingViews--;
        return oTemplatedViewService;
      });
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance() {
      this._oInstanceRegistry = {};
    }

    /**
     * @description This function checks if the component data specifies the visibility of the 'Share' button and returns true or false based on the visibility
     * @param appComponent Specifies the app component
     * @returns Boolean value as true or false based whether the 'Share' button should be visible or not
     */;
    TemplatedViewServiceFactory.getShareButtonVisibilityForMyInbox = function getShareButtonVisibilityForMyInbox(appComponent) {
      const componentData = appComponent.getComponentData();
      if (componentData !== undefined && componentData.feEnvironment) {
        return componentData.feEnvironment.getShareControlVisibility();
      }
      return undefined;
    };
    TemplatedViewServiceFactory.getNumberOfViewsInCreationState = function getNumberOfViewsInCreationState() {
      return TemplatedViewServiceFactory.iCreatingViews;
    };
    return TemplatedViewServiceFactory;
  }(ServiceFactory);
  return TemplatedViewServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZWRWaWV3U2VydmljZSIsImluaXQiLCJhU2VydmljZURlcGVuZGVuY2llcyIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsIm9BcHBDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJwYWdlSWQiLCJnZXRMb2NhbElkIiwiZ2V0SWQiLCJzU3RhYmxlSWQiLCJnZXRNZXRhZGF0YSIsImdldENvbXBvbmVudE5hbWUiLCJhRW5oYW5jZUkxOG4iLCJnZXRFbmhhbmNlSTE4biIsInNBcHBOYW1lc3BhY2UiLCJvRmFjdG9yeSIsImZhY3RvcnkiLCJpIiwibGVuZ3RoIiwib1Jlc291cmNlTW9kZWwiLCJnZXRNb2RlbCIsImlzQSIsInJlcGxhY2UiLCJzQ2FjaGVJZGVudGlmaWVyIiwiZ2V0TmFtZSIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImdldENvbmZpZ3VyYXRpb24iLCJnZXRMYW5ndWFnZVRhZyIsInB1c2giLCJTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5IiwiZ2V0IiwiY3JlYXRlSW5zdGFuY2UiLCJzY29wZVR5cGUiLCJzZXR0aW5ncyIsImJ1bmRsZXMiLCJlbmhhbmNlSTE4biIsIm1vZGVsTmFtZSIsInRoZW4iLCJvUmVzb3VyY2VNb2RlbFNlcnZpY2UiLCJnZXRSZXNvdXJjZU1vZGVsIiwibWV0YU1vZGVsIiwiYXBwQ29tcG9uZW50IiwiY29tcG9uZW50Iiwib0NhY2hlSGFuZGxlclNlcnZpY2UiLCJ2YWxpZGF0ZUNhY2hlS2V5IiwiVmVyc2lvbkluZm8iLCJsb2FkIiwib0luZm8iLCJzVGltZXN0YW1wIiwibGlicmFyaWVzIiwiYnVpbGRpbmZvIiwiYnVpbGR0aW1lIiwiZm9yRWFjaCIsIm9MaWJyYXJ5IiwiYnVpbGRUaW1lc3RhbXAiLCJjYXRjaCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsImFsbCIsImFEZXBlbmRlbmNpZXNSZXN1bHQiLCJzQ2FjaGVLZXkiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlcyIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImluaXRpYWxpemVTaWRlRWZmZWN0cyIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiVGVtcGxhdGVDb252ZXJ0ZXIiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJyZXF1aXJlRGVwZW5kZW5jaWVzIiwiY3JlYXRlVmlldyIsImdldEluc3RhbmNlIiwiaW52YWxpZGF0ZUlmTmVlZGVkIiwicmVmcmVzaFZpZXciLCJvUm9vdFZpZXciLCJnZXRSb290Q29udHJvbCIsImRlc3Ryb3kiLCJvVmlldyIsInJlc291cmNlTW9kZWwiLCJzdGFibGVJZCIsIm9Db250YWluZXIiLCJpbnZhbGlkYXRlIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJtU2VydmljZVNldHRpbmdzIiwic0NvbnZlcnRlclR5cGUiLCJjb252ZXJ0ZXJUeXBlIiwic0Z1bGxDb250ZXh0UGF0aCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3IiLCJvcHRpb25zIiwiZnVsbENvbnRleHRQYXRoIiwib01hbmlmZXN0Q29udGVudCIsImdldE1hbmlmZXN0Iiwib0RldmljZU1vZGVsIiwiSlNPTk1vZGVsIiwiRGV2aWNlIiwic2V0RGVmYXVsdEJpbmRpbmdNb2RlIiwib01hbmlmZXN0TW9kZWwiLCJiRXJyb3IiLCJvUGFnZU1vZGVsIiwib1ZpZXdEYXRhTW9kZWwiLCJvVmlld1NldHRpbmdzIiwibVZpZXdEYXRhIiwiZ2V0Vmlld1NldHRpbmdzIiwiYVNwbGl0UGF0aCIsInNwbGl0Iiwic0VudGl0eVNldFBhdGgiLCJyZWR1Y2UiLCJzUGF0aFNvRmFyIiwic05leHRQYXRoUGFydCIsIm9UYXJnZXQiLCJnZXRPYmplY3QiLCJPYmplY3QiLCJrZXlzIiwidmlld1R5cGUiLCJnZXRWaWV3VHlwZSIsInVuZGVmaW5lZCIsInR5cGUiLCJwcmVwcm9jZXNzb3JzIiwieG1sIiwiYmluZGluZ0NvbnRleHRzIiwiZW50aXR5U2V0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJjb250ZXh0UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJub1Jlc29sdmUiLCJ2aWV3RGF0YSIsIm1vZGVscyIsImRldmljZSIsIm1hbmlmZXN0IiwiaWQiLCJ2aWV3TmFtZSIsImdldFZpZXdOYW1lIiwiY2FjaGUiLCJhZGRpdGlvbmFsRGF0YSIsImdldEFkZGl0aW9uYWxDYWNoZURhdGEiLCJnZXREYXRhIiwic2V0QWRkaXRpb25hbENhY2hlRGF0YSIsInZhbHVlIiwic2V0RGF0YSIsImhlaWdodCIsImNyZWF0ZUVycm9yUGFnZSIsInJlYXNvbiIsIm1lc3NhZ2UiLCJlcnJvclZpZXdOYW1lIiwicnVuQXNPd25lciIsIlZpZXciLCJjcmVhdGUiLCJzZXRNb2RlbCIsIk1hbmFnZWRPYmplY3RNb2RlbCIsInNldEFnZ3JlZ2F0aW9uIiwib1JvdXRpbmdTZXJ2aWNlIiwiZ2V0U2VydmljZSIsIm9UYXJnZXRJbmZvIiwibU91dGJvdW5kcyIsImNyb3NzTmF2aWdhdGlvbiIsIm91dGJvdW5kcyIsIm1OYXZpZ2F0aW9uIiwiZ2V0TmF2aWdhdGlvbiIsIm5hdmlnYXRpb25PYmplY3RLZXkiLCJuYXZpZ2F0aW9uT2JqZWN0Iiwib3V0Ym91bmRDb25maWciLCJkZXRhaWwiLCJvdXRib3VuZCIsIm91dGJvdW5kRGV0YWlsIiwic2VtYW50aWNPYmplY3QiLCJhY3Rpb24iLCJwYXJhbWV0ZXJzIiwibmF2aWdhdGlvbiIsInZpZXdMZXZlbCIsImNvbnRlbnREZW5zaXRpZXMiLCJpc0Rlc2t0b3AiLCJzeXN0ZW0iLCJkZXNrdG9wIiwiaXNQaG9uZSIsInBob25lIiwiZ2V0Vmlld0RhdGEiLCJhc3NpZ24iLCJhY3R1YWxTZXR0aW5ncyIsInJvdXRpbmciLCJ0YXJnZXRzIiwiYXBwbHlQYWdlQ29uZmlndXJhdGlvbkNoYW5nZXMiLCJpc1NoYXJlQnV0dG9uVmlzaWJsZUZvck15SW5ib3giLCJUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkiLCJnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHlGb3JNeUluYm94Iiwib1NoZWxsU2VydmljZXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2hlbGxDb250ZW50RGVuc2l0eSIsImdldENvbnRlbnREZW5zaXR5IiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImZvcm0iLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNBbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJzVGFyZ2V0QW5ub3RhdGlvblBhdGgiLCJyZXNvbHZlRHluYW1pY0V4cHJlc3Npb24iLCJjb252ZXJ0VHlwZXMiLCJUZW1wbGF0ZU1vZGVsIiwib0RpYWdub3N0aWNzIiwiZ2V0RGlhZ25vc3RpY3MiLCJpSXNzdWVDb3VudCIsImdldElzc3VlcyIsIm9Db252ZXJ0ZXJQYWdlTW9kZWwiLCJjb252ZXJ0UGFnZSIsImFJc3N1ZXMiLCJhQWRkZWRJc3N1ZXMiLCJzbGljZSIsIndhcm5pbmciLCJlIiwiRXJyb3IiLCJnZXRWaWV3IiwiZ2V0SW50ZXJmYWNlIiwiZXhpdCIsInJlbW92ZUdsb2JhbEluc3RhbmNlIiwiU2VydmljZSIsIl9vSW5zdGFuY2VSZWdpc3RyeSIsIm9TZXJ2aWNlQ29udGV4dCIsImlDcmVhdGluZ1ZpZXdzIiwib1RlbXBsYXRlZFZpZXdTZXJ2aWNlIiwiY29tcG9uZW50RGF0YSIsImdldENvbXBvbmVudERhdGEiLCJmZUVudmlyb25tZW50IiwiZ2V0U2hhcmVDb250cm9sVmlzaWJpbGl0eSIsImdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB0eXBlIHsgQ29tcG9uZW50RGF0YSwgTWFuaWZlc3RDb250ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgeyBDb250ZW50RGVuc2l0aWVzVHlwZSwgQ29udHJvbENvbmZpZ3VyYXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyByZXF1aXJlRGVwZW5kZW5jaWVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTG9hZGVyVXRpbHNcIjtcbmltcG9ydCB7IGFwcGx5UGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzIH0gZnJvbSBcInNhcC9mZS9jb3JlL21hbmlmZXN0TWVyZ2VyL0NoYW5nZVBhZ2VDb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBDYWNoZUhhbmRsZXJTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0NhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlSZWdpc3RyeVwiO1xuaW1wb3J0IERldmljZSBmcm9tIFwic2FwL3VpL0RldmljZVwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3RNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2Jhc2UvTWFuYWdlZE9iamVjdE1vZGVsXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCBWZXJzaW9uSW5mbyBmcm9tIFwic2FwL3VpL1ZlcnNpb25JbmZvXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuaW1wb3J0IHsgcmVzb2x2ZUR5bmFtaWNFeHByZXNzaW9uIH0gZnJvbSBcIi4uL2hlbHBlcnMvRHluYW1pY0Fubm90YXRpb25QYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFJlc291cmNlTW9kZWxTZXJ2aWNlIH0gZnJvbSBcIi4vUmVzb3VyY2VNb2RlbFNlcnZpY2VGYWN0b3J5XCI7XG5cbnR5cGUgVGVtcGxhdGVkVmlld1NlcnZpY2VTZXR0aW5ncyA9IHt9O1xuZXhwb3J0IHR5cGUgVmlld0RhdGEgPSB7XG5cdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50O1xuXHRuYXZpZ2F0aW9uOiBvYmplY3Q7XG5cdHZpZXdMZXZlbDogbnVtYmVyO1xuXHRzdGFibGVJZDogc3RyaW5nO1xuXHRjb250ZW50RGVuc2l0aWVzPzogQ29udGVudERlbnNpdGllc1R5cGU7XG5cdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWw7XG5cdGZ1bGxDb250ZXh0UGF0aDogc3RyaW5nO1xuXHRpc0Rlc2t0b3A6IGJvb2xlYW47XG5cdGlzUGhvbmU6IGJvb2xlYW47XG5cdGNvbnZlcnRlclR5cGU/OiBzdHJpbmc7XG5cdHNoZWxsQ29udGVudERlbnNpdHk/OiBzdHJpbmc7XG5cdHVzZU5ld0xhenlMb2FkaW5nPzogYm9vbGVhbjtcblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdD86IGJvb2xlYW47XG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdGVudGl0eVNldD86IHN0cmluZztcblx0aXNTaGFyZUJ1dHRvblZpc2libGVGb3JNeUluYm94PzogYm9vbGVhbjtcbn07XG5cbmNsYXNzIFRlbXBsYXRlZFZpZXdTZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzPiB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXG5cdG9WaWV3ITogVmlldztcblxuXHRvUmVzb3VyY2VNb2RlbFNlcnZpY2UhOiBSZXNvdXJjZU1vZGVsU2VydmljZTtcblxuXHRvQ2FjaGVIYW5kbGVyU2VydmljZSE6IENhY2hlSGFuZGxlclNlcnZpY2U7XG5cblx0b0ZhY3RvcnkhOiBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3Rvcnk7XG5cblx0cmVzb3VyY2VNb2RlbCE6IFJlc291cmNlTW9kZWw7XG5cblx0c3RhYmxlSWQhOiBzdHJpbmc7XG5cblx0cGFnZUlkITogc3RyaW5nO1xuXG5cdFRlbXBsYXRlQ29udmVydGVyOiBhbnk7XG5cblx0TWV0YU1vZGVsQ29udmVydGVyOiBhbnk7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBhU2VydmljZURlcGVuZGVuY2llcyA9IFtdO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbXBvbmVudCkgYXMgQXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdHRoaXMucGFnZUlkID0gb0FwcENvbXBvbmVudC5nZXRMb2NhbElkKG9Db21wb25lbnQuZ2V0SWQoKSkgYXMgc3RyaW5nO1xuXHRcdGNvbnN0IHNTdGFibGVJZCA9IGAke29BcHBDb21wb25lbnQuZ2V0TWV0YWRhdGEoKS5nZXRDb21wb25lbnROYW1lKCl9Ojoke3RoaXMucGFnZUlkfWA7XG5cdFx0Y29uc3QgYUVuaGFuY2VJMThuID0gb0NvbXBvbmVudC5nZXRFbmhhbmNlSTE4bigpIHx8IFtdO1xuXHRcdGxldCBzQXBwTmFtZXNwYWNlO1xuXHRcdHRoaXMub0ZhY3RvcnkgPSBvQ29udGV4dC5mYWN0b3J5O1xuXHRcdGlmIChhRW5oYW5jZUkxOG4pIHtcblx0XHRcdHNBcHBOYW1lc3BhY2UgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhKCkuZ2V0Q29tcG9uZW50TmFtZSgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhRW5oYW5jZUkxOG4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gSW4gb3JkZXIgdG8gc3VwcG9ydCB0ZXh0LXZlcnRpY2FsaXphdGlvbiBhcHBsaWNhdGlvbnMgY2FuIGFsc28gcGFzc3MgYSByZXNvdXJjZSBtb2RlbCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBVSTUgdGFrZXMgY2FyZSBvZiB0ZXh0LXZlcnRpY2FsaXphdGlvbiBmb3IgcmVzb3VyY2UgbW9kZWxzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG5cdFx0XHRcdC8vIEhlbmNlIGNoZWNrIGlmIHRoZSBnaXZlbiBrZXkgaXMgYSByZXNvdXJjZSBtb2RlbCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBpZiBzbyB0aGlzIG1vZGVsIHNob3VsZCBiZSB1c2VkIHRvIGVuaGFuY2UgdGhlIHNhcC5mZSByZXNvdXJjZSBtb2RlbCBzbyBwYXNzIGl0IGFzIGl0IGlzXG5cdFx0XHRcdGNvbnN0IG9SZXNvdXJjZU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNb2RlbChhRW5oYW5jZUkxOG5baV0pO1xuXHRcdFx0XHRpZiAob1Jlc291cmNlTW9kZWwgJiYgb1Jlc291cmNlTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLnJlc291cmNlLlJlc291cmNlTW9kZWxcIikpIHtcblx0XHRcdFx0XHRhRW5oYW5jZUkxOG5baV0gPSBvUmVzb3VyY2VNb2RlbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRW5oYW5jZUkxOG5baV0gPSBgJHtzQXBwTmFtZXNwYWNlfS4ke2FFbmhhbmNlSTE4bltpXS5yZXBsYWNlKFwiLnByb3BlcnRpZXNcIiwgXCJcIil9YDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHNDYWNoZUlkZW50aWZpZXIgPSBgJHtvQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpfV8ke3NTdGFibGVJZH1fJHtzYXAudWlcblx0XHRcdC5nZXRDb3JlKClcblx0XHRcdC5nZXRDb25maWd1cmF0aW9uKClcblx0XHRcdC5nZXRMYW5ndWFnZVRhZygpfWA7XG5cdFx0YVNlcnZpY2VEZXBlbmRlbmNpZXMucHVzaChcblx0XHRcdFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkuZ2V0KFwic2FwLmZlLmNvcmUuc2VydmljZXMuUmVzb3VyY2VNb2RlbFNlcnZpY2VcIilcblx0XHRcdFx0LmNyZWF0ZUluc3RhbmNlKHtcblx0XHRcdFx0XHRzY29wZVR5cGU6IFwiY29tcG9uZW50XCIsXG5cdFx0XHRcdFx0c2NvcGVPYmplY3Q6IG9Db21wb25lbnQsXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdGJ1bmRsZXM6IFtcInNhcC5mZS5jb3JlLm1lc3NhZ2VidW5kbGVcIiwgXCJzYXAuZmUubWFjcm9zLm1lc3NhZ2VidW5kbGVcIiwgXCJzYXAuZmUudGVtcGxhdGVzLm1lc3NhZ2VidW5kbGVcIl0sXG5cdFx0XHRcdFx0XHRlbmhhbmNlSTE4bjogYUVuaGFuY2VJMThuLFxuXHRcdFx0XHRcdFx0bW9kZWxOYW1lOiBcInNhcC5mZS5pMThuXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChvUmVzb3VyY2VNb2RlbFNlcnZpY2U6IFJlc291cmNlTW9kZWxTZXJ2aWNlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vUmVzb3VyY2VNb2RlbFNlcnZpY2UgPSBvUmVzb3VyY2VNb2RlbFNlcnZpY2U7XG5cdFx0XHRcdFx0cmV0dXJuIG9SZXNvdXJjZU1vZGVsU2VydmljZS5nZXRSZXNvdXJjZU1vZGVsKCk7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdGFTZXJ2aWNlRGVwZW5kZW5jaWVzLnB1c2goXG5cdFx0XHRTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LmdldChcInNhcC5mZS5jb3JlLnNlcnZpY2VzLkNhY2hlSGFuZGxlclNlcnZpY2VcIilcblx0XHRcdFx0LmNyZWF0ZUluc3RhbmNlKHtcblx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50OiBvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0Y29tcG9uZW50OiBvQ29tcG9uZW50XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigob0NhY2hlSGFuZGxlclNlcnZpY2U6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMub0NhY2hlSGFuZGxlclNlcnZpY2UgPSBvQ2FjaGVIYW5kbGVyU2VydmljZTtcblx0XHRcdFx0XHRyZXR1cm4gb0NhY2hlSGFuZGxlclNlcnZpY2UudmFsaWRhdGVDYWNoZUtleShzQ2FjaGVJZGVudGlmaWVyLCBvQ29tcG9uZW50KTtcblx0XHRcdFx0fSlcblx0XHQpO1xuXHRcdGFTZXJ2aWNlRGVwZW5kZW5jaWVzLnB1c2goXG5cdFx0XHQoVmVyc2lvbkluZm8gYXMgYW55KVxuXHRcdFx0XHQubG9hZCgpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvSW5mbzogYW55KSB7XG5cdFx0XHRcdFx0bGV0IHNUaW1lc3RhbXAgPSBcIlwiO1xuXHRcdFx0XHRcdGlmICghb0luZm8ubGlicmFyaWVzKSB7XG5cdFx0XHRcdFx0XHRzVGltZXN0YW1wID0gKHNhcC51aSBhcyBhbnkpLmJ1aWxkaW5mby5idWlsZHRpbWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9JbmZvLmxpYnJhcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChvTGlicmFyeTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHNUaW1lc3RhbXAgKz0gb0xpYnJhcnkuYnVpbGRUaW1lc3RhbXA7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHNUaW1lc3RhbXA7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiPE5PVkFMVUU+XCI7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLmFsbChhU2VydmljZURlcGVuZGVuY2llcylcblx0XHRcdC50aGVuKGFzeW5jIChhRGVwZW5kZW5jaWVzUmVzdWx0OiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VNb2RlbCA9IGFEZXBlbmRlbmNpZXNSZXN1bHRbMF0gYXMgUmVzb3VyY2VNb2RlbDtcblx0XHRcdFx0Y29uc3Qgc0NhY2hlS2V5ID0gYURlcGVuZGVuY2llc1Jlc3VsdFsxXTtcblx0XHRcdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdFx0XHRvU2lkZUVmZmVjdHNTZXJ2aWNlcy5pbml0aWFsaXplU2lkZUVmZmVjdHMob0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpKTtcblxuXHRcdFx0XHRjb25zdCBbVGVtcGxhdGVDb252ZXJ0ZXIsIE1ldGFNb2RlbENvbnZlcnRlcl0gPSBhd2FpdCByZXF1aXJlRGVwZW5kZW5jaWVzKFtcblx0XHRcdFx0XHRcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvVGVtcGxhdGVDb252ZXJ0ZXJcIixcblx0XHRcdFx0XHRcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCJcblx0XHRcdFx0XSk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZVZpZXcob1Jlc291cmNlTW9kZWwsIHNTdGFibGVJZCwgc0NhY2hlS2V5LCBUZW1wbGF0ZUNvbnZlcnRlciwgTWV0YU1vZGVsQ29udmVydGVyKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoc0NhY2hlS2V5OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgb0NhY2hlSGFuZGxlclNlcnZpY2UgPSBTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LmdldChcInNhcC5mZS5jb3JlLnNlcnZpY2VzLkNhY2hlSGFuZGxlclNlcnZpY2VcIikuZ2V0SW5zdGFuY2Uob01ldGFNb2RlbCk7XG5cdFx0XHRcdG9DYWNoZUhhbmRsZXJTZXJ2aWNlLmludmFsaWRhdGVJZk5lZWRlZChzQ2FjaGVLZXksIHNDYWNoZUlkZW50aWZpZXIsIG9Db21wb25lbnQpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVmcmVzaCB0aGUgY3VycmVudCB2aWV3IHVzaW5nIHRoZSBzYW1lIGNvbmZpZ3VyYXRpb24gYXMgYmVmb3JlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbXBvbmVudFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgaW5kaWNhdGluZyB3aGVuIHRoZSB2aWV3IGlzIHJlZnJlc2hlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cmVmcmVzaFZpZXcob0NvbXBvbmVudDogYW55KSB7XG5cdFx0Y29uc3Qgb1Jvb3RWaWV3ID0gb0NvbXBvbmVudC5nZXRSb290Q29udHJvbCgpO1xuXHRcdGlmIChvUm9vdFZpZXcpIHtcblx0XHRcdG9Sb290Vmlldy5kZXN0cm95KCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLm9WaWV3KSB7XG5cdFx0XHR0aGlzLm9WaWV3LmRlc3Ryb3koKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuY3JlYXRlVmlldyh0aGlzLnJlc291cmNlTW9kZWwsIHRoaXMuc3RhYmxlSWQsIFwiXCIsIHRoaXMuVGVtcGxhdGVDb252ZXJ0ZXIsIHRoaXMuTWV0YU1vZGVsQ29udmVydGVyKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvQ29tcG9uZW50Lm9Db250YWluZXIuaW52YWxpZGF0ZSgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0b0NvbXBvbmVudC5vQ29udGFpbmVyLmludmFsaWRhdGUoKTtcblx0XHRcdFx0TG9nLmVycm9yKG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIGNyZWF0ZVZpZXcoXG5cdFx0b1Jlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdFx0c1N0YWJsZUlkOiBhbnksXG5cdFx0c0NhY2hlS2V5OiBhbnksXG5cdFx0VGVtcGxhdGVDb252ZXJ0ZXI6IGFueSxcblx0XHRNZXRhTW9kZWxDb252ZXJ0ZXI6IGFueVxuXHQpOiBQcm9taXNlPGFueSB8IHZvaWQ+IHtcblx0XHR0aGlzLnJlc291cmNlTW9kZWwgPSBvUmVzb3VyY2VNb2RlbDsgLy8gVE9ETzogZ2V0IHJpZCwga2VwdCBpdCBmb3IgdGhlIHRpbWUgYmVpbmdcblx0XHR0aGlzLnN0YWJsZUlkID0gc1N0YWJsZUlkO1xuXHRcdHRoaXMuVGVtcGxhdGVDb252ZXJ0ZXIgPSBUZW1wbGF0ZUNvbnZlcnRlcjtcblx0XHR0aGlzLk1ldGFNb2RlbENvbnZlcnRlciA9IE1ldGFNb2RlbENvbnZlcnRlcjtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG1TZXJ2aWNlU2V0dGluZ3MgPSBvQ29udGV4dC5zZXR0aW5ncztcblx0XHRjb25zdCBzQ29udmVydGVyVHlwZSA9IG1TZXJ2aWNlU2V0dGluZ3MuY29udmVydGVyVHlwZTtcblx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbnRleHQuc2NvcGVPYmplY3Q7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRjb25zdCBzRnVsbENvbnRleHRQYXRoID0gb0FwcENvbXBvbmVudC5nZXRSb3V0aW5nU2VydmljZSgpLmdldFRhcmdldEluZm9ybWF0aW9uRm9yKG9Db21wb25lbnQpLm9wdGlvbnMuc2V0dGluZ3MuZnVsbENvbnRleHRQYXRoO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IG9NYW5pZmVzdENvbnRlbnQ6IE1hbmlmZXN0Q29udGVudCA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKTtcblx0XHRjb25zdCBvRGV2aWNlTW9kZWwgPSBuZXcgSlNPTk1vZGVsKERldmljZSkuc2V0RGVmYXVsdEJpbmRpbmdNb2RlKFwiT25lV2F5XCIpO1xuXHRcdGNvbnN0IG9NYW5pZmVzdE1vZGVsID0gbmV3IEpTT05Nb2RlbChvTWFuaWZlc3RDb250ZW50KTtcblx0XHRjb25zdCBiRXJyb3IgPSBmYWxzZTtcblx0XHRsZXQgb1BhZ2VNb2RlbDogVGVtcGxhdGVNb2RlbCwgb1ZpZXdEYXRhTW9kZWw6IE1vZGVsLCBvVmlld1NldHRpbmdzOiBhbnksIG1WaWV3RGF0YTogVmlld0RhdGE7XG5cblx0XHQvLyBMb2FkIHRoZSBpbmRleCBmb3IgdGhlIGFkZGl0aW9uYWwgYnVpbGRpbmcgYmxvY2tzIHdoaWNoIGlzIHJlc3BvbnNpYmxlIGZvciBpbml0aWFsaXppbmcgdGhlbVxuXHRcdGZ1bmN0aW9uIGdldFZpZXdTZXR0aW5ncygpIHtcblx0XHRcdGNvbnN0IGFTcGxpdFBhdGggPSBzRnVsbENvbnRleHRQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gYVNwbGl0UGF0aC5yZWR1Y2UoZnVuY3Rpb24gKHNQYXRoU29GYXI6IGFueSwgc05leHRQYXRoUGFydDogYW55KSB7XG5cdFx0XHRcdGlmIChzTmV4dFBhdGhQYXJ0ID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNQYXRoU29GYXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNQYXRoU29GYXIgPT09IFwiXCIpIHtcblx0XHRcdFx0XHRzUGF0aFNvRmFyID0gYC8ke3NOZXh0UGF0aFBhcnR9YDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGhTb0Zhcn0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHtzTmV4dFBhdGhQYXJ0fWApO1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0ICYmIE9iamVjdC5rZXlzKG9UYXJnZXQpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdHNQYXRoU29GYXIgKz0gXCIvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c1BhdGhTb0ZhciArPSBgLyR7c05leHRQYXRoUGFydH1gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzUGF0aFNvRmFyO1xuXHRcdFx0fSwgXCJcIik7XG5cdFx0XHRsZXQgdmlld1R5cGUgPSBtU2VydmljZVNldHRpbmdzLnZpZXdUeXBlIHx8IG9Db21wb25lbnQuZ2V0Vmlld1R5cGUoKSB8fCBcIlhNTFwiO1xuXHRcdFx0aWYgKHZpZXdUeXBlICE9PSBcIlhNTFwiKSB7XG5cdFx0XHRcdHZpZXdUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogdmlld1R5cGUsXG5cdFx0XHRcdHByZXByb2Nlc3NvcnM6IHtcblx0XHRcdFx0XHR4bWw6IHtcblx0XHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IHNFbnRpdHlTZXRQYXRoID8gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRW50aXR5U2V0UGF0aCkgOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRmdWxsQ29udGV4dFBhdGg6IHNGdWxsQ29udGV4dFBhdGggPyBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNGdWxsQ29udGV4dFBhdGgpIDogbnVsbCxcblx0XHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IHNGdWxsQ29udGV4dFBhdGggPyBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNGdWxsQ29udGV4dFBhdGgpIDogbnVsbCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogb1BhZ2VNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiwgdW5kZWZpbmVkLCB7IG5vUmVzb2x2ZTogdHJ1ZSB9KSxcblx0XHRcdFx0XHRcdFx0dmlld0RhdGE6IG1WaWV3RGF0YSA/IG9WaWV3RGF0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSA6IG51bGxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRmdWxsQ29udGV4dFBhdGg6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcInNhcC5mZS5pMThuXCI6IG9SZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGRldmljZTogb0RldmljZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRtYW5pZmVzdDogb01hbmlmZXN0TW9kZWwsXG5cdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IG9QYWdlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdHZpZXdEYXRhOiBvVmlld0RhdGFNb2RlbFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGFwcENvbXBvbmVudDogb0FwcENvbXBvbmVudFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0aWQ6IHNTdGFibGVJZCxcblx0XHRcdFx0dmlld05hbWU6IG1TZXJ2aWNlU2V0dGluZ3Mudmlld05hbWUgfHwgb0NvbXBvbmVudC5nZXRWaWV3TmFtZSgpLFxuXHRcdFx0XHR2aWV3RGF0YTogbVZpZXdEYXRhLFxuXHRcdFx0XHRjYWNoZToge1xuXHRcdFx0XHRcdGtleXM6IFtzQ2FjaGVLZXldLFxuXHRcdFx0XHRcdGFkZGl0aW9uYWxEYXRhOiB7XG5cdFx0XHRcdFx0XHQvLyBXZSBzdG9yZSB0aGUgcGFnZSBtb2RlbCBkYXRhIGluIHRoZSBgYWRkaXRpb25hbERhdGFgIG9mIHRoZSB2aWV3IGNhY2hlLCB0aGlzIHdheSBpdCBpcyBhbHdheXMgaW4gc3luY1xuXHRcdFx0XHRcdFx0Z2V0QWRkaXRpb25hbENhY2hlRGF0YTogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gKG9QYWdlTW9kZWwgYXMgdW5rbm93biBhcyBKU09OTW9kZWwpLmdldERhdGEoKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRzZXRBZGRpdGlvbmFsQ2FjaGVEYXRhOiAodmFsdWU6IG9iamVjdCkgPT4ge1xuXHRcdFx0XHRcdFx0XHQob1BhZ2VNb2RlbCBhcyB1bmtub3duIGFzIEpTT05Nb2RlbCkuc2V0RGF0YSh2YWx1ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcInNhcC5mZS5pMThuXCI6IG9SZXNvdXJjZU1vZGVsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlaWdodDogXCIxMDAlXCJcblx0XHRcdH07XG5cdFx0fVxuXHRcdGNvbnN0IGNyZWF0ZUVycm9yUGFnZSA9IChyZWFzb246IGFueSkgPT4ge1xuXHRcdFx0Ly8ganVzdCByZXBsYWNlIHRoZSB2aWV3IG5hbWUgYW5kIGFkZCBhbiBhZGRpdGlvbmFsIG1vZGVsIGNvbnRhaW5pbmcgdGhlIHJlYXNvbiwgYnV0XG5cdFx0XHQvLyBrZWVwIHRoZSBvdGhlciBzZXR0aW5nc1xuXHRcdFx0TG9nLmVycm9yKHJlYXNvbi5tZXNzYWdlLCByZWFzb24pO1xuXHRcdFx0b1ZpZXdTZXR0aW5ncy52aWV3TmFtZSA9IG1TZXJ2aWNlU2V0dGluZ3MuZXJyb3JWaWV3TmFtZSB8fCBcInNhcC5mZS5jb3JlLnNlcnZpY2VzLnZpZXcuVGVtcGxhdGluZ0Vycm9yUGFnZVwiO1xuXHRcdFx0b1ZpZXdTZXR0aW5ncy5wcmVwcm9jZXNzb3JzLnhtbC5tb2RlbHNbXCJlcnJvclwiXSA9IG5ldyBKU09OTW9kZWwocmVhc29uKTtcblxuXHRcdFx0cmV0dXJuIG9Db21wb25lbnQucnVuQXNPd25lcigoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBWaWV3LmNyZWF0ZShvVmlld1NldHRpbmdzKS50aGVuKChvVmlldzogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vVmlldyA9IG9WaWV3O1xuXHRcdFx0XHRcdHRoaXMub1ZpZXcuc2V0TW9kZWwobmV3IE1hbmFnZWRPYmplY3RNb2RlbCh0aGlzLm9WaWV3KSwgXCIkdmlld1wiKTtcblx0XHRcdFx0XHRvQ29tcG9uZW50LnNldEFnZ3JlZ2F0aW9uKFwicm9vdENvbnRyb2xcIiwgdGhpcy5vVmlldyk7XG5cdFx0XHRcdFx0cmV0dXJuIHNDYWNoZUtleTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG9Sb3V0aW5nU2VydmljZSA9IGF3YWl0IG9BcHBDb21wb25lbnQuZ2V0U2VydmljZShcInJvdXRpbmdTZXJ2aWNlXCIpO1xuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIHZpZXdMZXZlbCBmb3IgdGhlIGNvbXBvbmVudFxuXHRcdFx0Y29uc3Qgb1RhcmdldEluZm8gPSBvUm91dGluZ1NlcnZpY2UuZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3Iob0NvbXBvbmVudCk7XG5cdFx0XHRjb25zdCBtT3V0Ym91bmRzID1cblx0XHRcdFx0KG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuYXBwXCJdICYmXG5cdFx0XHRcdFx0b01hbmlmZXN0Q29udGVudFtcInNhcC5hcHBcIl0uY3Jvc3NOYXZpZ2F0aW9uICYmXG5cdFx0XHRcdFx0b01hbmlmZXN0Q29udGVudFtcInNhcC5hcHBcIl0uY3Jvc3NOYXZpZ2F0aW9uLm91dGJvdW5kcykgfHxcblx0XHRcdFx0e307XG5cdFx0XHRjb25zdCBtTmF2aWdhdGlvbiA9IG9Db21wb25lbnQuZ2V0TmF2aWdhdGlvbigpIHx8IHt9O1xuXHRcdFx0T2JqZWN0LmtleXMobU5hdmlnYXRpb24pLmZvckVhY2goZnVuY3Rpb24gKG5hdmlnYXRpb25PYmplY3RLZXk6IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uT2JqZWN0ID0gbU5hdmlnYXRpb25bbmF2aWdhdGlvbk9iamVjdEtleV07XG5cdFx0XHRcdGxldCBvdXRib3VuZENvbmZpZztcblx0XHRcdFx0aWYgKG5hdmlnYXRpb25PYmplY3QuZGV0YWlsICYmIG5hdmlnYXRpb25PYmplY3QuZGV0YWlsLm91dGJvdW5kICYmIG1PdXRib3VuZHNbbmF2aWdhdGlvbk9iamVjdC5kZXRhaWwub3V0Ym91bmRdKSB7XG5cdFx0XHRcdFx0b3V0Ym91bmRDb25maWcgPSBtT3V0Ym91bmRzW25hdmlnYXRpb25PYmplY3QuZGV0YWlsLm91dGJvdW5kXTtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uT2JqZWN0LmRldGFpbC5vdXRib3VuZERldGFpbCA9IHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvdXRib3VuZENvbmZpZy5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb3V0Ym91bmRDb25maWcuYWN0aW9uLFxuXHRcdFx0XHRcdFx0cGFyYW1ldGVyczogb3V0Ym91bmRDb25maWcucGFyYW1ldGVyc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG5hdmlnYXRpb25PYmplY3QuY3JlYXRlICYmIG5hdmlnYXRpb25PYmplY3QuY3JlYXRlLm91dGJvdW5kICYmIG1PdXRib3VuZHNbbmF2aWdhdGlvbk9iamVjdC5jcmVhdGUub3V0Ym91bmRdKSB7XG5cdFx0XHRcdFx0b3V0Ym91bmRDb25maWcgPSBtT3V0Ym91bmRzW25hdmlnYXRpb25PYmplY3QuY3JlYXRlLm91dGJvdW5kXTtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uT2JqZWN0LmNyZWF0ZS5vdXRib3VuZERldGFpbCA9IHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvdXRib3VuZENvbmZpZy5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb3V0Ym91bmRDb25maWcuYWN0aW9uLFxuXHRcdFx0XHRcdFx0cGFyYW1ldGVyczogb3V0Ym91bmRDb25maWcucGFyYW1ldGVyc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRtVmlld0RhdGEgPSB7XG5cdFx0XHRcdGFwcENvbXBvbmVudDogb0FwcENvbXBvbmVudCxcblx0XHRcdFx0bmF2aWdhdGlvbjogbU5hdmlnYXRpb24sXG5cdFx0XHRcdHZpZXdMZXZlbDogb1RhcmdldEluZm8udmlld0xldmVsLFxuXHRcdFx0XHRzdGFibGVJZDogc1N0YWJsZUlkLFxuXHRcdFx0XHRjb250ZW50RGVuc2l0aWVzOiBvTWFuaWZlc3RDb250ZW50W1wic2FwLnVpNVwiXT8uY29udGVudERlbnNpdGllcyxcblx0XHRcdFx0cmVzb3VyY2VNb2RlbDogb1Jlc291cmNlTW9kZWwsXG5cdFx0XHRcdGZ1bGxDb250ZXh0UGF0aDogc0Z1bGxDb250ZXh0UGF0aCxcblx0XHRcdFx0aXNEZXNrdG9wOiAoRGV2aWNlIGFzIGFueSkuc3lzdGVtLmRlc2t0b3AsXG5cdFx0XHRcdGlzUGhvbmU6IChEZXZpY2UgYXMgYW55KS5zeXN0ZW0ucGhvbmVcblx0XHRcdH07XG5cblx0XHRcdGlmIChvQ29tcG9uZW50LmdldFZpZXdEYXRhKSB7XG5cdFx0XHRcdE9iamVjdC5hc3NpZ24obVZpZXdEYXRhLCBvQ29tcG9uZW50LmdldFZpZXdEYXRhKCkpO1xuXG5cdFx0XHRcdGNvbnN0IGFjdHVhbFNldHRpbmdzID0gb01hbmlmZXN0Q29udGVudD8uW1wic2FwLnVpNVwiXT8ucm91dGluZz8udGFyZ2V0cz8uW3RoaXMucGFnZUlkXT8ub3B0aW9ucz8uc2V0dGluZ3MgfHwge307XG5cdFx0XHRcdG1WaWV3RGF0YSA9IGFwcGx5UGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzKGFjdHVhbFNldHRpbmdzLCBtVmlld0RhdGEsIG9BcHBDb21wb25lbnQsIHRoaXMucGFnZUlkKTtcblx0XHRcdH1cblxuXHRcdFx0bVZpZXdEYXRhLmlzU2hhcmVCdXR0b25WaXNpYmxlRm9yTXlJbmJveCA9IFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5nZXRTaGFyZUJ1dHRvblZpc2liaWxpdHlGb3JNeUluYm94KG9BcHBDb21wb25lbnQpO1xuXHRcdFx0Y29uc3Qgb1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRcdG1WaWV3RGF0YS5jb252ZXJ0ZXJUeXBlID0gc0NvbnZlcnRlclR5cGU7XG5cdFx0XHRtVmlld0RhdGEuc2hlbGxDb250ZW50RGVuc2l0eSA9IG9TaGVsbFNlcnZpY2VzLmdldENvbnRlbnREZW5zaXR5KCk7XG5cdFx0XHRtVmlld0RhdGEucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA9XG5cdFx0XHRcdG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuZmVcIl0gJiYgb01hbmlmZXN0Q29udGVudFtcInNhcC5mZVwiXS5mb3JtXG5cdFx0XHRcdFx0PyBvTWFuaWZlc3RDb250ZW50W1wic2FwLmZlXCJdLmZvcm0ucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0b1ZpZXdEYXRhTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1WaWV3RGF0YSk7XG5cdFx0XHRpZiAobVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uKSB7XG5cdFx0XHRcdGZvciAoY29uc3Qgc0Fubm90YXRpb25QYXRoIGluIG1WaWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0XHRcdGlmIChzQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIltcIikgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzVGFyZ2V0QW5ub3RhdGlvblBhdGggPSByZXNvbHZlRHluYW1pY0V4cHJlc3Npb24oc0Fubm90YXRpb25QYXRoLCBvTWV0YU1vZGVsKTtcblx0XHRcdFx0XHRcdG1WaWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbltzVGFyZ2V0QW5ub3RhdGlvblBhdGhdID0gbVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uW3NBbm5vdGF0aW9uUGF0aF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRNZXRhTW9kZWxDb252ZXJ0ZXIuY29udmVydFR5cGVzKG9NZXRhTW9kZWwsIG9BcHBDb21wb25lbnQuZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKS5nZXRDYXBhYmlsaXRpZXMoKSk7XG5cdFx0XHRvUGFnZU1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwoKCkgPT4ge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9EaWFnbm9zdGljcyA9IG9BcHBDb21wb25lbnQuZ2V0RGlhZ25vc3RpY3MoKTtcblx0XHRcdFx0XHRjb25zdCBpSXNzdWVDb3VudCA9IG9EaWFnbm9zdGljcy5nZXRJc3N1ZXMoKS5sZW5ndGg7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnZlcnRlclBhZ2VNb2RlbCA9IFRlbXBsYXRlQ29udmVydGVyLmNvbnZlcnRQYWdlKFxuXHRcdFx0XHRcdFx0c0NvbnZlcnRlclR5cGUsXG5cdFx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0bVZpZXdEYXRhLFxuXHRcdFx0XHRcdFx0b0RpYWdub3N0aWNzLFxuXHRcdFx0XHRcdFx0c0Z1bGxDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMoKS5nZXRDYXBhYmlsaXRpZXMoKSxcblx0XHRcdFx0XHRcdG9Db21wb25lbnRcblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0Y29uc3QgYUlzc3VlcyA9IG9EaWFnbm9zdGljcy5nZXRJc3N1ZXMoKTtcblx0XHRcdFx0XHRjb25zdCBhQWRkZWRJc3N1ZXMgPSBhSXNzdWVzLnNsaWNlKGlJc3N1ZUNvdW50KTtcblx0XHRcdFx0XHRpZiAoYUFkZGVkSXNzdWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFx0XHRcIlNvbWUgaXNzdWVzIGhhdmUgYmVlbiBkZXRlY3RlZCBpbiB5b3VyIHByb2plY3QsIHBsZWFzZSBjaGVjayB0aGUgVUk1IHN1cHBvcnQgYXNzaXN0YW50IHJ1bGUgZm9yIHNhcC5mZS5jb3JlXCJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvQ29udmVydGVyUGFnZU1vZGVsO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBhbnksIGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdFx0cmV0dXJuIHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9LCBvTWV0YU1vZGVsKTtcblxuXHRcdFx0aWYgKCFiRXJyb3IpIHtcblx0XHRcdFx0b1ZpZXdTZXR0aW5ncyA9IGdldFZpZXdTZXR0aW5ncygpO1xuXHRcdFx0XHQvLyBTZXR0aW5nIHRoZSBwYWdlTW9kZWwgb24gdGhlIGNvbXBvbmVudCBmb3IgcG90ZW50aWFsIHJldXNlXG5cdFx0XHRcdG9Db21wb25lbnQuc2V0TW9kZWwob1BhZ2VNb2RlbCwgXCJfcGFnZU1vZGVsXCIpO1xuXHRcdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5ydW5Bc093bmVyKCgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gVmlldy5jcmVhdGUob1ZpZXdTZXR0aW5ncylcblx0XHRcdFx0XHRcdC5jYXRjaChjcmVhdGVFcnJvclBhZ2UpXG5cdFx0XHRcdFx0XHQudGhlbigob1ZpZXc6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHR0aGlzLm9WaWV3ID0gb1ZpZXc7XG5cdFx0XHRcdFx0XHRcdHRoaXMub1ZpZXcuc2V0TW9kZWwobmV3IE1hbmFnZWRPYmplY3RNb2RlbCh0aGlzLm9WaWV3KSwgXCIkdmlld1wiKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5vVmlldy5zZXRNb2RlbChvVmlld0RhdGFNb2RlbCwgXCJ2aWV3RGF0YVwiKTtcblx0XHRcdFx0XHRcdFx0b0NvbXBvbmVudC5zZXRBZ2dyZWdhdGlvbihcInJvb3RDb250cm9sXCIsIHRoaXMub1ZpZXcpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc0NhY2hlS2V5O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5jYXRjaCgoZSkgPT4gTG9nLmVycm9yKGUubWVzc2FnZSwgZSkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyb3IubWVzc2FnZSwgZXJyb3IpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBjcmVhdGluZyB2aWV3IDogJHtlcnJvcn1gKTtcblx0XHR9XG5cdH1cblxuXHRnZXRWaWV3KCkge1xuXHRcdHJldHVybiB0aGlzLm9WaWV3O1xuXHR9XG5cblx0Z2V0SW50ZXJmYWNlKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRleGl0KCkge1xuXHRcdC8vIERlcmVnaXN0ZXIgZ2xvYmFsIGluc3RhbmNlXG5cdFx0aWYgKHRoaXMub1Jlc291cmNlTW9kZWxTZXJ2aWNlKSB7XG5cdFx0XHR0aGlzLm9SZXNvdXJjZU1vZGVsU2VydmljZS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm9DYWNoZUhhbmRsZXJTZXJ2aWNlKSB7XG5cdFx0XHR0aGlzLm9DYWNoZUhhbmRsZXJTZXJ2aWNlLmRlc3Ryb3koKTtcblx0XHR9XG5cdFx0dGhpcy5vRmFjdG9yeS5yZW1vdmVHbG9iYWxJbnN0YW5jZSgpO1xuXHR9XG59XG5cbmNsYXNzIFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PFRlbXBsYXRlZFZpZXdTZXJ2aWNlU2V0dGluZ3M+IHtcblx0X29JbnN0YW5jZVJlZ2lzdHJ5OiBSZWNvcmQ8c3RyaW5nLCBUZW1wbGF0ZWRWaWV3U2VydmljZT4gPSB7fTtcblxuXHRzdGF0aWMgaUNyZWF0aW5nVmlld3M6IDA7XG5cblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzPikge1xuXHRcdFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5pQ3JlYXRpbmdWaWV3cysrO1xuXG5cdFx0Y29uc3Qgb1RlbXBsYXRlZFZpZXdTZXJ2aWNlID0gbmV3IFRlbXBsYXRlZFZpZXdTZXJ2aWNlKE9iamVjdC5hc3NpZ24oeyBmYWN0b3J5OiB0aGlzIH0sIG9TZXJ2aWNlQ29udGV4dCkpO1xuXHRcdHJldHVybiBvVGVtcGxhdGVkVmlld1NlcnZpY2UuaW5pdFByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkuaUNyZWF0aW5nVmlld3MtLTtcblx0XHRcdHJldHVybiBvVGVtcGxhdGVkVmlld1NlcnZpY2U7XG5cdFx0fSk7XG5cdH1cblxuXHRyZW1vdmVHbG9iYWxJbnN0YW5jZSgpIHtcblx0XHR0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeSA9IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXNjcmlwdGlvbiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiB0aGUgY29tcG9uZW50IGRhdGEgc3BlY2lmaWVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSAnU2hhcmUnIGJ1dHRvbiBhbmQgcmV0dXJucyB0cnVlIG9yIGZhbHNlIGJhc2VkIG9uIHRoZSB2aXNpYmlsaXR5XG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgU3BlY2lmaWVzIHRoZSBhcHAgY29tcG9uZW50XG5cdCAqIEByZXR1cm5zIEJvb2xlYW4gdmFsdWUgYXMgdHJ1ZSBvciBmYWxzZSBiYXNlZCB3aGV0aGVyIHRoZSAnU2hhcmUnIGJ1dHRvbiBzaG91bGQgYmUgdmlzaWJsZSBvciBub3Rcblx0ICovXG5cdHN0YXRpYyBnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHlGb3JNeUluYm94KGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3QgY29tcG9uZW50RGF0YTogQ29tcG9uZW50RGF0YSA9IGFwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCk7XG5cdFx0aWYgKGNvbXBvbmVudERhdGEgIT09IHVuZGVmaW5lZCAmJiBjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQpIHtcblx0XHRcdHJldHVybiBjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQuZ2V0U2hhcmVDb250cm9sVmlzaWJpbGl0eSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0c3RhdGljIGdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUoKSB7XG5cdFx0cmV0dXJuIFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5pQ3JlYXRpbmdWaWV3cztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztNQTJDTUEsb0JBQW9CO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BcUJ6QkMsSUFBSSxHQUFKLGdCQUFPO01BQ04sTUFBTUMsb0JBQW9CLEdBQUcsRUFBRTtNQUMvQixNQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLEVBQUU7TUFDbEMsTUFBTUMsVUFBVSxHQUFHRixRQUFRLENBQUNHLFdBQVc7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