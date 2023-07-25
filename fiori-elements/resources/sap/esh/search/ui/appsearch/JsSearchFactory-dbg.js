/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
sap.ui.define(["sap/esh/search/ui/appsearch/JsSearch"], function (JsSearch) {
  var jsSearchFactory = {
    createJsSearch: function createJsSearch(options) {
      return new JsSearch(options);
    }
  };
  return jsSearchFactory;
});
})();