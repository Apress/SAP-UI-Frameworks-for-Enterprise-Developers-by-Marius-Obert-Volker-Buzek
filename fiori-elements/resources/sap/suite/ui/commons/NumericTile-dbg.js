/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './InfoTile', './library', './NumericContent', './NumericTileRenderer'], function(InfoTile, library, NumericContent, NumericTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new NumericTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is the implementation of the InfoTile to show a numeric value.
	 * @extends sap.suite.ui.commons.InfoTile
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.GenericTile.
	 * @alias sap.suite.ui.commons.NumericTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NumericTile = InfoTile.extend("sap.suite.ui.commons.NumericTile", /** @lends sap.suite.ui.commons.NumericTile.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The actual value.
				 */
				value: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The scaling prefix. Financial characters can be used for currencies and counters. The SI prefixes can be used for units.
				 */
				scale: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The percent sign, the currency symbol, or the unit of measure.
				 */
				unit: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The semantic color of the value.
				 */
				valueColor: { type: "sap.suite.ui.commons.InfoTileValueColor", group: "Misc", defaultValue: null },

				/**
				 * The indicator arrow that shows value deviation.
				 */
				indicator: {
					type: "sap.suite.ui.commons.DeviationIndicator",
					group: "Misc",
					defaultValue: "None"
				}
			}
		}
	});

	NumericTile.prototype.init = function() {
		this._oTileCnt = new NumericContent(this.getId() + "-numeric-tile-cnt");
		this.setContent(this._oTileCnt);

		InfoTile.prototype.init.apply(this);
	};

	NumericTile.prototype.exit = function() {
		var oCnt = this.getContent();
		oCnt.destroy();
	};

	NumericTile.prototype.setScale = function(sText) {
		this._oTileCnt.setScale(sText);
		return this;
	};

	NumericTile.prototype.setValue = function(sText) {
		this._oTileCnt.setValue(sText);
		this.rerender();
		return this;
	};

	NumericTile.prototype.getScale = function() {
		return this._oTileCnt.getScale();
	};

	NumericTile.prototype.getValue = function() {
		return this._oTileCnt.getValue();
	};

	NumericTile.prototype.setSize = function(oSize) {
		this._oTileCnt.setSize(oSize);
		return this;
	};

	NumericTile.prototype.getSize = function() {
		return this._oTileCnt.getSize();
	};

	NumericTile.prototype.setValueColor = function(oValueColor) {
		this._oTileCnt.setValueColor(oValueColor);
		return this;
	};

	NumericTile.prototype.getValueColor = function() {
		return this._oTileCnt.getValueColor();
	};

	NumericTile.prototype.setIndicator = function(oIndicator) {
		this._oTileCnt.setIndicator(oIndicator);
		return this;
	};

	NumericTile.prototype.getIndicator = function() {
		return this._oTileCnt.getIndicator();
	};

	NumericTile.prototype.setState = function(oState) {
		this.setProperty("state", oState, false);
		this._oTileCnt.setState(oState);
		return this;
	};

	NumericTile.prototype.getState = function() {
		return this._oTileCnt.getState();
	};

	return NumericTile;
});
