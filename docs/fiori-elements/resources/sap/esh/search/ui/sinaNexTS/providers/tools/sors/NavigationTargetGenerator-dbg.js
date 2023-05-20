/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../../core/util", "../../../core/core", "./JoinConditions", "../../../sina/SinaObject"], function (util, core, ___JoinConditions, _____sina_SinaObject) {
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
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
  var JoinConditions = ___JoinConditions["JoinConditions"];
  var SinaObject = _____sina_SinaObject["SinaObject"];
  var NavigationTargetGenerator = /*#__PURE__*/function (_SinaObject) {
    _inherits(NavigationTargetGenerator, _SinaObject);
    var _super = _createSuper(NavigationTargetGenerator);
    function NavigationTargetGenerator(properties) {
      var _this;
      _classCallCheck(this, NavigationTargetGenerator);
      _this = _super.call(this, properties);
      _this.active = _this.checkActive();
      _this.getPropertyMetadata = properties.getPropertyMetadata;
      _this.urlPrefix = properties.urlPrefix;
      _this.navigationTargetTemplatesInitialized = false;
      _this.navigationTargetTemplatesMap = {};
      _this.objectTypeMap = {};
      _this.ignoredSemanticObjectTypes = {
        LastChangedByUser: true,
        CreationDate: true,
        CreatedByUser: true
      };
      return _this;
    }
    _createClass(NavigationTargetGenerator, [{
      key: "checkActive",
      value: function checkActive() {
        var sors = util.getUrlParameter("sors");
        if (sors === "true") {
          return true;
        }
        return false;
      }
    }, {
      key: "cleanup",
      value: function cleanup() {
        this.objectTypeMap = null;
      }
    }, {
      key: "registerObjectType",
      value: function registerObjectType(objectTypeMetadata) {
        if (!this.active) {
          return;
        }
        var metadata = {
          type: objectTypeMetadata.type,
          label: objectTypeMetadata.label,
          propertyMap: {}
        };
        this.objectTypeMap[objectTypeMetadata.type] = metadata;
        for (var i = 0; i < objectTypeMetadata.properties.length; ++i) {
          var property = objectTypeMetadata.properties[i];
          var propertyMetadata = this.getPropertyMetadata(property);
          this.filterSemanticObjectType(propertyMetadata);
          metadata.propertyMap[propertyMetadata.name] = propertyMetadata;
        }
      }
    }, {
      key: "filterSemanticObjectType",
      value: function filterSemanticObjectType(property) {
        if (this.ignoredSemanticObjectTypes[property.semanticObjectType]) {
          delete property.semanticObjectType;
        }
      }
    }, {
      key: "finishRegistration",
      value: function finishRegistration() {
        if (!this.active) {
          return;
        }
        this.calculateNavigationTargetTemplates();
      }
    }, {
      key: "calculateNavigationTargetTemplates",
      value: function calculateNavigationTargetTemplates() {
        if (this.navigationTargetTemplatesInitialized) {
          return;
        }
        var joinConditionsMap = this.collectJoinConditions();
        this.navigationTargetTemplatesMap = this.createNavTargetTemplatesFromJoinConditions(joinConditionsMap);
        this.cleanup();
        this.navigationTargetTemplatesInitialized = true;
      }
    }, {
      key: "createNavTargetTemplatesFromJoinConditions",
      value: function createNavTargetTemplatesFromJoinConditions(joinConditionsMap) {
        var navigationTargetTemplatesMap = {};
        for (var sourceObjectType in joinConditionsMap) {
          var objectTypeJoinConditionsMap = joinConditionsMap[sourceObjectType];
          var navigationTargets = [];
          for (var targetObjectType in objectTypeJoinConditionsMap) {
            var joinConditions = objectTypeJoinConditionsMap[targetObjectType];
            if (!joinConditions) {
              continue;
            }
            navigationTargets.push.apply(navigationTargets, _toConsumableArray(joinConditions.generateNavigationTargetTemplates()));
          }
          if (navigationTargets.length !== 0) {
            navigationTargetTemplatesMap[sourceObjectType] = navigationTargets;
          }
        }
        return navigationTargetTemplatesMap;
      }
    }, {
      key: "collectJoinConditions",
      value: function collectJoinConditions() {
        var semanticObjectTypeMap = this.createIndex();
        var joinConditionsMap = {};
        for (var objectType in this.objectTypeMap) {
          var objectTypeJoinConditionsMap = this.collectJoinConditionsForObjectType(semanticObjectTypeMap, objectType);
          if (!core.isEmptyObject(objectTypeJoinConditionsMap)) {
            joinConditionsMap[objectType] = objectTypeJoinConditionsMap;
          }
        }
        return joinConditionsMap;
      }
    }, {
      key: "collectJoinConditionsForObjectType",
      value: function collectJoinConditionsForObjectType(semanticObjectTypeMap, objectType) {
        var objectTypeJoinConditionsMap = {};
        var objectTypeMetadata = this.objectTypeMap[objectType];
        var getJoinConditions = function (targetObjectType) {
          var joinConditions = objectTypeJoinConditionsMap[targetObjectType];
          if (!joinConditions) {
            joinConditions = new JoinConditions({
              sina: this.sina,
              navigationTargetGenerator: this,
              sourceObjectType: objectType,
              targetObjectType: targetObjectType
            });
            objectTypeJoinConditionsMap[targetObjectType] = joinConditions;
          }
          return joinConditions;
        }.bind(this);
        for (var propertyName in objectTypeMetadata.propertyMap) {
          var property = objectTypeMetadata.propertyMap[propertyName];
          var semanticObjectType = property.semanticObjectType;
          if (!property.response) {
            continue;
          }
          if (!semanticObjectType) {
            continue;
          }
          var targetObjectTypeMap = semanticObjectTypeMap[semanticObjectType];
          for (var targetObjectType in targetObjectTypeMap) {
            if (targetObjectType === objectTypeMetadata.type) {
              continue;
            }
            var targetObjectTypeMetadata = this.objectTypeMap[targetObjectType];
            var targetPropertyNameMap = targetObjectTypeMap[targetObjectType];
            for (var targetPropertyName in targetPropertyNameMap) {
              var targetProperty = targetObjectTypeMetadata.propertyMap[targetPropertyName];
              if (!targetProperty.request) {
                continue;
              }
              var joinConditions = getJoinConditions(targetObjectType);
              joinConditions.add({
                sourcePropertyName: propertyName,
                targetPropertyName: targetPropertyName,
                semanticObjectType: semanticObjectType
              });
            }
          }
        }
        return objectTypeJoinConditionsMap;
      }
    }, {
      key: "createIndex",
      value: function createIndex() {
        var semanticObjectTypeMap = {}; // semantic object type / business object type / property name
        for (var objectType in this.objectTypeMap) {
          this.createIndexForObjectType(semanticObjectTypeMap, objectType);
        }
        return semanticObjectTypeMap;
      }
    }, {
      key: "createIndexForObjectType",
      value: function createIndexForObjectType(semanticObjectTypeMap, objectType) {
        var objectTypeMetadata = this.objectTypeMap[objectType];
        for (var propertyName in objectTypeMetadata.propertyMap) {
          var property = objectTypeMetadata.propertyMap[propertyName];
          var semanticObjectType = property.semanticObjectType;
          if (!semanticObjectType) {
            continue;
          }
          var objectTypeMap = semanticObjectTypeMap[semanticObjectType];
          if (!objectTypeMap) {
            objectTypeMap = {};
            semanticObjectTypeMap[semanticObjectType] = objectTypeMap;
          }
          var propertyNameMap = objectTypeMap[objectTypeMetadata.type];
          if (!propertyNameMap) {
            propertyNameMap = {};
            objectTypeMap[objectTypeMetadata.type] = propertyNameMap;
          }
          var propertyFlag = propertyNameMap[propertyName];
          if (!propertyFlag) {
            propertyFlag = true;
            propertyNameMap[propertyName] = true;
          }
        }
      }
    }, {
      key: "formatItem",
      value: function formatItem(item) {
        var collectAttributes = function collectAttributes(data, attributes) {
          for (var i = 0; i < attributes.length; ++i) {
            var attribute = attributes[i];
            data[attribute.id] = attribute;
          }
        };
        var data = {};
        collectAttributes(data, item.detailAttributes);
        collectAttributes(data, item.titleAttributes);
        return data;
      }
    }, {
      key: "generateNavigationTargetsForItem",
      value: function generateNavigationTargetsForItem(item) {
        var navigationTargetTemplates = this.navigationTargetTemplatesMap[item.dataSource.id];
        if (!navigationTargetTemplates) {
          return undefined;
        }
        var formattedItem = this.formatItem(item);
        var navigationTargets = [];
        for (var i = 0; i < navigationTargetTemplates.length; ++i) {
          var navigationTargetTemplate = navigationTargetTemplates[i];
          var navigationTarget = navigationTargetTemplate.generate(formattedItem);
          if (!navigationTarget) {
            continue;
          }
          navigationTargets.push(navigationTarget);
        }
        return navigationTargets;
      }
    }, {
      key: "generateNavigationTargets",
      value: function generateNavigationTargets(searchResultSet) {
        if (!this.active) {
          return;
        }
        for (var i = 0; i < searchResultSet.items.length; ++i) {
          var _item$navigationTarge;
          var item = searchResultSet.items[i];
          var navigationTargets = this.generateNavigationTargetsForItem(item);
          item.navigationTargets = item.navigationTargets || [];
          (_item$navigationTarge = item.navigationTargets).push.apply(_item$navigationTarge, _toConsumableArray(navigationTargets));
        }
      }
    }]);
    return NavigationTargetGenerator;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.NavigationTargetGenerator = NavigationTargetGenerator;
  return __exports;
});
})();