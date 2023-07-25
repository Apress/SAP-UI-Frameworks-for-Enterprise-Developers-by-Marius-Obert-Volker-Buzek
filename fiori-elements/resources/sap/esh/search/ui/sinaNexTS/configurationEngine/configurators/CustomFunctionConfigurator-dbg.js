/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/core", "./Configurator"], function (core, ___Configurator) {
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
  var Configurator = ___Configurator["Configurator"];
  var CustomFunctionConfigurator = /*#__PURE__*/function (_Configurator) {
    _inherits(CustomFunctionConfigurator, _Configurator);
    var _super = _createSuper(CustomFunctionConfigurator);
    function CustomFunctionConfigurator() {
      _classCallCheck(this, CustomFunctionConfigurator);
      return _super.apply(this, arguments);
    }
    _createClass(CustomFunctionConfigurator, [{
      key: "initAsync",
      value: function initAsync() {
        if (core.isObject(this.configuration)) {
          this.customFunction = this.configuration.func;
          this.force = this.configuration.force;
          return;
        }
        this.customFunction = this.configuration;
        this.force = false;
      }
    }, {
      key: "isSuitable",
      value: function isSuitable(options) {
        if (core.isFunction(options.configuration)) {
          return true;
        }
        if (core.isObject(options.configuration) && Object.prototype.hasOwnProperty.call(options.configuration, "func")) {
          return true;
        }
      }
    }, {
      key: "configure",
      value: function configure(value, ctx) {
        if (this.isInitialOrForced(value)) {
          return this.customFunction(value, ctx);
        }
        return value;
      }
    }]);
    return CustomFunctionConfigurator;
  }(Configurator);
  var __exports = {
    __esModule: true
  };
  __exports.CustomFunctionConfigurator = CustomFunctionConfigurator;
  return __exports;
});
})();