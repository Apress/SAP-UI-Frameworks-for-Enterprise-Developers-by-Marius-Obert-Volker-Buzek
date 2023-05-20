/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/assert",
	"./Feature",
	"./FeatureType",
	"./Utils"
], function(
	assert,
	Feature,
	FeatureType,
	Utils
) {
	"use strict";

	var defaultFace = {
		vertices: [0, 0, 0],
		triangles: null,
		boundingSpheres: null,
		edges: null,
		planeEquation: null
	};

	/**
	 * Create a face feature object.
	 *
	 * @class
	 * @classdesc Provides functionality for highlighting coplanar faces.
	 *
	 * @param {object} [settings] A JSON-like object.
	 * @param {object} [settings.face] A face object (all coordinates are in world space) described as:
	 *     <code>vertices: [x1, y1, z1,..., xv, yv, zv]</code> - XYZ vertex coordinates
	 *     <code>triangles: [i1, j1, k1,..., it, jt, kt]</code> - 3 indices into vertex array per triangle
	 *     <code>boundingSpheres: [x1, y1, z1, r1,..., xt, yt, zt, rt]</code> - XYZ and radius of per-triangle bounding spheres
	 *     <code>edges: [i1, j1,..., ie, je]</code> - 2 indices into vertex array per edge
	 *     <code>planeEquation: [a, b, c, d]</code>
	 *     where <code>v</code> is the number of vertices in the list.
	 *     where <code>t</code> is the number of triangles in the list.
	 *     where <code>e</code> is the number of edges in the list.
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @alias sap.ui.vk.measurement.Face
	 * @since 1.101.0
	 */
	var Face = function(settings) {
		Feature.apply(this, arguments);

		this._face = {};
		this.setValue(settings && settings.face || defaultFace);
	};

	Face.prototype = Object.create(Feature.prototype);
	Face.prototype.constructor = Face;
	Face.prototype.isFace = true;

	Feature._classMap.set(FeatureType.Face, Face);

	/**
	 * Checks if face is a closed contour (only vertices) or a proper face with vertices and triangles.
	 *
	 * @returns {boolean} true if it is a contour
	 */
	 Face.prototype.isClosedContour = function() {
		return !this._face.triangles;
	};

	/**
	 * Set face position.
	 *
	 * @param {object} value A face object (all coordinates are in world space) described as:
	 *     <code>vertices: [x1, y1, z1,..., xv, yv, zv]</code>
	 *     <code>triangles: [i1, j1, k1,..., it, jt, kt]</code>
	 *     <code>boundingSpheres: [x1, y1, z1, r1,..., xt, yt, zt, rt]</code>
	 *     <code>edges: [i1, j1,..., ie, je]</code>
	 *     <code>planeEquation: [a, b, c, d]</code>
	 *     where <code>v</code> is the number of vertices in the list.
	 *     where <code>t</code> is the number of triangles in the list.
	 *     where <code>e</code> is the number of edges in the list.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 */
	Face.prototype.setValue = function(value) {
		assert(value.vertices.length % 3 === 0, "Vertices array must have 3x elements");
		var face = this._face;
		face.vertices = new Float64Array(value.vertices);
		if (!value.triangles) {
			// this is a special case of a "face", which is just a closed contour
			face.triangles = null;
			face.boundingSpheres = null;
			face.edges = null;
			face.planeEquation = null;
			return this;
		}

		var vertices = face.vertices;
		assert(value.triangles.length % 3 === 0, "Triangles array must have 3x elements");
		face.triangles = new Int32Array(value.triangles);
		var triangles = face.triangles;
		var o, v0, v1, v2;
		var i, j, count;

		// build bounding spheres if not provided
		if (value.boundingSpheres) {
			assert(value.boundingSpheres.length % 4 === 0, "Bounding spheres must have 4x elements");
			assert(value.boundingSpheres.length / 4 === value.triangles.length / 3, "Number of triangles and bounding spheres must match");
			face.boundingSpheres = new Float64Array(value.boundingSpheres);
		} else {
			face.boundingSpheres = new Float64Array(4 * (triangles.length / 3));
			var sphereOffset = 0;
			for (i = 0, count = triangles.length; i < count; i += 3) {
				o = triangles[i] * 3;
				v0 = [vertices[o], vertices[o + 1], vertices[o + 2]];
				o = triangles[i + 1] * 3;
				v1 = [vertices[o], vertices[o + 1], vertices[o + 2]];
				o = triangles[i + 2] * 3;
				v2 = [vertices[o], vertices[o + 1], vertices[o + 2]];
				Utils.computeTriangleBoundingSphere(v0, v1, v2, face.boundingSpheres, sphereOffset);
				sphereOffset += 4;
			}
		}

		// build edges if not provided
		if (value.edges) {
			assert(value.edges.length % 2 === 0, "Edges array must have 2x elements");
			face.edges = new Int32Array(value.edges);
		} else {
			// build a list of all edges codes by using a Set to find codes that were encountered exactly once
			var edges = new Set();
			for (i = 0, count = triangles.length; i < count; i += 3) {
				for (j = 0; j < 3; ++j) {
					v0 = triangles[i + j];
					v1 = triangles[i + ((j + 1) % 3)];
					if (v0 < v1) {
						o = v0 + ":" + v1;
					} else {
						o = v1 + ":" + v0;
					}

					if (edges.has(o)) {
						edges.delete(o);
					} else {
						edges.add(o);
					}
				}
			}

			i = 0;
			face.edges = new Int32Array(edges.size * 2);
			edges.forEach(function(value) {
				o = value.split(":");
				face.edges[i] = Number(o[0]);
				face.edges[i + 1] = Number(o[1]);
				i += 2;
			});
		}

		// compute plane equation if not provided
		if (value.planeEquation) {
			assert(value.planeEquation.length === 4, "Plane equation have 4 elements");
			face.planeEquation = new Float64Array(value.planeEquation);
		} else {
			assert(triangles.length >= 3, "Expecting at least one triangle");
			face.planeEquation = new Float64Array(Utils.computePlaneEquation(vertices, triangles[0] * 3, triangles[1] * 3, triangles[2] * 3));
		}

		return this;
	};

	/**
	 * Get face position.
	 *
	 * @returns {object} A face object (all coordinates are in world space) described as:
	 *     <code>vertices: [x1, y1, z1,..., xv, yv, zv]</code>
	 *     <code>triangles: [i1, j1, k1,..., it, jt, kt]</code>
	 *     <code>boundingSpheres: [x1, y1, z1, r1,..., xt, yt, zt, rt]</code>
	 *     <code>edges: [i1, j1,..., ie, je]</code>
	 *     where <code>v</code> is the number of vertices in the list.
	 *     where <code>t</code> is the number of triangles in the list.
	 *     where <code>e</code> is the number of edges in the list.
	 */
	Face.prototype.getValue = function() {
		return this._face;
	};

	Face.prototype.toJSON = function(fullInfo) {
		var face = this._face;
		var json = {
			type: FeatureType.Face,
			face: {
				vertices: Array.from(face.vertices)
			}
		};

		if (face.triangles) {
			json.face.triangles = Array.from(face.triangles);
		}

		if (fullInfo) {// cloning requires full information
			if (face.boundingSpheres) {
				json.face.boundingSpheres = Array.from(face.boundingSpheres);
			}
			if (face.edges) {
				json.face.edges = Array.from(face.edges);
			}
			if (face.planeEquation) {
				json.face.planeEquation = Array.from(face.planeEquation);
			}
		}
		return json;
	};

	return Face;
});
