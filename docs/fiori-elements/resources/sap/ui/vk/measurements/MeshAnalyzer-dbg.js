/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// this object is used to store information about one particular mesh in a way suitable for doing measurements on it
sap.ui.define([
	"./Utils"
], function(
	Utils
) {
	"use strict";

	var tempV0 = new Float64Array(3);
	var tempV1 = new Float64Array(3);
	var tempV2 = new Float64Array(3);
	var tempVertexIndices = new Uint32Array(3);
	var tempTriangle = new Float64Array(3 * 3);

	// constructor requires the maximum number of triangles and lines to be known beforehand to preallocate typed arrays
	function MeshAnalyzer(maxTriangles, maxLines) {
		// worst case scenario is that there are no equal vertices at all (each triangle has 3 vertices)
		var maxTriangleVertices = maxTriangles * 3;

		// worst case scenario is that there are no equal vertices at all (each line has 2 vertices)
		var maxLineVertices = maxLines * 2;

		// each vertex only has x,y,z position. we don't use normals
		this._vertices = new Float64Array((maxTriangleVertices + maxLineVertices) * 3);
		this._vertexCount = 0;

		// list of "edges" (vertex to vertex connections). "a-b" and "b-a" connections are stored individually (though technically it is the same edge)
		// note: this representation also supports weird cases like 3 or more triangles sharing the same edge

		// list of connected vertices (used together with _vertexToVertexConnectivity)
		this._vertexToVertexIndices = new Uint32Array((maxTriangles * 3 + maxLines * 2) * 2);

		// how many vertices connect to this vertex (via shared edge) - indexing into _vertexToVertexIndices[]
		// 2 values per element: [offset, count]. todo: can store just offset and compute count
		this._vertexToVertexConnectivity = new Uint32Array((maxTriangleVertices + maxLineVertices) * 2);
		this._vertexToVertexEdgeId = null; // will be allocated in finishMeshBuilding()

		this._triangles = new Uint32Array(maxTriangles * 3); // stores 3 vertex indices per triangle
		this._triangleFaceId = new Uint32Array(maxTriangles); // adjacent coplanar triangles will have the same face id
		this._triangleFaceId.fill(0xFFFFFFFF);
		this._triangleDoubleSidedFlag = new Uint8Array(maxTriangles);
		this._triangleCount = 0;
		this._triangleBoundingSphere = null; // will be allocated in finishMeshBuilding()

		this._lines = new Uint32Array(maxLines * 2);
		this._lineCount = 0;

		// [released in finishMeshBuilding()] a map that finds a vertex by hash, not a multimap. Also see _vertexNextIndexWithSameHash.
		this._vertexSearchMap = new Map();

		// [released in finishMeshBuilding()] _vertexSearchMap + _vertexNextIndexWithSameHash == multimap (kind of)
		this._vertexNextIndexWithSameHash = new Uint32Array(maxTriangles * 3);

		// [released in finishMeshBuilding()] a map that finds triangle/line by its string representation
		this._indexSearchMap = new Map();

		// [released in finishMeshBuilding()] list of triangles that have this vertex
		this._vertexTriangleIndices = new Uint32Array(maxTriangles * 3);

		// [released in finishMeshBuilding()] how many triangles have this vertex - indexing into _vertexTriangleIndices[]
		// 2 values per element: [offset, count]. todo: can store just offset and compute count
		this._vertexTriangleUsage = new Uint32Array(maxTriangleVertices * 2);
	}

	// compares two 3d points
	MeshAnalyzer.prototype._pointsEqual = function(p0, p1) {
		return (p0[0] === p1[0]) && (p0[1] === p1[1]) && (p0[2] === p1[2]);
	};

	MeshAnalyzer.prototype._hashTypedArray = function(p) {
		var uint8 = new Uint8Array(p.buffer);
		// FNV1a hash - http://isthe.com/chongo/tech/comp/fnv/
		var val = 0x811c9dc5;
		for (var i = 0, count = uint8.length; i < count; ++i) {
			val ^= uint8[i];
			val += (val << 1) + (val << 4) + (val << 7) + (val << 8) + (val << 24); // cannot multiply by prime, because var is 53bit float, not 32 bit int
		}
		return val >>> 0;
	};

	// finds or adds a point to vertices[] and returns an index to it
	MeshAnalyzer.prototype._addVertex = function(v) {
		// note: this._vertexSearchMap and this._vertexNextIndexWithSameHash must not be null, see finishMeshBuilding()
		var hash = this._hashTypedArray(v);
		var predIndex;
		var index = this._vertexSearchMap.get(hash);
		var offset;
		if (index !== undefined) {
			// there can be multiple vertices with the same hash, we need to check them all
			do {
				offset = index * 3;
				if ((this._vertices[offset] === v[0]) && (this._vertices[offset + 1] === v[1]) && (this._vertices[offset + 2] === v[2])) {
					return index;
				}

				predIndex = index;
				index = this._vertexNextIndexWithSameHash[index];
			} while (index > 0);
		}

		offset = this._vertexCount * 3;
		this._vertices[offset] = v[0];
		this._vertices[offset + 1] = v[1];
		this._vertices[offset + 2] = v[2];
		if (predIndex !== undefined) {
			this._vertexNextIndexWithSameHash[predIndex] = this._vertexCount;
		} else {
			this._vertexSearchMap.set(hash, this._vertexCount);
		}

		return this._vertexCount++;
	};

	// release some temporary structures and postprocess
	MeshAnalyzer.prototype._finishMeshBuildingPart1 = function() {
		this._vertexSearchMap = undefined;
		this._vertexNextIndexWithSameHash = undefined;
		this._indexSearchMap = undefined;

		this._buildVertexTriangleUsage();
		this._buildFaceIds();
		var edgesCount = this._buildEdges();
		return edgesCount;
	};

	// release some temporary structures and postprocess
	MeshAnalyzer.prototype._finishMeshBuildingPart2 = function(edgesCount) {
		this._vertexTriangleIndices = undefined;
		this._vertexTriangleUsage = undefined;

		this._buildEdgeIds(edgesCount);

		this._triangleBoundingSphere = new Float64Array(this._triangleCount * 4); // x, y, z, r bounding sphere of each triangle for fast intersection maths
		this._computeBoundingSpheres();
	};

	// release some temporary structures and postprocess, cannot call addTriangle() and addLine() after this
	MeshAnalyzer.prototype.finishMeshBuilding = function() {
		var edgesCount = this._finishMeshBuildingPart1();
		this._finishMeshBuildingPart2(edgesCount);
	};

	// fill the array of triangle indices per vertex (each vertex will have 1..n triangles)
	// returns the maximum number of triangles per vertex (needed for building edges)
	MeshAnalyzer.prototype._buildVertexTriangleUsage = function() {
		// 1st pass: compute offsets
		var total = 0;
		var count = this._vertexCount;
		var i;
		for (i = 0; i < count; ++i) {
			this._vertexTriangleUsage[i * 2] = total;
			total += this._vertexTriangleUsage[i * 2 + 1];
			this._vertexTriangleUsage[i * 2 + 1] = 0;
		}

		// 2nd pass: fill the data
		var vertexIndex;
		var offset;
		var j;
		var _triangleCount = this._triangleCount;
		for (i = 0; i < _triangleCount; ++i) {
			for (j = 0; j < 3; ++j) {
				vertexIndex = this._triangles[i * 3 + j];
				count = this._vertexTriangleUsage[vertexIndex * 2 + 1];
				offset = this._vertexTriangleUsage[vertexIndex * 2] + count;
				this._vertexTriangleIndices[offset] = i;
				count++;
				this._vertexTriangleUsage[vertexIndex * 2 + 1] = count;
			}
		}
	};

	// fill "edges" data for _vertexToVertexIndices/_vertexToVertexConnectivity
	MeshAnalyzer.prototype._buildEdges = function() {
		var indexCount = 0;
		var firstIndex;
		var lastIndex;
		var triangleIndex;
		var realTriangleOffset;
		var i;
		var currentVertex;
		var lineIndex;
		var v0;
		var v1;
		var _lineCount = this._lineCount;
		var start;
		var triangleFaceId;
		var connected = new Set();
		var vertexToVertexIndices = this._vertexToVertexIndices;
		var name;

		var addVertexIndices = function(value) {
			vertexToVertexIndices[indexCount] = Number(value.split(":")[0]);
			indexCount++;
		};

		for (var vertexIndex = 0, _vertexCount = this._vertexCount; vertexIndex < _vertexCount; ++vertexIndex) {
			this._vertexToVertexConnectivity[vertexIndex * 2] = indexCount;
			start = indexCount;

			// the main idea of below code is to find all possible edges on triangles that share a given vertex
			// but it is important to skip adding edges between triangles that have the same face id
			firstIndex = this._vertexTriangleUsage[vertexIndex * 2];
			lastIndex = firstIndex + this._vertexTriangleUsage[vertexIndex * 2 + 1];
			connected.clear();
			for (triangleIndex = firstIndex; triangleIndex < lastIndex; ++triangleIndex) {
				realTriangleOffset = this._vertexTriangleIndices[triangleIndex];
				triangleFaceId = this._triangleFaceId[realTriangleOffset];
				realTriangleOffset *= 3;
				for (i = 0; i < 3; ++i) {
					currentVertex = this._triangles[realTriangleOffset + i];
					if (currentVertex !== vertexIndex) {
						name = currentVertex + ":" + triangleFaceId;
						if (connected.has(name)) {
							// if we have the same edge with same face id coming from another triangle, then we don't want this edge
							connected.delete(name);
						} else {
							connected.add(name);
						}
					}
				}
			}

			connected.forEach(addVertexIndices);

			// also add all vertex to vertex connections that come from polylines
			for (lineIndex = 0; lineIndex < _lineCount; ++lineIndex) {
				v0 = this._lines[lineIndex * 2];
				v1 = this._lines[lineIndex * 2 + 1];
				if (v0 === vertexIndex) {
					vertexToVertexIndices[indexCount] = v1;
					indexCount++;
				} else if (v1 === vertexIndex) {
					vertexToVertexIndices[indexCount] = v0;
					indexCount++;
				}
			}

			this._vertexToVertexConnectivity[vertexIndex * 2 + 1] = indexCount - start;
		}

		return indexCount;
	};

	// adding triangle soup, one triangle at a time, performing join equal points and finding degenerates
	// returns negative value in case of an error or the triangle index if all ok
	MeshAnalyzer.prototype.addTriangle = function(p0, p1, p2) {
		if (this._triangleCount * 3 + 3 > this._triangles.length) {
			return -1; // buffer overflow
		}

		tempV0.set([p0[0], p0[1], p0[2]]);
		tempV1.set([p1[0], p1[1], p1[2]]);
		tempV2.set([p2[0], p2[1], p2[2]]);
		if (this._pointsEqual(tempV0, tempV1) || this._pointsEqual(tempV0, tempV2) || this._pointsEqual(tempV1, tempV2)) {
			return -2;
		}

		if (Utils.isDegenerateTriangle(tempV0, tempV1, tempV2)) {
			return -3;
		}

		var i0 = this._addVertex(tempV0);
		var i1 = this._addVertex(tempV1);
		var i2 = this._addVertex(tempV2);

		// find the indexing with minimum first index out of 012, 120, 201 combinations (preserving winding)
		var indices = [i2, i0, i1]; // note: ascending order is important
		if (i0 < i1) {
			if (i0 < i2) {
				indices = [i0, i1, i2];
			}
		} else if (i1 < i2) {
			indices = [i1, i2, i0];
		}

		var id = indices[0] + ":" + indices[1] + ":" + indices[2];
		var foundIndex = this._indexSearchMap.get(id);
		if (foundIndex !== undefined) {
			return foundIndex; // exactly the same triangle already exists
		}

		foundIndex = this._indexSearchMap.get(indices[0] + ":" + indices[2] + ":" + indices[1]);
		if (foundIndex !== undefined) {
			this._triangleDoubleSidedFlag[foundIndex] = true;
			return foundIndex; // same triangle with reversed winding (double sided mesh)
		}

		this._indexSearchMap.set(id, this._triangleCount);
		var offset = this._triangleCount * 3;
		this._triangles[offset] = indices[0];
		this._triangles[offset + 1] = indices[1];
		this._triangles[offset + 2] = indices[2];
		this._vertexTriangleUsage[i0 * 2 + 1]++;
		this._vertexTriangleUsage[i1 * 2 + 1]++;
		this._vertexTriangleUsage[i2 * 2 + 1]++;
		return this._triangleCount++;
	};

	// adding line soup, one line at a time, performing join equal points and finding degenerates
	MeshAnalyzer.prototype.addLine = function(p0, p1) {
		if (this._lineCount * 2 + 2 > this._lines.length) {
			return -1; // buffer overflow
		}

		tempV0.set([p0[0], p0[1], p0[2]]);
		tempV1.set([p1[0], p1[1], p1[2]]);
		if (this._pointsEqual(tempV0, tempV1)) {
			return -2;
		}

		var i0 = this._addVertex(tempV0);
		var i1 = this._addVertex(tempV1);
		var indices = (i0 < i1) ? [i0, i1] : [i1, i0]; // note: ascending order is important
		var id = indices[0] + ":" + indices[1];
		var foundIndex = this._indexSearchMap.get(id);
		if (foundIndex !== undefined) {
			return foundIndex; // exactly the same line already exists
		}

		this._indexSearchMap.set(id, this._lineCount);
		var offset = this._lineCount * 2;
		this._lines[offset] = indices[0];
		this._lines[offset + 1] = indices[1];
		return this._lineCount++;
	};

	MeshAnalyzer.prototype._buildFaceIds = function() {
		var found = new Uint8Array(this._triangleCount); // will be all filled with "true" once building finishes
		var recursionStack = [];
		var initialIsDoubleSided;
		var initialNormal;
		var tri;
		var offset;
		var vi;
		var v0;
		var v1;
		var v2;
		var trianglesFrom;
		var trianglesTo;
		var i;
		var checkTriangleIndex;
		var adjacent;
		var checkTriangleOffset;
		var j;
		var vertexIndex;

		var currentFaceId = 0;
		// go through all triangles and classify them
		for (var triangleIndex = 0, _triangleCount = this._triangleCount; triangleIndex < _triangleCount; ++triangleIndex) {
			if (found[triangleIndex] === 0) {
				initialIsDoubleSided = this.isTriangleDoubleSided(triangleIndex);
				initialNormal = this.computeTriangleNormal(triangleIndex);
				this._triangleFaceId[triangleIndex] = currentFaceId;
				recursionStack.push(triangleIndex);

				// use stack instead of recursion calling
				while (recursionStack.length > 0) {
					tri = recursionStack.pop();
					found[tri] = 1;

					// check all triangles connected to each of the 3 vertices of current tri
					offset = tri * 3;
					for (vi = 0; vi < 3; ++vi) {
						v0 = this._triangles[offset + vi];
						v1 = this._triangles[offset + (vi + 1) % 3];
						v2 = this._triangles[offset + (vi + 2) % 3];

						trianglesFrom = this._vertexTriangleUsage[v0 * 2];
						trianglesTo = trianglesFrom + this._vertexTriangleUsage[v0 * 2 + 1];
						for (i = trianglesFrom; i < trianglesTo; ++i) {
							checkTriangleIndex = this._vertexTriangleIndices[i];

							// verify that this triangle is adjacent to our one
							adjacent = false;
							checkTriangleOffset = checkTriangleIndex * 3;
							for (j = 0; j < 3; ++j) {
								vertexIndex = this._triangles[checkTriangleOffset + j];
								if ((vertexIndex === v1) || (vertexIndex === v2)) {
									adjacent = true;
								}
							}

							if (adjacent && !found[checkTriangleIndex] && this._triangleFaceId[checkTriangleIndex] !== currentFaceId) {
								this._triangleFaceId[checkTriangleIndex] = currentFaceId; // so that we dont check same triangle many times in one iteration
								if (Utils.compareNormal(initialNormal, this.computeTriangleNormal(checkTriangleIndex), initialIsDoubleSided || this.isTriangleDoubleSided(checkTriangleIndex))) {
									recursionStack.push(checkTriangleIndex);
								}
							}
						}
					}
				}

				currentFaceId++;
			}
		}
	};

	MeshAnalyzer.prototype._buildEdgeIds = function(edgesCount) {
		// note: edge ids start with 1. "0" means not initialized
		// edge ids also encode direction, negative direction would have negative id
		// for example, values of "4" and "-4" belong to the same edgeId
		this._vertexToVertexEdgeId = new Int32Array(edgesCount);

		var found = new Uint8Array(edgesCount);
		var currentEdgeId = 1;
		var predPoint = new Float64Array(3);
		var curPoint = new Float64Array(3);
		var direction = new Float64Array(3);
		var currentDirection = new Float64Array(3);

		var edgesFrom;
		var edgesTo;
		var edgeIndex;
		var v1i;
		var pred;
		var cur;
		var pass;
		var keepGoing;
		var checkEdgesFrom;
		var checkEdgesTo;
		var checkEdgeIndex;
		var other;

		// go through all vertices and then edges starting from those vertices and classify the edges
		for (var v0i = 0, _vertexCount = this._vertexCount; v0i < _vertexCount; ++v0i) {
			predPoint.set(this.getVertex(v0i));
			edgesFrom = this._vertexToVertexConnectivity[v0i * 2];
			edgesTo = edgesFrom + this._vertexToVertexConnectivity[v0i * 2 + 1];
			for (edgeIndex = edgesFrom; edgeIndex < edgesTo; ++edgeIndex) {
				if (found[edgeIndex] === 0) {
					// start a new edge classification: we have v0-v1, let's see how we can extend it
					found[edgeIndex] = 1;
					v1i = this._vertexToVertexIndices[edgeIndex];
					if (v1i < v0i) {
						// we don't want two sets of edges, like v0-v1 and v1-v0 (same, but reversed)
						this._vertexToVertexEdgeId[edgeIndex] = 0; // important: make sure we clean the temp data
						continue;
					}

					this._vertexToVertexEdgeId[edgeIndex] = currentEdgeId;
					pred = v0i;
					cur = v1i;
					curPoint.set(this.getVertex(cur));
					Utils.computeEdgeDirection(predPoint, curPoint, direction);
					predPoint.set(curPoint);

					// extend v0-v1 first, then extend v1-v0 (opposite direction)
					for (pass = 0; pass < 2; ++pass) {
						keepGoing = true;
						while (keepGoing) {
							keepGoing = false;
							checkEdgesFrom = this._vertexToVertexConnectivity[cur * 2];
							checkEdgesTo = checkEdgesFrom + this._vertexToVertexConnectivity[cur * 2 + 1];

							// loop all edges in "cur" vertex
							for (checkEdgeIndex = checkEdgesFrom; checkEdgeIndex < checkEdgesTo; ++checkEdgeIndex) {
								other = this._vertexToVertexIndices[checkEdgeIndex];
								if (other !== pred && found[checkEdgeIndex] === 0 && this._vertexToVertexEdgeId[checkEdgeIndex] !== currentEdgeId) {
									this._vertexToVertexEdgeId[checkEdgeIndex] = currentEdgeId;
									curPoint.set(this.getVertex(other));
									Utils.computeEdgeDirection(predPoint, curPoint, currentDirection);

									// check if "pred-other" is parallel to "v0-v1"
									if (Utils.compareNormal(direction, currentDirection)) {
										pred = cur;
										cur = other;
										found[checkEdgeIndex] = 1;
										predPoint.set(curPoint);
										keepGoing = true;
										if (pass > 0) {
											// special case: moving in the "back" direction. swap the sign of edge id
											this._vertexToVertexEdgeId[checkEdgeIndex] = -this._vertexToVertexEdgeId[checkEdgeIndex];
										}
										break;
									}
								}
							}
						}

						// prepare for another pass in opposite direction
						pred = v1i;
						cur = v0i;
						predPoint.set(this.getVertex(v0i));
						direction[0] = -direction[0];
						direction[1] = -direction[1];
						direction[2] = -direction[2];
					}

					currentEdgeId++;
				}
			}
		}
	};

	// precompute bounding spheres for each triangle
	MeshAnalyzer.prototype._computeBoundingSpheres = function() {
		var vertexOffset = 0;
		var sphereOffset = 0;
		var v0;
		var v1;
		var v2;
		for (var i = 0, count = this._triangleCount; i < count; ++i) {
			v0 = this.getVertex(this._triangles[vertexOffset]);
			v1 = this.getVertex(this._triangles[vertexOffset + 1]);
			v2 = this.getVertex(this._triangles[vertexOffset + 2]);
			Utils.computeTriangleBoundingSphere(v0, v1, v2, this._triangleBoundingSphere, sphereOffset);

			vertexOffset += 3;
			sphereOffset += 4;
		}
	};

	// finds the closest face (set of triangles), edge (set of edges) and vertex to the sphere and their distances
	// note: the face, edge and vertex may actually be from different triangles (if there are more than 1 triangles within the sphere radius)
	MeshAnalyzer.prototype.intersectSphere = function(position, radius, allowFace, allowEdge, allowVertex, _allowClosedContour, _allowCurvedEdge) {
		var v0 = tempTriangle.subarray(0, 3);
		var v1 = tempTriangle.subarray(3, 6);
		var v2 = tempTriangle.subarray(6, 9);

		var ret = {
			faceId: null,
			faceDistance: null, // squared distance to avoid costly sqrt()

			edgeId: null,
			edgeDistance: null, // squared distance to avoid costly sqrt()

			vertexId: null,
			vertexDistance: null // squared distance to avoid costly sqrt()
		};

		var closestEdgeVertex0 = null;
		var closestEdgeVertex1 = null;

		var dist;
		var t;
		var nearestPoint;
		var triangleDistance;
		var j;
		var tj;
		var k;
		var tk;
		var edgeDistance;
		var vertexDistance;
		var radius2 = radius * radius;
		var allowEdgesOrVertices = allowEdge || allowVertex;

		for (var i = 0, _triangleCount = this._triangleCount; i < _triangleCount; ++i) {
			// todo: a sphere hierarchy would give better speedup (but will add more complexity to the code)
			dist = Utils.computePointToPointDistance(this._triangleBoundingSphere, position, i * 4);
			if (dist > (radius + this._triangleBoundingSphere[i * 4 + 3])) {
				continue; // intersection not possible, because even the triangle's bounding sphere does not intersect
			}

			for (t = 0; t < 3; t++) {
				tempVertexIndices[t] = this._triangles[i * 3 + t];
			}

			v0.set(this.getVertex(tempVertexIndices[0]));
			v1.set(this.getVertex(tempVertexIndices[1]));
			v2.set(this.getVertex(tempVertexIndices[2]));

			if (allowFace) {
				nearestPoint = Utils.getNearestPointOnTriangle(tempTriangle, position);
				triangleDistance = Utils.computePointToPointDistance2(nearestPoint, position);

				if (triangleDistance > radius2) {
					// if triangle is not intersecting, then none of vertices/edges are intersecting it either
					continue;
				}

				if (!ret.faceDistance || triangleDistance < ret.faceDistance) {
					ret.faceDistance = triangleDistance;
					ret.faceId = this._triangleFaceId[i];
				}
			}

			if (allowEdgesOrVertices) {
				for (j = 0; j < 3; ++j) {
					if (j === 0) {
						tj = v0;
					} else if (j === 1) {
						tj = v1;
					} else {
						tj = v2;
					}

					if (allowEdge) {
						k = (j + 1) % 3; // k is 2nd vertex in the edge
						if (k === 0) {
							tk = v0;
						} else if (k === 1) {
							tk = v1;
						} else {
							tk = v2;
						}

						edgeDistance = Utils.computeEdgeToPointDistance2(tj, tk, position);
						if ((edgeDistance <= radius2) && (!ret.edgeDistance || edgeDistance < ret.edgeDistance)) {
							ret.edgeDistance = edgeDistance;
							closestEdgeVertex0 = tempVertexIndices[j];
							closestEdgeVertex1 = tempVertexIndices[k];
						}
					}

					if (allowVertex) {
						vertexDistance = Utils.computePointToPointDistance2(tj, position);
						if ((vertexDistance <= radius2) && (!ret.vertexDistance || vertexDistance < ret.vertexDistance)) {
							ret.vertexDistance = vertexDistance;
							ret.vertexId = tempVertexIndices[j];
						}
					}
				}
			}
		}

		if (ret.edgeDistance !== null) {
			ret.edgeId = this.getEdgeId(closestEdgeVertex0, closestEdgeVertex1);
		}

		return ret;
	};

	// finds the edge id given two vertices of this edge
	// note: edge ids are only set on edges where v0 < v1, because otherwise we would have exactly twice the number of edges
	MeshAnalyzer.prototype.getEdgeId = function(vertexIndex0, vertexIndex1) {
		var v = (vertexIndex0 < vertexIndex1) ? [vertexIndex0, vertexIndex1] : [vertexIndex1, vertexIndex0];
		var edgesFrom = this._vertexToVertexConnectivity[v[0] * 2];
		var edgesTo = edgesFrom + this._vertexToVertexConnectivity[v[0] * 2 + 1];
		for (var edgeIndex = edgesFrom; edgeIndex < edgesTo; ++edgeIndex) {
			if (v[1] === this._vertexToVertexIndices[edgeIndex]) {
				var edgeId = this._vertexToVertexEdgeId[edgeIndex];
				return edgeId < 0 ? -edgeId : edgeId; // we're using the sign of edge id for "direction" flag
			}
		}

		return null;
	};

	// returns all vertices of the edge (a path for SVG rendering)
	MeshAnalyzer.prototype.buildEdgePath = function(edgeId, onlyFirstAndLast) {
		var path = [];

		// part 1: find first edge with this index, that will be the start of our path
		var v0i = 0;
		var currentForward = null;
		var currentBackward = null;
		var edgesFrom;
		var edgesTo;
		var edgeIndex;
		var vert;
		var eid;
		var reverseEdgeId = -edgeId;

		while (v0i < this._vertexCount) {
			edgesFrom = this._vertexToVertexConnectivity[v0i * 2];
			edgesTo = edgesFrom + this._vertexToVertexConnectivity[v0i * 2 + 1];
			for (edgeIndex = edgesFrom; edgeIndex < edgesTo; ++edgeIndex) {
				eid = this._vertexToVertexEdgeId[edgeIndex];
				if (eid === edgeId) {
					currentForward = this._vertexToVertexIndices[edgeIndex];
				} else if (eid === reverseEdgeId) {
					currentBackward = this._vertexToVertexIndices[edgeIndex];
				}
			}

			if (currentForward) {
				vert = this.getVertex(v0i);
				path.push(vert[0]);
				path.push(vert[1]);
				path.push(vert[2]);
				break;
			}

			v0i++;
		}

		// part 2: follow the edge until it stops
		while (currentForward) {
			edgesFrom = this._vertexToVertexConnectivity[currentForward * 2];
			edgesTo = edgesFrom + this._vertexToVertexConnectivity[currentForward * 2 + 1];
			vert = this.getVertex(currentForward);
			if (onlyFirstAndLast && path.length === 6) {
				// if it's a straight edge, we don't really need all the internal vertices of the path
				path[3] = vert[0];
				path[4] = vert[1];
				path[5] = vert[2];
			} else {
				// for curved edges, we obviously need all the vertices
				path.push(vert[0]);
				path.push(vert[1]);
				path.push(vert[2]);
			}
			currentForward = null;

			for (edgeIndex = edgesFrom; edgeIndex < edgesTo; ++edgeIndex) {
				if (this._vertexToVertexEdgeId[edgeIndex] === edgeId) {
					currentForward = this._vertexToVertexIndices[edgeIndex];
					break;
				}
			}
		}

		// part 3: see if we can trace the starting edge in the reverse direction
		while (currentBackward) {
			edgesFrom = this._vertexToVertexConnectivity[currentBackward * 2];
			edgesTo = edgesFrom + this._vertexToVertexConnectivity[currentBackward * 2 + 1];
			vert = this.getVertex(currentBackward);
			if (onlyFirstAndLast && path.length === 6) {
				path[0] = vert[0];
				path[1] = vert[1];
				path[2] = vert[2];
			} else {
				// todo: unshift is not a good idea for long edges. instead use a separate array and then join
				path.unshift(vert[0], vert[1], vert[2]);
			}
			currentBackward = null;

			for (edgeIndex = edgesFrom; edgeIndex < edgesTo; ++edgeIndex) {
				if (this._vertexToVertexEdgeId[edgeIndex] === reverseEdgeId) {
					currentBackward = this._vertexToVertexIndices[edgeIndex];
					break;
				}
			}
		}

		return path;
	};

	MeshAnalyzer.prototype.buildFace = function(faceId) {
		var triangleCount = this._triangleCount;
		var triangleFaceId = this._triangleFaceId;
		var triangleBoundingSphere = this._triangleBoundingSphere;
		var triangles = this._triangles;
		var newVertexCount = 0;
		var vertices = this._vertices;
		var planeEquation = [1, 0, 0, 0];

		// we will be copying a subset of vertices into the newly created "face"
		var newVertexIndex = new Uint32Array(this._vertexCount);

		// count how many triangles belong to this face
		var count = 0;
		var i;
		for (i = 0; i < triangleCount; ++i) {
			if (triangleFaceId[i] === faceId) {
				count++;
			}
		}

		// fill the array
		var newIndices = new Uint32Array(count * 3);
		var boundingSpheres = new Float64Array(count * 4);
		var edges = new Set();
		var j;
		var k;
		var oldVertexIndex;
		var ni;
		var s;
		count = 0;
		for (i = 0; i < triangleCount; ++i) {
			if (triangleFaceId[i] === faceId) {
				// we need this triangle in the "face"
				for (j = 0; j < 3; ++j) {
					oldVertexIndex = triangles[i * 3 + j];
					ni = newVertexIndex[oldVertexIndex];
					if (ni === 0) {
						++newVertexCount; // deliberately increment before assignment to keep "0" value as "non-initialized"
						newVertexIndex[oldVertexIndex] = newVertexCount;
						ni = newVertexCount;
					}

					newIndices[count * 3 + j] = ni - 1;
				}

				// copy bounding sphere info
				for (j = 0; j < 4; ++j) {
					boundingSpheres[count * 4 + j] = triangleBoundingSphere[i * 4 + j];
				}

				// build edges
				for (j = 0; j < 3; ++j) {
					k = newIndices[count * 3 + j];
					ni = newIndices[count * 3 + ((j + 1) % 3)];
					if (k < ni) {
						s = k + ":" + ni;
					} else {
						s = ni + ":" + k;
					}

					if (edges.has(s)) {
						edges.delete(s);
					} else {
						edges.add(s);
					}
				}

				if (count === 0) {
					// compute plane equation for the first triangle in the face
					var o0 = triangles[i * 3] * 3;
					var o1 = triangles[i * 3 + 1] * 3;
					var o2 = triangles[i * 3 + 2] * 3;
					planeEquation = Utils.computePlaneEquation(vertices, o0, o1, o2);
				}

				count++;
			}
		}

		// copy vertices
		var newVertices = new Float64Array(newVertexCount * 3);
		for (i = 0, count = this._vertexCount; i < count; ++i) {
			ni = newVertexIndex[i];
			if (ni !== 0) {
				j = (ni - 1) * 3;
				k = i * 3;
				newVertices[j] = vertices[k];
				newVertices[j + 1] = vertices[k + 1];
				newVertices[j + 2] = vertices[k + 2];
			}
		}

		// copy edges (note: can use a uint32 array for edges, but is Set::size() fast?)
		var remaining = [];
		edges.forEach(function(value) {
			ni = value.split(":");
			remaining.push(Number(ni[0]));
			remaining.push(Number(ni[1]));
		});

		return {
			vertices: newVertices,
			triangles: newIndices,
			boundingSpheres: boundingSpheres,
			edges: remaining,
			planeEquation: planeEquation
		};
	};

	MeshAnalyzer.prototype.getTriangleCount = function() {
		return this._triangleCount;
	};

	MeshAnalyzer.prototype.getLineCount = function() {
		return this._lineCount;
	};

	MeshAnalyzer.prototype.getVertexCount = function() {
		return this._vertexCount;
	};

	MeshAnalyzer.prototype.isTriangleDoubleSided = function(index) {
		return this._triangleDoubleSidedFlag[index] > 0;
	};

	MeshAnalyzer.prototype.getVertex = function(index) {
		var i3 = index * 3;
		return [this._vertices[i3], this._vertices[i3 + 1], this._vertices[i3 + 2]];
	};

	MeshAnalyzer.prototype.computeTriangleNormal = function(index) {
		var o0 = this._triangles[index * 3] * 3;
		var o1 = this._triangles[index * 3 + 1] * 3;
		var o2 = this._triangles[index * 3 + 2] * 3;

		var v0 = [this._vertices[o0], this._vertices[o0 + 1], this._vertices[o0 + 2]];
		var u = Utils.pointMinusPoint(this._vertices, v0, o1);
		var v = Utils.pointMinusPoint(this._vertices, v0, o2);
		var n = Utils.crossProduct(u, v);
		var d = Utils.dotProduct(n, n);
		if (d === 0.0) {
			return [1, 0, 0];
		}

		d = 1.0 / Math.sqrt(d);
		return [n[0] * d, n[1] * d, n[2] * d];
	};

	return MeshAnalyzer;
});
