/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Notifications renderer.
	 * @namespace
	 */
	var NotificationsRenderer = {
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
	NotificationsRenderer.render = function(rm, control) {
		rm.openStart("div", control);
		rm.class("sapVizKitNotifications");
		rm.openEnd();
		rm.renderControl(control.getAggregation("_messagePopoverToggleButton"));
		rm.close("div");
	};

	return NotificationsRenderer;

}, /* bExport = */ true);
