/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
sap.ui.define(["../../sina/SinaObject", "../../sina/AttributeType", "../abap_odata/Provider"], function (____sina_SinaObject, ____sina_AttributeType, ___abap_odata_Provider) {
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var SinaObject = ____sina_SinaObject["SinaObject"];
  var AttributeType = ____sina_AttributeType["AttributeType"];
  var ABAPODataProvider = ___abap_odata_Provider["Provider"];
  var ItemPostParser = /*#__PURE__*/function (_SinaObject) {
    _inherits(ItemPostParser, _SinaObject);
    var _super = _createSuper(ItemPostParser);
    function ItemPostParser(properties) {
      var _this;
      _classCallCheck(this, ItemPostParser);
      _this = _super.call(this, properties);
      _this._searchResultSetItem = properties.searchResultSetItem;
      _this._dataSource = properties.searchResultSetItem.dataSource;
      _this._allAttributesMap = properties.searchResultSetItem._private.allAttributesMap;
      _this._intentsResolver = _this.sina._createFioriIntentsResolver({
        sina: properties.sina
      });
      return _this;
    }
    _createClass(ItemPostParser, [{
      key: "postParseResultSetItem",
      value: function postParseResultSetItem() {
        try {
          const _this2 = this;
          var prom = _this2.enhanceResultSetItemWithNavigationTargets();
          // TODO: what about exceptions?
          _this2.enhanceResultSetItemWithGroups(); // can be done in parallel, if parallelization is possible
          return _await(prom);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "enhanceResultSetItemWithNavigationTargets",
      value: function enhanceResultSetItemWithNavigationTargets() {
        try {
          const _this3 = this;
          var _that$_dataSource$sys, _that$_dataSource$sys2, _that$_dataSource$sys3, _that$_dataSource$sys4;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          var that = _this3;
          var semanticObjectType = that._dataSource._private.semanticObjectType;
          var semanticObjectTypeAttributes = that._searchResultSetItem._private.semanticObjectTypeAttributes;
          var systemId = (_that$_dataSource$sys = that._dataSource.system) === null || _that$_dataSource$sys === void 0 ? void 0 : (_that$_dataSource$sys2 = _that$_dataSource$sys.id) === null || _that$_dataSource$sys2 === void 0 ? void 0 : _that$_dataSource$sys2.split(".")[0];
          var client = (_that$_dataSource$sys3 = that._dataSource.system) === null || _that$_dataSource$sys3 === void 0 ? void 0 : (_that$_dataSource$sys4 = _that$_dataSource$sys3.id) === null || _that$_dataSource$sys4 === void 0 ? void 0 : _that$_dataSource$sys4.split(".")[1];
          return _await(that._intentsResolver.resolveIntents({
            semanticObjectType: semanticObjectType,
            semanticObjectTypeAttributes: semanticObjectTypeAttributes,
            systemId: systemId,
            client: client,
            fallbackDefaultNavigationTarget: that._searchResultSetItem.defaultNavigationTarget
          }), function (intents) {
            var defaultNavigationTarget = intents && intents.defaultNavigationTarget;
            var navigationTargets = intents && intents.navigationTargets;
            var navigationTargetForEnhancement = [];
            if (defaultNavigationTarget) {
              navigationTargetForEnhancement.push(defaultNavigationTarget);
              that._searchResultSetItem.defaultNavigationTarget = defaultNavigationTarget;
              defaultNavigationTarget.parent = that._searchResultSetItem;
            }
            if (navigationTargets) {
              that._searchResultSetItem.navigationTargets = navigationTargets;
              navigationTargetForEnhancement = [].concat(_toConsumableArray(navigationTargetForEnhancement), _toConsumableArray(navigationTargets));
              for (var i = 0; i < navigationTargets.length; i++) {
                navigationTargets[i].parent = that._searchResultSetItem;
              }
            }
            _this3.enhanceNavigationTargetsWithContentProviderId(navigationTargetForEnhancement);
            return that._searchResultSetItem;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "enhanceNavigationTargetsWithContentProviderId",
      value: function enhanceNavigationTargetsWithContentProviderId(navigationTargets) {
        if (!(this.sina.provider instanceof ABAPODataProvider)) {
          return;
        }
        if (!this.sina.provider.contentProviderId) {
          return;
        }
        var _iterator = _createForOfIteratorHelper(navigationTargets),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var navigationTarget = _step.value;
            navigationTarget.targetUrl += "&sap-app-origin-hint=" + this.sina.provider.contentProviderId;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "enhanceResultSetItemWithGroups",
      value: function enhanceResultSetItemWithGroups() {
        var attributesMetadata = this._searchResultSetItem.dataSource.attributesMetadata;
        for (var i = 0; i < attributesMetadata.length; i++) {
          var attributeMetadata = attributesMetadata[i];
          if (attributeMetadata.type === AttributeType.Group) {
            var group = this._addAttributeGroup(attributeMetadata);
            if (attributeMetadata.usage.Detail) {
              this._searchResultSetItem.detailAttributes.push(group);
            }
            if (attributeMetadata.usage.Title) {
              this._searchResultSetItem.titleAttributes.push(group);
            }
            if (attributeMetadata.usage.TitleDescription) {
              this._searchResultSetItem.titleDescriptionAttributes.push(group);
            }
          }
        }
        this.sortAttributes();
      }
    }, {
      key: "sortAttributes",
      value: function sortAttributes() {
        var createSortFunction = function createSortFunction(attributeName) {
          return function (a1, a2) {
            // be careful to handle displayOrder === 0 correctly!
            var displayOrder1 = a1.metadata.usage && a1.metadata.usage[attributeName] ? a1.metadata.usage[attributeName].displayOrder : undefined;
            var displayOrder2 = a2.metadata.usage && a2.metadata.usage[attributeName] ? a2.metadata.usage[attributeName].displayOrder : undefined;
            if (displayOrder1 === undefined || displayOrder2 === undefined) {
              if (displayOrder2 !== undefined) {
                return 1;
              }
              return -1;
            }
            return displayOrder1 - displayOrder2;
          };
        };
        this._searchResultSetItem.titleAttributes.sort(createSortFunction("Title"));
        this._searchResultSetItem.titleDescriptionAttributes.sort(createSortFunction("TitleDescription"));
        this._searchResultSetItem.detailAttributes.sort(createSortFunction("Detail"));
      }
    }, {
      key: "_addAttributeGroup",
      value: function _addAttributeGroup(attributeGroupMetadata) {
        var group = this.sina._createSearchResultSetItemAttributeGroup({
          id: attributeGroupMetadata.id,
          metadata: attributeGroupMetadata,
          label: attributeGroupMetadata.label,
          template: attributeGroupMetadata.template,
          attributes: [],
          groups: [],
          displayAttributes: attributeGroupMetadata.displayAttributes || []
        });
        var parentAttributeMetadata, childAttributeMetadata;
        if (attributeGroupMetadata._private) {
          parentAttributeMetadata = attributeGroupMetadata._private.parentAttribute;
          childAttributeMetadata = attributeGroupMetadata._private.childAttribute;
        }
        for (var k = 0; k < attributeGroupMetadata.attributes.length; k++) {
          var attributeMembershipMetadata = attributeGroupMetadata.attributes[k];
          var attributeMetadata = attributeMembershipMetadata.attribute;
          var attributeOrGroup = void 0;
          if (attributeMetadata.type === AttributeType.Group) {
            // attributeOrGroup = this._addAttributeGroup(attributeMetadata, this._allAttributesMap);
            attributeOrGroup = this._addAttributeGroup(attributeMetadata);
          } else {
            attributeOrGroup = this._allAttributesMap[attributeMetadata.id];
          }
          if (attributeOrGroup) {
            var attributeGroupMembership = this.sina._createSearchResultSetItemAttributeGroupMembership({
              group: group,
              attribute: attributeOrGroup,
              metadata: attributeMembershipMetadata
            });
            group.attributes.push(attributeGroupMembership);
            attributeOrGroup.groups.push(attributeGroupMembership);
          }
          if (attributeMetadata == parentAttributeMetadata) {
            group._private.parentAttribute = attributeOrGroup;
          } else if (attributeMetadata == childAttributeMetadata) {
            group._private.childAttribute = attributeOrGroup;
          }
        }
        return group;
      }
    }]);
    return ItemPostParser;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.ItemPostParser = ItemPostParser;
  return __exports;
});
})();