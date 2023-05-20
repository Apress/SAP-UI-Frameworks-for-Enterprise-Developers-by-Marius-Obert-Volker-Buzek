/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;
      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }
      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);
        _cache.set(Class, Wrapper);
      }
      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }
      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };
    return _wrapNativeSuper(Class);
  }
  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct.bind();
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }
    return _construct.apply(null, arguments);
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
  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  // =========================================================================
  // Exception Class
  // =========================================================================
  var ESHClientError = /*#__PURE__*/function (_Error) {
    _inherits(ESHClientError, _Error);
    var _super = _createSuper(ESHClientError);
    function ESHClientError(properties) {
      var _properties$message, _properties$name;
      var _this;
      _classCallCheck(this, ESHClientError);
      _this = _super.call(this, properties.message);
      _this.message = (_properties$message = properties.message) !== null && _properties$message !== void 0 ? _properties$message : "Unspecified ESH Client Error";
      _this.name = (_properties$name = properties.name) !== null && _properties$name !== void 0 ? _properties$name : "ESHClientError";
      _this.previous = properties.previous;
      return _this;
    }
    _createClass(ESHClientError, [{
      key: "toString",
      value: function toString() {
        return this.name + ": " + this.message;
      }
    }]);
    return ESHClientError;
  }( /*#__PURE__*/_wrapNativeSuper(Error)); // =========================================================================
  // List of all Sina Exceptions
  // =========================================================================
  var InternalESHClientError = /*#__PURE__*/function (_ESHClientError) {
    _inherits(InternalESHClientError, _ESHClientError);
    var _super2 = _createSuper(InternalESHClientError);
    function InternalESHClientError(message) {
      _classCallCheck(this, InternalESHClientError);
      var properties = {
        name: "InternalESHClientError",
        message: message !== null && message !== void 0 ? message : "Internal ESH Client Error"
      };
      return _super2.call(this, properties);
    }
    return _createClass(InternalESHClientError);
  }(ESHClientError);
  function ajaxErrorFactory(xhttp, responseHeaders) {
    // try to find out what kind of error it is:
    var genericAjaxError = new AjaxError(xhttp, responseHeaders);
    try {
      var _parsedError, _parsedError$Error, _parsedError2, _parsedError2$Error, _parsedError3, _parsedError3$error, _parsedError4, _parsedError4$error, _parsedError4$error$m, _parsedError5, _parsedError5$error;
      var parsedError;
      if (xhttp !== null && xhttp !== void 0 && xhttp.responseText) {
        parsedError = JSON.parse(xhttp === null || xhttp === void 0 ? void 0 : xhttp.responseText);
      }

      // InA V2
      if ((_parsedError = parsedError) !== null && _parsedError !== void 0 && (_parsedError$Error = _parsedError.Error) !== null && _parsedError$Error !== void 0 && _parsedError$Error.Code && (_parsedError2 = parsedError) !== null && _parsedError2 !== void 0 && (_parsedError2$Error = _parsedError2.Error) !== null && _parsedError2$Error !== void 0 && _parsedError2$Error.Message) {
        // parse main error code
        return new ABAPInAV2Error(xhttp);
      }

      // abap_odata
      if ((_parsedError3 = parsedError) !== null && _parsedError3 !== void 0 && (_parsedError3$error = _parsedError3.error) !== null && _parsedError3$error !== void 0 && _parsedError3$error.code && (_parsedError4 = parsedError) !== null && _parsedError4 !== void 0 && (_parsedError4$error = _parsedError4.error) !== null && _parsedError4$error !== void 0 && (_parsedError4$error$m = _parsedError4$error.message) !== null && _parsedError4$error$m !== void 0 && _parsedError4$error$m.value) {
        return new ABAPODataError(xhttp);
      }

      // hana_odata
      if ((_parsedError5 = parsedError) !== null && _parsedError5 !== void 0 && (_parsedError5$error = _parsedError5.error) !== null && _parsedError5$error !== void 0 && _parsedError5$error.details) {
        return new HANAODataError(xhttp);
      }

      // dont know what it is, return a generic error:
      return genericAjaxError;
    } catch (e) {
      // server sent JSON which couldn't be parsed:
      var extractError = new InternalESHClientError("Error while extracting server error");
      extractError.previous = e;
      genericAjaxError.previous = extractError;
      return genericAjaxError;
    }
  }
  var AjaxError = /*#__PURE__*/function (_ESHClientError2) {
    _inherits(AjaxError, _ESHClientError2);
    var _super3 = _createSuper(AjaxError);
    function AjaxError(xhttp, responseHeaders) {
      var _xhttp$statusText, _xhttp$responseText;
      var _this2;
      _classCallCheck(this, AjaxError);
      var status = xhttp.status;
      var statusText = (_xhttp$statusText = xhttp.statusText) !== null && _xhttp$statusText !== void 0 ? _xhttp$statusText : "";
      var responseText = (_xhttp$responseText = xhttp.responseText) !== null && _xhttp$responseText !== void 0 ? _xhttp$responseText : "";
      // let headers = "";
      // if (typeof xhttp.getAllResponseHeaders !== "undefined") {
      //     headers = xhttp.getAllResponseHeaders();
      // }
      _this2 = _super3.call(this, {
        message: status + ": " + statusText + " - " + responseText,
        name: "ESHAjaxError"
      });
      _this2.xhttp = xhttp;
      _this2.responseHeaders = responseHeaders;
      return _this2;
    }
    return _createClass(AjaxError);
  }(ESHClientError);
  var ABAPODataError = /*#__PURE__*/function (_ESHClientError3) {
    _inherits(ABAPODataError, _ESHClientError3);
    var _super4 = _createSuper(ABAPODataError);
    function ABAPODataError(xhttp) {
      _classCallCheck(this, ABAPODataError);
      var message = "Internal Server Error";
      if (xhttp !== null && xhttp !== void 0 && xhttp.responseText) {
        var _parsedError$error, _parsedError$error2, _parsedError$error2$m;
        var parsedError = JSON.parse(xhttp === null || xhttp === void 0 ? void 0 : xhttp.responseText);
        if (parsedError !== null && parsedError !== void 0 && (_parsedError$error = parsedError.error) !== null && _parsedError$error !== void 0 && _parsedError$error.code) {
          // abap_odata
          message = parsedError.error.code;
        }
        if (parsedError !== null && parsedError !== void 0 && (_parsedError$error2 = parsedError.error) !== null && _parsedError$error2 !== void 0 && (_parsedError$error2$m = _parsedError$error2.message) !== null && _parsedError$error2$m !== void 0 && _parsedError$error2$m.value) {
          message += ": " + parsedError.error.message.value;
        }
      }
      return _super4.call(this, {
        message: message,
        name: "ESHABAPODataError"
      });
    }
    return _createClass(ABAPODataError);
  }(ESHClientError);
  var ABAPInAV2Error = /*#__PURE__*/function (_ESHClientError4) {
    _inherits(ABAPInAV2Error, _ESHClientError4);
    var _super5 = _createSuper(ABAPInAV2Error);
    function ABAPInAV2Error(xhttp) {
      _classCallCheck(this, ABAPInAV2Error);
      var message = ["Internal Server Error"];
      if (xhttp !== null && xhttp !== void 0 && xhttp.responseText) {
        var _parsedError$Error2, _parsedError$Error3;
        var parsedError = JSON.parse(xhttp === null || xhttp === void 0 ? void 0 : xhttp.responseText);
        if (parsedError !== null && parsedError !== void 0 && (_parsedError$Error2 = parsedError.Error) !== null && _parsedError$Error2 !== void 0 && _parsedError$Error2.Code && parsedError !== null && parsedError !== void 0 && (_parsedError$Error3 = parsedError.Error) !== null && _parsedError$Error3 !== void 0 && _parsedError$Error3.Message) {
          // parse main error code
          message.push(parsedError.Error.Code + ": " + parsedError.Error.Message);
        }
        // InA V2 parse error details
        if (parsedError !== null && parsedError !== void 0 && parsedError.ErrorDetails) {
          for (var i = 0; i < parsedError.ErrorDetails.length; ++i) {
            var errorDetail = parsedError.ErrorDetails[i];
            message.push(errorDetail.Code + ": " + errorDetail.Message);
          }
        }
        // InA V2 parse additional messages
        if (parsedError !== null && parsedError !== void 0 && parsedError.Messages) {
          for (var j = 0; j < parsedError.Messages.length; ++j) {
            var errorMessage = parsedError.Messages[j];
            message.push(errorMessage.Number + ": " + errorMessage.Text + " (" + errorMessage.Type + ")");
          }
        }
      }
      return _super5.call(this, {
        message: message.join("\n"),
        name: "ESHINAV2Error"
      });
    }
    return _createClass(ABAPInAV2Error);
  }(ESHClientError);
  var HANAODataError = /*#__PURE__*/function (_ESHClientError5) {
    _inherits(HANAODataError, _ESHClientError5);
    var _super6 = _createSuper(HANAODataError);
    function HANAODataError(xhttp) {
      _classCallCheck(this, HANAODataError);
      var message = "Internal Server Error";
      if (xhttp !== null && xhttp !== void 0 && xhttp.responseText) {
        var _parsedError$error3;
        var parsedError = JSON.parse(xhttp === null || xhttp === void 0 ? void 0 : xhttp.responseText);
        if (parsedError !== null && parsedError !== void 0 && (_parsedError$error3 = parsedError.error) !== null && _parsedError$error3 !== void 0 && _parsedError$error3.details) {
          message = parsedError.error.details;
        }
      }
      return _super6.call(this, {
        message: message,
        name: "ESHHANAODataError"
      });
    }
    return _createClass(HANAODataError);
  }(ESHClientError);
  var NoJSONDateError = /*#__PURE__*/function (_ESHClientError6) {
    _inherits(NoJSONDateError, _ESHClientError6);
    var _super7 = _createSuper(NoJSONDateError);
    function NoJSONDateError(message) {
      _classCallCheck(this, NoJSONDateError);
      var properties = {
        name: "NoJSONDateError",
        message: message !== null && message !== void 0 ? message : "No JSON Date"
      };
      return _super7.call(this, properties);
    }
    return _createClass(NoJSONDateError);
  }(ESHClientError);
  var TimeOutError = /*#__PURE__*/function (_ESHClientError7) {
    _inherits(TimeOutError, _ESHClientError7);
    var _super8 = _createSuper(TimeOutError);
    function TimeOutError(message) {
      _classCallCheck(this, TimeOutError);
      var properties = {
        name: "TimeOutError",
        message: message !== null && message !== void 0 ? message : "Time out"
      };
      return _super8.call(this, properties);
    }
    return _createClass(TimeOutError);
  }(ESHClientError);
  var NotImplementedError = /*#__PURE__*/function (_ESHClientError8) {
    _inherits(NotImplementedError, _ESHClientError8);
    var _super9 = _createSuper(NotImplementedError);
    function NotImplementedError() {
      _classCallCheck(this, NotImplementedError);
      return _super9.call(this, {
        message: "Not implemented",
        name: "ESHNotImplementedError"
      });
    }
    return _createClass(NotImplementedError);
  }(ESHClientError);
  var ForcedBySearchTermTestError = /*#__PURE__*/function (_ESHClientError9) {
    _inherits(ForcedBySearchTermTestError, _ESHClientError9);
    var _super10 = _createSuper(ForcedBySearchTermTestError);
    function ForcedBySearchTermTestError() {
      _classCallCheck(this, ForcedBySearchTermTestError);
      var properties = {
        name: "ForcedBySearchTermTestError",
        message: "Forced error, triggered by search term '".concat(ForcedBySearchTermTestError.forcedBySearchTerm, "'.")
      };
      return _super10.call(this, properties);
    }
    return _createClass(ForcedBySearchTermTestError);
  }(ESHClientError);
  _defineProperty(ForcedBySearchTermTestError, "forcedBySearchTerm", "EshForceErrorSearchterm");
  var UnknownAttributeTypeError = /*#__PURE__*/function (_ESHClientError10) {
    _inherits(UnknownAttributeTypeError, _ESHClientError10);
    var _super11 = _createSuper(UnknownAttributeTypeError);
    function UnknownAttributeTypeError(message) {
      _classCallCheck(this, UnknownAttributeTypeError);
      var properties = {
        name: "UnknownAttributeTypeError",
        message: message !== null && message !== void 0 ? message : "Unknown attribute type"
      };
      return _super11.call(this, properties);
    }
    return _createClass(UnknownAttributeTypeError);
  }(ESHClientError);
  var UnknownComparisonOperatorError = /*#__PURE__*/function (_ESHClientError11) {
    _inherits(UnknownComparisonOperatorError, _ESHClientError11);
    var _super12 = _createSuper(UnknownComparisonOperatorError);
    function UnknownComparisonOperatorError(message) {
      _classCallCheck(this, UnknownComparisonOperatorError);
      var properties = {
        name: "UnknownComparisonOperatorError",
        message: message !== null && message !== void 0 ? message : "Unknown comparison operator"
      };
      return _super12.call(this, properties);
    }
    return _createClass(UnknownComparisonOperatorError);
  }(ESHClientError);
  var UnknownLogicalOperatorError = /*#__PURE__*/function (_ESHClientError12) {
    _inherits(UnknownLogicalOperatorError, _ESHClientError12);
    var _super13 = _createSuper(UnknownLogicalOperatorError);
    function UnknownLogicalOperatorError(message) {
      _classCallCheck(this, UnknownLogicalOperatorError);
      var properties = {
        name: "UnknownLogicalOperatorError",
        message: message !== null && message !== void 0 ? message : "Unknown logical operator"
      };
      return _super13.call(this, properties);
    }
    return _createClass(UnknownLogicalOperatorError);
  }(ESHClientError);
  var UnknownPresentationUsageError = /*#__PURE__*/function (_ESHClientError13) {
    _inherits(UnknownPresentationUsageError, _ESHClientError13);
    var _super14 = _createSuper(UnknownPresentationUsageError);
    function UnknownPresentationUsageError(message) {
      _classCallCheck(this, UnknownPresentationUsageError);
      var properties = {
        name: "UnknownPresentationUsageError",
        message: message !== null && message !== void 0 ? message : "Unknown presentation usage"
      };
      return _super14.call(this, properties);
    }
    return _createClass(UnknownPresentationUsageError);
  }(ESHClientError);
  var UnknownDataTypeError = /*#__PURE__*/function (_ESHClientError14) {
    _inherits(UnknownDataTypeError, _ESHClientError14);
    var _super15 = _createSuper(UnknownDataTypeError);
    function UnknownDataTypeError(message) {
      _classCallCheck(this, UnknownDataTypeError);
      var properties = {
        name: "UnknownDataTypeError",
        message: message !== null && message !== void 0 ? message : "Unknown data type"
      };
      return _super15.call(this, properties);
    }
    return _createClass(UnknownDataTypeError);
  }(ESHClientError);
  var UnknownConditionTypeError = /*#__PURE__*/function (_ESHClientError15) {
    _inherits(UnknownConditionTypeError, _ESHClientError15);
    var _super16 = _createSuper(UnknownConditionTypeError);
    function UnknownConditionTypeError(message) {
      _classCallCheck(this, UnknownConditionTypeError);
      var properties = {
        name: "UnknownConditionTypeError",
        message: message !== null && message !== void 0 ? message : "Unknown condition type"
      };
      return _super16.call(this, properties);
    }
    return _createClass(UnknownConditionTypeError);
  }(ESHClientError);
  var InternalServerError = /*#__PURE__*/function (_ESHClientError16) {
    _inherits(InternalServerError, _ESHClientError16);
    var _super17 = _createSuper(InternalServerError);
    function InternalServerError(message) {
      _classCallCheck(this, InternalServerError);
      var properties = {
        name: "InternalServerError",
        message: message !== null && message !== void 0 ? message : "Internal server error"
      };
      return _super17.call(this, properties);
    }
    return _createClass(InternalServerError);
  }(ESHClientError);
  var ESHNotActiveError = /*#__PURE__*/function (_ESHClientError17) {
    _inherits(ESHNotActiveError, _ESHClientError17);
    var _super18 = _createSuper(ESHNotActiveError);
    function ESHNotActiveError(message) {
      _classCallCheck(this, ESHNotActiveError);
      var properties = {
        name: "ESHNotActiveError",
        message: message !== null && message !== void 0 ? message : "Enterprise Search is not active"
      };
      return _super18.call(this, properties);
    }
    return _createClass(ESHNotActiveError);
  }(ESHClientError);
  var FacetsParseError = /*#__PURE__*/function (_ESHClientError18) {
    _inherits(FacetsParseError, _ESHClientError18);
    var _super19 = _createSuper(FacetsParseError);
    function FacetsParseError(message) {
      _classCallCheck(this, FacetsParseError);
      var properties = {
        name: "FacetsParseError",
        message: message !== null && message !== void 0 ? message : "Facets parse error"
      };
      return _super19.call(this, properties);
    }
    return _createClass(FacetsParseError);
  }(ESHClientError);
  var WhyFoundAttributeMetadataMissingError = /*#__PURE__*/function (_ESHClientError19) {
    _inherits(WhyFoundAttributeMetadataMissingError, _ESHClientError19);
    var _super20 = _createSuper(WhyFoundAttributeMetadataMissingError);
    function WhyFoundAttributeMetadataMissingError(message) {
      _classCallCheck(this, WhyFoundAttributeMetadataMissingError);
      var properties = {
        name: "WhyFoundAttributeMetadataMissingError",
        message: message !== null && message !== void 0 ? message : "Why found attribute metadata missing"
      };
      return _super20.call(this, properties);
    }
    return _createClass(WhyFoundAttributeMetadataMissingError);
  }(ESHClientError);
  var TimeConversionError = /*#__PURE__*/function (_ESHClientError20) {
    _inherits(TimeConversionError, _ESHClientError20);
    var _super21 = _createSuper(TimeConversionError);
    function TimeConversionError(message) {
      _classCallCheck(this, TimeConversionError);
      var properties = {
        name: "TimeConversionError",
        message: message !== null && message !== void 0 ? message : "Time conversion error"
      };
      return _super21.call(this, properties);
    }
    return _createClass(TimeConversionError);
  }(ESHClientError);
  var DateConversionError = /*#__PURE__*/function (_ESHClientError21) {
    _inherits(DateConversionError, _ESHClientError21);
    var _super22 = _createSuper(DateConversionError);
    function DateConversionError(message) {
      _classCallCheck(this, DateConversionError);
      var properties = {
        name: "DateConversionError",
        message: message !== null && message !== void 0 ? message : "Date conversion error"
      };
      return _super22.call(this, properties);
    }
    return _createClass(DateConversionError);
  }(ESHClientError);
  var SubProviderError = /*#__PURE__*/function (_ESHClientError22) {
    _inherits(SubProviderError, _ESHClientError22);
    var _super23 = _createSuper(SubProviderError);
    function SubProviderError(message) {
      _classCallCheck(this, SubProviderError);
      var properties = {
        name: "SubProviderError",
        message: message !== null && message !== void 0 ? message : "subprovider error"
      };
      return _super23.call(this, properties);
    }
    return _createClass(SubProviderError);
  }(ESHClientError);
  var CanOnlyAutoInsertComplexConditionError = /*#__PURE__*/function (_ESHClientError23) {
    _inherits(CanOnlyAutoInsertComplexConditionError, _ESHClientError23);
    var _super24 = _createSuper(CanOnlyAutoInsertComplexConditionError);
    function CanOnlyAutoInsertComplexConditionError(message) {
      _classCallCheck(this, CanOnlyAutoInsertComplexConditionError);
      var properties = {
        name: "CanOnlyAutoInsertComplexConditionError",
        message: message !== null && message !== void 0 ? message : "Can only insert complex condition"
      };
      return _super24.call(this, properties);
    }
    return _createClass(CanOnlyAutoInsertComplexConditionError);
  }(ESHClientError);
  var CanNotCreateAlreadyExistingDataSourceError = /*#__PURE__*/function (_ESHClientError24) {
    _inherits(CanNotCreateAlreadyExistingDataSourceError, _ESHClientError24);
    var _super25 = _createSuper(CanNotCreateAlreadyExistingDataSourceError);
    function CanNotCreateAlreadyExistingDataSourceError(message) {
      _classCallCheck(this, CanNotCreateAlreadyExistingDataSourceError);
      var properties = {
        name: "CanNotCreateAlreadyExistingDataSourceError",
        message: message !== null && message !== void 0 ? message : "Can not create already existing data source"
      };
      return _super25.call(this, properties);
    }
    return _createClass(CanNotCreateAlreadyExistingDataSourceError);
  }(ESHClientError);
  var DataSourceInURLDoesNotExistError = /*#__PURE__*/function (_ESHClientError25) {
    _inherits(DataSourceInURLDoesNotExistError, _ESHClientError25);
    var _super26 = _createSuper(DataSourceInURLDoesNotExistError);
    function DataSourceInURLDoesNotExistError(message) {
      _classCallCheck(this, DataSourceInURLDoesNotExistError);
      var properties = {
        name: "DataSourceInURLDoesNotExistError",
        message: message !== null && message !== void 0 ? message : "Data source in url does not exist"
      };
      return _super26.call(this, properties);
    }
    return _createClass(DataSourceInURLDoesNotExistError);
  }(ESHClientError);
  var DataSourceAttributeMetadataNotFoundError = /*#__PURE__*/function (_ESHClientError26) {
    _inherits(DataSourceAttributeMetadataNotFoundError, _ESHClientError26);
    var _super27 = _createSuper(DataSourceAttributeMetadataNotFoundError);
    function DataSourceAttributeMetadataNotFoundError(message) {
      _classCallCheck(this, DataSourceAttributeMetadataNotFoundError);
      var properties = {
        name: "DataSourceAttributeMetadataNotFoundError",
        message: message !== null && message !== void 0 ? message : "data source attribute metadata not found"
      };
      return _super27.call(this, properties);
    }
    return _createClass(DataSourceAttributeMetadataNotFoundError);
  }(ESHClientError);
  var NoValidEnterpriseSearchAPIConfigurationFoundError = /*#__PURE__*/function (_ESHClientError27) {
    _inherits(NoValidEnterpriseSearchAPIConfigurationFoundError, _ESHClientError27);
    var _super28 = _createSuper(NoValidEnterpriseSearchAPIConfigurationFoundError);
    function NoValidEnterpriseSearchAPIConfigurationFoundError(providersTried) {
      _classCallCheck(this, NoValidEnterpriseSearchAPIConfigurationFoundError);
      var properties = {
        name: "NoValidEnterpriseSearchAPIConfigurationFoundError",
        message: "Tried following providers: " + providersTried
      };
      return _super28.call(this, properties);
    }
    return _createClass(NoValidEnterpriseSearchAPIConfigurationFoundError);
  }(ESHClientError);
  var QueryIsReadOnlyError = /*#__PURE__*/function (_ESHClientError28) {
    _inherits(QueryIsReadOnlyError, _ESHClientError28);
    var _super29 = _createSuper(QueryIsReadOnlyError);
    function QueryIsReadOnlyError(message) {
      _classCallCheck(this, QueryIsReadOnlyError);
      var properties = {
        name: "QueryIsReadOnlyError",
        message: message !== null && message !== void 0 ? message : "Query is read only"
      };
      return _super29.call(this, properties);
    }
    return _createClass(QueryIsReadOnlyError);
  }(ESHClientError);
  var InBetweenConditionInConsistent = /*#__PURE__*/function (_ESHClientError29) {
    _inherits(InBetweenConditionInConsistent, _ESHClientError29);
    var _super30 = _createSuper(InBetweenConditionInConsistent);
    function InBetweenConditionInConsistent(message) {
      _classCallCheck(this, InBetweenConditionInConsistent);
      var properties = {
        name: "InBetweenConditionInConsistent",
        message: message !== null && message !== void 0 ? message : "In between condition is inconsistent"
      };
      return _super30.call(this, properties);
    }
    return _createClass(InBetweenConditionInConsistent);
  }(ESHClientError);
  var SinaProgramError = /*#__PURE__*/function (_ESHClientError30) {
    _inherits(SinaProgramError, _ESHClientError30);
    var _super31 = _createSuper(SinaProgramError);
    function SinaProgramError() {
      _classCallCheck(this, SinaProgramError);
      return _super31.call(this, {
        message: "program error in sina",
        name: "SinaProgramErrror"
      });
    }
    return _createClass(SinaProgramError);
  }(ESHClientError);
  var __exports = {
    __esModule: true
  };
  __exports.ESHClientError = ESHClientError;
  __exports.InternalESHClientError = InternalESHClientError;
  __exports.ajaxErrorFactory = ajaxErrorFactory;
  __exports.AjaxError = AjaxError;
  __exports.ABAPODataError = ABAPODataError;
  __exports.ABAPInAV2Error = ABAPInAV2Error;
  __exports.HANAODataError = HANAODataError;
  __exports.NoJSONDateError = NoJSONDateError;
  __exports.TimeOutError = TimeOutError;
  __exports.NotImplementedError = NotImplementedError;
  __exports.ForcedBySearchTermTestError = ForcedBySearchTermTestError;
  __exports.UnknownAttributeTypeError = UnknownAttributeTypeError;
  __exports.UnknownComparisonOperatorError = UnknownComparisonOperatorError;
  __exports.UnknownLogicalOperatorError = UnknownLogicalOperatorError;
  __exports.UnknownPresentationUsageError = UnknownPresentationUsageError;
  __exports.UnknownDataTypeError = UnknownDataTypeError;
  __exports.UnknownConditionTypeError = UnknownConditionTypeError;
  __exports.InternalServerError = InternalServerError;
  __exports.ESHNotActiveError = ESHNotActiveError;
  __exports.FacetsParseError = FacetsParseError;
  __exports.WhyFoundAttributeMetadataMissingError = WhyFoundAttributeMetadataMissingError;
  __exports.TimeConversionError = TimeConversionError;
  __exports.DateConversionError = DateConversionError;
  __exports.SubProviderError = SubProviderError;
  __exports.CanOnlyAutoInsertComplexConditionError = CanOnlyAutoInsertComplexConditionError;
  __exports.CanNotCreateAlreadyExistingDataSourceError = CanNotCreateAlreadyExistingDataSourceError;
  __exports.DataSourceInURLDoesNotExistError = DataSourceInURLDoesNotExistError;
  __exports.DataSourceAttributeMetadataNotFoundError = DataSourceAttributeMetadataNotFoundError;
  __exports.NoValidEnterpriseSearchAPIConfigurationFoundError = NoValidEnterpriseSearchAPIConfigurationFoundError;
  __exports.QueryIsReadOnlyError = QueryIsReadOnlyError;
  __exports.InBetweenConditionInConsistent = InBetweenConditionInConsistent;
  __exports.SinaProgramError = SinaProgramError;
  return __exports;
});
})();