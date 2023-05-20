/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){
/*!
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/esh/search/ui/SearchHelper"],function(e){"use strict";var n={};jQuery.extend(n,{logLines:[],log:function e(){this._log.apply(this,arguments)},_log:function e(n){this.logLines.push(n);this._save()},_save:function e(){jQuery.ajax({type:"PUT",url:"/uxlog.txt",data:this.logLines.join("\n")+"\n",contentType:"text/plain"});this.logLines=[]}});n._save=e.delayedExecution(n._save,2e3);return n})})();