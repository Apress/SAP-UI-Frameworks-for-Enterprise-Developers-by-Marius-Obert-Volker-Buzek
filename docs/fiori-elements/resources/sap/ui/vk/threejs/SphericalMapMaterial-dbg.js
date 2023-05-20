/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the PolylineGeometry class.
sap.ui.define([
	"../thirdparty/three"
], function(
	THREE
) {
	"use strict";

	var vertexShader = [
		// "#include <clipping_planes_pars_vertex>",
		"#ifdef USE_MAP",
		"	varying vec3 vEyeDirection;",
		"#endif",
		"void main() {",
		"	#include <begin_vertex>",
		"	#include <project_vertex>",
		// "	#include <clipping_planes_vertex>",
		"#ifdef USE_MAP",
		"	if (isOrthographic) {",
		"		vEyeDirection = vec3(-viewMatrix[0][2], -viewMatrix[1][2], -viewMatrix[2][2]);",
		"	} else {",
		"		vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);",
		"		vEyeDirection = worldPosition.xyz - cameraPosition;",
		"	}",
		"#endif",
		"}"
	].join("\n");

	var fragmentShader = [
		// "#include <clipping_planes_pars_fragment>",
		"#define RECIPROCAL_PI 0.3183098861837907",
		"#define RECIPROCAL_PI2 0.15915494309189535",
		// "#include <common>",
		"#include <map_pars_fragment>",
		"uniform vec3 color;",
		"uniform float opacity;",
		"#ifdef USE_MAP",
		"	varying vec3 vEyeDirection;",
		"#endif",
		"void main() {",
		// "	#include <clipping_planes_fragment>",
		"#ifdef USE_MAP",
		"#if UP_AXIS == 4", // +Z
		"	vec2 texCoord = vec2(atan(vEyeDirection.x, vEyeDirection.y), acos(-vEyeDirection.z / length(vEyeDirection))) * vec2(RECIPROCAL_PI2, RECIPROCAL_PI);",
		"#else", // +Y
		"	vec2 texCoord = vec2(atan(vEyeDirection.z, vEyeDirection.x), acos(-vEyeDirection.y / length(vEyeDirection))) * vec2(RECIPROCAL_PI2, RECIPROCAL_PI);",
		"#endif",
		"	vec4 mapColor = vec4(texture2D(map, texCoord).rgb, opacity);",
		"	mapColor.rgb *= color;",
		"#else",
		"	discard;", // invisible if the map is not yet set
		"	vec4 mapColor = vec4(0.0);",
		// "	vec4 mapColor = vec4(normalize(vEyeDirection) * 0.5 + 0.5, opacity);",
		"#endif",
		"	gl_FragColor = mapColor;",
		"}"
	].join("\n");

	function SphericalMapMaterial(parameters) {
		parameters = parameters || {};

		var _this = new THREE.ShaderMaterial({
			type: "SphericalMapMaterial",

			uniforms: {
				map: { value: parameters.map || null },
				color: { value: parameters.color || new THREE.Color(1, 1, 1) },
				opacity: { value: parameters.opacity !== undefined ? parameters.opacity : 1 }
			},

			defines: {
				UP_AXIS: parameters.upAxis !== undefined ? parameters.upAxis : 2 // +Y
			},

			vertexShader: vertexShader,
			fragmentShader: fragmentShader,

			depthTest: false,
			depthWrite: false,
			blending: THREE.CustomBlending
		});

		Object.setPrototypeOf(_this, SphericalMapMaterial.prototype);

		Object.defineProperties(_this, {
			map: {
				enumerable: true,
				get: function() {
					return this.uniforms.map.value;
				},
				set: function(value) {
					this.uniforms.map.value = value;
				}
			},
			color: {
				enumerable: true,
				get: function() {
					return this.uniforms.color.value;
				},
				set: function(value) {
					this.uniforms.color.value = value;
				}
			},
			opacity: {
				enumerable: true,
				get: function() {
					return this.uniforms.opacity.value;
				},
				set: function(value) {
					this.uniforms.opacity.value = value;
				}
			},
			upAxis: {
				enumerable: true,
				get: function() {
					return this.defines.UP_AXIS;
				},
				set: function(value) {
					this.defines.UP_AXIS = value;
					this.needsUpdate = true;
				}
			}
		});

		return _this;
	}

	SphericalMapMaterial.prototype = Object.assign(Object.create(THREE.ShaderMaterial.prototype), { constructor: SphericalMapMaterial });

	SphericalMapMaterial.prototype.isSphericalMapMaterial = true;

	SphericalMapMaterial.prototype.copy = function(source) {
		THREE.ShaderMaterial.prototype.copy.call(this, source);

		this.map = source.map;
		this.color.copy(source.color);

		return this;
	};

	return SphericalMapMaterial;
});
