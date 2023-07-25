/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.GenericTile2X2.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/m/Text',
	'sap/m/Image',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/core/Icon',
	'sap/ui/core/HTML',
	'sap/ui/Device',
	"sap/ui/events/KeyCodes",
	"sap/base/util/deepEqual",
	"./GenericTile2X2Renderer"
], function (jQuery, library, Text, Image, Control, IconPool, Icon, HTML, Device, KeyCodes, deepEqual, GenericTile2X2Renderer) {
	"use strict";

	/**
	 * Constructor for a new GenericTile2X2.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The tile control that displays the title, description, and customizable main area.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated.
	 * @alias sap.suite.ui.commons.GenericTile2X2
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GenericTile2X2 = Control.extend("sap.suite.ui.commons.GenericTile2X2", /** @lends sap.suite.ui.commons.GenericTile2X2.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The header of the tile.
				 */
				header: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * The subheader of the tile.
				 */
				subheader: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * The message that appears when the control is in the Failed state.
				 */
				failedText: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * The size of the tile. If not set, then the default size is applied based on the device tile.
				 */
				size: {
					type: "sap.suite.ui.commons.InfoTileSize",
					group: "Misc",
					defaultValue: "Auto"
				},

				/**
				 * The URI of the background image.
				 */
				backgroundImage: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * The image to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
				 */
				headerImage: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * The frame type: 1x1 or 2x1.
				 */
				frameType: {
					type: "sap.suite.ui.commons.FrameType",
					group: "Misc",
					defaultValue: "OneByOne"
				},

				/**
				 * The load status.
				 */
				state: {
					type: "sap.suite.ui.commons.LoadState",
					group: "Misc",
					defaultValue: "Loaded"
				},

				/**
				 * Description of a header image that is used in the tooltip.
				 */
				imageDescription: {type: "string", group: "Misc", defaultValue: null}
			},
			aggregations: {

				/**
				 * The switchable view that depends on the tile type.
				 */
				tileContent: {
					type: "sap.suite.ui.commons.TileContent2X2",
					multiple: true,
					singularName: "tileContent"
				},

				/**
				 * An icon or image to be displayed in the control.
				 */
				icon: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * The hidden aggregation for the title.
				 */
				titleText: {type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * The hidden aggregation for the message in the failed state.
				 */
				failedMessageText: {type: "sap.m.Text", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * The event is fired when the user chooses the tile.
				 */
				press: {}
			}
		}
	});

	GenericTile2X2.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		this._oTitle = new Text(this.getId() + "-title", {maxLines: 2});
		this._oTitle.addStyleClass("sapSuiteGTTitle");
		this._oTitle.cacheLineHeight = false;
		this.setAggregation("titleText", this._oTitle);

		this._sFailedToLoad = this._rb.getText("INFOTILE_CANNOT_LOAD_TILE");

		this._oFailed = new Text(this.getId() + "-failed-txt", {maxLines: 2});
		this._oFailed.cacheLineHeight = false;
		this._oFailed.addStyleClass("sapSuiteGTFailed");
		this.setAggregation("failedMessageText", this._oFailed);

		this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
			src: "sap-icon://notification",
			size: "1.37rem"
		});

		this._oWarningIcon.addStyleClass("sapSuiteGTFtrFldIcnMrk");

		this._oBusy = new HTML(this.getId() + "-overlay");
		this._oBusy.addStyleClass("sapSuiteGenericTile2X2Loading");
		this._oBusy.setBusyIndicatorDelay(0);
	};

	GenericTile2X2.prototype.ontap = function (oEvent) {
		if (Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	GenericTile2X2.prototype.onkeydown = function (oEvent) {
		if (oEvent.which == KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	GenericTile2X2.prototype.onkeyup = function (oEvent) {
		if (oEvent.which == KeyCodes.ENTER || oEvent.which == KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	GenericTile2X2.prototype._handleOvrlClick = function (oEvent) {
		oEvent.stopPropagation();
	};

	GenericTile2X2.prototype.onBeforeRendering = function () {
		var iTiles = this.getTileContent().length;

		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setDisabled(this.getState() === "Disabled", true);
		}

		var sCustomFailedMsg = this.getFailedText();
		var sFailedMsg = sCustomFailedMsg ? sCustomFailedMsg : this._sFailedToLoad;
		this._oFailed.setText(sFailedMsg);
		this._oFailed.setTooltip(sFailedMsg);
	};

	GenericTile2X2.prototype.onAfterRendering = function () {
		this._checkFooter(this.getState());

		if (this.getState() === "Disabled") {
			this._oBusy.$().on("tap", jQuery.proxy(this._handleOvrlClick, this));
		} else {
			this._oBusy.$().off("tap", this._handleOvrlClick);
		}
	};

	GenericTile2X2.prototype.getHeader = function () {
		return this._oTitle.getText();
	};

	GenericTile2X2.prototype.setHeader = function (sTitle) {
		this._oTitle.setProperty("text", sTitle, true);
		this.invalidate();
		return this;
	};

	GenericTile2X2.prototype.exit = function () {
		this._oWarningIcon.destroy();
		if (this._oImage) {
			this._oImage.destroy();
		}
		this._oBusy.destroy();
	};

	GenericTile2X2.prototype.setHeaderImage = function (sImage) {
		var bValueChanged = !deepEqual(this.getHeaderImage(), sImage);

		if (bValueChanged) {
			if (this._oImage) {
				this._oImage.destroy();
				this._oImage = undefined;
			}

			if (sImage) {
				this._oImage = IconPool.createControlByURI({
					id: this.getId() + "-icon-image",
					src: sImage
				}, Image);

				this._oImage.addStyleClass("sapSuiteGTHdrIconImage");
			}
		}
		return this.setProperty("headerImage", sImage);
	};

	GenericTile2X2.prototype.attachEvent = function (sEventId, oData, fnFunction, oListener) {
		Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);

		if (this.hasListeners("press") && this.getState() != "Disabled") {
			this.$().attr("tabindex", 0).addClass("sapSuiteUiCommonsPointer");
		}
		return this;
	};

	GenericTile2X2.prototype.setState = function (oState, isSuppressed) {
		this._checkFooter(oState);
		this.setProperty("state", oState, isSuppressed);
		return this;
	};

	GenericTile2X2.prototype._checkFooter = function (oState) {
		var oTcFtr = jQuery(document.getElementById(this.getId())).find(".sapSuiteTileCntFtrTxt");
		if (oState === "Failed" && oTcFtr.is(":visible")) {
			oTcFtr.hide();
		} else if (oTcFtr.is(":hidden")) {
			oTcFtr.show();
		}
	};

	GenericTile2X2.prototype.detachEvent = function (sEventId, fnFunction, oListener) {
		Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapSuiteUiCommonsPointer");
		}
		return this;
	};


	GenericTile2X2.prototype.onsaptouchstart = function (oEvent) {
		this.addStyleClass("sapSuiteGTHvrOutln");
	};

	GenericTile2X2.prototype.onsaptouchend = function (oEvent) {
		this.removeStyleClass("sapSuiteGTHvrOutln");
	};

	//ontouchstart/ontouchend are generated on iOS devices. onsaptouchstart/end is not fired on them.
	GenericTile2X2.prototype.ontouchstart = function (oEvent) {
		this.addStyleClass("sapSuiteGTHvrOutln");
	};

	GenericTile2X2.prototype.ontouchend = function (oEvent) {
		this.removeStyleClass("sapSuiteGTHvrOutln");
	};

	GenericTile2X2.prototype.getHeaderAltText = function () {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getHeader()) {
			sAltText += this.getHeader();
			bIsFirst = false;
		}

		if (this.getSubheader()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}

		if (this.getImageDescription()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getImageDescription();
		}
		return sAltText;
	};

	GenericTile2X2.prototype.getBodyAltText = function () {
		var sAltText = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();

		for (var i = 0; i < aTiles.length; i++) {
			if (aTiles[i].getAltText) {
				sAltText += (bIsFirst ? "" : "\n") + aTiles[i].getAltText();
				bIsFirst = false;
			} else if (aTiles[i].getTooltip_AsString()) {
				sAltText += (bIsFirst ? "" : "\n") + aTiles[i].getTooltip_AsString();
				bIsFirst = false;
			}
		}

		return sAltText;
	};

	GenericTile2X2.prototype.getAltText = function () {
		return this.getHeaderAltText() + "\n" + this.getBodyAltText();
	};

	return GenericTile2X2;
});
