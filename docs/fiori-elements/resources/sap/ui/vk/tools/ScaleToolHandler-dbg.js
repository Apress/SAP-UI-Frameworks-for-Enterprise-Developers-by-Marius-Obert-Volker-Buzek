/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ScaleToolHandler
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

	var ScaleToolHandler = EventProvider.extend("sap.ui.vk.tools.ScaleToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 11; // the priority of the handler
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._rayCaster = new THREE.Raycaster();
			// this._rayCaster.linePrecision = 0.1;
			this._handleIndex = -1;
			this._gizmoIndex = -1;
			this._handleAxis = new THREE.Vector3();
			this._handleDirection = new THREE.Vector3();
			this._gizmoOrigin = new THREE.Vector3();
			this._mouse = new THREE.Vector2();
			this._mouseOrigin = new THREE.Vector2();
			this._originScale = 1;
			this._objectSize = 1;
		}
	});

	ScaleToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
	};

	ScaleToolHandler.prototype._updateHandles = function(event, hoverMode) {
		var prevHandleIndex = this._handleIndex;
		this._handleIndex = -1;
		if (event.n === 1 || (event.event && event.event.type === "contextmenu")) {
			for (var i = 0, l = this._gizmo.getGizmoCount(); i < l; i++) {
				var touchObj = this._gizmo.getTouchObject(i);
				var intersects = this._rayCaster.intersectObjects(touchObj.children, false);
				if (intersects.length > 0) {
					this._handleIndex = touchObj.children.indexOf(intersects[0].object);
					if (this._handleIndex >= 0) {
						this._gizmoIndex = i;
						this._gizmoOrigin.setFromMatrixPosition(touchObj.matrixWorld);
						this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex % 3).normalize();
						this._originScale = this._gizmo._getObjectScale(i).x;
						this._objectSize = (this._gizmo._getObjectSize(i) / touchObj.scale.x) || 1;

						var axis1 = new THREE.Vector3().setFromMatrixColumn(touchObj.matrixWorld, (this._handleIndex + 1) % 3).normalize();
						var axis2 = new THREE.Vector3().setFromMatrixColumn(touchObj.matrixWorld, (this._handleIndex + 2) % 3).normalize();
						this._handleDirection.addVectors(axis1, axis2).normalize();
						// if (this._handleIndex < 3) {// arrow
						// 	this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex).normalize();
						// } else if (this._handleIndex < 6) {// plane
						// 	this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex - 3).normalize();
						// }
					}
				}
			}
		}

		this._gizmo.highlightHandle(this._handleIndex, hoverMode || this._handleIndex === -1);
		if (prevHandleIndex !== this._handleIndex) {
			this.getViewport().setShouldRenderFrame();
		}
	};

	ScaleToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			event.handled |= this._handleIndex >= 0;
		}
	};

	ScaleToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			this._gizmo.selectHandle(this._handleIndex, this._gizmoIndex);
			event.handled |= this._handleIndex >= 0;
		}
	};

	ScaleToolHandler.prototype._getAxisOffset = function() {
		var ray = this._rayCaster.ray;
		var dir = this._handleAxis.clone().cross(ray.direction).cross(ray.direction).normalize();
		var delta = ray.origin.clone().sub(this._gizmoOrigin);
		return dir.dot(delta) / dir.dot(this._handleAxis);
	};

	ScaleToolHandler.prototype._getPlaneOffset = function() {
		var ray = this._rayCaster.ray;
		var delta = this._gizmoOrigin.clone().sub(ray.origin);
		var dist = this._handleAxis.dot(delta) / this._handleAxis.dot(ray.direction);
		return ray.direction.clone().multiplyScalar(dist).sub(delta);
	};

	ScaleToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, false);
			if (this._handleIndex >= 0) {
				this._gesture = true;
				event.handled = true;

				this._mouseOrigin.set(event.x, event.y);
				this._gizmo.selectHandle(this._handleIndex, this._gizmoIndex);
				this._gizmo.beginGesture();

				if (this._handleIndex < 3) {// axis
					this._dragOrigin = this._getAxisOffset();
				} else if (this._handleIndex < 6) {// plane
					this._dragOrigin = this._handleDirection.dot(this._getPlaneOffset());
				}
			}
		}
	};

	ScaleToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			if (this._tool.getEnableSnapping()) {
				this._tool.getDetector().detect({ viewport: this._tool._viewport, gizmo: this._gizmo, detectType: "scale" });
			}
			event.handled = true;
			this._updateMouse(event);

			var scale = new THREE.Vector3().setScalar(1);
			if (this._handleIndex < 3) {// axis
				if (this._tool.getNonUniformScaleEnabled()) {
					scale.setComponent(this._handleIndex, this._getAxisOffset() / this._dragOrigin);
				} else {
					scale.setScalar(this._getAxisOffset() / this._dragOrigin);
				}
			} else if (this._handleIndex < 6) {// plane
				scale.setScalar(this._handleDirection.dot(this._getPlaneOffset()) / this._dragOrigin).setComponent(this._handleIndex - 3, 1);
			} else {
				var dy = (this._mouseOrigin.y - event.y) / 60;
				scale.setScalar(dy >= 0 ? 1 + dy : 1 / (1 - dy));
			}

			if (scale.x && scale.y && scale.z && isFinite(scale.x) && isFinite(scale.y) && isFinite(scale.z)) {// ignore 0 or NaN scale
				if (this._tool.getEnableStepping()) {
					var scaleStep = Math.pow(10, Math.round(Math.log10(this._originScale / this._objectSize))) / this._originScale;
					if (scaleStep > 0 && isFinite(scaleStep)) {
						scale.setScalar(Math.max(Math.round(scale.x / scaleStep), 1) * scaleStep);
					}
				}

				this._gizmo._setScale(scale);
			}
		}
	};

	ScaleToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._updateMouse(event);

			this._gizmo.endGesture();
			this._dragOrigin = undefined;
			this._updateHandles(event, true);
			this.getViewport().setShouldRenderFrame();
		}
	};

	ScaleToolHandler.prototype.contextMenu = function(event) {
		if (!this._tool.getAllowContextMenu()) {
			return;
		}
		if (this._inside(event)) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			if (this._handleIndex >= 0) {
				event.handled = true;
				var menu = new Menu({
					items: [
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_WORLD"), key: CoordinateSystem.World }),
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_LOCAL"), key: CoordinateSystem.Local }),
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_SCREEN"), key: CoordinateSystem.Screen }),
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_CUSTOM"), key: CoordinateSystem.Custom })
					],
					itemSelected: function(event) {
						var item = event.getParameters("item").item;
						this._tool.setCoordinateSystem(item.getKey());
					}.bind(this)
				});
				menu.openAsContextMenu(event.event, this.getViewport());
			}
		}
	};

	ScaleToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	ScaleToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	ScaleToolHandler.prototype._inside = function(event) {
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

	return ScaleToolHandler;
});
