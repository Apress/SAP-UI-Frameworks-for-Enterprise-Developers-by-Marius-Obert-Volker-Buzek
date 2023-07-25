/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SearchResultSetItemAttributeBase"], function (___SearchResultSetItemAttributeBase) {
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var SearchResultSetItemAttributeBase = ___SearchResultSetItemAttributeBase["SearchResultSetItemAttributeBase"];
  var SearchResultSetItemAttribute = /*#__PURE__*/function (_SearchResultSetItemA) {
    _inherits(SearchResultSetItemAttribute, _SearchResultSetItemA);
    var _super = _createSuper(SearchResultSetItemAttribute);
    // _meta: {
    //     properties: {
    //         label: {
    //             required: true
    //         },
    //         value: {
    //             required: true
    //         },
    //         valueFormatted: {
    //             required: false
    //         },
    //         valueHighlighted: {
    //             required: false
    //         },
    //         isHighlighted: {
    //             required: true
    //         },
    //         unitOfMeasure: {
    //             required: false
    //         },
    //         description: {
    //             required: false
    //         },
    //         defaultNavigationTarget: {
    //             required: false,
    //             aggregation: true
    //         },
    //         navigationTargets: {
    //             required: false,
    //             aggregation: true
    //         }
    //     }
    // },

    function SearchResultSetItemAttribute(properties) {
      var _this;
      _classCallCheck(this, SearchResultSetItemAttribute);
      _this = _super.call(this, properties);
      _this.value = properties.value;
      _this.valueFormatted = properties.valueFormatted;
      _this.valueHighlighted = properties.valueHighlighted;
      _this.isHighlighted = properties.isHighlighted;
      _this.unitOfMeasure = properties.unitOfMeasure;
      _this.description = properties.description;
      _this.defaultNavigationTarget = properties.defaultNavigationTarget;
      _this.navigationTargets = properties.navigationTargets;
      _this.metadata = properties.metadata;
      _this.iconUrl = properties.iconUrl;
      return _this;
    }
    _createClass(SearchResultSetItemAttribute, [{
      key: "toString",
      value: function toString() {
        return this.label + ":" + this.valueFormatted;
      }
    }, {
      key: "getSubAttributes",
      value: function getSubAttributes() {
        return [this];
      }
    }]);
    return SearchResultSetItemAttribute;
  }(SearchResultSetItemAttributeBase);
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSetItemAttribute = SearchResultSetItemAttribute;
  return __exports;
});
})();