/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./AttributeMetadataBase"], function (___AttributeMetadataBase) {
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
  var AttributeMetadataBase = ___AttributeMetadataBase["AttributeMetadataBase"];
  var AttributeMetadata = /*#__PURE__*/function (_AttributeMetadataBas) {
    _inherits(AttributeMetadata, _AttributeMetadataBas);
    var _super = _createSuper(AttributeMetadata);
    // _meta: {
    //     properties: {
    //         type: {
    //             required: true
    //         },
    //         label: {
    //             required: true
    //         },
    //         isSortable: {
    //             required: true
    //         },
    //         format: {
    //             required: false
    //             // TODO: multiple: true?
    //         },
    //         isKey: { // TODO: replace/amend with keyAttribute in SearchResultSetItem
    //             required: true
    //         },
    //         semantics: {
    //             required: false
    //         },
    //         matchingStrategy: {
    //             required: true
    //         }
    //     }
    // }

    function AttributeMetadata(properties) {
      var _properties$label, _properties$isSortabl, _properties$format, _properties$isKey, _properties$semantics, _properties$matchingS, _properties$isHierarc;
      var _this;
      _classCallCheck(this, AttributeMetadata);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "_private", {
        semanticObjectType: "",
        temporaryUsage: {}
      });
      _this.label = (_properties$label = properties.label) !== null && _properties$label !== void 0 ? _properties$label : _this.label;
      _this.isSortable = (_properties$isSortabl = properties.isSortable) !== null && _properties$isSortabl !== void 0 ? _properties$isSortabl : _this.isSortable;
      _this.format = (_properties$format = properties.format) !== null && _properties$format !== void 0 ? _properties$format : _this.format;
      _this.isKey = (_properties$isKey = properties.isKey) !== null && _properties$isKey !== void 0 ? _properties$isKey : _this.isKey;
      _this.semantics = (_properties$semantics = properties.semantics) !== null && _properties$semantics !== void 0 ? _properties$semantics : _this.semantics;
      _this.matchingStrategy = (_properties$matchingS = properties.matchingStrategy) !== null && _properties$matchingS !== void 0 ? _properties$matchingS : _this.matchingStrategy;
      _this.isHierarchy = (_properties$isHierarc = properties.isHierarchy) !== null && _properties$isHierarc !== void 0 ? _properties$isHierarc : false;
      _this.hierarchyName = properties.hierarchyName;
      _this.hierarchyDisplayType = properties.hierarchyDisplayType;
      _this.iconUrlAttributeName = properties.iconUrlAttributeName;
      return _this;
    }
    return _createClass(AttributeMetadata);
  }(AttributeMetadataBase);
  var __exports = {
    __esModule: true
  };
  __exports.AttributeMetadata = AttributeMetadata;
  return __exports;
});
})();