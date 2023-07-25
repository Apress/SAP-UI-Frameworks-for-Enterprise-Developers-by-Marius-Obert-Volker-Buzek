/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.MoveToolHandler
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

	var MoveToolHandler = EventProvider.extend("sap.ui.vk.tools.MoveToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 13; // the priority of the handler
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._rayCaster = new THREE.Raycaster();
			// this._rayCaster.linePrecision = 0.2;
			this._handleIndex = -1;
			this._gizmoIndex = -1;
			this._handleAxis = new THREE.Vector3();
			this._gizmoOrigin = new THREE.Vector3();
			this._gizmoScale = 1;
			this._objectSpace = new THREE.Matrix4();
			this._mouse = new THREE.Vector2();
		}
	});

	MoveToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
	};

	MoveToolHandler.prototype._updateHandles = function(event, hoverMode) {
		var prevHandleIndex = this._handleIndex;
		this._handleIndex = -1;
		if (event.n === 1 || (event.event && event.event.type === "contextmenu")) {
			for (var i = 0, l = this._gizmo.getGizmoCount(); i < l; i++) {
				var touchObj = this._gizmo.getTouchObject(i);
				var intersects = this._rayCaster.intersectObject(touchObj, true);
				if (intersects.length > 0) {
					this._handleIndex = touchObj.children.indexOf(intersects[0].object);
					if (this._handleIndex >= 0) {
						this._gizmoIndex = i;
						this._gizmoOrigin.setFromMatrixPosition(touchObj.matrixWorld);
						this._gizmoScale = touchObj.scale.x;
						this._objectSpace.extractRotation(touchObj.matrixWorld);
						if (this._gizmo._coordinateSystem !== CoordinateSystem.World) {
							this._objectSpace.copyPosition(touchObj.matrixWorld);
						}
						if (this._handleIndex < 3) {// arrow
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex).normalize();
						} else if (this._handleIndex < 6) {// plane
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex - 3).normalize();
						}
					}
				}
			}
		}

		this._gizmo.highlightHandle(this._handleIndex, hoverMode || this._handleIndex === -1);
		if (prevHandleIndex !== this._handleIndex) {
			this.getViewport().setShouldRenderFrame();
		}
	};

	MoveToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			event.handled |= this._handleIndex >= 0;
		}
	};

	MoveToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			this._gizmo.selectHandle(this._handleIndex, this._gizmoIndex);
			event.handled |= this._handleIndex >= 0;
		}
	};

	var delta = new THREE.Vector3();

	MoveToolHandler.prototype._getAxisOffset = function() {
		var ray = this._rayCaster.ray;
		var dir = this._handleAxis.clone().cross(ray.direction).cross(ray.direction).normalize();
		delta.copy(ray.origin).sub(this._gizmoOrigin);
		return dir.dot(delta) / dir.dot(this._handleAxis);
	};

	MoveToolHandler.prototype._getPlaneOffset = function() {
		var ray = this._rayCaster.ray;
		delta.copy(this._gizmoOrigin).sub(ray.origin);
		var dist = this._handleAxis.dot(delta) / this._handleAxis.dot(ray.direction);
		return ray.direction.clone().multiplyScalar(dist).sub(delta);
	};

	MoveToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, false);
			if (this._handleIndex >= 0) {
				this._gesture = true;
				event.handled = true;
				this._gizmo.selectHandle(this._handleIndex, this._gizmoIndex);
				this._gizmo.beginGesture();
				if (this._handleIndex < 3) {// axis
					this._dragOrigin = this._getAxisOffset();
				} else if (this._handleIndex < 6) {// plane
					this._dragOrigin = this._getPlaneOffset();
				}
			}
		}
	};

	MoveToolHandler.prototype._setOffset = function(offset) {
		if (this._tool.getEnableStepping()) {
			var stepSize = Math.pow(10, Math.round(Math.log10(this._gizmoScale))) * 0.1;
			// console.log("stepSize", stepSize);

			var matInv = new THREE.Matrix4().copy(this._objectSpace).invert();
			var origin = this._gizmoOrigin.clone().applyMatrix4(matInv);
			var pos = this._gizmoOrigin.clone().add(offset).applyMatrix4(matInv);

			for (var i = 0; i < 3; i++) {
				var pos1 = pos.getComponent(i);
				if (Math.abs(pos1 - origin.getComponent(i)) > stepSize * 1e-5) {// if the gizmo is moving along this axis
					var pos2 = Math.round(pos1 / stepSize) * stepSize;
					delta.setFromMatrixColumn(this._objectSpace, i).multiplyScalar(pos2 - pos1);
					offset.add(delta);
				}
			}
		}

		if (isFinite(offset.x) && isFinite(offset.y) && isFinite(offset.z)) {
			this._gizmo._setOffset(offset, this._gizmoIndex);
		}
	};

	MoveToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			if (this._tool.getEnableSnapping()) {
				this._tool.getDetector().detect({ viewport: this._tool._viewport, gizmo: this._gizmo, detectType: "move" });
			}
			event.handled = true;
			this._updateMouse(event);
			if (this._handleIndex < 3) {// axis
				if (isFinite(this._dragOrigin)) {
					this._setOffset(this._handleAxis.clone().multiplyScalar(this._getAxisOffset() - this._dragOrigin));
				}
			} else if (this._handleIndex < 6) {// plane
				if (isFinite(this._dragOrigin.x) && isFinite(this._dragOrigin.y) && isFinite(this._dragOrigin.z)) {
					this._setOffset(this._getPlaneOffset().sub(this._dragOrigin));
				}
			}
		}
	};

	MoveToolHandler.prototype.endGesture = function(event) {
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

	MoveToolHandler.prototype.contextMenu = function(event) {
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
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_PARENT"), key: CoordinateSystem.Parent }),
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_SCREEN"), key: CoordinateSystem.Screen }),
						new MenuItem({ text: getResourceBundle().getText("TOOL_COORDINATE_SYSTEM_CUSTOM"), key: CoordinateSystem.Custom })
					],
					itemSelected: function(event) {
						var item = event.getParameters("item").item;
						this._tool.setCoordinateSystem(item.getKey());
					}.bind(this)
				});
				// var coordinateSystem =  this._tool.getCoordinateSystem();
				// menu.getItems().forEach(function(item) {
				// 	item.setEnabled(item.getKey() !== coordinateSystem);
				// });
				menu.openAsContextMenu(event.event, this.getViewport());
			}
		}
	};

	MoveToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	MoveToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	MoveToolHandler.prototype._inside = function(event) {
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

	return MoveToolHandler;
});
