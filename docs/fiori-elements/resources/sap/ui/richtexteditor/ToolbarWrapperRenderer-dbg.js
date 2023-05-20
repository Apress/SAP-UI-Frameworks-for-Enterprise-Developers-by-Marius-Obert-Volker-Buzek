/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
// Provides default renderer for control sap.ui.richtexteditor.ToolbarWrapper
sap.ui.define([],
	function()	{
		"use strict";


		/**
		 * RichTextEditor's ToolbarRenderer
		 * @namespace
		 */
		var ToolbarRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer.
		 * @param {sap.ui.richtexteditor.ToolbarWrapper} oToolbarWrapper The Toolbar control that should be rendered.
		 */
		ToolbarRenderer.render = function (oRM, oToolbarWrapper) {
			oRM.renderControl(oToolbarWrapper.getAggregation("_toolbar"));
		};

		return ToolbarRenderer;

	}, /* bExport= */ true);