/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.HighlightMeasurementToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(EventProvider) {
	"use strict";

	var HighlightMeasurementToolHandler = EventProvider.extend("sap.ui.vk.tools.HighlightMeasurementToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},

		constructor: function(tool) {
			this._priority = 0; // the priority of the handler
			this._tool = tool;
			this._rect = null;
		}
	});

	HighlightMeasurementToolHandler.prototype.destroy = function() {
		this._tool = null;
		this._rect = null;
	};

	HighlightMeasurementToolHandler.prototype.hover = function(event) {
		var tool = this._tool;
		var viewport = tool._viewport;
		var surface = viewport.getMeasurementSurface();

		if (this._inside(event) && viewport.getScene()) {
			var x = event.x - this._rect.x;
			var y = event.y - this._rect.y;
			tool.highlightMeasurement(surface.hitTest(x, y), surface);
		} else {
			tool.highlightMeasurement(null, surface);
		}
	};

	HighlightMeasurementToolHandler.prototype.beginGesture = function(event) { };

	HighlightMeasurementToolHandler.prototype.move = function(event) { };

	HighlightMeasurementToolHandler.prototype.endGesture = function(event) { };

	HighlightMeasurementToolHandler.prototype.click = function(event) {
		var tool = this._tool;
		var viewport = tool._viewport;

		if (this._inside(event) && viewport.getScene()) {
			var x = event.x - this._rect.x;
			var y = event.y - this._rect.y;
			var measurementDomRef = viewport.getMeasurementSurface().hitTest(x, y);
			if (measurementDomRef) {
				event.handled = true;
				tool.selectMeasurement(measurementDomRef);
			} else {
				tool.clearSelection();
			}
		}
	};

	HighlightMeasurementToolHandler.prototype.doubleClick = function(event) { };

	HighlightMeasurementToolHandler.prototype.contextMenu = function(event) { };

	// GENERALIZE THIS FUNCTION
	HighlightMeasurementToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	HighlightMeasurementToolHandler.prototype._inside = function(event) {
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

	return HighlightMeasurementToolHandler;
});
