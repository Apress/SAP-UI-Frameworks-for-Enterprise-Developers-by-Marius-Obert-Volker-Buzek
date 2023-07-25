/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class SplitButton renderer.
	 * @static
	 */
	var SplitButtonRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oSplitButton An object representation of the control that should be rendered
	 */
	SplitButtonRenderer.render = function(oRm, oSplitButton) {
		// write the HTML into the render manager
		oRm.write("<span");
		oRm.writeControlData(oSplitButton);
		oRm.addClass("sapSuiteUiCommonsSplitButton");
		oRm.writeClasses();
		oRm.write(">"); // span element
		oRm.renderControl(oSplitButton._oDefaultActionButton);
		oRm.renderControl(oSplitButton._oMenuButton);
		oRm.write("</span>");
	};

	return SplitButtonRenderer;
}, /* bExport= */ true);
