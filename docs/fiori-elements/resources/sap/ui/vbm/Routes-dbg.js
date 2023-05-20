/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Routes.
sap.ui.define([
	"./VoAggregation",
	"./library"
], function(VoAggregation, library) {
	"use strict";

	/**
	 * Constructor for a new Routes.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Route</i> elements.<br>
	 *        Routes support GeoMap internal drag'n drop with fine grained control on matching drag sources and drop targets. A drag'n drop operation
	 *        is possible if any type in the drag source aggregation of the dragged visual object matches a type in the drop target aggregation of the
	 *        target vo. If drag source and drop target types are defined on aggregation level they apply for all aggregated elements.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Routes
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Routes = VoAggregation.extend("sap.ui.vbm.Routes", /** @lends sap.ui.vbm.Routes.prototype */
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
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Route object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Route",
					multiple: true,
					singularName: "item"
				},

				/**
				 * DragSource aggregation
				 */
				dragSource: {
					type: "sap.ui.vbm.DragSource",
					multiple: true,
					singularName: "dragSource"
				},

				/**
				 * DropTarget aggregation
				 */
				dropTarget: {
					type: "sap.ui.vbm.DropTarget",
					multiple: true,
					singularName: "dropTarget"
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on a Route.
				 */
				click: {},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a Route.
				 */
				contextMenu: {},

				/**
				 * The event is raised when something is dropped on a Route.
				 */
				drop: {}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Routes.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators...........................................................//

	Routes.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.C = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("color") : true;
		oBindInfo.ST = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("start") : true;
		oBindInfo.ED = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("end") : true;
		oBindInfo.LW = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("linewidth") : true;
		oBindInfo.DC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dotcolor") : true;
		oBindInfo.DW = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dotwidth") : true;
		oBindInfo.DBC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dotbordercolor") : true;
		oBindInfo.CB = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorBorder") : true;
		oBindInfo.LD = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("lineDash") : true;
		oBindInfo.DI = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("directionIndicator") : true;

		return oBindInfo;
	};

	Routes.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2012-0004-B001-C46BD7336A1A}";
		if (oBindInfo.P) {
			oTemp["posarray.bind"] = oTemp.id + ".P";
		} else {
			oTemp.posarray = oVoTemplate.getPosition(); // P is the position array
		}
		if (oBindInfo.C) {
			oTemp["color.bind"] = oTemp.id + ".C";
		} else {
			oTemp.color = oVoTemplate.getColor(); // C is the color
		}
		if (oBindInfo.ST) {
			oTemp["start.bind"] = oTemp.id + ".ST";
		} else {
			oTemp.start = oVoTemplate.getStart(); // ST is the start style
		}
		if (oBindInfo.ED) {
			oTemp["end.bind"] = oTemp.id + ".ED";
		} else {
			oTemp.end = oVoTemplate.getEnd(); // ED is the end style
		}
		if (oBindInfo.LW) {
			oTemp["linewidth.bind"] = oTemp.id + ".LW";
		} else {
			oTemp.linewidth = oVoTemplate.getLinewidth(); // LW is the linewidth
		}
		if (oBindInfo.DC) {
			oTemp["dotcolor.bind"] = oTemp.id + ".DC";
		} else {
			oTemp.dotcolor = oVoTemplate.getDotcolor(); // DC is the dotcolor
		}
		if (oBindInfo.DBC) {
			oTemp["dotbordercolor.bind"] = oTemp.id + ".DBC";
		} else {
			oTemp.dotbordercolor = oVoTemplate.getDotbordercolor(); // DBC is the dotborder color
		}
		if (oBindInfo.CB) {
			oTemp["colorBorder.bind"] = oTemp.id + ".CB";
		} else {
			oTemp.colorBorder = oVoTemplate.getColorBorder(); // CB is the border color
		}
		if (oBindInfo.LD) {
			oTemp["lineDash.bind"] = oTemp.id + ".LD";
		} else {
			oTemp.lineDash = oVoTemplate.getLineDash(); // LD is the line dashing array
		}
		if (oBindInfo.DW) {
			oTemp["dotwidth.bind"] = oTemp.id + ".DW";
		} else {
			oTemp.dotwidth = oVoTemplate.getDotwidth(); // DW is the dot width // DD is the dragData
		}
		if (oBindInfo.DI) {
			oTemp["directionIndicator.bind"] = oTemp.id + ".DI";
		} else {
			oTemp.directionIndicator = oVoTemplate.getDirectionIndicator(); 
		}
		oTemp["DragSource"] = {
			"DragItem": this.getDragItemTemplate(oTemp.id)
		};
		oTemp["DropTarget"] = {
			"DropItem": this.getDropItemTemplate(oTemp.id)
		};

		return oTemp;
	};

	Routes.prototype.getTypeObject = function() {
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
		if (oBindInfo.C) {
			oType.A.push({
				"name": "C", // color
				"alias": "C",
				"type": "color"
			});
		}
		if (oBindInfo.ST) {
			oType.A.push({
				"name": "ST", // start type
				"alias": "ST",
				"type": "long"
			});
		}
		if (oBindInfo.ED) {
			oType.A.push({
				"name": "ED", // end type
				"alias": "ED",
				"type": "long"
			});
		}
		if (oBindInfo.LW) {
			oType.A.push({
				"name": "LW", // linewidth
				"alias": "LW",
				"type": "float"
			});
		}
		if (oBindInfo.DC) {
			oType.A.push({
				"name": "DC", // dotcolor
				"alias": "DC",
				"type": "color"
			});
		}
		if (oBindInfo.DBC) {
			oType.A.push({
				"name": "DBC", // dotbordercolor
				"alias": "DBC",
				"type": "color"
			});
		}
		if (oBindInfo.CB) {
			oType.A.push({
				"name": "CB", // bordercolor
				"alias": "CB",
				"type": "color"
			});
		}
		if (oBindInfo.LD) {
			oType.A.push({
				"name": "LD", // linedash
				"alias": "LD",
				"type": "string"
			});
		}
		if (oBindInfo.DW) {
			oType.A.push({
				"name": "DW", // dot diameter
				"alias": "DW",
				"type": "float"
			});
		}
		if (oBindInfo.DI) {
			oType.A.push({
				"name": "DI", // dot diameter
				"alias": "DI",
				"type": "boolean"
			});
		}
		return oType;
	};

	Routes.prototype.getActionArray = function() {
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

	return Routes;

});
