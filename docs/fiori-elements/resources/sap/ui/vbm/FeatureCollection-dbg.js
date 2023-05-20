/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.FeatureCollection.
sap.ui.define([
	"./GeoJsonLayer",
	"jquery.sap.global",
	"sap/base/Log",
	"./library"
], function(GeoJsonLayer, jQuery, Log, library) {
	"use strict";

	/**
	 * Constructor for a new FeatureCollection.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class FeatureCollection aggregation container. A FeatureCollection can render the content of an assigned GeoJSON. The naming is associated to
	 *        the GeoJSON standard. All features found in the GeoJSON are rendered as separated objects. From the possible feature types only
	 *        <ul>
	 *        <li>Polygon and
	 *        <li>Multipolygon
	 *        </ul>
	 *        are supported so far. The feature type support will be extended in the upcoming releases.<br>
	 *        All features from the GeoJSON will be rendered with the given default colors and are inactive. They do not react on mouse over, except
	 *        with tooltip, or raise any events on click or right click.<br>
	 *        By adding <i>Feature elements</i> to the items aggregation you can make the match (by id) feature from the GeoJSON interactive and give
	 *        it alternative colors.
	 * @extends sap.ui.vbm.GeoJsonLayer
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.FeatureCollection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeatureCollection = GeoJsonLayer.extend("sap.ui.vbm.FeatureCollection", /** @lends sap.ui.vbm.FeatureCollection.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {},
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

	// ...........................................................................//
	// model creators............................................................//

	FeatureCollection.prototype.getDataObjects = function() {
		if (this.mbGeoJSONDirty) {
			this._triggerFeatureCreation();
		}

		// apply the feature properties to the vbi datacontext.....................//
		// do a clone of the original data, to be able to handle complete....//
		// model changes..........................................................//

		var aElements = [], aPolys = [], aLines = [], aPoints = [];
		jQuery.extend(aElements, this.mFeatureColl); // shallow copy of array -> need to copy elements before change!

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
				// do not change original element -> make copy first!
				var oCopy = {};
				jQuery.extend(oCopy, oElement);
				oElement = aElements[nK] = oCopy;
				// apply changes
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
					Log.error("Unknown feature type", oElement.type, "sap.ui.vbm.FeatureCollection");
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

	FeatureCollection.prototype.getDataRemoveObjects = function() {
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
	FeatureCollection.prototype.getFeaturesInfo = function(aFeatureIds) {
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

	return FeatureCollection;

});
