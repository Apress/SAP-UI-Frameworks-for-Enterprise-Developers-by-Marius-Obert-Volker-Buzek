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
sap.ui.define(["../AbstractProvider", "../../core/core", "./conditionSerializer", "./dataSourceSerializer", "../../core/util", "../../core/lang", "../../core/ajax", "./ajaxTemplates", "./labelCalculation", "./pivotTableParser", "./suggestionParser", "./suggestionTermSplitter", "./UserEventLogger", "./MetadataParser", "./ItemParser", "./FacetParser", "../../sina/AttributeType", "../../core/errors"], function (___AbstractProvider, core, conditionSerializer, dataSourceSerializer, util, lang, ____core_ajax, ajaxTemplates, labelCalculation, pivotTableParser, suggestionParser, suggestionTermSplitter, ___UserEventLogger, ___MetadataParser, ___ItemParser, ___FacetParser, ____sina_AttributeType, ____core_errors) {
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
  var AbstractProvider = ___AbstractProvider["AbstractProvider"];
  var Client = ____core_ajax["Client"];
  var UserEventLogger = ___UserEventLogger["UserEventLogger"];
  var MetadataParser = ___MetadataParser["MetadataParser"];
  var ItemParser = ___ItemParser["ItemParser"];
  var FacetParser = ___FacetParser["FacetParser"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var ESHNotActiveError = ____core_errors["ESHNotActiveError"];
  var NotImplementedError = ____core_errors["NotImplementedError"]; // sinaDefine(['../../core/core',
  //     '../../core/util',
  //     '../../core/lang',
  //     './ajax',
  //     './ajaxTemplates',
  //     './pivotTableParser',
  //     './conditionSerializer',
  //     './dataSourceSerializer',
  //     './FacetParser',
  //     './ItemParser',
  //     './suggestionParser',
  //     './suggestionTermSplitter',
  //     './labelCalculation',
  //     './UserEventLogger',
  //     './MetadataParser'
  // ], function (
  //     core,
  //     util,
  //     lang,
  //     ajax,
  //     ajaxTemplates,
  //     pivotTableParser,
  //     conditionSerializer,
  //     dataSourceSerializer,
  //     FacetParser,
  //     ItemParser,
  //     suggestionParser,
  //     suggestionTermSplitter,
  //     labelCalculation,
  //     UserEventLogger,
  //     MetadataParser) {
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
      _defineProperty(_assertThisInitialized(_this), "id", "inav2");
      return _this;
    }
    _createClass(Provider, [{
      key: "initAsync",
      value: function initAsync(configuration) {
        var _configuration$ajaxCl,
          _this2 = this;
        this.urlPrefix = "/sap/es/ina";
        this.getServerInfoUrl = this.urlPrefix + "/GetServerInfo";
        this.getResponseUrl = this.urlPrefix + "/GetResponse";
        this.sina = configuration.sina;
        var clientProperties;
        if (typeof configuration.getLanguage === "function") {
          clientProperties = {
            csrf: true,
            csrfByPassCache: true,
            getLanguage: configuration.getLanguage
          };
        } else {
          clientProperties = {
            csrf: true,
            csrfByPassCache: true
          };
        }
        this.ajaxClient = (_configuration$ajaxCl = configuration.ajaxClient) !== null && _configuration$ajaxCl !== void 0 ? _configuration$ajaxCl : new Client(clientProperties);
        this.metadataLoadPromises = {};
        this.internalMetadata = {};
        this.labelCalculator = labelCalculation.createLabelCalculator();
        this.userEventLogger = new UserEventLogger(this);
        this.metadataParser = new MetadataParser(this);
        this.itemParser = new ItemParser(this);
        this.facetParser = new FacetParser(this);
        this.executeSearchQuery = this.addMetadataLoadDecorator(this.executeSearchQuery);
        this.executeChartQuery = this.addMetadataLoadDecorator(this.executeChartQuery);
        this.executeSuggestionQuery = this.addMetadataLoadDecorator(this.executeSuggestionQuery);
        this.sessionId = core.generateGuid();
        return this.loadServerInfo().then(function (serverInfo) {
          _this2.serverInfo = serverInfo;
          _this2.userEventLogger.delayedInit();
          if (!_this2.supports("Search")) {
            return Promise.reject(new ESHNotActiveError("Enterprise Search is not active"));
          }
          return _this2.loadBusinessObjectDataSources();
        }).then(function () {
          return {
            capabilities: _this2.sina._createCapabilities({
              fuzzy: _this2.supports("Search", "OptionFuzzy")
            })
          };
        });
      }
    }, {
      key: "addMetadataLoadDecorator",
      value: function addMetadataLoadDecorator(executeQuery) {
        return function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          var query = args[0];
          var dataSource = query.filter.dataSource;
          return Promise.resolve().then(function () {
            // 1) load metadata
            return this.loadMetadata(dataSource);
          }.bind(this)).then(function () {
            // 2) execute query
            return executeQuery.apply(this, args);
          }.bind(this));
        }.bind(this);
      }
    }, {
      key: "loadMetadata",
      value: function loadMetadata(dataSource) {
        // categories have no metadata
        if (dataSource.type === this.sina.DataSourceType.Category) {
          return Promise.resolve();
        }

        // check cache
        var loadPromise = this.metadataLoadPromises[dataSource.id];
        if (loadPromise) {
          return loadPromise;
        }

        // fire request
        ajaxTemplates.loadDataSourceMetadataRequest.DataSource.ObjectName = dataSource.id;
        this.addLanguagePreferences(ajaxTemplates.loadDataSourceMetadataRequest);
        loadPromise = this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.loadDataSourceMetadataRequest).then(function (response) {
          this.metadataParser.parseMetadataRequestMetadata(dataSource, response.data);
        }.bind(this));
        this.metadataLoadPromises[dataSource.id] = loadPromise;
        return loadPromise;
      }
    }, {
      key: "supports",
      value: function supports(service, capability) {
        for (var i = 0; i < this.serverInfo.Services.length; ++i) {
          var checkService = this.serverInfo.Services[i];
          if (checkService.Service == service) {
            if (!capability) {
              return true;
            }
            for (var j = 0; j < checkService.Capabilities.length; ++j) {
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
        return this.ajaxClient.getJson(this.getServerInfoUrl).then(function (response) {
          return response.data;
        });
      }
    }, {
      key: "loadBusinessObjectDataSources",
      value: function loadBusinessObjectDataSources() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = this;
        that.addLanguagePreferences(ajaxTemplates.loadDataSourcesRequest);

        // description plural in capability -> add description plural property in request
        if (that.supports("Search", "PluralDescriptionForDataSource")) {
          ajaxTemplates.loadDataSourcesRequest.Search.NamedValues.push({
            AttributeName: "DescriptionPlural",
            Name: "DescriptionPlural"
          });
        }
        return that.ajaxClient.postJson(that.getResponseUrl, ajaxTemplates.loadDataSourcesRequest).then(function (response) {
          that._processDataSourcesResponse(response, false);
        }, function () {
          var connector = that.serverInfo.ServerInfo.SystemId + that.serverInfo.ServerInfo.Client + "~ESH_CONNECTOR~";
          ajaxTemplates.fallbackLoadDataSourcesRequest.DataSource.ObjectName = connector;
          return that.ajaxClient.postJson(that.getResponseUrl, ajaxTemplates.fallbackLoadDataSourcesRequest).then(function (response) {
            that._processDataSourcesResponse(response, true);
          });
        });
      }
    }, {
      key: "_processDataSourcesResponse",
      value: function _processDataSourcesResponse(response, isFallback) {
        var data = pivotTableParser.parse(response.data);
        var dataSourcesData = data.axes[0];
        for (var i = 0; i < dataSourcesData.length; ++i) {
          var dataSourceData = dataSourcesData[i];
          var label = "";
          var labelPlural = "";
          var id = "";
          if (!isFallback) {
            if (core.isObject(dataSourceData.Description)) {
              label = dataSourceData.Description.Value;
            } else {
              label = dataSourceData.Description;
            }
            if (core.isObject(dataSourceData.DescriptionPlural)) {
              labelPlural = dataSourceData.DescriptionPlural.Value;
            } else {
              labelPlural = dataSourceData.DescriptionPlural;
            }
            if (core.isObject(dataSourceData.ObjectName)) {
              id = dataSourceData.ObjectName.Value;
            } else {
              id = dataSourceData.ObjectName;
            }
          } else {
            // fallback
            dataSourceData.$$ResultItemAttributes$$.forEach(function (elem) {
              if (elem.Name === "DESCRIPTION") {
                label = elem.Value;
              }
              if (elem.Name === "DESCRIPTION_PLURAL") {
                labelPlural = elem.Value;
              }
              if (elem.Name === "OBJECT_NAME") {
                id = elem.Value;
              }
            });
          }
          if (!label) {
            label = id;
          }
          if (!labelPlural) {
            labelPlural = label;
          }
          var dataSource = this.sina._createDataSource({
            id: id,
            label: label,
            labelPlural: labelPlural,
            type: this.sina.DataSourceType.BusinessObject
            // attributesMetadata: [{
            //     id: "dummy"
            // }] // fill with dummy attribute
          });

          this.labelCalculator.calculateLabel(dataSource);
        }
      }
    }, {
      key: "getInternalMetadataAttributes",
      value: function getInternalMetadataAttributes(dataSource) {
        var attributesMetadata = [];
        var internalMetadata = this.internalMetadata[dataSource.id];
        if (!internalMetadata) {
          return attributesMetadata;
        }
        for (var attributeId in internalMetadata.data) {
          attributesMetadata.push(internalMetadata.data[attributeId]);
        }
        return attributesMetadata;
      }
    }, {
      key: "getInternalMetadataAttribute",
      value: function getInternalMetadataAttribute(dataSource, attributeId) {
        return this.internalMetadata[dataSource.id].data[attributeId];
      }
    }, {
      key: "getInternalMetadataLoadStatus",
      value: function getInternalMetadataLoadStatus(dataSource) {
        var internalMetadata = this.internalMetadata[dataSource.id];
        if (!internalMetadata) {
          return {};
        }
        return internalMetadata.loadStatus;
      }
    }, {
      key: "fillInternalMetadata",
      value: function fillInternalMetadata(dataSource, loadStatusType, attributesMetadata) {
        var internalMetadata = this.internalMetadata[dataSource.id];
        if (!internalMetadata) {
          internalMetadata = {
            loadStatus: {},
            data: {}
          };
          this.internalMetadata[dataSource.id] = internalMetadata;
        }
        for (var i = 0; i < attributesMetadata.length; ++i) {
          var attributeMetadata = attributesMetadata[i];
          var bufferAttributeMetadata = internalMetadata.data[attributeMetadata.Name];
          if (!bufferAttributeMetadata) {
            bufferAttributeMetadata = {};
            internalMetadata.data[attributeMetadata.Name] = bufferAttributeMetadata;
          }
          for (var name in attributeMetadata) {
            bufferAttributeMetadata[name] = attributeMetadata[name];
          }
        }
        internalMetadata.loadStatus[loadStatusType] = true;
      }
    }, {
      key: "addTemplateConditions",
      value: function addTemplateConditions(rootCondition) {
        // ToDo, both types Complex/ConditionCondition lead to syntax errors
        rootCondition.addCondition({
          attribute: "$$RenderingTemplatePlatform$$",
          operator: this.sina.ComparisonOperator.Eq,
          value: "html"
        });
        rootCondition.addCondition({
          attribute: "$$RenderingTemplateTechnology$$",
          operator: this.sina.ComparisonOperator.Eq,
          value: "Tempo"
        });
        rootCondition.addCondition({
          attribute: "$$RenderingTemplateType$$",
          operator: this.sina.ComparisonOperator.Eq,
          value: "ResultItem"
        });
        rootCondition.addCondition({
          attribute: "$$RenderingTemplateType$$",
          operator: this.sina.ComparisonOperator.Eq,
          value: "ItemDetails"
        });
      }
    }, {
      key: "assembleOrderBy",
      value: function assembleOrderBy(query) {
        var result = [];
        for (var i = 0; i < query.sortOrder.length; ++i) {
          var sortKey = query.sortOrder[i];
          var sortOrder = sortKey.order === this.sina.SortOrder.Descending ? "DESC" : "ASC";
          result.push({
            AttributeName: sortKey.id,
            SortOrder: sortOrder
          });
        }
        return result;
      }
    }, {
      key: "executeSearchQuery",
      value: function executeSearchQuery(query) {
        var parsedItems, response;

        // assemble json request
        var rootCondition = query.filter.rootCondition.clone();
        this.addTemplateConditions(rootCondition);
        ajaxTemplates.searchRequest.Search.Filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        ajaxTemplates.searchRequest.DataSource = dataSourceSerializer.serialize(query.filter.dataSource);
        ajaxTemplates.searchRequest.Search.SearchTerms = query.filter.searchTerm;
        ajaxTemplates.searchRequest.Search.Top = query.top;
        ajaxTemplates.searchRequest.Search.Skip = query.skip;
        ajaxTemplates.searchRequest.Options = this.assembleRequestOptions(query);
        ajaxTemplates.searchRequest.Search.OrderBy = this.assembleOrderBy(query);
        ajaxTemplates.searchRequest.Search.Expand = ["Grid", "Items", "TotalCount"];
        this.addLanguagePreferences(ajaxTemplates.searchRequest);
        this.addSessionId(ajaxTemplates.searchRequest);
        if (query.calculateFacets) {
          ajaxTemplates.searchRequest.Search.Expand.push("ResultsetFacets");
        }

        // fire request
        return this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.searchRequest).then(function (InputResponse) {
          response = InputResponse;
          return this.itemParser.parse(query, response.data);
        }.bind(this)).then(function (InputParsedItems) {
          parsedItems = InputParsedItems;
          return this.facetParser.parse(query, response.data);
        }.bind(this)).then(function (parsedFacets) {
          return this.sina._createSearchResultSet({
            id: response.data.ExecutionID,
            title: "Search Result List",
            query: query,
            items: parsedItems.items,
            totalCount: parsedItems.totalCount,
            facets: parsedFacets
          });
        }.bind(this));
      }
    }, {
      key: "executeChartQuery",
      value: function executeChartQuery(query) {
        // assemble json request
        var rootCondition = query.filter.rootCondition.clone();
        this.addTemplateConditions(rootCondition);
        ajaxTemplates.chartRequest.Search.Filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        ajaxTemplates.chartRequest.DataSource = dataSourceSerializer.serialize(query.filter.dataSource);
        ajaxTemplates.chartRequest.Search.SearchTerms = query.filter.searchTerm;
        ajaxTemplates.chartRequest.Search.Top = 1;
        ajaxTemplates.chartRequest.Search.Skip = 0;
        ajaxTemplates.chartRequest.Facets.Attributes = [query.dimension];
        ajaxTemplates.chartRequest.Facets.MaxNumberOfReturnValues = query.top;
        ajaxTemplates.chartRequest.Options = this.assembleRequestOptions(query);
        this.addLanguagePreferences(ajaxTemplates.chartRequest);
        this.addSessionId(ajaxTemplates.chartRequest);

        // fire request
        return this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.chartRequest).then(function (response) {
          return this.facetParser.parse(query, response.data);
        }.bind(this)).then(function (facets) {
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
      key: "executeSuggestionQuery",
      value: function executeSuggestionQuery(query) {
        try {
          const _this3 = this;
          // split search term in query into (1) searchTerm (2) suggestionTerm
          var searchTerm = query.filter.searchTerm;
          var splittedTerm = suggestionTermSplitter.split(_this3, searchTerm);

          // add search term to condition
          var rootCondition = query.filter.rootCondition.clone();
          if (splittedTerm.searchTerm) {
            rootCondition.addCondition(query.sina.createSimpleCondition({
              attribute: AttributeType.INAV2_SearchTerms,
              value: splittedTerm.searchTerm
            }));
          }

          // add suggestion term to condition
          rootCondition.addCondition(query.sina.createSimpleCondition({
            attribute: AttributeType.INAV2_SuggestionTerms,
            value: splittedTerm.suggestionTerm
          }));

          // assemble request
          ajaxTemplates.suggestionRequest.Suggestions2.Filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
          ajaxTemplates.suggestionRequest.DataSource = dataSourceSerializer.serialize(query.filter.dataSource);
          ajaxTemplates.suggestionRequest.Options = _this3.assembleSuggestionOptions(query);
          if (ajaxTemplates.suggestionRequest.Options.length === 0) {
            return _await(_this3.sina._createSuggestionResultSet({
              title: "Suggestions",
              query: query,
              items: []
            }));
          }
          ajaxTemplates.suggestionRequest.Suggestions2.Top = query.top;
          ajaxTemplates.suggestionRequest.Suggestions2.Skip = query.skip;
          _this3.addLanguagePreferences(ajaxTemplates.suggestionRequest);
          _this3.addSessionId(ajaxTemplates.suggestionRequest);

          // fire request
          return _await(_this3.ajaxClient.postJson(_this3.getResponseUrl, ajaxTemplates.suggestionRequest).then(function (response) {
            var suggestions = suggestionParser.parse(this, query, response.data);
            suggestionTermSplitter.concatenate(this, splittedTerm, suggestions);
            return this.sina._createSuggestionResultSet({
              title: "Suggestions",
              query: query,
              items: suggestions
            });
          }.bind(_this3)));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "addSessionId",
      value: function addSessionId(request) {
        if (!this.supports("Search", "SessionHandling")) {
          delete request.SessionID;
          delete request.SessionTimestamp;
          return;
        }
        request.SessionID = this.sessionId;
        request.SessionTimestamp = parseInt(util.generateTimestamp(), 10);
      }
    }, {
      key: "addLanguagePreferences",
      value: function addLanguagePreferences(request) {
        if (!this.supports("Search", "LanguagePreferences")) {
          delete request.LanguagePreferences;
          return;
        }
        request.LanguagePreferences = lang.getLanguagePreferences();
      }
    }, {
      key: "assembleSuggestionOptions",
      value: function assembleSuggestionOptions(query) {
        // conversion table
        var sina2InaConversion = {
          SearchTerm: {
            Data: "SuggestObjectData",
            History: "SuggestSearchHistory"
          },
          Object: {},
          DataSource: {
            Data: "SuggestDataSources"
          }
        };
        // based on capabilities -> remove from conversion table
        if (!this.supports("Suggestions2", "ScopeTypes")) {
          delete sina2InaConversion.SearchTerm.History;
          delete sina2InaConversion.DataSource.Data;
        }
        // apply conversion table
        var options = [];
        var suggestionTypes = query.types;
        var calculationModes = query.calculationModes;
        for (var i = 0; i < suggestionTypes.length; i++) {
          var suggestionType = suggestionTypes[i];
          for (var j = 0; j < calculationModes.length; j++) {
            var calculationMode = calculationModes[j];
            var value = sina2InaConversion[suggestionType][calculationMode];
            if (!value) {
              continue;
            }
            options.push(value);
          }
        }
        return options; //['SuggestObjectData'];
      }
    }, {
      key: "assembleRequestOptions",
      value: function assembleRequestOptions(query) {
        var Options = ["SynchronousRun"];
        if (this.decideValueHelp(query)) {
          Options.push("ValueHelpMode");
        }
        return Options;
      }
    }, {
      key: "decideValueHelp",
      value: function decideValueHelp(query) {
        var conditions = query.filter.rootCondition.conditions;
        for (var i = 0; i < conditions.length; i++) {
          if (query.filter._getAttribute(conditions[i]) === query["dimension"]) {
            // ToDo
            return true;
          }
        }
        return false;
      }
    }, {
      key: "getConfigurationAsync",
      value: function getConfigurationAsync() {
        try {
          const _this4 = this;
          if (!_this4.supports("PersonalizedSearch", "SetUserStatus")) {
            return Promise.resolve(_this4.sina._createConfiguration({
              personalizedSearch: false,
              isPersonalizedSearchEditable: false
            }));
          }
          return _await(_this4.ajaxClient.postJson(_this4.getResponseUrl, ajaxTemplates.getConfigurationRequest).then(function (response) {
            var config = {
              personalizedSearch: false,
              isPersonalizedSearchEditable: false
            };
            config.personalizedSearch = response.data.Data.PersonalizedSearch.SessionUserActive;
            switch (response.data.Data.PersonalizedSearch.PersonalizationPolicy) {
              case "Opt-In":
                config.isPersonalizedSearchEditable = true;
                break;
              case "Opt-Out":
                config.isPersonalizedSearchEditable = true;
                break;
              case "Enforced":
                config.isPersonalizedSearchEditable = false;
                break;
              case "Disabled":
                config.isPersonalizedSearchEditable = false;
                break;
            }
            return this.sina._createConfiguration(config);
          }.bind(_this4)));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "saveConfigurationAsync",
      value: function saveConfigurationAsync(configuration) {
        try {
          const _this5 = this;
          if (!_this5.supports("PersonalizedSearch", "SetUserStatus")) {
            return Promise.resolve();
          }
          ajaxTemplates.saveConfigurationRequest.SearchConfiguration.Data.PersonalizedSearch.SessionUserActive = configuration.personalizedSearch;
          return _await(_this5.ajaxClient.postJson(_this5.getResponseUrl, ajaxTemplates.saveConfigurationRequest));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "resetPersonalizedSearchDataAsync",
      value: function resetPersonalizedSearchDataAsync() {
        if (!this.supports("PersonalizedSearch", "ResetUserData")) {
          return Promise.resolve();
        }
        return this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.resetPersonalizedSearchDataRequest);
      }
    }, {
      key: "logUserEvent",
      value: function logUserEvent(event) {
        return this.userEventLogger.logUserEvent(event);
      }
    }, {
      key: "getDebugInfo",
      value: function getDebugInfo() {
        return "Searchsystem: ".concat(this.serverInfo.ServerInfo.SystemId, " Client: ").concat(this.serverInfo.ServerInfo.Client, " ESH API Provider: ").concat(this.id);
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