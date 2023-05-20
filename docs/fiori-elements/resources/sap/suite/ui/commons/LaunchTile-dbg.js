/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([ 'sap/ui/core/Control', 'sap/m/library', './LaunchTileRenderer' ], function(Control, MobileLibrary, LaunchTileRenderer) {
	"use strict";

	/**
	 * Constructor for a new LaunchTile.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control launches a URL.
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.25.
	 * Deprecated.
	 * @alias sap.suite.ui.commons.LaunchTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var LaunchTile = Control.extend("sap.suite.ui.commons.LaunchTile", /** @lends sap.suite.ui.commons.LaunchTile.prototype */ {
		metadata: {
			deprecated: true,
			library: "sap.suite.ui.commons",
			properties: {
				/**
				 * Descriptive title of the launch destination.
				 */
				title: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Icon associated with the launch destination.
				 */
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },

				/**
				 * The launch destination.
				 */
				link: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null }
			},
			events: {

				/**
				 * The event fired when the user clicks on the control.
				 */
				press: {}
			}
		}
	});

	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	LaunchTile.prototype.exit = function() {

		if (this._iconImage) {
			this._iconImage.destroy();
			this._iconImage = undefined;
		}

	};

	LaunchTile.prototype.setIcon = function(sURI) {
		if(!sURI) {
			return this;
		}

		this.setProperty("icon", sURI, true);

		var sImgId = this.getId() + "-img";
		var sSize = "72px";

		var mProperties = {
			src: sURI,
			height: sSize,
			width: sSize,
			size: sSize
		};

		this._iconImage = MobileLibrary.ImageHelper.getImageControl(sImgId, this._iconImage, this, mProperties);

		return this;
	};

	/**
	 * Fire press event.
	 *
	 * @private
	 */
	LaunchTile.prototype.onclick = function() {

		this.firePress({
			title: this.getTitle(),
			link: this.getLink()
		});

	};

	return LaunchTile;
});
