/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CreatePathToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../svg/Element"
], function(
	EventProvider,
	Element
) {
	"use strict";

	var CreatePathToolHandler = EventProvider.extend("sap.ui.vk.tools.CreatePathToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 30; // the priority of the handler
			this._tool = tool;
			this._rect = null;
			this._gesture = false;
		}
	});

	/**
	 * Calculates mouse position in world space.
	 * @param {object} event Mouse event.
	 * @returns {object} Mouse position in world space.
	 * @private
	 */
	CreatePathToolHandler.prototype._getPosition = function(event) {
		var pos = this._tool._viewport._camera._screenToWorld(event.x - this._rect.x, event.y - this._rect.y);
		var matrix = Element._invertMatrix(this._tool.getGizmo()._root._matrixWorld());
		return Element._transformPoint(pos.x, pos.y, matrix);
	};

	/**
	 * Mouse hover event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.hover = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && gizmo._activeElement) {
			event.handled = true;
			this._tool.getGizmo()._addPoint(this._getPosition(event), false);
		}
	};

	/**
	 * Begin gesture event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.beginGesture = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && event.buttons === 1 && this._inside(event)) {
			event.handled = true;
			this._gesture = true;
			gizmo._addPoint(this._getPosition(event), true, true);
		}
	};

	/**
	 * Mouse move event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.move = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._gesture && this._inside(event)) {
			event.handled = true;
			this._tool.getGizmo()._addPoint(this._getPosition(event), true);
		}
	};

	/**
	 * End gesture event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.endGesture = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._gesture && this._inside(event)) {
			this._gesture = false;
			event.handled = true;
			this._tool.getGizmo()._checkClosure(this._getPosition(event));
		}
	};

	/**
	 * Click event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.click = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			event.handled = true;
		}
	};

	/**
	 * Double-click event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.doubleClick = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			event.handled = true;
			gizmo._finishPath(false);
		}
	};

	/**
	 * Context menu open event handler.
	 * @param {object} event Event.
	 */
	CreatePathToolHandler.prototype.contextMenu = function(event) { };

	/**
	 * Returns the viewport to which this handler is attached.
	 * @return {sap.ui.vk.svg.Viewport} Viewport.
	 */
	CreatePathToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	CreatePathToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	CreatePathToolHandler.prototype._inside = function(event) {
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

	return CreatePathToolHandler;
});
