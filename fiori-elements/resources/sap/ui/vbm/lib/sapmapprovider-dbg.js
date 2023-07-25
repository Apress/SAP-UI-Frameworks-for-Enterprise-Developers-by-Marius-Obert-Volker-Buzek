/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// mapprovider object
// Author: Ulrich Roegelein

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.MapProviders = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var mapproviders = {};
	mapproviders.vbiclass = "MapProviders";
	mapproviders.m_MapProviderArray = [];

	mapproviders.clear = function() {
		// clear the sources...................................................//
		for (var nJ = 0; nJ < mapproviders.m_MapProviderArray.length; ++nJ) {
			mapproviders.m_MapProviderArray[nJ].clear();
		}

		// clear the array.....................................................//
		mapproviders.m_MapProviderArray = [];
	};

	mapproviders.load = function(dat, ctx) {
		// load the json delta data............................................//
		// future: do more than only set
		if (dat.Set) {
			var mp;

			// future: refine delta loading
			mapproviders.clear();
			// load the mapproviders............................................//
			// future: support specialized sets and removes.......................//
			if (dat.Set.MapProvider) {
				if (jQuery.type(dat.Set.MapProvider) == 'object') {
					mp = new VBI.MapProvider();
					mp.load(dat.Set.MapProvider);
					mapproviders.Add(mp);
				} else if (jQuery.type(dat.Set.MapProvider) == 'array') {
					for (var nJ = 0; nJ < dat.Set.MapProvider.length; ++nJ) {
						mp = new VBI.MapProvider();
						mp.load(dat.Set.MapProvider[nJ]);
						mapproviders.Add(mp);
					}
				}
			}
		}
	};

	// add to map provider to array
	mapproviders.Add = function(mapprovider) {
		this.m_MapProviderArray.push(mapprovider);
	};

	// determine the map provider by name.....................................//
	mapproviders.GetMapProviderByName = function(name) {
		for (var nJ = 0; nJ < mapproviders.m_MapProviderArray.length; ++nJ) {
			if (mapproviders.m_MapProviderArray[nJ].m_Name == name) {
				return mapproviders.m_MapProviderArray[nJ];
			}
		}
		return null;
	};

	return mapproviders;
};

// ...........................................................................//
// MapProvider namespace.....................................................//

