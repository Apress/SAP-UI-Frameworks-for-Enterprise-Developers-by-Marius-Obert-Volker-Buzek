/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the OrthographicCamera class.
sap.ui.define([
	"../OrthographicCamera",
	"../thirdparty/three"
], function(
	OrthographicCamera,
	THREE
) {
	"use strict";

	/**
	 * Constructor for a new OrthographicCamera.
	 *
	 *
	 * @class Provides the interface for the camera.
	 *
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.OrthographicCamera
	 * @alias sap.ui.vk.threejs.OrthographicCamera
	 * @since 1.52.0
	 */
	var ThreeJsOrthographicCamera = OrthographicCamera.extend("sap.ui.vk.threejs.OrthographicCamera", /** @lends sap.ui.vk.three.OrthographicCamera.prototype */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = OrthographicCamera.getMetadata().getParent().getClass().prototype;

	ThreeJsOrthographicCamera.prototype.init = function() {

		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		var near = 1;
		var far = 200000;

		this._nativeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, near, far);

		this._nativeCamera.position.set(0, 0, 10000);
		this._nativeCamera.zoom = -1; // -1 means that the zoom will be adjusted on the 1st rendering frame

		this.setUsingDefaultClipPlanes(true);
	};

	/**
	 * Updates the camera properties with width and height of viewport
	 *
	 * @param {float} width width of the viewport
	 * @param {float} height height of the viewport
	 * @public
	 */
	ThreeJsOrthographicCamera.prototype.update = function(width, height) {
		var f = 1 / Math.min(width, height);
		this.setLeft(width * -f);
		this.setRight(width * f);
		this.setTop(height * f);
		this.setBottom(height * -f);

		var view = this._nativeCamera.view;
		if (view && view.enabled) { // Redline mode is activated
			var oldAspect = view.fullWidth / view.fullHeight;
			var newAspect = width / height;
			var sy = Math.min(newAspect, 1) / Math.min(oldAspect, 1);
			var sx = sy * oldAspect / newAspect;
			var sw = width / view.fullWidth;
			var sh = height / view.fullHeight;

			view.offsetX = (view.offsetX * sx + (view.fullWidth - view.width) * (1 - sx) * 0.5) * sw;
			view.offsetY = (view.offsetY * sy + (view.fullHeight - view.height) * (1 - sy) * 0.5) * sh;
			view.width *= sw;
			view.height *= sh;
			view.fullWidth = width;
			view.fullHeight = height;
		}

		this._nativeCamera.updateProjectionMatrix();
	};

	ThreeJsOrthographicCamera.prototype.exit = function() {

		if (basePrototype.exit) {
			basePrototype.exit.call(this);
		}
		this._nativeCamera = null;
	};

	ThreeJsOrthographicCamera.prototype.getLeft = function() {
		return this._nativeCamera.left;
	};

	ThreeJsOrthographicCamera.prototype.setLeft = function(val) {
		this._nativeCamera.left = val;
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getRight = function() {
		return this._nativeCamera.right;
	};

	ThreeJsOrthographicCamera.prototype.setRight = function(val) {
		this._nativeCamera.right = val;
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getTop = function() {
		return this._nativeCamera.top;
	};

	ThreeJsOrthographicCamera.prototype.setTop = function(val) {
		this._nativeCamera.top = val;
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getBottom = function() {
		return this._nativeCamera.bottom;
	};

	ThreeJsOrthographicCamera.prototype.setBottom = function(val) {
		this._nativeCamera.bottom = val;
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getZoomFactor = function() {
		return this._nativeCamera.zoom;
	};

	ThreeJsOrthographicCamera.prototype.setZoomFactor = function(val) {
		this._nativeCamera.zoom = val;
		return this;
	};

	// base class - camera properties..
	ThreeJsOrthographicCamera.prototype.getCameraRef = function() {
		return this._nativeCamera;
	};

	ThreeJsOrthographicCamera.prototype.setCameraRef = function(camRef) {
		this._nativeCamera = camRef;
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getNearClipPlane = function() {
		return this._nativeCamera.near;
	};

	ThreeJsOrthographicCamera.prototype.setNearClipPlane = function(val) {
		this._nativeCamera.near = val;
		this.setUsingDefaultClipPlanes(false);
		this._nativeCamera.updateProjectionMatrix();
		this.setIsModified(true);
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getFarClipPlane = function() {
		return this._nativeCamera.far;
	};

	ThreeJsOrthographicCamera.prototype.setFarClipPlane = function(val) {
		this._nativeCamera.far = val;
		this.setUsingDefaultClipPlanes(false);
		this._nativeCamera.updateProjectionMatrix();
		this.setIsModified(true);
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getPosition = function() {
		return this._nativeCamera.position.toArray();
	};

	ThreeJsOrthographicCamera.prototype.setPosition = function(vals) {
		this._nativeCamera.position.fromArray(vals);
		this._nativeCamera.updateMatrixWorld();
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getUpDirection = function() {
		return this._nativeCamera.up.toArray();
	};

	ThreeJsOrthographicCamera.prototype.setUpDirection = function(vals) {
		this._nativeCamera.up.fromArray(vals);
		this._nativeCamera.updateMatrixWorld();
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getTargetDirection = function() {
		var dir = new THREE.Vector3();
		this._nativeCamera.getWorldDirection(dir);
		return dir.toArray();
	};

	ThreeJsOrthographicCamera.prototype.setTargetDirection = function(vals) {
		var target = new THREE.Vector3().fromArray(vals);
		target.add(this._nativeCamera.position);

		this._nativeCamera.lookAt(target);
		return this;
	};

	ThreeJsOrthographicCamera.prototype.setUsingDefaultClipPlanes = function(val) {
		this._nativeCamera.userData.usingDefaultClipPlanes = val;
		return this;
	};

	ThreeJsOrthographicCamera.prototype.getUsingDefaultClipPlanes = function() {
		return this._nativeCamera.userData.usingDefaultClipPlanes;
	};

	/**
	 * Adjust the camera near and far clipping planes to include the entire specified bounding box
	 *
	 * @param {THREE.Box3} boundingBox Bounding box
	 * @returns {sap.ui.vk.threejs.OrthographicCamera} this
	 * @public
	 */
	ThreeJsOrthographicCamera.prototype.adjustClipPlanes = function(boundingBox) {
		var camera = this._nativeCamera;
		camera.updateMatrixWorld();
		boundingBox = boundingBox.clone().applyMatrix4(camera.matrixWorldInverse);

		camera.near = -boundingBox.max.z;
		camera.far = -boundingBox.min.z;

		var epsilon = Math.max((camera.far - camera.near) * 0.0025, 0.001);
		camera.near -= epsilon;
		camera.far += epsilon;

		if (camera.near < 0) {// THREE.Raycaster does not work correctly with orthographic camera if camera.near < 0
			var offset = new THREE.Vector3(0, 0, -1).transformDirection(camera.matrixWorld).multiplyScalar(camera.near);
			camera.position.add(offset); // move camera back
			camera.far -= camera.near;
			camera.near = 0;
			camera.updateMatrixWorld();
		}

		camera.updateProjectionMatrix();
		return this;
	};

	/**
	 * Adjust the camera zoom to include the entire specified bounding box
	 *
	 * @param {THREE.Box3} boundingBox Bounding box
	 * @returns {sap.ui.vk.threejs.OrthographicCamera} this
	 * @public
	 */
	ThreeJsOrthographicCamera.prototype.adjustZoom = function(boundingBox) {
		var camera = this._nativeCamera;
		camera.updateMatrixWorld();
		boundingBox = boundingBox.clone().applyMatrix4(camera.matrixWorldInverse);

		camera.zoom = 1 / Math.max(boundingBox.min.x / camera.left, boundingBox.max.y / camera.top,
			boundingBox.max.x / camera.right, boundingBox.min.y / camera.bottom);
		camera.updateProjectionMatrix();
		return this;
	};

	return ThreeJsOrthographicCamera;
});
