/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class HeaderCell renderer.
	 * @static
	 */
	var HeaderCellRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	HeaderCellRenderer.render = function(oRm, oControl) {
		var oWestControl = oControl.getWest();
		var oNorthControl = oControl.getNorth();
		var oEastControl = oControl.getEast();
		var oSouthControl = oControl.getSouth();
		var sType = "";
		var sDesc = "";

		if (oWestControl !== null) {
			sType += "W";
			sDesc += oControl.getId() + "-west ";
		}
		if (oNorthControl !== null) {
			sType += "N";
			sDesc += oControl.getId() + "-north ";
		}
		if (oEastControl !== null) {
			sType += "E";
			sDesc += oControl.getId() + "-east ";
		}
		if (oSouthControl !== null) {
			sType += "S";
			sDesc += oControl.getId() + "-south";
		}

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteUiCommonsHeaderCell");
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.writeAttribute("role", "presentation");
		oRm.writeAttribute("aria-live", "assertive");
		oRm.writeAttribute("aria-labelledby", sDesc);
		oRm.write(">");
		// write the HTML into the render manager
		if (oWestControl !== null) {
			this._renderInnerCell(oRm, oWestControl, sType, "sapSuiteHdrCellWest", oControl.getId() + "-west");
		}
		if (oNorthControl !== null) {
			this._renderInnerCell(oRm, oNorthControl, sType, "sapSuiteHdrCellNorth", oControl.getId() + "-north");
		}
		if (oEastControl !== null) {
			this._renderInnerCell(oRm, oEastControl, sType, "sapSuiteHdrCellEast", oControl.getId() + "-east");
		}
		if (oSouthControl !== null) {
			this._renderInnerCell(oRm, oSouthControl, sType, "sapSuiteHdrCellSouth", oControl.getId() + "-south");
		}
		oRm.write("</div>");
	};

	HeaderCellRenderer._renderInnerCell = function(oRm, oControl, sType, side, sId) {
		oRm.write("<div");
		oRm.addClass(sType);
		oRm.addClass(side);
		oRm.addStyle("height", oControl.getHeight());
		oRm.writeStyles();
		oRm.writeClasses();
		oRm.writeAttribute("id", sId);
		//oRm.writeAttribute("aria-hidden", "true");
		if (oControl.getContent() && oControl.getContent().getId()) {
			oRm.writeAttribute("aria-labelledby", oControl.getContent().getId());
		}
		oRm.write(">");
		oRm.renderControl(oControl.getContent());
		oRm.write("</div>");
	};

	return HeaderCellRenderer;
}, /* bExport= */ true);
