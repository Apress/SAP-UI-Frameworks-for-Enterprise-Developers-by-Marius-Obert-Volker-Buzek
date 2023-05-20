/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../sinaNexTS/sina/System"],function(e){function n(e,n){if(!(e instanceof n)){throw new TypeError("Cannot call a class as a function")}}function t(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||false;o.configurable=true;if("value"in o)o.writable=true;Object.defineProperty(e,o.key,o)}}function o(e,n,o){if(n)t(e.prototype,n);if(o)t(e,o);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var i=e["System"];var r=function(){function e(){n(this,e)}o(e,null,[{key:"getSystem",value:function n(){if(typeof e.fioriFrontendSystemInfo==="undefined"&&typeof window!=="undefined"&&window.sap&&window.sap.ushell&&window.sap.ushell.Container){e.fioriFrontendSystemInfo=new i({id:window.sap.ushell.Container.getLogonSystem().getName()+"."+window.sap.ushell.Container.getLogonSystem().getClient(),label:window.sap.ushell.Container.getLogonSystem().getName()+" "+window.sap.ushell.Container.getLogonSystem().getClient()})}return e.fioriFrontendSystemInfo}}]);return e}();return r})})();