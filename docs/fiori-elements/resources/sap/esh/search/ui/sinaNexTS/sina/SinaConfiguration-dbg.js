/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _invoke(body, then) {
  var result = body();
  if (result && result.then) {
    return result.then(then);
  }
  return then(result);
}
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
sap.ui.define([], function () {
  const _normalizeConfiguration = _async(function (configuration) {
    let _exit = false;
    // check whether configuration is a string with a javascript module name
    return _invoke(function () {
      if (typeof configuration === "string") {
        configuration = configuration.trim();

        // configuration is a string with a url -> load configuration dynamically via require
        return _invoke(function () {
          if (configuration.indexOf("/") >= 0 && configuration.indexOf("Provider") < 0 && configuration[0] !== "{") {
            configuration = require(configuration);
            return _await(_normalizeConfiguration(configuration), function (_await$_normalizeConf) {
              _exit = true;
              return _await$_normalizeConf;
            });
          }
        }, function (_result) {
          if (_exit) return _result;
          // configuration is a string with the provider name -> assemble json
          if (configuration[0] !== "{") {
            configuration = '{ "provider" : "' + configuration + '"}';
          }

          // parse json
          configuration = JSON.parse(configuration);
        });
      }
    }, function (_result2) {
      return _exit ? _result2 : configuration;
    });
  });
  var AvailableProviders;
  (function (AvailableProviders) {
    AvailableProviders["ABAP_ODATA"] = "abap_odata";
    AvailableProviders["HANA_ODATA"] = "hana_odata";
    AvailableProviders["INAV2"] = "inav2";
    AvailableProviders["MULTI"] = "multi";
    AvailableProviders["SAMPLE"] = "sample";
    AvailableProviders["DUMMY"] = "dummy";
  })(AvailableProviders || (AvailableProviders = {}));
  var __exports = {
    __esModule: true
  };
  __exports.AvailableProviders = AvailableProviders;
  __exports._normalizeConfiguration = _normalizeConfiguration;
  return __exports;
});
})();