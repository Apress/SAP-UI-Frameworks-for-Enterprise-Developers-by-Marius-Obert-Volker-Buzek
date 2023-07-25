/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./SuggestionType"],function(e){function t(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||false;r.configurable=true;if("value"in r)r.writable=true;Object.defineProperty(e,r.key,r)}}function r(e,t,r){if(t)n(e.prototype,t);if(r)n(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}var i=e["Type"];var o=function(){function e(n){t(this,e);this.model=n.model;this.suggestionHandler=n.suggestionHandler}r(e,[{key:"abortSuggestions",value:function e(){return}},{key:"getSuggestions",value:function e(){try{const e=this;if(e.model.getSearchBoxTerm().length>0){return Promise.resolve([])}var t=JSON.parse(JSON.stringify(e.model.recentlyUsedStorage.getItems()));var n=e.suggestionHandler.getSuggestionLimit(i.Recent);t=t.slice(0,n);return Promise.resolve(t)}catch(e){return Promise.reject(e)}}}]);return e}();return o})})();