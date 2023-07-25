/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * RedlineToolGizmoRenderer renderer.
	 * @namespace
	 */
	var RedlineToolGizmoRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm    the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} control     the control to be rendered
	 */
	RedlineToolGizmoRenderer.render = function(rm, control) {
		rm.openStart("svg", control);
		rm.class("sapUiVizkitRedlineTool");
		rm.openEnd();

		// SVG style to add a "halo" effect
		var colors = [];
		var parsedColors = [];
		var strokeColors = ["rgba(255,0,0,1)"];  // use 255,0,0,1 as default arrow head color
		var endArrowHeadIds = ["255001"];
		var elements = control.getRedlineElements();
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var haloColor = element.getHaloColor();
			if (!colors.includes(haloColor)) {
				colors.push(haloColor);
				var parsed = element._colorToArray(haloColor);
				parsedColors.push(parsed);
			}
			var strokeColor = element.getStrokeColor();
			var parsedStrokeColor = element._colorToArray(strokeColor).join("");
			if (!endArrowHeadIds.includes(parsedStrokeColor)) {
				endArrowHeadIds.push(parsedStrokeColor);
				strokeColors.push(strokeColor);
			}
		}
		var defaultColor;
		if (control.getParent()._haloColor) {
			defaultColor = control.getParent()._haloColor.replace(/[^\d,.]/g, "").split(",");
		} else {
			defaultColor = [255, 0, 0, 1];
		}
		if (!defaultColor[3]) {
			defaultColor.push(1);
		}
		var defaultColorId = defaultColor.join("");
		rm.openStart("defs");
		rm.openEnd();
		rm.openStart("filter");
		rm.attr("id", "halo" + defaultColorId);
		rm.attr("filterUnits", "userSpaceOnUse");
		rm.openEnd();
		rm.openStart("feGaussianBlur");
		rm.attr("in", "SourceAlpha");
		rm.attr("stdDeviation", "3");
		rm.attr("result", "blur");
		rm.openEnd();
		rm.close("feGaussianBlur");
		rm.openStart("feColorMatrix");
		rm.attr("result", "color");
		rm.attr("type", "matrix");
		rm.attr("values", "0 0 0 0 " + defaultColor[0] / 255 + " 0 0 0 0 " + defaultColor[1] / 255 + " 0 0 0 0 " + defaultColor[2] / 255 + " 0 0 0 " + defaultColor[3] + " 0");
		rm.openEnd();
		rm.close("feColorMatrix");
		rm.openStart("feMerge");
		rm.openEnd();
		rm.openStart("feMergeNode");
		rm.attr("in", "blur");
		rm.openEnd();
		rm.close("feMergeNode");
		rm.openStart("feMergeNode");
		rm.attr("in", "color");
		rm.openEnd();
		rm.close("feMergeNode");
		rm.openStart("feMergeNode");
		rm.attr("in", "SourceGraphic");
		rm.openEnd();
		rm.close("feMergeNode");
		rm.close("feMerge");
		rm.close("filter");
		for (var j = 0; j < parsedColors.length; j++) {
			var rgba = parsedColors[j];
			var id = rgba.join("");
			rm.openStart("filter");
			rm.attr("id", "halo" + id);
			rm.attr("filterUnits", "userSpaceOnUse");
			rm.openEnd();
			rm.openStart("feGaussianBlur");
			rm.attr("in", "SourceAlpha");
			rm.attr("stdDeviation", "3");
			rm.attr("result", "blur");
			rm.openEnd();
			rm.close("feGaussianBlur");
			rm.openStart("feColorMatrix");
			rm.attr("result", "color");
			rm.attr("type", "matrix");
			rm.attr("values", "0 0 0 0 " + rgba[0] / 255 + " 0 0 0 0 " + rgba[1] / 255 + " 0 0 0 0 " + rgba[2] / 255 + " 0 0 0 " + rgba[3] + " 0");
			rm.openEnd();
			rm.close("feColorMatrix");
			rm.openStart("feMerge");
			rm.openEnd();
			rm.openStart("feMergeNode");
			rm.attr("in", "blur");
			rm.openEnd();
			rm.close("feMergeNode");
			rm.openStart("feMergeNode");
			rm.attr("in", "color");
			rm.openEnd();
			rm.close("feMergeNode");
			rm.openStart("feMergeNode");
			rm.attr("in", "SourceGraphic");
			rm.openEnd();
			rm.close("feMergeNode");
			rm.close("feMerge");
			rm.close("filter");
		}
		for (var k = 0; k < endArrowHeadIds.length; k++) {
			rm.openStart("marker");
			rm.attr("id", "endArrowHead" + endArrowHeadIds[k]);
			rm.attr("markerWidth", "10");
			rm.attr("markerHeight", "7");
			rm.attr("refX", "0");
			rm.attr("refY", "3.5");
			rm.attr("orient", "auto");
			rm.openEnd();
			rm.openStart("polygon");
			rm.attr("points", "0 0, 10 3.5, 0 7");
			rm.attr("fill", strokeColors[k]);
			rm.openEnd();
			rm.close("polygon");
			rm.close("marker");
		}
		rm.close("defs");

		elements.forEach(function(element) {
			if (!element.getSuppress()) {
				element.render(rm);
			}
		});

		if (control._activeElement) {
			control._activeElement.render(rm);
		}

		rm.close("svg");
	};

	return RedlineToolGizmoRenderer;

}, /* bExport= */ true);
