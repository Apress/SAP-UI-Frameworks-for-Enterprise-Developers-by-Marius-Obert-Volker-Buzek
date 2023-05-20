/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./Personalizer"],function(e){function t(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function r(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function a(e,t,r){if(t)n(e.prototype,t);if(r)n(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var o=t(e);var l=function(){function e(t,n){var a=arguments.length>2&&arguments[2]!==undefined?arguments[2]:"default";r(this,e);this.keyValueStore=t;this.searchModel=n;this.prefix=a}a(e,[{key:"isStorageOfPersonalDataAllowed",value:function e(){return this.keyValueStore.isStorageOfPersonalDataAllowed({searchModel:this.searchModel})}},{key:"saveNotDelayed",value:function e(){return Promise.resolve()}},{key:"save",value:function e(){return this.keyValueStore.save({searchModel:this.searchModel})}},{key:"getPersonalizer",value:function e(t){return new o(t,this)}},{key:"deleteItem",value:function e(t){this.keyValueStore.deleteItem(t,{searchModel:this.searchModel})}},{key:"getItem",value:function e(t){return this.keyValueStore.getItem(t,{searchModel:this.searchModel})}},{key:"setItem",value:function e(t,r){return this.keyValueStore.setItem(t,r,{searchModel:this.searchModel})}}]);return e}();return l})})();