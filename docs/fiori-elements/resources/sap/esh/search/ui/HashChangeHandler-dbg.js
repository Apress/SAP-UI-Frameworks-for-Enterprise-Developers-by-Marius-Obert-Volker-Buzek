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
sap.ui.define(["sap/esh/search/ui/SearchHelper", "./sinaNexTS/providers/abap_odata/UserEventLogger"], function (SearchHelper, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"]; // track navigation
  // model class for track navigation
  // =======================================================================
  var HashChangeHandler = {
    handle: function handle(hashChangeInfo) {
      try {
        const _this = this;
        if (!SearchHelper.isLoggingEnabled()) {
          return _await();
        }
        _this.sourceUrlArray = [];
        if (hashChangeInfo.oldShellHash !== null) {
          _this.sourceUrlArray.push(hashChangeInfo.oldShellHash);
        }
        if (hashChangeInfo.oldAppSpecificRoute !== null) {
          if (hashChangeInfo.oldAppSpecificRoute.substring(0, 2) === "&/") {
            // remove first special parameter indicator "&/"
            _this.sourceUrlArray.push(hashChangeInfo.oldAppSpecificRoute.substring(2));
          } else {
            _this.sourceUrlArray.push(hashChangeInfo.oldAppSpecificRoute);
          }
        }
        _this._createSearchModel().then(function () {
          var event = {
            type: UserEventType.ITEM_NAVIGATE,
            sourceUrlArray: this.sourceUrlArray,
            targetUrl: "#" + hashChangeInfo.newShellHash,
            systemAndClient: this._getSID()
          };
          if (event.targetUrl.indexOf("=") !== -1) {
            this.searchModel.sinaNext.logUserEvent(event);
          }
        }.bind(_this));
        return _await();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _createSearchModel: function _createSearchModel() {
      try {
        const _this2 = this;
        if (_this2.initializedPromise) {
          return _await(_this2.initializedPromise);
        }
        // get search model and call init
        _this2.searchModel = sap.esh.search.ui.getModelSingleton({}, "flp");
        _this2.initializedPromise = _this2.searchModel.initBusinessObjSearch();
        return _await(_this2.initializedPromise);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _getSID: function _getSID() {
      // extract System and Client from sap-system=sid(BE1.001)
      var systemAndClient = {
        systemId: "",
        client: ""
      };
      var url = window.location.href;
      var systemBegin = url.indexOf("sap-system=sid(");
      if (systemBegin !== -1) {
        var systemEnd = url.substring(systemBegin).indexOf(")");
        if (systemEnd !== -1) {
          var systemInUrl = url.substring(systemBegin + 15, systemBegin + systemEnd);
          if (systemInUrl.split(".").length === 2) {
            systemAndClient.systemId = systemInUrl.split(".")[0];
            systemAndClient.client = systemInUrl.split(".")[1];
          }
        }
      }
      return systemAndClient;
    }
  };
  return HashChangeHandler;
});
})();