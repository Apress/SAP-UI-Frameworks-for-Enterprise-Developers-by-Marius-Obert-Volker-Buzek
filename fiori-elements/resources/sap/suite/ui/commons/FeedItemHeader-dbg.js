/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.FeedItemHeader.
sap.ui.define([
	'sap/m/ListItemBase',
	'./library',
	'sap/ui/core/HTML',
	"sap/base/security/URLListValidator",
	"sap/base/Log",
	"./FeedItemHeaderRenderer"
], function (ListItemBase, library, HTML, URLListValidator, Log, FeedItemHeaderRenderer) {
	"use strict";

	/**
	 * Constructor for a new FeedItemHeader.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays feed item header information.
	 * @extends sap.m.ListItemBase
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.GenericTile.
	 * @alias sap.suite.ui.commons.FeedItemHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeedItemHeader = ListItemBase.extend("sap.suite.ui.commons.FeedItemHeader", /** @lends sap.suite.ui.commons.FeedItemHeader.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The title of the feed item.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * The image associated with the feed item.
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
				 * The date the feed item was published.
				 */
				publicationDate: {type: "object", group: "Misc", defaultValue: null},

				/**
				 * The description of the feed item.
				 */
				description: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	FeedItemHeader.prototype.exit = function (oEvent) {
		if (this._htmlControl) {
			this._htmlControl.destroy();
		}
		ListItemBase.prototype.exit.apply(this);
	};

	FeedItemHeader.prototype.setImage = function (sImageUri) {
		if (sImageUri) {
			var validUrl = URLListValidator.validate(sImageUri);
			if (validUrl) {
				this.setProperty("image", sImageUri);
			} else {
				Log.error("Invalid Url:'" + sImageUri + "'. Property 'image' of FeedItemHeader not set");
			}
		}

		return this;
	};

	FeedItemHeader.prototype.setLink = function (sLinkUri) {
		if (sLinkUri) {
			var validUrl = URLListValidator.validate(sLinkUri);
			if (validUrl) {
				this.setProperty("link", sLinkUri);
			} else {
				Log.error("Invalid Url:'" + sLinkUri + "'. Property 'link' of FeedItemHeader not set");
			}
		}

		return this;
	};

	/**
	 * Fire press event.
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	FeedItemHeader.prototype.onclick = function (oEvent) {
		this.firePress({
			link: this.getLink()
		});
		// Prevent the browser from acting on events triggered by clicking on html markup inside of the description (like anchors)
		oEvent.preventDefault();
	};

	/**
	 * Get the HTML control used to render description content that may contain HTML markup.
	 * @private
	 * @returns {sap.ui.core.HTML} Either a new HTML instance or the existing once
	 */
	FeedItemHeader.prototype._getHtmlControl = function () {
		if (!this._htmlControl) {
			this._htmlControl = new HTML({
				id: this.getId() + "-feedItemHeaderDescription",
				sanitizeContent: true
			});
		}
		return this._htmlControl;
	};

	return FeedItemHeader;
});
