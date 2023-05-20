/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/ui/core/ResizeHandler",
	"./NativeViewport",
	"sap/ui/core/Core"
], function(
	EventProvider,
	ResizeHandler,
	NativeViewport,
	core
) {
	"use strict";

	var RedlineGesturesHandler = EventProvider.extend("sap.ui.vk.RedlineGesturesHandler", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"beginGesture",
				"move",
				"endGesture",
				"click",
				"doubleClick",
				"contextMenu",
				"getViewport"
			]
		},
		constructor: function(redlineDesignInstance) {
			this._redlineDesign = redlineDesignInstance;

			this._x = 0;
			this._y = 0;
			this._d = 0;
			this._zoomFactor = 1;
			this._gesture = false;
		}
	});

	RedlineGesturesHandler.prototype.destroy = function() {
		this._redlineDesign = null;
		this._rect = null;
		this._gesture = false;
	};

	RedlineGesturesHandler.prototype._getOffset = function(domRef) {
		var rectangle = domRef.getBoundingClientRect();
		return {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
	};

	RedlineGesturesHandler.prototype._inside = function(event, redlineDesignInstance) {
		var redlineDesignDomRef = redlineDesignInstance.getDomRef(),
			isInside = false;

		if (redlineDesignDomRef !== null) {
			var redlineControlOffset = this._getOffset(redlineDesignDomRef);
			var redlineControlInfo = {
				x: redlineControlOffset.x,
				y: redlineControlOffset.y,
				width: redlineDesignDomRef.getBoundingClientRect().width,
				height: redlineDesignDomRef.getBoundingClientRect().height
			};
			isInside = (event.x >= redlineControlInfo.x && event.x <= redlineControlInfo.x + redlineControlInfo.width && event.y >= redlineControlInfo.y && event.y <= redlineControlInfo.y + redlineControlInfo.height);
		}
		return isInside;
	};

	RedlineGesturesHandler.prototype._onresize = function(event) {
		this._gesture = false;
	};

	/**
	 * Gesture handler to handle <i>beginGesture</i> while in redline interaction mode.
	 * @param {event} event Custom event broadcast by Loco.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineGesturesHandler.prototype.beginGesture = function(event) {
		var viewport = this.getViewport();
		if (this._inside(event, viewport)) {
			this._gesture = true;
			this._x = event.x;
			this._y = event.y;
			this._d = event.d;
			this._initd = event.d;
			event.handled = true;
		}
		return this;
	};

	RedlineGesturesHandler.prototype._pan = function(event) {
		var viewport = this.getViewport(),
			deltaX = event.x - this._x,
			deltaY = event.y - this._y;

		if (deltaX || deltaY) {
			this._x = event.x;
			this._y = event.y;

			var panningRatio = viewport.getPanningRatio();
			// fire the panning event specifying how much to move on x and y axes
			viewport.firePan({
				deltaX: deltaX * panningRatio,
				deltaY: deltaY * panningRatio
			});

			viewport.getRedlineElements().forEach(function(element) {
				element.setOriginX(element.getOriginX() + viewport._toVirtualSpace(deltaX));
				element.setOriginY(element.getOriginY() + viewport._toVirtualSpace(deltaY));
			});

			this._manualRender(viewport);
		}
	};

	RedlineGesturesHandler.prototype._zoom = function(event) {
		var viewport = this.getViewport(),
			zoomDelta = 1;

		var dd = event.d - this._d;
		this._d = event.d;

		if (this._initd > 0) {
			zoomDelta = 1 + dd * (1 / this._initd);
		} else if (event.n === 2) {
			if (event.points[0].y > event.points[1].y) {
				zoomDelta = Math.max(1 - dd * 0.005, 0.333);
			} else {
				zoomDelta = Math.min(1 + dd * 0.005, 3);
			}
		}

		zoomDelta = Math.min(Math.max(zoomDelta, 0.88), 1.12); // restriction of zoom because of Pinch on MacBook trackpad

		var targetViewport = viewport._getTargetViewport(); // workaround to sync zooming between redlining and NativeViewport
		// need to re-factor redlining so we only have gesture handling
		// instead of having independent gesture for redlining and other

		var zoomInLimit = 32;
		var zoomOutLimit = 1 / 8;
		if (targetViewport instanceof NativeViewport) {
			// need to check zoom limit so we stay in sync
			zoomInLimit = targetViewport._getZoomInLimit();
			zoomOutLimit = targetViewport._getZoomOutLimit();
			this._zoomFactor = targetViewport._getZoomFactor();
		}

		zoomDelta = Math.min(Math.max(this._zoomFactor * zoomDelta, zoomOutLimit), zoomInLimit) / this._zoomFactor;
		this._zoomFactor *= zoomDelta;

		var offset = this._getOffset(viewport.getDomRef());

		var scaleChange = 1 - zoomDelta,
			pivotPoint = viewport._toVirtualSpace(event.x - offset.x, event.y - offset.y);

		viewport.getRedlineElements().forEach(function(element) {
			element.applyZoom(zoomDelta);
			var originX = element.getOriginX(),
				originY = element.getOriginY();
			originX += (pivotPoint.x - originX) * scaleChange;
			originY += (pivotPoint.y - originY) * scaleChange;
			element.setOriginX(originX);
			element.setOriginY(originY);
		});

		this._manualRender(viewport);

		viewport.fireZoom({
			originX: event.x - offset.x,
			originY: event.y - offset.y,
			zoomFactor: zoomDelta
		});

	};

	/**
	 * Gesture handler to handle <i>move</i> while in redline interaction mode.
	 * @param {event} event Custom event broadcast by Loco.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineGesturesHandler.prototype.move = function(event) {
		if (this.getViewport().getDomRef()) {
			if (event.n === 1 || event.n === 2) {
				this._pan(event);
			}

			if (event.n === 2 && !event.buttons) {
				this._zoom(event);
			}
		}
		event.handled = true;
		return this;
	};

	/**
	 * It invalidates the redline elements and it manually renders them after zooming/panning gestures were performed.
	 * @param {sap.ui.vk.RedlineSurface} redlineSurface RedlineSurface instance.
	 * @private
	 */
	RedlineGesturesHandler.prototype._manualRender = function(redlineSurface) {
		if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
			redlineSurface.invalidate();
		} else {
			// creating a new instance of RenderManager
			var renderManager = core.createRenderManager();
			// manually rendering the active element instance
			redlineSurface.getRedlineElements().forEach(function(element) {
				element.render(renderManager);
			});

			// flushing the drawing surface
			renderManager.flush(redlineSurface.getDomRef(), false, false);
			renderManager.destroy();

			// This is workaround for an issue caused by the fact that browsers can't
			// work with innerHTML for svg elements. There is a discussion on this topic here:
			// http://stackoverflow.com/a/13654655/3935427
			var x = redlineSurface.$();
			x.html(x.html());
		}
	};

	/**
	 * Gesture handler to handle <i>endGesture</i> while in redline interaction mode.
	 * @param {event} event Custom event broadcast by Loco.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineGesturesHandler.prototype.endGesture = function(event) {
		this._gesture = false;
		event.handled = true;
		return this;
	};

	RedlineGesturesHandler.prototype.contextMenu = function(event) {
		event.handled = true;
	};

	RedlineGesturesHandler.prototype.getViewport = function() {
		return this._redlineDesign;
	};

	return RedlineGesturesHandler;
});
