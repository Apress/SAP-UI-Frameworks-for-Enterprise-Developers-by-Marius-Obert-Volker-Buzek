/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var e={};e.renderDecrementScrollButton=function(e,t,r){e.write("<a>");e.write('<span id="'+t.getId()+'-decrementScrollButton"');e.write('title="');e.writeEscaped(r.resBundle.getText("DATERANGESCROLLER_PREV_TEXT"));e.write('"');e.addClass("sapSuiteUiCommonsDateRangeScrollerScrollBtn");e.addClass("sapSuiteUiCommonsDateRangeScrollerDecBtnArrow");e.writeClasses();e.write(">");e.write("</span>");e.write("</a>")};e.renderIncrementScrollButton=function(e,t,r){e.write("<a>");e.write('<span id="'+t.getId()+'-incrementScrollButton"');e.write('title="');e.writeEscaped(r.resBundle.getText("DATERANGESCROLLER_NEXT_TEXT"));e.write('"');e.addClass("sapSuiteUiCommonsDateRangeScrollerScrollBtn");e.addClass("sapSuiteUiCommonsDateRangeScrollerIncBtnArrow");e.writeClasses();e.write(">");e.write("</span>");e.write("</a>")};e.render=function(e,t){var r=sap.ui.getCore().getConfiguration().getLanguage();var i=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons",r);var n="&#9668";var a="&#9658";var s={resBundle:i,prevArrowSymbol:n,nextArrowSymbol:a};e.write("<span");e.writeControlData(t);e.addClass("sapSuiteUiCommonsDateRangeScroller");e.writeClasses();e.writeAttribute("tabindex","-1");e.write(">");if(t.getTooltip_AsString()){e.write('<SPAN id="'+t.getId()+'-Descr"');e.addStyle("visibility","hidden");e.addStyle("display","none");e.writeStyles();e.write(">");e.writeEscaped(t.getTooltip_AsString());e.write("</SPAN>")}this.renderDecrementScrollButton(e,t,s);this.renderIncrementScrollButton(e,t,s);e.write("<span");e.writeAttribute("id",t.getId()+"-labelarea");e.writeAttribute("tabindex","0");e.writeClasses();e.writeAccessibilityState(t,{role:"list",live:"assertive",describedby:t.getTooltip_AsString()?t.getId()+"-Descr "+t.getAriaDescribedBy().join(" "):undefined});e.write(">");e.renderControl(t._oDateRangeLabel);e.write("</span>");e.write("</span>")};return e},true);