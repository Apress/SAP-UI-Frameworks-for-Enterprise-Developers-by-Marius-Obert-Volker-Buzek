/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.FlexibleControl.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/EnabledPropagator",
	"./FlexibleControlRenderer"
], function(
	vkLibrary,
	Control,
	EnabledPropagator,
	FlexibleControlRenderer
) {
	"use strict";

	/**
	 * Constructor for a new FlexibleControl.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds layout data for the FlexibleControl contents.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.vk.FlexibleControl
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var FlexibleControl = Control.extend("sap.ui.vk.FlexibleControl", /** @lends sap.ui.vk.FlexibleControl.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * CSS width of the vertical layout.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },
				height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

				layout: { type: "string", group: "Behavior", defaultValue: "Stacked" },
				/**
				 * If not enabled all controls inside are not enabled automatically.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true }
			},
			defaultAggregation: "content",
			aggregations: {
				/**
				 * Child Controls within the layout.
				 */
				content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
			},
			designTime: true
		}
	});


	EnabledPropagator.call(FlexibleControl.prototype);

	return FlexibleControl;

});
