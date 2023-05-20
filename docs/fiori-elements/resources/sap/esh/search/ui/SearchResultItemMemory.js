/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function n(e,n,r){if(n)t(e.prototype,n);if(r)t(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function r(e,t,n){if(t in e){Object.defineProperty(e,t,{value:n,enumerable:true,configurable:true,writable:true})}else{e[t]=n}return e}var i=function(){function t(){e(this,t);r(this,"items",{})}n(t,[{key:"reset",value:function e(){this.items={}}},{key:"getItem",value:function e(t){var n=this.items[t];if(!n){n={};this.items[t]=n}return n}},{key:"setExpanded",value:function e(t,n){var r=this.getItem(t);r.expanded=n}},{key:"getExpanded",value:function e(t){return this.getItem(t).expanded}}]);return t}();return i})})();