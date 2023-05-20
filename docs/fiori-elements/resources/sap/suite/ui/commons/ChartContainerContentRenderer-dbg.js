/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class ChartContainerContent renderer.
	 * @static
	 */
	var ChartContainerContentRenderer = {
		apiVersion: 2    // enable semantic rendering
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ChartContainerContentRenderer.render = function(oRm, oControl) {
		oRm.renderControl(oControl.getContent());
	};

	return ChartContainerContentRenderer;
}, /* bExport= */ true);
