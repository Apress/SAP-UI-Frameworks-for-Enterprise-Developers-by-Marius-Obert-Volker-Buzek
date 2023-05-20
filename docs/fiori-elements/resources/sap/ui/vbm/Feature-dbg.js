/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Feature.
sap.ui.define([
	"sap/ui/core/Element",
	"./library"
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new Feature.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Feature element can be added to the <i>items</i> aggregation of a <i>FeatureCollection</i>. By matching the id it allows to
	 *        redefine the color of a GeoJSON feature and adds interactivity.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Feature
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Feature = Element.extend("sap.ui.vbm.Feature", /** @lends sap.ui.vbm.Feature.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The color, this should be provided in the rgba(r,g,b,a) format.
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: null
				},

				/**
				 * The Feature ID. Used to match with the feature in the GeoJSON given to the parent (FeatureCollection).
				 */
				featureId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}

			},
			events: {

				/**
				 * The event is raised when there is a click action on a Feature.
				 */
				click: {},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a Feature.
				 */
				contextMenu: {
					parameters: {

						/**
						 * Menu object to be used with openContextMenu().
						 */
						menu: {
							type: "sap.ui.unified.Menu"
						}
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Feature.prototype.init = function(){
	// // do something for initialization...
	// };

	/**
	 * Open a Detail Window for the Feature at click position
	 * 
	 * @param {string} sCaption caption of detail window
	 * @param {string} sOffsetX position offset in x-direction from the anchor point
	 * @param {string} sOffsetY position offset in y-direction from the anchor point
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Feature.prototype.openDetailWindow = function(sCaption, sOffsetX, sOffsetY) {
		this.oParent.openDetailWindow(this, {
			caption: sCaption,
			offsetX: sOffsetX,
			offsetY: sOffsetY
		});
	};

	/**
	 * Open the context menu
	 * 
	 * @param {object} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Feature.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu(this, oMenu);
	};

	Feature.prototype.handleChangedData = function(oElement) {
		// default impl is empty, no changes supported so far
		// However, the Interface for GeoMap aggregated Elements must be fulfilled
	};

	return Feature;

});
