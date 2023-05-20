/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../../sina/SuggestionType"],function(e){function r(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function n(e,r){for(var n=0;n<r.length;n++){var t=r[n];t.enumerable=t.enumerable||false;t.configurable=true;if("value"in t)t.writable=true;Object.defineProperty(e,t.key,t)}}function t(e,r,t){if(r)n(e.prototype,r);if(t)n(e,t);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var a=e["SuggestionType"];var i=function(){function e(n){r(this,e);this.provider=n;this.sina=n.sina}t(e,[{key:"split",value:function e(r){var n=r.lastIndexOf(" ");if(n<0){return{searchTerm:null,suggestionTerm:r}}var t=r.slice(0,n);t=t.replace(/\s+$/,"");if(t.length===0){return{searchTerm:null,suggestionTerm:r}}var a=r.slice(n);a=a.replace(/^\s+/,"");if(a.length===0){return{searchTerm:null,suggestionTerm:r}}return{searchTerm:t,suggestionTerm:a}}},{key:"concatenate",value:function e(r,n){if(!r.searchTerm){return}var t;var i=[];var s=r.searchTerm.split(" ");for(var u=0;u<s.length;u++){t=s[u];t=t.trim();i.push({term:t,regExp:new RegExp(this.escapeRegExp(t),"i")})}for(var c=0;c<n.length;++c){var o=n[c];if(o.suggestionType!==a.SearchTerm&&o.suggestionType!==a.SearchTermAndDataSource){continue}var l=[];for(var f=0;f<i.length;++f){var g=i[f];if(!g.regExp.test(o.filter.searchTerm)){l.push(g.term)}}var p=[];var h=l.join(" ");for(var v=0;v<l.length;v++){t=l[v];p.push("<b>"+t+"</b>")}var m=p.join(" ");o.label=m+" "+o.label;o.filter.searchTerm=o.searchTerm=h+" "+o.filter.searchTerm;this.concatenate(r,o.childSuggestions)}}},{key:"escapeRegExp",value:function e(r){return r.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}}]);return e}();function s(e,r){var n=new i(e);return n.split(r)}function u(e,r,n){var t=new i(e);return t.concatenate(r,n)}var c={__esModule:true};c.split=s;c.concatenate=u;return c})})();