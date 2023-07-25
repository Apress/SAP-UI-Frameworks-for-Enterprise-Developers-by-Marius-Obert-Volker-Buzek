/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './InfoTileRenderer', 'sap/ui/core/Renderer' ], function(InfoTileRenderer, Renderer) {
	"use strict";

	/**
	 * @class NumericTile renderer.
	 * @static
	 */
	var NumericTileRenderer = Renderer.extend(InfoTileRenderer);

	NumericTileRenderer._getFooterText = function(oRm, oControl) {
		var sFooter = oControl.getFooter();
		var sUnit = oControl.getUnit();
		return sUnit //eslint-disable-line
			? (sap.ui.getCore().getConfiguration().getRTL()
				? ((sFooter ? sFooter + " ," : "") + sUnit)
				: (sUnit + (sFooter ? ", " + sFooter : "")))
			: sFooter;
	};

	/**
	 * Renders the HTML for the footer tooltip of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer tooltip should be rendered
	 */
	NumericTileRenderer.renderFooterTooltip = function(oRm, oControl) {
		oRm.writeAttributeEscaped("title", this._getFooterText(oRm, oControl));
	};

	/**
	 * Renders the HTML for the footer text of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose footer text should be rendered
	 */
	NumericTileRenderer.renderFooterText = function(oRm, oControl) {
		oRm.writeEscaped(this._getFooterText(oRm, oControl));
	};

	return NumericTileRenderer;
}, /* bExport= */ true);
