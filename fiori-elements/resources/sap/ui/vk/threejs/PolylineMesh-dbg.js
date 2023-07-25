/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the PolylineMesh class.
sap.ui.define([
	"../thirdparty/three",
	"./PolylineGeometry",
	"./PolylineMaterial"
], function(
	THREE,
	PolylineGeometry,
	PolylineMaterial
) {
	"use strict";

	function PolylineMesh(geometry, material) {
		var myGeometry = geometry !== undefined ? geometry : new PolylineGeometry();
		var myMaterial = material !== undefined ? material : new PolylineMaterial();
		var _this = new THREE.Mesh(myGeometry, myMaterial);
		Object.setPrototypeOf(_this, PolylineMesh.prototype);
		this.type = "PolylineMesh";
		return _this;
	}

	PolylineMesh.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {

		constructor: PolylineMesh,

		isPolylineMesh: true,

		computeLineDistances: (function() {
			var a = new THREE.Vector4();
			var b = new THREE.Vector4();
			var clipA = new THREE.Vector2();
			var clipB = new THREE.Vector2();

			return function(matWorldViewProj, viewportSize, nearZ) {
				var geometry = this.geometry;
				var data = geometry.attributes.instanceDistance.data;
				var lineDistances = data.array;
				var vertices = geometry.vertices;
				var dist = 0, t;

				a.copy(vertices[0]).applyMatrix4(matWorldViewProj);
				for (var i = 0, j = 0, l = data.count; i < l; i++, j += 2) {
					b.copy(vertices[i + 1]).applyMatrix4(matWorldViewProj);
					if (nearZ !== undefined) {  // perspective camera
						if (a.w >= nearZ) {
							clipA.copy(a).multiplyScalar(1 / a.w);
							if (b.w >= nearZ) {
								clipB.copy(b).multiplyScalar(1 / b.w);
							} else {
								t = (a.w - nearZ) / (a.w - b.w);
								clipB.copy(b).sub(a).multiplyScalar(t).add(a).multiplyScalar(1 / nearZ);
							}
						} else if (b.w >= nearZ) {
							clipB.copy(b).multiplyScalar(1 / b.w);
							t = (b.w - nearZ) / (b.w - a.w);
							clipA.copy(a).sub(b).multiplyScalar(t).add(b).multiplyScalar(1 / nearZ);
						} else {
							clipA.set(0, 0, 0);
							clipB.set(0, 0, 0);
						}
					} else { // orthographic camera
						clipA.copy(a);
						clipB.copy(b);
					}
					lineDistances[j] = dist;
					dist += clipB.sub(clipA).multiply(viewportSize).length() * 0.5;
					lineDistances[j + 1] = dist;
					a.copy(b);
				}

				this.material.lineLength = dist;

				data.needsUpdate = true;

				return this;
			};
		}())
	});

	return PolylineMesh;
});
