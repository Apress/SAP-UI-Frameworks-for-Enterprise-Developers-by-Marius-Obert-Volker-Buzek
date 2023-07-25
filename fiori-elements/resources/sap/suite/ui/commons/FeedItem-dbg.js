/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.FeedItem.
sap.ui.define([
	'./library',
	'sap/ui/core/Element',
	"sap/base/security/URLListValidator",
	"sap/base/Log"
], function (library, Element, URLListValidator, Log) {
	"use strict";

	/**
	 * Constructor for a new FeedItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This element represents a news feed item.
	 * @extends sap.ui.core.Element
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Generic Tile should be used instead.
	 * @alias sap.suite.ui.commons.FeedItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeedItem = Element.extend("sap.suite.ui.commons.FeedItem", /** @lends sap.suite.ui.commons.FeedItem.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The title of the feed item.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The background image for the feed item.
				 */
				image: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * The target location of the feed item.
				 */
				link: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * The source of the feed item.
				 */
				source: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The date the feed was published.
				 */
				publicationDate: {type: "object", group: "Misc", defaultValue: null}
			}
		}
	});

	FeedItem.prototype.setImage = function (oImage) {
		if (oImage) {
			var validUrl = URLListValidator.validate(oImage);
			if (validUrl) {
				this.setProperty("image", oImage);
			} else {
				Log.error("Invalid Url:'" + oImage + "'. Property 'image' of FeedItem not set");
			}
		}

		return this;
	};

	FeedItem.prototype.setLink = function (sLink) {
		if (sLink) {
			var validUrl = URLListValidator.validate(sLink);
			if (validUrl) {
				this.setProperty("link", sLink);
			} else {
				Log.error("Invalid Url:'" + sLink + "'. Property 'link' of FeedItem not set");
			}
		}

		return this;
	};

	return FeedItem;
});
