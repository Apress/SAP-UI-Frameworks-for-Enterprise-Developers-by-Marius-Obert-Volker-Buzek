/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||false;n.configurable=true;if("value"in n)n.writable=true;Object.defineProperty(e,n.key,n)}}function r(e,r,n){if(r)t(e.prototype,r);if(n)t(e,n);Object.defineProperty(e,"prototype",{writable:false});return e}var n=function(){function t(r){e(this,t);this.model=r}r(t,[{key:"calculate",value:function e(t,r,n){if(!this.model.config.folderMode||!this.model.config.autoAdjustResultViewTypeInFolderMode){return r}var o;if(n.isFolderMode()){o="searchResultTable"}else{o="searchResultList"}if(t.indexOf(o)<0){return r}return o}}]);return t}();var o={__esModule:true};o.FolderModeResultViewTypeCalculator=n;return o})})();