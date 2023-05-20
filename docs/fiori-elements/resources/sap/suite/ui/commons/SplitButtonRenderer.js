/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function(){"use strict";var t={};t.render=function(t,e){t.write("<span");t.writeControlData(e);t.addClass("sapSuiteUiCommonsSplitButton");t.writeClasses();t.write(">");t.renderControl(e._oDefaultActionButton);t.renderControl(e._oMenuButton);t.write("</span>")};return t},true);