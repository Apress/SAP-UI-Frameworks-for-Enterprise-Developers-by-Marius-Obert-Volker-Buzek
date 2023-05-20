/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SinaObject"], function (___SinaObject) {
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
  var SinaObject = ___SinaObject["SinaObject"];
  var NavigationTarget = /*#__PURE__*/function (_SinaObject) {
    _inherits(NavigationTarget, _SinaObject);
    var _super = _createSuper(NavigationTarget);
    // _meta: {
    //     properties: {
    //         targetUrl: {
    //             required: true
    //         },
    //         label: {
    //             required: true
    //         },
    //         target: { // as in <a href="" target="_blank">...</a>
    //             required: false
    //         }
    //     }
    // },

    function NavigationTarget(properties) {
      var _properties$targetUrl, _properties$targetFun, _properties$label, _properties$target, _properties$filter;
      var _this;
      _classCallCheck(this, NavigationTarget);
      _this = _super.call(this, properties);
      _this.targetUrl = (_properties$targetUrl = properties.targetUrl) !== null && _properties$targetUrl !== void 0 ? _properties$targetUrl : _this.targetUrl;
      _this.targetFunction = (_properties$targetFun = properties.targetFunction) !== null && _properties$targetFun !== void 0 ? _properties$targetFun : _this.targetFunction;
      _this.label = (_properties$label = properties.label) !== null && _properties$label !== void 0 ? _properties$label : _this.label;
      _this.target = (_properties$target = properties.target) !== null && _properties$target !== void 0 ? _properties$target : _this.target;
      _this.filter = (_properties$filter = properties.filter) !== null && _properties$filter !== void 0 ? _properties$filter : _this.filter;
      return _this;
    }
    _createClass(NavigationTarget, [{
      key: "performNavigation",
      value: function performNavigation(params) {
        params = params || {};
        var trackingOnly = params.trackingOnly || false;
        if (this.targetFunction) {
          var _params;
          // does not navigate automatically, because href of sap.m.Link is initial
          this.targetFunction((_params = params) === null || _params === void 0 ? void 0 : _params.event, this.filter);
        } else if (!trackingOnly) {
          if (this.target) {
            window.open(this.targetUrl, this.target, "noopener,noreferrer");
          } else {
            window.open(this.targetUrl, "_blank", "noopener,noreferrer");
          }
        }
      }
    }, {
      key: "isEqualTo",
      value: function isEqualTo(otherNavigationObject) {
        if (!otherNavigationObject) {
          return false;
        }
        return this.targetUrl == otherNavigationObject.targetUrl;
      }
    }]);
    return NavigationTarget;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.NavigationTarget = NavigationTarget;
  return __exports;
});
})();