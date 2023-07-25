/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../measurements/Angle",
	"../measurements/Utils",
	"./MeasurementToolState",
	"./MeasurementToolGizmo"
], function(
	Angle,
	Utils,
	State,
	MeasurementToolGizmo
) {
	"use strict";

	var AngleMeasurementToolGizmo = MeasurementToolGizmo.extend("sap.ui.vk.tools.AngleMeasurementToolGizmo", /** @lends sap.ui.vk.tools.AngleMeasurementToolGizmo */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = AngleMeasurementToolGizmo.getMetadata().getParent().getClass().prototype;

	AngleMeasurementToolGizmo.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		// The 3rd selected feature.
		this._thirdFeature = null;
	};

	AngleMeasurementToolGizmo.prototype._updateCurrentFeature = function(nodeRef, point, viewport, allowFace, allowEdge, allowVertex) {
		var meshAnalyzer = nodeRef == null ? null : this._getMeshAnalyzer(nodeRef);
		var r = this._computeSphereRadius(point, viewport);
		var removeFeature = false;
		var shouldUpdate = false;

		var wantEdge = this._firstFeature && this._firstFeature.isEdge; // searching for the 2nd edge
		if (meshAnalyzer != null && (allowFace || allowEdge || allowVertex)) {
			var intersection = meshAnalyzer.intersectSphere(point, r, allowFace, allowEdge, allowVertex, false, false);
			if (this._is2D) {
				if (!wantEdge && (intersection.vertex != null)) {
					if (this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], intersection.vertexId, meshAnalyzer)) {
						this._currentFeature.setValue(intersection.vertex);
						return true;
					}
				} else if (intersection.edge != null) {
					if (this._state === State.SearchingSecondFeature &&
						this._firstFeature.getFeatureId() === intersection.edgeId &&
						this._firstFeature.getContext() === meshAnalyzer) {
						// same edge (coincident lines)
						removeFeature = true;
					} else if (this._replaceCurrentFeature(this._edgeFeatures[this._currentFeatureIndex], intersection.edgeId, meshAnalyzer)) {
						this._currentFeature.setValue(intersection.edge);
						return true;
					}
				} else if (wantEdge) {
					removeFeature = true;
				} else {
					// Create a free point feature.
					this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], null, meshAnalyzer);
					this._currentFeature.setValue(point);
					return true;
				}
			} else {
				if (intersection.vertexId != null) { // eslint-disable-line no-lonely-if
					if (this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], intersection.vertexId, meshAnalyzer)) {
						this._currentFeature.setValue(meshAnalyzer.getVertex(intersection.vertexId));
						return true;
					}
				} else if (intersection.edgeId != null) {
					if (this._replaceCurrentFeature(this._edgeFeatures[this._currentFeatureIndex], intersection.edgeId, meshAnalyzer)) {
						this._currentFeature.setValue(meshAnalyzer.buildEdgePath(intersection.edgeId, true));
						return true;
					}
				} else if (intersection.faceId != null) {
					if (this._state === State.SearchingSecondFeature &&
						this._firstFeature.getFeatureId() === intersection.faceId &&
						this._firstFeature.getContext() === meshAnalyzer) {
						// same face (coincident planes)
						removeFeature = true;
					} else if (this._replaceCurrentFeature(this._faceFeatures[this._currentFeatureIndex], intersection.faceId, meshAnalyzer)) {
						var face = meshAnalyzer.buildFace(intersection.faceId);
						if (this._state === State.SearchingSecondFeature &&
							!Utils.intersectPlanes(this._firstFeature.getValue().planeEquation, face.planeEquation)) {
							// parallel planes
							removeFeature = true;
						} else {
							this._currentFeature.setValue(face);
							return true;
						}
					}

					shouldUpdate = true;
				} else {
					removeFeature = true;
				}
			}
		} else if (wantEdge) {
			removeFeature = true;
		} else {
			// Create a free point feature.
			this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], null, meshAnalyzer);
			this._currentFeature.setValue(point);
			return true;
		}

		if (removeFeature && this._currentFeature) {
			// No features found, make sure none are being displayed.
			this._surface.removeFeature(this._currentFeature);
			this._currentFeature = null;
			return true;
		}

		return shouldUpdate;
	};

	// cut edge p1-p2 running inside face with the edge contour of face
	AngleMeasurementToolGizmo.prototype._trimByContour = function(face, p1, p2, desiredU) {
		var line1 = [p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]];
		var u, interval = null;
		var o1, o2, ab;

		var edges = face.edges;
		var v = face.vertices;
		for (var i = 0, count = edges.length; i < count; i += 2) {
			o1 = 3 * edges[i];
			o2 = 3 * edges[i + 1];
			ab = Utils.intersectLines(line1, [v[o1], v[o1 + 1], v[o1 + 2], v[o2], v[o2 + 1], v[o2 + 2]]);
			u = (ab && ab[1] >= 0 && ab[1] <= 1) ? ab[0] : null; // intersection point on line1
			if (u) {
				if (interval) {
					if (u < interval[0]) {
						interval[0] = u;
					}

					if (u > interval[1]) {
						interval[1] = u;
					}
				} else {
					interval = [u, u];
				}
			}
		}

		var cut = null;
		// "interval" stores min/max U for line being inside a contour
		if (interval && desiredU) {
			// we have intersection and a desired U value, so the logic is:
			// - if desiredU is inside the interval then use desiredU
			// - otherwise use the max interval value
			if (desiredU > interval[0] && desiredU < interval[1]) {
				cut = desiredU;
			} else if (interval[1] > 0 && interval[1] < 1) {
				cut = interval[1];
			}
		} else if (interval && interval[1] > 0 && interval[1] < 1) {
			// no "desiredU" specified and we have intersection with the contour
			cut = interval[1];
		} else if (desiredU && desiredU > 0 && desiredU < 1) {
			// no contour intersection -> just use desiredU
			cut = desiredU;
		}

		return cut ? Utils.pointOnLine(line1, cut) : p2;
	};

	AngleMeasurementToolGizmo.prototype._updateFace2FaceMeasurement = function(worldPoint) {
		var face1 = this._firstFeature.getValue();
		var face2 = this._currentFeature.getValue();

		// note: line != null, because we already checked for that in OnHover()
		var line = Utils.intersectPlanes(face1.planeEquation, face2.planeEquation);

		// find min/max projection of the face onto the line (uMin and uMax)
		var p, u, uMin, uMax, pointMin, pointMax;
		var dist2, farPoint, farDist;
		var vertices = face1.vertices;
		for (var i = 0, count = vertices.length; i < count; i += 3) {
			p = [vertices[i], vertices[i + 1], vertices[i + 2]];
			u = Utils.projectPointToLine(line, p);
			dist2 = Utils.computePointToPointDistance2(p, Utils.pointOnLine(line, u));
			if (i === 0) {
				uMin = u;
				uMax = u;
				pointMin = p;
				pointMax = p;
				farPoint = p;
				farDist = dist2;
			}

			if (u < uMin) {
				uMin = u;
				pointMin = p;
			}

			if (u > uMax) {
				uMax = u;
				pointMax = p;
			}

			if (dist2 > farDist) {
				farDist = dist2;
				farPoint = p;
			}
		}

		// decide where to put line1 of angle measurement
		var u2 = Utils.projectPointToLine(line, worldPoint);
		var p2 = Utils.pointOnLine(line, u2);
		if (u2 <= uMin) {
			this._currentMeasurement.setPoint1(pointMin);
			this._currentMeasurement.setPoint2(Utils.pointOnLine(line, uMin));
		} else if (u2 >= uMax) {
			this._currentMeasurement.setPoint1(pointMax);
			this._currentMeasurement.setPoint2(Utils.pointOnLine(line, uMax));
		} else {
			// u2 is inside the projection of the face to intersection line
			var farOnLine = Utils.pointOnLine(line, Utils.projectPointToLine(line, farPoint));
			var farToP2 = Utils.pointMinusPoint(farOnLine, p2);
			p = Utils.pointMinusPoint(farPoint, farToP2);

			var distance1 = Utils.computePointToPointDistance(p2, p);
			var distance2 = Utils.computePointToPointDistance(p2, worldPoint);
			this._currentMeasurement.setPoint1(this._trimByContour(face1, p2, p, (distance1 > 0) ? (distance2 / distance1) : 1));
			this._currentMeasurement.setPoint2(p2);
		}

		this._currentMeasurement.setPoint3(p2);
		this._currentMeasurement.setPoint4(worldPoint);

		this._currentMeasurement.computeAngle();
		// computing angle via Angle.computeAngle() gives a worse precision result than real face 2 face
		// but we support double-sided faces and that's why our result may have to be (180 - result)
		var precise0 = Math.acos(Utils.dotProduct(face1.planeEquation, face2.planeEquation));
		var precise180 = Math.PI - precise0;
		var angle = this._currentMeasurement.getAngle();
		this._currentMeasurement.setAngle(Math.abs(precise0 - angle) < Math.abs(precise180 - angle) ? precise0 : precise180);
	};

	AngleMeasurementToolGizmo.prototype._updateMeasurement = function(currentMeasurement) {
		// special case: defining angle works in screen space (does not need worldPoint)
		if (this._state === State.DefiningAngle) {
			var viewport = this._viewport;
			var camera = viewport.getCamera();
			var p = currentMeasurement.getPoints();
			var s1 = viewport.projectToScreen(p[0], p[1], p[2], camera);
			var e1 = viewport.projectToScreen(p[3], p[4], p[5], camera);
			var o1 = viewport.projectToScreen(p[6], p[7], p[8], camera);
			var o2 = viewport.projectToScreen(p[9], p[10], p[11], camera);
			var s2 = viewport.projectToScreen(p[12], p[13], p[14], camera);
			var e2 = viewport.projectToScreen(p[15], p[16], p[17], camera);

			// let's change s1-e1 to be on the same plane with s2-e2
			var dx = o1.x - o2.x;
			var dy = o1.y - o2.y;

			var wp = this._hoverPoint.screenPoint;
			currentMeasurement.setAngleRadius([s1.x - dx, s1.y - dy, 0], [e1.x - dx, e1.y - dy, 0], [o2.x, o2.y, 0], [s2.x, s2.y, 0], [e2.x, e2.y, 0], [wp[0], wp[1], 0]);
			return;
		}

		// the common path for all states other than "defining arc radius"
		var worldPoint = this._hoverPoint.worldPoint.slice();
		if (this._currentFeature && this._currentFeature.isVertex) {
			var vertex = this._currentFeature.getValue();
			worldPoint[0] = vertex[0];
			worldPoint[1] = vertex[1];
			worldPoint[2] = vertex[2];
		}

		if (this._state === State.SearchingSecondFeature) {
			if (this._currentFeature && this._currentFeature.isEdge) {
				// 2 edges style
				var edge = this._currentFeature.getValue();
				currentMeasurement.setPoint3(edge);
				currentMeasurement.setPoint4([edge[3], edge[4], edge[5]]);
				currentMeasurement.computeAngle();
			} else if (this._firstFeature.isVertex) {
				// 3 vertices style
				currentMeasurement.setPoint2(worldPoint);
				currentMeasurement.setPoint3(worldPoint);
				currentMeasurement.setPoint4(worldPoint);
				currentMeasurement.computeAngle();
			} else if (this._currentFeature && this._currentFeature.isFace) {
				// 2 faces style
				this._updateFace2FaceMeasurement(worldPoint);
				currentMeasurement.setState(1);
			}
		} else if (this._state === State.SearchingThirdFeature) {
			currentMeasurement.setPoint4(worldPoint);
			currentMeasurement.setState(1);
			currentMeasurement.computeAngle();
		}
	};

	AngleMeasurementToolGizmo.prototype.setHoverPoint = function(data) {
		var oldHighlightedNodeRef = this._hoverPoint && this._hoverPoint.nodeRef;
		var newHighlightedNodeRef = data && data.nodeRef;
		if (newHighlightedNodeRef != oldHighlightedNodeRef) {
			var vsm = this._vsm;
			if (vsm != null) {
				var outlined = newHighlightedNodeRef != null ? [newHighlightedNodeRef] : [];
				var unoutlined = oldHighlightedNodeRef != null ? [oldHighlightedNodeRef] : [];
				vsm.setOutliningStates(outlined, unoutlined, false, true);
			}
		}

		this._hoverPoint = data;

		var definingAngleNow = this._state === State.DefiningAngle;
		var currentMeasurement = (this._state === State.SearchingSecondFeature || this._state === State.SearchingThirdFeature || this._state === State.DefiningAngle) ? this._currentMeasurement : null;
		if (!definingAngleNow && (!data || data.worldPoint == null)) {
			if (currentMeasurement) {
				currentMeasurement.setVisible(definingAngleNow);
				this._surface.update(this._viewport, this._viewport.getCamera());
			}
			if (this._currentFeature) {
				this._surface.removeFeature(this._currentFeature);
				this._currentFeature = null;
			}
		} else {
			var settings = this._settings;
			var allowFace = !data.shiftKey && settings.featureFace && !this._is2D;
			var allowEdge = !data.shiftKey && settings.featureEdge;
			var allowVertex = !data.shiftKey && settings.featureVertex;
			if (this._firstFeature) {
				// can only work in vertex-vertex-vertex or edge-edge or face-face modes
				allowFace = this._firstFeature.isFace;
				allowEdge = this._firstFeature.isEdge;
				allowVertex = this._firstFeature.isVertex;
			}

			if (definingAngleNow) {
				allowFace = false;
				allowEdge = false;
				allowVertex = false;
			}
			var needToUpdateMeasurement = true;

			if ((newHighlightedNodeRef || this._is2D) && !definingAngleNow) {
				needToUpdateMeasurement = this._updateCurrentFeature(newHighlightedNodeRef, this._hoverPoint.worldPoint, this._viewport, allowFace, allowEdge, allowVertex);
			} else if (this._currentFeature) {
				this._surface.removeFeature(this._currentFeature);
				this._currentFeature = null;
			}

			if (currentMeasurement && needToUpdateMeasurement) {
				this._updateMeasurement(currentMeasurement);
				currentMeasurement.setVisible(definingAngleNow || (this._currentFeature != null));
			}
			this._surface.update(this._viewport, this._viewport.getCamera());
		}

		return this;
	};

	AngleMeasurementToolGizmo.prototype.fixPoint = function(data) {
		this.setHoverPoint(data); // note: setHoverPoint() changes some states (otherwise clicking on the same point may cause a crash)
		var vsm = this._vsm;
		var outlinedNodeRef = this._hoverPoint && this._hoverPoint.nodeRef;
		var state = this._state;
		switch (state) {
			case State.SearchingFirstFeature:
				if (!data.worldPoint) {
					// don't allow starting a measurement on empty space in case of 3D
					break;
				}

				this._firstFeature = this._currentFeature;
				this._currentFeature = null;
				this.setCurrentFeatureIndex(1);
				this._state = State.SearchingSecondFeature;

				var worldPoint1 = data.worldPoint.slice();
				var worldPoint2 = data.worldPoint.slice();
				if (this._firstFeature && this._firstFeature.isVertex) {
					var vertex = this._firstFeature.getValue();
					worldPoint1[0] = vertex[0];
					worldPoint1[1] = vertex[1];
					worldPoint1[2] = vertex[2];
				}

				var initialState = 0;
				if (this._firstFeature && this._firstFeature.isEdge) {
					var edge = this._firstFeature.getValue();
					worldPoint1[0] = edge[0];
					worldPoint1[1] = edge[1];
					worldPoint1[2] = edge[2];
					worldPoint2[0] = edge[3];
					worldPoint2[1] = edge[4];
					worldPoint2[2] = edge[5];
					initialState = 1;
				}

				var measurement = new Angle({
					point1: worldPoint1,
					point2: worldPoint2,
					point3: worldPoint2,
					point4: worldPoint2,
					state: initialState
				});
				this._surface.beginMeasurementConstruction(measurement);
				this._currentMeasurement = measurement;
				break;

			case State.SearchingSecondFeature:
				if (!this._currentMeasurement.getVisible() || !this._currentMeasurement.isEdge1Defined()) {
					break;
				}

				this._surface.update(this._viewport, this._viewport.getCamera());

				if (outlinedNodeRef != null && vsm != null) {
					vsm.setOutliningStates([], [outlinedNodeRef], false, true);
				}

				this._secondFeature = this._currentFeature;
				this._currentFeature = null;
				this.setCurrentFeatureIndex(2);
				this._state = (this._currentMeasurement.getState() === 1) ? State.DefiningAngle : State.SearchingThirdFeature;
				break;

			case State.SearchingThirdFeature:
				if (!this._currentMeasurement.isEdge2Defined()) {
					break;
				}

				this._surface.update(this._viewport, this._viewport.getCamera());

				if (outlinedNodeRef != null && vsm != null) {
					vsm.setOutliningStates([], [outlinedNodeRef], false, true);
				}

				this._thirdFeature = this._currentFeature;
				this._currentFeature = null;
				this.setCurrentFeatureIndex(3);
				this._state = State.DefiningAngle;
				break;

			case State.DefiningAngle:
				if (!this._currentMeasurement.isEdge2Defined()) {
					break;
				}

				this._currentMeasurement.setState(2);
				this._currentMeasurement.setFeatures(this._thirdFeature != null ?
					[this._firstFeature, this._secondFeature, this._thirdFeature] :
					[this._firstFeature, this._secondFeature]);
				this._surface.update(this._viewport, this._viewport.getCamera());

				if (outlinedNodeRef != null && vsm != null) {
					vsm.setOutliningStates([], [outlinedNodeRef], false, true);
				}

				this._state = State.SearchingFirstFeature;

				if (this._currentFeature) {
					this._surface.removeFeature(this._currentFeature);
				}
				this._surface.removeFeature(this._thirdFeature);
				this._surface.removeFeature(this._secondFeature);
				this._surface.removeFeature(this._firstFeature);

				this._currentFeature = null;
				this._firstFeature = null;
				this._secondFeature = null;
				this._thirdFeature = null;
				this.setCurrentFeatureIndex(0);

				var newMeasurement = this._currentMeasurement;
				this._currentMeasurement = null;

				this._surface.endMeasurementConstruction(newMeasurement);
				break;

			default:
				break;
		}
		return this;
	};

	AngleMeasurementToolGizmo.prototype.escapePressed = function() {
		switch (this._state) {
			case State.DefiningAngle:
				this._state = State.SearchingThirdFeature;
				this._currentMeasurement.setRadiusScale(1);
				if (this._currentFeature) {
					this._surface.removeFeature(this._currentFeature);
					this._currentFeature = null;
				}

				if (this._thirdFeature) {
					this._surface.removeFeature(this._thirdFeature);
					this._thirdFeature = null;
					this.setCurrentFeatureIndex(2);
				}

				if (!this._firstFeature.isVertex) {
					// 2 features (not 3 like in vertex-vertex-vertex mode)
					this._state = State.SearchingSecondFeature;
					this._surface.removeFeature(this._secondFeature);
					this._secondFeature = null;
					this.setCurrentFeatureIndex(1);
					this._currentMeasurement.setVisible(false);
				}
				break;

			case State.SearchingThirdFeature:
				this._state = State.SearchingSecondFeature;
				this._currentMeasurement.setState(0);
				this._surface.removeFeature(this._secondFeature);
				this._secondFeature = null;
				this.setCurrentFeatureIndex(1);
				if (this._currentFeature) {
					this._surface.removeFeature(this._currentFeature);
					this._currentFeature = null;
				}
				break;

			case State.SearchingSecondFeature:
				this._state = State.SearchingFirstFeature;
				this._surface.removeFeature(this._firstFeature);
				this._firstFeature = null;
				if (this._currentFeature) {
					this._surface.removeFeature(this._currentFeature);
					this._currentFeature = null;
				}
				this.setCurrentFeatureIndex(0);
				this._surface.cancelMeasurementConstruction(this._currentMeasurement);
				this._currentMeasurement = null;
				break;

			case State.SearchingFirstFeature:
				var vsm = this._vsm;
				var outlinedNodeRef = this._hoverPoint && this._hoverPoint.nodeRef;
				if (outlinedNodeRef != null && vsm != null) {
					vsm.setOutliningStates([], [outlinedNodeRef], false, true);
				}

				if (this._currentFeature != null) {
					this._surface.removeFeature(this._currentFeature);
					this._currentFeature = null;
				}
				this._state = State.Off;
				this._tool.setActive(false, this._viewport);
				break;

			default:
				break;
		}

		if (this._currentMeasurement) {
			this._updateMeasurement(this._currentMeasurement);
		}

		if (this._state !== State.Off) {
			this._surface.update(this._viewport, this._viewport.getCamera());
		}
	};

	AngleMeasurementToolGizmo.prototype.is2D = function() {
		return this._is2D;
	};

	return AngleMeasurementToolGizmo;
});
