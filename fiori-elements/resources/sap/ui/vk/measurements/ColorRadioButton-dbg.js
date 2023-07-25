/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.measurements.ColorRadioButton.
sap.ui.define([
	"sap/m/RadioButton"
], function(
	RadioButton
) {
	"use strict";

	var ColorRadioButton = RadioButton.extend("sap.ui.vk.measurements.ColorRadioButton", /** @lends sap.ui.vk.measurements.ColorRadioButton.prototype */ {
		metadata: {
			library: "sap.ui.vk",

			properties: {
				color: "sap.ui.core.CSSColor"
			}
		},

		renderer: {
			apiVersion: 2,

			render: function(rm, control) {
				rm.openStart("div", control)
					.class("sapUiVizKitMeasurementColorRb")
					.attr("tabindex", control.hasOwnProperty("_iTabIndex") ? control._iTabIndex : 0);

				if (control.getSelected()) {
					rm.class("sapUiVizKitMeasurementColorRbSel");
				}
				rm.openEnd();

				rm.openStart("div")
					.style("background-color", control.getColor())
					.openEnd()
					.close("div");

				rm.close("div");
			}
		}
	});

	return ColorRadioButton;
});
