/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./Element",
	"../abgrToColor"
], function(
	Element,
	abgrToColor
) {
	"use strict";

	/**
	 * Viewport renderer.
	 * @namespace
	 */
	var ViewportRenderer = {
		apiVersion: 2
	};

	ViewportRenderer.render = function(rm, viewport) {
		rm.openStart("div", viewport);
		rm.class("sapVizKitViewport");
		rm.attr("tabindex", 0);
		rm.attr("aria-label", "Image");
		rm.attr("role", "figure");
		rm.style("width", viewport.getWidth());
		rm.style("height", viewport.getHeight());
		rm.style("background-image", "linear-gradient(" + viewport.getBackgroundColorTop() + "," + viewport.getBackgroundColorBottom() + ")");
		rm.openEnd();

		rm.openStart("canvas");
		rm.style("display", "none");
		rm.style("position", "absolute");
		rm.openEnd();
		rm.close("canvas");

		rm.openStart("svg");
		rm.attr("id", viewport.getId() + "-svg");
		rm.attr("width", "100%");
		rm.attr("height", "100%");
		rm.attr("viewBox", viewport._getViewBox().join(" "));
		rm.style("position", "absolute");
		rm.openEnd();

		var scene = viewport.getScene();
		if (scene) {
			var vsm = viewport._getViewStateManagerSVG();
			var hotspotEffects = new Map();
			var highlightColor = abgrToColor(vsm._highlightColorABGR);
			var hotspotColor = abgrToColor(viewport.getHotspotColorABGR());
			hotspotEffects.set(Element._hotspotEffectName(highlightColor), highlightColor);
			hotspotEffects.set(Element._hotspotEffectName(hotspotColor), hotspotColor);

			// Collect hotspot colors
			var tintColorDef = viewport.getShowAllHotspotsTintColorDef();
			hotspotEffects.set(tintColorDef.name, tintColorDef.color);

			var nodeHierarchy = scene.getDefaultNodeHierarchy();
			nodeHierarchy.getHotspotNodeIds().forEach(function(hotspot) {
				var def = hotspot.getHotspotEffectDef();
				hotspotEffects.set(def.name, def.color);
			});

			hotspotEffects.forEach(function(color, name) {
				rm.openStart("filter");
				rm.attr("id", name);
				rm.openEnd();
				rm.openStart("feColorMatrix");
				rm.attr("in", "SourceGraphic");
				rm.attr("type", "matrix");
				rm.attr("values", "0 0 0 0 " + (color.red / 255) + ", 0 0 0 0 " + (color.green / 255) + ", 0 0 0 0 " + (color.blue / 255) + ", 0 0 0 " + color.alpha + " 0");
				rm.openEnd();
				rm.close("feColorMatrix");
				rm.close("filter");
			});

			scene.getRootElement().render(rm, vsm ? vsm._mask : (-1 | 0), viewport);
		}

		viewport._selectionRect.render(rm, 0 | 0); // hidden rectangle for rectangular selection

		if (viewport._styles.size > 0) {
			rm.openStart("defs");
			rm.openEnd();
			rm.openStart("style");
			rm.openEnd();
			viewport._styles.forEach(function(attributes, id) {
				rm.text("." + id + "{\n");
				for (var i = 0; i < attributes.length; i += 2) {
					rm.text(attributes[i] + ":" + attributes[i + 1] + ";\n");
				}
				rm.text("}\n");
			});
			rm.close("style");
			rm.close("defs");
		}

		rm.close("svg");

		viewport.renderTools(rm);
		viewport.renderContent(rm);

		rm.close("div");
	};

	return ViewportRenderer;

}, /* bExport = */ true);
