/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Overlay renderer.
	 * @namespace
	 * @static
	 * @since 1.32.0
	 */
	var OverlayRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	OverlayRenderer.render = function(oRm, oControl) {
		// console.log( "sap.ui.vk.OverlayRenderer.render.....\r\n");

		// write the HTML into the render manager
		oRm.openStart("div", oControl);
		oRm.class("sapUiVkOverlay");
		oRm.openEnd();
		oRm.close("div");

		// update bound data......................................................//
		var oApp;
		if ((oApp = oControl._update())) {
			oControl._load(oApp);
		}
	};

	return OverlayRenderer;

}, /* bExport= */true);
