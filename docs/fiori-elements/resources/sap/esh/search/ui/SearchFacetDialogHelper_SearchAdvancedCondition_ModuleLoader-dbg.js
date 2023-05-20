/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchFacetDialogHelper", "sap/esh/search/ui/controls/SearchAdvancedCondition"], function (SearchFacetDialogHelper, SearchAdvancedCondition) {
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader = /*#__PURE__*/_createClass(function SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader() {
    _classCallCheck(this, SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader);
    SearchFacetDialogHelper.injectSearchAdvancedCondition(SearchAdvancedCondition);
    SearchAdvancedCondition.injectSearchFacetDialogHelper(SearchFacetDialogHelper);
  });
  return SearchFacetDialogHelper_SearchAdvancedCondition_ModuleLoader;
});
})();