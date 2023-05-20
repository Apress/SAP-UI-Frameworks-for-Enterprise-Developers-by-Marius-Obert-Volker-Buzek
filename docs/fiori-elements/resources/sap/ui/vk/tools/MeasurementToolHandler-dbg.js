/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.MeasurementToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	var MeasurementToolHandler = EventProvider.extend("sap.ui.vk.tools.MeasurementToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			EventProvider.call(this);
			this._priority = 0; // the priority of the handler
			this._tool = tool;
			this._rect = null;
		}
	});

	MeasurementToolHandler.prototype.destroy = function() {
		this._tool = null;
		this._rect = null;
	};

	MeasurementToolHandler.prototype._processMouseEvent = function(gizmo, event) {
		var data = null;

		if (gizmo && this._inside(event) && this.getViewport().getScene()) {
			var x = event.x - this._rect.x;
			var y = event.y - this._rect.y;
			var vp = this._tool._viewport;
			if (gizmo.is2D()) {
				var object = vp.hitTest(x, y, true, true, true);
				var w = vp._camera._screenToWorld(x, y);
				data = {
					screenPoint: [x, y],
					worldPoint: [w.x, w.y, 0],
					nodeRef: object,
					shiftKey: event.event.shiftKey
				};
			} else {
				var hitTestInfo = vp.hitTest(x, y);
				if (hitTestInfo != null && hitTestInfo.object != null) {
					data = {
						screenPoint: [x, y],
						worldPoint: hitTestInfo.point.toArray(),
						nodeRef: hitTestInfo.object,
						shiftKey: event.event.shiftKey
					};
				} else {
					// hovering over empty space in 3D
					data = {
						screenPoint: [x, y],
						worldPoint: null,
						nodeRef: null,
						shiftKey: event.event.shiftKey
					};
				}
			}
		}

		return data;
	};

	MeasurementToolHandler.prototype.hover = function(event) {
		var gizmo = this._tool.getGizmo();
		gizmo.setHoverPoint(this._processMouseEvent(gizmo, event));
	};

	MeasurementToolHandler.prototype.beginGesture = function(event) { };

	MeasurementToolHandler.prototype.move = function(event) { };

	MeasurementToolHandler.prototype.endGesture = function(event) { };

	MeasurementToolHandler.prototype.click = function(event) {
		event.handled = true;
		var gizmo = this._tool.getGizmo();
		gizmo.fixPoint(this._processMouseEvent(gizmo, event));
	};

	MeasurementToolHandler.prototype.doubleClick = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && gizmo.doubleClick && gizmo.doubleClick(this._processMouseEvent(gizmo, event))) {
			event.handled = true;
		}
	};

	MeasurementToolHandler.prototype.contextMenu = function(event) { };

	MeasurementToolHandler.prototype.keyEventHandler = function(event) {
		if (event.code === "Escape") {
			var gizmo = this._tool.getGizmo();
			if (gizmo) {
				gizmo.escapePressed();
				event.handled = true;
			}
		}
	};

	MeasurementToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	MeasurementToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	MeasurementToolHandler.prototype._inside = function(event) {
		var id = this._tool._viewport.getIdForLabel();
		var domobj = document.getElementById(id);

		if (domobj == null) {
			return false;
		}

		var o = this._getOffset(domobj);
		var rect = this._rect = {
			x: o.x,
			y: o.y,
			w: domobj.offsetWidth,
			h: domobj.offsetHeight
		};

		return (
			event.x >= rect.x && event.x <= rect.x + rect.w
			&& event.y >= rect.y && event.y <= rect.y + rect.h
		);
	};

	return MeasurementToolHandler;
});
