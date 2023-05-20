/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["../i18n", "sap/esh/search/ui/SearchHelper", "sap/m/Button", "sap/ui/core/IconPool"], function (__i18n, SearchHelper, Button, IconPool) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  var i18n = _interopRequireDefault(__i18n);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchButton = Button.extend("sap.esh.search.ui.controls.SearchButton", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      Button.prototype.constructor.call(this, sId, options);
      this.setIcon(IconPool.getIconURI("search"));
      this.setTooltip(i18n.getText("search"));
      this.bindProperty("enabled", {
        parts: [{
          path: "/initializingObjSearch"
        }],
        formatter: function formatter(initializingObjSearch) {
          return !SearchHelper.isSearchAppActive() || !initializingObjSearch;
        }
      });
      this.addStyleClass("searchBtn");
    }
  });
  return SearchButton;
});
})();