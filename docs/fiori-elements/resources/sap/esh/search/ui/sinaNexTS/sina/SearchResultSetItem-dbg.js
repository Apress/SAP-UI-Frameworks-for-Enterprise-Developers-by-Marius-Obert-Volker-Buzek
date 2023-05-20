/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./ResultSetItem", "../core/core"], function (___ResultSetItem, ___core_core) {
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
  var ResultSetItem = ___ResultSetItem["ResultSetItem"];
  var generateGuid = ___core_core["generateGuid"];
  var SearchResultSetItem = /*#__PURE__*/function (_ResultSetItem) {
    _inherits(SearchResultSetItem, _ResultSetItem);
    var _super = _createSuper(SearchResultSetItem);
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         },
    //         titleAttributes: {
    //             required: true,
    //             aggregation: true
    //         },
    //         titleDescriptionAttributes: {
    //             required: false,
    //             aggregation: true
    //         },
    //         detailAttributes: {
    //             required: true,
    //             aggregation: true
    //         },
    //         defaultNavigationTarget: {
    //             required: false,
    //             aggregation: true
    //         },
    //         navigationTargets: {
    //             required: false,
    //             aggregation: true
    //         },
    //         score: {
    //             required: false,
    //             default: 0
    //         }
    //     }
    // },

    function SearchResultSetItem(properties) {
      var _properties$dataSourc, _properties$titleAttr, _properties$titleDesc, _properties$detailAtt, _properties$defaultNa, _properties$navigatio, _properties$score, _properties$hierarchy;
      var _this;
      _classCallCheck(this, SearchResultSetItem);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "score", 0);
      _this.dataSource = (_properties$dataSourc = properties.dataSource) !== null && _properties$dataSourc !== void 0 ? _properties$dataSourc : _this.dataSource;
      _this.attributes = properties.attributes;
      _this.attributesMap = {};
      if (Array.isArray(_this.attributes) && _this.attributes.length > 0) {
        for (var i = 0; i < _this.attributes.length; ++i) {
          var attr = _this.attributes[i];
          _this.attributesMap[attr.id] = attr;
        }
      }
      _this.titleAttributes = (_properties$titleAttr = properties.titleAttributes) !== null && _properties$titleAttr !== void 0 ? _properties$titleAttr : _this.titleAttributes;
      _this.titleDescriptionAttributes = (_properties$titleDesc = properties.titleDescriptionAttributes) !== null && _properties$titleDesc !== void 0 ? _properties$titleDesc : _this.titleDescriptionAttributes;
      _this.detailAttributes = (_properties$detailAtt = properties.detailAttributes) !== null && _properties$detailAtt !== void 0 ? _properties$detailAtt : _this.detailAttributes;
      _this.defaultNavigationTarget = (_properties$defaultNa = properties.defaultNavigationTarget) !== null && _properties$defaultNa !== void 0 ? _properties$defaultNa : _this.defaultNavigationTarget;
      _this.navigationTargets = (_properties$navigatio = properties.navigationTargets) !== null && _properties$navigatio !== void 0 ? _properties$navigatio : _this.navigationTargets;
      _this.score = (_properties$score = properties.score) !== null && _properties$score !== void 0 ? _properties$score : _this.score;
      _this.hierarchyNodePaths = (_properties$hierarchy = properties.hierarchyNodePaths) !== null && _properties$hierarchy !== void 0 ? _properties$hierarchy : _this.hierarchyNodePaths;
      return _this;
    }
    _createClass(SearchResultSetItem, [{
      key: "key",
      get: function get() {
        var parts = [];
        parts.push(this.dataSource.id);
        var _iterator = _createForOfIteratorHelper(this.titleAttributes),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var titleAttribute = _step.value;
            var subAttributes = titleAttribute.getSubAttributes();
            var _iterator2 = _createForOfIteratorHelper(subAttributes),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var subAttribute = _step2.value;
                parts.push(subAttribute.value);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        if (parts.length === 1) {
          // no title attributes -> use guid
          parts.push(generateGuid());
        }
        return parts.join("-");
      }
    }, {
      key: "toString",
      value: function toString() {
        var i;
        var result = [];
        var title = [];
        for (i = 0; i < this.titleAttributes.length; ++i) {
          var titleAttribute = this.titleAttributes[i];
          title.push(titleAttribute.toString());
        }
        result.push("--" + title.join(" "));
        for (i = 0; i < this.detailAttributes.length; ++i) {
          var detailAttribute = this.detailAttributes[i];
          result.push(detailAttribute.toString());
        }
        return result.join("\n");
      }
    }]);
    return SearchResultSetItem;
  }(ResultSetItem);
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSetItem = SearchResultSetItem;
  return __exports;
});
})();