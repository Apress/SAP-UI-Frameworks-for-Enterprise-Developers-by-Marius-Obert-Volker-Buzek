/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Renderer","sap/ui/Device"],function(e,t){"use strict";return{_appendHeightAndWidth:function(e,t){t.style("height",e.getHeight());t.style("width",e.getWidth())},apiVersion:2,render:function(e,i){e.openStart("div",i);e.class("sapSuiteUiCommonsNetworkGraphMap");this._appendHeightAndWidth(i,e);e.openEnd();e.openStart("div");e.class("sapSuiteUiCommonsNetworkGraphMapTitle");e.openEnd();e.openStart("span");e.class("sapSuiteUiCommonsNetworkGraphMapTitleText");e.openEnd();e.text(i.getTitle());e.close("span");e.close("div");e.openStart("div");e.class("sapSuiteUiCommonsNetworkGraphMapContent");if(t.browser.msie){if(i.getHeight()){e.style("flex-direction","row-reverse");e.style("height","100%")}else{e.style("flex-direction","row-reverse")}}else{if(i.getHeight()){e.style("height","100%")}}e.openEnd();e.close("div");e.close("div")}}},true);