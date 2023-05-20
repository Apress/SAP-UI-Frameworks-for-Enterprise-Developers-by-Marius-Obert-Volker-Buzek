/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./i18n", "sap/m/MessageBox", "./SearchModel", "sap/ui/core/library", "./hierarchydynamic/SearchHierarchyDynamicFacet", "./SearchFacetDialogHelperDynamicHierarchy"], function (__i18n, MessageBox, __SearchModel, sap_ui_core_library, __SearchHierarchyDynamicFacet, ___SearchFacetDialogHelperDynamicHierarchy) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var i18n = _interopRequireDefault(__i18n);
  var MessageBoxAction = MessageBox["Action"];
  var SearchModel = _interopRequireDefault(__SearchModel);
  var TextDirection = sap_ui_core_library["TextDirection"];
  var SearchHierarchyDynamicFacet = _interopRequireDefault(__SearchHierarchyDynamicFacet);
  var createFilterFacetItemForDynamicHierarchy = ___SearchFacetDialogHelperDynamicHierarchy["createFilterFacetItemForDynamicHierarchy"];
  var SearchFacetDialogModel = /*#__PURE__*/function (_SearchModel) {
    _inherits(SearchFacetDialogModel, _SearchModel);
    var _super = _createSuper(SearchFacetDialogModel);
    function SearchFacetDialogModel(settings) {
      var _this;
      _classCallCheck(this, SearchFacetDialogModel);
      _this = _super.call(this, {
        searchModel: settings.searchModel,
        configuration: settings.searchModel.config
      });
      _this.aFilters = [];
      return _this;
    }
    _createClass(SearchFacetDialogModel, [{
      key: "prepareFacetList",
      value: function prepareFacetList() {
        var metaData = this.getDataSource();
        this.setProperty("/facetDialog", this.oFacetFormatter.getDialogFacetsFromMetaData(metaData, this));
        this.initialFillFiltersForDynamicHierarchyFacets();
      }
    }, {
      key: "initialFillFiltersForDynamicHierarchyFacets",
      value: function initialFillFiltersForDynamicHierarchyFacets() {
        var filter = this.getProperty("/uiFilter");
        var facets = this.getProperty("/facetDialog");
        var _iterator = _createForOfIteratorHelper(facets),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var facet = _step.value;
            if (!(facet instanceof SearchHierarchyDynamicFacet)) {
              continue;
            }
            var conditions = filter.rootCondition.getAttributeConditions(facet.attributeId);
            var _iterator2 = _createForOfIteratorHelper(conditions),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var condition = _step2.value;
                var simpleCondition = condition;
                var facetItem = createFilterFacetItemForDynamicHierarchy(facet, simpleCondition);
                this.aFilters.push(facetItem);
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
      }

      // properties: sAttribute, sBindingPath
    }, {
      key: "facetDialogSingleCall",
      value: function facetDialogSingleCall(properties) {
        var _this2 = this;
        this.chartQuery.dimension = properties.sAttribute;
        this.chartQuery.top = properties.sAttributeLimit;
        return this.chartQuery.getResultSetAsync().then(function (resultSet) {
          var oFacet;
          if (properties.bInitialFilters) {
            oFacet = _this2.oFacetFormatter.getDialogFacetsFromChartQuery(resultSet, _this2, _this2.chartQuery.dimension);
          } else {
            oFacet = _this2.oFacetFormatter.getDialogFacetsFromChartQuery(resultSet, _this2, _this2.chartQuery.dimension, _this2.aFilters);
          }
          var oFacet2 = jQuery.extend(true, {}, oFacet); // clone of oFacet
          oFacet.items4pie = oFacet2.items;
          var amountInPie = 0,
            amountNotInPie = 0,
            percentageMissingInPie = 0,
            averageSliceValue = 0;
          for (var i = 0; i < oFacet.items4pie.length; i++) {
            if (i < 9) {
              oFacet.items4pie[i]["pieReady"] = true;
              if (parseInt(oFacet.items4pie[i].value) > 0) {
                amountInPie += parseInt(oFacet.items4pie[i].value);
              }
            } else {
              oFacet.items4pie[i]["pieReady"] = false;
              if (parseInt(oFacet.items4pie[i].value) > 0) {
                amountNotInPie += parseInt(oFacet.items4pie[i].value);
              }
            }
          }
          percentageMissingInPie = amountNotInPie * 100 / (amountInPie + amountNotInPie);
          percentageMissingInPie = Math.ceil(percentageMissingInPie);
          averageSliceValue = amountInPie / 9;
          averageSliceValue = Math.floor(averageSliceValue);
          if (percentageMissingInPie > 0) {
            var newItem = oFacet.items4pie[0].clone();
            newItem.value = averageSliceValue.toString(); // ToDo, why do we need 'toString' here?
            newItem.label = i18n.getText("facetPieChartOverflowText2", [percentageMissingInPie.toString(), "9"]);
            newItem["pieReady"] = true;
            newItem.valueLabel = "" + averageSliceValue;
            newItem["isPieChartDummy"] = true;
            oFacet.items4pie.push(newItem);
          }
          for (var j = 0; j < oFacet.items4pie.length; j++) {
            oFacet.items4pie[j]["percentageMissingInBigPie"] = percentageMissingInPie;
          }
          _this2.setProperty(properties.sBindingPath + "/items4pie", oFacet.items4pie);
          _this2.setProperty(properties.sBindingPath + "/items", oFacet.items);
        }, function (error) {
          var errorTitle = i18n.getText("searchError");
          var errorText = error.message;
          MessageBox.error(errorText, {
            title: errorTitle,
            actions: MessageBoxAction.OK,
            onClose: null,
            styleClass: "",
            initialFocus: null,
            textDirection: TextDirection.Inherit
          });
        });
      }
    }, {
      key: "resetChartQueryFilterConditions",
      value: function resetChartQueryFilterConditions() {
        if (this.chartQuery) {
          this.chartQuery.resetConditions();
        }
        // add static hierachy facets
        var nonFilterByConditions = this.getNonFilterByFilterConditions();
        if (nonFilterByConditions.length > 0) {
          var _iterator3 = _createForOfIteratorHelper(nonFilterByConditions),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var nonFilterByCondition = _step3.value;
              this.chartQuery.autoInsertCondition(nonFilterByCondition);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      }
    }, {
      key: "hasFilterCondition",
      value: function hasFilterCondition(filterCondition) {
        for (var i = 0; i < this.aFilters.length; i++) {
          if (this.aFilters[i].filterCondition.equals && this.aFilters[i].filterCondition.equals(filterCondition)) {
            return true;
          }
        }
        return false;
      }
    }, {
      key: "hasFilter",
      value: function hasFilter(item) {
        var filterCondition = item.filterCondition;
        return this.hasFilterCondition(filterCondition);
      }
    }, {
      key: "addFilter",
      value: function addFilter(item) {
        if (!this.hasFilter(item)) {
          this.aFilters.push(item);
        }
      }
    }, {
      key: "removeFilter",
      value: function removeFilter(item) {
        var filterCondition = item.filterCondition;
        for (var i = 0; i < this.aFilters.length; i++) {
          if (this.aFilters[i].filterCondition.equals && this.aFilters[i].filterCondition.equals(filterCondition)) {
            this.aFilters.splice(i, 1);
            return;
          }
        }
      }
    }, {
      key: "changeFilterAdvaced",
      value: function changeFilterAdvaced(item, bAdvanced) {
        var filterCondition = item.filterCondition;
        for (var i = 0; i < this.aFilters.length; i++) {
          if (this.aFilters[i].filterCondition.equals && this.aFilters[i].filterCondition.equals(filterCondition)) {
            this.aFilters[i].advanced = bAdvanced;
            return;
          }
        }
      }
    }, {
      key: "addFilterCondition",
      value: function addFilterCondition(filterCondition) {
        this.chartQuery.filter.autoInsertCondition(filterCondition);
      }

      // determinate the attribute list data type
    }, {
      key: "getAttributeDataType",
      value: function getAttributeDataType(facet) {
        switch (facet.dataType) {
          case "Integer":
            return "integer";
          case "Double":
            return "number";
          case "Timestamp":
            return "timestamp";
          case "Date":
            return "date";
          case "String":
            if (facet.matchingStrategy === this.sinaNext.MatchingStrategy.Text) {
              return "text";
            }
            return "string";
          default:
            return "string";
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        _get(_getPrototypeOf(SearchFacetDialogModel.prototype), "destroy", this).call(this);
        this.oFacetFormatter.destroy();
      }
    }]);
    return SearchFacetDialogModel;
  }(SearchModel);
  return SearchFacetDialogModel;
});
})();