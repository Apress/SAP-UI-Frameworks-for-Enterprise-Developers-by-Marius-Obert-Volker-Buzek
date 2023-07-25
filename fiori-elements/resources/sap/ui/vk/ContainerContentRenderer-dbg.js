/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(function() {
	"use strict";

	/*
	 * @class ContainerContent renderer. @static
	 */
	var ContainerContentRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ContainerContentRenderer.render = function(oRm, oControl) {
		// just render the embedded control as it is. The purpose is to only provide extra properties.
		oRm.renderControl(oControl.getContent());
	};

	return ContainerContentRenderer;

}, /* bExport= */true);
