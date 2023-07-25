/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchModel","./SearchShellHelper"],function(e,n){function r(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function t(e,n){for(var r=0;r<n.length;r++){var t=n[r];t.enumerable=t.enumerable||false;t.configurable=true;if("value"in t)t.writable=true;Object.defineProperty(e,t.key,t)}}function a(e,n,r){if(n)t(e.prototype,n);if(r)t(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function i(e,n){if(!(e instanceof n)){throw new TypeError("Cannot call a class as a function")}}var f=r(n);var o=a(function n(){i(this,n);f.injectSearchModel(e)});return o})})();