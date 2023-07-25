/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./ResultSet"], function (___ResultSet) {
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
  var ResultSet = ___ResultSet["ResultSet"];
  var SearchResultSet = /*#__PURE__*/function (_ResultSet) {
    _inherits(SearchResultSet, _ResultSet);
    var _super = _createSuper(SearchResultSet);
    // _meta: {
    //     properties: {
    //         facets: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         },
    //         totalCount: {
    //             required: true
    //         },
    //         nlqSuccess: {
    //             required: false,
    //             default: false
    //         }
    //     }
    // },

    function SearchResultSet(properties) {
      var _properties$facets, _properties$totalCoun, _properties$nlqSucces, _properties$hierarchy;
      var _this;
      _classCallCheck(this, SearchResultSet);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "facets", []);
      _defineProperty(_assertThisInitialized(_this), "nlqSuccess", false);
      _defineProperty(_assertThisInitialized(_this), "hierarchyNodePaths", []);
      _this.facets = (_properties$facets = properties.facets) !== null && _properties$facets !== void 0 ? _properties$facets : _this.facets;
      _this.totalCount = (_properties$totalCoun = properties.totalCount) !== null && _properties$totalCoun !== void 0 ? _properties$totalCoun : _this.totalCount;
      _this.nlqSuccess = (_properties$nlqSucces = properties.nlqSuccess) !== null && _properties$nlqSucces !== void 0 ? _properties$nlqSucces : _this.nlqSuccess;
      _this.hierarchyNodePaths = (_properties$hierarchy = properties.hierarchyNodePaths) !== null && _properties$hierarchy !== void 0 ? _properties$hierarchy : _this.hierarchyNodePaths;
      return _this;
    }
    _createClass(SearchResultSet, [{
      key: "toString",
      value: function toString() {
        var result = [];
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        result.push(ResultSet.prototype.toString.apply(this, args));
        for (var i = 0; i < this.facets.length; ++i) {
          var facet = this.facets[i];
          result.push(facet.toString());
        }
        return result.join("\n");
      }
    }]);
    return SearchResultSet;
  }(ResultSet);
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSet = SearchResultSet;
  return __exports;
});
})();