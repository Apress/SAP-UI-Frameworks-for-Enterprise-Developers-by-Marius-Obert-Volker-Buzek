/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var t={};t.render=function(t,e){var i=e.getTooltip_AsString();t.write("<div");t.writeControlData(e);if(i){t.writeAttributeEscaped("title",i)}t.addClass("sapSuiteUtg");t.writeClasses();t.write(">");t.write("<div");t.addClass("sapSuiteUtgHeader");t.writeClasses();t.writeAttribute("id",e.getId()+"-thing-group-header");t.write(">");t.write("<div");t.addClass("sapSuiteUtgTitle");t.writeClasses();t.writeAttribute("id",e.getId()+"-thing-group-title");t.write(">");t.writeEscaped(e.getTitle());t.write("</div>");t.write("<div");t.addClass("sapSuiteUtgDesc");t.writeClasses();t.writeAttribute("id",e.getId()+"-thing-group-desc");t.write(">");t.writeEscaped(e.getDescription());t.write("</div>");t.write("</div>");t.write("<div");t.addClass("sapSuiteUtgContent");t.addClass("sapSuiteUtgContent"+e.getDesign());t.writeClasses();t.writeAttribute("id",e.getId()+"-thing-group-content");t.write(">");t.renderControl(e.getContent());t.write("</div>");t.write("</div>")};return t},true);