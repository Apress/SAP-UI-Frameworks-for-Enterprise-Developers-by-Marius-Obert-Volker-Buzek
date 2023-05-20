/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'sap/m/Image',
	'sap/ui/core/Control',
	'sap/m/Text',
	'sap/ui/core/library',
	'./PictureZoomInRenderer'
], function(jQuery, Image, Control, Text, CoreLibrary, PictureZoomInRenderer) {
	"use strict";

	/**
	 * Constructor for a new PictureZoomIn.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Shows picture in fullscreen.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated. Not Fiori.
	 * @alias sap.suite.ui.commons.PictureZoomIn
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PictureZoomIn = Control.extend("sap.suite.ui.commons.PictureZoomIn", /** @lends sap.suite.ui.commons.PictureZoomIn.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * Description is shown under image.
				 */
				description: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Source for image.
				 */
				imageSrc: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null }
			},
			aggregations: {

				/**
				 * Custom busy indicator.
				 */
				busyIndicator: { type: "sap.ui.core.Control", multiple: false }
			}
		}
	});

	PictureZoomIn.prototype.init = function() {
		var that = this; //eslint-disable-line
		jQuery(window).resize(function(eO) {
			that._calculateImg();
		});

		jQuery(document).on("keyup", function(e) {
			if (e.keyCode === 27) {
				that.exit();
				jQuery(document.getElementById(that.getId())).remove();
			}
		});

		if (typeof jQuery(document).tap === "function") {
			jQuery(document).tap(function() {
				that.exit();
				jQuery(document.getElementById(that.getId())).remove();
			});
		}

		this._oImage = new Image(this.getId() + "-image", {}).addStyleClass("sapSuiteUiCommonsPictureZoomInImg");

		this._oDescription = new Text(this.getId() + "-description", {
			textAlign: CoreLibrary.TextAlign.Center
		});
		this._oDescription.addStyleClass("sapSuiteUiCommonsPictureZoomInDesc");
	};

	PictureZoomIn.prototype.onBeforeRendering = function() {
		this._oImage.setSrc(this.getImageSrc());
		this._oDescription.setText(this.getDescription());
	};

	PictureZoomIn.prototype._calculateImg = function() {
		var oImg = this.getId() + "-image" ? window.document.getElementById(this.getId() + "-image") : null;
		var oDesc = jQuery(document.getElementById(this.getId() + "-description"));
		if (!oImg) {
			return;
		}
		var oWindow = jQuery(document.getElementById(this.getId()));
		if (oImg.naturalWidth < oWindow.width() && oImg.naturalHeight < oWindow.height() - oDesc.outerHeight(true)) {
			oImg.style.width = oImg.naturalWidth + "px";
			oImg.style.height = oImg.naturalHeight + "px";
		} else if (oImg.naturalHeight / (oWindow.height() - oDesc.outerHeight(true)) > oImg.naturalWidth / oWindow.width()) {
			oImg.style.height = "" + (98 - oDesc.outerHeight(true) * 100 / oWindow.height()) + "%";
			oImg.style.width = "auto";
		} else {
			oImg.style.width = '96%';
			oImg.style.height = 'auto';
		}

		//recalculate left position of image so it is centered in div.
		var oImage = jQuery(document.getElementById(this.getId() + "-image"));
		var iWindowWidth = oWindow.width();
		var iImageWidth = oImage.width();
		var iImageHeight = oImage.height();
		if (iWindowWidth >= iImageWidth) {
			oImage.css("left", ((iWindowWidth - iImageWidth) / 2) + "px");
		}

		//calculate top position for image and description
		var iImageTop = (oWindow.height() - iImageHeight - oDesc.outerHeight(true)) / 2;
		oImage.css("top", iImageTop + "px");
		oDesc.css("top", iImageTop + "px");
	};

	PictureZoomIn.prototype.onAfterRendering = function() {
		var that = this; //eslint-disable-line
		var oImage = jQuery(document.getElementById(this.getId() + "-image"));
		var oBusy = jQuery(document.getElementById(this.getId() + "-busy"));    // there is a custom busy indicator rendered

		oImage.hide();

		if (oBusy.length) {
			oBusy.show();
		} else {
			this.setBusy(true);
		}

		//subscribe for image load to recalculate positions of image, description.
		oImage.onload = function() {
			if (oBusy.length) {
				oBusy.hide();
			} else {
				that.setBusy(false);
			}

			oImage.show();
			that._calculateImg();
		};
	};

	PictureZoomIn.prototype.exit = function() {
		if (this._oImage) {
			this._oImage.destroy();
		}
		if (this._oDescription) {
			this._oDescription.destroy();
		}
	};

	return PictureZoomIn;
});
