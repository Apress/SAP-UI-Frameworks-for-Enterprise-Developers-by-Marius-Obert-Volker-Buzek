/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var e={};e.render=function(e,t){var i=t.getSize();var s=t.getValue();var a=t.getState();var r=t.getTooltip_AsString();e.write("<div");e.writeControlData(t);if(r){e.writeAttributeEscaped("title",r)}if(t.getAnimateTextChange()){e.addStyle("opacity","0.25");e.writeStyles()}e.addClass(i);e.addClass("sapSuiteUiCommonsMC");if(t.hasListeners("press")){e.addClass("sapSuiteUiCommonsPointer")}e.writeClasses();e.writeAttribute("tabindex","0");e.write(">");e.write("<div");e.writeAttribute("id",t.getId()+"-value");e.addClass("sapSuiteUiCommonsMCValue");e.addClass(i);e.addClass(a);e.writeClasses();e.write(">");if(s.length>=4&&(s[3]==="."||s[3]===",")){e.writeEscaped(s.substring(0,3))}else{e.writeEscaped(s?s.substring(0,4):"0")}e.write("</div>");e.write("<div");e.writeAttribute("id",t.getId()+"-icon-container");e.addClass("sapSuiteUiCommonsMCIcon");e.addClass(i);e.addClass(a);e.writeClasses();e.write(">");e.renderControl(t._oIcon);e.write("</div>");e.write("</div>")};return e},true);