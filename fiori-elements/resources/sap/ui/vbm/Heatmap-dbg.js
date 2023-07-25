/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
// Provides control sap.ui.vbm.HeatPoint.
sap.ui.define([
	"./VoAbstract",
	"./library"
], function(VoAbstract, library) {
	"use strict";

	/**
	 * Constructor for a new Heatmap.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>HeatPoint</i> instances.
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Heatmap
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Heatmap = VoAbstract.extend("sap.ui.vbm.Heatmap", /** @lends sap.ui.vbm.Heatmap.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {
				/**
				 * Gradient Definition. Can be either provided as Ressource - then it is type string.<br>
				 * Or as Array [n0,c0,n1,c1,...,nk,ck] (ni > ni-1; ci respective colors) with an arbitrary number of color stops as in the following<br>
				 * Example: [0,'rgba(0,255,0,1)',220,'rgba(255,255,0,1)',255,'rgba(255,0,0,1)'] 
				 */
				gradient: {
					type: "array",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Opacity of the heatmap. 
				 */
				opacity: {
					type: "string",
					group: "Misc",
					defaultValue: '0.5'
				},

				/**
				 * Behavior of the HeatPoint, 0 Density Map, 2: Heat Map, 1: Intermediate. 
				 */
				behavior: {
					type: "string",
					group: "Misc",
					defaultValue: '2'
				},

				/**
				 * Scaling factor for the sample values. 
				 */
				valueScale: {
					type: "string",
					group: "Misc",
					defaultValue: '1.0'
				},
				/**
				 * Scaling factor for the sample radiuses. 
				 */
				radiusScale: {
					type: "string",
					group: "Misc",
					defaultValue: '1.0'
				},
				/**
				 * Exponent for the alphaChannel<br>
				 * aE = 1 : alpha Channel remains linear<br>
				 * 0 < aE < 1 : (e.g. aE=0.5 "square root") sub linear alpha channeling (lower value colors remain longer visible; range appears wider)<br>
				 * aE > 1 (e.g. aE=2: "squared") above linear alpha channeling ( lower value colors remain shortly visible; range appears chopped)<br>
				 */
				alphaExponent: {
					type: "string",
					group: "Misc",
					defaultValue: '1.0'
				},
				/**
				 * Exponent for the color<br>
				 * aE = 1 : Linear Gradient<br>
				 * 0 < aE < 1 : Sublinear Gradient; i.E. with cE=0.5 point values are square rooted before usage [share of lower value cols will decrease]<br>
				 * aE > 1 : Higher Level Gradient; i.E. with cE=2 point values are squared before usage [share of lower value cols will increase]
				 */
				colorExponent: {
					type: "string",
					group: "Misc",
					defaultValue: '1.0'
				}

			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * HeatPoint object aggregation
				 */
				items: {
					type: "sap.ui.vbm.HeatPoint",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Heatmap.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators...........................................................//

	Heatmap.prototype.getBindInfo = function() {
		var oBindInfo = VoAbstract.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.V = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("value") : true;
		oBindInfo.R = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("radius") : true;

		return oBindInfo;
	};

	Heatmap.prototype.getTemplateObject = function() {
		// get common template from base class (VoAbstract)
		var oTemp = VoAbstract.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2012-0004-B001-E180770E8A12}";
		if (oBindInfo.P) {
			oTemp["pos.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}		
		if (oBindInfo.R) {
			oTemp["radius.bind"] = oTemp.id + ".R";
		} else {
			oTemp.radius = oVoTemplate.getRadius(); // P is the position
		}		
		if (oBindInfo.V) {
			oTemp["value.bind"] = oTemp.id + ".V";
		} else {
			oTemp.value = oVoTemplate.getValue(); // V Value
		}		
		oTemp.gradient = this.getGradient(); 
		oTemp.opacity = this.getOpacity(); 
		oTemp.behavior = this.getBehavior(); 
		oTemp.radiusScale = this.getRadiusScale();
		oTemp.valueScale = this.getValueScale();
		oTemp.alphaExponent = this.getAlphaExponent();
		oTemp.colorExponent = this.getColorExponent();

		return oTemp;
	};

	Heatmap.prototype.getTypeObject = function() {
		var oType = VoAbstract.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		// extend the object type.................................................//
		if (oBindInfo.P) {
			oType.A.push({
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.V) {
			oType.A.push({
				"name": "V", // radius
				"alias": "V",
				"type": "string"
			});
		}
		if (oBindInfo.R) {
			oType.A.push({
				"name": "R", // radius
				"alias": "R",
				"type": "string"
			});
		}
		return oType;
	};

	// ..........................................................................//
	// helper functions.........................................................//

	Heatmap.prototype.handleEvent = function(event) {
//		var s = event.Action.name;
//
//		var funcname = "fire" + s[0].toUpperCase() + s.slice(1);
//
//		// first we try to get the event on a Heatmap instance......................//
//		var HeatPoint;
//		if ((HeatPoint = this.findInstance(event.Action.instance))) {
//			if (HeatPoint.mEventRegistry[s]) {
//			}
//		}
//		this[funcname]({
//			data: event
//		});
	};

	Heatmap.prototype.getActionArray = function() {
		var aActions = VoAbstract.prototype.getActionArray.apply(this, arguments);

		// var id = this.getId();

		return aActions;
	};

	return Heatmap;

});


