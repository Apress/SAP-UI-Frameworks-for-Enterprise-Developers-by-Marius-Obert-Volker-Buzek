/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
// Provides default renderer for control sap.ui.richtexteditor.RichTextEditor
sap.ui.define(['sap/ui/core/Core'],
	function(Core) {
	"use strict";


	/**
	 * RichTextEditorRenderer
	 * @namespace
	 * @author Malte Wedel, Andreas Kunz
	 */
	var RichTextEditorRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.richtexteditor.RichTextEditor}
	 *            oRichTextEditor The RichTextEditor control that should be rendered.
	 */
	RichTextEditorRenderer.render = function(rm, oRichTextEditor) {
		var oToolbarWrapper = oRichTextEditor.getAggregation("_toolbarWrapper");
		var bCustomToolbar = oToolbarWrapper && oRichTextEditor._bCustomToolbarRequirementsFullfiled;
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.richtexteditor");
		var aPlugins = oRichTextEditor.getPlugins();
		var bAutoresize = false;

		rm.openStart("div", oRichTextEditor);
		rm.class("sapUiRTE");
		if (oRichTextEditor.getRequired()) {
			rm.class("sapUiRTEReq");
		}
		if (oRichTextEditor.getUseLegacyTheme()) {
			rm.class("sapUiRTELegacyTheme");
		}
		if (bCustomToolbar) {
			rm.class("sapUiRTEWithCustomToolbar");
		}

		rm.style("width", oRichTextEditor.getWidth());

		bAutoresize = aPlugins.some(function(oPlugin) {
			return oPlugin.name === "autoresize";
		});

		if (oRichTextEditor.getHeight() && !bAutoresize) {
			rm.style("height", oRichTextEditor.getHeight());
		}

		if (oRichTextEditor.getTooltip_AsString()) { // ensure not to render null
			rm.attr("title", oRichTextEditor.getTooltip_AsString());
		}

		// Prevents rendering of aria-labelledby attribute to the wrapper as it is added on the TinyMCE's iFrame.
		// Adds aria-label attribute to name the RTE region
		rm.accessibilityState(oRichTextEditor, {
			role: "region",
			label: oResourceBundle.getText("RTE_ARIA_LABEL"),
			labelledby: null
		});

		rm.openEnd();

		if (bCustomToolbar) {
			rm.renderControl(oToolbarWrapper);
		}

		// Call specialized renderer method if it exists
		var sRenderMethodName = "render" + oRichTextEditor.getEditorType() + "Editor";
		if (this[sRenderMethodName] && typeof this[sRenderMethodName] === "function") {
			this[sRenderMethodName].call(this, rm, oRichTextEditor);
		}

		rm.close("div");
	};

	return RichTextEditorRenderer;

}, /* bExport= */ true);