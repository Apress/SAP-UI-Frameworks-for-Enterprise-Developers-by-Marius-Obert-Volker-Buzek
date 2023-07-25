/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(["./library", "sap/ui/Device"],
	function(library, Device) {
		"use strict";

		/**
		 * ViewGalleryThumbnail renderer.
		 * @namespace
		 */
		var ViewGalleryThumbnailRenderer = {
			apiVersion: 2
		};

		ViewGalleryThumbnailRenderer.render = function(oRM, oItem) {
			oRM.openStart("div", oItem);
			oRM.style("height", oItem.getThumbnailHeight());
			oRM.style("width", oItem.getThumbnailWidth());
			oRM.style("background-image", "url(" + oItem.getSource() + ")");
			oRM.class("sapVizKitViewGalleryThumbnail");
			oRM.attr("tabindex", 0);
			var toolTip = oItem.getTooltip();
			if (toolTip) {
				oRM.attr("title", toolTip);
			}
			oRM.openEnd();
			var index = oItem._getIndex() + 1;
			if (index > 0) {
				oRM.openStart("div");
				oRM.class("sapVizKitViewGalleryStepNumberText");
				oRM.openEnd();
				oRM.text(index.toString());
				oRM.close("div");
			}
			oRM.close("div");
		};

		return ViewGalleryThumbnailRenderer;

	}, /* bExport= */ true);
