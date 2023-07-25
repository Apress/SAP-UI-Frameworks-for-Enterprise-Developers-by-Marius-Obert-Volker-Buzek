/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,n){if(!(e instanceof n)){throw new TypeError("Cannot call a class as a function")}}function n(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function t(e,t,r){if(t)n(e.prototype,t);if(r)n(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var r=function(){function n(){e(this,n)}t(n,null,[{key:"getSystem",value:function e(n){var t;return(t=n.getProperty("/dataSources")[3])===null||t===void 0?void 0:t.system}}]);return n}();return r})})();