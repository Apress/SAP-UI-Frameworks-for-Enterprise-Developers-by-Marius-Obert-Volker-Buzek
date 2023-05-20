/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../i18n","sap/esh/search/ui/SearchHelper","sap/m/Button","sap/ui/core/IconPool"],function(e,t,r,n){function i(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}var o=i(e);var s=r.extend("sap.esh.search.ui.controls.SearchButton",{renderer:{apiVersion:2},constructor:function e(i,s){r.prototype.constructor.call(this,i,s);this.setIcon(n.getIconURI("search"));this.setTooltip(o.getText("search"));this.bindProperty("enabled",{parts:[{path:"/initializingObjSearch"}],formatter:function e(r){return!t.isSearchAppActive()||!r}});this.addStyleClass("searchBtn")}});return s})})();