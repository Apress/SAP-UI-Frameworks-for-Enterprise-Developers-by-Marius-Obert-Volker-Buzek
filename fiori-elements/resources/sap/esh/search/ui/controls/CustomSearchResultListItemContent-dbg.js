/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
  /*
   * @namespace sap.esh.search.ui.controls
   */
  var CustomSearchResultListItemContent = ManagedObject.extend("sap.esh.search.ui.controls.CustomSearchResultListItemContent", {
    metadata: {
      properties: {
        title: "string",
        titleUrl: "string",
        type: "string",
        imageUrl: "string",
        attributes: {
          type: "object",
          multiple: true
        },
        intents: {
          type: "object",
          multiple: true
        }
      }
    },
    getContent: function _getContent() {
      // should return sap.ui.core.Control or sap.ui.core.Control[]
      return undefined;
    },
    getTitleVisibility: function _getTitleVisibility() {
      return true;
    }
  });
  return CustomSearchResultListItemContent;
});
})();