/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchNavigationObject","./error/errors","./sinaNexTS/sina/ObjectSuggestion","./sinaNexTS/sina/SearchResultSetItem","./sinaNexTS/sina/SearchResultSetItemAttribute"],function(t,e,r,n,i){function o(t){return t&&t.__esModule&&typeof t.default!=="undefined"?t.default:t}function a(t,e){if(!(t instanceof e)){throw new TypeError("Cannot call a class as a function")}}function u(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(t,n.key,n)}}function f(t,e,r){if(e)u(t.prototype,e);if(r)u(t,r);Object.defineProperty(t,"prototype",{writable:false});return t}function c(t,e){if(typeof e!=="function"&&e!==null){throw new TypeError("Super expression must either be null or a function")}t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:true,configurable:true}});Object.defineProperty(t,"prototype",{writable:false});if(e)s(t,e)}function s(t,e){s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,r){e.__proto__=r;return e};return s(t,e)}function l(t){var e=v();return function r(){var n=h(t),i;if(e){var o=h(this).constructor;i=Reflect.construct(n,arguments,o)}else{i=n.apply(this,arguments)}return p(this,i)}}function p(t,e){if(e&&(typeof e==="object"||typeof e==="function")){return e}else if(e!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return g(t)}function g(t){if(t===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return t}function v(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(t){return false}}function h(t){h=Object.setPrototypeOf?Object.getPrototypeOf.bind():function t(e){return e.__proto__||Object.getPrototypeOf(e)};return h(t)}var y=o(e);var b=r["ObjectSuggestion"];var d=n["SearchResultSetItem"];var S=i["SearchResultSetItemAttribute"];var m=function(t){c(r,t);var e=l(r);function r(t,n){var i;a(this,r);i=e.call(this,undefined,n);i._sinaNavigationTarget=t;i.setHref(t.targetUrl);i.setText(t.label);i.setTarget(t.target);i.sina=i._sinaNavigationTarget.sina;return i}f(r,[{key:"performNavigation",value:function t(e){try{this._model.config.beforeNavigation(this._model)}catch(t){var r=new y.ConfigurationExitError("beforeNavigation",this._model.config.applicationComponent,t);throw r}this._sinaNavigationTarget.performNavigation(e)}},{key:"getResultSet",value:function t(){var e=this.getResultSetItem();if(e instanceof d){return e.parent}}},{key:"getResultSetItem",value:function t(){var e=this._sinaNavigationTarget.parent;if(e instanceof S){e=e.parent}if(!(e instanceof d)){throw"programm error"}if(e.parent instanceof b){return e.parent}return e}},{key:"getResultSetId",value:function t(){return this.getResultSet().id}},{key:"getPositionInList",value:function t(){var e=this.getResultSet();var r=this.getResultSetItem();return e.items.indexOf(r)}},{key:"hasTargetFunction",value:function t(){var e=this._sinaNavigationTarget.targetFunction;if(typeof e==="function"){return true}return false}}]);return r}(t);return m})})();