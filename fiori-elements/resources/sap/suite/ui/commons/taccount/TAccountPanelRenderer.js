/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Renderer","sap/m/PanelRenderer"],function(e,n){"use strict";var t=e.extend(n),a;t.renderContent=function(e,t){a=t;n.renderContent.apply(this,[e,t])};t.apiVersion=2;t.renderChildren=function(e,n){var t=a&&a.getId();if(a){var r=a.getTable();if(r){e.openStart("div").attr("id",t+"-table").class("sapSuiteUiCommonsAccountPanelTable").openEnd();e.renderControl(r);e.close("div")}}e.openStart("div").attr("id",t+"-datacontent").class("sapSuiteUiCommonsAccountPanelContent").openEnd();n.forEach(e.renderControl);e.close("div");var o=a&&a.getShowOverlay()?"sapSuiteUiCommonsAccountPanelOverlayVisible":"";e.openStart("div").attr("id",t+"-overlay").class("sapSuiteUiCommonsAccountPanelOverlay").class(o).openEnd();e.close("div")};return t},true);