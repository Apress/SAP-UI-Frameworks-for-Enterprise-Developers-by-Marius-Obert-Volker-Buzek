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
sap.ui.define(["../../../UIUtil", "../../core/errors", "../../sina/ComparisonOperator", "../../sina/SearchResultSetItemAttribute", "../../sina/SimpleCondition", "../../sina/UserCategoryDataSource", "../AbstractProvider", "./template", "./template2"], function (_____UIUtil, ____core_errors, ____sina_ComparisonOperator, ____sina_SearchResultSetItemAttribute, ____sina_SimpleCondition, ____sina_UserCategoryDataSource, ___AbstractProvider, ___template, ___template2) {
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
  var registerHandler = _____UIUtil["registerHandler"];
  var ForcedBySearchTermTestError = ____core_errors["ForcedBySearchTermTestError"];
  var NotImplementedError = ____core_errors["NotImplementedError"];
  var ComparisonOperator = ____sina_ComparisonOperator["ComparisonOperator"];
  var SearchResultSetItemAttribute = ____sina_SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var SimpleCondition = ____sina_SimpleCondition["SimpleCondition"];
  var UserCategoryDataSource = ____sina_UserCategoryDataSource["UserCategoryDataSource"];
  var AbstractProvider = ___AbstractProvider["AbstractProvider"];
  var template = ___template["createTemplate"];
  var template2 = ___template2["createTemplate"];
  var Provider = /*#__PURE__*/function (_AbstractProvider) {
    _inherits(Provider, _AbstractProvider);
    var _super = _createSuper(Provider);
    function Provider() {
      var _this;
      _classCallCheck(this, Provider);
      _this = _super.call(this);
      _this.id = "sample";
      return _this;
    }
    _createClass(Provider, [{
      key: "initAsync",
      value: function initAsync(properties) {
        try {
          const _this4 = this;
          _this4.sina = properties.sina;
          _this4.templateProvider = template; // the newer template, folklorists
          if (document.location.href.indexOf("use=sample1") > 0) {
            _this4.templateProvider = template2; // the original template, scientists
          }

          var demoRoot = _this4.templateProvider(_this4);
          demoRoot._init(demoRoot);
          var res = Promise.resolve({
            capabilities: _this4.sina._createCapabilities({
              fuzzy: false
            })
          });
          return _await(res);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getSuggestionList",
      value: function getSuggestionList(templateData) {
        var listAsString = this._stringify(templateData);
        /* eslint no-useless-escape:0 */
        var regexp = new RegExp('"valueFormatted":"([^{/]+?)","valueHighlighted', "g");
        var matches = listAsString.match(regexp).slice();
        var singleWords = matches.toString().split(" ");
        singleWords = singleWords.toString().split(",");
        matches = matches.concat(singleWords);
        matches = matches.filter(function (item, pos) {
          if (item !== "") {
            return matches.indexOf(item) == pos;
          }
        });
        return matches;
      }
    }, {
      key: "_stringify",
      value: function _stringify(o) {
        var cache = [];
        var s = JSON.stringify(o, function (key, value) {
          if (_typeof(value) === "object" && value !== null) {
            if (cache.indexOf(value) !== -1) {
              // circular reference found, discard key
              return undefined;
            }
            // Store value in our collection
            cache.push(value);
          }
          return value;
        });
        cache = null; // enable garbage collection
        return s;
      }
    }, {
      key: "adjustImageViewing",
      value: function adjustImageViewing() {
        var clonePic, top, left;
        try {
          // try catch added for require issues  during unit testing per qUnit
          registerHandler("image-mouseenter", $(".sapUshellSearchResultListItem-Image"), "mouseenter", function () {
            clonePic = $(this).clone();
            $("body").append(clonePic);
            top = ($(window).height() - $(clonePic).outerHeight()) * 0.33;
            left = ($(window).width() - $(clonePic).outerWidth()) * 0.33;
            clonePic.css({
              position: "absolute",
              top: top + "px",
              left: left + "px"
            }).show();
          });
          registerHandler("image-mouseleave", $(".sapUshellSearchResultListItem-Image"), "mouseleave", function () {
            clonePic.remove();
          });
        } catch (error) {
          // do nothing
        }
      }
    }, {
      key: "applyFilters",
      value: function applyFilters(items, searchQuery) {
        var newItemsArray = [];
        if (searchQuery.filter.rootCondition instanceof SimpleCondition) {
          // quick select data source, nothing to do here
        } else {
          if (searchQuery.filter.rootCondition.conditions.length === 0 || searchQuery.filter.rootCondition.conditions[0].conditions.length === 0) {
            // return only items whose dataSource Id is included in subDataSources
            if (searchQuery.filter.dataSource instanceof UserCategoryDataSource) {
              var subDataSources = searchQuery.filter.dataSource.subDataSources;
              if (subDataSources) {
                return items.filter(function (item) {
                  return subDataSources.find(function (subDataSource) {
                    return subDataSource.id === item.dataSource.id;
                  });
                });
              }
            }
            return items;
          }
        }
        var toBeDimensionValuePairsArray = [];
        var toBeDimensionsArray = [];
        if (searchQuery.filter.rootCondition instanceof SimpleCondition /* quick select data source */) {
          var condition = searchQuery.filter.rootCondition;
          toBeDimensionValuePairsArray.push({
            attribute: condition.attribute,
            operator: condition.operator,
            value: condition.value,
            fits: false
          });
          toBeDimensionsArray.push(condition.attribute);
        } else {
          for (var g = 0; g < searchQuery.filter.rootCondition.conditions.length; g++) {
            var conditions = searchQuery.filter.rootCondition.conditions[g].conditions;
            for (var h = 0; h < conditions.length; h++) {
              toBeDimensionValuePairsArray.push({
                attribute: conditions[h].attribute,
                value: conditions[h].value,
                operator: conditions[h].operator,
                fits: false
              });
              toBeDimensionsArray.push(conditions[h].attribute);
            }
          }
        }
        var fits = false;
        for (var i = 0; i < items.length; i++) {
          // compare items with collected to-be-valid conditions
          var item = items[i];
          var fitsArray = [];
          for (var j = 0; j < toBeDimensionValuePairsArray.length; j++) {
            fits = false;
            for (var k = 0; k < item.detailAttributes.length; k++) {
              // loop thru all detailAttributes of item
              var detailAttribute = item.detailAttributes[k];
              if (detailAttribute instanceof SearchResultSetItemAttribute) {
                if (detailAttribute.id === toBeDimensionValuePairsArray[j].attribute && this.checkFilterValueMatch(detailAttribute.value, toBeDimensionValuePairsArray[j].value, toBeDimensionValuePairsArray[j].operator)) {
                  fits = true;
                }
              }
            }
            for (var m = 0; m < item.titleAttributes.length; m++) {
              // loop thru all titleAttributes of item
              var titleAttribute = item.titleAttributes[m];
              if (titleAttribute instanceof SearchResultSetItemAttribute) {
                if (titleAttribute.id === toBeDimensionValuePairsArray[j].attribute && this.checkFilterValueMatch(titleAttribute.value, toBeDimensionValuePairsArray[j].value, toBeDimensionValuePairsArray[j].operator)) {
                  fits = true;
                }
              }
            }
            toBeDimensionValuePairsArray[j].fits = fits;
            fitsArray.push(fits);
          }
          if (fitsArray.toString().match(/false/) === null) {
            newItemsArray.push(item);
          } else {
            // see if there is one 'true' match for each unique dimension, if so we can still add item
            var fitsArray2 = [];
            var uniqueDimensionsArray = toBeDimensionsArray.filter(function (item, pos) {
              return toBeDimensionsArray.indexOf(item) == pos;
            });
            for (var n = 0; n < uniqueDimensionsArray.length; n++) {
              fits = false;
              var dimension = uniqueDimensionsArray[n];
              for (var p = 0; p < toBeDimensionValuePairsArray.length; p++) {
                if (toBeDimensionValuePairsArray[p].attribute === dimension && toBeDimensionValuePairsArray[p].fits === true) {
                  fits = true;
                  break;
                }
              }
              fitsArray2.push(fits);
            }
            if (fitsArray2.toString().match(/false/) === null) {
              newItemsArray.push(item);
            }
          }
        }
        return newItemsArray;
      }
    }, {
      key: "checkFilterValueMatch",
      value: function checkFilterValueMatch(itemValue, filterValue, filterOperator) {
        switch (filterOperator) {
          case ComparisonOperator.Co:
            {
              return itemValue.toLowerCase().includes(filterValue.toLowerCase());
            }
          case ComparisonOperator.Eq:
            {
              return filterValue === itemValue;
            }
          case ComparisonOperator.Ne:
            {
              return filterValue !== itemValue;
            }
          case ComparisonOperator.Gt:
            {
              return filterValue > itemValue;
            }
          case ComparisonOperator.Ge:
            {
              return filterValue >= itemValue;
            }
          case ComparisonOperator.Lt:
            {
              return filterValue < itemValue;
            }
          case ComparisonOperator.Le:
            {
              return filterValue <= itemValue;
            }
          default:
            {
              return itemValue === filterValue;
            }
        }
        return false;
      }
    }, {
      key: "adjustHighlights",
      value: function adjustHighlights(items, searchTerm) {
        var newItemsArray = [];
        var attrMetadataType = "";
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var neverFound = true;
          attrMetadataType = "";
          item.titleHighlighted = this.addHighlight(item.title, searchTerm);
          if (item.titleHighlighted !== item.title) {
            neverFound = false;
          }
          for (var j = 0; j < item.detailAttributes.length; j++) {
            var detailAttr = item.detailAttributes[j];
            attrMetadataType = detailAttr.metadata.type;
            if (attrMetadataType === "String" || attrMetadataType === "Integer") {
              detailAttr.valueHighlighted = this.addHighlight(detailAttr.valueFormatted, searchTerm);
              if (detailAttr.valueHighlighted !== detailAttr.valueFormatted) {
                neverFound = false;
              }
            }
          }
          for (var k = 0; k < item.titleAttributes.length; k++) {
            var titleAttr = item.titleAttributes[k];
            attrMetadataType = titleAttr.metadata.type;
            if (attrMetadataType === "String" || attrMetadataType === "Integer" || attrMetadataType === "ImageUrl") {
              titleAttr.valueHighlighted = this.addHighlight(titleAttr.valueFormatted, searchTerm);
              if (titleAttr.valueHighlighted !== titleAttr.valueFormatted) {
                neverFound = false;
              }
            }
          }
          if (neverFound === false || searchTerm === "*" || searchTerm === "") {
            newItemsArray.push(item);
          }
        }
        return newItemsArray;
      }
    }, {
      key: "addHighlight",
      value: function addHighlight(hText, searchTerm) {
        if (typeof hText !== "string" || typeof searchTerm !== "string") {
          return hText;
        }
        var pos1 = hText.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (pos1 > -1) {
          var pos2 = pos1 + searchTerm.length;
          var newHText = hText.substring(0, pos1) + "<b>" + hText.substring(pos1, pos2) + "</b>" + hText.substring(pos2);
          return newHText;
        }
        return hText;
      }
    }, {
      key: "addSuvLinkToSearchResultItem",
      value: function addSuvLinkToSearchResultItem(searchResultItem, suvPath, searchTermsArray) {
        var suvNavTargetResolver = this.sina._createSuvNavTargetResolver();
        if (!suvPath) {
          suvPath = "/resources/sap/esh/search/ui/sinaNexTS/providers/sample/docs/folklorist_authors_and_publications.suv";
        }
        if (!searchTermsArray) {
          searchTermsArray = [];
        }
        var suvAttributes = {};
        suvAttributes.obj = {
          suvThumbnailAttribute: searchResultItem,
          suvTargetMimeTypeAttribute: {
            value: "application/vnd.sap.universal-viewer+suv"
          },
          suvTargetUrlAttribute: {
            value: suvPath
          }
        };
        suvNavTargetResolver.resolveSuvNavTargets(null, suvAttributes, searchTermsArray);
      }
    }, {
      key: "executeSearchQuery",
      value: function executeSearchQuery(searchQuery) {
        try {
          const _this5 = this;
          var _this2 = _this5;
          _this5.searchQuery = searchQuery;
          return _await(new Promise(function (resolve) {
            var resultSet;
            var itemsRoot = _this2.templateProvider(_this2);
            var items1 = itemsRoot.searchResultSetItemArray;
            var items2 = itemsRoot.searchResultSetItemArray2;
            var itemsAll = items1.concat(items2);
            var items3;
            if (itemsRoot.searchResultSetItemArray3) {
              items3 = itemsRoot.searchResultSetItemArray3;
              itemsAll = itemsAll.concat(items3);
            }
            var searchTerm = searchQuery.filter.searchTerm;
            var dataSourceId = searchQuery.filter.dataSource.id;
            var dataSourceType = searchQuery.filter.dataSource.type;
            var facets1 = _this2.generateFacets(searchQuery);
            if (searchTerm === ForcedBySearchTermTestError.forcedBySearchTerm) {
              throw new ForcedBySearchTermTestError();
            }
            var items;
            if (dataSourceId === "Scientists" || dataSourceId === "Folklorists") {
              items = _this2.adjustHighlights(items1, searchTerm);
              items = _this2.applyFilters(items, searchQuery);
              resultSet = _this2.sina._createSearchResultSet({
                items: items,
                facets: facets1,
                query: searchQuery,
                title: "",
                totalCount: items.length
              });
            } else if (dataSourceId === "Mysterious_Sightings" || dataSourceId === "Urban_Legends") {
              items = _this2.adjustHighlights(items2, searchTerm);
              items = _this2.applyFilters(items, searchQuery);
              resultSet = _this2.sina._createSearchResultSet({
                items: items,
                facets: facets1,
                query: searchQuery,
                title: "",
                totalCount: items.length
              });
            } else if (dataSourceId === "Publications") {
              items = _this2.adjustHighlights(items3, searchTerm);
              items = _this2.applyFilters(items, searchQuery);
              resultSet = _this2.sina._createSearchResultSet({
                items: items,
                facets: facets1,
                query: searchQuery,
                title: "",
                totalCount: items.length
              });
            } else if (dataSourceId === "All" || dataSourceType === _this2.sina.DataSourceType.UserCategory) {
              // initalize measureValue for all facet items, necessary for filtering out superfluous items (My Favorites)
              facets1[0].items.forEach(function (item) {
                item.measureValue = 0;
                item.measureValueFormatted = "";
              }); // calculate total counts for each sub branch of 'all'
              items = _this2.adjustHighlights(items1, searchTerm);
              items = _this2.applyFilters(items, searchQuery);
              var totalCount1 = items.length;
              items = _this2.adjustHighlights(items2, searchTerm);
              items = _this2.applyFilters(items, searchQuery);
              var totalCount2 = items.length;
              var totalCount3 = 0;
              if (items3) {
                items = _this2.adjustHighlights(items3, searchTerm);
                items = _this2.applyFilters(items, searchQuery);
                totalCount3 = items.length;
              }
              facets1[0].items[0].measureValue = totalCount1; // scientists
              facets1[0].items[0].measureValueFormatted = "" + totalCount1;
              facets1[0].items[1].measureValue = totalCount2; // mysterious sightings
              facets1[0].items[1].measureValueFormatted = "" + totalCount2;
              if (items3 && facets1[0].items.length > 2) {
                facets1[0].items[2].measureValue = totalCount3; // publications
                facets1[0].items[2].measureValueFormatted = "" + totalCount3;
              }
              // delete facet items where measureValue <= 0 (result items were filtered out)
              facets1[0].items = facets1[0].items.filter(function (item) {
                return item.measureValue > 0;
              });

              // proceed to insert facets into resultSet
              items = _this2.adjustHighlights(itemsAll, searchTerm);
              items = _this2.applyFilters(items, searchQuery);

              // top/skip
              var finalItems = [];
              for (var i = searchQuery.skip; i < searchQuery.skip + searchQuery.top && i < items.length; i++) {
                finalItems.push(items[i]);
              }

              // final results
              resultSet = _this2.sina._createSearchResultSet({
                items: finalItems,
                facets: facets1,
                query: searchQuery,
                title: "",
                totalCount: items.length
              });
            }
            resolve(resultSet);
          }));
        } catch (e) {
          return Promise.reject(e);
        }
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
          const _this6 = this;
          var _this3 = _this6;
          var searchTerm = query.filter.searchTerm;
          var demoRoot = _this6.templateProvider(_this6);
          var searchAbleItems = demoRoot.searchResultSetItemArray.concat(demoRoot.searchResultSetItemArray2).concat(demoRoot.searchResultSetItemArray3);
          var suggestionTerms = _this6.getSuggestionList(searchAbleItems); // "Sally Spring,Galapagos,Female,Barry Williamson,Off East Cyprus,Male,Conrad Atkinson,Baalbek, Lebanon,Roger Murdoch,Wycliffe Well"
          // ToDo: limit suggestion terms to what matches start of search term
          var suggestionsMatchingSearchterm = suggestionTerms.filter(function (s) {
            var regexp = new RegExp("^" + searchTerm, "gi");
            return s.match(regexp);
          });
          if (suggestionsMatchingSearchterm.length === 0) {
            suggestionsMatchingSearchterm = suggestionTerms;
          }
          var suggestions = [];
          var createSuggestionItem = function createSuggestionItem(term) {
            var calculationMode = _this3.sina.SuggestionCalculationMode.Data;
            var filter = query.filter.clone();
            filter.setSearchTerm(term);
            return _this3.sina._createSearchTermSuggestion({
              searchTerm: term,
              calculationMode: calculationMode,
              filter: filter,
              label: term
            });
          };
          for (var i = 0; i < suggestionsMatchingSearchterm.length; i++) {
            suggestions.push(createSuggestionItem(suggestionsMatchingSearchterm[i]));
          }
          var resultSet = _this6.sina._createSuggestionResultSet({
            title: "Suggestions",
            query: query,
            items: suggestions
          });
          return _await(new Promise(function (resolve) {
            resolve(resultSet);
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "executeChartQuery",
      value: function executeChartQuery(query) {
        try {
          const _this7 = this;
          var chartResultSetItems = _this7.generateFacets(query);
          var whichChart = 1; // scientists
          if (query.dimension === "LOCATION" || chartResultSetItems.length === 1) {
            whichChart = 0;
          }
          return _await(new Promise(function (resolve) {
            resolve(chartResultSetItems[whichChart]);
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getChartResultSetItemsForLocations",
      value: function getChartResultSetItemsForLocations(resultSetItemsArray) {
        var chartResultSetItems = [];
        var location;
        var locations = [];
        var chartResultSetItem, i, j, k, attrs;
        for (i = 0; i < resultSetItemsArray.length; i++) {
          attrs = resultSetItemsArray[i].detailAttributes;
          for (j = 0; j < attrs.length; j++) {
            if (attrs[j].id === "LOCATION") {
              location = attrs[j].value;
              if (locations.indexOf(location) === -1) {
                // new location
                locations.push(location);
                chartResultSetItem = this.sina._createChartResultSetItem({
                  filterCondition: this.sina.createSimpleCondition({
                    attribute: "LOCATION",
                    operator: this.sina.ComparisonOperator.Eq,
                    value: location
                  }),
                  dimensionValueFormatted: location,
                  measureValue: 1,
                  measureValueFormatted: "1"
                });
                chartResultSetItems.push(chartResultSetItem);
              } else {
                // add to measureValue
                for (k = 0; k < chartResultSetItems.length; k++) {
                  if (chartResultSetItems[k].filterCondition.value === location) {
                    chartResultSetItems[k].measureValue = chartResultSetItems[k].measureValue + 1;
                    chartResultSetItems[k].measureValueFormatted = "" + chartResultSetItems[k].measureValue;
                  }
                }
              }
            }
          }
        }
        return chartResultSetItems;
      }
    }, {
      key: "getChartResultSetItemsForPublications",
      value: function getChartResultSetItemsForPublications(resultSetItemsArray) {
        var chartResultSetItems = [];
        var location;
        var locations = [];
        var chartResultSetItem, i, j, k, attrs;
        for (i = 0; i < resultSetItemsArray.length; i++) {
          attrs = resultSetItemsArray[i].detailAttributes;
          for (j = 0; j < attrs.length; j++) {
            if (attrs[j].id === "PUBLICATION") {
              location = attrs[j].value;
              if (locations.indexOf(location) === -1) {
                // new location
                locations.push(location);
                chartResultSetItem = this.sina._createChartResultSetItem({
                  filterCondition: this.sina.createSimpleCondition({
                    attribute: "PUBLICATION",
                    operator: this.sina.ComparisonOperator.Eq,
                    value: location
                  }),
                  dimensionValueFormatted: location,
                  measureValue: 1,
                  measureValueFormatted: "1"
                });
                chartResultSetItems.push(chartResultSetItem);
              } else {
                // add to measureValue
                for (k = 0; k < chartResultSetItems.length; k++) {
                  if (chartResultSetItems[k].filterCondition.value === location) {
                    chartResultSetItems[k].measureValue = chartResultSetItems[k].measureValue + 1;
                    chartResultSetItems[k].measureValueFormatted = "" + chartResultSetItems[k].measureValue;
                  }
                }
              }
            }
          }
        }
        return chartResultSetItems;
      }
    }, {
      key: "getSientistOrFolkloristFacet",
      value: function getSientistOrFolkloristFacet(searchQuery, resultSetItemsArray) {
        var scientist;
        var scientists = [];
        var chartResultSetItem, i, j, k, attrs, dimension;
        var chartResultSetItems = [];
        for (i = 0; i < resultSetItemsArray.length; i++) {
          attrs = resultSetItemsArray[i].titleAttributes; // for folklorists and scientists
          if (searchQuery.filter.dataSource.id === "Mysterious_Sightings" || searchQuery.filter.dataSource.id === "Urban_Legends" || searchQuery.filter.dataSource.id === "Publications") {
            attrs = resultSetItemsArray[i].detailAttributes;
          }
          for (j = 0; j < attrs.length; j++) {
            if (attrs[j].id === "SCIENTIST" || attrs[j].id === "FOLKLORIST") {
              scientist = attrs[j].value;
              dimension = attrs[j].id;
              if (scientists.indexOf(scientist) === -1) {
                // this particular scientist is not listed yet
                scientists.push(scientist);
                chartResultSetItem = this.sina._createChartResultSetItem({
                  filterCondition: this.sina.createSimpleCondition({
                    attribute: attrs[j].id,
                    operator: this.sina.ComparisonOperator.Eq,
                    value: scientist
                  }),
                  dimensionValueFormatted: scientist,
                  measureValue: 1,
                  measureValueFormatted: "1"
                });
                chartResultSetItems.push(chartResultSetItem);
              } else {
                // add to measureValue
                for (k = 0; k < chartResultSetItems.length; k++) {
                  if (chartResultSetItems[k].filterCondition.value === scientist) {
                    chartResultSetItems[k].measureValue = chartResultSetItems[k].measureValue + 1;
                    chartResultSetItems[k].measureValueFormatted = "" + chartResultSetItems[k].measureValue;
                  }
                }
              }
            }
          }
        }
        return [chartResultSetItems, dimension];
      }
    }, {
      key: "getTopFacetOnly",
      value: function getTopFacetOnly(searchQuery) {
        var dataSource = searchQuery.filter.sina.allDataSource;
        var dataSourceItems = [this.sina._createDataSourceResultSetItem({
          dataSource: searchQuery.filter.sina.dataSources[1],
          dimensionValueFormatted: dataSource.labelPlural,
          measureValue: 4,
          measureValueFormatted: "4" // 4 scientists currently
        }), this.sina._createDataSourceResultSetItem({
          dataSource: searchQuery.filter.sina.dataSources[2],
          dimensionValueFormatted: dataSource.labelPlural,
          measureValue: 5,
          measureValueFormatted: "5" // 5 sightings currently
        })];

        if (searchQuery.filter.sina.dataSources[3]) {
          dataSourceItems[2] = this.sina._createDataSourceResultSetItem({
            dataSource: searchQuery.filter.sina.dataSources[3],
            dimensionValueFormatted: dataSource.labelPlural,
            measureValue: 1,
            measureValueFormatted: "1" // 1 publication currently
          });
        }

        var dataSourceFacets = [this.sina._createDataSourceResultSet({
          title: searchQuery.filter.dataSource.label,
          items: dataSourceItems,
          query: searchQuery
        })];
        return dataSourceFacets;
      }
    }, {
      key: "generateFacets",
      value: function generateFacets(searchQuery) {
        if (searchQuery.filter.dataSource.id === "All" || searchQuery.filter.dataSource.type === this.sina.DataSourceType.UserCategory) {
          return this.getTopFacetOnly(searchQuery);
        }
        var chartResultSetArray = [];
        var chartResultSet;
        var gen = this.templateProvider(this);
        var filter = this.sina.createFilter({
          searchTerm: this.searchQuery.filter.searchTerm,
          dataSource: this.searchQuery.filter.dataSource,
          rootCondition: this.searchQuery.filter.rootCondition.clone()
        });
        var chartResultSetItems = [];
        var resultSetItemsArray;

        // get the right resultsetitems
        if (searchQuery.filter.dataSource.id === "Publications") {
          resultSetItemsArray = gen.searchResultSetItemArray3;
        } else if (searchQuery.filter.dataSource.id === "Scientists" || searchQuery.filter.dataSource.id === "Folklorists") {
          resultSetItemsArray = gen.searchResultSetItemArray;
        } else if (searchQuery.filter.dataSource.id === "Urban_Legends" || searchQuery.filter.dataSource.id === "Mysterious_Sightings") {
          resultSetItemsArray = gen.searchResultSetItemArray2;
        }

        //  Location Facet
        if (searchQuery.filter.dataSource.id === "Scientists" || searchQuery.filter.dataSource.id === "Mysterious_Sightings") {
          chartResultSetItems = this.getChartResultSetItemsForLocations(resultSetItemsArray);
          chartResultSet = this.sina._createChartResultSet({
            items: chartResultSetItems,
            query: this.sina.createChartQuery({
              filter: filter,
              dimension: "LOCATION"
            }),
            title: "Locations"
          });
          chartResultSetArray.push(chartResultSet);
        }

        // Scientist or Folklorist Facet
        var info = this.getSientistOrFolkloristFacet(searchQuery, resultSetItemsArray);
        chartResultSetItems = info[0];
        var dimension = info[1];
        chartResultSet = this.sina._createChartResultSet({
          items: chartResultSetItems,
          query: this.sina.createChartQuery({
            filter: filter,
            dimension: dimension
          }),
          title: dimension.charAt(0).toUpperCase() + dimension.slice(1).toLowerCase() + "s"
        });
        chartResultSetArray.push(chartResultSet);
        return chartResultSetArray;
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