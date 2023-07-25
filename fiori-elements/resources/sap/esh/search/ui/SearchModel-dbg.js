/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
function _invokeIgnored(body) {
  var result = body();
  if (result && result.then) {
    return result.then(_empty);
  }
}
function _continue(value, then) {
  return value && value.then ? value.then(then) : then(value);
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
sap.ui.define(["./i18n", "sap/base/Log", "./error/ErrorHandler", "sap/esh/search/ui/SearchHelper", "sap/ui/model/json/JSONModel", "sap/esh/search/ui/SearchResultFormatter", "sap/esh/search/ui/SearchTabStripsFormatter", "sap/esh/search/ui/SearchResultTableFormatter", "sap/esh/search/ui/SearchFacetsFormatter", "sap/esh/search/ui/BreadcrumbsFormatter", "sap/esh/search/ui/suggestions/SuggestionHandler", "sap/esh/search/ui/SearchConfiguration", "sap/esh/search/ui/personalization/PersonalizationStorage", "sap/esh/search/ui/personalization/keyValueStoreFactory", "sap/esh/search/ui/sinaNexTS/providers/abap_odata/UserEventLogger", "sap/esh/search/ui/eventlogging/EventLogger", "sap/esh/search/ui/SearchUrlParser", "sap/esh/search/ui/cFLPUtil", "sap/esh/search/ui/usercategories/UserCategoryManager", "sap/esh/search/ui/error/errors", "sap/esh/search/ui/RecentlyUsedStorage", "./sinaNexTS/sina/SinaConfiguration", "./sinaNexTS/sina/sinaFactory", "./sinaNexTS/core/Log", "./SearchResultItemMemory", "./FolderModeUtils", "sap/ui/core/library", "./sinaNexTS/sina/HierarchyDisplayType", "./UIEvents", "./SearchShellHelperHorizonTheme", "./SearchConfigurationSettings", "./BusyIndicator", "./sinaNexTS/sina/Filter"], function (__i18n, Log, __ErrorHandler, SearchHelper, JSONModel, SearchResultFormatter, sap_esh_search_ui_SearchTabStripsFormatter, SearchResultTableFormatter, SearchFacetsFormatter, BreadcrumbsFormatter, SuggestionHandler, SearchConfiguration, PersonalizationStorage, keyValueStoreFactory, UserEventLogger, EventLogger, SearchUrlParser, cFLPUtil, UserCategoryManager, errors, RecentlyUsedStorage, ___sinaNexTS_sina_SinaConfiguration, sinaFactory, ___sinaNexTS_core_Log, __SearchResultSetItemMemory, ___FolderModeUtils, sap_ui_core_library, ___sinaNexTS_sina_HierarchyDisplayType, __UIEvents, __SearchShellHelperHorizonTheme, ___SearchConfigurationSettings, ___BusyIndicator, ___sinaNexTS_sina_Filter) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var i18n = _interopRequireDefault(__i18n);
  var Level = Log["Level"];
  var ErrorHandler = _interopRequireDefault(__ErrorHandler);
  var SearchTabStripsFormatter = sap_esh_search_ui_SearchTabStripsFormatter["Formatter"];
  // import TransactionsHandler from "sap/esh/search/ui/searchtermhandler/TransactionsHandler";
  var UserEventType = UserEventLogger["UserEventType"];
  var AvailableProviders = ___sinaNexTS_sina_SinaConfiguration["AvailableProviders"];
  var Severity = ___sinaNexTS_core_Log["Severity"];
  var SearchResultSetItemMemory = _interopRequireDefault(__SearchResultSetItemMemory);
  var FolderModeResultViewTypeCalculator = ___FolderModeUtils["FolderModeResultViewTypeCalculator"];
  var MessageType = sap_ui_core_library["MessageType"];
  var HierarchyDisplayType = ___sinaNexTS_sina_HierarchyDisplayType["HierarchyDisplayType"];
  var UIEvents = _interopRequireDefault(__UIEvents);
  var SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  var sinaParameters = ___SearchConfigurationSettings["sinaParameters"];
  var BusyIndicator = ___BusyIndicator["BusyIndicator"];
  var Filter = ___sinaNexTS_sina_Filter["Filter"];
  /**
   * @namespace sap.esh.search.ui
   */
  var SearchModel = JSONModel.extend("sap.esh.search.ui.SearchModel", {
    constructor: function _constructor(settings) {
      var _oSettings$searchMode;
      JSONModel.prototype.constructor.call(this, []);
      this.searchTermHandlers = [];
      this.logger = Log.getLogger("sap.esh.search.ui.SearchModel");
      var oSettings = settings || {};

      // get search configuration
      this.config = new SearchConfiguration(oSettings === null || oSettings === void 0 ? void 0 : oSettings.configuration);

      // memory for result set items storing for instance expansion state of item
      this.searchResultSetItemMemory = new SearchResultSetItemMemory();

      // set size limit in order to allow drop down list boxes with more than 100 entries
      this.setSizeLimit(1000);

      // create suggestions handler
      this._suggestionHandler = new SuggestionHandler({
        model: this
      });

      // result view type calculator for folder mode
      this.folderModeResultViewTypeCalculator = new FolderModeResultViewTypeCalculator(this);
      this._performanceLoggerSearchMethods = []; // performance logging: Remember all method names of (open) search calls (only needed if search calls are running in parallel)

      this._errorHandler = new ErrorHandler({
        model: this
      });

      // decorate search methods (decorator prevents request overtaking)
      this._searchApplicationsRefuseOutdatedReq = SearchHelper.refuseOutdatedRequests(this.searchApplications.bind(this), "search"); // app search

      // initial values for boTop and appTop
      this.pageSize = this.config.pageSize || 10;
      this.appTopDefault = 20;
      this.boTopDefault = this.pageSize;
      this.filterChanged = false;

      // init busy indicator
      this.busyIndicator = new BusyIndicator(this);

      // init the properties
      // TODO: always use main result list (also for pure app results)

      this.setProperty("/isQueryInvalidated", true); // force request if query did not change
      this.setProperty("/busyDelay", 0); //delay before showing busy indicator, initalize with 0 for intial app loading
      this.setProperty("/tableColumns", []); // columns of table view
      this.setProperty("/sortableAttributes", []); // sort items of result
      this.setProperty("/tableRows", []); // results suitable for table view
      this.setProperty("/results", []); // combined result list: apps + BOs
      this.setProperty("/appResults", []); // applications result list
      this.setProperty("/boResults", []); // business object result list
      this.setProperty("/breadcrumbsHierarchyNodePaths", []);
      this.setProperty("/breadcrumbsHierarchyAttribute", "");
      this.setProperty("/hierarchyNodePaths", []);
      this.setProperty("/origBoResults", []); // business object result list
      this.setProperty("/count", 0);
      this.setProperty("/countText", "");
      this.setProperty("/boCount", 0);
      this.setProperty("/appCount", 0);
      this.setProperty("/facets", []);
      this.setProperty("/dataSources", [this.allDataSource, this.appDataSource]);
      this.setProperty("/appSearchDataSource", null);
      this.setProperty("/currentPersoServiceProvider", null); // current persoServiceProvider of table
      this.setProperty("/businessObjSearchEnabled", true);
      this.setProperty("/initializingObjSearch", false);
      this.setProperty("/suggestions", []);
      this.setProperty("/resultViewTypes", []); // selectable result view types
      this.setProperty("/resultViewType", ""); // active result view type, default value set in calculateResultViewSwitchVisibility() in initBusinessObjSearch
      this.setProperty("/resultViewSwitchVisibility", false); // visibility of display switch tap strip
      this.setProperty("/documentTitle", "Search");
      this.setProperty("/top", this.boTopDefault);
      this.setProperty("/orderBy", {});
      this.setProperty("/facetVisibility", false); // visibility of facet panel
      this.setProperty("/focusIndex", 0);
      this.setProperty("/errors", []);
      this.setProperty("/isErrorPopovered", false);
      this.setProperty("/nlqSuccess", false);
      this.setProperty("/nlqDescription", "");
      this.setProperty("/firstSearchWasExecuted", false);
      this.setProperty("/multiSelectionAvailable", false); //
      this.setProperty("/multiSelectionEnabled", false); //
      this.setProperty("/multiSelection/actions", []); //
      this.setProperty("/multiSelectionSelected", false);
      this.setProperty("/multiSelectionObjects", []);
      this.setProperty("/singleSelectionSelected", false);
      this.setProperty("/inputHelpSelectedItems", null);
      this.setProperty("/inputHelp", null);
      this.setProperty("/config", this.config);
      this.setProperty("/searchInLabel", "");
      this.setProperty("/searchInIcon", "sap-icon://none"); // prevent assert: Property 'src' (value: '') should be a valid Icon ...'

      this.setProperty("/searchButtonStatus", "Search");
      this._subscribers = [];
      this.searchUrlParser = new SearchUrlParser({
        model: this
      });
      this._userCategoryManagerPromise = null;
      this._tempDataSources = [];

      // used for SearchFacetDialogModel: SearchFacetDialogModel is constructed with reference to original searchModel
      // the _initBusinessObjSearchProm is reused from original searchModel in order to avoid double initialization
      // in initBusinessObjSearch
      if (oSettings !== null && oSettings !== void 0 && (_oSettings$searchMode = oSettings.searchModel) !== null && _oSettings$searchMode !== void 0 && _oSettings$searchMode.initAsyncPromise) {
        this.initAsyncPromise = oSettings.searchModel.initAsyncPromise;
        this.oFacetFormatter = new SearchFacetsFormatter(this);
      }

      // Rest of the initialization is done asynchronously:
      // this.initBusinessObjSearch();
      this.initAsyncPromise = this.initAsync();
    },
    initAsync: function _initAsync() {
      try {
        let _exit = false;
        const _this7 = this;
        var _this = _this7;
        // check cached promise
        if (_this7.initAsyncPromise) {
          return _await(_this7.initAsyncPromise);
        }

        // set dummy datasource indicating the loading phase
        _this7.setProperty("/initializingObjSearch", true);
        _this7.busyIndicator.setBusy(true);
        var dummyDataSourceForLoadingPhase = {
          label: i18n.getText("genericLoading"),
          labelPlural: i18n.getText("genericLoading"),
          enabled: false,
          id: "$$Loading$$"
        };
        _this7.setProperty("/dataSource", dummyDataSourceForLoadingPhase);
        _this7.setProperty("/dataSources", [dummyDataSourceForLoadingPhase]);
        return _await(_continue(_catch(function () {
          var _sap, _sap$ushell;
          return _await(keyValueStoreFactory.create(_this7.config.personalizationStorage, _this7.config.isUshell, _this7.config.id), function (keyValueStore) {
            _this7._personalizationStorage = new PersonalizationStorage(keyValueStore, _this7);
            if (_this7.config.bRecentSearches) {
              _this7.recentlyUsedStorage = new RecentlyUsedStorage({
                personalizationStorage: _this7._personalizationStorage,
                searchModel: _this7
              });
            }
            _this7.initFacetVisibility();
            // console.log(`initFacetVisibility: ${new Date().toTimeString()}`);

            // sina and datasources:
            return _await(_this7.createSina(), function (_this7$createSina) {
              _this7.sinaNext = _this7$createSina;
              _this7.sinaNext.filterBasedSearch = _async(function (oEvent, filter) {
                if (filter instanceof Filter) {
                  _this.setFilter(filter);
                }
                return _await();
              });
              _this7.createAllAndAppDataSource();

              // my favorites:
              return _invoke(function () {
                if (_this7.isMyFavoritesAvailable()) {
                  return _await(UserCategoryManager.create({
                    sina: _this7.sinaNext,
                    personalizationStorage: _this7._personalizationStorage
                  }), function (_UserCategoryManager$) {
                    _this7.userCategoryManager = _UserCategoryManager$;
                  });
                }
              }, function () {
                // usage tracking:
                var loggerProperties = {
                  sinaNext: _this7.sinaNext
                };
                if (typeof _this7.config.usageCollectionService !== "undefined") {
                  loggerProperties["usageCollectionService"] = _this7.config.usageCollectionService;
                }
                _this7.eventLogger = new EventLogger(loggerProperties);
                Object.assign(_this7.eventLogger, UserEventLogger.UserEventType); // ToDo: remove this line and adjust all "... .eventLogger." statements of ELISA
                var userEventSessionStart = {
                  type: _this7.eventLogger["SESSION_START"] // ToDo
                };

                _this7.eventLogger.logEvent(userEventSessionStart);

                // set default DataSource
                _this7.setProperty("/defaultDataSource", _this7.calculateDefaultDataSource());
                if (_this7.sinaNext.provider.id === "dummy") {
                  _this7.setProperty("/defaultDataSource", _this7.appDataSource);
                  _this7.setProperty("/businessObjSearchEnabled", false);
                  _this7.config.searchBusinessObjects = false;
                  _this7.setFacetVisibility(false, false);
                }
                if (_this7.sinaNext.provider.id === "inav2" && _this7.config.isUshell) {
                  // register enterprise search system
                  // this triggers a logoff request to the enteprise search backend in case of logoff from flp
                  // (this is not necessary for abap_odata because frontendserver system is registered by flp)
                  // load ushell deps lazy only in case of FLP
                  sap.ui.require(["sap/ushell/System"], function (System) {
                    sap.ushell.Container.addRemoteSystem(new System({
                      alias: "ENTERPRISE_SEARCH",
                      platform: "abap",
                      baseUrl: "/ENTERPRISE_SEARCH"
                    }));
                  });
                }
                _this7.setProperty("/uiFilter", _this7.sinaNext.createFilter());
                _this7.loadDataSources();
                _this7.resetDataSource(false);
                _this7.resetAllFilterConditions(false);
                // this.config.loadCustomModulesAsync();
                _this7.query = _this7.sinaNext.createSearchQuery();
                _this7.query.setMultiSelectFacets(true);
                _this7.oFacetFormatter = new SearchFacetsFormatter(_this7);
                _this7._tabStripFormatter = new SearchTabStripsFormatter(_this7.allDataSource, _this7);
                _this7._breadcrumbsFormatter = new BreadcrumbsFormatter.Formatter(_this7);
                _this7.dataSourceTree = _this7._tabStripFormatter.tree;
                // Set through the API of SearchCompositeControl:
                _this7.setSearchBoxTerm(_this7.config.searchTerm, false);
                if (_this7.config.dataSource) {
                  _this7.setDataSourceById(_this7.config.dataSource, false, false);
                }
                if (_this7.config.filterRootCondition) {
                  _this7.setFilterRootCondition(_this7.config.filterRootCondition);
                }
                _this7.setProperty("/initializingObjSearch", false);
                _this7.busyIndicator.setBusy(false);
                return _continue(_catch(function () {
                  return _awaitIgnored(_this7.config.initAsync(_this7));
                }, function (e) {
                  _this7.logger.warning("initAsync() which was passed to SearchConfiguration threw an error: " + e);
                }), function () {
                  return _invokeIgnored(function () {
                    if ((_sap = sap) !== null && _sap !== void 0 && (_sap$ushell = _sap.ushell) !== null && _sap$ushell !== void 0 && _sap$ushell.Container) {
                      return _await(sap.ushell.Container.getServiceAsync("VisualizationInstantiation"), function (_sap$ushell$Container) {
                        _this7.uShellVisualizationInstantiationService = _sap$ushell$Container;
                      });
                    }
                  }); // if (this.config.isUshell) {
                  //     // handle transactions only in ushell:
                  //     this.searchTermHandlers.push(new TransactionsHandler(this));
                  // }
                });
              });
            });
          });
        }, function (error) {
          _this7._errorHandler.onError(error);
          const _Promise$reject = Promise.reject(error);
          _exit = true;
          return _Promise$reject;
        }), function (_result) {
          return _exit ? _result : Promise.resolve();
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    createSina: function _createSina() {
      try {
        const _this8 = this;
        // no enterprise search configured -> return dummy sina
        if (!_this8.config.searchBusinessObjects) {
          return _await(sinaFactory.createAsync("dummy"));
        }
        // use url parameter
        // sinaConfiguration={"provider":"multi","subProviders":["abap_odata","inav2","sample"],"federationType":"round_robin"}
        // to active the multi provider
        var trials = [];
        if (window.location.href.indexOf("demo/FioriLaunchpad.") !== -1) {
          trials = [AvailableProviders.SAMPLE];
        } else {
          trials = [
          // {provider: 'multi', subProviders: ['abap_odata', 'inav2', 'sample'], federationType: 'round_robin'},
          // {provider: "multi", subProviders: [{ provider: "abap_odata", label: "a1", url: "/unvalid" }, { provider: "abap_odata", label: "a2", url: "/unvalid" }]},
          AvailableProviders.ABAP_ODATA, AvailableProviders.INAV2, AvailableProviders.DUMMY];
        }

        // cFlp
        return _await(cFLPUtil.readCFlpConfiguration(trials), function (_cFLPUtil$readCFlpCon) {
          trials = _cFLPUtil$readCFlpCon;
          // sina configuration from flp overwrites
          if (_this8.config.sinaConfiguration) {
            trials = [_this8.config.sinaConfiguration];
          }

          // mix search configuration into sina configuration
          trials = _this8.mixinSearchConfigurationIntoSinaConfiguration(trials);
          // try to create a sina by trying providers, first succesful provider wins
          return sinaFactory.createByTrialAsync(trials);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    mixinSearchConfigurationIntoSinaConfiguration: function _mixinSearchConfigurationIntoSinaConfiguration(sinaConfigurations) {
      var resultSinaConfigurations = [];
      for (var i = 0; i < sinaConfigurations.length; ++i) {
        var sinaConfiguration = sinaConfigurations[i];
        if (typeof sinaConfiguration === "string") {
          sinaConfiguration = {
            provider: sinaConfiguration,
            url: ""
          };
        }
        var _iterator = _createForOfIteratorHelper(sinaParameters),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var parameterName = _step.value;
            if (!sinaConfiguration[parameterName]) {
              sinaConfiguration[parameterName] = this.config[parameterName];
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        var sinaUI5Log = Log.getLogger("sap.esh.search.ui.eshclient");
        sinaConfiguration.logTarget = {
          debug: sinaUI5Log.debug,
          info: sinaUI5Log.info,
          warn: sinaUI5Log.warning,
          error: sinaUI5Log.error
        };
        var sinaLogLevel = Severity.ERROR;
        // map UI5 loglevel to Sina loglevel:
        switch (sinaUI5Log.getLevel()) {
          case Level.ALL:
          case Level.TRACE:
          case Level.DEBUG:
            sinaLogLevel = Severity.DEBUG;
            break;
          case Level.INFO:
            sinaLogLevel = Severity.INFO;
            break;
          case Level.WARNING:
            sinaLogLevel = Severity.WARN;
            break;
        }
        sinaConfiguration.logLevel = sinaLogLevel;
        resultSinaConfigurations.push(sinaConfiguration);
      }
      return resultSinaConfigurations;
    },
    initBusinessObjSearch: function _initBusinessObjSearch() {
      try {
        const _this9 = this;
        return _await(_this9.initAsync());
      } catch (e) {
        return Promise.reject(e);
      }
    },
    calculateDefaultDataSource: function _calculateDefaultDataSource() {
      var defaultDataSource = this.allDataSource;
      if (this.config.defaultSearchScopeApps) {
        // according config parameter, Apps as default
        defaultDataSource = this.appDataSource;
      }
      if (this.config.defaultDataSource) {
        // according config parameter, default dataSource id
        defaultDataSource = this.sinaNext.getDataSource(this.config.defaultDataSource);
      }
      if (this.userCategoryManager && this.userCategoryManager.isFavActive()) {
        // set user definded dataSource as default
        defaultDataSource = this.userCategoryManager.getCategory("MyFavorites");
      }
      return defaultDataSource;
    },
    initFacetVisibility: function _initFacetVisibility() {
      // check configuration
      if (this.config.optimizeForValueHelp) {
        this.setFacetVisibility(false, false);
        return;
      } else if (typeof this.config.facetVisibility !== "undefined") {
        this.setFacetVisibility(this.config.facetVisibility, false);
        return;
      }
      // check personalization
      var facetsVisible = false;
      try {
        facetsVisible = this._personalizationStorage.getItem("search-facet-panel-button-state"); // ToDo
      } catch (e) {
        //
      }
      this.setFacetVisibility(facetsVisible, false);
    },
    isBusinessObjSearchConfigured: function _isBusinessObjSearchConfigured() {
      try {
        var config = window["sap-ushell-config"].renderers.fiori2.componentData.config;
        return config.searchBusinessObjects !== "hidden";
      } catch (e) {
        return true;
      }
    },
    isBusinessObjSearchEnabled: function _isBusinessObjSearchEnabled() {
      // TODO: how does this differ from isBusinessObjSearchConfigured() above?
      return this.getProperty("/businessObjSearchEnabled");
    },
    setProperty: function _setProperty(sPath, oValue, oContext, bAsyncUpdate) {
      try {
        var res = JSONModel.prototype.setProperty.call(this, sPath, oValue, oContext, bAsyncUpdate);
        switch (sPath) {
          case "/boResults":
          case "/appResults":
            this.calculateResultList();
            break;
          case "/appCount":
          case "/boCount":
            res = this.setProperty("/count", this.getProperty("/appCount") + this.getProperty("/boCount"));
            break;
          case "/count":
            res = this.setProperty("/countText", this._calculateCountText());
            break;
          case "expanded":
            if (oContext && oContext.getPath().startsWith("/results/")) {
              var object = oContext.getObject();
              if (object.key && typeof oValue === "boolean") {
                var searchResultSetItem = object;
                this.searchResultSetItemMemory.setExpanded(searchResultSetItem.key, oValue);
              }
            }
            break;
          default:
            break;
        }
        return res;
      } catch (error) {
        this._errorHandler.onError(error);
      }
    },
    _calculateCountText: function _calculateCountText() {
      var count = this.getProperty("/count");
      // if (count > 0) {     // no results page displays context bar, thus "0" is better than 'nothing'
      if (this.getProperty("/nlqSuccess")) {
        return this.getProperty("/nlqDescription");
      }
      if (typeof count !== "number") {
        return ""; // robustness
      }

      var countAsStr = SearchHelper.formatInteger(count);

      // DWC exit
      if (this.getProperty("/searchInLabel")) {
        return (this.getProperty("/searchInLabel") || i18n.getText("results")) + " (" + countAsStr + ")";
      }
      return i18n.getText("results") + " (" + countAsStr + ")";
      // }
      return "";
    },
    getSearchCompositeControlInstanceByChildControl: function _getSearchCompositeControlInstanceByChildControl(childControlInstance) {
      if (typeof (childControlInstance === null || childControlInstance === void 0 ? void 0 : childControlInstance.hasStyleClass) === "function" && childControlInstance.hasStyleClass("sapUshellSearchInputHelpPage")) {
        return childControlInstance;
      } else if (typeof (childControlInstance === null || childControlInstance === void 0 ? void 0 : childControlInstance.getParent) === "function") {
        return this.getSearchCompositeControlInstanceByChildControl(childControlInstance.getParent());
      }
      return undefined;
    },
    getPersonalizationStorageInstance: function _getPersonalizationStorageInstance() {
      return this._personalizationStorage;
    },
    getSearchBoxTerm: function _getSearchBoxTerm() {
      return this.getProperty("/uiFilter/searchTerm") || "";
    },
    setSearchBoxTerm: function _setSearchBoxTerm(searchTerm, fireQuery) {
      searchTerm = searchTerm || "";
      var searchTermTrimLeft = searchTerm.replace(/^\s+/, ""); // TODO: rtl
      this.setProperty("/uiFilter/searchTerm", searchTermTrimLeft);
      this.calculateSearchButtonStatus();
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery();
      }
    },
    getLastSearchTerm: function _getLastSearchTerm() {
      return this.query.getSearchTerm();
    },
    setFacetVisibility: function _setFacetVisibility(visibility, fireQuery) {
      if (sap.ui.Device.system.phone) {
        visibility = false;
      }

      // set new value
      this.setProperty("/facetVisibility", visibility);

      // set button status in sap storage
      try {
        this._personalizationStorage.setItem("search-facet-panel-button-state", visibility);
      } catch (e) {
        //
      }
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery({
          preserveFormerResults: true
        });
      }
    },
    getFacetVisibility: function _getFacetVisibility() {
      return this.getProperty("/facetVisibility");
    },
    getTop: function _getTop() {
      return this.getProperty("/top");
    },
    setTop: function _setTop(top, fireQuery) {
      this.setProperty("/top", top);
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery({
          preserveFormerResults: true
        });
      }
    },
    resetTop: function _resetTop() {
      this.setProperty("/focusIndex", 0);
      if (this.isAppCategory() || this.isUserCategory() && this.userCategoryManager && this.userCategoryManager.getCategory("MyFavorites").subDataSources.length === 0) {
        this.setTop(this.appTopDefault, false);
      } else {
        this.setTop(this.boTopDefault, false);
      }
    },
    getOrderBy: function _getOrderBy() {
      return this.getProperty("/orderBy");
    },
    setOrderBy: function _setOrderBy(orderBy, fireQuery) {
      this.setProperty("/orderBy", orderBy);
      this.updateSortableAttributesSelection(orderBy.orderBy);
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery({
          preserveFormerResults: true
        });
      }
    },
    resetOrderBy: function _resetOrderBy(fireQuery) {
      this.setProperty("/orderBy", {});
      this.updateSortableAttributesSelection();
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery({
          preserveFormerResults: true
        });
      }
    },
    updateSortableAttributesSelection: function _updateSortableAttributesSelection(orderBy) {
      var sortableAttributes = this.getProperty("/sortableAttributes");
      if (sortableAttributes.length === 0) {
        return;
      }
      // unselect all attributes
      for (var i = 0; i < sortableAttributes.length; i++) {
        sortableAttributes[i].selected = false;
      }
      // select one attribute
      var orderById = orderBy === undefined ? "DEFAULT_SORT_ATTRIBUTE" : orderBy;
      for (var _i = 0; _i < sortableAttributes.length; _i++) {
        if (sortableAttributes[_i].attributeId === orderById) {
          sortableAttributes[_i].selected = true;
        }
      }
      this.setProperty("/sortableAttributes", sortableAttributes);
    },
    isEqualOrderBy: function _isEqualOrderBy(modelOrderBy, queryOrderBy) {
      // 1) no sort order given
      if (!modelOrderBy.orderBy) {
        return queryOrderBy.length === 0;
      }
      // 2) sort order given
      if (queryOrderBy.length !== 1) {
        return false;
      }
      var queryOrderByElement = queryOrderBy[0];
      if (queryOrderByElement.id !== modelOrderBy.orderBy) {
        return false;
      }
      if (modelOrderBy.sortOrder === "ASC") {
        return queryOrderByElement.order === this.sinaNext.SortOrder.Ascending;
      }
      return queryOrderByElement.order === this.sinaNext.SortOrder.Descending;
    },
    isMyFavoritesAvailable: function _isMyFavoritesAvailable() {
      var isAvailable = false;
      if (this.sinaNext.provider.id === "abap_odata") {
        isAvailable = true;
      }
      if (this.sinaNext.provider.id === "multi" && this.config.userDefinedDatasourcesMulti) {
        isAvailable = true;
      }
      return isAvailable;
    },
    getDocumentTitle: function _getDocumentTitle() {
      var searchTerm = this.getSearchBoxTerm();
      var dataSourceLabel = this.getDataSource().labelPlural || this.getDataSource().label;
      var title;
      if (this.getDataSource() === this.allDataSource) {
        title = i18n.getText("searchTileTitleProposalAll", [searchTerm]);
      } else {
        title = i18n.getText("searchTileTitleProposal", [searchTerm, dataSourceLabel]);
      }
      return title;
    },
    resetQuery: function _resetQuery() {
      // This resets the UI search model but not sina.
      // Deserializing a URL may NOT trigger a real ajax search request because also sina buffers the search results.
      // This is used for for back navigation from an object page to the search UI without triggering a new search request.
      if (this.getProperty("/initializingObjSearch")) {
        return;
      }
      SearchHelper.hasher.reset();
      this.resetTop();
      this.setSearchBoxTerm("", false);
      this.resetDataSource(false);
      this.resetAllFilterConditions(false);
      this.query.resetConditions();
      this.query.setSearchTerm("random-jgfhfdskjghrtekjhg");
      this.setProperty("/facets", []);
      this.setProperty("/results", []);
      this.setProperty("/appResults", []);
      this.setProperty("/boResults", []);
      this.setProperty("/breadcrumbsHierarchyNodePaths", []);
      this.setProperty("/breadcrumbsHierarchyAttribute", "");
      this.setProperty("/hierarchyNodePaths", []);
      this.setProperty("/origBoResults", []);
      this.setProperty("/count", 0);
      this.setProperty("/boCount", 0);
      this.setProperty("/appCount", 0);
    },
    resetSearchResultItemMemory: function _resetSearchResultItemMemory() {
      this.searchResultSetItemMemory.reset();
    },
    createAllAndAppDataSource: function _createAllAndAppDataSource() {
      // all data source
      this.allDataSource = this.sinaNext.getAllDataSource();
      this.allDataSource.label = i18n.getText("label_all");
      this.allDataSource.labelPlural = i18n.getText("label_all");

      // app datasource
      this.appDataSource = this.sinaNext._createDataSource({
        id: "$$APPS$$",
        label: i18n.getText("label_apps"),
        labelPlural: i18n.getText("label_apps"),
        type: this.sinaNext.DataSourceType.Category
      });
      this.setProperty("/appSearchDataSource", this.appDataSource);
    },
    getUserCategoryManager: function _getUserCategoryManager() {
      try {
        const _this10 = this;
        var _this2 = _this10;
        // caching
        if (_this10._userCategoryManagerPromise) {
          return _await(_this10._userCategoryManagerPromise);
        }
        // create
        _this10._userCategoryManagerPromise = _this10.initAsync().then(function () {
          return _this2.userCategoryManager;
        });
        return _await(_this10._userCategoryManagerPromise);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    loadDataSources: function _loadDataSources() {
      // get all datasources from sina
      var dataSources = this.sinaNext.getBusinessObjectDataSources();
      dataSources = dataSources.slice();

      // exclude app search datasource (here: app search datasource = connector with transactions)
      var displayedDataSources = [];
      dataSources.forEach(function (dataSource) {
        if (!dataSource.usage.appSearch) {
          displayedDataSources.push(dataSource);
        }
      });
      // check "Use Personalized Search Scope" is active
      if (this.userCategoryManager && this.userCategoryManager.isFavActive()) {
        displayedDataSources.splice(0, 0, this.userCategoryManager.getCategory("MyFavorites"));
        this.favDataSource = this.userCategoryManager.getCategory("MyFavorites");
      }
      // add app and all datasource
      if (this.config.isUshell) {
        displayedDataSources.splice(0, 0, this.appDataSource);
      }
      if (!this.config.searchScopeWithoutAll) {
        displayedDataSources.splice(0, 0, this.allDataSource);
      } else {
        if (!this.config.defaultDataSource && (!this.userCategoryManager || this.userCategoryManager && !this.userCategoryManager.isFavActive())) {
          // without all dataSource and no default dataSource, set the first item as default
          this.setProperty("/defaultDataSource", displayedDataSources[0]);
        }
      }
      // exit for filtering datasources
      displayedDataSources = this.config.filterDataSources(displayedDataSources);
      // set property
      this.setProperty("/dataSources", displayedDataSources);
      this.setProperty("/searchTermPlaceholder", this.calculatePlaceholder());
    },
    resetDataSource: function _resetDataSource(fireQuery) {
      this.setDataSource(this.getDefaultDataSource(), fireQuery);
    },
    isAllCategory: function _isAllCategory() {
      var ds = this.getProperty("/uiFilter/dataSource");
      return ds === this.allDataSource;
    },
    isOtherCategory: function _isOtherCategory() {
      var ds = this.getProperty("/uiFilter/dataSource");
      return (ds.type === this.sinaNext.DataSourceType.Category || ds.type === this.sinaNext.DataSourceType.UserCategory) && !this.isAllCategory();
    },
    isAppCategory: function _isAppCategory() {
      var ds = this.getProperty("/uiFilter/dataSource");
      return ds === this.appDataSource;
    },
    isUserCategory: function _isUserCategory() {
      var ds = this.getProperty("/uiFilter/dataSource");
      return ds.type === this.sinaNext.DataSourceType.UserCategory;
    },
    isBusinessObject: function _isBusinessObject() {
      return this.getProperty("/uiFilter/dataSource").type === this.sinaNext.DataSourceType.BusinessObject;
    },
    isUserCategoryAppSearchOnlyWithoutBOs: function _isUserCategoryAppSearchOnlyWithoutBOs() {
      return this.isUserCategory() && this.userCategoryManager && this.userCategoryManager.getCategory("MyFavorites").subDataSources.length === 0;
    },
    getDataSource: function _getDataSource() {
      return this.getProperty("/uiFilter/dataSource");
    },
    getDefaultDataSource: function _getDefaultDataSource() {
      return this.getProperty("/defaultDataSource");
    },
    setDataSourceById: function _setDataSourceById(dataSourceId, fireQuery, resetTop) {
      var ds = this.sinaNext.getDataSource(dataSourceId);
      if (ds && ds.id && ds.id === dataSourceId) {
        this.setDataSource(ds, fireQuery, resetTop);
        return;
      }
      throw "Could not set data source with id " + dataSourceId + " because it was not in the list of loaded data sources";
    },
    setDataSource: function _setDataSource(dataSource, fireQuery, resetTop) {
      if (this.getDataSource() !== dataSource) {
        var userEventDatasourceChange = {
          type: this.eventLogger["DATASOURCE_CHANGE"],
          // ToDo
          dataSourceId: dataSource.id
        };
        this.eventLogger.logEvent(userEventDatasourceChange);
      }
      this.updateDataSourceList(dataSource);
      this.getProperty("/uiFilter").setDataSource(dataSource);
      if (resetTop || resetTop === undefined) {
        this.resetTop();
      }
      this.setProperty("/searchTermPlaceholder", this.calculatePlaceholder());
      this.calculateSearchButtonStatus();
      if (fireQuery || fireQuery === undefined) {
        this._firePerspectiveQuery();
      }
    },
    notifyFilterChanged: function _notifyFilterChanged() {
      // notify ui about changed filter, data binding does not react on changes below
      // conditions, so this is done manually
      jQuery.each(this["aBindings"], function (index, binding) {
        // ToDo
        if (binding.sPath === "/uiFilter/rootCondition") {
          binding.checkUpdate(true);
        }
      });
    },
    getFilterRootCondition: function _getFilterRootCondition() {
      var rootCondition;
      if (this.getProperty("/uiFilter")) {
        rootCondition = this.getProperty("/uiFilter").rootCondition;
      }
      return rootCondition;
    },
    setFilterRootCondition: function _setFilterRootCondition(rootCondition, fireQuery) {
      if (rootCondition.type !== "Complex") {
        throw new Error("filter root condition must be of type ComplexCondition");
      }
      for (var index = 0; index < rootCondition.conditions.length; index++) {
        var complexChildCondition = rootCondition.conditions[index];
        if (complexChildCondition.type !== "Complex") {
          throw new Error("filters of root condition must be of type ComplexCondition");
        }
        for (var _index = 0; _index < complexChildCondition.conditions.length; _index++) {
          var simpleGrandChildCondition = complexChildCondition.conditions[_index];
          if (simpleGrandChildCondition.type !== "Simple") {
            throw new Error("filters of the lowest level must be of type SimpleCondition");
          }
        }
      }
      this.getProperty("/uiFilter").setRootCondition(rootCondition);
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery({
          preserveFormerResults: false
        });
      }
      this.notifyFilterChanged();
    },
    addFilterCondition: function _addFilterCondition(filterCondition, fireQuery) {
      try {
        var uiFilter = this.getProperty("/uiFilter");
        //DWC exit for handling SearchIn facets
        if (typeof this.config.cleanUpSpaceFilters === "function") {
          this.config.cleanUpSpaceFilters(this, filterCondition);
        }
        if (filterCondition.attribute || filterCondition.conditions) {
          uiFilter.autoInsertCondition(filterCondition);
        } else {
          // or a datasource?
          this.setDataSource(filterCondition, false);
        }
        if (fireQuery || typeof fireQuery === "undefined") {
          this._firePerspectiveQuery({
            preserveFormerResults: false
          });
        }
        this.notifyFilterChanged();
      } catch (error) {
        this._errorHandler.onError(error);
      }
    },
    removeFilterCondition: function _removeFilterCondition(filterCondition, fireQuery) {
      if (filterCondition.attribute || filterCondition.conditions) {
        this.getProperty("/uiFilter").autoRemoveCondition(filterCondition);
      } else {
        this.setDataSource(filterCondition, false);
      }
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery({
          preserveFormerResults: true
        });
      }
      this.notifyFilterChanged();
    },
    resetAllFilterConditions: function _resetAllFilterConditions(fireQuery) {
      this.getProperty("/uiFilter").resetConditions();
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery();
      }
      this.notifyFilterChanged();
    },
    resetFilterByFilterConditions: function _resetFilterByFilterConditions(fireQuery) {
      // 1. collect static hierarchy facet filter conditions
      var nonFilterByConditions = this.getNonFilterByFilterConditions();

      // 1.1 DWC exit, should be removed after replacement of space by folder
      var searchInConditions = [];
      var searchInAttrPosistions = this.config.searchInAttibuteFacetPostion;
      if (searchInAttrPosistions) {
        for (var searchInAttribute in searchInAttrPosistions) {
          var searchInCondition = this.getProperty("/uiFilter").rootCondition.getAttributeConditions(searchInAttribute);
          for (var j = 0; j < searchInCondition.length; j++) {
            searchInConditions.push(searchInCondition[j]);
          }
        }
      }
      //// end of 1.1 DWC exit

      // 2. reset all filter conditions
      this.getProperty("/uiFilter").resetConditions();

      // 3. add static hierarchy facet filter conditions
      if (nonFilterByConditions.length > 0) {
        var _iterator2 = _createForOfIteratorHelper(nonFilterByConditions),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var nonFilterByCondition = _step2.value;
            this.getProperty("/uiFilter").autoInsertCondition(nonFilterByCondition);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }

      // 3.1 DWC exit, should be removed after replacement of space by folder
      if (searchInConditions.length > 0) {
        for (var i = 0; i < searchInConditions.length; i++) {
          var filterCondition = searchInConditions[i];
          this.getProperty("/uiFilter").autoInsertCondition(filterCondition);
        }
      }
      //// end of 3.1 DWC exit

      // 4. notify filter changed
      if (fireQuery || typeof fireQuery === "undefined") {
        this._firePerspectiveQuery();
      }
      this.notifyFilterChanged();
    },
    setFilter: function _setFilter(filter) {
      this.setDataSource(filter.dataSource, false);
      this.setSearchBoxTerm(filter.searchTerm, false);
      var uiFilter = this.getProperty("/uiFilter");
      uiFilter.setRootCondition(filter.rootCondition);
      this._firePerspectiveQuery();
    },
    filterWithoutFilterByConditions: function _filterWithoutFilterByConditions() {
      var nonFilterByConditions = this.getNonFilterByFilterConditions();
      return nonFilterByConditions.length > 0 && nonFilterByConditions.length === this.getProperty("/uiFilter").rootCondition.conditions.length;
    },
    getNonFilterByFilterConditions: function _getNonFilterByFilterConditions() {
      var nonFilterByConditions = [];
      var _iterator3 = _createForOfIteratorHelper(this.getProperty("/uiFilter").rootCondition.getAttributes()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var attribute = _step3.value;
          var attributeMetadata = this.getProperty("/uiFilter").dataSource.attributeMetadataMap[attribute];
          if (attributeMetadata && attributeMetadata.isHierarchy === true && attributeMetadata.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet) {
            var _iterator4 = _createForOfIteratorHelper(this.getProperty("/uiFilter").rootCondition.getAttributeConditions(attribute)),
              _step4;
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var nonFilterByCondition = _step4.value;
                nonFilterByConditions.push(nonFilterByCondition);
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return nonFilterByConditions;
    },
    doSuggestion: function _doSuggestion() {
      this._suggestionHandler.doSuggestion(this.getProperty("/uiFilter").clone());
    },
    abortSuggestions: function _abortSuggestions() {
      this._suggestionHandler.abortSuggestions();
    },
    _firePerspectiveQuery: function _firePerspectiveQuery(deserializationIn, preserveFormerResultsIn) {
      try {
        const _this11 = this;
        return _await(_this11.initAsync(), function () {
          return _this11._doFirePerspectiveQuery(deserializationIn, preserveFormerResultsIn);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _doFirePerspectiveQuery: function _doFirePerspectiveQuery(deserializationIn, preserveFormerResultsIn) {
      var _this3 = this;
      var deserialization, preserveFormerResults;
      if (jQuery.isPlainObject(deserializationIn)) {
        deserialization = deserializationIn.deserialization;
        preserveFormerResults = deserializationIn.preserveFormerResults;
      } else {
        deserialization = deserializationIn || undefined;
        preserveFormerResults = preserveFormerResultsIn || undefined;
      }

      // decide whether to fire the query
      var uiFilter = this.getProperty("/uiFilter");
      if (uiFilter.equals(this.query.filter) && this.getTop() === this.query.top && this.isEqualOrderBy(this.getOrderBy(), this.query.sortOrder) && this.getCalculateFacetsFlag() === this.query.calculateFacets && !this.getProperty("/isQueryInvalidated")) {
        return Promise.resolve();
      }

      // set natural language query flag (nlq)
      if (SearchHelper.getUrlParameter("nlq") === "true") {
        this.query.setNlq(true);
      }

      // reset orderby if search term changes or datasource
      if (!deserialization && (this.query.filter.dataSource && uiFilter.dataSource !== this.query.filter.dataSource || this.query.filter.searchTerm && uiFilter.searchTerm !== this.query.filter.searchTerm)) {
        this.resetOrderBy(false);
      }

      // notify facets formatter about datasource change
      if (this.query.filter.dataSource && uiFilter.dataSource !== this.query.filter.dataSource) {
        this.oFacetFormatter.handleDataSourceChanged();
      }

      // reset top if search term changes or filter condition or datasource
      if (!deserialization && !preserveFormerResults) {
        if (!uiFilter.equals(this.query.filter)) {
          this.resetTop();
        }
      }

      // reset tabstrip formatter if search term changes or filter condition
      // UserCategory (My Favorites) is used and search for one connector
      if (uiFilter.searchTerm !== this.query.filter.searchTerm || !uiFilter.rootCondition.equals(this.query.filter.rootCondition)) {
        this._tabStripFormatter.invalidate(this.getDataSource());
      }

      // query invalidated by UI -> force to fire query by reseting result set
      if (this.getProperty("/isQueryInvalidated") === true) {
        this.query.resetResultSet();
        this.setProperty("/isQueryInvalidated", false);
      }

      // update query (app search also uses this.query despite search regest is not controlled by sina)
      this.query.setFilter(this.getProperty("/uiFilter").clone());
      this.query.setTop(this.getTop());
      this.query.setSortOrder(this.assembleSortOrder());
      this.query.setCalculateFacets(this.getCalculateFacetsFlag());
      this.setProperty("/queryFilter", this.query.filter);

      // notify subscribers
      this.notifySubscribers(UIEvents.ESHSearchStarted);
      sap.ui.getCore().getEventBus().publish(UIEvents.ESHSearchStarted);

      // enable busy indicator
      if (deserialization || !this.config.isUshell) {
        // - no delay: avoid flickering when starting seach ui from shell header
        // - no delay in all none ushell use cases: in ushell we have no dynamic/static hierarchy facets
        //   dynamic/static hierarchy facets needs fast blocking in order to avoid parallel ajax requests triggered by fast clicking user
        this.setProperty("/busyDelay", 0);
      } else {
        this.setProperty("/busyDelay", 600);
      }
      this.busyIndicator.setBusy(true);

      // reset error messages (do not reset for very first search call -> exception handling of exits gets lost, if 'searchOnStart' is true)
      if (this.getProperty("/appCount") > 0 || this.getProperty("/boCount") > 0) {
        this.resetUIMessages();
      }
      // abort suggestions
      this.abortSuggestions();

      // update url silently
      this.updateSearchURLSilently(deserialization);

      // for each new search the memory is reseted except in case of deserilization:
      // when navigating back from factsheet (object page) / other applications
      // the expand status of search result set items shall be restored -> do not clear memory
      if (!deserialization) {
        this.resetSearchResultItemMemory();
      }

      // log search request
      var userEventSearchRequest = {
        type: this.eventLogger[UserEventType.SEARCH_REQUEST],
        searchTerm: this.getProperty("/uiFilter/searchTerm"),
        dataSourceKey: this.getProperty("/uiFilter/dataSource").id
      };
      this.eventLogger.logEvent(userEventSearchRequest);
      var method = "Search for '".concat(this.getSearchBoxTerm(), "' (logId:").concat(this.config.performanceLogger.getUniqueId(), ")");
      this._performanceLoggerSearchMethods.push(method);
      this.config.performanceLogger.enterMethod({
        name: method
      }, {
        isSearch: true,
        comments: "Top: ".concat(this.getTop(), ", searchbox term: ").concat(this.getSearchBoxTerm())
      });

      // wait for all subsearch queries
      return Promise.all([this.normalSearch(preserveFormerResults), this.appSearch()]).then(function () {
        var _this3$_perspective;
        _this3.calculateResultViewSwitchVisibility();
        _this3.setProperty("/tabStrips", _this3._tabStripFormatter.format(_this3.getDataSource(), _this3._perspective, _this3));
        _this3.setProperty("/breadcrumbsHierarchyNodePaths", _this3._breadcrumbsFormatter.formatNodePaths(_this3._perspective));
        _this3.setProperty("/breadcrumbsHierarchyAttribute", _this3._breadcrumbsFormatter.formatHierarchyAttribute(_this3._perspective));
        _this3.setProperty("/hierarchyNodePaths", (_this3$_perspective = _this3._perspective) === null || _this3$_perspective === void 0 ? void 0 : _this3$_perspective.hierarchyNodePaths);
        if (_this3.config.bRecentSearches && _this3.recentlyUsedStorage) {
          _this3.recentlyUsedStorage.addItem();
        }
        return _this3.oFacetFormatter.getFacets(_this3.getDataSource(), _this3._perspective, _this3)["catch"](function (error) {
          var _iterator5 = _createForOfIteratorHelper(_this3._performanceLoggerSearchMethods),
            _step5;
          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var _method = _step5.value;
              _this3.config.performanceLogger.leaveMethod({
                name: _method
              });
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
          _this3._performanceLoggerSearchMethods = [];
          return _this3._errorHandler.onErrorDeferred(error);
        }).then(function (facets) {
          if ((facets === null || facets === void 0 ? void 0 : facets.length) > 0) {
            facets[0].change = jQuery["sap"].now(); // workaround to prevent earlier force update facet tree
            _this3.setProperty("/facets", facets);
            facets.forEach(function (facet) {
              return facet.handleModelUpdate && facet.handleModelUpdate();
            });
          }
        });
      })["catch"](function (error) {
        var _iterator6 = _createForOfIteratorHelper(_this3._performanceLoggerSearchMethods),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var _method2 = _step6.value;
            _this3.config.performanceLogger.leaveMethod({
              name: _method2
            });
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
        _this3._performanceLoggerSearchMethods = [];
        return _this3._errorHandler.onErrorDeferred(error);
      })["finally"](function () {
        try {
          if (_this3.config && _this3.config.overwriteBrowserTitle === true) {
            document.title = _this3.getDocumentTitle();
          }
          var _iterator7 = _createForOfIteratorHelper(_this3._performanceLoggerSearchMethods),
            _step7;
          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var _method3 = _step7.value;
              _this3.config.performanceLogger.leaveMethod({
                name: _method3
              });
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }
          _this3._performanceLoggerSearchMethods = [];
          _this3.notifySubscribers(UIEvents.ESHSearchFinished);
          sap.ui.getCore().getEventBus().publish(UIEvents.ESHSearchFinished);
          _this3.busyIndicator.setBusy(false);
          _this3.setProperty("/firstSearchWasExecuted", true);
          _this3.notifyFilterChanged();
          _this3.updateMultiSelectionSelected();
        } catch (error) {
          _this3._errorHandler.onError(error);
        }
      });
    },
    assembleSortOrder: function _assembleSortOrder() {
      var orderBy = this.getOrderBy();
      if (!orderBy.orderBy) {
        return [];
      }
      var order = this.sinaNext.SortOrder.Ascending;
      if (orderBy.sortOrder === "DESC") {
        order = this.sinaNext.SortOrder.Descending;
      }
      return [{
        id: orderBy.orderBy,
        order: order
      }];
    },
    getCalculateFacetsFlag: function _getCalculateFacetsFlag() {
      if (this.getDataSource().type === this.sinaNext.DataSourceType.Category || this.getFacetVisibility()) {
        // tab strip needs data from data source facet if a category is selected because
        // then the tab strips show also siblings. If connector is selected, the tab strip
        // only shows All and the connector.
        return true;
      }
      return false;
    },
    appSearch: function _appSearch() {
      var _this4 = this;
      // only ushell should do app search
      if (!this.config.isUshell) {
        return Promise.resolve(true);
      }
      this.setProperty("/appResults", []);
      this.setProperty("/appCount", 0);
      if (this.isBusinessObject() || this.isOtherCategory() && !this.isAppCategory() && !this.isUserCategory() || this.isUserCategory() && this.userCategoryManager && !this.userCategoryManager.getCategory("MyFavorites").includeApps) {
        // 1. do not search
        return Promise.resolve(true);
      }

      // calculate top
      var top = this.query.filter.dataSource === this.allDataSource ? this.appTopDefault : this.query.top;

      // 2. search
      return this._searchApplicationsRefuseOutdatedReq(this.query.filter.searchTerm, top, 0).then(function (oResult) {
        // 1.1 search call succeeded
        _this4.setProperty("/appCount", oResult.totalResults);
        _this4.setProperty("/appResults", oResult.getElements());
      }, function (error) {
        // 1.2 search call failed
        return _this4._errorHandler.onErrorDeferred(error);
      });
    },
    searchApplications: function _searchApplications(searchTerm, top, skip) {
      if (this.config.isUshell) {
        return sap.ushell.Container.getServiceAsync("Search").then(function (service) {
          return service.queryApplications({
            searchTerm: searchTerm,
            top: top,
            skip: skip
          });
        });
      } else {
        return Promise.resolve({
          totalResults: 0,
          searchTerm: searchTerm,
          getElements: function getElements() {
            return [];
          }
        });
      }
    },
    normalSearch: function _normalSearch(preserveFormerResults) {
      var _this5 = this;
      if (!preserveFormerResults) {
        this.resetAndDisableMultiSelection();
      }
      if (!this.isBusinessObjSearchEnabled() || this.isAppCategory() || this.isUserCategory() && this.userCategoryManager && this.userCategoryManager.getCategory("MyFavorites").subDataSources.length === 0) {
        this.setProperty("/boResults", []);
        this.setProperty("/breadcrumbsHierarchyNodePaths", []);
        this.setProperty("/breadcrumbsHierarchyAttribute", "");
        this.setProperty("/hierarchyNodePaths", []);
        this.setProperty("/origBoResults", []);
        this.setProperty("/boCount", 0);
        this.setProperty("/nlqSuccess", false);
        this.setProperty("/nlqDescription", "");
        this._perspective = null;
        return Promise.resolve(true);
      }
      var successHandler = function successHandler(searchResultSet) {
        _this5._perspective = searchResultSet; // TODO: sinaNext: rename perspective to resultSet
        _this5.setProperty("/nlqSuccess", false);
        if (searchResultSet.nlqSuccess) {
          _this5.setProperty("/nlqSuccess", true);
          _this5.setProperty("/nlqDescription", searchResultSet.title);
        }
        return _this5._afterSearchPrepareResultList(_this5._perspective);
      };
      this.setDataSource(this.getDataSource(), false, false);
      this.query.setCalculateFacets(this.getCalculateFacetsFlag());
      return this.query.getResultSetAsync().then(function (resultSet) {
        var searchResultSet = resultSet;
        return successHandler(searchResultSet);
      }, function (error) {
        return _this5._errorHandler.onErrorDeferred(error);
      });
    },
    _afterSearchPrepareResultList: function _afterSearchPrepareResultList(searchResultSet) {
      var _this6 = this;
      // this.setProperty("/boCount", searchResultSet.totalCount);

      // var formerResults = [];
      // if (false && preserveFormerResults) { // TODO: sinaNext Holger
      //     var _formerResults = that.getProperty("/boResults");
      //     for (i = 0; i < _formerResults.length; i++) {
      //         if (_formerResults[i].expanded || _formerResults[i].selected) {
      //             formerResults.push(_formerResults[i]);
      //         }
      //     }
      // }

      this.setProperty("/boResults", []);
      this.setProperty("/breadcrumbsHierarchyNodePaths", []);
      this.setProperty("/breadcrumbsHierarchyAttribute", "");
      this.setProperty("/hierarchyNodePaths", []);
      this.setProperty("/origBoResults", searchResultSet.items);
      this.setProperty("/boCount", 0);
      var formatter = new SearchResultFormatter(this);
      var newResults = formatter.format(searchResultSet, this.query.filter.searchTerm);
      this.setProperty("/sortableAttributes", formatter.formatSortAttributes()); // move this.isHomogenousResult() && searchResultSet.totalCount > 0 to formatter

      if (this.isHomogenousResult()) {
        if (searchResultSet.totalCount === 0) {
          this.setProperty("/tableColumns", []);
          this.setProperty("/tableRows", []);
        } else {
          var tableFormatter = new SearchResultTableFormatter(this);
          this.setProperty("/tableColumns", tableFormatter.formatColumns(newResults));
          var rows = tableFormatter.formatRows(newResults);
          for (var i = 0; i < rows.length; i++) {
            newResults[i].cells = rows[i].cells;
          }
          this.setProperty("/tableRows", newResults);
        }
        // this.setProperty("/tableRows", tableFormatter.formatRows(newResults) as Array<Row>);
        // workaround of databinding of table view:
        // 1. merge table rows data (cells) with formatted list results data (list data and sina output)
        // 2. set formatted list results to /tableRows
        // 3. consume two data sets by data binding
      }

      this.restoreResultSetItemExpansion(newResults);
      var newResult;
      var dataSources = [];
      var dataSourcesHints = [];
      for (var _i2 = 0; _i2 < newResults.length; _i2++) {
        newResult = newResults[_i2];
        // collect data sources to initiate loading of custom modules
        dataSources.push(newResult.dataSource);
        dataSourcesHints.push({
          isDocumentConnector: newResult.isDocumentConnector
        });
      }
      var loadCustomModulesProm = this.config.loadCustomModulesForDataSourcesAsync(dataSources, dataSourcesHints);
      var thisPromise = Promise.all([Promise.resolve(searchResultSet), loadCustomModulesProm]).then(function (params) {
        // TODO: error handling

        var searchResultSet = params[0];

        // DWC exit
        if (_this6.config && typeof _this6.config.setSearchInLabelIconBindings === "function") {
          _this6.config.setSearchInLabelIconBindings(_this6, searchResultSet.facets);
        }
        _this6.setProperty("/boCount", searchResultSet.totalCount);
        _this6.setProperty("/boResults", newResults);
        _this6.enableOrDisableMultiSelection();
        return Promise.resolve();
      });
      return thisPromise;
    },
    restoreResultSetItemExpansion: function _restoreResultSetItemExpansion(items) {
      var _iterator8 = _createForOfIteratorHelper(items),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var item = _step8.value;
          var expanded = this.searchResultSetItemMemory.getExpanded(item.key);
          if (typeof expanded !== "undefined") {
            item.expanded = expanded;
          }
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    },
    resetAndDisableMultiSelection: function _resetAndDisableMultiSelection() {
      this.setProperty("/multiSelectionAvailable", false);
      this.setProperty("/multiSelectionEnabled", false);
      this.setProperty("/multiSelectionSelected", false);
      this.setProperty("/singleSelectionSelected", false);
    },
    enableOrDisableMultiSelection: function _enableOrDisableMultiSelection() {
      if (this.config.enableMultiSelectionResultItems) {
        this.setProperty("/multiSelectionAvailable", true);
        this.setProperty("/multiSelectionEnabled", true);
        return;
      }
      var dataSource = this.getDataSource();
      var dataSourceConfig = this.config.getDataSourceConfig(dataSource);
      var selectionHandler = new dataSourceConfig.searchResultListSelectionHandlerControl();
      if (selectionHandler) {
        this.setProperty("/multiSelectionAvailable", selectionHandler.isMultiSelectionAvailable());
      } else {
        this.setProperty("/multiSelectionAvailable", false);
      }
    },
    updateMultiSelectionSelected: function _updateMultiSelectionSelected() {
      var results;
      if (this.getResultViewType() === "searchResultTable") {
        // UI in table view
        results = this.getProperty("/tableRows");
      } else {
        // UI in list or grid view
        results = this.getProperty("/results");
      }
      var count = 0;
      var multiSelectionObjects = [];
      for (var i = 0; i < results.length; i++) {
        if (results[i].selected) {
          count++;
          multiSelectionObjects.push(results[i]);
        }
      }
      if (count > 0) {
        this.setProperty("/multiSelectionSelected", true);
        this.setProperty("/multiSelectionObjects", multiSelectionObjects);
      } else {
        this.setProperty("/multiSelectionSelected", false);
        this.setProperty("/multiSelectionObjects", []);
      }
      if (count === 1) {
        this.setProperty("/singleSelectionSelected", true);
      } else {
        this.setProperty("/singleSelectionSelected", false);
      }
      this.config.selectionChange(this);
    },
    _endWith: function _endWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    calculatePlaceholder: function _calculatePlaceholder() {
      var dataSourceLabel = this.getDataSource().labelPlural; // default label
      if (this.config.FF_bOptimizedQuickSelectDataSourceLabels === true) {
        // ignore bPlaceHolderFixedValue / that.isAllCategory()
        var isSpaceLabel;
        // for DWC space facet, use space-label
        if (typeof this.config.getFirstSpaceCondition === "function") {
          // currently there can be only one space selected at the same time
          var firstSpaceCondition = this.config.getFirstSpaceCondition(this.getProperty("/uiFilter"));
          if (firstSpaceCondition && firstSpaceCondition.attributeLabel) {
            isSpaceLabel = true;
            dataSourceLabel = firstSpaceCondition.valueLabel || firstSpaceCondition.value; // users know, it's a space
          }
        }
        // DWC Specific logic
        // Datasource has to be limited to SEARCH_DESIGN otherwise it influence other Collection entries like shared, my objects, recent.
        if (!isSpaceLabel && this.getDataSource().id === "SEARCH_DESIGN" && typeof this.config.getPlaceholderLabelForDatasourceAll === "function") {
          // use special label for 'All' (example DWC: 'Object')
          dataSourceLabel = this.config.getPlaceholderLabelForDatasourceAll();
        }
      } else if (this.isAllCategory() || this.config.bPlaceHolderFixedValue === true) {
        return i18n.getText("search");
      } else if (
      // DWC Specific logic
      // Datasource has to be limited to SEARCH_DESIGN otherwise it influence other Collection entries like shared, my objects, recent.
      this.getDataSource().id === "SEARCH_DESIGN" && typeof this.config.getPlaceholderLabelForDatasourceAll === "function") {
        // use special label for 'All' (example DWC: 'Object')
        dataSourceLabel = this.config.getPlaceholderLabelForDatasourceAll();
      }
      return i18n.getText("searchInPlaceholder", [dataSourceLabel]);
    },
    updateDataSourceList: function _updateDataSourceList(newDataSource) {
      var dataSources = this.getProperty("/dataSources");
      // delete old categories, until all data source
      this.removeTempDataSources();
      // check if newDataSource exists in existing list -> return
      if (dataSources.indexOf(newDataSource) >= 0) {
        return;
      }
      // add datasource
      dataSources.unshift(newDataSource);
      this._tempDataSources.push(newDataSource);
      this.setProperty("/dataSources", dataSources);
    },
    removeTempDataSources: function _removeTempDataSources() {
      var dataSources = this.getProperty("/dataSources");
      this._tempDataSources.forEach(function (tempDataSource, i, tempDataSources) {
        var index = dataSources.indexOf(tempDataSource);
        if (index < 0) {
          var internalError = new Error("could not find temp DataSource in DataSources");
          throw new errors.ProgramError(internalError);
        }
        dataSources.splice(index, 1);
        tempDataSources.splice(i, 1);
      });
    },
    invalidateQuery: function _invalidateQuery() {
      // TODO: naming?
      SearchHelper.hasher.reset();
      this.setProperty("/isQueryInvalidated", true);
    },
    autoStartApp: function _autoStartApp() {
      var searchTerm = this.getProperty("/uiFilter/searchTerm");
      if (this.getProperty("/appCount") === 1 && this.getProperty("/count") === 1) {
        var aApps = this.getProperty("/appResults");
        if (aApps && aApps.length > 0 && aApps[0] && aApps[0].url && searchTerm && aApps[0].tooltip && searchTerm.toLowerCase().trim() === aApps[0].tooltip.toLowerCase().trim()) {
          if (aApps[0].url[0] === "#") {
            window.location.href = aApps[0].url;
          } else {
            window.open(aApps[0].url, "_blank", "noopener,noreferrer");
          }
          return;
        }
      }
    },
    isHomogenousResult: function _isHomogenousResult() {
      if (this.isAllCategory()) {
        return false;
      }
      if (this.isOtherCategory()) {
        return false;
      }
      if (this.isAppCategory()) {
        return false;
      }
      return true;
    },
    getResultViewTypes: function _getResultViewTypes() {
      return this.getProperty("/resultViewTypes");
    },
    setResultViewTypes: function _setResultViewTypes(types) {
      this.setProperty("/resultViewTypes", types);
    },
    getResultViewType: function _getResultViewType() {
      return this.getProperty("/resultViewType");
    },
    setResultViewType: function _setResultViewType(type) {
      this.setProperty("/resultViewType", type);
      if (this.isAppCategory()) {
        return;
      } else if (this.isAllCategory() || this.isOtherCategory()) {
        try {
          this._personalizationStorage.setItem("resultViewTypeForAllAndCategorySearch", type);
        } catch (e) {
          //
        }
      } else {
        try {
          this._personalizationStorage.setItem("resultViewTypeForBusinessObjectSearch", type);
        } catch (e) {
          //
        }
      }
    },
    calculateResultViewSwitchVisibility: function _calculateResultViewSwitchVisibility(settings) {
      /* view type by search scope
       * search in Datasource    All     Category    Apps    BusinessObject
       * -------------------------------------------------------------------
       * "appSearchResult"                           x
       * "searchResultList"      x        x                  x
       * "searchResultTable"                                 x
       * "searchResultGrid"      x        x                  x
       */

      this.validateResultViewSettings(settings);

      // ==============================================================================================================
      // click view switch buttons or use SearchComposite API (after SearchFinished) ->
      // call calculateResultViewSwitchVisibility(), settings is SearchComposite's parameters ->
      // calculate with settings:
      // ==============================================================================================================
      if (settings !== undefined) {
        this.setResultViewTypes(settings.resultViewTypes);
        this.setResultViewType(settings.resultViewType);
        this.setProperty("/resultViewSwitchVisibility", settings.resultViewTypes.length > 1);
        return;
      }

      // ==============================================================================================================
      // initialize Search UI with/without URL parameter or trigger new search (NormalSearch Resolve) ->
      // call calculateResultViewSwitchVisibility(), settings is undefined ->
      // calculate with hard code, storage and/or SearchConfiguration's parameters:
      // ==============================================================================================================
      var activeTypes;
      var activeType;

      // 1. Search in Apps
      if (this.isAppCategory() || this.isUserCategory() && this.userCategoryManager && this.userCategoryManager.getCategory("MyFavorites").subDataSources.length === 0) {
        activeTypes = ["appSearchResult"]; // ToDo: hard code
        activeType = "appSearchResult"; // ToDo: hard code
        this.setResultViewTypes(activeTypes);
        this.setResultViewType(activeType);
        this.setProperty("/resultViewSwitchVisibility", activeTypes.length > 1);
        return;
      }

      // 2. Search in All or other Category
      if (this.isAllCategory() || this.isOtherCategory()) {
        // 2.1.
        if (this.config.isUshell) {
          activeTypes = ["searchResultList"]; // ToDo: hard code
          activeType = "searchResultList"; // ToDo: hard code
        }
        // 2.2
        else {
          activeTypes = ["searchResultList", "searchResultGrid"]; // ToDo: hard code
          try {
            activeType = this._personalizationStorage.getItem("resultViewTypeForAllAndCategorySearch"); //storage
          } catch (e) {
            //
          }
          if (activeType === undefined || activeType === null || activeType.length === 0 || !activeTypes.includes(activeType)) {
            activeType = "searchResultList"; //hard code
          }
        }

        this.setResultViewTypes(activeTypes);
        this.setResultViewType(activeType);
        this.setProperty("/resultViewSwitchVisibility", activeTypes.length > 1);
        return;
      }

      // 3. Search in Business Object
      activeTypes = this.config.resultViewTypes; // SearchConfiguration

      try {
        if (this._personalizationStorage instanceof PersonalizationStorage) activeType = this._personalizationStorage.getItem("resultViewTypeForBusinessObjectSearch"); //storage
      } catch (e) {
        //
      }
      if (activeType === undefined || activeType === null || activeType.length === 0 || !activeTypes.includes(activeType)) {
        activeType = this.config.fallbackResultViewType; //SearchConfiguration
      }

      // result view type calculation for navigation mode (folder or search mode)
      activeType = this.folderModeResultViewTypeCalculator.calculate(activeTypes, activeType, this.getProperty("/uiFilter"));
      this.setResultViewTypes(activeTypes);
      this.setResultViewType(activeType);
      this.setProperty("/resultViewSwitchVisibility", activeTypes.length > 1);
    },
    validateResultViewSettings: function _validateResultViewSettings(settings) {
      var validateConfig;
      var typeSuperset; // superset of possible resultViewTypes
      var types; // active result view types
      var type; // active result view type
      var errorBegin;
      var errorEnding;
      if (typeof settings === "undefined") {
        // ==============================================================================================================
        // initialize Search UI with/without URL parameter or trigger new search (NormalSearch Resolve) ->
        // call validateResultViewSettings(), settings is undefined ->
        // validate SearchConfiguration parameters: config.resultViewTypes, config.fallbackResultViewType
        // ==============================================================================================================
        validateConfig = true;
      } else {
        // ==============================================================================================================
        // click view switch buttons or use SearchComposite API (after SearchFinished) ->
        // call validateResultViewSettings(), settings is SearchComposite's parameters ->
        // validate SearchCompositeControl parameters: settings.resultViewTypes, settings.resultViewType
        // ==============================================================================================================
        validateConfig = false;
      }
      if (validateConfig) {
        typeSuperset = ["searchResultList", "searchResultTable", "searchResultGrid"];
        types = this.config.resultViewTypes;
        type = this.config.fallbackResultViewType;
        errorBegin = "\nERROR: Search Result View Settings of SearchConfiguration:\n\n";
        errorEnding = ". \n Please check the validation and compatibility of resultViewTypes of SearchConfiguration!";
      } else {
        if (this.isAppCategory()) {
          typeSuperset = ["appSearchResult"];
        } else if (this.isAllCategory() || this.isOtherCategory()) {
          typeSuperset = ["searchResultList", "searchResultGrid"];
        } else {
          typeSuperset = ["searchResultList", "searchResultTable", "searchResultGrid"];
        }
        types = settings.resultViewTypes;
        type = settings.resultViewType;
        errorBegin = "\nERROR: Search Result View Settings of SearchCompositeControl\n\n";
        errorEnding = ". \n Please check the validation and compatibility of resultViewTypes, resultViewType of SearchCompositeControl!";
      }

      // check starts
      // result view types not empty
      if (!Array.isArray(types) || types.length === 0) {
        throw Error(errorBegin + "resultViewTypes should be non-empty array" + errorEnding);
      }

      // result view types no duplicates
      var uniqueList = types;
      uniqueList = uniqueList.filter(function (elem, index) {
        return uniqueList.indexOf(elem) === index;
      });
      if (uniqueList.length !== types.length) {
        throw Error(errorBegin + "resultViewTypes (" + types.toString() + ") should not have duplicated value" + errorEnding);
      }

      // result view types is subset of possible superset
      if (!SearchHelper.isSubsetOf(types, typeSuperset)) {
        throw Error(errorBegin + "resultViewTypes (" + types.toString() + ") contains invalid value. Possible values are (" + typeSuperset.toString() + ")" + errorEnding);
      }

      // set default value to undefined fallbackResultViewType, after validating resultViewTypes
      // move from setDefaults() of SearchConfiguration
      if (typeof type === "undefined" && validateConfig) {
        type = types[0];
        this.config.fallbackResultViewType = types[0]; // assign resultViewTypes' first element to fallbackResultViewType
      }

      // result view type of string type
      if (typeof type !== "string") {
        throw Error(errorBegin + "resultViewType should be of string" + errorEnding);
      }

      // result view types contains active result view type
      if (!types.includes(type)) {
        throw Error(errorBegin + "resultViewTypes (" + types.toString() + ") doesn't contain resultViewType (" + type + ")" + errorEnding);
      }
    },
    calculateSearchButtonStatus: function _calculateSearchButtonStatus() {
      if (!this.config.isUshell) {
        this.setProperty("/searchButtonStatus", "Search");
        return;
      }
      if (this.getDataSource() === this.getProperty("/defaultDataSource") && this.getSearchBoxTerm().length === 0) {
        if (SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
          this.setProperty("/searchButtonStatus", "Focus");
        } else {
          this.setProperty("/searchButtonStatus", "Close");
        }
      } else {
        this.setProperty("/searchButtonStatus", "Search");
      }
    },
    calculateResultList: function _calculateResultList() {
      // init
      var results = [];

      // add bo results
      var boResults = this.getProperty("/boResults");
      if (boResults && boResults.length) {
        var _results;
        (_results = results).push.apply(_results, _toConsumableArray(boResults));
      }

      // add app results (tiles)
      var tiles = this.getProperty("/appResults");
      if (tiles && tiles.length > 0) {
        var tilesItem = {
          type: "appcontainer",
          tiles: tiles
        };
        if (results.length > 0) {
          if (results.length > 3) {
            results.splice(3, 0, tilesItem);
          } else {
            //results.splice(0, 0, tilesItem);
            results.push(tilesItem);
          }
        } else {
          results = [tilesItem];
        }
      }
      this.setProperty("/results", results);
    },
    pushUIMessage: function _pushUIMessage(error) {
      error.title = error.title === "[object Object]" ? i18n.getText("searchError") : error.title;
      error.type = error.type !== undefined ? error.type : MessageType.Error;
      var errors = this.getProperty("/errors");
      errors.push(error);
      var finalErrors = this.removeAdjacentDuplicateMessages(errors);
      this.setProperty("/errors", finalErrors);
    },
    resetUIMessages: function _resetUIMessages() {
      this.setProperty("/errors", []);
    },
    removeAdjacentDuplicateMessages: function _removeAdjacentDuplicateMessages(errors) {
      var finalErrors = [];
      var previousError;
      var _iterator9 = _createForOfIteratorHelper(errors),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var error = _step9.value;
          if (typeof previousError === "undefined") {
            finalErrors.push(error);
          } else if (previousError.title !== error.title || previousError.description !== error.description || previousError.type !== error.type) {
            finalErrors.push(error);
          }
          previousError = error;
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
      return finalErrors;
    },
    updateSearchURLSilently: function _updateSearchURLSilently(deserialization) {
      if (deserialization) {
        // (1) url changed
        // in most cases current URL is identical to the URL the URL serializer would create
        // -> URL update not neccessary
        // in some case current URL is not identical to the URL the URL serializer would create
        // -> we accept the users URL and skip the URL update
        // nevertheless the internal url hash needs to be updated
        SearchHelper.hasher.init();
      } else {
        // (2) user changed query
        var sHash = this.renderSearchURL();
        if (this.config.updateUrl) {
          SearchHelper.hasher.setHash(sHash);
        }
      }
    },
    renderSearchURL: function _renderSearchURL() {
      return this.searchUrlParser.render();
    },
    parseURL: function _parseURL() {
      this.searchUrlParser.parse();
    },
    subscribe: function _subscribe(eventId, callback, listener) {
      this._subscribers.push({
        eventId: eventId || "",
        callback: callback,
        listener: listener || this
      });
    },
    unsubscribe: function _unsubscribe(eventId, callback, listener) {
      eventId = eventId || "";
      listener = listener || this;
      for (var index = 0; index < this._subscribers.length; index++) {
        var subscriber = this._subscribers[index];
        if (subscriber.eventId === eventId && subscriber.callback === callback && subscriber.listener === listener) {
          this._subscribers.splice(index, 1);
        }
      }
    },
    notifySubscribers: function _notifySubscribers(eventId) {
      var _iterator10 = _createForOfIteratorHelper(this._subscribers),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var subscriber = _step10.value;
          if (subscriber.eventId === eventId) {
            subscriber.callback.apply(subscriber.listener, [eventId]);
          }
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  });
  SearchModel._searchModels = {};
  SearchModel.getModelSingleton = function getModelSingleton(configuration, id) {
    var modelId = id || "default";
    if (!SearchModel._searchModels[modelId]) {
      configuration.isUshell = modelId === "flp" ? true : false;
      SearchModel._searchModels[modelId] = new SearchModel({
        configuration: configuration
      });
    }
    return SearchModel._searchModels[modelId];
  };
  sap.esh.search.ui.getModelSingleton = SearchModel.getModelSingleton; // ToDo, remove as soon as no one calls 'sap.esh.search.ui.getModelSingleton' any longer (i.e. flp)
  return SearchModel;
});
})();