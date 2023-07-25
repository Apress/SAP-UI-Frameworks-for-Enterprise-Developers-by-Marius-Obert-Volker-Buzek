/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./NavigationTargetTemplate", "../../../sina/SinaObject"], function (___NavigationTargetTemplate, _____sina_SinaObject) {
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
  var NavigationTargetTemplate = ___NavigationTargetTemplate["NavigationTargetTemplate"];
  var SinaObject = _____sina_SinaObject["SinaObject"];
  var JoinConditions = /*#__PURE__*/function (_SinaObject) {
    _inherits(JoinConditions, _SinaObject);
    var _super = _createSuper(JoinConditions);
    function JoinConditions(properties) {
      var _this;
      _classCallCheck(this, JoinConditions);
      _this = _super.call(this, properties);
      _this.navigationTargetGenerator = properties.navigationTargetGenerator;
      _this.sourceObjectType = properties.sourceObjectType;
      _this.targetObjectType = properties.targetObjectType;
      _this.conditions = [];
      return _this;
    }
    _createClass(JoinConditions, [{
      key: "add",
      value: function add(condition) {
        this.conditions.push(condition);
      }
    }, {
      key: "hasDuplicateSemanticObject",
      value: function hasDuplicateSemanticObject() {
        var map = {};
        for (var i = 0; i < this.conditions.length; ++i) {
          var condition = this.conditions[i];
          if (map[condition.semanticObjectType]) {
            return true;
          }
          map[condition.semanticObjectType] = true;
        }
        return false;
      }
    }, {
      key: "hasDistinctValue",
      value: function hasDistinctValue(semanticObjectType, property) {
        var value;
        for (var i = 0; i < this.conditions.length; ++i) {
          var condition = this.conditions[i];
          if (condition.semanticObjectType !== semanticObjectType) {
            continue;
          }
          if (!value) {
            value = condition[property];
            continue;
          }
          if (value !== condition[property]) {
            return false;
          }
        }
        return true;
      }
    }, {
      key: "generateNavigationTargetTemplates",
      value: function generateNavigationTargetTemplates() {
        if (this.hasDuplicateSemanticObject()) {
          return this.createSingleConditionsTemplates();
        }
        return this.createMultipleConditionsTemplates();
      }
    }, {
      key: "createSingleConditionsTemplates",
      value: function createSingleConditionsTemplates() {
        var navigationTargetTemplates = [];
        for (var i = 0; i < this.conditions.length; ++i) {
          var condition = this.conditions[i];
          var sourcePropertyNameDistinct = this.hasDistinctValue(condition.semanticObjectType, "sourcePropertyName");
          var targetPropertyNameDistinct = this.hasDistinctValue(condition.semanticObjectType, "targetPropertyName");
          if (!sourcePropertyNameDistinct && !targetPropertyNameDistinct) {
            continue;
          }
          var navigationTargetTemplate = new NavigationTargetTemplate({
            sina: this.sina,
            navigationTargetGenerator: this.navigationTargetGenerator,
            label: "dummy",
            sourceObjectType: this.sourceObjectType,
            targetObjectType: this.targetObjectType,
            conditions: [condition]
          });
          navigationTargetTemplate._condition = condition;
          navigationTargetTemplates.push(navigationTargetTemplate);
        }
        this.assembleSingleConditionTemplateLabels(navigationTargetTemplates);
        return navigationTargetTemplates;
      }
    }, {
      key: "createMultipleConditionsTemplates",
      value: function createMultipleConditionsTemplates() {
        return [new NavigationTargetTemplate({
          sina: this.sina,
          navigationTargetGenerator: this.navigationTargetGenerator,
          label: this.navigationTargetGenerator.objectTypeMap[this.targetObjectType].label,
          sourceObjectType: this.sourceObjectType,
          targetObjectType: this.targetObjectType,
          conditions: this.conditions
        })];
      }
    }, {
      key: "assembleSingleConditionTemplateLabels",
      value: function assembleSingleConditionTemplateLabels(navigationTargets) {
        // assemble label based on target object and target property
        // collect in navigation target in map with label key
        var targetMap = {};
        var targets, labelKey, navigationTarget, metadata;
        for (var i = 0; i < navigationTargets.length; ++i) {
          navigationTarget = navigationTargets[i];
          metadata = this.navigationTargetGenerator.objectTypeMap[this.targetObjectType];
          labelKey = metadata.label + " to:" + metadata.propertyMap[navigationTarget._condition.targetPropertyName].label;
          navigationTarget.label = labelKey;
          targets = targetMap[labelKey];
          if (!targets) {
            targets = [];
            targetMap[labelKey] = targets;
          }
          targets.push(navigationTarget);
        }
        // assemble final label
        metadata = this.navigationTargetGenerator.objectTypeMap[this.sourceObjectType];
        for (labelKey in targetMap) {
          targets = targetMap[labelKey];
          if (targets.length > 1) {
            for (var j = 0; j < targets.length; ++j) {
              navigationTarget = targets[j];
              navigationTarget.label += " from:" + metadata.propertyMap[navigationTarget._condition.sourcePropertyName].label;
            }
          }
        }
      }
    }]);
    return JoinConditions;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.JoinConditions = JoinConditions;
  return __exports;
});
})();