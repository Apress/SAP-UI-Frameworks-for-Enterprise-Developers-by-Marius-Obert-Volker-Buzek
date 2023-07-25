/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./Condition", "./ConditionType", "./LogicalOperator", "./SimpleCondition"], function (___Condition, ___ConditionType, ___LogicalOperator, ___SimpleCondition) {
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var Condition = ___Condition["Condition"];
  var ConditionType = ___ConditionType["ConditionType"];
  var LogicalOperator = ___LogicalOperator["LogicalOperator"];
  var SimpleCondition = ___SimpleCondition["SimpleCondition"];
  var ComplexCondition = /*#__PURE__*/function (_Condition) {
    _inherits(ComplexCondition, _Condition);
    var _super = _createSuper(ComplexCondition);
    // _meta: {
    //     properties: {
    //         operator: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.LogicalOperator.And;
    //             }
    //         },
    //         conditions: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // },

    function ComplexCondition(properties) {
      var _properties$operator, _properties$condition;
      var _this;
      _classCallCheck(this, ComplexCondition);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "type", ConditionType.Complex);
      _defineProperty(_assertThisInitialized(_this), "operator", LogicalOperator.And);
      _defineProperty(_assertThisInitialized(_this), "conditions", []);
      _this.operator = (_properties$operator = properties.operator) !== null && _properties$operator !== void 0 ? _properties$operator : _this.operator;
      _this.conditions = (_properties$condition = properties.conditions) !== null && _properties$condition !== void 0 ? _properties$condition : _this.conditions;
      return _this;
    }
    _createClass(ComplexCondition, [{
      key: "clone",
      value: function clone() {
        var clonedConditions = [];
        for (var i = 0; i < this.conditions.length; ++i) {
          clonedConditions.push(this.conditions[i].clone());
        }
        return new ComplexCondition({
          sina: this.sina,
          operator: this.operator,
          conditions: clonedConditions,
          valueLabel: this.valueLabel,
          attributeLabel: this.attributeLabel
        });
      }
    }, {
      key: "equals",
      value: function equals(other) {
        if (!(other instanceof ComplexCondition)) {
          return false;
        }
        if (this.operator !== other.operator) {
          return false;
        }
        if (this.conditions.length !== other.conditions.length) {
          return false;
        }
        var matchedOtherConditions = {};
        for (var i = 0; i < this.conditions.length; ++i) {
          var condition = this.conditions[i];
          var match = false;
          for (var j = 0; j < other.conditions.length; ++j) {
            if (matchedOtherConditions[j]) {
              continue;
            }
            var otherCondition = other.conditions[j];
            if (condition.equals(otherCondition)) {
              match = true;
              matchedOtherConditions[j] = true;
              break;
            }
          }
          if (!match) {
            return false;
          }
        }
        return true;
      }
    }, {
      key: "containsAttribute",
      value: function containsAttribute(attribute) {
        var _iterator = _createForOfIteratorHelper(this.conditions),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var condition = _step.value;
            if (condition.containsAttribute(attribute)) {
              return true;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return false;
      }
    }, {
      key: "_collectAttributes",
      value: function _collectAttributes(attributeMap) {
        var _iterator2 = _createForOfIteratorHelper(this.conditions),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var condition = _step2.value;
            condition._collectAttributes(attributeMap);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }, {
      key: "addCondition",
      value: function addCondition(condition) {
        if (!(condition instanceof Condition)) {
          condition = this.sina.createSimpleCondition(condition);
        }
        this.conditions.push(condition);
      }
    }, {
      key: "removeConditionAt",
      value: function removeConditionAt(index) {
        this.conditions.splice(index, 1);
      }
    }, {
      key: "hasFilters",
      value: function hasFilters() {
        return this.conditions.length >= 1;
      }
    }, {
      key: "removeAttributeConditions",
      value: function removeAttributeConditions(attribute) {
        var result = {
          deleted: false,
          attribute: "",
          value: ""
        };
        for (var i = 0; i < this.conditions.length; ++i) {
          var subCondition = this.conditions[i];
          switch (subCondition.type) {
            case ConditionType.Complex:
              result = subCondition.removeAttributeConditions(attribute);
              break;
            case ConditionType.Simple:
              if (subCondition.attribute === attribute) {
                result = {
                  deleted: true,
                  attribute: subCondition.attribute,
                  value: subCondition.value
                };
                this.removeConditionAt(i);
                i--;
              }
              break;
          }
        }
        this.cleanup();
        return result;
      }
    }, {
      key: "getAttributeConditions",
      value: function getAttributeConditions(attribute) {
        var results = [];
        var doGetAttributeConditions = function doGetAttributeConditions(condition, attributeName) {
          switch (condition.type) {
            case ConditionType.Complex:
              for (var i = 0; i < condition.conditions.length; i++) {
                doGetAttributeConditions(condition.conditions[i], attributeName);
              }
              break;
            case ConditionType.Simple:
              if (condition.attribute === attributeName) {
                results.push(condition);
              }
              break;
          }
        };
        doGetAttributeConditions(this, attribute);
        return results;
      }
    }, {
      key: "cleanup",
      value: function cleanup() {
        var removed = false;
        var doCleanup = function doCleanup(condition) {
          for (var i = 0; i < condition.conditions.length; ++i) {
            var subCondition = condition.conditions[i];
            switch (subCondition.type) {
              case ConditionType.Complex:
                doCleanup(subCondition);
                if (subCondition.conditions.length === 0) {
                  removed = true;
                  condition.removeConditionAt(i);
                  i--;
                }
                break;
              case ConditionType.Simple:
                break;
            }
          }
        };
        do {
          removed = false;
          doCleanup(this);
        } while (removed);
      }
    }, {
      key: "resetConditions",
      value: function resetConditions() {
        this.conditions.splice(0, this.conditions.length);
      }
    }, {
      key: "getFirstAttribute",
      value: function getFirstAttribute() {
        if (this.conditions.length === 0) {
          return null;
        }
        // just use first condition
        if (this.conditions[0] instanceof ComplexCondition) {
          return this.conditions[0].getFirstAttribute();
        }
        if (this.conditions[0] instanceof SimpleCondition) {
          return this.conditions[0].getFirstAttribute();
        }
        throw new Error("Condition is neither simple nor complex");
      }
    }, {
      key: "_collectFilterConditions",
      value: function _collectFilterConditions(attribute, filterConditions) {
        var _iterator3 = _createForOfIteratorHelper(this.conditions),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var condition = _step3.value;
            condition._collectFilterConditions(attribute, filterConditions);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
    }, {
      key: "toJson",
      value: function toJson() {
        var result = {
          type: ConditionType.Complex,
          operator: this.operator,
          conditions: [],
          valueLabel: this.valueLabel,
          attributeLabel: this.attributeLabel
        };
        for (var i = 0; i < this.conditions.length; ++i) {
          var condition = this.conditions[i];
          if (condition instanceof ComplexCondition) {
            result.conditions.push(condition.toJson());
          }
          if (condition instanceof SimpleCondition) {
            result.conditions.push(condition.toJson());
          }
        }
        if (this.userDefined) {
          result.userDefined = true;
        }
        return result;
      }
    }]);
    return ComplexCondition;
  }(Condition);
  var __exports = {
    __esModule: true
  };
  __exports.ComplexCondition = ComplexCondition;
  return __exports;
});
})();