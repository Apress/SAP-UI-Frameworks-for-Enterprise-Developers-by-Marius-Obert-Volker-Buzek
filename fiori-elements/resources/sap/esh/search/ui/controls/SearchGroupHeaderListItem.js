/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/m/GroupHeaderListItem"],function(t){function e(t){"@babel/helpers - typeof";return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(t)}var o=t.extend("sap.esh.search.ui.controls.SearchGroupHeaderListItem",{renderer:{apiVersion:2,renderCounter:function t(o,r){var n=r.getAggregation("button");if(e(n)==="object"){o.openStart("div",r.getId()+"-groupHeader");o.openEnd();o.renderControl(n);o.close("div")}}},metadata:{aggregations:{button:{type:"sap.m.Button",multiple:false}}},constructor:function e(o,r){t.prototype.constructor.call(this,o,r)}});return o})})();