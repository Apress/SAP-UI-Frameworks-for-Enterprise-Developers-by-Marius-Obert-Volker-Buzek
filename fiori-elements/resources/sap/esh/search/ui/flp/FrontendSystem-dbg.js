/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../sinaNexTS/sina/System"], function (___sinaNexTS_sina_System) {
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
  var System = ___sinaNexTS_sina_System["System"];
  var FrontendSystem = /*#__PURE__*/function () {
    function FrontendSystem() {
      _classCallCheck(this, FrontendSystem);
    }
    _createClass(FrontendSystem, null, [{
      key: "getSystem",
      value: function getSystem() {
        if (typeof FrontendSystem.fioriFrontendSystemInfo === "undefined" && typeof window !== "undefined" && window.sap && window.sap.ushell && window.sap.ushell.Container) {
          FrontendSystem.fioriFrontendSystemInfo = new System({
            id: window.sap.ushell.Container.getLogonSystem().getName() + "." + window.sap.ushell.Container.getLogonSystem().getClient(),
            label: window.sap.ushell.Container.getLogonSystem().getName() + " " + window.sap.ushell.Container.getLogonSystem().getClient()
          });
        }
        return FrontendSystem.fioriFrontendSystemInfo;
      }
    }]);
    return FrontendSystem;
  }();
  return FrontendSystem;
});
})();