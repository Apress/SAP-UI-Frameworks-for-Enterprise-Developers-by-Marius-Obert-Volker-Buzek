/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Core"
], function(
	EventProvider,
	ResizeHandler,
	core
) {
	"use strict";

	var RedlineDesignHandler = EventProvider.extend("sap.ui.vk.RedlineDesignHandler", {
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
			this._gesture = false;
		}
	});

	RedlineDesignHandler.prototype.destroy = function() {
		this._redlineDesign = null;
		this._rect = null;
		this._gesture = false;
	};

	RedlineDesignHandler.prototype._getOffset = function(domRef) {
		var rectangle = domRef.getBoundingClientRect();
		return {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
	};

	RedlineDesignHandler.prototype._inside = function(event, redlineDesignInstance) {

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

	RedlineDesignHandler.prototype._onresize = function(event) {
		this._gesture = false;
		//			this._rect = null;
	};

	/**
	 * Gesture handler to handle <i>beginGesture</i> while in redline drawing mode.
	 * @param {event} event Custom event broadcast by Loco.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineDesignHandler.prototype.beginGesture = function(event) {
		var viewport = this.getViewport();
		if (this._inside(event, viewport) && viewport._activeElementInstance) {
			this._gesture = true;
			this._x = event.x;
			this._y = event.y;

			// activate drawing mode
			viewport._isDrawingOn = true;

			var domRef = viewport.getDomRef();

			// create element based on the current settings
			var translatedCoordinates = viewport._toVirtualSpace(event.x - domRef.getBoundingClientRect().left - window.pageXOffset, event.y - domRef.getBoundingClientRect().top - window.pageYOffset);
			viewport._activeElementInstance.setOriginX(translatedCoordinates.x);
			viewport._activeElementInstance.setOriginY(translatedCoordinates.y);

			// If the browser is Internet Explorer, we simply invalidate the Redline control.
			// Else, we do a manual workaround which is necessary for iPad compatibility and performance reasons.
			if (sap.ui.Device.browser.msie || sap.ui.Device.browser.edge) {
				viewport.invalidate();
			} else {
				// getting a new instance of RenderManager
				var renderManager = core.createRenderManager();
				// manually rendering the active element instance
				viewport._activeElementInstance.render(renderManager);

				// flushing the drawing surface
				renderManager.flush(viewport.getDomRef(), false, true);
				renderManager.destroy();

				// This is workaround for an issue caused by the fact that browsers can't
				// work with innerHTML for svg elements. There is a discussion on this topic here:
				// http://stackoverflow.com/a/13654655/3935427
				var x = viewport.$();
				x.html(x.html());
			}

			event.handled = true;
		}
		return this;
	};

	/**
	 * Gesture handler to handle <i>move</i> while in redline drawing mode.
	 * @param {event} event Custom event broadcast by Loco.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineDesignHandler.prototype.move = function(event) {
		var viewport = this.getViewport();
		// if the mouse is moved while the drawing is on, we change the current element.
		// e.g: resize the rectangle, draw line while in freehand mode etc.
		if (viewport._activeElementInstance && viewport._isDrawingOn) {
			var boundingClientRect = viewport.getDomRef().getBoundingClientRect(),
				offsetX = event.x - boundingClientRect.left - window.pageXOffset,
				offsetY = event.y - boundingClientRect.top - window.pageYOffset;

			viewport._activeElementInstance.edit(offsetX, offsetY);
			event.handled = true;
		}
		return this;
	};

	/**
	 * Gesture handler to handle <i>endGesture</i> while in redline drawing mode.
	 * @param {event} event Custom event broadcast by Loco.
	 * @returns {this} <code>this</code> to allow method chaining.
	 * @public
	 */
	RedlineDesignHandler.prototype.endGesture = function(event) {
		var viewport = this.getViewport();
		this._gesture = false;
		if (viewport._activeElementInstance) {

			viewport.addRedlineElement(viewport._activeElementInstance);

			// fire an event containing the current element
			viewport.fireElementCreated({
				element: viewport._activeElementInstance
			});

			// deactivate drawing mode
			viewport.stopAdding();
			event.handled = true;
		}
		return this;
	};

	RedlineDesignHandler.prototype.contextMenu = function(event) {
		event.handled = true;
	};

	RedlineDesignHandler.prototype.getViewport = function() {
		return this._redlineDesign;
	};

	return RedlineDesignHandler;
});
