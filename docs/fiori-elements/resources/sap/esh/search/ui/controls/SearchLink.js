/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchHelper","sap/m/Link"],function(e,r){var n=r.extend("sap.esh.search.ui.controls.SearchLink",{renderer:{apiVersion:2},metadata:{aggregations:{icon:{type:"sap.ui.core.Icon",multiple:false}}},constructor:function e(n,a){r.prototype.constructor.call(this,n,a)},onAfterRendering:function r(){var n=this.getDomRef();e.boldTagUnescaper(n);var a=this.getAggregation("icon");if(a){var t=sap.ui.getCore().createRenderManager();var o=document.createElement("span");n.prepend(" ");n.prepend(o);t.render(a,o);t.destroy()}}});return n})})();