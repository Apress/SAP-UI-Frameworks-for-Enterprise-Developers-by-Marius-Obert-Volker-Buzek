/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define([], function () {
  var module = {
    isSearchFieldExpandedByDefault: function isSearchFieldExpandedByDefault() {
      // copied from /ushell-lib/src/main/js/sap/ushell/renderers/fiori2/search/util.js in order to avoid dependency
      try {
        var shellHeader = sap.ui.getCore().byId("shell-header");
        if (!shellHeader || !shellHeader.isExtraLargeState) {
          return false;
        }
        var shellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController();
        var shellView = shellCtrl.getView();
        var shellConfig = (shellView.getViewData() ? shellView.getViewData().config : {}) || {};
        return shellConfig.openSearchAsDefault || shellHeader.isExtraLargeState();
      } catch (e) {
        return false;
      }
    }
  };
  return module;
});
})();