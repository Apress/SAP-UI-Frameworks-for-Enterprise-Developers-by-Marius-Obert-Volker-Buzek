sap.ui.define([
	"./HistoryItem",
	"sap/base/assert"
], function(HistoryItem, assert) {
	"use strict";

	/**
	 * Constructor for a new CropCustomShapeHistoryItem.
	 *
	 * @param {object} mProperties Property bag
	 * @param {int} mProperties.x X value
	 * @param {int} mProperties.y Y value
	 * @param {int} mProperties.width Width of the rectangle
	 * @param {int} mProperties.height Height of the rectangle
	 * @param {int} mProperties.oldWidth Previous width of the rectangle
	 * @param {int} mProperties.oldHeight Previous height of the rectangle
	 *
	 * @class Holds information about an {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history item
	 * that was created by the {@link sap.suite.ui.commons.imageeditor.ImageEditor#rectangleCrop} method.
	 *
	 * @extends sap.suite.ui.commons.imageeditor.HistoryItem
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 * @since 1.67.0
	 *
	 * @constructor
	 * @public
	 *
	 * @alias sap.suite.ui.commons.imageeditor.CropCustomShapeHistoryItem
	 */
	var CropCustomShapeHistoryItem = HistoryItem.extend("sap.suite.ui.commons.imageeditor.CropCustomShapeHistoryItem", {
		constructor: function(mProperties) {
			HistoryItem.apply(this, arguments);

			mProperties = mProperties || {};

			assert(typeof mProperties.x === "number", "X must be a number.");
			assert(typeof mProperties.y === "number", "Y must be a number.");
			assert(typeof mProperties.width === "number", "Width must be a number.");
			assert(typeof mProperties.height === "number", "Height value must be a number.");
			assert(typeof mProperties.oldWidth === "number", "Old width value must be a number.");
			assert(typeof mProperties.oldHeight === "number", "Old height value must be a number.");


			this._iX = mProperties.x;
			this._iY = mProperties.y;
			this._iWidth = mProperties.width;
			this._iHeight = mProperties.height;
			this._iOldWidth = mProperties.oldWidth;
			this._iOldHeight = mProperties.oldHeight;
		}
	});

	CropCustomShapeHistoryItem.prototype.getX = function() {
		return this._iX;
	};

	CropCustomShapeHistoryItem.prototype.getY = function() {
		return this._iY;
	};

	CropCustomShapeHistoryItem.prototype.getWidth = function() {
		return this._iWidth;
	};

	CropCustomShapeHistoryItem.prototype.getHeight = function() {
		return this._iHeight;
	};

	CropCustomShapeHistoryItem.prototype.getOldWidth = function() {
		return this._iOldWidth;
	};

	CropCustomShapeHistoryItem.prototype.getOldHeight = function() {
		return this._iOldHeight;
	};

	CropCustomShapeHistoryItem.prototype.compare = function(oHistoryItem) {
		var aMethods = ["getWidth", "getHeight"];

		return this._compare(oHistoryItem, aMethods);
	};

	return CropCustomShapeHistoryItem;
});
