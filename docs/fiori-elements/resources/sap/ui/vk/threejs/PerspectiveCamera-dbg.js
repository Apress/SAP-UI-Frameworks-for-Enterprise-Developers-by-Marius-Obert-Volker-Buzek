/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the PerspectiveCamera class.
sap.ui.define([
	"../PerspectiveCamera",
	"../thirdparty/three"
], function(
	PerspectiveCamera,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new PerspectiveCamera.
	 *
	 *
	 * @class Provides the interface for the camera.
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.PerspectiveCamera
	 * @alias sap.ui.vk.threejs.PerspectiveCamera
	 * @since 1.52.0
	 */
	var ThreeJsPerspectiveCamera = PerspectiveCamera.extend("sap.ui.vk.threejs.PerspectiveCamera", /** @lends sap.ui.vk.three.PerspectiveCamera.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = PerspectiveCamera.getMetadata().getParent().getClass().prototype;

	ThreeJsPerspectiveCamera.prototype.init = function() {

		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		var near = 1;
		var far = 10000;

		this._nativeCamera = new THREE.PerspectiveCamera(30, 1, near, far);

		this._nativeCamera.position.set(0, 0, 100);

		this.setUsingDefaultClipPlanes(true);
	};

	/**
	 * Updates the camera properties with width and height of viewport
	 *
	 * @param {float} width width of the viewport
	 * @param {float} height height of the viewport
	 * @public
	 */
	ThreeJsPerspectiveCamera.prototype.update = function(width, height) {
		var oldAspect = this._nativeCamera.aspect;
		var oldZoom = this._nativeCamera.zoom;
		this._nativeCamera.aspect = width / height;
		this._nativeCamera.zoom = Math.min(this._nativeCamera.aspect, 1); // we need to use three.js camera zoom when width is less than height

		var view = this._nativeCamera.view;
		if (view && view.enabled) { // Redline mode is activated
			var sw = width / view.fullWidth;
			var sh = height / view.fullHeight;
			var sy = this._nativeCamera.zoom / oldZoom;
			var sx = sy * oldAspect / this._nativeCamera.aspect;

			// when you modify the projection matrix you can simply multiply the matrix offset elements (8, 9) by (sx, sy) respectively,
			// but when you use three.js view offsetX, offsetY you have to recalculate them using a complex formula:
			// matProj[8] =  (2 * view.offsetX + view.width - view.fullHeight) / view.width
			// matProj[9] = -(2 * view.offsetY + view.height - view.fullHeight) / view.height
			// view.offsetX = ( matProj[8] * view.width - view.width + view.fullWidth) / 2
			// view.offsetY = (-matProj[9] * view.height - view.height + view.fullHeight) / 2
			view.offsetX = (view.offsetX * sx + (view.fullWidth - view.width) * (1 - sx) * 0.5) * sw;
			view.offsetY = (view.offsetY * sy + (view.fullHeight - view.height) * (1 - sy) * 0.5) * sh;

			view.width *= sw; // scaled width of the viewport, depends on the zoom of the viewport (not the three.js camera zoom)
			view.height *= sh; // scaled height of the viewport, depends on the zoom of the viewport (not the three.js camera zoom)
			view.fullWidth = width; // width of the viewport
			view.fullHeight = height; // height of the viewport

			// recalculate the view offset from the projection matrix offset
			// var matProj = this._nativeCamera.projectionMatrix.elements;
			// view.offsetX = ( matProj[8] * sx * view.width - view.width + view.fullWidth) * 0.5;
			// view.offsetY = (-matProj[9] * sy * view.height - view.height + view.fullHeight) * 0.5;
		}

		this._nativeCamera.updateProjectionMatrix();
	};

	ThreeJsPerspectiveCamera.prototype.exit = function() {

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}

		this._nativeCamera = null;
	};

	ThreeJsPerspectiveCamera.prototype.getFov = function() {
		return this._nativeCamera.fov;
	};

	ThreeJsPerspectiveCamera.prototype.setFov = function(val) {
		this._nativeCamera.fov = val;
		this._nativeCamera.updateProjectionMatrix();
		this.setIsModified(true);
		return this;
	};

	// base class - camera properties..
	ThreeJsPerspectiveCamera.prototype.getCameraRef = function() {
		return this._nativeCamera;
	};

	ThreeJsPerspectiveCamera.prototype.setCameraRef = function(camRef) {
		this._nativeCamera = camRef;
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.getNearClipPlane = function() {
		return this._nativeCamera.near;
	};

	ThreeJsPerspectiveCamera.prototype.setNearClipPlane = function(val) {
		this._nativeCamera.near = val;
		this.setUsingDefaultClipPlanes(false);
		this._nativeCamera.updateProjectionMatrix();
		this.setIsModified(true);
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.getFarClipPlane = function() {
		return this._nativeCamera.far;
	};

	ThreeJsPerspectiveCamera.prototype.setFarClipPlane = function(val) {
		this._nativeCamera.far = val;
		this.setUsingDefaultClipPlanes(false);
		this._nativeCamera.updateProjectionMatrix();
		this.setIsModified(true);
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.getPosition = function() {
		return this._nativeCamera.position.toArray();
	};

	ThreeJsPerspectiveCamera.prototype.setPosition = function(vals) {
		this._nativeCamera.position.fromArray(vals);
		this._nativeCamera.updateMatrixWorld();
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.getUpDirection = function() {
		return this._nativeCamera.up.toArray();
	};

	ThreeJsPerspectiveCamera.prototype.setUpDirection = function(vals) {
		this._nativeCamera.up.fromArray(vals);
		this._nativeCamera.updateMatrixWorld();
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.getTargetDirection = function() {
		return this._nativeCamera.getWorldDirection(new THREE.Vector3()).toArray();
	};

	ThreeJsPerspectiveCamera.prototype.setTargetDirection = function(vals) {
		var target = new THREE.Vector3().fromArray(vals);
		target.add(this._nativeCamera.position);

		this._nativeCamera.lookAt(target);
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.setUsingDefaultClipPlanes = function(val) {
		this._nativeCamera.userData.usingDefaultClipPlanes = val;
		return this;
	};

	ThreeJsPerspectiveCamera.prototype.getUsingDefaultClipPlanes = function() {
		return this._nativeCamera.userData.usingDefaultClipPlanes;
	};

	/**
	 * Adjust the camera near and far clipping planes to include the entire specified bounding box
	 *
	 * @param {THREE.Box3} boundingBox Bounding box
	 * @returns {sap.ui.vk.threejs.PerspectiveCamera} this
	 * @public
	 */
	ThreeJsPerspectiveCamera.prototype.adjustClipPlanes = function(boundingBox) {
		var camera = this._nativeCamera;
		camera.updateMatrixWorld();
		boundingBox = boundingBox.clone().applyMatrix4(camera.matrixWorldInverse);

		camera.near = -boundingBox.max.z;
		camera.far = -boundingBox.min.z;

		var epsilon = Math.max(Math.max((camera.far - camera.near), camera.far) * 0.0025, 0.001);
		camera.near -= epsilon;
		camera.far += epsilon;
		camera.near = Math.max(camera.near, epsilon);
		camera.far = Math.max(camera.far, camera.near + epsilon);

		var c = -(camera.far + camera.near) / (camera.far - camera.near);
		var d = -2 * camera.far * camera.near / (camera.far - camera.near);
		camera.projectionMatrix.elements[10] = c;
		camera.projectionMatrix.elements[14] = d;
		camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
		return this;
	};

	return ThreeJsPerspectiveCamera;
});
