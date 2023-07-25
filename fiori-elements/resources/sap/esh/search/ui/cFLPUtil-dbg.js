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
sap.ui.define(["./sinaNexTS/providers/multi/FederationType", "./sinaNexTS/sina/SinaConfiguration"], function (___sinaNexTS_providers_multi_FederationType, ___sinaNexTS_sina_SinaConfiguration) {
  const createContentProviderSinaConfiguration = _async(function (contentProviderId) {
    return _await(sap.ushell.Container.getServiceAsync("ClientSideTargetResolution"), function (service) {
      return _await(service.getSystemContext(contentProviderId), function (oSystemContext) {
        var sinaProviderType = oSystemContext.getProperty("esearch.provider");
        var sRequestUrlForAppRouter = oSystemContext.getFullyQualifiedXhrUrl("sap/opu/odata/sap/ESH_SEARCH_SRV");
        if (!sinaProviderType) {
          // destination of this content provider has no launchpad.esearch.provider property
          // -> not relevant for search
          return;
        }
        return {
          contentProviderId: contentProviderId,
          provider: sinaProviderType.toLowerCase(),
          label: contentProviderId,
          url: sRequestUrlForAppRouter
        };
      });
    });
  });
  const readCFlpConfiguration = _async(function (sinaConfigurations) {
    return !sap || !sap.cf ? Promise.resolve(sinaConfigurations) : _await(sap.ushell.Container.getServiceAsync("CommonDataModel"), function (service) {
      return _await(service.getApplications(), function (oApplications) {
        // extract content provider ids
        var oContentProviders = Object.keys(oApplications).reduce(function (o, sApplicationKey) {
          var oApplication = oApplications[sApplicationKey];
          var sContentProviderId = oApplication["sap.app"] && oApplication["sap.app"].contentProviderId;
          if (sContentProviderId) {
            o[sContentProviderId] = true;
          }
          return o;
        }, {});
        var contentProviderIds = Object.keys(oContentProviders);

        // create sina provider configuration
        var promises = [];
        for (var i = 0; i < contentProviderIds.length; ++i) {
          var contentProviderId = contentProviderIds[i];
          promises.push(createContentProviderSinaConfiguration(contentProviderId));
        }
        return _await(Promise.all(promises), function (subSinaProviderConfigurations) {
          if (!subSinaProviderConfigurations || subSinaProviderConfigurations.length === 0) {
            // fallback if configuration is empty
            return sinaConfigurations;
          } else {
            // assemble multi provider configuration
            subSinaProviderConfigurations = subSinaProviderConfigurations.filter(function (elem) {
              if (typeof elem !== "undefined") {
                return elem;
              }
            });
            return [{
              provider: AvailableProviders.MULTI,
              subProviders: subSinaProviderConfigurations,
              federationType: FederationType.advanced_round_robin,
              url: "" // not relevant for multi provider
            }, AvailableProviders.DUMMY];
          }
        });
      });
    });
  });
  var FederationType = ___sinaNexTS_providers_multi_FederationType["FederationType"];
  var AvailableProviders = ___sinaNexTS_sina_SinaConfiguration["AvailableProviders"];
  var __exports = {
    __esModule: true
  };
  __exports.readCFlpConfiguration = readCFlpConfiguration;
  return __exports;
});
})();