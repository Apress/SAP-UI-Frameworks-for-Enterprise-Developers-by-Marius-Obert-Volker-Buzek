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
  var ObjectConfigurator = /*#__PURE__*/function (_Configurator) {
    _inherits(ObjectConfigurator, _Configurator);
    var _super = _createSuper(ObjectConfigurator);
    function ObjectConfigurator() {
      _classCallCheck(this, ObjectConfigurator);
      return _super.apply(this, arguments);
    }
    _createClass(ObjectConfigurator, [{
      key: "initAsync",
      value: function initAsync() {
        try {
          const _this = this;
          _this.properties = [];
          var promises = [];
          for (var i = 0; i < _this.type.properties.length; ++i) {
            var property = _this.type.properties[i];
            var propertyConfiguration = _this.configuration[property.name];
            if (!propertyConfiguration) {
              continue;
            }
            promises.push(_this.createPropertyConfiguratorAsync(property, propertyConfiguration));
          }
          return Promise.all(promises);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "createPropertyConfiguratorAsync",
      value: function createPropertyConfiguratorAsync(property, propertyConfiguration) {
        try {
          const _this2 = this;
          return _await(_this2.createConfiguratorAsync({
            type: property.type,
            typeContext: property,
            configuration: propertyConfiguration
          }).then(function (configurator) {
            this.properties.push({
              name: property.name,
              configurator: configurator
            });
          }.bind(_this2)));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "isSuitable",
      value: function isSuitable(options) {
        if (core.isObject(options.configuration) && core.isObject(options.type) && options.type.type === "object") {
          return true;
        }
      }
    }, {
      key: "configure",
      value: function configure(obj, ctx) {
        ctx = this.createContext(ctx, obj);
        this.object = obj;
        for (var i = 0; i < this.properties.length; ++i) {
          var property = this.properties[i];
          obj[property.name] = property.configurator.configure(obj[property.name], ctx);
        }
        return obj;
      }
    }, {
      key: "configureAsync",
      value: function configureAsync(obj, ctx) {
        try {
          const _this3 = this;
          ctx = _this3.createContext(ctx, obj);
          _this3.object = obj;
          var configureProperty = function configureProperty(property) {
            return Promise.resolve().then(function () {
              return property.configurator.configureAsync(obj[property.name], ctx);
            }).then(function (value) {
              obj[property.name] = value;
            });
          };
          return Promise.all(_this3.properties.map(configureProperty)).then(function () {
            return obj;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return ObjectConfigurator;
  }(Configurator);
  var __exports = {
    __esModule: true
  };
  __exports.ObjectConfigurator = ObjectConfigurator;
  return __exports;
});
})();