/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./SinaObject"],function(t){function e(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(t,n.key,n)}}function r(t,r,n){if(r)e(t.prototype,r);if(n)e(t,n);Object.defineProperty(t,"prototype",{writable:false});return t}function n(t,e){if(!(t instanceof e)){throw new TypeError("Cannot call a class as a function")}}function o(t,e){if(typeof e!=="function"&&e!==null){throw new TypeError("Super expression must either be null or a function")}t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:true,configurable:true}});Object.defineProperty(t,"prototype",{writable:false});if(e)u(t,e)}function u(t,e){u=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,r){e.__proto__=r;return e};return u(t,e)}function i(t){var e=a();return function r(){var n=l(t),o;if(e){var u=l(this).constructor;o=Reflect.construct(n,arguments,u)}else{o=n.apply(this,arguments)}return f(this,o)}}function f(t,e){if(e&&(typeof e==="object"||typeof e==="function")){return e}else if(e!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return c(t)}function c(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function a(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(t){return false}}function l(t){l=Object.setPrototypeOf?Object.getPrototypeOf.bind():function t(e){return e.__proto__||Object.getPrototypeOf(e)};return l(t)}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var p=t["SinaObject"];var s=function(t){o(u,t);var e=i(u);function u(t){var r,o,i;var f;n(this,u);f=e.call(this,t);f.group=(r=t.group)!==null&&r!==void 0?r:f.group;f.attribute=(o=t.attribute)!==null&&o!==void 0?o:f.attribute;f.nameInGroup=(i=t.nameInGroup)!==null&&i!==void 0?i:f.nameInGroup;return f}return r(u)}(p);var b={__esModule:true};b.AttributeGroupMembership=s;return b})})();