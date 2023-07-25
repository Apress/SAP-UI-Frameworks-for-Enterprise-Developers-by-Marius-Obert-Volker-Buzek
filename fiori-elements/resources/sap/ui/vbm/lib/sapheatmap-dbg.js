/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

// init creatable objects in vbi context
/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.Tex = null; // texture object
VBI.Shader = null; // shader object
VBI.FB = null; // frame buffer object
VBI.Vals = null;
VBI.Ro = null; // render output

VBI.Hm = null; // heatmap object

// ...........................................................................//
// hook into webgl...........................................................//

VBI.Hook = (function() {
	// override getExtension for different vendors............................//
	if (window.WebGLRenderingContext) {
		// hook get the rendercontect getExtension.............................//
		var getExtension = WebGLRenderingContext.prototype.getExtension;
		WebGLRenderingContext.prototype.getExtension = function(name) {
			var vendors = [
				'', 'MS', 'WEBKIT', 'MOZ', 'O'
			];
			var oExt, vendor;
			if ((oExt = getExtension.call(this, name)) === null) {
				for (var nJ = 0, len = vendors.length; nJ < len; ++nJ) {
					vendor = vendors[nJ];
					if ((oExt = getExtension.call(this, vendor + '_' + name)) !== null) {
						return oExt;
					}
				}
				return null;
			} else {
				return oExt;
			}
		};

		// add helper function.................................................//
		WebGLRenderingContext.prototype.getExtensions = function(spec) {
			// try to get needed extensions
			return this.getExtension('OES_texture_float');

			// this extension tells if the device supports render to float texture, but mobile browsers don't report it yet
			// this.getExtension('WEBGL_color_buffer_float');
		};
	}
})();

VBI.Shader = (function() {
	function Shader(gl, vs, fs) {
		this.m_GL = gl; // store gl object
		this.m_UL = {}; // variable locations in program

		// compile and link the provided coding
		this.m_Prog = this.m_GL.createProgram();
		this.m_VS = this.m_GL.createShader(this.m_GL.VERTEX_SHADER);
		this.m_FS = this.m_GL.createShader(this.m_GL.FRAGMENT_SHADER);
		this.m_GL.attachShader(this.m_Prog, this.m_VS);
		this.Compile(this.m_VS, vs);
		this.m_GL.attachShader(this.m_Prog, this.m_FS);
		this.Compile(this.m_FS, fs);

		this.Link();
	}

	Shader.prototype.getShaderVar = function(name) {
		return this.m_GL.getAttribLocation(this.m_Prog, name);
	};

	Shader.prototype.Compile = function(shader, source) {
		this.m_GL.shaderSource(shader, source);
		this.m_GL.compileShader(shader);
		if (!this.m_GL.getShaderParameter(shader, this.m_GL.COMPILE_STATUS)) {
			jQuery.sap.log.error("Shader Compilation Error");
			jQuery.sap.log.error(this.m_GL.getShaderInfoLog(shader));
		}
	};

	Shader.prototype.Link = function() {
		this.m_GL.linkProgram(this.m_Prog);
		if (!this.m_GL.getProgramParameter(this.m_Prog, this.m_GL.LINK_STATUS)) {
			jQuery.sap.log.error("Shader Link Error");
			jQuery.sap.log.error(this.m_GL.getProgramInfoLog(this.m_Prog));
		}
	};

	Shader.prototype.Apply = function() {
		this.m_GL.useProgram(this.m_Prog);
		return this;
	};

	Shader.prototype.getLoc = function(name) {
		var loc = this.m_UL[name];
		if (typeof (loc) === "undefined") {
			loc = this.m_UL[name] = this.m_GL.getUniformLocation(this.m_Prog, name);
		}
		return loc;
	};

	Shader.prototype.SetInt = function(name, val) {
		this.m_GL.uniform1i(this.getLoc(name), val);
		return this;
	};

	return Shader;
})();

VBI.FB = (function() {
	function FB(gl) {
		this.m_GL = gl;
		this.m_FB = this.m_GL.createFramebuffer();
	}

	FB.prototype.destroy = function() {
		return this.m_GL.deleteFramebuffer(this.m_FB);
	};

	FB.prototype.BindFB = function() {
		this.m_GL.bindFramebuffer(this.m_GL.FRAMEBUFFER, this.m_FB);
		return this;
	};

	FB.prototype.UnBindFB = function() {
		this.m_GL.bindFramebuffer(this.m_GL.FRAMEBUFFER, null);
		return this;
	};

	FB.prototype.SetTex = function(tex) {
		this.m_GL.framebufferTexture2D(this.m_GL.FRAMEBUFFER, this.m_GL.COLOR_ATTACHMENT0, this.m_GL.TEXTURE_2D, tex.m_Tex, 0);

		// check if render to float texture is supported by the hardware
		var status = this.m_GL.checkFramebufferStatus(this.m_GL.FRAMEBUFFER);
		if (status !== this.m_GL.FRAMEBUFFER_COMPLETE) {
			return null;
		}

		return this;
	};

	return FB;
})();

