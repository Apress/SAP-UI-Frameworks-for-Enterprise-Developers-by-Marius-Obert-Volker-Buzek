/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./glMatrix"
], function(glMatrix) {
	"use strict";

	/**
	 * Node utilities library.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.NodeUtils
	 * @since 1.74
	 * @experimental Since 1.74 This class is experimental and might be modified or removed in future versions.
	 */
	var NodeUtils = {
		/**
		 * Calculates the geometrical center of nodes.
		 *
		 * @param {any[]} nodeRefs                 The array of node references.
		 * @param {sap.ui.vk.ViewStateManager} vsm The view state manager.
		 * @returns {float[]} The geometrical center of nodes.
		 * @public
		 * @static
		 */
		centerOfNodes: function(nodeRefs, vsm) {

			// Node has a boundingBox value built into it.
			// Need to transform the nodes bounding boxes values to
			function updateBoundingBox(minX, minY, minZ, maxX, maxY, maxZ, transform) {
				// rebuild all bbox points, then transform, and recreate the bbox
				var points = [];

				points.push(glMatrix.vec3.fromValues(minX, minY, minZ));
				points.push(glMatrix.vec3.fromValues(minX, minY, maxZ));
				points.push(glMatrix.vec3.fromValues(minX, maxY, minZ));
				points.push(glMatrix.vec3.fromValues(minX, maxY, maxZ));

				points.push(glMatrix.vec3.fromValues(maxX, minY, minZ));
				points.push(glMatrix.vec3.fromValues(maxX, minY, maxZ));
				points.push(glMatrix.vec3.fromValues(maxX, maxY, minZ));
				points.push(glMatrix.vec3.fromValues(maxX, maxY, maxZ));

				var newMinX = Number.MAX_SAFE_INTEGER;
				var newMinY = Number.MAX_SAFE_INTEGER;
				var newMinZ = Number.MAX_SAFE_INTEGER;

				var newMaxX = -Number.MAX_SAFE_INTEGER;
				var newMaxY = -Number.MAX_SAFE_INTEGER;
				var newMaxZ = -Number.MAX_SAFE_INTEGER;

				var tempVec = glMatrix.vec3.create();

				points.forEach(function(point) {
					glMatrix.vec3.transformMat4(tempVec, point, transform);
					if (tempVec[0] < newMinX) {
						newMinX = tempVec[0];
					}

					if (tempVec[1] < newMinY) {
						newMinY = tempVec[1];
					}

					if (tempVec[2] < newMinZ) {
						newMinZ = tempVec[2];
					}

					if (tempVec[0] > newMaxX) {
						newMaxX = tempVec[0];
					}

					if (tempVec[1] > newMaxY) {
						newMaxY = tempVec[1];
					}

					if (tempVec[2] > newMaxZ) {
						newMaxZ = tempVec[2];
					}
				});
				return [newMinX, newMinY, newMinZ, newMaxX, newMaxY, newMaxZ];
			}

			var max = {
				x: Number.NEGATIVE_INFINITY,
				y: Number.NEGATIVE_INFINITY,
				z: Number.NEGATIVE_INFINITY
			};

			var min = {
				x: Number.POSITIVE_INFINITY,
				y: Number.POSITIVE_INFINITY,
				z: Number.POSITIVE_INFINITY
			};
			var boxIsValid = false;

			nodeRefs.forEach(function(nodeInfo) {
				nodeInfo.traverse(function(nodeRef) {
					var bboxObject = nodeRef.userData.boundingBox;
					var bboxArray = null; // note: it has precedence over bboxObject
					if (!bboxObject && nodeRef.geometry) {
						// If not set in user data try to get it from geometry node
						var rg = nodeRef.userData.renderGroup;
						if (rg && rg.boundingBox) {
							bboxArray = rg.boundingBox;
						} else {
							bboxObject = nodeRef.geometry.boundingBox;
						}
					}

					var box = null;
					if (bboxArray) {
						box = updateBoundingBox(bboxArray[0], bboxArray[1], bboxArray[2], bboxArray[3], bboxArray[4], bboxArray[5], nodeRef.matrixWorld.elements);
					} else if (bboxObject) {
						var p0 = bboxObject.min;
						var p1 = bboxObject.max;
						box = updateBoundingBox(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, nodeRef.matrixWorld.elements);
					}

					if (box) {
						// Transform it to world space
						min.x = Math.min(min.x, box[0]);
						min.y = Math.min(min.y, box[1]);
						min.z = Math.min(min.z, box[2]);

						max.x = Math.max(max.x, box[3]);
						max.y = Math.max(max.y, box[4]);
						max.z = Math.max(max.z, box[5]);

						boxIsValid = true;
					}
				});
			});

			if (!boxIsValid) {
				return [0, 0, 0];
			}
			return [
				Math.abs(max.x - min.x) / 2 + min.x,
				Math.abs(max.y - min.y) / 2 + min.y,
				Math.abs(max.z - min.z) / 2 + min.z
			];
		}
	};

	return NodeUtils;
});
