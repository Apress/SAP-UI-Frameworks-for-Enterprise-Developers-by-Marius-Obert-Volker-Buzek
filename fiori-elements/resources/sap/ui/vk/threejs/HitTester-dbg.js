/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.HitTester
sap.ui.define([
	"sap/base/Log",
	"../thirdparty/three"
], function(
	Log,
	THREE
) {
	"use strict";

	var HitTester = function() {
		this._maskMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, fog: false });
		this._depthMaterial = new THREE.ShaderMaterial({
			vertexShader: [
				"#include <clipping_planes_pars_vertex>",
				"void main() {",
				"	#include <begin_vertex>",
				"	#include <project_vertex>",
				"	#include <clipping_planes_vertex>",
				"}"
			].join("\n"),

			fragmentShader: [
				"#include <clipping_planes_pars_fragment>",
				"void main() {",
				"	#include <clipping_planes_fragment>",
				"	highp vec4 value = vec4(fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * gl_FragCoord.z));",
				"	value.xyz -= value.yzw * (1.0 / 255.0);",
				"	gl_FragColor  = value;",
				"}"
			].join("\n"),

			side: THREE.DoubleSide,
			clipping: true
		});

		this._renderTarget = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
		this._renderTarget.texture.generateMipmaps = false;
		this._renderTarget.depthBuffer = true;
	};

	// var USE_RENDER_BUFFER_DIRECT = false; // use WebGLRenderer.renderBufferDirect()

	var testCamera;
	var matViewProj = new THREE.Matrix4();
	var frustum = new THREE.Frustum();
	var inverseMatrix = new THREE.Matrix4();
	var screenPos = new THREE.Vector2();
	var raycaster = new THREE.Raycaster();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();
	var objects = [];
	var data = new Uint8Array(4);
	var point = new THREE.Vector3();

	function getMeshNode(object) {
		// search for the first closed parent node
		var parent = object.parent;
		while (parent) {
			if (parent.userData.closed) {
				object = parent;
			}
			parent = parent.parent;
		}

		// skip "skipIt" and unnamed nodes
		while (object.parent && object.userData.skipIt) {
			object = object.parent;
		}

		return object;
	}

	HitTester.prototype.hitTest = function(x, y, width, height, renderer, scene, camera, clippingPlanes, options) {
		if (!testCamera || testCamera.constructor !== camera.constructor) {
			testCamera = new camera.constructor();
		}
		testCamera.copy(camera);

		var view = camera.view;
		if (view) {
			var w = view.width / width;
			var h = view.height / height;
			testCamera.setViewOffset(view.fullWidth, view.fullHeight, view.offsetX + (x - 0.5) * w, view.offsetY + (y - 0.5) * h, w, h);
		} else {
			testCamera.setViewOffset(width, height, x - 0.5, y - 0.5, 1, 1);
		}

		testCamera.updateMatrixWorld();
		testCamera.updateProjectionMatrix();
		matViewProj.multiplyMatrices(testCamera.projectionMatrix, testCamera.matrixWorldInverse);
		frustum.setFromProjectionMatrix(matViewProj);
		raycaster.setFromCamera(screenPos.set(0, 0), testCamera);

		var rBits = renderer.getContextRedBits();
		var gBits = renderer.getContextGreenBits();
		var bBits = renderer.getContextBlueBits();
		var rgBits = rBits + gBits;
		var rMask = (1 << rBits) - 1;
		var gMask = (1 << gBits) - 1;
		var bMask = (1 << bBits) - 1;
		var rMaskInv = 1 / rMask;
		var gMaskInv = 1 / gMask;
		var bMaskInv = 1 / bMask;
		var maskMaterial = this._maskMaterial;

		var oldClearColor = new THREE.Color();
		renderer.getClearColor(oldClearColor);
		var oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		renderer.setRenderTarget(this._renderTarget);
		renderer.clippingPlanes = clippingPlanes || [];
		renderer.autoClear = false;
		renderer.setClearColor(0x000000, 0);
		renderer.clear(true, true, false);

		// var materialShader;
		// if (USE_RENDER_BUFFER_DIRECT) {
		// 	renderer.compile(scene, camera); // not needed, but sets currentRenderState (the WebGLRenderer local scope variable) that is used in WebGLRenderer.renderBufferDirect()
		// 	maskMaterial.isShaderMaterial = true; // this is necessary to update the diffuse uniform
		// }

		var color = maskMaterial.color;
		var index = 0;
		objects.length = 0;

		var underlayObjects = options && options.ignoreUnderlay ? null : [];
		var regularObjects = [];
		var overlayObjects = options && options.ignoreOverlay ? null : [];

		function traverseVisible(node, renderStage) {
			// NB: we use the strict comparison for `node.userData.selectable` as value `null` means
			// *use the default value* which is `true` by design.
			if (!node.visible || node.userData.selectable === false) {
				return;
			}

			renderStage = renderStage || node.userData.renderStage;

			var geometry = node.geometry;
			if (geometry && node.material && frustum.intersectsObject(node)) {

				var matrixWorld = node.matrixWorld;
				var rg = node.userData.renderGroup;
				if (rg && rg.boundingSphere) {
					sphere.setFromPackedArray(rg.boundingSphere);
				} else {
					if (geometry.boundingSphere == null) {
						geometry.computeBoundingSphere();
					}

					sphere.copy(geometry.boundingSphere);
				}

				sphere.applyMatrix4(matrixWorld);

				if (raycaster.ray.intersectsSphere(sphere)) {
					inverseMatrix.copy(matrixWorld).invert();
					ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

					var bbox = (rg && rg.boundingBox) ? THREE.Box3.newFromPackedArray(rg.boundingBox) : geometry.boundingBox;
					if (bbox == null || ray.intersectsBox(bbox)) {
						if (!renderStage) {
							regularObjects.push(node);
						} else if (renderStage < 0) {
							if (underlayObjects) {
								underlayObjects.push(node);
							}
						} else if (overlayObjects) {
							overlayObjects.push(node);
						}
					}
				}
			}

			var children = node.children;
			for (var i = 0, l = children.length; i < l; i++) {
				traverseVisible(children[i], renderStage);
			}
		}

		traverseVisible(scene);

		function renderObject(node) {
			index += 1;
			objects.push(node);
			color.setRGB((index & rMask) * rMaskInv, ((index >> rBits) & gMask) * gMaskInv, ((index >> rgBits) & bMask) * bMaskInv);
			// console.log(index, node.name, color.getHexString());

			// if (USE_RENDER_BUFFER_DIRECT) {
			// 	geometry = geometry.isBufferGeometry ? geometry : geometry._bufferGeometry;
			// 	if (geometry) {
			// 		// have to update diffuse uniform manually
			// 		materialShader = materialShader || renderer.properties.get(maskMaterial).shader;
			// 		if (materialShader) {
			// 			materialShader.uniforms.diffuse.value.copy(maskMaterial.color);
			// 			maskMaterial.uniformsNeedUpdate = true;
			// 		}

			// 		renderer.renderBufferDirect(testCamera, null, geometry, maskMaterial, node, null);
			// 	}
			// } else {
			var material = node.material;
			node.material = maskMaterial;
			renderer.render(node, testCamera);
			node.material = material;
			// }
		}

		if (underlayObjects != null && underlayObjects.length > 0) {
			underlayObjects.forEach(renderObject);
			renderer.clearDepth();
		}

		regularObjects.forEach(renderObject);

		if (overlayObjects != null && overlayObjects.length > 0) {
			renderer.clearDepth();
			overlayObjects.forEach(renderObject);
		}

		// renderer.readRenderTargetPixels(this._renderTarget, x, height - y - 1, 1, 1, data);
		renderer.readRenderTargetPixels(this._renderTarget, 0, 0, 1, 1, data);
		index = (data[0] >> (8 - rBits)) + ((data[1] >> (8 - gBits)) << rBits) + ((data[2] >> (8 - bBits)) << rgBits);
		var object = index > 0 ? objects[index - 1] : null;

		var z;
		if (object) {
			var material = object.material;
			object.material = this._depthMaterial;
			renderer.clear(true, true, false);
			renderer.render(object, testCamera);
			object.material = material;

			renderer.readRenderTargetPixels(this._renderTarget, 0, 0, 1, 1, data);
			z = ((data[0] + (data[1] + (data[2] + data[3] / 255) / 255) / 255) / 255) * 2 - 1;
			point.set(0, 0, z).applyMatrix4(testCamera.projectionMatrixInverse).applyMatrix4(testCamera.matrixWorld);
		}

		// console.log(x, y, index + "/" + objects.length + " (" + skip1 + "," + skip2 + ")", z, distance, data, point, object ? object.name : null);

		// var img = new Image();
		// img.src = renderer.getContext().canvas.toDataURL();
		// document.body.appendChild(img);

		// function createImageFromTexture(gl, texture, width, height) {
		// 	var framebuffer = gl.createFramebuffer();
		// 	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		// 	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		// 	var data = new Uint8Array(width * height * 4);
		// 	gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
		// 	gl.deleteFramebuffer(framebuffer);

		// 	var canvas = document.createElement('canvas');
		// 	canvas.width = width;
		// 	canvas.height = height;
		// 	var context = canvas.getContext('2d');

		// 	var imageData = context.createImageData(width, height);
		// 	imageData.data.set(data);
		// 	context.putImageData(imageData, 0, 0);

		// 	var img = new Image();
		// 	img.src = canvas.toDataURL();
		// 	return img;
		// }

		// document.body.appendChild(createImageFromTexture(gl, renderer.properties.get(this._renderTarget.texture).__webglTexture, width, height));

		renderer.setRenderTarget(null);
		renderer.clippingPlanes = [];
		renderer.setClearColor(oldClearColor, oldClearAlpha);
		renderer.autoClear = oldAutoClear;

		return object ? { distance: raycaster.ray.origin.distanceTo(point), point: point, object: getMeshNode(object) } : null;
	};

	HitTester.prototype.hitTestPrecise = function(x, y, width, height, scene, camera, clippingPlanes) {
		raycaster.setFromCamera(screenPos.set((x / width) * 2 - 1, (y / height) * -2 + 1), camera);

		if (clippingPlanes && clippingPlanes.length > 0) {
			for (var pi in clippingPlanes) {
				var plane = clippingPlanes[pi];
				var dist = plane.distanceToPoint(raycaster.ray.origin),
					t = -dist / plane.normal.dot(raycaster.ray.direction);
				if (t > 0) {
					if (dist < 0) {
						raycaster.near = Math.max(raycaster.near, t);
					} else {
						raycaster.far = Math.min(raycaster.far, t);
					}
				} else if (dist < 0) {
					return null;
				}
			}
		}

		var intersects = raycaster.intersectObjects(scene.children, true);

		if (clippingPlanes && clippingPlanes.length > 0) {// restore raycaster default near and far values
			raycaster.near = 0;
			raycaster.far = Infinity;
		}

		if (intersects) {
			for (var i in intersects) {
				var result = intersects[i];
				var object = getMeshNode(result.object);

				if (object.visible && !object.isBillboard && !object.isDetailView) {
					result.object = object;
					return result;
				}
			}
		}

		return null;
	};

	HitTester.prototype.hitTestPoint = function(x, y, width, height, scene, camera, clippingPlanes) {
		raycaster.setFromCamera(screenPos.set((x / width) * 2 - 1, (y / height) * -2 + 1), camera);

		if (clippingPlanes && clippingPlanes.length > 0) {
			for (var pi in clippingPlanes) {
				var plane = clippingPlanes[pi];
				var dist = plane.distanceToPoint(raycaster.ray.origin),
					t = -dist / plane.normal.dot(raycaster.ray.direction);
				if (t > 0) {
					if (dist < 0) {
						raycaster.near = Math.max(raycaster.near, t);
					} else {
						raycaster.far = Math.min(raycaster.far, t);
					}
				} else if (dist < 0) {
					return null;
				}
			}
		}

		var intersects = raycaster.intersectObjects(scene.children, true);

		if (clippingPlanes && clippingPlanes.length > 0) {// restore raycaster default near and far values
			raycaster.near = 0;
			raycaster.far = Infinity;
		}
		// for panoramic scene POI placement: return point when only hit one point
		return intersects.length === 1 ? intersects[0].point : null;
	};

	return HitTester;
});
