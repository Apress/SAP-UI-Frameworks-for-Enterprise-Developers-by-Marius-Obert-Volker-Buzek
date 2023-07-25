/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ThingCollection.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/core/Control',
	'sap/ui/commons/Link',
	'sap/ui/commons/library',
	"sap/ui/events/jquery/EventSimulation",
	"./ThingCollectionRenderer"
], function (jQuery, library, Control, Link, CommonsLibrary, EventSimulation, ThingCollectionRenderer) {
	"use strict";

	/**
	 * Constructor for a new ThingCollection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control contains a collection of the sap.ui.ux3.ThingViewer controls or descendants of sap.ui.ux3.ThingViewer. It allows you to navigate through them as well as delete them from the collection.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.ThingCollection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ThingCollection = Control.extend("sap.suite.ui.commons.ThingCollection", /** @lends sap.suite.ui.commons.ThingCollection.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The width of the control.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '100%'},

				/**
				 * The height of the control.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '100%'},

				/**
				 * The minimal width of the control.
				 */
				minWidth: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: null},

				/**
				 * The minimal height of the control.
				 */
				minHeight: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: null}
			},
			aggregations: {
				/**
				 * Contains a collection of sap.ui.ux3.ThingViewer controls or descendants of sap.ui.ux3.ThingViewer.
				 */
				content: {type: "sap.ui.ux3.ThingViewer", multiple: true, singularName: "content"}
			}
		}
	});

	ThingCollection.prototype.init = function () {
		this._iCenterNum = 0;
		this._bScrollDisabled = false;
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		this._oRemoveButton = new Link({
			id: this.getId() + "-remove-button",
			tooltip: this._rb.getText("THINGCOLLECTION_BUTTON_REMOVE_TOOLTIP"),
			press: [this._removeCenterContent, this]
		});
		this._oRemoveButton.addStyleClass("sapUiUx3OverlayCloseButton");

		this._initTouchEvents();
	};

	ThingCollection.prototype.exit = function () {
		this._oRemoveButton.destroy();
	};

	ThingCollection.prototype.onBeforeRendering = function () {
		this._oCenterControl = this.getContent()[this._iCenterNum] || null;
	};

	ThingCollection.prototype.onAfterRendering = function () {
		var that = this; //eslint-disable-line

		jQuery(document.getElementById(this.getId() + "-nav-prev")).on("click", function () {
			that.shiftPrev();
		});
		jQuery(document.getElementById(this.getId() + "-nav-next")).on("click", function () {
			that.shiftNext();
		});

		this._updateArrows();

		if (this.getContent().length <= 1) {
			this._hideRemoveButton();
		}

		jQuery(document.getElementById(this._oRemoveButton.getId())).attr("role", "button");
		jQuery(document.getElementById(this._oRemoveButton.getId())).attr("aria-disabled", "false");
	};

	ThingCollection.prototype.addContent = function (oContent) {
		this.addAggregation("content", oContent, true);
		this._updateArrows();
		this._showRemoveButton();
		return this;
	};

	ThingCollection.prototype.addNextContent = function (oContent) {
		this.insertAggregation("content", oContent, this._iCenterNum + 1, true);
		this._updateArrows();
		this._showRemoveButton();
		return this;
	};

	ThingCollection.prototype.shiftPrev = function () {
		if (this._isShiftPrevForbidden()) {
			return;
		}

		var that = this; //eslint-disable-line
		this._hideRemoveButton();
		this._bScrollDisabled = true;

		var sContainerId = "#" + this.getId() + "-container";
		var oPrevPanel = jQuery(sContainerId + ">.sapSuiteTcPrev");
		var oCenterPanel = jQuery(sContainerId + ">.sapSuiteTcCenter");
		var oNextPanel = jQuery(sContainerId + ">.sapSuiteTcNext");

		var oRm = sap.ui.getCore().createRenderManager();

		var sDirection = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
		this._iCenterNum--;
		var oDirection = {};
		oDirection[sDirection] = "+=110%";

		this._renderPrevPanel(oRm, this.getContent()[this._iCenterNum]);

		oCenterPanel.animate(oDirection, 800);

		oPrevPanel.animate(oDirection, 800, function () {
			oNextPanel.css(sDirection, "-110%");

			that._renderNextPanel(oRm);
			oRm.destroy();

			that._bScrollDisabled = false;
			that._updateArrows();
			that._showRemoveButton();
			jQuery(sContainerId).focus();
			oCenterPanel.show();
		});

		oPrevPanel.removeClass("sapSuiteTcPrev").addClass("sapSuiteTcCenter").attr("aria-hidden", "false");
		oCenterPanel.removeClass("sapSuiteTcCenter").addClass("sapSuiteTcNext").attr("aria-hidden", "true");
		oNextPanel.removeClass("sapSuiteTcNext").addClass("sapSuiteTcPrev");
	};

	ThingCollection.prototype.shiftNext = function () {
		if (this._isShiftNextForbidden()) {
			return;
		}

		var that = this; //eslint-disable-line
		this._hideRemoveButton();
		this._bScrollDisabled = true;

		var sContainerId = "#" + this.getId() + "-container";
		var oPrevPanel = jQuery(sContainerId + ">.sapSuiteTcPrev");
		var oCenterPanel = jQuery(sContainerId + ">.sapSuiteTcCenter");
		var oNextPanel = jQuery(sContainerId + ">.sapSuiteTcNext");

		var oRm = sap.ui.getCore().createRenderManager();

		var sDirection = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
		this._iCenterNum++;

		var oDirection = {};
		oDirection[sDirection] = "-=110%";

		this._renderNextPanel(oRm, this.getContent()[this._iCenterNum]);

		oCenterPanel.animate(oDirection, 800);

		oNextPanel.animate(oDirection, 800, function () {
			oPrevPanel.css(sDirection, "110%");

			that._renderPrevPanel(oRm);
			oRm.destroy();

			that._bScrollDisabled = false;
			that._updateArrows();
			that._showRemoveButton();
			jQuery(sContainerId).focus();
			oCenterPanel.show();
		});

		oPrevPanel.removeClass("sapSuiteTcPrev").addClass("sapSuiteTcNext");
		oCenterPanel.removeClass("sapSuiteTcCenter").addClass("sapSuiteTcPrev").attr("aria-hidden", "true");
		oNextPanel.removeClass("sapSuiteTcNext").addClass("sapSuiteTcCenter").attr("aria-hidden", "false");
	};

	ThingCollection.prototype.onsapprevious = function (oEvent) {
		this.shiftPrev();
		oEvent.preventDefault();
	};

	ThingCollection.prototype.onsapnext = function (oEvent) {
		this.shiftNext();
		oEvent.preventDefault();
	};

	ThingCollection.prototype._initTouchEvents = function () {
		if (EventSimulation.touchEventMode !== "OFF") {
			var that = this; //eslint-disable-line

			this.onswipeleft = function (oEvent) {
				oEvent.preventDefault();
				that.shiftNext();
			};
			this.onswiperight = function (oEvent) {
				oEvent.preventDefault();
				that.shiftPrev();
			};
		}
	};

	ThingCollection.prototype._removeCenterContent = function () {
		this._hideRemoveButton();
		this.removeAggregation("content", this.getContent()[this._iCenterNum], true);

		var that = this; //eslint-disable-line
		var iContentLength = this.getContent().length;

		var oCenterPanel = jQuery("#" + this.getId() + "-container>.sapSuiteTcCenter");
		oCenterPanel.hide(600);

		if (that._iCenterNum >= iContentLength) {
			that._iCenterNum = iContentLength;
			that.shiftPrev();
		} else {
			that._iCenterNum -= 1;
			that.shiftNext();
		}
	};

	ThingCollection.prototype._showRemoveButton = function () {
		if (this.getContent().length > 1) {
			jQuery(document.getElementById(this.getId() + "-remove-button")).show();
		}
	};

	ThingCollection.prototype._hideRemoveButton = function () {
		jQuery(document.getElementById(this.getId() + "-remove-button")).hide();
	};

	ThingCollection.prototype._updateArrows = function () {
		var oNavPrev = jQuery(document.getElementById(this.getId() + "-nav-prev"));
		var oNavNext = jQuery(document.getElementById(this.getId() + "-nav-next"));
		var sPrevTooltip = "";
		var sNextTooltip = "";

		if (this._isShiftPrevForbidden()) {
			oNavPrev.removeClass("sapSuiteTcNavPrevArrow");
		} else {
			oNavPrev.addClass("sapSuiteTcNavPrevArrow");
			sPrevTooltip = this._rb.getText("THINGCOLLECTION_BUTTON_PREVIOUS_TOOLTIP");
		}
		oNavPrev.attr("title", sPrevTooltip);

		if (this._isShiftNextForbidden()) {
			oNavNext.removeClass("sapSuiteTcNavNextArrow");
		} else {
			oNavNext.addClass("sapSuiteTcNavNextArrow");
			sNextTooltip = this._rb.getText("THINGCOLLECTION_BUTTON_NEXT_TOOLTIP");
		}
		oNavNext.attr("title", sNextTooltip);
	};

	ThingCollection.prototype._isShiftPrevForbidden = function () {
		return this._bScrollDisabled || (this._iCenterNum <= 0);
	};

	ThingCollection.prototype._isShiftNextForbidden = function () {
		return this._bScrollDisabled || (this._iCenterNum >= this.getContent().length - 1);
	};

	ThingCollection.prototype._renderPrevPanel = function (oRm, oControl) {
		this._renderPanel(oRm, oControl, true);
	};

	ThingCollection.prototype._renderNextPanel = function (oRm, oControl) {
		this._renderPanel(oRm, oControl, false);
	};

	ThingCollection.prototype._renderPanel = function (oRm, oControl, bLeft) {
		var sPanelSelector = "#" + this.getId() + "-container>" + (bLeft ? ".sapSuiteTcPrev" : ".sapSuiteTcNext");
		var oPanel = jQuery(sPanelSelector);

		if (oPanel.length > 0) {
			if (oControl) {
				oRm.renderControl(oControl);
			} else {
				oRm.write("");
			}
			oRm.flush(oPanel[0]);
		}
	};

	return ThingCollection;
});
