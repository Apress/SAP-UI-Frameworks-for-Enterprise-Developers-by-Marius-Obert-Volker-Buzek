sap.ui.define([
	"./HistoryItem",
	"sap/base/assert"
], function(HistoryItem, assert) {
	"use strict";

	/**
	 * Constructor for a new RotateHistoryItem.
	 *
	 * @param {object} mProperties Property bag
	 * @param {int} mProperties.degrees Number of deegress
	 *
	 * @class Holds information about an {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history item
	 * that was created by the {@link sap.suite.ui.commons.imageeditor.ImageEditor#rotate} method.
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
	 * @alias sap.suite.ui.commons.imageeditor.RotateHistoryItem
	 */
	var RotateHistoryItem = HistoryItem.extend("sap.suite.ui.commons.imageeditor.RotateHistoryItem", {
		constructor: function(mProperties) {
			HistoryItem.apply(this, arguments);

			mProperties = mProperties || {};

			assert(typeof mProperties.degrees === "number", "Degrees must be a number.");

			this._iDegrees = mProperties.degrees;
		}
	});

	RotateHistoryItem.prototype.getDegrees = function() {
		return this._iDegrees;
	};

	RotateHistoryItem.prototype.compare = function() {
		return false;
	};

	return RotateHistoryItem;
});
