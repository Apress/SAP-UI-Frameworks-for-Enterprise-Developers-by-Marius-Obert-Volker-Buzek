/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * RedlineSurface renderer.
	 * @namespace
	 */
	var RedlineSurfaceRenderer = {
		apiVersion: 2
	};

	RedlineSurfaceRenderer.render = function(rm, control) {
		rm.openStart("svg", control);
		rm.class("sapUiVizkitRedlineSurface");
		rm.openEnd();

		// SVG style to add a "halo" effect
		rm.openStart("defs");
		rm.openEnd();
		rm.openStart("filter");
		rm.attr("id", "halo");
		rm.attr("filterUnits", "userSpaceOnUse");
		rm.openEnd();
		rm.openStart("feGaussianBlur");
		rm.attr("in", "SourceAlpha");
		rm.attr("stdDeviation", "4");
		rm.attr("result", "blur");
		rm.openEnd();
		rm.close("feGaussianBlur");
		rm.openStart("feMerge");
		rm.openEnd();
		rm.openStart("feMergeNode");
		rm.attr("in", "blur");
		rm.openEnd();
		rm.close("feMergeNode");
		rm.openStart("feMergeNode");
		rm.attr("in", "SourceGraphic");
		rm.openEnd();
		rm.close("feMergeNode");
		rm.close("feMerge");
		rm.close("filter");
		rm.close("defs");

		control.getRedlineElements().forEach(function(redlineElement) {
			redlineElement.render(rm);
		});

		this.renderAfterRedlineElements(rm, control);

		rm.close("svg");
	};

	RedlineSurfaceRenderer.renderAfterRedlineElements = function(rm, control) {

	};

	return RedlineSurfaceRenderer;

}, /* bExport = */ true);
