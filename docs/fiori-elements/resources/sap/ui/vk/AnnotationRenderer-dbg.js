/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Annotation renderer.
	 * @namespace
	 */
	var AnnotationRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm
	 *            the RenderManager that can be used for writing to
	 *            the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl
	 *            the control to be rendered
	 */
	AnnotationRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);
		var style = oControl.getEditable() && oControl.getSelected() ? "Editing" : oControl.getStyle();
		oRm.class("sapUiVizKitAnnotation" + style);
		if (oControl._reverse === true) {
			oRm.class("sapUiVizKitAnnotationReverse");
		}
		oRm.openEnd();

		for (var i = 0; i < 8; i++) {
			oRm.openStart("div");
			oRm.class("sapUiVizKitAnnotationElement" + i);
			oRm.openEnd();
			oRm.close("div");
		}

		oRm.openStart("div");
		oRm.class("sapUiVizKitAnnotationNode" + style);
		oRm.openEnd();
		oRm.close("div");

		oRm.openStart("div");
		oRm.class("sapUiVizKitAnnotationLeader" + style);
		oRm.openEnd();
		oRm.close("div");

		oRm.openStart("svg");
		oRm.attr("xmlns", "http://www.w3.org/2000/svg");
		oRm.class("sapUiVizKitAnnotationSVG" + style);
		oRm.openEnd();
		oRm.openStart("path");
		oRm.openEnd();
		oRm.close("path");
		oRm.close("svg");

		if (oControl._textDiv) {
			oRm.renderControl(oControl._textDiv);
		}

		oRm.close("div");
	};

	return AnnotationRenderer;

}, /* bExport= */ true);
