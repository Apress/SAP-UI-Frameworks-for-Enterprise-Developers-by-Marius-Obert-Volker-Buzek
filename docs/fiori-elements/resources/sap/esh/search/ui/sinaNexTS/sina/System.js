/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,i){if(!(e instanceof i)){throw new TypeError("Cannot call a class as a function")}}function i(e,i){for(var t=0;t<i.length;t++){var n=i[t];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function t(e,t,n){if(t)i(e.prototype,t);if(n)i(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */var n=function(){function i(t){e(this,i);this._id=t.id;this._label=t.label}t(i,[{key:"id",get:function e(){return this._id}},{key:"label",get:function e(){return this._label}},{key:"equals",value:function e(i){return(this===null||this===void 0?void 0:this._id)===(i===null||i===void 0?void 0:i.id)&&(this===null||this===void 0?void 0:this._label)===(i===null||i===void 0?void 0:i.label)}}]);return i}();var l={__esModule:true};l.System=n;return l})})();