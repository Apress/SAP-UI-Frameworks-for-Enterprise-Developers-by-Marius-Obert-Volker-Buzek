/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ './InfoTile', './library', 'sap/suite/ui/commons/MonitoringContent', './MonitoringTileRenderer' ], function(InfoTile, library, MonitoringContent, MonitoringTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new MonitoringTile.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control is the implementation of the InfoTile to show a numeric value and an icon.
	 * @extends sap.suite.ui.commons.InfoTile
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * This control has been deprecated in favor of new sap.suite.ui.commons.GenericTile.
	 * @alias sap.suite.ui.commons.MonitoringTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MonitoringTile = InfoTile.extend("sap.suite.ui.commons.MonitoringTile", /** @lends sap.suite.ui.commons.MonitoringTile.prototype */ {
		metadata: {

			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {

				/**
				 * The actual value.
				 */
				value: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * This property is set by the return value of sap.ui.core.IconPool.getIconURI that is called with an icon name parameter and optional collection parameter. The collection parameter is required when the application extended icons are used.
				 */
				iconSrc: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * The color of the tile footer text.
				 */
				footerColor: {
					type: "sap.suite.ui.commons.InfoTileTextColor",
					group: "Misc",
					defaultValue: "Positive"
				}
			}
		}
	});

	MonitoringTile.prototype.init = function() {
		this._oTileCnt = new MonitoringContent(this.getId() + "-monitoring-tile-cnt");
		this.setContent(this._oTileCnt);

		InfoTile.prototype.init.apply(this);
	};

	MonitoringTile.prototype.setScale = function(sText) {
		this._oTileCnt.setScale(sText);
		return this;
	};

	MonitoringTile.prototype.getScale = function() {
		return this._oTileCnt.getScale();
	};

	MonitoringTile.prototype.setValue = function(sText) {
		this._oTileCnt.setValue(sText);
		return this;
	};

	MonitoringTile.prototype.getValue = function() {
		return this._oTileCnt.getValue();
	};

	MonitoringTile.prototype.setSize = function(oSize) {
		this._oTileCnt.setSize(oSize);
		return this;
	};

	MonitoringTile.prototype.getSize = function() {
		return this._oTileCnt.getSize();
	};

	MonitoringTile.prototype.setState = function(oState) {
		this._oTileCnt.setProperty("state", oState, true);
		this.setProperty("state", oState);

		return this;
	};

	MonitoringTile.prototype.getState = function() {
		return this._oTileCnt.getState();
	};

	MonitoringTile.prototype.setIconSrc = function(sIconSrc) {
		this._oTileCnt.setIconSrc(sIconSrc);
		return this;
	};

	MonitoringTile.prototype.getIconSrc = function() {
		return this._oTileCnt.getIconSrc();
	};

	return MonitoringTile;
});
