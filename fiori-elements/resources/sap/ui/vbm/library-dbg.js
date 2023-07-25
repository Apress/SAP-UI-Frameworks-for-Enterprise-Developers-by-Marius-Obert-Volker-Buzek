/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.vbm.
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/unified/library"
], function() {
	"use strict";

	/**
	 * SAP UI library: sap.ui.vbm
	 *
	 * @namespace
	 * @alias sap.ui.vbm
	 * @author SAP SE
	 * @version 1.113.0
	 * @public
	 */

	// library dependencies
	// delegate further initialization of this library to the Core
	var vbmLibrary = sap.ui.getCore().initLibrary({
		name: "sap.ui.vbm",
		types: [
			"sap.ui.vbm.ClusterInfoType", "sap.ui.vbm.SemanticType"
		],
		controls: [
			"sap.ui.vbm.AnalyticMap", "sap.ui.vbm.GeoMap", "sap.ui.vbm.VBI", "sap.ui.vbm.Cluster", "sap.ui.vbm.Viewport"
		],
		elements: [
			"sap.ui.vbm.Area", "sap.ui.vbm.Areas", "sap.ui.vbm.Box", "sap.ui.vbm.Boxes", "sap.ui.vbm.Circle", "sap.ui.vbm.Circles",
			"sap.ui.vbm.Container", "sap.ui.vbm.Containers", "sap.ui.vbm.DragSource", "sap.ui.vbm.DropTarget", "sap.ui.vbm.Feature",
			"sap.ui.vbm.FeatureCollection", "sap.ui.vbm.GeoJsonLayer", "sap.ui.vbm.GeoCircle", "sap.ui.vbm.GeoCircles", "sap.ui.vbm.Legend",
			"sap.ui.vbm.LegendItem", "sap.ui.vbm.Pie", "sap.ui.vbm.PieItem", "sap.ui.vbm.Pies", "sap.ui.vbm.Region", "sap.ui.vbm.Resource",
			"sap.ui.vbm.Route", "sap.ui.vbm.Routes", "sap.ui.vbm.Spot", "sap.ui.vbm.Spots", "sap.ui.vbm.VoAggregation", "sap.ui.vbm.VoBase",
			"sap.ui.vbm.ClusterBase", "sap.ui.vbm.ClusterTree", "sap.ui.vbm.ClusterGrid", "sap.ui.vbm.ClusterDistance", "sap.ui.vbm.Heatmap",
			"sap.ui.vbm.HeatPoint", "sap.ui.vbm.ClusterContainer", "sap.ui.vbm.Adapter", "sap.ui.vbm.Adapter3D"
		],
		version: "1.113.0"
	});

	sap.ui.loader.config({
		shim: {
			"sap/ui/vbm/adapter3d/thirdparty/three": {
				exports: "THREE",
				amd: true
			},
			"sap/ui/vbm/adapter3d/thirdparty/ColladaLoader": {
				exports: "THREE.ColladaLoader",
				deps: ["sap/ui/vbm/adapter3d/thirdparty/three"]
			},
			"sap/ui/vbm/adapter3d/thirdparty/OrbitControls": {
				exports: "THREE.OrbitControls",
				deps: ["sap/ui/vbm/adapter3d/thirdparty/three"]
			},
			"sap/ui/vbm/adapter3d/thirdparty/DecalGeometry": {
				exports: "DecalGeometry",
				deps: ["sap/ui/vbm/adapter3d/thirdparty/three"]
			},
			"sap/ui/vbm/adapter3d/thirdparty/html2canvas": {
				exports: "html2canvas",
				amd: true
			}
		}
	});

	/**
	 * Semantic type with pre-defined display properties, like colors, icon, pin image, and so on. Semantic types enforce to fiori guidelines.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	 vbmLibrary.SemanticType = {

		/**
		 * Type indicating no state
		 *
		 * @public
		 */
		None: "None",

		/**
		 * Type indicating an Error state
		 *
		 * @public
		 */
		Error: "Error",

		/**
		 * Type indicating a Warning state
		 *
		 * @public
		 */
		Warning: "Warning",

		/**
		 * Type indicating a Success/Positive state
		 *
		 * @public
		 */
		Success: "Success",

		/**
		 * Type indicating the Default state
		 *
		 * @public
		 */
		Default: "Default",

		/**
		 * Type indicating an Inactive state
		 *
		 * @public
		 */
		Inactive: "Inactive",

		/**
		 * Type indicating a Hidden state
		 *
		 * @public
		 */
		Hidden: "Hidden"

	};

	/**
	 * Cluster Info Type
	 *
	 * @enum {int}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	 vbmLibrary.ClusterInfoType = {

		/**
		 * Type indicating that Cluster Info should return only VOs covered by the Cluster object
		 *
		 * @public
		 */
		ContainedVOs: 0,

		/**
		 * Type indicating that Cluster Info should return info on child cluster nodes (next LOD). This is only supported for tree clustering.
		 *
		 * @public
		 */
		ChildCluster: 1,

		/**
		 * Type indicating that Cluster Info should return info on parent cluster node (previous LOD). This is only supported for tree clustering.
		 *
		 * @public
		 */
		ParentNode: 2,

		/**
		 * Type indicating that Cluster Info should return info on cluster node itself.
		 *
		 * @public
		 */
		NodeInfo: 10,

		/**
		 * Type indicating that Cluster Info should return info on Edges of the Voronoi Area for the cluster. This is only supported for tree
		 * clustering. Edges not merged with rectangles.
		 *
		 * @public
		 */
		Edges: 11

	};

	/**
	 * Route type, determining how line between start and endpoint should be drawn.
	 *
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	 vbmLibrary.RouteType = {

		/**
		 * Type indicating a straight connection
		 *
		 * @public
		 */
		Straight: "Straight",

		/**
		 * Type indicating a geodesic connection
		 *
		 * @public
		 */
		Geodesic: "Geodesic"

	};

	vbmLibrary.getResourceBundle = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.vbm.i18n");
	};

	/**
	 * Find the value of the first element in an Array satisfying the predicate.
	 *
	 * @param {object[]} source    The source array.
	 * @param {function} predicate The predicate.
	 * @returns {object|undefined} The first element of the array that matches the predicate.
	 * @private
	 */
	 vbmLibrary.findInArray = function(source, predicate) {
		if (!Array.isArray(source) || typeof predicate !== "function") {
			return undefined;
		}

		for (var i = 0, count = source.length; i < count; i++) {
			var value = source[i];
			if (predicate(value)) {
				return value;
			}
		}

		return undefined;
	};

	/**
	 * Find the index of the first element in an Array satisfying the predicate.
	 *
	 * @param {object[]} source    The source array.
	 * @param {function} predicate The predicate.
	 * @returns {int} The index of the first element of the array for which the predicate returns true, -1 if none.
	 * @private
	 */
	 vbmLibrary.findIndexInArray = function(source, predicate) {
		if (!Array.isArray(source) || typeof predicate !== "function") {
			return -1;
		}

		for (var i = 0, count = source.length; i < count; i++) {
			var value = source[i];
			if (predicate(value)) {
				return i;
			}
		}

		return -1;
	};

	return vbmLibrary;

}, /* bExport= */false);
