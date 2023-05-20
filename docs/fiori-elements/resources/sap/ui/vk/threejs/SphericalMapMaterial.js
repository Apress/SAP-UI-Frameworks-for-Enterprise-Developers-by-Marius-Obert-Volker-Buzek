/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../thirdparty/three"],function(e){"use strict";var t=["#ifdef USE_MAP","\tvarying vec3 vEyeDirection;","#endif","void main() {","\t#include <begin_vertex>","\t#include <project_vertex>","#ifdef USE_MAP","\tif (isOrthographic) {","\t\tvEyeDirection = vec3(-viewMatrix[0][2], -viewMatrix[1][2], -viewMatrix[2][2]);","\t} else {","\t\tvec4 worldPosition = modelMatrix * vec4(transformed, 1.0);","\t\tvEyeDirection = worldPosition.xyz - cameraPosition;","\t}","#endif","}"].join("\n");var i=["#define RECIPROCAL_PI 0.3183098861837907","#define RECIPROCAL_PI2 0.15915494309189535","#include <map_pars_fragment>","uniform vec3 color;","uniform float opacity;","#ifdef USE_MAP","\tvarying vec3 vEyeDirection;","#endif","void main() {","#ifdef USE_MAP","#if UP_AXIS == 4","\tvec2 texCoord = vec2(atan(vEyeDirection.x, vEyeDirection.y), acos(-vEyeDirection.z / length(vEyeDirection))) * vec2(RECIPROCAL_PI2, RECIPROCAL_PI);","#else","\tvec2 texCoord = vec2(atan(vEyeDirection.z, vEyeDirection.x), acos(-vEyeDirection.y / length(vEyeDirection))) * vec2(RECIPROCAL_PI2, RECIPROCAL_PI);","#endif","\tvec4 mapColor = vec4(texture2D(map, texCoord).rgb, opacity);","\tmapColor.rgb *= color;","#else","\tdiscard;","\tvec4 mapColor = vec4(0.0);","#endif","\tgl_FragColor = mapColor;","}"].join("\n");function r(o){o=o||{};var n=new e.ShaderMaterial({type:"SphericalMapMaterial",uniforms:{map:{value:o.map||null},color:{value:o.color||new e.Color(1,1,1)},opacity:{value:o.opacity!==undefined?o.opacity:1}},defines:{UP_AXIS:o.upAxis!==undefined?o.upAxis:2},vertexShader:t,fragmentShader:i,depthTest:false,depthWrite:false,blending:e.CustomBlending});Object.setPrototypeOf(n,r.prototype);Object.defineProperties(n,{map:{enumerable:true,get:function(){return this.uniforms.map.value},set:function(e){this.uniforms.map.value=e}},color:{enumerable:true,get:function(){return this.uniforms.color.value},set:function(e){this.uniforms.color.value=e}},opacity:{enumerable:true,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},upAxis:{enumerable:true,get:function(){return this.defines.UP_AXIS},set:function(e){this.defines.UP_AXIS=e;this.needsUpdate=true}}});return n}r.prototype=Object.assign(Object.create(e.ShaderMaterial.prototype),{constructor:r});r.prototype.isSphericalMapMaterial=true;r.prototype.copy=function(t){e.ShaderMaterial.prototype.copy.call(this,t);this.map=t.map;this.color.copy(t.color);return this};return r});