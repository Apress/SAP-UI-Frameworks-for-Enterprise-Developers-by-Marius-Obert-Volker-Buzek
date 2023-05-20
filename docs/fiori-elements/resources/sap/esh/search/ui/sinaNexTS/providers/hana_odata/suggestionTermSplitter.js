/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function r(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||false;t.configurable=true;if("value"in t)t.writable=true;Object.defineProperty(e,t.key,t)}}function n(e,n,t){if(n)r(e.prototype,n);if(t)r(e,t);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var t=function(){function r(n){e(this,r);this.provider=n;this.sina=n.sina}n(r,[{key:"split",value:function e(r){var n=r.lastIndexOf(" ");if(n<0){return{searchTerm:null,suggestionTerm:r}}var t=r.slice(0,n);t=t.replace(/\s+$/,"");if(t.length===0){return{searchTerm:null,suggestionTerm:r}}var a=r.slice(n);a=a.replace(/^\s+/,"");if(a.length===0){return{searchTerm:null,suggestionTerm:r}}return{searchTerm:t,suggestionTerm:a}}},{key:"concatenate",value:function e(r,n){if(!r.searchTerm){return}var t;var a=[];var i=r.searchTerm.split(" ");for(var s=0;s<i.length;s++){t=i[s];t=t.trim();a.push({term:t,regExp:new RegExp(this.escapeRegExp(t),"i")})}for(var u=0;u<n.length;++u){var l=n[u];var c=[];for(var o=0;o<a.length;++o){var f=a[o];if(!f.regExp.test(l.filter.searchTerm)){c.push(f.term)}}var h=[];var p=c.join(" ");for(var v=0;v<c.length;v++){t=c[v];h.push("<b>"+t+"</b>")}var g=h.join(" ");l.label=g+" "+l.label;l.filter.searchTerm=l.searchTerm=p+" "+l.filter.searchTerm;this.concatenate(r,l.childSuggestions)}}},{key:"escapeRegExp",value:function e(r){return r.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}}]);return r}();function a(e,r){var n=new t(e);return n.split(r)}function i(e,r,n){var a=new t(e);return a.concatenate(r,n)}var s={__esModule:true};s.SuggestionTermSplitter=t;s.split=a;s.concatenate=i;return s})})();