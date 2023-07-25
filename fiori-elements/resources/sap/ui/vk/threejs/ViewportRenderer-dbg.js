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
	 */
	var ViewportRenderer = {
		apiVersion: 2
	};

	ViewportRenderer.render = function(rm, control) {
		rm.openStart("div", control);
		rm.class("sapVizKitViewport");
		rm.attr("tabindex", 0);
		rm.attr("aria-label", "Image");
		rm.attr("role", "figure");
		rm.style("width", control.getWidth());
		rm.style("height", control.getHeight());
		rm.openEnd();

		// Render Safe Area
		if (control.getSafeArea()) {
			rm.renderControl(control.getSafeArea());
		}
		control.renderTools(rm);
		control.renderContent(rm);

		// Render annotations
		var oAnnotations = control.getAnnotations();
		if (oAnnotations && oAnnotations.length > 0) {
			rm.openStart("div");
			rm.class("sapUiVizKitAnnotationContainer");
			rm.openEnd();
			oAnnotations.forEach(function(oAnnotation) {
				rm.renderControl(oAnnotation);
			});
			rm.close("div");
		}

		rm.close("div");
	};

	return ViewportRenderer;

}, /* bExport = */ true);
