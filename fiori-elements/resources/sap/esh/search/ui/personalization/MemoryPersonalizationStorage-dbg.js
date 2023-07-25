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
  var MemoryPersonalizationStorage = /*#__PURE__*/function () {
    function MemoryPersonalizationStorage() {
      _classCallCheck(this, MemoryPersonalizationStorage);
      this.dataMap = {};
    }
    _createClass(MemoryPersonalizationStorage, [{
      key: "isStorageOfPersonalDataAllowed",
      value: function isStorageOfPersonalDataAllowed() {
        return true;
      }
    }, {
      key: "save",
      value: function save() {
        return Promise.resolve();
      }
    }, {
      key: "getItem",
      value: function getItem(key) {
        return this.dataMap[key];
      }
    }, {
      key: "setItem",
      value: function setItem(key, data) {
        this.dataMap[key] = data;
        return true;
      }
    }, {
      key: "deleteItem",
      value: function deleteItem(key) {
        delete this.dataMap[key];
      }
    }], [{
      key: "create",
      value: function create() {
        try {
          return Promise.resolve(new MemoryPersonalizationStorage());
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);
    return MemoryPersonalizationStorage;
  }();
  return MemoryPersonalizationStorage;
});
})();