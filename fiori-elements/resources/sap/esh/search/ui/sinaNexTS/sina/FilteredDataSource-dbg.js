/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./DataSource"], function (___DataSource) {
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
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
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
  var DataSource = ___DataSource["DataSource"];
  var FilteredDataSource = /*#__PURE__*/function (_DataSource) {
    _inherits(FilteredDataSource, _DataSource);
    var _super = _createSuper(FilteredDataSource);
    function FilteredDataSource(properties) {
      var _properties$annotatio, _properties$hidden, _properties$attribute, _properties$attribute2, _properties$attribute3, _properties$attribute4, _properties$isHierarc, _properties$hierarchy, _properties$hierarchy2, _properties$hierarchy3, _properties$hierarchy4;
      var _this;
      _classCallCheck(this, FilteredDataSource);
      properties.annotations = (_properties$annotatio = properties.annotations) !== null && _properties$annotatio !== void 0 ? _properties$annotatio : properties.dataSource.annotations;
      properties.hidden = (_properties$hidden = properties.hidden) !== null && _properties$hidden !== void 0 ? _properties$hidden : properties.dataSource.hidden;
      properties.attributesMetadata = (_properties$attribute = properties.attributesMetadata) !== null && _properties$attribute !== void 0 ? _properties$attribute : properties.dataSource.attributesMetadata;
      properties.attributeMetadataMap = (_properties$attribute2 = properties.attributeMetadataMap) !== null && _properties$attribute2 !== void 0 ? _properties$attribute2 : properties.dataSource.attributeMetadataMap;
      properties.attributeGroupsMetadata = (_properties$attribute3 = properties.attributeGroupsMetadata) !== null && _properties$attribute3 !== void 0 ? _properties$attribute3 : properties.dataSource.attributeGroupsMetadata;
      properties.attributeGroupMetadataMap = (_properties$attribute4 = properties.attributeGroupMetadataMap) !== null && _properties$attribute4 !== void 0 ? _properties$attribute4 : properties.dataSource.attributeGroupMetadataMap;
      properties.isHierarchyDefinition = (_properties$isHierarc = properties.isHierarchyDefinition) !== null && _properties$isHierarc !== void 0 ? _properties$isHierarc : properties.dataSource.isHierarchyDefinition;
      properties.hierarchyName = (_properties$hierarchy = properties.hierarchyName) !== null && _properties$hierarchy !== void 0 ? _properties$hierarchy : properties.dataSource.hierarchyName;
      properties.hierarchyDisplayType = (_properties$hierarchy2 = properties.hierarchyDisplayType) !== null && _properties$hierarchy2 !== void 0 ? _properties$hierarchy2 : properties.dataSource.hierarchyDisplayType;
      properties.hierarchyAttribute = (_properties$hierarchy3 = properties.hierarchyAttribute) !== null && _properties$hierarchy3 !== void 0 ? _properties$hierarchy3 : properties.dataSource.hierarchyAttribute;
      properties.hierarchyHelperDatasource = (_properties$hierarchy4 = properties.hierarchyHelperDatasource) !== null && _properties$hierarchy4 !== void 0 ? _properties$hierarchy4 : properties.dataSource.hierarchyHelperDatasource;
      _this = _super.call(this, properties);
      _this.dataSource = properties.dataSource;
      _this.filterCondition = properties.filterCondition;
      return _this;
    }
    return _createClass(FilteredDataSource);
  }(DataSource);
  var __exports = {
    __esModule: true
  };
  __exports.FilteredDataSource = FilteredDataSource;
  return __exports;
});
})();