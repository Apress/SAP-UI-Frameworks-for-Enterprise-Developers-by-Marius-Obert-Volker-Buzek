/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Callout class.
sap.ui.define([
	"../thirdparty/three",
	"sap/ui/base/ManagedObject",
	"./PolylineGeometry",
	"./PolylineMaterial",
	"./PolylineMesh",
	"../LeaderLineMarkStyle"
], function(
	THREE,
	BaseObject,
	PolylineGeometry,
	PolylineMaterial,
	PolylineMesh,
	LeaderLineMarkStyle
) {
	"use strict";

	/**
	 * Constructor for a new Thrustline.
	 *
	 * @class
	 *
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.threejs.Thrustline
	 * @experimental Since 1.65.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Thrustline = BaseObject.extend("sap.ui.vk.threejs.Thrustline", /** @lends sap.ui.vk.threejs.Thrustline.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				node: {
					type: "object"
				},
				renderOrder: {
					type: "int",
					defaultValue: 0
				},
				depthTest: {
					type: "boolean",
					defaultValue: true
				},
				principleAxis: {
					type: "object", // THREE.Vector3
					defaultValue: new THREE.Vector3(0, 0, 0)
				},
				material: {
					type: "object"
				},
				items: {
					type: "object[]"
				},
				segments: {
					type: "object[]"
				}
			}
		}
	});

	Thrustline.prototype.init = function() {
		if (BaseObject.prototype.init) {
			BaseObject.prototype.init.call(this);
		}

		this._needUpdateMeshes = false;
	};

	Thrustline.prototype.setNode = function(node) {
		if (node instanceof THREE.Object3D) {
			this.setProperty("node", node, true);
			this._needUpdateMeshes = true;
		}
		return this;
	};

	Thrustline.prototype.setRenderOrder = function(value) {
		this.setProperty("renderOrder", value, true);
		this._needUpdateMeshes = true;
		return this;
	};

	Thrustline.prototype.setDepthTest = function(value) {
		this.setProperty("depthTest", value, true);
		this._needUpdateMeshes = true;
		return this;
	};

	Thrustline.prototype.setMaterial = function(material) {
		if (material instanceof THREE.Material) {
			this.setProperty("material", material, true);
			this._needUpdateMeshes = true;
		}
		return this;
	};

	Thrustline.prototype.setItems = function(value) {
		this.setProperty("items", value, true);
		this._needUpdateMeshes = true;
		return this;
	};

	Thrustline.prototype.setSegments = function(value) {
		this.setProperty("segments", value, true);
		this._needUpdateMeshes = true;
		return this;
	};

	Thrustline.prototype._updateMeshes = function(viewportSize) {
		var node = this.getNode();
		var material = this.getMaterial();
		var depthTest = this.getDepthTest();
		var renderOrder = this.getRenderOrder();
		var lineStyle = material && material.userData.lineStyle ? material.userData.lineStyle : {};
		var lineWidth = lineStyle.width;
		var dashPatternScale = lineStyle.dashPatternScale;
		if (lineStyle.widthCoordinateSpace === 3) {
			lineWidth = lineWidth ? lineWidth * viewportSize.y : 1;
			dashPatternScale = dashPatternScale ? dashPatternScale * viewportSize.y : 1;
		}
		lineWidth = lineWidth || 1;
		lineStyle.haloWidth = lineStyle.haloWidth || 0;
		lineStyle.endCapStyle = lineStyle.endCapStyle || 0;

		this.getSegments().forEach(function(segment) {
			if (segment.polylineMesh) {
				node.remove(segment.polylineMesh);
				segment.polylineMesh = null;
			}

			if (segment.haloMesh) {
				node.remove(segment.haloMesh);
				segment.haloMesh = null;
			}

			var vertices = [];
			for (var i = 0, l = segment.ratios.length; i < l; i++) {
				vertices.push(new THREE.Vector3());
			}

			var polylineGeometry = new PolylineGeometry();
			polylineGeometry.setVertices(vertices);

			var segmentCapStyle = lineStyle.endCapStyle || vertices.length > 2 ? 1 : 0;
			var trimStyle = (segmentCapStyle && lineStyle.endCapStyle === 0 ? 1 : 0) | (segmentCapStyle && lineStyle.endCapStyle === 0 ? 2 : 0);

			if (lineStyle.haloWidth > 0) {
				var haloMaterial = new PolylineMaterial({
					color: 0xFFFFFF, // selection/highlighting
					lineColor: 0xFFFFFF,
					linewidth: lineWidth * (lineStyle.haloWidth * 2 + 1),
					dashCapStyle: lineStyle.endCapStyle,
					segmentCapStyle: segmentCapStyle,
					trimStyle: trimStyle,
					transparent: true,
					depthTest: depthTest
				});

				var haloMesh = new PolylineMesh(polylineGeometry, haloMaterial);
				haloMesh.matrixAutoUpdate = false;
				haloMesh.renderOrder = renderOrder;
				haloMesh.userData.skipIt = true;

				segment.haloMesh = haloMesh;
				node.add(haloMesh);
			}

			var polylineMaterial = new PolylineMaterial({
				color: 0xFFFFFF,
				lineColor: material.color,
				linewidth: lineWidth,
				dashCapStyle: lineStyle.endCapStyle,
				segmentCapStyle: segmentCapStyle,
				trimStyle: trimStyle,
				dashPattern: lineStyle.dashPattern || [],
				dashScale: dashPatternScale || 1,
				transparent: true,
				depthTest: depthTest,
				polygonOffset: true,
				polygonOffsetFactor: -4
			});

			var polylineMesh = new PolylineMesh(polylineGeometry, polylineMaterial);
			polylineMesh.matrixAutoUpdate = false;
			polylineMesh.renderOrder = renderOrder;
			polylineMesh.userData.skipIt = true;

			segment.polylineMesh = polylineMesh;
			node.add(polylineMesh);
		});
	};

	var matViewProj = new THREE.Matrix4(),
		matWorldViewProj = new THREE.Matrix4(),
		axis = new THREE.Vector3(),
		dir = new THREE.Vector3(),
		dirX = new THREE.Vector3(),
		dirY = new THREE.Vector3();

	Thrustline.prototype._update = function(renderer, camera, viewportSize) {
		var node = this.getNode();
		if (!node || !node.visible) {
			return;
		}

		if (this._needUpdateMeshes) {
			this._needUpdateMeshes = false;
			this._updateMeshes(viewportSize);
		}

		matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		// matWorldViewProj.multiplyMatrices(matViewProj, node.matrixWorld);
		matWorldViewProj.copy(matViewProj);

		var nearZ = camera instanceof THREE.PerspectiveCamera ? camera.near : undefined;
		var items = this.getItems();
		axis.copy(this.getPrincipleAxis()).normalize();

		this.getSegments().forEach(function(segment) {
			var polylineMesh = segment.polylineMesh;
			if (polylineMesh) {
				var geometry = polylineMesh.geometry;

				var startItem = items[segment.startItemIndex];
				var startPoint = new THREE.Vector3().copy(startItem.boundPoints[segment.startBoundIndex]).applyMatrix4(startItem.target.matrixWorld);

				var endItem = items[segment.endItemIndex];
				var endPoint = new THREE.Vector3().copy(endItem.boundPoints[segment.endBoundIndex]).applyMatrix4(endItem.target.matrixWorld);

				dir.copy(endPoint).sub(startPoint);
				dirX.copy(axis).multiplyScalar(dir.dot(axis));
				dirY.copy(dir).sub(dirX);

				var vertices = geometry.vertices;
				var indicesToUpdate = [];
				for (var i = 0, l = segment.ratios.length; i < l; i++) {
					indicesToUpdate.push(i);

					var ratio = segment.ratios[i];
					var vertex = vertices[i];
					vertex.copy(startPoint);

					dir.copy(dirX).multiplyScalar(ratio.x);
					vertex.add(dir);

					dir.copy(dirY).multiplyScalar(ratio.y);
					vertex.add(dir);
				}

				geometry._updateVertices(indicesToUpdate);

				polylineMesh.material.resolution.copy(viewportSize);
				polylineMesh.computeLineDistances(matWorldViewProj, viewportSize, nearZ);
			}

			var haloMesh = segment.haloMesh;
			if (haloMesh) {
				haloMesh.material.resolution.copy(viewportSize);
				haloMesh.computeLineDistances(matWorldViewProj, viewportSize, nearZ);
			}
		});
	};

	return Thrustline;
});
