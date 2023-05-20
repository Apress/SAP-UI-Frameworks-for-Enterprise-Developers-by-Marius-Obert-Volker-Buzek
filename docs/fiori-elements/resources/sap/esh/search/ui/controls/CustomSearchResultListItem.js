/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/controls/SearchResultListItem"],function(t){var e;function r(t,e,r){if(e in t){Object.defineProperty(t,e,{value:r,enumerable:true,configurable:true,writable:true})}else{t[e]=r}return t}var n=t.extend("sap.esh.search.ui.controls.CustomSearchResultListItem",(e={renderer:{apiVersion:2},metadata:{properties:{content:{type:"sap.esh.search.ui.controls.CustomSearchResultListItemContent"}}},constructor:function e(r,n){t.prototype.constructor.call(this,r,n)},setupCustomContentControl:function t(){var e=this.getProperty("content");e.setTitle(this.getProperty("title"));e.setTitleUrl(this.getProperty("titleUrl"));e.setType(this.getProperty("type"));e.setImageUrl(this.getProperty("imageUrl"));e.setAttributes(this.getProperty("attributes"))}},r(e,"renderer",function e(r,n){n.setupCustomContentControl();t.prototype.getRenderer.call(this).render(arguments)}),r(e,"onAfterRendering",function t(){this.getProperty("content").getTitleVisibility()}),e));return n})})();