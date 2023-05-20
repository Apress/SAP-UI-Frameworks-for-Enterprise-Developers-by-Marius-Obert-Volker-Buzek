/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './util/RenderUtils' ], function(RenderUtils) {
	"use strict";

	/**
	 * @class NoteTakerCard renderer.
	 * @static
	 */
	var NoteTakerCardRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NoteTakerCardRenderer.render = function(oRm, oControl) {

		// write the HTML into the render manager
		var sFullHeader = oControl.getHeader();
		var sTruncatedHeader = this.getTruncatedHeader(sFullHeader);
		var bShowViewAllLink = oControl.getBody().length > oControl.getViewAllTrigger();
		var bShowAttachment = oControl.getAttachmentFilename() !== "";
		var rh = new RenderUtils(oRm);
		var sTooltip = oControl.getTooltip_AsString();

		// main DIV element
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapSuiteUiCommonsNoteTakerCard");
		if (oControl.getThumbUp()) {
			oRm.addClass("suiteUiNtcPositiveCard");
		}
		if (oControl.getThumbDown()) {
			oRm.addClass("suiteUiNtcNegativeCard");
		}
		oRm.writeClasses();

		var ariaInfo = { role: 'region' };
		oRm.writeAccessibilityState(oControl, ariaInfo);
		oRm.write(">");

		// header DIV element
		rh.writeOpeningTag('div', {
			attributes: { id: oControl.getId() + "-header" },
			classes: ['sapSuiteUiCommonsNoteTakerCardHeader']
		});
		rh.writeOpeningTag('div', {
			attributes: { id: oControl.getId() + "-header-buttons" },
			classes: ['sapSuiteUiCommonsNoteTakerCardHeaderButtons']
		});
		oRm.renderControl(oControl._oEditButton);
		oRm.renderControl(oControl._oDeleteButton);
		rh.writeClosingTag('div');

		if (!sFullHeader) {
			oRm.write("&nbsp;");
		} else {
			oRm.write("<label");
			oRm.writeAttribute("id", oControl.getId() + "-headerLabel");
			if (sFullHeader !== sTruncatedHeader) {
				oRm.writeAttributeEscaped("title", sFullHeader);
			}
			oRm.write(">");
			oRm.writeEscaped(sTruncatedHeader);
			oRm.write("</label>");
		}

		// timestamp DIV element
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-timestamp");
		oRm.addClass("sapSuiteUiCommonsNoteTakerCardTimestamp");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(oControl.getFormattedTimestamp());
		oRm.write("</div>");
		oRm.write("</div>");

		//body container DIV
		oRm.write("<div");
		oRm.addClass("sapSuiteUiCommonsNoteTakerCardBodyContent");
		oRm.writeClasses();
		oRm.write(">");

		//tag panel DIV
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-toolbar");
		oRm.addClass("suiteUiNtcToolbar");
		oRm.writeClasses();
		oRm.write(">");
		this.renderToolbar(oRm, oControl);
		oRm.write("</div>");

		//attachment bar DIV
		if (bShowAttachment) {
			oRm.renderControl(oControl._prepareAttachmentPanel(false));
		}

		// body DIV element
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-body");
		oRm.addClass("sapSuiteUiCommonsNoteTakerCardBody");
		if (bShowAttachment && bShowViewAllLink) {
			oRm.addClass("sapSuiteUiCommonsNtcBodyViewAllAttach");
		} else if (bShowViewAllLink) {
			oRm.addClass("sapSuiteUiCommonsNtcBodyViewAll");
		} else if (bShowAttachment) {
			oRm.addClass("sapSuiteUiCommonsNtcBodyAttach");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(oControl._getFormattedBody());
		oRm.write("</div>");

		// view all DIV element
		if (bShowViewAllLink) {
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-viewAll");
			oRm.addClass("sapSuiteUiCommonsNoteTakerCardViewAll");
			oRm.writeClasses();
			oRm.write(">&nbsp;");
			oControl._oViewAllLink.addStyleClass("sapSuiteUiCommonsNoteTakerCardViewAllLink");
			oRm.renderControl(oControl._oViewAllLink);
			oRm.write("</div>");
		}

		oRm.write("</div>"); // body container div

		oRm.write("</div>"); // card div
	};

	/*
	 * Returns truncated version of the header if it exceeds iLength
	 */
	NoteTakerCardRenderer.getTruncatedHeader = function(sFullHeader) {
		var iLength = 20;
		var sTerminator = "...";
		if (sFullHeader && sFullHeader.length > iLength) {
			return sFullHeader.substr(0, iLength - sTerminator.length) + sTerminator;
		} else {
			return sFullHeader;
		}
	};

	NoteTakerCardRenderer.renderToolbar = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-left-toolbar");
		oRm.addClass("sapSuiteUiCommonsNoteTakerCardLeftPanel");
		if (oControl.getThumbUp() || oControl.getThumbDown()) {
			oRm.addClass("sapSuiteUiCommonsNoteTakerCardWithThumbs");
		} else {
			oRm.addClass("sapSuiteUiCommonsNoteTakerCardNoThumbs");
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.write(oControl._getFormattedTags());
		oRm.write("</div>");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-right-toolbar");
		oRm.addClass("sapSuiteUiCommonsNoteTakerCardRightPanel");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-thumb");

		var thumbTooltip = "";
		if (oControl.getThumbUp() && !oControl.getThumbDown()) {
			oRm.writeAttribute("class", "sapSuiteUiCommonsNoteTakerCardThumbUp");
			thumbTooltip = oControl._rb.getText("NOTETAKERCARD_ICON_THUMB_UP_TOOLTIP");
			oRm.writeAttribute("title", thumbTooltip);
		} else if (!oControl.getThumbUp() && oControl.getThumbDown()) {
			oRm.writeAttribute("class", "sapSuiteUiCommonsNoteTakerCardThumbDown");
			thumbTooltip = oControl._rb.getText("NOTETAKERCARD_ICON_THUMB_DOWN_TOOLTIP");
			oRm.writeAttribute("title", thumbTooltip);
		}
		oRm.write(">");

		//ARIA info
		oRm.write("<span");
		oRm.writeAttribute("style", "visibility: hidden; display: none;");
		oRm.write(">");
		oRm.writeEscaped(thumbTooltip);
		oRm.write("</span>");

		oRm.write("</div>");
		oRm.write("</div>");
	};

	return NoteTakerCardRenderer;
}, /* bExport= */ true);
