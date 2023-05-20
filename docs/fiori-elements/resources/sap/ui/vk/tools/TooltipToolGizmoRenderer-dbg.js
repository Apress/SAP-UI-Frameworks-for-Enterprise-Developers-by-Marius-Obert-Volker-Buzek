/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * TooltipToolGizmoRenderer renderer.
	 * @namespace
	 */
	var TooltipToolGizmoRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl
	 *            the control to be rendered
	 */
	TooltipToolGizmoRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);
		oRm.class("sapUiVizKitTooltip");
		if (oControl.getParent().getAnimate()) {
			oRm.class("sapUiVizKitTooltipAnimation");
		}
		oRm.openEnd();
		oRm.close("div");

	};

	return TooltipToolGizmoRenderer;

}, /* bExport= */ true);
