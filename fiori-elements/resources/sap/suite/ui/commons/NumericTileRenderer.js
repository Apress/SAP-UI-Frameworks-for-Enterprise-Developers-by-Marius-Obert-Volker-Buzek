/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./InfoTileRenderer","sap/ui/core/Renderer"],function(e,t){"use strict";var r=t.extend(e);r._getFooterText=function(e,t){var r=t.getFooter();var o=t.getUnit();return o?sap.ui.getCore().getConfiguration().getRTL()?(r?r+" ,":"")+o:o+(r?", "+r:""):r};r.renderFooterTooltip=function(e,t){e.writeAttributeEscaped("title",this._getFooterText(e,t))};r.renderFooterText=function(e,t){e.writeEscaped(this._getFooterText(e,t))};return r},true);