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
  var ListConfigurator = /*#__PURE__*/function (_Configurator) {
    _inherits(ListConfigurator, _Configurator);
    var _super = _createSuper(ListConfigurator);
    function ListConfigurator() {
      _classCallCheck(this, ListConfigurator);
      return _super.apply(this, arguments);
    }
    _createClass(ListConfigurator, [{
      key: "initAsync",
      value: function initAsync() {
        // create configurator for each list element in configuration
        this.elements = [];
        this.cache = {};
        var promises = [];
        for (var i = 0; i < this.configuration.length; ++i) {
          var elementConfiguration = this.configuration[i];
          promises.push(this.createElementConfiguratorAsync(this.type, elementConfiguration, i));
        }
        return Promise.all(promises);
      }
    }, {
      key: "isSuitable",
      value: function isSuitable(options) {
        if (options.typeContext && options.typeContext.multiple && core.isList(options.configuration)) {
          return true;
        }
      }
    }, {
      key: "createElementConfiguratorAsync",
      value: function createElementConfiguratorAsync(type, configuration, id) {
        return this.createConfiguratorAsync({
          type: type,
          configuration: configuration
        }).then(function (configurator) {
          this.elements.push({
            configuration: configuration,
            configurator: configurator,
            id: id
          });
        }.bind(this));
      }
    }, {
      key: "getElement",
      value: function getElement(listElement) {
        var id = this.typeContext.getElementId(listElement);
        var element = this.cache[id];
        if (element) {
          return element;
        }
        for (var i = 0; i < this.elements.length; ++i) {
          element = this.elements[i];
          if (this.matchId(listElement, element)) {
            this.cache[id] = element;
            return element;
          }
        }
      }
    }, {
      key: "matchId",
      value: function matchId(listElement, element) {
        var listElementId = this.typeContext.getElementId(listElement);
        var elementId = this.typeContext.getElementId(element.configuration);
        var match;
        if (core.isObject(elementId) && Object.prototype.hasOwnProperty.call(elementId, "regExp")) {
          // regexp compare
          if (!elementId.regExpObj) {
            elementId.regExpObj = new RegExp(elementId.regExp, elementId.regExpFlags);
          }
          match = elementId.regExpObj.test(listElementId);
        } else {
          // simple compare
          match = listElementId === elementId;
        }
        return match;
      }
    }, {
      key: "createEmptyUsedElements",
      value: function createEmptyUsedElements() {
        var usedElements = [];
        for (var i = 0; i < this.elements.length; ++i) {
          usedElements.push(false);
        }
        return usedElements;
      }
    }, {
      key: "configure",
      value: function configure(list, ctx) {
        // check input parameters and initialization
        if (!list) {
          list = [];
        }
        ctx = this.createContext(ctx, list);
        var usedElements = this.createEmptyUsedElements();
        var element, listElement, newListElement;

        // configure list elements
        for (var i = 0; i < list.length; ++i) {
          listElement = list[i];
          element = this.getElement(listElement);
          if (!element) {
            continue;
          }
          var configuredListElement = element.configurator.configure(listElement, ctx);
          if (configuredListElement !== listElement) {
            list[i] = configuredListElement;
          }
          usedElements[element.id] = {
            index: i
          };
        }

        // create new list elements
        var lastUsedElement;
        var numberInserted = 0;
        if (this.typeContext.createElement) {
          for (var j = 0; j < usedElements.length; ++j) {
            var usedElement = usedElements[j];
            element = this.elements[j];
            if (usedElement) {
              lastUsedElement = usedElement;
              continue;
            }
            var templateListElement = this.typeContext.createElement(element.configuration, ctx);
            newListElement = element.configurator.configure(templateListElement, ctx);
            var insertIndex = (lastUsedElement ? lastUsedElement.index : -1) + numberInserted + 1;
            list.splice(insertIndex, 0, newListElement);
            numberInserted++;
            if (this.typeContext.postProcessCreatedElement) {
              this.typeContext.postProcessCreatedElement(newListElement, ctx);
            }
          }
        }
        return list;
      }
    }, {
      key: "configureAsync",
      value: function configureAsync(list, ctx) {
        // check input parameters and init
        if (!list) {
          list = [];
        }
        ctx = this.createContext(ctx, list);
        var usedElements = this.createEmptyUsedElements();
        var lastUsedElement;
        var numberInserted = 0;

        // configure list element
        var configureListElement = function (listIndex) {
          if (listIndex >= list.length) {
            return null;
          }
          var listElement = list[listIndex];
          var element = this.getElement(listElement);
          if (!element) {
            return configureListElement(listIndex + 1);
          }
          usedElements[element.id] = {
            index: listIndex
          };
          return Promise.resolve().then(function () {
            return element.configurator.configureAsync(listElement, ctx);
          }).then(function (configuredListElement) {
            if (configuredListElement !== listElement) {
              list[listIndex] = configuredListElement;
            }
            return configureListElement(listIndex + 1);
          });
        }.bind(this);

        // create new list element
        var createNewListElement = function (elementIndex) {
          if (elementIndex >= this.elements.length) {
            return null;
          }
          var element = this.elements[elementIndex];
          var usedElement = usedElements[elementIndex];
          if (usedElement) {
            lastUsedElement = usedElement;
            return createNewListElement(elementIndex + 1);
          }
          var templateListElement = this.typeContext.createElement(element.configuration, ctx);
          return Promise.resolve().then(function () {
            return element.configurator.configureAsync(templateListElement, ctx);
          }).then(function (newListElement) {
            var insertIndex = (lastUsedElement ? lastUsedElement.index : -1) + numberInserted + 1;
            list.splice(insertIndex, 0, newListElement);
            numberInserted++;
            if (this.typeContext.postProcessCreatedElement) {
              this.typeContext.postProcessCreatedElement(newListElement, ctx);
            }
            return createNewListElement(elementIndex + 1);
          }.bind(this));
        }.bind(this);

        // start recursions
        return Promise.resolve().then(function () {
          // start recursion for configuration of existing list elements
          return configureListElement(0);
        }).then(function () {
          // start recursion for creating and configuring new list elements
          if (!this.typeContext.createElement) {
            return null;
          }
          return createNewListElement(0);
        }.bind(this)).then(function () {
          return list;
        });
      }
    }]);
    return ListConfigurator;
  }(Configurator);
  var __exports = {
    __esModule: true
  };
  __exports.ListConfigurator = ListConfigurator;
  return __exports;
});
})();