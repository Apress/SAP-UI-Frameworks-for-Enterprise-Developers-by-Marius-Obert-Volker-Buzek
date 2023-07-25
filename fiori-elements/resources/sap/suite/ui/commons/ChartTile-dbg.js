/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'./InfoTile',
	'./ChartTileRenderer'
], function(InfoTile, ChartTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new ChartTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is the implementation of the InfoTile to show a comparison or bullet chart.
	 * @extends sap.suite.ui.commons.InfoTile
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.GenericTile.
	 * @alias sap.suite.ui.commons.ChartTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ChartTile = InfoTile.extend("sap.suite.ui.commons.ChartTile", /** @lends sap.suite.ui.commons.ChartTile.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * The percent sign, the currency symbol, or the unit of measure.
				 */
				unit: { type: "string", group: "Misc", defaultValue: null }
			}
		}
	});

	ChartTile.prototype.init = function() {
		InfoTile.prototype.init.apply(this);
	};

	ChartTile.prototype.onAfterRendering = function() {
		this._addDescriptionMargin();
	};

	ChartTile.prototype.onBeforeRendering = function() {
		this._setContentProperty("size", this.getSize());
	};

	/**
	 * Calculates and sets negative margin and padding of the description div element accordingly to the width of the unit of measure div element.
	 *
	 * @private
	 */
	ChartTile.prototype._addDescriptionMargin = function() {
		if (this.getDescription() && this.getUnit()) {
			var $Description = this.$("description").hide();
			var iWidth = this.$("unit").outerWidth() + 1; // add 1 to eliminate rounding issue in IE
			$Description.css("margin-right", "-" + iWidth + "px").css("padding-right", iWidth + "px").show();
		}
	};

	ChartTile.prototype._setContentProperty = function(sProp, sValue) {
		var oCnt = this.getContent();
		if (oCnt) {
			oCnt.setProperty(sProp, sValue);
		}
	};

	return ChartTile;
});
