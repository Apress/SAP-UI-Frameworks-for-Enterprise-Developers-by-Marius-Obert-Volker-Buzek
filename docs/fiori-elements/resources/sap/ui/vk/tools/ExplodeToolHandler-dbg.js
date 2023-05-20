/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ExplodeToolHandler
sap.ui.define([
	"sap/ui/base/EventProvider",
	"./ExplodeToolGizmo",
	"../thirdparty/three"
], function(
	EventProvider,
	ExplodeToolGizmo,
	THREE
) {
	"use strict";

	var ExplodeToolHandler = EventProvider.extend("sap.ui.vk.tools.ExplodeToolHandler", {
		metadata: {
			library: "sap.ui.vk"
		},
		constructor: function(tool) {
			this._priority = 13; // the priority of the handler
			this._tool = tool;
			this._gizmo = tool.getGizmo();
			this._rect = null;
			this._rayCaster = new THREE.Raycaster();
			this._handleIndex = -1;
			this._handleAxis = new THREE.Vector3();
			this._gizmoOrigin = new THREE.Vector3();
			this._mouse = new THREE.Vector2();
		}
	});

	ExplodeToolHandler.prototype._updateMouse = function(event) {
		var size = this.getViewport().getRenderer().getSize(new THREE.Vector2());
		this._mouse.x = ((event.x - this._rect.x) / size.width) * 2 - 1;
		this._mouse.y = ((event.y - this._rect.y) / size.height) * -2 + 1;
		this._rayCaster.setFromCamera(this._mouse, this.getViewport().getCamera().getCameraRef());
		this._rayCaster.far = Infinity;
	};

	ExplodeToolHandler.prototype._updateHandles = function(event, hoverMode) {
		var prevHandleIndex = this._handleIndex;
		this._handleIndex = -1;
		if (event.n === 1 || (event.event && event.event.type === "contextmenu")) {
			this._rayCaster.layers.mask = this._gizmo._getCameraLayersMask();
			for (var i = 0, l = this._gizmo.getGizmoCount(); i < l; i++) {
				var touchObj = this._gizmo.getTouchObject(i);
				var intersects = this._rayCaster.intersectObject(touchObj, true);
				if (intersects.length > 0) {
					// console.log(i, l, intersects);
					this._handleIndex = touchObj.children.indexOf(intersects[0].object);
					if (this._handleIndex >= 0) {
						this._rayCaster.far = intersects[0].distance;
						this._gizmoOrigin.setFromMatrixPosition(touchObj.matrixWorld);
						if (i === 0) {
							this._handleAxis.setFromMatrixColumn(touchObj.matrixWorld, this._handleIndex % 3).normalize().multiplyScalar(this._handleIndex < 3 ? 1 : -1);
						} else {
							this._handleAxis.copy(this._gizmo._axisDirection);
							this._handleIndex += 6;
						}
					}
				}
				// console.log(this._handleIndex);
			}
		}

		this._gizmo.highlightHandle(this._handleIndex, hoverMode || this._handleIndex === -1);
		if (prevHandleIndex !== this._handleIndex) {
			this.getViewport().setShouldRenderFrame();
		}
	};

	ExplodeToolHandler.prototype.hover = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, true);
			event.handled |= this._handleIndex >= 0;
		}
	};

	ExplodeToolHandler.prototype.click = function(event) {
		if (this._inside(event) && !this._gesture) {
			if (this._handleIndex < 0) {
				var hit = this.getViewport().hitTest(event.x - this._rect.x, event.y - this._rect.y);
				if (!hit) {
					this._tool.setSelectedItem(null);
					return;
				}

				var node = hit.object;
				var groupsMap = this._tool.getGizmo()._groupsMap;
				var group = null;
				while (node) {
					group = groupsMap.get(node);
					if (group) {
						this._tool.setSelectedItem(group);
						event.handled = true;
						break;
					}
					node = node.parent;
				}
			} else {
				event.handled = this._handleIndex >= 0;
			}
		}
	};

	var delta = new THREE.Vector3();

	ExplodeToolHandler.prototype._getAxisOffset = function() {
		var ray = this._rayCaster.ray;
		var dir = this._handleAxis.clone().cross(ray.direction).cross(ray.direction).normalize();
		delta.copy(ray.origin).sub(this._gizmoOrigin);
		return dir.dot(delta) / dir.dot(this._handleAxis);
	};

	ExplodeToolHandler.prototype._getPlaneOffset = function() {
		var ray = this._rayCaster.ray;
		delta.copy(this._gizmoOrigin).sub(ray.origin);
		var dist = this._handleAxis.dot(delta) / this._handleAxis.dot(ray.direction);
		return ray.direction.clone().multiplyScalar(dist).sub(delta);
	};

	ExplodeToolHandler.prototype.beginGesture = function(event) {
		if (this._inside(event) && !this._gesture) {
			this._updateMouse(event);
			this._updateHandles(event, false);
			if (this._handleIndex >= 0) {
				this._gesture = true;
				event.handled = true;
				this._gizmo._beginGesture(this._handleIndex);
				this._dragOrigin = this._getAxisOffset();
			}
		}
	};

	ExplodeToolHandler.prototype.move = function(event) {
		if (this._gesture) {
			event.handled = true;
			this._updateMouse(event);
			var offset = this._getAxisOffset() - this._dragOrigin;
			if (isFinite(offset)) {
				this._gizmo._setOffset(offset);
			}
		}
	};

	ExplodeToolHandler.prototype.endGesture = function(event) {
		if (this._gesture) {
			this._gesture = false;
			event.handled = true;
			this._updateMouse(event);

			this._gizmo._endGesture();
			this._dragOrigin = undefined;
			this._updateHandles(event, true);
			this.getViewport().setShouldRenderFrame();
		}
	};

	ExplodeToolHandler.prototype.contextMenu = function(event) {
	};

	ExplodeToolHandler.prototype.getViewport = function() {
		return this._tool._viewport;
	};

	// GENERALIZE THIS FUNCTION
	ExplodeToolHandler.prototype._getOffset = function(obj) {
		var rectangle = obj.getBoundingClientRect();
		var p = {
			x: rectangle.left + window.pageXOffset,
			y: rectangle.top + window.pageYOffset
		};
		return p;
	};

	// GENERALIZE THIS FUNCTION
	ExplodeToolHandler.prototype._inside = function(event) {
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

	return ExplodeToolHandler;
});
