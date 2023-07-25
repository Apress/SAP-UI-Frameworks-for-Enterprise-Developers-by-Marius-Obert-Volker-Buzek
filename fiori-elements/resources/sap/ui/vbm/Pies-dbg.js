/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Pies.
sap.ui.define([
	"./VoAggregation",
	"./library"
], function(VoAggregation, library) {
	"use strict";

	/**
	 * Constructor for a new Pies.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Pie</i> instances.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Pies
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Pies = VoAggregation.extend("sap.ui.vbm.Pies", /** @lends sap.ui.vbm.Pies.prototype */
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
				 * Set to true if scale may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				scaleChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Pie object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Pie",
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
	// sap.ui.vbm.Pies.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators...........................................................//
	Pies.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.S = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("scale") : true;

		return oBindInfo;
	};

	Pies.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2012-0004-B001-383477EA1DEB}";
		if (oBindInfo.P) {
			oTemp["pos.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}
		if (oBindInfo.S) {
			oTemp["scale.bind"] = oTemp.id + ".S";
		} else {
			oTemp.scale = oVoTemplate.getScale(); // S is the scaling
		}

		// the series values...................................................//
		oTemp["series.bind"] = oTemp.id + ".Series"; // bind to the series for all pie instances
		oTemp["text.bind"] = oTemp.id + ".Series.T"; // T is the text
		oTemp["value.bind"] = oTemp.id + ".Series.V"; // V is the value
		oTemp["slicecolor.bind"] = oTemp.id + ".Series.C"; // C is the color

		return oTemp;
	};

	Pies.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		// extend the object type.................................................//
		if (oBindInfo.P) {
			oType.A.push({
				"changeable": this.getPosChangeable().toString(),
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.S) {
			oType.A.push({
				"changeable": this.getScaleChangeable().toString(),
				"name": "S", // scale
				"alias": "S",
				"type": "vector"
			});
		}
		oType.N = {
			"name": "Series",
			"A": [
				{
					"name": "V", // value
					"alias": "V",
					"type": "float"
				},
				{
					"name": "T", // text
					"alias": "T",
					"type": "string"
				},
				{
					"name": "C", // color
					"alias": "C",
					"type": "string"
				}
			]
		};
		return oType;
	};

	Pies.prototype.getActionArray = function() {
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
					{"name": "pos"},
					{"name": "pieitem"}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"] || this.isEventRegistered("contextMenu")) {
			aActions.push({
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu",
				"AddActionProperty": [
					{"name": "pieitem"}
				]
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

	return Pies;

});
