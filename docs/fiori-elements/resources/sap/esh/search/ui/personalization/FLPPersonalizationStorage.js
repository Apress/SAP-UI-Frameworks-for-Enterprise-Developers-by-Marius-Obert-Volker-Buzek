/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,n){if(n){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../SearchHelper"],function(t){function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function a(e,t,n){if(t)r(e.prototype,t);if(n)r(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}function i(e,t,n){if(t in e){Object.defineProperty(e,t,{value:n,enumerable:true,configurable:true,writable:true})}else{e[t]=n}return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var o=t["convertJQueryDeferredToPromise"];var u=function(){function t(e){n(this,t);i(this,"eshIsStorageOfPersonalDataAllowedKey","ESH-IsStorageOfPersonalDataAllowed");this.container=e}a(t,[{key:"deletePersonalData",value:function t(){return e()}},{key:"setIsStorageOfPersonalDataAllowed",value:function e(t){this.setItem(this.eshIsStorageOfPersonalDataAllowedKey,t)}},{key:"isStorageOfPersonalDataAllowed",value:function e(){var t=this.getItem(this.eshIsStorageOfPersonalDataAllowedKey);if(typeof t==="boolean"){return t}return true}},{key:"save",value:function e(){var t=this.container.save();return o(t)}},{key:"getItem",value:function e(t){t=this.limitLength(t);return this.container.getItemValue(t)}},{key:"setItem",value:function e(t,n){t=this.limitLength(t);var r=this.getItem(t);if(JSON.stringify(r)===JSON.stringify(n)){return true}this.container.setItemValue(t,n);this.save();return true}},{key:"deleteItem",value:function e(t){this.container.delItem(t)}},{key:"limitLength",value:function e(t){return t.slice(-40)}}],[{key:"create",value:function n(){try{var r=sap.ushell.Container.getServiceAsync("Personalization").then(function(e){return e.getContainer("ushellSearchPersoServiceContainer")}).then(function(e){return new t(e)});return e(r)}catch(e){return Promise.reject(e)}}}]);return t}();return u})})();