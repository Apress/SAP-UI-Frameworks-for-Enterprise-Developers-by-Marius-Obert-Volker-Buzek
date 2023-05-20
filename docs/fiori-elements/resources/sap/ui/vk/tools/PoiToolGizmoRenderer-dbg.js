/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * PoiToolGizmoRenderer renderer.
	 * @namespace
	 */
	var PoiToolGizmoRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} control
	 *            the control to be rendered
	 */
	PoiToolGizmoRenderer.render = function(rm, control) {
		rm.openStart("div", control);
		rm.openEnd();
		var tool = control._tool;
		var poiButtons = tool && tool.getButtons && tool.getButtons();
		if (poiButtons && poiButtons.length) {
			rm.openStart("div");
			rm.class("sapUiVizKitPoiButtonsContainer");
			rm.openEnd();
			for (var j = 0; j < poiButtons.length; ++j) {
				rm.renderControl(poiButtons[j]);
			}
			rm.close("div");
		}
		rm.close("div");
	};

	return PoiToolGizmoRenderer;

}, /* bExport= */ true);