VBI.Tex = (function() {
	function Tex(gl, params) {
		var tmp;
		this.m_GL = gl;

		params = params ? params : {};

		this.m_colFmt = this.m_GL[((tmp = params.colfmt) != null ? tmp : 'rgba').toUpperCase()];
		if (typeof params.type === 'number') {
			this.type = params.type;
		} else {
			this.type = this.m_GL[((tmp = params.type) != null ? tmp : 'unsigned_byte').toUpperCase()];
		}

		this.m_Tex = this.m_GL.createTexture();
	}

	Tex.prototype.destroy = function() {
		return this.m_GL.deleteTexture(this.m_Tex);
	};

	Tex.prototype.BindTex = function(slot) {
		if (slot == null) {
			slot = 0;
		}
		this.m_GL.activeTexture(this.m_GL.TEXTURE0 + slot);
		this.m_GL.bindTexture(this.m_GL.TEXTURE_2D, this.m_Tex);
		return this;
	};

	Tex.prototype.AdjustSize = function(w, h) {
		this.m_W = w;
		this.m_H = h;
		this.m_GL.texImage2D(this.m_GL.TEXTURE_2D, 0, this.m_colFmt, w, h, 0, this.m_colFmt, this.type, null);
		return this;
	};

	Tex.prototype.SetImage = function(data) {
		this.m_W = data.width;
		this.m_H = data.height;
		this.m_GL.texImage2D(this.m_GL.TEXTURE_2D, 0, this.m_colFmt, this.m_colFmt, this.type, data);
		return this;
	};

	Tex.prototype.SetFilterNearest = function() {
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_MAG_FILTER, this.m_GL.NEAREST);
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_MIN_FILTER, this.m_GL.NEAREST);
		return this;
	};

	Tex.prototype.SetWrapEdge = function() {
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_WRAP_S, this.m_GL.CLAMP_TO_EDGE);
		this.m_GL.texParameteri(this.m_GL.TEXTURE_2D, this.m_GL.TEXTURE_WRAP_T, this.m_GL.CLAMP_TO_EDGE);
		return this;
	};

	return Tex;
})();

VBI.Ro = (function() {
	function Ro(gl, width, height) {
		this.m_GL = gl;
		this.m_W = width;
		this.m_H = height;

		var ext = this.m_GL.getExtensions(); // check if the required extensions are supported
		var texType = null;
		if (ext) {
			texType = this.m_GL.FLOAT;
		}

		// create a float texture
		this.m_Tex = new VBI.Tex(this.m_GL, {
			type: texType
		});

		this.m_Tex.BindTex(0);
		this.m_Tex.AdjustSize(width, height);
		this.m_Tex.SetFilterNearest();
		this.m_Tex.SetWrapEdge();

		// create the frame buffer based on texture
		this.m_FB = new VBI.FB(this.m_GL);
		this.m_FB.BindFB();

		// check if render to float texture is supported
		if (!this.m_FB.SetTex(this.m_Tex)) {
			this.m_FB.UnBindFB();

			// render to float texture not supported => try to create integer texture and then render to it
			//jQuery.sap.log.error("Render to float texture not supported => creating integer texture");

			// create an integer texture
			this.m_Tex = new VBI.Tex(this.m_GL, {
				type: null
			});

			this.m_Tex.BindTex(0);
			this.m_Tex.AdjustSize(width, height);
			this.m_Tex.SetFilterNearest();
			this.m_Tex.SetWrapEdge();

			// create the frame buffer based on texture
			this.m_FB = new VBI.FB(this.m_GL);
			this.m_FB.BindFB();
			this.m_FB.SetTex(this.m_Tex);
			this.m_FB.UnBindFB();
		} else {
			this.m_FB.UnBindFB();
		}
	}

	Ro.prototype.Apply = function() {
		return this.m_FB.BindFB();
	};

	Ro.prototype.BindRo = function(slot) {
		return this.m_Tex.BindTex(slot);
	};

	Ro.prototype.UnBindRo = function() {
		this.m_FB.UnBindFB();
	};

	Ro.prototype.AdjustSize = function(width, height) {
		this.m_W = width;
		this.m_H = height;

		// set the new size of the texture
		return this.m_Tex.BindTex(0).AdjustSize(width, height);
	};

	return Ro;
})();

