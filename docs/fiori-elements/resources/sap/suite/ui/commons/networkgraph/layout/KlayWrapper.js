/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/base/ObjectPool","sap/ui/Device"],function(e,r){"use strict";var o="sap.ui.thirdparty";function t(){var e=sap.ui.require.toUrl(o.replace(/\./g,"/"))+"/klay.js";this._worker=new Worker(e)}t.prototype.getWorker=function(){return this._worker};t.prototype.init=function(){};t.prototype.reset=function(){this._worker.onmessage=null;this._worker.onerror=null};var n={},i=!r.browser.firefox;n._pool=new e(t);n.layout=function(e){if(typeof Worker!=="undefined"&&i){try{var r=n._pool.borrowObject(),o=r.getWorker();o.postMessage({graph:e.graph,options:e.options});o.onmessage=function(o){if(o.data.stacktrace){e.error(o.data)}else{e.success(o.data)}n._pool.returnObject(r)};o.onerror=function(){n._pool.returnObject(r);n.run(e)}}catch(r){n.run(e)}}else{n.run(e)}};n.run=function(e){n.getKlay().then(function(r){r.layout(e)})};n.getKlay=function(){if(typeof $klay==="undefined"){return new Promise(function(e){var r=o.replace(/\./g,"/")+"/klay";sap.ui.require([r],function(){e($klay)})})}else{return Promise.resolve($klay)}};return n},true);