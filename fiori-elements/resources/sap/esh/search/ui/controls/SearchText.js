/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/m/Text","sap/esh/search/ui/SearchHelper"],function(e,r){var a=e.extend("sap.esh.search.ui.controls.SearchText",{renderer:{apiVersion:2},metadata:{properties:{isForwardEllipsis4Whyfound:{type:"boolean",defaultValue:false}},aggregations:{icon:{type:"sap.ui.core.Icon",multiple:false}}},constructor:function r(a,t){e.prototype.constructor.call(this,a,t)},onAfterRendering:function e(){var a=this.getDomRef();r.boldTagUnescaper(a);var t=this.getAggregation("icon");if(t){var n=sap.ui.getCore().createRenderManager();var o=document.createElement("span");a.prepend(" ");a.prepend(o);n.render(t,o);n.destroy()}}});return a})})();