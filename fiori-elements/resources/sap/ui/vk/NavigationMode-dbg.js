/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.NavigationMode.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Navigation mode
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.NavigationMode
	 * @public
	 */
	var NavigationMode = {
		/**
		 * Navigation mode stays the same.
		 * @public
		 */
		NoChange: "NoChange",
		/**
		 * The turntable navigation mode.
		 * @public
		 */
		Turntable: "Turntable",
		/**
		 * The orbit navigation mode.
		 * @public
		 */
		Orbit: "Orbit",
		/**
		 * The pan navigation mode.
		 * @public
		 */
		Pan: "Pan",
		/**
		* The zoom navigation mode.
		* @public
		*/
		Zoom: "Zoom"
	};

	return NavigationMode;
}, /* bExport= */ true);
