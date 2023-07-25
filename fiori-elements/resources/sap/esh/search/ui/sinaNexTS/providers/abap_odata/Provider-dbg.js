/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./ajax", "./ajaxTemplates", "./conditionSerializer", "../../core/core", "./dataSourceSerializer", "./labelCalculation", "./suggestionTermSplitter", "../AbstractProvider", "./FacetParser", "./ItemParser", "./NlqParser", "./suggestionParser", "./UserEventLogger", "./MetadataParser", "../../core/errors"], function (___ajax, ajaxTemplates, conditionSerializer, core, dataSourceSerializer, labelCalculation, suggestionTermSplitter, ___AbstractProvider, ___FacetParser, ___ItemParser, ___NlqParser, ___suggestionParser, ___UserEventLogger, ___MetadataParser, ____core_errors) {
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var createAjaxClient = ___ajax["createAjaxClient"];
  var AbstractProvider = ___AbstractProvider["AbstractProvider"];
  var FacetParser = ___FacetParser["FacetParser"];
  var ItemParser = ___ItemParser["ItemParser"];
  var NlqParser = ___NlqParser["NlqParser"];
  var SuggestionParser = ___suggestionParser["SuggestionParser"];
  var UserEventLogger = ___UserEventLogger["UserEventLogger"];
  var MetadataParser = ___MetadataParser["MetadataParser"];
  var ESHNotActiveError = ____core_errors["ESHNotActiveError"];
  var NotImplementedError = ____core_errors["NotImplementedError"];
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
      _defineProperty(_assertThisInitialized(_this), "id", "abap_odata");
      return _this;
    }
    _createClass(Provider, [{
      key: "initAsync",
      value: function initAsync(configuration) {
        var _configuration$ajaxCl,
          _this2 = this;
        this.contentProviderId = configuration.contentProviderId;
        this.requestPrefix = configuration.url || "/sap/opu/odata/sap/ESH_SEARCH_SRV";
        this.sina = configuration.sina;
        this.ajaxClient = (_configuration$ajaxCl = configuration.ajaxClient) !== null && _configuration$ajaxCl !== void 0 ? _configuration$ajaxCl : createAjaxClient();
        this.metadataLoadPromises = {};
        this.internalMetadata = {};
        this.labelCalculator = labelCalculation.createLabelCalculator();
        this.userEventLogger = new UserEventLogger(this);
        this.metadataParser = new MetadataParser(this);
        this.itemParser = new ItemParser(this);
        this.nlqParser = new NlqParser(this);
        this.facetParser = new FacetParser(this);
        this.suggestionParser = new SuggestionParser(this, this.itemParser);
        this.sessionId = core.generateGuid();
        this.sorsNavigationTargetGenerator = this.sina._createSorsNavigationTargetGenerator({
          urlPrefix: "#Action-search&/top=10&filter=",
          getPropertyMetadata: function getPropertyMetadata(metadata) {
            return {
              name: metadata.id,
              label: metadata.label,
              semanticObjectType: metadata._private.semanticObjectType,
              response: !!(metadata.usage && (metadata.usage.Detail || metadata.usage.Title)),
              request: true
            };
          }
        });
        return this.loadServerInfo().then(function (serverInfo) {
          _this2.serverInfo = serverInfo.d.results[0];
          if (!_this2.supports("Search")) {
            return Promise.reject(new ESHNotActiveError("Enterprise Search is not active"));
          }
          return _this2.loadBusinessObjectDataSources();
        }).then(function () {
          return {
            capabilities: _this2.sina._createCapabilities({
              fuzzy: false
            })
          };
        });
      }
    }, {
      key: "supports",
      value: function supports(service, capability) {
        // pseudo miscellaneous service
        // having InteractionEventLists and NavigationEvents capability
        if (service === "misc") {
          var annotationsQueryString = "";
          if (capability === "InteractionEventLists") {
            annotationsQueryString = "Schema[Namespace=ESH_SEARCH_SRV]>EntityContainer[Name=ESH_SEARCH_SRV_Entities]>EntitySet[Name=InteractionEventLists]";
          }
          if (capability === "NavigationEvents") {
            annotationsQueryString = "Schema[Namespace=ESH_SEARCH_SRV]>EntityContainer[Name=ESH_SEARCH_SRV_Entities]>EntitySet[Name=NavigationEvents]";
          }
          if (annotationsQueryString.length !== 0) {
            var nodes = this.serviceXML.querySelectorAll(annotationsQueryString);
            return nodes.length > 0;
          }
        }

        // server defined services
        for (var i = 0; i < this.serverInfo.Services.results.length; ++i) {
          var checkService = this.serverInfo.Services.results[i];
          if (checkService.Id == service) {
            if (!capability) {
              return true;
            }
            for (var j = 0; j < checkService.Capabilities.results.length; ++j) {
              var checkCapability = checkService.Capabilities[j];
              if (checkCapability.Capability === capability) {
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
        var _this3 = this;
        var requestUrlServerInfos = this.buildQueryUrl(this.requestPrefix, "/ServerInfos?$expand=Services/Capabilities");
        var requestUrlMetadata = this.buildQueryUrl(this.requestPrefix, "/$metadata");
        var serverInfosProm = this.ajaxClient.getJson(requestUrlServerInfos);
        var metadataProm = this.ajaxClient.getXML(requestUrlMetadata);
        return Promise.all([serverInfosProm, metadataProm]).then(function (values) {
          var response = values[0];
          var serviceXML = values[1];
          if (typeof window !== "undefined") {
            var oParser = new DOMParser();
            var oDOM = oParser.parseFromString(serviceXML, "text/xml");
            if (oDOM.documentElement.nodeName != "parsererror") {
              _this3.serviceXML = oDOM;
            }
          } else {
            // Node.js sina tests
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            var jsdom = require("jsdom");
            var dom = new jsdom.JSDOM(serviceXML);
            _this3.serviceXML = dom.window.document;
          }
          return response.data;
        });
      }
    }, {
      key: "loadBusinessObjectDataSources",
      value: function loadBusinessObjectDataSources() {
        // complete requestUrlTemplate is "/DataSources?$expand=Annotations,Attributes/UIAreas,Attributes/Annotations&$filter=Type eq 'View' and IsInternal eq false";
        var requestUrlTemplate = "/DataSources?$expand=Annotations,Attributes/UIAreas,Attributes/Annotations&$filter=Type eq 'View'";
        if (this.serviceXML) {
          var annotationsQueryString = "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=DataSource]>NavigationProperty[Name=Annotations]," + "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=DataSourceAttribute]>NavigationProperty[Name=Annotations]";
          var elements = this.serviceXML.querySelectorAll(annotationsQueryString);
          if (elements.length != 2) {
            // Do not query for annotations in data sources request
            requestUrlTemplate = "/DataSources?$expand=Attributes/UIAreas&$filter=Type eq 'View'";
          }
          var isInternalPath = "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=DataSource]>Property[Name=IsInternal]";
          if (this.isQueryPropertySupported(isInternalPath)) {
            // add isInternal filter in data sources request
            requestUrlTemplate = requestUrlTemplate + " and IsInternal eq false";
          }
        }
        var requestUrl = this.buildQueryUrl(this.requestPrefix, requestUrlTemplate);
        return this.ajaxClient.getJson(requestUrl).then(function (response) {
          var dataSourcesData = response.data.d.results;
          this.metadataParser.parseDataSourceData(dataSourcesData, this.sorsNavigationTargetGenerator);
          this.sorsNavigationTargetGenerator.finishRegistration();
        }.bind(this));
      }
    }, {
      key: "assembleOrderBy",
      value: function assembleOrderBy(query) {
        var result = [];
        for (var i = 0; i < query.sortOrder.length; ++i) {
          var sortKey = query.sortOrder[i];
          var sortOrder = sortKey.order === this.sina.SortOrder.Descending ? "desc" : "asc";
          result.push({
            AttributeId: sortKey.id,
            SortOrder: sortOrder
          });
        }
        return result;
      }
    }, {
      key: "executeSearchQuery",
      value: function executeSearchQuery(query) {
        var items, response;
        var requestTemplate = ajaxTemplates.searchRequest;
        if (query.nlq) {
          requestTemplate = ajaxTemplates.nlqSearchRequest;
        }
        var clientServiceNamePath = "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=SearchOptions]>Property[Name=ClientServiceName]";
        if (!this.isQueryPropertySupported(clientServiceNamePath)) {
          // remove ClientServiceName from data sources request
          delete requestTemplate.d.QueryOptions.ClientServiceName;
        }
        requestTemplate = JSON.parse(JSON.stringify(requestTemplate));
        var rootCondition = query.filter.rootCondition.clone();
        var filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (filter.SubFilters.length !== 0) {
          requestTemplate.d.Filter = filter;
        } else {
          delete requestTemplate.d.Filter;
        }
        requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
        requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
        requestTemplate.d.QueryOptions.Top = query.top;
        requestTemplate.d.QueryOptions.Skip = query.skip;
        requestTemplate.d.OrderBy = this.assembleOrderBy(query);
        this.addSessionId(requestTemplate);
        if (!query.calculateFacets) {
          delete requestTemplate.d.MaxFacetValues;
          delete requestTemplate.d.Facets;
        } else {
          requestTemplate.d.MaxFacetValues = 5;
          requestTemplate.d.Facets = [{
            Values: []
          }];
        }

        // build url
        var requestUrl = this.buildQueryUrl(this.requestPrefix, "/SearchQueries");
        // fire request
        return this.ajaxClient.postJson(requestUrl, requestTemplate).then(function (inputResponse) {
          response = inputResponse;
          return this.metadataParser.parseDynamicMetadata(response.data.d);
        }.bind(this)).then(function () {
          return this.itemParser.parse(query, response.data.d);
        }.bind(this)).then(function (inputItems) {
          items = inputItems;
          return this.facetParser.parse(query, response.data.d);
        }.bind(this)).then(function (facets) {
          var nlqResult = this.nlqParser.parse(response.data.d);
          var title = nlqResult.success ? nlqResult.description : "Search Result List";
          return this.sina._createSearchResultSet({
            id: response.data.d.ResultList.ExecutionID,
            title: title,
            query: query,
            items: items,
            nlqSuccess: nlqResult.success,
            totalCount: response.data.d.ResultList.TotalHits,
            facets: facets
          });
        }.bind(this)).then(function (searchResultSet) {
          this.sorsNavigationTargetGenerator.generateNavigationTargets(searchResultSet);
          return searchResultSet;
        }.bind(this));
      }
    }, {
      key: "executeChartQuery",
      value: function executeChartQuery(query) {
        var requestUrl = "";
        var requestTemplate;
        var rootCondition = query.filter.rootCondition.clone();
        var filter;
        if (this.decideValueHelp(query)) {
          // value help chart query
          requestTemplate = JSON.parse(JSON.stringify(ajaxTemplates.valueHelperRequest));
          this.removeClientOptions(requestTemplate);
          requestTemplate.d.ValueHelpAttribute = query.dimension;
          filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
          if (filter.SubFilters.length !== 0) {
            requestTemplate.d.Filter = filter;
          } else {
            delete requestTemplate.d.Filter;
          }
          requestTemplate.d.ValueFilter = this.getFilterValueFromConditionTree(query.dimension, filter);
          requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
          requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
          requestUrl = this.buildQueryUrl(this.requestPrefix, "/ValueHelpQueries");
        } else {
          // normal chart query
          requestTemplate = JSON.parse(JSON.stringify(ajaxTemplates.chartRequest));
          filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
          if (filter.SubFilters.length !== 0) {
            requestTemplate.d.Filter = filter;
          } else {
            delete requestTemplate.d.Filter;
          }
          requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
          requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
          requestTemplate.d.QueryOptions.Skip = 0;
          this.addSessionId(requestTemplate);
          requestTemplate.d.FacetRequests = [{
            DataSourceAttribute: query.dimension
          }];
          requestTemplate.d.MaxFacetValues = query.top;
          requestUrl = this.buildQueryUrl(this.requestPrefix, "/SearchQueries");
        }
        return this.ajaxClient.postJson(requestUrl, requestTemplate).then(function (response) {
          // DataSourceAttribute is facet attribute
          return this.facetParser.parse(query, response.data.d);
        }.bind(this)
        // , function (error) {
        //     // DataSourceAttribute is advanced search relevant attribute, but NOT facet attribute
        //     return [];
        // }
        ).then(function (facets) {
          if (facets.length > 0) {
            return facets[0];
          }
          return this.sina._createChartResultSet({
            title: query.filter.dataSource.getAttributeMetadata(query.dimension).label,
            items: [],
            query: query
          });
        }.bind(this));
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, {
      key: "executeHierarchyQuery",
      value: function executeHierarchyQuery(query) {
        throw new NotImplementedError();
      }
    }, {
      key: "decideValueHelp",
      value: function decideValueHelp(query) {
        var conditions = query.filter.rootCondition.conditions;
        for (var i = 0; i < conditions.length; i++) {
          if (query.filter._getAttribute(conditions[i]) === query.dimension) {
            return true;
          }
        }
        return false;
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
        return query.types.indexOf("Object") >= 0 && query.filter.dataSource.type === query.sina.DataSourceType.BusinessObject;
      }
    }, {
      key: "executeObjectSuggestionQuery",
      value: function executeObjectSuggestionQuery(query) {
        var _this4 = this;
        // check query type
        if (!this.supports("ObjectSuggestions") || !this.isObjectSuggestionQuery(query)) {
          return Promise.resolve([]);
        }

        // build request
        var requestTemplate = JSON.parse(JSON.stringify(ajaxTemplates.objectSuggestionRequest));
        var rootCondition = query.filter.rootCondition.clone();
        var filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (filter.SubFilters.length !== 0) {
          requestTemplate.d.Filter = filter;
        } else {
          delete requestTemplate.d.Filter;
        }
        requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
        requestTemplate.d.QueryOptions.Top = query.top;
        requestTemplate.d.QueryOptions.Skip = query.skip;
        requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
        this.addSessionId(requestTemplate);

        // build request url
        var requestUrl = this.buildQueryUrl(this.requestPrefix, "/SuggestionsQueries");

        // fire request
        return this.ajaxClient.postJson(requestUrl, requestTemplate).then(function (response) {
          return _this4.suggestionParser.parseObjectSuggestions(query, response.data);
        });
      }
    }, {
      key: "executeRegularSuggestionQuery",
      value: function executeRegularSuggestionQuery(query) {
        var _this5 = this;
        var requestTemplate = JSON.parse(JSON.stringify(ajaxTemplates.suggestionRequest));

        // split search term in query into (1) searchTerm (2) suggestionTerm
        var searchTerm = query.filter.searchTerm;
        var splittedTerm = suggestionTermSplitter.split(this, searchTerm);

        // add search term to condition
        var rootCondition = query.filter.rootCondition.clone();

        // assemble request
        var filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (filter.SubFilters.length !== 0) {
          requestTemplate.d.Filter = filter;
        } else {
          delete requestTemplate.d.Filter;
        }
        requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
        requestTemplate.d.QueryOptions.Top = query.top;
        requestTemplate.d.QueryOptions.Skip = query.skip;
        requestTemplate.d.SuggestionInput = splittedTerm.suggestionTerm;
        requestTemplate.d.QueryOptions.SearchTerms = splittedTerm.searchTerm === null ? "" : splittedTerm.searchTerm;
        if (!this.includeSuggestionTypes(query, requestTemplate)) {
          // no regular suggestions requested -> return
          return [];
        }
        this.addSessionId(requestTemplate);

        // build request url
        var requestUrl = this.buildQueryUrl(this.requestPrefix, "/SuggestionsQueries");

        // fire request
        return this.ajaxClient.postJson(requestUrl, requestTemplate).then(function (response) {
          return _this5.suggestionParser.parseRegularSuggestions(query, response.data);
        }).then(function (suggestions) {
          suggestionTermSplitter.concatenate(_this5, splittedTerm, suggestions);
          return suggestions;
        });
      }
    }, {
      key: "includeSuggestionTypes",
      value: function includeSuggestionTypes(query, suggestionRequest) {
        var sina2OdataConversion = {
          SearchTerm: {
            Data: "IncludeAttributeSuggestions",
            History: "IncludeHistorySuggestions"
          },
          Object: {},
          DataSource: {
            Data: "IncludeDataSourceSuggestions"
          }
        };
        var suggestionTypes = query.types;
        var calculationModes = query.calculationModes;
        var success = false;
        for (var i = 0; i < suggestionTypes.length; i++) {
          var suggestionType = suggestionTypes[i];
          for (var j = 0; j < calculationModes.length; j++) {
            var calculationMode = calculationModes[j];
            var value = sina2OdataConversion[suggestionType][calculationMode];
            if (typeof value === "undefined") {
              continue;
            }
            suggestionRequest.d[value] = true;
            success = true;
          }
        }
        return success;
      }
    }, {
      key: "addSessionId",
      value: function addSessionId(request) {
        //            if (!this.sessionId) {
        //                this.sessionId = core.generateGuid();
        //            }
        request.d.QueryOptions.ClientSessionID = this.sessionId;
        var timeStamp = new Date().getTime();
        request.d.QueryOptions.ClientCallTimestamp = "\\/Date(" + timeStamp + ")\\/";
      }
    }, {
      key: "removeClientOptions",
      value: function removeClientOptions(request) {
        delete request.d.QueryOptions.ClientSessionID;
        delete request.d.QueryOptions.ClientCallTimestamp;
        delete request.d.QueryOptions.ClientServiceName;
        delete request.d.QueryOptions.ClientLastExecutionID;
      }
    }, {
      key: "getFilterValueFromConditionTree",
      value: function getFilterValueFromConditionTree(dimension, conditionTree) {
        if (conditionTree.ConditionAttribute && conditionTree.ConditionAttribute === dimension) {
          return conditionTree.ConditionValue;
        } else if (conditionTree.SubFilters) {
          var i;
          var result = null;
          for (i = 0; result === null && i < conditionTree.SubFilters.length; i++) {
            result = this.getFilterValueFromConditionTree(dimension, conditionTree.SubFilters[i]);
          }
          return result;
        }
        return null;
      }
    }, {
      key: "getConfigurationAsync",
      value: function getConfigurationAsync() {
        var _this6 = this;
        var requestUrl = this.buildQueryUrl(this.requestPrefix, "/PersonalizedSearchMainSwitches?$filter=Selected eq true");
        return this.ajaxClient.getJson(requestUrl).then(function (response) {
          var config = {
            personalizedSearch: false,
            isPersonalizedSearchEditable: false
          };
          switch (response.data.d.results[0].MainSwitch) {
            case 3:
              // Enabled after user‘s approval
              config.isPersonalizedSearchEditable = true;
              break;
            case 4:
              // Enabled until user‘s rejection
              config.isPersonalizedSearchEditable = true;
              break;
            case 2:
              // Enabled for all users
              config.isPersonalizedSearchEditable = false;
              break;
            case 1:
              // Disabled for all users
              config.isPersonalizedSearchEditable = false;
              break;
          }
          requestUrl = _this6.buildQueryUrl(_this6.requestPrefix, "/Users('<current>')");
          return _this6.ajaxClient.getJson(requestUrl).then(function (response) {
            if (response.data.d.IsEnabledForPersonalizedSearch) {
              config.personalizedSearch = true;
            }
            return this.sina._createConfiguration(config);
          }.bind(_this6));
        });
      }
    }, {
      key: "saveConfigurationAsync",
      value: function saveConfigurationAsync(configuration) {
        var data = {
          IsEnabledForPersonalizedSearch: configuration.personalizedSearch
        };
        var requestUrl = this.buildQueryUrl(this.requestPrefix, "/Users('<current>')");
        return this.ajaxClient.mergeJson(requestUrl, data);
      }
    }, {
      key: "resetPersonalizedSearchDataAsync",
      value: function resetPersonalizedSearchDataAsync() {
        var data = {
          ClearPersonalizedSearchHistory: true
        };
        var requestUrl = this.buildQueryUrl(this.requestPrefix, "/Users('<current>')");
        return this.ajaxClient.mergeJson(requestUrl, data);
      }
    }, {
      key: "logUserEvent",
      value: function logUserEvent(event) {
        return this.userEventLogger.logUserEvent(event);
      }
    }, {
      key: "buildQueryUrl",
      value: function buildQueryUrl(queryPrefix, queryPostfix) {
        if (typeof window === "undefined") {
          // sina mocha tests on node
          return queryPrefix + queryPostfix;
        }
        var windowUrl = window.location.href;
        var requestUrl = "";
        var systemStringBegin;
        var systemString = "";
        var systemInRequestUrl = "";

        // assign search backend system manuelly
        // url: esh-system=sid(PH6.002) -> query: ;o=sid(PH6.002)
        systemStringBegin = windowUrl.indexOf("esh-system=sid(");
        if (systemStringBegin !== -1) {
          var systemStringEnd = windowUrl.substring(systemStringBegin).indexOf(")");
          if (systemStringEnd !== -1) {
            systemString = windowUrl.substring(systemStringBegin + 15, systemStringBegin + systemStringEnd);
            if (systemString.length !== 0) {
              systemInRequestUrl = ";o=sid(" + systemString + ")";
            }
          }
        }

        // assign search backend system manuelly
        // url: esh-system=ALIASNAMEXYZCLNT002 -> query: ;o=sid(ALIASNAMEXYZCLNT002)
        if (systemString.length === 0) {
          systemStringBegin = windowUrl.indexOf("esh-system=");
          if (systemStringBegin !== -1) {
            var systemStringEnd1 = windowUrl.substring(systemStringBegin).indexOf("&");
            var systemStringEnd2 = windowUrl.substring(systemStringBegin).indexOf("#");
            if (systemStringEnd1 !== -1 && systemStringEnd2 !== -1) {
              if (systemStringEnd1 < systemStringEnd2) {
                systemString = windowUrl.substring(systemStringBegin + 11, systemStringBegin + systemStringEnd1);
              } else {
                systemString = windowUrl.substring(systemStringBegin + 11, systemStringBegin + systemStringEnd2);
              }
            }
            if (systemStringEnd1 !== -1 && systemStringEnd2 === -1) {
              systemString = windowUrl.substring(systemStringBegin + 11, systemStringBegin + systemStringEnd1);
            }
            if (systemStringEnd1 === -1 && systemStringEnd2 !== -1) {
              systemString = windowUrl.substring(systemStringBegin + 11, systemStringBegin + systemStringEnd2);
            }
            if (systemStringEnd1 === -1 && systemStringEnd2 === -1) {
              systemString = windowUrl.substring(systemStringBegin + 11);
            }
          }
          if (systemString.length !== 0) {
            systemInRequestUrl = ";o=" + systemString;
          }
        }
        requestUrl = queryPrefix + systemInRequestUrl + queryPostfix;
        return requestUrl;
      }
    }, {
      key: "getDebugInfo",
      value: function getDebugInfo() {
        return "Searchsystem: ".concat(this.serverInfo.SystemId, " Client: ").concat(this.serverInfo.Client, " ESH Search API Provider: ").concat(this.id);
      }
    }, {
      key: "isQueryPropertySupported",
      value: function isQueryPropertySupported(path) {
        if (this.serviceXML === undefined) {
          return false;
        }
        var elements = this.serviceXML.querySelectorAll(path);
        if (elements.length > 0) {
          return true;
        }
        return false;
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