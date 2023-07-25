/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides base for all gizmo controls sap.ui.vk.tools namespace.
sap.ui.define([
	"../library",
	"sap/m/library",
	"sap/m/Input",
	"sap/m/Label",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"./CoordinateSystem",
	"./AxisColours",
	"./ToolNodeSet",
	"../thirdparty/three",
	"./GizmoPlacementMode",
	"../AnimationTrackType"
], function(
	vkLibrary,
	mLibrary,
	Input,
	Label,
	coreLibrary,
	Control,
	CoordinateSystem,
	AxisColours,
	ToolNodeSet,
	THREE,
	GizmoPlacementMode,
	AnimationTrackType
) {
	"use strict";

	// shortcut for sap.m.InputType
	var InputType = mLibrary.InputType;

	/**
	 * Constructor for base of all Gizmo Controls.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides buttons to hide or show certain sap.ui.vk controls.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.tools.Gizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Gizmo = Control.extend("sap.ui.vk.tools.Gizmo", /** @lends sap.ui.vk.tools.Gizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		},
		renderer: {
			render: function(rm, control) {
			}
		}
	});

	Gizmo.prototype.hasDomElement = function() {
		return true;
	};

	Gizmo.prototype._drawText = function(canvas, text, fontSize, drawBorder) {
		var pixelRatio = window.devicePixelRatio;
		var w = canvas.width;
		var h = canvas.height;
		var halfWidth = w * 0.5;
		var halfHeight = h * 0.5;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, w, h);
		ctx.font = "Bold " + fontSize * pixelRatio + "px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		// draw shadow
		ctx.fillStyle = "#000";
		ctx.globalAlpha = 0.5;
		ctx.filter = "blur(3px)";
		ctx.fillText(text, halfWidth + 1, halfHeight + 1);
		// draw text
		ctx.fillStyle = "#fff";
		ctx.globalAlpha = 1;
		ctx.filter = "blur(0px)";
		ctx.fillText(text, halfWidth, halfHeight);

		if (drawBorder) {// draw circle border
			ctx.beginPath();
			ctx.arc(halfWidth, halfHeight, halfWidth - pixelRatio, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.lineWidth = pixelRatio * 2;
			ctx.strokeStyle = "#fff";
			ctx.stroke();
		}
	};

	Gizmo.prototype._createTextMesh = function(text, width, height, fontSize, color, drawBorder) {
		var pixelRatio = window.devicePixelRatio;
		var canvas = document.createElement("canvas");
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;

		this._drawText(canvas, text, fontSize, drawBorder);

		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial({
			map: texture,
			color: color,
			transparent: true,
			alphaTest: 0.05,
			premultipliedAlpha: true,
			side: THREE.DoubleSide
		});

		var mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
		mesh.userData.color = color;
		return mesh;
	};

	Gizmo.prototype._createAxisTitles = function(size, fontSize, drawCircle, addNegativeAxes) {
		size = size || 32;
		fontSize = fontSize || 20;

		var group = new THREE.Group();
		group.add(this._createTextMesh("X", size, size, fontSize, AxisColours.x, drawCircle));
		group.add(this._createTextMesh("Y", size, size, fontSize, AxisColours.y, drawCircle));
		group.add(this._createTextMesh("Z", size, size, fontSize, AxisColours.z, drawCircle));
		if (addNegativeAxes) {
			group.add(this._createTextMesh("-X", size, size, fontSize, AxisColours.x, drawCircle));
			group.add(this._createTextMesh("-Y", size, size, fontSize, AxisColours.y, drawCircle));
			group.add(this._createTextMesh("-Z", size, size, fontSize, AxisColours.z, drawCircle));
		}
		return group;
	};

	Gizmo.prototype._extractBasis = function(matrix) {
		var basis = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
		matrix.extractBasis(basis[0], basis[1], basis[2]);
		basis[0].normalize(); basis[1].normalize(); basis[2].normalize();
		return basis;
	};

	Gizmo.prototype._updateAxisTitles = function(obj, gizmo, camera, distance, scale) {
		var basis = this._extractBasis(gizmo.matrixWorld);

		obj.children.forEach(function(child, i) {
			var offset = distance.constructor === THREE.Vector3 ? distance.getComponent(i % 3) : distance;
			child.position.copy(basis[i % 3]).multiplyScalar(offset * (i < 3 ? 1 : -1));
			child.quaternion.copy(camera.quaternion);
		});

		obj.position.copy(gizmo.position);
		obj.scale.setScalar(scale);
	};

	Gizmo.prototype._updateSelection = function(viewStateManager) {
		if (viewStateManager === null) {
			return false;
		}
		var nodes = [];
		if (this._tool) {
			if (this._tool.getNodeSet() === ToolNodeSet.Highlight) {
				viewStateManager.enumerateSelection(function(nodeRef) {
					nodes.push({ node: nodeRef });
				});
			} else {
				viewStateManager.enumerateOutlinedNodes(function(nodeRef) {
					nodes.push({ node: nodeRef });
				});
			}
		}
		if (this._nodes.length === nodes.length && this._nodes.every(function(v, i) { return nodes[i].node === v.node; })) {
			return false;
		}

		this._cleanTempData();
		this._nodes = nodes;

		nodes.forEach(function(nodeInfo) {
			nodeInfo.ignore = false; // multiple transformation fix (parent transformation + child transformation)
			var parent = nodeInfo.node.parent;
			while (parent && !nodeInfo.ignore) {
				for (var i = 0, l = nodes.length; i < l; i++) {
					if (nodes[i].node === parent) {
						nodeInfo.ignore = true;
						break;
					}
				}
				parent = parent.parent;
			}
			this._getOffsetForRestTransformation(nodeInfo.node);
		}.bind(this));

		return true;
	};

	Gizmo.prototype.setPlacementMode = function(placementMode) {
		this._placementMode = placementMode;
	};

	Gizmo.prototype._getAnchorPoint = function() {
		return this._viewport ? this._viewport._anchorPoint : null;
	};

	Gizmo.prototype._getSelectionCenter = function(target) {
		if (this._nodes.length === 1) {
			var node = this._nodes[0].node;
			target.setFromMatrixPosition(node.matrixWorld);

			var userData;
			if (this._nodeUserDataMap) {
				userData = this._nodeUserDataMap.get(node);
			}
			if (this._placementMode === GizmoPlacementMode.Rest && userData && userData.offsetWTranslation) {
				target.x += userData.offsetWTranslation[0];
				target.y += userData.offsetWTranslation[1];
				target.z += userData.offsetWTranslation[2];
			}
		} else {
			target.setScalar(0);
			if (this._nodes.length > 0) {
				var center = new THREE.Vector3();
				this._nodes.forEach(function(nodeInfo) {
					var node = nodeInfo.node;
					if (node.userData.boundingBox) {
						node.userData.boundingBox.getCenter(center);
						target.add(center.applyMatrix4(node.matrixWorld));
					} else {
						target.add(center.setFromMatrixPosition(node.matrixWorld));
					}
				});
				target.multiplyScalar(1 / this._nodes.length);
			}
		}
	};

	Gizmo.prototype._getGizmoScale = function(position) {
		var renderer = this._viewport.getRenderer();
		var camera = this._viewport.getCamera().getCameraRef();
		var pos4 = new THREE.Vector4();
		pos4.copy(position).applyMatrix4(this._matViewProj);
		return pos4.w * 2 / (renderer.getSize(new THREE.Vector2()).x * camera.projectionMatrix.elements[0]);
	};

	Gizmo.prototype._getEffectiveParent = function(node) {
		if (this._viewport._viewStateManager) {
			var joints = this._viewport._viewStateManager.getJoints();
			if (joints) {
				for (var n = 0; n < joints.length; n++) {
					var joint = joints[n];
					if (!joint.node || !joint.parent) {
						continue;
					}
					if (joint.node === node) {
						return joint.parent;
					}
				}
			}
		}
		return node.parent;
	};

	Gizmo.prototype._cleanTempData = function() {
		this._nodes.forEach(function(nodeInfo) {
			var node = nodeInfo.node;
			if (node.userData) {
				delete node.userData.skipUpdateJointNode;
			}
		});
		if (this._nodeUserDataMap) {
			this._nodeUserDataMap.clear();
		}
		this._sequence = null;
	};

	Gizmo.prototype._prepareForCreatingKey = function(playback) {
		this._playback = playback;
	};

	// when a node is moved/scaled/rotated, if the node initial position is in the middle of animation
	// we calculate new restTransformation based on current node transformation and animated transformation
	Gizmo.prototype._getOffsetForRestTransformation = function(node) {
		if (this._viewport._viewStateManager) {
			if (!this._nodeUserDataMap) {
				this._nodeUserDataMap = new Map();
			}
			var userData = this._nodeUserDataMap.get(node);
			if (!userData) {
				userData = {};
				this._nodeUserDataMap.set(node, userData);
			}
			var trans = this._viewport._viewStateManager.getTransformation(node);
			var restTrans = this._viewport._viewStateManager.getRestTransformation(node);
			var wrestTrans = this._viewport._viewStateManager.getRestTransformationWorld(node);
			var wtrans = this._viewport._viewStateManager.getTransformationWorld(node);
			if (!restTrans || !wrestTrans) {
				return;
			}

			var pos = new THREE.Vector3(restTrans.translation[0], restTrans.translation[1], restTrans.translation[2]);
			var sc = new THREE.Vector3(restTrans.scale[0], restTrans.scale[1], restTrans.scale[2]);
			userData.quatRest = new THREE.Quaternion(restTrans.quaternion[0], restTrans.quaternion[1], restTrans.quaternion[2], restTrans.quaternion[3]);
			userData.matRest = new THREE.Matrix4().compose(pos, userData.quatRest, sc);
			userData.matRestInv = new THREE.Matrix4().copy(userData.matRest).invert();


			userData.initialTranslation = trans.translation.slice();
			userData.initialScale = trans.scale.slice();
			userData.initialQuaternion = new THREE.Quaternion(trans.quaternion[0], trans.quaternion[1], trans.quaternion[2], trans.quaternion[3]);
			userData.matInitial = node.matrix.clone();
			userData.matInitialInv = new THREE.Matrix4().copy(node.matrix).invert();
			userData.quatInitialDiff = userData.initialQuaternion.clone().multiply(userData.quatRest.clone().invert());
			userData.quatInitialDiffInv = userData.quatInitialDiff.clone().invert();

			userData.matInitialDiff = node.matrix.clone().multiply(userData.matRestInv);
			userData.offsetWTranslation = [wrestTrans.translation[0] - wtrans.translation[0],
			wrestTrans.translation[1] - wtrans.translation[1],
			wrestTrans.translation[2] - wtrans.translation[2]];

			var center = new THREE.Vector3();
			var boundingBox = new THREE.Box3();
			boundingBox.expandByObject(node);
			boundingBox.getCenter(center);
			userData.offsetWTranslationCenter = [wrestTrans.translation[0] + center.x - 2 * wtrans.translation[0],
			wrestTrans.translation[1] + center.y - 2 * wtrans.translation[1],
			wrestTrans.translation[2] + center.z - 2 * wtrans.translation[2]];


			var euler = [0, 0, 0];
			var animationPlayer = this._viewport._viewStateManager.getAnimationPlayer();
			if (animationPlayer) {
				var data = animationPlayer.getAnimatedProperty(node, AnimationTrackType.Rotate);
				if (data.offsetToPrevious) {
					euler = data.offsetToPrevious;
				}
			}
			userData.euler = new THREE.Euler(0, 0, 0);
			userData.startEuler = new THREE.Euler(0, 0, 0);
			userData.eulerInParentCoors = new THREE.Euler(euler[0], euler[1], euler[2]);
			userData.startEulerInParentCoors = new THREE.Euler(euler[0], euler[1], euler[2]);
		}
	};

	Gizmo.prototype._updateGizmoObjectTransformation = function(obj, i, moveToCenter) {
		var camera = this._viewport.getCamera().getCameraRef();
		var anchorPoint = this._getAnchorPoint();
		var nodeWorldMatrix, parentWorldMatrix, node;
		if (anchorPoint && this._coordinateSystem === CoordinateSystem.Custom) {
			obj.position.copy(anchorPoint.position);
			obj.quaternion.copy(anchorPoint.quaternion);
		} else if (this._coordinateSystem === CoordinateSystem.Local || this._coordinateSystem === CoordinateSystem.Parent) {
			node = this._nodes[i].node;
			var effParent = this._getEffectiveParent(node);
			if (this._coordinateSystem === CoordinateSystem.Parent && effParent) {
				parentWorldMatrix = effParent.matrixWorld;
			}

			nodeWorldMatrix = node.matrixWorld.clone();

			if (parentWorldMatrix) {
				// Take position from the node but rotation and scale from node's parent as we are in parent coordinate system
				parentWorldMatrix.decompose(obj.position, obj.quaternion, obj.scale);
				obj.position.setFromMatrixPosition(nodeWorldMatrix);
			} else {
				nodeWorldMatrix.decompose(obj.position, obj.quaternion, obj.scale);
			}

			var userData;
			if (this._nodeUserDataMap) {
				userData = this._nodeUserDataMap.get(node);
			}

			if (this._placementMode === GizmoPlacementMode.Rest && userData && userData.offsetWTranslation) {
				if (moveToCenter) {
					obj.position.x += userData.offsetWTranslationCenter[0];
					obj.position.y += userData.offsetWTranslationCenter[1];
					obj.position.z += userData.offsetWTranslationCenter[2];
				} else {
					obj.position.x += userData.offsetWTranslation[0];
					obj.position.y += userData.offsetWTranslation[1];
					obj.position.z += userData.offsetWTranslation[2];
				}

				nodeWorldMatrix.setPosition(obj.position);
			}
		} else if (this._nodes.length > 0) {
			this._getSelectionCenter(obj.position);

			if (this._coordinateSystem === CoordinateSystem.Screen) {
				obj.quaternion.copy(camera.quaternion);
			} else {// CoordinateSystem.World
				obj.quaternion.set(0, 0, 0, 1);
			}
		}

		var scale = this._getGizmoScale(obj.position);
		obj.scale.setScalar(this._gizmoSize * scale);

		if (nodeWorldMatrix) {
			var basis = this._extractBasis(parentWorldMatrix ? parentWorldMatrix : nodeWorldMatrix);
			obj.matrix.makeBasis(basis[0], basis[1], basis[2]);
			obj.matrix.scale(obj.scale);
			obj.matrix.copyPosition(nodeWorldMatrix);

			/* if (parentWorldMatrix && node) {
				var rotation = new THREE.Matrix4().makeRotationFromQuaternion(node.quaternion);
				obj.matrix = obj.matrix.multiply(rotation);
			} */

			obj.matrixAutoUpdate = false;
		} else {
			obj.matrixAutoUpdate = true;
		}

		obj.updateMatrixWorld(true);
		return scale;
	};

	Gizmo.prototype._expandBoundingBox = function(boundingBox, camera, visibleOnly) {
		var gizmoCount = this.getGizmoCount();
		if (gizmoCount > 0) {
			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); // used in _updateGizmoTransformation()
			for (var i = 0; i < gizmoCount; i++) {
				this._updateGizmoTransformation(i, camera);
				this._sceneGizmo._expandBoundingBox(boundingBox, visibleOnly, false);
			}
		}
	};

	Gizmo.prototype._createEditingForm = function(units, width) {
		this._label = new sap.m.Label({}).addStyleClass("sapUiVkTransformationToolEditLabel");
		this._units = new sap.m.Label({ text: units }).addStyleClass("sapUiVkTransformationToolEditUnits");

		this._input = new Input({
			width: width + "px",
			type: InputType.Number,
			maxLength: 10,
			textAlign: coreLibrary.TextAlign.Right,
			change: function(event) {
				this.setValue(event.getParameter("value"));
			}.bind(this)
		});

		this._editingForm = new sap.m.HBox({
			items: [
				this._label,
				this._input,
				this._units
			]
		}).addStyleClass("sapUiSizeCompact");

		this._editingForm.onkeydown = this._editingForm.ontap = this._editingForm.ontouchstart = function(event) {
			event.setMarked(); // disable the viewport events under the editing form
		};
	};

	Gizmo.prototype._getValueLocaleOptions = function() {
		return { useGrouping: false };
	};

	Gizmo.prototype._updateEditingForm = function(active, axisIndex, label) {
		var domRef = this.getDomRef();
		if (domRef) {
			if (active && this._tool && this._tool.getShowEditingUI()) {
				this._label.setText(label || ["X", "Y", "Z"][axisIndex]);
				this._label.rerender();
				var labelDomRef = this._label.getDomRef();
				if (labelDomRef) {
					labelDomRef.style.color = new THREE.Color(AxisColours[["x", "y", "z"][axisIndex]]).getStyle();
				}

				this._input.setValue(this.getValue().toLocaleString("fullwide", this._getValueLocaleOptions()));

				var position = this._getEditingFormPosition();
				var gizmoPosition = this._gizmo.position.clone().applyMatrix4(this._matViewProj).sub(position);
				var viewportRect = this._viewport.getDomRef().getBoundingClientRect();
				var formRect = domRef.getBoundingClientRect();

				var alignRight = gizmoPosition.x > -0.0001;
				var dx = alignRight ? formRect.width : -formRect.width;
				var dy = formRect.height * 0.5;
				var x = THREE.MathUtils.clamp(viewportRect.width * (position.x * 0.5 + 0.5) + (alignRight ? -20 : 20), Math.max(dx, 0), viewportRect.width + Math.min(dx, 0));
				var y = THREE.MathUtils.clamp(viewportRect.height * (position.y * -0.5 + 0.5), dy, viewportRect.height - dy);

				domRef.style.left = Math.round(x) + "px";
				domRef.style.top = Math.round(y) + "px";
				domRef.style.transform = "translate(" + (alignRight ? "-100%" : "0%") + ", -50%)";

				domRef.style.display = "block";
			} else {
				domRef.style.display = "none";
			}
		}
	};

	return Gizmo;
});
