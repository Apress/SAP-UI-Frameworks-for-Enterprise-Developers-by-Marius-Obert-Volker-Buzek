/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */

(function(){
/*!
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
// iteration 0 ok
/* global */

sap.ui.define(["sap/esh/search/ui/SearchHelper"], function (SearchHelper) {
  "use strict";

  var module = {};
  jQuery.extend(module, {
    logLines: [],
    log: function log() {
      this._log.apply(this, arguments);
    },
    _log: function _log(text) {
      this.logLines.push(text);
      this._save();
    },
    _save: function _save() {
      jQuery.ajax({
        type: "PUT",
        url: "/uxlog.txt",
        data: this.logLines.join("\n") + "\n",
        contentType: "text/plain"
      });
      this.logLines = [];
    }
  });
  module._save = SearchHelper.delayedExecution(module._save, 2000);
  return module;
});
})();