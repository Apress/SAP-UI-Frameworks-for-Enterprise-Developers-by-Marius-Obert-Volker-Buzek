/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.PieItem.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new PieItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Slice element for a Pie Chart.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.PieItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PieItem = Element.extend("sap.ui.vbm.PieItem", /** @lends sap.ui.vbm.PieItem.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The name of the Pie item.
				 */
				name: {
					type: "string",
					group: "Misc",
					defaultValue: ''
				},

				/**
				 * The value of the Pie item.
				 */
				value: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The color of the Pie Item.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			events: {
				/**
				 * @deprecated since version 1.31 This event should no longer be used. Click event from Pie and Pies now includes Pie Item index when event occurs.
				 */
				 click: {}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.PieItem.prototype.init = function(){
	// // do something for initialization...
	// };

	return PieItem;

});
