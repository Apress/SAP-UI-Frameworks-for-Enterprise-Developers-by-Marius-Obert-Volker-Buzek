/*
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/base/security/encodeXML"
], function(encodeXML) {
	"use strict";

	// lazy dependency
	var ProcessFlowLaneHeader;

	/**
	 * @class ProcessFlowLaneHeader renderer.
	 * @static
	 */
	var ProcessFlowLaneHeaderRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ProcessFlowLaneHeaderRenderer.render = function (oRm, oControl) {

		// as there's an instance to render, it should be possible to retrieve the module by probing
		ProcessFlowLaneHeader = ProcessFlowLaneHeader || sap.ui.require("sap/suite/ui/commons/ProcessFlowLaneHeader");

		// Write the HTML into the render manager
		switch (oControl._getSymbolType()) {
			case ProcessFlowLaneHeader.symbolType.startSymbol:
				this._writeSymbolNodeType(
					oRm,
					oControl,
					"-start",
					["suiteUiProcessFlowLaneHeaderStartEndSymbol", "suiteUiProcessFlowLaneHeaderStartSymbol"],
					["suiteUiProcessFlowLaneHeaderStartEndSymbolContainer", "suiteUiProcessFlowLaneHeaderNoSelection"],
					false /* do not draw icon */,
					oControl._isHeaderMode()
				);
				break;
			case ProcessFlowLaneHeader.symbolType.endSymbol:
				this._writeSymbolNodeType(
					oRm,
					oControl,
					"-end",
					["suiteUiProcessFlowLaneHeaderStartEndSymbol", "suiteUiProcessFlowLaneHeaderEndSymbol"],
					["suiteUiProcessFlowLaneHeaderStartEndSymbolContainer", "suiteUiProcessFlowLaneHeaderNoSelection"],
					false /* do not draw icon */,
					oControl._isHeaderMode()
				);
				break;
			case ProcessFlowLaneHeader.symbolType.processSymbol:
				this._writeSymbolNodeType(
					oRm,
					oControl,
					"-process",
					["suiteUiProcessFlowLaneHeaderProcessSymbol"],
					["suiteUiProcessFlowLaneHeaderProcessSymbolContainer", "suiteUiProcessFlowLaneHeaderNoSelection"],
					true /* draw icon */,
					oControl._isHeaderMode()
				);
				break;
			default:
				this._writeDefaultNodeType(oRm, oControl);
		}
	};

	/* =========================================================== */
	/* Helper methods                                              */
	/* =========================================================== */

	/**
	 * Node symbol renderer.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 * @param {string} symbolId ID suffix of the symbol node
	 * @param {string[]} symbolClasses Array of names of classes for symbol node div element
	 * @param {string[]} containerClasses Array of names of classes for the symbol container div element
	 * @param {boolean} isIconRendered True if the icon should be rendered
	 * @since 1.22
	 */
	ProcessFlowLaneHeaderRenderer._writeSymbolNodeType = function (oRm, oControl, symbolId, symbolClasses, containerClasses, isIconRendered) { // EXC_JSHINT_034
		oRm.openStart("div", oControl);
		containerClasses.forEach(function (containerClass) {
			oRm.class(encodeXML(containerClass));
		});
		//Write ARIA details
		oRm.attr("role", "separator");
		oRm.attr("aria-label", oControl._getSymbolAriaText());

		oRm.openEnd(); // symbol container
		oRm.openStart("div"); // symbol
		oRm.attr("id", oControl.getId() + symbolId);
		symbolClasses.forEach(function (symbolClass) {
			oRm.class(encodeXML(symbolClass));
		});
		oRm.openEnd();
		if (isIconRendered) {
			var sIconSrc = oControl.getIconSrc();
			if (sIconSrc) {
				var oIcon = oControl._getImage(oControl.getId() + "-lh-icon", sIconSrc);
				oRm.renderControl(oIcon);
			}
		}
		oRm.close("div"); // symbol
		oRm.close("div"); // symbol container
	};

	/**
	 * Default node renderer.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 * @since 1.22
	 */
	ProcessFlowLaneHeaderRenderer._writeDefaultNodeType = function (oRm, oControl) {  // EXC_SAP_006_1, EXC_JSHINT_046
		oRm.openStart("div", oControl);
		oRm.class("suiteUiProcessFlowLaneHeaderContainer");
		oRm.class("suiteUiProcessFlowLaneHeaderNoSelection");
		oRm.openEnd(); // div element for the whole control

		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-standard");

		//Write ARIA details
		oRm.attr("role", "img");
		var statusText =  oControl._getAriaText();
		oRm.attr("aria-label", statusText);

		//add default text if custom tooltip not available
		var sLaneTooltip = oControl.getTooltip() ? oControl.getTooltip() : statusText;
		oRm.attr("title", sLaneTooltip);

		oRm.class("suiteUiProcessFlowLaneHeaderBodyContainer");
		oRm.openEnd(); // div element for header
		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-horizontal-line");
		oRm.class("suiteUiProcessFlowLaneHeaderHorizontalLine");
		oRm.openEnd().close("div");

		oRm.openStart("svg");
		oRm.attr("id", oControl.getId() + "-donut-chart");
		oRm.class("suiteUiProcessFlowLaneHeaderDonutSvg");
		oRm.openEnd();
		oControl._renderDonutPercentages(oRm);
		oRm.close("svg"); // div element for the donut chart

		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-lh-icon-container");
		oRm.class("suiteUiProcessFlowLaneHeaderIconContainer");
		oRm.openEnd(); // div element for header

		var sIconSrc = oControl.getIconSrc();
		if (sIconSrc) {
			var oIcon = oControl._getImage(oControl.getId() + "-lh-icon", sIconSrc);
			oIcon.addStyleClass("suiteUiProcessFlowLaneHeaderProcessSymbolIcon");
			oRm.renderControl(oIcon);
		}
		oRm.close("div"); // icon container
		oRm.close("div"); // body container

		oRm.openStart("div");
		oRm.attr("id", oControl.getId() + "-lh-text-container");
		oRm.class("suiteUiProcessFlowLaneHeaderTextContainer");
		oRm.openEnd(); // div element for the text container

		oRm.openStart("span");
		oRm.attr("id", oControl.getId() + "-lh-text");
		oRm.class("suiteUiProcessFlowLaneHeaderText");
		oRm.attr("aria-hidden", true);
		oRm.openEnd(); // div element for the text span
		oRm.text(oControl.getText());
		oRm.close("span"); // text

		oRm.close("div"); // text container

		oRm.close("div"); // whole control
	};


	return ProcessFlowLaneHeaderRenderer;

}, /* bExport= */ true);
