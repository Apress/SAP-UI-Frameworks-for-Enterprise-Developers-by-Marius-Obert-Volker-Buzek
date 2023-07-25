/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ViewportHandler.
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/base/Log"
], function(
	EventProvider,
	Log
) {
	"use strict";

	var ViewportHandler = EventProvider.extend("sap.ui.vk.ViewportHandler", {
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
		constructor: function(Viewport) {
			this._viewport = Viewport;
			this._rect = null;
			this._evt = {
				x: 0,
				y: 0,
				z: 0,
				d: 0,
				tdx: 0,
				tdy: 0,
				tdd: 0,
				initd: 0
			};
			this._gesture = false;
			this._viewport.attachEvent("resize", this, this._onresize);
			this._nomenu = false;
		}
	});

	ViewportHandler.prototype.destroy = function() {
		this._viewport = null;
		this._rect = null;
		this._evt = null;
		this._gesture = false;
	};

	ViewportHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	ViewportHandler.prototype._inside = function(event) {
		if (this._rect == null || true) {
			var id = this._viewport.getIdForLabel();
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
		}

		return (event.x >= this._rect.x && event.x <= this._rect.x + this._rect.w && event.y >= this._rect.y && event.y <= this._rect.y + this._rect.h);
	};

	ViewportHandler.prototype._onresize = function(event) {
		this._gesture = false;
		this._rect = null;
	};

	ViewportHandler.prototype.hover = function(event) {
		if (this._viewport.hover && this._inside(event)) {
			this._viewport.queueCommand(function() {
				this._viewport.hover(event.x - this._rect.x, event.y - this._rect.y);
			}.bind(this));
			event.handled = true;
		}
	};

	ViewportHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._gesture = true;

			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;

			// begin gesture can fire when one mouse button is released and the other held down
			// this can cause problems in some browsers resulting in false pan tdx & tdy are used to try and detect such instances
			this._evt.tdx = 0;
			this._evt.tdy = 0;
			this._evt.tdd = 0;
			this._evt.x = x;
			this._evt.y = y;
			this._evt.d = event.d;
			this._evt.initd = event.d;
			this._evt.avgd = event.d;
			this._evt.avgx = 0;
			this._evt.avgy = 0;

			Log.debug("Loco: beginGesture: " + x + ", " + y);
			this._viewport.queueCommand(function() {
				this._viewport.beginGesture(x, y);
			}.bind(this));

			event.handled = true;
		}
		this._nomenu = false;
	};

	ViewportHandler.prototype.move = function(event) {
		if (this._gesture) {
			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;
			var dx = x - this._evt.x;
			var dy = y - this._evt.y;
			var dd = event.d - this._evt.d;
			this._evt.tdx = this._evt.tdx + dx;
			this._evt.tdy = this._evt.tdy + dy;
			this._evt.tdd = this._evt.tdd + dd;
			this._evt.x = x;
			this._evt.y = y;
			this._evt.d = event.d;
			this._evt.avgx = this._evt.avgx * 0.99 + dx * 0.01;
			this._evt.avgy = this._evt.avgy * 0.99 + dy * 0.01;

			var z = 1.0;

			if (this._evt.initd > 0) {
				z = 1.0 + dd * (1.0 / this._evt.initd);
			} else if (event.n == 2) {
				if (event.points[0].y > event.points[1].y) {
					z = 1.0 - dd * 0.005;
					if (z < 0.333) {
						z = 0.333;
					}
				} else {
					z = 1.0 + dd * 0.005;
					if (z > 3) {
						z = 3;
					}
				}
			}

			// console.log("n: " + event.n + " Zoom factor: " + z);

			// Zoom smoothing
			if (this._evt.initd > 0) {
				var avgdist = Math.sqrt(this._evt.avgx * this._evt.avgx + this._evt.avgy * this._evt.avgy);

				Log.debug("AvgDist: " + avgdist);
				if ((Math.abs(event.d - this._evt.avgd) / this._evt.avgd) < (avgdist / 10)) {
					z = 1.0;
				}
			}

			// Weighted average threshold
			this._evt.avgd = this._evt.avgd * 0.97 + event.d * 0.03;
			this._evt.n = event.n;
			switch (event.n) {
				case 1:
					Log.debug("Loco: Rotate: " + (dx) + ", " + (dy));

					this._viewport.queueCommand(function() {
						this._viewport.rotate(dx, dy);
					}.bind(this));
					break;
				case 2:
					Log.debug("Loco: Pan: " + (dx) + ", " + (dy));
					if (z != 0 && z != 1.0) {
						Log.debug("Loco: Zoom: " + (z));
					}

					this._viewport.queueCommand(function() {
						/* Issues with event processing in some browsers cause a final Pan with a dx,dy being the diff between gesture start and gesture end - resetting to original position. The following detects such an anomoly and prevents pan */
						if (this._evt.tdx !== 0 && this._evt.tdy !== 0) {
							this._viewport.pan(dx, dy);
						}


						if ((dx < 10 && dy < 10 && z != 0 && z != 1.0) && this._evt.tdd !== 0) {
							this._viewport.zoom(z);
						}
					}.bind(this));
					break;
				default:
					break;
			}

			this._nomenu = true;
			event.handled = true;
		}
	};

	ViewportHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;

			Log.debug("Loco: endGesture: " + x + ", " + y);

			this._viewport.queueCommand(function() {
				this._viewport.endGesture();
			}.bind(this));

			this._gesture = false;
			event.handled = true;
		}
	};

	ViewportHandler.prototype.click = function(event) {
		if (this._inside(event) && event.buttons <= 1) {
			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;
			Log.debug("Loco: click: " + (x) + ", " + (y));

			this._viewport.queueCommand(function() {
				this._viewport.tap(x, y, false);
			}.bind(this));

			event.handled = true;
		}
	};

	ViewportHandler.prototype.doubleClick = function(event) {
		if (this._inside(event) && event.buttons <= 1) {
			var x = event.x - this._rect.x,
				y = event.y - this._rect.y;
			Log.debug("Loco: doubleClick: " + (x) + ", " + (y));

			this._viewport.queueCommand(function() {
				this._viewport.tap(x, y, true);
			}.bind(this));

			event.handled = true;
		}
	};

	ViewportHandler.prototype.contextMenu = function(event) {
		if (this._inside(event) || this._nomenu || event.buttons == 5) {
			this._nomenu = false;

			event.handled = true;
		}
	};

	ViewportHandler.prototype.keyEventHandler = function(event) {

	};

	ViewportHandler.prototype.getViewport = function() {
		return this._viewport;
	};

	return ViewportHandler;
});
