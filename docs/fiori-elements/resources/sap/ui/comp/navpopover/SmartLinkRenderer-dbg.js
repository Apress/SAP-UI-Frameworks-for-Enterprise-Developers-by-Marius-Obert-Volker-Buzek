/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */

// Provides control sap.ui.comp.navpopover.SmartLink.
sap.ui.define([
	'sap/ui/core/Renderer', 'sap/m/LinkRenderer', 'sap/base/strings/whitespaceReplacer'
], function(Renderer, LinkRenderer, whitespaceReplacer) {
	"use strict";

	var SmartLinkRenderer = Renderer.extend(LinkRenderer);

	SmartLinkRenderer.apiVersion = 2;

	SmartLinkRenderer.render = function(oRm, oControl) {
		var bRenderLink = true;
		if (oControl.getIgnoreLinkRendering()) {
			var oReplaceControl = oControl._getInnerControl();
			if (oReplaceControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.renderControl(oReplaceControl);
				oRm.close("div");
				bRenderLink = false;
			}
		}
		if (bRenderLink) {
			if (!oControl.getAriaLabelledBy() || (Array.isArray(oControl.getAriaLabelledBy()) && oControl.getAriaLabelledBy().length == 0)) {
				oControl.addAriaLabelledBy(oControl);
			}
			LinkRenderer.render.apply(this, arguments);
		}
	};

	SmartLinkRenderer.writeText = function(oRm, oControl) {
		var sUOM = oControl.getUom();
		var sText = whitespaceReplacer(oControl.getText());
		if (!sUOM) {
			oRm.text(sText);
			return;
		}
		// Add "spacers" to UoM to avoid gap in the underlining between value and UOM
		// Filling up the UoM area to be atleast 5 characters wide to avoide the gap
		sUOM = sUOM.padStart(5, "\u2007");
		oRm.openStart("span");
		oRm.openEnd();
		oRm.text(sText);
		oRm.close("span");

		oRm.openStart("span");
		oRm.style("display", "inline-flex");
		oRm.style("min-width", "2.5em");
		oRm.style("width", "3.0em");
		oRm.style("justify-content", "end");
		oRm.openEnd();
		oRm.text(sUOM);
		oRm.close("span");
	};

	return SmartLinkRenderer;

}, /* bExport= */true);
