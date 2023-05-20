/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Callout class.
sap.ui.define([
	"../thirdparty/three",
	"sap/ui/base/ManagedObject",
	"./Billboard",
	"../thirdparty/html2canvas",
	"./PolylineGeometry",
	"./PolylineMaterial",
	"./PolylineMesh",
	"../BillboardStyle",
	"../LeaderLineMarkStyle",
	"./ThreeUtils"
], function(
	THREE,
	BaseObject,
	Billboard,
	html2canvas,
	PolylineGeometry,
	PolylineMaterial,
	PolylineMesh,
	BillboardStyle,
	LeaderLineMarkStyle,
	ThreeUtils
) {
	"use strict";

	/**
	 * Constructor for a new Callout.
	 *
	 * @class
	 *
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.vk.threejs.Billboard
	 * @alias sap.ui.vk.threejs.Callout
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Callout = Billboard.extend("sap.ui.vk.threejs.Callout", /** @lends sap.ui.vk.threejs.Callout.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				anchorNode: {
					type: "any", // THREE.Object3D
					defaultValue: null
				},
				depthTest: {
					type: "boolean",
					defaultValue: true
				}
			}
		}
	});

	Callout.prototype.init = function() {
		if (Billboard.prototype.init) {
			Billboard.prototype.init.call(this);
		}

		this._lines = [];
		this._heads = [];
	};

	Callout.prototype.exit = function() {
		if (Billboard.prototype.exit) {
			Billboard.prototype.exit.call(this);
		}

		this._lines.forEach(function(l) {
			ThreeUtils.disposeObject(l);
		});
		this._lines = null;

		this._heads.forEach(function(h) {
			ThreeUtils.disposeObject(h);
		});
		this._heads = null;
	};

	Callout.prototype._traverse = function(callback) {
		Billboard.prototype._traverse.call(this, callback);
		this._lines.forEach(callback);
		this._heads.forEach(callback);
	};

	Callout.prototype.setDepthTest = function(value) {
		this.setProperty("depthTest", value, true);
		this._traverse(function(child) {
			child.material.depthTest = value;
		});
		return this;
	};

	var pos4 = new THREE.Vector4(),
		pa = new THREE.Vector4(),
		pb = new THREE.Vector4(),
		bbPos = new THREE.Vector2(), // billboard screen position
		lvPos = new THREE.Vector2(), // line vertex screen position
		markPos = new THREE.Vector2(), // mark screen position
		q = new THREE.Quaternion(),
		mat = new THREE.Matrix4(),
		dir = new THREE.Vector2(),
		axisX = new THREE.Vector3(),
		axisY = new THREE.Vector3(),
		axisZ = new THREE.Vector3(0, 0, 1),
		matViewProj = new THREE.Matrix4(),
		matWorldViewProj = new THREE.Matrix4();

	Callout.prototype._update = function(renderer, camera, viewportSize) {
		var node = this.getNode();
		if (!node || !node.visible) {
			return;
		}

		if (this._needUpdateTexture) {
			this._needUpdateTexture = false;
			this._updateTexture();
		}

		node.matrix.copy(node.parent.matrixWorld).invert();
		node.matrix.decompose(node.position, node.quaternion, node.scale);
		node.matrixWorld.identity();

		var srcPosition = this.getPosition(),
			position = this._billboard.position;
		if (srcPosition) {
			position.copy(srcPosition);
		} else {
			position.setScalar(0);
		}

		var anchorNode = this.getAnchorNode();
		if (anchorNode) {
			position.applyMatrix4(anchorNode.matrixWorld);
		}

		// set billboard rotation
		this._billboard.quaternion.copy(camera.quaternion);

		matViewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

		// calculate billboard screen position
		pos4.copy(position).applyMatrix4(matViewProj);
		bbPos.copy(pos4).multiplyScalar(1 / pos4.w).multiply(viewportSize);

		// set billboard scale
		var scale = pos4.w * 2 / (viewportSize.x * camera.projectionMatrix.elements[0]);
		this._billboard.scale.set(scale * this._width, scale * this._height, 1);

		// add per pixel alignment to the billboard
		axisX.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(scale * (Math.round(bbPos.x * 0.5) - bbPos.x * 0.5));
		axisY.setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(scale * (Math.round(bbPos.y * 0.5) - bbPos.y * 0.5));
		position.add(axisX).add(axisY);

		this._billboard.updateMatrix();
		this._billboard.updateMatrixWorld();

		var circularShape = this.getStyle() === BillboardStyle.CircularShape;
		var nearZ = camera.near;

		function getDelta(p, p1, p2) {
			if (p < p1) {
				return p - p1;
			} else if (p > p2) {
				return p - p2;
			}
			return 0;
		}

		// update leader lines
		this._lines.forEach(function(line) {
			if (line.userData.targetNode) {
				line.matrix.copy(line.userData.targetNode.matrixWorld);
			} else {
				line.matrix.identity();
			}
			line.matrixWorld.copy(line.matrix);

			if (line.isPolylineMesh) {
				line.material.resolution.copy(viewportSize);
			}

			if (line.isHaloMesh) {
				return; // the halo polyline uses the same geometry as the main polyline, we don't want to update the geometry twice
			}

			var vertices = line.geometry.vertices;
			var v0 = vertices[0]; // target point
			var v1 = vertices[vertices.length - 2];
			var v2 = vertices[vertices.length - 1]; // billboard attachment point
			var markMesh = line.userData.startPointMesh;
			var hideLastSegment = false;
			var indicesToUpdate = [0, vertices.length - 1];

			if (markMesh !== undefined) {
				v0.copy(markMesh.userData.targetVertex);
			}

			matWorldViewProj.multiplyMatrices(matViewProj, line.matrixWorld);

			if (line.userData.extensionLength > 0 && vertices.length > 2) {
				indicesToUpdate.push(vertices.length - 2);
				pos4.copy(vertices[vertices.length - 3]).applyMatrix4(matWorldViewProj);
				lvPos.copy(pos4).multiplyScalar(1 / pos4.w).multiply(viewportSize);
				v1.set(Math.sign(lvPos.x - bbPos.x) * 0.5 * (1 + line.userData.extensionLength / this._width), 0, 0);
				v1.applyMatrix4(this._billboard.matrixWorld).applyMatrix4(mat.copy(line.matrixWorld).invert());
			}

			pos4.copy(v1).applyMatrix4(matWorldViewProj);
			lvPos.copy(pos4).multiplyScalar(1 / pos4.w).multiply(viewportSize);

			if (circularShape) {
				var dist = dir.copy(lvPos).sub(bbPos).length();
				hideLastSegment = dist < this._width;
				dir.multiplyScalar(0.5 / dist);
				v2.set(dir.x, dir.y, 0);
			} else {
				var dx = getDelta(lvPos.x, bbPos.x - this._width, bbPos.x + this._width),
					dy = getDelta(lvPos.y, bbPos.y - this._height, bbPos.y + this._height);
				hideLastSegment = (dx === 0 && dy === 0);
				if (Math.abs(dx) > Math.abs(dy)) {
					v2.set(Math.sign(dx) * 0.5, 0, 0);
				} else {
					v2.set(0, Math.sign(dy) * 0.5, 0);
				}
			}

			if (hideLastSegment) {
				v2.copy(v1);
			} else {
				v2.applyMatrix4(this._billboard.matrixWorld).applyMatrix4(mat.copy(line.matrixWorld).invert());
			}
			line.geometry.verticesNeedUpdate = true;

			if (markMesh !== undefined) {
				markMesh.position.copy(markMesh.userData.targetVertex).applyMatrix4(line.matrixWorld);
				pos4.copy(markMesh.position).applyMatrix4(matViewProj);
				var pointScale = pos4.w / (viewportSize.x * camera.projectionMatrix.elements[0]);
				markMesh.scale.setScalar(pointScale);
				markMesh.visible = false;
				var hideFirstSegment = false;
				if (pos4.w >= nearZ) {
					pa.copy(pos4);
					pb.copy(vertices[1]).applyMatrix4(matWorldViewProj);
					if (pb.w < nearZ) {
						var t = (pa.w - nearZ) / (pa.w - pb.w);
						pb.sub(pa).multiplyScalar(t).add(pa);
					}

					markPos.copy(pa).multiplyScalar(1 / pa.w);
					lvPos.copy(pb).multiplyScalar(1 / pb.w);
					dir.copy(lvPos).sub(markPos).multiply(viewportSize);
					hideFirstSegment = dir.length() < markMesh.userData.lineOffset;

					q.setFromAxisAngle(axisZ, Math.atan2(dir.y, dir.x));
					markMesh.quaternion.copy(camera.quaternion).multiply(q);

					// if (!isFinite(q.x) || !isFinite(q.y) || !isFinite(q.z) || !isFinite(q.w)) {
					// 	window.alert("!!!!", markPos, lvPos, dir, q);
					// }

					markMesh.updateMatrix();
					markMesh.matrixWorld.copy(markMesh.matrix);
					markMesh.matrixWorldNeedsUpdate = false;

					markPos.multiply(viewportSize).sub(bbPos);
					markMesh.visible = circularShape ? markPos.length() > this._width : Math.abs(markPos.x) > this._width || Math.abs(markPos.y) > this._height;

					if (hideFirstSegment || !markMesh.visible) {
						v0.copy(vertices[1]);
					} else {
						v0.set(markMesh.userData.lineOffset, 0, 0).applyMatrix4(markMesh.matrixWorld).applyMatrix4(mat.copy(line.matrixWorld).invert());
					}
				}
			}

			line.geometry._updateVertices(indicesToUpdate);

			line.computeLineDistances(matWorldViewProj, viewportSize, camera instanceof THREE.PerspectiveCamera ? nearZ : undefined);
			if (line.userData.haloMesh) {
				line.userData.haloMesh.material.lineLength = line.material.lineLength;
			}
		}.bind(this));
	};

	Callout.prototype._createMarkMesh = function(color, lineStyle, headStyle, styleConstant) {
		var arrowHead = headStyle === LeaderLineMarkStyle.Arrow;
		var pixelRatio = window.devicePixelRatio;
		var lineWidth = lineStyle.width;
		var haloWidth = lineWidth * lineStyle.haloWidth;
		styleConstant = (Array.isArray(styleConstant) || styleConstant instanceof Float32Array) && styleConstant.length === 2 ? styleConstant : [1, 1];
		var width, height;
		if (arrowHead) {
			width = Math.max(35 * styleConstant[0], lineWidth * 5); // arrow length
			height = Math.max(15 * styleConstant[1], lineWidth * 2); // arrow thickness * 2
		} else {
			width = height = Math.max(2 * styleConstant[0], lineWidth * 2); // point head radius
		}
		width = Math.ceil(width + haloWidth * 2);
		height = Math.ceil(height + haloWidth * 2);

		var canvas = document.createElement("canvas");
		canvas.width = THREE.MathUtils.ceilPowerOfTwo(width * pixelRatio);
		canvas.height = THREE.MathUtils.ceilPowerOfTwo(height * pixelRatio);
		var ctx = canvas.getContext("2d");

		var x = width / 2, y = height / 2;
		ctx.fillStyle = "#FFF";
		ctx.scale(pixelRatio, pixelRatio);
		if (arrowHead) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, 0);
			ctx.lineTo(width, height);
			ctx.closePath();
			ctx.fill();

			var h = width * y / Math.sqrt(width * width + y * y),
				s = (h - haloWidth) / h;
			var dx = width - width * s,
				dy = y * (width * s - haloWidth) / width;
			ctx.fillStyle = color.getStyle();
			ctx.beginPath();
			ctx.moveTo(dx, y);
			ctx.lineTo(width - haloWidth, y - dy);
			ctx.lineTo(width - haloWidth, y + dy);
			ctx.closePath();
			ctx.fill();
		} else { // point head
			var r1 = width * 0.5,
				r2 = r1 - haloWidth;

			ctx.beginPath();
			ctx.ellipse(x, y, r1, r1, 0, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = color.getStyle();
			ctx.beginPath();
			ctx.ellipse(x, y, r2, r2, 0, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.fillRect(width - haloWidth, y - lineWidth * 0.5, haloWidth, lineWidth);

		var material = new THREE.MeshBasicMaterial({
			map: new THREE.CanvasTexture(canvas),
			// opacity: 0.5,
			transparent: true,
			alphaTest: 0.05,
			premultipliedAlpha: true,
			side: THREE.DoubleSide,
			depthTest: this.getDepthTest()
		});

		var geometry = new THREE.PlaneGeometry(width * 2, height * 2);
		if (arrowHead) {
			geometry.translate(width, 0, 0);
		}
		var mesh = new THREE.Mesh(geometry, material);
		mesh.userData.skipIt = true;
		mesh.userData.lineOffset = (arrowHead ? width * 2 - 1 : width - haloWidth * 2);
		var uvScale = new THREE.Vector2(width * pixelRatio / canvas.width, height * pixelRatio / canvas.height);
		var uvs = mesh.geometry.attributes.uv.array;
		for (var i = 0, l = uvs.length; i < l; i += 2) {
			uvs[i] *= uvScale.x;
			uvs[i + 1] = 1 - (1 - uvs[i + 1]) * uvScale.y;
		}
		return mesh;
	};

	/**
	 * Adds leader line to the callout.
	 *
	 * @param {THREE.Vector3[]} vertices The array of vertices.
	 * @param {THREE.Object3D} targetNode The leader line target node.
	 * @param {THREE.Material} material The leader line material.
	 * @param {sap.ui.vk.LeaderLineMarkStyle} startPointStyle The mark style of the start point.
	 * @param {sap.ui.vk.LeaderLineMarkStyle} endPointStyle The mark style of the end point.
	 * @param {float[]} styleConstant The mark style constants array of the start point.
	 * @param {float} extensionLength The leader line extension length.
	 * @returns {THREE.Object3D} The leader line object.
	 * @public
	 */
	Callout.prototype.addLeaderLine = function(vertices, targetNode, material, startPointStyle, endPointStyle, styleConstant, extensionLength) {
		var node = this.getNode();
		if (extensionLength > 0 && vertices.length < 3) {
			vertices.push(vertices[vertices.length - 1].clone());
		}

		var lineStyle = material.userData.lineStyle || {};
		lineStyle.width = lineStyle.width || 1;
		lineStyle.haloWidth = lineStyle.haloWidth || 0;
		lineStyle.endCapStyle = lineStyle.endCapStyle || 0;

		var segmentCapStyle = lineStyle.endCapStyle || vertices.length > 2 ? 1 : 0;
		var trimStyle = (segmentCapStyle && (startPointStyle !== LeaderLineMarkStyle.None || lineStyle.endCapStyle === 0) ? 1 : 0) |
			(segmentCapStyle && (endPointStyle !== LeaderLineMarkStyle.None || lineStyle.endCapStyle === 0) ? 2 : 0);

		var polylineGeometry = new PolylineGeometry();
		polylineGeometry.setVertices(vertices);

		var haloMesh;
		if (lineStyle.haloWidth > 0) {
			var haloMaterial = new PolylineMaterial({
				color: 0xFFFFFF, // selection/highlighting
				lineColor: 0xFFFFFF,
				linewidth: lineStyle.width * (lineStyle.haloWidth * 2 + 1),
				dashCapStyle: lineStyle.endCapStyle,
				segmentCapStyle: segmentCapStyle,
				trimStyle: trimStyle,
				transparent: true,
				depthTest: this.getDepthTest()
			});
			// console.log(material.name, material.userData.lineStyle, material.userData.lineStyle.dashPattern);

			haloMesh = new PolylineMesh(polylineGeometry, haloMaterial);
			haloMesh.userData.skipIt = true;
			haloMesh.userData.targetNode = targetNode;
			haloMesh.matrixAutoUpdate = false;
			haloMesh.renderOrder = this.getRenderOrder();
			haloMesh.isHaloMesh = true;

			node.add(haloMesh);
			this._lines.push(haloMesh);
		}

		var polylineMaterial = new PolylineMaterial({
			color: 0xFFFFFF, // selection/highlighting
			lineColor: material.color,
			linewidth: lineStyle.width,
			dashCapStyle: lineStyle.endCapStyle,
			segmentCapStyle: segmentCapStyle,
			trimStyle: trimStyle,
			dashPattern: lineStyle.dashPattern || [],
			dashScale: lineStyle.dashPatternScale || 1,
			transparent: true,
			depthTest: this.getDepthTest()
		});

		var polylineMesh = new PolylineMesh(polylineGeometry, polylineMaterial);
		polylineMesh.userData.skipIt = true;
		polylineMesh.userData.targetNode = targetNode;
		polylineMesh.userData.extensionLength = extensionLength;
		polylineMesh.userData.haloMesh = haloMesh;
		polylineMesh.matrixAutoUpdate = false;
		polylineMesh.renderOrder = this.getRenderOrder();

		node.add(polylineMesh);
		this._lines.push(polylineMesh);

		if (startPointStyle !== LeaderLineMarkStyle.None) {
			var markMesh = this._createMarkMesh(material.color, lineStyle, startPointStyle, styleConstant);
			markMesh.userData.targetVertex = polylineGeometry.vertices[0].clone();
			markMesh.matrixAutoUpdate = false;
			markMesh.renderOrder = this.getRenderOrder();
			polylineMesh.userData.startPointMesh = markMesh;

			node.add(markMesh);
			this._heads.push(markMesh);
		}

		return polylineMesh;
	};

	return Callout;
});
