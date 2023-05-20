/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides type sap.ui.vk.tools.HitTestIdMode.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Sets the expected schema for the extraction of ids for hit nodes .
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vk.tools.HitTestIdMode
	 * @public
	 */
	var HitTestIdMode = {
		/**
		 * ThreeJS Id mode. HitTest result returns a threejs Id for the object
		 * @public
		 */
		ThreeJS: "ThreeJS",
		/**
		 * HitTest result and event extracts an id for hit nodes based on VE Cloud Service Data Model
		 * @public
		 */
		VEsID: "VEsID",
		/**
		 * HitTest will call an application supplied method to extract Id
		 * @public
		 */
		Callback: "Callback"
	};

	return HitTestIdMode;

}, /* bExport= */ true);
