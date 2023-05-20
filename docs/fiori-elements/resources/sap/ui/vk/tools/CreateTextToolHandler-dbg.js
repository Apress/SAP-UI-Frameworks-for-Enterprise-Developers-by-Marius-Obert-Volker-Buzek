/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreateTextToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../svg/Element"
], function(
	EventProvider,
	Element
) {
	"use strict";

	var CreateTextToolHandler = EventProvider.extend("sap.ui.vk.tools.CreateTextToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 30; // the priority of the handler
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
	CreateTextToolHandler.prototype._getPosition = function(event) {
		return this._tool._viewport._camera._screenToWorld(event.x - this._rect.x, event.y - this._rect.y);
	};

	/**
	 * Mouse hover event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.hover = function(event) { };

	/**
	 * Begin gesture event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.beginGesture = function(event) { };

	/**
	 * Mouse move event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.move = function(event) { };

	/**
	 * End gesture event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.endGesture = function(event) { };

	/**
	 * Click event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.click = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			this._tool.getGizmo()._createText(this._getPosition(event), "Text");
			event.handled = true;
		}
	};

	/**
	 * Double-click event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.doubleClick = function(event) { };

	/**
	 * Context menu open event handler.
	 * @param {object} event Event.
	 */
	CreateTextToolHandler.prototype.contextMenu = function(event) { };

	/**
	 * Returns the viewport to which this handler is attached.
	 * @return {sap.ui.vk.svg.Viewport} Viewport.
	 */
	CreateTextToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	CreateTextToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	CreateTextToolHandler.prototype._inside = function(event) {
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

	return CreateTextToolHandler;
});
