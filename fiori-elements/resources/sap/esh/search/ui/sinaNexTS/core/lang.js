/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
function e(){var e=typeof window.InstallTrigger!=="undefined";var n=false||!!document.documentMode;var a=!n&&!!window.StyleMedia;var t=!!window.chrome&&!!window.chrome.webstore;var r=[];if(n||a){var i=window.navigator.browserLanguage||window.navigator.language;r.splice(0,0,this._getLanguageCountryObject(i))}else if(e||t){var g=window.navigator.language;var u=window.navigator.languages.slice();var o=u.indexOf(g);if(o>-1){u.splice(o,1)}r.splice(0,0,this._getLanguageCountryObject(g));for(var s=0;s<u.length;s++){var l=this._getLanguageCountryObject(u[s]);if(l){r.splice(r.length,0,l)}}}else{r.splice(0,0,this._getLanguageCountryObject(window.navigator.language))}return r}function n(e){var n;var a;if(e.length===2){n=e;a=""}else if(e.length===5&&e.indexOf("-")===2){n=e.substr(0,2);a=e.substr(3)}else{return undefined}return{Language:n,Country:a}}var a={__esModule:true};a.getLanguagePreferences=e;a._getLanguageCountryObject=n;return a})})();