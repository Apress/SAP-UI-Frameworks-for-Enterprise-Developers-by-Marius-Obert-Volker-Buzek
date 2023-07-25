/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  // =======================================================================
  // decorator for sequentialized execution
  // =======================================================================
  // eslint-disable-next-line @typescript-eslint/ban-types
  function sequentializedExecution(originalFunction) {
    var chainedPromise;
    return function () {
      var _this = this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (!chainedPromise) {
        chainedPromise = originalFunction.apply(this, args);
      } else {
        chainedPromise = chainedPromise.then(function () {
          return originalFunction.apply(_this, args);
        }, function () {
          return originalFunction.apply(_this, args);
        });
      }
      var promise = chainedPromise;
      promise["finally"](function () {
        if (promise === chainedPromise) {
          chainedPromise = null;
        }
      })["catch"](function () {
        //dummy
      });
      return chainedPromise;
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.sequentializedExecution = sequentializedExecution;
  return __exports;
});
})();