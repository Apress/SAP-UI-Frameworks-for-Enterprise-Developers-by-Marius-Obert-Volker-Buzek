/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AnchorPointToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"../getResourceBundle",
	"../thirdparty/three"
], function(
	EventProvider,
	Menu,
	MenuItem,
	getResourceBundle,
	THREE
) {
	"use strict";

	var AnchorPointToolHandler = EventProvider.extend("sap.ui.vk.tools.AnchorPointToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 10; // the priority of the handler
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
			this._matrixOrigin = new THREE.Matrix4();
			this._rotationOrigin = new THREE.Matrix4();
			this._mouse = new THREE.Vector2();
			this._mouseOrigin = new THREE.Vector2();
		}
	});

	AnchorPointToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
	};

	AnchorPointToolHandler.prototype._updateHandles = function(event, hoverMode) {
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
						this._matrixOrigin.copy(touchObj.matrixWorld);
						this._gizmoScale = touchObj.scale.x;
						this._rotationOrigin.extractRotation(touchObj.matrixWorld);
						if (this._handleIndex < 3) {// arrow
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex).normalize();
						} else if (this._handleIndex < 6) {// plane
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex - 3).normalize();
						} else if (this._handleIndex < 9) {// plane
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex - 6).normalize();
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

	AnchorPointToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			event.handled |= this._handleIndex >= 0;
		}
	};

	AnchorPointToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			this._gizmo.selectHandle(this._handleIndex);
			event.handled |= this._handleIndex >= 0;
		}
	};

	var delta = new THREE.Vector3();

	AnchorPointToolHandler.prototype._getAxisOffset = function() {
		var ray = this._rayCaster.ray;
		var dir = this._handleAxis.clone().cross(ray.direction).cross(ray.direction).normalize();
		delta.copy(ray.origin).sub(this._gizmoOrigin);
		return dir.dot(delta) / dir.dot(this._handleAxis);
	};

	AnchorPointToolHandler.prototype._getPlaneOffset = function() {
		var ray = this._rayCaster.ray;
		delta.copy(this._gizmoOrigin).sub(ray.origin);
		var dist = this._handleAxis.dot(delta) / this._handleAxis.dot(ray.direction);
		return ray.direction.clone().multiplyScalar(dist).sub(delta);
	};

	AnchorPointToolHandler.prototype._getMouseAngle = function() {
		var ray = this._rayCaster.ray;
		var delta = this._rotationPoint.clone().sub(ray.origin);
		var dist = this._rotationAxis.dot(delta) / this._rotationAxis.dot(ray.direction);
		var mouseDirection = ray.direction.clone().multiplyScalar(dist).sub(delta).normalize();
		return Math.atan2(mouseDirection.dot(this._axis2), mouseDirection.dot(this._axis1));
	};

	AnchorPointToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, false);
			if (this._handleIndex >= 0) {
				event.handled = true;
				this._gesture = true;
				this._mouseOrigin.copy(event);
				this._gizmo.selectHandle(this._handleIndex);
				this._gizmo.beginGesture();

				if (this._handleIndex < 3) {// axis
					this._dragOrigin = this._getAxisOffset();
				} else if (this._handleIndex < 6) {// plane
					this._dragOrigin = this._getPlaneOffset();
				} else if (this._handleIndex < 9) {
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

					// calculate level angle
					var levelDir = this._axis1.clone();
					var minDP = 2;
					for (var i = 0; i < 3; i++) {
						var axis = new THREE.Vector3().setComponent(i, 1);
						var dp = this._rotationAxis.dot(axis);
						if (minDP > dp) {
							minDP = dp;
							levelDir.copy(axis);
						}
					}
					levelDir.sub(this._rotationAxis.clone().multiplyScalar(levelDir.dot(this._rotationAxis))).normalize();
					this._levelAngle = Math.atan2(levelDir.dot(this._axis2), levelDir.dot(this._axis1));

					// calculate start angle
					this._startAngle = this._getMouseAngle();
					this._prevDeltaAngle = 0;
				}
			}
		}
	};

	AnchorPointToolHandler.prototype._setOffset = function(offset) {
		if (this._tool.getEnableStepping()) {
			var stepSize = Math.pow(10, Math.round(Math.log10(this._gizmoScale))) * 0.1;

			var matInv = new THREE.Matrix4().copy(this._rotationOrigin).invert();
			var origin = this._gizmoOrigin.clone().applyMatrix4(matInv);
			var pos = this._gizmoOrigin.clone().add(offset).applyMatrix4(matInv);

			for (var i = 0; i < 3; i++) {
				var pos1 = pos.getComponent(i);
				if (Math.abs(pos1 - origin.getComponent(i)) > stepSize * 1e-5) {// if the gizmo is moving along this axis
					var pos2 = Math.round(pos1 / stepSize) * stepSize;
					delta.setFromMatrixColumn(this._rotationOrigin, i).multiplyScalar(pos2 - pos1);
					offset.add(delta);
				}
			}
		}

		this._gizmo._setOffset(offset, this._gizmoIndex);
	};

	AnchorPointToolHandler.prototype.move = function(event) {
		if (this._gesture) {
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
			} else if (this._handleIndex < 9) {
				var angle1 = this._startAngle;

				var deltaAngle = this._getMouseAngle() - angle1;
				if (deltaAngle > Math.PI) {
					deltaAngle -= Math.PI * 2;
				} else if (deltaAngle < -Math.PI) {
					deltaAngle += Math.PI * 2;
				}

				if (Math.abs(this._prevDeltaAngle) > Math.PI / 4) {
					if (this._prevDeltaAngle * deltaAngle < 0) {
						deltaAngle += Math.PI * 2 * Math.sign(this._prevDeltaAngle);
					}
				}

				deltaAngle = deltaAngle % (Math.PI * 2);
				var angle2 = angle1 + deltaAngle;

				if (this._tool.getEnableStepping()) {
					var step = THREE.MathUtils.degToRad(5); // default rotation step in degrees
					var angle = angle2 - angle1 - this._levelAngle;
					angle2 += Math.round(angle / step) * step - angle;
				}

				this._prevDeltaAngle = angle2 - angle1;

				if (isFinite(angle1) && isFinite(angle2)) {
					this._gizmo._setRotationAxisAngle(this._handleIndex - 6, angle1, angle2);
				}
			}
		}
	};

	AnchorPointToolHandler.prototype.endGesture = function(event) {
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

	function getSelection(viewStateManager) {
		var selection = [];
		if (viewStateManager) {
			viewStateManager.enumerateSelection(function(node) {
				selection.push(node);
			});
		}
		return selection;
	}

	AnchorPointToolHandler.prototype.contextMenu = function(event) {
		if (!this._tool.getAllowContextMenu()) {
			return;
		}
		if (this._inside(event)) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			if (this._handleIndex >= 0) {
				event.handled = true;
				var viewport = this.getViewport();
				var menu = new Menu({
					items: [
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_WORLD_ORIGIN") }),
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_SELECTION_CENTER") }),
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_SCENE_CENTER") }),
						new MenuItem({ text: getResourceBundle().getText("ANCHOR_POINT_TOOL_MOVE_TO_SELECTED_OBJECTS_ORIGIN") })
					],
					itemSelected: function(event) {
						var item = event.getParameters("item").item;
						var index = event.getSource().indexOfItem(item);
						var pos = new THREE.Vector3();
						switch (index) {
							default:
							case 0: // world origin
								break;

							case 1: // center of selection
								this._tool.moveTo(getSelection(viewport._viewStateManager), false);
								return;

							case 2: // scene center
								var scene = viewport.getScene() ? viewport.getScene().getSceneRef() : null;
								if (scene) {
									var boundingBox = new THREE.Box3();
									scene._expandBoundingBox(boundingBox, null, true);
									boundingBox.getCenter(pos);
								}
								break;

							case 3: // selected object's origin
								this._tool.moveTo(getSelection(viewport._viewStateManager), true);
								return;
						}
						this._gizmo.setPosition(pos);
						viewport.setShouldRenderFrame();
					}.bind(this)
				});
				menu.openAsContextMenu(event.event, viewport);
			}
		}
	};

	AnchorPointToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	AnchorPointToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	AnchorPointToolHandler.prototype._inside = function(event) {
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

	return AnchorPointToolHandler;
});
