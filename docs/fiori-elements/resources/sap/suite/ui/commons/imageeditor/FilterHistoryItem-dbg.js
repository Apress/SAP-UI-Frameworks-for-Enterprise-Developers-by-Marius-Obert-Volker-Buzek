sap.ui.define([
	"./HistoryItem",
	"sap/base/assert"
], function(HistoryItem, assert) {
	"use strict";

	/**
	 * Constructor for a new FilterHistoryItem.
	 *
	 * @param {object} mProperties Property bag
	 * @param {string} mProperties.type Filter type
	 * @param {int} mProperties.value Filter value
	 * @param {string} mProperties.unit Filter unit
	 *
	 * @class Holds information about an {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history item
	 * that was created by one of the methods that apply filters to the image, such as
	 * {@link sap.suite.ui.commons.imageeditor.ImageEditor#sepia}, {@link sap.suite.ui.commons.imageeditor.ImageEditor#grayscale},
	 * {@link sap.suite.ui.commons.imageeditor.ImageEditor#saturate}, {@link sap.suite.ui.commons.imageeditor.ImageEditor#invert},
	 * {@link sap.suite.ui.commons.imageeditor.ImageEditor#brightness}, and {@link sap.suite.ui.commons.imageeditor.ImageEditor#contrast}.
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
	 * @alias sap.suite.ui.commons.imageeditor.FilterHistoryItem
	 */
	var FilterHistoryItem = HistoryItem.extend("sap.suite.ui.commons.imageeditor.FilterHistoryItem", {
		constructor: function(mProperties) {
			HistoryItem.apply(this, arguments);

			mProperties = mProperties || {};

			assert(typeof mProperties.type === "string", "Filter type must be a string.");
			assert(typeof mProperties.value === "number", "Filter value must be a number.");
			assert(typeof mProperties.unit === "string", "Filter unit must be a string.");

			this._sType = mProperties.type;
			this._iValue = mProperties.value;
			this._sUnit = mProperties.unit;
		}
	});

	/**
	 * Gets the type of the filter applied.
	 *
	 * @return {string} Type of the filter
	 * @public
	 */
	FilterHistoryItem.prototype.getType = function() {
		return this._sType;
	};

	/**
	 * Gets the filter value (its intensity).
	 *
	 * @return {int} Value of the filter
	 * @public
	 */
	FilterHistoryItem.prototype.getValue = function() {
		return this._iValue;
	};

	/**
	 * Gets the units of the filter value.
	 *
	 * @return {string} Unit of the filter
	 * @public
	 */
	FilterHistoryItem.prototype.getUnit = function() {
		return this._sUnit;
	};

	FilterHistoryItem.prototype.compare = function(oHistoryItem) {
		return false;
	};

	return FilterHistoryItem;
});
