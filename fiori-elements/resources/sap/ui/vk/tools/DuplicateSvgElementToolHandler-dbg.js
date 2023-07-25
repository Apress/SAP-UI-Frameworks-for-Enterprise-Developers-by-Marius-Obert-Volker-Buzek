/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.DuplicateSvgElementToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../svg/Element"
], function(
	EventProvider,
	Element
) {
	"use strict";

	var DuplicateSvgElementToolHandler = EventProvider.extend("sap.ui.vk.tools.DuplicateSvgElementToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 10; // the priority of the handler
			this._tool = tool;
			this._rect = null;
		}
	});

	/**
	 * Calculates mouse position in world space.
	 * @param {object} event Mouse event.
	 * @returns {object} Mouse position in world space.
	 * @private
	 */
	DuplicateSvgElementToolHandler.prototype._getPosition = function(event) {
		return this._tool._viewport._camera._screenToWorld(event.x - this._rect.x, event.y - this._rect.y);
	};

	/**
	 * Mouse hover event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.hover = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			gizmo._move(this._getPosition(event));
		}
	};

	/**
	 * Begin gesture event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.beginGesture = function(event) { };

	/**
	 * Mouse move event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.move = function(event) { };

	/**
	 * End gesture event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.endGesture = function(event) { };

	/**
	 * Click event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.click = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			event.handled = true;
			gizmo._complete(this._getPosition(event));
		}
	};

	/**
	 * Double-click event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.doubleClick = function(event) { };

	/**
	 * Context menu open event handler.
	 * @param {object} event Event.
	 */
	DuplicateSvgElementToolHandler.prototype.contextMenu = function(event) { };

	/**
	 * Returns the viewport to which this handler is attached.
	 * @return {object} Viewport.
	 */
	DuplicateSvgElementToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	DuplicateSvgElementToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	DuplicateSvgElementToolHandler.prototype._inside = function(event) {
		var id = this._tool._viewport.getIdForLabel();
		var domobj = document.getElementById(id);

		if (domobj == null) {
			return false;
		}

		var offset = this._getOffset(domobj);
		this._rect = {
			x: offset.x,
			y: offset.y,
			w: domobj.offsetWidth,
			h: domobj.offsetHeight
		};

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	return DuplicateSvgElementToolHandler;
});
