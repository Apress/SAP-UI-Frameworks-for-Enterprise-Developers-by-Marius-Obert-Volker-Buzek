/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var SinaObject = /*#__PURE__*/function () {
    function SinaObject() {
      var _properties$sina, _properties$_private;
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      _classCallCheck(this, SinaObject);
      _defineProperty(this, "_private", {});
      this.sina = (_properties$sina = properties.sina) !== null && _properties$sina !== void 0 ? _properties$sina : this.sina;
      this._private = (_properties$_private = properties._private) !== null && _properties$_private !== void 0 ? _properties$_private : this._private;
    }
    _createClass(SinaObject, [{
      key: "getSina",
      value: function getSina() {
        return this.sina;
      }
    }]);
    return SinaObject;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.SinaObject = SinaObject;
  return __exports;
});
})();