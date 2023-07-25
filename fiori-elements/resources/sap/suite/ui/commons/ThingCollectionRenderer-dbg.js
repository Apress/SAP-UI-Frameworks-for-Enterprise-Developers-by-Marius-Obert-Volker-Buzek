/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class ThingCollection renderer.
	 * @static
	 */
	var ThingCollectionRenderer = {};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ThingCollectionRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapSuiteTc");
		oRm.writeClasses();
		oRm.addStyle("width", oControl.getWidth());
		oRm.addStyle("height", oControl.getHeight());
		if (oControl.getMinWidth()) {
			oRm.addStyle("min-width", oControl.getMinWidth());
		}
		if (oControl.getMinHeight()) {
			oRm.addStyle("min-height", oControl.getMinHeight());
		}
		oRm.writeStyles();
		oRm.write(">");
		oRm.renderControl(oControl._oRemoveButton);

		oRm.write("<nav");
		oRm.writeAttribute("id", oControl.getId() + "-nav-prev");
		oRm.addClass("sapSuiteTcNavPrev");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</nav>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-container");
		oRm.writeAttribute("tabindex", "0");

		oRm.writeAccessibilityState(oControl, {
			role: 'list',
			live: 'assertive',
			disabled: false
		});

		oRm.addClass("sapSuiteTcContainer");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-first");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.addClass("sapSuiteTcPrev");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-second");
		oRm.writeAttribute("aria-hidden", "false");
		oRm.addClass("sapSuiteTcCenter");
		oRm.writeClasses();
		oRm.write(">");
		if (oControl._oCenterControl) {
			oRm.renderControl(oControl._oCenterControl);
		}
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-third");
		oRm.writeAttribute("aria-hidden", "true");
		oRm.addClass("sapSuiteTcNext");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("</div>");

		oRm.write("<nav");
		oRm.writeAttribute("id", oControl.getId() + "-nav-next");
		oRm.addClass("sapSuiteTcNavNext");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</nav>");
		oRm.write("</div>");
	};

	return ThingCollectionRenderer;
}, /* bExport= */ true);