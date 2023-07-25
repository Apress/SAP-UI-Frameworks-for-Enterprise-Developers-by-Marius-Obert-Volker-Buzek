/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchNavigationObject", "./error/errors", "./sinaNexTS/sina/ObjectSuggestion", "./sinaNexTS/sina/SearchResultSetItem", "./sinaNexTS/sina/SearchResultSetItemAttribute"], function (SearchNavigationObject, __errors, ___sinaNexTS_sina_ObjectSuggestion, ___sinaNexTS_sina_SearchResultSetItem, ___sinaNexTS_sina_SearchResultSetItemAttribute) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var errors = _interopRequireDefault(__errors);
  var ObjectSuggestion = ___sinaNexTS_sina_ObjectSuggestion["ObjectSuggestion"];
  var SearchResultSetItem = ___sinaNexTS_sina_SearchResultSetItem["SearchResultSetItem"];
  var SearchResultSetItemAttribute = ___sinaNexTS_sina_SearchResultSetItemAttribute["SearchResultSetItemAttribute"];
  var SearchNavigationObjectForSinaNavTarget = /*#__PURE__*/function (_SearchNavigationObje) {
    _inherits(SearchNavigationObjectForSinaNavTarget, _SearchNavigationObje);
    var _super = _createSuper(SearchNavigationObjectForSinaNavTarget);
    function SearchNavigationObjectForSinaNavTarget(sinaNavigationTarget, model) {
      var _this;
      _classCallCheck(this, SearchNavigationObjectForSinaNavTarget);
      _this = _super.call(this, undefined, model);
      _this._sinaNavigationTarget = sinaNavigationTarget;
      _this.setHref(sinaNavigationTarget.targetUrl);
      _this.setText(sinaNavigationTarget.label);
      _this.setTarget(sinaNavigationTarget.target);
      _this.sina = _this._sinaNavigationTarget.sina;
      return _this;
    }
    _createClass(SearchNavigationObjectForSinaNavTarget, [{
      key: "performNavigation",
      value: function performNavigation(properties) {
        // TODO: shall be resumed when the situation in hana_odata side is clared
        // this.trackNavigation();
        try {
          this._model.config.beforeNavigation(this._model);
        } catch (err) {
          var oError = new errors.ConfigurationExitError("beforeNavigation", this._model.config.applicationComponent, err);
          throw oError;
        }
        this._sinaNavigationTarget.performNavigation(properties);
      }
    }, {
      key: "getResultSet",
      value: function getResultSet() {
        var resultSetItem = this.getResultSetItem();
        if (resultSetItem instanceof SearchResultSetItem) {
          return resultSetItem.parent;
        }
      }
    }, {
      key: "getResultSetItem",
      value: function getResultSetItem() {
        var parent = this._sinaNavigationTarget.parent;
        if (parent instanceof SearchResultSetItemAttribute) {
          // navigation target on attribute level -> parent is SearchResultSetItem
          parent = parent.parent;
        }
        if (!(parent instanceof SearchResultSetItem)) {
          throw "programm error";
        }
        if (parent.parent instanceof ObjectSuggestion) {
          // for object suggestions: item = object suggestion
          return parent.parent;
        }
        return parent;
      }
    }, {
      key: "getResultSetId",
      value: function getResultSetId() {
        return this.getResultSet().id;
      }
    }, {
      key: "getPositionInList",
      value: function getPositionInList() {
        var resultSet = this.getResultSet();
        var resultSetItem = this.getResultSetItem();
        return resultSet.items.indexOf(resultSetItem);
      }
    }, {
      key: "hasTargetFunction",
      value: function hasTargetFunction() {
        var targetFunction = this._sinaNavigationTarget.targetFunction;
        if (typeof targetFunction === "function") {
          return true;
        }
        return false;
      }
    }]);
    return SearchNavigationObjectForSinaNavTarget;
  }(SearchNavigationObject);
  return SearchNavigationObjectForSinaNavTarget;
});
})();