VBI.MapProvider = function(name, description, copyright, tileX, tileY, minLOD, maxLOD, fillStyle, resolution, projection, headers) {
	var mapprovider = {};
	mapprovider.vbiclass = "MapProvider";
	mapprovider.m_SourceArray = [];

	// assign members.........................................................//
	mapprovider.m_Name = name;
	mapprovider.m_Description = description;
	mapprovider.m_Copyright = copyright;
	mapprovider.m_tileX = typeof tileX !== 'undefined' ? tileX : 256;
	mapprovider.m_tileY = typeof tileY !== 'undefined' ? tileY : 256;
	mapprovider.m_maxLOD = typeof maxLOD !== 'undefined' ? maxLOD : 19;
	mapprovider.m_minLOD = typeof minLOD !== 'undefined' ? minLOD : 0;
	mapprovider.m_nResolution = typeof resolution != 'undefined' ? resolution : 256;
	mapprovider.m_nProjection = typeof projection != 'undefined' ? projection : 1;
	mapprovider.m_Headers = headers; // Headers can be undefined

	// set optional background style of map provider..........................//
	if (fillStyle != null) {
		mapprovider.fillStyle = fillStyle;
	}

	mapprovider.clear = function() {
		// clear the sources...................................................//
		for (var nJ = 0; nJ < mapprovider.m_SourceArray.length; ++nJ) {
			mapprovider.m_SourceArray[nJ].clear();
		}

		// clear the array..................................................//
		mapprovider.m_SourceArray = [];
	};

	mapprovider.GetCopyright = function() {
		return VBI.Utilities.AssembleCopyrightString(this.m_Copyright, this.m_CopyrightLink, this.m_CopyrightImage);
	};

	mapprovider.addMapBase = function(left, right, top, bottom, round, stdMapBase) {
		var mapBase = {};

		if (left) {
			mapBase.left = parseFloat(left);
		}
		if (right) {
			mapBase.right = parseFloat(right);
		}
		if (top) {
			mapBase.top = parseFloat(top);
		}
		if (bottom) {
			mapBase.bottom = parseFloat(bottom);
		}
		mapBase.round = (round != undefined ? parseFloat(round) : 0);

		mapBase.xSize = right - left;
		mapBase.ySize = top - bottom;

		if (stdMapBase != undefined) {
			mapBase.relXSize = mapBase.xSize / stdMapBase.xSize;
			mapBase.relYSize = mapBase.ySize / stdMapBase.ySize;
		}

		return mapBase;
	};

	mapprovider.addMapBaseBorder = function(mapBase, minX, maxX, minY, maxY) {
		mapBase.leftBorder = minX;
		mapBase.rightBorder = maxX;
		mapBase.bottomBorder = minY;
		mapBase.topBorder = maxY;
	};

	mapprovider.load = function(dat) {
		// load dataprovider attributes........................................//
		// future: add additional attributes
		if (dat.name) {
			mapprovider.m_Name = dat.name;
		}
		if (dat.description) {
			mapprovider.m_Description = dat.description;
		}
		if (dat.copyright) {
			mapprovider.m_Copyright = dat.copyright;
		}
		if (dat.copyrightLink) {
			mapprovider.m_CopyrightLink = dat.copyrightLink;
		}
		if (dat.copyrightImage) {
			mapprovider.m_CopyrightImage = dat.copyrightImage;
		}
		if (dat.tileX) {
			mapprovider.m_tileX = dat.tileX;
		}
		if (dat.tileY) {
			mapprovider.m_tileY = dat.tileY;
		}
		if (dat.maxLOD) {
			mapprovider.m_maxLOD = dat.maxLOD;
		}
		if (dat.minLOD) {
			mapprovider.m_minLOD = dat.minLOD;
		}
		if (dat.resolution) {
			mapprovider.m_nResolution = dat.resolution;
		}
		if (dat.projection) {
			if (dat.projection === "Linear") {
				mapprovider.m_nProjection = 2;
			} else if (dat.projection === "Elliptical") {
				mapprovider.m_nProjection = 3;
			}
		}
		if (dat.Header) {
			[].concat(dat.Header).forEach(function(header) {
				if (header.name) { // name must not be empty, while value can be empty (HTTP headers spec)
					if (!mapprovider.m_Headers) {
						mapprovider.m_Headers = [];
					}
					mapprovider.m_Headers.push(header);
				}
			});
		}

		var mapBase = dat.MapBase;
		mapprovider.m_StdMapBase = mapprovider.addMapBase(-1, 1, 1, -1, 10);
		if (dat.MapBase) {
			mapprovider.m_MapBase = mapprovider.addMapBase(mapBase.left, mapBase.right, mapBase.top, mapBase.bottom, mapBase.round, mapprovider.m_StdMapBase);
			mapprovider.addMapBaseBorder(mapprovider.m_MapBase, mapBase.minX, mapBase.maxX, mapBase.minY, mapBase.maxY);
		} else {
			mapprovider.m_MapBase = mapprovider.addMapBase(-180, 180, 90, -90, 10, mapprovider.m_StdMapBase);
		}

		// the map provider has source urls, get them..........................//
		if (dat.Source) {
			var source;
			if (jQuery.type(dat.Source) == 'object') {
				// load the source when it is an object type
				source = new VBI.Source(null);
				mapprovider.m_bPosRequired = source.load(dat.Source);
				mapprovider.Add(source);
			} else if (jQuery.type(dat.Source) == 'array') {
				// load multiple sources
				mapprovider.m_bPosRequired = false;
				for (var nJ = 0; nJ < dat.Source.length; ++nJ) {
					// load the source when it is an object type
					source = new VBI.Source(null);
					mapprovider.m_bPosRequired = (source.load(dat.Source[nJ]) || mapprovider.m_bPosRequired);
					mapprovider.Add(source);
				}
			}
		}
	};

	// assign functions......................................................//
	mapprovider.Add = function(source) {
		this.m_SourceArray.push(source);
	};
	mapprovider.CombineUrlWPos = function(x, y, lod, fTileSize, lu, rl, xExpansion, yExpansion, xTileSize, yTileSize) {
		// do load balancing for different sources...........................//

		var nMax = 1 << lod;
		// check levels......................................................//
		// if( x < 0 || ( y + yExpansion ) <= 0 || ( x >= nMax ) || ( y >= nYMax ) )
		// return null;
		// VBI.Trace("Org on lod "+lod+" : ["+(lu[0]).toFixed(7)+","+(lu[1]).toFixed(7)+"] - ["+(rl[0]).toFixed(7)+","+(rl[1]).toFixed(7)+"]");
		var nRound = 10;
		if (mapprovider.m_MapBase) {
			var stdBase = mapprovider.m_StdMapBase;
			var mapBase = mapprovider.m_MapBase;
			lu[0] = (lu[0] - stdBase.left) * mapBase.relXSize + mapBase.left;
			lu[1] = -((lu[1] - stdBase.bottom) * mapBase.relYSize + mapBase.bottom);
			rl[0] = (rl[0] - stdBase.left) * mapBase.relXSize + mapBase.left;
			rl[1] = -((rl[1] - stdBase.bottom) * mapBase.relYSize + mapBase.bottom);
			nRound = mapBase.round;
		}
		// check and determine size..........................................//
		if (this.m_SourceArray.length == 0) {
			return null;
		}

		// do load balancing on server, assuring cache consistency...........//
		return this.m_SourceArray[((y + x * nMax) % this.m_SourceArray.length)].CombineUrlWPos(x, y, lod, fTileSize, lu, rl, xExpansion, yExpansion, nRound, Math.min(xTileSize, mapprovider.m_nResolution), Math.min(yTileSize, mapprovider.m_nResolution));
	};

	mapprovider.CombineUrl = function(x, y, lod) {
		// do load balancing for different sources...........................//

		var nMax = 1 << lod;

		// check levels......................................................//
		if (x < 0 || y < 0 || (x >= nMax) || (y >= nMax)) {
			return null;
		}

		// check and determine size..........................................//
		if (this.m_SourceArray.length == 0) {
			return null;
		}

		// do load balancing on server, assuring cache consistency...........//
		return this.m_SourceArray[((y + x * nMax) % this.m_SourceArray.length)].CombineUrl(x, y, lod);
	};

	mapprovider.GetMaxLOD = function() {
		return this.m_maxLOD;
	};

	mapprovider.GetMinLOD = function() {
		return this.m_minLOD;
	};

	return mapprovider;
};

