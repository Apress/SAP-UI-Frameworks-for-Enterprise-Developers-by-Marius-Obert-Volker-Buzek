/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AxisAngleRotationToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"../getResourceBundle",
	"../thirdparty/three",
	"./CoordinateSystem"
], function(
	EventProvider,
	Menu,
	MenuItem,
	getResourceBundle,
	THREE,
	CoordinateSystem
) {
	"use strict";

	var AxisAngleRotationToolHandler = EventProvider.extend("sap.ui.vk.tools.AxisAngleRotationToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 12; // the priority of the handler
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._rayCaster = new THREE.Raycaster();
			this._rayCaster.linePrecision = 0.2;
			this._handleIndex = -1;
			this._gizmoIndex = -1;
			this._matrixOrigin = new THREE.Matrix4();
			this._mouse = new THREE.Vector2();
			this._mouseOrigin = new THREE.Vector2();
		}
	});

	AxisAngleRotationToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
	};

	AxisAngleRotationToolHandler.prototype._updateHandles = function(event, hoverMode) {
		var prevHandleIndex = this._handleIndex;
		this._handleIndex = -1;
		if (event.n === 1 || (event.event && event.event.type === "contextmenu")) {
			for (var i = 0, l = this._gizmo.getGizmoCount(); i < l; i++) {
				var touchObj = this._gizmo.getTouchObject(i);
				var intersects = this._rayCaster.intersectObject(touchObj, true);
				if (intersects.length > 0) {
					this._handleIndex = touchObj.children.indexOf(intersects[0].object);
					if (this._handleIndex >= 0 && this._handleIndex < 6) {
						this._gizmoIndex = i;
						this._matrixOrigin.copy(intersects[0].object.matrixWorld);
						this._objectSize = this._gizmo._getObjectSize(i) / this._gizmo._getGizmoScale(touchObj.position);
					}
				}
			}
		}

		this._gizmo.highlightHandle(this._handleIndex, this._gizmoIndex, hoverMode || this._handleIndex === -1);
		if (prevHandleIndex !== this._handleIndex) {
			this.getViewport().setShouldRenderFrame();
		}
	};

	AxisAngleRotationToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			event.handled |= this._handleIndex >= 0;
		}
	};

	AxisAngleRotationToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			this._gizmo.selectHandle(this._handleIndex, this._gizmoIndex);
			event.handled |= this._handleIndex >= 0;
		}
	};

	AxisAngleRotationToolHandler.prototype._getMouseAngle = function() {
		var ray = this._rayCaster.ray;
		var delta = this._rotationPoint.clone().sub(ray.origin);
		var dist = this._rotationAxis.dot(delta) / this._rotationAxis.dot(ray.direction);
		var mouseDirection = ray.direction.clone().multiplyScalar(dist).sub(delta).normalize();
		return Math.atan2(mouseDirection.dot(this._axis2), mouseDirection.dot(this._axis1));
	};

	AxisAngleRotationToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, false);
			if (this._handleIndex >= 0 && this._handleIndex < 3) {
				event.handled = true;
				this._gesture = true;
				this._mouseOrigin.copy(event);
				this._gizmo.selectHandle(this._handleIndex, this._gizmoIndex);
				this._gizmo.beginGesture();

				this._axis1 = new THREE.Vector3().setFromMatrixColumn(this._matrixOrigin, (this._handleIndex + 1) % 3).normalize();
				this._axis2 = new THREE.Vector3().setFromMatrixColumn(this._matrixOrigin, (this._handleIndex + 2) % 3).normalize();
				this._rotationAxis = new THREE.Vector3().crossVectors(this._axis1, this._axis2).normalize();
				this._rotationPoint = new THREE.Vector3().setFromMatrixPosition(this._matrixOrigin);
				if (Math.abs(this._rayCaster.ray.direction.dot(this._rotationAxis)) < Math.cos(Math.PI * 85 / 180)) {// |90° - angle| < 5°
					var matCamera = this.getViewport().getCamera().getCameraRef().matrixWorld;
					this._axis1.setFromMatrixColumn(matCamera, 0).normalize();
					this._axis2.setFromMatrixColumn(matCamera, 1).normalize();
					this._rotationAxis.setFromMatrixColumn(matCamera, 2).normalize();
				}

				// calculate start angle
				this._startAngle = THREE.MathUtils.degToRad(this._gizmo.getValue());
				this._prevAngle = this._getMouseAngle();
				this._deltaAngle = 0;
			}
		}
	};

	AxisAngleRotationToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._updateMouse(event);

			var mouseAngle = this._getMouseAngle();
			var moveDelta = mouseAngle - this._prevAngle;
			this._prevAngle = mouseAngle;
			if (moveDelta > Math.PI) {
				moveDelta -= Math.PI * 2;
			} else if (moveDelta < -Math.PI) {
				moveDelta += Math.PI * 2;
			}

			this._deltaAngle += moveDelta;

			var angle1 = this._startAngle;
			var angle2 = angle1 + this._deltaAngle;

			if (this._tool.getEnableStepping()) {
				var step = 5; // default rotation step in degrees
				if (this._objectSize > 0) {
					var steps = [0.1, 1, 5, 15]; // rotation steps in degrees
					var sizes = [2000, 1000, 300, 0]; // correspond object sizes in pixels
					for (var i = 0; i < 4; i++) {
						if (this._objectSize >= sizes[i]) {
							step = steps[i];
							break;
						}
					}
				}

				step = THREE.MathUtils.degToRad(step);
				angle2 = Math.round(angle2 / step) * step;
			}

			if (this._tool.getEnableSnapping()) {
				this._tool.getDetector().detect({
					viewport: this._tool._viewport,
					gizmo: this._gizmo,
					detectType: "rotate",
					handleIndex: this._handleIndex,
					angle1: angle1,
					angle2: angle2
				});
			}

			if (isFinite(angle1) && isFinite(angle2)) {
				this._gizmo._setRotationAxisAngle(this._handleIndex, angle1, angle2);
			}
		}
	};

	AxisAngleRotationToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._updateMouse(event);

			this._gizmo.endGesture();
			this._updateHandles(event, true);
			this.getViewport().setShouldRenderFrame();
		}
	};

	AxisAngleRotationToolHandler.prototype.contextMenu = function(event) {
		if (!this._tool.getAllowContextMenu()) {
			return;
		}
		if (this._inside(event)) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			if (this._handleIndex >= 0) {
				event.handled = true;
			}
		}
	};

	AxisAngleRotationToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	AxisAngleRotationToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	AxisAngleRotationToolHandler.prototype._inside = function(event) {
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

	return AxisAngleRotationToolHandler;
});
