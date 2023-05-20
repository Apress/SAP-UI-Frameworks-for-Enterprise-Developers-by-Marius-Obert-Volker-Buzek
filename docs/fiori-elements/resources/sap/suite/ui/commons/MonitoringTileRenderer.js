/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./InfoTileRenderer","sap/ui/core/Renderer"],function(e,t){"use strict";var r=t.extend(e);r.renderFooterText=function(e,t){e.write("<span");e.writeAttribute("id",t.getId()+"-footer-text");e.addClass("sapSuiteUiCommonsMTFooterText");e.addClass(t.getFooterColor());e.writeClasses();e.write(">");e.writeEscaped(t.getFooter());e.write("</span>")};return r},true);