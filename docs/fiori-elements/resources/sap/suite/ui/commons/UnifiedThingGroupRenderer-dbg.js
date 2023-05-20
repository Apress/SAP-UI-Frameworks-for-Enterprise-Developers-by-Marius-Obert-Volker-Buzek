/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class UnifiedThingGroup renderer.
	 * @static
	 */
	var UnifiedThingGroupRenderer = {};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	UnifiedThingGroupRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapSuiteUtg");
		oRm.writeClasses();
		oRm.write(">"); // div element

		// header div
		oRm.write("<div");
		oRm.addClass("sapSuiteUtgHeader");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-thing-group-header");
		oRm.write(">");
		// title div
		oRm.write("<div");
		oRm.addClass("sapSuiteUtgTitle");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-thing-group-title");
		oRm.write(">");
		oRm.writeEscaped(oControl.getTitle());
		oRm.write("</div>");

		// description div
		oRm.write("<div");
		oRm.addClass("sapSuiteUtgDesc");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-thing-group-desc");
		oRm.write(">");
		oRm.writeEscaped(oControl.getDescription());
		oRm.write("</div>");
		oRm.write("</div>");

		// content div
		oRm.write("<div");
		oRm.addClass("sapSuiteUtgContent");
		oRm.addClass("sapSuiteUtgContent" + oControl.getDesign());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-thing-group-content");
		oRm.write(">");
		oRm.renderControl(oControl.getContent());
		oRm.write("</div>");

		oRm.write("</div>");
	};

	return UnifiedThingGroupRenderer;
}, /* bExport= */ true);