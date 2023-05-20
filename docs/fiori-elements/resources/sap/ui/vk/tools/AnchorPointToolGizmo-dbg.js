/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.AnchorPointToolGizmo
sap.ui.define([
	"../getResourceBundle",
	"../thirdparty/three",
	"../thirdparty/BufferGeometryUtils",
	"./Gizmo",
	"./AnchorPointToolGizmoRenderer",
	"./CoordinateSystem",
	"./AxisColours",
	"./AnchorPointToolOperation",
	"sap/base/assert"
], function(
	getResourceBundle,
	THREE,
	BufferGeometryUtils,
	Gizmo,
	AnchorPointToolGizmoRenderer,
	CoordinateSystem,
	AxisColours,
	AnchorPointToolOperation,
	assert
) {
	"use strict";

	/**
	 * Constructor for an AnchorPointToolGizmo.
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
	 * @alias sap.ui.vk.tools.AnchorPointToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var AnchorPointToolGizmo = Gizmo.extend("sap.ui.vk.tools.AnchorPointToolGizmo", /** @lends sap.ui.vk.tools.AnchorPointToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	AnchorPointToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._createEditingForm(null, 84);
		this._gizmoIndex = -1;
		this._handleIndex = -1;

		this._viewport = null;
		this._tool = null;
		this._sceneGizmo = new THREE.Scene();
		var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		light.position.set(1, 3, 2);
		this._sceneGizmo.add(light);
		this._sceneGizmo.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
		this._touchAreas = new THREE.Group();
		this._gizmo = new THREE.Group();
		this._sceneGizmo.add(this._gizmo);
		this._matViewProj = new THREE.Matrix4();
		this._gizmoSize = 96;
		this._moveDelta = new THREE.Vector3();
		this._rotationDelta = new THREE.Vector3();

		function createGizmoArrow(dir, color, touchAreas) {
			var arrowLength = 96,
				lineRadius = 1,
				coneHeight = 24,
				coneRadius = 4,
				touchRadius = 48;
			dir.multiplyScalar(1 / arrowLength);
			var lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, arrowLength - coneHeight, 4);
			var m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dir.y, dir.z, dir.x), dir, new THREE.Vector3(dir.z, dir.x, dir.y));
			m.setPosition(dir.clone().multiplyScalar((arrowLength - coneHeight) * 0.5));
			lineGeometry.applyMatrix4(m);
			var material = new THREE.MeshLambertMaterial({ color: color, transparent: true });
			var line = new THREE.Mesh(lineGeometry, material);
			line.matrixAutoUpdate = false;
			line.userData.color = color;

			var coneGeometry = new THREE.CylinderGeometry(0, coneRadius, coneHeight, 12, 1);
			m.setPosition(dir.clone().multiplyScalar(arrowLength - coneHeight * 0.5));
			coneGeometry.applyMatrix4(m);
			var cone = new THREE.Mesh(coneGeometry, material);
			cone.matrixAutoUpdate = false;
			line.add(cone);

			var touchGeometry = new THREE.CylinderGeometry(touchRadius * 0.5, touchRadius * 0.5, touchRadius, 12, 1);
			touchGeometry.applyMatrix4(m);
			var touchGeometry2 = new THREE.CylinderGeometry(touchRadius * 0.5, touchRadius * 0.2, touchRadius, 12, 1);
			m.setPosition(dir.clone().multiplyScalar(arrowLength * 0.5));
			touchGeometry2.applyMatrix4(m);
			var mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([touchGeometry, touchGeometry2]);
			touchAreas.add(new THREE.Mesh(mergedGeometry, material));

			return line;
		}

		function createGizmoPlane(a, b, touchAreas) {
			var colors = new Float32Array(9);
			colors[a] = colors[b + 6] = 1;
			colors[a + 3] = colors[b + 3] = 0.5;
			var geometry = new THREE.BufferGeometry();
			var vertices = new Float32Array(12);
			vertices[3 + a] = vertices[6 + b] = vertices[9 + a] = vertices[9 + b] = 0.333;
			geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
			geometry.setIndex([0, 2, 1, 1, 2, 3]);
			var material = new THREE.MeshBasicMaterial({ color: 0xFFFF00, opacity: 0.5, transparent: true, visible: false, side: THREE.DoubleSide });
			var plane = new THREE.Mesh(geometry, material);
			plane.matrixAutoUpdate = false;
			plane.userData.colors = colors;

			var lineGeometry = new THREE.BufferGeometry();
			var lineVertices = new Float32Array(9);
			lineVertices[a] = lineVertices[a + 3] = lineVertices[b + 3] = lineVertices[b + 6] = 0.333;
			lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lineVertices, 3));
			lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
			var line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, linewidth: window.devicePixelRatio }));
			line.matrixAutoUpdate = false;
			plane.add(line);

			touchAreas.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })));

			return plane;
		}

		function createGizmoArc(axis, color, radius, segments) {
			var geometry = new THREE.TorusGeometry(radius, 1 / 96, 4, segments, Math.PI / 2);
			if (axis === 0) {
				geometry.rotateY(Math.PI / -2);
			} else if (axis === 1) {
				geometry.rotateX(Math.PI / 2);
			}
			var arc = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: color, transparent: true }));
			arc.matrixAutoUpdate = false;
			arc.userData.color = color;

			return arc;
		}

		function createTouchArc(axis, radius, segments) {
			var geometry = new THREE.TorusGeometry(radius, 16 / 96, 4, segments, Math.PI / 2);
			if (axis === 0) {
				geometry.rotateY(Math.PI / -2);
			} else if (axis === 1) {
				geometry.rotateX(Math.PI / 2);
			}
			return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ opacity: 0.2, transparent: true }));
		}

		// create 3 arrows
		this._gizmo.add(createGizmoArrow(new THREE.Vector3(1, 0, 0), AxisColours.x, this._touchAreas));
		this._gizmo.add(createGizmoArrow(new THREE.Vector3(0, 1, 0), AxisColours.y, this._touchAreas));
		this._gizmo.add(createGizmoArrow(new THREE.Vector3(0, 0, 1), AxisColours.z, this._touchAreas));

		// create 3 planes
		this._gizmo.add(createGizmoPlane(1, 2, this._touchAreas));
		this._gizmo.add(createGizmoPlane(2, 0, this._touchAreas));
		this._gizmo.add(createGizmoPlane(0, 1, this._touchAreas));

		// create 3 arcs
		for (var i = 0; i < 3; i++) {
			this._gizmo.add(createGizmoArc(i, AxisColours[["x", "y", "z"][i]], 1, 32));
			this._touchAreas.add(createTouchArc(i, 1, 24));
		}

		var arcMaterial = new THREE.MeshBasicMaterial({ color: 0x0080FF, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
		this._arcMesh = new THREE.Mesh(new THREE.BufferGeometry(), arcMaterial);
		this._arcMesh.visible = false;
		this._gizmo.add(this._arcMesh);

		this._axisTitles = this._createAxisTitles();
		this._sceneGizmo.add(this._axisTitles);

		var geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
		this._line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial());
		this._line.frustumCulled = false;
		this._line.visible = false;
		this._gizmo.add(this._line);
	};

	AnchorPointToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	AnchorPointToolGizmo.prototype._updateHandlesVisibility = function() {
		var allowOperation = this._tool.getAllowOperation();
		var enableMovement = allowOperation !== AnchorPointToolOperation.Rotate;
		var enableRotation = allowOperation !== AnchorPointToolOperation.Move;
		var i;
		for (i = 0; i < 3; i++) {// arrows
			this._touchAreas.children[i].visible = enableMovement;
		}
		for (i = 3; i < 6; i++) {// planes
			this._gizmo.children[i].visible = this._touchAreas.children[i].visible = enableMovement;
		}
		for (i = 6; i < 9; i++) {// arcs
			this._gizmo.children[i].visible = this._touchAreas.children[i].visible = enableRotation;
		}
	};

	AnchorPointToolGizmo.prototype._initAnchorPoint = function(viewport) {
		viewport._anchorPoint = this._gizmo;
	};

	AnchorPointToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;

		this._updateHandlesVisibility();

		this._initAnchorPoint(viewport);
	};

	AnchorPointToolGizmo.prototype.hide = function() {
		this._viewport = null;
		this._tool = null;
	};

	AnchorPointToolGizmo.prototype.setPosition = function(pos) {
		this._gizmo.position.copy(pos);
		this._gizmo.updateMatrixWorld();
	};

	AnchorPointToolGizmo.prototype.setQuaternion = function(quaternion) {
		this._gizmo.quaternion.copy(quaternion);
		this._gizmo.updateMatrixWorld();
	};

	AnchorPointToolGizmo.prototype.getGizmoCount = function() {
		return 1;
	};

	AnchorPointToolGizmo.prototype.getTouchObject = function(i) {
		this._touchAreas.position.copy(this._gizmo.position);
		this._touchAreas.quaternion.copy(this._gizmo.quaternion);
		this._touchAreas.scale.copy(this._gizmo.scale);
		this._touchAreas.updateMatrixWorld(true);

		return this._touchAreas;
	};

	var arrowHighlighting = [1, 2, 4, 6, 5, 3, 1, 2, 4];

	AnchorPointToolGizmo.prototype.highlightHandle = function(index, hoverMode) {
		var i;
		for (i = 0; i < 3; i++) {// arrows
			var arrow = this._gizmo.children[i];
			var highlight = arrowHighlighting[index] & (1 << i);
			var color = highlight ? 0xFFFF00 : arrow.userData.color;
			arrow.material.color.setHex(color); // arrow line color
			arrow.children[0].material.color.setHex(color); // arrow cone color
			this._axisTitles.children[i].material.color.setHex(color);
		}

		for (i = 3; i < 6; i++) {// planes
			var plane = this._gizmo.children[i];
			plane.material.visible = i === index;

			var colorAttr = plane.children[0].geometry.attributes.color;
			colorAttr.copyArray(i === index ? [1, 1, 0, 1, 1, 0, 1, 1, 0] : plane.userData.colors);
			colorAttr.needsUpdate = true;
			plane.children[0].material.opacity = (i === index || (hoverMode && index === -1)) ? 1 : 0.35;
			plane.children[0].visible = (i === index || hoverMode);
		}

		for (i = 6; i < 9; i++) {// arcs
			var arc = this._gizmo.children[i];
			arc.visible = this._tool.getAllowOperation() !== AnchorPointToolOperation.Move && (i === index || hoverMode);
			arc.material.color.setHex(i === index ? 0xFFFF00 : arc.userData.color); // arc color
			arc.material.opacity = (i === index || (hoverMode && index === -1)) ? 1 : 0.35;
		}
	};

	AnchorPointToolGizmo.prototype.selectHandle = function(index) {
		this._handleIndex = index;
		if (index >= 0 && index < 3) {
			this._units.setText(getResourceBundle().getText("TOOL_UNITS_MM"));
		} else if (index >= 6 && index < 9) {
			this._units.setText(String.fromCharCode(176)); // degrees sign
		}
		this._editingForm.rerender();
		this._viewport.setShouldRenderFrame();
	};

	AnchorPointToolGizmo.prototype.beginGesture = function() {
		this._isMoved = false;
		this._isRotated = false;
		this._originPosition = new THREE.Vector3().setFromMatrixPosition(this._gizmo.matrixWorld);
		this._originQuaternion = this._gizmo.quaternion.clone();
	};

	AnchorPointToolGizmo.prototype.endGesture = function() {
		if (this._isMoved) {
			this._tool.fireMoved({ x: this._moveDelta.x, y: this._moveDelta.y, z: this._moveDelta.z });
		}
		if (this._isRotated) {
			this._tool.fireRotated({ x: this._rotationDelta.x, y: this._rotationDelta.y, z: this._rotationDelta.z });
		}
		this._line.visible = false;
		this._arcMesh.visible = false;
	};

	AnchorPointToolGizmo.prototype._setOffset = function(offset, gizmoIndex) {
		if (this._tool.fireEvent("moving", { x: offset.x, y: offset.y, z: offset.z }, true)) {
			this._move(offset);

			// calculate offset in local space
			var matInv = new THREE.Matrix4().copy(this._gizmo.matrixWorld).invert();
			var scale = new THREE.Vector3().setFromMatrixScale(this._gizmo.matrixWorld);
			var newPos = this._gizmo.position.clone().applyMatrix4(matInv);
			offset.copy(this._originPosition).applyMatrix4(matInv).sub(newPos).multiply(scale);

			// update line mesh
			var posAttribute = this._line.geometry.getAttribute("position");
			posAttribute.array.set(offset.toArray());
			posAttribute.needsUpdate = true;
			this._line.geometry.computeBoundingBox();
			offset.set(Math.abs(offset.x), Math.abs(offset.y), Math.abs(offset.z));
			offset.multiplyScalar(1 / Math.max(offset.x, offset.y, offset.z));
			this._line.material.color.setRGB(offset.x, offset.y, offset.z);
			this._line.visible = true;
		}
	};

	AnchorPointToolGizmo.prototype._move = function(offset) {
		if (this._tool.getAllowOperation() === AnchorPointToolOperation.Rotate) {
			// Move is not enabled
			return this;
		}
		this._isMoved = true;
		this._moveDelta.copy(offset);
		this._gizmo.position.copy(this._originPosition).add(offset);

		this._viewport.setShouldRenderFrame();
	};

	AnchorPointToolGizmo.prototype.move = function(x, y, z) {
		this.beginGesture();
		this._move(new THREE.Vector3(x, y, z || 0));
	};

	AnchorPointToolGizmo.prototype._setRotationAxisAngle = function(axisIndex, angle1, angle2) {
		var deltaAngle = (angle2 - angle1) % (Math.PI * 2);

		var euler = [0, 0, 0];
		euler[axisIndex] = deltaAngle;
		euler = new THREE.Euler().fromArray(euler);

		if (this._tool.fireEvent("rotating", { x: THREE.MathUtils.radToDeg(euler.x), y: THREE.MathUtils.radToDeg(euler.y), z: THREE.MathUtils.radToDeg(euler.z) }, true)) {
			this._rotate(euler);

			// update arc mesh
			var vertices = [0, 0, 0];
			var dir = new THREE.Vector3();
			var i1 = (axisIndex + 1) % 3,
				i2 = (axisIndex + 2) % 3;
			var i, n = Math.max(Math.ceil(Math.abs(deltaAngle) * 64 / Math.PI), 1);
			for (i = 0; i <= n; i++) {
				var a = angle1 - deltaAngle * (i / n);
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

	AnchorPointToolGizmo.prototype._rotate = function(euler) {
		if (this._tool.getAllowOperation() === AnchorPointToolOperation.Move) {
			// Rotation is not enabled
			return this;
		}
		this._tool._deactivateScreenAlignment();

		this._isRotated = true;
		this._rotationDelta.set(THREE.MathUtils.radToDeg(euler.x), THREE.MathUtils.radToDeg(euler.y), THREE.MathUtils.radToDeg(euler.z));

		var quat = new THREE.Quaternion().setFromEuler(euler);
		this._gizmo.quaternion.copy(this._originQuaternion).multiply(quat);

		this._viewport.setShouldRenderFrame();
	};

	AnchorPointToolGizmo.prototype.rotate = function(x, y, z) {
		this.beginGesture();
		this._rotate(new THREE.Euler(THREE.MathUtils.degToRad(x || 0), THREE.MathUtils.degToRad(y || 0), THREE.MathUtils.degToRad(z || 0)));
	};

	AnchorPointToolGizmo.prototype._getValueLocaleOptions = function() {
		return (this._handleIndex >= 0 && this._handleIndex < 3) ? { useGrouping: false } : { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 2 };
	};

	AnchorPointToolGizmo.prototype.getValue = function() {

		if (this._handleIndex >= 0 && this._handleIndex < 3) { // position
			var axis = new THREE.Vector3().setFromMatrixColumn(this._gizmo.matrixWorld, this._handleIndex).normalize();
			return axis.dot(this._gizmo.position);
		}

		if (this._handleIndex >= 6 && this._handleIndex < 9) { // rotation
			return THREE.MathUtils.radToDeg(this._gizmo.rotation.reorder("YXZ")[["x", "y", "z"][this._handleIndex - 6]]);
		}

		return 0;
	};

	AnchorPointToolGizmo.prototype.setValue = function(value) {
		if (this._handleIndex >= 0 && this._handleIndex < 3) { // position
			var offset = new THREE.Vector3().setFromMatrixColumn(this._gizmo.matrixWorld, this._handleIndex).normalize().multiplyScalar(value - this.getValue());

			this.beginGesture();
			this._move(offset);
			this.endGesture();
		} else if (this._handleIndex >= 6 && this._handleIndex < 9) { // rotation
			var euler = this._gizmo.rotation.clone();
			euler[["x", "y", "z"][this._handleIndex - 6]] = THREE.MathUtils.degToRad(value);
			var quat2 = new THREE.Quaternion().setFromEuler(euler);
			var quat = this._gizmo.quaternion.clone().invert().multiply(quat2);
			euler.setFromQuaternion(quat);

			this.beginGesture();
			this._rotate(euler);
			this.endGesture();
		}
	};

	AnchorPointToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			this._expandBoundingBox(boundingBox, this._viewport.getCamera().getCameraRef(), true);
		}
	};

	AnchorPointToolGizmo.prototype._updateGizmoTransformation = function(i, camera) {
		this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		var scale = this._getGizmoScale(this._gizmo.position);
		this._gizmo.scale.setScalar(this._gizmoSize * scale);
		this._gizmo.updateMatrixWorld(true);
		this._updateAxisTitles(this._axisTitles, this._gizmo, camera, this._gizmoSize + 18, scale);
		this._line.scale.setScalar(1 / (this._gizmoSize * scale));
	};

	AnchorPointToolGizmo.prototype._getEditingFormPosition = function() {
		var scale = this._getGizmoScale(this._gizmo.position);
		var direction = new THREE.Vector3();
		if (this._handleIndex >= 0 && this._handleIndex < 3) {// edit position
			direction.setFromMatrixColumn(this._gizmo.matrixWorld, this._handleIndex).normalize();
		} else if (this._handleIndex >= 6 && this._handleIndex < 9) {// edit rotation
			var index = this._handleIndex % 3;
			var basis = this._extractBasis(this._gizmo.matrixWorld);
			direction.copy(basis[(index + 1) % 3]).add(basis[(index + 2) % 3]).normalize();
		}
		return direction.clone().multiplyScalar((this._gizmoSize + 18) * scale).add(this._gizmo.position).applyMatrix4(this._matViewProj);
	};

	AnchorPointToolGizmo.prototype.render = function() {
		assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		var renderer = this._viewport.getRenderer(),
			camera = this._viewport.getCamera().getCameraRef();

		renderer.clearDepth();

		this._updateGizmoTransformation(0, camera);
		renderer.render(this._sceneGizmo, camera);

		this._updateEditingForm((this._handleIndex >= 0 && this._handleIndex < 3) || (this._handleIndex >= 6 && this._handleIndex < 9), this._handleIndex % 3);
	};

	return AnchorPointToolGizmo;
});
