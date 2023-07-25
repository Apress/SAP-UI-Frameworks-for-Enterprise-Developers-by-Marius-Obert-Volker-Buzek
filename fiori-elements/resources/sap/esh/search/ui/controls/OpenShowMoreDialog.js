/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}function t(e){return function(){for(var t=[],r=0;r<arguments.length;r++){t[r]=arguments[r]}try{return Promise.resolve(e.apply(this,t))}catch(e){return Promise.reject(e)}}}sap.ui.define(["../SearchFacetDialogModel","./SearchFacetDialog","../sinaNexTS/providers/abap_odata/UserEventLogger"],function(r,n,a){function o(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const i=t(function(t,r){var n=new c({searchModel:t});return e(n.initAsync(),function(){n.setData(t.getData());n.config=t.config;n.sinaNext=t.sinaNext;n.prepareFacetList();var e={selectedAttribute:r?r:"",selectedTabBarIndex:0};var a=new s("".concat(t.config.id,"-SearchFacetDialog"),e);a.setModel(n);a.setModel(t,"searchModel");a.open();t.eventLogger.logEvent({type:u.FACET_SHOW_MORE,referencedAttribute:r})})});var c=o(r);var s=o(n);var u=a["UserEventType"];var f={__esModule:true};f.openShowMoreDialog=i;return f})})();