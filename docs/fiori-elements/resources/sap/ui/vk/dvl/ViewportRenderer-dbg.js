/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Viewport renderer.
	 * @namespace
	 */
	var ViewportRenderer = {
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
	ViewportRenderer.render = function(rm, control) {

		rm.openStart("div", control);
		rm.class("sapVizKitViewport");
		rm.attr("tabindex", 0);
		rm.attr("aria-label", "Image");
		rm.attr("role", "figure");

		var width = control.getWidth();
		if (width) {
			rm.style("width", width);
		}
		var height = control.getHeight();
		if (height) {
			rm.style("height", height);
		}

		rm.openEnd();

		control.renderTools(rm);
		control.renderContent(rm);

		rm.close("div");

	};

	return ViewportRenderer;

}, /* bExport= */ true);
