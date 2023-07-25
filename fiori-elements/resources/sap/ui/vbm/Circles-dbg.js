/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Circles.
sap.ui.define([
	"./VoAggregation",
	"./library"
], function(VoAggregation, library) {
	"use strict";

	/**
	 * Constructor for a new Circles.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Circle</i> elements.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Circles
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Circles = VoAggregation.extend("sap.ui.vbm.Circles", /** @lends sap.ui.vbm.Circles.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Set to true if position may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				posChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Set to true if radius may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				radiusChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * circle object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Circle",
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
	// sap.ui.vbm.Circles.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators...........................................................//

	Circles.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.C = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("color") : true;
		oBindInfo.CB = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorBorder") : true;
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.NS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("slices") : true;
		oBindInfo.R = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("radius") : true;

		return oBindInfo;
	};

	Circles.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2013-0004-B001-7EB3CCC039C4}";
		if (oBindInfo.P) {
			oTemp["pos.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}
		if (oBindInfo.NS) {
			oTemp["slices.bind"] = oTemp.id + ".NS";
		} else {
			oTemp.slices = oVoTemplate.getSlices(); // NS is the number of slices
		}
		if (oBindInfo.C) {
			oTemp["color.bind"] = oTemp.id + ".C";
		} else {
			oTemp.color = oVoTemplate.getColor(); // C the color
		}
		if (oBindInfo.CB) {
			oTemp["colorBorder.bind"] = oTemp.id + ".CB";
		} else {
			oTemp.colorBorder = oVoTemplate.getColorBorder(); // BC the border color
		}
		if (oBindInfo.R) {
			oTemp["radius.bind"] = oTemp.id + ".R";
		} else {
			oTemp.radius = oVoTemplate.getRadius(); // R is the radius
		}

		return oTemp;
	};

	Circles.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		if (oBindInfo.P) {
			oType.A.push({
				"changeable": this.getPosChangeable().toString(),
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.R) {
			oType.A.push({
				"changeable": this.getRadiusChangeable().toString(),
				"name": "R", // radius
				"alias": "R",
				"type": "double"
			});
		}
		if (oBindInfo.C) {
			oType.A.push({
				"name": "C", // color
				"alias": "C",
				"type": "color"
			});
		}
		if (oBindInfo.CB) {
			oType.A.push({
				"name": "CB", // colorBorder
				"alias": "CB",
				"type": "color"
			});
		}
		if (oBindInfo.NS) {
			oType.A.push({
				"name": "NS", // slices
				"alias": "NS",
				"type": "long"
			});
		}
		return oType;
	};

	Circles.prototype.getActionArray = function() {
		var aActions = VoAggregation.prototype.getActionArray.apply(this, arguments);

		var id = this.getId();

		// check if the different vo events are registered..............................//
		if (this.mEventRegistry["click"] || this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
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
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu"
			});
		}
		if (this.mEventRegistry["drop"] || this.isEventRegistered("drop")) {
			aActions.push({
				"id": id + "3",
				"name": "drop",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Drop"
			});
		}

		return aActions;
	};

	// ..........................................................................//
	// helper functions.........................................................//

	return Circles;

});
