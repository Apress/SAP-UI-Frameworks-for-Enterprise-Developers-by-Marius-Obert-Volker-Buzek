/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Step Navigation renderer.
	 * @namespace
	 * @since 1.32.0
	 */
	var StepNavigationRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 * the RenderManager that can be used for writing to
	 * the Render-Output-Buffer
	 * @param {sap.ui.core.Control} control
	 * the control to be rendered
	 */
	StepNavigationRenderer.render = function(rm, control) {
		// return immediately if control is invisible
		if (!control.getVisible()) {
			return;
		}

		if (control.getShowToolbar() || control.getShowThumbnails) {
			var oWidth = control.getWidth() !== "auto" ? control.getWidth() : "100%";
			var oHeight = control.getHeight() !== "auto" ? control.getHeight() : "auto";

			rm.openStart("div", control);
			rm.style("width", oWidth);
			rm.style("height", oHeight);
			rm.class("sapVizKitStepNavigation");

			var sTooltip = control.getTooltip_AsString();
			if (sTooltip) {
				rm.attr("title", sTooltip);
			}

			if (!control.getVisible()) {
				rm.style("visibility", "hidden");
			}

			rm.openEnd();
			rm.renderControl(control.getAggregation("layout"));
			if (control.getShowThumbnails()) {
				StepNavigationRenderer._renderScrollerDiv(rm, control);
			}
			rm.close("div");
		}

	};

	StepNavigationRenderer._renderScrollerDiv = function(rm, control) {
		rm.renderControl(control.getAggregation("thumbnailsContainer"));
	};

	return StepNavigationRenderer;

}, /* bExport= */ true);
