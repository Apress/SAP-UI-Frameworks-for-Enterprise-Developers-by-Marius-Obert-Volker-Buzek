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
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
sap.ui.define(["../../core/core", "../../core/ajax", "./MetadataParserXML", "./MetadataParserJson", "./ItemParser", "./FacetParser", "./suggestionParser", "./eshObjects/src/index", "./conditionSerializerEshObj", "../../core/Log", "../../sina/SearchQuery", "../../sina/SortOrder", "../AbstractProvider", "../../sina/SuggestionType", "../../sina/ComplexCondition", "../../core/errors", "./HierarchyParser", "./HierarchyNodePathParser", "../../sina/SuggestionCalculationMode", "../../sina/DataSource"], function (core, ____core_ajax, ___MetadataParserXML, ___MetadataParserJson, ___ItemParser, ___FacetParser, ___suggestionParser, ___eshObjects_src_index, conditionSerializer, ____core_Log, ____sina_SearchQuery, ____sina_SortOrder, ___AbstractProvider, ____sina_SuggestionType, ____sina_ComplexCondition, ____core_errors, ___HierarchyParser, ___HierarchyNodePathParser, ____sina_SuggestionCalculationMode, ____sina_DataSource) {
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
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
  var Client = ____core_ajax["Client"];
  var MetadataParserXML = ___MetadataParserXML["MetadataParserXML"];
  var MetadataParserJson = ___MetadataParserJson["MetadataParserJson"];
  var ItemParser = ___ItemParser["ItemParser"];
  var FacetParser = ___FacetParser["FacetParser"];
  var SuggestionParser = ___suggestionParser["SuggestionParser"];
  var getEshSearchQuery = ___eshObjects_src_index["getEshSearchQuery"];
  var Comparison = ___eshObjects_src_index["Comparison"];
  var Phrase = ___eshObjects_src_index["Phrase"];
  var Term = ___eshObjects_src_index["Term"];
  var EshObjComparisonOperator = ___eshObjects_src_index["SearchQueryComparisonOperator"];
  var ESOrderType = ___eshObjects_src_index["ESOrderType"];
  var HierarchyFacet = ___eshObjects_src_index["HierarchyFacet"];
  var Log = ____core_Log["Log"];
  var SearchQuery = ____sina_SearchQuery["SearchQuery"];
  var SortOrder = ____sina_SortOrder["SortOrder"];
  var AbstractProvider = ___AbstractProvider["AbstractProvider"];
  var SuggestionType = ____sina_SuggestionType["SuggestionType"];
  var ComplexCondition = ____sina_ComplexCondition["ComplexCondition"];
  var ESHNotActiveError = ____core_errors["ESHNotActiveError"];
  var HierarchyParser = ___HierarchyParser["HierarchyParser"];
  var HierarchyNodePathParser = ___HierarchyNodePathParser["HierarchyNodePathParser"];
  var SuggestionCalculationMode = ____sina_SuggestionCalculationMode["SuggestionCalculationMode"];
  var DataSource = ____sina_DataSource["DataSource"];
  var Provider = /*#__PURE__*/function (_AbstractProvider) {
    _inherits(Provider, _AbstractProvider);
    var _super = _createSuper(Provider);
    function Provider() {
      var _this;
      _classCallCheck(this, Provider);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "id", "hana_odata");
      return _this;
    }
    _createClass(Provider, [{
      key: "initAsync",
      value: function initAsync(configuration) {
        try {
          const _this2 = this;
          var _configuration$metaDa, _configuration$ajaxCl;
          _this2.requestPrefix = configuration.url;
          _this2.odataVersion = configuration.odataVersion;
          _this2.responseAttributes = configuration === null || configuration === void 0 ? void 0 : configuration.responseAttributes;
          _this2.facetAttributes = configuration === null || configuration === void 0 ? void 0 : configuration.facetAttributes;
          _this2.sina = configuration.sina;
          _this2.querySuffix = _this2.convertQuerySuffixToExpression(configuration.querySuffix);
          _this2.metaDataSuffix = (_configuration$metaDa = configuration.metaDataSuffix) !== null && _configuration$metaDa !== void 0 ? _configuration$metaDa : "";
          var clientProperties;
          if (typeof configuration.getLanguage === "function") {
            clientProperties = {
              csrf: false,
              getLanguage: configuration.getLanguage
            };
          } else {
            clientProperties = {
              csrf: false
            };
          }
          _this2.ajaxClient = (_configuration$ajaxCl = configuration.ajaxClient) !== null && _configuration$ajaxCl !== void 0 ? _configuration$ajaxCl : new Client(clientProperties);
          var metaDataJsonType = configuration.metaDataJsonType;
          if (metaDataJsonType) {
            _this2.metadataParser = new MetadataParserJson(_this2);
          } else {
            _this2.metadataParser = new MetadataParserXML(_this2);
          }
          _this2.itemParser = new ItemParser(_this2);
          _this2.facetParser = new FacetParser(_this2);
          _this2.suggestionParser = new SuggestionParser(_this2);
          _this2.hierarchyNodePathParser = new HierarchyNodePathParser(_this2.sina);
          return _await(_this2.loadServerInfo(), function (_this2$loadServerInfo) {
            _this2.serverInfo = _this2$loadServerInfo;
            if (!_this2.supports("Search")) {
              throw new ESHNotActiveError();
            }
            return _await(_this2.loadBusinessObjectDataSources(), function () {
              return _this2.sina.dataSources.length === 0 ? Promise.reject(new ESHNotActiveError("Enterprise Search is not active - no datasources")) : {
                capabilities: _this2.sina._createCapabilities({
                  fuzzy: false
                })
              };
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "supports",
      value: function supports(service, capability) {
        var supportedServices = this.serverInfo.services;
        for (var supportedService in supportedServices) {
          if (supportedService === service) {
            if (!capability) {
              return true;
            }
            var supportedCapabilities = supportedServices[supportedService].Capabilities;
            for (var j = 0; j < supportedCapabilities.length; ++j) {
              var checkCapability = supportedCapabilities[j];
              if (checkCapability === capability) {
                return true;
              }
            }
          }
        }
        return false;
      }
    }, {
      key: "loadServerInfo",
      value: function loadServerInfo() {
        try {
          var simulatedHanaServerinfo = {
            rawServerInfo: {
              Services: [{
                Service: "Search",
                Capabilities: [{
                  Capability: "SemanticObjectType"
                }]
              }, {
                Service: "Suggestions2",
                Capabilities: [{
                  Capability: "ScopeTypes"
                }]
              }]
            },
            services: {
              Suggestions: {
                suggestionTypes: ["objectdata"]
              },
              Search: {
                capabilities: ["SemanticObjectType"]
              }
            }
          };
          return _await(simulatedHanaServerinfo);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_prepareMetadataRequest",
      value: function _prepareMetadataRequest() {
        var requestObj = {
          metadataCall: true,
          resourcePath: this.getPrefix() + "/$metadata"
        };
        if (typeof this.metaDataSuffix === "string" && this.metaDataSuffix.length > 0) {
          // TODO: for the temp compatibility of import wizard call, metaDataSuffix shall only contains entityset
          /* if (this.metaDataSuffix.startsWith("/EntitySets")) {
              this.metaDataSuffix = this.metaDataSuffix.replace(/\/EntitySets\(/, "");
              this.metaDataSuffix = this.metaDataSuffix.substring(0, this.metaDataSuffix.length - 1);
          } */
          requestObj.metadataObjects = {
            entitySets: this.metaDataSuffix
          };
        }
        return getEshSearchQuery(requestObj);
      }
    }, {
      key: "loadBusinessObjectDataSources",
      value: function loadBusinessObjectDataSources() {
        try {
          const _this3 = this;
          var requestUrl = _this3._prepareMetadataRequest();
          return _await(_this3.metadataParser.fireRequest(_this3.ajaxClient, requestUrl), function (response) {
            return _await(_this3.metadataParser.parseResponse(response), function (allMetaDataMap) {
              for (var i = 0; i < allMetaDataMap.dataSourcesList.length; ++i) {
                var dataSource = allMetaDataMap.dataSourcesList[i];
                _this3.metadataParser.fillMetadataBuffer(dataSource, allMetaDataMap.businessObjectMap[dataSource.id]);
              }
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "assembleOrderBy",
      value: function assembleOrderBy(query) {
        var result = [];
        if (Array.isArray(query.sortOrder)) {
          for (var i = 0; i < query.sortOrder.length; ++i) {
            var sortKey = query.sortOrder[i];
            var sortOrder = sortKey.order === SortOrder.Descending ? ESOrderType.Descending : ESOrderType.Ascending;
            result.push({
              key: sortKey.id,
              order: sortOrder
            });
          }
        }
        return result;
      }
    }, {
      key: "assembleGroupBy",
      value: function assembleGroupBy(query) {
        var result = null;
        if (query.groupBy && query.groupBy.attributeName && query.groupBy.attributeName.length > 0) {
          result.properties = query.groupBy.attributeName;
          if (query.groupBy.aggregateCountAlias && query.groupBy.aggregateCountAlias !== "") {
            result.aggregateCountAlias = query.groupBy.aggregateCountAlias;
          }
        }
        return result;
      }
    }, {
      key: "executeSearchQuery",
      value: function executeSearchQuery(query) {
        var oUrlData = this._prepareSearchObjectSuggestionRequest(query);
        return this._fireSearchQuery(oUrlData);
      }
    }, {
      key: "_prepareSearchObjectSuggestionRequest",
      value: function _prepareSearchObjectSuggestionRequest(query) {
        var _this$sina, _this$sina$configurat;
        // assemble request object
        var rootCondition = query.filter.rootCondition.clone();
        var filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (!Array.isArray(filter.items)) {
          filter.items = [];
        }
        var searchTerms = query.filter.searchTerm || "*";

        // DWC Specific logic - query suffix should not be added to helper hierarchy datasource.
        if (this.querySuffix && query.filter.dataSource.id === "SEARCH_DESIGN") {
          filter.items.push(this.querySuffix);
        }
        var dataSource = query.filter.dataSource;
        var top = query.top || 10;
        var skip = query.skip || 0;
        var sortOrder = this.assembleOrderBy(query);
        var searchOptions = {
          // query: searchTerms,
          resourcePath: this.getPrefix() + "/$all",
          $top: top,
          $skip: skip,
          whyfound: true,
          $count: true,
          $orderby: sortOrder,
          freeStyleText: searchTerms,
          searchQueryFilter: filter
        };
        if (dataSource !== this.sina.getAllDataSource()) {
          searchOptions.scope = dataSource.id;
        }
        // The second condition is to exclude hierarchy facets and object suggestions which are also SearchQuery
        if (((_this$sina = this.sina) === null || _this$sina === void 0 ? void 0 : (_this$sina$configurat = _this$sina.configuration) === null || _this$sina$configurat === void 0 ? void 0 : _this$sina$configurat.useValueHierarchy) === true && top < 100) {
          var hierarchyAttribute = dataSource.hierarchyAttribute;
          if (dataSource.hierarchyHelperDatasource instanceof DataSource) {
            hierarchyAttribute = dataSource.hierarchyHelperDatasource.hierarchyAttribute;
          }
          if (hierarchyAttribute) {
            searchOptions.valuehierarchy = hierarchyAttribute;
          }
        }
        if (query instanceof SearchQuery) {
          if (typeof this.responseAttributes !== "undefined") {
            // an empty array is also supported. Even if there seems to be no enduser value, tests might want to check performance of a such request
            searchOptions.$select = this.responseAttributes; // rendering currently failing, if not all properties of metadata are requested
          }

          if (query.calculateFacets) {
            if (typeof this.facetAttributes !== "undefined") {
              // an empty array is also supported. Even if there seems to be no enduser value, tests might want to check performance of a such request
              searchOptions.facets = this.facetAttributes;
            } else {
              searchOptions.facets = ["all"];
            }
            searchOptions.facetlimit = query.facetTop || 5;
          }
          var groupBy = this.assembleGroupBy(query);
          if (groupBy) {
            searchOptions.groupby = groupBy;
            searchOptions.whyfound = false;
          }
        }
        var queryData = {
          url: this.assembleEshSearchQuery(searchOptions),
          query: query
        };
        return queryData;
      }
    }, {
      key: "assembleEshSearchQuery",
      value: function assembleEshSearchQuery(searchOptions) {
        var _this$sina2, _this$sina2$configura;
        if (!((_this$sina2 = this.sina) !== null && _this$sina2 !== void 0 && (_this$sina2$configura = _this$sina2.configuration) !== null && _this$sina2$configura !== void 0 && _this$sina2$configura.enableQueryLanguage) || !searchOptions.freeStyleText) {
          return getEshSearchQuery(searchOptions);
        }
        var dummyFreeStyleText = "FDGhfdhgfHFGHrdthfgcvgzjmbvndf";
        var freeStyleText = searchOptions.freeStyleText;
        searchOptions.freeStyleText = dummyFreeStyleText;
        var searchQuery = getEshSearchQuery(searchOptions);
        var resultSearchQuery = searchQuery.replace(dummyFreeStyleText, encodeURIComponent("(" + freeStyleText + ")"));
        return resultSearchQuery;
      }
    }, {
      key: "_fireSearchQuery",
      value: function _fireSearchQuery(oInputData) {
        try {
          const _this4 = this;
          var _response$data$ComS;
          // fire request
          return _await(_this4.ajaxClient.getJson(oInputData.url), function (response) {
            _this4.metadataParser.parseDynamicMetadata(response);
            var hierarchyNodePaths = _this4.hierarchyNodePathParser.parse(response, oInputData.query);
            return _await(_this4.itemParser.parse(oInputData.query, response.data), function (items) {
              var facets;
              var statistics = (_response$data$ComS = response.data["@com.sap.vocabularies.Search.v1.SearchStatistics"]) === null || _response$data$ComS === void 0 ? void 0 : _response$data$ComS.ConnectorStatistics;
              return _invoke(function () {
                if (oInputData.query.getDataSource() === _this4.sina.getAllDataSource() && statistics && Array.isArray(statistics) && statistics.length === 1) {
                  var constructedDataSourceFacets = {
                    "@com.sap.vocabularies.Search.v1.Facets": [{
                      "@com.sap.vocabularies.Search.v1.Facet": {
                        PropertyName: "scope",
                        isConnectorFacet: true
                      },
                      Items: [{
                        scope: statistics[0].OdataID,
                        _Count: response.data["@odata.count"]
                      }]
                    }]
                  };
                  return _await(_this4.facetParser.parse(oInputData.query, constructedDataSourceFacets), function (_this4$facetParser$pa) {
                    facets = _this4$facetParser$pa;
                  });
                } else {
                  return _await(_this4.facetParser.parse(oInputData.query, response.data), function (_this4$facetParser$pa2) {
                    facets = _this4$facetParser$pa2;
                  });
                }
              }, function () {
                return _this4.sina._createSearchResultSet({
                  title: "Search Result List",
                  query: oInputData.query,
                  items: items,
                  totalCount: response.data["@odata.count"] || 0,
                  facets: facets,
                  hierarchyNodePaths: hierarchyNodePaths
                });
              });
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_fireObjectSuggestionsQuery",
      value: function _fireObjectSuggestionsQuery(oInputData) {
        try {
          const _this5 = this;
          // fire request
          return _await(_this5.ajaxClient.getJson(oInputData.url), function (response) {
            _this5.metadataParser.parseDynamicMetadata(response);
            return _await(_this5.itemParser.parse(oInputData.query, response.data), function (searchItems) {
              return _this5.suggestionParser.parseObjectSuggestions(oInputData.query, searchItems);
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_prepareChartQueryRequest",
      value: function _prepareChartQueryRequest(query, rootCondition, resultDeletion) {
        var searchTerms = query.filter.searchTerm;
        var dataSource = query.filter.dataSource;
        var facetTop = 15; // default value for numeric range/interval facets

        // in value help mode delete current condition from root and prepare to construct the value help part of query
        var isValueHelpMode = resultDeletion.deleted || false;
        var filter = conditionSerializer.serialize(dataSource, rootCondition);
        if (!Array.isArray(filter.items)) {
          filter.items = [];
        }
        var top = query.top || 5;

        // construct search part of $apply
        if (isValueHelpMode === true) {
          // value help mode
          // attribute value "*" can only be used without EQ part
          // this will be changed on serverside later
          var valueString = resultDeletion.value;
          if (!resultDeletion.value || resultDeletion.value === "" || valueString.match(/^[*\s]+$/g) !== null) {
            resultDeletion.value = "*";
            filter.items.push(new Comparison({
              property: resultDeletion.attribute,
              operator: EshObjComparisonOperator.Search,
              value: new Term({
                term: "*"
              })
            }));
          } else {
            filter.items.push(new Comparison({
              property: resultDeletion.attribute,
              operator: EshObjComparisonOperator.EqualCaseInsensitive,
              value: new Phrase({
                phrase: resultDeletion.value + "*"
              })
            }));
          }
        }
        if (this.querySuffix) {
          filter.items.push(this.querySuffix);
        }
        var chartOptions = {
          resourcePath: this.getPrefix() + "/$all",
          $top: 0,
          $count: true,
          searchQueryFilter: filter,
          freeStyleText: searchTerms
        };
        if (dataSource !== this.sina.getAllDataSource()) {
          chartOptions.scope = dataSource.id;
        }
        var facetScope = [];
        chartOptions.facetlimit = top;
        if (query.dimension) {
          facetScope.push(query.dimension);
          var metadata = query.filter.dataSource.getAttributeMetadata(query.dimension);
          if (metadata && (metadata.type === "Double" || metadata.type === "Integer") && top >= 20) {
            // facet limit decides number of intervals/ranges of numeric data types, but has no effect on date/time ranges
            chartOptions.facetlimit = facetTop;
          }
        }

        // no need to use this.responseAttributes/this.facetAttributes here ($select/facets)

        // just require own chart facet in case that
        chartOptions.facets = facetScope;

        // get Query Url
        return getEshSearchQuery(chartOptions);
      }
    }, {
      key: "executeChartQuery",
      value: function executeChartQuery(query) {
        var log = new Log();
        // in value help mode delete current condition from root and prepare to construct the value help part of query
        var rootCondition = query.filter.rootCondition.clone();
        var resultDeletion = rootCondition.removeAttributeConditions(query.dimension);
        var url = this._prepareChartQueryRequest(query, rootCondition, resultDeletion);

        // fire request
        return this.ajaxClient.getJson(url).then(function (response) {
          var facets = this.facetParser.parse(query, response.data, log);
          return facets;
        }.bind(this)).then(function (facets) {
          if (facets.length > 0) {
            return facets[0];
          }
          var metadataLabel = "";
          var metadata = query.filter.dataSource.getAttributeMetadata(query.dimension);
          if (metadata && metadata.label) {
            metadataLabel = metadata.label;
          }
          return this.sina._createChartResultSet({
            title: metadataLabel,
            items: [],
            query: query,
            log: log
          });
        }.bind(this));
      }
    }, {
      key: "executeHierarchyQuery",
      value: function executeHierarchyQuery(query) {
        try {
          const _this6 = this;
          var hierarchyParser = new HierarchyParser();
          var filter = conditionSerializer.serialize(query.filter.dataSource, query.filter.rootCondition);
          if (!Array.isArray(filter.items)) {
            filter.items = [];
          }
          if (_this6.querySuffix) {
            filter.items.push(_this6.querySuffix);
          }

          // get Query Url
          var requestUrl = getEshSearchQuery({
            resourcePath: _this6.getPrefix() + "/$all",
            $top: 0,
            searchQueryFilter: filter,
            freeStyleText: query.filter.searchTerm,
            scope: query.filter.dataSource.id,
            facets: [query.attributeId],
            facetroot: [new HierarchyFacet({
              facetColumn: query.attributeId,
              rootIds: [query.nodeId],
              levels: 1
            })]
            // no need to use this.responseAttributes/this.facetAttributes here ($select/facets)
          });
          return _await(_this6.ajaxClient.getJson(requestUrl), function (response) {
            var attributeMetadata = query.filter.dataSource.getAttributeMetadata(query.attributeId);
            var facets = response.data["@com.sap.vocabularies.Search.v1.Facets"] || [];
            var facet = facets.find(function (facet) {
              var attributeId = core.getProperty(facet, ["@com.sap.vocabularies.Search.v1.Facet", "Dimensions", 0, "PropertyName"]);
              return attributeId === query.attributeId;
            });
            return hierarchyParser.parseHierarchyFacet(query, attributeMetadata, facet || {});

            /*   const hierarchyParser = new HierarchyParser();
            let queryExpression = `SCOPE:${query.filter.dataSource.id}`;
            if (query.filter.searchTerm) {
                //  queryExpression += ` (${util.escapeQuery(query.filter.searchTerm)})`;
            }
            queryExpression +=
                " " + conditionSerializer.serialize(query.filter.dataSource, query.filter.rootCondition);
            const parameters = {
                top: query.top,
                $apply: `filter(Search.search(query='${queryExpression}'))`,
                facets: query.attributeId,
                facetroot: `(${query.attributeId},('${query.nodeId}'),1)`,
            };
            const url = ""; // this.buildQueryUrl("/$all");
            const response = await this.ajaxClient.getJson(url, parameters);
            const attributeMetadata = query.filter.dataSource.getAttributeMetadata(query.attributeId);
            const facets = response.data["@com.sap.vocabularies.Search.v1.Facets"];
            const facet = facets.find((facet) => {
                const attributeId = core.getProperty(facet, [
                    "@com.sap.vocabularies.Search.v1.Facet",
                    "Dimensions",
                    0,
                    "PropertyName",
                ]);
                return attributeId === query.attributeId;
            });
            return hierarchyParser.parseHierarchyFacet(query, attributeMetadata, facet);*/
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "executeSuggestionQuery",
      value: function executeSuggestionQuery(query) {
        try {
          const _this7 = this;
          // handle regular suggestions and object suggestion separately because
          // object suggestions have only searchterms and no suggestionInput
          return Promise.all([_this7.executeRegularSuggestionQuery(query), _this7.executeObjectSuggestionQuery(query)]).then(function (results) {
            var suggestions = [];
            suggestions.push.apply(suggestions, _toConsumableArray(results[1]));
            suggestions.push.apply(suggestions, _toConsumableArray(results[0]));
            return this.sina._createSuggestionResultSet({
              title: "Suggestions",
              query: query,
              items: suggestions
            });
          }.bind(_this7));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "isObjectSuggestionQuery",
      value: function isObjectSuggestionQuery(query) {
        return query.types.indexOf(SuggestionType.Object) >= 0 && query.filter.dataSource.type === query.sina.DataSourceType.BusinessObject;
      }
    }, {
      key: "executeObjectSuggestionQuery",
      value: function executeObjectSuggestionQuery(query) {
        try {
          const _this8 = this;
          // check query type
          if (!_this8.isObjectSuggestionQuery(query)) {
            return Promise.resolve([]);
          }
          return _await(_this8._prepareSearchObjectSuggestionRequest(query), function (oUrlData) {
            return _this8._fireObjectSuggestionsQuery(oUrlData);
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "executeRegularSuggestionQuery",
      value: function executeRegularSuggestionQuery(query) {
        // HANA only supports searchterm suggestions without history
        if (query.calculationModes.includes(SuggestionCalculationMode.Data) && query.types.includes(SuggestionType.SearchTerm)) {
          return this._fireSuggestionQuery(query);
        }
        return Promise.resolve([]);
      }
    }, {
      key: "_prepareSuggestionQueryRequest",
      value: function _prepareSuggestionQueryRequest(query) {
        /*
            type=scope for search connector names 
            currently only for technical names, shall be discussed
            Do we need count?
            $apply=filter part exactly as search query but move search terms to term parameter in getSuggestion
        */

        // split search term in query into (1) searchTerm (2) suggestionTerm
        // const searchTerm = this._escapeSearchTerm(query.filter.searchTerm);
        // const searchTerm = encodeURIComponent(
        //     query.filter.searchTerm
        // );
        var searchTerms = query.filter.searchTerm;
        var dataSource = query.filter.dataSource;
        var rootCondition = query.filter.rootCondition.clone();
        var filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (!Array.isArray(filter.items)) {
          filter.items = [];
        }
        var top = query.top || 10;
        var skip = query.skip || 0;
        if (this.querySuffix) {
          filter.items.push(this.querySuffix);
        }
        var suggestionOptions = {
          suggestTerm: searchTerms,
          resourcePath: this.getPrefix() + "/$all",
          $top: top,
          $skip: skip,
          searchQueryFilter: filter
          // no need to use this.responseAttributes/this.facetAttributes here ($select/facets)
        };

        if (dataSource !== this.sina.getAllDataSource()) {
          suggestionOptions.scope = dataSource.id;
        }
        return getEshSearchQuery(suggestionOptions);
      }
    }, {
      key: "_fireSuggestionQuery",
      value: function _fireSuggestionQuery(query) {
        var url = this._prepareSuggestionQueryRequest(query);
        // fire request
        return this.ajaxClient.getJson(url).then(function (response) {
          var suggestions = [];
          if (response.data.value) {
            suggestions = this.suggestionParser.parse(query, response.data.value);
          }
          return suggestions;
        }.bind(this));
      }

      // getFilterValueFromConditionTree(
      //     dimension: any,
      //     conditionTree: {
      //         ConditionAttribute: any;
      //         ConditionValue: any;
      //         SubFilters: string | any[];
      //     }
      // ) {
      //     if (
      //         conditionTree.ConditionAttribute &&
      //         conditionTree.ConditionAttribute === dimension
      //     ) {
      //         return conditionTree.ConditionValue;
      //     } else if (conditionTree.SubFilters) {
      //         let i: number;
      //         let result = null;
      //         for (
      //             i = 0;
      //             result === null && i < conditionTree.SubFilters.length;
      //             i++
      //         ) {
      //             result = this.getFilterValueFromConditionTree(
      //                 dimension,
      //                 conditionTree.SubFilters[i]
      //             );
      //         }
      //         return result;
      //     }
      //     return null;
      // }
    }, {
      key: "getPrefix",
      value: function getPrefix() {
        var _this$odataVersion, _this$requestPrefix;
        var odataVersion = (_this$odataVersion = this.odataVersion) !== null && _this$odataVersion !== void 0 ? _this$odataVersion : "/v20411";
        var requestPrefix = (_this$requestPrefix = this.requestPrefix) !== null && _this$requestPrefix !== void 0 ? _this$requestPrefix : "/sap/es/odata";
        var prefix = requestPrefix + odataVersion;
        return prefix;
      }
    }, {
      key: "convertQuerySuffixToExpression",
      value: function convertQuerySuffixToExpression(suffix) {
        var suffixExpression = null;
        if (suffix && suffix instanceof ComplexCondition) {
          suffixExpression = conditionSerializer.serialize(null, suffix);
        }
        return suffixExpression;
      }
    }, {
      key: "getDebugInfo",
      value: function getDebugInfo() {
        return "ESH API Provider: " + this.id;
      }
    }]);
    return Provider;
  }(AbstractProvider);
  var __exports = {
    __esModule: true
  };
  __exports.Provider = Provider;
  return __exports;
});
})();