/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.SceneBuilder.
sap.ui.define([
	"../thirdparty/three",
	"sap/base/Log",
	"./ThreeUtils"
], function(
	THREE,
	Log,
	ThreeUtils
) {
	"use strict";

	var OutlineRenderer = function(outlineWidth) {
		this._outlineWidth = outlineWidth;

		this._copyMaterial = new THREE.MeshBasicMaterial({ transparent: true, fog: false });
		this._maskMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, fog: false });

		this._outlineMaterial = new THREE.ShaderMaterial({
			// transparent: true,

			uniforms: {
				"mask": { value: null },
				// "depthMap": { value: null },
				"offset": { value: new THREE.Vector2(1, 0, 0, 1) }
			},

			vertexShader: [
				"varying vec2 vTC;",
				"void main() {",
				"	vTC = uv;",
				"	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
				"}"
			].join("\n"),

			fragmentShader: [
				"varying vec2 vTC;",
				"uniform sampler2D mask;",
				// "uniform sampler2D depthMap;",
				"uniform vec4 offset;",
				"float delta(vec3 c1,  vec3 c2) {",
				"	vec3 dc = c1 - c2;",
				"	return dot(dc, dc);",
				"}",
				"void main() {",
				"	vec3 c = texture2D(mask, vTC).rgb;",
				"	vec3 c1 = texture2D(mask, vTC + offset.xy).rgb;",
				"	vec3 c2 = texture2D(mask, vTC - offset.xy).rgb;",
				"	vec3 c3 = texture2D(mask, vTC + offset.zw).rgb;",
				"	vec3 c4 = texture2D(mask, vTC - offset.yw).rgb;",
				"	vec4 a = vec4(delta(c, c1), delta(c, c2), delta(c, c3), delta(c, c4));",
				"	gl_FragColor = vec4(1.0, 1.0, 1.0, sign(dot(a, a)));",
				"}"
			].join("\n")
		});

		this._expandMaterial = new THREE.ShaderMaterial({
			// transparent: true,

			uniforms: {
				"mask": { value: null },
				"offset": { value: new THREE.Vector2(1, 0, 0, 1) }
			},

			vertexShader: [
				"varying vec2 vTC;",
				"void main() {",
				"	vTC = uv;",
				"	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
				"}"
			].join("\n"),

			fragmentShader: [
				"varying vec2 vTC;",
				"uniform sampler2D mask;",
				"uniform vec4 offset;",
				"void main() {",
				"	float a = texture2D(mask, vTC).a;",
				"	a += texture2D(mask, vTC + offset.xy).a;",
				"	a += texture2D(mask, vTC - offset.xy).a;",
				"	a += texture2D(mask, vTC + offset.zw).a;",
				"	a += texture2D(mask, vTC - offset.yw).a;",
				"	gl_FragColor = vec4(1.0, 1.0, 1.0, a * 0.5);",
				"}"
			].join("\n")
		});

		this._screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		this._screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
	};

	OutlineRenderer.prototype.setOutlineWidth = function(width) {
		this._outlineWidth = width;
	};

	OutlineRenderer.prototype.render = function(renderer, scene, camera, selectedObjects, outlineColor, joints) {
		if (!selectedObjects || !selectedObjects.length) {
			return;
		}

		var size = renderer.getSize(new THREE.Vector2());
		var pixelRatio = 2; // renderer.getPixelRatio();
		var width = size.width * pixelRatio;
		var height = size.height * pixelRatio;

		if (!this._renderTarget1 || this._renderTarget1.width !== width || this._renderTarget1.height !== height) {
			var options = {
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter
			};

			this._renderTarget1 = new THREE.WebGLRenderTarget(width, height, options);
			this._renderTarget1.texture.generateMipmaps = false;
			// this._renderTarget1.depthBuffer = true;
			// this._renderTarget1.depthTexture = new THREE.DepthTexture();
			// this._renderTarget1.depthTexture.type = THREE.UnsignedShortType;

			this._renderTarget2 = new THREE.WebGLRenderTarget(width, height, options);
			this._renderTarget2.texture.generateMipmaps = false;
		}

		var nodeJointMap;
		var parentJointsMap;
		if (joints) {
			nodeJointMap = new Map();
			parentJointsMap = new Map();
			joints.forEach(function(joint) {
				if (!joint.node || !joint.parent) {
					return;
				}
				nodeJointMap.set(joint.node, joint);
				if (joint.parent) {
					var jointsArray = parentJointsMap.get(joint.parent) || [];
					jointsArray.push(joint);
					parentJointsMap.set(joint.parent, jointsArray);
				}
			});
		}

		var color;
		var selectedMeshes = new Set();
		var addMeshNode = function(node) {
			if (node.isMesh) {
				selectedMeshes.add({ mesh: node, color: color });
			}
		};

		var i;
		for (i = 0; i < selectedObjects.length; i++) {
			var selectedObject = selectedObjects[i];
			color = new THREE.Color(((i + 1) & 255) / 255, (((i + 1) >> 8) & 255) / 255, (((i + 1) >> 16) & 255) / 255);
			selectedObject._vkTraverseNodes(addMeshNode, nodeJointMap, parentJointsMap);
		}

		if (selectedMeshes.size === 0) {
			return;
		}

		var oldClearColor = new THREE.Color();
		renderer.getClearColor(oldClearColor);
		var oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setClearColor(0x000000, 0);

		var material;
		var rt1 = this._renderTarget1;
		var rt2 = this._renderTarget2;
		renderer.setRenderTarget(rt1);
		renderer.clear(true, true, false);

		var values = selectedMeshes.values();
		var next = values.next();
		while (!next.done) {
			var mesh = next.value.mesh;
			this._maskMaterial.color = next.value.color;
			next = values.next();

			material = mesh.material;
			mesh.material = this._maskMaterial;
			renderer.render(mesh, camera);
			mesh.material = material;
		}

		var offset = new THREE.Vector4(1 / width, 0, 0, 1 / height);

		// generate outline
		material = this._outlineMaterial;
		material.uniforms.mask.value = rt1.texture;
		// material.uniforms.depthMap.value = rt1.depthTexture;
		material.uniforms.offset.value = offset;
		this._screenMesh.material = material;
		renderer.setRenderTarget(rt2);
		renderer.render(this._screenMesh, this._screenCamera);
		// expand outline
		if (this._outlineWidth > 1) {
			material = this._expandMaterial;
			material.uniforms.offset.value = offset;
			this._screenMesh.material = material;
			for (i = 1; i < this._outlineWidth; i++) {
				var rt = rt1;
				rt1 = rt2;
				rt2 = rt;
				material.uniforms.mask.value = rt1.texture;
				renderer.setRenderTarget(rt2);
				renderer.render(this._screenMesh, this._screenCamera);
			}
		}

		// copy outline to screen
		material = this._copyMaterial;
		material.map = rt2.texture;
		material.color = outlineColor;
		this._screenMesh.material = material;
		renderer.setRenderTarget(null);
		renderer.render(this._screenMesh, this._screenCamera);

		renderer.setClearColor(oldClearColor, oldClearAlpha);
		renderer.autoClear = oldAutoClear;
	};

	OutlineRenderer.prototype.dispose = function() {
		if (this._copyMaterial) {
			ThreeUtils.disposeMaterial(this._copyMaterial);
			this._copyMaterial = null;
		}

		if (this._maskMaterial) {
			ThreeUtils.disposeMaterial(this._maskMaterial);
			this._maskMaterial = null;
		}

		if (this._outlineMaterial) {
			ThreeUtils.disposeMaterial(this._outlineMaterial);
			this._outlineMaterial = null;
		}

		if (this._expandMaterial) {
			ThreeUtils.disposeMaterial(this._expandMaterial);
			this._expandMaterial = null;
		}

		if (this._screenMesh) {
			ThreeUtils.disposeObject(this._screenMesh);
			this._screenMesh = null;
		}
	};

	return OutlineRenderer;
});
