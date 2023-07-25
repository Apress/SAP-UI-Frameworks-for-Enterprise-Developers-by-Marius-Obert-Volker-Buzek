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
	var NativeViewportRenderer = {
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
	NativeViewportRenderer.render = function(rm, control) {
		rm.openStart("div", control);
		rm.class("sapVizKitNativeViewport");
		rm.attr("tabindex", 0);
		rm.style("background-image", "linear-gradient(" + control.getBackgroundColorTop() + "," + control.getBackgroundColorBottom() + ")");
		rm.openEnd();
		control.renderTools(rm);
		control.renderContent(rm);
		rm.close("div");
	};

	return NativeViewportRenderer;

}, /* bExport= */ true);
