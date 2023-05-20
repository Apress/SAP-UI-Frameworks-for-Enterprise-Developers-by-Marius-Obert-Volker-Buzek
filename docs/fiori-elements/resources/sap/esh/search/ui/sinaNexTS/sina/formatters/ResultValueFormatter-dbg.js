/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./Formatter", "../AttributeType"], function (___Formatter, ___AttributeType) {
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
  /* eslint-disable @typescript-eslint/no-this-alias */
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var Formatter = ___Formatter["Formatter"];
  var AttributeType = ___AttributeType["AttributeType"];
  var ResultValueFormatter = /*#__PURE__*/function (_Formatter) {
    _inherits(ResultValueFormatter, _Formatter);
    var _super = _createSuper(ResultValueFormatter);
    function ResultValueFormatter() {
      _classCallCheck(this, ResultValueFormatter);
      return _super.apply(this, arguments);
    }
    _createClass(ResultValueFormatter, [{
      key: "initAsync",
      value:
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      function initAsync() {
        return Promise.resolve();
      }
    }, {
      key: "format",
      value: function format(resultSet) {
        return this._formatDataInUI5Form(resultSet);
      }
    }, {
      key: "formatAsync",
      value: function formatAsync(resultSet) {
        resultSet = this._formatDataInUI5Form(resultSet);
        return Promise.resolve(resultSet);
      }
    }, {
      key: "_formatDataInUI5Form",
      value: function _formatDataInUI5Form(resultSet) {
        if (typeof window === "undefined" || typeof window.sap === "undefined" || typeof window.sap.ui === "undefined" || typeof window.sap.ui.core === "undefined" || typeof window.sap.ui.core.format === "undefined") {
          return resultSet;
        }
        var that = this;
        that.sina = resultSet.sina;
        resultSet.items.forEach(function (item) {
          if (that.sina.getDataSource(item.dataSource.id) === undefined) {
            return;
          }
          if (jQuery.isEmptyObject(that.sina.getDataSource(item.dataSource.id).attributeMetadataMap)) {
            return;
          }
          that.attributeMap = that.sina.getDataSource(item.dataSource.id).attributeMetadataMap;
          item.titleAttributes.forEach(function (attribute) {
            that._formatHybridAttribute(attribute);
          });
          item.titleDescriptionAttributes.forEach(function (attribute) {
            that._formatHybridAttribute(attribute);
          });
          item.detailAttributes.forEach(function (attribute) {
            that._formatHybridAttribute(attribute);
          });
        });
        return resultSet;
      }
    }, {
      key: "_formatHybridAttribute",
      value: function _formatHybridAttribute(attribute) {
        var that = this;
        if (attribute.metadata.type && attribute.metadata.type === AttributeType.Group) {
          // group attributes
          for (var i = 0; i < attribute.attributes.length; i++) {
            // recursive formatting
            that._formatHybridAttribute(attribute.attributes[i].attribute);
          }
        } else {
          // single attribute
          that._formatSingleAttribute(attribute);
        }
      }
    }, {
      key: "_formatSingleAttribute",
      value: function _formatSingleAttribute(attribute) {
        var that = this;
        attribute.valueFormatted = that._getFormattedValue(attribute);
        if (attribute.valueHighlighted === undefined || attribute.valueHighlighted.length === 0) {
          attribute.valueHighlighted = attribute.valueFormatted;
          if (attribute.isHighlighted) {
            // add client-side highlighted value
            attribute.valueHighlighted = "<b>" + attribute.valueHighlighted + "</b>";
          }
        }
      }
    }, {
      key: "_getFormattedValue",
      value: function _getFormattedValue(attribute) {
        if (this.attributeMap[attribute.id] === undefined) {
          // return server-side valueFormatted
          return attribute.valueFormatted;
        }
        var type = AttributeType;
        var ui5Format = undefined;
        var valueDate;
        var attributeValueFormatted = attribute.valueFormatted || attribute.value;
        switch (this.attributeMap[attribute.id].type) {
          case type.Integer:
            ui5Format = window.sap.ui.core.format.NumberFormat.getIntegerInstance();
            break;
          case type.Double:
            ui5Format = window.sap.ui.core.format.NumberFormat.getFloatInstance({
              //"decimals": 2 // not to restrict
            });
            break;
          case type.Timestamp:
            // Date Object: Wed Jan 17 2018 11:48:59 GMT+0100 (Central European Standard Time)
            if (isNaN(Date.parse(attribute.value)) === false) {
              ui5Format = window.sap.ui.core.format.DateFormat.getDateTimeInstance();
              valueDate = new Date(attribute.value);
            }
            break;
          case type.Date:
            // "2019/01/16" -> Date Object: Wed Jan 16 2018 00:00:00 GMT+0100 (Central European Standard Time)
            if (isNaN(Date.parse(attribute.value)) === false) {
              ui5Format = window.sap.ui.core.format.DateFormat.getDateInstance();
              valueDate = new Date(attribute.value);
            }
            break;
          case type.Time:
            // "00:40:32" -> Date Object: Wed Jan 01 1970 00:40:32 GMT+0100 (Central European Standard Time)
            if (isNaN(Date.parse("1970/01/01 " + attribute.value)) === false) {
              ui5Format = window.sap.ui.core.format.DateFormat.getTimeInstance();
              valueDate = new Date("1970/01/01 " + attribute.value);
            }
            break;
        }
        if (valueDate && ui5Format && ui5Format.format(valueDate) !== undefined) {
          // return client-side UI5 formatted value
          attributeValueFormatted = ui5Format.format(valueDate);
        }

        // return server-side valueFormatted
        return attributeValueFormatted;
      }
    }]);
    return ResultValueFormatter;
  }(Formatter);
  var __exports = {
    __esModule: true
  };
  __exports.ResultValueFormatter = ResultValueFormatter;
  return __exports;
});
})();