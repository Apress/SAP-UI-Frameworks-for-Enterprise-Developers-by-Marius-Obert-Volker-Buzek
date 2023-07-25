/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.RotateToolGizmo
sap.ui.define([
	"../thirdparty/three",
	"./Gizmo",
	"./RotateToolGizmoRenderer",
	"./RotatableAxis",
	"./CoordinateSystem",
	"./AxisColours",
	"../AnimationTrackType",
	"../AnimationTrackValueType",
	"./GizmoPlacementMode",
	"sap/base/assert",
	"sap/base/Log"
], function(
	THREE,
	Gizmo,
	RotateToolGizmoRenderer,
	RotatableAxis,
	CoordinateSystem,
	AxisColours,
	AnimationTrackType,
	AnimationTrackValueType,
	GizmoPlacementMode,
	assert,
	Log
) {
	"use strict";

	/**
	 * Constructor for a new RotateToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides handles for object rotation tool
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.RotateToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RotateToolGizmo = Gizmo.extend("sap.ui.vk.tools.RotateToolGizmo", /** @lends sap.ui.vk.tools.RotateToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	RotateToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._createEditingForm(String.fromCharCode(176), 84); // degrees sign
		this._gizmoIndex = -1;
		this._handleIndex = -1;
		this._value = new THREE.Vector3(); // in degrees
		this._rotationDelta = new THREE.Vector3(); // in degrees

		this._viewport = null;
		this._tool = null;
		this._sceneGizmo = new THREE.Scene();
		this._gizmo = new THREE.Group();
		this._touchAreas = new THREE.Group();
		this._sceneGizmo.add(this._gizmo);
		this._axis = RotatableAxis.All;
		this._coordinateSystem = CoordinateSystem.World;
		this._nodes = [];
		this._matViewProj = new THREE.Matrix4();
		this._gizmoSize = 96;

		function createGizmoCircle(axis, color, radius, segments) {
			var geometry = new THREE.TorusGeometry(radius, 1 / 96, 4, segments);
			if (axis === 0) {
				geometry.rotateY(Math.PI / 2);
			} else if (axis === 1) {
				geometry.rotateX(Math.PI / 2);
			}
			var circle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: color, transparent: true }));
			circle.matrixAutoUpdate = false;
			circle.userData.color = color;

			return circle;
		}

		function createTouchCircle(axis, radius, segments) {
			var geometry = new THREE.TorusGeometry(radius, 16 / 96, 4, segments);
			if (axis === 0) {
				geometry.rotateY(Math.PI / 2);
			} else if (axis === 1) {
				geometry.rotateX(Math.PI / 2);
			}
			return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ opacity: 0.2, transparent: true }));
		}

		// create 3 circles
		for (var i = 0; i < 3; i++) {
			this._gizmo.add(createGizmoCircle(i, AxisColours[["x", "y", "z"][i]], 1, 128));
			this._touchAreas.add(createTouchCircle(i, 1, 24));
		}

		this._gizmo.add(new THREE.AxesHelper(0.75));

		var arcMaterial = new THREE.MeshBasicMaterial({ color: 0x0080FF, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
		this._arcMesh = new THREE.Mesh(new THREE.BufferGeometry(), arcMaterial);
		this._arcMesh.visible = false;
		this._gizmo.add(this._arcMesh);

		this._axisTitles = this._createAxisTitles();
		this._sceneGizmo.add(this._axisTitles);
	};

	RotateToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	// set rotatable axis
	// NOT apply to screen coordinate system
	RotateToolGizmo.prototype.setAxis = function(value) {
		this._axis = value;
		var RotatableAxises = [RotatableAxis.All, RotatableAxis.X, RotatableAxis.Y, RotatableAxis.Z];
		if (this._coordinateSystem !== CoordinateSystem.Screen) {
			for (var i = 0; i < 3; i++) {
				if (value !== RotatableAxis.All && RotatableAxises[i + 1] !== value) {
					this._gizmo.children[i].visible = this._touchAreas.children[i].visible = false;
				} else {
					this._gizmo.children[i].visible = this._touchAreas.children[i].visible = true;
				}
			}
		}
	};

	RotateToolGizmo.prototype.resetValues = function() {
		this._value.setScalar(0);
	};

	RotateToolGizmo.prototype.setCoordinateSystem = function(coordinateSystem) {
		this._coordinateSystem = coordinateSystem;
		var screenSystem = coordinateSystem === CoordinateSystem.Screen;
		if (screenSystem) {
			this._gizmo.children[0].visible = this._gizmo.children[1].visible = false;
			this._touchAreas.children[0].visible = this._touchAreas.children[1].visible = false;
			this._gizmo.children[2].visible = this._touchAreas.children[2].visible = true;
		} else {
			this._gizmo.children[0].visible = this._touchAreas.children[0].visible = this._axis === RotatableAxis.All || this._axis === RotatableAxis.X;
			this._gizmo.children[1].visible = this._touchAreas.children[1].visible = this._axis === RotatableAxis.All || this._axis === RotatableAxis.Y;
			this._gizmo.children[2].visible = this._touchAreas.children[2].visible = this._axis === RotatableAxis.All || this._axis === RotatableAxis.Z;
		}
		this._axisTitles.visible = !screenSystem;
		this._gizmoIndex = this._handleIndex = -1;
	};

	RotateToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this._nodes.length = 0;
		this._updateSelection(viewport._viewStateManager);
		var nodesProperties = this._getNodesProperties();
		this._tool.fireEvent("rotating", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
	};

	RotateToolGizmo.prototype._prepareForCreatingRotationKey = function(animationPlayer, time, playbackIndex) {
		this._nodes.forEach(function(nodeInfo) {
			var nodeRef = nodeInfo.node;
			var euler = [0, 0, 0];
			animationPlayer.setTime(time, playbackIndex);
			var data = animationPlayer.getAnimatedProperty(nodeRef, AnimationTrackType.Rotate);
			if (data.offsetToPrevious) {
				euler = data.offsetToPrevious;
			}
			if (!this._nodeUserDataMap) {
				this._nodeUserDataMap = new Map();
			}
			var userData = this._nodeUserDataMap.get(nodeRef);
			if (!userData) {
				userData = {};
				this._nodeUserDataMap.set(nodeRef, userData);
			}

			userData.eulerInParentCoors = new THREE.Euler(euler[0], euler[1], euler[2]);
			userData.startEulerInParentCoors = new THREE.Euler(euler[0], euler[1], euler[2]);
		}.bind(this));

		var playback = animationPlayer.getCurrentPlayback();
		if (playback) {
			this._prepareForCreatingKey(playback);
		}
	};

	RotateToolGizmo.prototype.hide = function() {
		this._cleanTempData();
		this._viewport = null;
		this._tool = null;
		this._gizmoIndex = this._handleIndex = -1;
		this._updateEditingForm(false);
	};

	RotateToolGizmo.prototype.getGizmoCount = function() {
		if (this._coordinateSystem === CoordinateSystem.Local || this._coordinateSystem === CoordinateSystem.Parent) {
			return this._nodes.length;
		} else {
			return this._nodes.length > 0 ? 1 : 0;
		}
	};

	RotateToolGizmo.prototype.getTouchObject = function(i) {
		if (this._nodes.length === 0) {
			return null;
		}

		this._updateGizmoObjectTransformation(this._touchAreas, i);

		return this._touchAreas;
	};

	RotateToolGizmo.prototype.highlightHandle = function(index, hoverMode) {
		for (var i = 0; i < 3; i++) {// circles
			var arrow = this._gizmo.children[i];
			var color = i === index ? 0xFFFF00 : arrow.userData.color;
			arrow.material.color.setHex(color); // circle color
			// arrow.material.opacity = (i === index || hoverMode) ? 1 : 0.35;
			arrow.material.opacity = index === -1 || i === index ? 1 : 0.35;
			// arrow.material.transparent = !hoverMode;
			arrow.material.visible = hoverMode || i === index;

			var axisTitle = this._axisTitles.children[i];
			axisTitle.material.color.setHex(color);
			axisTitle.material.opacity = index === -1 || i === index ? 1 : 0.35;
			axisTitle.material.visible = hoverMode || i === index;
		}
	};

	RotateToolGizmo.prototype.selectHandle = function(index, gizmoIndex) {
		this._gizmoIndex = gizmoIndex;
		this._handleIndex = index;
		if (this._tool.getAutoResetValues()) {
			this.resetValues();
		}
		this._viewport.setShouldRenderFrame();
	};

	RotateToolGizmo.prototype.beginGesture = function() {
		this._beginValue = this._value.clone();
		this._rotationDelta.setScalar(0);

		this._matOrigin = this._gizmo.matrixWorld.clone();
		this._nodes.forEach(function(nodeInfo) {
			nodeInfo.node.parent.updateMatrixWorld(true);
			nodeInfo.matOrigin = nodeInfo.node.matrixWorld.clone();
			nodeInfo.matLocalOrigin = nodeInfo.node.matrix.clone();
			if (nodeInfo.node.parent) {
				nodeInfo.matParentInv = new THREE.Matrix4().copy(nodeInfo.node.parent.matrixWorld).invert();
			} else {
				nodeInfo.matParentInv = new THREE.Matrix4();
			}
			nodeInfo.quaternion = nodeInfo.node.quaternion.clone();
		});
	};

	RotateToolGizmo.prototype._printEventInfo = function(event, x, y, z, nodesProperties) {
		Log.debug(event + " is fired:" + " x = " + x + "; y = " + y + "; z = " + z);
		nodesProperties.forEach(function(properties) {
			Log.debug("Node: " + properties.node.name);
			if (properties.offsetToRest) {
				Log.debug("offsetToRest: [ " + properties.offsetToRest[0] + ", "
					+ properties.offsetToRest[1] + ", "
					+ properties.offsetToRest[2] + ", "
					+ properties.offsetToRest[3] + " ] ");
			} else {
				Log.debug("offsetToRest: null");
			}
			if (properties.offsetToRestInCoordinates) {
				Log.debug("offsetToRestInCoordinates: [ " + properties.offsetToRestInCoordinates[0] + ", "
					+ properties.offsetToRestInCoordinates[1] + ", "
					+ properties.offsetToRestInCoordinates[2] + " ] ");
			} else {
				Log.debug("offsetToRestInCoordinates: null");
			}
			if (properties.offsetToPrevious) {
				Log.debug("offsetToPrevious: [ " + properties.offsetToPrevious[0] + ", "
					+ properties.offsetToPrevious[1] + ", "
					+ properties.offsetToPrevious[2] + " ] ");
			} else {
				Log.debug("offsetToPrevious: null");
			}
			if (properties.absolute) {
				Log.debug("absolute: [ " + properties.absolute[0] + ", "
					+ properties.absolute[1] + ", "
					+ properties.absolute[2] + ", "
					+ properties.absolute[3] + " ] ");
			} else {
				Log.debug("absolute: null");
			}
			if (properties.world) {
				Log.debug("world: [ " + properties.world[0] + ", "
					+ properties.world[1] + ", "
					+ properties.world[2] + ", "
					+ properties.world[3] + " ] ");
			} else {
				Log.debug("world: null");
			}
			if (properties.restDifference) {
				Log.debug("restDifference: [ " + properties.restDifference[0] + ", "
					+ properties.restDifference[1] + ", "
					+ properties.restDifference[2] + ", "
					+ properties.restDifference[3] + " ] ");
			} else {
				Log.debug("restDifference: null");
			}
			if (properties.restDifferenceInCoordinates) {
				Log.debug("restDifference: [ " + properties.restDifferenceInCoordinates[0] + ", "
					+ properties.restDifferenceInCoordinates[1] + ", "
					+ properties.restDifferenceInCoordinates[2] + ", "
					+ properties.restDifferenceInCoordinates[3] + " ] ");
			} else {
				Log.debug("restDifference: null");
			}

		});
	};

	RotateToolGizmo.prototype._getNodesProperties = function() {
		var nodesProperties = [];
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			var property = {};
			property.node = node;

			var userData;
			if (this._nodeUserDataMap) {
				userData = this._nodeUserDataMap.get(node);
			}

			if (userData && userData.eulerInParentCoors) {
				var offsetEuler = new THREE.Euler(userData.eulerInParentCoors.x, userData.eulerInParentCoors.y, userData.eulerInParentCoors.z);
				var offsetQ = new THREE.Quaternion().setFromEuler(offsetEuler);
				if (this._playback) {
					var sequenceOffset = this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(node, AnimationTrackType.Rotate, this._playback);
					if (sequenceOffset) {
						var sequenceOffsetQ = new THREE.Quaternion(sequenceOffset[0], sequenceOffset[1], sequenceOffset[2], sequenceOffset[3]);
						offsetQ.multiply(sequenceOffsetQ);
					}
				}
				property.offsetToRest = [offsetQ.x, offsetQ.y, offsetQ.z, offsetQ.w];
				property.offsetToPrevious = [userData.eulerInParentCoors.x, userData.eulerInParentCoors.y, userData.eulerInParentCoors.z];
			} else {
				property.offsetToRest = null;
				property.offsetToPrevious = null;
			}

			var transform = this._viewport._viewStateManager.getTransformation(node);
			property.absolute = [transform.quaternion[0], transform.quaternion[1], transform.quaternion[2], transform.quaternion[3]];

			var wtrans = this._viewport._viewStateManager.getTransformationWorld(node);
			var wq = new THREE.Quaternion(wtrans.quaternion[0], wtrans.quaternion[1], wtrans.quaternion[2], wtrans.quaternion[3]);
			var we = new THREE.Euler().setFromQuaternion(wq);
			property.world = [we.x, we.y, we.z];

			if (userData && userData.quatInitialDiffInv) {
				var quat = new THREE.Quaternion(transform.quaternion[0], transform.quaternion[1], transform.quaternion[2], transform.quaternion[3]);
				quat.multiply(userData.quatInitialDiffInv);
				property.restDifference = [quat.x, quat.y, quat.z, quat.w];
			} else {
				property.restDifference = null;
			}

			if (userData.euler) {
				property.restDifferenceInCoordinates = [userData.euler.x, userData.euler.y, userData.euler.z];
			} else {
				property.restDifferenceInCoordinates = null;
			}

			property.offsetToRestInCoordinates = null; // property.restDifferenceInCoordinates.slice();

			nodesProperties.push(property);
		}.bind(this));

		return nodesProperties;
	};

	RotateToolGizmo.prototype.endGesture = function() {
		this._arcMesh.visible = false;
		var nodesProperties = this._getNodesProperties();
		delete this._beginValue;

		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			var userData;
			if (this._nodeUserDataMap) {
				userData = this._nodeUserDataMap.get(node);
			}
			if (userData && userData.euler) {
				userData.startEuler.x = userData.euler.x;
				userData.startEuler.y = userData.euler.y;
				userData.startEuler.z = userData.euler.z;
				userData.startEulerInParentCoors.x = userData.eulerInParentCoors.x;
				userData.startEulerInParentCoors.y = userData.eulerInParentCoors.y;
				userData.startEulerInParentCoors.z = userData.eulerInParentCoors.z;
			}
			if (this._coordinateSystem !== CoordinateSystem.Custom) {
				delete node.userData.skipUpdateJointNode;
			}
			this._viewport._viewStateManager._setJointNodeOffsets(node, AnimationTrackType.Rotate);
		}.bind(this));

		this._tool.fireRotated({ x: this._rotationDelta.x, y: this._rotationDelta.y, z: this._rotationDelta.z, nodesProperties: nodesProperties });
		this._printEventInfo("Event 'rotated'", this._rotationDelta.x, this._rotationDelta.y, this._rotationDelta.z, nodesProperties);
	};

	var getNearestRotation = function(original, target) {

		if (Math.abs(original - target) < 0.000001) {
			return original;
		}

		if (original > target) {
			while (original > target) {
				target += 2 * Math.PI;
			}
			if (target - original <= Math.PI) {
				return target;
			} else {
				return target - 2 * Math.PI;
			}
		} else {
			while (original < target) {
				target -= 2 * Math.PI;
			}
			if (original - target <= Math.PI) {
				return target;
			} else {
				return target + 2 * Math.PI;
			}
		}
	};

	RotateToolGizmo.prototype.rotateFromRestPosition = function(x, y, z) {


		if (this._coordinateSystem !== CoordinateSystem.Parent) {
			return;
		}

		this.beginGesture();
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (!node.userData) {
				node.userData = {};
			}
			node.userData.skipUpdateJointNode = true;
		});

		x = THREE.MathUtils.degToRad(x);
		y = THREE.MathUtils.degToRad(y);
		z = THREE.MathUtils.degToRad(z);

		for (var ni = 0, nc = this._nodes.length; ni < nc; ni++) {
			var nodeInfo = this._nodes[ni];
			if (!nodeInfo.ignore) {

				var node = nodeInfo.node;
				var userData;
				if (this._nodeUserDataMap) {
					userData = this._nodeUserDataMap.get(node);
				}
				if (userData && userData.euler && userData.eulerInParentCoors) {

					this._rotationDelta.set(THREE.MathUtils.radToDeg(x - userData.eulerInParentCoors.x), THREE.MathUtils.radToDeg(y - userData.eulerInParentCoors.y), THREE.MathUtils.radToDeg(z - userData.eulerInParentCoors.z));

					userData.eulerInParentCoors.x = x;
					userData.eulerInParentCoors.y = y;
					userData.eulerInParentCoors.z = z;
					var offsetEuler = new THREE.Euler(userData.eulerInParentCoors.x, userData.eulerInParentCoors.y, userData.eulerInParentCoors.z);
					var offsetQ = new THREE.Quaternion().setFromEuler(offsetEuler);
					var restTrans = this._viewport._viewStateManager.getRestTransformationUsingJoint(node);
					var restQuaternion = new THREE.Quaternion(restTrans.quaternion[0], restTrans.quaternion[1], restTrans.quaternion[2], restTrans.quaternion[3]);

					if (this._playback) {
						var sequenceOffset = this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(node,
							AnimationTrackType.Rotate,
							this._playback);
						if (sequenceOffset) {
							var sequenceOffsetQ = new THREE.Quaternion(sequenceOffset[0], sequenceOffset[1], sequenceOffset[2], sequenceOffset[3]);
							offsetQ.multiply(sequenceOffsetQ);
						}
					}

					var parent = this._getEffectiveParent(node);
					if (parent !== node.parent) {
						this._viewport._viewStateManager._setJointNodeOffsets(node, AnimationTrackType.Rotate);
						node.userData.offsetQuaternion = [offsetQ.x, offsetQ.y, offsetQ.z, offsetQ.w];
						node.userData.skipUpdateJointNode = false;
						this._viewport._viewStateManager._setJointNodeMatrix();
						node.userData.skipUpdateJointNode = true;
					} else {
						node.quaternion.copy(offsetQ.multiply(restQuaternion));
					}

					node.updateMatrix();

					userData.euler.x = userData.eulerInParentCoors.x - userData.startEulerInParentCoors.x + userData.startEuler.x;
					userData.euler.y = userData.eulerInParentCoors.y - userData.startEulerInParentCoors.y + userData.startEuler.y;
					userData.euler.z = userData.eulerInParentCoors.z - userData.startEulerInParentCoors.z + userData.startEuler.z;
				}
			}
		}

		this.endGesture();
	};

	RotateToolGizmo.prototype.rotateRestPosition = function(x, y, z) {

		this.beginGesture();
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (!node.userData) {
				node.userData = {};
			}
			node.userData.skipUpdateJointNode = true;
		});

		x = THREE.MathUtils.degToRad(x);
		y = THREE.MathUtils.degToRad(y);
		z = THREE.MathUtils.degToRad(z);

		for (var ni = 0, nc = this._nodes.length; ni < nc; ni++) {
			var nodeInfo = this._nodes[ni];
			if (!nodeInfo.ignore) {

				var node = nodeInfo.node;
				var userData;
				if (this._nodeUserDataMap) {
					userData = this._nodeUserDataMap.get(node);
				}
				if (userData && userData.euler && userData.eulerInParentCoors) {

					this._rotationDelta.set(THREE.MathUtils.radToDeg(x - userData.euler.x), THREE.MathUtils.radToDeg(y - userData.euler.y), THREE.MathUtils.radToDeg(z - userData.euler.z));

					userData.euler.x = x;
					userData.euler.y = y;
					userData.euler.z = z;

					var offsetEuler = new THREE.Euler(userData.euler.x, userData.euler.y, userData.euler.z);
					var offsetQ = new THREE.Quaternion().setFromEuler(offsetEuler);

					var currentMat = new THREE.Matrix4();
					var currentMatInv = new THREE.Matrix4();

					if (this._coordinateSystem === CoordinateSystem.Local) {
						currentMat = node.parent.matrixWorld.clone().multiply(userData.matRest);
						currentMatInv = userData.matRestInv.clone().multiply(nodeInfo.matParentInv);
					} else if (this._gizmo && this._coordinateSystem !== CoordinateSystem.Parent) {
						currentMat = this._gizmo.matrixWorld.clone();
						currentMatInv = currentMatInv.copy(currentMat).invert();
					}

					var offsetMat = new THREE.Matrix4().makeRotationFromQuaternion(offsetQ);
					var offsetRotationMatInParent = offsetMat;
					if (this._coordinateSystem !== CoordinateSystem.Parent) {
						offsetRotationMatInParent = nodeInfo.matParentInv.clone().multiply(currentMat).multiply(offsetMat).multiply(currentMatInv).multiply(node.parent.matrixWorld);
					}
					var offsetMInParent = new THREE.Matrix4().makeRotationFromQuaternion(userData.quatInitialDiff).multiply(offsetRotationMatInParent);

					var currentE = new THREE.Euler().setFromRotationMatrix(offsetMInParent);
					if (Math.abs(currentE.x) < 0.000001) {
						currentE.x = 0;
					}
					if (Math.abs(currentE.y) < 0.000001) {
						currentE.y = 0;
					}
					if (Math.abs(currentE.z) < 0.000001) {
						currentE.z = 0;
					}
					userData.eulerInParentCoors.x = getNearestRotation(userData.eulerInParentCoors.x, currentE.x);
					userData.eulerInParentCoors.y = getNearestRotation(userData.eulerInParentCoors.y, currentE.y);
					userData.eulerInParentCoors.z = getNearestRotation(userData.eulerInParentCoors.z, currentE.z);

					node.matrix = userData.matInitialDiff.clone().multiply(offsetRotationMatInParent.multiply(userData.matRest));
					node.matrix.decompose(node.position, node.quaternion, node.scale);

					node.updateMatrix();
				}
			}
		}
		this.endGesture();
	};

	RotateToolGizmo.prototype._updateEulerForCreatingAnimationKey = function(euler) {

		for (var ni = 0, nc = this._nodes.length; ni < nc; ni++) {
			var nodeInfo = this._nodes[ni];
			if (!nodeInfo.ignore) {

				var node = nodeInfo.node;

				var userData;
				if (this._nodeUserDataMap) {
					userData = this._nodeUserDataMap.get(node);
				}

				if (userData && userData.euler) {

					userData.euler.x = userData.startEuler.x + euler[0];
					userData.euler.y = userData.startEuler.y + euler[1];
					userData.euler.z = userData.startEuler.z + euler[2];

					var aboutSingleAxis = false;
					// rotation around single axis
					if ((Math.abs(userData.euler.x) < 0.000001 && (Math.abs(userData.euler.y) < 0.000001 || Math.abs(userData.euler.z) < 0.000001)) ||
						(Math.abs(userData.euler.y) < 0.000001 && Math.abs(userData.euler.z) < 0.000001)) {
						aboutSingleAxis = true;
					}

					if (aboutSingleAxis && this._coordinateSystem === CoordinateSystem.Parent) {
						userData.eulerInParentCoors.x = userData.startEulerInParentCoors.x + euler[0];
						userData.eulerInParentCoors.y = userData.startEulerInParentCoors.y + euler[1];
						userData.eulerInParentCoors.z = userData.startEulerInParentCoors.z + euler[2];
						continue;
					}

					// calculate euler components in Parent coordinate systems
					var rTrans = this._viewport._viewStateManager.getRelativeTransformation(node);
					var offsetQ;
					var parent = this._getEffectiveParent(node);
					if (parent !== node.parent && this._coordinateSystem !== CoordinateSystem.Custom) { // joint node
						this._viewport._viewStateManager._setJointNodeOffsets(node, AnimationTrackType.Rotate);
						offsetQ = new THREE.Quaternion(node.userData.offsetQuaternion[0],
							node.userData.offsetQuaternion[1],
							node.userData.offsetQuaternion[2],
							node.userData.offsetQuaternion[3]);
						node.userData.skipUpdateJointNode = false;
						this._viewport._viewStateManager._setJointNodeMatrix();
						node.userData.skipUpdateJointNode = true;
					} else {
						offsetQ = new THREE.Quaternion(rTrans.quaternion[0], rTrans.quaternion[1], rTrans.quaternion[2], rTrans.quaternion[3]);
					}

					var em = new THREE.Matrix4().makeRotationFromQuaternion(offsetQ);
					if (this._playback) {
						var sequenceOffset = this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(node,
							AnimationTrackType.Rotate,
							this._playback);
						if (sequenceOffset) {
							var sequenceOffsetQ = new THREE.Quaternion(sequenceOffset[0], sequenceOffset[1], sequenceOffset[2],
								sequenceOffset[3]);
							var sm = new THREE.Matrix4().makeRotationFromQuaternion(sequenceOffsetQ);
							em.multiply(new THREE.Matrix4().copy(sm).invert());
						}
					}

					var currentE = new THREE.Euler().setFromRotationMatrix(em);
					if (Math.abs(currentE.x) < 0.00001) {
						currentE.x = 0;
					}
					if (Math.abs(currentE.y) < 0.00001) {
						currentE.y = 0;
					}
					if (Math.abs(currentE.z) < 0.00001) {
						currentE.z = 0;
					}
					userData.eulerInParentCoors.x = getNearestRotation(userData.eulerInParentCoors.x, currentE.x);
					userData.eulerInParentCoors.y = getNearestRotation(userData.eulerInParentCoors.y, currentE.y);
					userData.eulerInParentCoors.z = getNearestRotation(userData.eulerInParentCoors.z, currentE.z);

					if (aboutSingleAxis) {
						continue;
					}

					// calculate euler components under current coordinate systems

					var currentMat = new THREE.Matrix4();
					var currentMatInv = new THREE.Matrix4();
					if (this._coordinateSystem === CoordinateSystem.Local) {
						currentMat = node.parent.matrixWorld.clone().multiply(userData.matRest);
						currentMatInv = userData.matRestInv.clone().multiply(nodeInfo.matParentInv);
					} else if (this._gizmo && this._coordinateSystem !== CoordinateSystem.Parent) {
						currentMat = this._gizmo.matrixWorld.clone();
						currentMatInv = currentMatInv.copy(currentMat).invert();
					}

					var offsetQInParent = new THREE.Quaternion(rTrans.quaternion[0], rTrans.quaternion[1], rTrans.quaternion[2], rTrans.quaternion[3]);
					offsetQInParent.multiply(userData.quatInitialDiffInv);
					var offsetMatInParent = new THREE.Matrix4().makeRotationFromQuaternion(offsetQInParent);
					var offsetRotationMat = offsetMatInParent;
					if (this._coordinateSystem !== CoordinateSystem.Parent) {
						offsetRotationMat = currentMatInv.clone().multiply(node.parent.matrixWorld).multiply(offsetMatInParent).multiply(nodeInfo.matParentInv).multiply(currentMat);
					}

					currentE = new THREE.Euler().setFromRotationMatrix(offsetRotationMat);
					if (Math.abs(currentE.x) < 0.000001) {
						currentE.x = 0;
					}
					if (Math.abs(currentE.y) < 0.000001) {
						currentE.y = 0;
					}
					if (Math.abs(currentE.z) < 0.000001) {
						currentE.z = 0;
					}
					userData.euler.x = getNearestRotation(userData.euler.x, currentE.x);
					userData.euler.y = getNearestRotation(userData.euler.y, currentE.y);
					userData.euler.z = getNearestRotation(userData.euler.z, currentE.z);
				}
			}
		}
	};

	RotateToolGizmo.prototype._rotate = function(euler) {
		this._rotationDelta.set(THREE.MathUtils.radToDeg(euler.x), THREE.MathUtils.radToDeg(euler.y), THREE.MathUtils.radToDeg(euler.z));
		this._value.addVectors(this._beginValue, this._rotationDelta);

		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (!node.userData) {
				node.userData = {};
			}
			node.userData.skipUpdateJointNode = true;
		});

		var quat = new THREE.Quaternion();
		if (this._coordinateSystem === CoordinateSystem.Local) {
			quat.setFromEuler(euler);
			this._nodes.forEach(function(nodeInfo) {
				var node = nodeInfo.node;
				node.quaternion.copy(nodeInfo.quaternion).multiply(quat);
				node.updateMatrix();
			});
			euler = euler.toArray();
			this._updateEulerForCreatingAnimationKey(euler);
		} else {
			euler = euler.toArray();
			for (var i = 0; i < 3; i++) {
				var angle = euler[i];
				if (angle) {
					var axisIndex = euler[3].charCodeAt(i) - 88; // 88 = char code of 'X'
					if (axisIndex >= 0 && axisIndex < 3) {
						var axis = new THREE.Vector3().setFromMatrixColumn(this._matOrigin, axisIndex).normalize();
						var matRotate = new THREE.Matrix4().makeRotationAxis(axis, angle);
						var pos = new THREE.Vector3().setFromMatrixPosition(this._matOrigin);
						matRotate.setPosition(pos.sub(pos.clone().applyMatrix4(matRotate)));

						for (var ni = 0, nc = this._nodes.length; ni < nc; ni++) {
							var nodeInfo = this._nodes[ni];
							if (!nodeInfo.ignore) {
								var node = nodeInfo.node;
								if (this._coordinateSystem !== CoordinateSystem.Parent) {
									node.position.setFromMatrixPosition(nodeInfo.matOrigin).applyMatrix4(matRotate).applyMatrix4(nodeInfo.matParentInv);
								}

								var scale = new THREE.Vector3().setFromMatrixScale(nodeInfo.matOrigin);
								var localAxis = axis.clone().transformDirection(new THREE.Matrix4().copy(nodeInfo.matOrigin).invert()).multiply(scale).normalize();
								quat.setFromAxisAngle(localAxis, angle);
								node.quaternion.copy(nodeInfo.quaternion).multiply(quat);
								node.updateMatrix();
							}
						}
					}
				}
			}
			this._updateEulerForCreatingAnimationKey(euler);
		}
		this._viewport.setShouldRenderFrame();
	};

	RotateToolGizmo.prototype._setRotationAxisAngle = function(axisIndex, angle1, angle2) {
		var deltaAngle = (angle2 - angle1) % (Math.PI * 2);

		var euler = new THREE.Euler();
		euler[["x", "y", "z"][axisIndex]] = deltaAngle;
		var nodesProperties = this._getNodesProperties();
		if (this._tool.fireEvent("rotating", { x: THREE.MathUtils.radToDeg(euler.x), y: THREE.MathUtils.radToDeg(euler.y), z: THREE.MathUtils.radToDeg(euler.z), nodesProperties: nodesProperties }, true)) {
			this._printEventInfo("Event 'rotating'", THREE.MathUtils.radToDeg(euler.x), THREE.MathUtils.radToDeg(euler.y), THREE.MathUtils.radToDeg(euler.z), nodesProperties);
			this._rotate(euler);

			// update arc mesh
			var vertices = [0, 0, 0];
			var dir = new THREE.Vector3();
			var i1 = (axisIndex + 1) % 3,
				i2 = (axisIndex + 2) % 3;
			var i, n = Math.max(Math.ceil(Math.abs(deltaAngle) * 64 / Math.PI), 1);

			deltaAngle *= this._coordinateSystem === CoordinateSystem.Local ? -1 : 1;

			for (i = 0; i <= n; i++) {
				var a = angle1 + deltaAngle * (i / n);
				dir.set(0, 0, 0).setComponent(i1, Math.cos(a)).setComponent(i2, Math.sin(a));
				vertices.push(dir.x, dir.y, dir.z);
			}

			var indices = [];
			for (i = 0; i < n; i++) {
				indices.push(0, i + 1, i + 2);
			}

			var geom = this._arcMesh.geometry;
			geom.setIndex(indices);
			geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
			this._arcMesh.visible = true;
		}
	};

	RotateToolGizmo.prototype.rotate = function(x, y, z) {
		this.beginGesture();
		this._rotate(new THREE.Euler(THREE.MathUtils.degToRad(x || 0), THREE.MathUtils.degToRad(y || 0), THREE.MathUtils.degToRad(z || 0)));
	};

	RotateToolGizmo.prototype._getValueLocaleOptions = function() {
		return { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 2 };
	};

	RotateToolGizmo.prototype.getValue = function() {
		return (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) ? this._value.getComponent(this._handleIndex) : 0;
	};

	RotateToolGizmo.prototype.setValue = function(value) {
		if (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) {
			var euler = new THREE.Euler();
			euler[["x", "y", "z"][this._handleIndex]] = THREE.MathUtils.degToRad(value - this._value.getComponent(this._handleIndex));
			this.beginGesture();
			this._rotate(euler);
			this.endGesture();
		}
	};

	RotateToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			this._expandBoundingBox(boundingBox, this._viewport.getCamera().getCameraRef(), true);
		}
	};

	RotateToolGizmo.prototype._updateSelection = function(viewStateManager) {
		Gizmo.prototype._updateSelection.call(this, viewStateManager);

		if (this._tool.getEnableSnapping()) {
			this._tool.getDetector().setSource(viewStateManager);
		}
	};

	RotateToolGizmo.prototype.handleSelectionChanged = function(event) {
		if (this._viewport) {
			this._updateSelection(this._viewport._viewStateManager);
			var nodesProperties = this._getNodesProperties();
			this._tool.fireEvent("rotating", { x: 0, y: 0, z: 0, nodesProperties: nodesProperties }, true);
			this._gizmoIndex = this._handleIndex = -1;
		}
	};

	RotateToolGizmo.prototype._getLevelingQuaternion = function(quat, objectIndex) {
		quat.set(0, 0, 0, 1);
		switch (this._coordinateSystem) {
			case CoordinateSystem.Local:
				quat.setFromRotationMatrix(this._nodes[objectIndex].node.parent.matrixWorld);
				break;

			case CoordinateSystem.Screen:
				quat.copy(this._viewport.getCamera().getCameraRef().quaternion);
				break;

			case CoordinateSystem.Custom:
				var anchorPoint = this._getAnchorPoint();
				if (anchorPoint) {
					quat.copy(anchorPoint.quaternion);
				}
				break;

			default: break;
		}
	};

	RotateToolGizmo.prototype._getObjectSize = function(objectIndex) {
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

	RotateToolGizmo.prototype._updateGizmoTransformation = function(i, camera) {
		var scale = this._updateGizmoObjectTransformation(this._gizmo, i);
		this._updateAxisTitles(this._axisTitles, this._gizmo, camera, this._gizmoSize - 12, scale);
	};

	RotateToolGizmo.prototype._getEditingFormPosition = function() {
		var scale = this._updateGizmoObjectTransformation(this._gizmo, this._gizmoIndex);
		var direction = new THREE.Vector3().setFromMatrixColumn(this._gizmo.matrixWorld, this._handleIndex).normalize();
		return direction.clone().multiplyScalar((this._gizmoSize - 12) * scale).add(this._gizmo.position).applyMatrix4(this._matViewProj);
	};

	RotateToolGizmo.prototype.render = function() {
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

	return RotateToolGizmo;

});
