/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./AttributeType", "./AttributeMetadataBase"], function (___AttributeType, ___AttributeMetadataBase) {
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
  var AttributeType = ___AttributeType["AttributeType"];
  var AttributeMetadataBase = ___AttributeMetadataBase["AttributeMetadataBase"];
  var AttributeGroupMetadata = /*#__PURE__*/function (_AttributeMetadataBas) {
    _inherits(AttributeGroupMetadata, _AttributeMetadataBas);
    var _super = _createSuper(AttributeGroupMetadata);
    // _meta: {
    //     properties: {
    //         type: { // overwrite
    //             required: false,
    //             default: AttributeType.Group
    //         },
    //         label: { // overwrite
    //             required: false
    //         },
    //         isSortable: { // overwrite
    //             required: false,
    //             default: false
    //         },
    //         template: {
    //             required: false
    //         },
    //         attributes: { // array of AttributeGroupMembership instances
    //             required: true,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //         displayAttributes{ // array of attibutes to be displayed
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    // TODO: why? Only used in AttributeMetadataBase..
    // TODO: why? Only used in AttributeMetadataBase..

    function AttributeGroupMetadata(properties) {
      var _properties$id, _properties$usage, _properties$label, _properties$isSortabl, _properties$template, _properties$attribute, _properties$displayAt;
      var _this;
      _classCallCheck(this, AttributeGroupMetadata);
      _this = _super.call(this, properties);
      _defineProperty(_assertThisInitialized(_this), "type", AttributeType.Group);
      _defineProperty(_assertThisInitialized(_this), "isSortable", false);
      _defineProperty(_assertThisInitialized(_this), "attributes", []);
      _defineProperty(_assertThisInitialized(_this), "displayAttributes", []);
      _this.id = (_properties$id = properties.id) !== null && _properties$id !== void 0 ? _properties$id : _this.id;
      _this.usage = (_properties$usage = properties.usage) !== null && _properties$usage !== void 0 ? _properties$usage : _this.usage;
      _this.label = (_properties$label = properties.label) !== null && _properties$label !== void 0 ? _properties$label : _this.label;
      _this.isSortable = (_properties$isSortabl = properties.isSortable) !== null && _properties$isSortabl !== void 0 ? _properties$isSortabl : _this.isSortable;
      _this.template = (_properties$template = properties.template) !== null && _properties$template !== void 0 ? _properties$template : _this.template;
      _this.attributes = (_properties$attribute = properties.attributes) !== null && _properties$attribute !== void 0 ? _properties$attribute : _this.attributes;
      _this.displayAttributes = (_properties$displayAt = properties.displayAttributes) !== null && _properties$displayAt !== void 0 ? _properties$displayAt : _this.displayAttributes;
      return _this;
    }
    return _createClass(AttributeGroupMetadata);
  }(AttributeMetadataBase);
  var __exports = {
    __esModule: true
  };
  __exports.AttributeGroupMetadata = AttributeGroupMetadata;
  return __exports;
});
})();