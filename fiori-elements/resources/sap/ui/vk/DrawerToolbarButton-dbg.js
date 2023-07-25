/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Button identifiers for {@link sap.ui.vk.DrawerToolbar}.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.DrawerToolbarButton
	 * @public
	 */
	var DrawerToolbarButton = {
		CrossSection: "VIT-Cross-Section",
		Turntable: "VIT-Turntable",
		Orbit: "VIT-Orbit",
		Pan: "VIT-Pan",
		Zoom: "VIT-Zoom",
		Show: "VIT-Show",
		Hide: "VIT-Hide",
		FitToView: "VIT-Fit-To-View",
		RectangularSelection: "VIT-Rectangular-Selection",
		PredefinedViews: "VIT-Predefined-Views",
		FullScreen: "VIT-Fullscreen",
		Measurements: "VIT-Measurements",
		MeasurementsSeparator: "VIT-Measurements-Separator"
	};

	return DrawerToolbarButton;
});
