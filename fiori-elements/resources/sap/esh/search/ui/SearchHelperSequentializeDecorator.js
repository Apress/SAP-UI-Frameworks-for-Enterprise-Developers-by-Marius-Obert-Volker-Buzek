/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define([],function(){function n(n){var t;return function(){var e=this;for(var r=arguments.length,u=new Array(r),i=0;i<r;i++){u[i]=arguments[i]}if(!t){t=n.apply(this,u)}else{t=t.then(function(){return n.apply(e,u)},function(){return n.apply(e,u)})}var a=t;a["finally"](function(){if(a===t){t=null}})["catch"](function(){});return t}}var t={__esModule:true};t.sequentializedExecution=n;return t})})();