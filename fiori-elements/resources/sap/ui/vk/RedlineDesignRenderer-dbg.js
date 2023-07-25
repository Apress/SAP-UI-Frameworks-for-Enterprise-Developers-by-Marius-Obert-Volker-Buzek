/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./RedlineSurfaceRenderer", "sap/ui/core/Renderer"
], function(RedlineSurfaceRenderer, Renderer) {
	"use strict";

	/**
	 * RedlineDesign renderer.
	 * @namespace
	 */
	var RedlineDesignRenderer = Renderer.extend(RedlineSurfaceRenderer);

	RedlineDesignRenderer.apiVersion = 2;

	RedlineDesignRenderer.render = function(rm, control) {
		RedlineSurfaceRenderer.render.call(this, rm, control);
	};

	RedlineDesignRenderer.renderAfterRedlineElements = function(rm, control) {
		if (control._activeElementInstance && control._isDrawingOn) {
			control._activeElementInstance.render(rm);
		}
	};

	return RedlineDesignRenderer;

}, /* bExport = */ true);
