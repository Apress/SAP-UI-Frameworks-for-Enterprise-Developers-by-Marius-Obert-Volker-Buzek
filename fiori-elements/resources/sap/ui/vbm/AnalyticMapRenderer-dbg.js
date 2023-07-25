/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define([
	"./GeoMapRenderer"
], function(GeoMapRenderer) {
	"use strict";

	/**
	 * @class MapRenderer renderer.
	 * @static
	 */
	var AnalyticMapRenderer = {
		apiVersion: 2			// Semantic Rendering
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	AnalyticMapRenderer.render = function(oRm, oControl) {
		oControl.addStyleClass("sapUiVbmAnalyticMap");
		GeoMapRenderer.render(oRm, oControl);
	};

	return AnalyticMapRenderer;

}, /* bExport= */true);
