/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AxisAngleRotationToolGizmo
sap.ui.define([
	"sap/base/Log",
	"../thirdparty/three",
	"./Gizmo",
	"./AxisAngleRotationToolGizmoRenderer",
	"./AxisColours",
	"../AnimationTrackType",
	"sap/base/assert"
], function(
	Log,
	THREE,
	Gizmo,
	AxisAngleRotationToolGizmoRenderer,
	AxisColours,
	AnimationTrackType,
	assert
) {
	"use strict";

	/**
	 * Constructor for a new AxisAngleRotationToolGizmo.
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
	 * @alias sap.ui.vk.tools.AxisAngleRotationToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AxisAngleRotationToolGizmo = Gizmo.extend("sap.ui.vk.tools.AxisAngleRotationToolGizmo", /** @lends sap.ui.vk.tools.AxisAngleRotationToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var axisColors = [0xFF0080, AxisColours.y, AxisColours.z];
	var math2PI = Math.PI * 2,
		mathHalfPI = Math.PI / 2,
		fontSize = 13;
	var degToRad = THREE.MathUtils.degToRad,
		radToDeg = THREE.MathUtils.radToDeg;

	AxisAngleRotationToolGizmo.prototype.init = function() {
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
		var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		light.position.set(1, 3, 2);
		this._sceneGizmo.add(light);
		this._sceneGizmo.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
		this._gizmo = new THREE.Group();
		this._sceneGizmo.add(this._gizmo);
		this._touchAreas = new THREE.Group();
		// this._sceneGizmo.add(this._touchAreas);
		this._nodes = [];
		this._matViewProj = new THREE.Matrix4();
		this._gizmoSize = 96;

		function createTouchCircle(axis, radius, segments) {
			var geometry = new THREE.TorusGeometry(radius, 16 / 96, 4, segments, axis === 2 ? Math.PI : math2PI);
			if (axis === 0) {
				geometry.rotateY(mathHalfPI);
			} else if (axis === 1) {
				geometry.rotateX(mathHalfPI);
			} else {
				geometry.rotateZ(-mathHalfPI);
			}
			return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ opacity: 0.2, transparent: true }));
		}

		var i;

		for (i = 0; i < 3; i++) {
			this._touchAreas.add(createTouchCircle(i, 1, 24));
		}

		for (i = 0; i < 3; i++) {// add axis title touch area
			var sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), new THREE.MeshBasicMaterial({ opacity: 0.2, transparent: true }));
			sphere.position.setComponent(i, 1.6);
			this._touchAreas.add(sphere);
		}
	};

	AxisAngleRotationToolGizmo.prototype._createGizmoObject = function() {
		var gizmo = new THREE.Group();
		var userData = gizmo.userData;

		function createGizmoCircle(axis, color, radius, segments) {
			var geometry = new THREE.TorusGeometry(radius, 1 / 96, 4, segments, axis === 2 ? Math.PI : math2PI);
			if (axis === 0) {
				geometry.rotateY(mathHalfPI);
			} else if (axis === 1) {
				geometry.rotateX(mathHalfPI);
			} else {
				geometry.rotateZ(-mathHalfPI);
			}
			var circle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: color, transparent: true }));
			circle.matrixAutoUpdate = false;
			circle.userData.color = color;

			return circle;
		}

		function createGizmoArrow(dir, color) {
			var arrowLength = 96 * 3,
				lineRadius = 2,
				coneHeight = 12 * 3,
				coneRadius = 2 * 3;
			dir.multiplyScalar(1 / arrowLength);
			var material = new THREE.MeshLambertMaterial({ color: color });
			var lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, arrowLength - coneHeight, 4);
			var m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dir.y, dir.z, dir.x), dir, new THREE.Vector3(dir.z, dir.x, dir.y));
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

			return line;
		}

		var i;

		// create 3 circles
		for (i = 0; i < 3; i++) {
			gizmo.add(createGizmoCircle(i, axisColors[i], 1, 128));
		}

		userData.axisArrow = createGizmoArrow(new THREE.Vector3(3, 0, 0), axisColors[0]);
		gizmo.add(userData.axisArrow);

		var lineGeometry = new THREE.BufferGeometry();
		lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array([0, 0, 0, 3, 0, 0]), 3));
		userData.arrowProjection = new THREE.Line(lineGeometry, new THREE.LineDashedMaterial({
			color: axisColors[0],
			transparent: true,
			scale: 10,
			dashSize: 1,
			gapSize: 1
		}));
		userData.arrowProjection.computeLineDistances();
		gizmo.add(userData.arrowProjection);

		gizmo.add(new THREE.AxesHelper(1.5));

		// create 3 arcs
		userData.arcMeshes = [];
		for (i = 0; i < 3; i++) {
			var arcMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true, opacity: 0.5, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
			arcMesh.visible = false;
			userData.arcMeshes.push(arcMesh);
			gizmo.add(arcMesh);
		}

		// create value labels
		userData.valueLabels = [];
		for (i = 0; i < 3; i++) {
			var valueMesh = this._createTextMesh("", 64, 32, fontSize, 0xFFFFFF, false);
			valueMesh.renderOrder = 10;
			valueMesh.material.depthTest = false;
			valueMesh.visible = false;
			userData.valueLabels.push(valueMesh);
			gizmo.add(valueMesh);
		}

		var axisTitles = userData.axisTitles = this._createAxisTitles();
		axisTitles.scale.setScalar(1 / this._gizmoSize);
		var titleDistance = this._gizmoSize * 1.6;
		axisTitles.children[0].position.x = titleDistance;
		axisTitles.children[1].position.y = titleDistance;
		axisTitles.children[2].position.z = titleDistance;
		gizmo.add(axisTitles);

		return gizmo;
	};

	AxisAngleRotationToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	AxisAngleRotationToolGizmo.prototype.resetValues = function() {
		this._value.setScalar(0);
	};

	AxisAngleRotationToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		this.handleSelectionChanged();

		this._tool.fireEvent("rotating", { x: 0, y: 0, z: 0, nodesProperties: this._getNodesProperties() }, true);
	};

	AxisAngleRotationToolGizmo.prototype.hide = function() {
		this._cleanTempData();
		this._viewport = null;
		this._tool = null;
		this._gizmoIndex = this._handleIndex = -1;
		this._updateEditingForm(false);
	};

	AxisAngleRotationToolGizmo.prototype.getGizmoCount = function() {
		return this._nodes.length;
	};

	AxisAngleRotationToolGizmo.prototype.getTouchObject = function(i) {
		if (this._nodes.length === 0) {
			return null;
		}

		var gizmo = this._gizmo.children[i];
		copyObjectTransformation(this._touchAreas.children[2], gizmo.children[2]);
		copyObjectTransformation(this._touchAreas.children[0], gizmo.children[0]);
		this._updateGizmoObjectTransformation(this._touchAreas, i);

		return this._touchAreas;
	};

	AxisAngleRotationToolGizmo.prototype.highlightHandle = function(index, gizmoIndex, hoverMode) {
		for (var gi = 0, gc = this._gizmo.children.length; gi < gc; gi++) {
			var gizmo = this._gizmo.children[gi];
			var userData = gizmo.userData;
			for (var i = 0; i < 3; i++) {// circles
				var arrow = gizmo.children[i];
				var color = (i === index) && (gi === gizmoIndex) ? 0xFFFF00 : arrow.userData.color;
				arrow.material.color.setHex(color); // circle color
				// arrow.material.opacity = (i === index || hoverMode) ? 1 : 0.35;
				arrow.material.opacity = index === -1 || i === index ? 1 : 0.35;
				// arrow.material.transparent = !hoverMode;
				arrow.material.visible = hoverMode || i === index;

				var axisTitle = userData.axisTitles.children[i];
				axisTitle.material.color.setHex((gi === gizmoIndex) && (i === index - 3) ? 0xFFFF00 : arrow.userData.color);
				axisTitle.material.opacity = hoverMode ? 1 : 0.35;
				// axisTitle.material.visible = hoverMode || i === index;

				userData.arcMeshes[i].material.visible = hoverMode || i === index || (i === 2 && index === 1);
			}
		}
	};

	AxisAngleRotationToolGizmo.prototype._snapToAxis = function(index) {
		var dy = -this._value.y, dz = -this._value.z;
		switch (index) {
			case 0: dy += 90; break; // X
			case 1: dz += 90; break; // Y
			default: break;
		}

		this.beginGesture();
		this._rotate(new THREE.Euler(0, degToRad(dy), degToRad(dz)));
		this.endGesture();
	};

	AxisAngleRotationToolGizmo.prototype.selectHandle = function(index, gizmoIndex) {
		this._gizmoIndex = gizmoIndex;
		this._handleIndex = index;
		if (index >= 3 && index < 6) {
			this._snapToAxis(index - 3);
		}
		this._updateEditValue();
		this._viewport.setShouldRenderFrame();
	};

	function copyObjectTransformation(dest, src) {
		dest.quaternion.copy(src.quaternion);
		dest.position.copy(src.position);
		dest.updateMatrix();
		dest.updateMatrixWorld(true);
	}

	function axisToAzimuth(axis) {
		return radToDeg(Math.atan2(axis[0], axis[2]));
	}

	function axisToElevation(axis) {
		return radToDeg(Math.atan2(axis[1], Math.sqrt(axis[0] * axis[0] + axis[2] * axis[2])));
	}

	function azimuthElevationToAxis(azimuth, elevation) {
		azimuth = degToRad(azimuth);
		elevation = degToRad(elevation);
		var sa = Math.sin(azimuth), ca = Math.cos(azimuth);
		var se = Math.sin(elevation), ce = Math.cos(elevation);
		return [sa * ce, se, ca * ce];
	}

	function updateArcMesh(arcMesh, axisIndex, angle1, angle2) {
		if (arcMesh.userData.angle1 === angle1 && arcMesh.userData.angle2 === angle2) {
			return;
		}
		arcMesh.userData.angle1 = angle1;
		arcMesh.userData.angle2 = angle2;

		// update arc mesh
		var c = new THREE.Color().setHex(axisColors[axisIndex]);
		var vertices = [0, 0, 0];
		var colors = [c.r, c.g, c.b];
		// var colors = [ 1, 1, 1 ];
		var dir = new THREE.Vector3();
		var i1 = (axisIndex + 1) % 3,
			i2 = (axisIndex + 2) % 3;
		var deltaAngle = angle2 - angle1;
		var i, n = Math.min(Math.max(Math.ceil(Math.abs(deltaAngle) * 64 / Math.PI), 1), 10000);
		var mr = Math.min(math2PI / Math.abs(deltaAngle), 1);
		var lerp = THREE.MathUtils.lerp;

		for (i = 0; i <= n; i++) {
			var f = 1 - (i / n);
			var a = angle1 + deltaAngle * f;
			var r = lerp(mr, 1, f);
			dir.set(0, 0, 0).setComponent(i1, Math.cos(a) * r).setComponent(i2, Math.sin(a) * r);
			vertices.push(dir.x, dir.y, dir.z);
			var cf = lerp(1, 0.5, f);
			colors.push(c.r * cf, c.g * cf, c.b * cf);
		}

		var indices = [];
		for (i = 0; i < n; i++) {
			indices.push(0, i + 1, i + 2);
		}

		// arcMesh.material.opacity = opacity;// * (1 - opacity) / (1 - Math.pow(opacity, 1 / mr));
		var geom = arcMesh.geometry;
		geom.setIndex(indices);
		geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
		arcMesh.visible = deltaAngle !== 0;
	}

	AxisAngleRotationToolGizmo.prototype._updateGizmoObject = function(index, angle, azimuth, elevation) {
		var gizmo = this._gizmo.children[index];
		var euler = new THREE.Euler(0, degToRad(azimuth - 90), 0, "YZX");
		var circleZ = gizmo.children[2];
		circleZ.quaternion.setFromEuler(euler);
		circleZ.updateMatrix();

		euler.z = degToRad(elevation);
		var circleX = gizmo.children[0];
		circleX.quaternion.setFromEuler(euler);
		circleX.updateMatrix();
		circleX.position.setFromMatrixColumn(circleX.matrix, 0).multiplyScalar(2);
		circleX.updateMatrix();

		var userData = gizmo.userData;
		var axisArrow = userData.axisArrow;
		axisArrow.quaternion.copy(circleX.quaternion);
		axisArrow.updateMatrix();

		var arrowProjection = userData.arrowProjection;
		var projectionLength = Math.cos(euler.z);
		arrowProjection.quaternion.copy(circleZ.quaternion);
		arrowProjection.scale.setScalar(projectionLength);
		arrowProjection.updateMatrix();
		arrowProjection.material.scale = projectionLength * 10;

		var arcMeshes = userData.arcMeshes;
		updateArcMesh(arcMeshes[0], 0, 0, degToRad(angle));
		copyObjectTransformation(arcMeshes[0], gizmo.children[0]);
		updateArcMesh(arcMeshes[1], 1, 0, degToRad(azimuth));
		copyObjectTransformation(arcMeshes[1], gizmo.children[1]);
		updateArcMesh(arcMeshes[2], 2, 0, degToRad(elevation));
		copyObjectTransformation(arcMeshes[2], gizmo.children[2]);

		var valueLabels = userData.valueLabels;
		updateValueLabel(valueLabels[0], angle);
		updateValueLabel(valueLabels[1], azimuth);
		updateValueLabel(valueLabels[2], elevation);
	};

	AxisAngleRotationToolGizmo.prototype.beginGesture = function() {
		this._rotationDelta.setScalar(0);
		this._nodes.forEach(function(nodeInfo) {
			nodeInfo.beginAngle = nodeInfo.angle;
			nodeInfo.beginAzimuth = nodeInfo.azimuth;
			nodeInfo.beginElevation = nodeInfo.elevation;
		});
	};

	AxisAngleRotationToolGizmo.prototype._getNodesProperties = function() {
		return this.getValues();
	};

	AxisAngleRotationToolGizmo.prototype.endGesture = function() {
		this._nodes.forEach(function(nodeInfo) {
			delete nodeInfo.beginAngle;
			delete nodeInfo.beginAzimuth;
			delete nodeInfo.beginElevation;
		});

		var nodesProperties = this._getNodesProperties();
		this._tool.fireRotated({ x: this._rotationDelta.x, y: this._rotationDelta.y, z: this._rotationDelta.z, nodesProperties: nodesProperties });
	};

	function drawText(canvas, text) {
		var pixelRatio = window.devicePixelRatio;
		var w = canvas.width;
		var h = canvas.height;
		var hw = w * 0.5; // half width
		var hh = h * 0.5; // half height
		var r = Math.min(fontSize * 0.85 * pixelRatio, hw - 1);
		var ctx = canvas.getContext("2d");
		ctx.font = "Bold " + fontSize * pixelRatio + "px Arial";
		var textMetrics = ctx.measureText(text);
		var dx = Math.min(textMetrics.width * 0.5 - r * 0.5, hw - r - 1);

		ctx.clearRect(0, 0, w, h);
		// ctx.globalAlpha = 0.3;
		// ctx.fillStyle = "#0f0f";
		// ctx.fillRect(0, 0, w, h);

		ctx.beginPath();
		ctx.arc(hw - dx, hh, r, mathHalfPI, mathHalfPI * 3, false);
		ctx.lineTo(hw + dx, hh - r);
		ctx.arc(hw + dx, hh, r, -mathHalfPI, mathHalfPI, false);
		ctx.lineTo(hw - dx, hh + r);
		ctx.closePath();

		// draw background
		ctx.globalAlpha = 0.75;
		ctx.fillStyle = "#fff";
		ctx.fill();

		// draw border
		ctx.globalAlpha = 1;
		ctx.lineWidth = pixelRatio;
		ctx.strokeStyle = "#000";
		ctx.stroke();

		// draw text
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		if (sap.ui.Device.browser.chrome || sap.ui.Device.browser.firefox) {
			ctx.textBaseline = "top";
			ctx.fillText(text, hw, hh - textMetrics.actualBoundingBoxDescent * 0.5);
		} else {
			ctx.textBaseline = "middle";
			ctx.fillText(text, hw, hh);
		}
	}

	function updateValueLabel(valueMesh, value) {
		valueMesh.visible = value !== 0;
		if (valueMesh.visible && valueMesh.userData.value !== value) {
			valueMesh.userData.value = value;

			var text = value.toLocaleString("fullwide", { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "°";
			var texture = valueMesh.material.map;
			drawText(texture.image, text);
			texture.needsUpdate = true;
		}
	}

	AxisAngleRotationToolGizmo.prototype._updateEditValue = function() {
		var nodeInfo = this._nodes[this._gizmoIndex];
		if (nodeInfo) {
			this._value.set(nodeInfo.angle, nodeInfo.azimuth, nodeInfo.elevation);
		}
	};

	AxisAngleRotationToolGizmo.prototype._calculateRotationQuaternion = function(nodeInfo) {
		var axis = new THREE.Vector3().fromArray(azimuthElevationToAxis(nodeInfo.azimuth, nodeInfo.elevation)); // in effective parent local space
		var effectiveParent = this._getEffectiveParent(nodeInfo.node);
		if (effectiveParent !== nodeInfo.node.parent) {
			axis.transformDirection(effectiveParent.matrixWorld); // in world space
			axis.transformDirection(nodeInfo.node.parent.matrixWorld.clone().invert()); // in real parent local space
		}
		return new THREE.Quaternion().setFromAxisAngle(axis, degToRad(nodeInfo.angle));
	};

	AxisAngleRotationToolGizmo.prototype._updateNodeRotation = function(nodeInfo) {
		var quaternion = this._calculateRotationQuaternion(nodeInfo);
		nodeInfo.node.quaternion.multiplyQuaternions(quaternion, nodeInfo.quaternion);
		nodeInfo.node.updateMatrix();

		if (nodeInfo.node.userData) {
			delete nodeInfo.node.userData.skipUpdateJointNode;
		}
		this._viewport._viewStateManager._setJointNodeOffsets(nodeInfo.node, AnimationTrackType.Rotate);
	};

	AxisAngleRotationToolGizmo.prototype._rotate = function(euler) {
		this._rotationDelta.set(radToDeg(euler.x), radToDeg(euler.y), radToDeg(euler.z));

		this._nodes.forEach(function(nodeInfo) {
			nodeInfo.angle = nodeInfo.beginAngle + this._rotationDelta.x;
			nodeInfo.azimuth = (nodeInfo.beginAzimuth + this._rotationDelta.y) % 360;
			nodeInfo.elevation = THREE.MathUtils.clamp(nodeInfo.beginElevation + this._rotationDelta.z, -90, 90);
			if (nodeInfo.azimuth > 180) {
				nodeInfo.azimuth -= 360;
			} if (nodeInfo.azimuth < -180) {
				nodeInfo.azimuth += 360;
			}
			this._updateNodeRotation(nodeInfo);
		}, this);

		this._updateEditValue();

		this._viewport.setShouldRenderFrame();
	};

	AxisAngleRotationToolGizmo.prototype._setRotationAxisAngle = function(axisIndex, angle1, angle2) {
		var deltaAngle = angle2 - angle1;
		if (axisIndex !== 0) {
			deltaAngle %= math2PI;
		}

		var euler = new THREE.Euler();
		euler[["x", "y", "z"][axisIndex]] = deltaAngle;
		var nodesProperties = this._getNodesProperties();
		if (this._tool.fireEvent("rotating", { x: radToDeg(euler.x), y: radToDeg(euler.y), z: radToDeg(euler.z), nodesProperties: nodesProperties }, true)) {
			this._rotate(euler);
		}
	};

	AxisAngleRotationToolGizmo.prototype.rotate = function(x, y, z) {
		this.beginGesture();
		this._rotate(new THREE.Euler(degToRad(x || 0), degToRad(y || 0), degToRad(z || 0)));
	};

	AxisAngleRotationToolGizmo.prototype._getValueLocaleOptions = function() {
		return { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 2 };
	};

	AxisAngleRotationToolGizmo.prototype.getValue = function() {
		return (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) ? this._value.getComponent(this._handleIndex) : 0;
	};

	AxisAngleRotationToolGizmo.prototype.setValue = function(value) {
		if (this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3) {
			var euler = new THREE.Euler();
			euler[["x", "y", "z"][this._handleIndex]] = degToRad(value - this._value.getComponent(this._handleIndex));
			this.beginGesture();
			this._rotate(euler);
			this.endGesture();
		}
	};

	AxisAngleRotationToolGizmo.prototype.rotateBy = function(deltaAngle) {
		this.beginGesture();
		this._rotate(new THREE.Euler(degToRad(deltaAngle), 0, 0));
		this.endGesture();
	};

	AxisAngleRotationToolGizmo.prototype.setAxis = function(axis) {
		this.beginGesture();
		var azimuth = 0;
		var elevation = 0;
		if (Array.isArray(axis)) {
			azimuth = axisToAzimuth(axis);
			elevation = axisToElevation(axis);
		} else {
			if ("azimuth" in axis) {
				azimuth = axis.azimuth;
			}
			if ("elevation" in axis) {
				elevation = axis.elevation;
			}
		}
		this._nodes.forEach(function(nodeInfo) {
			nodeInfo.azimuth = azimuth;
			nodeInfo.elevation = elevation;
			this._updateNodeRotation(nodeInfo);
		}, this);
		this._updateEditValue();
		this._viewport.setShouldRenderFrame();
		this.endGesture();
	};

	AxisAngleRotationToolGizmo.prototype.getValues = function() {
		var values = [];
		this._nodes.forEach(function(nodeInfo) {
			values.push({
				node: nodeInfo.node,
				angle: nodeInfo.angle,
				azimuth: nodeInfo.azimuth,
				elevation: nodeInfo.elevation,
				axis: azimuthElevationToAxis(nodeInfo.azimuth, nodeInfo.elevation)
			});
		});
		return values;
	};

	AxisAngleRotationToolGizmo.prototype._getNodeInfoByNode = function(node) {
		var nodes = this._nodes;
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (nodes[i].node === node) {
				return nodes[i];
			}
		}
		return null;
	};

	AxisAngleRotationToolGizmo.prototype.setValues = function(values) {
		values.forEach(function(value) {
			var nodeInfo = this._getNodeInfoByNode(value.node);
			if (nodeInfo) {
				nodeInfo.angle = value.angle;
				if (value.axis) {
					nodeInfo.azimuth = axisToAzimuth(value.axis);
					nodeInfo.elevation = axisToElevation(value.axis);
				} else {
					nodeInfo.azimuth = value.azimuth;
					nodeInfo.elevation = value.elevation;
				}
				var quaternion = this._calculateRotationQuaternion(nodeInfo);
				nodeInfo.quaternion.multiplyQuaternions(quaternion.invert(), nodeInfo.node.quaternion);
				this._updateNodeRotation(nodeInfo);
			}
		}, this);
		this._updateEditValue();
		this._viewport.setShouldRenderFrame();
	};

	AxisAngleRotationToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			this._expandBoundingBox(boundingBox, this._viewport.getCamera().getCameraRef(), true);
		}
	};

	AxisAngleRotationToolGizmo.prototype._updateSelection = function(viewStateManager) {
		Gizmo.prototype._updateSelection.call(this, viewStateManager);

		if (this._tool.getEnableSnapping()) {
			this._tool.getDetector().setSource(viewStateManager);
		}
	};

	AxisAngleRotationToolGizmo.prototype.handleSelectionChanged = function(event) {
		this._nodes.length = 0;
		this._gizmoIndex = this._handleIndex = -1;
		if (this._viewport) {
			this._updateSelection(this._viewport._viewStateManager);
			this._tool.fireEvent("rotating", { x: 0, y: 0, z: 0, nodesProperties: this._getNodesProperties() }, true);

			this._nodes.forEach(function(nodeInfo) {
				nodeInfo.quaternion = nodeInfo.node.quaternion.clone();
				nodeInfo.angle = 0;
				nodeInfo.azimuth = 0;
				nodeInfo.elevation = 0;
			});

			var count = this._nodes.length;
			var gizmo = this._gizmo;
			while (gizmo.children.length > count) {
				gizmo.remove(gizmo.children[gizmo.children.length - 1]);
			}
			while (gizmo.children.length < count) {
				gizmo.add(this._createGizmoObject());
			}
		}
	};

	AxisAngleRotationToolGizmo.prototype._getObjectSize = function(objectIndex) {
		var boundingBox = new THREE.Box3();
		this._nodes[objectIndex].node._expandBoundingBox(boundingBox, true, false);
		if (boundingBox.isEmpty()) {
			return 0;
		}
		var size = new THREE.Vector3();
		boundingBox.getSize(size);
		return size.length();
	};

	AxisAngleRotationToolGizmo.prototype._updateGizmoObjectTransformation = function(obj, i) {
		var node = this._nodes[i].node;
		var parent = this._getEffectiveParent(node);

		obj.position.setFromMatrixPosition(node.matrixWorld);

		if (parent) {
			obj.quaternion.setFromRotationMatrix(parent.matrixWorld);
		} else {
			obj.quaternion.set(0, 0, 0, 1);
		}

		var scale = this._getGizmoScale(obj.position);
		obj.scale.setScalar(this._gizmoSize * scale);

		obj.updateMatrix();
		obj.updateMatrixWorld(true);

		return scale;
	};

	AxisAngleRotationToolGizmo.prototype._getValuePosition = function(out, vi, azimuth, elevation) {
		azimuth = degToRad(azimuth);
		elevation = degToRad(elevation);
		var euler = new THREE.Euler(0, 0, 0, "YZX");
		if (vi === 0) {
			euler.set(0, azimuth, elevation);
		} else if (vi === 1) {
			euler.set(0, azimuth * 0.5, 0);
		} else {
			euler.set(0, azimuth, elevation * 0.5);
		}
		euler.y -= mathHalfPI;
		out.set(vi === 0 ? 3.25 : 1.25, 0, 0).applyEuler(euler);
	};

	var _pos = new THREE.Vector3();
	AxisAngleRotationToolGizmo.prototype._updateGizmoTransformation = function(i, camera) {
		var gizmo = this._gizmo.children[i];
		var nodeInfo = this._nodes[i];
		var scale = this._updateGizmoObjectTransformation(gizmo, i);

		// update axis titles
		gizmo.userData.axisTitles.children.forEach(function(child) {
			child.quaternion.copy(gizmo.quaternion).invert().multiply(camera.quaternion);
		});

		// update value labels transformation
		for (var vi = 0; vi < 3; vi++) {
			var valueMesh = gizmo.userData.valueLabels[vi];
			this._getValuePosition(valueMesh.position, vi, nodeInfo.azimuth, nodeInfo.elevation);
			valueMesh.quaternion.copy(gizmo.quaternion).invert().multiply(camera.quaternion);
			_pos.copy(valueMesh.position).applyMatrix4(gizmo.matrixWorld);
			valueMesh.scale.setScalar(this._getGizmoScale(_pos) / (scale * this._gizmoSize));
		}
	};

	AxisAngleRotationToolGizmo.prototype._getEditingFormPosition = function() {
		var gizmo = this._gizmo.children[this._gizmoIndex];
		var nodeInfo = this._nodes[this._gizmoIndex];
		this._updateGizmoObjectTransformation(gizmo, this._gizmoIndex);
		this._getValuePosition(_pos, this._handleIndex, nodeInfo.azimuth, nodeInfo.elevation);
		return _pos.applyMatrix4(gizmo.matrixWorld).applyMatrix4(this._matViewProj);
	};

	AxisAngleRotationToolGizmo.prototype.render = function() {
		assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		if (this._nodes.length > 0) {
			var renderer = this._viewport.getRenderer(),
				camera = this._viewport.getCamera().getCameraRef();

			this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

			renderer.clearDepth();

			for (var i = 0, l = this.getGizmoCount(); i < l; i++) {
				var nodeInfo = this._nodes[i];
				this._updateGizmoObject(i, nodeInfo.angle, nodeInfo.azimuth, nodeInfo.elevation);
				this._updateGizmoTransformation(i, camera);
			}

			renderer.render(this._sceneGizmo, camera);

			this._updateEditValue();
		}

		this._updateEditingForm(this._nodes.length > 0 && this._gizmoIndex >= 0 && this._handleIndex >= 0 && this._handleIndex < 3, this._handleIndex, ["δ", "γ", "α"][this._handleIndex]);
	};

	// Override the base method to avoid unnecessary calculations.
	AxisAngleRotationToolGizmo.prototype._getOffsetForRestTransformation = function(node) {
		// Do nothing intentionally. The base functionality is not used in this tool.
	};

	return AxisAngleRotationToolGizmo;

});
