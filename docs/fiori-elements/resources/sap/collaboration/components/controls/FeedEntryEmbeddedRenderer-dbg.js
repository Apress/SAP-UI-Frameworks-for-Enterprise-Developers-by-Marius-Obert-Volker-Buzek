/**
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define([
	"sap/ui/core/HTML",
	"sap/ui/thirdparty/jquery"
],
	function(HTML, jQuery) {
	"use strict";

	/**
	 * FeedEntryEmbedded renderer.
	 * @namespace
	 */
	var FeedEntryEmbeddedRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.collaboration.components.controls.FeedEntryEmbedded} oFeedEntryEmbedded an object representation of the control that should be rendered.
	 */
	FeedEntryEmbeddedRenderer.render = function(oRm, oFeedEntryEmbedded){

		// The embedded control is divided into 2 parts:
		// 1-Timeline Item Text Display: Text Display of for the feed and timeline entries
		// 2-Timeline Item Content:	The Content contains the content from feed entries (e.g. document, picture, poll...)

		// begin DIV
		oRm.openStart("div", oFeedEntryEmbedded).openEnd();

		// text display
		if (oFeedEntryEmbedded._shouldTextBeRendered()) {
			var sId = oFeedEntryEmbedded.getId();
			// begin DIV around collapsed or expanded text
			oRm.openStart("div").openEnd();

			// if text content is greater than the specified size limit render short version
			if (oFeedEntryEmbedded._sText.length > oFeedEntryEmbedded.nMaxCollapsedLength){

				oFeedEntryEmbedded.getCollapsedText();

				// begin DIV collapsed text
				oRm.openStart("div", sId + "-collapsed-text");
				oRm.class("sapUiTinyMarginBottom").class("sapCollaborationEmbeddedText");
				oRm.openEnd();

				this._renderText(oRm, oFeedEntryEmbedded, oFeedEntryEmbedded._sCollapsedTextWithPlaceholders);

				oRm.openStart("span");
				oRm.class("sapCollaborationEmbeddedTextSpace");
				oRm.openEnd();
				oRm.close("span");

				if (oFeedEntryEmbedded.oExpandLink === undefined){
					oFeedEntryEmbedded.oExpandLink = oFeedEntryEmbedded.createExpandCollapseLink("TE_MORE");
					oRm.renderControl(oFeedEntryEmbedded.oExpandLink);
				}
				else {
					oRm.renderControl(oFeedEntryEmbedded.oExpandLink);
				}

				oRm.close("div");
				// end DIV collapsed text

				// begin DIV for expanded text in hidden state
				oRm.openStart("div", sId + "-expanded-text");
				oRm.class("sapUiTinyMarginBottom").class("sapCollaborationEmbeddedText");
				oRm.openEnd();

				this._renderText(oRm, oFeedEntryEmbedded, oFeedEntryEmbedded._sTextWithPlaceholders);

				oRm.openStart("span");
				oRm.class("sapCollaborationEmbeddedTextSpace");
				oRm.openEnd();
				oRm.close("span");

				if (oFeedEntryEmbedded.oCollapseLink === undefined){
					oFeedEntryEmbedded.oCollapseLink = oFeedEntryEmbedded.createExpandCollapseLink("TE_LESS");
					oRm.renderControl(oFeedEntryEmbedded.oCollapseLink);
				}
				else {
					oRm.renderControl(oFeedEntryEmbedded.oCollapseLink);
				}

				// end DIV expanded text
				oRm.close("div");
			}
			else {
				// begin DIV for expanded text
				oRm.openStart("div", sId + "-expanded-text");
				oRm.class("sapUiTinyMarginBottom").class("sapCollaborationEmbeddedText");
				oRm.openEnd();

				this._renderText(oRm, oFeedEntryEmbedded, oFeedEntryEmbedded._sTextWithPlaceholders);

				// end DIV
				oRm.close("div");
			}
			// end DIV
			oRm.close("div");
		}

		// content
		if (oFeedEntryEmbedded._shouldContentBeRendered()) {
			oRm.renderControl(oFeedEntryEmbedded._oTimelineItemContent);
		}

		// end DIV
		oRm.close("div");
	};

	/**
	 * Renders the HTML for text with atMentions placeholders, using the provided {@link sap.ui.core.RenderManager}.
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered.
	 * @param {string} textToRender the text with placeholders to render
	 */
	FeedEntryEmbeddedRenderer._renderText = function(oRm, oFeedEntryEmbedded, textToRender) {
		var aTextSplitByPlaceholders = oFeedEntryEmbedded._splitByPlaceholders(textToRender);
		for (var i = 0; i < aTextSplitByPlaceholders.length; i++) {
			// if placeholder, render the link control
			var rPlaceholderPattern = /@@.\{\d+\}/; // Regex pattern for placeholder
			if (rPlaceholderPattern.test(aTextSplitByPlaceholders[i])) {
				oRm.renderControl(oFeedEntryEmbedded._mAtMentionsLinks[aTextSplitByPlaceholders[i]]);
			}
			// if content type is HTML, create and render a HTML control
			else if (oFeedEntryEmbedded.getProperty("feedEntry").ContentType === "text/html") {
				// wrap the text in a <span> since the sap.ui.core.HTML requires enclosing tags
				var sHTML = "<span>" + aTextSplitByPlaceholders[i] + "</span>";

				/*
				 * Logic to add the attr "target" with val "_blank" to anchor tags in order to open links in a new tab instead of the current window
				 * In cases where Jam returns HTML, anchors tags do not have this attr set
				 */
				var oDomEl = jQuery.parseHTML(sHTML)[0]; // parse HTML to get the <span> element
				var $el = jQuery(oDomEl).find("a"); // find the anchor tags inside the element

				if ($el.length !== 0) {
					$el.attr("target", "_blank"); // add the attr "target" with val "_blank" to the anchor tags
					sHTML = oDomEl.outerHTML; // convert the <span> element back to string, it will now have anchors tags with the attr "target" set
				}

				// render a HTML control
				oRm.renderControl(new HTML({ // TODO memory leak
					content: sHTML,
					sanitizeContent: true
				}));
			}
			// else render the text
			else {
				// have to put text in span to apply alignment to match the rendering of the sap.m.Link control
				aTextSplitByPlaceholders[i].split("\n").forEach(function(sLine, i) {
					if ( i > 0 ) {
						oRm.voidStart("br").voidEnd();
					}
					oRm.text(sLine);
				});
			}
		}
	};

	return FeedEntryEmbeddedRenderer;
}, /* bExport= */ true);

