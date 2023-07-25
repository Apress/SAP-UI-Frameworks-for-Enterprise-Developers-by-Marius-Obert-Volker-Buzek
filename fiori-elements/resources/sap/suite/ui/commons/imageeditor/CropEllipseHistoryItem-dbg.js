sap.ui.define([
	"./HistoryItem",
	"sap/base/assert"
], function(HistoryItem, assert) {
	"use strict";

	/**
	 * Constructor for a new CropEllipseHistoryItem.
	 *
	 * @param {object} mProperties Property bag
	 * @param {int} mProperties.x X value
	 * @param {int} mProperties.y Y value
	 * @param {int} mProperties.rx X radius value
	 * @param {int} mProperties.ry Y radius value
	 * @param {int} mProperties.width Width of the ellipse
	 * @param {int} mProperties.height Height of the ellipse
	 * @param {int} mProperties.oldWidth Previous width of the ellipse
	 * @param {int} mProperties.oldHeight Previous height of the ellipse
	 *
	 * @class Holds information about an {@link sap.suite.ui.commons.imageeditor.ImageEditor} action history item
	 * that was created by the {@link sap.suite.ui.commons.imageeditor.ImageEditor#ellipseCrop} method.
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
	 * @alias sap.suite.ui.commons.imageeditor.CropEllipseHistoryItem
	 */
	var CropEllipseHistoryItem = HistoryItem.extend("sap.suite.ui.commons.imageeditor.CropEllipseHistoryItem", {
		constructor: function(mProperties) {
			HistoryItem.apply(this, arguments);

			mProperties = mProperties || {};

			assert(typeof mProperties.x === "number", "X must be a number.");
			assert(typeof mProperties.y === "number", "Y must be a number.");
			assert(typeof mProperties.rx === "number", "RX value must be a number.");
			assert(typeof mProperties.ry === "number", "RY value must be a number.");
			assert(typeof mProperties.width === "number", "Width must be a number.");
			assert(typeof mProperties.height === "number", "Height value must be a number.");
			assert(typeof mProperties.oldWidth === "number", "Old width value must be a number.");
			assert(typeof mProperties.oldHeight === "number", "Old height value must be a number.");

			this._iX = mProperties.x;
			this._iY = mProperties.y;
			this._iRx = mProperties.rx;
			this._iRy = mProperties.ry;
			this._iWidth = mProperties.width;
			this._iHeight = mProperties.height;
			this._iOldWidth = mProperties.oldWidth;
			this._iOldHeight = mProperties.oldHeight;
		}
	});

	CropEllipseHistoryItem.prototype.getX = function() {
		return this._iX;
	};

	CropEllipseHistoryItem.prototype.getY = function() {
		return this._iY;
	};

	CropEllipseHistoryItem.prototype.getRx = function() {
		return this._iRx;
	};

	CropEllipseHistoryItem.prototype.getRy = function() {
		return this._iRy;
	};

	CropEllipseHistoryItem.prototype.getWidth = function() {
		return this._iWidth;
	};

	CropEllipseHistoryItem.prototype.getHeight = function() {
		return this._iHeight;
	};

	CropEllipseHistoryItem.prototype.getOldWidth = function() {
		return this._iOldWidth;
	};

	CropEllipseHistoryItem.prototype.getOldHeight = function() {
		return this._iOldHeight;
	};

	CropEllipseHistoryItem.prototype.compare = function(oHistoryItem) {
		var aMethods = ["getWidth", "getHeight"];

		return this._compare(oHistoryItem, aMethods);
	};

	return CropEllipseHistoryItem;
});
