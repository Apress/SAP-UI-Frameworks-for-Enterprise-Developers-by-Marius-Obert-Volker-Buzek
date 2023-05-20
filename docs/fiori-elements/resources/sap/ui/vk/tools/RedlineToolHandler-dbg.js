/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.RedlineToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/ui/core/Core"
], function(
	EventProvider,
	core
) {
	"use strict";

	var RedlineToolHandler = EventProvider.extend("sap.ui.vk.tools.RedlineToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 30; // the priority of the handler
			this._tool = tool;
			this._rect = null;
			this._zoomFactor = 1;
		}
	});

	RedlineToolHandler.prototype.destroy = function() {
		this._tool = null;
		this._rect = null;
	};

	RedlineToolHandler.prototype.init = function() {
		this._previousHoverTarget = null;
	};

	RedlineToolHandler.prototype.beginGesture = function(event) {
		// var viewport = this.getViewport();
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			if (gizmo._textEditingElement) {
				event.handled = true;

				var hit = this.hitTest(event.x, event.y);
				if (hit !== gizmo._textEditingElement) {
					var domRef = gizmo._textEditingElement.getDomRef();
					if (domRef) {
						domRef.childNodes[0].blur(); // stop text editing
					}
					return;
				}

				event.passEvent = true; // pass event to the native textArea element

				if (hit === gizmo._textEditingElement) {
					return;
				}
			}

			this._gesture = true;

			gizmo._activeElement = event.buttons === 1 && gizmo.getAggregation("activeElement") || null;
			if (gizmo._activeElement) {
				event.handled = true;

				var boundingClientRect = gizmo.getDomRef().getBoundingClientRect(),
					pos = gizmo._toVirtualSpace(event.x - boundingClientRect.left - window.pageXOffset, event.y - boundingClientRect.top - window.pageYOffset);

				gizmo._activeElement.setOriginX(pos.x);
				gizmo._activeElement.setOriginY(pos.y);
				gizmo.rerender();
			} else {
				this._pivotPoint = gizmo._toVirtualSpace(event.x - this._rect.x, event.y - this._rect.y);
			}
		}
	};

	RedlineToolHandler.prototype.move = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._gesture) {
			if (gizmo._textEditingElement) {
				event.handled = true;
				event.passEvent = true; // pass event to the native textArea element
			} else if (gizmo._activeElement) {
				event.handled = true;
				var boundingClientRect = gizmo.getDomRef().getBoundingClientRect(),
					x = event.x - boundingClientRect.left - window.pageXOffset,
					y = event.y - boundingClientRect.top - window.pageYOffset;
				gizmo._activeElement.edit(x, y, event.event && event.event.shiftKey);
			}
		}
	};

	RedlineToolHandler.prototype.endGesture = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._inside(event)) {
			this._gesture = false;

			if (gizmo._textEditingElement) {
				event.handled = true;
				event.passEvent = true; // pass event to the native textArea element
			} else if (gizmo._activeElement) {
				event.handled = true;
				gizmo._stopAdding(true);
			}
		}
	};

	RedlineToolHandler.prototype.pan = function(deltaX, deltaY) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && (deltaX || deltaY)) {
			gizmo.getRedlineElements().forEach(function(element) {
				element.setOriginX(element.getOriginX() + gizmo._toVirtualSpace(deltaX));
				element.setOriginY(element.getOriginY() + gizmo._toVirtualSpace(deltaY));
			});

			gizmo.rerender();
		}
	};

	RedlineToolHandler.prototype.zoom = function(zoomDelta, x, y) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && zoomDelta !== 1) {
			var scaleChange = 1 - zoomDelta,
				pivotPoint = (x !== undefined && y !== undefined) ? gizmo._toVirtualSpace(x, y) : this._pivotPoint;

			gizmo.getRedlineElements().forEach(function(element) {
				element.applyZoom(zoomDelta);
				var originX = element.getOriginX(),
					originY = element.getOriginY();
				originX += (pivotPoint.x - originX) * scaleChange;
				originY += (pivotPoint.y - originY) * scaleChange;
				element.setOriginX(originX);
				element.setOriginY(originY);
			});

			gizmo.rerender();
		}
	};

	RedlineToolHandler.prototype.hitTest = function(x, y) {
		var hit;
		var toleranceX = 6;
		var toleranceY = 6;

		var hitTest = function(x, y) {
			var htmlElement = document.elementFromPoint(x, y);
			if (htmlElement) {
				var element = core.byId(htmlElement.id || htmlElement.parentNode.id);
				if (element instanceof sap.ui.vk.RedlineElement) {
					return element;
				}
			}
		};

		hit = hitTest(x, y);
		if (!hit) {
			for (var y2 = y - toleranceY; y2 < y + toleranceY; y2++) {
				for (var x2 = x - toleranceX; x2 < x + toleranceX; x2++) {
					hit = hitTest(x2, y2);
					if (hit) {
						return hit;
					}
				}
			}
		}

		return hit ? hit : null;
	};

	RedlineToolHandler.prototype.click = function(event) {
		var hit = this.hitTest(event.x, event.y);
		if (hit) {
			this._tool.fireElementClicked({ elementId: hit.getElementId() });
		}
	};

	RedlineToolHandler.prototype.doubleClick = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && this._tool.getEditable()) {
			var hit = this.hitTest(event.x, event.y);
			if (hit instanceof sap.ui.vk.RedlineElementText) {
				gizmo.editTextElement(hit);
				event.handled = true;
			}
		}
	};

	RedlineToolHandler.prototype.hover = function(event) {
		var gizmo = this._tool.getGizmo();
		if (gizmo && gizmo._textEditingElement) {
			event.passEvent = true;
			return; // no hover events in text edit mode
		}

		var hit = this.hitTest(event.x, event.y);
		if (hit && hit.getElementId() != this._previousHoverTarget) {
			this._previousHoverTarget = hit.getElementId();
			this._tool.fireElementHovered({ elementId: hit.getElementId() });
		} else if (!hit && hit != this._previousHoverTarget) {
			this._previousHoverTarget = hit;
			this._tool.fireElementHovered({ elementId: null });
		}
	};

	RedlineToolHandler.prototype.contextMenu = function(event) { };

	RedlineToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	RedlineToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	RedlineToolHandler.prototype._inside = function(event) {
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

	return RedlineToolHandler;
});
