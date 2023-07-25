/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],
	function() {
	"use strict";

	/**
	 * @class TileContent renderer.
	 * @static
	 */
	var TileContent2X2Renderer = {};

	/**
	 * Renders the HTML for the title of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control whose title should be rendered
	 */
	TileContent2X2Renderer.render = function(oRm, oControl) {

		var sTooltip = oControl.getTooltip_AsString();
		var sAltText = oControl.getAltText ? oControl.getAltText() : "";

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteTileCnt");
		oRm.addClass(oControl._getContentType());
		oRm.addClass(oControl.getSize());
		oRm.addClass("ft-" + "TwoByTwo");
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.writeAttribute("aria-describedby", oControl.getId() + "-info");
		oRm.writeClasses();
		oRm.write(">");
		this.renderContent(oRm, oControl);
		this.renderFooter(oRm, oControl);

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-info");
		oRm.addStyle("display", "none");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(sAltText);
		oRm.write("</div>");
		oRm.write("</div>");

	};


	/**
	 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control whose content should be rendered
	 */
	TileContent2X2Renderer.renderContent = function(oRm, oControl) {
		var oCnt = oControl.getContent();
		oRm.write("<div");
		oRm.addClass("sapSuiteTileCntContent");
		oRm.addClass(oControl.getSize());
		oRm.addClass("ft-" + "TwoByTwo");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-content");
		oRm.write(">");
		if (oCnt && !oCnt.hasStyleClass("sapSuiteUiTcInnerMarker")) {
			oCnt.addStyleClass("sapSuiteUiTcInnerMarker");
		}
		oRm.renderControl(oCnt);
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the footer of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control whose footer should be rendered
	 */
	TileContent2X2Renderer.renderFooter = function(oRm, oControl) {
		var sFooterTxt = oControl._getFooterText(oRm, oControl);
		// footer text div
		oRm.write("<div");
		oRm.addClass("sapSuiteTileCntFtrTxt");
		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-footer-text");
		oRm.writeAttributeEscaped("title", sFooterTxt);
		oRm.write(">");
		oRm.writeEscaped(sFooterTxt);
		oRm.write("</div>");
	};

	return TileContent2X2Renderer;

}, /* bExport= */ true);