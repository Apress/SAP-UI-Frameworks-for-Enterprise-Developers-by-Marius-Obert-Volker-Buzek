/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(['./util/FeedItemUtils'],
	function(FeedItemUtils) {
	"use strict";

	/**
	 * @class FeedTile renderer.
	 * @static
	 */
	var FeedTileRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	FeedTileRenderer.render = function(oRm, oControl) {
		var oLocale = sap.ui.getCore().getConfiguration().getLanguage();
		var oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons", oLocale);
		var oCurrentItem = oControl.getCurrentItem();

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.writeAttribute("tabindex", "0");
		oRm.addClass("sapSuiteUiCommonsFeedTile");
		oRm.addClass("sapSuiteUiCommonsPointer");
		oRm.writeClasses();

		var sFeedTileTitle = "";
		if (oControl.getTooltip_AsString()) {
			oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
			sFeedTileTitle = oControl.getTooltip_AsString();
		}

		var sNewsItemTitle = "";
		if (oCurrentItem) {
			sNewsItemTitle = oCurrentItem.getTitle();
		}

		oRm.writeAccessibilityState(oControl, {
			role: 'link',
			label: sFeedTileTitle + " " + sNewsItemTitle
		});

		oRm.write(">");

		if (oCurrentItem) {
			FeedTileRenderer.renderFeedItem(oRm, oControl, oCurrentItem, oControl.getId());
			var oNextItem = oControl.getNextItem();
			if (oNextItem) {
				FeedTileRenderer.renderFeedItem(oRm, oControl, oNextItem, oControl.getId() + '-next', true);
			}
		} else { // This is a condition when no feed items exist. Add a title that displays the condition & also render the defaultImage

			var oBackgroundImage = oControl.getDefaultImage();

			if (oBackgroundImage) {
				oRm.write('<div id="' + oControl.getId() + '-feedTileImage"');
				oRm.addStyle("background-image", 'url(' + oBackgroundImage + ')');
				oRm.writeStyles();
				oRm.addClass("sapSuiteUiCommonsFeedTileBackground");
				oRm.writeClasses();
				oRm.write(">");
			}

			var sTitle = oResBundle.getText("FEEDTILE_NOARTICLE_TITLE"); // "No articles to display";

			oRm.write('<div id="' + oControl.getId() + '-feedTileText"');
			oRm.addClass("sapSuiteUiCommonsFeedTileText");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write('<div id="' + oControl.getId() + '-feedTileTitle"');
			oRm.addClass("sapSuiteUiCommonsFeedTileTitle");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sTitle);
			oRm.write("</div>");
			oRm.write("</div>"); // sapSuiteUiCommonsFeedTileText
			if (oBackgroundImage) {
				oRm.write("</div>"); // sapSuiteUiCommonsFeedTileBackground
			}
		}

		oRm.write("</div>"); // sapSuiteUiCommonsFeedTile
	};

	FeedTileRenderer.renderFeedItem = function(oRm, oFeedTile, oFeedItem, itemId, hidden) {
		var oBackgroundImage = oFeedItem.getImage();
		if (!oBackgroundImage || !oFeedTile.getDisplayArticleImage()) {
			oBackgroundImage = oFeedTile.getDefaultImage();
		}

		if (oBackgroundImage) {
			oRm.write('<div id="' + itemId + '-feedTileImage"');
			oRm.addStyle("background-image", 'url(' + oBackgroundImage + ')');
			oRm.writeStyles();
			oRm.addClass("sapSuiteUiCommonsFeedTileBackground");
			if (hidden) {
				oRm.addClass("sapSuiteFTItemHidden");
			}
			oRm.writeClasses();
			oRm.write(">");
		}

		oRm.write('<div id="' + itemId + '-feedTileText"');
		oRm.addClass("sapSuiteUiCommonsFeedTileText");
		oRm.writeClasses();
		oRm.write(">");

		var sTitle = oFeedItem.getTitle();
		if (sTitle) {
			oRm.write('<div id="' + itemId + '-feedTileTitle"');
			oRm.addClass("sapSuiteUiCommonsFeedTileTitle");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sTitle);
			oRm.write("</div>");

			oRm.write("<div");
			oRm.addClass("sapSuiteUiCommonsFeedTileLowerText");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write('<div id="' + itemId + '-feedTileSource"');
			oRm.addClass("sapSuiteUiCommonsFeedTileSource");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(oFeedItem.getSource());
			oRm.write("</div>");

			oRm.write('<div id="' + itemId + '-feedTileAge"');
			oRm.addClass("sapSuiteUiCommonsFeedTileAge");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(FeedItemUtils.calculateFeedItemAge(oFeedItem.getPublicationDate()));
			oRm.write("</div>");
			oRm.write("</div>");
		}
		oRm.write("</div>"); // sapSuiteUiCommonsFeedTileText
		oRm.write("</div>"); // sapSuiteUiCommonsFeedTileBackground

	};

	return FeedTileRenderer;

}, /* bExport= */ true);