// values for heatmap
VBI.Vals = (function() {
	function Vals(gl, width, height) {
		this.m_GL = gl;

		// constants
		this.m_nPointChunk = 10240; // chunksize
		this.m_nVertexSize = 8;

		this.m_W = width;
		this.m_H = height;

		this.m_Shader = new VBI.Shader(this.m_GL,
						"uniform vec4 uTM;" +
						"attribute vec4 aPos;" +
						"attribute float aValue;" +
						"varying vec3 vData;" +
						"void main(){" +
						"  gl_Position = vec4(aPos.xy * uTM.xy + uTM.zw, 0.0, 1.0);" +
						"  vData.xy = aPos.zw;" +
						"  vData.z = aValue;" +
						"}",
						"#ifdef GL_FRAGMENT_PRECISION_HIGH\n" +
						"  precision highp int;" +
						"  precision highp float;\n" +
						"#else\n" +
						"  precision mediump int;" +
						"  precision mediump float;\n" +
						"#endif\n" +
						"varying vec3 vData;" +
						"void main(){" +
						"  float f = smoothstep(1.0, 0.0, length(vData.xy)) * vData.z;" +
						"  gl_FragColor = vec4(f);" +
						"}");

		// "#ifdef GL_FRAGMENT_PRECISION_HIGH\n precision highp int;\n precision highp float;\n#else\n precision mediump int;\n precision mediump
		// float;\n#endif\nvarying vec2 off, dim;\nvarying float val;\nvoid main(){ float d = length(off/dim); float f = exp( -1.0/(d*d) ); float tmp
		// = f*val; gl_FragColor=vec4(tmp);}\n");

		this.m_Shader.aPos = this.m_Shader.getShaderVar('aPos');
		this.m_Shader.aValue = this.m_Shader.getShaderVar('aValue');
		this.m_Shader.uTM = this.m_Shader.getLoc('uTM');

		// create a render output buffer
		this.m_Ro = new VBI.Ro(this.m_GL, this.m_W, this.m_H);

		this.m_VB = this.m_GL.createBuffer();
		this.m_vBuf = new Float32Array(this.m_nPointChunk * this.m_nVertexSize * 6);

		this.m_IB = this.m_GL.createBuffer();
		var elements = new Uint16Array(this.m_nPointChunk * 6);
		for (var i = 0, j = 0; i < elements.length; j += 4) {
			elements[i++] = j;
			elements[i++] = j + 1;
			elements[i++] = j + 2;
			elements[i++] = j + 2;
			elements[i++] = j + 1;
			elements[i++] = j + 3;
		}
		this.m_GL.bindBuffer(this.m_GL.ELEMENT_ARRAY_BUFFER, this.m_IB);
		this.m_GL.bufferData(this.m_GL.ELEMENT_ARRAY_BUFFER, elements, this.m_GL.STATIC_DRAW);

		this.m_nIdx = 0;
		this.m_nPoints = 0;
	}

	Vals.prototype.AdjustSize = function(w, h) {
		this.m_W = w;
		this.m_H = h;
		this.m_Ro.AdjustSize(this.m_W, this.m_H);
		return;
	};

	Vals.prototype.Render = function() {
		if (this.m_nPoints > 0) {
			var gl = this.m_GL;
			gl.enable(gl.BLEND);
			this.m_Ro.Apply();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_IB);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VB);
			gl.bufferData(gl.ARRAY_BUFFER, this.m_vBuf, gl.STREAM_DRAW);

			this.m_Shader.Apply();

			gl.enableVertexAttribArray(1);
			gl.vertexAttribPointer(this.m_Shader.aPos, 4, gl.FLOAT, false, 20, 0);
			gl.vertexAttribPointer(this.m_Shader.aValue, 1, gl.FLOAT, false, 20, 16);

			gl.uniform4f(this.m_Shader.uTM, 2 / this.m_W, 2 / this.m_H, -1, -1);

			// draw squares
			gl.drawElements(gl.TRIANGLES, this.m_nPoints * 6, gl.UNSIGNED_SHORT, 0);
			gl.disableVertexAttribArray(1);

			// cleanup
			this.m_Ro.UnBindRo();
			gl.disable(gl.BLEND);
			this.m_nPoints = 0;
			this.m_nIdx = 0;
		}
	};

	Vals.prototype.Clear = function() {
		this.m_Ro.Apply();
		this.m_GL.clearColor(0.0, 0.0, 0.0, 0.0);
		this.m_GL.clear(this.m_GL.COLOR_BUFFER_BIT);
		return this.m_Ro.UnBindRo();
	};

	Vals.prototype.AddPoint = function(x, y, val, s) {
		// when more points than chunksize render multiple times the gray image..//
		if ((this.m_nPoints + 1) >= this.m_nPointChunk) {
			this.Render();
		}

		y = this.m_H - y; // flip y coordinate

		// the flat rectangle to draw to.........................................//
		this.PushVertex(x - s, y - s, -1, -1, val);
		this.PushVertex(x + s, y - s, +1, -1, val);
		this.PushVertex(x - s, y + s, -1, +1, val);
		this.PushVertex(x + s, y + s, +1, +1, val);
		this.m_nPoints += 1;
		return this.m_nPoints;
	};

	Vals.prototype.PushVertex = function(x, y, xs, ys, val) {
		var a = this.m_vBuf;
		var cnt = this.m_nIdx;
		a[cnt++] = x;
		a[cnt++] = y;
		a[cnt++] = xs;
		a[cnt++] = ys;
		a[cnt++] = val;
		this.m_nIdx = cnt;
	};

	return Vals;
})();

