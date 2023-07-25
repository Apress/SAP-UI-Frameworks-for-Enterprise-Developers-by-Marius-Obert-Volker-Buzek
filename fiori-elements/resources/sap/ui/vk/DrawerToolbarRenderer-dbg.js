/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * DrawerToolbar renderer.
	 * @namespace
	 */
	var DrawerToolbarRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the DrawerToolbar's HTML, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oDrawerToolbar An object representation of the control that should be rendered
	 */
	DrawerToolbarRenderer.render = function(oRM, oDrawerToolbar) {
		oRM.openStart("div", oDrawerToolbar);
		oRM.class("drawerToolbar");
		if (!oDrawerToolbar.getExpanded()) {
			oRM.class("drawerToolbarCollapsed");
		} else {
			oRM.class("drawerToolbarExpanded");
		}
		oRM.openEnd();
		oRM.renderControl(oDrawerToolbar._container);
		oRM.close("div");
	};

	return DrawerToolbarRenderer;

}, /* bExport= */ true);
