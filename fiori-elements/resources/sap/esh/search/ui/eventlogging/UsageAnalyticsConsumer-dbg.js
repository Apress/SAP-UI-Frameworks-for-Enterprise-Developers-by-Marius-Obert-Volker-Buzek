/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/eventlogging/EventConsumer", "sap/esh/search/ui/suggestions/SuggestionType", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (EventConsumer, sap_esh_search_ui_suggestions_SuggestionType, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
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
  var SuggestionType = sap_esh_search_ui_suggestions_SuggestionType["SuggestionType"];
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var UsageAnalyticsConsumer = /*#__PURE__*/function (_EventConsumer) {
    _inherits(UsageAnalyticsConsumer, _EventConsumer);
    var _super = _createSuper(UsageAnalyticsConsumer);
    function UsageAnalyticsConsumer() {
      var _this;
      _classCallCheck(this, UsageAnalyticsConsumer);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "actionPrefix", "Search: ");
      return _this;
    }
    _createClass(UsageAnalyticsConsumer, [{
      key: "init",
      value:
      // see UserEventLogger and EventLogger

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function init(properties) {
        //
      }

      // eslint-disable-next-line no-unused-vars
    }, {
      key: "logEvent",
      value: function logEvent(event) {
        if (!this.analytics) {
          return;
        }
        switch (event.type) {
          case UserEventType.RESULT_LIST_ITEM_NAVIGATE:
            this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Launch Object", [event.targetUrl]);
            break;
          case UserEventType.SUGGESTION_SELECT:
            switch (event.suggestionType) {
              case SuggestionType.App:
                this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Suggestion Select App", [event.suggestionTitle, event.targetUrl, event.searchTerm]);
                this.analytics.logCustomEvent("".concat(this.actionPrefix, "Application Launch point"), "Search Suggestions", [event.suggestionTitle, event.targetUrl, event.searchTerm]);
                break;
              case SuggestionType.DataSource:
                this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Suggestion Select Datasource", [event.dataSourceKey, event.searchTerm]);
                break;
              case SuggestionType.Object:
                this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Suggestion Select Object Data", [event.suggestionTerm, event.dataSourceKey, event.searchTerm]);
                break;
              case SuggestionType.Recent:
                this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Suggestion Select Object Data", [event.suggestionTerm, event.dataSourceKey, event.searchTerm]);
                break;
            }
            break;
          case UserEventType.SEARCH_REQUEST:
            this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Search", [event.searchTerm, event.dataSourceKey]);
            break;
          case UserEventType.RESULT_LIST_ITEM_NAVIGATE_CONTEXT:
            this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Launch Related Object", [event.targetUrl]);
            break;
          case UserEventType.SUGGESTION_REQUEST:
            this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Suggestion", [event.suggestionTerm, event.dataSourceKey]);
            break;
          case UserEventType.TILE_NAVIGATE:
            this.analytics.logCustomEvent("".concat(this.actionPrefix, "Search"), "Launch App", [event.tileTitle, event.targetUrl]);
            this.analytics.logCustomEvent("".concat(this.actionPrefix, "Application Launch point"), "Search Results", [event.titleTitle, event.targetUrl]);
            break;
        }
      }
    }]);
    return UsageAnalyticsConsumer;
  }(EventConsumer);
  return UsageAnalyticsConsumer;
});
})();