VBI.Hm = (function() {
	function Hm(oArgs) {
		var calcAlpha; // shader fragment to calculate an alpha
		var calcCol; // shader fragment to calculate the color

		var scene = oArgs.scene;

		// adjust arguments
		if (typeof (oArgs.alphaBounds == 'undefined')) {
			oArgs.alphaBounds = [
				0.0, 1.0
			];
		}
		if (typeof (oArgs.alpha == 'undefined')) {
			oArgs.alpha = true;
		}

		this.m_Canv = oArgs.canvas; // store the canvas
		this.m_W = oArgs.width; // store width
		this.m_H = oArgs.height; // store height
		this.m_aFunc = oArgs.aFunc.toFixed(8);
		this.m_cFunc = oArgs.cFunc.toFixed(8);

		if (!this.m_Canv) {
			this.m_Canv = document.createElement("canvas");
			this.m_Canv.setAttribute("role", sap.ui.core.AccessibleRole.Img);
		}

		var oAttibutes = {
			depth: false,
			antialias: false,
			alpha: true
		}; // webgl attributes

		// get the webgl context...............................................//
		if (!this.m_GL) {
			this.m_GL = this.m_Canv.getContext("experimental-webgl", oAttibutes);
		}
		if (!this.m_GL) {
			this.m_GL = this.m_Canv.getContext("webgl", oAttibutes);
		}
		if (!this.m_GL) {
			jQuery.sap.log.error("WebGL not supported");
			return;
		}

		this.m_GL.blendFunc(this.m_GL.ONE, this.m_GL.ONE); // no blend, just copy to colors to output
		this.m_GL.enableVertexAttribArray(0);

		// check if a gradient texture is specified
		if (oArgs.colorTexture) {
			this.m_ColorTexture = new VBI.Tex(this.m_GL, {
				colfmt: "rgba"
			});
			this.m_ColorTexture.BindTex(0);
			this.m_ColorTexture.SetFilterNearest();
			this.m_ColorTexture.SetWrapEdge();
			this.m_ColorTexture.AdjustSize(2, 2);

// if (typeof (oArgs.colorTexture) === "string") {
// image = new Image();
// image.onload = function() {
// this.m_ColorTexture.BindTex(0);
// this.m_ColorTexture.SetImage(image);
// scene.RenderAsync(false);
// }.bind(this);
// image.src = oArgs.colorTexture;
// }

			this.m_ColorTexture.BindTex(0);
			this.m_ColorTexture.SetImage(oArgs.colorTex);
			if (!oArgs.colorTex.IsLoaded) {
				scene.RenderAsync(false);
			}

			calcCol =
				"uniform sampler2D colTex; " +
				"vec3 calcCol( float g ){ " +
				"  return texture2D( colTex, vec2( g, 0.5 )).rgb; " +
				"}";
		} else {
			calcCol =
				"vec3 calcCol( float g ){ " +
				"  return smoothstep( vec3( 0.0, 0.0, 1.0 ), vec3( 1.0, 1.0, 0.0 ), vec3( g ) ); " +
				"}";
		}

		// assemble alpha usage shader code
		if (oArgs.alpha) {
			calcAlpha =
				"vec4 calcAlpha(vec3 c,float i){ " +
				"  float a = smoothstep(" + (oArgs.alphaBounds[0].toFixed(8)) + "," + (oArgs.alphaBounds[1].toFixed(8)) + ", pow(i, 1.0)); " +
				"  return vec4( c*a, a); " +
				"}";
		} else {
			calcAlpha =
				"vec4 calcAlpha(vec3 c, float i){ " +
				"  return vec4(c, 1.0);" +
				"}";
		}

		var fsVars =
			"#ifdef GL_FRAGMENT_PRECISION_HIGH \n" +
			"  precision highp int;" +
			"  precision highp float; \n" +
			"#else \n" +
			"  precision mediump int;" +
			"  precision mediump float; \n" +
			"#endif \n" +
			"uniform sampler2D src;" +
			"varying vec2 txy;";

		var fsMain =
			"void main(){ " +
			"  float f = clamp( texture2D(src, txy).r, 0.0, 1.0 ); " +
			"  vec3 color = calcCol(pow(f, " + (this.m_cFunc) + ")); " +
			"  gl_FragColor = calcAlpha(color, pow(f, " + (this.m_aFunc) + ")); " +
			"}";

		// create the shader that does the output to the canvas, it uses the blue channel for color mapping
		this.m_Shader = new VBI.Shader(this.m_GL,
		                               "attribute vec4 pos; " +
		                               "varying vec2 txy; " +
		                               "void main(){ " +
		                               "  txy = pos.xy * 0.5 + 0.5; " +
		                               "  gl_Position = pos; " +
		                               "}",
		                               fsVars + calcCol + "\n" + calcAlpha + fsMain);

		if (this.m_W == null) {
			this.m_W = this.m_Canv.offsetWidth || 2;
		}

		if (this.m_H == null) {
			this.m_H = this.m_Canv.offsetHeight || 2;
		}

		this.m_Canv.width = this.m_W;
		this.m_Canv.height = this.m_H;

		// square geometry with uv coordinates
		var geo = new Float32Array([
			-1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, 1, 1, 0, 1
		]);
		this.m_Geo = this.m_GL.createBuffer();

		this.m_GL.viewport(0, 0, this.m_W, this.m_H);
		this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, this.m_Geo);

		this.m_GL.bufferData(this.m_GL.ARRAY_BUFFER, geo, this.m_GL.STATIC_DRAW);
		this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, null);

		// values
		this.m_V = new VBI.Vals(this.m_GL, this.m_W, this.m_H);
	}

	Hm.prototype.AdjustSize = function() {
		if (!this.m_GL) {
			return; // do nothing
		}

		var cH = this.m_Canv.offsetHeight || 2;
		var cW = this.m_Canv.offsetWidth || 2;
		if (this.m_W !== cW || this.m_H !== cH) {
			this.m_GL.viewport(0, 0, cW, cH);
			this.m_Canv.width = cW;
			this.m_Canv.height = cH;
			this.m_W = cW;
			this.m_H = cH;
			this.m_V.AdjustSize(this.m_W, this.m_H);
		}
	};

	Hm.prototype.RenderColors = function() {
		// important, the values have to be rendered already in the output buffer
		if (!this.m_GL) {
			return; // do nothing
		}

		// set simple full canvas geometry
		this.m_GL.bindBuffer(this.m_GL.ARRAY_BUFFER, this.m_Geo);
		this.m_GL.vertexAttribPointer(0, 4, this.m_GL.FLOAT, false, 0, 0);

		// set the render output and the color mapping texture
		this.m_V.m_Ro.BindRo(0);
		if (this.m_ColorTexture) {
			this.m_ColorTexture.BindTex(1);
		}

		// bind the final canvas shader
		this.m_Shader.Apply();
		this.m_Shader.SetInt("src", 0);
		this.m_Shader.SetInt("colTex", 1);
		this.m_GL.drawArrays(this.m_GL.TRIANGLE_STRIP, 0, 4);
		return;
	};

	Hm.prototype.RenderValues = function() {
		if (!this.m_GL) {
			return; // do nothing
		}
		if (this.m_V) {
			this.m_V.Render();
		}
	};

	Hm.prototype.Render = function() {
		this.RenderValues(); // render values in gray texture
		this.RenderColors(); // apply colors to gray texture and rener to canvas
	};

	Hm.prototype.Clear = function() {
		return this.m_V ? this.m_V.Clear() : null;
	};

	Hm.prototype.AddPoint = function(x, y, val, sz) {
		return this.m_V ? this.m_V.AddPoint(x, y, val, sz) : null;
	};

	// return the heatmap object..............................................//
	return Hm;
})();

VBI.CreateHM = function(params) {
	return new VBI.Hm(params);
};

});
