/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/security/encodeXML"],function(t){"use strict";var e={};e.render=function(e,i){e.write("<div");e.writeControlData(i);e.addClass("sapSuiteUiCommonsPictureZoomIn");e.writeClasses();e.writeAttribute("role","img");var r=i.getTooltip_AsString();if(r){e.writeAttribute("title",t(r))}e.write(">");if(i.getBusyIndicator()){e.write("<div");e.writeAttribute("id",i.getId()+"-busy");e.addClass("sapSuiteUiCommonsPictureZoomInBusy");e.writeClasses();e.write(">");e.renderControl(i.getBusyIndicator());e.write("</div>")}e.renderControl(i._oImage);e.renderControl(i._oDescription);e.write("</div>")};return e},true);