/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * View Gallery renderer.
	 * @namespace
	 * @since 1.62.0
	 */
	var ViewGalleryRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm	RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} control		Control to be rendered
	 */
	ViewGalleryRenderer.render = function(rm, control) {
		rm.openStart("div", control);
		rm.openEnd();
		rm.renderControl(control.getAggregation("animationTimeSlider"));
		rm.renderControl(control.getAggregation("toolbar"));
		rm.renderControl(control.getAggregation("container"));
		rm.close("div");
	};

	return ViewGalleryRenderer;

}, /* bExport= */ true);
