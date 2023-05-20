/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/m/Table"], function (Table) {
  /**
   * @namespace sap.esh.search.ui.controls
   */
  var SearchResultTable = Table.extend("sap.esh.search.ui.controls.SearchResultTable", {
    renderer: {
      apiVersion: 2
    }
  });
  return SearchResultTable;
});
})();