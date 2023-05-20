/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * CreateTextToolToolGizmo renderer.
	 * @namespace
	 */
	var CreateTextToolToolGizmoRenderer = {
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
	CreateTextToolToolGizmoRenderer.render = function(rm, control) {
		// an empty div to which the edit dialog will be attached
		rm.openStart("div", control);
		rm.style("position", "absolute");
		rm.style("pointer-events", "none");
		rm.openEnd();
		rm.close("div");
	};

	return CreateTextToolToolGizmoRenderer;

}, /* bExport= */ true);
