/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../../core/util", "../../core/core", "./ConfigFormatter"], function (util, core, ___ConfigFormatter) {
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
  var ConfigFormatter = ___ConfigFormatter["ConfigFormatter"]; // =======================================================================
  // helper
  // =======================================================================
  var createAttributeMap = function createAttributeMap(item) {
    if (item.__templateAttributeMapCache) {
      return item.__templateAttributeMapCache;
    }
    var map = item.__templateAttributeMapCache = {};
    var attribute;
    for (var i = 0; i < item.detailAttributes.length; ++i) {
      attribute = item.detailAttributes[i];
      map[attribute.id] = attribute.value;
    }
    for (var j = 0; j < item.titleAttributes.length; ++j) {
      attribute = item.titleAttributes[j];
      map[attribute.id] = attribute.value;
    }
    return map;
  };

  // =======================================================================
  // metadata decription of search result set
  // =======================================================================

  var attributeType = {
    type: "object",
    typeName: "SearchResultSetItemAttribute",
    properties: [{
      name: "label",
      type: "string"
    }, {
      name: "value",
      type: "string"
    }, {
      name: "valueFormatted",
      type: "string"
    }, {
      name: "valueHighlighted",
      type: "string"
    }]
  };
  var detailAttributesProperty = {
    name: "detailAttributes",
    multiple: true,
    getElementId: function getElementId(attribute) {
      return attribute.id;
    },
    createElement: function createElement(attribute, ctx) {
      var sina = ctx.objectStack[0].sina;
      var attributeMetadata = sina._createAttributeMetadata({
        type: sina.AttributeType.String,
        id: attribute.id,
        label: "",
        isSortable: false,
        isKey: false,
        matchingStrategy: sina.MatchingStrategy.Exact,
        usage: {
          Detail: {}
        }
      });
      var newAttribute = sina._createSearchResultSetItemAttribute({
        id: attribute.id,
        label: "",
        value: "",
        valueFormatted: "",
        valueHighlighted: "",
        isHighlighted: false,
        metadata: attributeMetadata
      });
      newAttribute.parent = ctx.objectStack[2];
      return newAttribute;
    },
    postProcessCreatedElement: function postProcessCreatedElement(attribute) {
      attribute.valueFormatted = attribute.valueFormatted || attribute.value;
      attribute.valueHighlighted = attribute.valueHighlighted || attribute.valueFormatted;
    },
    type: attributeType
  };
  var titleAttributesProperty = core.extend({}, detailAttributesProperty);
  titleAttributesProperty.name = "titleAttributes";
  var searchResultSetType = {
    type: "object",
    typeName: "SearchResultSet",
    properties: [{
      name: "items",
      multiple: true,
      getElementId: function getElementId(item) {
        return item.dataSource.id;
      },
      type: {
        type: "object",
        typeName: "SearchResultResultSetItem",
        evaluateTemplate: function evaluateTemplate(template, item) {
          var itemMap = createAttributeMap(item);
          return util.evaluateTemplate(template, itemMap);
        },
        properties: [{
          name: "title",
          type: "string"
        }, titleAttributesProperty, detailAttributesProperty, {
          name: "navigationTargets",
          multiple: true,
          getElementId: function getElementId(navigationTarget) {
            return navigationTarget.label;
          },
          createElement: function createElement(navigationTarget, ctx) {
            var sina = ctx.objectStack[0].sina;
            var newNavigationTarget = sina._createNavigationTarget({
              label: "",
              targetUrl: ""
            });
            newNavigationTarget.parent = ctx.objectStack[2];
            return newNavigationTarget;
          },
          type: {
            type: "object",
            typeName: "NavigationTarget",
            properties: [{
              name: "label",
              type: "string"
            }, {
              name: "targetUrl",
              type: "string"
            }]
          }
        }]
      }
    }]
  };

  // =======================================================================
  // formatter
  // =======================================================================
  var ConfigSearchResultSetFormatter = /*#__PURE__*/function (_ConfigFormatter) {
    _inherits(ConfigSearchResultSetFormatter, _ConfigFormatter);
    var _super = _createSuper(ConfigSearchResultSetFormatter);
    function ConfigSearchResultSetFormatter(configuration) {
      _classCallCheck(this, ConfigSearchResultSetFormatter);
      return _super.call(this, searchResultSetType, configuration);
    }
    return _createClass(ConfigSearchResultSetFormatter);
  }(ConfigFormatter);
  var __exports = {
    __esModule: true
  };
  __exports.ConfigSearchResultSetFormatter = ConfigSearchResultSetFormatter;
  return __exports;
});
})();