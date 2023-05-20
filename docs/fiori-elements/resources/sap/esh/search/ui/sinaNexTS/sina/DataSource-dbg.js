/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./SinaObject", "./DataSourceType", "./AttributeMetadata", "../core/errors", "./MatchingStrategy", "./AttributeType"], function (___SinaObject, ___DataSourceType, ___AttributeMetadata, ___core_errors, ___MatchingStrategy, ___AttributeType) {
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
  var SinaObject = ___SinaObject["SinaObject"];
  var DataSourceType = ___DataSourceType["DataSourceType"];
  var AttributeMetadata = ___AttributeMetadata["AttributeMetadata"];
  var DataSourceAttributeMetadataNotFoundError = ___core_errors["DataSourceAttributeMetadataNotFoundError"];
  var MatchingStrategy = ___MatchingStrategy["MatchingStrategy"];
  var AttributeType = ___AttributeType["AttributeType"];
  var DataSource = /*#__PURE__*/function (_SinaObject) {
    _inherits(DataSource, _SinaObject);
    var _super = _createSuper(DataSource);
    function DataSource(properties) {
      var _properties$annotatio, _properties$type, _properties$id, _properties$label, _properties$labelPlur, _properties$hidden, _properties$usage, _properties$attribute, _properties$attribute2, _properties$attribute3, _properties$attribute4;
      var _this;
      _classCallCheck(this, DataSource);
      _this = _super.call(this, {
        sina: properties.sina
      });
      _defineProperty(_assertThisInitialized(_this), "hidden", false);
      _defineProperty(_assertThisInitialized(_this), "usage", {});
      _defineProperty(_assertThisInitialized(_this), "attributesMetadata", []);
      _defineProperty(_assertThisInitialized(_this), "attributeMetadataMap", {});
      _defineProperty(_assertThisInitialized(_this), "attributeGroupsMetadata", []);
      _defineProperty(_assertThisInitialized(_this), "attributeGroupMetadataMap", {});
      _this.annotations = (_properties$annotatio = properties.annotations) !== null && _properties$annotatio !== void 0 ? _properties$annotatio : _this.annotations;
      _this.type = (_properties$type = properties.type) !== null && _properties$type !== void 0 ? _properties$type : _this.type;
      _this.subType = properties.subType;
      _this.id = (_properties$id = properties.id) !== null && _properties$id !== void 0 ? _properties$id : _this.id;
      _this.label = (_properties$label = properties.label) !== null && _properties$label !== void 0 ? _properties$label : _this.label;
      _this.labelPlural = (_properties$labelPlur = properties.labelPlural) !== null && _properties$labelPlur !== void 0 ? _properties$labelPlur : _this.labelPlural;
      _this.icon = properties.icon;
      _this.hidden = (_properties$hidden = properties.hidden) !== null && _properties$hidden !== void 0 ? _properties$hidden : _this.hidden;
      _this.usage = (_properties$usage = properties.usage) !== null && _properties$usage !== void 0 ? _properties$usage : _this.usage;
      _this.attributesMetadata = (_properties$attribute = properties.attributesMetadata) !== null && _properties$attribute !== void 0 ? _properties$attribute : _this.attributesMetadata;
      _this.attributeMetadataMap = (_properties$attribute2 = properties.attributeMetadataMap) !== null && _properties$attribute2 !== void 0 ? _properties$attribute2 : _this.createAttributeMetadataMap(_this.attributesMetadata);
      _this.attributeGroupsMetadata = (_properties$attribute3 = properties.attributeGroupsMetadata) !== null && _properties$attribute3 !== void 0 ? _properties$attribute3 : _this.attributeGroupsMetadata;
      _this.attributeGroupMetadataMap = (_properties$attribute4 = properties.attributeGroupMetadataMap) !== null && _properties$attribute4 !== void 0 ? _properties$attribute4 : _this.attributeGroupMetadataMap;
      _this.isHierarchyDefinition = properties.isHierarchyDefinition;
      _this.hierarchyName = properties.hierarchyName;
      _this.hierarchyDisplayType = properties.hierarchyDisplayType;
      _this.hierarchyAttribute = properties.hierarchyAttribute;
      _this.hierarchyHelperDatasource = properties.hierarchyHelperDatasource;
      if (!_this.labelPlural || _this.labelPlural.length === 0) {
        _this.labelPlural = _this.label;
      }
      if (_this.type === DataSourceType.BusinessObject && _this.attributesMetadata.length === 0) {
        /*      throw new DataSourceAttributeMetadataNotFoundError(
            "Could not find metadata for attributes in data source " + this.id + ". "
        );*/
      }

      // filtered datasources reuse the metadata of the referred datasource
      // (instances of attributeMetadataMap identical)
      // therefore the following line is deactivated
      // this.attributeMetadataMap = this.createAttributeMetadataMap(this.attributesMetadata);
      return _this;
    }

    // equals(): boolean {
    //     throw new Error(
    //         "use === operator for comparison of datasources"
    //     );
    // }
    _createClass(DataSource, [{
      key: "_configure",
      value: function _configure() {
        // do not use
        // legacy: only called from inav2 provider
        var metadataFormatters = this.sina.metadataFormatters;
        if (!metadataFormatters) {
          return;
        }
        for (var i = 0; i < metadataFormatters.length; ++i) {
          var metadataFormatter = metadataFormatters[i];
          metadataFormatter.format({
            dataSources: [this]
          });
        }
      }
    }, {
      key: "createAttributeMetadataMap",
      value: function createAttributeMetadataMap() {
        var attributesMetadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var map = {};
        for (var i = 0; i < attributesMetadata.length; ++i) {
          var attributeMetadata = attributesMetadata[i];
          map[attributeMetadata.id] = attributeMetadata;
        }
        return map;
      }
    }, {
      key: "getAttributeMetadata",
      value: function getAttributeMetadata(attributeId) {
        if (this.id === "All") {
          return this.getCommonAttributeMetadata(attributeId); // for all we have only common attributes
        }
        // Fake metadata for transaction suggestions because transaction connector is not part
        // of the connector dropdown and as such is not part of the connector metadata response:
        if (this.id === "CD$ALL~ESH_TRANSACTION~" && (attributeId === "TCDTEXT" || attributeId === "TCODE") && !this.attributeMetadataMap[attributeId]) {
          this.attributeMetadataMap[attributeId] = new AttributeMetadata({
            label: "label",
            isSortable: false,
            isKey: false,
            matchingStrategy: MatchingStrategy.Text,
            id: attributeId,
            usage: {
              Title: {
                displayOrder: 1
              }
            },
            type: AttributeType.String
          });
        }
        var attributeMetadata = this.attributeMetadataMap[attributeId];
        if (attributeMetadata) {
          return attributeMetadata;
        }
        throw new DataSourceAttributeMetadataNotFoundError("Could not find metadata for attribute " + attributeId + " in data source " + this.id + ". ");
      }
    }, {
      key: "getCommonAttributeMetadata",
      value: function getCommonAttributeMetadata(attributeId) {
        var _iterator = _createForOfIteratorHelper(this.sina.dataSources),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var dataSource = _step.value;
            if (dataSource.type !== DataSourceType.BusinessObject) {
              continue;
            }
            var attributeMetadata = dataSource.attributeMetadataMap[attributeId];
            if (attributeMetadata) {
              return attributeMetadata;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        throw new DataSourceAttributeMetadataNotFoundError("Could not find metadata for common attribute " + attributeId + " in data source " + this.id + ". ");
      }
    }, {
      key: "toJson",
      value: function toJson() {
        return {
          type: this.type,
          id: this.id,
          label: this.label,
          labelPlural: this.labelPlural
        };
      }
    }], [{
      key: "getAllDataSource",
      value: function getAllDataSource() {
        return new DataSource({
          id: "All",
          label: "All",
          type: DataSourceType.Category
        });
      }
    }]);
    return DataSource;
  }(SinaObject);
  var __exports = {
    __esModule: true
  };
  __exports.DataSource = DataSource;
  return __exports;
});
})();