/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchFacetDialogHelper","sap/esh/search/ui/controls/SearchAdvancedCondition"],function(e,n){function r(e,n){for(var r=0;r<n.length;r++){var a=n[r];a.enumerable=a.enumerable||false;a.configurable=true;if("value"in a)a.writable=true;Object.defineProperty(e,a.key,a)}}function a(e,n,a){if(n)r(e.prototype,n);if(a)r(e,a);Object.defineProperty(e,"prototype",{writable:false});return e}function t(e,n){if(!(e instanceof n)){throw new TypeError("Cannot call a class as a function")}}var i=a(function r(){t(this,r);e.injectSearchAdvancedCondition(n);n.injectSearchFacetDialogHelper(e)});return i})})();