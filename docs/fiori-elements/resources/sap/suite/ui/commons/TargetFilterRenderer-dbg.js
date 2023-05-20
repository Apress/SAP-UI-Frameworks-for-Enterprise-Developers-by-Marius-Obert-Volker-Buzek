/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class TargetFilter renderer.
	 * @static
	 */
	var TargetFilterRenderer = {};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	TargetFilterRenderer.render = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteUiTF");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFOuterCont");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFOuterCircle");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFVerticalLine");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		for (var i = 0; i < oControl._aQuadrants.length; i++) {
			oRm.renderControl(oControl._aQuadrants[[1, 0, 3, 2][i]]);
		}

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFCentralCircle");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFCentralTopLabel");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oShowSelectedLink);
		oRm.write("</div>");

		oRm.renderControl(oControl._oCountDisplay);

		oRm.write("</div>");

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFRightPanel");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oRightPanel);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiTFVM");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.oVariantManagement);
		oRm.write("</div>");

		oRm.write("</div>");
	};

	return TargetFilterRenderer;
}, /* bExport= */ true);
