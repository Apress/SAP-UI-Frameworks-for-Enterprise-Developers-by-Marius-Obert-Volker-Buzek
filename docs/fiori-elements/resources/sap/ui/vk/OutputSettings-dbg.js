/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.OutputSettings.
sap.ui.define([
	"sap/ui/core/Element",
	"./getResourceBundle"
], function(
	Element,
	getResourceBundle
) {
	"use strict";

	/**
	 * Constructor for a new OutputSettings.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Aggregation element for the output settings of the Viewport
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.OutputSettings
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.92.0
	 * @experimental
	 */
	var OverlayArea = Element.extend("sap.ui.vk.OutputSettings", /** @lends sap.ui.vk.OverlayArea.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * width of the output, unit in mm
				 */
				width: {
					type: "float"
				},

				/**
				 * height of the output, unit in mm
				 */
				height: {
					type: "float"
				},

				/**
				 * density of the output, unit in dpi (dots-per-inch)
				 */
				dpi: {
					type: "float"
				}
			}
		}
	});

	return OverlayArea;
});
