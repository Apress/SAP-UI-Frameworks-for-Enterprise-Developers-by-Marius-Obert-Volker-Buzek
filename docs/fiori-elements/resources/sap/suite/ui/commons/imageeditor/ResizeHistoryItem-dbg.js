sap.ui.define([
	"./HistoryItem",
	"sap/base/assert"
], function(HistoryItem, assert) {
	"use strict";

	/**
	 * Constructor for a new ResizeHistoryItem.
	 *
	 *
	 * @param {object} mProperties Property bag
	 * @param {int} mProperties.width Width of the image
	 * @param {int} mProperties.height Height of the image
	 * @param {int} mProperties.oldWidth Previous width of the image
	 * @param {int} mProperties.oldHeight Previous height of the image
	 *
	 * @class Holds information about an {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history item
	 * that was created by one of the methods that change the size of the image, such as
	 * {@link sap.suite.ui.commons.imageeditor.ImageEditor#setSize}, {@link sap.suite.ui.commons.imageeditor.ImageEditor#setWidth},
	 * and {@link sap.suite.ui.commons.imageeditor.ImageEditor#setHeight}.
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
	 * @alias sap.suite.ui.commons.imageeditor.ResizeHistoryItem
	 */
	var ResizeHistoryItem = HistoryItem.extend("sap.suite.ui.commons.imageeditor.ResizeHistoryItem", {
		constructor: function(mProperties) {
			HistoryItem.apply(this, arguments);

			mProperties = mProperties || {};

			assert(typeof mProperties.width === "number", "Width must be a number.");
			assert(typeof mProperties.height === "number", "Height value must be a number.");
			assert(typeof mProperties.oldWidth === "number", "Old width value must be a number.");
			assert(typeof mProperties.oldHeight === "number", "Old height value must be a number.");

			this._iWidth = mProperties.width;
			this._iHeight = mProperties.height;
			this._iOldWidth = mProperties.oldWidth;
			this._iOldHeight = mProperties.oldHeight;
		}
	});

	ResizeHistoryItem.prototype.getWidth = function() {
		return this._iWidth;
	};

	ResizeHistoryItem.prototype.getHeight = function() {
		return this._iHeight;
	};

	ResizeHistoryItem.prototype.getOldWidth = function() {
		return this._iOldWidth;
	};

	ResizeHistoryItem.prototype.getOldHeight = function() {
		return this._iOldHeight;
	};

	ResizeHistoryItem.prototype.compare = function(oHistoryItem) {
		var aMethods = ["getWidth", "getHeight"];

		return this._compare(oHistoryItem, aMethods);
	};

	return ResizeHistoryItem;
});
