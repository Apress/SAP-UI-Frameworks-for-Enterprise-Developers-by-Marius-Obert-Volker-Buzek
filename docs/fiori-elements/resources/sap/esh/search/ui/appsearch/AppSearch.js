/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./CatalogSearch"],function(r){function t(r){return r&&r.__esModule&&typeof r.default!=="undefined"?r.default:r}function e(r){return i(r)||o(r)||a(r)||n()}function n(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function a(r,t){if(!r)return;if(typeof r==="string")return u(r,t);var e=Object.prototype.toString.call(r).slice(8,-1);if(e==="Object"&&r.constructor)e=r.constructor.name;if(e==="Map"||e==="Set")return Array.from(r);if(e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return u(r,t)}function o(r){if(typeof Symbol!=="undefined"&&r[Symbol.iterator]!=null||r["@@iterator"]!=null)return Array.from(r)}function i(r){if(Array.isArray(r))return u(r)}function u(r,t){if(t==null||t>r.length)t=r.length;for(var e=0,n=new Array(t);e<t;e++)n[e]=r[e];return n}function f(r,t){if(!(r instanceof t)){throw new TypeError("Cannot call a class as a function")}}function c(r,t){for(var e=0;e<t.length;e++){var n=t[e];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(r,n.key,n)}}function l(r,t,e){if(t)c(r.prototype,t);if(e)c(r,e);Object.defineProperty(r,"prototype",{writable:false});return r}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var s=t(r);var h=function(){function r(){f(this,r);this.catalogSearch=new s;this.searchProviders=[this.catalogSearch]}l(r,[{key:"prefetch",value:function r(){for(var t=0;t<this.searchProviders.length;t++){var e=this.searchProviders[t];e.prefetch()}}},{key:"search",value:function r(t){try{const r=this;var n=[];for(var a=0;a<r.searchProviders.length;a++){var o=r.searchProviders[a];n.push(o.search(t))}return Promise.all(n).then(function(r){var t={totalCount:0,tiles:[]};for(var n=0;n<r.length;n++){var a;var o=r[n];t.totalCount+=o.totalCount;(a=t.tiles).push.apply(a,e(o.tiles))}return t})}catch(r){return Promise.reject(r)}}}]);return r}();return h})})();