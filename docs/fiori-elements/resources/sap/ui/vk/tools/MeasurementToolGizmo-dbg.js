/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/base/Log",
	"../measurements/Edge",
	"../measurements/Face",
	"../measurements/Vertex",
	"../measurements/MeshAnalyzer",
	"../measurements/MeshAnalyzer2D",
	"../measurements/Settings",
	"./MeasurementToolState",
	"./Gizmo",
	"../thirdparty/three"
], function(
	core,
	Log,
	Edge,
	Face,
	Vertex,
	MeshAnalyzer,
	MeshAnalyzer2D,
	Settings,
	State,
	Gizmo,
	THREE
) {
	"use strict";

	var MeasurementToolGizmo = Gizmo.extend("sap.ui.vk.tools.MeasurementToolGizmo", /** @lends sap.ui.vk.tools.MeasurementToolGizmo */ {
		metadata: {
			library: "sap.ui.vk"
		}
	});

	var basePrototype = MeasurementToolGizmo.getMetadata().getParent().getClass().prototype;

	MeasurementToolGizmo.prototype.hasDomElement = function() {
		return false;
	};

	MeasurementToolGizmo.prototype.init = function() {
		if (basePrototype.init) {
			basePrototype.init.call(this);
		}

		this._viewport = null;
		this._surface = null;
		this._tool = null;
		this._vsm = null;
		this._settings = null;

		this._state = State.Off;

		// The current point under the mouse cursor.
		// { screenPoint: [x, y], worldPoint: [x, y, z], nodeRef: any }
		this._hoverPoint = null;

		// The current feature - whatever is under the mouse cursor. A reference to either
		// `_vertexFeatures[_currentFeatureIndex]` or `_edgeFeatures[_currentFeatureIndex]` or
		// `_faceFeatures[_currentFeatureIndex]` or `null` if the mouse cursor is not over
		// an object.
		this._currentFeature = null;

		// The index in arrays `_vertexFeatures`, `_edgeFeatures`, `_faceFeatures`.
		// It equals `0` when `_state === State.SearchingFirstFeature`,
		// equals `1` when `_state === State.SearchingSecondFeature` and
		// equals `2` when `_state === State.SearchingThirdFeature` and
		this._currentFeatureIndex = 0;

		// The first selected feature.
		this._firstFeature = null;

		// The second selected feature.
		this._secondFeature = null;

		// These are cache objects in order not to create them every time a feature is detected/selected.
		this._vertexFeatures = [new Vertex()];
		this._edgeFeatures = [new Edge()];
		this._faceFeatures = [new Face()];

		this._currentMeasurement = null;

		this._meshAnalyzerMap = new Map();
		this._is2D = false;
	};

	MeasurementToolGizmo.prototype.setCurrentFeatureIndex = function(index) {
		if (index < 1 && this._firstFeature) {
			Log.error("setCurrentFeatureIndex: first feature not null with index=" + index);
		}
		if (index < 2 && this._secondFeature) {
			Log.error("setCurrentFeatureIndex: second feature not null with index=" + index);
		}

		var delta = index - this._currentFeatureIndex;
		if (delta === 1) {
			// Log.warning("setCurrentFeatureIndex transition: " + this._currentFeatureIndex + " => " + index);
			this._currentFeatureIndex++;

			this._vertexFeatures.push(new Vertex());
			this._edgeFeatures.push(new Edge());
			this._faceFeatures.push(new Face());
		} else if (delta === -1) {
			// Log.warning("setCurrentFeatureIndex transition: " + this._currentFeatureIndex + " => " + index);
			this._currentFeatureIndex--;

			this._vertexFeatures.pop();
			this._edgeFeatures.pop();
			this._faceFeatures.pop();
		} else if (index === 0) {
			// Log.warning("setCurrentFeatureIndex reset: " + this._currentFeatureIndex + " => " + index);
			this._currentFeatureIndex = 0;
			this._vertexFeatures.splice(1);
			this._edgeFeatures.splice(1);
			this._faceFeatures.splice(1);
		} else if (delta !== 0) {
			// we are expecting only increase/decrease of array dimensions by 1
			Log.error("setCurrentFeatureIndex: " + this._currentFeatureIndex + " => " + index);
		}
	};

	MeasurementToolGizmo.prototype._createMeshAnalyzer = function(nodeRef) {
		var meshAnalyzer = null;
		var indexCount = 0;
		var lineCount = 0;

		var processNode = function(nodeRef) {
			if (nodeRef.geometry && nodeRef.geometry.isBufferGeometry) {
				var pos = nodeRef.geometry.getAttribute("position");
				var idx = nodeRef.geometry.getIndex();
				if (pos && idx) {
					var rg = nodeRef.userData.renderGroup;
					if (meshAnalyzer) {
						for (var i = rg ? rg.start : 0, count = rg ? (rg.start + rg.count) : idx.count; i < count; i += 3) {
							var v0 = new THREE.Vector3().fromArray(pos.array, idx.array[i] * 3);
							var v1 = new THREE.Vector3().fromArray(pos.array, idx.array[i + 1] * 3);
							var v2 = new THREE.Vector3().fromArray(pos.array, idx.array[i + 2] * 3);
							v0.applyMatrix4(nodeRef.matrixWorld);
							v1.applyMatrix4(nodeRef.matrixWorld);
							v2.applyMatrix4(nodeRef.matrixWorld);
							meshAnalyzer.addTriangle([v0.x, v0.y, v0.z], [v1.x, v1.y, v1.z], [v2.x, v2.y, v2.z]);
						}
					} else {
						indexCount += rg ? rg.count : idx.count;
					}
				}
			}

			nodeRef.children.forEach(processNode);
		};

		for (var pass = 0; pass < 2; ++pass) {
			processNode(nodeRef);
			if (pass === 0) {
				meshAnalyzer = new MeshAnalyzer(indexCount / 3, lineCount);
			}
		}

		meshAnalyzer.finishMeshBuilding();
		return meshAnalyzer;
	};

	MeasurementToolGizmo.prototype._createMeshAnalyzer2D = function(nodeRef) {
		return new MeshAnalyzer2D(nodeRef, this._viewport.getCamera()._getViewBox());
	};

	MeasurementToolGizmo.prototype._getMeshAnalyzer = function(nodeRef) {
		var existing = this._meshAnalyzerMap.get(nodeRef);
		if (existing != null) {
			return existing;
		}

		var meshAnalyzer = this._is2D ? this._createMeshAnalyzer2D(nodeRef) : this._createMeshAnalyzer(nodeRef);
		this._meshAnalyzerMap.set(nodeRef, meshAnalyzer);
		return meshAnalyzer;
	};

	MeasurementToolGizmo.prototype.show = function(viewport, tool) {
		this._viewport = viewport;
		this._surface = viewport.getMeasurementSurface();
		this._tool = tool;
		this._vsm = core.byId(viewport.getViewStateManager());
		this._is2D = viewport.getScene().getMetadata().getName() === "sap.ui.vk.svg.Scene";
		this._settings = Settings.load();

		this._state = State.SearchingFirstFeature;
		this.setCurrentFeatureIndex(0);
	};

	MeasurementToolGizmo.prototype.hide = function() {
		// Hide the measurement construction objects here if any.

		if (this._surface != null) {
			var surface = this._surface;

			for (var fi = 0, fc = this._faceFeatures.length; fi < fc; ++fi) {
				surface.removeFeature(this._faceFeatures[fi]);
			}

			for (var ei = 0, ec = this._edgeFeatures.length; ei < ec; ++ei) {
				surface.removeFeature(this._edgeFeatures[ei]);
			}

			for (var vi = 0, vc = this._vertexFeatures.length; vi < vc; ++vi) {
				surface.removeFeature(this._vertexFeatures[vi]);
			}

			if (this._currentMeasurement != null) {
				surface.removeMeasurement(this._currentMeasurement);
				this._currentMeasurement = null;
			}
		}

		var vsm = this._vsm;
		var outlinedNodeRef = this._hoverPoint && this._hoverPoint.nodeRef;
		if (outlinedNodeRef != null && vsm != null) {
			vsm.setOutliningStates([], [outlinedNodeRef], false, true);
		}

		this._viewport = null;
		this._surface = null;
		this._tool = null;
		this._vsm = null;
		this._settings = null;

		this._state = State.Off;
		this._currentFeature = null;
		this._firstFeature = null;
		this._secondFeature = null;
		this.setCurrentFeatureIndex(0);
		this._hoverPoint = null;
	};

	MeasurementToolGizmo.prototype._computeSphereRadius = function(point, viewport) {
		var r = this._is2D ? 5 : 3; // pixels

		if (this._is2D) {
			var sp = viewport._camera._worldToScreen(point[0], point[1]);
			var p0 = viewport._camera._screenToWorld(sp.x + r, sp.y);
			r = Math.abs(point[0] - p0.x);
		} else {
			var viewportRect = viewport.getDomRef().getBoundingClientRect();
			var halfWidth = viewportRect.width * 0.5;
			var halfHeight = viewportRect.height * 0.5;
			var cameraRef = viewport.getCamera().getCameraRef();
			var worldPoint = new THREE.Vector3().fromArray(point);
			var screenPoint = worldPoint.clone();
			screenPoint.project(cameraRef);
			var rx = r / halfWidth;
			var ry = r / halfHeight;

			// figure out sphere R in world space knowing its desired R in screen space
			// todo: it is possible to do this without a loop and with better precision
			r = 0;
			for (var ip = 0; ip < 4; ++ip) {
				// test 4 points: [+rx, 0], [-rx, 0], [0, +ry], [0, -ry]
				var sign = (ip % 2) ? -1 : 1;
				var unprojected = new THREE.Vector3(
					screenPoint.x + sign * ((ip < 2) ? rx : 0),
					screenPoint.y + sign * ((ip >= 2) ? ry : 0),
					screenPoint.z);

				unprojected.unproject(cameraRef);
				var d = unprojected.distanceTo(worldPoint);
				if (d > r) {
					r = d;
				}
			}
		}

		return r;
	};

	MeasurementToolGizmo.prototype._replaceCurrentFeature = function(feature, featureId, meshAnalyzer) {
		var needToUpdate = false;
		if (feature !== this._currentFeature) {
			// A totally new type of feature, e.g. it was Face, it became Vertex.
			this._surface.removeFeature(this._currentFeature);
			this._surface.addFeature(feature);
			this._currentFeature = feature;
			needToUpdate = true;
		} else if (meshAnalyzer !== feature.getContext() || featureId !== feature.getFeatureId()) {
			// The type of the feature stays the same, but the feature itself changes, e.g. it was
			// one edge on an object, it became another edge on the same or another object.
			needToUpdate = true;
		}

		if (needToUpdate) {
			feature.setContext(meshAnalyzer);
			feature.setFeatureId(featureId);
		}

		return needToUpdate;
	};

	return MeasurementToolGizmo;
});
