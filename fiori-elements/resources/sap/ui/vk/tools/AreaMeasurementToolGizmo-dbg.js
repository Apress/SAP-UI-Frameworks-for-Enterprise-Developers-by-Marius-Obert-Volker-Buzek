/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../measurements/Area",
	"../measurements/Face",
	"../measurements/Utils",
	"./MeasurementToolState",
	"./MeasurementToolGizmo"
], function(
	Area,
	Face,
	Utils,
	State,
	MeasurementToolGizmo
) {
	"use strict";

	var AreaMeasurementToolGizmo = MeasurementToolGizmo.extend("sap.ui.vk.tools.AreaMeasurementToolGizmo", /** @lends sap.ui.vk.tools.AreaMeasurementToolGizmo */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = AreaMeasurementToolGizmo.getMetadata().getParent().getClass().prototype;

	AreaMeasurementToolGizmo.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._pointsCountPerClick = null; // store number of points added with each click (can be more than 1 for sampled curved edges)
	};

	AreaMeasurementToolGizmo.prototype.beginMeasurementConstruction = function(measurement) {
		this._surface.beginMeasurementConstruction(measurement);
		this._currentMeasurement = measurement;
		this._pointsCountPerClick = [];
	};

	AreaMeasurementToolGizmo.prototype.cancelMeasurementConstruction = function() {
		this._surface.cancelMeasurementConstruction(this._currentMeasurement);
		this._currentMeasurement = null;
		this._pointsCountPerClick = null;
	};

	AreaMeasurementToolGizmo.prototype.endMeasurementConstruction = function() {
		var newMeasurement = this._currentMeasurement;
		this._currentMeasurement = null;
		this._surface.endMeasurementConstruction(newMeasurement);
		this._pointsCountPerClick = null;
	};

	AreaMeasurementToolGizmo.prototype.updateContour = function(points, reverse) {
		var nowCount = points.length / 3;
		if (this._pointsCountPerClick.length > 0) {
			var lastCount = this._pointsCountPerClick[this._pointsCountPerClick.length - 1];
			if ((lastCount === 1) && (nowCount === 1)) {
				this._currentMeasurement.replaceLastPoint(points);
			} else {
				this._currentMeasurement.replaceLastPoints(lastCount, points, reverse);
				this._pointsCountPerClick[this._pointsCountPerClick.length - 1] = nowCount;
			}
		} else {
			this._currentMeasurement.replaceLastPoints(0, points, reverse);
			this._pointsCountPerClick.push(nowCount);
		}
	};

	AreaMeasurementToolGizmo.prototype._finishArea = function(isVertexContour) {
		if (this._currentMeasurement.hasSelfIntersections()) {
			return;
		}

		var vsm = this._vsm;
		var outlinedNodeRef = this._hoverPoint && this._hoverPoint.nodeRef;

		this._currentMeasurement.finalize();
		this._surface.update(this._viewport, this._viewport.getCamera());

		if (outlinedNodeRef != null && vsm != null) {
			vsm.setOutliningStates([], [outlinedNodeRef], false, true);
		}

		this._state = State.SearchingFirstFeature;

		if (isVertexContour) {
			this._currentMeasurement.setFeatures(this._vertexFeatures);

			// we need to delete all features from the _vertexFeatures[] (it will also take care of _currentFeature)
			for (var i = 0, count = this._vertexFeatures.length; i < count; ++i) {
				this._surface.removeFeature(this._vertexFeatures[i]);
			}
		} else if (this._currentFeature) {
			this._currentMeasurement.setFeatures([this._currentFeature]);
			this._surface.removeFeature(this._currentFeature);
		}

		this._currentFeature = null;
		this.setCurrentFeatureIndex(0);
		this.endMeasurementConstruction();
	};

	AreaMeasurementToolGizmo.prototype._updateCurrentFeature = function(nodeRef, point, viewport, allowClosedContour, allowCurvedEdge) {
		var meshAnalyzer = nodeRef == null ? null : this._getMeshAnalyzer(nodeRef);
		var r = this._computeSphereRadius(point, viewport);
		var removeFeature = false;
		var shouldUpdate = false;

		var p = this._currentMeasurement ? this._currentMeasurement.getPoints() : null;
		var is2D = this._is2D;
		if (is2D && p && p.length > 9 && !Utils.isClosedContour(p) && Utils.computePointToPointDistance(point, p) < r) {
			// special case: clicking near the 1st point closes the contour
			this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], null, meshAnalyzer);
			this._currentFeature.setValue(p.slice(0, 3));
			return true;
		}

		if (meshAnalyzer != null) {
			var intersection = meshAnalyzer.intersectSphere(point, r, !is2D, is2D, is2D, allowClosedContour, allowCurvedEdge);
			if (is2D) {
				if (!intersection.contour && this._currentMeasurement && this._state === State.SearchingFirstFeature) {
					this.cancelMeasurementConstruction();
				}

				if (intersection.contour && this._state === State.SearchingFirstFeature) {
					// special case: a closed contour - we treat it as a 3d "face"
					if (this._replaceCurrentFeature(this._faceFeatures[this._currentFeatureIndex], intersection.contourId, meshAnalyzer)) {
						this._currentFeature.setValue({
							vertices: intersection.contour
						});
						return true;
					}

					shouldUpdate = true;
				} else if (intersection.curvedEdge != null) {
					if (!this._currentMeasurement) {
						var measurement = new Area({});
						this.beginMeasurementConstruction(measurement);
					}

					var edgePoints = intersection.curvedEdge;
					var lastOffset = edgePoints.length - 3;
					var firstEdgePoint = [edgePoints[0], edgePoints[1], edgePoints[2]];
					var lastEdgePoint = [edgePoints[lastOffset], edgePoints[lastOffset + 1], edgePoints[lastOffset + 2]];
					var reverseCurvedEdge = Utils.computePointToPointDistance2(point, firstEdgePoint) > Utils.computePointToPointDistance2(point, lastEdgePoint);
					this.updateContour(edgePoints, reverseCurvedEdge);

					if (this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], intersection.curvedEdgeId + ":" + (reverseCurvedEdge ? "r" : "l"), meshAnalyzer)) {
						this._currentFeature.setValue(reverseCurvedEdge ? firstEdgePoint : lastEdgePoint);
						return true;
					}
				} else if (intersection.vertex != null) {
					if (this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], intersection.vertexId, meshAnalyzer)) {
						this._currentFeature.setValue(intersection.vertex);
						return true;
					}
				} else if (intersection.edge != null) {
					// note: this is not a standard edge mode, but rather a "sample vertex on edge" mode
					this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], intersection.edgeId, meshAnalyzer);
					var e = intersection.edge;
					this._currentFeature.setValue(Utils.projectPointToEdge([e[0], e[1], e[2]], [e[3], e[4], e[5]], point));
					return true;
				} else {
					// Create a free point feature.
					this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], null, meshAnalyzer);
					this._currentFeature.setValue(point);
					return true;
				}
			} else {
				if (intersection.faceId != null) { // eslint-disable-line no-lonely-if
					if (this._replaceCurrentFeature(this._faceFeatures[this._currentFeatureIndex], intersection.faceId, meshAnalyzer)) {
						this._currentFeature.setValue(meshAnalyzer.buildFace(intersection.faceId));
						return true;
					}

					shouldUpdate = true;
				} else {
					removeFeature = true;
				}
			}
		} else if (is2D) {
			if (this._currentMeasurement && this._state === State.SearchingFirstFeature) {
				this.cancelMeasurementConstruction();
			}

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

	AreaMeasurementToolGizmo.prototype.setHoverPoint = function(data) {
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
		if (!data || data.worldPoint == null) {
			if (this._currentMeasurement) {
				this.cancelMeasurementConstruction();
			}
			if (this._currentFeature) {
				this._surface.removeFeature(this._currentFeature);
				this._currentFeature = null;
			}
		} else {
			var needToUpdateMeasurement = true;

			if (newHighlightedNodeRef || this._is2D) {
				var settings = this._settings;
				var allowCurvedEdge = !data.shiftKey && settings.featureEdge;
				var allowClosedContour = !data.shiftKey && settings.featureFace;
				needToUpdateMeasurement = this._updateCurrentFeature(newHighlightedNodeRef, this._hoverPoint.worldPoint, this._viewport, allowClosedContour, allowCurvedEdge);
			} else if (this._currentFeature) {
				this._surface.removeFeature(this._currentFeature);
				this._currentFeature = null;
			}

			var currentMeasurement = this._currentMeasurement;
			if (this._currentFeature && this._currentFeature.isFace) {
				if (!currentMeasurement) {
					currentMeasurement = new Area({});
					this.beginMeasurementConstruction(currentMeasurement);
				}
				currentMeasurement.setFromFace(this._currentFeature);
			} else if (currentMeasurement && needToUpdateMeasurement) {
				var worldPoint = this._hoverPoint.worldPoint.slice();
				if (this._currentFeature && this._currentFeature.isVertex) {
					var vertex = this._currentFeature.getValue();
					worldPoint[0] = vertex[0];
					worldPoint[1] = vertex[1];
					worldPoint[2] = vertex[2];
				}

				this.updateContour(worldPoint, false);
			}
			this._surface.update(this._viewport, this._viewport.getCamera());
		}

		return this;
	};

	AreaMeasurementToolGizmo.prototype.fixPoint = function(data) {
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

				if (this._currentMeasurement) {
					var currentPoints = this._currentMeasurement.getPoints();
					if (!currentPoints || !currentPoints.length || Utils.isClosedContour(currentPoints)) {
						// we already have an existing measurement in 2D/3D "face" case
						this._finishArea(false);
						this._surface.update(this._viewport, this._viewport.getCamera());
					} else {
						// existing measurement in "curved edge" mode
						this._currentMeasurement.duplicateLastPoint();
						this._pointsCountPerClick.push(1);
						this._currentFeature = null;
						this.setCurrentFeatureIndex(1);
						this._state = State.SearchingSecondFeature;
					}
					break;
				}

				// below is the vertex contour case
				var worldPoint = data.worldPoint.slice();
				if (this._currentFeature && this._currentFeature.isVertex) {
					var vertex = this._currentFeature.getValue();
					worldPoint[0] = vertex[0];
					worldPoint[1] = vertex[1];
					worldPoint[2] = vertex[2];
				}

				var measurement = new Area({
					points: worldPoint
				});
				measurement.duplicateLastPoint();
				this.beginMeasurementConstruction(measurement);
				this._pointsCountPerClick.push(1, 1);

				this._currentFeature = null;
				this.setCurrentFeatureIndex(1);
				this._state = State.SearchingSecondFeature;
				break;

			case State.SearchingSecondFeature:
				var p = this._currentMeasurement.getPoints();
				if (this._currentMeasurement.getArea() && p.length > 9 && Utils.computePointToPointDistance2(p, p, p.length - 3) === 0) {
					// first point == last
					this._finishArea(true);
					break;
				}

				if (!this._currentMeasurement.hasSelfIntersectionsLastEdge()) {
					this._currentMeasurement.duplicateLastPoint();
					this._pointsCountPerClick.push(1);

					if (outlinedNodeRef != null && vsm != null) {
						vsm.setOutliningStates([], [outlinedNodeRef], false, true);
					}

					var currentFeature = this._currentFeature;
					var oldContext = currentFeature.getContext();
					var oldFeatureId = currentFeature.getFeatureId();
					var oldValue = currentFeature.getValue();
					this.setCurrentFeatureIndex(this._currentFeatureIndex + 1);
					currentFeature = this._vertexFeatures[this._currentFeatureIndex];
					currentFeature.setContext(oldContext);
					currentFeature.setFeatureId(oldFeatureId);
					currentFeature.setValue(oldValue);
					this._surface.addFeature(currentFeature);
					this._currentFeature = currentFeature;
					this._state = State.SearchingSecondFeature;
					this._surface.update(this._viewport, this._viewport.getCamera());
				}
				break;

			default:
				break;
		}
		return this;
	};

	AreaMeasurementToolGizmo.prototype.escapePressed = function() {
		switch (this._state) {
			case State.SearchingSecondFeature:
				// note: "SearchingSecondFeature" is only possible for 2d vertex contours (never for 3d faces)
				if (this._currentFeatureIndex >= 2) {
					var countLast = this._pointsCountPerClick.pop();
					var countPred = this._pointsCountPerClick.pop();
					this._pointsCountPerClick.push(countLast);
					this._currentMeasurement.deletePredLastPoints(countPred);
					this._surface.removeFeature(this._vertexFeatures[this._currentFeatureIndex - 1]);
					this._vertexFeatures[this._currentFeatureIndex - 1].setContext(this._currentFeature.getContext());
					this._vertexFeatures[this._currentFeatureIndex - 1].setFeatureId(this._currentFeature.getFeatureId());
					this._vertexFeatures[this._currentFeatureIndex - 1].setValue(this._currentFeature.getValue());
					this._surface.removeFeature(this._currentFeature);
					this._currentFeature = null;
					this.setCurrentFeatureIndex(this._currentFeatureIndex - 1);
					this._currentFeature = this._vertexFeatures[this._currentFeatureIndex];
					this._surface.addFeature(this._currentFeature);
				} else {
					this._state = State.SearchingFirstFeature;
					if (this._currentFeature) {
						this._surface.removeFeature(this._currentFeature);
						this._currentFeature = null;
					}
					this.setCurrentFeatureIndex(0);
					this.cancelMeasurementConstruction();
				}

				this._surface.update(this._viewport, this._viewport.getCamera());
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
	};

	AreaMeasurementToolGizmo.prototype.doubleClick = function(data) {
		this.setHoverPoint(data); // note: setHoverPoint() changes some states (otherwise clicking on the same point may cause a crash)
		var measurement = (this._state === State.SearchingSecondFeature) ? this._currentMeasurement : null;
		if (measurement && measurement.getArea()) {
			this._finishArea(true);
			return true;
		}

		return false;
	};

	AreaMeasurementToolGizmo.prototype.is2D = function() {
		return this._is2D;
	};

	return AreaMeasurementToolGizmo;
});
