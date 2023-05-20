/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.GeoJsonLayer.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/theming/Parameters",
	"sap/ui/unified/Menu",
	"jquery.sap.global",
	"sap/base/Log",
	"./library"
], function(Element, Parameters, Menu, jQuery, Log, library) {
	"use strict";

	var thisModule = "sap.ui.vbm.GeoJsonLayer";

	/**
	 * Constructor for a new GeoJsonLayer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class GeoJsonLayer aggregation container. A GeoJsonLayer can render the content of an assigned GeoJSON. The naming is associated to the
	 *        GeoJSON standard. All features found in the GeoJSON are rendered as separated objects. From the possible feature types only
	 *        <ul>
	 *        <li>Polygon and Multipolygon,
	 *        <li>LineString, and
	 *        <li>Point
	 *        </ul>
	 *        are supported so far. The feature type support will be extended in the upcoming releases.<br>
	 *        All features from the GeoJSON will be rendered with the given default colors and are inactive. They do not react on mouse over, except
	 *        with tooltip, or raise any events on click or right click.<br>
	 *        By adding <i>Feature elements</i> to the items aggregation you can make the match (by id) feature from the GeoJSON interactive and give
	 *        it alternative colors. <br>
	 *        The GeoJSON can be given as a URL using property <i>srcURL</i>, directly as object using property <i>data</i>, or as a combination of
	 *        both.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.GeoJsonLayer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GeoJsonLayer = Element.extend("sap.ui.vbm.GeoJsonLayer", /** @lends sap.ui.vbm.GeoJsonLayer.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Source URL for GeoJSON
				 */
				srcURL: {
					type: "string",
					defaultValue: null
				},

				/**
				 * GeoJSON object according to the {@link http://geojson.org/geojson-spec.html#geojson-objects|specification} or array of such objects
				 */
				data: {
					type: "object",
					defaultValue: null
				},

				/**
				 * Default line width for LineStrings
				 */
				defaultLineWidth: {
					type: "int",
					group: "Appearance",
					defaultValue: 5
				},

				/**
				 * Default Fill color for GeoJSON features (Polygons and LineStrings)
				 */
				defaultFillColor: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(186, 193, 196, 0.5)"
				},

				/**
				 * Default border color for GeoJSON features, if applicable (Polygons and LineStrings)
				 */
				defaultBorderColor: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(255, 255, 255, 1.0)"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Feature object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Feature",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on an aggregated Feature. Clicks on other Features from the GeoJSON are ignored.
				 */
				click: {
					parameters: {
						/**
						 * Id of clicked Feature
						 */
						featureId: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised when there is a right click or a tap and hold action on an aggregated Feature. Clicks on other Features from
				 * the GeoJSON are ignored.
				 */
				contextMenu: {
					parameters: {
						/**
						 * Id of clicked Feature
						 */
						featureId: {
							type: "string"
						}
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	GeoJsonLayer.prototype.init = function() {
		this.mbGeoJSONDirty = true;
		this.mbSrcLoadPending = false;
		this._aGeoJsonObjects = [];
	};

	GeoJsonLayer.prototype.setSrcURL = function(sSrcURL) {
		this.mbGeoJSONDirty = true;
		return this.setProperty("srcURL", sSrcURL);
	};

	GeoJsonLayer.prototype.setData = function(aData) {
		this.mbGeoJSONDirty = true;
		this._aGeoJsonObjects = aData;
		return this.setProperty("data", aData);
	};

	/**
	 * Add GeoJSON object to the layer
	 *
	 * @param {object} aData GeoJSON object or an array of those
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoJsonLayer.prototype.addData = function(aData) {
		this.mbGeoJSONDirty = true;
		// append data to internal feature collection
		if (jQuery.type(aData) === "array") {
			this._aGeoJsonObjects = this._aGeoJsonObjects.concat(aData);
		} else {
			this._aGeoJsonObjects.push(aData);
		}
		this.setProperty("data", this._aGeoJsonObjects);
		this.getParent().invalidate(this); // trigger re-rendering
	};

	/*
	 * @private
	 */
	GeoJsonLayer.prototype._createFeatures = function(oData) {
		// set some default colors
		var defaultColorFill = this.getDefaultFillColor();
		var defaultColorBorder = this.getDefaultBorderColor();

		var aGeoJsonObjects = this._aGeoJsonObjects;
		if (oData) {
			aGeoJsonObjects.push(oData);
		}

		// load the data with the default settings................................//
		this.mFeatureColl = [];
		this.mFeatureBBox = {}; // map of feature boundingbox
		this.mNames = {}; // map of names
		this.mFeatureProps = {}; // map of properties

		// process given GeoJSON objects
		for (var nI = 0; nI < aGeoJsonObjects.length; ++nI) {
			// a GeoJSON object must have a property type with one of the values below
			var oEntry = aGeoJsonObjects[nI];
			switch (oEntry.type) {
				case "FeatureCollection":
					for (var nJ = 0, oFeature; nJ < oEntry.features.length; ++nJ) {
						oFeature = oEntry.features[nJ];
						this._processType(oFeature.id, oFeature.geometry.type, oFeature.geometry.coordinates, oFeature.properties, defaultColorFill, defaultColorBorder);
					}
					break;
				case "Feature":
					this._processType(oEntry.id, oEntry.geometry.type, oEntry.geometry.coordinates, oEntry.properties, defaultColorFill, defaultColorBorder);
					break;
				case "GeometryCollection":
					for (var nK = 0, oGeometry; nK < oEntry.geometries.length; ++nK) {
						oGeometry = oEntry.geometries[nK];
						this._processType(null, oGeometry.type, oGeometry.coordinates, null, defaultColorFill, defaultColorBorder);
					}
					break;
				case "Polygon":
				case "MultiPolygon":
				case "LineString":
				case "MultiLineString":
				case "Point":
				case "MultiPoint":
					this._processType(null, oEntry.type, oEntry.coordinates, null, defaultColorFill, defaultColorBorder);
					break;
				default:
					Log.error("Unsupported GeoJSON object type", aGeoJsonObjects[nI].type, thisModule);
					continue;
			}
		}
		this.mbGeoJSONDirty = false;
	};

	GeoJsonLayer.prototype._processType = function(sId, sType, coordinates, aProperties, fillColor, borderColor) {
		var x, y, minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE, minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;

		var tooltip = '', tmp;
		var aCoordsVB; // array of point coordinates in VB format "lon,lat,0"
		var aCoordsGJ; // array of coordinates in GeoJSON format [lon,lat]
		var nI, nK;
		var aPolygons = [];
		var aPolygoneParts = []; // multi polygon array
		var aBoundingBoxes = []; // array of bounding boxes for multi parts

		// get the name of the fragment........................................//
		tooltip = (aProperties && aProperties.name) ? aProperties.name : "";
		this.mFeatureProps[sId] = aProperties;

		switch (sType) {
			case "Polygon":
				for (nI = 0; nI < coordinates.length; ++nI) {
					aCoordsGJ = coordinates[nI];

					// create the vbi float array for regions
					aCoordsVB = [];
					for (nK = 0; nK < aCoordsGJ.length; ++nK) {
						tmp = aCoordsGJ[nK];
						if (!nI) {
							// do min max detection -> only on null'th, since holes will not contribute //
							if ((x = tmp[0]) < minX) {
								minX = x;
							}
							if (x > maxX) {
								maxX = x;
							}
							if ((y = tmp[1]) < minY) {
								minY = y;
							}
							if (y > maxY) {
								maxY = y;
							}
						}
						aCoordsVB.push(tmp[0], tmp[1], "0");
					}
					aPolygoneParts.push(aCoordsVB);
				}
				aPolygons.push(aPolygoneParts);
				aBoundingBoxes.push([
					minX, maxX, minY, maxY
				]);
				break;
			case "MultiPolygon":
				for (var nL = 0, coordlen, acmlen = coordinates.length; nL < acmlen; ++nL) {
					aPolygoneParts = [];
					coordlen = coordinates[nL].length;
					for (nI = 0; nI < coordlen; ++nI) {
						aCoordsGJ = coordinates[nL][nI];

						// create the vbi float array for regions.....................//
						aCoordsVB = [];
						for (nK = 0; nK < aCoordsGJ.length; ++nK) {
							tmp = aCoordsGJ[nK];
							if (!nI) {
								// do min max detection -> only on null'th, since holes will not contribute //
								if ((x = tmp[0]) < minX) {
									minX = x;
								}
								if (x > maxX) {
									maxX = x;
								}
								if ((y = tmp[1]) < minY) {
									minY = y;
								}
								if (y > maxY) {
									maxY = y;
								}
							}
							aCoordsVB.push(tmp[0], tmp[1], "0");
						}
						aPolygoneParts.push(aCoordsVB);
					}
					aPolygons.push(aPolygoneParts);
					aBoundingBoxes.push([
						minX, maxX, minY, maxY
					]);
				}
				break;
			case "LineString":
				aCoordsVB = [];
				for (nI = 0; nI < coordinates.length; ++nI) {
					tmp = coordinates[nI];

					// create the vbi float array for routes
					// do min max detection -> only on null'th, since holes will not contribute //
					if ((x = tmp[0]) < minX) {
						minX = x;
					}
					if (x > maxX) {
						maxX = x;
					}
					if ((y = tmp[1]) < minY) {
						minY = y;
					}
					if (y > maxY) {
						maxY = y;
					}
					aCoordsVB.push(tmp[0], tmp[1], 0);
				}
				aPolygoneParts.push(aCoordsVB);
				aPolygons.push(aPolygoneParts);
				aBoundingBoxes.push([
					minX, maxX, minY, maxY
				]);
				break;
			case "Point":
				minY = maxY = coordinates[1];
				minX = maxX = coordinates[0];

				aCoordsVB = [
					coordinates[0], coordinates[1], 0
				];
				aPolygoneParts.push(aCoordsVB);
				aPolygons.push(aPolygoneParts);
				aBoundingBoxes.push([
					minX, maxX, minY, maxY
				]);
				break;
			default:
				Log.error("Unsupported geometry type", sType, thisModule);
				return;
		}
		this.mFeatureColl.push(this._createDataElement(sId, aPolygons, sType, fillColor, borderColor, tooltip, sId));

		// get surrounding box for all parts -> this needs to consider round world for optimized bounding box size!
		this.mFeatureBBox[sId] = window.VBI.MathLib.GetSurroundingBox(aBoundingBoxes);
	};

	/*
	 * @private
	 */
	GeoJsonLayer.prototype._createDataElement = function(id, array, type, color, colorBorder, tooltip, entity) {
		var element = {
			K: id,
			P: [],
			TT: tooltip,
			C: color,
			CB: colorBorder,
			type: type
		};
		element["VB:s"] = false;
		var nK, nJ, nI;
		var str, coords, clen, blen, alen;

		switch (type) {
			case "Polygon":
			case "MultiPolygon":

				var area, areaParts;
				alen = array.length;
				for (nI = 0; nI < alen; ++nI) {
					area = array[nI];
					areaParts = [];
					blen = area.length;
					for (nJ = 0; nJ < blen; ++nJ) {
						str = "";
						clen = area[nJ].length;
						for (nK = 0; nK < clen; ++nK) {
							if (nK) {
								(str += ";");
							}
							str += area[nJ][nK];
						}
						areaParts.push(str);
					}
					element.P.push(areaParts);
				}
				break;
			case "LineString":

				str = "";
				coords = array[0][0];
				clen = coords.length;
				for (nK = 0; nK < clen; ++nK) {
					if (nK) {
						(str += ";");
					}
					str += coords[nK];
				}
				element.P = str;
				break;
			case "Point":

				str = "";
				coords = array[0][0];
				clen = coords.length;
				for (nK = 0; nK < clen; ++nK) {
					if (nK) {
						(str += ";");
					}
					str += coords[nK];
				}
				element.P = str;
				break;
		}
		return element;
	};

	GeoJsonLayer.prototype._triggerFeatureCreation = function() {
		var sPathGeoJSON = null;
		// check whether we have to load from URL or not
		if ((sPathGeoJSON = this.getSrcURL())) {
			if (!this.mbSrcLoadPending) {
				this.mbSrcLoadPending = true;
				jQuery.getJSON(sPathGeoJSON, function(oData) {
					this._createFeatures(oData);
					this.mbSrcLoadPending = false;
					var oParent;
					if ((oParent = this.getParent())) {
						oParent.invalidate(); // trigger re-rendering
					}
				}.bind(this)).fail(function() {
					Log.error("The path or the GeoJSON file is invalid", sPathGeoJSON, thisModule);
				});
			}
		} else {
			// no src URL given -> proceed without loading something
			this._createFeatures(null);
		}
	};

	// ...........................................................................//
	// model creators............................................................//

	GeoJsonLayer.prototype.getTemplateObjects = function() {
		var oTemp, aResult = [];

		// Polygones
		oTemp = {
			id: this.getId() + "_Polys",
			type: "{00100000-2012-0004-B001-F311DE491C77}", // Area
			hotDeltaColor: "RHLSA(0;1;1;1.5)", // increase opacity by 50%
			altBorderDeltaColor: (Parameters) ? Parameters.get("_sap_ui_vbm_shared_ChartDataPointBorderHoverSelectedColor") : "#666"
		};
		// the data source name is equivalent to the controls id..................//
		oTemp.datasource = oTemp.id;

		oTemp['posarraymulti.bind'] = oTemp.id + ".P"; // P is the position array
		oTemp['color.bind'] = oTemp.id + ".C"; // C the color
		oTemp['colorBorder.bind'] = oTemp.id + ".CB"; // CB the border color
		oTemp['tooltip.bind'] = oTemp.id + ".TT"; // TT the tooltip
		aResult.push(oTemp);

		// Lines
		oTemp = {
			id: this.getId() + "_Lines",
			type: "{00100000-2012-0004-B001-C46BD7336A1A}", // Route
			hotDeltaColor: "RHLSA(0;1;1;1.5)", // increase opacity by 50%
			altBorderDeltaColor: (Parameters) ? Parameters.get("_sap_ui_vbm_shared_ChartDataPointBorderHoverSelectedColor") : "#666"
		};
		// the data source name is equivalent to the controls id..................//
		oTemp.datasource = oTemp.id;

		oTemp['posarray.bind'] = oTemp.id + ".P"; // P is the position array multi
		oTemp['color.bind'] = oTemp.id + ".C"; // C the color
		oTemp['colorBorder.bind'] = oTemp.id + ".CB"; // CB the border color
		oTemp['tooltip.bind'] = oTemp.id + ".TT"; // TT the tooltip
		aResult.push(oTemp);

		// Points
		oTemp = {
			id: this.getId() + "_Points",
			type: "{00100000-2012-0004-B001-64592B8DB964}", // Spot
			hotDeltaColor: "RHLSA(0;1;2;1)" // increase lightness by 100%
		};
		// the data source name is equivalent to the controls id..................//
		oTemp.datasource = oTemp.id;

		oTemp['pos.bind'] = oTemp.id + ".P"; // P is the position
		oTemp['tooltip.bind'] = oTemp.id + ".TT"; // TT the tooltip
		aResult.push(oTemp);

		return aResult;
	};

	GeoJsonLayer.prototype.getTypeObjects = function() {
		var oType = {}, aResult = [];
		var oTypeTemplate = {
			key: "K",
			minSel: "0",
			maxSel: "0", // suppress selection
			A: [
				{
					"name": "K", // key
					"alias": "K",
					"type": "string"
				}, {
					"name": "C", // color
					"alias": "C",
					"type": "color"
				}, {
					"name": "CB", // border color
					"alias": "CB",
					"type": "string"
				}, {
					"name": "TT", // tooltip
					"alias": "TT",
					"type": "string"
				}
			]
		};

		jQuery.extend(/* deep= */true, oType, oTypeTemplate); // copy template
		// set the id.............................................................//
		oType.name = this.getId() + "_Polys";
		oType.A.push({
			"name": "P", // position array multi
			"alias": "P",
			"type": "vectorarraymulti"
		});
		aResult.push(oType);

		oType = {};
		jQuery.extend(/* deep= */true, oType, oTypeTemplate); // copy template
		// set the id.............................................................//
		oType.name = this.getId() + "_Lines";

		oType.A.push({
			"name": "P", // position array
			"alias": "P",
			"type": "vectorarray"
		});
		aResult.push(oType);

		oType = {};
		jQuery.extend(/* deep= */true, oType, oTypeTemplate); // copy template
		// set the id.............................................................//
		oType.name = this.getId() + "_Points";
		oType.A.push({
			"name": "P", // position
			"alias": "P",
			"type": "vector"
		});
		aResult.push(oType);

		return aResult;
	};

	GeoJsonLayer.prototype.getDataObjects = function() {
		if (this.mbGeoJSONDirty) {
			this._triggerFeatureCreation();
		}

		// apply the feature properties to the vbi datacontext.....................//
		// do a real clone of the original data, to be able to handle complete....//
		// model changes..........................................................//

		var aElements = [], aPolys = [], aLines = [], aPoints = [];
		jQuery.extend(true, aElements, this.mFeatureColl);

		var oOverlayMap = {};
		if (aElements.length) {
			// create lookup for overlayed features..................................//
			var aOverlayFeatures = this.getItems();
			for (var nJ = 0, len = aOverlayFeatures ? aOverlayFeatures.length : 0, item; nJ < len; ++nJ) {
				item = aOverlayFeatures[nJ];
				oOverlayMap[item.getFeatureId()] = item;
			}
		}

		// iterate over feature table.............................................//
		for (var nK = 0, oElement, oOverlay, tmp; nK < aElements.length; ++nK) {
			oElement = aElements[nK];

			if ((oOverlay = oOverlayMap[oElement.K])) {
				// Overlay found, apply properties.....................................//
				oElement.C = oOverlay.getColor();
				if ((tmp = oOverlay.getTooltip())) {
					oElement.TT = tmp;
				}
			}
			switch (oElement.type) {
				case "Polygon":
				case "MultiPolygon":
					aPolys.push(oElement);
					break;
				case "LineString":
				case "MultiLineString":
					aLines.push(oElement);
					break;
				case "Point":
				case "MultiPoint":
					aPoints.push(oElement);
					break;
				default:
					Log.error("Unknown object type", oElement.type, thisModule);
			}
		}

		return [
			{
				"name": this.getId() + "_Polys",
				"type": "N",
				"E": aPolys
			}, {
				"name": this.getId() + "_Lines",
				"type": "N",
				"E": aLines
			}, {
				"name": this.getId() + "_Points",
				"type": "N",
				"E": aPoints
			}
		];
	};

	GeoJsonLayer.prototype.getDataRemoveObjects = function() {
		return [
			{
				"name": this.getId() + "_Polys",
				"type": "N"
			}, {
				"name": this.getId() + "_Lines",
				"type": "N"
			}, {
				"name": this.getId() + "_Points",
				"type": "N"
			}
		];
	};

	GeoJsonLayer.prototype.getActionArray = function() {
		var aActions = [];
		var id = this.getId();

		// check if the different vo events are registered..............................//
		if (this.mEventRegistry["click"] || this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "Polys1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id + "_Polys",
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
			aActions.push({
				"id": id + "Lines1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id + "_Lines",
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
			aActions.push({
				"id": id + "Points1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id + "_Points",
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"] || this.isEventRegistered("contextMenu")) {
			aActions.push({
				"id": id + "_Polys2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id + "_Polys",
				"refEvent": "ContextMenu"
			});
			aActions.push({
				"id": id + "_Lines2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id + "_Lines",
				"refEvent": "ContextMenu"
			});
			aActions.push({
				"id": id + "_Points2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id + "_Points",
				"refEvent": "ContextMenu"
			});
		}
// if( this.mEventRegistry[ "drop" ] || this.isEventRegistered( "drop" ) )
// aActions.push( { "id": id + "3", "name": "drop", "refScene": "MainScene", "refVO": id, "refEvent": "Drop" } );
//
// if( this.mEventRegistry[ "edgeClick" ] || this.isEventRegistered( "edgeClick" ) )
// aActions.push( { "id": id + "7", "name": "edgeClick", "refScene": "MainScene", "refVO": id, "refEvent": "EdgeClick" });
// if( this.mEventRegistry[ "edgeContextMenu" ] || this.isEventRegistered( "edgeContextMenu" ) )
// aActions.push( { "id": id + "8", "name": "edgeContextMenu", "refScene": "MainScene", "refVO": id, "refEvent": "EdgeContextMenu" });

		return aActions;
	};

	/**
	 * Returns Properties for Features like name, bounding box, and midpoint
	 *
	 * @param {string[]} aFeatureIds Array of Feature Ids. The Feature Id must match the GeoJSON tag.
	 * @returns {array} Array of Feature Information Objects. Each object in the array has the properties BBox: Bounding Box for the Feature in format
	 *          "lonMin;latMin;lonMax;latMax", Midpoint: Centerpoint for Feature in format "lon;lat", Name: Name of the Feature, and Properties: Array
	 *          of name-value-pairs associated with the Feature
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoJsonLayer.prototype.getFeaturesInfo = function(aFeatureIds) {
		var result = [];
		for (var nJ = 0, len = aFeatureIds.length, featureId; nJ < len; ++nJ) {
			featureId = aFeatureIds[nJ];
			result[featureId] = {};
			result[featureId].BBox = this.mFeatureBBox[featureId];
			result[featureId].Midpoint = [
				(this.mFeatureBBox[featureId][0] + this.mFeatureBBox[featureId][1]) / 2, (this.mFeatureBBox[featureId][2] + this.mFeatureBBox[featureId][3]) / 2
			];
			result[featureId].Name = this.mNames[featureId];
			result[featureId].Properties = this.mFeatureProps[featureId];
		}
		return result;
	};

	GeoJsonLayer.prototype.handleEvent = function(event) {
		var s = event.Action.name;

		var funcname = "fire" + s[0].toUpperCase() + s.slice(1);

		// first we try to get the event on a GeoJsonLayer instance......................//
		var oOverlay, sInstance = event.Action.instance;
		if ((oOverlay = this.findInstance(sInstance))) {

			if (oOverlay.mEventRegistry[s]) {
				if (s === "click") {
					oOverlay.mClickGeoPos = event.Action.AddActionProperties.AddActionProperty[0]['#'];
				}
				if (s === "contextMenu") {
					oOverlay.mClickPos = [
						event.Action.Params.Param[0]['#'], event.Action.Params.Param[1]['#']
					];

					if (this.oParent.mVBIContext.m_Menus) {
						this.oParent.mVBIContext.m_Menus.deleteMenu("DynContextMenu");
					}
					// create an empty menu
					var oMenuObject = new Menu();
					oMenuObject.vbi_data = {};
					oMenuObject.vbi_data.menuRef = "CTM";
					oMenuObject.vbi_data.VBIName = "DynContextMenu";

					// fire the contextMenu..................................................//
					oOverlay.fireContextMenu({
						menu: oMenuObject
					});
				} else if (s === "handleMoved") {
					oOverlay[funcname]({
						data: event
					});
				} else {
					oOverlay[funcname]({});
				}
			}
		}
		// check wether event is registered on Feature Collection and fire in case of
		if (this.mEventRegistry[s]) {
			this[funcname]({
				featureId: sInstance.split(".")[1]
			});
		}
	};

	/**
	 * open a Detail Window
	 *
	 * @param {sap.ui.vbm.Feature} oFeature VO instance for which the Detail Window should be opened
	 * @param {object} oParams Parameter object
	 * @param {string} oParams.caption Text for Detail Window caption
	 * @param {string} oParams.offsetX position offset in x-direction from the anchor point
	 * @param {string} oParams.offsetY position offset in y-direction from the anchor point
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoJsonLayer.prototype.openDetailWindow = function(oFeature, oParams) {
		var oParent = this.getParent();
		oParent.mDTWindowCxt.bUseClickPos = true;
		oParent.mDTWindowCxt.open = true;
		oParent.mDTWindowCxt.src = oFeature;
		oParent.mDTWindowCxt.key = oFeature.getFeatureId();
		oParent.mDTWindowCxt.params = oParams;
		oParent.m_bWindowsDirty = true;
		oParent.invalidate(this);
	};

	/**
	 * open the context menu
	 *
	 * @param {sap.ui.vbm.Feature} oFeature VO instance for which the Detail Window should be opened
	 * @param {object} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoJsonLayer.prototype.openContextMenu = function(oFeature, oMenu) {
		this.oParent.openContextMenu("Area", oFeature, oMenu);
	};

	GeoJsonLayer.prototype.handleChangedData = function(aElements) {
		if (aElements && aElements.length) {
			for (var nI = 0, oElement, oInst; nI < aElements.length; ++nI) {
				oElement = aElements[nI];
				// key oElement.K may be undefined for objects without id or feature overlay
				oInst = (oElement.K) ? this.findInstance(oElement.K) : null;
				if (oInst) {
					oInst.handleChangedData(oElement);
				}
			}
		}
	};

	// ..........................................................................//
	// helper functions.........................................................//

	GeoJsonLayer.prototype.isEventRegistered = function(name) {
		var aOverlayFeatures = this.getItems();
		if (!aOverlayFeatures) {
			return false;
		}

		for (var nJ = 0, len = aOverlayFeatures.length; nJ < len; ++nJ) {
			// if one registers for an event we can return........................//
			if (aOverlayFeatures[nJ].mEventRegistry[name]) {
				return true;
			}
		}

		return false;
	};

	GeoJsonLayer.prototype.findInstance = function(name) {
		var aOverlayFeatures = this.getItems();
		if (!aOverlayFeatures) {
			return null;
		}

		switch (jQuery.type(name)) {
			case "string":
				var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
				for (var nJ = 0, len = aOverlayFeatures.length; nJ < len; ++nJ) {
					// get the control.....................................................//
					if (aOverlayFeatures[nJ].getFeatureId() === key) {
						return aOverlayFeatures[nJ];
					}
				}
				break;
			case "number":
				// Check: Are there overlays for non-id GeoJSON objects?
				break;
			default:
				Log.error("Unexpected instance name type", jQuery.type(name), thisModule);
				break;
		}

		return null;
	};

	return GeoJsonLayer;
});
