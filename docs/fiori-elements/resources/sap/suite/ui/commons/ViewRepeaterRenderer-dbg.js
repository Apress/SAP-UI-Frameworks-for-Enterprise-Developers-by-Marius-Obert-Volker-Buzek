/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([ 'sap/ui/commons/RowRepeaterRenderer', 'sap/ui/commons/library', 'sap/ui/core/Renderer' ],
	function(RowRepeaterRenderer, CommonsLibrary, Renderer) {
	"use strict";

	/**
	 * @class RowRepeater renderer.
	 * @static
	 */
	var ViewRepeaterRenderer = Renderer.extend(RowRepeaterRenderer);

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ViewRepeaterRenderer.render = function(oRm, oControl) {
		// escape directly if control is not visible
		if (!oControl.getVisible()) {
			return;
		}
		var sTooltip = oControl.getTooltip_AsString();
		// opening root DIV
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		// add design CSS class: sapUiRrDesignStandard/sapUiRrDesignTransparent/sapUiRrDesignBareShell
		oRm.addClass("sapUiRrDesign" + oControl.getDesign());
		if (oControl.getResponsive() && oControl.getShowMoreSteps() == 0) {
			oRm.addClass("suiteUiVrResp");
		}
		oRm.writeClasses();
		if (oControl.getResponsive() && oControl.getShowMoreSteps() == 0) {
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();
		}
		oRm.write(">");
		// render the row repeater header (not in BARESHELL design)
		if (oControl.getDesign() !== CommonsLibrary.RowRepeaterDesign.BareShell) {
			this.renderHeader(oRm, oControl);
		}
		if (oControl.getExternal() !== true) {
			// render the row repeater body
			this.renderBody(oRm, oControl);

			// render the row repeater footer (not in BARESHELL design)
			if (oControl.getDesign() !== CommonsLibrary.RowRepeaterDesign.BareShell) {
				this.renderFooter(oRm, oControl);
			}
		} else {
			oRm.renderControl(sap.ui.getCore().byId(oControl.getAssociation("externalRepresentation")));
		}

		// closing root DIV
		oRm.write("</div>");
	};

	ViewRepeaterRenderer.renderHeader = function(oRenderManager, oControl) {
		this.renderViewSwitcher(oRenderManager, oControl);
		if (oControl.getExternal() !== true) {
			RowRepeaterRenderer.renderHeader.call(this, oRenderManager, oControl);
		}
	};

	ViewRepeaterRenderer.renderFooter = function(oRenderManager, oControl) {
		if (oControl.getExternal() !== true) {
			RowRepeaterRenderer.renderFooter.call(this, oRenderManager, oControl);
		}
	};

	ViewRepeaterRenderer.renderViewSwitcher = function(oRenderManager, oControl) {
		if (oControl.getShowViews() || oControl.getShowSearchField()) {
			oRenderManager.write("<div");
			oRenderManager.addClass("suiteUiVrViewSwHolder");
			oRenderManager.writeClasses();
			oRenderManager.write(">");

			if (oControl.getShowViews()) {
				// opening view switcher DIV
				oRenderManager.write("<div");
				oRenderManager.addClass("suiteUiVrViewSw");
				oRenderManager.writeClasses();
				oRenderManager.write(">");
				oRenderManager.renderControl(oControl._oSegBtn);
				// closing view switcher DIV
				oRenderManager.write("</div>");
			}

			if (oControl.getShowSearchField()) {
				// opening view switcher DIV
				oRenderManager.write("<div");
				oRenderManager.addClass("suiteUiVrSearchFld");
				oRenderManager.writeClasses();
				oRenderManager.write(">");
				oRenderManager.renderControl(oControl._oSearchField);
				// closing view switcher DIV
				oRenderManager.write("</div>");
			}
			oRenderManager.write("</div>");
		}
		oRenderManager.write("<div ");
		oRenderManager.addStyle("clear", "both");
		oRenderManager.writeStyles();
		oRenderManager.write("></div>")
	};

	return ViewRepeaterRenderer;
}, /* bExport= */ true);