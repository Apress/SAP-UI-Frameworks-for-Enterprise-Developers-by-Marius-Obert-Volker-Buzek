/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.ThreePanelThingViewer.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./library',
	'sap/ui/ux3/library',
	'sap/ui/commons/library',
	'./VerticalNavigationBar',
	'sap/ui/ux3/ThingViewer',
	'sap/ui/commons/Button',
	'sap/suite/ui/commons/ThreePanelThingViewerRenderer',
	"sap/ui/events/ControlEvents",
	"sap/ui/dom/containsOrEquals"
], function (jQuery, library, Ux3Library, CommonsLibrary, VerticalNavigationBar, ThingViewer, Button, ThreePanelThingViewerRenderer, ControlEvents, containsOrEquals) {
	"use strict";

	/**
	 * Constructor for a new ThreePanelThingViewer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control extends the sap.ui.ux3.ThingViewer control. The first panel can display a thing icon, a title, the Action Menu button, up to two rows of text descriptions (the first is wrapped, the second is truncated), vertical navigation bar (sap.suite.ui.commons.VerticalNavigationBar), and an image aka key visual. The second panel displays the header area as a vertical panel containing ThingGroup objects. The third panel is a main content area designed to display ThingGroup objects.
	 * @extends sap.ui.ux3.ThingViewer
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. Object page should be used instead.
	 * @alias sap.suite.ui.commons.ThreePanelThingViewer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ThreePanelThingViewer = ThingViewer.extend("sap.suite.ui.commons.ThreePanelThingViewer", /** @lends sap.suite.ui.commons.ThreePanelThingViewer.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * A URL of the source of an image known as key visual. This can be a company logo or other essential graphics.
				 */
				logo: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},

				/**
				 * Shows or hides a middle panel named Header that contains general information.
				 */
				showHeader: {type: "boolean", group: "Misc", defaultValue: null},

				/**
				 * The width of the first panel that contains thing's title, icon, key visual and navigation bar. The default value is "244px".
				 */
				sidebarWidth: {type: "sap.ui.core.CSSSize", group: "Misc", defaultValue: '244px'}
			},
			aggregations: {
				/**
				 * This aggregation allows you to add sap.ui.commons.Link items to the Action Menu. The menu appears as a popup when a user chooses a button in the top title section of the navigation panel.
				 */
				menuContent: {type: "sap.ui.commons.Link", multiple: true, singularName: "menuContent"}
			}
		}
	});

	ThreePanelThingViewer.prototype.init = function () {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		this._oNavBar = new VerticalNavigationBar();
		this.setAggregation("navBar", this._oNavBar);

		this._oNavBar.attachSelect(function (oControlEvent) {
			var item = oControlEvent.getParameters().item;
			if (this.fireFacetSelected({id: item.getId(), key: item.getKey(), item: item})) {
				this.setSelectedFacet(item);
			} else {
				oControlEvent.preventDefault();
			}
		}, this);

		this._iSelectedMenuItem = 0;
		this._oMenuButton = new Button({
			id: this.getId() + "-menu-button",
			tooltip: this._rb.getText("THREEPANELTHINGVIEWER_BUTTON_MENU_TOOLTIP"),
			lite: true,
			press: [this._toggleMenuPopup, this]
		});
		this._oMenuButton.addStyleClass("sapSuiteTvTitleMb");
		this.fAnyEventHandlerProxy = jQuery.proxy(this.onAnyEvent, this);
	};

	ThreePanelThingViewer.prototype.exit = function () {
		this._oMenuButton.destroy();
		ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
	};

	ThreePanelThingViewer.prototype.onAfterRendering = function () {
		this._bMenuOpened = false;
		this._updateMenuPopup();
		this._toggleHeaderContent();
	};

	ThreePanelThingViewer.prototype.selectDefaultFacet = function () {
		this._selectDefault();
		return this;
	};

	ThreePanelThingViewer.prototype._toggleMenuPopup = function () {
		jQuery(document.getElementById(this.getId() + "-menu-popup")).toggle();
		this._bMenuOpened = !this._bMenuOpened;

		if (this._bMenuOpened) {
			ControlEvents.bindAnyEvent(this.fAnyEventHandlerProxy);
			this.getMenuContent()[0].focus();
			this._iSelectedMenuItem = 0;
		} else {
			ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
		}
	};

	ThreePanelThingViewer.prototype._updateMenuPopup = function () {
		var iHeaderWidth = jQuery(document.getElementById(this.getId() + "-header")).width();
		var oMenuPopup = jQuery(document.getElementById(this.getId() + "-menu-popup"));
		var sStyle = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";
		var iSize = this.getMenuContent().length;

		oMenuPopup.css(sStyle, (iHeaderWidth - 22) + "px");
		oMenuPopup.children().each(function (index) {
			var $this = jQuery(this);
			$this.attr("tabindex", "-1");
			$this.attr("role", "menuitem");
			$this.attr("aria-posinset", index + 1);
			$this.attr("aria-setsize", iSize);
		});
	};

	ThreePanelThingViewer.prototype._rerenderFacetContent = function () {
		var $content = jQuery(document.getElementById(this.getId() + "-facetContent"));
		if ($content.length > 0) {
			var oRm = sap.ui.getCore().createRenderManager();
			ThreePanelThingViewerRenderer.renderFacetContent(oRm, this);
			oRm.flush($content[0]);
			oRm.destroy();
			this._resize = false;
			this._setTriggerValue();
			this._onresize();
		}
	};

	ThreePanelThingViewer.prototype._rerenderHeader = function () {
		var $content = jQuery(document.getElementById(this.getId() + "-header"));
		if ($content.length > 0) {
			var oRm = sap.ui.getCore().createRenderManager();
			ThreePanelThingViewerRenderer.renderHeader(oRm, this);
			oRm.flush($content[0]);
			oRm.destroy();
		}
	};

	ThreePanelThingViewer.prototype._rerenderHeaderContent = function () {
		var $content = jQuery(document.getElementById(this.getId() + "-headerContent"));
		if ($content.length > 0) {
			var oRm = sap.ui.getCore().createRenderManager();
			ThreePanelThingViewerRenderer.renderHeaderContent(oRm, this);
			oRm.flush($content[0]);
			oRm.destroy();
		}
	};

	ThreePanelThingViewer.prototype._toggleHeaderContent = function () {
		var oContent = jQuery(document.getElementById(this.getId() + "-headerContent"));
		if (this.getShowHeader()) {
			oContent.show();
		} else {
			oContent.hide();
		}
	};

	ThreePanelThingViewer.prototype.onAnyEvent = function (oEvent) {
		if (this._bMenuOpened && (oEvent.type === "mousedown" || oEvent.type === "focusin")) {
			var oSource = oEvent.target;
			var oDomRef = this.getId() + "-menu-popup" ? window.document.getElementById(this.getId() + "-menu-popup") : null;

			if (!containsOrEquals(oDomRef, oSource) || oSource.tagName === "BODY") {
				this._toggleMenuPopup();
			}
		}
	};

	ThreePanelThingViewer.prototype.onsapescape = function () {
		if (this._bMenuOpened) {
			this._toggleMenuPopup();
			this._oMenuButton.focus();
		}
	};

	ThreePanelThingViewer.prototype.onsapnext = function (oEvent) {
		if (this._bMenuOpened) {
			var aMenuContent = this.getMenuContent();
			this._iSelectedMenuItem++;

			if (this._iSelectedMenuItem >= aMenuContent.length) {
				this._iSelectedMenuItem = 0;
			}

			aMenuContent[this._iSelectedMenuItem].focus();
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	ThreePanelThingViewer.prototype.onsapprevious = function (oEvent) {
		if (this._bMenuOpened) {
			var aMenuContent = this.getMenuContent();
			this._iSelectedMenuItem--;

			if (this._iSelectedMenuItem < 0) {
				this._iSelectedMenuItem = aMenuContent.length - 1;
			}

			aMenuContent[this._iSelectedMenuItem].focus();
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	ThreePanelThingViewer.prototype.setShowHeader = function (bShowHeader) {
		this.setProperty("showHeader", bShowHeader, true);
		this._toggleHeaderContent();
		return this;
	};

	return ThreePanelThingViewer;
});
