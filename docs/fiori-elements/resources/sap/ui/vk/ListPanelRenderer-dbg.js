/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(function() {
	"use strict";

	/*
	 * @class ListPanel renderer. @static
	 */
	var ListPanelRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListPanelRenderer.render = function(oRm, oControl) {
		// just render the internal Panel. The purpose is to only provide more specific properties.
		var oPanel = oControl._oPanel;
		oPanel.addStyleClass("sapUiVkListPanel");

		oRm.openStart("div", oControl);
		oRm.attr("role", sap.ui.core.AccessibleRole.Presentation);
		oRm.openEnd();
		oRm.renderControl(oPanel);
		oRm.close("div");

	};

	return ListPanelRenderer;

}, /* bExport= */true);
