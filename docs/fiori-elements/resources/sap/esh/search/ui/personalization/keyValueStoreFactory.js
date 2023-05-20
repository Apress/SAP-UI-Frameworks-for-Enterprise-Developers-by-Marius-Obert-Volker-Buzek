/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e){return function(){for(var r=[],t=0;t<arguments.length;t++){r[t]=arguments[t]}try{return Promise.resolve(e.apply(this,r))}catch(e){return Promise.reject(e)}}}sap.ui.define(["./BrowserPersonalizationStorage","./FLPPersonalizationStorage","./MemoryPersonalizationStorage"],function(r,t,o){function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function a(e){"@babel/helpers - typeof";return a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},a(e)}const u=e(function(e,r,t){if(a(e)==="object"){return e}switch(e){case"auto":if(r){return i.create()}else{return c.create(t)}case"browser":return c.create(t);case"flp":return i.create();case"memory":return f.create();default:return Promise.reject(new Error("Unknown Personalization Storage: "+e))}});var c=n(r);var i=n(t);var f=n(o);var s={create:u};return s})})();