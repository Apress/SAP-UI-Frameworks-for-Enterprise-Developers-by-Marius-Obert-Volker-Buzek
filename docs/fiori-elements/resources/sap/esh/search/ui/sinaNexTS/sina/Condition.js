/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./SinaObject"],function(e){function t(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function r(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function n(e,t,n){if(t)r(e.prototype,t);if(n)r(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}function o(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)i(e,t)}function i(e,t){i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return i(e,t)}function u(e){var t=a();return function r(){var n=l(e),o;if(t){var i=l(this).constructor;o=Reflect.construct(n,arguments,i)}else{o=n.apply(this,arguments)}return c(this,o)}}function c(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return f(e)}function f(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function a(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function l(e){l=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return l(e)}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var s=e["SinaObject"];var b=function(e){o(i,e);var r=u(i);function i(e){var n;t(this,i);n=r.call(this,{sina:e.sina});n.attributeLabel=e.attributeLabel;n.valueLabel=e.valueLabel;n.userDefined=e.userDefined;return n}n(i,[{key:"getAttributes",value:function e(){var t={};this._collectAttributes(t);return Object.keys(t)}},{key:"getConditionsByAttribute",value:function e(t){var r=[];this._collectFilterConditions(t,r);return r}}]);return i}(s);var p={__esModule:true};p.Condition=b;return p})})();