/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control HitTest tool gesture handler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"./HitTestClickType"
], function(
	EventProvider,
	HitTestClickType
) {
	"use strict";

	var HitTestToolHandler = EventProvider.extend("sap.ui.vk.tools.HitTestToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(Tool) { // onRotateEndHandler is something specific to this Handler class - you can pass whatever objects you like to your handler to help it do its job. You don't even have to pass a Viewport if you don't plan to use it while handling the event.
			this._priority = 0; // the priority of the handler
			this._tool = Tool;
			this._rect = null;
			this._gesture = false;
			this._nomenu = false;
		}
	});

	HitTestToolHandler.prototype.destroy = function() {
		this._tool = null;
		this._rect = null;
		this._gesture = false;
	};

	HitTestToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	HitTestToolHandler.prototype._inside = function(event) {
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

	HitTestToolHandler.prototype.beginGesture = function(event) {
		// Allow other handlers to handle this event
		event.handled = false;
	};


	HitTestToolHandler.prototype.move = function(event) {
		event.handled = false;
	};

	HitTestToolHandler.prototype.endGesture = function(event) {
		// Allow other handlers to execute
		event.handled = false;
	};

	HitTestToolHandler.prototype._executeHittest = function(event, clicktype) {
		if (this._inside(event) && !this._gesture) {
			this._gesture = false;

			// for some reason x = event.x - this._rect.x, works differently for dvl...
			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;

			// Show the tool gizmo
			this._gizmo = this._tool.getGizmo();
			if (this._gizmo) {
				this._gizmo.show(this._tool._viewport);

				// Move the gizmo to the mouse position
				this._gizmo.moveGizmo(x, y);
			}

			var scene = this._tool._viewport.getScene();
			var camera = this._tool._viewport.getCamera();

			this._tool.hitTest(x, y, scene, camera, clicktype);

			// Hide the tool gizmo
			if (this._gizmo) {
				this._gizmo.hide();
			}
		}
	};
	HitTestToolHandler.prototype.click = function(event) {
		this._executeHittest(event, HitTestClickType.Single);
		// Block further handlers from processing this event
		event.handled = true;
	};

	HitTestToolHandler.prototype.doubleClick = function(event) {
		this._executeHittest(event, HitTestClickType.Double);
		event.handled = false;
	};

	HitTestToolHandler.prototype.contextMenu = function(event) {
		this._executeHittest(event, HitTestClickType.Context);
		event.handled = false;
	};

	HitTestToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	return HitTestToolHandler;
});
