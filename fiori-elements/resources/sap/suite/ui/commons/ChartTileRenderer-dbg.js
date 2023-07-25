/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './library', './InfoTileRenderer', 'sap/ui/core/Renderer' ], function(library, InfoTileRenderer, Renderer) {
	"use strict";

	/**
	 * @class ChartTile renderer.
	 * @static
	 */
	var ChartTileRenderer = Renderer.extend(InfoTileRenderer);

	/**
	 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an Object representation of the control that should be rendered
	 */
	ChartTileRenderer.renderContent = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-content");
		oRm.addClass("sapSuiteCmpTileContent");
		oRm.addClass(oControl.getSize());
		oRm.writeClasses();
		oRm.write(">");
		if (library.LoadState.Loaded == oControl.getState()) {
			this.renderInnerContent(oRm, oControl);
		}
		oRm.write("</div>");
	};

	/**
	 * Renders the HTML for the description along with the unit of measure text of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 **/

	ChartTileRenderer.renderDescription = function(oRm, oControl) {
		if (oControl.getDescription() || oControl.getUnit()) {
			oRm.write("<div");
			oRm.addClass("sapSuiteInfoTileDescTxt");
			oRm.addClass(oControl.getState());
			oRm.addClass(oControl.getSize());
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-description-text");
			oRm.writeAttributeEscaped("title", this.createDescriptionTooltip(oControl));
			oRm.write(">");

			if (oControl.getDescription()) {
				oRm.write("<span");
				oRm.writeAttribute("id", oControl.getId() + "-description");
				oRm.addClass("sapSuiteCmpTileDescInner");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(oControl.getDescription());
				oRm.write("</span>");
			}

			if (oControl.getUnit()) {
				oRm.write("<span");
				oRm.writeAttribute("id", oControl.getId() + "-unit");
				oRm.addClass("sapSuiteCmpTileUnitInner");
				oRm.writeClasses();
				oRm.write(">(");
				oRm.writeEscaped(oControl.getUnit());
				oRm.write(")</span>");
			}

			oRm.write("</div>");
		}
	};

	/**
	 * Creates the tooltip text of the description and the unit of measure of the given control
	 */

	ChartTileRenderer.createDescriptionTooltip = function(oControl) {
		var aResult = [];

		if (oControl.getDescription()) {
			aResult.push(oControl.getDescription());
		}

		if (oControl.getUnit()) {
			aResult.push("(" + oControl.getUnit() + ")");
		}

		return aResult.join(" ");
	};

	return ChartTileRenderer;
}, /* bExport= */ true);
