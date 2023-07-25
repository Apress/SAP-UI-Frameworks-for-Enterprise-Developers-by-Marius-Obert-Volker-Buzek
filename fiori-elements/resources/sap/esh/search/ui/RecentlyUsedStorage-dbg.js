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
sap.ui.define(["sap/base/Log", "./i18n", "./SearchHelper", "./sinaNexTS/sina/ComplexCondition", "./sinaNexTS/sina/HierarchyDisplayType", "./suggestions/SuggestionType"], function (Log, __i18n, ___SearchHelper, ___sinaNexTS_sina_ComplexCondition, ___sinaNexTS_sina_HierarchyDisplayType, ___suggestions_SuggestionType) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
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
  var i18n = _interopRequireDefault(__i18n);
  var getHashFromUrl = ___SearchHelper["getHashFromUrl"];
  var parseUrlParameters = ___SearchHelper["parseUrlParameters"];
  var ComplexCondition = ___sinaNexTS_sina_ComplexCondition["ComplexCondition"];
  var HierarchyDisplayType = ___sinaNexTS_sina_HierarchyDisplayType["HierarchyDisplayType"];
  var SuggestionType = ___suggestions_SuggestionType["Type"];
  var SuggestionProperties = ___suggestions_SuggestionType["SuggestionType"];
  var RecentlyUsedStorage = /*#__PURE__*/function () {
    function RecentlyUsedStorage(properties) {
      _classCallCheck(this, RecentlyUsedStorage);
      _defineProperty(this, "maxItems", 10);
      _defineProperty(this, "key", "ESH-Recent-Searches");
      this.personalizationStorage = properties.personalizationStorage;
      this._oLogger = Log.getLogger("sap.esh.search.ui.RecentlyUsedStorage");
      this.maxItems = properties.maxItems || 10;
      this.searchModel = properties.searchModel;
    }
    _createClass(RecentlyUsedStorage, [{
      key: "deleteAllItems",
      value: function deleteAllItems() {
        try {
          const _this2 = this;
          _this2.personalizationStorage.deleteItem(_this2.key);
          return _await(_this2.personalizationStorage.save());
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "assembleLabel",
      value: function assembleLabel(searchTerm, dataSource) {
        // if the model has more than one data source, add the data source to the label:
        if (this.searchModel.getProperty("/dataSources").length > 1) {
          return i18n.getText("resultsIn", ["<span>" + searchTerm + "</span>", dataSource.labelPlural]);
        }
        return searchTerm;
      }
    }, {
      key: "hasFilter",
      value: function hasFilter(item) {
        var params = parseUrlParameters(item.url);
        if (typeof params.filter === "string") {
          try {
            var _this$searchModel$con;
            var filter = JSON.parse(params.filter);
            var rootCondition = new ComplexCondition({
              operator: filter.rootCondition.operator,
              conditions: filter.rootCondition.conditions
            });
            if (this.filterWithoutFilterByCondition(rootCondition)) {
              return false;
            }
            // DWC exit, space facet is not a filter, should be removed after replacing space facet
            if ((_this$searchModel$con = this.searchModel.config) !== null && _this$searchModel$con !== void 0 && _this$searchModel$con.dimensionNameSpace_Description) {
              var _this$searchModel$con2;
              var spaceConditions = rootCondition.getAttributeConditions((_this$searchModel$con2 = this.searchModel.config) === null || _this$searchModel$con2 === void 0 ? void 0 : _this$searchModel$con2.dimensionNameSpace_Description);
              if (spaceConditions.length === 1 && rootCondition.conditions.length === 1) {
                return false;
              }
            }
            return filter.rootCondition.conditions.length > 0;
          } catch (e) {
            this._oLogger.error(e);
            return false;
          }
        }
        return false;
      }
    }, {
      key: "filterWithoutFilterByCondition",
      value: function filterWithoutFilterByCondition(rootCondition) {
        var nonFilterByConditioins = [];
        var _iterator = _createForOfIteratorHelper(this.searchModel.getProperty("/uiFilter").rootCondition.getAttributes()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var attribute = _step.value;
            var attributeMetadata = this.searchModel.getProperty("/uiFilter").dataSource.attributeMetadataMap[attribute];
            if (attributeMetadata && attributeMetadata.isHierarchy === true && attributeMetadata.hierarchyDisplayType === HierarchyDisplayType.StaticHierarchyFacet) {
              nonFilterByConditioins.push(rootCondition.getAttributeConditions(attribute));
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return nonFilterByConditioins.length === rootCondition.conditions.length;
      }
    }, {
      key: "getItems",
      value: function getItems() {
        var _this$personalization;
        return (_this$personalization = this.personalizationStorage.getItem("ESH-Recent-Searches")) !== null && _this$personalization !== void 0 ? _this$personalization : [];
      }

      /**
       * Adds a search to the recent store. Item at index 0 is newest entry. If item is omitted, the current search will be saved.
       **/
    }, {
      key: "addItem",
      value: function addItem() {
        var _item$searchTerm,
          _item$dataSource,
          _item$dataSource$id,
          _item$dataSource2,
          _item$dataSource$labe,
          _item$dataSource3,
          _ref,
          _item$url,
          _item$titleNavigation,
          _item$icon,
          _item$titleNavigation2,
          _item$titleNavigation3,
          _this = this;
        var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          label: ""
        };
        if (!this.personalizationStorage.isStorageOfPersonalDataAllowed()) return;
        var searchTerm = (_item$searchTerm = item.searchTerm) !== null && _item$searchTerm !== void 0 ? _item$searchTerm : this.searchModel.getSearchBoxTerm();
        if (!searchTerm || searchTerm === "*" || searchTerm === "") return; // do not save in these cases
        var recentItem = {
          label: item.label || this.assembleLabel(searchTerm, (_item$dataSource = item.dataSource) !== null && _item$dataSource !== void 0 ? _item$dataSource : this.searchModel.getDataSource()),
          dataSourceId: (_item$dataSource$id = (_item$dataSource2 = item.dataSource) === null || _item$dataSource2 === void 0 ? void 0 : _item$dataSource2.id) !== null && _item$dataSource$id !== void 0 ? _item$dataSource$id : this.searchModel.getDataSource().id,
          dataSourceLabel: (_item$dataSource$labe = (_item$dataSource3 = item.dataSource) === null || _item$dataSource3 === void 0 ? void 0 : _item$dataSource3.labelPlural) !== null && _item$dataSource$labe !== void 0 ? _item$dataSource$labe : this.searchModel.getDataSource().labelPlural,
          url: (_ref = (_item$url = item.url) !== null && _item$url !== void 0 ? _item$url : (_item$titleNavigation = item.titleNavigation) === null || _item$titleNavigation === void 0 ? void 0 : _item$titleNavigation._href) !== null && _ref !== void 0 ? _ref : getHashFromUrl(),
          // item.url must be url encoded!
          icon: (_item$icon = item.icon) !== null && _item$icon !== void 0 ? _item$icon : "sap-icon://search",
          uiSuggestionType: SuggestionType.Recent,
          originalUiSuggestionType: item.uiSuggestionType,
          position: SuggestionProperties.properties.Recent.position,
          storedAt: Date.now(),
          searchTerm: searchTerm,
          // object suggestion properties:
          imageUrl: item.imageUrl,
          imageExists: item.imageExists,
          imageIsCircular: item.imageIsCircular,
          exists: item.exists,
          label1: item.label1,
          label2: item.label2,
          titleNavigation: {
            _href: (_item$titleNavigation2 = item.titleNavigation) === null || _item$titleNavigation2 === void 0 ? void 0 : _item$titleNavigation2._href,
            _target: (_item$titleNavigation3 = item.titleNavigation) === null || _item$titleNavigation3 === void 0 ? void 0 : _item$titleNavigation3._target
          }
        };
        if (this.hasFilter(recentItem)) {
          recentItem.filterIcon = "sap-icon://filter";
        }
        var items = this.getItems();
        var found = items.some(function (item, index, items) {
          // remove the same existing items:
          if (item.label === recentItem.label && item.icon === recentItem.icon) {
            _this._oLogger.debug("Removing already existing item " + recentItem.label + " at pos " + index);
            items.splice(index, 1);
            return true;
          }
        });
        if (!found) {
          // new item, remove oldest:
          if (items.length >= this.maxItems) {
            var oldest = items.pop();
            this._oLogger.debug("Removing oldest item " + oldest.label);
          }
        }
        this._oLogger.debug("Adding item " + recentItem.label);
        items.unshift(recentItem);
        this.personalizationStorage.setItem("ESH-Recent-Searches", items);
      }
    }]);
    return RecentlyUsedStorage;
  }();
  return RecentlyUsedStorage;
});
})();