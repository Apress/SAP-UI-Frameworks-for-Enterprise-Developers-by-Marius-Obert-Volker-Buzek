/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/Object"],function(t){"use strict";var i=t.extend("sap.suite.ui.commons.networkgraph.layout.LayoutTask",{constructor:function(i){t.apply(this,arguments);this._bTerminated=false;this._oPromise=new Promise(function(t,e){i(t,e,this)}.bind(this))}});i.prototype.then=function(t,i){this._oPromise=this._oPromise.then(t,i);return this};i.prototype.catch=function(t){this._oPromise=this._oPromise.catch(t);return this};i.prototype.terminate=function(){this._bTerminated=true;return this};i.prototype.isTerminated=function(){return this._bTerminated};return i});