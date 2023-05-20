/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/base/Log",
	"../getResourceBundle"
], function(
	Log,
	getResourceBundle
) {
	"use strict";

	var koeffZeroMagnitude2 = 0.000001;
	var koeffZeroDistance2 = 0.000001;
	var koeffDegenerateTriangle = 0.000001;
	var koeffSmallNum = 0.00000001;
	var koeffParallel = 0.00001;
	var tempTriangle = new Float64Array(9);
	var PI2 = 2 * Math.PI;

	var Utils = {};

	// compares two normals (supports an option for "double sided" normals)
	Utils.compareNormal = function(n1, n2, allowDoubleSided) {
		if (Utils.computePointToPointDistance2(n1, n2) < koeffZeroMagnitude2) {
			return true;
		}

		if (allowDoubleSided) {
			var d = Utils.pointPlusPoint(n1, n2);
			if (Utils.magnitude2(d) < koeffZeroMagnitude2) {
				return true;
			}
		}

		return false;
	};

	// computes (v1 - v0).normalize() and puts into "result" if result is specified or returns it if "result" is not specified
	Utils.computeEdgeDirection = function(v0, v1, result) {
		var xyz = Utils.normalize(Utils.pointMinusPoint(v1, v0)); // not expecting v0==v1 here as we've done join equal points
		if (result) {
			result[0] = xyz[0];
			result[1] = xyz[1];
			result[2] = xyz[2];
			return null;
		}

		return xyz;
	};

	// multiplies vector by a scalar
	Utils.scalePoint = function(a, scale) {
		return [scale * a[0], scale * a[1], scale * a[2]];
	};

	// normalizes a vector
	Utils.normalize = function(a) {
		var d = Utils.magnitude2(a);
		d = (d < koeffZeroMagnitude2) ? 1.0 : 1.0 / Math.sqrt(d);
		return Utils.scalePoint(a, d);
	};

	// dot product of vectors A and A (squared magnitude), always positive return value
	Utils.magnitude2 = function(a) {
		return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
	};

	// dot product of vectors A and B
	Utils.dotProduct = function(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	// cross product of vectors A and B
	Utils.crossProduct = function(a, b) {
		return [(a[1] * b[2]) - (a[2] * b[1]), (a[2] * b[0]) - (a[0] * b[2]), (a[0] * b[1]) - (a[1] * b[0])];
	};

	// exact compare two points
	Utils.equalPoints = function(p1, o1, p2, o2) {
		return p1[o1] === p2[o2] && p1[o1 + 1] === p2[o2 + 1] && p1[o1 + 2] === p2[o2 + 2];
	};

	// angle in radians between 2 vectors (can be unnormalized)
	Utils.angleBetweenVectors2D = function(ax, ay, bx, by) {
		var dot = ax * bx + ay * by;
		var mod = Math.sqrt((ax * ax + ay * ay) * (bx * bx + by * by));
		if (mod < koeffSmallNum) {
			Log.error("Degenerate angle: ax=" + ax + " ay=" + ay + " bx=" + bx + " by=" + by);
			return 0;
		}

		var a = dot / mod;
		if (a < -1) {
			a = -1;
		} else if (a > 1) {
			a = 1;
		}

		var angle = Math.acos(a);
		return (ax * by < ay * bx) ? -angle : angle;
	};

	// todo: is there a simpler way to detect this? [for now just keeping in line with computeTriangleBoundingSphere()]
	Utils.isDegenerateTriangle = function(a, b, c) {
		var ba = Utils.pointMinusPoint(b, a);
		var ca = Utils.pointMinusPoint(c, a);
		var dotABAB = Utils.dotProduct(ba, ba);
		var dotABAC = Utils.dotProduct(ba, ca);
		var dotACAC = Utils.dotProduct(ca, ca);
		var d = 2.0 * (dotABAB * dotACAC - dotABAC * dotABAC);
		return Math.abs(d) <= koeffDegenerateTriangle;
	};

	// computes position and radius of a sphere with minimum radius that has triangle ABC inside of it
	// and puts the (x,y,z,r) into result[resultOffset]
	Utils.computeTriangleBoundingSphere = function(a, b, c, result, resultOffset) {
		var ba = Utils.pointMinusPoint(b, a);
		var ca = Utils.pointMinusPoint(c, a);
		var dotABAB = Utils.dotProduct(ba, ba);
		var dotABAC = Utils.dotProduct(ba, ca);
		var dotACAC = Utils.dotProduct(ca, ca);
		var d = 2.0 * (dotABAB * dotACAC - dotABAC * dotABAC);

		var r = [a[0], a[1], a[2]];
		var xyz;

		if (Math.abs(d) <= koeffDegenerateTriangle) {
			Log.error("Degenerate triangle detected! All 3 points on the same line: (" + a + ") (" + b + ") (" + c + ")");
			// note: in theory we can compute AABB from 3 vertices and set rx,ry,rz to bbox.min and x,y,z to bbox.center
			xyz = [r[0], r[1], r[2]];
		} else {
			var s = (dotABAB * dotACAC - dotACAC * dotABAC) / d;
			var t = (dotACAC * dotABAB - dotABAB * dotABAC) / d;
			// s controls height over AC, t over AB, (1 - s - t) over BC
			if (s <= 0.0) {
				xyz = [0.5 * (a[0] + c[0]), 0.5 * (a[1] + c[1]), 0.5 * (a[2] + c[2])];
			} else if (t <= 0.0) {
				xyz = [0.5 * (a[0] + b[0]), 0.5 * (a[1] + b[1]), 0.5 * (a[2] + b[2])];
			} else if (s + t >= 1.0) {
				xyz = [0.5 * (b[0] + c[0]), 0.5 * (b[1] + c[1]), 0.5 * (b[2] + c[2])];
				r = [b[0], b[1], b[2]];
			} else {
				xyz = [a[0] + s * ba[0] + t * ca[0], a[1] + s * ba[1] + t * ca[1], a[2] + s * ba[2] + t * ca[2]];
			}
		}

		result[resultOffset] = xyz[0];
		result[resultOffset + 1] = xyz[1];
		result[resultOffset + 2] = xyz[2];

		result[resultOffset + 3] = Utils.computePointToPointDistance(xyz, r);
	};

	// computes a point on triangle that is the closest one to "position"
	Utils.getNearestPointOnTriangle = function(triangle, position) {
		var faceNormal = Utils.normalize(Utils.crossProduct(Utils.pointMinusPoint(triangle, triangle, 3), Utils.pointMinusPoint(triangle, triangle, 6)));
		var p1p0 = Utils.pointMinusPoint(position, triangle);
		var perpDist = Utils.dotProduct(p1p0, faceNormal);
		var p0ProjVec = Utils.scalePoint(faceNormal, -perpDist);
		var p0Proj = Utils.pointPlusPoint(position, p0ProjVec);

		// now we have to test if this point is inside the triangle
		for (var i = 0; i < 3; ++i) {
			var offset = i * 3;
			var point1 = [triangle[offset], triangle[offset + 1], triangle[offset + 2]];
			offset = ((i + 1) % 3) * 3;
			var point2 = [triangle[offset], triangle[offset + 1], triangle[offset + 2]];
			offset = ((i + 2) % 3) * 3;
			var point3 = [triangle[offset], triangle[offset + 1], triangle[offset + 2]];

			// build edges of triangle
			var e12 = Utils.normalize(Utils.pointMinusPoint(point2, point1));
			var e13 = Utils.normalize(Utils.pointMinusPoint(point3, point1));
			var e23 = Utils.normalize(Utils.pointMinusPoint(point3, point2));

			// build bisector vectors
			var v1 = Utils.scalePoint(Utils.pointPlusPoint(e12, e13), -1);
			var v2 = Utils.pointMinusPoint(e12, e23);

			var f1 = Utils.dotProduct(Utils.crossProduct(v1, Utils.pointMinusPoint(p0Proj, point1)), faceNormal);
			var f2 = Utils.dotProduct(Utils.crossProduct(v2, Utils.pointMinusPoint(p0Proj, point2)), faceNormal);
			if (f1 >= 0 && f2 <= 0) {
				var vec1 = Utils.pointMinusPoint(point1, p0Proj);
				var vec2 = Utils.pointMinusPoint(point2, p0Proj);
				if (Utils.dotProduct(Utils.crossProduct(vec1, vec2), faceNormal) < 0) {
					return Utils.projectPointToEdge(point1, point2, p0Proj);
				}
			}
		}

		return p0Proj;
	};

	// samples a point[3] on line[6]
	Utils.pointOnLine = function(l, u) {
		return [l[0] + (l[3] - l[0]) * u, l[1] + (l[4] - l[1]) * u, l[2] + (l[5] - l[2]) * u];
	};

	// returns "u" of the closest distance between line[6] and point[3]
	Utils.projectPointToLine = function(line, point) {
		var v0 = [line[0], line[1], line[2]];
		var v1 = [line[3], line[4], line[5]];
		var v2 = Utils.pointMinusPoint(v1, v0);
		var dotV2 = Utils.magnitude2(v2);
		if (dotV2 < koeffZeroMagnitude2) {
			return 0;
		}

		return Utils.dotProduct(v2, Utils.pointMinusPoint(point, v0)) / dotV2;
	};

	// returns closest point between position and edge v0-v1
	Utils.projectPointToEdge = function(v0, v1, position) {
		var v2 = Utils.pointMinusPoint(v1, v0);
		var dotV2 = Utils.magnitude2(v2);
		if (dotV2 < koeffZeroMagnitude2) {
			return v0;
		}

		var u = Utils.dotProduct(v2, Utils.pointMinusPoint(position, v0)) / dotV2;
		if (u <= 0) {
			return v0;
		}

		if (u >= 1) {
			return v1;
		}

		return [v0[0] + v2[0] * u, v0[1] + v2[1] * u, v0[2] + v2[2] * u];
	};

	// squared distance between edge v0-v1 and point (does not have to be orthogonal)
	Utils.computeEdgeToPointDistance2 = function(v0, v1, position) {
		return Utils.computePointToPointDistance2(Utils.projectPointToEdge(v0, v1, position), position);
	};

	// distance between points A and B (with optional offset into A array)
	Utils.computePointToPointDistance = function(a, b, offsetA) {
		return Math.sqrt(Utils.computePointToPointDistance2(a, b, offsetA));
	};

	Utils.computePointToPointDistance2D = function(a, b, offsetA) {
		return Utils.computePointToPointDistance([a[0], a[1], 0], [b[0], b[1], 0]);
	};

	// squared distance between points A and B (with optional offset into A array)
	Utils.computePointToPointDistance2 = function(a, b, offsetA) {
		var d = Utils.pointMinusPoint(a, b, offsetA);
		return Utils.magnitude2(d);
	};

	// A - B (with optional offset into A array)
	Utils.pointMinusPoint = function(a, b, offsetA) {
		var o = offsetA | 0;
		return [a[o + 0] - b[0], a[o + 1] - b[1], a[o + 2] - b[2]];
	};

	// A + B (with optional offset into A array)
	Utils.pointPlusPoint = function(a, b, offsetA) {
		var o = offsetA | 0;
		return [a[o + 0] + b[0], a[o + 1] + b[1], a[o + 2] + b[2]];
	};

	// computes quadric bezier point (2D version, less operations than 3D)
	Utils.bezierQuadric2D = function(t, p0, p1, p2) {
		var t2 = t * t;
		var mt = 1 - t;
		var mt2 = mt * mt;
		var mtt2 = 2 * mt * t;
		var x = p0[0] * mt2;
		var y = p0[1] * mt2;
		x += p1[0] * mtt2;
		y += p1[1] * mtt2;
		x += p2[0] * t2;
		y += p2[1] * t2;
		return [x, y, 0];
	};

	// computes cubic bezier point (2D version, less operations than 3D)
	Utils.bezierCubic2D = function(t, p0, p1, p2, p3) {
		var t2 = t * t;
		var t3 = t2 * t;
		var mt = 1 - t;
		var mt2 = mt * mt;
		var mt3 = mt2 * mt;
		var mtt21 = 3 * mt2 * t;
		var mtt12 = 3 * mt * t2;
		var x = p0[0] * mt3;
		var y = p0[1] * mt3;
		x += p1[0] * mtt21;
		y += p1[1] * mtt21;
		x += p2[0] * mtt12;
		y += p2[1] * mtt12;
		x += p3[0] * t3;
		y += p3[1] * t3;
		return [x, y, 0];
	};

	// returns closest distance between edge[6] and point[3], returns a point on edge as [3]
	Utils.findClosestPointEdgeToPoint = function(edge, point) {
		return Utils.projectPointToEdge([edge[0], edge[1], edge[2]], [edge[3], edge[4], edge[5]], point);
	};

	// returns closest distance between face and point[3], returns a point on face as [3]
	Utils.findClosestPointFaceToPoint = function(face, point) {
		var vertices = face.vertices;
		var triangles = face.triangles;
		var shortest;
		var best;
		var cur;
		var len;
		var j;
		var o;

		for (var i = 0, count = triangles.length; i < count; i += 3) {
			for (j = 0; j < 3; ++j) {
				o = triangles[i + j] * 3;
				tempTriangle[j * 3] = vertices[o];
				tempTriangle[j * 3 + 1] = vertices[o + 1];
				tempTriangle[j * 3 + 2] = vertices[o + 2];
			}
			cur = Utils.getNearestPointOnTriangle(tempTriangle, point);
			len = Utils.computePointToPointDistance2(cur, point);
			if (!i || len < shortest) {
				shortest = len;
				best = cur;
			}
		}

		return best;
	};

	Utils.computePlaneEquation = function(vertices, o0, o1, o2) {
		var v0 = [vertices[o0], vertices[o0 + 1], vertices[o0 + 2]];
		var u = Utils.pointMinusPoint(vertices, v0, o1);
		var v = Utils.pointMinusPoint(vertices, v0, o2);
		var n = Utils.crossProduct(u, v);
		var d = Utils.dotProduct(n, n);
		if (d !== 0.0) {
			n = Utils.scalePoint(n, 1.0 / Math.sqrt(d));
			return [n[0], n[1], n[2], -Utils.dotProduct(v0, n)];
		}

		return [1, 0, 0, 0];
	};

	// returns a line of intersection between two planes [p1x p1y p1z p2x p2y p2z] or null if parallel
	Utils.intersectPlanes = function(plane1, plane2) {
		var n = Utils.crossProduct(plane1, plane2);
		var d = Utils.magnitude2(n);
		if (d < koeffZeroMagnitude2) {
			return null;
		}

		var p1 = Utils.scalePoint(Utils.pointPlusPoint(Utils.scalePoint(Utils.crossProduct(n, plane2), plane1[3]),
			(Utils.scalePoint(Utils.crossProduct(plane1, n), plane2[3]))), 1 / d);
		var p2 = Utils.pointPlusPoint(p1, n);
		return [p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]];
	};

	// returns 'a' along line1 and 'b' along line2 for the intersection point or null if parallel/coincident/degenerate
	Utils.intersectLines = function(line1, line2) {
		return Utils.findClosestPointEdgeToEdge(line1, line2, true, true);
	};

	// returns 'a' along line1 and 'b' along line2 for the closest point (may not be a real intersection) between lines
	Utils.findClosestPointLineToLine = function(line1, line2) {
		return Utils.findClosestPointEdgeToEdge(line1, line2, true, false);
	};

	// if (!isInfiniteLines) returns closest distance between edge1[6] and edge2[6]: edge1 point and edge2 point as [6]
	// if (isInfiniteLines) returns 'u' along line1 and 'v' along line2 as [2] for the intersection point or null if parallel/coincident/degenerate
	// if (needExactIntersection), then we a check for exact intersection (not just closest points on lines)
	Utils.findClosestPointEdgeToEdge = function(edge1, edge2, isInfiniteLines, needExactIntersection) {
		var u = Utils.pointMinusPoint(edge1, edge1, 3);
		var v = Utils.pointMinusPoint(edge2, edge2, 3);
		var w = Utils.pointMinusPoint(edge1, edge2, 0);

		var a = Utils.dotProduct(u, u); // always >= 0
		var b = Utils.dotProduct(u, v);
		var c = Utils.dotProduct(v, v); // always >= 0
		var d = Utils.dotProduct(u, w);
		var e = Utils.dotProduct(v, w);
		var dd = a * c - b * b; // always >= 0
		var sN, sD = dd; // "u" for line 1 is sN / sD (sD is "determinant")
		var tN, tD = dd; // "v" for line 2 is tN / tD (tD is "determinant")

		// compute the line parameters of the two closest points
		var almostParallel = dd < koeffParallel;
		if (almostParallel) {
			// the lines are almost parallel -> set u and v to 0.5 (center of line segment)
			sN = 0.5;
			sD = 1;
			tN = 0.5;
			tD = 1;
		} else {
			// get the closest points on the infinite lines
			sN = (b * e - c * d);
			tN = (a * e - b * d);
			if (!isInfiniteLines) {
				// limit u to the interval 0..1
				if (sN < 0.0) {
					// intersection is before first point of segement 1
					sN = 0.0;
					tN = e;
					tD = c;
				} else if (sN > sD) {
					// intersection is past second point of segement 1
					sN = sD;
					tN = e + b;
					tD = c;
				}
			}
		}

		if (!isInfiniteLines) {
			// limit v to the interval 0..1
			if (tN < 0.0) {
				// intersection is before first point of segement 2
				tN = 0.0;
				// recompute sc for this edge
				if (-d < 0.0) {
					sN = 0.0;
				} else if (-d > a) {
					sN = sD;
				} else {
					sN = -d;
					sD = a;
				}
			} else if (tN > tD) {
				// intersection is after second point of segement 2
				tN = tD;
				// recompute sc for this edge
				if ((-d + b) < 0.0) {
					sN = 0;
				} else if ((-d + b) > a) {
					sN = sD;
				} else {
					sN = (-d + b);
					sD = a;
				}
			}
		}

		// finally do the division to get sc and tc
		a = Math.abs(sN) < koeffSmallNum; // prefer a clean "0" for u along line1
		b = Math.abs(tN) < koeffSmallNum; // prefer a clean "0" for v along line2
		var sc = a ? 0.0 : sN / sD;
		var tc = b ? 0.0 : tN / tD;

		c = Math.abs(sN - sD) < koeffSmallNum;
		d = Math.abs(tN - tD) < koeffSmallNum;
		if (c) {
			// prefer a clean "1" for u along line1
			sc = 1;
		}
		if (d) {
			// prefer a clean "1" for v along line2
			tc = 1;
		}

		w = Utils.pointOnLine(edge1, sc);
		u = Utils.pointOnLine(edge2, tc);
		dd = Utils.computePointToPointDistance2(w, u);

		if (needExactIntersection && dd > koeffZeroDistance2) {
			return null; // this is not a real intersection in 3D as closest points on line1 and line2 are too far away
		}

		if (isInfiniteLines) {
			// using infinite lines instead of edges, so we only want "u" and "v" as a result
			return almostParallel ? null : [sc, tc];
		}

		if (almostParallel || a || b || c || d) {
			// special case: parallel lines or line start/finish -> need to check endpoints (as they may give better results)

			// 1. test edge2_middle to edge1
			c = Utils.findClosestPointEdgeToPoint(edge1, u);
			a = Utils.computePointToPointDistance2(c, u);

			// 2. test edge1_middle to edge2
			d = Utils.findClosestPointEdgeToPoint(edge2, w);
			b = Utils.computePointToPointDistance2(d, w);

			if (a < b) {
				if ((a + koeffSmallNum) < dd) {
					dd = a;
					for (e = 0; e < 3; ++e) {
						w[e] = c[e];
					}
				}
			} else if ((b + koeffSmallNum) < dd) {
				dd = b;
				for (e = 0; e < 3; ++e) {
					u[e] = d[e];
				}
			}

			// 3. test edge2_start / edge2_end distance to edge1
			for (a = 0; a < 6; a += 3) {
				b = [edge2[a], edge2[a + 1], edge2[a + 2]]; // 'b' is start/end of edge2
				c = Utils.findClosestPointEdgeToPoint(edge1, b);
				d = Utils.computePointToPointDistance2(c, b);
				if ((d + koeffSmallNum) < dd) {
					dd = d;
					for (e = 0; e < 3; ++e) {
						w[e] = c[e];
						u[e] = b[e];
					}
				}
			}

			// 4. test edge1_start / edge1_end start/end distance to edge2
			for (a = 0; a < 6; a += 3) {
				b = [edge1[a], edge1[a + 1], edge1[a + 2]]; // 'b' is start/end of edge1
				c = Utils.findClosestPointEdgeToPoint(edge2, b);
				d = Utils.computePointToPointDistance2(c, b);
				if ((d + koeffSmallNum) < dd) {
					dd = d;
					for (e = 0; e < 3; ++e) {
						w[e] = b[e];
						u[e] = c[e];
					}
				}
			}
		}

		return [w[0], w[1], w[2], u[0], u[1], u[2]];
	};

	// returns closest distance between face and edge[6], returns face point and edge point as [6]
	Utils.findClosestPointFaceToEdge = function(face, edge) {
		var time0 = performance.now();
		var triangles = face.triangles;
		var vertices = face.vertices;
		var edges = face.edges;
		var spheres = face.boundingSpheres;
		var shortest = Number.MAX_VALUE;
		var best;
		var cur;
		var len;
		var i;
		var j;
		var k;
		var count;
		var edgePoint2 = [edge[3], edge[4], edge[5]];

		// step 1: intersect all contour edges of the face with the edge
		for (i = 0, count = edges.length; i < count; i += 2) {
			for (j = 0; j < 2; ++j) {
				k = edges[i + j] * 3;
				tempTriangle[j * 3] = vertices[k];
				tempTriangle[j * 3 + 1] = vertices[k + 1];
				tempTriangle[j * 3 + 2] = vertices[k + 2];
			}

			cur = Utils.findClosestPointEdgeToEdge(tempTriangle, edge);
			len = Utils.computePointToPointDistance2(cur, cur, 3);
			if (len < shortest) {
				shortest = len;
				best = cur;
			}
		}

		// note: we were using squared distance before, now we need the real one
		shortest = Math.sqrt(shortest);

		// compute bounding sphere for the edge
		var center = [(edge[0] + edge[3]) / 2, (edge[1] + edge[4]) / 2, (edge[2] + edge[5]) / 2];
		var radius = Utils.computePointToPointDistance(edge, edge, 3) / 2;
		var o;

		// step 2: compute distance from the 2 edge vertices to face triangles
		var time1 = performance.now() - time0;
		var curPoint;
		for (i = 0, count = triangles.length; i < count; i += 3) {
			// only bother checking this triangle if it can potentially make a better result than what we already have
			len = Utils.computePointToPointDistance(spheres, center, i * 4);
			if (len < (radius + shortest + spheres[i * 4 + 3])) {
				// fill in the triangle data
				for (j = 0; j < 3; ++j) {
					o = triangles[i + j] * 3;
					tempTriangle[j * 3] = vertices[o];
					tempTriangle[j * 3 + 1] = vertices[o + 1];
					tempTriangle[j * 3 + 2] = vertices[o + 2];
				}

				// now check if one of the 2 edge vertices is very close to our triangle
				// todo: check for intersection of edge and triangle (edge points may be far, but edge intersecting triangle right in the middle)
				curPoint = edge;
				for (j = 0; j < 2; ++j) {
					cur = Utils.getNearestPointOnTriangle(tempTriangle, curPoint);
					len = Utils.computePointToPointDistance(cur, curPoint);
					if (len < shortest) {
						shortest = len;
						best[0] = cur[0];
						best[1] = cur[1];
						best[2] = cur[2];
						best[3] = curPoint[0];
						best[4] = curPoint[1];
						best[5] = curPoint[2];
					}

					curPoint = edgePoint2;
				}
			}
		}

		var time2 = performance.now() - time0;
		if (time2 > 10) {
			Log.info("Face[t" + face.triangles.length + "/e" + face.edges.length + "/v" + face.vertices.length
				+ "] distance to Edge in " + time2.toFixed(1) + "ms (" + time1.toFixed(0) + " + " + (time2 - time1).toFixed(0) + ")");
		}

		return best;
	};

	// returns closest distance between face1 and face2, returns face1 point and face2 point as [6]
	Utils.findClosestPointFaceToFace = function(face1, face2) {
		var time0 = performance.now();
		var vertices1 = face1.vertices;
		var vertices2 = face2.vertices;
		var edges1 = face1.edges;
		var edges2 = face2.edges;
		var j;
		var k;
		var ei;
		var ej;
		var count1;
		var count2;
		var len;
		var shortest = Number.MAX_VALUE;
		var cur;
		var best;
		var edge = new Float64Array(6);
		// var edgeSpheres1 = new Float64Array(4 * edges1.length);
		// var edgeSpheres2 = new Float64Array(4 * edges2.length);
		var center;
		var radius;

		// step 0: find bounding spheres for edges of the seconds face
		// for (ei = 0, count1 = edges2.length; ei < count1; ei += 2) {
		// 	// store current edge from face1 in "edge"
		// 	for (j = 0; j < 2; ++j) {
		// 		k = edges2[ei + j] * 3;
		// 		edge[j * 3] = vertices2[k];
		// 		edge[j * 3 + 1] = vertices2[k + 1];
		// 		edge[j * 3 + 2] = vertices2[k + 2];
		// 	}

		// 	// compute bounding sphere for this edge
		// 	center = [(edge[0] + edge[3]) / 2, (edge[1] + edge[4]) / 2, (edge[2] + edge[5]) / 2];
		// 	edgeSpheres2[ei * 4] = center[0];
		// 	edgeSpheres2[ei * 4 + 1] = center[1];
		// 	edgeSpheres2[ei * 4 + 2] = center[2];
		// 	edgeSpheres2[ei * 4 + 3] = Utils.computePointToPointDistance(edge, edge, 3) / 2;
		// }

		// step 1: find shortest distance between all contour edges of face1 and all edges of face2
		for (ei = 0, count1 = edges1.length; ei < count1; ei += 2) {
			// store current edge from face1 in "edge"
			for (j = 0; j < 2; ++j) {
				k = edges1[ei + j] * 3;
				edge[j * 3] = vertices1[k];
				edge[j * 3 + 1] = vertices1[k + 1];
				edge[j * 3 + 2] = vertices1[k + 2];
			}

			// compute bounding sphere for this edge
			// center = [(edge[0] + edge[3]) / 2, (edge[1] + edge[4]) / 2, (edge[2] + edge[5]) / 2];
			// edgeSpheres1[ei * 4] = center[0];
			// edgeSpheres1[ei * 4 + 1] = center[1];
			// edgeSpheres1[ei * 4 + 2] = center[2];
			// radius = Utils.computePointToPointDistance(edge, edge, 3) / 2;
			// edgeSpheres1[ei * 4 + 3] = radius;

			// now loop all edges in face2
			for (ej = 0, count2 = edges2.length; ej < count2; ej += 2) {
				// len = Utils.computePointToPointDistance(edgeSpheres2, center, ej * 4);
				// if (len < (radius + shortest + edgeSpheres2[ej * 4 + 3])) {...}

				// store current edge from face2 in "_triangle"
				for (j = 0; j < 2; ++j) {
					k = edges2[ej + j] * 3;
					tempTriangle[j * 3] = vertices2[k];
					tempTriangle[j * 3 + 1] = vertices2[k + 1];
					tempTriangle[j * 3 + 2] = vertices2[k + 2];
				}

				cur = Utils.findClosestPointEdgeToEdge(edge, tempTriangle);
				len = Utils.computePointToPointDistance2(cur, cur, 3);
				if (len < shortest) {
					shortest = len;
					best = cur;
				}
			}
		}

		// note: we were using squared distance before, now we need the real one
		shortest = Math.sqrt(shortest);

		// There is a rare case when face1 is just above/below the surface of face2, while
		// its edges are far away from edges of face2. We need to account for this (lots of maths).
		var i;
		var curPoint;
		var edgePoint2;

		var edges = face1.edges;
		var edgeVertices = face1.vertices;
		// var edgeSpheres = edgeSpheres1;
		var triangles = face2.triangles;
		var triangleVertices = face2.vertices;
		var spheres = face2.boundingSpheres;

		// step 2(3): find shortest distance between all contour edges of face1(face2) and triangles of face2(face1)
		var time1 = performance.now() - time0;
		for (var pass = 0; pass < 2; ++pass) {
			// var isProcessedAll = new Uint8Array(edgeVertices.length);
			// var isProcessedCurrent = [false, false];

			for (ei = 0, count1 = edges.length; ei < count1; ei += 2) {
				// store current edge from face1 in "edge"
				for (j = 0; j < 2; ++j) {
					k = edges[ei + j];
					// if (isProcessedAll[k]) {
					// 	isProcessedCurrent[j] = true;
					// } else {
					// 	isProcessedCurrent[j] = false;
					// 	isProcessedAll[k] = 1;
					// }

					k *= 3;
					edge[j * 3] = edgeVertices[k];
					edge[j * 3 + 1] = edgeVertices[k + 1];
					edge[j * 3 + 2] = edgeVertices[k + 2];
				}

				edgePoint2 = [edge[3], edge[4], edge[5]];

				// compute edge bounding sphere
				// center = [edgeSpheres[ei * 4], edgeSpheres[ei * 4 + 1], edgeSpheres[ei * 2]];
				center = [(edge[0] + edge[3]) / 2, (edge[1] + edge[4]) / 2, (edge[2] + edge[5]) / 2];
				radius = Utils.computePointToPointDistance(edge, edge, 3) / 2;

				// now loop all triangles of another face
				for (i = 0, count2 = triangles.length; i < count2; i += 3) {
					// only bother checking this triangle if it can potentially make a better result than what we already have
					len = Utils.computePointToPointDistance(spheres, center, i * 4);
					if (len < (radius + shortest + spheres[i * 4 + 3])) {
						// fill in the triangle data
						for (j = 0; j < 3; ++j) {
							k = triangles[i + j] * 3;
							tempTriangle[j * 3] = triangleVertices[k];
							tempTriangle[j * 3 + 1] = triangleVertices[k + 1];
							tempTriangle[j * 3 + 2] = triangleVertices[k + 2];
						}

						// now check if one of the 2 edge vertices is very close to our triangle
						// todo: check for intersection of edge and triangle (edge points may be far, but edge intersecting triangle right in the middle)
						curPoint = edge;
						for (j = 0; j < 2; ++j) {
							// if (isProcessedCurrent[j]) {
							// 	continue;
							// }

							cur = Utils.getNearestPointOnTriangle(tempTriangle, curPoint);
							len = Utils.computePointToPointDistance(cur, curPoint);
							if (len < shortest) {
								shortest = len;
								if (pass > 0) {
									best[0] = cur[0];
									best[1] = cur[1];
									best[2] = cur[2];
									best[3] = curPoint[0];
									best[4] = curPoint[1];
									best[5] = curPoint[2];
								} else {
									best[0] = curPoint[0];
									best[1] = curPoint[1];
									best[2] = curPoint[2];
									best[3] = cur[0];
									best[4] = cur[1];
									best[5] = cur[2];
								}
							}

							curPoint = edgePoint2;
						}
					}
				}
			}

			// prepare for second pass
			edges = face2.edges;
			edgeVertices = face2.vertices;
			// edgeSpheres = edgeSpheres2;
			triangles = face1.triangles;
			triangleVertices = face1.vertices;
			spheres = face1.boundingSpheres;
		}

		var time2 = performance.now() - time0;
		if (time2 > 20) {
			Log.info("Face[t" + face1.triangles.length + "/e" + face1.edges.length + "/v" + face1.vertices.length
				+ "] distance to Face[t" + face2.triangles.length + "/e" + face2.edges.length + "/v" + face2.vertices.length
				+ "] in " + time2.toFixed(1) + "ms (" + time1.toFixed(0) + " + " + (time2 - time1).toFixed(0) + ")");
		}

		return best;
	};

	// checks for contour self intersections
	Utils.hasSelfIntersections = function(p, ignoreLastSegment) {
		var len = p ? (p.length / 3) : 0;
		if (len > 2) {
			var maxIndex = ignoreLastSegment ? (len - 1) : len;
			var j, r, o;
			var e1 = [0, 0, 0, 0, 0, 0];
			var e2 = [0, 0, 0, 0, 0, 0];
			for (var i = 0; i < maxIndex; ++i) {
				o = i * 3;
				e1[0] = p[o];
				e1[1] = p[o + 1];
				e1[2] = p[o + 2];
				o = ((i + 1) % len) * 3;
				e1[3] = p[o];
				e1[4] = p[o + 1];
				e1[5] = p[o + 2];
				for (j = i + 2; j < maxIndex; ++j) {
					o = j * 3;
					e2[0] = p[o];
					e2[1] = p[o + 1];
					e2[2] = p[o + 2];
					o = ((j + 1) % len) * 3;
					e2[3] = p[o];
					e2[4] = p[o + 1];
					e2[5] = p[o + 2];
					if (!Utils.equalPoints(e1, 0, e2, 0) && !Utils.equalPoints(e1, 0, e2, 3)
						&& !Utils.equalPoints(e1, 3, e2, 0) && !Utils.equalPoints(e1, 3, e2, 3)) {
						r = Utils.intersectLines(e1, e2);
						if (r && r[0] > koeffSmallNum && r[0] < (1 - koeffSmallNum) && r[1] > koeffSmallNum && r[1] < (1 - koeffSmallNum)) {
							return true;
						}
					}
				}
			}
		}

		return false;
	};

	// checks the last edge for contour self intersections
	Utils.hasSelfIntersectionsLastEdge = function(p) {
		var len = p ? (p.length / 3) : 0;
		if (len > 2) {
			var r, o;
			var e1 = p.slice(p.length - 6, p.length);
			var e2 = [0, 0, 0, 0, 0, 0];
			for (var i = 0; i < len; ++i) {
				o = i * 3;
				e2[0] = p[o];
				e2[1] = p[o + 1];
				e2[2] = p[o + 2];
				o = ((i + 1) % len) * 3;
				e2[3] = p[o];
				e2[4] = p[o + 1];
				e2[5] = p[o + 2];
				if (!Utils.equalPoints(e1, 0, e2, 0) && !Utils.equalPoints(e1, 0, e2, 3)
					&& !Utils.equalPoints(e1, 3, e2, 0) && !Utils.equalPoints(e1, 3, e2, 3)) {
					r = Utils.intersectLines(e1, e2);
					if (r && r[0] > koeffSmallNum && r[0] < (1 - koeffSmallNum) && r[1] > koeffSmallNum && r[1] < (1 - koeffSmallNum)) {
						return true;
					}
				}
			}
		}

		return false;
	};

	Utils.computeTriangleArea = function(v, o0, o1, o2) {
		var v0 = [v[o0], v[o0 + 1], v[o0 + 2]];
		var v1 = [v[o1], v[o1 + 1], v[o1 + 2]];
		var v2 = [v[o2], v[o2 + 1], v[o2 + 2]];
		var side1 = Utils.computePointToPointDistance(v0, v1);
		var side2 = Utils.computePointToPointDistance(v1, v2);
		var side3 = Utils.computePointToPointDistance(v2, v0);
		var s = (side1 + side2 + side3) / 2;
		return Math.sqrt(s * ((s - side1) * (s - side2) * (s - side3)));
	};

	Utils.computeTriangleAverageCoordinate = function(v, o0, o1, o2) {
		return [(v[o0] + v[o1] + v[o2]) / 3,
			(v[o0 + 1] + v[o1 + 1] + v[o2 + 1]) / 3,
			(v[o0 + 2] + v[o1 + 2] + v[o2 + 2]) / 3];
	};

	Utils.translateUnits = function(units, suffix) {
		var r = null;
		switch (units) {
			case "mm":
				r = "MM";
				break;
			case "cm":
				r = "CM";
				break;
			case "m":
				r = "M";
				break;
			case "in":
				r = "IN";
				break;
			case "ft":
				r = "FT";
				break;
			default:
				return "";
		}

		return getResourceBundle().getText("UNITS_SHORT_" + r + (suffix ? suffix : ""));
	};

	Utils.getUnitFactor = function(units) {
		switch (units) {
			case "mm":
				return 1;
			case "cm":
				return 1 / 10;
			case "m":
				return 1 / 1000;
			case "in":
				return 1 / 25.4;
			case "ft":
				return 1 / (25.4 * 12);
			default:
				return 1;
		}
	};

	// converts any angle to be in 0..2Pi range
	Utils.clampAngle2PI = function(a) {
		while (a >= PI2) {
			a -= PI2;
		}

		while (a < 0) {
			a += PI2;
		}

		return a;
	};

	// returns max(min(a, start+delta), start) that works for angles
	Utils.clampAngle = function(a, start, delta) {
		var angle = Utils.clampAngle2PI(a);
		var from = Utils.clampAngle2PI((delta < 0) ? (start - delta + PI2) : start);
		var to = Utils.clampAngle2PI((delta < 0) ? start : (start + delta));
		if (to < from) {
			if (angle < from) {
				from -= PI2;
			} else {
				to += PI2;
			}
		}

		return Math.max(Math.min(angle, to), from);
	};

	Utils.isClosedContour = function(p) {
		return p && p.length > 9 && Utils.equalPoints(p, 0, p, p.length - 3);
	};

	// find the shortest closed loop inside "originalCoords[2 * num]" starting from "originalCoords[bestIndex * 2]"
	// originalCoords[bestIndex - 1]...originalCoords[bestIndex] line must be in the contour (that's what user is hovering above)
	Utils.findClosedContour = function(originalCoords, originalIds, bestIndex) {
		var firstId = Math.abs(originalIds[0]);
		var bestId = Math.abs(originalIds[bestIndex]);
		var lastId = Math.abs(originalIds[originalIds.length - 1]);
		var contoursCount = lastId - firstId + 1;
		var contours = Array.apply(null, { length: contoursCount * 2 }); // first/last item index of each contour
		var i, j;

		// find where each subcontour starts and ends
		for (i = 0; i < originalIds.length; ++i) {
			var index = Math.abs(originalIds[i]) - firstId;
			if (contours[index * 2] === undefined) {
				contours[index * 2] = i;
			}
			contours[index * 2 + 1] = i;
		}

		// extract our subcontour of interest into coords[] + ids[]
		var contourDataOffset = (bestId - firstId) * 2;
		var currentContourFirst = contours[contourDataOffset];
		var currentContourLast = contours[contourDataOffset + 1];
		var coords = originalCoords.slice(currentContourFirst * 2, currentContourLast * 2 + 2);
		var ids = originalIds.slice(currentContourFirst, currentContourLast + 1); // if "ids[i] < 0", then the i-th element was sampled
		bestIndex -= currentContourFirst;

		// mark these contours as "processed"
		contours[contourDataOffset] = null;
		contours[contourDataOffset + 1] = null;

		// try to concatenate other contours to this one
		var found = false;
		var prevFound = true;
		var isReverse = true;
		var coordsTemp, idsTemp;
		var x, y;
		while (found || prevFound) {
			isReverse = !isReverse;
			x = coords[isReverse ? 0 : (coords.length - 2)];
			y = coords[isReverse ? 1 : (coords.length - 1)];
			prevFound = found;
			found = false;

			for (i = 0; i < contoursCount; ++i) {
				contourDataOffset = i * 2;
				currentContourFirst = contours[contourDataOffset];
				currentContourLast = contours[contourDataOffset + 1];
				if (contours[contourDataOffset] != null) {
					if ((x === originalCoords[currentContourFirst * 2]) && (y === originalCoords[currentContourFirst * 2 + 1])) {
						coordsTemp = originalCoords.slice(currentContourFirst * 2 + 2, currentContourLast * 2 + 2);
						idsTemp = originalIds.slice(currentContourFirst + 1, currentContourLast + 1);
						found = true;
					} else if ((x === originalCoords[currentContourLast * 2]) && (y === originalCoords[currentContourLast * 2 + 1])) {
						coordsTemp = [];
						for (j = currentContourLast * 2 - 2; j >= currentContourFirst * 2; j -= 2) {
							coordsTemp.push(originalCoords[j], originalCoords[j + 1]);
						}
						idsTemp = originalIds.slice(currentContourFirst, currentContourLast).reverse();
						found = true;
					}
				}

				if (found) {
					contours[contourDataOffset] = null;
					contours[contourDataOffset + 1] = null;
					if (isReverse) {
						bestIndex += idsTemp.length; // update id, since we're adding some data before start of array
						ids = idsTemp.reverse().concat(ids);
						var reverseCoordinates = [];
						for (j = coordsTemp.length - 2; j >= 0; j -= 2) {
							reverseCoordinates.push(coordsTemp[j], coordsTemp[j + 1]);
						}
						coords = reverseCoordinates.concat(coords);
					} else {
						ids = ids.concat(idsTemp);
						coords = coords.concat(coordsTemp);
					}
					break;
				}
			}
		}

		// try finding equal points starting from the "bestIndex"
		// note: can be rewritten using a "set" if performance is a problem (on huge contours)
		var dataLength = ids.length;
		for (i = bestIndex - 1; i >= 0; --i) {
			if (ids[i] >= 0) {
				x = coords[i * 2];
				y = coords[i * 2 + 1];

				for (j = bestIndex; j < dataLength; ++j) {
					// we ignore sampled points, as equal points in sampled contour is just pure luck and we don't want them anyways
					if ((j - i) >= 3 && ids[j] >= 0 && x === coords[j * 2] && y === coords[j * 2 + 1]) {
						return coords.slice(i * 2, j * 2 + 2);
					}
				}
			}
		}

		return null;
	};

	return Utils;
});
