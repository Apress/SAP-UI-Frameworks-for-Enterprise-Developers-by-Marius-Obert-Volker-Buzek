/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"./IndexCompressor"
], function(IndexCompressor) {
	"use strict";

	var IS_POLYLINE = 1;
	var HAS_NORMALS = 2;
	var HAS_TEXTURE_COORDINATES = 4;

	var VDSBOUNDINGBOX_MIN_X = 0;
	// var VDSBOUNDINGBOX_MIN_Y = 1;
	// var VDSBOUNDINGBOX_MIN_Z = 2;
	var VDSBOUNDINGBOX_MAX_X = 3;
	// var VDSBOUNDINGBOX_MAX_Y = 4;
	// var VDSBOUNDINGBOX_MAX_Z = 5;

	var GeometryFactory = function() { };

	GeometryFactory.getGeometryInfo = function(geometryHeader, geometryBufferUint8) {

		var dv = new DataView(geometryBufferUint8.buffer, geometryBufferUint8.byteOffset, geometryBufferUint8.byteLength);
		var offset = 0; // offset for ScopeId and id etc.

		var bHasNormals = (geometryHeader.flags & HAS_NORMALS) > 0;
		var bHasTexCoords = (geometryHeader.flags & HAS_TEXTURE_COORDINATES) > 0;
		var bIsPolyline = (geometryHeader.flags & IS_POLYLINE) > 0;

		var points = [];
		var normals = [];
		var uvs = [];
		var indices = [];

		if (geometryHeader.encodingType === 0) {
			for (var vi = 0, vlen = geometryHeader.pointCount; vi < vlen; ++vi) {
				points.push(dv.getFloat32(offset, true));
				points.push(dv.getFloat32(offset + 4, true));
				points.push(dv.getFloat32(offset + 8, true));
				offset += 12;

				if (bHasNormals) {
					normals.push(dv.getFloat32(offset, true));
					normals.push(dv.getFloat32(offset + 4, true));
					normals.push(dv.getFloat32(offset + 8, true));
					offset += 12;
				}

				if (bHasTexCoords) {
					uvs.push(dv.getFloat32(offset, true));
					uvs.push(dv.getFloat32(offset + 4, true));
					offset += 8;
				}
			}

			for (var ii = 0, ilen = geometryHeader.elementCount * (bIsPolyline ? 2 : 3); ii < ilen; ++ii) {
				indices.push(dv.getUint16(offset, true));
				offset += 2;
			}
		} else {
			var indexCompressor = new IndexCompressor(geometryBufferUint8, geometryBufferUint8.length);
			indexCompressor.setCurByte(offset); // offset for ScopeId and id

			if (!indexCompressor.ReadCommand()) {
				throw "buffer over flow";
			}
			var uQuantsPos = indexCompressor.rvalue;

			var result;
			if (uQuantsPos) {
				result = UnquantizePositions(indexCompressor, geometryHeader.pointCount, uQuantsPos, geometryHeader.box, points);
				if (result.isOk) {
					points = result.array;
				} else {
					return false; // failed to unquant!
				}
			}

			var uQuantsNrm = 1; // '1' so that it doesn't go into some of the 'if's below
			if (bHasNormals) {
				// read number of normal quants
				if (!indexCompressor.ReadCommand()) {
					return false;
				}

				// decode quantized normals
				uQuantsNrm = indexCompressor.rvalue;
				if (uQuantsNrm) {
					result = UnquantizeNormals(indexCompressor, geometryHeader.pointCount, uQuantsNrm);
					if (result.isOk) {
						normals = result.array;
					} else {
						return false;
					}
				}
			}

			var uQuantsTex = 1; // '1' so that it doesn't go into some of the 'if's below
			var bNeedTexcoordMinMax = false;
			if (bHasTexCoords) {
				// read number of texcoord quants
				if (!indexCompressor.ReadCommand()) {
					return false;
				}

				// decode quantized texture coordinates
				uQuantsTex = indexCompressor.rvalue;
				if (uQuantsTex) {
					result = UnquantizeTexCoord(indexCompressor, geometryHeader.pointCount, uQuantsTex);
					if (result.isOk) {
						bNeedTexcoordMinMax = true;
						uvs = result.array;
					} else {
						return false;
					}
				}
			}

			if (!uQuantsPos || !uQuantsNrm || !uQuantsTex || bNeedTexcoordMinMax) { // we have some uncompressed data to read

				if (bNeedTexcoordMinMax) { // uncompressed texture coordinates min/max
					offset = indexCompressor.getCurByte(); // pass offset of quant flag
					var tmin = dv.getFloat32(offset, true);
					var tmax = dv.getFloat32(offset + 4, true);

					indexCompressor.moveCurByte(8);

					if ((tmin !== 0.0) || (tmax !== 1.0)) { // rescale all texture coordinate values, as they were read as [0..1] range
						var scale = tmax - tmin;
						for (var ti = 0; ti < geometryHeader.pointCount * 2; ti++) {
							uvs[ti] = uvs[ti] * scale + tmin;
						}
					}
				}

				var pi;
				if (!uQuantsPos) { // uncompressed positions
					offset = indexCompressor.getCurByte(); // pass offset of quant flag
					for (pi = 0; pi < geometryHeader.pointCount; pi++) {
						points.push(dv.getFloat32(offset + pi * 4, true));
						points.push(dv.getFloat32(offset + (pi + geometryHeader.pointCount) * 4, true));
						points.push(dv.getFloat32(offset + (pi + geometryHeader.pointCount * 2) * 4, true));
					}
					indexCompressor.moveCurByte(geometryHeader.pointCount * 3 * 4);
				}

				if (!uQuantsNrm) { // uncompressed normals
					offset = indexCompressor.getCurByte(); // pass offset of quant flag
					for (pi = 0; pi < geometryHeader.pointCount; pi++) {
						normals.push(dv.getFloat32(offset + (pi) * 4, true));
						normals.push(dv.getFloat32(offset + (pi + geometryHeader.pointCount * 1) * 4, true));
						normals.push(dv.getFloat32(offset + (pi + geometryHeader.pointCount * 2) * 4, true));
					}
					indexCompressor.moveCurByte(geometryHeader.pointCount * 3 * 4);
				}

				if (!uQuantsTex) { // uncompressed texture coordinates
					if (bHasTexCoords) {
						offset = indexCompressor.getCurByte(); // pass offset of quant flag
						for (pi = 0; pi < geometryHeader.pointCount; pi++) {
							uvs.push(dv.getFloat32(offset + (pi) * 4, true));
							uvs.push(dv.getFloat32(offset + (pi + geometryHeader.pointCount * 1) * 4, true));
						}
						indexCompressor.moveCurByte(geometryHeader.pointCount * 2 * 4);
					}
				}
			}

			var cByte = indexCompressor.getCurByte(); // back it up before reset
			indexCompressor.Reset();
			indexCompressor.setCurByte(cByte);

			var prevVertical = [0, 0, 0];
			var itemCount = bIsPolyline ? 2 : 3;
			for (var i = 0; i < geometryHeader.elementCount; i++) {
				for (var j = 0; j < itemCount; j++) {
					if (!indexCompressor.ReadCommand(prevVertical[j])) {
						throw "UIC1 Decompression error!!!";
					} else {
						indices.push(indexCompressor.rvalue);
						prevVertical[j] = indexCompressor.rvalue;
					}
				}
			}
		}

		return {
			id: geometryHeader.id,
			isPolyline: bIsPolyline,
			data: {
				indices: indices,
				points: points,
				normals: normals,
				uvs: uvs
			}
		};
	};

	function UnquantizePositions(indexCompressor, pointCount, nQuants, boundingBox) {

		var result = {
			array: new Array(pointCount * 3),
			isOk: false
		};

		for (var xyz = 0; xyz < 3; xyz++) { // XXX, YYY, ZZZ
			var vmin = boundingBox[VDSBOUNDINGBOX_MIN_X + xyz];
			var quant = (boundingBox[VDSBOUNDINGBOX_MAX_X + xyz] - vmin) / nQuants;
			for (var i = 0; i < pointCount; i++) {
				if (!indexCompressor.ReadCommand()) {
					return result;
				}
				result.array[i * 3 + xyz] = quant * indexCompressor.rvalue + vmin;
			}
		}

		result.isOk = true;
		return result;
	}

	function UnquantizeNormals(indexCompressor, pointCount, nQuants) {

		var result = {
			array: [], // float array
			isOk: false
		};

		// temp array in uint32
		var tempArray = [];

		var pi;
		for (pi = 0; pi < pointCount; pi++) {
			if (!indexCompressor.ReadCommand()) {
				return result;
			}
			tempArray.push(indexCompressor.rvalue);
		}

		var quant = 2 * Math.PI / nQuants;
		var alpha;
		var theta;
		var k;

		for (pi = 0; pi < pointCount; pi++) {
			if (!indexCompressor.ReadCommand()) {
				return result;
			}
			alpha = quant * tempArray[pi];
			theta = quant * indexCompressor.rvalue;
			k = Math.sin(theta);

			result.array.push(k * Math.cos(alpha));
			result.array.push(k * Math.sin(alpha));
			result.array.push(Math.cos(theta));
		}

		result.isOk = true;
		return result;
	}

	function UnquantizeTexCoord(indexCompressor, pointCount, nQuants) {
		var result = {
			array: new Array(pointCount * 2), // float array
			isOk: false
		};

		var quant = 1.0 / nQuants;
		for (var uv = 0; uv < 2; uv++) { // UUU, VVV
			for (var i = 0; i < pointCount; i++) {
				if (!indexCompressor.ReadCommand()) {
					return false;
				}
				result.array[i * 2 + uv] = quant * indexCompressor.rvalue;
			}
		}

		result.isOk = true;
		return result;
	}

	return GeometryFactory;
});
