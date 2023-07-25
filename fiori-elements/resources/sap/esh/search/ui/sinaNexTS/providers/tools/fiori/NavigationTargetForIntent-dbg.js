/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../../sina/NavigationTarget"], function (_____sina_NavigationTarget) {
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
  var NavigationTarget = _____sina_NavigationTarget["NavigationTarget"];
  var _oCrossAppNav;
  if (typeof window !== "undefined" && typeof window.sap !== "undefined" && window.sap.ushell && window.sap.ushell.Container && window.sap.ushell.Container.getServiceAsync) {
    var oContainer = window.sap.ushell.Container;
    oContainer.getServiceAsync("SmartNavigation").then(function (service) {
      _oCrossAppNav = service;
    })["catch"](function () {
      oContainer.getServiceAsync("CrossApplicationNavigation").then(function (service) {
        _oCrossAppNav = service;
      });
    });
  }
  var NavigationTargetForIntent = /*#__PURE__*/function (_NavigationTarget) {
    _inherits(NavigationTargetForIntent, _NavigationTarget);
    var _super = _createSuper(NavigationTargetForIntent);
    // _meta: {
    //     properties: {
    //         externalTarget: {
    //             required: true
    //         },
    //         systemId: {
    //             required: false
    //         },
    //         client: {
    //             required: false
    //         }
    //     }
    // }

    function NavigationTargetForIntent(properties) {
      var _properties$externalT, _properties$systemId, _properties$client;
      var _this;
      _classCallCheck(this, NavigationTargetForIntent);
      _this = _super.call(this, properties);
      _this.externalTarget = (_properties$externalT = properties.externalTarget) !== null && _properties$externalT !== void 0 ? _properties$externalT : _this.externalTarget;
      _this.systemId = (_properties$systemId = properties.systemId) !== null && _properties$systemId !== void 0 ? _properties$systemId : _this.systemId;
      _this.client = (_properties$client = properties.client) !== null && _properties$client !== void 0 ? _properties$client : _this.client;
      return _this;
    }
    _createClass(NavigationTargetForIntent, [{
      key: "performNavigation",
      value: function performNavigation(params) {
        params = params || {};
        var suppressTracking = params.suppressTracking || false;
        var trackingOnly = params.trackingOnly || false;
        if (_oCrossAppNav) {
          if (!suppressTracking) {
            this._trackNavigation();
          }
          if (!trackingOnly) {
            _oCrossAppNav.toExternal(this.externalTarget);
          }
        } else {
          // eslint-disable-next-line prefer-rest-params
          NavigationTarget.prototype.performNavigation.apply(this, arguments);
        }
      }
    }, {
      key: "_trackNavigation",
      value: function _trackNavigation() {
        if (_oCrossAppNav && _oCrossAppNav.trackNavigation) {
          _oCrossAppNav.trackNavigation({
            target: this.externalTarget.target
          });
        }
      }
    }]);
    return NavigationTargetForIntent;
  }(NavigationTarget);
  var __exports = {
    __esModule: true
  };
  __exports.NavigationTargetForIntent = NavigationTargetForIntent;
  return __exports;
});
})();