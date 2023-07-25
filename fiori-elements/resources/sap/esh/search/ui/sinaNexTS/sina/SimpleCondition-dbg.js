/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../core/util", "./ComparisonOperator", "./Condition", "./ConditionType"], function (util, ___ComparisonOperator, ___Condition, ___ConditionType) {
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
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var ComparisonOperator = ___ComparisonOperator["ComparisonOperator"];
  var Condition = ___Condition["Condition"];
  var ConditionType = ___ConditionType["ConditionType"];
  var SimpleCondition = /*#__PURE__*/function (_Condition) {
    _inherits(SimpleCondition, _Condition);
    var _super = _createSuper(SimpleCondition);
    function SimpleCondition(properties) {
      var _properties$operator, _properties$attribute, _properties$userDefin, _properties$isDynamic, _properties$value;
      var _this;
      _classCallCheck(this, SimpleCondition);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "type", ConditionType.Simple);
      _defineProperty(_assertThisInitialized(_this), "operator", ComparisonOperator.Eq);
      _this.operator = (_properties$operator = properties.operator) !== null && _properties$operator !== void 0 ? _properties$operator : _this.operator;
      _this.attribute = (_properties$attribute = properties.attribute) !== null && _properties$attribute !== void 0 ? _properties$attribute : _this.attribute;
      _this.userDefined = (_properties$userDefin = properties.userDefined) !== null && _properties$userDefin !== void 0 ? _properties$userDefin : _this.userDefined;
      _this.isDynamicValue = (_properties$isDynamic = properties.isDynamicValue) !== null && _properties$isDynamic !== void 0 ? _properties$isDynamic : false;
      _this.value = (_properties$value = properties.value) !== null && _properties$value !== void 0 ? _properties$value : _this.value;
      return _this;
    }
    _createClass(SimpleCondition, [{
      key: "clone",
      value: function clone() {
        return new SimpleCondition({
          operator: this.operator,
          attribute: this.attribute,
          attributeLabel: this.attributeLabel,
          value: this.value,
          valueLabel: this.valueLabel,
          userDefined: this.userDefined,
          isDynamicValue: this.isDynamicValue
        });
      }
    }, {
      key: "equals",
      value: function equals(other) {
        if (!(other instanceof SimpleCondition)) {
          return false;
        }
        if (this.attribute !== other.attribute || this.operator !== other.operator) {
          return false;
        }
        if (this.isDynamicValue !== other.isDynamicValue) {
          return false;
        }
        if (this.value instanceof Date && other.value instanceof Date) {
          return this.value.getTime() === other.value.getTime();
        }
        return this.value === other.value;
      }
    }, {
      key: "containsAttribute",
      value: function containsAttribute(attribute) {
        return this.attribute === attribute;
      }
    }, {
      key: "_collectAttributes",
      value: function _collectAttributes(attributeMap) {
        attributeMap[this.attribute] = true;
      }
    }, {
      key: "getFirstAttribute",
      value: function getFirstAttribute() {
        return this.attribute;
      }
    }, {
      key: "_collectFilterConditions",
      value: function _collectFilterConditions(attribute, filterConditions) {
        if (this.attribute === attribute) {
          filterConditions.push(this);
        }
      }
    }, {
      key: "removeAttributeConditions",
      value: function removeAttributeConditions(attribute) {
        if (this.attribute === attribute) {
          throw "program error";
        }
        return {
          deleted: false,
          attribute: "",
          value: ""
        };
      }
    }, {
      key: "toJson",
      value: function toJson() {
        var jsonValue;
        if (this.value instanceof Date) {
          jsonValue = util.dateToJson(this.value);
        } else {
          jsonValue = this.value;
        }
        var result = {
          type: ConditionType.Simple,
          operator: this.operator,
          attribute: this.attribute,
          value: jsonValue,
          valueLabel: this.valueLabel,
          attributeLabel: this.attributeLabel
        };
        if (this.userDefined) {
          result.userDefined = true;
        }
        if (this.isDynamicValue) {
          result.dynamic = this.isDynamicValue;
        }
        return result;
      }
    }]);
    return SimpleCondition;
  }(Condition);
  var __exports = {
    __esModule: true
  };
  __exports.SimpleCondition = SimpleCondition;
  return __exports;
});
})();