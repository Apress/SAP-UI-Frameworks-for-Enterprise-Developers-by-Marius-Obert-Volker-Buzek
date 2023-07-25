/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function n(n,r,e){if(e){return r?r(n):n}if(!n||!n.then){n=Promise.resolve(n)}return r?n.then(r):n}function r(n,r){var e=n();if(e&&e.then){return e.then(r)}return r(e)}function e(n){return function(){for(var r=[],e=0;e<arguments.length;e++){r[e]=arguments[e]}try{return Promise.resolve(n.apply(this,r))}catch(n){return Promise.reject(n)}}}sap.ui.define([],function(){const t=e(function(e){let i=false;return r(function(){if(typeof e==="string"){e=e.trim();return r(function(){if(e.indexOf("/")>=0&&e.indexOf("Provider")<0&&e[0]!=="{"){e=require(e);return n(t(e),function(n){i=true;return n})}},function(n){if(i)return n;if(e[0]!=="{"){e='{ "provider" : "'+e+'"}'}e=JSON.parse(e)})}},function(n){return i?n:e})});var i;(function(n){n["ABAP_ODATA"]="abap_odata";n["HANA_ODATA"]="hana_odata";n["INAV2"]="inav2";n["MULTI"]="multi";n["SAMPLE"]="sample";n["DUMMY"]="dummy"})(i||(i={}));var u={__esModule:true};u.AvailableProviders=i;u._normalizeConfiguration=t;return u})})();