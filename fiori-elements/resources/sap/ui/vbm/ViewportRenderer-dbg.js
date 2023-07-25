/*!
* SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
*/

sap.ui.define(function() {
	"use strict";

	/**
	* Viewport renderer.
	* @namespace
	*/
	var ViewportRenderer = {
		apiVersion: 2		// Semantic Rendering
	};

	ViewportRenderer.render = function(rm, control) {
	    rm.openStart("div", control);
		rm.attr("tabindex", 0);
		rm.attr("role", "figure");
		rm.style("width", control.getWidth())
		rm.style("height", control.getHeight());
		rm.class("sapUiVbmViewport");
		rm.openEnd();
		rm.close("div");
	};

	return ViewportRenderer;

}, true);
