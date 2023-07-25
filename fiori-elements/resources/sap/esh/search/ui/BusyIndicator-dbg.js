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
  var DummyBusyIndicator = /*#__PURE__*/function () {
    function DummyBusyIndicator() {
      _classCallCheck(this, DummyBusyIndicator);
    }
    _createClass(DummyBusyIndicator, [{
      key: "show",
      value: function show() {
        //
      }
    }, {
      key: "hide",
      value: function hide() {
        //
      }
    }, {
      key: "setBusy",
      value: function setBusy() {
        //
      }
    }]);
    return DummyBusyIndicator;
  }();
  var BusyIndicator = /*#__PURE__*/function () {
    function BusyIndicator(model) {
      _classCallCheck(this, BusyIndicator);
      this.model = model;
      this.model.setProperty("/isBusy", false);
    }
    _createClass(BusyIndicator, [{
      key: "show",
      value: function show() {
        this.model.setProperty("/isBusy", true);
      }
    }, {
      key: "hide",
      value: function hide() {
        this.model.setProperty("/isBusy", false);
      }
    }, {
      key: "setBusy",
      value: function setBusy(isBusy) {
        if (isBusy) {
          this.show();
        } else {
          this.hide();
        }
      }
    }]);
    return BusyIndicator;
  }();
  var __exports = {
    __esModule: true
  };
  __exports.DummyBusyIndicator = DummyBusyIndicator;
  __exports.BusyIndicator = BusyIndicator;
  return __exports;
});
})();