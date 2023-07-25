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
sap.ui.define(["../AbstractProvider", "./FacetMode", "./FederationType", "./ProviderHelper", "../../sina/Sina", "./FederationMethod", "../../core/Log", "../../sina/SinaConfiguration", "../abap_odata/Provider", "../hana_odata/Provider", "../sample/Provider", "../inav2/Provider", "../dummy/Provider", "../../core/errors"], function (___AbstractProvider, ___FacetMode, ___FederationType, ___ProviderHelper, ____sina_Sina, FederationMethod, ____core_Log, ____sina_SinaConfiguration, ___abap_odata_Provider, ___hana_odata_Provider, ___sample_Provider, ___inav2_Provider, ___dummy_Provider, ____core_errors) {
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
        result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  /* eslint-disable @typescript-eslint/no-this-alias */
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var AbstractProvider = ___AbstractProvider["AbstractProvider"];
  var FacetMode = ___FacetMode["FacetMode"];
  var FederationType = ___FederationType["FederationType"];
  var ProviderHelper = ___ProviderHelper["ProviderHelper"];
  var Sina = ____sina_Sina["Sina"];
  var Log = ____core_Log["Log"];
  var AvailableProviders = ____sina_SinaConfiguration["AvailableProviders"];
  var _normalizeConfiguration = ____sina_SinaConfiguration["_normalizeConfiguration"];
  var ABAPODataProvider = ___abap_odata_Provider["Provider"];
  var HANAODataProvider = ___hana_odata_Provider["Provider"];
  var SampleProvider = ___sample_Provider["Provider"];
  var INAV2Provider = ___inav2_Provider["Provider"];
  var DummyProvider = ___dummy_Provider["Provider"];
  var NotImplementedError = ____core_errors["NotImplementedError"];
  var FilterDataSourceType;
  (function (FilterDataSourceType) {
    FilterDataSourceType["All"] = "All";
    FilterDataSourceType["UserCategory"] = "UserCategory";
    FilterDataSourceType["BusinessObject"] = "BusinessObject";
    FilterDataSourceType["Category"] = "Category";
  })(FilterDataSourceType || (FilterDataSourceType = {}));
  var MultiProvider = /*#__PURE__*/function (_AbstractProvider) {
    _inherits(MultiProvider, _AbstractProvider);
    var _super = _createSuper(MultiProvider);
    function MultiProvider() {
      var _this;
      _classCallCheck(this, MultiProvider);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "id", "multi");
      return _this;
    }
    _createClass(MultiProvider, [{
      key: "initAsync",
      value: function initAsync(properties) {
        try {
          const _this8 = this;
          var _this2 = _this8;
          _this8.log = new Log("MultiProvider");
          _this8.sina = properties.sina;
          _this8.facetMode = FacetMode[properties.facetMode] || FacetMode.flat;
          _this8.federationType = FederationType[properties.federationType] || FederationType.advanced_round_robin;
          _this8.multiSina = [];
          _this8.multiDataSourceMap = {}; //key: multiId, value: originalDataSource
          _this8.sina.dataSourceMap[_this8.sina.allDataSource.id] = _this8.sina.allDataSource;
          _this8.providerHelper = new ProviderHelper(_this8);
          switch (_this8.federationType) {
            case FederationType.advanced_round_robin:
              {
                _this8.federationMethod = new FederationMethod.AdvancedRoundRobin();
                break;
              }
            case FederationType.ranking:
              {
                _this8.federationMethod = new FederationMethod.Ranking();
                break;
              }
            case FederationType.round_robin:
              {
                _this8.federationMethod = new FederationMethod.RoundRobin();
                break;
              }
          }
          _this8.sina.capabilities = _this8.sina._createCapabilities({
            fuzzy: false
          });
          var creationPromises = [];
          properties.subProviders.forEach(function (configuration) {
            var creationPromise = _this2.createAsync(configuration).then(function (childSina) {
              _this2.providerHelper.updateProviderId(childSina);
              for (var i = 0; i < childSina.dataSources.length; i++) {
                var childDataSource = childSina.dataSources[i];
                var multiId = _this2.providerHelper.calculateMultiDataSourceId(childDataSource.id, childSina.provider.id);
                _this2.providerHelper.createMultiDataSource(multiId, childDataSource);
                _this2.multiDataSourceMap[multiId] = childDataSource;
              }
              _this2.multiSina.push(childSina);
              return childSina;
            });
            creationPromises.push(creationPromise);
          });
          var hasSubProvider = false;
          // straightforward workaround to use Promise.allSettled() with older Typescript version
          return _await(Promise.allSettled(creationPromises), function (promises) {
            promises.forEach(function (promise) {
              if (promise.status === "rejected") {
                _this2.log.warn("Error during creation of subprovider: ".concat(promise.reason.stack));
              } else if (promise.status === "fulfilled") {
                hasSubProvider = true;
                if (promise.value.capabilities.fuzzy) {
                  _this2.sina.capabilities.fuzzy = true;
                }
              }
            });
            if (!hasSubProvider) {
              _this8.log.error("Error during creation of multi provider: no valid subproviders");
              return Promise.reject();
            }
            _this8.sina.dataSources.sort(function (a, b) {
              return a.labelPlural.localeCompare(b.labelPlural);
            });
            return _this8.sina;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "createAsync",
      value: function createAsync(configuration) {
        try {
          const _this9 = this;
          _this9.log.debug("Creating new eshclient instance using provider ".concat(configuration.provider));
          return _await(_normalizeConfiguration(configuration), function (normalizedConfiguration) {
            var providerInstance;
            switch (normalizedConfiguration.provider) {
              case AvailableProviders.HANA_ODATA:
                {
                  providerInstance = new HANAODataProvider();
                  break;
                }
              case AvailableProviders.ABAP_ODATA:
                {
                  providerInstance = new ABAPODataProvider();
                  break;
                }
              case AvailableProviders.INAV2:
                {
                  providerInstance = new INAV2Provider();
                  break;
                }
              case AvailableProviders.MULTI:
                {
                  providerInstance = new MultiProvider();
                  break;
                }
              case AvailableProviders.SAMPLE:
                {
                  providerInstance = new SampleProvider();
                  break;
                }
              case AvailableProviders.DUMMY:
                {
                  providerInstance = new DummyProvider();
                  break;
                }
              default:
                {
                  throw new Error("Unknown Provider: '".concat(configuration.provider, "' - Available Providers: ").concat(AvailableProviders.HANA_ODATA, ", ").concat(AvailableProviders.ABAP_ODATA, ", ").concat(AvailableProviders.INAV2, ", ").concat(AvailableProviders.MULTI, ", ").concat(AvailableProviders.SAMPLE, ", ").concat(AvailableProviders.DUMMY, "."));
                }
            }
            var sina = new Sina(providerInstance);
            return _await(sina.initAsync(normalizedConfiguration), function () {
              return sina;
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
      // return the filter datasource type of the datasource (All, UserCategory, BusinessObject, Category)
    }, {
      key: "getFilterDataSourceType",
      value: function getFilterDataSourceType(dataSource) {
        if (dataSource === this.sina.allDataSource) {
          return FilterDataSourceType.All;
        }
        if (dataSource.type === this.sina.DataSourceType.UserCategory) {
          return FilterDataSourceType.UserCategory;
        }
        if (dataSource.type === this.sina.DataSourceType.BusinessObject) {
          return FilterDataSourceType.BusinessObject;
        }
        if (dataSource.type === this.sina.DataSourceType.Category) {
          return FilterDataSourceType.Category;
        }
      }
    }, {
      key: "handleAllSearch",
      value: function handleAllSearch(query) {
        try {
          const _this10 = this;
          var _this3 = _this10;
          var childQuery;
          var queries = [];
          var searchResultSet = _this10.initializeSearchResultSet(query);
          var searchResultSetItemList = [];

          // search with all dataSource
          searchResultSet.facets.push(_this10.sina._createDataSourceResultSet({
            title: query.filter.dataSource.label,
            items: [],
            query: query
          }));
          for (var i = 0; i < _this10.multiSina.length; i++) {
            childQuery = _this10.multiSina[i].createSearchQuery({
              calculateFacets: query.calculateFacets,
              multiSelectFacets: query.multiSelectFacets,
              dataSource: _this10.multiSina[i].allDataSource,
              searchTerm: query.getSearchTerm(),
              top: query.top,
              skip: query.skip,
              sortOrder: query.sortOrder,
              sina: _this10.multiSina[i]
            });
            queries.push(childQuery.getResultSetAsync());
          }
          return Promise.all(queries).then(function (result) {
            for (var j = 0; j < result.length; j++) {
              var querySearchResultSet = result[j];
              for (var k = 0; k < querySearchResultSet.items.length; k++) {
                var resultItem = querySearchResultSet.items[k];
                var multiId = _this3.providerHelper.calculateMultiDataSourceId(resultItem.dataSource.id, resultItem.sina.provider.id);
                var dataSource = _this3.sina.dataSourceMap[multiId];
                resultItem.dataSource = dataSource;
                resultItem.sina = _this3.sina;
              }
              searchResultSet.totalCount += querySearchResultSet.totalCount;
              searchResultSetItemList.push(querySearchResultSet.items);
              if (querySearchResultSet.facets[0]) {
                if (_this3.facetMode === FacetMode.tree) {
                  var childDataSource = _this3.sina.getDataSource(_this3.providerHelper.calculateMultiDataSourceId(querySearchResultSet.query.filter.dataSource.id, querySearchResultSet.sina.provider.id));
                  searchResultSet.facets[0].items.push(_this3.sina._createDataSourceResultSetItem({
                    dataSource: childDataSource,
                    dimensionValueFormatted: _this3.providerHelper.calculateMultiDataSourceLabel(querySearchResultSet.query.filter.dataSource.label, querySearchResultSet.sina.provider),
                    measureValue: querySearchResultSet.totalCount,
                    measureValueFormatted: querySearchResultSet.totalCount
                  }));
                } else {
                  var dataSourceFacets = _this3.providerHelper.updateDataSourceFacets(querySearchResultSet.facets);
                  dataSourceFacets[0].items.forEach(function (facetItem) {
                    searchResultSet.facets[0].items.push(facetItem);
                  });
                }
              }
            }
            searchResultSet.items = _this3.federationMethod.sort(searchResultSetItemList);
            searchResultSet.items = searchResultSet.items.slice(query.skip, query.top);
            return searchResultSet;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "handleUserCategorySearch",
      value: function handleUserCategorySearch(query) {
        try {
          const _this11 = this;
          var _this4 = _this11;
          var childQuery;
          var queries = [];
          var searchResultSet = _this11.initializeSearchResultSet(query);
          var searchResultSetItemList = [];

          // search with user defined dataSources (DataSourceType = "UserCategory")
          var myFavorites = query.filter.dataSource;
          var childFavorites = [];
          _this11.multiSina.forEach(function (childSina) {
            // supported provider (abap_odata, sample), create child favorites dataSource
            if (childSina.provider.id.startsWith("abap_odata") || childSina.provider.id.startsWith("sample")) {
              var childFavoritesDataSourceId = _this4.providerHelper.calculateMultiDataSourceId(myFavorites.id, childSina.provider.id);
              var providerFavorite = _this4.multiDataSourceMap[childFavoritesDataSourceId];
              // check if providerFavorite is included in this.multiDataSourceMap
              if (!providerFavorite) {
                providerFavorite = childSina.createDataSource({
                  id: childFavoritesDataSourceId,
                  label: myFavorites.label,
                  labelPlural: myFavorites.labelPlural,
                  type: myFavorites.type,
                  subDataSources: [],
                  undefinedSubDataSourceIds: []
                });
                // add providerFavorite to this.multiDataSourceMap
                _this4.multiDataSourceMap[childFavoritesDataSourceId] = providerFavorite;
              } else {
                // providerFavorite exists in this.multiDataSourceMap (initalize subDataSources)
                providerFavorite.subDataSources = [];
              }
            }
          });
          // loop subDataSources, split to get a list childFavorites with different providers
          myFavorites.subDataSources.forEach(function (subDataSource) {
            var childDataSource = _this4.multiDataSourceMap[subDataSource.id];
            var childDataSourceSina = childDataSource.sina;
            // abap_odata and sample provider can search with subDataSources, split with each abap_odata and sample provider
            if (childDataSourceSina.provider.id.startsWith("abap_odata") || childDataSourceSina.provider.id.startsWith("sample")) {
              var childFavoritesDataSourceId = _this4.providerHelper.calculateMultiDataSourceId(myFavorites.id, childDataSourceSina.provider.id);
              var providerFavorite = _this4.multiDataSourceMap[childFavoritesDataSourceId];
              if (providerFavorite.subDataSources.length === 0) {
                childFavorites.push(providerFavorite);
              }
              providerFavorite.subDataSources.push(childDataSource);
            }
            // other providers can only search with one dataSource, split as single dataSource
            // delete possible (else)
            else {
              childFavorites.push(childDataSource);
            }
          });
          childFavorites.forEach(function (childFavorite) {
            childQuery = childFavorite.sina.createSearchQuery({
              calculateFacets: query.calculateFacets,
              multiSelectFacets: query.multiSelectFacets,
              dataSource: childFavorite,
              searchTerm: query.getSearchTerm(),
              top: query.top,
              skip: query.skip,
              sortOrder: query.sortOrder,
              sina: childFavorite.sina
            });
            queries.push(childQuery.getResultSetAsync());
          });
          return Promise.all(queries).then(function (result) {
            searchResultSet.facets.push(_this4.sina._createDataSourceResultSet({
              title: query.filter.dataSource.label,
              items: [],
              query: query
            }));
            for (var j = 0; j < result.length; j++) {
              var querySearchResultSet = result[j];
              for (var k = 0; k < querySearchResultSet.items.length; k++) {
                var resultItem = querySearchResultSet.items[k];
                var multiId = _this4.providerHelper.calculateMultiDataSourceId(resultItem.dataSource.id, resultItem.sina.provider.id);
                var dataSource = _this4.sina.dataSourceMap[multiId];
                // update dataSource consisting of provider Id and dataSource Id
                resultItem.dataSource = dataSource;
                resultItem.sina = _this4.sina;
              }
              searchResultSet.totalCount += querySearchResultSet.totalCount;
              searchResultSetItemList.push(querySearchResultSet.items);

              // favorite should certainly be a dataSource facet
              if (query.calculateFacets) {
                var childDataSource = querySearchResultSet.query.filter.dataSource;
                var childDataSourceResultSet = querySearchResultSet.sina._createDataSourceResultSet({
                  title: childDataSource.label,
                  items: [],
                  query: querySearchResultSet.query
                });
                // manually create a dataSourceResultSet for abap_odata/sample one dataSource child favorite, resultSet has no facet
                if (querySearchResultSet.facets.length === 0 && querySearchResultSet.items.length > 0) {
                  childDataSourceResultSet.items.push(querySearchResultSet.sina._createDataSourceResultSetItem({
                    dataSource: childDataSource.subDataSources[0],
                    dimensionValueFormatted: childDataSource.subDataSources[0].label,
                    measureValue: querySearchResultSet.totalCount,
                    measureValueFormatted: querySearchResultSet.totalCount
                  }));
                  querySearchResultSet.facets.push(childDataSourceResultSet);
                }
                // manually update a dataSourceResultSet for non abap_odata favorite, resultSet has chart facet
                if (querySearchResultSet.facets.length > 0 && querySearchResultSet.facets[0].type === "Chart" && querySearchResultSet.items.length > 0) {
                  childDataSourceResultSet.items.push(querySearchResultSet.sina._createDataSourceResultSetItem({
                    dataSource: childDataSource,
                    dimensionValueFormatted: childDataSource.label,
                    measureValue: querySearchResultSet.totalCount,
                    measureValueFormatted: querySearchResultSet.totalCount
                  }));
                  querySearchResultSet.facets = [childDataSourceResultSet];
                }
                // normally update a dataSourceResultSet
                if (querySearchResultSet.facets.length === 1 && querySearchResultSet.facets[0].type === "DataSource") {
                  _this4.providerHelper.updateDataSourceFacets(querySearchResultSet.facets);
                  searchResultSet.facets[0].items = searchResultSet.facets[0].items.concat(querySearchResultSet.facets[0].items);
                }
              }
            }
            searchResultSet.items = _this4.federationMethod.sort(searchResultSetItemList);
            searchResultSet.items = searchResultSet.items.slice(query.skip, query.top);
            return searchResultSet;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "handleBusinessObjectSearch",
      value: function handleBusinessObjectSearch(query) {
        try {
          const _this12 = this;
          var _this5 = _this12;
          // search with single child provider dataSource
          var childDataSource = _this12.multiDataSourceMap[query.filter.dataSource.id];
          var rootCondition = query.getRootCondition().clone();
          var searchResultSet = _this12.initializeSearchResultSet(query);
          _this12.providerHelper.updateRootCondition(rootCondition, childDataSource.sina);
          var childQuery = childDataSource.sina.createSearchQuery({
            calculateFacets: query.calculateFacets,
            multiSelectFacets: query.multiSelectFacets,
            dataSource: childDataSource,
            searchTerm: query.getSearchTerm(),
            rootCondition: query.getRootCondition(),
            top: query.top,
            skip: query.skip,
            sortOrder: query.sortOrder,
            sina: childDataSource.sina
          });
          return _await(childQuery.getResultSetAsync().then(function (querySearchResultSet) {
            searchResultSet.items = querySearchResultSet.items;
            searchResultSet.totalCount = querySearchResultSet.totalCount;
            for (var i = 0; i < searchResultSet.items.length; i++) {
              var resultItem = searchResultSet.items[i];
              var resultItemMultiId = _this5.providerHelper.calculateMultiDataSourceId(resultItem.dataSource.id, resultItem.sina.provider.id);
              //update attributes metadata
              _this5.providerHelper.updateAttributesMetadata(resultItem.dataSource, _this5.sina.dataSourceMap[resultItemMultiId]);
              //set the facet result item dataSource as multi provider dataSource
              resultItem.dataSource = _this5.sina.dataSourceMap[resultItemMultiId];
              resultItem.sina = _this5.sina;
            }
            var multiFacets;
            //dataSource facet
            if (querySearchResultSet.facets.length === 1 && querySearchResultSet.facets[0].items[0].dataSource) {
              multiFacets = querySearchResultSet.facets;
              multiFacets[0].title = _this5.providerHelper.calculateMultiDataSourceLabel(querySearchResultSet.facets[0].title, querySearchResultSet.facets[0].sina.provider);
              _this5.providerHelper.updateDataSourceFacets(multiFacets);
            } else {
              //chart facet
              multiFacets = [];
              for (var k = 0; k < querySearchResultSet.facets.length; k++) {
                var chartResultSet = querySearchResultSet.facets[k];
                multiFacets.push(_this5.providerHelper.createMultiChartResultSet(chartResultSet));
              }
            }
            searchResultSet.facets = multiFacets;
            return searchResultSet;
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "initializeSearchResultSet",
      value: function initializeSearchResultSet(query) {
        return this.sina._createSearchResultSet({
          title: "Search Multi Result List",
          query: query,
          items: [],
          totalCount: 0,
          facets: []
        });
      }
    }, {
      key: "executeSearchQuery",
      value: function executeSearchQuery(query) {
        switch (this.getFilterDataSourceType(query.filter.dataSource)) {
          // dataSource All
          case FilterDataSourceType.All:
            return this.handleAllSearch(query);
          // dataSource My Favorites
          case FilterDataSourceType.UserCategory:
            return this.handleUserCategorySearch(query);
          // dataSource Connector or Category
          case FilterDataSourceType.BusinessObject:
          case FilterDataSourceType.Category:
            return this.handleBusinessObjectSearch(query);
        }
      }
    }, {
      key: "executeChartQuery",
      value: function executeChartQuery(query) {
        var that = this;
        var childDataSource = that.multiDataSourceMap[query.filter.dataSource.id];
        var rootCondition = query.getRootCondition().clone();
        that.providerHelper.updateRootCondition(rootCondition, childDataSource.sina);
        var childQuery = childDataSource.sina.createChartQuery({
          dimension: query.dimension,
          dataSource: childDataSource,
          searchTerm: query.getSearchTerm(),
          rootCondition: rootCondition,
          top: query.top,
          skip: query.skip,
          sortOrder: query.sortOrder
        });
        return childQuery.getResultSetAsync().then(function (chartResultSet) {
          return that.providerHelper.createMultiChartResultSet(chartResultSet);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, {
      key: "executeHierarchyQuery",
      value: function executeHierarchyQuery(query) {
        throw new NotImplementedError();
      }
    }, {
      key: "handleAllSuggestionSearch",
      value: function handleAllSuggestionSearch(query) {
        try {
          const _this13 = this;
          var _this6 = _this13;
          var childQuery;
          var queries = [];
          for (var i = 0; i < _this13.multiSina.length; i++) {
            childQuery = _this13.multiSina[i].createSuggestionQuery({
              types: query.types,
              calculationModes: query.calculationModes,
              dataSource: _this13.multiSina[i].allDataSource,
              searchTerm: query.getSearchTerm(),
              top: query.top,
              skip: query.skip,
              sortOrder: query.sortOrder
            });
            queries.push(childQuery.getResultSetAsync());
          }
          return _await(Promise.allSettled(queries).then(function (results) {
            var mergedSuggestionResultSet = _this6.sina._createSuggestionResultSet({
              title: "Multi Suggestions",
              query: query,
              items: []
            });
            for (var j = 0; j < results.length; j++) {
              var result = results[j];
              if (result.status === "fulfilled") {
                var suggestionResultSet = _this6.providerHelper.updateSuggestionDataSource(result.value);
                mergedSuggestionResultSet.items = new FederationMethod.RoundRobin().mergeMultiResults(mergedSuggestionResultSet.items, suggestionResultSet.items, j + 1);
              }
            }
            return mergedSuggestionResultSet;
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "handleUserCategorySuggestionSearch",
      value: function handleUserCategorySuggestionSearch(query) {
        try {
          const _this14 = this;
          if (query.types.indexOf(_this14.sina.SuggestionType.DataSource) >= 0) {
            return _await(_this14.handleAllSuggestionSearch(query));
          } else {
            var emptySuggestionResultSet = _this14.sina._createSuggestionResultSet({
              title: "Multi Suggestions - My Favorites",
              query: query,
              items: []
            });
            return Promise.resolve(emptySuggestionResultSet);
          }
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "handleBusinessObjectSuggestionSearch",
      value: function handleBusinessObjectSuggestionSearch(query) {
        try {
          const _this15 = this;
          var _this7 = _this15;
          var childDataSource = _this15.multiDataSourceMap[query.filter.dataSource.id];
          var childQuery = childDataSource.sina.createSuggestionQuery({
            types: query.types,
            calculationModes: query.calculationModes,
            dataSource: childDataSource,
            searchTerm: query.getSearchTerm(),
            top: query.top,
            skip: query.skip,
            sortOrder: query.sortOrder
          });
          return _await(childQuery.getResultSetAsync().then(function (results) {
            return _this7.providerHelper.updateSuggestionDataSource(results);
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "executeSuggestionQuery",
      value: function executeSuggestionQuery(query) {
        switch (this.getFilterDataSourceType(query.filter.dataSource)) {
          // dataSource All
          case FilterDataSourceType.All:
            return this.handleAllSuggestionSearch(query);
          // dataSource My Favorites
          case FilterDataSourceType.UserCategory:
            return this.handleUserCategorySuggestionSearch(query);
          // dataSource Connector or Category
          case FilterDataSourceType.BusinessObject:
          case FilterDataSourceType.Category:
            return this.handleBusinessObjectSuggestionSearch(query);
        }
      }
    }]);
    return MultiProvider;
  }(AbstractProvider);
  var __exports = {
    __esModule: true
  };
  __exports.MultiProvider = MultiProvider;
  return __exports;
});
})();