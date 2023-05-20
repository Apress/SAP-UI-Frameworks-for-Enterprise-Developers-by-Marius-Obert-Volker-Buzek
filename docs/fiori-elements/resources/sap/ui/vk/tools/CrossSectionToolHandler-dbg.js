/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CrossSectionToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"../thirdparty/three"
], function(
	EventProvider,
	THREE
) {
	"use strict";

	var CrossSectionToolHandler = EventProvider.extend("sap.ui.vk.tools.CrossSectionToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 20; // the priority of the handler
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._mouse = new THREE.Vector2();
			this._rayCaster = new THREE.Raycaster();
			this._rayCaster.linePrecision = 0;
			// this._gizmoOrigin = new THREE.Vector3();
			this._gizmoAxis = new THREE.Vector3();
			this._dragOrigin = new THREE.Vector2();
			this._dragOffset = 0;
			this._dragDelta = 0;
		}
	});

	CrossSectionToolHandler.prototype._updateRayCaster = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
	};

	CrossSectionToolHandler.prototype._updateArrowHandle = function(event) {
		var touchObj = this._gizmo.getTouchObject();
		var axisIndex = -1;
		if (event.n === 1) {
			this._updateRayCaster(event);
			var intersects = this._rayCaster.intersectObject(touchObj, true);
			axisIndex = intersects.length > 0 ? this._gizmo.getAxis() : -1;
		}
		if (axisIndex !== this._axisIndex) {
			this._axisIndex = axisIndex;
			this._gizmo.highlightArrowHandle(axisIndex >= 0);
			if (axisIndex >= 0) {
				// 	this._gizmoOrigin.setFromMatrixPosition(touchObj.matrixWorld);
				this._gizmoAxis.setScalar(0).setComponent(this._axisIndex, 1);
			}
			this.getViewport().setShouldRenderFrame();
		}
	};

	// CrossSectionToolHandler.prototype._getAxisOffset = function() {
	// 	var ray = this._rayCaster.ray;
	// 	var dir = this._gizmoAxis.clone().cross(ray.direction).cross(ray.direction).normalize();
	// 	var delta = ray.origin.clone().sub(this._gizmoOrigin);
	// 	return dir.dot(delta) / dir.dot(this._gizmoAxis);
	// };

	CrossSectionToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateArrowHandle(event);
			event.handled |= this._axisIndex >= 0;
		}
	};

	CrossSectionToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateArrowHandle(event);
			this._gizmo.selectHandle(this._axisIndex);
			event.handled |= this._axisIndex >= 0;
		}
	};

	CrossSectionToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateArrowHandle(event);
			this._gizmo.selectHandle(this._axisIndex);

			if (this._axisIndex >= 0) {
				this._gesture = true;
				event.handled = true;
				// this._dragOrigin = this._getAxisOffset() - this._gizmo._getOffset();
				this._dragOrigin.set(event.x, event.y);
				this._dragOffset = this._gizmo._getOffset();
				this._dragDelta = this._gizmo._getDelta() / 500;
			}
		}
	};

	CrossSectionToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._updateRayCaster(event);

			// if (isFinite(this._dragOrigin)) {
			// 	this._gizmo._setOffset(this._getAxisOffset() - this._dragOrigin);
			// }
			var dir = this._gizmoAxis.clone().applyQuaternion(this.getViewport().getCamera().getCameraRef().quaternion.clone().invert());
			dir.z = 0;
			dir.normalize();
			if (dir.x === 0 && dir.y === 0) {
				dir.y = 1;
			}
			this._gizmo._setOffset(this._dragOffset + ((event.x - this._dragOrigin.x) * dir.x - (event.y - this._dragOrigin.y) * dir.y) * this._dragDelta);

		}
	};

	CrossSectionToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._updateArrowHandle(event);
		}
	};

	CrossSectionToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	CrossSectionToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	CrossSectionToolHandler.prototype._inside = function(event) {
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

	return CrossSectionToolHandler;
});