// ...........................................................................//
// Source namespace..........................................................//

VBI.Source = function(url) {
	var source = {};
	source.vbiclass = "Source";
	source.m_ID = null;
	source.m_Url = url;
	source.m_Callback = undefined; // Callback must be of type Function

	source.clear = function() {
	};

	source.load = function(dat) {
		if (dat.url) {
			source.m_Url = dat.url;
		}
		if (dat.id) {
			source.m_ID = dat.id;
		}

		if (dat.callback && dat.callback instanceof Function) {
			source.m_Callback = dat.callback;
		}

		source.m_bQuadkey = (source.m_Url.indexOf("{QUAD}") >= 0);
		source.m_bNumkey = (source.m_Url.indexOf("{NUMT}") >= 0);
		return ((source.m_Url.indexOf("LU_LAT") >= 0) || (source.m_Url.indexOf("LU_LONG") >= 0) || (source.m_Url.indexOf("RL_LAT") >= 0) || (source.m_Url.indexOf("RL_LONG") >= 0));
	};

	// assign functions......................................................//
	source.CombineUrl = function(x, y, lod) {
		var temp = source.m_Url;
		var quad, numt;

		if (source.m_bQuadkey) {
			quad = this.TileXYToQuadKey(x, y, lod);
			temp = temp.replace("{QUAD}", quad);
		}

		if (source.m_bNumkey) {
			numt = this.TileXYToNumKey(x, y, lod);
			temp = temp.replace("{NUMT}", numt);
		}

		if (source.m_Callback) {
			var callbackResult = source.m_Callback(source.m_Url, x, y, lod, quad, (1 << lod) - y - 1, numt);
			if (typeof callbackResult === "string" || callbackResult instanceof String) {
				return callbackResult;
			} else {
				jQuery.sap.log.error("The function referenced in the Map Provider source parameter 'callback' did not return a string. Fallback to url.");
			}
		}

		// replace our placeholders..........................................//
		temp = temp.replace("{X}", x);
		temp = temp.replace("{Y}", y);
		temp = temp.replace("{-Y}", (1 << lod) - y - 1);
		temp = temp.replace("{LOD}", lod);

		return temp;
	};

	source.CombineUrlWPos = function(x, y, lod, fTileSize, lu, rl, xExpansion, yExpansion, nRound, xTileSize, yTileSize) {
		var temp = source.m_Url;
		var nDec = Math.pow(10, nRound);
		var quad, numt;
		var lu_long = Math.round(lu[0] * nDec) / nDec;
		var lu_lat = Math.round(lu[1] * nDec) / nDec;
		var rl_long = Math.round(rl[0] * nDec) / nDec;
		var rl_lat = Math.round(rl[1] * nDec) / nDec;

		if (source.m_bQuadkey) {
			quad = this.TileXYToQuadKey(x, y, lod);
			temp = temp.replace("{QUAD}", quad);
		}

		if (source.m_bNumkey) {
			numt = this.TileXYToNumKey(x, y, lod);
			temp = temp.replace("{NUMT}", numt);
		}

		if (source.m_Callback) {
			var callbackResult = source.m_Callback(source.m_Url,
				x,
				y,
				lod,
				xTileSize * xExpansion,
				yTileSize * yExpansion,
				quad,
				(1 << lod) - y - 1,
				numt,
				lu_long,
				lu_lat,
				rl_long,
				rl_lat);
			if (typeof callbackResult === "string" || callbackResult instanceof String) {
				return callbackResult;
			} else {
				jQuery.sap.log.error("The function referenced in the Map Provider source parameter 'callback' did not return a string. Fallback to url.");
			}
		}


		// replace our placeholders..........................................//
		temp = temp.replace("{X}", x);
		temp = temp.replace("{Y}", y);
		temp = temp.replace("{-Y}", (1 << lod) - y - 1);
		temp = temp.replace("{LOD}", lod);
		temp = temp.replace("{WIDTH}", xTileSize * xExpansion);
		temp = temp.replace("{HEIGHT}", yTileSize * yExpansion);
		temp = temp.replace("{LU_LONG}", lu_long);
		temp = temp.replace("{LU_LAT}", lu_lat);
		temp = temp.replace("{RL_LONG}", rl_long);
		temp = temp.replace("{RL_LAT}", rl_lat);

		return temp;
	};
	// .......................................................................//
	// get a quad key for the specified tile.................................//

	source.TileXYToQuadKey = function(x, y, lod) {
		var quadDigits = [];
		for (var i = lod; i > 0; --i) {
			var digit = '0';
			var mask = 1 << (i - 1);
			if (x & mask) {
				digit++;
			}

			if (y & mask) {
				digit++;
				digit++;
			}

			quadDigits.push(digit);
		}
		var quadKey = quadDigits.join("");
		return quadKey;
	};

	// .......................................................................//
	// get a numeric key for the specified tile..............................//

	source.TileXYToNumKey = function(x, y, lod) {
		// sum up tiles of prior lod's
		var numKey = 0;
		for (var i = 1; i < lod; ++i) {
			numKey += (1 << i) * (1 << i);
		}

		// add current LOD tiles
		numKey += (y * (1 << lod) + x + 1); // TileX 0 counts!
		return numKey;
	};

	return source;
};

});
