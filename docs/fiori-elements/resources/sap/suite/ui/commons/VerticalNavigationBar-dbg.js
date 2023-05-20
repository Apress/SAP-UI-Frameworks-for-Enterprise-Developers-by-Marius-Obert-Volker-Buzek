/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.VerticalNavigationBar.
sap.ui.define([ "sap/ui/thirdparty/jquery", './library', 'sap/ui/ux3/library', 'sap/ui/ux3/NavigationBar', 'sap/ui/commons/library', 'sap/ui/commons/RichTooltip', "./VerticalNavigationBarRenderer" ],
	function(jQuery, library, Ux3Library, NavigationBar, CommonsLibrary, RichTooltip, VerticalNavigationBarRenderer) {
	"use strict";

	/**
	 * Constructor for a new VerticalNavigationBar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control extends the sap.ui.ux3.NavigationBar and
	 * allows you to display navigation items vertically. The navigation list
	 * can contain sap.ui.ux3.NavigationItem or
	 * sap.suite.ui.commons.CountingNavigationItem controls.
	 * @extends sap.ui.ux3.NavigationBar
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.32.
	 * Deprecated. sap.uxap.ObjectPageLayout should be used instead.
	 * @alias sap.suite.ui.commons.VerticalNavigationBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VerticalNavigationBar = NavigationBar.extend("sap.suite.ui.commons.VerticalNavigationBar", /** @lends sap.suite.ui.commons.VerticalNavigationBar.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons"
		}
	});

	VerticalNavigationBar.prototype.init = function() {
		NavigationBar.prototype.init.apply(this);
		if (!this._oResBundle) {
			this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");
		}
	};

	VerticalNavigationBar.prototype._handleActivation = function(oEvent) {
		// add forwarding to parent since IE doesn't support 'pointer-events:none;'
		if (oEvent.target.tagName === "SPAN") {
			oEvent.target = oEvent.target.parentElement;
		}
		NavigationBar.prototype._handleActivation.call(this, oEvent);
	};

	VerticalNavigationBar.prototype.onAfterRendering = function() {
		NavigationBar.prototype.onAfterRendering.apply(this);

		if (!this._oBarItemsMap) {
			this._oBarItemsMap = {};
		}

		var that = this; //eslint-disable-line

		jQuery(".sapSuiteTvNavBarItemLink").on("mousemove", function() {
			that._showTooltip(jQuery(this).attr("id"));
		}).on("mouseleave", function(oEvent) {
			that._hideTooltip(jQuery(this).attr("id"));
		});
	};

	VerticalNavigationBar.prototype.exit = function() {
		this._oBarItemsMap = null;
		NavigationBar.prototype.exit.apply(this);
	};

	VerticalNavigationBar.prototype._handleScroll = function() {};

	VerticalNavigationBar.prototype._showTooltip = function(sTargetId) {
		var oItem = this._oBarItemsMap[sTargetId];
		if (!oItem) {
			oItem = sap.ui.getCore().byId(sTargetId);

			if (oItem) {
				this._oBarItemsMap[sTargetId] = oItem;

				var oTooltip = new RichTooltip({
					text: oItem.getTooltip_AsString() || oItem.getText()
				});

				oTooltip.addStyleClass("sapSuiteTvNavBarItemTltp");

				oTooltip._currentControl = oItem;
				oItem.addDelegate(oTooltip);
				oItem.setAggregation("tooltip", oTooltip, true);
			}
		}

		if (oItem && !oItem.doOpen) {
			oItem.doOpen = true;
			oItem.openTimer = setTimeout(function() {
				oItem.getTooltip().openPopup(oItem);

				oItem.closeTimer = setTimeout(function() {
					oItem.getTooltip().closePopup();
					oItem.doOpen = false;
				}, 10000);
			}, 2000);
		}
	};

	VerticalNavigationBar.prototype._hideTooltip = function(sTargetId) {
		var oItem = this._oBarItemsMap[sTargetId];
		if (oItem) {
			oItem.doOpen = false;
			clearTimeout(oItem.openTimer);
			clearTimeout(oItem.closeTimer);
			oItem.getTooltip().closePopup();
		}
	};

	return VerticalNavigationBar;
});