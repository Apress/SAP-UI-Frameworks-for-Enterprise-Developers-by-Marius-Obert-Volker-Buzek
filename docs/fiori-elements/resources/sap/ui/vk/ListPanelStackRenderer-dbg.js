/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define(function() {
	"use strict";

	/*
	 * @class Legend renderer. @static
	 */
	var ListPanelStackRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListPanelStackRenderer.render = function(oRm, oControl) {
		oControl._oLayout.addStyleClass("sapUiVkListPanelStack");
		// render the internal Panel.
		oRm.renderControl(oControl._oLayout);
	};

	return ListPanelStackRenderer;

}, /* bExport= */true);
