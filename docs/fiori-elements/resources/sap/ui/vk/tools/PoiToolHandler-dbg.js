/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.PoiToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../thirdparty/three"
], function(
	EventProvider,
	THREE
) {
	"use strict";

	var PoiToolHandler = EventProvider.extend("sap.ui.vk.tools.PoiToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 30;
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._poiIndex = -1;
			this._mouse = new THREE.Vector2();
		}
	});

	PoiToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
	};

	PoiToolHandler.prototype._updateActivePOI = function(event) {
		this._poiIndex = -1;
		if (event.n === 1 || (event.event && event.event.type === "contextmenu")) {
			var viewportRect = this._tool._viewport.getDomRef().getBoundingClientRect();
			var hit = this._tool._viewport.hitTest(event.x - viewportRect.left, event.y - viewportRect.top);
			if (hit && hit.object) {
				this._poiZ = new THREE.Vector3().setFromMatrixPosition(hit.object.matrixWorld).project(this.getViewport().getCamera().getCameraRef()).z;

				for (var i = 0, l = this._gizmo.getPOICount(); i < l; i++) {
					if (this._gizmo.getPOI(i) === hit.object) {
						this._poiIndex = i;
						break;
					}
				}
			}
		}
	};

	PoiToolHandler.prototype._getDragPosition = function() {
		return new THREE.Vector3(this._mouse.x, this._mouse.y, this._poiZ).unproject(this.getViewport().getCamera().getCameraRef());
	};

	PoiToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateActivePOI(event, true);
			this._gizmo.selectPOI(this._poiIndex);
			event.handled |= this._poiIndex >= 0;
		}
	};

	PoiToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateActivePOI(event);
			if (this._poiIndex >= 0) {
				this._gesture = true;
				event.handled = true;
				this._gizmo.selectPOI(this._poiIndex);
				this._gizmo.beginGesture();
				this._dragOrigin = this._getDragPosition();
			}
		}
	};

	PoiToolHandler.prototype._setOffset = function(offset) {
		if (isFinite(offset.x) && isFinite(offset.y) && isFinite(offset.z)) {
			this._gizmo._setOffset(offset, this._poiIndex);
		}
	};

	PoiToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._updateMouse(event);
			if (isFinite(this._dragOrigin.x) && isFinite(this._dragOrigin.y) && isFinite(this._dragOrigin.z)) {
				this._setOffset(this._getDragPosition().sub(this._dragOrigin));
			}
		}
	};

	PoiToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._updateMouse(event);

			this._gizmo.endGesture();
			this._dragOrigin = undefined;
			this._updateActivePOI(event);
			this.getViewport().setShouldRenderFrame();
		}
	};

	PoiToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	PoiToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	PoiToolHandler.prototype._inside = function(event) {
		if (this._rect === null || true) {
			var id = this._tool._viewport.getIdForLabel();
			var domobj = document.getElementById(id);

			if (domobj === null) {
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

	return PoiToolHandler;
});
