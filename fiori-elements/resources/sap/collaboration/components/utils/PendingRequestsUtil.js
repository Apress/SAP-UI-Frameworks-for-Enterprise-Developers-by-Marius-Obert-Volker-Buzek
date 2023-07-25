/*
* ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
*/
sap.ui.define(function(){"use strict";var e=function(){this._aPendingRequests=[]};e.prototype.contains=function(e){for(var t=0;t<this._aPendingRequests.length;++t){if(this._aPendingRequests[t]===e){return true}return false}};e.prototype.add=function(e){if(this.contains(e)){return false}else{this._aPendingRequests.push(e);return true}};e.prototype.remove=function(e){for(var t=0;t<this._aPendingRequests.length;++t){if(this._aPendingRequests[t]===e){this._aPendingRequests.splice(t,1);return true}}return false};e.prototype.abortAll=function(){var e;while((e=this._aPendingRequests.pop())!==undefined){e.abort()}};return e},true);