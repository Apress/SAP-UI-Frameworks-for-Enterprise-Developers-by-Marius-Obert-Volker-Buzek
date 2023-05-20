/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  function registerHandler(key, jQuerySelector, event, handler) {
    for (var i = 0; i < jQuerySelector.length; ++i) {
      var element = jQuerySelector[i];
      if (element["es_" + key]) {
        continue;
      }
      element.addEventListener(event, handler);
      element["es_" + key] = true;
    }
    return jQuerySelector;
  }
  var __exports = {
    __esModule: true
  };
  __exports.registerHandler = registerHandler;
  return __exports;
});
})();