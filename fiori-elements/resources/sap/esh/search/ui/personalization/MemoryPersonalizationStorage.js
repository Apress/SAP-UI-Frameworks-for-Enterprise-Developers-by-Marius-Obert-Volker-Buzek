/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function n(e,n,r){if(n)t(e.prototype,n);if(r)t(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var r=function(){function t(){e(this,t);this.dataMap={}}n(t,[{key:"isStorageOfPersonalDataAllowed",value:function e(){return true}},{key:"save",value:function e(){return Promise.resolve()}},{key:"getItem",value:function e(t){return this.dataMap[t]}},{key:"setItem",value:function e(t,n){this.dataMap[t]=n;return true}},{key:"deleteItem",value:function e(t){delete this.dataMap[t]}}],[{key:"create",value:function e(){try{return Promise.resolve(new t)}catch(e){return Promise.reject(e)}}}]);return t}();return r})})();