/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function r(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function t(e,t,n){if(t)r(e.prototype,t);if(n)r(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var n=function(){function r(t){e(this,r);this.provider=t;this.sina=t.sina}t(r,[{key:"getActiveResult",value:function e(r){for(var t=0;t<r.length;++t){var n=r[t];if(n.IsCurrentQuery){return n}}return null}},{key:"parse",value:function e(r){var t={success:false,description:""};if(!r||!r.ResultList||!r.ResultList.NLQQueries||!r.ResultList.NLQQueries.results){return t}var n=r.ResultList.NLQQueries.results;var i=this.getActiveResult(n);if(!i){return t}t.success=true;t.description=i.Description;return t}}]);return r}();var i={__esModule:true};i.NlqParser=n;return i})})();