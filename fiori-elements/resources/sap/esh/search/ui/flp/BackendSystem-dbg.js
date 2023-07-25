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
  var BackendSystem = /*#__PURE__*/function () {
    function BackendSystem() {
      _classCallCheck(this, BackendSystem);
    }
    _createClass(BackendSystem, null, [{
      key: "getSystem",
      value: function getSystem(searchModel) {
        var _searchModel$getPrope;
        return (_searchModel$getPrope = searchModel.getProperty("/dataSources")[3]) === null || _searchModel$getPrope === void 0 ? void 0 : _searchModel$getPrope.system;
      }
    }]);
    return BackendSystem;
  }();
  return BackendSystem;
});
})();