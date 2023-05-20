/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
/*!
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
// iteration 0: ok

sap.ui.define(["sap/esh/search/ui/SearchModel"], function () {
  "use strict";

  return sap.ui.controller("sap.esh.search.ui.container.Search", {
    onExit: function onExit() {
      var that = this;
      var oModel = that.getView().getModel();
      oModel.unsubscribe("ESHSearchStarted", that.getView().onAllSearchStarted, that.getView());
      oModel.unsubscribe("ESHSearchFinished", that.getView().onAllSearchFinished, that.getView());
    }
  });
});
})();