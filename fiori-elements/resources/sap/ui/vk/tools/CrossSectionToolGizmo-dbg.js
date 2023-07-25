/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.tools.CrossSectionToolGizmo
sap.ui.define([
	"../getResourceBundle",
	"../thirdparty/three",
	"./Gizmo",
	"./AxisColours",
	"../threejs/ThreeUtils",
	"sap/base/assert"
], function(
	getResourceBundle,
	THREE,
	Gizmo,
	AxisColours,
	ThreeUtils,
	assert
) {
	"use strict";

	/**
	 * Constructor for a new CrossSectionToolGizmo.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides handles for moving cross section tool
	 * @extends sap.ui.vk.tools.Gizmo
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.vk.tools.CrossSectionToolGizmo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CrossSectionToolGizmo = Gizmo.extend("sap.ui.vk.tools.CrossSectionToolGizmo", /** @lends sap.ui.vk.tools.CrossSectionToolGizmo.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	CrossSectionToolGizmo.prototype.init = function() {
		if (Gizmo.prototype.init) {
			Gizmo.prototype.init.apply(this);
		}

		this._createEditingForm(getResourceBundle().getText("TOOL_UNITS_MM"), 84);
		this._handleIndex = -1;

		this._viewport = null;
		this._tool = null;
		this._position = new THREE.Vector3(0, 0, 0);
		this._plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
		this._flip = false;
		this._matViewProj = new THREE.Matrix4();
		this._gizmoSize = 144;
		this._firstShowPress = true;

		this.setAxis(0);
	};

	CrossSectionToolGizmo.prototype.hasDomElement = function() {
		return true;
	};

	CrossSectionToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._tool = tool;
		if (this._firstShowPress) {
			var bbox = viewport._scene ? viewport._scene._computeBoundingBox(true, true) : new THREE.Box3();
			bbox.getCenter(this._position);
			this._firstShowPress = false;
		}
		this._plane.constant = -this._plane.normal.dot(this._position);
		viewport.setClippingPlanes([this._plane]);
	};

	CrossSectionToolGizmo.prototype.hide = function() {
		if (this._viewport) {
			this._viewport.setClippingPlanes([]);
			this._viewport = null;
		}
		this._handleIndex = -1;
		this._tool = null;
		this._updateEditingForm(false, -1);
	};

	CrossSectionToolGizmo.prototype._getOffset = function() {
		return this._position.getComponent(this._axis);
	};

	CrossSectionToolGizmo.prototype.getAxis = function() {
		return this._axis;
	};

	CrossSectionToolGizmo.prototype.setAxis = function(i) {
		this._handleIndex = -1;
		this._axis = i;
		var dir = new THREE.Vector3().setComponent(i, 1);
		this._plane.normal.set(0, 0, 0).setComponent(i, this._flip ? -1 : 1);
		this._plane.constant = -this._plane.normal.dot(this._position);

		var geometry = new THREE.BufferGeometry();
		var vertices = new Array(15);
		var dirX = new THREE.Vector3(dir.y, dir.z, dir.x),
			dirY = new THREE.Vector3(dir.z, dir.x, dir.y),
			p = new THREE.Vector3();
		p.sub(dirX).sub(dirY).multiplyScalar(0.5).toArray(vertices, 0);
		p.toArray(vertices, 12);
		p.add(dirX).toArray(vertices, 3);
		p.add(dirY).toArray(vertices, 6);
		p.sub(dirX).toArray(vertices, 9);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		this._gizmoPlane = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x404040, transparent: true, linewidth: window.devicePixelRatio }));

		var arrowLength = 144,
			lineRadius = window.devicePixelRatio * 0.5,
			coneHeight = 32,
			coneRadius = 6,
			touchRadius = 48;
		dir = this._plane.normal.clone().multiplyScalar(1 / arrowLength);
		var color = 0;
		switch (i) {
			case 0: color = AxisColours.x; break;
			case 1: color = AxisColours.y; break;
			case 2: color = AxisColours.z; break;
			default: break;
		}
		var lineGeometry = new THREE.CylinderGeometry(lineRadius, lineRadius, arrowLength - coneHeight, 4);
		var m = new THREE.Matrix4().makeBasis(new THREE.Vector3(dir.y, dir.z, dir.x), dir, new THREE.Vector3(dir.z, dir.x, dir.y));
		m.setPosition(dir.clone().multiplyScalar((arrowLength - coneHeight) * 0.5));
		lineGeometry.applyMatrix4(m);
		this._gizmoArrow = new THREE.Mesh(lineGeometry, new THREE.MeshBasicMaterial({ color: color }));
		this._gizmoArrow.userData.color = color;

		var coneGeometry = new THREE.CylinderGeometry(0, coneRadius, coneHeight, 12, 1);
		m.setPosition(dir.clone().multiplyScalar(arrowLength - coneHeight * 0.5));
		coneGeometry.applyMatrix4(m);
		var cone = new THREE.Mesh(coneGeometry, new THREE.MeshBasicMaterial({ color: color }));
		cone.matrixAutoUpdate = false;
		this._gizmoArrow.add(cone);

		var touchGeometry = new THREE.CylinderGeometry(touchRadius * 0.5, touchRadius * 0.5, arrowLength, 12, 1);
		m.setPosition(dir.clone().multiplyScalar(arrowLength * 0.5));
		touchGeometry.applyMatrix4(m);
		this._touchMesh = new THREE.Mesh(touchGeometry, new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
		this._gizmoArrow.add(this._touchMesh);

		if (this._viewport) {
			this._viewport.setShouldRenderFrame();
		}
		return this;
	};

	CrossSectionToolGizmo.prototype.setFlip = function(flip) {
		this._flip = !!flip;
		var handleIndex = this._handleIndex;
		this.setAxis(this._axis);
		this._handleIndex = handleIndex;
		return this;
	};

	CrossSectionToolGizmo.prototype.getTouchObject = function() {
		return this._touchMesh;
	};

	var size = new THREE.Vector3();

	CrossSectionToolGizmo.prototype._getDelta = function() {
		var bbox = this._viewport._scene._computeBoundingBox(true, true);
		bbox.getSize(size);
		return Math.max(size.x, size.y, size.z);
	};

	CrossSectionToolGizmo.prototype._setOffset = function(offset) {
		var bbox = this._viewport._scene._computeBoundingBox(true, true);
		offset = THREE.MathUtils.clamp(offset, bbox.min.getComponent(this._axis), bbox.max.getComponent(this._axis));
		this._position.setComponent(this._axis, offset);
		this._plane.constant = -this._plane.normal.dot(this._position);
		this._viewport.setShouldRenderFrame();
	};

	CrossSectionToolGizmo.prototype.getValue = function() {
		return this._position.getComponent(this._handleIndex);
	};

	CrossSectionToolGizmo.prototype.setValue = function(value) {
		if (this._handleIndex >= 0) {
			this._position.setComponent(this._handleIndex, value);
			this._plane.constant = value;
			this._viewport.setShouldRenderFrame();
		}
	};

	CrossSectionToolGizmo.prototype.highlightArrowHandle = function(highlight) {
		var color = highlight ? 0xFFFF00 : this._gizmoArrow.userData.color;
		this._gizmoArrow.material.color.setHex(color); // arrow line color
		this._gizmoArrow.children[0].material.color.setHex(color); // arrow cone color
	};

	CrossSectionToolGizmo.prototype.selectHandle = function(index) {
		this._handleIndex = index;
		this._viewport.setShouldRenderFrame();
	};

	CrossSectionToolGizmo.prototype._adjustBoundingBox = function(boundingBox) {
		boundingBox.getSize(size);
		var delta = Math.max(size.x, size.y, size.z) * 0.2;
		boundingBox.expandByScalar(delta);
	};

	CrossSectionToolGizmo.prototype._updateGizmo = function(bbox) {
		var i = this._axis;
		var offset = THREE.MathUtils.clamp(this._position.getComponent(i), bbox.min.getComponent(i), bbox.max.getComponent(i));
		this._position.setComponent(i, offset);
		this._plane.constant = -this._plane.normal.dot(this._position);

		this._adjustBoundingBox(bbox);

		bbox.getCenter(this._gizmoPlane.position);
		this._gizmoPlane.position.setComponent(i, offset);
		bbox.getSize(this._gizmoPlane.scale);
		this._gizmoPlane.updateMatrixWorld(true);

		var camera = this._viewport.getCamera().getCameraRef();
		this._gizmoArrow.position.copy(this._gizmoPlane.position);
		this._matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		this._gizmoArrow.scale.setScalar(this._gizmoSize * this._getGizmoScale(this._gizmoArrow.position));
		this._gizmoArrow.updateMatrixWorld(true);
	};

	CrossSectionToolGizmo.prototype.expandBoundingBox = function(boundingBox) {
		if (this._viewport) {
			var sceneBoundingBox = this._viewport._scene._computeBoundingBox(true, true);
			this._updateGizmo(sceneBoundingBox);
			boundingBox.min.min(sceneBoundingBox.min);
			boundingBox.max.max(sceneBoundingBox.max);
			boundingBox.expandByPoint(this._plane.normal.clone().multiply(this._gizmoArrow.scale).add(this._gizmoArrow.position));
		}
	};

	CrossSectionToolGizmo.prototype._getEditingFormPosition = function() {
		return this._plane.normal.clone().applyMatrix4(this._gizmoArrow.matrixWorld).applyMatrix4(this._matViewProj);
	};

	CrossSectionToolGizmo.prototype.render = function() {
		assert(this._viewport && this._viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport", "Can't render gizmo without sap.ui.vk.threejs.Viewport");

		var sceneBoundingBox = this._viewport._scene._computeBoundingBox(true, true);
		this._updateGizmo(sceneBoundingBox);

		var renderer = this._viewport.getRenderer(),
			camera = this._viewport.getCamera().getCameraRef();

		renderer.render(this._gizmoPlane, camera);
		renderer.clearDepth();
		renderer.render(this._gizmoArrow, camera);

		this._gizmo = this._gizmoArrow;
		this._updateEditingForm(this._handleIndex >= 0, this._handleIndex);
	};

	CrossSectionToolGizmo.prototype.exit = function() {
		if (this._gizmoArrow) {
			ThreeUtils.disposeObject(this._gizmoArrow);
			this._gizmoArrow = null;
		}

		if (this._gizmoPlane) {
			ThreeUtils.disposeObject(this._gizmoPlane);
			this._gizmoPlane = null;
		}

		if (this._touchMesh) {
			ThreeUtils.disposeObject(this._touchMesh);
			this._touchMesh = null;
		}

		Gizmo.prototype.exit.call(this);
	};

	return CrossSectionToolGizmo;

});
