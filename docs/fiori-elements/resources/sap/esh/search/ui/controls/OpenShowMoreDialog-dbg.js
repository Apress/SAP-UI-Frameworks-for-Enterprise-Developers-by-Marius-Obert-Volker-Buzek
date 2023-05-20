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
sap.ui.define(["../SearchFacetDialogModel", "./SearchFacetDialog", "../sinaNexTS/providers/abap_odata/UserEventLogger"], function (__SearchFacetDialogModel, __SearchFacetDialog, ___sinaNexTS_providers_abap_odata_UserEventLogger) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const openShowMoreDialog = _async(function (oSearchModel, dimension) {
    var oSearchFacetDialogModel = new SearchFacetDialogModel({
      searchModel: oSearchModel
    });
    return _await(oSearchFacetDialogModel.initAsync(), function () {
      oSearchFacetDialogModel.setData(oSearchModel.getData());
      oSearchFacetDialogModel.config = oSearchModel.config;
      oSearchFacetDialogModel.sinaNext = oSearchModel.sinaNext;
      oSearchFacetDialogModel.prepareFacetList();
      var searchFacetDialogSettings = {
        selectedAttribute: dimension ? dimension : "",
        selectedTabBarIndex: 0
        // tabBarItems: [],
      };

      var oDialog = new SearchFacetDialog("".concat(oSearchModel.config.id, "-SearchFacetDialog"), searchFacetDialogSettings);
      oDialog.setModel(oSearchFacetDialogModel);
      oDialog.setModel(oSearchModel, "searchModel");
      oDialog.open();
      oSearchModel.eventLogger.logEvent({
        type: UserEventType.FACET_SHOW_MORE,
        referencedAttribute: dimension
      });
    });
  });
  var SearchFacetDialogModel = _interopRequireDefault(__SearchFacetDialogModel);
  var SearchFacetDialog = _interopRequireDefault(__SearchFacetDialog);
  var UserEventType = ___sinaNexTS_providers_abap_odata_UserEventLogger["UserEventType"];
  var __exports = {
    __esModule: true
  };
  __exports.openShowMoreDialog = openShowMoreDialog;
  return __exports;
});
})();