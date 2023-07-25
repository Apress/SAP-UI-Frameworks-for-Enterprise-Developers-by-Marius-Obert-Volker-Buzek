/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var e={};e.render=function(e,r){if(!r.getVisible()){return}e.write("<span");e.writeControlData(r);e.addClass("sapSuiteUiCommonsDateRangeSlider");e.writeClasses();e.write(">");e.renderControl(r._oDateRangeSliderInternal);e.write("</span>")};return e},true);