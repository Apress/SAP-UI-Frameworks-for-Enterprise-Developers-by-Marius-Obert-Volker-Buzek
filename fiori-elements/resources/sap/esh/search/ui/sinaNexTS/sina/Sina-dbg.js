/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _empty() {}
function _awaitIgnored(value, direct) {
  if (!direct) {
    return value && value.then ? value.then(_empty) : Promise.resolve();
  }
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["../core/core", "../core/errors", "../core/util", "./AttributeType", "./AttributeFormatType", "./AttributeGroupTextArrangement", "./DataSourceType", "./MatchingStrategy", "./LogicalOperator", "./ComparisonOperator", "./FacetType", "./SuggestionCalculationMode", "./SuggestionType", "./SortOrder", "./ConditionType", "../providers/tools/cds/CDSAnnotationsParser", "../providers/tools/sors/NavigationTargetGenerator", "./SearchResultSet", "./SearchResultSetItem", "./SearchResultSetItemAttribute", "./ObjectSuggestion", "./SearchQuery", "./ChartQuery", "./SuggestionQuery", "./DataSourceQuery", "./Filter", "./ComplexCondition", "./SimpleCondition", "./AttributeMetadata", "./AttributeGroupMetadata", "./AttributeGroupMembership", "./SearchResultSetItemAttributeGroup", "./SearchResultSetItemAttributeGroupMembership", "./SearchTermSuggestion", "./SearchTermAndDataSourceSuggestion", "./DataSourceSuggestion", "./SuggestionResultSet", "./ChartResultSet", "./DataSourceResultSet", "./ChartResultSetItem", "./DataSourceResultSetItem", "./Capabilities", "./Configuration", "./NavigationTarget", "./formatters/Formatter", "./DataSource", "./UserCategoryDataSource", "../providers/tools/ItemPostParser", "../providers/tools/fiori/SuvNavTargetResolver", "../providers/tools/fiori/NavigationTargetForIntent", "../providers/tools/fiori/FioriIntentsResolver", "./formatters/ResultValueFormatter", "./formatters/NavtargetsInResultSetFormatter", "./formatters/HierarchyResultSetFormatter", "./formatters/ConfigSearchResultSetFormatter", "./formatters/ConfigMetadataFormatter", "./FilteredDataSource", "../providers/inav2/Provider", "../providers/abap_odata/Provider", "./HierarchyQuery", "./HierarchyNode", "./HierarchyResultSet", "../providers/inav2/typeConverter", "./HierarchyNodePath", "./HierarchyDisplayType"], function (core, errors, util, ___AttributeType, ___AttributeFormatType, ___AttributeGroupTextArrangement, ___DataSourceType, ___MatchingStrategy, ___LogicalOperator, ___ComparisonOperator, ___FacetType, ___SuggestionCalculationMode, ___SuggestionType, ___SortOrder, ___ConditionType, ___providers_tools_cds_CDSAnnotationsParser, ___providers_tools_sors_NavigationTargetGenerator, ___SearchResultSet, ___SearchResultSetItem, ___SearchResultSetItemAttribute, ___ObjectSuggestion, ___SearchQuery, ___ChartQuery, ___SuggestionQuery, ___DataSourceQuery, ___Filter, ___ComplexCondition, ___SimpleCondition, ___AttributeMetadata, ___AttributeGroupMetadata, ___AttributeGroupMembership, ___SearchResultSetItemAttributeGroup, ___SearchResultSetItemAttributeGroupMembership, ___SearchTermSuggestion, ___SearchTermAndDataSourceSuggestion, ___DataSourceSuggestion, ___SuggestionResultSet, ___ChartResultSet, ___DataSourceResultSet, ___ChartResultSetItem, ___DataSourceResultSetItem, ___Capabilities, ___Configuration, ___NavigationTarget, ___formatters_Formatter, ___DataSource, ___UserCategoryDataSource, ___providers_tools_ItemPostParser, ___providers_tools_fiori_SuvNavTargetResolver, ___providers_tools_fiori_NavigationTargetForIntent, ___providers_tools_fiori_FioriIntentsResolver, ___formatters_ResultValueFormatter, ___formatters_NavtargetsInResultSetFormatter, ___formatters_HierarchyResultSetFormatter, ___formatters_ConfigSearchResultSetFormatter, ___formatters_ConfigMetadataFormatter, ___FilteredDataSource, ___providers_inav2_Provider, ___providers_abap_odata_Provider, ___HierarchyQuery, ___HierarchyNode, ___HierarchyResultSet, inav2TypeConverter, ___HierarchyNodePath, ___HierarchyDisplayType) {
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
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
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
  var AttributeType = ___AttributeType["AttributeType"];
  var AttributeFormatType = ___AttributeFormatType["AttributeFormatType"];
  var AttributeGroupTextArrangement = ___AttributeGroupTextArrangement["AttributeGroupTextArrangement"];
  var DataSourceSubType = ___DataSourceType["DataSourceSubType"];
  var DataSourceType = ___DataSourceType["DataSourceType"];
  var MatchingStrategy = ___MatchingStrategy["MatchingStrategy"];
  var LogicalOperator = ___LogicalOperator["LogicalOperator"];
  var ComparisonOperator = ___ComparisonOperator["ComparisonOperator"];
  var FacetType = ___FacetType["FacetType"];
  var SuggestionCalculationMode = ___SuggestionCalculationMode["SuggestionCalculationMode"];
  var SuggestionType = ___SuggestionType["SuggestionType"];
  var SortOrder = ___SortOrder["SortOrder"];
  var ConditionType = ___ConditionType["ConditionType"];
  var CDSAnnotationsParser = ___providers_tools_cds_CDSAnnotationsParser["CDSAnnotationsParser"];
  var SorsNavigationTargetGenerator = ___providers_tools_sors_NavigationTargetGenerator["NavigationTargetGenerator"];
  var SearchResultSet = ___SearchResultSet["SearchResultSet"];
  var SearchResultSetItem = ___SearchResultSetItem["SearchResultSetItem"];
  var SearchResultSetItemAttribute = ___SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var ObjectSuggestion = ___ObjectSuggestion["ObjectSuggestion"];
  var SearchQuery = ___SearchQuery["SearchQuery"];
  var ChartQuery = ___ChartQuery["ChartQuery"];
  var SuggestionQuery = ___SuggestionQuery["SuggestionQuery"];
  var DataSourceQuery = ___DataSourceQuery["DataSourceQuery"];
  var Filter = ___Filter["Filter"];
  var ComplexCondition = ___ComplexCondition["ComplexCondition"];
  var SimpleCondition = ___SimpleCondition["SimpleCondition"];
  var AttributeMetadata = ___AttributeMetadata["AttributeMetadata"];
  var AttributeGroupMetadata = ___AttributeGroupMetadata["AttributeGroupMetadata"];
  var AttributeGroupMembership = ___AttributeGroupMembership["AttributeGroupMembership"];
  var SearchResultSetItemAttributeGroup = ___SearchResultSetItemAttributeGroup["SearchResultSetItemAttributeGroup"];
  var SearchResultSetItemAttributeGroupMembership = ___SearchResultSetItemAttributeGroupMembership["SearchResultSetItemAttributeGroupMembership"];
  var SearchTermSuggestion = ___SearchTermSuggestion["SearchTermSuggestion"];
  var SearchTermAndDataSourceSuggestion = ___SearchTermAndDataSourceSuggestion["SearchTermAndDataSourceSuggestion"];
  var DataSourceSuggestion = ___DataSourceSuggestion["DataSourceSuggestion"];
  var SuggestionResultSet = ___SuggestionResultSet["SuggestionResultSet"];
  var ChartResultSet = ___ChartResultSet["ChartResultSet"];
  var DataSourceResultSet = ___DataSourceResultSet["DataSourceResultSet"];
  var ChartResultSetItem = ___ChartResultSetItem["ChartResultSetItem"];
  var DataSourceResultSetItem = ___DataSourceResultSetItem["DataSourceResultSetItem"];
  var Capabilities = ___Capabilities["Capabilities"];
  var Configuration = ___Configuration["Configuration"];
  var NavigationTarget = ___NavigationTarget["NavigationTarget"];
  var Formatter = ___formatters_Formatter["Formatter"];
  var DataSource = ___DataSource["DataSource"];
  var UserCategoryDataSource = ___UserCategoryDataSource["UserCategoryDataSource"];
  var ItemPostParser = ___providers_tools_ItemPostParser["ItemPostParser"];
  var SuvNavTargetResolver = ___providers_tools_fiori_SuvNavTargetResolver["SuvNavTargetResolver"];
  var NavigationTargetForIntent = ___providers_tools_fiori_NavigationTargetForIntent["NavigationTargetForIntent"];
  var FioriIntentsResolver = ___providers_tools_fiori_FioriIntentsResolver["FioriIntentsResolver"];
  var ResultValueFormatter = ___formatters_ResultValueFormatter["ResultValueFormatter"];
  var NavtargetsInResultSetFormatter = ___formatters_NavtargetsInResultSetFormatter["NavtargetsInResultSetFormatter"];
  var HierarchyResultSetFormatter = ___formatters_HierarchyResultSetFormatter["HierarchyResultSetFormatter"];
  var ConfigSearchResultSetFormatter = ___formatters_ConfigSearchResultSetFormatter["ConfigSearchResultSetFormatter"];
  var ConfigMetadataFormatter = ___formatters_ConfigMetadataFormatter["ConfigMetadataFormatter"];
  var FilteredDataSource = ___FilteredDataSource["FilteredDataSource"];
  var InAV2Provider = ___providers_inav2_Provider["Provider"];
  var ABAPODataProvider = ___providers_abap_odata_Provider["Provider"];
  var HierarchyQuery = ___HierarchyQuery["HierarchyQuery"];
  var HierarchyNode = ___HierarchyNode["HierarchyNode"];
  var HierarchyResultSet = ___HierarchyResultSet["HierarchyResultSet"];
  var HierarchyNodePath = ___HierarchyNodePath["HierarchyNodePath"];
  var HierarchyDisplayType = ___HierarchyDisplayType["HierarchyDisplayType"];
  /**
   * The Enterprise Search Client API.
   */
  var Sina = /*#__PURE__*/function () {
    function Sina(provider) {
      _classCallCheck(this, Sina);
      _defineProperty(this, "isNeededCache", {});
      this.core = core; // convenience: expose core lib
      this.errors = errors; // convenience: expose core lib
      this.util = util; // convenience: expose util lib
      this.inav2TypeConverter = inav2TypeConverter; // do not use except for inav2 compatability
      this.provider = provider;
      this.createSearchQuery = this.createSinaObjectFactory(SearchQuery);
      this.createChartQuery = this.createSinaObjectFactory(ChartQuery);
      this.createHierarchyQuery = this.createSinaObjectFactory(HierarchyQuery);
      this.createSuggestionQuery = this.createSinaObjectFactory(SuggestionQuery);
      this.createDataSourceQuery = this.createSinaObjectFactory(DataSourceQuery);
      this.createFilter = this.createSinaObjectFactory(Filter);
      this.createComplexCondition = this.createSinaObjectFactory(ComplexCondition);
      this.createSimpleCondition = this.createSinaObjectFactory(SimpleCondition);
      this.createHierarchyNode = this.createSinaObjectFactory(HierarchyNode);
      this.createHierarchyNodePath = this.createSinaObjectFactory(HierarchyNodePath);
      this._createAttributeMetadata = this.createSinaObjectFactory(AttributeMetadata);
      this._createAttributeGroupMetadata = this.createSinaObjectFactory(AttributeGroupMetadata);
      this._createAttributeGroupMembership = this.createSinaObjectFactory(AttributeGroupMembership);
      this._createSearchResultSetItemAttribute = this.createSinaObjectFactory(SearchResultSetItemAttribute);
      this._createSearchResultSetItemAttributeGroup = this.createSinaObjectFactory(SearchResultSetItemAttributeGroup);
      this._createSearchResultSetItemAttributeGroupMembership = this.createSinaObjectFactory(SearchResultSetItemAttributeGroupMembership);
      this._createSearchResultSetItem = this.createSinaObjectFactory(SearchResultSetItem);
      this._createSearchResultSet = this.createSinaObjectFactory(SearchResultSet);
      this._createSearchTermSuggestion = this.createSinaObjectFactory(SearchTermSuggestion);
      this._createSearchTermAndDataSourceSuggestion = this.createSinaObjectFactory(SearchTermAndDataSourceSuggestion);
      this._createDataSourceSuggestion = this.createSinaObjectFactory(DataSourceSuggestion);
      this._createObjectSuggestion = this.createSinaObjectFactory(ObjectSuggestion);
      this._createSuggestionResultSet = this.createSinaObjectFactory(SuggestionResultSet);
      this._createChartResultSet = this.createSinaObjectFactory(ChartResultSet);
      this._createHierarchyResultSet = this.createSinaObjectFactory(HierarchyResultSet);
      this._createChartResultSetItem = this.createSinaObjectFactory(ChartResultSetItem);
      this._createDataSourceResultSetItem = this.createSinaObjectFactory(DataSourceResultSetItem);
      this._createCapabilities = this.createSinaObjectFactory(Capabilities);
      this._createConfiguration = this.createSinaObjectFactory(Configuration);
      this._createNavigationTarget = this.createSinaObjectFactory(NavigationTarget);
      this._createSorsNavigationTargetGenerator = this.createSinaObjectFactory(SorsNavigationTargetGenerator);
      this._createFioriIntentsResolver = this.createSinaObjectFactory(FioriIntentsResolver);
      this._createNavigationTargetForIntent = this.createSinaObjectFactory(NavigationTargetForIntent);
      this._createCDSAnnotationsParser = this.createSinaObjectFactory(CDSAnnotationsParser);
      this._createItemPostParser = this.createSinaObjectFactory(ItemPostParser);
      this._createSuvNavTargetResolver = this.createSinaObjectFactory(SuvNavTargetResolver);
      this.searchResultSetFormatters = [];
      this.suggestionResultSetFormatters = [];
      this.chartResultSetFormatters = [];
      this.metadataFormatters = [];
      this.dataSources = [];
      this.dataSourceMap = {};
      this.allDataSource = this.createDataSource({
        id: "All",
        label: "All",
        type: DataSourceType.Category
      });
      this.searchResultSetFormatters.push(new NavtargetsInResultSetFormatter());
      this.searchResultSetFormatters.push(new HierarchyResultSetFormatter());
      // this.searchResultSetFormatters.push(new RemovePureAdvancedSearchFacetsFormatter());
      this.searchResultSetFormatters.push(new ResultValueFormatter());
      this.DataSourceType = DataSourceType;
      this.DataSourceSubType = DataSourceSubType;
      this.HierarchyDisplayType = HierarchyDisplayType;
      this.AttributeGroupTextArrangement = AttributeGroupTextArrangement;
      this.AttributeType = AttributeType;
      this.AttributeFormatType = AttributeFormatType;
      this.FacetType = FacetType;
      this.SuggestionType = SuggestionType;
      this.ConditionType = ConditionType;
      this.SuggestionCalculationMode = SuggestionCalculationMode;
      this.SortOrder = SortOrder;
      this.MatchingStrategy = MatchingStrategy;
      this.ComparisonOperator = ComparisonOperator;
      this.LogicalOperator = LogicalOperator;
    }
    _createClass(Sina, [{
      key: "initAsync",
      value: function initAsync(configuration) {
        try {
          const _this2 = this;
          _this2.configuration = configuration;
          _this2.isDummyProvider = configuration.provider.indexOf("dummy") > -1;
          _this2.provider.label = configuration.label;
          return _await(_this2._evaluateConfigurationAsync(configuration), function () {
            configuration.sina = _this2;
            return _await(_this2.provider.initAsync(configuration), function (initializationResult) {
              initializationResult = initializationResult || {
                capabilities: null
              };
              _this2.capabilities = initializationResult.capabilities || _this2._createCapabilities({
                sina: _this2
              });
              return _await(_this2._formatMetadataAsync(), function () {
                return _invoke(function () {
                  if (configuration.initAsync) {
                    return _awaitIgnored(configuration.initAsync(_this2));
                  }
                }, function () {
                  if (_this2.getBusinessObjectDataSources().length === 0 && !_this2.isDummyProvider) {
                    throw new errors.ESHNotActiveError("Not active - no datasources");
                  }
                });
              });
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_formatMetadataAsync",
      value: function _formatMetadataAsync() {
        return core.executeSequentialAsync(this.metadataFormatters, function (formatter) {
          return formatter.formatAsync({
            dataSources: this.dataSources
          });
        }.bind(this));
      }
    }, {
      key: "_evaluateConfigurationAsync",
      value: function _evaluateConfigurationAsync(configuration) {
        try {
          const _this3 = this;
          var promises = [];

          // search result set formatters
          if (configuration.searchResultSetFormatters) {
            for (var i = 0; i < configuration.searchResultSetFormatters.length; ++i) {
              var searchResultSetFormatter = configuration.searchResultSetFormatters[i];
              if (!(searchResultSetFormatter instanceof Formatter) &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              !searchResultSetFormatter.formatAsync) {
                searchResultSetFormatter = new ConfigSearchResultSetFormatter(searchResultSetFormatter);
              }
              _this3.searchResultSetFormatters.push(searchResultSetFormatter);
              if (searchResultSetFormatter.initAsync) {
                promises.push(searchResultSetFormatter.initAsync());
              }
            }
          }

          // suggestion result set formatters
          if (configuration.suggestionResultSetFormatters) {
            for (var _i = 0; _i < configuration.suggestionResultSetFormatters.length; ++_i) {
              var suggestionResultSetFormatter = configuration.suggestionResultSetFormatters[_i];
              _this3.suggestionResultSetFormatters.push(suggestionResultSetFormatter);
              if (suggestionResultSetFormatter.initAsync) {
                promises.push(suggestionResultSetFormatter.initAsync());
              }
            }
          }

          // chart result set formatters
          if (configuration.chartResultSetFormatters) {
            for (var _i2 = 0; _i2 < configuration.chartResultSetFormatters.length; ++_i2) {
              var chartResultSetFormatter = configuration.chartResultSetFormatters[_i2];
              _this3.chartResultSetFormatters.push(chartResultSetFormatter);
              if (chartResultSetFormatter.initAsync) {
                promises.push(chartResultSetFormatter.initAsync());
              }
            }
          }

          // metadata formatters
          if (configuration.metadataFormatters) {
            for (var j = 0; j < configuration.metadataFormatters.length; ++j) {
              var metadataFormatter = configuration.metadataFormatters[j];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (!(metadataFormatter instanceof Formatter) && !metadataFormatter.formatAsync) {
                metadataFormatter = new ConfigMetadataFormatter(metadataFormatter);
              }
              _this3.metadataFormatters.push(metadataFormatter);
              if (metadataFormatter.initAsync) {
                promises.push(metadataFormatter.initAsync());
              }
            }
          }
          return Promise.all(promises);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "loadMetadata",
      value: function loadMetadata(dataSource) {
        try {
          const _this4 = this;
          // do not use
          // only for compatability inav2
          if (_this4.provider instanceof InAV2Provider) {
            if (_this4.provider.loadMetadata) {
              return _await(_this4.provider.loadMetadata(dataSource));
            }
          }
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "createDataSourceMap",
      value: function createDataSourceMap(dataSources) {
        var map = {};
        for (var i = 0; i < dataSources.length; ++i) {
          var dataSource = dataSources[i];
          map[dataSource.id] = dataSource;
        }
        return map;
      }
    }, {
      key: "createSinaObjectFactory",
      value: function createSinaObjectFactory(Clazz) {
        return function (properties) {
          var _properties;
          properties = (_properties = properties) !== null && _properties !== void 0 ? _properties : {
            sina: this
          };
          properties.sina = this;
          return new Clazz(properties);
        };
      }
    }, {
      key: "_createDataSourceResultSet",
      value: function _createDataSourceResultSet(properties) {
        var filteredItems = this.removeHierarchyHelperDataSources(properties.items, function (item) {
          return item.dataSource;
        });
        properties.items = filteredItems;
        var dataSourceResultSet = new DataSourceResultSet(properties);
        dataSourceResultSet.sina = this;
        return dataSourceResultSet;
      }
    }, {
      key: "removeHierarchyHelperDataSources",
      value: function removeHierarchyHelperDataSources(list, getDataSource) {
        var _this = this;
        var isNeeded = function isNeeded(dataSourceToBeChecked) {
          var cache = _this.isNeededCache[dataSourceToBeChecked.id];
          if (typeof cache !== "undefined") {
            return cache;
          }
          var _iterator = _createForOfIteratorHelper(_this.dataSources),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var dataSource = _step.value;
              var _iterator2 = _createForOfIteratorHelper(dataSource.attributesMetadata),
                _step2;
              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var attributeMetaData = _step2.value;
                  if (attributeMetaData.hierarchyName === dataSourceToBeChecked.hierarchyName && attributeMetaData.hierarchyDisplayType === HierarchyDisplayType.HierarchyResultView) {
                    _this.isNeededCache[dataSourceToBeChecked.id] = true;
                    return true;
                  }
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          _this.isNeededCache[dataSourceToBeChecked.id] = false;
          return false;
        };
        for (var i = 0; i < list.length; i++) {
          var element = list[i];
          var dataSource = getDataSource(element);
          if (!dataSource.isHierarchyDefinition) {
            continue;
          }
          if (!isNeeded(dataSource)) {
            list.splice(i, 1);
            i--;
          }
        }
        return list;
      }
    }, {
      key: "createDataSource",
      value: function createDataSource(properties) {
        properties.sina = this;
        var dataSource;
        switch (properties.type) {
          case DataSourceType.BusinessObject:
            switch (properties.subType) {
              case DataSourceSubType.Filtered:
                dataSource = new FilteredDataSource(properties);
                break;
              default:
                dataSource = new DataSource(properties);
            }
            break;
          case DataSourceType.UserCategory:
            dataSource = new UserCategoryDataSource(properties);
            break;
          default:
            dataSource = new DataSource(properties);
        }
        if (this.dataSourceMap[dataSource.id]) {
          throw new errors.CanNotCreateAlreadyExistingDataSourceError('cannot create an already existing datasource: "' + dataSource.id + '"');
        }
        this._addDataSource(dataSource);
        return dataSource;
      }

      /**
       *
       * @deprecated Use sina.createDataSource() instead
       */
    }, {
      key: "_createDataSource",
      value: function _createDataSource(properties) {
        return this.createDataSource(properties);
      }
    }, {
      key: "_addDataSource",
      value: function _addDataSource(dataSource) {
        if (dataSource.type === DataSourceType.BusinessObject && dataSource.subType === DataSourceSubType.Filtered) {
          // 1 filtered datasources
          var insertIndex = -1;
          for (var i = this.dataSources.length - 1; i >= 1; --i) {
            var checkDataSource = this.dataSources[i];
            if (checkDataSource.type === DataSourceType.BusinessObject && checkDataSource.subType === DataSourceSubType.Filtered) {
              insertIndex = i;
              break;
            }
          }
          if (insertIndex >= 0) {
            this.dataSources.splice(insertIndex + 1, 0, dataSource);
          } else {
            this.dataSources.push(dataSource);
          }
        } else {
          // 2 other datasources
          this.dataSources.push(dataSource);
        }
        this.dataSourceMap[dataSource.id] = dataSource;
      }
    }, {
      key: "getAllDataSource",
      value: function getAllDataSource() {
        return this.allDataSource;
      }
    }, {
      key: "getBusinessObjectDataSources",
      value: function getBusinessObjectDataSources() {
        var result = [];
        for (var i = 0; i < this.dataSources.length; ++i) {
          var dataSource = this.dataSources[i];
          if (!dataSource.hidden && dataSource.type === DataSourceType.BusinessObject && dataSource.subType !== DataSourceSubType.Filtered) {
            result.push(dataSource);
          }
        }
        return this.removeHierarchyHelperDataSources(result, function (dataSource) {
          return dataSource;
        });
      }
    }, {
      key: "getDataSource",
      value: function getDataSource(id) {
        return this.dataSourceMap[id];
      }
    }, {
      key: "getConfigurationAsync",
      value: function getConfigurationAsync() {
        try {
          const _arguments = arguments,
            _this5 = this;
          var properties = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
          if (_this5.provider instanceof InAV2Provider || _this5.provider instanceof ABAPODataProvider) {
            if (_this5.configurationPromise && !properties.forceReload) {
              return _await(_this5.configurationPromise);
            }
            _this5.configurationPromise = _this5.provider.getConfigurationAsync();
            return _await(_this5.configurationPromise);
          }
          return Promise.resolve(_this5._createConfiguration({
            personalizedSearch: false,
            isPersonalizedSearchEditable: false
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "logUserEvent",
      value: function logUserEvent(event) {
        if (this.provider instanceof InAV2Provider || this.provider instanceof ABAPODataProvider) {
          this.provider.logUserEvent(event);
        }
      }
    }, {
      key: "getDebugInfo",
      value: function getDebugInfo() {
        return this.provider.getDebugInfo();
      }
    }, {
      key: "parseDataSourceFromJson",
      value: function parseDataSourceFromJson(json) {
        var dataSource = this.getDataSource(json.id);
        if (dataSource) {
          return dataSource;
        }
        if (json.type !== DataSourceType.Category) {
          throw new errors.DataSourceInURLDoesNotExistError("Datasource in URL does not exist " + json.id);
        }
        dataSource = this._createDataSource(json);
        return dataSource;
      }
    }, {
      key: "parseSimpleConditionFromJson",
      value: function parseSimpleConditionFromJson(json) {
        var value;
        if (core.isObject(json.value)) {
          value = util.dateFromJson(json.value);
        } else {
          value = json.value;
        }
        // Following should satisfy no-unneeded-ternary eslint rule:
        var userDefined;
        if (json.userDefined) {
          userDefined = true;
        } else {
          userDefined = false;
        }
        var isDynamicValue;
        if (json.dynamic) {
          isDynamicValue = true;
        } else {
          isDynamicValue = false;
        }
        return this.createSimpleCondition({
          operator: json.operator,
          attribute: json.attribute,
          value: value,
          attributeLabel: json.attributeLabel,
          valueLabel: json.valueLabel,
          userDefined: userDefined,
          isDynamicValue: isDynamicValue
        });
      }
    }, {
      key: "parseComplexConditionFromJson",
      value: function parseComplexConditionFromJson(json) {
        var conditions = [];
        for (var i = 0; i < json.conditions.length; ++i) {
          var conditionJson = json.conditions[i];
          conditions.push(this.parseConditionFromJson(conditionJson));
        }
        // Following should satisfy no-unneeded-ternary eslint rule:
        var userDefined;
        if (json.userDefined) {
          userDefined = true;
        } else {
          userDefined = false;
        }
        return this.createComplexCondition({
          operator: json.operator,
          conditions: conditions,
          attributeLabel: json.attributeLabel,
          valueLabel: json.valueLabel,
          userDefined: userDefined
        });
      }
    }, {
      key: "parseConditionFromJson",
      value: function parseConditionFromJson(json) {
        switch (json.type) {
          case ConditionType.Simple:
            return this.parseSimpleConditionFromJson(json);
          case ConditionType.Complex:
            return this.parseComplexConditionFromJson(json);
          default:
            throw new errors.UnknownConditionTypeError('unknown condition type "' + json.type + '"');
        }
      }
    }, {
      key: "parseFilterFromJson",
      value: function parseFilterFromJson(json) {
        var rootCondition = this.parseConditionFromJson(json.rootCondition);
        if (rootCondition instanceof ComplexCondition) {
          return this.createFilter({
            searchTerm: json === null || json === void 0 ? void 0 : json.searchTerm,
            rootCondition: rootCondition,
            dataSource: this.parseDataSourceFromJson(json.dataSource)
          });
        } else {
          throw new errors.UnknownConditionTypeError("Only complex condition is allowed in Filter JSON");
        }
      }
    }]);
    return Sina;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.Sina = Sina;
  return __exports;
});
})();