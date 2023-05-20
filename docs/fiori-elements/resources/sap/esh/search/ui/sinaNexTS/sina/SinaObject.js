/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,n){if(!(e instanceof n)){throw new TypeError("Cannot call a class as a function")}}function n(e,n){for(var t=0;t<n.length;t++){var i=n[t];i.enumerable=i.enumerable||false;i.configurable=true;if("value"in i)i.writable=true;Object.defineProperty(e,i.key,i)}}function t(e,t,i){if(t)n(e.prototype,t);if(i)n(e,i);Object.defineProperty(e,"prototype",{writable:false});return e}function i(e,n,t){if(n in e){Object.defineProperty(e,n,{value:t,enumerable:true,configurable:true,writable:true})}else{e[n]=t}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var r=function(){function n(){var t,r;var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};e(this,n);i(this,"_private",{});this.sina=(t=a.sina)!==null&&t!==void 0?t:this.sina;this._private=(r=a._private)!==null&&r!==void 0?r:this._private}t(n,[{key:"getSina",value:function e(){return this.sina}}]);return n}();var a={__esModule:true};a.SinaObject=r;return a})})();