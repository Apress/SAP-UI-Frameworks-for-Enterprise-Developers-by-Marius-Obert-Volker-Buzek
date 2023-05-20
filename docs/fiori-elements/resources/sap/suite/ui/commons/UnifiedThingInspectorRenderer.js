/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var t={};t.render=function(t,e){var i=e.getTooltip_AsString();t.write("<div");t.writeControlData(e);if(i){t.writeAttributeEscaped("title",i)}t.addStyle("height",e.getHeight());t.writeStyles();t.addClass("sapSuiteUti");t.writeClasses();t.write(">");t.renderControl(e._oNavContainer);t.write("</div>")};return t},true);