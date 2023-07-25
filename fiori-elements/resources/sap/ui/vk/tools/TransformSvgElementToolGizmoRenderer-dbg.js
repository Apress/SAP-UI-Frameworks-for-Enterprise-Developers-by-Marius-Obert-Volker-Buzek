/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * TransformSvgElementToolGizmo renderer.
	 * @namespace
	 */
	var TransformSvgElementToolGizmoRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} control
	 *            the control to be rendered
	 */
	TransformSvgElementToolGizmoRenderer.render = function(rm, control) {
		if (!control._viewport) {
			return;
		}

		var viewBox = control._viewport._getViewBox();
		rm.openStart("svg", control);
		rm.attr("xmlns", "http://www.w3.org/2000/svg");
		rm.attr("width", "100%");
		rm.attr("height", "100%");
		rm.attr("viewBox", viewBox.join(" "));
		rm.style("position", "absolute");
		rm.style("pointer-events", "none");
		rm.openEnd();

		rm.openStart("defs");
		rm.openEnd();
		rm.openStart("filter");
		rm.attr("id", "shadow-effect");
		rm.openEnd();
		rm.openStart("feDropShadow");
		rm.attr("dx", "0");
		rm.attr("dy", "0");
		rm.attr("stdDeviation", "2");
		rm.attr("flood-color", "#000");
		rm.openEnd();
		rm.close("feDropShadow");
		rm.close("filter");
		rm.close("defs");

		var scale = 1 / control._viewport._camera.zoom;
		// renders scaling handle
		function addTouchRect(x, y, sx, sy) {
			rm.openStart("rect");
			rm.attr("fill", "#fff");
			rm.attr("stroke", "#000");
			rm.attr("stroke-width", 1);
			rm.attr("vector-effect", "non-scaling-stroke");
			rm.attr("filter", "url(#shadow-effect)");

			var w = Math.abs(8 * sx);
			var h = Math.abs(8 * sy);
			rm.attr("x", x - w * 0.5);
			rm.attr("y", y - h * 0.5);
			rm.attr("width", w);
			rm.attr("height", h);
			rm.openEnd();
			rm.close("rect");
		}

		control._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			var bbox = nodeInfo.bbox;
			if (bbox) {
				var matrix = node._matrixWorld();
				var handlePositions = control._getHandleLocalPositions(nodeInfo, matrix);
				var sx = scale * nodeInfo.xSign * nodeInfo.ySign / Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]);
				var sy = scale * nodeInfo.ySign / Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]);

				rm.openStart("g");
				rm.attr("transform", "matrix(" + matrix.join(",") + ")");
				rm.openEnd();

				// white bounding rectangle
				rm.openStart("rect");
				rm.attr("fill", "none");
				rm.attr("stroke", "#fff");
				rm.attr("vector-effect", "non-scaling-stroke");
				rm.attr("x", bbox.x);
				rm.attr("y", bbox.y);
				rm.attr("width", bbox.width);
				rm.attr("height", bbox.height);
				rm.openEnd();
				rm.close("rect");

				// black dotted bounding rectangle
				rm.openStart("rect");
				rm.attr("fill", "none");
				rm.attr("stroke", "#000");
				rm.attr("stroke-dasharray", "5 5");
				rm.attr("vector-effect", "non-scaling-stroke");
				rm.attr("x", bbox.x);
				rm.attr("y", bbox.y);
				rm.attr("width", bbox.width);
				rm.attr("height", bbox.height);
				rm.openEnd();
				rm.close("rect");

				// white line to rotation handle
				rm.openStart("line");
				rm.attr("stroke", "#fff");
				rm.attr("vector-effect", "non-scaling-stroke");
				rm.attr("x1", handlePositions[0]);
				rm.attr("y1", handlePositions[1]);
				rm.attr("x2", handlePositions[16]);
				rm.attr("y2", handlePositions[17]);
				rm.openEnd();
				rm.close("line");

				// black dotted line to rotation handle
				rm.openStart("line");
				rm.attr("stroke", "#000");
				rm.attr("stroke-dasharray", "5 5");
				rm.attr("vector-effect", "non-scaling-stroke");
				rm.attr("x1", handlePositions[0]);
				rm.attr("y1", handlePositions[1]);
				rm.attr("x2", handlePositions[16]);
				rm.attr("y2", handlePositions[17]);
				rm.openEnd();
				rm.close("line");

				// rotation handle (circle and rotation icon)
				rm.openStart("g");
				rm.attr("transform", "matrix(" + sx + ",0,0," + sy + "," + (handlePositions[16] - 8 * sx) + "," + (handlePositions[17] - 8 * sy) + ")");
				rm.openEnd();
				rm.openStart("circle");
				rm.attr("fill", "#fff");
				rm.attr("stroke", "#000");
				rm.attr("cx", "8");
				rm.attr("cy", "8");
				rm.attr("r", "7.5");
				rm.openEnd();
				rm.close("circle");
				rm.openStart("path");
				rm.attr("fill", "#000");
				rm.attr("d", "M8,12.94A4.84,4.84,0,1,1,8,3.27h2.84v1H8a3.84,3.84,0,1,0,3.84,3.84h1A4.84,4.84,0,0,1,8,12.94Z");
				rm.openEnd();
				rm.close("path");
				rm.openStart("path");
				rm.attr("fill", "#000");
				rm.attr("d", "M9.89,5.59a.5.5,0,0,1-.34-.88l1.09-1L9.56,2.83a.51.51,0,0,1-.05-.71.49.49,0,0,1,.7-.05l1.51,1.31a.48.48,0,0,1,.17.37.49.49,0,0,1-.16.38L10.22,5.46A.5.5,0,0,1,9.89,5.59Z");
				rm.openEnd();
				rm.close("path");
				rm.openStart("circle");
				rm.attr("fill", "#000");
				rm.attr("cx", "8");
				rm.attr("cy", "8");
				rm.attr("r", "0.83");
				rm.openEnd();
				rm.close("circle");
				rm.close("g");

				// scaling handles (rectangles)
				for (var i = 0; i < 8; i++) {
					addTouchRect(handlePositions[i * 2], handlePositions[i * 2 + 1], sx, sy);
				}

				rm.close("g");
			}
		});

		rm.close("svg");
	};

	return TransformSvgElementToolGizmoRenderer;

}, /* bExport= */ true);
