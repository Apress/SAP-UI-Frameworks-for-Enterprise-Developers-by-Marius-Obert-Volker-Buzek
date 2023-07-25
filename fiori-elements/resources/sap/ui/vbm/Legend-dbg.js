/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Legend.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new Legend.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Legend is a window in the GeoMap or AnalyticMap control wich can be used to display color/icon-text pairs on a map.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Legend
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Legend = Element.extend("sap.ui.vbm.Legend", /** @lends sap.ui.vbm.Legend.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The caption of the legend.
				 */
				caption: {
					type: "string",
					group: "Misc",
					defaultValue: sap.ui.getCore().getLibraryResourceBundle("sap.ui.vbm.i18n").getText("CAPTION_LEGEND")
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * LegendItem object aggregation
				 */
				items: {
					type: "sap.ui.vbm.LegendItem",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on a legend.
				 */
				click: {
					parameters: {

						/**
						 * Event data object
						 */
						data: {
							type: "object"
						},

						/**
						 * The row number where the click occurred
						 */
						row: {
							type: "int"
						},

						/**
						 * key modifier Ctrl pressed
						 */
						ctrlKey: {
							type: "boolean"
						},

						/**
						 * key modifier Shift pressed
						 */
						shiftKey: {
							type: "boolean"
						},

						/**
						 * key modifier Meta pressed
						 */
						metaKey: {
							type: "boolean"
						},

						/**
						 * key modifier Alt pressed
						 */
						altKey: {
							type: "boolean"
						}
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */

	Legend.prototype.init = function() {
		// set legend flags.......................................................//
		// this.m_bLegendRendered = false;
	};

	// ...........................................................................//
	// model creators............................................................//

	Legend.prototype.getTemplateObject = function() {
		var id = this.getId();
		var oWindowsTemplate = {};

		if (this.getParent().getLegendVisible()) {
			oWindowsTemplate = {
				"Set": [
					{
						"name": id,
						"Window": {
							"id": id,
							"type": "legend",
							"caption": this.getCaption(),
							"refParent": "Main",
							"refScene": "",
							"modal": "true",
							"datasource": id,
							"colors.bind": id + ".C",
							"images.bind": id + ".I",
							"texts.bind": id + ".T",
							"tooltips.bind": id + ".TT"
						}
					}
				]
			};
			if (this.getParent().m_curLegendPos) {
				oWindowsTemplate.Set[0].Window.right = this.getParent().m_curLegendPos.right.toString();
				oWindowsTemplate.Set[0].Window.top = this.getParent().m_curLegendPos.top.toString();
			}
		} else {
			// Legend not visible -> remove legend window
			oWindowsTemplate = {
				"Remove": [
					{
						"name": id
					}
				]
			};
		}
		return oWindowsTemplate;
	};

	Legend.prototype.getTypeObject = function() {
		return {
			"name": this.getId(),
			"A": [
				{
					"name": "C", // color
					"alias": "C",
					"type": "color"
				}, {
					"name": "I", // image
					"alias": "I",
					"type": "string"
				}, {
					"name": "T", // text
					"alias": "T",
					"type": "string"
				}, {
					"name": "TT", // tooltip
					"alias": "TT",
					"type": "string"
				}
			]
		};
	};

	Legend.prototype.getDataObject = function() {
		var oData = {};

		// set the id of the table................................................//
		oData['name'] = this.getId();
		oData.E = [];

		var aVO = this.getItems();
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			oData.E.push(aVO[nJ].getDataElement());
		}

		return oData;
	};

	// ..........................................................................//
	// helper functions.........................................................//

	Legend.prototype.handleEvent = function(event) {
		var s = event.Action.name;

		var funcname = "fire" + s[0].toUpperCase() + s.slice(1);

		var params = {
			data: event,
			ctrlKey: event.Action.Params.Param[1]['#'],
			shiftKey: event.Action.Params.Param[2]['#'],
			metaKey: event.Action.Params.Param[3]['#'],
			altKey: event.Action.Params.Param[4]['#']
		};

		// first we try to get the event on a legend item ......................//
		var LegendItem;
		if ((LegendItem = this.findInstance(event.Action.Params.Param[0]['#']))) {
			if (LegendItem.mEventRegistry[s]) {
				if (s == "click") {
					LegendItem[funcname](params);
				}
			}
		}
		params.row = parseInt(event.Action.Params.Param[0]['#'], 10);

		this[funcname](params);
	};

	Legend.prototype.getActionArray = function() {
		var id = this.getId();
		var aActions = [];

		// check if the different vo events are registered..............................//
		if (this.mEventRegistry["click"] || this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click"
			});
		}

		return aActions;
	};

	Legend.prototype.isEventRegistered = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oInstance = aVO[nJ];

			// if one registers for an event we can return........................//
			if (oInstance.mEventRegistry[name]) {
				return true;
			}
		}

		return false;
	};

	Legend.prototype.findInstance = function(key) {

		var aVO = this.getItems();

		(aVO[0].sId).lastIndexOf('-');

		aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			var id = aVO[nJ].sId;
			var idx = id.lastIndexOf('-');
			var result = id.substring(idx + 1);
			if (result === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	return Legend;

});
