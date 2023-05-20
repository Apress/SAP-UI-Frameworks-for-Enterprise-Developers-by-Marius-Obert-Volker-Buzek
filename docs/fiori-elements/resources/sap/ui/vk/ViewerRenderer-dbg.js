/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Viewer renderer.
	 * @namespace
	 * @since 1.32.0
	 */
	var ViewerRenderer = {
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
	ViewerRenderer.render = function(rm, control) {
		rm.openStart("div", control);
		rm.class("sapVizKitViewer");
		if (control.getWidth()) {
			rm.style("width", control.getWidth());
		}
		if (control.getHeight()) {
			rm.style("height", control.getHeight());
		}
		rm.openEnd();
		rm.renderControl(control._layout);
		rm.renderControl(control._progressIndicator);
		rm.close("div");
	};

	return ViewerRenderer;

}, /* bExport= */ true);
