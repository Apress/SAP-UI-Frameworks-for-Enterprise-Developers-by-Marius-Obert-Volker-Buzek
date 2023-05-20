/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function n(e,n,r){if(n)t(e.prototype,n);if(r)t(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var r=function(){function t(n,r){e(this,t);this.key=n;this.personalizationStorageInstance=r;this.key=n;this.personalizationStorageInstance=r}n(t,[{key:"getKey",value:function e(){return this.key}},{key:"setPersData",value:function e(t){return jQuery.Deferred().resolve(this.personalizationStorageInstance.setItem(this.key,t))}},{key:"getPersData",value:function e(){return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key))}},{key:"getResetPersData",value:function e(){return jQuery.Deferred().resolve(this.personalizationStorageInstance.getItem(this.key+"INITIAL"))}}]);return t}();return r})})();