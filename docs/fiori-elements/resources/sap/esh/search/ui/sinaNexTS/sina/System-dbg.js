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
  /*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
  var System = /*#__PURE__*/function () {
    function System(system) {
      _classCallCheck(this, System);
      this._id = system.id;
      this._label = system.label;
    }
    _createClass(System, [{
      key: "id",
      get: function get() {
        return this._id;
      }
    }, {
      key: "label",
      get: function get() {
        return this._label;
      }
    }, {
      key: "equals",
      value: function equals(system) {
        return (this === null || this === void 0 ? void 0 : this._id) === (system === null || system === void 0 ? void 0 : system.id) && (this === null || this === void 0 ? void 0 : this._label) === (system === null || system === void 0 ? void 0 : system.label);
      }
    }]);
    return System;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.System = System;
  return __exports;
});
})();