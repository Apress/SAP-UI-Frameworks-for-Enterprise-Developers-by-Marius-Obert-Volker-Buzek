/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.LegendItem.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new LegendItem.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Aggregation element for the Legend. A LegendItem consists of marker and an associated text. The marker is either a rectangle in the
	 *        given color or the given image or a semantic spot type. If no marker but only a text is provided then it is shown in italic letters and
	 *        can be regarded as a header.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.LegendItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var LegendItem = Element.extend("sap.ui.vbm.LegendItem", /** @lends sap.ui.vbm.LegendItem.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The color of the legend marker.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: ''
				},

				/**
				 * The image for the legend marker.
				 */
				image: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The semantic spot type for the legend marker.
				 */
				semanticSpotType: {
					type: "sap.ui.vbm.SemanticType",
					group: "Behavior",
					defaultValue: null
				},

				/**
				 * The text of the legend item.
				 */
				text: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on a legend item.
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
	// sap.ui.vbm.LegendItem.prototype.init = function(){
	// // do something for initialization...
	// };

	LegendItem.prototype.getDataElement = function() {
		var oElement = {};
		var col, img, type, txt, tt;
		if ((col = this.getColor())) {
			oElement.C = col;
		}
		if ((img = this.getImage())) {
			oElement.I = img;
		}
		if ((type = this.getSemanticSpotType())) {
			switch (type) {
				case sap.ui.vbm.SemanticType.Hidden:
					oElement.I = "Pin_Hidden.png";
					break;
				case sap.ui.vbm.SemanticType.Error:
					oElement.I = "Pin_Red.png";
					break;
				case sap.ui.vbm.SemanticType.Warning:
					oElement.I = "Pin_Orange.png";
					break;
				case sap.ui.vbm.SemanticType.Success:
					oElement.I = "Pin_Green.png";
					break;
				case sap.ui.vbm.SemanticType.Inactive:
					oElement.I = "Pin_Grey.png";
					break;
				case sap.ui.vbm.SemanticType.Default:
					oElement.I = "Pin_Blue.png";
					break;
				default:
					break;
			}

			if (oElement.I) {
				this.getParent().getParent().addResourceIfNeeded(oElement.I);
			}
		}

		if ((txt = this.getText())) {
			oElement.T = txt;
		}
		if ((tt = this.getTooltip())) {
			oElement.TT = tt;
		}
		return oElement;

	};

	return LegendItem;

});
