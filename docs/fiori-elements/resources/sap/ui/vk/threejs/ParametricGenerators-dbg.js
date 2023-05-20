/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../thirdparty/three"
], function(
	THREE
) {
	"use strict";

	/**
	 * Generate ThreeJS objects based on the parametric objects data pass in.
	 * Initially used for 360 panoramic scenes
	 */
	var ParametricGenerators = {
		generateSphere: function(sphereJson, material) {
			var geometry = new THREE.SphereGeometry(sphereJson.radius, 32, 32);

			var mesh = new THREE.Mesh(geometry, material || undefined);
			mesh.name = "sphere";

			return mesh;
		},

		generateBox: function(boxJson) {

		},

		generatePlane: function(planeJson, material) {
			// planeJson { length, width } => PlaneGeometry { width, height }
			var geometry = new THREE.PlaneGeometry(planeJson.length, planeJson.width);

			var mesh = new THREE.Mesh(geometry, material || undefined);
			mesh.name = "plane";
			mesh.rotation.x = Math.PI / 2;
			mesh.position.set(-planeJson.length / 2, -planeJson.width / 2, 0);
			return mesh;
		}
	};

	return ParametricGenerators;

});
