/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.TransformSvgElementToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../svg/Element"
], function(
	EventProvider,
	Element
) {
	"use strict";

	var TransformSvgElementToolHandler = EventProvider.extend("sap.ui.vk.tools.TransformSvgElementToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 10; // the priority of the handler
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
		}
	});

	/**
	 * Calculates mouse position in world space.
	 * @param {object} event Mouse event.
	 * @returns {object} Mouse position in world space.
	 * @private
	 */
	TransformSvgElementToolHandler.prototype._getPosition = function(event) {
		return this._tool._viewport._camera._screenToWorld(event.x - this._rect.x, event.y - this._rect.y);
	};

	/**
	 * Finds the active gizmo and its active handle index on a mouse event.
	 * @param {object} event Mouse event.
	 * @returns {object} Active gizmo index and its active handle index.
	 * @private
	 */
	TransformSvgElementToolHandler.prototype._getGizmoHandle = function(event) {
		var viewport = this._tool._viewport;
		if (!viewport || !this._gizmo || !this._inside(event)) {
			return null;
		}

		if (event.scroll !== undefined) {
			return null;
		}

		var camera = viewport._camera;
		var nodes = this._gizmo._nodes;
		if (!camera || !nodes || nodes.length === 0) {
			return null;
		}

		var mx = event.x - this._rect.x;
		var my = event.y - this._rect.y;
		var wmp = this._getPosition(event); // world mouse position
		var dSize = 12;

		var gizmoIndex = -1;
		for (var ni = 0; ni < nodes.length; ni++) {
			var nodeInfo = nodes[ni];
			var node = nodeInfo.node;
			var bbox = node._getBBox();
			if (!bbox) {
				continue;
			}
			var matrix = node._matrixWorld();
			var handlePositions = this._gizmo._getHandleLocalPositions(nodeInfo, matrix);
			var handleOrder = [0, 4, 2, 6, 8, 1, 3, 5, 7]; // priority order

			for (var i = 0; i < 9; i++) {
				var hi = handleOrder[i];
				var whp = Element._transformPoint(handlePositions[hi * 2], handlePositions[hi * 2 + 1], matrix); // world handle position
				var pos = camera._worldToScreen(whp.x, whp.y); // screen handle position
				if (mx >= pos.x - dSize && mx <= pos.x + dSize && my >= pos.y - dSize && my <= pos.y + dSize) {
					return { gizmoIndex: ni, handleIndex: hi, angle: Math.atan2(matrix[2], matrix[3]) };
				}
			}

			if (gizmoIndex < 0) {// check if mouse is inside bounding box
				var dx = dSize / (camera.zoom * Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]));
				var dy = dSize / (camera.zoom * Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3]));
				var lmp = Element._transformPoint(wmp.x, wmp.y, Element._invertMatrix(matrix)); // local mouse position
				if (lmp.x >= bbox.x - dx && lmp.x <= bbox.x + bbox.width + dx &&
					lmp.y >= bbox.y - dy && lmp.y <= bbox.y + bbox.height + dy) {
					gizmoIndex = ni;
				}
			}
		}

		return gizmoIndex < 0 ? null : { gizmoIndex: gizmoIndex, handleIndex: -1 };
	};

	/**
	 * Mouse hover event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.hover = function(event) {
		if (this._gizmo) {
			var handle = this._getGizmoHandle(event);
			if (handle) {
				this._gizmo._selectHandle(handle.gizmoIndex, handle.handleIndex);
			} else {
				this._gizmo._selectHandle(-1, -1);
			}
		}
	};

	/**
	 * Begin gesture event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.beginGesture = function(event) {
		this._handle = event.buttons === 1 && this._getGizmoHandle(event) || null;
		if (this._handle) {
			event.handled = true;
			this._gizmo._selectHandle(this._handle.gizmoIndex, this._handle.handleIndex);

			this._startPos = this._getPosition(event);
			this._gizmo._beginGesture();
		}
	};

	/**
	 * Mouse move event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.move = function(event) {
		if (this._handle && this._inside(event)) {
			event.handled = true;

			var pos = this._getPosition(event);
			this._gizmo._update(pos.x - this._startPos.x, pos.y - this._startPos.y, event.event && (sap.ui.Device.os.macintosh ? event.event.metaKey : event.event.ctrlKey));
		}
	};

	/**
	 * End gesture event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.endGesture = function(event) {
		if (this._handle) {
			this._handle = null;
			event.handled = true;
			this._gizmo._endGesture();
		}
	};

	/**
	 * Click event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.click = function(event) { };

	/**
	 * Double-click event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.doubleClick = function(event) { };

	/**
	 * Context menu open event handler.
	 * @param {object} event Event.
	 */
	TransformSvgElementToolHandler.prototype.contextMenu = function(event) { };

	/**
	 * Returns the viewport to which this handler is attached.
	 * @return {object} Viewport.
	 */
	TransformSvgElementToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	TransformSvgElementToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	TransformSvgElementToolHandler.prototype._inside = function(event) {
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

	return TransformSvgElementToolHandler;
});
