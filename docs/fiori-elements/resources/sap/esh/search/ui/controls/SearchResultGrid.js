/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchHelper","sap/f/GridContainer","sap/m/ImageContent","sap/m/GenericTile","sap/m/TileContent"],function(e,t,n,i,r){var a=t.extend("sap.esh.search.ui.controls.SearchResultGrid",{renderer:{apiVersion:2},constructor:function e(a,o){var s=this;t.prototype.constructor.call(this,a,o);t.prototype.constructor.apply(this,[a,o]);this.bindAggregation("items",{path:"/results",factory:function e(t,a){var o=a.getObject();var l=new n({src:o.imageUrl||o.titleIconUrl});if(o.imageFormat==="round"){l.addStyleClass("sapUshellResultListGrid-ImageContainerRound")}return new i("",{header:o.title,subheader:o.titleDescription,tileContent:new r({content:l}),press:function e(t){var n=s.getModel().getProperty(t.getSource().getBindingContext().getPath());if(n.titleNavigation){if(n.titleNavigation._target==="_blank"){window.open(n.titleNavigation._href,"_blank","noopener,noreferrer")}else{window.location.hash=n.titleNavigation._href}}}})}});this.addStyleClass("sapUshellResultListGrid")},onAfterRendering:function t(){e.boldTagUnescaper(this.getDomRef())}});return a})})();