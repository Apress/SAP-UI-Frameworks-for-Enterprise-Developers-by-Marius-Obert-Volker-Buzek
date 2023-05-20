/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
sap.ui.define(["./BrowserPersonalizationStorage", "./FLPPersonalizationStorage", "./MemoryPersonalizationStorage"], function (__BrowserPersonalizationStorage, __FLPPersonalizationStorage, __MemoryPersonalizationStorage) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  const create = _async(function (personalizationStorage, isUshell, prefix) {
    if (_typeof(personalizationStorage) === "object") {
      return personalizationStorage;
    }
    switch (personalizationStorage) {
      case "auto":
        if (isUshell) {
          return FLPPersonalizationStorage.create();
        } else {
          return BrowserPersonalizationStorage.create(prefix);
        }
      case "browser":
        return BrowserPersonalizationStorage.create(prefix);
      case "flp":
        return FLPPersonalizationStorage.create();
      case "memory":
        return MemoryPersonalizationStorage.create();
      default:
        return Promise.reject(new Error("Unknown Personalization Storage: " + personalizationStorage));
    }
  });
  var BrowserPersonalizationStorage = _interopRequireDefault(__BrowserPersonalizationStorage);
  var FLPPersonalizationStorage = _interopRequireDefault(__FLPPersonalizationStorage);
  var MemoryPersonalizationStorage = _interopRequireDefault(__MemoryPersonalizationStorage);
  var module = {
    create: create
  };
  return module;
});
})();