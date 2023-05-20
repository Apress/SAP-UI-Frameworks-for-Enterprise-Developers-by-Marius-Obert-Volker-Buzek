/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * @class MonitoringContent renderer.
	 * @static
	 */
	var MonitoringContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	MonitoringContentRenderer.render = function(oRm, oControl) {
		var sSize = oControl.getSize();
		var sValue = oControl.getValue();
		var sState = oControl.getState();

		var sTooltip = oControl.getTooltip_AsString();

		oRm.write("<div");
		oRm.writeControlData(oControl);

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		if (oControl.getAnimateTextChange()) {
			oRm.addStyle("opacity", "0.25");
			oRm.writeStyles();
		}

		oRm.addClass(sSize);
		oRm.addClass("sapSuiteUiCommonsMC");
		if (oControl.hasListeners("press")) {
			oRm.addClass("sapSuiteUiCommonsPointer");
		}
		oRm.writeClasses();
		oRm.writeAttribute("tabindex", "0");
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-value");
		oRm.addClass("sapSuiteUiCommonsMCValue");
		oRm.addClass(sSize);
		oRm.addClass(sState);
		oRm.writeClasses();
		oRm.write(">");
		//Control shows only 4 characters. If last shown character is decimal separator -
		//show only first 3 characters. So "144.5" is shown like "144" and not like "144.".
		if (sValue.length >= 4 && (sValue[3] === "." || sValue[3] === ",")) {
			oRm.writeEscaped(sValue.substring(0, 3));
		} else {
			oRm.writeEscaped(sValue ? sValue.substring(0, 4) : "0");
		}
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-icon-container");
		oRm.addClass("sapSuiteUiCommonsMCIcon");
		oRm.addClass(sSize);
		oRm.addClass(sState);
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oIcon);
		oRm.write("</div>");

		oRm.write("</div>");

	};

	return MonitoringContentRenderer;
}, /* bExport= */ true);
