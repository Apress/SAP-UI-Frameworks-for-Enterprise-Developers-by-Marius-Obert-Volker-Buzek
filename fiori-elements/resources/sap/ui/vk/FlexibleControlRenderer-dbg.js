/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides default renderer for control sap.ui.vk.FlexibleControl
sap.ui.define([
], function() {
	"use strict";


	/**
	 * vk/FlexibleControl renderer.
	 * @namespace
	 */
	var FlexibleControlRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oFlexibleControl An object representation of the control that should be rendered
	 */
	FlexibleControlRenderer.render = function(oRenderManager, oFlexibleControl) {
		// convenience variable
		var rm = oRenderManager;
		rm.openStart("div", oFlexibleControl);
		rm.class("sapUiFlexControl");
		if (oFlexibleControl.getWidth() && oFlexibleControl.getWidth() != "") {
			rm.style("width", oFlexibleControl.getWidth());
		}
		if (oFlexibleControl.getHeight() && oFlexibleControl.getHeight() != "") {
			rm.style("height", oFlexibleControl.getHeight());
		}
		rm.openEnd();
		var aContent = oFlexibleControl.getContent();
		var layout = oFlexibleControl.getLayout();

		var cellClass = "sapUiFlexCellStacked";

		if (layout == "Vertical") {
			cellClass = "sapUiFlexCellVertical";
		}

		for (var i = 0; i < aContent.length; i++) {
			var content = aContent[i];

			rm.openStart("div");
			rm.attr("id", oFlexibleControl.getId() + "Content_" + i);
			rm.class(cellClass);

			var layoutData = content.getLayoutData();
			if (layoutData && layout != "Stacked") {
				if (layoutData.getSize() && layoutData.getSize() != "") {
					rm.style("height", layoutData.getSize());
				}
				if (layoutData.getMinSize() && layoutData.getMinSize() != "") {
					rm.style("min-height", layoutData.getMinSize());
				}
				if (layoutData.getMarginTop() && layoutData.getMarginTop() != "") {
					rm.style("margin-top", layoutData.getMarginTop());
				}
				if (layoutData.getMarginBottom() && layoutData.getMarginBottom() != "") {
					rm.style("margin-bottom", layoutData.getMarginBottom());
				}
			}

			rm.openEnd();
			rm.renderControl(content);
			rm.close("div");
		}
		rm.close("div");
	};

	return FlexibleControlRenderer;

}, /* bExport= */ true);
