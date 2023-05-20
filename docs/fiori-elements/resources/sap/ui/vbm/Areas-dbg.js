/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Areas.
sap.ui.define([
	"./VoAggregation",
	"sap/ui/unified/Menu",
	"sap/base/Log",
	"./library"
], function(VoAggregation, Menu, Log, library) {
	"use strict";

	var thisModule = "sap.ui.vbm.Areas";

	/**
	 * Constructor for a new Areas.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>Area</i> instances.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Areas
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Areas = VoAggregation.extend("sap.ui.vbm.Areas", /** @lends sap.ui.vbm.Areas.prototype */
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
				 * Area object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Area",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * This event is raised when the edge of an Area is clicked.
				 */
				edgeClick: {
					parameters: {

						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.Area"
						},
						/**
						 * The number of the edge where the click occured. Edges are numbered zero based: e.g. edge from point 1 to point 2 has number
						 * 0
						 */
						edge: {
							type: "int"
						}
					}

				},

				/**
				 * This event is raised when the edge of an Area is right clicked.
				 */
				edgeContextMenu: {
					parameters: {
						/**
						 * Clicked instance
						 */
						instance: {
							type: "sap.ui.vbm.Area"
						},
						/**
						 * The number of the edge where the click occured. Edges are numbered zero based: e.g. edge from point 1 to point 2 has number
						 * 0
						 */
						edge: {
							type: "int"
						}
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Areas.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//

	Areas.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.C = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("color") : true;
		oBindInfo.CB = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorBorder") : true;
		oBindInfo.BD = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("borderDash") : true;

		return oBindInfo;
	};

	Areas.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2012-0004-B001-F311DE491C77}";
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
		if (oBindInfo.BD) {
			oTemp["borderDash.bind"] = oTemp.id + ".BD";
		} else {
			oTemp.borderDash = oVoTemplate.getBorderDash(); // BD is the line dashing array
		}
		// check first child if posarray or posarraymulti should be used
		var aVO = this.getItems();
		if (aVO.length) {
			if (aVO[0].getPosition().substring(0, 1) === "[") {
				oTemp["posarraymulti.bind"] = oTemp.id + ".PM"; // PM is the position array multi
			} else {
				oTemp["posarray.bind"] = oTemp.id + ".P"; // P is the position array
			}
		} else {
			Log.warning("items aggregation must not be empty!", "", thisModule);
		}

		return oTemp;
	};

	Areas.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;
		var pc = this.getPosChangeable().toString();

		// extend the object type.................................................//
		oType.A = oType.A.concat( [
			{
				"changeable": pc,
				"name": "P", // position array
				"alias": "P",
				"type": "vectorarray"
			}, {
				"changeable": pc,
				"name": "PM", // position array multi
				"alias": "PM",
				"type": "vectorarraymulti"
			}
		]);
		if (oBindInfo.C) {
			oType.A.push({
				"name": "C", // color
				"alias": "C",
				"type": "color"
			});
		}
		if (oBindInfo.CB) {
			oType.A.push({
				"name": "CB", // border color
				"alias": "CB",
				"type": "string"
			});
		}
		if (oBindInfo.BD) {
			oType.A.push({
				"name": "BD", // borderdash
				"alias": "BD",
				"type": "string"
			});
		}

		return oType;
	};

	Areas.prototype.getActionArray = function() {
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
		if (this.mEventRegistry["edgeClick"] || this.isEventRegistered("edgeClick")) {
			aActions.push({
				"id": id + "7",
				"name": "edgeClick",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "EdgeClick"
			});
		}
		if (this.mEventRegistry["edgeContextMenu"] || this.isEventRegistered("edgeContextMenu")) {
			aActions.push({
				"id": id + "8",
				"name": "edgeContextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "EdgeContextMenu"
			});
		}

		return aActions;
	};

	// ..........................................................................//
	// helper functions.........................................................//

	Areas.prototype.handleEvent = function(event) {
		var s = event.Action.name;

		if (s == "edgeContextMenu" || s == "edgeClick") {

			var funcname = "fire" + s[0].toUpperCase() + s.slice(1);

			// first we try to get the event on a Areas instance......................//
			var Area;
			if ((Area = this.findInstance(event.Action.instance))) {
				var eventContext = {
				                  data: event,
				                  edge: parseInt(event.Action.Params.Param['2']['#'], 10)
				};

				if (s == "edgeContextMenu") {
					Area.mClickPos = [
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

				    eventContext.menu = oMenuObject;
				}
				if (Area.mEventRegistry[s]) {
					Area[funcname](eventContext);
				}
				if (this.mEventRegistry[s]) {
					eventContext.instance = Area;
					this[funcname](eventContext);
				}
			} else {
				Log.error("Instance for event not found", "", thisModule);
			}
		} else {
			VoAggregation.prototype.handleEvent.apply(this, arguments);
		}
	};

	return Areas;

});
