/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.vbm.adapter3d.DragDropHandler
sap.ui.define([
	"sap/ui/base/Object",
	"./Utilities",
	"./thirdparty/three",
	"sap/base/Log"
], function(BaseObject, Utilities, THREE, Log) {
	"use strict";

	// Aliases
	var Color       = THREE.Color;
	var Vector2	    = THREE.Vector2;
	var Vector3	    = THREE.Vector3;
	var Matrix4	   	= THREE.Matrix4;
	var toColor		= Utilities.toColor;
	var toBoolean	= Utilities.toBoolean;
	var vbToThreeJs = Utilities.vbToThreeJs;
	var threeJsToVb	= Utilities.threeJsToVb;
	var thisModule  = "sap.ui.vbm.DragDropHandler";

	// Constants
	var RED   = new Color(1,0,0);
	var GREEN = new Color(0,1,0);
	var BLUE  = new Color(0,0,1);
	var BLACK = new Color(0,0,0);
	var CYAN  = new Color(0,1,1);

	var X_DIR = new Vector3(1,0,0);
	var Y_DIR = new Vector3(0,1,0);
	var Z_DIR = new Vector3(0,0,1);

	var CONFIG_SNAP_X_COLOR = "SNAP_X_COLOR";
	var CONFIG_SNAP_Y_COLOR = "SNAP_Y_COLOR";
	var CONFIG_SNAP_Z_COLOR = "SNAP_Z_COLOR";

	var CONFIG_SNAP_COLOR = "SNAP_COLOR";
	var CONFIG_SNAP_HIGHLIGHT_COLOR = "SNAP_HIGHLIGHT_COLOR";

	var DIR_LENGTH = 10000.0;
	var COLLISION_DISTANCE = 0.01;
	var AXIS_SNAP_DISTANCE =  0.04;

	var SNAP_POINTS_COUNT =  8; // max amount of snapping points

	// To avoid allocation with every function call
	var _p1 = new Vector3();
	var _p2 = new Vector3();
	var _p3 = new Vector3();
	var _p4 = new Vector3();
	var _p5 = new Vector3();
	var _matrix = new Matrix4();
	var _pointer = new Vector2();
	var _box = new THREE.Box3();
	var _ray = new THREE.Ray();
	var _line = new THREE.Line3();
	var _raycaster = new THREE.Raycaster();
	var _quaternion = new THREE.Quaternion();

	var STATE = {
		PICK: 0,
		DRAG: 1
	};

	// Viewport event delegate. 'this' object in all methods is DragDropHandler instance
	var viewportEventDelegate = {
		onBeforeRendering: function(event) {
			this._unsubscribe();
		},
		onAfterRendering: function(event) {
			this._subscribe();
		}
	};

	/**
	 * Constructor for a new drag and drop handler.
	 *
	 * @class
	 * Provides a class for handling drag and drop operation.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vbm.adapter3d.DragDropHandler
	 */
	var DragDropHandler = BaseObject.extend("sap.ui.vbm.adapter3d.DragDropHandler", /** @lends sap.ui.vbm.adapter3d.DragDropHandler.prototype */ {

		constructor: function(adapter) {
			BaseObject.call(this);

			this._adapter = adapter;                             // fire submit event
			this._context = adapter._context;                    // access evaluated data
			this._viewport = adapter._viewport;                  // events
			this._root = this._viewport._root;
			this._scene = this._viewport._scene;
			this._camera = this._viewport._camera;
			this._cameraControls = this._viewport._cameraController;

			// current action state
			this._state = STATE.PICK;

			// indicate whether snapping enabled during drag and drop
			this._snapping = false;

			// flag indicates movement is done by X, Y, Z axes only i.e always snapping
			this._snapAlways = false;

			// flag indicates whether movement is locked to axis or not
			this._lockToAxis = false;

			// snapped axis (Vector3) and Color or null if it's not snapped to axis
			this._snapAxis = null;

			// set of instances which marked as changeable and which may participate in drag and drop action, updated with every payload
			this._changeables = new Set();

			// array of changeable 3d objects for hit test, updated with every payload and with every drag and drop action
			this._changeables3d = [];

			// Instances participating in drag and drop action, updated with every drag and drop action
			this._instances = [];

			// drag and drop origin instance
			this._origin = null;

			// hovered instance
			this._hovered = null;

			// touch point where Drag and Drop started (world CRD)
			this._touch = null;

			// offset between touch point and touch object origin
			this._offset = new Vector3();

			// movement plane
			this._plane = new THREE.Plane();

			// drag and drop origin object's parent world inverse
			this._inverseMatrix = new Matrix4();

			// evaluated colors for axes
			this._xAxisColor = RED;
			this._yAxisColor = BLUE;
			this._zAxisColor = GREEN;

			// Snap line object & materials
			this._lineMaterialSolid = new THREE.LineBasicMaterial({
				depthTest: false,
				depthWrite: false,
				color: 0x000000,
				linewidth: 1,
				transparent: true,
				opacity: 0.99
			});

			this._lineMaterialDashed = new THREE.LineDashedMaterial({
				depthTest: false,
				depthWrite: false,
				color: 0x000000,
				linewidth: 1,
				scale: 1,
				dashSize: 0.1,
				gapSize: 0.06,
				transparent: true,
				opacity: 0.99
			});

			this._snapLine = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints([new Vector3(), new Vector3()]),
				this._lineMaterialDashed
			);
			// invisible, layer #1 (disable hit test), render order #1000 (always on top)
			this._addToScene(this._snapLine, this._root, false, 1, 1000);

			// position and scale for snap points to update when necessary (to avoid matrix decomposition)
			this._snapPointsData = [];

			for (var i = 0; i < SNAP_POINTS_COUNT; ++i) {
				this._snapPointsData.push({
					pos: new Vector3(),
					scale: new Vector3()
				});
			}

			this._snapPoints = new THREE.InstancedMesh(
				new THREE.SphereGeometry(1, 16, 16),
				new THREE.MeshBasicMaterial({
					depthTest: false,
					depthWrite: false,
					color: 0x00ffff,
					transparent: true,
					opacity: 0.99
				}),
				SNAP_POINTS_COUNT
			);

			// invisible, layer #1 (disable hit test), render order #1010 (always on top)
			this._addToScene(this._snapPoints, this._scene, false, 1, 1010);

			this._snapHighlightPoint = new THREE.Mesh(
				new THREE.SphereGeometry(1, 16, 16),
				new THREE.MeshBasicMaterial({
					depthTest: false,
					depthWrite: true,
					color: 0xff0000,
					transparent: true,
					opacity: 0.99
				})
			);
			// invisible, layer #1 (disable hit test), render order #1020 (always on top)
			this._addToScene(this._snapHighlightPoint, this._scene, false, 1, 1020);

			this._snapBox = new THREE.BoxHelper(undefined, 0x00ffff);
			// invisible, layer #1 (disable hit test)
			this._addToScene(this._snapBox, this._scene, false, 1);

			this._viewport.addEventDelegate(viewportEventDelegate, this);
		}
	});

	/**
	 * Destroys drag and drop handler object.
	 * @public
	 */
	DragDropHandler.prototype.destroy = function() {
		this._unsubscribe();
		this._viewport.removeEventDelegate(viewportEventDelegate);

		this._snapBox.geometry.dispose();
		this._snapBox.material.dispose();

		this._snapPoints.geometry.dispose();
		this._snapPoints.material.dispose();

		this._snapHighlightPoint.geometry.dispose();
		this._snapHighlightPoint.material.dispose();

		this._snapLine.geometry.dispose();
		this._lineMaterialSolid.dispose();
		this._lineMaterialDashed.dispose();

		this._root.remove(this._snapLine);
		this._scene.remove(this._snapBox, this._snapPoints, this._snapHighlightPoint);

		// reset all
		this._adapter = null;
		this._context = null;
		this._viewport = null;
		this._root = null;
		this._scene = null;
		this._camera = null;
		this._cameraControls = null;
		this._lineMaterialSolid = null;
		this._lineMaterialDashed = null;
		this._snapBox = null;
		this._snapLine = null;
		this._snapPoints = null;
		this._snapHighlightPoint = null;

		BaseObject.prototype.destroy.call(this);
	};

	/**
	 * Updates list of changeable instances.
	 * @public
	 */
	 DragDropHandler.prototype.update = function() {

		this._cancel(); // cancel active drag and drop action if any

		var scene = this._context.scene;
		var queues = this._context.voQueues;

		// Visual object instances split by types of changes
		(queues.toAdd.get(scene) || []).forEach(function(instance) {
			if (instance["VB:c"] && (instance.isBox || instance.isCylinder) && toBoolean(instance["VB:c"])) {
				this._changeables.add(instance);
			}
		}, this);

		(queues.toRemove.get(scene) || []).forEach(function(instance) {
			this._changeables.delete(instance);
		}, this);

		(queues.toUpdate.get(scene) || []).forEach(function(instance) {
			if (instance["VB:c"] && (instance.isBox || instance.isCylinder) && Utilities.propertyChanged(instance, "VB:c")) {
				if (toBoolean(instance["VB:c"])) {
					this._changeables.add(instance)
				} else {
					this._changeables.delete(instance);
				}
				Utilities.updateProperty(instance, "VB:c");
			}
		}, this);

		// make array of 3d objects
		this._changeables3d = Array.from(this._changeables, function(instance) {
			return instance.object3D;
		});

		var cfg = this._context.config;

		this._xAxisColor = cfg.has(CONFIG_SNAP_X_COLOR) ? toColor(cfg.get(CONFIG_SNAP_X_COLOR)).rgb : RED;
		this._yAxisColor = cfg.has(CONFIG_SNAP_Y_COLOR) ? toColor(cfg.get(CONFIG_SNAP_Y_COLOR)).rgb : BLUE;
		this._zAxisColor = cfg.has(CONFIG_SNAP_Z_COLOR) ? toColor(cfg.get(CONFIG_SNAP_Z_COLOR)).rgb : GREEN;

		var snapColor = cfg.has(CONFIG_SNAP_COLOR) ? toColor(cfg.get(CONFIG_SNAP_COLOR)).rgb : CYAN;
		var snapHighlightColor = cfg.has(CONFIG_SNAP_HIGHLIGHT_COLOR) ? toColor(cfg.get(CONFIG_SNAP_HIGHLIGHT_COLOR)).rgb : RED;

		this._snapBox.material.color.copy(snapColor);
		this._snapBox.material.needsUpdate = true;

		this._snapPoints.material.color.copy(snapColor);
		this._snapPoints.material.needsUpdate = true;

		this._snapHighlightPoint.material.color.copy(snapHighlightColor);
		this._snapHighlightPoint.material.needsUpdate = true;
	};

	DragDropHandler.prototype._onKeyUp = function(event) {
		if (!event.repeat) {
			this._handleKeyPress(event, false);
		}
	};

	DragDropHandler.prototype._onKeyDown = function(event) {
		if (!event.repeat) {
			this._handleKeyPress(event, true);
		}
	};

	DragDropHandler.prototype._onPointerDown = function(event) {
		this._mouseDown = true;

		if (this._hovered) {
			var point;

			if (this._snapHighlightPoint.visible) {
				this._snapping = true; // drag and drop starts from snapping point -> snapping enabled
				point = this._snapHighlightPoint.position;
			} else {
				_raycaster.layers.set(0);
				_raycaster.setFromCamera(this._updatePointer(event, _pointer), this._camera);
				var intersections = _raycaster.intersectObject(this._hovered, false);

				if (intersections.length > 0) {
					point = intersections[0].point;
				}
			}

			if (point) {
				this._dom.style.cursor = "move";
				this._dragStart(point);
			}
		}
	};

	DragDropHandler.prototype._onPointerMove = function(event) {
		// nothing to do as camera is operating
		if (this._mouseDown && this._cameraControls.enabled) {
			this._snapBox.visible = false;
			this._snapLine.visible = false;
			this._snapPoints.visible = false;
			this._snapHighlightPoint.visible = false;
			return;
		}

		this._updatePointer(event, _pointer);

		// if drag started
		if (this._state === STATE.DRAG) {
			_raycaster.layers.set(0);
			_raycaster.setFromCamera(_pointer, this._camera);
			if (_raycaster.ray.intersectPlane(this._plane, _p1)) {
				this._drag(_p1.sub(this._offset).applyMatrix4(this._inverseMatrix), _pointer, event.ctrlKey, event.shiftKey);
			}
		}

		// 	hover support for PICK state or DRAG with snapping enabled
		if (this._state === STATE.PICK || this._snapping) {
			this._handleHover(_pointer);
		}

		// handle snapping highlight point only in PICK state
		if (this._state === STATE.PICK && this._snapPoints.visible) {
			_raycaster.layers.set(1);
			var intersections = _raycaster.intersectObject(this._snapPoints, false);

			if (intersections.length > 0) {
				var instanceId = intersections[0].instanceId;
				this._snapHighlightPoint.scale.copy(this._snapPointsData[instanceId].scale);
				this._snapHighlightPoint.position.copy(this._snapPointsData[instanceId].pos);
				this._snapHighlightPoint.updateMatrix();
				this._snapHighlightPoint.visible = true;
			} else {
				this._snapHighlightPoint.visible = false;
			}
		}
	};

	DragDropHandler.prototype._onPointerCancel = function(event) {
		this._mouseDown = false;
		this._dom.style.cursor = this._hovered ? "pointer" : "auto";
		this._dragEnd();
	};

	DragDropHandler.prototype._handleHover = function(pointer) {
		var intersections = [], bbox = false;

		_raycaster.layers.set(0);
		_raycaster.setFromCamera(pointer, this._camera);
		_raycaster.intersectObjects(this._changeables3d, false, intersections);

		if (this._hovered !== null) {
			if (!this._hovered.geometry.boundingBox) {
				this._hovered.geometry.computeBoundingBox();
			}
			_box.copy(this._hovered.geometry.boundingBox);
			_box.applyMatrix4(this._hovered.matrixWorld);

			if (_raycaster.ray.intersectBox(_box, _p1)) {
				bbox = true;
			}
		}

		if (!bbox) {
			if (intersections.length > 0) {
				var object = intersections[0].object;

				if (this._hovered !== object && this._hovered !== null) {
					this._hovered = null;
					this._dom.style.cursor = "auto";
					this._hoverOff();
				}
				if (this._hovered !== object) {
					this._hovered = object;
					this._dom.style.cursor = "pointer";
					this._hoverOn(this._hovered);
				}
			} else if (this._hovered !== null) {
				this._hovered = null;
				this._dom.style.cursor = "auto";
				this._hoverOff();
			}
		}
	};

	DragDropHandler.prototype._handleKeyPress = function(event, down) {
		if (event.keyCode === 16) { // Shift
			this._lockToAxis = down;
			this._updateSnapLine();
		} else if (event.keyCode === 20) { // Caps Lock
			this._snapAlways = event.getModifierState("CapsLock");
			this._updateSnapLine();
		} else if (event.keyCode === 27 && down) { // Esc
			this._cancel();
		}
	};

	DragDropHandler.prototype._dragStart = function(intersection) {
		this._plane.setFromNormalAndCoplanarPoint(this._camera.getWorldDirection(this._plane.normal), intersection);
		this._inverseMatrix.copy(this._hovered.parent.matrixWorld).invert();
		this._offset.copy(intersection).sub(_p1.setFromMatrixPosition(this._hovered.matrixWorld));
		this._touch = Utilities.threeJsToVb(intersection);

		this._instances.length = 0;
		// if drag and drop starts from selected instance then all selected and changeable instances participate in drag and drop
		// otherwise only that instance participate in drag and drop
		var hoveredSelected = toBoolean(this._hovered._sapInstance["VB:s"]);
		this._changeables.forEach(function(instance) {
			if (instance === this._hovered._sapInstance || (hoveredSelected && toBoolean(instance["VB:s"]))) {
				this._instances.push(instance);
				instance._last.dragStart = instance.object3D.position.clone();
				// check if instance has Decals on it -> prepare them as well
				var decals = this._adapter._sceneBuilder._instanceDecals.get(instance);
				if (decals) {
					decals.forEach(function(decal) {
						decal._last.dragStart = decal.object3D.position.clone();
					});
				}
				// remove drag and drop participating object from the list of changeable objects for hit test
				this._changeables3d.splice(this._changeables3d.indexOf(instance.object3D), 1);
			}
		}, this);

		this._origin = this._hovered;
		this._hovered = null;
		this._state = STATE.DRAG;

		this._snapBox.visible = false;
		this._snapPoints.visible = false;
		this._snapHighlightPoint.visible = false;

		this._cameraControls.setEnabled(false);
	};

	 DragDropHandler.prototype._drag = function(position, pointer, ctrl, shift) {
		var i, proceed = true, snapped = false, distance, minDistance = Number.MAX_VALUE;
		var delta = position.clone().sub(this._origin._sapInstance._last.dragStart);

		// if drag with snapping initiated then try to snap to closest snapping point
		_p1.set(pointer.x, pointer.y, 0);

		if (this._snapping && this._snapPoints.visible) {
			for (i = 0; i < SNAP_POINTS_COUNT; ++i) {
				_p2.copy(this._snapPointsData[i].pos);
				_p3.copy(_p2);
				_p2.project(this._camera);
				_p2.z = 0;
				distance = _p1.distanceTo(_p2);
				if (distance < AXIS_SNAP_DISTANCE && distance < minDistance) {
					snapped = true;
					minDistance = distance;
					threeJsToVb(_p3, _p3);
					threeJsToVb(this._offset, _p4);
					_p5.copy(_p3.sub(this._origin._sapInstance._last.dragStart));
					_p5.sub(_p4);
				}
			}
		}

		if (snapped) {
			delta.copy(_p5);
		} else {
			var snapAxis = [
				{dir: X_DIR, color: this._xAxisColor},
				{dir: Y_DIR, color: this._yAxisColor},
				{dir: Z_DIR, color: this._zAxisColor}
			];

			if (!this._lockToAxis) {
				// calc snapping distance for each axis
				snapAxis.forEach(function(item) {
					item.distance = this._getAxisSnapDistance(this._touch, delta, item.dir);
				}, this);

				// find min distance
				snapAxis.sort(function(a, b) {
					return a.distance < b.distance ? -1 : 1;
				});

				// correct delta if snapping threshold reached
				if (snapAxis[0].distance < AXIS_SNAP_DISTANCE || this._snapAlways) {
					this._snapAxis = snapAxis[0];
				} else {
					this._snapAxis = null;
				}
			}

			this._updateSnapLine(); // update type & color

			if (this._snapAxis) {
				this._getAxisSnapPosition(this._touch, delta, this._snapAxis.dir, delta);
			}
		}

		// if collision detection enabled
		if (ctrl) {
			for (i = 0; i < this._instances.length; ++i) {
				var instance = this._instances[i];
				var pos = instance._last.dragStart.clone().add(delta);
				var world = new Matrix4().compose(pos, instance.object3D.quaternion, instance.object3D.scale);
				world.multiplyMatrices(instance.object3D.parent.matrixWorld, world);

				if (!instance.object3D.geometry.boundingBox) {
					instance.object3D.geometry.computeBoundingBox();
				}
				var box = new THREE.Box3().copy(instance.object3D.geometry.boundingBox);
				box.applyMatrix4(world);

				if (this._isCollide(this._scene, box)) {
					proceed = false;
					break;
				}
			}
		}

		if (proceed) {
			this._updateSnapLineGeometry(this._touch, delta);

			for (i = 0; i < this._instances.length; ++i) {
				this._instances[i].object3D.position.copy(this._instances[i]._last.dragStart).add(delta);
				this._instances[i].object3D.updateMatrix();

				var decals = this._adapter._sceneBuilder._instanceDecals.get(this._instances[i]);
				if (decals) {
					vbToThreeJs(delta, _p1); // convert delta from VB to ThreeJs as Decals are not in VB CRS
					decals.forEach(function(decal) {
						decal.object3D.position.copy(decal._last.dragStart).add(_p1);
						decal.object3D.updateMatrix();
					});
				}
			}
			// objects have moved -> adjust camera clipping planes
			this._viewport._resetBBox();
			this._viewport._updateCamera();
		}
		this._snapLine.visible = true;
	};

	 DragDropHandler.prototype._dragEnd = function() {
		if (this._state !== STATE.DRAG) {
			return;
		}

		// generate submit event
		var dataMap = new Map();

		var payload = {
			version    : "2.0",
			"xmlns:VB" : "VB",
            Data: {
                Merge: {
                    N: []
                }
            }
		};

		this._instances.forEach(function(instance) {
			if (instance.id) {
				if (instance.voGroup.isDataBound) {
					var dataType = instance.voGroup.datasource; // VO group data source linked to a DataType by name
					var data = dataMap.get(dataType);

					if (!data) {
						data = {
							name: dataType,
							E: []
						};
						dataMap.set(dataType, data);
					}

					var attr = instance.voGroup.template.pos;
					var posAttr = attr.path[attr.path.length - 1]; // last entry on path is attribute name
					var posAlias = this._adapter._parser.getAttributeAlias(dataType, posAttr);
					var keyAlias = this._adapter._parser.getAttributeAlias(dataType, instance.voGroup.keyAttributeName);
					var pos = instance.object3D.position;
					var value = pos.x.toFixed(5) + ";" + pos.y.toFixed(5) + ";" + pos.z.toFixed(5);

					// make sure position is updated in all 3 places:
					// evaluated instance
					// instance last changed values
					// and in instance's data instance
					instance.dataInstance[posAttr] = instance._last.pos = instance.pos = value;

					var obj = {};
					obj[keyAlias] = instance.id;
					obj[posAlias] = value;

					data.E.push(obj);
				} else {
					Log.error("Only data bound instance can be included in Data.Merge section", instance.id, thisModule);
				}
			} else {
				Log.error("Cannot process instance without id", instance, thisModule);
			}
		}, this);

		// don't fire empty events
		if (dataMap.size > 0) {
			dataMap.forEach(function(item) {
				payload.Data.Merge.N.push(item);
			});

			this._adapter.fireSubmit({
				data: JSON.stringify(payload)
			});
		}

		this._state = STATE.PICK;
		this._hovered = null;
		this._origin = null;
		this._touch = null;
		this._snapping = false;
		this._snapLine.visible = false;
		this._instances.length = 0;
		this._changeables3d = Array.from(this._changeables, function(instance) {
			return instance.object3D;
		});
		this._cameraControls.setEnabled(true);
	};

	DragDropHandler.prototype._hoverOn = function(obj) {
		var that = this;

		if (!obj.geometry.boundingBox) {
			obj.geometry.computeBoundingBox();
		}

		_box.copy(obj.geometry.boundingBox);
		_box.applyMatrix4(obj.matrixWorld);

		function pos(index, x, y, z) {
			that._snapPointsData[index].pos.set(x, y, z);
		}

		pos(0, _box.min.x, _box.min.y, _box.min.z);
		pos(1, _box.min.x, _box.min.y, _box.max.z);
		pos(2, _box.min.x, _box.max.y, _box.min.z);
		pos(3, _box.min.x, _box.max.y, _box.max.z);
		pos(4, _box.max.x, _box.min.y, _box.min.z);
		pos(5, _box.max.x, _box.min.y, _box.max.z);
		pos(6, _box.max.x, _box.max.y, _box.min.z);
		pos(7, _box.max.x, _box.max.y, _box.max.z);

		this._snapPoints.visible = true;
		this._updateSnapPoints();

		this._snapBox.visible = true;
		this._snapBox.setFromObject(obj);
	};

	DragDropHandler.prototype._hoverOff = function() {
		this._snapBox.visible = false;
		this._snapPoints.visible = false;
		this._snapHighlightPoint.visible = false;
	};

	DragDropHandler.prototype._isCollide = function(object, box) {
		var i;
		if (object.visible && object.geometry && Utilities.layersEnabled(object.layers, 0) && this._instances.indexOf(object._sapInstance) < 0) {
			object.updateWorldMatrix(false, false);
			if (!object.geometry.boundingBox) {
				object.geometry.computeBoundingBox();
			}
			if (object.isInstancedMesh) {
				for (i = 0; i < object.count; ++i) {
					object.getMatrixAt(i, _matrix);
					_box.copy(object.geometry.boundingBox);
					_box.applyMatrix4(_matrix);

					if (_box.intersectsBox(box)) {
						return true;
					}
				}
			} else {
				_box.copy(object.geometry.boundingBox);
				_box.applyMatrix4(object.matrixWorld);

				if (_box.intersectsBox(box)) {
					return true;
				}
			}
		}

		var children = object.children;
		for (i = 0; i < children.length; ++i) {
			if (this._isCollide(children[i], box)) {
				return true;
			}
		}
		return false;
	};

	DragDropHandler.prototype._updateSnapLineGeometry = function(from, delta) {
		var pos = this._snapLine.geometry.attributes.position;
		pos.needsUpdate = true;

		pos.array[0] = from.x;
		pos.array[1] = from.y;
		pos.array[2] = from.z;
		pos.array[3] = from.x + delta.x;
		pos.array[4] = from.y + delta.y;
		pos.array[5] = from.z + delta.z;

		this._snapLine.geometry.computeBoundingBox();
		this._snapLine.geometry.computeBoundingSphere();

		if (this._snapLine.material === this._lineMaterialDashed) {
			this._snapLine.computeLineDistances();
		}
	};

	DragDropHandler.prototype._updateSnapLine = function() {
		this._updateSnapLineColor(this._snapAxis ? this._snapAxis.color : BLACK);
		this._updateSnapLineType((this._snapAxis && this._lockToAxis) || this._snapAlways);
	};

	DragDropHandler.prototype._updateSnapLineColor = function(color) {
		if (!this._snapLine.material.color.equals(color)) {
			this._snapLine.material.color.copy(color);
			this._snapLine.material.needsUpdate = true;
		}
	};

	DragDropHandler.prototype._updateSnapLineType = function(solid) {
		var old = this._snapLine.material;
		this._snapLine.material = solid ? this._lineMaterialSolid : this._lineMaterialDashed;

		if (old !== this._snapLine.material) {
			this._snapLine.material.color.copy(old.color);
			this._snapLine.material.needsUpdate = true;

			if (this._snapLine.material === this._lineMaterialDashed) {
				this._snapLine.computeLineDistances();
			}
		}
	};

	DragDropHandler.prototype._getAxisSnapDistance = function(org, delta, dir) {
		vbToThreeJs(org, _p1); 						// origin of the movement (world CRD)
		vbToThreeJs(_p2.copy(org).add(delta), _p2); // current position of the movement (world CRD)
		_p3.copy(_p1).add(dir);           			// offset position to form a line in "dir" direction (world CRD)

		var camera = this._viewport._camera;

		// to device normalized CRD
		_p1.project(camera);
		_p2.project(camera);
		_p3.project(camera);

		_p1.z = _p2.z = _p3.z = 0; // reset depth to calculate closest point on a plane not within frustrum

		_line.start.copy(_p1);
		_line.end.copy(_p3);
		_line.closestPointToPoint(_p2, false, _p1);

		return _p2.distanceTo(_p1);
	};

	DragDropHandler.prototype._getAxisSnapPosition = function(org, delta, dir, out) {
		vbToThreeJs(org, _p1);                       // origin of the movement (world CRD)
		vbToThreeJs(_p2.copy(org).add(delta), _p2);  // current position of the movement (world CRD)
		_p3.copy(dir).multiplyScalar(DIR_LENGTH);    // magnified direction (world CRD)
		_p4.copy(_p1).sub(_p3);                      // offset position in -"dir" direction to form a line
		_p5.copy(_p1).add(_p3);                      // offset position in +"dir" direction to form a line

		var camera = this._viewport._camera;

		// to normalized device CRD
		_p2.project(camera);
		_p1.copy(_p4).project(camera);
		_p3.copy(_p5).project(camera);

		_p1.z = _p2.z = _p3.z = 0; // reset depth to calculate closest point on a plane not within frustrum

		_line.start.copy(_p1);
		_line.end.copy(_p3);
		_line.closestPointToPoint(_p2, false, _p1);

		// "project" back to find snapping point in world CRD
		_ray.origin.setFromMatrixPosition(camera.matrixWorld);
		_ray.direction.set(_p1.x, _p1.y, 0.5).unproject(camera).sub(_ray.origin).normalize();

		if (_ray.distanceSqToSegment(_p4, _p5, _p1, _p2) < COLLISION_DISTANCE) {
			threeJsToVb(_p2, _p2); // back to VB CRD
			out.copy(_p2.sub(org)); // output is delta to final position
		} else {
			Log.error("failed to calculate snapping point", "", thisModule);
		}
	};

	DragDropHandler.prototype._cancel = function() {
		if (this._touch) {
			// move objects back to original position
			for (var i = 0; i < this._instances.length; ++i) {
				this._instances[i].object3D.position.copy(this._instances[i]._last.dragStart);
				this._instances[i].object3D.updateMatrix();

				// move Decals back if any
				var decals = this._adapter._sceneBuilder._instanceDecals.get(this._instances[i]);
				if (decals) {
					decals.forEach(function(decal) {
						decal.object3D.position.copy(decal._last.dragStart);
						decal.object3D.updateMatrix();
					});
				}
			}

			this._touch = null;                    // reset touch point to indicate there is no active drag and drop
			this._hovered = null;                  // reset hovered instance
			this._snapLine.visible = false;        // hide guide line
			this._instances.length = 0;            // clear to indicate current action has been cancelled
			this._cameraControls.setEnabled(true); // enable camera controls
			this._dom.style.cursor = "auto";

			// objects have moved -> adjust camera clipping planes
			this._viewport._resetBBox();
			this._viewport._updateCamera();
		}
	};

	DragDropHandler.prototype._addToScene = function(obj, parent, visible, layer, order) {
		if (visible !== undefined) {
			obj.visible = visible;
		}
		if (layer !== undefined) {
			obj.layers.set(layer);
		}
		if (order !== undefined) {
			obj.renderOrder = order;
		}
		parent.add(obj);
		obj.matrixAutoUpdate = false;
	};

	DragDropHandler.prototype._addListener = function(source, event, handler) {
		var proxy = handler.bind(this);
		this[event + "Proxy"] = proxy;
		source.addEventListener(event, proxy);
	};

	DragDropHandler.prototype._removeListener = function(source, event) {
		source.removeEventListener(event, this[event + "Proxy"]);
		delete this[event + "Proxy"];
	};

	DragDropHandler.prototype._subscribe = function() {
		var ref = this._viewport.getDomRef();
		if (ref) {
			this._dom = ref;
			this._addListener(ref, "keyup", this._onKeyUp);
			this._addListener(ref, "keydown", this._onKeyDown);
			this._addListener(ref, "wheel", this._onPointerMove);
			this._addListener(ref, "pointerup", this._onPointerCancel);
			this._addListener(ref, "pointerdown", this._onPointerDown);
			this._addListener(ref, "pointermove", this._onPointerMove);
			this._addListener(ref, "pointerleave", this._onPointerCancel);
		}
		this._addListener(this._cameraControls, "change", this._onCameraChange);
	};

	DragDropHandler.prototype._unsubscribe = function() {
		var ref = this._viewport.getDomRef();
		if (ref) {
			this._dom = null;
			this._removeListener(ref, "wheel");
			this._removeListener(ref, "keyup");
			this._removeListener(ref, "keydown");
			this._removeListener(ref, "pointerup");
			this._removeListener(ref, "pointerdown");
			this._removeListener(ref, "pointermove");
			this._removeListener(ref, "pointerleave");
		}
		this._removeListener(this._cameraControls, "change");
	};

	DragDropHandler.prototype._updatePointer = function(event, out) {
		var rect = this._viewport.getDomRef().getBoundingClientRect();
		out.x =  (event.cursor ? event.cursor.x : event.pageX - window.pageXOffset - rect.left) / rect.width * 2 - 1;
		out.y = -(event.cursor ? event.cursor.y : event.pageY - window.pageYOffset - rect.top) / rect.height * 2 + 1;

		return out;
	};

	DragDropHandler.prototype._updateSnapPoints = function() {
		// calc bbox center of all snapping points
		_p1.copy(this._snapPointsData[0].pos).add(this._snapPointsData[SNAP_POINTS_COUNT-1].pos).multiplyScalar(0.5);
		var factor = _p1.distanceTo(this._camera.position) * Math.min(1.9 * Math.tan(Math.PI * this._camera.fov / 360) / this._camera.zoom, 10);

		for (var i = 0; i < SNAP_POINTS_COUNT; ++i) {
			this._snapPointsData[i].scale.set(1,1,1).multiplyScalar(factor / 170);
			_matrix.compose(this._snapPointsData[i].pos, _quaternion, this._snapPointsData[i].scale);
			this._snapPoints.setMatrixAt(i, _matrix);
		}
		this._snapPoints.instanceMatrix.needsUpdate = true;
		// update highlight snapping points as well
		this._snapHighlightPoint.scale.copy(this._snapPointsData[0].scale);
		this._snapHighlightPoint.updateMatrix();
	};

	DragDropHandler.prototype._onCameraChange = function(event) {
		if (this._snapPoints.visible) {
			this._updateSnapPoints();
		}
	};

	return DragDropHandler;
});
