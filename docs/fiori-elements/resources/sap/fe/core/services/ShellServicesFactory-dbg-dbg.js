/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (Log, Service, ServiceFactory) {
  "use strict";

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Mock implementation of the ShellService for OpenFE
   *
   * @implements {IShellServices}
   * @private
   */
  let ShellServiceMock = /*#__PURE__*/function (_Service) {
    _inheritsLoose(ShellServiceMock, _Service);
    function ShellServiceMock() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = ShellServiceMock.prototype;
    _proto.init = function init() {
      this.initPromise = Promise.resolve(this);
      this.instanceType = "mock";
    };
    _proto.getLinks = function getLinks( /*oArgs: object*/
    ) {
      return Promise.resolve([]);
    };
    _proto.getLinksWithCache = function getLinksWithCache( /*oArgs: object*/
    ) {
      return Promise.resolve([]);
    };
    _proto.toExternal = function toExternal( /*oNavArgumentsArr: Array<object>, oComponent: object*/
    ) {
      /* Do Nothing */
    };
    _proto.getStartupAppState = function getStartupAppState( /*oArgs: object*/
    ) {
      return Promise.resolve(undefined);
    };
    _proto.backToPreviousApp = function backToPreviousApp() {
      /* Do Nothing */
    };
    _proto.hrefForExternal = function hrefForExternal( /*oArgs?: object, oComponent?: object, bAsync?: boolean*/
    ) {
      return "";
    };
    _proto.getHash = function getHash() {
      return window.location.href;
    };
    _proto.hrefForExternalAsync = function hrefForExternalAsync( /*oArgs?: object, oComponent?: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.getAppState = function getAppState( /*oComponent: object, sAppStateKey: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.createEmptyAppState = function createEmptyAppState( /*oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.createEmptyAppStateAsync = function createEmptyAppStateAsync( /*oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.isNavigationSupported = function isNavigationSupported( /*oNavArgumentsArr: Array<object>, oComponent: object*/
    ) {
      return Promise.resolve({});
    };
    _proto.isInitialNavigation = function isInitialNavigation() {
      return false;
    };
    _proto.isInitialNavigationAsync = function isInitialNavigationAsync() {
      return Promise.resolve({});
    };
    _proto.expandCompactHash = function expandCompactHash( /*sHashFragment: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.parseShellHash = function parseShellHash( /*sHash: string*/
    ) {
      return {};
    };
    _proto.splitHash = function splitHash( /*sHash: string*/
    ) {
      return Promise.resolve({});
    };
    _proto.constructShellHash = function constructShellHash( /*oNewShellHash: object*/
    ) {
      return "";
    };
    _proto.setDirtyFlag = function setDirtyFlag( /*bDirty: boolean*/
    ) {
      /* Do Nothing */
    };
    _proto.registerDirtyStateProvider = function registerDirtyStateProvider( /*fnDirtyStateProvider: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.deregisterDirtyStateProvider = function deregisterDirtyStateProvider( /*fnDirtyStateProvider: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.createRenderer = function createRenderer() {
      return {};
    };
    _proto.getUser = function getUser() {
      return {};
    };
    _proto.hasUShell = function hasUShell() {
      return false;
    };
    _proto.registerNavigationFilter = function registerNavigationFilter( /*fnNavFilter: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.unregisterNavigationFilter = function unregisterNavigationFilter( /*fnNavFilter: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.setBackNavigation = function setBackNavigation( /*fnCallBack?: Function*/
    ) {
      /* Do Nothing */
    };
    _proto.setHierarchy = function setHierarchy( /*aHierarchyLevels: Array<object>*/
    ) {
      /* Do Nothing */
    };
    _proto.setTitle = function setTitle( /*sTitle: string*/
    ) {
      /* Do Nothing */
    };
    _proto.getContentDensity = function getContentDensity() {
      // in case there is no shell we probably need to look at the classes being defined on the body
      if (document.body.classList.contains("sapUiSizeCozy")) {
        return "cozy";
      } else if (document.body.classList.contains("sapUiSizeCompact")) {
        return "compact";
      } else {
        return "";
      }
    };
    _proto.getPrimaryIntent = function getPrimaryIntent( /*sSemanticObject: string, mParameters?: object*/
    ) {
      return Promise.resolve();
    };
    _proto.waitForPluginsLoad = function waitForPluginsLoad() {
      return Promise.resolve(true);
    };
    return ShellServiceMock;
  }(Service);
  /**
   * @typedef ShellServicesSettings
   * @private
   */
  /**
   * Wrap a JQuery Promise within a native {Promise}.
   *
   * @template {object} T
   * @param jqueryPromise The original jquery promise
   * @returns A native promise wrapping the same object
   * @private
   */
  function wrapJQueryPromise(jqueryPromise) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line promise/catch-or-return
      jqueryPromise.done(resolve).fail(reject);
    });
  }

  /**
   * Base implementation of the ShellServices
   *
   * @implements {IShellServices}
   * @private
   */
  let ShellServices = /*#__PURE__*/function (_Service2) {
    _inheritsLoose(ShellServices, _Service2);
    function ShellServices() {
      return _Service2.apply(this, arguments) || this;
    }
    var _proto2 = ShellServices.prototype;
    // !: means that we know it will be assigned before usage
    _proto2.init = function init() {
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      this.oShellContainer = oContext.settings.shellContainer;
      this.instanceType = "real";
      this.linksCache = {};
      this.fnFindSemanticObjectsInCache = function (oArgs) {
        const _oArgs = oArgs;
        const aCachedSemanticObjects = [];
        const aNonCachedSemanticObjects = [];
        for (let i = 0; i < _oArgs.length; i++) {
          if (!!_oArgs[i][0] && !!_oArgs[i][0].semanticObject) {
            if (this.linksCache[_oArgs[i][0].semanticObject]) {
              aCachedSemanticObjects.push(this.linksCache[_oArgs[i][0].semanticObject].links);
              Object.defineProperty(oArgs[i][0], "links", {
                value: this.linksCache[_oArgs[i][0].semanticObject].links
              });
            } else {
              aNonCachedSemanticObjects.push(_oArgs[i]);
            }
          }
        }
        return {
          oldArgs: oArgs,
          newArgs: aNonCachedSemanticObjects,
          cachedLinks: aCachedSemanticObjects
        };
      };
      this.initPromise = new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
      });
      const oCrossAppNavServicePromise = this.oShellContainer.getServiceAsync("CrossApplicationNavigation");
      const oUrlParsingServicePromise = this.oShellContainer.getServiceAsync("URLParsing");
      const oShellNavigationServicePromise = this.oShellContainer.getServiceAsync("ShellNavigation");
      const oShellPluginManagerPromise = this.oShellContainer.getServiceAsync("PluginManager");
      const oShellUIServicePromise = oComponent.getService("ShellUIService");
      Promise.all([oCrossAppNavServicePromise, oUrlParsingServicePromise, oShellNavigationServicePromise, oShellUIServicePromise, oShellPluginManagerPromise]).then(_ref => {
        let [oCrossAppNavService, oUrlParsingService, oShellNavigation, oShellUIService, oShellPluginManager] = _ref;
        this.crossAppNavService = oCrossAppNavService;
        this.urlParsingService = oUrlParsingService;
        this.shellNavigation = oShellNavigation;
        this.shellUIService = oShellUIService;
        this.shellPluginManager = oShellPluginManager;
        this.resolveFn();
      }).catch(this.rejectFn);
    }

    /**
     * Retrieves the target links configured for a given semantic object & action
     * Will retrieve the CrossApplicationNavigation
     * service reference call the getLinks method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
     * @returns Promise which will be resolved to target links array
     */;
    _proto2.getLinks = function getLinks(oArgs) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/catch-or-return
        this.crossAppNavService.getLinks(oArgs).fail(oError => {
          reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getLinks`));
        }).then(resolve);
      });
    }

    /**
     * Retrieves the target links configured for a given semantic object & action in cache
     * Will retrieve the CrossApplicationNavigation
     * service reference call the getLinks method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
     * @returns Promise which will be resolved to target links array
     */;
    _proto2.getLinksWithCache = function getLinksWithCache(oArgs) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/catch-or-return
        if (oArgs.length === 0) {
          resolve([]);
        } else {
          const oCacheResults = this.fnFindSemanticObjectsInCache(oArgs);
          if (oCacheResults.newArgs.length === 0) {
            resolve(oCacheResults.cachedLinks);
          } else {
            // eslint-disable-next-line promise/catch-or-return
            this.crossAppNavService.getLinks(oCacheResults.newArgs).fail(oError => {
              reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getLinksWithCache`));
            }).then(aLinks => {
              if (aLinks.length !== 0) {
                const oSemanticObjectsLinks = {};
                for (let i = 0; i < aLinks.length; i++) {
                  if (aLinks[i].length > 0 && oCacheResults.newArgs[i][0].links === undefined) {
                    oSemanticObjectsLinks[oCacheResults.newArgs[i][0].semanticObject] = {
                      links: aLinks[i]
                    };
                    this.linksCache = Object.assign(this.linksCache, oSemanticObjectsLinks);
                  }
                }
              }
              if (oCacheResults.cachedLinks.length === 0) {
                resolve(aLinks);
              } else {
                const aMergedLinks = [];
                let j = 0;
                for (let k = 0; k < oCacheResults.oldArgs.length; k++) {
                  if (j < aLinks.length) {
                    if (aLinks[j].length > 0 && oCacheResults.oldArgs[k][0].semanticObject === oCacheResults.newArgs[j][0].semanticObject) {
                      aMergedLinks.push(aLinks[j]);
                      j++;
                    } else {
                      aMergedLinks.push(oCacheResults.oldArgs[k][0].links);
                    }
                  } else {
                    aMergedLinks.push(oCacheResults.oldArgs[k][0].links);
                  }
                }
                resolve(aMergedLinks);
              }
            });
          }
        }
      });
    }

    /**
     * Will retrieve the ShellContainer.
     *
     * @private
     * @ui5-restricted
     * sap.ushell.container
     * @returns Object with predefined shellContainer methods
     */;
    _proto2.getShellContainer = function getShellContainer() {
      return this.oShellContainer;
    }

    /**
     * Will call toExternal method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oNavArgumentsArr And
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>toExternal arguments
     */;
    _proto2.toExternal = function toExternal(oNavArgumentsArr, oComponent) {
      this.crossAppNavService.toExternal(oNavArgumentsArr, oComponent);
    }

    /**
     * Retrieves the target startupAppState
     * Will check the existance of the ShellContainer and retrieve the CrossApplicationNavigation
     * service reference call the getStartupAppState method. In case service is not available or any exception
     * method throws exception error in console.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getStartupAppState arguments
     * @returns Promise which will be resolved to Object
     */;
    _proto2.getStartupAppState = function getStartupAppState(oArgs) {
      return new Promise((resolve, reject) => {
        // JQuery Promise behaves differently
        // eslint-disable-next-line promise/catch-or-return
        this.crossAppNavService.getStartupAppState(oArgs).fail(oError => {
          reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getStartupAppState`));
        }).then(startupAppState => resolve(startupAppState));
      });
    }

    /**
     * Will call backToPreviousApp method of CrossApplicationNavigation service.
     *
     * @returns Something that indicate we've navigated
     * @private
     * @ui5-restricted
     */;
    _proto2.backToPreviousApp = function backToPreviousApp() {
      return this.crossAppNavService.backToPreviousApp();
    }

    /**
     * Will call hrefForExternal method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * @param oComponent The appComponent
     * @param bAsync Whether this call should be async or not
     * sap.ushell.services.CrossApplicationNavigation=>hrefForExternal arguments
     * @returns Promise which will be resolved to string
     */;
    _proto2.hrefForExternal = function hrefForExternal(oArgs, oComponent, bAsync) {
      return this.crossAppNavService.hrefForExternal(oArgs, oComponent, !!bAsync);
    }

    /**
     * Will call hrefForExternal method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @param oArgs Check the definition of
     * @param oComponent The appComponent
     * sap.ushell.services.CrossApplicationNavigation=>hrefForExternalAsync arguments
     * @returns Promise which will be resolved to string
     */;
    _proto2.hrefForExternalAsync = function hrefForExternalAsync(oArgs, oComponent) {
      return this.crossAppNavService.hrefForExternalAsync(oArgs, oComponent);
    }

    /**
     * Will call getAppState method of CrossApplicationNavigation service with oComponent and oAppStateKey.
     *
     * @private
     * @ui5-restricted
     * @param oComponent
     * @param sAppStateKey Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>getAppState arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.getAppState = function getAppState(oComponent, sAppStateKey) {
      return wrapJQueryPromise(this.crossAppNavService.getAppState(oComponent, sAppStateKey));
    }

    /**
     * Will call createEmptyAppState method of CrossApplicationNavigation service with oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppState arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.createEmptyAppState = function createEmptyAppState(oComponent) {
      return this.crossAppNavService.createEmptyAppState(oComponent);
    }

    /**
     * Will call createEmptyAppStateAsync method of CrossApplicationNavigation service with oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppStateAsync arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.createEmptyAppStateAsync = function createEmptyAppStateAsync(oComponent) {
      return this.crossAppNavService.createEmptyAppStateAsync(oComponent);
    }

    /**
     * Will call isNavigationSupported method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
     *
     * @private
     * @ui5-restricted
     * @param oNavArgumentsArr
     * @param oComponent Check the definition of
     * sap.ushell.services.CrossApplicationNavigation=>isNavigationSupported arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.isNavigationSupported = function isNavigationSupported(oNavArgumentsArr, oComponent) {
      return wrapJQueryPromise(this.crossAppNavService.isNavigationSupported(oNavArgumentsArr, oComponent));
    }

    /**
     * Will call isInitialNavigation method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @returns Promise which will be resolved to boolean
     */;
    _proto2.isInitialNavigation = function isInitialNavigation() {
      return this.crossAppNavService.isInitialNavigation();
    }

    /**
     * Will call isInitialNavigationAsync method of CrossApplicationNavigation service.
     *
     * @private
     * @ui5-restricted
     * @returns Promise which will be resolved to boolean
     */;
    _proto2.isInitialNavigationAsync = function isInitialNavigationAsync() {
      return this.crossAppNavService.isInitialNavigationAsync();
    }

    /**
     * Will call expandCompactHash method of CrossApplicationNavigation service.
     *
     * @param sHashFragment An (internal format) shell hash
     * @returns A promise the success handler of the resolve promise get an expanded shell hash as first argument
     * @private
     * @ui5-restricted
     */;
    _proto2.expandCompactHash = function expandCompactHash(sHashFragment) {
      return this.crossAppNavService.expandCompactHash(sHashFragment);
    };
    _proto2.getHash = function getHash() {
      return `#${this.urlParsingService.getShellHash(window.location.href)}`;
    }

    /**
     * Will call parseShellHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param sHash Check the definition of
     * sap.ushell.services.URLParsing=>parseShellHash arguments
     * @returns The parsed url
     */;
    _proto2.parseShellHash = function parseShellHash(sHash) {
      return this.urlParsingService.parseShellHash(sHash);
    }

    /**
     * Will call splitHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param sHash Check the definition of
     * sap.ushell.services.URLParsing=>splitHash arguments
     * @returns Promise which will be resolved to object
     */;
    _proto2.splitHash = function splitHash(sHash) {
      return this.urlParsingService.splitHash(sHash);
    }

    /**
     * Will call constructShellHash method of URLParsing service with given sHash.
     *
     * @private
     * @ui5-restricted
     * @param oNewShellHash Check the definition of
     * sap.ushell.services.URLParsing=>constructShellHash arguments
     * @returns Shell Hash string
     */;
    _proto2.constructShellHash = function constructShellHash(oNewShellHash) {
      return this.urlParsingService.constructShellHash(oNewShellHash);
    }

    /**
     * Will call setDirtyFlag method with given dirty state.
     *
     * @private
     * @ui5-restricted
     * @param bDirty Check the definition of sap.ushell.Container.setDirtyFlag arguments
     */;
    _proto2.setDirtyFlag = function setDirtyFlag(bDirty) {
      this.oShellContainer.setDirtyFlag(bDirty);
    }

    /**
     * Will call registerDirtyStateProvider method with given dirty state provider callback method.
     *
     * @private
     * @ui5-restricted
     * @param fnDirtyStateProvider Check the definition of sap.ushell.Container.registerDirtyStateProvider arguments
     */;
    _proto2.registerDirtyStateProvider = function registerDirtyStateProvider(fnDirtyStateProvider) {
      this.oShellContainer.registerDirtyStateProvider(fnDirtyStateProvider);
    }

    /**
     * Will call deregisterDirtyStateProvider method with given dirty state provider callback method.
     *
     * @private
     * @ui5-restricted
     * @param fnDirtyStateProvider Check the definition of sap.ushell.Container.deregisterDirtyStateProvider arguments
     */;
    _proto2.deregisterDirtyStateProvider = function deregisterDirtyStateProvider(fnDirtyStateProvider) {
      this.oShellContainer.deregisterDirtyStateProvider(fnDirtyStateProvider);
    }

    /**
     * Will call createRenderer method of ushell container.
     *
     * @private
     * @ui5-restricted
     * @returns Returns renderer object
     */;
    _proto2.createRenderer = function createRenderer() {
      return this.oShellContainer.createRenderer();
    }

    /**
     * Will call getUser method of ushell container.
     *
     * @private
     * @ui5-restricted
     * @returns Returns User object
     */;
    _proto2.getUser = function getUser() {
      return this.oShellContainer.getUser();
    }

    /**
     * Will check if ushell container is available or not.
     *
     * @private
     * @ui5-restricted
     * @returns Returns true
     */;
    _proto2.hasUShell = function hasUShell() {
      return true;
    }

    /**
     * Will call registerNavigationFilter method of shellNavigation.
     *
     * @param fnNavFilter The filter function to register
     * @private
     * @ui5-restricted
     */;
    _proto2.registerNavigationFilter = function registerNavigationFilter(fnNavFilter) {
      this.shellNavigation.registerNavigationFilter(fnNavFilter);
    }

    /**
     * Will call unregisterNavigationFilter method of shellNavigation.
     *
     * @param fnNavFilter The filter function to unregister
     * @private
     * @ui5-restricted
     */;
    _proto2.unregisterNavigationFilter = function unregisterNavigationFilter(fnNavFilter) {
      this.shellNavigation.unregisterNavigationFilter(fnNavFilter);
    }

    /**
     * Will call setBackNavigation method of ShellUIService
     * that displays the back button in the shell header.
     *
     * @param [fnCallBack] A callback function called when the button is clicked in the UI.
     * @private
     * @ui5-restricted
     */;
    _proto2.setBackNavigation = function setBackNavigation(fnCallBack) {
      this.shellUIService.setBackNavigation(fnCallBack);
    }

    /**
     * Will call setHierarchy method of ShellUIService
     * that displays the given hierarchy in the shell header.
     *
     * @param [aHierarchyLevels] An array representing hierarchies of the currently displayed app.
     * @private
     * @ui5-restricted
     */;
    _proto2.setHierarchy = function setHierarchy(aHierarchyLevels) {
      this.shellUIService.setHierarchy(aHierarchyLevels);
    }

    /**
     * Will call setTitle method of ShellUIService
     * that displays the given title in the shell header.
     *
     * @param [sTitle] The new title. The default title is set if this argument is not given.
     * @private
     * @ui5-restricted
     */;
    _proto2.setTitle = function setTitle(sTitle) {
      this.shellUIService.setTitle(sTitle);
    }

    /**
     * Retrieves the currently defined content density.
     *
     * @returns The content density value
     */;
    _proto2.getContentDensity = function getContentDensity() {
      return this.oShellContainer.getUser().getContentDensity();
    }

    /**
     * For a given semantic object, this method considers all actions associated with the semantic object and
     * returns the one tagged as a "primaryAction". If no inbound tagged as "primaryAction" exists, then it returns
     * the intent of the first inbound (after sorting has been applied) matching the action "displayFactSheet".
     *
     * @private
     * @ui5-restricted
     * @param sSemanticObject Semantic object.
     * @param mParameters See #CrossApplicationNavigation#getLinks for description.
     * @returns Promise which will be resolved with an object containing the intent if it exists.
     */;
    _proto2.getPrimaryIntent = function getPrimaryIntent(sSemanticObject, mParameters) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line promise/catch-or-return
        this.crossAppNavService.getPrimaryIntent(sSemanticObject, mParameters).fail(oError => {
          reject(new Error(`${oError} sap.fe.core.services.ShellServicesFactory.getPrimaryIntent`));
        }).then(resolve);
      });
    }

    /**
     * Wait for the render extensions plugin to be loaded.
     * If true is returned by the promise we were able to wait for it, otherwise we couldn't and cannot rely on it.
     */;
    _proto2.waitForPluginsLoad = function waitForPluginsLoad() {
      return new Promise(resolve => {
        var _this$shellPluginMana;
        if (!((_this$shellPluginMana = this.shellPluginManager) !== null && _this$shellPluginMana !== void 0 && _this$shellPluginMana.getPluginLoadingPromise)) {
          resolve(false);
        } else {
          // eslint-disable-next-line promise/catch-or-return
          this.shellPluginManager.getPluginLoadingPromise("RendererExtensions").fail(oError => {
            Log.error(oError, "sap.fe.core.services.ShellServicesFactory.waitForPluginsLoad");
            resolve(false);
          }).then(() => resolve(true));
        }
      });
    };
    return ShellServices;
  }(Service);
  /**
   * Service Factory for the ShellServices
   *
   * @private
   */
  let ShellServicesFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(ShellServicesFactory, _ServiceFactory);
    function ShellServicesFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto3 = ShellServicesFactory.prototype;
    /**
     * Creates either a standard or a mock Shell service depending on the configuration.
     *
     * @param oServiceContext The shellservice context
     * @returns A promise for a shell service implementation
     * @see ServiceFactory#createInstance
     */
    _proto3.createInstance = function createInstance(oServiceContext) {
      oServiceContext.settings.shellContainer = sap.ushell && sap.ushell.Container;
      const oShellService = oServiceContext.settings.shellContainer ? new ShellServices(oServiceContext) : new ShellServiceMock(oServiceContext);
      return oShellService.initPromise.then(() => {
        // Enrich the appComponent with this method
        oServiceContext.scopeObject.getShellServices = () => oShellService;
        return oShellService;
      });
    };
    return ShellServicesFactory;
  }(ServiceFactory);
  return ShellServicesFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGVsbFNlcnZpY2VNb2NrIiwiaW5pdCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnN0YW5jZVR5cGUiLCJnZXRMaW5rcyIsImdldExpbmtzV2l0aENhY2hlIiwidG9FeHRlcm5hbCIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsInVuZGVmaW5lZCIsImJhY2tUb1ByZXZpb3VzQXBwIiwiaHJlZkZvckV4dGVybmFsIiwiZ2V0SGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImhyZWZGb3JFeHRlcm5hbEFzeW5jIiwiZ2V0QXBwU3RhdGUiLCJjcmVhdGVFbXB0eUFwcFN0YXRlIiwiY3JlYXRlRW1wdHlBcHBTdGF0ZUFzeW5jIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwiaXNJbml0aWFsTmF2aWdhdGlvbiIsImlzSW5pdGlhbE5hdmlnYXRpb25Bc3luYyIsImV4cGFuZENvbXBhY3RIYXNoIiwicGFyc2VTaGVsbEhhc2giLCJzcGxpdEhhc2giLCJjb25zdHJ1Y3RTaGVsbEhhc2giLCJzZXREaXJ0eUZsYWciLCJyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsImRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIiLCJjcmVhdGVSZW5kZXJlciIsImdldFVzZXIiLCJoYXNVU2hlbGwiLCJyZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIiLCJ1bnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciIsInNldEJhY2tOYXZpZ2F0aW9uIiwic2V0SGllcmFyY2h5Iiwic2V0VGl0bGUiLCJnZXRDb250ZW50RGVuc2l0eSIsImRvY3VtZW50IiwiYm9keSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiZ2V0UHJpbWFyeUludGVudCIsIndhaXRGb3JQbHVnaW5zTG9hZCIsIlNlcnZpY2UiLCJ3cmFwSlF1ZXJ5UHJvbWlzZSIsImpxdWVyeVByb21pc2UiLCJyZWplY3QiLCJkb25lIiwiZmFpbCIsIlNoZWxsU2VydmljZXMiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJvQ29tcG9uZW50Iiwic2NvcGVPYmplY3QiLCJvU2hlbGxDb250YWluZXIiLCJzZXR0aW5ncyIsInNoZWxsQ29udGFpbmVyIiwibGlua3NDYWNoZSIsImZuRmluZFNlbWFudGljT2JqZWN0c0luQ2FjaGUiLCJvQXJncyIsIl9vQXJncyIsImFDYWNoZWRTZW1hbnRpY09iamVjdHMiLCJhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzIiwiaSIsImxlbmd0aCIsInNlbWFudGljT2JqZWN0IiwicHVzaCIsImxpbmtzIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJ2YWx1ZSIsIm9sZEFyZ3MiLCJuZXdBcmdzIiwiY2FjaGVkTGlua3MiLCJyZXNvbHZlRm4iLCJyZWplY3RGbiIsIm9Dcm9zc0FwcE5hdlNlcnZpY2VQcm9taXNlIiwiZ2V0U2VydmljZUFzeW5jIiwib1VybFBhcnNpbmdTZXJ2aWNlUHJvbWlzZSIsIm9TaGVsbE5hdmlnYXRpb25TZXJ2aWNlUHJvbWlzZSIsIm9TaGVsbFBsdWdpbk1hbmFnZXJQcm9taXNlIiwib1NoZWxsVUlTZXJ2aWNlUHJvbWlzZSIsImdldFNlcnZpY2UiLCJhbGwiLCJ0aGVuIiwib0Nyb3NzQXBwTmF2U2VydmljZSIsIm9VcmxQYXJzaW5nU2VydmljZSIsIm9TaGVsbE5hdmlnYXRpb24iLCJvU2hlbGxVSVNlcnZpY2UiLCJvU2hlbGxQbHVnaW5NYW5hZ2VyIiwiY3Jvc3NBcHBOYXZTZXJ2aWNlIiwidXJsUGFyc2luZ1NlcnZpY2UiLCJzaGVsbE5hdmlnYXRpb24iLCJzaGVsbFVJU2VydmljZSIsInNoZWxsUGx1Z2luTWFuYWdlciIsImNhdGNoIiwib0Vycm9yIiwiRXJyb3IiLCJvQ2FjaGVSZXN1bHRzIiwiYUxpbmtzIiwib1NlbWFudGljT2JqZWN0c0xpbmtzIiwiYXNzaWduIiwiYU1lcmdlZExpbmtzIiwiaiIsImsiLCJnZXRTaGVsbENvbnRhaW5lciIsIm9OYXZBcmd1bWVudHNBcnIiLCJzdGFydHVwQXBwU3RhdGUiLCJiQXN5bmMiLCJzQXBwU3RhdGVLZXkiLCJzSGFzaEZyYWdtZW50IiwiZ2V0U2hlbGxIYXNoIiwic0hhc2giLCJvTmV3U2hlbGxIYXNoIiwiYkRpcnR5IiwiZm5EaXJ0eVN0YXRlUHJvdmlkZXIiLCJmbk5hdkZpbHRlciIsImZuQ2FsbEJhY2siLCJhSGllcmFyY2h5TGV2ZWxzIiwic1RpdGxlIiwic1NlbWFudGljT2JqZWN0IiwibVBhcmFtZXRlcnMiLCJnZXRQbHVnaW5Mb2FkaW5nUHJvbWlzZSIsIkxvZyIsImVycm9yIiwiU2hlbGxTZXJ2aWNlc0ZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsIm9TaGVsbFNlcnZpY2UiLCJnZXRTaGVsbFNlcnZpY2VzIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNoZWxsU2VydmljZXNGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgQ29udGFpbmVyIGZyb20gXCJzYXAvdXNoZWxsL3NlcnZpY2VzL0NvbnRhaW5lclwiO1xuaW1wb3J0IHR5cGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gZnJvbSBcInNhcC91c2hlbGwvc2VydmljZXMvQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cIjtcbmltcG9ydCB0eXBlIFNoZWxsTmF2aWdhdGlvbiBmcm9tIFwic2FwL3VzaGVsbC9zZXJ2aWNlcy9TaGVsbE5hdmlnYXRpb25cIjtcbmltcG9ydCB0eXBlIFVSTFBhcnNpbmcgZnJvbSBcInNhcC91c2hlbGwvc2VydmljZXMvVVJMUGFyc2luZ1wiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9tZXRhbW9kZWxfdHlwZXNcIjtcblxuZXhwb3J0IHR5cGUgU3RhcnR1cEFwcFN0YXRlID0ge1xuXHRnZXREYXRhKCk6IHtcblx0XHRzZWxlY3Rpb25WYXJpYW50Pzoge1xuXHRcdFx0U2VsZWN0T3B0aW9ucz86IHtcblx0XHRcdFx0UHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdFx0XHRcdFJhbmdlczoge1xuXHRcdFx0XHRcdE9wdGlvbjogc3RyaW5nO1xuXHRcdFx0XHRcdFNpZ246IHN0cmluZztcblx0XHRcdFx0XHRMb3c6IHN0cmluZztcblx0XHRcdFx0fVtdO1xuXHRcdFx0fVtdO1xuXHRcdH07XG5cdH07XG59O1xuLyoqXG4gKiBAaW50ZXJmYWNlIElTaGVsbFNlcnZpY2VzXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElTaGVsbFNlcnZpY2VzIHtcblx0aW5pdFByb21pc2U6IFByb21pc2U8SVNoZWxsU2VydmljZXM+O1xuXHRpbnN0YW5jZVR5cGU6IHN0cmluZztcblx0Y3Jvc3NBcHBOYXZTZXJ2aWNlPzogQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb247XG5cdGdldExpbmtzKG9BcmdzOiBvYmplY3QpOiBQcm9taXNlPGFueT47XG5cblx0Z2V0TGlua3NXaXRoQ2FjaGUob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8YW55W10+O1xuXG5cdHRvRXh0ZXJuYWwob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KTogdm9pZDtcblxuXHRnZXRTdGFydHVwQXBwU3RhdGUob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8dW5kZWZpbmVkIHwgU3RhcnR1cEFwcFN0YXRlPjtcblxuXHRiYWNrVG9QcmV2aW91c0FwcCgpOiB2b2lkO1xuXG5cdGhyZWZGb3JFeHRlcm5hbChvQXJncz86IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCwgYkFzeW5jPzogYm9vbGVhbik6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPjtcblxuXHRocmVmRm9yRXh0ZXJuYWxBc3luYyhvQXJncz86IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHRnZXRBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQsIHNBcHBTdGF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxhbnk+O1xuXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50KTogb2JqZWN0O1xuXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50KTogUHJvbWlzZTxhbnk+O1xuXG5cdGlzTmF2aWdhdGlvblN1cHBvcnRlZChvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50Pzogb2JqZWN0KTogUHJvbWlzZTxhbnk+O1xuXG5cdGlzSW5pdGlhbE5hdmlnYXRpb24oKTogYm9vbGVhbjtcblxuXHRpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKTogUHJvbWlzZTxhbnk+O1xuXG5cdGV4cGFuZENvbXBhY3RIYXNoKHNIYXNoRnJhZ21lbnQ6IHN0cmluZyk6IGFueTtcblxuXHRnZXRIYXNoKCk6IHN0cmluZztcblxuXHRwYXJzZVNoZWxsSGFzaChzSGFzaDogc3RyaW5nKTogYW55O1xuXG5cdHNwbGl0SGFzaChzSGFzaDogc3RyaW5nKTogb2JqZWN0O1xuXG5cdGNvbnN0cnVjdFNoZWxsSGFzaChvTmV3U2hlbGxIYXNoOiBvYmplY3QpOiBzdHJpbmc7XG5cblx0c2V0RGlydHlGbGFnKGJEaXJ0eTogYm9vbGVhbik6IHZvaWQ7XG5cblx0cmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKTogdm9pZDtcblxuXHRkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0Y3JlYXRlUmVuZGVyZXIoKTogb2JqZWN0O1xuXG5cdGdldFVzZXIoKTogYW55O1xuXG5cdGhhc1VTaGVsbCgpOiBib29sZWFuO1xuXG5cdHJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcjogRnVuY3Rpb24pOiB2b2lkO1xuXG5cdHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0c2V0QmFja05hdmlnYXRpb24oZm5DYWxsQmFjaz86IEZ1bmN0aW9uKTogdm9pZDtcblxuXHRzZXRIaWVyYXJjaHkoYUhpZXJhcmNoeUxldmVsczogQXJyYXk8b2JqZWN0Pik6IHZvaWQ7XG5cblx0c2V0VGl0bGUoc1RpdGxlOiBzdHJpbmcpOiB2b2lkO1xuXG5cdGdldENvbnRlbnREZW5zaXR5KCk6IHN0cmluZztcblxuXHRnZXRQcmltYXJ5SW50ZW50KHNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBtUGFyYW1ldGVycz86IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHR3YWl0Rm9yUGx1Z2luc0xvYWQoKTogUHJvbWlzZTxib29sZWFuPjtcbn1cblxuLyoqXG4gKiBNb2NrIGltcGxlbWVudGF0aW9uIG9mIHRoZSBTaGVsbFNlcnZpY2UgZm9yIE9wZW5GRVxuICpcbiAqIEBpbXBsZW1lbnRzIHtJU2hlbGxTZXJ2aWNlc31cbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIFNoZWxsU2VydmljZU1vY2sgZXh0ZW5kcyBTZXJ2aWNlPFNoZWxsU2VydmljZXNTZXR0aW5ncz4gaW1wbGVtZW50cyBJU2hlbGxTZXJ2aWNlcyB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXG5cdGluc3RhbmNlVHlwZSE6IHN0cmluZztcblxuXHRpbml0KCkge1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcyk7XG5cdFx0dGhpcy5pbnN0YW5jZVR5cGUgPSBcIm1vY2tcIjtcblx0fVxuXG5cdGdldExpbmtzKC8qb0FyZ3M6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG5cdH1cblxuXHRnZXRMaW5rc1dpdGhDYWNoZSgvKm9BcmdzOiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cblx0dG9FeHRlcm5hbCgvKm9OYXZBcmd1bWVudHNBcnI6IEFycmF5PG9iamVjdD4sIG9Db21wb25lbnQ6IG9iamVjdCovKSB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0Z2V0U3RhcnR1cEFwcFN0YXRlKC8qb0FyZ3M6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHR9XG5cblx0YmFja1RvUHJldmlvdXNBcHAoKSB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0aHJlZkZvckV4dGVybmFsKC8qb0FyZ3M/OiBvYmplY3QsIG9Db21wb25lbnQ/OiBvYmplY3QsIGJBc3luYz86IGJvb2xlYW4qLykge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0Z2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cdH1cblxuXHRocmVmRm9yRXh0ZXJuYWxBc3luYygvKm9BcmdzPzogb2JqZWN0LCBvQ29tcG9uZW50Pzogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdGdldEFwcFN0YXRlKC8qb0NvbXBvbmVudDogb2JqZWN0LCBzQXBwU3RhdGVLZXk6IHN0cmluZyovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRjcmVhdGVFbXB0eUFwcFN0YXRlKC8qb0NvbXBvbmVudDogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYygvKm9Db21wb25lbnQ6IG9iamVjdCovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRpc05hdmlnYXRpb25TdXBwb3J0ZWQoLypvTmF2QXJndW1lbnRzQXJyOiBBcnJheTxvYmplY3Q+LCBvQ29tcG9uZW50OiBvYmplY3QqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0aXNJbml0aWFsTmF2aWdhdGlvbigpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRleHBhbmRDb21wYWN0SGFzaCgvKnNIYXNoRnJhZ21lbnQ6IHN0cmluZyovKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRwYXJzZVNoZWxsSGFzaCgvKnNIYXNoOiBzdHJpbmcqLykge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdHNwbGl0SGFzaCgvKnNIYXNoOiBzdHJpbmcqLykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0Y29uc3RydWN0U2hlbGxIYXNoKC8qb05ld1NoZWxsSGFzaDogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdHNldERpcnR5RmxhZygvKmJEaXJ0eTogYm9vbGVhbiovKSB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0cmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoLypmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24qLykge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoLypmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24qLykge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdGNyZWF0ZVJlbmRlcmVyKCkge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdGdldFVzZXIoKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0aGFzVVNoZWxsKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcigvKmZuTmF2RmlsdGVyOiBGdW5jdGlvbiovKTogdm9pZCB7XG5cdFx0LyogRG8gTm90aGluZyAqL1xuXHR9XG5cblx0dW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoLypmbk5hdkZpbHRlcjogRnVuY3Rpb24qLyk6IHZvaWQge1xuXHRcdC8qIERvIE5vdGhpbmcgKi9cblx0fVxuXG5cdHNldEJhY2tOYXZpZ2F0aW9uKC8qZm5DYWxsQmFjaz86IEZ1bmN0aW9uKi8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRzZXRIaWVyYXJjaHkoLyphSGllcmFyY2h5TGV2ZWxzOiBBcnJheTxvYmplY3Q+Ki8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRzZXRUaXRsZSgvKnNUaXRsZTogc3RyaW5nKi8pOiB2b2lkIHtcblx0XHQvKiBEbyBOb3RoaW5nICovXG5cdH1cblxuXHRnZXRDb250ZW50RGVuc2l0eSgpOiBzdHJpbmcge1xuXHRcdC8vIGluIGNhc2UgdGhlcmUgaXMgbm8gc2hlbGwgd2UgcHJvYmFibHkgbmVlZCB0byBsb29rIGF0IHRoZSBjbGFzc2VzIGJlaW5nIGRlZmluZWQgb24gdGhlIGJvZHlcblx0XHRpZiAoZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoXCJzYXBVaVNpemVDb3p5XCIpKSB7XG5cdFx0XHRyZXR1cm4gXCJjb3p5XCI7XG5cdFx0fSBlbHNlIGlmIChkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucyhcInNhcFVpU2l6ZUNvbXBhY3RcIikpIHtcblx0XHRcdHJldHVybiBcImNvbXBhY3RcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0Z2V0UHJpbWFyeUludGVudCgvKnNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBtUGFyYW1ldGVycz86IG9iamVjdCovKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHR3YWl0Rm9yUGx1Z2luc0xvYWQoKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0fVxufVxuXG4vKipcbiAqIEB0eXBlZGVmIFNoZWxsU2VydmljZXNTZXR0aW5nc1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgU2hlbGxTZXJ2aWNlc1NldHRpbmdzID0ge1xuXHRzaGVsbENvbnRhaW5lcj86IENvbnRhaW5lcjtcbn07XG5cbi8qKlxuICogV3JhcCBhIEpRdWVyeSBQcm9taXNlIHdpdGhpbiBhIG5hdGl2ZSB7UHJvbWlzZX0uXG4gKlxuICogQHRlbXBsYXRlIHtvYmplY3R9IFRcbiAqIEBwYXJhbSBqcXVlcnlQcm9taXNlIFRoZSBvcmlnaW5hbCBqcXVlcnkgcHJvbWlzZVxuICogQHJldHVybnMgQSBuYXRpdmUgcHJvbWlzZSB3cmFwcGluZyB0aGUgc2FtZSBvYmplY3RcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHdyYXBKUXVlcnlQcm9taXNlPFQ+KGpxdWVyeVByb21pc2U6IGpRdWVyeS5Qcm9taXNlKTogUHJvbWlzZTxUPiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0anF1ZXJ5UHJvbWlzZS5kb25lKHJlc29sdmUgYXMgYW55KS5mYWlsKHJlamVjdCk7XG5cdH0pO1xufVxuXG4vKipcbiAqIEJhc2UgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNoZWxsU2VydmljZXNcbiAqXG4gKiBAaW1wbGVtZW50cyB7SVNoZWxsU2VydmljZXN9XG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBTaGVsbFNlcnZpY2VzIGV4dGVuZHMgU2VydmljZTxSZXF1aXJlZDxTaGVsbFNlcnZpY2VzU2V0dGluZ3M+PiBpbXBsZW1lbnRzIElTaGVsbFNlcnZpY2VzIHtcblx0cmVzb2x2ZUZuOiBhbnk7XG5cblx0cmVqZWN0Rm46IGFueTtcblxuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55PjtcblxuXHQvLyAhOiBtZWFucyB0aGF0IHdlIGtub3cgaXQgd2lsbCBiZSBhc3NpZ25lZCBiZWZvcmUgdXNhZ2Vcblx0Y3Jvc3NBcHBOYXZTZXJ2aWNlITogQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb247XG5cblx0dXJsUGFyc2luZ1NlcnZpY2UhOiBVUkxQYXJzaW5nO1xuXG5cdHNoZWxsTmF2aWdhdGlvbiE6IFNoZWxsTmF2aWdhdGlvbjtcblxuXHRzaGVsbFBsdWdpbk1hbmFnZXIhOiB7XG5cdFx0Z2V0UGx1Z2luTG9hZGluZ1Byb21pc2UoY2F0ZWdvcnk6IHN0cmluZyk6IGpRdWVyeS5Qcm9taXNlO1xuXHR9O1xuXG5cdG9TaGVsbENvbnRhaW5lciE6IENvbnRhaW5lcjtcblxuXHRzaGVsbFVJU2VydmljZSE6IGFueTtcblxuXHRpbnN0YW5jZVR5cGUhOiBzdHJpbmc7XG5cblx0bGlua3NDYWNoZSE6IGFueTtcblxuXHRmbkZpbmRTZW1hbnRpY09iamVjdHNJbkNhY2hlOiBhbnk7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdCBhcyBhbnk7XG5cdFx0dGhpcy5vU2hlbGxDb250YWluZXIgPSBvQ29udGV4dC5zZXR0aW5ncy5zaGVsbENvbnRhaW5lcjtcblx0XHR0aGlzLmluc3RhbmNlVHlwZSA9IFwicmVhbFwiO1xuXHRcdHRoaXMubGlua3NDYWNoZSA9IHt9O1xuXHRcdHRoaXMuZm5GaW5kU2VtYW50aWNPYmplY3RzSW5DYWNoZSA9IGZ1bmN0aW9uIChvQXJnczogYW55KTogb2JqZWN0IHtcblx0XHRcdGNvbnN0IF9vQXJnczogYW55ID0gb0FyZ3M7XG5cdFx0XHRjb25zdCBhQ2FjaGVkU2VtYW50aWNPYmplY3RzID0gW107XG5cdFx0XHRjb25zdCBhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzID0gW107XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IF9vQXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoISFfb0FyZ3NbaV1bMF0gJiYgISFfb0FyZ3NbaV1bMF0uc2VtYW50aWNPYmplY3QpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5saW5rc0NhY2hlW19vQXJnc1tpXVswXS5zZW1hbnRpY09iamVjdF0pIHtcblx0XHRcdFx0XHRcdGFDYWNoZWRTZW1hbnRpY09iamVjdHMucHVzaCh0aGlzLmxpbmtzQ2FjaGVbX29BcmdzW2ldWzBdLnNlbWFudGljT2JqZWN0XS5saW5rcyk7XG5cdFx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob0FyZ3NbaV1bMF0sIFwibGlua3NcIiwge1xuXHRcdFx0XHRcdFx0XHR2YWx1ZTogdGhpcy5saW5rc0NhY2hlW19vQXJnc1tpXVswXS5zZW1hbnRpY09iamVjdF0ubGlua3Ncblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzLnB1c2goX29BcmdzW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB7IG9sZEFyZ3M6IG9BcmdzLCBuZXdBcmdzOiBhTm9uQ2FjaGVkU2VtYW50aWNPYmplY3RzLCBjYWNoZWRMaW5rczogYUNhY2hlZFNlbWFudGljT2JqZWN0cyB9O1xuXHRcdH07XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMucmVzb2x2ZUZuID0gcmVzb2x2ZTtcblx0XHRcdHRoaXMucmVqZWN0Rm4gPSByZWplY3Q7XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb0Nyb3NzQXBwTmF2U2VydmljZVByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKTtcblx0XHRjb25zdCBvVXJsUGFyc2luZ1NlcnZpY2VQcm9taXNlID0gdGhpcy5vU2hlbGxDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKFwiVVJMUGFyc2luZ1wiKTtcblx0XHRjb25zdCBvU2hlbGxOYXZpZ2F0aW9uU2VydmljZVByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJTaGVsbE5hdmlnYXRpb25cIik7XG5cdFx0Y29uc3Qgb1NoZWxsUGx1Z2luTWFuYWdlclByb21pc2UgPSB0aGlzLm9TaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJQbHVnaW5NYW5hZ2VyXCIpO1xuXHRcdGNvbnN0IG9TaGVsbFVJU2VydmljZVByb21pc2UgPSBvQ29tcG9uZW50LmdldFNlcnZpY2UoXCJTaGVsbFVJU2VydmljZVwiKTtcblx0XHRQcm9taXNlLmFsbChbXG5cdFx0XHRvQ3Jvc3NBcHBOYXZTZXJ2aWNlUHJvbWlzZSxcblx0XHRcdG9VcmxQYXJzaW5nU2VydmljZVByb21pc2UsXG5cdFx0XHRvU2hlbGxOYXZpZ2F0aW9uU2VydmljZVByb21pc2UsXG5cdFx0XHRvU2hlbGxVSVNlcnZpY2VQcm9taXNlLFxuXHRcdFx0b1NoZWxsUGx1Z2luTWFuYWdlclByb21pc2Vcblx0XHRdKVxuXHRcdFx0LnRoZW4oKFtvQ3Jvc3NBcHBOYXZTZXJ2aWNlLCBvVXJsUGFyc2luZ1NlcnZpY2UsIG9TaGVsbE5hdmlnYXRpb24sIG9TaGVsbFVJU2VydmljZSwgb1NoZWxsUGx1Z2luTWFuYWdlcl0pID0+IHtcblx0XHRcdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgPSBvQ3Jvc3NBcHBOYXZTZXJ2aWNlO1xuXHRcdFx0XHR0aGlzLnVybFBhcnNpbmdTZXJ2aWNlID0gb1VybFBhcnNpbmdTZXJ2aWNlO1xuXHRcdFx0XHR0aGlzLnNoZWxsTmF2aWdhdGlvbiA9IG9TaGVsbE5hdmlnYXRpb247XG5cdFx0XHRcdHRoaXMuc2hlbGxVSVNlcnZpY2UgPSBvU2hlbGxVSVNlcnZpY2U7XG5cdFx0XHRcdHRoaXMuc2hlbGxQbHVnaW5NYW5hZ2VyID0gb1NoZWxsUGx1Z2luTWFuYWdlcjtcblx0XHRcdFx0dGhpcy5yZXNvbHZlRm4oKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2godGhpcy5yZWplY3RGbik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0YXJnZXQgbGlua3MgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBzZW1hbnRpYyBvYmplY3QgJiBhY3Rpb25cblx0ICogV2lsbCByZXRyaWV2ZSB0aGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cblx0ICogc2VydmljZSByZWZlcmVuY2UgY2FsbCB0aGUgZ2V0TGlua3MgbWV0aG9kLiBJbiBjYXNlIHNlcnZpY2UgaXMgbm90IGF2YWlsYWJsZSBvciBhbnkgZXhjZXB0aW9uXG5cdCAqIG1ldGhvZCB0aHJvd3MgZXhjZXB0aW9uIGVycm9yIGluIGNvbnNvbGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0TGlua3MgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byB0YXJnZXQgbGlua3MgYXJyYXlcblx0ICovXG5cdGdldExpbmtzKG9BcmdzOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZVxuXHRcdFx0XHQuZ2V0TGlua3Mob0FyZ3MpXG5cdFx0XHRcdC5mYWlsKChvRXJyb3I6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoYCR7b0Vycm9yfSBzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaGVsbFNlcnZpY2VzRmFjdG9yeS5nZXRMaW5rc2ApKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4ocmVzb2x2ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0YXJnZXQgbGlua3MgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBzZW1hbnRpYyBvYmplY3QgJiBhY3Rpb24gaW4gY2FjaGVcblx0ICogV2lsbCByZXRyaWV2ZSB0aGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cblx0ICogc2VydmljZSByZWZlcmVuY2UgY2FsbCB0aGUgZ2V0TGlua3MgbWV0aG9kLiBJbiBjYXNlIHNlcnZpY2UgaXMgbm90IGF2YWlsYWJsZSBvciBhbnkgZXhjZXB0aW9uXG5cdCAqIG1ldGhvZCB0aHJvd3MgZXhjZXB0aW9uIGVycm9yIGluIGNvbnNvbGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0TGlua3MgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byB0YXJnZXQgbGlua3MgYXJyYXlcblx0ICovXG5cdGdldExpbmtzV2l0aENhY2hlKG9BcmdzOiBvYmplY3QpOiBQcm9taXNlPGFueVtdPiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0aWYgKChvQXJncyBhcyBPYmplY3RbXSkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJlc29sdmUoW10pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0NhY2hlUmVzdWx0cyA9IHRoaXMuZm5GaW5kU2VtYW50aWNPYmplY3RzSW5DYWNoZShvQXJncyk7XG5cblx0XHRcdFx0aWYgKG9DYWNoZVJlc3VsdHMubmV3QXJncy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXNvbHZlKG9DYWNoZVJlc3VsdHMuY2FjaGVkTGlua3MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0XHRcdHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlXG5cdFx0XHRcdFx0XHQuZ2V0TGlua3Mob0NhY2hlUmVzdWx0cy5uZXdBcmdzKVxuXHRcdFx0XHRcdFx0LmZhaWwoKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoYCR7b0Vycm9yfSBzYXAuZmUuY29yZS5zZXJ2aWNlcy5TaGVsbFNlcnZpY2VzRmFjdG9yeS5nZXRMaW5rc1dpdGhDYWNoZWApKTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGhlbigoYUxpbmtzOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKGFMaW5rcy5sZW5ndGggIT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvU2VtYW50aWNPYmplY3RzTGlua3M6IGFueSA9IHt9O1xuXG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChhTGlua3NbaV0ubGVuZ3RoID4gMCAmJiBvQ2FjaGVSZXN1bHRzLm5ld0FyZ3NbaV1bMF0ubGlua3MgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RzTGlua3Nbb0NhY2hlUmVzdWx0cy5uZXdBcmdzW2ldWzBdLnNlbWFudGljT2JqZWN0XSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsaW5rczogYUxpbmtzW2ldXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMubGlua3NDYWNoZSA9IE9iamVjdC5hc3NpZ24odGhpcy5saW5rc0NhY2hlLCBvU2VtYW50aWNPYmplY3RzTGlua3MpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChvQ2FjaGVSZXN1bHRzLmNhY2hlZExpbmtzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoYUxpbmtzKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhTWVyZ2VkTGlua3MgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaiA9IDA7XG5cblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IG9DYWNoZVJlc3VsdHMub2xkQXJncy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGogPCBhTGlua3MubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhTGlua3Nbal0ubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9DYWNoZVJlc3VsdHMub2xkQXJnc1trXVswXS5zZW1hbnRpY09iamVjdCA9PT0gb0NhY2hlUmVzdWx0cy5uZXdBcmdzW2pdWzBdLnNlbWFudGljT2JqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXJnZWRMaW5rcy5wdXNoKGFMaW5rc1tqXSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aisrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXJnZWRMaW5rcy5wdXNoKG9DYWNoZVJlc3VsdHMub2xkQXJnc1trXVswXS5saW5rcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXJnZWRMaW5rcy5wdXNoKG9DYWNoZVJlc3VsdHMub2xkQXJnc1trXVswXS5saW5rcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoYU1lcmdlZExpbmtzKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIHJldHJpZXZlIHRoZSBTaGVsbENvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIHNhcC51c2hlbGwuY29udGFpbmVyXG5cdCAqIEByZXR1cm5zIE9iamVjdCB3aXRoIHByZWRlZmluZWQgc2hlbGxDb250YWluZXIgbWV0aG9kc1xuXHQgKi9cblx0Z2V0U2hlbGxDb250YWluZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1NoZWxsQ29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCB0b0V4dGVybmFsIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggTmF2aWdhdGlvbiBBcmd1bWVudHMgYW5kIG9Db21wb25lbnQuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb05hdkFyZ3VtZW50c0FyciBBbmRcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+dG9FeHRlcm5hbCBhcmd1bWVudHNcblx0ICovXG5cdHRvRXh0ZXJuYWwob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KTogdm9pZCB7XG5cdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UudG9FeHRlcm5hbChvTmF2QXJndW1lbnRzQXJyLCBvQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHRhcmdldCBzdGFydHVwQXBwU3RhdGVcblx0ICogV2lsbCBjaGVjayB0aGUgZXhpc3RhbmNlIG9mIHRoZSBTaGVsbENvbnRhaW5lciBhbmQgcmV0cmlldmUgdGhlIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uXG5cdCAqIHNlcnZpY2UgcmVmZXJlbmNlIGNhbGwgdGhlIGdldFN0YXJ0dXBBcHBTdGF0ZSBtZXRob2QuIEluIGNhc2Ugc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9yIGFueSBleGNlcHRpb25cblx0ICogbWV0aG9kIHRocm93cyBleGNlcHRpb24gZXJyb3IgaW4gY29uc29sZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQXJncyBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5nZXRTdGFydHVwQXBwU3RhdGUgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBPYmplY3Rcblx0ICovXG5cdGdldFN0YXJ0dXBBcHBTdGF0ZShvQXJnczogQ29tcG9uZW50KTogUHJvbWlzZTx1bmRlZmluZWQgfCBTdGFydHVwQXBwU3RhdGU+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gSlF1ZXJ5IFByb21pc2UgYmVoYXZlcyBkaWZmZXJlbnRseVxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHQodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KVxuXHRcdFx0XHQuZ2V0U3RhcnR1cEFwcFN0YXRlKG9BcmdzKVxuXHRcdFx0XHQuZmFpbCgob0Vycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZWplY3QobmV3IEVycm9yKGAke29FcnJvcn0gc2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc0ZhY3RvcnkuZ2V0U3RhcnR1cEFwcFN0YXRlYCkpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigoc3RhcnR1cEFwcFN0YXRlOiB1bmRlZmluZWQgfCBTdGFydHVwQXBwU3RhdGUpID0+IHJlc29sdmUoc3RhcnR1cEFwcFN0YXRlKSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGJhY2tUb1ByZXZpb3VzQXBwIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBTb21ldGhpbmcgdGhhdCBpbmRpY2F0ZSB3ZSd2ZSBuYXZpZ2F0ZWRcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRiYWNrVG9QcmV2aW91c0FwcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuYmFja1RvUHJldmlvdXNBcHAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgaHJlZkZvckV4dGVybmFsIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9BcmdzIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICogQHBhcmFtIGJBc3luYyBXaGV0aGVyIHRoaXMgY2FsbCBzaG91bGQgYmUgYXN5bmMgb3Igbm90XG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmhyZWZGb3JFeHRlcm5hbCBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHN0cmluZ1xuXHQgKi9cblx0aHJlZkZvckV4dGVybmFsKG9BcmdzOiBvYmplY3QsIG9Db21wb25lbnQ/OiBvYmplY3QsIGJBc3luYz86IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuaHJlZkZvckV4dGVybmFsKG9BcmdzLCBvQ29tcG9uZW50IGFzIG9iamVjdCwgISFiQXN5bmMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBocmVmRm9yRXh0ZXJuYWwgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0FyZ3MgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogQHBhcmFtIG9Db21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5ocmVmRm9yRXh0ZXJuYWxBc3luYyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHN0cmluZ1xuXHQgKi9cblx0aHJlZkZvckV4dGVybmFsQXN5bmMob0FyZ3M6IG9iamVjdCwgb0NvbXBvbmVudD86IG9iamVjdCkge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5ocmVmRm9yRXh0ZXJuYWxBc3luYyhvQXJncywgb0NvbXBvbmVudCBhcyBvYmplY3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBnZXRBcHBTdGF0ZSBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIG9Db21wb25lbnQgYW5kIG9BcHBTdGF0ZUtleS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50XG5cdCAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0QXBwU3RhdGUgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBvYmplY3Rcblx0ICovXG5cdGdldEFwcFN0YXRlKG9Db21wb25lbnQ6IENvbXBvbmVudCwgc0FwcFN0YXRlS2V5OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gd3JhcEpRdWVyeVByb21pc2UoKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlIGFzIGFueSkuZ2V0QXBwU3RhdGUob0NvbXBvbmVudCwgc0FwcFN0YXRlS2V5KSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGNyZWF0ZUVtcHR5QXBwU3RhdGUgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2Ugd2l0aCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Y3JlYXRlRW1wdHlBcHBTdGF0ZSBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIG9iamVjdFxuXHQgKi9cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlIGFzIGFueSkuY3JlYXRlRW1wdHlBcHBTdGF0ZShvQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgY3JlYXRlRW1wdHlBcHBTdGF0ZUFzeW5jIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggb0NvbXBvbmVudC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50IENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIG9iamVjdFxuXHQgKi9cblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZUFzeW5jKG9Db21wb25lbnQ6IENvbXBvbmVudCkge1xuXHRcdHJldHVybiAodGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UgYXMgYW55KS5jcmVhdGVFbXB0eUFwcFN0YXRlQXN5bmMob0NvbXBvbmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzTmF2aWdhdGlvblN1cHBvcnRlZCBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIE5hdmlnYXRpb24gQXJndW1lbnRzIGFuZCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9OYXZBcmd1bWVudHNBcnJcblx0ICogQHBhcmFtIG9Db21wb25lbnQgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+aXNOYXZpZ2F0aW9uU3VwcG9ydGVkIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRpc05hdmlnYXRpb25TdXBwb3J0ZWQob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHdyYXBKUXVlcnlQcm9taXNlKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmlzTmF2aWdhdGlvblN1cHBvcnRlZChvTmF2QXJndW1lbnRzQXJyLCBvQ29tcG9uZW50KSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzSW5pdGlhbE5hdmlnYXRpb24gbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gYm9vbGVhblxuXHQgKi9cblx0aXNJbml0aWFsTmF2aWdhdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuaXNJbml0aWFsTmF2aWdhdGlvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBpc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMgbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gYm9vbGVhblxuXHQgKi9cblx0aXNJbml0aWFsTmF2aWdhdGlvbkFzeW5jKCkge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5pc0luaXRpYWxOYXZpZ2F0aW9uQXN5bmMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZXhwYW5kQ29tcGFjdEhhc2ggbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBzSGFzaEZyYWdtZW50IEFuIChpbnRlcm5hbCBmb3JtYXQpIHNoZWxsIGhhc2hcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoZSBzdWNjZXNzIGhhbmRsZXIgb2YgdGhlIHJlc29sdmUgcHJvbWlzZSBnZXQgYW4gZXhwYW5kZWQgc2hlbGwgaGFzaCBhcyBmaXJzdCBhcmd1bWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGV4cGFuZENvbXBhY3RIYXNoKHNIYXNoRnJhZ21lbnQ6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmNyb3NzQXBwTmF2U2VydmljZS5leHBhbmRDb21wYWN0SGFzaChzSGFzaEZyYWdtZW50KTtcblx0fVxuXG5cdGdldEhhc2goKSB7XG5cdFx0cmV0dXJuIGAjJHt0aGlzLnVybFBhcnNpbmdTZXJ2aWNlLmdldFNoZWxsSGFzaCh3aW5kb3cubG9jYXRpb24uaHJlZil9YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgcGFyc2VTaGVsbEhhc2ggbWV0aG9kIG9mIFVSTFBhcnNpbmcgc2VydmljZSB3aXRoIGdpdmVuIHNIYXNoLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNIYXNoIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuVVJMUGFyc2luZz0+cGFyc2VTaGVsbEhhc2ggYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIFRoZSBwYXJzZWQgdXJsXG5cdCAqL1xuXHRwYXJzZVNoZWxsSGFzaChzSGFzaDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMudXJsUGFyc2luZ1NlcnZpY2UucGFyc2VTaGVsbEhhc2goc0hhc2gpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzcGxpdEhhc2ggbWV0aG9kIG9mIFVSTFBhcnNpbmcgc2VydmljZSB3aXRoIGdpdmVuIHNIYXNoLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNIYXNoIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuVVJMUGFyc2luZz0+c3BsaXRIYXNoIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRzcGxpdEhhc2goc0hhc2g6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLnVybFBhcnNpbmdTZXJ2aWNlLnNwbGl0SGFzaChzSGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGNvbnN0cnVjdFNoZWxsSGFzaCBtZXRob2Qgb2YgVVJMUGFyc2luZyBzZXJ2aWNlIHdpdGggZ2l2ZW4gc0hhc2guXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb05ld1NoZWxsSGFzaCBDaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLlVSTFBhcnNpbmc9PmNvbnN0cnVjdFNoZWxsSGFzaCBhcmd1bWVudHNcblx0ICogQHJldHVybnMgU2hlbGwgSGFzaCBzdHJpbmdcblx0ICovXG5cdGNvbnN0cnVjdFNoZWxsSGFzaChvTmV3U2hlbGxIYXNoOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gdGhpcy51cmxQYXJzaW5nU2VydmljZS5jb25zdHJ1Y3RTaGVsbEhhc2gob05ld1NoZWxsSGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNldERpcnR5RmxhZyBtZXRob2Qgd2l0aCBnaXZlbiBkaXJ0eSBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBiRGlydHkgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Ygc2FwLnVzaGVsbC5Db250YWluZXIuc2V0RGlydHlGbGFnIGFyZ3VtZW50c1xuXHQgKi9cblx0c2V0RGlydHlGbGFnKGJEaXJ0eTogYm9vbGVhbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLnNldERpcnR5RmxhZyhiRGlydHkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCByZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBtZXRob2Qgd2l0aCBnaXZlbiBkaXJ0eSBzdGF0ZSBwcm92aWRlciBjYWxsYmFjayBtZXRob2QuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gZm5EaXJ0eVN0YXRlUHJvdmlkZXIgQ2hlY2sgdGhlIGRlZmluaXRpb24gb2Ygc2FwLnVzaGVsbC5Db250YWluZXIucmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgYXJndW1lbnRzXG5cdCAqL1xuXHRyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24pIHtcblx0XHR0aGlzLm9TaGVsbENvbnRhaW5lci5yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcik7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgbWV0aG9kIHdpdGggZ2l2ZW4gZGlydHkgc3RhdGUgcHJvdmlkZXIgY2FsbGJhY2sgbWV0aG9kLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGZuRGlydHlTdGF0ZVByb3ZpZGVyIENoZWNrIHRoZSBkZWZpbml0aW9uIG9mIHNhcC51c2hlbGwuQ29udGFpbmVyLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgYXJndW1lbnRzXG5cdCAqL1xuXHRkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBjcmVhdGVSZW5kZXJlciBtZXRob2Qgb2YgdXNoZWxsIGNvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgcmVuZGVyZXIgb2JqZWN0XG5cdCAqL1xuXHRjcmVhdGVSZW5kZXJlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5vU2hlbGxDb250YWluZXIuY3JlYXRlUmVuZGVyZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZ2V0VXNlciBtZXRob2Qgb2YgdXNoZWxsIGNvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgVXNlciBvYmplY3Rcblx0ICovXG5cdGdldFVzZXIoKSB7XG5cdFx0cmV0dXJuICh0aGlzLm9TaGVsbENvbnRhaW5lciBhcyBhbnkpLmdldFVzZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNoZWNrIGlmIHVzaGVsbCBjb250YWluZXIgaXMgYXZhaWxhYmxlIG9yIG5vdC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZVxuXHQgKi9cblx0aGFzVVNoZWxsKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCByZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIgbWV0aG9kIG9mIHNoZWxsTmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGZuTmF2RmlsdGVyIFRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gcmVnaXN0ZXJcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRyZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXI6IEZ1bmN0aW9uKSB7XG5cdFx0KHRoaXMuc2hlbGxOYXZpZ2F0aW9uIGFzIGFueSkucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgdW5yZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIgbWV0aG9kIG9mIHNoZWxsTmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGZuTmF2RmlsdGVyIFRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gdW5yZWdpc3RlclxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbikge1xuXHRcdCh0aGlzLnNoZWxsTmF2aWdhdGlvbiBhcyBhbnkpLnVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgc2V0QmFja05hdmlnYXRpb24gbWV0aG9kIG9mIFNoZWxsVUlTZXJ2aWNlXG5cdCAqIHRoYXQgZGlzcGxheXMgdGhlIGJhY2sgYnV0dG9uIGluIHRoZSBzaGVsbCBoZWFkZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBbZm5DYWxsQmFja10gQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQgaW4gdGhlIFVJLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHNldEJhY2tOYXZpZ2F0aW9uKGZuQ2FsbEJhY2s/OiBGdW5jdGlvbik6IHZvaWQge1xuXHRcdHRoaXMuc2hlbGxVSVNlcnZpY2Uuc2V0QmFja05hdmlnYXRpb24oZm5DYWxsQmFjayk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNldEhpZXJhcmNoeSBtZXRob2Qgb2YgU2hlbGxVSVNlcnZpY2Vcblx0ICogdGhhdCBkaXNwbGF5cyB0aGUgZ2l2ZW4gaGllcmFyY2h5IGluIHRoZSBzaGVsbCBoZWFkZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBbYUhpZXJhcmNoeUxldmVsc10gQW4gYXJyYXkgcmVwcmVzZW50aW5nIGhpZXJhcmNoaWVzIG9mIHRoZSBjdXJyZW50bHkgZGlzcGxheWVkIGFwcC5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRIaWVyYXJjaHkoYUhpZXJhcmNoeUxldmVsczogQXJyYXk8b2JqZWN0Pik6IHZvaWQge1xuXHRcdHRoaXMuc2hlbGxVSVNlcnZpY2Uuc2V0SGllcmFyY2h5KGFIaWVyYXJjaHlMZXZlbHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzZXRUaXRsZSBtZXRob2Qgb2YgU2hlbGxVSVNlcnZpY2Vcblx0ICogdGhhdCBkaXNwbGF5cyB0aGUgZ2l2ZW4gdGl0bGUgaW4gdGhlIHNoZWxsIGhlYWRlci5cblx0ICpcblx0ICogQHBhcmFtIFtzVGl0bGVdIFRoZSBuZXcgdGl0bGUuIFRoZSBkZWZhdWx0IHRpdGxlIGlzIHNldCBpZiB0aGlzIGFyZ3VtZW50IGlzIG5vdCBnaXZlbi5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRUaXRsZShzVGl0bGU6IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuc2hlbGxVSVNlcnZpY2Uuc2V0VGl0bGUoc1RpdGxlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnRseSBkZWZpbmVkIGNvbnRlbnQgZGVuc2l0eS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRlbnQgZGVuc2l0eSB2YWx1ZVxuXHQgKi9cblx0Z2V0Q29udGVudERlbnNpdHkoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gKHRoaXMub1NoZWxsQ29udGFpbmVyIGFzIGFueSkuZ2V0VXNlcigpLmdldENvbnRlbnREZW5zaXR5KCk7XG5cdH1cblxuXHQvKipcblx0ICogRm9yIGEgZ2l2ZW4gc2VtYW50aWMgb2JqZWN0LCB0aGlzIG1ldGhvZCBjb25zaWRlcnMgYWxsIGFjdGlvbnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzZW1hbnRpYyBvYmplY3QgYW5kXG5cdCAqIHJldHVybnMgdGhlIG9uZSB0YWdnZWQgYXMgYSBcInByaW1hcnlBY3Rpb25cIi4gSWYgbm8gaW5ib3VuZCB0YWdnZWQgYXMgXCJwcmltYXJ5QWN0aW9uXCIgZXhpc3RzLCB0aGVuIGl0IHJldHVybnNcblx0ICogdGhlIGludGVudCBvZiB0aGUgZmlyc3QgaW5ib3VuZCAoYWZ0ZXIgc29ydGluZyBoYXMgYmVlbiBhcHBsaWVkKSBtYXRjaGluZyB0aGUgYWN0aW9uIFwiZGlzcGxheUZhY3RTaGVldFwiLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNTZW1hbnRpY09iamVjdCBTZW1hbnRpYyBvYmplY3QuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBTZWUgI0Nyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uI2dldExpbmtzIGZvciBkZXNjcmlwdGlvbi5cblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHdpdGggYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGludGVudCBpZiBpdCBleGlzdHMuXG5cdCAqL1xuXHRnZXRQcmltYXJ5SW50ZW50KHNTZW1hbnRpY09iamVjdDogc3RyaW5nLCBtUGFyYW1ldGVycz86IG9iamVjdCk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2Vcblx0XHRcdFx0LmdldFByaW1hcnlJbnRlbnQoc1NlbWFudGljT2JqZWN0LCBtUGFyYW1ldGVycylcblx0XHRcdFx0LmZhaWwoKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihgJHtvRXJyb3J9IHNhcC5mZS5jb3JlLnNlcnZpY2VzLlNoZWxsU2VydmljZXNGYWN0b3J5LmdldFByaW1hcnlJbnRlbnRgKSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKHJlc29sdmUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdhaXQgZm9yIHRoZSByZW5kZXIgZXh0ZW5zaW9ucyBwbHVnaW4gdG8gYmUgbG9hZGVkLlxuXHQgKiBJZiB0cnVlIGlzIHJldHVybmVkIGJ5IHRoZSBwcm9taXNlIHdlIHdlcmUgYWJsZSB0byB3YWl0IGZvciBpdCwgb3RoZXJ3aXNlIHdlIGNvdWxkbid0IGFuZCBjYW5ub3QgcmVseSBvbiBpdC5cblx0ICovXG5cdHdhaXRGb3JQbHVnaW5zTG9hZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGlmICghdGhpcy5zaGVsbFBsdWdpbk1hbmFnZXI/LmdldFBsdWdpbkxvYWRpbmdQcm9taXNlKSB7XG5cdFx0XHRcdHJlc29sdmUoZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHRcdHRoaXMuc2hlbGxQbHVnaW5NYW5hZ2VyXG5cdFx0XHRcdFx0LmdldFBsdWdpbkxvYWRpbmdQcm9taXNlKFwiUmVuZGVyZXJFeHRlbnNpb25zXCIpXG5cdFx0XHRcdFx0LmZhaWwoKG9FcnJvcjogdW5rbm93bikgPT4ge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKG9FcnJvciBhcyBzdHJpbmcsIFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc0ZhY3Rvcnkud2FpdEZvclBsdWdpbnNMb2FkXCIpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbigoKSA9PiByZXNvbHZlKHRydWUpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG4vKipcbiAqIFNlcnZpY2UgRmFjdG9yeSBmb3IgdGhlIFNoZWxsU2VydmljZXNcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5jbGFzcyBTaGVsbFNlcnZpY2VzRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PFNoZWxsU2VydmljZXNTZXR0aW5ncz4ge1xuXHQvKipcblx0ICogQ3JlYXRlcyBlaXRoZXIgYSBzdGFuZGFyZCBvciBhIG1vY2sgU2hlbGwgc2VydmljZSBkZXBlbmRpbmcgb24gdGhlIGNvbmZpZ3VyYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VydmljZUNvbnRleHQgVGhlIHNoZWxsc2VydmljZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgYSBzaGVsbCBzZXJ2aWNlIGltcGxlbWVudGF0aW9uXG5cdCAqIEBzZWUgU2VydmljZUZhY3RvcnkjY3JlYXRlSW5zdGFuY2Vcblx0ICovXG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPik6IFByb21pc2U8SVNoZWxsU2VydmljZXM+IHtcblx0XHRvU2VydmljZUNvbnRleHQuc2V0dGluZ3Muc2hlbGxDb250YWluZXIgPSBzYXAudXNoZWxsICYmIChzYXAudXNoZWxsLkNvbnRhaW5lciBhcyBDb250YWluZXIpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2UgPSBvU2VydmljZUNvbnRleHQuc2V0dGluZ3Muc2hlbGxDb250YWluZXJcblx0XHRcdD8gbmV3IFNoZWxsU2VydmljZXMob1NlcnZpY2VDb250ZXh0IGFzIFNlcnZpY2VDb250ZXh0PFJlcXVpcmVkPFNoZWxsU2VydmljZXNTZXR0aW5ncz4+KVxuXHRcdFx0OiBuZXcgU2hlbGxTZXJ2aWNlTW9jayhvU2VydmljZUNvbnRleHQpO1xuXHRcdHJldHVybiBvU2hlbGxTZXJ2aWNlLmluaXRQcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0Ly8gRW5yaWNoIHRoZSBhcHBDb21wb25lbnQgd2l0aCB0aGlzIG1ldGhvZFxuXHRcdFx0b1NlcnZpY2VDb250ZXh0LnNjb3BlT2JqZWN0LmdldFNoZWxsU2VydmljZXMgPSAoKSA9PiBvU2hlbGxTZXJ2aWNlO1xuXHRcdFx0cmV0dXJuIG9TaGVsbFNlcnZpY2U7XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2hlbGxTZXJ2aWNlc0ZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQWlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQSxJQU1NQSxnQkFBZ0I7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FLckJDLElBQUksR0FBSixnQkFBTztNQUNOLElBQUksQ0FBQ0MsV0FBVyxHQUFHQyxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7TUFDeEMsSUFBSSxDQUFDQyxZQUFZLEdBQUcsTUFBTTtJQUMzQixDQUFDO0lBQUEsT0FFREMsUUFBUSxHQUFSLG1CQUFTO0lBQUEsRUFBbUI7TUFDM0IsT0FBT0gsT0FBTyxDQUFDQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVERyxpQkFBaUIsR0FBakIsNEJBQWtCO0lBQUEsRUFBbUI7TUFDcEMsT0FBT0osT0FBTyxDQUFDQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFBQSxPQUVESSxVQUFVLEdBQVYscUJBQVc7SUFBQSxFQUF5RDtNQUNuRTtJQUFBLENBQ0E7SUFBQSxPQUVEQyxrQkFBa0IsR0FBbEIsNkJBQW1CO0lBQUEsRUFBbUI7TUFDckMsT0FBT04sT0FBTyxDQUFDQyxPQUFPLENBQUNNLFNBQVMsQ0FB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