/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * SceneTree renderer.
	 * @namespace
	 * @since 1.32.0
	 */
	var SceneTreeRenderer = {
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
	SceneTreeRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);
		oRm.class("sapUiSizeCompact");
		oRm.class("sapUiVkSceneTree");
		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("treeTable"));
		oRm.close("div");
	};

	return SceneTreeRenderer;

}, /* bExport= */ true);
