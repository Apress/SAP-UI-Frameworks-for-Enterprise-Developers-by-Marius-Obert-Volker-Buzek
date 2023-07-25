/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var e={apiVersion:2};e.render=function(e,t){var n=t.getSelectedContent();e.openStart("div",t);e.class("sapSuiteUiCommonsChartContainer");e.style("width",t.getWidth());e.openEnd();e.openStart("div",t.getId()+"-wrapper");e.class("sapSuiteUiCommonsChartContainerWrapper");e.openEnd();e.openStart("div");e.class("sapSuiteUiCommonsChartContainerToolBarArea");e.openEnd();e.renderControl(t.getToolbar());e.close("div");e.openStart("div",t.getId()+"-chartArea");e.class("sapSuiteUiCommonsChartContainerChartArea");e.openEnd();if(n!==null){e.renderControl(n)}else if(t.getContent().length>0){n=t.getContent()[0];e.renderControl(n)}e.close("div");e.close("div");e.close("div")};return e},true);