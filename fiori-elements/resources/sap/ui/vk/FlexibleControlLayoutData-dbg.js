/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.FlexibleControlLayoutData.
sap.ui.define([
	"sap/ui/core/LayoutData"
], function(
	LayoutData
) {
	"use strict";


	/**
	 * Constructor for a new FlexibleControlLayoutData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds layout data for the FlexibleControl contents.
	 * Allowed size values are numeric values ending in "px" and "%" and the
	 * special case "auto".
	 * (The CSS value "auto" is used internally to recalculate the size of the content
	 * dynamically and is not directly set as style property.)
	 * @extends sap.ui.core.LayoutData
	 * @version 1.113.0
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * API is not yet finished and might change completely
	 * @alias sap.ui.vk.FlexibleControlLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var FlexibleControlLayoutData = LayoutData.extend("sap.ui.vk.FlexibleControlLayoutData", /** @lends sap.ui.vk.FlexibleControlLayoutData.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Sets the size of the content.
				 */
				size: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "auto" },

				/**
				 * Sets the minimum size of the content in px.
				 */
				minSize: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "0px" },

				/**
				 * Sets the margin-bottom of the content in px.
				 */
				marginTop: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "0px" },
				marginBottom: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "0px" }
			}
		}
	});

	return FlexibleControlLayoutData;

});
