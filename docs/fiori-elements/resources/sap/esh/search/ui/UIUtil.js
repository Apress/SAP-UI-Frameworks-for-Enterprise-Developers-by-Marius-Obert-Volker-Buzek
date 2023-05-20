/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,n,r,t){for(var u=0;u<n.length;++u){var i=n[u];if(i["es_"+e]){continue}i.addEventListener(r,t);i["es_"+e]=true}return n}var n={__esModule:true};n.registerHandler=e;return n})})();