/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SearchResultSetItemAttributeBase"], function (___SearchResultSetItemAttributeBase) {
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
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
  var SearchResultSetItemAttributeBase = ___SearchResultSetItemAttributeBase["SearchResultSetItemAttributeBase"];
  var SearchResultSetItemAttributeGroup = /*#__PURE__*/function (_SearchResultSetItemA) {
    _inherits(SearchResultSetItemAttributeGroup, _SearchResultSetItemA);
    var _super = _createSuper(SearchResultSetItemAttributeGroup);
    // _meta: {
    //     properties: {
    //         template: {
    //             required: false
    //         },
    //         attributes: {
    //             required: true,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //         displayAttributes: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    function SearchResultSetItemAttributeGroup(properties) {
      var _properties$template, _properties$attribute, _properties$displayAt;
      var _this;
      _classCallCheck(this, SearchResultSetItemAttributeGroup);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "attributes", []);
      _defineProperty(_assertThisInitialized(_this), "displayAttributes", []);
      _this.template = (_properties$template = properties.template) !== null && _properties$template !== void 0 ? _properties$template : _this.template;
      _this.attributes = (_properties$attribute = properties.attributes) !== null && _properties$attribute !== void 0 ? _properties$attribute : _this.attributes;
      _this.displayAttributes = (_properties$displayAt = properties.displayAttributes) !== null && _properties$displayAt !== void 0 ? _properties$displayAt : _this.displayAttributes;
      return _this;
    }
    _createClass(SearchResultSetItemAttributeGroup, [{
      key: "toString",
      value: function toString() {
        var valueFormatted = "",
          pos = 0;
        var match;
        var regex = RegExp("{[a-z]+}", "gi");
        while ((match = regex.exec(this.template)) !== null) {
          valueFormatted += this.template.substring(pos, match.index);
          var attributeName = match[0].slice(1, -1);
          valueFormatted += this.attributes[attributeName] && this.attributes[attributeName].valueFormatted || ""; // TODO: What if this.attributes[attributeName] is a group?
          pos = regex.lastIndex;
        }
        valueFormatted += this.template.substring(pos);
        return this.label + ":" + valueFormatted;
      }
    }, {
      key: "isAttributeDisplayed",
      value: function isAttributeDisplayed(attributeId) {
        if (Array.isArray(this.displayAttributes)) {
          return this.displayAttributes.includes(attributeId);
        }
        return false;
      }
    }, {
      key: "getSubAttributes",
      value: function getSubAttributes() {
        var attributes = [];
        var _iterator = _createForOfIteratorHelper(this.attributes),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var attributeMemberShip = _step.value;
            attributes.push.apply(attributes, _toConsumableArray(attributeMemberShip.attribute.getSubAttributes()));
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return attributes;
      }
    }]);
    return SearchResultSetItemAttributeGroup;
  }(SearchResultSetItemAttributeBase);
  var __exports = {
    __esModule: true
  };
  __exports.SearchResultSetItemAttributeGroup = SearchResultSetItemAttributeGroup;
  return __exports;
});
})();