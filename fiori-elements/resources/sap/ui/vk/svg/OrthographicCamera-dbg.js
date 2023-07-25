/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the OrthographicCamera class.
sap.ui.define([
	"../OrthographicCamera"
], function(
	OrthographicCamera
) {
	"use strict";

	/**
	 * Constructor for a new OrthographicCamera.
	 *
	 *
	 * @class Provides the interface for the camera.
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.OrthographicCamera
	 * @alias sap.ui.vk.svg.OrthographicCamera
	 * @since 1.80.0
	 */
	var SvgOrthographicCamera = OrthographicCamera.extend("sap.ui.vk.svg.OrthographicCamera", /** @lends sap.ui.vk.svg.OrthographicCamera.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = OrthographicCamera.getMetadata().getParent().getClass().prototype;

	SvgOrthographicCamera.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this.zoom = 1;
		this.offsetX = 0;
		this.offsetY = 0;
		this._width = 0;
		this._height = 0;
		this.zoomedObject = null;
	};

	SvgOrthographicCamera._MIN_ZOOM = 1e-15;

	SvgOrthographicCamera.prototype.update = function(width, height, reset) {
		if (this._width !== width || this._height !== height) {
			if (this._width > 0 && this._height > 0) {
				var zoomScale = Math.min(width, height) / Math.min(this._width, this._height);
				zoomScale = Math.max(zoomScale, SvgOrthographicCamera._MIN_ZOOM / this.zoom);
				this.zoom *= zoomScale;
				this.offsetX = (this.offsetX - this._width * 0.5) * zoomScale + width * 0.5;
				this.offsetY = (this.offsetY - this._height * 0.5) * zoomScale + height * 0.5;
			} else {
				// Previous width and height were set to zero. This is the first real update so set initial position and zoom
				reset = true;
			}
			this._width = width;
			this._height = height;
			if (reset) {
				this.reset();
			}
		}
	};

	SvgOrthographicCamera.prototype.reset = function() {
		if (this._initialZoom) {
			this.setZoomFactor(this._initialZoom);
		}

		if (this._initialPosition) {
			this.setPosition(this._initialPosition);
		}
	};

	SvgOrthographicCamera.prototype._getViewBox = function() {
		var scale = this.zoom > 0 ? 1 / this.zoom : 1;
		return [-this.offsetX * scale, -this.offsetY * scale, this._width * scale, this._height * scale];
	};

	SvgOrthographicCamera.prototype._setViewBox = function(viewBox, width, height) {
		// this._zoomTo({ min: { x: viewBox[0], y: viewBox[1] }, max: { x: viewBox[0] + viewBox[2], y: viewBox[1] + viewBox[3] } }, width, height);
		this.zoom = Math.min(width, height) / Math.min(viewBox[2], viewBox[3]);
		this.zoom = Math.max(this.zoom, SvgOrthographicCamera._MIN_ZOOM);
		this.offsetX = width * 0.5 - (viewBox[0] + viewBox[2] * 0.5) * this.zoom;
		this.offsetY = height * 0.5 - (viewBox[1] + viewBox[3] * 0.5) * this.zoom;
		this._width = width;
		this._height = height;
	};

	SvgOrthographicCamera.prototype._zoomTo = function(boundingBox, width, height, margin) {
		var zoom = Math.min(width / (boundingBox.max.x - boundingBox.min.x), height / (boundingBox.max.y - boundingBox.min.y)) / (1 + (margin || 0));
		zoom = Math.max(zoom, SvgOrthographicCamera._MIN_ZOOM);

		this.zoom = zoom;
		this.offsetX = (width - (boundingBox.min.x + boundingBox.max.x) * zoom) * 0.5;
		this.offsetY = (height - (boundingBox.min.y + boundingBox.max.y) * zoom) * 0.5;
		this._width = width;
		this._height = height;
	};

	SvgOrthographicCamera.prototype._screenToWorld = function(x, y) {
		return {
			x: (x - this.offsetX) / this.zoom,
			y: (y - this.offsetY) / this.zoom
		};
	};

	SvgOrthographicCamera.prototype._worldToScreen = function(x, y) {
		return {
			x: x * this.zoom + this.offsetX,
			y: y * this.zoom + this.offsetY
		};
	};

	SvgOrthographicCamera.prototype._transformRect = function(rect) {
		var p1 = this._screenToWorld(rect.x1, rect.y1);
		var p2 = this._screenToWorld(rect.x2, rect.y2);
		return {
			x1: Math.min(p1.x, p2.x),
			y1: Math.min(p1.y, p2.y),
			x2: Math.max(p1.x, p2.x),
			y2: Math.max(p1.y, p2.y)
		};
	};

	SvgOrthographicCamera.prototype._getYSign = function() {
		return this.getUpDirection()[1] >= 0 ? -1 : 1;
	};

	SvgOrthographicCamera.prototype.getPosition = function() {
		var invZoom = this.zoom > 0 ? 1 / this.zoom : 1;
		return [(this._width * 0.5 - this.offsetX) * invZoom, (this._height * 0.5 - this.offsetY) * invZoom * this._getYSign(), 0];
	};

	SvgOrthographicCamera.prototype.setPosition = function(vals) {
		if (Array.isArray(vals) && vals.length >= 2) {
			if (!this._initialPosition) {
				// Preserve original position for camera reset call
				this._initialPosition = vals.slice();
			}

			if (this._width > 0 && this._height > 0) {
				this.offsetX = this._width * 0.5 - vals[0] * this.zoom;
				this.offsetY = this._height * 0.5 - vals[1] * this._getYSign() * this.zoom;
			}
		}
	};

	SvgOrthographicCamera.prototype.getZoomFactor = function() {
		var f = Math.min(this._width, this._height);
		if (f === 0) {
			return null;
		}
		return this.zoom * 2 / f;
	};

	SvgOrthographicCamera.prototype.setZoomFactor = function(val) {
		if (this._initialZoom == null) {
			// Preserve original zoom factor for camera reset call
			this._initialZoom = val;
		}

		if (this._width > 0 && this._height > 0) {
			var newZoom = val * 0.5 * Math.min(this._width, this._height);
			newZoom = Math.max(newZoom, SvgOrthographicCamera._MIN_ZOOM);
			this.offsetX += (this._width * 0.5 - this.offsetX) * (this.zoom - newZoom) / this.zoom;
			this.offsetY += (this._height * 0.5 - this.offsetY) * (this.zoom - newZoom) / this.zoom;
			this.zoom = newZoom;
		}
	};

	return SvgOrthographicCamera;
});
