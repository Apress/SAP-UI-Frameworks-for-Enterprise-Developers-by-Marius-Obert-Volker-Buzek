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
function _call(body, then, direct) {
  if (direct) {
    return then ? then(body()) : body();
  }
  try {
    var result = Promise.resolve(body());
    return then ? result.then(then) : result;
  } catch (e) {
    return Promise.reject(e);
  }
}
sap.ui.define(["../core/util", "./Sina", "../providers/abap_odata/Provider", "../providers/hana_odata/Provider", "../providers/sample/Provider", "../providers/inav2/Provider", "../providers/dummy/Provider", "../providers/multi/Provider", "../core/Log", "../core/errors", "./SinaConfiguration"], function (util, ___Sina, ___providers_abap_odata_Provider, ___providers_hana_odata_Provider, ___providers_sample_Provider, ___providers_inav2_Provider, ___providers_dummy_Provider, ___providers_multi_Provider, sinaLog, ___core_errors, ___SinaConfiguration) {
  const _mixinUrlConfiguration = function (configurations) {
    return _call(_readConfigurationFromUrl, function (configurationFromUrl) {
      if (!configurationFromUrl) {
        return;
      }
      if (configurations.length === 1) {
        // 1) just merge url configuration into configuration
        _mergeConfiguration(configurations[0], configurationFromUrl);
      } else {
        // 2) use url configuration also for filtering (legacy: useful for forcing flp to use inav2 for a abap system which offers abap_odata and inav2)
        var found = false;
        for (var i = 0; i < configurations.length; ++i) {
          var configuration = configurations[i];

          // ignore dummy provider
          if (configuration.provider === AvailableProviders.DUMMY) {
            continue;
          }

          // remove not matching providers
          if (configuration.provider !== configurationFromUrl.provider) {
            configurations.splice(i, 1);
            i--;
            continue;
          }

          // merge ulr configuration into configuration
          found = true;
          _mergeConfiguration(configuration, configurationFromUrl);
        }
        if (!found) {
          configurations.splice(0, 0, configurationFromUrl);
        }
      }
    });
  };
  const _createSinaRecursively = _async(function (configurations, checkSuccessCallback) {
    const _this = this;
    var doCreate;
    var log = new sinaLog.Log("sinaFactory");
    // set default for checkSuccesCallback
    checkSuccessCallback = checkSuccessCallback || function () {
      return true;
    };
    var providersTried = [];
    // helper for recursion
    doCreate = function (index) {
      if (index >= configurations.length) {
        return Promise.reject(new NoValidEnterpriseSearchAPIConfigurationFoundError(providersTried.join(", ")));
      }
      var configuration = configurations[index];
      providersTried.push(configuration.provider);
      return createAsync(configuration).then(function (sina) {
        if (checkSuccessCallback(sina)) {
          return sina;
        }
        return doCreate(index + 1);
      }, function (error) {
        log.info(error);
        return doCreate(index + 1);
      });
    }.bind(_this); // start recursion
    return doCreate(0);
  });
  const _readConfigurationFromUrl = _async(function () {
    var sinaConfiguration = util.getUrlParameter("sinaConfiguration");
    if (sinaConfiguration) {
      return _normalizeConfiguration(sinaConfiguration);
    }
    var sinaProvider = util.getUrlParameter("sinaProvider");
    return sinaProvider ? _normalizeConfiguration(sinaProvider) : Promise.resolve();
  });
  const createAsync = _async(function (configuration) {
    return _await(_normalizeConfiguration(configuration), function (normalizedConfiguration) {
      if (normalizedConfiguration.logTarget) {
        sinaLog.Log.persistency = normalizedConfiguration.logTarget;
      }
      if (typeof normalizedConfiguration.logLevel !== "undefined") {
        sinaLog.Log.level = normalizedConfiguration.logLevel;
      }
      var log = new sinaLog.Log("sinaFactory");
      log.debug("Creating new eshclient instance using provider " + normalizedConfiguration.provider);
      var providerInstance;
      switch (normalizedConfiguration.provider) {
        case AvailableProviders.HANA_ODATA:
          {
            providerInstance = new HANAODataProvider();
            break;
          }
        case AvailableProviders.ABAP_ODATA:
          {
            providerInstance = new ABAPODataProvider();
            break;
          }
        case AvailableProviders.INAV2:
          {
            providerInstance = new INAV2Provider();
            break;
          }
        case AvailableProviders.MULTI:
          {
            providerInstance = new MultiProvider();
            break;
          }
        case AvailableProviders.SAMPLE:
          {
            providerInstance = new SampleProvider();
            break;
          }
        case AvailableProviders.DUMMY:
          {
            providerInstance = new DummyProvider();
            break;
          }
        default:
          {
            throw new Error("Unknown Provider: '" + normalizedConfiguration.provider + "' - Available Providers: " + AvailableProviders.HANA_ODATA + ", " + AvailableProviders.ABAP_ODATA + ", " + AvailableProviders.INAV2 + ", " + AvailableProviders.MULTI + ", " + AvailableProviders.SAMPLE + ", " + AvailableProviders.DUMMY);
          }
      }
      var sina = new Sina(providerInstance);
      return _await(sina.initAsync(normalizedConfiguration), function () {
        return sina;
      });
    });
  });
  var Sina = ___Sina["Sina"];
  var ABAPODataProvider = ___providers_abap_odata_Provider["Provider"];
  var HANAODataProvider = ___providers_hana_odata_Provider["Provider"];
  var SampleProvider = ___providers_sample_Provider["Provider"];
  var INAV2Provider = ___providers_inav2_Provider["Provider"];
  var DummyProvider = ___providers_dummy_Provider["Provider"];
  var MultiProvider = ___providers_multi_Provider["MultiProvider"];
  var NoValidEnterpriseSearchAPIConfigurationFoundError = ___core_errors["NoValidEnterpriseSearchAPIConfigurationFoundError"];
  var AvailableProviders = ___SinaConfiguration["AvailableProviders"];
  var _normalizeConfiguration = ___SinaConfiguration["_normalizeConfiguration"];
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV && process.env.NODE_ENV === "debug") {
    var logTest = new sinaLog.Log();
    sinaLog.Log.level = sinaLog.Severity.DEBUG;
    logTest.debug("SINA log level set to debug!");
  }
  function createByTrialAsync(inputConfigurations, checkSuccessCallback) {
    var configurations;

    // normalize configurations
    return Promise.all(inputConfigurations.map(_normalizeConfiguration.bind(this))).then(function (normalizedConfigurations) {
      // mixin url configuration into configurations
      configurations = normalizedConfigurations;
      return _mixinUrlConfiguration(configurations);
    }.bind(this)).then(function () {
      // recursive creation of sina by loop at configurations
      // (first configuration which successfully creates sina wins)
      return _createSinaRecursively(configurations, checkSuccessCallback);
    }.bind(this));
  }
  function _mergeConfiguration(configuration1, configuration2) {
    // TODO: deep merge
    for (var property in configuration2) {
      configuration1[property] = configuration2[property];
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.createAsync = createAsync;
  __exports.createByTrialAsync = createByTrialAsync;
  return __exports;
});
})();