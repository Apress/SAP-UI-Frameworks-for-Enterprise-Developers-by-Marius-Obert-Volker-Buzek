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
sap.ui.define(["../../core/core"], function (core) {
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
  var Configurator = /*#__PURE__*/function () {
    function Configurator(options) {
      _classCallCheck(this, Configurator);
      this.type = options.type;
      this.typeContext = options.typeContext;
      this.configuration = options.configuration;
      this.createConfiguratorAsync = options.createConfiguratorAsync;
    }
    _createClass(Configurator, [{
      key: "createContext",
      value: function createContext(oldCtx, obj) {
        if (!oldCtx) {
          return {
            objectStack: [obj],
            configuratorStack: [this]
          };
        }
        var objectStack = oldCtx.objectStack.slice();
        objectStack.push(obj);
        var configuratorStack = oldCtx.configuratorStack.slice();
        configuratorStack.push(this);
        return {
          objectStack: objectStack,
          configuratorStack: configuratorStack
        };
      }
    }, {
      key: "getResourceBundle",
      value: function getResourceBundle(ctx) {
        for (var i = ctx.configuratorStack.length - 1; i >= 0; --i) {
          var configurator = ctx.configuratorStack[i];
          if (configurator.resourceBundle) {
            return configurator.resourceBundle;
          }
        }
      }
    }, {
      key: "getEvaluateTemplateFunction",
      value: function getEvaluateTemplateFunction(ctx) {
        var createFunction = function createFunction(evaluateTemplate, obj) {
          return function (template) {
            return evaluateTemplate(template, obj);
          };
        };
        for (var i = ctx.configuratorStack.length - 1; i >= 0; --i) {
          var configurator = ctx.configuratorStack[i];
          var obj = ctx.objectStack[i];
          if (configurator.type && configurator.type.evaluateTemplate) {
            return createFunction(configurator.type.evaluateTemplate, obj);
          }
        }
      }
    }, {
      key: "initResourceBundleAsync",
      value: function initResourceBundleAsync() {
        if (!this.configuration.resourceBundle) {
          return undefined;
        }
        return this.loadResourceBundleAsync(this.configuration.resourceBundle).then(function (resourceBundle) {
          this.resourceBundle = resourceBundle;
        }.bind(this));
      }
    }, {
      key: "loadResourceBundleAsync",
      value: function loadResourceBundleAsync(url) {
        var _window, _window$sap, _window$sap$base, _window$sap$base$i18n;
        // for test mode
        if (typeof window === "undefined" || !((_window = window) !== null && _window !== void 0 && (_window$sap = _window.sap) !== null && _window$sap !== void 0 && (_window$sap$base = _window$sap.base) !== null && _window$sap$base !== void 0 && (_window$sap$base$i18n = _window$sap$base.i18n) !== null && _window$sap$base$i18n !== void 0 && _window$sap$base$i18n.ResourceBundle)) {
          return Promise.resolve({
            getText: function getText(id) {
              return id;
            }
          });
        }
        sap.ui.require(["sap/base/i18n/ResourceBundle"], function (ResourceBundle) {
          return ResourceBundle.create({
            // specify url of the base .properties file
            url: url,
            async: true
          });
        });
      }
    }, {
      key: "configureAsync",
      value: function configureAsync(value, ctx) {
        try {
          const _this = this;
          return _await(_this.configure(value, ctx));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "isInitialOrForced",
      value: function isInitialOrForced(value) {
        if (this.force || typeof value === "undefined" || core.isObject(value) && value === null || core.isString(value) && value.length === 0) {
          return true;
        }
        return false;
      }
    }]);
    return Configurator;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.Configurator = Configurator;
  return __exports;
});
})();