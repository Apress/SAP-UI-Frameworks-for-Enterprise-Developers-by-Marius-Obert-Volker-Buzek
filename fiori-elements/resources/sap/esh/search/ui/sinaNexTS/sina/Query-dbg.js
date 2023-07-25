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
sap.ui.define(["../core/core", "../core/util", "./SinaObject", "./Filter", "./LogicalOperator", "../core/errors", "./FilteredDataSource"], function (core, util, ___SinaObject, ___Filter, ___LogicalOperator, ___core_errors, ___FilteredDataSource) {
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
  var SinaObject = ___SinaObject["SinaObject"];
  var Filter = ___Filter["Filter"];
  var LogicalOperator = ___LogicalOperator["LogicalOperator"];
  var QueryIsReadOnlyError = ___core_errors["QueryIsReadOnlyError"];
  var FilteredDataSource = ___FilteredDataSource["FilteredDataSource"];
  var Query = /*#__PURE__*/function (_SinaObject) {
    _inherits(Query, _SinaObject);
    var _super = _createSuper(Query);
    // _meta: {
    //     properties: {
    //         filter: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.createFilter();
    //             }
    //         },
    //         top: {
    //             required: false,
    //             default: 10,
    //             setter: true
    //         },
    //         skip: {
    //             required: false,
    //             default: 0,
    //             setter: true
    //         },
    //         sortOrder: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             },
    //             setter: true
    //         }
    //     }
    // }

    function Query(properties) {
      var _properties$top, _properties$skip, _properties$sortOrder, _ref, _properties$filter;
      var _this;
      _classCallCheck(this, Query);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "requestTimeout", false);
      _this.top = (_properties$top = properties.top) !== null && _properties$top !== void 0 ? _properties$top : 10;
      _this.skip = (_properties$skip = properties.skip) !== null && _properties$skip !== void 0 ? _properties$skip : 0;
      _this.sortOrder = (_properties$sortOrder = properties.sortOrder) !== null && _properties$sortOrder !== void 0 ? _properties$sortOrder : [];
      _this.filter = (_ref = (_properties$filter = properties.filter) !== null && _properties$filter !== void 0 ? _properties$filter : _this.filter) !== null && _ref !== void 0 ? _ref : new Filter({
        sina: _this.sina
      });
      _this.icon = properties.icon;
      _this.label = properties.label;
      if (properties.dataSource) {
        _this.filter.setDataSource(properties.dataSource);
      }
      if (properties.searchTerm) {
        _this.filter.setSearchTerm(properties.searchTerm);
      }
      if (properties.rootCondition) {
        _this.filter.setRootCondition(properties.rootCondition);
      }
      if (_this.requestTimeout) {
        // this._execute = util.timeoutDecorator(this._execute, this.requestTimeout);
      }
      _this._execute = util.refuseOutdatedResponsesDecorator(_this._execute);
      return _this;
    }
    _createClass(Query, [{
      key: "setTop",
      value: function setTop() {
        var top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
        this.top = top;
      }
    }, {
      key: "setSkip",
      value: function setSkip() {
        var skip = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        this.skip = skip;
      }
    }, {
      key: "setSortOrder",
      value: function setSortOrder(sortOrder) {
        this.sortOrder = sortOrder;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, {
      key: "_execute",
      value: function _execute() {
        try {
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "clone",
      value: function clone() {
        return;
      }
    }, {
      key: "equals",
      value: function equals(other) {
        return other instanceof Query && this.icon === other.icon && this.label === other.label && this.top === other.top && this.skip === other.skip && this.filter.equals(other.filter) && core.equals(this.sortOrder, other.sortOrder);
      }
    }, {
      key: "abort",
      value: function abort() {
        // TODO: Promise has no abort
        // this._execute.abort(); // call abort on decorator
      }
    }, {
      key: "getResultSetAsync",
      value: function getResultSetAsync() {
        try {
          const _this2 = this;
          if (_this2._lastQuery) {
            // if query has not changed -> return existing result set
            if (_this2.equals(_this2._lastQuery
            // EqualsMode.CheckFireQuery
            )) {
              return _await(_this2._resultSetPromise);
            }

            // filter changed -> set skip=0
            if (!_this2.filter.equals(_this2._lastQuery.filter)) {
              _this2.setSkip(0);
            }
          }

          // create a read only clone
          _this2._lastQuery = _this2._createReadOnlyClone();

          // delegate to subclass implementation
          var resultSet;
          _this2._resultSetPromise = Promise.resolve().then(function () {
            return this._execute(this._lastQuery);
          }.bind(_this2)).then(function (iResultSet) {
            resultSet = iResultSet;
            return this._formatResultSetAsync(resultSet); // formatter modifies result set
          }.bind(_this2)).then(function () {
            return resultSet;
          }.bind(_this2));
          return _await(_this2._resultSetPromise);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "_genericFilteredQueryTransform",
      value: function _genericFilteredQueryTransform(query) {
        // check for filtered datasource
        if (!(query.filter.dataSource instanceof FilteredDataSource)) {
          return query;
        }
        // assemble root conditon of transformed query
        var rootCondition;
        if (query.filter.dataSource.filterCondition) {
          if (query.filter.rootCondition.conditions.length > 0) {
            rootCondition = this.sina.createComplexCondition({
              operator: LogicalOperator.And,
              conditions: [query.filter.dataSource.filterCondition, query.filter.rootCondition]
            });
          } else {
            rootCondition = query.filter.dataSource.filterCondition;
          }
        } else {
          rootCondition = query.filter.rootCondition;
        }
        // create transformed query
        var filter = this.sina.createFilter({
          dataSource: query.filter.dataSource.dataSource,
          searchTerm: query.filter.searchTerm,
          rootCondition: rootCondition
        });
        var transformedQuery = query.clone();
        transformedQuery.filter = filter; // do not call setter because this would invalidate top and skip
        return transformedQuery;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }, {
      key: "_formatResultSetAsync",
      value: function _formatResultSetAsync(resultSet) {
        return Promise.resolve();
      }
    }, {
      key: "_setResultSet",
      value: function _setResultSet(resultSet) {
        this._lastQuery = this._createReadOnlyClone();
        this._resultSetPromise = Promise.resolve().then(function () {
          return this._formatResultSetAsync(resultSet);
        }.bind(this)).then(function () {
          return resultSet;
        });
        return this._resultSetPromise;
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
      key: "resetResultSet",
      value: function resetResultSet() {
        this._lastQuery = null;
        this._resultSetPromise = null;
      }
    }, {
      key: "getSearchTerm",
      value: function getSearchTerm() {
        return this.filter.searchTerm;
      }
    }, {
      key: "getDataSource",
      value: function getDataSource() {
        return this.filter.dataSource;
      }
    }, {
      key: "getRootCondition",
      value: function getRootCondition() {
        return this.filter.rootCondition;
      }
    }, {
      key: "setSearchTerm",
      value: function setSearchTerm(searchTerm) {
        this.filter.setSearchTerm(searchTerm);
      }
    }, {
      key: "setDataSource",
      value: function setDataSource(dataSource) {
        this.filter.setDataSource(dataSource);
      }
    }, {
      key: "setRootCondition",
      value: function setRootCondition(rootCondition) {
        this.filter.setRootCondition(rootCondition);
      }
    }, {
      key: "resetConditions",
      value: function resetConditions() {
        this.filter.resetConditions();
      }
    }, {
      key: "autoInsertCondition",
      value: function autoInsertCondition(condition) {
        this.filter.autoInsertCondition(condition);
      }
    }, {
      key: "autoRemoveCondition",
      value: function autoRemoveCondition(condition) {
        this.filter.autoRemoveCondition(condition);
      }
    }, {
      key: "setFilter",
      value: function setFilter(filter) {
        if (!this.filter.equals(filter)) {
          this.setSkip(0);
        }
        this.filter = filter;
      }
    }]);
    return Query;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.Query = Query;
  return __exports;
});
})();