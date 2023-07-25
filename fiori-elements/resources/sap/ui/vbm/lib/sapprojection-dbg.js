/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// this module deals with the projections
// Author: Jürgen Gatter

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.LinearProjection = function(target) {
	var projection = {};
	projection.vbiclass = "Projection/Linear";
	projection.m_nXYRatio = 2;
	projection.m_nXMin = -2;
	projection.m_nXMax = 2;
	projection.m_nGeometrySize = 4;

	projection.m_nUCSMin = -0.5;
	projection.m_nUCSMax = 1.5;
	projection.m_bIsIsogonal = true;

	projection.LonLatToUCS = function(lonlat, uxy) {
		var xSize = uxy[0];
		var ySize = uxy[1];
		uxy[0] = xSize * (0.5 + lonlat[0] / Math.PI);
		uxy[1] = ySize * (0.5 - lonlat[1] / Math.PI);
		return uxy;
	};

	projection.UCSToLonLat = function(uxy, lonlat) {
		lonlat[0] = Math.PI * (projection.m_nUCSMin + uxy[0] / 2);
		lonlat[1] = -Math.PI * (uxy[1] / 2);
		return lonlat;
	};

	return projection;
};

VBI.MercatorProjection = function(target) {
	var projection = {};
	projection.vbiclass = "Projection/Mercator";
	projection.m_nXYRatio = 1;
	projection.m_nXMin = -1;
	projection.m_nXMax = 1;
	projection.m_nGeometrySize = 2;

	projection.m_nUCSMin = 0;
	projection.m_nUCSMax = 1;
	projection.m_bIsIsogonal = true;

	projection.LonLatToUCS = VBI.MathLib.LonLatToUCS;
	projection.UCSToLonLat = VBI.MathLib.UCSToLonLat;

	return projection;

};

VBI.ElliMercatorProjection = function(target) {
	var projection = {};
	projection.vbiclass = "Projection/EllipticalMercator";
	projection.m_nXYRatio = 1;
	projection.m_nXMin = -1;
	projection.m_nXMax = 1;
	projection.m_nGeometrySize = 2;

	projection.m_nUCSMin = 0;
	projection.m_nUCSMax = 1;
	projection.m_bIsIsogonal = true;

	projection.m_rmajor = 6378137;
	projection.m_rminor = 6356752.3142;
	var ratio = projection.m_rminor / projection.m_rmajor;
	projection.m_eccent = Math.sqrt(1.0 - (ratio * ratio));
	projection.m_halfEccent = 0.5 * projection.m_eccent;
	projection.m_PI_Div_180 = Math.PI / 180.0;
	projection.m_PI_Div_2 = Math.PI / 2;
	projection.m_PI_Div_4 = Math.PI / 4;
	projection.m_majMultPIDiv180 = projection.m_PI_Div_180 * projection.m_rmajor;
	projection.m_tolerance = 0.0000000001;
	projection.m_EllipticalBorder = 89.5 * projection.m_PI_Div_180;
	projection.m_PIx2 = 2.0 * Math.PI;
	projection.m_yMax = 2.0 * Math.PI * projection.m_rmajor;

	projection.LonLatToUCS = function(lonlat, uxy) {
		var lon = lonlat[0], lat = Math.max(Math.min(lonlat[1], projection.m_EllipticalBorder), -projection.m_EllipticalBorder);
		var temp = projection.m_eccent * Math.sin(lat);
		temp = Math.pow((1 - temp) / (1 + temp), projection.m_halfEccent);
		var x = 0.5 + lon / projection.m_PIx2; // as we norm to [0..1] the multiplication with rmajor is not required
		var y = 0.5 + Math.log(Math.tan(projection.m_PI_Div_4 - lat / 2) / temp) / projection.m_PIx2;

		uxy[0] = uxy[0] * x;
		uxy[1] = uxy[1] * y;

		return uxy;
	};

	projection.UCSToLonLat = function(uxy, lonlat) {
		lonlat[0] = Math.PI * uxy[0];
		lonlat[1] = this.CalcPhi(Math.exp(Math.PI * uxy[1]));
		return lonlat;
	};

	projection.CalcPhi = function(ts) {
		var j = 15, delta, con, phi = projection.m_PI_Div_2 - 2.0 * Math.atan(ts);
		do {
			con = projection.m_eccent * Math.sin(phi);
			delta = projection.m_PI_Div_2 - 2.0 * Math.atan(ts * Math.pow((1.0 - con) / (1.0 + con), projection.m_halfEccent)) - phi;
			phi += delta;
		} while (Math.abs(delta) > projection.m_tolerance && --j);
		return phi;
	};

	return projection;

};

});
