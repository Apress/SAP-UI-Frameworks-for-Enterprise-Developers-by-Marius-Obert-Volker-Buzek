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

	var polylineUniforms = {
		lineColor: {
			value: new THREE.Color(1, 1, 1)
		},
		linewidth: {
			value: 1
		},
		resolution: {
			value: new THREE.Vector2(1, 1)
		},
		dashScale: {
			value: 1
		},
		dashPeriod: {
			value: new THREE.Vector3(1, 1, 1)
		},
		dashAtlas: {
			value: null
		},
		lineLength: {
			value: 1e5
		}
	};

	var uniforms = THREE.UniformsUtils.merge([
		THREE.UniformsLib.common,
		THREE.UniformsLib.fog,
		polylineUniforms
	]);

	var vertexShader = [
		"#include <common>",
		"#include <color_pars_vertex>",
		"#include <fog_pars_vertex>",
		"#include <logdepthbuf_pars_vertex>",
		"#include <clipping_planes_pars_vertex>",
		"",
		"uniform float linewidth;",
		"uniform vec2 resolution;",
		"",
		"attribute vec3 instanceStart;",
		"attribute vec3 instanceEnd;",
		"",
		"varying vec2 vTC;",
		"",
		"#if defined(USE_DASH) || TRIM_STYLE",
		"attribute vec2 instanceDistance;",
		"varying float vLineDistance;",
		"#endif",
		"",
		"void trimSegment(const in vec4 start, inout vec4 end) {",
		"	// trim end segment so it terminates between the camera plane and the near plane",
		"",
		"	// conservative estimate of the near plane",
		"	float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column",
		"	float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column",
		"	float nearEstimate = -0.5 * b / a;",
		"",
		"	float t = (nearEstimate - start.z) / (end.z - start.z);",
		"",
		"	end.xyz = mix(start.xyz, end.xyz, t);",
		"}",
		"",
		"void main() {",
		"	vTC = uv * linewidth;",
		"",
		"	// camera space",
		"	vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);",
		"	vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);",
		"",
		"	// special case for perspective projection, and segments that terminate either in, or behind, the camera plane",
		"	// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space",
		"	// but we need to perform ndc-space calculations in the shader, so we must address this issue directly",
		"	// perhaps there is a more elegant solution -- WestLangley",
		"",
		"	bool perspective = (projectionMatrix[ 2 ][ 3 ] == -1.0); // 4th entry in the 3rd column",
		"	if (perspective) {",
		"		if (start.z < 0.0 && end.z >= 0.0) {",
		"			trimSegment(start, end);",
		"		} else if (end.z < 0.0 && start.z >= 0.0) {",
		"			trimSegment(end, start);",
		"		}",
		"	}",
		"",
		"	// clip space",
		"	vec4 clipStart = projectionMatrix * start;",
		"	vec4 clipEnd = projectionMatrix * end;",
		"",
		"	// ndc space",
		"	vec2 ndcStart = clipStart.xy / clipStart.w;",
		"	vec2 ndcEnd = clipEnd.xy / clipEnd.w;",
		"",
		"	// direction",
		"	vec2 dir = (ndcEnd - ndcStart) * resolution;",
		"	float l = length(dir);",
		"	dir = normalize(dir);",
		"",
		"	// perpendicular to dir",
		"	vec2 offset = vec2(dir.y, -dir.x) * position.x;",
		"",
		"#if defined(USE_DASH) || TRIM_STYLE",
		"	vLineDistance = mix(instanceDistance.x, instanceDistance.y, position.y);",
		"#endif",
		"",
		"	// endcaps",
		"	if ( position.y < 0.0 ) {",
		"		offset -= dir;",
		"#if defined(USE_DASH)",
		"		vLineDistance = mix(instanceDistance.x, instanceDistance.y, position.y * linewidth / l);",
		"#endif",
		"	} else if ( position.y > 1.0 ) {",
		"		offset += dir;",
		"#if defined(USE_DASH)",
		"		vLineDistance = mix(instanceDistance.x, instanceDistance.y, 1.0 + (position.y - 1.0) * linewidth / l);",
		"#endif",
		"	}",
		"",
		"	// select end",
		"	vec4 clip = (position.y < 0.5) ? clipStart : clipEnd;",
		"	clip /= clip.w; // remove perspective correction",
		"",
		"	clip.xy += offset * (linewidth / resolution);",
		"",
		"	gl_Position = clip;",
		"",
		"	vec4 mvPosition = (position.y < 0.5) ? start : end; // this is an approximation",
		"",
		"#include <logdepthbuf_vertex>",
		"#include <clipping_planes_vertex>",
		"#include <fog_vertex>",
		"}"
	].join("\n");

	var fragmentShader = [
		"uniform vec3 diffuse;",
		"uniform vec3 lineColor;",
		"uniform float opacity;",
		"uniform float linewidth;",
		"",
		"#ifdef USE_DASH",
		"uniform float dashScale;",
		"uniform vec3 dashPeriod;",
		"uniform sampler2D dashAtlas;",
		"#endif",
		"",
		"#if (TRIM_STYLE & 2)",
		"uniform float lineLength;",
		"#endif",
		"",
		"varying float vLineDistance;",
		"",
		"#include <common>",
		"#include <color_pars_fragment>",
		"#include <fog_pars_fragment>",
		"#include <logdepthbuf_pars_fragment>",
		"#include <clipping_planes_pars_fragment>",
		"",
		"varying vec2 vTC;",
		"",
		"void main() {",
		"",
		"#include <clipping_planes_fragment>",
		"",
		"	vec4 diffuseColor = vec4(diffuse * lineColor, opacity);",
		"",
		"	vec2 uv = abs(vTC);",
		"	diffuseColor.a *= clamp(linewidth + 0.5 - uv.y, 0.0, 1.0); // line antialiasing",
		"",
		"#if (TRIM_STYLE & 1)",
		"	if (vLineDistance < 0.0)",
		"		discard;",
		"#endif",
		"",
		"#if (TRIM_STYLE & 2)",
		"	if (vLineDistance > lineLength)",
		"		discard;",
		"#endif",
		"",
		"	if (uv.x > linewidth) { // apply segment cap",
		"#if (SEGMENT_CAP_STYLE == 1) // round cap",
		"		vec2 delta = vec2(uv.y, uv.x - linewidth);",
		"		diffuseColor.a *= clamp(linewidth - length(delta), 0.0, 1.0);",
		"#else",
		"		diffuseColor.a *= clamp(linewidth + 1.0 - uv.x, 0.0, 1.0);",
		"#endif",
		"	}",
		"",
		"#include <logdepthbuf_fragment>",
		"#include <color_fragment>",
		"",
		"#ifdef USE_DASH",
		"	float x = fract(vLineDistance * dashPeriod.y / dashScale);",
		"	vec4 dash = texture2D(dashAtlas, vec2(x * dashPeriod.z, 0.5));",
		"	dash.zw *= 255.0;",
		"	x *= dashPeriod.x;",
		"	dash.zw = vec2(dash.z - x, x - dash.w);",
		"	x = min(dash.z, dash.w) * dashScale;",
		"#if (DASH_CAP_STYLE == 1) // round cap",
		"	vec2 delta = vec2(x * 2.0, uv.y);",
		"	diffuseColor.a *= max(step(x / linewidth, 0.0), clamp(linewidth + 0.5 - length(delta), 0.0, 1.0));",
		"#else // no cap",
		"	diffuseColor.a *= clamp(0.5 - x, 0.0, 1.0);",
		"#endif",
		"#endif",
		"",
		"	gl_FragColor = diffuseColor;",
		"",
		"#include <premultiplied_alpha_fragment>",
		"#include <tonemapping_fragment>",
		"#include <encodings_fragment>",
		"#include <fog_fragment>",
		"}"
	].join("\n");

	function PolylineMaterial(parameters) {
		var _this = new THREE.ShaderMaterial({
			type: "PolylineMaterial",
			uniforms: THREE.UniformsUtils.clone(uniforms),
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		});

		Object.setPrototypeOf(_this, PolylineMaterial.prototype);

		_this.defines.DASH_CAP_STYLE = 0;
		_this.defines.SEGMENT_CAP_STYLE = 0;
		_this.defines.TRIM_STYLE = 0;
		_this._dashPattern = [];

		Object.defineProperties(_this, {
			color: {
				enumerable: true,
				get: function() {
					return this.uniforms.diffuse.value;
				},
				set: function(value) {
					this.uniforms.diffuse.value = value;
				}
			},

			lineColor: {
				enumerable: true,
				get: function() {
					return this.uniforms.lineColor.value;
				},
				set: function(value) {
					this.uniforms.lineColor.value = value;
				}
			},

			linewidth: {
				enumerable: true,
				get: function() {
					return this.uniforms.linewidth.value;
				},
				set: function(value) {
					this.uniforms.linewidth.value = value;
				}
			},

			dashCapStyle: {
				enumerable: true,
				get: function() {
					return this.defines.DASH_CAP_STYLE;
				},
				set: function(value) {
					this.defines.DASH_CAP_STYLE = value;
				}
			},

			segmentCapStyle: {
				enumerable: true,
				get: function() {
					return this.defines.SEGMENT_CAP_STYLE;
				},
				set: function(value) {
					this.defines.SEGMENT_CAP_STYLE = value;
				}
			},

			trimStyle: {
				enumerable: true,
				get: function() {
					return this.defines.TRIM_STYLE;
				},
				set: function(value) {
					this.defines.TRIM_STYLE = value;
				}
			},

			dashScale: {
				enumerable: true,
				get: function() {
					return this.uniforms.dashScale.value;
				},
				set: function(value) {
					this.uniforms.dashScale.value = value;
				}
			},

			dashPattern: {
				enumerable: true,
				get: function() {
					return this._dashPattern;
				},
				set: function(value) {
					this._dashPattern = value;
					this._updateDashAtlas();
				}
			},

			resolution: {
				enumerable: true,
				get: function() {
					return this.uniforms.resolution.value;
				},
				set: function(value) {
					this.uniforms.resolution.value.copy(value);
				}
			},

			lineLength: {
				enumerable: true,
				get: function() {
					return this.uniforms.lineLength.value;
				},
				set: function(value) {
					this.uniforms.lineLength.value = value;
				}
			}
		});

		_this.setValues(parameters);

		return _this;
	}

	PolylineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);

	PolylineMaterial.prototype.constructor = PolylineMaterial;

	PolylineMaterial.prototype.isLineMaterial = true;

	PolylineMaterial.prototype._updateDashAtlas = function() {
		if (!this._dashPattern.length) {
			delete this.defines.USE_DASH;
			this.uniforms.dashAtlas.value = null;
			this.needsUpdate = true;
			return;
		}

		var dashPattern = Array.from(this._dashPattern);
		if (dashPattern.length & 1) {
			dashPattern = dashPattern.concat(dashPattern);
		}

		var patternLength = dashPattern.reduce(function(total, num) {
			return total + Math.ceil(num);
		});
		var textureWidth = THREE.MathUtils.ceilPowerOfTwo(patternLength);
		this.uniforms.dashPeriod.value.set(patternLength, 1 / patternLength, patternLength / textureWidth);
		var data = new Uint8Array(textureWidth * 4);
		for (var i = 0, x = 0, c = 0; i < dashPattern.length; i++) {
			var w = dashPattern[i];
			var dashStart = (i & 1) ? x + w : x;
			var dashStop = (i & 1) ? x : x + w;
			var color = (i & 1) ? 0 : 255; // dash or gap
			while (w-- > 0) {
				data[c++] = color;
				data[c++] = 0;
				data[c++] = dashStart;
				data[c++] = dashStop;
				x++;
			}
		}
		// console.log("_updateDashAtlas", patternLength, textureWidth, this.uniforms.dashAtlas, data);
		var texture = new THREE.DataTexture(data, textureWidth, 1, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping,
			THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
		texture.needsUpdate = true;
		this.defines.USE_DASH = "";
		this.uniforms.dashAtlas.value = texture;
		this.needsUpdate = true;
	};

	PolylineMaterial.prototype.copy = function(source) {
		THREE.ShaderMaterial.prototype.copy.call(this, source);

		this.color.copy(source.color);
		this.lineColor.copy(source.lineColor);
		this.linewidth = source.linewidth;
		this.dashCapStyle = source.dashCapStyle;
		this.segmentCapStyle = source.segmentCapStyle;
		this.trimStyle = source.trimStyle;
		this.dashPattern = source.dashPattern;
		this.resolution = source.resolution;
		this.lineLength = source.lineLength;

		// console.log("source", source);
		// console.log("copy", this);

		return this;
	};

	return PolylineMaterial;
});
