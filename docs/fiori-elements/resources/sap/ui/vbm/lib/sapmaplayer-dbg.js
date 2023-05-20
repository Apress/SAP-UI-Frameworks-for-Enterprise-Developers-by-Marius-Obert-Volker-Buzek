/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// maplayer objects
// Author: Ulrich Roegelein
// mapprovider prototype functions
// VBI.prototype = { this.prototype = { Add: function (source) { this.SourceArray.push( source ); }, }, }
// VBI.mapproviders = { this.prototype = { Add: function (mapprovider) { this.MapProviderArray.push( mapprovider ); }, }, }
// MapLayerStack namespace
// enables: new VBI.MapLayerStackManager(...)

sap.ui.define(["./sapvbi"]
, function() {
	"use strict";

VBI.MapLayerStackManager = function() {
	/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
	var maplayerstackmanager = {};
	maplayerstackmanager.vbiclass = "MapLayerStackManager";
	maplayerstackmanager.m_MapLayerStackArray = [];

	maplayerstackmanager.clear = function() {
		// clear the sources...................................................//
		for (var nJ = 0; nJ < maplayerstackmanager.m_MapLayerStackArray.length; ++nJ) {
			maplayerstackmanager.m_MapLayerStackArray[nJ].clear();
		}

		// clear the array.....................................................//
		maplayerstackmanager.m_MapLayerStackArray = [];
	};

	// load from json
	maplayerstackmanager.load = function(dat, ctx) {
		if (dat.Set) {
			// todo: refine delta handling
			maplayerstackmanager.clear();

			var mls;
			if (jQuery.type(dat.Set.MapLayerStack) == 'object') {
				mls = new VBI.MapLayerStack();
				mls.load(dat.Set.MapLayerStack, ctx);
				maplayerstackmanager.Add(mls);
			} else if (jQuery.type(dat.Set.MapLayerStack) == 'array') {
				for (var nJ = 0; nJ < dat.Set.MapLayerStack.length; ++nJ) {
					mls = new VBI.MapLayerStack();
					mls.load(dat.Set.MapLayerStack[nJ], ctx);
					maplayerstackmanager.Add(mls);
				}
			}
		}
	};

	// functions..............................................................//
	maplayerstackmanager.Add = function(maplayerstack) {
		this.m_MapLayerStackArray.push(maplayerstack);
	};

	maplayerstackmanager.GetMapLayerStack = function(name) {
		for (var i = 0; i < this.m_MapLayerStackArray.length; ++i) {
			if (this.m_MapLayerStackArray[i].m_Name == name) {
				return this.m_MapLayerStackArray[i];
			}
		}
		return null;
	};

	return maplayerstackmanager;
};

// ...........................................................................//
// MapLayerStack namespace...................................................//
// Description: map layer stacks will keep the switchable stack entities.....//

VBI.MapLayerStacks = VBI.MapLayerStackManager();

// ...........................................................................//
// MapLayerStack namespace...................................................//
// enables: new VBI.MapLayerStack(...)

VBI.MapLayerStack = function(name, description) {
	var maplayerstack = {}; // create the object
	maplayerstack.vbiclass = "MapLayerStack";
	maplayerstack.m_MapLayerArray = [];

	// assign members.........................................................//
	maplayerstack.m_Name = name;
	maplayerstack.m_Description = description;
	maplayerstack.m_nMaxSquare = 0;
	maplayerstack.m_colBkgnd = null;

	maplayerstack.clear = function() {
		// clear the sources...................................................//
		for (var nJ = 0; nJ < maplayerstack.m_MapLayerArray.length; ++nJ) {
			maplayerstack.m_MapLayerArray[nJ].clear();
		}

		// clear the array.....................................................//
		maplayerstack.m_MapLayerArray = [];
	};

	// load from json parsed object
	maplayerstack.load = function(dat, ctx) {
		// todo: check for additional attributes and add them here
		if (dat.name) {
			maplayerstack.m_Name = dat.name;
		}
		if (dat.description) {
			maplayerstack.m_Description = dat.description;
		}
		if (dat.copyright) {
			maplayerstack.m_Copyright = dat.copyright;
		}
		if (dat.copyrightLink) {
			maplayerstack.m_CopyrightLink = dat.copyrightLink;
		}
		if (dat.copyrightImage) {
			maplayerstack.m_CopyrightImage = dat.copyrightImage;
		}
		if (dat.maxSquare) {
			maplayerstack.m_nMaxSquare = dat.maxSquare;
		}
		if (dat.previewPosition) {
			maplayerstack.m_PreviewPosition = dat.previewPosition;
		}
		if (dat.colBkgnd) {
			maplayerstack.m_colBkgnd = dat.colBkgnd;
		}
		maplayerstack.m_bSingleBMP = (dat.singleBMP && dat.singleBMP == "true");

		var ml;
		if (dat.MapLayer) {
			if (jQuery.type(dat.MapLayer) == 'object') {
				ml = new VBI.MapLayer();
				ml.load(dat.MapLayer, ctx);
				maplayerstack.Add(ml);
			} else if (jQuery.type(dat.MapLayer) == 'array') {
				for (var nJ = 0; nJ < dat.MapLayer.length; ++nJ) {
					ml = new VBI.MapLayer();
					ml.load(dat.MapLayer[nJ], ctx);
					maplayerstack.Add(ml);
				}
			}
		}
	};

	// functions..............................................................//
	maplayerstack.Add = function(maplayer) {
		this.m_MapLayerArray.push(maplayer);
	};

	// determine maximum LOD of layer.........................................//
	maplayerstack.GetMaxLOD = function() {
		var nLOD, maxLOD = 0;
		var mla = this.m_MapLayerArray;
		for (var i = 0; i < mla.length; ++i) {
			nLOD = parseInt(mla[i].GetMaxLOD(),10);
			if (nLOD > maxLOD) {
				maxLOD = nLOD;
			}
		}
		return maxLOD;
	};

	// determine minimum LOD of layer.........................................//
	maplayerstack.GetMinLOD = function() {
		var nLOD, minLOD = Number.MAX_VALUE;
		var mla = this.m_MapLayerArray;
		for (var i = 0; i < mla.length; ++i) {
			nLOD = mla[i].GetMinLOD();
			if (nLOD < minLOD) {
				minLOD = nLOD;
			}
		}
		return minLOD;
	};

	maplayerstack.GetCopyright = function() {
		if (this.m_Copyright) {
			return VBI.Utilities.AssembleCopyrightString(this.m_Copyright, this.m_CopyrightLink, this.m_CopyrightImage);
		}
		var sCopyright = null;

		for (var nJ = 0; nJ < this.m_MapLayerArray.length; nJ++) {
			var mapProvider = this.m_MapLayerArray[nJ].GetMapProvider();
			if (!sCopyright) {
				sCopyright = mapProvider.GetCopyright();
			} else {
				sCopyright = sCopyright + ", " + mapProvider.GetCopyright();
			}
		}
		return sCopyright;
	};

	return maplayerstack;
};

VBI.MapLayer = function() {
	var maplayer = {}; // create the object
	maplayer.vbiclass = "MapLayer";
	maplayer.m_Name = null;
	maplayer.m_refMapProvider = null;
	maplayer.m_fOpacity = 1.0;

	maplayer.clear = function() {
		// clear the references................................................//
		maplayer.m_refMapProvider = null;
	};

	// load from json parsed object...........................................//
	maplayer.load = function(dat, ctx) {
		// todo: check for additional attributes and add them here
		if (dat.name) {
			maplayer.m_Name = dat.name;
		}
		if (dat.opacity) {
			maplayer.m_fOpacity = dat.opacity;
		}

		// determine the map provider..........................................//
		if (dat.refMapProvider) {
			if (ctx.m_MapProviders) {
				maplayer.m_refMapProvider = ctx.m_MapProviders.GetMapProviderByName(dat.refMapProvider);
			}
		}

		if (!maplayer.m_refMapProvider) {
			jQuery.sap.log.error("MapLayer: no valid mapprovider specified");
		}
	};

	maplayer.GetMinLOD = function() {
		// get the min lod of the referenced map provider
		if (maplayer.m_refMapProvider) {
			return maplayer.m_refMapProvider.GetMinLOD();
		}
	};

	maplayer.GetMaxLOD = function() {
		// get the min lod of the referenced map provider
		if (maplayer.m_refMapProvider) {
			return maplayer.m_refMapProvider.GetMaxLOD();
		}
	};

	maplayer.GetMapProvider = function() {
		// get the referenced to the map provider
		if (maplayer.m_refMapProvider) {
			return maplayer.m_refMapProvider;
		}

		return null;
	};

	return maplayer;
};

});
