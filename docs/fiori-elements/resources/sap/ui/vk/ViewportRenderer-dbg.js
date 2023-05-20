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
	 * @since 1.32.0
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
		if (control._implementation) {
			rm.attr("tabindex", -1);
		} else {
			rm.attr("tabindex", 0);

			// Avoid duplication as these attributes will be also added by the implementation viewport
			rm.attr("aria-label", "Image");
			rm.attr("role", "figure");
		}
		var width = control.getWidth();
		if (width) {
			rm.style("width", width);
		}
		var height = control.getHeight();
		if (height) {
			rm.style("height", height);
		}
		rm.openEnd();
		if (control._implementation) {
			rm.renderControl(control._implementation);
		} else if (control.getContent()) {
			var aContent = control.getContent();
			for (var i = 0, l = aContent.length; i < l; i++) {
				rm.renderControl(aContent[i]);
			}
		}
		rm.close("div");
	};

	return ViewportRenderer;

}, /* bExport= */ true);
