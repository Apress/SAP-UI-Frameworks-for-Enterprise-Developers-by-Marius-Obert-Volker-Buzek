/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/base/security/encodeXML"
], function(encodeXML) {
	"use strict";

	/**
	 * @class PictureZoomIn renderer.
	 * @static
	 */
	var PictureZoomInRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	PictureZoomInRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteUiCommonsPictureZoomIn");
		oRm.writeClasses();
		oRm.writeAttribute("role", "img");
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttribute("title", encodeXML(sTooltip));
		}
		oRm.write(">");
		if (oControl.getBusyIndicator()) {
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-busy");
			oRm.addClass("sapSuiteUiCommonsPictureZoomInBusy");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getBusyIndicator());
			oRm.write("</div>");
		}
		oRm.renderControl(oControl._oImage);
		oRm.renderControl(oControl._oDescription);
		oRm.write("</div>");
	};

	return PictureZoomInRenderer;
}, /* bExport= */ true);
