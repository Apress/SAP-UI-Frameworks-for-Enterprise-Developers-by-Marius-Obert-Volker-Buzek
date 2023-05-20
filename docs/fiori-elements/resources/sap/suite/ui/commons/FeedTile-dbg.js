/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.FeedTile.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/core/Control',
	'sap/suite/ui/commons/util/FeedItemUtils',
	"sap/base/Log",
	"sap/base/security/encodeCSS",
	"sap/base/security/encodeXML",
	"sap/base/security/URLListValidator",
	"./FeedTileRenderer"
], function (jQuery, library, Control, FeedItemUtils, Log, encodeCSS, encodeXML, URLListValidator, FeedTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new FeedTile.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control displays news feeds.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.GenericTile.
	 * @alias sap.suite.ui.commons.FeedTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeedTile = Control.extend("sap.suite.ui.commons.FeedTile", /** @lends sap.suite.ui.commons.FeedTile.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The length of time in seconds the control displays each feed item. Default value is 5 seconds.
				 */
				displayDuration: {type: "int", group: "Misc", defaultValue: 5},

				/**
				 * To display article Image or not. If it is true, the article Image will be displayed based on precedence. If it is false, the default image will be displayed.
				 */
				displayArticleImage: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * The source of the feed item.
				 */
				source: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * A list of default images that is cycled by the control when no image is available for a feed item or when no feed items exist. After a random image is displayed first time, control cycles through this list of images.
				 */
				defaultImages: {type: "sap.ui.core.URI[]", group: "Misc", defaultValue: null}
			},
			aggregations: {

				/**
				 * The feed items the control cycles through.
				 */
				items: {type: "sap.suite.ui.commons.FeedItem", multiple: true, singularName: "item"}
			},
			events: {

				/**
				 * The event fired when the user clicks on the control.
				 */
				press: {}
			}
		}
	});

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	FeedTile.prototype.init = function () {
		this._currentItemIndex = 0;
		this._stagedModel = null;
		this._defaultImageIndex = -1;
	};

	/**
	 * This function is called when displayDuration expires to cycle to the next FeedItem in the list.
	 *
	 * @private
	 */
	FeedTile.prototype.cycle = function () {
		// If the staged model is not null then update the control with the new model
		// and adjust the current item index if necessary.
		if (this._stagedModel) {
			Log.debug("FeedTile: Updating news tile with new model");
			this.setModel(this._stagedModel);
			this._stagedModel = null;

			var numItems = this.getItems().length;
			if (this._currentItemIndex >= numItems) {
				this._currentItemIndex = 0;
			}
			return;
		}

		var items = this.getItems();
		this._currentItemIndex = (this._currentItemIndex + 1) % items.length;

		var $oToFeed = jQuery("#" + this.getId() + "-next-feedTileImage");
		var $oFromFeed = jQuery("#" + this.getId() + "-feedTileImage");

		if (jQuery.support.cssTransitions) {
			$oToFeed.addClass("sapSuiteFTItemRight").removeClass('sapSuiteFTItemHidden');
			$oFromFeed.addClass('sapSuiteFTItemCenter');
			setTimeout(function () {
				var bOneTransitionFinished = false;
				var fAfterTransition = null; // make Eclipse aware that this variable is defined
				fAfterTransition = function () {

					jQuery(this).off("webkitTransitionEnd transitionend");
					if (!bOneTransitionFinished) {
						// the first one of both transitions finished
						bOneTransitionFinished = true;
					} else {
						// the second transition now also finished => clean up the style classes
						$oToFeed.removeClass("sapSuiteFTItemSliding");
						$oFromFeed.removeClass("sapSuiteFTItemSliding").addClass("sapSuiteFTItemHidden").removeClass("sapSuiteFTItemLeft").addClass("sapSuiteFTItemRight");

						$oFromFeed.detach();
						$oToFeed.after($oFromFeed);
						this.flipIds($oToFeed, $oFromFeed);

						setTimeout(function () {
							this.setNextItemValues(this);
						}.bind(this), 100);
						this._timeoutId = setTimeout(function () {
							this.cycle();
						}.bind(this), this.getDisplayDuration() * 1000);
					}
				};

				$oFromFeed.on("webkitTransitionEnd transitionend", fAfterTransition.bind(this));
				$oToFeed.on("webkitTransitionEnd transitionend", fAfterTransition.bind(this));

				$oFromFeed.addClass('sapSuiteFTItemSliding').removeClass('sapSuiteFTItemCenter').addClass('sapSuiteFTItemLeft');
				$oToFeed.addClass('sapSuiteFTItemSliding').removeClass('sapSuiteFTItemRight').addClass('sapSuiteFTItemCenter');
			}.bind(this), 60); // this value has been found by testing on actual devices; with "10" there are frequent "no-animation" issues, with "100" there are none, with "50" there are very few
		} else {
			$oToFeed.css("left", "100%");
			$oToFeed.removeClass("sapSuiteFTItemHidden");

			$oToFeed.animate({
				left: "0%"
			}, 400);

			$oFromFeed.animate({
				left: "-100%"
			}, 400, function () {

				$oFromFeed.addClass("sapSuiteFTItemHidden");
				$oFromFeed.css("left", "0");
				this.flipIds($oToFeed, $oFromFeed);

				setTimeout(function () {
					this.setNextItemValues(this);
				}.bind(this), 100);
				this._timeoutId = setTimeout(function () {
					this.cycle();
				}.bind(this), this.getDisplayDuration() * 1000);
			}.bind(this));
		}

	};

	/**
	 * This function is called after the FeedTile is rendered
	 *
	 * @private
	 */
	FeedTile.prototype.onAfterRendering = function () {
		var displayDuration = this.getDisplayDuration() * 1000;
		if (this.getItems().length > 1) {
			if (typeof this._timeoutId === "number") {
				clearTimeout(this._timeoutId);
				delete this._timeoutId;
			}
			this._timeoutId = setTimeout(function () {
				this.cycle();
			}.bind(this), displayDuration);
		}
	};

	/**
	 * Fire press event.
	 * @param {jQuery.Event} oEvent The jQuery event object.
	 * @private
	 */
	FeedTile.prototype.onclick = function (oEvent) {
		//always fire the event
		var currentItem = this.getCurrentItem();
		var id = "";
		if (currentItem && currentItem.getId()) {
			id = currentItem.getId();
		}
		this.firePress({
			itemId: id
		});
	};

	/**
	 * Get the currently rendered FeedItem.
	 * @returns {sap.suite.ui.commons.FeedItem} The current item
	 * @private
	 */
	FeedTile.prototype.getCurrentItem = function () {
		var items = this.getItems();
		if (items.length) {
			return items[this._currentItemIndex];
		}
	};

	/**
	 * Get the next rendered FeedItem.
	 * @returns {sap.suite.ui.commons.FeedItem} The next item
	 * @private
	 */
	FeedTile.prototype.getNextItem = function () {
		var items = this.getItems();
		if (items.length && items.length > 1) {
			return items[(this._currentItemIndex + 1) % items.length];
		}
	};

	/**
	 * Get the next rendered FeedItem.
	 *
	 * @private
	 */
	FeedTile.prototype.setNextItemValues = function () {
		var oNextItem = this.getNextItem();
		var id = this.getId();

		var oBackgroundImage = oNextItem.getImage();
		if (!oBackgroundImage || !this.getDisplayArticleImage()) {
			oBackgroundImage = this.getDefaultImage();
		}

		jQuery("#" + id + "-next-feedTileImage").css("background-image", "url(" + encodeCSS(oBackgroundImage) + ")");
		jQuery("#" + id + "-next-feedTileTitle").html(encodeXML(oNextItem.getTitle()));
		jQuery("#" + id + "-next-feedTileSource").html(encodeXML(oNextItem.getSource()));
		jQuery("#" + id + "-next-feedTileAge").html(encodeXML(FeedItemUtils.calculateFeedItemAge(oNextItem.getPublicationDate())));

		return this;
	};

	/**
	 * Flip ids of feedTileImage, feedTileText, feedTileTitle, feedTileSource, feedTileAge.
	 * @param {jQuery} $oToFeed Feed object to flip to
	 * @param {jQuery} $oFromFeed Feed object to flip from
	 * @private
	 */
	FeedTile.prototype.flipIds = function ($oToFeed, $oFromFeed) {
		var id = this.getId();
		$oFromFeed.attr("id", id + "-next-feedTileImage");
		$oFromFeed.find("#" + id + "-feedTileText").attr("id", id + "-next-feedTileText");
		$oFromFeed.find("#" + id + "-feedTileTitle").attr("id", id + "-next-feedTileTitle");
		$oFromFeed.find("#" + id + "-feedTileSource").attr("id", id + "-next-feedTileSource");
		$oFromFeed.find("#" + id + "-feedTileAge").attr("id", id + "-next-feedTileAge");

		$oToFeed.attr("id", id + "-feedTileImage");
		$oToFeed.find("#" + id + "-next-feedTileText").attr("id", id + "-feedTileText");
		$oToFeed.find("#" + id + "-next-feedTileTitle").attr("id", id + "-feedTileTitle");
		$oToFeed.find("#" + id + "-next-feedTileSource").attr("id", id + "-feedTileSource");
		$oToFeed.find("#" + id + "-next-feedTileAge").attr("id", id + "-feedTileAge");
	};

	FeedTile.prototype.setDisplayDuration = function (iDisplayDuration) {
		if (iDisplayDuration < 3) {
			iDisplayDuration = 3;
			Log.error("FeedTile: displayDuration should be equal or more than 3 seconds.");
		}
		this.setProperty("displayDuration", iDisplayDuration);

		return this;
	};


	/**
	 * Set a new model of feed items, such as when a feed aggregator has collected the latest feed items. This model is staged (not immediately set on the control) to avoid
	 * re-rendering before the currently displayed article is faded out. Therefore a smooth transition between the display of feed items is always maintained.
	 *
	 * @param {sap.ui.model.Model} oModel Model of new feed items.
	 * @public
	 */
	FeedTile.prototype.stageModel = function (oModel) {
		this._stagedModel = oModel;
	};

	/**
	 * This function gets the image to display from the list of default images. If it is the first time, it gets a random image. Next times, it cycles through
	 * the list.
	 * @returns {sap.ui.core.URI} The default image URI
	 * @private
	 */
	FeedTile.prototype.getDefaultImage = function () {
		var oDefaultImage = "";
		var oDefaultImages = this.getDefaultImages();

		if (oDefaultImages && oDefaultImages.length > 0) {
			var iLength = oDefaultImages.length;
			if (this._defaultImageIndex === -1) { //this is first time, select random image

				var iRandom = Math.floor(Math.random() * iLength);
				this._defaultImageIndex = iRandom;
				oDefaultImage = oDefaultImages[iRandom];
			} else { //this is not the first time, get the next image from list
				var iIndex = (this._defaultImageIndex + 1) >= iLength ? 0 : this._defaultImageIndex + 1;
				this._defaultImageIndex = iIndex;
				oDefaultImage = oDefaultImages[iIndex];
			}
		}
		return oDefaultImage;
	};

	/**
	 * Validate the array of URI first and then set the defaultImages property
	 *
	 * @param {sap.ui.core.URI[]} oDefaultImages Default image URIs
	 * @public
	 */
	FeedTile.prototype.setDefaultImages = function (oDefaultImages) {
		if (oDefaultImages && oDefaultImages.length > 0) {

			var oValidDefaultImages = [];
			var oDefaultImage = null;
			for (var i = 0; i < oDefaultImages.length; i++) {
				oDefaultImage = oDefaultImages[i];
				var validUrl = URLListValidator.validate(oDefaultImage);

				if (validUrl) {
					oValidDefaultImages.push(oDefaultImage);
				} else {
					Log.error("Invalid Url:'" + oDefaultImage);
				}
			}

			if (oValidDefaultImages.length <= 0) {
				Log.error("Default Images are not set because supplied Urls are invalid");
			} else {
				this.setProperty("defaultImages", oValidDefaultImages);
			}
		}

		return this;
	};

	return FeedTile;
});
