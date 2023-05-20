/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * @class NoteTaker renderer.
	 * @static
	 */
	var NoteTakerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NoteTakerRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapSuiteUiCommonsNoteTaker");
		oRm.writeClasses();
		oRm.writeAttribute("style", "width:" + (oControl.getVisibleNotes() * 350 + 50) + "px");
		oRm.write(">");
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-filterPane");
		oRm.addClass("sapSuiteUiCommonsNoteTakerFilterPane");
		oRm.writeClasses();
		oRm.write(">");
		// Left section
		oRm.write("<div");
		oRm.addClass("suiteUiNtFilterPaneLeftSection");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oHomeButton);
		oRm.write("<span");
		oRm.writeAttribute("id", oControl.getId() + "-filterPane-header");
		oRm.addClass("suiteUiNtFilterTitle");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl._rb.getText("NOTETAKER_FILTER_TITLE") + ":");
		oRm.write("</span>");
		oRm.renderControl(oControl._oFilterTagButton);
		oRm.renderControl(oControl._oFilterThumbUpButton);
		oRm.renderControl(oControl._oFilterThumbDownButton);
		oRm.renderControl(oControl._oFilterAllButton);
		oRm.write("</div>");

		// Right section
		oRm.write("<div");
		oRm.addClass("suiteUiNtFilterPaneRightSection");
		oRm.writeClasses();
		oRm.write(">");
		if (oControl.getVisibleNotes() > 1) {
			oRm.renderControl(oControl._oFilterSearchField);
		} else {
			oRm.renderControl(oControl._oSearchButton);
		}
		oRm.write("</div>");
		oRm.write("</div>");

		oRm.renderControl(oControl._carousel);

		if (oControl.getVisibleNotes() == 1) {
			this.searchTextRender(oRm, oControl);
		}

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-filterTag-panel");
		oRm.addClass("sapSuiteUiCommonsNoteTakerFilterTagPanel");
		oRm.addClass("sapUiShd");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-filterTag-arrow");
		oRm.addClass("sapSuiteUiCommonsNoteTakerFilterTagArrow");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-filterTag-header");
		oRm.addClass("sapSuiteUiCommonsNoteTakerFilterTagHeader");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl._rb.getText("NOTETAKERFEEDER_TOOLPOPUP_TITLE"));
		oRm.write("</div>");

		oRm.write("<div>");
		oRm.renderControl(oControl._oFilterTagList);
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapSuiteUiCommonsNoteTakerFilterTagButtons");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._oApplyFilterTagButton);
		oRm.renderControl(oControl._oCancelFilterTagButton);
		oRm.write("</div>");
		oRm.write("</div>");

		oRm.write("</div>");
	};

	NoteTakerRenderer.searchTextRender = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-search-panel");
		oRm.addClass("sapSuiteUiCommonsNoteTakerSearchPanel");
		oRm.addClass("sapUiShd");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-search-arrow");
		oRm.addClass("sapSuiteUiCommonsNoteTakerSearchArrow");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("<div>");
		oRm.renderControl(oControl._oFilterSearchField);
		oRm.write("</div>");
		oRm.write("</div>");
	};

	return NoteTakerRenderer;
}, /* bExport= */ true);
