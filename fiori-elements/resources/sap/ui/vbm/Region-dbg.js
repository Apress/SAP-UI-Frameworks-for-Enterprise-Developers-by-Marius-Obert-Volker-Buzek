/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Region.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new Region.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Region properties.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Region
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Region = Element.extend("sap.ui.vbm.Region", /** @lends sap.ui.vbm.Region.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The color, this must be provided in the rgba(r,g,b,a) format.
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: null
				},

				/**
				 * The region code.
				 */
				code: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * set to true if the element is selected
				 */
				select: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				labelText: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Type for semantic labels. A given semantic type will overrule color settings and add an icon.
				 */
				labelType: {
					type: "sap.ui.vbm.SemanticType",
					group: "Behavior",
					defaultValue: sap.ui.vbm.SemanticType.None
				},

				labelBgColor: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(255;255;255)'
				},

				labelBorderColor: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The visual objects label arrow. For left/right/top/bottom aligned labels an additional arrow points to the label's object.
				 */
				labelArrow: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}

			},
			events: {

				/**
				 * The event is raised when there is a click action on a region.
				 */
				click: {
					parameters: {

						/**
						 * The region code.
						 */
						code: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a region.
				 */
				contextMenu: {
					parameters: {

						/**
						 * The region code.
						 */
						code: {
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
	// sap.ui.vbm.Region.prototype.init = function(){
	// // do something for initialization...
	// };

	/**
	 * Returns Infos for the Region like name, bounding box and midpoint
	 * 
	 * @returns {object} Region Information Object. Object has the properties BBox: Bounding Box for Region in format "lonMin;latMin;lonMax;latMax",
	 *          Midpoint: Centerpoint for Region in format "lon;lat", Name: Name of the region, and Properties: Array of name-value-pair associated
	 *          with the region
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Region.prototype.getInfo = function() {
		return this.getParent().getRegionsInfo([
			this.getCode()
		])[0];
	};

	return Region;

});
