/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"../measurements/Distance",
	"../measurements/Utils",
	"./MeasurementToolState",
	"./MeasurementToolGizmo"
], function(
	Distance,
	Utils,
	State,
	MeasurementToolGizmo
) {
	"use strict";

	var DistanceMeasurementToolGizmo = MeasurementToolGizmo.extend("sap.ui.vk.tools.DistanceMeasurementToolGizmo", /** @lends sap.ui.vk.tools.DistanceMeasurementToolGizmo */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = DistanceMeasurementToolGizmo.getMetadata().getParent().getClass().prototype;

	DistanceMeasurementToolGizmo.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}
	};

	DistanceMeasurementToolGizmo.prototype._updateCurrentFeature = function(nodeRef, point, viewport, allowFace, allowEdge, allowVertex) {
		var meshAnalyzer = nodeRef == null ? null : this._getMeshAnalyzer(nodeRef);
		var r = this._computeSphereRadius(point, viewport);
		var removeFeature = false;

		if (meshAnalyzer != null && (allowFace || allowEdge || allowVertex)) {
			var intersection = meshAnalyzer.intersectSphere(point, r, allowFace, allowEdge, allowVertex, false, false);
			if (this._is2D) {
				if (intersection.vertex != null) {
					if (this._replaceCurrentFeature(this._vertexFeatures[this._currentFeatureIndex], intersection.vertexId, meshAnalyzer)) {
						this._currentFeature.setValue(intersection.vertex);
						return true;
					}
				} else if (intersection.edge != null) {
					if (this._replaceCurrentFeature(this._edgeFeatures[this._currentFeatureIndex], intersection.edgeId, meshAnalyzer)) {
						this._currentFeature.setValue(intersection.edge);
						return true;
					}
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
					if (this._replaceCurrentFeature(this._faceFeatures[this._currentFeatureIndex], intersection.faceId, meshAnalyzer)) {
						this._currentFeature.setValue(meshAnalyzer.buildFace(intersection.faceId));
						return true;
					}
				} else {
					removeFeature = true;
				}
			}
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

		return false;
	};

	DistanceMeasurementToolGizmo.prototype._updateMeasurement = function(currentMeasurement) {
		var feature1 = this._firstFeature;
		var feature2 = this._currentFeature;
		var change1 = feature1 && (feature1.isEdge || feature1.isFace);
		var change2 = feature2 && (feature2.isEdge || feature2.isFace);

		var p = this._hoverPoint.worldPoint;
		var np1 = null;

		// snap to vertex for 2nd feature?
		if (feature2 && feature2.isVertex) {
			p = feature2.getValue();
		}

		// modify points of the measurement
		if (change1 && change2) {
			var res;
			if (feature1.isEdge) {
				if (feature2.isEdge) {
					// edge to edge
					res = Utils.findClosestPointEdgeToEdge(feature2.getValue(), feature1.getValue());
				} else {
					// edge to face
					res = Utils.findClosestPointFaceToEdge(feature2.getValue(), feature1.getValue());
				}

				np1 = [res[3], res[4], res[5]];
				p[0] = res[0];
				p[1] = res[1];
				p[2] = res[2];
			} else {
				if (feature2.isEdge) {
					// face to edge
					res = Utils.findClosestPointFaceToEdge(feature1.getValue(), feature2.getValue());
				} else {
					// face to face
					res = Utils.findClosestPointFaceToFace(feature1.getValue(), feature2.getValue());
				}

				np1 = [res[0], res[1], res[2]];
				p[0] = res[3];
				p[1] = res[4];
				p[2] = res[5];
			}
		} else if (change1) {
			// only update 1st point
			if (feature1.isEdge) {
				np1 = Utils.findClosestPointEdgeToPoint(feature1.getValue(), p);
			} else {
				np1 = Utils.findClosestPointFaceToPoint(feature1.getValue(), p);
			}
		} else if (change2) {
			// only update 2nd point
			var p1 = currentMeasurement.getPoint1();
			if (feature2.isEdge) {
				p = Utils.findClosestPointEdgeToPoint(feature2.getValue(), p1);
			} else {
				p = Utils.findClosestPointFaceToPoint(feature2.getValue(), p1);
			}
		}

		// only update 1st point if necessary
		if (np1) {
			currentMeasurement.setPoint1(np1);
		}

		// 2nd point is always updated
		currentMeasurement.setPoint2(p);
	};

	DistanceMeasurementToolGizmo.prototype.setHoverPoint = function(data) {
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

		var currentMeasurement = this._state === State.SearchingSecondFeature ? this._currentMeasurement : null;
		if (!data || data.worldPoint == null) {
			if (currentMeasurement) {
				currentMeasurement.setVisible(false);
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
			var needToUpdateMeasurement = true;

			if (newHighlightedNodeRef || this._is2D) {
				needToUpdateMeasurement = this._updateCurrentFeature(newHighlightedNodeRef, this._hoverPoint.worldPoint, this._viewport, allowFace, allowEdge, allowVertex);
			} else if (this._currentFeature) {
				this._surface.removeFeature(this._currentFeature);
				this._currentFeature = null;
			}

			if (currentMeasurement && needToUpdateMeasurement) {
				this._updateMeasurement(currentMeasurement);
				currentMeasurement.setVisible(true);
			}
			this._surface.update(this._viewport, this._viewport.getCamera());
		}

		return this;
	};

	DistanceMeasurementToolGizmo.prototype.fixPoint = function(data) {
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

				var worldPoint = data.worldPoint.slice();
				if (this._firstFeature && this._firstFeature.isVertex) {
					var vertex = this._firstFeature.getValue();
					worldPoint[0] = vertex[0];
					worldPoint[1] = vertex[1];
					worldPoint[2] = vertex[2];
				}

				var measurement = new Distance({
					point1: worldPoint,
					point2: worldPoint
				});
				this._surface.beginMeasurementConstruction(measurement);
				this._currentMeasurement = measurement;
				break;

			case State.SearchingSecondFeature:
				if (this._currentMeasurement.getDistance() < 1e-5) {
					break;
				}

				this._currentMeasurement.setShowArrows(true);
				this._currentMeasurement.setFeatures([this._firstFeature, this._currentFeature]);
				this._surface.update(this._viewport, this._viewport.getCamera());

				this._state = State.SearchingFirstFeature;

				this._surface.removeFeature(this._currentFeature);
				this._surface.removeFeature(this._firstFeature);

				this._currentFeature = null;
				this._firstFeature = null;
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

	DistanceMeasurementToolGizmo.prototype.escapePressed = function() {
		switch (this._state) {
			case State.SearchingSecondFeature:
				this._state = State.SearchingFirstFeature;
				this._surface.removeFeature(this._firstFeature);
				if (this._currentFeature) {
					this._surface.removeFeature(this._currentFeature);
				}
				this._firstFeature = this._currentFeature = null;
				this.setCurrentFeatureIndex(0);
				this._surface.cancelMeasurementConstruction(this._currentMeasurement);
				this._currentMeasurement = null;
				break;

			case State.SearchingFirstFeature:
				if (this._currentFeature != null) {
					this._surface.removeFeature(this._currentFeature);
				}
				this._firstFeature = this._currentFeature = null;
				this.setCurrentFeatureIndex(0);
				this._state = State.Off;
				this._tool.setActive(false, this._viewport);
				break;

			default:
				break;
		}
	};

	DistanceMeasurementToolGizmo.prototype.is2D = function() {
		return this._is2D;
	};

	return DistanceMeasurementToolGizmo;
});
