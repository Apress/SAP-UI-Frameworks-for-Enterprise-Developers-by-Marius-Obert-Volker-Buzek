sap.ui.define([
	"./HistoryItem",
	"sap/base/assert"
], function(HistoryItem, assert) {
	"use strict";

	/**
	 * Constructor for a new FlipHistoryItem.
	 *
	 * @param {object} mProperties Property bag
	 * @param {boolean} mProperties.vertical Whether vertical flip has been performed
	 * @param {boolean} mProperties.horizontal Whether horizontal flip has been performed
	 *
	 * @class Holds information about an {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history item
	 * that was created by one of the flip methods, such as {@link sap.suite.ui.commons.imageeditor.ImageEditor#flipVertical},
	 * {@link sap.suite.ui.commons.imageeditor.ImageEditor#flipHorizontal}, and {@link sap.suite.ui.commons.imageeditor.ImageEditor#flip}.
	 *
	 * @extends sap.suite.ui.commons.imageeditor.HistoryItem
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.66.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.imageeditor.FlipHistoryItem
	 */
	var FlipHistoryItem = HistoryItem.extend("sap.suite.ui.commons.imageeditor.FlipHistoryItem", {
		constructor: function(mProperties) {
			HistoryItem.apply(this, arguments);

			mProperties = mProperties || {};

			assert(typeof mProperties.vertical === "boolean", "Vertical must be a boolean.");
			assert(typeof mProperties.horizontal === "boolean", "Horizontal value must be a bolean.");

			this._bVertical = mProperties.vertical;
			this._bHorizontal = mProperties.horizontal;
		}
	});

	FlipHistoryItem.prototype.getVertical = function() {
		return this._bVertical;
	};

	FlipHistoryItem.prototype.getHorizontal = function() {
		return this._bHorizontal;
	};

	FlipHistoryItem.prototype.compare = function(oHistoryItem) {
		return false;
	};


	return FlipHistoryItem;
});
