/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './InfoTileRenderer', 'sap/ui/core/Renderer' ], function(InfoTileRenderer, Renderer) {
	"use strict";

	/**
	 * @class MonitoringTile renderer.
	 * @static
	 */
	var MonitoringTileRenderer = Renderer.extend(InfoTileRenderer);

	/**
	 * Renders the HTML for the footer text of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer text should be rendered
	 */
	MonitoringTileRenderer.renderFooterText = function(oRm, oControl) {
		oRm.write("<span");
		oRm.writeAttribute("id", oControl.getId() + "-footer-text");
		oRm.addClass("sapSuiteUiCommonsMTFooterText");
		oRm.addClass(oControl.getFooterColor());
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl.getFooter());
		oRm.write("</span>");
	};

	return MonitoringTileRenderer;
}, /* bExport= */ true);
