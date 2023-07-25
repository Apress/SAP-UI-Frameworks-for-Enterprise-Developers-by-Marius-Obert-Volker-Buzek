/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// math library for geo
// Author: Ulrich Roegelein
// !remark!, all arguments work with radians

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.MathLib = (function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var mathlib = {};

	mathlib.min_longitude = -Math.PI;
	mathlib.max_longitude = Math.PI;
	mathlib.min_latitude = (-85.05112878 * 2 * Math.PI) / 360.0;
	mathlib.max_latitude = (85.05112878 * 2 * Math.PI) / 360.0;
	mathlib.mercator_for_max_latitude = 3.1415942;
	mathlib.div_mercator_for_max_latitude = (0.5 / mathlib.mercator_for_max_latitude);
	mathlib.div_max_longitude = (1.0 / mathlib.max_longitude);
	mathlib.earthradius = 6378137;
	mathlib.piDiv180 = Math.PI / 180.0;
	mathlib.One180DivPi = 1 / mathlib.piDiv180;

	mathlib.stdWorldBorder = -180;

	// ........................................................................//
	// common.................................................................//

	mathlib.CreateGUID = function() {
		// create random strings...............................................//
		var aS = [];
		for (var nJ = 0; nJ < 8; ++nJ) {
			aS[nJ] = (((Math.random() + 1) * 0x10000) | 0).toString(16).substring(1);
		}

		// concat to guid......................................................//
		return (aS[0] + aS[1] + "-" + aS[2] + "-" + aS[3] + "-" + aS[4] + "-" + aS[5] + aS[6] + aS[7]);
	};

	// ........................................................................//
	// basic transformations..................................................//

	mathlib.DegToRad = function(lonlat) {
		return [
			lonlat[0] * mathlib.piDiv180, lonlat[1] * mathlib.piDiv180
		];
	};

	mathlib.RadToDeg = function(lonlat) {
		return [
			lonlat[0] * mathlib.One180DivPi, lonlat[1] * mathlib.One180DivPi
		];
	};

	// for mercator projection only..........................................//
	mathlib.LonLatToUCS = function(lonlat, uxy) {
		// the original uxy contains the normalization values, store them......//
		// the x-coordinates increase to the right, y-coordinates increase.....//
		// from top to bottom..................................................//

		var normX = uxy[0];
		var normY = uxy[1];

		var fLongitude = lonlat[0];
		var fLatitude = lonlat[1];

		// there is !no! round world support in this function..................//
		// when the longitude is out of range of -pi to pi, he normalized......//

		if (fLatitude < mathlib.min_latitude) {
			fLatitude = mathlib.min_latitude;
		} else if (fLatitude > mathlib.max_latitude) {
			fLatitude = mathlib.max_latitude;
		}

		// geometry range is 0 to for longitude -180 to 180...................//
		uxy[0] = fLongitude * mathlib.div_max_longitude;
		uxy[0] = (uxy[0] + 1.0) * normX * 0.5;

		// geometry range is 0 to normY for latitude -max_latitude to max_latitude using the mercator projection
		var fSinLatitude = Math.sin(fLatitude);
		uxy[1] = (Math.log((1.0 + fSinLatitude) / (1.0 - fSinLatitude)) * mathlib.div_mercator_for_max_latitude); // scaled to 1
		uxy[1] = 0.5 * normY * (1.0 - uxy[1]);

		return uxy;
	};

	mathlib.UCSToLonLat = function(uxy, lonlat) {
		// the x-coordinates increase to the right, y-coordinates increase.....//
		// from top to bottom..................................................//

		// uxy must be in the range of [-1,1]..................................//
		lonlat[0] = uxy[0] * Math.PI; // range -pi ... pi..//
		lonlat[1] = Math.atan(mathlib.sinh(-uxy[1] * mathlib.mercator_for_max_latitude));
		return lonlat;
	};

	mathlib.sinh = function(val) {
		var a = Math.pow(Math.E, val);
		var b = Math.pow(Math.E, -val);
		return (a - b) / 2.0;
	};

	mathlib.Distance = function(lonlat1, lonlat2) {
		var R = mathlib.earthradius;
		var lat1 = lonlat1[1];
		var lon1 = lonlat1[0];
		var lat2 = lonlat2[1];
		var lon2 = lonlat2[0];
		var dLat = lat2 - lat1;
		var dLon = lon2 - lon1;

		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;

		return d;
	};

	mathlib.EquidistantLonLat = function(lonlatcenter, distance, slices) {
		// the center must be don in radians and the result is delivered in....//
		// in radians..........................................................//
		var result = [];
		slices = slices || 64;

		var brng, y, x;
		var angle = distance / mathlib.earthradius;

		var cx = lonlatcenter[0]; // centerx
		var cy = lonlatcenter[1]; // centery

		// calculate iteration constants first.................................//
		var sinangle = Math.sin(angle);
		var cosangle = Math.cos(angle);
		var sincenter = Math.sin(cy);
		var coscenter = Math.cos(cy);

		var minX = cx, maxX = cx;
		var minY = cy, maxY = cy;

		for (var nJ = 0; nJ < slices; ++nJ) {
			brng = nJ * 2 * Math.PI / slices;

			y = Math.asin(sincenter * cosangle + coscenter * sinangle * Math.cos(brng));
			x = cx + Math.atan2(Math.sin(brng) * sinangle * coscenter, cosangle - sincenter * Math.sin(y));

			// determine mins and max values....................................//
			if (minX > x) {
				minX = x;
			}
			if (maxX < x) {
				maxX = x;
			}
			if (minY > y) {
				minY = y;
			}
			if (maxY < y) {
				maxY = y;
			}

			// push the lonlat to the result vector.............................//
			result.push([
				x, y
			]);
		}

		// set the minimum and maximum values..................................//
		result.m_MinX = minX;
		result.m_MaxX = maxX;
		result.m_MinY = minY;
		result.m_MaxY = maxY;

		return result;
	};

	mathlib.GetSurroundingBox = function(boxList, maxXDistShownSeparate, minXLod, fCalcYLod, maxDelta) {
		// Method calculates the surrounding box over a list of bounding boxes (picture mode == false)
		// or points (picture mode == true). For the second case an array for each box is expected in the
		// following order: x_min, x_max, y_min, y_max (point mode: x,y).
		// Main task ist to find maximum outside x-distance in a round world scenario,
		// y-coordinates are taken on the fly.

		var maxDistanceFor2ndToWB = 100;
		var wb = mathlib.stdWorldBorder; // world border is set to -180/180 but may be changed from outside

		if (maxXDistShownSeparate == undefined) {
			maxXDistShownSeparate = 360;
		}

		// method might be called with points (2 fields only) instead of boxes (4 fields required)
		var pointMode = (boxList[0].length == 2);
		var ixL = 0, ixR = 1, iyB = 2, iyT = 3;
		if (pointMode) {
			ixR = 0;
			iyB = iyT = 1;
		}

		// normalize left x coordinates to [-180->180] and right > left always
		// fetch extrema of y
		var minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;
		var myValL, myValR, rg, ww, i;
		for (i = 0; i < boxList.length; ++i) {
			rg = boxList[i];
			if (((myValL = rg[ixL]) < -180) || (myValL > 180)) {
				ww = Math.floor((myValL + 180) / 360);
				myValL = (rg[ixL] -= 360 * ww);
				rg[ixR] -= 360 * ww;
			}
			if ((myValR = rg[ixR]) < myValL) {
				ww = Math.ceil((myValL - myValR) / 360);
				myValR = (rg[ixR] += 360 * ww);
			}
			if (rg[iyB] < minY) {
				minY = rg[iyB];
			}
			if (rg[iyT] > maxY) {
				maxY = rg[iyT];
			}
		}

		//
		// search for biggest x-gap in boxlist, plus the biggest x-gap in boxlist
		// which has one border close to the world border
		//

		boxList.sort(function(a, b) {
			return a[0] - b[0];
		}); // sort boxes on left x coordinate.

		var maxDistance = -1, maxDistance2 = -1;
		var indexMaxDistance = -1, indexMaxDistance2 = -1;
		var leftFromMaxDist, leftFromMaxDist2;

		var ele = boxList[0];
		var right, curRightX = ele[ixR], left = ele[ixL];
		var nLeftDistWB, nRightDistWB;

		// check all gaps from i->i+1 plus from max(i)->0 after the loop
		for (i = 1; i < boxList.length; ++i) {
			ele = boxList[i];
			left = ele[ixL];
			right = ele[ixR];
			if (left < curRightX) { // no gap to previous box
				if (right > curRightX) {
					curRightX = right; // curRightX must be maximum of both
				}
			} else {
				if ((left - curRightX) > maxDistance) {
					leftFromMaxDist = curRightX;
					maxDistance = left - curRightX;
					indexMaxDistance = i;
				}
				if ((left - curRightX) > maxDistance2) { // calculate distance to world border and update dist2 if near enough
					nLeftDistWB = Math.abs(((left - wb + 540) % 360) - 180);
					nRightDistWB = Math.abs(((curRightX - wb + 540) % 360) - 180);
					if ((nLeftDistWB < maxDistanceFor2ndToWB) || (nRightDistWB < maxDistanceFor2ndToWB)) {
						leftFromMaxDist2 = curRightX;
						maxDistance2 = left - curRightX;
						indexMaxDistance2 = i;
					}
				}
				curRightX = right;
			}
		}

		ele = boxList[0];
		left = ele[ixL];
		var closingDist = left - curRightX + 360;

		if (closingDist > maxDistance2) {
			nLeftDistWB = Math.abs(((left - wb + 540) % 360) - 180);
			nRightDistWB = Math.abs(((curRightX - wb + 540) % 360) - 180);
			if ((nLeftDistWB < maxDistanceFor2ndToWB) || (nRightDistWB < maxDistanceFor2ndToWB)) {
				leftFromMaxDist2 = curRightX;
				maxDistance2 = closingDist;
				indexMaxDistance2 = 0;
			}
		}

		if (closingDist > maxDistance) {
			maxDistance = closingDist;
			leftFromMaxDist = curRightX;
		} else {
			if (indexMaxDistance < 0) {
				return [
					wb, wb + 360, minY, maxY, false
				]; // there is no gap at all
			}
			ele = boxList[indexMaxDistance];
		}

		// normalize right coordinate to [-180,180] again
		leftFromMaxDist -= 360 * Math.floor((leftFromMaxDist + 180) / 360);

		// if the Box exceeds given limits we show the whole world europe-centric
		var nIntLodAboveXMin = Math.floor(minXLod) + 1;
		var nXLowestDist = (minXLod == undefined) ? 0 : 360 / Math.pow(2, nIntLodAboveXMin - minXLod);

		var nYLOD = 1000; // calculate y LOD. This requires knowledge of the projection, so the method to calculate
		// the minimal Y Lod has to be provided by the caller
		if (maxXDistShownSeparate == 0) { // adapt to LOD mode
			maxXDistShownSeparate = nXLowestDist;
			if (fCalcYLod != undefined) {
				nYLOD = Math.floor(fCalcYLod(minY, maxY));
			}
		}

		var shownDistance = leftFromMaxDist - ele[ixL] + 360 * (leftFromMaxDist < ele[ixL]);
		var bSecondApproachIsEqualInLOD = false;
		if (minXLod != undefined) {
			var nXBestLOD = Math.floor(nIntLodAboveXMin + Math.log(nXLowestDist / (360 - maxDistance)) / Math.LN2);
			if ((shownDistance > maxXDistShownSeparate) || Math.min(nXBestLOD, nYLOD) <= minXLod + maxDelta) {
				return [
					wb, wb + 360, minY, maxY, false
				];
			}
			if (nXLowestDist && (maxDistance2 >= 0)) { // Check whether 2nd Approach is equally good in LOD quality
				var nXLOD2 = Math.floor(nIntLodAboveXMin + Math.log(nXLowestDist / (360 - maxDistance2)) / Math.LN2);
				bSecondApproachIsEqualInLOD = ((nXBestLOD == nXLOD2) || (nXBestLOD <= nXLOD2));
			}
			if (bSecondApproachIsEqualInLOD) {
				ele = boxList[indexMaxDistance2];
				leftFromMaxDist = leftFromMaxDist2 - 360 * Math.floor((leftFromMaxDist2 + 180) / 360);
			}
		}
		return [
			ele[ixL], leftFromMaxDist, minY, maxY
		];
	};

	return mathlib;
})();

});
