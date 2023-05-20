/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the DetailView class.
sap.ui.define([
	"../thirdparty/three",
	"sap/ui/base/ManagedObject",
	"../thirdparty/html2canvas",
	"../DetailViewType",
	"../DetailViewShape",
	"./OrthographicCamera",
	"./PerspectiveCamera"
], function(
	THREE,
	BaseObject,
	html2canvas,
	DetailViewType,
	DetailViewShape,
	OrthographicCamera,
	PerspectiveCamera
) {
	"use strict";

	/**
	 * Constructor for a new DetailView.
	 *
	 * @class
	 *
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.113.0
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.threejs.DetailView
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var DetailView = BaseObject.extend("sap.ui.vk.threejs.DetailView", /** @lends sap.ui.vk.threejs.DetailView.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				name: {
					type: "string",
					defaultValue: ""
				},
				camera: {
					type: "any",
					defaultValue: null
				},
				type: {
					type: "sap.ui.vk.DetailViewType",
					defaultValue: DetailViewType.DetailView
				},
				shape: {
					type: "sap.ui.vk.DetailViewShape",
					defaultValue: DetailViewShape.Box
				},
				borderWidth: {
					type: "float",
					defaultValue: 2
				},
				backgroundColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#fff"
				},
				borderColor: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#000"
				},
				origin: {
					type: "any", // THREE.Vector2
					defaultValue: new THREE.Vector2(0, 0)
				},
				size: {
					type: "any", // THREE.Vector2
					defaultValue: new THREE.Vector2(0.5, 0.5)
				},
				attachmentPoint: {
					type: "any", // THREE.Vector3
					defaultValue: null
				},
				metadata: {
					type: "any",
					defaultValue: {}
				},
				veId: {
					type: "any",
					defaultValue: {}
				},
				visibleNodes: {
					type: "any",
					defaultValue: null
				},
				targetNodes: {
					type: "any",
					defaultValue: null
				}
			}
		}
	});

	DetailView.prototype.init = function() {
		if (BaseObject.prototype.init) {
			BaseObject.prototype.init.call(this);
		}

		this._backgroundColor = new THREE.Color();
		this._node = new THREE.Group();

		var borderMaterial = new THREE.MeshBasicMaterial({ depthTest: false });
		this._line = new THREE.Mesh(new THREE.BufferGeometry(), borderMaterial);
		this._line.renderOrder = 0;
		this._node.add(this._line);

		var triGeometry = new THREE.BufferGeometry();
		triGeometry.setIndex([0, 1, 2]);
		var triMaterial = new THREE.MeshBasicMaterial({ color: this._backgroundColor, depthTest: false });
		this._triangle = new THREE.Mesh(triGeometry, triMaterial);
		this._triangle.renderOrder = 1;
		this._node.add(this._triangle);

		this._billboard = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ depthTest: false }));
		this._billboard.renderOrder = 2;
		this._node.add(this._billboard);

		this._border = new THREE.Mesh(new THREE.BufferGeometry(), borderMaterial);
		this._border.renderOrder = 3;
		this._node.add(this._border);
	};

	DetailView.prototype.setCamera = function(value) {
		if (value instanceof PerspectiveCamera || value instanceof OrthographicCamera) {
			this.setProperty("camera", value, true);
		}
		return this;
	};

	DetailView.prototype.setShape = function(value) {
		this.setProperty("shape", value, true);
		return this;
	};

	DetailView.prototype.setBackgroundColor = function(value) {
		this.setProperty("backgroundColor", value, true);
		this._backgroundColor.setStyle(value);
		this._triangle.material.color.copy(this._backgroundColor);
		return this;
	};

	DetailView.prototype.setBorderColor = function(value) {
		this.setProperty("borderColor", value, true);
		this._border.material.map = null; // recreate border texture
		return this;
	};

	DetailView.prototype.setBorderWidth = function(value) {
		this.setProperty("borderWidth", value, true);
		this._border.material.map = null; // recreate border texture
		return this;
	};

	DetailView.prototype.setOrigin = function(value) {
		if (value instanceof THREE.Vector2) {
			this.setProperty("origin", value, true);
		}
		return this;
	};

	DetailView.prototype.setSize = function(value) {
		if (value instanceof THREE.Vector2) {
			this.setProperty("size", value, true);
		}
		return this;
	};

	var borderOffset1 = -0.5,
		borderOffset2 = 1.5,
		pos4 = new THREE.Vector4(),
		axisX = new THREE.Vector3(),
		axisY = new THREE.Vector3(),
		aPoint = new THREE.Vector3(),
		dv = new THREE.Vector2(),
		size = new THREE.Vector2(),
		texSize = new THREE.Vector2(),
		mat4 = new THREE.Matrix4();

	function ellipsePerimeter(a, b) {
		return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b))); // approximation
	}

	function lineIntersection(points, a1, a2x, a2y, b1, b2) {
		var a1x = points[a1],
			a1y = points[a1 + 1],
			b1x = points[b1],
			b1y = points[b1 + 1],
			b2x = points[b2],
			b2y = points[b2 + 1],
			nx = a2y - a1y,
			ny = a1x - a2x;
		var f = ((b1x - a1x) * nx + (b1y - a1y) * ny) / ((b1x - b2x) * nx + (b1y - b2y) * ny);
		points[b1] = b1x + (b2x - b1x) * f;
		points[b1 + 1] = b1y + (b2y - b1y) * f;
	}

	function moveLine(points, a, b, delta) {
		dv.set(points[b + 1] - points[a + 1], points[a] - points[b]).normalize().multiplyScalar(delta);
		points[a] += dv.x;
		points[a + 1] += dv.y;
		points[b] += dv.x;
		points[b + 1] += dv.y;
	}

	function inflateMesh(points, borderWidth) {
		var count = points.length;
		for (var side = 0; side < 6; side += 3) { // 0 = inside, 3 = outside
			var delta = side === 0 ? borderWidth * borderOffset1 : borderWidth * borderOffset2;
			var cx = points[side],
				cy = points[side + 1];
			for (var i = side; i < count - 6; i += 6) {
				var px = points[i],
					py = points[i + 1];
				points[i] = cx;
				points[i + 1] = cy;
				cx = points[i + 6];
				cy = points[i + 7];
				moveLine(points, i, i + 6, delta);
				if (i > side) {
					lineIntersection(points, i - 6, px, py, i, i + 6);
				}
			}
		}
	}

	DetailView.prototype._createBoxViewport = function(sx, sy, attachmentPoint, shape) {
		// create viewport
		var vpPoints = [-sx, -sy, 0, sx, -sy, 0, sx, sy, 0, -sx, sy, 0];
		var geometry = this._billboard.geometry;
		geometry.setIndex([0, 1, 2, 0, 2, 3]);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(vpPoints, 3));
		geometry.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));

		// create border
		if (this._border.visible) {
			var points = [], i;
			for (i = 0; i < vpPoints.length; i += 3) {
				var x = vpPoints[i],
					y = vpPoints[i + 1];
				points.push(x, y, 0, x, y, 0);
			}
			points.push(points[0], points[1], 0, points[0], points[1], 0);

			inflateMesh(points, this._borderWidth);

			i = points.length - 6;
			points[0] = points[i];
			points[i + 1] = points[1];
			points[3] = points[i + 3];
			points[i + 4] = points[4];

			this._createBorderGeometry(this._border.geometry, points);
		}
	};

	DetailView.prototype._createCircleViewport = function(rx, ry, attachmentPoint, shape) {
		var points = [0, 0, 0],
			uvs = [0.5, 0.5],
			indices = [];

		var vertexCount = THREE.MathUtils.clamp(Math.round(ellipsePerimeter(rx, ry) / 24), 32, 256);
		var dA = 2 * Math.PI / vertexCount;
		for (var i = 0; i < vertexCount; i++) {
			var a = i * dA,
				ca = Math.cos(a),
				sa = Math.sin(a);
			points.push(ca * rx, sa * ry, 0);
			uvs.push(ca * 0.5 + 0.5, sa * 0.5 + 0.5);
			indices.push(0, i + 1, i + 1 < vertexCount ? i + 2 : 1);
		}

		var geometry = this._billboard.geometry;
		geometry.setIndex(indices);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
		geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
		// geometry.verticesNeedUpdate = true;
		// geometry.uvsNeedUpdate = true;
		// geometry.groupsNeedUpdate = true;

		var delta = this._borderWidth * borderOffset2;
		this._createCircleBorder(points, rx, ry, attachmentPoint && dv.set(attachmentPoint.x / (rx + delta), attachmentPoint.y / (ry + delta)).length() > 1 ? attachmentPoint : null, shape);
	};

	DetailView.prototype._createCircleBorder = function(vpPoints, rx, ry, attachmentPoint, shape) {
		var borderWidth = this._borderWidth,
			points = [],
			i, x, y;

		if (attachmentPoint && (shape !== DetailViewShape.Circle && shape !== DetailViewShape.CircleLine)) {
			points.push(attachmentPoint.x, attachmentPoint.y, 0, attachmentPoint.x, attachmentPoint.y, 0);

			var dA = Math.PI * 0.05;
			var a0 = Math.atan2(attachmentPoint.y * rx, attachmentPoint.x * ry) + dA;
			var count = (vpPoints.length / 3) - 3;
			dA = 2 * (Math.PI - dA) / count;
			for (i = 0; i <= count; i++) {
				var a = a0 + i * dA;
				x = Math.cos(a) * rx;
				y = Math.sin(a) * ry;
				points.push(x, y, 0, x, y, 0);
			}
			var triPoints = [attachmentPoint.x, attachmentPoint.y, 0, points[6], points[7], 0, points[points.length - 3], points[points.length - 2], 0];

			points.push(attachmentPoint.x, attachmentPoint.y, 0, attachmentPoint.x, attachmentPoint.y, 0);

			inflateMesh(points, borderWidth);

			i = points.length - 6;
			var d1 = dv.set(points[9], points[10]).sub(attachmentPoint).length();
			var d2 = dv.set(points[9] - points[i - 3], points[10] - points[i - 2]).length() * 0.5;
			var l = attachmentPoint.length();
			l = 1 - borderWidth * 2 * d1 / (d2 * l);
			points[i + 0] = points[0] = attachmentPoint.x * l;
			points[i + 1] = points[1] = attachmentPoint.y * l;
			points[i + 3] = points[3] = attachmentPoint.x;
			points[i + 4] = points[4] = attachmentPoint.y;

			var triGeometry = this._triangle.geometry;
			l = (1 + l) * 0.5;
			triPoints[0] *= l;
			triPoints[1] *= l;
			triGeometry.setAttribute("position", new THREE.Float32BufferAttribute(triPoints, 3));
			this._triangle.visible = true;
			this._triangle.material.color.set(shape === DetailViewShape.SolidPointer || shape === DetailViewShape.SolidArrow ? this.getBorderColor() : this._backgroundColor);
		} else {
			this._line.visible = this._line.visible && attachmentPoint !== null;

			for (i = 3; i < vpPoints.length; i += 3) {
				x = vpPoints[i];
				y = vpPoints[i + 1];
				points.push(x, y, 0, x, y, 0);
			}
			points.push(points[0], points[1], 0, points[0], points[1], 0);

			inflateMesh(points, borderWidth);

			i = points.length - 6;
			points[i] = points[0] = vpPoints[3] + borderWidth * borderOffset1;
			points[i + 3] = points[3] = vpPoints[3] + borderWidth * borderOffset2;
			points[i + 1] = points[1] = vpPoints[4];
			points[i + 4] = points[4] = vpPoints[4];
		}

		this._createBorderGeometry(this._border.geometry, points);
	};

	DetailView.prototype._createBorderGeometry = function(geometry, points) {
		var i, count = points.length / 3;
		var indices = [];
		for (i = 2; i < count; i += 2) {
			indices.push(i - 1, i, i - 2, i + 1, i, i - 1);
		}
		var uvs = [];
		var u = this._borderU;
		for (i = 0; i < count; i += 2) {
			uvs.push(0, 0.5, u, 0.5);
		}
		geometry.setIndex(indices);
		geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
		geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	};

	DetailView.prototype._createLine = function(attachmentPoint) {
		var points = [0, 0, 0, 0, 0, 0, attachmentPoint.x, attachmentPoint.y, 0, attachmentPoint.x, attachmentPoint.y, 0];
		moveLine(points, 0, 6, -this._borderWidth);
		moveLine(points, 3, 9, this._borderWidth);
		this._createBorderGeometry(this._line.geometry, points);
	};

	DetailView.prototype._updateGeometry = function(size, viewportSize, camera) {
		var shape = this.getShape(),
			attachmentPoint = this.getAttachmentPoint(),
			origin = this.getOrigin();

		this._border.visible = shape !== DetailViewShape.BoxNoOutline;
		this._line.visible = shape === DetailViewShape.BoxLine || shape === DetailViewShape.CircleLine;
		this._triangle.visible = false;

		if (attachmentPoint) {
			pos4.copy(attachmentPoint).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			attachmentPoint = pos4.w > 0 ? attachmentPoint : null;
			var ax = (pos4.x / pos4.w) * viewportSize.x / viewportSize.y,
				ay = pos4.y / pos4.w;
			aPoint.set(ax - origin.x, ay - origin.y, 0).multiplyScalar(viewportSize.y);
		}

		switch (shape) {
			default:
			case DetailViewShape.Box:
			case DetailViewShape.BoxLine:
			case DetailViewShape.BoxNoOutline:
				this._createBoxViewport(size.x, size.y, attachmentPoint ? aPoint : null, shape);
				break;

			case DetailViewShape.Circle:
			case DetailViewShape.CircleLine:
			case DetailViewShape.CirclePointer:
			case DetailViewShape.CircleArrow:
			case DetailViewShape.CircleBubbles:
			case DetailViewShape.SolidPointer:
			case DetailViewShape.SolidArrow:
				this._createCircleViewport(size.x, size.y, attachmentPoint ? aPoint : null, shape);
				break;
		}

		if (this._line.visible) {
			this._createLine(aPoint);
		}
	};

	DetailView.prototype._updateBorderTexture = function(pixelRatio) {
		var borderWidth = Math.round(this.getBorderWidth() * pixelRatio);
		this._borderWidth = borderWidth + 2;
		var textureWidth = THREE.MathUtils.ceilPowerOfTwo(this._borderWidth);
		this._borderU = this._borderWidth / textureWidth;
		this._borderWidth /= pixelRatio;
		var buffer = new ArrayBuffer(textureWidth * 4);
		var data = new Uint32Array(buffer);
		var borderColor = new THREE.Color(this.getBorderColor());
		borderColor = (borderColor.r * 255) | ((borderColor.g * 255) << 8) | ((borderColor.b * 255) << 16) | 0xFF000000; // ABGR
		data.fill(borderColor & 0xFFFFFF);
		for (var i = 1; i <= borderWidth; i++) {
			data[i] = borderColor;
		}
		var texture = new THREE.DataTexture(new Uint8Array(buffer), textureWidth, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping,
			THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
		texture.needsUpdate = true;
		this._border.material.map = texture;
		this._border.material.needsUpdate = true;
		this._line.material = this._border.material;
	};

	function getProjectionRect(matProj) {
		var m = matProj.elements;
		// calculate projection rectangle from projection matrix
		var isOrthographic = m[15] === 1;
		var rightMinusLeft = 2 / m[0];
		var topMinusBottom = 2 / m[5];
		var rightPlusLeft, topPlusBottom;
		if (isOrthographic) {
			rightPlusLeft = -m[12] * rightMinusLeft;
			topPlusBottom = -m[13] * topMinusBottom;
		} else {
			rightPlusLeft = m[8] * rightMinusLeft;
			topPlusBottom = m[9] * topMinusBottom;
		}

		var right = (rightMinusLeft + rightPlusLeft) * 0.5;
		var left = rightPlusLeft - right;
		var top = (topMinusBottom + topPlusBottom) * 0.5;
		var bottom = topPlusBottom - top;
		return { left: left, top: top, right: right, bottom: bottom };
	}

	function setProjectionRect(matProj, rect) {
		var m = matProj.elements;
		var isOrthographic = m[15] === 1;
		// update projection matrix
		m[0] = 2 / (rect.right - rect.left);
		m[5] = 2 / (rect.top - rect.bottom);
		if (isOrthographic) {
			m[12] = -(rect.right + rect.left) / (rect.right - rect.left);
			m[13] = -(rect.top + rect.bottom) / (rect.top - rect.bottom);
		} else {
			m[8] = (rect.right + rect.left) / (rect.right - rect.left);
			m[9] = (rect.top + rect.bottom) / (rect.top - rect.bottom);
		}
	}

	function setCutawayProjectionMatrix(camera, position, size, viewportSize) {
		var w = size.x / viewportSize.x;
		var h = size.y / viewportSize.y;
		pos4.copy(position).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
		var x = ((pos4.x / pos4.w) - w) * 0.5 + 0.5;
		var y = ((pos4.y / pos4.w) - h) * 0.5 + 0.5;

		var srcRect = getProjectionRect(camera.projectionMatrix);
		var rect = {};
		rect.left = THREE.MathUtils.lerp(srcRect.left, srcRect.right, x);
		rect.right = THREE.MathUtils.lerp(srcRect.left, srcRect.right, x + w);
		rect.top = THREE.MathUtils.lerp(srcRect.top, srcRect.bottom, 1 - y - h);
		rect.bottom = THREE.MathUtils.lerp(srcRect.top, srcRect.bottom, 1 - y);
		setProjectionRect(camera.projectionMatrix, rect);
	}

	var viewportSize = new THREE.Vector2();
	DetailView.prototype._render = function(renderer, camera, scene, boundingBox, eyePointLight) {
		renderer.getSize(viewportSize);
		var pixelRatio = renderer.getPixelRatio(),
			origin = this.getOrigin(),
			node = this._node,
			position = node.position;

		if (!this._border.material.map) {
			this._updateBorderTexture(pixelRatio);
		}
		size.copy(this.getSize()).multiplyScalar(viewportSize.y * 0.5);
		size.set(Math.round(size.x) << 1, Math.round(size.y) << 1);

		position.set(origin.x * viewportSize.y / viewportSize.x, origin.y, 0).unproject(camera);

		// calculate screen position
		pos4.copy(position).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
		var sx = ((pos4.x / pos4.w) * 0.5 + 0.5) * viewportSize.x,
			sy = ((pos4.y / pos4.w) * 0.5 + 0.5) * viewportSize.y;

		// set scale
		var scale = pos4.w / (viewportSize.x * camera.projectionMatrix.elements[0]);
		node.scale.setScalar(scale);

		// add per pixel alignment to the DetailView
		axisX.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(scale * 2 * (Math.round(sx) - sx));
		axisY.setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(scale * 2 * (Math.round(sy) - sy));
		position.add(axisX).add(axisY);

		// node.position
		node.quaternion.copy(camera.quaternion);
		node.updateMatrix();
		node.updateMatrixWorld();
		// node.matrixWorld.compose(node.position, camera.quaternion, node.scale);
		// node.matrix.copy(node.parent.matrixWorld).invert().multiply(node.matrixWorld);
		// node.matrix.decompose(node.position, node.quaternion, node.scale);

		this._updateGeometry(size, viewportSize, camera);

		texSize.copy(size).multiplyScalar(pixelRatio);
		if (!this._renderTarget || this._renderTarget.width !== texSize.x || this._renderTarget.height !== texSize.y) {
			this._renderTarget = new THREE.WebGLRenderTarget(texSize.x, texSize.y, {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBFormat
			});
			this._billboard.material.map = this._renderTarget.texture;
			this._billboard.material.needsUpdate = true;
		}

		var dvCamera;
		if (this.getType() === DetailViewType.Cutaway) {
			dvCamera = camera;
			mat4.copy(dvCamera.projectionMatrix);
			setCutawayProjectionMatrix(dvCamera, position, size, viewportSize);
		} else {
			dvCamera = this.getCamera();
			dvCamera.adjustClipPlanes(boundingBox);
			dvCamera.update(size.x, size.y);
			dvCamera = dvCamera.getCameraRef();
		}
		var visibleObjects = new Set();
		// update dynamic objects
		scene.children.forEach(function(root) {
			if (root.userData._vkDynamicObjects) {
				root.userData._vkDynamicObjects.forEach(function(object) {
					if (object.parent) {
						if (object.userData.is2D || object.isBillboard) {
							if (object.visible) {
								visibleObjects.add(object);
							}
							object.visible = false; // hide screen-space objects
						} else {
							object._vkUpdate(renderer, dvCamera, size);
						}
					}
				});
			}
		});

		if (eyePointLight) {
			eyePointLight.position.copy(dvCamera.position);
			eyePointLight.updateMatrix();
			eyePointLight.updateMatrixWorld();
		}

		var visibleNodes = this.getTargetNodes();
		var targetNodes = this.getTargetNodes();
		if (Array.isArray(targetNodes)) {
			visibleNodes.forEach(function(node) {
				node.userData._visible = node.visible;
				node.visible = true;
			});
		}
		if (Array.isArray(targetNodes)) {
			targetNodes.forEach(function(node) {
				node.userData._visible = node.visible;
				node.visible = false;
			});
		}

		renderer.setClearColor(this._backgroundColor, 1);
		renderer.setRenderTarget(this._renderTarget);
		renderer.clear();
		renderer.render(scene, dvCamera);
		if (dvCamera === camera) {// restore projection matrix of the original camera (cutaway)
			camera.projectionMatrix.copy(mat4);
		}

		if (Array.isArray(visibleNodes)) {
			visibleNodes.forEach(function(node) {
				node.visible = node.userData._visible;
			});
		}
		if (Array.isArray(targetNodes)) {
			targetNodes.forEach(function(node) {
				node.visible = node.userData._visible;
			});
		}

		renderer.setRenderTarget(null);
		renderer.render(this._node, camera);

		// restore screen-space objects visibility
		scene.children.forEach(function(root) {
			if (root.userData._vkDynamicObjects) {
				root.userData._vkDynamicObjects.forEach(function(object) {
					if (object.parent && (object.userData.is2D || object.isBillboard)) {
						object.visible = visibleObjects.has(object); // show screen-space objects
					}
				});
			}
		});
	};

	return DetailView;
});
