/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.LegendItem.
sap.ui.define([
	"sap/m/StandardListItem",
	"./LegendItemRenderer"
], function(
	StandardListItem,
	LegendItemRenderer
) {
	"use strict";

	/**
	 * Constructor for a new LegendItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Legend item control
	 * @extends sap.m.StandardListItem
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.LegendItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.38.0 This class is experimental and might be modified or removed in future versions.
	 */
	var LegendItem = StandardListItem.extend("sap.ui.vk.LegendItem", /** @lends sap.ui.vk.LegendItem.prototype */ {
		metadata: {

			library: "sap.ui.vk",
			properties:
			{
				/**
				 * show color square
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: null
				},
				/**
				 * The semantic spot type for the legend marker.
				 */
				semanticSpotType: {
					type: "sap.ui.vbm.SemanticType",
					group: "Behavior",
					defaultValue: null
				}
			},
			aggregations: {
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// LegendItem.prototype.init = function(){
	// do something for initialization...

	// };

	return LegendItem;

});
