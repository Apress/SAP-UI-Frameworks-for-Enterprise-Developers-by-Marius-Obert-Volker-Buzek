/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.FacetOverview.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	'sap/m/Label',
	'sap/ui/core/ResizeHandler',
	"sap/ui/events/KeyCodes",
	"./FacetOverviewRenderer"
], function (jQuery, library, Control, IconPool, Device, Label, ResizeHandler, KeyCodes, FacetOverviewRenderer) {
	"use strict";

	/**
	 * Constructor for a new FacetOverview.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is used in UnifiedThingInspector to display the preview of the facet content.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.FacetOverview
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FacetOverview = Control.extend("sap.suite.ui.commons.FacetOverview", /** @lends sap.suite.ui.commons.FacetOverview.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * This property is shown in the upper left part of control.
				 */
				title: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Displays a label with the number of items in the right part of the control.
				 */
				quantity: {type: "int", group: "Misc", defaultValue: -1},

				/**
				 * Defines the width of the control. By default, the value is empty and the control inhertis the size from its content.
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: 'auto'},

				/**
				 * Defines the height of the control only if the heightType prperty is set to None. Must be set in rems for the correct work in the UnifiedThingInspector.
				 * @deprecated Since version 1.17.1.
				 * This property was replaced by heightType property.
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '10rem', deprecated: true},

				/**
				 * Defines the number of rows that the control represents in an external layout.
				 * @deprecated Since version 1.17.1.
				 * It is not used any more for the laoyut calculations in UnifiedThingInspector.
				 */
				rowSpan: {type: "int", group: "Misc", defaultValue: 1, deprecated: true},

				/**
				 * Indicates the height of the control in the predifened values. If set to None, then the height is defined by the depricated height property.
				 */
				heightType: {
					type: "sap.suite.ui.commons.FacetOverviewHeight",
					group: "Misc",
					defaultValue: "None"
				}
			},
			aggregations: {

				/**
				 * The content that appears in the left part of the control.
				 */
				content: {type: "sap.ui.core.Control", multiple: false}
			},
			events: {

				/**
				 * The event is fired when the user chooses the control. Provides an event with parameter id, the ID of the chosen control.
				 */
				press: {
					parameters: {

						/**
						 * The control ID.
						 */
						id: {type: "string"}
					}
				},

				/**
				 * This event is fired when a new value to the heightType or height property is set.
				 */
				heightChange: {}
			}
		}
	});

	FacetOverview.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");

		if (Device.system.desktop) {
			this._oHoverIcon = IconPool.createControlByURI({
				id: this.getId() + "-hover-icon-img",
				src: "sap-icon://slim-arrow-right"
			});
		} else {
			//Listen to orientation change to recalculate max-width value for title and qty fields.
			//sap.ui.core.ResizeHandler.register is not called on orientation change. It works only on desktops.
			Device.orientation.attachHandler(function (oEvent) {
				this._updateTitleMaxWidth(oEvent);
			}, this);
		}

		this._oNoDataLabel = new Label(this.getId() + "-no-content", {
			text: this._rb.getText("FACETOVERVIEW_NO_ITEMS_TEXT")
		});

	};

	FacetOverview.prototype.exit = function () {
		if (this._oHoverIcon) {
			this._oHoverIcon.destroy();
		}

		ResizeHandler.deregister(this._sTitleResizeHandlerId);
		Device.orientation.detachHandler(function () {
			this._updateTitleMaxWidth();
		}, this);

		this._oNoDataLabel.destroy();
	};

	FacetOverview.prototype._updateTitleMaxWidth = function (oE) {
		this._handleTitleResize();
	};

	FacetOverview.prototype._handleTitleResize = function () {
		var iTitleWidth = jQuery(document.getElementById(this.getId() + "-title")).width();
		if (this._iTitleWidth != iTitleWidth) {
			var iTitleTextMaxWidth = iTitleWidth - jQuery(document.getElementById(this.getId() + "-qty")).outerWidth() - 15;// width of the icon is always stable
			jQuery(document.getElementById(this.getId() + "-title-text")).css("max-width", iTitleTextMaxWidth + "px");
			this._iTitleWidth = iTitleWidth;
		}
	};

	FacetOverview.prototype.onAfterRendering = function () {
		//Listen for size changes only on desktop. Resize handler is not called on phones when changing orientation.
		if (Device.system.desktop) {
			if (this._sTitleResizeHandlerId) {
				ResizeHandler.deregister(this._sTitleResizeHandlerId);
			}
			var oTitle = this.getId() + "-title" ? window.document.getElementById(this.getId() + "-title") : null;
			this._sTitleResizeHandlerId = ResizeHandler.register(oTitle, jQuery.proxy(this._handleTitleResize, this));
		}

		this._handleTitleResize();

		if (Device.system.desktop) {
			this.$()[0].addEventListener("focusin", function (oEvent) {
				this.$().find("[data-tabindex]").attr("tabindex", function () {
					return this.getAttribute("data-tabindex");
				});
			}.bind(this), true);
			this.onsapfocusleave();
		}
	};

	FacetOverview.prototype.onclick = function (oEvent) {
		if (oEvent.srcControl.getMetadata().getName() != "sap.m.Link") {
			this.firePress({
				id: this.getId()
			});
		}
	};

	FacetOverview.prototype.onkeydown = function (oEvent) {
		if (oEvent.which == KeyCodes.ENTER) {
			this.onclick(oEvent);
		}
	};

	FacetOverview.prototype.onsapfocusleave = function (oEvent) {
		if (Device.system.desktop) {
			this.$().find("[data-tabindex]").removeAttr("data-tabindex");
			this.$().find("[tabindex]").attr("data-tabindex", function () {
				return this.getAttribute("tabindex");
			}).attr("tabindex", "-1");
		}
	};

	FacetOverview.prototype.onsaptouchstart = function (oEvent) {
		if (this.hasListeners("press")) {
			if (oEvent.srcControl.getMetadata().getName() != "sap.m.Link") {
				this.addStyleClass("sapSuiteFovSelected");
			}
		}
	};

	FacetOverview.prototype.onsaptouchend = function (oEvent) {
		if (this.hasListeners("press")) {
			this.removeStyleClass("sapSuiteFovSelected");
		}
	};

	FacetOverview.prototype.ontouchmove = function (oEvent) {
		if (this.hasListeners("press")) {
			this.removeStyleClass("sapSuiteFovSelected");
		}
	};

	//ontouchstart/ontouchend are generated on iOS devices. onsaptouchstart/end is not fired on them.
	FacetOverview.prototype.ontouchstart = function (oEvent) {
		if (this.hasListeners("press")) {
			if (oEvent.srcControl.getMetadata().getName() != "sap.m.Link") {
				this.addStyleClass("sapSuiteFovSelected");
			}
		}
	};

	FacetOverview.prototype.ontouchend = function (oEvent) {
		if (this.hasListeners("press")) {
			this.removeStyleClass("sapSuiteFovSelected");
		}
	};

	FacetOverview.prototype.ontouchmove = function (oEvent) {
		if (this.hasStyleClass("sapSuiteFovSelected")) {
			this.removeStyleClass("sapSuiteFovSelected");
		}
	};

	FacetOverview.prototype.getHeight = function () {
		switch (this.getHeightType()) {
			case library.FacetOverviewHeight.XS:
				return "4rem";
			case library.FacetOverviewHeight.S:
				return "6rem";
			case library.FacetOverviewHeight.M:
				return "10rem";
			case library.FacetOverviewHeight.L:
				return "14rem";
			case library.FacetOverviewHeight.XL:
				return "21rem";
			case library.FacetOverviewHeight.XXL:
				return "32rem";
			case library.FacetOverviewHeight.Auto:
				return "auto";
			case library.FacetOverviewHeight.None:
			default:
				return this.getProperty("height");
		}
	};

	FacetOverview.prototype.setHeight = function (sHeight) {
		this.setProperty("height", sHeight);
		this.fireHeightChange();
		return this;
	};

	FacetOverview.prototype.setHeightType = function (eHeightType) {
		this.setProperty("heightType", eHeightType);
		this.fireHeightChange();
		return this;
	};

	return FacetOverview;
});
