/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Toolbar renderer.
	 * @namespace
	 * @since 1.32.0
	 */
	var ToolbarRenderer = {
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
	ToolbarRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);
		oRm.class("sapVizKitToolbar");
		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("_toolbar"));
		oRm.close("div");
	};

	return ToolbarRenderer;

}, /* bExport= */ true);
