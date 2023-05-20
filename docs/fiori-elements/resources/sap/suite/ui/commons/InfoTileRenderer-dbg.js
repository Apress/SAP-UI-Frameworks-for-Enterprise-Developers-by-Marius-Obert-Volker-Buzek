/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([ './library', 'sap/ui/core/HTML' ], function(library, HTML) {
	"use strict";

	/**
	 * @class InfoTile renderer.
	 * @static
	 */
	var InfoTileRenderer = {};

	/**
	 * Renders the HTML for the title of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 */
	InfoTileRenderer.renderTitle = function(oRm, oControl) {
		if (oControl.getTitle() !== "") {
			oRm.write("<div");
			oRm.addClass("sapSuiteInfoTileTitleTxt");
			oRm.addClass(oControl.getState());
			oRm.addClass(oControl.getSize());
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-title-text");
			oRm.writeAttributeEscaped("title", oControl.getTitle());
			oRm.write(">");
			oRm.renderControl(oControl._oTitle);
			oRm.write("</div>");
		}
	};

	/**
	 * Renders the HTML for the description of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose description should be rendered
	 */
	InfoTileRenderer.renderDescription = function(oRm, oControl) {
		if (oControl.getDescription() !== "") {
			oRm.write("<div");
			oRm.addClass("sapSuiteInfoTileDescTxt");
			oRm.addClass(oControl.getState());
			oRm.addClass(oControl.getSize());
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-description-text");
			oRm.writeAttributeEscaped("title", oControl.getDescription());
			oRm.write(">");
			oRm.writeEscaped(oControl.getDescription());
			oRm.write("</div>");
		}
	};

	/**
	 * Renders the HTML for the inner content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose inner content should be rendered
	 */
	InfoTileRenderer.renderInnerContent = function(oRm, oControl) {
		oRm.renderControl(oControl.getContent());
	};

	/**
	 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose content should be rendered
	 */
	InfoTileRenderer.renderContent = function(oRm, oControl) {
		oRm.write("<div");
		oRm.addClass("sapSuiteInfoTileContent");

		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-content");
		oRm.write(">");
		this.renderInnerContent(oRm, oControl);
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the footer text of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer text should be rendered
	 */
	InfoTileRenderer.renderFooterText = function(oRm, oControl) {
		if (oControl.getFooter() !== "") {
			oRm.writeEscaped(oControl.getFooter());
		}
	};

	/**
	 * Renders the HTML for the footer tooltip of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer tooltip should be rendered
	 */
	InfoTileRenderer.renderFooterTooltip = function(oRm, oControl) {
		oRm.writeAttributeEscaped("title", oControl.getFooter());
	};

	/**
	 * Renders the HTML for the footer of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer should be rendered
	 */
	InfoTileRenderer.renderFooter = function(oRm, oControl) {
		// footer text div
		var sState = oControl.getState();
		oRm.write("<div");
		oRm.addClass("sapSuiteInfoTileFtrTxt");

		oRm.addClass(oControl.getSize());
		oRm.addClass(oControl.getState());
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-footer-text");
		if (sState === library.LoadState.Loaded) {
			this.renderFooterTooltip(oRm, oControl);
		}
		oRm.write(">");
		switch (sState) {
			case library.LoadState.Loading:
				var oBusy = new HTML({
					content: "<div class='sapSuiteInfoTileLoading'><div>"
				});
				oBusy.setBusyIndicatorDelay(0);
				oBusy.setBusy(true);
				oRm.renderControl(oBusy);
				break;
			case library.LoadState.Failed:
				oRm.renderControl(oControl._oWarningIcon);

				oRm.write("<span");
				oRm.writeAttribute("id", oControl.getId() + "-failed-text");
				oRm.addClass("sapSuiteInfoTileFtrFldTxt");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oControl._sFailedToLoad);
				oRm.write("</span>");
				break;
			default:
				this.renderFooterText(oRm, oControl);
		}
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	InfoTileRenderer.render = function(oRm, oControl) {
		// write the HTML into the render manager
		var sTooltip = oControl.getTooltip_AsString();
		oRm.write("<div");
		oRm.writeControlData(oControl);

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.addClass("sapSuiteInfoTile");
		oRm.addClass(oControl.getSize());
		oRm.addClass(oControl.getState());
		oRm.writeClasses();
		oRm.writeAttribute("tabindex", "0");
		oRm.write(">");
		this.renderTitle(oRm, oControl);
		this.renderDescription(oRm, oControl);
		this.renderContent(oRm, oControl);
		this.renderFooter(oRm, oControl);
		oRm.write("</div>");
	};

	return InfoTileRenderer;
}, /* bExport= */ true);
