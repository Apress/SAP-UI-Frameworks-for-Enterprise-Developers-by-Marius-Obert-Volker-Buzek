/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module does the label handling
// Author: Martina Gozlinski, extraction by Jürgen
// First part enriches scene with label specific functions //
// Second part consists of the VBI.Label object, formerly part of vobase //

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for JSLint/SAPUI5 validation
VBI.addScenePositioningFunctions = function(scene) {
	scene.GetNearestPosArray = function(posarray) {
		// do a copy of the array..............................................//
		var pa = posarray.slice();
		var nLen = Math.floor(pa.length / 3) * 3;

		var nx = pa[0];
		var ny = pa[1];
		var minX = nx, maxX = nx;
		var minY = ny, maxY = ny;

		for (var nJ = 3; nJ < nLen; nJ += 3) {
			// determine the nearest position around............................//
			while (pa[nJ] - nx > 180) {
				pa[nJ] -= 360;
			}
			while (nx - pa[nJ] > 180) {
				pa[nJ] += 360;
			}

			// next nx..........................................................//
			nx = pa[nJ];

			// do minmax........................................................//
			ny = pa[nJ + 1];
			if (minX > nx) {
				minX = nx;
			}
			if (maxX < nx) {
				maxX = nx;
			}
			if (minY > ny) {
				minY = ny;
			}
			if (maxY < ny) {
				maxY = ny;
			}
		}

		// set the minimum and maximum values..................................//
		pa.m_MinX = minX;
		pa.m_MaxX = maxX;
		pa.m_MinY = minY;
		pa.m_MaxY = maxY;

		return pa;
	};

	scene.GetNearestPos = function(pos, nearpos) {
		// do a copy of the pos................................................//
		var p = pos.slice();

		// determine the nearest position around...............................//
		var nx = nearpos[0];
		while (p[0] - nx > 180) {
			p[0] -= 360;
		}
		while (nx - p[0] > 180) {
			p[0] += 360;
		}
		return p;
	};

	scene.BuildCacheDataObj = function() {
		var newObj = {};

		newObj.mul = Math.PI / 180.0;

		var cv = scene.m_Canvas[0];
		var cvo = scene.m_Canvas[scene.m_nOverlayIndex];
		var lod = cv.m_nCurrentLOD;

		newObj.minLOD = scene.GetMinLOD();
		newObj.lod = lod;
		newObj.nMaxLODTiles = (1 << lod);

		newObj.tilePixelWidth = scene.m_nWidthCanvas / scene.m_nTilesX;
		newObj.tilePixelHeight = scene.m_nHeightCanvas / scene.m_nTilesY;

		newObj.completeX = newObj.nMaxLODTiles * newObj.tilePixelWidth;
		newObj.completeY = newObj.nMaxLODTiles * newObj.tilePixelHeight;

		newObj.fx = cvo.getPixelWidth() / scene.m_nWidthCanvas;
		newObj.fy = cvo.getPixelHeight() / scene.m_nHeightCanvas;

		var proj = scene.m_Proj;

		newObj.ucs_min = proj.m_nUCSMin * newObj.completeX;
		newObj.ucs_max = proj.m_nUCSMax * newObj.completeX;
		newObj.ucs_compl = proj.m_nXYRatio * newObj.completeX;

		newObj.ox = cv.m_nCurrentX * newObj.tilePixelWidth + newObj.ucs_min;
		newObj.oy = cv.m_nCurrentY * newObj.tilePixelHeight;

		newObj.factX = newObj.completeX * newObj.fx;
		newObj.factY = newObj.completeY * newObj.fy;
		newObj.addX = -newObj.ox * newObj.fx;
		newObj.addY = -newObj.oy * newObj.fy;

		scene.m_CacheVars = newObj;

	};

	scene.DestroyCacheDataObj = function() {
		scene.m_CacheVars = undefined;
	};

	scene.FillPositionCache = function(posarray, bUnordered) {
		// Get original data and fill cache
		//
		var n = scene.m_CacheVars;

		var ucs = [
			1.0, 1.0
		], cache = [];

		var nx = bUnordered ? 0 : posarray[0];
		var cx, cy;
		var minX = posarray[0], maxX = posarray[0];
		var minY = posarray[1], maxY = posarray[1];

		var lltucs = scene.m_Proj.LonLatToUCS;
		var mul = n.mul;

		for (var nJ = 0, len = posarray.length; nJ < len; nJ += 3) {
			// determine the nearest position around............................//
			cx = posarray[nJ];
			cy = posarray[nJ + 1];
			while (cx - nx > 180) {
				cx -= 360;
			}
			while (nx - cx > 180) {
				cx += 360;
			}
			if (cx < minX) {
				minX = cx;
			}
			if (cx > maxX) {
				maxX = cx;
			}
			if (cy < minY) {
				minY = cy;
			}
			if (cy > maxY) {
				maxY = cy;
			}
			ucs = lltucs([
				mul * cx, mul * cy
			], [
				1.0, 1.0
			]);
			cache.push(ucs[0], ucs[1], 0);
			if (!bUnordered) {
				nx = cx;
			}
		}

		posarray.cache = {
			data: cache,
			ref: scene.m_CacheVars,
			lt: lltucs([
				mul * minX, mul * maxY
			], [
				1.0, 1.0
			]),
			rb: lltucs([
				mul * maxX, mul * minY
			], [
				1.0, 1.0
			]),
			minLod: -Math.log(Math.max(maxX - minX, maxY - minY)) / Math.log(2)
		};
	};

	scene.GetVOExtension = function(posarray) {
		if (posarray.cache == undefined) {
			scene.FillPositionCache(posarray);
		}
		return posarray.cache.BB;
	};

	scene.GetPointArrayFromPosArrayWCache = function(posarray) {

		if (posarray.cache == undefined) {
			scene.FillPositionCache(posarray);
		}
		return posarray.cache.data;
	};

	scene.GetPointFromUCSPoint = function(point) {
		var n = scene.m_CacheVars;
		return [
			point[0] * n.factX + n.addX, point[1] * n.factY + n.addY
		];
	};

	scene.GetPointArrayFromUCSArray = function(posarray) {
		var n = scene.m_CacheVars;
		var factX = n.factX, factY = n.factY;
		var addX = n.addX, addY = n.addY;
		var ret = [];
		for (var nJ = 0; nJ <= posarray.length - 3; nJ += 3) {
			ret.push(posarray[nJ] * factX + addX, posarray[nJ + 1] * factY + addY, 0.0);
		}
		return ret;
	};

	scene.GetShortPointArrayFromUCSArray = function(posarray) {
		var n = scene.m_CacheVars;
		var factX = n.factX, factY = n.factY;
		var addX = n.addX, addY = n.addY;
		var ret = [];
		for (var nJ = 0; nJ <= posarray.length - 3; nJ += 3) {
			ret.push(posarray[nJ] * factX + addX, posarray[nJ + 1] * factY + addY);
		}
		return ret;
	};

	scene.GetPointArrayFromPosArray = function(posarray, adjust, bIgnoreStretch) {
		// in a geoscene the pos is specified as lon/lat/height, where lon and.//
		// lat are specified in degrees, convert them to radians...............//
		// the posarray is one large array with triples lon/lat,height.........//

		var lonlat = [
			0.0, 0.0
		], ret = [];
		var cv = scene.m_Canvas[0];
		var nMaxLODTiles = (1 << cv.m_nCurrentLOD);

		var tilePixelWidth = scene.m_nWidthCanvas / scene.m_nTilesX;
		var tilePixelHeight = scene.m_nHeightCanvas / scene.m_nTilesY;

		// normalize complete dimension on current LOD.........................//
		var completeX = nMaxLODTiles * tilePixelWidth;
		var completeY = nMaxLODTiles * tilePixelHeight;

		// adjust to current zoom factor for the rendering canvas..............//
		var cvo = scene.m_Canvas[scene.m_nOverlayIndex];
		var fx = bIgnoreStretch ? 1 : cvo.getPixelWidth() / scene.m_nWidthCanvas;
		var fy = bIgnoreStretch ? 1 : cvo.getPixelHeight() / scene.m_nHeightCanvas;

		// geo connversion routine.............................................//
		var lltucs = scene.m_Proj.LonLatToUCS;

		var ucs = [
			0, 0
		], mul = Math.PI / 180.0;
		var proj = scene.m_Proj;
		var ucs_min = proj.m_nUCSMin * completeX;
		var ucs_max = proj.m_nUCSMax * completeX;
		var ucs_compl = proj.m_nXYRatio * completeX;

		var ox = cv.m_nCurrentX * tilePixelWidth + ucs_min;
		var oy = cv.m_nCurrentY * tilePixelHeight;
		var nJ, len;

		for (nJ = 0, len = posarray.length; nJ < len; nJ += 3) {
			// deg to rad now inline due to performance.........................//
			lonlat[0] = mul * posarray[nJ];
			lonlat[1] = mul * posarray[nJ + 1];

			ucs[0] = completeX;
			ucs[1] = completeY;
			ucs = lltucs(lonlat, ucs);

			// map position into canvas area....................................//
			ucs[0] = ucs[0] - ox;
			ucs[1] = ucs[1] - oy;
			if (adjust) {
				// adjust to round world.........................................//
				while (ucs[0] < ucs_min) {
					ucs[0] += ucs_compl;
				}
				while (ucs[0] > ucs_max) {
					ucs[0] -= ucs_compl;
				}
			}
			ret.push(ucs[0] * fx, ucs[1] * fy, 0.0);

		}

		// only when it was a single point, calculate visibility...............//
		if (len == 1 && ucs) {
			// do point clipping and set the visible state......................//
			var x, y;
			ret.m_bVisible = (((x = ucs[0]) > 0) && ((y = ucs[1]) > 0) && (x < scene.m_nWidthCanvas) && (y < scene.m_nHeightCanvas));
		}

		return ret;
	};

	scene.GetPointFromGeo = function(lonlat, adjust) {
		// lonlat is specified in !radians! before using the array function....//
		// we must convert them................................................//
		return scene.GetPointArrayFromPosArray(VBI.MathLib.RadToDeg(lonlat), adjust);
	};

// determine an array of x offsets that need to be used to render the.....//
// the object for round world.............................................//
// this is calculated assuming non zoomed canvas..........................//

	scene.GetInstanceOffsets = function(rect) {
		var rc = rect.slice(); // copy the array..............................//

		// determine theoretical pixels of this lod............................//
		var cv = scene.m_Canvas[0];
		var tilePixelWidth = scene.m_nWidthCanvas / scene.m_nTilesX;
		var completeX = (1 << cv.m_nCurrentLOD) * tilePixelWidth * scene.m_Proj.m_nXYRatio;

		var rcCanvas = [
			0, 0, scene.m_nWidthCanvas, scene.m_nHeightCanvas
		];
		var nCount = 0;

		// shift the object to the left, till it is out of bounds..............//
		while (rc[2] > 0) {
			--nCount;
			VBI.Utilities.RectOffset(rc, -completeX, 0);
		}

		// start to shift the object to the right and collect intersection.....//
		var aOffsets = [];
		while (rc[0] < scene.m_nWidthCanvas) {
			nCount++;
			VBI.Utilities.RectOffset(rc, completeX, 0);
			if (VBI.Utilities.RectIntersect(rc, rcCanvas)) {
				aOffsets.push(nCount * completeX);
			}
		}

		return aOffsets; // return the offsets for rendering the instance.....//
	};

	scene.GetCorrectedInstanceOffsets = function(rect, zf) {
		var rc = rect.slice(); // copy the array..............................//

		// determine theoretical pixels of this lod............................//
		var cv = scene.m_Canvas[0];
		var tilePixelWidth = scene.m_nWidthCanvas / scene.m_nTilesX;
		var completeX = zf[0] * (1 << cv.m_nCurrentLOD) * tilePixelWidth * scene.m_Proj.m_nXYRatio;

		var rcCanvas = [
			0, 0, zf[0] * scene.m_nWidthCanvas, zf[1] * scene.m_nHeightCanvas
		];
		var nCount = 0;

		// shift the object to the left, till it is out of bounds..............//
		while (rc[2] > 0) {
			--nCount;
			VBI.Utilities.RectOffset(rc, -completeX, 0);
		}

		// start to shift the object to the right and collect intersection.....//
		var aOffsets = [];
		while (rc[0] < scene.m_nWidthCanvas) {
			nCount++;
			VBI.Utilities.RectOffset(rc, completeX, 0);
			if (VBI.Utilities.RectIntersect(rc, rcCanvas)) {
				aOffsets.push(nCount * completeX);
			}
		}

		return aOffsets; // return the offsets for rendering the instance.....//
	};
// ........................................................................//
// get the geoposition from a given pixel point of the viewport/div.......//

	scene.GetPosFromVPPoint = function(pt) {
		var canv = scene.m_Canvas[scene.m_nOverlayIndex];

		// determine the position in the canvas................................//
		var cp = [
			pt[0] - canv.getPixelLeft(), pt[1] - canv.getPixelTop(), 0
		];
		var tmp = this.GetGeoFromPoint(cp); // radians are returned here.//
		return VBI.MathLib.RadToDeg(tmp); // convert to deg............//
	};

// .......................................................................//
// determine the geoposition from a given pixel point of the zoomed.......//
// canvas.................................................................//

	scene.GetPosFromPoint = function(pt) {
		var tmp = this.GetGeoFromPoint(pt); // radians are returned here.//
		return VBI.MathLib.RadToDeg(tmp); // convert to deg............//
	};

	scene.GetGeoFromPoint = function(pt) {
		var cv = scene.m_Canvas[0];
		var nLOD = cv.m_nCurrentLOD;

		// in pixel space we are
		var nMaxLODTiles = (1 << nLOD);
		var canvasPixelLeft = pt[0] * scene.m_nWidthCanvas / cv.getPixelWidth();
		var canvasPixelTop = pt[1] * scene.m_nHeightCanvas / cv.getPixelHeight();

		var tilePixelWidth = scene.m_nWidthCanvas / scene.m_nTilesX;
		var tilePixelHeight = scene.m_nHeightCanvas / scene.m_nTilesY;

		// number of pixels outside............................................//
		var nOutsideX = cv.m_nCurrentX * tilePixelWidth;
		var nOutsideY = cv.m_nCurrentY * tilePixelHeight;

		// in pixel space for the current lod we are at........................//
		var currentX = nOutsideX + canvasPixelLeft;
		var currentY = nOutsideY + canvasPixelTop;

		// complete pixel space................................................//
		var completeX = nMaxLODTiles * tilePixelWidth;
		var completeY = nMaxLODTiles * tilePixelHeight;

		// do not normalize ...................................................//
		// with normalization we can not handle big geometrical shapes.........//
		/*
		 * while( currentX < 0 ) currentX += completeX; while( currentY < 0 ) currentY += completeY; while( currentX > completeX ) currentX -=
		 * completeX; while( currentY > completeY ) currentY -= completeY;
		 */

		// normalize complete dimension on current LOD.........................//
		var lonlat = [
			0, 0
		];
		var ucs = [
			currentX / completeX * 2.0 - 1.0, currentY / completeY * 2.0 - 1.0
		];

		return scene.m_Proj.UCSToLonLat(ucs, lonlat);
	};
};

});
