/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides control sap.suite.ui.commons.TileContent2X2.
sap.ui.define(['./library', 'sap/ui/core/Control', './TileContent2X2Renderer'],
	function(library, Control, TileContent2X2Renderer) {
	"use strict";

	/**
	 * Constructor for a new TileContent2X2.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control serves a universal container for different types of content and footer.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.34.
	 * Deprecated.
	 * @alias sap.suite.ui.commons.TileContent2X2
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TileContent2X2 = Control.extend("sap.suite.ui.commons.TileContent2X2", /** @lends sap.suite.ui.commons.TileContent2X2.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The footer text of the tile.
				 */
				footer: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Updates the size of the tile. If not set then the default size is applied based on the device tile.
				 */
				size: {type: "sap.suite.ui.commons.InfoTileSize", group: "Misc", defaultValue: "Auto"},

				/**
				 * The percent sign, the currency symbol, or the unit of measure.
				 */
				unit: {type: "string", group: "Misc", defaultValue: null},

				/**
				 * Disables control if true.
				 */
				disabled: {type: "boolean", group: "Misc", defaultValue: false}
			},
			aggregations: {
				/**
				 * The switchable view that depends on the tile type.
				 */
				content: {type: "sap.ui.core.Control", multiple: false}
			}
		}
	});

	TileContent2X2.prototype.init = function() {
		this._oDelegate = {
			onAfterRendering: function(oEvent) {
				oEvent.srcControl.$().removeAttr("tabindex");
			}
		};
	};

	TileContent2X2.prototype._getContentType = function() {
		if (this.getContent()) {
			var sContentType = this.getContent().getMetadata().getName();
			if (sContentType === "sap.suite.ui.commons.NewsContent") {
				return "News";
			}
		}
	};

	TileContent2X2.prototype.onAfterRendering = function() {
		var oContent = this.getContent();
		var thisRef = this.$();
		if (!thisRef.attr("title")) {
			var sCntTooltip = oContent.getTooltip_AsString();
			var aTooltipEments = thisRef.find("*");
			aTooltipEments.removeAttr("title");
			var oCntTooltip = sCntTooltip ? sCntTooltip : "";
			thisRef.attr("title", oCntTooltip + "\n" + this._getFooterText());
		}

	};

	TileContent2X2.prototype._getFooterText = function() {
		var sFooter = this.getFooter();
		var sUnit = this.getUnit();
		return sUnit //eslint-disable-line
			? (sap.ui.getCore().getConfiguration().getRTL()
				? ((sFooter ? sFooter + " ," : "") + sUnit)
				: (sUnit + (sFooter ? ", " + sFooter : "")))
			: sFooter;
	};

	TileContent2X2.prototype.onBeforeRendering = function() {
		if (this.getContent()) {
			if (this.getDisabled()) {
				this.getContent().addDelegate(this._oDelegate);
			} else {
				this.getContent().removeDelegate(this._oDelegate);
			}
		}
	};

	TileContent2X2.prototype.setContent = function(oObject, bSuppressInvalidate) {
		if (this.getContent()) {
			this.getContent().removeDelegate(this._oDelegate);
		}
		this.setAggregation("content", oObject, bSuppressInvalidate);

		return this;
	};

	TileContent2X2.prototype.getAltText = function() {
		var sAltText = "";
		var oContent = this.getContent();
		if (oContent && oContent.getAltText) {
			sAltText += oContent.getAltText();
		} else if (oContent && oContent.getTooltip_AsString()) {
			sAltText += oContent.getTooltip_AsString();
		}
		return sAltText;
	};

	return TileContent2X2;
});
