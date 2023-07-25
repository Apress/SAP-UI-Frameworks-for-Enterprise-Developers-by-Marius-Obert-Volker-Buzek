/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([], function () {
	"use strict";

	return {
		tool: {
			start: function(oSmartLabel) {
				// Ensure the control is properly linked with it's SmartField
				oSmartLabel.getLabelInfo();
			},
			stop: function () {
				// We do nothing
			}
		}
	};
});
