/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/SearchHelper", "sap/m/Label"], function (SearchHelper, Label) {
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchLabel = Label.extend("sap.esh.search.ui.controls.SearchLabel", {
    renderer: {
      apiVersion: 2
    },
    onAfterRendering: function _onAfterRendering() {
      var d = this.getDomRef();
      // recover bold tag with the help of text() in a safe way
      SearchHelper.boldTagUnescaper(d);
      // forward ellipsis
      SearchHelper.forwardEllipsis4Whyfound(d);
    }
  });
  return SearchLabel;
});
})();