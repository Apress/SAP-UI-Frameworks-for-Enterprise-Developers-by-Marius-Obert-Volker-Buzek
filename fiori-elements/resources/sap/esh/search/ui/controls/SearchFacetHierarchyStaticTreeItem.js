/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/m/CustomTreeItem"],function(e){var t=e.extend("sap.esh.search.ui.controls.SearchFacetHierarchyStaticTreeItem",{renderer:{apiVersion:2},metadata:{properties:{selectLine:{type:"boolean",defaultValue:false}}},constructor:function t(s,a){var r=this;e.prototype.constructor.call(this,s,a);var i={onAfterRendering:function e(){var t=r.getDomRef();if(r.getProperty("selectLine")){if(!t.classList.contains("sapMLIBSelected")){t.classList.add("sapMLIBSelected")}}else{if(t.classList.contains("sapMLIBSelected")){t.classList.remove("sapMLIBSelected")}}}};this.addEventDelegate(i,this)}});return t})})();