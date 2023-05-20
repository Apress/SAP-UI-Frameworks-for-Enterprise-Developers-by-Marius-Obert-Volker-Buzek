/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// this object is used to store information about one particular mesh in a way suitable for doing measurements on it
sap.ui.define([
	"./Utils",
	"sap/base/Log"
], function(
	Utils,
	Log
) {
	"use strict";

	function MeshAnalyzer2D(svgRef, sceneRect) {
		this._uid = svgRef.uid;
		var diagonal = Math.sqrt(sceneRect[2] * sceneRect[2] + sceneRect[3] * sceneRect[3]);
		this._samplingKoeff = 10000 / diagonal;

		// string name of the class, like ellipse, rect, etc == svgRef.tagName()
		this._tagName = svgRef.tagName();

		// 3x2 matrix of the element, it is used for converting the result from local space to world
		this._matrix = svgRef._matrixWorld();

		// inverted 3x2 matrix to be applied to the point in order to bring it into the local coordinate space of mesh analyzer
		this._invMatrix = MeshAnalyzer2D.invertMatrix3x2(this._matrix);

		// save custom parameters (based on svg element type)
		switch (this._tagName) {
			case "ellipse":
				this.cx = svgRef.cx;
				this.cy = svgRef.cy;
				this.rx = svgRef.rx;
				this.ry = svgRef.ry;
				break;
			case "image":
				this.x = svgRef.x;
				this.y = svgRef.y;
				this.width = svgRef.width;
				this.height = svgRef.height;
				break;
			case "line":
			case "linearGradient":
				this.x1 = svgRef.x1;
				this.y1 = svgRef.y1;
				this.x2 = svgRef.x2;
				this.y2 = svgRef.y2;
				break;
			case "path":
				this.segments = svgRef.segments;
				break;
			case "polygon":
			case "polyline":
				this.points = svgRef.points;
				break;
			case "rect":
				this.x = svgRef.x;
				this.y = svgRef.y;
				this.rx = svgRef.rx;
				this.ry = svgRef.ry;
				this.width = svgRef.width;
				this.height = svgRef.height;
				break;
			case "text":
				// not supported
				break;
			default:
				Log.error("Unknown svg tag: " + this._tagName);
				break;
		}
	}

	// invert 3x2 matrix "a"
	MeshAnalyzer2D.invertMatrix3x2 = function(a) {
		var aa = a[0];
		var ab = a[1];
		var ac = a[2];
		var ad = a[3];
		var atx = a[4];
		var aty = a[5];
		var det = aa * ad - ab * ac;
		if (!det) {
			Log.error("Empty determinant of matrix 'a'");
			return null;
		}

		det = 1.0 / det;
		var out = [];
		out.push(ad * det);
		out.push(-ab * det);
		out.push(-ac * det);
		out.push(aa * det);
		out.push((ac * aty - ad * atx) * det);
		out.push((ab * atx - aa * aty) * det);
		return out;
	};

	// transform vec2 "a" with 3x2 matrix "m"
	MeshAnalyzer2D.transform2d = function(a, m) {
		var x = a[0];
		var y = a[1];
		return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
	};

	// svg rectangle nearest point
	MeshAnalyzer2D.distanceToRectangle = function(x, y, r, allowEdge, allowVertex, sx, sy, width, height) {
		var r2 = r * r;
		var shortestVertex = Number.MAX_VALUE;
		var bestVertex;
		var shortestEdge = Number.MAX_VALUE;
		var bestEdge;
		var cur;
		var p = [x, y, 0];

		// todo: support rectangle with rounded corners
		var corners = [];

		for (var i = 0; i < 4; ++i) {
			var nx = sx + ((i === 0) || (i === 3) ? 0 : width);
			var ny = sy + ((i === 0) || (i === 1) ? 0 : height);
			corners.push(nx, ny);

			if (allowVertex) {
				cur = Utils.computePointToPointDistance2([nx, ny, 0], p);
				if (cur < shortestVertex) {
					shortestVertex = cur;
					bestVertex = [nx, ny];
				}
			}

			if (allowEdge) {
				var j = (i + 1) % 4;
				var mx = sx + ((j === 0) || (j === 3) ? 0 : width);
				var my = sy + ((j === 0) || (j === 1) ? 0 : height);
				cur = Utils.computeEdgeToPointDistance2([nx, ny, 0], [mx, my, 0], p);
				if (cur < shortestEdge) {
					shortestEdge = cur;
					bestEdge = [nx, ny, mx, my];
				}
			}
		}

		var vertex = (shortestVertex < r2) ? bestVertex : null;
		var edge = (shortestEdge < r2) ? bestEdge : null;
		corners.push(corners[0], corners[1]); // close the contour
		return [vertex, edge, (!vertex && edge) ? corners : null];
	};

	// svg line nearest point
	MeshAnalyzer2D.distanceToLine = function(x, y, r, allowEdge, allowVertex, x1, y1, x2, y2) {
		var vertex = null;
		var edge = null;
		var r2 = r * r;
		var v0 = [x1, y1, 0];
		var v1 = [x2, y2, 0];
		var p = [x, y, 0];

		if (allowEdge && Utils.computeEdgeToPointDistance2(v0, v1, p) < r2) {
			edge = [v0[0], v0[1], v1[0], v1[1]];
		}

		if (allowVertex) {
			var d0 = Utils.computePointToPointDistance2(v0, p);
			var d1 = Utils.computePointToPointDistance2(v1, p);
			if (d0 < d1 && d0 < r2) {
				vertex = v0;
			} else if (d1 < d0 && d1 < r2) {
				vertex = v1;
			}
		}

		return [vertex, edge];
	};

	// svg polyline nearest point
	MeshAnalyzer2D.distanceToPolyLine = function(x, y, r, allowEdge, allowVertex, isClosed, points) {
		var vertex = null;
		var edge = null;
		var r2 = r * r;
		var shortestVertex = Number.MAX_VALUE;
		var bestVertex;
		var shortestEdge = Number.MAX_VALUE;
		var bestEdge;
		var cur;
		var p = [x, y, 0];
		var cx;
		var cy;
		var px;
		var py;
		var count = points.length;
		if (count < 2) {
			return [];
		}

		for (var i = 0; i < count; i += 2) {
			cx = points[i];
			cy = points[i + 1];

			if (allowVertex) {
				cur = Utils.computePointToPointDistance2([cx, cy, 0], p);
				if (cur < shortestVertex) {
					shortestVertex = cur;
					bestVertex = [cx, cy];
				}
			}

			if (allowEdge) {
				if (i > 0) {
					cur = Utils.computeEdgeToPointDistance2([px, py, 0], [cx, cy, 0], p);
					if (cur < shortestEdge) {
						shortestEdge = cur;
						bestEdge = [px, py, cx, cy];
					}
				} else if (isClosed) {
					// i === 0
					px = points[count - 2];
					py = points[count - 1];
					shortestEdge = Utils.computeEdgeToPointDistance2([px, py, 0], [cx, cy, 0], p);
					bestEdge = [px, py, cx, cy];
				}
			}

			px = cx;
			py = cy;
		}

		if (shortestVertex < r2) {
			vertex = bestVertex;
		}

		if (shortestEdge < r2) {
			edge = bestEdge;
		}

		var contour = null;
		if (!vertex && edge) {
			contour = Array.from(points);
			if (isClosed) {
				contour.push(points[0], points[1]);
			}
		}

		return [vertex, edge, contour];
	};

	// svg ellipse nearest point
	MeshAnalyzer2D.distanceToEllipse = function(x, y, r, cx, cy, rx, ry, startAngle, deltaAngle) {
		var vertex = null;
		var p = [x, y, 0];
		var c = [cx, cy, 0];

		// center of the ellipse is a snapping point also
		var dist = Utils.computePointToPointDistance2(c, p);
		vertex = [cx, cy];

		// edge of the ellipse
		var np = Utils.computeEdgeDirection(c, p);
		var theta = Utils.angleBetweenVectors2D(1, 0, np[0], np[1]);

		if (startAngle != null && deltaAngle != null) {
			theta = Utils.clampAngle(theta, startAngle, deltaAngle);
		}

		np = [cx + rx * Math.cos(theta), cy + ry * Math.sin(theta), 0];
		var dist2 = Utils.computePointToPointDistance2(np, p);
		if (dist2 < dist) {
			dist = dist2;
			vertex = np;
		}

		return (dist < r * r) ? vertex : null;
	};

	// https://www.w3.org/TR/SVG11/implnote.html#ArcConversionEndpointToCenter
	MeshAnalyzer2D.computeArcCenter = function(x1, y1, x2, y2, rx, ry, short, clockwise) {
		var fA = (short === false);
		var fS = (clockwise !== false);
		var dx2 = 0.5 * (x1 - x2);
		var dy2 = 0.5 * (y1 - y2);
		var tmp = (dx2 * dx2) / (rx * rx) + (dy2 * dy2) / (ry * ry);
		if (tmp > 1) { // enlarge the radius (as per SVG implementation doc)
			tmp = Math.sqrt(tmp);
			rx = rx * tmp;
			ry = ry * tmp;
		}

		// Step 1: Compute (x1′, y1′)
		var rxRy = rx * ry;
		var rxDy2 = rx * dy2;
		var ryDx2 = ry * dx2;
		tmp = rxDy2 * rxDy2 + ryDx2 * ryDx2;
		if (!tmp) {
			return null;
		}

		var coe = Math.sqrt(Math.abs((rxRy * rxRy - tmp) / tmp));
		if (fA == fS) {
			coe = -coe;
		}

		// Step 2: Compute (cx′, cy′)
		var cx_ = coe * rxDy2 / ry;
		var cy_ = -coe * ryDx2 / rx;

		// Step 3: Compute (cx, cy) from (cx′, cy′)
		var cx = cx_ + 0.5 * (x1 + x2);
		var cy = cy_ + 0.5 * (y1 + y2);

		var xcr1 = (dx2 - cx_) / rx;
		var xcr2 = (dx2 + cx_) / rx;
		var ycr1 = (dy2 - cy_) / ry;
		var ycr2 = (dy2 + cy_) / ry;

		// Step 4: Compute angles
		var startAngle = Utils.angleBetweenVectors2D(1, 0, xcr1, ycr1);
		var deltaAngle = Utils.clampAngle2PI(Utils.angleBetweenVectors2D(xcr1, ycr1, -xcr2, -ycr2));

		// delta angle must be in range -360 .. 360 degrees (-2pi .. 2pi)
		if (!fS) {
			deltaAngle -= 2 * Math.PI;
		}

		return {
			cx: cx,
			cy: cy,
			rx: rx,
			ry: ry,
			startAngle: startAngle,
			deltaAngle: deltaAngle
		};
	};

	MeshAnalyzer2D.sampleBezier = function(t, startPoint, endPoint, cp0, cp1) {
		return cp1 ? Utils.bezierCubic2D(t, startPoint, cp0, cp1, endPoint) : Utils.bezierQuadric2D(t, startPoint, cp0, endPoint);
	};

	MeshAnalyzer2D.sampleBezierCurve = function(startPoint, endPoint, cp0, cp1, samplingKoeff) {
		var length = Utils.computePointToPointDistance2D(startPoint, cp0);
		if (cp1) {
			length += Utils.computePointToPointDistance2D(cp0, cp1);
			length += Utils.computePointToPointDistance2D(cp1, endPoint);
		} else {
			length += Utils.computePointToPointDistance2D(cp0, endPoint);
		}

		var count = Math.min(Math.max(length * samplingKoeff, 35), 200);
		var ret = [];
		for (var bi = 0; bi < count; ++bi) {
			var p = MeshAnalyzer2D.sampleBezier(bi / count, startPoint, endPoint, cp0, cp1);
			ret.push(p[0], p[1]);
		}

		return ret;
	};

	MeshAnalyzer2D.sampleEllipse = function(cx, cy, rx, ry, startAngle, deltaAngle, samplingKoeff) {
		var perimeter = Math.max(rx, ry) * deltaAngle;
		var count = Math.min(Math.max(perimeter * samplingKoeff, 35), 200);
		var res = [];
		for (var i = 0; i < count; ++i) {
			var a = startAngle + i * deltaAngle / count;
			res.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
		}

		return res;
	};

	// distanceToBezier
	MeshAnalyzer2D.distanceToBezier = function(sphereX, sphereY, sphereR, startPoint, endPoint, cp0, cp1) {
		var p = [sphereX, sphereY, 0];
		var shortest2 = Number.MAX_VALUE;
		var best;
		var current;
		var t;
		var d;
		var k;
		var samplesCount = 100;

		var sample = function(t) {
			if (t <= 0) {
				return startPoint;
			}

			if (t >= 1) {
				return endPoint;
			}

			return MeshAnalyzer2D.sampleBezier(t, startPoint, endPoint, cp0, cp1);
		};

		// sample a few points and find the best "t" there
		for (k = 0; k <= samplesCount; ++k) {
			t = k / samplesCount;
			current = sample(t);
			d = Utils.computePointToPointDistance2(current, p);
			if (d < shortest2) {
				shortest2 = d;
				best = t;
			}
		}

		// refine our initial guess using binary search approach
		k = 0.5 / samplesCount;
		while (k > 0.00000001) {
			for (samplesCount = 0; samplesCount < 2; ++samplesCount) {
				t = (samplesCount == 0) ? (best - k) : (best + k);
				current = sample(t);
				d = Utils.computePointToPointDistance2(current, p);
				if (d < shortest2) {
					shortest2 = d;
					best = t;
				}
			}

			k *= 0.5;
		}

		return (shortest2 > (sphereR * sphereR)) ? null : sample(best);
	};

	// svg path nearest point
	MeshAnalyzer2D.distanceToPath = function(sphereX, sphereY, sphereR, allowEdge, allowVertex, allowClosedContour, allowCurvedEdge, segments, samplingKoeff) {
		var pathCoordinate = []; // all vertices of the path. [x, y] per polyline vertex.
		var pathId = []; // disjoint polylines have different ids. negative id means this point was sampled from smooth curve.
		var pathClosestIndex = null; // index of the closest intersection (we will be locating closed loops only in edges with same index)
		var bestSampledCurve = null;
		var currentPathId = 0; // this increases when a new disjoint polyline is added
		var r2 = sphereR * sphereR;
		var shortestVertex = Number.MAX_VALUE;
		var bestVertex;
		var shortestEdge = Number.MAX_VALUE;
		var bestEdge;
		var cur;
		var p = [sphereX, sphereY, 0];

		var segment;
		var points;
		var dim;
		var i;
		var l;

		var x = 0;
		var y = 0;
		var fx = 0;
		var fy = 0;
		var px = null;
		var py = null;
		var lastControlX = null;
		var lastControlY = null;

		var addContourLine = function(x1, y1, x2, y2, wasSampled) {
			var l2 = pathCoordinate.length;
			if (!l2 || pathCoordinate[l2 - 2] !== x1 || pathCoordinate[l2 - 1] !== y1) {
				// start a new disjoint polyline segment
				currentPathId++;
				pathId.push(wasSampled ? -currentPathId : currentPathId);
				pathCoordinate.push(x1, y1);
			}

			pathId.push(wasSampled ? -currentPathId : currentPathId);
			pathCoordinate.push(x2, y2);
		};

		var addSampledContour = function(sx, sy, contour, ex, ey) {
			var px = sx;
			var py = sy;
			var nx, ny;
			for (var i = 0, len = contour.length; i < len; i += 2) {
				nx = contour[i];
				ny = contour[i + 1];
				// note: in theory, we can do a micro-optimization here and avoid extra checks in addContourLine()
				addContourLine(px, py, nx, ny, true);
				px = nx;
				py = ny;
			}
			addContourLine(px, py, ex, ey, true);
		};

		var addLine = function() {
			if (allowVertex) {
				cur = Utils.computePointToPointDistance2([x, y, 0], p);
				if (cur < shortestVertex) {
					shortestVertex = cur;
					bestVertex = [x, y];
					bestSampledCurve = null;
				}
			}

			if (px != null) {
				if (allowClosedContour) {
					addContourLine(px, py, x, y, false);
				}

				if (allowEdge) {
					cur = Utils.computeEdgeToPointDistance2([px, py, 0], [x, y, 0], p);
					if (cur < shortestEdge) {
						shortestEdge = cur;
						bestEdge = [px, py, x, y];
						pathClosestIndex = pathId.length - 1;
					}
				}
			}

			px = x;
			py = y;
		};

		for (var si = 0, sl = segments.length; si < sl; ++si) {
			segment = segments[si];
			points = segment.points;
			dim = segment.dimension || 2;

			switch (segment.type) {
				case "arc":
					px = x;
					py = y;
					if (segment.relative) {
						x += points[0];
						y += points[1];
					} else {
						x = points[0];
						y = points[1];
					}

					var r = MeshAnalyzer2D.computeArcCenter(px, py, x, y, segment.major, segment.minor, segment.short, segment.clockwise);
					if (r) {
						if (allowClosedContour) {
							addSampledContour(px, py, MeshAnalyzer2D.sampleEllipse(r.cx, r.cy, r.rx, r.ry, r.startAngle, r.deltaAngle, samplingKoeff), x, y);
						}

						if (allowVertex) {
							var ev = MeshAnalyzer2D.distanceToEllipse(sphereX, sphereY, sphereR, r.cx, r.cy, r.rx, r.ry, r.startAngle, r.deltaAngle);
							if (ev) {
								var dist2 = Utils.computePointToPointDistance2(ev, p);
								if (dist2 < shortestVertex) {
									shortestVertex = dist2;
									bestVertex = ev;
									pathClosestIndex = pathId.length - 1;
									if (allowCurvedEdge && Utils.computePointToPointDistance2(ev, [px, py, 0]) > r2 && Utils.computePointToPointDistance2(ev, [x, y, 0]) > r2) {
										bestSampledCurve = [px, py].concat(MeshAnalyzer2D.sampleEllipse(r.cx, r.cy, r.rx, r.ry, r.startAngle, r.deltaAngle, samplingKoeff), [x, y]);
									}
								}
							}
						}
					}
					break;
				case "move":
					px = null;
					py = null;
					x = points[0];
					y = points[1];
					fx = x;
					fy = y;
					addLine(); // will just process the first vertex (not an edge)

					for (i = dim, l = points.length - 1; i < l; i += dim) {
						if (segment.relative) {
							x += points[i];
							y += points[i + 1];
						} else {
							x = points[i];
							y = points[i + 1];
						}
						addLine();
					}
					break;
				case "line":
					px = x;
					py = y;
					for (i = 0, l = points.length - 1; i < l; i += dim) {
						if (segment.relative) {
							x += points[i];
							y += points[i + 1];
						} else {
							x = points[i];
							y = points[i + 1];
						}
						addLine();
					}
					break;
				case "close":
					px = x;
					py = y;
					x = fx;
					y = fy;
					addLine();
					break;
				case "bezier":
					// https://pomax.github.io/bezierinfo/#projections
					var degree = segment.degree || 2; // cubic or quadric
					var current = 0;
					var numControlPoints = degree - 1;
					if (segment.smooth) {
						numControlPoints--; // first control point is a reflection of the last one before
						// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
						lastControlX = x;
						lastControlY = y;
					}

					var cp = [null, null];
					for (i = 0, l = points.length - 1; i < l; i += dim) {
						if (current === 0) {
							fx = x;
							fy = y;
							px = null;
							py = null;
						}

						if (current < numControlPoints) {
							// save control points
							if (segment.relative) {
								cp[current] = [x + points[i], y + points[i + 1]];
							} else {
								cp[current] = [points[i], points[i + 1]];
							}

							current++;
						} else {
							if (segment.relative) {
								x += points[i];
								y += points[i + 1];
							} else {
								x = points[i];
								y = points[i + 1];
							}

							// https://www.w3.org/TR/SVG/paths.html#ReflectedControlPoints
							var reflected = [2 * fx - lastControlX, 2 * fy - lastControlY];
							var t = (segment.smooth || degree === 2) ? 0 : 1;
							lastControlX = cp[t][0];
							lastControlY = cp[t][1];

							var cp0 = segment.smooth ? reflected : cp[0];
							var cp1 = (degree === 2) ? null : [lastControlX, lastControlY];
							var startPoint = [fx, fy];
							var endPoint = [x, y];
							if (allowClosedContour) {
								addSampledContour(startPoint[0], startPoint[1], MeshAnalyzer2D.sampleBezierCurve(startPoint, endPoint, cp0, cp1, samplingKoeff), endPoint[0], endPoint[1]);
							}

							if (allowVertex) {
								var eb = MeshAnalyzer2D.distanceToBezier(sphereX, sphereY, sphereR, startPoint, endPoint, cp0, cp1);
								if (eb) {
									var dist2b = Utils.computePointToPointDistance2(eb, p);
									if (dist2b < shortestVertex) {
										shortestVertex = dist2b;
										bestVertex = eb;
										pathClosestIndex = pathId.length - 1;
										if (allowCurvedEdge && Utils.computePointToPointDistance2(eb, [fx, fy, 0]) > r2 && Utils.computePointToPointDistance2(eb, [x, y, 0]) > r2) {
											bestSampledCurve = [startPoint[0], startPoint[1]].concat(MeshAnalyzer2D.sampleBezierCurve(startPoint, endPoint, cp0, cp1, samplingKoeff), [endPoint[0], endPoint[1]]);
										}
									}
								}
							}

							current = 0;
						}
					}
					break;
				default:
					break;
			}
		}

		var vertex = (shortestVertex < r2) ? bestVertex : null;
		var edge = (shortestEdge < r2) ? bestEdge : null;
		var contour = (allowClosedContour && (vertex || edge)) ? Utils.findClosedContour(pathCoordinate, pathId, pathClosestIndex) : null;
		return [vertex, edge, contour, vertex ? bestSampledCurve : null];
	};

	// finds the closest face (set of triangles), edge (set of edges) and vertex to the sphere and their distances
	// note: the face, edge and vertex may actually be from different triangles (if there are more than 1 triangles within the sphere radius)
	MeshAnalyzer2D.prototype.intersectSphere = function(position, radius, _allowFace, allowEdge, allowVertex, allowClosedContour, allowCurvedEdge) {
		var ret = {
			faceId: null,
			edgeId: null,
			vertexId: null,
			contourId: null,
			curvedEdgeId: null,
			edge: null,
			vertex: null,
			contour: null, // closed contour for measuring area of circle, polygon, closed path, etc
			curvedEdge: null // sampled arc/bezier
		};

		// convert position/radius into local space
		var x = position[0];
		var y = position[1];
		var localPosition = MeshAnalyzer2D.transform2d([x, y], this._invMatrix);
		var tmp = MeshAnalyzer2D.transform2d([x + radius, y], this._invMatrix);
		x = localPosition[0];
		y = localPosition[1];
		var r = Math.sqrt((tmp[0] - x) * (tmp[0] - x) + (tmp[1] - y) * (tmp[1] - y));

		// custom distance maths depending on element type
		var vertexAndEdge = []; // [0] - vertex, [1] - edge, [2] - closed contour, [3] - polyline (curved edge)
		switch (this._tagName) {
			case "ellipse":
				if (allowVertex) {
					var vertex = MeshAnalyzer2D.distanceToEllipse(x, y, r, this.cx, this.cy, this.rx, this.ry, null, null);
					if (vertex) {
						if (allowClosedContour) {
							var cc = MeshAnalyzer2D.sampleEllipse(this.cx, this.cy, this.rx, this.ry, 0, 2 * Math.PI, this._samplingKoeff);
							cc.push(cc[0], cc[1]); // close the contour
							vertexAndEdge.push(vertex, null, cc);
						} else {
							vertexAndEdge.push(vertex);
						}
					}
				}
				break;
			case "rect":
			case "image":
				vertexAndEdge = MeshAnalyzer2D.distanceToRectangle(x, y, r, allowEdge, allowVertex,
					this.x, this.y, this.width, this.height);
				break;
			case "line":
			case "linearGradient":
				vertexAndEdge = MeshAnalyzer2D.distanceToLine(x, y, r, allowEdge, allowVertex,
					this.x1, this.y1, this.x2, this.y2);
				break;
			case "path":
				vertexAndEdge = MeshAnalyzer2D.distanceToPath(x, y, r, allowEdge, allowVertex, allowClosedContour, allowCurvedEdge, this.segments, this._samplingKoeff);
				break;
			case "polygon":
				vertexAndEdge = MeshAnalyzer2D.distanceToPolyLine(x, y, r, allowEdge, allowVertex, true, this.points);
				break;
			case "polyline":
				vertexAndEdge = MeshAnalyzer2D.distanceToPolyLine(x, y, r, allowEdge, allowVertex, false, this.points);
				break;
			default:
				break;
		}

		// convert vertex from local to world space
		tmp = (vertexAndEdge.length > 0) ? vertexAndEdge[0] : null;
		if (tmp) {
			var p = MeshAnalyzer2D.transform2d([tmp[0], tmp[1]], this._matrix);
			ret.vertex = [p[0], p[1], 0];
			ret.vertexId = "v" + p[0] + ":" + p[1]; // vertexId is a unique id in case of 2D scenes
		}

		// convert edge from local to world space
		tmp = (vertexAndEdge.length > 1) ? vertexAndEdge[1] : null;
		if (tmp) {
			var p0 = MeshAnalyzer2D.transform2d([tmp[0], tmp[1]], this._matrix);
			var p1 = MeshAnalyzer2D.transform2d([tmp[2], tmp[3]], this._matrix);
			ret.edge = [p0[0], p0[1], 0, p1[0], p1[1], 0];
			ret.edgeId = "e" + p0[0] + ":" + p0[1] + ":" + p1[0] + ":" + p1[1]; // edgeId is a unique id in case of 2D scenes
		}

		// convert closed contour from local to world space
		tmp = (vertexAndEdge.length > 2) ? vertexAndEdge[2] : null;
		var w;
		if (allowClosedContour && tmp && tmp.length >= 6) {
			var contour = [];

			for (var k = 0, len = tmp.length / 2; k < len; ++k) {
				w = MeshAnalyzer2D.transform2d([tmp[k * 2], tmp[k * 2 + 1]], this._matrix);
				contour.push(w[0], w[1], 0);
			}

			if (Utils.isClosedContour(contour) && !Utils.hasSelfIntersections(contour, false)) {
				ret.contour = contour;
				ret.contourId = "cc:" + (this._uid ? this._uid : "") + ":" + contour[0] + ":" + contour[1];
			}
		}

		// convert curved edge from local to world space
		tmp = (vertexAndEdge.length > 3) ? vertexAndEdge[3] : null;
		if (allowCurvedEdge && tmp && tmp.length >= 6) {
			var curved = [];

			for (var ck = 0, clen = tmp.length / 2; ck < clen; ++ck) {
				w = MeshAnalyzer2D.transform2d([tmp[ck * 2], tmp[ck * 2 + 1]], this._matrix);
				curved.push(w[0], w[1], 0);
			}

			if (!Utils.hasSelfIntersections(curved, true)) {
				ret.curvedEdge = curved;
				ret.curvedEdgeId = "ce:" + (this._uid ? this._uid : "") + ":" + curved[0] + ":" + curved[1];
			}
		}

		return ret;
	};

	return MeshAnalyzer2D;
});
