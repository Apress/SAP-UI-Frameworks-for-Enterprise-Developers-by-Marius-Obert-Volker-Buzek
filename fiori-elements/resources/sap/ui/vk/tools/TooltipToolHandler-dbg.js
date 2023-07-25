/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.TooltipToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	var TooltipToolHandler = EventProvider.extend("sap.ui.vk.tools.TooltipToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 0; // the priority of the handler
			this._tool = tool;
			this._rect = null;
		}
	});

	TooltipToolHandler.prototype.destroy = function() {
		this._tool = null;
		this._rect = null;
	};

	TooltipToolHandler.prototype.hover = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event) && this.getViewport().getScene()) {
			var hitObject = this._tool._viewport.hitTest(event.x - this._rect.x, event.y - this._rect.y);
			if (hitObject && hitObject.object) {
				// This is workaround for sap.ui.vk.threejs.Viewport which returns structure with hit object as 'object' property
				// TODO: Return object should be consistent among all viewports!
				hitObject = hitObject.object;
			}
			gizmo.update(event.x - this._rect.x, event.y - this._rect.y, event.x, event.y, hitObject); // move the gizmo with the mouse
			event.handled = hitObject != null;
		}
	};

	TooltipToolHandler.prototype.beginGesture = function(event) { };

	TooltipToolHandler.prototype.move = function(event) { };

	TooltipToolHandler.prototype.endGesture = function(event) { };

	TooltipToolHandler.prototype.click = function(event) { };

	TooltipToolHandler.prototype.doubleClick = function(event) { };

	TooltipToolHandler.prototype.contextMenu = function(event) { };

	TooltipToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	TooltipToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	TooltipToolHandler.prototype._inside = function(event) {
		var id = this._tool._viewport.getIdForLabel();
		var domobj = document.getElementById(id);

		if (domobj == null) {
			return false;
		}

		var o = this._getOffset(domobj);
		this._rect = {
			x: o.x,
			y: o.y,
			w: domobj.offsetWidth,
			h: domobj.offsetHeight
		};

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	return TooltipToolHandler;
});
