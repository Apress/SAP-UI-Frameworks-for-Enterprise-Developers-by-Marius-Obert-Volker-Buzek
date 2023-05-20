/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ve.js.LocoEventHandler.
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	var RectSelectToolHandler = EventProvider.extend("sap.ui.vk.tools.RectSelectToolHandler", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"beginGesture",
				"endGesture",
				"move",
				"click",
				"doubleClick",
				"contextMenu"]
		},
		constructor: function(Tool) {
			this._tool = Tool;
			this._rect = null;
			this._gesture = false;
			this._nomenu = false;
			this._selectionRect = null;
		}
	});

	RectSelectToolHandler.prototype.destroy = function() {
		this._tool = null;
		this._rect = null;
		this._gesture = false;
	};

	RectSelectToolHandler.prototype.activate = function(viewport) {
		this._deactivate = false;
		if (viewport._loco) {
			this._viewport = viewport;
			viewport._loco.addHandler(this, 1);
		}
	};

	RectSelectToolHandler.prototype.deactivate = function() {
		if (this._gesture) {
			this._deactivate = true;
		} else if (this._viewport) {
			this._deactivate = false;
			this._viewport._loco.removeHandler(this);
			this._viewport = null;
		}
	};

	// GENERALIZE THIS FUNCTION
	RectSelectToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	RectSelectToolHandler.prototype._inside = function(event) {
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

		if (document.activeElement) {
			try {
				document.activeElement.blur();
			} catch (e) {
				// IE can have error calling blur() in fullscreen mode
			}
		}

		domobj.focus();

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	RectSelectToolHandler.prototype.beginGesture = function(event) {
		if (event.n === 1 && this._inside(event) && !this._gesture) {
			this._gesture = true;
			event.handled = true;

			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;

			this._selectionRect = { x1: x, y1: y, x2: x, y2: y };
			return;
		}
	};


	RectSelectToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._nomenu = true;

			if (this._selectionRect) {
				this._selectionRect.x2 = event.x - this._rect.x;
				this._selectionRect.y2 = event.y - this._rect.y;
				if (this._viewport) {
					this._viewport.setSelectionRect(this._selectionRect);
				}
			}
		}
	};

	RectSelectToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;

			if (this._selectionRect) {
				if (this._viewport) {
					var x = event.x - this._rect.x,
						y = event.y - this._rect.y;
					if (this._tool.isViewportType("sap.ui.vk.svg.Viewport") || this._tool.isViewportType("sap.ui.vk.dvl.Viewport")) {
						this._tool.select(this._selectionRect.x1, this._selectionRect.y1, x, y, null, null);
					} else if (this._tool.isViewportType("sap.ui.vk.threejs.Viewport")) {
						this._tool.select(this._selectionRect.x1, this._selectionRect.y1, x, y, this._viewport.getScene(), this._viewport.getCamera());
					}
				}
				this._viewport.setSelectionRect(null);
				this._selectionRect = null;
			}

			if (this._deactivate) {
				this.deactivate();
			}
		}
	};

	RectSelectToolHandler.prototype.getViewport = function() {
		return this._viewport;
	};

	return RectSelectToolHandler;
});
