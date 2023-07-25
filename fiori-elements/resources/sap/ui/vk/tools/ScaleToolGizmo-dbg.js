/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.ScaleToolGizmo
sap.ui.define([
	"../thirdparty/three",
	"./Gizmo",
	"./ScaleToolGizmoRenderer",
	"./CoordinateSystem",
	"./AxisColours",
	"../AnimationTrackType",
	"sap/base/assert",
	"sap/base/Log"
], function(
	THREE,
	Gizmo,
	ScaleToolGizmoRenderer,
	CoordinateSystem,
	AxisColours,
	AnimationTrackType,
	assert,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new ScaleToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides handles to scale objects
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.ScaleToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ScaleToolGizmo = Gizmo.extend("sap.ui.vk.tools.ScaleToolGizmo", /** @lends sap.ui.vk.tools.ScaleToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	ScaleToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._createEditingForm(null, 64);
		this._gizmoIndex = -1;
		this._handleIndex = -1;
		this._value = new THREE.Vector3().setScalar(1);
		this._scaleDelta = new THREE.Vector3().setScalar(1);

		this._viewport = null;
		this._tool = null;
		this._nonUniformScaleEnabled = false;
		this._sceneGizmo = new THREE.Scene();
		var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		light.position.set(1, 3, 2);
		this._sceneGizmo.add(light);
		this._sceneGizmo.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
		this._gizmo = new THREE.Group();
		this._touchAreas = new THREE.Group();
		this._sceneGizmo.add(this._gizmo);
		// this._sceneGizmo.add(this._touchAreas);
		this._coordinateSystem = CoordinateSystem.World;
		this._nodes = [];
		this._matViewProj = new THREE.Matrix4();
		this._gizmoSize = 96;

		var arrowLength = 96,
			boxSize = 16 / arrowLength,
			touchBoxSize = 48 / arrowLength;

		function createGizmoBox(dir, color, touchAreas) {
			var m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dir.y, dir.z, dir.x), dir, new THREE.Vector3(dir.z, dir.x, dir.y));
			var boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
			boxGeometry.applyMatrix4(m);
			var material = new THREE.MeshLambertMaterial({ color: color, transparent: true });
			var box = new THREE.Mesh(boxGeometry, material);
			box.userData.color = color;

			if (dir) {
				box.position.copy(dir);
				var lineRadius = 1 / arrowLength;
				var lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, 1, 4);
				m.setPosition(dir.clone().multiplyScalar(-0.5));
				lineGeometry.applyMatrix4(m);
				var line = new THREE.Mesh(lineGeometry, material);
				line.renderOrder = 1;
				box.add(line);
				m.setPosition(dir); // set touch box position
			}

			var touchGeometry = new THREE.BoxGeometry(touchBoxSize, touchBoxSize, touchBoxSize);
			touchGeometry.applyMatrix4(m);
			touchAreas.add(new THREE.Mesh(touchGeometry, material));

			return box;
		}

		function createGizmoTriangle(a, b, touchAreas) {
			var lineGeometry = new THREE.BufferGeometry();
			var vertices = new Float32Array(6);
			vertices[a] = vertices[b + 3] = 0.7;
			lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
			var colors = new Float32Array(6);
			colors[a] = colors[b + 3] = 1;
			lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
			var line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, linewidth: window.devicePixelRatio }));
			line.userData.colors = colors;

			var triangleGeometry = new THREE.BufferGeometry();
			var triVertices = new Float32Array(9);
			triVertices[3 + a] = triVertices[6 + b] = 0.7;
			triangleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(triVertices, 3));
			triangleGeometry.setIndex([0, 1, 2]);
			var triangle = new THREE.Mesh(triangleGeometry, new THREE.MeshBasicMaterial({ color: 0xFFFF00, opacity: 0.5, transparent: true, side: THREE.DoubleSide, visible: false }));
			triangle.renderOrder = 1;
			line.add(triangle);

			touchAreas.add(triangle.clone());

			return line;
		}

		// create 3 boxes
		this._gizmo.add(createGizmoBox(new THREE.Vector3(1, 0, 0), AxisColours.x, this._touchAreas));
		this._gizmo.add(createGizmoBox(new THREE.Vector3(0, 1, 0), AxisColours.y, this._touchAreas));
		this._gizmo.add(createGizmoBox(new THREE.Vector3(0, 0, 1), AxisColours.z, this._touchAreas));

		// create 3 triangles
		this._gizmo.add(createGizmoTriangle(1, 2, this._touchAreas));
		this._gizmo.add(createGizmoTriangle(2, 0, this._touchAreas));
		this._gizmo.add(createGizmoTriangle(0, 1, this._touchAreas));

		// create box in the center
		boxSize -= 0.1 / arrowLength; // z-fighting fix
		var boxMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0, transparent: true });
		this._gizmo.add(new THREE.Mesh(new THREE.BoxGeometry(boxSize, boxSize, boxSize), boxMaterial));
		this._touchAreas.add(new THREE.Mesh(new THREE.BoxGeometry(touchBoxSize, touchBoxSize, touchBoxSize), new THREE.MeshBasicMaterial()));

		this._axisTitles = this._createAxisTitles();
		this._sceneGizmo.add(this._axisTitles);

		this._updateGizmoPartVisibility();
	};

	ScaleToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	ScaleToolGizmo.prototype._updateGizmoPartVisibility = function() {
		var screenSystem = this._coordinateSystem === CoordinateSystem.Screen;
		var gizmoObjects = this._gizmo.children,
			touchObjects = this._touchAreas.children;
		gizmoObjects[2].visible = touchObjects[2].visible = !screenSystem;
		gizmoObjects[3].visible = gizmoObjects[4].visible = touchObjects[3].visible = touchObjects[4].visible = !screenSystem && this._nonUniformScaleEnabled;
		gizmoObjects[5].visible = touchObjects[5].visible = this._nonUniformScaleEnabled;
		this._axisTitles.children[2].visible = !screenSystem;
	};

	ScaleToolGizmo.prototype.resetValues = function() {
		this._value.setScalar(1);
	};

	ScaleToolGizmo.prototype.setCoordinateSystem = function(coordinateSystem) {
		this._coordinateSystem = coordinateSystem;
		this._gizmoIndex = this._handleIndex = -1;
		this._updateGizmoPartVisibility();
	};

	ScaleToolGizmo.prototype.setNonUniformScaleEnabled = function(value) {
		this._nonUniformScaleEnabled = !!value;
		this._updateGizmoPartVisibility();
	};

	ScaleToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._nodes.length = 0;
		this._sequence = null;
		this._updateSelection(viewport._viewStateManager);
		var nodesProperties = this._getNodesProperties();
		this._tool.fireEvent("scaling", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
	};

	ScaleToolGizmo.prototype.hide = function() {
		this._cleanTempData();
		this._viewport = null;
		this._tool = null;
		this._gizmoIndex = this._handleIndex = -1;
		this._sequence = null;
		this._updateEditingForm(false);
	};

	ScaleToolGizmo.prototype.getGizmoCount = function() {
		if (this._coordinateSystem === CoordinateSystem.Local || this._coordinateSystem === CoordinateSystem.Parent) {
			return this._nodes.length;
		} else {
			return this._nodes.length > 0 ? 1 : 0;
		}
	};

	ScaleToolGizmo.prototype.getTouchObject = function(i) {
		if (this._nodes.length === 0) {
			return null;
		}

		this._updateGizmoObjectTransformation(this._touchAreas, i);

		return this._touchAreas;
	};

	var arrowHighlighting = [1, 2, 4, 6, 5, 3];

	ScaleToolGizmo.prototype.highlightHandle = function(index, hoverMode) {
		var highlightAll = (index === 6) || (index >= 0 && !this._nonUniformScaleEnabled);
		var i, obj;
		for (i = 0; i < 3; i++) {// arrows
			obj = this._gizmo.children[i];
			var highlight = highlightAll || (arrowHighlighting[index] & (1 << i));
			var color = highlight ? 0xFFFF00 : obj.userData.color;
			obj.material.color.setHex(color); // arrow line color
			obj.children[0].material.color.setHex(color); // arrow cone color
			obj.children[0].material.opacity = obj.material.opacity = highlight || hoverMode ? 1 : 0.35;

			var axisTitle = this._axisTitles.children[i];
			axisTitle.material.color.setHex(color);
			axisTitle.material.opacity = highlight || hoverMode ? 1 : 0.35;
		}

		for (i = 3; i < 6; i++) {// triangles
			obj = this._gizmo.children[i];
			var colorAttr = obj.geometry.attributes.color;
			colorAttr.copyArray(highlightAll || i === index ? [1, 1, 0, 1, 1, 0] : obj.userData.colors);
			colorAttr.needsUpdate = true;
			obj.material.opacity = hoverMode || i === index ? 1 : 0.35;
			obj.children[0].material.visible = i === index;
		}

		obj = this._gizmo.children[6];
		obj.material.color.setHex(highlightAll ? 0xFFFF00 : 0xC0C0C0);
		obj.material.opacity = highlightAll || hoverMode ? 1 : 0.35;
	};

	ScaleToolGizmo.prototype.selectHandle = function(index, gizmoIndex) {
		this._gizmoIndex = gizmoIndex;
		this._handleIndex = index;
		if (this._tool.getAutoResetValues()) {
			this.resetValues();
		}
		this._viewport.setShouldRenderFrame();
	};

	ScaleToolGizmo.prototype.beginGesture = function() {
		this._beginValue = this._value.clone();
		this._scaleDelta.setScalar(1);

		this._matOrigin = this._gizmo.matrixWorld.clone();
		this._nodes.forEach(function(nodeInfo) {
			nodeInfo.scaleOrigin = nodeInfo.node.scale.clone();
			nodeInfo.matOrigin = nodeInfo.node.matrixWorld.clone();
			if (nodeInfo.node.parent) {
				nodeInfo.matParentInv = new THREE.Matrix4().copy(nodeInfo.node.parent.matrixWorld).invert();
			} else {
				nodeInfo.matParentInv = new THREE.Matrix4();
			}
		});
	};

	ScaleToolGizmo.prototype._prepareForCreatingScaleKey = function(sequence) {
		this._sequence = sequence;
	};

	ScaleToolGizmo.prototype._printEventInfo = function(event, x, y, z, nodesProperties) {
		Log.debug(event + " is fired:" + " x = " + x + "; y = " + y + "; z = " + z);
		nodesProperties.forEach(function(properties) {
			Log.debug("Node: " + properties.node.name);
			if (properties.offsetToRest) {
				Log.debug("offsetToRest: [ " + properties.offsetToRest[0] + ", " + properties.offsetToRest[1] + ", " + properties.offsetToRest[2] + " ] ");
			} else {
				Log.debug("offsetToRest: null");
			}
			if (properties.offsetToPrevious) {
				Log.debug("offsetToPrevious: [ " + properties.offsetToPrevious[0] + ", " + properties.offsetToPrevious[1] + ", " + properties.offsetToPrevious[2] + " ] ");
			} else {
				Log.debug("offsetToPrevious: null");
			}
			if (properties.absolute) {
				Log.debug("absolute: [ " + properties.absolute[0] + ", " + properties.absolute[1] + ", " + properties.absolute[2] + " ] ");
			} else {
				Log.debug("absolute: null");
			}
			if (properties.world) {
				Log.debug("world: [ " + properties.world[0] + ", " + properties.world[1] + ", " + properties.world[2] + " ] ");
			} else {
				Log.debug("world: null");
			}
			if (properties.restDifference) {
				Log.debug("restDifference: [ " + properties.restDifference[0] + ", " + properties.restDifference[1] + ", " + properties.restDifference[2] + " ] ");
			} else {
				Log.debug("restDifference: null");
			}
			if (properties.restDifferenceInCoordinates) {
				Log.debug("restDifferenceInCoordinates: [ " + properties.restDifferenceInCoordinates[0] + ", " + properties.restDifferenceInCoordinates[1] + ", " + properties.restDifferenceInCoordinates[2] + " ] ");
			} else {
				Log.debug("restDifferenceInCoordinates: null");
			}
		});
	};

	ScaleToolGizmo.prototype._getNodesProperties = function() {
		var nodesProperties = [];
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			var property = {};
			property.node = node;

			var rtransform = this._viewport._viewStateManager.getRelativeTransformation(node);
			property.offsetToRest = [rtransform.scale[0], rtransform.scale[1], rtransform.scale[2]];
			property.offsetToPrevious = property.offsetToRest.slice();

			var parent = this._getEffectiveParent(node);
			if (parent !== node.parent) {  // joint
				if (node.userData.skipUpdateJointNode) {
					this._viewport._viewStateManager._setJointNodeOffsets(node, AnimationTrackType.Scale);
				}

				if (node.userData && node.userData.offsetScale) {
					property.offsetToRest = node.userData.offsetScale.slice();
				} else {
					property.offsetToRest = [1, 1, 1];
				}
				property.offsetToPrevious = property.offsetToRest.slice();

				if (node.userData.skipUpdateJointNode) {
					node.userData.skipUpdateJointNode = false;
					this._viewport._viewStateManager._setJointNodeMatrix();
					node.userData.skipUpdateJointNode = true;
				}
			}

			if (this._playback) {
				var sequenceOffset = this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Scale, this._playback);
				if (sequenceOffset) {
					property.offsetToPrevious[0] /= sequenceOffset[0];
					property.offsetToPrevious[1] /= sequenceOffset[1];
					property.offsetToPrevious[2] /= sequenceOffset[2];
				}
			}

			var transform = this._viewport._viewStateManager.getTransformation(node);
			property.absolute = [transform.scale[0], transform.scale[1], transform.scale[2]];

			var wtrans = this._viewport._viewStateManager.getTransformationWorld(node);
			property.world = wtrans.scale;
			var userData;
			if (this._nodeUserDataMap) {
				userData = this._nodeUserDataMap.get(node);
			}

			if (!nodeInfo.matParentInv) {
				nodeInfo.matParentInv = new THREE.Matrix4().copy(node.parent.matrixWorld).invert();
			}

			var gmat = new THREE.Matrix4();
			if (this._gizmo) {
				gmat = this._gizmo.matrixWorld.clone();
			}
			var sc = new THREE.Vector3();

			var wmatScale, matScale, scale;
			if (userData && userData.initialScale) {
				property.restDifference = [transform.scale[0] / userData.initialScale[0], transform.scale[1] / userData.initialScale[1], transform.scale[2] / userData.initialScale[2]];
				scale = new THREE.Vector3(property.restDifference[0], property.restDifference[1], property.restDifference[2]);

				// due to the problem with threejs decompose function,
				// the signs of offset scale components has to be adjusted in case of negative components,
				// based on the assumption that node orientation is not changed
				var quaternionVector = new THREE.Quaternion(transform.quaternion[0], transform.quaternion[1], transform.quaternion[2], transform.quaternion[3]);
				var rotMat = new THREE.Matrix4().makeRotationFromQuaternion(quaternionVector);
				var initialRotMat = new THREE.Matrix4().makeRotationFromQuaternion(userData.initialQuaternion);

				var vx = new THREE.Vector3();
				var vy = new THREE.Vector3();
				var vz = new THREE.Vector3();
				rotMat.extractBasis(vx, vy, vz);

				var rvx = new THREE.Vector3();
				var rvy = new THREE.Vector3();
				var rvz = new THREE.Vector3();
				initialRotMat.extractBasis(rvx, rvy, rvz);
				if (vx.dot(rvx) < 0) {
					property.restDifference[0] = -property.restDifference[0];
				}
				if (vy.dot(rvy) < 0) {
					property.restDifference[1] = -property.restDifference[1];
				}
				if (vz.dot(rvz) < 0) {
					property.restDifference[2] = -property.restDifference[2];
				}

				wmatScale = node.parent.matrixWorld.clone().scale(scale).multiply(nodeInfo.matParentInv);
				wmatScale.decompose(new THREE.Vector3(), new THREE.Quaternion(), sc);
				if (this._coordinateSystem === CoordinateSystem.World) {
					property.restDifferenceInCoordinates = [sc.x, sc.y, sc.z];
				} else {
					matScale = new THREE.Matrix4().copy(gmat).invert().multiply(wmatScale).multiply(gmat);
					matScale.decompose(new THREE.Vector3(), new THREE.Quaternion(), sc);
					property.restDifferenceInCoordinates = [sc.x, sc.y, sc.z];
				}

				// make signs of scale components in gizmo coordinates consistent with node coordinates
				var indices = this._alignAxesBetweenGizmoAndNodeCoordinates(node);
				for (var i = 0; i < 3; i++) {
					if (property.restDifference[i] > 0) {
						property.restDifferenceInCoordinates[indices[i]] = Math.abs(property.restDifferenceInCoordinates[indices[i]]);
					} else {
						property.restDifferenceInCoordinates[indices[i]] = -Math.abs(property.restDifferenceInCoordinates[indices[i]]);
					}
				}
			}
			nodesProperties.push(property);
		}.bind(this));

		return nodesProperties;
	};

	ScaleToolGizmo.prototype.endGesture = function() {
		var nodesProperties = this._getNodesProperties();
		delete this._beginValue;

		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (node.userData) {
				delete node.userData.skipUpdateJointNode;
			}
			this._viewport._viewStateManager._setJointNodeOffsets(node, AnimationTrackType.Scale);
		}.bind(this));

		this._tool.fireScaled({ x: this._scaleDelta.x, y: this._scaleDelta.y, z: this._scaleDelta.z, nodesProperties: nodesProperties });
		this._printEventInfo("Event 'scaled'", this._scaleDelta.x, this._scaleDelta.y, this._scaleDelta.z, nodesProperties);
	};

	ScaleToolGizmo.prototype._alignAxesBetweenGizmoAndNodeCoordinates = function(node, withNode) {

		// find which vector out of v1, v2, v3 is closest to the direction or opposite direction of of v
		function getClosestAligned(v, v1, v2, v3) {
			var d1 = Math.abs(v.dot(v1));
			var d2 = Math.abs(v.dot(v2));
			var d3 = Math.abs(v.dot(v3));

			if (d1 >= d2 && d1 >= d3) {
				return 0;
			} else if (d2 >= d1 && d2 >= d3) {
				return 1;
			} else {
				return 2;
			}
		}

		var nodeMat = node.parent.matrixWorld.clone().multiply(new THREE.Matrix4().makeRotationFromQuaternion(node.quaternion.clone()));
		var vx = new THREE.Vector3();
		var vy = new THREE.Vector3();
		var vz = new THREE.Vector3();
		nodeMat.extractBasis(vx, vy, vz);
		vx.normalize();
		vy.normalize();
		vz.normalize();

		var gizmoMat = new THREE.Matrix4();
		if (this._gizmo) {
			gizmoMat = this._gizmo.matrixWorld.clone();
		}
		var gvx = new THREE.Vector3();
		var gvy = new THREE.Vector3();
		var gvz = new THREE.Vector3();
		gizmoMat.extractBasis(gvx, gvy, gvz);
		gvx.normalize();
		gvy.normalize();
		gvz.normalize();

		var indices = [];
		var index;
		if (withNode) {
			index = getClosestAligned(gvx, vx, vy, vz);
			indices.push(index);
			index = getClosestAligned(gvy, vx, vy, vz);
			indices.push(index);
			index = getClosestAligned(gvz, vx, vy, vz);
			indices.push(index);
		} else {
			index = getClosestAligned(vx, gvx, gvy, gvz);
			indices.push(index);
			index = getClosestAligned(vy, gvx, gvy, gvz);
			indices.push(index);
			index = getClosestAligned(vz, gvx, gvy, gvz);
			indices.push(index);
		}
		return indices;
	};


	ScaleToolGizmo.prototype._scale = function(scale) {

		function changeSigns(scaleVector, index, scaleOrigin, appliedScalePositive) {
			if (index === 0) {
				if ((appliedScalePositive && scaleOrigin.x > 0) || (!appliedScalePositive && scaleOrigin.x < 0)) {
					scaleVector.x = Math.abs(scaleVector.x);
				} else {
					scaleVector.x = -Math.abs(scaleVector.x);
				}
			} else if (index === 1) {
				if ((appliedScalePositive && scaleOrigin.y > 0) || (!appliedScalePositive && scaleOrigin.y < 0)) {
					scaleVector.y = Math.abs(scaleVector.y);
				} else {
					scaleVector.y = -Math.abs(scaleVector.y);
				}
			} else if (index === 2) {
				if ((appliedScalePositive && scaleOrigin.z > 0) || (!appliedScalePositive && scaleOrigin.z < 0)) {
					scaleVector.z = Math.abs(scaleVector.z);
				} else {
					scaleVector.z = -Math.abs(scaleVector.z);
				}
			}
		}

		if (!this._beginValue) {
			this._beginValue = this._value.clone();
		}
		this._value.multiplyVectors(this._beginValue, scale);
		this._scaleDelta.copy(scale);

		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (!node.userData) {
				node.userData = {};
			}
			node.userData.skipUpdateJointNode = true;
		});

		if (this._coordinateSystem === CoordinateSystem.Local) {
			this._nodes.forEach(function(nodeInfo) {
				nodeInfo.node.scale.copy(nodeInfo.scaleOrigin).multiply(scale);
				nodeInfo.node.updateMatrix();
			});
		} else {
			var matScale = this._matOrigin.clone().scale(scale).multiply(new THREE.Matrix4().copy(this._matOrigin).invert());

			this._nodes.forEach(function(nodeInfo) {
				if (!nodeInfo.ignore) {
					var node = nodeInfo.node;
					node.matrixWorld.multiplyMatrices(matScale, nodeInfo.matOrigin);
					node.matrix.multiplyMatrices(nodeInfo.matParentInv, node.matrixWorld);

					if (this._coordinateSystem === CoordinateSystem.Parent) {
						// threejs decompose function does not always give the correct signs of scale components
						var nmat = node.matrix.clone();
						nmat.elements[12] = 0;
						nmat.elements[13] = 0;
						nmat.elements[14] = 0;

						var smat = new THREE.Matrix4().makeRotationFromQuaternion(node.quaternion.clone().invert()).multiply(node.matrix);
						var te = smat.elements;
						node.scale.x = te[0];
						node.scale.y = te[5];
						node.scale.z = te[10];
						node.updateMatrix();
					} else {
						node.matrix.decompose(node.position, new THREE.Quaternion(), node.scale);
						// threejs decompose function does not always give the correct signs of scale components, redo the signs
						// due to the problem with threejs decompose function,
						// the signs of scale components have to be adjusted in case of negative components,
						// to make the signs consistent with the scale in gizmo coordinates
						var indices = this._alignAxesBetweenGizmoAndNodeCoordinates(node, true);

						changeSigns(node.scale, indices[0], nodeInfo.scaleOrigin, scale.x > 0);
						changeSigns(node.scale, indices[1], nodeInfo.scaleOrigin, scale.y > 0);
						changeSigns(node.scale, indices[2], nodeInfo.scaleOrigin, scale.z > 0);

						node.updateMatrix();
					}
				}
			}.bind(this));
		}
		this._viewport.setShouldRenderFrame();
	};

	ScaleToolGizmo.prototype.scale = function(x, y, z) {
		this.beginGesture();
		this._scale(new THREE.Vector3(x, y, z));
	};

	ScaleToolGizmo.prototype._setScale = function(scale) {
		var nodesProperties = this._getNodesProperties();
		if (this._tool.fireEvent("scaling", { x: scale.x, y: scale.y, z: scale.z, nodesProperties: nodesProperties }, true)) {
			this._printEventInfo("Event 'scaling'", scale.x, scale.y, scale.z, nodesProperties);
			this._scale(scale);
		}
	};

	ScaleToolGizmo.prototype.getValue = function() {
		return (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) ? this._value.getComponent(this._handleIndex) : 1;
	};

	ScaleToolGizmo.prototype.setValue = function(value) {
		if (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) {
			var axisScale = value / this._value.getComponent(this._handleIndex);
			var scale = new THREE.Vector3(1, 1, 1);
			if (this._nonUniformScaleEnabled) {
				scale.setComponent(this._handleIndex, axisScale);
			} else {
				scale.setScalar(axisScale);
			}
			this.beginGesture();
			this._scale(scale);
			this.endGesture();
		}
	};

	ScaleToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			this._expandBoundingBox(boundingBox, this._viewport.getCamera().getCameraRef(), true);
		}
	};

	ScaleToolGizmo.prototype._updateSelection = function(viewStateManager) {
		Gizmo.prototype._updateSelection.call(this, viewStateManager);

		if (this._tool.getEnableSnapping()) {
			this._tool.getDetector().setSource(viewStateManager);
		}
	};

	ScaleToolGizmo.prototype.handleSelectionChanged = function(event) {
		this._sequence = null;
		if (this._viewport) {
			this._updateSelection(this._viewport._viewStateManager);
			this._gizmoIndex = this._handleIndex = -1;
			var nodesProperties = this._getNodesProperties();
			this._tool.fireEvent("scaling", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
		}
	};

	ScaleToolGizmo.prototype._getObjectScale = function(objectIndex) {
		if (this._nodes.length === 1) {
			return this._nodes[0].node.scale;
		} else if (this._coordinateSystem === CoordinateSystem.Local) {
			return this._nodes[objectIndex].node.scale;
		}
		return new THREE.Vector3(1, 1, 1);
	};

	ScaleToolGizmo.prototype._getObjectSize = function(objectIndex) {
		var boundingBox = new THREE.Box3();
		if (this._nodes.length === 1) {
			this._nodes[0].node._expandBoundingBox(boundingBox, true, false);
		} else if (this._coordinateSystem === CoordinateSystem.Local) {
			this._nodes[0].node._expandBoundingBox(boundingBox, true, false);
		}
		if (boundingBox.isEmpty()) {
			return 0;
		}
		var size = new THREE.Vector3();
		boundingBox.getSize(size);
		return size.length();
	};

	ScaleToolGizmo.prototype._updateGizmoTransformation = function(gi, camera) {
		var scale = this._updateGizmoObjectTransformation(this._gizmo, gi);
		this._updateAxisTitles(this._axisTitles, this._gizmo, camera, this._gizmoSize + 30, scale);
	};

	ScaleToolGizmo.prototype._getEditingFormPosition = function() {
		var scale = this._updateGizmoObjectTransformation(this._gizmo, this._gizmoIndex);
		var direction = new THREE.Vector3().setFromMatrixColumn(this._gizmo.matrixWorld, this._handleIndex).normalize();
		return direction.clone().multiplyScalar((this._gizmoSize + 18) * scale).add(this._gizmo.position).applyMatrix4(this._matViewProj);
	};

	ScaleToolGizmo.prototype.render = function() {
		assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		if (this._nodes.length > 0) {
			var renderer = this._viewport.getRenderer(),
				camera = this._viewport.getCamera().getCameraRef();

			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

			renderer.clearDepth();

			for (var i = 0, l = this.getGizmoCount(); i < l; i++) {
				this._updateGizmoTransformation(i, camera);
				renderer.render(this._sceneGizmo, camera);
			}
		}

		this._updateEditingForm(this._nodes.length > 0 && this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3, this._handleIndex);
	};

	return ScaleToolGizmo;
});
