/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function e(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function t(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||false;i.configurable=true;if("value"in i)i.writable=true;Object.defineProperty(e,i.key,i)}}function n(e,n,i){if(n)t(e.prototype,n);if(i)t(e,i);Object.defineProperty(e,"prototype",{writable:false});return e}var i=function(){function t(){e(this,t)}n(t,[{key:"show",value:function e(){}},{key:"hide",value:function e(){}},{key:"setBusy",value:function e(){}}]);return t}();var u=function(){function t(n){e(this,t);this.model=n;this.model.setProperty("/isBusy",false)}n(t,[{key:"show",value:function e(){this.model.setProperty("/isBusy",true)}},{key:"hide",value:function e(){this.model.setProperty("/isBusy",false)}},{key:"setBusy",value:function e(t){if(t){this.show()}else{this.hide()}}}]);return t}();var o={__esModule:true};o.DummyBusyIndicator=i;o.BusyIndicator=u;return o})})();