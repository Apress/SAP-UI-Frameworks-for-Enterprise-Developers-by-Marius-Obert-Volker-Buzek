/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(function() {
	"use strict";

	/**
	 * @class DateRangeScroller renderer.
	 * @static
	 */
	var DateRangeScrollerRenderer = {};

	/**
	 * Render decrementScrollButton
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 * @param {Object} oDisplay An object representation of the display
	 * @private
	 */
	DateRangeScrollerRenderer.renderDecrementScrollButton = function(oRm, oControl, oDisplay) {

		oRm.write("<a>");
		oRm.write('<span id="' + oControl.getId() + '-decrementScrollButton"');
		oRm.write('title="');
		oRm.writeEscaped(oDisplay.resBundle.getText("DATERANGESCROLLER_PREV_TEXT"));
		oRm.write('"');
		oRm.addClass("sapSuiteUiCommonsDateRangeScrollerScrollBtn");
		oRm.addClass("sapSuiteUiCommonsDateRangeScrollerDecBtnArrow");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</span>");
		oRm.write("</a>");
	};

	/**
	 * Render incrementScrollButton
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An Object representation of the control that should be rendered
	 * @param {Object} oDisplay An object representation of the display
	 * @private
	 */
	DateRangeScrollerRenderer.renderIncrementScrollButton = function(oRm, oControl, oDisplay) {

		oRm.write("<a>");
		oRm.write('<span id="' + oControl.getId() + '-incrementScrollButton"');
		oRm.write('title="');
		oRm.writeEscaped(oDisplay.resBundle.getText("DATERANGESCROLLER_NEXT_TEXT"));
		oRm.write('"');
		oRm.addClass("sapSuiteUiCommonsDateRangeScrollerScrollBtn");
		oRm.addClass("sapSuiteUiCommonsDateRangeScrollerIncBtnArrow");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</span>");
		oRm.write("</a>");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An Object representation of the control that should be rendered
	 */
	DateRangeScrollerRenderer.render = function(oRm, oControl) {

		var oLocale = sap.ui.getCore().getConfiguration().getLanguage();
		var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons", oLocale);
		var sPrevArrowSymbol = "&#9668";
		var sNextArrowSymbol = "&#9658";
		var oDisplay = {
			resBundle: oResBundle,
			prevArrowSymbol: sPrevArrowSymbol,
			nextArrowSymbol: sNextArrowSymbol
		};

		// write the HTML into the render manager
		oRm.write("<span");
		oRm.writeControlData(oControl);
		oRm.addClass("sapSuiteUiCommonsDateRangeScroller");
		oRm.writeClasses();
		oRm.writeAttribute("tabindex", "-1");
		oRm.write(">"); // span element

		// invisible span with tooltip as text for aria
		if (oControl.getTooltip_AsString()) {
			oRm.write('<SPAN id="' + oControl.getId() + '-Descr"');
			oRm.addStyle("visibility", "hidden");
			oRm.addStyle("display", "none");
			oRm.writeStyles();
			oRm.write('>');
			oRm.writeEscaped(oControl.getTooltip_AsString());
			oRm.write('</SPAN>');
		}

		this.renderDecrementScrollButton(oRm, oControl, oDisplay);

		this.renderIncrementScrollButton(oRm, oControl, oDisplay);

		// Start label area
		oRm.write("<span");
		oRm.writeAttribute("id", oControl.getId() + "-labelarea");
		oRm.writeAttribute("tabindex", "0");
		oRm.writeClasses();

		// ARIA
		oRm.writeAccessibilityState(oControl, {
			role: 'list',
			live: 'assertive',
			describedby: oControl.getTooltip_AsString() ? (oControl.getId() + '-Descr ' + oControl.getAriaDescribedBy().join(" ")) : undefined
		});

		oRm.write(">");

		oRm.renderControl(oControl._oDateRangeLabel);

		oRm.write("</span>"); // label span

		oRm.write("</span>");
	};


	return DateRangeScrollerRenderer;

}, /* bExport= */ true);
