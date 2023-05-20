/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.Loco.
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(
	EventProvider
) {
	"use strict";

	// The delay between taps to treat clicks as double clicks.
	//
	// After a `tap` event we wait for `doubleClickDelayInMS` milliseconds for the next `tap` event.
	// If such second `tap` event happens within `doubleClickDelayInMS` milliseconds we treat that
	// second `tap` event as a `doubleClick` event and ignore the first `tap` event. If there is no
	// second `tap` event within `doubleClickDelayInMS` milliseconds we treat the `tap` event as a
	// `click` event, in which case the `click` event is fired with a delay of
	// `doubleClickDelayInMS` milliseconds.
	//
	// If there is a `move` event after the first `tap` event within `doubleClickDelayInMS`
	// milliseconds we cancel waiting for the next `tap` event and treat the first `tap` event as a
	// `click` event and fire it immediately right before firing the `move` event.
	var doubleClickDelayInMS = 250;

	/**
	 * Constructor for a new Loco.
	 *
	 * @class
	 * Intercepts input event data for a SAPUI5 target, and interprets the data based on a supported set of gestures.
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.Loco
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.32.0
	 */
	var Loco = EventProvider.extend("sap.ui.vk.Loco", {
		metadata: {
			library: "sap.ui.vk",
			publicMethods: [
				"addHandler",
				"removeHandler"
			]
		},

		constructor: function(viewport) {
			if (Loco._instance && this.viewport === viewport) {
				return Loco._instance;
			}

			EventProvider.apply(this);

			this._handlers = [];
			this._gesture = false;
			this._n = 0;
			this._touchStart = 0;
			this._touchOrigin = { x: 0, y: 0 };
			this._touchMoved = false;
			this._clickTimer = 0; // click / double-click simulation
			this._clickFunc = null;

			if (viewport) {
				this.attachViewportEventHandlers(viewport);
			}
			Loco._instance = this;
		}
	});

	/**
	 * Cleans up, removes all handlers.
	 *
	 * @public
	 */
	Loco.prototype.destroy = function() {
		if (this._clickTimer > 0) {
			clearTimeout(this._clickTimer);
			this._clickTimer = 0;
			this._clickFunc = null;
		}

		this._handlers.splice();
	};

	function eventToInput(event) {
		// console.log(event.type, event.touches, event.buttons, event.pageX, event.pageY);
		var points = [];
		var input = {
			points: points,
			buttons: event.buttons || 0,
			handled: false,
			passEvent: false,
			event: event,
			timeStamp: event.timeStamp,
			scroll: event.wheelDelta
		};

		if (event.touches && event.touches.length > 0) {
			for (var i = 0; i < event.touches.length; i++) {
				var touch = event.touches[i];
				points.push({ x: touch.pageX, y: touch.pageY });
			}
		} else if (event.pageX !== undefined) {
			points.push({ x: event.pageX, y: event.pageY });
		} else {// touchend event on iOS
			points.push({ x: event.originalEvent.pageX, y: event.originalEvent.pageY });
		}

		if ((event.buttons & 2) && points.length === 1) {// if right button is pressed, then emulate multi-touch pan
			points.push(points[0]);
		}

		input.n = points.length;
		if (input.n === 2) {
			var dx = points[0].x - points[1].x,
				dy = points[0].y - points[1].y;
			input.x = (points[0].x + points[1].x) * 0.5;
			input.y = (points[0].y + points[1].y) * 0.5;
			input.d = Math.sqrt(dx * dx + dy * dy);
		} else {
			input.x = points[0].x;
			input.y = points[0].y;
			input.d = 0;
		}

		return input;
	}

	Loco.prototype.attachViewportEventHandlers = function(viewport) {
		this.viewport = viewport;

		viewport.ontouchstart = function(event) {
			// console.log("down", event.isMarked(), event);
			if (!event.isMarked()) {
				var input = eventToInput(event);
				if (this._gesture) {
					this._endGesture(input);
					input.handled = false;
				}
				this._beginGesture(input);
			}
		}.bind(this);

		viewport.ontouchend = function(event) {
			var input = eventToInput(event);

			if (input.buttons > 0) {
				var onMouseMove = function(event) {
					this._move(eventToInput(event));
				}.bind(this);

				var onMouseUp = function(event) {
					this._endGesture(eventToInput(event));
					document.removeEventListener("mousemove", onMouseMove);
					document.removeEventListener("mouseup", onMouseUp);
				}.bind(this);

				document.addEventListener("mousemove", onMouseMove);
				document.addEventListener("mouseup", onMouseUp);
				return;
			}

			this._endGesture(input);
			if (event.touches.length > 0) {
				input.handled = false;
				this._beginGesture(input);
			}
		}.bind(this);

		if (sap.ui.Device.support.touch) {
			viewport.attachBrowserEvent("touchmove", function(event) {
				// console.log("touchmove", event.isMarked(), event);
				this._move(eventToInput(event));
			}.bind(this));
		}

		viewport.attachBrowserEvent("mousemove", function(event) {
			// console.log("mousemove", event.isMarked(), event);
			this._move(eventToInput(event));
		}.bind(this));

		viewport.ontap = function(event) {
			// console.log("tap", event.isMarked(), event.timeStamp, this._touchMoved, event);
			if (!event.isMarked() && !this._touchMoved) {
				var inputEvent = eventToInput(event);
				if (this._clickTimer > 0) {
					// If we tapped within the 'click' delay which means there was the first click
					// before that then treat that tap as 'double click'.
					this._click(inputEvent, true); // double tap
				} else {
					this._clickFunc = this._click.bind(this, inputEvent, false);
					this._clickTimer = setTimeout(this._clickFunc, doubleClickDelayInMS); // double tap timeout
				}
			}
		}.bind(this);

		// viewport.onclick = function(event) {
		// 	console.log("click", event.isMarked(), event);
		// }.bind(this);

		// viewport.ondblclick = function(event) {
		// 	console.log("double-click", event.isMarked(), event);
		// }.bind(this);

		viewport.attachBrowserEvent(sap.ui.Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", function(event) {
			// console.log("mousewheel", event.isMarked(), event);
			if (!event.isMarked()) {
				var originalEvent = event.originalEvent;

				var input = {
					x: originalEvent.pageX,
					y: originalEvent.pageY,
					d: 0,
					buttons: event.buttons,
					scroll: originalEvent.detail ? originalEvent.detail * (-40) : originalEvent.wheelDelta,
					n: 2,
					points: [{
						x: originalEvent.pageX,
						y: originalEvent.pageY
					}, {
						x: originalEvent.pageX,
						y: originalEvent.pageY
					}],
					handled: false
				};

				this._beginGesture(input);

				input.points[0].y -= input.scroll * 0.2;
				input.points[1].y += input.scroll * 0.2;
				input.d = Math.abs(input.scroll) * 0.4;

				input.handled = false;
				this._move(input);

				input.handled = false;
				this._endGesture(input);

				if (input.handled) {
					event.setMarked();
					if (!input.passEvent) {
						event.preventDefault();
					}
				}
			}
		}, this);

		viewport.oncontextmenu = function(event) {
			// console.log("contextmenu", event.isMarked(), event);
			var input = eventToInput(event);
			this._contextMenu(input);
		}.bind(this);

		viewport.attachBrowserEvent("keyup", function(event) {
			// viewport.onsapkey = function(event) {
			// console.log("keyup", event)
			this._keyEventHandler(event);
		}, this);
	};

	/**
	 * Adds a viewport event handler to the Loco.
	 *
	 * @param {Object} handler The event handler to be added.
	 * @param {number} priority The priority of the handler.
	 *
	 * @public
	 */
	Loco.prototype.addHandler = function(handler, priority) {
		if (!this.viewport) {
			this.attachViewportEventHandlers(handler.getViewport());
		}

		handler.priority = priority | 0;

		if (this._handlers.indexOf(handler) === -1) {
			this._handlers.push(handler);
		}

		this._handlers.sort(function(a, b) {
			return a.priority - b.priority;
		});
	};

	/**
	 * Removes a viewport event handler from Loco.
	 *
	 * @param {Object} handler to be removed.
	 *
	 * @public
	 */
	Loco.prototype.removeHandler = function(handler) {
		var i = this._handlers.indexOf(handler);
		if (i >= 0) {
			this._handlers.splice(i, 1);
		}
	};

	Loco.prototype._handleInput = function(handlerName, input) {
		for (var i = this._handlers.length - 1; i >= 0 && !input.handled; i--) {
			if (this._handlers[i][handlerName]) {
				this._handlers[i][handlerName](input);
			}
		}

		if (input.handled && input.event) {
			// console.log(input.event.type + " handled");
			if (!input.passEvent) {
				input.event.preventDefault();
			}
		}
	};

	Loco.prototype._beginGesture = function(input) {
		// console.log("beginGesture", input);

		this._handleInput("beginGesture", input);

		this._touchStart = input.timeStamp;
		this._touchMoved = false;
		this._gesture = true;

		this._touchOrigin.x = input.x;
		this._touchOrigin.y = input.y;
		this._n = input.n;
	};

	Loco.prototype._move = function(input) {
		// console.log("move", input);

		// If we tapped and then moved within the 'click' delay then call `_click()` first.
		if (this._clickFunc != null) {
			this._clickFunc();
		}

		if (this._gesture && this._n === input.n) {
			if (!this._touchMoved) {
				this._touchMoved = (input.timeStamp - this._touchStart > 200) &&
					(Math.abs(this._touchOrigin.x - input.x) > 3 || Math.abs(this._touchOrigin.y - input.y) > 3);
			}

			this._handleInput("move", input);
		} else {
			this._handleInput("hover", input);
		}
	};

	Loco.prototype._endGesture = function(input) {
		if (!this._gesture) {
			return;
		}

		// console.log("endGesture", input);

		this._handleInput("endGesture", input);

		this._gesture = false;
	};

	Loco.prototype._click = function(input, isDoubleClick) {
		if (this._clickTimer > 0) {
			clearTimeout(this._clickTimer);
			this._clickTimer = 0;
			this._clickFunc = null;
		}

		// console.log("click", isDoubleClick);

		// if (isDoubleClick) {
		// 	for (var i = this._handlers.length - 1; i >= 0 && !input.handled; i--) {
		// 		var handler = this._handlers[ i ];
		// 		if (!handler.doubleClick) {
		// 			continue;
		// 		}
		// 		var nativeViewportId = handler.getViewport().getId();
		// 		// We extract the parent viewer id.
		// 		// if it exists, it has to be a string which ends in "-nativeViewport"
		// 		var parentViewerId = /-nativeViewport$/.test(nativeViewportId) ? nativeViewportId.replace(/-nativeViewport$/, "") : null;
		// 		// We get the parent viewer by id
		// 		var parentViewer = sap.ui.getCore().byId(parentViewerId);
		// 		// If the parent viewer exists, it has an overlay and also the overlay drawing is in progress,
		// 		// then we don't send the double click event to the viewport handler.
		// 		// We know the drawing is in progress because the mIACreateCB function is defined. If the drawing hasn't started
		// 		// or it has already finished, that function is cleared and it becomes undefined.
		// 		if (!parentViewer || !parentViewer.getOverlay() || !(typeof parentViewer.getOverlay().mIACreateCB === "function")) {
		// 			handler.doubleClick(input);
		// 		}
		// 	}
		// } else {
		// 	this._handleInput("click", input);
		// }

		this._handleInput(isDoubleClick ? "doubleClick" : "click", input);
	};

	Loco.prototype._contextMenu = function(input) {
		this._handleInput("contextMenu", input);
	};

	Loco.prototype._keyEventHandler = function(event) {
		this._handleInput("keyEventHandler", event);
	};
	return Loco;
});
