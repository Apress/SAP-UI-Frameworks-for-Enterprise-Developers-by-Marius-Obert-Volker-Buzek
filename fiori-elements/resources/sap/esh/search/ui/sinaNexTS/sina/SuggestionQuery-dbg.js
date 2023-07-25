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
sap.ui.define(["../core/core", "./Query", "./SuggestionType", "./SuggestionCalculationMode", "./DataSourceType", "../core/errors"], function (core, ___Query, ___SuggestionType, ___SuggestionCalculationMode, ___DataSourceType, ___core_errors) {
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
  var SuggestionType = ___SuggestionType["SuggestionType"];
  var SuggestionCalculationMode = ___SuggestionCalculationMode["SuggestionCalculationMode"];
  var DataSourceSubType = ___DataSourceType["DataSourceSubType"];
  var DataSourceType = ___DataSourceType["DataSourceType"];
  var QueryIsReadOnlyError = ___core_errors["QueryIsReadOnlyError"];
  var SuggestionQuery = /*#__PURE__*/function (_Query) {
    _inherits(SuggestionQuery, _Query);
    var _super = _createSuper(SuggestionQuery);
    // _meta: {
    //     properties: {
    //         types: {
    //             default: function () {
    //                 return [SuggestionType.DataSource, SuggestionType.Object, SuggestionType.SearchTerm];
    //             },
    //             setter: true
    //         },
    //         calculationModes: {
    //             default: function () {
    //                 return [SuggestionCalculationMode.Data, SuggestionCalculationMode.History];
    //             },
    //             setter: true
    //         }
    //     }
    // },

    function SuggestionQuery(properties) {
      var _properties$types, _properties$calculati;
      var _this;
      _classCallCheck(this, SuggestionQuery);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "calculationModes", [SuggestionCalculationMode.Data, SuggestionCalculationMode.History]);
      _defineProperty(_assertThisInitialized(_this), "types", [SuggestionType.DataSource, SuggestionType.Object, SuggestionType.SearchTerm]);
      _this.types = (_properties$types = properties.types) !== null && _properties$types !== void 0 ? _properties$types : _this.types;
      _this.calculationModes = (_properties$calculati = properties.calculationModes) !== null && _properties$calculati !== void 0 ? _properties$calculati : _this.calculationModes;
      return _this;
    }
    _createClass(SuggestionQuery, [{
      key: "_formatResultSetAsync",
      value: function _formatResultSetAsync(resultSet) {
        try {
          const _this2 = this;
          var query = resultSet.query;
          if (query.types.indexOf(SuggestionType.Object) >= 0 && query.filter.dataSource.type === query.sina.DataSourceType.BusinessObject) {
            return _await(core.executeSequentialAsync(_this2.sina.suggestionResultSetFormatters, function (formatter) {
              return formatter.formatAsync(resultSet);
            }));
          }
          return _await(resultSet);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "setTypes",
      value: function setTypes(types) {
        this.types = types;
      }
    }, {
      key: "setCalculationModes",
      value: function setCalculationModes(calculationModes) {
        this.calculationModes = calculationModes;
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
        var clone = new SuggestionQuery({
          label: this.label,
          icon: this.icon,
          skip: this.skip,
          top: this.top,
          filter: this.filter.clone(),
          sortOrder: this.sortOrder,
          sina: this.sina,
          types: this.types,
          calculationModes: this.calculationModes
        });
        clone.types = this.types.slice();
        clone.calculationModes = this.calculationModes.slice();
        return clone;
      }
    }, {
      key: "equals",
      value: function equals(other) {
        if (!(other instanceof SuggestionQuery)) {
          return false;
        }
        if (!_get(_getPrototypeOf(SuggestionQuery.prototype), "equals", this).call(this, other)) {
          return false;
        }
        if (!other) {
          return false;
        }
        return core.equals(this.types, other.types, false) && core.equals(this.calculationModes, other.calculationModes, false);
      }
    }, {
      key: "_execute",
      value: function _execute(query) {
        try {
          const _this3 = this;
          return _await(_this3._doExecuteSuggestionQuery(query));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_doExecuteSuggestionQuery",
      value: function _doExecuteSuggestionQuery(query) {
        try {
          const _this4 = this;
          var transformedQuery = _this4._filteredQueryTransform(query);
          return _await(_this4.sina.provider.executeSuggestionQuery(transformedQuery), function (resultSet) {
            return _this4._filteredQueryBackTransform(query, resultSet);
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
        var filter;
        var _iterator = _createForOfIteratorHelper(resultSet.items),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var suggestion = _step.value;
            switch (suggestion.type) {
              case SuggestionType.SearchTerm:
                filter = query.filter.clone();
                filter.searchTerm = suggestion.filter.searchTerm;
                suggestion.filter = filter;
                break;
              case SuggestionType.Object:
                // do not backtransform datasource in object
                break;
              default:
                throw "program error, not supported suggestion type " + suggestion.type;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return resultSet;
      }
    }]);
    return SuggestionQuery;
  }(Query);
  var __exports = {
    __esModule: true
  };
  __exports.SuggestionQuery = SuggestionQuery;
  return __exports;
});
})();