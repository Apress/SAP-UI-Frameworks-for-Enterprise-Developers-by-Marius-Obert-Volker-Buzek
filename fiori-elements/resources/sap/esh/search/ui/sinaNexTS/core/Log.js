/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function r(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||false;t.configurable=true;if("value"in t)t.writable=true;Object.defineProperty(e,t.key,t)}}function n(e,n,t){if(n)r(e.prototype,n);if(t)r(e,t);Object.defineProperty(e,"prototype",{writable:false});return e}function t(e,r,n){if(r in e){Object.defineProperty(e,r,{value:n,enumerable:true,configurable:true,writable:true})}else{e[r]=n}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var i;(function(e){e[e["ERROR"]=1]="ERROR";e[e["WARN"]=2]="WARN";e[e["INFO"]=3]="INFO";e[e["DEBUG"]=4]="DEBUG"})(i||(i={}));var s=function(){function r(){var n=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"default-log";e(this,r);this.name=n}n(r,[{key:"debug",value:function e(r){this.printMessageOrError("DEBUG",r)}},{key:"info",value:function e(r){this.printMessageOrError("INFO",r)}},{key:"warn",value:function e(r){this.printMessageOrError("WARN",r)}},{key:"error",value:function e(r){this.printMessageOrError("ERROR",r)}},{key:"printMessageOrError",value:function e(r,n){if(n instanceof Error){if(n.stack){this.printMessage(r,n.stack)}else{this.printMessage(r,n+"")}}else{this.printMessage(r,n)}}},{key:"printMessage",value:function e(n,t){var s=i[n];var a="["+this.name+"]: "+t;if(s<=r.level){switch(s){case i.DEBUG:{if(typeof r.persistency.debug==="function"){r.persistency.debug(a);return}}break;case i.INFO:{if(typeof r.persistency.info==="function"){r.persistency.info(a);return}}break;case i.WARN:{if(typeof r.persistency.warn==="function"){r.persistency.warn(a);return}}break;case i.ERROR:{if(typeof r.persistency.error==="function"){r.persistency.error(a);return}}}console.log(a)}}}]);return r}();t(s,"level",i.ERROR);t(s,"persistency",console);var a={__esModule:true};a.Severity=i;a.Log=s;return a})})();