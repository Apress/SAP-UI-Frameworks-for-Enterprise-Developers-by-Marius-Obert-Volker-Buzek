/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function t(t,r){if(typeof r!=="function"&&r!==null){throw new TypeError("Super expression must either be null or a function")}t.prototype=Object.create(r&&r.prototype,{constructor:{value:t,writable:true,configurable:true}});Object.defineProperty(t,"prototype",{writable:false});if(r)e(t,r)}function e(t,r){e=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,r){e.__proto__=r;return e};return e(t,r)}function r(t){var e=u();return function r(){var o=f(t),u;if(e){var i=f(this).constructor;u=Reflect.construct(o,arguments,i)}else{u=o.apply(this,arguments)}return n(this,u)}}function n(t,e){if(e&&(typeof e==="object"||typeof e==="function")){return e}else if(e!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return o(t)}function o(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function u(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(t){return false}}function f(t){f=Object.setPrototypeOf?Object.getPrototypeOf.bind():function t(e){return e.__proto__||Object.getPrototypeOf(e)};return f(t)}function i(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(t,n.key,n)}}function c(t,e,r){if(e)i(t.prototype,e);if(r)i(t,r);Object.defineProperty(t,"prototype",{writable:false});return t}function a(t,e){if(!(t instanceof e)){throw new TypeError("Cannot call a class as a function")}}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var l=c(function t(){a(this,t)});var s=function(e){t(o,e);var n=r(o);function o(){a(this,o);return n.apply(this,arguments)}return c(o)}(l);var p={__esModule:true};p.Formatter=l;p.ChartResultSetFormatter=s;return p})})();