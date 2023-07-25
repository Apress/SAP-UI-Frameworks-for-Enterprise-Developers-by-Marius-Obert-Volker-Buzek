/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ExplodeToolGizmo
sap.ui.define([
	"../getResourceBundle",
	"../thirdparty/three",
	"../thirdparty/BufferGeometryUtils",
	"./Gizmo",
	"./AxisColours",
	"./ExplodeAxis",
	"./ExplodeDirection",
	"./ExplodeType",
	"../AnimationTrackType",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/core/Core"
], function(
	getResourceBundle,
	THREE,
	BufferGeometryUtils,
	Gizmo,
	AxisColours,
	ExplodeAxis,
	ExplodeDirection,
	ExplodeType,
	AnimationTrackType,
	assert,
	Log,
	core
) {
	"use strict";

	/**
	 * Constructor for a new ExplodeToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides handles for move objects tool
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.ExplodeToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ExplodeToolGizmo = Gizmo.extend("sap.ui.vk.tools.ExplodeToolGizmo", /** @lends sap.ui.vk.tools.ExplodeToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var GIZMO_SIZE = 96;
	var TOUCH_RADIUS = 48;
	var HANDLES = {
		PositiveX: 0,
		PositiveY: 1,
		PositiveZ: 2,
		NegativeX: 3,
		NegativeY: 4,
		NegativeZ: 5,
		ResetAdjustment: 6,
		AdjustUp: 7,
		AdjustDown: 8,
		MoveUp: 9,
		MoveDown: 10
	};
	ExplodeToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._createEditingForm(getResourceBundle().getText("TOOL_UNITS_MM"), 84);
		this._moveDelta = new THREE.Vector3();
		this._anchorPosition = new THREE.Vector3();
		this._axisDirection = new THREE.Vector3();
		this._axisColor = 0;
		this._magnitude = 0;

		this._viewport = null;
		this._tool = null;
		this._groups = [];
		this._nodes = [];
		this._groupsMap = new Map();
		this._sceneGizmo = new THREE.Scene();

		var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
		ambientLight.layers.enableAll();
		this._sceneGizmo.add(ambientLight);

		var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		directionalLight.position.set(1, 3, 2);
		directionalLight.layers.enableAll();
		this._sceneGizmo.add(directionalLight);

		this._gizmo = new THREE.Group();
		this._touchAreas = new THREE.Group();
		this._touchAreas2 = new THREE.Group();
		this._sceneGizmo.add(this._gizmo);
		// this._sceneGizmo.add(this._touchAreas);
		// this._sceneGizmo.add(this._touchAreas2);
		this._matViewProj = new THREE.Matrix4();

		var touchMaterial = new THREE.MeshLambertMaterial({ color: 0x0080FF, transparent: true, opacity: 0.2 });

		function createGizmoArrow(arrowLength, dir, color, touchAreas) {
			var lineRadius = 1,
				coneRadius = 4,
				coneHeight = 24;

			var material = new THREE.MeshLambertMaterial({ color: color });
			var lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, arrowLength - coneHeight, 4);
			var d1 = new THREE.Vector3(dir.y, dir.z, dir.x);
			var d2 = new THREE.Vector3(dir.z, dir.x, dir.y);
			var m = dir.x < 0 || dir.y < 0 || dir.z < 0 ? new THREE.Matrix4().makeBasis(d2, dir, d1) : new THREE.Matrix4().makeBasis(d1, dir, d2);
			m.setPosition(dir.clone().multiplyScalar((arrowLength - coneHeight) * 0.5));
			lineGeometry.applyMatrix4(m);
			var line = new THREE.Mesh(lineGeometry, material);
			line.matrixAutoUpdate = false;
			line.userData.color = color;

			var coneGeometry = new THREE.CylinderGeometry(0, coneRadius, coneHeight, 12, 1);
			m.setPosition(dir.clone().multiplyScalar(arrowLength - coneHeight * 0.5));
			coneGeometry.applyMatrix4(m);
			var cone = new THREE.Mesh(coneGeometry, material);
			cone.matrixAutoUpdate = false;
			line.add(cone);

			if (touchAreas) {
				var touchGeometry = new THREE.CylinderGeometry(TOUCH_RADIUS * 0.5, TOUCH_RADIUS * 0.5, arrowLength - TOUCH_RADIUS + coneHeight * 0.5, 12, 1);
				m.setPosition(dir.clone().multiplyScalar(TOUCH_RADIUS + touchGeometry.parameters.height * 0.5));
				touchGeometry.applyMatrix4(m);
				var touchGeometry2 = new THREE.CylinderGeometry(TOUCH_RADIUS * 0.5, 0, TOUCH_RADIUS, 12, 1);
				m.setPosition(dir.clone().multiplyScalar(TOUCH_RADIUS * 0.5));
				touchGeometry2.applyMatrix4(m);
				var mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([touchGeometry, touchGeometry2]);
				touchAreas.add(new THREE.Mesh(mergedGeometry, material));
			}

			return line;
		}

		// create 3 arrows
		this._gizmo.add(createGizmoArrow(GIZMO_SIZE, new THREE.Vector3(1, 0, 0), AxisColours.x, this._touchAreas));
		this._gizmo.add(createGizmoArrow(GIZMO_SIZE, new THREE.Vector3(0, 1, 0), AxisColours.y, this._touchAreas));
		this._gizmo.add(createGizmoArrow(GIZMO_SIZE, new THREE.Vector3(0, 0, 1), AxisColours.z, this._touchAreas));
		this._gizmo.add(createGizmoArrow(GIZMO_SIZE, new THREE.Vector3(-1, 0, 0), AxisColours.x, this._touchAreas));
		this._gizmo.add(createGizmoArrow(GIZMO_SIZE, new THREE.Vector3(0, -1, 0), AxisColours.y, this._touchAreas));
		this._gizmo.add(createGizmoArrow(GIZMO_SIZE, new THREE.Vector3(0, 0, -1), AxisColours.z, this._touchAreas));

		this._axisTitles = this._createAxisTitles(undefined, undefined, false, true);
		this._sceneGizmo.add(this._axisTitles);

		var d = 32;
		var d2 = d * 1.75;
		this._groupGizmo = new THREE.Group();
		this._sceneGizmo.add(this._groupGizmo);
		var sphere = new THREE.Mesh(
			new THREE.IcosahedronGeometry(8, 1),
			new THREE.MeshLambertMaterial()
		);
		this._groupGizmo.add(sphere); // ResetAdjustment
		this._groupGizmo.add(createGizmoArrow(d * 1.5, new THREE.Vector3(0, 1, 0), 0xFFFFFF)); // AdjustUp
		this._groupGizmo.add(createGizmoArrow(d * 1.5, new THREE.Vector3(0, -1, 0), 0xFFFFFF)); // AdjustDown

		var dconeHeight = 16;
		var doubleCone = BufferGeometryUtils.mergeBufferGeometries([
			new THREE.CylinderGeometry(0, 6, dconeHeight, 16).applyMatrix4(new THREE.Matrix4().setPosition(0, d2 + dconeHeight * 0.5, 0)),
			new THREE.CylinderGeometry(0, 6, dconeHeight, 16).applyMatrix4(new THREE.Matrix4().setPosition(0, d2 + dconeHeight * 1.5, 0))
		]);

		this._groupGizmo.add(new THREE.Mesh(doubleCone, new THREE.MeshLambertMaterial()));
		this._groupGizmo.add(new THREE.Mesh(doubleCone.clone().rotateX(Math.PI), new THREE.MeshLambertMaterial()));

		this._groupGizmo.add(new THREE.Mesh(
			new THREE.CylinderGeometry(16, 16, d * 6, 12, 1),
			new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5, side: THREE.BackSide })
		)); // background

		function addTouchCylinder(a, b, touchAreas) {
			// var touchGeometry = new THREE.CylinderGeometry (TOUCH_RADIUS * 0.5, TOUCH_RADIUS * 0.5, b - a, 12, 1);
			var touchGeometry = new THREE.IcosahedronGeometry(TOUCH_RADIUS * 0.5, 1);
			touchGeometry.applyMatrix4(new THREE.Matrix4().setPosition(0, (a + b) * 0.5, 0));
			touchAreas.add(new THREE.Mesh(touchGeometry, touchMaterial));
		}
		addTouchCylinder(d * -0.5, d * 0.5, this._touchAreas2); // ResetAdjustment
		addTouchCylinder(d * 0.5, d * 1.5, this._touchAreas2); // AdjustUp
		addTouchCylinder(d * -1.5, d * -0.5, this._touchAreas2); // AdjustDown
		addTouchCylinder(d2, d2 + d, this._touchAreas2); // MoveUp
		addTouchCylinder(-d2 - d, -d2, this._touchAreas2); // MoveDown

		function enableAllLayer(obj) {
			obj.traverse(function(child) {
				child.layers.enableAll();
			});
		}
		function updateLayers(obj) {
			obj.children.forEach(function(child, index) {
				child.traverse(function(node) {
					node.layers.enable(Math.min(index, 6) + 1);
				});
			});
		}
		updateLayers(this._gizmo);
		updateLayers(this._axisTitles);
		updateLayers(this._touchAreas);
		enableAllLayer(this._groupGizmo);
		enableAllLayer(this._touchAreas2);
	};

	ExplodeToolGizmo.prototype.hasDomElement = function() {
		return false;
	};

	ExplodeToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._nodes.length = 0;
		// this._updateSelection(viewport._viewStateManager);
		// var nodesProperties = this._getNodesProperties();
		// this._tool.fireEvent("moving", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
		this._handleGroupsChanged();
	};

	ExplodeToolGizmo.prototype.hide = function() {
		this._cleanTempData();

		this._viewport = null;
		this._tool = null;
		this._updateEditingForm(false);
	};

	ExplodeToolGizmo.prototype.getGizmoCount = function() {
		if (!this._groups.length) {
			return 0;
		}
		return this._getActiveAxisIndex() >= 0 && this._magnitude > 0 && this._getSelectedItem() ? 2 : 1;
	};

	ExplodeToolGizmo.prototype.getTouchObject = function(i) {
		if (i === 0) {
			this._updateGizmoObjectTransformation(this._touchAreas);
			return this._touchAreas;
		} else {
			this._updateGroupGizmoTransformation(this._touchAreas2);
			return this._touchAreas2;
		}
	};

	ExplodeToolGizmo.prototype._handleGroupsChanged = function(event) {
		this._setMagnitude(0);

		var groupsMap = this._groupsMap;
		groupsMap.clear();

		this._groups = this._tool.getItems().slice();
		var nodes = this._nodes = [];
		this._groups.forEach(function(group) {
			var items = group.getItems();
			for (var i = 0; i < items.length; i++) {
				var node = items[i].getNodeRef();
				groupsMap.set(node, group);
				var boundingBox = new THREE.Box3();
				node._expandBoundingBox(boundingBox, false, true, true);
				nodes.push({
					node: node,
					center: boundingBox.getCenter(new THREE.Vector3()),
					group: group,
					local: new THREE.Vector3().setFromMatrixPosition(node.matrix),
					origin: new THREE.Vector3().setFromMatrixPosition(node.matrixWorld),
					matParentInv: node.parent ? new THREE.Matrix4().copy(node.parent.matrixWorld).invert() : new THREE.Matrix4()
				});
			}
		});

		this._calculateGroupOffsets();
		this._setMagnitude(this._tool.getMagnitude());
	};

	ExplodeToolGizmo.prototype._getSelectedItem = function() {
		return core.byId(this._tool.getSelectedItem());
	};

	ExplodeToolGizmo.prototype._handleSelectedItemChanged = function() {
		var vsm = this._viewport._viewStateManager;

		var outlined = new Set();
		var selectedItem = this._getSelectedItem(); // get control for associated control
		if (selectedItem) {
			selectedItem.getItems().forEach(function(item) {
				outlined.add(item.getNodeRef());
			});
		}

		var unoutlined = [];
		vsm.enumerateOutlinedNodes(function(node) {
			if (!outlined.has(node)) {
				unoutlined.push(node);
			}
		});

		vsm.setOutliningStates(Array.from(outlined), unoutlined, false);
	};

	ExplodeToolGizmo.prototype.highlightHandle = function(index, hoverMode) {
		this._handleIndex = index;

		this._gizmo.children.forEach(function(arrow, i) {
			var highlight = index === i;
			var color = highlight ? 0xFFFF00 : arrow.userData.color;
			arrow.material.color.setHex(color);
			this._axisTitles.children[i].material.color.setHex(color);
		}.bind(this));

		for (var i = 0; i < 5; i++) {
			this._groupGizmo.children[i].material.color.setHex(i + 6 === index ? 0xFFFF00 : this._axisColor);
		}
	};

	ExplodeToolGizmo.prototype._calculateGroupOffsets = function() {
		var axisDirection = this._axisDirection;
		if (this._tool.getType() === ExplodeType.Linear) {
			var dir = new THREE.Vector3(Math.abs(axisDirection.x), Math.abs(axisDirection.y), Math.abs(axisDirection.z));
			var size = new THREE.Vector3();
			var length = 0, totalLength = 0;
			this._groups.forEach(function(group, index) {
				var bbox = group.getBoundingBox();
				bbox.getCenter(group._center);
				bbox.getSize(size);
				length = dir.dot(size);
				if (index > 0) {
					totalLength += length * 0.5;
				}
				group._offset = totalLength;
				group._deltaOffset = length * 0.5;
				totalLength += length * 0.5;
				// console.log(index, group.sId, length);
			});
			totalLength += length * 0.5;

			var offsetScale = totalLength > 0 ? 1 / totalLength : 1;
			this._groups.forEach(function(group) {
				group._offset = 1 - group._offset * offsetScale;
				group._deltaOffset *= offsetScale;
				// group._direction.copy(axisDirection);
			});
		} else {// ExplodeType.Radial
			// var anchorPosition = this._anchorPosition;
			var delta = 1 / this._groups.length;
			this._groups.forEach(function(group, index) {
				var bbox = group.getBoundingBox();
				bbox.getCenter(group._center);
				group._offset = 1 - index * delta;
				group._deltaOffset = delta * 0.5;

				var maxSize = -1;
				var maxNodeCenter = new THREE.Vector3();
				var items = group.getItems();
				for (var i = 0; i < items.length; i++) {
					var node = items[i].getNodeRef();
					var boundingBox = new THREE.Box3();
					node._expandBoundingBox(boundingBox, false, true, true);
					var size = boundingBox.getSize(new THREE.Vector3()).manhattanLength();
					if (maxSize < size) {
						maxSize = size;
						boundingBox.getCenter(maxNodeCenter);
					}
				}

				// group._direction.copy(maxNodeCenter).sub(anchorPosition);
				// group._direction.sub(axisDirection.clone().multiplyScalar(axisDirection.dot(group._direction))).normalize();
			});
		}
	};

	ExplodeToolGizmo.prototype._getActiveAxisIndex = function() {
		var axis = this._tool.getAxis();
		var direction = this._tool.getDirection();
		var index = axis && direction ? [ExplodeAxis.X, ExplodeAxis.Y, ExplodeAxis.Z].indexOf(axis) : -1;
		if (index >= 0 && direction === ExplodeDirection.Negative) {
			index += 3;
		}
		return index;
	};

	ExplodeToolGizmo.prototype._recalculateOffsets = function() {
		this._setMagnitude(0);
		this._calculateGroupOffsets();
		this._setMagnitude(this._tool.getMagnitude());

		this._viewport.setShouldRenderFrame();
	};

	ExplodeToolGizmo.prototype._updateAxis = function() {
		var index = this._getActiveAxisIndex();
		if (index >= 0) {
			this._updateGizmoObjectTransformation(this._gizmo);
			this._axisDirection.setFromMatrixColumn(this._gizmo.matrixWorld, index % 3).normalize().multiplyScalar(index < 3 ? 1 : -1);
			this._anchorPosition.setFromMatrixPosition(this._gizmo.matrixWorld);
			this._axisColor = this._gizmo.children[index].userData.color;
			for (var i = 0; i < 5; i++) {
				this._groupGizmo.children[i].material.color.setHex(this._axisColor);
			}

			this._recalculateOffsets();
		} else {
			this._setMagnitude(0);
			this._viewport.setShouldRenderFrame();
		}
	};

	ExplodeToolGizmo.prototype._moveSelectedGroup = function(delta) {
		var tool = this._tool;
		var selectedItem = this._getSelectedItem();
		var items = tool.getItems();
		var index = items.indexOf(selectedItem);
		if (index >= 0 && index + delta >= 0 && index + delta < items.length) {
			tool.removeItem(selectedItem);
			tool.insertItem(selectedItem, index + delta);
			tool.fireItemSequenceChangePressed({
				item: selectedItem,
				moveUp: delta < 0
			});
		}
	};

	ExplodeToolGizmo.prototype._setMagnitudeAdjustmentMultiplier = function(value, finalValue) {
		var selectedItem = this._getSelectedItem();
		if (selectedItem) {
			selectedItem.setMagnitudeAdjustmentMultiplier(value);
			this._updatePositions();
			this._tool[finalValue ? "fireItemPositionAdjusted" : "fireItemPositionAdjusting"]({
				item: selectedItem,
				magnitudeAdjustmentMultiplier: selectedItem.getMagnitudeAdjustmentMultiplier()
			});
		}
	};

	ExplodeToolGizmo.prototype._beginGesture = function() {
		this._moveDelta.setScalar(0);
		this._beginMagnitude = this._magnitude;
		var tool = this._tool;
		switch (this._handleIndex) {
			case HANDLES.ResetAdjustment:
				this._setMagnitudeAdjustmentMultiplier(0, true);
				break;
			case HANDLES.AdjustUp:
			case HANDLES.AdjustDown:
				var selectedItem = this._getSelectedItem();
				this._magnitudeAdjustmentMultiplier = selectedItem ? selectedItem.getMagnitudeAdjustmentMultiplier() : 0;
				break;
			case HANDLES.MoveUp:
				this._moveSelectedGroup(-1);
				break;
			case HANDLES.MoveDown:
				this._moveSelectedGroup(+1);
				break;
			default:
				if (this._handleIndex < 6 && (!tool.getAxis() || !tool.getDirection())) {
					tool.setAxis([ExplodeAxis.X, ExplodeAxis.Y, ExplodeAxis.Z][this._handleIndex % 3]);
					tool.setDirection(this._handleIndex < 3 ? ExplodeDirection.Positive : ExplodeDirection.Negative);
					tool.fireAxisSelected({ axis: tool.getAxis(), direction: tool.getDirection() });
				}
				break;
		}
	};

	ExplodeToolGizmo.prototype._setMagnitude = function(magnitude) {
		this._magnitude = magnitude;
		this._groups.forEach(function(group) {
			group._magnitude = magnitude;
		});
		this._updatePositions();
	};

	ExplodeToolGizmo.prototype._setOffset = function(offset) {
		var tool = this._tool;
		if (this._handleIndex < 6) {
			tool.setMagnitude(this._beginMagnitude + offset);
			tool.fireMagnitudeChanging({
				type: tool.getType(),
				axis: tool.getAxis(),
				direction: tool.getDirection(),
				magnitude: tool.getMagnitude()
			});
		} else if (this._handleIndex === HANDLES.AdjustUp || this._handleIndex === HANDLES.AdjustDown) {
			var selectedItem = this._magnitude > 0 ? this._getSelectedItem() : null;
			if (selectedItem) {
				this._setMagnitudeAdjustmentMultiplier(this._magnitudeAdjustmentMultiplier + offset / (this._magnitude * selectedItem._deltaOffset));
			}
		}
	};

	ExplodeToolGizmo.prototype._updatePositions = function() {
		var linear = this._tool.getType() === ExplodeType.Linear;
		var position = new THREE.Vector3();
		var direction = new THREE.Vector3();
		var delta = new THREE.Vector3();
		// console.log("_updatePositions", this._magnitude);
		// console.log(this._axisDirection, this._magnitude);
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			// console.log(node, nodeInfo.group.getMagnitude());
			if (linear) {
				direction.copy(this._axisDirection);
			} else {// radial
				direction.copy(nodeInfo.center).sub(this._anchorPosition);
				delta.copy(this._axisDirection).multiplyScalar(direction.dot(delta));
				direction.sub(delta).normalize();
			}
			direction.multiplyScalar(nodeInfo.group.getMagnitude());
			position.copy(nodeInfo.origin).add(direction);
			node.matrixWorld.setPosition(position);
			node.matrix.multiplyMatrices(nodeInfo.matParentInv, node.matrixWorld);
			node.position.setFromMatrixPosition(node.matrix);
			node.updateMatrixWorld(true);

			if (node.parent !== this._getEffectiveParent(node)) {
				// node is a joint child
				this._viewport._viewStateManager._setJointNodeOffsets(node, AnimationTrackType.Translate);
			}

		}.bind(this));

		this._viewport.setShouldRenderFrame();
	};

	ExplodeToolGizmo.prototype._endGesture = function() {
		var tool = this._tool;
		if (this._handleIndex < 6) {
			tool.fireMagnitudeChanged({
				type: tool.getType(),
				axis: tool.getAxis(),
				direction: tool.getDirection(),
				magnitude: tool.getMagnitude()
			});
		} else if (this._handleIndex === HANDLES.AdjustUp || this._handleIndex === HANDLES.AdjustDown) {
			var selectedItem = this._magnitude > 0 ? this._getSelectedItem() : null;
			if (selectedItem) {
				tool.fireItemPositionAdjusted({
					item: selectedItem,
					magnitudeAdjustmentMultiplier: selectedItem.getMagnitudeAdjustmentMultiplier()
				});
			}
		}
	};

	ExplodeToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			this._expandBoundingBox(boundingBox, this._viewport.getCamera().getCameraRef(), true);
		}
	};

	ExplodeToolGizmo.prototype._updateGizmoObjectTransformation = function(obj) {
		obj.matrix.fromArray(this._tool.getAnchor());
		obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);

		var scale = this._getGizmoScale(obj.position);
		obj.scale.setScalar(scale);
		obj.matrixAutoUpdate = true;
		obj.updateMatrixWorld(true);
		return scale;
	};

	ExplodeToolGizmo.prototype._updateGroupGizmoTransformation = function(obj) {
		var axisIndex = this._getActiveAxisIndex();
		var selectedItem = axisIndex >= 0 && this._magnitude > 0 ? this._getSelectedItem() : null; // get control for associated control
		obj.visible = !!selectedItem;
		if (selectedItem) {
			if (this._tool.getType() === ExplodeType.Linear) {
				obj.position.copy(this._axisDirection).multiplyScalar(selectedItem.getMagnitude()).add(selectedItem._center);
			} else {
				obj.position.copy(selectedItem._center);
			}
			// obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), selectedItem._direction);
			obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this._axisDirection);
			obj.scale.setScalar(this._getGizmoScale(obj.position));
			obj.updateMatrix();
			obj.updateMatrixWorld();
		}
	};

	ExplodeToolGizmo.prototype._updateGizmoTransformation = function(i, camera) {
		this._updateGizmoObjectTransformation(this._gizmo);
	};

	ExplodeToolGizmo.prototype._getCameraLayersMask = function() {
		var mask = 0 | 0;
		var axisIndex = this._getActiveAxisIndex();
		mask = 1 << (axisIndex + 1);
		if (axisIndex >= 0 && this._magnitude > 0 && this._getSelectedItem()) {
			mask |= 1 << 7;
		}
		return mask;
	};

	ExplodeToolGizmo.prototype.render = function() {
		assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		if (this._tool && this._groups.length > 0) {
			var renderer = this._viewport.getRenderer(),
				camera = this._viewport.getCamera().getCameraRef();

			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

			renderer.clearDepth();

			var scale = this._updateGizmoObjectTransformation(this._gizmo);
			this._updateAxisTitles(this._axisTitles, this._gizmo, camera, GIZMO_SIZE + 18, scale);

			this._updateGroupGizmoTransformation(this._groupGizmo);

			var mask = camera.layers.mask;
			camera.layers.mask = this._getCameraLayersMask();
			renderer.render(this._sceneGizmo, camera);
			camera.layers.mask = mask;
		}
	};

	return ExplodeToolGizmo;

});
