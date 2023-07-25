/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/m/StandardListItemRenderer", "sap/ui/core/Renderer"
], function(BaseItemRenderer, Renderer) {
	"use strict";

	/*
	 * @class Legend Item renderer. @static
	 */
	var LegendItemRenderer = Renderer.extend(BaseItemRenderer);

	LegendItemRenderer.apiVersion = 2;

	LegendItemRenderer.renderLIContent = function(oRm, oControl) {
		var squareColor = oControl.getColor();
		var type = oControl.getSemanticSpotType();
		var oImg = null;
		if (squareColor) {
			oRm.openStart("span");
			oRm.class("sapUiVkLegendItemSquare");
			oRm.style("background-color", squareColor);
			oRm.openEnd();
			oRm.close("span");
		}
		if (type) {
			switch (type) {
				case sap.ui.vbm.SemanticType.Error:
					oImg = sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Red.png");
					break;
				case sap.ui.vbm.SemanticType.Warning:
					oImg = sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Orange.png");
					break;
				case sap.ui.vbm.SemanticType.Success:
					oImg = sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Green.png");
					break;
				case sap.ui.vbm.SemanticType.Default:
					oImg = sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Blue.png");
					break;
				case sap.ui.vbm.SemanticType.Inactive:
					oImg = sap.ui.require.toUrl("sap/ui/vbm/themes/base/img/Pin_Grey.png");
					break;
				default:
					break;
			}
			if (oImg) {
				oControl.addStyleClass("sapUiVkLegendItemSpotType");
				oControl.setIcon(oImg);
			}
		}
		BaseItemRenderer.renderLIContent(oRm, oControl);
	};

	return LegendItemRenderer;

}, /* bExport= */true);
