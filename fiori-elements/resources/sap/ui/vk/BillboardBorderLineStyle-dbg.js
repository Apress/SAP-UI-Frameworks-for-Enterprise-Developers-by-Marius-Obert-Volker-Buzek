/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.BillboardBorderLineStyle.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Billboard border line style for {@link sap.ui.vk.threejs.Billboard}.
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.BillboardBorderLineStyle
	 * @private
	 */
	var BillboardBorderLineStyle = {
		None: "None",
		Solid: "Solid",
		Dash: "Dash",
		Dot: "Dot",
		DashDot: "DashDot",
		DashDotDot: "DashDotDot"
	};

	return BillboardBorderLineStyle;

}, /* bExport= */ true);
