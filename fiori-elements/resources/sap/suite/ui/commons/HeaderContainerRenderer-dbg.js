/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class HeaderContainer renderer.
	 * @static
	 */
	var HeaderContainerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	HeaderContainerRenderer.render = function(rm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		// write the HTML into the render manager
		rm.write("<div");
		rm.writeControlData(oControl);
		if (sTooltip && (typeof sTooltip === "string")) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
		rm.addClass("sapSuiteHdrCntr");
		rm.addClass(oControl.getView());
		if (oControl.getShowDividers()) {
			rm.addClass("sapSuiteHrdrCntrDvdrs");
		}
		rm.writeClasses();
		if (oControl.getView() === "Vertical") {
			rm.addStyle("height", "100%");
			rm.writeStyles();
		}
		var sDesc = "";
		var aItems = oControl.getItems();
		for (var i = 0; aItems && i < aItems.length; i++) {
			sDesc += aItems[i].getId() + " ";
		}
		rm.writeAttribute("aria-labelledby", sDesc);
		rm.write(">");

		rm.write("<div");
		rm.writeAttributeEscaped("id", oControl.getId() + "-scroll-area");
		rm.addClass("sapSuiteHdrCntrCntr");
		rm.addClass(oControl.getView());
		rm.addClass("sapSuiteHdrCntrBG" + oControl.getBackgroundDesign());
		rm.writeClasses();
		rm.write(">");
		rm.renderControl(oControl._oScrollCntr);
		rm.write("<div");
		rm.writeAttribute("id", oControl.getId() + "-after");
		rm.writeAttribute("tabindex", "0");
		rm.write("></div>");
		rm.write("</div>");

		if (oControl._oArrowPrev) {
			rm.write("<div");
			rm.addClass("sapSuiteHdrCntrBtnCntr");
			rm.addClass("sapSuiteHdrCntrLeft");
			rm.addClass(oControl.getView());
			rm.writeClasses();
			rm.write(">");
			rm.renderControl(oControl._oArrowPrev);
			rm.write("</div>");
		}

		if (oControl._oArrowNext) {
			rm.write("<div");
			rm.addClass("sapSuiteHdrCntrBtnCntr");
			rm.addClass("sapSuiteHdrCntrRight");
			rm.addClass(oControl.getView());
			rm.writeClasses();
			rm.write(">");
			rm.renderControl(oControl._oArrowNext);
			rm.write("</div>");
		}
		rm.write("</div>");
	};

	return HeaderContainerRenderer;
}, /* bExport= */ true);
