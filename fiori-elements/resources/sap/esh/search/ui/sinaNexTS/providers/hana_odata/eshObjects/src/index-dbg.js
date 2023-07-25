/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["./utils", "./definitions"], function (___utils, ___definitions) {
  var __exports = {
    __esModule: true
  };
  function extendExports(exports, obj) {
    Object.keys(obj).forEach(function (key) {
      if (key === "default" || key === "__esModule") return;
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
          return obj[key];
        }
      });
    });
  }
  extendExports(__exports, ___utils);
  extendExports(__exports, ___definitions);
  return __exports;
});
})();