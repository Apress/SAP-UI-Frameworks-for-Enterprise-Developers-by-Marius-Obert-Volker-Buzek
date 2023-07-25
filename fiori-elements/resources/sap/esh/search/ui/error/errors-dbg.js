/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n"], function (__i18n) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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
  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;
      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }
      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);
        _cache.set(Class, Wrapper);
      }
      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }
      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };
    return _wrapNativeSuper(Class);
  }
  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct.bind();
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }
    return _construct.apply(null, arguments);
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
  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
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
  var i18n = _interopRequireDefault(__i18n);
  var ESHUIError = /*#__PURE__*/function (_Error) {
    _inherits(ESHUIError, _Error);
    var _super = _createSuper(ESHUIError);
    function ESHUIError(properties) {
      var _this;
      _classCallCheck(this, ESHUIError);
      _this = _super.call(this, properties.message);
      if (properties.message) {
        _this.message = properties.message;
      }
      if (properties.previous) {
        _this.previous = properties.previous;
      }
      _this.name = properties.name || "ESHUIError";
      _this.solution = properties.solution || i18n.getText("error.solution");
      return _this;
    }
    return _createClass(ESHUIError);
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  var ESHUIConstructionError = /*#__PURE__*/function (_ESHUIError) {
    _inherits(ESHUIConstructionError, _ESHUIError);
    var _super2 = _createSuper(ESHUIConstructionError);
    function ESHUIConstructionError(previousError) {
      _classCallCheck(this, ESHUIConstructionError);
      var name = "ESHUIConstructionError";
      var message = i18n.getText("error.ESHUIConstructionError.message");
      return _super2.call(this, {
        name: name,
        message: message,
        previous: previousError
      });
    }
    return _createClass(ESHUIConstructionError);
  }(ESHUIError);
  var ConfigurationExitError = /*#__PURE__*/function (_ESHUIError2) {
    _inherits(ConfigurationExitError, _ESHUIError2);
    var _super3 = _createSuper(ConfigurationExitError);
    function ConfigurationExitError(customerExitName, applicationComponent, previousError) {
      _classCallCheck(this, ConfigurationExitError);
      var name = i18n.getText("error.ConfigurationExitError.title");
      var message = i18n.getText("error.ConfigurationExitError.message", [customerExitName]);
      var solution = i18n.getText("error.ConfigurationExitError.solution", [applicationComponent]);
      return _super3.call(this, {
        name: name,
        message: message,
        solution: solution,
        previous: previousError
      });
    }
    return _createClass(ConfigurationExitError);
  }(ESHUIError);
  var UnknownDataSourceType = /*#__PURE__*/function (_ESHUIError3) {
    _inherits(UnknownDataSourceType, _ESHUIError3);
    var _super4 = _createSuper(UnknownDataSourceType);
    function UnknownDataSourceType(previousError) {
      _classCallCheck(this, UnknownDataSourceType);
      var name = "UnknownDataSourceType";
      var message = i18n.getText("error.UnknownDataSourceType.message");
      var solution = i18n.getText("error.UnknownDataSourceType.solution");
      return _super4.call(this, {
        name: name,
        message: message,
        solution: solution,
        previous: previousError
      });
    }
    return _createClass(UnknownDataSourceType);
  }(ESHUIError);
  var UnknownFacetType = /*#__PURE__*/function (_ESHUIError4) {
    _inherits(UnknownFacetType, _ESHUIError4);
    var _super5 = _createSuper(UnknownFacetType);
    function UnknownFacetType(previousError) {
      _classCallCheck(this, UnknownFacetType);
      var name = "UnknownFacetType";
      var message = i18n.getText("error.UnknownFacetType.message");
      var solution = i18n.getText("error.UnknownFacetType.solution");
      return _super5.call(this, {
        name: name,
        message: message,
        solution: solution,
        previous: previousError
      });
    }
    return _createClass(UnknownFacetType);
  }(ESHUIError);
  var ProgramError = /*#__PURE__*/function (_ESHUIError5) {
    _inherits(ProgramError, _ESHUIError5);
    var _super6 = _createSuper(ProgramError);
    function ProgramError(previousError, message) {
      _classCallCheck(this, ProgramError);
      var name = "ProgramError";
      var solution = i18n.getText("error.TypeError.solution");
      return _super6.call(this, {
        name: name,
        message: message || i18n.getText("error.TypeError.message"),
        solution: solution,
        previous: previousError
      });
    }
    return _createClass(ProgramError);
  }(ESHUIError);
  var module = {
    ESHUIConstructionError: ESHUIConstructionError,
    ConfigurationExitError: ConfigurationExitError,
    UnknownDataSourceType: UnknownDataSourceType,
    UnknownFacetType: UnknownFacetType,
    ProgramError: ProgramError
  };
  return module;
});
})();