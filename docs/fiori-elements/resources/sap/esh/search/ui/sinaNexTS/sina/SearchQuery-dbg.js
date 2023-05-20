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
sap.ui.define(["../core/core", "./Query", "./EqualsMode", "./ConditionType", "./DataSourceType", "../core/errors", "./ComparisonOperator"], function (core, ___Query, ___EqualsMode, ___ConditionType, ___DataSourceType, ___core_errors, ___ComparisonOperator) {
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
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
  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get.bind();
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);
        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);
        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }
        return desc.value;
      };
    }
    return _get.apply(this, arguments);
  }
  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }
    return object;
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
  var Query = ___Query["Query"];
  var EqualsMode = ___EqualsMode["EqualsMode"];
  var ConditionType = ___ConditionType["ConditionType"];
  var DataSourceSubType = ___DataSourceType["DataSourceSubType"];
  var DataSourceType = ___DataSourceType["DataSourceType"];
  var QueryIsReadOnlyError = ___core_errors["QueryIsReadOnlyError"];
  var ComparisonOperator = ___ComparisonOperator["ComparisonOperator"];
  var SearchQuery = /*#__PURE__*/function (_Query) {
    _inherits(SearchQuery, _Query);
    var _super = _createSuper(SearchQuery);
    function SearchQuery(properties) {
      var _properties$calculate, _properties$multiSele, _properties$nlq, _properties$facetTop, _properties$groupBy;
      var _this;
      _classCallCheck(this, SearchQuery);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "calculateFacets", false);
      _defineProperty(_assertThisInitialized(_this), "multiSelectFacets", false);
      _defineProperty(_assertThisInitialized(_this), "nlq", false);
      _defineProperty(_assertThisInitialized(_this), "facetTop", 5);
      _this.calculateFacets = (_properties$calculate = properties.calculateFacets) !== null && _properties$calculate !== void 0 ? _properties$calculate : _this.calculateFacets;
      _this.multiSelectFacets = (_properties$multiSele = properties.multiSelectFacets) !== null && _properties$multiSele !== void 0 ? _properties$multiSele : _this.multiSelectFacets;
      _this.nlq = (_properties$nlq = properties.nlq) !== null && _properties$nlq !== void 0 ? _properties$nlq : _this.nlq;
      _this.facetTop = (_properties$facetTop = properties.facetTop) !== null && _properties$facetTop !== void 0 ? _properties$facetTop : _this.facetTop;
      _this.groupBy = (_properties$groupBy = properties.groupBy) !== null && _properties$groupBy !== void 0 ? _properties$groupBy : _this.groupBy;
      return _this;
    }
    _createClass(SearchQuery, [{
      key: "setCalculateFacets",
      value: function setCalculateFacets() {
        var calculateFacets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.calculateFacets = calculateFacets;
      }
    }, {
      key: "setMultiSelectFacets",
      value: function setMultiSelectFacets() {
        var multiSelectFacets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.multiSelectFacets = multiSelectFacets;
      }
    }, {
      key: "setNlq",
      value: function setNlq() {
        var nlq = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.nlq = nlq;
      }
    }, {
      key: "setFacetTop",
      value: function setFacetTop() {
        var facetTop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
        this.facetTop = facetTop;
      }
    }, {
      key: "_createReadOnlyClone",
      value: function _createReadOnlyClone() {
        var query = this.clone();
        query.getResultSetAsync = function () {
          throw new QueryIsReadOnlyError("this query is readonly");
        };
        return query;
      }
    }, {
      key: "clone",
      value: function clone() {
        var clone = new SearchQuery({
          skip: this.skip,
          top: this.top,
          filter: this.filter.clone(),
          sortOrder: this.sortOrder,
          sina: this.sina,
          groupBy: this.groupBy,
          calculateFacets: this.calculateFacets,
          multiSelectFacets: this.multiSelectFacets,
          nlq: this.nlq,
          facetTop: this.facetTop
        });
        return clone;
      }
    }, {
      key: "equals",
      value: function equals(other) {
        var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EqualsMode.CheckFireQuery;
        if (!(other instanceof SearchQuery)) {
          return false;
        }
        if (!other) {
          return false;
        }
        if (!_get(_getPrototypeOf(SearchQuery.prototype), "equals", this).call(this, other)) {
          return false;
        }
        if (this.groupBy !== other.groupBy) {
          return false;
        }

        // check nlq
        if (this.nlq !== other.nlq) {
          return false;
        }
        // check multiSelectFacets
        if (this.multiSelectFacets !== other.multiSelectFacets) {
          return false;
        }
        // check facetTop
        if (this.facetTop !== other.facetTop) {
          return false;
        }
        // special check for calculate Facets
        switch (mode) {
          case EqualsMode.CheckFireQuery:
            if (other.calculateFacets && !this.calculateFacets) {
              // if old query (other) was with facets and new is without
              // -> we do not need to fire new query -> return true
              return true;
            }
            return this.calculateFacets === other.calculateFacets;
          default:
            return this.calculateFacets === other.calculateFacets;
        }
      }
    }, {
      key: "_execute",
      value: function _execute(query) {
        try {
          const _this2 = this;
          var filterAttributes;
          var chartQueries = [];

          // multi select facets: assemble chart queries for all facets with set filters
          // (The main search request typically does not inlcude facets if a filter is set for a facet,
          //  because the facet then is trivial. For multi select we need to display also facets with set
          // filters therefore a special chart query is assembled)
          if (_this2.multiSelectFacets && _this2.calculateFacets) {
            // collect attribute for which filters are set
            filterAttributes = _this2._collectAttributesWithFilter(query);
            // create chart queries for filterAttribute
            chartQueries = _this2._createChartQueries(query, filterAttributes);
          }

          // fire all requests
          var requests = [];
          var delayedCharQueries = [];
          requests.push(_this2._executeSearchQuery(query));
          for (var i = 0; i < chartQueries.length; ++i) {
            var chartQuery = chartQueries[i];
            var dataSourceMetadata = query.filter.dataSource.getAttributeMetadata(chartQuery.dimension);
            if (!dataSourceMetadata) {
              // in case of inav2 the metadata ist loaded by the main search call
              // ->
              // collect chartQueries for which we have no metadata
              // in order to execute them after the main search call returned
              delayedCharQueries.push(chartQuery);
            } else {
              if (dataSourceMetadata.usage.Facet) {
                requests.push(chartQuery.getResultSetAsync());
              }
            }
          }

          // wait for search query and for not delayed chart querues
          return _await(Promise.all(requests), function (results) {
            // fire delayed chart queries (not tested because we have no inav2 in typescript sina)
            var delayedChartQueryRequests = [];
            for (var j = 0; j < delayedCharQueries.length; ++j) {
              var delayedCharQuery = delayedCharQueries[j];
              var _dataSourceMetadata = query.filter.dataSource.getAttributeMetadata(delayedCharQuery.dimension);
              if (_dataSourceMetadata.usage.Facet) {
                delayedChartQueryRequests.push(delayedCharQuery.getResultSetAsync());
              }
            }

            // wait for delayed chart queries and append to total results
            return _await(Promise.all(delayedChartQueryRequests), function (delayedCharQueryResults) {
              results = results.concat(delayedCharQueryResults);
              var searchResult = results[0];
              var chartResultSets = results.slice(1);
              _this2._mergeFacetsToSearchResultSet(searchResult, chartResultSets);
              return searchResult;
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_executeSearchQuery",
      value: function _executeSearchQuery(query) {
        try {
          const _this3 = this;
          if (query.filter.isFolderMode()) {
            return _await(_this3._executeSearchQueryInFolderMode(query));
          } else {
            return _await(_this3._executeSearchQueryInSearchMode(query));
          }
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_executeSearchQueryInSearchMode",
      value: function _executeSearchQueryInSearchMode(query) {
        try {
          const _this4 = this;
          return _await(_this4._doExecuteSearchQuery(query));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_executeSearchQueryInFolderMode",
      value: function _executeSearchQueryInFolderMode(query) {
        try {
          let _exit = false;
          var _await$Promise$all, _await$Promise$all2, resultSet, addtionalResultSet;
          const _this5 = this;
          return _await(_invoke(function () {
            if (!_this5._isAdditionalFolderQueryNeeded(query)) {
              return _await(_this5._doExecuteSearchQuery(query), function (_await$_this5$_doExec) {
                _exit = true;
                return _await$_this5$_doExec;
              });
            }
          }, function (_result) {
            if (_exit) return _result;
            var additionalFolderQuery = _this5._assembleAdditionalFolderQuery(query);
            return _await(_this5._doExecuteSearchQuery(query), function (_this5$_doExecuteSear) {
              return _await(_this5._doExecuteSearchQuery(additionalFolderQuery), function (_this5$_doExecuteSear2) {
                return _await(Promise.all([_this5$_doExecuteSear, _this5$_doExecuteSear2]), function (_Promise$all) {
                  _await$Promise$all = _Promise$all;
                  _await$Promise$all2 = _slicedToArray(_await$Promise$all, 2);
                  resultSet = _await$Promise$all2[0];
                  addtionalResultSet = _await$Promise$all2[1];
                  var mergedResultSet = _this5._mergeResultSetsInNavigationFolderMode(resultSet, addtionalResultSet);
                  return mergedResultSet;
                });
              });
            });
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_mergeResultSetsInNavigationFolderMode",
      value: function _mergeResultSetsInNavigationFolderMode(resultSet, additionalResultSet) {
        // move items from additionalResultSet to resultSet
        resultSet.items = [];
        var _iterator = _createForOfIteratorHelper(additionalResultSet.items),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;
            item.parent = resultSet;
            resultSet.items.push(item);
          }
          // move total count from additionalResultSet to resultSet
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        resultSet.totalCount = additionalResultSet.totalCount;
        return resultSet;
      }
    }, {
      key: "_assembleAdditionalFolderQuery",
      value: function _assembleAdditionalFolderQuery(query) {
        // clone query
        var additionalFolderQuery = query.clone();
        additionalFolderQuery.calculateFacets = false;
        // collect descendat-of filter conditions for folder attribute
        var folderAttribute = additionalFolderQuery.filter.getFolderAttribute();
        var folderAttributeConditions = additionalFolderQuery.filter.rootCondition.getConditionsByAttribute(folderAttribute);
        var descendantFilterConditions = folderAttributeConditions.filter(function (condition) {
          return condition.operator === ComparisonOperator.DescendantOf;
        });
        // switch operator from descendant-of to child-of
        var _iterator2 = _createForOfIteratorHelper(descendantFilterConditions),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var descendantFilterCondition = _step2.value;
            descendantFilterCondition.operator = ComparisonOperator.ChildOf;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        return additionalFolderQuery;
      }
    }, {
      key: "_isAdditionalFolderQueryNeeded",
      value: function _isAdditionalFolderQueryNeeded(query) {
        var folderAttribute = query.filter.getFolderAttribute();
        var folderAttributeConditions = query.filter.rootCondition.getConditionsByAttribute(folderAttribute);
        var descendantFilterConditions = folderAttributeConditions.filter(function (condition) {
          return condition.operator === ComparisonOperator.DescendantOf;
        });
        return descendantFilterConditions.length > 0;
      }
    }, {
      key: "_doExecuteSearchQuery",
      value: function _doExecuteSearchQuery(query) {
        try {
          const _this6 = this;
          var transformedQuery = _this6._filteredQueryTransform(query);
          return _await(_this6.sina.provider.executeSearchQuery(transformedQuery), function (resultSet) {
            return _this6._filteredQueryBackTransform(query, resultSet);
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_filteredQueryTransform",
      value: function _filteredQueryTransform(query) {
        return this._genericFilteredQueryTransform(query);
      }
    }, {
      key: "_filteredQueryBackTransform",
      value: function _filteredQueryBackTransform(query, resultSet) {
        if (query.filter.dataSource.type !== DataSourceType.BusinessObject || query.filter.dataSource.subType !== DataSourceSubType.Filtered) {
          return resultSet;
        }
        resultSet.query = query;
        var _iterator3 = _createForOfIteratorHelper(resultSet.facets),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var chartResultSet = _step3.value;
            chartResultSet.query.filter = query.filter.clone();
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        return resultSet;
      }
    }, {
      key: "_formatResultSetAsync",
      value: function _formatResultSetAsync(resultSet) {
        try {
          const _this7 = this;
          return _await(core.executeSequentialAsync(_this7.sina.searchResultSetFormatters, function (formatter) {
            return formatter.formatAsync(resultSet);
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_collectAttributesWithFilter",
      value: function _collectAttributesWithFilter(query) {
        // recursively collect attributes
        var attributeMap = {};
        this._doCollectAttributes(attributeMap, query.filter.rootCondition);
        var attributedIds = Object.keys(attributeMap);
        // filter out hierarchy attributes
        // (for hierarchy attributes no chart queries are created per attribute
        // instead in SearchHierarchyFacetsFormatter HierarchyQueries are created)
        return attributedIds.filter(function (attributeId) {
          var attributeMetadata = query.filter.dataSource.getAttributeMetadata(attributeId);
          if (!attributeMetadata) {
            return true; // inav2: metadata may not be loaded, but inav2 does not support hierarchy
          }

          return !attributeMetadata.isHierarchy;
        });
      }
    }, {
      key: "_doCollectAttributes",
      value: function _doCollectAttributes(attributeMap, condition) {
        switch (condition.type) {
          case ConditionType.Simple:
            attributeMap[condition.attribute] = true;
            break;
          case ConditionType.Complex:
            for (var i = 0; i < condition.conditions.length; ++i) {
              var subCondition = condition.conditions[i];
              this._doCollectAttributes(attributeMap, subCondition);
            }
            break;
        }
      }
    }, {
      key: "_createChartQuery",
      value: function _createChartQuery(query, filterAttribute) {
        var chartQuery = this.sina.createChartQuery({
          dimension: filterAttribute,
          top: this.facetTop
        });
        chartQuery.setFilter(query.filter.clone());
        chartQuery.filter.rootCondition.removeAttributeConditions(filterAttribute);
        return chartQuery;
      }
    }, {
      key: "_createChartQueries",
      value: function _createChartQueries(query, filterAttributes) {
        var chartQueries = [];
        for (var i = 0; i < filterAttributes.length; ++i) {
          var filterAttribute = filterAttributes[i];
          var chartQuery = this._createChartQuery(query, filterAttribute);
          chartQueries.push(chartQuery);
        }
        return chartQueries;
      }
    }, {
      key: "_mergeFacetsToSearchResultSet",
      value: function _mergeFacetsToSearchResultSet(searchResultSet, chartResultSets) {
        //////////////////////////////////////////////////////////////////////////////////
        // selected filters
        // main request
        // chart request
        // total count

        // 1. selected filters -> facets (no count info)
        // 2. facets (no count info) + total count -> facets (facets with one facet item, count info)
        // 3. facets (facets with one facet item, count info) + main request (count info) -> facets (partial count info)
        // 4. facets (partial count info) + chart request -> facets
        //////////////////////////////////////////////////////////////////////////////////

        this._addSelectedFiltersToSearchResultSet(searchResultSet);
        for (var i = 0; i < chartResultSets.length; ++i) {
          var chartResultSet = chartResultSets[i];
          this._addChartResultSetToSearchResultSet(searchResultSet, chartResultSet);
        }
      }
    }, {
      key: "_calculateFacetTitle",
      value: function _calculateFacetTitle(condition, dataSource) {
        // if (condition.attributeLabel) {
        //     return condition.attributeLabel;
        // }
        var attribute = condition.getFirstAttribute();
        var attributeMetadata = dataSource.getAttributeMetadata(attribute);
        return attributeMetadata.label;
      }
    }, {
      key: "_addSelectedFiltersToSearchResultSet",
      value: function _addSelectedFiltersToSearchResultSet(searchResultSet) {
        // ToDo: add type SearchResultSet, but currently leading to syntax error for 'rootCondition.conditions[j].conditions'
        var dataSource = searchResultSet.query.filter.dataSource;
        var rootCondition = searchResultSet.query.filter.rootCondition;
        for (var j = 0; j < rootCondition.conditions.length; j++) {
          var conditions = rootCondition.conditions[j].conditions;
          var conditionAttributeLabel = this._calculateFacetTitle(conditions[0], searchResultSet.query.filter.dataSource);
          var conditionAttribute = void 0;
          switch (conditions[0].type) {
            case ConditionType.Simple:
              conditionAttribute = conditions[0].attribute;
              break;
            case ConditionType.Complex:
              conditionAttribute = conditions[0].conditions[0].attribute;
              break;
          }
          var attributeMetadata = dataSource.getAttributeMetadata(conditionAttribute);
          if (attributeMetadata.isHierarchy) {
            continue;
          }
          var matchFacetIndex = this._findMatchFacet(conditionAttribute, searchResultSet.facets);
          var matchFacet = searchResultSet.facets[matchFacetIndex];
          if (!matchFacet) {
            var chartquery = this._createChartQuery(searchResultSet.query, conditionAttribute);
            matchFacet = this.sina._createChartResultSet({
              title: conditionAttributeLabel,
              items: [],
              query: chartquery
            });
            searchResultSet.facets.splice(matchFacetIndex, 1, matchFacet);
          }
          var countValue = null;
          if (conditions.length === 1) {
            countValue = searchResultSet.totalCount;
          }
          var selectedFacetItemList = [];
          for (var k = 0; k < conditions.length; k++) {
            var matchFacetItemIndex = void 0;
            // check in searchResultSet facets
            if (this._findFilterConditionInFacetItemList(conditions[k], matchFacet.items) >= 0) {
              matchFacetItemIndex = this._findFilterConditionInFacetItemList(conditions[k], matchFacet.items);
              selectedFacetItemList.push(matchFacet.items[matchFacetItemIndex]);
            } else {
              selectedFacetItemList.push(this.sina._createChartResultSetItem({
                filterCondition: conditions[k],
                dimensionValueFormatted: conditions[k].valueLabel || conditions[k].value,
                measureValue: countValue,
                measureValueFormatted: conditions[k].valueLabel || conditions[k].value
              }));
            }
          }
          matchFacet.items = selectedFacetItemList;
        }
      }
    }, {
      key: "_addChartResultSetToSearchResultSet",
      value: function _addChartResultSetToSearchResultSet(searchResultSet, chartResultSet) {
        if (chartResultSet.items.length === 0) {
          return;
        }

        // check for matching facet in searchResultSet
        var dimension = chartResultSet.query.dimension;
        var matchFacetIndex = this._findMatchFacet(dimension, searchResultSet.facets);
        var matchFacet = searchResultSet.facets[matchFacetIndex];

        // selected facet items for this dimension
        var selectedFacetItemList = matchFacet.items;

        // merge selected facet items to chartResultSet
        var facetItemSelectionOutsideRange = false;
        var appendFacetItemList = [];
        for (var m = 0; m < selectedFacetItemList.length; m++) {
          var matchIndex = this._findFilterConditionInFacetItemList(selectedFacetItemList[m].filterCondition, chartResultSet.items);
          if (matchIndex >= 0) {
            // if find, insert matching facet item to append list for range facet, because it has count info
            if (this._isRangeFacet(chartResultSet.query)) {
              appendFacetItemList.push(chartResultSet.items[matchIndex]);
            }
          } else {
            // not find, insert selected facet item to append list
            // for range facet, set boolean as true
            if (this._isRangeFacet(chartResultSet.query)) {
              facetItemSelectionOutsideRange = true;
            }
            appendFacetItemList.push(selectedFacetItemList[m]);
          }
        }
        appendFacetItemList.sort(function (a, b) {
          return b.measureValue - a.measureValue;
        });
        if (this._isRangeFacet(chartResultSet.query)) {
          if (facetItemSelectionOutsideRange) {
            chartResultSet.items = appendFacetItemList;
          }
        } else {
          chartResultSet.items = chartResultSet.items.concat(appendFacetItemList);
        }

        // merged list as search result facet
        searchResultSet.facets.splice(matchFacetIndex, 1, chartResultSet);
      }
    }, {
      key: "_findMatchFacet",
      value: function _findMatchFacet(dimension, facets) {
        var i = 0;
        for (; i < facets.length; i++) {
          var facet = facets[i];
          if (facet.query.dimension === dimension) {
            break;
          }
        }
        return i;
      }
    }, {
      key: "_findFilterConditionInFacetItemList",
      value: function _findFilterConditionInFacetItemList(filterCondition, facetItems) {
        var index = -1;
        for (var i = 0; i < facetItems.length; i++) {
          var chartFacetitem = facetItems[i];
          if (filterCondition.equals(chartFacetitem.filterCondition)) {
            index = i;
            break;
          }
        }
        return index;
      }
    }, {
      key: "_isRangeFacet",
      value: function _isRangeFacet(query) {
        var dataSourceMetadata = query.filter.dataSource.getAttributeMetadata(query.dimension);
        if (dataSourceMetadata.type === query.sina.AttributeType.Double) {
          return true;
        }
        return false;
      }
    }]);
    return SearchQuery;
  }(Query);
  var __exports = {
    __esModule: true
  };
  __exports.SearchQuery = SearchQuery;
  return __exports;
});
})();